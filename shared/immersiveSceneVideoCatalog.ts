/**
 * Contrato de ativos pré-gerados para cenas imersivas.
 *
 * Não contém URLs, vídeos ou chamadas de serviço. Um ativo só pode ser usado
 * quando for produzido originalmente, aprovado e associado ao texto exato.
 */
export const IMMERSIVE_VIDEO_SEGMENTS = [
  "opening",
  "focus_vocabulary",
  "repeat_instruction",
  "closing",
] as const;

export type ImmersiveVideoSegment = (typeof IMMERSIVE_VIDEO_SEGMENTS)[number];
export type PreGeneratedVideoStatus = "missing" | "review" | "approved";

export interface ImmersiveVideoAssetRequest {
  sceneId: string;
  teacherId: string;
  locale: string;
  segment: ImmersiveVideoSegment;
  expectedText: string;
  status: PreGeneratedVideoStatus;
}

export function buildImmersiveVideoAssetKey(request: Omit<ImmersiveVideoAssetRequest, "status">): string {
  const normalise = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return [
    "immersive",
    normalise(request.sceneId),
    normalise(request.teacherId),
    normalise(request.locale),
    request.segment,
  ].join("/");
}

export function canPlayPreGeneratedVideo(request: ImmersiveVideoAssetRequest): boolean {
  return request.status === "approved" && request.expectedText.trim().length > 0;
}

export const IMMERSIVE_VIDEO_DELIVERY_CONTRACT = {
  primaryFormat: "MP4/H.264 with captions and poster",
  maximumClipSeconds: 8,
  loadingStrategy: "load metadata only; fetch the clip after the learner selects the matching scripted line",
  dynamicFallback: "neural_audio_portrait",
  externalGpuPerPlay: false,
  billingEnabled: false,
} as const;
