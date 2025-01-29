from flask import Flask, request, jsonify
from flask_cors import CORS
from chatbot_model import get_suggestions
from image_model import analyze_image

app = Flask(__name__)
CORS(app)

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
        suggestions = analyze_image(file)
        return jsonify({'image_suggestions': suggestions})
    return jsonify({'error': 'No file uploaded'}), 400

if __name__ == '__main__':
    app.run(debug=True)
