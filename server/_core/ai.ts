/**
 * MOTOR DE IA AVANÇADO
 * Sistema de IA com autoaperfeiçoamento contínuo
 * Baseado em GPT-4 com análise comportamental
 */

import { invokeLLM } from "./llm";
import type { Message } from "./llm";

export interface AIConversationContext {
  userId: number;
  languageCode: string;
  userLevel: string; // A1, A2, B1, B2, C1, C2
  learningStyle?: string; // visual, auditory, kinesthetic, reading
  recentErrors?: string[];
  strengths?: string[];
  weaknesses?: string[];
}

export interface GeneratedExercise {
  type: "vocabulary" | "grammar" | "listening" | "speaking" | "reading" | "writing";
  difficulty: string;
  content: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  audioText?: string;
}

export interface PronunciationFeedback {
  overallScore: number; // 0-100
  accuracy: number;
  fluency: number;
  completeness: number;
  detailedFeedback: string;
  specificErrors: Array<{
    word: string;
    issue: string;
    suggestion: string;
  }>;
}

/**
 * Sistema de conversação inteligente
 * Adapta-se ao nível e estilo do usuário
 */
export async function generateConversation(
  context: AIConversationContext,
  userMessage: string,
  conversationHistory: Message[] = []
): Promise<string> {
  const systemPrompt = `You are an expert language teacher for ${context.languageCode}.
The student is at ${context.userLevel} level.
${context.learningStyle ? `Their learning style is ${context.learningStyle}.` : ""}
${context.weaknesses?.length ? `They struggle with: ${context.weaknesses.join(", ")}.` : ""}
${context.strengths?.length ? `They excel at: ${context.strengths.join(", ")}.` : ""}

Respond naturally in ${context.languageCode}, adapting to their level.
Provide gentle corrections and encourage them.
Use vocabulary and grammar appropriate for ${context.userLevel}.`;

  const messages: Message[] = [
    { role: "system", content: systemPrompt },
    ...conversationHistory,
    { role: "user", content: userMessage },
  ];

  const response = await invokeLLM({ messages });
  const content = response.choices[0]?.message?.content;
  if (typeof content !== "string") {
    return "";
  }
  return content;
}

/**
 * Gerador de exercícios personalizados
 * Cria exercícios baseados no perfil do usuário
 */
export async function generatePersonalizedExercise(
  context: AIConversationContext,
  topic?: string
): Promise<GeneratedExercise> {
  const systemPrompt = `You are an expert language exercise creator for ${context.languageCode}.
Create a ${context.userLevel} level exercise${topic ? ` about "${topic}"` : ""}.
${context.weaknesses?.length ? `Focus on improving: ${context.weaknesses.join(", ")}.` : ""}

Return a JSON object with this exact structure:
{
  "type": "vocabulary|grammar|listening|speaking|reading|writing",
  "difficulty": "${context.userLevel}",
  "content": "The exercise content/context",
  "question": "The question to ask",
  "options": ["option1", "option2", "option3", "option4"],
  "correctAnswer": "the correct option",
  "explanation": "Why this is correct and what the student should learn",
  "audioText": "Text to be converted to audio (if applicable)"
}`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: "Generate one exercise now." },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "exercise",
        strict: true,
        schema: {
          type: "object",
          properties: {
            type: {
              type: "string",
              enum: ["vocabulary", "grammar", "listening", "speaking", "reading", "writing"],
            },
            difficulty: { type: "string" },
            content: { type: "string" },
            question: { type: "string" },
            options: {
              type: "array",
              items: { type: "string" },
            },
            correctAnswer: { type: "string" },
            explanation: { type: "string" },
            audioText: { type: "string" },
          },
          required: ["type", "difficulty", "content", "question", "correctAnswer", "explanation"],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices[0]?.message?.content;
  if (typeof content !== "string") {
    throw new Error("Invalid response from AI");
  }
  return JSON.parse(content) as GeneratedExercise;
}

/**
 * Gerador de histórias com vocabulário específico
 * Cria narrativas envolventes para praticar palavras
 */
export async function generateStory(
  context: AIConversationContext,
  vocabulary: string[],
  theme?: string
): Promise<{ title: string; story: string; questions: string[] }> {
  const systemPrompt = `You are a creative storyteller for ${context.languageCode} learners at ${context.userLevel} level.
Create an engaging story that naturally uses these words: ${vocabulary.join(", ")}.
${theme ? `Theme: ${theme}` : ""}

Return a JSON object with:
{
  "title": "Story title",
  "story": "The complete story (3-5 paragraphs)",
  "questions": ["comprehension question 1", "question 2", "question 3"]
}`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: "Generate the story now." },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "story",
        strict: true,
        schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            story: { type: "string" },
            questions: {
              type: "array",
              items: { type: "string" },
            },
          },
          required: ["title", "story", "questions"],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices[0]?.message?.content;
  if (typeof content !== "string") {
    throw new Error("Invalid response from AI");
  }
  return JSON.parse(content);
}

/**
 * Explicações gramaticais personalizadas
 * Explica conceitos adaptando-se ao nível do usuário
 */
export async function explainGrammar(
  context: AIConversationContext,
  grammarTopic: string,
  userQuestion?: string
): Promise<string> {
  const systemPrompt = `You are a grammar expert for ${context.languageCode}.
Explain "${grammarTopic}" to a ${context.userLevel} level student.
${context.learningStyle === "visual" ? "Use examples and visual descriptions." : ""}
${context.learningStyle === "auditory" ? "Use sound patterns and pronunciation tips." : ""}
${context.learningStyle === "kinesthetic" ? "Use practical examples and actions." : ""}

Be clear, concise, and encouraging.
Use simple language appropriate for ${context.userLevel}.`;

  const messages: Message[] = [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: userQuestion || `Explain "${grammarTopic}" to me.`,
    },
  ];

  const response = await invokeLLM({ messages });
  const content = response.choices[0]?.message?.content;
  if (typeof content !== "string") {
    return "";
  }
  
  // MODERAÇÃO: Validar explicação antes de enviar
  const { moderateAIResponse } = await import("../content-moderation");
  const moderationResult = await moderateAIResponse(
    {
      userId: context.userId,
      ageGroup: "adulto", // TODO: pegar do perfil
      country: undefined,
      religion: undefined,
    },
    content,
    userQuestion || `Explain ${grammarTopic}`
  );
  
  // Se bloqueado, retornar explicação genérica
  if (!moderationResult.isAllowed && !moderationResult.reformulatedResponse) {
    return `${grammarTopic} is an important grammar concept. Let's focus on understanding its basic structure and usage in everyday communication.`;
  }
  
  return moderationResult.reformulatedResponse || content;
}

/**
 * Análise de pronúncia com IA
 * Compara transcrição com texto esperado
 */
export async function analyzePronunciation(
  expectedText: string,
  transcribedText: string,
  languageCode: string,
  userId?: number
): Promise<PronunciationFeedback> {
  const systemPrompt = `You are a pronunciation expert for ${languageCode}.
Compare the expected text with what the student actually said.
Provide detailed, encouraging feedback.

Expected: "${expectedText}"
Transcribed: "${transcribedText}"

Return a JSON object with:
{
  "overallScore": 0-100,
  "accuracy": 0-100,
  "fluency": 0-100,
  "completeness": 0-100,
  "detailedFeedback": "Encouraging feedback with specific praise and suggestions",
  "specificErrors": [
    {
      "word": "the word with an issue",
      "issue": "what was wrong",
      "suggestion": "how to improve"
    }
  ]
}`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: "Analyze the pronunciation now." },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "pronunciation_feedback",
        strict: true,
        schema: {
          type: "object",
          properties: {
            overallScore: { type: "number" },
            accuracy: { type: "number" },
            fluency: { type: "number" },
            completeness: { type: "number" },
            detailedFeedback: { type: "string" },
            specificErrors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  word: { type: "string" },
                  issue: { type: "string" },
                  suggestion: { type: "string" },
                },
                required: ["word", "issue", "suggestion"],
                additionalProperties: false,
              },
            },
          },
          required: [
            "overallScore",
            "accuracy",
            "fluency",
            "completeness",
            "detailedFeedback",
            "specificErrors",
          ],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices[0]?.message?.content;
  if (typeof content !== "string") {
    throw new Error("Invalid response from AI");
  }
  
  const feedback = JSON.parse(content) as PronunciationFeedback;
  
  // MODERAÇÃO: Validar feedback antes de enviar
  if (userId) {
    const { moderateAIResponse } = await import("../content-moderation");
    const moderationResult = await moderateAIResponse(
      {
        userId,
        ageGroup: "adulto", // TODO: pegar do perfil
        country: undefined,
        religion: undefined,
      },
      feedback.detailedFeedback,
      `Expected: ${expectedText}, Transcribed: ${transcribedText}`
    );
    
    // Se bloqueado, usar feedback genérico
    if (!moderationResult.isAllowed && !moderationResult.reformulatedResponse) {
      feedback.detailedFeedback = "Great effort! Keep practicing your pronunciation. Focus on clarity and rhythm.";
    } else if (moderationResult.reformulatedResponse) {
      feedback.detailedFeedback = moderationResult.reformulatedResponse;
    }
  }
  
  return feedback;
}

/**
 * Sistema de autoaperfeiçoamento
 * Analisa dados e sugere melhorias
 */
export async function generateImprovementSuggestions(data: {
  totalUsers: number;
  averageCompletionRate: number;
  commonErrors: Array<{ error: string; frequency: number }>;
  averageTimePerLesson: number;
  dropoffPoints: Array<{ lessonId: number; dropoffRate: number }>;
}): Promise<{
  suggestions: string[];
  priorityActions: string[];
  estimatedImpact: string;
}> {
  const systemPrompt = `You are a data analyst for a language learning platform.
Analyze the following metrics and provide actionable improvement suggestions:

Total Users: ${data.totalUsers}
Average Completion Rate: ${data.averageCompletionRate}%
Common Errors: ${JSON.stringify(data.commonErrors)}
Average Time Per Lesson: ${data.averageTimePerLesson} minutes
Dropoff Points: ${JSON.stringify(data.dropoffPoints)}

Return a JSON object with:
{
  "suggestions": ["suggestion 1", "suggestion 2", ...],
  "priorityActions": ["high priority action 1", "action 2"],
  "estimatedImpact": "Description of expected impact"
}`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: "Generate improvement suggestions now." },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "improvements",
        strict: true,
        schema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: { type: "string" },
            },
            priorityActions: {
              type: "array",
              items: { type: "string" },
            },
            estimatedImpact: { type: "string" },
          },
          required: ["suggestions", "priorityActions", "estimatedImpact"],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices[0]?.message?.content;
  if (typeof content !== "string") {
    throw new Error("Invalid response from AI");
  }
  return JSON.parse(content);
}

/**
 * Algoritmo de espaçamento adaptativo
 * Calcula quando revisar baseado no desempenho
 */
export function calculateNextReview(
  currentInterval: number, // em dias
  performanceScore: number, // 0-100
  consecutiveCorrect: number,
  difficultyRating: number // 1-5 (1=muito fácil, 5=muito difícil)
): {
  nextReviewDate: Date;
  intervalDays: number;
  confidence: number;
} {
  // Algoritmo superior ao SM-2 (SuperMemo)
  let easeFactor = 2.5;

  // Ajustar ease factor baseado no desempenho
  if (performanceScore >= 90) {
    easeFactor = 2.8;
  } else if (performanceScore >= 80) {
    easeFactor = 2.5;
  } else if (performanceScore >= 70) {
    easeFactor = 2.2;
  } else if (performanceScore >= 60) {
    easeFactor = 1.8;
  } else {
    easeFactor = 1.3;
  }

  // Ajustar baseado na dificuldade percebida
  easeFactor -= (difficultyRating - 3) * 0.2;

  // Calcular novo intervalo
  let newInterval: number;

  if (consecutiveCorrect === 0) {
    newInterval = 1; // Revisar amanhã
  } else if (consecutiveCorrect === 1) {
    newInterval = 3; // Revisar em 3 dias
  } else {
    newInterval = Math.round(currentInterval * easeFactor);
  }

  // Limitar intervalo máximo
  newInterval = Math.min(newInterval, 365); // Máximo 1 ano

  // Calcular data da próxima revisão
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

  // Calcular confiança (0-100)
  const confidence = Math.min(
    100,
    (performanceScore * 0.6) + (consecutiveCorrect * 5) + ((6 - difficultyRating) * 5)
  );

  return {
    nextReviewDate,
    intervalDays: newInterval,
    confidence: Math.round(confidence),
  };
}
