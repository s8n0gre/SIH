# asr_backend.py
import torch
import torchaudio.functional as F
import numpy as np
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from transformers import Wav2Vec2Processor, Wav2Vec2ForCTC
from pydub import AudioSegment
from io import BytesIO
import os

# Force NVIDIA GPU usage
os.environ["CUDA_VISIBLE_DEVICES"] = "0"  # Use first NVIDIA GPU only
os.environ["CUDA_LAUNCH_BLOCKING"] = "1"  # Debug GPU issues

# --- Configuration ---
MODEL_PATH = "./ai4bharatindicwav2vec-hindi"

# Verify and force NVIDIA GPU
if torch.cuda.is_available():
    torch.cuda.set_device(0)  # Force first NVIDIA GPU
    DEVICE = "cuda:0"
    print("\n" + "="*50)
    print("🚀 NVIDIA GPU DETECTED AND ACTIVE")
    print("="*50)
    print(f"✅ GPU Name: {torch.cuda.get_device_name(0)}")
    print(f"✅ CUDA Version: {torch.version.cuda}")
    print(f"✅ GPU Memory: {torch.cuda.get_device_properties(0).total_memory / 1024**3:.2f} GB")
    print(f"✅ Device: {DEVICE}")
    print("="*50 + "\n")
else:
    print("\n" + "="*50)
    print("❌ CUDA NOT AVAILABLE!")
    print("="*50)
    print("Install PyTorch with CUDA support:")
    print("pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118")
    print("="*50 + "\n")
    raise RuntimeError("CUDA not available! NVIDIA GPU required.")

# --- Load Model ---
print("Loading ASR model on NVIDIA GPU...")
processor = Wav2Vec2Processor.from_pretrained(MODEL_PATH)
model = Wav2Vec2ForCTC.from_pretrained(MODEL_PATH).to(DEVICE)
model.eval()

# Verify model is on GPU
model_device = next(model.parameters()).device
print("\n" + "="*50)
print("✅ MODEL LOADED SUCCESSFULLY")
print("="*50)
print(f"✅ Model device: {model_device}")
print(f"✅ Model parameters on GPU: {model_device.type == 'cuda'}")
print(f"✅ Ready for inference on {DEVICE}")
print("="*50 + "\n")

# --- FastAPI App ---
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

# --- Preprocess Function ---
def preprocess_audio(audio_array, sr, target_sr=16000):
    if sr != target_sr:
        audio_array = F.resample(torch.tensor(audio_array), sr, target_sr).numpy()
    input_values = processor(audio_array, return_tensors="pt", sampling_rate=target_sr).input_values
    return input_values

# --- Health Endpoint ---
@app.get("/")
async def root():
    return {"status": "healthy"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

# --- API Endpoint ---
@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    # Read uploaded file into bytes
    audio_bytes = await file.read()

    # Use pydub to decode any format (WebM, OGG, MP3, WAV)
    audio_segment = AudioSegment.from_file(BytesIO(audio_bytes))
    
    # Convert to mono float32 numpy array
    audio_array = np.array(audio_segment.get_array_of_samples()).astype(np.float32)
    if audio_segment.channels > 1:
        audio_array = audio_array.reshape((-1, audio_segment.channels))
        audio_array = audio_array.mean(axis=1)  # convert to mono
    
    sr = audio_segment.frame_rate

    # Preprocess for ASR model
    input_values = preprocess_audio(audio_array, sr).to(DEVICE)

    # Inference on NVIDIA GPU
    with torch.no_grad():
        logits = model(input_values).logits.cpu()
    predicted_ids = torch.argmax(logits, dim=-1)
    transcript = processor.batch_decode(predicted_ids)[0]

    # Clear VRAM and RAM
    torch.cuda.empty_cache()
    gc.collect()

    return {"transcript": transcript, "device": str(DEVICE)}