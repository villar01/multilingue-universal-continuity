import { describe, expect, it } from "vitest";
import { getTeacherDisplayName } from "../client/src/lib/teacherNames";
import { readFileSync } from "node:fs";

const avatarSource = readFileSync(new URL("../client/src/components/EnhancedTeacherAvatar.tsx", import.meta.url), "utf8");

describe("perfis fotorrealistas e sincronia labial", () => {
  it("mantém Ricardo, Ingrid, Carlos e Jean vinculados às suas variantes regionais nativas", () => {
    expect(getTeacherDisplayName(1, "pt-BR")).toMatchObject({ name: "Professor Ricardo", voiceId: "pt-BR-Wavenet-B" });
    expect(getTeacherDisplayName(30001, "en-US")).toMatchObject({ name: "Teacher Ingrid", voiceId: "en-US-Wavenet-F" });
    expect(getTeacherDisplayName(90003, "es-ES")).toMatchObject({ name: "Profesor Carlos", voiceId: "es-ES-Wavenet-B" });
    expect(getTeacherDisplayName(90004, "fr-FR")).toMatchObject({ name: "Professeur Jean", voiceId: "fr-FR-Wavenet-B" });
  });

  it("usa o relógio do áudio neural como fonte de movimento e encerra a animação ao fim do MP3", () => {
    expect(avatarSource).toContain("const analyser = ctx.createAnalyser()");
    expect(avatarSource).toContain("analyser.getByteFrequencyData(buf)");
    expect(avatarSource).toContain("audio.onended = () => {");
    expect(avatarSource).toContain("cancelAnimationFrame(rafId)");
    expect(avatarSource).toContain("setIsSpeaking(false)");
  });
});
