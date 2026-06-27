import { Link } from 'react-router-dom';

const Home = () => (
  <section className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl shadow-slate-950/20">
    <div className="space-y-4">
      <p className="inline-flex rounded-full bg-cyan-500/20 px-4 py-2 text-sm font-semibold text-cyan-200">AI Course Notes Summarizer</p>
      <h1 className="text-4xl font-semibold text-slate-100 sm:text-5xl">Turn long lecture notes into smart study material.</h1>
      <p className="max-w-3xl text-slate-300">
        Paste your notes, upload a PDF or TXT file, and generate a structured summary with key concepts,
        definitions, and revision questions.
      </p>
    </div>

    <div className="grid gap-4 sm:grid-cols-2">
      <Link to="/summarize" className="rounded-3xl bg-cyan-500 px-6 py-5 text-center text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
        Start Summarizing
      </Link>
      <Link to="/history" className="rounded-3xl border border-slate-700 px-6 py-5 text-center text-sm font-semibold text-slate-100 transition hover:border-cyan-400 hover:text-cyan-200">
        View History Dashboard
      </Link>
    </div>
  </section>
);

export default Home;