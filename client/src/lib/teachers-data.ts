/**
 * MULTILINGUE UNIVERSAL — Catálogo de Professores
 * Professores reais com fotos autênticas, voz neural por idioma.
 * Qualquer aluno pode escolher qualquer professor como seu professor pessoal.
 */

export interface TeacherProfile {
  id: string;
  name: string;
  photo: string;
  voiceLang: string;   // BCP-47 para Edge TTS
  langCode: string;    // ISO 639-1
  langName: string;    // Nome do idioma em PT
  flag: string;
  nationality: string;
  personality: string;
  greeting: string;    // Saudação no idioma nativo
  greetingPt: string;  // Tradução em PT
  specialties: string[];
  gender: "male" | "female";
}

export const ALL_TEACHERS: TeacherProfile[] = [
  {
    id: "sophie",
    name: "Sophie",
    photo: "/manus-storage/teacher-portrait-sophie_6ffe702d.jpg",
    voiceLang: "fr-FR",
    langCode: "fr",
    langName: "Francês",
    flag: "🇫🇷",
    nationality: "Francesa",
    personality: "Elegante, paciente e apaixonada pela cultura francesa",
    greeting: "Bonjour! Je suis Sophie, votre professeure de français.",
    greetingPt: "Olá! Sou Sophie, sua professora de francês.",
    specialties: ["Gramática", "Cultura", "Gastronomia", "Literatura"],
    gender: "female",
  },
  {
    id: "james",
    name: "James",
    photo: "/manus-storage/teacher-portrait-james_0b43cb3d.jpg",
    voiceLang: "en-US",
    langCode: "en",
    langName: "Inglês",
    flag: "🇺🇸",
    nationality: "Americano",
    personality: "Descontraído, motivador e especialista em inglês americano",
    greeting: "Hey! I'm James, your English teacher. Let's have fun learning!",
    greetingPt: "Ei! Sou James, seu professor de inglês. Vamos aprender com diversão!",
    specialties: ["Conversação", "Negócios", "Gírias", "Pronúncia"],
    gender: "male",
  },
  {
    id: "priya",
    name: "Priya",
    photo: "/manus-storage/teacher-portrait-priya_e3768b1b.jpg",
    voiceLang: "en-GB",
    langCode: "en",
    langName: "Inglês Britânico",
    flag: "🇬🇧",
    nationality: "Britânica",
    personality: "Sofisticada, precisa e especialista no inglês britânico clássico",
    greeting: "Good day! I'm Priya, your British English teacher.",
    greetingPt: "Bom dia! Sou Priya, sua professora de inglês britânico.",
    specialties: ["Inglês Formal", "Escrita", "Vocabulário", "Cultura Britânica"],
    gender: "female",
  },
  {
    id: "hans",
    name: "Hans",
    photo: "/manus-storage/teacher-portrait-hans_f47d441a.jpg",
    voiceLang: "de-DE",
    langCode: "de",
    langName: "Alemão",
    flag: "🇩🇪",
    nationality: "Alemão",
    personality: "Metódico, preciso e apaixonado pela língua alemã",
    greeting: "Guten Tag! Ich bin Hans, Ihr Deutschlehrer.",
    greetingPt: "Bom dia! Sou Hans, seu professor de alemão.",
    specialties: ["Gramática", "Negócios", "Engenharia", "Cultura"],
    gender: "male",
  },
  {
    id: "yuki",
    name: "Yuki",
    photo: "/manus-storage/teacher-portrait-yuki_11528cd6.jpg",
    voiceLang: "ja-JP",
    langCode: "ja",
    langName: "Japonês",
    flag: "🇯🇵",
    nationality: "Japonesa",
    personality: "Gentil, detalhista e especialista na cultura japonesa",
    greeting: "こんにちは！私はゆき先生です。一緒に日本語を勉強しましょう！",
    greetingPt: "Olá! Sou a professora Yuki. Vamos estudar japonês juntos!",
    specialties: ["Hiragana", "Katakana", "Kanji", "Cultura"],
    gender: "female",
  },
  {
    id: "carlos",
    name: "Carlos",
    photo: "/manus-storage/teacher-portrait-carlos_594b15ba.jpg",
    voiceLang: "es-ES",
    langCode: "es",
    langName: "Espanhol",
    flag: "🇪🇸",
    nationality: "Espanhol",
    personality: "Animado, expressivo e especialista em espanhol ibérico",
    greeting: "¡Hola! Soy Carlos, tu profesor de español. ¡Vamos a aprender juntos!",
    greetingPt: "Olá! Sou Carlos, seu professor de espanhol. Vamos aprender juntos!",
    specialties: ["Conversação", "Gramática", "Cultura Hispânica", "Negócios"],
    gender: "male",
  },
  {
    id: "giulia",
    name: "Giulia",
    photo: "/manus-storage/teacher-portrait-giulia_9bd19177.jpg",
    voiceLang: "it-IT",
    langCode: "it",
    langName: "Italiano",
    flag: "🇮🇹",
    nationality: "Italiana",
    personality: "Apaixonada, expressiva e especialista na cultura italiana",
    greeting: "Ciao! Sono Giulia, la tua insegnante di italiano. Benvenuto!",
    greetingPt: "Olá! Sou Giulia, sua professora de italiano. Bem-vindo!",
    specialties: ["Arte", "Gastronomia", "Moda", "Música"],
    gender: "female",
  },
  {
    id: "omar",
    name: "Omar",
    photo: "/manus-storage/teacher-portrait-omar_78fd1a6b.jpg",
    voiceLang: "ar-SA",
    langCode: "ar",
    langName: "Árabe",
    flag: "🇸🇦",
    nationality: "Saudita",
    personality: "Respeitoso, culto e especialista no árabe clássico e moderno",
    greeting: "مرحباً! أنا عمر، أستاذك للغة العربية.",
    greetingPt: "Olá! Sou Omar, seu professor de árabe.",
    specialties: ["Árabe Clássico", "Árabe Moderno", "Caligrafia", "Cultura"],
    gender: "male",
  },
  {
    id: "maja",
    name: "Maja",
    photo: "/manus-storage/teacher-portrait-maja_551c6831.jpg",
    voiceLang: "pl-PL",
    langCode: "pl",
    langName: "Polonês",
    flag: "🇵🇱",
    nationality: "Polonesa",
    personality: "Determinada, criativa e especialista em línguas eslavas",
    greeting: "Cześć! Jestem Maja, twoja nauczycielka języka polskiego.",
    greetingPt: "Olá! Sou Maja, sua professora de polonês.",
    specialties: ["Gramática", "Literatura", "Cultura", "Negócios"],
    gender: "female",
  },
  {
    id: "emre",
    name: "Emre",
    photo: "/manus-storage/teacher-portrait-emre_cb7b002a.jpg",
    voiceLang: "tr-TR",
    langCode: "tr",
    langName: "Turco",
    flag: "🇹🇷",
    nationality: "Turco",
    personality: "Caloroso, hospitaleiro e especialista na língua turca",
    greeting: "Merhaba! Ben Emre, Türkçe öğretmeninizim.",
    greetingPt: "Olá! Sou Emre, seu professor de turco.",
    specialties: ["Conversação", "Cultura", "História", "Negócios"],
    gender: "male",
  },
  {
    id: "ivan",
    name: "Ivan",
    photo: "/manus-storage/teacher-portrait-verified-b_ee829f75.jpg",
    voiceLang: "ru-RU",
    langCode: "ru",
    langName: "Russo",
    flag: "🇷🇺",
    nationality: "Russo",
    personality: "Sério, profundo e especialista na língua e literatura russas",
    greeting: "Здравствуйте! Я Иван, ваш учитель русского языка.",
    greetingPt: "Olá! Sou Ivan, seu professor de russo.",
    specialties: ["Gramática", "Literatura", "Ciências", "Cultura"],
    gender: "male",
  },
];

export const TEACHER_MAP: Record<string, TeacherProfile> = Object.fromEntries(
  ALL_TEACHERS.map(t => [t.id, t])
);

export const DEFAULT_TEACHER_ID = "james";

export function getTeacherById(id: string): TeacherProfile {
  return TEACHER_MAP[id] ?? TEACHER_MAP[DEFAULT_TEACHER_ID];
}

export function getStoredTeacherId(): string {
  try {
    return localStorage.getItem("ml_preferred_teacher") ?? DEFAULT_TEACHER_ID;
  } catch {
    return DEFAULT_TEACHER_ID;
  }
}

export function storeTeacherId(id: string): void {
  try {
    localStorage.setItem("ml_preferred_teacher", id);
  } catch {
    // ignore
  }
}
