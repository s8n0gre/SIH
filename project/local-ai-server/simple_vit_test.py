from flask import Flask, jsonify
import os

app = Flask(__name__)

@app.route('/health')
def health():
    return jsonify({'status': 'online', 'message': 'Simple ViT test server running'})

@app.route('/analyze', methods=['POST'])
def analyze():
    return jsonify({
        'category': 'Roads & Infrastructure',
        'confidence': 0.85,
        'detected_issues': ['Test Issue'],
        'description': 'Test description from ViT server',
        'status': 'success'
    })

if __name__ == '__main__':
    print("🚀 Starting SIMPLE ViT Test Server on port 5002")
    app.run(host='localhost', port=5002, debug=True)