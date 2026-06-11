import { ChangeEvent, FormEvent, useState } from 'react';
import { submitNotes } from '../services/api';
import { NoteSummary } from '../types';
import { useNavigate } from 'react-router-dom';

const NoteForm = () => {
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState<File | undefined>();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    setFile(selected);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!notes.trim() && !file) {
      setError('Please enter notes or upload a TXT/PDF file.');
      return;
    }

    try {
      setIsLoading(true);
      const result = await submitNotes(notes, file);
      navigate('/results', { state: result });
    } catch (submitError: any) {
      setError(submitError?.response?.data?.message || submitError.message || 'Unable to submit notes.');
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
          className="w-full rounded-3xl border border-slate-800 bg-slate-950 p-4 text-slate-100 shadow-inner focus:border-cyan-400"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <label className="flex cursor-pointer items-center justify-center rounded-3xl border border-dashed border-slate-700 bg-slate-950/60 px-4 py-4 text-center text-sm text-slate-300 transition hover:border-cyan-400 hover:text-cyan-300">
          <input type="file" accept=".txt,.pdf" className="hidden" onChange={handleFileChange} />
          {file ? `Selected file: ${file.name}` : 'Upload TXT or PDF notes'}
        </label>
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-3xl bg-cyan-500 px-6 py-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? 'Generating...' : 'Summarize Notes'}
        </button>
      </div>

      {error && <p className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</p>}
    </form>
  );
};

export default NoteForm;
