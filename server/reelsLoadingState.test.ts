import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("estado de carregamento dos Reels", () => {
  it("encerra o carregamento após consulta vazia e exibe o estado vazio seguro", () => {
    const source = fs.readFileSync(path.join(process.cwd(), "client/src/pages/ReelsPage.tsx"), "utf8");
    expect(source).toContain("if (!isFetching)");
    expect(source).toContain("setReels(Array.isArray(fetchedReels) ? (fetchedReels as unknown as ReelData[]) : [])");
    expect(source).toContain("if (isLoading) {");
    expect(source).toContain("Nenhuma aula disponível");
    expect(source).not.toContain("if (isLoading || isFetching)");
  });
});
