import React, { useState } from "react";
import { Button, Typography, Container, Box, TextField, Card, CardContent, CircularProgress } from "@mui/material";
import axios from "axios";

const ImageModelAnalysisPage = () => {
  const [image, setImage] = useState(null);
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (modelType) => {
    setLoading(true);
    setError("");
    const formData = new FormData();
    formData.append("image", image);

    try {
      const res = await axios.post(`http://localhost:5000/${modelType}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setAnalysis(res.data.image_suggestions);
      setLoading(false);
    } catch (err) {
      setError("Error processing the image. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Container>
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh" textAlign="center">
        <Typography variant="h4" gutterBottom>
          Upload an Image for Model-Based Analysis
        </Typography>

        <input type="file" onChange={handleImageChange} style={{ marginBottom: "20px" }} />
        <Button variant="contained" color="primary" size="large" onClick={() => handleSubmit('upload')} sx={{ margin: 2 }}>
          Analyze Image (GPT-4)
        </Button>
        <Button variant="contained" color="secondary" size="large" onClick={() => handleSubmit('upload_using_own_model')} sx={{ margin: 2 }}>
          Analyze Image (Custom Model)
        </Button>

        {loading && <CircularProgress />}

        {error && <Typography color="error">{error}</Typography>}

        {analysis && (
          <Card sx={{ maxWidth: 800, marginTop: 4 }}>
            <CardContent>
              <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", fontFamily: "Roboto", padding: 2 }}>
                {analysis}
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>
    </Container>
  );
};

export default ImageModelAnalysisPage;
