import { z } from 'zod';
import { publicProcedure, router } from './_core/trpc';
import { invokeLLM } from './_core/llm';

/**
 * Router para chatbot IA conversacional
 * Pratica vocabulário, corrige gramática e fornece feedback inteligente
 */
export const aiChatRouter = router({
  /**
   * Chat conversacional com IA
   * Contexto: vocabulário da lição + correção gramatical
   */
  chat: publicProcedure
    .input(
      z.object({
        lessonId: z.number(),
        message: z.string(),
        vocabulary: z.array(z.string()),
        languageCode: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { message, vocabulary, languageCode } = input;

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

        const aiMessage = response.choices[0]?.message?.content || 
          "I'm sorry, I didn't understand. Can you try again?";

        return {
          message: aiMessage,
          corrections: [], // TODO: Extrair correções específicas
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
  analyzeGrammar: publicProcedure
    .input(
      z.object({
        text: z.string(),
        languageCode: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { text, languageCode } = input;

      const systemPrompt = `You are a grammar expert. Analyze the following English text and provide:
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
