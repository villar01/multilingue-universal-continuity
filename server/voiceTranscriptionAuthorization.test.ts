import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";

describe("voiceTranscription.transcribe authorization", () => {
  it("rejects anonymous requests before storing temporary audio or calling transcription", async () => {
    const caller = appRouter.createCaller({ user: null } as any);

    await expect(caller.voiceTranscription.transcribe({
      audioData: "dGVzdA==",
      language: "en-US",
    })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
