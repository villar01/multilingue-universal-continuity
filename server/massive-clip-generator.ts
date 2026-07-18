/**
 * Gerador Massivo de Clipes Educacionais com Blackbox AI
 * Cria 100+ clipes curtos (30-90s) com legendas bilíngues clicáveis
 */

import { invokeBlackboxAI } from "./blackbox-ai";
import { TRPCError } from "@trpc/server";

interface ClipGenerationRequest {
  lessonId: number;
  lessonTitle: string;
  topic: string;
  targetLanguage: string;
  nativeLanguage: string;
  difficulty: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  duration: "short" | "medium" | "long"; // 30s, 60s, 90s
}

interface GeneratedClip {
  clipId: string;
  title: string;
  duration: number; // segundos
  script: {
    targetLanguage: string;
    nativeLanguage: string;
  };
  subtitles: SubtitleSegment[];
  vocabulary: VocabularyItem[];
  teacherInstructions: string;
}

interface SubtitleSegment {
  start: number;
  end: number;
  textTarget: string;
  textNative: string;
  words: WordTimestamp[];
}

interface WordTimestamp {
  word: string;
  start: number;
  end: number;
  isClickable: boolean;
  translation?: string;
  phonetic?: string;
}

interface VocabularyItem {
  word: string;
  translation: string;
  phonetic: string;
  example: string;
  partOfSpeech: string;
}

/**
 * Tópicos populares para clipes educacionais
 */
const CLIP_TOPICS = {
  daily: [
    "Apresentações e cumprimentos",
    "Pedindo direções na rua",
    "Fazendo compras no supermercado",
    "Pedindo comida no restaurante",
    "Conversando sobre o clima",
    "Falando sobre hobbies",
    "Marcando um encontro",
    "Falando ao telefone",
    "No médico",
    "No banco",
  ],
  travel: [
    "No aeroporto - check-in",
    "No hotel - fazendo reserva",
    "Alugando um carro",
    "Pedindo informações turísticas",
    "Em um táxi",
    "Comprando passagens de trem",
    "No restaurante - pedindo recomendações",
    "Fazendo compras de souvenirs",
    "Emergência - perdido na cidade",
    "Conversando com locais",
  ],
  business: [
    "Apresentação profissional",
    "Reunião de negócios",
    "Negociando contratos",
    "Enviando e-mails formais",
    "Entrevista de emprego",
    "Apresentando projeto",
    "Teleconferência",
    "Networking em evento",
    "Lidando com reclamações",
    "Fechando vendas",
  ],
  academic: [
    "Apresentando trabalho acadêmico",
    "Discussão em grupo",
    "Pedindo ajuda ao professor",
    "Na biblioteca",
    "Estudando em grupo",
    "Fazendo anotações em aula",
    "Preparando para exames",
    "Debate acadêmico",
    "Pesquisa científica",
    "Defesa de tese",
  ],
};

/**
 * Gera um clipe educacional completo com Blackbox AI
 */
export async function generateEducationalClip(
  request: ClipGenerationRequest
): Promise<GeneratedClip> {
  const durationSeconds = request.duration === "short" ? 30 : request.duration === "medium" ? 60 : 90;

  const prompt = `Você é um especialista em criação de conteúdo educacional para aprendizado de idiomas. Crie um clipe educacional curto e envolvente.

**Especificações:**
- Lição: ${request.lessonTitle}
- Tópico: ${request.topic}
- Idioma alvo: ${request.targetLanguage}
- Idioma nativo: ${request.nativeLanguage}
- Nível: ${request.difficulty}
- Duração: ${durationSeconds} segundos
- Palavras por segundo: ~2.5 (total: ${Math.round(durationSeconds * 2.5)} palavras)

**Requisitos:**
1. Diálogo natural e autêntico entre 2 pessoas
2. Situação realista e prática
3. Vocabulário apropriado para nível ${request.difficulty}
4. Gramática contextualizada
5. Expressões idiomáticas úteis
6. Pronúncia clara e pausas naturais

**Formato de Saída (JSON):**
{
  "title": "título curto e descritivo",
  "duration": ${durationSeconds},
  "script": {
    "targetLanguage": "diálogo completo no idioma alvo",
    "nativeLanguage": "tradução do diálogo"
  },
  "subtitles": [
    {
      "start": 0.0,
      "end": 3.5,
      "textTarget": "frase no idioma alvo",
      "textNative": "tradução da frase",
      "words": [
        {
          "word": "palavra",
          "start": 0.0,
          "end": 0.5,
          "isClickable": true,
          "translation": "tradução",
          "phonetic": "IPA"
        }
      ]
    }
  ],
  "vocabulary": [
    {
      "word": "palavra-chave",
      "translation": "tradução",
      "phonetic": "IPA",
      "example": "exemplo de uso",
      "partOfSpeech": "noun/verb/adj"
    }
  ],
  "teacherInstructions": "instruções para o professor virtual sobre como apresentar este clipe"
}

Crie um clipe educacional completo e envolvente. Responda APENAS com JSON válido.`;

  const response = await invokeBlackboxAI({
    messages: [
      {
        role: "system",
        content:
          "Você é um criador de conteúdo educacional especializado em aprendizado de idiomas. Crie diálogos autênticos, naturais e pedagogicamente eficazes. Responda APENAS com JSON válido.",
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

    const clipData = JSON.parse(jsonMatch[0]);

    return {
      clipId: `clip_${request.lessonId}_${Date.now()}`,
      title: clipData.title,
      duration: clipData.duration,
      script: clipData.script,
      subtitles: clipData.subtitles,
      vocabulary: clipData.vocabulary,
      teacherInstructions: clipData.teacherInstructions,
    };
  } catch (error) {
    console.error("[Massive Clip Generator] Failed to parse AI response:", response);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Falha ao gerar clipe educacional",
    });
  }
}

/**
 * Gera batch de clipes para uma lição
 */
export async function generateClipBatch(params: {
  lessonId: number;
  lessonTitle: string;
  topic: string;
  targetLanguage: string;
  nativeLanguage: string;
  difficulty: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  count: number;
}): Promise<GeneratedClip[]> {
  const clips: GeneratedClip[] = [];
  const durations: Array<"short" | "medium" | "long"> = ["short", "medium", "long"];

  for (let i = 0; i < params.count; i++) {
    const duration = durations[i % durations.length];

    try {
      const clip = await generateEducationalClip({
        lessonId: params.lessonId,
        lessonTitle: params.lessonTitle,
        topic: params.topic,
        targetLanguage: params.targetLanguage,
        nativeLanguage: params.nativeLanguage,
        difficulty: params.difficulty,
        duration,
      });

      clips.push(clip);
      console.log(`[Massive Clip Generator] Generated clip ${i + 1}/${params.count}: ${clip.title}`);

      // Delay para evitar rate limiting
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`[Massive Clip Generator] Failed to generate clip ${i + 1}:`, error);
      // Continuar gerando outros clipes mesmo se um falhar
    }
  }

  return clips;
}

/**
 * Gera 100+ clipes cobrindo todos os tópicos populares
 */
export async function generateMassiveClipLibrary(params: {
  targetLanguage: string;
  nativeLanguage: string;
  difficulty: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
}): Promise<{
  totalClips: number;
  clipsByCategory: Record<string, GeneratedClip[]>;
  estimatedTotalDuration: number;
}> {
  const clipsByCategory: Record<string, GeneratedClip[]> = {};
  let totalDuration = 0;

  // Gerar clipes para cada categoria
  for (const [category, topics] of Object.entries(CLIP_TOPICS)) {
    console.log(`[Massive Clip Generator] Generating clips for category: ${category}`);
    clipsByCategory[category] = [];

    for (const topic of topics) {
      try {
        // Gerar 1 clipe por tópico (pode aumentar para 2-3 se necessário)
        const clip = await generateEducationalClip({
          lessonId: 0, // ID genérico para biblioteca
          lessonTitle: topic,
          topic,
          targetLanguage: params.targetLanguage,
          nativeLanguage: params.nativeLanguage,
          difficulty: params.difficulty,
          duration: "medium", // 60s por padrão
        });

        clipsByCategory[category].push(clip);
        totalDuration += clip.duration;

        console.log(`[Massive Clip Generator] Generated: ${clip.title} (${clip.duration}s)`);

        // Delay para evitar rate limiting
        await new Promise((resolve) => setTimeout(resolve, 3000));
      } catch (error) {
        console.error(`[Massive Clip Generator] Failed for topic "${topic}":`, error);
      }
    }
  }

  const totalClips = Object.values(clipsByCategory).reduce((sum, clips) => sum + clips.length, 0);

  return {
    totalClips,
    clipsByCategory,
    estimatedTotalDuration: totalDuration,
  };
}

/**
 * Salva clipes gerados no banco de dados
 */
export async function saveClipsToDatabase(
  clips: GeneratedClip[],
  database: any
): Promise<{ saved: number; failed: number }> {
  let saved = 0;
  let failed = 0;

  for (const clip of clips) {
    try {
      // Inserir clipe na tabela video_clips
      await database.query(
        `INSERT INTO video_clips (
          clip_id, title, duration, script_target, script_native,
          subtitles_json, vocabulary_json, teacher_instructions,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          clip.clipId,
          clip.title,
          clip.duration,
          clip.script.targetLanguage,
          clip.script.nativeLanguage,
          JSON.stringify(clip.subtitles),
          JSON.stringify(clip.vocabulary),
          clip.teacherInstructions,
        ]
      );

      saved++;
    } catch (error) {
      console.error(`[Massive Clip Generator] Failed to save clip ${clip.clipId}:`, error);
      failed++;
    }
  }

  return { saved, failed };
}
