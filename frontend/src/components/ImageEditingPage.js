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
          // Create Fabric.js Canvas instance
          const canvas = new fabric.Canvas(canvasRef.current);  // Correct usage
          const fabricImage = new fabric.Image(img);  // Correct usage
          canvas.clear();
          // Use setBackgroundImage method to set the background image
          canvas.setBackgroundImage(fabricImage, canvas.renderAll.bind(canvas), {
            scaleX: canvas.width / fabricImage.width,
            scaleY: canvas.height / fabricImage.height,
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
          <canvas ref={canvasRef} width="500" height="500" style={{ border: "1px solid black" }} />
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
