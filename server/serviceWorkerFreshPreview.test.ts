import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const registrationSource = readFileSync("client/src/lib/registerSW.ts", "utf8");
const workerSource = readFileSync("client/public/sw.js", "utf8");

describe("atualização segura do service worker", () => {
  it("remove cache do preview e incrementa a versão publicada", () => {
    expect(registrationSource).toContain("if (import.meta.env.DEV)");
    expect(registrationSource).toContain("await unregisterServiceWorker()");
    expect(workerSource).toContain("const CACHE_VERSION = 'v8'");
    expect(workerSource).toContain("self.skipWaiting()");
  });
});
