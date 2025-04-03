import React, { useState } from 'react';
import API from '../api';

const CreatePost = () => {
  const [formData, setFormData] = useState({ content: '', image: '' });
  const [error, setError] = useState(null);

  const validateImageUrl = (url) => /^https?:\/\/.+\.(jpg|jpeg|png|gif)$/.test(url);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Reset error
    try {
      if (!formData.content) {
        setError('Content is required.');
        return;
      }
      if (formData.image && !validateImageUrl(formData.image)) {
        setError('Invalid image URL.');
        return;
      }
      await API.post('/posts', formData);
      alert('Post created successfully!');
      setFormData({ content: '', image: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong.');
    }
  };

  return (
    <div>
      <h2>Create Post</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <textarea name="content" placeholder="Write your post..." value={formData.content} onChange={handleChange} />
        <input name="image" placeholder="Image URL (optional)" value={formData.image} onChange={handleChange} />
        <button type="submit">Create Post</button>
      </form>
    </div>
  );
};

export default CreatePost;
