import requests
import base64
from PIL import Image
import io

def test_vit_api():
    # Create a simple test image
    img = Image.new('RGB', (224, 224), color='red')
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    img_base64 = base64.b64encode(buffer.getvalue()).decode()
    
    try:
        # Test health endpoint
        health = requests.get('http://localhost:5002/health')
        print(f"Health check: {health.json()}")
        
        # Test analyze endpoint
        response = requests.post('http://localhost:5002/analyze', 
                               json={'image': img_base64})
        
        if response.ok:
            result = response.json()
            print(f"✓ ViT API working!")
            print(f"Category: {result['category']}")
            print(f"Description: {result['description']}")
            print(f"Image name: {result['image_name']}")
        else:
            print(f"✗ API Error: {response.text}")
            
    except Exception as e:
        print(f"✗ Connection Error: {e}")
        print("Make sure ViT server is running on port 5002")

if __name__ == "__main__":
    test_vit_api()