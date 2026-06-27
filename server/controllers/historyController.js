const NoteSummary = require('../models/NoteSummary');
const mongoose = require('mongoose');
const cacheMiddleware = require('../middleware/cache');
const { createDocxExport, createPdfExport, createTextExport } = require('../services/exportService');

const parsePositiveInteger = (value, fallback, max) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
};

const allowedSorts = new Set(['createdAt', '-createdAt', 'processingTime', '-processingTime', 'uploadedFileName', '-uploadedFileName']);
const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const assertObjectId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Invalid history entry id.');
    error.status = 400;
    throw error;
  }
};

const getHistory = async (req, res, next) => {
  try {
    const { search, sort = '-createdAt', startDate, endDate } = req.query;
    const pageNumber = parsePositiveInteger(req.query.page, 1, 100000);
    const pageSize = parsePositiveInteger(req.query.limit, 10, 50);
    const sortValue = allowedSorts.has(sort) ? sort : '-createdAt';

    const query = {
      userId: req.user._id
    };

    if (search) {
      const safeSearch = escapeRegex(String(search).slice(0, 100));
      query.$or = [
        { summary: { $regex: safeSearch, $options: 'i' } },
        { originalNotes: { $regex: safeSearch, $options: 'i' } },
        { uploadedFileName: { $regex: safeSearch, $options: 'i' } }
      ];
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        const parsedStart = new Date(startDate);
        if (Number.isNaN(parsedStart.getTime())) return res.status(400).json({ message: 'startDate must be a valid date.' });
        query.createdAt.$gte = parsedStart;
      }
      if (endDate) {
        const parsedEnd = new Date(endDate);
        if (Number.isNaN(parsedEnd.getTime())) return res.status(400).json({ message: 'endDate must be a valid date.' });
        parsedEnd.setHours(23, 59, 59, 999);
        query.createdAt.$lte = parsedEnd;
      }
    }

    const skip = (pageNumber - 1) * pageSize;
    const history = await NoteSummary.find(query)
      .sort(sortValue)
      .skip(skip)
      .limit(pageSize)
      .lean();

    const total = await NoteSummary.countDocuments(query);

    res.json({
      data: history,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.max(Math.ceil(total / pageSize), 1),
        totalItems: total,
        itemsPerPage: pageSize
      }
    });
  } catch (error) {
    next(error);
  }
};

const getHistoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    assertObjectId(id);
    const entry = await NoteSummary.findById(id).lean();

    if (!entry) {
      return res.status(404).json({ message: 'History entry not found' });
    }

    res.json(entry);
  } catch (error) {
    next(error);
  }
};

const deleteHistoryEntry = async (req, res, next) => {
  try {
    const { id } = req.params;
    assertObjectId(id);
    const entry = await NoteSummary.findByIdAndDelete(id);

    if (!entry) {
      return res.status(404).json({ message: 'History entry not found' });
    }

    cacheMiddleware.clear('/api/history');
    res.json({ message: 'History entry deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const addHistoryEntry = async (req, res, next) => {
  try {
    const { originalNotes, summary, keyConcepts, definitions, questions, uploadedFileName, aiModelUsed, processingTime } = req.body;

    if (!originalNotes || !summary) {
      return res.status(400).json({ message: 'originalNotes and summary are required.' });
    }

    const savedEntry = await NoteSummary.create({
      originalNotes,
      summary,
      keyConcepts: Array.isArray(keyConcepts) ? keyConcepts : [],
      definitions: Array.isArray(definitions) ? definitions : [],
      questions: Array.isArray(questions) ? questions : [],
      flashcards: Array.isArray(req.body.flashcards) ? req.body.flashcards : [],
      mcqs: Array.isArray(req.body.mcqs) ? req.body.mcqs : [],
      shortQuestions: Array.isArray(req.body.shortQuestions) ? req.body.shortQuestions : [],
      longQuestions: Array.isArray(req.body.longQuestions) ? req.body.longQuestions : [],
      uploadedFileName: uploadedFileName || '',
      aiModelUsed: aiModelUsed || 'gemini-2.5-flash',
      processingTime: processingTime || 0
    });

    cacheMiddleware.clear('/api/history');
    res.status(201).json(savedEntry);
  } catch (error) {
    next(error);
  }
};

const exportHistoryEntry = async (req, res, next) => {
  try {
    const { id, format } = req.params;
    assertObjectId(id);

    const entry = await NoteSummary.findById(id).lean();
    if (!entry) {
      return res.status(404).json({ message: 'History entry not found' });
    }

    const safeDate = new Date(entry.createdAt).toISOString().slice(0, 10);
    const fileBase = `course-notes-summary-${safeDate}`;

    if (format === 'txt') {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${fileBase}.txt"`);
      return res.send(createTextExport(entry));
    }

    if (format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileBase}.pdf"`);
      return res.send(createPdfExport(entry));
    }

    if (format === 'docx') {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${fileBase}.docx"`);
      return res.send(createDocxExport(entry));
    }

    return res.status(400).json({ message: 'Unsupported export format. Use pdf, docx, or txt.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getHistory, getHistoryById, deleteHistoryEntry, addHistoryEntry, exportHistoryEntry };
