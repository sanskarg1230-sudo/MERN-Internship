const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  options: {
    type: [String], // Array of strings for options
    required: true,
    validate: [arrayLimit, 'A question must have at least 2 options and max 4 options.'],
  },
  correctAnswer: {
    type: String,
    required: true,
  },
});

function arrayLimit(val) {
  return val.length >= 2 && val.length <= 4;
}

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    duration: {
      type: Number, // in minutes
      required: true,
    },
    questions: [questionSchema],
  },
  {
    timestamps: true,
  }
);

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz;
