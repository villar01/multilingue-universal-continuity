import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "client/src/pages/ImmersiveScene.tsx"), "utf8");

describe("ajuda nativa da cena imersiva", () => {
  it("preserva o perfil masculino de James na síntese da ajuda em português", () => {
    expect(source).toContain('const helpGender = selectedScene?.teacherGender === "male" ? "MALE" : "FEMALE";');
    expect(source).toContain("gender: helpGender");
  });
});
