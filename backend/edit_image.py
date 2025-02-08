from PIL import ImageEnhance, Image


def apply_edits(image, edits):
    enhancer = ImageEnhance.Brightness(image)
    image = enhancer.enhance(edits.get('brightness', 1))

    enhancer = ImageEnhance.Contrast(image)
    image = enhancer.enhance(edits.get('contrast', 1))

    enhancer = ImageEnhance.Sharpness(image)
    image = enhancer.enhance(edits.get('sharpness', 1))

    return image