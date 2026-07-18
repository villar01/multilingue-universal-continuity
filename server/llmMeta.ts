/**
 * Meta Llama API helper — faster and cheaper than Claude/GPT-4
 * Models: Llama-4-Maverick (multimodal), Llama-3.3-70B, Llama-3.3-8B (ultra-fast)
 * Docs: https://llama.developer.meta.com/docs/
 */

const LLAMA_API_URL = 'https://api.llama.com/v1/chat/completions';

type MetaTextContent = { type: 'text'; text: string };
type MetaImageContent = { type: 'image_url'; image_url: { url: string } };
type MetaContent = string | Array<MetaTextContent | MetaImageContent>;

interface MetaMessage {
  role: 'system' | 'user' | 'assistant';
  content: MetaContent;
}

interface InvokeLlamaParams {
  messages: MetaMessage[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

/**
 * Text chat with any Llama model.
 * Default: Llama-3.3-70B-Instruct (best quality/speed balance)
 * Fast option: Llama-3.3-8B-Instruct (50x cheaper, great for AR tips)
 */
export async function invokeLlama(params: InvokeLlamaParams): Promise<string> {
  const apiKey = process.env.LLAMA_API_KEY;
  if (!apiKey) throw new Error('LLAMA_API_KEY not configured');

  const model = params.model ?? 'Llama-3.3-70B-Instruct';

  const res = await fetch(LLAMA_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: params.messages,
      temperature: params.temperature ?? 0.7,
      max_tokens: params.max_tokens ?? 512,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Llama API ${res.status}: ${err}`);
  }

  const data = await res.json() as { choices: Array<{ message: { content: string } }> };
  return data.choices[0].message.content;
}

/**
 * Vision — uses Llama 4 Maverick (multimodal, 128k context)
 * Accepts image URL or base64 data URL from canvas
 */
export async function invokeLlamaVision(params: {
  imageUrl: string;
  prompt: string;
  language?: string;
}): Promise<string> {
  return invokeLlama({
    model: 'Llama-4-Maverick-17B-128E-Instruct-FP8',
    messages: [{
      role: 'user',
      content: [
        { type: 'image_url', image_url: { url: params.imageUrl } },
        { type: 'text', text: params.prompt },
      ],
    }],
    max_tokens: 400,
  });
}

/**
 * AR Copilot tip — ultra-fast with 8B model
 */
export async function arCopilotTip(params: {
  teacherName: string;
  language: string;
  learnedWords: string[];
  wrongAnswers?: string[];
}): Promise<string> {
  const { teacherName, language, learnedWords, wrongAnswers = [] } = params;
  const wrongPart = wrongAnswers.length > 0
    ? ` Student struggled with: ${wrongAnswers.join(', ')}.`
    : '';

  return invokeLlama({
    model: 'Llama-3.3-8B-Instruct', // ultra-fast for real-time AR
    messages: [
      {
        role: 'system',
        content: `You are ${teacherName}, an expert ${language} teacher. Give short, encouraging tips. Max 2 sentences.`,
      },
      {
        role: 'user',
        content: `Student just learned: ${learnedWords.join(', ')}.${wrongPart} Give one practical tip in English.`,
      },
    ],
    max_tokens: 100,
    temperature: 0.6,
  });
}

/**
 * Generate AR quiz question from learned words
 */
export async function generateARQuiz(params: {
  language: string;
  learnedWords: string[];
  level?: 'beginner' | 'intermediate' | 'advanced';
}): Promise<{ question: string; options: string[]; correct: number }> {
  const { language, learnedWords, level = 'beginner' } = params;

  const raw = await invokeLlama({
    model: 'Llama-3.3-70B-Instruct',
    messages: [{
      role: 'user',
      content: `Create a ${level} ${language} vocabulary quiz about these words: ${learnedWords.join(', ')}.
Return ONLY valid JSON (no markdown): {"question":"...","options":["a","b","c","d"],"correct":0}
The "correct" field is the 0-based index of the right answer.`,
    }],
    max_tokens: 200,
    temperature: 0.3,
  });

  try {
    const cleaned = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    // Fallback quiz if parsing fails
    return {
      question: `What is the ${language} word for "${learnedWords[0]}"?`,
      options: [learnedWords[0], 'casa', 'agua', 'libro'],
      correct: 0,
    };
  }
}

/**
 * Self-development: teacher adapts to student's error pattern
 */
export async function adaptTeaching(params: {
  language: string;
  correctWords: string[];
  wrongWords: string[];
  sessionCount: number;
}): Promise<{ nextTopic: string; exercises: string[]; encouragement: string }> {
  const { language, correctWords, wrongWords, sessionCount } = params;

  const raw = await invokeLlama({
    model: 'Llama-3.3-70B-Instruct',
    messages: [
      {
        role: 'system',
        content: 'You are an adaptive language teaching AI. Analyze student performance and suggest personalized next steps.',
      },
      {
        role: 'user',
        content: `Language: ${language}. Session #${sessionCount}.
Mastered: ${correctWords.join(', ')}.
Needs practice: ${wrongWords.join(', ')}.
Return ONLY valid JSON: {"nextTopic":"...","exercises":["ex1","ex2","ex3"],"encouragement":"..."}`,
      },
    ],
    max_tokens: 300,
    temperature: 0.5,
  });

  try {
    const cleaned = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return {
      nextTopic: `${language} vocabulary review`,
      exercises: ['Practice with flashcards', 'Use words in sentences', 'Listen and repeat'],
      encouragement: 'Great progress! Keep going!',
    };
  }
}
