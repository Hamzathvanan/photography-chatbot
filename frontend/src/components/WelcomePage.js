import React from "react";
import { Button, Typography, Container, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

const WelcomePage = () => {
  const navigate = useNavigate();

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
        <Typography variant="h2" gutterBottom>
          Welcome to Photography Assistant
        </Typography>
        <Typography variant="h6" gutterBottom>
          Do you need any photography-related assistance?
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => navigate("/choice")}
        >
          Get Started
        </Button>
      </Box>
    </Container>
  );
};

export default WelcomePage;