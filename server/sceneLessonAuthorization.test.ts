import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";

const input = {
  targetLanguage: "en-US",
  nativeLanguage: "pt-BR",
  phase: "infancia",
  sceneId: "kitchen",
};

describe("scene lesson authorization", () => {
  it("rejects anonymous content and image generation before invoking providers", async () => {
    const caller = appRouter.createCaller({ user: null } as any);
    await expect(caller.polyLesson.sceneLesson(input)).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
