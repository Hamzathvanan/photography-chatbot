import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Button, TextField, Typography, Box, Card } from "@mui/material";
import axios from "axios";


// Login Component
const LoginPage = ({ setIsLoggedIn }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/login", { username, password });
      localStorage.setItem("token", response.data.token); // Store token for session
      setIsLoggedIn(true);
      navigate("/welcome");
    } catch (error) {
      setMessage(error.response?.data?.error || "Login failed");
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Card sx={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(12px)", borderRadius: 4, p: 6, width: "100%", maxWidth: 600, mx: 2 }}>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, background: "linear-gradient(45deg, #FF6B6B 0%, #4ECDC4 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", textAlign: 'center' }}>
          Welcome Back
        </Typography>
        <form onSubmit={handleLogin}>
          <TextField label="Username" variant="outlined" value={username} onChange={(e) => setUsername(e.target.value)} sx={{ mt: 2, width: "100%" }} />
          <TextField label="Password" type="password" variant="outlined" value={password} onChange={(e) => setPassword(e.target.value)} sx={{ mt: 3, width: "100%" }} />
          <Button type="submit" variant="contained" sx={{ mt: 4, width: "100%", py: 1.5, background: "linear-gradient(45deg, #FF6B6B 0%, #4ECDC4 100%)" }}>
            Login
          </Button>
        </form>
        {message && <Typography sx={{ mt: 3, color: message.includes("success") ? "#4ECDC4" : "#FF6B6B", textAlign: 'center' }}>{message}</Typography>}
      </Card>
    </Box>
  );
};

export default LoginPage;