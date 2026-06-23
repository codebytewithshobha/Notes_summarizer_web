const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['short-answer', 'long-answer', 'mcq', 'conceptual'],
    required: true
  },
  question: {
    type: String,
    required: true
  },
  options: {
    type: [String],
    default: []
  },
  correctAnswer: {
    type: String,
    default: ''
  }
}, { _id: false });

const qaSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  answer: {
    type: String,
    default: '',
    trim: true,
    maxlength: 5000
  }
}, { _id: false });

const flashcardSchema = new mongoose.Schema({
  front: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  back: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000
  }
}, { _id: false });

const mcqSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  options: {
    type: [String],
    validate: {
      validator: function(options) {
        return options.length >= 2 && options.length <= 4;
      },
      message: 'MCQs must include 2 to 4 options'
    }
  },
  correctAnswer: {
    type: String,
    default: '',
    trim: true,
    maxlength: 1000
  }
}, { _id: false });

const noteSummarySchema = new mongoose.Schema(
  {
    originalNotes: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 500000
    },
    summary: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 100000
    },
    keyConcepts: {
      type: [String],
      default: [],
      validate: {
        validator: function(v) {
          return v.every(concept => typeof concept === 'string' && concept.trim().length > 0);
        },
        message: 'Key concepts must be non-empty strings'
      }
    },
    definitions: {
      type: [String],
      default: [],
      validate: {
        validator: function(v) {
          return v.every(def => typeof def === 'string' && def.trim().length > 0);
        },
        message: 'Definitions must be non-empty strings'
      }
    },
    questions: {
      type: [questionSchema],
      default: []
    },
    flashcards: {
      type: [flashcardSchema],
      default: []
    },
    mcqs: {
      type: [mcqSchema],
      default: []
    },
    shortQuestions: {
      type: [qaSchema],
      default: []
    },
    longQuestions: {
      type: [qaSchema],
      default: []
    },
    uploadedFileName: {
      type: String,
      default: '',
      trim: true,
      maxlength: 255
    },
    aiModelUsed: {
      type: String,
      default: 'gemini-2.5-flash',
      trim: true
    },
    processingTime: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

noteSummarySchema.index({ createdAt: -1 });
noteSummarySchema.index({ uploadedFileName: 1 });
noteSummarySchema.index({ aiModelUsed: 1 });
noteSummarySchema.index({ summary: 'text', originalNotes: 'text', uploadedFileName: 'text' });

const NoteSummary = mongoose.models.NoteSummary || mongoose.model('NoteSummary', noteSummarySchema);

module.exports = NoteSummary;
