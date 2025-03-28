import os

from PIL import ImageEnhance, Image
from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import bcrypt
import jwt
import datetime
import openai
import io
import base64
import torch
from flask_mail import Mail, Message
import random
import string

from transformers import VisionEncoderDecoderModel, ViTFeatureExtractor, AutoTokenizer

from send_mail import send_email
from edit_image import apply_edits
from chatbot_model import get_suggestions
from image_model import analyze_image, extract_metadata, use_own_model_for_suggestions
from chatbot_model import get_suggestions

app = Flask(__name__)
CORS(app)

# MySQL Database Configuration
db_config = {
    'host': 'localhost',
    'user': 'root',  # Replace with your MySQL username
    'password': 'MyNewPass',  # Replace with your MySQL password
    'database': 'photography_assistant'
}

# Secret key for JWT
app.config['SECRET_KEY'] = 'f1a7defed1e711f93945d63938381c9f0504874c2384d361cc491e2b2876bb3f8a247ad3c63aba2336086a3083d6b067d1a8679bd6c9418bec9ac62b6b964108d7300675e7093f60139105dd4b61246f14de2f4298ff28509e576fad8ae71e0ade7901b5120368f161aed95e14c51a6c5c6e188260bc0037127179b57bdc4c64bc7e61152b30812dd7be2edd95ec7a8f0deee3a137b7042ac9204876ac2e166299f857977605876f03aaeeda16c52c212d47cf52132e84919abf269749184363deb5f4131626fb7887049387e4c82a1b6ac5d36f7f4e6791385004d556159d118590947bc1d13b96a37de12840e3e0049b87ac139fbbbc6c405d70401abffe89'

# Set OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")
if not openai.api_key:
    raise ValueError("OpenAI API key not found. Please set the OPENAI_API_KEY environment variable.")

# Load the trained model and tokenizer
model = VisionEncoderDecoderModel.from_pretrained("trained_caption_model")
feature_extractor = ViTFeatureExtractor.from_pretrained("trained_caption_model")
tokenizer = AutoTokenizer.from_pretrained("trained_caption_model")

# Set up device (GPU or CPU)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

# Helper function to connect to MySQL
def get_db_connection():
    return mysql.connector.connect(**db_config)

# Helper function to hash passwords
def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

# Helper function to verify passwords
def verify_password(hashed_password, input_password):
    return bcrypt.checkpw(input_password.encode('utf-8'), hashed_password.encode('utf-8'))

# Helper function to generate JWT token
def generate_token(user_id):
    payload = {
        'user_id': user_id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)  # Token expires in 1 hour
    }
    return jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')


# Function to generate captions and hashtags
def generate_caption_and_hashtags(image_path):
    # Load and preprocess the image
    image = Image.open(image_path).convert("RGB")
    pixel_values = feature_extractor(images=image, return_tensors="pt").pixel_values.to(device)

    # Generate caption
    output_ids = model.generate(pixel_values, max_length=50, num_beams=4, early_stopping=True)
    caption = tokenizer.decode(output_ids[0], skip_special_tokens=True)

    # Generate hashtags (simplified version: take the first 10 words from the caption)
    hashtags = " ".join([f"#{word}" for word in caption.split()[:10]])

    return caption, hashtags

# Initialize Flask-Mail
mail = Mail(app)
mail.debug = True

# Email Configuration
app.config['MAIL_SERVER'] = 'smtp.gmail.com'  # or your email service provider
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False
app.config['MAIL_USERNAME'] = 'hamzathdeveloper@gmail.com'  # Add your email here
app.config['MAIL_PASSWORD'] = 'UthayHamzath@345'  # Add your email password here
app.config['MAIL_DEFAULT_SENDER'] = 'hamzathdeveloper@gmail.com'  # Set sender email

# Helper function to generate a random verification code
def generate_verification_code():
    return ''.join(random.choices(string.digits, k=6))  # 6-digit code

# Endpoint to register user and send verification email
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')

    if not username or not password or not email:
        return jsonify({'error': 'Username, password, and email are required'}), 400

    # Check if the email already exists in the database
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute('SELECT * FROM users WHERE email = %s', (email,))
        existing_user = cursor.fetchone()
        cursor.close()
        conn.close()

        if existing_user:
            return jsonify({'error': 'Email already exists'}), 400

        # Generate verification code
        verification_code = generate_verification_code()

        # Save the code in the database temporarily (for demo purposes)
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute('INSERT INTO email_verification (email, verification_code) VALUES (%s, %s)', (email, verification_code))
            conn.commit()
            cursor.close()
            conn.close()
        except Exception as e:
            return jsonify({'error': 'Error saving verification code'}), 500

        # Send verification email
        msg = Message('Your Verification Code', recipients=[email])
        msg.body = f'Your verification code is {verification_code}. Please use this code to complete your registration.'

        # Call the send_email function and get the response
        email_response = send_email(email, 'Your Verification Code', msg.body)

        # Return the response from the email sending function
        return email_response

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# Endpoint to verify email code
# Endpoint to verify email code
@app.route('/verify_email', methods=['POST'])
def verify_email():
    data = request.get_json()

    # Extract all required fields
    email = data.get('email')
    verification_code = data.get('verification_code')
    username = data.get('username')
    password = data.get('password')

    if not all([email, verification_code, username, password]):
        return jsonify({'error': 'All fields are required'}), 400

    try:
        # Check verification code
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            'SELECT * FROM email_verification WHERE email = %s AND verification_code = %s',
            (email, verification_code)
        )
        verification_entry = cursor.fetchone()
        cursor.close()
        conn.close()

        if verification_entry:
            # Create user with hashed password
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute(
                'INSERT INTO users (username, password, email) VALUES (%s, %s, %s)',
                (username, hash_password(password), email)
            )
            conn.commit()
            cursor.close()
            conn.close()
            return jsonify({'message': 'User registered successfully!'}), 201
        else:
            return jsonify({'error': 'Invalid verification code'}), 400

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# User Login Endpoint
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute('SELECT * FROM users WHERE username = %s', (username,))
        user = cursor.fetchone()
        cursor.close()
        conn.close()

        if user and verify_password(user['password'], password):
            token = generate_token(user['id'])
            return jsonify({'token': token, 'message': 'Login successful'}), 200
        else:
            return jsonify({'error': 'Invalid username or password'}), 401
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Image Upload Endpoint to use own model
@app.route('/upload_using_own_model', methods=['POST'])
def upload_using_own_model():
    if 'image' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    # Use the custom-trained model to get suggestions
    image_suggestions = use_own_model_for_suggestions(file)

    return jsonify({'image_suggestions': image_suggestions})

# Protected Route Example
@app.route('/protected', methods=['GET'])
def protected():
    token = request.headers.get('Authorization')

    if not token:
        return jsonify({'error': 'Token is missing'}), 401

    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        return jsonify({'message': f'Welcome, user {payload["user_id"]}'}), 200
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token has expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Invalid token'}), 401

# Chatbot Endpoint
@app.route('/chatbot', methods=['POST'])
def chatbot():
    data = request.get_json()
    text_input = data.get('text', '')
    suggestions = get_suggestions(text_input)
    return jsonify({'suggestions': suggestions})

# Image Upload Endpoint
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


# Image Upload and Editing Endpoint
@app.route('/upload_and_edit', methods=['POST'])
def upload_and_edit():
    # Check if an image was uploaded
    if 'image' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    # Get the image from the request
    image_file = request.files['image']
    image = Image.open(image_file)

    # Get edit parameters from the form data
    edits = {
        'brightness': float(request.form.get('brightness', 1)),
        'contrast': float(request.form.get('contrast', 1)),
        'saturation': float(request.form.get('saturation', 1)),
        'exposure': float(request.form.get('exposure', 1)),
        'hue': float(request.form.get('hue', 0)),
        'vibrancy': float(request.form.get('vibrancy', 1))  # Add vibrancy
    }

    # Apply the edits using the apply_edits function
    image = apply_edits(image, edits)

    # Save the edited image to a byte stream
    img_io = io.BytesIO()
    image.save(img_io, 'PNG')
    img_io.seek(0)

    # Encode the image to base64
    img_base64 = base64.b64encode(img_io.getvalue()).decode('utf-8')

    return jsonify({'image': img_base64})

# Endpoint to upload image and generate caption and hashtags
@app.route('/generate_caption_and_hashtags', methods=['POST'])
def generate_caption_and_hashtags_api():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    file = request.files['image']
    image_path = f"temp_{file.filename}"
    file.save(image_path)

    caption, hashtags = generate_caption_and_hashtags(image_path)

    return jsonify({
        "Instagram": {
            "Caption": caption,
            "Hashtags": hashtags
        },
        "Twitter": {
            "Caption": caption,
            "Hashtags": hashtags
        }
    })

if __name__ == '__main__':
    app.run(debug=True)
