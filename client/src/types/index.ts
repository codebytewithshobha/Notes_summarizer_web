export interface NoteSummary {
  _id: string;
  originalNotes: string;
  summary: string;
  keyConcepts: string[];
  definitions: string[];
  questions: string[];
  createdAt: string;
}

export interface SummarizeResponse {
  summary: string;
  keyConcepts: string[];
  definitions: string[];
  questions: string[];
  originalNotes: string;
  createdAt: string;
}
