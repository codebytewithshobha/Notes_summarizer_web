const NoteSummary = require('../models/NoteSummary');

const getHistory = async (req, res, next) => {
  try {
    const history = await NoteSummary.find().sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    next(error);
  }
};

const addHistoryEntry = async (req, res, next) => {
  try {
    const { originalNotes, summary, keyConcepts, definitions, questions } = req.body;

    if (!originalNotes || !summary) {
      return res.status(400).json({ message: 'originalNotes and summary are required.' });
    }

    const savedEntry = await NoteSummary.create({
      originalNotes,
      summary,
      keyConcepts: Array.isArray(keyConcepts) ? keyConcepts : [],
      definitions: Array.isArray(definitions) ? definitions : [],
      questions: Array.isArray(questions) ? questions : []
    });

    res.status(201).json(savedEntry);
  } catch (error) {
    next(error);
  }
};

module.exports = { getHistory, addHistoryEntry };
