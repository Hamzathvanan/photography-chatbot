import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [image, setImage] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [response, setResponse] = useState('');

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleTextChange = (e) => {
    setTextInput(e.target.value);
  };

  const handleSubmitText = async () => {
    try {
      const res = await axios.post('http://localhost:5000/chatbot', { text: textInput });
      setResponse(res.data.suggestions);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitImage = async () => {
    const formData = new FormData();
    formData.append('image', image);

    try {
      const res = await axios.post('http://localhost:5000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResponse(res.data.image_suggestions);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Photography Chatbot</h1>

      <div className="mb-3">
        <label className="form-label">Ask for photography tips...</label>
        <textarea
          className="form-control"
          rows="4"
          value={textInput}
          onChange={handleTextChange}
          placeholder="Enter your photography query..."
        ></textarea>
      </div>

      <div className="mb-3">
        <button className="btn btn-primary" onClick={handleSubmitText}>
          Get Suggestions
        </button>
      </div>

      <div className="mb-3">
        <input type="file" className="form-control" onChange={handleImageChange} />
      </div>

      <div className="mb-3">
        <button className="btn btn-success" onClick={handleSubmitImage}>
          Upload Image for Analysis
        </button>
      </div>

      <div className="mt-4">
        <h4>Suggestions:</h4>
        <p>{response}</p>
      </div>
    </div>
  );
}

export default App;
