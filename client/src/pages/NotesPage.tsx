import NoteForm from '../components/NoteForm';

const NotesPage = () => (
  <section className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl shadow-slate-950/20">
    <div>
      <h1 className="text-3xl font-semibold text-slate-100">Lecture Notes Input</h1>
      <p className="mt-2 text-slate-300">
        Paste your lecture notes or upload a TXT/PDF file.
        The app will generate a summary, key concepts, definitions, and revision questions.
      </p>
    </div>
    <NoteForm />
  </section>
);

export default NotesPage;
