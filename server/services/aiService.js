const pdfParse = require('pdf-parse');

const OUTPUT_SCHEMA = {
  summary: '',
  keyConcepts: [],
  definitions: [],
  flashcards: [],
  mcqs: [],
  shortQuestions: [],
  longQuestions: [],
  questions: []
};

const Groq = require("groq-sdk");

const getGroqConfig = () => {
  const apiKey = process.env.Groq_API_KEY;
  const model = process.env.Groq_MODEL || "llama-3.3-70b-versatile";

  if (!apiKey) {
    throw new Error(
      "Groq_API_KEY environment variable is not set."
    );
  }

  return { apiKey, model };
};

const parseTextFromUpload = async (file) => {
  if (!file) return null;

  const mimeType = file.mimetype;

  if (mimeType === 'text/plain') {
    return file.buffer.toString('utf-8');
  }

  if (mimeType === 'application/pdf') {
    try {
      const data = await pdfParse(file.buffer);
      if (!data.text || data.text.trim().length === 0) {
        throw new Error('PDF file appears to be empty or corrupted');
      }
      return data.text.trim();
    } catch (error) {
      throw new Error(`Failed to parse PDF: ${error.message}`);
    }
  }

  throw new Error('Unsupported file format. Please upload TXT or PDF files only.');
};

const chunkText = (text, chunkSize = 6000) => {
  const chunks = [];
  const paragraphs = text.split(/\n{2,}/).map((part) => part.trim()).filter(Boolean);
  let currentChunk = '';

  const pushChunk = () => {
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
      currentChunk = '';
    }
  };

  const splitOversized = (value) => {
    const sentences = value.split(/(?<=[.!?])\s+/);
    for (const sentence of sentences) {
      if (sentence.length > chunkSize) {
        pushChunk();
        for (let index = 0; index < sentence.length; index += chunkSize) {
          chunks.push(sentence.slice(index, index + chunkSize).trim());
        }
        continue;
      }

      const next = currentChunk ? `${currentChunk} ${sentence}` : sentence;
      if (next.length > chunkSize) {
        pushChunk();
        currentChunk = sentence;
      } else {
        currentChunk = next;
      }
    }
  };

  for (const paragraph of paragraphs) {
    const next = currentChunk ? `${currentChunk}\n\n${paragraph}` : paragraph;
    if (paragraph.length > chunkSize) {
      pushChunk();
      splitOversized(paragraph);
    } else if (next.length > chunkSize) {
      pushChunk();
      currentChunk = paragraph;
    } else {
      currentChunk = next;
    }
  }

  pushChunk();
  return chunks;
};

const buildPrompt = (notes, isChunk = false, chunkIndex = 0, totalChunks = 0) => {
  if (isChunk) {
    return `You are an educational AI assistant.

This is chunk ${chunkIndex + 1} of ${totalChunks} of lecture notes.

Analyze this chunk and return only valid JSON with this exact shape:
{
  "summary": "Summary of this chunk",
  "keyConcepts": ["Concept from this chunk"],
  "definitions": ["Term: definition from this chunk"],
  "flashcards": [{"front": "Question or term", "back": "Answer or definition"}],
  "mcqs": [{"question": "Question", "options": ["A", "B", "C", "D"], "correctAnswer": "Correct option"}],
  "shortQuestions": [{"question": "Short question", "answer": "Brief answer"}],
  "longQuestions": [{"question": "Long question", "answer": "Detailed answer outline"}]
}

Lecture Notes Chunk:
${notes}`;
  }

  return `You are an educational AI assistant.

Analyze the lecture notes carefully.

Return only valid JSON with this exact shape:
{
  "summary": "Structured summary text",
  "keyConcepts": ["Concept 1"],
  "definitions": ["Term: definition"],
  "flashcards": [{"front": "Question or term", "back": "Answer or definition"}],
  "mcqs": [{"question": "Question text", "options": ["Option A", "Option B", "Option C", "Option D"], "correctAnswer": "Correct answer"}],
  "shortQuestions": [{"question": "Question text", "answer": "Brief answer"}],
  "longQuestions": [{"question": "Question text", "answer": "Detailed answer outline"}]
}

Generate at least:
- 8 concise key concepts
- 6 definitions
- 8 flashcards
- 5 MCQs with 4 options each
- 5 short-answer questions
- 3 long-answer questions

Lecture Notes:
${notes}`;
};

const buildMergePrompt = (summaries) => {
  return `You are an educational AI assistant.

Merge these chunk summaries into a coherent final summary.

Return only valid JSON with this exact shape:
{
  "summary": "Merged comprehensive summary",
  "keyConcepts": ["All key concepts"],
  "definitions": ["All definitions"],
  "flashcards": [{"front": "Question or term", "back": "Answer or definition"}],
  "mcqs": [{"question": "Question", "options": ["A", "B", "C", "D"], "correctAnswer": "Correct option"}],
  "shortQuestions": [{"question": "Short question", "answer": "Brief answer"}],
  "longQuestions": [{"question": "Long question", "answer": "Detailed answer outline"}]
}

Chunk Summaries:
${summaries.map((s, i) => `Chunk ${i + 1}: ${JSON.stringify(s)}`).join('\n\n')}`;
};

const extractJsonText = (rawText) => {
  const text = String(rawText || '').trim();
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) return fenced[1].trim();

  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    return text.slice(firstBrace, lastBrace + 1).trim();
  }

  return text;
};

const asStringArray = (value) => {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    if (typeof item === 'string') return item.trim();
    if (item && typeof item === 'object') {
      if (item.term && item.definition) return `${item.term}: ${item.definition}`.trim();
      if (item.title && item.description) return `${item.title}: ${item.description}`.trim();
      if (item.question) return String(item.question).trim();
    }
    return '';
  }).filter(Boolean);
};

const uniqueByText = (items, keyFn) => {
  const seen = new Set();
  return items.filter((item) => {
    const key = keyFn(item).toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const normalizeFlashcards = (value) => {
  if (!Array.isArray(value)) return [];
  return uniqueByText(value.map((item) => ({
    front: String(item?.front || item?.question || item?.term || '').trim(),
    back: String(item?.back || item?.answer || item?.definition || '').trim()
  })).filter((item) => item.front && item.back), (item) => `${item.front} ${item.back}`);
};

const normalizeMcqs = (value) => {
  if (!Array.isArray(value)) return [];
  return uniqueByText(value.map((item) => ({
    question: String(item?.question || '').trim(),
    options: Array.isArray(item?.options) ? item.options.map((option) => String(option).trim()).filter(Boolean).slice(0, 4) : [],
    correctAnswer: String(item?.correctAnswer || item?.answer || '').trim()
  })).filter((item) => item.question && item.options.length >= 2), (item) => item.question);
};

const normalizeQuestionAnswers = (value) => {
  if (!Array.isArray(value)) return [];
  return uniqueByText(value.map((item) => ({
    question: String(item?.question || '').trim(),
    answer: String(item?.answer || item?.correctAnswer || '').trim()
  })).filter((item) => item.question), (item) => item.question);
};

const legacyQuestionsFromStructured = (parsed) => [
  ...normalizeQuestionAnswers(parsed.shortQuestions).map((item) => ({
    type: 'short-answer',
    question: item.question,
    options: [],
    correctAnswer: item.answer
  })),
  ...normalizeQuestionAnswers(parsed.longQuestions).map((item) => ({
    type: 'long-answer',
    question: item.question,
    options: [],
    correctAnswer: item.answer
  })),
  ...normalizeMcqs(parsed.mcqs).map((item) => ({
    type: 'mcq',
    question: item.question,
    options: item.options,
    correctAnswer: item.correctAnswer
  }))
];

const normalizeLegacyQuestions = (value) => {
  if (!Array.isArray(value)) return [];
  return value.map((item) => ({
    type: ['short-answer', 'long-answer', 'mcq', 'conceptual'].includes(item?.type) ? item.type : 'short-answer',
    question: String(item?.question || '').trim(),
    options: Array.isArray(item?.options) ? item.options.map((option) => String(option).trim()).filter(Boolean).slice(0, 4) : [],
    correctAnswer: String(item?.correctAnswer || item?.answer || '').trim()
  })).filter((item) => item.question);
};

const normalizeAiOutput = (rawText) => {
  try {
    const jsonText = extractJsonText(rawText).replace(/,\s*([}\]])/g, '$1');
    const parsed = JSON.parse(jsonText);
    if (typeof parsed !== 'object' || parsed === null) {
      throw new Error('Parsed AI output is not an object.');
    }

    const normalized = {
      ...OUTPUT_SCHEMA,
      summary: String(parsed.summary || parsed.structuredSummary || parsed.StructuredSummary || '').trim(),
      keyConcepts: asStringArray(parsed.keyConcepts || parsed.concepts),
      definitions: asStringArray(parsed.definitions),
      flashcards: normalizeFlashcards(parsed.flashcards),
      mcqs: normalizeMcqs(parsed.mcqs || parsed.multipleChoiceQuestions),
      shortQuestions: normalizeQuestionAnswers(parsed.shortQuestions || parsed.shortAnswerQuestions),
      longQuestions: normalizeQuestionAnswers(parsed.longQuestions || parsed.longAnswerQuestions)
    };

    normalized.questions = [
      ...legacyQuestionsFromStructured(normalized),
      ...normalizeLegacyQuestions(parsed.questions)
    ];

    return normalized;
  } catch (error) {
    const parseError = new Error(`Unable to parse AI response as JSON: ${error.message}`);
    parseError.status = 502;
    throw parseError;
  }
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const callGroqAPI = async (
  prompt,
  apiKey,
  model,
  maxRetries = 3
) => {
  const groq = new Groq({ apiKey });

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const completion =
        await groq.chat.completions.create({
          model,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.4,
        });

      const outputText =
        completion?.choices?.[0]?.message?.content;

      if (!outputText) {
        throw new Error(
          "Groq returned an empty response."
        );
      }

      return outputText.trim();
    } catch (error) {
      if (attempt === maxRetries - 1) {
        throw error;
      }

      const delay = Math.pow(2, attempt) * 1000;

      console.log(
        `Retrying Groq request in ${delay}ms...`
      );

      await sleep(delay);
    }
  }
};


const generateSummaryFromNotes = async (notes, uploadedFileName = '') => {
  if (!notes || notes.trim().length === 0) {
    throw new Error('Notes text is required for AI generation.');
  }

  const startTime = Date.now();
  const { apiKey, model } = getGroqConfig();
  const notesText = notes.trim();

  if (notesText.length <= 7000) {
    const prompt = buildPrompt(notesText);
    const outputText = await callGroqAPI(prompt, apiKey, model);
    const result = normalizeAiOutput(outputText);
    result.processingTime = Date.now() - startTime;
    result.uploadedFileName = uploadedFileName;
    result.aiProvider = "Groq";
    result.aiModelUsed = model;
    return result;
  }

  const chunks = chunkText(notesText);
  const chunkSummaries = await Promise.all(
    chunks.map(async (chunk, index) => {
      const prompt = buildPrompt(chunk, true, index, chunks.length);
      const outputText = await callGeminiAPI(prompt, apiKey, model);
      return normalizeAiOutput(outputText);
    })
  );

  const mergePrompt = buildMergePrompt(chunkSummaries);
  const mergeOutput = await callGeminiAPI(mergePrompt, apiKey, model, 90000, 3);
  const mergedResult = normalizeAiOutput(mergeOutput);

  const finalResult = {
    summary: mergedResult.summary,
    keyConcepts: [...new Set(mergedResult.keyConcepts)],
    definitions: [...new Set(mergedResult.definitions)],
    flashcards: mergedResult.flashcards,
    mcqs: mergedResult.mcqs,
    shortQuestions: mergedResult.shortQuestions,
    longQuestions: mergedResult.longQuestions,
    questions: mergedResult.questions,
    processingTime: Date.now() - startTime,
    uploadedFileName,
    aiModelUsed: model
  };

  return finalResult;
};

module.exports = { parseTextFromUpload, generateSummaryFromNotes };
