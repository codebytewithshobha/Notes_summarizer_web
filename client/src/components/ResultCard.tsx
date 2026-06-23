import { useMemo, useState } from 'react';
import { exportHistoryEntry, getApiErrorMessage } from '../services/api';
import { Mcq, NoteSummary, Question, QuestionAnswer } from '../types';

interface ResultCardProps {
  result: NoteSummary;
}

const getQuestionTypeColor = (type: string) => {
  switch (type) {
    case 'short-answer': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    case 'long-answer': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    case 'mcq': return 'bg-violet-500/20 text-violet-300 border-violet-500/30';
    case 'conceptual': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
  }
};

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const asShortQuestions = (questions: Question[] = []): QuestionAnswer[] =>
  questions
    .filter((question) => question.type === 'short-answer' || question.type === 'conceptual')
    .map((question) => ({ question: question.question, answer: question.correctAnswer }));

const asLongQuestions = (questions: Question[] = []): QuestionAnswer[] =>
  questions
    .filter((question) => question.type === 'long-answer')
    .map((question) => ({ question: question.question, answer: question.correctAnswer }));

const asMcqs = (questions: Question[] = []): Mcq[] =>
  questions
    .filter((question) => question.type === 'mcq')
    .map((question) => ({
      question: question.question,
      options: question.options,
      correctAnswer: question.correctAnswer
    }));

const ResultCard = ({ result }: ResultCardProps) => {
  const [exportError, setExportError] = useState('');
  const [exporting, setExporting] = useState<string | null>(null);

  const shortQuestions = useMemo(
    () => result.shortQuestions?.length ? result.shortQuestions : asShortQuestions(result.questions),
    [result.shortQuestions, result.questions]
  );
  const longQuestions = useMemo(
    () => result.longQuestions?.length ? result.longQuestions : asLongQuestions(result.questions),
    [result.longQuestions, result.questions]
  );
  const mcqs = useMemo(
    () => result.mcqs?.length ? result.mcqs : asMcqs(result.questions),
    [result.mcqs, result.questions]
  );

  const handleExport = async (format: 'pdf' | 'docx' | 'txt') => {
    if (!result._id) return;
    try {
      setExporting(format);
      setExportError('');
      const blob = await exportHistoryEntry(result._id, format);
      const date = result.createdAt ? new Date(result.createdAt).toISOString().slice(0, 10) : 'latest';
      downloadBlob(blob, `course-notes-summary-${date}.${format}`);
    } catch (error) {
      setExportError(getApiErrorMessage(error, `Unable to export ${format.toUpperCase()}.`));
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl shadow-slate-950/20 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-semibold text-cyan-300">Structured Summary</h2>
            {result.uploadedFileName && (
              <span className="max-w-full truncate rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-400">
                {result.uploadedFileName}
              </span>
            )}
          </div>
          <p className="whitespace-pre-wrap break-words text-slate-100">{result.summary}</p>
          <div className="flex flex-wrap gap-4 text-xs text-slate-400">
            {result.processingTime > 0 && <span>Processed in {(result.processingTime / 1000).toFixed(2)}s</span>}
            {result.aiModelUsed && <span>Model: {result.aiModelUsed}</span>}
            {result.createdAt && <span>{new Date(result.createdAt).toLocaleString()}</span>}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {(['pdf', 'docx', 'txt'] as const).map((format) => (
            <button
              key={format}
              type="button"
              onClick={() => handleExport(format)}
              disabled={Boolean(exporting)}
              className="rounded-2xl border border-cyan-500/70 px-4 py-2 text-sm font-semibold uppercase text-cyan-200 transition hover:border-cyan-300 hover:text-cyan-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {exporting === format ? 'Exporting' : format}
            </button>
          ))}
        </div>
      </div>

      {exportError && <p className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{exportError}</p>}

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
          <h3 className="text-lg font-semibold text-cyan-200">Key Concepts</h3>
          <ul className="mt-3 space-y-2 text-slate-200">
            {result.keyConcepts?.length ? (
              result.keyConcepts.map((concept, index) => <li key={index} className="rounded-md bg-slate-900/90 p-2">{concept}</li>)
            ) : (
              <li className="text-slate-500">No concepts available.</li>
            )}
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
          <h3 className="text-lg font-semibold text-cyan-200">Definitions</h3>
          <ul className="mt-3 space-y-2 text-slate-200">
            {result.definitions?.length ? (
              result.definitions.map((definition, index) => <li key={index} className="rounded-md bg-slate-900/90 p-2">{definition}</li>)
            ) : (
              <li className="text-slate-500">No definitions provided.</li>
            )}
          </ul>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
        <h3 className="text-lg font-semibold text-cyan-200">Flashcards</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {result.flashcards?.length ? (
            result.flashcards.map((card, index) => (
              <div key={index} className="rounded-md bg-slate-900/90 p-3">
                <p className="text-sm font-semibold text-slate-100">{card.front}</p>
                <p className="mt-2 text-sm text-slate-300">{card.back}</p>
              </div>
            ))
          ) : (
            <p className="text-slate-500">No flashcards generated.</p>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
        <h3 className="text-lg font-semibold text-cyan-200">MCQs</h3>
        <div className="mt-3 space-y-3">
          {mcqs.length ? (
            mcqs.map((mcq, index) => (
              <div key={index} className="rounded-md bg-slate-900/90 p-3 text-sm text-slate-200">
                <p className="font-semibold">{index + 1}. {mcq.question}</p>
                <div className="mt-2 grid gap-1 sm:grid-cols-2">
                  {mcq.options.map((option, optionIndex) => (
                    <span key={optionIndex} className="text-slate-400">{String.fromCharCode(65 + optionIndex)}. {option}</span>
                  ))}
                </div>
                {mcq.correctAnswer && <p className="mt-2 text-cyan-200">Answer: {mcq.correctAnswer}</p>}
              </div>
            ))
          ) : (
            <p className="text-slate-500">No MCQs generated.</p>
          )}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
          <h3 className="text-lg font-semibold text-cyan-200">Short Questions</h3>
          <div className="mt-3 space-y-2">
            {shortQuestions.length ? (
              shortQuestions.map((item, index) => (
                <div key={index} className="rounded-md bg-slate-900/90 p-3 text-sm text-slate-200">
                  <p>{item.question}</p>
                  {item.answer && <p className="mt-2 text-slate-400">{item.answer}</p>}
                </div>
              ))
            ) : (
              <p className="text-slate-500">No short questions generated.</p>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
          <h3 className="text-lg font-semibold text-cyan-200">Long Questions</h3>
          <div className="mt-3 space-y-2">
            {longQuestions.length ? (
              longQuestions.map((item, index) => (
                <div key={index} className="rounded-md bg-slate-900/90 p-3 text-sm text-slate-200">
                  <p>{item.question}</p>
                  {item.answer && <p className="mt-2 whitespace-pre-wrap text-slate-400">{item.answer}</p>}
                </div>
              ))
            ) : (
              <p className="text-slate-500">No long questions generated.</p>
            )}
          </div>
        </section>
      </div>

      {result.questions?.length > 0 && !shortQuestions.length && !longQuestions.length && !mcqs.length && (
        <section className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
          <h3 className="text-lg font-semibold text-cyan-200">Revision Questions</h3>
          <div className="mt-3 space-y-2 text-slate-200">
            {result.questions.map((question, index) => (
              <div key={index} className="rounded-md bg-slate-900/90 p-3">
                <div className="flex items-start gap-2">
                  <span className={`rounded border px-2 py-0.5 text-xs font-medium ${getQuestionTypeColor(question.type)}`}>
                    {question.type}
                  </span>
                  <p className="flex-1 text-sm">{question.question}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ResultCard;
