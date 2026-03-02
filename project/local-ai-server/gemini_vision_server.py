import os
import sys
import json
import base64
from io import BytesIO
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import google.generativeai as genai
import cv2
import numpy as np

app = Flask(__name__)
CORS(app)

# Configure Gemini API
GEMINI_API_KEY = "YOUR_GEMINI_API_KEY"  # Replace with your actual API key
genai.configure(api_key=GEMINI_API_KEY)

# Initialize Gemini model
model = genai.GenerativeModel('gemini-1.5-flash')

# Municipal departments mapping
DEPARTMENTS = {
    'Roads & Infrastructure': 'Roads Department',
    'Water Services': 'Water Department', 
    'Electricity': 'Electricity Department',
    'Waste Management': 'Sanitation Department',
    'Parks & Recreation': 'Parks Department',
    'Public Safety': 'Public Safety Department'
}

def analyze_with_gemini(image):
    """Analyze image using Gemini Vision API"""
    try:
        # Convert PIL image to bytes
        img_byte_arr = BytesIO()
        image.save(img_byte_arr, format='JPEG')
        img_byte_arr = img_byte_arr.getvalue()
        
        # Create prompt for municipal issue detection
        prompt = """
        Analyze this image for municipal infrastructure issues. Identify:
        1. What specific objects/infrastructure you see
        2. Any problems, damage, or issues present
        3. The appropriate municipal department (Roads & Infrastructure, Water Services, Electricity, Waste Management, Parks & Recreation, or Public Safety)
        4. Priority level (Critical, High, Medium, Low)
        5. Detailed description of the issue

        Respond in JSON format:
        {
            "detected_objects": ["list of objects seen"],
            "issues_found": ["list of specific problems"],
            "category": "department category",
            "department": "specific department name", 
            "priority": "priority level",
            "confidence": 0.95,
            "description": "detailed description of the municipal issue requiring attention"
        }
        """
        
        # Send to Gemini
        response = model.generate_content([prompt, Image.open(BytesIO(img_byte_arr))])
        
        # Parse JSON response
        try:
            result = json.loads(response.text.strip())
            
            # Validate and enhance response
            if 'category' not in result:
                result['category'] = 'Roads & Infrastructure'
            if 'department' not in result:
                result['department'] = DEPARTMENTS.get(result['category'], 'Roads Department')
            if 'confidence' not in result:
                result['confidence'] = 0.85
            if 'priority' not in result:
                result['priority'] = 'Medium'
                
            return result
            
        except json.JSONDecodeError:
            # Fallback parsing if JSON is malformed
            text = response.text.strip()
            return parse_text_response(text)
            
    except Exception as e:
        print(f"Gemini API error: {str(e)}")
        return fallback_analysis(image)

def parse_text_response(text):
    """Parse non-JSON text response from Gemini"""
    result = {
        'detected_objects': [],
        'issues_found': [],
        'category': 'Roads & Infrastructure',
        'department': 'Roads Department',
        'priority': 'Medium',
        'confidence': 0.8,
        'description': text
    }
    
    # Extract category from text
    text_lower = text.lower()
    if any(word in text_lower for word in ['road', 'street', 'pothole', 'pavement', 'asphalt']):
        result['category'] = 'Roads & Infrastructure'
        result['department'] = 'Roads Department'
    elif any(word in text_lower for word in ['light', 'electrical', 'power', 'lamp']):
        result['category'] = 'Electricity'
        result['department'] = 'Electricity Department'
    elif any(word in text_lower for word in ['water', 'pipe', 'leak', 'drain']):
        result['category'] = 'Water Services'
        result['department'] = 'Water Department'
    elif any(word in text_lower for word in ['trash', 'garbage', 'waste']):
        result['category'] = 'Waste Management'
        result['department'] = 'Sanitation Department'
    elif any(word in text_lower for word in ['park', 'tree', 'garden']):
        result['category'] = 'Parks & Recreation'
        result['department'] = 'Parks Department'
    
    return result

def fallback_analysis(image):
    """Fallback analysis using OpenCV when Gemini fails"""
    try:
        # Convert to OpenCV format
        opencv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        gray = cv2.cvtColor(opencv_image, cv2.COLOR_BGR2GRAY)
        
        # Basic feature detection
        edges = cv2.Canny(gray, 50, 150)
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        detected_objects = []
        issues_found = []
        
        # Analyze contours
        for contour in contours:
            area = cv2.contourArea(contour)
            if area > 1000:
                approx = cv2.approxPolyDP(contour, 0.02 * cv2.arcLength(contour, True), True)
                if len(approx) > 8:
                    detected_objects.append('Circular damage (possible pothole)')
                    issues_found.append('Road surface damage')
                elif len(approx) == 4:
                    detected_objects.append('Rectangular structure')
        
        # Color analysis
        hsv = cv2.cvtColor(opencv_image, cv2.COLOR_BGR2HSV)
        dark_mask = cv2.inRange(hsv, (0, 0, 0), (180, 255, 80))
        dark_ratio = np.sum(dark_mask > 0) / (opencv_image.shape[0] * opencv_image.shape[1])
        
        if dark_ratio > 0.3:
            detected_objects.append('Asphalt road surface')
            
        return {
            'detected_objects': detected_objects or ['Municipal infrastructure'],
            'issues_found': issues_found or ['Infrastructure maintenance needed'],
            'category': 'Roads & Infrastructure',
            'department': 'Roads Department',
            'priority': 'Medium',
            'confidence': 0.7,
            'description': f'OpenCV analysis detected {len(detected_objects)} infrastructure elements requiring municipal attention. Manual verification recommended.'
        }
        
    except Exception as e:
        print(f"Fallback analysis error: {str(e)}")
        return {
            'detected_objects': ['Unknown infrastructure'],
            'issues_found': ['Requires manual inspection'],
            'category': 'Roads & Infrastructure', 
            'department': 'Roads Department',
            'priority': 'Medium',
            'confidence': 0.5,
            'description': 'Image analysis failed. Please provide detailed description of the municipal issue.'
        }

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "model": "Gemini Vision API",
        "api_configured": bool(GEMINI_API_KEY and GEMINI_API_KEY != "YOUR_GEMINI_API_KEY")
    })

@app.route('/analyze', methods=['POST'])
def analyze_image():
    """Analyze uploaded image using Gemini Vision"""
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image provided"}), 400
        
        image_file = request.files['image']
        if image_file.filename == '':
            return jsonify({"error": "No image selected"}), 400
        
        # Load image
        image = Image.open(image_file.stream).convert('RGB')
        
        # Analyze with Gemini
        result = analyze_with_gemini(image)
        
        return jsonify({
            "success": True,
            "analysis": {
                "category": result['category'],
                "department": result['department'],
                "priority": result['priority'].lower(),
                "confidence": result['confidence'],
                "detected_objects": result['detected_objects'],
                "issues_found": result['issues_found'],
                "description": result['description']
            }
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
        
        # Analyze with Gemini
        result = analyze_with_gemini(image)
        
        return jsonify({
            "success": True,
            "analysis": {
                "category": result['category'],
                "department": result['department'], 
                "priority": result['priority'].lower(),
                "confidence": result['confidence'],
                "detected_objects": result['detected_objects'],
                "issues_found": result['issues_found'],
                "description": result['description']
            }
        })
        
    except Exception as e:
        print(f"Error in analyze_base64 endpoint: {str(e)}")
        return jsonify({"error": f"Analysis failed: {str(e)}"}), 500

if __name__ == '__main__':
    print("🚀 Starting Gemini Vision Municipal Issue Detection Server...")
    
    if GEMINI_API_KEY == "YOUR_GEMINI_API_KEY":
        print("⚠️  WARNING: Please set your Gemini API key in the script")
        print("   Get your API key from: https://makersuite.google.com/app/apikey")
    
    print("🌐 Server starting on http://localhost:5004")
    app.run(host='0.0.0.0', port=5004, debug=False)