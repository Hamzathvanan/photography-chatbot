import React from "react";
import { AppBar, Toolbar, Typography, Button, IconButton, Box } from "@mui/material";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { CameraAlt, Login, Logout, RocketLaunch } from "@mui/icons-material";

const Navbar = ({ isLoggedIn, setIsLoggedIn }) => {
  const navigate = useNavigate();
  const location = useLocation();

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
          {/* Show Home button only when not on Welcome page */}
          {location.pathname !== "/welcome" && (
            <Button
              component={Link}
              to={isLoggedIn ? "/welcome" : "/"}
              sx={{
                color: "white",
                '&:hover': {
                  background: "rgba(255,255,255,0.05)",
                }
              }}
            >
              Home
            </Button>
          )}

          {/* Show Dashboard button only when logged in and not on Welcome/Choice pages */}
          {isLoggedIn && !["/welcome", "/choice"].includes(location.pathname) && (
            <Button
              onClick={() => navigate("/choice")}
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
              Dashboard
            </Button>
          )}

          {/* Logout button */}
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