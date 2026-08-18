import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const sceneSource = readFileSync(path.join(root, "client/src/pages/ImmersiveScene.tsx"), "utf8");
const paretoSource = readFileSync(path.join(root, "client/src/pages/Pareto1000.tsx"), "utf8");

describe("retorno contextual da Cena Imersiva para o Pareto", () => {
  it("encaminha a cena ativa para o Pareto e preserva o retorno completo", () => {
    expect(sceneSource).toContain('const params = new URLSearchParams({ returnTo: sceneStudyReturnPath });');
    expect(sceneSource).toContain('if (destination === "/pareto-1000" && selectedScene?.id)');
    expect(sceneSource).toContain('params.set("scene", selectedScene.id);');
    expect(sceneSource).toContain('setLocation(`${destination}?${params.toString()}`);');
  });

  it("envia somente o identificador da cena ao currículo protegido e identifica a prática para o aluno", () => {
    expect(paretoSource).toContain('const sceneId = useMemo(() => searchParams.get("scene")?.trim() || undefined, [searchParams]);');
    expect(paretoSource).toContain('scene: paretoPath === "advanced" ? sceneId : undefined');
    expect(paretoSource).toContain('"Pareto da cena imersiva"');
    expect(paretoSource).toContain('"Palavras desta cena para lembrar e usar"');
  });
});
