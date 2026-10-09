const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, '..', 'uploads', 'resumes');
      fs.mkdirSync(uploadDir, { recursive: true });
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      cb(null, `${req.user._id}-${Date.now()}${path.extname(file.originalname).toLowerCase()}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf' || path.extname(file.originalname).toLowerCase() !== '.pdf') {
      return cb(new Error('Only PDF resumes are allowed'));
    }
    cb(null, true);
  },
}).single('resume');

const publicStudent = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  rollNo: user.rollNo,
  gender: user.gender,
  phone: user.phone,
  department: user.department,
  cgpa: user.cgpa,
  arrears: user.arrears,
  tenthPercentage: user.tenthPercentage,
  twelfthPercentage: user.twelfthPercentage,
  resume: user.resume,
  skills: user.skills || [],
  currentPlacement: user.currentPlacement || null,
  placementHistory: user.placementHistory || [],
});

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user || user.role !== 'student') return res.status(404).json({ message: 'Student not found' });
    res.json(publicStudent(user));
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const allowed = ['name', 'email', 'phone', 'department', 'cgpa', 'arrears', 'gender', 'rollNo', 'tenthPercentage', 'twelfthPercentage'];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
    if (updates.email) {
      updates.email = String(updates.email).toLowerCase().trim();
      const duplicate = await User.findOne({ email: updates.email, _id: { $ne: req.user._id } });
      if (duplicate) return res.status(409).json({ message: 'Email already exists' });
    }
    const user = await User.findOneAndUpdate({ _id: req.user._id, role: 'student' }, updates, { new: true, runValidators: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'Student not found' });
    await StudentProfile.findOneAndUpdate({ user: user._id }, {
      department: user.department,
      cgpa: user.cgpa,
      arrears: user.arrears,
      tenthPercentage: user.tenthPercentage,
      twelfthPercentage: user.twelfthPercentage,
      phoneNumber: user.phone,
      registerNumber: user.rollNo,
      skills: user.skills,
      resume: user.resume,
    }, { upsert: true, new: true, setDefaultsOnInsert: true });
    res.json(publicStudent(user));
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 6) return res.status(400).json({ message: 'New password must be at least 6 characters' });
    if (newPassword !== confirmPassword) return res.status(400).json({ message: 'New passwords do not match' });
    const user = await User.findOne({ _id: req.user._id, role: 'student' });
    if (!user || !(await user.matchPassword(currentPassword))) return res.status(401).json({ message: 'Current password is incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password changed successfully.' });
  } catch (error) {
    next(error);
  }
};

exports.getMyPlacement = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'Student not found' });
    const placement = user.currentPlacement || {
      company: '',
      role: '',
      package: 0,
      offerLetterStatus: 'Pending',
      offerLetter: null,
      placedAt: null,
    };
    const placementHistory = user.placementHistory || [];
    res.json({
      placement,
      placementHistory,
      isPlaced: Boolean(user.currentPlacement && user.currentPlacement.company),
      offerLetterStatus: placement.offerLetterStatus || 'Pending',
      offerLetter: placement.offerLetter || null,
    });
  } catch (error) {
    next(error);
  }
};

exports.getHigherPackageDrives = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'Student not found' });

    const Drive = require('../models/Drive');
    const drives = await Drive.find({ status: 'open' }).sort({ createdAt: -1 }).lean();
    const currentPackage = Number(user.currentPlacement?.package || user.placementHistory?.slice(-1)[0]?.package || 0);
    const minimumPackage = currentPackage * 2;

    const filtered = currentPackage > 0
      ? drives.filter((drive) => {
          const drivePackage = Number(String(drive.package || drive.salaryPackage || 0).replace(/[^\d.]/g, '')) || 0;
          return drivePackage >= minimumPackage;
        })
      : drives;

    res.json(filtered);
  } catch (error) {
    next(error);
  }
};

exports.updateSkills = async (req, res, next) => {
  try {
    const skills = Array.isArray(req.body.skills) ? [...new Set(req.body.skills.map((skill) => String(skill).trim()).filter(Boolean))] : null;
    if (!skills) return res.status(400).json({ message: 'Skills must be an array' });
    const user = await User.findOneAndUpdate({ _id: req.user._id, role: 'student' }, { skills }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'Student not found' });
    await StudentProfile.findOneAndUpdate({ user: user._id }, { skills }, { upsert: true, setDefaultsOnInsert: true });
    res.json({ skills: user.skills });
  } catch (error) {
    next(error);
  }
};

exports.uploadResume = async (req, res, next) => {
  upload(req, res, async (error) => {
    if (error) return res.status(400).json({ message: error.message || 'Resume upload failed' });
    if (!req.file) return res.status(400).json({ message: 'PDF resume is required' });
    try {
      const resume = `/uploads/resumes/${req.file.filename}`;
      const user = await User.findOneAndUpdate({ _id: req.user._id, role: 'student' }, { resume }, { new: true }).select('-password');
      if (!user) return res.status(404).json({ message: 'Student not found' });
      await StudentProfile.findOneAndUpdate({ user: user._id }, { resume }, { upsert: true, setDefaultsOnInsert: true });
      res.json({ resume });
    } catch (dbError) {
      next(dbError);
    }
  });
};

exports.publicStudent = publicStudent;
