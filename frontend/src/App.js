import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [image, setImage] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [response, setResponse] = useState('');
  const [metadata, setMetadata] = useState(null);
  const [imageSuggestions, setImageSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);  // New loading state
  const [error, setError] = useState('');  // New error state

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleTextChange = (e) => {
    setTextInput(e.target.value);
  };

  const handleSubmitText = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/chatbot', { text: textInput });
      setResponse(res.data.suggestions);
      setLoading(false);
    } catch (err) {
      setError('Error fetching suggestions. Please try again.');
      setLoading(false);
      console.error(err);
    }
  };

  const handleSubmitImage = async () => {
    setLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('image', image);

    try {
      const res = await axios.post('http://localhost:5000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMetadata(res.data.metadata);
      setImageSuggestions(res.data.image_suggestions);
      setLoading(false);
    } catch (err) {
      setError('Error uploading image. Please try again.');
      setLoading(false);
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
        <button className="btn btn-primary w-100" onClick={handleSubmitText}>
          Get Suggestions
        </button>
      </div>

      <div className="mb-3">
        <input type="file" className="form-control" onChange={handleImageChange} />
      </div>

      <div className="mb-3">
        <button className="btn btn-success w-100" onClick={handleSubmitImage}>
          Upload Image for Analysis
        </button>
      </div>

      {loading && (
        <div className="alert alert-info" role="alert">
          Processing your request... Please wait.
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="mt-4">
        <h4>Suggestions:</h4>
        <div className="card mb-3">
          <div className="card-body">
            {response ? (
              <pre className="text-break">{response}</pre>
            ) : (
              <p className="text-muted">No suggestions yet. Please submit a query.</p>
            )}
          </div>
        </div>

        <h4>Image Metadata:</h4>
        <div className="card mb-3">
          <div className="card-body">
            {metadata ? (
              <pre className="text-break">{JSON.stringify(metadata, null, 2)}</pre>
            ) : (
              <p className="text-muted">No metadata available. Upload an image to analyze.</p>
            )}
          </div>
        </div>

        <h4>Image Analysis Suggestions:</h4>
        <div className="card">
          <div className="card-body">
            {imageSuggestions ? (
              <pre className="text-break">{JSON.stringify(imageSuggestions, null, 2)}</pre>
            ) : (
              <p className="text-muted">No image analysis yet. Upload an image for analysis.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
