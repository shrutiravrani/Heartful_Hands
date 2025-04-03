const Post = require('../models/Post');

// Create a new post
const createPost = async (req, res) => {
  try {
    const { content, image } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const newPost = new Post({
      content,
      image,
      author: req.user.id, // From JWT token
    });

    await newPost.save();

    res.status(201).json({ message: 'Post created successfully', post: newPost });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong', details: error.message });
  }
};

// Fetch posts for the feed
const getPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const posts = await Post.find()
      .populate('author', 'name email') // Include author details
      .sort({ createdAt: -1 }) // Latest posts first
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalPosts = await Post.countDocuments();

    res.status(200).json({
      total: totalPosts,
      page: parseInt(page),
      limit: parseInt(limit),
      posts,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts', details: error.message });
  }
};


// Like or unlike a post
const toggleLikePost = async (req, res) => {
  try {
    const { id } = req.params; // Post ID
    const userId = req.user.id; // User ID from JWT token

    // Find the post
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if the user has already liked the post
    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      // If liked, remove the user from the likes array (unlike)
      post.likes = post.likes.filter((like) => like.toString() !== userId);
    } else {
      // If not liked, add the user to the likes array
      post.likes.push(userId);
    }

    await post.save();

    res.status(200).json({
      message: isLiked ? 'Post unliked successfully' : 'Post liked successfully',
      likes: post.likes.length,
    });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong', details: error.message });
  }
};

// Add a comment to a post
const addCommentToPost = async (req, res) => {
    try {
      const { id } = req.params; // Post ID
      const { text } = req.body; // Comment text
      const userId = req.user.id; // User ID from JWT token
  
      // Validate input
      if (!text || text.trim() === '') {
        return res.status(400).json({ error: 'Comment text is required' });
      }
  
      // Find the post
      const post = await Post.findById(id);
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
  
      // Add the comment to the post
      const newComment = {
        user: userId,
        text,
        createdAt: new Date(),
      };
      post.comments.push(newComment);
  
      await post.save();
  
      res.status(201).json({
        message: 'Comment added successfully',
        comment: newComment,
      });
    } catch (error) {
      res.status(500).json({ error: 'Something went wrong', details: error.message });
    }
  };
  
  module.exports = { createPost, getPosts, toggleLikePost, addCommentToPost };
  