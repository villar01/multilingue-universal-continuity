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

  it("sobrepõe a gravação lateral sem retirar a foto e a mantém somente durante a fala", () => {
    expect(sceneSource).toContain('src={overrideImage || scene.teacherImage}');
    expect(sceneSource).toContain("activeClip?: ScenePilotClip | null;");
    expect(sceneSource).toContain("{showPilotClip && activeClip?.videoUrl && (");
    expect(sceneSource).toContain("autoPlay");
    expect(sceneSource).toContain("muted={!activeClipHasExactAudioVideoPair}");
    expect(sceneSource).toContain("playsInline");
    expect(sceneSource).toContain("loop={!activeClipHasExactAudioVideoPair}");
    expect(sceneSource).toContain("if (activeClipHasExactAudioVideoPair) onExactClipEnded?.();");
    expect(sceneSource).toContain("if (activeClipHasExactAudioVideoPair) onExactClipFailed?.();");
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
    expect(sceneSource).toContain("const pendingJamesClipIdRef = useRef<JamesTropicalPilotClipId | null>(null);");
    expect(sceneSource).toContain("pendingJamesClipIdRef.current = clip.id;");
    expect(sceneSource).toContain("if (selectedScene?.id === \"beach\" && selectedScene.teacherName === \"James\" && pendingJamesClipIdRef.current) {");
    expect(sceneSource).toContain("setActiveJamesClipId(pendingJamesClipIdRef.current);");
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

  it("reinicia o clipe do objeto e anima sua frase de exemplo sem mudar o texto falado", () => {
    expect(sceneSource).toContain('onSpeak(hotspot.label, langCode, "object")');
    expect(sceneSource).toContain('(mode === "object" || mode === "example") && activeTeacherScene.teacherName === "James"');
    expect(sceneSource).toContain('sand: "james-tropical-point-sand"');
    expect(sceneSource).toContain('objectFocusClip?.dialogue ?? text');
    expect(sceneSource).toContain('onSpeak(hotspot.example, langCode, "example")');
    expect(sceneSource).toContain('mode === "object" ? objectFocusClip?.dialogue ?? text : text');
    expect(sceneSource).toContain('onSpeak(hotspot.examplePt, nativeLang, "translation")');
    expect(sceneSource).toContain("setActiveHotspot(null);");
    expect(sceneSource).toContain("setActiveJamesClipId(null);");
  });

  it("aciona o clipe de Ocean quando a pergunta escrita reconhece o objeto contextual", () => {
    expect(sceneSource).toContain('scene.id === "beach" && scene.teacherName === "James")');
    expect(sceneSource).toContain('ocean: "james-tropical-point-ocean"');
    expect(sceneSource).toContain('playJamesTropicalClip(objectClipId || "james-tropical-greeting");');
  });

  it("agenda o movimento de James, mas só o inicia no evento real de reprodução e o encerra com o áudio", () => {
    const sceneEntry = sceneSource.slice(sceneSource.indexOf("useEffect(() => {\n    if (!selectedScene) return;"), sceneSource.indexOf("const startDialog"));
    const dialogStart = sceneSource.slice(sceneSource.indexOf("const startDialog"), sceneSource.indexOf("useEffect(() => {", sceneSource.indexOf("const startDialog")));

    expect(sceneEntry).not.toContain('setActiveJamesClipId("james-tropical-greeting")');
    expect(dialogStart).toContain('playJamesTropicalClip("james-tropical-greeting")');
    expect(dialogStart).toContain("JAMES_TROPICAL_INTRO_FALLBACK_URL");
    expect(sceneSource).toContain('audio.onplaying = () => {');
    expect(sceneSource).toContain("audio.onpause = () => {");
    expect(sceneSource).toContain("setActiveJamesClipId(null);");
  });

  it("mantém a rota lateral previamente validada como backup ativo da apresentação", () => {
    const greeting = JAMES_TROPICAL_PILOT_CLIPS.find((clip) => clip.id === "james-tropical-greeting");
    const dialogStart = sceneSource.slice(sceneSource.indexOf("const startDialog"), sceneSource.indexOf("useEffect(() => {", sceneSource.indexOf("const startDialog")));
    expect(greeting?.videoUrl).toBe("/manus-storage/james-tropical-greeting_5f8622cb.mp4");
    expect(greeting?.audioVideoExactPair).not.toBe(true);
    expect(dialogStart).toContain('playJamesTropicalClip("james-tropical-greeting");');
    expect(dialogStart).toContain("JAMES_TROPICAL_INTRO_FALLBACK_URL");
    expect(dialogStart).toContain('"james-tropical-introduction"');
    expect(sceneSource).toContain("audio.onplaying = () => {");
    expect(sceneSource).toContain("setActiveJamesClipId(pendingJamesClipIdRef.current);");
  });
});
