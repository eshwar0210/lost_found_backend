const express = require('express');
const router = express.Router();
const { createPost } = require('../controllers/postController');

const postcontroller =require('../controllers/postController');
const multer = require('multer');
const { requireAuth } = require('../middleware/auth');

// Set up multer for handling file uploads
const storage = multer.memoryStorage(); // Use memory storage for the sake of simplicity
const upload = multer({ storage });

// Route to create a post
router.post('/', requireAuth, upload.array('images') , createPost);
router.get('/',postcontroller.getAllPosts);
router.post('/:postId/comment', requireAuth, postcontroller.addComment);
router.get('/user/:uid', postcontroller.getPostsByUserId);
router.get('/:id', postcontroller.getPostById);
router.put('/:postId/comment/:commentId', requireAuth, postcontroller.updateComment);
router.delete('/:postId/comment/:commentId', requireAuth, postcontroller.deleteComment);
router.put('/:id', requireAuth, upload.array('images'), postcontroller.updatePost);
router.delete('/:id', requireAuth, postcontroller.deletePost);

module.exports = router;
