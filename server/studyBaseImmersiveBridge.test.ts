import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const studyBaseSource = readFileSync("client/src/pages/StudyBase.tsx", "utf8");
const immersiveSceneSource = readFileSync("client/src/pages/ImmersiveScene.tsx", "utf8");

describe("ponte entre Base de Estudos e Cena Imersiva", () => {
  it("abre a cena relacionada e codifica o retorno ao mesmo item curricular", () => {
    expect(studyBaseSource).toContain("const STUDY_SCENE_IDS");
    expect(studyBaseSource).toContain("const openRelatedScene = useCallback");
    expect(studyBaseSource).toContain("/immersive-scene?scene=${encodeURIComponent(sceneId)}&returnTo=${encodeURIComponent(returnPath)}");
    expect(studyBaseSource).toContain("/base-de-estudos?entry=${encodeURIComponent(entry.id)}");
    expect(studyBaseSource).toContain("Explorar em cena");
    expect(studyBaseSource).toContain("interagir e retornar ao estudo");
  });

  it("restaura o item curricular e respeita o destino interno de retorno da cena", () => {
    expect(studyBaseSource).toContain("const [returnEntryId]");
    expect(studyBaseSource).toContain("setSelectedEntry(returnedEntry)");
    expect(immersiveSceneSource).toContain("const sceneReturnTo = useMemo");
    expect(immersiveSceneSource).toContain("setLocation(sceneReturnTo)");
  });
});
