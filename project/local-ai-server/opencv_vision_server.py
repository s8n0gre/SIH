import os
import sys
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import cv2
import numpy as np

app = Flask(__name__)
CORS(app)

def analyze_municipal_issue(image):
    """Analyze image using OpenCV computer vision for municipal issues"""
    try:
        # Convert PIL to OpenCV format
        opencv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        gray = cv2.cvtColor(opencv_image, cv2.COLOR_BGR2GRAY)
        
        detected_objects = []
        issues_found = []
        category = 'Roads & Infrastructure'
        department = 'Roads Department'
        priority = 'medium'
        confidence = 0.8
        
        # Edge detection for damage patterns
        edges = cv2.Canny(gray, 50, 150)
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Analyze contours for municipal issues
        large_contours = [c for c in contours if cv2.contourArea(c) > 500]
        
        if large_contours:
            for contour in large_contours[:5]:  # Analyze top 5 largest contours
                area = cv2.contourArea(contour)
                approx = cv2.approxPolyDP(contour, 0.02 * cv2.arcLength(contour, True), True)
                
                if len(approx) > 8 and area > 2000:  # Circular/irregular shapes
                    detected_objects.append('Pothole or road damage')
                    issues_found.append('Road surface damage detected')
                    category = 'Roads & Infrastructure'
                    department = 'Roads Department'
                    priority = 'high'
                elif len(approx) == 4 and area > 1000:  # Rectangular shapes
                    detected_objects.append('Rectangular infrastructure')
                    issues_found.append('Infrastructure element detected')
        
        # Color analysis for surface types
        hsv = cv2.cvtColor(opencv_image, cv2.COLOR_BGR2HSV)
        
        # Detect dark surfaces (asphalt)
        dark_mask = cv2.inRange(hsv, (0, 0, 0), (180, 255, 80))
        dark_ratio = np.sum(dark_mask > 0) / (opencv_image.shape[0] * opencv_image.shape[1])
        
        # Detect concrete/light surfaces
        light_mask = cv2.inRange(hsv, (0, 0, 80), (180, 30, 200))
        light_ratio = np.sum(light_mask > 0) / (opencv_image.shape[0] * opencv_image.shape[1])
        
        # Detect vegetation/green areas
        green_mask = cv2.inRange(hsv, (40, 40, 40), (80, 255, 255))
        green_ratio = np.sum(green_mask > 0) / (opencv_image.shape[0] * opencv_image.shape[1])
        
        # Detect water/blue areas
        blue_mask = cv2.inRange(hsv, (100, 50, 50), (130, 255, 255))
        blue_ratio = np.sum(blue_mask > 0) / (opencv_image.shape[0] * opencv_image.shape[1])
        
        # Categorize based on dominant colors and features
        if dark_ratio > 0.3:
            detected_objects.append('Asphalt road surface')
            if len(large_contours) > 3:
                issues_found.append('Road damage patterns detected')
                priority = 'high'
        
        if light_ratio > 0.3:
            detected_objects.append('Concrete surface')
            category = 'Roads & Infrastructure'
            department = 'Roads Department'
        
        if green_ratio > 0.2:
            detected_objects.append('Vegetation/landscaping')
            category = 'Parks & Recreation'
            department = 'Parks Department'
            if len(large_contours) > 2:
                issues_found.append('Park maintenance needed')
        
        if blue_ratio > 0.1:
            detected_objects.append('Water presence')
            category = 'Water Services'
            department = 'Water Department'
            issues_found.append('Water-related issue detected')
            priority = 'high'
        
        # Texture analysis using Gabor filters
        kernel = cv2.getGaborKernel((21, 21), 8, np.pi/4, 2*np.pi, 0.5, 0, ktype=cv2.CV_32F)
        filtered = cv2.filter2D(gray, cv2.CV_8UC3, kernel)
        texture_variance = np.var(filtered)
        
        if texture_variance > 1000:
            detected_objects.append('Rough/damaged surface texture')
            issues_found.append('Surface roughness detected')
            priority = 'high'
        
        # Brightness analysis for lighting issues
        mean_brightness = np.mean(gray)
        if mean_brightness < 50:
            detected_objects.append('Poor lighting conditions')
            category = 'Electricity'
            department = 'Electricity Department'
            issues_found.append('Lighting issue detected')
            priority = 'medium'
        
        # Generate description
        if not detected_objects:
            detected_objects = ['Municipal infrastructure']
            issues_found = ['General infrastructure inspection needed']
        
        description = f"Computer vision analysis detected {', '.join(detected_objects[:3])}. "
        if issues_found:
            description += f"Issues identified: {', '.join(issues_found[:2])}. "
        description += f"Recommended for {department} attention with {priority} priority."
        
        return {
            'category': category,
            'department': department,
            'priority': priority,
            'confidence': confidence,
            'detected_objects': detected_objects,
            'issues_found': issues_found,
            'description': description,
            'analysis_details': {
                'contours_found': len(large_contours),
                'dark_surface_ratio': round(dark_ratio, 2),
                'light_surface_ratio': round(light_ratio, 2),
                'vegetation_ratio': round(green_ratio, 2),
                'water_ratio': round(blue_ratio, 2),
                'texture_roughness': round(texture_variance, 2),
                'brightness_level': round(mean_brightness, 2)
            }
        }
        
    except Exception as e:
        print(f"OpenCV analysis error: {str(e)}")
        return {
            'category': 'Roads & Infrastructure',
            'department': 'Roads Department',
            'priority': 'medium',
            'confidence': 0.5,
            'detected_objects': ['Analysis failed'],
            'issues_found': ['Manual inspection required'],
            'description': 'Computer vision analysis encountered an error. Manual inspection recommended.',
            'analysis_details': {}
        }

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "model": "OpenCV Computer Vision",
        "capabilities": ["edge_detection", "color_analysis", "texture_analysis", "contour_detection"]
    })

@app.route('/analyze', methods=['POST'])
def analyze_image():
    """Analyze uploaded image using OpenCV computer vision"""
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image provided"}), 400
        
        image_file = request.files['image']
        if image_file.filename == '':
            return jsonify({"error": "No image selected"}), 400
        
        # Load image
        image = Image.open(image_file.stream).convert('RGB')
        
        # Analyze with OpenCV
        result = analyze_municipal_issue(image)
        
        return jsonify({
            "success": True,
            "analysis": result
        })
        
    except Exception as e:
        print(f"Error in analyze endpoint: {str(e)}")
        return jsonify({"error": f"Analysis failed: {str(e)}"}), 500

if __name__ == '__main__':
    print("🚀 Starting OpenCV Computer Vision Municipal Issue Detection Server...")
    print("🔍 Capabilities: Edge detection, Color analysis, Texture analysis, Contour detection")
    print("🌐 Server starting on http://localhost:5005")
    app.run(host='0.0.0.0', port=5005, debug=False)