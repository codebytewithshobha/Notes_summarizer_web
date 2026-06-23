const escapeXml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const plainLines = (entry) => [
  'AI Course Notes Summary',
  entry.uploadedFileName ? `Source: ${entry.uploadedFileName}` : 'Source: Text input',
  `Generated: ${new Date(entry.createdAt).toLocaleString()}`,
  `AI Model: ${entry.aiModelUsed || 'Unknown'}`,
  '',
  'Summary',
  entry.summary,
  '',
  'Key Concepts',
  ...(entry.keyConcepts || []).map((item, index) => `${index + 1}. ${item}`),
  '',
  'Definitions',
  ...(entry.definitions || []).map((item, index) => `${index + 1}. ${item}`),
  '',
  'Flashcards',
  ...(entry.flashcards || []).map((item, index) => `${index + 1}. ${item.front} - ${item.back}`),
  '',
  'MCQs',
  ...(entry.mcqs || []).flatMap((item, index) => [
    `${index + 1}. ${item.question}`,
    ...item.options.map((option, optionIndex) => `   ${String.fromCharCode(65 + optionIndex)}. ${option}`),
    item.correctAnswer ? `   Answer: ${item.correctAnswer}` : ''
  ]),
  '',
  'Short Questions',
  ...(entry.shortQuestions || []).map((item, index) => `${index + 1}. ${item.question}\n   ${item.answer || ''}`),
  '',
  'Long Questions',
  ...(entry.longQuestions || []).map((item, index) => `${index + 1}. ${item.question}\n   ${item.answer || ''}`)
].filter((line) => line !== '');

const wrapLine = (line, maxLength = 92) => {
  const words = String(line).split(/\s+/);
  const lines = [];
  let current = '';

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxLength && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) lines.push(current);
  return lines.length ? lines : [''];
};

const createTextExport = (entry) => Buffer.from(plainLines(entry).join('\n'), 'utf8');

const createPdfExport = (entry) => {
  const pages = [];
  let currentPage = [];

  plainLines(entry).flatMap((line) => wrapLine(line)).forEach((line) => {
    if (currentPage.length >= 40) {
      pages.push(currentPage);
      currentPage = [];
    }
    currentPage.push(line);
  });
  if (currentPage.length) pages.push(currentPage);

  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj',
    `2 0 obj\n<< /Type /Pages /Kids [${pages.map((_, index) => `${3 + index * 2} 0 R`).join(' ')}] /Count ${pages.length} >>\nendobj`
  ];

  pages.forEach((pageLines, index) => {
    const pageObjectId = 3 + index * 2;
    const contentObjectId = pageObjectId + 1;
    const textLines = ['BT', '/F1 11 Tf', '50 760 Td'];
    pageLines.forEach((line, lineIndex) => {
      if (lineIndex > 0) textLines.push('0 -17 Td');
      textLines.push(`(${String(line).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')}) Tj`);
    });
    textLines.push('ET');
    const stream = textLines.join('\n');
    objects.push(`${pageObjectId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${3 + pages.length * 2} 0 R >> >> /Contents ${contentObjectId} 0 R >>\nendobj`);
    objects.push(`${contentObjectId} 0 obj\n<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream\nendobj`);
  });

  objects.push(`${3 + pages.length * 2} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj`);

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${object}\n`;
  });
  const xrefOffset = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(pdf, 'binary');
};

const crcTable = Array.from({ length: 256 }, (_, index) => {
  let crc = index;
  for (let bit = 0; bit < 8; bit += 1) {
    crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
  }
  return crc >>> 0;
});

const crc32 = (buffer) => {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
};

const writeUInt16 = (value) => {
  const buffer = Buffer.alloc(2);
  buffer.writeUInt16LE(value);
  return buffer;
};

const writeUInt32 = (value) => {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32LE(value);
  return buffer;
};

const createZip = (files) => {
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  files.forEach(({ name, content }) => {
    const nameBuffer = Buffer.from(name);
    const data = Buffer.isBuffer(content) ? content : Buffer.from(content);
    const crc = crc32(data);
    const localHeader = Buffer.concat([
      writeUInt32(0x04034b50), writeUInt16(20), writeUInt16(0), writeUInt16(0),
      writeUInt16(0), writeUInt16(0), writeUInt32(crc), writeUInt32(data.length),
      writeUInt32(data.length), writeUInt16(nameBuffer.length), writeUInt16(0), nameBuffer
    ]);
    localParts.push(localHeader, data);

    centralParts.push(Buffer.concat([
      writeUInt32(0x02014b50), writeUInt16(20), writeUInt16(20), writeUInt16(0), writeUInt16(0),
      writeUInt16(0), writeUInt16(0), writeUInt32(crc), writeUInt32(data.length),
      writeUInt32(data.length), writeUInt16(nameBuffer.length), writeUInt16(0), writeUInt16(0),
      writeUInt16(0), writeUInt16(0), writeUInt32(0), writeUInt32(offset), nameBuffer
    ]));

    offset += localHeader.length + data.length;
  });

  const centralDirectory = Buffer.concat(centralParts);
  const end = Buffer.concat([
    writeUInt32(0x06054b50), writeUInt16(0), writeUInt16(0), writeUInt16(files.length),
    writeUInt16(files.length), writeUInt32(centralDirectory.length), writeUInt32(offset), writeUInt16(0)
  ]);

  return Buffer.concat([...localParts, centralDirectory, end]);
};

const paragraph = (text) => `<w:p><w:r><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r></w:p>`;

const createDocxExport = (entry) => {
  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${plainLines(entry).flatMap((line) => String(line).split('\n')).map(paragraph).join('')}
    <w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr>
  </w:body>
</w:document>`;

  return createZip([
    { name: '[Content_Types].xml', content: '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>' },
    { name: '_rels/.rels', content: '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>' },
    { name: 'word/document.xml', content: documentXml }
  ]);
};

module.exports = {
  createDocxExport,
  createPdfExport,
  createTextExport
};
