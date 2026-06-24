const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    videoUrl: {
      type: String, // Cloudinary URL
      required: true,
    },
    notes: {
      type: String, // Could be markdown or rich text
    },
    downloadableResources: [
      {
        name: String,
        url: String, // Cloudinary URL for PDF/ZIP
      },
    ],
    duration: {
      type: Number, // in minutes
      required: true,
      default: 0
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Lesson = mongoose.model('Lesson', lessonSchema);

module.exports = Lesson;
