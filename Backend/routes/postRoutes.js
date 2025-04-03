const express = require('express');
const router = express.Router();
const { createPost, getPosts, toggleLikePost, addCommentToPost } = require('../controllers/postController');
const { protect } = require('../middlewares/authMiddleware');

// Route to create a post
router.post('/', protect, createPost);

// Route to fetch posts
router.get('/', protect, getPosts);

// Route to like/unlike a post
router.put('/:id/like', protect, toggleLikePost);

// Route to add a comment to a post
router.post('/:id/comment', protect, addCommentToPost);

module.exports = router;
