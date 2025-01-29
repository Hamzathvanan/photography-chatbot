import openai
from flask import Flask, request, jsonify
from flask_cors import CORS

from chatbot_model import get_suggestions
from image_model import analyze_image, extract_metadata

app = Flask(__name__)
CORS(app)

# Set up OpenAI API key
openai.api_key = "************************"  # You can also use environment variables for security


@app.route('/chatbot', methods=['POST'])
def chatbot():
    data = request.get_json()
    text_input = data.get('text', '')
    suggestions = get_suggestions(text_input)
    return jsonify({'suggestions': suggestions})


@app.route('/upload', methods=['POST'])
def upload_image():
    file = request.files['image']
    if file:
        # Extract metadata from the image
        metadata = extract_metadata(file)

        # Analyze image and provide suggestions based on content using CLIP and GPT
        image_suggestions = analyze_image(file)

        return jsonify({
            'metadata': metadata,
            'image_suggestions': image_suggestions
        })
    return jsonify({'error': 'No file uploaded'}), 400


if __name__ == '__main__':
    app.run(debug=True)
