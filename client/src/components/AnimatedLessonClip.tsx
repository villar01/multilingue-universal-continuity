/**
 * AnimatedLessonClip — Clipes Animados de Lição
 * MultiLingue Universal - Clipes Animados com Professores IA
 * Original: personagens SVG animados com CSS, diálogos bilíngues, lip-sync visual
 * Funciona 100% sem dependências externas — apenas CSS + SVG + React
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, RotateCcw, Volume2, VolumeX, ChevronRight, Star } from "lucide-react";

interface DialogLine {
  speaker: "teacher" | "student" | "narrator";
  text: string;
  translation?: string;
  emotion?: "happy" | "thinking" | "excited" | "neutral" | "surprised";
  duration?: number; // ms
}

interface AnimatedLessonClipProps {
  title?: string;
  scene?: "classroom" | "street" | "restaurant" | "office" | "park";
  teacherName?: string;
  teacherPhotoUrl?: string;
  dialog: DialogLine[];
  onComplete?: () => void;
  onSpeak?: (text: string, lang?: string) => void;
  autoPlay?: boolean;
}

// Paletas de cores por cena
const SCENE_THEMES = {
  classroom: { bg: "from-blue-950 via-indigo-950 to-slate-950", accent: "#6366f1", floor: "#1e1b4b" },
  street: { bg: "from-sky-950 via-blue-950 to-slate-950", accent: "#0ea5e9", floor: "#0c4a6e" },
  restaurant: { bg: "from-amber-950 via-orange-950 to-red-950", accent: "#f59e0b", floor: "#451a03" },
  office: { bg: "from-slate-950 via-zinc-950 to-gray-950", accent: "#6b7280", floor: "#111827" },
  park: { bg: "from-green-950 via-emerald-950 to-teal-950", accent: "#10b981", floor: "#064e3b" },
};

// Expressões faciais como emojis animados
const EMOTION_EMOJIS = {
  happy: "😊",
  thinking: "🤔",
  excited: "🤩",
  neutral: "😐",
  surprised: "😲",
};

// Componente de personagem animado com CSS puro
function AnimatedCharacter({
  type,
  name,
  photoUrl,
  emotion = "neutral",
  isSpeaking = false,
  isActive = false,
  side = "left",
}: {
  type: "teacher" | "student";
  name: string;
  photoUrl?: string;
  emotion?: DialogLine["emotion"];
  isSpeaking?: boolean;
  isActive?: boolean;
  side?: "left" | "right";
}) {
  const emoji = EMOTION_EMOJIS[emotion || "neutral"];

  return (
    <div
      className={`flex flex-col items-center transition-all duration-500 ${
        isActive ? "scale-110" : "scale-90 opacity-60"
      } ${side === "right" ? "scale-x-[-1]" : ""}`}
      style={{ minWidth: 80 }}
    >
      {/* Corpo do personagem */}
      <div className="relative">
        {/* Aura de fala */}
        {isSpeaking && (
          <div
            className="absolute inset-0 rounded-full animate-ping opacity-30"
            style={{ background: type === "teacher" ? "#6366f1" : "#10b981", borderRadius: "50%" }}
          />
        )}
        {/* Avatar */}
        <div
          className={`relative rounded-full overflow-hidden border-4 shadow-2xl transition-all duration-300 ${
            isActive
              ? type === "teacher"
                ? "border-indigo-400 shadow-indigo-500/50"
                : "border-emerald-400 shadow-emerald-500/50"
              : "border-white/20"
          }`}
          style={{ width: 72, height: 72 }}
        >
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={name}
              className="w-full h-full object-cover"
              style={{ transform: side === "right" ? "scaleX(-1)" : "none" }}
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-3xl"
              style={{ background: type === "teacher" ? "#4f46e5" : "#059669" }}
            >
              {type === "teacher" ? "👩‍🏫" : "👨‍🎓"}
            </div>
          )}
        </div>
        {/* Emoji de emoção */}
        {isActive && (
          <div
            className="absolute -top-2 -right-2 text-xl animate-bounce"
            style={{ transform: side === "right" ? "scaleX(-1)" : "none" }}
          >
            {emoji}
          </div>
        )}
        {/* Indicador de fala (ondas) */}
        {isSpeaking && (
          <div
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5"
            style={{ transform: side === "right" ? "translateX(50%) scaleX(-1)" : "translateX(-50%)" }}
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1 rounded-full bg-white/70 animate-bounce"
                style={{
                  height: 6 + i * 3,
                  animationDelay: `${i * 100}ms`,
                }}
              />
            ))}
          </div>
        )}
      </div>
      {/* Nome */}
      <p
        className={`mt-2 text-xs font-bold transition-colors ${
          isActive ? "text-white" : "text-white/40"
        }`}
        style={{ transform: side === "right" ? "scaleX(-1)" : "none" }}
      >
        {name}
      </p>
    </div>
  );
}

// Bolha de diálogo animada
function DialogBubble({
  line,
  isVisible,
  showTranslation,
}: {
  line: DialogLine;
  isVisible: boolean;
  showTranslation: boolean;
}) {
  const isTeacher = line.speaker === "teacher";
  const isNarrator = line.speaker === "narrator";

  if (isNarrator) {
    return (
      <div
        className={`transition-all duration-500 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <div className="text-center px-4 py-2 rounded-xl bg-white/10 border border-white/20 mx-auto max-w-xs">
          <p className="text-white/70 text-xs italic">{line.text}</p>
          {showTranslation && line.translation && (
            <p className="text-white/40 text-xs mt-0.5">{line.translation}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`transition-all duration-500 ${
        isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95"
      } ${isTeacher ? "self-start" : "self-end"}`}
      style={{ maxWidth: "75%" }}
    >
      <div
        className={`relative rounded-2xl px-4 py-3 shadow-xl border ${
          isTeacher
            ? "bg-indigo-600/80 border-indigo-400/30 rounded-tl-none"
            : "bg-emerald-600/80 border-emerald-400/30 rounded-tr-none"
        }`}
        style={{ backdropFilter: "blur(8px)" }}
      >
        {/* Ponteiro da bolha */}
        <div
          className={`absolute top-3 w-3 h-3 rotate-45 ${
            isTeacher
              ? "-left-1.5 bg-indigo-600/80"
              : "-right-1.5 bg-emerald-600/80"
          }`}
        />
        <p className="text-white font-medium text-sm leading-relaxed">{line.text}</p>
        {showTranslation && line.translation && (
          <p className="text-white/60 text-xs mt-1 italic">{line.translation}</p>
        )}
      </div>
    </div>
  );
}

export default function AnimatedLessonClip({
  title = "Diálogo Interativo",
  scene = "classroom",
  teacherName = "Professora",
  teacherPhotoUrl,
  dialog,
  onComplete,
  onSpeak,
  autoPlay = false,
}: AnimatedLessonClipProps) {
  const [currentLine, setCurrentLine] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const theme = SCENE_THEMES[scene];

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const advanceLine = useCallback(() => {
    setCurrentLine((prev) => {
      const next = prev + 1;
      if (next >= dialog.length) {
        setIsPlaying(false);
        setIsComplete(true);
        onComplete?.();
        return prev;
      }
      const line = dialog[next];
      const duration = line.duration || (line.text.length * 60 + 800);
      // Falar o texto
      if (!isMuted && onSpeak && line.speaker !== "narrator") {
        onSpeak(line.text, line.speaker === "teacher" ? "en-US" : "en-US");
      }
      timerRef.current = setTimeout(advanceLine, duration);
      return next;
    });
  }, [dialog, isMuted, onSpeak, onComplete]);

  const handlePlay = () => {
    if (isComplete) {
      setIsComplete(false);
      setCurrentLine(-1);
      setIsPlaying(true);
      timerRef.current = setTimeout(advanceLine, 500);
      return;
    }
    if (!isPlaying) {
      setIsPlaying(true);
      if (currentLine === -1) {
        timerRef.current = setTimeout(advanceLine, 500);
      } else {
        const line = dialog[currentLine];
        const duration = line.duration || (line.text.length * 60 + 800);
        timerRef.current = setTimeout(advanceLine, duration);
      }
    } else {
      setIsPlaying(false);
      clearTimer();
    }
  };

  const handleReset = () => {
    clearTimer();
    setIsPlaying(false);
    setIsComplete(false);
    setCurrentLine(-1);
  };

  useEffect(() => {
    if (autoPlay) {
      timerRef.current = setTimeout(() => {
        setIsPlaying(true);
        timerRef.current = setTimeout(advanceLine, 500);
      }, 1000);
    }
    return clearTimer;
  }, [autoPlay, advanceLine]);

  const activeSpeaker = currentLine >= 0 ? dialog[currentLine]?.speaker : null;
  const activeEmotion = currentLine >= 0 ? dialog[currentLine]?.emotion : "neutral";

  return (
    <div
      className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${theme.bg}`}
      style={{ minHeight: 320 }}
    >
      {/* ── Fundo de cena ─────────────────────────────────────────────── */}
      <div className="absolute inset-0">
        {/* Piso */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1/3 rounded-b-2xl opacity-30"
          style={{ background: theme.floor }}
        />
        {/* Decoração de cena */}
        {scene === "classroom" && (
          <>
            <div className="absolute top-4 left-4 w-20 h-14 rounded bg-white/5 border border-white/10 flex items-center justify-center">
              <span className="text-2xl">📋</span>
            </div>
            <div className="absolute top-4 right-4 text-3xl opacity-30">🎓</div>
          </>
        )}
        {scene === "restaurant" && (
          <>
            <div className="absolute top-4 left-4 text-3xl opacity-30">🍽️</div>
            <div className="absolute top-4 right-4 text-3xl opacity-30">🍷</div>
          </>
        )}
        {scene === "street" && (
          <>
            <div className="absolute top-4 left-4 text-3xl opacity-30">🏙️</div>
            <div className="absolute top-4 right-4 text-3xl opacity-30">🚕</div>
          </>
        )}
        {/* Grade AR decorativa */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(${theme.accent}44 1px, transparent 1px), linear-gradient(90deg, ${theme.accent}44 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <Badge className="bg-black/40 text-white border-white/20 text-xs">
            🎬 {title}
          </Badge>
          <Badge className="bg-black/40 text-white/60 border-white/10 text-xs capitalize">
            {scene}
          </Badge>
        </div>
        <button
          onClick={() => setShowTranslation(!showTranslation)}
          className="text-xs text-white/50 hover:text-white/80 transition-colors"
        >
          {showTranslation ? "🙈 Ocultar PT" : "🇧🇷 Ver PT"}
        </button>
      </div>

      {/* ── Área de personagens ────────────────────────────────────────── */}
      <div className="relative z-10 flex items-end justify-between px-8 pt-2 pb-4">
        {/* Professor (esquerda) */}
        <AnimatedCharacter
          type="teacher"
          name={teacherName}
          photoUrl={teacherPhotoUrl}
          emotion={activeSpeaker === "teacher" ? activeEmotion : "neutral"}
          isSpeaking={activeSpeaker === "teacher" && isPlaying}
          isActive={activeSpeaker === "teacher"}
          side="left"
        />

        {/* Área central de diálogo */}
        <div className="flex-1 mx-4 flex flex-col gap-2 min-h-[120px] justify-center">
          {currentLine >= 0 && currentLine < dialog.length && (
            <div className={`flex ${dialog[currentLine].speaker === "teacher" ? "justify-start" : dialog[currentLine].speaker === "student" ? "justify-end" : "justify-center"}`}>
              <DialogBubble
                line={dialog[currentLine]}
                isVisible={true}
                showTranslation={showTranslation}
              />
            </div>
          )}
          {currentLine === -1 && !isComplete && (
            <div className="text-center">
              <p className="text-white/40 text-sm">Pressione ▶ para iniciar o diálogo</p>
            </div>
          )}
          {isComplete && (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500/20 border border-yellow-500/30">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-yellow-400 font-bold text-sm">Diálogo concluído!</span>
              </div>
            </div>
          )}
        </div>

        {/* Aluno (direita) */}
        <AnimatedCharacter
          type="student"
          name="Você"
          emotion={activeSpeaker === "student" ? activeEmotion : "neutral"}
          isSpeaking={activeSpeaker === "student" && isPlaying}
          isActive={activeSpeaker === "student"}
          side="right"
        />
      </div>

      {/* ── Progresso ─────────────────────────────────────────────────── */}
      <div className="relative z-10 px-4 pb-2">
        <div className="flex gap-1">
          {dialog.map((_, idx) => (
            <div
              key={idx}
              className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                idx <= currentLine
                  ? "bg-white/70"
                  : "bg-white/15"
              }`}
            />
          ))}
        </div>
        <p className="text-white/30 text-xs mt-1 text-center">
          {currentLine + 1} / {dialog.length} linhas
        </p>
      </div>

      {/* ── Controles ─────────────────────────────────────────────────── */}
      <div className="relative z-10 flex items-center justify-center gap-3 px-4 pb-4">
        <button
          onClick={handleReset}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
        >
          <RotateCcw className="w-4 h-4 text-white" />
        </button>
        <Button
          onClick={handlePlay}
          className={`px-6 rounded-xl shadow-lg ${
            isPlaying
              ? "bg-red-600 hover:bg-red-700 shadow-red-500/30"
              : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30"
          }`}
        >
          {isPlaying ? (
            <><Pause className="w-4 h-4 mr-2" /> Pausar</>
          ) : isComplete ? (
            <><RotateCcw className="w-4 h-4 mr-2" /> Repetir</>
          ) : (
            <><Play className="w-4 h-4 mr-2" /> {currentLine === -1 ? "Iniciar" : "Continuar"}</>
          )}
        </Button>
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-white/50" />
          ) : (
            <Volume2 className="w-4 h-4 text-white" />
          )}
        </button>
      </div>
    </div>
  );
}

// ── Diálogos prontos para usar nas lições ───────────────────────────────────
export const LESSON_DIALOGS: Record<string, { scene: AnimatedLessonClipProps["scene"]; dialog: DialogLine[] }> = {
  greetings: {
    scene: "classroom",
    dialog: [
      { speaker: "narrator", text: "Uma manhã no escritório em Londres...", translation: "One morning at the office in London..." },
      { speaker: "teacher", text: "Good morning! How are you today?", translation: "Bom dia! Como vai você hoje?", emotion: "happy", duration: 3000 },
      { speaker: "student", text: "I'm fine, thank you! And you?", translation: "Estou bem, obrigado! E você?", emotion: "happy", duration: 3000 },
      { speaker: "teacher", text: "I'm doing great! Ready to learn English?", translation: "Estou ótimo! Pronto para aprender inglês?", emotion: "excited", duration: 3500 },
      { speaker: "student", text: "Yes! Let's go!", translation: "Sim! Vamos lá!", emotion: "excited", duration: 2500 },
    ],
  },
  restaurant: {
    scene: "restaurant",
    dialog: [
      { speaker: "narrator", text: "Em um restaurante em Nova York...", translation: "At a restaurant in New York..." },
      { speaker: "teacher", text: "Welcome! Can I take your order?", translation: "Bem-vindo! Posso anotar seu pedido?", emotion: "happy", duration: 3000 },
      { speaker: "student", text: "Yes, I'd like a burger, please.", translation: "Sim, eu gostaria de um hambúrguer, por favor.", emotion: "neutral", duration: 3500 },
      { speaker: "teacher", text: "Great choice! Would you like fries with that?", translation: "Ótima escolha! Quer batatas fritas com isso?", emotion: "happy", duration: 3500 },
      { speaker: "student", text: "Sure! And a glass of water, please.", translation: "Claro! E um copo de água, por favor.", emotion: "happy", duration: 3000 },
      { speaker: "teacher", text: "Perfect! Your order will be ready soon.", translation: "Perfeito! Seu pedido estará pronto em breve.", emotion: "excited", duration: 3000 },
    ],
  },
  directions: {
    scene: "street",
    dialog: [
      { speaker: "narrator", text: "Em uma rua de Londres...", translation: "On a street in London..." },
      { speaker: "student", text: "Excuse me, how do I get to the station?", translation: "Com licença, como chego à estação?", emotion: "thinking", duration: 3500 },
      { speaker: "teacher", text: "Go straight ahead, then turn left.", translation: "Vá em frente, depois vire à esquerda.", emotion: "neutral", duration: 3000 },
      { speaker: "student", text: "How far is it?", translation: "Qual é a distância?", emotion: "thinking", duration: 2500 },
      { speaker: "teacher", text: "About 5 minutes on foot. You can't miss it!", translation: "Cerca de 5 minutos a pé. Você não pode errar!", emotion: "happy", duration: 3500 },
      { speaker: "student", text: "Thank you so much!", translation: "Muito obrigado!", emotion: "excited", duration: 2500 },
    ],
  },
};
