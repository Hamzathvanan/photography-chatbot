import React from "react";
import { Typography, Box } from "@mui/material";

const Footer = () => {
  return (
    <Box sx={{ bgcolor: "background.paper", p: 6 }} component="footer">
      <Typography variant="h6" align="center" gutterBottom>
        Photography Assistant
      </Typography>
      <Typography variant="subtitle1" align="center" color="text.secondary">
        © 2025 Hamzathvanan (PVT) LTD. All rights reserved.
      </Typography>
    </Box>
  );
};

export default Footer;