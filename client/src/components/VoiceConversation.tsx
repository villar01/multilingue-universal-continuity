import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Volume2, Loader2, Wifi, WifiOff } from "lucide-react";
import { Button } from "./ui/button";
import { trpc } from "../lib/trpc";
import EnhancedTeacherAvatar from "./EnhancedTeacherAvatar";
import TalkingHeadAvatar from "./TalkingHeadAvatar";
import { useOfflineSyncDB } from "@/hooks/useOfflineSyncDB";
import { createAudioRecorder, microphoneErrorMessage, requestMicrophoneStream } from "@/lib/microphoneAccess";
import { canAttachTeacherVideo } from "@/lib/teacherVideoSession";
import { resolveVoiceConversationTeacher, type VoiceConversationTeacherInput } from "@/lib/voiceConversationTeacher";
import UserGuide from "@/components/UserGuide";
import { toast } from "sonner";
import { ParetoPracticeCycle } from "@/components/ParetoPracticeCycle";
import type { ParetoPracticeTerm } from "@/lib/paretoPracticeCycle";
import type { CEFRLevel } from "@/lib/lesson-levels";
import { useLanguage } from "@/contexts/LanguageContext";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface VoiceConversationProps {
  lessonId: number;
  vocabularyContext?: Array<string | { word: string; translation?: string; example?: string; exampleSentence?: string }>;
  languageCode?: string;
  teacher?: VoiceConversationTeacherInput;
  level?: CEFRLevel;
}

export default function VoiceConversation({
  lessonId,
  vocabularyContext = [],
  languageCode = "en-US",
  teacher: selectedTeacher,
  level = "A1",
}: VoiceConversationProps) {
  const { profile } = useLanguage();
  const nativeLanguage = profile.nativeCode;
  const nativeTag = nativeLanguage.split(/[-_]/)[0]?.toUpperCase() || "XX";
  const targetTag = languageCode.split(/[-_]/)[0]?.toUpperCase() || "XX";
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeTeacherSpeechText, setActiveTeacherSpeechText] = useState("");
  const [activeTeacherAudioUrl, setActiveTeacherAudioUrl] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState(""); // Real-time transcript
  const [teacherEmotion, setTeacherEmotion] = useState<"neutral" | "happy" | "thinking" | "encouraging">("neutral");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [animatedVideoUrl, setAnimatedVideoUrl] = useState<string | null>(null);
  const [cachedVideoUrl, setCachedVideoUrl] = useState<string | null>(null);
  const [cachedPortraitUrl, setCachedPortraitUrl] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [activeParetoTerm, setActiveParetoTerm] = useState<ParetoPracticeTerm | null>(null);

  // Offline sync via IndexedDB
  const offlineDB = useOfflineSyncDB();
  const { cacheMedia, getCachedMediaUrl } = offlineDB;
  const conversationId = `lesson-${lessonId}-${languageCode}`;
  const isPortugueseLesson = languageCode.toLowerCase().startsWith("pt");
  const isEnglishLesson = languageCode.toLowerCase().startsWith("en");
  const selectedCompatibleTeacher = resolveVoiceConversationTeacher(selectedTeacher, languageCode);
  const fallbackTeacher = isPortugueseLesson
    ? {
        avatarId: "professor-ricardo",
        name: "Professor Ricardo",
        gender: "male" as const,
        fallbackLanguage: "pt-BR" as const,
        imageUrl: "/manus-storage/teacher-ricardo-portuguese_5a5c9de8.png",
      }
    : isEnglishLesson ? {
        avatarId: "professora-ingrid",
        name: "Professora Ingrid",
        gender: "female" as const,
        fallbackLanguage: "en-US" as const,
        imageUrl: "/manus-storage/teacher-ingrid-english_b938d99a.png",
      } : {
        avatarId: `teacher-${languageCode.toLowerCase()}`,
        name: "Professor do idioma selecionado",
        gender: "female" as const,
        fallbackLanguage: languageCode,
      };
  const activeTeacher = selectedCompatibleTeacher ?? fallbackTeacher;
  const cachedVideoId = `lesson-video-${lessonId}-${languageCode}`;
  const paretoTerms = vocabularyContext.flatMap((entry): ParetoPracticeTerm[] => {
    if (typeof entry === "string") return [];
    const word = entry.word?.trim();
    const translation = entry.translation?.trim();
    if (!word || !translation) return [];
    return [{ word, translation, example: entry.example || entry.exampleSentence }];
  }).slice(0, 6);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const teacherVideoRef = useRef<HTMLVideoElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const talkingHeadRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null); // Web Speech API
  const activeSpeechSessionRef = useRef(0);
  const audioSessionRef = useRef(0);
  const latestVideoRequestRef = useRef(0);

  useEffect(() => {
    if (!activeTeacher.imageUrl) return;
    void cacheMedia({
      id: `teacher-portrait-${activeTeacher.avatarId}`,
      url: activeTeacher.imageUrl,
      type: "avatar",
    });
  }, [activeTeacher.avatarId, activeTeacher.imageUrl, cacheMedia]);

  useEffect(() => {
    let active = true;
    void getCachedMediaUrl(cachedVideoId).then((url) => {
      if (active && url) setCachedVideoUrl(url);
    });
    return () => { active = false; };
  }, [cachedVideoId, getCachedMediaUrl]);

  useEffect(() => {
    let active = true;
    void getCachedMediaUrl(`teacher-portrait-${activeTeacher.avatarId}`).then((url) => {
      if (active && url) setCachedPortraitUrl(url);
    });
    return () => { active = false; };
  }, [activeTeacher.avatarId, getCachedMediaUrl]);

  // Mutations
  const transcribeAudio = trpc.voiceTranscription.transcribe.useMutation();
  const continueConversation = trpc.bilingualConversation.continue.useMutation();
  const generateTTS = trpc.ttsGoogle.generate.useMutation();
  const animateLivePortrait = trpc.livePortrait.animate.useMutation();
  const offlineAI = trpc.offlineAI.generate.useMutation();

  // Monitor connection status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Conexão restaurada - Avatar fotorrealista disponível");
      // Replay pending conversation turns when back online
      offlineDB.getPendingSync().then(async (pending) => {
        if (pending.length > 0) {
          console.log(`[VoiceConversation] Replaying ${pending.length} pending items`);
          for (const item of pending) {
            if (item.type === "conversation" && item.data) {
              const data = item.data as { conversationId: string; messageCount: number };
              // Find the saved conversation in IndexedDB
              const saved = await offlineDB.getConversations();
              const conv = saved.find((c) => c.id === data.conversationId);
              if (conv && conv.messages.length > 0) {
                // Replay the last user message through the online AI for a better response
                const lastUserMsg = [...conv.messages].reverse().find((m) => m.role === "user");
                if (lastUserMsg) {
                  try {
                    const history = conv.messages.slice(0, -1).map((m) => ({
                      role: m.role,
                      content: m.content,
                    }));
                    const replayed = await continueConversation.mutateAsync({
                      lessonId,
                      history,
                      targetLanguage: languageCode,
                      nativeLanguage,
                      userLevel: level,
                    });
                    // Update the last assistant message with the improved online response
                    const updatedMessages = conv.messages.slice(0, -1);
                    updatedMessages.push({
                      role: "assistant",
                      content: replayed.response,
                      timestamp: Date.now(),
                    });
                    setMessages(updatedMessages.map((m) => ({
                      role: m.role as "user" | "assistant",
                      content: m.content,
                      timestamp: new Date(m.timestamp),
                    })));
                    toast.success("Conversa sincronizada com IA online");
                  } catch (err) {
                    console.error("[VoiceConversation] Replay failed:", err);
                    toast.warning("Sincronização parcial - algumas respostas podem estar limitadas");
                  }
                }
              }
            }
          }
          offlineDB.clearPendingSync();
        }
      });
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("Sem conexão - Usando avatar 3D offline");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Restore conversation from IndexedDB on mount
  useEffect(() => {
    offlineDB.getConversations().then((saved) => {
      const existing = saved.find((c) => c.id === conversationId);
      if (existing && existing.messages.length > 0) {
        setMessages(existing.messages.map((m) => ({
          role: m.role,
          content: m.content,
          timestamp: new Date(m.timestamp),
        })));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  // Persist conversation to IndexedDB whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      offlineDB.saveConversation({
        id: conversationId,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
          timestamp: m.timestamp.getTime(),
        })),
        language: languageCode,
        createdAt: messages[0]?.timestamp.getTime() || Date.now(),
      });
      // If offline, add to pending sync
      if (!offlineDB.isOnline) {
        offlineDB.addPendingSync({
          type: "conversation",
          data: { conversationId, messageCount: messages.length },
          createdAt: Date.now(),
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, conversationId]);

  // Inicializar elemento de áudio e Web Audio API
  useEffect(() => {
    audioElementRef.current = new Audio();
    audioElementRef.current.crossOrigin = "anonymous";
    
    audioElementRef.current.onended = () => {
      if (audioSessionRef.current === activeSpeechSessionRef.current) {
        activeSpeechSessionRef.current += 1;
      }
      setIsSpeaking(false);
      setActiveTeacherSpeechText("");
      setActiveTeacherAudioUrl(null);
      setTeacherEmotion("neutral");
      teacherVideoRef.current?.pause();
      if (teacherVideoRef.current) teacherVideoRef.current.currentTime = 0;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      // Stop TalkingHead animation
      if (talkingHeadRef.current) {
        talkingHeadRef.current.stopSpeaking();
      }
    };

    audioElementRef.current.onplay = () => {
      const video = teacherVideoRef.current;
      if (!video) return;
      video.currentTime = 0;
      void video.play().catch(() => undefined);
    };

    audioElementRef.current.onpause = () => {
      teacherVideoRef.current?.pause();
      setActiveTeacherSpeechText("");
    };
    
    // Inicializar Web Audio API para análise de frequência
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContextClass();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      const source = audioContextRef.current.createMediaElementSource(audioElementRef.current);
      source.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);
    } catch (error) {
      console.error("[VoiceConversation] Error initializing Web Audio API:", error);
    }
    
    return () => {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Iniciar gravação de áudio
  const startRecording = async () => {
    try {
      const stream = await requestMicrophoneStream();
      const mediaRecorder = createAudioRecorder(stream);

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setTeacherEmotion("encouraging");

      // Start Web Speech API for real-time transcription
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = languageCode;

        recognitionRef.current.onresult = (event: any) => {
          let interim = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              // Final result handled by server transcription
            } else {
              interim += event.results[i][0].transcript;
            }
          }
          setInterimTranscript(interim);
        };

        recognitionRef.current.start();
      }
      toast.info("🎤 Gravando... Fale agora!");
    } catch (error: any) {
      console.error("[VoiceConversation] Microphone error:", error);
      toast.error(microphoneErrorMessage(error));
    }
  };

  // Parar gravação
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setInterimTranscript(""); // Clear interim transcript
      setTeacherEmotion("thinking");
      
      // Stop Web Speech API
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }
  };

  // Processar áudio gravado
  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    setTeacherEmotion("thinking");

    try {
      // Convert blob to base64 for upload
      const reader = new FileReader();
      const audioBase64 = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
      });

      // Transcribe with Whisper (includes upload) - use lesson language
      const transcription = await transcribeAudio.mutateAsync({
        audioData: audioBase64,
        language: languageCode.split('-')[0],
      });

      const userText = transcription.text;
      setCurrentTranscript(userText);

      // Add user message
      const userMessage: Message = {
        role: "user",
        content: userText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Get AI response
      const conversationHistory = [...messages, userMessage].map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      let aiResponse: { response: string; suggestions: string[] };
      try {
        aiResponse = await continueConversation.mutateAsync({
          lessonId,
          history: conversationHistory,
          targetLanguage: languageCode,
          nativeLanguage,
          userLevel: level,
        });
      } catch (err) {
        // Fallback: use offlineAI for local response
        console.log("[VoiceConversation] Falling back to offlineAI");
        const offlineResult = await offlineAI.mutateAsync({
          messages: [
            { role: "system", content: `You are a language teacher. Respond in BOTH ${nativeLanguage} and ${languageCode}. Format: [${nativeTag}] Native-language text\n[${targetTag}] Target-language text` },
            ...conversationHistory.map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
          ],
        });
        aiResponse = {
          response: offlineResult.content || `[${nativeTag}] Desculpe, não entendi. Pode repetir?\n[${targetTag}] Sorry, I didn't understand. Can you repeat?`,
          suggestions: [],
        };
      }

      // Parse bilingual response
      const { nativeText, targetText } = parseBilingualResponse(aiResponse.response);

      // Add assistant message
      const assistantMessage: Message = {
        role: "assistant",
        content: `${nativeText}\n\n[${targetTag}] ${targetText}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Generate TTS audio
      const teacherSpeechText = targetText || nativeText;
      const ttsResult = await generateTTS.mutateAsync({
        text: teacherSpeechText,
        languageCode: activeTeacher.fallbackLanguage,
        gender: activeTeacher.gender === "male" ? "MALE" : "FEMALE",
      });

      const speechSession = activeSpeechSessionRef.current + 1;
      activeSpeechSessionRef.current = speechSession;
      audioSessionRef.current = speechSession;

      // HYBRID AVATAR LOGIC. The video is visual-only and may finish after
      // the neural MP3; in that case it is discarded instead of reappearing
      // out of sync with a completed teacher response.
      if (isOnline && activeTeacher.imageUrl) {
        setIsGeneratingVideo(true);
        latestVideoRequestRef.current = speechSession;
        toast.info("🎬 Gerando avatar fotorrealista...");

        void animateLivePortrait.mutateAsync({
            audioUrl: ttsResult.audioUrl,
            imageUrl: activeTeacher.imageUrl,
          }).then((videoResult) => {
            const audio = audioElementRef.current;
            const audioStillPlaying = Boolean(audio && !audio.paused && !audio.ended);
            if (!canAttachTeacherVideo(speechSession, activeSpeechSessionRef.current, audioStillPlaying)) {
              return;
            }

            setAnimatedVideoUrl(videoResult.videoUrl);
            void cacheMedia({ id: cachedVideoId, url: videoResult.videoUrl, type: "video" });
            toast.success("✅ Avatar fotorrealista pronto!");
          }).catch((error) => {
            if (speechSession === activeSpeechSessionRef.current) {
              console.error("[VoiceConversation] LivePortrait error:", error);
              toast.error("Erro ao gerar vídeo. Usando avatar 3D.");
            }
          }).finally(() => {
            if (speechSession === latestVideoRequestRef.current) {
              setIsGeneratingVideo(false);
            }
          });
      }
      
      // O MP3 neural abaixo é a fonte única de áudio em ambos os modos.
      // O avatar offline continua visível, mas não inicia uma segunda reprodução.

      // Play audio
      if (audioElementRef.current) {
        audioElementRef.current.src = ttsResult.audioUrl;
        setActiveTeacherSpeechText(teacherSpeechText);
        setActiveTeacherAudioUrl(ttsResult.audioUrl);
        setIsSpeaking(true);
        setTeacherEmotion("happy");
        await audioElementRef.current.play();
      }

      setCurrentTranscript("");
    } catch (error: any) {
      console.error("[VoiceConversation] Processing error:", error);
      toast.error("Erro ao processar áudio: " + error.message);
      setTeacherEmotion("neutral");
    } finally {
      setIsProcessing(false);
    }
  };

  // Parse bilingual response using the learner's native and target locales.
  const parseBilingualResponse = (response: string): { nativeText: string; targetText: string } => {
    const nativeMarker = `[${nativeTag}]`;
    const targetMarker = `[${targetTag}]`;
    const nativeStart = response.indexOf(nativeMarker);
    const targetStart = response.indexOf(targetMarker);
    const nativeText = nativeStart >= 0
      ? response.slice(nativeStart + nativeMarker.length, targetStart >= 0 ? targetStart : undefined).trim()
      : response;
    const targetText = targetStart >= 0 ? response.slice(targetStart + targetMarker.length).trim() : "";
    return { nativeText, targetText };
  };

  const speakParetoTerm = async (text: string) => {
    if (!text.trim()) return;
    try {
      audioElementRef.current?.pause();
      const ttsResult = await generateTTS.mutateAsync({
        text,
        languageCode: activeTeacher.fallbackLanguage,
        gender: activeTeacher.gender === "male" ? "MALE" : "FEMALE",
      });
      const speechSession = activeSpeechSessionRef.current + 1;
      activeSpeechSessionRef.current = speechSession;
      audioSessionRef.current = speechSession;
      setActiveTeacherSpeechText(text);
      setActiveTeacherAudioUrl(ttsResult.audioUrl);
      setIsSpeaking(true);
      setTeacherEmotion("encouraging");
      if (audioElementRef.current) {
        audioElementRef.current.src = ttsResult.audioUrl;
        await audioElementRef.current.play();
      }
    } catch (error) {
      console.error("[VoiceConversation] Pareto neural speech error:", error);
      toast.error("Não foi possível reproduzir a pronúncia neural agora.");
      setIsSpeaking(false);
      setTeacherEmotion("neutral");
    }
  };

  const playableVideoUrl = isOnline ? animatedVideoUrl : cachedVideoUrl;

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center justify-between gap-2 text-sm">
        {isOnline ? (
          <><Wifi className="w-4 h-4 text-green-500" /> <span className="text-green-600">Online - Avatar Fotorrealista</span></>
        ) : (
          <><WifiOff className="w-4 h-4 text-orange-500" /> <span className="text-orange-600">Offline - Avatar 3D</span></>
        )}
        <UserGuide nativeLang="pt-BR" compact triggerClassName="rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50" />
      </div>

      {/* Avatar Display */}
      <div className="relative">
        {playableVideoUrl && !isGeneratingVideo ? (
          <video
            ref={teacherVideoRef}
            id="photorealistic-video"
            src={playableVideoUrl}
            className="w-full max-w-md mx-auto rounded-lg shadow-lg"
            controls={false}
            muted
            aria-label="Vídeo visual do professor; a voz é reproduzida pelo áudio neural sincronizado"
            onLoadedData={() => {
              const audio = audioElementRef.current;
              const video = teacherVideoRef.current;
              if (audio && video && !audio.paused) {
                video.currentTime = 0;
                void video.play().catch(() => undefined);
              }
            }}
          />
        ) : isGeneratingVideo ? (
          <div className="flex flex-col items-center justify-center h-64 bg-gray-100 rounded-lg">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
            <p className="text-gray-600">Gerando avatar fotorrealista...</p>
          </div>
        ) : !isOnline ? (
          cachedPortraitUrl ? (
            <div className="relative mx-auto w-64 h-64 rounded-2xl overflow-hidden bg-slate-100 shadow-lg">
              <img src={cachedPortraitUrl} alt={activeTeacher.name} className="w-full h-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-slate-950/75 px-3 py-2 text-center text-sm text-white">
                {activeTeacher.name} · disponível offline
              </div>
            </div>
          ) : (
            <TalkingHeadAvatar
              ref={talkingHeadRef}
              avatarId={activeTeacher.avatarId}
              // TalkingHead uses this only for its local visual lip-sync module;
              // the audible source remains the compatible neural MP3 above.
              language={activeTeacher.fallbackLanguage.toLowerCase().startsWith("pt") ? "pt-BR" : "en-US"}
              gender={activeTeacher.gender}
            />
          )
        ) : (
          <EnhancedTeacherAvatar
            imageUrl={activeTeacher.imageUrl}
            teacherName={activeTeacher.name}
            gender={activeTeacher.gender}
            isTeaching={isSpeaking}
            currentText={activeTeacherSpeechText}
            audioUrl={activeTeacherAudioUrl}
            syncOnly
            languageCode={activeTeacher.fallbackLanguage}
            hideNameLabel
          />
        )}
      </div>

      {/* Conversation History */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-lg ${
              msg.role === "user"
                ? "bg-blue-50 ml-8"
                : "bg-green-50 mr-8"
            }`}
          >
            <div className="flex items-start gap-2">
              <span className="font-semibold text-sm">
                {msg.role === "user" ? "Você:" : `${activeTeacher.name}:`}
              </span>
              <span className="text-xs text-gray-500">
                {msg.timestamp.toLocaleTimeString()}
              </span>
            </div>
            <p className="mt-1 whitespace-pre-wrap">{msg.content}</p>
          </div>
        ))}
      </div>

      {/* Pareto vocabulary practice */}
      {paretoTerms.length > 0 && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4" aria-label="Prática Pareto da conversa por voz">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-amber-950">Prática Pareto da conversa</p>
              <p className="mt-1 text-xs text-amber-900">Recupere, escreva e crie uma frase com o vocabulário desta lição.</p>
            </div>
            {activeParetoTerm && <Button variant="outline" size="sm" onClick={() => setActiveParetoTerm(null)}>Fechar prática</Button>}
          </div>
          {!activeParetoTerm && (
            <div className="mt-3 flex flex-wrap gap-2">
              {paretoTerms.map((term) => (
                <Button key={term.word} size="sm" variant="outline" className="border-amber-300 bg-white text-amber-950 hover:bg-amber-100" onClick={() => setActiveParetoTerm(term)}>
                  Praticar {term.word}
                </Button>
              ))}
            </div>
          )}
          {activeParetoTerm && (
            <div className="mt-4">
              <ParetoPracticeCycle term={activeParetoTerm} level={level} onClose={() => setActiveParetoTerm(null)} onSpeak={speakParetoTerm} embedded />
            </div>
          )}
        </section>
      )}

      {/* Current Transcript */}
      {currentTranscript && (
        <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-gray-700">
            <strong>Transcrito:</strong> {currentTranscript}
          </p>
        </div>
      )}

      {/* Real-time Transcript */}
      {interimTranscript && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-600 font-semibold mb-1">Você está dizendo:</p>
          <p className="text-lg text-blue-900">{interimTranscript}</p>
        </div>
      )}

      {/* Recording Controls */}
      <div className="flex items-center justify-center gap-4">
        <Button
          size="lg"
          variant={isRecording ? "destructive" : "default"}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing || isSpeaking}
          className="gap-2"
        >
          {isRecording ? (
            <>
              <MicOff className="w-5 h-5" />
              Parar Gravação
            </>
          ) : (
            <>
              <Mic className="w-5 h-5" />
              {isProcessing ? "Processando..." : "Falar com Professor"}
            </>
          )}
        </Button>

        {isProcessing && (
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        )}

        {isSpeaking && (
          <div className="flex items-center gap-2 text-green-600">
            <Volume2 className="w-5 h-5 animate-pulse" />
            <span className="text-sm">Professor falando...</span>
          </div>
        )}
      </div>
    </div>
  );
}
