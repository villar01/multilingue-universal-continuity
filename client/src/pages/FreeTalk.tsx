import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Streamdown } from "streamdown";
import { useI18n } from "@/lib/i18n";
import { resolvePracticeCEFRLevel, type CEFRLevel } from "@/lib/lesson-levels";

import { ArrowLeft, Send, Mic, MicOff, Volume2, BookOpen, Star, ChevronDown } from "lucide-react";

const LEVELS: { id: CEFRLevel; label: string; color: string }[] = [
  { id: "A1", label: "A1 — primeiros contatos", color: "bg-green-500" },
  { id: "A2", label: "A2 — rotina e situações simples", color: "bg-emerald-500" },
  { id: "B1", label: "B1 — conversa independente", color: "bg-blue-500" },
  { id: "B2", label: "B2 — interação e argumentos", color: "bg-sky-500" },
  { id: "C1", label: "C1 — fluência avançada", color: "bg-purple-500" },
  { id: "C2", label: "C2 — domínio e nuances", color: "bg-rose-500" },
];

// Tópicos sugeridos por categoria
const TOPICS = {
  daily: ["Família", "Casa", "Comida", "Trabalho", "Escola", "Amigos", "Saúde", "Esporte"],
  travel: ["Aeroporto", "Hotel", "Restaurante", "Turismo", "Transporte", "Mapas", "Cultura"],
  business: ["Reunião", "Negociação", "E-mail profissional", "Apresentação", "Entrevista"],
  academic: ["Ciência", "História", "Literatura", "Filosofia", "Tecnologia", "Medicina"],
  free: ["Qualquer assunto", "Contar uma história", "Debate", "Humor", "Notícias"],
};

type Message = {
  role: "user" | "assistant";
  content: string;
  newWords?: string[];
  correction?: string;
  errorType?: "grammar" | "vocabulary" | "pronunciation" | "comprehension" | null;
  adaptiveHint?: string;
  timestamp: number;
};

export default function FreeTalk() {
  const [, navigate] = useLocation();
  const t = useI18n();

  const nativeLang = localStorage.getItem("ml_native_lang") || "pt-BR";
  const targetLang = localStorage.getItem("ml_target_lang") || "en-US";
  const targetLangName = localStorage.getItem("ml_target_lang_name") || "English";

  const [level, setLevel] = useState<CEFRLevel>(() => resolvePracticeCEFRLevel(localStorage.getItem("ml_free_talk_level") || "B1"));
  const [topic, setTopic] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showSetup, setShowSetup] = useState(true);
  const [showTopics, setShowTopics] = useState(false);
  const [totalWords, setTotalWords] = useState(0);
  const [sessionWords, setSessionWords] = useState<string[]>([]);
  const [showVocab, setShowVocab] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const freeChatMutation = trpc.vrConversation.freeChat.useMutation();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleStartConversation = () => {
    const finalTopic = customTopic || topic || "conversa livre";
    localStorage.setItem("ml_free_talk_level", level);

    const welcomeMsg: Message = {
      role: "assistant",
      content: `Olá! Vamos conversar sobre **${finalTopic}** no nível **${selectedLevel.label}**. Pode começar quando quiser. Vou corrigir gentilmente quando necessário e apresentar vocabulário novo conforme conversamos.`,
      timestamp: Date.now(),
    };
    setMessages([welcomeMsg]);
    setShowSetup(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const finalTopic = customTopic || topic || "conversa livre";

      const result = await freeChatMutation.mutateAsync({
        userMessage: userMsg.content,
        history,
        targetLanguage: targetLang,
        nativeLanguage: nativeLang,
        level,
        topic: finalTopic,
      });

      const errorType = result.errorType as Message["errorType"];
      let adaptiveHint = "";
      if (result.correction && errorType) {
        const storageKey = `ml_free_talk_error_patterns_${targetLang}`;
        const previous = JSON.parse(localStorage.getItem(storageKey) || "{}") as Record<string, number>;
        const frequency = (previous[errorType] || 0) + 1;
        localStorage.setItem(storageKey, JSON.stringify({ ...previous, [errorType]: frequency }));
        if (frequency >= 2) {
          const labels: Record<string, string> = {
            grammar: "gramática", vocabulary: "vocabulário", pronunciation: "pronúncia", comprehension: "compreensão",
          };
          adaptiveHint = `Você repetiu dificuldades em ${labels[errorType]}. Vou ajustar as próximas respostas para reforçar este ponto.`;
        }
      }

      const assistantMsg: Message = {
        role: "assistant",
        content: result.reply,
        newWords: result.newWords || [],
        correction: result.correction || "",
        errorType,
        adaptiveHint,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMsg]);

      if (result.newWords && result.newWords.length > 0) {
        setSessionWords(prev => {
          const combined = [...new Set([...prev, ...result.newWords!])];
          setTotalWords(combined.length);
          return combined;
        });
      }
    } catch (err) {
      toast.error("Erro ao enviar mensagem. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const selectedLevel = LEVELS.find(l => l.id === level) || LEVELS[2];

  // Tela de configuração inicial
  if (showSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white">
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <button
              onClick={() => navigate("/ar-teacher")}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold">💬 {t.conversationFree}</h1>
              <p className="text-sm text-white/60">Sem limite de palavras • Todos os níveis • Vocabulário orgânico</p>
            </div>
          </div>

          {/* Idioma */}
          <div className="bg-white/10 rounded-2xl p-4 mb-4 flex items-center gap-3">
            <span className="text-2xl">🌐</span>
            <div>
              <p className="text-xs text-white/60">{t.studyLanguage}</p>
              <p className="font-semibold">{targetLangName}</p>
            </div>
          </div>

          {/* Seletor de Nível */}
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-white/70 mb-3 uppercase tracking-wider">{t.chooseLevel}</h2>
            <div className="grid grid-cols-2 gap-2">
              {LEVELS.map(l => (
                <button
                  key={l.id}
                  onClick={() => setLevel(l.id)}
                  className={`p-3 rounded-xl text-left transition-all ${
                    level === l.id
                      ? "ring-2 ring-purple-400 bg-purple-500/30"
                      : "bg-white/10 hover:bg-white/15"
                  }`}
                >
                  <span className={`inline-block w-2 h-2 rounded-full ${l.color} mr-2`} />
                  <span className="text-sm font-medium">{l.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Seletor de Tópico */}
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-white/70 mb-3 uppercase tracking-wider">{t.topicFree}</h2>

            {/* Tópicos rápidos */}
            <div className="flex flex-wrap gap-2 mb-3">
              {TOPICS.daily.slice(0, 4).map(t => (
                <button
                  key={t}
                  onClick={() => setTopic(t)}
                  className={`px-3 py-1.5 rounded-full text-sm transition ${
                    topic === t ? "bg-purple-500 text-white" : "bg-white/10 hover:bg-white/20"
                  }`}
                >
                  {t}
                </button>
              ))}
              <button
                onClick={() => setShowTopics(!showTopics)}
                className="px-3 py-1.5 rounded-full text-sm bg-white/10 hover:bg-white/20 flex items-center gap-1"
              >
                Mais <ChevronDown className={`w-3 h-3 transition ${showTopics ? "rotate-180" : ""}`} />
              </button>
            </div>

            {showTopics && (
              <div className="space-y-2 mb-3">
                {Object.entries(TOPICS).map(([cat, items]) => (
                  <div key={cat}>
                    <p className="text-xs text-white/40 mb-1 capitalize">{cat}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {items.map(item => (
                        <button
                          key={item}
                          onClick={() => { setTopic(item); setShowTopics(false); }}
                          className={`px-2.5 py-1 rounded-full text-xs transition ${
                            topic === item ? "bg-purple-500 text-white" : "bg-white/10 hover:bg-white/20"
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tópico personalizado */}
            <input
              type="text"
              value={customTopic}
              onChange={e => setCustomTopic(e.target.value)}
              placeholder={t.topicPlaceholder}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          {/* Botão Iniciar */}
          <button
            onClick={handleStartConversation}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl font-bold text-lg hover:from-purple-500 hover:to-blue-500 transition-all active:scale-95"
          >
            🚀 {t.startConversation}
          </button>

          {/* Info */}
          <p className="text-center text-xs text-white/40 mt-4">
            Sem limite de turnos • Vocabulário cresce organicamente • Correção gentil
          </p>
        </div>
      </div>
    );
  }

  // Tela de conversa
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSetup(true)}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <p className="font-semibold text-sm">{targetLangName} • {selectedLevel.id}</p>
            <p className="text-xs text-white/50">{customTopic || topic || "Conversa livre"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowVocab(!showVocab)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{totalWords} {t.wordsLearned}</span>
          </button>
        </div>
      </div>

      {/* Painel de vocabulário */}
      {showVocab && sessionWords.length > 0 && (
        <div className="mx-4 mt-3 p-3 bg-purple-900/50 rounded-xl border border-purple-500/30">
          <p className="text-xs font-semibold text-purple-300 mb-2">📚 Palavras desta sessão:</p>
          <div className="flex flex-wrap gap-1.5">
            {sessionWords.map((w, i) => (
              <span key={i} className="px-2 py-0.5 bg-purple-500/30 rounded-full text-xs text-purple-200">{w}</span>
            ))}
          </div>
        </div>
      )}

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] ${msg.role === "user" ? "order-2" : "order-1"}`}>
              {msg.role === "assistant" && (
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xs">🤖</div>
                  <span className="text-xs text-white/50">{targetLangName}</span>
                </div>
              )}
              <div className={`rounded-2xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-purple-600 text-white rounded-tr-sm"
                  : "bg-white/10 text-white rounded-tl-sm"
              }`}>
                <Streamdown>{msg.content}</Streamdown>
              </div>

              {/* Correção */}
              {msg.correction && (
                <div className="mt-1.5 px-3 py-2 bg-amber-500/20 border border-amber-500/30 rounded-xl text-xs text-amber-200">
                  ✏️ <strong>Correção:</strong> {msg.correction}
                </div>
              )}
              {msg.adaptiveHint && (
                <div className="mt-1.5 px-3 py-2 bg-cyan-500/20 border border-cyan-400/30 rounded-xl text-xs text-cyan-100">
                  🎯 <strong>Plano personalizado:</strong> {msg.adaptiveHint}
                </div>
              )}

              {/* Palavras novas */}
              {msg.newWords && msg.newWords.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {msg.newWords.map((w, j) => (
                    <span key={j} className="px-2 py-0.5 bg-green-500/20 border border-green-500/30 rounded-full text-xs text-green-300">
                      ✨ {w}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/10 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 bg-black/30 backdrop-blur-sm border-t border-white/10">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 bg-white/10 rounded-2xl px-4 py-2.5 border border-white/20 focus-within:border-purple-400 transition">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`${t.typeMessage} ${targetLangName}...`}
              className="flex-1 bg-transparent text-sm placeholder:text-white/40 focus:outline-none"
              disabled={isLoading}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-3 bg-purple-600 rounded-2xl hover:bg-purple-500 transition disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-center text-xs text-white/30 mt-2">
          Sem limite de palavras • Vocabulário cresce com a conversa
        </p>
      </div>
    </div>
  );
}
