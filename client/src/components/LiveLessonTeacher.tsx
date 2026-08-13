/**
 * LiveLessonTeacher — Professor conversacional contínuo
 *
 * Professor flutuante que:
 * - Fala naturalmente sobre a aula (como apresentador de TV)
 * - Reage às respostas do aluno em tempo real
 * - Bloqueia assuntos proibidos por lei do país com explicação clara
 * - Sugere como mudar de assunto quando necessário
 * - Usa voz neural via Edge TTS do servidor
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useStreamingText } from "@/hooks/useStreamingText";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { speakText as speakNaturalVoice } from "@/hooks/useNaturalVoice";
import { stopEdgeTTS } from "@/lib/edgeTTSClient";
import { CEFR_LEVELS, type CEFRLevel } from "@/lib/lesson-levels";
import {
  MessageSquare, X, Minimize2, Maximize2, Volume2, VolumeX,
  Send, Mic, MicOff, AlertTriangle, ChevronRight, Sparkles,
  BookOpen, Globe, Shield
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "teacher" | "student";
  content: string;
  blocked?: boolean;
  suggestedTopics?: string[];
  expression?: "neutral" | "happy" | "thinking" | "question" | "encouraging";
  timestamp: Date;
}

interface LiveLessonTeacherProps {
  teacherName?: string;
  teacherPhoto?: string;
  targetLang?: string;
  nativeLang?: string;
  level?: CEFRLevel;
  lessonTopic?: string;
  lessonNumber?: number;
  countryCode?: string;
  autoGreet?: boolean;
  position?: "bottom-right" | "bottom-left";
  onSpeakText?: (text: string) => void;
}

// ─── Expression Emoji ─────────────────────────────────────────────────────────

const EXPRESSION_EMOJI: Record<string, string> = {
  neutral: "😊",
  happy: "😄",
  thinking: "🤔",
  question: "❓",
  encouraging: "👏",
};

// ─── Lip Sync Animation ───────────────────────────────────────────────────────

function LipSyncBars({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
      {[1, 2, 3, 2, 1].map((h, i) => (
        <div
          key={i}
          className="w-1 bg-white rounded-full opacity-90"
          style={{
            height: `${h * 3}px`,
            animation: `lipSync${i} 0.${2 + i}s ease-in-out infinite alternate`,
          }}
        />
      ))}
      <style>{`
        @keyframes lipSync0 { from { transform: scaleY(0.3); } to { transform: scaleY(1); } }
        @keyframes lipSync1 { from { transform: scaleY(0.4); } to { transform: scaleY(1); } }
        @keyframes lipSync2 { from { transform: scaleY(0.2); } to { transform: scaleY(1); } }
        @keyframes lipSync3 { from { transform: scaleY(0.5); } to { transform: scaleY(1); } }
        @keyframes lipSync4 { from { transform: scaleY(0.3); } to { transform: scaleY(1); } }
      `}</style>
    </div>
  );
}

// ─── Teacher Avatar Bubble ────────────────────────────────────────────────────

function TeacherBubble({
  photo,
  name,
  expression,
  isSpeaking,
  onClick,
  hasUnread,
}: {
  photo?: string;
  name: string;
  expression: string;
  isSpeaking: boolean;
  onClick: () => void;
  hasUnread: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative w-16 h-16 rounded-full overflow-hidden shadow-2xl border-4 transition-all duration-300 hover:scale-110 active:scale-95 ${
        isSpeaking
          ? "border-blue-400 shadow-blue-400/50 animate-pulse"
          : "border-white/80 hover:border-blue-300"
      }`}
      title={`Falar com ${name}`}
    >
      {photo ? (
        <img src={photo} alt={name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl">
          👨‍🏫
        </div>
      )}
      <LipSyncBars active={isSpeaking} />
      <div className="absolute -top-1 -right-1 text-base leading-none">
        {EXPRESSION_EMOJI[expression] || "😊"}
      </div>
      {hasUnread && (
        <div className="absolute top-0 left-0 w-3 h-3 bg-red-500 rounded-full border border-white animate-bounce" />
      )}
    </button>
  );
}

// ─── Blocked Content Notice ───────────────────────────────────────────────────

function BlockedNotice({
  explanation,
  legalNote,
  redirect,
  suggestedTopics,
  onSelectTopic,
}: {
  explanation: string;
  legalNote?: string;
  redirect?: string;
  suggestedTopics?: string[];
  onSelectTopic: (topic: string) => void;
}) {
  return (
    <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 space-y-2">
      <div className="flex items-start gap-2">
        <Shield className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-800">{explanation}</p>
          {legalNote && (
            <p className="text-xs text-amber-600 mt-1">{legalNote}</p>
          )}
        </div>
      </div>
      {redirect && (
        <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-lg p-2">
          <ChevronRight className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
          <p className="text-xs text-green-700">{redirect}</p>
        </div>
      )}
      {suggestedTopics && suggestedTopics.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-1.5">Sugestões para continuar:</p>
          <div className="flex flex-wrap gap-1">
            {suggestedTopics.map((topic, i) => (
              <button
                key={i}
                onClick={() => onSelectTopic(topic)}
                className="px-2 py-1 bg-blue-100 text-blue-700 border border-blue-200 rounded-full text-xs hover:bg-blue-200 transition-colors"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Streaming Teacher Message ─────────────────────────────────────────────────

function StreamingTeacherMessage({ content, isLast }: { content: string; isLast: boolean }) {
  const { displayed, isStreaming } = useStreamingText(isLast ? content : "", 35);
  if (!isLast) {
    return <>{content}</>;
  }
  return (
    <>
      {displayed}
      {isStreaming && <span className="inline-block w-1 h-3.5 bg-gray-400 ml-0.5 animate-pulse rounded-sm" />}
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LiveLessonTeacher({
  teacherName = "Professor",
  teacherPhoto,
  targetLang = "English",
  nativeLang = "Português",
  level = "A1",
  lessonTopic = "Vocabulário Básico",
  lessonNumber = 1,
  countryCode = "BR",
  autoGreet = true,
  position = "bottom-right",
  onSpeakText,
}: LiveLessonTeacherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [expression, setExpression] = useState<string>("neutral");
  const [hasUnread, setHasUnread] = useState(false);
  const [greeted, setGreeted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<{ stop: () => void } | null>(null);

  const chatMutation = trpc.liveTeacher.chat.useMutation();
  const introduceMutation = trpc.liveTeacher.introduce.useMutation();
  const ttsMutation = trpc.tts.speak.useMutation();

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-greet when opened for first time
  useEffect(() => {
    if (isOpen && !greeted && autoGreet) {
      setGreeted(true);
      handleIntroduce();
    }
  }, [isOpen]);

  // Mark unread when closed and new message arrives
  useEffect(() => {
    if (!isOpen && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === "teacher") setHasUnread(true);
    }
  }, [messages, isOpen]);

  const speakText = useCallback(async (text: string) => {
    if (isMuted) return;
    setIsSpeaking(true);
    if (onSpeakText) {
      onSpeakText(text);
      setTimeout(() => setIsSpeaking(false), text.length * 60);
      return;
    }
    try {
      const voiceLang = targetLang.toLowerCase().startsWith("pt") ? "pt-BR" : targetLang.length <= 10 ? targetLang : "en-US";
      const result = await ttsMutation.mutateAsync({
        text: text.substring(0, 300),
        voiceLang,
      });
      if (result.success && result.audioBase64) {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = "";
        }
        const audioSrc = `data:${result.mimeType};base64,${result.audioBase64}`;
        const audio = new Audio(audioSrc);
        audioRef.current = audio;
        audio.onended = () => setIsSpeaking(false);
        audio.onerror = () => setIsSpeaking(false);
        await audio.play();
      } else {
        setIsSpeaking(false);
      }
    } catch {
      // Fallback: Edge TTS Neural
      stopEdgeTTS();
      speakNaturalVoice(text.substring(0, 200), targetLang.toLowerCase().startsWith("pt") ? "pt-BR" : "en-US", {
        onEnd: () => setIsSpeaking(false),
      });
    }
  }, [isMuted, targetLang, ttsMutation, onSpeakText]);

  const addMessage = useCallback((msg: Omit<Message, "id" | "timestamp">) => {
    const newMsg: Message = {
      ...msg,
      id: Math.random().toString(36).slice(2),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMsg]);
    return newMsg;
  }, []);

  const handleIntroduce = useCallback(async () => {
    try {
      const result = await introduceMutation.mutateAsync({
        teacherName,
        targetLang,
        nativeLang,
        level,
        lessonTopic,
        lessonNumber,
        countryCode,
      });
      setExpression(result.teacherExpression);
      addMessage({
        role: "teacher",
        content: result.content,
        expression: result.teacherExpression,
      });
      await speakText(result.content);
    } catch {
      const fallback = `Olá! Sou ${teacherName}. Hoje vamos aprender sobre "${lessonTopic}" em ${targetLang}. Pode me perguntar qualquer coisa sobre a aula!`;
      addMessage({ role: "teacher", content: fallback, expression: "happy" });
      await speakText(fallback);
    }
  }, [teacherName, targetLang, nativeLang, level, lessonTopic, lessonNumber, countryCode]);

  const handleSend = useCallback(async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg) return;
    setInput("");

    addMessage({ role: "student", content: msg });

    try {
      const history = messages.slice(-8).map(m => ({
        role: m.role === "teacher" ? "assistant" as const : "user" as const,
        content: m.content,
      }));

      const result = await chatMutation.mutateAsync({
        message: msg,
        teacherName,
        targetLang,
        nativeLang,
        level,
        lessonTopic,
        lessonNumber,
        countryCode,
        history,
      });

      setExpression(result.teacherExpression);
      addMessage({
        role: "teacher",
        content: result.content,
        blocked: result.blocked,
        suggestedTopics: result.suggestedTopics,
        expression: result.teacherExpression,
      });

      if (!result.blocked) {
        await speakText(result.content);
      }
    } catch {
      addMessage({
        role: "teacher",
        content: "Desculpe, tive um problema técnico. Tente novamente!",
        expression: "thinking",
      });
    }
  }, [input, messages, teacherName, targetLang, nativeLang, level, lessonTopic, lessonNumber, countryCode]);

  const handleVoiceInput = useCallback(() => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      toast.error("Reconhecimento de voz não suportado neste navegador.");
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionAPI: any = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognitionAPI();
    recognition.lang = nativeLang.toLowerCase().startsWith("pt") ? "pt-BR" : "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening, nativeLang]);

  const positionClass = position === "bottom-left"
    ? "bottom-6 left-6"
    : "bottom-6 right-6";

  return (
    <div className={`fixed ${positionClass} z-50 flex flex-col items-end gap-2`}>
      {/* Chat Panel */}
      {isOpen && !isMinimized && (
        <div
          className="bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          style={{ width: 340, maxHeight: 520 }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full overflow-hidden border-2 border-white/50 ${isSpeaking ? "ring-2 ring-blue-300 ring-offset-1" : ""}`}>
                {teacherPhoto ? (
                  <img src={teacherPhoto} alt={teacherName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-white/20 flex items-center justify-center text-sm">👨‍🏫</div>
                )}
              </div>
              <div>
                <p className="text-white font-semibold text-sm leading-tight">{teacherName}</p>
                <div className="flex items-center gap-1">
                  <Badge className="bg-white/20 text-white text-xs px-1.5 py-0">{level} · {CEFR_LEVELS[level].label}</Badge>
                  <span className="text-white/70 text-xs">{targetLang}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="text-white/70 hover:text-white p-1 rounded transition-colors"
                title={isMuted ? "Ativar voz" : "Silenciar"}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
              <button
                onClick={() => setIsMinimized(true)}
                className="text-white/70 hover:text-white p-1 rounded transition-colors"
              >
                <Minimize2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/70 hover:text-white p-1 rounded transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Lesson context bar */}
          <div className="bg-blue-50 border-b border-blue-100 px-3 py-1.5 flex items-center gap-2">
            <BookOpen className="h-3.5 w-3.5 text-blue-500 shrink-0" />
            <p className="text-xs text-blue-700 truncate">
              Aula {lessonNumber}: <span className="font-semibold">{lessonTopic}</span>
            </p>
            <Globe className="h-3 w-3 text-blue-400 shrink-0 ml-auto" />
            <span className="text-xs text-blue-500">{countryCode}</span>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-3" ref={scrollRef as React.RefObject<HTMLDivElement>}>
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="text-4xl mb-2">👨‍🏫</div>
                <p className="text-sm text-gray-500">
                  {teacherName} está pronto para ajudar!
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Pergunte sobre a aula ou pratique conversação
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex gap-2 ${msg.role === "student" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    {msg.role === "teacher" && (
                      <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 mt-0.5">
                        {teacherPhoto ? (
                          <img src={teacherPhoto} alt={teacherName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-xs">
                            {EXPRESSION_EMOJI[msg.expression || "neutral"]}
                          </div>
                        )}
                      </div>
                    )}
                    <div className={`max-w-[80%] space-y-1 ${msg.role === "student" ? "items-end" : "items-start"} flex flex-col`}>
                      {msg.blocked ? (
                        <BlockedNotice
                          explanation={msg.content.split("\n\n")[0]}
                          legalNote={msg.content.split("**Nota legal:** ")[1]?.split("\n\n")[0]}
                          redirect={msg.content.split("**Vamos mudar de assunto?** ")[1]}
                          suggestedTopics={msg.suggestedTopics}
                          onSelectTopic={(topic) => handleSend(topic)}
                        />
                      ) : (
                        <div
                          className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                            msg.role === "teacher"
                              ? "bg-gray-100 text-gray-800 rounded-tl-sm"
                              : "bg-blue-600 text-white rounded-tr-sm"
                          }`}
                        >
                          {msg.role === "teacher" ? (
                            <StreamingTeacherMessage
                              content={msg.content}
                              isLast={msg.id === messages[messages.length - 1]?.id && msg.role === "teacher"}
                            />
                          ) : (
                            msg.content
                          )}
                        </div>
                      )}
                      <span className="text-xs text-gray-400">
                        {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                ))}
                {chatMutation.isPending && (
                  <div className="flex gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-xs shrink-0">
                      🤔
                    </div>
                    <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-3 py-2 flex gap-1 items-center">
                      {[0, 1, 2].map(i => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Quick suggestions */}
          <div className="px-3 py-1.5 border-t border-gray-100 flex gap-1 overflow-x-auto">
            {["O que significa?", "Como pronunciar?", "Dê um exemplo", "Próxima lição"].map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                className="shrink-0 px-2 py-1 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-100 flex gap-2">
            <Textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={`Pergunte ao ${teacherName}...`}
              className="resize-none text-sm min-h-[40px] max-h-[80px] py-2"
              rows={1}
            />
            <div className="flex flex-col gap-1">
              <Button
                size="sm"
                onClick={() => handleSend()}
                disabled={!input.trim() || chatMutation.isPending}
                className="h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleVoiceInput}
                className={`h-8 w-8 p-0 ${isListening ? "bg-red-50 border-red-300 text-red-600" : ""}`}
              >
                {isListening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Minimized bar */}
      {isOpen && isMinimized && (
        <div className="bg-white rounded-full shadow-xl border border-gray-200 px-4 py-2 flex items-center gap-2">
          <div className="w-6 h-6 rounded-full overflow-hidden">
            {teacherPhoto ? (
              <img src={teacherPhoto} alt={teacherName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-xs">👨‍🏫</div>
            )}
          </div>
          <span className="text-sm font-medium text-gray-700">{teacherName}</span>
          <button onClick={() => setIsMinimized(false)} className="text-blue-600 hover:text-blue-800">
            <Maximize2 className="h-4 w-4" />
          </button>
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Floating bubble */}
      {!isOpen && (
        <div className="flex flex-col items-center gap-1">
          <div
            className="bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 shadow text-xs text-gray-600 font-medium animate-bounce"
            style={{ animationDuration: "2s" }}
          >
            {teacherName}
          </div>
          <TeacherBubble
            photo={teacherPhoto}
            name={teacherName}
            expression={expression}
            isSpeaking={isSpeaking}
            hasUnread={hasUnread}
            onClick={() => {
              setIsOpen(true);
              setHasUnread(false);
            }}
          />
          <div className="flex items-center gap-1 text-xs text-white/80 bg-black/30 rounded-full px-2 py-0.5 backdrop-blur-sm">
            <Sparkles className="h-3 w-3" />
            <span>IA</span>
          </div>
        </div>
      )}
    </div>
  );
}
