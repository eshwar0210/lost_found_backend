const express = require('express');
const router = express.Router();
const { createPost } = require('../controllers/postController');

const postcontroller =require('../controllers/postController');
const multer = require('multer');

// Set up multer for handling file uploads
const storage = multer.memoryStorage(); // Use memory storage for the sake of simplicity
const upload = multer({ storage });

// Route to create a post
router.post('/', upload.array('images') , createPost);
router.get('/',postcontroller.getAllPosts);
router.post('/:postId/comment', postcontroller.addComment);
module.exports = router;
