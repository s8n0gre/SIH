import os
import sys
import json
import base64
from io import BytesIO
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import torch
from transformers import ViTImageProcessor, ViTForImageClassification
import numpy as np

app = Flask(__name__)
CORS(app)

# Global variables
model = None
processor = None
model_loaded = False

# Path to your Google ViT model files
MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'Google Vit')

def load_google_vit_model():
    """Load your local Google ViT model files"""
    global model, processor, model_loaded
    
    try:
        print(f"Loading Google ViT model from: {MODEL_PATH}")
        
        # Load processor and model from your local files
        processor = ViTImageProcessor.from_pretrained(MODEL_PATH)
        model = ViTForImageClassification.from_pretrained(MODEL_PATH)
        model.eval()
        
        model_loaded = True
        print("✅ Your Google ViT model loaded successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error loading your Google ViT model: {str(e)}")
        model_loaded = False
        return False

def analyze_with_your_vit(image):
    """Analyze image using your Google ViT model"""
    if not model_loaded:
        return {"error": "Your Google ViT model not loaded"}
    
    try:
        # Process image with your model
        inputs = processor(images=image, return_tensors="pt")
        
        with torch.no_grad():
            outputs = model(**inputs)
            predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)
            predicted_class_idx = predictions.argmax().item()
            confidence = predictions[0][predicted_class_idx].item()
        
        # Get prediction from your model's labels
        predicted_label = model.config.id2label[predicted_class_idx]
        
        # Map to municipal categories
        category, department, priority = map_vit_to_municipal(predicted_label, confidence)
        
        # Generate description
        description = generate_municipal_description(predicted_label, category, confidence)
        
        return {
            "category": category,
            "department": department,
            "priority": priority,
            "confidence": confidence,
            "detected_objects": [predicted_label],
            "description": description,
            "model_used": "Your Local Google ViT Model",
            "detection_method": "Enhanced_Object_Classification"
        }
        
    except Exception as e:
        print(f"Error with your Google ViT model: {str(e)}")
        return {"error": f"Your model analysis failed: {str(e)}"}

def map_vit_to_municipal(predicted_label, confidence):
    """Map your ViT model predictions to municipal categories with enhanced accuracy"""
    label_lower = predicted_label.lower()
    
    # Enhanced department mapping with ImageNet object classes
    department_mapping = {
        'Roads & Infrastructure': {
            'objects': ['street sign', 'traffic light', 'car', 'truck', 'bus', 'motorcycle', 'bicycle', 'road', 'highway', 'bridge', 'crosswalk', 'manhole'],
            'keywords': ['road', 'street', 'pavement', 'asphalt', 'concrete', 'sidewalk', 'path', 'intersection', 'highway', 'bridge'],
            'department': 'Roads Department'
        },
        'Electricity': {
            'objects': ['street lamp', 'traffic light', 'power line', 'utility pole', 'electrical box', 'transformer', 'light bulb', 'flashlight'],
            'keywords': ['light', 'lamp', 'bulb', 'pole', 'electric', 'power', 'wire', 'electrical', 'lighting'],
            'department': 'Electricity Department'
        },
        'Water Services': {
            'objects': ['fire hydrant', 'fountain', 'water tower', 'pipe', 'faucet', 'shower', 'bathtub', 'sink'],
            'keywords': ['water', 'pipe', 'drain', 'hydrant', 'valve', 'fountain', 'leak', 'sewer'],
            'department': 'Water Department'
        },
        'Waste Management': {
            'objects': ['trash can', 'garbage truck', 'recycling bin', 'dumpster', 'waste container'],
            'keywords': ['trash', 'garbage', 'bin', 'waste', 'container', 'dump', 'litter', 'recycling'],
            'department': 'Sanitation Department'
        },
        'Parks & Recreation': {
            'objects': ['tree', 'grass', 'flower', 'plant', 'bench', 'swing', 'slide', 'playground', 'park', 'garden', 'lawn mower'],
            'keywords': ['tree', 'grass', 'plant', 'flower', 'bench', 'playground', 'park', 'garden', 'landscaping'],
            'department': 'Parks Department'
        },
        'Public Safety': {
            'objects': ['stop sign', 'yield sign', 'warning sign', 'barrier', 'cone', 'fence', 'gate', 'security camera'],
            'keywords': ['broken', 'damaged', 'danger', 'hazard', 'unsafe', 'emergency', 'security', 'barrier'],
            'department': 'Public Safety Department'
        }
    }
    
    # Score each department
    best_score = 0
    best_category = 'Roads & Infrastructure'
    best_department = 'Roads Department'
    
    for category, mapping in department_mapping.items():
        score = 0
        
        # Check direct object matches (higher weight)
        for obj in mapping['objects']:
            if obj.lower() in label_lower:
                score += 3
        
        # Check keyword matches
        for keyword in mapping['keywords']:
            if keyword in label_lower:
                score += 1
        
        if score > best_score:
            best_score = score
            best_category = category
            best_department = mapping['department']
    
    # Determine priority based on confidence and category
    if best_category in ['Public Safety', 'Water Services'] and confidence > 0.7:
        priority = 'high'
    elif confidence > 0.8:
        priority = 'high'
    elif confidence > 0.6:
        priority = 'medium'
    else:
        priority = 'low'
    
    return best_category, best_department, priority

def generate_municipal_description(predicted_label, category, confidence):
    """Generate municipal issue description using your ViT model results"""
    base_desc = f"Your Google ViT model analyzed the image and identified: {predicted_label}. "
    
    if category == 'Roads & Infrastructure':
        base_desc += f"This appears to be a road infrastructure issue requiring Roads Department attention. "
    elif category == 'Electricity':
        base_desc += f"This appears to be an electrical infrastructure issue requiring Electricity Department attention. "
    elif category == 'Water Services':
        base_desc += f"This appears to be a water services issue requiring Water Department attention. "
    elif category == 'Waste Management':
        base_desc += f"This appears to be a waste management issue requiring Sanitation Department attention. "
    elif category == 'Parks & Recreation':
        base_desc += f"This appears to be a parks and recreation issue requiring Parks Department attention. "
    else:
        base_desc += f"This appears to be a public safety issue requiring immediate attention. "
    
    base_desc += f"Model confidence: {confidence:.1%}. Your local Google ViT model has successfully categorized this municipal issue for proper department routing."
    
    return base_desc

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "model_loaded": model_loaded,
        "model_path": MODEL_PATH,
        "model_type": "Your Local Google ViT Model"
    })

@app.route('/analyze', methods=['POST'])
def analyze_image():
    """Analyze image using your Google ViT model"""
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image provided"}), 400
        
        image_file = request.files['image']
        if image_file.filename == '':
            return jsonify({"error": "No image selected"}), 400
        
        # Load image
        image = Image.open(image_file.stream).convert('RGB')
        
        # Analyze with your Google ViT model
        result = analyze_with_your_vit(image)
        
        if "error" in result:
            return jsonify(result), 500
        
        return jsonify({
            "success": True,
            "analysis": result
        })
        
    except Exception as e:
        print(f"Error in analyze endpoint: {str(e)}")
        return jsonify({"error": f"Analysis failed: {str(e)}"}), 500

if __name__ == '__main__':
    print("🚀 Starting Your Local Google ViT Municipal Issue Detection Server...")
    print(f"📁 Loading model from: {MODEL_PATH}")
    
    # Load your Google ViT model
    if load_google_vit_model():
        print("🌐 Your Google ViT server starting on http://localhost:5006")
        app.run(host='0.0.0.0', port=5006, debug=False)
    else:
        print("❌ Failed to load your Google ViT model. Check model files.")
        sys.exit(1)