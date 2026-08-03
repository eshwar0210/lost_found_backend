const express = require('express');
const authController = require('../controllers/authcontroller.js'); // Import the entire controller
const router = express.Router();
const multer = require('multer');
const { requireAuth } = require('../middleware/auth');

// Set up multer for handling file uploads
const storage = multer.memoryStorage(); // Use memory storage for the sake of simplicity
const upload = multer({ storage });


router.post('/register', upload.single('profilePhoto') ,authController.registerUser); // Use authController.create
router.get('/users/search',authController.searchUsers);
router.get('/user/:id',authController.getUser);
router.put('/user/:uid/profile-picture', requireAuth, upload.single('profilePhoto'), authController.updateProfilePicture);
router.delete('/user/:uid/profile-picture', requireAuth, authController.removeProfilePicture);
router.put('/user/:uid/hostel', requireAuth, authController.updateHostelInfo);
router.post('/survey', requireAuth, authController.addnewsurvey);

module.exports = router;
