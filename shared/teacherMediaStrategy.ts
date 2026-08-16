/**
 * Contrato de seleção de mídia docente.
 *
 * Este módulo não chama serviços externos, não inicia GPU, não cria cobrança e
 * não envia texto, voz ou imagem de alunos. Ele define a ordem futura de
 * preferência para que frases roteirizadas usem vídeo pronto somente quando
 * houver um ativo validado; respostas livres continuam no canal de áudio.
 */
export type TeacherMediaMode = "pre_generated_video" | "neural_audio_portrait";
export type TeacherMediaRequestKind = "scripted" | "interactive";
export type TeacherLipMotionMode = "none" | "rhythmic_non_phonetic";
export type TeacherPoseId = "neutral" | "greeting" | "pointing" | "encouragement" | "correction" | "closing";
export type TeacherPoseTrigger = "scene_open" | "object_focus" | "correct_answer" | "retry_answer" | "scene_close" | "free_interaction";

export interface TeacherMediaRequest {
  kind: TeacherMediaRequestKind;
  hasApprovedPreGeneratedVideo: boolean;
}

export interface TeacherMediaDecision {
  mode: TeacherMediaMode;
  lipMotion: TeacherLipMotionMode;
  requiresExternalGpu: false;
  requiresAdditionalConsent: false;
  reason: string;
}

export interface TeacherPoseSpecification {
  id: TeacherPoseId;
  trigger: TeacherPoseTrigger;
  label: string;
  requiresNvidiaCuda: false;
  requiresLipSync: false;
}

export interface TeacherPoseAudioCue {
  trigger: TeacherPoseTrigger;
  pose: TeacherPoseSpecification;
  audioRequired: true;
  audioIntent: "greeting" | "object_word" | "praise" | "retry" | "closing" | "free_response";
  lipMotion: TeacherLipMotionMode;
  lipMotionScope: "pre_generated_scripted_clip_only" | "none";
  fallback: "neutral_pose_with_existing_scene_audio";
}

const POSE_BY_TRIGGER: Record<TeacherPoseTrigger, TeacherPoseSpecification> = {
  scene_open: { id: "greeting", trigger: "scene_open", label: "Saudação", requiresNvidiaCuda: false, requiresLipSync: false },
  object_focus: { id: "pointing", trigger: "object_focus", label: "Apontar objeto", requiresNvidiaCuda: false, requiresLipSync: false },
  correct_answer: { id: "encouragement", trigger: "correct_answer", label: "Incentivo", requiresNvidiaCuda: false, requiresLipSync: false },
  retry_answer: { id: "correction", trigger: "retry_answer", label: "Correção calma", requiresNvidiaCuda: false, requiresLipSync: false },
  scene_close: { id: "closing", trigger: "scene_close", label: "Encerramento", requiresNvidiaCuda: false, requiresLipSync: false },
  free_interaction: { id: "neutral", trigger: "free_interaction", label: "Pose neutra", requiresNvidiaCuda: false, requiresLipSync: false },
};

export function selectTeacherPose(trigger: TeacherPoseTrigger): TeacherPoseSpecification {
  return POSE_BY_TRIGGER[trigger];
}

const AUDIO_INTENT_BY_TRIGGER: Record<TeacherPoseTrigger, TeacherPoseAudioCue["audioIntent"]> = {
  scene_open: "greeting",
  object_focus: "object_word",
  correct_answer: "praise",
  retry_answer: "retry",
  scene_close: "closing",
  free_interaction: "free_response",
};

export function selectTeacherPoseAudioCue(trigger: TeacherPoseTrigger): TeacherPoseAudioCue {
  const isScriptedClip = trigger !== "free_interaction";
  return {
    trigger,
    pose: selectTeacherPose(trigger),
    audioRequired: true,
    audioIntent: AUDIO_INTENT_BY_TRIGGER[trigger],
    lipMotion: isScriptedClip ? "rhythmic_non_phonetic" : "none",
    lipMotionScope: isScriptedClip ? "pre_generated_scripted_clip_only" : "none",
    fallback: "neutral_pose_with_existing_scene_audio",
  };
}

export function selectTeacherMedia(request: TeacherMediaRequest): TeacherMediaDecision {
  if (request.kind === "scripted" && request.hasApprovedPreGeneratedVideo) {
    return {
      mode: "pre_generated_video",
      lipMotion: "rhythmic_non_phonetic",
      requiresExternalGpu: false,
      requiresAdditionalConsent: false,
      reason: "Vídeo pedagógico previamente aprovado disponível para frase roteirizada; a pose é selecionada pela ação da cena.",
    };
  }

  return {
    mode: "neural_audio_portrait",
    lipMotion: "none",
    requiresExternalGpu: false,
    requiresAdditionalConsent: false,
    reason: "Resposta dinâmica ou sem vídeo aprovado: usar áudio neural com pose neutra, sem sincronização labial declarada.",
  };
}

/**
 * A GPU externa permanece deliberadamente indisponível nesta versão. Só poderá
 * ser habilitada depois de consentimento específico, avaliação de fornecedor,
 * limite de custo, regras de retenção e validação visual/auditiva separadas.
 */
export const EXTERNAL_GPU_ANIMATION_STATUS = {
  available: false,
  reason: "Serviço futuro: não configurado, não cobrado e sem envio de mídia de alunos.",
} as const;
