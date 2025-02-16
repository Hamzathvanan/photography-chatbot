import React from "react";
import {Typography, Box, IconButton, Link, Grid, Container} from "@mui/material";
import { GitHub, LinkedIn, Twitter, Email } from "@mui/icons-material";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        background: "rgba(16, 16, 16, 0.8)",
        backdropFilter: "blur(12px)",
        borderTop: "1px solid rgba(255,255,255,0.1)",
        py: 8,
        px: 2,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <Typography variant="h6" sx={{
                mb: 2,
                fontWeight: 700,
                background: "linear-gradient(45deg, #FF6B6B 0%, #4ECDC4 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                PhotoAI Studio
              </Typography>
              <Typography variant="body2" sx={{ color: "#aaa", maxWidth: 300 }}>
                Revolutionizing photography with AI-powered tools for professionals and enthusiasts
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="subtitle1" sx={{ color: "white", mb: 2 }}>
                Connect With Us
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <IconButton href="#" sx={{ color: "#4ECDC4" }}>
                  <GitHub />
                </IconButton>
                <IconButton href="#" sx={{ color: "#4ECDC4" }}>
                  <LinkedIn />
                </IconButton>
                <IconButton href="#" sx={{ color: "#4ECDC4" }}>
                  <Twitter />
                </IconButton>
                <IconButton href="#" sx={{ color: "#4ECDC4" }}>
                  <Email />
                </IconButton>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: { xs: 'center', md: 'right' } }}>
              <Typography variant="subtitle1" sx={{ color: "white", mb: 1 }}>
                Legal
              </Typography>
              <Link href="#" variant="body2" sx={{ color: "#aaa", display: 'block', mb: 1 }}>
                Privacy Policy
              </Link>
              <Link href="#" variant="body2" sx={{ color: "#aaa", display: 'block' }}>
                Terms of Service
              </Link>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: "#666" }}>
            © 2025 Hamzathvanan (PVT) LTD. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;