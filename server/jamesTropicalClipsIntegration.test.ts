import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { JAMES_TROPICAL_PILOT_CLIPS } from "../shared/jamesTropicalPilotClips";

const sceneSource = readFileSync("client/src/pages/ImmersiveScene.tsx", "utf8");

describe("integração de clipes de James na Praia Tropical", () => {
  it("mantém os sete clipes publicados e associados somente a James na praia", () => {
    expect(JAMES_TROPICAL_PILOT_CLIPS).toHaveLength(7);
    expect(JAMES_TROPICAL_PILOT_CLIPS.every((clip) => (
      clip.sceneId === "beach"
      && clip.teacherName === "James"
      && clip.videoUrl?.startsWith("/manus-storage/james-tropical-")
      && clip.preserveOriginalPortrait
      && clip.fallback === "original_portrait"
    ))).toBe(true);
  });

  it("sobrepõe o vídeo sem retirar a foto e mantém saudação ou objeto visíveis até o aluno encerrar o contexto", () => {
    expect(sceneSource).toContain('src={overrideImage || scene.teacherImage}');
    expect(sceneSource).toContain("activeClip?: ScenePilotClip | null;");
    expect(sceneSource).toContain("{showPilotClip && activeClip?.videoUrl && (");
    expect(sceneSource).toContain("autoPlay");
    expect(sceneSource).toContain("muted");
    expect(sceneSource).toContain("playsInline");
    expect(sceneSource).toContain('loop={activeClip.trigger === "object_focus" || activeClip.trigger === "scene_open"}');
    expect(sceneSource).toContain('onEnded={activeClip.trigger === "object_focus" || activeClip.trigger === "scene_open" ? undefined : onClipFinished}');
    expect(sceneSource).toContain("onError={onClipFinished}");
    expect(sceneSource).toContain('pointerEvents: "none"');
    expect(sceneSource).toContain("zIndex: 2,");
  });

  it("cobre abertura, quatro objetos, acerto e nova tentativa sem criar outro controle de áudio", () => {
    const objectClipIds = JAMES_TROPICAL_PILOT_CLIPS
      .filter((clip) => clip.trigger === "object_focus")
      .map((clip) => clip.id);

    expect(objectClipIds).toEqual([
      "james-tropical-point-palm",
      "james-tropical-point-wave",
      "james-tropical-point-ocean",
      "james-tropical-point-sand",
    ]);
    expect(sceneSource).toContain('setActiveJamesClipId("james-tropical-greeting")');
    expect(sceneSource).toContain('const jamesObjectClipId = activeTeacherScene.teacherName === "James"');
    expect(sceneSource).toContain('playJamesTropicalClip(jamesObjectClipId)');
    expect(sceneSource).toContain('palm: "james-tropical-point-palm"');
    expect(sceneSource).toContain('wave: "james-tropical-point-wave"');
    expect(sceneSource).toContain('ocean: "james-tropical-point-ocean"');
    expect(sceneSource).toContain('sand: "james-tropical-point-sand"');
    expect(sceneSource).toContain('playJamesTropicalClip("james-tropical-praise")');
    expect(sceneSource).toContain('playJamesTropicalClip("james-tropical-retry")');
    expect(sceneSource).toContain('activeClip={activeJamesClip || activeSophieClip}');
    expect(sceneSource).toContain("ref={dialogAudioElementRef}");
    expect(sceneSource).toContain("const showSyntheticMouth = false;");
  });

  it("reinicia o clipe do objeto quando o aluno usa o botão explícito de pronúncia do cartão", () => {
    expect(sceneSource).toContain('onSpeak(hotspot.label, langCode, "object")');
    expect(sceneSource).toContain('mode === "object" && activeTeacherScene.teacherName === "James"');
    expect(sceneSource).toContain('sand: "james-tropical-point-sand"');
    expect(sceneSource).toContain('objectFocusClip?.dialogue ?? text');
    expect(sceneSource).toContain('onSpeak(hotspot.example, langCode, "example")');
    expect(sceneSource).toContain('onSpeak(hotspot.examplePt, nativeLang, "translation")');
    expect(sceneSource).toContain("setActiveHotspot(null);");
    expect(sceneSource).toContain("setActiveJamesClipId(null);");
  });

  it("aciona o clipe de Ocean quando a pergunta escrita reconhece o objeto contextual", () => {
    expect(sceneSource).toContain('scene.id === "beach" && scene.teacherName === "James" && fallback?.hotspotId');
    expect(sceneSource).toContain('ocean: "james-tropical-point-ocean"');
    expect(sceneSource).toContain("if (objectClipId) playJamesTropicalClip(objectClipId);");
  });
});
