/**
 * Sample 30-minute educational clips data
 * Original content - no plagiarism from any app
 */

export interface ClipSegment {
  startTime: number;
  endTime: number;
  text: string;
  translation: string;
  phonemes: string[];
}

export interface EducationalClipData {
  id: string;
  title: string;
  description: string;
  teacherId: string;
  teacherName: string;
  teacherPhotoUrl: string;
  teacherVoiceId: string;
  duration: number; // 1800 seconds = 30 minutes
  segments: ClipSegment[];
  languageCode: string;
  level: string;
  theme: string;
}

// Sample 30-minute clip: "A Família" (The Family)
export const familyClip30Min: EducationalClipData = {
  id: "clip_family_30min",
  title: "A Família - Lição Completa (30 minutos)",
  description: "Aprenda vocabulário completo sobre família com professor fotorrealista e animação labial sincronizada",
  teacherId: "teacher_ricardo",
  teacherName: "Professor Ricardo",
  teacherPhotoUrl: "https://cdn.manus.space/multilingue/teachers/ricardo.jpg",
  teacherVoiceId: "pt-BR-male-1",
  duration: 1800, // 30 minutes
  languageCode: "en",
  level: "beginner",
  theme: "family",
  segments: [
    // Introdução (0-60s)
    {
      startTime: 0,
      endTime: 10,
      text: "Hello! Welcome to our complete family lesson.",
      translation: "Olá! Bem-vindo à nossa lição completa sobre família.",
      phonemes: ["h", "e", "neutral", "o", "u", "e", "neutral", "m", "neutral", "t", "u", "neutral", "r", "neutral", "m", "p", "neutral", "i", "t", "neutral", "f", "a", "m", "neutral", "i", "neutral", "i", "neutral", "e", "neutral", "neutral"],
    },
    {
      startTime: 10,
      endTime: 20,
      text: "Today we will learn all about family members.",
      translation: "Hoje aprenderemos tudo sobre membros da família.",
      phonemes: ["t", "u", "neutral", "e", "i", "neutral", "i", "neutral", "u", "r", "neutral", "o", "neutral", "a", "b", "a", "u", "t", "neutral", "f", "a", "m", "neutral", "i", "neutral", "i", "neutral", "m", "e", "m", "b", "neutral", "r", "neutral"],
    },
    {
      startTime: 20,
      endTime: 35,
      text: "We'll practice pronunciation, see examples, and learn how to use these words in real conversations.",
      translation: "Praticaremos pronúncia, veremos exemplos e aprenderemos a usar essas palavras em conversas reais.",
      phonemes: ["u", "i", "neutral", "p", "r", "a", "neutral", "t", "neutral", "s", "neutral", "p", "r", "u", "neutral", "n", "neutral", "s", "i", "neutral", "e", "i", "neutral", "neutral", "neutral", "n", "neutral", "s", "i", "neutral", "e", "neutral", "z", "a", "m", "p", "neutral", "neutral", "z", "neutral", "a", "n", "neutral", "neutral", "r", "neutral", "h", "a", "u", "neutral", "t", "u", "neutral", "u", "z", "neutral", "i", "z", "neutral", "u", "r", "neutral", "z", "neutral", "neutral", "n", "neutral", "r", "i", "neutral", "neutral", "neutral", "k", "neutral", "n", "v", "neutral", "r", "s", "e", "i", "neutral", "neutral", "neutral", "n", "z"],
    },
    
    // Parte 1: Família Imediata (35-420s = ~6.5 minutos)
    {
      startTime: 35,
      endTime: 50,
      text: "Let's start with immediate family. First word: Mother.",
      translation: "Vamos começar com a família imediata. Primeira palavra: Mãe.",
      phonemes: ["neutral", "e", "t", "s", "neutral", "s", "t", "a", "r", "t", "neutral", "u", "neutral", "neutral", "neutral", "m", "i", "neutral", "d", "i", "neutral", "neutral", "t", "neutral", "f", "a", "m", "neutral", "i", "neutral", "i", "neutral", "f", "neutral", "r", "s", "t", "neutral", "u", "r", "neutral", "m", "u", "neutral", "neutral", "r"],
    },
    {
      startTime: 50,
      endTime: 65,
      text: "Mother. M-O-T-H-E-R. Mother. Listen again: Mother.",
      translation: "Mãe. M-Ã-E. Mãe. Ouça novamente: Mãe.",
      phonemes: ["m", "u", "neutral", "neutral", "r", "neutral", "m", "neutral", "o", "neutral", "t", "neutral", "h", "neutral", "e", "neutral", "r", "neutral", "m", "u", "neutral", "neutral", "r", "neutral", "neutral", "neutral", "s", "neutral", "n", "neutral", "a", "neutral", "e", "i", "n", "neutral", "m", "u", "neutral", "neutral", "r"],
    },
    {
      startTime: 65,
      endTime: 85,
      text: "My mother is kind. My mother cooks delicious food. I love my mother.",
      translation: "Minha mãe é gentil. Minha mãe cozinha comida deliciosa. Eu amo minha mãe.",
      phonemes: ["m", "a", "i", "neutral", "m", "u", "neutral", "neutral", "r", "neutral", "neutral", "z", "neutral", "k", "a", "i", "n", "d", "neutral", "m", "a", "i", "neutral", "m", "u", "neutral", "neutral", "r", "neutral", "k", "u", "k", "s", "neutral", "d", "neutral", "neutral", "neutral", "neutral", "s", "neutral", "f", "u", "d", "neutral", "a", "i", "neutral", "neutral", "u", "v", "neutral", "m", "a", "i", "neutral", "m", "u", "neutral", "neutral", "r"],
    },
    
    // Continue com mais segmentos até completar 35 minutos (2100 segundos)
    // Adicionando mais vocabulário: father, brother, sister, grandmother, grandfather, etc.
    
    {
      startTime: 85,
      endTime: 100,
      text: "Now let's learn: Father. F-A-T-H-E-R. Father.",
      translation: "Agora vamos aprender: Pai. P-A-I. Pai.",
      phonemes: ["n", "a", "u", "neutral", "neutral", "e", "t", "s", "neutral", "neutral", "r", "n", "neutral", "f", "a", "neutral", "neutral", "r", "neutral", "f", "neutral", "e", "i", "neutral", "t", "neutral", "h", "neutral", "e", "neutral", "r", "neutral", "f", "a", "neutral", "neutral", "r"],
    },
    {
      startTime: 100,
      endTime: 120,
      text: "My father works hard. My father is strong. I respect my father.",
      translation: "Meu pai trabalha duro. Meu pai é forte. Eu respeito meu pai.",
      phonemes: ["m", "a", "i", "neutral", "f", "a", "neutral", "neutral", "r", "neutral", "u", "r", "k", "s", "neutral", "h", "a", "r", "d", "neutral", "m", "a", "i", "neutral", "f", "a", "neutral", "neutral", "r", "neutral", "neutral", "z", "neutral", "s", "t", "r", "o", "neutral", "neutral", "a", "i", "neutral", "r", "neutral", "s", "p", "e", "k", "t", "neutral", "m", "a", "i", "neutral", "f", "a", "neutral", "neutral", "r"],
    },
    
    // Adicionar mais 30+ minutos de conteúdo educacional original
    // Incluindo: brother, sister, grandmother, grandfather, aunt, uncle, cousin
    // Com exemplos, pronúncia, frases práticas, diálogos, exercícios
    
    // Conclusão (2040-2100s = último minuto)
    {
      startTime: 2040,
      endTime: 2060,
      text: "Congratulations! You've completed the 35-minute family lesson.",
      translation: "Parabéns! Você completou a lição de 35 minutos sobre família.",
      phonemes: ["k", "neutral", "n", "neutral", "r", "a", "t", "neutral", "u", "neutral", "e", "i", "neutral", "neutral", "neutral", "n", "z", "neutral", "u", "v", "neutral", "k", "neutral", "m", "p", "neutral", "i", "t", "neutral", "d", "neutral", "neutral", "neutral", "neutral", "neutral", "r", "t", "i", "neutral", "f", "a", "i", "v", "neutral", "m", "neutral", "n", "neutral", "t", "neutral", "f", "a", "m", "neutral", "i", "neutral", "i", "neutral", "neutral", "e", "s", "neutral", "n"],
    },
    {
      startTime: 2060,
      endTime: 2080,
      text: "You learned many family words and how to use them in real conversations.",
      translation: "Você aprendeu muitas palavras sobre família e como usá-las em conversas reais.",
      phonemes: ["u", "neutral", "neutral", "r", "n", "d", "neutral", "m", "e", "n", "i", "neutral", "f", "a", "m", "neutral", "i", "neutral", "i", "neutral", "u", "r", "d", "z", "neutral", "a", "n", "neutral", "h", "a", "u", "neutral", "t", "u", "neutral", "u", "z", "neutral", "neutral", "e", "m", "neutral", "neutral", "n", "neutral", "r", "i", "neutral", "neutral", "neutral", "k", "neutral", "n", "v", "neutral", "r", "s", "e", "i", "neutral", "neutral", "neutral", "n", "z"],
    },
    {
      startTime: 2080,
      endTime: 2100,
      text: "Keep practicing! See you in the next lesson!",
      translation: "Continue praticando! Vejo você na próxima lição!",
      phonemes: ["k", "i", "p", "neutral", "p", "r", "a", "neutral", "t", "neutral", "s", "neutral", "neutral", "neutral", "s", "i", "neutral", "u", "neutral", "neutral", "n", "neutral", "neutral", "neutral", "n", "e", "k", "s", "t", "neutral", "neutral", "e", "s", "neutral", "n"],
    },
  ],
};

// Export all clips
export const sampleClips: EducationalClipData[] = [
  familyClip30Min,
  // Add more 35-minute clips here
];
