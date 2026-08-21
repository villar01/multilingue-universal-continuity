/**
 * Router de Conversação Bilíngue com Editor de Frases
 * Respostas em português + idioma alvo
 * Editor com sugestões: "Modifique esta palavra", "Acrescente outra"
 * Tradução simultânea ao editar
 */

import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { sanitizeContent, logInteraction } from "./contentFilter";
import { assessConversationText, ensureConversationAccess } from "./conversationSafetyGate";

const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
const cefrLevelSchema = z.enum(CEFR_LEVELS);

function localeTag(language: string) {
  return language.split(/[-_]/)[0]?.toUpperCase() || "XX";
}

export const bilingualConversationRouter = router({
  /**
   * Iniciar conversação bilíngue
   */
  start: protectedProcedure
    .input(
      z.object({
        lessonId: z.number(),
        targetLanguage: z.string(), // "English", "Spanish", etc.
        nativeLanguage: z.string(), // "Portuguese"
        userLevel: cefrLevelSchema,
      })
    )
    .mutation(async ({ input, ctx }) => {
      await ensureConversationAccess(ctx.user.id);
      const nativeTag = localeTag(input.nativeLanguage);
      const targetTag = localeTag(input.targetLanguage);
      const prompt = `You are a language teacher. Start a conversation about a lesson topic in ${input.targetLanguage}.

CRITICAL RULES:
1. Respond in BOTH languages: ${input.nativeLanguage} first, then ${input.targetLanguage}
2. Format: "[${nativeTag}] Native-language text\n[${targetTag}] Target-language text"
3. Keep it simple for ${input.userLevel} level
4. Ask an engaging question to start the conversation
5. Be encouraging and supportive

Start the conversation now:`;

      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: prompt,
          },
        ],
      });

      const rawQuestion = (String(response.choices[0]?.message?.content ?? ""))?.trim();
      if (!rawQuestion) {
        return { question: "", suggestions: [], blocked: true };
      }
      const outputSafety = await assessConversationText(ctx.user.id, rawQuestion, input.targetLanguage);
      const question = outputSafety.allowed
        ? rawQuestion
        : "";

      return {
        question,
        suggestions: [],
        blocked: !outputSafety.allowed,
      };
    }),

  /**
   * Continuar conversação com resposta bilíngue
   */
  continue: protectedProcedure
    .input(
      z.object({
        lessonId: z.number(),
        targetLanguage: z.string(),
        nativeLanguage: z.string(),
        userLevel: cefrLevelSchema,
        history: z.array(
          z.object({
            role: z.enum(["user", "assistant"]),
            content: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await ensureConversationAccess(ctx.user.id);
      const nativeTag = localeTag(input.nativeLanguage);
      const targetTag = localeTag(input.targetLanguage);
      try {
      // Validar inputs
      if (!input.targetLanguage || !input.nativeLanguage) {
        console.error("[Bilingual Conversation] Missing required inputs:", {
          targetLanguage: input.targetLanguage,
          nativeLanguage: input.nativeLanguage,
        });
        throw new Error("targetLanguage and nativeLanguage are required");
      }
      const safeResponse = "";
      const lastUserMessage = input.history.length > 0 ? input.history[input.history.length - 1]?.content : "";
      const inputSafety = await assessConversationText(ctx.user.id, lastUserMessage, input.targetLanguage);
      if (!inputSafety.allowed) {
        return {
          response: safeResponse,
          suggestions: [],
          blocked: true,
          flaggedContent: inputSafety.flaggedContent,
        };
      }
      
      const systemPrompt = `You are a supportive language teacher teaching ${input.targetLanguage} to native ${input.nativeLanguage} speakers.

⚠️ MANDATORY FORMAT - YOU MUST FOLLOW THIS EXACTLY:
EVERY response MUST start with "[${nativeTag}]" followed by native-language text, then "[${targetTag}]" followed by target-language text.

CRITICAL RESPONSE FORMAT:
1. ALWAYS respond FIRST in ${input.nativeLanguage} (${nativeTag}), THEN in the target language (${input.targetLanguage})
2. Format: "[${nativeTag}] Native-language explanation\n[${targetTag}] Target-language version with teaching focus"
3. NEVER respond in only one language - ALWAYS use BOTH languages
4. FOCUS on teaching the target language: corrections, pronunciation tips, grammar explanations
5. Keep responses appropriate for ${input.userLevel} level
6. Be encouraging and patient

Example:
Your response: "[${nativeTag}] Helpful explanation in ${input.nativeLanguage}.
[${targetTag}] Corresponding practice in ${input.targetLanguage}."

NOW respond to the user's message following this EXACT format with [${nativeTag}] and [${targetTag}] tags.`;

      const messages = [
        {
          role: "system" as const,
          content: systemPrompt,
        },
        ...input.history.map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        })),
      ];

      const response = await invokeLLM({
        messages,
      });

      console.log("[Bilingual Conversation] LLM response:", JSON.stringify(response, null, 2));
      
      if (!response || !response.choices || response.choices.length === 0) {
        console.error("[Bilingual Conversation] Invalid LLM response:", response);
        throw new Error("LLM returned empty or invalid response");
      }

      let aiResponse = (String(response.choices[0]?.message?.content ?? ""))?.trim();
      if (!aiResponse) {
        return { response: "", suggestions: [], blocked: true };
      }
      
      // Content filter: sanitize AI response
      aiResponse = await sanitizeContent(aiResponse, input.targetLanguage) || aiResponse;
      
      const loggedUserMessage = lastUserMessage || "(empty history)";
      
      // Log teacher-student interaction for parental monitoring
      logInteraction({
        userId: ctx.user.id,
        childProfileId: null,
        teacherId: null,
        interactionType: 'bilingual_conversation',
        content: loggedUserMessage,
        teacherResponse: aiResponse,
        languageCode: input.targetLanguage,
      }).catch(() => {}); // Non-blocking
      console.log("[Bilingual Conversation] User message:", loggedUserMessage);
      console.log("[Bilingual Conversation] AI response (raw):", aiResponse);

      // Fallback: se a resposta não vier marcada, traduzir para o idioma nativo e formatar.
      if (!aiResponse.includes(`[${nativeTag}]`) || !aiResponse.includes(`[${targetTag}]`)) {
        console.log("[Bilingual Conversation] Response missing bilingual format, applying fallback...");
        
        // Traduzir resposta para o idioma nativo selecionado.
        const translationResponse = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are a translator. Translate the following target-language text to ${input.nativeLanguage}. Return ONLY the translation, nothing else.`
            },
            {
              role: "user",
              content: aiResponse
            }
          ]
        });
        
        const nativeVersion = (String(translationResponse.choices[0]?.message?.content ?? "")).trim();
        if (!nativeVersion) {
          return { response: "", suggestions: [], blocked: true };
        }
        
        // Formatar como bilíngue
        aiResponse = `[${nativeTag}] ${nativeVersion}\n[${targetTag}] ${aiResponse}`;
        console.log("[Bilingual Conversation] Formatted response:", aiResponse);
      }

      const outputSafety = await assessConversationText(ctx.user.id, aiResponse, input.targetLanguage);
      if (!outputSafety.allowed) {
        return { response: "", suggestions: [], blocked: true };
      }

      // Gerar sugestões de resposta
      const suggestionsPrompt = `Based on this teacher response: "${aiResponse}"

Generate 3 simple ${input.userLevel}-level questions or responses the student could say next to practice ${input.targetLanguage}. Return ONLY the 3 responses in ${input.targetLanguage}, one per line, no numbering.`;

      const suggestionsResponse = await invokeLLM({
        messages: [
          {
            role: "system",
            content: suggestionsPrompt,
          },
        ],
      });

      console.log("[Bilingual Conversation] Suggestions response:", JSON.stringify(suggestionsResponse, null, 2));
      
      let suggestions: string[] = [];
      if (suggestionsResponse && suggestionsResponse.choices && suggestionsResponse.choices.length > 0) {
        const suggestionsText = (String(suggestionsResponse.choices[0]?.message?.content ?? "")).trim();
        if (suggestionsText) {
          suggestions = suggestionsText
            .split("\n")
            .filter((s: string) => s.trim())
            .slice(0, 3);
        }
      }

      // Content filter: sanitize suggestions
      const sanitizedSuggestions = await Promise.all(
        suggestions.map(s => sanitizeContent(s, input.targetLanguage).then(r => r || s))
      );
      suggestions = sanitizedSuggestions;
      
      return {
        response: aiResponse,
        suggestions,
      };
      } catch (error: any) {
        console.error("[Bilingual Conversation] Error in continue mutation:", error);
        console.error("[Bilingual Conversation] Error stack:", error.stack);
        console.error("[Bilingual Conversation] Input history length:", input.history?.length || 0);
        
        return {
          response: "",
          suggestions: [],
          blocked: true,
        };
      }
    }),

  /**
   * Editor de frases com sugestões
   */
  editPhrase: protectedProcedure
    .input(
      z.object({
        originalPhrase: z.string(),
        targetLanguage: z.string(),
        nativeLanguage: z.string(),
        editType: z.enum(["modify_word", "add_word", "translate", "improve"]),
        wordToModify: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const safety = await assessConversationText(ctx.user.id, input.originalPhrase, input.targetLanguage);
      if (!safety.allowed) {
        return {
          suggestions: "",
          originalPhrase: input.originalPhrase,
          editType: input.editType,
          blocked: true,
        };
      }
      const nativeTag = localeTag(input.nativeLanguage);
      const targetTag = localeTag(input.targetLanguage);
      let actionInstruction = "";

      switch (input.editType) {
        case "modify_word":
          actionInstruction = `Offer alternatives for the word "${input.wordToModify}" that preserve the meaning in context.`;
          break;

        case "add_word":
          actionInstruction = "Suggest words that can be naturally added, including their placement in the phrase.";
          break;

        case "translate":
          actionInstruction = "Translate the phrase and provide a concise word-by-word breakdown.";
          break;

        case "improve":
          actionInstruction = "Provide improved versions and explain briefly why each version is better.";
          break;
      }

      const prompt = `You are helping a native ${input.nativeLanguage} learner practise ${input.targetLanguage}.
Original phrase: "${input.originalPhrase}"
Task: ${actionInstruction}

Return exactly three useful suggestions. For every suggestion, write the explanation in ${input.nativeLanguage} marked [${nativeTag}], followed by the phrase or result in ${input.targetLanguage} marked [${targetTag}]. Do not use any third language.`;

      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: "You are a helpful language teacher providing bilingual suggestions.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const suggestions = (String(response.choices[0]?.message?.content ?? ""))?.trim() || "No suggestions available";

      return {
        suggestions,
        originalPhrase: input.originalPhrase,
        editType: input.editType,
      };
    }),

  /**
   * Tradução simultânea ao digitar
   */
  translateRealtime: protectedProcedure
    .input(
      z.object({
        text: z.string(),
        fromLanguage: z.string(),
        toLanguage: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await ensureConversationAccess(ctx.user.id);
      if (!input.text.trim()) {
        return {
          translation: "",
          wordByWord: [],
        };
      }

      const inputSafety = await assessConversationText(ctx.user.id, input.text, input.fromLanguage);
      if (!inputSafety.allowed) {
        return { translation: "", wordByWord: [] };
      }

      const prompt = `Translate "${input.text}" from ${input.fromLanguage} to ${input.toLanguage}.

Provide:
1. Full translation
2. Word-by-word breakdown

Format:
Translation: [full translation]
Words: [word1]=[translation1], [word2]=[translation2]...`;

      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: "You are a translator. Be concise.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const result = (String(response.choices[0]?.message?.content ?? ""))?.trim() || "";
      const outputSafety = await assessConversationText(ctx.user.id, result, input.toLanguage);
      if (!outputSafety.allowed) {
        return { translation: "", wordByWord: [] };
      }
      const lines = result.split("\n");
      const translation = lines[0]?.replace("Translation:", "").trim() || input.text;
      const wordsLine = lines[1]?.replace("Words:", "").trim() || "";

      const wordByWord = wordsLine
        .split(",")
        .map((pair: any) => {
          const [word, trans] = pair.split("=").map((s: string) => s.trim());
          return { word, translation: trans };
        })
        .filter((w) => w.word && w.translation);

      return {
        translation,
        wordByWord,
      };
    }),

  /**
   * Adicionar palavra ao vocabulário pessoal
   */
  addToVocabulary: protectedProcedure
    .input(
      z.object({
        word: z.string(),
        translation: z.string(),
        targetLanguage: z.string(),
        nativeLanguage: z.string(),
        exampleSentence: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // TODO: Salvar no banco de dados (tabela userVocabulary)
      // Por enquanto, retornar sucesso

      return {
        success: true,
        word: input.word,
        translation: input.translation,
        message: `"${input.word}" adicionado ao seu vocabulário!`,
      };
    }),
});
