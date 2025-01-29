import openai
import torch
from CLIP import clip
from PIL import Image
import io

# Load the CLIP model and preprocess function
device = "cuda" if torch.cuda.is_available() else "cpu"
model, preprocess = clip.load("ViT-B/32", device)

# Function to analyze the image and generate photography tips
def analyze_image(file):
    try:
        # Open the image and preprocess it for CLIP
        image = Image.open(file)
        image_input = preprocess(image).unsqueeze(0).to(device)

        # Get the image features from CLIP
        with torch.no_grad():
            image_features = model.encode_image(image_input)

        # Normalize the features to compare with text descriptions later
        image_features /= image_features.norm(dim=-1, keepdim=True)

        # Creating a more detailed description based on the image features
        description_prompt = "Describe the key features of this image in photography-related terms (lighting, mood, composition, scene type)."

        # Create a prompt to get detailed camera settings and composition suggestions
        prompt = f"""
        You are a professional photographer. Based on this image description: "{description_prompt}",
        provide the following suggestions:
        1. Camera Settings (Lens, Aperture, Shutter Speed, ISO, White Balance)
        2. Lighting Setup (Type of Light, Number of Lights, Placement)
        3. Composition Techniques (Rule of Thirds, Symmetry, Leading Lines)
        4. Additional Considerations (Post-Processing, Motion Blur, etc.)

        Please provide specific lens models, aperture ranges, shutter speeds, ISO values, and specific lighting setups. Your recommendations should also include any tips for capturing similar or better results in the future.
        """

        # Use GPT-4/3.5 to generate the recommendations
        suggestions = openai.ChatCompletion.create(
            model="gpt-4",  # Or use "gpt-3.5-turbo" based on availability
            messages=[
                {"role": "system", "content": "You are an expert photographer."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=350,  # Allow for detailed suggestions
            temperature=0.7  # Adjust for creativity
        )

        # Return the formatted suggestions
        return suggestions['choices'][0]['message']['content'].strip()

    except Exception as e:
        print(f"Error processing the image: {e}")
        return "Error generating suggestions. Please try again."

# Function to extract metadata from the image (for further analysis)
def extract_metadata(file):
    try:
        # Extract metadata (EXIF data) using PIL
        image = Image.open(file)
        exif_data = image._getexif()  # Extract EXIF data (metadata)

        metadata = {}

        if exif_data:
            for tag, value in exif_data.items():
                metadata[tag] = value

        # Include other metadata like dimensions, format
        metadata['width'], metadata['height'] = image.size
        metadata['format'] = image.format

        return metadata

    except Exception as e:
        print(f"Error extracting metadata: {e}")
        return {}

