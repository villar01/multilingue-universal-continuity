/**
 * Sistema de Conversação Prática Interativa
 * Inspirado em Mondly e Teacher Poli
 * Diálogos interativos com reconhecimento de voz e feedback imediato
 */

import { invokeBlackboxAI } from "./blackbox-ai";
import { TRPCError } from "@trpc/server";

interface ConversationScenario {
  scenarioId: string;
  title: string;
  description: string;
  difficulty: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  category: "daily" | "travel" | "business" | "academic";
  characters: Character[];
  dialogueSteps: DialogueStep[];
  learningObjectives: string[];
  vocabulary: string[];
  grammarPoints: string[];
}

interface Character {
  id: string;
  name: string;
  role: string; // "teacher", "friend", "waiter", "receptionist", etc.
  personality: string;
  avatarUrl: string;
  voiceId: string;
}

interface DialogueStep {
  stepId: number;
  characterId: string;
  text: string;
  translation: string;
  audioUrl?: string;
  expectedResponse: ExpectedResponse;
  hints: string[];
  feedback: FeedbackCriteria;
}

interface ExpectedResponse {
  type: "open" | "multiple-choice" | "fill-blank" | "pronunciation";
  acceptableAnswers?: string[];
  keywords?: string[];
  grammarPattern?: string;
}

interface FeedbackCriteria {
  pronunciation: {
    threshold: number; // 0-100
    focusPhonemes: string[];
  };
  grammar: {
    requiredStructures: string[];
  };
  vocabulary: {
    requiredWords: string[];
  };
}

interface PronunciationFeedback {
  score: number; // 0-100
  overallQuality: "excellent" | "good" | "needs-improvement" | "poor";
  phonemeScores: Array<{
    phoneme: string;
    score: number;
    feedback: string;
  }>;
  suggestions: string[];
  encouragement: string;
}

/**
 * Cenários de conversação estilo Mondly
 */
const CONVERSATION_SCENARIOS = {
  daily: [
    {
      id: "greeting_stranger",
      title: "Cumprimentando um Estranho",
      description: "Aprenda a se apresentar e iniciar uma conversa casual",
      situation: "Você está em um café e quer fazer amizade com alguém",
    },
    {
      id: "asking_directions",
      title: "Pedindo Direções",
      description: "Pratique pedir e entender direções na rua",
      situation: "Você está perdido e precisa chegar à estação de trem",
    },
    {
      id: "restaurant_order",
      title: "Pedindo no Restaurante",
      description: "Faça seu pedido com confiança",
      situation: "Você está em um restaurante e quer pedir comida",
    },
  ],
  travel: [
    {
      id: "hotel_checkin",
      title: "Check-in no Hotel",
      description: "Pratique fazer check-in e resolver problemas",
      situation: "Você chegou ao hotel e precisa fazer check-in",
    },
    {
      id: "airport_customs",
      title: "Passando pela Alfândega",
      description: "Responda perguntas de imigração com confiança",
      situation: "Você está na fila da imigração no aeroporto",
    },
  ],
  business: [
    {
      id: "job_interview",
      title: "Entrevista de Emprego",
      description: "Pratique responder perguntas comuns de entrevista",
      situation: "Você está em uma entrevista para um emprego dos sonhos",
    },
    {
      id: "business_meeting",
      title: "Reunião de Negócios",
      description: "Apresente ideias e negocie profissionalmente",
      situation: "Você está apresentando um projeto para clientes",
    },
  ],
};

/**
 * Gera cenário de conversação interativa com Blackbox AI
 */
export async function generateConversationScenario(params: {
  scenarioId: string;
  targetLanguage: string;
  nativeLanguage: string;
  difficulty: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  userLevel?: number; // 1-100
}): Promise<ConversationScenario> {
  // Buscar template do cenário
  const scenarioTemplate = findScenarioTemplate(params.scenarioId);

  if (!scenarioTemplate) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Cenário ${params.scenarioId} não encontrado`,
    });
  }

  const prompt = `Você é um especialista em design de conversações interativas para aprendizado de idiomas. Crie um cenário de conversação completo e envolvente.

**Especificações:**
- Cenário: ${scenarioTemplate.title}
- Descrição: ${scenarioTemplate.description}
- Situação: ${scenarioTemplate.situation}
- Idioma alvo: ${params.targetLanguage}
- Idioma nativo: ${params.nativeLanguage}
- Nível: ${params.difficulty}
- Nível do usuário: ${params.userLevel || 50}/100

**Requisitos:**
1. Diálogo com 8-12 etapas (turnos de conversação)
2. Personagens realistas com personalidades distintas
3. Respostas esperadas flexíveis (aceitar variações naturais)
4. Feedback construtivo e encorajador
5. Dicas contextualizadas para ajudar o aluno
6. Objetivos de aprendizado claros

**Formato JSON:**
{
  "scenarioId": "${params.scenarioId}",
  "title": "${scenarioTemplate.title}",
  "description": "${scenarioTemplate.description}",
  "difficulty": "${params.difficulty}",
  "category": "daily/travel/business/academic",
  "characters": [
    {
      "id": "char1",
      "name": "Nome",
      "role": "papel (waiter, receptionist, etc.)",
      "personality": "descrição da personalidade",
      "avatarUrl": "/avatars/character.png",
      "voiceId": "voice_id"
    }
  ],
  "dialogueSteps": [
    {
      "stepId": 1,
      "characterId": "char1",
      "text": "fala do personagem no idioma alvo",
      "translation": "tradução",
      "expectedResponse": {
        "type": "open",
        "acceptableAnswers": ["resposta1", "resposta2"],
        "keywords": ["palavra-chave1", "palavra-chave2"]
      },
      "hints": ["dica1", "dica2"],
      "feedback": {
        "pronunciation": {
          "threshold": 70,
          "focusPhonemes": ["th", "r"]
        },
        "grammar": {
          "requiredStructures": ["present simple"]
        },
        "vocabulary": {
          "requiredWords": ["hello", "name"]
        }
      }
    }
  ],
  "learningObjectives": ["objetivo1", "objetivo2"],
  "vocabulary": ["palavra1", "palavra2"],
  "grammarPoints": ["ponto1", "ponto2"]
}

Crie um cenário completo e pedagogicamente eficaz. Responda APENAS com JSON válido.`;

  const response = await invokeBlackboxAI({
    messages: [
      {
        role: "system",
        content:
          "Você é um designer de conversações interativas especializado em aprendizado de idiomas. Crie diálogos naturais, envolventes e pedagogicamente sólidos. Responda APENAS com JSON válido.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 4000,
  });

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Resposta não contém JSON válido");
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("[Interactive Conversation] Failed to parse AI response:", response);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Falha ao gerar cenário de conversação",
    });
  }
}

/**
 * Analisa pronúncia do usuário e retorna feedback detalhado
 */
export async function analyzePronunciationFeedback(params: {
  audioTranscript: string;
  expectedText: string;
  targetLanguage: string;
  focusPhonemes: string[];
}): Promise<PronunciationFeedback> {
  const prompt = `Você é um especialista em fonética e ensino de pronúncia. Analise a transcrição do áudio do aluno e forneça feedback detalhado.

**Esperado:** "${params.expectedText}"
**Falado:** "${params.audioTranscript}"
**Idioma:** ${params.targetLanguage}
**Fonemas em foco:** ${params.focusPhonemes.join(", ")}

Forneça feedback no formato JSON:
{
  "score": 0-100,
  "overallQuality": "excellent" | "good" | "needs-improvement" | "poor",
  "phonemeScores": [
    {
      "phoneme": "th",
      "score": 85,
      "feedback": "Boa pronúncia! Continue praticando."
    }
  ],
  "suggestions": ["sugestão1", "sugestão2"],
  "encouragement": "mensagem encorajadora personalizada"
}`;

  const response = await invokeBlackboxAI({
    messages: [
      {
        role: "system",
        content:
          "Você é um professor de pronúncia empático e encorajador. Forneça feedback construtivo que motive o aluno. Responda APENAS com JSON válido.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.5,
  });

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Resposta não contém JSON válido");
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("[Interactive Conversation] Failed to parse pronunciation feedback:", response);
    // Fallback com feedback genérico
    return {
      score: 70,
      overallQuality: "good",
      phonemeScores: [],
      suggestions: ["Continue praticando!", "Tente falar mais devagar"],
      encouragement: "Você está indo bem! Continue assim!",
    };
  }
}

/**
 * Busca template de cenário
 */
function findScenarioTemplate(scenarioId: string): any {
  for (const scenarios of Object.values(CONVERSATION_SCENARIOS)) {
    const found = scenarios.find((s) => s.id === scenarioId);
    if (found) return found;
  }
  return null;
}

/**
 * Lista todos cenários disponíveis
 */
export function listAvailableScenarios(params?: {
  category?: "daily" | "travel" | "business" | "academic";
  difficulty?: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
}): Array<{
  id: string;
  title: string;
  description: string;
  category: string;
}> {
  const allScenarios: any[] = [];

  for (const [category, scenarios] of Object.entries(CONVERSATION_SCENARIOS)) {
    for (const scenario of scenarios) {
      if (!params?.category || params.category === category) {
        allScenarios.push({
          ...scenario,
          category,
        });
      }
    }
  }

  return allScenarios;
}

/**
 * Gera feedback em tempo real durante conversação
 */
export async function generateRealtimeFeedback(params: {
  userResponse: string;
  expectedResponse: ExpectedResponse;
  context: {
    previousSteps: string[];
    currentObjective: string;
  };
}): Promise<{
  isCorrect: boolean;
  score: number;
  feedback: string;
  suggestions: string[];
  nextHint?: string;
}> {
  const { userResponse, expectedResponse, context } = params;

  // Verificação básica
  if (expectedResponse.type === "multiple-choice") {
    const isCorrect = expectedResponse.acceptableAnswers?.some((answer) =>
      userResponse.toLowerCase().includes(answer.toLowerCase())
    );

    return {
      isCorrect: isCorrect || false,
      score: isCorrect ? 100 : 0,
      feedback: isCorrect
        ? "Perfeito! Resposta correta! 🎉"
        : "Não exatamente. Tente novamente!",
      suggestions: isCorrect ? [] : ["Revise as opções", "Pense no contexto"],
    };
  }

  // Para respostas abertas, usar IA para avaliar
  const prompt = `Avalie a resposta do aluno em uma conversação interativa.

**Contexto:** ${context.currentObjective}
**Passos anteriores:** ${context.previousSteps.join(" → ")}
**Resposta esperada (keywords):** ${expectedResponse.keywords?.join(", ")}
**Resposta do aluno:** "${userResponse}"

Forneça avaliação no formato JSON:
{
  "isCorrect": true/false,
  "score": 0-100,
  "feedback": "feedback específico e encorajador",
  "suggestions": ["sugestão1", "sugestão2"],
  "nextHint": "dica para próximo passo (se necessário)"
}`;

  const response = await invokeBlackboxAI({
    messages: [
      {
        role: "system",
        content:
          "Você é um avaliador de conversação empático. Seja encorajador mas honesto. Responda APENAS com JSON válido.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.4,
  });

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Resposta não contém JSON válido");
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("[Interactive Conversation] Failed to parse realtime feedback:", response);
    // Fallback: aceitar resposta se contém keywords
    const hasKeywords = expectedResponse.keywords?.some((keyword) =>
      userResponse.toLowerCase().includes(keyword.toLowerCase())
    );

    return {
      isCorrect: hasKeywords || false,
      score: hasKeywords ? 80 : 50,
      feedback: hasKeywords
        ? "Boa resposta! Continue assim!"
        : "Resposta parcialmente correta. Tente incluir mais detalhes.",
      suggestions: ["Use as palavras-chave sugeridas", "Seja mais específico"],
    };
  }
}
