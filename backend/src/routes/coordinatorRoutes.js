const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, authorizeRoles } = require('../middleware/auth');
const { listStudents, createStudent, updateStudent, deleteStudent, resetStudentPassword, importStudents } = require('../controllers/coordinatorController');
const User = require('../models/User');
const Placement = require('../models/Placement');
const OfferLetter = require('../models/OfferLetter');

const router = express.Router();

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(__dirname, '..', 'uploads', 'offer-letters');
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname).toLowerCase()}`);
    },
  }),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf' && path.extname(file.originalname).toLowerCase() !== '.pdf') {
      return cb(new Error('Only PDF files are allowed for offer letters'));
    }
    cb(null, true);
  },
}).single('file');

router.use(protect, authorizeRoles('coordinator', 'admin'));
router.put('/change-password', async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 6) return res.status(400).json({ message: 'New password must be at least 6 characters' });
    if (newPassword !== confirmPassword) return res.status(400).json({ message: 'New passwords do not match' });
    const user = await User.findById(req.user._id);
    if (!user || !(await user.matchPassword(currentPassword))) return res.status(401).json({ message: 'Current password is incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password changed successfully.' });
  } catch (error) {
    next(error);
  }
});
router.get('/students', listStudents);
router.get('/dashboard-stats', async (req, res, next) => {
  try {
    const [totalStudents, placements, offerLetters, applications] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Placement.find({ status: 'Placed' }),
      OfferLetter.find({ status: 'Received' }),
      User.aggregate([
        { $match: { role: 'student' } },
        { $lookup: { from: 'applications', localField: '_id', foreignField: 'student', as: 'apps' } },
        { $project: { totalApplications: { $size: '$apps' } } },
      ]),
    ]);
    const totalApplications = applications.reduce((sum, item) => sum + (item.totalApplications || 0), 0);
    const placedStudents = placements.length;
    const totalPlaced = placedStudents;
    const totalNotPlaced = Math.max(totalStudents - totalPlaced, 0);
    const offerLettersReceived = offerLetters.length;
    const offerLettersPending = Math.max(totalPlaced - offerLettersReceived, 0);
    res.json({
      totalStudents,
      activePlacementDrives: 0,
      totalApplications,
      studentsPlaced: totalPlaced,
      studentsNotPlaced: totalNotPlaced,
      offerLettersReceived,
      offerLettersPending,
      placementRate: totalStudents ? Number(((totalPlaced / totalStudents) * 100).toFixed(2)) : 0,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/placements', async (req, res, next) => {
  try {
    const placements = await User.find({ role: 'student' }).lean();
    const rows = placements.map((student) => ({
      studentId: student._id,
      name: student.name,
      rollNo: student.rollNo,
      department: student.department,
      company: student.currentPlacement?.company || '-',
      package: student.currentPlacement?.package || 0,
      placementStatus: student.currentPlacement?.company ? 'Placed' : 'Not Placed',
      offerLetterStatus: student.currentPlacement?.offerLetterStatus || 'Pending',
      offerLetter: student.currentPlacement?.offerLetter || null,
    }));
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

router.get('/offer-letters', async (req, res, next) => {
  try {
    const students = await User.find({ role: 'student' }).lean();
    const rows = students
      .filter((student) => student.currentPlacement?.company)
      .map((student) => ({
        studentId: student._id,
        name: student.name,
        rollNo: student.rollNo,
        department: student.department,
        company: student.currentPlacement.company,
        package: student.currentPlacement.package,
        placementStatus: 'Placed',
        offerLetterStatus: student.currentPlacement.offerLetterStatus || 'Pending',
        offerLetter: student.currentPlacement.offerLetter || null,
      }));
    res.json({
      totalReceived: rows.filter((row) => row.offerLetterStatus === 'Received').length,
      totalPending: rows.filter((row) => row.offerLetterStatus === 'Pending').length,
      rows,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/offer-letters', (req, res, next) => {
  upload(req, res, async (uploadError) => {
    if (uploadError) return res.status(400).json({ message: uploadError.message || 'Offer letter upload failed' });
    if (!req.file) return res.status(400).json({ message: 'PDF offer letter is required' });
    try {
      const { studentId } = req.body;
      const student = await User.findOne({ _id: studentId, role: 'student' });
      if (!student) return res.status(404).json({ message: 'Student not found' });
      if (!student.currentPlacement?.company) return res.status(400).json({ message: 'Student must be placed before an offer letter can be uploaded' });
      const fileUrl = `/uploads/offer-letters/${req.file.filename}`;

      student.currentPlacement.offerLetterStatus = 'Received';
      student.currentPlacement.offerLetter = fileUrl;
      student.placementHistory = Array.isArray(student.placementHistory) ? student.placementHistory : [];
      student.placementHistory = student.placementHistory.map((item) => item.company === student.currentPlacement.company && item.package === student.currentPlacement.package ? { ...item, offerLetterStatus: 'Received', offerLetter: fileUrl } : item);
      await student.save();

      const placement = await Placement.findOneAndUpdate(
        { studentId: student._id, company: student.currentPlacement.company, package: student.currentPlacement.package },
        { offerLetterStatus: 'Received', offerLetter: fileUrl },
        { new: true, upsert: true }
      );

      const offer = await OfferLetter.findOneAndUpdate(
        { studentId: student._id, placementId: placement._id },
        { company: student.currentPlacement.company, package: student.currentPlacement.package, fileUrl, status: 'Received', uploadedAt: new Date() },
        { upsert: true, new: true }
      );

      res.status(201).json({ offer, placement, student });
    } catch (error) {
      next(error);
    }
  });
});

router.get('/placement-tracking', async (req, res, next) => {
  try {
    const students = await User.find({ role: 'student' }).lean();
    const rows = students.map((student) => ({
      _id: student._id,
      name: student.name,
      rollNo: student.rollNo,
      department: student.department,
      company: student.currentPlacement?.company || '-',
      package: student.currentPlacement?.package || 0,
      placementStatus: student.currentPlacement?.company ? 'Placed' : 'Not Placed',
      offerLetterStatus: student.currentPlacement?.offerLetterStatus || 'Pending',
    }));
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

router.post('/students/:id/reset-password', resetStudentPassword);
router.post('/students', createStudent);
router.post('/students/import', importStudents);
router.put('/students/:id', updateStudent);
router.delete('/students/:id', deleteStudent);
router.get('/students', listStudents);

module.exports = router;
