import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const workerPath = resolve(process.cwd(), "client/public/sw.js");
const workerSource = readFileSync(workerPath, "utf8");

describe("service worker storage media", () => {
  it("não intercepta mídias redirecionadas do armazenamento com URL assinada", () => {
    expect(workerSource).toContain("const CACHE_VERSION = 'v6'");
    expect(workerSource).toContain("url.pathname.startsWith('/manus-storage/')");
    expect(workerSource.indexOf("url.pathname.startsWith('/manus-storage/')")).toBeLessThan(
      workerSource.indexOf("// Imagens — Cache First 30 dias"),
    );
  });
});
