import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const immersiveSceneSource = fs.readFileSync(
  path.resolve(import.meta.dirname, "../client/src/pages/ImmersiveScene.tsx"),
  "utf8",
);

describe("refinamento do tutor imersivo", () => {
  it("mantém a resposta imediata e não interrompe o tutor protegido", () => {
    expect(immersiveSceneSource).toContain("O tutor\n    // protegido segue em segundo plano");
    expect(immersiveSceneSource).not.toContain("if (fallback?.immediate) {\n      setDlgTutorLoading(false);\n      return;");
    expect(immersiveSceneSource).toContain("const result = await immersiveSceneTutorMut.mutateAsync");
  });

  it("não repete fala neural quando a resposta imediata já foi entregue", () => {
    expect(immersiveSceneSource).toContain("if (!fallback?.immediate) {\n        requestSpeechSafely(targetReply");
  });
});
