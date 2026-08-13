/**
 * ARMode — Hub de Aprendizado Imersivo
 * Centro de todos os modos avançados:
 * - AR Vocabulário (câmera + sobreposição)
 * - Tradução AR (câmera → texto → tradução)
 * - Conversação Imersiva com professor animado
 * - Jogos de Palavras SRS (superior ao Drops/Memrise)
 * - Aventura Imersiva (cenários RPG)
 */
import { useState, lazy, Suspense, useCallback, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Sparkles, Star, MessageCircle, Brain,
  Camera, Map, ChevronRight, Zap, Lock
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

const ARVocabulary = lazy(() => import("@/components/ARVocabulary"));
const CameraTranslator = lazy(() => import("@/components/CameraTranslator"));
const ImmersiveAdventure = lazy(() => import("@/components/ImmersiveAdventure"));

// ─── Vocabulário demo ─────────────────────────────────────────────────────────
const DEMO_VOCAB = [
  { word: "Hello", translation: "Olá", phonetic: "rê-LÓU", emoji: "👋", imageKeyword: "greeting", examples: [{ en: "Hello, how are you?", pt: "Olá, como vai você?" }] },
  { word: "Beautiful", translation: "Bonito/a", phonetic: "BIÚ-ti-ful", emoji: "✨", imageKeyword: "beautiful flower", examples: [{ en: "What a beautiful day!", pt: "Que dia bonito!" }] },
  { word: "Family", translation: "Família", phonetic: "FÊ-mi-li", emoji: "👨‍👩‍👧‍👦", imageKeyword: "family", examples: [{ en: "My family is important.", pt: "Minha família é importante." }] },
  { word: "Food", translation: "Comida", phonetic: "FÚUD", emoji: "🍽️", imageKeyword: "delicious food", examples: [{ en: "I love Brazilian food.", pt: "Eu amo comida brasileira." }] },
  { word: "Music", translation: "Música", phonetic: "MIÚ-zik", emoji: "🎵", imageKeyword: "music concert", examples: [{ en: "Music makes me happy.", pt: "Música me faz feliz." }] },
  { word: "Travel", translation: "Viajar", phonetic: "TRÊ-vel", emoji: "✈️", imageKeyword: "travel adventure", examples: [{ en: "I love to travel.", pt: "Eu adoro viajar." }] },
];

// ─── Modos disponíveis ────────────────────────────────────────────────────────
const MODES = [
  {
    id: "vr-conversation",
    label: "Conversação Imersiva",
    emoji: "🎭",
    badge: "NOVO · Imersivo",
    badgeColor: "bg-purple-600/40 text-purple-200 border-purple-500/40",
    description: "8 cenários reais com IA · Voz neural · Feedback de pronúncia",
    color: "from-purple-700 to-indigo-800",
    glow: "shadow-purple-900/50",
    isExternal: true,
    href: "/vr-conversation",
    stats: ["12 cenários", "69 idiomas", "IA generativa", "WebXR"],
  },
  {
    id: "word-game",
    label: "Jogos de Palavras",
    emoji: "🧠",
    badge: "NOVO · Superior ao Drops",
    badgeColor: "bg-violet-600/40 text-violet-200 border-violet-500/40",
    description: "Flash Card SRS · Combinação · Digitação · Forca · Quiz · Caça-Palavras",
    color: "from-violet-700 to-purple-800",
    glow: "shadow-violet-900/50",
    isExternal: true,
    href: "/word-game",
    stats: ["6 modos", "12 categorias", "69 idiomas", "SRS SM-2"],
  },
  {
    id: "daily-challenge",
    label: "Desafio Diário",
    emoji: "🌟",
    badge: "DIÁRIO · +350 XP",
    badgeColor: "bg-orange-600/40 text-orange-200 border-orange-500/40",
    description: "1 conversa + 1 jogo por dia · Streak · Bônus de XP",
    color: "from-orange-700 to-red-800",
    glow: "shadow-orange-900/50",
    isExternal: true,
    href: "/daily-challenge",
    stats: ["Streak diário", "+350 XP/dia", "Bônus"],
  },
  {
    id: "ranking",
    label: "Ranking Global",
    emoji: "🏆",
    badge: "Leaderboard",
    badgeColor: "bg-yellow-600/40 text-yellow-200 border-yellow-500/40",
    description: "Compete com estudantes do mundo · XP · Níveis · Streak",
    color: "from-yellow-700 to-amber-800",
    glow: "shadow-yellow-900/50",
    isExternal: true,
    href: "/ranking",
    stats: ["Semanal", "Mensal", "Todos os tempos"],
  },
  {
    id: "battle",
    label: "Modo Batalha",
    emoji: "⚔️",
    badge: "NOVO · Tempo Real",
    badgeColor: "bg-red-600/40 text-red-200 border-red-500/40",
    description: "Quiz ao vivo contra outros jogadores · 10 perguntas · Contagem regressiva",
    color: "from-red-700 to-rose-800",
    glow: "shadow-red-900/50",
    isExternal: true,
    href: "/battle",
    stats: ["Tempo real", "10 perguntas", "Placar ao vivo", "69 idiomas"],
  },
  {
    id: "certificates",
    label: "Certificados",
    emoji: "🏅",
    badge: "Nível 5+",
    badgeColor: "bg-yellow-600/40 text-yellow-200 border-yellow-500/40",
    description: "Emita certificados de proficiência ao atingir Nível 5 · Download PNG",
    color: "from-yellow-700 to-amber-800",
    glow: "shadow-yellow-900/50",
    isExternal: true,
    href: "/certificates",
    stats: ["69 idiomas", "Canvas HD", "Download PNG"],
  },
  {
    id: "pronunciation-history",
    label: "Histórico de Pronúncia",
    emoji: "🎤",
    badge: "Gráficos",
    badgeColor: "bg-cyan-600/40 text-cyan-200 border-cyan-500/40",
    description: "Acompanhe sua evolução · Gráfico de linha · Distribuição de scores",
    color: "from-cyan-700 to-teal-800",
    glow: "shadow-cyan-900/50",
    isExternal: true,
    href: "/pronunciation-history",
    stats: ["Chart.js", "Média móvel", "69 idiomas"],
  },
  {
    id: "structured-lesson",
    label: "Aulas Estruturadas",
    emoji: "📖",
    badge: "NOVO · Superior ao Duolingo",
    badgeColor: "bg-blue-600/40 text-blue-200 border-blue-500/40",
    description: "Vocabulário correto + Q&A validado por IA · 5 níveis A1-C1 · 69 idiomas",
    color: "from-blue-700 to-indigo-800",
    glow: "shadow-blue-900/50",
    isExternal: true,
    href: "/structured-lesson",
    stats: ["5 níveis A1-C1", "12 tópicos", "69 idiomas", "SRS + Quiz"],
  },
  {
    id: "immersive-scene",
    label: "Cenas Imersivas",
    emoji: "🌍",
    badge: "NOVO · Realidade Aumentada",
    badgeColor: "bg-purple-600/40 text-purple-200 border-purple-500/40",
    description: "Paisagens reais · Paris, Praia, Tokyo, NY · Objetos clicáveis com vocabulário AR · Professor animado · Quiz situacional",
    color: "from-fuchsia-700 to-purple-900",
    glow: "shadow-fuchsia-900/50",
    isExternal: true,
    href: "/immersive-scene",
    stats: ["6 cenas", "Paris · Tokyo · NY", "Professor animado", "69 idiomas"],
  },
  {
    id: "ar-vocab",
    label: "AR Vocabulário",
    emoji: "🔮",
    badge: "AR · Câmera",
    badgeColor: "bg-indigo-600/40 text-indigo-200 border-indigo-500/40",
    description: "Objetos sobrepostos via câmera · Aprenda no mundo real",
    color: "from-indigo-700 to-blue-800",
    glow: "shadow-indigo-900/50",
    isExternal: false,
    href: null,
    stats: ["Câmera AR", "Voz neural", "Tempo real"],
  },
  {
    id: "camera-translate",
    label: "Tradução AR",
    emoji: "📸",
    badge: "Câmera · 94 idiomas",
    badgeColor: "bg-emerald-600/40 text-emerald-200 border-emerald-500/40",
    description: "Aponte a câmera para qualquer texto e veja a tradução",
    color: "from-emerald-700 to-teal-800",
    glow: "shadow-emerald-900/50",
    isExternal: false,
    href: null,
    stats: ["OCR IA", "94 idiomas", "Instantâneo"],
  },
  {
    id: "adventure",
    label: "Aventura RPG",
    emoji: "🗺️",
    badge: "RPG · Cenários",
    badgeColor: "bg-orange-600/40 text-orange-200 border-orange-500/40",
    description: "Pratique em cenários de aventura com personagens IA",
    color: "from-orange-700 to-red-800",
    glow: "shadow-orange-900/50",
    isExternal: false,
    href: null,
    stats: ["6 cenários", "NPCs IA", "Missões"],
  },
];

type InternalTab = "ar-vocab" | "camera-translate" | "adventure";

export default function ARMode() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [activeInternal, setActiveInternal] = useState<InternalTab | null>(null);
  const [totalXP, setTotalXP] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ttsMutation = trpc.tts.speak.useMutation();

  // Connect to real SRS vocabulary from user's learning progress
  const targetLangCode = localStorage.getItem("ml_target_lang") || "en-US";
  const languageCode = targetLangCode.split("-")[0] || "en";
  const { data: srsCards } = trpc.srs.getDue.useQuery(
    { targetLanguage: targetLangCode, limit: 20 },
    { enabled: !!user, staleTime: 5 * 60 * 1000 } // cache 5min no cliente
  );
  // Use SRS vocabulary if available, fallback to DEMO_VOCAB
  const vocabulary = (srsCards && srsCards.length > 0)
    ? srsCards.map((c: any) => ({
        word: c.word,
        translation: c.translation || c.word,
        phonetic: c.phonetic || "",
        emoji: "📚",
        imageKeyword: c.word,
      }))
    : DEMO_VOCAB;

  const handleSpeak = useCallback(async (text: string) => {
    try {
      const result = await ttsMutation.mutateAsync({ text, voiceLang: targetLangCode });
      if (result.success && result.audioBase64) {
        if (audioRef.current) audioRef.current.pause();
        const audio = new Audio(`data:${result.mimeType};base64,${result.audioBase64}`);
        audioRef.current = audio;
        audio.play().catch(() => null);
      }
    } catch { /* silencioso */ }
  }, [ttsMutation, targetLangCode]);

  // ─── Tela interna de um modo AR ───────────────────────────────────────────
  if (activeInternal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950">
        <div className="sticky top-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setActiveInternal(null)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-white font-bold text-base">
              {activeInternal === "ar-vocab" && "🔮 AR Vocabulário"}
              {activeInternal === "camera-translate" && "📸 Tradução AR"}
              {activeInternal === "adventure" && "🗺️ Aventura RPG"}
            </h1>
            <p className="text-white/50 text-xs">Modo Imersivo AR</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-6">
          <Suspense fallback={
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-white/50 text-sm">Carregando...</p>
              </div>
            </div>
          }>
            {activeInternal === "ar-vocab" && (
              <ARVocabulary vocabulary={vocabulary} languageCode={targetLangCode} onSpeak={handleSpeak} />
            )}
            {activeInternal === "camera-translate" && (
              <CameraTranslator targetLanguage="English" nativeLanguage="Português" />
            )}
            {activeInternal === "adventure" && (
              <ImmersiveAdventure languageCode={languageCode} targetLanguage="English" onSpeak={handleSpeak} />
            )}
          </Suspense>
        </div>
      </div>
    );
  }

  // ─── Hub principal ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <button className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
                <ArrowLeft className="w-4 h-4 text-white" />
              </button>
            </Link>
            <div>
              <h1 className="text-white font-bold text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                Aprendizado Imersivo
              </h1>
              <p className="text-white/50 text-xs">AR · VR · IA · Jogos · Conversação</p>
            </div>
          </div>
          {totalXP > 0 && (
            <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
              <Star className="w-3 h-3 mr-1 fill-yellow-400" />{totalXP} XP
            </Badge>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Banner de destaque */}
        <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-purple-900/60 to-indigo-900/60 border border-purple-500/30">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-300 font-bold text-sm">IA Avançada + Realidade Aumentada + Voz Natural</span>
          </div>
          <p className="text-white/60 text-xs">IA generativa · Voz neural · Feedback em tempo real · SRS inteligente</p>
        </div>
        {/* Banner Premium 7 dias */}
        {!user && (
          <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border border-yellow-500/40 flex items-center justify-between gap-3">
            <div>
              <p className="text-yellow-300 font-bold text-sm">🌟 7 dias grátis de Premium</p>
              <p className="text-white/60 text-xs">Desbloqueie RA completa + VR + 12 cenários + certificados</p>
            </div>
            <a href="/pricing" className="shrink-0 bg-yellow-500 hover:bg-yellow-400 text-yellow-900 font-bold text-xs px-4 py-2 rounded-xl transition-colors">
              Ativar
            </a>
          </div>
        )}

        {/* Grid de modos */}
        <div className="space-y-3">
          {MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => {
                if (mode.isExternal && mode.href) {
                  navigate(mode.href);
                } else if (!mode.isExternal) {
                  setActiveInternal(mode.id as InternalTab);
                }
              }}
              className={`w-full p-4 rounded-2xl bg-gradient-to-r ${mode.color} border border-white/10 hover:border-white/30 hover:scale-[1.01] transition-all text-left shadow-xl ${mode.glow}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-3xl flex-shrink-0">{mode.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className="text-white font-bold text-base">{mode.label}</p>
                      <Badge className={`text-xs px-2 py-0 ${mode.badgeColor}`}>{mode.badge}</Badge>
                    </div>
                    <p className="text-white/70 text-xs leading-relaxed">{mode.description}</p>
                    <div className="flex gap-2 mt-2">
                      {mode.stats.map((s, i) => (
                        <span key={i} className="text-xs bg-black/30 text-white/60 px-2 py-0.5 rounded-full">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-white/50 flex-shrink-0 ml-2" />
              </div>
            </button>
          ))}
        </div>

        {/* Dica de uso */}
        <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/10">
          <p className="text-white/60 text-xs text-center">
            💡 <strong className="text-white/80">Dica:</strong> Comece pela <strong className="text-purple-300">Conversação Imersiva</strong> para praticar situações reais,
            depois use os <strong className="text-violet-300">Jogos de Palavras</strong> para fixar o vocabulário com SRS.
          </p>
        </div>

        <div className="mt-4 text-center">
          <Link href="/dashboard">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
