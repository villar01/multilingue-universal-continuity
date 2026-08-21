export type PedagogicalLevel = "initial" | "intermediate" | "advanced" | "technological";

export type PedagogicalEvidence =
  | "concept_recognition"
  | "guided_practice"
  | "short_response"
  | "contextual_correction"
  | "independent_transfer"
  | "domain_application";

export interface PedagogicalLevelContract {
  id: PedagogicalLevel;
  label: string;
  cefrRange: readonly string[];
  minimumMastery: number;
  requiredEvidence: readonly PedagogicalEvidence[];
  contentStatus: "available" | "planned_protected";
  sceneDifficulties: readonly ("beginner" | "intermediate" | "advanced")[];
}

export const PEDAGOGICAL_LEVEL_PASSAGE: Record<PedagogicalLevel, PedagogicalLevelContract> = {
  initial: {
    id: "initial",
    label: "Inicial",
    cefrRange: ["A1", "A2"],
    minimumMastery: 0.7,
    requiredEvidence: ["concept_recognition", "guided_practice", "short_response"],
    contentStatus: "available",
    sceneDifficulties: ["beginner"],
  },
  intermediate: {
    id: "intermediate",
    label: "Intermediário",
    cefrRange: ["B1", "B2"],
    minimumMastery: 0.78,
    requiredEvidence: ["guided_practice", "short_response", "contextual_correction"],
    contentStatus: "available",
    sceneDifficulties: ["beginner", "intermediate"],
  },
  advanced: {
    id: "advanced",
    label: "Avançado",
    cefrRange: ["C1", "C2"],
    minimumMastery: 0.86,
    requiredEvidence: ["contextual_correction", "independent_transfer", "domain_application"],
    contentStatus: "available",
    sceneDifficulties: ["beginner", "intermediate", "advanced"],
  },
  technological: {
    id: "technological",
    label: "Tecnológico de Alto Nível",
    cefrRange: ["C1", "C2"],
    minimumMastery: 0.9,
    requiredEvidence: ["independent_transfer", "domain_application"],
    contentStatus: "planned_protected",
    sceneDifficulties: ["beginner", "intermediate", "advanced"],
  },
};

export interface LevelPassageSnapshot {
  mastery: number;
  evidence: readonly PedagogicalEvidence[];
}

export function canPassPedagogicalLevel(level: PedagogicalLevel, snapshot: LevelPassageSnapshot): boolean {
  const contract = PEDAGOGICAL_LEVEL_PASSAGE[level];
  if (contract.contentStatus !== "available" || snapshot.mastery < contract.minimumMastery) {
    return false;
  }

  return contract.requiredEvidence.every((evidence) => snapshot.evidence.includes(evidence));
}
