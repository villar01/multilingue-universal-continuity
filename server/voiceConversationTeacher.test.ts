import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolveTeacherSpeechVoice, resolveVoiceConversationTeacher } from "../client/src/lib/voiceConversationTeacher";

const voiceConversation = readFileSync(new URL("../client/src/components/VoiceConversation.tsx", import.meta.url), "utf8");
const router = readFileSync(new URL("../server/bilingual-conversation-router.ts", import.meta.url), "utf8");

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

  it("mantém a variante regional e o gênero do professor selecionado na fala da aula", () => {
    expect(resolveTeacherSpeechVoice({
      name: "Professor James",
      gender: "male",
      voiceLanguageCode: "en-GB",
    }, "en-US")).toEqual({ voiceLang: "en-GB", gender: "male" });
  });

  it("usa somente o idioma da aula quando o perfil selecionado é incompatível", () => {
    expect(resolveTeacherSpeechVoice({
      name: "Professor Ricardo",
      gender: "male",
      voiceLanguageCode: "pt-BR",
    }, "en-US")).toEqual({ voiceLang: "en-US", gender: "female" });
  });

  it("encaminha o professor ativo ao contexto e à auditoria da conversa online", () => {
    expect(voiceConversation).toContain('teacherId: typeof selectedTeacher?.id === "number" ? selectedTeacher.id : undefined');
    expect(router).toContain("teacherId: z.number().int().positive().optional()");
    expect(router).toContain("resolveBilingualConversationTeacher(input.teacherId)");
    expect(router).toContain("You are ${activeTeacher?.name || \"a supportive language teacher\"}");
    expect(router).toContain("teacherId: activeTeacher?.id ?? null");
  });
});
