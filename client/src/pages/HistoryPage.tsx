import { useEffect, useState } from 'react';
import { fetchHistory } from '../services/api';
import { NoteSummary } from '../types';
import HistoryTable from '../components/HistoryTable';
import Loader from '../components/Loader';
import ResultCard from '../components/ResultCard';

const HistoryPage = () => {
  const [history, setHistory] = useState<NoteSummary[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<NoteSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await fetchHistory();
        setHistory(response);
      } catch (fetchError: any) {
        setError(fetchError?.response?.data?.message || 'Unable to load history.');
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, []);

  return (
    <section className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl shadow-slate-950/20">
      <div>
        <h1 className="text-3xl font-semibold text-slate-100">History Dashboard</h1>
        <p className="mt-2 text-slate-300">Review your saved summaries and study entries.</p>
      </div>

      {isLoading ? (
        <Loader />
      ) : error ? (
        <p className="rounded-2xl bg-rose-500/10 px-4 py-4 text-sm text-rose-300">{error}</p>
      ) : history.length === 0 ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 text-slate-300">
          No history records found yet. Start by summarizing notes.
        </div>
      ) : (
        <>
          <HistoryTable history={history} onView={setSelectedEntry} />
          {selectedEntry && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-100">Previous Summary</h2>
              <ResultCard result={selectedEntry} />
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default HistoryPage;
