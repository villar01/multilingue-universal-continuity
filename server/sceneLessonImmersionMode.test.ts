import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "client/src/components/SceneLesson.tsx"), "utf8");

describe("SceneLesson no modo de imersão", () => {
  it("prioriza a pergunta e os controles no idioma-alvo sem remover saída ou pronúncia", () => {
    expect(source).toContain("const { profile, immersionMode } = useLanguage()");
    expect(source).toContain("const targetUI = getUIStrings(languageCode)");
    expect(source).toContain("question: immersionMode ? question.questionInTarget");
    expect(source).toContain("!immersionMode && profile.nativeCode?.startsWith('pt')");
    expect(source).toContain("placeholder={immersionMode ? targetUI.typeMessage");
    expect(source).toContain("requestMicrophoneStream()");
    expect(source).toContain("onBack &&");
    expect(source).toContain("onClick={() => setSelectedScene(null)}");
  });
});
