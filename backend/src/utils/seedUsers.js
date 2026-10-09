const mongoose = require('mongoose');
const User = require('../models/User');

const seedUsers = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return;
    }
    const email = process.env.COORDINATOR_EMAIL;
    const password = process.env.COORDINATOR_PASSWORD;
    if (!email || !password) return;
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (!existingUser) await User.create({ name: process.env.COORDINATOR_NAME || 'Placement Coordinator', email, password, role: 'coordinator' });
  } catch (error) {
    console.warn('Demo user seeding skipped:', error.message);
  }
};

module.exports = seedUsers;
