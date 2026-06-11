const pdfParse = require('pdf-parse');

const getGeminiConfig = () => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.OPENAI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set. Please configure it in your server/.env file.');
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
    const data = await pdfParse(file.buffer);
    return data.text.trim();
  }

  return null;
};

const buildPrompt = (notes) => {
  return `You are an educational AI assistant.

Analyze the lecture notes carefully.

Return only valid JSON with this exact shape:
{
  "summary": "Structured summary text",
  "keyConcepts": ["Concept 1"],
  "definitions": ["Term: definition"],
  "questions": ["Revision question 1"]
}

Generate exactly five revision questions.

Lecture Notes:
${notes}`;
};

const normalizeAiOutput = (rawText) => {
  try {
    const jsonText = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
    const parsed = JSON.parse(jsonText);
    if (typeof parsed !== 'object' || parsed === null) {
      throw new Error('Parsed AI output is not an object.');
    }
    return {
      summary: String(parsed.summary || parsed.structuredSummary || parsed.StructuredSummary || '').trim(),
      keyConcepts: Array.isArray(parsed.keyConcepts) ? parsed.keyConcepts : [],
      definitions: Array.isArray(parsed.definitions) ? parsed.definitions : [],
      questions: Array.isArray(parsed.questions) ? parsed.questions : []
    };
  } catch (error) {
    throw new Error(`Unable to parse AI response as JSON: ${error.message}`);
  }
};

const generateSummaryFromNotes = async (notes) => {
  if (!notes) {
    throw new Error('Notes text is required for AI generation.');
  }

  const { apiKey, model } = getGeminiConfig();
  const prompt = buildPrompt(notes);

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 1500,
        responseMimeType: 'application/json'
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API request failed with status ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const outputText = data.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('');

  if (!outputText) {
    throw new Error('Gemini API returned an unexpected response shape.');
  }

  return normalizeAiOutput(outputText.trim());
};


module.exports = { parseTextFromUpload, generateSummaryFromNotes };
