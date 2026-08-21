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
    expect((scenesCatalog.match(/\bid:\s*"/g) || [])).toHaveLength(29);
    expect((scenesCatalog.match(/\bteacherName:\s*"/g) || [])).toHaveLength(29);
    expect((scenesCatalog.match(/\bteacherImage:\s*"/g) || [])).toHaveLength(29);
    expect((source.match(/const askImmersiveTutor = useCallback/g) || [])).toHaveLength(1);
    expect((source.match(/const requestSpeechSafely = useCallback/g) || [])).toHaveLength(1);
    expect((source.match(/const playTeacherAudio = useCallback/g) || [])).toHaveLength(1);
  });

  it("prioriza a faixa Edge direta antes da alternativa remota e isola os dois fallbacks específicos de James", () => {
    const sharedSpeech = source.slice(source.indexOf("const speak = useCallback"), source.indexOf("const requestSpeechSafely = useCallback"));
    expect(sharedSpeech.indexOf("if (await playEdgeNeural()) return;")).toBeLessThan(sharedSpeech.indexOf("const googleAudio"));
    expect(sharedSpeech).toContain('audioBase64ToObjectUrl(edgeAudio.audioBase64, "audio/mpeg")');
    expect((sharedSpeech.match(/teachingScene\?\.id === "beach"/g) || [])).toHaveLength(2);
    expect(sharedSpeech).toContain("JAMES_TROPICAL_INTRO_FALLBACK_URL");
    expect(sharedSpeech).toContain("JAMES_TROPICAL_OBJECT_FALLBACKS");
  });

  it("renderiza o professor fora de cartões condicionais, para que permaneça presente em toda cena aberta", () => {
    expect(source).toContain("scene={teachingScene ?? selectedScene!}");
    expect(source).toContain("<TeacherAvatar");
    expect(source.indexOf("<TeacherAvatar")).toBeLessThan(source.indexOf("{/* ── Dialog Panel:"));
  });

  it("orienta a ativação de acesso aos objetos sem manter fala curricular no catálogo público", () => {
    expect(source).toContain("function getSceneObjectGuidancePt(scene: Scene): string");
    expect(source).toContain("A cena ${scene.name} está pronta para explorar os objetos.");
    expect(source).toContain("setGreetingText(getSceneObjectGuidancePt(selectedScene));");
  });
});
