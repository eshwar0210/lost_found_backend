// models/Post.js
const mongoose = require('mongoose');

// Define the schema for a post
const postSchema = new mongoose.Schema({
    location: {
        type: String,
        required: true,
    },
    postType: {
        type: String,
        enum: ['lost', 'found'], // Enum for post types
        required: true,
    },
    description: {
        type: String,
        required: false, // Optional
    },
    imageUrls: {
        type: [String], // Array of strings for image URLs
        required: true,
    },
    uid: {
        type: String,
        required: true, // User ID must be associated with the post
    },
    createdAt: {
        type: Date,
        default: Date.now, // Automatically set the date when the post is created
    },
});

// Create the Post model
const Post = mongoose.model('Post', postSchema);

module.exports = Post;
