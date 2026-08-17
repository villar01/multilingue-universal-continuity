import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const registrationPath = resolve(process.cwd(), "client/src/lib/registerSW.ts");
const registrationSource = readFileSync(registrationPath, "utf8");

describe("registro de atualização do Service Worker", () => {
  it("ativa o worker aguardando e recarrega somente uma vez quando o controlador muda", () => {
    expect(registrationSource).toContain("registration.waiting?.postMessage({ type: 'SKIP_WAITING' })");
    expect(registrationSource).toContain("navigator.serviceWorker.addEventListener('controllerchange'");
    expect(registrationSource).toContain("multilingue-sw-version-reload");
    expect(registrationSource).toContain("window.location.reload()");
  });
});
