import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Volume2, Loader2, Wifi, WifiOff } from "lucide-react";
import { Button } from "./ui/button";
import { trpc } from "../lib/trpc";
import EnhancedTeacherAvatar from "./EnhancedTeacherAvatar";
import TalkingHeadAvatar from "./TalkingHeadAvatar";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface VoiceConversationProps {
  lessonId: number;
  vocabularyContext?: string[];
  languageCode?: string;
}

export default function VoiceConversation({
  lessonId,
  vocabularyContext = [],
  languageCode = "en-US",
}: VoiceConversationProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState(""); // Real-time transcript
  const [teacherEmotion, setTeacherEmotion] = useState<"neutral" | "happy" | "thinking" | "encouraging">("neutral");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [animatedVideoUrl, setAnimatedVideoUrl] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const talkingHeadRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null); // Web Speech API

  // Mutations
  const transcribeAudio = trpc.voiceTranscription.transcribe.useMutation();
  const continueConversation = trpc.bilingualConversation.continue.useMutation();
  const generateTTS = trpc.tts.generate.useMutation();
  const animateLivePortrait = trpc.livePortrait.animate.useMutation();
  const offlineAI = trpc.offlineAI.generate.useMutation();

  // Monitor connection status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Conexão restaurada - Avatar fotorrealista disponível");
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
  }, []);

  // Inicializar elemento de áudio e Web Audio API
  useEffect(() => {
    audioElementRef.current = new Audio();
    audioElementRef.current.crossOrigin = "anonymous";
    
    audioElementRef.current.onended = () => {
      setIsSpeaking(false);
      setTeacherEmotion("neutral");
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      // Stop TalkingHead animation
      if (talkingHeadRef.current) {
        talkingHeadRef.current.stopSpeaking();
      }
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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

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
      toast.error("Erro ao acessar microfone. Verifique as permissões.");
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
          nativeLanguage: "pt-BR",
          userLevel: "beginner",
        });
      } catch (err) {
        // Fallback: use offlineAI for local response
        console.log("[VoiceConversation] Falling back to offlineAI");
        const offlineResult = await offlineAI.mutateAsync({
          messages: [
            { role: "system", content: `You are a language teacher. Respond in BOTH Portuguese and ${languageCode}. Format: [PT] Portuguese text\n[${languageCode.substring(0,2).toUpperCase()}] Target language text` },
            ...conversationHistory.map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
          ],
        });
        aiResponse = {
          response: offlineResult.content || "[PT] Desculpe, não entendi. Pode repetir?\n[EN] Sorry, I didn't understand. Can you repeat?",
          suggestions: ["Yes", "No", "Tell me more"],
        };
      }

      // Parse bilingual response
      const { portuguese, english } = parseBilingualResponse(aiResponse.response);

      // Add assistant message
      const assistantMessage: Message = {
        role: "assistant",
        content: `${portuguese}\n\n[EN] ${english}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Generate TTS audio
      const ttsResult = await generateTTS.mutateAsync({
        text: portuguese,
        languageCode: languageCode,
      });

      // HYBRID AVATAR LOGIC
      if (isOnline) {
        // Online: Generate photorealistic video with LivePortrait
        setIsGeneratingVideo(true);
        toast.info("🎬 Gerando avatar fotorrealista...");
        
        try {
          const videoResult = await animateLivePortrait.mutateAsync({
            audioUrl: ttsResult.audioUrl,
            imageUrl: "/professor-ricardo.jpg", // Static photo
          });

          setAnimatedVideoUrl(videoResult.videoUrl);
          
          // Play video
          const videoElement = document.getElementById("photorealistic-video") as HTMLVideoElement;
          if (videoElement) {
            videoElement.src = videoResult.videoUrl;
            videoElement.play();
          }
          
          setIsGeneratingVideo(false);
          toast.success("✅ Avatar fotorrealista pronto!");
        } catch (error) {
          console.error("[VoiceConversation] LivePortrait error:", error);
          toast.error("Erro ao gerar vídeo. Usando avatar 3D.");
          setIsOnline(false); // Fallback to offline mode
        }
      }
      
      if (!isOnline) {
        // Offline: Use TalkingHead 3D avatar
        if (talkingHeadRef.current) {
          talkingHeadRef.current.speakWithAudio(ttsResult.audioUrl);
        }
      }

      // Play audio
      if (audioElementRef.current) {
        audioElementRef.current.src = ttsResult.audioUrl;
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

  // Parse bilingual response [PT] ... [EN] ...
  const parseBilingualResponse = (response: string): { portuguese: string; english: string } => {
    const ptMatch = response.match(/\[PT\]\s*([\s\S]*?)(?=\[EN\]|$)/);
    const enMatch = response.match(/\[EN\]\s*([\s\S]*?)$/);

    const portuguese = ptMatch ? ptMatch[1].trim() : response;
    const english = enMatch ? enMatch[1].trim() : "";

    return { portuguese, english };
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center gap-2 text-sm">
        {isOnline ? (
          <><Wifi className="w-4 h-4 text-green-500" /> <span className="text-green-600">Online - Avatar Fotorrealista</span></>
        ) : (
          <><WifiOff className="w-4 h-4 text-orange-500" /> <span className="text-orange-600">Offline - Avatar 3D</span></>
        )}
      </div>

      {/* Avatar Display */}
      <div className="relative">
        {isOnline && animatedVideoUrl && !isGeneratingVideo ? (
          <video
            id="photorealistic-video"
            src={animatedVideoUrl}
            className="w-full max-w-md mx-auto rounded-lg shadow-lg"
            controls={false}
            autoPlay
            loop
            muted={false}
          />
        ) : isGeneratingVideo ? (
          <div className="flex flex-col items-center justify-center h-64 bg-gray-100 rounded-lg">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
            <p className="text-gray-600">Gerando avatar fotorrealista...</p>
          </div>
        ) : !isOnline ? (
          <TalkingHeadAvatar
            ref={talkingHeadRef}
            avatarId="professor-ricardo"
            language="pt-BR"
            gender="male"
          />
        ) : (
          <EnhancedTeacherAvatar />
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
                {msg.role === "user" ? "Você:" : "Professor Ricardo:"}
              </span>
              <span className="text-xs text-gray-500">
                {msg.timestamp.toLocaleTimeString()}
              </span>
            </div>
            <p className="mt-1 whitespace-pre-wrap">{msg.content}</p>
          </div>
        ))}
      </div>

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
