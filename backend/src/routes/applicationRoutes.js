const express = require('express');
const { protect, authorizeRoles } = require('../middleware/auth');
const { createApplication, getMyApplications, getCoordinatorApplications, getApplication, updateStatus } = require('../controllers/applicationController');

const router = express.Router();

router.post('/', protect, authorizeRoles('student'), createApplication);
router.get('/my-applications', protect, authorizeRoles('student'), getMyApplications);
router.get('/coordinator', protect, authorizeRoles('coordinator', 'admin'), getCoordinatorApplications);
router.get('/:id', protect, getApplication);
router.put('/:id/status', protect, authorizeRoles('coordinator', 'admin'), updateStatus);

module.exports = router;
