import React, { useState, useRef, useEffect } from "react";
import {
  Button,
  Typography,
  Container,
  Box,
  Slider,
  Grid,
  Card,
  CircularProgress,
  useTheme
} from "@mui/material";
import axios from "axios";
import { fabric } from "fabric";
import { Download, Refresh, Adjust } from "@mui/icons-material";

const ImageEditingPage = () => {
  const [image, setImage] = useState(null);
  const [editedImage, setEditedImage] = useState(null);
  const [brightness, setBrightness] = useState(1);
  const [contrast, setContrast] = useState(1);
  const [saturation, setSaturation] = useState(1);
  const [exposure, setExposure] = useState(1);
  const [hue, setHue] = useState(0);
  const [vibrancy, setVibrancy] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const canvasRef = useRef(null);
  const fabricCanvas = useRef(null);
  const theme = useTheme();

  const MAX_WIDTH = 800;
  const MAX_HEIGHT = 600;

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

          const aspectRatio = img.width / img.height;
          let newWidth = img.width;
          let newHeight = img.height;

          if (img.width > MAX_WIDTH) {
            newWidth = MAX_WIDTH;
            newHeight = newWidth / aspectRatio;
          }
          if (newHeight > MAX_HEIGHT) {
            newHeight = MAX_HEIGHT;
            newWidth = newHeight * aspectRatio;
          }

          canvas.setWidth(newWidth);
          canvas.setHeight(newHeight);

          const fabricImage = new fabric.Image(img);
          fabricImage.scaleToWidth(newWidth);
          fabricImage.scaleToHeight(newHeight);

          canvas.clear();
          canvas.setBackgroundImage(fabricImage, canvas.renderAll.bind(canvas));
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

    fabricImage.filters = [];
    fabricImage.filters.push(new fabric.Image.filters.Brightness({ brightness: brightness - 1 }));
    fabricImage.filters.push(new fabric.Image.filters.Contrast({ contrast: contrast - 1 }));
    fabricImage.filters.push(new fabric.Image.filters.Saturation({ saturation: saturation - 1 }));
    fabricImage.filters.push(new fabric.Image.filters.Brightness({ brightness: exposure - 1 }));
    fabricImage.filters.push(new fabric.Image.filters.HueRotation({ angle: hue }));
    fabricImage.filters.push(new fabric.Image.filters.Saturation({ saturation: vibrancy - 1 }));

    fabricImage.applyFilters();
    canvas.renderAll();
  };

  const handleEditChange = (editType, value) => {
    if (editType === "brightness") setBrightness(value);
    if (editType === "contrast") setContrast(value);
    if (editType === "saturation") setSaturation(value);
    if (editType === "exposure") setExposure(value);
    if (editType === "hue") setHue(value);
    if (editType === "vibrancy") setVibrancy(value);
    applyEditsToCanvas();
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    const formData = new FormData();
    formData.append("image", image);
    formData.append("brightness", brightness);
    formData.append("contrast", contrast);
    formData.append("saturation", saturation);
    formData.append("exposure", exposure);
    formData.append("hue", hue);
    formData.append("vibrancy", vibrancy);

    try {
      const res = await axios.post("http://localhost:5000/upload_and_edit", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setEditedImage(res.data.image);
      setLoading(false);
    } catch (err) {
      setError("Error uploading or editing image. Please try again.");
      setLoading(false);
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
    setVibrancy(1);
    if (fabricCanvas.current) {
      const canvas = fabricCanvas.current;
      let fabricImage = canvas.backgroundImage;
      fabricImage.filters = [];
      fabricImage.applyFilters();
      canvas.renderAll();
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", background: "linear-gradient(45deg, #1a1a1a 0%, #2a2a2a 100%)", py: 8 }}>
      <Container>
        <Box textAlign="center" sx={{ mb: 8 }}>
          <Typography variant="h3" sx={{ fontWeight: 700, background: "linear-gradient(45deg, #FF6B6B 0%, #4ECDC4 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", mb: 2 }}>
            Advanced Image Editor
          </Typography>
          <Typography variant="subtitle1" sx={{ color: "#ccc" }}>Professional-grade photo editing tools powered by AI</Typography>
        </Box>

        <Card sx={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 4, p: 4, mb: 4 }}>
          <Box textAlign="center" sx={{ mb: 4 }}>
            <input type="file" onChange={handleImageChange} style={{ display: "none" }} id="image-upload-edit" />
            <label htmlFor="image-upload-edit">
              <Button variant="outlined" component="span" startIcon={<Adjust />} sx={{ color: "white", borderColor: "rgba(255,255,255,0.3)", '&:hover': { borderColor: theme.palette.primary.main } }}>
                Select Image
              </Button>
            </label>
          </Box>

          {image && (
            <Grid container spacing={4}>
              <Grid item xs={12} md={8}>
                <Box sx={{ border: "2px solid rgba(255,255,255,0.1)", borderRadius: 2, overflow: "hidden", background: "rgba(0,0,0,0.3)" }}>
                  <canvas ref={canvasRef} style={{ width: "100%", height: "auto" }} />
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box sx={{ color: "white" }}>
                  <Typography variant="h6" sx={{ mb: 3 }}>Adjustments</Typography>
                  {[
                    { label: "Brightness", value: brightness, min: 0, max: 2, step: 0.1 },
                    { label: "Contrast", value: contrast, min: 0, max: 2, step: 0.1 },
                    { label: "Saturation", value: saturation, min: 0, max: 2, step: 0.1 },
                    { label: "Exposure", value: exposure, min: 0, max: 2, step: 0.1 },
                    { label: "Hue", value: hue, min: -180, max: 180, step: 1 },
                    { label: "Vibrancy", value: vibrancy, min: 0, max: 2, step: 0.1 }
                  ].map((adjustment, index) => (
                    <Box key={index} sx={{ mb: 3 }}>
                      <Typography variant="body2" sx={{ mb: 1 }}>{adjustment.label}: {adjustment.value.toFixed(1)}</Typography>
                      <Slider value={adjustment.value} min={adjustment.min} max={adjustment.max} step={adjustment.step}
                        onChange={(e) => handleEditChange(adjustment.label.toLowerCase(), e.target.value)}
                        sx={{ color: [theme.palette.error.main, theme.palette.warning.main, theme.palette.primary.main, theme.palette.success.main][index % 4], height: 8 }} />
                    </Box>
                  ))}

                  <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                    <Button variant="contained" onClick={handleSubmit} startIcon={<Adjust />}
                      sx={{ background: "linear-gradient(45deg, #FF6B6B 0%, #4ECDC4 100%)", flex: 1 }}>
                      {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Apply Edits"}
                    </Button>
                    <Button variant="outlined" onClick={resetChanges} startIcon={<Refresh />}
                      sx={{ color: "white", borderColor: "rgba(255,255,255,0.3)" }}>Reset</Button>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          )}

          {editedImage && (
            <Box sx={{ mt: 6, textAlign: "center" }}>
              <Typography variant="h6" sx={{ mb: 2, color: "white" }}>Final Result</Typography>
              <Card sx={{ p: 2, background: "rgba(255,255,255,0.05)", display: "inline-block" }}>
                <img src={`data:image/png;base64,${editedImage}`} alt="Edited" style={{ maxWidth: "100%", borderRadius: 8 }} />
              </Card>
              <Button variant="contained" onClick={downloadImage} startIcon={<Download />}
                sx={{ mt: 3, background: "linear-gradient(45deg, #FF6B6B 0%, #4ECDC4 100%)" }}>Download Image</Button>
            </Box>
          )}

          {error && <Typography color="error" sx={{ mt: 3, textAlign: "center" }}>{error}</Typography>}
        </Card>
      </Container>
    </Box>
  );
};

export default ImageEditingPage;