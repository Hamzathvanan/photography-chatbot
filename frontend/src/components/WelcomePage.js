import React from "react";
import { Button, Typography, Container, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { RocketLaunch } from "@mui/icons-material";

const WelcomePage = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(45deg, #1a1a1a 0%, #2a2a2a 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          width: "400px",
          height: "400px",
          background: "linear-gradient(45deg, #FF6B6B 0%, #4ECDC4 100%)",
          borderRadius: "50%",
          filter: "blur(100px)",
          opacity: 0.1,
          zIndex: 0,
        }
      }}
    >
      <Container>
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Typography
            variant="h2"
            gutterBottom
            sx={{
              fontWeight: 800,
              letterSpacing: 2,
              background: "linear-gradient(45deg, #FF6B6B 0%, #4ECDC4 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 4
            }}
          >
            Welcome to PhotoAI Studio
          </Typography>
          <Typography variant="h5" sx={{ color: "#ddd", mb: 6 }}>
            Transform your photography with AI-powered assistance
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate("/choice")}
            startIcon={<RocketLaunch />}
            sx={{
              background: "linear-gradient(45deg, #FF6B6B 0%, #4ECDC4 100%)",
              color: "white",
              px: 6,
              py: 2,
              fontSize: "1.1rem",
              borderRadius: 3,
              boxShadow: "0 8px 24px -6px rgba(78, 205, 196, 0.3)",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 12px 28px -6px rgba(78, 205, 196, 0.4)"
              },
              transition: "all 0.3s ease"
            }}
          >
            Launch Studio
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default WelcomePage;