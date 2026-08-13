import { describe, expect, it } from "vitest";
import { getImmersiveHotspotSpeech } from "../client/src/lib/immersiveHotspotSpeech";
import { getNativeHelpSpeechRequest } from "../client/src/lib/immersiveSpeechChannels";

describe("fala dos objetos na cena imersiva", () => {
  it("fala o rótulo em inglês para um objeto da cena inglesa", () => {
    expect(getImmersiveHotspotSpeech(
      { label: "Palm Tree" },
      { teacherLang: "en-US", teacherGender: "male" },
    )).toEqual({ text: "Palm Tree", language: "en-US", gender: "male", purpose: "hotspot", requiresNeural: true });
  });

  it("não troca automaticamente a fala do objeto para o idioma nativo", () => {
    expect(getImmersiveHotspotSpeech(
      { label: "Tour Eiffel" },
      { teacherLang: "fr-FR", teacherGender: "female" },
    ).language).toBe("fr-FR");
  });

  it("mantém a ajuda nativa em canal neural e locale próprio, separado da pronúncia do objeto", () => {
    const targetSpeech = getImmersiveHotspotSpeech(
      { label: "Palm Tree" },
      { teacherLang: "en-US", teacherGender: "male" },
    );
    const nativeHelp = getNativeHelpSpeechRequest("Palmeira é uma árvore tropical.", "pt-BR");

    expect(nativeHelp).toEqual({
      text: "Palmeira é uma árvore tropical.", language: "pt-BR", purpose: "native_help", requiresNeural: true,
    });
    expect(nativeHelp.language).not.toBe(targetSpeech.language);
  });
});
