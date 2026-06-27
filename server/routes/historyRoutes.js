const express = require('express');

const {
  getHistory,
  getHistoryById,
  deleteHistoryEntry,
  addHistoryEntry,
  exportHistoryEntry
} = require('../controllers/historyController');

const protect = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * All routes are now protected with JWT
 * req.user will be available in controllers
 */

// Get all history (for logged-in user)
router.get('/', protect, getHistory);

// Export specific history entry
router.get('/:id/export/:format', protect, exportHistoryEntry);

// Get single history entry
router.get('/:id', protect, getHistoryById);

// Delete history entry
router.delete('/:id', protect, deleteHistoryEntry);

// Add new history entry
router.post('/', protect, addHistoryEntry);

module.exports = router;