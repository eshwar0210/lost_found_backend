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
        // console.log("API for creating post triggered");

        const { location, postType, description, uid } = req.body; // Get post data from request body

        let imageUrls = [];
        // Check if files are uploaded
        // Log the received files and body for debugging
        // console.log("Uploaded files:", req.files);
        // console.log("Request body:", req.body);

        // Upload images to Firebase Storage
        if (req.files) {
            imageUrls = await uploadImages(req.files);
        }

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



exports.getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find(); // Fetch all posts from the database
        res.status(200).json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Error fetching posts' });
    }
};

exports.addComment = async (req, res) => {
    const { postId } = req.params;
    const { userId, userName, comment } = req.body;
    try {
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ error: 'Post not found.' });
        }

        const newComment = {
            userId,
            userName,
            comment,
        };

        post.comments.push(newComment); // Add the comment to the post's comment array

        await post.save(); // Save the updated post

        res.status(200).json({ message: 'Comment added successfully', post });
    } catch (error) {
        console.error('Error while adding comment:', error);
        res.status(500).json({ error: 'Server error while adding comment.' });
    }
};


exports.getPostsByUserId = async (req, res) => {
    const { uid } = req.params; // Extract user ID from parameters
    try {
        const posts = await Post.find({ uid }); // Fetch posts with the matching user ID
        res.json(posts); // Send the fetched posts as a response
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ message: 'Error fetching posts.' }); // Handle errors
    }
};

exports.updatePost = async (req, res) => {

    // console.log("UPDATE POST TRIGGERED");
    const { description, location, postType } = req.body;
    const { id } = req.params;

    // console.log(req.body);
    try {
        // Find the post by ID and update its fields
        const updatedPost = await Post.findByIdAndUpdate(id, {
            description,
            location,
            postType
        }, { new: true }); // Return the updated post

        if (!updatedPost) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.status(200).json(updatedPost); // Send the updated post as response
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

const deletePostImage = async (imageUrl) => {
    if (!imageUrl) {
        throw new Error('Invalid image URL provided.');
    }

    try {
        // Extract the file name from the URL
        const fileName = decodeURIComponent(imageUrl.split('/').pop().split('?')[0]);
        const fileRef = bucket.file(fileName); // Get a reference to the file

        await fileRef.delete(); // Attempt to delete the file
        console.log(`Successfully deleted image: ${fileName}`); // Log success
    } catch (error) {
        console.error('Error in deletePostImage:', error);
        throw error; // Re-throw error to be handled in deletePost
    }
};


exports.deletePost = async (req, res) => {
    const postId = req.params.id;

    try {
        // First, find the post by ID to retrieve the image URLs
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found!' });
        }

        // Log the imageUrls for debugging
        console.log('Image URLs:', post.imageUrls);

        // Check if imageUrls is defined and is an array
        if (!post.imageUrls || !Array.isArray(post.imageUrls) || post.imageUrls.length === 0) {
            // If no images are found, still proceed to delete the post
            console.log('No images to delete, proceeding to delete the post.');
        } else {
            // Delete images from Firebase Storage
            const deletionPromises = post.imageUrls.map(async (imageUrl) => {
                // Log the current imageUrl for debugging
                console.log('Deleting image URL:', imageUrl);
                await deletePostImage(imageUrl); // Call the delete function
            });

            // Wait for all deletions to complete
            await Promise.all(deletionPromises);
        }

        // Now, delete the post from the database
        await Post.findByIdAndDelete(postId);
        res.status(200).json({ message: 'Post and corresponding images deleted successfully!' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ message: 'Failed to delete post.' });
    }
};


exports.updateComment = async (req, res) => {
    const { postId, commentId } = req.params; // Get postId and commentId from the request parameters
    const { comment: updatedComment } = req.body; // Get the updated comment content from the request body
   

    try {
        // Find the post by ID
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Find the comment by its ID within the post
        const commentToUpdate = post.comments.id(commentId);

        if (!commentToUpdate) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        
       

        // Update the comment content
        commentToUpdate.comment = updatedComment;

        // Save the updated post document
        await post.save();

        res.status(200).json({ message: 'Comment updated successfully', comment: commentToUpdate });
    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteComment = async (req, res) => {
    const { postId, commentId } = req.params; // Get postId and commentId from the request parameters

    try {
        // Find the post by ID
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Find the comment by its ID within the post's comments array
        const commentToDelete = post.comments.id(commentId);

        if (!commentToDelete) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Remove the comment from the comments array
        post.comments.pull(commentId);

        // Save the updated post document
        await post.save();

        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
