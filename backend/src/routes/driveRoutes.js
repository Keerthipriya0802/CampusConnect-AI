const express = require('express');
const { getDrives, createDrive, updateDrive, deleteDrive, getDriveById, applyToDrive, getApplications } = require('../controllers/driveController');
const { protect, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.get('/', getDrives);
router.get('/applications', protect, getApplications);
router.get('/:id', getDriveById);
router.post('/', protect, authorizeRoles('coordinator', 'admin'), createDrive);
router.put('/:id', protect, authorizeRoles('coordinator', 'admin'), updateDrive);
router.delete('/:id', protect, authorizeRoles('coordinator', 'admin'), deleteDrive);
router.post('/:id/apply', protect, authorizeRoles('student'), applyToDrive);

module.exports = router;
