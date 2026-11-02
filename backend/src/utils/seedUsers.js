const mongoose = require('mongoose');
const User = require('../models/User');

const seedUsers = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return;
    }

    const seedAccounts = [
      {
        email: process.env.COORDINATOR_EMAIL,
        password: process.env.COORDINATOR_PASSWORD,
        name: process.env.COORDINATOR_NAME || 'Placement Coordinator',
        role: 'coordinator',
      },
      {
        email: process.env.TEST_LOGIN_EMAIL,
        password: process.env.TEST_LOGIN_PASSWORD,
        name: process.env.TEST_LOGIN_NAME || 'Testing User',
        role: process.env.TEST_LOGIN_ROLE || 'student',
      },
    ];

    for (const account of seedAccounts) {
      if (!account.email || !account.password) continue;
      const existingUser = await User.findOne({ email: account.email.toLowerCase() });
      if (!existingUser) {
        await User.create({
          name: account.name,
          email: account.email,
          password: account.password,
          role: account.role,
        });
      }
    }
  } catch (error) {
    console.warn('Demo user seeding skipped:', error.message);
  }
};

module.exports = seedUsers;
