const mongoose = require('mongoose');

mongoose.set('bufferCommands', false);

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const candidateUris = [
    process.env.MONGODB_URI,
    process.env.MONGO_URI,
    'mongodb://127.0.0.1:27017/campusconnect',
  ].filter(Boolean);

  let lastError = null;

  for (const mongoUri of candidateUris) {
    try {
      const conn = await mongoose.connect(mongoUri, {
        autoIndex: true,
        serverSelectionTimeoutMS: 3000,
        socketTimeoutMS: 3000,
        connectTimeoutMS: 3000,
      });
      console.log(`MongoDB connected: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      lastError = error;
      console.warn(`MongoDB connection failed for ${mongoUri}: ${error.message}`);
    }
  }

  console.warn('All configured MongoDB connections failed.');
  if (lastError) {
    console.warn(lastError.message);
  }
  return null;
};

module.exports = connectDB;
