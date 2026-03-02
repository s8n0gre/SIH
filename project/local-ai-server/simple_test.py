import os
import sys
from transformers import ViTImageProcessor, ViTForImageClassification

def test_local_model():
    model_path = os.path.abspath("../Google Vit")
    print(f"Testing model at: {model_path}")
    print(f"Path exists: {os.path.exists(model_path)}")
    
    if os.path.exists(model_path):
        files = os.listdir(model_path)
        print(f"Files in model directory: {files}")
        
        try:
            print("Loading processor...")
            processor = ViTImageProcessor.from_pretrained(model_path)
            print("Processor loaded successfully")
            
            print("Loading model...")
            model = ViTForImageClassification.from_pretrained(model_path)
            print("Model loaded successfully")
            
            print(f"Model config: {model.config.model_type}")
            print(f"Number of labels: {model.config.num_labels}")
            print("ViT model is working!")
            
        except Exception as e:
            print(f"Error: {e}")
    else:
        print("Model directory not found!")

if __name__ == "__main__":
    test_local_model()