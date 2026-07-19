const mongoose = require('mongoose');
const User = require('../models/User');

const seedUsers = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return;
    }
    const demoUsers = [
      {
        name: 'student',
        email: 'student123@gmail.com',
        password: 'student123',
        role: 'student',
      },
      {
        name: 'coordinator',
        email: 'coordinator123@gmail.com',
        password: 'coordinator123',
        role: 'coordinator',
      },
    ];

    for (const userData of demoUsers) {
      const existingUser = await User.findOne({ email: userData.email });

      if (!existingUser) {
        await User.create(userData);
        console.log(`Seeded demo user: ${userData.email}`);
      }
    }
  } catch (error) {
    console.warn('Demo user seeding skipped:', error.message);
  }
};

module.exports = seedUsers;
