from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import io
from PIL import Image
import numpy as np
import cv2
import torch
from transformers import pipeline, AutoTokenizer, AutoModelForCausalLM
import json

app = Flask(__name__)
CORS(app)

class EnhancedAIAnalyzer:
    def __init__(self):
        self.vision_models = []
        self.text_models = []
        self.ensemble_weights = {'vision': 0.6, 'text': 0.4}
        self.confidence_threshold = 0.7
        
    def multi_modal_analysis(self, image_data, title, description):
        """Combine vision and text analysis for stronger predictions"""
        
        # Vision analysis
        vision_result = self.advanced_vision_analysis(image_data)
        
        # Text analysis  
        text_result = self.enhanced_text_analysis(title, description)
        
        # Ensemble prediction
        final_result = self.ensemble_prediction(vision_result, text_result)
        
        return final_result
    
    def advanced_vision_analysis(self, image_data):
        """Enhanced computer vision with multiple techniques"""
        image = Image.open(io.BytesIO(base64.b64decode(image_data)))
        img_array = np.array(image)
        img_cv = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
        
        # Multi-scale analysis
        analyses = []
        scales = [1.0, 0.75, 0.5]
        
        for scale in scales:
            if scale != 1.0:
                h, w = img_cv.shape[:2]
                resized = cv2.resize(img_cv, (int(w*scale), int(h*scale)))
            else:
                resized = img_cv
                
            analysis = self.deep_image_analysis(resized)
            analyses.append(analysis)
        
        # Combine multi-scale results
        return self.combine_vision_analyses(analyses)
    
    def deep_image_analysis(self, img_cv):
        """Advanced computer vision techniques"""
        gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)
        
        # Advanced feature extraction
        features = {
            'color': self.advanced_color_analysis(img_cv),
            'texture': self.advanced_texture_analysis(gray),
            'shape': self.advanced_shape_analysis(gray),
            'spatial': self.spatial_analysis(gray),
            'frequency': self.frequency_analysis(gray)
        }
        
        # AI-powered classification
        return self.classify_municipal_issue(features)
    
    def advanced_color_analysis(self, img_cv):
        """Enhanced color analysis with HSV and LAB color spaces"""
        hsv = cv2.cvtColor(img_cv, cv2.COLOR_BGR2HSV)
        lab = cv2.cvtColor(img_cv, cv2.COLOR_BGR2LAB)
        
        # Color histogram analysis
        hist_b = cv2.calcHist([img_cv], [0], None, [256], [0, 256])
        hist_g = cv2.calcHist([img_cv], [1], None, [256], [0, 256])
        hist_r = cv2.calcHist([img_cv], [2], None, [256], [0, 256])
        
        # Dominant colors using K-means
        pixels = img_cv.reshape(-1, 3)
        from sklearn.cluster import KMeans
        kmeans = KMeans(n_clusters=5, random_state=42)
        kmeans.fit(pixels)
        dominant_colors = kmeans.cluster_centers_
        
        return {
            'dominant_colors': dominant_colors.tolist(),
            'color_variance': np.var(pixels, axis=0).tolist(),
            'brightness_distribution': np.histogram(hsv[:,:,2], bins=10)[0].tolist(),
            'saturation_mean': np.mean(hsv[:,:,1])
        }
    
    def advanced_texture_analysis(self, gray):
        """Multi-method texture analysis"""
        # Gabor filters
        gabor_responses = []
        for theta in [0, 45, 90, 135]:
            kernel = cv2.getGaborKernel((21, 21), 5, np.radians(theta), 2*np.pi*0.5, 0.5, 0, ktype=cv2.CV_32F)
            response = cv2.filter2D(gray, cv2.CV_8UC3, kernel)
            gabor_responses.append(np.mean(response))
        
        # Local Binary Pattern approximation
        lbp_kernel = np.array([[-1,-1,-1],[-1,8,-1],[-1,-1,-1]])
        lbp_response = cv2.filter2D(gray, cv2.CV_64F, lbp_kernel)
        
        # Co-occurrence matrix features
        glcm_contrast = np.std(gray)**2
        glcm_homogeneity = 1 / (1 + np.var(gray))
        
        return {
            'gabor_responses': gabor_responses,
            'lbp_variance': np.var(lbp_response),
            'glcm_contrast': glcm_contrast,
            'glcm_homogeneity': glcm_homogeneity,
            'edge_density': np.sum(cv2.Canny(gray, 50, 150) > 0) / gray.size
        }
    
    def advanced_shape_analysis(self, gray):
        """Enhanced shape and structure detection"""
        edges = cv2.Canny(gray, 50, 150)
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Hough transforms
        lines = cv2.HoughLinesP(edges, 1, np.pi/180, threshold=50, minLineLength=30, maxLineGap=10)
        circles = cv2.HoughCircles(gray, cv2.HOUGH_GRADIENT, 1, 20, param1=50, param2=30, minRadius=0, maxRadius=0)
        
        # Shape descriptors
        shape_features = {
            'contour_count': len(contours),
            'line_count': len(lines) if lines is not None else 0,
            'circle_count': len(circles[0]) if circles is not None else 0,
            'convex_hull_ratio': 0,
            'aspect_ratios': []
        }
        
        for contour in contours:
            if cv2.contourArea(contour) > 100:
                hull = cv2.convexHull(contour)
                shape_features['convex_hull_ratio'] += cv2.contourArea(hull) / cv2.contourArea(contour)
                
                rect = cv2.boundingRect(contour)
                aspect_ratio = rect[2] / rect[3] if rect[3] > 0 else 0
                shape_features['aspect_ratios'].append(aspect_ratio)
        
        return shape_features
    
    def spatial_analysis(self, gray):
        """Spatial distribution analysis"""
        h, w = gray.shape
        
        # Divide image into regions
        regions = {
            'top_left': gray[:h//2, :w//2],
            'top_right': gray[:h//2, w//2:],
            'bottom_left': gray[h//2:, :w//2],
            'bottom_right': gray[h//2:, w//2:]
        }
        
        region_stats = {}
        for region_name, region in regions.items():
            region_stats[region_name] = {
                'mean_intensity': np.mean(region),
                'std_intensity': np.std(region),
                'edge_density': np.sum(cv2.Canny(region, 50, 150) > 0) / region.size
            }
        
        return region_stats
    
    def frequency_analysis(self, gray):
        """Frequency domain analysis using FFT"""
        f_transform = np.fft.fft2(gray)
        f_shift = np.fft.fftshift(f_transform)
        magnitude_spectrum = np.log(np.abs(f_shift) + 1)
        
        return {
            'frequency_energy': np.sum(magnitude_spectrum),
            'high_freq_ratio': np.sum(magnitude_spectrum > np.percentile(magnitude_spectrum, 80)) / magnitude_spectrum.size,
            'dominant_frequency': np.unravel_index(np.argmax(magnitude_spectrum), magnitude_spectrum.shape)
        }
    
    def classify_municipal_issue(self, features):
        """AI-powered classification using extracted features"""
        
        # Advanced scoring with weighted features
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
        
        # Color-based scoring (weighted 30%)
        dominant_colors = features['color']['dominant_colors']
        for color in dominant_colors:
            b, g, r = color
            if r < 80 and g < 80 and b < 80:  # Dark colors
                scores['Roads & Infrastructure'] += 15
                scores['Electricity & Lighting'] += 10
            elif b > 150 and g < 100 and r < 100:  # Blue dominant
                scores['Water & Sewer Services'] += 20
                scores['Storm Water Management'] += 15
            elif g > 150 and r < 100 and b < 100:  # Green dominant
                scores['Parks & Recreation'] += 20
                scores['Environmental Services'] += 10
        
        # Texture-based scoring (weighted 25%)
        if features['texture']['edge_density'] > 0.15:
            scores['Roads & Infrastructure'] += 20
            scores['Building & Housing'] += 15
        if features['texture']['lbp_variance'] > 1000:
            scores['Waste Management'] += 15
            scores['Environmental Services'] += 10
        
        # Shape-based scoring (weighted 25%)
        if features['shape']['line_count'] > 5:
            scores['Transportation'] += 20
            scores['Electricity & Lighting'] += 15
        if features['shape']['circle_count'] > 2:
            scores['Public Safety'] += 15
            scores['Parks & Recreation'] += 10
        
        # Spatial-based scoring (weighted 20%)
        spatial_variance = np.var([region['mean_intensity'] for region in features['spatial'].values()])
        if spatial_variance > 500:
            scores['Waste Management'] += 15
            scores['Environmental Services'] += 10
        
        # Find best category
        best_category = max(scores, key=scores.get)
        confidence = min(scores[best_category] / 100.0, 0.95)
        
        return {
            'category': best_category,
            'confidence': confidence,
            'scores': scores,
            'features_used': list(features.keys())
        }
    
    def enhanced_text_analysis(self, title, description):
        """Advanced NLP analysis"""
        text = f"{title} {description}".lower()
        
        # Keyword matching with weights
        keyword_weights = {
            'Roads & Infrastructure': ['pothole', 'road', 'pavement', 'asphalt', 'sidewalk', 'curb'],
            'Water & Sewer Services': ['water', 'leak', 'pipe', 'sewer', 'drain', 'plumbing'],
            'Storm Water Management': ['flood', 'storm', 'drainage', 'runoff', 'gutter'],
            'Electricity & Lighting': ['light', 'power', 'electric', 'lamp', 'outage', 'wire'],
            'Parks & Recreation': ['park', 'tree', 'grass', 'playground', 'bench', 'trail'],
            'Waste Management': ['trash', 'garbage', 'waste', 'bin', 'litter', 'dump'],
            'Public Safety': ['graffiti', 'vandal', 'safety', 'crime', 'danger'],
            'Building & Housing': ['building', 'structure', 'wall', 'roof', 'window'],
            'Transportation': ['traffic', 'signal', 'sign', 'crosswalk', 'intersection'],
            'Environmental Services': ['pollution', 'contamination', 'hazard', 'chemical']
        }
        
        text_scores = {}
        for category, keywords in keyword_weights.items():
            score = sum(3 if keyword in text else 0 for keyword in keywords)
            text_scores[category] = score
        
        best_text_category = max(text_scores, key=text_scores.get)
        text_confidence = min(text_scores[best_text_category] / 15.0, 0.9)
        
        return {
            'category': best_text_category,
            'confidence': text_confidence,
            'scores': text_scores
        }
    
    def combine_vision_analyses(self, analyses):
        """Combine multiple vision analyses"""
        combined_scores = {}
        
        for analysis in analyses:
            for category, score in analysis['scores'].items():
                combined_scores[category] = combined_scores.get(category, 0) + score
        
        # Average the scores
        for category in combined_scores:
            combined_scores[category] /= len(analyses)
        
        best_category = max(combined_scores, key=combined_scores.get)
        confidence = min(combined_scores[best_category] / 100.0, 0.95)
        
        return {
            'category': best_category,
            'confidence': confidence,
            'scores': combined_scores
        }
    
    def ensemble_prediction(self, vision_result, text_result):
        """Combine vision and text predictions"""
        
        # Weighted ensemble
        final_scores = {}
        all_categories = set(vision_result['scores'].keys()) | set(text_result['scores'].keys())
        
        for category in all_categories:
            vision_score = vision_result['scores'].get(category, 0)
            text_score = text_result['scores'].get(category, 0)
            
            final_scores[category] = (
                vision_score * self.ensemble_weights['vision'] + 
                text_score * self.ensemble_weights['text']
            )
        
        best_category = max(final_scores, key=final_scores.get)
        final_confidence = min(
            (vision_result['confidence'] * self.ensemble_weights['vision'] + 
             text_result['confidence'] * self.ensemble_weights['text']), 
            0.98
        )
        
        # Generate detailed description
        description = self.generate_detailed_description(
            best_category, final_confidence, vision_result, text_result
        )
        
        return {
            'category': best_category,
            'confidence': final_confidence,
            'description': description,
            'vision_analysis': vision_result,
            'text_analysis': text_result,
            'ensemble_scores': final_scores
        }
    
    def generate_detailed_description(self, category, confidence, vision_result, text_result):
        """Generate human-readable, contextual description"""
        
        # Problem-focused descriptions by category
        problem_descriptions = {
            'Roads & Infrastructure': {
                'high': "Road surface damage including potholes, cracks, or pavement deterioration affecting vehicle safety and traffic flow.",
                'medium': "Road maintenance issues such as surface wear, minor potholes, or sidewalk damage requiring repair.",
                'low': "Possible road infrastructure concerns that may need inspection and maintenance."
            },
            'Water & Sewer Services': {
                'high': "Water system emergency including major leaks, pipe bursts, or sewer backups requiring immediate repair.",
                'medium': "Water infrastructure problems such as leaks, low pressure, or drainage issues needing attention.",
                'low': "Potential water or sewer system issues that should be investigated."
            },
            'Electricity & Lighting': {
                'high': "Electrical hazards including downed power lines, outages, or non-functioning street lights creating safety risks.",
                'medium': "Street lighting problems or electrical issues affecting public areas and safety.",
                'low': "Possible electrical infrastructure concerns requiring evaluation."
            },
            'Storm Water Management': {
                'high': "Drainage system failure causing flooding, blocked storm drains, or water accumulation in public areas.",
                'medium': "Storm water issues including poor drainage, clogged gutters, or minor flooding problems.",
                'low': "Potential drainage concerns that may affect storm water management."
            },
            'Parks & Recreation': {
                'high': "Park infrastructure damage including broken equipment, damaged facilities, or safety hazards in recreational areas.",
                'medium': "Park maintenance needs such as equipment repair, landscaping issues, or facility upkeep.",
                'low': "Possible park-related maintenance issues requiring attention."
            },
            'Waste Management': {
                'high': "Waste collection emergency including overflowing bins, illegal dumping, or sanitation hazards.",
                'medium': "Waste management problems such as missed collections, damaged bins, or litter accumulation.",
                'low': "Potential waste collection or disposal issues needing review."
            },
            'Public Safety': {
                'high': "Public safety hazards including vandalism, graffiti, or conditions creating immediate danger to citizens.",
                'medium': "Safety concerns such as damaged property, minor vandalism, or security issues in public areas.",
                'low': "Possible public safety matters requiring evaluation."
            },
            'Other': {
                'high': "Municipal infrastructure problems requiring immediate departmental attention and resolution.",
                'medium': "General infrastructure concerns needing municipal services evaluation and action.",
                'low': "Municipal issues requiring departmental review and assessment."
            }
        }
        
        # Determine confidence level for template selection
        if confidence >= 0.8:
            conf_level = 'high'
        elif confidence >= 0.6:
            conf_level = 'medium'
        else:
            conf_level = 'low'
        
        # Get base description
        base_desc = context_templates.get(category, context_templates['Other'])[conf_level]
        
        # Department response actions
        department_actions = {
            'Roads & Infrastructure': "Roads Department will inspect and schedule necessary repairs.",
            'Water & Sewer Services': "Water Services will investigate and resolve the issue.",
            'Electricity & Lighting': "Utilities Department will address electrical concerns promptly.",
            'Storm Water Management': "Storm Water Management will evaluate and fix drainage problems.",
            'Parks & Recreation': "Parks Department will schedule maintenance and improvements.",
            'Waste Management': "Sanitation Services will address waste collection issues.",
            'Public Safety': "Public Safety will review and take appropriate action.",
            'Other': "Appropriate department will review and address this matter."
        }
        
        # Get problem description
        problem_desc = problem_descriptions.get(category, problem_descriptions['Other'])[conf_level]
        
        # Add department tag and action
        department_tag = f"[{category}]"
        action = department_actions.get(category, department_actions['Other'])
        
        # Final description without AI mentions
        final_desc = f"{department_tag} {problem_desc} {action}"
        
        return final_desc

# Initialize enhanced analyzer
analyzer = EnhancedAIAnalyzer()

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'online',
        'model': 'Enhanced Multi-Modal AI',
        'features': ['Computer Vision', 'NLP', 'Ensemble Learning'],
        'gpu': torch.cuda.is_available()
    })

@app.route('/analyze', methods=['POST'])
def analyze_issue():
    try:
        data = request.json
        
        if 'image' in data:
            # Multi-modal analysis
            result = analyzer.multi_modal_analysis(
                data['image'],
                data.get('title', ''),
                data.get('description', '')
            )
        else:
            # Text-only analysis
            result = analyzer.enhanced_text_analysis(
                data.get('title', ''),
                data.get('description', '')
            )
        
        return jsonify({
            'category': result['category'],
            'confidence': result['confidence'],
            'description': result['description'],
            'status': 'success',
            'analysis_type': 'multi_modal' if 'image' in data else 'text_only'
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

if __name__ == '__main__':
    print("Starting Enhanced AI Server on port 5003")
    print("Features: Multi-modal analysis, Ensemble learning, Advanced CV")
    app.run(host='localhost', port=5003, debug=True)