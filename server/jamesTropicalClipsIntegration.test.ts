import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { JAMES_TROPICAL_PILOT_CLIPS } from "../shared/jamesTropicalPilotClips";

const sceneSource = readFileSync("client/src/pages/ImmersiveScene.tsx", "utf8");

describe("integração de clipes de James na Praia Tropical", () => {
  it("mantém os quatro clipes publicados e associados somente a James na praia", () => {
    expect(JAMES_TROPICAL_PILOT_CLIPS).toHaveLength(4);
    expect(JAMES_TROPICAL_PILOT_CLIPS.every((clip) => (
      clip.sceneId === "beach"
      && clip.teacherName === "James"
      && clip.videoUrl?.startsWith("/manus-storage/james-tropical-")
      && clip.preserveOriginalPortrait
      && clip.fallback === "original_portrait"
    ))).toBe(true);
  });

  it("sobrepõe o vídeo sem retirar a foto e retorna a ela quando a mídia termina ou falha", () => {
    expect(sceneSource).toContain('src={overrideImage || scene.teacherImage}');
    expect(sceneSource).toContain("activeClip?: JamesTropicalPilotClip | null;");
    expect(sceneSource).toContain("{showPilotClip && activeClip?.videoUrl && (");
    expect(sceneSource).toContain("autoPlay");
    expect(sceneSource).toContain("muted");
    expect(sceneSource).toContain("playsInline");
    expect(sceneSource).toContain("onEnded={onClipFinished}");
    expect(sceneSource).toContain("onError={onClipFinished}");
    expect(sceneSource).toContain('pointerEvents: "none"');
  });

  it("cobre abertura, palmeira, acerto e nova tentativa sem criar outro controle de áudio", () => {
    expect(sceneSource).toContain('setActiveJamesClipId("james-tropical-greeting")');
    expect(sceneSource).toContain('hotspot.id === "palm" ? playJamesTropicalClip("james-tropical-point-palm")');
    expect(sceneSource).toContain('playJamesTropicalClip("james-tropical-praise")');
    expect(sceneSource).toContain('playJamesTropicalClip("james-tropical-retry")');
    expect(sceneSource).toContain('activeClip={activeJamesClip}');
    expect(sceneSource).toContain("ref={dialogAudioElementRef}");
    expect(sceneSource).toContain("const showSyntheticMouth = false;");
  });
});
