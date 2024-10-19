const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { verifyFirebaseConnection } = require('./firebase');

const dotenv = require('dotenv');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const path = require('path');

// Routes 
const authRoutes = require('./routes/authroutes.js'); 
const postRoutes = require('./routes/posts');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// firebase
verifyFirebaseConnection();


// Middleware
app.use(cors());
app.use(express.json());

// router
app.use('/auth', authRoutes);
app.use('/post', postRoutes);


// deployment code

app.use(express.static(path.join(__dirname, 'build')));

app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
})


mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});