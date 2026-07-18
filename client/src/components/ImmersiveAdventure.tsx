/**
 * ImmersiveAdventure — Modo Aventura Imersivo
 * MultiLingue Universal - Aventuras Imersivas com IA Gamificada
 * Cenários interativos onde o aluno pratica o idioma em situações reais
 */
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MapPin, Star, Zap, ChevronRight, Volume2, MessageSquare, Trophy, Heart, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface AdventureScenario {
  id: string;
  title: string;
  location: string;
  emoji: string;
  backgroundGradient: string;
  difficulty: "easy" | "medium" | "hard";
  xpReward: number;
  description: string;
}

const SCENARIOS: AdventureScenario[] = [
  {
    id: "restaurant",
    title: "No Restaurante",
    location: "Paris, França",
    emoji: "🍽️",
    backgroundGradient: "from-orange-950 via-red-950 to-amber-950",
    difficulty: "easy",
    xpReward: 50,
    description: "Peça sua refeição em francês num bistrô parisiense",
  },
  {
    id: "airport",
    title: "No Aeroporto",
    location: "Tokyo, Japão",
    emoji: "✈️",
    backgroundGradient: "from-blue-950 via-indigo-950 to-sky-950",
    difficulty: "medium",
    xpReward: 80,
    description: "Navegue pelo aeroporto de Narita em japonês",
  },
  {
    id: "market",
    title: "No Mercado",
    location: "Barcelona, Espanha",
    emoji: "🛒",
    backgroundGradient: "from-yellow-950 via-orange-950 to-red-950",
    difficulty: "easy",
    xpReward: 50,
    description: "Compre frutas e verduras no mercado La Boqueria",
  },
  {
    id: "hotel",
    title: "No Hotel",
    location: "Berlin, Alemanha",
    emoji: "🏨",
    backgroundGradient: "from-slate-950 via-zinc-900 to-gray-950",
    difficulty: "medium",
    xpReward: 70,
    description: "Faça check-in e resolva problemas no hotel em alemão",
  },
  {
    id: "doctor",
    title: "No Médico",
    location: "Roma, Itália",
    emoji: "🏥",
    backgroundGradient: "from-green-950 via-emerald-950 to-teal-950",
    difficulty: "hard",
    xpReward: 100,
    description: "Descreva seus sintomas ao médico em italiano",
  },
  {
    id: "business",
    title: "Reunião de Negócios",
    location: "New York, EUA",
    emoji: "💼",
    backgroundGradient: "from-purple-950 via-violet-950 to-indigo-950",
    difficulty: "hard",
    xpReward: 120,
    description: "Conduza uma reunião de negócios em inglês formal",
  },
];

interface Message {
  role: "npc" | "player";
  text: string;
  translation?: string;
}

interface ImmersiveAdventureProps {
  languageCode?: string;
  targetLanguage?: string;
  onClose?: () => void;
  onSpeak?: (text: string) => void;
}

export default function ImmersiveAdventure({
  languageCode = "en",
  targetLanguage = "English",
  onClose,
  onSpeak,
}: ImmersiveAdventureProps) {
  const [phase, setPhase] = useState<"select" | "playing" | "complete">("select");
  const [selectedScenario, setSelectedScenario] = useState<AdventureScenario | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [options, setOptions] = useState<string[]>([]);
  const [lives, setLives] = useState(3);
  const [xp, setXp] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);

  const adventureMutation = trpc.adventure.chat.useMutation({
    onSuccess: (data) => {
      const npcText = typeof data.npcMessage === 'string' ? data.npcMessage : String(data.npcMessage);
      const npcTranslation = typeof data.translation === 'string' ? data.translation : String(data.translation ?? '');
      setMessages(prev => [...prev, { role: "npc", text: npcText, translation: npcTranslation }]);
      setOptions(data.options || []);
      setProgress(data.progress || 0);
      setIsLoading(false);
      onSpeak?.(typeof data.npcMessage === 'string' ? data.npcMessage : String(data.npcMessage));
      if (data.isComplete) {
        setTimeout(() => {
          setXp(prev => prev + (selectedScenario?.xpReward || 50));
          setPhase("complete");
        }, 1500);
      }
    },
    onError: () => {
      setIsLoading(false);
      toast.error("Erro na aventura. Tente novamente.");
    },
  });

  const startAdventure = (scenario: AdventureScenario) => {
    setSelectedScenario(scenario);
    setPhase("playing");
    setMessages([]);
    setOptions([]);
    setLives(3);
    setProgress(0);
    setIsLoading(true);
    adventureMutation.mutate({
      scenarioId: scenario.id,
      userMessage: "__START__",
      languageCode,
      targetLanguage,
    });
  };

  const handleOption = (option: string) => {
    if (isLoading) return;
    setMessages(prev => [...prev, { role: "player", text: option }]);
    setIsLoading(true);
    adventureMutation.mutate({
      scenarioId: selectedScenario!.id,
      userMessage: option,
      languageCode,
      targetLanguage,
      history: messages,
    });
  };

  const difficultyColor = (d: string) => {
    if (d === "easy") return "bg-green-600/20 text-green-400 border-green-500/30";
    if (d === "medium") return "bg-yellow-600/20 text-yellow-400 border-yellow-500/30";
    return "bg-red-600/20 text-red-400 border-red-500/30";
  };

  const difficultyLabel = (d: string) => {
    if (d === "easy") return "Fácil";
    if (d === "medium") return "Médio";
    return "Difícil";
  };

  // ── Tela de Seleção ──────────────────────────────────────────────────────
  if (phase === "select") {
    return (
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <span>🗺️</span> Modo Aventura
            </h3>
            <p className="text-white/50 text-xs">Pratique em situações reais do mundo</p>
          </div>
          {onClose && (
            <button onClick={onClose} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
              <X className="w-4 h-4 text-white" />
            </button>
          )}
        </div>
        {/* Grid de cenários */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {SCENARIOS.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => startAdventure(scenario)}
              className={`relative rounded-xl p-3 text-left bg-gradient-to-br ${scenario.backgroundGradient} border border-white/10 hover:border-white/30 transition-all duration-200 hover:scale-105 group`}
            >
              <div className="text-2xl mb-2">{scenario.emoji}</div>
              <p className="text-white font-bold text-sm leading-tight">{scenario.title}</p>
              <p className="text-white/50 text-xs flex items-center gap-1 mt-0.5">
                <MapPin className="w-2.5 h-2.5" /> {scenario.location}
              </p>
              <div className="flex items-center justify-between mt-2">
                <Badge className={`text-xs border ${difficultyColor(scenario.difficulty)}`}>
                  {difficultyLabel(scenario.difficulty)}
                </Badge>
                <span className="text-yellow-400 text-xs font-bold">+{scenario.xpReward} XP</span>
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className="w-4 h-4 text-white" />
              </div>
            </button>
          ))}
        </div>
        {xp > 0 && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-yellow-600/20 border border-yellow-500/30">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400 font-bold text-sm">{xp} XP ganhos nesta sessão</span>
          </div>
        )}
      </div>
    );
  }

  // ── Tela de Jogo ─────────────────────────────────────────────────────────
  if (phase === "playing" && selectedScenario) {
    return (
      <div className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${selectedScenario.backgroundGradient}`} style={{ minHeight: 420 }}>
        {/* Header do jogo */}
        <div className="flex items-center justify-between p-3 bg-black/30 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{selectedScenario.emoji}</span>
            <div>
              <p className="text-white font-bold text-sm">{selectedScenario.title}</p>
              <p className="text-white/50 text-xs flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5" /> {selectedScenario.location}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Vidas */}
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <Heart key={i} className={`w-4 h-4 ${i < lives ? "text-red-400 fill-red-400" : "text-white/20"}`} />
              ))}
            </div>
            {/* XP */}
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-yellow-600/20 border border-yellow-500/30">
              <Zap className="w-3 h-3 text-yellow-400" />
              <span className="text-yellow-400 text-xs font-bold">{selectedScenario.xpReward} XP</span>
            </div>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="px-3 pt-2">
          <Progress value={progress} className="h-1.5 bg-white/10" />
        </div>

        {/* Área de mensagens */}
        <div className="p-3 space-y-2 overflow-y-auto" style={{ maxHeight: 200 }}>
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === "player" ? "justify-end" : "justify-start"}`}>
              {msg.role === "npc" && (
                <div className="flex items-start gap-2 max-w-[85%]">
                  <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-sm">
                    {selectedScenario.emoji}
                  </div>
                  <div>
                    <div className="bg-black/50 backdrop-blur-sm rounded-2xl rounded-tl-none px-3 py-2 border border-white/10">
                      <p className="text-white text-sm">{msg.text}</p>
                      {showTranslation && msg.translation && (
                        <p className="text-white/50 text-xs mt-1 italic">{msg.translation}</p>
                      )}
                    </div>
                    <button
                      onClick={() => onSpeak?.(msg.text)}
                      className="mt-1 p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      <Volume2 className="w-2.5 h-2.5 text-white/70" />
                    </button>
                  </div>
                </div>
              )}
              {msg.role === "player" && (
                <div className="bg-indigo-600/80 backdrop-blur-sm rounded-2xl rounded-tr-none px-3 py-2 max-w-[85%] border border-indigo-400/30">
                  <p className="text-white text-sm">{msg.text}</p>
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-black/50 rounded-2xl rounded-tl-none px-4 py-3 border border-white/10">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Opções de resposta */}
        <div className="p-3 space-y-2">
          <div className="flex items-center justify-between mb-1">
            <p className="text-white/50 text-xs">Escolha sua resposta:</p>
            <button
              onClick={() => setShowTranslation(!showTranslation)}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <MessageSquare className="w-3 h-3" />
              {showTranslation ? "Ocultar" : "Ver"} tradução
            </button>
          </div>
          {options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleOption(opt)}
              disabled={isLoading}
              className="w-full text-left px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/30 text-white text-sm transition-all duration-200 disabled:opacity-50"
            >
              <span className="text-white/50 mr-2">{String.fromCharCode(65 + idx)}.</span>
              {opt}
            </button>
          ))}
          {options.length === 0 && !isLoading && (
            <p className="text-white/40 text-xs text-center">Aguardando resposta do NPC...</p>
          )}
        </div>
      </div>
    );
  }

  // ── Tela de Conclusão ────────────────────────────────────────────────────
  if (phase === "complete" && selectedScenario) {
    return (
      <div className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${selectedScenario.backgroundGradient} p-6 text-center`}>
        <div className="w-16 h-16 rounded-2xl bg-yellow-500/20 flex items-center justify-center mx-auto mb-3 shadow-2xl">
          <Trophy className="w-8 h-8 text-yellow-400" />
        </div>
        <h3 className="text-white font-bold text-xl mb-1">Aventura Concluída!</h3>
        <p className="text-white/60 text-sm mb-4">{selectedScenario.title} — {selectedScenario.location}</p>
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="text-center">
            <p className="text-yellow-400 font-bold text-2xl">+{selectedScenario.xpReward}</p>
            <p className="text-white/50 text-xs">XP ganhos</p>
          </div>
          <div className="text-center">
            <p className="text-green-400 font-bold text-2xl">{messages.filter(m => m.role === "player").length}</p>
            <p className="text-white/50 text-xs">Respostas</p>
          </div>
          <div className="text-center">
            <div className="flex gap-1 justify-center">
              {[...Array(3)].map((_, i) => (
                <Heart key={i} className={`w-5 h-5 ${i < lives ? "text-red-400 fill-red-400" : "text-white/20"}`} />
              ))}
            </div>
            <p className="text-white/50 text-xs">Vidas restantes</p>
          </div>
        </div>
        <div className="flex gap-2 justify-center">
          <Button onClick={() => setPhase("select")} className="bg-indigo-600 hover:bg-indigo-700">
            <MapPin className="w-4 h-4 mr-2" /> Nova Aventura
          </Button>
          {onClose && (
            <Button variant="outline" onClick={onClose} className="border-white/20 text-white hover:bg-white/10">
              Fechar
            </Button>
          )}
        </div>
      </div>
    );
  }

  return null;
}
