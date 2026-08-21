import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(resolve(process.cwd(), "server/securityMiddleware.ts"), "utf8");

describe("ciclo de vida do middleware de segurança", () => {
  it("limpa buckets vencidos no fluxo de requisição sem temporizador em processo", () => {
    expect(source).toContain("function cleanExpiredBucketsWhenDue(now: number): void");
    expect(source).toContain("cleanExpiredBucketsWhenDue(now);");
    expect(source).toContain("const BUCKET_CLEANUP_INTERVAL = 5 * 60 * 1000;");
    expect(source).not.toContain("setInterval(");
  });
});
