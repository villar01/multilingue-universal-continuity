import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const avatar = readFileSync(new URL("../client/src/components/EnhancedTeacherAvatar.tsx", import.meta.url), "utf8");

describe("política visual por professor", () => {
  it("mantém a exceção estática de Ricardo sem desativar o áudio neural dos demais professores", () => {
    expect(avatar).toContain("allowsMouthAnimation");
    expect(avatar).toContain("ricardo");
    expect(avatar).toContain("if (!allowsMouthAnimation)");
    expect(avatar).toContain("AudioCtx && allowsMouthAnimation");
    expect(avatar).toContain("audio.play()");
  });

  it("não substitui retrato, nome ou canal de áudio ao desativar somente a boca", () => {
    expect(avatar).toContain("const imageUrl = photoUrl");
    expect(avatar).toContain("const teacherName = propTeacherName");
    expect(avatar).toContain("audioUrl");
  });
});
