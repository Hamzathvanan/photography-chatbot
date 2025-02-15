import os
import openai
import base64
import requests
from PIL import Image, ExifTags
import io
import logging
from flask import Flask, request, jsonify
import json
import torch
from transformers import VisionEncoderDecoderModel, ViTFeatureExtractor, AutoTokenizer

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Set OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")
if not openai.api_key:
    raise ValueError("OpenAI API key not found. Please set the OPENAI_API_KEY environment variable.")

# Allowed image file extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp'}

# Initialize Flask app
app = Flask(__name__)

# Path to save the dataset
dataset_path = "collected_image_data.json"

# Load your fine-tuned model and tokenizer
model_path = "my_fine_tuned_model"
model = VisionEncoderDecoderModel.from_pretrained(model_path)
feature_extractor = ViTFeatureExtractor.from_pretrained(model_path)
tokenizer = AutoTokenizer.from_pretrained(model_path)

# Set up device (GPU or CPU)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

# Allowed image file extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp'}

def is_allowed_file(filename):
    """Check if the file has an allowed extension."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def encode_image(file):
    """Encode an image file to base64."""
    try:
        file.seek(0)  # Reset file pointer to the beginning

        # Save the uploaded file temporarily for debugging
        with open("debug_uploaded_file.png", "wb") as debug_file:
            debug_file.write(file.read())

        # Reset file pointer again
        file.seek(0)

        # Open and verify the image
        img = Image.open(file)
        img.verify()  # Verify the image (raises an exception if invalid)

        # Reopen the image after verification
        img = Image.open(file)
        img = img.convert("RGB")  # Convert to RGB to avoid format issues

        # Save the image to a BytesIO object in memory
        with io.BytesIO() as output:
            img.save(output, format='PNG')
            image_data = base64.b64encode(output.getvalue()).decode('utf-8')

        return image_data
    except Exception as e:
        logging.error(f"Error encoding image: {e}")
        return None

def analyze_image(file):
    """Analyze an image using OpenAI's GPT-4 Vision model."""
    try:
        if not is_allowed_file(file.filename):
            return "Unsupported file format. Please upload an image file."

        # Check MIME type
        if file.mimetype not in ['image/png', 'image/jpeg', 'image/gif', 'image/bmp']:
            return "Unsupported MIME type. Please upload a valid image file."

        # Encode the image to base64
        base64_image = encode_image(file)
        if base64_image is None:
            return "Error encoding image."

        # Prepare the payload for OpenAI API
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {openai.api_key}"
        }

        # Refined prompt to get detailed photography analysis
        prompt = """
        Analyze this photograph and provide detailed recommendations for replicating or improving it. Include the following:
        1. **Camera Settings**:
           - Lens: Recommend the type of lens (e.g., 50mm f/1.8) and focal length.
           - Aperture: Suggest the ideal f-stop for depth of field.
           - Shutter Speed: Recommend the shutter speed to freeze motion or create motion blur.
           - ISO: Suggest the ISO setting for proper exposure.
           - White Balance: Recommend the white balance setting for accurate colors.
        2. **Lighting Setup**:
           - Type of Light: Describe the lighting (e.g., natural, artificial).
           - Number of Lights: Suggest the number of light sources.
           - Placement: Recommend the placement of lights for optimal illumination.
        3. **Composition Techniques**:
           - Rule of Thirds: Explain how to use the rule of thirds.
           - Symmetry and Framing: Suggest how to frame the subject.
           - Leading Lines: Identify leading lines in the image.
           - Focus on Subjects: Explain how to keep the subject in focus.
        4. **Post-Processing**:
           - Color Grading: Suggest adjustments for colors and tones.
           - Brightness/Contrast: Recommend adjustments for brightness and contrast.
           - Motion Blur: Explain how to add or reduce motion blur.
           - Background Enhancement: Suggest ways to enhance the background.
        """

        payload = {
            "model": "gpt-4o",  # Correct model name
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": prompt
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/png;base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            "max_tokens": 500  # Increase max_tokens for detailed responses
        }

        # Send the request to OpenAI API
        response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)

        # Handle the response
        if response.status_code == 200:
            data = response.json()
            image_analysis = data['choices'][0]['message']['content']

            # Save the image data and GPT-4 response to the dataset
            save_data_to_dataset(base64_image, image_analysis)

            return image_analysis
        elif response.status_code == 429:
            return "API rate limit exceeded. Please try again later."
        elif response.status_code == 401:
            return "Invalid API key. Please check your OpenAI API key."
        else:
            return f"Error {response.status_code}: {response.text}"

    except Exception as e:
        logging.error(f"Error processing the image: {e}")
        return "Error generating suggestions. Please try again."

# New method to use the custom fine-tuned model for suggestions
def use_own_model_for_suggestions(file):
    """Use the custom fine-tuned model to generate image suggestions."""
    try:
        if not is_allowed_file(file.filename):
            return "Unsupported file format. Please upload an image file."

        # Encode the image to base64
        base64_image = encode_image(file)
        if base64_image is None:
            return "Error encoding image."

        # Open the image and preprocess it using the feature extractor
        image = Image.open(file).convert("RGB")
        pixel_values = feature_extractor(images=image, return_tensors="pt").pixel_values.to(device)

        # Generate the output from the model
        output_ids = model.generate(pixel_values, max_length=50, num_beams=4, early_stopping=True)
        caption = tokenizer.decode(output_ids[0], skip_special_tokens=True)

        return caption

    except Exception as e:
        logging.error(f"Error using the model: {e}")
        return "Error generating suggestions. Please try again."

# Method to save the collected image data and suggestions
def save_data_to_dataset(image_data, analysis_response):
    """Save image data and GPT-4 response to the dataset."""
    new_data = {
        "image_data": image_data,
        "suggestions": analysis_response
    }

    # Load existing dataset if available
    if os.path.exists(dataset_path):
        with open(dataset_path, "r") as file:
            dataset = json.load(file)
    else:
        dataset = []

    # Append new data to the dataset
    dataset.append(new_data)

    # Save updated dataset to file
    with open(dataset_path, "w") as file:
        json.dump(dataset, file, indent=4)

    logging.info(f"Data saved to dataset: {dataset_path}")

# Method to extract image metadata (EXIF)
def extract_metadata(file):
    """Extract metadata (EXIF data) from an image and convert it to a JSON-serializable format."""
    try:
        file.seek(0)  # Reset file pointer to the beginning
        image = Image.open(file)
        exif_data = image._getexif()
        metadata = {}

        if exif_data:
            for tag_id, value in exif_data.items():
                tag_name = ExifTags.TAGS.get(tag_id, tag_id)  # Get human-readable tag name

                # Convert IFDRational and other non-serializable types to strings
                if isinstance(value, bytes):
                    value = value.decode('utf-8', errors='replace')  # Decode bytes to string
                elif isinstance(value, (int, float, str)):
                    pass  # Already serializable
                else:
                    value = str(value)  # Convert other types to string

                metadata[tag_name] = value

        metadata['width'], metadata['height'] = image.size
        metadata['format'] = image.format

        return metadata

    except Exception as e:
        logging.error(f"Error extracting metadata: {e}")
        return {}