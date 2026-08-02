const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { verifyFirebaseConnection } = require('./firebase');

// Routes
const authRoutes = require('./routes/authroutes');
const postRoutes = require('./routes/posts');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Firebase
verifyFirebaseConnection();

// Middleware
app.use(cors());
app.use(express.json());

// Router
app.use('/auth', authRoutes);
app.use('/post', postRoutes);

// Serve the production build of the client
const clientBuildPath = path.join(__dirname, 'client', 'build');
app.use(express.static(clientBuildPath));

app.get('/*', function (req, res) {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});


mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});