import { describe, expect, it } from "vitest";
import { resolveVoiceConversationTeacher } from "../client/src/lib/voiceConversationTeacher";

describe("perfil da conversa por voz", () => {
  it("mantém o professor selecionado quando a voz pertence ao idioma da aula", () => {
    expect(resolveVoiceConversationTeacher({
      id: 7,
      name: "Professor James",
      gender: "male",
      photoUrl: "/james.png",
      voiceLanguageCode: "en-GB",
    }, "en-US")).toMatchObject({
      name: "Professor James",
      gender: "male",
      fallbackLanguage: "en-GB",
    });
  });

  it("recusa um perfil de outro idioma em vez de trocar a voz da aula", () => {
    expect(resolveVoiceConversationTeacher({
      name: "Professor Ricardo",
      gender: "male",
      voiceLanguageCode: "pt-BR",
    }, "en-US")).toBeUndefined();
  });
});
