const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/autocare_logs';

let isConnected = false;

async function connectMongoDB() {
  if (isConnected) return;

  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 3000, // fail fast if MongoDB not available
      connectTimeoutMS: 3000
    });
    isConnected = true;
    console.log('[MongoDB] Connected to audit log store:', MONGO_URI);
  } catch (err) {
    console.warn('[MongoDB] Not available — audit logging disabled. Error:', err.message);
    isConnected = false;
  }
}

// Graceful disconnect
process.on('beforeExit', async () => {
  if (isConnected) {
    await mongoose.disconnect();
    console.log('[MongoDB] Disconnected.');
  }
});

module.exports = { connectMongoDB, mongoose, isMongoConnected: () => isConnected };
