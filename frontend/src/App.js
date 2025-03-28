import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import {
  Button,
  TextField,
  Typography,
  Container,
  Box,
  Card,
  Fade,
  CircularProgress,
  Alert,
  IconButton
} from "@mui/material";
import {Close, Email, LockPerson, VerifiedUser} from "@mui/icons-material";
import axios from "axios";
import { motion } from "framer-motion";
import styled from "@emotion/styled";
import WelcomePage from "./components/WelcomePage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ChoicePage from "./components/ChoicePage";
import ImageProcessingPage from "./components/ImageProcessingPage";
import ChatPage from "./components/ChatPage";
import ImageEditingPage from "./components/ImageEditingPage";
import ImageModelAnalysisPage from "./components/ImageModelAnalysisPage";
import ImageCaptionPage from "./components/ImageCaptionPage";

const GradientCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(145deg, #1a1a1a 0%, #2d2d2d 100%)',
  borderRadius: '24px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
  padding: '2rem',
  position: 'relative',
  overflow: 'visible',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
    borderRadius: '26px',
    zIndex: -1
  }
}));

const AnimatedButton = motion(Button);

const AuthWrapper = ({ children }) => (
  <Box sx={{
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'radial-gradient(circle at center, #2a2a2a 0%, #1a1a1a 100%)',
    p: 2
  }}>
    <GradientCard sx={{ width: '100%', maxWidth: 500 }}>
      {children}
    </GradientCard>
  </Box>
);

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          await axios.get("http://localhost:5000/protected", {
            headers: { Authorization: token }
          });
          setIsLoggedIn(true);
        } catch {
          localStorage.removeItem("token");
        }
      }
      setAuthChecked(true);
    };
    checkAuth();
  }, []);

  if (!authChecked) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#1a1a1a'
      }}>
        <CircularProgress sx={{ color: '#4ecdc4' }} size={60} />
      </Box>
    );
  }

  return (
    <Router>
      <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <Box sx={{
        minHeight: 'calc(100vh - 128px)',
        background: "radial-gradient(circle at top left, #2a2a2a 0%, #1a1a1a 100%)",
      }}>
        <Routes>
          <Route path="/" element={<LandingPage setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/welcome" element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <WelcomePage />
            </ProtectedRoute>
          } />
		  <Route path="/choice" element={<ChoicePage />} />
          <Route path="/image-processing" element={<ImageProcessingPage />} />
          <Route path="/image-model-analysis" element={<ImageModelAnalysisPage />} />
          <Route path="/edit-image" element={<ImageEditingPage />} />
          <Route path="/image-caption-generator" element={<ImageCaptionPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/register" element={<RegistrationFlow />} />
          <Route path="/login" element={<LoginFlow setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/verify-email" element={<EmailVerification />} />
        </Routes>
      </Box>
      <Footer />
    </Router>
  );
};

const ProtectedRoute = ({ children, isLoggedIn }) => {
  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

const LandingPage = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();

  return (
    <AuthWrapper>
      <Typography variant="h3" sx={{
        mb: 4,
        fontWeight: 800,
        background: "linear-gradient(45deg, #FF6B6B 0%, #4ECDC4 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        textAlign: 'center',
        fontSize: { xs: '2rem', md: '3rem' }
      }}>
        Transform Your Photography
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 4 }}>
        <AnimatedButton
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          variant="contained"
          onClick={() => navigate("/login")}
          sx={{
            background: "linear-gradient(45deg, #FF6B6B 0%, #4ECDC4 100%)",
            height: 50,
            fontSize: '1.1rem',
            '&:hover': {
              boxShadow: '0 8px 24px rgba(78, 205, 196, 0.4)'
            }
          }}
        >
          Get Started
        </AnimatedButton>

        <Typography variant="body2" sx={{
          textAlign: 'center',
          color: '#aaa',
          mt: 2,
          '& a': {
            color: '#4ecdc4',
            textDecoration: 'none',
            fontWeight: 600,
            '&:hover': { textDecoration: 'underline' }
          }
        }}>
          New here? <a href="/register">Create account</a>
        </Typography>
      </Box>
    </AuthWrapper>
  );
};

const RegistrationFlow = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ email: '', username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/register", formData);
      setMessage({ type: 'success', text: response.data.message });
      setStep(2);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Registration failed. Please try again.'
      });
    }
    setLoading(false);
  };

  return (
    <AuthWrapper>
      {step === 1 && (
        <Fade in={true}>
          <Box>
            <Typography variant="h4" sx={{
              mb: 3,
              fontWeight: 700,
              background: "linear-gradient(45deg, #FF6B6B 0%, #4ECDC4 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textAlign: 'center'
            }}>
              Join PhotoAI
            </Typography>

            {message && (
              <Alert
                severity={message.type}
                sx={{ mb: 3 }}
                action={
                  <IconButton
                    size="small"
                    onClick={() => setMessage(null)}
                  >
                    <Close fontSize="inherit" />
                  </IconButton>
                }
              >
                {message.text}
              </Alert>
            )}

            <form onSubmit={handleRegister}>
              <TextField
                fullWidth
                label="Email"
                variant="outlined"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    color: '#fff',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                    '&:hover fieldset': { borderColor: '#4ECDC4' }
                  }
                }}
                InputProps={{
                  startAdornment: <Email sx={{ color: '#666', mr: 1 }} />
                }}
              />

              <TextField
                fullWidth
                label="Username"
                variant="outlined"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    color: '#fff',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                    '&:hover fieldset': { borderColor: '#4ECDC4' }
                  }
                }}
              />

              <TextField
                fullWidth
                label="Password"
                type="password"
                variant="outlined"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    color: '#fff',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                    '&:hover fieldset': { borderColor: '#4ECDC4' }
                  }
                }}
              />

              <AnimatedButton
                type="submit"
                fullWidth
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                sx={{
                  py: 1.5,
                  background: 'linear-gradient(45deg, #FF6B6B 0%, #4ECDC4 100%)',
                  '&:disabled': { background: '#444' }
                }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Continue'}
              </AnimatedButton>
            </form>
          </Box>
        </Fade>
      )}

      {step === 2 && <EmailVerification formData={formData} />}
    </AuthWrapper>
  );
};

const EmailVerification = ({ formData }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const handleVerification = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/verify_email", {
        email: formData.email,
        verification_code: code,
        username: formData.username,
        password: formData.password
      });
      setMessage({ type: 'success', text: response.data.message });
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Verification failed. Please try again.'
      });
    }
    setLoading(false);
  };

  return (
    <Fade in={true}>
      <Box>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <VerifiedUser sx={{
            fontSize: 60,
            color: '#4ecdc4',
            mb: 2,
            filter: 'drop-shadow(0 0 8px rgba(78,205,196,0.4))'
          }} />
          <Typography variant="h5" sx={{ color: '#fff', fontWeight: 600 }}>
            Check Your Email
          </Typography>
          <Typography variant="body1" sx={{ color: '#aaa', mt: 1 }}>
            We've sent a 6-digit code to {formData.email} {/* Fixed this line */}
          </Typography>
        </Box>

        {message && (
          <Alert
            severity={message.type}
            sx={{ mb: 3 }}
            action={
              <IconButton size="small" onClick={() => setMessage(null)}>
                <Close fontSize="inherit" />
              </IconButton>
            }
          >
            {message.text}
          </Alert>
        )}

        <form onSubmit={handleVerification}>
          <TextField
            fullWidth
            label="Verification Code"
            variant="outlined"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                color: '#fff',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                '&:hover fieldset': { borderColor: '#4ECDC4' }
              }
            }}
            inputProps={{ maxLength: 6 }}
          />

          <AnimatedButton
            type="submit"
            fullWidth
            disabled={loading || code.length !== 6}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            sx={{
              py: 1.5,
              background: 'linear-gradient(45deg, #FF6B6B 0%, #4ECDC4 100%)',
              '&:disabled': { background: '#444' }
            }}
          >
            {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Verify Account'}
          </AnimatedButton>
        </form>
      </Box>
    </Fade>
  );
};

const LoginFlow = ({ setIsLoggedIn }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/login", credentials);
      localStorage.setItem("token", response.data.token);
      setIsLoggedIn(true);
      navigate("/welcome");
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Login failed. Please try again.'
      });
    }
    setLoading(false);
  };

  return (
    <AuthWrapper>
      <Typography variant="h4" sx={{
        mb: 3,
        fontWeight: 700,
        background: "linear-gradient(45deg, #FF6B6B 0%, #4ECDC4 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        textAlign: 'center'
      }}>
        Welcome Back
      </Typography>

      {message && (
        <Alert
          severity={message.type}
          sx={{ mb: 3 }}
          action={
            <IconButton size="small" onClick={() => setMessage(null)}>
              <Close fontSize="inherit" />
            </IconButton>
          }
        >
          {message.text}
        </Alert>
      )}

      <form onSubmit={handleLogin}>
        <TextField
          fullWidth
          label="Username"
          variant="outlined"
          value={credentials.username}
          onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              color: '#fff',
              '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
              '&:hover fieldset': { borderColor: '#4ECDC4' }
            }
          }}
          InputProps={{
            startAdornment: <LockPerson sx={{ color: '#666', mr: 1 }} />
          }}
        />

        <TextField
          fullWidth
          label="Password"
          type="password"
          variant="outlined"
          value={credentials.password}
          onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
              color: '#fff',
              '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
              '&:hover fieldset': { borderColor: '#4ECDC4' }
            }
          }}
        />

        <AnimatedButton
          type="submit"
          fullWidth
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          sx={{
            py: 1.5,
            background: 'linear-gradient(45deg, #FF6B6B 0%, #4ECDC4 100%)',
            '&:disabled': { background: '#444' }
          }}
        >
          {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Sign In'}
        </AnimatedButton>
      </form>

      <Typography variant="body2" sx={{
        textAlign: 'center',
        color: '#aaa',
        mt: 3,
        '& a': {
          color: '#4ecdc4',
          textDecoration: 'none',
          fontWeight: 600,
          '&:hover': { textDecoration: 'underline' }
        }
      }}>
        Don't have an account? <a href="/register">Sign up</a>
      </Typography>
    </AuthWrapper>
  );
};

export default App;