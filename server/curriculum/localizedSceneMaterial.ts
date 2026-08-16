import { generateAI } from "../aiProvider";
import { isInitialCommercialTargetLanguage } from "../../shared/commercialLanguageBlocks";

export type LocalizedSceneDialogueTurn = {
  targetText: string;
  nativeHelp: string;
};

export type LocalizedSceneMaterialResult = {
  status: "ready" | "planned_language_block" | "localization_unavailable" | "invalid_localization";
  turns: LocalizedSceneDialogueTurn[];
};

export function parseLocalizedSceneTurns(content: string): LocalizedSceneDialogueTurn[] | null {
  try {
    const parsed = JSON.parse(content) as unknown;
    if (!Array.isArray(parsed) || parsed.length < 2 || parsed.length > 4) return null;
    const turns = parsed.map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const candidate = entry as Record<string, unknown>;
      const targetText = typeof candidate.targetText === "string" ? candidate.targetText.trim() : "";
      const nativeHelp = typeof candidate.nativeHelp === "string" ? candidate.nativeHelp.trim() : "";
      return targetText && nativeHelp ? { targetText, nativeHelp } : null;
    });
    return turns.some((turn) => turn === null) ? null : turns as LocalizedSceneDialogueTurn[];
  } catch {
    return null;
  }
}

/**
 * Produces a small, scene-specific dialogue only after the existing lesson access
 * check has passed in the curriculum router. The native language is never limited,
 * while target content is released only for the six commercial launch languages.
 */
export async function localizeSceneDialogue(input: {
  sceneId: string;
  targetLanguage: string;
  nativeLanguage: string;
  userId: number;
}): Promise<LocalizedSceneMaterialResult> {
  if (!isInitialCommercialTargetLanguage(input.targetLanguage)) {
    return { status: "planned_language_block", turns: [] };
  }

  try {
    const response = await generateAI({
      messages: [
        {
          role: "system",
          content: "You create short, safe A1 language-learning dialogues. Return only valid JSON.",
        },
        {
          role: "user",
          content: `Create 2 to 4 concise dialogue turns for the learning scene "${input.sceneId}". The target language is ${input.targetLanguage}; the native learner support language is ${input.nativeLanguage}. Use only these two languages. Return a JSON array where each object contains targetText and nativeHelp. Keep every turn tied to visible, everyday scene objects and suitable for all ages.`,
        },
      ],
      temperature: 0,
      max_tokens: 1200,
      preferredProvider: "ollama",
      useCache: true,
      userId: input.userId,
    });
    const turns = parseLocalizedSceneTurns(response.content);
    return turns ? { status: "ready", turns } : { status: "invalid_localization", turns: [] };
  } catch {
    return { status: "localization_unavailable", turns: [] };
  }
}
