import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sceneSource = readFileSync("client/src/pages/ImmersiveScene.tsx", "utf8");

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
    expect(sceneSource).toContain("▶ Ouvir James");
    expect(sceneSource).not.toContain('audio.removeAttribute("src")');
    expect((sceneSource.match(/A reprodução automática foi bloqueada/g) || [])).toHaveLength(1);
  });

  it("keeps free questions in the scene with an immediate contextual fallback", () => {
    expect(sceneSource).toContain("const fallback = getFreeDialogQuestionReply(question, scene.hotspots);");
    expect(sceneSource).toContain("setDlgTutorHistory");
    expect(sceneSource).toContain('placeholder="Ex.: What is pool?"');
  });

  it("keeps the dialogue panel compact enough to preserve the scene", () => {
    expect(sceneSource).toContain('maxHeight: "min(43vh, 340px)"');
    expect(sceneSource).not.toContain("!immersionMode && dlgFeedback && (");
  });
});
