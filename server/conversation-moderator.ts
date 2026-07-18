/**
 * Sistema de Moderação de Conversação com Professores
 * COMUNICAÇÃO LIVRE ATIVADA: Permite qualquer tópico educacional
 * Bloqueia apenas conteúdo ilegal, imoral ou inapropriado
 * NÃO restringe a tópicos da lição
 */

import { invokeBlackboxAI } from "./blackbox-ai";
import { TRPCError } from "@trpc/server";

interface ModerationRequest {
  userMessage: string;
  lessonContext: {
    lessonId: number;
    title: string;
    topic: string;
    vocabulary: string[];
    grammarPoints: string[];
  };
  conversationHistory?: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
}

interface ModerationResult {
  allowed: boolean;
  reason?: string;
  redirectMessage?: string;
  severity: "safe" | "off-topic" | "inappropriate" | "blocked";
  suggestedResponse?: string;
}

/**
 * Categorias de conteúdo bloqueado
 */
const BLOCKED_CATEGORIES = [
  "conteúdo sexual explícito",
  "violência gráfica",
  "discurso de ódio",
  "conteúdo ilegal",
  "drogas e substâncias",
  "automutilação",
  "assédio ou bullying",
  "informações pessoais sensíveis",
  "spam ou propaganda",
  "conteúdo político extremista",
];

/**
 * Tópicos permitidos (sempre relacionados ao aprendizado de idiomas)
 */
const ALLOWED_TOPICS = [
  "vocabulário da lição",
  "gramática explicada",
  "pronúncia de palavras",
  "exemplos de uso",
  "dúvidas sobre exercícios",
  "prática de conversação contextualizada",
  "cultura do idioma alvo",
  "expressões idiomáticas",
  "diferenças regionais de sotaque",
  "dicas de estudo",
];

/**
 * Modera mensagem do usuário antes de enviar ao professor virtual
 */
export async function moderateConversation(
  request: ModerationRequest
): Promise<ModerationResult> {
  const { userMessage, lessonContext } = request;

  // Verificação rápida de palavras-chave bloqueadas
  const quickCheck = quickModerationCheck(userMessage);
  if (!quickCheck.allowed) {
    return quickCheck;
  }

  // Análise profunda com Blackbox AI
  try {
    const aiAnalysis = await analyzeWithAI(userMessage, lessonContext);
    return aiAnalysis;
  } catch (error) {
    console.error("[Conversation Moderator] AI analysis failed:", error);
    // Fallback: permitir se não conseguir analisar, mas com aviso
    return {
      allowed: true,
      severity: "safe",
      suggestedResponse: "Vamos focar no conteúdo da lição. Como posso ajudar você a praticar?",
    };
  }
}

/**
 * Verificação rápida de palavras-chave bloqueadas (sem IA)
 */
function quickModerationCheck(message: string): ModerationResult {
  const lowerMessage = message.toLowerCase();

  // Lista de palavras/frases bloqueadas (expandir conforme necessário)
  const blockedKeywords = [
    "sexo", "pornografia", "nude", "nudes",
    "drogas", "maconha", "cocaína", "crack",
    "matar", "assassinar", "suicídio", "suicidar",
    "terrorismo", "bomba", "arma",
    "hack", "hackear", "pirataria",
    "racismo", "nazismo", "fascismo",
  ];

  for (const keyword of blockedKeywords) {
    if (lowerMessage.includes(keyword)) {
      return {
        allowed: false,
        severity: "blocked",
        reason: "Conteúdo inapropriado detectado",
        redirectMessage:
          "⚠️ Esta plataforma é exclusivamente educacional. Vamos focar no aprendizado de idiomas! Como posso ajudar você com a lição atual?",
      };
    }
  }

  return { allowed: true, severity: "safe" };
}

/**
 * Análise profunda com Blackbox AI
 */
async function analyzeWithAI(
  message: string,
  lessonContext: ModerationRequest["lessonContext"]
): Promise<ModerationResult> {
  const prompt = `Você é um moderador de conteúdo educacional. Analise a seguinte mensagem de um aluno e determine se está apropriada para uma plataforma de ensino de idiomas.

**Contexto da Lição:**
- Título: ${lessonContext.title}
- Tópico: ${lessonContext.topic}
- Vocabulário: ${lessonContext.vocabulary.join(", ")}
- Gramática: ${lessonContext.grammarPoints.join(", ")}

**Mensagem do Aluno:**
"${message}"

**Critérios de Avaliação:**
1. A mensagem está relacionada ao tópico da lição?
2. A mensagem contém conteúdo inapropriado (sexual, violento, ilegal, etc.)?
3. A mensagem é uma tentativa legítima de praticar o idioma?

**Categorias Bloqueadas:**
${BLOCKED_CATEGORIES.join(", ")}

**Tópicos Permitidos:**
${ALLOWED_TOPICS.join(", ")}

Responda APENAS com JSON válido no formato:
{
  "allowed": true/false,
  "severity": "safe" | "off-topic" | "inappropriate" | "blocked",
  "reason": "explicação breve",
  "redirectMessage": "mensagem educativa para redirecionar o aluno (se necessário)",
  "suggestedResponse": "resposta sugerida do professor (se permitido)"
}`;

  const response = await invokeBlackboxAI({
    messages: [
      {
        role: "system",
        content:
          "Você é um moderador de conteúdo educacional rigoroso mas empático. Priorize a segurança dos alunos e mantenha o foco no aprendizado. Responda APENAS com JSON válido.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.3,
  });

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Resposta não contém JSON válido");
    }
    const result: ModerationResult = JSON.parse(jsonMatch[0]);

    // Validar campos obrigatórios
    if (typeof result.allowed !== "boolean" || !result.severity) {
      throw new Error("JSON inválido: campos obrigatórios ausentes");
    }

    return result;
  } catch (error) {
    console.error("[Conversation Moderator] Failed to parse AI response:", response);
    // Fallback conservador: bloquear se não conseguir analisar
    return {
      allowed: false,
      severity: "inappropriate",
      reason: "Não foi possível analisar a mensagem. Por precaução, vamos focar no conteúdo da lição.",
      redirectMessage:
        "Desculpe, não consegui processar sua mensagem. Vamos focar no tópico da lição atual. Como posso ajudar?",
    };
  }
}

/**
 * Gera resposta do professor quando aluno sai do tópico
 */
export function generateRedirectResponse(
  lessonContext: ModerationRequest["lessonContext"],
  severity: ModerationResult["severity"]
): string {
  if (severity === "blocked") {
    return "⚠️ Esta plataforma é exclusivamente educacional. Vamos focar no aprendizado de idiomas! Como posso ajudar você com a lição atual?";
  }

  if (severity === "inappropriate") {
    return "🙏 Por favor, mantenha a conversa apropriada e focada no aprendizado. Vamos praticar o conteúdo da lição!";
  }

  if (severity === "off-topic") {
    return `📚 Entendo sua curiosidade, mas vamos focar na lição "${lessonContext.title}". Que tal praticarmos o vocabulário: ${lessonContext.vocabulary.slice(0, 3).join(", ")}?`;
  }

  return "Como posso ajudar você a praticar o conteúdo desta lição?";
}

/**
 * Verifica se conversa está se desviando do tópico
 */
export function detectTopicDrift(
  conversationHistory: Array<{ role: string; content: string }>,
  lessonContext: ModerationRequest["lessonContext"]
): {
  isDrifting: boolean;
  driftScore: number; // 0-100 (quanto maior, mais desviado)
  recommendation: string;
} {
  if (conversationHistory.length < 3) {
    return {
      isDrifting: false,
      driftScore: 0,
      recommendation: "Conversa ainda no início",
    };
  }

  // Contar quantas mensagens mencionam vocabulário/gramática da lição
  const recentMessages = conversationHistory.slice(-5);
  const lessonKeywords = [
    ...lessonContext.vocabulary,
    ...lessonContext.grammarPoints,
    lessonContext.topic,
  ].map((k) => k.toLowerCase());

  let onTopicCount = 0;
  for (const msg of recentMessages) {
    const hasKeyword = lessonKeywords.some((keyword) =>
      msg.content.toLowerCase().includes(keyword)
    );
    if (hasKeyword) onTopicCount++;
  }

  const onTopicRatio = onTopicCount / recentMessages.length;
  const driftScore = Math.round((1 - onTopicRatio) * 100);

  if (driftScore > 70) {
    return {
      isDrifting: true,
      driftScore,
      recommendation: `Vamos voltar ao tópico da lição: "${lessonContext.title}". Que tal praticarmos?`,
    };
  }

  if (driftScore > 40) {
    return {
      isDrifting: true,
      driftScore,
      recommendation: `Estamos nos afastando um pouco do tópico. Vamos focar em: ${lessonContext.vocabulary.slice(0, 2).join(", ")}`,
    };
  }

  return {
    isDrifting: false,
    driftScore,
    recommendation: "Conversa focada no tópico da lição",
  };
}

/**
 * Gera sugestões de perguntas relacionadas à lição
 */
export function generateLessonQuestions(
  lessonContext: ModerationRequest["lessonContext"]
): string[] {
  const questions: string[] = [];

  // Perguntas sobre vocabulário
  if (lessonContext.vocabulary.length > 0) {
    questions.push(
      `Como se pronuncia "${lessonContext.vocabulary[0]}"?`,
      `Pode me dar um exemplo usando "${lessonContext.vocabulary[1] || lessonContext.vocabulary[0]}"?`,
      `Qual a diferença entre "${lessonContext.vocabulary[0]}" e palavras similares?`
    );
  }

  // Perguntas sobre gramática
  if (lessonContext.grammarPoints.length > 0) {
    questions.push(
      `Pode explicar melhor sobre ${lessonContext.grammarPoints[0]}?`,
      `Como usar ${lessonContext.grammarPoints[0]} em uma frase?`,
      `Quais são os erros comuns com ${lessonContext.grammarPoints[0]}?`
    );
  }

  // Perguntas gerais
  questions.push(
    `Pode me ajudar a praticar uma conversação sobre ${lessonContext.topic}?`,
    `Quais expressões são úteis para ${lessonContext.topic}?`,
    `Como nativos falam sobre ${lessonContext.topic}?`
  );

  return questions.slice(0, 5);
}
