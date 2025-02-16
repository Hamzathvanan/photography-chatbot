import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  useTheme
} from "@mui/material";
import {
  PhotoCamera,
  Brush,
  Subtitles,
  ChatBubble
} from "@mui/icons-material";

const ChoicePage = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const choices = [
    {
      title: "Analyze Image",
      icon: <PhotoCamera fontSize="large" />,
      color: theme.palette.error.main,
      path: "/image-model-analysis",
      desc: "Get detailed AI analysis of your photographs"
    },
    {
      title: "Edit Image",
      icon: <Brush fontSize="large" />,
      color: theme.palette.warning.main,
      path: "/edit-image",
      desc: "Enhance and modify your images with advanced tools"
    },
    {
      title: "Generate Caption",
      icon: <Subtitles fontSize="large" />,
      color: theme.palette.primary.main,
      path: "/image-caption-generator",
      desc: "Create engaging captions powered by AI"
    },
    {
      title: "Photo Assistant",
      icon: <ChatBubble fontSize="large" />,
      color: theme.palette.success.main,
      path: "/chat",
      desc: "24/7 AI-powered photography expert assistance"
    }
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(45deg, #1a1a1a 0%, #2a2a2a 100%)",
        py: 8
      }}
    >
      <Container>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            color: "white",
            textAlign: "center",
            mb: 8,
            fontWeight: 700,
            letterSpacing: 2,
            textShadow: "2px 2px 4px rgba(0,0,0,0.3)"
          }}
        >
          Photographer's Toolkit
          <Typography variant="subtitle1" color="textSecondary" sx={{ mt: 2, color: "#ccc" }}>
            AI-Powered Creative Suite
          </Typography>
        </Typography>

        <Grid container spacing={4}>
          {choices.map((choice, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.3s, box-shadow 0.3s",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: `0 12px 24px -12px ${choice.color}44`
                  },
                  background: "rgba(255,255,255,0.05)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 4
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: "center" }}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      background: `linear-gradient(45deg, ${choice.color} 0%, ${choice.color}99 100%)`,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mx: "auto",
                      mb: 3
                    }}
                  >
                    {React.cloneElement(choice.icon, {
                      sx: { color: "white", fontSize: 40 }
                    })}
                  </Box>
                  <Typography
                    variant="h5"
                    component="h2"
                    gutterBottom
                    sx={{ color: "white", fontWeight: 600 }}
                  >
                    {choice.title}
                  </Typography>
                  <Typography sx={{ color: "#ddd", mb: 2 }}>
                    {choice.desc}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: "center", pb: 3 }}>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate(choice.path)}
                    sx={{
                      color: "white",
                      borderColor: "rgba(255,255,255,0.3)",
                      "&:hover": {
                        background: `${choice.color}22`,
                        borderColor: choice.color,
                        transform: "scale(1.05)"
                      },
                      transition: "all 0.3s",
                      px: 4,
                      py: 1
                    }}
                  >
                    Get Started
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default ChoicePage;