import { describe, expect, it } from "vitest";
import {
  EXTERNAL_GPU_ANIMATION_STATUS,
  selectTeacherPose,
  selectTeacherPoseAudioCue,
  selectTeacherMedia,
} from "../shared/teacherMediaStrategy";

describe("estratégia híbrida de mídia docente", () => {
  it("usa vídeo somente para frase roteirizada com ativo previamente aprovado", () => {
    const decision = selectTeacherMedia({
      kind: "scripted",
      hasApprovedPreGeneratedVideo: true,
      hasExactAudioVideoPair: true,
    });

    expect(decision.mode).toBe("pre_generated_video");
    expect(decision.lipMotion).toBe("audio_matched_video");
    expect(decision.requiresExternalGpu).toBe(false);
    expect(decision.requiresAdditionalConsent).toBe(false);
  });

  it("mantém respostas livres no áudio neural com retrato estável", () => {
    const decision = selectTeacherMedia({
      kind: "interactive",
      hasApprovedPreGeneratedVideo: true,
      hasExactAudioVideoPair: false,
    });

    expect(decision.mode).toBe("neural_audio_portrait");
    expect(decision.lipMotion).toBe("none");
    expect(decision.requiresExternalGpu).toBe(false);
  });

  it("não habilita GPU externa, cobrança ou envio de mídia nesta versão", () => {
    expect(EXTERNAL_GPU_ANIMATION_STATUS).toEqual({
      available: false,
      reason: "Serviço futuro: não configurado, não cobrado e sem envio de mídia de alunos.",
    });
  });

  it("define poses pedagógicas sem exigir GPU ou movimento labial", () => {
    const pose = selectTeacherPose("correct_answer");
    expect(pose).toMatchObject({
      id: "encouragement",
      label: "Incentivo",
      requiresNvidiaCuda: false,
      requiresLipSync: false,
    });
  });

  it("exige fala roteirizada para cada pose e preserva fallback de áudio existente", () => {
    const cue = selectTeacherPoseAudioCue("retry_answer");
    expect(cue).toMatchObject({
      audioRequired: true,
      audioIntent: "retry",
      pose: { id: "correction" },
      lipMotion: "none",
      lipMotionScope: "none",
      fallback: "neutral_pose_with_existing_scene_audio",
    });
  });

  it("mantém respostas livres sem movimento labial genérico", () => {
    const cue = selectTeacherPoseAudioCue("free_interaction");
    expect(cue.lipMotion).toBe("none");
    expect(cue.lipMotionScope).toBe("none");
  });

  it("restringe vídeo a pares exatos de fala e áudio, inclusive em falas roteirizadas", () => {
    const scriptedTriggers = ["scene_open", "object_focus", "correct_answer", "retry_answer", "scene_close"] as const;
    for (const trigger of scriptedTriggers) {
      const cue = selectTeacherPoseAudioCue(trigger);
      expect(cue.lipMotion).toBe("none");
      expect(cue.lipMotionScope).toBe("none");
      expect(cue.pose.requiresLipSync).toBe(false);
    }

    const genericScriptedDecision = selectTeacherMedia({ kind: "scripted", hasApprovedPreGeneratedVideo: true, hasExactAudioVideoPair: false });
    expect(genericScriptedDecision).toMatchObject({ mode: "neural_audio_portrait", lipMotion: "none" });

    const freeDecision = selectTeacherMedia({ kind: "interactive", hasApprovedPreGeneratedVideo: true, hasExactAudioVideoPair: false });
    expect(freeDecision).toMatchObject({ mode: "neural_audio_portrait", lipMotion: "none" });
  });
});
