import { useState, useRef, useEffect, useMemo, lazy, Suspense } from "react";
import { useParams, Link } from "wouter";
import { speakText as speakNaturalVoice } from "@/hooks/useNaturalVoice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Volume2, 
  Mic, 
  Check, 
  X, 
  ArrowLeft,
  ArrowRight,
  Trophy,
  Play,
  Square,
  RotateCcw
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ClickableText } from "@/components/ClickableWord";
import VocabularySection from "@/components/VocabularySection";
import LessonDictionary from "@/components/LessonDictionary";
import AIChatbot from "@/components/AIChatbot";
import TeacherSelector from "@/components/TeacherSelector";
import { TalkingTeacher } from "@/components/TalkingTeacher";
import { TEACHERS_57 } from "@/data/teachers57";
import { synthesizeSpeechLocal, isWebSpeechSupported } from "@/lib/localTTS";
import { VoiceQualityBanner } from "@/components/VoiceQualityBanner";
import LiveLessonTeacher from "@/components/LiveLessonTeacher";
import { analyzePronunciationLocal, isWebAudioSupported } from "@/lib/localSTT";
import { getLevelByLesson, getLevelConfig, type CEFRLevel } from "@/lib/lesson-levels";
// Lazy load heavy components
const ARLearningScene = lazy(() => import("@/components/ARLearningScene").then(m => ({ default: m.ARLearningScene })));
const VoiceConversation = lazy(() => import("@/components/VoiceConversation"));
const InteractiveVideoPlayer = lazy(() => import("@/components/InteractiveVideoPlayer"));
const ContentProtection = lazy(() => import("@/components/ContentProtection"));
const PronunciationExercise = lazy(() => import("@/components/PronunciationExercise"));
const EnhancedTeacherAvatar = lazy(() => import("@/components/EnhancedTeacherAvatar"));
const TeacherWithObject = lazy(() => import("@/components/TeacherWithObject"));
const AnimatedLessonClip = lazy(() => import("@/components/AnimatedLessonClip"));
const ActivePauseLessonPlayer = lazy(() => import("@/components/ActivePauseLessonPlayer"));
const LessonBook = lazy(() => import("@/components/LessonBook"));
const NotebookLesson = lazy(() => import("@/components/NotebookLesson"));
const PedagogicalLesson = lazy(() => import("@/components/PedagogicalLesson"));
const PolyLesson = lazy(() => import("@/components/PolyLesson"));

// Fisher-Yates shuffle algorithm - embaralha array de forma aleatória
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function Lesson() {
  const { id } = useParams();
  const lessonId = id;
  const [currentExercise, setCurrentExercise] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [answerAnimation, setAnswerAnimation] = useState<'correct' | 'wrong' | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [pronunciationResult, setPronunciationResult] = useState<any>(null);
  const [teacherText, setTeacherText] = useState("");
  const [teacherExpression, setTeacherExpression] = useState<"neutral" | "happy" | "thinking" | "excited" | "encouraging">("neutral");
  const [lessonStartTime] = useState(Date.now());
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [teacherAudioUrl, setTeacherAudioUrl] = useState<string | null>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);
  const [showTeacherSelector, setShowTeacherSelector] = useState(true);
  const [userTextAnswer, setUserTextAnswer] = useState('');
  // SEMPRE usar Google Neural2 TTS do servidor (voz natural de alta qualidade)
  // Web Speech API é robótica e de baixa qualidade — desativada por padrão
  const [useOfflineTTS, setUseOfflineTTS] = useState(false);
  const [fastMode, setFastMode] = useState(false); // Modo rápido: auto-avança após resposta correta
  const [lessonMode, setLessonMode] = useState<'exercises' | 'active-pause' | 'book' | 'notebook' | 'pedagogical' | 'poly'>('poly'); // Modo de aula — padrão: pedagógico
  const [pedagogicalContent, setPedagogicalContent] = useState<any>(null);
  const [pedagogicalLoading, setPedagogicalLoading] = useState(false);
  const generateLessonContentMutation = trpc.ai.generateLessonContent.useMutation();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Helper: get feedback text in the lesson's language
  const getFeedback = (correct: boolean, correctAnswer?: string): string => {
    const lang = (lesson?.languageCode || 'en').toLowerCase();
    if (correct) {
      if (lang.startsWith('en')) return "Excellent! That's correct! Keep it up!";
      if (lang.startsWith('fr')) return "Excellent ! C'est correct ! Continuez comme ça !";
      if (lang.startsWith('de')) return "Ausgezeichnet! Das ist richtig! Weiter so!";
      if (lang.startsWith('es')) return "¡Excelente! ¡Eso es correcto! ¡Sigue así!";
      if (lang.startsWith('it')) return "Eccellente! È corretto! Continua così!";
      if (lang.startsWith('ja')) return "素晴らしい！正解です！その調子で！";
      if (lang.startsWith('zh')) return "太棒了！回答正确！继续加油！";
      if (lang.startsWith('ko')) return "훌륭해요! 정답이에요! 계속 하세요!";
      if (lang.startsWith('pt')) return "Excelente! Você acertou! Continue assim!";
      if (lang.startsWith('ru')) return "Отлично! Правильно! Продолжайте!";
      if (lang.startsWith('ar')) return "ممتاز! إجابة صحيحة! استمر!";
      if (lang.startsWith('hi')) return "शानदार! सही जवाब! जारी रखें!";
      return "Excellent! That's correct! Keep it up!";
    } else {
      const ans = correctAnswer || '';
      if (lang.startsWith('en')) return `Not quite. The correct answer is: ${ans}`;
      if (lang.startsWith('fr')) return `Pas tout à fait. La bonne réponse est : ${ans}`;
      if (lang.startsWith('de')) return `Nicht ganz. Die richtige Antwort ist: ${ans}`;
      if (lang.startsWith('es')) return `No del todo. La respuesta correcta es: ${ans}`;
      if (lang.startsWith('it')) return `Non proprio. La risposta corretta è: ${ans}`;
      if (lang.startsWith('ja')) return `惜しい！正解は：${ans}`;
      if (lang.startsWith('zh')) return `不太对。正确答案是：${ans}`;
      if (lang.startsWith('ko')) return `아쉬워요. 정답은: ${ans}`;
      if (lang.startsWith('pt')) return `Não foi dessa vez. A resposta correta é: ${ans}`;
      if (lang.startsWith('ru')) return `Не совсем. Правильный ответ: ${ans}`;
      if (lang.startsWith('ar')) return `ليس تماماً. الإجابة الصحيحة هي: ${ans}`;
      if (lang.startsWith('hi')) return `बिल्कुल नहीं। सही उत्तर है: ${ans}`;
      return `Not quite. The correct answer is: ${ans}`;
    }
  };
  const audioChunksRef = useRef<Blob[]>([]);
  
  // Mutation para salvar progresso
  const completeLessonMutation = trpc.progress.completeLesson.useMutation();
  
  // Buscar lição real do banco
  const { data: lesson, isLoading: loadingLesson } = trpc.lessons.getById.useQuery(
    { lessonId: parseInt(lessonId || '1') }
  );
  
  // Buscar exercícios reais do banco
  const { data: exercises, isLoading: loadingExercises } = trpc.lessons.getExercises.useQuery(
    { lessonId: parseInt(lessonId || '1') }
  );
  
  // Buscar TODOS os professores para encontrar o selecionado pelo usuário
  const { data: allTeachers } = trpc.teachers.list.useQuery();
  // Buscar professor preferido salvo no perfil do usuário
  const { data: preferredTeacher } = trpc.auth.getPreferredTeacher.useQuery(undefined, {
    retry: false,
  });
  // Auto-selecionar professor preferido quando carregado
  useEffect(() => {
    if (preferredTeacher && !selectedTeacherId) {
      setSelectedTeacherId(preferredTeacher.id);
      setShowTeacherSelector(false);
    }
  }, [preferredTeacher]);
  // Buscar professor pelo ID selecionado e enriquecer com dados do TEACHERS_57
  const teacher = useMemo(() => {
    if (!allTeachers) return undefined;
    const dbTeacher = allTeachers.find((t) => t.id === selectedTeacherId)
      ?? (preferredTeacher as typeof allTeachers[0] | undefined)
      ?? allTeachers[0];
    if (!dbTeacher) return undefined;
    // Enrich with TEACHERS_57 data: photo, gender, specialty, flag, origin
    const langShort = ((dbTeacher as any).voiceLanguageCode || (dbTeacher as any).voice_language_code || '').split('-')[0].toLowerCase();
    const t57 = TEACHERS_57.find(t => t.langCode.toLowerCase() === langShort)
      || TEACHERS_57.find(t => t.voiceLang.toLowerCase() === ((dbTeacher as any).voiceLanguageCode || (dbTeacher as any).voice_language_code || '').toLowerCase());
    return {
      ...dbTeacher,
      photoUrl: (dbTeacher as any).photoUrl || (dbTeacher as any).photo_url || t57?.photo || null,
      gender: (dbTeacher as any).gender || t57?.gender || 'female',
      specialty: (dbTeacher as any).specialty || t57?.specialty || 'Conversação e Gramática',
      origin: t57?.origin || '',
      flag: t57?.flag || '',
      voiceLanguageCode: (dbTeacher as any).voiceLanguageCode || (dbTeacher as any).voice_language_code || t57?.voiceLang || 'en-US',
    };
  }, [allTeachers, selectedTeacherId, preferredTeacher]);
  // Manter compatibilidade com teacherList
  const teacherList = allTeachers;

  // Embaralhar opções uma vez por exercício (usando useMemo para estabilidade)
  const shuffledOptionsMap = useMemo(() => {
    if (!exercises) return new Map();
    
    const map = new Map<number, string[]>();
    exercises.forEach((ex, index) => {
      if (ex.options && ex.options.length > 0) {
        map.set(index, shuffleArray(ex.options));
      }
    });
    return map;
  }, [exercises]);

  // Reset teacher when exercise changes
  useEffect(() => {
    setTeacherText("");
    setTeacherExpression("neutral");
    setTeacherAudioUrl(null);
  }, [currentExercise]);
  
  // Mutation para salvar professor preferido no perfil
  const savePreferredTeacher = trpc.auth.savePreferredTeacher.useMutation();

  // TTS mutation para botão de áudio
  const generateAudio = trpc.tts.generate.useMutation({
    onSuccess: (result) => {
      const audio = new Audio(result.audioUrl);
      audio.play().catch(err => {
        console.log('Audio play error:', err);
      });
      toast.success("Reproduzindo áudio");
    },
    onError: () => {
      toast.error("Erro ao gerar áudio");
    }
  });

  // TTS mutation para professor falar feedback — Edge TTS Neural (alta qualidade)
  const generateTeacherAudio = trpc.tts.speak.useMutation({
    onSuccess: (result) => {
      // Reproduzir áudio base64 diretamente
      try {
        const audioData = `data:audio/mp3;base64,${result.audioBase64}`;
        const audio = new Audio(audioData);
        audio.play().catch(() => {});
        setTeacherAudioUrl(audioData);
      } catch (e) {
        console.log('Teacher audio play error:', e);
      }
    },
    onError: (error) => {
      console.log('Teacher audio generation error:', error);
    }
  });

  // STT mutation
  const analyzePronunciationMutation = trpc.stt.analyzePronunciation.useMutation({
    onSuccess: (result) => {
      setPronunciationResult(result);
      toast.success(`Precisão: ${result.accuracy}%`);
    },
    onError: () => {
      toast.error("Erro ao analisar pronúncia");
    }
  });

  // Professor fala automaticamente ao entrar na lição (Web Speech API - sem bloqueio de autoplay)
  useEffect(() => {
    if (!lesson) return;
    const lang = (lesson.languageCode || 'en').toLowerCase();
    let welcomeText = `Welcome! Lesson ${lesson.orderIndex}: ${lesson.title}. Let's get started!`;
    if (lang.startsWith('pt')) welcomeText = `Bem-vindo! Lição ${lesson.orderIndex}: ${lesson.title}. Vamos começar!`;
    else if (lang.startsWith('es')) welcomeText = `¡Bienvenido! Lección ${lesson.orderIndex}: ${lesson.title}. ¡Empecemos!`;
    else if (lang.startsWith('fr')) welcomeText = `Bienvenue! Leçon ${lesson.orderIndex}: ${lesson.title}. Commençons!`;
    else if (lang.startsWith('de')) welcomeText = `Willkommen! Lektion ${lesson.orderIndex}: ${lesson.title}. Fangen wir an!`;
    else if (lang.startsWith('it')) welcomeText = `Benvenuto! Lezione ${lesson.orderIndex}: ${lesson.title}. Iniziamo!`;
    else if (lang.startsWith('ja')) welcomeText = `ようこそ！第${lesson.orderIndex}課：${lesson.title}。始めましょう！`;
    else if (lang.startsWith('zh')) welcomeText = `欢迎！第${lesson.orderIndex}课：${lesson.title}。让我们开始！`;
    else if (lang.startsWith('ko')) welcomeText = `어서오세요! ${lesson.orderIndex}번 수업: ${lesson.title}. 시작합시다!`;
    setTeacherText(welcomeText);
    setTeacherExpression("happy");
    // Gerar áudio de boas-vindas via Google Neural2 TTS (voz natural de alta qualidade)
    const rawLang = lesson.languageCode || 'en-US';
    generateTeacherAudio.mutate({
      text: welcomeText,
      voiceLang: rawLang, // usar voz padrão Neural2 do idioma
    });
  }, [lesson?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Mostrar loading ou gerando exercícios via IA
  if (loadingLesson || loadingExercises) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
          <p className="text-blue-700 font-semibold text-lg mb-2">Preparando sua aula...</p>
          <p className="text-gray-500 text-sm">A IA está gerando exercícios personalizados para você</p>
        </div>
      </div>
    );
  }
  
  // Se lição não encontrada no banco
  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Lição não encontrada</p>
          <Link href="/dashboard">
            <Button>Voltar ao Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  // Se exercícios ainda não chegaram (IA gerando — mostrar loading)
  if (!exercises || exercises.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent mx-auto mb-6"></div>
          <p className="text-purple-700 font-semibold text-lg mb-2">🤖 Gerando exercícios com IA...</p>
          <p className="text-gray-500 text-sm">Criando exercícios personalizados para: <strong>{lesson.title}</strong></p>
          <p className="text-gray-400 text-xs mt-2">Isso pode levar alguns segundos na primeira vez</p>
        </div>
      </div>
    );
  }

  const exercise = exercises[currentExercise];
  
  // Verificar se exercise existe
  if (!exercise) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Exercício não encontrado</p>
          <Link href="/dashboard">
            <Button>Voltar ao Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Obter opções embaralhadas para o exercício atual
  const shuffledOptions = shuffledOptionsMap.get(currentExercise) || exercise.options || [];
  
  const progress = ((currentExercise + 1) / exercises.length) * 100;

  // Play audio using TTS
  const playAudio = (text: string) => {
    toast.info("Gerando áudio...");
    generateAudio.mutate({
      text,
      languageCode: lesson?.languageCode || "en-US"
    });
  };

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.info("Gravando...");
    } catch (error) {
      toast.error("Erro ao acessar microfone");
      console.error(error);
    }
  };

  // Stop recording
  const stopRecording = () => {
    try {
      if (mediaRecorderRef.current) {
        if (mediaRecorderRef.current.state === 'recording' || mediaRecorderRef.current.state === 'paused') {
          mediaRecorderRef.current.stop();
        }
        // Force stop all tracks
        if (mediaRecorderRef.current.stream) {
          mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
      }
    } catch (e) {
      console.error('Error stopping recording:', e);
    } finally {
      setIsRecording(false);
      toast.success('Gravação finalizada');
    }
  };

  // Analyze pronunciation
  const analyzePronunciation = () => {
    if (!audioBlob || exercise.type !== "speaking") return;

    toast.info("Analisando pronúncia...");
    
    // Convert blob to base64
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = () => {
      const base64Audio = reader.result as string;
      
      analyzePronunciationMutation.mutate({
        audioUrl: base64Audio,
        expectedText: exercise.correctAnswer || (exercise as any).audioText || 'Hello',
        languageCode: lesson?.languageCode || "en-US"
      });
    };
  };

  // Check answer - agora compara com opções embaralhadas
  // Normalize text for robust comparison: trim, lowercase, remove punctuation
  const normalizeAnswer = (s: string) => s.trim().toLowerCase().replace(/[.,!?;:'"]/g, '').replace(/\s+/g, ' ');

  const checkAnswer = (answerIndex: number) => {
    if (exercise.type !== "multiple_choice") return;
    
    setSelectedAnswer(answerIndex);
    const selectedOption = (shuffledOptions[answerIndex] || '').trim();
    const correct = normalizeAnswer(selectedOption) === normalizeAnswer(exercise.correctAnswer || '');
    setIsCorrect(correct);
    setAnswerAnimation(correct ? 'correct' : 'wrong');
    setTimeout(() => setAnswerAnimation(null), 700);

    if (correct) {
      setCorrectAnswers(prev => prev + 1);
      const feedbackText = getFeedback(true);
      setTeacherText(feedbackText);
      setTeacherExpression("happy");
      toast.dismiss('exercise-feedback');
      toast.success("Correto! 🎉", { id: 'exercise-feedback' });
      // Modo rápido: avança automaticamente após 1.2s
      if (fastMode) {
        setTimeout(() => {
          if (currentExercise < (exercises?.length ?? 0) - 1) {
            setCurrentExercise(c => c + 1);
            setSelectedAnswer(null);
            setIsCorrect(null);
            setUserTextAnswer('');
            setAudioBlob(null);
            setPronunciationResult(null);
          }
        }, 1200);
      }
      
      // Limpar URL anterior e gerar novo áudio do professor
      setTeacherAudioUrl(null);
      
      // Usar TTS offline se disponível e ativo
      if (useOfflineTTS && isWebSpeechSupported()) {
        const teacherGender = (teacher?.gender as 'male' | 'female') || 'female';
        synthesizeSpeechLocal(
          feedbackText,
          lesson?.languageCode || "en",
          teacherGender,
          {
            onError: (err) => {
              console.error('Erro TTS offline:', err);
              generateTeacherAudio.mutate({
                text: feedbackText,
                voiceLang: lesson?.languageCode || "en-US",
              });
            },
          }
        ).catch(err => {
          console.error('Erro na síntese offline:', err);
          generateTeacherAudio.mutate({
            text: feedbackText,
            voiceLang: lesson?.languageCode || "en-US",
          });
        });
      } else {
        generateTeacherAudio.mutate({
          text: feedbackText,
          voiceLang: lesson?.languageCode || "en-US",
        });
      }
    } else {
      const feedbackText = getFeedback(false, exercise.correctAnswer);
      setTeacherText(feedbackText);
      setTeacherExpression("encouraging");
      toast.dismiss('exercise-feedback');
      toast.error("Incorreto. Tente novamente!", { id: 'exercise-feedback' });
      
      setTeacherAudioUrl(null);
      
      // Usar TTS offline se disponível e ativo
      if (useOfflineTTS && isWebSpeechSupported()) {
        const teacherGender = (teacher?.gender as 'male' | 'female') || 'female';
        synthesizeSpeechLocal(
          feedbackText,
          lesson?.languageCode || "en",
          teacherGender,
          {
            onError: (err) => {
              console.error('Erro TTS offline:', err);
              generateTeacherAudio.mutate({
                text: feedbackText,
                voiceLang: lesson?.languageCode || "en-US",
              });
            },
          }
        ).catch(err => {
          console.error('Erro na síntese offline:', err);
          generateTeacherAudio.mutate({
            text: feedbackText,
            voiceLang: lesson?.languageCode || "en-US",
          });
        });
      } else {
        generateTeacherAudio.mutate({
          text: feedbackText,
          voiceLang: lesson?.languageCode || "en-US",
        });
      }
    }
  };

  // Next exercise
  const checkTextAnswer = () => {
    const trimmed = userTextAnswer.trim();
    if (!trimmed) return;
    const correct = trimmed.toLowerCase() === (exercise.correctAnswer || '').trim().toLowerCase();
    setIsCorrect(correct);
    if (correct) {
      setCorrectAnswers(prev => prev + 1);
      const correctFeedback = getFeedback(true);
      setTeacherText(correctFeedback);
      setTeacherExpression('happy');
      toast.dismiss('exercise-feedback');
      toast.success('Correto! 🎉', { id: 'exercise-feedback' });
      setTeacherAudioUrl(null);
      setTimeout(() => {
        generateTeacherAudio.mutate({
          text: correctFeedback,
          voiceLang: lesson?.languageCode || 'en-US',
        });
      }, 50);
    } else {
      const wrongFeedback = getFeedback(false, exercise.correctAnswer);
      setTeacherText(wrongFeedback);
      setTeacherExpression('encouraging');
      toast.dismiss('exercise-feedback');
      toast.error('Incorreto. A resposta é: ' + exercise.correctAnswer, { id: 'exercise-feedback' });
      setTeacherAudioUrl(null);
      setTimeout(() => {
        generateTeacherAudio.mutate({
          text: wrongFeedback,
          voiceLang: lesson?.languageCode || 'en-US',
        });
      }, 50);
    }
  };
  const nextExercise = () => {
    if (currentExercise < exercises.length - 1) {
      setCurrentExercise(currentExercise + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setUserTextAnswer('');
      setAudioBlob(null);
      setPronunciationResult(null);
    }
  };

  // Complete lesson
  const completeLesson = async () => {
    if (!lesson || !exercises) return;
    
    // Calcular tempo gasto (em segundos)
    const timeSpentSeconds = Math.floor((Date.now() - lessonStartTime) / 1000);
    
    // Calcular score (0-100)
    const score = Math.round((correctAnswers / exercises.length) * 100);
    
    try {
      // Salvar progresso no banco
      await completeLessonMutation.mutateAsync({
        lessonId: lesson.id,
        courseId: lesson.courseId,
        score,
        timeSpentSeconds,
      });
      
      toast.success(`Lição completada! 🎉 Você ganhou ${score} XP!`);
      
      // Aguardar 1 segundo para mostrar toast
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1000);
    } catch (error) {
      console.error('Erro ao salvar progresso:', error);
      toast.error('Erro ao salvar progresso. Tente novamente.');
    }
  };

  // Show teacher selector first if no teacher selected
  if (showTeacherSelector && !selectedTeacherId && lesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <Link href="/dashboard">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Dashboard
              </Button>
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold text-gray-900">
                {lesson.title}
              </h1>
              {(() => {
                const cefrLevel = getLevelByLesson(lesson.orderIndex || 1);
                const config = getLevelConfig(cefrLevel);
                return (
                  <Badge className={`${config.color} text-white text-sm`}>Nível {cefrLevel}</Badge>
                );
              })()}
            </div>
            <p className="text-gray-600">
              Antes de começar, escolha seu professor preferido
            </p>
          </div>
          
          <TeacherSelector
            languageCode={lesson.languageCode || 'pt-BR'}
            selectedTeacherId={selectedTeacherId || undefined}
            onSelect={(teacherId) => {
              setSelectedTeacherId(teacherId);
              setShowTeacherSelector(false);
              savePreferredTeacher.mutate({ teacherId });
              toast.success('Professor selecionado! Vamos começar a lição.');
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <ContentProtection showWatermark={true}>
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div className="flex-1 mx-8">
              <div className="flex items-center gap-4">
                <Progress value={progress} className="flex-1 h-3" />
                <span className="text-sm font-semibold text-gray-600">
                  {currentExercise + 1}/{exercises.length}
                </span>
              </div>
            </div>
            <Badge variant="secondary">{lesson.languageCode?.toUpperCase() || 'EN'}</Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Mode Switcher */}
        <div className="flex gap-2 mb-4 bg-white rounded-xl border border-gray-200 p-1 shadow-sm">
          <button
            onClick={() => setLessonMode('active-pause')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
              lessonMode === 'active-pause'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span>🎓</span> Aula com Professor
          </button>
          <button
            onClick={() => setLessonMode('exercises')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
              lessonMode === 'exercises'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span>✏️</span> Exercícios
          </button>
          <button
            onClick={() => setLessonMode('book')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
              lessonMode === 'book'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span>📖</span> Livro
          </button>
          <button
            onClick={() => setLessonMode('notebook')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
              lessonMode === 'notebook'
                ? 'bg-amber-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span>📓</span> Caderno
          </button>
          <button
            onClick={() => {
              setLessonMode('poly');
              if (!pedagogicalContent && lesson) {
                setPedagogicalLoading(true);
                generateLessonContentMutation.mutateAsync({
                  lessonTitle: lesson.title,
                  lessonDescription: lesson.description || '',
                  languageCode: lesson.languageCode || 'en-US',
                  nativeLanguage: 'pt',
                  level: (lesson as any).courseLevel || 'basico',
                }).then(data => { setPedagogicalContent(data); setPedagogicalLoading(false); })
                  .catch(() => setPedagogicalLoading(false));
              }
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
              lessonMode === 'poly'
                ? 'bg-gradient-to-r from-violet-600 to-pink-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span>🎙️</span> PolyLesson
          </button>
          <button
            onClick={() => {
              setLessonMode('pedagogical');
              if (!pedagogicalContent && lesson) {
                setPedagogicalLoading(true);
                generateLessonContentMutation.mutateAsync({
                  lessonTitle: lesson.title,
                  lessonDescription: lesson.description || '',
                  languageCode: lesson.languageCode || 'en-US',
                  nativeLanguage: 'pt',
                  level: (lesson as any).courseLevel || 'basico',
                }).then(data => { setPedagogicalContent(data); setPedagogicalLoading(false); })
                  .catch(() => setPedagogicalLoading(false));
              }
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
              lessonMode === 'pedagogical'
                ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span>🍼</span> Aprender
          </button>
        </div>

        {/* Active Pause Lesson Player */}
        {lessonMode === 'active-pause' && (
          <div className="mb-6">
            <Suspense fallback={
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
              </div>
            }>
              <ActivePauseLessonPlayer
                lessonId={parseInt(lessonId || '1')}
                lessonTitle={lesson.title}
                languageCode={lesson.languageCode || 'en-US'}
                nativeLanguage="pt"
                teacherName={teacher?.name || 'Professor'}
                teacherPhoto={(teacher as any)?.photoUrl || (teacher as any)?.photo_url || undefined}
                onComplete={(score) => {
                  toast.success(`🏆 Aula concluída com ${score} pontos!`);
                }}
              />
            </Suspense>
          </div>
        )}

        {/* Livro da Disciplina */}
        {lessonMode === 'book' && (
          <div className="mb-6 bg-white rounded-2xl border border-gray-200 shadow-sm p-4 md:p-6">
            <Suspense fallback={
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
              </div>
            }>
              <LessonBook
                lessonId={parseInt(lessonId || '1')}
                lessonTitle={lesson.title}
                languageCode={lesson.languageCode || 'en-US'}
                nativeLanguage="pt"
                level={(lesson as any).courseLevel || 'beginner'}
                topic={lesson.title}
                teacherName={teacher?.name || 'Professor'}
              />
            </Suspense>
          </div>
        )}

        {/* Caderno de Aulas */}
        {lessonMode === 'notebook' && (
          <div className="mb-6 bg-white rounded-2xl border border-gray-200 shadow-sm p-4 md:p-6">
            <Suspense fallback={
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500" />
              </div>
            }>
              <NotebookLesson
                lessonId={parseInt(lessonId || '1')}
                lessonTitle={lesson.title}
                languageCode={lesson.languageCode || 'en-US'}
                nativeLanguage="Português"
                level={(lesson as any).courseLevel || 'beginner'}
                topic={lesson.title}
              />
            </Suspense>
          </div>
        )}

        {/* PolyLesson — Professor fala, explica, conversa, treino gamificado */}
        {lessonMode === 'poly' && (
          <div className="mb-6">
            {pedagogicalLoading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-gray-900 rounded-2xl">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent mb-4" />
                <p className="text-violet-400 font-semibold">🎙️ Preparando aula com professor...</p>
                <p className="text-gray-500 text-sm mt-1">Gerando vocabulário e exercícios</p>
              </div>
            ) : pedagogicalContent ? (
              <Suspense fallback={
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-500" />
                </div>
              }>
                <PolyLesson
                  lesson={pedagogicalContent}
                  languageCode={lesson.languageCode || 'en-US'}
                  teacher={teacher ? {
                    name: teacher.name,
                    gender: (teacher as any).gender === 'male' ? 'male' : 'female',
                    photo: (teacher as any).photoUrl || (teacher as any).photo_url || undefined,
                    // Use teacher's voiceLanguageCode if available, fall back to lesson languageCode
                    langCode: (teacher as any).voiceLanguageCode || (teacher as any).voice_language_code || lesson.languageCode || 'en-US',
                  } : undefined}
                  onComplete={(score, xp) => {
                    toast.success(`🏆 Lição concluída! +${xp} XP`);
                    completeLessonMutation.mutate({ lessonId: parseInt(lessonId || '1'), courseId: (lesson as any).courseId || 1, score, timeSpentSeconds: Math.floor((Date.now() - lessonStartTime) / 1000) });
                  }}
                />
              </Suspense>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 bg-gray-900 rounded-2xl">
                <div className="text-6xl mb-4">🎙️</div>
                <p className="text-white font-bold text-xl mb-2">PolyLesson</p>
                <p className="text-gray-400 text-sm mb-6 text-center px-8">Professor apresenta cada palavra, explica, conversa com você e treina com flashcards gamificados</p>
                <button
                  onClick={() => {
                    if (!lesson) return;
                    setPedagogicalLoading(true);
                    generateLessonContentMutation.mutateAsync({
                      lessonTitle: lesson.title,
                      lessonDescription: lesson.description || '',
                      languageCode: lesson.languageCode || 'en-US',
                      nativeLanguage: 'pt',
                      level: (lesson as any).courseLevel || 'basico',
                    }).then(data => { setPedagogicalContent(data); setPedagogicalLoading(false); })
                      .catch(() => setPedagogicalLoading(false));
                  }}
                  style={{ background: 'linear-gradient(135deg, #7C3AED, #EC4899)', border: 'none', borderRadius: 12, padding: '14px 32px', color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}
                >
                  🚀 Começar com o Professor!
                </button>
              </div>
            )}
          </div>
        )}

        {/* Modo Pedagógico — Infância → Criança → Adolescência → Adulto → Fluente */}
        {lessonMode === 'pedagogical' && (
          <div className="mb-6 bg-gray-900 rounded-2xl border border-gray-700 shadow-xl overflow-hidden">
            {pedagogicalLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mb-4" />
                <p className="text-orange-400 font-semibold">🤖 Gerando lição personalizada com IA...</p>
                <p className="text-gray-500 text-sm mt-1">Adaptando ao seu nível de aprendizado</p>
              </div>
            ) : pedagogicalContent ? (
              <Suspense fallback={
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500" />
                </div>
              }>
                <PedagogicalLesson
                  lesson={pedagogicalContent}
                  languageCode={lesson.languageCode || 'en-US'}
                  onComplete={(score) => {
                    toast.success(`🏆 Lição concluída! +${score} XP`);
                    completeLessonMutation.mutate({ lessonId: parseInt(lessonId || '1'), courseId: (lesson as any).courseId || 1, score, timeSpentSeconds: Math.floor((Date.now() - lessonStartTime) / 1000) });
                  }}
                />
              </Suspense>
            ) : (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="text-6xl mb-4">🍼</div>
                <p className="text-white font-bold text-xl mb-2">Modo Pedagógico</p>
                <p className="text-gray-400 text-sm mb-6 text-center px-8">Aprenda como na vida real — do básico ao fluente, passo a passo</p>
                <button
                  onClick={() => {
                    if (!lesson) return;
                    setPedagogicalLoading(true);
                    generateLessonContentMutation.mutateAsync({
                      lessonTitle: lesson.title,
                      lessonDescription: lesson.description || '',
                      languageCode: lesson.languageCode || 'en-US',
                      nativeLanguage: 'pt',
                      level: (lesson as any).courseLevel || 'basico',
                    }).then(data => { setPedagogicalContent(data); setPedagogicalLoading(false); })
                      .catch(() => setPedagogicalLoading(false));
                  }}
                  style={{ background: 'linear-gradient(135deg, #FF9F43, #FD79A8)', border: 'none', borderRadius: 12, padding: '14px 32px', color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}
                >
                  🚀 Começar Aprendizado
                </button>
              </div>
            )}
          </div>
        )}

        {lessonMode === 'exercises' && (
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">{lesson.title}</CardTitle>
              <Badge className="bg-blue-600">Lição {lesson.orderIndex}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Professor Information */}
            {teacher && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200 mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2 rounded-full">
                    <span className="text-2xl">🎭</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{teacher.name}</h3>
                    <p className="text-sm text-gray-600">{teacher.personality}</p>
                    <p className="text-xs text-gray-500 mt-1">🎓 {teacher.title}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Lesson Illustration */}
            {lesson.illustrationUrl && (
              <div className="relative w-full h-64 rounded-xl overflow-hidden mb-4">
                <img 
                  src={lesson.illustrationUrl} 
                  alt={lesson.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Story Section - História da Lição */}
            {lesson.storyText && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl border-2 border-amber-200 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">📖</span>
                  <h3 className="text-xl font-bold text-gray-900">História da Lição</h3>
                </div>
                <div className="bg-white p-5 rounded-lg shadow-sm">
                  <p className="text-gray-800 leading-relaxed text-2xl whitespace-pre-wrap">
                    {lesson.storyText}
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                  <span>💡</span>
                  <p>Leia a história com atenção. As perguntas abaixo são baseadas neste texto!</p>
                </div>
              </div>
            )}

            {/* Vocabulary Section - Glossário Bilíngue */}
            {lesson.vocabularyDetailed && lesson.vocabularyDetailed.length > 0 && (
              <div className="mb-6">
                <div className="mb-3 flex items-center justify-between">
                  <LessonDictionary
                    vocabulary={lesson.vocabularyDetailed}
                    lessonNumber={lesson.orderIndex || 1}
                    nativeLanguage="pt-BR"
                    targetLanguage="en-US"
                  />
                </div>
                <VocabularySection
                  vocabulary={lesson.vocabularyDetailed}
                  nativeLanguage="pt-BR"
                  targetLanguage="en-US"
                />
              </div>
            )}

            {/* Professor Interativo com Objetos Visuais */}
            {lesson.vocabularyDetailed && lesson.vocabularyDetailed.length > 0 && teacher && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span>🎓</span> {teacher.name} explica o vocabulário
                </h3>
                <Suspense fallback={<div className="animate-pulse bg-indigo-100 rounded-2xl h-48" />}>
                  <TeacherWithObject
                    teacherPhotoUrl={(teacher as any)?.photoUrl || (teacher as any)?.photo_url || undefined}
                    teacherName={teacher.name}
                    vocabulary={lesson.vocabularyDetailed.map((v: any) => ({...v, slang: Array.isArray(v.slang) ? v.slang : v.slang ? [v.slang] : undefined}))}
                    isTeaching={true}
                    onSpeak={(word) => {
                      generateTeacherAudio.mutate({
                        text: word,
                        voiceLang: lesson.languageCode || 'en-US',
                      });
                    }}
                    languageCode={lesson.languageCode?.split('-')[0] || 'en'}
                  />
                </Suspense>
              </div>
            )}

            {/* Clipe Animado com IA - Professores em Diálogo Interativo */}
            {lesson.vocabularyDetailed && lesson.vocabularyDetailed.length > 0 && (
              <div className="mb-6">
                <Suspense fallback={<div className="animate-pulse bg-purple-100 rounded-2xl h-40" />}>
                  <AnimatedLessonClip
                    title={lesson.title}
                    teacherName={teacher?.name || 'Professor'}
                    dialog={[
                      { speaker: 'narrator' as const, text: `Lesson: ${lesson.title}` },
                      ...lesson.vocabularyDetailed.slice(0, 4).flatMap((v: any) => [
                        { speaker: 'teacher' as const, text: v.word, translation: v.translation || '' },
                        { speaker: 'student' as const, text: v.translation || v.word, emotion: 'happy' as const },
                      ])
                    ]}
                    onSpeak={(text) => {
                      generateTeacherAudio.mutate({
                        text,
                        voiceLang: lesson.languageCode || 'en-US',
                      });
                    }}
                  />
                </Suspense>
              </div>
            )}

            {/* Vídeo Interativo Estilo Teacher Poli */}
            {(lesson as any).videoUrl && (lesson as any).subtitles && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  🎥 Vídeo da Lição
                </h2>
                <InteractiveVideoPlayer
                  videoId={parseInt(lessonId || '1')}
                  videoUrl={(lesson as any).videoUrl}
                  title={lesson.title}
                  subtitles={(lesson as any).subtitles}
                  characterName={teacher?.name || 'Professor'}
                  characterDescription={lesson.storyText || ''}
                />
              </div>
            )}

            {/* Exercício de Pronúncia com Ditado */}
            {lesson.vocabularyDetailed && lesson.vocabularyDetailed.length > 0 && teacher && (
              <div className="mb-6">
                <PronunciationExercise
                  vocabulary={lesson.vocabularyDetailed.map((v: any) => v.word)}
                  teacherId={teacher.id}
                  teacherName={teacher.name}
                  languageCode={lesson.languageCode || 'en-US'}
                />
              </div>
            )}

            {/* Sistema de Conversação por Voz */}
            {lesson.vocabularyDetailed && lesson.vocabularyDetailed.length > 0 && (
              <div className="mb-6">
                <VoiceConversation
                  lessonId={parseInt(lessonId || '1')}
                  vocabularyContext={lesson.vocabularyDetailed.map((v: any) => v.word)}
                  languageCode={lesson.languageCode || 'en-US'}
                />
              </div>
            )}

            {/* AI Chatbot - Conversação Interativa (texto) */}
            {lesson.vocabularyDetailed && lesson.vocabularyDetailed.length > 0 && (
              <div className="mb-6">
                <AIChatbot
                  lessonId={parseInt(lessonId || '1')}
                  vocabulary={lesson.vocabularyDetailed}
                  languageCode={lesson.languageCode || 'en-US'}
                />
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════
                 SEÇÃO 1 — PROFESSOR VIRTUAL 3D (Avatar Animado com Lip-Sync)
                 ═══════════════════════════════════════════════════════════ */}
            <div className="rounded-2xl overflow-hidden border border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-md">
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600">
                <span className="text-white text-lg">🤖</span>
                <span className="text-white font-bold text-sm">Professor Virtual 3D</span>
                <span className="ml-auto text-purple-200 text-xs">Lip-sync • Animação</span>
              </div>
              <div className="flex flex-col items-center gap-4 py-4 px-4">
                {(() => {
                  const langCode = lesson?.languageCode || 'en-US';
                  const t57Base = TEACHERS_57.find(t => t.langCode === langCode || t.voiceLang === langCode)
                    || TEACHERS_57.find(t => langCode.startsWith(t.langCode.split('-')[0]))
                    || TEACHERS_57[0];
                  const t57 = teacher
                    ? { ...t57Base, name: teacher.name, photo: (teacher as any).photoUrl || (teacher as any).photo_url || t57Base.photo }
                    : t57Base;
                  return (
                    <div className="flex flex-col items-center gap-2">
                      <TalkingTeacher
                        teacher={t57 as any}
                        text={teacherText || exercise.question || t57Base.greeting}
                        autoPlay={!!teacherText}
                        size="xl"
                        showName={true}
                        showControls={true}
                      />
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════
                 SEÇÃO 2 — PROFESSOR REAL (Foto Real + Voz Natural)
                 ═══════════════════════════════════════════════════════════ */}
            <div className="rounded-2xl overflow-hidden border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-md">
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600">
                <span className="text-white text-lg">👩‍🏫</span>
                <span className="text-white font-bold text-sm">Professor Real</span>
                <span className="ml-auto text-emerald-200 text-xs">Foto real • Voz natural</span>
              </div>
              <div className="flex flex-col items-center gap-3 py-4 px-4">
                {(() => {
                  const langCode = lesson?.languageCode || 'en-US';
                  const t57Base = TEACHERS_57.find(t => t.langCode === langCode || t.voiceLang === langCode)
                    || TEACHERS_57.find(t => langCode.startsWith(t.langCode.split('-')[0]))
                    || TEACHERS_57[0];
                  const realPhoto = teacher
                    ? ((teacher as any).photoUrl || (teacher as any).photo_url || t57Base.photo)
                    : t57Base.photo;
                  const realName = teacher ? teacher.name : t57Base.name;
                  const speakText = teacherText || exercise.question || t57Base.greeting;
                  return (
                    <div className="flex flex-col items-center gap-3 w-full">
                      <div className="relative">
                        <img
                          src={realPhoto}
                          alt={realName}
                          className="w-28 h-28 rounded-full object-cover border-4 border-emerald-400 shadow-lg"
                          onError={(e) => { (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(realName) + '&background=10b981&color=fff&size=128'; }}
                        />
                        <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs shadow">
                          🎤
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-gray-800 text-base">{realName}</div>
                        <div className="text-xs text-emerald-600 font-medium">{(t57Base as any).specialty || 'Professor Nativo'}</div>
                      </div>
                      <div className="w-full bg-white rounded-xl p-3 border border-emerald-200 shadow-sm">
                        <p className="text-sm text-gray-700 italic text-center">"{speakText}"</p>
                      </div>
                      <button
                        onClick={() => {
                          speakNaturalVoice(speakText, langCode || 'en-US', { rate: 0.9, gender: (teacher as any)?.gender === 'male' ? 'male' : 'female' });
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-all active:scale-95 shadow"
                      >
                        🔊 Ouvir Professor
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Exercise Question - Palavras Clicáveis Estilo EWA */}
            <div className="text-center space-y-4">
              <h2 className="text-xl font-semibold">
                <ClickableText 
                  text={exercise.question} 
                  languageCode={lesson?.languageCode?.split('-')[0] || 'en'}
                />
              </h2>
              
              {/* Audio Button */}
              {(exercise as any).audioText && (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => playAudio((exercise as any).audioText!)}
                  className="mx-auto"
                  disabled={generateAudio.isPending}
                >
                  <Volume2 className="h-5 w-5 mr-2" />
                  {generateAudio.isPending ? "Gerando..." : "Ouvir Pronúncia"}
                </Button>
              )}
            </div>

            {/* Multiple Choice Exercise - OPÇÕES EMBARALHADAS */}
            {exercise.type === "multiple_choice" && (
              <div className="space-y-3">
                {shuffledOptions.map((option: string, index: number) => {
                  const isSelected = selectedAnswer === index;
                  const isThisCorrect = normalizeAnswer(option) === normalizeAnswer(exercise.correctAnswer || '');
                  const showCorrect = selectedAnswer !== null && isThisCorrect;
                  const showWrong = isSelected && !isCorrect;
                  return (
                    <button
                      key={index}
                      onClick={() => checkAnswer(index)}
                      disabled={selectedAnswer !== null}
                      style={{
                        transform: isSelected && answerAnimation === 'wrong' ? 'translateX(-6px)' : 
                                   isSelected && answerAnimation === 'correct' ? 'scale(1.02)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                      className={`w-full p-4 rounded-xl border-2 text-left font-semibold transition-all duration-200 ${
                        showCorrect
                          ? 'border-green-500 bg-green-50 text-green-800 shadow-md shadow-green-100'
                          : showWrong
                            ? 'border-red-500 bg-red-50 text-red-800 shadow-md shadow-red-100'
                            : selectedAnswer !== null
                              ? 'border-gray-200 bg-gray-50 text-gray-400'
                              : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50 hover:shadow-md active:scale-[0.98]'
                      } ${selectedAnswer !== null ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex-1">{option}</span>
                        {showCorrect && <Check className="h-5 w-5 text-green-600 flex-shrink-0" />}
                        {showWrong && <X className="h-5 w-5 text-red-600 flex-shrink-0" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Fill in the Blank Exercise */}
            {(exercise.type === 'fill_blank' || exercise.type === 'translation') && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={userTextAnswer}
                    onChange={(e) => setUserTextAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && isCorrect === null && checkTextAnswer()}
                    placeholder="Digite sua resposta..."
                    disabled={isCorrect !== null}
                    className={`flex-1 p-3 border-2 rounded-lg text-lg font-medium focus:outline-none ${
                      isCorrect === true ? 'border-green-500 bg-green-50' :
                      isCorrect === false ? 'border-red-500 bg-red-50' :
                      'border-gray-300 focus:border-blue-500'
                    }`}
                  />
                  <button
                    onClick={checkTextAnswer}
                    disabled={isCorrect !== null || !userTextAnswer.trim()}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Verificar
                  </button>
                </div>
                {isCorrect !== null && (
                  <div className={`p-3 rounded-lg font-semibold ${
                    isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {isCorrect ? '✅ Correto!' : `❌ Resposta correta: ${exercise.correctAnswer}`}
                  </div>
                )}
                {exercise.options && exercise.options.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-500 mb-2">Dica - escolha uma das opções:</p>
                    <div className="flex flex-wrap gap-2">
                      {exercise.options.map((opt: string, i: number) => (
                        <button
                          key={i}
                          onClick={() => setUserTextAnswer(opt)}
                          disabled={isCorrect !== null}
                          className="px-3 py-1 bg-gray-100 hover:bg-blue-100 border border-gray-300 rounded-full text-sm"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {/* Pronunciation Exercise */}
            {exercise.type === "speaking" && (
              <div className="space-y-6">
                <div className="text-center p-6 bg-blue-50 rounded-lg">
                  <p className="text-3xl font-bold text-blue-900 mb-2">
                    "{exercise.correctAnswer || 'Pratique sua pronúncia'}"
                  </p>
                  <p className="text-sm text-gray-600">
                    Grave sua pronúncia e receba feedback em tempo real
                  </p>
                </div>

                {/* Recording Controls */}
                <div className="flex flex-col items-center gap-4">
                  {!isRecording && !audioBlob && (
                    <Button
                      size="lg"
                      onClick={startRecording}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Mic className="h-5 w-5 mr-2" />
                      Começar Gravação
                    </Button>
                  )}

                  {isRecording && (
                    <div className="flex flex-col items-center gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-4 w-4 bg-red-600 rounded-full animate-pulse"></div>
                        <span className="text-lg font-semibold">Gravando...</span>
                      </div>
                      <Button
                        size="lg"
                        onClick={stopRecording}
                        variant="outline"
                      >
                        <Square className="h-5 w-5 mr-2" />
                        Parar Gravação
                      </Button>
                    </div>
                  )}

                  {audioBlob && !pronunciationResult && (
                    <div className="flex gap-3">
                      <Button
                        size="lg"
                        onClick={analyzePronunciation}
                        className="bg-green-600 hover:bg-green-700"
                        disabled={analyzePronunciationMutation.isPending}
                      >
                        <Check className="h-5 w-5 mr-2" />
                        {analyzePronunciationMutation.isPending ? "Analisando..." : "Analisar Pronúncia"}
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={() => {
                          setAudioBlob(null);
                          setPronunciationResult(null);
                        }}
                      >
                        <RotateCcw className="h-5 w-5 mr-2" />
                        Gravar Novamente
                      </Button>
                    </div>
                  )}
                </div>

                {/* Pronunciation Result */}
                {pronunciationResult && (
                  <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300">
                    <CardContent className="p-6 space-y-4">
                      <div className="text-center">
                        <div className="text-5xl font-bold text-green-600 mb-2">
                          {pronunciationResult.accuracy}%
                        </div>
                        <p className="text-gray-600">Precisão da pronúncia</p>
                      </div>
                      
                      <div className="bg-white p-4 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Você disse:</p>
                        <p className="text-lg font-medium">{pronunciationResult.transcription}</p>
                      </div>
                      
                      <div className="bg-white p-4 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Feedback:</p>
                        <p className="text-lg">{pronunciationResult.feedback}</p>
                      </div>
                      
                      <Button
                        className="w-full"
                        variant="outline"
                        onClick={() => {
                          setAudioBlob(null);
                          setPronunciationResult(null);
                        }}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Tentar Novamente
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  if (currentExercise > 0) {
                    setCurrentExercise(currentExercise - 1);
                    setSelectedAnswer(null);
                    setIsCorrect(null);
                    setAudioBlob(null);
                    setPronunciationResult(null);
                  }
                }}
                disabled={currentExercise === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>

              <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFastMode(f => !f)}
                  className={fastMode ? "border-green-500 text-green-600 bg-green-50" : ""}
                  title={fastMode ? "Modo Rápido ativo — desativar" : "Ativar Modo Rápido"}
                >
                  {fastMode ? "⚡ Rápido" : "⏱ Normal"}
                </Button>

              {currentExercise < exercises.length - 1 ? (
                <Button
                  onClick={nextExercise}
                  disabled={selectedAnswer === null && exercise.type === "multiple_choice"}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Próximo
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={completeLesson}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={completeLessonMutation.isPending}
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  {completeLessonMutation.isPending ? "Salvando..." : "Completar Lição"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
        )} {/* end lessonMode === 'exercises' */}
      </div>
    </div>
      {/* Professor Conversacional Contínuo — flutuante em toda a aula */}
      {lesson && teacher && (
        <LiveLessonTeacher
          teacherName={teacher.name || "Professor"}
          teacherPhoto={teacher.photoUrl || undefined}
          targetLang={lesson.languageCode || "en-US"}
          nativeLang="Português"
          level={((lesson as any).courseLevel as "beginner" | "intermediate" | "advanced") || "beginner"}
          lessonTopic={lesson.title || "Vocabulário"}
          lessonNumber={(lesson as any).orderIndex || 1}
          countryCode="BR"
          autoGreet={true}
          position="bottom-right"
        />
      )}
    </ContentProtection>
  );
}
