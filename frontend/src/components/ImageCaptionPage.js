import React, { useState } from "react";
import { Button, Typography, Container, Box, Card, CircularProgress, Grid, IconButton, useTheme } from "@mui/material";
import axios from "axios";
import { Description, FileCopy, Image } from "@mui/icons-material";

const ImageCaptionPage = () => {
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const theme = useTheme();

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    const formData = new FormData();
    formData.append("image", image);

    try {
      const res = await axios.post("http://localhost:5000/generate_caption_and_hashtags", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setCaption(res.data.Instagram.Caption);
      setHashtags(res.data.Instagram.Hashtags);
      setLoading(false);
    } catch (err) {
      setError("Error generating caption and hashtags. Please try again.");
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Box sx={{ minHeight: "100vh", background: "linear-gradient(45deg, #1a1a1a 0%, #2a2a2a 100%)", py: 8 }}>
      <Container>
        <Box textAlign="center" sx={{ mb: 8 }}>
          <Typography variant="h3" sx={{ fontWeight: 700, background: "linear-gradient(45deg, #FF6B6B 0%, #4ECDC4 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", mb: 2 }}>
            Smart Caption Generator
          </Typography>
          <Typography variant="subtitle1" sx={{ color: "#ccc" }}>AI-powered caption and hashtag suggestions for your photos</Typography>
        </Box>

        <Card sx={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 4, p: 4, mb: 4 }}>
          <Box textAlign="center" sx={{ mb: 4 }}>
            <input type="file" onChange={handleImageChange} style={{ display: "none" }} id="image-upload-caption" />
            <label htmlFor="image-upload-caption">
              <Button variant="outlined" component="span" startIcon={<Image />}
                sx={{ color: "white", borderColor: "rgba(255,255,255,0.3)", '&:hover': { borderColor: theme.palette.primary.main } }}>
                Select Image
              </Button>
            </label>
          </Box>

          <Box textAlign="center">
            <Button variant="contained" onClick={handleSubmit} startIcon={<Description />}
              sx={{ background: "linear-gradient(45deg, #FF6B6B 0%, #4ECDC4 100%)", mb: 4 }}>
              {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Generate Caption"}
            </Button>
          </Box>

          {(caption || hashtags) && (
            <Grid container spacing={4} sx={{ mt: 2 }}>
              <Grid item xs={12} md={6}>
                <Card sx={{ background: "rgba(255,255,255,0.05)", p: 3, position: "relative" }}>
                  <Typography variant="h6" sx={{ color: "white", mb: 2 }}>
                    Caption
                    <IconButton onClick={() => copyToClipboard(caption)} sx={{ position: "absolute", right: 8, top: 8, color: theme.palette.primary.main }}>
                      <FileCopy fontSize="small" />
                    </IconButton>
                  </Typography>
                  <Typography variant="body1" sx={{ color: "#ddd" }}>{caption}</Typography>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ background: "rgba(255,255,255,0.05)", p: 3, position: "relative" }}>
                  <Typography variant="h6" sx={{ color: "white", mb: 2 }}>
                    Hashtags
                    <IconButton onClick={() => copyToClipboard(hashtags)} sx={{ position: "absolute", right: 8, top: 8, color: theme.palette.primary.main }}>
                      <FileCopy fontSize="small" />
                    </IconButton>
                  </Typography>
                  <Typography variant="body1" sx={{ color: "#ddd" }}>{hashtags}</Typography>
                </Card>
              </Grid>
            </Grid>
          )}

          {error && <Typography color="error" sx={{ mt: 3, textAlign: "center" }}>{error}</Typography>}
        </Card>
      </Container>
    </Box>
  );
};

export default ImageCaptionPage;