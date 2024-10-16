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
    let { email, whatsappNumber, password, hostelName } = JSON.parse(req.body.userData); // Parse userData from req.body
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
