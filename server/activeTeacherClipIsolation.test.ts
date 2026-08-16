import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("isolamento de clipes pelo professor ativo", () => {
  const source = readFileSync("client/src/pages/ImmersiveScene.tsx", "utf8");

  it("usa o professor ativo para decidir o clipe de abertura", () => {
    expect(source).toContain('if (dialogueScene.id === "beach" && dialogueScene.teacherName === "James")');
    expect(source).toContain('if (dialogueScene.id === "cafe" && dialogueScene.teacherName === "Sophie")');
  });

  it("não dispara clipes de avaliação para outro professor selecionado", () => {
    expect(source).toContain('if (scene.teacherName === "James") playJamesTropicalClip("james-tropical-retry")');
    expect(source).toContain('if (scene.teacherName === "Sophie") playSophieCafeClip("sophie-cafe-retry")');
    expect(source).toContain('const praiseClip = scene.teacherName === "James"');
  });

  it("restringe os clipes de objeto ao professor compatível ativo", () => {
    expect(source).toContain('const activeTeacherScene = teachingScene ?? selectedScene');
    expect(source).toContain('activeTeacherScene.teacherName === "James" && hotspot.id === "palm"');
    expect(source).toContain('activeTeacherScene.teacherName === "Sophie" && hotspot.id === "croissant"');
  });
});
