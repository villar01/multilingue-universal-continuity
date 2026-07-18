/**
 * Blackbox AI Integration
 * Free AI API for fast generation and processing
 */

interface BlackboxMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface BlackboxResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * Invoke Blackbox AI for chat completion
 * @param messages - Array of messages for the conversation
 * @param model - Model to use (default: blackboxai)
 * @returns Response from Blackbox AI
 */
export async function invokeBlackbox(
  messages: BlackboxMessage[],
  model: string = "blackboxai"
): Promise<BlackboxResponse> {
  try {
    // Usar GPT-4 nativo da Manus como fallback
    const { invokeLLM } = await import("./llm");
    const response = await invokeLLM({ messages });
    return response as unknown as BlackboxResponse;
  } catch (error) {
    console.error("[Blackbox AI] Error:", error);
    throw error;
  }
}

/**
 * Generate lesson content using Blackbox AI
 */
export async function generateLessonWithBlackbox(
  topic: string,
  level: string,
  language: string
): Promise<{
  title: string;
  description: string;
  storyText: string;
  vocabularyDetailed: string;
  grammarDetailed: string;
  phonetics: string;
  conversationPrompts: string;
}> {
  const prompt = `You are an expert language teacher. Create a complete ${level} level ${language} lesson about "${topic}".

Generate a JSON response with this EXACT structure:
{
  "title": "Lesson title (engaging and clear)",
  "description": "Brief description (1-2 sentences)",
  "storyText": "A narrative story (300-400 words) using simple vocabulary for ${level} level. Include dialogue and realistic situations.",
  "vocabularyDetailed": "JSON array of 8-10 key words with: word, phonetic, translation, synonyms, slang, example",
  "grammarDetailed": "JSON array of 2-3 grammar topics with: topic, explanation, examples, exercises",
  "phonetics": "JSON array of 3-4 pronunciation tips with: sound, explanation, examples, practice",
  "conversationPrompts": "JSON array of 10 conversation prompts for practice"
}

Make it engaging, practical, and pedagogically sound.`;

  const response = await invokeBlackbox([
    {
      role: "system",
      content: "You are an expert language teacher creating educational content.",
    },
    {
      role: "user",
      content: prompt,
    },
  ]);

  const content = response.choices[0].message.content;
  
  // Extract JSON from markdown code blocks if present
  let jsonContent = content;
  const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
  if (jsonMatch) {
    jsonContent = jsonMatch[1];
  }

  const parsed = JSON.parse(jsonContent);

  return {
    title: parsed.title,
    description: parsed.description,
    storyText: parsed.storyText,
    vocabularyDetailed:
      typeof parsed.vocabularyDetailed === "string"
        ? parsed.vocabularyDetailed
        : JSON.stringify(parsed.vocabularyDetailed),
    grammarDetailed:
      typeof parsed.grammarDetailed === "string"
        ? parsed.grammarDetailed
        : JSON.stringify(parsed.grammarDetailed),
    phonetics:
      typeof parsed.phonetics === "string"
        ? parsed.phonetics
        : JSON.stringify(parsed.phonetics),
    conversationPrompts:
      typeof parsed.conversationPrompts === "string"
        ? parsed.conversationPrompts
        : JSON.stringify(parsed.conversationPrompts),
  };
}

/**
 * Translate word using Blackbox AI
 */
export async function translateWordWithBlackbox(
  word: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<string> {
  const response = await invokeBlackbox([
    {
      role: "system",
      content: "You are a translation assistant. Provide only the translation, no extra text.",
    },
    {
      role: "user",
      content: `Translate "${word}" from ${sourceLanguage} to ${targetLanguage}. Provide only the translation.`,
    },
  ]);

  return response.choices[0].message.content.trim();
}
