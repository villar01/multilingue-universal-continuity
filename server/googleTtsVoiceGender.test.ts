import { describe, expect, it } from "vitest";
import { resolveGoogleVoiceRequest } from "./_core/tts";

describe("Google Neural TTS voice gender resolution", () => {
  it("does not combine a generic English female voice with a male teacher request", () => {
    expect(resolveGoogleVoiceRequest("en-US", "MALE")).toEqual({
      languageCode: "en-US",
      ssmlGender: "MALE",
    });
  });

  it("does not combine the configured Portuguese female voice with a male teacher request", () => {
    expect(resolveGoogleVoiceRequest("pt-BR", "MALE")).toEqual({
      languageCode: "pt-BR",
      ssmlGender: "MALE",
    });
  });

  it("keeps a teacher-specific voice without an incompatible gender constraint", () => {
    expect(resolveGoogleVoiceRequest("en-US", "MALE", "en-US-Neural2-F")).toEqual({
      languageCode: "en-US",
      name: "en-US-Neural2-F",
      ssmlGender: "NEUTRAL",
    });
  });
});
