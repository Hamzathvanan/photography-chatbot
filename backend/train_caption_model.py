import torch
from transformers import VisionEncoderDecoderModel, ViTImageProcessor, AutoTokenizer, AdamW
from torch.utils.data import DataLoader, Dataset
from PIL import Image
from tqdm import tqdm
import os
from pathlib import Path
import json
import torch.multiprocessing as mp

# Set environment variables for dataset loading and timeouts
os.environ["HF_DATASETS_TIMEOUT"] = "6000"
os.environ["HF_DATASETS_OFFLINE"] = "1"
os.environ["TRANSFORMERS_OFFLINE"] = "1"
os.environ["HF_HUB_OFFLINE"] = "1"

# Set local paths for dataset
coco_path = Path("coco")  # Your local directory path

# Manually load the annotations and images from local directory
train_annotations = json.load(open(coco_path / "annotations" / "captions_train2017.json"))
val_annotations = json.load(open(coco_path / "annotations" / "captions_val2017.json"))

# Load pre-trained model components
vit_model_name = "google/vit-base-patch16-224-in21k"
feature_extractor = ViTImageProcessor.from_pretrained(vit_model_name)
model = VisionEncoderDecoderModel.from_pretrained("nlpconnect/vit-gpt2-image-captioning")
tokenizer = AutoTokenizer.from_pretrained("gpt2")

# Add pad_token to the tokenizer if it doesn't exist
if tokenizer.pad_token is None:
    tokenizer.pad_token = tokenizer.eos_token  # Using eos_token as pad_token

class COCODataset(Dataset):
    def __init__(self, annotations, image_folder, image_size=(224, 224)):
        self.annotations = annotations
        self.image_folder = image_folder
        self.image_size = image_size

    def __len__(self):
        return len(self.annotations)

    def __getitem__(self, idx):
        item = self.annotations[idx]
        image_id = item["image_id"]
        caption = item["caption"]

        # Load image with reduced memory footprint
        image_filename = f"{image_id:012d}.jpg"
        image_path = os.path.join(self.image_folder, image_filename)
        image = Image.open(image_path).convert("RGB").resize(self.image_size)

        # Process image using feature extractor
        pixel_values = feature_extractor(images=image, return_tensors="pt").pixel_values.squeeze()

        # Tokenize caption
        input_ids = tokenizer(caption, max_length=128, padding="max_length", truncation=True,
                              return_tensors="pt").input_ids.squeeze()

        return {
            "pixel_values": pixel_values.float(),  # Ensure float32
            "input_ids": input_ids
        }

def train_model():
    # Log: Start data preprocessing
    print("Preprocessing training and validation data...")

    # Process the dataset splits
    train_data = [{"image_id": item["image_id"], "caption": item["caption"]} for item in train_annotations["annotations"][:25000]]
    val_data = [{"image_id": item["image_id"], "caption": item["caption"]} for item in val_annotations["annotations"][:25000]]

    # Log: Finished data preprocessing
    print(f"Data preprocessing completed. Training samples: {len(train_data)}, Validation samples: {len(val_data)}")

    # Create memory-efficient datasets
    train_dataset = COCODataset(
        train_data,
        coco_path / "images/train2017/train2017"
    )
    val_dataset = COCODataset(
        val_data,
        coco_path / "images/val2017/val2017"
    )

    # Create DataLoader for training
    train_dataloader = DataLoader(
        train_dataset,
        batch_size=16,  # Experiment with smaller batch size to improve performance
        shuffle=True,
        num_workers=4,
        pin_memory=True,
        persistent_workers=True
    )

    val_dataloader = DataLoader(
        val_dataset,
        batch_size=16,  # Experiment with smaller batch size to improve performance
        num_workers=2,
        pin_memory=True
    )

    # Set up the optimizer
    optimizer = AdamW(model.parameters(), lr=5e-5)

    # Move model to device (CPU)
    device = torch.device("cpu")  # Use CPU
    model.to(device)

    # Log: Start training
    print("Starting training...")

    # Training loop without mixed precision (using float32)
    for epoch in range(5):
        model.train()
        total_loss = 0

        for batch in tqdm(train_dataloader, desc=f"Epoch {epoch + 1}"):

            # Transfer batch data to CPU
            pixel_values = batch["pixel_values"].to(device, non_blocking=True)
            input_ids = batch["input_ids"].to(device, non_blocking=True)

            optimizer.zero_grad(set_to_none=True)  # Reduce memory fragmentation

            # Forward pass
            outputs = model(pixel_values=pixel_values, labels=input_ids)
            loss = outputs.loss

            # Backpropagation
            loss.backward()
            optimizer.step()

            total_loss += loss.item()

            # Manual memory cleanup
            del pixel_values, input_ids, outputs
            torch.cuda.empty_cache()

        print(f"Epoch {epoch + 1} - Loss: {total_loss / len(train_dataloader)}")

        # Validation Step
        print(f"Evaluating model on validation set after epoch {epoch + 1}...")
        model.eval()  # Set model to evaluation mode

        total_val_loss = 0
        with torch.no_grad():
            for batch in tqdm(val_dataloader, desc=f"Validation Epoch {epoch + 1}"):
                pixel_values = batch["pixel_values"].to(device)
                input_ids = batch["input_ids"].to(device)

                # Forward pass
                outputs = model(pixel_values=pixel_values, labels=input_ids)
                val_loss = outputs.loss

                total_val_loss += val_loss.item()

                # Manual memory cleanup
                del pixel_values, input_ids, outputs
                torch.cuda.empty_cache()

        print(f"Validation loss after epoch {epoch + 1}: {total_val_loss / len(val_dataloader)}")

    # Log: End of training
    print("Training completed.")

    # Save the trained model
    model.save_pretrained("trained_caption_model")
    feature_extractor.save_pretrained("trained_caption_model")
    tokenizer.save_pretrained("trained_caption_model")

    # Log: Model saved
    print("Model saved successfully!")

if __name__ == "__main__":
    # Windows requires this block for safe multiprocessing
    mp.set_start_method('spawn', force=True)  # Set the start method to 'spawn' on Windows
    train_model()
