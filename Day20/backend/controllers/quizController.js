const Quiz = require('../models/Quiz');
const Course = require('../models/Course');

const createQuiz = async (req, res) => {
  try {
    const { title, courseId, questions, duration } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to create a quiz for this course' });
    }

    // Check if quiz already exists
    let quiz = await Quiz.findOne({ course: courseId });
    
    if (quiz) {
      // Update existing
      quiz.title = title;
      quiz.questions = questions;
      quiz.duration = duration;
      await quiz.save();
    } else {
      // Create new
      quiz = await Quiz.create({
        title,
        course: courseId,
        questions,
        duration,
        createdBy: req.user._id
      });
    }

    res.status(201).json(quiz);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const getQuizByCourse = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ course: req.params.courseId });
    if (!quiz) {
      return res.status(404).json({ message: 'No quiz found for this course' });
    }
    
    // Strip out correct answers before sending to client
    const safeQuiz = quiz.toObject();
    safeQuiz.questions = safeQuiz.questions.map(q => {
      delete q.correctAnswer;
      return q;
    });

    res.json(safeQuiz);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const instructorGetQuiz = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course || course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const quiz = await Quiz.findOne({ course: req.params.courseId });
    if (!quiz) {
      return res.status(404).json({ message: 'No quiz found for this course' });
    }
    
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const submitQuizAttempt = async (req, res) => {
  try {
    const { answers } = req.body; // { questionId: 'Selected Answer String' }
    
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    let score = 0;
    const results = quiz.questions.map((question) => {
      const studentAnswer = answers[question._id.toString()];
      const isCorrect = studentAnswer === question.correctAnswer;
      
      if (isCorrect) score++;

      return {
        questionId: question._id,
        questionText: question.question,
        studentAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect
      };
    });

    const percentage = (score / quiz.questions.length) * 100;
    const passed = percentage >= 70; // 70% passing grade

    // Save the attempt to user's passedQuizzes if they passed
    if (passed) {
      const user = req.user;
      if (!user.passedQuizzes) user.passedQuizzes = [];
      if (!user.passedQuizzes.includes(quiz._id)) {
        user.passedQuizzes.push(quiz._id);
        await user.save();
      }
    }

    res.json({
      score,
      total: quiz.questions.length,
      percentage,
      passed,
      results
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getQuizByCourse,
  instructorGetQuiz,
  submitQuizAttempt,
  createQuiz
};
