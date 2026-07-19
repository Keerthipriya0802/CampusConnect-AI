const express = require('express');
const { chatWithAI, generateAnnouncement, generateReport } = require('../controllers/aiController');
const { protect, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.post('/chat', protect, chatWithAI);
router.post('/announcement', protect, authorizeRoles('coordinator', 'admin'), generateAnnouncement);
router.post('/report', protect, authorizeRoles('coordinator', 'admin'), generateReport);

module.exports = router;
