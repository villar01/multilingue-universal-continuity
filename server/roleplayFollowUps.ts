import { invokeLLM } from "./_core/llm";
import {
  generateAIBatch,
  type AIBatchGenerateItem,
  type AIGenerateOptions,
} from "./aiProvider";

type FallbackInvoker = (request: {
  messages: AIGenerateOptions["messages"];
  response_format?: { type: "json_object" };
}) => Promise<unknown>;

type BatchGenerator = (
  requests: readonly AIGenerateOptions[],
  maxConcurrent?: number,
) => Promise<AIBatchGenerateItem[]>;

function extractText(response: unknown): string {
  const content = (response as { choices?: Array<{ message?: { content?: unknown } }> })
    ?.choices?.[0]?.message?.content;
  return typeof content === "string" ? content : "";
}

export async function generateRoleplayFollowUps(
  input: { npcMessage: string; targetLanguage: string; setting: string },
  dependencies: { generateBatch?: BatchGenerator; invokeFallback?: FallbackInvoker } = {},
): Promise<{ translation: string; optionsContent: string }> {
  const requests: AIGenerateOptions[] = [
    {
      messages: [
        {
          role: "system",
          content: "Translate the following text to Brazilian Portuguese. Return ONLY the translation.",
        },
        { role: "user", content: input.npcMessage },
      ],
      temperature: 0.2,
      max_tokens: 180,
    },
    {
      messages: [
        {
          role: "system",
          content: `Generate exactly 3 short response options in ${input.targetLanguage} for the student to reply to: "${input.npcMessage}"
Context: ${input.setting}
Rules:
- Each option must be 1 sentence max
- Options should be natural and varied (e.g., one formal, one casual, one question)
- Return ONLY a JSON array of 3 strings, nothing else
Example: ["Option A", "Option B", "Option C"]`,
        },
        { role: "user", content: "Generate the 3 options:" },
      ],
      temperature: 0.4,
      max_tokens: 280,
    },
  ];

  const batch = dependencies.generateBatch ?? generateAIBatch;
  const fallback = dependencies.invokeFallback ?? ((request) => invokeLLM(request));
  const [translationBatch, optionsBatch] = await batch(requests, 2);

  const [translation, optionsContent] = await Promise.all([
    translationBatch?.ok
      ? Promise.resolve(translationBatch.result.content)
      : fallback({ messages: requests[0].messages }).then(extractText),
    optionsBatch?.ok
      ? Promise.resolve(optionsBatch.result.content)
      : fallback({
          messages: requests[1].messages,
          response_format: { type: "json_object" },
        }).then(extractText),
  ]);

  return { translation, optionsContent };
}
