const mongoose = require('mongoose');

const noteSummarySchema = new mongoose.Schema(
  {
    originalNotes: {
      type: String,
      required: true
    },
    summary: {
      type: String,
      required: true
    },
    keyConcepts: {
      type: [String],
      default: []
    },
    definitions: {
      type: [String],
      default: []
    },
    questions: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

const NoteSummary = mongoose.models.NoteSummary || mongoose.model('NoteSummary', noteSummarySchema);

module.exports = NoteSummary;
