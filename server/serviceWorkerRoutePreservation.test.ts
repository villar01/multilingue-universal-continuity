import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "client/src/lib/registerSW.ts"), "utf8");

describe("atualização sem perda de rota", () => {
  it("não recarrega a página quando um novo service worker assume o controle", () => {
    const controllerChange = source.slice(source.indexOf("controllerchange"), source.indexOf("registration.addEventListener"));
    expect(controllerChange).toContain("sessionStorage.setItem(reloadKey, '1')");
    expect(controllerChange).not.toMatch(/window\.location\.reload|location\.assign|location\.href/);
  });
});
