const express = require('express');
const { getDrives, createDrive, updateDrive, deleteDrive, getDriveById, getApplications, getEligibleStudents } = require('../controllers/driveController');
const { protect, authorizeRoles } = require('../middleware/auth');
const { createApplication } = require('../controllers/applicationController');

const router = express.Router();

router.get('/', protect, getDrives);
router.get('/applications', protect, getApplications);
router.get('/:id/eligible-students', protect, authorizeRoles('coordinator', 'admin'), getEligibleStudents);
router.get('/:id', protect, getDriveById);
router.post('/', protect, authorizeRoles('coordinator', 'admin'), createDrive);
router.put('/:id', protect, authorizeRoles('coordinator', 'admin'), updateDrive);
router.delete('/:id', protect, authorizeRoles('coordinator', 'admin'), deleteDrive);
router.post('/:id/apply', protect, authorizeRoles('student'), (req, res, next) => createApplication({ ...req, body: { ...req.body, driveId: req.params.id } }, res, next));

module.exports = router;
