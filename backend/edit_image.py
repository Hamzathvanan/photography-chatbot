from PIL import ImageEnhance, Image
import numpy as np

def apply_edits(image, edits):
    """Apply brightness, contrast, sharpness, saturation, exposure, and hue adjustments."""
    # Brightness, Contrast, Sharpness
    enhancer = ImageEnhance.Brightness(image)
    image = enhancer.enhance(edits.get('brightness', 1))

    enhancer = ImageEnhance.Contrast(image)
    image = enhancer.enhance(edits.get('contrast', 1))

    # Saturation Adjustment
    if 'saturation' in edits:
        saturation_enhancer = ImageEnhance.Color(image)
        image = saturation_enhancer.enhance(edits['saturation'])

    # Exposure Adjustment (simple linear scaling)
    if 'exposure' in edits:
        image = adjust_exposure(image, edits['exposure'])

    # Hue Rotation (using numpy to adjust the hue)
    if 'hue' in edits:
        image = adjust_hue(image, edits['hue'])

    # Vibrancy Adjustment (increasing saturation with vibrancy)
    if 'vibrancy' in edits:
        image = adjust_vibrancy(image, edits['vibrancy'])

    return image

def adjust_exposure(image, factor):
    """Adjust exposure (brightness scaling)."""
    enhancer = ImageEnhance.Brightness(image)
    return enhancer.enhance(factor)

def adjust_hue(image, hue_shift):
    """Adjust the hue of the image by rotating the hue channel."""
    image = np.array(image)
    image_hsv = Image.fromarray(image).convert("HSV")
    np_image_hsv = np.array(image_hsv)

    # Rotate hue values
    np_image_hsv[..., 0] = (np_image_hsv[..., 0] + hue_shift) % 360

    # Convert back to RGB
    image_hsv = Image.fromarray(np_image_hsv, "HSV")
    return image_hsv.convert("RGB")

def adjust_vibrancy(image, factor):
    """Increase the vibrancy (enhance saturation)"""
    enhancer = ImageEnhance.Color(image)
    return enhancer.enhance(factor)  # Increase saturation to add vibrancy
