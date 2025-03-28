import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Button, TextField, Typography, Box, Card } from "@mui/material";

// Register Component
const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/register", { username, password, email });
      setMessage(response.data.message);
      navigate("/login"); // Redirect to login page after successful registration
    } catch (error) {
      setMessage(error.response?.data?.error || "Registration failed");
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Card sx={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(12px)", borderRadius: 4, p: 6, width: "100%", maxWidth: 600, mx: 2 }}>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, background: "linear-gradient(45deg, #FF6B6B 0%, #4ECDC4 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", textAlign: 'center' }}>
          Create Account
        </Typography>
        <form onSubmit={handleRegister}>
          <TextField label="Username" variant="outlined" value={username} onChange={(e) => setUsername(e.target.value)} sx={{ mt: 2, width: "100%" }} />
          <TextField label="Email" variant="outlined" value={email} onChange={(e) => setEmail(e.target.value)} sx={{ mt: 2, width: "100%" }} />
          <TextField label="Password" type="password" variant="outlined" value={password} onChange={(e) => setPassword(e.target.value)} sx={{ mt: 3, width: "100%" }} />
          <Button type="submit" variant="contained" sx={{ mt: 4, width: "100%", py: 1.5, background: "linear-gradient(45deg, #FF6B6B 0%, #4ECDC4 100%)" }}>
            Register
          </Button>
        </form>
        {message && <Typography sx={{ mt: 3, color: message.includes("success") ? "#4ECDC4" : "#FF6B6B", textAlign: 'center' }}>{message}</Typography>}
      </Card>
    </Box>
  );
};

export default RegisterPage;