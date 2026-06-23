import axios from 'axios';
import { NoteSummary, HistoryResponse, HistoryFilters } from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export const getApiErrorMessage = (error: unknown, fallback = 'Something went wrong.') => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.response?.data?.error?.message || error.message || fallback;
  }
  return error instanceof Error ? error.message : fallback;
};

export const submitNotes = async (notes: string, file?: File) => {
  const formData = new FormData();
  formData.append('notes', notes);

  if (file) {
    formData.append('file', file);
  }

  const response = await api.post<NoteSummary>('/summarize', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 300000
  });

  return response.data;
};

export const exportHistoryEntry = async (id: string, format: 'pdf' | 'docx' | 'txt') => {
  const response = await api.get<Blob>(`/history/${id}/export/${format}`, {
    responseType: 'blob'
  });
  return response.data;
};

export const fetchHistory = async (filters?: HistoryFilters): Promise<HistoryResponse> => {
  const params = new URLSearchParams();
  
  if (filters?.search) params.append('search', filters.search);
  if (filters?.sort) params.append('sort', filters.sort);
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());

  const response = await api.get<HistoryResponse>(`/history?${params.toString()}`);
  return response.data;
};

export const fetchHistoryById = async (id: string): Promise<NoteSummary> => {
  const response = await api.get<NoteSummary>(`/history/${id}`);
  return response.data;
};

export const deleteHistoryEntry = async (id: string): Promise<void> => {
  await api.delete(`/history/${id}`);
};
