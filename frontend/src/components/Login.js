import React, { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom"; // Importing useNavigate
import "./Login.css"; // Import the updated CSS

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate(); // Initializing useNavigate

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsSuccess(false);

    try {
      const { data } = await API.post("/auth/login", formData);
      
      // Store both token and user data
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Force a page reload to update the App component's user state
      window.location.href = "/dashboard";
    } catch (error) {
      setMessage(error.response?.data?.message || "Error logging in");
      setIsSuccess(false);
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-header">Welcome Back</h2>

      <form onSubmit={handleSubmit} className="login-form">
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

        <button type="submit" className="login-btn">Login</button>
      </form>

      {message && (
        <p className={`login-message ${isSuccess ? "success" : "error"}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default Login;
