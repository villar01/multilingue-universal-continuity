import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const sceneSource = readFileSync(resolve(process.cwd(), "client/src/pages/ImmersiveScene.tsx"), "utf8");

describe("James motion promotion in immersive scenes", () => {
  it("uses only the approved lateral clip after the audio player confirms playback", () => {
    expect(sceneSource).toContain("audio.onplaying = () => {");
    expect(sceneSource).toContain("const promotePendingJamesClipForSpokenText = useCallback");
    expect(sceneSource).toContain("pendingClip.dialogue !== spokenText");
    expect(sceneSource).toContain("promotePendingJamesClipForSpokenText(phrase);");
    expect(sceneSource).toContain("showPilotClip && activeClip?.videoUrl");
    expect(sceneSource).not.toContain("JAMES_NEUTRAL_MOTION_URL");
    expect(sceneSource).not.toContain("showNeutralJamesMotion");
    expect(sceneSource).toContain('overrideName={teachingScene?.teacherName === "James" ? "James" : undefined}');
    expect(sceneSource).toContain('overrideImage={teachingScene?.teacherName === "James" ? JAMES_CANONICAL_PORTRAIT_URL : undefined}');
  });

  it("preserves the no-synthetic-mouth contract while visual motion is active", () => {
    expect(sceneSource).toContain("const showSyntheticMouth = false;");
    expect(sceneSource).not.toContain('animation: "eye-blink');
    expect(sceneSource).not.toContain('animation: isSpeaking ? "brow-focus');
    expect(sceneSource).not.toContain('animation: "cheek-warmth');
    expect(sceneSource).toContain("onended = () => {");
    expect(sceneSource).toContain("setIsSpeaking(false);");
    expect(sceneSource).toContain("audio.onpause = () => {");
  });
});
