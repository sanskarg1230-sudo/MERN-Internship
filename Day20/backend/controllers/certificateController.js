const Certificate = require('../models/Certificate');
const Course = require('../models/Course');
const Quiz = require('../models/Quiz');
const User = require('../models/User');

const generateCertificate = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId).populate('instructor', 'name');
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Verify Quiz completion
    const courseQuiz = await Quiz.findOne({ course: course._id });
    if (courseQuiz) {
      if (!req.user.passedQuizzes || !req.user.passedQuizzes.includes(courseQuiz._id)) {
        return res.status(403).json({ message: 'You must pass the course quiz to earn this certificate.' });
      }
    }

    // Check if certificate already exists
    const existingCert = await Certificate.findOne({
      student: req.user._id,
      course: course._id,
    });

    if (existingCert) {
      // Ensure course is marked completed for user
      const user = await User.findById(req.user._id);
      if (!user.completedCourses) user.completedCourses = [];
      if (!user.completedCourses.includes(course._id)) {
        user.completedCourses.push(course._id);
        await user.save();
      }
      return res.json(existingCert);
    }

    // Create a new certificate
    const certificateId = `CERT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const certificate = new Certificate({
      student: req.user._id,
      course: course._id,
      instructorName: course.instructor.name,
      certificateId,
      pdfUrl: `/verify/${certificateId}`, // Mock URL, frontend will render it visually
    });

    await certificate.save();

    // Mark course as completed for user
    const user = await User.findById(req.user._id);
    if (!user.completedCourses) user.completedCourses = [];
    if (!user.completedCourses.includes(course._id)) {
      user.completedCourses.push(course._id);
      await user.save();
    }

    res.status(201).json(certificate);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const getCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findOne({ certificateId: req.params.certId })
      .populate('student', 'name')
      .populate('course', 'title');

    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found or invalid' });
    }

    res.json(certificate);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const getMyCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({ student: req.user._id })
      .populate('course', 'title thumbnail instructor')
      .sort({ createdAt: -1 });
    
    res.json(certificates);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  generateCertificate,
  getCertificate,
  getMyCertificates,
};
