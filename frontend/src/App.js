import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Button, TextField, Typography, Container, Box } from "@mui/material";
import axios from "axios";
import WelcomePage from "./components/WelcomePage";
import ChoicePage from "./components/ChoicePage";
import ImageProcessingPage from "./components/ImageProcessingPage";
import ChatPage from "./components/ChatPage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <Router>
      <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <Routes>
        <Route path="/" element={<LoginOrRegister setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/choice" element={<ChoicePage />} />
        <Route path="/image-processing" element={<ImageProcessingPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/register" element={<Register setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route
          path="/protected"
          element={isLoggedIn ? <Protected /> : <Navigate to="/login" />}
        />
      </Routes>
      <Footer />
    </Router>
  );
};

// Login or Register Option Page
const LoginOrRegister = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();

  return (
    <Container>
      <Box textAlign="center" mt={5}>
        <Typography variant="h4">Welcome to Photography Assistant</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/login")}
          sx={{ mt: 2 }}
        >
          Login
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => navigate("/register")}
          sx={{ mt: 2, ml: 2 }}
        >
          Register
        </Button>
      </Box>
    </Container>
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
      navigate("/login");  // Redirect to login page after successful registration
    } catch (error) {
      setMessage(error.response?.data?.error || "Registration failed");
    }
  };

  return (
    <Container>
      <Box textAlign="center" mt={5}>
        <Typography variant="h4">Register</Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{ mt: 2, width: "100%" }}
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mt: 2, width: "100%" }}
          />
          <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
            Register
          </Button>
        </form>
        {message && <Typography sx={{ mt: 2 }}>{message}</Typography>}
      </Box>
    </Container>
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
      navigate("/welcome");  // Redirect to WelcomePage after successful login
    } catch (error) {
      setMessage(error.response?.data?.error || "Login failed");
    }
  };

  return (
    <Container>
      <Box textAlign="center" mt={5}>
        <Typography variant="h4">Login</Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{ mt: 2, width: "100%" }}
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mt: 2, width: "100%" }}
          />
          <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
            Login
          </Button>
        </form>
        {message && <Typography sx={{ mt: 2 }}>{message}</Typography>}
      </Box>
    </Container>
  );
};

// Protected Component (Example)
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
    <Container>
      <Box textAlign="center" mt={5}>
        <Typography variant="h4">Protected Page</Typography>
        {message && <Typography sx={{ mt: 2 }}>{message}</Typography>}
      </Box>
    </Container>
  );
};

export default App;