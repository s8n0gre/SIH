from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'online',
        'model': 'Simple AI Server',
        'gpu': False
    })

if __name__ == '__main__':
    print("Starting Simple AI Server on port 5000")
    app.run(host='localhost', port=5000, debug=True)