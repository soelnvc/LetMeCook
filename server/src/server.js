require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error.middleware');
const { generalLimiter } = require('./middleware/rateLimit.middleware');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const dishRoutes = require('./routes/dish.routes');
const connectionRoutes = require('./routes/connection.routes');
const messageRoutes = require('./routes/message.routes');
const notificationRoutes = require('./routes/notification.routes');
const safetyRoutes = require('./routes/safety.routes');
const recipeRoutes = require('./routes/recipe.routes');

const app = express();

// Database Connection
connectDB();

// Security & Middleware
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
    credentials: true
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Apply general rate limiting across /api
app.use('/api', generalLimiter);

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'LetMeCook server running' });
});

// Domain Routers
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dishes', dishRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/safety', safetyRoutes);
app.use('/api/recipes', recipeRoutes);

// Centralized Error Handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[LetMeCook Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
