import React from "react";
import { Button, Typography, Container, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

const ChoicePage = () => {
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
        <Typography variant="h4" gutterBottom>
          What would you like to do?
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => navigate("/image-processing")}
          sx={{ margin: 2 }}
        >
          Analyze an Image
        </Button>
         <Button
          variant="contained"
          color="secondary"
          size="large"
          onClick={() => navigate("/edit-image")}
          sx={{ margin: 2 }}
        >
          Edit Image
        </Button>
        <Button
          variant="contained"
          color="secondary"
          size="large"
          onClick={() => navigate("/chat")}
          sx={{ margin: 2 }}
        >
          Chat with Photography Assistant
        </Button>
      </Box>
    </Container>
  );
};

export default ChoicePage;