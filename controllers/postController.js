const Post = require('../models/Posts'); 
const { v4: uuid } = require('uuid');
const multer = require('multer');
const upload = multer(); // Use multer for handling file uploads
const { admin, bucket } = require('../firebase'); // Import Firebase admin and bucket

// Function to upload multiple images
const uploadImages = async (files) => {
    const uploadedImageUrls = await Promise.all(files.map(async (file) => {
        const fileName = `posts/${uuid()}-${file.originalname}`; // Unique filename
        const storageRef = bucket.file(fileName);

        await storageRef.save(file.buffer, {
            contentType: file.mimetype,
            metadata: {
                firebaseStorageDownloadTokens: uuid(), // Generate a token if needed
            },
        });

        await storageRef.makePublic(); // Make the file publicly accessible
        return storageRef.publicUrl(); // Return the public URL of the uploaded image
    }));
    return uploadedImageUrls;
};

exports.createPost = async (req, res) => {
    try {
        console.log("API endpoint triggered");

        const { location, postType, description, uid } = req.body; // Get post data from request body

        // Check if files are uploaded
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No images uploaded' });
        }

        // Log the received files and body for debugging
        // console.log("Uploaded files:", req.files);
        // console.log("Request body:", req.body);

        // Upload images to Firebase Storage
        const imageUrls = await uploadImages(req.files);
        // console.log("Uploaded Image URLs:", imageUrls);

        // Create a new post document
        const newPost = new Post({
            location,
            postType,
            description,
            imageUrls,
            uid, 
        });

        // Save the post in the database
        await newPost.save();

        // Send success response
        res.status(201).json({ message: 'Post created successfully', post: newPost });

    } catch (error) {
        console.error('Error while creating post:', error); // Log the error for debugging
        res.status(500).json({ error: 'Error while creating post' });
    }
};


// In your posts controller
exports.getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find(); // Fetch all posts from the database
        res.status(200).json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Error fetching posts' });
    }
};

