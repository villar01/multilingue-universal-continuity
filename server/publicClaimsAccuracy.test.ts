import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { TEACHERS_57 } from "../client/src/data/teachers57";

const root = path.resolve(import.meta.dirname, "..");
const homeSource = readFileSync(path.join(root, "client/src/pages/Home.tsx"), "utf8");

describe("mensagens públicas canônicas", () => {
  it("separa a cobertura de 143 idiomas da quantidade real de professores", () => {
    expect(TEACHERS_57).toHaveLength(94);
    expect(homeSource).toContain('title: "94 Professores Virtuais"');
    expect(homeSource).toContain("143 idiomas");
    expect(homeSource).not.toContain("143 Professores Virtuais");
  });
});
