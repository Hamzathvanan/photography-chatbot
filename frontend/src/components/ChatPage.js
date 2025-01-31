import React, { useState } from "react";
import { Button, Typography, Container, Box, TextField } from "@mui/material";
import axios from "axios";

const ChatPage = () => {
  const [textInput, setTextInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.post("http://localhost:5000/chatbot", {
        text: textInput,
      });
      setResponse(res.data.suggestions);
      setLoading(false);
    } catch (err) {
      setError("Error fetching suggestions. Please try again.");
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
          Chat with Photography Assistant
        </Typography>
        <TextField
          multiline
          rows={4}
          variant="outlined"
          placeholder="Ask your photography-related questions..."
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          sx={{ width: "100%", marginBottom: 2 }}
        />
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleSubmit}
        >
          Get Suggestions
        </Button>

        {loading && <Typography>Processing your query...</Typography>}
        {error && <Typography color="error">{error}</Typography>}

        {response && (
          <Box textAlign="left" sx={{ marginTop: 4, width: "100%" }}>
            <Typography variant="h6">Response:</Typography>
            <Typography
              variant="body1"
              sx={{
                whiteSpace: "pre-wrap", // Preserve line breaks
                fontFamily: "Roboto", // Use a monospace font for better readability
                backgroundColor: "#f5f5f5", // Light gray background
                padding: 2, // Add padding
                borderRadius: 2, // Rounded corners
                border: "1px solid #ddd", // Light border
              }}
            >
              {response}
            </Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default ChatPage;