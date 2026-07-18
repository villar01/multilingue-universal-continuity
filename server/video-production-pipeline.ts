/**
 * ═══════════════════════════════════════════════════════════════════
 * server/video-production-pipeline.ts
 * ADIÇÃO — Pipeline de Produção de Vídeo com IA (GRATUITO)
 * ───────────────────────────────────────────────────────────────────
 * Integra com o sistema de clips existente (server/massive-clip-generator.ts)
 * Adiciona: Qwen2.5-Max (cenas) + CapCut/Canva (montagem)
 * NÃO remove o sistema D-ID / LivePortrait existente
 * ═══════════════════════════════════════════════════════════════════
 */

import type { virtualTeachers } from "../drizzle/schema";
import type { InferSelectModel } from "drizzle-orm";

type Teacher = InferSelectModel<typeof virtualTeachers>;

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export interface VideoScene {
  sceneId: string;
  type: "teacher_intro" | "vocabulary" | "dialogue" | "ar_overlay" | "exercise" | "outro";
  durationSeconds: number;
  teacherId: number;
  teacherEmotion: "neutral" | "happy" | "thinking" | "encouraging" | "surprised";
  scriptText: string;           // fala do professor
  scriptTranslation: string;    // tradução para o aluno
  vocabulary: VocabItem[];      // palavras destacadas na cena
  arElements?: ARElement[];     // elementos de realidade aumentada
  backgroundScene: string;      // contexto visual (restaurante, casa, rua, etc.)
  capCutTemplate: string;       // template CapCut a usar
  canvaTemplate?: string;       // template Canva alternativo
}

export interface VocabItem {
  word: string;
  translation: string;
  pronunciation: string;
  timeOffset: number;           // segundos dentro da cena para highlight
}

export interface ARElement {
  type: "floating_word" | "holographic_teacher" | "subtitle_overlay" | "pronunciation_wave";
  content: string;
  position: { x: number; y: number };
  durationMs: number;
  animationType: "fade" | "bounce" | "pulse" | "slide";
}

export interface LessonVideo {
  lessonId: number;
  teacherId: number;
  languageCode: string;
  totalDurationSeconds: number;
  scenes: VideoScene[];
  capCutProjectUrl?: string;    // link do projeto CapCut gerado
  canvaProjectUrl?: string;     // link do Canva gerado
  exportStatus: "pending" | "generating" | "ready" | "error";
}

// ─── TEMPLATES CAPCUT POR TIPO DE CENA ────────────────────────────────────────
/**
 * Templates CapCut gratuitos que funcionam com avatares gerados por Qwen:
 * - Não requerem atores reais pagos
 * - Suportam sobreposição de legendas bilíngues
 * - Permitem efeitos de AR (PiP, hologram filter)
 */

export const CAPCUT_TEMPLATES = {
  // Abertura da lição com professor
  teacher_intro: {
    templateId: "education_teacher_intro_v3",
    aspectRatio: "9:16",            // vertical (mobile-first)
    duration: 15,
    filters: ["clarity", "warmth"],
    textLayers: ["title", "teacher_name", "lesson_topic"],
    transitions: "smooth_fade",
    musicTrack: "upbeat_learn_01",  // música livre de direitos
  },

  // Cena de vocabulário com palavras flutuando
  vocabulary: {
    templateId: "vocab_flashcard_modern",
    aspectRatio: "9:16",
    duration: 30,
    filters: ["vivid"],
    textLayers: ["word_target", "word_native", "pronunciation", "example_sentence"],
    transitions: "word_pop",
    animationStyle: "bounce_in",
    highlightColor: "#00B4D8",      // mesma cor do tema do app
  },

  // Diálogo professor-aluno (estilo podcast educacional)
  dialogue: {
    templateId: "dialogue_split_screen",
    aspectRatio: "9:16",
    duration: 60,
    filters: ["natural"],
    textLayers: ["speaker_name", "dialogue_text", "translation"],
    transitions: "crossfade",
    subtitleStyle: "bilingual_bottom",
  },

  // Cena com elementos de AR sobrepostos
  ar_overlay: {
    templateId: "ar_education_v2",
    aspectRatio: "9:16",
    duration: 45,
    filters: ["ar_glow", "hologram"],
    textLayers: ["ar_word", "ar_translation", "ar_pronunciation"],
    transitions: "digital_glitch",
    arEffects: ["floating_text", "scan_line", "holographic_overlay"],
    glowColor: "#00B4D8",
  },

  // Exercício interativo (quiz, preencher lacuna)
  exercise: {
    templateId: "quiz_interactive_edu",
    aspectRatio: "9:16",
    duration: 20,
    filters: ["bright"],
    textLayers: ["question", "option_a", "option_b", "option_c", "option_d"],
    transitions: "slide_up",
    correctAnimation: "confetti_burst",
    wrongAnimation: "shake_red",
  },
} as const;

// ─── TEMPLATES CANVA (alternativa ao CapCut) ──────────────────────────────────

export const CANVA_TEMPLATES = {
  vocabulary_card: "https://www.canva.com/design/template/language-vocab-card-edu",
  teacher_banner: "https://www.canva.com/design/template/teacher-intro-edu-app",
  lesson_thumbnail: "https://www.canva.com/design/template/lesson-thumb-multilanguage",
};

// ─── GERADOR DE ROTEIRO COM QWEN2.5-MAX ──────────────────────────────────────

export async function generateLessonScriptWithQwen(config: {
  teacherName: string;
  teacherNationality: string;
  targetLanguage: string;
  nativeLanguage: string;
  lessonTopic: string;
  vocabularyWords: string[];      // as 1300 palavras filtradas por tópico
  durationMinutes: number;
  cefrLevel: string;
}): Promise<VideoScene[]> {

  /**
   * PROMPT PARA QWEN2.5-MAX:
   * ─────────────────────────────────────────────────────────────────
   * Você é {teacherName}, professor(a) nativo(a) de {teacherNationality}.
   * Crie um roteiro de vídeo educacional de {durationMinutes} minutos
   * para ensinar {lessonTopic} em {targetLanguage} para falantes de {nativeLanguage}.
   *
   * FORMATO OBRIGATÓRIO JSON:
   * {
   *   scenes: [
   *     {
   *       type: "teacher_intro"|"vocabulary"|"dialogue"|"ar_overlay"|"exercise"|"outro",
   *       durationSeconds: number,
   *       scriptText: "fala do professor em {targetLanguage}",
   *       scriptTranslation: "tradução em {nativeLanguage}",
   *       vocabulary: [{word, translation, pronunciation, timeOffset}],
   *       arElements: [{type, content, position, durationMs, animationType}],
   *       backgroundScene: "restaurante|casa|rua|escola|escritório|natureza",
   *       teacherEmotion: "neutral|happy|thinking|encouraging|surprised"
   *     }
   *   ]
   * }
   *
   * REGRAS:
   * - Usar apenas as palavras do vocabulário fornecido (1300 mais usadas)
   * - Cada cena de vocabulário deve cobrir 5-10 palavras
   * - Incluir pelo menos 1 cena AR por lição
   * - Incluir pelo menos 2 exercícios interativos
   * - Tom: natural, encorajador, culturalmente autêntico para {teacherNationality}
   * - Duração total: {durationMinutes} minutos (~{durationMinutes * 150} palavras)
   * ─────────────────────────────────────────────────────────────────
   */

  // Em produção: chamar Qwen2.5-Max API via server/_core/llm.ts
  // (já configurado no app — usar a função callLLM existente)
  console.log(`[VideoGen] Gerando roteiro com Qwen2.5-Max para ${config.teacherName}...`);

  // Estrutura de retorno (Qwen preenche o conteúdo real)
  const mockScenes: VideoScene[] = [
    {
      sceneId: `${config.lessonTopic}-intro-001`,
      type: "teacher_intro",
      durationSeconds: 15,
      teacherId: 1,
      teacherEmotion: "happy",
      scriptText: `Hello! I'm ${config.teacherName}. Today we'll learn ${config.lessonTopic}!`,
      scriptTranslation: `Olá! Sou ${config.teacherName}. Hoje aprenderemos ${config.lessonTopic}!`,
      vocabulary: [],
      backgroundScene: "classroom",
      capCutTemplate: CAPCUT_TEMPLATES.teacher_intro.templateId,
    },
    {
      sceneId: `${config.lessonTopic}-vocab-001`,
      type: "vocabulary",
      durationSeconds: 30,
      teacherId: 1,
      teacherEmotion: "encouraging",
      scriptText: "Let's learn our first words!",
      scriptTranslation: "Vamos aprender nossas primeiras palavras!",
      vocabulary: config.vocabularyWords.slice(0, 5).map((w, i) => ({
        word: w,
        translation: `[tradução de ${w}]`,
        pronunciation: `/${w}/`,
        timeOffset: i * 5,
      })),
      arElements: [
        { type: "floating_word", content: config.vocabularyWords[0] || "hello",
          position: { x: 50, y: 30 }, durationMs: 3000, animationType: "bounce" },
        { type: "subtitle_overlay", content: config.vocabularyWords[0] || "hello",
          position: { x: 50, y: 80 }, durationMs: 3000, animationType: "fade" },
      ],
      backgroundScene: "home",
      capCutTemplate: CAPCUT_TEMPLATES.vocabulary.templateId,
    },
    {
      sceneId: `${config.lessonTopic}-ar-001`,
      type: "ar_overlay",
      durationSeconds: 45,
      teacherId: 1,
      teacherEmotion: "surprised",
      scriptText: "Now look around you — vocabulary is everywhere!",
      scriptTranslation: "Agora olhe ao redor — o vocabulário está em todo lugar!",
      vocabulary: config.vocabularyWords.slice(5, 15).map((w, i) => ({
        word: w,
        translation: `[tradução de ${w}]`,
        pronunciation: `/${w}/`,
        timeOffset: i * 3,
      })),
      arElements: config.vocabularyWords.slice(5, 10).map((w, i) => ({
        type: "floating_word" as const,
        content: w,
        position: { x: 20 + (i * 15), y: 30 + (i * 10) },
        durationMs: 4000,
        animationType: "pulse" as const,
      })),
      backgroundScene: "environment_camera",    // câmera ao vivo
      capCutTemplate: CAPCUT_TEMPLATES.ar_overlay.templateId,
    },
  ];

  return mockScenes;
}

// ─── INSTRUÇÕES DE EXPORTAÇÃO ─────────────────────────────────────────────────

export const EXPORT_INSTRUCTIONS = {
  /**
   * FLUXO COMPLETO GRATUITO:
   * ═══════════════════════════════════════════════════════════════
   *
   * 1. QWEN2.5-MAX — Gerar roteiro e cenas:
   *    - Input: teacherName, topic, vocabulary list (1300 words)
   *    - Output: JSON com cenas, diálogos, emoções, elementos AR
   *    - API: Usar via server/_core/llm.ts (já configurado)
   *    - Custo: GRATUITO (tier free do Qwen)
   *
   * 2. AVATAR DO PROFESSOR — Gerar imagem:
   *    - Input: prompt do professor (ver new-teachers-addition.ts)
   *    - Ferramentas GRATUITAS:
   *      a) Bing Image Creator (DALL-E grátis) — avatarPromptQwen
   *      b) Adobe Firefly (free tier) — 25 gerações/mês
   *      c) Canva AI (free tier) — para imagens de fundo
   *    - Salvar em: client/public/teachers/teacher-{nome}.webp
   *
   * 3. VOZ DO PROFESSOR — TTS:
   *    - Sistema existente: ElevenLabs + Google TTS (server/_core/tts.ts)
   *    - Alternativa gratuita: Web Speech API (navegador)
   *    - Novo: usar vozes por professor conforme voiceStyle definido
   *
   * 4. CAPCUT — Montar vídeo:
   *    a) Abrir CapCut (app ou web — grátis)
   *    b) Criar projeto 9:16 (vertical, mobile)
   *    c) Importar: avatar do professor + áudio TTS gerado
   *    d) Aplicar template: CAPCUT_TEMPLATES[scene.type]
   *    e) Adicionar texto bilíngue nas camadas de texto
   *    f) Aplicar filtros e efeitos de AR (CapCut tem efeitos holográficos)
   *    g) Exportar: 1080p H.264, sem marca d'água (conta gratuita)
   *
   * 5. CANVA (alternativa ao CapCut):
   *    a) Abrir Canva (web — grátis)
   *    b) Usar template: CANVA_TEMPLATES[tipo]
   *    c) Substituir imagens e textos com conteúdo do roteiro
   *    d) Exportar MP4 (limitado no free) ou usar PDF animado
   *
   * 6. INTEGRAR AO APP:
   *    - Upload do vídeo para: /server/uploads/clips/
   *    - Registrar no banco via: server/routers.ts (endpoint clips existente)
   *    - Associar professor, idioma, tópico, vocabulário das cenas
   *    - O player existente (AdvancedVideoPlayer.tsx) exibe automaticamente
   *
   * RESULTADO: Vídeo longo (5-20 min), profissional, com AR,
   * com voz natural, SEM pagar por atores ou figuras
   * ═══════════════════════════════════════════════════════════════
   */
  totalCost: "R$ 0,00 — 100% gratuito",
  toolsRequired: ["CapCut (free)", "Canva (free)", "Qwen2.5-Max API (free tier)", "ElevenLabs (free tier) ou Web Speech API"],
  estimatedTimePerLesson: "2-4 horas com automação parcial",
  outputQuality: "1080p, formato MP4, legendas bilíngues embutidas",
};
