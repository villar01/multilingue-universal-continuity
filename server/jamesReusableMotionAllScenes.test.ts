import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const sceneSource = readFileSync(resolve(process.cwd(), "client/src/pages/ImmersiveScene.tsx"), "utf8");

describe("James reusable motion across immersive scenes", () => {
  it("keeps one neutral, silent visual asset gated by confirmed speaking", () => {
    expect(sceneSource).toContain('JAMES_NEUTRAL_MOTION_URL = "/manus-storage/james-neutral-reusable-motion-portrait-alpha_315ce2e1.webm"');
    expect(sceneSource).toMatch(/showNeutralJamesMotion\s+&&\s+isSpeaking\s+&&\s+\(!showPilotClip \|\| !pilotClipPlaybackConfirmed\)/);
    expect(sceneSource).toContain("muted");
    expect(sceneSource).toContain("overrideName=\"James\"");
    expect(sceneSource).toContain("overrideImage={JAMES_CANONICAL_PORTRAIT_URL}");
    expect(sceneSource).toContain("showNeutralJamesMotion");
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
