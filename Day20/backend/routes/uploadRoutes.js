const express = require('express');
const { upload } = require('../utils/cloudinary');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Send back the Cloudinary URL
    res.status(200).json({
      message: 'File uploaded successfully',
      url: req.file.path,
      public_id: req.file.filename,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error uploading file' });
  }
});

module.exports = router;
