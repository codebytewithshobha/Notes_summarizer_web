const express = require('express');
const multer = require('multer');
const { createSummary } = require('../controllers/summarizeController');
const protect = require('../middleware/authMiddleware'); // <-- Add this

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['text/plain', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only TXT and PDF files are allowed.'), false);
    }
  }
});

const router = express.Router();

// Protect the summarize route
router.post('/', protect, upload.single('file'), createSummary);

module.exports = router;