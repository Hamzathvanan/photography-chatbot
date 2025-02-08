import React, { useState, useRef, useEffect } from "react";
import { Button, Typography, Container, Box } from "@mui/material";
import axios from "axios";
import { fabric } from "fabric"; // Correct import for Fabric.js

const ImageEditingPage = () => {
  const [image, setImage] = useState(null);
  const [editedImage, setEditedImage] = useState(null);
  const [brightness, setBrightness] = useState(1);
  const [contrast, setContrast] = useState(1);
  const [saturation, setSaturation] = useState(1);
  const [exposure, setExposure] = useState(1);
  const [hue, setHue] = useState(0);
  const [vibrancy, setVibrancy] = useState(1);  // New vibrancy adjustment
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const canvasRef = useRef(null);
  const fabricCanvas = useRef(null);  // To store the Fabric.js canvas instance

  const MAX_WIDTH = 800;  // Max width for the image and canvas
  const MAX_HEIGHT = 600; // Max height for the image and canvas

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
          fabricCanvas.current = canvas;

          // Set canvas size to fit the image within the max width and height
          const aspectRatio = img.width / img.height;
          let newWidth = img.width;
          let newHeight = img.height;

          // Scale the image to fit the canvas size
          if (img.width > MAX_WIDTH) {
            newWidth = MAX_WIDTH;
            newHeight = newWidth / aspectRatio;
          }
          if (newHeight > MAX_HEIGHT) {
            newHeight = MAX_HEIGHT;
            newWidth = newHeight * aspectRatio;
          }

          canvas.setWidth(newWidth);  // Set canvas width to the new width
          canvas.setHeight(newHeight); // Set canvas height to the new height

          // Create a Fabric.js image instance
          const fabricImage = new fabric.Image(img);
          fabricImage.scaleToWidth(newWidth);
          fabricImage.scaleToHeight(newHeight);

          // Apply the correct scale to the image
          canvas.clear();
          canvas.setBackgroundImage(fabricImage, canvas.renderAll.bind(canvas));

          // Store the image instance for further manipulation
          canvas.backgroundImage = fabricImage;
        };
      };
      reader.readAsDataURL(image);
    }
  }, [image]);

  const applyEditsToCanvas = () => {
    if (!fabricCanvas.current) return;

    const canvas = fabricCanvas.current;
    let fabricImage = canvas.backgroundImage;

    // Apply each edit effect to the Fabric.js image
    fabricImage.filters = [];

    // Brightness
    fabricImage.filters.push(new fabric.Image.filters.Brightness({
      brightness: brightness - 1,
    }));

    // Contrast
    fabricImage.filters.push(new fabric.Image.filters.Contrast({
      contrast: contrast - 1,
    }));

    // Saturation
    fabricImage.filters.push(new fabric.Image.filters.Saturation({
      saturation: saturation - 1,
    }));

    // Exposure (just brightness for simplicity)
    fabricImage.filters.push(new fabric.Image.filters.Brightness({
      brightness: exposure - 1,
    }));

    // Hue - Workaround for Hue adjustment
    fabricImage.filters.push(new fabric.Image.filters.HueRotation({
      angle: hue,
    }));

    // Vibrancy adjustment (replace sharpness with vibrancy)
    fabricImage.filters.push(new fabric.Image.filters.Saturation({
      saturation: vibrancy - 1,  // Add vibrancy as a saturation increase
    }));

    // Apply all filters to the image
    fabricImage.applyFilters();
    canvas.renderAll();
  };

  const handleEditChange = (editType, value) => {
    if (editType === "brightness") setBrightness(value);
    if (editType === "contrast") setContrast(value);
    if (editType === "saturation") setSaturation(value);
    if (editType === "exposure") setExposure(value);
    if (editType === "hue") setHue(value);
    if (editType === "vibrancy") setVibrancy(value);  // For vibrancy slider

    // Apply the edits to the canvas in real-time
    applyEditsToCanvas();
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    // Create a new FormData instance
    const formData = new FormData();
    formData.append("image", image);

    // Append edits to FormData
    formData.append("brightness", brightness);
    formData.append("contrast", contrast);
    formData.append("saturation", saturation);
    formData.append("exposure", exposure);
    formData.append("hue", hue);
    formData.append("vibrancy", vibrancy); // Vibrancy

    try {
      const res = await axios.post("http://localhost:5000/upload_and_edit", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setEditedImage(res.data.image);
      setLoading(false);
    } catch (err) {
      setError("Error uploading or editing image. Please try again.");
      setLoading(false);
      console.error("Error details:", err);
    }
  };

  const downloadImage = () => {
    const link = document.createElement("a");
    link.href = `data:image/png;base64,${editedImage}`;
    link.download = "edited-image.png";
    link.click();
  };

  const resetChanges = () => {
    setBrightness(1);
    setContrast(1);
    setSaturation(1);
    setExposure(1);
    setHue(0);
    setVibrancy(1);  // Reset vibrancy

    // Reset the applied filters on the image and re-render
    if (fabricCanvas.current) {
      const canvas = fabricCanvas.current;
      let fabricImage = canvas.backgroundImage;

      // Remove all the applied filters
      fabricImage.filters = [];

      // Re-apply the original scale (if needed)
      fabricImage.scaleToWidth(canvas.width);
      fabricImage.scaleToHeight(canvas.height);

      // Re-render the canvas
      fabricImage.applyFilters();
      canvas.renderAll();
    }
  };

  return (
    <Container>
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh"
           textAlign="center">
        <Typography variant="h4" gutterBottom>Upload an Image for Editing</Typography>
        {/* Image Upload */}
        <input type="file" onChange={handleImageChange}/>
        <Button variant="contained" color="primary" size="large" onClick={handleSubmit} sx={{margin: 2}}>Apply
          Edits</Button>

        {loading && <Typography>Processing your image...</Typography>}
        {error && <Typography color="error">{error}</Typography>}

        <Box sx={{marginTop: 2}}>
          <Typography>Brightness</Typography>
          <input type="range" min="0" max="2" step="0.1" value={brightness}
                 onChange={(e) => handleEditChange("brightness", e.target.value)}/>

          <Typography>Contrast</Typography>
          <input type="range" min="0" max="2" step="0.1" value={contrast}
                 onChange={(e) => handleEditChange("contrast", e.target.value)}/>

          <Typography>Saturation</Typography>
          <input type="range" min="0" max="2" step="0.1" value={saturation}
                 onChange={(e) => handleEditChange("saturation", e.target.value)}/>

          <Typography>Exposure</Typography>
          <input type="range" min="0" max="2" step="0.1" value={exposure}
                 onChange={(e) => handleEditChange("exposure", e.target.value)}/>

          <Typography>Hue</Typography>
          <input type="range" min="-180" max="180" step="1" value={hue}
                 onChange={(e) => handleEditChange("hue", e.target.value)}/>

          <Typography>Vibrancy</Typography>
          <input type="range" min="0" max="2" step="0.1" value={vibrancy}
                 onChange={(e) => handleEditChange("vibrancy", e.target.value)}/>
        </Box>

        <Box sx={{marginTop: 4}}>
          {/* Fabric.js canvas */}
          <canvas ref={canvasRef} style={{border: "1px solid black"}}/>
        </Box>

        {editedImage && (
          <Box sx={{marginTop: 4}}>
            <Typography variant="h6">Edited Image:</Typography>
            <img src={`data:image/png;base64,${editedImage}`} alt="Edited"/>
          </Box>
        )}

        <Box sx={{marginTop: 4}}>
          <Button variant="contained" color="secondary" onClick={downloadImage}>Download Image</Button>
          <Button variant="outlined" color="secondary" onClick={resetChanges} sx={{marginLeft: 2}}>Reset
            Changes</Button>
        </Box>
      </Box>
    </Container>
  );
};

export default ImageEditingPage;
