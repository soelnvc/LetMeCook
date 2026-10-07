const mongoose = require('mongoose');
const seedPeers = require('../utils/seedPeers');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/letmecook');
    console.log(`[MongoDB] Connected: ${conn.connection.host}`);
    await seedPeers();
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    console.warn('[MongoDB] Server is running without active database connection. Check Atlas IP whitelist or MONGO_URI.');
  }
};

module.exports = connectDB;
