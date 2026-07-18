/**
 * Sistema de Exercícios de Mentalização e Prática Imersiva
 * Visualização mental, role-playing, shadowing, método loci
 */

import { invokeBlackboxAI } from "./blackbox-ai";
import { TRPCError } from "@trpc/server";

interface MentalizationExercise {
  exerciseId: string;
  type: "visualization" | "role-play" | "shadowing" | "loci" | "listening";
  title: string;
  description: string;
  duration: number; // minutos
  difficulty: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  instructions: string[];
  scenario: ExerciseScenario;
  audioUrl?: string;
  imageUrl?: string;
  successCriteria: SuccessCriteria;
}

interface ExerciseScenario {
  setting: string; // "restaurante", "aeroporto", "hotel", etc.
  characters: string[];
  situation: string;
  objectives: string[];
  vocabulary: string[];
  phrases: string[];
}

interface SuccessCriteria {
  completionTime: number; // segundos
  accuracyThreshold: number; // 0-100
  requiredActions: string[];
}

interface VisualizationExercise extends MentalizationExercise {
  type: "visualization";
  guidedScript: string[]; // Passos de visualização guiada
  sensoryPrompts: {
    visual: string[];
    auditory: string[];
    kinesthetic: string[];
  };
}

interface RolePlayExercise extends MentalizationExercise {
  type: "role-play";
  roles: Array<{
    name: string;
    description: string;
    objectives: string[];
  }>;
  dialogue: Array<{
    role: string;
    text: string;
    alternatives: string[];
  }>;
}

interface ShadowingExercise extends MentalizationExercise {
  type: "shadowing";
  audioScript: string;
  speed: "slow" | "normal" | "fast";
  pausePoints: number[]; // Timestamps para pausas
  focusAreas: string[]; // Entonação, ritmo, pronúncia
}

/**
 * Cenários de role-playing práticos
 */
const ROLEPLAY_SCENARIOS = [
  {
    id: "restaurant_complaint",
    title: "Reclamando no Restaurante",
    setting: "Restaurante elegante",
    situation: "Seu pedido veio errado e você precisa resolver educadamente",
    roles: ["cliente", "garçom"],
    difficulty: "B1" as const,
  },
  {
    id: "airport_lost_luggage",
    title: "Bagagem Perdida no Aeroporto",
    setting: "Balcão de bagagens do aeroporto",
    situation: "Sua mala não chegou e você precisa reportar",
    roles: ["passageiro", "atendente"],
    difficulty: "B1" as const,
  },
  {
    id: "hotel_room_problem",
    title: "Problema no Quarto do Hotel",
    setting: "Recepção do hotel",
    situation: "Ar-condicionado quebrado, você precisa trocar de quarto",
    roles: ["hóspede", "recepcionista"],
    difficulty: "A2" as const,
  },
  {
    id: "job_negotiation",
    title: "Negociando Salário",
    setting: "Escritório do RH",
    situation: "Você recebeu oferta de emprego e quer negociar salário",
    roles: ["candidato", "gerente RH"],
    difficulty: "C1" as const,
  },
  {
    id: "doctor_appointment",
    title: "Consulta Médica",
    setting: "Consultório médico",
    situation: "Você está se sentindo mal e precisa descrever sintomas",
    roles: ["paciente", "médico"],
    difficulty: "B1" as const,
  },
];

/**
 * Gera exercício de visualização mental
 */
export async function generateVisualizationExercise(params: {
  scenario: string;
  targetLanguage: string;
  difficulty: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
}): Promise<VisualizationExercise> {
  const prompt = `Crie um exercício de visualização mental para aprendizado de idiomas. A visualização mental ajuda o aluno a "viver" situações reais mentalmente antes de enfrentá-las.

**Cenário:** ${params.scenario}
**Idioma:** ${params.targetLanguage}
**Nível:** ${params.difficulty}

**Formato JSON:**
{
  "exerciseId": "viz_${Date.now()}",
  "type": "visualization",
  "title": "título do exercício",
  "description": "descrição breve",
  "duration": 5-10,
  "difficulty": "${params.difficulty}",
  "instructions": ["passo 1", "passo 2"],
  "scenario": {
    "setting": "local",
    "characters": ["personagem1", "personagem2"],
    "situation": "situação detalhada",
    "objectives": ["objetivo1", "objetivo2"],
    "vocabulary": ["palavra1", "palavra2"],
    "phrases": ["frase1", "frase2"]
  },
  "guidedScript": [
    "Feche os olhos e respire profundamente...",
    "Imagine que você está em [local]...",
    "Você vê [descrição visual]...",
    "Você ouve [sons ambiente]...",
    "Você se aproxima e diz: [frase no idioma alvo]...",
    "A pessoa responde: [resposta]...",
    "Você sente confiança e continua a conversa..."
  ],
  "sensoryPrompts": {
    "visual": ["o que você vê?", "cores?", "pessoas?"],
    "auditory": ["o que você ouve?", "sotaques?", "música de fundo?"],
    "kinesthetic": ["o que você sente?", "temperatura?", "emoções?"]
  },
  "successCriteria": {
    "completionTime": 300,
    "accuracyThreshold": 80,
    "requiredActions": ["visualizar cenário completo", "praticar frases mentalmente"]
  }
}

Crie um exercício imersivo e detalhado. Responda APENAS com JSON válido.`;

  const response = await invokeBlackboxAI({
    messages: [
      {
        role: "system",
        content:
          "Você é um especialista em técnicas de visualização e aprendizado imersivo. Crie exercícios que engajem todos os sentidos. Responda APENAS com JSON válido.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 3000,
  });

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Resposta não contém JSON válido");
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("[Immersive Exercises] Failed to parse visualization exercise:", response);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Falha ao gerar exercício de visualização",
    });
  }
}

/**
 * Gera exercício de role-playing
 */
export async function generateRolePlayExercise(params: {
  scenarioId: string;
  targetLanguage: string;
  nativeLanguage: string;
}): Promise<RolePlayExercise> {
  const scenario = ROLEPLAY_SCENARIOS.find((s) => s.id === params.scenarioId);

  if (!scenario) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Cenário ${params.scenarioId} não encontrado`,
    });
  }

  const prompt = `Crie um exercício de role-playing completo para aprendizado de idiomas.

**Cenário:** ${scenario.title}
**Setting:** ${scenario.setting}
**Situação:** ${scenario.situation}
**Papéis:** ${scenario.roles.join(", ")}
**Idioma alvo:** ${params.targetLanguage}
**Idioma nativo:** ${params.nativeLanguage}
**Nível:** ${scenario.difficulty}

**Formato JSON:**
{
  "exerciseId": "${scenario.id}",
  "type": "role-play",
  "title": "${scenario.title}",
  "description": "descrição detalhada",
  "duration": 10-15,
  "difficulty": "${scenario.difficulty}",
  "instructions": ["instrução1", "instrução2"],
  "scenario": {
    "setting": "${scenario.setting}",
    "characters": ${JSON.stringify(scenario.roles)},
    "situation": "${scenario.situation}",
    "objectives": ["resolver problema", "praticar vocabulário"],
    "vocabulary": ["palavra1", "palavra2"],
    "phrases": ["frase útil 1", "frase útil 2"]
  },
  "roles": [
    {
      "name": "${scenario.roles[0]}",
      "description": "descrição do papel",
      "objectives": ["objetivo1", "objetivo2"]
    }
  ],
  "dialogue": [
    {
      "role": "${scenario.roles[0]}",
      "text": "fala no idioma alvo",
      "alternatives": ["alternativa1", "alternativa2"]
    }
  ],
  "successCriteria": {
    "completionTime": 600,
    "accuracyThreshold": 75,
    "requiredActions": ["completar diálogo", "usar vocabulário-chave"]
  }
}

Crie um role-play realista e prático. Responda APENAS com JSON válido.`;

  const response = await invokeBlackboxAI({
    messages: [
      {
        role: "system",
        content:
          "Você é um especialista em dramatização e ensino comunicativo de idiomas. Crie role-plays autênticos e úteis. Responda APENAS com JSON válido.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 3000,
  });

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Resposta não contém JSON válido");
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("[Immersive Exercises] Failed to parse role-play exercise:", response);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Falha ao gerar exercício de role-play",
    });
  }
}

/**
 * Gera exercício de shadowing (repetir simultaneamente)
 */
export async function generateShadowingExercise(params: {
  text: string;
  targetLanguage: string;
  difficulty: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  speed: "slow" | "normal" | "fast";
}): Promise<ShadowingExercise> {
  const speedMultiplier = params.speed === "slow" ? 0.75 : params.speed === "fast" ? 1.25 : 1.0;

  return {
    exerciseId: `shadow_${Date.now()}`,
    type: "shadowing",
    title: `Shadowing: ${params.text.substring(0, 30)}...`,
    description: "Repita o áudio simultaneamente, imitando pronúncia, ritmo e entonação",
    duration: Math.ceil((params.text.length * 0.05) / speedMultiplier), // Estimativa
    difficulty: params.difficulty,
    instructions: [
      "1. Ouça o áudio uma vez sem repetir",
      "2. Ouça novamente e tente repetir junto (shadowing)",
      "3. Foque em imitar pronúncia, ritmo e entonação",
      "4. Repita até conseguir acompanhar naturalmente",
    ],
    scenario: {
      setting: "Exercício de shadowing",
      characters: ["narrador"],
      situation: "Prática de pronúncia e fluência",
      objectives: ["Melhorar pronúncia", "Desenvolver ritmo natural", "Aumentar fluência"],
      vocabulary: params.text.split(" ").slice(0, 10),
      phrases: [params.text],
    },
    audioScript: params.text,
    speed: params.speed,
    pausePoints: generatePausePoints(params.text),
    focusAreas: ["Entonação", "Ritmo", "Pronúncia de sons difíceis", "Ligação entre palavras"],
    successCriteria: {
      completionTime: Math.ceil((params.text.length * 0.05) / speedMultiplier),
      accuracyThreshold: 85,
      requiredActions: ["Completar shadowing", "Manter ritmo", "Pronúncia clara"],
    },
  };
}

/**
 * Gera pontos de pausa para shadowing
 */
function generatePausePoints(text: string): number[] {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim());
  const pausePoints: number[] = [];
  let currentTime = 0;

  for (const sentence of sentences) {
    const duration = sentence.length * 0.05; // 50ms por caractere
    currentTime += duration;
    pausePoints.push(currentTime);
    currentTime += 0.5; // Pausa de 0.5s entre frases
  }

  return pausePoints;
}

/**
 * Lista todos cenários de role-play disponíveis
 */
export function listRolePlayScenarios(params?: {
  difficulty?: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
}): typeof ROLEPLAY_SCENARIOS {
  if (!params?.difficulty) {
    return ROLEPLAY_SCENARIOS;
  }

  return ROLEPLAY_SCENARIOS.filter((s) => s.difficulty === params.difficulty);
}

/**
 * Gera exercício de listening comprehension com áudios nativos
 */
export async function generateListeningExercise(params: {
  topic: string;
  targetLanguage: string;
  difficulty: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
}): Promise<MentalizationExercise> {
  const prompt = `Crie um exercício de listening comprehension com áudio nativo.

**Tópico:** ${params.topic}
**Idioma:** ${params.targetLanguage}
**Nível:** ${params.difficulty}

**Formato JSON:**
{
  "exerciseId": "listen_${Date.now()}",
  "type": "listening",
  "title": "título do exercício",
  "description": "descrição",
  "duration": 5-10,
  "difficulty": "${params.difficulty}",
  "instructions": ["ouça o áudio", "responda perguntas"],
  "scenario": {
    "setting": "contexto do áudio",
    "characters": ["falante1", "falante2"],
    "situation": "situação",
    "objectives": ["compreender ideia principal", "captar detalhes"],
    "vocabulary": ["palavra1", "palavra2"],
    "phrases": ["frase-chave1", "frase-chave2"]
  },
  "successCriteria": {
    "completionTime": 300,
    "accuracyThreshold": 80,
    "requiredActions": ["ouvir áudio completo", "responder perguntas corretamente"]
  }
}

Responda APENAS com JSON válido.`;

  const response = await invokeBlackboxAI({
    messages: [
      {
        role: "system",
        content: "Você é um especialista em criação de exercícios de listening. Responda APENAS com JSON válido.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.6,
  });

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Resposta não contém JSON válido");
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("[Immersive Exercises] Failed to parse listening exercise:", response);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Falha ao gerar exercício de listening",
    });
  }
}
