import { describe, expect, it } from "vitest";
import {
  IMMERSIVE_VIDEO_DELIVERY_CONTRACT,
  IMMERSIVE_VIDEO_SEGMENTS,
  buildImmersiveVideoAssetKey,
  canPlayPreGeneratedVideo,
} from "../shared/immersiveSceneVideoCatalog";

describe("catálogo de vídeo pré-gerado para cenas imersivas", () => {
  it("padroniza quatro pontos pedagógicos reutilizáveis para qualquer cena", () => {
    expect(IMMERSIVE_VIDEO_SEGMENTS).toEqual([
      "opening",
      "focus_vocabulary",
      "repeat_instruction",
      "closing",
    ]);
  });

  it("exige texto e aprovação antes de reproduzir qualquer vídeo", () => {
    expect(canPlayPreGeneratedVideo({
      sceneId: "beach",
      teacherId: "james",
      locale: "en-US",
      segment: "opening",
      expectedText: "Hello! My name is James.",
      status: "approved",
    })).toBe(true);

    expect(canPlayPreGeneratedVideo({
      sceneId: "beach",
      teacherId: "james",
      locale: "en-US",
      segment: "opening",
      expectedText: "Hello! My name is James.",
      status: "review",
    })).toBe(false);
  });

  it("mantém respostas dinâmicas fora do vídeo pré-gerado e sem GPU por reprodução", () => {
    expect(buildImmersiveVideoAssetKey({
      sceneId: "Praia Tropical",
      teacherId: "James",
      locale: "en-US",
      segment: "repeat_instruction",
      expectedText: "Can you repeat?",
    })).toBe("immersive/praia-tropical/james/en-us/repeat_instruction");
    expect(IMMERSIVE_VIDEO_DELIVERY_CONTRACT.dynamicFallback).toBe("neural_audio_portrait");
    expect(IMMERSIVE_VIDEO_DELIVERY_CONTRACT.externalGpuPerPlay).toBe(false);
    expect(IMMERSIVE_VIDEO_DELIVERY_CONTRACT.billingEnabled).toBe(false);
  });
});
