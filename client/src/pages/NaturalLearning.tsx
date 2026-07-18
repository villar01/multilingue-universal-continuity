/**
 * NaturalLearning — Aprenda como o cérebro humano aprende
 * Trilha por fases da vida: Infância → Criança → Adolescência → Adulto → Fluente
 * Cada fase usa o método natural de aquisição de linguagem
 */
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  ArrowLeft, ArrowRight, Play, Lock, Star, Zap,
  Flame, Trophy, Globe, Volume2, MessageSquare, Brain,
  BookOpen, Mic, ChevronRight, CheckCircle, Sparkles
} from "lucide-react";
import { Link } from "wouter";

// ── Tipos ──────────────────────────────────────────────────────────────────────
type LifePhase = "infancia" | "crianca" | "adolescencia" | "adulto" | "fluente";

interface PhaseInfo {
  id: LifePhase;
  level: string;
  label: string;
  cefr: string;
  emoji: string;
  color: string;
  bgGradient: string;
  borderColor: string;
  description: string;
  howYouLearn: string;
  activities: string[];
  unlockXP: number;
  topics: string[];
}

const PHASES: PhaseInfo[] = [
  {
    id: "infancia",
    level: "basico",
    label: "Infância",
    cefr: "A1",
    emoji: "🍼",
    color: "#FF9F43",
    bgGradient: "linear-gradient(135deg, #FF9F43 0%, #FFBE76 100%)",
    borderColor: "#FF9F43",
    description: "Palavras básicas com imagem e som",
    howYouLearn: "Como uma criança aprende: ouve, repete, associa imagem à palavra. Sem gramática — só sons e significados.",
    activities: ["🖼️ Palavra + Imagem", "🔊 Ouça e Repita", "👆 Toque a Palavra", "🃏 Associar Pares"],
    unlockXP: 0,
    topics: ["Animais", "Cores", "Números", "Família", "Comida", "Corpo", "Casa", "Natureza"],
  },
  {
    id: "crianca",
    level: "basico",
    label: "Criança",
    cefr: "A2",
    emoji: "🎒",
    color: "#48DBFB",
    bgGradient: "linear-gradient(135deg, #48DBFB 0%, #0ABDE3 100%)",
    borderColor: "#48DBFB",
    description: "Frases simples do dia a dia",
    howYouLearn: "Frases curtas em situações reais: escola, casa, amigos. Você começa a combinar palavras naturalmente.",
    activities: ["💬 Frases Simples", "🎮 Jogo da Memória", "📝 Complete a Frase", "🎯 Ordene as Palavras"],
    unlockXP: 500,
    topics: ["Escola", "Rotina", "Amigos", "Esportes", "Hobbies", "Tempo", "Compras", "Saúde"],
  },
  {
    id: "adolescencia",
    level: "intermediario",
    label: "Adolescência",
    cefr: "B1",
    emoji: "🎮",
    color: "#A29BFE",
    bgGradient: "linear-gradient(135deg, #A29BFE 0%, #6C5CE7 100%)",
    borderColor: "#A29BFE",
    description: "Conversação e expressões do cotidiano",
    howYouLearn: "Diálogos reais, gírias, expressões idiomáticas. Como adolescentes aprendem: contexto social e cultura.",
    activities: ["🎭 Roleplay", "💬 Diálogos Reais", "🎵 Música e Cultura", "📱 Redes Sociais"],
    unlockXP: 1500,
    topics: ["Viagens", "Trabalho", "Relacionamentos", "Tecnologia", "Cultura", "Notícias", "Opiniões"],
  },
  {
    id: "adulto",
    level: "avancado",
    label: "Adulto",
    cefr: "B2",
    emoji: "💼",
    color: "#55EFC4",
    bgGradient: "linear-gradient(135deg, #55EFC4 0%, #00B894 100%)",
    borderColor: "#55EFC4",
    description: "Fluência em situações profissionais e sociais",
    howYouLearn: "Conversação livre com IA nativa. Negócios, apresentações, debates. Como adultos aprendem: imersão total.",
    activities: ["🤖 Conversa com IA", "💼 Situações Reais", "🎙️ Pronúncia Avançada", "📊 Vocabulário Técnico"],
    unlockXP: 3000,
    topics: ["Negócios", "Apresentações", "Debates", "Entrevistas", "Contratos", "Networking"],
  },
  {
    id: "fluente",
    level: "avancado",
    label: "Fluente",
    cefr: "C1–C2",
    emoji: "🎓",
    color: "#FD79A8",
    bgGradient: "linear-gradient(135deg, #FD79A8 0%, #E84393 100%)",
    borderColor: "#FD79A8",
    description: "Domínio total — pense no idioma",
    howYouLearn: "Você pensa no idioma. Literatura, humor, nuances culturais. Expressões que só nativos usam.",
    activities: ["📚 Literatura", "😄 Humor e Ironia", "🎭 Expressões Nativas", "🧠 Pensamento no Idioma"],
    unlockXP: 6000,
    topics: ["Literatura", "Filosofia", "Humor", "Política", "Arte", "Ciência", "História"],
  },
];

// Lições de exemplo por fase e tópico
const PHASE_LESSONS: Record<LifePhase, Array<{ title: string; emoji: string; xp: number }>> = {
  infancia: [
    { title: "Animals — Cat, Dog, Bird", emoji: "🐱", xp: 20 },
    { title: "Colors — Red, Blue, Green", emoji: "🎨", xp: 20 },
    { title: "Numbers 1–10", emoji: "🔢", xp: 20 },
    { title: "Family — Mom, Dad, Brother", emoji: "👨‍👩‍👧", xp: 20 },
    { title: "Food — Apple, Bread, Milk", emoji: "🍎", xp: 20 },
    { title: "Body Parts — Head, Hand, Eye", emoji: "👁️", xp: 20 },
    { title: "Greetings — Hello, Goodbye", emoji: "👋", xp: 20 },
    { title: "House — Door, Window, Bed", emoji: "🏠", xp: 20 },
  ],
  crianca: [
    { title: "My Daily Routine", emoji: "⏰", xp: 30 },
    { title: "At School — Classroom Objects", emoji: "🏫", xp: 30 },
    { title: "Sports I Like", emoji: "⚽", xp: 30 },
    { title: "My Friends and Family", emoji: "👫", xp: 30 },
    { title: "Weather and Seasons", emoji: "🌤️", xp: 30 },
    { title: "Shopping — Prices and Items", emoji: "🛒", xp: 30 },
    { title: "Hobbies and Free Time", emoji: "🎮", xp: 30 },
    { title: "Health — Doctor Visit", emoji: "🏥", xp: 30 },
  ],
  adolescencia: [
    { title: "Travel Plans and Directions", emoji: "✈️", xp: 40 },
    { title: "Social Media and Technology", emoji: "📱", xp: 40 },
    { title: "Music, Movies and Culture", emoji: "🎵", xp: 40 },
    { title: "Expressing Opinions", emoji: "💬", xp: 40 },
    { title: "Relationships and Feelings", emoji: "❤️", xp: 40 },
    { title: "News and Current Events", emoji: "📰", xp: 40 },
    { title: "Idioms and Expressions", emoji: "🗣️", xp: 40 },
    { title: "Job Interview Basics", emoji: "💼", xp: 40 },
  ],
  adulto: [
    { title: "Business Meetings and Emails", emoji: "📧", xp: 50 },
    { title: "Presentations and Public Speaking", emoji: "🎤", xp: 50 },
    { title: "Negotiations and Contracts", emoji: "🤝", xp: 50 },
    { title: "Free Conversation with AI", emoji: "🤖", xp: 50 },
    { title: "Debate — Pros and Cons", emoji: "⚖️", xp: 50 },
    { title: "Advanced Phrasal Verbs", emoji: "📚", xp: 50 },
    { title: "Networking and Small Talk", emoji: "🌐", xp: 50 },
    { title: "Job Interview — Advanced", emoji: "🏆", xp: 50 },
  ],
  fluente: [
    { title: "Literature and Poetry", emoji: "📖", xp: 60 },
    { title: "Humor, Irony and Sarcasm", emoji: "😄", xp: 60 },
    { title: "Philosophy and Abstract Ideas", emoji: "🧠", xp: 60 },
    { title: "Native Expressions Only", emoji: "🎭", xp: 60 },
    { title: "News Analysis and Debate", emoji: "📡", xp: 60 },
    { title: "Science and Technology", emoji: "🔬", xp: 60 },
    { title: "Cultural Nuances", emoji: "🌍", xp: 60 },
    { title: "Think in English", emoji: "💡", xp: 60 },
  ],
};

// ── Componente principal ───────────────────────────────────────────────────────
export default function NaturalLearning() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [selectedPhase, setSelectedPhase] = useState<LifePhase>("infancia");
  const [showPhaseDetail, setShowPhaseDetail] = useState(false);

  const { data: gamificationStats } = trpc.gamification.getStats.useQuery(undefined, {
    enabled: !!user,
    retry: false,
  });

  const totalXP = (gamificationStats as any)?.total_xp ?? 0;
  const streak = (gamificationStats as any)?.streak_days ?? 0;
  const lessonsCompleted = (gamificationStats as any)?.lessons_completed ?? 0;

  const currentPhase = PHASES.find(p => p.id === selectedPhase)!;
  const currentLessons = PHASE_LESSONS[selectedPhase];

  // Determine which phases are unlocked
  const isPhaseUnlocked = (phase: PhaseInfo) => totalXP >= phase.unlockXP;

  // Navigate to a lesson using the PolyLesson system
  const startLesson = (lessonTitle: string, lessonEmoji: string) => {
    const langCode = localStorage.getItem("ml_target_lang") || "en-US";
    const params = new URLSearchParams({
      title: lessonTitle,
      emoji: lessonEmoji,
      lang: langCode,
      phase: selectedPhase,
      level: currentPhase.level,
    });
    navigate(`/natural-lesson?${params.toString()}`);
  };

  // Navigate to FreeTalk for adult phase
  const goToFreeTalk = () => navigate("/free-talk");

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #0f0c29 0%, #302b63 50%, #24243e 100%)" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 backdrop-blur-md" style={{ background: "rgba(15,12,41,0.85)" }}>
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/dashboard")} className="text-white/60 hover:text-white transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-purple-400" />
              <span className="text-white font-bold text-lg">Aprendizado Natural</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {streak > 0 && (
              <div className="flex items-center gap-1 text-orange-400">
                <Flame className="h-4 w-4" />
                <span className="font-bold text-sm">{streak}</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-yellow-400">
              <Zap className="h-4 w-4" />
              <span className="font-bold text-sm">{totalXP} XP</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-500/30 rounded-full px-4 py-1.5 mb-4">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span className="text-purple-300 text-sm font-medium">Método Natural de Aquisição</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-3">
            Como o Cérebro Humano Aprende
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Da infância à fluência — aprenda inglês do mesmo jeito que aprendeu português: naturalmente, sem decorar regras.
          </p>
        </div>

        {/* Phase Selector — horizontal scroll on mobile */}
        <div className="flex gap-3 overflow-x-auto pb-3 mb-6 scrollbar-hide">
          {PHASES.map((phase) => {
            const unlocked = isPhaseUnlocked(phase);
            const isSelected = selectedPhase === phase.id;
            return (
              <button
                key={phase.id}
                onClick={() => { if (unlocked) setSelectedPhase(phase.id); else toast.info(`Precisa de ${phase.unlockXP} XP para desbloquear ${phase.label}`); }}
                className={`flex-shrink-0 flex flex-col items-center gap-2 px-4 py-3 rounded-2xl border-2 transition-all duration-200 min-w-[100px] ${
                  isSelected
                    ? "scale-105 shadow-lg"
                    : unlocked
                    ? "opacity-80 hover:opacity-100 hover:scale-102"
                    : "opacity-40 cursor-not-allowed"
                }`}
                style={{
                  background: isSelected ? phase.bgGradient : "rgba(255,255,255,0.05)",
                  borderColor: isSelected ? phase.color : "rgba(255,255,255,0.1)",
                }}
              >
                <span className="text-2xl">{phase.emoji}</span>
                <span className={`font-bold text-xs ${isSelected ? "text-white" : "text-white/70"}`}>{phase.label}</span>
                <span className={`text-xs ${isSelected ? "text-white/80" : "text-white/40"}`}>{phase.cefr}</span>
                {!unlocked && <Lock className="h-3 w-3 text-white/40" />}
                {unlocked && !isSelected && <CheckCircle className="h-3 w-3 text-green-400" />}
              </button>
            );
          })}
        </div>

        {/* Phase Detail Card */}
        <div
          className="rounded-3xl p-6 mb-6 border border-white/10"
          style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(10px)" }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 shadow-lg"
              style={{ background: currentPhase.bgGradient }}
            >
              {currentPhase.emoji}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-white font-black text-xl">{currentPhase.label}</h2>
                <Badge className="text-xs" style={{ background: currentPhase.color + "33", color: currentPhase.color, border: `1px solid ${currentPhase.color}55` }}>
                  {currentPhase.cefr}
                </Badge>
              </div>
              <p className="text-white/60 text-sm mb-3">{currentPhase.description}</p>
              <div className="bg-white/5 rounded-xl p-3 mb-3 border border-white/10">
                <p className="text-white/80 text-sm italic">💡 {currentPhase.howYouLearn}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {currentPhase.activities.map((act) => (
                  <span key={act} className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/70">{act}</span>
                ))}
              </div>
            </div>
          </div>

          {/* XP Progress to next phase */}
          {currentPhase.id !== "fluente" && (() => {
            const nextPhase = PHASES[PHASES.findIndex(p => p.id === currentPhase.id) + 1];
            const progress = Math.min(100, (totalXP / nextPhase.unlockXP) * 100);
            return (
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between text-xs text-white/50 mb-1">
                  <span>Progresso para {nextPhase.emoji} {nextPhase.label}</span>
                  <span>{totalXP} / {nextPhase.unlockXP} XP</span>
                </div>
                <Progress value={progress} className="h-2" style={{ background: "rgba(255,255,255,0.1)" }} />
              </div>
            );
          })()}
        </div>

        {/* Special CTA for Adult phase — FreeTalk */}
        {selectedPhase === "adulto" && (
          <div
            className="rounded-2xl p-5 mb-6 border border-green-500/30 cursor-pointer hover:scale-[1.01] transition-all"
            style={{ background: "linear-gradient(135deg, rgba(85,239,196,0.15) 0%, rgba(0,184,148,0.15) 100%)" }}
            onClick={goToFreeTalk}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-green-500/20 flex items-center justify-center">
                <Mic className="h-7 w-7 text-green-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-bold text-lg">FreeTalk — Conversação Livre</span>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">DESTAQUE</Badge>
                </div>
                <p className="text-white/60 text-sm">Converse com IA nativa em inglês. Sem roteiro, sem limites — como na vida real.</p>
              </div>
              <ArrowRight className="h-5 w-5 text-green-400 flex-shrink-0" />
            </div>
          </div>
        )}

        {/* Lessons Grid */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-white font-bold text-lg">Lições — {currentPhase.label}</h3>
          <span className="text-white/40 text-sm">{currentLessons.length} lições</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {currentLessons.map((lesson, idx) => {
            const isUnlocked = isPhaseUnlocked(currentPhase);
            const isCompleted = idx < Math.min(lessonsCompleted, currentLessons.length);
            return (
              <button
                key={idx}
                onClick={() => {
                  if (!isUnlocked) {
                    toast.info(`Precisa de ${currentPhase.unlockXP} XP para desbloquear esta fase`);
                    return;
                  }
                  startLesson(lesson.title, lesson.emoji);
                }}
                className={`flex items-center gap-3 p-4 rounded-2xl border transition-all duration-200 text-left w-full ${
                  isUnlocked
                    ? "hover:scale-[1.02] hover:shadow-lg cursor-pointer"
                    : "opacity-50 cursor-not-allowed"
                }`}
                style={{
                  background: isCompleted
                    ? "rgba(85,239,196,0.1)"
                    : "rgba(255,255,255,0.05)",
                  borderColor: isCompleted
                    ? "rgba(85,239,196,0.3)"
                    : "rgba(255,255,255,0.1)",
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: isCompleted ? "rgba(85,239,196,0.2)" : "rgba(255,255,255,0.08)" }}
                >
                  {isCompleted ? "✅" : lesson.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-semibold text-sm truncate">{lesson.title}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-yellow-400 text-xs flex items-center gap-0.5">
                      <Zap className="h-3 w-3" />+{lesson.xp} XP
                    </span>
                    {isCompleted && <span className="text-green-400 text-xs">Concluída</span>}
                  </div>
                </div>
                {isUnlocked ? (
                  <Play className="h-4 w-4 text-white/40 flex-shrink-0" />
                ) : (
                  <Lock className="h-4 w-4 text-white/30 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div
          className="rounded-2xl p-5 text-center border border-white/10"
          style={{ background: "rgba(255,255,255,0.03)" }}
        >
          <p className="text-white/50 text-sm mb-3">Quer praticar com um professor real?</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/immersive-scene">
              <Button variant="outline" size="sm" className="border-white/20 text-white/70 hover:text-white hover:border-white/40 bg-transparent">
                🌍 Cenas Imersivas
              </Button>
            </Link>
            <Link href="/immersive-lesson">
              <Button variant="outline" size="sm" className="border-white/20 text-white/70 hover:text-white hover:border-white/40 bg-transparent">
                🎓 Aula com Professor
              </Button>
            </Link>
            <Link href="/free-talk">
              <Button size="sm" style={{ background: "linear-gradient(135deg, #55EFC4, #00B894)", color: "#000" }}>
                🎙️ FreeTalk
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
