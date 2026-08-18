import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = process.cwd();
const registerSource = readFileSync(resolve(projectRoot, "client/src/lib/registerSW.ts"), "utf8");
const workerSource = readFileSync(resolve(projectRoot, "client/public/sw.js"), "utf8");

describe("entrega imediata de interface atualizada", () => {
  it("solicita a atualização do worker ao registrar a aplicação", () => {
    expect(registerSource).toContain("await registration.update();");
    expect(registerSource).toContain("registration.waiting?.postMessage({ type: 'SKIP_WAITING' });");
  });

  it("publica uma nova versão de cache com ativação imediata", () => {
    expect(workerSource).toContain("const CACHE_VERSION = 'v9'");
    expect(workerSource).toContain("self.skipWaiting()");
    expect(workerSource).toContain("self.clients.claim()");
  });
});
