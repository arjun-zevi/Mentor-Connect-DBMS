require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Import routes
const authRoutes = require('./routes/auth');
const mentorRoutes = require('./routes/mentors');
const adminRoutes = require('./routes/admin');
const meetingRoutes = require('./routes/meetings');
const goalRoutes = require('./routes/goals');
const noteRoutes = require('./routes/notes');
const interventionRoutes = require('./routes/interventions');
const reportRoutes = require('./routes/reports');
const parentRoutes = require('./routes/parents');

// Initialize app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/interventions', interventionRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/parents', parentRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
