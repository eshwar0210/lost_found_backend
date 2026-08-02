const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  uid: {
    type: String,
    required : true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    
  },
  whatsappNumber: {
    type: String,
    required: true,
  },
  hostelName: {
    type: String,
    required: true,
  },
  profilePhotoUrl: {
    type: String, // URL of profile photo stored in Firebase
    default: null, // Optional field
  },
  surveys: {
        type: [String], // Array of strings to store survey responses
        default: [], // Initialize with an empty array
    },
    
}, { timestamps: true }); // Automatically add createdAt and updatedAt fields

module.exports = mongoose.model('User', userSchema);
