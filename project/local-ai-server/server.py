from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
from PIL import Image
import io
import base64

app = Flask(__name__)
CORS(app)

# Load local LLaMA model from AI folder
model_path = "../AI"
tokenizer = AutoTokenizer.from_pretrained(model_path)
model = AutoModelForCausalLM.from_pretrained(
    model_path, 
    torch_dtype=torch.float16,
    low_cpu_mem_usage=True,
    load_in_4bit=True,  # Quantization for GTX 1650
    device_map="auto"
)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'online',
        'model': 'LLaVA-Mistral-7B',
        'gpu': torch.cuda.is_available()
    })

@app.route('/analyze', methods=['POST'])
def analyze_text():
    try:
        data = request.json
        title = data.get('title', '')
        description = data.get('description', '')
        
        # Create prompt for municipal issue analysis
        prompt = f"""Analyze this municipal issue report and categorize it:
Title: {title}
Description: {description}

Categories: Roads & Infrastructure, Water Services, Electricity, Waste Management, Parks & Recreation, Public Safety, Other

Provide:
1. Category
2. Confidence (0-1)
3. Detected issues
4. Brief analysis

Response:"""
        
        inputs = tokenizer(prompt, return_tensors="pt", truncation=True, max_length=512)
        
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=150,
                temperature=0.7,
                do_sample=True,
                pad_token_id=tokenizer.eos_token_id
            )
        
        response = tokenizer.decode(outputs[0], skip_special_tokens=True)
        # Extract only the generated part
        response = response[len(prompt):].strip()
        
        return jsonify({
            'description': response,
            'status': 'success'
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

if __name__ == '__main__':
    app.run(host='localhost', port=5000, debug=True)