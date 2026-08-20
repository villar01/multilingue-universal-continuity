import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("capas dos vídeos interativos", () => {
  it("não depende de miniaturas remotas quebráveis e preserva texto alternativo acessível", () => {
    const source = fs.readFileSync(path.join(process.cwd(), "client/src/pages/InteractiveVideos.tsx"), "utf8");
    expect(source).not.toContain("images.unsplash.com");
    expect(source).toContain("role=\"img\"");
    expect(source).toContain("Cena de aprendizagem:");
    expect(source).toContain("cover: { emoji:");
  });
});
