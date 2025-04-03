import React, { useState } from 'react';
import API from '../api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post('/auth/reset-password', { email });
      setMessage(data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error sending reset email');
    }
  };

  return (
    <div>
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit">Send Reset Email</button>
      </form>
      <p>{message}</p>
    </div>
  );
};

export default ForgotPassword;
