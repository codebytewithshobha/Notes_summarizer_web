import { useEffect, useState, useCallback } from 'react';
import { fetchHistory, deleteHistoryEntry, getApiErrorMessage } from '../services/api';
import { NoteSummary, HistoryFilters } from '../types';
import HistoryTable from '../components/HistoryTable';
import ResultCard from '../components/ResultCard';
import SkeletonLoader from '../components/SkeletonLoader';

const HistoryPage = () => {
  const [history, setHistory] = useState<NoteSummary[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<NoteSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState<HistoryFilters>({
    page: 1,
    limit: 10,
    sort: '-createdAt'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  const loadHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetchHistory(filters);
      setHistory(response.data);
      setPagination(response.pagination);
      setError('');
    } catch (fetchError: any) {
      setError(getApiErrorMessage(fetchError, 'Unable to load history.'));
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchInput.trim() || undefined, page: 1 }));
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const handleSort = (value: string) => {
    setFilters(prev => ({ ...prev, sort: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleDateFilter = (key: 'startDate' | 'endDate', value: string) => {
    setFilters(prev => ({ ...prev, [key]: value || undefined, page: 1 }));
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteHistoryEntry(id);
      if (selectedEntry?._id === id) {
        setSelectedEntry(null);
      }
      await loadHistory();
    } catch (deleteError: any) {
      setError(getApiErrorMessage(deleteError, 'Unable to delete entry.'));
    }
  };

  return (
    <section className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl shadow-slate-950/20">
      <div>
        <h1 className="text-3xl font-semibold text-slate-100">History Dashboard</h1>
        <p className="mt-2 text-slate-300">Review your saved summaries and study entries.</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search summaries..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => handleDateFilter('startDate', e.target.value)}
            className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100 focus:border-cyan-400 focus:outline-none"
          />
          <input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => handleDateFilter('endDate', e.target.value)}
            className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100 focus:border-cyan-400 focus:outline-none"
          />
          <select
            value={filters.sort}
            onChange={(e) => handleSort(e.target.value)}
            className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100 focus:border-cyan-400 focus:outline-none"
          >
            <option value="-createdAt">Newest First</option>
            <option value="createdAt">Oldest First</option>
            <option value="-processingTime">Longest Processing</option>
            <option value="processingTime">Shortest Processing</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <SkeletonLoader key={i} />
          ))}
        </div>
      ) : error ? (
        <p className="rounded-2xl bg-rose-500/10 px-4 py-4 text-sm text-rose-300">{error}</p>
      ) : history.length === 0 ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 text-slate-300">
          No history records found. Start by summarizing notes.
        </div>
      ) : (
        <>
          <HistoryTable history={history} onView={setSelectedEntry} onDelete={handleDelete} />
          <p className="text-center text-sm text-slate-400">
            Showing {history.length} of {pagination.totalItems} records
          </p>
          
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:border-cyan-400 hover:text-cyan-200"
              >
                Previous
              </button>
              <span className="text-slate-300">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:border-cyan-400 hover:text-cyan-200"
              >
                Next
              </button>
            </div>
          )}

          {selectedEntry && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-slate-100">Previous Summary</h2>
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="rounded-2xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:border-cyan-400 hover:text-cyan-200"
                >
                  Close
                </button>
              </div>
              <ResultCard result={selectedEntry} />
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default HistoryPage;
