import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const source = fs.readFileSync(path.resolve(process.cwd(), "client/src/pages/ImmersiveScene.tsx"), "utf8");
const catalogSource = fs.readFileSync(path.resolve(process.cwd(), "client/src/lib/immersiveScenesCatalog.ts"), "utf8");
const scenesStart = catalogSource.indexOf("export const IMMERSIVE_SCENES: Scene[] = [");
const scenesCatalog = catalogSource.slice(scenesStart);

describe("fluxo compartilhado das cenas imersivas", () => {
  it("mantém o catálogo de 29 cenas em uma única tela com uma única cadeia de pergunta, resposta e voz", () => {
    expect(scenesStart).toBeGreaterThan(-1);
    expect((scenesCatalog.match(/^\s*id:\s*"/gm) || [])).toHaveLength(29);
    expect((scenesCatalog.match(/^\s*teacherName:\s*"/gm) || [])).toHaveLength(29);
    expect((scenesCatalog.match(/^\s*teacherImage:\s*"/gm) || [])).toHaveLength(29);
    expect((source.match(/const askImmersiveTutor = useCallback/g) || [])).toHaveLength(1);
    expect((source.match(/const requestSpeechSafely = useCallback/g) || [])).toHaveLength(1);
    expect((source.match(/const playTeacherAudio = useCallback/g) || [])).toHaveLength(1);
  });

  it("prioriza a faixa Edge direta antes da alternativa remota e isola os dois fallbacks específicos de James", () => {
    const sharedSpeech = source.slice(source.indexOf("const speak = useCallback"), source.indexOf("const requestSpeechSafely = useCallback"));
    expect(sharedSpeech.indexOf("if (await playEdgeNeural()) return;")).toBeLessThan(sharedSpeech.indexOf("const googleAudio"));
    expect(sharedSpeech).toContain('audioBase64ToObjectUrl(edgeAudio.audioBase64, "audio/mpeg")');
    expect((sharedSpeech.match(/selectedScene\?\.id === "beach"/g) || [])).toHaveLength(2);
    expect(sharedSpeech).toContain("JAMES_TROPICAL_INTRO_FALLBACK_URL");
    expect(sharedSpeech).toContain("JAMES_TROPICAL_OBJECT_FALLBACKS");
  });

  it("renderiza o professor fora de cartões condicionais, para que permaneça presente em toda cena aberta", () => {
    expect(source).toContain("scene={teachingScene ?? selectedScene!}");
    expect(source).toContain("<TeacherAvatar");
    expect(source.indexOf("<TeacherAvatar")).toBeLessThan(source.indexOf("{/* ── Dialog Panel:"));
  });

  it("orienta o uso dos objetos em toda apresentação, mesmo quando a saudação original é breve", () => {
    expect(source).toContain("function getSceneObjectGuidancePt(scene: Scene): string");
    expect(source).toContain("/objetos?/i.test(greeting)");
    expect(source).toContain("Clique nos objetos para aprender.");
    expect(source).toContain("setGreetingText(getSceneObjectGuidancePt(selectedScene));");
  });
});
