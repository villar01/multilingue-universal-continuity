import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const workerPath = resolve(process.cwd(), "client/public/sw.js");
const workerSource = readFileSync(workerPath, "utf8");

describe("service worker storage media", () => {
  it("não intercepta mídias redirecionadas do armazenamento com URL assinada", () => {
    expect(workerSource).toContain("const CACHE_VERSION = 'v7'");
    expect(workerSource).toContain("url.pathname.startsWith('/manus-storage/')");
    expect(workerSource.indexOf("url.pathname.startsWith('/manus-storage/')")).toBeLessThan(
      workerSource.indexOf("// Imagens — Cache First 30 dias"),
    );
  });

  it("mantém autorização, currículo e voz tRPC fora do cache do navegador", () => {
    const trpcBypass = "if (url.pathname.startsWith('/api/trpc')) return;";
    expect(workerSource).toContain(trpcBypass);
    expect(workerSource.indexOf(trpcBypass)).toBeLessThan(
      workerSource.indexOf("// Outras APIs — Network only"),
    );
  });

  it("ativa imediatamente o worker novo para não reabrir a cena em uma interface antiga", () => {
    expect(workerSource).toContain("event.data?.type === 'SKIP_WAITING'");
    expect(workerSource).toContain("self.skipWaiting()");
  });
});
