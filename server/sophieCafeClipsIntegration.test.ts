import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { SOPHIE_CAFE_PILOT_CLIPS } from "../shared/sophieCafePilotClips";

const sceneSource = readFileSync("client/src/pages/ImmersiveScene.tsx", "utf8");

describe("integração dos clipes de Sophie na Cena do Café", () => {
  it("preserva o contrato publicado dos quatro clipes e o fallback do retrato", () => {
    expect(SOPHIE_CAFE_PILOT_CLIPS).toHaveLength(4);
    expect(SOPHIE_CAFE_PILOT_CLIPS.map((clip) => clip.id)).toEqual([
      "sophie-cafe-greeting",
      "sophie-cafe-point-croissant",
      "sophie-cafe-praise",
      "sophie-cafe-retry",
    ]);

    for (const clip of SOPHIE_CAFE_PILOT_CLIPS) {
      expect(clip.sceneId).toBe("cafe");
      expect(clip.teacherName).toBe("Sophie");
      expect(clip.language).toBe("fr-FR");
      expect(clip.videoUrl).toMatch(/^\/manus-storage\/sophie-cafe-[a-z-]+_[a-f0-9]+\.mp4$/);
      expect(clip.preserveOriginalPortrait).toBe(true);
      expect(clip.fallback).toBe("original_portrait");
    }
  });

  it("sobrepõe movimento sem remover a foto e o encerra pelo mesmo ciclo de áudio", () => {
    expect(sceneSource).toContain("type ScenePilotClip = JamesTropicalPilotClip | SophieCafePilotClip;");
    expect(sceneSource).toContain("src={overrideImage || scene.teacherImage}");
    expect(sceneSource).toContain("activeClip?: ScenePilotClip | null;");
    expect(sceneSource).toContain("autoPlay");
    expect(sceneSource).toContain("muted={!activeClipHasExactAudioVideoPair}");
    expect(sceneSource).toContain("playsInline");
    expect(sceneSource).toContain("else onClipFinished?.();");
    expect(sceneSource).toContain('pointerEvents: "none"');
    expect(sceneSource).toContain("const showSyntheticMouth = false;");
    expect(sceneSource).toContain("activeClip={activeJamesClip || activeSophieClip}");
    expect(sceneSource).toContain("setActiveSophieClipId(null);");
  });

  it("associa somente os gatilhos do Café à saudação, croissant, acerto e nova tentativa", () => {
    expect(sceneSource).toContain("const pendingSophieClipIdRef = useRef<SophieCafePilotClipId | null>(null);");
    expect(sceneSource).toContain("pendingSophieClipIdRef.current = clip.id;");
    expect(sceneSource).toContain("setActiveSophieClipId(pendingSophieClipIdRef.current);");
    expect(sceneSource).toContain('playSophieCafeClip("sophie-cafe-greeting")');
    expect(sceneSource).toContain('hotspot.id === "croissant"');
    expect(sceneSource).toContain('playSophieCafeClip("sophie-cafe-point-croissant")');
    expect(sceneSource).toContain('playSophieCafeClip("sophie-cafe-praise")');
    expect(sceneSource).toContain('playSophieCafeClip("sophie-cafe-retry")');
    expect(sceneSource).toContain('selectedScene?.id !== "cafe" || selectedScene.teacherName !== "Sophie"');
    expect(sceneSource).toContain("ref={dialogAudioElementRef}");
  });
});
