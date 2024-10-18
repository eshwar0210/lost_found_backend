const { admin, bucket } = require('../firebase'); // Import Firebase admin
const User = require('../models/User'); // Import your User model
const multer = require('multer');
const { v4: uuid } = require('uuid');

const upload = multer();

const uploadProfilePhoto = async (file) => {
    const fileName = `profile-photos/${uuid()}-${file.originalname}`; // Unique filename
    const storageRef = bucket.file(fileName);

    await storageRef.save(file.buffer, {
        contentType: file.mimetype,
        metadata: {
            firebaseStorageDownloadTokens: uuid(), // Generate a token if needed
        },
    });
    await storageRef.makePublic();
    return storageRef.publicUrl(); // Return the public URL of the uploaded photo
};

exports.registerUser = async (req, res) => {
    let { email, whatsappNumber, password, hostelName, name } = JSON.parse(req.body.userData); // Parse userData from req.body
    let profilePhotoURL = null;

    try {
        // Step 1: Create a user in Firebase Authentication
        const userRecord = await admin.auth().createUser({
            email,
            password, // Firebase Auth securely handles password
        });

        // Step 2: Get the user object
        const uid = userRecord.uid;

        // Step 3: Handle profile photo upload if provided
        if (req.file) {
            profilePhotoURL = await uploadProfilePhoto(req.file); // Upload photo if available
        }

        // Step 4: Create a new user instance in MongoDB
        const newUser = new User({
            uid,
            email,
            name,
            whatsappNumber,
            hostelName,
            profilePhotoUrl: profilePhotoURL || null, // Default to null if no photo
        });

        // Step 5: Save user to the database
        await newUser.save();

        // Send response back to frontend, including user ID
        res.status(201).json({
            message: 'User registered successfully.',
            uid: uid, // Return UID for the frontend
        });
    } catch (error) {
        console.error(error);
        if (error.code === 'auth/email-already-exists') {
            return res.status(400).json({ error: 'User already exists' });
        }
        res.status(500).json({ error: 'Registration failed' });
    }
};


exports.getUser = async (req, res) => {

    try {

        const id = req.params.id;

        const user = await User.findOne({ uid: id });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Respond with the found user
        res.status(200).json(user);
    } catch (error) {
        console.error('Error finding user:', error);
        res.status(500).json({ message: 'Server error' });
    }

};

// Function to delete the current profile picture from Firebase
const deleteCurrentProfilePicture = async (imageUrl) => {
    if (!imageUrl) return; // Skip if there's no image URL

    // Extract the file name from the URL
    const fileName = decodeURIComponent(imageUrl.split('/').pop().split('?')[0]);
    const fileRef = bucket.file(fileName);

    try {
        await fileRef.delete(); // Delete file from Firebase Storage
        console.log(`Profile picture deleted: ${fileName}`);
    } catch (error) {
        console.error('Error deleting profile picture:', error);
    }
};



// Function to update profile picture
exports.updateProfilePicture = async (req, res) => {
    const { uid } = req.params; // Fetch UID from request params
    const { currentProfilePhotoUrl } = req.body; // Current photo URL passed from frontend

    try {
        // Fetch the user from MongoDB
        const user = await User.findOne({ uid });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Delete the current profile picture if it exists
        if (currentProfilePhotoUrl) {
            await deleteCurrentProfilePicture(currentProfilePhotoUrl);
        }

        // Upload the new image file from request
        const newProfilePhotoUrl = await uploadProfilePhoto(req.file); // 'req.file' holds the uploaded file

        // Update user's profile photo URL in MongoDB
        user.profilePhotoUrl = newProfilePhotoUrl;
        await user.save();

        res.status(200).json({
            message: 'Profile picture updated successfully',
            newProfilePhotoUrl,
        });
    } catch (error) {
        console.error('Error updating profile picture:', error);
        res.status(500).json({ message: 'Failed to update profile picture' });
    }
};


// Function to remove a profile picture
exports.removeProfilePicture = async (req, res) => {
    const { uid } = req.params; // Get user ID from parameters
    const { currentProfilePhotoUrl } = req.body; // Get current profile photo URL from request body

    if (!currentProfilePhotoUrl) {
        return res.status(400).json({ message: 'No profile photo URL provided' });
    }

    try {
        // Call the utility function to delete the image from Firebase
        await deleteCurrentProfilePicture(currentProfilePhotoUrl);

        // Update user document by setting profilePhotoUrl to null
        await User.updateOne({ uid }, { profilePhotoUrl: null }); // Update the user's profilePhotoUrl
        return res.status(200).json({ message: 'Profile picture removed successfully' });
    } catch (error) {
        console.error('Error removing profile picture:', error);
        return res.status(500).json({ message: 'Error removing profile picture' });
    }
};

