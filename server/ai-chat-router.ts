import { z } from 'zod';
import { protectedProcedure, router } from './_core/trpc';
import { invokeLLM } from './_core/llm';
import { TRPCError } from '@trpc/server';
import { getUserSafetyContext, moderateAIResponse } from './content-moderation';
import { checkContent } from './contentFilter';

/**
 * Router para chatbot IA conversacional
 * Pratica vocabulário, corrige gramática e fornece feedback inteligente
 */
export const aiChatRouter = router({
  /**
   * Chat conversacional com IA
   * Contexto: vocabulário da lição + correção gramatical
   */
  chat: protectedProcedure
    .input(
      z.object({
        lessonId: z.number(),
        message: z.string(),
        vocabulary: z.array(z.string()),
        languageCode: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { message, vocabulary, languageCode } = input;
      const safety = await getUserSafetyContext(ctx.user.id);
      if (safety.context.ageGroup === 'infantil' && !safety.hasParentalConsent) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'É necessário consentimento do responsável para liberar conversas infantis.' });
      }
      const deterministicInput = await checkContent(message, languageCode.split('-')[0]);
      if (deterministicInput.isBlocked) {
        return {
          message: 'Essa mensagem não pode ser usada neste perfil. Escolha uma palavra segura da lição para continuar.',
          corrections: [],
          blocked: true,
          flaggedContent: deterministicInput.matchedPatterns,
        };
      }
      const inputModeration = await moderateAIResponse(safety.context, message, message);
      if (!inputModeration.isAllowed) {
        return {
          message: 'Vamos manter a conversa segura e focada na lição. Escolha uma palavra do vocabulário para continuar.',
          corrections: [],
          blocked: true,
          flaggedContent: inputModeration.flaggedContent,
        };
      }

      // Prompt para IA com contexto da lição
      const systemPrompt = `You are a friendly English teacher helping a student practice conversation.

**Lesson Vocabulary**: ${vocabulary.join(', ')}

**Your role**:
1. Respond naturally to the student's message
2. If they make grammar mistakes, gently correct them
3. Encourage them to use the lesson vocabulary
4. Keep responses short (2-3 sentences max)
5. Be supportive and encouraging
6. If they use vocabulary words correctly, praise them

**Example corrections**:
- Student: "I go to school yesterday"
  You: "Great! Just a small correction: 'I *went* to school yesterday' (past tense). Well done! 😊"

- Student: "The sky are blue"
  You: "Good try! Remember: 'The sky *is* blue' (singular). Keep practicing!"

**Important**: Always respond in English, even if the student writes in Portuguese.`;

      try {
        const response = await invokeLLM({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message },
          ],
        });

        const rawAiMessage = response.choices[0]?.message?.content || 
          "I'm sorry, I didn't understand. Can you try again?";
        const deterministicOutput = await checkContent(String(rawAiMessage), languageCode.split('-')[0]);
        const outputModeration = await moderateAIResponse(safety.context, String(rawAiMessage), message);
        const aiMessage = !deterministicOutput.isBlocked && outputModeration.isAllowed
          ? (outputModeration.reformulatedResponse || String(rawAiMessage))
          : 'Let us continue with a safe lesson topic. Please choose one of the lesson words.';

        return {
          message: aiMessage,
          corrections: [], // TODO: Extrair correções específicas
          blocked: deterministicOutput.isBlocked || !outputModeration.isAllowed,
          flaggedContent: deterministicOutput.isBlocked ? deterministicOutput.matchedPatterns : outputModeration.flaggedContent,
        };
      } catch (error) {
        console.error('[AI Chat] Erro:', error);
        return {
          message: "I'm having trouble right now. Please try again in a moment.",
          corrections: [],
        };
      }
    }),

  /**
   * Análise de gramática e sugestões
   */
  analyzeGrammar: protectedProcedure
    .input(
      z.object({
        text: z.string(),
        languageCode: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { text, languageCode } = input;
      const safety = await getUserSafetyContext(ctx.user.id);
      if (safety.context.ageGroup === 'infantil' && !safety.hasParentalConsent) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'É necessário consentimento do responsável para liberar conversas infantis.' });
      }
      const deterministicInput = await checkContent(text, languageCode.split('-')[0]);
      if (deterministicInput.isBlocked) {
        return {
          hasErrors: false,
          errors: [],
          correctedText: '',
          feedback: 'Este conteúdo não pode ser analisado neste perfil. Escolha uma frase segura da lição.',
          blocked: true,
        };
      }
      const inputModeration = await moderateAIResponse(safety.context, text, text);
      if (!inputModeration.isAllowed) {
        return {
          hasErrors: false,
          errors: [],
          correctedText: '',
          feedback: 'Este conteúdo não pode ser analisado neste perfil. Escolha uma frase segura da lição.',
          blocked: true,
        };
      }

      const languageName = new Intl.DisplayNames(["en"], { type: "language" })
        .of(languageCode.split("-")[0]) || languageCode;

      const systemPrompt = `You are a ${languageName} grammar expert. Analyze the following ${languageName} text and provide:
1. Grammar errors (if any)
2. Suggestions for improvement
3. Corrected version

Format your response as JSON:
{
  "hasErrors": boolean,
  "errors": [{ "original": "...", "corrected": "...", "explanation": "..." }],
  "correctedText": "...",
  "feedback": "..."
}`;

      try {
        const response = await invokeLLM({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: text },
          ],
          response_format: {
            type: 'json_schema',
            json_schema: {
              name: 'grammar_analysis',
              strict: true,
              schema: {
                type: 'object',
                properties: {
                  hasErrors: { type: 'boolean' },
                  errors: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        original: { type: 'string' },
                        corrected: { type: 'string' },
                        explanation: { type: 'string' },
                      },
                      required: ['original', 'corrected', 'explanation'],
                      additionalProperties: false,
                    },
                  },
                  correctedText: { type: 'string' },
                  feedback: { type: 'string' },
                },
                required: ['hasErrors', 'errors', 'correctedText', 'feedback'],
                additionalProperties: false,
              },
            },
          },
        });

        const analysis = JSON.parse((response.choices[0]?.message?.content as string) || '{}');
        return analysis;
      } catch (error) {
        console.error('[Grammar Analysis] Erro:', error);
        return {
          hasErrors: false,
          errors: [],
          correctedText: text,
          feedback: 'Unable to analyze grammar at this time.',
        };
      }
    }),
});
