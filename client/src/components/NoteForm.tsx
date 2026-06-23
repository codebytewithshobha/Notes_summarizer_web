import { ChangeEvent, FormEvent, useState } from 'react';
import { getApiErrorMessage, submitNotes } from '../services/api';
import { useNavigate } from 'react-router-dom';

const NoteForm = () => {
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState<File | undefined>();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (selected) {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (selected.size > maxSize) {
        event.target.value = '';
        setFile(undefined);
        setError('File size exceeds 10MB limit.');
        return;
      }

      const allowedTypes = ['text/plain', 'application/pdf'];
      if (!allowedTypes.includes(selected.type)) {
        event.target.value = '';
        setFile(undefined);
        setError('Only TXT and PDF files are supported.');
        return;
      }

      setFile(selected);
      setError('');
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!notes.trim() && !file) {
      setError('Please enter notes or upload a TXT/PDF file.');
      return;
    }

    let progressInterval: number | undefined;

    try {
      setIsLoading(true);
      setUploadProgress(0);
      
      progressInterval = window.setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const result = await submitNotes(notes, file);
      
      window.clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        navigate('/results', { state: result });
      }, 500);
    } catch (submitError: any) {
      if (progressInterval) window.clearInterval(progressInterval);
      setError(getApiErrorMessage(submitError, 'Unable to submit notes.'));
      setUploadProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/20">
      <div>
        <label className="mb-3 block text-lg font-semibold text-slate-100">Lecture Notes</label>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={10}
          placeholder="Paste your lecture notes here..."
          className="w-full rounded-3xl border border-slate-800 bg-slate-950 p-4 text-slate-100 shadow-inner focus:border-cyan-400 focus:outline-none disabled:opacity-50"
          disabled={isLoading}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <label className={`flex cursor-pointer items-center justify-center rounded-3xl border border-dashed px-4 py-4 text-center text-sm transition ${file ? 'border-cyan-400 bg-cyan-500/10 text-cyan-300' : 'border-slate-700 bg-slate-950/60 text-slate-300 hover:border-cyan-400 hover:text-cyan-300'} ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}>
          <input 
            type="file" 
            accept=".txt,.pdf" 
            className="hidden" 
            onChange={handleFileChange}
            disabled={isLoading}
          />
          {file ? `Selected: ${file.name} (${(file.size / 1024).toFixed(1)} KB)` : 'Upload TXT or PDF notes (max 10MB)'}
        </label>
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-3xl bg-cyan-500 px-6 py-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? 'Generating...' : 'Summarize Notes'}
        </button>
      </div>

      {isLoading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-slate-300">
            <span>Processing your notes...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-800">
            <div 
              className="h-full bg-cyan-500 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {error && <p className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</p>}
    </form>
  );
};

export default NoteForm;
