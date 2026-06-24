const express = require('express');
const { generateCertificate, getCertificate, getMyCertificates } = require('../controllers/certificateController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/my-certificates', protect, getMyCertificates);
router.post('/course/:courseId', protect, generateCertificate);
router.get('/:certId', getCertificate);

module.exports = router;
