const multer = require('multer');
const ExcelJS = require('exceljs');
const { Readable } = require('stream');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');

const importUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.csv', '.xlsx', '.xls'];
    if (!allowed.includes(file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.')))) return cb(new Error('Only CSV or Excel files are allowed'));
    cb(null, true);
  },
}).single('file');

const fields = ['name', 'rollNo', 'gender', 'department', 'email', 'phone', 'cgpa', 'arrears', 'password'];
const toStudent = (user) => ({
  id: user._id,
  name: user.name,
  rollNo: user.rollNo,
  gender: user.gender,
  department: user.department,
  email: user.email,
  phone: user.phone,
  cgpa: user.cgpa,
  arrears: user.arrears,
  tenthPercentage: user.tenthPercentage,
  twelfthPercentage: user.twelfthPercentage,
  resume: user.resume,
  skills: user.skills || [],
  role: user.role,
});

const normalizeStudent = (body) => ({
  name: String(body.name || '').trim(),
  rollNo: String(body.rollNo || '').trim(),
  gender: String(body.gender || '').trim(),
  department: String(body.department || '').trim(),
  email: String(body.email || '').trim().toLowerCase(),
  phone: String(body.phone || '').trim(),
  cgpa: Number(body.cgpa),
  arrears: Number(body.arrears),
  tenthPercentage: Number.isFinite(Number(body.tenthPercentage)) ? Number(body.tenthPercentage) : 0,
  twelfthPercentage: Number.isFinite(Number(body.twelfthPercentage)) ? Number(body.twelfthPercentage) : 0,
  password: String(body.password || ''),
});

const validateStudent = (student, requirePassword = true) => {
  const missing = fields.filter((field) => (requirePassword || field !== 'password') && String(student[field] ?? '').trim() === '');
  if (missing.length) return `Missing fields: ${missing.join(', ')}`;
  if (!Number.isFinite(student.cgpa) || student.cgpa < 0 || student.cgpa > 10) return 'CGPA must be between 0 and 10';
  if (!Number.isInteger(student.arrears) || student.arrears < 0) return 'Arrears must be a non-negative whole number';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.email)) return 'Invalid email';
  if (requirePassword && student.password.length < 6) return 'Password must be at least 6 characters';
  return null;
};

const syncProfile = async (user) => StudentProfile.findOneAndUpdate({ user: user._id }, {
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

exports.listStudents = async (req, res, next) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password').sort({ name: 1 });
    res.json({ total: students.length, students: students.map(toStudent) });
  } catch (error) {
    next(error);
  }
};

exports.createStudent = async (req, res, next) => {
  try {
    const student = normalizeStudent(req.body);
    const validationError = validateStudent(student);
    if (validationError) return res.status(400).json({ message: validationError });
    const duplicate = await User.findOne({ $or: [{ email: student.email }, { rollNo: student.rollNo }] });
    if (duplicate) return res.status(409).json({ message: 'Email or roll number already exists' });
    const user = await User.create({ ...student, role: 'student' });
    await syncProfile(user);
    res.status(201).json(toStudent(user));
  } catch (error) {
    next(error);
  }
};

exports.updateStudent = async (req, res, next) => {
  try {
    const updates = normalizeStudent({ ...req.body, password: undefined });
    delete updates.password;
    const validationError = validateStudent({ ...updates, password: 'validpassword' }, false);
    if (validationError) return res.status(400).json({ message: validationError });
    const duplicate = await User.findOne({ role: 'student', _id: { $ne: req.params.id }, $or: [{ email: updates.email }, { rollNo: updates.rollNo }] });
    if (duplicate) return res.status(409).json({ message: 'Email or roll number already exists' });
    const user = await User.findOneAndUpdate({ _id: req.params.id, role: 'student' }, updates, { new: true, runValidators: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'Student not found' });
    await syncProfile(user);
    res.json(toStudent(user));
  } catch (error) {
    next(error);
  }
};

exports.deleteStudent = async (req, res, next) => {
  try {
    const user = await User.findOneAndDelete({ _id: req.params.id, role: 'student' });
    if (!user) return res.status(404).json({ message: 'Student not found' });
    await StudentProfile.deleteOne({ user: user._id });
    res.json({ message: 'Student deleted' });
  } catch (error) {
    next(error);
  }
};

exports.resetStudentPassword = async (req, res, next) => {
  try {
    const password = String(req.body.password || '');
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
    const user = await User.findOne({ _id: req.params.id, role: 'student' });
    if (!user) return res.status(404).json({ message: 'Student not found' });
    user.password = password;
    await user.save();
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
};

const readRows = async (file) => {
  const workbook = new ExcelJS.Workbook();
  const extension = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));
  if (extension === '.csv') await workbook.csv.read(Readable.from(file.buffer));
  else await workbook.xlsx.load(file.buffer);
  const worksheet = workbook.worksheets[0];
  if (!worksheet) return [];
  const headers = worksheet.getRow(1).values.slice(1).map((header) => String(header || '').trim().toLowerCase().replace(/[^a-z0-9]/g, ''));
  const aliases = { rollno: 'rollNo', rollnumber: 'rollNo', phone: 'phone', phonenumber: 'phone', numberofarrears: 'arrears', arrears: 'arrears', cgpa: 'cgpa' };
  return worksheet.getRows(2, Math.max(worksheet.rowCount - 1, 0)).map((row) => {
    const result = {};
    headers.forEach((header, index) => {
      const key = aliases[header] || (header === 'name' ? 'name' : header === 'gender' ? 'gender' : header === 'department' ? 'department' : header === 'email' ? 'email' : header === 'password' ? 'password' : header);
      result[key] = row.getCell(index + 1).value ?? '';
    });
    return result;
  });
};

exports.importStudents = async (req, res, next) => {
  importUpload(req, res, async (uploadError) => {
    if (uploadError) return res.status(400).json({ message: uploadError.message || 'Import upload failed' });
    if (!req.file) return res.status(400).json({ message: 'CSV or Excel file is required' });
    try {
      const rows = await readRows(req.file);
      const failures = [];
      const imported = [];
      const seenEmails = new Set();
      const seenRollNos = new Set();
      for (let index = 0; index < rows.length; index += 1) {
        const student = normalizeStudent(rows[index]);
        const rowNumber = index + 2;
        const validationError = validateStudent(student);
        if (validationError || seenEmails.has(student.email) || seenRollNos.has(student.rollNo)) {
          failures.push({ row: rowNumber, reason: validationError || 'Duplicate email or roll number in file' });
          continue;
        }
        const duplicate = await User.findOne({ $or: [{ email: student.email }, { rollNo: student.rollNo }] });
        if (duplicate) {
          failures.push({ row: rowNumber, reason: 'Email or roll number already exists' });
          continue;
        }
        const user = await User.create({ ...student, role: 'student' });
        await syncProfile(user);
        imported.push(toStudent(user));
        seenEmails.add(student.email);
        seenRollNos.add(student.rollNo);
      }
      res.status(201).json({ imported: imported.length, failed: failures.length, failures });
    } catch (error) {
      next(error);
    }
  });
};
