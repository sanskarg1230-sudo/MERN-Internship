const Message = require('../models/Message');
const Announcement = require('../models/Announcement');
const Course = require('../models/Course');
const User = require('../models/User');

const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching messages' });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: 'Content is required' });

    const message = await Message.create({
      sender: req.user._id,
      receiver: req.params.userId,
      content,
    });

    // Populate sender info for the real-time event
    const populatedMessage = await Message.findById(message._id).populate('sender', 'name profilePicture');

    // Emit via socket if the receiver is online (assuming they joined a room with their userId)
    const io = req.app.get('io');
    if (io) {
      io.to(req.params.userId.toString()).emit('receive_message', populatedMessage);
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: 'Server Error sending message' });
  }
};

const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({ course: req.params.courseId })
      .populate('instructor', 'name profilePicture')
      .sort({ createdAt: -1 });

    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching announcements' });
  }
};

const createAnnouncement = async (req, res) => {
  try {
    const { title, content } = req.body;
    
    // Check if the user is the instructor of the course
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const announcement = await Announcement.create({
      course: req.params.courseId,
      instructor: req.user._id,
      title,
      content,
    });

    // Notify all enrolled students via socket
    const io = req.app.get('io');
    if (io) {
      course.enrolledStudents.forEach(studentId => {
        io.to(studentId.toString()).emit('new_announcement', announcement);
      });
    }

    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ message: 'Server Error creating announcement' });
  }
};

module.exports = {
  getMessages,
  sendMessage,
  getAnnouncements,
  createAnnouncement,
};
