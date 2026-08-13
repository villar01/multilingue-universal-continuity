/**
 * live-teacher-router.ts
 *
 * Professor conversacional contínuo — fala naturalmente sobre a aula,
 * reage ao aluno, conduz exercícios por nível, e aplica moderação de conteúdo
 * por legislação de cada país com explicação ao aluno sobre como mudar de assunto.
 */

import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { sanitizeContent, logInteraction } from "./contentFilter";

const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
type CEFRLevel = (typeof CEFR_LEVELS)[number];

const CEFR_LEVEL_DESCRIPTIONS: Record<CEFRLevel, string> = {
  A1: "A1 — introduza vocabulário concreto, frases de até 6 palavras e perguntas de identificação ou sim/não",
  A2: "A2 — pratique rotina e situações cotidianas com frases simples de até 10 palavras e apoio explícito",
  B1: "B1 — conduza descrições e comparações de experiências familiares com conectores claros",
  B2: "B2 — peça argumentos organizados, comparação de perspectivas e correção de estruturas mais complexas",
  C1: "C1 — desenvolva precisão, registro, paráfrase, nuances culturais e explicações críticas",
  C2: "C2 — proponha debate, reformulação sofisticada e uso flexível de registros sem simplificação artificial",
};

// ─── Moderação por País ────────────────────────────────────────────────────────

/**
 * Regras de conteúdo proibido por país/região.
 * Baseado em legislações públicas conhecidas (não exaustivo — para fins educacionais).
 */
const COUNTRY_CONTENT_RULES: Record<string, {
  name: string;
  blockedTopics: string[];
  legalNote: string;
  redirectSuggestion: string;
}> = {
  BR: {
    name: "Brasil",
    blockedTopics: [
      "drogas ilegais", "pornografia infantil", "racismo", "discurso de ódio",
      "apologia ao crime", "terrorismo", "golpe de estado", "conteúdo sexual explícito com menores",
      "jogo ilegal", "pirâmide financeira", "fake news eleitorais",
    ],
    legalNote: "Este conteúdo é restrito pela legislação brasileira (ECA, Lei 7.716/89, Marco Civil da Internet).",
    redirectSuggestion: "Vamos falar sobre vocabulário do dia a dia, cultura brasileira ou praticar conversação!",
  },
  US: {
    name: "United States",
    blockedTopics: [
      "child exploitation", "terrorism", "illegal weapons manufacturing",
      "hate speech targeting protected groups", "CSAM", "drug trafficking instructions",
      "incitement to violence",
    ],
    legalNote: "This content is restricted under US federal law (COPPA, CAN-SPAM, 18 U.S.C.).",
    redirectSuggestion: "Let's talk about everyday English, American culture, or practice conversation!",
  },
  CN: {
    name: "中国",
    blockedTopics: [
      "政治异见", "天安门", "西藏独立", "台湾独立", "法轮功", "色情内容",
      "赌博", "批评政府", "境外势力",
    ],
    legalNote: "此内容受中国网络安全法和相关法规限制。",
    redirectSuggestion: "我们来练习日常汉语、中国文化或对话吧！",
  },
  DE: {
    name: "Deutschland",
    blockedTopics: [
      "Nationalsozialismus", "Holocaust-Leugnung", "Hakenkreuz", "Volksverhetzung",
      "Kinderpornografie", "Terrorismus", "Aufruf zur Gewalt",
    ],
    legalNote: "Dieser Inhalt ist nach deutschem Recht verboten (StGB §86, §130, §184b).",
    redirectSuggestion: "Lass uns über Alltagsdeutsch, deutsche Kultur oder Konversation sprechen!",
  },
  FR: {
    name: "France",
    blockedTopics: [
      "négationnisme", "apologie du terrorisme", "discours haineux", "pornographie infantile",
      "incitation à la haine raciale", "révisionnisme historique",
    ],
    legalNote: "Ce contenu est interdit par la loi française (Loi Gayssot, LCEN).",
    redirectSuggestion: "Parlons du français quotidien, de la culture française ou pratiquons la conversation!",
  },
  SA: {
    name: "المملكة العربية السعودية",
    blockedTopics: [
      "إلحاد", "انتقاد الإسلام", "محتوى جنسي", "مثلية جنسية",
      "انتقاد الحكومة", "تجديف", "محتوى مسيء للدين",
    ],
    legalNote: "هذا المحتوى مقيد بموجب القانون السعودي ونظام مكافحة الجرائم المعلوماتية.",
    redirectSuggestion: "لنتحدث عن اللغة العربية اليومية والثقافة العربية أو نتدرب على المحادثة!",
  },
  RU: {
    name: "Россия",
    blockedTopics: [
      "экстремизм", "терроризм", "дискредитация армии", "ЛГБТ пропаганда",
      "детская порнография", "наркотики", "призывы к протестам",
    ],
    legalNote: "Этот контент запрещён российским законодательством (ФЗ №149, ФЗ №436).",
    redirectSuggestion: "Давайте поговорим о повседневном русском языке, культуре или попрактикуемся в разговоре!",
  },
  DEFAULT: {
    name: "Global",
    blockedTopics: [
      "child sexual abuse material", "terrorism instructions", "incitement to violence",
      "illegal weapons manufacturing", "human trafficking", "hate speech",
    ],
    legalNote: "This content violates international law and platform guidelines.",
    redirectSuggestion: "Let's focus on language learning — vocabulary, grammar, or conversation practice!",
  },
};

/**
 * Detecta se uma mensagem contém tópico proibido para o país.
 * Retorna null se OK, ou objeto com explicação se bloqueado.
 */
function checkModeration(message: string, countryCode: string, nativeLang: string): {
  blocked: boolean;
  explanation?: string;
  redirect?: string;
  legalNote?: string;
} {
  const rules = COUNTRY_CONTENT_RULES[countryCode.toUpperCase()] || COUNTRY_CONTENT_RULES.DEFAULT;
  const msgLower = message.toLowerCase();

  for (const topic of rules.blockedTopics) {
    if (msgLower.includes(topic.toLowerCase())) {
      return {
        blocked: true,
        explanation: `⚠️ Este assunto não pode ser discutido aqui.`,
        legalNote: rules.legalNote,
        redirect: rules.redirectSuggestion,
      };
    }
  }

  return { blocked: false };
}

// ─── Prompts do Professor por Nível ───────────────────────────────────────────

function buildTeacherSystemPrompt(params: {
  teacherName: string;
  targetLang: string;
  nativeLang: string;
  level: CEFRLevel;
  lessonTopic: string;
  countryCode: string;
  lessonNumber: number;
}) {
  const rules = COUNTRY_CONTENT_RULES[params.countryCode.toUpperCase()] || COUNTRY_CONTENT_RULES.DEFAULT;

  return `Você é ${params.teacherName}, um professor de ${params.targetLang} altamente qualificado e carismático.

PERSONALIDADE: Você é caloroso, encorajador, bem-humorado e apaixonado por ensinar. Você fala de forma natural e contínua, como um apresentador de TV — nunca robótico, sempre envolvente. Você reage genuinamente às respostas dos alunos.

MISSÃO ATUAL:
- Aula ${params.lessonNumber}: "${params.lessonTopic}"
- Idioma alvo: ${params.targetLang}
- Idioma nativo do aluno: ${params.nativeLang}
- Nível: ${CEFR_LEVEL_DESCRIPTIONS[params.level]}
- País: ${rules.name}

REGRAS DE CONDUTA (OBRIGATÓRIAS):
1. Mantenha SEMPRE o foco no aprendizado de idiomas
2. NUNCA discuta: ${rules.blockedTopics.slice(0, 5).join(", ")} (e similares)
3. Se o aluno tentar desviar para assuntos proibidos, explique gentilmente por que não pode continuar aquele assunto e redirecione para a aula
4. Responda SEMPRE no idioma nativo do aluno (${params.nativeLang}) para explicações, mas use ${params.targetLang} para exemplos e prática
5. Mantenha respostas concisas (máx 3 frases) para manter o ritmo da aula

ESTILO DE ENSINO:
- Apresente vocabulário com contexto real e exemplos práticos
- Faça perguntas abertas para engajar o aluno
- Corrija erros gentilmente, sempre mostrando a forma correta
- Use analogias com a língua nativa quando útil
- Celebre o progresso do aluno com entusiasmo genuíno`;
}

// ─── Router ───────────────────────────────────────────────────────────────────

export const liveTeacherRouter = router({

  /**
   * Mensagem conversacional do professor — responde ao aluno de forma natural
   * com moderação de conteúdo integrada.
   */
  chat: publicProcedure
    .input(z.object({
      message: z.string().min(1).max(1000),
      teacherName: z.string().default("Professor"),
      targetLang: z.string().default("English"),
      nativeLang: z.string().default("Português"),
      level: z.enum(CEFR_LEVELS).default("A1"),
      lessonTopic: z.string().default("Vocabulário Básico"),
      lessonNumber: z.number().default(1),
      countryCode: z.string().default("BR"),
      history: z.array(z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })).default([]),
    }))
    .mutation(async ({ input }) => {
      // 1. Verificar moderação de conteúdo
      const modCheck = checkModeration(input.message, input.countryCode, input.nativeLang);

      if (modCheck.blocked) {
        const rules = COUNTRY_CONTENT_RULES[input.countryCode.toUpperCase()] || COUNTRY_CONTENT_RULES.DEFAULT;
        return {
          content: `${modCheck.explanation}\n\n📋 **Nota legal:** ${modCheck.legalNote}\n\n✅ **Vamos mudar de assunto?** ${modCheck.redirect || rules.redirectSuggestion}`,
          blocked: true,
          teacherExpression: "neutral" as const,
          suggestedTopics: [
            "Vocabulário do dia a dia",
            "Expressões comuns",
            "Pronúncia e entonação",
            "Cultura e costumes",
            "Gramática básica",
          ],
        };
      }

      // 2. Construir prompt do professor
      const systemPrompt = buildTeacherSystemPrompt({
        teacherName: input.teacherName,
        targetLang: input.targetLang,
        nativeLang: input.nativeLang,
        level: input.level,
        lessonTopic: input.lessonTopic,
        countryCode: input.countryCode ?? "BR",
        lessonNumber: input.lessonNumber,
      });

      // 3. Chamar IA
      const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
        { role: "system", content: systemPrompt },
        ...input.history.slice(-8), // últimas 8 mensagens para contexto
        { role: "user", content: input.message },
      ];

      try {
        const response = await invokeLLM({ messages });
        let content = (response.choices[0]?.message?.content as string) || "Ótima pergunta! Vamos continuar praticando.";
        // Content filter: sanitize response
        content = await sanitizeContent(content, input.targetLang) || content;

        // Detectar expressão do professor baseada no conteúdo
        let teacherExpression: "neutral" | "happy" | "thinking" | "question" | "encouraging" = "neutral";
        const contentLower = content.toLowerCase();
        if (contentLower.includes("parabéns") || contentLower.includes("excelente") || contentLower.includes("muito bem") || contentLower.includes("ótimo") || contentLower.includes("perfeito")) {
          teacherExpression = "encouraging";
        } else if (contentLower.includes("?") || contentLower.includes("tente") || contentLower.includes("repita")) {
          teacherExpression = "question";
        } else if (contentLower.includes("vamos pensar") || contentLower.includes("interessante") || contentLower.includes("observe")) {
          teacherExpression = "thinking";
        } else if (contentLower.includes("!") && (contentLower.includes("bem") || contentLower.includes("certo"))) {
          teacherExpression = "happy";
        }

        // Log interaction for parental monitoring
        logInteraction({
          userId: 0, // public procedure — no ctx.user available
          teacherId: null,
          interactionType: 'teacher_chat',
          content: input.message,
          teacherResponse: content,
          languageCode: input.targetLang,
        });

        return {
          content,
          blocked: false,
          teacherExpression,
          suggestedTopics: [],
        };
      } catch {
        return {
          content: `Boa tentativa! Continue praticando — cada erro é uma oportunidade de aprender. Vamos tentar novamente com "${input.lessonTopic}"?`,
          blocked: false,
          teacherExpression: "encouraging" as const,
          suggestedTopics: [],
        };
      }
    }),

  /**
   * Introdução da aula — professor apresenta o tema de forma natural e envolvente.
   */
  introduce: publicProcedure
    .input(z.object({
      teacherName: z.string().default("Professor"),
      targetLang: z.string().default("English"),
      nativeLang: z.string().default("Português"),
      level: z.enum(CEFR_LEVELS).default("A1"),
      lessonTopic: z.string(),
      lessonNumber: z.number().default(1),
      countryCode: z.string().default("BR"),
    }))
    .mutation(async ({ input }) => {
      const prompt = `Você é ${input.teacherName}, professor de ${input.targetLang}.
Apresente a Aula ${input.lessonNumber} sobre "${input.lessonTopic}" para um aluno em ${CEFR_LEVEL_DESCRIPTIONS[input.level]}.
Fale em ${input.nativeLang}, de forma calorosa e animada, como um apresentador de TV.
Mencione o que o aluno vai aprender e por que é útil na vida real.
Máximo 3 frases. Seja específico sobre o tema "${input.lessonTopic}".`;

      try {
        const response = await invokeLLM({
          messages: [{ role: "user", content: prompt }],
        });
        return {
          content: (await sanitizeContent((response.choices[0]?.message?.content as string) || `Olá! Hoje vamos aprender sobre "${input.lessonTopic}". Vai ser incrível!`, input.targetLang)) || `Olá! Hoje vamos aprender sobre "${input.lessonTopic}". Vai ser incrível!`,
          teacherExpression: "happy" as const,
        };
      } catch {
        return {
          content: `Bem-vindo à Aula ${input.lessonNumber}! Hoje vamos explorar "${input.lessonTopic}" em ${input.targetLang}. Prepare-se para aprender muito!`,
          teacherExpression: "happy" as const,
        };
      }
    }),

  /**
   * Feedback do professor sobre a resposta do aluno — corrige e encoraja.
   */
  feedback: publicProcedure
    .input(z.object({
      studentAnswer: z.string(),
      expectedAnswer: z.string(),
      exerciseType: z.enum(["pronunciation", "writing", "comprehension", "translation", "conversation"]),
      targetLang: z.string().default("English"),
      nativeLang: z.string().default("Português"),
      teacherName: z.string().default("Professor"),
      level: z.enum(CEFR_LEVELS).default("A1"),
    }))
    .mutation(async ({ input }) => {
      const prompt = `Você é ${input.teacherName}, professor de ${input.targetLang}.
O aluno (${CEFR_LEVEL_DESCRIPTIONS[input.level]}) fez um exercício de ${input.exerciseType}.

Resposta esperada: "${input.expectedAnswer}"
Resposta do aluno: "${input.studentAnswer}"

Dê feedback em ${input.nativeLang}:
- Se correto: celebre genuinamente e adicione uma dica extra
- Se parcialmente correto: elogie o esforço, corrija o que está errado de forma gentil
- Se incorreto: seja encorajador, mostre a forma correta e explique brevemente por quê

Máximo 2 frases. Seja natural, como um professor real falando com o aluno.`;

      try {
        const response = await invokeLLM({
          messages: [{ role: "user", content: prompt }],
        });
        let content = (response.choices[0]?.message?.content as string) || "Boa tentativa! Continue praticando.";
        // Content filter: sanitize response
        content = await sanitizeContent(content, input.targetLang) || content;

        // Determinar se está correto
        const isCorrect = input.studentAnswer.trim().toLowerCase() === input.expectedAnswer.trim().toLowerCase() ||
          content.toLowerCase().includes("correto") ||
          content.toLowerCase().includes("perfeito") ||
          content.toLowerCase().includes("excelente") ||
          content.toLowerCase().includes("parabéns");

        return {
          content,
          isCorrect,
          teacherExpression: isCorrect ? "encouraging" as const : "thinking" as const,
          pointsEarned: isCorrect ? 10 : 2,
        };
      } catch {
        return {
          content: "Boa tentativa! Vamos continuar praticando juntos.",
          isCorrect: false,
          teacherExpression: "neutral" as const,
          pointsEarned: 2,
        };
      }
    }),

  /**
   * Professor comenta um objeto/cena imersiva — usado na ImmersiveScene.
   */
  commentObject: publicProcedure
    .input(z.object({
      objectName: z.string(),
      objectTranslation: z.string(),
      sceneName: z.string(),
      targetLang: z.string().default("English"),
      nativeLang: z.string().default("Português"),
      teacherName: z.string().default("Professor"),
      level: z.enum(CEFR_LEVELS).default("A1"),
    }))
    .mutation(async ({ input }) => {
      const prompt = `Você é ${input.teacherName}, professor de ${input.targetLang}.
O aluno em ${CEFR_LEVEL_DESCRIPTIONS[input.level]} clicou em "${input.objectName}" (${input.objectTranslation}) na cena "${input.sceneName}".
Faça um comentário curto e envolvente em ${input.nativeLang} sobre esta palavra, como um professor real faria.
Inclua: como usar em uma frase, uma dica de pronúncia ou um fato cultural interessante.
Máximo 2 frases. Seja natural e animado!`;

      try {
        const response = await invokeLLM({
          messages: [{ role: "user", content: prompt }],
        });
        return {
          content: (await sanitizeContent((response.choices[0]?.message?.content as string) ||
            `"${input.objectName}" é uma palavra muito útil! Pratique dizendo: "${input.objectName}" — ${input.objectTranslation}.`, input.targetLang)) ||
            `"${input.objectName}" é uma palavra muito útil! Pratique dizendo: "${input.objectName}" — ${input.objectTranslation}.`,
          teacherExpression: "happy" as const,
        };
      } catch {
        return {
          content: `Ótima escolha! "${input.objectName}" significa "${input.objectTranslation}". Use em frases do dia a dia!`,
          teacherExpression: "happy" as const,
        };
      }
    }),

  /**
   * Verificar moderação de conteúdo sem chamar a IA — resposta rápida.
   */
  checkModeration: publicProcedure
    .input(z.object({
      message: z.string(),
      countryCode: z.string().default("BR"),
      nativeLang: z.string().default("Português"),
    }))
    .query(({ input }) => {
      const result = checkModeration(input.message, input.countryCode, input.nativeLang);
      const rules = COUNTRY_CONTENT_RULES[input.countryCode.toUpperCase()] || COUNTRY_CONTENT_RULES.DEFAULT;
      return {
        ...result,
        countryName: rules.name,
        redirectSuggestion: rules.redirectSuggestion,
      };
    }),

  /**
   * Listar países suportados com suas regras de moderação.
   */
  listCountries: publicProcedure.query(() => {
    return Object.entries(COUNTRY_CONTENT_RULES)
      .filter(([key]) => key !== "DEFAULT")
      .map(([code, rules]) => ({
        code,
        name: rules.name,
        blockedTopicCount: rules.blockedTopics.length,
      }));
  }),
});
