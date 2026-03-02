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
import cv2

app = Flask(__name__)
CORS(app)

# Global variables for model
model = None
processor = None
model_loaded = False

# Path to your Google ViT model
MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'Google Vit')

# Department mapping with specific categories
DEPARTMENT_MAPPING = {
    'Roads & Infrastructure': {
        'department': 'Roads Department',
        'keywords': ['pothole', 'crack', 'damaged road', 'street repair', 'asphalt', 'pavement'],
        'priority_rules': {'pothole': 'high', 'crack': 'medium', 'damage': 'high'}
    },
    'Electricity': {
        'department': 'Electricity Department', 
        'keywords': ['broken light', 'street lamp', 'lighting issue', 'power', 'electrical'],
        'priority_rules': {'broken': 'high', 'outage': 'critical', 'flickering': 'medium'}
    },
    'Water Services': {
        'department': 'Water Department',
        'keywords': ['leak', 'pipe', 'water damage', 'flooding', 'drain', 'sewer'],
        'priority_rules': {'leak': 'high', 'flooding': 'critical', 'blockage': 'medium'}
    },
    'Waste Management': {
        'department': 'Sanitation Department',
        'keywords': ['garbage', 'trash', 'litter', 'dump', 'bin', 'collection'],
        'priority_rules': {'overflow': 'high', 'missed': 'medium', 'broken': 'medium'}
    },
    'Parks & Recreation': {
        'department': 'Parks Department',
        'keywords': ['playground', 'garden', 'green space', 'tree', 'bench', 'equipment'],
        'priority_rules': {'broken': 'high', 'maintenance': 'medium', 'landscaping': 'low'}
    },
    'Public Safety': {
        'department': 'Public Safety Department',
        'keywords': ['danger', 'hazard', 'unsafe condition', 'security', 'emergency'],
        'priority_rules': {'danger': 'critical', 'hazard': 'high', 'security': 'high'}
    }
}

def load_model():
    """Load the Google ViT model"""
    global model, processor, model_loaded
    
    try:
        print(f"Loading Google ViT model from: {MODEL_PATH}")
        
        # Load the processor and model
        processor = ViTImageProcessor.from_pretrained(MODEL_PATH)
        model = ViTForImageClassification.from_pretrained(MODEL_PATH)
        
        # Set to evaluation mode
        model.eval()
        model_loaded = True
        
        print("✅ Google ViT model loaded successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error loading Google ViT model: {str(e)}")
        print("Falling back to Hugging Face ViT model...")
        
        try:
            # Fallback to pre-trained ViT model
            processor = ViTImageProcessor.from_pretrained('google/vit-base-patch16-224')
            model = ViTForImageClassification.from_pretrained('google/vit-base-patch16-224')
            model.eval()
            model_loaded = True
            print("✅ Fallback ViT model loaded successfully!")
            return True
        except Exception as fallback_error:
            print(f"❌ Error loading fallback model: {str(fallback_error)}")
            model_loaded = False
            return False

def analyze_with_opencv(image):
    """Analyze image using OpenCV for detailed inspection"""
    results = {
        'detected_features': [],
        'color_analysis': {},
        'texture_analysis': {},
        'shape_analysis': []
    }
    
    try:
        # Convert to grayscale for analysis
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Edge detection for cracks, potholes
        edges = cv2.Canny(gray, 50, 150)
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Analyze contours for municipal issues
        for contour in contours:
            area = cv2.contourArea(contour)
            if area > 500:  # Filter small noise
                # Analyze shape
                approx = cv2.approxPolyDP(contour, 0.02 * cv2.arcLength(contour, True), True)
                if len(approx) > 8:  # Circular/irregular shapes (potholes)
                    results['detected_features'].append('Pothole-like circular damage')
                elif len(approx) == 4:  # Rectangular shapes (signs, panels)
                    results['detected_features'].append('Rectangular structure')
                else:
                    results['detected_features'].append('Irregular damage pattern')
        
        # Color analysis for different materials
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
        
        # Detect asphalt (dark colors)
        dark_mask = cv2.inRange(hsv, (0, 0, 0), (180, 255, 80))
        dark_ratio = np.sum(dark_mask > 0) / (image.shape[0] * image.shape[1])
        
        # Detect concrete (light gray)
        concrete_mask = cv2.inRange(hsv, (0, 0, 80), (180, 30, 200))
        concrete_ratio = np.sum(concrete_mask > 0) / (image.shape[0] * image.shape[1])
        
        # Detect vegetation (green)
        green_mask = cv2.inRange(hsv, (40, 40, 40), (80, 255, 255))
        green_ratio = np.sum(green_mask > 0) / (image.shape[0] * image.shape[1])
        
        results['color_analysis'] = {
            'asphalt_ratio': dark_ratio,
            'concrete_ratio': concrete_ratio,
            'vegetation_ratio': green_ratio
        }
        
        # Texture analysis using Gabor filters
        kernel = cv2.getGaborKernel((21, 21), 8, np.pi/4, 2*np.pi, 0.5, 0, ktype=cv2.CV_32F)
        filtered = cv2.filter2D(gray, cv2.CV_8UC3, kernel)
        texture_variance = np.var(filtered)
        results['texture_analysis']['roughness'] = float(texture_variance)
        
        return results
        
    except Exception as e:
        print(f"OpenCV analysis error: {str(e)}")
        return results

def combine_analyses(opencv_results, vit_label, vit_confidence):
    """Combine OpenCV and ViT analyses for comprehensive description"""
    detected_objects = []
    description_parts = []
    
    # Analyze OpenCV results
    if opencv_results['detected_features']:
        detected_objects.extend(opencv_results['detected_features'])
    
    # Surface type detection
    color_analysis = opencv_results['color_analysis']
    if color_analysis.get('asphalt_ratio', 0) > 0.3:
        detected_objects.append('Asphalt road surface')
        description_parts.append('asphalt road surface')
    elif color_analysis.get('concrete_ratio', 0) > 0.3:
        detected_objects.append('Concrete surface')
        description_parts.append('concrete surface')
    
    if color_analysis.get('vegetation_ratio', 0) > 0.2:
        detected_objects.append('Vegetation/landscaping')
        description_parts.append('vegetation or landscaping elements')
    
    # Texture analysis
    texture = opencv_results['texture_analysis']
    if texture.get('roughness', 0) > 1000:
        detected_objects.append('Rough/damaged surface')
        description_parts.append('rough or damaged surface texture')
    
    # Add ViT prediction to detected objects
    detected_objects.append(vit_label)
    
    # Determine department and priority using enhanced routing
    routing_info = determine_department_and_priority(detected_objects, vit_label, opencv_results)
    
    # Generate comprehensive description with department routing
    base_description = f"Combined AI analysis using Google ViT and OpenCV computer vision detected "
    
    if description_parts:
        base_description += f"{', '.join(description_parts)} with "
    
    base_description += f"municipal infrastructure issue requiring {routing_info['department']} attention. "
    
    if routing_info['matched_keywords']:
        base_description += f"Key indicators: {', '.join(routing_info['matched_keywords'])}. "
    
    base_description += f"Priority level: {routing_info['priority'].upper()}. "
    base_description += f"Analysis confidence: {vit_confidence:.1%}, routing confidence: {routing_info['routing_confidence']:.1%}. "
    base_description += f"This issue will be automatically routed to {routing_info['department']} for appropriate action."
    
    return {
        "category": routing_info['category'],
        "department": routing_info['department'],
        "priority": routing_info['priority'],
        "confidence": vit_confidence,
        "routing_confidence": routing_info['routing_confidence'],
        "detected_objects": list(set(detected_objects)),
        "description": base_description,
        "raw_prediction": vit_label,
        "matched_keywords": routing_info['matched_keywords'],
        "opencv_analysis": opencv_results
    }

def analyze_image_content(image):
    """Analyze image using both Google ViT and OpenCV"""
    if not model_loaded:
        return {"error": "Model not loaded"}
    
    try:
        # Convert PIL to OpenCV format
        opencv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        # OpenCV Analysis
        opencv_results = analyze_with_opencv(opencv_image)
        
        # Google ViT Analysis
        inputs = processor(images=image, return_tensors="pt")
        with torch.no_grad():
            outputs = model(**inputs)
            predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)
            predicted_class_idx = predictions.argmax().item()
            vit_confidence = predictions[0][predicted_class_idx].item()
        
        vit_label = model.config.id2label[predicted_class_idx]
        
        # Combine analyses
        combined_analysis = combine_analyses(opencv_results, vit_label, vit_confidence)
        
        return combined_analysis
        
    except Exception as e:
        print(f"Error analyzing image: {str(e)}")
        return {"error": f"Analysis failed: {str(e)}"}

def determine_department_and_priority(detected_objects, vit_label, opencv_results):
    """Determine appropriate department and priority based on analysis"""
    all_text = f"{' '.join(detected_objects)} {vit_label}".lower()
    
    # Enhanced object-to-department mapping with ViT ImageNet classes
    enhanced_mapping = {
        'Roads & Infrastructure': {
            'keywords': ['road', 'street', 'pavement', 'asphalt', 'concrete', 'pothole', 'crack', 'surface', 'path', 'sidewalk', 'curb', 'intersection', 'highway', 'bridge', 'manhole', 'crosswalk'],
            'vit_objects': ['street sign', 'traffic light', 'car', 'truck', 'bus', 'motorcycle', 'bicycle', 'road', 'highway', 'bridge', 'tunnel', 'construction site']
        },
        'Electricity': {
            'keywords': ['light', 'lamp', 'electrical', 'power', 'wire', 'pole', 'bulb', 'electric', 'lighting', 'cable', 'transformer', 'outage', 'streetlight'],
            'vit_objects': ['street lamp', 'traffic light', 'power line', 'utility pole', 'electrical box', 'transformer', 'light bulb', 'flashlight']
        },
        'Water Services': {
            'keywords': ['water', 'pipe', 'drain', 'sewer', 'leak', 'flood', 'hydrant', 'valve', 'plumbing', 'sewage', 'drainage', 'fountain'],
            'vit_objects': ['fire hydrant', 'fountain', 'water tower', 'pipe', 'faucet', 'shower', 'bathtub', 'sink']
        },
        'Waste Management': {
            'keywords': ['trash', 'garbage', 'waste', 'bin', 'litter', 'dump', 'rubbish', 'recycling', 'collection', 'disposal', 'dumpster'],
            'vit_objects': ['trash can', 'garbage truck', 'recycling bin', 'dumpster', 'waste container', 'litter']
        },
        'Parks & Recreation': {
            'keywords': ['tree', 'grass', 'park', 'bench', 'playground', 'garden', 'landscaping', 'vegetation', 'green', 'plant', 'flower'],
            'vit_objects': ['tree', 'grass', 'flower', 'plant', 'bench', 'swing', 'slide', 'playground', 'park', 'garden', 'lawn mower']
        },
        'Public Safety': {
            'keywords': ['danger', 'hazard', 'unsafe', 'broken', 'damaged', 'emergency', 'security', 'accident', 'risk', 'barrier'],
            'vit_objects': ['stop sign', 'yield sign', 'warning sign', 'barrier', 'cone', 'fence', 'gate', 'security camera']
        }
    }
    
    # Score each department with enhanced matching
    department_scores = {}
    for category, mapping_data in enhanced_mapping.items():
        score = 0
        matched_keywords = []
        
        # Check text keywords
        for keyword in mapping_data['keywords']:
            if keyword in all_text:
                score += 1
                matched_keywords.append(keyword)
        
        # Check ViT object matches (higher weight)
        for vit_obj in mapping_data['vit_objects']:
            if vit_obj.lower() in all_text:
                score += 3  # Higher weight for direct object matches
                matched_keywords.append(f'detected_{vit_obj}')
        
        # Boost score for OpenCV detected features
        if category == 'Roads & Infrastructure':
            if opencv_results.get('color_analysis', {}).get('asphalt_ratio', 0) > 0.2:
                score += 2
                matched_keywords.append('asphalt_surface_detected')
            if 'damage' in str(opencv_results.get('detected_features', [])):
                score += 3
                matched_keywords.append('damage_pattern_detected')
        elif category == 'Parks & Recreation':
            if opencv_results.get('color_analysis', {}).get('vegetation_ratio', 0) > 0.3:
                score += 2
                matched_keywords.append('vegetation_detected')
        
        if score > 0:
            department_scores[category] = {
                'score': score,
                'matched_keywords': matched_keywords
            }
    
    # Always assign to best matching department (never 'Other')
    if department_scores:
        best_category = max(department_scores.keys(), key=lambda k: department_scores[k]['score'])
        best_match = department_scores[best_category]
    else:
        # Smart fallback based on ViT predictions and visual analysis
        if any(word in vit_label.lower() for word in ['car', 'truck', 'road', 'street', 'traffic']):
            best_category = 'Roads & Infrastructure'
            best_match = {'score': 2, 'matched_keywords': ['traffic_infrastructure_detected']}
        elif any(word in vit_label.lower() for word in ['light', 'lamp', 'bulb']):
            best_category = 'Electricity'
            best_match = {'score': 2, 'matched_keywords': ['lighting_detected']}
        elif any(word in vit_label.lower() for word in ['tree', 'plant', 'flower', 'grass']):
            best_category = 'Parks & Recreation'
            best_match = {'score': 2, 'matched_keywords': ['vegetation_detected']}
        elif any(word in vit_label.lower() for word in ['trash', 'bin', 'container']):
            best_category = 'Waste Management'
            best_match = {'score': 2, 'matched_keywords': ['waste_container_detected']}
        elif opencv_results.get('color_analysis', {}).get('asphalt_ratio', 0) > 0.3:
            best_category = 'Roads & Infrastructure'
            best_match = {'score': 2, 'matched_keywords': ['asphalt_surface_detected']}
        else:
            # Final fallback to Roads & Infrastructure
            best_category = 'Roads & Infrastructure'
            best_match = {'score': 1, 'matched_keywords': ['municipal_infrastructure_detected']}
    
    # Determine priority and department
    dept_info = DEPARTMENT_MAPPING.get(best_category, {
        'department': 'Roads Department',
        'priority_rules': {'damage': 'high', 'broken': 'high'}
    })
    
    # Set priority based on detected issues
    priority = 'medium'
    if any(word in all_text for word in ['damage', 'broken', 'crack', 'pothole', 'leak', 'flood']):
        priority = 'high'
    elif any(word in all_text for word in ['emergency', 'danger', 'hazard']):
        priority = 'critical'
    
    return {
        'category': best_category,
        'department': dept_info.get('department', f'{best_category} Department'),
        'priority': priority,
        'matched_keywords': best_match['matched_keywords'],
        'routing_confidence': min(best_match['score'] / 8.0, 1.0),  # Adjusted for higher possible scores
        'detection_method': 'AI_Enhanced_Object_Detection'
    }

def generate_description(category, detected_objects, confidence):
    """Generate human-readable description"""
    if confidence < 0.3:
        return f"Low confidence detection. Please provide more details about the issue."
    
    object_desc = ', '.join(detected_objects) if detected_objects else "municipal infrastructure"
    
    descriptions = {
        'Roads & Infrastructure': f"Detected road infrastructure issue involving {object_desc}. This appears to be a roads and infrastructure problem that requires attention from the municipal roads department.",
        'Electricity': f"Identified electrical infrastructure issue with {object_desc}. This seems to be related to street lighting or electrical systems requiring maintenance.",
        'Water Services': f"Found water-related infrastructure issue involving {object_desc}. This appears to be a water services problem that needs municipal water department attention.",
        'Waste Management': f"Detected waste management issue with {object_desc}. This seems to be related to garbage collection or waste disposal systems.",
        'Parks & Recreation': f"Identified parks and recreation issue involving {object_desc}. This appears to be related to public spaces or recreational facilities.",
        'Public Safety': f"Detected potential safety issue with {object_desc}. This may require immediate attention from relevant authorities.",
        'Other': f"Detected {object_desc} but unable to categorize into specific municipal department. Please provide additional details."
    }
    
    return descriptions.get(category, f"Detected issue involving {object_desc} with {confidence:.1%} confidence.")

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "model_loaded": model_loaded,
        "model_path": MODEL_PATH
    })

@app.route('/analyze', methods=['POST'])
def analyze_image():
    """Analyze uploaded image for municipal issues"""
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image provided"}), 400
        
        image_file = request.files['image']
        if image_file.filename == '':
            return jsonify({"error": "No image selected"}), 400
        
        # Load and process image
        image = Image.open(image_file.stream).convert('RGB')
        
        # Analyze the image
        result = analyze_image_content(image)
        
        if "error" in result:
            return jsonify(result), 500
        
        return jsonify({
            "success": True,
            "analysis": result
        })
        
    except Exception as e:
        print(f"Error in analyze endpoint: {str(e)}")
        return jsonify({"error": f"Analysis failed: {str(e)}"}), 500

@app.route('/analyze_base64', methods=['POST'])
def analyze_base64_image():
    """Analyze base64 encoded image"""
    try:
        data = request.get_json()
        if not data or 'image' not in data:
            return jsonify({"error": "No image data provided"}), 400
        
        # Decode base64 image
        image_data = data['image']
        if image_data.startswith('data:image'):
            image_data = image_data.split(',')[1]
        
        image_bytes = base64.b64decode(image_data)
        image = Image.open(BytesIO(image_bytes)).convert('RGB')
        
        # Analyze the image
        result = analyze_image_content(image)
        
        if "error" in result:
            return jsonify(result), 500
        
        return jsonify({
            "success": True,
            "analysis": result
        })
        
    except Exception as e:
        print(f"Error in analyze_base64 endpoint: {str(e)}")
        return jsonify({"error": f"Analysis failed: {str(e)}"}), 500

if __name__ == '__main__':
    print("🚀 Starting Google ViT Municipal Issue Detection Server...")
    print(f"📁 Model path: {MODEL_PATH}")
    
    # Load the model
    if load_model():
        print("🌐 Server starting on http://localhost:5002")
        app.run(host='0.0.0.0', port=5002, debug=False)
    else:
        print("❌ Failed to load model. Server not started.")
        sys.exit(1)