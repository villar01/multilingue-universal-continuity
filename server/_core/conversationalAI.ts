/**
 * CONVERSATIONAL AI ENGINE
 * Motor de IA para conversação livre e dinâmica com alunos
 * Cada conversa é única e contextualizada à lição
 */

import { invokeLLM } from "./llm";

export type ConversationCEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

const CONVERSATION_LEVEL_GUIDANCE: Record<ConversationCEFRLevel, string> = {
  A1: "Use concrete everyday words, no more than 6 words per sentence, and simple identification or yes/no questions.",
  A2: "Use common routine vocabulary, no more than 10 words per sentence, and short descriptive questions.",
  B1: "Use familiar travel, work, and personal-experience topics with sentences of at most 18 words.",
  B2: "Use supported opinions, comparisons, and error correction with sentences of at most 25 words.",
  C1: "Use nuanced professional or academic vocabulary, paraphrase, and argument with sentences of at most 35 words.",
  C2: "Use precise cultural nuance, debate, and sophisticated reformulation with sentences of at most 50 words.",
};

export interface ConversationContext {
  lessonTitle: string;
  lessonTopic: string;
  storyText: string;
  vocabulary: string[];
  userLevel: ConversationCEFRLevel;
  targetLanguage: string;
  nativeLanguage: string;
}

export interface ConversationMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

/**
 * Gera uma pergunta aberta contextualizada para iniciar conversa
 */
export async function generateConversationStarter(
  context: ConversationContext
): Promise<string> {
  const systemPrompt = `You are a friendly language teacher teaching ${context.targetLanguage} to a ${context.userLevel} student.
The current lesson is about: ${context.lessonTopic}

CEFR CONSTRAINT: ${CONVERSATION_LEVEL_GUIDANCE[context.userLevel]}

Generate ONE open-ended question in ${context.targetLanguage} that:
1. Is related to the lesson topic
2. Encourages the student to share personal experiences
3. Uses vocabulary from the lesson
4. Is appropriate for ${context.userLevel} level
5. Is natural and conversational

IMPORTANT: Return ONLY the question in ${context.targetLanguage}, nothing else.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Generate a conversation starter about: ${context.lessonTopic}` }
      ],
    });

    return ((response.choices[0].message.content as string) as string)?.trim() || "";
  } catch (error) {
    console.error("Error generating conversation starter:", error);
    // Fallback genérico
    return context.userLevel === "A1" || context.userLevel === "A2"
      ? "Tell me about your family."
      : "Can you describe your family and what you like to do together?";
  }
}

/**
 * Continua a conversa de forma natural e pedagógica
 */
export async function continueConversation(
  context: ConversationContext,
  history: ConversationMessage[]
): Promise<string> {
  const systemPrompt = `You are a friendly and encouraging language teacher teaching ${context.targetLanguage} to a ${context.userLevel} student.

LESSON CONTEXT:
- Topic: ${context.lessonTopic}
- Key vocabulary: ${context.vocabulary.join(", ")}
- Student level: ${context.userLevel}
- CEFR constraint: ${CONVERSATION_LEVEL_GUIDANCE[context.userLevel]}

YOUR ROLE:
1. Respond naturally to the student's message
2. Gently correct errors by rephrasing correctly (don't explicitly say "wrong")
3. Ask follow-up questions to keep the conversation going
4. Use vocabulary from the lesson naturally
5. Adapt complexity to ${context.userLevel} level
6. Be encouraging and supportive
7. Keep responses concise (2-3 sentences max)

IMPORTANT: 
- Respond ONLY in ${context.targetLanguage}
- Be conversational, not robotic
- Don't lecture or explain grammar unless asked
- Focus on communication, not perfection`;

  try {
    const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      { role: "system", content: systemPrompt },
      ...history.map(msg => ({
        role: msg.role as "user" | "assistant",
        content: msg.content
      }))
    ];

    const response = await invokeLLM({ messages });

    return ((response.choices[0].message.content as string) as string)?.trim() || "";
  } catch (error) {
    console.error("Error continuing conversation:", error);
    return "That's interesting! Can you tell me more?";
  }
}

/**
 * Fornece feedback sobre a resposta do aluno
 */
export async function provideFeedback(
  context: ConversationContext,
  userMessage: string
): Promise<{
  feedback: string;
  corrections: Array<{ original: string; corrected: string; explanation: string }>;
  encouragement: string;
}> {
  const systemPrompt = `You are a language teacher analyzing a ${context.userLevel} student's response in ${context.targetLanguage}.
CEFR constraint: ${CONVERSATION_LEVEL_GUIDANCE[context.userLevel]}

Analyze this message and provide:
1. Positive feedback on what they did well
2. Gentle corrections (if any)
3. Encouragement to continue

Return a JSON object with this structure:
{
  "feedback": "positive comment on what they did well",
  "corrections": [
    {
      "original": "their phrase",
      "corrected": "correct version",
      "explanation": "brief explanation in ${context.nativeLanguage}"
    }
  ],
  "encouragement": "encouraging message"
}

If there are no errors, return empty corrections array.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Analyze this student message: "${userMessage}"` }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "feedback_response",
          strict: true,
          schema: {
            type: "object",
            properties: {
              feedback: { type: "string" },
              corrections: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    original: { type: "string" },
                    corrected: { type: "string" },
                    explanation: { type: "string" }
                  },
                  required: ["original", "corrected", "explanation"],
                  additionalProperties: false
                }
              },
              encouragement: { type: "string" }
            },
            required: ["feedback", "corrections", "encouragement"],
            additionalProperties: false
          }
        }
      }
    });

    const content = ((response.choices[0].message.content as string) as string);
    if (!content) throw new Error("No content in response");

    return JSON.parse(content);
  } catch (error) {
    console.error("Error providing feedback:", error);
    return {
      feedback: "Good effort!",
      corrections: [],
      encouragement: "Keep practicing!"
    };
  }
}

/**
 * Gera múltiplas perguntas de conversação para uma lição
 */
export async function generateConversationPrompts(
  context: ConversationContext,
  count: number = 10
): Promise<string[]> {
  const systemPrompt = `You are a language teacher creating conversation prompts for a ${context.userLevel} ${context.targetLanguage} lesson.
CEFR constraint: ${CONVERSATION_LEVEL_GUIDANCE[context.userLevel]}

LESSON: ${context.lessonTopic}
VOCABULARY: ${context.vocabulary.join(", ")}

Generate ${count} diverse open-ended questions in ${context.targetLanguage} that:
1. Are related to the lesson topic
2. Encourage personal sharing and storytelling
3. Use vocabulary from the lesson
4. Are appropriate for ${context.userLevel} level
5. Cover different aspects of the topic
6. Are natural and conversational

Return ONLY a JSON array of strings (the questions), nothing else.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Generate ${count} conversation prompts` }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "prompts_response",
          strict: true,
          schema: {
            type: "object",
            properties: {
              prompts: {
                type: "array",
                items: { type: "string" }
              }
            },
            required: ["prompts"],
            additionalProperties: false
          }
        }
      }
    });

    const content = ((response.choices[0].message.content as string) as string);
    if (!content) throw new Error("No content in response");

    const parsed = JSON.parse(content);
    return parsed.prompts || [];
  } catch (error) {
    console.error("Error generating conversation prompts:", error);
    // Fallback genérico
    return [
      "Tell me about your family.",
      "What do you like to do with your family?",
      "Describe your home.",
      "What is your daily routine?",
      "Tell me about your hobbies."
    ];
  }
}
