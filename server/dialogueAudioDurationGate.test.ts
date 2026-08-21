import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "client/src/pages/ImmersiveScene.tsx"), "utf8");

describe("porta de duração do player de diálogo", () => {
  it("não expõe uma fonte ao player antes de confirmar duração reproduzível", () => {
    const playerSetup = source.slice(source.indexOf("const playTeacherAudio"), source.indexOf("const replayVisibleDialogAudio"));
    expect(playerSetup).toContain("setDialogAudioSource(null);");
    expect(playerSetup).toContain("if (audio.src === source) {");
    expect(playerSetup).toContain("setDialogAudioSource(source);");
    expect(playerSetup).toContain("if (!hasPlayableDuration()) return false;");
  });
});
