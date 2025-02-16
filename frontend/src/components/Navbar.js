import React from "react";
import { AppBar, Toolbar, Typography, Button, IconButton, Box } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { CameraAlt, Login, Logout, RocketLaunch } from "@mui/icons-material";

const Navbar = ({ isLoggedIn, setIsLoggedIn }) => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate(isLoggedIn ? "/welcome" : "/login");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <AppBar
      position="static"
      sx={{
        background: "rgba(16, 16, 16, 0.8)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "none",
      }}
    >
      <Toolbar sx={{ py: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <CameraAlt sx={{
            mr: 1,
            fontSize: 32,
            background: "linear-gradient(45deg, #FF6B6B 0%, #4ECDC4 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }} />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              letterSpacing: 1.5,
              background: "linear-gradient(45deg, #FF6B6B 0%, #4ECDC4 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            PhotoAI
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            component={Link}
            to="/"
            sx={{
              color: "white",
              '&:hover': {
                background: "rgba(255,255,255,0.05)",
              }
            }}
          >
            Home
          </Button>

          <Button
            onClick={handleGetStarted}
            startIcon={<RocketLaunch />}
            sx={{
              color: "white",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 2,
              px: 3,
              '&:hover': {
                background: "rgba(255,255,255,0.05)",
                borderColor: "#4ECDC4",
              }
            }}
          >
            {isLoggedIn ? "Dashboard" : "Get Started"}
          </Button>

          {isLoggedIn && (
            <IconButton
              onClick={handleLogout}
              sx={{
                color: "#FF6B6B",
                '&:hover': {
                  background: "rgba(255,107,107,0.1)",
                }
              }}
            >
              <Logout />
            </IconButton>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;