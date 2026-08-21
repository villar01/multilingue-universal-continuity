import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "client/src/main.tsx"), "utf8");

describe("recuperação de autenticação sem perda de rota", () => {
  it("não permite que erros globais de query ou mutation naveguem para fora da rota atual", () => {
    const querySubscriber = source.slice(source.indexOf("queryClient.getQueryCache().subscribe"), source.indexOf("queryClient.getMutationCache().subscribe"));
    const mutationSubscriber = source.slice(source.indexOf("queryClient.getMutationCache().subscribe"), source.indexOf("const trpcClient"));

    expect(querySubscriber).toContain("if (isAuthError(error))");
    expect(mutationSubscriber).toContain("if (isAuthError(error))");
    expect(querySubscriber).not.toMatch(/window\.location|location\.href|getLoginUrl/);
    expect(mutationSubscriber).not.toMatch(/window\.location|location\.href|getLoginUrl/);
  });
});
