export const INITIAL_COMMERCIAL_LANGUAGE_CODES = [
  "pt-BR",
  "en-US",
  "es-ES",
  "fr-FR",
  "it-IT",
  "de-DE",
] as const;

export type InitialCommercialLanguageCode = (typeof INITIAL_COMMERCIAL_LANGUAGE_CODES)[number];

export type InitialCommercialTargetBlockId = "english" | "spanish" | "french" | "italian" | "german";
export type InitialCommercialTargetBlockStatus = "pilot" | "preparing";

export type InitialCommercialTargetBlock = {
  id: InitialCommercialTargetBlockId;
  targetLanguageBases: readonly string[];
  targetLocale: string;
  label: string;
  status: InitialCommercialTargetBlockStatus;
  availableLevels: readonly string[];
  nativeGuidance: "any-available-native-language";
  contentBoundary: "server-only-target-specific";
};

/**
 * Contratos de entrega separados por idioma-alvo. Eles carregam apenas
 * metadados públicos de disponibilidade; todo material pedagógico permanece no
 * servidor e nenhum bloco pode usar conteúdo de outro idioma como fallback.
 */
export const INITIAL_COMMERCIAL_TARGET_BLOCKS: readonly InitialCommercialTargetBlock[] = [
  { id: "english", targetLanguageBases: ["en"], targetLocale: "en-US", label: "Inglês", status: "pilot", availableLevels: ["A1"], nativeGuidance: "any-available-native-language", contentBoundary: "server-only-target-specific" },
  { id: "spanish", targetLanguageBases: ["es"], targetLocale: "es-ES", label: "Espanhol", status: "preparing", availableLevels: [], nativeGuidance: "any-available-native-language", contentBoundary: "server-only-target-specific" },
  { id: "french", targetLanguageBases: ["fr"], targetLocale: "fr-FR", label: "Francês", status: "preparing", availableLevels: [], nativeGuidance: "any-available-native-language", contentBoundary: "server-only-target-specific" },
  { id: "italian", targetLanguageBases: ["it"], targetLocale: "it-IT", label: "Italiano", status: "preparing", availableLevels: [], nativeGuidance: "any-available-native-language", contentBoundary: "server-only-target-specific" },
  { id: "german", targetLanguageBases: ["de"], targetLocale: "de-DE", label: "Alemão", status: "preparing", availableLevels: [], nativeGuidance: "any-available-native-language", contentBoundary: "server-only-target-specific" },
] as const;

function languageBase(languageCode: string): string {
  return languageCode.trim().toLowerCase().split("-")[0] || "";
}

/**
 * The initial commercial product is released by target language. Native support
 * remains universal, so an enrolled learner may use any supported native language
 * to study one of the six launched targets.
 */
export function isInitialCommercialTargetLanguage(languageCode: string): boolean {
  const base = languageBase(languageCode);
  return INITIAL_COMMERCIAL_LANGUAGE_CODES.some((released) => languageBase(released) === base);
}

export function getCommercialLanguageBlock(languageCode: string): "initial" | "future" {
  return isInitialCommercialTargetLanguage(languageCode) ? "initial" : "future";
}

export function getInitialCommercialTargetBlock(languageCode: string): InitialCommercialTargetBlock | undefined {
  const base = languageBase(languageCode);
  return INITIAL_COMMERCIAL_TARGET_BLOCKS.find((block) => block.targetLanguageBases.includes(base));
}
