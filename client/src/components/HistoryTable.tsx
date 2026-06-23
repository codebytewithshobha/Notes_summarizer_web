import { NoteSummary } from '../types';

interface HistoryTableProps {
  history: NoteSummary[];
  onView: (entry: NoteSummary) => void;
  onDelete: (id: string) => void;
}

const HistoryTable = ({ history, onView, onDelete }: HistoryTableProps) => (
  <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/90 shadow-xl shadow-slate-950/20">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-800 text-left text-sm text-slate-200">
        <thead className="bg-slate-950/95 text-slate-300">
          <tr>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Source</th>
            <th className="px-4 py-3">Summary</th>
            <th className="px-4 py-3">Concepts</th>
            <th className="px-4 py-3">Questions</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800 bg-slate-950/70">
          {history.map((entry) => (
            <tr key={entry._id} className="hover:bg-slate-900/80">
              <td className="px-4 py-4 align-top text-slate-300 whitespace-nowrap">
                {new Date(entry.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-4 align-top text-slate-300">
                {entry.uploadedFileName ? (
                  <span className="rounded-full bg-slate-800 px-2 py-1 text-xs">{entry.uploadedFileName}</span>
                ) : (
                  <span className="text-slate-500">Text input</span>
                )}
              </td>
              <td className="px-4 py-4 align-top text-slate-100 max-w-xs">
                <div className="line-clamp-2">{entry.summary}</div>
              </td>
              <td className="px-4 py-4 align-top text-slate-200">
                {entry.keyConcepts.slice(0, 3).join(', ') || '-'}
              </td>
              <td className="px-4 py-4 align-top text-slate-200">
                {(entry.mcqs?.length || 0) + (entry.shortQuestions?.length || 0) + (entry.longQuestions?.length || 0) || entry.questions.length}
              </td>
              <td className="px-4 py-4 align-top">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onView(entry)}
                    className="rounded-3xl border border-cyan-500/70 px-3 py-1.5 text-xs font-semibold text-cyan-200 transition hover:border-cyan-300 hover:text-cyan-100"
                  >
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this entry?')) {
                        onDelete(entry._id);
                      }
                    }}
                    className="rounded-3xl border border-rose-500/70 px-3 py-1.5 text-xs font-semibold text-rose-200 transition hover:border-rose-300 hover:text-rose-100"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default HistoryTable;
