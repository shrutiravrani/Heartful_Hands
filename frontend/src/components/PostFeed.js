import React, { useEffect, useState } from 'react';
import API from '../api';

const PostFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const { data } = await API.get('/posts');
        setPosts(data.posts);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch posts.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleLike = async (postId) => {
    try {
      await API.put(`/posts/${postId}/like`);
      setPosts((prev) =>
        prev.map((post) =>
          post._id === postId ? { ...post, likes: post.likes + 1 } : post
        )
      );
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to like post.');
    }
  };

  if (loading) return <p>Loading posts...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (posts.length === 0) return <p>No posts available.</p>;

  return (
    <div>
      <h2>Post Feed</h2>
      {posts.map((post) => (
        <div key={post._id}>
          <p>{post.content}</p>
          {post.image && <img src={post.image} alt="Post" />}
          <button onClick={() => handleLike(post._id)}>Like</button>
          <p>{post.likes} Likes</p>
        </div>
      ))}
    </div>
  );
};

export default PostFeed;
