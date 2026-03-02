from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import AutoImageProcessor, AutoModelForImageClassification, CLIPProcessor, CLIPModel
import torch
from PIL import Image
import io
import base64

app = Flask(__name__)
CORS(app)

# Load CLIP model for municipal issue classification
clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

# Municipal categories for CLIP
categories = [
    "pothole on road",
    "water leak or flooding", 
    "broken streetlight",
    "litter and garbage",
    "damaged park equipment",
    "safety hazard",
    "normal infrastructure"
]

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'online',
        'model': 'CLIP-ViT-Base',
        'gpu': torch.cuda.is_available()
    })

@app.route('/classify', methods=['POST'])
def classify_image():
    try:
        data = request.json
        image_data = base64.b64decode(data['image'])
        image = Image.open(io.BytesIO(image_data))
        
        # Process with CLIP
        inputs = clip_processor(
            text=categories, 
            images=image, 
            return_tensors="pt", 
            padding=True
        )
        
        with torch.no_grad():
            outputs = clip_model(**inputs)
            logits_per_image = outputs.logits_per_image
            probs = logits_per_image.softmax(dim=1)
        
        # Get best prediction
        best_idx = probs.argmax().item()
        confidence = probs[0][best_idx].item()
        predicted_category = categories[best_idx]
        
        # Map to your categories
        category_map = {
            "pothole on road": {"category": "Roads & Infrastructure", "issue": "Pothole"},
            "water leak or flooding": {"category": "Water Services", "issue": "Water Leak"},
            "broken streetlight": {"category": "Electricity", "issue": "Broken Streetlight"},
            "litter and garbage": {"category": "Waste Management", "issue": "Litter"},
            "damaged park equipment": {"category": "Parks & Recreation", "issue": "Park Damage"},
            "safety hazard": {"category": "Public Safety", "issue": "Safety Issue"},
            "normal infrastructure": {"category": "Other", "issue": ""}
        }
        
        result = category_map.get(predicted_category, {"category": "Other", "issue": ""})
        
        return jsonify({
            'category': result['category'],
            'confidence': confidence,
            'detected_issues': [result['issue']] if result['issue'] else [],
            'description': f"Detected: {predicted_category} (confidence: {confidence:.2f})",
            'status': 'success'
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

if __name__ == '__main__':
    app.run(host='localhost', port=5001, debug=True)