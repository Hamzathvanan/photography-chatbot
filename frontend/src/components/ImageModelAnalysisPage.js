import React, { useState } from "react";
import {
  Button,
  Typography,
  Container,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  useTheme
} from "@mui/material";
import axios from "axios";
import {
  PhotoCamera,
  Palette,
  Settings,
  Brush,
  Code,
  Camera,
  ExpandMore,
  Pets
} from "@mui/icons-material";

const ImageModelAnalysisPage = () => {
  const [image, setImage] = useState(null);
  const [analysis, setAnalysis] = useState({ content: null, type: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const theme = useTheme();

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
    setAnalysis({ content: null, type: null }); // Reset analysis on new image
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
      setAnalysis({
        content: res.data.image_suggestions,
        type: modelType === 'upload' ? 'gpt4' : 'custom'
      });
      setLoading(false);
    } catch (err) {
      setError("Error processing the image. Please try again.");
      setLoading(false);
    }
  };

  const parseAnalysis = (text) => {
    try {
      // Try parsing as JSON first (for custom model)
      try {
        const jsonData = JSON.parse(text);
        return Object.entries(jsonData).map(([title, content]) => ({
          title: title.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim(),
          content: typeof content === 'object' ?
            Object.entries(content).map(([k, v]) => `${k}: ${v}`) :
            [content.toString()]
        }));
      } catch (e) { /* Not JSON, continue with markdown parsing */ }

      // Parse markdown structure (for GPT-4)
      const sections = [];
      const lines = text.split('\n');
      let currentSection = null;

      lines.forEach(line => {
        const sectionMatch = line.match(/^##\s+(.+)/);
        if (sectionMatch) {
          if (currentSection) sections.push(currentSection);
          currentSection = {
            title: sectionMatch[1],
            content: []
          };
        } else if (currentSection) {
          const cleanedLine = line
            .replace(/^\s*[-*]\s*/, '')   // Remove list markers
            .replace(/\*\*/g, '')         // Remove bold markers
            .replace(/`/g, '')             // Remove code markers
            .trim();

          if (cleanedLine) {
            currentSection.content.push(cleanedLine);
          }
        }
      });

      if (currentSection) sections.push(currentSection);
      return sections.length > 0 ? sections : null;

    } catch (error) {
      return [{ title: "Analysis Results", content: text.split('\n').filter(line => line.trim()) }];
    }
  };

  const getSectionIcon = (title) => {
    const iconMap = {
      camera: <Camera fontSize="large" />,
      light: <Palette fontSize="large" />,
      composition: <Brush fontSize="large" />,
      processing: <Code fontSize="large" />,
      technical: <Settings fontSize="large" />,
      post: <Brush fontSize="large" />,
      default: <Settings fontSize="large" />
    };

    const lowerTitle = title.toLowerCase();
    return Object.entries(iconMap).find(([key]) => lowerTitle.includes(key))?.[1] || iconMap.default;
  };

  const parsedSections = analysis.content ? parseAnalysis(analysis.content) : null;

  return (
    <Box sx={{
      minHeight: "100vh",
      background: "linear-gradient(45deg, #1a1a1a 0%, #2a2a2a 100%)",
      py: 8
    }}>
      <Container>
        <Box sx={{ textAlign: "center", mb: 8, color: "white", position: "relative" }}>
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, letterSpacing: 2 }}>
            AI Image Analysis
            <Typography variant="subtitle1" sx={{ color: "#ccc", mt: 1 }}>
              Professional-grade Photography Insights
            </Typography>
          </Typography>

          {analysis.type && (
            <Chip
              label={`${analysis.type === 'gpt4' ? 'GPT-4' : 'Custom Model'} Analysis`}
              sx={{
                position: 'absolute',
                right: 0,
                top: 0,
                background: analysis.type === 'gpt4' ?
                  theme.palette.primary.main : theme.palette.secondary.main,
                color: 'white',
                fontWeight: 600
              }}
            />
          )}

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

        {parsedSections && (
          <Box sx={{ '& .MuiAccordion-root': { background: 'transparent', boxShadow: 'none' } }}>
            {parsedSections.map((section, index) => (
              <Accordion
                key={index}
                defaultExpanded
                sx={{
                  mb: 2,
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px !important',
                  '&:before': { display: 'none' }
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore sx={{ color: 'white' }} />}
                  sx={{
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '8px 8px 0 0'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{
                      width: 40,
                      height: 40,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2,
                      color: [
                        theme.palette.primary.main,
                        theme.palette.secondary.main,
                        theme.palette.error.main,
                        theme.palette.warning.main
                      ][index % 4]
                    }}>
                      {getSectionIcon(section.title)}
                    </Box>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                      {section.title}
                    </Typography>
                  </Box>
                </AccordionSummary>

                <AccordionDetails sx={{ pt: 0 }}>
                  <Box sx={{
                    maxHeight: 300,
                    overflowY: 'auto',
                    pr: 2,
                    '&::-webkit-scrollbar': { width: '6px' },
                    '&::-webkit-scrollbar-track': {
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: '4px'
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: theme.palette.primary.main,
                      borderRadius: '4px'
                    }
                  }}>
                    {section.content.map((item, i) => (
                      <Box
                        key={i}
                        sx={{
                          mb: 1.5,
                          p: 2,
                          background: 'rgba(255,255,255,0.03)',
                          borderRadius: 2,
                          borderLeft: `3px solid ${[
                            theme.palette.primary.main,
                            theme.palette.secondary.main,
                            theme.palette.error.main,
                            theme.palette.warning.main
                          ][index % 4]}`
                        }}
                      >
                        <Typography variant="body1" sx={{ color: '#ddd' }}>
                          {item.split(':').map((part, pi) => (
                            <span key={pi}>
                              {pi === 0 && <strong>{part}:</strong>}
                              {pi !== 0 && part}
                            </span>
                          ))}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default ImageModelAnalysisPage;