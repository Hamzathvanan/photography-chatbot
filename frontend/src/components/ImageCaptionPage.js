import React, { useState } from "react";
import { Button, Typography, Container, Box, TextField } from "@mui/material";
import axios from "axios";

const ImageCaptionPage = () => {
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  return (
    <Container>
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh" textAlign="center">
        <Typography variant="h4" gutterBottom>Upload an Image for Caption and Hashtags</Typography>
        <input type="file" onChange={handleImageChange} />
        <Button variant="contained" color="primary" size="large" onClick={handleSubmit} sx={{ margin: 2 }}>Generate Caption</Button>

        {loading && <Typography>Processing your image...</Typography>}
        {error && <Typography color="error">{error}</Typography>}

        {caption && (
          <Box sx={{ marginTop: 4 }}>
            <Typography variant="h6">Generated Caption:</Typography>
            <Typography variant="body1">{caption}</Typography>
            <Typography variant="h6">Generated Hashtags:</Typography>
            <Typography variant="body1">{hashtags}</Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default ImageCaptionPage;
