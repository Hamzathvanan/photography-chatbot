import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import WelcomePage from "./components/WelcomePage";
import ChoicePage from "./components/ChoicePage";
import ImageProcessingPage from "./components/ImageProcessingPage";
import ChatPage from "./components/ChatPage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/choice" element={<ChoicePage />} />
        <Route path="/image-processing" element={<ImageProcessingPage />} />
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;