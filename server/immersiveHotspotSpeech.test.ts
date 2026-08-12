import { describe, expect, it } from "vitest";
import { getImmersiveHotspotSpeech } from "../client/src/lib/immersiveHotspotSpeech";

describe("fala dos objetos na cena imersiva", () => {
  it("fala o rótulo em inglês para um objeto da cena inglesa", () => {
    expect(getImmersiveHotspotSpeech(
      { label: "Palm Tree" },
      { teacherLang: "en-US", teacherGender: "male" },
    )).toEqual({ text: "Palm Tree", language: "en-US", gender: "male" });
  });

  it("não troca automaticamente a fala do objeto para o idioma nativo", () => {
    expect(getImmersiveHotspotSpeech(
      { label: "Tour Eiffel" },
      { teacherLang: "fr-FR", teacherGender: "female" },
    ).language).toBe("fr-FR");
  });
});
