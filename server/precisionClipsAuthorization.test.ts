import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";

describe("precision clip generation authorization", () => {
  it("rejects a regular learner before a precision clip generation job begins", async () => {
    const caller = appRouter.createCaller({ user: { id: 7, role: "user" } } as any);

    await expect(caller.precisionClips.generateSingle({
      topic: "family",
      targetLanguage: "en-US",
      nativeLanguage: "pt-BR",
      difficulty: "A1",
      duration: 30,
    })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
