const express = require('express');
const { getHistory, getHistoryById, deleteHistoryEntry, addHistoryEntry, exportHistoryEntry } = require('../controllers/historyController');

const router = express.Router();

router.get('/', getHistory);
router.get('/:id/export/:format', exportHistoryEntry);
router.get('/:id', getHistoryById);
router.delete('/:id', deleteHistoryEntry);
router.post('/', addHistoryEntry);

module.exports = router;
