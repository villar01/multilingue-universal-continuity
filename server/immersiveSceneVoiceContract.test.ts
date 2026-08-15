import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const sceneSource = fs.readFileSync(path.resolve(process.cwd(), "client/src/pages/ImmersiveScene.tsx"), "utf8");
const edgeSource = fs.readFileSync(path.resolve(process.cwd(), "server/edge-tts.ts"), "utf8");
const sceneData = sceneSource.split("export const IMMERSIVE_SCENES")[1]?.split("function TeacherAvatar")[0] ?? "";

describe("contrato regional de voz das cenas imersivas", () => {
  it("preserva Praia Tropical e James en-US masculino como referência de voz natural", () => {
    expect(sceneSource).toContain('sceneId: "beach"');
    expect(sceneSource).toContain('teacherName: "James"');
    expect(sceneSource).toContain('language: "en-US"');
    expect(sceneSource).toContain('gender: "male" as const');
  });

  it("exige locale e gênero explícitos em toda cena para selecionar uma voz neural regional", () => {
    const teacherEntries = sceneData.match(/teacherName:/g) ?? [];
    const voicedEntries = sceneData.match(/teacherName:"[^"]+", teacherLang:"[^"]+", langCode:"[^"]+", teacherGender:"(?:male|female)"/g) ?? [];
    expect(voicedEntries).toHaveLength(teacherEntries.length);
    expect(edgeSource).toContain("resolveVoice(voiceLang, gender)");
    expect(edgeSource).toContain("Nenhuma voz neural compatível está disponível");
  });
});
