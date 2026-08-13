/**
 * ImmersiveLesson — Aula Imersiva com Professor Real
 * Mix do melhor do Teacher Poli + Mondly:
 * - Professor foto real ao lado esquerdo com lip-sync AudioContext
 * - Texto rolante typewriter sincronizado com voz Edge TTS neural
 * - Exercícios gamificados com XP em tempo real
 * - Conversação livre com IA
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft, Volume2, Mic, MicOff, CheckCircle, XCircle,
  Star, Zap, BookOpen, MessageSquare, Trophy, RotateCcw
} from "lucide-react";
import { getStoredTeacherId, getTeacherById, type TeacherProfile } from "@/lib/teachers-data";

// ── Lesson content ─────────────────────────────────────────────────────────────
interface LessonLine {
  text: string;
  translation: string;
  phonetic?: string;
}

interface Exercise {
  type: "multiple_choice" | "fill_blank" | "translation";
  question: string;
  options?: string[];
  correct: string;
  xp: number;
}

interface LessonData {
  title: string;
  subtitle: string;
  lines: LessonLine[];
  exercises: Exercise[];
}

const SAMPLE_LESSONS: Record<string, LessonData> = {
  en: {
    title: "Greetings & Introductions",
    subtitle: "Saudações e Apresentações",
    lines: [
      { text: "Hello! My name is James.", translation: "Olá! Meu nome é James.", phonetic: "HEH-loh! My NAYM iz Jaymz." },
      { text: "Nice to meet you.", translation: "Prazer em conhecê-lo.", phonetic: "NAYS too MEET yoo." },
      { text: "How are you today?", translation: "Como você está hoje?", phonetic: "HAW ar yoo tuh-DAY?" },
      { text: "I am doing very well, thank you!", translation: "Estou muito bem, obrigado!", phonetic: "Ay am DOO-ing VEH-ree WEL, THANK yoo!" },
      { text: "Where are you from?", translation: "De onde você é?", phonetic: "WAIR ar yoo FROM?" },
      { text: "I am from Brazil.", translation: "Sou do Brasil.", phonetic: "Ay am from bruh-ZIL." },
      { text: "It is wonderful to meet you!", translation: "É maravilhoso conhecê-lo!", phonetic: "It iz WUN-der-ful too MEET yoo!" },
    ],
    exercises: [
      { type: "multiple_choice", question: "Como se diz 'Olá' em inglês?", options: ["Hello", "Goodbye", "Thank you", "Please"], correct: "Hello", xp: 10 },
      { type: "multiple_choice", question: "O que significa 'Nice to meet you'?", options: ["Até logo", "Prazer em conhecê-lo", "Como vai?", "Obrigado"], correct: "Prazer em conhecê-lo", xp: 10 },
      { type: "fill_blank", question: "How ___ you today?", correct: "are", xp: 15 },
      { type: "translation", question: "Traduza: 'Sou do Brasil'", correct: "I am from Brazil", xp: 20 },
      { type: "multiple_choice", question: "Como se pergunta 'De onde você é?'", options: ["How are you?", "What is your name?", "Where are you from?", "How old are you?"], correct: "Where are you from?", xp: 10 },
    ],
  },
  fr: {
    title: "Bonjour et Présentations",
    subtitle: "Olá e Apresentações em Francês",
    lines: [
      { text: "Bonjour! Je m'appelle Sophie.", translation: "Olá! Meu nome é Sophie.", phonetic: "bohn-ZHOOR! Zhuh mah-PEL Sophie." },
      { text: "Enchanté de vous rencontrer.", translation: "Prazer em conhecê-lo.", phonetic: "ahn-shahn-TAY duh voo rahn-kohn-TRAY." },
      { text: "Comment allez-vous aujourd'hui?", translation: "Como vai você hoje?", phonetic: "koh-MAHN ah-lay-VOO oh-zhoor-DWEE?" },
      { text: "Je vais très bien, merci!", translation: "Estou muito bem, obrigado!", phonetic: "Zhuh vay TREH byahn, mehr-SEE!" },
      { text: "D'où venez-vous?", translation: "De onde você vem?", phonetic: "DOO vuh-nay-VOO?" },
    ],
    exercises: [
      { type: "multiple_choice", question: "Como se diz 'Olá' em francês?", options: ["Bonjour", "Au revoir", "Merci", "S'il vous plaît"], correct: "Bonjour", xp: 10 },
      { type: "multiple_choice", question: "O que significa 'Merci'?", options: ["Por favor", "Desculpe", "Obrigado", "De nada"], correct: "Obrigado", xp: 10 },
      { type: "fill_blank", question: "Comment ___-vous?", correct: "allez", xp: 15 },
    ],
  },
  es: {
    title: "Saludos e Introducciones",
    subtitle: "Saudações e Apresentações em Espanhol",
    lines: [
      { text: "¡Hola! Me llamo Carlos.", translation: "Olá! Meu nome é Carlos.", phonetic: "OH-lah! Meh YAH-moh Carlos." },
      { text: "Mucho gusto en conocerte.", translation: "Muito prazer em conhecê-lo.", phonetic: "MOO-choh GOOS-toh en koh-noh-SEHR-teh." },
      { text: "¿Cómo estás hoy?", translation: "Como você está hoje?", phonetic: "KOH-moh es-TAHS oy?" },
      { text: "¡Estoy muy bien, gracias!", translation: "Estou muito bem, obrigado!", phonetic: "es-TOY mooy BYEHN, GRAH-syahs!" },
      { text: "¿De dónde eres?", translation: "De onde você é?", phonetic: "deh DOHN-deh EH-rehs?" },
    ],
    exercises: [
      { type: "multiple_choice", question: "Como se diz 'Olá' em espanhol?", options: ["Hola", "Adiós", "Gracias", "Por favor"], correct: "Hola", xp: 10 },
      { type: "multiple_choice", question: "O que significa 'Gracias'?", options: ["Por favor", "Desculpe", "Obrigado", "De nada"], correct: "Obrigado", xp: 10 },
      { type: "fill_blank", question: "¿Cómo ___ hoy?", correct: "estás", xp: 15 },
    ],
  },
  de: {
    title: "Begrüßungen und Vorstellungen",
    subtitle: "Saudações e Apresentações em Alemão",
    lines: [
      { text: "Hallo! Ich heiße Hans.", translation: "Olá! Meu nome é Hans.", phonetic: "HA-loh! Ikh HY-seh Hans." },
      { text: "Schön, Sie kennenzulernen.", translation: "Prazer em conhecê-lo.", phonetic: "SHERN, zee KEN-en-tsoo-LEHR-nen." },
      { text: "Wie geht es Ihnen heute?", translation: "Como vai você hoje?", phonetic: "VEE gayt es EE-nen HOY-teh?" },
      { text: "Mir geht es sehr gut, danke!", translation: "Estou muito bem, obrigado!", phonetic: "Meer gayt es ZAYR goot, DAHN-keh!" },
      { text: "Woher kommen Sie?", translation: "De onde você vem?", phonetic: "VOH-hair KOM-men zee?" },
      { text: "Ich komme aus Brasilien.", translation: "Venho do Brasil.", phonetic: "Ikh KOM-meh ows bra-ZEE-lyen." },
    ],
    exercises: [
      { type: "multiple_choice", question: "Como se diz 'Olá' em alemão?", options: ["Hallo", "Tschüss", "Danke", "Bitte"], correct: "Hallo", xp: 10 },
      { type: "multiple_choice", question: "O que significa 'Danke'?", options: ["Por favor", "Desculpe", "Obrigado", "De nada"], correct: "Obrigado", xp: 10 },
      { type: "fill_blank", question: "Wie ___ es Ihnen?", correct: "geht", xp: 15 },
      { type: "translation", question: "Traduza: 'Venho do Brasil'", correct: "Ich komme aus Brasilien", xp: 20 },
    ],
  },
  ja: {
    title: "あいさつと自己紹介",
    subtitle: "Saudações e Apresentações em Japonês",
    lines: [
      { text: "こんにちは！私はゆきです。", translation: "Olá! Meu nome é Yuki.", phonetic: "Kon-ni-chi-wa! Wa-ta-shi wa Yu-ki de-su." },
      { text: "はじめまして。", translation: "Prazer em conhecê-lo.", phonetic: "Ha-ji-me-ma-shi-te." },
      { text: "お元気ですか？", translation: "Como vai você?", phonetic: "O-gen-ki de-su ka?" },
      { text: "はい、元気です。ありがとう！", translation: "Sim, estou bem. Obrigado!", phonetic: "Hai, gen-ki de-su. A-ri-ga-tou!" },
      { text: "どこから来ましたか？", translation: "De onde você veio?", phonetic: "Do-ko ka-ra ki-ma-shi-ta ka?" },
      { text: "ブラジルから来ました。", translation: "Vim do Brasil.", phonetic: "Bu-ra-ji-ru ka-ra ki-ma-shi-ta." },
    ],
    exercises: [
      { type: "multiple_choice", question: "Como se diz 'Olá' em japonês?", options: ["こんにちは", "さようなら", "ありがとう", "すみません"], correct: "こんにちは", xp: 10 },
      { type: "multiple_choice", question: "O que significa 'ありがとう'?", options: ["Por favor", "Desculpe", "Obrigado", "De nada"], correct: "Obrigado", xp: 10 },
      { type: "fill_blank", question: "お_____ですか？ (Como vai você?)", correct: "元気", xp: 15 },
    ],
  },
  zh: {
    title: "问候与自我介绍",
    subtitle: "Saudações e Apresentações em Mandarim",
    lines: [
      { text: "你好！我叫晓晓。", translation: "Olá! Meu nome é Xiaoxiao.", phonetic: "Nǐ hǎo! Wǒ jiào Xiǎoxiāo." },
      { text: "很高兴认识你。", translation: "Prazer em conhecê-lo.", phonetic: "Hěn gāoxìng rènshi nǐ." },
      { text: "你今天好吗？", translation: "Como vai você hoje?", phonetic: "Nǐ jīntiān hǎo ma?" },
      { text: "我很好，谢谢！", translation: "Estou muito bem, obrigado!", phonetic: "Wǒ hěn hǎo, xièxiè!" },
      { text: "你从哪里来？", translation: "De onde você vem?", phonetic: "Nǐ cóng nǎlǐ lái?" },
      { text: "我来自巴西。", translation: "Venho do Brasil.", phonetic: "Wǒ láizì Bāxī." },
    ],
    exercises: [
      { type: "multiple_choice", question: "Como se diz 'Olá' em mandarim?", options: ["你好", "再见", "谢谢", "对不起"], correct: "你好", xp: 10 },
      { type: "multiple_choice", question: "O que significa '谢谢'?", options: ["Por favor", "Desculpe", "Obrigado", "De nada"], correct: "Obrigado", xp: 10 },
      { type: "fill_blank", question: "我很___，谢谢！", correct: "好", xp: 15 },
    ],
  },
  it: {
    title: "Saluti e Presentazioni",
    subtitle: "Saudações e Apresentações em Italiano",
    lines: [
      { text: "Ciao! Mi chiamo Giulia.", translation: "Olá! Meu nome é Giulia.", phonetic: "CHOW! Mee KYAH-moh JOO-lyah." },
      { text: "Piacere di conoscerti.", translation: "Prazer em conhecê-lo.", phonetic: "pyah-CHEH-reh dee koh-NOH-shehr-tee." },
      { text: "Come stai oggi?", translation: "Como vai você hoje?", phonetic: "KOH-meh STAH-ee OH-jee?" },
      { text: "Sto molto bene, grazie!", translation: "Estou muito bem, obrigado!", phonetic: "STOH MOL-toh BEH-neh, GRAH-tsyeh!" },
      { text: "Di dove sei?", translation: "De onde você é?", phonetic: "dee DOH-veh SAY?" },
      { text: "Sono del Brasile.", translation: "Sou do Brasil.", phonetic: "SOH-noh del bra-ZEE-leh." },
    ],
    exercises: [
      { type: "multiple_choice", question: "Como se diz 'Olá' em italiano?", options: ["Ciao", "Arrivederci", "Grazie", "Prego"], correct: "Ciao", xp: 10 },
      { type: "multiple_choice", question: "O que significa 'Grazie'?", options: ["Por favor", "Desculpe", "Obrigado", "De nada"], correct: "Obrigado", xp: 10 },
      { type: "fill_blank", question: "Come ___ oggi?", correct: "stai", xp: 15 },
    ],
  },
  ko: {
    title: "인사와 자기소개",
    subtitle: "Saudações e Apresentações em Coreano",
    lines: [
      { text: "안녕하세요! 저는 지수입니다.", translation: "Olá! Meu nome é Jisoo.", phonetic: "An-nyeong-ha-se-yo! Jeo-neun Ji-su-im-ni-da." },
      { text: "만나서 반갑습니다.", translation: "Prazer em conhecê-lo.", phonetic: "Man-na-seo ban-gap-seum-ni-da." },
      { text: "오늘 어떻게 지내세요?", translation: "Como vai você hoje?", phonetic: "O-neul eo-tteo-ke ji-nae-se-yo?" },
      { text: "잘 지내고 있어요, 감사합니다!", translation: "Estou bem, obrigado!", phonetic: "Jal ji-nae-go i-sseo-yo, gam-sa-ham-ni-da!" },
      { text: "어디서 오셨어요?", translation: "De onde você vem?", phonetic: "Eo-di-seo o-syeo-sseo-yo?" },
    ],
    exercises: [
      { type: "multiple_choice", question: "Como se diz 'Olá' em coreano?", options: ["안녕하세요", "안녕히 가세요", "감사합니다", "죄송합니다"], correct: "안녕하세요", xp: 10 },
      { type: "multiple_choice", question: "O que significa '감사합니다'?", options: ["Por favor", "Desculpe", "Obrigado", "De nada"], correct: "Obrigado", xp: 10 },
      { type: "fill_blank", question: "만나서 ___습니다.", correct: "반갑", xp: 15 },
    ],
  },
  ru: {
    title: "Приветствия и знакомство",
    subtitle: "Saudações e Apresentações em Russo",
    lines: [
      { text: "Привет! Меня зовут Дарья.", translation: "Olá! Meu nome é Daria.", phonetic: "Pri-VYET! Mye-NYA za-VOOT DAR-ya." },
      { text: "Приятно познакомиться.", translation: "Prazer em conhecê-lo.", phonetic: "Pri-YAT-na paz-na-KO-mi-tsa." },
      { text: "Как вы сегодня?", translation: "Como vai você hoje?", phonetic: "Kak vy se-VOD-nya?" },
      { text: "Я очень хорошо, спасибо!", translation: "Estou muito bem, obrigado!", phonetic: "Ya O-chen kha-ra-SHO, spa-SI-ba!" },
      { text: "Откуда вы?", translation: "De onde você é?", phonetic: "At-KOO-da vy?" },
    ],
    exercises: [
      { type: "multiple_choice", question: "Como se diz 'Olá' em russo?", options: ["Привет", "До свидания", "Спасибо", "Пожалуйста"], correct: "Привет", xp: 10 },
      { type: "multiple_choice", question: "O que significa 'Спасибо'?", options: ["Por favor", "Desculpe", "Obrigado", "De nada"], correct: "Obrigado", xp: 10 },
      { type: "fill_blank", question: "Как вы ___?", correct: "сегодня", xp: 15 },
    ],
  },
  ar: {
    title: "التحيات والتعريف بالنفس",
    subtitle: "Saudações e Apresentações em Árabe",
    lines: [
      { text: "مرحبا! اسمي أحمد.", translation: "Olá! Meu nome é Ahmed.", phonetic: "Mar-ha-ban! Is-mi Ah-mad." },
      { text: "يسعدني لقاؤك.", translation: "Prazer em conhecê-lo.", phonetic: "Yas-ud-ni li-qa-u-ka." },
      { text: "كيف حالك اليوم؟", translation: "Como vai você hoje?", phonetic: "Kay-fa ha-lu-ka al-yawm?" },
      { text: "أنا بخير، شكراً!", translation: "Estou bem, obrigado!", phonetic: "A-na bi-khayr, shuk-ran!" },
      { text: "من أين أنت؟", translation: "De onde você é?", phonetic: "Min ay-na an-ta?" },
    ],
    exercises: [
      { type: "multiple_choice", question: "Como se diz 'Olá' em árabe?", options: ["مرحبا", "مع السلامة", "شكراً", "من فضلك"], correct: "مرحبا", xp: 10 },
      { type: "multiple_choice", question: "O que significa 'شكراً'?", options: ["Por favor", "Desculpe", "Obrigado", "De nada"], correct: "Obrigado", xp: 10 },
      { type: "fill_blank", question: "كيف ___ اليوم؟", correct: "حالك", xp: 15 },
    ],
  },
  hi: {
    title: "अभिवादन और परिचय",
    subtitle: "Saudações e Apresentações em Hindi",
    lines: [
      { text: "नमस्ते! मेरा नाम प्रिया है।", translation: "Olá! Meu nome é Priya.", phonetic: "Na-mas-te! Me-ra naam Pri-ya hai." },
      { text: "आपसे मिलकर खुशी हुई।", translation: "Prazer em conhecê-lo.", phonetic: "Aap-se mil-kar khu-shi hu-i." },
      { text: "आप आज कैसे हैं?", translation: "Como vai você hoje?", phonetic: "Aap aaj kai-se hain?" },
      { text: "मैं बहुत अच्छा हूँ, धन्यवाद!", translation: "Estou muito bem, obrigado!", phonetic: "Main ba-hut ach-cha hun, dhan-ya-vad!" },
      { text: "आप कहाँ से हैं?", translation: "De onde você é?", phonetic: "Aap ka-han se hain?" },
    ],
    exercises: [
      { type: "multiple_choice", question: "Como se diz 'Olá' em hindi?", options: ["नमस्ते", "अलविदा", "धन्यवाद", "कृपया"], correct: "नमस्ते", xp: 10 },
      { type: "multiple_choice", question: "O que significa 'धन्यवाद'?", options: ["Por favor", "Desculpe", "Obrigado", "De nada"], correct: "Obrigado", xp: 10 },
      { type: "fill_blank", question: "आप आज कैसे ___?", correct: "हैं", xp: 15 },
    ],
  },
  nl: {
    title: "Begroetingen en Introducties",
    subtitle: "Saudações e Apresentações em Holandês",
    lines: [
      { text: "Hallo! Mijn naam is Emma.", translation: "Olá! Meu nome é Emma.", phonetic: "HA-loh! Mayn naam is EM-ah." },
      { text: "Aangenaam kennis te maken.", translation: "Prazer em conhecê-lo.", phonetic: "AHN-ge-naam KEN-is te MAH-ken." },
      { text: "Hoe gaat het vandaag met u?", translation: "Como vai você hoje?", phonetic: "HOO gaht het van-DAAG met uu?" },
      { text: "Ik ga heel goed, dank u!", translation: "Estou muito bem, obrigado!", phonetic: "Ik gah HAYL goot, dank uu!" },
    ],
    exercises: [
      { type: "multiple_choice", question: "Como se diz 'Olá' em holandês?", options: ["Hallo", "Tot ziens", "Dank u", "Alstublieft"], correct: "Hallo", xp: 10 },
      { type: "fill_blank", question: "Hoe ___ het vandaag?", correct: "gaat", xp: 15 },
    ],
  },
  sv: {
    title: "Hälsningar och Presentationer",
    subtitle: "Saudações e Apresentações em Sueco",
    lines: [
      { text: "Hej! Jag heter Astrid.", translation: "Olá! Meu nome é Astrid.", phonetic: "HEY! Yag HEE-ter AS-trid." },
      { text: "Trevligt att träffas.", translation: "Prazer em conhecê-lo.", phonetic: "TREV-ligt at TREF-as." },
      { text: "Hur mår du idag?", translation: "Como vai você hoje?", phonetic: "HOOR mor doo ee-DAG?" },
      { text: "Jag mår mycket bra, tack!", translation: "Estou muito bem, obrigado!", phonetic: "Yag mor MYK-et bra, tak!" },
    ],
    exercises: [
      { type: "multiple_choice", question: "Como se diz 'Olá' em sueco?", options: ["Hej", "Hejdå", "Tack", "Snälla"], correct: "Hej", xp: 10 },
      { type: "fill_blank", question: "Hur ___ du idag?", correct: "mår", xp: 15 },
    ],
  },
  tr: {
    title: "Selamlaşma ve Tanışma",
    subtitle: "Saudações e Apresentações em Turco",
    lines: [
      { text: "Merhaba! Benim adım Ayşe.", translation: "Olá! Meu nome é Ayşe.", phonetic: "Mer-HA-ba! Be-nim a-DIM Ay-sheh." },
      { text: "Tanıştığımıza memnun oldum.", translation: "Prazer em conhecê-lo.", phonetic: "Ta-nish-TI-gi-mi-za mem-NUN ol-dum." },
      { text: "Bugün nasılsınız?", translation: "Como vai você hoje?", phonetic: "Bu-GUN na-SIL-si-niz?" },
      { text: "Çok iyiyim, teşekkür ederim!", translation: "Estou muito bem, obrigado!", phonetic: "Chok i-YI-yim, te-shek-KUR e-de-rim!" },
    ],
    exercises: [
      { type: "multiple_choice", question: "Como se diz 'Olá' em turco?", options: ["Merhaba", "Güle güle", "Teşekkür", "Lütfen"], correct: "Merhaba", xp: 10 },
      { type: "fill_blank", question: "Bugün ___sınız?", correct: "nasıl", xp: 15 },
    ],
  },
  pl: {
    title: "Pozdrowienia i Przedstawianie się",
    subtitle: "Saudações e Apresentações em Polonês",
    lines: [
      { text: "Cześć! Mam na imię Zofia.", translation: "Olá! Meu nome é Zofia.", phonetic: "Cheshch! Mam na IM-ye ZO-fya." },
      { text: "Miło mi cię poznać.", translation: "Prazer em conhecê-lo.", phonetic: "MEE-wo mee che POZ-nach." },
      { text: "Jak się dziś masz?", translation: "Como vai você hoje?", phonetic: "Yak she jish MASH?" },
      { text: "Mam się bardzo dobrze, dziękuję!", translation: "Estou muito bem, obrigado!", phonetic: "Mam she BAR-dzo DOB-zhe, jyen-KOO-ye!" },
    ],
    exercises: [
      { type: "multiple_choice", question: "Como se diz 'Olá' em polonês?", options: ["Cześć", "Do widzenia", "Dziękuję", "Proszę"], correct: "Cześć", xp: 10 },
      { type: "fill_blank", question: "Jak się dziś ___?", correct: "masz", xp: 15 },
    ],
  },
};

function getLessonForTeacher(teacher: TeacherProfile): LessonData {
  return SAMPLE_LESSONS[teacher.langCode] ?? SAMPLE_LESSONS["en"];
}

// ── Lip-sync hook ──────────────────────────────────────────────────────────────
function useLipSync() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number>(0);
  const [mouthOpen, setMouthOpen] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = useCallback((base64: string) => {
    if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
    const ctx = audioCtxRef.current;
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    ctx.decodeAudioData(bytes.buffer, (decoded) => {
      const source = ctx.createBufferSource();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.buffer = decoded;
      source.connect(analyser);
      analyser.connect(ctx.destination);
      setIsSpeaking(true);
      source.start();
      source.onended = () => {
        setIsSpeaking(false);
        setMouthOpen(0);
        cancelAnimationFrame(animFrameRef.current);
      };
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        const avg = data.slice(0, 8).reduce((a, b) => a + b, 0) / 8;
        setMouthOpen(Math.min(1, avg / 70));
        animFrameRef.current = requestAnimationFrame(tick);
      };
      tick();
    });
  }, []);

  return { mouthOpen, isSpeaking, speak };
}

// ── Teacher Avatar ─────────────────────────────────────────────────────────────
function TeacherAvatar({
  teacher,
  isSpeaking,
  mouthOpen,
  currentLine,
}: {
  teacher: TeacherProfile;
  isSpeaking: boolean;
  mouthOpen: number;
  currentLine: LessonLine | null;
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      {/* Foto do professor com indicador de reprodução de áudio */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          width: 200,
          height: 260,
          border: isSpeaking ? "3px solid #6366f1" : "2px solid rgba(255,255,255,0.1)",
          boxShadow: isSpeaking ? "0 0 30px rgba(99,102,241,0.5)" : "none",
          transition: "box-shadow 0.3s ease",
        }}
      >
        <img
          src={teacher.photo}
          alt={teacher.name}
          className="w-full h-full object-cover object-top"
          style={{
            filter: isSpeaking ? "brightness(1.05)" : "brightness(0.95)",
            transition: "filter 0.2s ease",
          }}
        />

        {/* Indicador de áudio — a foto estática não finge movimento facial */}
        {isSpeaking && (
          <div
            className="absolute bottom-2 left-0 right-0 mx-auto flex w-fit items-end gap-1 rounded-md px-2 py-1"
            style={{ background: "rgba(15,12,41,0.74)" }}
            aria-label="Áudio neural em reprodução"
          >
            <span className="mr-1 text-[10px] font-semibold text-white">Voz neural</span>
            {[0.6, 1, 0.8, 1, 0.7, 0.9, 0.5].map((h, i) => (
              <div
                key={i}
                style={{
                  width: 3,
                  height: `${6 + mouthOpen * 20 * h}px`,
                  background: "#6366f1",
                  borderRadius: 2,
                  transition: "height 0.05s ease-out",
                }}
              />
            ))}
          </div>
        )}

        {/* Flag */}
        <div
          className="absolute top-2 right-2 text-lg"
          style={{
            background: "rgba(0,0,0,0.6)",
            borderRadius: "50%",
            width: 30,
            height: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {teacher.flag}
        </div>
      </div>

      {/* Name */}
      <div className="text-center">
        <p className="text-white font-bold text-sm">{teacher.name}</p>
        <p className="text-purple-300 text-xs">{teacher.langName}</p>
      </div>

      {/* Current line translation */}
      {currentLine && (
        <div
          className="rounded-xl p-2 text-center max-w-[200px]"
          style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)" }}
        >
          <p className="text-gray-300 text-xs leading-relaxed">{currentLine.translation}</p>
          {currentLine.phonetic && (
            <p className="text-purple-400 text-xs mt-1 italic">{currentLine.phonetic}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Typewriter text ────────────────────────────────────────────────────────────
function TypewriterText({ text, speed = 40 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        setDone(true);
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <span>
      {displayed}
      {!done && <span className="animate-pulse text-purple-400">|</span>}
    </span>
  );
}

// ── Exercise component ─────────────────────────────────────────────────────────
function ExercisePanel({
  exercise,
  onAnswer,
  answered,
  wasCorrect,
}: {
  exercise: Exercise;
  onAnswer: (answer: string) => void;
  answered: boolean;
  wasCorrect: boolean;
}) {
  const [input, setInput] = useState("");

  if (exercise.type === "multiple_choice") {
    return (
      <div>
        <p className="text-white font-semibold mb-3 text-base">{exercise.question}</p>
        <div className="grid grid-cols-2 gap-2">
          {exercise.options?.map((opt) => {
            let bg = "rgba(255,255,255,0.06)";
            let border = "rgba(255,255,255,0.12)";
            if (answered) {
              if (opt === exercise.correct) { bg = "rgba(34,197,94,0.2)"; border = "#22c55e"; }
              else if (opt !== exercise.correct && wasCorrect === false) { bg = "rgba(239,68,68,0.15)"; }
            }
            return (
              <button
                key={opt}
                disabled={answered}
                onClick={() => onAnswer(opt)}
                className="text-left p-3 rounded-xl text-sm text-white transition-all duration-150"
                style={{ background: bg, border: `1.5px solid ${border}`, cursor: answered ? "default" : "pointer" }}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (exercise.type === "fill_blank" || exercise.type === "translation") {
    return (
      <div>
        <p className="text-white font-semibold mb-3 text-base">{exercise.question}</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && input.trim()) onAnswer(input.trim()); }}
            disabled={answered}
            placeholder="Digite sua resposta..."
            className="flex-1 px-3 py-2 rounded-xl text-white text-sm outline-none"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: answered
                ? wasCorrect ? "1.5px solid #22c55e" : "1.5px solid #ef4444"
                : "1.5px solid rgba(255,255,255,0.15)",
            }}
          />
          {!answered && (
            <Button
              onClick={() => { if (input.trim()) onAnswer(input.trim()); }}
              size="sm"
              className="bg-purple-600 text-white"
            >
              OK
            </Button>
          )}
        </div>
        {answered && (
          <p className="text-xs mt-2" style={{ color: wasCorrect ? "#22c55e" : "#ef4444" }}>
            {wasCorrect ? "✓ Correto!" : `✗ Resposta: ${exercise.correct}`}
          </p>
        )}
      </div>
    );
  }

  return null;
}

// ── Main page ──────────────────────────────────────────────────────────────────
type Phase = "lesson" | "exercises" | "complete";

export default function ImmersiveLesson() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();

  const teacher = getTeacherById(getStoredTeacherId());
  const lesson = getLessonForTeacher(teacher);

  const [phase, setPhase] = useState<Phase>("lesson");
  const [lineIdx, setLineIdx] = useState(0);
  const [exerciseIdx, setExerciseIdx] = useState(0);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [wasCorrect, setWasCorrect] = useState(false);
  const [xpFlash, setXpFlash] = useState<number | null>(null);

  const { mouthOpen, isSpeaking, speak } = useLipSync();
  const speakMutation = trpc.tts.speak.useMutation({
    onSuccess: (data) => {
      if (data.success && data.audioBase64) speak(data.audioBase64);
    },
  });

  const currentLine = phase === "lesson" ? lesson.lines[lineIdx] ?? null : null;
  const currentExercise = phase === "exercises" ? lesson.exercises[exerciseIdx] ?? null : null;
  const progress = phase === "lesson"
    ? ((lineIdx) / lesson.lines.length) * 50
    : phase === "exercises"
    ? 50 + ((exerciseIdx) / lesson.exercises.length) * 50
    : 100;

  const speakLine = useCallback((line: LessonLine) => {
    speakMutation.mutate({ text: line.text, voiceLang: teacher.voiceLang });
  }, [teacher.voiceLang]);

  // Auto-speak when line changes
  useEffect(() => {
    if (phase === "lesson" && currentLine) {
      const t = setTimeout(() => speakLine(currentLine), 400);
      return () => clearTimeout(t);
    }
  }, [lineIdx, phase]);

  const handleNextLine = () => {
    if (lineIdx < lesson.lines.length - 1) {
      setLineIdx(i => i + 1);
    } else {
      setPhase("exercises");
      setExerciseIdx(0);
    }
  };

  const handleAnswer = (answer: string) => {
    if (!currentExercise || answered) return;
    const correct = answer.toLowerCase().trim() === currentExercise.correct.toLowerCase().trim();
    setAnswered(true);
    setWasCorrect(correct);

    if (correct) {
      const earned = currentExercise.xp + (streak >= 2 ? 5 : 0);
      setXp(x => x + earned);
      setStreak(s => s + 1);
      setXpFlash(earned);
      setTimeout(() => setXpFlash(null), 1500);
      speakMutation.mutate({ text: "Excellent! That is correct!", voiceLang: teacher.voiceLang });
    } else {
      setStreak(0);
      speakMutation.mutate({ text: "Not quite. Let me explain.", voiceLang: teacher.voiceLang });
    }

    setTimeout(() => {
      setAnswered(false);
      setWasCorrect(false);
      if (exerciseIdx < lesson.exercises.length - 1) {
        setExerciseIdx(i => i + 1);
      } else {
        setPhase("complete");
      }
    }, 2000);
  };

  const handleRestart = () => {
    setPhase("lesson");
    setLineIdx(0);
    setExerciseIdx(0);
    setXp(0);
    setStreak(0);
    setAnswered(false);
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)" }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-20 px-4 py-3"
        style={{
          background: "rgba(15,12,41,0.95)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => setLocation("/dashboard")}
              className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Sair</span>
            </button>
            <div className="text-center">
              <p className="text-white font-bold text-sm">{lesson.title}</p>
              <p className="text-gray-400 text-xs">{lesson.subtitle}</p>
            </div>
            {/* XP display */}
            <div className="flex items-center gap-2">
              {streak >= 2 && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: "rgba(251,146,60,0.2)" }}>
                  <Zap className="w-3 h-3 text-orange-400" />
                  <span className="text-orange-300 text-xs font-bold">{streak}x</span>
                </div>
              )}
              <div
                className="flex items-center gap-1 px-3 py-1 rounded-full relative"
                style={{ background: "rgba(99,102,241,0.25)", border: "1px solid rgba(99,102,241,0.4)" }}
              >
                <Star className="w-3 h-3 text-yellow-400" />
                <span className="text-white text-sm font-bold">{xp}</span>
                {xpFlash && (
                  <span
                    className="absolute -top-5 left-1/2 text-green-400 text-xs font-bold animate-bounce"
                    style={{ transform: "translateX(-50%)" }}
                  >
                    +{xpFlash}
                  </span>
                )}
              </div>
            </div>
          </div>
          {/* Progress bar */}
          <Progress value={progress} className="h-1.5" style={{ background: "rgba(255,255,255,0.1)" }} />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* LESSON PHASE */}
        {phase === "lesson" && currentLine && (
          <div className="flex gap-6 items-start">
            {/* Teacher */}
            <div className="flex-shrink-0 hidden sm:block">
              <TeacherAvatar
                teacher={teacher}
                isSpeaking={isSpeaking}
                mouthOpen={mouthOpen}
                currentLine={currentLine}
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Progress indicator */}
              <p className="text-gray-500 text-xs mb-3">
                Frase {lineIdx + 1} de {lesson.lines.length}
              </p>

              {/* Main text */}
              <div
                className="rounded-2xl p-5 mb-4"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <p className="text-white text-2xl font-bold leading-relaxed mb-3">
                  <TypewriterText text={currentLine.text} speed={50} />
                </p>
                <p className="text-gray-300 text-base">{currentLine.translation}</p>
                {currentLine.phonetic && (
                  <p className="text-purple-400 text-sm mt-2 italic">🔊 {currentLine.phonetic}</p>
                )}
              </div>

              {/* Mobile teacher */}
              <div className="sm:hidden mb-4 flex justify-center">
                <TeacherAvatar
                  teacher={teacher}
                  isSpeaking={isSpeaking}
                  mouthOpen={mouthOpen}
                  currentLine={null}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={() => speakLine(currentLine)}
                  disabled={speakMutation.isPending}
                  variant="outline"
                  className="flex items-center gap-2 border-purple-500/40 text-purple-300 hover:bg-purple-600/20"
                >
                  <Volume2 className="w-4 h-4" />
                  Ouvir
                </Button>
                <Button
                  onClick={handleNextLine}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold"
                >
                  {lineIdx < lesson.lines.length - 1 ? "Próxima frase →" : "Iniciar exercícios →"}
                </Button>
              </div>

              {/* All lines list */}
              <div className="mt-5 space-y-2">
                {lesson.lines.map((line, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 p-2 rounded-lg text-sm cursor-pointer transition-colors"
                    style={{
                      background: i === lineIdx ? "rgba(99,102,241,0.15)" : "transparent",
                      opacity: i > lineIdx ? 0.4 : 1,
                    }}
                    onClick={() => { setLineIdx(i); speakLine(line); }}
                  >
                    <span className="text-purple-400 font-mono text-xs mt-0.5 flex-shrink-0">{i + 1}.</span>
                    <div>
                      <p className="text-white">{line.text}</p>
                      <p className="text-gray-400 text-xs">{line.translation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* EXERCISES PHASE */}
        {phase === "exercises" && currentExercise && (
          <div className="flex gap-6 items-start">
            {/* Teacher */}
            <div className="flex-shrink-0 hidden sm:block">
              <TeacherAvatar
                teacher={teacher}
                isSpeaking={isSpeaking}
                mouthOpen={mouthOpen}
                currentLine={null}
              />
            </div>

            {/* Exercise */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-4 h-4 text-purple-400" />
                <p className="text-gray-400 text-sm">
                  Exercício {exerciseIdx + 1} de {lesson.exercises.length}
                </p>
                {streak >= 2 && (
                  <span className="text-orange-400 text-xs font-bold">🔥 Sequência {streak}x!</span>
                )}
              </div>

              <div
                className="rounded-2xl p-5 mb-4"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <ExercisePanel
                  exercise={currentExercise}
                  onAnswer={handleAnswer}
                  answered={answered}
                  wasCorrect={wasCorrect}
                />

                {answered && (
                  <div
                    className="mt-3 flex items-center gap-2 p-2 rounded-lg"
                    style={{
                      background: wasCorrect ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                    }}
                  >
                    {wasCorrect
                      ? <CheckCircle className="w-4 h-4 text-green-400" />
                      : <XCircle className="w-4 h-4 text-red-400" />
                    }
                    <p className="text-sm" style={{ color: wasCorrect ? "#4ade80" : "#f87171" }}>
                      {wasCorrect
                        ? `+${currentExercise.xp + (streak >= 2 ? 5 : 0)} XP${streak >= 2 ? " (bônus sequência!)" : ""}`
                        : `Resposta correta: ${currentExercise.correct}`
                      }
                    </p>
                  </div>
                )}
              </div>

              {/* XP progress */}
              <div
                className="rounded-xl p-3 flex items-center gap-3"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <Star className="w-5 h-5 text-yellow-400" />
                <div className="flex-1">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>XP acumulado</span>
                    <span>{xp} / {lesson.exercises.reduce((a, e) => a + e.xp, 0)} XP</span>
                  </div>
                  <Progress
                    value={(xp / lesson.exercises.reduce((a, e) => a + e.xp, 0)) * 100}
                    className="h-2"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* COMPLETE PHASE */}
        {phase === "complete" && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-white text-3xl font-bold mb-2">Parabéns!</h2>
            <p className="text-gray-300 text-lg mb-6">
              Você completou a aula com {teacher.name}!
            </p>

            <div className="flex justify-center gap-6 mb-8">
              <div className="text-center">
                <p className="text-yellow-400 text-3xl font-bold">{xp}</p>
                <p className="text-gray-400 text-sm">XP ganho</p>
              </div>
              <div className="text-center">
                <p className="text-purple-400 text-3xl font-bold">{lesson.lines.length}</p>
                <p className="text-gray-400 text-sm">Frases</p>
              </div>
              <div className="text-center">
                <p className="text-green-400 text-3xl font-bold">{lesson.exercises.length}</p>
                <p className="text-gray-400 text-sm">Exercícios</p>
              </div>
            </div>

            <div className="flex justify-center gap-3 flex-wrap">
              <Button
                onClick={handleRestart}
                variant="outline"
                className="flex items-center gap-2 border-purple-500/40 text-purple-300"
              >
                <RotateCcw className="w-4 h-4" />
                Repetir aula
              </Button>
              <Button
                onClick={() => setLocation("/my-teacher")}
                variant="outline"
                className="flex items-center gap-2 border-purple-500/40 text-purple-300"
              >
                Trocar professor
              </Button>
              <Button
                onClick={() => setLocation("/immersive-scene")}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
              >
                Cenas Imersivas →
              </Button>
            </div>

            {!isAuthenticated && (
              <div
                className="mt-8 p-4 rounded-2xl max-w-md mx-auto"
                style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)" }}
              >
                <p className="text-white font-semibold mb-2">Salve seu progresso!</p>
                <p className="text-gray-300 text-sm mb-3">
                  Faça login para salvar seus {xp} XP e continuar de onde parou.
                </p>
                <Button
                  onClick={() => setLocation("/login")}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white w-full"
                >
                  Criar conta grátis
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
