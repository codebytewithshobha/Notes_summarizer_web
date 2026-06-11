import { NoteSummary } from '../types';

interface ResultCardProps {
  result: NoteSummary;
}

const escapePdfText = (value: string) =>
  value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

const wrapLine = (line: string, maxLength = 88) => {
  const words = line.split(/\s+/);
  const lines: string[] = [];
  let current = '';

  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxLength && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  });

  if (current) {
    lines.push(current);
  }

  return lines;
};

const downloadSummaryPdf = (result: NoteSummary) => {
  const sections = [
    'AI Course Notes Summary',
    result.createdAt ? `Generated: ${new Date(result.createdAt).toLocaleString()}` : '',
    '',
    'Summary',
    result.summary,
    '',
    'Revision Questions',
    ...result.questions.map((question, index) => `${index + 1}. ${question}`)
  ].filter(Boolean);

  const lines = sections.flatMap((section) => wrapLine(section));
  const contentLines = ['BT', '/F1 12 Tf', '50 780 Td'];

  lines.forEach((line, index) => {
    if (index > 0) {
      contentLines.push('0 -18 Td');
    }
    contentLines.push(`(${escapePdfText(line)}) Tj`);
  });

  contentLines.push('ET');

  const stream = contentLines.join('\n');
  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj',
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj',
    `5 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj`
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [0];

  objects.forEach((object) => {
    offsets.push(pdf.length);
    pdf += `${object}\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  const blob = new Blob([pdf], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'course-notes-summary.pdf';
  link.click();
  URL.revokeObjectURL(url);
};

const ResultCard = ({ result }: ResultCardProps) => {
  return (
    <div className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/20">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-cyan-300">Structured Summary</h2>
          <p className="whitespace-pre-wrap text-slate-100">{result.summary}</p>
        </div>
        <button
          type="button"
          onClick={() => downloadSummaryPdf(result)}
          className="rounded-3xl border border-cyan-500/70 px-4 py-2 text-sm font-semibold text-cyan-200 transition hover:border-cyan-300 hover:text-cyan-100"
        >
          Download PDF
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
          <h3 className="text-lg font-semibold text-cyan-200">Key Concepts</h3>
          <ul className="mt-3 space-y-2 text-slate-200">
            {result.keyConcepts.length > 0 ? (
              result.keyConcepts.map((concept, index) => (
                <li key={index} className="rounded-md bg-slate-900/90 p-2">{concept}</li>
              ))
            ) : (
              <li className="text-slate-500">No concepts available.</li>
            )}
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
          <h3 className="text-lg font-semibold text-cyan-200">Important Definitions</h3>
          <ul className="mt-3 space-y-2 text-slate-200">
            {result.definitions.length > 0 ? (
              result.definitions.map((definition, index) => (
                <li key={index} className="rounded-md bg-slate-900/90 p-2">{definition}</li>
              ))
            ) : (
              <li className="text-slate-500">No definitions provided.</li>
            )}
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
          <h3 className="text-lg font-semibold text-cyan-200">Revision Questions</h3>
          <ol className="mt-3 space-y-2 text-slate-200 list-decimal list-inside">
            {result.questions.length > 0 ? (
              result.questions.map((question, index) => (
                <li key={index} className="rounded-md bg-slate-900/90 p-2">{question}</li>
              ))
            ) : (
              <li className="text-slate-500">No questions generated.</li>
            )}
          </ol>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
