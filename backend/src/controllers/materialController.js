const multer = require('multer');
const path = require('path');
const fs = require('fs');
const InterviewMaterial = require('../models/InterviewMaterial');
const Drive = require('../models/Drive');
const StudentProfile = require('../models/StudentProfile');
const ExcelJS = require('exceljs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage }).single('file');

exports.uploadMaterial = async (req, res, next) => {
  try {
    upload(req, res, async (err) => {
      if (err) return res.status(400).json({ message: 'File upload failed' });
      if (!req.file) return res.status(400).json({ message: 'No file provided' });

      const material = await InterviewMaterial.create({
        companyName: req.body.companyName || 'Unknown',
        title: req.body.title || req.file.originalname,
        fileUrl: `/uploads/${req.file.filename}`,
        fileType: req.file.mimetype,
        uploadedBy: req.user._id,
      });

      res.status(201).json(material);
    });
  } catch (error) {
    next(error);
  }
};

exports.listMaterials = async (req, res, next) => {
  try {
    const materials = await InterviewMaterial.find().populate('uploadedBy', 'name email').sort({ uploadedAt: -1 });
    res.json(materials);
  } catch (error) {
    next(error);
  }
};

exports.exportEligibleStudents = async (req, res, next) => {
  try {
    const { driveId } = req.params;
    const drive = await Drive.findById(driveId);
    if (!drive) return res.status(404).json({ message: 'Drive not found' });

    const profiles = await StudentProfile.find();
    const eligibleProfiles = profiles.filter((profile) => {
      const cgpaOk = (profile.cgpa || 0) >= (drive.cgpaRequirement || 0);
      const arrearsOk = (profile.arrears || 0) === 0;
      const deptOk = !drive.allowedDepartments?.length || drive.allowedDepartments.includes(profile.department);
      return cgpaOk && arrearsOk && deptOk;
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Eligible Students');
    worksheet.columns = [
      { header: 'Register Number', key: 'registerNumber', width: 20 },
      { header: 'Name', key: 'name', width: 20 },
      { header: 'Department', key: 'department', width: 15 },
      { header: 'CGPA', key: 'cgpa', width: 10 },
      { header: 'Skills', key: 'skills', width: 35 },
      { header: 'Placement Status', key: 'placementStatus', width: 20 },
    ];

    for (const profile of eligibleProfiles) {
      const populatedProfile = await StudentProfile.findById(profile._id).populate('user');
      worksheet.addRow({
        registerNumber: populatedProfile.registerNumber,
        name: populatedProfile.user?.name || '',
        department: populatedProfile.department,
        cgpa: populatedProfile.cgpa,
        skills: (populatedProfile.skills || []).join(', '),
        placementStatus: populatedProfile.placementStatus,
      });
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${drive.company}-eligible-students.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};
