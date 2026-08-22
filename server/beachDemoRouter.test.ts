import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { DEMO_BEACH_MAX_INTERACTIONS } from "./beach-demo-router";

describe("amostra pública da Praia Tropical", () => {
  it("limita a amostra a três interações e preserva James com voz masculina en-US", () => {
    const source = readFileSync(resolve(process.cwd(), "server/beach-demo-router.ts"), "utf8");
    expect(DEMO_BEACH_MAX_INTERACTIONS).toBe(3);
    expect(source).toContain('teacherName: "James"');
    expect(source).toContain('teacherVoiceLanguage: "en-US"');
    expect(source).toContain('teacherVoiceGender: "male"');
    expect(source).not.toContain("SECURE_SCENE_SEEDS");
  });

  it("mantém o retrato estável e não carrega transformação visual do professor", () => {
    const page = readFileSync(resolve(process.cwd(), "client/src/pages/BeachDemo.tsx"), "utf8");
    expect(page).toContain('gender: "male"');
    expect(page).toContain("maxInteractions");
    expect(page).toContain("Amostra concluída");
    expect(page).not.toMatch(/teacherImage[^\n]*transform|animation:/i);
  });
});
