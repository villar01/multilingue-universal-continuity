import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "client/src/pages/ImmersiveScene.tsx"), "utf8");

describe("controle visível de áudio preparado", () => {
  it("mantém volume e repetição acessíveis logo que existe uma fonte de diálogo", () => {
    expect(source).toContain("controls={Boolean(dialogAudioSource)}");
    expect(source).toContain('className={dialogAudioSource');
    expect(source).not.toContain("controls={Boolean(dialogAudioSource && (dlgOpen || dialogAudioNeedsGesture))}");
  });
});
