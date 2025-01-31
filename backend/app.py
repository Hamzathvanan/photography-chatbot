import os

import openai
from flask import Flask, request, jsonify
from flask_cors import CORS
from chatbot_model import get_suggestions
from image_model import analyze_image, extract_metadata

app = Flask(__name__)
CORS(app)

# Set OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")
if not openai.api_key:
    raise ValueError("OpenAI API key not found. Please set the OPENAI_API_KEY environment variable.")

@app.route('/chatbot', methods=['POST'])
def chatbot():
    data = request.get_json()
    text_input = data.get('text', '')
    suggestions = get_suggestions(text_input)
    return jsonify({'suggestions': suggestions})

@app.route('/upload', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    # Extract metadata from the image
    metadata = extract_metadata(file)

    # Analyze image and provide suggestions
    image_suggestions = analyze_image(file)

    return jsonify({
        'metadata': metadata,
        'image_suggestions': image_suggestions
    })

if __name__ == '__main__':
    app.run(debug=True)