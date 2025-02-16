import React, { useState } from "react";
import {
  Button,
  Typography,
  Container,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  useTheme
} from "@mui/material";
import axios from "axios";
import { PhotoCamera, Palette, Settings, Brush, Code, Pets, Camera } from "@mui/icons-material";

const ImageModelAnalysisPage = () => {
  const [image, setImage] = useState(null);
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const theme = useTheme();

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

  const parseAnalysis = (text) => {
    try {
      const sectionRegex = /(\d+\.?)\s*(\*{2}(.*?)\*{2}:|\#{3}\s*(.*?)\n)/g;
      const sections = [];
      let lastIndex = 0;
      let match;

      while ((match = sectionRegex.exec(text)) !== null) {
        const title = match[3] || match[4];
        if (title) {
          const endIndex = sectionRegex.lastIndex;
          const nextMatch = sectionRegex.exec(text);
          const contentEnd = nextMatch ? nextMatch.index : text.length;
          sectionRegex.lastIndex = endIndex;

          const content = text.slice(endIndex, contentEnd)
            .split('\n')
            .filter(line => line.trim())
            .map(line => line.replace(/^- \*\*(.*?)\*\*:?/, '$1').trim());

          sections.push({
            title: title.trim(),
            content: content.filter(item => item)
          });
        }
      }

      return sections.length > 0 ? sections : [{
        title: "Analysis Results",
        content: text.split('\n').filter(line => line.trim())
      }];
    } catch (error) {
      return [{
        title: "Analysis Results",
        content: text.split('\n').filter(line => line.trim())
      }];
    }
  };

  const getSectionIcon = (title) => {
    const section = title.toLowerCase();
    if (section.includes('camera')) return <Camera fontSize="large" />;
    if (section.includes('light')) return <Palette fontSize="large" />;
    if (section.includes('composition')) return <Brush fontSize="large" />;
    if (section.includes('processing')) return <Code fontSize="large" />;
    return <Settings fontSize="large" />;
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(45deg, #1a1a1a 0%, #2a2a2a 100%)",
        py: 8
      }}
    >
      <Container>
        <Box
          sx={{
            textAlign: "center",
            mb: 8,
            color: "white"
          }}
        >
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, letterSpacing: 2 }}>
            AI Image Analysis
            <Typography variant="subtitle1" sx={{ color: "#ccc", mt: 1 }}>
              Professional-grade Photography Insights
            </Typography>
          </Typography>

          <Card sx={{
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 4,
            p: 3,
            mb: 4
          }}>
            <input
              type="file"
              onChange={handleImageChange}
              style={{ display: "none" }}
              id="image-upload"
              accept="image/*"
            />
            <label htmlFor="image-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<PhotoCamera />}
                sx={{
                  color: "white",
                  borderColor: "rgba(255,255,255,0.3)",
                  mb: 2,
                  "&:hover": {
                    borderColor: theme.palette.primary.main
                  }
                }}
              >
                Select Image
              </Button>
            </label>
            {image && (
              <Typography variant="body2" sx={{ color: "#ddd", mb: 2 }}>
                Selected: {image.name}
              </Typography>
            )}

            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleSubmit('upload')}
                sx={{ mx: 1, borderRadius: 2, minWidth: 200 }}
                startIcon={<Pets />}
              >
                GPT-4 Analysis
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => handleSubmit('upload_using_own_model')}
                sx={{ mx: 1, borderRadius: 2, minWidth: 200 }}
                startIcon={<Camera />}
              >
                Custom Model
              </Button>
            </Box>
          </Card>

          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <CircularProgress sx={{ color: theme.palette.primary.main }} />
            </Box>
          )}

          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
        </Box>

        {analysis && (
          <Grid container spacing={4}>
            {parseAnalysis(analysis).map((section, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card sx={{
                  background: "rgba(255,255,255,0.05)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 4,
                  transition: "transform 0.3s",
                  "&:hover": {
                    transform: "translateY(-5px)"
                  }
                }}>
                  <CardContent>
                    <Box sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 2,
                      color: [
                        theme.palette.error.main,
                        theme.palette.warning.main,
                        theme.palette.primary.main,
                        theme.palette.success.main
                      ][index % 4]
                    }}>
                      {getSectionIcon(section.title)}
                      <Typography variant="h5" component="div" sx={{ ml: 1.5, fontWeight: 600 }}>
                        {section.title}
                      </Typography>
                    </Box>

                    <Box sx={{
                      maxHeight: 400,
                      overflowY: 'auto',
                      pr: 2,
                      '&::-webkit-scrollbar': {
                        width: '6px',
                      },
                      '&::-webkit-scrollbar-track': {
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '4px',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: theme.palette.primary.main,
                        borderRadius: '4px',
                      }
                    }}>
                      {section.content.map((item, i) => (
                        <Box key={i} sx={{
                          mb: 1.5,
                          p: 2,
                          background: 'rgba(255,255,255,0.03)',
                          borderRadius: 2,
                          borderLeft: `3px solid ${[
                            theme.palette.error.main,
                            theme.palette.warning.main,
                            theme.palette.primary.main,
                            theme.palette.success.main
                          ][index % 4]}`
                        }}>
                          <Typography variant="body1" sx={{
                            color: '#ddd',
                            '& strong': {
                              color: theme.palette.primary.light
                            }
                          }}>
                            {item.split(':').map((part, pi) =>
                              pi === 0 ? <strong key={pi}>{part}</strong> : part
                            )}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default ImageModelAnalysisPage;