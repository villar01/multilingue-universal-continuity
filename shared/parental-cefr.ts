export const PARENTAL_CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

export type ParentalCefrLevel = (typeof PARENTAL_CEFR_LEVELS)[number];

export const PARENTAL_CEFR_LEVEL_DETAILS: Record<ParentalCefrLevel, { label: string; description: string }> = {
  A1: { label: "A1 · Iniciante", description: "Palavras e frases concretas do cotidiano" },
  A2: { label: "A2 · Básico", description: "Situações simples e rotina diária" },
  B1: { label: "B1 · Intermediário", description: "Conversas sobre temas familiares" },
  B2: { label: "B2 · Intermediário avançado", description: "Argumentos e temas mais abstratos" },
  C1: { label: "C1 · Avançado", description: "Expressão fluente com precisão" },
  C2: { label: "C2 · Proficiente", description: "Uso complexo e nuance de linguagem" },
};

const LEGACY_PARENTAL_LEVELS: Record<string, ParentalCefrLevel[]> = {
  beginner: ["A1", "A2"],
  basic: ["A1", "A2"],
  intermediate: ["B1", "B2"],
  advanced: ["C1", "C2"],
  proficient: ["C2"],
};

/**
 * Preserva configurações parentais antigas no momento da leitura e devolve
 * somente os seis estágios que a interface atual pode gravar.
 */
export function normalizeParentalCefrLevels(levels?: readonly string[] | null): ParentalCefrLevel[] {
  const selected = new Set<ParentalCefrLevel>();

  for (const rawLevel of levels || []) {
    const normalized = rawLevel.trim().toUpperCase();
    if (PARENTAL_CEFR_LEVELS.includes(normalized as ParentalCefrLevel)) {
      selected.add(normalized as ParentalCefrLevel);
      continue;
    }

    for (const level of LEGACY_PARENTAL_LEVELS[rawLevel.trim().toLowerCase()] || []) {
      selected.add(level);
    }
  }

  const ordered = PARENTAL_CEFR_LEVELS.filter((level) => selected.has(level));
  return ordered.length ? ordered : ["A1"];
}
