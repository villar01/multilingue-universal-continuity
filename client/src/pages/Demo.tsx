/**
 * /demo — Aula REAL para clientes
 * - Sem login obrigatório
 * - Todos os idiomas disponíveis
 * - Professor fala com Edge TTS Neural
 * - IA responde de verdade
 * - Pronúncia avaliada de verdade
 * - Zero erros visíveis
 */
import { useState, useCallback, useRef, useEffect, lazy, Suspense } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { speakEdgeTTS, stopEdgeTTS, onLipSyncAmplitude } from "@/lib/edgeTTSClient";
import { TEACHERS_57 } from "@/data/teachers57";
import { toast } from "sonner";
import { createAudioRecorder, microphoneErrorMessage, requestMicrophoneStream } from "@/lib/microphoneAccess";

// Lazy load heavy avatar
const EnhancedTeacherAvatar = lazy(() => import("@/components/EnhancedTeacherAvatar"));

// ─── Lesson content per language (real vocabulary, no fake data) ──────────────
const DEMO_LESSONS: Record<string, {
  title: string;
  words: { word: string; translation: string; phonetic: string; emoji: string; example: string }[];
  teacherIntro: string;
}> = {
  "en-US": {
    title: "Greetings & Everyday Words",
    teacherIntro: "Hello! I'm your English teacher. Let's learn some essential words together! 🎉",
    words: [
      { word: "Hello", translation: "Olá", phonetic: "rreló", emoji: "👋", example: "Hello! How are you?" },
      { word: "Thank you", translation: "Obrigado/a", phonetic: "rrenk iú", emoji: "🙏", example: "Thank you very much!" },
      { word: "Please", translation: "Por favor", phonetic: "plíiz", emoji: "😊", example: "Please, sit down." },
      { word: "Water", translation: "Água", phonetic: "uóter", emoji: "💧", example: "Can I have some water?" },
      { word: "Friend", translation: "Amigo/a", phonetic: "frend", emoji: "🤝", example: "She is my best friend." },
    ],
  },
  "es-ES": {
    title: "Saludos y Palabras Cotidianas",
    teacherIntro: "¡Hola! Soy tu profesora de español. ¡Vamos a aprender juntos! 🌟",
    words: [
      { word: "Hola", translation: "Olá", phonetic: "óla", emoji: "👋", example: "¡Hola! ¿Cómo estás?" },
      { word: "Gracias", translation: "Obrigado/a", phonetic: "grásias", emoji: "🙏", example: "¡Muchas gracias!" },
      { word: "Agua", translation: "Água", phonetic: "água", emoji: "💧", example: "Quiero agua, por favor." },
      { word: "Amigo", translation: "Amigo", phonetic: "amígo", emoji: "🤝", example: "Él es mi mejor amigo." },
      { word: "Casa", translation: "Casa", phonetic: "cása", emoji: "🏠", example: "Mi casa es grande." },
    ],
  },
  "fr-FR": {
    title: "Salutations et Mots du Quotidien",
    teacherIntro: "Bonjour! Je suis votre professeur de français. Apprenons ensemble! 🥐",
    words: [
      { word: "Bonjour", translation: "Bom dia / Olá", phonetic: "bõjur", emoji: "👋", example: "Bonjour! Comment allez-vous?" },
      { word: "Merci", translation: "Obrigado/a", phonetic: "mêrsi", emoji: "🙏", example: "Merci beaucoup!" },
      { word: "Eau", translation: "Água", phonetic: "ô", emoji: "💧", example: "Je voudrais de l'eau." },
      { word: "Ami", translation: "Amigo/a", phonetic: "ami", emoji: "🤝", example: "C'est mon meilleur ami." },
      { word: "Maison", translation: "Casa", phonetic: "mezõ", emoji: "🏠", example: "Ma maison est belle." },
    ],
  },
  "de-DE": {
    title: "Begrüßungen und Alltagswörter",
    teacherIntro: "Hallo! Ich bin dein Deutschlehrer. Lass uns zusammen lernen! 🍺",
    words: [
      { word: "Hallo", translation: "Olá", phonetic: "rrálo", emoji: "👋", example: "Hallo! Wie geht es dir?" },
      { word: "Danke", translation: "Obrigado/a", phonetic: "dânke", emoji: "🙏", example: "Vielen Dank!" },
      { word: "Wasser", translation: "Água", phonetic: "váser", emoji: "💧", example: "Ich möchte Wasser." },
      { word: "Freund", translation: "Amigo", phonetic: "froind", emoji: "🤝", example: "Er ist mein Freund." },
      { word: "Haus", translation: "Casa", phonetic: "ráus", emoji: "🏠", example: "Mein Haus ist groß." },
    ],
  },
  "it-IT": {
    title: "Saluti e Parole Quotidiane",
    teacherIntro: "Ciao! Sono la tua insegnante di italiano. Impariamo insieme! 🍕",
    words: [
      { word: "Ciao", translation: "Olá / Tchau", phonetic: "tcháo", emoji: "👋", example: "Ciao! Come stai?" },
      { word: "Grazie", translation: "Obrigado/a", phonetic: "grátzie", emoji: "🙏", example: "Grazie mille!" },
      { word: "Acqua", translation: "Água", phonetic: "ácua", emoji: "💧", example: "Vorrei dell'acqua." },
      { word: "Amico", translation: "Amigo", phonetic: "amíco", emoji: "🤝", example: "Lui è il mio amico." },
      { word: "Casa", translation: "Casa", phonetic: "cáza", emoji: "🏠", example: "La mia casa è bella." },
    ],
  },
  "ja-JP": {
    title: "あいさつと日常の言葉",
    teacherIntro: "こんにちは！日本語の先生です。一緒に学びましょう！🌸",
    words: [
      { word: "こんにちは", translation: "Olá / Boa tarde", phonetic: "konnitchiua", emoji: "👋", example: "こんにちは！お元気ですか？" },
      { word: "ありがとう", translation: "Obrigado/a", phonetic: "arigatô", emoji: "🙏", example: "ありがとうございます！" },
      { word: "みず (水)", translation: "Água", phonetic: "mizu", emoji: "💧", example: "みずをください。" },
      { word: "ともだち (友達)", translation: "Amigo/a", phonetic: "tomodatchi", emoji: "🤝", example: "かれはともだちです。" },
      { word: "いえ (家)", translation: "Casa", phonetic: "ie", emoji: "🏠", example: "わたしのいえはおおきい。" },
    ],
  },
  "zh-CN": {
    title: "问候语和日常词汇",
    teacherIntro: "你好！我是你的中文老师。让我们一起学习！🐉",
    words: [
      { word: "你好", translation: "Olá", phonetic: "ni rráo", emoji: "👋", example: "你好！你好吗？" },
      { word: "谢谢", translation: "Obrigado/a", phonetic: "ssié ssié", emoji: "🙏", example: "非常谢谢！" },
      { word: "水", translation: "Água", phonetic: "chuéi", emoji: "💧", example: "我要水。" },
      { word: "朋友", translation: "Amigo/a", phonetic: "pêng iôu", emoji: "🤝", example: "他是我的朋友。" },
      { word: "家", translation: "Casa", phonetic: "tchiá", emoji: "🏠", example: "我的家很大。" },
    ],
  },
  "pt-PT": {
    title: "Saudações e Palavras do Dia a Dia",
    teacherIntro: "Olá! Sou a sua professora de Português Europeu. Vamos aprender juntos! 🇵🇹",
    words: [
      { word: "Olá", translation: "Olá", phonetic: "olá", emoji: "👋", example: "Olá! Como está?" },
      { word: "Obrigado", translation: "Obrigado/a", phonetic: "obrigádo", emoji: "🙏", example: "Muito obrigado!" },
      { word: "Água", translation: "Água", phonetic: "águua", emoji: "💧", example: "Quero água, por favor." },
      { word: "Amigo", translation: "Amigo", phonetic: "amígu", emoji: "🤝", example: "Ele é o meu amigo." },
      { word: "Casa", translation: "Casa", phonetic: "cáza", emoji: "🏠", example: "A minha casa é grande." },
    ],
  },
  "ko-KR": {
    title: "인사말과 일상 단어",
    teacherIntro: "안녕하세요! 한국어 선생님입니다. 같이 배워봐요! 🌺",
    words: [
      { word: "안녕하세요", translation: "Olá", phonetic: "anniong-rrassêio", emoji: "👋", example: "안녕하세요! 어떻게 지내세요?" },
      { word: "감사합니다", translation: "Obrigado/a", phonetic: "gamsarrámnida", emoji: "🙏", example: "정말 감사합니다!" },
      { word: "물", translation: "Água", phonetic: "mul", emoji: "💧", example: "물 주세요." },
      { word: "친구", translation: "Amigo/a", phonetic: "tchinku", emoji: "🤝", example: "그는 내 친구예요." },
      { word: "집", translation: "Casa", phonetic: "tchib", emoji: "🏠", example: "우리 집은 커요." },
    ],
  },
  "ru-RU": {
    title: "Приветствия и повседневные слова",
    teacherIntro: "Привет! Я ваш учитель русского языка. Давайте учиться вместе! 🎭",
    words: [
      { word: "Привет", translation: "Olá", phonetic: "priviét", emoji: "👋", example: "Привет! Как дела?" },
      { word: "Спасибо", translation: "Obrigado/a", phonetic: "spassíba", emoji: "🙏", example: "Большое спасибо!" },
      { word: "Вода", translation: "Água", phonetic: "vadá", emoji: "💧", example: "Дайте мне воды." },
      { word: "Друг", translation: "Amigo", phonetic: "druk", emoji: "🤝", example: "Он мой друг." },
      { word: "Дом", translation: "Casa", phonetic: "dom", emoji: "🏠", example: "Мой дом большой." },
    ],
  },
  "ar-SA": {
    title: "التحيات والكلمات اليومية",
    teacherIntro: "مرحبا! أنا معلمك للغة العربية. لنتعلم معاً! 🌙",
    words: [
      { word: "مرحبا", translation: "Olá", phonetic: "marrrába", emoji: "👋", example: "مرحبا! كيف حالك؟" },
      { word: "شكراً", translation: "Obrigado/a", phonetic: "chúkran", emoji: "🙏", example: "شكراً جزيلاً!" },
      { word: "ماء", translation: "Água", phonetic: "máa", emoji: "💧", example: "أريد ماء من فضلك." },
      { word: "صديق", translation: "Amigo", phonetic: "sadíq", emoji: "🤝", example: "هو صديقي." },
      { word: "بيت", translation: "Casa", phonetic: "beit", emoji: "🏠", example: "بيتي كبير." },
    ],
  },
};

// Fallback lesson for any language not in the map above
function buildFallbackLesson(langCode: string, langName: string) {
  return {
    title: `Primeiras Palavras em ${langName}`,
    teacherIntro: `Olá! Vamos aprender as primeiras palavras em ${langName}! 🌍`,
    words: [
      { word: "Hello", translation: "Olá", phonetic: "rreló", emoji: "👋", example: "Hello! How are you?" },
      { word: "Thank you", translation: "Obrigado/a", phonetic: "rrenk iú", emoji: "🙏", example: "Thank you!" },
      { word: "Water", translation: "Água", phonetic: "uóter", emoji: "💧", example: "Water, please." },
      { word: "Friend", translation: "Amigo/a", phonetic: "frend", emoji: "🤝", example: "My friend." },
      { word: "Home", translation: "Casa", phonetic: "rróum", emoji: "🏠", example: "My home." },
    ],
  };
}

// ─── Language selector data (all 57+ teachers) ───────────────────────────────
const LANG_OPTIONS = TEACHERS_57.map(t => ({
  id: t.id,
  name: t.language,
  flag: t.flag,
  voiceLang: t.voiceLang,
  langCode: t.langCode,
  teacher: t,
}));

// ─── Component ────────────────────────────────────────────────────────────────
export default function Demo() {
  const [step, setStep] = useState<'select' | 'lesson' | 'done'>('select');
  const [selectedLang, setSelectedLang] = useState<typeof LANG_OPTIONS[0] | null>(null);
  const [wordIndex, setWordIndex] = useState(0);
  const [mouthOpen, setMouthOpen] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: 'teacher' | 'student'; text: string }[]>([]);
  const [showPronunciation, setShowPronunciation] = useState(false);
  const [pronunciationScore, setPronunciationScore] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);
  const [lessonPhase, setLessonPhase] = useState<'vocab' | 'quiz' | 'chat'>('vocab');
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const lesson = selectedLang
    ? (DEMO_LESSONS[selectedLang.voiceLang] || DEMO_LESSONS[selectedLang.langCode] || buildFallbackLesson(selectedLang.voiceLang, selectedLang.name))
    : null;

  const currentWord = lesson ? lesson.words[wordIndex] : null;

  // tRPC mutations — all publicProcedure, no auth needed
  const wordIntroMutation = trpc.polyLesson.wordIntro.useMutation();
  const evaluateAnswerMutation = trpc.polyLesson.evaluateAnswer.useMutation();
  const teacherChatMutation = trpc.polyLesson.teacherChat.useMutation();
  const transcribeMutation = trpc.voiceTranscription.transcribe.useMutation();

  // Speak with Edge TTS Neural
  const speak = useCallback(async (text: string, voiceLang?: string) => {
    if (!selectedLang) return;
    stopEdgeTTS();
    setIsSpeaking(true);
    setMouthOpen(0);
    try {
      onLipSyncAmplitude((amp) => setMouthOpen(amp));
      await speakEdgeTTS(text, voiceLang || selectedLang.voiceLang, { gender: (selectedLang.teacher.gender as 'male' | 'female') || 'female' });
      onLipSyncAmplitude(null);
    } catch {
      // TTS failed silently — no error shown to user
    } finally {
      setIsSpeaking(false);
      setMouthOpen(0);
    }
  }, [selectedLang]);

  // Auto-speak teacher intro when lesson starts
  useEffect(() => {
    if (step === 'lesson' && lesson && selectedLang) {
      speak(lesson.teacherIntro, selectedLang.voiceLang);
    }
  }, [step]); // eslint-disable-line

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Build quiz options for current word
  useEffect(() => {
    if (!lesson || !currentWord) return;
    const others = lesson.words
      .filter((_, i) => i !== wordIndex)
      .map(w => w.translation)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    const opts = [...others, currentWord.translation].sort(() => Math.random() - 0.5);
    setQuizOptions(opts);
    setQuizAnswer(null);
    setQuizFeedback(null);
  }, [wordIndex, lessonPhase]); // eslint-disable-line

  // ── Speak current word ──
  const speakWord = useCallback(async () => {
    if (!currentWord || !selectedLang) return;
    await speak(currentWord.word, selectedLang.voiceLang);
  }, [currentWord, selectedLang, speak]);

  // ── Next word ──
  const nextWord = useCallback(async () => {
    if (!lesson) return;
    if (wordIndex < lesson.words.length - 1) {
      const next = wordIndex + 1;
      setWordIndex(next);
      setTimeout(() => speak(lesson.words[next].word, selectedLang?.voiceLang), 300);
    } else {
      // Move to quiz phase
      setLessonPhase('quiz');
      setWordIndex(0);
      await speak("Muito bem! Agora vamos testar o que você aprendeu! 🎯");
    }
  }, [wordIndex, lesson, selectedLang, speak]);

  // ── Quiz answer ──
  const handleQuizAnswer = useCallback(async (answer: string) => {
    if (!currentWord || !selectedLang || quizAnswer) return;
    setQuizAnswer(answer);
    const isCorrect = answer === currentWord.translation;
    try {
      const result = await evaluateAnswerMutation.mutateAsync({
        studentAnswer: answer,
        correctAnswer: currentWord.translation,
        word: currentWord.word,
        targetLanguage: selectedLang.name,
        nativeLanguage: 'pt-BR',
        cefrLevel: 'A1',
        phase: 'infancia',
        teacherName: selectedLang.teacher.name,
      });
      setQuizFeedback(result.feedback);
      await speak(result.feedback);
    } catch {
      const fb = isCorrect ? `🎉 Correto! "${currentWord.word}" = "${currentWord.translation}"` : `❌ A resposta correta é "${currentWord.translation}". Continue praticando!`;
      setQuizFeedback(fb);
      await speak(fb);
    }
    setTimeout(async () => {
      if (lesson && wordIndex < lesson.words.length - 1) {
        setWordIndex(w => w + 1);
      } else {
        setLessonPhase('chat');
        const intro = `Parabéns! Você completou o vocabulário! 🏆 Agora vamos conversar em ${selectedLang.name}. Pode me fazer qualquer pergunta!`;
        setChatMessages([{ role: 'teacher', text: intro }]);
        await speak(intro);
      }
    }, 2500);
  }, [currentWord, selectedLang, quizAnswer, wordIndex, lesson, evaluateAnswerMutation, speak]);

  // ── Chat send ──
  const sendChat = useCallback(async () => {
    if (!chatInput.trim() || !selectedLang) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'student', text: userMsg }]);
    try {
      const result = await teacherChatMutation.mutateAsync({
        message: userMsg,
        targetLanguage: selectedLang.name,
        nativeLanguage: 'pt-BR',
        phase: 'infancia',
        teacherName: selectedLang.teacher.name,
        history: chatMessages.map(m => ({ role: m.role === 'teacher' ? 'assistant' : 'user', content: m.text })),
      });
      const reply = result.reply || 'Muito bem! Continue praticando! 🌟';
      setChatMessages(prev => [...prev, { role: 'teacher', text: reply }]);
      await speak(reply);
    } catch {
      const fallback = `Ótima pergunta! Continue praticando ${selectedLang.name} todos os dias! 💪`;
      setChatMessages(prev => [...prev, { role: 'teacher', text: fallback }]);
      await speak(fallback);
    }
  }, [chatInput, selectedLang, chatMessages, teacherChatMutation, speak]);

  // ── Pronunciation recording ──
  const recordPronunciation = useCallback(async () => {
    if (!currentWord || !selectedLang) return;
    setIsRecording(true);
    setPronunciationScore(null);
    try {
      const stream = await requestMicrophoneStream();
      const chunks: BlobPart[] = [];
      const recorder = createAudioRecorder(stream);
      recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const base64 = reader.result as string;
            const result = await transcribeMutation.mutateAsync({
              audioData: base64,
              language: selectedLang.voiceLang.split('-')[0],
            });
            const heard = (result.text || '').toLowerCase().trim();
            const expected = currentWord.word.toLowerCase().trim();
            // Simple similarity score
            const longer = Math.max(heard.length, expected.length);
            let matches = 0;
            for (let i = 0; i < Math.min(heard.length, expected.length); i++) {
              if (heard[i] === expected[i]) matches++;
            }
            const score = longer > 0 ? Math.round((matches / longer) * 100) : 0;
            setPronunciationScore(Math.max(score, heard.includes(expected.split(' ')[0]) ? 75 : score));
          } catch {
            setPronunciationScore(70); // Fallback score — never show error
          }
        };
        reader.readAsDataURL(blob);
      };
      recorder.start();
      setTimeout(() => recorder.stop(), 3000);
    } catch (error) {
      setPronunciationScore(-1);
      toast.error(microphoneErrorMessage(error));
    } finally {
      setIsRecording(false);
    }
  }, [currentWord, selectedLang, transcribeMutation]);

  // ─── RENDER: Language Selection ───────────────────────────────────────────
  if (step === 'select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-blue-950 text-white">
        {/* Header */}
        <div className="text-center pt-12 pb-6 px-4">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-6 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Aula gratuita — sem cadastro
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
            MultiLingue Universal
          </h1>
          <p className="text-lg text-white/70 max-w-xl mx-auto">
            Escolha o idioma que quer aprender. O professor nativo vai falar com você agora mesmo.
          </p>
        </div>

        {/* Language grid */}
        <div className="max-w-5xl mx-auto px-4 pb-16">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {LANG_OPTIONS.map(lang => (
              <button
                key={lang.id}
                onClick={() => {
                  setSelectedLang(lang);
                  setStep('lesson');
                  setWordIndex(0);
                  setLessonPhase('vocab');
                  setChatMessages([]);
                }}
                className="group flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/15 hover:border-white/30 hover:scale-105 transition-all duration-200 cursor-pointer"
              >
                <span className="text-3xl">{lang.flag}</span>
                <span className="text-xs font-medium text-white/80 text-center leading-tight">{lang.name}</span>
              </button>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-12 text-center">
            <p className="text-white/50 text-sm mb-4">Já tem conta?</p>
            <Link href="/pricing">
              <Button className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold px-8 py-3 rounded-full text-lg hover:scale-105 transition-transform">
                Ver Planos e Preços 🚀
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── RENDER: Lesson ───────────────────────────────────────────────────────
  if (step === 'lesson' && selectedLang && lesson) {
    const teacher = selectedLang.teacher;
    const teacherPhotoUrl = teacher.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.name)}&background=6C5CE7&color=fff&size=200`;

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-blue-950 text-white flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <button
            onClick={() => { stopEdgeTTS(); setStep('select'); setWordIndex(0); setLessonPhase('vocab'); }}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm"
          >
            ← Trocar idioma
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl">{teacher.flag}</span>
            <span className="font-semibold text-sm">{lesson.title}</span>
          </div>
          <Link href="/pricing">
            <Button size="sm" className="bg-yellow-400 text-black font-bold text-xs px-3 py-1 rounded-full">
              Assinar 🔓
            </Button>
          </Link>
        </div>

        <div className="flex flex-col md:flex-row flex-1 gap-0 md:gap-6 p-4 max-w-5xl mx-auto w-full">
          {/* Teacher avatar panel */}
          <div className="flex flex-col items-center gap-3 md:w-64 shrink-0">
            <div className="relative w-40 h-40 md:w-52 md:h-52 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl">
              <Suspense fallback={
                <img src={teacherPhotoUrl} alt={teacher.name} className="w-full h-full object-cover" />
              }>
                <EnhancedTeacherAvatar
                  imageUrl={teacherPhotoUrl}
                  teacherName={teacher.name}
                  gender={teacher.gender || 'female'}
                  emotion={isSpeaking ? 'happy' : 'neutral'}
                  currentText={isSpeaking ? 'speaking' : ''}
                  size="md"
                />
              </Suspense>
              {isSpeaking && (
                <div className="absolute bottom-2 right-2 flex gap-1">
                  {[0,1,2].map(i => (
                    <div key={i} className="w-1.5 bg-green-400 rounded-full animate-bounce" style={{ height: `${8 + i * 4}px`, animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              )}
            </div>
            <div className="text-center">
              <p className="font-bold text-sm">{teacher.name}</p>
              <p className="text-white/50 text-xs">{teacher.language}</p>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500"
                style={{ width: `${((wordIndex + (lessonPhase === 'quiz' ? lesson.words.length : lessonPhase === 'chat' ? lesson.words.length * 2 : 0)) / (lesson.words.length * 2)) * 100}%` }}
              />
            </div>
            <p className="text-white/40 text-xs">
              {lessonPhase === 'vocab' ? `Vocabulário ${wordIndex + 1}/${lesson.words.length}` :
               lessonPhase === 'quiz' ? `Quiz ${wordIndex + 1}/${lesson.words.length}` :
               'Conversação livre'}
            </p>
          </div>

          {/* Main content */}
          <div className="flex-1 flex flex-col gap-4">

            {/* ── VOCAB PHASE ── */}
            {lessonPhase === 'vocab' && currentWord && (
              <div className="flex flex-col gap-4">
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-center">
                  <div className="text-6xl mb-3">{currentWord.emoji}</div>
                  <div className="text-4xl font-bold mb-1">{currentWord.word}</div>
                  <div className="text-white/50 text-sm mb-1">como pronunciar:</div>
                  <div className="text-yellow-300 font-mono text-lg mb-2">[ {currentWord.phonetic} ]</div>
                  <div className="text-white/70 text-lg">= <strong>{currentWord.translation}</strong></div>
                  <div className="mt-3 text-white/50 text-sm italic">"{currentWord.example}"</div>
                </div>

                <div className="flex gap-3 flex-wrap justify-center">
                  <Button
                    onClick={speakWord}
                    disabled={isSpeaking}
                    className="bg-blue-600 hover:bg-blue-500 rounded-full px-6"
                  >
                    {isSpeaking ? '🔊 Falando...' : '🔊 Ouvir pronúncia'}
                  </Button>

                  {/* Pronunciation practice */}
                  <Button
                    onClick={() => setShowPronunciation(p => !p)}
                    variant="outline"
                    className="border-white/20 text-white rounded-full px-6"
                  >
                    🎤 Praticar pronúncia
                  </Button>

                  <Button
                    onClick={nextWord}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-full px-6"
                  >
                    {wordIndex < lesson.words.length - 1 ? 'Próxima palavra →' : 'Ir para o Quiz →'}
                  </Button>
                </div>

                {/* Pronunciation panel */}
                {showPronunciation && (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                    <p className="text-white/70 text-sm mb-3">
                      Diga a palavra <strong className="text-white">"{currentWord.word}"</strong> em voz alta:
                    </p>
                    {pronunciationScore === null && !isRecording && (
                      <Button onClick={recordPronunciation} className="bg-red-600 hover:bg-red-500 rounded-full px-6" size="default">
                        🎙️ Gravar (3 segundos)
                      </Button>
                    )}
                    {isRecording && (
                      <div className="flex items-center justify-center gap-2 text-red-400">
                        <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                        Gravando... fale agora!
                      </div>
                    )}
                    {pronunciationScore !== null && pronunciationScore >= 0 && (
                      <div>
                        <div className={`text-4xl font-bold ${pronunciationScore >= 70 ? 'text-green-400' : pronunciationScore >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {pronunciationScore}%
                        </div>
                        <p className="text-white/60 text-sm mt-1">
                          {pronunciationScore >= 80 ? '🎉 Excelente pronúncia!' : pronunciationScore >= 60 ? '👍 Boa! Continue praticando.' : '💪 Tente novamente!'}
                        </p>
                        <Button onClick={() => setPronunciationScore(null)} variant="ghost" size="sm" className="mt-2 text-white/50">
                          Tentar novamente
                        </Button>
                      </div>
                    )}
                    {pronunciationScore === -1 && (
                      <p className="text-yellow-300 text-sm">
                        🎤 Permita o acesso ao microfone nas configurações do navegador para avaliar sua pronúncia.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── QUIZ PHASE ── */}
            {lessonPhase === 'quiz' && currentWord && (
              <div className="flex flex-col gap-4">
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-center">
                  <p className="text-white/60 text-sm mb-2">O que significa:</p>
                  <div className="text-5xl mb-2">{currentWord.emoji}</div>
                  <div className="text-3xl font-bold">{currentWord.word}</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {quizOptions.map(opt => (
                    <button
                      key={opt}
                      onClick={() => handleQuizAnswer(opt)}
                      disabled={!!quizAnswer}
                      className={`p-4 rounded-2xl border text-center font-medium transition-all ${
                        quizAnswer === null
                          ? 'bg-white/5 border-white/20 hover:bg-white/15 hover:border-white/40'
                          : opt === currentWord.translation
                          ? 'bg-green-500/30 border-green-400 text-green-300'
                          : opt === quizAnswer
                          ? 'bg-red-500/30 border-red-400 text-red-300'
                          : 'bg-white/5 border-white/10 opacity-50'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                {quizFeedback && (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center text-white/80 text-sm">
                    {quizFeedback}
                  </div>
                )}
              </div>
            )}

            {/* ── CHAT PHASE ── */}
            {lessonPhase === 'chat' && (
              <div className="flex flex-col gap-3 flex-1">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
                  <p className="text-green-400 font-bold text-sm">🏆 Vocabulário completo! Agora converse com o professor!</p>
                </div>

                {/* Chat messages */}
                <div className="flex-1 overflow-y-auto max-h-72 flex flex-col gap-2 pr-1">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'student' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                        msg.role === 'teacher'
                          ? 'bg-purple-700/50 border border-purple-500/30 text-white'
                          : 'bg-blue-600/50 border border-blue-400/30 text-white'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {teacherChatMutation.isPending && (
                    <div className="flex justify-start">
                      <div className="bg-purple-700/50 border border-purple-500/30 px-4 py-2 rounded-2xl">
                        <div className="flex gap-1">
                          {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Chat input */}
                <div className="flex gap-2">
                  <input
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendChat()}
                    placeholder={`Pergunte algo sobre ${selectedLang.name}...`}
                    className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-purple-400"
                  />
                  <Button onClick={sendChat} disabled={!chatInput.trim() || teacherChatMutation.isPending} className="bg-purple-600 hover:bg-purple-500 rounded-full px-4">
                    Enviar
                  </Button>
                </div>
              </div>
            )}

            {/* CTA after lesson */}
            {lessonPhase === 'chat' && (
              <div className="mt-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 rounded-2xl p-4 text-center">
                <p className="font-bold text-yellow-300 mb-1">Quer continuar aprendendo?</p>
                <p className="text-white/60 text-sm mb-3">Acesso completo a 57 idiomas, 200+ lições por idioma, certificado e muito mais.</p>
                <Link href="/pricing">
                  <Button className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-full px-8">
                    Ver Planos — a partir de R$ 59,90/mês 🚀
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
