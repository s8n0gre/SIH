from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import io
from PIL import Image
import torch
from transformers import ViTImageProcessor, ViTForImageClassification
import os

app = Flask(__name__)
CORS(app)

# Load Google ViT model once at startup
model_path = os.path.abspath("../Google Vit")
processor = ViTImageProcessor.from_pretrained(model_path)
model = ViTForImageClassification.from_pretrained(model_path)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'online',
        'model': 'Google ViT',
        'labels': model.config.num_labels
    })

@app.route('/analyze', methods=['POST'])
def analyze_image():
    try:
        data = request.json
        image_data = base64.b64decode(data['image'])
        image = Image.open(io.BytesIO(image_data)).convert('RGB')
        
        # Process image with Google ViT
        inputs = processor(images=image, return_tensors="pt")
        
        with torch.no_grad():
            outputs = model(**inputs)
            predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)
        
        # Get top 5 predictions
        top5_prob, top5_indices = torch.topk(predictions, 5)
        
        # Get class names
        results = []
        for i in range(5):
            class_id = top5_indices[0][i].item()
            confidence = top5_prob[0][i].item()
            class_name = model.config.id2label[class_id]
            results.append({
                'class': class_name,
                'confidence': confidence
            })
        
        # Create description from top prediction
        top_class = results[0]['class']
        top_confidence = results[0]['confidence']
        
        description = f"Google ViT identifies this image as: {top_class} (confidence: {top_confidence:.2%})"
        
        # Map to municipal categories
        category = map_to_municipal_category(top_class)
        
        return jsonify({
            'category': category,
            'confidence': top_confidence,
            'description': description,
            'detected_objects': top_class,
            'top_predictions': results,
            'status': 'success'
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

def map_to_municipal_category(class_name):
    """Map ViT predictions to municipal categories"""
    class_lower = class_name.lower()
    
    if any(word in class_lower for word in ['road', 'street', 'pavement', 'asphalt']):
        return 'Roads & Infrastructure'
    elif any(word in class_lower for word in ['water', 'fountain', 'hydrant']):
        return 'Water & Sewer Services'
    elif any(word in class_lower for word in ['tree', 'plant', 'flower', 'grass']):
        return 'Parks & Recreation'
    elif any(word in class_lower for word in ['light', 'lamp', 'pole']):
        return 'Electricity & Lighting'
    elif any(word in class_lower for word in ['trash', 'garbage', 'waste']):
        return 'Waste Management'
    elif any(word in class_lower for word in ['building', 'house', 'structure']):
        return 'Building & Housing'
    elif any(word in class_lower for word in ['car', 'vehicle', 'traffic']):
        return 'Transportation'
    else:
        return 'Other'

if __name__ == '__main__':
    print("Starting Google ViT Server on port 5003")
    print(f"Model loaded with {model.config.num_labels} classes")
    app.run(host='localhost', port=5003, debug=True)