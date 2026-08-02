// models/Post.js
const mongoose = require('mongoose');

// Define the schema for comments
const commentSchema = new mongoose.Schema({
    userId: {
        type: String, // Store the user ID to allow editing and deleting by the user later
        required: true,
    },
    userName: {
        type: String, // Store the user's name for displaying in the comments
        required: true,
    },
    comment: {
        type: String, // The actual comment text
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now, // Automatically set the date when the comment is created
    },
});

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
    },
    uid: {
        type: String,
        required: true, // User ID must be associated with the post
    },
    createdAt: {
        type: Date,
        default: Date.now, // Automatically set the date when the post is created
    },
    comments: {
        type: [commentSchema], // Array of comments
        default: [], // Empty array by default
    },
});

// Create the Post model
const Post = mongoose.model('Post', postSchema);

module.exports = Post;
