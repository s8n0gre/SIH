from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import ViTImageProcessor, ViTForImageClassification
import torch
from PIL import Image
import io
import base64
import os

app = Flask(__name__)
CORS(app)

print("Loading Google ViT model...")
try:
    # Load local ViT model
    vit_model_path = os.path.abspath("../Google Vit")
    print(f"Model path: {vit_model_path}")
    
    vit_processor = ViTImageProcessor.from_pretrained(vit_model_path)
    vit_model = ViTForImageClassification.from_pretrained(vit_model_path)
    print("✓ Google ViT model loaded successfully")
except Exception as e:
    print(f"✗ Error loading ViT model: {e}")
    # Fallback to online model
    vit_processor = ViTImageProcessor.from_pretrained('google/vit-base-patch16-224')
    vit_model = ViTForImageClassification.from_pretrained('google/vit-base-patch16-224')
    print("✓ Using online ViT model as fallback")

@app.route('/health', methods=['GET'])
def health_check():
    model_info = "Local Google ViT" if os.path.exists("../Google Vit") else "Online ViT"
    return jsonify({
        'status': 'online',
        'model': model_info,
        'gpu': torch.cuda.is_available(),
        'model_path': os.path.abspath("../Google Vit") if os.path.exists("../Google Vit") else "online"
    })

@app.route('/analyze', methods=['POST'])
def analyze_image():
    try:
        data = request.json
        image_data = base64.b64decode(data['image'])
        image = Image.open(io.BytesIO(image_data))
        
        # Generate detailed description based on classification and analysis
        primary_class = class_names[0].replace('_', ' ').replace(',', ' -') if class_names else "unknown object"
        confidence_text = f"{confidences[0]:.1%} confidence" if confidences else "50.0% confidence"
        
        if category != 'Other':
            issue_text = f" with detected {detected_issues[0].lower()}" if detected_issues else ""
            description = f"AI detected: {primary_class} ({confidence_text}){issue_text}. Municipal category: {category}."
        else:
            description = f"Image shows: {primary_class} ({confidence_text}). Unable to determine specific municipal issue category."
        
        # Get classification with ViT
        vit_inputs = vit_processor(images=image, return_tensors="pt")
        with torch.no_grad():
            vit_outputs = vit_model(**vit_inputs)
            predictions = torch.nn.functional.softmax(vit_outputs.logits, dim=-1)
        
        # Get top predictions
        top_predictions = torch.topk(predictions, 5)
        
        # Map ImageNet classes to municipal categories
        class_names = []
        confidences = []
        for i in range(5):
            idx = top_predictions.indices[0][i].item()
            conf = top_predictions.values[0][i].item()
            class_name = vit_model.config.id2label.get(str(idx), f"class_{idx}")
            class_names.append(class_name)
            confidences.append(conf)
        
        # Ensure we have at least one prediction
        if not class_names:
            class_names = ["unknown"]
            confidences = [0.5]
        
        # Analyze classification for municipal issues
        primary_class_lower = class_names[0].lower() if class_names else "unknown"
        category = "Other"
        detected_issues = []
        confidence = float(confidences[0]) if confidences else 0.5
        
        # Road infrastructure detection
        if any(word in primary_class_lower for word in ['street', 'road', 'highway', 'sidewalk', 'crosswalk']):
            category = "Roads & Infrastructure"
            detected_issues = ["Road Infrastructure Issue"]
            confidence = min(0.9, confidence + 0.1)
        # Traffic and safety
        elif any(word in primary_class_lower for word in ['traffic', 'sign', 'light', 'signal']):
            category = "Public Safety"
            detected_issues = ["Traffic Safety Issue"]
            confidence = min(0.85, confidence + 0.1)
        # Waste and cleanliness
        elif any(word in primary_class_lower for word in ['trash', 'garbage', 'can', 'bin', 'litter']):
            category = "Waste Management"
            detected_issues = ["Waste Issue"]
            confidence = min(0.85, confidence + 0.1)
        # Water related
        elif any(word in primary_class_lower for word in ['water', 'fountain', 'hydrant', 'pipe']):
            category = "Water Services"
            detected_issues = ["Water Infrastructure"]
            confidence = min(0.80, confidence + 0.1)
        # Parks and recreation
        elif any(word in primary_class_lower for word in ['park', 'bench', 'playground', 'tree', 'garden']):
            category = "Parks & Recreation"
            detected_issues = ["Park Infrastructure"]
            confidence = min(0.80, confidence + 0.1)
        
        return jsonify({
            'category': category,
            'confidence': confidence,
            'detected_issues': detected_issues,
            'description': description,
            'image_name': class_names[0],
            'top_classes': class_names[:3],
            'class_confidences': [float(c) for c in confidences[:3]],
            'status': 'success'
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

if __name__ == '__main__':
    print("\n🚀 Starting ViT Server on http://localhost:5002")
    print("📊 Health check: http://localhost:5002/health")
    print("🔍 Analysis endpoint: http://localhost:5002/analyze")
    print("\n" + "="*50)
    app.run(host='localhost', port=5002, debug=True)