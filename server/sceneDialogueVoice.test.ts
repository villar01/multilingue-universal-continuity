import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const routerSource = fs.readFileSync(path.resolve(process.cwd(), "server/routers.ts"), "utf8");

describe("voz neural pública de diálogo roteirizado", () => {
  it("usa Edge TTS com idioma, gênero e limite curto de texto", () => {
    expect(routerSource).toContain("sceneDialogueVoice: router({");
    expect(routerSource).toContain("text: z.string().trim().min(1).max(500)");
    expect(routerSource).toContain("const audio = await synthesizeEdgeTTS(input.text, input.language, undefined, input.gender);");
    expect(routerSource).toContain("if (!audio.audioBase64.trim())");
    expect(routerSource).toContain("Voz neural da cena indisponível.");
  });
});
