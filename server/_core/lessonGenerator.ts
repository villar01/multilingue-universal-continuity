/**
 * LESSON GENERATOR
 * Sistema de geração automática de lições usando GPT-4
 */

import { invokeLLM } from "./llm";

interface LessonGenerationParams {
  topic: string;
  level: "beginner" | "intermediate" | "advanced";
  languageCode: string;
  targetLanguage: string;
}

interface GeneratedLesson {
  title: string;
  description: string;
  storyText: string;
  vocabularyDetailed: string; // JSON string
  grammarDetailed: string; // JSON string
  phonetics: string; // JSON string
  conversationPrompts: string; // JSON string
  keywords: string;
  topics: string;
}

export async function generateLesson(params: LessonGenerationParams): Promise<GeneratedLesson> {
  const { topic, level, languageCode, targetLanguage } = params;

  const prompt = `You are an expert language teacher creating a complete lesson for ${targetLanguage} learners.

**Topic:** ${topic}
**Level:** ${level}
**Target Language:** ${targetLanguage}
**Student's Native Language:** Portuguese (Brazil)

Create a complete lesson with the following components:

1. **Title**: A catchy, descriptive title for the lesson
2. **Description**: A brief 2-sentence description of what students will learn
3. **Story Text**: A 300-400 word narrative story about the topic, using vocabulary appropriate for ${level} level. The story should be engaging, contextual, and use cognates (words similar to Portuguese) when possible for better memorization.

4. **Vocabulary Detailed** (JSON array with 12 words, with emoji and imageKeyword for visual learning):
[
  {
    "word": "example",
    "phonetic": "/ɪɡˈzæmpəl/",
    "translation": "exemplo",
    "synonyms": ["instance", "sample"],
    "slang": ["ex"],
    "emoji": "📝",
    "imageKeyword": "example object",
    "examples": [
      {"en": "For example, I like pizza.", "pt": "Por exemplo, eu gosto de pizza."},
      {"en": "Can you give me an example?", "pt": "Você pode me dar um exemplo?"}
    ]
  }
]
IMPORTANT: Always include emoji (relevant to the word meaning) and imageKeyword (2-3 words for image search) for every vocabulary item. Include 2 example sentences per word.

5. **Grammar Detailed** (JSON array with 2-3 grammar topics):
[
  {
    "topic": "Present Simple",
    "explanation": "Used for habits and general truths",
    "examples": [
      {"en": "I work every day.", "pt": "Eu trabalho todos os dias."}
    ],
    "exercises": [
      {"question": "Complete: She ___ (work) in a hospital.", "answer": "works"}
    ]
  }
]

6. **Phonetics** (JSON array with 3-4 pronunciation tips):
[
  {
    "topic": "TH sound",
    "explanation": "Place tongue between teeth",
    "examples": ["think", "this", "thank"],
    "practice": "The three brothers think about their mother."
  }
]

7. **Conversation Prompts** (JSON array with 10 questions):
[
  "Tell me about your daily routine.",
  "What do you usually do on weekends?",
  ...
]

8. **Keywords**: Comma-separated list of 5-7 keywords
9. **Topics**: Comma-separated list of 2-3 related topics

Return ONLY a valid JSON object with these fields: title, description, storyText, vocabularyDetailed, grammarDetailed, phonetics, conversationPrompts, keywords, topics.`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: "You are an expert language teacher and curriculum designer." },
      { role: "user", content: prompt }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "lesson_generation",
        strict: true,
        schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            storyText: { type: "string" },
            vocabularyDetailed: { type: "string" },
            grammarDetailed: { type: "string" },
            phonetics: { type: "string" },
            conversationPrompts: { type: "string" },
            keywords: { type: "string" },
            topics: { type: "string" }
          },
          required: ["title", "description", "storyText", "vocabularyDetailed", "grammarDetailed", "phonetics", "conversationPrompts", "keywords", "topics"],
          additionalProperties: false
        }
      }
    }
  });

  const content = (response.choices[0].message.content as string);
  if (!content) {
    throw new Error("Failed to generate lesson: empty response");
  }

  const lesson = JSON.parse(content);
  return lesson as GeneratedLesson;
}

/**
 * Generate infinite exercises for a lesson
 */
export async function generateExercises(lessonTopic: string, vocabularyWords: string[], count: number = 10) {
  const prompt = `Generate ${count} varied exercises for a language lesson about "${lessonTopic}".

Use these vocabulary words: ${vocabularyWords.join(", ")}

Create exercises of different types:
- Multiple choice (meaning, translation, usage)
- Fill in the blank
- Sentence completion
- True/False
- Matching

Return a JSON array of exercises:
[
  {
    "type": "multiple_choice",
    "question": "What does 'example' mean?",
    "options": ["exemplo", "amostra", "teste", "prova"],
    "correctAnswer": "exemplo",
    "explanation": "Example means exemplo in Portuguese."
  },
  {
    "type": "fill_blank",
    "question": "Complete: I need an _____ to understand.",
    "correctAnswer": "example",
    "explanation": "The sentence needs the word 'example'."
  }
]`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: "You are an expert language teacher creating exercises." },
      { role: "user", content: prompt }
    ]
  });

  const content = (response.choices[0].message.content as string);
  if (!content) {
    throw new Error("Failed to generate exercises");
  }

  // Strip markdown code fences if present (```json ... ``` or ``` ... ```)
  const cleaned = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
  return JSON.parse(cleaned);
}
