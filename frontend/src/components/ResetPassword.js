import React, { useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api";
import "./resetPassword.css"; // Import the updated CSS

const ResetPassword = () => {
  const { token } = useParams(); // Extract token from URL
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsSuccess(false);

    try {
      const { data } = await API.post("/auth/reset-password/confirm", {
        resetToken: token,
        newPassword,
      });
      setMessage(data.message);
      setIsSuccess(true);
    } catch (error) {
      setMessage(error.response?.data?.message || "Error resetting password");
      setIsSuccess(false);
    }
  };

  return (
    <div className="reset-password-container">
      <h2 className="reset-password-header">Reset Your Password</h2>

      <form onSubmit={handleSubmit} className="reset-password-form">
        <input
          type="password"
          placeholder="Enter new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />

        <button type="submit" className="reset-password-btn">
          Reset Password
        </button>
      </form>

      {message && (
        <p className={`reset-password-message ${isSuccess ? "success" : "error"}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default ResetPassword;
