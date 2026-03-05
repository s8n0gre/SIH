"""
WSL FastAPI server for NeMo ASR inference.
Stubs out training-only NeMo dependencies since we only need inference.
Uses a sys.meta_path finder to intercept ALL submodule imports
(e.g. lhotse.cut, pyannote.core.segment) under stubbed namespaces.
"""
import sys
import types
import importlib.abc
import importlib.machinery

# ── No-op class returned for any stubbed attribute ──────────────────────────
class _Stub:
    def __init__(self, *a, **kw): pass
    def __call__(self, *a, **kw): return _Stub()
    def __getattr__(self, n): return _Stub()
    def __iter__(self): return iter([])
    def __class_getitem__(cls, item): return cls

class _StubLoader(importlib.abc.Loader):
    def create_module(self, spec): return None
    def exec_module(self, module): pass

def _make_stub_module(name):
    mod = types.ModuleType(name)
    loader = _StubLoader()
    spec = importlib.machinery.ModuleSpec(name, loader=loader, origin="stub")
    spec.submodule_search_locations = []
    mod.__spec__ = spec
    mod.__loader__ = loader
    mod.__path__ = [name]
    mod.__file__ = None
    mod.__getattr__ = lambda attr: _Stub()
    return mod

# ── Stub prefixes — any import starting with one of these is intercepted ────
STUB_PREFIXES = (
    "datasets",
    "wandb",
    "lhotse",
    "kaldi_python_io",
    "kaldiio",
    "pyannote",
    "ipywidgets",
    "g2p_en",
    "texterrors",
    "webdataset",
)

class _StubFinder(importlib.abc.MetaPathFinder):
    def find_spec(self, fullname, path, target=None):
        if any(fullname == p or fullname.startswith(p + ".") for p in STUB_PREFIXES):
            if fullname not in sys.modules:
                sys.modules[fullname] = _make_stub_module(fullname)
            mod = sys.modules[fullname]
            return mod.__spec__
        return None

# Register FIRST so it wins before real finders
sys.meta_path.insert(0, _StubFinder())

# Also pre-populate top-level stubs immediately
for _p in STUB_PREFIXES:
    if _p not in sys.modules:
        sys.modules[_p] = _make_stub_module(_p)

# ── Now it is safe to import NeMo ───────────────────────────────────────────
import nemo.collections.asr as nemo_asr  # noqa: E402

from fastapi import FastAPI, UploadFile, File
import shutil
import os
try:
    from translate import Translator
    translator = Translator(to_lang="en")
except ImportError:
    translator = None

MODEL_PATH = "/mnt/d/College/Translator/indicconformer_stt_multi_hybrid_rnnt_600m.nemo"

import tarfile, tempfile, shutil, yaml as _yaml
from omegaconf import OmegaConf

def _load_model_with_patched_config(model_path):
    """
    NeMo 1.23.0 expects tokenizer type 'agg' for aggregate/multilingual tokenizers.
    This model's config uses 'multilingual'. We extract the config, patch the type,
    and reload using restore_from with the corrected config.
    """
    # Step 1: Extract model_config.yaml from the .nemo archive
    tmp_dir = tempfile.mkdtemp(prefix="nemo_patch_")
    try:
        with tarfile.open(model_path, 'r') as tar:
            cfg_member = next(m for m in tar.getmembers() if m.name.endswith('model_config.yaml'))
            tar.extract(cfg_member, path=tmp_dir)
            cfg_path = os.path.join(tmp_dir, cfg_member.name)

        # Step 2: Patch config to fix version mismatches using ruamel.yaml
        from ruamel.yaml import YAML
        ryaml = YAML()
        ryaml.preserve_quotes = True
        with open(cfg_path, 'r', encoding='utf-8') as f:
            cfg_data = ryaml.load(f)

        # 2a. Fix tokenizer type: 'multilingual' → 'agg' (what NeMo 1.23.0 expects)
        if 'tokenizer' in cfg_data and cfg_data['tokenizer'].get('type') == 'multilingual':
            cfg_data['tokenizer']['type'] = 'agg'

        # 2b & 2c. Recursively strip all keys unsupported by NeMo 1.23.0 modules
        STRIP_KEYS = {'multisoftmax', 'multilingual', 'language_keys', 'fuse_loss_wer', 'fused_batch_size'}

        def _strip_keys(obj):
            if isinstance(obj, dict):
                keys_to_delete = [k for k in obj if k in STRIP_KEYS]
                for k in keys_to_delete:
                    del obj[k]
                for v in obj.values():
                    _strip_keys(v)
            elif isinstance(obj, list):
                for item in obj:
                    _strip_keys(item)

        _strip_keys(cfg_data)

        patched_cfg_path = os.path.join(tmp_dir, 'patched_model_config.yaml')
        with open(patched_cfg_path, 'w', encoding='utf-8') as f:
            ryaml.dump(cfg_data, f)

        # Step 3: Load model with patched config and strict=False to handle
        # per-language weight keys (joint.joint_net.2.hi.weight etc.) that don't
        # exist in NeMo 1.23.0's single-head RNNTJoint architecture.
        model = nemo_asr.models.EncDecHybridRNNTCTCBPEModel.restore_from(
            restore_path=model_path,
            override_config_path=patched_cfg_path,
            map_location="cpu",
            strict=False,
        )
        return model
    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)

print(f"Loading NeMo model from {MODEL_PATH}...")
try:
    asr_model = _load_model_with_patched_config(MODEL_PATH)
    asr_model.eval()
    print("Model loaded successfully.")
except Exception as e:
    import traceback
    traceback.print_exc()
    print(f"Failed to load model: {e}")
    asr_model = None


@app.post("/transcribe")
async def transcribe(audio: UploadFile = File(None), file: UploadFile = File(None)):
    audio_file = audio or file
    if not audio_file:
        return {"error": "No audio file provided."}
    
    if not asr_model:
        return {"error": "Model not loaded on the server."}

    temp_path = f"/tmp/{audio_file.filename}"
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(audio_file.file, buffer)

        result = asr_model.transcribe([temp_path])

        # Hybrid RNNT/CTC returns a tuple (rnnt_texts, ctc_texts)
        if isinstance(result, tuple):
            transcripts = result[0]
        else:
            transcripts = result

        transcript_text = transcripts[0] if isinstance(transcripts, list) else str(transcripts)
        
        translation = ""
        if translator and transcript_text:
            try:
                # Simple translation (for longer texts, chunking might be needed as in app.py)
                if len(transcript_text) > 490:
                    words, chunks, current = transcript_text.split(), [], ""
                    for word in words:
                        if len(current) + len(word) + 1 > 490:
                            chunks.append(current.strip())
                            current = word
                        else:
                            current += (" " + word if current else word)
                    if current:
                        chunks.append(current.strip())
                    translation = " ".join(translator.translate(chunk) for chunk in chunks)
                else:
                    translation = translator.translate(transcript_text)
            except Exception as e:
                translation = f"[Translation Error: {e}]"
        
        return {
            "transcript": transcript_text,
            "translation": translation
        }
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
