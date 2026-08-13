import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const page = readFileSync(resolve(projectRoot, "client/src/pages/PracticeClips.tsx"), "utf8");
const router = readFileSync(resolve(projectRoot, "server/precision-clips-router.ts"), "utf8");
const generator = readFileSync(resolve(projectRoot, "server/precision-clip-generator.ts"), "utf8");

describe("Categorias dos clipes de prática", () => {
  it("persiste e filtra categorias curriculares no servidor", () => {
    expect(router).toContain('category: z.enum(["daily", "travel", "business", "academic", "social"]).optional()');
    expect(router).toContain('&& (!input.category || clip.category === input.category)');
    expect(generator).toContain('export type ClipCategory = "daily" | "travel" | "business" | "academic" | "social"');
    expect(generator).toContain("category: clip.category");
    expect(generator).toContain("const category: ClipCategory = i < 20 ? \"daily\"");
  });

  it("envia o filtro ao roteador e valida a categoria retornada no cliente", () => {
    expect(page).toContain('category: selectedCategory === "all" ? undefined : selectedCategory');
    expect(page).toContain('const matchesCategory = selectedCategory === "all" || clip.category === selectedCategory');
    expect(page).toContain('{clip.category && <Badge variant="secondary">{clip.category}</Badge>}');
    expect(page).not.toContain('const matchesCategory = selectedCategory === "all";');
  });
});
