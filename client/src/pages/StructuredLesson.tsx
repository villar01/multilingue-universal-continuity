/**
 * StructuredLesson — Aulas Premium com Animações Cinematográficas
 * Professor animado + textos rolantes + diálogo interativo + gamificação
 */
import { useState, useCallback, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { TEACHERS_57, type Teacher57 } from "@/data/teachers57";
import { ArrowLeft, Volume2, CheckCircle, XCircle, ChevronRight, BookOpen, Sparkles, RotateCcw, Trophy, Star, Zap, Heart, MessageCircle, Mic, MicOff } from "lucide-react";

// ── Tipos ────────────────────────────────────────────────────────────────────
interface VocabWord {
  word: string; translation: string; phonetic: string; emoji: string;
  example: string; exampleTranslation: string; category: string;
}
interface QAItem {
  question: string; options: string[]; correct: number;
  explanation: string; tip?: string;
}
interface LessonResult {
  score: number; correct: number; total: number; xpEarned: number;
  weakWords: string[];
}
type Phase = "select-teacher" | "select-level" | "select-topic" | "vocab" | "qa" | "result";

// ── Constantes ────────────────────────────────────────────────────────────────
const LEVELS = [
  { id: "A1", label: "A1 — Iniciante",     desc: "Primeiras palavras, saudações, números",  color: "#16a34a", emoji: "🌱" },
  { id: "A2", label: "A2 — Básico",        desc: "Frases simples, rotina, família",          color: "#0d9488", emoji: "🌿" },
  { id: "B1", label: "B1 — Intermediário", desc: "Conversação, viagem, trabalho",            color: "#2563eb", emoji: "🌊" },
  { id: "B2", label: "B2 — Avançado",      desc: "Fluência, negócios, cultura",              color: "#7c3aed", emoji: "🔥" },
  { id: "C1", label: "C1 — Proficiente",   desc: "Nuances, expressões idiomáticas, debate",  color: "#dc2626", emoji: "⚡" },
];
const TOPICS: Record<string, { id: string; label: string; emoji: string }[]> = {
  A1: [
    { id: "greetings",   label: "Saudações",    emoji: "👋" },
    { id: "numbers",     label: "Números",      emoji: "🔢" },
    { id: "colors",      label: "Cores",        emoji: "🎨" },
    { id: "family",      label: "Família",      emoji: "👨‍👩‍👧" },
    { id: "body",        label: "Corpo",        emoji: "🫀" },
    { id: "food_basic",  label: "Comida Básica",emoji: "🍎" },
  ],
  A2: [
    { id: "daily_routine", label: "Rotina Diária",  emoji: "⏰" },
    { id: "shopping",      label: "Compras",         emoji: "🛍️" },
    { id: "weather",       label: "Clima",           emoji: "🌤️" },
    { id: "transport",     label: "Transporte",      emoji: "🚌" },
    { id: "house",         label: "Casa",            emoji: "🏠" },
    { id: "hobbies",       label: "Hobbies",         emoji: "🎮" },
  ],
  B1: [
    { id: "travel",        label: "Viagem",          emoji: "✈️" },
    { id: "work",          label: "Trabalho",        emoji: "💼" },
    { id: "health",        label: "Saúde",           emoji: "🏥" },
    { id: "emotions",      label: "Emoções",         emoji: "😊" },
    { id: "restaurant",    label: "Restaurante",     emoji: "🍽️" },
    { id: "technology",    label: "Tecnologia",      emoji: "💻" },
  ],
  B2: [
    { id: "business",      label: "Negócios",        emoji: "📊" },
    { id: "culture",       label: "Cultura",         emoji: "🎭" },
    { id: "politics",      label: "Política",        emoji: "🏛️" },
    { id: "environment",   label: "Meio Ambiente",   emoji: "🌍" },
    { id: "idioms",        label: "Expressões",      emoji: "💬" },
    { id: "media",         label: "Mídia",           emoji: "📱" },
  ],
  C1: [
    { id: "academic",      label: "Acadêmico",       emoji: "🎓" },
    { id: "literature",    label: "Literatura",      emoji: "📚" },
    { id: "philosophy",    label: "Filosofia",       emoji: "🤔" },
    { id: "law",           label: "Direito",         emoji: "⚖️" },
    { id: "medicine",      label: "Medicina",        emoji: "🩺" },
    { id: "science",       label: "Ciência",         emoji: "🔬" },
  ],
};

// ── Typewriter Hook ───────────────────────────────────────────────────────────
function useTypewriter(text: string, speed = 28) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed(""); setDone(false);
    if (!text) return;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(id); setDone(true); }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return { displayed, done };
}

// ── Confetti burst ────────────────────────────────────────────────────────────
function ConfettiBurst({ active }: { active: boolean }) {
  if (!active) return null;
  const pieces = Array.from({ length: 18 }, (_, i) => i);
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map(i => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${10 + (i * 5.2) % 80}%`,
            top: "-10px",
            width: 10, height: 10,
            borderRadius: i % 3 === 0 ? "50%" : 2,
            background: ["#f59e0b","#10b981","#3b82f6","#ec4899","#8b5cf6","#ef4444"][i % 6],
            animation: `confettiFall ${1.2 + (i % 4) * 0.3}s ease-in forwards`,
            animationDelay: `${(i % 5) * 0.08}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ── Teacher Avatar Animated ───────────────────────────────────────────────────
function TeacherAvatar({ teacher, speaking, size = 96 }: { teacher: Teacher57; speaking: boolean; size?: number }) {
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      {/* Glow ring when speaking */}
      <div style={{
        position: "absolute", inset: -6,
        borderRadius: "50%",
        background: speaking
          ? `radial-gradient(circle, ${teacher.color}55 0%, transparent 70%)`
          : "transparent",
        transition: "background 0.3s ease",
        animation: speaking ? "speakPulse 0.6s ease-in-out infinite alternate" : "none",
      }} />
      {/* Outer ring */}
      <div style={{
        position: "absolute", inset: -3,
        borderRadius: "50%",
        border: `3px solid ${teacher.color}`,
        opacity: speaking ? 1 : 0.5,
        transition: "opacity 0.3s",
        animation: speaking ? "ringPulse 0.8s ease-in-out infinite" : "none",
      }} />
      {/* Photo */}
      {teacher.photo ? (
        <img
          src={teacher.photo}
          alt={teacher.name}
          style={{
            width: size, height: size,
            borderRadius: "50%",
            objectFit: "cover",
            border: `3px solid ${teacher.color}`,
            transform: speaking ? "scale(1.04)" : "scale(1)",
            transition: "transform 0.2s ease",
          }}
        />
      ) : (
        <div style={{
          width: size, height: size,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${teacher.color}44, ${teacher.color}22)`,
          border: `3px solid ${teacher.color}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: size * 0.45,
        }}>
          {teacher.avatar || teacher.flag}
        </div>
      )}
      {/* Speaking indicator dots */}
      {speaking && (
        <div style={{
          position: "absolute", bottom: 4, left: "50%", transform: "translateX(-50%)",
          display: "flex", gap: 3, background: "rgba(0,0,0,0.7)", borderRadius: 20, padding: "3px 7px",
        }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              width: 5, height: 5, borderRadius: "50%",
              background: teacher.color,
              animation: `dotBounce 0.6s ease-in-out infinite`,
              animationDelay: `${i * 0.15}s`,
            }} />
          ))}
        </div>
      )}
      <style>{`
        @keyframes speakPulse { from { opacity: 0.4; } to { opacity: 1; } }
        @keyframes ringPulse  { 0%,100% { transform: scale(1); } 50% { transform: scale(1.08); } }
        @keyframes dotBounce  { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
      `}</style>
    </div>
  );
}

// ── Speech Bubble ─────────────────────────────────────────────────────────────
function SpeechBubble({ text, color, side = "left", visible }: {
  text: string; color: string; side?: "left" | "right"; visible: boolean;
}) {
  const { displayed } = useTypewriter(visible ? text : "", 22);
  if (!visible) return null;
  return (
    <div style={{
      maxWidth: "80%",
      alignSelf: side === "left" ? "flex-start" : "flex-end",
      background: side === "left" ? `${color}18` : "rgba(255,255,255,0.08)",
      border: `1.5px solid ${side === "left" ? color + "55" : "rgba(255,255,255,0.15)"}`,
      borderRadius: side === "left" ? "4px 18px 18px 18px" : "18px 4px 18px 18px",
      padding: "10px 14px",
      color: "white",
      fontSize: 14,
      lineHeight: 1.5,
      animation: "bubbleIn 0.25s cubic-bezier(0.23,1,0.32,1)",
    }}>
      {displayed}
      <style>{`
        @keyframes bubbleIn {
          from { opacity: 0; transform: scale(0.92) translateY(6px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ── XP Popup ──────────────────────────────────────────────────────────────────
function XPPopup({ xp, visible }: { xp: number; visible: boolean }) {
  if (!visible) return null;
  return (
    <div style={{
      position: "fixed", top: "20%", right: "5%", zIndex: 100,
      background: "linear-gradient(135deg, #f59e0b, #ef4444)",
      color: "white", fontWeight: 900, fontSize: 22,
      padding: "10px 20px", borderRadius: 40,
      boxShadow: "0 8px 32px rgba(245,158,11,0.5)",
      animation: "xpPop 1.2s cubic-bezier(0.23,1,0.32,1) forwards",
    }}>
      +{xp} XP ⭐
      <style>{`
        @keyframes xpPop {
          0%   { opacity: 0; transform: scale(0.5) translateY(20px); }
          30%  { opacity: 1; transform: scale(1.2) translateY(-10px); }
          70%  { opacity: 1; transform: scale(1)   translateY(-20px); }
          100% { opacity: 0; transform: scale(0.9) translateY(-40px); }
        }
      `}</style>
    </div>
  );
}

// ── Lives Display ─────────────────────────────────────────────────────────────
function LivesDisplay({ lives }: { lives: number }) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[1,2,3,4,5].map(i => (
        <Heart
          key={i}
          style={{
            width: 18, height: 18,
            fill: i <= lives ? "#ef4444" : "transparent",
            stroke: i <= lives ? "#ef4444" : "#6b7280",
            transition: "all 0.3s ease",
            transform: i === lives + 1 ? "scale(0.8)" : "scale(1)",
          }}
        />
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function StructuredLesson() {
  const [, setLocation] = useLocation();
  const [phase, setPhase]       = useState<Phase>("select-teacher");
  const [teacher, setTeacher]   = useState<Teacher57 | null>(null);
  const [level, setLevel]       = useState("A1");
  const [topic, setTopic]       = useState<{ id: string; label: string; emoji: string } | null>(null);
  const [vocab, setVocab]       = useState<VocabWord[]>([]);
  const [qaList, setQaList]     = useState<QAItem[]>([]);
  const [vocabIdx, setVocabIdx] = useState(0);
  const [qaIdx, setQaIdx]       = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore]       = useState(0);
  const [xp, setXp]             = useState(0);
  const [lives, setLives]       = useState(5);
  const [weakWords, setWeakWords] = useState<string[]>([]);
  const [result, setResult]     = useState<LessonResult | null>(null);
  const [search, setSearch]     = useState("");
  const [flipped, setFlipped]   = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [showXP, setShowXP]     = useState(false);
  const [xpGained, setXpGained] = useState(0);
  const [confetti, setConfetti] = useState(false);
  const [teacherMsg, setTeacherMsg] = useState("");
  const [showTeacherMsg, setShowTeacherMsg] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [currentLessonIdx, setCurrentLessonIdx] = useState(0);
  const [streak, setStreak]     = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const tinyLessonMut = trpc.tinyLesson.generateByScenario.useMutation();
  const ttsMut        = trpc.tts.speak.useMutation();

  // ── TTS com animação de fala ──────────────────────────────────────────────
  const speak = useCallback(async (text: string, lang: string) => {
    if (!text?.trim()) return;
    setSpeaking(true);
    const stopSpeaking = () => setSpeaking(false);
    const fallback = () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = lang; u.rate = 0.85;
        u.onend = stopSpeaking;
        window.speechSynthesis.speak(u);
      } else stopSpeaking();
    };
    try {
      const r = await ttsMut.mutateAsync({ text: text.slice(0, 300), voiceLang: lang });
      if (r.success && r.audioBase64) {
        const bytes = Uint8Array.from(atob(r.audioBase64), c => c.charCodeAt(0));
        const url = URL.createObjectURL(new Blob([bytes], { type: "audio/mp3" }));
        if (audioRef.current) { audioRef.current.pause(); }
        const a = new Audio(url);
        audioRef.current = a;
        a.onended = () => { URL.revokeObjectURL(url); stopSpeaking(); };
        a.onerror = stopSpeaking;
        a.play().catch(fallback);
      } else fallback();
    } catch { fallback(); }
  }, [ttsMut]);

  // ── Mensagem animada do professor ─────────────────────────────────────────
  const showMsg = useCallback((msg: string, lang?: string) => {
    setTeacherMsg(msg);
    setShowTeacherMsg(true);
    if (lang && teacher) speak(msg, lang);
    setTimeout(() => setShowTeacherMsg(false), 5000);
  }, [teacher, speak]);

  // ── Gerar Aula ────────────────────────────────────────────────────────────
  const generateLesson = useCallback(async (t: typeof teacher, tp: typeof topic, lv: string) => {
    if (!t || !tp) return;
    setPhase("vocab"); setVocab([]); setVocabIdx(0); setFlipped(false);
    setScore(0); setLives(5); setStreak(0);
    showMsg(`Olá! Vamos aprender ${tp.label} hoje! 🎉`, t.voiceLang);
    try {
      const r = await tinyLessonMut.mutateAsync({
        scenario: `${tp.label} - nível ${lv} - ${tp.id}`,
        targetLanguage: t.voiceLang,
        nativeLanguage: "pt-BR",
        count: 12,
      });
      if (!r.vocabulary?.length) throw new Error("Sem vocabulário");
      setVocab(r.vocabulary as VocabWord[]);
      const qa = generateQA(r.vocabulary as VocabWord[], t.voiceLang);
      setQaList(qa);
    } catch {
      toast.error("Erro ao gerar aula. Tente novamente.");
      setPhase("select-topic");
    }
  }, [tinyLessonMut, showMsg]);

  // ── Q&A local ─────────────────────────────────────────────────────────────
  const generateQA = (words: VocabWord[], _lang: string): QAItem[] => {
    if (words.length < 4) return [];
    return words.slice(0, 8).map((w, i) => {
      const others = words.filter((_, j) => j !== i).sort(() => Math.random() - 0.5).slice(0, 3);
      const options = [w.translation, ...others.map(o => o.translation)].sort(() => Math.random() - 0.5);
      const correct = options.indexOf(w.translation);
      return {
        question: `O que significa "${w.word}"?`,
        options, correct,
        explanation: `"${w.word}" = "${w.translation}". ${w.example ? `Exemplo: "${w.example}"` : ""}`,
        tip: w.exampleTranslation,
      };
    });
  };

  // ── Avançar Vocabulário ───────────────────────────────────────────────────
  const nextVocab = () => {
    if (vocabIdx < vocab.length - 1) {
      setVocabIdx(p => p + 1); setFlipped(false);
      if (teacher && vocab[vocabIdx + 1]) {
        speak(vocab[vocabIdx + 1].word, teacher.voiceLang);
      }
    } else {
      setQaIdx(0); setScore(0); setSelected(null); setAnswered(false);
      setPhase("qa");
      if (teacher) showMsg("Ótimo! Agora vamos testar o que você aprendeu! 💪", teacher.voiceLang);
    }
  };

  // ── Responder Q&A ─────────────────────────────────────────────────────────
  const answerQA = (idx: number) => {
    if (answered) return;
    setSelected(idx); setAnswered(true);
    const correct = qaList[qaIdx].correct === idx;
    if (correct) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setScore(p => p + 1);
      const gained = newStreak >= 3 ? 20 : 10;
      setXp(p => p + gained);
      setXpGained(gained);
      setShowXP(true);
      setTimeout(() => setShowXP(false), 1400);
      if (newStreak >= 3) {
        setConfetti(true);
        setTimeout(() => setConfetti(false), 2000);
        if (teacher) showMsg(`🔥 ${newStreak} seguidas! Incrível!`, teacher.voiceLang);
      } else {
        if (teacher) showMsg("✅ Correto! Muito bem!", teacher.voiceLang);
      }
    } else {
      setStreak(0);
      setLives(p => Math.max(0, p - 1));
      setWeakWords(p => [...p, qaList[qaIdx].question.replace('O que significa "', "").replace('"?', "")]);
      if (teacher) showMsg("❌ Quase! Veja a explicação abaixo.", teacher.voiceLang);
    }
  };

  // ── Próxima Pergunta ──────────────────────────────────────────────────────
  const nextQA = () => {
    if (qaIdx < qaList.length - 1) {
      setQaIdx(p => p + 1); setSelected(null); setAnswered(false);
    } else {
      const total = qaList.length;
      const xpEarned = score * 10 + (score === total ? 50 : 0);
      setXp(p => p + (score === total ? 50 : 0));
      if (score === total) { setConfetti(true); setTimeout(() => setConfetti(false), 3000); }
      setResult({ score, correct: score, total, xpEarned, weakWords });
      if (topic && level) {
        setCompletedLessons(p => new Set([...p, `${level}-${topic.id}`]));
        setCurrentLessonIdx(p => p + 1);
      }
      setPhase("result");
    }
  };

  const topicsForLevel = TOPICS[level] || TOPICS.A1;
  const lessonList = topicsForLevel.map((t, i) => ({
    ...t, lessonNum: i + 1,
    isCompleted: completedLessons.has(`${level}-${t.id}`),
    isCurrent: i === currentLessonIdx,
    isLocked: i > currentLessonIdx && !completedLessons.has(`${level}-${t.id}`),
  }));
  const filtered = TEACHERS_57.filter(t =>
    !search || t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.language.toLowerCase().includes(search.toLowerCase())
  );

  // ════════════════════════════════════════════════════════════════════════════
  // TELA: Seleção de Professor — redesenhada com cards premium
  // ════════════════════════════════════════════════════════════════════════════
  if (phase === "select-teacher") return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)", color: "white" }}>
      {/* Header */}
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: "rgba(15,12,41,0.95)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "12px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => setLocation("/ar-mode")} style={{ background: "rgba(255,255,255,0.08)", border: "none", color: "white", borderRadius: 8, padding: "6px 10px", cursor: "pointer" }}>
            ← Voltar
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <BookOpen style={{ width: 18, height: 18, color: "#818cf8" }} />
              Aulas com Professor
            </div>
            <div style={{ fontSize: 11, color: "#94a3b8" }}>Escolha seu professor nativo · 69 idiomas</div>
          </div>
          <div style={{ background: "rgba(234,179,8,0.15)", border: "1px solid rgba(234,179,8,0.3)", borderRadius: 20, padding: "4px 12px", fontSize: 13, fontWeight: 700, color: "#fbbf24" }}>
            ⭐ {xp} XP
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "20px 16px" }}>
        <input
          type="text" placeholder="🔍 Buscar idioma ou professor..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14, padding: "12px 16px", color: "white", fontSize: 14, outline: "none", marginBottom: 16, boxSizing: "border-box" }}
        />

        <div style={{ display: "grid", gap: 10 }}>
          {filtered.map(t => (
            <button
              key={t.id}
              onClick={() => { setTeacher(t); setPhase("select-level"); }}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 16, padding: "14px 16px", cursor: "pointer", textAlign: "left",
                transition: "all 0.18s ease", color: "white",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = `${t.color}18`; (e.currentTarget as HTMLButtonElement).style.borderColor = `${t.color}55`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.08)"; }}
            >
              <TeacherAvatar teacher={t} speaking={false} size={56} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>{t.name}</span>
                  <span style={{ fontSize: 18 }}>{t.flag}</span>
                  <span style={{ marginLeft: "auto", background: `${t.color}22`, border: `1px solid ${t.color}44`, borderRadius: 20, padding: "2px 8px", fontSize: 11, fontWeight: 600, color: t.color }}>{t.language}</span>
                </div>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>{t.origin} · {t.specialty}</div>
              </div>
              <ChevronRight style={{ width: 16, height: 16, color: "#4b5563", flexShrink: 0 }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // ════════════════════════════════════════════════════════════════════════════
  // TELA: Seleção de Nível
  // ════════════════════════════════════════════════════════════════════════════
  if (phase === "select-level" && teacher) return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)", color: "white" }}>
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: "rgba(15,12,41,0.95)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "12px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => setPhase("select-teacher")} style={{ background: "rgba(255,255,255,0.08)", border: "none", color: "white", borderRadius: 8, padding: "6px 10px", cursor: "pointer" }}>← Voltar</button>
          <TeacherAvatar teacher={teacher} speaking={false} size={40} />
          <div>
            <div style={{ fontWeight: 700 }}>{teacher.name} {teacher.flag}</div>
            <div style={{ fontSize: 11, color: "#94a3b8" }}>{teacher.language}</div>
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "24px 16px" }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>Escolha seu Nível</h2>
        <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 24 }}>O nível define o vocabulário e a complexidade</p>
        <div style={{ display: "grid", gap: 10 }}>
          {LEVELS.map(l => (
            <button
              key={l.id}
              onClick={() => { setLevel(l.id); setPhase("select-topic"); }}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                background: "rgba(255,255,255,0.04)", border: `1px solid ${l.color}33`,
                borderRadius: 16, padding: "16px", cursor: "pointer", textAlign: "left", color: "white",
                transition: "all 0.18s ease",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = `${l.color}18`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)"; }}
            >
              <div style={{ width: 50, height: 50, borderRadius: 14, background: `${l.color}33`, border: `2px solid ${l.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>{l.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{l.label}</div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{l.desc}</div>
              </div>
              <ChevronRight style={{ width: 16, height: 16, color: "#4b5563" }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // ════════════════════════════════════════════════════════════════════════════
  // TELA: Seleção de Tópico com trilha de aulas
  // ════════════════════════════════════════════════════════════════════════════
  if (phase === "select-topic" && teacher) return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)", color: "white" }}>
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: "rgba(15,12,41,0.95)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "12px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => setPhase("select-level")} style={{ background: "rgba(255,255,255,0.08)", border: "none", color: "white", borderRadius: 8, padding: "6px 10px", cursor: "pointer" }}>← Voltar</button>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700 }}>{teacher.name} · Nível {level}</div>
            <div style={{ fontSize: 11, color: "#94a3b8" }}>Escolha o tópico da aula</div>
          </div>
          <div style={{ background: "rgba(234,179,8,0.15)", border: "1px solid rgba(234,179,8,0.3)", borderRadius: 20, padding: "4px 12px", fontSize: 13, fontWeight: 700, color: "#fbbf24" }}>⭐ {xp} XP</div>
        </div>
      </div>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "20px 16px" }}>
        {/* Progress bar */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12, color: "#94a3b8" }}>
            <span>Progresso Nível {level}</span>
            <span style={{ fontWeight: 700, color: "#818cf8" }}>
              {Math.round((Array.from(completedLessons).filter(k => k.startsWith(level)).length / topicsForLevel.length) * 100)}%
            </span>
          </div>
          <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 99, height: 8 }}>
            <div style={{
              height: 8, borderRadius: 99,
              background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
              width: `${(Array.from(completedLessons).filter(k => k.startsWith(level)).length / topicsForLevel.length) * 100}%`,
              transition: "width 0.5s ease",
            }} />
          </div>
        </div>

        {/* Lesson trail */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {lessonList.map((lesson) => (
            <button
              key={lesson.id}
              disabled={lesson.isLocked}
              onClick={() => {
                if (!lesson.isLocked) {
                  setTopic({ id: lesson.id, label: lesson.label, emoji: lesson.emoji });
                  setCurrentLessonIdx(lesson.lessonNum - 1);
                  generateLesson(teacher, { id: lesson.id, label: lesson.label, emoji: lesson.emoji }, level);
                }
              }}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                borderRadius: 16, padding: "14px 16px", cursor: lesson.isLocked ? "not-allowed" : "pointer",
                textAlign: "left", color: "white", border: "1.5px solid",
                borderColor: lesson.isCompleted ? "#16a34a55" : lesson.isCurrent ? "#6366f1" : lesson.isLocked ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.08)",
                background: lesson.isCompleted ? "rgba(22,163,74,0.1)" : lesson.isCurrent ? "rgba(99,102,241,0.15)" : lesson.isLocked ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.04)",
                opacity: lesson.isLocked ? 0.45 : 1,
                transition: "all 0.18s ease",
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 800, fontSize: 15,
                background: lesson.isCompleted ? "#16a34a" : lesson.isCurrent ? "#6366f1" : lesson.isLocked ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.08)",
                color: lesson.isLocked ? "#6b7280" : "white",
              }}>
                {lesson.isCompleted ? "✓" : lesson.isLocked ? "🔒" : lesson.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>Aula {lesson.lessonNum} — {lesson.label}</span>
                  {lesson.isCurrent && !lesson.isCompleted && (
                    <span style={{ background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.4)", borderRadius: 20, padding: "1px 8px", fontSize: 10, fontWeight: 700, color: "#818cf8" }}>ATUAL</span>
                  )}
                  {lesson.isCompleted && (
                    <span style={{ background: "rgba(22,163,74,0.2)", border: "1px solid rgba(22,163,74,0.4)", borderRadius: 20, padding: "1px 8px", fontSize: 10, fontWeight: 700, color: "#4ade80" }}>✓ CONCLUÍDA</span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: "#6b7280" }}>
                  {lesson.isLocked ? "Complete a aula anterior" : "12 palavras · Quiz · +80 XP"}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // ════════════════════════════════════════════════════════════════════════════
  // TELA: Vocabulário — Professor animado + flip cards premium
  // ════════════════════════════════════════════════════════════════════════════
  if (phase === "vocab" && teacher) {
    const w = vocab[vocabIdx];
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #0f0c29 0%, #1a1040 50%, #0d1117 100%)", color: "white", display: "flex", flexDirection: "column" }}>
        <ConfettiBurst active={confetti} />
        <XPPopup xp={xpGained} visible={showXP} />

        {/* Header */}
        <div style={{ position: "sticky", top: 0, zIndex: 10, background: "rgba(15,12,41,0.95)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "10px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => setPhase("select-topic")} style={{ background: "rgba(255,255,255,0.08)", border: "none", color: "white", borderRadius: 8, padding: "5px 10px", cursor: "pointer", fontSize: 13 }}>←</button>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{topic?.emoji} {topic?.label} · {level}</div>
              <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 99, height: 5, marginTop: 4 }}>
                <div style={{ height: 5, borderRadius: 99, background: "linear-gradient(90deg, #6366f1, #8b5cf6)", width: `${vocab.length ? ((vocabIdx + 1) / vocab.length) * 100 : 0}%`, transition: "width 0.4s ease" }} />
              </div>
            </div>
            <span style={{ fontSize: 12, color: "#94a3b8" }}>{vocabIdx + 1}/{vocab.length || "..."}</span>
          </div>
        </div>

        {!w ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
            <TeacherAvatar teacher={teacher} speaking={true} size={80} />
            <div style={{ fontSize: 14, color: "#94a3b8", animation: "pulse 1.5s ease-in-out infinite" }}>Preparando sua aula...</div>
            <style>{`@keyframes pulse { 0%,100%{opacity:0.5} 50%{opacity:1} }`}</style>
          </div>
        ) : (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 16px", gap: 16, maxWidth: 480, margin: "0 auto", width: "100%" }}>

            {/* Teacher + speech bubble */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, width: "100%", animation: "slideIn 0.3s ease" }}>
              <TeacherAvatar teacher={teacher} speaking={speaking} size={72} />
              <SpeechBubble
                text={showTeacherMsg ? teacherMsg : `Palavra ${vocabIdx + 1}: "${w.word}" — toque no cartão para ver a tradução!`}
                color={teacher.color}
                side="left"
                visible={true}
              />
            </div>

            {/* Flip Card */}
            <div
              onClick={() => {
                setFlipped(p => !p);
                if (!flipped) speak(w.word, teacher.voiceLang);
              }}
              style={{ width: "100%", maxWidth: 380, aspectRatio: "4/3", perspective: "1000px", cursor: "pointer" }}
            >
              <div style={{
                width: "100%", height: "100%",
                transition: "transform 0.55s cubic-bezier(0.23,1,0.32,1)",
                transformStyle: "preserve-3d",
                transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
                position: "relative",
              }}>
                {/* Front */}
                <div style={{
                  position: "absolute", inset: 0, backfaceVisibility: "hidden",
                  background: `linear-gradient(135deg, ${teacher.color}22, rgba(99,102,241,0.15))`,
                  border: `2px solid ${teacher.color}44`,
                  borderRadius: 24,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24,
                  boxShadow: `0 20px 60px ${teacher.color}22`,
                }}>
                  <div style={{ fontSize: 56, marginBottom: 12 }}>{w.emoji || "📚"}</div>
                  <div style={{ fontSize: 32, fontWeight: 900, color: "white", textAlign: "center", marginBottom: 6 }}>{w.word}</div>
                  <div style={{ fontFamily: "monospace", fontSize: 14, color: teacher.color, marginBottom: 12 }}>{w.phonetic}</div>
                  <button
                    onClick={e => { e.stopPropagation(); speak(w.word, teacher.voiceLang); }}
                    style={{ display: "flex", alignItems: "center", gap: 6, background: `${teacher.color}22`, border: `1px solid ${teacher.color}44`, borderRadius: 20, padding: "6px 14px", color: teacher.color, cursor: "pointer", fontSize: 13, fontWeight: 600 }}
                  >
                    <Volume2 style={{ width: 14, height: 14 }} /> Ouvir
                  </button>
                  <div style={{ marginTop: 12, fontSize: 11, color: "#6b7280" }}>Toque para ver a tradução</div>
                </div>
                {/* Back */}
                <div style={{
                  position: "absolute", inset: 0, backfaceVisibility: "hidden",
                  background: "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(5,150,105,0.1))",
                  border: "2px solid rgba(16,185,129,0.4)",
                  borderRadius: 24,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24,
                  transform: "rotateY(180deg)",
                  boxShadow: "0 20px 60px rgba(16,185,129,0.15)",
                }}>
                  <div style={{ fontSize: 26, fontWeight: 800, color: "white", textAlign: "center", marginBottom: 8 }}>{w.translation}</div>
                  <div style={{ fontSize: 13, color: "#6ee7b7", fontStyle: "italic", textAlign: "center", marginBottom: 8 }}>"{w.example}"</div>
                  <div style={{ fontSize: 12, color: "#94a3b8", textAlign: "center" }}>"{w.exampleTranslation}"</div>
                  <div style={{ marginTop: 12, background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 600, color: "#4ade80" }}>{w.category}</div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div style={{ display: "flex", gap: 10, width: "100%", maxWidth: 380 }}>
              <button
                onClick={() => { if (vocabIdx > 0) { setVocabIdx(p => p - 1); setFlipped(false); } }}
                disabled={vocabIdx === 0}
                style={{ flex: 1, padding: "12px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: vocabIdx === 0 ? "#4b5563" : "white", cursor: vocabIdx === 0 ? "not-allowed" : "pointer", fontWeight: 600, fontSize: 14 }}
              >
                ← Anterior
              </button>
              <button
                onClick={nextVocab}
                style={{ flex: 2, padding: "12px", borderRadius: 14, border: "none", background: `linear-gradient(135deg, ${teacher.color}, ${teacher.color}cc)`, color: "white", cursor: "pointer", fontWeight: 700, fontSize: 14, boxShadow: `0 4px 20px ${teacher.color}44` }}
              >
                {vocabIdx < vocab.length - 1 ? "Próxima →" : "Fazer Quiz →"}
              </button>
            </div>

            {/* Word dots */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center", maxWidth: 380 }}>
              {vocab.map((_, i) => (
                <div
                  key={i}
                  onClick={() => { setVocabIdx(i); setFlipped(false); }}
                  style={{
                    width: 10, height: 10, borderRadius: "50%", cursor: "pointer",
                    background: i === vocabIdx ? teacher.color : i < vocabIdx ? "#4ade80" : "rgba(255,255,255,0.15)",
                    transition: "all 0.2s ease",
                    transform: i === vocabIdx ? "scale(1.4)" : "scale(1)",
                  }}
                />
              ))}
            </div>
          </div>
        )}
        <style>{`@keyframes slideIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }`}</style>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // TELA: Quiz — Professor + opções animadas + streak + vidas
  // ════════════════════════════════════════════════════════════════════════════
  if (phase === "qa" && teacher && qaList.length > 0) {
    const q = qaList[qaIdx];
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #0f0c29 0%, #1a1040 50%, #0d1117 100%)", color: "white", display: "flex", flexDirection: "column" }}>
        <ConfettiBurst active={confetti} />
        <XPPopup xp={xpGained} visible={showXP} />

        {/* Header */}
        <div style={{ position: "sticky", top: 0, zIndex: 10, background: "rgba(15,12,41,0.95)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "10px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => setPhase("vocab")} style={{ background: "rgba(255,255,255,0.08)", border: "none", color: "white", borderRadius: 8, padding: "5px 10px", cursor: "pointer", fontSize: 13 }}>←</button>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>Quiz · {topic?.label}</div>
              <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 99, height: 5, marginTop: 4 }}>
                <div style={{ height: 5, borderRadius: 99, background: "linear-gradient(90deg, #f59e0b, #ef4444)", width: `${((qaIdx + 1) / qaList.length) * 100}%`, transition: "width 0.4s ease" }} />
              </div>
            </div>
            <LivesDisplay lives={lives} />
            {streak >= 2 && (
              <div style={{ background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.4)", borderRadius: 20, padding: "2px 8px", fontSize: 12, fontWeight: 700, color: "#f87171" }}>
                🔥 {streak}
              </div>
            )}
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "16px", maxWidth: 520, margin: "0 auto", width: "100%", gap: 14 }}>

          {/* Score badges */}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700, color: "#4ade80" }}>✓ {score} corretas</div>
            <div style={{ background: "rgba(234,179,8,0.15)", border: "1px solid rgba(234,179,8,0.3)", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700, color: "#fbbf24" }}>⭐ {xp} XP</div>
          </div>

          {/* Teacher + question bubble */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, animation: "slideIn 0.3s ease" }}>
            <TeacherAvatar teacher={teacher} speaking={speaking} size={64} />
            <div style={{ flex: 1 }}>
              <SpeechBubble
                text={showTeacherMsg ? teacherMsg : q.question}
                color={teacher.color}
                side="left"
                visible={true}
              />
            </div>
          </div>

          {/* Options */}
          <div style={{ display: "grid", gap: 10 }}>
            {q.options.map((opt, i) => {
              let bg = "rgba(255,255,255,0.04)";
              let border = "rgba(255,255,255,0.1)";
              let color = "white";
              let icon = null;
              if (answered) {
                if (i === q.correct) { bg = "rgba(34,197,94,0.15)"; border = "#22c55e"; color = "#4ade80"; icon = <CheckCircle style={{ width: 18, height: 18, color: "#4ade80" }} />; }
                else if (i === selected) { bg = "rgba(239,68,68,0.15)"; border = "#ef4444"; color = "#f87171"; icon = <XCircle style={{ width: 18, height: 18, color: "#f87171" }} />; }
                else { bg = "rgba(255,255,255,0.02)"; border = "rgba(255,255,255,0.05)"; color = "#4b5563"; }
              }
              return (
                <button
                  key={i}
                  onClick={() => answerQA(i)}
                  disabled={answered}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "14px 16px", borderRadius: 14,
                    border: `1.5px solid ${border}`,
                    background: bg, color, cursor: answered ? "default" : "pointer",
                    textAlign: "left", fontSize: 14, fontWeight: 500,
                    transition: "all 0.2s ease",
                    transform: answered && i === q.correct ? "scale(1.02)" : "scale(1)",
                    animation: answered && i === q.correct ? "correctPop 0.4s ease" : "none",
                  }}
                  onMouseEnter={e => { if (!answered) (e.currentTarget as HTMLButtonElement).style.background = `${teacher.color}15`; }}
                  onMouseLeave={e => { if (!answered) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)"; }}
                >
                  <span style={{ width: 28, height: 28, borderRadius: "50%", border: `1.5px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span style={{ flex: 1 }}>{opt}</span>
                  {icon && <span style={{ marginLeft: "auto" }}>{icon}</span>}
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {answered && (
            <div style={{
              borderRadius: 14, padding: "14px 16px",
              background: selected === q.correct ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
              border: `1px solid ${selected === q.correct ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
              animation: "slideIn 0.3s ease",
            }}>
              <div style={{ fontWeight: 700, marginBottom: 4, color: selected === q.correct ? "#4ade80" : "#f87171" }}>
                {selected === q.correct ? "✅ Correto!" : "❌ Incorreto"}
              </div>
              <p style={{ fontSize: 13, color: "#d1d5db", margin: 0 }}>{q.explanation}</p>
              {q.tip && <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 4, fontStyle: "italic" }}>"{q.tip}"</p>}
            </div>
          )}

          {answered && (
            <button
              onClick={nextQA}
              style={{ padding: "14px", borderRadius: 14, border: "none", background: `linear-gradient(135deg, ${teacher.color}, ${teacher.color}cc)`, color: "white", cursor: "pointer", fontWeight: 700, fontSize: 15, boxShadow: `0 4px 20px ${teacher.color}44` }}
            >
              {qaIdx < qaList.length - 1 ? "Próxima Pergunta →" : "Ver Resultado →"}
            </button>
          )}
        </div>
        <style>{`
          @keyframes slideIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
          @keyframes correctPop { 0%{transform:scale(1)} 40%{transform:scale(1.04)} 100%{transform:scale(1.02)} }
        `}</style>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // TELA: Resultado — cinematográfico
  // ════════════════════════════════════════════════════════════════════════════
  if (phase === "result" && result && teacher) {
    const pct = Math.round((result.correct / result.total) * 100);
    const medal = pct === 100 ? "🥇" : pct >= 80 ? "🥈" : pct >= 60 ? "🥉" : "📚";
    const msg = pct === 100 ? "Perfeito! Você é incrível!" : pct >= 80 ? "Excelente trabalho!" : pct >= 60 ? "Bom trabalho, continue!" : "Continue praticando!";
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #0f0c29 0%, #1a1040 50%, #0d1117 100%)", color: "white", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 16px" }}>
        <ConfettiBurst active={pct >= 80} />
        <div style={{ maxWidth: 400, width: "100%", textAlign: "center" }}>
          {/* Teacher celebrating */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <TeacherAvatar teacher={teacher} speaking={false} size={88} />
          </div>

          <div style={{ fontSize: 72, marginBottom: 8, animation: "medalBounce 0.6s cubic-bezier(0.23,1,0.32,1)" }}>{medal}</div>
          <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 4 }}>{msg}</h2>
          <p style={{ color: "#94a3b8", marginBottom: 24, fontSize: 14 }}>{teacher.name} está orgulhoso de você!</p>

          {/* Stats */}
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: 20, marginBottom: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
              {[
                { val: result.correct, label: "Corretas", color: "#4ade80" },
                { val: `${pct}%`, label: "Acerto", color: "#818cf8" },
                { val: `+${result.xpEarned}`, label: "XP Ganho", color: "#fbbf24" },
              ].map(s => (
                <div key={s.label} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: 11, color: "#6b7280" }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 99, height: 10 }}>
              <div style={{ height: 10, borderRadius: 99, background: `linear-gradient(90deg, ${teacher.color}, #8b5cf6)`, width: `${pct}%`, transition: "width 1s ease" }} />
            </div>
          </div>

          {result.weakWords.length > 0 && (
            <div style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 14, padding: "12px 16px", marginBottom: 20, textAlign: "left" }}>
              <p style={{ color: "#fbbf24", fontWeight: 700, fontSize: 13, marginBottom: 8 }}>📌 Palavras para revisar:</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {result.weakWords.map((w, i) => (
                  <span key={i} style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 20, padding: "2px 10px", fontSize: 12, color: "#fcd34d" }}>{w}</span>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button
              onClick={() => { setPhase("select-topic"); setScore(0); setWeakWords([]); setResult(null); setLives(5); setStreak(0); }}
              style={{ padding: "14px", borderRadius: 14, border: "none", background: `linear-gradient(135deg, ${teacher.color}, #8b5cf6)`, color: "white", cursor: "pointer", fontWeight: 700, fontSize: 15 }}
            >
              🎯 Nova Aula
            </button>
            <button
              onClick={() => { setPhase("qa"); setQaIdx(0); setScore(0); setSelected(null); setAnswered(false); setLives(5); setStreak(0); }}
              style={{ padding: "14px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "white", cursor: "pointer", fontWeight: 600, fontSize: 14 }}
            >
              🔄 Refazer Quiz
            </button>
            <button
              onClick={() => setLocation("/plans")}
              style={{ padding: "14px", borderRadius: 14, border: "1px solid rgba(234,179,8,0.3)", background: "rgba(234,179,8,0.1)", color: "#fbbf24", cursor: "pointer", fontWeight: 700, fontSize: 14 }}
            >
              ⭐ Desbloquear Acesso Completo
            </button>
          </div>
        </div>
        <style>{`@keyframes medalBounce { 0%{transform:scale(0) rotate(-20deg)} 70%{transform:scale(1.15) rotate(5deg)} 100%{transform:scale(1) rotate(0)} }`}</style>
      </div>
    );
  }

  return null;
}
