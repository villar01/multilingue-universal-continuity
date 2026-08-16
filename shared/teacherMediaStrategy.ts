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

export interface TeacherMediaRequest {
  kind: TeacherMediaRequestKind;
  hasApprovedPreGeneratedVideo: boolean;
}

export interface TeacherMediaDecision {
  mode: TeacherMediaMode;
  requiresExternalGpu: false;
  requiresAdditionalConsent: false;
  reason: string;
}

export function selectTeacherMedia(request: TeacherMediaRequest): TeacherMediaDecision {
  if (request.kind === "scripted" && request.hasApprovedPreGeneratedVideo) {
    return {
      mode: "pre_generated_video",
      requiresExternalGpu: false,
      requiresAdditionalConsent: false,
      reason: "Vídeo pedagógico previamente aprovado disponível para frase roteirizada.",
    };
  }

  return {
    mode: "neural_audio_portrait",
    requiresExternalGpu: false,
    requiresAdditionalConsent: false,
    reason: "Resposta dinâmica ou sem vídeo aprovado: usar somente áudio neural com retrato estável.",
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
