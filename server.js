const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const householdRoutes = require('./routes/household');
const leaderRoutes = require('./routes/leader');
const alertRoutes = require('./routes/alert');
const ratingRoutes = require('./routes/rating');
const taskRoutes = require('./routes/task');
const nyumbaKumiRoutes = require('./routes/nyumbakumi');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/community_system')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/households', householdRoutes);
app.use('/api/leaders', leaderRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/nyumbakumi', nyumbaKumiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
