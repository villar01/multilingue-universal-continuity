export type VisualExperienceModeId = "standard" | "local_gpu_advanced";

export interface VisualExperienceMode {
  id: VisualExperienceModeId;
  label: string;
  requiresExplicitOptIn: boolean;
  requiresLocalCompanion: boolean;
  requiresNvidiaCuda: boolean;
  usesRemoteGpu: boolean;
  fallbackMode: VisualExperienceModeId | null;
  availableVisuals: readonly string[];
  prohibitedBehaviors: readonly string[];
}

export interface TeacherVisualLayer {
  id: "pre_generated_poses" | "future_dynamic_lip_sync";
  requiresNvidiaCuda: boolean;
  purpose: string;
  fallback: string;
}

export const TEACHER_VISUAL_LAYERS: readonly TeacherVisualLayer[] = [
  {
    id: "pre_generated_poses",
    requiresNvidiaCuda: false,
    purpose: "Saudação, apontar objetos, incentivo, correção e encerramento por clipes curtos de poses autorizadas.",
    fallback: "Exibir o retrato neutro da mesma cena quando o clipe não estiver disponível.",
  },
  {
    id: "future_dynamic_lip_sync",
    requiresNvidiaCuda: true,
    purpose: "Movimento facial futuro orientado pelo áudio para falas novas e dinâmicas, somente após validação de qualidade.",
    fallback: "Manter pose pré-gerada ou retrato neutro sem simular sincronização labial.",
  },
];

export const VISUAL_EXPERIENCE_MODES: Record<VisualExperienceModeId, VisualExperienceMode> = {
  standard: {
    id: "standard",
    label: "Experiência padrão",
    requiresExplicitOptIn: false,
    requiresLocalCompanion: false,
    requiresNvidiaCuda: false,
    usesRemoteGpu: false,
    fallbackMode: null,
    availableVisuals: [
      "Professor sempre visível na cena",
      "Retrato neutro e movimentos pedagógicos por poses ou clipes pré-gerados quando disponíveis",
      "Áudio, texto, hotspots, exercícios e Consulta Rápida",
    ],
    prohibitedBehaviors: [
      "Não acessa o computador do aluno",
      "Não instala software",
      "Não gera animação facial dinâmica localmente",
    ],
  },
  local_gpu_advanced: {
    id: "local_gpu_advanced",
    label: "Modo visual avançado local",
    requiresExplicitOptIn: true,
    requiresLocalCompanion: true,
    requiresNvidiaCuda: true,
    usesRemoteGpu: false,
    fallbackMode: "standard",
    availableVisuals: [
      "Tudo da experiência padrão",
      "Elegibilidade futura para movimento facial local baseado em áudio, preservando poses pré-geradas",
      "Elegibilidade futura para reações visuais dinâmicas com qualidade validada",
    ],
    prohibitedBehaviors: [
      "Não é ativado apenas pela presença de GPU",
      "Não abre portas públicas no notebook",
      "Não envia imagem, áudio ou arquivos pessoais sem autorização específica",
      "Não substitui a experiência padrão quando o componente local falha",
    ],
  },
};

export function resolveVisualExperienceMode(input: {
  localCompanionApproved: boolean;
  nvidiaCudaAvailable: boolean;
  localCompanionReachable: boolean;
}): VisualExperienceMode {
  const canUseAdvanced = input.localCompanionApproved
    && input.nvidiaCudaAvailable
    && input.localCompanionReachable;
  return VISUAL_EXPERIENCE_MODES[canUseAdvanced ? "local_gpu_advanced" : "standard"];
}
