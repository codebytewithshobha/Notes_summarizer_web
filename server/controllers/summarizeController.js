const NoteSummary = require('../models/NoteSummary');
const { parseTextFromUpload, generateSummaryFromNotes } = require('../services/aiService');
const cacheMiddleware = require('../middleware/cache');

const MAX_NOTE_LENGTH = 500000;

const createSummary = async (req, res, next) => {
  try {
    const notesText = req.body.notes?.trim();
    const uploadedText = await parseTextFromUpload(req.file);
    const effectiveNotes = uploadedText || notesText;

    if (!effectiveNotes) {
      return res.status(400).json({ message: 'Please provide notes text or upload a TXT/PDF file.' });
    }

    if (effectiveNotes.trim().split(/\s+/).length < 10) {
  return res.status(400).json({
    message: "Please provide more detailed notes."
  });
}

    if (effectiveNotes.length > MAX_NOTE_LENGTH) {
      return res.status(413).json({ message: 'Notes are too large. Please keep input under 500,000 characters.' });
    }

    const uploadedFileName = req.file?.originalname || '';
    const aiResult = await generateSummaryFromNotes(effectiveNotes, uploadedFileName);

    console.log("req.user:", req.user);
    console.log("req.body:", req.body);
    console.log("effectiveNotes:", effectiveNotes);

    const savedRecord = await NoteSummary.create({
      userId: req.user._id,
      originalNotes: effectiveNotes,
      summary: aiResult.summary,
      keyConcepts: aiResult.keyConcepts,
      definitions: aiResult.definitions,
      questions: aiResult.questions,
      flashcards: aiResult.flashcards,
      mcqs: aiResult.mcqs,
      shortQuestions: aiResult.shortQuestions,
      longQuestions: aiResult.longQuestions,
      uploadedFileName: aiResult.uploadedFileName,
      aiModelUsed: aiResult.aiModelUsed,
      aiProvider: aiResult.aiProvider,
      processingTime: aiResult.processingTime
});


    cacheMiddleware.clear('/api/history');
    res.status(201).json(savedRecord);
  } catch (error) {
    next(error);
  }
};

module.exports = { createSummary };
