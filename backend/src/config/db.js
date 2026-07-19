const mongoose = require('mongoose');

mongoose.set('bufferCommands', false);

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campusconnect', {
      autoIndex: true,
      serverSelectionTimeoutMS: 3000,
      socketTimeoutMS: 3000,
      connectTimeoutMS: 3000,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn('MongoDB not available, continuing with demo auth fallback:', error.message);
    return null;
  }
};

module.exports = connectDB;
