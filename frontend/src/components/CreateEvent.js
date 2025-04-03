import React, { useState } from "react";
import API from "../api";
import "./CreateEvent.css"; 

// Event creation form component
const CreateEvent = () => {
  // State for form data and error handling
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    requirements: "",
  });
  const [error, setError] = useState(null);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); 

    // Quick validation
    const { title, description, date, location } = formData;
    if (!title || !description || !date || !location) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      // Post to API
      await API.post("/events", formData);
      
      // Reset form and show success
      setFormData({
        title: "",
        description: "",
        date: "",
        location: "",
        requirements: "",
      });
      alert("Event created! 🎉");
    } catch (err) {
      // Error handling
      console.error("Error creating event:", err);
      setError(err.response?.data?.error || "Oops! Something went wrong. Please try again.");
    }
  };

  return (
    <div className="event-form-container">
      <h2 className="event-form-header">Create New Event</h2>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="event-form">
        <div className="form-group">
          <input
            type="text"
            name="title"
            placeholder="What's the event title?"
            value={formData.title}
            onChange={handleChange}
            className="form-input"
          />
        </div>
        
        <div className="form-group">
          <textarea
            name="description"
            placeholder="Tell us about the event..."
            value={formData.description}
            onChange={handleChange}
            className="form-textarea"
          />
        </div>
        
        <div className="form-group">
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="form-input"
          />
        </div>
        
        <div className="form-group">
          <input
            type="text"
            name="location"
            placeholder="Where's it happening?"
            value={formData.location}
            onChange={handleChange}
            className="form-input"
          />
        </div>
        
        <div className="form-group">
          <textarea
            name="requirements"
            placeholder="Any special requirements? (optional)"
            value={formData.requirements}
            onChange={handleChange}
            className="form-textarea"
          />
        </div>
        
        <button 
          type="submit" 
          className="submit-button"
        >
          Create Event
        </button>
      </form>
    </div>
  );
};

export default CreateEvent;
