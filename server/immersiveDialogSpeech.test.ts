import { describe, expect, it } from "vitest";
import { getImmersiveDialogTeacherSpeech } from "../client/src/lib/immersiveDialogSpeech";
import { getNativeHelpSpeechRequest } from "../client/src/lib/immersiveSpeechChannels";
import { getNativeDialogueTranslation } from "../client/src/lib/immersiveDialogTranslation";

describe("fala do diálogo imersivo", () => {
  it("mantém a fala do professor no idioma estudado, com variante regional e voz neural", () => {
    expect(getImmersiveDialogTeacherSpeech(
      "Welcome to the beach!",
      { teacherLang: "en-US", teacherGender: "male" },
    )).toEqual({
      text: "Welcome to the beach!", language: "en-US", gender: "male", purpose: "teacher", requiresNeural: true,
    });
  });

  it("mantém a ajuda falada no canal nativo sem alterar a fala em inglês", () => {
    const teacherSpeech = getImmersiveDialogTeacherSpeech("Welcome to the beach!", { teacherLang: "en-US", teacherGender: "male" });
    const nativeHelp = getNativeHelpSpeechRequest("Bem-vindo à praia!", "pt-BR");

    expect(nativeHelp.language).toBe("pt-BR");
    expect(nativeHelp.language).not.toBe(teacherSpeech.language);
    expect(nativeHelp.requiresNeural).toBe(true);
  });

  it("envia a tradução não-PT exibida para a ajuda neural no mesmo locale nativo", () => {
    const translatedText = getNativeDialogueTranslation(
      { text: "Welcome to the beach!", textPt: "Bem-vindo à praia!" },
      "es-MX",
      "¡Bienvenido a la playa!",
    );
    const nativeHelp = getNativeHelpSpeechRequest(translatedText, "es-MX");

    expect(translatedText).toBe("¡Bienvenido a la playa!");
    expect(nativeHelp).toEqual({
      text: "¡Bienvenido a la playa!", language: "es-MX", purpose: "native_help", requiresNeural: true,
    });
  });
});
