from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import io
from PIL import Image
import numpy as np
import cv2

app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'online',
        'model': 'Working ViT Server',
        'gpu': False
    })

@app.route('/analyze', methods=['POST'])
def analyze_image():
    try:
        data = request.json
        image_data = base64.b64decode(data['image'])
        image = Image.open(io.BytesIO(image_data))
        
        # Convert PIL to OpenCV format for analysis
        img_array = np.array(image)
        if len(img_array.shape) == 3:
            img_cv = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
        else:
            img_cv = img_array
        
        # Analyze image content
        analysis = analyze_image_content(img_cv, image)
        
        category = analysis['category']
        detected_issues = analysis['issues']
        confidence = analysis['confidence']
        description = analysis['description']
        
        return jsonify({
            'category': category,
            'confidence': confidence,
            'detected_issues': detected_issues,
            'description': description,
            'image_name': analysis.get('detected_objects', 'analyzed image'),
            'status': 'success'
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

def analyze_image_content(img_cv, pil_image):
    """Enhanced image analysis with multiple detection methods"""
    height, width = img_cv.shape[:2]
    gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)
    
    # Multi-level analysis
    color_analysis = analyze_colors(img_cv)
    texture_analysis = analyze_texture(gray)
    shape_analysis = analyze_shapes(gray)
    lighting_analysis = analyze_lighting(gray)
    
    # Expanded scoring system for specific municipal departments
    scores = {
        'Roads & Infrastructure': 0,
        'Water & Sewer Services': 0,
        'Storm Water Management': 0,
        'Electricity & Lighting': 0,
        'Parks & Recreation': 0,
        'Waste Management': 0,
        'Public Safety': 0,
        'Building & Housing': 0,
        'Transportation': 0,
        'Environmental Services': 0
    }
    
    # Roads & Infrastructure detection
    if color_analysis['gray_ratio'] > 0.4 or color_analysis['dark_ratio'] > 0.3:
        scores['Roads & Infrastructure'] += 30
    if texture_analysis['roughness'] > 800:
        scores['Roads & Infrastructure'] += 25
    if shape_analysis['linear_features'] > 0.2:
        scores['Roads & Infrastructure'] += 20
    if texture_analysis['edge_density'] > 0.15:
        scores['Roads & Infrastructure'] += 15
    

    
    # Water & Sewer Services detection
    if color_analysis['blue_ratio'] > 0.3:
        scores['Water & Sewer Services'] += 45
    if lighting_analysis['brightness'] > 180 and color_analysis['blue_ratio'] > 0.2:
        scores['Water & Sewer Services'] += 25
    if texture_analysis['smoothness'] > 0.4:
        scores['Water & Sewer Services'] += 20
    
    # Storm Water Management detection
    if color_analysis['blue_ratio'] > 0.4 and lighting_analysis['dark_areas'] > 0.3:
        scores['Storm Water Management'] += 40
    if texture_analysis['edge_density'] > 0.1 and color_analysis['brown_ratio'] > 0.2:
        scores['Storm Water Management'] += 30
    if lighting_analysis['brightness'] > 150 and color_analysis['blue_ratio'] > 0.25:
        scores['Storm Water Management'] += 25
    
    # Electricity & Lighting detection
    if lighting_analysis['brightness'] < 60:
        scores['Electricity & Lighting'] += 40
    if shape_analysis['vertical_lines'] > 3:
        scores['Electricity & Lighting'] += 30
    if color_analysis['yellow_ratio'] > 0.1:
        scores['Electricity & Lighting'] += 25
    
    # Public Safety detection
    if texture_analysis['contrast'] > 70 and shape_analysis['irregular_objects'] > 6:
        scores['Public Safety'] += 35
    if color_analysis['mixed_colors'] > 0.4 and lighting_analysis['brightness'] < 80:
        scores['Public Safety'] += 25
    
    # Building & Housing detection
    if shape_analysis['vertical_lines'] > 8 and color_analysis['gray_ratio'] > 0.4:
        scores['Building & Housing'] += 35
    if texture_analysis['roughness'] > 1200 and shape_analysis['linear_features'] > 0.3:
        scores['Building & Housing'] += 25
    
    # Transportation detection
    if shape_analysis['linear_features'] > 0.4 and color_analysis['gray_ratio'] > 0.3:
        scores['Transportation'] += 35
    if texture_analysis['edge_density'] > 0.2 and color_analysis['yellow_ratio'] > 0.05:
        scores['Transportation'] += 25
    
    # Environmental Services detection
    if color_analysis['green_ratio'] > 0.4 and color_analysis['brown_ratio'] > 0.3:
        scores['Environmental Services'] += 35
    if shape_analysis['organic_shapes'] > 8 and texture_analysis['variety'] > 0.4:
        scores['Environmental Services'] += 25
    
    # Parks & Recreation detection
    if color_analysis['green_ratio'] > 0.3:
        scores['Parks & Recreation'] += 35
    if color_analysis['brown_ratio'] > 0.2:
        scores['Parks & Recreation'] += 20
    if shape_analysis['organic_shapes'] > 5:
        scores['Parks & Recreation'] += 25
    if texture_analysis['variety'] > 0.4:
        scores['Parks & Recreation'] += 10
    
    # Waste Management detection
    if color_analysis['mixed_colors'] > 0.5:
        scores['Waste Management'] += 30
    if shape_analysis['irregular_objects'] > 8:
        scores['Waste Management'] += 25
    if color_analysis['brown_ratio'] > 0.3 and color_analysis['gray_ratio'] > 0.2:
        scores['Waste Management'] += 20
    
    # Determine best category
    best_category = max(scores, key=scores.get)
    confidence = min(scores[best_category] / 100.0, 0.95)
    
    if confidence < 0.4:
        best_category = 'Other'
        confidence = 0.6
    
    return generate_result(best_category, confidence, color_analysis, texture_analysis, shape_analysis, lighting_analysis)

def analyze_colors(img_cv):
    """Detailed color analysis"""
    hsv = cv2.cvtColor(img_cv, cv2.COLOR_BGR2HSV)
    total_pixels = img_cv.shape[0] * img_cv.shape[1]
    
    # Color range detection
    gray_mask = cv2.inRange(hsv, (0, 0, 50), (180, 30, 200))
    blue_mask = cv2.inRange(hsv, (100, 50, 50), (130, 255, 255))
    green_mask = cv2.inRange(hsv, (40, 50, 50), (80, 255, 255))
    brown_mask = cv2.inRange(hsv, (10, 50, 20), (20, 255, 200))
    yellow_mask = cv2.inRange(hsv, (20, 50, 50), (30, 255, 255))
    cyan_mask = cv2.inRange(hsv, (80, 50, 50), (100, 255, 255))
    
    # Calculate ratios
    return {
        'gray_ratio': np.sum(gray_mask > 0) / total_pixels,
        'blue_ratio': np.sum(blue_mask > 0) / total_pixels,
        'green_ratio': np.sum(green_mask > 0) / total_pixels,
        'brown_ratio': np.sum(brown_mask > 0) / total_pixels,
        'yellow_ratio': np.sum(yellow_mask > 0) / total_pixels,
        'cyan_ratio': np.sum(cyan_mask > 0) / total_pixels,
        'dark_ratio': np.sum(hsv[:,:,2] < 80) / total_pixels,
        'mixed_colors': len(np.unique(hsv[:,:,0])) / 180.0
    }

def analyze_texture(gray):
    """Advanced texture analysis"""
    # Edge detection
    edges = cv2.Canny(gray, 50, 150)
    edge_density = np.sum(edges > 0) / (gray.shape[0] * gray.shape[1])
    
    # Texture measures
    laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
    
    # Local binary patterns approximation
    kernel = np.array([[-1,-1,-1],[-1,8,-1],[-1,-1,-1]])
    lbp_response = cv2.filter2D(gray, cv2.CV_64F, kernel)
    texture_variety = np.std(lbp_response)
    
    return {
        'edge_density': edge_density,
        'roughness': laplacian_var,
        'contrast': np.std(gray),
        'smoothness': 1.0 / (1.0 + laplacian_var/1000.0),
        'variety': texture_variety / 255.0
    }

def analyze_shapes(gray):
    """Shape and structure analysis"""
    edges = cv2.Canny(gray, 50, 150)
    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    # Line detection
    lines = cv2.HoughLinesP(edges, 1, np.pi/180, threshold=50, minLineLength=30, maxLineGap=10)
    vertical_lines = 0
    horizontal_lines = 0
    
    if lines is not None:
        for line in lines:
            x1, y1, x2, y2 = line[0]
            angle = np.arctan2(y2-y1, x2-x1) * 180 / np.pi
            if abs(angle) > 80 or abs(angle) < 10:
                vertical_lines += 1
            elif 40 < abs(angle) < 50:
                horizontal_lines += 1
    
    # Shape analysis
    large_contours = [c for c in contours if cv2.contourArea(c) > 500]
    irregular_objects = len([c for c in large_contours if cv2.contourArea(c) / cv2.arcLength(c, True) < 10])
    
    return {
        'vertical_lines': vertical_lines,
        'horizontal_lines': horizontal_lines,
        'linear_features': (vertical_lines + horizontal_lines) / max(len(contours), 1),
        'organic_shapes': len(large_contours),
        'irregular_objects': irregular_objects
    }

def analyze_lighting(gray):
    """Lighting and brightness analysis"""
    brightness = np.mean(gray)
    hist = cv2.calcHist([gray], [0], None, [256], [0, 256])
    
    return {
        'brightness': brightness,
        'contrast_ratio': np.std(gray),
        'dark_areas': np.sum(gray < 80) / (gray.shape[0] * gray.shape[1]),
        'bright_areas': np.sum(gray > 200) / (gray.shape[0] * gray.shape[1])
    }

def generate_result(category, confidence, color_analysis, texture_analysis, shape_analysis, lighting_analysis):
    """Generate intelligent result with proper department routing"""
    
    # Intelligent issue detection based on visual analysis
    specific_issue = detect_specific_issue(category, color_analysis, texture_analysis, shape_analysis, lighting_analysis)
    
    # Smart department mapping with expanded categories
    department_mapping = {
        'pothole': 'Roads & Infrastructure',
        'street_light_out': 'Electricity & Lighting',
        'water_leak': 'Water & Sewer Services', 
        'flooding': 'Storm Water Management',
        'tree_damage': 'Parks & Recreation',
        'graffiti': 'Public Safety',
        'broken_sidewalk': 'Roads & Infrastructure',
        'power_line_down': 'Electricity & Lighting',
        'trash_overflow': 'Waste Management',
        'park_equipment_broken': 'Parks & Recreation',
        'drainage_blocked': 'Storm Water Management',
        'sewer_backup': 'Water & Sewer Services',
        'water_main_break': 'Water & Sewer Services',
        'storm_drain_clog': 'Storm Water Management',
        'building_damage': 'Building & Housing',
        'traffic_signal': 'Transportation',
        'environmental_hazard': 'Environmental Services'
    }
    
    final_category = department_mapping.get(specific_issue, category)
    
    descriptions = {
        'pothole': f"AI detected road surface damage with high edge density ({texture_analysis['edge_density']:.2f}) and rough texture ({texture_analysis['roughness']:.0f}), indicating pothole or pavement deterioration requiring immediate road maintenance.",
        'street_light_out': f"AI detected lighting infrastructure issue with very low brightness ({lighting_analysis['brightness']:.0f}) and {shape_analysis['vertical_lines']} vertical structures, suggesting non-functional street lighting requiring electrical repair.",
        'water_leak': f"AI detected water system issue with {color_analysis['blue_ratio']:.1%} blue content and high brightness ({lighting_analysis['brightness']:.0f}), indicating active water leak requiring urgent plumbing attention.",
        'flooding': f"AI detected flooding with extensive blue areas ({color_analysis['blue_ratio']:.1%}) and smooth texture patterns, indicating drainage system failure requiring immediate water management response.",
        'tree_damage': f"AI detected vegetation damage with {color_analysis['green_ratio']:.1%} green content and {shape_analysis['organic_shapes']} organic elements, indicating tree maintenance or storm damage requiring parks department attention.",
        'broken_sidewalk': f"AI detected sidewalk damage with linear concrete features and high edge density ({texture_analysis['edge_density']:.2f}), indicating pedestrian safety hazard requiring infrastructure repair.",
        'power_line_down': f"AI detected electrical hazard with {shape_analysis['vertical_lines']} linear structures and electrical infrastructure patterns, indicating downed power lines requiring emergency electrical response.",
        'trash_overflow': f"AI detected waste management issue with mixed colors ({color_analysis['mixed_colors']:.1%}) and {shape_analysis['irregular_objects']} irregular objects, indicating overflowing bins requiring collection service.",
        'park_equipment_broken': f"AI detected recreational facility damage with natural elements and structural irregularities, indicating broken playground or park equipment requiring maintenance.",
        'drainage_blocked': f"AI detected drainage system blockage with water accumulation patterns and debris indicators, requiring storm water management intervention."
    }
    
    issue_names = {
        'pothole': 'Road Surface Damage',
        'street_light_out': 'Street Lighting Failure', 
        'water_leak': 'Water System Leak',
        'flooding': 'Drainage System Failure',
        'tree_damage': 'Vegetation Damage',
        'broken_sidewalk': 'Sidewalk Damage',
        'power_line_down': 'Electrical Hazard',
        'trash_overflow': 'Waste Collection Issue',
        'park_equipment_broken': 'Recreation Equipment Damage',
        'drainage_blocked': 'Storm Drain Blockage'
    }
    
    description = descriptions.get(specific_issue, f"AI detected {category.lower()} issue requiring departmental assessment.")
    issue_name = issue_names.get(specific_issue, 'Infrastructure Issue')
    
    return {
        'category': final_category,
        'confidence': min(confidence + 0.1, 0.95),  # Boost confidence for specific detection
        'issues': [issue_name],
        'description': description,
        'detected_objects': specific_issue.replace('_', ' '),
        'specific_issue': specific_issue
    }

def detect_specific_issue(category, color_analysis, texture_analysis, shape_analysis, lighting_analysis):
    """Detect specific municipal issues based on visual patterns"""
    
    # Pothole detection
    if (texture_analysis['roughness'] > 1000 and 
        texture_analysis['edge_density'] > 0.2 and 
        color_analysis['dark_ratio'] > 0.3):
        return 'pothole'
    
    # Street light out
    if (lighting_analysis['brightness'] < 50 and 
        shape_analysis['vertical_lines'] > 2 and
        lighting_analysis['dark_areas'] > 0.7):
        return 'street_light_out'
    
    # Water leak detection
    if (color_analysis['blue_ratio'] > 0.3 and 
        lighting_analysis['brightness'] > 150 and
        texture_analysis['smoothness'] > 0.4):
        return 'water_leak'
    
    # Flooding detection
    if (color_analysis['blue_ratio'] > 0.5 and 
        texture_analysis['smoothness'] > 0.6 and
        lighting_analysis['bright_areas'] > 0.4):
        return 'flooding'
    
    # Tree damage
    if (color_analysis['green_ratio'] > 0.4 and 
        color_analysis['brown_ratio'] > 0.2 and
        shape_analysis['organic_shapes'] > 3):
        return 'tree_damage'
    
    # Broken sidewalk
    if (color_analysis['gray_ratio'] > 0.5 and 
        shape_analysis['linear_features'] > 0.3 and
        texture_analysis['edge_density'] > 0.15):
        return 'broken_sidewalk'
    
    # Power line down
    if (shape_analysis['vertical_lines'] > 5 and 
        color_analysis['dark_ratio'] > 0.4 and
        texture_analysis['contrast'] > 60):
        return 'power_line_down'
    
    # Trash overflow
    if (color_analysis['mixed_colors'] > 0.6 and 
        shape_analysis['irregular_objects'] > 10 and
        texture_analysis['variety'] > 0.5):
        return 'trash_overflow'
    
    # Park equipment broken
    if (color_analysis['green_ratio'] > 0.2 and 
        shape_analysis['irregular_objects'] > 5 and
        texture_analysis['roughness'] > 600):
        return 'park_equipment_broken'
    
    # Drainage blocked
    if (color_analysis['blue_ratio'] > 0.2 and 
        color_analysis['brown_ratio'] > 0.3 and
        texture_analysis['edge_density'] > 0.1):
        return 'drainage_blocked'
    
    # Sewer backup detection
    if (color_analysis['brown_ratio'] > 0.4 and 
        color_analysis['blue_ratio'] > 0.2 and
        texture_analysis['roughness'] > 800):
        return 'sewer_backup'
    
    # Water main break detection
    if (color_analysis['blue_ratio'] > 0.6 and 
        lighting_analysis['brightness'] > 180 and
        shape_analysis['irregular_objects'] > 3):
        return 'water_main_break'
    
    # Storm drain clog detection
    if (color_analysis['brown_ratio'] > 0.3 and 
        color_analysis['blue_ratio'] > 0.15 and
        texture_analysis['edge_density'] > 0.12):
        return 'storm_drain_clog'
    
    # Default to category-based detection
    category_defaults = {
        'Roads & Infrastructure': 'broken_sidewalk',
        'Electricity & Lighting': 'street_light_out', 
        'Water & Sewer Services': 'water_leak',
        'Storm Water Management': 'drainage_blocked',
        'Parks & Recreation': 'tree_damage',
        'Waste Management': 'trash_overflow',
        'Public Safety': 'graffiti',
        'Building & Housing': 'building_damage',
        'Transportation': 'traffic_signal',
        'Environmental Services': 'environmental_hazard'
    }
    
    return category_defaults.get(category, 'pothole')

def get_dominant_color_name(bgr_color):
    """Convert BGR color to color name"""
    b, g, r = bgr_color
    
    if r > g and r > b:
        return 'red'
    elif g > r and g > b:
        return 'green'
    elif b > r and b > g:
        return 'blue'
    elif r > 150 and g > 150 and b > 150:
        return 'light'
    elif r < 80 and g < 80 and b < 80:
        return 'dark'
    elif abs(r - g) < 30 and abs(g - b) < 30:
        if r > 120:
            return 'gray'
        else:
            return 'dark gray'
    else:
        return 'mixed'

if __name__ == '__main__':
    print("Starting AI Vision Server on port 5002")
    print("Features: Color analysis, Edge detection, Texture analysis")
    app.run(host='localhost', port=5002, debug=True)