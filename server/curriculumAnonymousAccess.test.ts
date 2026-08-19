import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createAnonymousContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("entrega curricular protegida", () => {
  it("recusa uma chamada direta de visitante antes de entregar o Livro ABC", async () => {
    const caller = appRouter.createCaller(createAnonymousContext());

    await expect(caller.curriculum.abcBook({
      lessonKey: "pt-BR-en-US-a1-01",
      nativeLanguage: "pt-BR",
      targetLanguage: "en-US",
    })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
