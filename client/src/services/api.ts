import axios from 'axios';
import { NoteSummary } from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export const submitNotes = async (notes: string, file?: File) => {
  const formData = new FormData();
  formData.append('notes', notes);

  if (file) {
    formData.append('file', file);
  }

  const response = await axios.post<NoteSummary>('/api/summarize', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const fetchHistory = async (): Promise<NoteSummary[]> => {
  const response = await api.get<NoteSummary[]>('/history');
  return response.data;
};
