/**
 * Adventure Router — Modo Aventura Imersivo
 * Inspirado em Duolingo Adventures: cenários gamificados com NPC em idioma alvo
 */
import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { generateRoleplayFollowUps } from "./roleplayFollowUps";

const SCENARIO_CONTEXTS: Record<string, { npcName: string; npcRole: string; setting: string }> = {
  restaurant: {
    npcName: "Marie",
    npcRole: "garçonete",
    setting: "Um bistrô aconchegante em Paris. Você é um cliente que acabou de chegar.",
  },
  airport: {
    npcName: "Tanaka-san",
    npcRole: "funcionário do aeroporto",
    setting: "Aeroporto de Narita, Tokyo. Você precisa de ajuda para encontrar seu portão.",
  },
  market: {
    npcName: "Carlos",
    npcRole: "vendedor do mercado",
    setting: "La Boqueria, Barcelona. Você quer comprar frutas e verduras frescas.",
  },
  hotel: {
    npcName: "Herr Schmidt",
    npcRole: "recepcionista do hotel",
    setting: "Hotel de luxo em Berlin. Você está fazendo check-in.",
  },
  doctor: {
    npcName: "Dottoressa Rossi",
    npcRole: "médica",
    setting: "Clínica médica em Roma. Você não está se sentindo bem.",
  },
  business: {
    npcName: "Mr. Johnson",
    npcRole: "executivo de negócios",
    setting: "Sala de reuniões em Manhattan, New York. Você está apresentando sua proposta.",
  },
};

const MessageSchema = z.object({
  role: z.enum(["npc", "player"]),
  text: z.string(),
  translation: z.string().optional(),
});

export const adventureRouter = router({
  chat: publicProcedure
    .input(
      z.object({
        scenarioId: z.string(),
        userMessage: z.string(),
        languageCode: z.string().default("en"),
        targetLanguage: z.string().default("English"),
        history: z.array(MessageSchema).optional().default([]),
      })
    )
    .mutation(async ({ input }) => {
      const ctx = SCENARIO_CONTEXTS[input.scenarioId] || SCENARIO_CONTEXTS.restaurant;
      const isStart = input.userMessage === "__START__";
      const turnCount = input.history.length;
      const isComplete = turnCount >= 8; // Completar após 4 trocas (8 mensagens)

      const systemPrompt = `You are ${ctx.npcName}, a ${ctx.npcRole}.
Setting: ${ctx.setting}
Language: You MUST speak ONLY in ${input.targetLanguage}. Keep responses SHORT (1-2 sentences max).
Your goal: Have a natural conversation to help the student practice ${input.targetLanguage}.
Be friendly, encouraging, and realistic. If the student makes a mistake, gently correct them.
${isComplete ? "This is the final exchange. Wrap up the conversation naturally and say goodbye." : ""}`;

      const conversationHistory = input.history.map(msg => ({
        role: msg.role === "npc" ? "assistant" as const : "user" as const,
        content: msg.text,
      }));

      const userContent = isStart
        ? `[The student has just arrived. Start the conversation naturally as ${ctx.npcName}.]`
        : input.userMessage;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          ...conversationHistory,
          { role: "user", content: userContent },
        ],
      });

      const rawNpcMessage = response.choices?.[0]?.message?.content;
      const npcMessage = typeof rawNpcMessage === "string" && rawNpcMessage.trim()
        ? rawNpcMessage.trim()
        : "Hello! Welcome. How can I help you today?";

      const { translation, optionsContent } = await generateRoleplayFollowUps({
        npcMessage,
        targetLanguage: input.targetLanguage,
        setting: ctx.setting,
      });

      let options: string[] = [];
      try {
        const parsed = JSON.parse(optionsContent);
        options = Array.isArray(parsed) ? parsed : (parsed.options || parsed.choices || []);
      } catch {
        options = [
          `Thank you, ${ctx.npcName}!`,
          "Could you help me, please?",
          "I don't understand. Can you repeat?",
        ];
      }

      const progress = Math.min(100, Math.round((turnCount / 8) * 100));

      return {
        npcMessage,
        translation,
        options: options.slice(0, 3),
        progress,
        isComplete: isComplete || turnCount >= 8,
        npcName: ctx.npcName,
      };
    }),
});
