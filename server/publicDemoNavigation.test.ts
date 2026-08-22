import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("navegação pública das demonstrações", () => {
  it("oferece as duas experiências controladas sem alterar a página de preços", () => {
    const home = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
    expect(home).toContain('href: "/demo"');
    expect(home).toContain('href: "/demo-scene"');
    expect(home).toContain("Experimentar 3 lições A1");
    expect(home).toContain("Conhecer a Praia Tropical");
    expect(home).not.toContain("R$ 49,90");
    expect(home).not.toContain("R$ 39,90");
  });
});
