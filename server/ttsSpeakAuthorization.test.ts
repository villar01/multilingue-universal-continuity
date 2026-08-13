import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";

describe("tts.speak authorization", () => {
  it("rejects anonymous synthesis before Edge TTS can receive text", async () => {
    const caller = appRouter.createCaller({ user: null } as any);

    await expect(caller.tts.speak({
      text: "Hello",
      voiceLang: "en-US",
      gender: "female",
    })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
