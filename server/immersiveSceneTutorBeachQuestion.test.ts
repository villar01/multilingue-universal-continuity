import { describe, expect, it } from "vitest";
import { getSceneTutorReply } from "../client/src/lib/immersiveSceneTutor";

describe("resposta local à pergunta sobre a praia", () => {
  it("responde imediatamente a is the beach wide com explicação e tradução", () => {
    const reply = getSceneTutorReply("is the beach wide?", []);

    expect(reply).toMatchObject({
      immediate: true,
      text: expect.stringContaining("The beach is wide"),
      nativeText: expect.stringContaining("praia parece ampla"),
    });
  });
});
