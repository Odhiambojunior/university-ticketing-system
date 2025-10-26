require('dotenv').config();
const express = require('express');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const app = express();
const cors = require('cors');
const ticketRoutes = require('./routes/ticketRoutes');
const messageRoutes = require('./routes/messageRoutes');

// Connect to database
connectDB();

// Middleware
app.use(express.json());
app.use(cors({
    origin: [
        'https://uniticket.onrender.com',
        'http://localhost:5173',
        'http://localhost:5000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.urlencoded({ extended: true }));

// API Routes - These must come BEFORE the static file serving
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/tickets', messageRoutes);

// API root endpoint
app.get('/api', (req, res) => {
    res.json({
        success: true, 
        message: 'University Ticketing System API is running', 
        version: '1.0.0' 
    });
});

// Serve static files from React app (FIXED PATH)
app.use(express.static(path.join(__dirname, '../client')));

// Catch-all handler for React app - serves index.html for all non-API routes
// This MUST be LAST, after all API routes and static file serving
app.use((req, res, next) => {
    // Only serve index.html for non-API routes
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, '../client/index.html'));
    } else {
        next();
    }
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ 
        success: false, 
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.stack : {} 
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});