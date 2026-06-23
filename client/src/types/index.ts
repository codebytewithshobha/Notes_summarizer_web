export interface Question {
  type: 'short-answer' | 'long-answer' | 'mcq' | 'conceptual';
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface Mcq {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface QuestionAnswer {
  question: string;
  answer: string;
}

export interface NoteSummary {
  _id: string;
  originalNotes: string;
  summary: string;
  keyConcepts: string[];
  definitions: string[];
  questions: Question[];
  flashcards: Flashcard[];
  mcqs: Mcq[];
  shortQuestions: QuestionAnswer[];
  longQuestions: QuestionAnswer[];
  uploadedFileName: string;
  aiModelUsed: string;
  processingTime: number;
  createdAt: string;
  updatedAt: string;
}

export interface SummarizeResponse {
  summary: string;
  keyConcepts: string[];
  definitions: string[];
  questions: Question[];
  flashcards: Flashcard[];
  mcqs: Mcq[];
  shortQuestions: QuestionAnswer[];
  longQuestions: QuestionAnswer[];
  originalNotes: string;
  uploadedFileName: string;
  aiModelUsed: string;
  processingTime: number;
  createdAt: string;
  updatedAt: string;
}

export interface HistoryResponse {
  data: NoteSummary[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface HistoryFilters {
  search?: string;
  sort?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}
