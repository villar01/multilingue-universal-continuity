import { describe, expect, it } from "vitest";
import { createImmersiveHotspotInteraction } from "../client/src/lib/immersiveHotspotInteraction";

describe("interação do clique de hotspot imersivo", () => {
  it("gera retorno visual imediato e solicita a voz neural regional da cena", () => {
    const interaction = createImmersiveHotspotInteraction(
      { label: "Palm Tree", translation: "Palmeira" },
      { teacherLang: "en-US", teacherGender: "male" },
    );

    expect(interaction.greeting).toBe("Palm Tree — Palmeira");
    expect(interaction.speech).toEqual({
      text: "Palm Tree", language: "en-US", gender: "male", purpose: "hotspot", requiresNeural: true,
    });
  });
});
