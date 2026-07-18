import { invokeLLM } from "./_core/llm";

export interface VideoClip {
  lessonId: number;
  title: string;
  duration: number; // segundos
  scriptPT: string;
  scriptEN: string;
  subtitles: SubtitleSegment[];
  vocabulary: string[]; // palavras-chave clicáveis
}

export interface SubtitleSegment {
  start: number; // segundos
  end: number;
  textPT: string;
  textEN: string;
  words: WordTimestamp[];
}

export interface WordTimestamp {
  word: string;
  start: number;
  end: number;
  isClickable: boolean; // true se palavra está no vocabulário da lição
}

/**
 * Gerar roteiro de vídeo educacional com IA
 */
export async function generateVideoScript(
  lessonTitle: string,
  lessonStory: string,
  vocabulary: string[]
): Promise<{ scriptPT: string; scriptEN: string }> {
  const prompt = `Você é um roteirista de vídeos educacionais estilo Teacher Poli.

LIÇÃO: ${lessonTitle}
HISTÓRIA: ${lessonStory}
VOCABULÁRIO: ${vocabulary.join(", ")}

Crie um roteiro de vídeo educacional de 2-3 minutos que:
1. Apresente o tema da lição de forma envolvente
2. Conte a história usando as palavras do vocabulário
3. Explique o significado de cada palavra-chave
4. Use linguagem simples e natural
5. Inclua pausas dramáticas para ênfase

FORMATO DE SAÍDA (JSON):
{
  "scriptPT": "Roteiro completo em português brasileiro...",
  "scriptEN": "Complete script in English..."
}

Gere APENAS o JSON, sem texto adicional.`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: "Você é um roteirista profissional de vídeos educacionais." },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "video_script",
        strict: true,
        schema: {
          type: "object",
          properties: {
            scriptPT: { type: "string", description: "Roteiro completo em português" },
            scriptEN: { type: "string", description: "Complete script in English" },
          },
          required: ["scriptPT", "scriptEN"],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices[0].message.content;
  if (!content || typeof content !== 'string') {
    throw new Error("IA não retornou roteiro");
  }

  return JSON.parse(content);
}

/**
 * Gerar legendas bilíngues sincronizadas
 */
export function generateSubtitles(
  scriptPT: string,
  scriptEN: string,
  duration: number,
  vocabulary: string[]
): SubtitleSegment[] {
  // Dividir scripts em sentenças
  const sentencesPT = scriptPT.match(/[^.!?]+[.!?]+/g) || [scriptPT];
  const sentencesEN = scriptEN.match(/[^.!?]+[.!?]+/g) || [scriptEN];

  const segmentDuration = duration / sentencesPT.length;
  const subtitles: SubtitleSegment[] = [];

  for (let i = 0; i < sentencesPT.length; i++) {
    const start = i * segmentDuration;
    const end = (i + 1) * segmentDuration;

    const textPT = sentencesPT[i].trim();
    const textEN = sentencesEN[i]?.trim() || "";

    // Extrair palavras com timestamps
    const wordsPT = textPT.split(/\s+/);
    const wordDuration = segmentDuration / wordsPT.length;
    const words: WordTimestamp[] = wordsPT.map((word, idx) => {
      const cleanWord = word.replace(/[.,!?;:]/g, "").toLowerCase();
      return {
        word,
        start: start + idx * wordDuration,
        end: start + (idx + 1) * wordDuration,
        isClickable: vocabulary.some((v) => v.toLowerCase() === cleanWord),
      };
    });

    subtitles.push({
      start,
      end,
      textPT,
      textEN,
      words,
    });
  }

  return subtitles;
}

/**
 * Gerar clipe completo para uma lição
 */
export async function generateVideoClip(
  lessonId: number,
  lessonTitle: string,
  lessonStory: string,
  vocabulary: string[]
): Promise<VideoClip> {
  // Gerar roteiro com IA
  const { scriptPT, scriptEN } = await generateVideoScript(lessonTitle, lessonStory, vocabulary);

  // Estimar duração (150 palavras/minuto)
  const wordCount = scriptPT.split(/\s+/).length;
  const duration = (wordCount / 150) * 60; // segundos

  // Gerar legendas sincronizadas
  const subtitles = generateSubtitles(scriptPT, scriptEN, duration, vocabulary);

  return {
    lessonId,
    title: `${lessonTitle} - Vídeo Educacional`,
    duration,
    scriptPT,
    scriptEN,
    subtitles,
    vocabulary,
  };
}
