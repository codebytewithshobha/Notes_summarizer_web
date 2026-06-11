import { useLocation, useNavigate } from 'react-router-dom';
import { NoteSummary } from '../types';
import ResultCard from '../components/ResultCard';

const ResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state as NoteSummary | undefined;

  if (!result) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 text-center shadow-xl shadow-slate-950/20">
        <h2 className="text-2xl font-semibold text-slate-100">No result available</h2>
        <p className="mt-3 text-slate-300">Please summarize notes first to see the generated output.</p>
        <button
          onClick={() => navigate('/summarize')}
          className="mt-6 rounded-3xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
        >
          Go to Notes Input
        </button>
      </div>
    );
  }

  return (
    <section className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl shadow-slate-950/20">
      <div>
        <h1 className="text-3xl font-semibold text-slate-100">Summary Results</h1>
        <p className="mt-2 text-slate-300">Review the structured summary and study material created from your notes.</p>
      </div>
      <ResultCard result={result} />
    </section>
  );
};

export default ResultsPage;
