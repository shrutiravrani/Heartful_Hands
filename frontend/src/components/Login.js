import React, { useState } from "react";
import API from "../api";
import "./Login.css";

const Login = () => {
  // State for form data and feedback
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });
  const [feedback, setFeedback] = useState({
    message: "",
    isSuccess: false
  });

  // Handle input changes
  const updateInput = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const submitLogin = async (e) => {
    e.preventDefault();
    setFeedback({ message: "", isSuccess: false });

    try {
      // Attempt to log in
      const response = await API.post("/auth/login", loginData);
      
      // Store authentication data
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // Redirect to dashboard
      window.location.href = "/dashboard";
    } catch (err) {
      // Handle login error
      const errorMessage = err.response?.data?.message || "Failed to log in. Please try again.";
      setFeedback({
        message: errorMessage,
        isSuccess: false
      });
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <h2 className="login-header">Welcome Back</h2>
        <p className="login-subtitle">Sign in to continue to your account</p>

        <form onSubmit={submitLogin} className="login-form">
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={loginData.email}
              onChange={updateInput}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={loginData.password}
              onChange={updateInput}
              className="form-input"
              required
            />
          </div>

          <button type="submit" className="login-btn">
            Sign In
          </button>
        </form>

        {feedback.message && (
          <div className={`login-feedback ${feedback.isSuccess ? "success" : "error"}`}>
            {feedback.message}
          </div>
        )}

        <div className="login-links">
          <a href="/signup" className="login-link">Do not have account? Create account</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
