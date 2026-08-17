import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sceneSource = readFileSync("client/src/pages/ImmersiveScene.tsx", "utf8");
const teacherResolverSource = readFileSync("client/src/lib/sceneTeacherResolver.ts", "utf8");

describe("permanent Tropical Beach scene contracts", () => {
  it("keeps the teacher portrait free from unapproved synthetic face overlays", () => {
    expect(sceneSource).toContain("const showSyntheticMouth = false;");
    expect(sceneSource).toContain("showSyntheticMouth && isSpeaking");
    expect(sceneSource).toContain("O retrato permanece sem boca sintética até haver mídia docente aprovada.");
  });

  it("keeps a single visible, persistent dialogue audio control", () => {
    expect(sceneSource).toContain("ref={dialogAudioElementRef}");
    expect(sceneSource).toContain("src={dialogAudioSource || undefined}");
    expect(sceneSource).toContain("controls={Boolean(dialogAudioSource)}");
    expect(sceneSource).toContain("const replayVisibleDialogAudio = useCallback");
    expect(sceneSource).toContain("Preparar voz de James");
    expect(sceneSource).toContain("▶ Ouvir James");
    expect(sceneSource).not.toContain('audio.removeAttribute("src")');
    expect((sceneSource.match(/A reprodução automática foi bloqueada/g) || [])).toHaveLength(1);
  });

  it("limits neural hotspot waits so an audible fallback can run promptly", () => {
    expect(sceneSource).toContain("setDlgFeedback(\"Preparando voz natural…\")");
    expect(sceneSource).toContain("ttsMut.mutateAsync({ text: text.slice(0, 500), voiceLang: lang, gender: teacherGender })");
    expect(sceneSource).toContain("googleTtsMut.mutateAsync({");
    expect((sceneSource.match(/6_000/g) || []).length).toBeGreaterThanOrEqual(2);
    expect(sceneSource).toContain("if (playLocalDialogFallback(text, lang, requestKey, selectedScene?.teacherGender))");
  });

  it("preserves James as the canonical Tropical Beach teacher and voice path", () => {
    expect(sceneSource).toContain('teacherName:"James", teacherLang:"en-US", langCode:"en", teacherGender:"male"');
    expect(teacherResolverSource).toContain('scene.teacherName.trim().toLowerCase() === "james"');
    expect(teacherResolverSource).toContain('return { teacher: null, materialIsInTargetLanguage: false, preserveScenePortrait: true };');
  });

  it("replaces indefinite protected-content loading with an actionable access state", () => {
    expect(sceneSource).toContain("const sceneMaterialRequiresLogin");
    expect(sceneSource).toContain("const sceneMaterialAccessFailed");
    expect(sceneSource).toContain("const sceneMaterialNeedsAccess");
    expect(sceneSource).toContain("const [sceneMaterialTimedOut");
    expect(sceneSource).toContain("window.setTimeout(() => setSceneMaterialTimedOut(true), 8000)");
    expect(sceneSource).toContain("const authorizeSceneLessonRef = useRef(authorizeLessonMut.mutateAsync);");
    expect(sceneSource).toContain("authorizeSceneLessonRef.current = authorizeLessonMut.mutateAsync;");
    expect(sceneSource).toContain("(lessonKey: string) => authorizeSceneLessonRef.current({ lessonKey })");
    expect(sceneSource).toContain("void authorizeSceneLesson(lessonKey)");
    expect(sceneSource).toContain("const sceneMaterialActionLabel");
    expect(sceneSource).toContain("Ative o acesso para iniciar esta cena.");
    expect(sceneSource).toContain("Atualizar cena");
  });

  it("keeps free questions in the scene with an immediate contextual fallback", () => {
    expect(sceneSource).toContain("const fallback = getFreeDialogQuestionReply(question, scene.hotspots);");
    expect(sceneSource).toContain("const line = activeSceneDialog[dlgStep];");
    expect(sceneSource).toContain("setDlgTutorHistory");
    expect(sceneSource).toContain('placeholder="Ex.: What is pool?"');
  });

  it("keeps James on a named male browser voice instead of substituting another gender", () => {
    expect(sceneSource).toContain("const maleVoicePattern");
    expect(sceneSource).toContain("if (gender && !preferredVoice) return false;");
    expect(sceneSource).toContain("if (preferredVoice) utterance.voice = preferredVoice;");
  });

  it("keeps the dialogue panel compact enough to preserve the scene", () => {
    expect(sceneSource).toContain('maxHeight: "min(43vh, 340px)"');
    expect(sceneSource).not.toContain("!immersionMode && dlgFeedback && (");
  });

  it("keeps the first dialogue and every scene object reachable by touch, click, and keyboard", () => {
    expect(sceneSource).toContain("const lastSceneGestureAtRef = useRef(0);");
    expect(sceneSource).toContain("const launchDialogFromGesture = useCallback");
    expect(sceneSource).toContain("onPointerUp={(e) => { e.stopPropagation(); launchDialogFromGesture(); }}");
    expect(sceneSource).toContain('aria-label={`Abrir vocabulário: ${hotspot.label}`}');
    expect(sceneSource).toContain("tabIndex={0}");
  });

  it("prepares James's neural audio without starting an automatic browser-blocked playback", () => {
    expect(sceneSource).toContain("options?: { autoPlay?: boolean }");
    expect(sceneSource).toContain("const autoPlay = options?.autoPlay ?? true;");
    expect(sceneSource).toContain("A voz está pronta. Toque em Ouvir James para reproduzir.");
    expect(sceneSource).toContain("{ autoPlay: false }");
    expect(sceneSource).toContain("Toque em Ouvir James para preparar e ouvir a voz natural.");
  });
});
