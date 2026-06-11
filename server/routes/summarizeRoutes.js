const express = require('express');
const multer = require('multer');
const { createSummary } = require('../controllers/summarizeController');

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.post('/', upload.single('file'), createSummary);

module.exports = router;
