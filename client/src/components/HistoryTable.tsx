import { NoteSummary } from '../types';

interface HistoryTableProps {
  history: NoteSummary[];
  onView: (entry: NoteSummary) => void;
}

const HistoryTable = ({ history, onView }: HistoryTableProps) => (
  <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/90 shadow-xl shadow-slate-950/20">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-800 text-left text-sm text-slate-200">
        <thead className="bg-slate-950/95 text-slate-300">
          <tr>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Summary</th>
            <th className="px-4 py-3">Concepts</th>
            <th className="px-4 py-3">Questions</th>
            <th className="px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800 bg-slate-950/70">
          {history.map((entry) => (
            <tr key={entry._id} className="hover:bg-slate-900/80">
              <td className="px-4 py-4 align-top text-slate-300">{new Date(entry.createdAt).toLocaleString()}</td>
              <td className="px-4 py-4 align-top text-slate-100 max-w-xl whitespace-pre-wrap">{entry.summary}</td>
              <td className="px-4 py-4 align-top text-slate-200">
                {entry.keyConcepts.slice(0, 4).join(', ') || '-'}
              </td>
              <td className="px-4 py-4 align-top text-slate-200">{entry.questions.length}</td>
              <td className="px-4 py-4 align-top">
                <button
                  type="button"
                  onClick={() => onView(entry)}
                  className="rounded-3xl border border-cyan-500/70 px-4 py-2 text-xs font-semibold text-cyan-200 transition hover:border-cyan-300 hover:text-cyan-100"
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default HistoryTable;
