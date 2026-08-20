import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const clientRoot = path.join(root, "client/src");
const curriculumRouterSource = readFileSync(path.join(root, "server/curriculum-router.ts"), "utf8");

function collectClientSources(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectClientSources(entryPath);
    return /\.(?:ts|tsx)$/.test(entry.name) ? [entryPath] : [];
  });
}

describe("fronteira entre currículo protegido e navegador", () => {
  it("não permite que o cliente importe arquivos curriculares protegidos diretamente", () => {
    const violations = collectClientSources(clientRoot)
      .filter((file) => {
        const source = readFileSync(file, "utf8");
        return source.includes("server/curriculum") || source.includes("abcBookContent");
      })
      .map((file) => path.relative(root, file));

    expect(violations).toEqual([]);
  });

  it("mantém a entrega curricular no roteador protegido do servidor", () => {
    expect(curriculumRouterSource).toContain("abcBook: protectedProcedure");
    expect(curriculumRouterSource).toContain("assertCurriculumDelivery");
    expect(curriculumRouterSource).toContain("getABCBookDelivery");
  });
});
