import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sceneSource = readFileSync("client/src/pages/ImmersiveScene.tsx", "utf8");
const sceneCatalogSource = readFileSync("client/src/lib/immersiveScenesCatalog.ts", "utf8");
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
    expect(sceneSource).toContain("controls={false}");
    expect(sceneSource).toContain("const replayVisibleDialogAudio = useCallback");
    expect(sceneSource).toContain("▶ Ouvir James");
    expect(sceneSource).not.toContain('audio.removeAttribute("src")');
    expect(sceneSource).toContain("Voz de James pronta. Toque em Ouvir James para iniciar.");
    expect((sceneSource.match(/A reprodução automática foi bloqueada/g) || [])).toHaveLength(0);
  });

  it("limits neural hotspot waits so an audible fallback can run promptly", () => {
    expect(sceneSource).toContain("setDlgAudioNotice(\"Preparando voz natural…\")");
    expect(sceneSource).toContain("ttsMut.mutateAsync({ text: text.slice(0, 500), voiceLang: lang, gender: teacherGender })");
    expect(sceneSource).toContain("googleTtsMut.mutateAsync({");
    expect((sceneSource.match(/6_000/g) || []).length).toBeGreaterThanOrEqual(2);
    expect(sceneSource).toContain("if (playLocalDialogFallback(text, lang, requestKey, selectedScene?.teacherGender))");
  });

  it("preserves James as the canonical Tropical Beach teacher and voice path", () => {
    expect(sceneCatalogSource).toMatch(/id: "beach"[^}]*teacherName: "James"[^}]*teacherLang: "en-US"[^}]*teacherGender: "male"/);
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

  it("exibe uma resposta imediatamente e tenta a voz somente após o envio escrito", () => {
    expect(sceneSource).toContain("const immediateFeedback =");
    expect(sceneSource).toContain("setDlgFeedback(immediateFeedback);");
    expect(sceneSource).toContain('requestSpeechSafely(immediateReply.replace(/^[^:]+:\\s*/, ""), scene.teacherLang, scene.teacherGender, "teacher", true);');
    expect(sceneSource).toContain('role="status" aria-live="polite"');
    expect(sceneSource).toContain("if (fallback?.immediate) {");
  });

  it("separa pergunta livre do avanço automático das alternativas roteirizadas", () => {
    expect(sceneSource).toContain("if (!line.options || line.correctIndex === undefined) {");
    expect(sceneSource).toContain("void askImmersiveTutor(provided);");
    expect(sceneSource).toContain("return;");
    expect(sceneSource).toContain("window.setTimeout(() => dlgNext(), 1400);");
  });

  it("keeps James on a named male browser voice instead of substituting another gender", () => {
    expect(sceneSource).toContain("const maleVoicePattern");
    expect(sceneSource).toContain("if (gender && !preferredVoice) return false;");
    expect(sceneSource).toContain("if (preferredVoice) utterance.voice = preferredVoice;");
  });

  it("keeps the dialogue panel compact enough to preserve the scene", () => {
    expect(sceneSource).toContain('maxHeight: dlgExpanded ? "min(43vh, 340px)" : "none"');
    expect(sceneSource).toContain('width: dlgExpanded ? "min(72vw, 860px)" : "min(92vw, 390px)"');
    expect(sceneSource).toContain('aria-expanded={dlgExpanded}');
    expect(sceneSource).not.toContain("!immersionMode && dlgFeedback && (");
  });
});
