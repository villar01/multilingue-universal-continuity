import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { textToSpeech, batchTextToSpeech, listAvailableVoices, getTTSUsage } from "./_core/tts";
import { speechToText, analyzePronunciation, batchSpeechToText } from "./_core/stt";
import { generateConversationStarter, continueConversation, provideFeedback, generateConversationPrompts, type ConversationContext, type ConversationMessage } from "./_core/conversationalAI";
import { generateLesson, generateExercises } from "./_core/lessonGenerator";
import { sql } from "drizzle-orm";
import * as db from "./db";
import { createCheckoutSession } from "./stripe-checkout";
import { createPixPayment, checkPixPaymentStatus } from "./pagbank-pix";
import { moderationRouter } from "./moderation-router";
import { vipAccessRouter } from "./vip-access-router";
import { aiChatRouter } from './ai-chat-router';
import { downloadsRouter } from './downloads-router';
import { certificateRouter } from './certificate-router';
import { advancedTTSRouter } from './advanced-tts-router';
import { gamificationRouter } from './gamification-router';
import { autoImprovementRouter } from './auto-improvement-router';
import { precisionClipsRouter } from './precision-clips-router';
import { bilingualConversationRouter } from './bilingual-conversation-router';
import { animatePortrait, animatePortraitWithText, checkLivePortraitHealth } from './_core/liveportrait';
import { clipsRouter } from './routers-clips';
import { generateAI, generateAIBatch, getProvidersStatus } from './aiProvider';
import { sigaRouter } from './siga-router';
import { crmRouter } from './crm-router';
import { adventureRouter } from './adventure-router';
import { translateRouter } from './translate-router';
import { musetalKRouter } from './musetalk-router';
import { voiceRouter } from './routers-tts';
import { synthesizeEdgeTTS, resolveVoice } from './edge-tts';
import { integratedFeaturesRouter } from './integrated-features';
import { AISafetyAccessError } from './content-moderation';
import { referralRouter } from './referral-system';
import { gamificationUIRouter } from './gamification-ui-integration';
import { complianceRouter } from './compliance-router';
import { updatesRouter } from './updates-router';
import { controlCenterRouter } from './control-center-router';
import { liveTeacherRouter } from './live-teacher-router';
import { parentalControlRouter } from './parental-control-router';
import { immersiveSceneTutorRouter } from './immersive-scene-tutor-router';
import { customerSupportRouter } from './customer-support-router';
import { filterLessonsForEntitlement, getAuthorizedTrialLessonIds, getLearningContentEntitlement, trialAccessRouter } from './trial-access-router';
import { curriculumRouter } from './curriculum-router';
import { checkContent, sanitizeContent, logInteraction } from './contentFilter';
import { getTeacherVoiceCoverage } from './teacherVoiceCoverage';
import { assessConversationOutput, assessConversationText, ensureConversationAccess } from './conversationSafetyGate';

const financeAdminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Apenas administradores podem acessar o painel financeiro' });
  }
  return next();
});

type BattleQuizQuestion = { question: string; options: string[]; correct: number; word: string };

async function createBattleQuiz(input: {
  targetLanguage: string;
  nativeLanguage: string;
  cefrLevel: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  category: string;
  count: number;
}): Promise<BattleQuizQuestion[]> {
  const { invokeLLM } = await import("./_core/llm");
  const res = await invokeLLM({
    messages: [
      { role: "system", content: "You are a language quiz generator. Return JSON only." },
      { role: "user", content: `Generate ${input.count} multiple-choice vocabulary quiz questions for CEFR ${input.cefrLevel} learners of ${input.targetLanguage}, category: ${input.category}. Write the question in ${input.nativeLanguage}; keep the target-language word and answer options in ${input.targetLanguage}. Return JSON array: [{question, options:[4 strings], correct:0-3, word}]` }
    ],
    response_format: { type: "json_schema", json_schema: { name: "quiz", strict: true, schema: { type: "object", properties: { questions: { type: "array", items: { type: "object", properties: { question: {type:"string"}, options: {type:"array", items:{type:"string"}}, correct: {type:"integer"}, word: {type:"string"} }, required:["question","options","correct","word"], additionalProperties: false } } }, required: ["questions"], additionalProperties: false } } }
  });
  const parsed = JSON.parse(typeof res.choices[0].message.content === "string" ? res.choices[0].message.content : "{}");
  const questions = Array.isArray(parsed.questions) ? parsed.questions as BattleQuizQuestion[] : [];
  if (questions.length !== input.count) {
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Não foi possível preparar perguntas suficientes para a sala" });
  }
  return questions;
}

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  moderation: moderationRouter,
  vipAccess: vipAccessRouter,
  aiChat: aiChatRouter,
  downloads: downloadsRouter,
  certificate: certificateRouter,
  advancedTTS: advancedTTSRouter,
  gamification: gamificationRouter,
  gamificationUI: gamificationUIRouter,
  autoImprovement: autoImprovementRouter,
  precisionClips: precisionClipsRouter,
  bilingualConversation: bilingualConversationRouter,
  clips: clipsRouter,
  siga: sigaRouter,
  crm: crmRouter,
  adventure: adventureRouter,
  translate: translateRouter,
  musetalk: musetalKRouter,
  voice: voiceRouter,
  curriculum: curriculumRouter,
  sceneDialogueVoice: router({
    speak: publicProcedure
      .input(z.object({
        text: z.string().trim().min(1).max(500),
        language: z.string().min(2).max(10),
        gender: z.enum(["male", "female"]),
      }))
      .mutation(async ({ input }) => {
        try {
          const audio = await synthesizeEdgeTTS(input.text, input.language, undefined, input.gender);
          if (!audio.audioBase64.trim()) {
            throw new Error("A síntese neural retornou áudio vazio.");
          }
          return { success: true, ...audio };
        } catch (error) {
          console.warn("[Scene dialogue voice] Edge synthesis unavailable", error);
          return { success: false, error: "Voz neural da cena indisponível." };
        }
      }),
  }),
  features: integratedFeaturesRouter,
  referral: referralRouter,
  compliance: complianceRouter,
  updates: updatesRouter,
  controlCenter: controlCenterRouter,
  liveTeacher: liveTeacherRouter,
  parentalControl: parentalControlRouter,
  customerSupport: customerSupportRouter,
  trialAccess: trialAccessRouter,
  immersiveSceneTutor: immersiveSceneTutorRouter,
  offlineAI: router({
    generate: protectedProcedure
      .input(z.object({
        messages: z.array(z.object({
          role: z.enum(["system", "user", "assistant"]),
          content: z.string(),
        })),
        temperature: z.number().optional(),
        max_tokens: z.number().optional(),
        preferredProvider: z.enum(["ollama", "lmstudio"]).optional(),
        useCache: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await generateAI({
          ...input,
          userId: ctx.user.id,
        });
        return result;
      }),
    generateBatch: protectedProcedure
      .input(z.object({
        requests: z.array(z.object({
          messages: z.array(z.object({
            role: z.enum(["system", "user", "assistant"]),
            content: z.string(),
          })),
          temperature: z.number().optional(),
          max_tokens: z.number().optional(),
          preferredProvider: z.enum(["ollama", "lmstudio"]).optional(),
          useCache: z.boolean().optional(),
        })).min(1).max(8),
      }))
      .mutation(async ({ input, ctx }) => {
        return generateAIBatch(
          input.requests.map((request) => ({ ...request, userId: ctx.user.id })),
          2,
        );
      }),
    getStatus: protectedProcedure
      .query(async () => {
        const status = await getProvidersStatus();
        return status;
      }),
  }),
  adaptiveLearning: router({
    recordPedagogicalAttempt: protectedProcedure
      .input(z.object({
        lessonId: z.number().int().positive(),
        exerciseType: z.string().trim().min(1).max(80),
        cefrLevel: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]),
        correct: z.boolean(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!input.correct) {
          await db.recordErrorPattern({
            userId: ctx.user.id,
            errorType: `pedagogical:${input.lessonId}:${input.exerciseType}`,
            errorCategory: `cefr:${input.cefrLevel}`,
            severity: 1,
          });
        }

        return {
          recorded: !input.correct,
          correctiveRetryRecommended: !input.correct,
        };
      }),
  }),
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    updateProfile: protectedProcedure
      .input(z.object({
        nativeLanguage: z.string().optional(),
        targetLanguageId: z.number().optional(),
        learningGoal: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const database = await db.getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB unavailable' });
        const { users } = await import('../drizzle/schema');
        const { eq } = await import('drizzle-orm');
        const updateData: Record<string, unknown> = {};
        if (input.nativeLanguage !== undefined) updateData.nativeLanguage = input.nativeLanguage;
        if (input.targetLanguageId !== undefined) updateData.targetLanguageId = input.targetLanguageId;
        if (input.learningGoal !== undefined) updateData.learningGoal = input.learningGoal;
        if (Object.keys(updateData).length > 0) {
          await database.update(users).set(updateData).where(eq(users.id, ctx.user.id));
        }
        return { success: true, nativeLanguage: input.nativeLanguage, targetLanguageId: input.targetLanguageId };
      }),
    saveAvatar: protectedProcedure
      .input(z.object({ avatarId: z.string().max(50) }))
      .mutation(async ({ input, ctx }) => {
        const database = await db.getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB unavailable' });
        const { users } = await import('../drizzle/schema');
        const { eq } = await import('drizzle-orm');
        await database.update(users).set({ selectedAvatar: input.avatarId }).where(eq(users.id, ctx.user.id));
        return { success: true, selectedAvatar: input.avatarId };
      }),
    savePreferredTeacher: protectedProcedure
      .input(z.object({ teacherId: z.number().int().positive() }))
      .mutation(async ({ input, ctx }) => {
        const database = await db.getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB unavailable' });
        const { users } = await import('../drizzle/schema');
        const { eq } = await import('drizzle-orm');
        await database.update(users).set({ preferredTeacherId: input.teacherId }).where(eq(users.id, ctx.user.id));
        return { success: true, teacherId: input.teacherId };
      }),
    getPreferredTeacher: protectedProcedure
      .query(async ({ ctx }) => {
        const database = await db.getDb();
        if (!database) return null;
        const { users, virtualTeachers } = await import('../drizzle/schema');
        const { eq } = await import('drizzle-orm');
        const [user] = await database.select({ preferredTeacherId: users.preferredTeacherId }).from(users).where(eq(users.id, ctx.user.id)).limit(1);
        if (!user?.preferredTeacherId) return null;
        const [teacher] = await database.select().from(virtualTeachers).where(eq(virtualTeachers.id, user.preferredTeacherId)).limit(1);
        return teacher || null;
      }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Cache management
  cache: router({
    clear: protectedProcedure
      .mutation(async () => {
        const { cache } = await import('./cache');
        cache.clear();
        return { success: true, message: 'Cache limpo com sucesso' };
      }),
    stats: protectedProcedure
      .query(async () => {
        const { cache } = await import('./cache');
        return cache.getStats();
      }),
  }),

  // Pagamentos Stripe
  payment: router({
    createCheckout: protectedProcedure
      .input(z.object({
        plan: z.enum(["MONTHLY", "ANNUAL"])
      }))
      .mutation(async ({ input, ctx }) => {
        const checkoutUrl = await createCheckoutSession(
          input.plan,
          ctx.user.id.toString(),
          ctx.user.email || "",
          ctx.user.name || "User",
          ctx.req.headers.origin || "http://localhost:3000"
        );
        return { checkoutUrl };
      }),
    
    createPixPayment: protectedProcedure
      .input(z.object({
        plan: z.enum(["MONTHLY", "ANNUAL"]),
        amount: z.number() // em centavos
      }))
      .mutation(async ({ input, ctx }) => {
        const pixData = await createPixPayment({
          amount: input.amount,
          description: `MultiLingue ${input.plan}`,
          userId: ctx.user.id.toString(),
          userEmail: ctx.user.email || "",
          userName: ctx.user.name || "User"
        });
        return pixData;
      }),
    
    checkPixStatus: protectedProcedure
      .input(z.object({ orderId: z.string() }))
      .query(async ({ input }) => {
        return await checkPixPaymentStatus(input.orderId);
      }),
  }),

  // Voz Natural (Text-to-Speech)
  tts: router({
    // Gerar áudio a partir de texto
    generate: publicProcedure
      .input(
        z.object({
          text: z.string().min(1).max(5000),
          languageCode: z.string(),
          voiceGender: z.enum(["MALE", "FEMALE", "NEUTRAL"]).optional(),
          speakingRate: z.number().min(0.25).max(4).optional(),
          pitch: z.number().min(-20).max(20).optional(),
        })
      )
      .mutation(async ({ input }) => {
        return await textToSpeech(input);
      }),

    // Gerar múltiplos áudios em lote
    batchGenerate: publicProcedure
      .input(
        z.object({
          items: z.array(
            z.object({
              text: z.string(),
              languageCode: z.string(),
              id: z.string().optional(),
            })
          ),
        })
      )
      .mutation(async ({ input }) => {
        return await batchTextToSpeech(input.items);
      }),

    // Listar vozes disponíveis
    listVoices: publicProcedure.query(async () => {
      return await listAvailableVoices();
    }),

    // Obter informações de uso
    getUsage: publicProcedure.query(async () => {
      return await getTTSUsage();
    }),

    // Alias para gerar áudio (usado pelo ClickableWord)
    generateAudio: publicProcedure
      .input(
        z.object({
          text: z.string().min(1).max(5000),
          languageCode: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const result = await textToSpeech({
          text: input.text,
          languageCode: input.languageCode,
        });
        return { audioUrl: result.audioUrl };
      }),

    // ─── Edge TTS: voz neural Microsoft de alta qualidade ───────────────
    speak: protectedProcedure
      .input(z.object({
        text: z.string().min(1).max(2000),
        voiceLang: z.string().min(2).max(10),
        gender: z.enum(['male', 'female']).optional().default('female'),
      }))
      .mutation(async ({ input }) => {
        try {
          const result = await synthesizeEdgeTTS(input.text, input.voiceLang, undefined, input.gender);
          return {
            success: true,
            audioBase64: result.audioBase64,
            mimeType: result.mimeType,
            durationMs: result.durationEstimateMs,
            voice: result.voice,
            cached: result.cached ?? false,
          };
        } catch (err) {
          return {
            success: false,
            audioBase64: "",
            mimeType: "audio/mp3" as const,
            durationMs: 0,
            voice: resolveVoice(input.voiceLang, input.gender),
            cached: false,
            error: err instanceof Error ? err.message : "TTS error",
          };
        }
      }),
  }),

  // Reconhecimento de Voz (Speech-to-Text)
  stt: router({
    // Transcrever áudio para texto
    transcribe: publicProcedure
      .input(
        z.object({
          audioUrl: z.string().url(),
          languageCode: z.string(),
          prompt: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return await speechToText(input);
      }),

    // Analisar pronúncia
    analyzePronunciation: publicProcedure
      .input(
        z.object({
          audioUrl: z.string().url(),
          expectedText: z.string(),
          languageCode: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        return await analyzePronunciation(
          input.audioUrl,
          input.expectedText,
          input.languageCode
        );
      }),

    // Transcrever múltiplos áudios em lote
    batchTranscribe: publicProcedure
      .input(
        z.object({
          items: z.array(
            z.object({
              audioUrl: z.string().url(),
              languageCode: z.string(),
              id: z.string().optional(),
            })
          ),
        })
      )
      .mutation(async ({ input }) => {
        return await batchSpeechToText(input.items);
      }),
  }),

  // Idiomas
  languages: router({
    // Listar todos os idiomas disponíveis
    list: publicProcedure.query(async () => {
      return await db.getAllLanguages();
    }),

    // Obter idioma por código
    getByCode: publicProcedure
      .input(z.object({ code: z.string() }))
      .query(async ({ input }) => {
        return await db.getLanguageByCode(input.code);
      }),
  }),

  // Pagamentos PagBank PIX
  paymentPagBank: router({
    // Criar pedido PIX
    createPixOrder: protectedProcedure
      .input(
        z.object({
          plan: z.enum(["monthly", "annual", "lifetime"]),
          customerPhone: z.string().regex(/^\d{10,11}$/), // 10 ou 11 dígitos
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { pagBankService } = await import("./_core/pagbank");
        
        // Definir valores dos planos
        const planPrices = {
          monthly: 5900, // R$ 59,00
          annual: 59000, // R$ 590,00 (2 meses grátis)
          lifetime: 106200, // R$ 1.062,00 (1 ano e meio = 18 meses)
        };
        
        const planNames = {
          monthly: "MultiLingue Universal - Plano Mensal",
          annual: "MultiLingue Universal - Plano Anual",
          lifetime: "MultiLingue Universal - Plano Vitalício",
        };
        
        const amount = planPrices[input.plan];
        const description = planNames[input.plan];
        
        // Criar pedido PIX
        const order = await pagBankService.createPixOrder({
          referenceId: `ML-${ctx.user.id}-${Date.now()}`,
          customerName: ctx.user.name || "Cliente",
          customerEmail: ctx.user.email || "cliente@example.com",
          customerTaxId: "00000000000", // TODO: Coletar CPF do usuário
          customerPhone: input.customerPhone,
          amount,
          description,
          notificationUrl: `${process.env.VITE_FRONTEND_FORGE_API_URL}/api/payment/webhook`,
        });
        
        // Salvar pedido no banco de dados
        // TODO: Criar tabela de pedidos
        
        return {
          orderId: order.id,
          qrCodeText: order.qrCodes[0].text,
          qrCodeImage: order.qrCodes[0].links.find((l) => l.media === "image/png")?.href,
          amount,
          expiresIn: 24 * 60 * 60 * 1000, // 24 horas em ms
        };
      }),
    
    // Verificar status do pagamento
    checkPaymentStatus: protectedProcedure
      .input(
        z.object({
          orderId: z.string(),
        })
      )
      .query(async ({ input }) => {
        const { pagBankService } = await import("./_core/pagbank");
        
        const status = await pagBankService.getOrderStatus(input.orderId);
        
        // Se pago, atualizar assinatura do usuário
        // TODO: Implementar lógica de upgrade
        
        return status;
      }),
    
    // Webhook do PagBank (chamado automaticamente após pagamento)
    webhook: publicProcedure
      .input(
        z.object({
          notificationCode: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const { pagBankService } = await import("./_core/pagbank");
        
        // Verificar notificação
        const notification = await pagBankService.verifyWebhook(input.notificationCode);
        
        // TODO: Processar pagamento e atualizar assinatura
        
        return { success: true };
      }),
  }),

  // Notificações
  notifications: router({
    // Buscar notificações do usuário
    getUserNotifications: protectedProcedure
      .input(
        z.object({
          limit: z.number().optional().default(20),
        }).optional()
      )
      .query(async ({ ctx, input }) => {
        const limit = input?.limit || 20;
        return await db.getUserNotifications(ctx.user.id, limit);
      }),

    // Contar notificações não lidas
    getUnreadCount: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getUnreadNotificationsCount(ctx.user.id);
      }),

    // Marcar notificação como lida
    markAsRead: protectedProcedure
      .input(
        z.object({
          notificationId: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        await db.markNotificationAsRead(input.notificationId);
        return { success: true };
      }),

    // Marcar todas como lidas
    markAllAsRead: protectedProcedure
      .mutation(async ({ ctx }) => {
        await db.markAllNotificationsAsRead(ctx.user.id);
        return { success: true };
      }),

    // Notificar sobre nova lição (admin only)
    notifyNewLesson: protectedProcedure
      .input(
        z.object({
          lessonId: z.number(),
          lessonTitle: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Verificar se é admin
        if (ctx.user.role !== "admin") {
          throw new Error("Apenas administradores podem enviar notificações");
        }
        
        const count = await db.notifyNewLesson(input.lessonId, input.lessonTitle);
        return { success: true, notifiedCount: count };
      }),
  }),

  // IA Avançada (GPT-4)
  ai: router({    // Conversação inteligente
    chat: protectedProcedure
      .input(
        z.object({
          message: z.string(),
          languageCode: z.string(),
          conversationHistory: z.array(
            z.object({
              role: z.enum(["system", "user", "assistant"]),
              content: z.string(),
            })
          ).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { generateConversation } = await import("./_core/ai");
        try {
          const response = await generateConversation(
            {
              userId: ctx.user.id,
              languageCode: input.languageCode,
              userLevel: "A2", // TODO: calcular baseado no progresso
            },
            input.message,
            input.conversationHistory || []
          );
          return { response };
        } catch (error) {
          if (error instanceof AISafetyAccessError) throw new TRPCError({ code: "FORBIDDEN", message: error.message });
          throw error;
        }
      }),

    // Gerar exercício personalizado
    generateExercise: protectedProcedure
      .input(
        z.object({
          languageCode: z.string(),
          topic: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { generatePersonalizedExercise } = await import("./_core/ai");
        try {
          return await generatePersonalizedExercise({
            userId: ctx.user.id,
            languageCode: input.languageCode,
            userLevel: "A2",
          }, input.topic);
        } catch (error) {
          if (error instanceof AISafetyAccessError) throw new TRPCError({ code: "FORBIDDEN", message: error.message });
          throw error;
        }
      }),

    // Explicar gramática
    explainGrammar: protectedProcedure
      .input(
        z.object({
          languageCode: z.string(),
          topic: z.string(),
          question: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { explainGrammar } = await import("./_core/ai");
        try {
          const explanation = await explainGrammar(
            {
              userId: ctx.user.id,
              languageCode: input.languageCode,
              userLevel: "A2",
            },
            input.topic,
            input.question
          );
          return { explanation };
        } catch (error) {
          if (error instanceof AISafetyAccessError) throw new TRPCError({ code: "FORBIDDEN", message: error.message });
          throw error;
        }
      }),

    // Traduzir palavra
    translateWord: protectedProcedure
      .input(
        z.object({
          word: z.string(),
          fromLanguage: z.string(),
          toLanguage: z.string().default('pt'),
        })
      )
      .mutation(async ({ input }) => {
        const { invokeLLM } = await import("./_core/llm");
        
        try {
          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: `You are a translator. Translate the word from ${input.fromLanguage} to ${input.toLanguage}. Return ONLY the translation, nothing else. If it's a phrase, translate the whole phrase.`
              },
              {
                role: "user",
                content: input.word
              }
            ]
          });
          
          let translation = (response.choices[0]?.message?.content as string)?.trim() || input.word;
          // Content filter: sanitize translation
          translation = await sanitizeContent(translation, input.fromLanguage) || translation;
          return { translation };
        } catch (error) {
          console.error('Translation error:', error);
          return { translation: input.word };
        }
      }),

    // Gerar conteúdo completo de aula (vocabulário, diálogo, exercícios)
    generateLessonContent: protectedProcedure
      .input(
        z.object({
          lessonTitle: z.string(),
          lessonDescription: z.string().optional().default(''),
          languageCode: z.string(),
          nativeLanguage: z.string().optional().default('pt'),
          level: z.string().optional().default('beginner'),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { invokeLLM } = await import("./_core/llm");
        const { getPhaseFromLevel, getPhaseConfig, buildPedagogicalPrompt } = await import("./_core/pedagogicalLevels");
        const { buildLanguageLogicPrompt } = await import("./_core/languageLogic");
        const lang = input.languageCode.split('-')[0].toUpperCase();
        const native = input.nativeLanguage === 'pt' ? 'Portuguese (Brazilian)' : input.nativeLanguage;
        const phase = getPhaseFromLevel(input.level);
        const phaseConfig = getPhaseConfig(phase);
        const pedagogicalPrompt = buildPedagogicalPrompt(phase, lang, native, input.lessonTitle);
        const langLogicPrompt = buildLanguageLogicPrompt(input.languageCode, lang, native, phase);
        const errorPatterns = await db.getUserErrorPatterns(ctx.user.id);
        const weakExerciseTypes = errorPatterns
          .filter((pattern: any) => typeof pattern.errorType === "string" && pattern.errorType.startsWith("pedagogical:"))
          .slice(0, 3)
          .map((pattern: any) => pattern.errorType.split(":").at(-1))
          .filter((value): value is string => Boolean(value));
        const adaptationPrompt = weakExerciseTypes.length > 0
          ? `\n\nADAPTATION: The learner recently struggled with these exercise formats: ${weakExerciseTypes.join(", ")}. Include one additional gentle, vocabulary-only reinforcement exercise for these formats. Do not introduce vocabulary outside this lesson or exceed the CEFR complexity.`
          : "";
        const systemPrompt = pedagogicalPrompt + '\n\n' + langLogicPrompt + adaptationPrompt;
        try {
          const response = await invokeLLM({
            messages: [
              {
                role: 'system',
                content: systemPrompt + '\n\nReturn ONLY valid JSON, no markdown, no explanation.'
              },
              {
                role: 'user',
                content: `Create a complete lesson for: "${input.lessonTitle}". Phase: ${phaseConfig.label} (${phaseConfig.cefr}).

Return this exact JSON structure:
{
  "title": "lesson title",
  "phase": "${phase}",
  "cefr": "${phaseConfig.cefr}",
  "description": "brief description in ${native} — what student will learn",
  "vocabulary": [
    {
      "word": "word in ${lang}",
      "translation": "translation in ${native}",
      "phonetic": "pronunciation written as it SOUNDS in ${native} — NOT IPA symbols. CRITICAL: use CORRECT vowel sounds. Examples for English→Portuguese: 'apple' = 'Á-pol' (open A like pá — NOT épol), 'house' = 'ráus', 'cat' = 'cãt', 'dog' = 'dóg', 'water' = 'uó-ter', 'hello' = 'rê-lôu', 'good' = 'gúd', 'morning' = 'mór-ning', 'yes' = 'iés', 'no' = 'nôu', 'please' = 'plíiz', 'thank you' = 'thênk-iú'. Write how a ${native} speaker would READ it to produce the CORRECT sound.",
      "emoji": "relevant emoji",
      "example": "COMPLETE natural sentence using ONLY the current word — for ${phaseConfig.label} level. MUST be grammatically correct and natural. For Infância/A1: max 3 words, use ONLY the word being taught (e.g., 'This is an ant.' NOT 'Ant small.'). NEVER use words not yet taught.",
      "exampleTranslation": "full natural translation of the example sentence in ${native} — include meaning of ALL words used",
      "examplePhonetic": "how the full example sentence sounds in ${native} phonetic approximation (e.g., 'Dis is en ent.')",
      "imageKeyword": "2-3 words for image search"
    }
  ],
  "dialogue": [
    {"speaker": "teacher", "text": "text in ${lang} — ${phaseConfig.sentenceComplexity}", "translation": "translation in ${native}"}
  ],
  "grammar": "brief grammar note in ${native} — appropriate for ${phaseConfig.label} level",
  "grammarNote": {
    "rule": "main grammar/structure rule taught in this lesson",
    "explanation": "clear explanation in ${native} of HOW this language builds words and ideas",
    "pattern": "visual pattern showing the structure (e.g., '[Adjective] + [Noun]' or '[Verb] + [Particle]')",
    "contrast": "how this differs from Portuguese if relevant (e.g., 'Em português: gato grande. Em inglês: big cat — o adjetivo vem ANTES')",
    "languageLogic": "explain the THINKING PATTERN of this language — how native speakers build ideas mentally",
    "examples": [
      {"target": "example in ${lang}", "native": "translation in ${native}", "phonetic": "how it sounds in ${native}"}
    ]
  },
  "grammarNote": {
    "rule": "main grammar rule taught in this lesson (e.g., 'Adjective + Noun order in English')",
    "explanation": "clear explanation in ${native} of WHY and HOW this structure works",
    "pattern": "visual pattern (e.g., '[Adjective] + [Noun]: big cat, red house')",
    "contrast": "contrast with ${native} if different (e.g., 'In Portuguese: gato grande. In English: big cat — adjective comes FIRST')",
    "examples": [
      {"target": "example in ${lang}", "native": "translation in ${native}", "phonetic": "how it sounds in ${native}"}
    ]
  },
  "exercises": [
    {
      "type": "${phaseConfig.exerciseTypes[0]}",
      "question": "exercise question",
      "answer": "correct answer",
      "options": ["opt1","opt2","opt3","opt4"],
      "hint": "hint in ${native}",
      "emoji": "relevant emoji"
    }
  ],
  "readingText": "A complete reading passage (3-5 sentences) in ${lang} that uses ALL the vocabulary words in context. This text MUST use every vocabulary word at least once. Natural, grammatically correct, appropriate for ${phaseConfig.label} level.",
  "readingTextTranslation": "Full translation of the reading text in ${native}",
  "grammarNote": "Brief grammar tip in ${native} about the main structure used in the reading text",
  "realLifeContext": "1-2 sentences explaining when this is used in real life, in ${native}",
  "culturalNote": "interesting cultural fact about this topic in the target language, in ${native}"
}

Rules:
- vocabulary: exactly ${phaseConfig.wordCount} words
- CRITICAL: "word" field MUST be a FULL WORD (e.g., "apple", "cat", "house") — NEVER a single letter, never an abbreviation
- LETTER-FOCUSED LESSONS: If the lesson title is a single letter (e.g., "A", "B", "Letter A", "Letra A") OR contains a letter reference (e.g., "Words with A", "Palavras com B"), then ALL ${phaseConfig.wordCount} vocabulary words MUST start with that letter. Choose common, useful, everyday words that start with that letter. Vary the categories: animals, food, objects, actions, places.
- For Alphabet lessons: each entry = one letter + the word it represents (e.g., word: "Apple", emoji: "🍎", phonetic: "Á-pol") — ALWAYS verify correct Brazilian Portuguese phonetic approximation, never IPA
- CRITICAL: example sentences MUST be complete, grammatically correct, and natural — NEVER fragments like "Ant small." Always: "The ant is small." or "This is an ant."
- For Infância/A1: example sentences use ONLY the word being taught + basic known words (this, is, a, the, I, have). Max 4 words total.
- examplePhonetic: write how the FULL example sentence sounds in ${native} (e.g., "Di ent is smol.")
- dialogue: ${phase === 'infancia' || phase === 'crianca' ? '2-3' : '4-6'} exchanges
- exercises: 4-6 exercises using types: ${phaseConfig.exerciseTypes.join(', ')}
- CRITICAL: exercises MUST ONLY use words from the vocabulary list above. NEVER ask about words not taught in this lesson. If the lesson teaches 'apple, cat, house', exercises can only ask about 'apple', 'cat', or 'house'.
- CRITICAL: Each exercise must test a word that was taught in the vocabulary section. The answer and all options must come from the vocabulary list.
- Complexity MUST match phase: ${phaseConfig.sentenceComplexity}
- Every vocabulary word MUST have emoji and imageKeyword
- Translations MUST be in ${native}`
              }
            ],
            response_format: { type: 'json_object' }
          });
          let rawContent = response.choices[0]?.message?.content as string || '{}';
          // Content filter: sanitize raw LLM output before processing
          rawContent = await sanitizeContent(rawContent, input.languageCode) || rawContent;
          // Robust JSON cleaning: strip markdown code blocks, extract JSON object
          let cleanedContent = rawContent
            .replace(/^```(?:json)?\s*/i, '')
            .replace(/\s*```$/i, '')
            .trim();
          // If still not valid, try to extract JSON object from the text
          if (!cleanedContent.startsWith('{')) {
            const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) cleanedContent = jsonMatch[0];
          }
          if (!cleanedContent || cleanedContent === '{}') {
            throw new Error('LLM returned empty content');
          }
          const content = JSON.parse(cleanedContent);
          // Ensure exercises only use vocabulary from the lesson
          const vocabWords = (content.vocabulary || []).map((v: any) => v.word?.toLowerCase()).filter(Boolean);
          if (content.exercises && Array.isArray(content.exercises) && vocabWords.length > 0) {
            content.exercises = content.exercises.map((ex: any) => {
              if (ex.options && Array.isArray(ex.options)) {
                // Ensure the correct answer is from the vocabulary
                const answerInVocab = vocabWords.includes(ex.answer?.toLowerCase());
                if (!answerInVocab) {
                  // Replace with a vocabulary word
                  ex.answer = vocabWords[Math.floor(Math.random() * vocabWords.length)];
                  if (!ex.options.includes(ex.answer)) {
                    ex.options[0] = ex.answer;
                  }
                }
              }
              return ex;
            });
          }
          // Ensure readingText exists — if LLM didn't generate it, build from dialogue
          if (!content.readingText && content.vocabulary && content.vocabulary.length > 0) {
            content.readingText = content.dialogue?.map((d: any) => d.text).join(' ') || '';
            content.readingTextTranslation = content.dialogue?.map((d: any) => d.translation).join(' ') || '';
          }
          // Validate exercises use only vocabulary words
          if (content.exercises && Array.isArray(content.exercises) && vocabWords.length > 0) {
            content.exercises = content.exercises.filter((ex: any) => {
              const exWords = (ex.question + ' ' + (ex.options?.join(' ') || '')).toLowerCase();
              // Keep exercise if its answer is in vocabulary
              return vocabWords.includes(ex.answer?.toLowerCase());
            });
            // If all exercises were filtered out, create new ones from vocabulary
            if (content.exercises.length === 0 && vocabWords.length > 0) {
              content.exercises = vocabWords.slice(0, 4).map((w: string, i: number) => {
                const vocabItem = content.vocabulary.find((v: any) => v.word?.toLowerCase() === w);
                return {
                  type: 'multiple_choice',
                  question: `What does "${vocabItem?.word || w}" mean?`,
                  answer: vocabItem?.translation || w,
                  options: content.vocabulary.slice(0, 4).map((v: any) => v.translation),
                  hint: 'Look at the vocabulary list',
                  emoji: vocabItem?.emoji || '📝',
                };
              });
            }
          }
          return { ...content, phase, cefr: phaseConfig.cefr, phaseLabel: phaseConfig.label };
        } catch (err) {
          console.error('generateLessonContent error:', err);
          // Return minimal fallback
          return {
            title: input.lessonTitle,
            description: input.lessonDescription,
            vocabulary: [
              { word: 'hello', translation: 'olá', phonetic: 'hɛˈloʊ', example: 'Hello, how are you?' },
              { word: 'goodbye', translation: 'tchau', phonetic: 'ɡʊdˈbaɪ', example: 'Goodbye!' },
              { word: 'please', translation: 'por favor', phonetic: 'pliːz', example: 'Please help me.' },
              { word: 'thank you', translation: 'obrigado', phonetic: 'θæŋk juː', example: 'Thank you!' },
              { word: 'yes', translation: 'sim', phonetic: 'jɛs', example: 'Yes, I agree.' },
              { word: 'no', translation: 'não', phonetic: 'noʊ', example: 'No, thank you.' },
            ],
            dialogue: [
              { speaker: 'teacher', text: 'Welcome to our lesson about ' + input.lessonTitle + '!', translation: 'Bem-vindo à aula sobre ' + input.lessonTitle + '!' },
              { speaker: 'student', text: 'Hello! I am ready to learn.', translation: 'Olá! Estou pronto para aprender.' },
              { speaker: 'teacher', text: 'Excellent! Let us begin.', translation: 'Excelente! Vamos começar.' },
              { speaker: 'student', text: 'I am excited!', translation: 'Estou animado!' },
            ],
            grammar: 'Nesta aula, aprenderemos vocabulário essencial sobre "' + input.lessonTitle + '".',
            exercises: [
              { type: 'multiple_choice', question: 'What does "hello" mean?', answer: 'olá', options: ['olá', 'tchau', 'sim', 'não'], hint: 'Palavra do vocabulário', emoji: '👋' },
              { type: 'multiple_choice', question: 'What does "goodbye" mean?', answer: 'tchau', options: ['tchau', 'olá', 'por favor', 'obrigado'], hint: 'Palavra do vocabulário', emoji: '👋' },
              { type: 'multiple_choice', question: 'What does "yes" mean?', answer: 'sim', options: ['sim', 'não', 'olá', 'tchau'], hint: 'Palavra do vocabulário', emoji: '✅' },
              { type: 'multiple_choice', question: 'What does "no" mean?', answer: 'não', options: ['não', 'sim', 'olá', 'tchau'], hint: 'Palavra do vocabulário', emoji: '❌' },
            ],
            readingText: 'Hello! Goodbye. Yes. No. Please. Thank you.',
            readingTextTranslation: 'Olá! Tchau. Sim. Não. Por favor. Obrigado.',
            grammarNote: 'Estas são palavras básicas de cumprimento e resposta.',
          };
        }
      }),

    // Chat livre com professor (sem histórico de conversa, mais flexível)
    freeChat: protectedProcedure
      .input(
        z.object({
          messages: z.array(z.object({
            role: z.enum(['system', 'user', 'assistant']),
            content: z.string(),
          })),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { invokeLLM } = await import("./_core/llm");
        const safeFallback = { content: "Vamos continuar com uma frase segura de prática do idioma." };
        const userText = input.messages
          .filter((message) => message.role === "user")
          .map((message) => message.content)
          .join("\n");
        const inputSafety = await assessConversationText(ctx.user.id, userText || "Conversa livre de idioma.", "pt-BR");
        if (!inputSafety.allowed) return safeFallback;
        try {
          const response = await invokeLLM({ messages: input.messages as any[] });
          let content = response.choices[0]?.message?.content as string || 'Desculpe, não consegui processar sua mensagem.';
          // Content filter: sanitize chat response
          content = await sanitizeContent(content, 'all') || content;
          const outputSafety = await assessConversationOutput(ctx.user.id, userText || "Conversa livre de idioma.", content, "pt-BR");
          return outputSafety.allowed ? { content } : safeFallback;
        } catch (err) {
          console.error('freeChat error:', err);
          return safeFallback;
        }
      }),

    // Gerar Livro da Disciplina para uma lição
    generateLessonBook: protectedProcedure
      .input(
        z.object({
          lessonId: z.number(),
          lessonTitle: z.string(),
          languageCode: z.string(),
          nativeLanguage: z.string().default('pt'),
          level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).default('A1'),
          topic: z.string().optional(),
        })
      )
      .query(async ({ input }) => {
        try {
          const langName: Record<string, string> = {
            'en': 'English', 'en-US': 'English (American)', 'en-GB': 'English (British)',
            'fr': 'French', 'es': 'Spanish', 'de': 'German', 'it': 'Italian',
            'pt': 'Portuguese', 'pt-BR': 'Portuguese (Brazilian)', 'ja': 'Japanese',
            'zh': 'Chinese', 'ko': 'Korean', 'ru': 'Russian', 'ar': 'Arabic',
          };
          const targetLang = langName[input.languageCode] || input.languageCode;
          const nativeLang = langName[input.nativeLanguage] || 'Portuguese';
          const levelLabel: Record<'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2', string> = {
            A1: 'A1 — vocabulário concreto e frases essenciais de até seis palavras',
            A2: 'A2 — comunicação cotidiana simples com rotinas e situações familiares',
            B1: 'B1 — comunicação conectada sobre experiências e tópicos familiares',
            B2: 'B2 — exposição estruturada de temas abstratos, técnicos e comparativos',
            C1: 'C1 — expressão precisa com registro, coesão e nuance',
            C2: 'C2 — domínio refinado, especializado e culturalmente contextualizado',
          };

          const prompt = `You are an expert language teacher creating a comprehensive lesson textbook chapter.

Create a COMPLETE LESSON BOOK for:
- Lesson: "${input.lessonTitle}"
- Target Language: ${targetLang}
- Student's Native Language: ${nativeLang}
- CEFR Level: ${input.level}
- Level constraints: ${levelLabel[input.level]}
- Lesson ID: ${input.lessonId}

Return a JSON object with this EXACT structure:
{
  "title": "Lesson title",
  "subtitle": "Brief lesson description",
  "level": "${input.level}",
  "objectives": ["objective 1", "objective 2", "objective 3"],
  "introduction": "2-3 paragraph introduction in ${nativeLang} explaining what this lesson covers and why it matters",
  "grammarRules": [
    {
      "rule": "Grammar rule name",
      "explanation": "Clear explanation in ${nativeLang}",
      "structure": "[Subject] + [Verb] + [Object]",
      "examples": [
        {"target": "sentence in ${targetLang}", "native": "translation in ${nativeLang}", "phonetic": "como soa em portugu\u00eas (ex: r\u00ea-l\u00f4u para hello, mers\u00ed para merci) - sem IPA"}
      ]
    }
  ],
  "vocabulary": [
    {
      "word": "word in ${targetLang}",
      "phonetic": "como soa em portugu\u00eas (ex: r\u00ea-l\u00f4u, mers\u00ed, d\u00e2nqui, gr\u00e1sias) - NUNCA use IPA ou s\u00edmbolos fon\u00e9ticos, use letras do portugu\u00eas",
      "partOfSpeech": "noun/verb/adj",
      "definition": "definition in ${nativeLang}",
      "synonyms": ["synonym1", "synonym2"],
      "antonyms": ["antonym1"],
      "exampleSentences": [
        {"target": "example", "native": "translation"}
      ],
      "memoryTip": "mnemonic tip in ${nativeLang}"
    }
  ],
  "dialogues": [
    {
      "title": "Dialogue title",
      "context": "Context description in ${nativeLang}",
      "lines": [
        {"speaker": "Person A", "target": "sentence", "native": "translation"}
      ]
    }
  ],
  "culturalNotes": ["cultural note 1 in ${nativeLang}", "cultural note 2"],
  "commonMistakes": [
    {"mistake": "wrong usage", "correct": "correct usage", "explanation": "why in ${nativeLang}"}
  ],
  "exercises": [
    {
      "type": "fill-blank|translate|match|reorder",
      "instruction": "instruction in ${nativeLang}",
      "items": [{"question": "...", "answer": "..."}]
    }
  ],
  "summary": "Comprehensive summary in ${nativeLang} of everything learned",
  "nextSteps": "What to study next in ${nativeLang}"
}

Make vocabulary list have at least 15 words. Make grammar rules have at least 3 rules. Make dialogues have at least 2 dialogues. Be thorough and educational.

IMPORTANT: For ALL "phonetic" fields, write how the word SOUNDS in Portuguese letters (like a Brazilian would read it). CRITICAL: Always verify correct vowel sounds. Examples: "hello" = "r\u00ea-l\u00f4u", "apple" = "\u00c1-pol" (open A like p\u00e1 - NEVER \u00e9pol), "cat" = "c\u00e3t", "dog" = "d\u00f3g", "house" = "r\u00e1us", "water" = "u\u00f3-ter", "good" = "g\u00fad", "morning" = "m\u00f3r-ning", "yes" = "i\u00e9s", "no" = "n\u00f4u", "please" = "pl\u00ediz", "thank you" = "th\u00eank-i\u00fa", "school" = "sk\u00faul", "book" = "b\u00fak", "food" = "f\u00faud", "milk" = "m\u00edlk", "merci" = "mers\u00ed", "danke" = "d\u00e2nqui", "gracias" = "gr\u00e1sias", "bonjour" = "bong-jur". NEVER use IPA symbols like /h\u025b\u02c8lo\u028a/ or brackets like []. Write it as plain Portuguese syllables that a Brazilian can read and immediately know how to pronounce correctly.`;

          const { invokeLLM } = await import('./_core/llm');
          const response = await invokeLLM({
            messages: [
              { role: 'system', content: 'You are an expert language teacher. Always respond with valid JSON only, no markdown, no extra text.' },
              { role: 'user', content: prompt }
            ],
            response_format: { type: 'json_object' } as any,
          });

          let content = response.choices[0]?.message?.content as string || '{}';
          // Content filter: sanitize before parsing
          content = await sanitizeContent(content, input.languageCode) || content;
          const bookData = JSON.parse(content);
          return { success: true, book: bookData };
        } catch (err) {
          console.error('generateLessonBook error:', err);
          return { success: false, book: null, error: String(err) };
        }
      }),

    // Analisar pronúncia com IA
    analyzePronunciation: protectedProcedure
      .input(
        z.object({
          expectedText: z.string(),
          transcribedText: z.string(),
          languageCode: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { analyzePronunciation } = await import("./_core/ai");
        try {
          return await analyzePronunciation(
            input.expectedText,
            input.transcribedText,
            input.languageCode,
            ctx.user.id
          );
        } catch (error) {
          if (error instanceof AISafetyAccessError) throw new TRPCError({ code: "FORBIDDEN", message: error.message });
          throw error;
        }
      }),

    // Gerar palavras do dia para memorização
    getDailyWords: protectedProcedure
      .input(
        z.object({
          languageCode: z.string(),
          nativeLanguage: z.string().default('pt'),
          level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).default('A1'),
          count: z.number().default(15),
          topic: z.string().optional(),
        })
      )
      .query(async ({ input }) => {
        try {
          const { invokeLLM } = await import('./_core/llm');
          const langNames: Record<string, string> = {
            'en': 'English', 'en-US': 'American English', 'en-GB': 'British English',
            'fr': 'French', 'es': 'Spanish', 'de': 'German', 'it': 'Italian',
            'pt': 'Portuguese', 'pt-BR': 'Brazilian Portuguese', 'ja': 'Japanese',
            'zh': 'Chinese (Mandarin)', 'ko': 'Korean', 'ru': 'Russian', 'ar': 'Arabic',
            'nl': 'Dutch', 'pl': 'Polish', 'tr': 'Turkish', 'sv': 'Swedish',
            'da': 'Danish', 'fi': 'Finnish', 'no': 'Norwegian', 'cs': 'Czech',
            'ro': 'Romanian', 'hu': 'Hungarian', 'el': 'Greek', 'he': 'Hebrew',
            'hi': 'Hindi', 'th': 'Thai', 'vi': 'Vietnamese', 'id': 'Indonesian',
          };
          const targetLang = langNames[input.languageCode] || input.languageCode;
          const nativeLang = langNames[input.nativeLanguage] || 'Portuguese';
          const levelLabel: Record<'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2', string> = {
            A1: 'concrete, high-frequency everyday words and phrases up to six words',
            A2: 'common routine, shopping, travel, and social vocabulary in short phrases',
            B1: 'frequent conversational vocabulary with connected examples',
            B2: 'abstract, professional, and comparative vocabulary with nuanced examples',
            C1: 'precise academic, professional, and idiomatic vocabulary with register awareness',
            C2: 'specialized, culturally nuanced, and stylistically refined vocabulary',
          };

          const prompt = `Generate ${input.count} vocabulary words for daily memorization practice.

Target Language: ${targetLang}
Student Native Language: ${nativeLang}
CEFR Level: ${input.level}
Level constraints: ${levelLabel[input.level]}
${input.topic ? `Topic focus: ${input.topic}` : 'Mix of common everyday words'}

Return a JSON object with this structure:
{
  "words": [
    {
      "id": 1,
      "word": "word in ${targetLang}",
      "phonetic": "como soa em portugu\u00eas (ex: r\u00ea-l\u00f4u, mers\u00ed, d\u00e2nqui) - use letras do portugu\u00eas, NUNCA IPA ou s\u00edmbolos",
      "phoneticFigurative": "a mesma coisa escrita como um brasileiro leria (ex: 'hello' = 'r\u00ea-l\u00f4u', 'merci' = 'mers\u00ed', 'danke' = 'd\u00e2nqui')",
      "phoneticComparison": "comparação: soa como a palavra/sílaba em português: [palavra similar]",
      "partOfSpeech": "noun/verb/adjective/adverb/phrase",
      "translation": "simple direct translation in ${nativeLang}",
      "definition": "brief definition in ${nativeLang}",
      "synonyms": ["synonym1 in ${targetLang}", "synonym2"],
      "synonymsNative": ["translation of synonym1", "translation of synonym2"],
      "antonyms": ["antonym1 in ${targetLang}"],
      "antonymsNative": ["translation of antonym1"],
      "exampleSentence": "natural example sentence in ${targetLang}",
      "exampleTranslation": "translation of example in ${nativeLang}",
      "exampleWithSynonym": "same sentence but with synonym1 replacing the main word",
      "exampleWithSynonymTranslation": "translation of synonym version",
      "memoryTip": "creative mnemonic tip in ${nativeLang} to remember this word",
      "usageNote": "when/how to use this word naturally in ${nativeLang}",
      "difficulty": 1
    }
  ]
}

Make words practical and commonly used. Vary difficulty from 1-5. Include at least 2 synonyms per word.`;

          const response = await invokeLLM({
            messages: [
              { role: 'system', content: 'You are a language expert. Return valid JSON only, no markdown.' },
              { role: 'user', content: prompt }
            ],
            response_format: { type: 'json_object' } as any,
          });

          let content = response.choices[0]?.message?.content as string || '{"words":[]}';
          // Content filter: sanitize before parsing
          content = await sanitizeContent(content, input.languageCode) || content;
          const data = JSON.parse(content);
          return { success: true, words: data.words || [] };
        } catch (err) {
          console.error('getDailyWords error:', err);
          return { success: false, words: [] };
        }
      }),
  }),

  // Seed (popular banco de dados)
  seed: router({
    // Popular conteúdo massivo: 54 idiomas + 1080+ lições
    populateMassive: publicProcedure
      .mutation(async () => {
        const dbInstance = await db.getDb();
        if (!dbInstance) return { success: false, message: "Erro ao conectar ao banco" };

        const { seedMassiveContent } = await import("./seed-massive");
        const result = await seedMassiveContent(dbInstance);
        
        return result;
      }),

    // Popular lições extras (atingir 1000+)
    populateExtraLessons: publicProcedure
      .mutation(async () => {
        const dbInstance = await db.getDb();
        if (!dbInstance) return { success: false, message: "Erro ao conectar ao banco" };
        const { seedExtraLessons } = await import("./seed-extra-lessons");
        const result = await seedExtraLessons(dbInstance);
        return result;
      }),

    // Popular conquistas
    populateAchievements: publicProcedure
      .mutation(async () => {
        const allAchievements = await db.getAllAchievements();
        
        if (allAchievements.length > 0) {
          return { message: `Já existem ${allAchievements.length} conquistas no banco.`, count: allAchievements.length };
        }
        
        const achievementsData = [
          { name: "Primeiro Passo", description: "Complete sua primeira lição", icon: "🎯", category: "lessons", requirementType: "lessons_completed", requirementValue: 1, pointsReward: 10, badgeUrl: null },
          { name: "Estudante Dedicado", description: "Complete 10 lições", icon: "📚", category: "lessons", requirementType: "lessons_completed", requirementValue: 10, pointsReward: 50, badgeUrl: null },
          { name: "Mestre do Conhecimento", description: "Complete 50 lições", icon: "🎓", category: "lessons", requirementType: "lessons_completed", requirementValue: 50, pointsReward: 200, badgeUrl: null },
          { name: "Especialista", description: "Complete 100 lições", icon: "👑", category: "lessons", requirementType: "lessons_completed", requirementValue: 100, pointsReward: 500, badgeUrl: null },
          { name: "Sequência de 3 Dias", description: "Estude por 3 dias consecutivos", icon: "🔥", category: "streak", requirementType: "streak_days", requirementValue: 3, pointsReward: 30, badgeUrl: null },
          { name: "Sequência de 7 Dias", description: "Estude por 7 dias consecutivos", icon: "⚡", category: "streak", requirementType: "streak_days", requirementValue: 7, pointsReward: 100, badgeUrl: null },
          { name: "Sequência de 30 Dias", description: "Estude por 30 dias consecutivos", icon: "💎", category: "streak", requirementType: "streak_days", requirementValue: 30, pointsReward: 500, badgeUrl: null },
          { name: "Iniciante Motivado", description: "Acumule 100 XP", icon: "⭐", category: "points", requirementType: "total_xp", requirementValue: 100, pointsReward: 20, badgeUrl: null },
          { name: "Colecionador de XP", description: "Acumule 500 XP", icon: "🌟", category: "points", requirementType: "total_xp", requirementValue: 500, pointsReward: 100, badgeUrl: null },
          { name: "Mestre dos Pontos", description: "Acumule 1000 XP", icon: "✨", category: "points", requirementType: "total_xp", requirementValue: 1000, pointsReward: 200, badgeUrl: null },
          { name: "Maratonista", description: "Estude por 60 minutos no total", icon: "⏱️", category: "time", requirementType: "study_time", requirementValue: 60, pointsReward: 50, badgeUrl: null },
          { name: "Estudante Persistente", description: "Estude por 300 minutos no total", icon: "🏃", category: "time", requirementType: "study_time", requirementValue: 300, pointsReward: 150, badgeUrl: null },
          { name: "Perfeccionista", description: "Complete uma lição com 100% de acerto", icon: "💯", category: "pronunciation", requirementType: "perfect_score", requirementValue: 1, pointsReward: 100, badgeUrl: null },
        ];
        
        const dbInstance = await db.getDb();
        if (!dbInstance) {
          throw new Error("Banco de dados não disponível");
        }
        
        const { achievements } = await import("../drizzle/schema");
        
        for (const achievement of achievementsData) {
          await dbInstance.insert(achievements).values(achievement as any);
        }
        
        return { message: `${achievementsData.length} conquistas criadas com sucesso!`, count: achievementsData.length };
      }),
    
    // Popular professores virtuais
    populateTeachers: publicProcedure
      .mutation(async () => {
        const { exec } = await import("child_process");
        const { promisify } = await import("util");
        const execAsync = promisify(exec);
        
        try {
          const { stdout, stderr } = await execAsync("cd /home/ubuntu/copy-of-multilingue-universal---plataforma-de-ensino-com-ia-avançada && tsx server/seed-teachers.ts");
          
          return {
            success: true,
            message: "Professores virtuais criados com sucesso!",
            output: stdout,
            errors: stderr || null,
          };
        } catch (error: any) {
          return {
            success: false,
            message: "Erro ao criar professores",
            output: error.stdout || "",
            errors: error.stderr || error.message,
          };
        }
      }),
  }),

  // Cursos
  courses: router({
    // Buscar cursos por idioma
    getByLanguage: publicProcedure
      .input(
        z.object({
          languageId: z.number(),
        })
      )
      .query(async ({ input }) => {
        return await db.getCoursesByLanguage(input.languageId);
      }),
    
    // Buscar curso por ID
    getById: publicProcedure
      .input(
        z.object({
          courseId: z.number(),
        })
      )
      .query(async ({ input }) => {
        return await db.getCourseById(input.courseId);
      }),
  }),

  // Progresso do Usuário
  progress: router({
    // Marcar lição como completada
    completeLesson: protectedProcedure
      .input(
        z.object({
          lessonId: z.number(),
          courseId: z.number(),
          score: z.number().min(0).max(100),
          timeSpentSeconds: z.number(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) {
          throw new Error("Usuário não autenticado");
        }
        
        await db.completeLesson({
          userId: ctx.user.id,
          lessonId: input.lessonId,
          courseId: input.courseId,
          score: input.score,
          timeSpentSeconds: input.timeSpentSeconds,
        });
        
        return { success: true };
      }),

    // Registrar tentativas para feedback adaptativo baseado em erros reais.
    recordExerciseAttempt: protectedProcedure
      .input(z.object({
        exerciseId: z.number(),
        isCorrect: z.boolean(),
        userAnswer: z.string().max(2000),
        expectedAnswer: z.string().max(2000),
        timeSpentSeconds: z.number().min(0).max(7200),
        errorType: z.enum(["grammar", "vocabulary", "pronunciation", "comprehension"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const inferredErrorType = input.errorType || "vocabulary";
        await db.recordLearningHistory({
          userId: ctx.user.id,
          exerciseId: input.exerciseId,
          isCorrect: input.isCorrect,
          userAnswer: input.userAnswer,
          timeSpentSeconds: input.timeSpentSeconds,
          errorType: input.isCorrect ? undefined : inferredErrorType,
          errorDetails: input.isCorrect ? undefined : `Esperado: ${input.expectedAnswer}`,
        });

        if (!input.isCorrect) {
          await db.recordErrorPattern({
            userId: ctx.user.id,
            errorType: inferredErrorType,
            errorCategory: "lesson_exercise",
            severity: 1,
          });
        }

        const patterns = input.isCorrect ? [] : await db.getUserErrorPatterns(ctx.user.id);
        const mostFrequent = patterns[0];
        const labels: Record<string, string> = {
          grammar: "gramática",
          vocabulary: "vocabulário",
          pronunciation: "pronúncia",
          comprehension: "compreensão",
        };
        const personalizedFocus = mostFrequent && (mostFrequent.frequency || 0) >= 2
          ? `Você tem repetido erros em ${labels[mostFrequent.errorType] || "este ponto"}. Vamos reforçá-lo nas próximas atividades.`
          : null;

        return { success: true, personalizedFocus };
      }),
    
    // Buscar estatísticas do usuário
    getStats: protectedProcedure
      .query(async ({ ctx }) => {
        if (!ctx.user) {
          throw new Error("Usuário não autenticado");
        }
        
        return await db.getUserStats(ctx.user.id);
      }),
    
    // Buscar progresso de um curso específico
    getCourseProgress: protectedProcedure
      .input(
        z.object({
          courseId: z.number(),
        })
      )
      .query(async ({ ctx, input }) => {
        if (!ctx.user) {
          throw new Error("Usuário não autenticado");
        }
        
        return await db.getUserProgress(ctx.user.id, input.courseId);
      }),
    
    // Buscar lições completadas
    getCompletedLessons: protectedProcedure
      .query(async ({ ctx }) => {
        if (!ctx.user) {
          throw new Error("Usuário não autenticado");
        }
        
        return await db.getUserCompletedLessons(ctx.user.id);
      }),
    
    // Verificar se lição foi completada
    isLessonCompleted: protectedProcedure
      .input(
        z.object({
          lessonId: z.number(),
        })
      )
      .query(async ({ ctx, input }) => {
        if (!ctx.user) {
          return false;
        }
        
        return await db.isLessonCompleted(ctx.user.id, input.lessonId);
      }),
  }),

  // Conquistas
  achievements: router({
    // Buscar todas as conquistas
    getAll: publicProcedure
      .query(async () => {
        return await db.getAllAchievements();
      }),
    
    // Buscar conquistas do usuário
    getUserAchievements: protectedProcedure
      .query(async ({ ctx }) => {
        if (!ctx.user) {
          throw new Error("Usuário não autenticado");
        }
        
        return await db.getUserAchievements(ctx.user.id);
      }),
  }),

  // Lições
  lessons: router({
    // Buscar lições de um curso
    getByCourse: protectedProcedure
      .input(
        z.object({
          courseId: z.number(),
          limit: z.number().optional().default(20),
          offset: z.number().optional().default(0),
        })
      )
      .query(async ({ ctx, input }) => {
        const entitlement = await getLearningContentEntitlement(ctx.user.id);
        const authorizedIds = await getAuthorizedTrialLessonIds(ctx.user.id, entitlement);
        const allLessons = await db.getLessonsByCourse(input.courseId);
        const authorizedLessons = filterLessonsForEntitlement(allLessons, authorizedIds);
        
        // Apply pagination
        const offset = input.offset || 0;
        const limit = input.limit || 20;
        const paginatedLessons = authorizedLessons.slice(offset, offset + limit);
        
        const result = {
          lessons: paginatedLessons,
          total: authorizedLessons.length,
          hasMore: offset + limit < authorizedLessons.length,
        };
        
        return result;
      }),
    
    // Listar todas as lições (simplificado)
    list: protectedProcedure
      .query(async ({ ctx }) => {
        const entitlement = await getLearningContentEntitlement(ctx.user.id);
        const authorizedIds = await getAuthorizedTrialLessonIds(ctx.user.id, entitlement);
        const lessons = await db.getAllLessons();
        return filterLessonsForEntitlement(lessons || [], authorizedIds);
      }),

    // Buscar lições por nível de curso
    listByLevel: protectedProcedure
      .input(z.object({
        courseLevel: z.enum(['basico', 'intermediario', 'avancado', 'negocios_tecnologia']),
      }))
      .query(async ({ ctx, input }) => {
        const entitlement = await getLearningContentEntitlement(ctx.user.id);
        const authorizedIds = await getAuthorizedTrialLessonIds(ctx.user.id, entitlement);
        const lessons = await db.getLessonsByCourseLevel(input.courseLevel);
        return filterLessonsForEntitlement(lessons || [], authorizedIds);
      }),
    
    // Buscar lições por idioma
    getByLanguage: protectedProcedure
      .input(
        z.object({
          languageId: z.number(),
          limit: z.number().optional().default(50),
        })
      )
      .query(async ({ ctx, input }) => {
        const entitlement = await getLearningContentEntitlement(ctx.user.id);
        const authorizedIds = await getAuthorizedTrialLessonIds(ctx.user.id, entitlement);
        console.log('=== lessons.getByLanguage CHAMADO ===');
        console.log('input.languageId:', input.languageId);
        console.log('input.limit:', input.limit);
        
        const database = await db.getDb();
        if (!database) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao conectar ao banco de dados"
          });
        }
        
        // Buscar todos os cursos do idioma
        const coursesResult = await database.execute(
          `SELECT id FROM courses WHERE language_id = ${input.languageId} LIMIT 10`
        );
        const courses = (coursesResult as any)[0] as unknown as any[];
        console.log('courses encontrados:', courses);
        
        if (!courses || courses.length === 0) {
          return [];
        }
        
        // Buscar lições de todos os cursos
        const courseIds = courses.map((c: any) => c.id).join(',');
        console.log('courseIds:', courseIds);
        
        const lessonsResult = await database.execute(
          `SELECT * FROM lessons WHERE courseId IN (${courseIds}) ORDER BY orderIndex ASC LIMIT ${input.limit}`
        );
        const lessons = (lessonsResult as any)[0] as unknown as any[];
        console.log('lessons encontradas:', lessons?.length);
        console.log('primeiras 3 lições:', lessons?.slice(0, 3));
        
        return filterLessonsForEntitlement(lessons || [], authorizedIds);
      }),
    
    // Buscar lição por ID com áudio
    getById: protectedProcedure
      .input(
        z.object({
          lessonId: z.number(),
        })
      )
      .query(async ({ ctx, input }) => {
        const entitlement = await getLearningContentEntitlement(ctx.user.id);
        const authorizedIds = await getAuthorizedTrialLessonIds(ctx.user.id, entitlement);
        if (authorizedIds !== null && !authorizedIds.includes(input.lessonId)) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Inicie esta lição pelo fluxo autorizado do período gratuito." });
        }
        const lesson = await db.getLessonById(input.lessonId);
        
        if (!lesson) {
          throw new Error("Lição não encontrada");
        }
        
        // Gerar áudio em background (fire-and-forget) — não bloqueia o carregamento da lição
        if (!lesson.audioUrl) {
          const introText = `Lesson ${lesson.orderIndex}: ${lesson.title}. ${lesson.description || ''}`;
          setImmediate(async () => {
            try {
              const audioResult = await textToSpeech({
                text: introText,
                languageCode: lesson.languageCode || 'en',
              });
              await db.updateLessonAudio(lesson.id, audioResult.audioUrl);
            } catch (_err) {
              // silently ignore — audio is optional
            }
          });
        }
        
        // Cache the result for 5 minutes
        const { cache: cacheModule } = await import('./cache');
        cacheModule.set(`lesson:${input.lessonId}`, lesson);
        return lesson;
      }),
    
    // Buscar exercícios de uma lição (auto-gera via IA se não existirem)
    getExercises: protectedProcedure
      .input(
        z.object({
          lessonId: z.number(),
        })
      )
      .query(async ({ ctx, input }) => {
        const entitlement = await getLearningContentEntitlement(ctx.user.id);
        const authorizedIds = await getAuthorizedTrialLessonIds(ctx.user.id, entitlement);
        if (authorizedIds !== null && !authorizedIds.includes(input.lessonId)) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Os exercícios só podem ser acessados dentro de uma lição autorizada." });
        }
        const existing = await db.getExercisesByLesson(input.lessonId);
        if (existing && existing.length > 0) return existing;

        // Nenhum exercício — gerar via IA e salvar no banco
        try {
          const lesson = await db.getLessonById(input.lessonId);
          if (!lesson) return [];

          const topic = lesson.title || 'General vocabulary';
          const lang = lesson.languageCode || 'en';
          const vocab = lesson.description
            ? lesson.description.split(/[,;\s]+/).filter(Boolean).slice(0, 10)
            : [topic];

          const generated = await generateExercises(topic, vocab, 8);
          if (!Array.isArray(generated)) return [];

          // Tipos válidos no banco
          const VALID_TYPES = ['multiple_choice', 'fill_blank', 'translation', 'conversation', 'listening', 'speaking', 'writing'];
          const mapType = (t: string) => VALID_TYPES.includes(t) ? t : 'multiple_choice';

          // Salvar no banco para próximas visitas
          for (let i = 0; i < generated.length; i++) {
            const ex = generated[i];
            try {
              await db.insertExercise({
                lessonId: input.lessonId,
                type: mapType(ex.type || 'multiple_choice'),
                question: ex.question || '',
                correctAnswer: ex.correctAnswer || '',
                options: ex.options || undefined,
                orderIndex: i + 1,
                xpReward: 10,
              });
            } catch (e) {
              console.error('insertExercise error:', e);
            }
          }

          // Retornar exercícios recém-gerados (com formato compatível)
          return generated.map((ex: any, i: number) => ({
            id: -(i + 1), // ID temporário negativo
            lessonId: input.lessonId,
            type: mapType(ex.type || 'multiple_choice'),
            question: ex.question || '',
            correctAnswer: ex.correctAnswer || '',
            options: ex.options || null,
            orderIndex: i + 1,
            xpReward: 10,
            createdAt: new Date(),
          }));
        } catch (err) {
          console.error('Auto-generate exercises error:', err);
          return [];
        }
      }),
  }),
  
  // Sistema de Feedback Bidirecional com IA
  aiAdmin: router({
    // Criar nova conversa com IA
    createConversation: protectedProcedure
      .input(z.object({
        topic: z.string().optional(),
        category: z.enum([
          "feature_request", 
          "bug_report", 
          "optimization", 
          "content_improvement",
          "user_experience",
          "ai_training",
          "general"
        ]).optional(),
        initialMessage: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user || ctx.user.role !== 'admin') {
          throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem acessar" });
        }
        
        return await db.createAiAdminConversation(ctx.user.id, input);
      }),
    
    // Enviar mensagem em conversa existente
    sendMessage: protectedProcedure
      .input(z.object({
        conversationId: z.number(),
        content: z.string(),
        messageType: z.enum(["feedback", "suggestion", "question", "insight", "analysis", "recommendation"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user || ctx.user.role !== 'admin') {
          throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem acessar" });
        }
        
        return await db.sendAiAdminMessage(input.conversationId, 'admin', input.content, input.messageType);
      }),
    
    // Obter resposta da IA
    getAiResponse: protectedProcedure
      .input(z.object({
        conversationId: z.number(),
        context: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user || ctx.user.role !== 'admin') {
          throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem acessar" });
        }
        
        return await db.getAiAdminResponse(input.conversationId, input.context);
      }),
    
    // Listar conversas
    listConversations: protectedProcedure
      .input(z.object({
        status: z.enum(["active", "resolved", "archived"]).optional(),
        limit: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        if (!ctx.user || ctx.user.role !== 'admin') {
          throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem acessar" });
        }
        
        return await db.listAiAdminConversations(ctx.user.id, input.status, input.limit);
      }),
    
    // Obter mensagens de uma conversa
    getMessages: protectedProcedure
      .input(z.object({
        conversationId: z.number(),
      }))
      .query(async ({ ctx, input }) => {
        if (!ctx.user || ctx.user.role !== 'admin') {
          throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem acessar" });
        }
        
        return await db.getAiAdminMessages(input.conversationId);
      }),
    
    // Marcar conversa como resolvida
    resolveConversation: protectedProcedure
      .input(z.object({
        conversationId: z.number(),
        summary: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user || ctx.user.role !== 'admin') {
          throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem acessar" });
        }
        
        return await db.resolveAiAdminConversation(input.conversationId, input.summary);
      }),
    
    // Gerar insights automáticos
    generateInsights: protectedProcedure
      .mutation(async ({ ctx }) => {
        if (!ctx.user || ctx.user.role !== 'admin') {
          throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem acessar" });
        }
        
        return await db.generateAiInsights();
      }),
    
    // Listar insights
    listInsights: protectedProcedure
      .input(z.object({
        status: z.enum(["new", "reviewed", "in_progress", "resolved", "dismissed"]).optional(),
        severity: z.enum(["info", "warning", "critical"]).optional(),
        limit: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        if (!ctx.user || ctx.user.role !== 'admin') {
          throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem acessar" });
        }
        
        return await db.listAiInsights(input.status, input.severity, input.limit);
      }),
    
    // Marcar insight como revisado
    reviewInsight: protectedProcedure
      .input(z.object({
        insightId: z.number(),
        status: z.enum(["reviewed", "in_progress", "resolved", "dismissed"]),
        adminNotes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user || ctx.user.role !== 'admin') {
          throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem acessar" });
        }
        
        return await db.reviewAiInsight(input.insightId, ctx.user.id, input.status, input.adminNotes);
      }),
    
    // Registrar melhoria implementada
    recordImprovement: protectedProcedure
      .input(z.object({
        title: z.string(),
        description: z.string(),
        source: z.enum(["admin_feedback", "ai_suggestion", "user_request", "automated_analysis"]),
        sourceId: z.number().optional(),
        category: z.string(),
        impactArea: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user || ctx.user.role !== 'admin') {
          throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem acessar" });
        }
        
        return await db.recordSystemImprovement(ctx.user.id, input);
      }),
    
    // Listar melhorias
    listImprovements: protectedProcedure
      .input(z.object({
        status: z.enum(["planned", "in_progress", "completed", "rolled_back"]).optional(),
        limit: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        if (!ctx.user || ctx.user.role !== 'admin') {
          throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem acessar" });
        }
        
        return await db.listSystemImprovements(input.status, input.limit);
      }),

    // Seed: Popular professores virtuais
    seedVirtualTeachers: protectedProcedure
      .mutation(async ({ ctx }) => {
        if (!ctx.user || ctx.user.role !== 'admin') {
          throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem acessar" });
        }

        const { execSync } = await import("child_process");
        try {
          const output = execSync("cd /home/ubuntu/copy-of-multilingue-universal---plataforma-de-ensino-com-ia-avançada && node --loader tsx server/seed-teachers.ts", {
            encoding: "utf-8",
            timeout: 60000,
          });
          return { success: true, output };
        } catch (error: any) {
          throw new TRPCError({ 
            code: "INTERNAL_SERVER_ERROR", 
            message: `Erro ao popular professores: ${error.message}` 
          });
        }
      }),

    // Seed: Configurar pagamentos automáticos
    seedAutoPayments: protectedProcedure
      .mutation(async ({ ctx }) => {
        if (!ctx.user || ctx.user.role !== 'admin') {
          throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem acessar" });
        }

        const { execSync } = await import("child_process");
        try {
          const output = execSync("node --loader tsx server/seed-auto-payments.ts", {
            cwd: process.cwd(),
            encoding: "utf-8",
            timeout: 60000,
          });
          return { success: true, output };
        } catch (error: any) {
          throw new TRPCError({ 
            code: "INTERNAL_SERVER_ERROR", 
            message: `Erro ao configurar pagamentos: ${error.message}` 
          });
        }
      }),
  }),
  
  // Waitlist pré-lançamento
  waitlist: router({
    join: publicProcedure
      .input(z.object({
        email: z.string().email(),
        name: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { email, name } = input;
        const { waitlist } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        
        // Verificar se já existe
        const database = await db.getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao conectar ao banco" });
        
        const existing = await database.select().from(waitlist).where(eq(waitlist.email, email)).limit(1);
        if (existing.length > 0) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Email já cadastrado!" });
        }
        
        // Inserir
        await database.insert(waitlist).values({ email, name: name || null });
        
        return { success: true };
      }),
  }),

  // Gestão Financeira
  finance: router({
    // Listar receitas
    listRevenues: financeAdminProcedure
      .input(z.object({
        status: z.enum(["pending", "completed", "failed", "refunded"]).optional(),
        limit: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        return await db.listRevenues(input || {});
      }),

    // Listar despesas
    listExpenses: financeAdminProcedure
      .input(z.object({
        status: z.enum(["pending", "paid", "overdue", "cancelled"]).optional(),
        category: z.string().optional(),
        isRecurring: z.boolean().optional(),
        limit: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        return await db.listExpenses(input || {});
      }),

    // Listar pagamentos automáticos
    listAutoPayments: financeAdminProcedure
      .input(z.object({
        isActive: z.boolean().optional(),
      }).optional())
      .query(async ({ input }) => {
        return await db.listAutoPaymentConfigs(input?.isActive);
      }),

    // Listar recibos
    listReceipts: financeAdminProcedure
      .input(z.object({
        limit: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        return await db.listReceipts({ limit: input?.limit });
      }),

    // Listar relatórios
    listReports: financeAdminProcedure
      .input(z.object({
        limit: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        return await db.listFinancialReports(input?.limit);
      }),

    // Gerar relatório mensal
    generateMonthlyReport: financeAdminProcedure
      .input(z.object({
        month: z.number().min(1).max(12),
        year: z.number(),
      }))
      .mutation(async ({ input }) => {
        return await db.generateMonthlyReport(input.month, input.year);
      }),

    // Calcular impostos
    calculateTaxes: financeAdminProcedure
      .input(z.object({
        month: z.number().min(1).max(12),
        year: z.number(),
      }))
      .mutation(async ({ input }) => {
        return await db.calculateMonthlyTaxes(input.month, input.year);
      }),

    // Processar pagamento automático
    processAutoPayment: financeAdminProcedure
      .input(z.object({
        configId: z.number(),
      }))
      .mutation(async ({ input }) => {
        return await db.processAutoPayment(input.configId);
      }),

    // Criar receita manualmente
    createRevenue: financeAdminProcedure
      .input(z.object({
        source: z.enum(["subscription", "one_time_payment", "refund", "other"]),
        userId: z.number().optional(),
        subscriptionId: z.number().optional(),
        grossAmount: z.number(),
        fees: z.number(),
        netAmount: z.number(),
        paymentMethod: z.string().optional(),
        transactionId: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createRevenue(input);
      }),

    // Criar despesa
    createExpense: financeAdminProcedure
      .input(z.object({
        category: z.enum(["hosting", "payment_gateway", "domain", "software", "marketing", "taxes", "other"]),
        description: z.string(),
        provider: z.string().optional(),
        amount: z.number(),
        isRecurring: z.boolean().optional(),
        recurringFrequency: z.enum(["monthly", "quarterly", "yearly", "one_time"]).optional(),
        dueDate: z.date().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createExpense(input);
      }),

    // Atualizar status de despesa
    updateExpenseStatus: financeAdminProcedure
      .input(z.object({
        expenseId: z.number(),
        status: z.enum(["pending", "paid", "overdue", "cancelled"]),
        receiptUrl: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.updateExpenseStatus(input.expenseId, input.status, input.receiptUrl);
      }),

    // Análise financeira com IA
    analyzeHealth: financeAdminProcedure
      .input(z.object({
        month: z.number().min(1).max(12),
        year: z.number(),
      }))
      .mutation(async ({ input }) => {
        const { analyzeFinancialHealth } = await import("./financial-ai");
        return await analyzeFinancialHealth(input.month, input.year);
      }),

    // Gerar alertas automáticos
    generateAlerts: financeAdminProcedure
      .query(async () => {
        const { generateFinancialAlerts } = await import("./financial-ai");
        return await generateFinancialAlerts();
      }),

    // Recomendações de otimização fiscal
    taxOptimization: financeAdminProcedure
      .input(z.object({
        month: z.number().min(1).max(12),
        year: z.number(),
      }))
      .mutation(async ({ input }) => {
        const { generateTaxOptimizationRecommendations } = await import("./financial-ai");
        return await generateTaxOptimizationRecommendations(input.month, input.year);
      }),

    // Previsão de receita
    predictRevenue: financeAdminProcedure
      .input(z.object({
        months: z.number().min(1).max(12).optional(),
      }).optional())
      .query(async ({ input }) => {
        const { predictFutureRevenue } = await import("./financial-ai");
        return await predictFutureRevenue(input?.months);
      }),
  }),

  // Professores Virtuais
  teachers: router({
    // Buscar professor por ID
    getById: publicProcedure
      .input(z.object({
        teacherId: z.number(),
      }))
      .query(async ({ input }) => {
        return await db.getVirtualTeacherById(input.teacherId);
      }),

    // Buscar professor por idioma (ID)
    getByLanguage: publicProcedure
      .input(z.object({
        languageId: z.number(),
      }))
      .query(async ({ input }) => {
        return await db.getVirtualTeacherByLanguage(input.languageId);
      }),

    // Buscar TODOS os professores por código de idioma (retorna array)
    getByLanguageCode: publicProcedure
      .input(z.object({
        languageCode: z.string(),
      }))
      .query(async ({ input }) => {
        const database = await db.getDb();
        if (!database) return [];
        
        // Normalize language code: en -> en-US, pt -> pt-BR, etc
        const langMap: Record<string, string> = {
          'en': 'en-US', 'pt': 'pt-BR', 'es': 'es-ES', 'fr': 'fr-FR',
          'de': 'de-DE', 'it': 'it-IT', 'ja': 'ja-JP', 'zh': 'zh-CN',
          'ko': 'ko-KR', 'ru': 'ru-RU', 'ar': 'ar-XA', 'hi': 'hi-IN',
          'nl': 'nl-NL', 'pl': 'pl-PL', 'sv': 'sv-SE', 'da': 'da-DK',
          'fi': 'fi-FI', 'nb': 'nb-NO', 'tr': 'tr-TR', 'uk': 'uk-UA',
          'cs': 'cs-CZ', 'hu': 'hu-HU', 'ro': 'ro-RO', 'bg': 'bg-BG',
          'hr': 'hr-HR', 'sk': 'sk-SK', 'sl': 'sl-SI', 'et': 'et-EE',
          'lv': 'lv-LV', 'lt': 'lt-LT', 'vi': 'vi-VN', 'id': 'id-ID',
          'ms': 'ms-MY', 'fa': 'fa-IR', 'he': 'he-IL', 'el': 'el-GR',
          'af': 'af-ZA', 'sw': 'sw-KE', 'zu': 'zu-ZA', 'xh': 'xh-ZA',
          'yo': 'yo-NG', 'ha': 'ha-NG', 'ig': 'ig-NG', 'am': 'am-ET',
          'bn': 'bn-IN', 'ur': 'ur-IN', 'ca': 'ca-ES', 'eu': 'eu-ES',
          'gl': 'gl-ES', 'sr': 'sr-RS', 'cmn': 'cmn-CN',
        };
        
        // Normalize: 'en' -> 'en-US', 'en-US' stays 'en-US'
        const fullCode = langMap[input.languageCode] || input.languageCode;
        // Also get prefix for fallback match: 'en-US' -> 'en'
        const prefix = fullCode.split('-')[0];
        
        // Query teachers by voice_language_code — exact match OR prefix match
        const { virtualTeachers } = await import('../drizzle/schema');
        const result = await database
          .select()
          .from(virtualTeachers)
          .where(sql`voice_language_code = ${fullCode} OR voice_language_code LIKE ${prefix + '-%'}`)
          .limit(10);
        
        return result || [];
      }),

    // Listar todos os professores
    list: publicProcedure
      .query(async () => {
        return await db.listVirtualTeachers();
      }),

    // Exibir somente cobertura real: perfil docente + voz neural compatível.
    coverage: publicProcedure
      .input(z.object({ languageCodes: z.array(z.string()).max(143) }))
      .query(({ input }) => {
        return input.languageCodes.map(getTeacherVoiceCoverage);
      }),
  }),

  // Regeneração de Lições com IA
  regenerateLessons: router({
    // Executar regeneração completa
    execute: protectedProcedure
      .mutation(async ({ ctx }) => {
        if (!ctx.user || ctx.user.role !== 'admin') {
          throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem regenerar lições" });
        }

        try {
          // Obter conexão do banco
          const database = await db.getDb();
          if (!database) {
            throw new Error("Erro ao conectar ao banco de dados");
          }

          // Deletar lições antigas
          const { exercises: exercisesTable, lessons: lessonsTable } = await import("../drizzle/schema");
          await database.delete(exercisesTable);
          await database.delete(lessonsTable);

          // Buscar cursos
          const courses = await db.getAllCourses();
          
          const topics = {
            beginner: [
              "Greetings", "Numbers", "Colors", "Family", "Food",
              "Animals", "Body Parts", "Clothes", "Weather", "Days"
            ],
            intermediate: [
              "Shopping", "Directions", "Transportation", "Hobbies", "Work",
              "Health", "House", "Technology", "Sports", "Travel"
            ],
            advanced: [
              "Business", "Politics", "Science", "Arts", "Environment",
              "Social Issues", "History", "Philosophy", "Literature", "Media"
            ]
          };

          let totalLessons = 0;
          let totalExercises = 0;

          // Processar cada curso
          for (const course of courses) {
            const language = await db.getLanguageById(course.languageId);
            if (!language) continue;
            const lessonTopics = topics[course.level as keyof typeof topics] || topics.beginner;

            for (let i = 0; i < lessonTopics.length; i++) {
              const topic = lessonTopics[i];
              
              // Criar lição
              const lessonTitle = `${topic} in ${language.name}`;
              const lessonDesc = `Learn essential ${topic.toLowerCase()} vocabulary and phrases in ${language.name}`;
              const lessonContent = `This lesson covers ${topic.toLowerCase()} in ${language.name}. You will learn key vocabulary, common phrases, and practical examples.`;

              const lessonId = await db.createLesson({
                courseId: course.id,
                title: lessonTitle,
                description: lessonDesc,
                content: lessonContent,
                order: i + 1,
                duration: 15,
                xpReward: 10,
                languageCode: language.code
              });

              totalLessons++;

              // Criar 5 exercícios por lição
              for (let j = 0; j < 5; j++) {
                await db.insertExercise({
                  lessonId: lessonId,
                  type: 'multiple_choice',
                  question: `Practice question ${j + 1} about ${topic} in ${language.name}`,
                  correctAnswer: `Correct answer for question ${j + 1}`,
                  options: [
                    `Correct answer for question ${j + 1}`,
                    `Wrong option A`,
                    `Wrong option B`,
                    `Wrong option C`
                  ],
                  orderIndex: j + 1,
                  xpReward: 10
                });

                totalExercises++;
              }
            }
          }

          return {
            success: true,
            message: `Regeneração concluída! ${totalLessons} lições e ${totalExercises} exercícios criados.`,
            stats: {
              courses: courses.length,
              lessons: totalLessons,
              exercises: totalExercises
            }
          };
        } catch (error: any) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Erro ao regenerar lições: ${error.message}`
          });
        }
      }),

    // Obter estatísticas atuais
    getStats: publicProcedure
      .query(async () => {
        const lessons = await db.getAllLessons();
        const exercises = await db.getExercisesByLesson(0);
        const courses = await db.getAllCourses();

        return {
          totalCourses: courses.length,
          totalLessons: lessons.length,
          totalExercises: exercises.length
        };
      }),
  }),

  // IA Conversacional
  conversationAI: router({
    // Iniciar conversa com pergunta aberta
    start: protectedProcedure
      .input(
        z.object({
          lessonId: z.number(),
          userLevel: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]),
          targetLanguage: z.string(),
          nativeLanguage: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const safeFallback = { question: "Let us practice a safe language sentence." };
        await ensureConversationAccess(ctx.user.id);
        const lesson = await db.getLessonById(input.lessonId);
        if (!lesson) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Lesson not found",
          });
        }

        const context: ConversationContext = {
          lessonTitle: lesson.title,
          lessonTopic: lesson.description || lesson.title,
          storyText: lesson.storyText || "",
          vocabulary: lesson.vocabulary || [],
          userLevel: input.userLevel,
          targetLanguage: input.targetLanguage,
          nativeLanguage: input.nativeLanguage,
        };

        const inputSafety = await assessConversationText(ctx.user.id, `${context.lessonTitle}\n${context.lessonTopic}`, input.targetLanguage);
        if (!inputSafety.allowed) return safeFallback;

        const question = await generateConversationStarter(context);
        const outputSafety = await assessConversationOutput(ctx.user.id, context.lessonTopic, question, input.targetLanguage);
        return outputSafety.allowed ? { question } : safeFallback;
      }),

    // Continuar conversa
    continue: protectedProcedure
      .input(
        z.object({
          lessonId: z.number(),
          userLevel: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]),
          targetLanguage: z.string(),
          nativeLanguage: z.string(),
         history: z.array(
           z.object({
             role: z.enum(["user", "assistant", "system"]),
             content: z.string(),
           })
         ),
       })
     )
      .mutation(async ({ input, ctx }) => {
        const safeFallback = { response: "Let us continue with a safe language-practice sentence." };
        await ensureConversationAccess(ctx.user.id);
        const lesson = await db.getLessonById(input.lessonId);
        if (!lesson) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Lesson not found",
          });
        }

        const context: ConversationContext = {
          lessonTitle: lesson.title,
          lessonTopic: lesson.description || lesson.title,
          storyText: lesson.storyText || "",
          vocabulary: lesson.vocabulary || [],
          userLevel: input.userLevel,
          targetLanguage: input.targetLanguage,
          nativeLanguage: input.nativeLanguage,
        };

        const learnerText = input.history.filter((message) => message.role === "user").slice(-1)[0]?.content || "";
        const inputSafety = await assessConversationText(ctx.user.id, learnerText, input.targetLanguage);
        if (!inputSafety.allowed) return safeFallback;

        const response = await continueConversation(context, input.history);
        const outputSafety = await assessConversationOutput(ctx.user.id, learnerText, response, input.targetLanguage);
        return outputSafety.allowed ? { response } : safeFallback;
      }),

    // Obter feedback sobre resposta
    feedback: protectedProcedure
      .input(
        z.object({
          lessonId: z.number(),
          userLevel: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]),
          targetLanguage: z.string(),
          nativeLanguage: z.string(),
          userMessage: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const safeFallback = {
          feedback: "Let us continue with safe language practice.",
          corrections: [],
          encouragement: "Keep practicing safely.",
        };
        await ensureConversationAccess(ctx.user.id);
        const lesson = await db.getLessonById(input.lessonId);
        if (!lesson) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Lesson not found",
          });
        }

        const context: ConversationContext = {
          lessonTitle: lesson.title,
          lessonTopic: lesson.description || lesson.title,
          storyText: lesson.storyText || "",
          vocabulary: lesson.vocabulary || [],
          userLevel: input.userLevel,
          targetLanguage: input.targetLanguage,
          nativeLanguage: input.nativeLanguage,
        };

        const inputSafety = await assessConversationText(ctx.user.id, input.userMessage, input.targetLanguage);
        if (!inputSafety.allowed) return safeFallback;
        const feedback = await provideFeedback(context, input.userMessage);
        const outputSafety = await assessConversationOutput(ctx.user.id, input.userMessage, JSON.stringify(feedback), input.targetLanguage);
        return outputSafety.allowed ? feedback : safeFallback;
      }),

    // Gerar prompts de conversação para uma lição
    generatePrompts: protectedProcedure
      .input(
        z.object({
          lessonId: z.number(),
          userLevel: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]),
          targetLanguage: z.string(),
          nativeLanguage: z.string(),
          count: z.number().min(1).max(20).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const safeFallback = { prompts: ["Let us practice a safe language sentence."] };
        await ensureConversationAccess(ctx.user.id);
        const lesson = await db.getLessonById(input.lessonId);
        if (!lesson) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Lesson not found",
          });
        }

        const context: ConversationContext = {
          lessonTitle: lesson.title,
          lessonTopic: lesson.description || lesson.title,
          storyText: lesson.storyText || "",
          vocabulary: lesson.vocabulary || [],
          userLevel: input.userLevel,
          targetLanguage: input.targetLanguage,
          nativeLanguage: input.nativeLanguage,
        };

        const inputSafety = await assessConversationText(ctx.user.id, `${context.lessonTitle}\n${context.lessonTopic}`, input.targetLanguage);
        if (!inputSafety.allowed) return safeFallback;
        const prompts = await generateConversationPrompts(context, input.count || 10);
        const outputSafety = await assessConversationOutput(ctx.user.id, context.lessonTopic, prompts.join("\n"), input.targetLanguage);
        return outputSafety.allowed ? { prompts } : safeFallback;
      }),
    // Tradução em tempo real
    translateRealtime: protectedProcedure
      .input(z.object({
        text: z.string(),
        fromLanguage: z.string(),
        toLanguage: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        await ensureConversationAccess(ctx.user.id);
        const { invokeLLM } = await import('./_core/llm');
        const safeFallback = { translation: "", wordByWord: [], blocked: true };
        const inputSafety = await assessConversationText(ctx.user.id, input.text, input.fromLanguage);
        if (!inputSafety.allowed) return safeFallback;
        const result = await invokeLLM({
          messages: [
            { role: 'system', content: 'You are a translator. Return JSON with fields: translation (string), wordByWord (array of {word, translation}).' },
            { role: 'user', content: `Translate from ${input.fromLanguage} to ${input.toLanguage}: "${input.text}"` },
          ],
          response_format: { type: 'json_schema', json_schema: { name: 'translation', strict: true, schema: { type: 'object', properties: { translation: { type: 'string' }, wordByWord: { type: 'array', items: { type: 'object', properties: { word: { type: 'string' }, translation: { type: 'string' } }, required: ['word', 'translation'], additionalProperties: false } } }, required: ['translation', 'wordByWord'], additionalProperties: false } } },
        });
        try {
          let rawResult = (result.choices[0].message.content as string) ?? "{}";
          rawResult = await sanitizeContent(rawResult, input.fromLanguage) || rawResult;
          const outputSafety = await assessConversationOutput(ctx.user.id, input.text, rawResult, input.toLanguage);
          return outputSafety.allowed ? JSON.parse(rawResult) : safeFallback;
        }
        catch { return { translation: input.text, wordByWord: [] }; }
      }),
    // Editar frase com IA
    editPhrase: protectedProcedure
      .input(z.object({
        originalPhrase: z.string(),
        targetLanguage: z.string(),
        nativeLanguage: z.string(),
        editType: z.enum(['modify_word', 'add_word', 'improve']),
        wordToModify: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { invokeLLM } = await import('./_core/llm');
        const safeFallback = { suggestions: "", blocked: true };
        const inputSafety = await assessConversationText(ctx.user.id, input.originalPhrase, input.targetLanguage);
        if (!inputSafety.allowed) return safeFallback;
        const result = await invokeLLM({
          messages: [
            {
              role: 'system',
              content: `You are a ${input.targetLanguage} language teacher helping a native ${input.nativeLanguage} learner. Give each suggestion with a concise explanation in ${input.nativeLanguage} and the suggested phrase in ${input.targetLanguage}. Do not use any third language.`,
            },
            { role: 'user', content: `Phrase: "${input.originalPhrase}". Action: ${input.editType}${input.wordToModify ? ` (word: ${input.wordToModify})` : ''}. Give 3 suggestions.` },
          ],
        });
        let suggestions = result.choices[0].message.content as string;
        // Content filter: sanitize suggestions
        suggestions = await sanitizeContent(suggestions, input.targetLanguage) || suggestions;
        const outputSafety = await assessConversationOutput(ctx.user.id, input.originalPhrase, suggestions, input.targetLanguage);
        return outputSafety.allowed ? { suggestions } : safeFallback;
      }),
    // Adicionar palavra ao vocabulário
    addToVocabulary: protectedProcedure
      .input(z.object({
        word: z.string(),
        translation: z.string(),
        targetLanguage: z.string(),
        nativeLanguage: z.string(),
        exampleSentence: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return { success: true, word: input.word };
      }),
  }),

  // Voice Transcription (para VoiceRecorder)
  voiceTranscription: router({ transcribe: protectedProcedure
      .input(
        z.object({
          audioData: z.string(), // Base64 audio data
          language: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const { transcribeAudio } = await import("./_core/voiceTranscription");
        const { storagePut } = await import("./storage");
        
        // Decodificar base64 para buffer
        const audioBuffer = Buffer.from(input.audioData.split(',')[1] || input.audioData, 'base64');
        
        // Upload temporário para S3 (Whisper precisa de URL)
        const tempKey = `temp-audio/${Date.now()}.webm`;
        const { url: audioUrl } = await storagePut(tempKey, audioBuffer, 'audio/webm');
        
        // Transcrever
        const result = await transcribeAudio({
          audioUrl,
          language: input.language,
        });
        
        return {
          text: (result as any).text,
          language: (result as any).language,
        };
      }),
  }),

  // Text-to-Speech (Google Cloud TTS)
  ttsGoogle: router({
    generate: protectedProcedure
      .input(
        z.object({
          text: z.string(),
          languageCode: z.string().default("pt-BR"),
          voiceName: z.string().optional(),
          gender: z.enum(["MALE", "FEMALE", "NEUTRAL"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { textToSpeech } = await import("./_core/tts");
        
        // Passa languageCode completo (en-US, pt-BR, es-ES) — NÃO truncar
        // textToSpeech já faz mapeamento correto; voiceName tem prioridade total
        const result = await textToSpeech({
          text: input.text,
          languageCode: input.languageCode, // ex: "en-US", "pt-BR"
          voiceName: input.voiceName || undefined,
          voiceGender: input.gender || "NEUTRAL",
        });
        
        return {
          audioUrl: result.audioUrl,
          audioKey: result.audioKey,
        };
      }),
  }),

  // LivePortrait - Animação de Retratos Fotorrealistas
  livePortrait: router({
    animate: protectedProcedure
      .input(
        z.object({
          imageUrl: z.string().url(),
          audioUrl: z.string().url(),
        })
      )
      .mutation(async ({ input }) => {
        const videoUrl = await animatePortrait(input.imageUrl, input.audioUrl);
        return { videoUrl };
      }),
    
     // Animar com texto direto (D-ID gera TTS Neural internamente)
    animateWithText: protectedProcedure
      .input(
        z.object({
          imageUrl: z.string().url(),
          text: z.string().min(1).max(500),
          languageCode: z.string().default('en-US'),
          voiceId: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const videoUrl = await animatePortraitWithText(
          input.imageUrl,
          input.text,
          input.languageCode,
          input.voiceId
        );
        return { videoUrl };
      }),

    healthCheck: publicProcedure
      .query(async () => {
        const isHealthy = await checkLivePortraitHealth();
        return { isHealthy };
      }),
    // Verificar se D-ID está configurado
    didStatus: publicProcedure
      .query(async () => {
        const { ENV } = await import("./_core/env");
        const hasKey = !!ENV.didApiKey && ENV.didApiKey.length > 10;
        return { configured: hasKey };
      }),
    // Gerar vídeo D-ID com texto (endpoint principal para professores)
    generateTeacherVideo: protectedProcedure
      .input(
        z.object({
          imageUrl: z.string().url(),
          text: z.string().min(1).max(800),
          languageCode: z.string().default('en-US'),
          voiceId: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { ENV } = await import("./_core/env");
        if (!ENV.didApiKey) throw new TRPCError({ code: 'PRECONDITION_FAILED', message: 'DID_API_KEY not configured' });
        const voiceMap: Record<string, string> = {
          'en-US': 'en-US-JennyNeural', 'en-GB': 'en-GB-SoniaNeural',
          'es-ES': 'es-ES-ElviraNeural', 'es-MX': 'es-MX-DaliaNeural',
          'fr-FR': 'fr-FR-DeniseNeural', 'de-DE': 'de-DE-KatjaNeural',
          'pt-BR': 'pt-BR-FranciscaNeural', 'it-IT': 'it-IT-ElsaNeural',
          'ja-JP': 'ja-JP-NanamiNeural', 'ko-KR': 'ko-KR-SunHiNeural',
          'zh-CN': 'zh-CN-XiaoxiaoNeural', 'ru-RU': 'ru-RU-SvetlanaNeural',
        };
        const voiceId = input.voiceId || voiceMap[input.languageCode] || 'en-US-JennyNeural';
        const payload = {
          source_url: input.imageUrl,
          script: { type: 'text', input: input.text, provider: { type: 'microsoft', voice_id: voiceId } },
          config: { fluent: true, pad_audio: 0.5, stitch: true }
        };
        const createResp = await fetch('https://api.d-id.com/talks', {
          method: 'POST',
          headers: { 'accept': 'application/json', 'content-type': 'application/json', 'authorization': ENV.didApiKey.startsWith('Basic ') ? ENV.didApiKey : `Basic ${ENV.didApiKey}` },
          body: JSON.stringify(payload)
        });
        if (!createResp.ok) { const err = await createResp.json(); throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: `D-ID: ${JSON.stringify(err)}` }); }
        const { id } = await createResp.json() as { id: string };
        for (let i = 0; i < 15; i++) {
          await new Promise(r => setTimeout(r, 2000));
          const pollResp = await fetch(`https://api.d-id.com/talks/${id}`, { headers: { 'authorization': ENV.didApiKey.startsWith('Basic ') ? ENV.didApiKey : `Basic ${ENV.didApiKey}` } });
          const data = await pollResp.json() as { status: string; result_url?: string };
          if (data.status === 'done' && data.result_url) return { videoUrl: data.result_url };
          if (data.status === 'error') throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'D-ID video failed' });
        }
        throw new TRPCError({ code: 'TIMEOUT', message: 'D-ID timeout' });
      }),
  }),
  // Phrasal Verbs Dictionary
  phrasalVerbs: router({
    // Buscar phrasal verbs
    search: protectedProcedure
      .input(
        z.object({
          searchTerm: z.string().optional(),
          category: z.string().optional(),
          difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
        })
      )
      .query(async ({ input }) => {
        const connection = await db.getDb();
          if (!connection) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB not available' });
        
        let query = "SELECT * FROM phrasal_verbs WHERE 1=1";
        const params: any[] = [];
        
        if (input.searchTerm) {
          query += " AND (phrasal_verb LIKE ? OR meaning LIKE ? OR verb LIKE ?)";
          const searchPattern = `%${input.searchTerm}%`;
          params.push(searchPattern, searchPattern, searchPattern);
        }
        
        if (input.category) {
          query += " AND category = ?";
          params.push(input.category);
        }
        
        if (input.difficulty) {
          query += " AND difficulty = ?";
          params.push(input.difficulty);
        }
        
        query += " ORDER BY difficulty ASC, phrasal_verb ASC LIMIT 50";
        
        const [rows] = await connection.execute(query as any);
        return rows;
      }),

    // Obter phrasal verb por ID
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const connection = await db.getDb();
          if (!connection) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB not available' });
        const [rows] = await connection.execute(
          `SELECT * FROM phrasal_verbs WHERE id = ${input.id}`
        );
        return ((rows as unknown) as any[])[0] || null;
      }),
  }),

  // AI: Tradução e Análise
  aiTranslation: router({
    translateWord: protectedProcedure
      .input(
        z.object({
          word: z.string(),
          sourceLanguage: z.string(),
          targetLanguage: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const { translateWordWithBlackbox } = await import("./_core/blackbox");
        const translation = await translateWordWithBlackbox(
          input.word,
          input.sourceLanguage,
          input.targetLanguage
        );
        return { translation };
      }),

    chatWithCharacter: protectedProcedure
      .input(
        z.object({
          characterName: z.string(),
          videoContext: z.string(),
          userMessage: z.string(),
          conversationHistory: z.array(
            z.object({
              role: z.enum(["user", "assistant"]),
              content: z.string(),
            })
          ),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const safeFallback = { response: "Let's continue with a safe language-practice sentence." };
        await ensureConversationAccess(ctx.user.id);
        const inputSafety = await assessConversationText(ctx.user.id, input.userMessage, "en");
        if (!inputSafety.allowed) return safeFallback;
        const { invokeLLM } = await import("./_core/llm");
        const { moderateAIResponse, createUserSafetyProfile } = await import("./content-moderation");
        
        // Garantir perfil de segurança existe
        if (ctx.user) {
          const db = await import("./db").then(m => m.getDb());
          if (db) {
            const { userSafetyProfile } = await import("../drizzle/schema");
            const { eq } = await import("drizzle-orm");
            const profile = await db.select().from(userSafetyProfile).where(eq(userSafetyProfile.userId, ctx.user.id)).limit(1);
            if (profile.length === 0) {
              await createUserSafetyProfile(ctx.user.id, "adulto");
            }
          }
        }
        
        const messages = [
          {
            role: "system" as const,
            content: `You are ${input.characterName}, a character from the video "${input.videoContext}". Respond naturally as this character would, helping the user practice English conversation. Keep responses conversational, friendly, and educational. Correct mistakes gently and encourage practice.`,
          },
          ...input.conversationHistory.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          {
            role: "user" as const,
            content: input.userMessage,
          },
        ];

        const response = await invokeLLM({ messages });
        const aiResponse = (response.choices[0].message.content as string ?? "")?.trim() || "";
        const outputSafety = await assessConversationOutput(ctx.user.id, input.userMessage, aiResponse, "en");
        if (!outputSafety.allowed) return safeFallback;
        
        // MODERAÇÃO: Validar resposta antes de enviar
        if (ctx.user) {
          const moderationResult = await moderateAIResponse(
            {
              userId: ctx.user.id,
              ageGroup: "adulto", // TODO: pegar do perfil do usuário
              country: undefined,
              religion: undefined,
            },
            aiResponse,
            input.userMessage
          );
          
          // Se bloqueado e não reformulado, retornar mensagem padrão
          if (!moderationResult.isAllowed && !moderationResult.reformulatedResponse) {
            return {
              response: "I apologize, but I cannot provide that response. Let's continue practicing English in a different way. What would you like to talk about?",
            };
          }
          
          // Usar resposta reformulada se disponível
          return {
            response: moderationResult.reformulatedResponse || aiResponse,
          };
        }
        
        return {
          response: aiResponse,
        };
      }),
  }),

  // Admin: Geração de Lições com IA
  admin: router({
    generateLesson: protectedProcedure
      .input(
        z.object({
          topic: z.string(),
          level: z.enum(["beginner", "intermediate", "advanced"]),
          languageCode: z.string(),
          targetLanguage: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const { generateLessonWithBlackbox } = await import("./_core/blackbox");
        const lesson = await generateLessonWithBlackbox(
          input.topic,
          input.level,
          input.targetLanguage
        );
        return {
          title: lesson.title,
          description: lesson.description,
          storyText: lesson.storyText,
          vocabularyDetailed: lesson.vocabularyDetailed,
          grammarDetailed: lesson.grammarDetailed,
          phonetics: lesson.phonetics,
          conversationPrompts: lesson.conversationPrompts,
          keywords: input.topic,
          topics: input.topic,
        };
      }),

    publishLesson: protectedProcedure
      .input(
        z.object({
          title: z.string(),
          description: z.string(),
          storyText: z.string(),
          vocabularyDetailed: z.string(),
          grammarDetailed: z.string(),
          phonetics: z.string(),
          conversationPrompts: z.string(),
          keywords: z.string(),
          topics: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const database = await db.getDb();
        if (!database) throw new Error("Database not available");
        await database.execute(sql`
          INSERT INTO lessons (
            courseId, title, description, orderIndex, keywords, topics,
            estimatedMinutes, createdAt, updatedAt, audioUrl, languageCode,
            storyText, vocabularyDetailed, grammarDetailed, phonetics, conversationPrompts
          ) VALUES (
            1, ${input.title}, ${input.description}, 999, ${input.keywords}, ${input.topics},
            30, ${Date.now()}, ${Date.now()}, NULL, 'en',
            ${input.storyText}, ${input.vocabularyDetailed}, ${input.grammarDetailed}, 
            ${input.phonetics}, ${input.conversationPrompts}
          )
        `);
        const result = await database.execute(sql`SELECT LAST_INSERT_ID() as id`);
        const lessonId = ((result[0] as any)[0] as any).id;
        return { success: true, lessonId };
      }),
  }),

  // Pronunciation Analysis (para VoiceRecorder)
  pronunciation: router({
    evaluate: publicProcedure
      .input(
        z.object({
          expectedText: z.string(),
          spokenText: z.string(),
          audioData: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const target = input.expectedText.toLowerCase().trim();
        const spoken = input.spokenText.toLowerCase().trim();
        
        const similarity = calculateSimilarity(target, spoken);
        const accuracy = Math.round(similarity * 100);
        
        let feedback = "";
        if (accuracy >= 90) {
          feedback = "🎉 Excelente! Sua pronúncia está perfeita!";
        } else if (accuracy >= 70) {
          feedback = "👍 Muito bom! Continue praticando para melhorar ainda mais.";
        } else if (accuracy >= 50) {
          feedback = "💪 Bom começo! Tente prestar atenção na pronúncia de cada palavra.";
        } else {
          feedback = "📚 Continue praticando! Ouça o áudio nativo várias vezes e tente imitar.";
        }
        
        return {
          accuracy,
          feedback,
          transcription: input.spokenText,
        };
      }),
    analyze: publicProcedure
      .input(
        z.object({
          targetText: z.string(),
          spokenText: z.string(),
          language: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        // Análise simples de similaridade
        const target = input.targetText.toLowerCase().trim();
        const spoken = input.spokenText.toLowerCase().trim();
        
        // Calcular similaridade (Levenshtein distance)
        const similarity = calculateSimilarity(target, spoken);
        const score = Math.round(similarity * 100);
        
        let feedback = "";
        if (score >= 90) {
          feedback = "🎉 Excelente! Sua pronúncia está perfeita!";
        } else if (score >= 70) {
          feedback = "👍 Muito bom! Continue praticando para melhorar ainda mais.";
        } else if (score >= 50) {
          feedback = "💪 Bom começo! Tente prestar atenção na pronúncia de cada palavra.";
        } else {
          feedback = "📚 Continue praticando! Ouça o áudio nativo várias vezes e tente imitar.";
        }
        
        return {
          score,
          feedback,
          targetText: input.targetText,
          spokenText: input.spokenText,
        };
      }),
    save: protectedProcedure
      .input(z.object({ word: z.string(), targetLanguage: z.string(), scenario: z.string().optional(), score: z.number(), userTranscript: z.string().optional(), expectedText: z.string().optional(), feedback: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) return { ok: false };
        const { pronunciationHistory } = await import("../drizzle/schema");
        await dbInstance.insert(pronunciationHistory).values({ userId: ctx.user.id, word: input.word, targetLanguage: input.targetLanguage, scenario: input.scenario, score: input.score, userTranscript: input.userTranscript, expectedText: input.expectedText, feedback: input.feedback });
        return { ok: true };
      }),
    getHistory: protectedProcedure
      .input(z.object({ targetLanguage: z.string().optional(), limit: z.number().default(50) }))
      .query(async ({ ctx, input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) return [];
        const { pronunciationHistory } = await import("../drizzle/schema");
        const { eq, desc, and } = await import("drizzle-orm");
        const conditions = [eq(pronunciationHistory.userId, ctx.user.id)];
        if (input.targetLanguage) conditions.push(eq(pronunciationHistory.targetLanguage, input.targetLanguage));
        return dbInstance.select().from(pronunciationHistory).where(and(...conditions)).orderBy(desc(pronunciationHistory.createdAt)).limit(input.limit);
      }),
    getStats: protectedProcedure.query(async ({ ctx }) => {
      const dbInstance = await db.getDb();
      if (!dbInstance) return { avgScore: 0, total: 0 };
      const { pronunciationHistory } = await import("../drizzle/schema");
      const { eq, avg, count } = await import("drizzle-orm");
      const rows = await dbInstance.select({ avgScore: avg(pronunciationHistory.score), total: count() }).from(pronunciationHistory).where(eq(pronunciationHistory.userId, ctx.user.id));
      return rows[0] || { avgScore: 0, total: 0 };
    }),
  }),

  // ═══════════════════════════════════════════════════════════════
  // D-ID VIDEO CACHE — Economiza créditos reutilizando vídeos
  // ═══════════════════════════════════════════════════════════════
  didCache: router({
    // Buscar vídeo em cache
    get: publicProcedure
      .input(z.object({
        teacherId: z.string(),
        text: z.string(),
        langCode: z.string(),
      }))
      .query(async ({ input }) => {
        const connection = await db.getDb();
        if (!connection) return { cached: false, videoUrl: null, photoUrl: null };
        const crypto = await import('crypto');
        const textHash = crypto.createHash('sha256').update(input.text).digest('hex');
        const cacheKey = `${input.teacherId}:${textHash}:${input.langCode}`;
        const escapedKey = cacheKey.replace(/'/g, "''");
        const [rows] = await connection.execute(
          sql`SELECT * FROM did_video_cache WHERE cache_key = ${cacheKey} AND status = 'done' LIMIT 1`
        ) as any;
        const rowArr = Array.isArray(rows) ? rows : [];
        if (rowArr.length > 0) {
          // Incrementar hit count
          await connection.execute(sql`UPDATE did_video_cache SET hit_count = hit_count + 1 WHERE cache_key = ${cacheKey}`);
          return { cached: true, videoUrl: rowArr[0].video_url, photoUrl: rowArr[0].photo_url };
        }
        return { cached: false, videoUrl: null, photoUrl: null };
      }),

    // Salvar vídeo no cache
    save: publicProcedure
      .input(z.object({
        teacherId: z.string(),
        text: z.string(),
        langCode: z.string(),
        didTalkId: z.string().optional(),
        videoUrl: z.string(),
        photoUrl: z.string().optional(),
        durationMs: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const connection = await db.getDb();
        if (!connection) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB not available' });
        const crypto = await import('crypto');
        const textHash = crypto.createHash('sha256').update(input.text).digest('hex');
        const cacheKey = `${input.teacherId}:${textHash}:${input.langCode}`;
        const textPreview = input.text.substring(0, 200);
        const didTalkId = input.didTalkId || null;
        const photoUrl = input.photoUrl || null;
        const durationMs = input.durationMs || null;
        await connection.execute(
          sql`INSERT INTO did_video_cache (cache_key, teacher_id, text_hash, lang_code, did_talk_id, video_url, photo_url, text_preview, duration_ms, status)
           VALUES (${cacheKey}, ${input.teacherId}, ${textHash}, ${input.langCode}, ${didTalkId}, ${input.videoUrl}, ${photoUrl}, ${textPreview}, ${durationMs}, 'done')
           ON DUPLICATE KEY UPDATE video_url = VALUES(video_url), status = 'done', updated_at = NOW()`
        );
        return { success: true, cacheKey };
      }),

    // Estatísticas de cache
    stats: publicProcedure.query(async () => {
      const connection = await db.getDb();
      if (!connection) return { total: 0, totalHits: 0, creditsUsed: 0 };
      const [rows] = await connection.execute(
        'SELECT COUNT(*) as total, SUM(hit_count) as totalHits, SUM(credits_used) as creditsUsed FROM did_video_cache WHERE status = "done"'
      ) as any;
      return rows[0] || { total: 0, totalHits: 0, creditsUsed: 0 };
    }),
  }),

  // ═══════════════════════════════════════════════════════════════
  // INSTAGRAM SHARE — Compartilhar progresso
  // ═══════════════════════════════════════════════════════════════
  instagram: router({
    // Registrar compartilhamento
    share: publicProcedure
      .input(z.object({
        shareType: z.enum(['ar_progress', 'lesson_complete', 'achievement', 'vocabulary']),
        teacherId: z.string().optional(),
        langCode: z.string().optional(),
        xpEarned: z.number().optional(),
        wordsLearned: z.number().optional(),
        screenshotUrl: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const connection = await db.getDb();
        if (!connection) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB not available' });
        const userId = (ctx as any).user?.id || null;
        const igTeacherId = input.teacherId || null;
        const igLangCode = input.langCode || null;
        const igXp = input.xpEarned || 0;
        const igWords = input.wordsLearned || 0;
        const igScreenshot = input.screenshotUrl || null;
        await connection.execute(
          sql`INSERT INTO instagram_shares (user_id, share_type, teacher_id, lang_code, xp_earned, words_learned, screenshot_url)
           VALUES (${userId}, ${input.shareType}, ${igTeacherId}, ${igLangCode}, ${igXp}, ${igWords}, ${igScreenshot})`
        );
        return { success: true };
      }),

    // Contar compartilhamentos
    count: publicProcedure.query(async () => {
      const connection = await db.getDb();
      if (!connection) return { total: 0 };
      const [rows] = await connection.execute('SELECT COUNT(*) as total FROM instagram_shares') as any;
      return { total: rows[0]?.total || 0 };
    }),
  }),

  // ── VR Conversation: Diálogo Imersivo Multi-turno ──────────────────────
  vrConversation: router({
    // Gera resposta do avatar + avalia fala do usuário
    respond: protectedProcedure
      .input(z.object({
        scenario: z.string(),
        avatarName: z.string(),
        avatarRole: z.string(),
        targetLanguage: z.string().default("en-US"),
        history: z.array(z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string(),
        })),
        userMessage: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { invokeLLM } = await import("./_core/llm");
        const safeFallback = {
          text: "Let us continue with a safe language-practice sentence.",
          response: "Let us continue with a safe language-practice sentence.",
          translation: "Vamos continuar com uma frase segura de prática do idioma.",
          phonetic: "lets con-TÍ-niu uíth a sêif LÉN-gwidj PRÁK-tis SÉN-tens.",
          feedback: "Vamos praticar de forma segura.",
          score: 0,
          correction: null,
          suggestions: ["Can we practice a safe phrase?", "Please repeat that.", "Thank you."],
        };
        const inputSafety = await assessConversationText(ctx.user.id, input.userMessage, input.targetLanguage);
        if (!inputSafety.allowed) return safeFallback;
        const langMap: Record<string, string> = {
          "en-US": "English", "es-ES": "Spanish", "fr-FR": "French",
          "de-DE": "German", "it-IT": "Italian", "ja-JP": "Japanese",
          "zh-CN": "Chinese", "ko-KR": "Korean",
        };
        const langName = langMap[input.targetLanguage] || "English";
        const systemPrompt = `You are ${input.avatarName}, a ${input.avatarRole} in a ${input.scenario} scenario.
You help a Brazilian Portuguese speaker practice ${langName}.
Rules:
1. Respond ONLY in ${langName} (short, natural, max 15 words)
2. Evaluate the user's last message for grammar/pronunciation
3. Return JSON with these exact keys:
   - text: your response in ${langName}
   - translation: Portuguese translation of your response
   - phonetic: natural pronunciation guide for Brazilians (syllables in CAPS for stress, e.g. RÊ-lóu)
   - feedback: brief encouraging feedback in Portuguese about user's sentence (max 12 words)
   - score: integer 0-100 for grammar/naturalness
   - correction: corrected version of user's sentence if needed, else null
   - suggestions: array of exactly 3 short natural follow-up responses in ${langName}`;
        const messages: any[] = [
          { role: "system", content: systemPrompt },
          ...input.history.slice(-6),
          { role: "user", content: `User said: "${input.userMessage}". Respond and evaluate.` },
        ];
        const response = await invokeLLM({ messages });
        try {
          const raw = (response.choices[0]?.message?.content as string) || "{}";
          // Extract JSON from markdown code blocks if present
          const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/) || raw.match(/({[\s\S]*})/); 
          const content = jsonMatch ? jsonMatch[1] || jsonMatch[0] : raw;
          const parsed = JSON.parse(content.trim());
          const result = {
            text: parsed.text || "Please continue!",
            response: parsed.text || "Please continue!",
            translation: parsed.translation || "Por favor, continue!",
            phonetic: parsed.phonetic || "",
            feedback: parsed.feedback || "Boa tentativa!",
            score: parsed.score || 70,
            correction: parsed.correction || null,
            suggestions: parsed.suggestions || ["Thank you", "I understand", "Can you repeat?"],
          };
          const outputText = [result.text, result.translation, result.feedback, ...result.suggestions].join("\n");
          const outputSafety = await assessConversationOutput(ctx.user.id, input.userMessage, outputText, input.targetLanguage);
          return outputSafety.allowed ? result : safeFallback;
        } catch {
          return safeFallback;
        }
      }),

    // Conversação Livre Ilimitada — sem roteiro, todos os níveis, vocabulário orgânico
    freeChat: protectedProcedure
      .input(z.object({
        targetLanguage: z.string().default("en-US"),
        nativeLanguage: z.string().default("pt-BR"),
        level: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]).default("A1"),
        topic: z.string().optional(),
        history: z.array(z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string(),
        })),
        userMessage: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { invokeLLM } = await import("./_core/llm");
        const safeFallback = {
          text: "Let us continue with a safe language-practice sentence.",
          translation: "Vamos continuar com uma frase segura de prática do idioma.",
          phonetic: "lets con-TÍ-niu uíth a sêif LÉN-gwidj PRÁK-tis SÉN-tens.",
          feedback: "Vamos praticar de forma segura.",
          score: 0,
          correction: null,
          errorType: null,
          newWords: [],
          suggestions: ["Can we practice a safe phrase?", "Please repeat that.", "Thank you."],
          levelUp: false,
        };
        const inputSafety = await assessConversationText(
          ctx.user.id,
          [input.topic, input.userMessage].filter(Boolean).join("\n"),
          input.targetLanguage,
        );
        if (!inputSafety.allowed) return safeFallback;
        const langMap: Record<string, string> = {
          "en-US": "English", "en-GB": "British English", "es-ES": "Spanish", "es-MX": "Mexican Spanish",
          "fr-FR": "French", "de-DE": "German", "it-IT": "Italian", "ja-JP": "Japanese",
          "zh-CN": "Mandarin Chinese", "ko-KR": "Korean", "ru-RU": "Russian", "ar-SA": "Arabic",
          "pt-PT": "European Portuguese", "nl-NL": "Dutch", "pl-PL": "Polish", "tr-TR": "Turkish",
          "sv-SE": "Swedish", "da-DK": "Danish", "fi-FI": "Finnish", "no-NO": "Norwegian",
          "el-GR": "Greek", "he-IL": "Hebrew", "hi-IN": "Hindi", "vi-VN": "Vietnamese",
          "th-TH": "Thai", "id-ID": "Indonesian", "ms-MY": "Malay", "uk-UA": "Ukrainian",
          "cs-CZ": "Czech", "hu-HU": "Hungarian", "ro-RO": "Romanian", "bg-BG": "Bulgarian",
        };
        const nativeLangMap: Record<string, string> = {
          "pt-BR": "Brazilian Portuguese", "pt-PT": "European Portuguese",
          "es-ES": "Spanish", "en-US": "English", "fr-FR": "French",
          "de-DE": "German", "it-IT": "Italian", "zh-CN": "Chinese",
          "ja-JP": "Japanese", "ko-KR": "Korean", "ru-RU": "Russian",
        };
        const targetLang = langMap[input.targetLanguage] || "English";
        const nativeLang = nativeLangMap[input.nativeLanguage] || "Brazilian Portuguese";
        const levelGuide: Record<"A1" | "A2" | "B1" | "B2" | "C1" | "C2", string> = {
          A1: "Use concrete everyday vocabulary only. Maximum 6 words per sentence and 2 short sentences in total. Ask simple yes/no or object-identification questions. These limits override later open-ended language guidance.",
          A2: "Use common daily vocabulary. Maximum 10 words per sentence and 2 sentences in total. Use simple descriptions, routines, directions, or fill-in-style prompts. These limits override later open-ended language guidance.",
          B1: "Use familiar travel, work, and personal-experience topics. Maximum 18 words per sentence and 3 sentences in total. Invite a simple description or comparison. These limits override later open-ended language guidance.",
          B2: "Use abstract and technical everyday themes. Maximum 25 words per sentence and 3 sentences in total. Allow comparisons, error correction, and supported opinions. These limits override later open-ended language guidance.",
          C1: "Use nuanced academic or professional vocabulary. Maximum 35 words per sentence and 3 sentences in total. Invite paraphrase, argument, or open discussion. These limits override later open-ended language guidance.",
          C2: "Use precise, culturally nuanced language. Maximum 50 words per sentence and 4 sentences in total. Permit debate, rhetorical style, and sophisticated reformulation. These limits override later open-ended language guidance.",
        };
        const levelInstruction = levelGuide[input.level];
        const topicContext = input.topic ? `The conversation topic is: ${input.topic}.` : "The topic is completely open — follow the user's lead naturally, like a real conversation.";
        const systemPrompt = `You are a native ${targetLang} speaker having a real, unlimited, natural conversation with a ${nativeLang} learner.\n\nLevel: ${input.level.toUpperCase()} \u2014 ${levelInstruction}\n${topicContext}\n\nCore rules:\n- Speak as a real person, NOT as a teacher giving exercises\n- Match the user's level but naturally introduce 1-2 new words per response\n- This conversation has NO turn limit \u2014 continue naturally as long as the user wants\n- If user makes an error, weave a gentle correction INTO your response naturally (don't lecture)\n- Extract vocabulary organically from the conversation context\n- Respond in ${targetLang} naturally, with no artificial length constraints\n\nReturn JSON with these exact keys:\n- text: your natural response in ${targetLang} (no word limit)\n- translation: ${nativeLang} translation\n- phonetic: pronunciation guide for ${nativeLang} speakers (stress syllables in CAPS)\n- feedback: brief encouraging note in ${nativeLang} (max 10 words)\n- score: integer 0-100 for naturalness/grammar\n- correction: corrected version of user's sentence if needed, else null\n- errorType: grammar, vocabulary, pronunciation, comprehension, or null when no correction is needed\n- newWords: array of 1-3 vocabulary objects {word, translation, phonetic, example} from this response\n- suggestions: array of 3 natural follow-up responses in ${targetLang} the user could say\n- levelUp: boolean \u2014 true if user seems ready for the next level`;
        const messages: any[] = [
          { role: "system", content: systemPrompt },
          ...input.history.slice(-14),
          { role: "user", content: input.userMessage },
        ];
        const response = await invokeLLM({ messages, response_format: { type: "json_object" } });
        try {
          const content = (response.choices[0]?.message?.content as string) || "{}";
          const parsed = JSON.parse(content);
          const outputText = [parsed.text, parsed.translation, parsed.feedback, ...(Array.isArray(parsed.suggestions) ? parsed.suggestions : [])]
            .filter((value): value is string => typeof value === "string")
            .join("\n");
          const outputSafety = await assessConversationOutput(ctx.user.id, input.userMessage, outputText, input.targetLanguage);
          return outputSafety.allowed ? parsed : safeFallback;
        } catch {
          return safeFallback;
        }
      }),

    // Inicia conversa — primeira fala do avatar
    start: protectedProcedure
      .input(z.object({
        scenario: z.string(),
        avatarName: z.string(),
        avatarRole: z.string(),
        targetLanguage: z.string().default("en-US"),
      }))
      .mutation(async ({ input, ctx }) => {
        const safeFallback = {
          text: "Hello! Let us practice a safe phrase.",
          translation: "Olá! Vamos praticar uma frase segura.",
          phonetic: "rrê-lóu! lets PRÁK-tis a sêif frêiz.",
          suggestions: ["Can we practice a safe phrase?", "Please repeat that.", "Thank you."],
        };
        await ensureConversationAccess(ctx.user.id);
        const { invokeLLM } = await import("./_core/llm");
        const langMap: Record<string, string> = {
          "en-US": "English", "es-ES": "Spanish", "fr-FR": "French",
          "de-DE": "German", "it-IT": "Italian", "ja-JP": "Japanese",
          "zh-CN": "Chinese", "ko-KR": "Korean",
        };
        const langName = langMap[input.targetLanguage] || "English";
        const response = await invokeLLM({
          messages: [
            { role: "system", content: `You are ${input.avatarName}, a ${input.avatarRole}. Greet a Brazilian Portuguese speaker who wants to practice ${langName} in a ${input.scenario} scenario. Return JSON with: text (greeting in ${langName}, max 12 words), translation (Portuguese), phonetic (pronunciation for Brazilians), suggestions (array of 3 short responses in ${langName}).` },
            { role: "user", content: "Start the conversation with a natural greeting." },
          ],
        });
        try {
          const raw = (response.choices[0]?.message?.content as string) || "{}";
          const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/) || raw.match(/({[\s\S]*})/);
          const content = jsonMatch ? jsonMatch[1] || jsonMatch[0] : raw;
          const parsed = JSON.parse(content.trim());
          const result = {
            text: parsed.text || `Hello! Welcome. How can I help you?`,
            translation: parsed.translation || "Olá! Bem-vindo(a). Como posso ajudá-lo(a)?",
            phonetic: parsed.phonetic || "RRÊ-lóu! UÉL-cam.",
            suggestions: parsed.suggestions || ["I need help", "I have a question", "Nice to meet you"],
          };
          const outputSafety = await assessConversationOutput(
            ctx.user.id,
            "Start a safe language-practice conversation.",
            [result.text, result.translation, ...result.suggestions].join("\n"),
            input.targetLanguage,
          );
          return outputSafety.allowed ? result : safeFallback;
        } catch {
          return safeFallback;
        }
      }),
  }),

  // ── Tiny Lesson: Vocabulário Situacional por IA ──────────────────────
  tinyLesson: router({
    // Gera vocabulário contextual por situação real
    generateByScenario: protectedProcedure
      .input(z.object({
        scenario: z.string(),
        targetLanguage: z.string().default("en-US"),
        nativeLanguage: z.string().default("pt-BR"),
        count: z.number().min(5).max(20).default(10),
      }))
      .mutation(async ({ input }) => {
        const { invokeLLM } = await import("./_core/llm");
        const langNames: Record<string, string> = {
          "en-US": "English", "pt-BR": "Português", "es-ES": "Español",
          "fr-FR": "Français", "de-DE": "Deutsch", "it-IT": "Italiano",
          "ja-JP": "Japonês", "zh-CN": "Chinês", "ko-KR": "Coreano",
          "ru-RU": "Russo", "ar-SA": "Árabe",
        };
        const targetName = langNames[input.targetLanguage] || input.targetLanguage;
        const nativeName = langNames[input.nativeLanguage] || input.nativeLanguage;
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are a language teaching expert. Generate contextual vocabulary for real-life situations. Always respond with a JSON object containing a 'vocabulary' array." },
            { role: "user", content: `Generate ${input.count} essential vocabulary words/phrases for the scenario: "${input.scenario}".
Target language: ${targetName}. Native language: ${nativeName}.

Return JSON object: {"vocabulary": [{"word": "word in ${targetName}", "translation": "translation in ${nativeName}", "phonetic": "natural pronunciation for Brazilian Portuguese speakers (e.g.: RÊ-lóu, TRÊ-vel)", "emoji": "relevant emoji", "example": "example sentence in ${targetName}", "exampleTranslation": "example sentence in ${nativeName}", "category": "category"}]}` },
          ],
          response_format: { type: "json_object" },
        });
        let vocab: any[] = [];
        try {
          const content = (response.choices[0]?.message?.content as string) || "{}";
          const parsed = JSON.parse(content);
          vocab = Array.isArray(parsed) ? parsed : (parsed.vocabulary || parsed.words || []);
        } catch { vocab = []; }
        return { vocabulary: vocab, scenario: input.scenario, targetLanguage: input.targetLanguage };
      }),

    // Frase do dia por situação
    phraseOfTheDay: protectedProcedure
      .input(z.object({
        targetLanguage: z.string().default("en-US"),
        nativeLanguage: z.string().default("pt-BR"),
      }))
      .query(async ({ input }) => {
        const { invokeLLM } = await import("./_core/llm");
        const scenarios = ["restaurante", "trabalho", "viagem", "compras", "saúde", "família", "esportes", "tecnologia"];
        const scenario = scenarios[Math.floor(Date.now() / 86400000) % scenarios.length];
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "Generate a useful daily phrase for language learners. Respond in JSON only with keys: phrase, translation, phonetic, scenario, tip." },
            { role: "user", content: `Generate 1 useful phrase for scenario "${scenario}" in ${input.targetLanguage}. Return JSON with keys: phrase, translation, phonetic (natural pronunciation for Brazilians), scenario, tip (brief cultural tip in Portuguese).` },
          ],
          response_format: { type: "json_object" },
        });
        try {
          const content = (response.choices[0]?.message?.content as string) || "{}";
          return JSON.parse(content);
        } catch {
          return { phrase: "Can I have the menu, please?", translation: "Pode me trazer o cardápio, por favor?", phonetic: "kên ai rrêv dê MÊ-niu, plíiz?", scenario, tip: "Frase essencial em restaurantes" };
        }
      }),
  }),

  // ── Ranking Global ───────────────────────────────────────────────────────
  ranking: router({
    getLeaderboard: publicProcedure
      .input(z.object({ period: z.enum(["weekly", "monthly", "alltime"]).default("weekly"), limit: z.number().default(20) }))
      .query(async ({ input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) return [];
        const { globalRanking } = await import("../drizzle/schema");
        const { desc } = await import("drizzle-orm");
        const col = input.period === "weekly" ? globalRanking.weeklyXp : input.period === "monthly" ? globalRanking.monthlyXp : globalRanking.totalXp;
        const rows = await dbInstance.select().from(globalRanking).orderBy(desc(col)).limit(input.limit);
        return rows.map((r: any, i: number) => ({ ...r, rank: i + 1 }));
      }),
    upsertScore: protectedProcedure
      .input(z.object({ xpDelta: z.number(), conversationCompleted: z.boolean().optional(), wordsLearned: z.number().optional(), perfectScore: z.boolean().optional(), streakDelta: z.number().optional() }))
      .mutation(async ({ ctx, input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) return { ok: false };
        const { globalRanking } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        const existing = await dbInstance.select().from(globalRanking).where(eq(globalRanking.userId, ctx.user.id)).limit(1);
        if (existing.length === 0) {
          await dbInstance.insert(globalRanking).values({ userId: ctx.user.id, userName: ctx.user.name || "Estudante", totalXp: input.xpDelta, weeklyXp: input.xpDelta, monthlyXp: input.xpDelta, conversationsCompleted: input.conversationCompleted ? 1 : 0, wordsLearned: input.wordsLearned || 0, perfectScores: input.perfectScore ? 1 : 0, currentStreak: input.streakDelta || 0, longestStreak: input.streakDelta || 0 });
        } else {
          const cur = existing[0];
          const newStreak = (cur.currentStreak || 0) + (input.streakDelta || 0);
          await dbInstance.update(globalRanking).set({ totalXp: (cur.totalXp || 0) + input.xpDelta, weeklyXp: (cur.weeklyXp || 0) + input.xpDelta, monthlyXp: (cur.monthlyXp || 0) + input.xpDelta, conversationsCompleted: (cur.conversationsCompleted || 0) + (input.conversationCompleted ? 1 : 0), wordsLearned: (cur.wordsLearned || 0) + (input.wordsLearned || 0), perfectScores: (cur.perfectScores || 0) + (input.perfectScore ? 1 : 0), currentStreak: newStreak, longestStreak: Math.max(cur.longestStreak || 0, newStreak), level: Math.floor(((cur.totalXp || 0) + input.xpDelta) / 500) + 1 }).where(eq(globalRanking.userId, ctx.user.id));
        }
        return { ok: true };
      }),
    myStats: protectedProcedure.query(async ({ ctx }) => {
      const dbInstance = await db.getDb();
      if (!dbInstance) return null;
      const { globalRanking } = await import("../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const rows = await dbInstance.select().from(globalRanking).where(eq(globalRanking.userId, ctx.user.id)).limit(1);
      return rows[0] || null;
    }),
  }),

  // ── Desafio Diário ───────────────────────────────────────────────────────
  dailyChallenge: router({
    getToday: protectedProcedure.query(async ({ ctx }) => {
      const dbInstance = await db.getDb();
      if (!dbInstance) return null;
      const { dailyChallenges } = await import("../drizzle/schema");
      const { eq, and } = await import("drizzle-orm");
      const today = new Date().toISOString().split("T")[0];
      const existing = await dbInstance.select().from(dailyChallenges).where(and(eq(dailyChallenges.userId, ctx.user.id), eq(dailyChallenges.challengeDate, today))).limit(1);
      if (existing.length > 0) return existing[0];
      const scenarios = ["restaurante","hotel","aeroporto","táxi","médico","banco","loja","emergência","escola","parque","cinema","farmácia"];
      const langs = ["en-US","es-ES","fr-FR","de-DE"];
      const scenario = scenarios[Math.floor(Date.now() / 86400000) % scenarios.length];
      const lang = langs[Math.floor(Date.now() / 86400000) % langs.length];
      const inserted = await dbInstance.insert(dailyChallenges).values({ userId: ctx.user.id, challengeDate: today, scenario, targetLanguage: lang });
      return { userId: ctx.user.id, challengeDate: today, scenario, targetLanguage: lang, conversationCompleted: false, wordGameCompleted: false, pronunciationScore: 0, xpEarned: 0, bonusEarned: false };
    }),
    complete: protectedProcedure
      .input(z.object({ type: z.enum(["conversation","wordgame"]), pronunciationScore: z.number().optional() }))
      .mutation(async ({ ctx, input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) return { ok: false };
        const { dailyChallenges } = await import("../drizzle/schema");
        const { eq, and } = await import("drizzle-orm");
        const today = new Date().toISOString().split("T")[0];
        const existing = await dbInstance.select().from(dailyChallenges).where(and(eq(dailyChallenges.userId, ctx.user.id), eq(dailyChallenges.challengeDate, today))).limit(1);
        if (existing.length === 0) return { ok: false };
        const cur = existing[0];
        const updates: any = {};
        if (input.type === "conversation") { updates.conversationCompleted = true; updates.pronunciationScore = input.pronunciationScore || 0; updates.xpEarned = (cur.xpEarned || 0) + 100; }
        if (input.type === "wordgame") { updates.wordGameCompleted = true; updates.xpEarned = (cur.xpEarned || 0) + 50; }
        const bothDone = (input.type === "conversation" ? true : cur.conversationCompleted) && (input.type === "wordgame" ? true : cur.wordGameCompleted);
        if (bothDone) { updates.bonusEarned = true; updates.xpEarned = (updates.xpEarned || cur.xpEarned || 0) + 200; updates.completedAt = new Date(); }
        await dbInstance.update(dailyChallenges).set(updates).where(and(eq(dailyChallenges.userId, ctx.user.id), eq(dailyChallenges.challengeDate, today)));
        return { ok: true, bonusEarned: bothDone, xpEarned: updates.xpEarned };
      }),
  }),


  // ── Sessões VR ───────────────────────────────────────────────────────────
  vrSession: router({
    save: protectedProcedure
      .input(z.object({ scenario: z.string(), targetLanguage: z.string(), mode: z.string().default("screen"), totalTurns: z.number(), avgPronunciationScore: z.number(), avgGrammarScore: z.number(), xpEarned: z.number(), completed: z.boolean(), durationSeconds: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) return { ok: false };
        const { vrSessions } = await import("../drizzle/schema");
        await dbInstance.insert(vrSessions).values({ userId: ctx.user.id, ...input });
        return { ok: true };
      }),
    getHistory: protectedProcedure
      .input(z.object({ limit: z.number().default(20) }))
      .query(async ({ ctx, input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) return [];
        const { vrSessions } = await import("../drizzle/schema");
        const { eq, desc } = await import("drizzle-orm");
        return dbInstance.select().from(vrSessions).where(eq(vrSessions.userId, ctx.user.id)).orderBy(desc(vrSessions.createdAt)).limit(input.limit);
      }),
  }),

  // ── PolyLesson: Professor fala, explica, conversa ────────────────────────
  polyLesson: router({
    // Professor responde ao aluno em conversa natural durante a aula
    teacherChat: protectedProcedure
      .input(z.object({
        message: z.string(),
        targetLanguage: z.string(),
        nativeLanguage: z.string().min(2),
        cefrLevel: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
        teacherName: z.string().default('Professor'),
        teacherGender: z.enum(['male', 'female']).default('female'),
        phase: z.string().default('infancia'),
        currentWord: z.string().optional(),
        lessonTitle: z.string().optional(),
        history: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() })).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await ensureConversationAccess(ctx.user.id);
        const { invokeLLM } = await import('./_core/llm');
        const safeFallback = { reply: '', teacherName: input.teacherName };
        const inputSafety = await assessConversationText(ctx.user.id, input.message, input.targetLanguage);
        if (!inputSafety.allowed) return safeFallback;
        const cefrLabels: Record<'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2', string> = {
          A1: 'concrete vocabulary and very short phrases',
          A2: 'everyday routines and connected simple sentences',
          B1: 'familiar topics and personal opinions',
          B2: 'detailed explanations and comparisons',
          C1: 'nuanced discussion with precise vocabulary',
          C2: 'flexible, idiomatic, and highly precise conversation',
        };
        const systemPrompt = `You are ${input.teacherName}, a teacher of ${input.targetLanguage} for speakers of ${input.nativeLanguage}.

Student CEFR level: ${input.cefrLevel} — ${cefrLabels[input.cefrLevel]}.
Current lesson word/topic: ${input.currentWord || input.lessonTitle || 'the current lesson vocabulary'}.

Teaching style:
- Explain and encourage in ${input.nativeLanguage}.
- Use ${input.targetLanguage} only for the words or phrases being taught, then explain them in ${input.nativeLanguage}.
- Be warm, concise, patient, and age-appropriate.
- Correct errors gently and celebrate progress.
- Keep replies to 3–4 sentences and stay within the lesson topic.`;
        const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
          { role: 'system', content: systemPrompt },
          ...(input.history || []).slice(-8),
          { role: 'user', content: input.message },
        ];
        const response = await invokeLLM({ messages });
        const reply = (response.choices[0]?.message?.content as string) || '';
        const outputSafety = await assessConversationOutput(ctx.user.id, input.message, reply, input.targetLanguage);
        return outputSafety.allowed ? { reply, teacherName: input.teacherName } : safeFallback;
      }),
    // Gerar frase de apresentação inicial do professor para cada palavra
    wordIntro: protectedProcedure
      .input(z.object({
        word: z.string(),
        translation: z.string(),
        phonetic: z.string().optional(),
        example: z.string().optional(),
        targetLanguage: z.string(),
        nativeLanguage: z.string().min(2),
        cefrLevel: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
        phase: z.string().default('infancia'),
        teacherName: z.string().default('Professor'),
      }))
      .mutation(async ({ input, ctx }) => {
        await ensureConversationAccess(ctx.user.id);
        const { invokeLLM } = await import('./_core/llm');
        const response = await invokeLLM({
          messages: [{
            role: 'user',
            content: `Você é ${input.teacherName}, professor(a) de ${input.targetLanguage}. Crie uma apresentação curta (2-3 frases em ${input.nativeLanguage}) para ensinar a palavra "${input.word}" (= ${input.translation}) ao aluno. Nível CEFR: ${input.cefrLevel}. Pronúncia figurada para ${input.nativeLanguage}: ${input.phonetic || ''}. Exemplo: ${input.example || ''}. Seja caloroso(a), use emoji, explique quando usar essa palavra na vida real. Máximo 3 frases.`,
          }],
        });
        return { intro: (response.choices[0]?.message?.content as string) || '' };
      }),
    // Avaliar resposta do aluno e dar feedback pedagógico
    evaluateAnswer: protectedProcedure
      .input(z.object({
        studentAnswer: z.string(),
        correctAnswer: z.string(),
        word: z.string(),
        targetLanguage: z.string(),
        nativeLanguage: z.string().min(2),
        cefrLevel: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
        phase: z.string().default('infancia'),
        teacherName: z.string().default('Professor'),
      }))
      .mutation(async ({ input, ctx }) => {
        await ensureConversationAccess(ctx.user.id);
        const { invokeLLM } = await import('./_core/llm');
        const isCorrect = input.studentAnswer.toLowerCase().trim() === input.correctAnswer.toLowerCase().trim();
        const response = await invokeLLM({
          messages: [{
            role: 'user',
            content: `Você é ${input.teacherName}, professor(a) de ${input.targetLanguage}. O aluno respondeu "${input.studentAnswer}" para a palavra "${input.word}" (resposta correta: "${input.correctAnswer}"). ${isCorrect ? 'O aluno ACERTOU!' : 'O aluno ERROU.'} Dê um feedback encorajador em ${input.nativeLanguage} (máximo 2 frases) para o nível CEFR ${input.cefrLevel}. ${isCorrect ? 'Celebre o acerto com entusiasmo!' : 'Corrija gentilmente e explique a resposta certa.'} Use emoji.`,
          }],
        });
        return {
          isCorrect,
          feedback: (response.choices[0]?.message?.content as string) || '',
          quality: isCorrect ? 4 : 1,
        };
      }),
    // Pergunta contextual por ambiente (cartilha): "O que tem com a letra A na cozinha?"
    cartilhaQuestion: protectedProcedure
      .input(z.object({
        letter: z.string(),
        environment: z.string(), // cozinha, quarto, escola, jardim, etc.
        targetLanguage: z.string(),
        nativeLanguage: z.string().min(2),
        cefrLevel: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
        phase: z.string().default('infancia'),
        teacherName: z.string().default('Professor'),
        knownWords: z.array(z.string()).optional(), // words already taught
      }))
      .mutation(async ({ input, ctx }) => {
        await ensureConversationAccess(ctx.user.id);
        const { invokeLLM } = await import('./_core/llm');
        const response = await invokeLLM({
          messages: [{
            role: 'user',
            content: `Você é ${input.teacherName}, professor(a) de ${input.targetLanguage} para crianças. 
Crie uma pergunta lúdica de cartilha para ensinar a letra "${input.letter.toUpperCase()}" no ambiente "${input.environment}".

Tarefa: gere uma lista de 5-8 palavras em ${input.targetLanguage} que:
1. Começam com a letra "${input.letter.toUpperCase()}"
2. São objetos/coisas encontradas em "${input.environment}"
3. Respeitam o nível CEFR ${input.cefrLevel} e usam vocabulário concreto adequado
4. São diferentes das já conhecidas: ${(input.knownWords || []).join(', ') || 'nenhuma ainda'}

Retorne JSON com:
{
  "question": "pergunta em ${input.nativeLanguage} (ex: O que tem com a letra A na cozinha?)",
  "questionInTarget": "mesma pergunta em ${input.targetLanguage}",
  "words": [
    {
      "word": "palavra em ${input.targetLanguage}",
      "translation": "tradução em ${input.nativeLanguage}",
      "phonetic": "como soa em ${input.nativeLanguage} (ex: Á-pol para apple, rê-lôu para hello, dóg para dog, cãt para cat) — use vogais CORRETAS, nunca IPA",
      "emoji": "emoji relevante",
      "hint": "dica visual em ${input.nativeLanguage} (ex: é o que você usa para comer)"
    }
  ],
  "teacherIntro": "frase animada do professor em ${input.nativeLanguage} introduzindo o ambiente (máx 2 frases, use emoji)",
  "celebration": "frase de celebração quando o aluno acerta (em ${input.nativeLanguage}, use emoji)"
}`,
          }],
          response_format: { type: 'json_object' },
        });
        try {
          const rawContent2 = response.choices[0]?.message?.content as string || '{}';
          const cleanedContent2 = rawContent2.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
          const data = JSON.parse(cleanedContent2);
          return data;
        } catch {
          return {
            question: '',
            questionInTarget: '',
            words: [],
            teacherIntro: '',
            celebration: '',
          };
        }
      }),

    familiaScene: protectedProcedure
      .input(z.object({
        targetLanguage: z.string(),
        nativeLanguage: z.string().min(2),
        cefrLevel: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
        phase: z.string().default('infancia'),
        teacherName: z.string().optional(),
        lessonTitle: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await ensureConversationAccess(ctx.user.id);
        const { invokeLLM } = await import('./_core/llm');
        const { generateImage } = await import('./_core/imageGeneration');
        const phaseLabel: Record<'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2', string> = {
          A1: 'concrete family and home vocabulary with very short phrases',
          A2: 'everyday family routines with simple connected phrases',
          B1: 'personal descriptions and familiar experiences',
          B2: 'comparisons and detailed family perspectives',
          C1: 'nuanced family, culture, and relationship descriptions',
          C2: 'flexible, precise discussion of family and social contexts',
        };
        const prompt = `You are a language teacher. Create a family scene lesson for ${input.cefrLevel} ${input.targetLanguage} learners.
Difficulty: ${phaseLabel[input.cefrLevel]}. Lesson: ${input.lessonTitle || 'family and home'}.

Return ONLY valid JSON:
{
  "imagePrompt": "detailed prompt for a warm, colorful illustration of a diverse family scene (living room, kitchen, or garden) suitable for language learning",
  "questions": [
    {"question": "question in ${input.nativeLanguage} about the family photo", "answer": "correct answer in ${input.targetLanguage}", "options": ["correct", "wrong1", "wrong2", "wrong3"]},
    {"question": "...", "answer": "...", "options": ["...", "...", "...", "..."]},
    {"question": "...", "answer": "...", "options": ["...", "...", "...", "..."]}
  ],
  "vocabulary": [
    {"word": "family word in ${input.targetLanguage}", "translation": "in ${input.nativeLanguage}", "emoji": "emoji"},
    {"word": "...", "translation": "...", "emoji": "..."}
  ],
  "teacherIntro": "warm intro message in ${input.nativeLanguage} about the family scene"
}

Provide 3 questions about the family (who is in the photo, what are they doing, where are they) and 8 vocabulary words related to family and home.`;
        try {
          const raw = await invokeLLM({ messages: [{ role: 'user', content: prompt }] });
          const text = String(raw.choices[0].message.content || '{}');
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          const data = JSON.parse(jsonMatch ? jsonMatch[0] : text);
          // Generate family image
          let imageUrl = null;
          try {
            const imgResult = await generateImage({ prompt: (data.imagePrompt || 'A warm, colorful illustration of a happy diverse family in their living room, cartoon style, bright colors, suitable for children language learning') + ', digital art, vibrant, friendly' });
            imageUrl = imgResult.url;
          } catch { /* image generation optional */ }
          return {
            imageUrl,
            questions: Array.isArray(data.questions) ? data.questions : [],
            vocabulary: Array.isArray(data.vocabulary) ? data.vocabulary : [],
            teacherIntro: typeof data.teacherIntro === 'string' ? data.teacherIntro : '',
          };
        } catch {
          return {
            imageUrl: null,
            questions: [],
            vocabulary: [],
            teacherIntro: '',
          };
        }
      }),

    // ── Treinamento de Estrutura Frasal (como nativos aprendem) ──────────────
    structureTraining: protectedProcedure
      .input(z.object({
        targetLanguage: z.string(),
        nativeLanguage: z.string().min(2),
        cefrLevel: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
        phase: z.string(),
        vocabulary: z.array(z.string()).optional(),
        lessonTitle: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await ensureConversationAccess(ctx.user.id);
        const { invokeLLM } = await import('./_core/llm');
        const phaseLabel: Record<'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2', string> = {
          A1: 'concreto e introdutório', A2: 'cotidiano elementar', B1: 'independente em situações comuns',
          B2: 'independente com ideias mais complexas', C1: 'avançado e preciso', C2: 'domínio muito avançado',
        };
        const vocabHint = input.vocabulary && input.vocabulary.length > 0
          ? 'Use estas palavras do vocabulário da aula: ' + input.vocabulary.slice(0, 8).join(', ') + '.'
          : '';
        const prompt = `Você é um professor de ${input.targetLanguage} ensinando nativos de ${input.nativeLanguage}.
Nível CEFR: ${input.cefrLevel} (${phaseLabel[input.cefrLevel]}). Lição: ${input.lessonTitle || 'vocabulário geral'}.
${vocabHint}

Crie um módulo de ESTRUTURA FRASAL como nativos aprendem: observação → substituição → criação.
Retorne JSON com esta estrutura exata:
{
  "patterns": [
    {
      "pattern": "rótulo curto da estrutura em ${input.nativeLanguage}",
      "example": "frase modelo em ${input.targetLanguage}",
      "exampleTranslation": "tradução em ${input.nativeLanguage}",
      "slots": [
        { "role": "rótulo em ${input.nativeLanguage}", "options": [{ "word": "termo em ${input.targetLanguage}", "translation": "sentido em ${input.nativeLanguage}" }] }
      ],
      "chunks": [{ "chunk": "expressão em ${input.targetLanguage}", "meaning": "sentido em ${input.nativeLanguage}", "note": "observação curta em ${input.nativeLanguage}" }]
    }
  ]
}
Retorne APENAS o JSON, sem markdown.`;
        try {
          const response = await invokeLLM({
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' } as { type: 'json_object' },
          });
          const content = typeof response.choices[0].message.content === 'string'
            ? response.choices[0].message.content
            : JSON.stringify(response.choices[0].message.content);
          return JSON.parse(content);
        } catch {
          return { patterns: [] };
        }
      }),

    // ── Conversa sobre estrutura frasal (professor responde dúvidas) ──────────
    structureChat: protectedProcedure
      .input(z.object({
        targetLanguage: z.string(),
        nativeLanguage: z.string().min(2),
        cefrLevel: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
        sentence: z.string(),
        studentMessage: z.string(),
        history: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() })).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await ensureConversationAccess(ctx.user.id);
        const { invokeLLM } = await import('./_core/llm');
        const inputSafety = await assessConversationText(ctx.user.id, [input.sentence, input.studentMessage].join('\n'), input.targetLanguage);
        if (!inputSafety.allowed) return { reply: '', blocked: true };
        const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
          {
            role: 'system',
            content: `Você é um professor de ${input.targetLanguage} para falantes de ${input.nativeLanguage}, no nível CEFR ${input.cefrLevel}.
Estamos estudando a frase: "${input.sentence}"
Responda em ${input.nativeLanguage}, de forma simples e encorajadora para o nível ${input.cefrLevel}.
Se o aluno errar a estrutura, corrija gentilmente e dê um exemplo novo.
Máximo 2 frases por resposta.`,
          },
          ...(input.history || []),
          { role: 'user', content: input.studentMessage },
        ];
        const response = await invokeLLM({ messages });
        const content = typeof response.choices[0].message.content === 'string'
          ? response.choices[0].message.content
          : JSON.stringify(response.choices[0].message.content);
        const outputSafety = await assessConversationOutput(
          ctx.user.id,
          [input.sentence, input.studentMessage].join('\n'),
          content,
          input.targetLanguage,
        );
        return outputSafety.allowed ? { reply: content, blocked: false } : { reply: '', blocked: true };
      }),
    // ── Cenas com Professor (professor dentro da ilustração) ─────────────────
    sceneLesson: protectedProcedure
      .input(z.object({
        targetLanguage: z.string(),
        nativeLanguage: z.string().default('pt-BR'),
        phase: z.string(),
        sceneId: z.string(),
        lessonTitle: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { invokeLLM } = await import('./_core/llm');
        const { generateImage } = await import('./_core/imageGeneration');
        const sceneNames: Record<string, string> = {
          kitchen: 'cozinha', park: 'parque', school: 'escola', market: 'mercado',
          bedroom: 'quarto', beach: 'praia', office: 'escritório', restaurant: 'restaurante',
          living_room: 'sala de estar', garden: 'jardim', hospital: 'hospital', airport: 'aeroporto',
        };
        const sceneName = sceneNames[input.sceneId] || input.sceneId;
        const phaseLabel = input.phase === 'infancia' ? 'children basic level'
          : input.phase === 'crianca' ? 'elementary level'
          : input.phase === 'adolescencia' ? 'intermediate level'
          : 'advanced level';
        const imagePrompt = 'A bright colorful educational illustration of a ' + input.sceneId.replace('_', ' ') + ', ' + phaseLabel + '. A friendly teacher character stands inside the scene pointing at objects. Rich with labeled objects and activities. Cartoon style, vibrant colors, educational poster quality, no text overlays.';
        let imageUrl: string | null = null;
        try {
          const imgResult = await generateImage({ prompt: imagePrompt });
          imageUrl = imgResult.url || null;
        } catch { imageUrl = null; }
        const prompt = 'You teach ' + input.targetLanguage + ' to speakers of ' + input.nativeLanguage + '.\nScene: ' + sceneName + ' (' + input.sceneId + '). Level: ' + phaseLabel + '.\n\nCreate educational content for this scene. Return JSON only:\n{\n  "teacherIntro": "one welcoming sentence in ' + input.nativeLanguage + '",\n  "sceneDescription": "1-2 sentences in ' + input.targetLanguage + '",\n  "sceneDescriptionTranslation": "the same description in ' + input.nativeLanguage + '",\n  "objects": [\n    { "word": "word in ' + input.targetLanguage + '", "translation": "translation in ' + input.nativeLanguage + '", "emoji": "📝", "phonetic": "figurative pronunciation written for a ' + input.nativeLanguage + ' speaker, never IPA" }\n  ],\n  "questions": [\n    { "question": "open question in ' + input.nativeLanguage + '", "questionInTarget": "same question in ' + input.targetLanguage + '", "suggestedAnswer": "suggested answer in ' + input.targetLanguage + '", "answerTranslation": "answer translation in ' + input.nativeLanguage + '" }\n  ],\n  "conversationStarters": [\n    "conversation starter in ' + input.targetLanguage + '"\n  ]\n}\nNever use a third language. Include 8-12 objects and 4-6 questions.';
        try {
          const response = await invokeLLM({
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' } as { type: 'json_object' },
          });
          const content = typeof response.choices[0].message.content === 'string'
            ? response.choices[0].message.content
            : JSON.stringify(response.choices[0].message.content);
          const data = JSON.parse(content);
          return { ...data, imageUrl };
        } catch {
          return {
            imageUrl,
            teacherIntro: '',
            sceneDescription: '',
            sceneDescriptionTranslation: '',
            objects: [],
            questions: [],
            conversationStarters: [],
          };
        }
      }),

    // ── Chat livre sobre a cena ───────────────────────────────────────────────
    sceneChat: protectedProcedure
      .input(z.object({
        targetLanguage: z.string(),
        nativeLanguage: z.string().default('pt-BR'),
        sceneId: z.string(),
        sceneDescription: z.string(),
        studentMessage: z.string(),
        history: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() })).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { invokeLLM } = await import('./_core/llm');
        const safeFallback = { reply: "", blocked: true };
        const inputSafety = await assessConversationText(
          ctx.user.id,
          [input.sceneDescription, input.studentMessage].join("\n"),
          input.targetLanguage,
        );
        if (!inputSafety.allowed) return safeFallback;
        const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
          {
            role: 'system',
            content: 'Você é um professor de ' + input.targetLanguage + ' dentro de uma cena de ' + input.sceneId.replace('_', ' ') + '.\nCena: ' + input.sceneDescription + '\nVocê está apontando para objetos e conversando com o aluno sobre o que ele vê.\nApresente sempre a expressão em ' + input.targetLanguage + ' e explique somente em ' + input.nativeLanguage + '. Não use um terceiro idioma.\nSe o aluno errar, corrija gentilmente e repita a forma correta.\nFaça perguntas sobre a cena para manter a conversa.\nMáximo 3 frases por resposta.',
          },
          ...(input.history || []),
          { role: 'user', content: input.studentMessage },
        ];
        try {
          const response = await invokeLLM({ messages });
          const content = typeof response.choices[0].message.content === 'string'
            ? response.choices[0].message.content
            : JSON.stringify(response.choices[0].message.content);
          const outputSafety = await assessConversationOutput(ctx.user.id, input.studentMessage, content, input.targetLanguage);
          return outputSafety.allowed ? { reply: content } : safeFallback;
        } catch {
          return safeFallback;
        }
      }),
  }),
  // ── SRS Progress ─────────────────────────────────────────────────────────
  srs: router({
    upsert: protectedProcedure
      .input(z.object({ word: z.string(), translation: z.string(), targetLanguage: z.string(), category: z.string().optional(), quality: z.number().min(0).max(5) }))
      .mutation(async ({ ctx, input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) return { ok: false };
        const { srsProgress } = await import("../drizzle/schema");
        const { eq, and } = await import("drizzle-orm");
        const existing = await dbInstance.select().from(srsProgress).where(and(eq(srsProgress.userId, ctx.user.id), eq(srsProgress.word, input.word), eq(srsProgress.targetLanguage, input.targetLanguage))).limit(1);
        const q = input.quality;
        if (existing.length === 0) {
          const ef = Math.max(1.3, 2.5 + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
          const interval = q >= 3 ? 1 : 1;
          const nextReview = new Date(Date.now() + interval * 86400000);
          await dbInstance.insert(srsProgress).values({ userId: ctx.user.id, word: input.word, translation: input.translation, targetLanguage: input.targetLanguage, category: input.category, easeFactor: ef, interval: interval, repetitions: q >= 3 ? 1 : 0, nextReview, totalCorrect: q >= 3 ? 1 : 0, totalWrong: q < 3 ? 1 : 0 });
        } else {
          const cur = existing[0];
          const ef = Math.max(1.3, (cur.easeFactor || 2.5) + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
          const reps = q >= 3 ? (cur.repetitions || 0) + 1 : 0;
          const interval = reps === 0 ? 1 : reps === 1 ? 6 : Math.round((cur.interval || 1) * ef);
          const nextReview = new Date(Date.now() + interval * 86400000);
          await dbInstance.update(srsProgress).set({ easeFactor: ef, interval: interval, repetitions: reps, nextReview, totalCorrect: (cur.totalCorrect || 0) + (q >= 3 ? 1 : 0), totalWrong: (cur.totalWrong || 0) + (q < 3 ? 1 : 0), lastSeen: new Date() }).where(eq(srsProgress.id, cur.id));
        }
        return { ok: true };
      }),
    getDue: protectedProcedure
      .input(z.object({ targetLanguage: z.string(), limit: z.number().default(20) }))
      .query(async ({ ctx, input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) return [];
        const { srsProgress } = await import("../drizzle/schema");
        const { eq, and, lte } = await import("drizzle-orm");
        return dbInstance.select().from(srsProgress).where(and(eq(srsProgress.userId, ctx.user.id), eq(srsProgress.targetLanguage, input.targetLanguage), lte(srsProgress.nextReview, new Date()))).limit(input.limit);
      }),
  }),

  // ── Modo Batalha ──────────────────────────────────────────────────────────────
  battle: router({
    create: protectedProcedure
      .input(z.object({ targetLanguage: z.string().min(2), nativeLanguage: z.string().min(2), category: z.string().min(1), cefrLevel: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]) }))
      .mutation(async ({ ctx, input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { battleRooms } = await import("../drizzle/schema");
        const quizData = await createBattleQuiz({ ...input, count: 10 });
        const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        await dbInstance.insert(battleRooms).values({
          roomCode, hostId: ctx.user.id,
          targetLanguage: input.targetLanguage, nativeLanguage: input.nativeLanguage, category: input.category,
          cefrLevel: input.cefrLevel, quizData, status: "waiting"
        });
        return { roomCode };
      }),
    join: protectedProcedure
      .input(z.object({ roomCode: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { battleRooms } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        const rooms = await dbInstance.select().from(battleRooms).where(eq(battleRooms.roomCode, input.roomCode.toUpperCase()));
        if (!rooms[0]) throw new TRPCError({ code: "NOT_FOUND", message: "Sala não encontrada" });
        if (rooms[0].status !== "waiting") throw new TRPCError({ code: "BAD_REQUEST", message: "Sala já iniciada" });
        if (rooms[0].hostId === ctx.user.id) throw new TRPCError({ code: "BAD_REQUEST", message: "O anfitrião não pode entrar na própria sala" });
        if (rooms[0].guestId) throw new TRPCError({ code: "CONFLICT", message: "Sala já está completa" });
        await dbInstance.update(battleRooms).set({ guestId: ctx.user.id, status: "active" }).where(eq(battleRooms.roomCode, input.roomCode.toUpperCase()));
        return { room: { ...rooms[0], guestId: ctx.user.id, status: "active" } };
      }),
    getRoom: protectedProcedure
      .input(z.object({ roomCode: z.string() }))
      .query(async ({ ctx, input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) return null;
        const { battleRooms } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        const rooms = await dbInstance.select().from(battleRooms).where(eq(battleRooms.roomCode, input.roomCode.toUpperCase()));
        const room = rooms[0];
        if (!room) return null;
        if (room.hostId !== ctx.user.id && room.guestId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Apenas participantes podem acessar esta sala" });
        }
        return room;
      }),
    submitScore: protectedProcedure
      .input(z.object({ roomCode: z.string(), score: z.number(), wordsCorrect: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { battleRooms } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        const rooms = await dbInstance.select().from(battleRooms).where(eq(battleRooms.roomCode, input.roomCode.toUpperCase()));
        if (!rooms[0]) throw new TRPCError({ code: "NOT_FOUND" });
        const isHost = rooms[0].hostId === ctx.user.id;
        if (!isHost && rooms[0].guestId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN", message: "Apenas participantes podem enviar pontuação" });
        const updateData: Record<string, any> = isHost
          ? { hostScore: input.score, hostWords: input.wordsCorrect }
          : { guestScore: input.score, guestWords: input.wordsCorrect };
        const bothDone = isHost ? rooms[0].guestScore !== null : rooms[0].hostScore !== null;
        if (bothDone) { updateData.status = "finished"; }
        await dbInstance.update(battleRooms).set(updateData).where(eq(battleRooms.roomCode, input.roomCode.toUpperCase()));
        return { done: bothDone };
      }),
    generateQuiz: protectedProcedure
      .input(z.object({ roomCode: z.string().min(6).max(8) }))
      .query(async ({ ctx, input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { battleRooms } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        const rooms = await dbInstance.select().from(battleRooms).where(eq(battleRooms.roomCode, input.roomCode.toUpperCase()));
        const room = rooms[0];
        if (!room) throw new TRPCError({ code: "NOT_FOUND", message: "Sala não encontrada" });
        if (room.hostId !== ctx.user.id && room.guestId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Apenas participantes podem acessar o quiz" });
        }
        if (!room.quizData?.length) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Quiz da sala indisponível" });
        return room.quizData;
      }),
  }),

  // ── Certificados ──────────────────────────────────────────────────────────────
  certificates: router({
    check: protectedProcedure
      .input(z.object({ targetLanguage: z.string() }))
      .query(async ({ ctx, input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) return { eligible: false, level: 0, xp: 0 };
        const { globalRanking } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        const rows = await dbInstance.select().from(globalRanking).where(eq(globalRanking.userId, ctx.user.id));
        const xp = rows[0]?.totalXp || 0;
        const level = Math.floor(xp / 500) + 1;
        return { eligible: level >= 5, level, xp, userName: ctx.user.name || "Estudante" };
      }),
    issue: protectedProcedure
      .input(z.object({ targetLanguage: z.string(), languageName: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { certificates } = await import("../drizzle/schema");
        const { eq, and } = await import("drizzle-orm");
        const existing = await dbInstance.select().from(certificates).where(and(eq(certificates.userId, ctx.user.id), eq(certificates.targetLanguage, input.targetLanguage)));
        if (existing[0]) return { certificateId: existing[0].id, alreadyExists: true };
        const result = await dbInstance.insert(certificates).values({ userId: ctx.user.id, userName: ctx.user.name || "Estudante", targetLanguage: input.targetLanguage, languageName: input.languageName });
        return { certificateId: (result as any).insertId, alreadyExists: false };
      }),
    list: protectedProcedure.query(async ({ ctx }) => {
      const dbInstance = await db.getDb();
      if (!dbInstance) return [];
      const { certificates } = await import("../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      return dbInstance.select().from(certificates).where(eq(certificates.userId, ctx.user.id));
    }),
  }),

  // ── Vision: Detecção de Objetos via IA (sem TensorFlow) ──────────────
  vision: router({
    scanObjects: protectedProcedure
      .input(z.object({
        imageBase64: z.string().min(10),
        targetLanguage: z.string().min(2),
        nativeLanguage: z.string().min(2),
      }))
      .mutation(async ({ input }) => {
        const { invokeLLM } = await import("./_core/llm");
        const langMap: Record<string, string> = {
          "en-US": "English", "es-ES": "Spanish", "fr-FR": "French",
          "de-DE": "German", "it-IT": "Italian", "ja-JP": "Japanese",
          "zh-CN": "Chinese", "ko-KR": "Korean", "pt-BR": "Portuguese",
          "ar-SA": "Arabic", "ru-RU": "Russian", "hi-IN": "Hindi",
        };
        const targetLang = langMap[input.targetLanguage] || "English";
        const nativeLang = langMap[input.nativeLanguage] || "Portuguese";
        const response = await invokeLLM({
          messages: [{
            role: "user",
            content: [
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${input.imageBase64}`, detail: "low" as const } },
              { type: "text", text: `You are a language learning assistant. Look at this image and identify 4-6 visible objects. For each object return a JSON array with: word (in ${targetLang}), native (translation in ${nativeLang}), phonetic (pronunciation guide for ${nativeLang} speakers, stress syllables in CAPS), article (grammatical article if applicable), example (one simple sentence in ${targetLang} max 8 words), x (estimated horizontal position 0-100), y (estimated vertical position 0-100). Return ONLY a JSON array, no markdown.` },
            ],
          }],
        });
        try {
          const content = (response.choices[0]?.message?.content as string) || "[]";
          const clean = content.replace(/```json|```/g, "").trim();
          const items = JSON.parse(clean);
          return { objects: Array.isArray(items) ? items.slice(0, 6) : [] };
        } catch { return { objects: [] }; }
      }),

    analyzeFace: protectedProcedure
      .input(z.object({
        imageBase64: z.string().min(10),
        currentWord: z.string().min(1),
        targetLanguage: z.string().min(2),
        nativeLanguage: z.string().min(2),
      }))
      .mutation(async ({ input }) => {
        const { invokeLLM } = await import("./_core/llm");
        const response = await invokeLLM({
          messages: [{
            role: "user",
            content: [
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${input.imageBase64}`, detail: "low" as const } },
              { type: "text", text: `Look at this person's face. They are trying to pronounce "${input.currentWord}" in ${input.targetLanguage}. Analyze their facial expression and mouth position. Return JSON with: emotion (one of: confident, confused, nervous, focused, happy, uncertain), mouthOpen (boolean), eyebrowsRaised (boolean), tip (one short encouraging tip in ${input.nativeLanguage} max 10 words), encouragement (one motivational phrase in ${input.nativeLanguage} max 8 words). Return ONLY JSON, no markdown.` },
            ],
          }],
        });
        try {
          const content = (response.choices[0]?.message?.content as string) || "{}";
          const clean = content.replace(/```json|```/g, "").trim();
          return JSON.parse(clean);
        } catch { return { emotion: "focused", tip: "", encouragement: "" }; }
      }),
  }),
  // ── Adaptive Learning Path ─────────────────────────────────────────────
  adaptive: router({
    getPath: protectedProcedure
      .input(z.object({ targetLanguage: z.string() }))
      .query(async ({ ctx, input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) return { level: 'beginner', recommendedLesson: null, weakAreas: [], strengths: [] };
        const { userProgress, pronunciationHistory, srsProgress, completedLessons } = await import("../drizzle/schema");
        const { eq, and, desc, avg, count } = await import("drizzle-orm");
        const pronRows = await dbInstance.select({ avgScore: avg(pronunciationHistory.score), total: count() })
          .from(pronunciationHistory)
          .where(and(eq(pronunciationHistory.userId, ctx.user.id), eq(pronunciationHistory.targetLanguage, input.targetLanguage)));
        const pronScore = Number(pronRows[0]?.avgScore) || 0;
        const srsRows = await dbInstance.select().from(srsProgress)
          .where(and(eq(srsProgress.userId, ctx.user.id), eq(srsProgress.targetLanguage, input.targetLanguage)));
        const totalWords = srsRows.length;
        const weakWords = srsRows.filter(w => (w.totalWrong || 0) > (w.totalCorrect || 0)).map(w => w.word);
        const completedRows = await dbInstance.select().from(completedLessons)
          .where(eq(completedLessons.userId, ctx.user.id));
        const completedCount = completedRows.length;
        let level = 'beginner';
        if (completedCount > 10 && Number(pronScore) > 70) level = 'intermediate';
        if (completedCount > 25 && Number(pronScore) > 85) level = 'advanced';
        const weakAreas: string[] = [];
        if (Number(pronScore) < 60) weakAreas.push('pronunciation');
        if (totalWords < 20) weakAreas.push('vocabulary');
        if (weakWords.length > 5) weakAreas.push('spelling');
        const strengths: string[] = [];
        if (Number(pronScore) > 80) strengths.push('pronunciation');
        if (totalWords > 50) strengths.push('vocabulary');
        if (completedCount > 15) strengths.push('consistency');
        return { level, completedCount, pronScore, totalWords, weakWords: weakWords.slice(0, 10), weakAreas, strengths };
      }),
    getRecommendation: protectedProcedure
      .input(z.object({ targetLanguage: z.string() }))
      .query(async ({ ctx, input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) return { type: 'lesson', reason: 'Comece com a primeira lição' };
        const errorPatterns = await db.getUserErrorPatterns(ctx.user.id);
        const topError = errorPatterns[0];
        if (topError && (topError.frequency || 0) >= 2) {
          const errorLabels: Record<string, string> = {
            grammar: 'gramática',
            vocabulary: 'vocabulário',
            pronunciation: 'pronúncia',
            comprehension: 'compreensão',
          };
          const focus = errorLabels[topError.errorType] || 'uma habilidade específica';
          return {
            type: 'practice',
            reason: `Identificamos repetição de erros em ${focus}. Faça a próxima atividade com foco neste ponto.`,
          };
        }
        const { srsProgress, pronunciationHistory } = await import("../drizzle/schema");
        const { eq, and, lte, avg } = await import("drizzle-orm");
        const dueReviews = await dbInstance.select().from(srsProgress)
          .where(and(eq(srsProgress.userId, ctx.user.id), eq(srsProgress.targetLanguage, input.targetLanguage), lte(srsProgress.nextReview, new Date()))).limit(1);
        if (dueReviews.length > 0) {
          return { type: 'review', reason: 'Você tem palavras para revisar! Use o SRS para fixar o vocabulário.' };
        }
        const pronRows = await dbInstance.select({ avgScore: avg(pronunciationHistory.score) })
          .from(pronunciationHistory)
          .where(and(eq(pronunciationHistory.userId, ctx.user.id), eq(pronunciationHistory.targetLanguage, input.targetLanguage)));
        if (pronRows[0]?.avgScore && Number(pronRows[0].avgScore) < 70) {
          return { type: 'pronunciation', reason: 'Sua pronúncia precisa de atenção. Pratique com o Coach de Pronúncia!' };
        }
        return { type: 'lesson', reason: 'Continue aprendendo novas lições para expandir seu vocabulário.' };
      }),
  }),

  // ── Free Talk com IA Local ──────────────────────────────────────────────
  freeTalk: router({
    chat: protectedProcedure
      .input(z.object({
        message: z.string(),
        targetLanguage: z.string(),
        nativeLanguage: z.string(),
        scenario: z.string().optional(),
        countryCode: z.string().optional(),
        history: z.array(z.object({ role: z.string(), content: z.string() })).default([]),
      }))
      .mutation(async ({ ctx, input }) => {
        const historyText = input.history.map((item) => item.content).join("\n");
        const requestSafety = await assessConversationText(
          ctx.user.id,
          `${historyText}\n${input.message}`.trim(),
          input.targetLanguage,
        );
        if (!requestSafety.allowed) {
          return { reply: "Este assunto não está disponível aqui. Vamos praticar uma frase segura de idioma.", source: "safety" as const, blocked: true };
        }

        const safeReply = async (reply: string, source: "local" | "remote" | "none") => {
          const responseSafety = await assessConversationOutput(ctx.user.id, input.message, reply, input.targetLanguage);
          if (!responseSafety.allowed) {
            return { reply: "Vamos continuar com uma prática segura de idioma.", source: "safety" as const, blocked: true };
          }
          return { reply, source, blocked: false };
        };
        // ── Censura e moderação por país ──
        const countryNorms: Record<string, string> = {
          'BR': 'Respeite a moral brasileira. Sem palavrões, conteúdo sexual, drogas ou violência.',
          'US': 'Keep it family-friendly. No profanity, sexual content, drugs or violence.',
          'GB': 'Keep it polite and family-friendly. No profanity or inappropriate content.',
          'FR': 'Respectez les valeurs françaises. Pas de gros mots, contenu sexuel, drogue ou violence.',
          'DE': 'Halten Sie es familienfreundlich. Keine Schimpfwörter oder unangemessene Inhalte.',
          'ES': 'Respete los valores españoles. Sin palabrotas, contenido sexual, drogas o violencia.',
          'IT': 'Rispetta i valori italiani. Niente parolacce, contenuti sessuali, droghe o violenza.',
          'JP': '日本の道徳を尊重してください。不適切な言葉、性的コンテンツ、薬物、暴力は禁止です。',
          'CN': '尊重中国道德。禁止不当言辞、色情内容、毒品和暴力。',
          'KR': '한국의 도덕을 존중하세요. 욕설, 성적 콘텐츠, 마약, 폭력은 금지입니다.',
          'SA': 'احترم القيم الإسلامية. ممنوع تماماً: الكحول، المحتوى الجنسي، المخدرات، العنف.',
          'AE': 'احترم القيم الإسلامية. ممنوع تماماً: الكحول، المحتوى الجنسي، المخدرات، العنف.',
          'RU': 'Соблюдайте российские ценности. Без ругательств, сексуального контента, наркотиков или насилия.',
          'IN': 'Respect Indian cultural values. No profanity, sexual content, drugs or violence.',
          'MX': 'Respete los valores mexicanos. Sin palabrotas, contenido sexual, drogas o violencia.',
          'PT': 'Respeite a moral portuguesa. Sem palavrões, conteúdo sexual, drogas ou violência.',
          'NL': 'Houd het gezinsvriendelijk. Geen scheldwoorden of ongepaste inhoud.',
          'TR': 'Türk değerlerine saygı gösterin. Küfür, cinsel içerik, uyuşturucu veya şiddet yasaktır.',
          'AR': 'Respete los valores argentinos. Sin palabrotas, contenido sexual, drogas o violencia.',
          'GR': 'Σεβαστείτε τις ελληνικές αξίες. Χωρίς βρισιές, σεξουαλικό περιεχόμενο, ναρκωτικά ή βία.',
        };
        const countryNorm = countryNorms[input.countryCode || 'BR'] || countryNorms['BR'];
        const censorshipPrompt = `\n\nCRITICAL CONTENT RULES:\n- You are a TEACHER. NEVER use profanity, sexual content, drug references, violence, or anything inappropriate for children.\n- Respect the moral and cultural norms of the student's country: ${countryNorm}\n- If the student tries to talk about inappropriate topics, gently redirect to the lesson: \"Let's focus on learning! Try saying...\"\n- NEVER generate words, audio descriptions, or 3D image descriptions that violate these rules.\n- Keep ALL conversation educational, moral, and respectful of every country's culture.\n- If the student insists on inappropriate topics, respond: \"I can only help with language learning. Let's practice!\"`;
        try {
          const { isOllamaAvailable, generateWithOllama } = await import('./ollama');
          const available = await isOllamaAvailable();
          if (available) {
            const systemPrompt = `You are a friendly language teacher. The student is learning ${input.targetLanguage} and speaks ${input.nativeLanguage}.\nScenario: ${input.scenario || 'casual conversation'}\nRespond in ${input.targetLanguage}. Keep responses short (1-3 sentences). Be encouraging. If the student makes a mistake, gently correct it in parentheses.${censorshipPrompt}`;
            const messages = [
              { role: 'system' as const, content: systemPrompt },
              ...input.history.map(h => ({ role: h.role as 'system' | 'user' | 'assistant', content: h.content })),
              { role: 'user' as const, content: input.message },
            ];
            const result = await generateWithOllama({ messages, max_tokens: 500 });
            if (result.content) return safeReply(result.content, 'local');
          }
        } catch (e) { /* fall through */ }
        try {
          const { invokeLLM } = await import('./_core/llm');
          const systemPrompt = `You are a friendly language teacher. The student is learning ${input.targetLanguage} and speaks ${input.nativeLanguage}.\nScenario: ${input.scenario || 'casual conversation'}\nRespond in ${input.targetLanguage}. Keep responses short (1-3 sentences). Be encouraging. If the student makes a mistake, gently correct it in parentheses.${censorshipPrompt}`;
          const result = await invokeLLM({ messages: [{ role: 'user', content: systemPrompt + '\n\nStudent: ' + input.message }], maxTokens: 200 });
          const replyContent = result.choices[0]?.message?.content;
          const replyText = typeof replyContent === 'string' ? replyContent : '';
          return safeReply(replyText || 'Desculpe, não consegui responder agora.', 'remote');
        } catch (e) {
          return safeReply('IA não disponível no momento. Tente novamente.', 'none');
        }
      }),
  }),

  // ── Cloze Test Dinâmico ─────────────────────────────────────────────────
  cloze: router({
    generate: publicProcedure
      .input(z.object({
        text: z.string(),
        targetLanguage: z.string(),
        difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
      }))
      .mutation(async ({ input }) => {
        const words = input.text.split(/\s+/);
        const ratio = input.difficulty === 'easy' ? 0.1 : input.difficulty === 'medium' ? 0.2 : 0.3;
        const numBlanks = Math.max(1, Math.floor(words.length * ratio));
        const candidates = words
          .map((w, i) => ({ word: w, index: i, len: w.replace(/[^a-zA-Zà-ÿ]/g, '').length }))
          .filter(c => c.len >= 4);
        const shuffled = [...candidates].sort(() => Math.random() - 0.5);
        const blanks = shuffled.slice(0, numBlanks).sort((a, b) => a.index - b.index);
        const blankedText = [...words];
        const answers: { index: number; answer: string; options: string[] }[] = [];
        for (const blank of blanks) {
          const answer = blank.word.replace(/[^a-zA-Zà-ÿ]/g, '');
          const distractors = candidates
            .filter(c => c.index !== blank.index && c.word.replace(/[^a-zA-Zà-ÿ]/g, '') !== answer)
            .map(c => c.word.replace(/[^a-zA-Zà-ÿ]/g, ''))
            .filter((v, i, arr) => arr.indexOf(v) === i)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);
          const options = [answer, ...distractors].sort(() => Math.random() - 0.5);
          blankedText[blank.index] = '_____';
          answers.push({ index: blank.index, answer, options });
        }
        return { clozeText: blankedText.join(' '), answers, originalText: input.text };
      }),
  }),

  // ── Smart Review: IA gera exercícios dinâmicos ──────────────────────────
  smartReview: router({
    generate: protectedProcedure
      .input(z.object({
        targetLanguage: z.string(),
        exerciseType: z.enum(['multiple_choice', 'fill_blank', 'translation', 'matching']).default('multiple_choice'),
        cefrLevel: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).default('A1'),
      }))
      .mutation(async ({ ctx, input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) return { exercises: [] };
        const { srsProgress, users } = await import("../drizzle/schema");
        const { eq, and } = await import("drizzle-orm");
        const userVocab = await dbInstance.select().from(srsProgress)
          .where(and(eq(srsProgress.userId, ctx.user.id), eq(srsProgress.targetLanguage, input.targetLanguage)))
          .limit(20);
        if (userVocab.length === 0) {
          return { exercises: [], message: 'Ainda não há vocabulário para revisar. Complete algumas lições primeiro!' };
        }
        const errorPatterns = await db.getUserErrorPatterns(ctx.user.id);
        const focusError = errorPatterns.find((pattern) => (pattern.frequency || 0) >= 2);
        const statsRows = await dbInstance.select({ totalXp: users.totalXp })
          .from(users)
          .where(eq(users.id, ctx.user.id))
          .limit(1);
        const totalXp = Number(statsRows[0]?.totalXp || 0);
        const xpAdaptation = totalXp < 100
          ? { label: 'Fundamentos', exerciseCount: 3, detail: 'Sessão curta para consolidar a base.' }
          : totalXp < 500
            ? { label: 'Em desenvolvimento', exerciseCount: 5, detail: 'Sessão completa com reforço dos erros recorrentes.' }
            : { label: 'Desafio', exerciseCount: 7, detail: 'Sessão ampliada para fortalecer autonomia e precisão.' };
        const cefrCap: Record<'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2', number> = { A1: 3, A2: 4, B1: 5, B2: 6, C1: 7, C2: 7 };
        const adaptation = {
          ...xpAdaptation,
          exerciseCount: Math.min(xpAdaptation.exerciseCount, cefrCap[input.cefrLevel]),
          detail: `${xpAdaptation.detail} Nível CEFR ${input.cefrLevel}.`,
        };
        const rankedVocab = [...userVocab].sort((a, b) => {
          const aNeed = (a.totalWrong || 0) - (a.totalCorrect || 0);
          const bNeed = (b.totalWrong || 0) - (b.totalCorrect || 0);
          return bNeed - aNeed;
        });
        const exercises: any[] = [];
        for (const item of rankedVocab.slice(0, adaptation.exerciseCount)) {
          if (input.exerciseType === 'multiple_choice') {
            const distractors = userVocab.filter(v => v.word !== item.word)
              .sort(() => Math.random() - 0.5).slice(0, 3).map(v => v.translation);
            const options = [item.translation, ...distractors].sort(() => Math.random() - 0.5);
            exercises.push({ type: 'multiple_choice', question: `O que significa "${item.word}"?`, options, correctAnswer: item.translation, word: item.word });
          } else if (input.exerciseType === 'fill_blank') {
            exercises.push({ type: 'fill_blank', question: `Traduza para ${input.targetLanguage}: "${item.translation}"`, correctAnswer: item.word, hint: item.category || '' });
          } else if (input.exerciseType === 'translation') {
            exercises.push({ type: 'translation', question: item.word, correctAnswer: item.translation, direction: 'to_native' });
          } else if (input.exerciseType === 'matching') {
            exercises.push({ type: 'matching', word: item.word, translation: item.translation });
          }
        }
        return {
          exercises,
          source: 'local',
          focus: focusError?.errorType || null,
          adaptation,
          cefrLevel: input.cefrLevel,
          totalXp,
          message: focusError
            ? `Revisão ${adaptation.label.toLowerCase()}: vamos reforçar ${focusError.errorType === 'grammar' ? 'gramática' : focusError.errorType === 'pronunciation' ? 'pronúncia' : focusError.errorType === 'comprehension' ? 'compreensão' : 'vocabulário'}.`
            : `Revisão ${adaptation.label.toLowerCase()}: ${adaptation.detail}`,
        };
      }),
    submitAnswer: protectedProcedure
      .input(z.object({ word: z.string(), translation: z.string(), targetLanguage: z.string(), quality: z.number().min(0).max(5) }))
      .mutation(async ({ ctx, input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) return { ok: false };
        const { srsProgress } = await import("../drizzle/schema");
        const { eq, and } = await import("drizzle-orm");
        const existing = await dbInstance.select().from(srsProgress)
          .where(and(eq(srsProgress.userId, ctx.user.id), eq(srsProgress.word, input.word), eq(srsProgress.targetLanguage, input.targetLanguage))).limit(1);
        const q = input.quality;
        if (existing.length === 0) {
          const ef = Math.max(1.3, 2.5 + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
          const interval = 1;
          const nextReview = new Date(Date.now() + interval * 86400000);
          await dbInstance.insert(srsProgress).values({ userId: ctx.user.id, word: input.word, translation: input.translation, targetLanguage: input.targetLanguage, easeFactor: ef, interval, repetitions: q >= 3 ? 1 : 0, nextReview, totalCorrect: q >= 3 ? 1 : 0, totalWrong: q < 3 ? 1 : 0 });
        } else {
          const cur = existing[0];
          const ef = Math.max(1.3, (cur.easeFactor || 2.5) + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
          const reps = q >= 3 ? (cur.repetitions || 0) + 1 : 0;
          const interval = reps === 0 ? 1 : reps === 1 ? 6 : Math.round((cur.interval || 1) * ef);
          const nextReview = new Date(Date.now() + interval * 86400000);
          await dbInstance.update(srsProgress).set({ easeFactor: ef, interval, repetitions: reps, nextReview, totalCorrect: (cur.totalCorrect || 0) + (q >= 3 ? 1 : 0), totalWrong: (cur.totalWrong || 0) + (q < 3 ? 1 : 0), lastSeen: new Date() }).where(eq(srsProgress.id, cur.id));
        }
        return { ok: true };
      }),
  }),
});
// Função auxiliar para calcular similaridade entre stringsgs
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

export type AppRouter = typeof appRouter;
