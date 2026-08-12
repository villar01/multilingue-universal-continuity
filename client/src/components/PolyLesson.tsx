/**
 * PolyLesson.tsx
 * Experiência de ensino como na vida real:
 * 1. Professor apresenta cada palavra com voz + animação
 * 2. Pausa e explica (como um professor real)
 * 3. Conversa com o aluno (IA responde como professor)
 * 4. Treino gamificado: flashcards SRS, quiz, arrastar palavras
 * 5. XP, streak, feedback em tempo real
 */
import { useState, useCallback, useRef, useEffect, lazy, Suspense } from "react";
const SceneLesson = lazy(() => import('./SceneLesson'));
const SentenceBuilder = lazy(() => import('./SentenceBuilder'));
import { speakEdgeTTS, stopEdgeTTS, onLipSyncAmplitude } from "@/lib/edgeTTSClient";
import { createAudioRecorder, requestMicrophoneStream } from "@/lib/microphoneAccess";
import { microphoneErrorMessage } from "@/lib/microphoneAccess";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

// Levenshtein similarity (0-100)
function levenshteinScore(a: string, b: string): number {
  const s1 = a.toLowerCase().trim();
  const s2 = b.toLowerCase().trim();
  if (!s1 || !s2) return 0;
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  if (longer.length === 0) return 100;
  const costs: number[] = Array.from({ length: shorter.length + 1 }, (_, i) => i);
  for (let i = 1; i <= longer.length; i++) {
    let prev = i;
    for (let j = 1; j <= shorter.length; j++) {
      const val = longer[i-1] === shorter[j-1] ? costs[j-1] : Math.min(costs[j-1], prev, costs[j]) + 1;
      costs[j-1] = prev; prev = val;
    }
    costs[shorter.length] = prev;
  }
  return Math.round(((longer.length - costs[shorter.length]) / longer.length) * 100);
}

// Record audio via MediaRecorder (works in all modern browsers)
async function recordAudioBlob(durationMs = 4000): Promise<Blob | null> {
  try {
    const stream = await requestMicrophoneStream();
    return new Promise((resolve) => {
      const chunks: BlobPart[] = [];
      const recorder = createAudioRecorder(stream);
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        resolve(new Blob(chunks, { type: recorder.mimeType || 'audio/webm' }));
      };
      recorder.start();
      setTimeout(() => { try { recorder.stop(); } catch {} }, durationMs);
    });
  } catch (error) {
    throw error;
  }
}

// Convert Blob to base64 string
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Score pronunciation using MediaRecorder + Whisper (server-side)
// Falls back to Web Speech API if MediaRecorder unavailable
async function scorePronunciationWhisper(
  expectedWord: string,
  langCode: string,
  transcribeFn: (audioData: string, language: string) => Promise<{ text: string }>
): Promise<{ score: number; heard: string; microphoneMessage?: string }> {
  // Try MediaRecorder first (works in Firefox, Safari, Chrome)
  const hasMediaRecorder = typeof (window as any).MediaRecorder !== 'undefined';
  const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  if (hasMediaRecorder && hasGetUserMedia) {
    try {
      const blob = await recordAudioBlob(4000);
      if (blob && blob.size > 1000) {
        const base64 = await blobToBase64(blob);
        const result = await transcribeFn(base64, langCode.split('-')[0]);
        const heard = (result.text || '').trim();
        const score = levenshteinScore(expectedWord, heard);
        return { score, heard };
      }
    } catch (error) {
      return { score: -1, heard: '', microphoneMessage: microphoneErrorMessage(error) };
    }
  }
  // Fallback: Web Speech API (Chrome only)
  return new Promise((resolve) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { resolve({ score: -1, heard: '' }); return; }
    const rec = new SpeechRecognition();
    rec.lang = langCode;
    rec.continuous = false;
    rec.interimResults = false;
    rec.maxAlternatives = 5;
    let done = false;
    rec.onresult = (e: any) => {
      done = true;
      const alts: string[] = [];
      for (let i = 0; i < e.results[0].length; i++) alts.push(e.results[0][i].transcript.toLowerCase().trim());
      let best = 0; let bestHeard = alts[0] || '';
      for (const alt of alts) {
        const sim = levenshteinScore(alt, expectedWord);
        if (sim > best) { best = sim; bestHeard = alt; }
      }
      resolve({ score: best, heard: bestHeard });
    };
    rec.onerror = () => { if (!done) resolve({ score: -1, heard: '' }); };
    rec.onend = () => { if (!done) resolve({ score: -1, heard: '' }); };
    rec.start();
    setTimeout(() => { try { rec.stop(); } catch {} }, 4000);
  });
}

export type LifePhase = 'infancia' | 'crianca' | 'adolescencia' | 'adulto' | 'fluente';

interface VocabItem {
  word: string;
  translation: string;
  phonetic?: string;
  emoji?: string;
  example?: string;
  exampleTranslation?: string;
  examplePhonetic?: string;
  imageKeyword?: string;
}

interface DialogueLine {
  speaker: 'teacher' | 'student';
  text: string;
  translation?: string;
}

interface Exercise {
  type: string;
  question: string;
  answer: string;
  options?: string[];
  hint?: string;
  emoji?: string;
}

interface LessonData {
  title: string;
  phase?: LifePhase;
  cefr?: string;
  phaseLabel?: string;
  description?: string;
  vocabulary?: VocabItem[];
  dialogue?: DialogueLine[];
  grammar?: string;
  exercises?: Exercise[];
  realLifeContext?: string;
  culturalNote?: string;
}

interface Teacher {
  name: string;
  gender: 'male' | 'female';
  photo?: string;
  langCode: string;
  color?: string;
}

interface Props {
  lesson: LessonData;
  languageCode: string;
  teacher?: Teacher;
  onComplete?: (score: number, xp: number) => void;
}

const PHASE_COLORS: Record<LifePhase, string> = {
  infancia: '#FF9F43',
  crianca: '#48DBFB',
  adolescencia: '#A29BFE',
  adulto: '#55EFC4',
  fluente: '#FD79A8',
};

const PHASE_LABELS: Record<LifePhase, string> = {
  infancia: '🍼 Infância A1',
  crianca: '🎒 Criança A2',
  adolescencia: '🎮 Adolescência B1',
  adulto: '💼 Adulto B2',
  fluente: '🎓 Fluente C1-C2',
};

type Stage = 'intro' | 'vocab' | 'cartilha' | 'practice' | 'chat' | 'srs' | 'scene' | 'structure' | 'nanoBanana' | 'familia' | 'complete';

function detectLetter(title: string): string | null {
  const t = title.trim();
  if (/^[A-Za-z]$/.test(t)) return t.toUpperCase();
  const m = t.match(/(?:letra|letter)\s+([A-Za-z])/i);
  if (m) return m[1].toUpperCase();
  const m2 = t.match(/^([A-Za-z])\s*[-:]/);
  if (m2) return m2[1].toUpperCase();
  const m3 = t.match(/(?:with|com)\s+([A-Za-z])(?:\s|$)/i);
  if (m3) return m3[1].toUpperCase();
  return null;
}

const ENVIRONMENTS = [
  { id: 'kitchen', label: 'Cozinha', emoji: '\u{1F373}', labelEn: 'kitchen' },
  { id: 'bedroom', label: 'Quarto', emoji: '\u{1F6CF}\uFE0F', labelEn: 'bedroom' },
  { id: 'school', label: 'Escola', emoji: '\u{1F3EB}', labelEn: 'school' },
  { id: 'garden', label: 'Jardim', emoji: '\u{1F33B}', labelEn: 'garden' },
  { id: 'street', label: 'Rua', emoji: '\u{1F3D9}\uFE0F', labelEn: 'street' },
  { id: 'supermarket', label: 'Mercado', emoji: '\u{1F6D2}', labelEn: 'supermarket' },
  { id: 'bathroom', label: 'Banheiro', emoji: '\u{1F6BF}', labelEn: 'bathroom' },
  { id: 'park', label: 'Parque', emoji: '\u{1F333}', labelEn: 'park' },
];

export default function PolyLesson({ lesson, languageCode, teacher, onComplete }: Props) {
  const phase = (lesson.phase || 'infancia') as LifePhase;
  const phaseColor = PHASE_COLORS[phase] || '#6C5CE7';
  const vocab = lesson.vocabulary || [];
  const exercises = lesson.exercises || [];

  // Stage control
  const [stage, setStage] = useState<Stage>('intro');
  const [vocabIndex, setVocabIndex] = useState(0);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [srsIndex, setSrsIndex] = useState(0);

  // XP & scoring
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [showXpPop, setShowXpPop] = useState(false);
  const [xpAmount, setXpAmount] = useState(0);

  // Teacher state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lipAmplitude, setLipAmplitude] = useState(0);
  const [teacherMessage, setTeacherMessage] = useState('');
  const [teacherIntro, setTeacherIntro] = useState('');
  const [introLoaded, setIntroLoaded] = useState(false);

  // Quiz state
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);

  // Chat state
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // SRS words (shuffled vocab for review)
  const [srsWords, setSrsWords] = useState<VocabItem[]>([]);
  const [srsFlipped, setSrsFlipped] = useState(false);
  const [srsAnswered, setSrsAnswered] = useState(false);

  // Pronunciation state
  const [isRecordingPron, setIsRecordingPron] = useState(false);
  const [pronScore, setPronScore] = useState<number | null>(null);
  const [pronHeard, setPronHeard] = useState<string>('');
  const [microphoneIssue, setMicrophoneIssue] = useState<string | null>(null);

  const transcribeMutation = trpc.voiceTranscription.transcribe.useMutation();

  // Cartilha state (environment-based letter questions)
  const detectedLetter = detectLetter(lesson.title || '');
  const isCartilhaLesson = detectedLetter !== null && (phase === 'infancia' || phase === 'crianca');
  const [cartilhaEnv, setCartilhaEnv] = useState<string | null>(null);
  const [cartilhaData, setCartilhaData] = useState<{
    question: string;
    questionInTarget: string;
    words: Array<{ word: string; translation: string; phonetic?: string; emoji?: string; hint?: string }>;
    teacherIntro: string;
    celebration: string;
  } | null>(null);
  const [cartilhaWordIndex, setCartilhaWordIndex] = useState(0);
  const [cartilhaRevealed, setCartilhaRevealed] = useState(false);
  const [cartilhaAnswered, setCartilhaAnswered] = useState(false);
  const [cartilhaCorrect, setCartilhaCorrect] = useState<boolean | null>(null);
  const [cartilhaInput, setCartilhaInput] = useState('');
  const cartilhaQuestionMutation = trpc.polyLesson.cartilhaQuestion.useMutation();

  // NanoBanana (phase completion celebration) state
  const [nanoBananaShown, setNanoBananaShown] = useState(false);

  // Familia (family scene) state
  const [familiaImageUrl, setFamiliaImageUrl] = useState<string | null>(null);
  const [familiaImageLoading, setFamiliaImageLoading] = useState(false);
  const [familiaQuestions, setFamiliaQuestions] = useState<Array<{ question: string; answer: string; options: string[] }>>([]);
  const [familiaQIndex, setFamiliaQIndex] = useState(0);
  const [familiaSelected, setFamiliaSelected] = useState<string | null>(null);
  const [familiaCorrect, setFamiliaCorrect] = useState<boolean | null>(null);
  const [familiaVocab, setFamiliaVocab] = useState<Array<{ word: string; translation: string; emoji?: string }>>([]);
  const [familiaVocabIndex, setFamiliaVocabIndex] = useState(0);
  const [familiaMemoryCards, setFamiliaMemoryCards] = useState<Array<{ id: number; word: string; isWord: boolean; matched: boolean; flipped: boolean }>>([]);
  const [familiaMemoryFirst, setFamiliaMemoryFirst] = useState<number | null>(null);
  const [familiaMemoryMatches, setFamiliaMemoryMatches] = useState(0);
  const [familiaSubStage, setFamiliaSubStage] = useState<'photo' | 'questions' | 'vocab' | 'memory'>('photo');
  const [familiaChat, setFamiliaChat] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [familiaChatInput, setFamiliaChatInput] = useState('');
  const familiaGenerateMutation = trpc.polyLesson.familiaScene.useMutation();
  const familiaChatMutation = trpc.polyLesson.teacherChat.useMutation();

  const handlePronunciationCheck = useCallback(async (word: string) => {
    if (isRecordingPron) return;
    const approved = window.confirm(
      'Deseja ativar o microfone para responder ao professor?\n\nO microfone será usado apenas nesta atividade de pronúncia. A gravação começa somente depois da sua confirmação e pode ser interrompida ao final do exercício.',
    );
    if (!approved) return;
    setIsRecordingPron(true);
    setPronScore(null);
    setPronHeard('');
    setMicrophoneIssue(null);
    try {
      // Use MediaRecorder + Whisper (works in all browsers incl. Firefox/Safari)
      const transcribeFn = async (audioData: string, language: string) => {
        return transcribeMutation.mutateAsync({ audioData, language });
      };
      const result = await scorePronunciationWhisper(word, languageCode, transcribeFn);
      if (result.score === -1) {
        const message = result.microphoneMessage || 'O reconhecimento de voz não ficou disponível neste navegador.';
        setMicrophoneIssue(message);
        toast.error(message);
      } else {
        setPronScore(result.score);
        setPronHeard(result.heard);
        if (result.score >= 80) { addXp(15); toast.success(`🎤 Pronúncia: ${result.score}% — Excelente!`); }
        else if (result.score >= 50) { addXp(8); toast.info(`🎤 Pronúncia: ${result.score}% — Continue praticando!`); }
        else { addXp(3); toast.warning(`🎤 Pronúncia: ${result.score}% — Tente novamente!`); }
      }
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('Permission') || msg.includes('NotAllowed') || msg.includes('denied') || msg.includes('Permissão')) {
        toast.error('Permissão de microfone negada — use o ícone de controles deslizantes à esquerda do endereço e permita o Microfone.');
      } else {
        toast.error('Erro ao avaliar pronúncia — tente novamente');
      }
    } finally {
      setIsRecordingPron(false);
    }
  }, [isRecordingPron, languageCode, transcribeMutation]);

  // tRPC mutations
  const wordIntroMutation = trpc.polyLesson.wordIntro.useMutation();
  const teacherChatMutation = trpc.polyLesson.teacherChat.useMutation();
  const evaluateAnswerMutation = trpc.polyLesson.evaluateAnswer.useMutation();
  const srsUpsertMutation = trpc.srs.upsert.useMutation();

  const { user } = useAuth();
  const isLoggedIn = !!user;
  const teacherName = teacher?.name || 'Professor(a)';
  const teacherGender = teacher?.gender || 'female';

  // Normalize short language codes to full BCP-47 codes for TTS
  const normalizeLang = (code: string): string => {
    const map: Record<string, string> = {
      'en': 'en-US', 'pt': 'pt-BR', 'es': 'es-ES', 'fr': 'fr-FR',
      'de': 'de-DE', 'it': 'it-IT', 'ja': 'ja-JP', 'zh': 'zh-CN',
      'ko': 'ko-KR', 'ru': 'ru-RU', 'ar': 'ar-SA', 'hi': 'hi-IN',
      'nl': 'nl-NL', 'pl': 'pl-PL', 'sv': 'sv-SE', 'da': 'da-DK',
      'fi': 'fi-FI', 'nb': 'nb-NO', 'tr': 'tr-TR', 'uk': 'uk-UA',
      'cs': 'cs-CZ', 'hu': 'hu-HU', 'ro': 'ro-RO', 'bg': 'bg-BG',
      'hr': 'hr-HR', 'sk': 'sk-SK', 'sl': 'sl-SI', 'et': 'et-EE',
      'lv': 'lv-LV', 'lt': 'lt-LT', 'vi': 'vi-VN', 'id': 'id-ID',
      'ms': 'ms-MY', 'fa': 'fa-IR', 'he': 'he-IL', 'el': 'el-GR',
      'af': 'af-ZA', 'sw': 'sw-KE', 'th': 'th-TH', 'ca': 'ca-ES',
    };
    return map[code.toLowerCase()] || code;
  };

  // Use teacher's langCode if available, otherwise normalize lesson languageCode
  const ttsLang = normalizeLang(teacher?.langCode || languageCode);

  // Lip sync setup
  useEffect(() => {
    onLipSyncAmplitude((amp) => setLipAmplitude(amp));
    return () => { onLipSyncAmplitude(null); };
  }, []);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Load teacher intro for current vocab word
  useEffect(() => {
    if (stage !== 'vocab' || !vocab[vocabIndex]) return;
    setIntroLoaded(false);
    setTeacherIntro('');
    const v = vocab[vocabIndex];
    wordIntroMutation.mutateAsync({
      word: v.word,
      translation: v.translation,
      phonetic: v.phonetic,
      example: v.example,
      targetLanguage: languageCode,
      phase,
      teacherName,
    }).then(r => {
      setTeacherIntro(r.intro);
      setIntroLoaded(true);
      // Auto-speak the word
      speakWord(v.word);
    }).catch(() => {
      setTeacherIntro(`Vamos aprender a palavra "${v.word}"! Em português significa "${v.translation}". 🎯`);
      setIntroLoaded(true);
      speakWord(v.word);
    });
  }, [vocabIndex, stage]);

  // Shuffle options for quiz
  useEffect(() => {
    if (stage !== 'practice' || !exercises[exerciseIndex]) return;
    const ex = exercises[exerciseIndex];
    if (ex.options && ex.options.length > 0) {
      setShuffledOptions([...ex.options].sort(() => Math.random() - 0.5));
    }
    setSelectedAnswer(null);
    setIsCorrect(null);
    setShowFeedback(false);
    setFeedbackText('');
  }, [exerciseIndex, stage]);

  // Init SRS words
  useEffect(() => {
    if (stage === 'srs') {
      setSrsWords([...vocab].sort(() => Math.random() - 0.5));
      setSrsIndex(0);
      setSrsFlipped(false);
      setSrsAnswered(false);
    }
  }, [stage]);

  const speakWord = useCallback((text: string) => {
    setIsSpeaking(true);
    speakEdgeTTS(text, ttsLang, {
      gender: teacherGender,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
    });
  }, [ttsLang, teacherGender]);

  const speakTeacher = useCallback((text: string) => {
    setIsSpeaking(true);
    // Teacher speaks in the lesson language (not always pt-BR)
    speakEdgeTTS(text, ttsLang, {
      gender: teacherGender,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
    });
  }, [ttsLang, teacherGender]);

  const addXp = (amount: number) => {
    setXp(prev => prev + amount);
    setXpAmount(amount);
    setShowXpPop(true);
    setTimeout(() => setShowXpPop(false), 1500);
  };

  const handleVocabNext = () => {
    stopEdgeTTS();
    addXp(5);
    setPronScore(null);
    setPronHeard('');
    if (vocabIndex < vocab.length - 1) {
      setVocabIndex(v => v + 1);
    } else if (isCartilhaLesson) {
      // Go to cartilha environment-question stage before practice
      setStage('cartilha');
    } else {
      setStage('practice');
    }
  };

  const handleAnswerSelect = async (answer: string) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(answer);
    const ex = exercises[exerciseIndex];
    const correct = answer.toLowerCase().trim() === ex.answer.toLowerCase().trim();
    setIsCorrect(correct);

    // Get AI feedback
    try {
      const result = await evaluateAnswerMutation.mutateAsync({
        studentAnswer: answer,
        correctAnswer: ex.answer,
        word: ex.question,
        targetLanguage: languageCode,
        phase,
        teacherName,
      });
      setFeedbackText(result.feedback);
      setShowFeedback(true);
      if (result.isCorrect) {
        setStreak(s => s + 1);
        setTotalCorrect(c => c + 1);
        addXp(streak >= 3 ? 20 : 10);
      } else {
        setStreak(0);
        addXp(2);
      }
      // SRS update — only when logged in
      if (isLoggedIn) srsUpsertMutation.mutate({
        word: ex.answer,
        translation: ex.question,
        targetLanguage: languageCode,
        quality: result.quality,
      });
    } catch {
      setFeedbackText(correct ? '🎉 Correto! Muito bem!' : `❌ Resposta correta: "${ex.answer}"`);
      setShowFeedback(true);
      if (correct) { setStreak(s => s + 1); setTotalCorrect(c => c + 1); addXp(10); }
      else { setStreak(0); addXp(2); }
    }
  };

  const handleExerciseNext = () => {
    if (exerciseIndex < exercises.length - 1) {
      setExerciseIndex(e => e + 1);
    } else {
      setStage('chat');
    }
  };

  const handleChatSend = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    const newHistory = [...chatHistory, { role: 'user' as const, content: userMsg }];
    setChatHistory(newHistory);

    try {
      const result = await teacherChatMutation.mutateAsync({
        message: userMsg,
        targetLanguage: languageCode,
        teacherName,
        teacherGender,
        phase,
        currentWord: vocab[vocabIndex]?.word,
        lessonTitle: lesson.title,
        history: newHistory,
      });
      const assistantMsg = { role: 'assistant' as const, content: result.reply };
      setChatHistory(h => [...h, assistantMsg]);
      speakTeacher(result.reply);
      addXp(5);
    } catch {
      setChatHistory(h => [...h, { role: 'assistant', content: 'Ótima pergunta! Continue praticando! 😊' }]);
    }
  };

  const handleSrsAnswer = (quality: number) => {
    const word = srsWords[srsIndex];
    if (!word) return;
    setSrsAnswered(true);
    if (isLoggedIn) srsUpsertMutation.mutate({
      word: word.word,
      translation: word.translation,
      targetLanguage: languageCode,
      quality,
    });
    addXp(quality >= 3 ? 15 : 5);
    if (quality >= 3) { setStreak(s => s + 1); setTotalCorrect(c => c + 1); }
    else setStreak(0);
  };

  const handleSrsNext = () => {
    setSrsFlipped(false);
    setSrsAnswered(false);
    if (srsIndex < srsWords.length - 1) {
      setSrsIndex(i => i + 1);
    } else {
      // Go to Scene (environment exploration) then Structure then NanoBanana
      setStage('scene');
    }
  };

  const handleNanoBananaNext = () => {
    setNanoBananaShown(true);
    // Load familia scene data
    setFamiliaImageLoading(true);
    setFamiliaSubStage('photo');
    familiaGenerateMutation.mutate(
      { targetLanguage: languageCode, phase, lessonTitle: lesson.title },
      {
        onSuccess: (data) => {
          setFamiliaImageUrl(data.imageUrl || null);
          setFamiliaQuestions(data.questions || []);
          setFamiliaVocab(data.vocabulary || []);
          // Build memory cards: pairs of word + translation
          const pairs = (data.vocabulary || []).slice(0, 6) as Array<{ word: string; translation: string; emoji?: string }>;
          const cards = [
            ...pairs.map((v: { word: string; translation: string }, i: number) => ({ id: i * 2, word: v.word, isWord: true, matched: false, flipped: false })),
            ...pairs.map((v: { word: string; translation: string }, i: number) => ({ id: i * 2 + 1, word: v.translation, isWord: false, matched: false, flipped: false })),
          ].sort(() => Math.random() - 0.5);
          setFamiliaMemoryCards(cards);
          setFamiliaMemoryMatches(0);
          setFamiliaMemoryFirst(null);
          setFamiliaImageLoading(false);
          setStage('familia');
        },
        onError: () => {
          setFamiliaImageLoading(false);
          setStage('familia');
        },
      }
    );
  };

  const handleFamiliaMemoryFlip = (cardId: number) => {
    setFamiliaMemoryCards(prev => {
      const card = prev.find(c => c.id === cardId);
      if (!card || card.matched || card.flipped) return prev;
      const updated = prev.map(c => c.id === cardId ? { ...c, flipped: true } : c);
      const flipped = updated.filter(c => c.flipped && !c.matched);
      if (flipped.length === 2) {
        const [a, b] = flipped;
        const isMatch = (a.isWord && !b.isWord && a.word === familiaVocab.find(v => v.translation === b.word)?.word) ||
          (!a.isWord && b.isWord && b.word === familiaVocab.find(v => v.translation === a.word)?.word);
        if (isMatch) {
          const matched = updated.map(c => (c.id === a.id || c.id === b.id) ? { ...c, matched: true } : c);
          setFamiliaMemoryMatches(m => m + 1);
          addXp(20);
          return matched;
        } else {
          setTimeout(() => {
            setFamiliaMemoryCards(p => p.map(c => (c.id === a.id || c.id === b.id) ? { ...c, flipped: false } : c));
          }, 1000);
        }
      }
      return updated;
    });
  };

  const progress =
    stage === 'intro' ? 0 :
    stage === 'vocab' ? (vocabIndex / Math.max(vocab.length, 1)) * 15 :
    stage === 'cartilha' ? 15 :
    stage === 'practice' ? 20 + (exerciseIndex / Math.max(exercises.length, 1)) * 20 :
    stage === 'chat' ? 40 :
    stage === 'srs' ? 45 + (srsIndex / Math.max(srsWords.length, 1)) * 15 :
    stage === 'scene' ? 60 :
    stage === 'structure' ? 72 :
    stage === 'nanoBanana' ? 82 :
    stage === 'familia' ? 87 + (familiaQIndex / 3) * 10 :
    100;

  // ── HEADER (always visible) ──────────────────────────────────────────────
  const Header = () => (
    <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <Badge style={{ background: phaseColor, color: '#fff', fontSize: 12 }}>
          {PHASE_LABELS[phase]}
        </Badge>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {streak >= 3 && (
            <span style={{ fontSize: 13, color: '#FF9F43', fontWeight: 700 }}>🔥 {streak} streak!</span>
          )}
          <span style={{ fontSize: 13, color: '#FFD700', fontWeight: 700 }}>⚡ {xp} XP</span>
        </div>
      </div>
      <Progress value={progress} style={{ height: 5 }} />
      {/* XP Pop */}
      {showXpPop && (
        <div style={{
          position: 'fixed', top: 80, right: 20, zIndex: 9999,
          background: '#FFD700', color: '#000', fontWeight: 800, fontSize: 18,
          borderRadius: 12, padding: '8px 16px',
          animation: 'fadeUp 1.5s ease forwards',
        }}>
          +{xpAmount} XP ⚡
        </div>
      )}
    </div>
  );

  // ── TEACHER AVATAR (visemas SVG reais — lip sync permanente) ────────────────
  // 7 formas de boca baseadas na amplitude do áudio (0-1)
  // Cada path é uma curva bezier realista: superior + inferior
  const getViseme = (amp: number) => {
    if (amp < 0.04) return { // Fechada — linha fina
      upper: 'M 36 50 Q 44 49 50 49.5 Q 56 49 64 50',
      lower: 'M 36 50 Q 44 51 50 50.5 Q 56 51 64 50',
      fill: 'none', cavity: null
    };
    if (amp < 0.12) return { // Levemente aberta
      upper: 'M 37 49 Q 44 47.5 50 47.5 Q 56 47.5 63 49',
      lower: 'M 37 49 Q 44 52 50 52.5 Q 56 52 63 49',
      fill: '#2a0808', cavity: 'M 40 49.5 Q 50 51.5 60 49.5 Q 50 51 40 49.5'
    };
    if (amp < 0.25) return { // Aberta — vogal curta
      upper: 'M 37 48 Q 44 45.5 50 45.5 Q 56 45.5 63 48',
      lower: 'M 37 48 Q 44 54 50 55 Q 56 54 63 48',
      fill: '#1a0505', cavity: 'M 40 49 Q 50 53 60 49'
    };
    if (amp < 0.40) return { // Aberta média — vogal A
      upper: 'M 37 47 Q 44 44 50 43.5 Q 56 44 63 47',
      lower: 'M 37 47 Q 44 55.5 50 57 Q 56 55.5 63 47',
      fill: '#150303', cavity: 'M 39 49 Q 50 54.5 61 49'
    };
    if (amp < 0.55) return { // Bem aberta
      upper: 'M 37 46 Q 44 42.5 50 42 Q 56 42.5 63 46',
      lower: 'M 37 46 Q 44 57 50 59 Q 56 57 63 46',
      fill: '#100202', cavity: 'M 39 48.5 Q 50 55.5 61 48.5'
    };
    if (amp < 0.75) return { // Muito aberta
      upper: 'M 37 45 Q 44 41 50 40.5 Q 56 41 63 45',
      lower: 'M 37 45 Q 44 58.5 50 61 Q 56 58.5 63 45',
      fill: '#0d0101', cavity: 'M 39 48 Q 50 56.5 61 48'
    };
    return { // Máxima abertura
      upper: 'M 37 44 Q 44 40 50 39.5 Q 56 40 63 44',
      lower: 'M 37 44 Q 44 60 50 62.5 Q 56 60 63 44',
      fill: '#0a0101', cavity: 'M 39 47.5 Q 50 57 61 47.5'
    };
  };
  const TeacherAvatar = ({ speaking }: { speaking?: boolean }) => {
    const amp = speaking ? Math.max(0, Math.min(1, lipAmplitude)) : 0;
    const viseme = getViseme(amp);
    const skinColor = teacherGender === 'female' ? '#f4c2a1' : '#d4956a';
    const hairColor = teacherGender === 'female' ? '#3d1a00' : '#1a0a00';
    const lipColor = teacherGender === 'female' ? '#c0607a' : '#8b4513';
    const shirtColor = teacherGender === 'female' ? '#6366f1' : '#1e40af';
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          border: `3px solid ${speaking ? phaseColor : 'rgba(255,255,255,0.2)'}`,
          overflow: 'hidden', position: 'relative',
          boxShadow: speaking ? `0 0 20px ${phaseColor}80` : 'none',
          transition: 'box-shadow 0.2s, border-color 0.2s',
          background: '#1a1a2e',
        }}>
          {teacher?.photo ? (
            <>
              <img src={teacher.photo} alt={teacherName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              {/* SVG viseme overlay on real photo */}
              <svg viewBox="0 0 100 100" style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%',
                pointerEvents: 'none', overflow: 'visible'
              }}>
                {/* Mouth cavity */}
                {viseme.cavity && (
                  <path d={viseme.cavity} fill="#8b2020" opacity={0.5} />
                )}
                {/* Lower lip shape */}
                <path d={`${viseme.upper} L ${viseme.lower.split(' ').slice(1).join(' ')}`}
                  fill={viseme.fill || 'none'} />
                {/* Upper lip */}
                <path d={viseme.upper} fill="none" stroke={lipColor} strokeWidth="1.2"
                  strokeLinecap="round"
                  style={{ transition: 'd 0.04s ease' }} />
                {/* Lower lip */}
                <path d={viseme.lower} fill="none" stroke={lipColor} strokeWidth="1.2"
                  strokeLinecap="round"
                  style={{ transition: 'd 0.04s ease' }} />
              </svg>
            </>
          ) : (
            // Rosto SVG completo com visemas reais
            <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
              {/* Cabeça */}
              <ellipse cx="50" cy="42" rx="22" ry="24" fill={skinColor} />
              {/* Cabelo */}
              <ellipse cx="50" cy="24" rx="22" ry="12" fill={hairColor} />
              <rect x="28" y="24" width="44" height="10" fill={hairColor} />
              {/* Sobrancelhas */}
              <path d="M 38 33 Q 42 31.5 46 33" fill="none" stroke={hairColor} strokeWidth="1.5" strokeLinecap="round" />
              <path d="M 54 33 Q 58 31.5 62 33" fill="none" stroke={hairColor} strokeWidth="1.5" strokeLinecap="round" />
              {/* Olhos */}
              <ellipse cx="42" cy="38" rx="3.5" ry="4" fill="white" />
              <ellipse cx="58" cy="38" rx="3.5" ry="4" fill="white" />
              <circle cx="42.5" cy="38.5" r="2.2" fill="#2d1b00" />
              <circle cx="58.5" cy="38.5" r="2.2" fill="#2d1b00" />
              <circle cx="43.2" cy="37.8" r="0.7" fill="white" />
              <circle cx="59.2" cy="37.8" r="0.7" fill="white" />
              {/* Nariz */}
              <path d="M 48.5 44 Q 50 47 51.5 44" fill="none" stroke="#c9956f" strokeWidth="1.2" strokeLinecap="round" />
              {/* BOCA — visemas reais sincronizados */}
              {/* Cavidade oral */}
              {viseme.cavity && (
                <path d={viseme.cavity} fill="#8b2020" opacity={0.8} />
              )}
              {/* Preenchimento da boca aberta */}
              {viseme.fill !== 'none' && (
                <path
                  d={`${viseme.upper} ${viseme.lower.replace('M', 'L')}`}
                  fill={viseme.fill}
                  style={{ transition: 'd 0.04s ease' }}
                />
              )}
              {/* Lábio superior */}
              <path d={viseme.upper} fill="none" stroke={lipColor} strokeWidth="1.4"
                strokeLinecap="round" style={{ transition: 'd 0.04s ease' }} />
              {/* Lábio inferior */}
              <path d={viseme.lower} fill="none" stroke={lipColor} strokeWidth="1.4"
                strokeLinecap="round" style={{ transition: 'd 0.04s ease' }} />
              {/* Corpo */}
              <rect x="30" y="68" width="40" height="32" rx="8" fill={shirtColor} />
              <path d="M 44 68 L 50 74 L 56 68" fill="none" stroke="white" strokeWidth="1.5" />
            </svg>
          )}
        </div>
        <span style={{ fontSize: 11, color: '#aaa' }}>{teacherName}</span>
        {speaking && (
          <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 16 }}>
            {[0.3, 0.6, 1, 0.6, 0.3].map((base, i) => (
              <div key={i} style={{
                width: 3,
                height: Math.max(3, (base + amp * 0.7) * 13),
                borderRadius: 2,
                background: phaseColor,
                transition: 'height 0.05s ease',
              }} />
            ))}
          </div>
        )}
      </div>
    );
  };

  // ── STAGE: INTRO ──────────────────────────────────────────────────────────
  if (stage === 'intro') {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', fontFamily: 'system-ui, sans-serif', background: '#0f0f1a', borderRadius: 20, overflow: 'hidden' }}>
        <Header />
        <div style={{ padding: '32px 24px', textAlign: 'center' }}>
          <TeacherAvatar speaking={false} />
          <div style={{ marginTop: 24, marginBottom: 16 }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 8 }}>
              {lesson.title}
            </div>
            <div style={{ fontSize: 14, color: '#aaa', marginBottom: 20 }}>
              {lesson.description || `Vamos aprender ${vocab.length} palavras novas hoje!`}
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: '16px 20px',
              border: `1px solid ${phaseColor}40`, marginBottom: 24, textAlign: 'left',
            }}>
              <div style={{ fontSize: 13, color: phaseColor, fontWeight: 700, marginBottom: 8 }}>📚 O que você vai aprender:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {vocab.slice(0, 6).map((v, i) => (
                  <span key={i} style={{ background: `${phaseColor}20`, color: '#fff', borderRadius: 8, padding: '4px 10px', fontSize: 13 }}>
                    {v.emoji || '📝'} {v.word}
                  </span>
                ))}
                {vocab.length > 6 && <span style={{ color: '#888', fontSize: 13 }}>+{vocab.length - 6} mais</span>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: phaseColor }}>{vocab.length}</div>
                <div style={{ fontSize: 11, color: '#888' }}>palavras</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: phaseColor }}>{exercises.length}</div>
                <div style={{ fontSize: 11, color: '#888' }}>exercícios</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: phaseColor }}>{vocab.length * 15}</div>
                <div style={{ fontSize: 11, color: '#888' }}>XP possível</div>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              // Unlock AudioContext on user gesture (browser autoplay policy)
              try {
                const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                if (ctx.state === 'suspended') ctx.resume();
                // Play silent buffer to unlock audio
                const buf = ctx.createBuffer(1, 1, 22050);
                const src = ctx.createBufferSource();
                src.buffer = buf;
                src.connect(ctx.destination);
                src.start(0);
              } catch {}
              setStage('vocab');
            }}
            style={{
              width: '100%', background: `linear-gradient(135deg, ${phaseColor}, ${phaseColor}cc)`,
              border: 'none', borderRadius: 14, padding: '16px', color: '#fff',
              fontWeight: 800, fontSize: 18, cursor: 'pointer',
              boxShadow: `0 4px 20px ${phaseColor}60`,
              transition: 'transform 0.1s',
            }}
            onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
            onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            🚀 Começar com o Professor!
          </button>
        </div>
      </div>
    );
  }

  // ── STAGE: VOCAB (Professor apresenta cada palavra) ───────────────────────
  if (stage === 'vocab') {
    const currentVocab = vocab[vocabIndex];
    if (!currentVocab) return null;
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', fontFamily: 'system-ui, sans-serif', background: '#0f0f1a', borderRadius: 20, overflow: 'hidden' }}>
        <Header />
        <div style={{ padding: '20px 16px' }}>
          {/* Teacher + word card side by side */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 16 }}>
            <TeacherAvatar speaking={isSpeaking} />
            {/* Teacher speech bubble */}
            <div style={{
              flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: '0 16px 16px 16px',
              padding: '12px 14px', border: `1px solid ${phaseColor}30`,
              fontSize: 14, color: '#ddd', lineHeight: 1.5,
              minHeight: 60,
            }}>
              {introLoaded ? teacherIntro : (
                <span style={{ color: '#666' }}>
                  <span style={{ animation: 'pulse 1s infinite' }}>💭</span> Preparando explicação...
                </span>
              )}
            </div>
          </div>

          {/* Main word card */}
          <div style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            borderRadius: 20, padding: '28px 20px', textAlign: 'center',
            boxShadow: `0 8px 32px ${phaseColor}40`,
            border: `2px solid ${phaseColor}40`,
            marginBottom: 16,
          }}>
            <div style={{ fontSize: 72, marginBottom: 8 }}>{currentVocab.emoji || '📚'}</div>
            <div style={{ fontSize: 40, fontWeight: 900, color: '#fff', marginBottom: 4 }}>
              {currentVocab.word}
            </div>
            {currentVocab.phonetic && (
              <div style={{ marginBottom: 12 }}>
                <span style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>como pronunciar</span>
                <div style={{ fontSize: 22, color: '#FFD700', fontWeight: 700, fontStyle: 'italic', marginTop: 2 }}>
                  "{currentVocab.phonetic}"
                </div>
              </div>
            )}
            <div style={{ fontSize: 20, color: '#aaa', marginBottom: 16 }}>
              = <strong style={{ color: '#fff' }}>{currentVocab.translation}</strong>
            </div>
            {/* Speak + Mic buttons */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'center' }}>
              <button
                onClick={() => speakWord(currentVocab.word)}
                style={{
                  background: phaseColor, border: 'none', borderRadius: 50,
                  width: 56, height: 56, fontSize: 24, cursor: 'pointer',
                  transition: 'transform 0.1s, box-shadow 0.1s',
                  boxShadow: `0 4px 16px ${phaseColor}60`,
                }}
                onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.9)')}
                onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                title="Ouvir pronúncia"
              >
                🔊
              </button>
              <button
                onClick={() => { setPronScore(null); setPronHeard(''); handlePronunciationCheck(currentVocab.word); }}
                disabled={isRecordingPron}
                style={{
                  background: isRecordingPron ? '#e17055' : 'rgba(255,255,255,0.1)',
                  border: `2px solid ${isRecordingPron ? '#e17055' : 'rgba(255,255,255,0.3)'}`,
                  borderRadius: 50, width: 56, height: 56, fontSize: 24, cursor: 'pointer',
                  transition: 'all 0.2s',
                  animation: isRecordingPron ? 'pulse 1s infinite' : 'none',
                  boxShadow: isRecordingPron ? '0 0 20px #e1705580' : 'none',
                }}
                title={isRecordingPron ? 'Ouvindo...' : 'Testar pronúncia'}
              >
                {isRecordingPron ? '🔴' : '🎤'}
              </button>
            </div>
            {/* Pronunciation result */}
            {pronScore !== null && (
              <div style={{
                marginTop: 12, padding: '10px 16px', borderRadius: 12,
                background: pronScore >= 80 ? 'rgba(0,184,148,0.2)' : pronScore >= 50 ? 'rgba(253,203,110,0.2)' : 'rgba(214,48,49,0.2)',
                border: `1px solid ${pronScore >= 80 ? '#00b894' : pronScore >= 50 ? '#fdcb6e' : '#d63031'}`,
              }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: pronScore >= 80 ? '#00b894' : pronScore >= 50 ? '#fdcb6e' : '#d63031' }}>
                  {pronScore >= 80 ? '🎉' : pronScore >= 50 ? '👍' : '💪'} {pronScore}%
                </div>
                {pronHeard && <div style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>Você disse: "{pronHeard}"</div>}
                <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                  {pronScore >= 80 ? 'Pronúncia excelente! +15 XP' : pronScore >= 50 ? 'Quase lá! Continue praticando!' : 'Tente novamente — ouça e repita!'}
                </div>
              </div>
            )}
          </div>

          {/* Example sentence */}
          {currentVocab.example && (
            <div style={{
              background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: '14px 16px',
              border: `1px solid rgba(255,255,255,0.08)`, marginBottom: 16,
            }}>
              <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
                📖 exemplo
              </div>
              <div style={{ fontSize: 16, color: '#fff', fontStyle: 'italic', marginBottom: 4 }}>
                "{currentVocab.example}"
              </div>
              {currentVocab.exampleTranslation && (
                <div style={{ fontSize: 13, color: '#aaa' }}>{currentVocab.exampleTranslation}</div>
              )}
              {currentVocab.examplePhonetic && (
                <div style={{ fontSize: 12, color: '#FFD700', marginTop: 4 }}>
                  🗣 {currentVocab.examplePhonetic}
                </div>
              )}
              <button
                onClick={() => speakWord(currentVocab.example!)}
                style={{ background: 'transparent', border: `1px solid ${phaseColor}60`, borderRadius: 8, padding: '4px 10px', color: phaseColor, fontSize: 12, cursor: 'pointer', marginTop: 8 }}
              >
                🔊 Ouvir frase
              </button>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#888', flex: 1 }}>
              {vocabIndex + 1} / {vocab.length}
            </span>
            {vocabIndex > 0 && (
              <button
                onClick={() => { stopEdgeTTS(); setVocabIndex(v => v - 1); }}
                style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 10, padding: '10px 16px', color: '#aaa', cursor: 'pointer', fontSize: 14 }}
              >
                ← Anterior
              </button>
            )}
            <button
              onClick={handleVocabNext}
              style={{
                flex: 1, background: phaseColor, border: 'none', borderRadius: 12,
                padding: '14px', color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer',
                transition: 'transform 0.1s',
              }}
              onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
              onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {vocabIndex < vocab.length - 1 ? 'Próxima Palavra →' : '✏️ Praticar!'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── STAGE: PRACTICE (Quiz gamificado) ─────────────────────────────────────
  if (stage === 'practice') {
    const ex = exercises[exerciseIndex];
    if (!ex) return null;
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', fontFamily: 'system-ui, sans-serif', background: '#0f0f1a', borderRadius: 20, overflow: 'hidden' }}>
        <Header />
        <div style={{ padding: '20px 16px' }}>
          {/* Teacher feedback bubble */}
          {showFeedback && (
            <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'flex-start' }}>
              <TeacherAvatar speaking={isSpeaking} />
              <div style={{
                flex: 1, background: isCorrect ? 'rgba(0,184,148,0.15)' : 'rgba(214,48,49,0.15)',
                borderRadius: '0 16px 16px 16px', padding: '12px 14px',
                border: `1px solid ${isCorrect ? '#00b894' : '#d63031'}`,
                fontSize: 14, color: '#fff',
              }}>
                {feedbackText}
              </div>
            </div>
          )}

          {/* Exercise card */}
          <div style={{
            background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
            borderRadius: 20, padding: '24px 20px',
            border: `2px solid ${phaseColor}30`, marginBottom: 16,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 12, color: '#888' }}>Exercício {exerciseIndex + 1}/{exercises.length}</span>
              {streak >= 3 && <span style={{ fontSize: 13, color: '#FF9F43', fontWeight: 700 }}>🔥 {streak}x combo!</span>}
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 20, textAlign: 'center' }}>
              {ex.emoji && <span style={{ marginRight: 8 }}>{ex.emoji}</span>}
              {ex.question}
            </div>
            {ex.hint && (
              <div style={{ fontSize: 12, color: '#888', textAlign: 'center', marginBottom: 12 }}>
                💡 {ex.hint}
              </div>
            )}
            {/* Multiple choice */}
            {ex.options && ex.options.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {shuffledOptions.map((opt, i) => {
                  const isSelected = selectedAnswer === opt;
                  const isRight = isSelected && isCorrect;
                  const isWrong = isSelected && !isCorrect;
                  const isCorrectUnselected = selectedAnswer !== null && opt === ex.answer && !isSelected;
                  return (
                    <button
                      key={i}
                      onClick={() => handleAnswerSelect(opt)}
                      disabled={selectedAnswer !== null}
                      style={{
                        padding: '14px 10px', borderRadius: 12,
                        border: `2px solid ${isRight ? '#00b894' : isWrong ? '#d63031' : isCorrectUnselected ? '#00b894' : 'rgba(255,255,255,0.15)'}`,
                        background: isRight ? '#00b89420' : isWrong ? '#d6303120' : isCorrectUnselected ? '#00b89420' : 'rgba(255,255,255,0.05)',
                        color: '#fff', fontSize: 15, fontWeight: 600,
                        cursor: selectedAnswer === null ? 'pointer' : 'default',
                        transition: 'all 0.2s',
                        transform: isSelected ? 'scale(0.97)' : 'scale(1)',
                      }}
                    >
                      {isRight ? '✅ ' : isWrong ? '❌ ' : isCorrectUnselected ? '✅ ' : ''}{opt}
                    </button>
                  );
                })}
              </div>
            ) : (
              /* Text input for fill-blank */
              <div>
                <input
                  type="text"
                  placeholder="Digite sua resposta..."
                  disabled={selectedAnswer !== null}
                  onKeyDown={e => { if (e.key === 'Enter') handleAnswerSelect((e.target as HTMLInputElement).value); }}
                  style={{
                    width: '100%', padding: '14px 16px', borderRadius: 12,
                    border: `2px solid ${phaseColor}60`, background: 'rgba(255,255,255,0.05)',
                    color: '#fff', fontSize: 16, outline: 'none', boxSizing: 'border-box',
                  }}
                />
                {selectedAnswer === null && (
                  <button
                    onClick={() => {
                      const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                      if (input) handleAnswerSelect(input.value);
                    }}
                    style={{ marginTop: 10, width: '100%', background: phaseColor, border: 'none', borderRadius: 10, padding: '12px', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Confirmar →
                  </button>
                )}
              </div>
            )}
          </div>

          {selectedAnswer !== null && (
            <button
              onClick={handleExerciseNext}
              style={{
                width: '100%', background: phaseColor, border: 'none', borderRadius: 12,
                padding: '14px', color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer',
              }}
            >
              {exerciseIndex < exercises.length - 1 ? 'Próximo →' : '💬 Conversar com o Professor!'}
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── STAGE: CHAT (Conversa com o professor) ────────────────────────────────
  if (stage === 'chat') {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', fontFamily: 'system-ui, sans-serif', background: '#0f0f1a', borderRadius: 20, overflow: 'hidden' }}>
        <Header />
        <div style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <TeacherAvatar speaking={isSpeaking} />
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Conversa com {teacherName}</div>
              <div style={{ fontSize: 12, color: '#888' }}>Pratique o que aprendeu! Pergunte qualquer coisa.</div>
            </div>
          </div>

          {/* Chat messages */}
          <div style={{
            height: 280, overflowY: 'auto', marginBottom: 12,
            display: 'flex', flexDirection: 'column', gap: 10,
            padding: '8px 4px',
          }}>
            {chatHistory.length === 0 && (
              <div style={{ textAlign: 'center', color: '#666', fontSize: 14, padding: '40px 0' }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>💬</div>
                Comece uma conversa! Tente usar as palavras que aprendeu.
                <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
                  {['Como se diz "obrigado"?', 'Pode repetir?', 'O que significa essa palavra?'].map(s => (
                    <button
                      key={s}
                      onClick={() => setChatInput(s)}
                      style={{ background: `${phaseColor}20`, border: `1px solid ${phaseColor}40`, borderRadius: 20, padding: '6px 12px', color: phaseColor, fontSize: 12, cursor: 'pointer' }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {chatHistory.map((msg, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                gap: 8, alignItems: 'flex-end',
              }}>
                {msg.role === 'assistant' && (
                  <div style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                    {teacher?.photo ? (
                      <img src={teacher.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: phaseColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                        {teacherGender === 'female' ? '👩‍🏫' : '👨‍🏫'}
                      </div>
                    )}
                  </div>
                )}
                <div style={{
                  maxWidth: '75%', padding: '10px 14px', borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: msg.role === 'user' ? phaseColor : 'rgba(255,255,255,0.08)',
                  color: '#fff', fontSize: 14, lineHeight: 1.5,
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {teacherChatMutation.isPending && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: phaseColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                  {teacherGender === 'female' ? '👩‍🏫' : '👨‍🏫'}
                </div>
                <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '16px 16px 16px 4px', padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[0,1,2].map(i => (
                      <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#888', animation: `bounce 1s ${i * 0.2}s infinite` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat input */}
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleChatSend(); }}
              placeholder="Digite sua mensagem..."
              style={{
                flex: 1, padding: '12px 14px', borderRadius: 12,
                border: `2px solid ${phaseColor}40`, background: 'rgba(255,255,255,0.05)',
                color: '#fff', fontSize: 14, outline: 'none',
              }}
            />
            <button
              onClick={handleChatSend}
              disabled={!chatInput.trim() || teacherChatMutation.isPending}
              style={{
                background: phaseColor, border: 'none', borderRadius: 12,
                width: 48, height: 48, fontSize: 20, cursor: 'pointer',
                opacity: !chatInput.trim() ? 0.5 : 1,
              }}
            >
              ➤
            </button>
          </div>

          <button
            onClick={() => setStage('srs')}
            style={{
              width: '100%', marginTop: 12, background: 'rgba(255,255,255,0.08)',
              border: `1px solid ${phaseColor}40`, borderRadius: 12, padding: '12px',
              color: phaseColor, fontWeight: 700, fontSize: 14, cursor: 'pointer',
            }}
          >
            🃏 Revisar com Flashcards SRS →
          </button>
        </div>
      </div>
    );
  }

  // ── STAGE: SRS FLASHCARDS ─────────────────────────────────────────────────
  if (stage === 'srs') {
    const word = srsWords[srsIndex];
    if (!word) return null;
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', fontFamily: 'system-ui, sans-serif', background: '#0f0f1a', borderRadius: 20, overflow: 'hidden' }}>
        <Header />
        <div style={{ padding: '20px 16px' }}>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>🃏 Revisão com Repetição Espaçada</div>
            <div style={{ fontSize: 12, color: '#888' }}>Cartão {srsIndex + 1} de {srsWords.length}</div>
          </div>

          {/* Flashcard */}
          <div
            onClick={() => !srsAnswered && setSrsFlipped(f => !f)}
            style={{
              background: srsFlipped
                ? `linear-gradient(135deg, ${phaseColor}30, ${phaseColor}10)`
                : 'linear-gradient(135deg, #1a1a2e, #16213e)',
              borderRadius: 24, padding: '48px 24px', textAlign: 'center',
              border: `2px solid ${phaseColor}${srsFlipped ? '80' : '30'}`,
              cursor: srsAnswered ? 'default' : 'pointer',
              transition: 'all 0.3s',
              marginBottom: 20, minHeight: 200,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 8px 32px ${phaseColor}30`,
            }}
          >
            {!srsFlipped ? (
              <>
                <div style={{ fontSize: 64, marginBottom: 12 }}>{word.emoji || '📚'}</div>
                <div style={{ fontSize: 36, fontWeight: 900, color: '#fff', marginBottom: 8 }}>{word.word}</div>
                {word.phonetic && (
                  <div style={{ fontSize: 18, color: '#FFD700', fontStyle: 'italic' }}>"{word.phonetic}"</div>
                )}
                <div style={{ fontSize: 13, color: '#666', marginTop: 16 }}>👆 Toque para ver a tradução</div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 28, color: '#fff', fontWeight: 700, marginBottom: 8 }}>{word.translation}</div>
                {word.example && (
                  <div style={{ fontSize: 14, color: '#aaa', fontStyle: 'italic', marginTop: 8 }}>
                    "{word.example}"
                  </div>
                )}
                <button
                  onClick={e => { e.stopPropagation(); speakWord(word.word); }}
                  style={{ marginTop: 16, background: phaseColor, border: 'none', borderRadius: 20, padding: '8px 16px', color: '#fff', fontSize: 13, cursor: 'pointer' }}
                >
                  🔊 Ouvir
                </button>
              </>
            )}
          </div>

          {/* Answer buttons (only after flip) */}
          {srsFlipped && !srsAnswered && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
              <button
                onClick={() => handleSrsAnswer(1)}
                style={{ background: '#d6303120', border: '2px solid #d63031', borderRadius: 12, padding: '12px 8px', color: '#ff7675', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}
              >
                😕 Difícil
              </button>
              <button
                onClick={() => handleSrsAnswer(3)}
                style={{ background: '#fdcb6e20', border: '2px solid #fdcb6e', borderRadius: 12, padding: '12px 8px', color: '#fdcb6e', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}
              >
                🤔 Ok
              </button>
              <button
                onClick={() => handleSrsAnswer(5)}
                style={{ background: '#00b89420', border: '2px solid #00b894', borderRadius: 12, padding: '12px 8px', color: '#00b894', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}
              >
                😄 Fácil!
              </button>
            </div>
          )}

          {srsAnswered && (
            <button
              onClick={handleSrsNext}
              style={{ width: '100%', background: phaseColor, border: 'none', borderRadius: 12, padding: '14px', color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}
            >
              {srsIndex < srsWords.length - 1 ? 'Próximo Cartão →' : '🏆 Concluir Lição!'}
            </button>
          )}

          {!srsFlipped && (
            <div style={{ textAlign: 'center', fontSize: 12, color: '#666', marginTop: 8 }}>
              Toque no cartão para revelar a tradução
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── STAGE: COMPLETE ───────────────────────────────────────────────────────
  if (stage === 'complete') {
    const maxXp = vocab.length * 15 + exercises.length * 10;
    const pct = Math.round((xp / Math.max(maxXp, 1)) * 100);
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', fontFamily: 'system-ui, sans-serif', background: '#0f0f1a', borderRadius: 20, overflow: 'hidden' }}>
        <Header />
        <div style={{ padding: '32px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 80, marginBottom: 16 }}>
            {pct >= 80 ? '🏆' : pct >= 60 ? '🎉' : '💪'}
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 8 }}>
            {pct >= 80 ? 'Excelente!' : pct >= 60 ? 'Muito Bem!' : 'Continue Praticando!'}
          </div>
          <div style={{ fontSize: 15, color: '#aaa', marginBottom: 24 }}>
            Você completou a lição "{lesson.title}"!
          </div>
          <div style={{
            background: `linear-gradient(135deg, ${phaseColor}30, ${phaseColor}10)`,
            borderRadius: 20, padding: '24px', marginBottom: 24,
            border: `2px solid ${phaseColor}40`,
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <div>
                <div style={{ fontSize: 32, fontWeight: 800, color: phaseColor }}>⚡{xp}</div>
                <div style={{ fontSize: 12, color: '#888' }}>XP ganho</div>
              </div>
              <div>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#00b894' }}>{totalCorrect}</div>
                <div style={{ fontSize: 12, color: '#888' }}>acertos</div>
              </div>
              <div>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#FFD700' }}>{pct}%</div>
                <div style={{ fontSize: 12, color: '#888' }}>pontuação</div>
              </div>
            </div>
          </div>
          {lesson.culturalNote && (
            <div style={{
              background: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: '14px 16px',
              marginBottom: 20, textAlign: 'left', fontSize: 13, color: '#bbb',
              borderLeft: `3px solid ${phaseColor}`,
            }}>
              🌍 <strong>Curiosidade cultural:</strong> {lesson.culturalNote}
            </div>
          )}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => { setStage('srs'); setSrsIndex(0); setSrsFlipped(false); setSrsAnswered(false); }}
              style={{ flex: 1, background: 'rgba(255,255,255,0.08)', border: `1px solid ${phaseColor}40`, borderRadius: 12, padding: '14px', color: phaseColor, fontWeight: 700, cursor: 'pointer' }}
            >
              🔄 Revisar
            </button>
            <button
              onClick={() => onComplete?.(totalCorrect, xp)}
              style={{ flex: 2, background: phaseColor, border: 'none', borderRadius: 12, padding: '14px', color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}
            >
              Próxima Lição →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── STAGE: CARTILHA (Perguntas por ambiente) ─────────────────────────────
  if (stage === 'cartilha') {
    const letter = detectedLetter || 'A';
    if (!cartilhaEnv) {
      return (
        <div style={{ maxWidth: 480, margin: '0 auto', fontFamily: 'system-ui, sans-serif', background: '#0f0f1a', borderRadius: 20, overflow: 'hidden' }}>
          <Header />
          <div style={{ padding: '24px 16px' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 20 }}>
              <TeacherAvatar speaking={false} />
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: '0 16px 16px 16px', padding: '12px 14px', border: `1px solid ${phaseColor}30`, fontSize: 15, color: '#fff', lineHeight: 1.5 }}>
                Agora vamos descobrir o que tem com a letra <strong style={{ color: phaseColor, fontSize: 22 }}>{letter}</strong> em diferentes lugares! Escolha um ambiente:
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {ENVIRONMENTS.map(env => (
                <button
                  key={env.id}
                  onClick={() => {
                    setCartilhaEnv(env.id);
                    cartilhaQuestionMutation.mutate(
                      { letter, environment: env.labelEn, targetLanguage: languageCode, phase },
                      {
                        onSuccess: (data) => setCartilhaData(data),
                        onError: () => setCartilhaData({ question: 'O que tem com a letra ' + letter + ' na ' + env.label + '?', questionInTarget: 'What has letter ' + letter + ' in the ' + env.labelEn + '?', words: [], teacherIntro: 'Vamos explorar!', celebration: 'Incrivel!' }),
                      }
                    );
                  }}
                  style={{ background: 'rgba(255,255,255,0.06)', border: `2px solid ${phaseColor}40`, borderRadius: 16, padding: '20px 12px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: '#fff' }}
                >
                  <span style={{ fontSize: 36 }}>{env.emoji}</span>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>{env.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }
    const envInfo = ENVIRONMENTS.find(e => e.id === cartilhaEnv);
    const isLoadingCartilha = cartilhaQuestionMutation.isPending;
    const words = cartilhaData?.words || [];
    const currentWord = words[cartilhaWordIndex];
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', fontFamily: 'system-ui, sans-serif', background: '#0f0f1a', borderRadius: 20, overflow: 'hidden' }}>
        <Header />
        <div style={{ padding: '20px 16px' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 16 }}>
            <TeacherAvatar speaking={isSpeaking} />
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: '0 16px 16px 16px', padding: '12px 14px', border: `1px solid ${phaseColor}30`, fontSize: 14, color: '#ddd', lineHeight: 1.5 }}>
              {isLoadingCartilha ? '💭 Preparando palavras...' : (cartilhaData?.teacherIntro || 'Vamos explorar!')}
            </div>
          </div>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 18, color: phaseColor, fontWeight: 800 }}>{envInfo?.emoji} {envInfo?.label} — Letra <span style={{ fontSize: 28 }}>{letter}</span></div>
            <div style={{ fontSize: 13, color: '#888' }}>{cartilhaData?.question}</div>
          </div>
          {isLoadingCartilha ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>🔍 Buscando palavras com a letra {letter}...</div>
          ) : words.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🤔</div>
              <div style={{ color: '#aaa', marginBottom: 20 }}>Nenhuma palavra encontrada. Tente outro ambiente!</div>
              <button onClick={() => { setCartilhaEnv(null); setCartilhaData(null); }} style={{ background: phaseColor, border: 'none', borderRadius: 12, padding: '12px 24px', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>← Escolher outro</button>
            </div>
          ) : currentWord ? (
            <div>
              <div style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)', borderRadius: 20, padding: '28px 20px', textAlign: 'center', border: `2px solid ${phaseColor}40`, marginBottom: 16, boxShadow: `0 8px 32px ${phaseColor}30` }}>
                <div style={{ fontSize: 64, marginBottom: 8 }}>{currentWord.emoji || '📝'}</div>
                <div style={{ fontSize: 36, fontWeight: 900, color: '#fff', marginBottom: 4 }}>{currentWord.word}</div>
                {currentWord.phonetic && <div style={{ fontSize: 18, color: '#FFD700', fontStyle: 'italic', marginBottom: 8 }}>'{currentWord.phonetic}'</div>}
                <div style={{ fontSize: 18, color: '#aaa' }}>= <strong style={{ color: '#fff' }}>{currentWord.translation}</strong></div>
                {currentWord.hint && <div style={{ fontSize: 13, color: '#888', marginTop: 8, fontStyle: 'italic' }}>{currentWord.hint}</div>}
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16 }}>
                  <button onClick={() => speakWord(currentWord.word)} style={{ background: phaseColor, border: 'none', borderRadius: 50, width: 52, height: 52, fontSize: 22, cursor: 'pointer' }}>🔊</button>
                  <button onClick={() => handlePronunciationCheck(currentWord.word)} disabled={isRecordingPron} style={{ background: isRecordingPron ? '#e17055' : 'rgba(255,255,255,0.1)', border: `2px solid ${isRecordingPron ? '#e17055' : 'rgba(255,255,255,0.3)'}`, borderRadius: 50, width: 52, height: 52, fontSize: 22, cursor: 'pointer' }}>{isRecordingPron ? '🔴' : '🎤'}</button>
                </div>
                {pronScore !== null && <div style={{ marginTop: 10, padding: '8px 14px', borderRadius: 10, background: pronScore >= 80 ? 'rgba(0,184,148,0.2)' : 'rgba(253,203,110,0.2)', fontSize: 16, fontWeight: 800, color: pronScore >= 80 ? '#00b894' : '#fdcb6e' }}>{pronScore >= 80 ? '🎉' : '👍'} {pronScore}%</div>}
                {microphoneIssue && (
                  <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 10, background: 'rgba(214,48,49,0.16)', border: '1px solid rgba(255,118,117,0.65)', color: '#ffecec', fontSize: 13, lineHeight: 1.45 }}>
                    <div>🎙️ {microphoneIssue}</div>
                    <button onClick={() => handlePronunciationCheck(currentWord.word)} style={{ marginTop: 8, background: '#fff', color: '#2d3436', border: 'none', borderRadius: 8, padding: '6px 10px', fontWeight: 700, cursor: 'pointer' }}>Tentar microfone novamente</button>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: '#888', flex: 1 }}>{cartilhaWordIndex + 1} / {words.length}</span>
                {cartilhaWordIndex > 0 && <button onClick={() => { setCartilhaWordIndex(i => i - 1); setPronScore(null); }} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 10, padding: '10px 16px', color: '#aaa', cursor: 'pointer' }}>← Anterior</button>}
                <button
                  onClick={() => {
                    addXp(8);
                    setPronScore(null);
                    if (cartilhaWordIndex < words.length - 1) setCartilhaWordIndex(i => i + 1);
                    else setStage('practice');
                  }}
                  style={{ flex: 1, background: phaseColor, border: 'none', borderRadius: 12, padding: '14px', color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}
                >
                  {cartilhaWordIndex < words.length - 1 ? 'Próxima Palavra →' : '✏️ Praticar!'}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 20 }}>
              <div style={{ fontSize: 48 }}>🎉</div>
              <div style={{ color: '#fff', fontSize: 18, fontWeight: 700, marginBottom: 16 }}>{cartilhaData?.celebration || 'Incrível!'}</div>
              <button onClick={() => setStage('practice')} style={{ background: phaseColor, border: 'none', borderRadius: 12, padding: '14px 28px', color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>✏️ Praticar!</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── STAGE: NANO BANANA (Phase completion celebration) ─────────────────────
  if (stage === 'nanoBanana') {
    const maxXp2 = vocab.length * 15 + exercises.length * 10;
    const pct2 = Math.round((xp / Math.max(maxXp2, 1)) * 100);
    const BANANA_COLORS = ['#FFD700', '#FF9F43', '#FF6B6B', '#48DBFB', '#A29BFE', '#00B894', '#FD79A8', '#FDCB6E'];
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', fontFamily: 'system-ui, sans-serif', background: 'linear-gradient(135deg, #1a0533 0%, #0d1b2a 50%, #0a2a1a 100%)', borderRadius: 20, overflow: 'hidden', position: 'relative' }}>
        <style>{`
          @keyframes fall0 { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(20px) rotate(180deg)} }
          @keyframes fall1 { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-15px) rotate(-120deg)} }
          @keyframes fall2 { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(25px) rotate(90deg)} }
          @keyframes bounceInBanana { 0%{transform:scale(0.3);opacity:0} 60%{transform:scale(1.15)} 80%{transform:scale(0.95)} 100%{transform:scale(1);opacity:1} }
          @keyframes shimmerBanana { 0%,100%{opacity:1} 50%{opacity:0.6} }
        `}</style>
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} style={{ position: 'absolute', top: (i * 23 % 100) + '%', left: (i * 17 % 100) + '%', width: 10 + (i % 5) * 3, height: 10 + (i % 5) * 3, borderRadius: i % 2 === 0 ? '50%' : '3px', background: BANANA_COLORS[i % BANANA_COLORS.length], opacity: 0.6, animation: `fall${i % 3} ${1.5 + (i % 3) * 0.7}s ease-in-out infinite`, pointerEvents: 'none', zIndex: 0 }} />
        ))}
        <div style={{ position: 'relative', zIndex: 1, padding: '40px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 100, marginBottom: 8, animation: 'bounceInBanana 0.8s ease forwards' }}>🍌</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#FFD700', marginBottom: 8, textShadow: '0 0 20px #FFD70080', animation: 'shimmerBanana 2s ease infinite' }}>NANO BANANA!</div>
          <div style={{ fontSize: 18, color: '#fff', marginBottom: 4 }}>Fase Concluída! 🎊</div>
          <div style={{ fontSize: 14, color: '#aaa', marginBottom: 28 }}>Você completou a lição "{lesson.title}"!</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 28 }}>
            {[{ icon: '⚡', value: xp + ' XP', label: 'ganho' }, { icon: '✅', value: String(totalCorrect), label: 'acertos' }, { icon: '🎯', value: pct2 + '%', label: 'pontuação' }].map((stat, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: '16px 8px', border: '1px solid rgba(255,255,255,0.15)' }}>
                <div style={{ fontSize: 28 }}>{stat.icon}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#FFD700' }}>{stat.value}</div>
                <div style={{ fontSize: 11, color: '#888' }}>{stat.label}</div>
              </div>
            ))}
          </div>
          <div style={{ background: 'rgba(255,215,0,0.1)', borderRadius: 16, padding: '16px', marginBottom: 24, border: '1px solid rgba(255,215,0,0.3)' }}>
            <div style={{ fontSize: 14, color: '#FFD700', fontWeight: 700, marginBottom: 4 }}>🌟 Próximo desafio:</div>
            <div style={{ fontSize: 13, color: '#ddd' }}>Cena de Família — aprenda vocabulário com uma família real!</div>
          </div>
          <button
            onClick={handleNanoBananaNext}
            disabled={familiaGenerateMutation.isPending}
            style={{ width: '100%', background: 'linear-gradient(135deg, #FFD700, #FF9F43)', border: 'none', borderRadius: 16, padding: '18px', color: '#000', fontWeight: 900, fontSize: 18, cursor: 'pointer', boxShadow: '0 4px 24px rgba(255,215,0,0.5)' }}
          >
            {familiaGenerateMutation.isPending ? '⏳ Preparando...' : '👨‍👩‍👧‍👦 Conhecer a Família!'}
          </button>
          <button onClick={() => { setStage('complete'); onComplete?.(totalCorrect, xp); }} style={{ marginTop: 12, background: 'transparent', border: 'none', color: '#888', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}>Pular → Próxima Lição</button>
        </div>
      </div>
    );
  }

  // ── STAGE: FAMILIA (Family scene with photo, questions, vocab, memory game) ─
  if (stage === 'familia') {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', fontFamily: 'system-ui, sans-serif', background: '#0f0f1a', borderRadius: 20, overflow: 'hidden' }}>
        <Header />
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          {(['photo', 'questions', 'vocab', 'memory'] as const).map(tab => (
            <button key={tab} onClick={() => setFamiliaSubStage(tab)} style={{ flex: 1, background: familiaSubStage === tab ? `${phaseColor}20` : 'transparent', border: 'none', borderBottom: familiaSubStage === tab ? `2px solid ${phaseColor}` : '2px solid transparent', color: familiaSubStage === tab ? phaseColor : '#888', padding: '10px 4px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
              {tab === 'photo' ? '📸 Foto' : tab === 'questions' ? '❓ Quiz' : tab === 'vocab' ? '📚 Vocab' : '🧠 Memória'}
            </button>
          ))}
        </div>
        <div style={{ padding: '16px' }}>
          {familiaSubStage === 'photo' && (
            <div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 16 }}>
                <TeacherAvatar speaking={isSpeaking} />
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: '0 16px 16px 16px', padding: '12px 14px', border: `1px solid ${phaseColor}30`, fontSize: 14, color: '#ddd', lineHeight: 1.5 }}>
                  {familiaImageLoading ? '💭 Preparando a cena de família...' : (familiaGenerateMutation.data?.teacherIntro || 'Vamos conhecer esta família!')}
                </div>
              </div>
              {familiaImageLoading ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#888' }}><div style={{ fontSize: 48, marginBottom: 12 }}>👨‍👩‍👧‍👦</div><div>Gerando imagem da família...</div></div>
              ) : familiaImageUrl ? (
                <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 16, border: `2px solid ${phaseColor}40` }}><img src={familiaImageUrl} alt="Family scene" style={{ width: '100%', display: 'block' }} /></div>
              ) : (
                <div style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)', borderRadius: 16, padding: '48px 24px', textAlign: 'center', marginBottom: 16, border: `2px solid ${phaseColor}40` }}><div style={{ fontSize: 80 }}>👨‍👩‍👧‍👦</div><div style={{ fontSize: 16, color: '#aaa', marginTop: 12 }}>Família feliz reunida em casa</div></div>
              )}
              <button onClick={() => setFamiliaSubStage('questions')} style={{ width: '100%', background: phaseColor, border: 'none', borderRadius: 12, padding: '14px', color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>❓ Responder Perguntas →</button>
            </div>
          )}
          {familiaSubStage === 'questions' && (
            <div>
              {familiaQIndex >= familiaQuestions.length ? (
                <div style={{ textAlign: 'center', padding: 32 }}><div style={{ fontSize: 64 }}>🎉</div><div style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 8 }}>Perguntas concluídas!</div><button onClick={() => setFamiliaSubStage('vocab')} style={{ background: phaseColor, border: 'none', borderRadius: 12, padding: '14px 28px', color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>📚 Ver Vocabulário →</button></div>
              ) : (() => {
                const q = familiaQuestions[familiaQIndex];
                return (
                  <div>
                    <div style={{ fontSize: 13, color: '#888', marginBottom: 12 }}>Pergunta {familiaQIndex + 1} de {familiaQuestions.length}</div>
                    <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: '20px', marginBottom: 16, fontSize: 16, color: '#fff', fontWeight: 600, border: `1px solid ${phaseColor}30` }}>{q.question}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                      {q.options.map((opt, i) => {
                        const isSelected = familiaSelected === opt;
                        const isRight = opt === q.answer;
                        const showResult = familiaSelected !== null;
                        return (
                          <button key={i} onClick={() => { if (familiaSelected) return; setFamiliaSelected(opt); setFamiliaCorrect(opt === q.answer); if (opt === q.answer) { addXp(15); setStreak(s => s + 1); } else setStreak(0); speakWord(opt); }} style={{ background: showResult ? (isRight ? 'rgba(0,184,148,0.3)' : isSelected ? 'rgba(214,48,49,0.3)' : 'rgba(255,255,255,0.05)') : 'rgba(255,255,255,0.06)', border: `2px solid ${showResult ? (isRight ? '#00b894' : isSelected ? '#d63031' : 'rgba(255,255,255,0.1)') : phaseColor + '40'}`, borderRadius: 12, padding: '14px 10px', color: '#fff', fontWeight: 600, cursor: familiaSelected ? 'default' : 'pointer', fontSize: 14 }}>
                            {isRight && showResult ? '✅ ' : isSelected && !isRight ? '❌ ' : ''}{opt}
                          </button>
                        );
                      })}
                    </div>
                    {familiaSelected && <button onClick={() => { setFamiliaQIndex(i => i + 1); setFamiliaSelected(null); setFamiliaCorrect(null); }} style={{ width: '100%', background: phaseColor, border: 'none', borderRadius: 12, padding: '14px', color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>{familiaQIndex < familiaQuestions.length - 1 ? 'Próxima →' : '📚 Ver Vocabulário →'}</button>}
                  </div>
                );
              })()}
            </div>
          )}
          {familiaSubStage === 'vocab' && (
            <div>
              {familiaVocab.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>Carregando vocabulário...</div>
              ) : (() => {
                const v = familiaVocab[familiaVocabIndex];
                return (
                  <div>
                    <div style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)', borderRadius: 20, padding: '28px 20px', textAlign: 'center', border: `2px solid ${phaseColor}40`, marginBottom: 16 }}>
                      <div style={{ fontSize: 64, marginBottom: 8 }}>{v.emoji || '👨‍👩‍👧‍👦'}</div>
                      <div style={{ fontSize: 36, fontWeight: 900, color: '#fff', marginBottom: 4 }}>{v.word}</div>
                      <div style={{ fontSize: 20, color: '#aaa' }}>= <strong style={{ color: '#fff' }}>{v.translation}</strong></div>
                      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16 }}>
                        <button onClick={() => speakWord(v.word)} style={{ background: phaseColor, border: 'none', borderRadius: 50, width: 52, height: 52, fontSize: 22, cursor: 'pointer' }}>🔊</button>
                        <button onClick={() => handlePronunciationCheck(v.word)} disabled={isRecordingPron} style={{ background: isRecordingPron ? '#e17055' : 'rgba(255,255,255,0.1)', border: `2px solid ${isRecordingPron ? '#e17055' : 'rgba(255,255,255,0.3)'}`, borderRadius: 50, width: 52, height: 52, fontSize: 22, cursor: 'pointer' }}>{isRecordingPron ? '🔴' : '🎤'}</button>
                      </div>
                      {pronScore !== null && <div style={{ marginTop: 10, fontSize: 18, fontWeight: 800, color: pronScore >= 80 ? '#00b894' : '#fdcb6e' }}>{pronScore >= 80 ? '🎉' : '👍'} {pronScore}%</div>}
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <span style={{ fontSize: 13, color: '#888', flex: 1 }}>{familiaVocabIndex + 1} / {familiaVocab.length}</span>
                      {familiaVocabIndex > 0 && <button onClick={() => { setFamiliaVocabIndex(i => i - 1); setPronScore(null); }} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 10, padding: '10px 16px', color: '#aaa', cursor: 'pointer' }}>← Anterior</button>}
                      <button onClick={() => { addXp(5); setPronScore(null); if (familiaVocabIndex < familiaVocab.length - 1) setFamiliaVocabIndex(i => i + 1); else setFamiliaSubStage('memory'); }} style={{ flex: 1, background: phaseColor, border: 'none', borderRadius: 12, padding: '14px', color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>{familiaVocabIndex < familiaVocab.length - 1 ? 'Próxima →' : '🧠 Jogo de Memória!'}</button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
          {familiaSubStage === 'memory' && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>🧠 Jogo de Memória</div>
                <div style={{ fontSize: 12, color: '#888' }}>Encontre os pares: palavra ↔ tradução</div>
                <div style={{ fontSize: 13, color: phaseColor, marginTop: 4 }}>✅ {familiaMemoryMatches} / {Math.floor(familiaMemoryCards.length / 2)} pares</div>
              </div>
              {familiaMemoryMatches >= Math.floor(familiaMemoryCards.length / 2) && familiaMemoryCards.length > 0 ? (
                <div style={{ textAlign: 'center', padding: 32 }}>
                  <div style={{ fontSize: 80 }}>🏆</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#FFD700', marginBottom: 8 }}>Memória Perfeita!</div>
                  <div style={{ fontSize: 14, color: '#aaa', marginBottom: 20 }}>Você encontrou todos os pares!</div>
                  <button onClick={() => { setStage('complete'); onComplete?.(totalCorrect, xp); }} style={{ background: phaseColor, border: 'none', borderRadius: 12, padding: '14px 28px', color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>🏆 Concluir Lição!</button>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                    {familiaMemoryCards.map(card => (
                      <button key={card.id} onClick={() => handleFamiliaMemoryFlip(card.id)} style={{ background: card.matched ? 'rgba(0,184,148,0.3)' : card.flipped ? `${phaseColor}30` : 'rgba(255,255,255,0.08)', border: `2px solid ${card.matched ? '#00b894' : card.flipped ? phaseColor : 'rgba(255,255,255,0.15)'}`, borderRadius: 12, padding: '12px 4px', cursor: card.matched ? 'default' : 'pointer', minHeight: 60, fontSize: 12, fontWeight: 700, color: '#fff', transition: 'all 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                        {card.flipped || card.matched ? card.word : '?'}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => { setStage('complete'); onComplete?.(totalCorrect, xp); }} style={{ marginTop: 16, width: '100%', background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 12, padding: '12px', color: '#888', fontSize: 13, cursor: 'pointer' }}>Pular jogo → Concluir</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── SCENE STAGE ──────────────────────────────────────────────────────────
  if (stage === 'scene') {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', background: '#0f0f1a', borderRadius: 20, overflow: 'hidden' }}>
        <Header />
        <Suspense fallback={<div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Carregando cena...</div>}>
          <SceneLesson
            targetLanguage={lesson.title?.split(' - ')[0] || languageCode}
            languageCode={languageCode}
            phase={phase}
            teacherName={teacherName}
            teacherEmoji={teacherGender === 'female' ? '👩‍🏫' : '👨‍🏫'}
            phaseColor={phaseColor}
            onComplete={(sceneXp) => { addXp(sceneXp); setStage('structure'); }}
            onBack={() => setStage('srs')}
          />
        </Suspense>
      </div>
    );
  }

  // ── STRUCTURE STAGE ───────────────────────────────────────────────────────
  if (stage === 'structure') {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', background: '#0f0f1a', borderRadius: 20, overflow: 'hidden' }}>
        <Header />
        <Suspense fallback={<div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Carregando estrutura frasal...</div>}>
          <SentenceBuilder
            targetLanguage={lesson.title?.split(' - ')[0] || languageCode}
            languageCode={languageCode}
            phase={phase}
            lessonTitle={lesson.title}
            vocabulary={(vocab || []).map(v => ({ word: v.word, translation: v.translation }))}
            teacherName={teacherName}
            teacherEmoji={teacherGender === 'female' ? '👩‍🏫' : '👨‍🏫'}
            phaseColor={phaseColor}
            onComplete={(structureXp) => { addXp(structureXp); setStage('nanoBanana'); }}
            onBack={() => setStage('scene')}
          />
        </Suspense>
      </div>
    );
  }

  return null;
}
