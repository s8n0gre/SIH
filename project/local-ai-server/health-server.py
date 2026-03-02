#!/usr/bin/env python3
"""
Simple health check server for AI services
Runs on port 5006 to provide basic health status
"""

from flask import Flask, jsonify
from flask_cors import CORS
import logging

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'service': 'AI Health Check',
        'port': 5006,
        'message': 'Health check service is running'
    })

@app.route('/', methods=['GET'])
def root():
    """Root endpoint"""
    return jsonify({
        'service': 'AI Health Check Server',
        'status': 'running',
        'endpoints': ['/health']
    })

if __name__ == '__main__':
    logger.info("Starting AI Health Check Server on port 5006...")
    app.run(host='0.0.0.0', port=5006, debug=False)