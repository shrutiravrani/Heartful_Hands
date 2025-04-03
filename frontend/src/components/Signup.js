import React, { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import "./Signup.css"; // Import the updated CSS

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "volunteer",
    bio: "",
  });
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsSuccess(false);

    try {
      const { data } = await API.post("/auth/signup", formData);
      
      // Store both token and user data
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Force a page reload to update the App component's user state
      window.location.href = "/dashboard";
    } catch (error) {
      setMessage(error.response?.data?.message || "Error signing up");
      setIsSuccess(false);
    }
  };

  return (
    <div className="signup-container">
      <h2 className="signup-header">Create Account</h2>

      <form onSubmit={handleSubmit} className="signup-form">
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
        >
          <option value="volunteer">Volunteer</option>
          <option value="event_manager">Event Manager</option>
        </select>

        <textarea
          name="bio"
          placeholder="Tell us about yourself..."
          value={formData.bio}
          onChange={handleChange}
        />

        <button type="submit" className="signup-btn">Sign Up</button>
      </form>

      {message && (
        <p className={`signup-message ${isSuccess ? "success" : "error"}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default Signup;
