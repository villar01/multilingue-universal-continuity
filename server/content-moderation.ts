/**
 * CONTENT MODERATION SYSTEM
 * 
 * Sistema de moderação e censura inteligente com:
 * - Filtros por faixa etária (infantil/adolescente/adulto)
 * - Filtros culturais/regionais (país, religião)
 * - Guardrails de IA (validação pré-envio)
 * - Logs completos de conversas
 * - Alertas automáticos de violações
 */

import { getDb } from "./db";
import {
  contentModerationRules,
  conversationLogs,
  moderationAlerts,
  blockedContent,
  userSafetyProfile,
  type InsertConversationLog,
  type InsertModerationAlert,
} from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { invokeLLM } from "./_core/llm";

// ============================================================
// TIPOS
// ============================================================

export type AgeGroup = "infantil" | "adolescente" | "adulto";
export type ViolationType =
  | "inappropriate_content"
  | "violence"
  | "profanity"
  | "sexual_content"
  | "hate_speech"
  | "personal_info"
  | "bullying"
  | "other";

export interface ModerationResult {
  isAllowed: boolean;
  moderationScore: number; // 0-100 (0 = seguro, 100 = perigoso)
  flaggedContent: Array<{
    word: string;
    reason: string;
    severity: "low" | "medium" | "high" | "critical";
  }>;
  reformulatedResponse?: string;
  violationType?: ViolationType;
}

export interface UserContext {
  userId: number;
  ageGroup: AgeGroup;
  country?: string;
  religion?: string;
  moderationLevel?: "strict" | "moderate" | "relaxed";
}

export async function getUserSafetyContext(userId: number): Promise<{
  context: UserContext;
  hasSafetyProfile: boolean;
  hasParentalConsent: boolean;
}> {
  const db = await getDb();
  if (!db) {
    return { context: { userId, ageGroup: "adulto" }, hasSafetyProfile: false, hasParentalConsent: false };
  }
  const [profile] = await db.select().from(userSafetyProfile)
    .where(eq(userSafetyProfile.userId, userId)).limit(1);
  if (!profile) {
    return { context: { userId, ageGroup: "adulto" }, hasSafetyProfile: false, hasParentalConsent: false };
  }
  return {
    context: {
      userId,
      ageGroup: profile.ageGroup as AgeGroup,
      country: profile.country || undefined,
      religion: profile.religion || undefined,
      moderationLevel: profile.moderationLevel as UserContext["moderationLevel"],
    },
    hasSafetyProfile: true,
    hasParentalConsent: Boolean(profile.parentalConsentGiven),
  };
}

// ============================================================
// REGRAS DE MODERAÇÃO PADRÃO
// ============================================================

/**
 * Palavras bloqueadas por faixa etária
 */
const DEFAULT_BLOCKED_WORDS: Record<AgeGroup, string[]> = {
  infantil: [
    // Violência
    "kill", "murder", "blood", "weapon", "gun", "knife", "bomb",
    "matar", "assassinar", "sangue", "arma", "faca", "bomba",
    
    // Conteúdo adulto
    "sex", "porn", "nude", "naked", "breast",
    "sexo", "pornografia", "nu", "nua", "seio",
    
    // Palavrões
    "fuck", "shit", "damn", "hell", "ass", "bitch",
    "porra", "merda", "caralho", "puta", "cu", "bosta",
    
    // Drogas/álcool
    "drug", "cocaine", "marijuana", "alcohol", "beer", "wine",
    "droga", "cocaína", "maconha", "álcool", "cerveja", "vinho",
    
    // Assuntos sensíveis
    "suicide", "death", "depression", "anxiety",
    "suicídio", "morte", "depressão", "ansiedade",
  ],
  
  adolescente: [
    // Conteúdo adulto explícito
    "porn", "nude", "naked", "breast", "penis", "vagina",
    "pornografia", "nu", "nua", "seio", "pênis", "vagina",
    
    // Palavrões pesados
    "fuck", "shit", "motherfucker", "cunt",
    "porra", "caralho", "filho da puta",
    
    // Drogas pesadas
    "cocaine", "heroin", "meth",
    "cocaína", "heroína", "metanfetamina",
    
    // Violência extrema
    "murder", "torture", "rape",
    "assassinar", "tortura", "estupro",
  ],
  
  adulto: [
    // Apenas conteúdo extremamente ofensivo
    "child porn", "pedophilia", "terrorism",
    "pornografia infantil", "pedofilia", "terrorismo",
  ],
};

/**
 * Tópicos sensíveis por religião
 */
const RELIGIOUS_SENSITIVE_TOPICS: Record<string, string[]> = {
  muslim: ["pork", "alcohol", "gambling", "porco", "álcool", "jogo"],
  jewish: ["pork", "shellfish", "porco", "frutos do mar"],
  hindu: ["beef", "cow", "carne de vaca", "vaca"],
  buddhist: ["meat", "killing", "carne", "matar"],
};

// ============================================================
// FUNÇÕES PRINCIPAIS
// ============================================================

/**
 * Valida resposta da IA antes de enviar ao aluno
 */
export async function moderateAIResponse(
  userContext: UserContext,
  aiResponse: string,
  userMessage?: string
): Promise<ModerationResult> {
  try {
    const db = await getDb();
    if (!db) {
      return {
        isAllowed: true,
        moderationScore: 0,
        flaggedContent: [],
      };
    }

    // 1. Buscar perfil de segurança do usuário
    const safetyProfile = await db
      .select()
      .from(userSafetyProfile)
      .where(eq(userSafetyProfile.userId, userContext.userId))
      .limit(1);

    const moderationLevel = safetyProfile[0]?.moderationLevel || "moderate";
    const customBlockedWords = safetyProfile[0]?.customBlockedWords || [];

    // 2. Buscar regras de moderação aplicáveis
    const rules = await db
      .select()
      .from(contentModerationRules)
      .where(eq(contentModerationRules.isActive, true));

    // 3. Verificar palavras bloqueadas
    const flaggedContent: ModerationResult["flaggedContent"] = [];
    let moderationScore = 0;

    // Palavras padrão por idade
    const blockedWords = DEFAULT_BLOCKED_WORDS[userContext.ageGroup] || [];
    const allBlockedWords = [...blockedWords, ...customBlockedWords];

    for (const word of allBlockedWords) {
      const regex = new RegExp(`\\b${word}\\b`, "gi");
      if (regex.test(aiResponse)) {
        flaggedContent.push({
          word,
          reason: `Palavra bloqueada para ${userContext.ageGroup}`,
          severity: userContext.ageGroup === "infantil" ? "critical" : "high",
        });
        moderationScore += userContext.ageGroup === "infantil" ? 30 : 20;
      }
    }

    // 4. Verificar sensibilidade religiosa
    if (userContext.religion) {
      const religiousSensitive = RELIGIOUS_SENSITIVE_TOPICS[userContext.religion] || [];
      for (const topic of religiousSensitive) {
        const regex = new RegExp(`\\b${topic}\\b`, "gi");
        if (regex.test(aiResponse)) {
          flaggedContent.push({
            word: topic,
            reason: `Tópico sensível para religião ${userContext.religion}`,
            severity: "medium",
          });
          moderationScore += 15;
        }
      }
    }

    // 5. Usar LLM para análise semântica avançada
    const semanticAnalysis = await analyzeSemantically(
      aiResponse,
      userContext.ageGroup
    );

    moderationScore += semanticAnalysis.score;
    flaggedContent.push(...semanticAnalysis.flagged);

    // 6. Decidir ação
    const threshold = getThreshold(moderationLevel, userContext.ageGroup);
    const isAllowed = moderationScore < threshold;

    // 7. Reformular se necessário
    let reformulatedResponse: string | undefined;
    if (!isAllowed && moderationScore < 80) {
      // Tentar reformular ao invés de bloquear totalmente
      reformulatedResponse = await reformulateResponse(
        aiResponse,
        flaggedContent,
        userContext.ageGroup
      );
    }

    // 8. Registrar log
    await logConversation({
      userId: userContext.userId,
      conversationType: "general_chat",
      userMessage: userMessage || null,
      aiResponse: reformulatedResponse || aiResponse,
      moderationScore,
      flaggedContent,
      wasBlocked: !isAllowed && !reformulatedResponse,
      wasReformulated: !!reformulatedResponse,
      originalAiResponse: reformulatedResponse ? aiResponse : null,
      userAgeGroup: userContext.ageGroup,
      userCountry: userContext.country || null,
      userReligion: userContext.religion || null,
    });

    // 9. Criar alerta se violação grave
    if (moderationScore > 70) {
      await createModerationAlert({
        userId: userContext.userId,
        violationType: determineViolationType(flaggedContent),
        severity: moderationScore > 90 ? "critical" : moderationScore > 70 ? "high" : "medium",
        detectedContent: aiResponse,
        flaggedContent,
      });
    }

    return {
      isAllowed: isAllowed || !!reformulatedResponse,
      moderationScore,
      flaggedContent,
      reformulatedResponse,
      violationType: moderationScore > 50 ? determineViolationType(flaggedContent) : undefined,
    };
  } catch (error) {
    console.error("❌ Error in content moderation:", error);
    // Em caso de erro, permitir mas logar
    return {
      isAllowed: true,
      moderationScore: 0,
      flaggedContent: [],
    };
  }
}

/**
 * Análise semântica com LLM
 */
async function analyzeSemantically(
  text: string,
  ageGroup: AgeGroup
): Promise<{ score: number; flagged: ModerationResult["flaggedContent"] }> {
  try {
    const prompt = `
Você é um moderador de conteúdo especializado em proteger ${ageGroup === "infantil" ? "crianças" : ageGroup === "adolescente" ? "adolescentes" : "adultos"}.

Analise o seguinte texto e identifique qualquer conteúdo inapropriado:

"${text}"

Considere:
- Violência explícita ou implícita
- Conteúdo sexual ou sugestivo
- Linguagem ofensiva ou palavrões
- Discurso de ódio ou discriminação
- Informações pessoais sensíveis
- Tópicos sensíveis para a faixa etária

Retorne um score de 0-50 (0 = totalmente seguro, 50 = muito perigoso) e liste os problemas encontrados.
`;

    const response = await invokeLLM({
      messages: [
        { role: "system", content: "Você é um moderador de conteúdo profissional." },
        { role: "user", content: prompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "moderation_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              score: {
                type: "number",
                description: "Score de 0-50 indicando perigo do conteúdo",
              },
              issues: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    content: { type: "string" },
                    reason: { type: "string" },
                    severity: {
                      type: "string",
                      enum: ["low", "medium", "high", "critical"],
                    },
                  },
                  required: ["content", "reason", "severity"],
                  additionalProperties: false,
                },
              },
            },
            required: ["score", "issues"],
            additionalProperties: false,
          },
        },
      },
    });

    const analysis = JSON.parse(response.choices[0].message.content as string);

    return {
      score: analysis.score,
      flagged: analysis.issues.map((issue: any) => ({
        word: issue.content,
        reason: issue.reason,
        severity: issue.severity,
      })),
    };
  } catch (error) {
    console.error("❌ Error in semantic analysis:", error);
    return { score: 0, flagged: [] };
  }
}

/**
 * Reformula resposta para remover conteúdo inapropriado
 */
async function reformulateResponse(
  originalResponse: string,
  flaggedContent: ModerationResult["flaggedContent"],
  ageGroup: AgeGroup
): Promise<string | undefined> {
  try {
    const issues = flaggedContent.map((f) => f.word).join(", ");

    const prompt = `
Você é um assistente educacional especializado em comunicação segura com ${ageGroup === "infantil" ? "crianças" : ageGroup === "adolescente" ? "adolescentes" : "adultos"}.

A seguinte resposta contém conteúdo inapropriado: "${issues}"

Resposta original:
"${originalResponse}"

Reformule a resposta para:
1. Manter o significado e utilidade educacional
2. Remover completamente o conteúdo inapropriado
3. Usar linguagem adequada para a faixa etária
4. Ser respeitoso e profissional

Retorne APENAS a resposta reformulada, sem explicações.
`;

    const response = await invokeLLM({
      messages: [
        { role: "system", content: "Você é um assistente educacional profissional." },
        { role: "user", content: prompt },
      ],
    });

    const reformulated = (response.choices[0].message.content as string).trim();

    // Validar que reformulação não contém as mesmas palavras
    const stillContainsIssues = flaggedContent.some((f) => {
      const regex = new RegExp(`\\b${f.word}\\b`, "gi");
      return regex.test(reformulated);
    });

    return stillContainsIssues ? undefined : reformulated;
  } catch (error) {
    console.error("❌ Error reformulating response:", error);
    return undefined;
  }
}

/**
 * Threshold de moderação por nível e idade
 */
function getThreshold(
  moderationLevel: "strict" | "moderate" | "relaxed",
  ageGroup: AgeGroup
): number {
  const thresholds = {
    infantil: { strict: 20, moderate: 30, relaxed: 40 },
    adolescente: { strict: 40, moderate: 50, relaxed: 60 },
    adulto: { strict: 60, moderate: 70, relaxed: 80 },
  };

  return thresholds[ageGroup][moderationLevel];
}

/**
 * Determina tipo de violação baseado no conteúdo flagado
 */
function determineViolationType(
  flaggedContent: ModerationResult["flaggedContent"]
): ViolationType {
  const reasons = flaggedContent.map((f) => f.reason.toLowerCase()).join(" ");

  if (reasons.includes("violência") || reasons.includes("violence")) return "violence";
  if (reasons.includes("sexual") || reasons.includes("sexo")) return "sexual_content";
  if (reasons.includes("palavrão") || reasons.includes("profanity")) return "profanity";
  if (reasons.includes("ódio") || reasons.includes("hate")) return "hate_speech";
  if (reasons.includes("pessoal") || reasons.includes("personal")) return "personal_info";
  if (reasons.includes("bullying")) return "bullying";

  return "inappropriate_content";
}

/**
 * Registra conversa no log
 */
async function logConversation(data: Omit<InsertConversationLog, "id" | "createdAt">) {
  try {
    const db = await getDb();
    if (!db) return;

    await db.insert(conversationLogs).values(data as any);
  } catch (error) {
    console.error("❌ Error logging conversation:", error);
  }
}

/**
 * Cria alerta de moderação
 */
async function createModerationAlert(data: {
  userId: number;
  violationType: ViolationType;
  severity: "low" | "medium" | "high" | "critical";
  detectedContent: string;
  flaggedContent: ModerationResult["flaggedContent"];
}) {
  try {
    const db = await getDb();
    if (!db) return;

    // Buscar último log de conversa do usuário
    const lastLog = await db
      .select()
      .from(conversationLogs)
      .where(eq(conversationLogs.userId, data.userId))
      .orderBy(conversationLogs.id)
      .limit(1);

    if (lastLog.length === 0) return;

    const alertData: Omit<InsertModerationAlert, "id" | "createdAt" | "updatedAt"> = {
      conversationLogId: lastLog[0].id,
      userId: data.userId,
      violationType: data.violationType,
      severity: data.severity,
      detectedContent: data.detectedContent,
      violatedRules: [],
      status: "pending",
      reviewedBy: null,
      reviewNotes: null,
      reviewedAt: null,
      actionTaken: null,
    };

    await db.insert(moderationAlerts).values(alertData as any);

    console.log(`⚠️ Moderation alert created for user ${data.userId}: ${data.violationType} (${data.severity})`);
  } catch (error) {
    console.error("❌ Error creating moderation alert:", error);
  }
}

// ============================================================
// FUNÇÕES DE GERENCIAMENTO
// ============================================================

/**
 * Cria perfil de segurança para novo usuário
 */
export async function createUserSafetyProfile(
  userId: number,
  ageGroup: AgeGroup,
  dateOfBirth?: Date,
  country?: string,
  religion?: string
) {
  try {
    const db = await getDb();
    if (!db) return;

    await db.insert(userSafetyProfile).values({
      userId,
      ageGroup,
      dateOfBirth: dateOfBirth || null,
      country: country || null,
      religion: religion || null,
      parentalConsentGiven: ageGroup === "infantil" ? false : true,
      parentEmail: null,
      parentConsentDate: null,
      moderationLevel: ageGroup === "infantil" ? "strict" : "moderate",
      customBlockedWords: [],
      violationCount: 0,
      lastViolationDate: null,
      isRestricted: false,
      restrictionReason: null,
      restrictionEndDate: null,
    } as any);

    console.log(`✅ Safety profile created for user ${userId} (${ageGroup})`);
  } catch (error) {
    console.error("❌ Error creating safety profile:", error);
  }
}

/**
 * Adiciona palavra à blacklist customizada do usuário
 */
export async function addCustomBlockedWord(userId: number, word: string) {
  try {
    const db = await getDb();
    if (!db) return;

    const profile = await db
      .select()
      .from(userSafetyProfile)
      .where(eq(userSafetyProfile.userId, userId))
      .limit(1);

    if (profile.length === 0) return;

    const currentWords = profile[0].customBlockedWords || [];
    const updatedWords = [...currentWords, word.toLowerCase()];

    await db
      .update(userSafetyProfile)
      .set({ customBlockedWords: updatedWords as any })
      .where(eq(userSafetyProfile.userId, userId));

    console.log(`✅ Added custom blocked word "${word}" for user ${userId}`);
  } catch (error) {
    console.error("❌ Error adding custom blocked word:", error);
  }
}
