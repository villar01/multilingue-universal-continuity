import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const avatar = readFileSync(new URL("../client/src/components/EnhancedTeacherAvatar.tsx", import.meta.url), "utf8");
const animatedTeacher = readFileSync(new URL("../client/src/components/AnimatedTeacher.tsx", import.meta.url), "utf8");

describe("política visual por professor", () => {
  it("mantém todos os avatares estáveis sem desativar o áudio neural", () => {
    expect(avatar).toContain("allowsMouthAnimation");
    expect(avatar).toContain("const allowsMouthAnimation = false;");
    expect(avatar).toContain("const supportsValidatedFacialSync = false;");
    expect(avatar).toContain("if (!allowsMouthAnimation)");
    expect(avatar).toContain("AudioCtx && allowsMouthAnimation");
    expect(avatar).toContain("audio.play()");
  });

  it("não substitui retrato, nome ou canal de áudio ao desativar somente a boca", () => {
    expect(avatar).toContain("const imageUrl = photoUrl");
    expect(avatar).toContain("const teacherName = propTeacherName");
    expect(avatar).toContain("audioUrl");
  });

  it("impede vídeo e visemas no fluxo AnimatedTeacher de Ricardo sem interromper seu áudio", () => {
    expect(animatedTeacher).toContain("allowsMouthAnimation");
    expect(animatedTeacher).toContain("if (!allowsMouthAnimation)");
    expect(animatedTeacher).toContain("if (allowsMouthAnimation)");
    expect(animatedTeacher).toContain("audio.play()");
    expect(animatedTeacher).toContain("setMouthOpen(0)");
  });
});
