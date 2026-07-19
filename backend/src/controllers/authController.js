const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const demoUsers = [
  { name: 'student', email: 'student123@gmail.com', password: 'student123', role: 'student' },
  { name: 'coordinator', email: 'coordinator123@gmail.com', password: 'coordinator123', role: 'coordinator' },
];

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, department } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name, email, password, role, phone, department });
    res.status(201).json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = (email || '').toLowerCase();

    const demoUser = demoUsers.find((user) => user.email.toLowerCase() === normalizedEmail);

    let existingUser = null;
    try {
      if (mongoose.connection.readyState === 1) {
        existingUser = await User.findOne({ email: normalizedEmail });
      }
    } catch (error) {
      existingUser = null;
    }

    if (demoUser && demoUser.password === password) {
      const userRecord = existingUser || (await User.create({ ...demoUser }).catch(() => null));
      const id = userRecord ? userRecord._id : demoUser.email;
      const name = userRecord ? userRecord.name : demoUser.name;
      const role = userRecord ? userRecord.role : demoUser.role;
      return res.json({
        token: generateToken(id),
        user: {
          id,
          name,
          email: demoUser.email,
          role,
        },
      });
    }

    const user = existingUser;

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    res.json(req.user);
  } catch (error) {
    next(error);
  }
};
