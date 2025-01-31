import React, { useState } from "react";
import { Button, Typography, Container, Box } from "@mui/material";
import axios from "axios";

const ImageProcessingPage = () => {
  const [image, setImage] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
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
      const res = await axios.post("http://localhost:5000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMetadata(res.data.metadata);
      setSuggestions(res.data.image_suggestions);
      setLoading(false);
    } catch (err) {
      setError("Error uploading image. Please try again.");
      setLoading(false);
      console.error(err);
    }
  };

  return (
    <Container>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        textAlign="center"
      >
        <Typography variant="h4" gutterBottom>
          Upload an Image for Analysis
        </Typography>
        <input type="file" onChange={handleImageChange} />
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleSubmit}
          sx={{ margin: 2 }}
        >
          Analyze Image
        </Button>

        {loading && <Typography>Processing your image...</Typography>}
        {error && <Typography color="error">{error}</Typography>}

        {metadata && (
          <Box textAlign="left" sx={{ width: "100%", marginTop: 2 }}>
            <Typography variant="h6">Metadata:</Typography>
            <Typography
              variant="body1"
              sx={{
                whiteSpace: "pre-wrap",
                fontFamily: "monospace",
                backgroundColor: "#f5f5f5",
                padding: 2,
                borderRadius: 2,
                border: "1px solid #ddd",
              }}
            >
              {JSON.stringify(metadata, null, 2)}
            </Typography>
          </Box>
        )}

        {suggestions && (
          <Box textAlign="left" sx={{ width: "100%", marginTop: 2 }}>
            <Typography variant="h6">Suggestions:</Typography>
            <Typography
              variant="body1"
              sx={{
                whiteSpace: "pre-wrap",
                fontFamily: "Roboto",
                backgroundColor: "#f5f5f5",
                padding: 2,
                borderRadius: 2,
                border: "1px solid #ddd",
              }}
            >
              {suggestions}
            </Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default ImageProcessingPage;