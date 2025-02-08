import React, { useState, useRef, useEffect } from "react";
import { Button, Typography, Container, Box } from "@mui/material";
import axios from "axios";
import { fabric } from "fabric"; // Correct import for Fabric.js

const ImageEditingPage = () => {
  const [image, setImage] = useState(null);
  const [editedImage, setEditedImage] = useState(null);
  const [brightness, setBrightness] = useState(1);
  const [contrast, setContrast] = useState(1);
  const [sharpness, setSharpness] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const canvasRef = useRef(null);

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  useEffect(() => {
    if (image) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          const canvas = new fabric.Canvas(canvasRef.current);

          // Dynamically set the canvas width and height based on the image size
          canvas.setWidth(img.width);  // Set canvas width to image width
          canvas.setHeight(img.height); // Set canvas height to image height

          // Create a Fabric.js image instance
          const fabricImage = new fabric.Image(img);

          // Get the aspect ratio of the image
          const imgAspectRatio = img.width / img.height;
          const canvasAspectRatio = canvas.width / canvas.height;

          // Scale the image proportionally to fit the canvas without distortion
          let scaleX = 1;
          let scaleY = 1;

          if (imgAspectRatio > canvasAspectRatio) {
            // If the image is wider than the canvas, scale based on width
            scaleX = canvas.width / img.width;
            scaleY = scaleX; // Keep the aspect ratio
          } else {
            // If the image is taller than the canvas, scale based on height
            scaleY = canvas.height / img.height;
            scaleX = scaleY; // Keep the aspect ratio
          }

          // Apply the correct scale to the image
          fabricImage.scale(scaleX);

          // Clear any existing content and set the new background image
          canvas.clear();
          canvas.setBackgroundImage(fabricImage, canvas.renderAll.bind(canvas), {
            scaleX: scaleX,
            scaleY: scaleY,
          });
        };
      };
      reader.readAsDataURL(image);
    }
  }, [image]);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    // Create a new FormData instance
    const formData = new FormData();
    formData.append("image", image);

    // Append edits to FormData (this was missing before)
    formData.append("brightness", brightness);
    formData.append("contrast", contrast);
    formData.append("sharpness", sharpness);

    try {
      const res = await axios.post("http://localhost:5000/upload_and_edit", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setEditedImage(res.data.image);
      setLoading(false);
    } catch (err) {
      setError("Error uploading or editing image. Please try again.");
      setLoading(false);
      console.error("Error details:", err);  // Log the error for debugging
    }
  };

  const handleEditChange = (editType, value) => {
    if (editType === "brightness") setBrightness(value);
    if (editType === "contrast") setContrast(value);
    if (editType === "sharpness") setSharpness(value);
  };

  return (
    <Container>
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh" textAlign="center">
        <Typography variant="h4" gutterBottom>Upload an Image for Editing</Typography>
        {/* Image Upload */}
        <input type="file" onChange={handleImageChange} />
        <Button variant="contained" color="primary" size="large" onClick={handleSubmit} sx={{ margin: 2 }}>Edit Image</Button>

        {loading && <Typography>Processing your image...</Typography>}
        {error && <Typography color="error">{error}</Typography>}

        <Box sx={{ marginTop: 2 }}>
          <Typography>Brightness</Typography>
          <input type="range" min="0" max="2" step="0.1" value={brightness} onChange={(e) => handleEditChange("brightness", e.target.value)} />

          <Typography>Contrast</Typography>
          <input type="range" min="0" max="2" step="0.1" value={contrast} onChange={(e) => handleEditChange("contrast", e.target.value)} />

          <Typography>Sharpness</Typography>
          <input type="range" min="0" max="2" step="0.1" value={sharpness} onChange={(e) => handleEditChange("sharpness", e.target.value)} />
        </Box>

        <Box sx={{ marginTop: 4 }}>
          {/* Fabric.js canvas */}
          <canvas ref={canvasRef} style={{ border: "1px solid black" }} />
        </Box>

        {editedImage && (
          <Box sx={{ marginTop: 4 }}>
            <Typography variant="h6">Edited Image:</Typography>
            <img src={`data:image/png;base64,${editedImage}`} alt="Edited" />
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default ImageEditingPage;
