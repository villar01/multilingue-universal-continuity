import { describe, expect, it } from "vitest";
import { getSceneTutorReply } from "../client/src/lib/immersiveSceneTutor";

describe("pergunta livre de vocabulário na Cena Imersiva", () => {
  it("responde imediatamente a What is pool? com definição, exemplo e tradução", () => {
    const reply = getSceneTutorReply("What is pool?", [
      { id: "pool", label: "Pool", translation: "Piscina", example: "The pool is warm." },
    ]);

    expect(reply).toMatchObject({ immediate: true, hotspotId: "pool" });
    expect(reply?.text).toContain("A pool is a place where people swim.");
    expect(reply?.text).toContain("The hotel has a pool.");
    expect(reply?.nativeText).toContain("pool significa piscina");
  });
});
