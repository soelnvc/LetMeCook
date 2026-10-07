const dns = require('dns');
const mongoose = require('mongoose');
const seedPeers = require('../utils/seedPeers');

// Configure reliable DNS resolvers for MongoDB Atlas SRV / shard lookups
// Prevents ENOTFOUND errors on networks whose local DNS fails on CNAME/SRV records
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '1.0.0.1']);
} catch (e) {
  // Ignore in environments where setServers is restricted
}

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
