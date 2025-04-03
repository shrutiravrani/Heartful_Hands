import React, { useState } from "react";
import API from "../api";
import "./CreateEvent.css"; 
const CreateEvent = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    requirements: "",
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); 
    try {
      if (!formData.title || !formData.description || !formData.date || !formData.location) {
        setError("All fields are required.");
        return;
      }
      await API.post("/events", formData);
      alert("Event created successfully!");
      setFormData({ title: "", description: "", date: "", location: "", requirements: "" });
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong.");
    }
  };

  return (
    <div className="event-form-container">
      <h2 className="event-form-header">Create Event</h2>
      {error && <p className="event-error">{error}</p>}
      
      <form onSubmit={handleSubmit} className="event-form">
        <input
          name="title"
          placeholder="Title"
          value={formData.title}
          onChange={handleChange}
        />
        
        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
        ></textarea>
        
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
        />
        
        <input
          name="location"
          placeholder="Location"
          value={formData.location}
          onChange={handleChange}
        />
        
        <textarea
          name="requirements"
          placeholder="Requirements"
          value={formData.requirements}
          onChange={handleChange}
        ></textarea>
        
        <button type="submit" className="event-submit-btn">
          Create Event
        </button>
      </form>
    </div>
  );
};

export default CreateEvent;
