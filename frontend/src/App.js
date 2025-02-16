import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Button, TextField, Typography, Container, Box, Card } from "@mui/material";
import axios from "axios";
import WelcomePage from "./components/WelcomePage";
import ChoicePage from "./components/ChoicePage";
import ImageProcessingPage from "./components/ImageProcessingPage";
import ChatPage from "./components/ChatPage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ImageEditingPage from "./components/ImageEditingPage";
import ImageCaptionPage from "./components/ImageCaptionPage";
import ImageModelAnalysisPage from "./components/ImageModelAnalysisPage";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <Router>
      <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <Box sx={{
        minHeight: 'calc(100vh - 128px)',
        background: "linear-gradient(45deg, #1a1a1a 0%, #2a2a2a 100%)",
      }}>
        <Routes>
          <Route path="/" element={<LoginOrRegister setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/choice" element={<ChoicePage />} />
          <Route path="/image-processing" element={<ImageProcessingPage />} />
          <Route path="/image-model-analysis" element={<ImageModelAnalysisPage />} />
          <Route path="/edit-image" element={<ImageEditingPage />} />
          <Route path="/image-caption-generator" element={<ImageCaptionPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/register" element={<Register setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
          <Route
            path="/protected"
            element={isLoggedIn ? <Protected /> : <Navigate to="/login" />}
          />
        </Routes>
      </Box>
      <Footer />
    </Router>
  );
};

// Login or Register Option Page
const LoginOrRegister = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Card sx={{
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 4,
        p: 6,
        width: "100%",
        maxWidth: 600,
        mx: 2
      }}>
        <Typography variant="h3" sx={{
          mb: 4,
          fontWeight: 700,
          background: "linear-gradient(45deg, #FF6B6B 0%, #4ECDC4 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textAlign: 'center'
        }}>
          Welcome to PhotoAI
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 4 }}>
          <Button
            variant="contained"
            onClick={() => navigate("/login")}
            sx={{
              background: "linear-gradient(45deg, #FF6B6B 0%, #4ECDC4 100%)",
              color: "white",
              px: 6,
              borderRadius: 2,
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 8px 24px -6px rgba(78, 205, 196, 0.3)"
              },
              transition: "all 0.3s ease"
            }}
          >
            Login
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate("/register")}
            sx={{
              color: "white",
              borderColor: "rgba(255,255,255,0.3)",
              px: 6,
              borderRadius: 2,
              "&:hover": {
                borderColor: "#4ECDC4",
                background: "rgba(78, 205, 196, 0.1)"
              }
            }}
          >
            Register
          </Button>
        </Box>
      </Card>
    </Box>
  );
};

// Register Component
const Register = ({ setIsLoggedIn }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/register", {
        username,
        password,
      });
      setMessage(response.data.message);
      navigate("/login");
    } catch (error) {
      setMessage(error.response?.data?.error || "Registration failed");
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Card sx={{
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 4,
        p: 6,
        width: "100%",
        maxWidth: 600,
        mx: 2
      }}>
        <Typography variant="h4" sx={{
          mb: 4,
          fontWeight: 700,
          background: "linear-gradient(45deg, #FF6B6B 0%, #4ECDC4 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textAlign: 'center'
        }}>
          Create Account
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{
              mt: 2,
              width: "100%",
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                '&:hover fieldset': { borderColor: '#4ECDC4' }
              }
            }}
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{
              mt: 3,
              width: "100%",
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                '&:hover fieldset': { borderColor: '#4ECDC4' }
              }
            }}
          />
          <Button
            type="submit"
            variant="contained"
            sx={{
              mt: 4,
              width: "100%",
              py: 1.5,
              background: "linear-gradient(45deg, #FF6B6B 0%, #4ECDC4 100%)",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 8px 24px -6px rgba(78, 205, 196, 0.3)"
              },
              transition: "all 0.3s ease"
            }}
          >
            Register
          </Button>
        </form>
        {message && (
          <Typography sx={{
            mt: 3,
            color: message.includes("success") ? "#4ECDC4" : "#FF6B6B",
            textAlign: 'center'
          }}>
            {message}
          </Typography>
        )}
      </Card>
    </Box>
  );
};

// Login Component
const Login = ({ setIsLoggedIn }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/login", {
        username,
        password,
      });
      localStorage.setItem("token", response.data.token);
      setIsLoggedIn(true);
      setMessage(response.data.message);
      navigate("/welcome");
    } catch (error) {
      setMessage(error.response?.data?.error || "Login failed");
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Card sx={{
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 4,
        p: 6,
        width: "100%",
        maxWidth: 600,
        mx: 2
      }}>
        <Typography variant="h4" sx={{
          mb: 4,
          fontWeight: 700,
          background: "linear-gradient(45deg, #FF6B6B 0%, #4ECDC4 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textAlign: 'center'
        }}>
          Welcome Back
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{
              mt: 2,
              width: "100%",
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                '&:hover fieldset': { borderColor: '#4ECDC4' }
              }
            }}
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{
              mt: 3,
              width: "100%",
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                '&:hover fieldset': { borderColor: '#4ECDC4' }
              }
            }}
          />
          <Button
            type="submit"
            variant="contained"
            sx={{
              mt: 4,
              width: "100%",
              py: 1.5,
              background: "linear-gradient(45deg, #FF6B6B 0%, #4ECDC4 100%)",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 8px 24px -6px rgba(78, 205, 196, 0.3)"
              },
              transition: "all 0.3s ease"
            }}
          >
            Login
          </Button>
        </form>
        {message && (
          <Typography sx={{
            mt: 3,
            color: message.includes("success") ? "#4ECDC4" : "#FF6B6B",
            textAlign: 'center'
          }}>
            {message}
          </Typography>
        )}
      </Card>
    </Box>
  );
};

// Protected Component
const Protected = () => {
  const [message, setMessage] = useState("");

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/protected", {
          headers: { Authorization: token },
        });
        setMessage(response.data.message);
      } catch (error) {
        setMessage(error.response?.data?.error || "Unauthorized");
      }
    };
    fetchData();
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Card sx={{
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 4,
        p: 6,
        width: "100%",
        maxWidth: 600,
        mx: 2
      }}>
        <Typography variant="h4" sx={{
          mb: 4,
          fontWeight: 700,
          background: "linear-gradient(45deg, #FF6B6B 0%, #4ECDC4 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textAlign: 'center'
        }}>
          Protected Content
        </Typography>
        {message && (
          <Typography sx={{
            color: "#ddd",
            textAlign: 'center',
            fontSize: "1.2rem"
          }}>
            {message}
          </Typography>
        )}
      </Card>
    </Box>
  );
};

export default App;