/**
 * Router de Conversação Bilíngue com Editor de Frases
 * Respostas em português + idioma alvo
 * Editor com sugestões: "Modifique esta palavra", "Acrescente outra"
 * Tradução simultânea ao editar
 */

import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { sanitizeContent, logInteraction } from "./contentFilter";
import { assessConversationText, ensureConversationAccess } from "./conversationSafetyGate";

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
        userLevel: z.enum(["beginner", "intermediate", "advanced"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await ensureConversationAccess(ctx.user.id);
      const prompt = `You are a language teacher. Start a conversation about a lesson topic in ${input.targetLanguage}.

CRITICAL RULES:
1. Respond in BOTH languages: ${input.nativeLanguage} first, then ${input.targetLanguage}
2. Format: "[PT] Portuguese text\n[${input.targetLanguage.substring(0, 2).toUpperCase()}] Target language text"
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

      const rawQuestion = (String(response.choices[0]?.message?.content ?? ""))?.trim() || "Hello! How are you today?";
      const outputSafety = await assessConversationText(ctx.user.id, rawQuestion, input.targetLanguage);
      const question = outputSafety.allowed
        ? rawQuestion
        : "[PT] Vamos continuar com uma pergunta segura da lição. [EN] Let us continue with a safe lesson question.";

      return {
        question,
        suggestions: outputSafety.allowed ? [
          "I'm fine, thank you!",
          "I'm learning English.",
          "Can you help me?",
        ] : ["Hello", "Thank you", "Please help me"],
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
        userLevel: z.enum(["beginner", "intermediate", "advanced"]),
        history: z.array(
          z.object({
            role: z.enum(["user", "assistant"]),
            content: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
      // Validar inputs
      if (!input.targetLanguage || !input.nativeLanguage) {
        console.error("[Bilingual Conversation] Missing required inputs:", {
          targetLanguage: input.targetLanguage,
          nativeLanguage: input.nativeLanguage,
        });
        throw new Error("targetLanguage and nativeLanguage are required");
      }
      const lastUserMessage = input.history.length > 0 ? input.history[input.history.length - 1]?.content : "";
      const inputSafety = await assessConversationText(ctx.user.id, lastUserMessage, input.targetLanguage);
      if (!inputSafety.allowed) {
        return {
          response: "[PT] Essa mensagem não pode ser usada neste perfil. Escolha uma frase segura da lição.\n[EN] This message cannot be used in this profile. Choose a safe lesson phrase.",
          suggestions: ["Hello", "Thank you", "I am learning"],
          blocked: true,
          flaggedContent: inputSafety.flaggedContent,
        };
      }
      
      const systemPrompt = `You are a supportive language teacher teaching ${input.targetLanguage} to native ${input.nativeLanguage} speakers.

⚠️ MANDATORY FORMAT - YOU MUST FOLLOW THIS EXACTLY:
EVERY response MUST start with "[PT]" followed by Portuguese text, then "[EN]" followed by English text.

CRITICAL RESPONSE FORMAT:
1. ALWAYS respond FIRST in Portuguese (PT), THEN in the target language (${input.targetLanguage})
2. Format: "[PT] Explicação completa em português\n[${input.targetLanguage.substring(0, 2).toUpperCase()}] Target language version with teaching focus"
3. NEVER respond in only one language - ALWAYS use BOTH languages
4. FOCUS on teaching the target language: corrections, pronunciation tips, grammar explanations
5. Keep responses appropriate for ${input.userLevel} level
6. Be encouraging and patient

Example 1 - User asks "Hello! How are you?":
Your response: "[PT] Olá! Estou muito bem, obrigado por perguntar! Como você está hoje?
[EN] Hello! I am doing very well, thank you for asking! How are you today?"

Example 2 - User asks "how do you say dark sky in English?":
Your response: "[PT] 'Céu escuro' em inglês é 'dark sky'. Note que em inglês o adjetivo vem antes do substantivo.
[EN] 'Dark sky' - Remember: adjective + noun. Example: 'The dark sky looks beautiful tonight.'"

NOW respond to the user's message following this EXACT format with [PT] and [EN] tags.`;

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

      let aiResponse = (String(response.choices[0]?.message?.content ?? ""))?.trim() || "I understand. Please continue.";
      
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

      // Fallback: Se resposta não tem formato bilíngue, traduzir e formatar
      if (!aiResponse.includes("[PT]") || !aiResponse.includes("[EN]")) {
        console.log("[Bilingual Conversation] Response missing bilingual format, applying fallback...");
        
        // Traduzir resposta para português
        const translationResponse = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "You are a translator. Translate the following English text to Portuguese. Return ONLY the Portuguese translation, nothing else."
            },
            {
              role: "user",
              content: aiResponse
            }
          ]
        });
        
        const portugueseVersion = (String(translationResponse.choices[0]?.message?.content ?? "")).trim() || aiResponse;
        
        // Formatar como bilíngue
        aiResponse = `[PT] ${portugueseVersion}\n[EN] ${aiResponse}`;
        console.log("[Bilingual Conversation] Formatted response:", aiResponse);
      }

      const outputSafety = await assessConversationText(ctx.user.id, aiResponse, input.targetLanguage);
      if (!outputSafety.allowed) {
        aiResponse = "[PT] Vamos continuar com uma frase segura da lição.\n[EN] Let us continue with a safe lesson sentence.";
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
      
      let suggestions = ["Yes", "No", "Tell me more"];
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
        
        // Retornar resposta de fallback em vez de lançar erro
        return {
          response: "[PT] Desculpe, tive um problema técnico. Pode repetir?\n[EN] Sorry, I had a technical issue. Can you repeat?",
          suggestions: ["Yes", "No", "Tell me more"],
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
          suggestions: "[PT] Escolha uma frase segura da lição para praticar.\n[EN] Choose a safe lesson phrase to practise.",
          originalPhrase: input.originalPhrase,
          editType: input.editType,
          blocked: true,
        };
      }
      let prompt = "";

      switch (input.editType) {
        case "modify_word":
          prompt = `The user wants to modify the word "${input.wordToModify}" in this ${input.targetLanguage} phrase: "${input.originalPhrase}"

Provide 3 alternative words that could replace "${input.wordToModify}" and make sense in context.

Format your response as:
[PT] Palavra original: "${input.wordToModify}"
Alternativas:
1. [word1] - [Portuguese meaning]
2. [word2] - [Portuguese meaning]
3. [word3] - [Portuguese meaning]

[${input.targetLanguage.substring(0, 2).toUpperCase()}] Original word: "${input.wordToModify}"
Alternatives:
1. [word1] - [English meaning]
2. [word2] - [English meaning]
3. [word3] - [English meaning]`;
          break;

        case "add_word":
          prompt = `The user wants to add a word to this ${input.targetLanguage} phrase: "${input.originalPhrase}"

Suggest 3 words that could be naturally added to enhance this phrase, with their placement.

Format:
[PT] Sugestões para adicionar:
1. [word1] → "new phrase with word1" (significado)
2. [word2] → "new phrase with word2" (significado)
3. [word3] → "new phrase with word3" (significado)

[${input.targetLanguage.substring(0, 2).toUpperCase()}] Suggestions to add:
1. [word1] → "new phrase with word1" (meaning)
2. [word2] → "new phrase with word2" (meaning)
3. [word3] → "new phrase with word3" (meaning)`;
          break;

        case "translate":
          prompt = `Translate this phrase to both ${input.nativeLanguage} and ${input.targetLanguage}:
"${input.originalPhrase}"

Also provide word-by-word breakdown.

Format:
[PT] Tradução: [translation]
Palavra por palavra: [word1] = [meaning1], [word2] = [meaning2]...

[${input.targetLanguage.substring(0, 2).toUpperCase()}] Translation: [translation]
Word by word: [word1] = [meaning1], [word2] = [meaning2]...`;
          break;

        case "improve":
          prompt = `Improve this ${input.targetLanguage} phrase: "${input.originalPhrase}"

Provide 3 improved versions with explanations in both languages.

Format:
[PT] Versões melhoradas:
1. "[improved1]" - (por quê é melhor)
2. "[improved2]" - (por quê é melhor)
3. "[improved3]" - (por quê é melhor)

[${input.targetLanguage.substring(0, 2).toUpperCase()}] Improved versions:
1. "[improved1]" - (why it's better)
2. "[improved2]" - (why it's better)
3. "[improved3]" - (why it's better)`;
          break;
      }

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
  translateRealtime: publicProcedure
    .input(
      z.object({
        text: z.string(),
        fromLanguage: z.string(),
        toLanguage: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      if (!input.text.trim()) {
        return {
          translation: "",
          wordByWord: [],
        };
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
