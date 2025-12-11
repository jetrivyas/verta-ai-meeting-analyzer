#!/usr/bin/env python3
"""
VERTA - AI Meeting Intelligence Platform
Fully Fixed Backend for Render Deployment
"""

import os
import json
import tempfile
import uuid
import time
import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename

# -----------------------------
# NEW REQUIRED IMPORT (YOU WERE MISSING THIS)
# -----------------------------
import google.generativeai as genai

# Configure Gemini key
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

# Enable CORS
CORS(app, resources={r"/*": {"origins": "*"}})

# Configuration
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB
ALLOWED_EXTENSIONS = {'mp3', 'wav', 'mp4', 'mov', 'avi', 'webm'}
UPLOAD_FOLDER = '/tmp/uploads'

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


def allowed_file(filename):
    """Validate extensions"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/')
def home():
    return jsonify({
        "service": "VERTA AI",
        "version": "1.0.1",
        "status": "running"
    })


@app.route('/health')
def health():
    return jsonify({
        "status": "healthy",
        "gemini_api_key_present": bool(os.getenv("GEMINI_API_KEY")),
        "timestamp": datetime.now().isoformat()
    })


# ------------------------------------------------------
# IMPORTANT: POLLING FUNCTION FOR GEMINI FILE PROCESSING
# ------------------------------------------------------
def wait_until_active(file_id):
    for _ in range(10):
        status = genai.get_file(file_id)
        if status.state == "ACTIVE":
            return True
        time.sleep(1)
    return False


# ------------------------------
# FILE UPLOAD ROUTE (WORKING)
# ------------------------------
@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files['file']

    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "Unsupported file format"}), 400

    file.seek(0, os.SEEK_END)
    size = file.tell()
    file.seek(0)

    if size > MAX_FILE_SIZE:
        return jsonify({"error": "File too large"}), 400

    filename = secure_filename(file.filename)
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)

    return jsonify({
        "status": "uploaded",
        "filename": filename,
        "path": filepath
    })


# -----------------------------------------------
# FIXED /analyze ROUTE — THIS WAS THE MAIN PROBLEM
# -----------------------------------------------
@app.route("/analyze", methods=["POST"])
def analyze():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files["file"]

        # Save temporary file locally
        ext = file.filename.split(".")[-1]
        temp_path = f"/tmp/verta_temp.{ext}"
        file.save(temp_path)

        # Upload file to Gemini
        uploaded_file = genai.upload_file(temp_path)

        # Wait until Gemini marks the file ACTIVE
        if not wait_until_active(uploaded_file.name):
            return jsonify({"error": "Gemini file processing timed out"}), 500

        # Run analysis
        model = genai.GenerativeModel("gemini-1.5-flash")

        prompt = "Analyze this meeting in detail and return structured JSON with segments, summary, sentiment, and action items."

        result = model.generate_content([
            prompt,
            {"file_id": uploaded_file.name}
        ])

        # Cleanup temporary file
        if os.path.exists(temp_path):
            os.remove(temp_path)

        return jsonify({"analysis": result.text})

    except Exception as e:
        logger.error(f"Analysis error: {e}")
        return jsonify({"error": str(e)}), 500


@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Not Found"}), 404


@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": "Server Error"}), 500


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
