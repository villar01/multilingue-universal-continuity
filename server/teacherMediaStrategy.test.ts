import { describe, expect, it } from "vitest";
import {
  EXTERNAL_GPU_ANIMATION_STATUS,
  selectTeacherMedia,
} from "../shared/teacherMediaStrategy";

describe("estratégia híbrida de mídia docente", () => {
  it("usa vídeo somente para frase roteirizada com ativo previamente aprovado", () => {
    const decision = selectTeacherMedia({
      kind: "scripted",
      hasApprovedPreGeneratedVideo: true,
    });

    expect(decision.mode).toBe("pre_generated_video");
    expect(decision.requiresExternalGpu).toBe(false);
    expect(decision.requiresAdditionalConsent).toBe(false);
  });

  it("mantém respostas livres no áudio neural com retrato estável", () => {
    const decision = selectTeacherMedia({
      kind: "interactive",
      hasApprovedPreGeneratedVideo: true,
    });

    expect(decision.mode).toBe("neural_audio_portrait");
    expect(decision.requiresExternalGpu).toBe(false);
  });

  it("não habilita GPU externa, cobrança ou envio de mídia nesta versão", () => {
    expect(EXTERNAL_GPU_ANIMATION_STATUS).toEqual({
      available: false,
      reason: "Serviço futuro: não configurado, não cobrado e sem envio de mídia de alunos.",
    });
  });
});
