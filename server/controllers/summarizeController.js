const NoteSummary = require('../models/NoteSummary');
const { parseTextFromUpload, generateSummaryFromNotes } = require('../services/aiService');

const createSummary = async (req, res, next) => {
  try {
    const notesText = req.body.notes?.trim();
    const uploadedText = await parseTextFromUpload(req.file);
    const effectiveNotes = uploadedText || notesText;

    if (!effectiveNotes) {
      return res.status(400).json({ message: 'Please provide notes text or upload a TXT/PDF file.' });
    }

    const aiResult = await generateSummaryFromNotes(effectiveNotes);

    const savedRecord = await NoteSummary.create({
      originalNotes: effectiveNotes,
      summary: aiResult.summary,
      keyConcepts: aiResult.keyConcepts,
      definitions: aiResult.definitions,
      questions: aiResult.questions
    });

    res.status(201).json(savedRecord);
  } catch (error) {
    next(error);
  }
};

module.exports = { createSummary };
