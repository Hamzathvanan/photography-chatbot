import torch
from transformers import VisionEncoderDecoderModel, ViTImageProcessor, AutoTokenizer
from torch.utils.data import Dataset, DataLoader
from PIL import Image
import json
import torch.nn as nn
import torch.optim as optim
from sklearn.model_selection import train_test_split
import os
import io
import base64

# Set the path for the dataset
dataset_path = "collected_image_data.json"
train_data = []
validation_data = []

# Load the dataset from the JSON file
with open(dataset_path, "r") as file:
    data = json.load(file)

for entry in data:
    train_data.append((entry['image_data'], entry['suggestions']))  # Assuming the suggestions are the labels

# Split data into training and validation sets
train_data, val_data = train_test_split(train_data, test_size=0.2, random_state=42)


# Prepare the dataset and dataloader
class CustomDataset(Dataset):
    def __init__(self, data, tokenizer, feature_extractor):
        self.data = data
        self.tokenizer = tokenizer
        self.feature_extractor = feature_extractor

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        image_data, suggestion = self.data[idx]
        image = Image.open(io.BytesIO(base64.b64decode(image_data)))
        pixel_values = self.feature_extractor(images=image, return_tensors="pt").pixel_values.squeeze()

        # Tokenize the suggestions (labels)
        inputs = self.tokenizer(suggestion, padding="max_length", truncation=True, max_length=128, return_tensors="pt")
        labels = inputs.input_ids.squeeze()

        return {
            "pixel_values": pixel_values,
            "labels": labels
        }


# Set up tokenizer and feature extractor
model_name = "google/vit-base-patch16-224-in21k"
feature_extractor = ViTImageProcessor.from_pretrained(model_name)
tokenizer = AutoTokenizer.from_pretrained("gpt2")

# Add pad_token to the tokenizer if it doesn't exist
if tokenizer.pad_token is None:
    tokenizer.pad_token = tokenizer.eos_token  # Using eos_token as pad_token

# Create Dataset and DataLoader
train_dataset = CustomDataset(train_data, tokenizer, feature_extractor)
val_dataset = CustomDataset(val_data, tokenizer, feature_extractor)

train_dataloader = DataLoader(train_dataset, batch_size=16, shuffle=True)
val_dataloader = DataLoader(val_dataset, batch_size=16)

# Load model for fine-tuning
model = VisionEncoderDecoderModel.from_pretrained("nlpconnect/vit-gpt2-image-captioning")
model.to(torch.device("cuda" if torch.cuda.is_available() else "cpu"))

# Set up optimizer
optimizer = optim.AdamW(model.parameters(), lr=5e-5)

# Training Loop
for epoch in range(100):  # Adjust the number of epochs
    model.train()
    total_loss = 0
    for batch in train_dataloader:
        optimizer.zero_grad()

        pixel_values = batch['pixel_values'].to(torch.device("cuda" if torch.cuda.is_available() else "cpu"))
        labels = batch['labels'].to(torch.device("cuda" if torch.cuda.is_available() else "cpu"))

        outputs = model(pixel_values=pixel_values, labels=labels)
        loss = outputs.loss
        loss.backward()
        optimizer.step()

        total_loss += loss.item()

    print(f"Epoch {epoch + 1} - Training Loss: {total_loss / len(train_dataloader)}")

# Save the fine-tuned model
model.save_pretrained("my_fine_tuned_model")
feature_extractor.save_pretrained("my_fine_tuned_model")
tokenizer.save_pretrained("my_fine_tuned_model")
print("Model fine-tuned and saved successfully!")
