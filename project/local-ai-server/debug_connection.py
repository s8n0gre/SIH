import requests
import json

def check_servers():
    servers = [
        ("ViT Server", "http://localhost:5002/health"),
        ("CLIP Server", "http://localhost:5001/health"), 
        ("LLaMA Server", "http://localhost:5000/health")
    ]
    
    for name, url in servers:
        try:
            response = requests.get(url, timeout=3)
            if response.ok:
                print(f"✓ {name}: ONLINE")
                print(f"  Response: {response.json()}")
            else:
                print(f"✗ {name}: ERROR {response.status_code}")
        except Exception as e:
            print(f"✗ {name}: OFFLINE ({e})")
        print()

if __name__ == "__main__":
    check_servers()