import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { JAMES_TROPICAL_PILOT_CLIPS } from "../shared/jamesTropicalPilotClips";
import { SOPHIE_CAFE_PILOT_CLIPS } from "../shared/sophieCafePilotClips";

const sceneSource = readFileSync("client/src/pages/ImmersiveScene.tsx", "utf8");

describe("congelamento das cenas de referência", () => {
  it("preserva os ativos aprovados, os docentes e os retratos originais de Praia Tropical e Café", () => {
    expect(JAMES_TROPICAL_PILOT_CLIPS).toHaveLength(7);
    expect(SOPHIE_CAFE_PILOT_CLIPS).toHaveLength(4);

    for (const clip of JAMES_TROPICAL_PILOT_CLIPS) {
      expect(clip).toMatchObject({
        sceneId: "beach",
        teacherName: "James",
        preserveOriginalPortrait: true,
        fallback: "original_portrait",
      });
      expect(clip.videoUrl).toMatch(/^\/manus-storage\/james-tropical-[a-z-]+_[a-f0-9]+\.mp4$/);
    }

    for (const clip of SOPHIE_CAFE_PILOT_CLIPS) {
      expect(clip).toMatchObject({
        sceneId: "cafe",
        teacherName: "Sophie",
        language: "fr-FR",
        preserveOriginalPortrait: true,
        fallback: "original_portrait",
      });
      expect(clip.videoUrl).toMatch(/^\/manus-storage\/sophie-cafe-[a-z-]+_[a-f0-9]+\.mp4$/);
    }

    expect(sceneSource).toContain('src={overrideImage || scene.teacherImage}');
    expect(sceneSource).toContain('const JAMES_CANONICAL_PORTRAIT_URL = "/manus-storage/prof_james_b9f2fff7.png"');
    expect(sceneSource).toContain('selectedScene?.id !== "beach" || selectedScene.teacherName !== "James"');
    expect(sceneSource).toContain('selectedScene?.id !== "cafe" || selectedScene.teacherName !== "Sophie"');
  });

  it("mantém movimento exclusivamente no ciclo real de áudio e bloqueia qualquer promoção cruzada de mídia", () => {
    expect(sceneSource).toContain("activeClip.sceneId === scene.id");
    expect(sceneSource).toContain("activeClip.teacherName === (overrideName || scene.teacherName)");
    expect(sceneSource).toContain("audio.onplaying = () => {");
    expect(sceneSource).toContain("utterance.onstart = () => {");
    expect(sceneSource).toContain("const showSyntheticMouth = false;");
  });
});
