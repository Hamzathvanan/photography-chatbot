import React, { useState } from "react";
import { Button, Typography, Container, Box, TextField, Card, CardContent, CircularProgress, Grid } from "@mui/material";
import axios from "axios";
import { ChatBubble, Refresh, Send } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";

const ChatPage = () => {
  const [textInput, setTextInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const theme = useTheme();

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

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", background: "linear-gradient(45deg, #1a1a1a 0%, #2a2a2a 100%)", py: 8 }}>
      <Container>
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" textAlign="center" sx={{ mb: 8 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              background: "linear-gradient(45deg, #FF6B6B 0%, #4ECDC4 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 2,
            }}
          >
            Chat with Photography Assistant
          </Typography>
          <Typography variant="subtitle1" sx={{ color: "#ccc", mb: 4 }}>
            Ask any photography-related questions and get creative suggestions.
          </Typography>

          {/* Input Field */}
          <Card sx={{ background: "rgba(255, 255, 255, 0.05)", borderRadius: 4, p: 4, mb: 4, backdropFilter: "blur(12px)", boxShadow: 3 }}>
            <CardContent>
              <TextField
                multiline
                rows={4}
                variant="outlined"
                placeholder="Ask your photography-related questions..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={handleKeyDown} // Trigger submit on Enter key press
                sx={{ width: "100%", marginBottom: 2, backgroundColor: "#333", borderRadius: 2 }}
              />
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleSubmit}
                sx={{
                  width: "100%",
                  background: "linear-gradient(45deg, #FF6B6B 0%, #4ECDC4 100%)",
                  borderRadius: 4,
                  color: "white",
                  "&:hover": {
                    background: "linear-gradient(45deg, #4ECDC4 0%, #FF6B6B 100%)",
                  },
                }}
                endIcon={<Send />}
              >
                Get Suggestions
              </Button>
            </CardContent>
          </Card>

          {/* Loading Indicator */}
          {loading && <CircularProgress sx={{ color: "white", mt: 2 }} />}

          {/* Error Message */}
          {error && <Typography color="error" sx={{ mt: 3, color: "#ff5252" }}>{error}</Typography>}

          {/* Response */}
          {response && (
            <Grid container spacing={4} sx={{ mt: 6 }}>
              <Grid item xs={12}>
                <Card sx={{ background: "rgba(255, 255, 255, 0.05)", borderRadius: 4, boxShadow: 3, padding: 4 }}>
                  <CardContent>
                    <Typography variant="h5" sx={{ color: "#fff", fontWeight: 700, mb: 2 }}>
                      Photography Assistant Suggestions
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: "#ddd",
                        whiteSpace: "pre-line",
                        fontFamily: "Roboto",
                        backgroundColor: "#444",
                        padding: 2,
                        borderRadius: 2,
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      {response}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Reset Button */}
          {response && !loading && (
            <Button
              variant="outlined"
              color="secondary"
              size="large"
              onClick={() => setResponse("")}
              sx={{
                marginTop: 3,
                color: "white",
                borderColor: "rgba(255,255,255,0.3)",
                "&:hover": { borderColor: theme.palette.secondary.main },
              }}
              startIcon={<Refresh />}
            >
              Reset
            </Button>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default ChatPage;
