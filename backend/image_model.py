import tensorflow as tf
from PIL import Image
import numpy as np

# Load pre-trained CNN model (e.g., MobileNetV2)
model = tf.keras.applications.MobileNetV2(weights='imagenet')

def analyze_image(file):
    image = Image.open(file)
    image = image.resize((224, 224))
    image = np.array(image)
    image = tf.keras.applications.mobilenet_v2.preprocess_input(image)
    image = np.expand_dims(image, axis=0)

    predictions = model.predict(image)
    decoded_predictions = tf.keras.applications.mobilenet_v2.decode_predictions(predictions, top=3)[0]

    suggestions = []
    for _, label, score in decoded_predictions:
        suggestions.append(f"Suggested setting: {label} with confidence {score:.2f}")
    return suggestions
