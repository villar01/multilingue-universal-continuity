/**
 * Contrato de seleção de mídia docente.
 *
 * Este módulo não chama serviços externos, não inicia GPU, não cria cobrança e
 * não envia texto, voz ou imagem de alunos. Ele define a ordem futura de
 * preferência para que frases roteirizadas usem vídeo pronto somente quando
 * houver um ativo validado; respostas livres continuam no canal de áudio.
 */
export type TeacherMediaMode = "pre_generated_video" | "audio_timed_motion_video" | "neural_audio_portrait";
export type TeacherMediaRequestKind = "scripted" | "interactive";
export type TeacherLipMotionMode = "none" | "audio_matched_video" | "audio_timed_nonphonetic_video";
export type TeacherPoseId = "neutral" | "greeting" | "pointing" | "encouragement" | "correction" | "closing";
export type TeacherPoseTrigger = "scene_open" | "object_focus" | "correct_answer" | "retry_answer" | "scene_close" | "free_interaction";

export interface TeacherMediaRequest {
  kind: TeacherMediaRequestKind;
  hasApprovedPreGeneratedVideo: boolean;
  /** Only true when the visible video was produced for the exact spoken audio. */
  hasExactAudioVideoPair: boolean;
  /** A previously approved movement recording that is permitted only while the same audio is playing. */
  hasAudioTimedMotionVideo?: boolean;
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
  lipMotionScope: "exact_audio_video_pair_only" | "none";
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
    lipMotion: "none",
    lipMotionScope: "none",
    fallback: "neutral_pose_with_existing_scene_audio",
  };
}

export function selectTeacherMedia(request: TeacherMediaRequest): TeacherMediaDecision {
  if (request.kind === "scripted" && request.hasApprovedPreGeneratedVideo && request.hasExactAudioVideoPair) {
    return {
      mode: "pre_generated_video",
      lipMotion: "audio_matched_video",
      requiresExternalGpu: false,
      requiresAdditionalConsent: false,
      reason: "Vídeo produzido para a mesma frase e áudio roteirizados; a reprodução visual pode acompanhar a fala correspondente.",
    };
  }

  if (request.kind === "scripted" && request.hasApprovedPreGeneratedVideo && request.hasAudioTimedMotionVideo) {
    return {
      mode: "audio_timed_motion_video",
      lipMotion: "audio_timed_nonphonetic_video",
      requiresExternalGpu: false,
      requiresAdditionalConsent: false,
      reason: "Gravação lateral aprovada: ela só aparece entre o início e o fim do mesmo áudio, sem alegar sincronia fonética.",
    };
  }

  return {
    mode: "neural_audio_portrait",
    lipMotion: "none",
    requiresExternalGpu: false,
    requiresAdditionalConsent: false,
    reason: "Resposta dinâmica ou sem par exato áudio–vídeo: usar áudio com retrato estável, sem sincronização labial declarada.",
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
