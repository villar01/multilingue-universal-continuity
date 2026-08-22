import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("evidência persistente do portão headless da Cena Imersiva", () => {
  it("mantém a abertura autenticada controlada da rota e os sinais visuais obrigatórios", () => {
    const script = readFileSync(resolve(process.cwd(), "scripts/verify-immersive-scene-authenticated.mjs"), "utf8");

    expect(script).toContain('page.goto(`${baseUrl}/`');
    expect(script).toContain('a[href="/immersive-scene"]');
    expect(script).toContain('procedure === "auth.me"');
    expect(script).toContain('procedure === "compliance.checkAcceptance"');
    expect(script).toContain('procedure === "trialAccess.authorizeLesson"');
    expect(script).toContain('procedure === "curriculum.sceneCanonicalMaterial"');
    expect(script).toContain('img[alt="James"]');
    expect(script).toContain('".immersive-start-dialog"');
    expect(script).toContain("Ouvir apresentação de James");
  });
});
