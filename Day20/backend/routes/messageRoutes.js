const express = require('express');
const {
  getMessages,
  sendMessage,
  getAnnouncements,
  createAnnouncement,
} = require('../controllers/messageController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Announcements
router.route('/announcements/:courseId')
  .get(protect, getAnnouncements)
  .post(protect, authorize('instructor', 'admin'), createAnnouncement);

// Direct Messages
router.route('/:userId')
  .get(protect, getMessages)
  .post(protect, sendMessage);

module.exports = router;
