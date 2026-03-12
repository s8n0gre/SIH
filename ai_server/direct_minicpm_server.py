from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
from PIL import Image
import io
import os
import sys
import time

os.environ["CUDA_VISIBLE_DEVICES"] = "0"
os.environ["LLAMA_CUBLAS"] = "1"
os.environ["CUDA_LAUNCH_BLOCKING"] = "0"
os.environ["GGML_CUDA_NO_PINNED"] = "0"
os.environ["LLAMA_METAL"] = "0"

from datetime import datetime
def new_timestamp():
    return datetime.now().strftime("%H:%M:%S.%f")[:-3]

app = Flask(__name__)
CORS(app)

app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024
app.config['JSON_AS_ASCII'] = False

MODEL_PATH = os.path.join(os.path.dirname(__file__), "ggml-model-IQ3_M.gguf")
MMPROJ_PATH = os.path.join(os.path.dirname(__file__), "mmproj-model-f16.gguf")

MODEL_LOADED = False
llm = None

try:
    from llama_cpp import Llama
    from llama_cpp.llama_chat_format import MiniCPMv26ChatHandler

    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model not found: {MODEL_PATH}")
    if not os.path.exists(MMPROJ_PATH):
        raise FileNotFoundError(f"MMProj not found: {MMPROJ_PATH}")

    print("=" * 80)
    print("  🚀 LOADING MiniCPM-V 2.6 — GPU-ONLY MODE")
    print("=" * 80)

    chat_handler = MiniCPMv26ChatHandler(clip_model_path=MMPROJ_PATH, verbose=False)

    llm = Llama(
        model_path=MODEL_PATH,
        chat_handler=chat_handler,
        n_ctx=4096,
        n_batch=512,
        n_gpu_layers=-1,
        main_gpu=0,
        split_mode=1,
        offload_kqv=True,
        use_mmap=True,
        use_mlock=False,
        n_threads=1,
        n_threads_batch=1,
        verbose=False,
        logits_all=False,
        embedding=False,
    )

    print("✅ GPU-ONLY MODE ACTIVE")
    print("=" * 80 + "\n")
    MODEL_LOADED = True

except Exception as e:
    print(f"\n❌ Model initialization failed: {e}", file=sys.stderr)
    MODEL_LOADED = False
    llm = None


def analyze_with_minicpm(image_base64, start_time):
    if not MODEL_LOADED:
        return "Model unavailable"

    try:
        elapsed = (time.time() - start_time) * 1000
        print(f"[{elapsed:7.1f}ms] 🧠 Starting inference...", flush=True)
        sys.stdout.flush()
        
        inference_start = time.time()
        
        response = llm.create_chat_completion(
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Describe this image in 1-2 sentences. Identify any infrastructure issues."},
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_base64}"}}
                    ]
                }
            ],
            max_tokens=150,
            temperature=0.3
        )
        
        inference_elapsed = (time.time() - inference_start) * 1000
        total_elapsed = (time.time() - start_time) * 1000
        
        print(f"[{total_elapsed:7.1f}ms] ✅ Inference complete ({inference_elapsed:.1f}ms)", flush=True)
        sys.stdout.flush()
        
        return response['choices'][0]['message']['content']
    except Exception as e:
        print(f"[{(time.time() - start_time) * 1000:7.1f}ms] ❌ Error: {e}", flush=True)
        return f"Analysis failed: {e}"


def categorize_hazard(description):
    desc = description.lower()
    if any(w in desc for w in ['road', 'street', 'pavement', 'pothole', 'crack']):
        return "Roads & Infrastructure"
    if any(w in desc for w in ['light', 'lamp', 'electrical', 'power', 'wire']):
        return "Electricity"
    if any(w in desc for w in ['water', 'pipe', 'leak', 'drain', 'flood']):
        return "Water Services"
    if any(w in desc for w in ['trash', 'garbage', 'waste', 'litter']):
        return "Waste Management"
    if any(w in desc for w in ['tree', 'park', 'grass', 'bench']):
        return "Parks & Recreation"
    return "Roads & Infrastructure"


@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy",
        "model_loaded": MODEL_LOADED,
        "model_path_exists": os.path.exists(MODEL_PATH)
    })


@app.route('/analyze', methods=['POST'])
def analyze():
    request_start = time.time()
    
    print(f"\n{'='*80}", flush=True)
    print(f"[{0:7.1f}ms] 📥 REQUEST RECEIVED [{new_timestamp()}]", flush=True)
    print(f"{'='*80}\n", flush=True)
    sys.stdout.flush()
    
    try:
        # STEP 1: Validate & Get File
        elapsed = (time.time() - request_start) * 1000
        print(f"[{elapsed:7.1f}ms] 📋 STEP 1/4: Validating request", flush=True)
        
        if 'image' not in request.files:
            print(f"[{(time.time() - request_start) * 1000:7.1f}ms]   ❌ No image in request", flush=True)
            return jsonify({"error": "No image provided"}), 400

        image_file = request.files['image']
        print(f"[{(time.time() - request_start) * 1000:7.1f}ms]   ✅ File: {image_file.filename}", flush=True)
        
        file_data = image_file.read()
        file_size_kb = len(file_data) / 1024
        print(f"[{(time.time() - request_start) * 1000:7.1f}ms]   ✅ Size: {file_size_kb:.1f} KB\n", flush=True)
        sys.stdout.flush()
        
        # STEP 2: Load & Encode Image
        elapsed = (time.time() - request_start) * 1000
        print(f"[{elapsed:7.1f}ms] 📋 STEP 2/4: Loading image", flush=True)
        
        image_file.seek(0)
        image = Image.open(image_file.stream).convert('RGB')
        width, height = image.size
        print(f"[{(time.time() - request_start) * 1000:7.1f}ms]   ✅ Loaded: {width}x{height}", flush=True)
        
        buffer = io.BytesIO()
        image.save(buffer, format="JPEG", quality=85)
        image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        base64_size_kb = len(image_base64) / 1024
        print(f"[{(time.time() - request_start) * 1000:7.1f}ms]   ✅ Encoded: {base64_size_kb:.1f} KB\n", flush=True)
        sys.stdout.flush()
        
        # STEP 3: AI Inference
        elapsed = (time.time() - request_start) * 1000
        print(f"[{elapsed:7.1f}ms] 📋 STEP 3/4: AI Inference", flush=True)
        print(f"{'─'*80}\n", flush=True)
        sys.stdout.flush()
        
        description = analyze_with_minicpm(image_base64, request_start)
        
        print(f"\n{'─'*80}\n", flush=True)
        sys.stdout.flush()
        
        if "Analysis failed" in description:
            print(f"[{(time.time() - request_start) * 1000:7.1f}ms] ❌ Analysis failed", flush=True)
            return jsonify({"error": description}), 500

        # STEP 4: Categorize & Return
        elapsed = (time.time() - request_start) * 1000
        print(f"[{elapsed:7.1f}ms] 📋 STEP 4/4: Finalizing", flush=True)
        
        category = categorize_hazard(description)
        print(f"[{(time.time() - request_start) * 1000:7.1f}ms]   ✅ Category: {category}", flush=True)
        print(f"[{(time.time() - request_start) * 1000:7.1f}ms]   ✅ Result: {description[:80]}...", flush=True)
        
        total_time = (time.time() - request_start) * 1000
        print(f"[{total_time:7.1f}ms] ✅ COMPLETE in {total_time/1000:.2f}s", flush=True)
        print(f"{'='*80}\n", flush=True)
        sys.stdout.flush()

        return jsonify({
            "success": True,
            "analysis": {
                "category": category,
                "department": f"{category} Department",
                "description": f"AI Analysis: {description}",
                "confidence": 0.85,
                "priority": "medium",
                "detected_objects": ["Hazard"]
            }
        })

    except Exception as e:
        import traceback
        elapsed = (time.time() - request_start) * 1000
        print(f"\n[{elapsed:7.1f}ms] 🛑 ERROR:", flush=True)
        print(f"[{elapsed:7.1f}ms] {type(e).__name__}: {str(e)}", flush=True)
        traceback.print_exc()
        print(f"{'='*80}\n", flush=True)
        sys.stdout.flush()
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    print("Server Launch: MiniCPM GPU Deployment")
    print(f"Model Loaded: {MODEL_LOADED}\n")
    app.run(host='0.0.0.0', port=5007, debug=False, threaded=False)
