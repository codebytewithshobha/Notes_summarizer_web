const express = require('express');
const { getHistory, addHistoryEntry } = require('../controllers/historyController');

const router = express.Router();

router.get('/', getHistory);
router.post('/', addHistoryEntry);

module.exports = router;
