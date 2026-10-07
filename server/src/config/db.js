const mongoose = require('mongoose');
const seedPeers = require('../utils/seedPeers');

let isConnecting = false;

const connectDB = async () => {
  if (isConnecting || mongoose.connection.readyState === 1) return;
  isConnecting = true;
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/letmecook', {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
    await seedPeers();
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    console.warn('[MongoDB] Retrying connection in 5s... Please add your current IP to MongoDB Atlas Network Access.');
    setTimeout(() => {
      isConnecting = false;
      connectDB();
    }, 5000);
  } finally {
    isConnecting = false;
  }
};

module.exports = connectDB;
