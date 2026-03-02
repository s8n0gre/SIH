from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
from PIL import Image
import io
import os

# Enforce exclusive GPU usage
os.environ["CUDA_VISIBLE_DEVICES"] = "0"   # Use only GPU 0
os.environ["LLAMA_CUBLAS"] = "1"          # Force CUDA kernels, disable CPU GEMM

app = Flask(__name__)
CORS(app)

try:
    from llama_cpp import Llama
    from llama_cpp.llama_chat_format import MiniCPMv26ChatHandler

    MODEL_PATH = "ggml-model-IQ3_M.gguf"
    
    if not os.path.exists(MODEL_PATH) or os.path.getsize(MODEL_PATH) < 1000000000:
        print("⚠️ Model file missing or incomplete (should be >1GB)")
        print("Running in fallback mode without AI model")
        raise Exception("Model file invalid")

    chat_handler = MiniCPMv26ChatHandler.from_pretrained(
        repo_id="openbmb/MiniCPM-V-2_6-gguf",
        filename="*mmproj*"
    )

    llm = Llama(
        model_path=MODEL_PATH,
        chat_handler=chat_handler,
        n_ctx=4096,
        n_gpu_layers=-1,
        main_gpu=0,
        use_mmap=False,
        use_mlock=True,
        n_threads=1,
        verbose=False
    )

    print("\n=== GPU MODE ACTIVE ===")
    print("Model is fully loaded on GPU")
    MODEL_LOADED = True

except Exception as e:
    print(f"⚠️ Model initialization error: {e}")
    print("✓ Running in fallback mode - basic categorization only")
    MODEL_LOADED = False
    llm = None


def analyze_with_minicpm(image_base64):
    if not MODEL_LOADED:
        return "Basic infrastructure issue detected. Manual review recommended."

    try:
        response = llm.create_chat_completion(
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Describe the municipal infrastructure issue in 2–3 concise sentences."},
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_base64}"}}
                    ]
                }
            ],
            max_tokens=150,
            temperature=0.3
        )
        return response['choices'][0]['message']['content']
    except Exception as e:
        return "Basic infrastructure issue detected. Manual review recommended."


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
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image provided"}), 400

        image = Image.open(request.files['image'].stream).convert('RGB')
        buffer = io.BytesIO()
        image.save(buffer, format="JPEG")
        image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')

        description = analyze_with_minicpm(image_base64)
        category = categorize_hazard(description)

        return jsonify({
            "success": True,
            "analysis": {
                "category": category,
                "department": f"{category} Department",
                "description": f"AI Analysis: {description}",
                "confidence": 0.8,
                "priority": "medium",
                "detected_objects": ["Infrastructure"]
            }
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/analyze_base64', methods=['POST'])
def analyze_base64():
    try:
        data = request.get_json()
        if not data or 'image' not in data:
            return jsonify({"success": False, "error": "No base64 image data provided"}), 400

        description = analyze_with_minicpm(data['image'])
        category = categorize_hazard(description)

        return jsonify({
            "success": True,
            "analysis": {
                "category": category,
                "department": f"{category} Department",
                "description": f"AI Analysis: {description}",
                "confidence": 0.8,
                "priority": "medium",
                "detected_objects": ["Infrastructure"]
            }
        })

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


if __name__ == '__main__':
    print("Server Launch: MiniCPM GPU Deployment")
    print(f"Model Loaded: {MODEL_LOADED}")
    app.run(host='0.0.0.0', port=5007, debug=True)
