/**
 * ImmersiveDialogue — Aula imersiva com diálogo real
 * Professor fala com voz nativa (Edge TTS Neural)
 * Texto rola palavra por palavra na tela enquanto o professor fala
 * Aluno responde, professor corrige e continua
 * Funciona sem login. Sem dependências externas.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { speakEdgeTTS, stopEdgeTTS, onLipSyncAmplitude } from "@/lib/edgeTTSClient";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

// ── Tipos ─────────────────────────────────────────────────────────────────────
interface DialogueLine {
  speaker: "teacher" | "student";
  text: string;          // no idioma alvo
  translation: string;   // em português
  vocab?: { word: string; meaning: string }[];
}

interface LessonData {
  lang: string;
  langName: string;
  ttsLang: string;
  teacherName: string;
  teacherEmoji: string;
  teacherGender: "male" | "female";
  sceneEmoji: string;
  sceneName: string;
  sceneColor: string;
  dialogues: DialogueLine[];
}

// ── Conteúdo pré-pronto: EN, ES, FR ──────────────────────────────────────────
const LESSONS: LessonData[] = [
  {
    lang: "en",
    langName: "Inglês",
    ttsLang: "en-US",
    teacherName: "Sarah",
    teacherEmoji: "👩‍🏫",
    teacherGender: "female",
    sceneEmoji: "🏖️",
    sceneName: "Praia de Miami",
    sceneColor: "#0ea5e9",
    dialogues: [
      { speaker: "teacher", text: "Good morning! Welcome to the beach.", translation: "Bom dia! Bem-vindo à praia.", vocab: [{ word: "morning", meaning: "manhã" }, { word: "beach", meaning: "praia" }] },
      { speaker: "student", text: "Good morning, Sarah! The beach is beautiful.", translation: "Bom dia, Sarah! A praia é linda." },
      { speaker: "teacher", text: "Yes! The water is warm today. Do you like swimming?", translation: "Sim! A água está quente hoje. Você gosta de nadar?", vocab: [{ word: "water", meaning: "água" }, { word: "warm", meaning: "quente" }, { word: "swimming", meaning: "nadar" }] },
      { speaker: "student", text: "Yes, I love swimming! The water is perfect.", translation: "Sim, adoro nadar! A água está perfeita." },
      { speaker: "teacher", text: "Excellent! Let's learn some beach vocabulary. Can you see the waves?", translation: "Excelente! Vamos aprender vocabulário da praia. Você consegue ver as ondas?", vocab: [{ word: "waves", meaning: "ondas" }, { word: "vocabulary", meaning: "vocabulário" }] },
      { speaker: "student", text: "Yes! The waves are big today.", translation: "Sim! As ondas estão grandes hoje." },
      { speaker: "teacher", text: "Very good! Now, repeat after me: The sun is shining brightly.", translation: "Muito bem! Agora, repita comigo: O sol está brilhando intensamente.", vocab: [{ word: "sun", meaning: "sol" }, { word: "shining", meaning: "brilhando" }] },
      { speaker: "student", text: "The sun is shining brightly!", translation: "O sol está brilhando intensamente!" },
      { speaker: "teacher", text: "Perfect pronunciation! You are doing great. See you tomorrow!", translation: "Pronúncia perfeita! Você está indo muito bem. Até amanhã!", vocab: [{ word: "pronunciation", meaning: "pronúncia" }, { word: "tomorrow", meaning: "amanhã" }] },
    ],
  },
  {
    lang: "es",
    langName: "Espanhol",
    ttsLang: "es-ES",
    teacherName: "Carlos",
    teacherEmoji: "👨‍🏫",
    teacherGender: "male",
    sceneEmoji: "🌆",
    sceneName: "Madrid",
    sceneColor: "#f59e0b",
    dialogues: [
      { speaker: "teacher", text: "¡Buenos días! Bienvenido a Madrid.", translation: "Bom dia! Bem-vindo a Madrid.", vocab: [{ word: "buenos días", meaning: "bom dia" }, { word: "bienvenido", meaning: "bem-vindo" }] },
      { speaker: "student", text: "¡Buenos días, Carlos! Madrid es muy bonita.", translation: "Bom dia, Carlos! Madrid é muito bonita." },
      { speaker: "teacher", text: "¡Sí! La ciudad es hermosa. ¿Te gusta el español?", translation: "Sim! A cidade é linda. Você gosta do espanhol?", vocab: [{ word: "ciudad", meaning: "cidade" }, { word: "hermosa", meaning: "linda" }] },
      { speaker: "student", text: "Sí, me gusta mucho. Quiero aprender más.", translation: "Sim, gosto muito. Quero aprender mais." },
      { speaker: "teacher", text: "¡Perfecto! Vamos a practicar. ¿Cómo te llamas?", translation: "Perfeito! Vamos praticar. Como você se chama?", vocab: [{ word: "practicar", meaning: "praticar" }, { word: "llamarse", meaning: "chamar-se" }] },
      { speaker: "student", text: "Me llamo João. ¿Y tú?", translation: "Meu nome é João. E você?" },
      { speaker: "teacher", text: "Me llamo Carlos. Mucho gusto, João. ¡Tu español es muy bueno!", translation: "Meu nome é Carlos. Muito prazer, João. Seu espanhol é muito bom!", vocab: [{ word: "mucho gusto", meaning: "muito prazer" }, { word: "bueno", meaning: "bom" }] },
      { speaker: "student", text: "¡Gracias! Usted es un buen profesor.", translation: "Obrigado! O senhor é um bom professor." },
      { speaker: "teacher", text: "¡Muchas gracias! Hasta mañana, João. ¡Sigue practicando!", translation: "Muito obrigado! Até amanhã, João. Continue praticando!", vocab: [{ word: "hasta mañana", meaning: "até amanhã" }, { word: "sigue", meaning: "continue" }] },
    ],
  },
  {
    lang: "fr",
    langName: "Francês",
    ttsLang: "fr-FR",
    teacherName: "Marie",
    teacherEmoji: "👩‍🏫",
    teacherGender: "female",
    sceneEmoji: "🗼",
    sceneName: "Paris",
    sceneColor: "#8b5cf6",
    dialogues: [
      { speaker: "teacher", text: "Bonjour! Bienvenue à Paris.", translation: "Bom dia! Bem-vindo a Paris.", vocab: [{ word: "bonjour", meaning: "bom dia" }, { word: "bienvenue", meaning: "bem-vindo" }] },
      { speaker: "student", text: "Bonjour, Marie! Paris est magnifique.", translation: "Bom dia, Marie! Paris é magnífica." },
      { speaker: "teacher", text: "Oui! La ville est très belle. Vous aimez le français?", translation: "Sim! A cidade é muito bonita. Você gosta do francês?", vocab: [{ word: "ville", meaning: "cidade" }, { word: "belle", meaning: "bonita" }] },
      { speaker: "student", text: "Oui, j'aime beaucoup le français!", translation: "Sim, gosto muito do francês!" },
      { speaker: "teacher", text: "Très bien! Répétez après moi: Je m'appelle... Comment vous appelez-vous?", translation: "Muito bem! Repita comigo: Meu nome é... Como você se chama?", vocab: [{ word: "répétez", meaning: "repita" }, { word: "s'appeler", meaning: "chamar-se" }] },
      { speaker: "student", text: "Je m'appelle João. Et vous?", translation: "Meu nome é João. E você?" },
      { speaker: "teacher", text: "Je m'appelle Marie. Enchanté, João! Votre français est excellent!", translation: "Meu nome é Marie. Encantada, João! Seu francês é excelente!", vocab: [{ word: "enchanté", meaning: "encantado/a" }, { word: "excellent", meaning: "excelente" }] },
      { speaker: "student", text: "Merci beaucoup, Marie!", translation: "Muito obrigado, Marie!" },
      { speaker: "teacher", text: "De rien! À demain, João. Continuez à pratiquer!", translation: "De nada! Até amanhã, João. Continue praticando!", vocab: [{ word: "de rien", meaning: "de nada" }, { word: "à demain", meaning: "até amanhã" }] },
    ],
  },
];

// ── Hook: texto rolando palavra por palavra ───────────────────────────────────
function useRollingText(text: string, isActive: boolean, wordsPerSecond = 2.5) {
  const [visibleWords, setVisibleWords] = useState(0);
  const words = text.split(" ");

  useEffect(() => {
    if (!isActive) { setVisibleWords(0); return; }
    setVisibleWords(0);
    const interval = setInterval(() => {
      setVisibleWords(v => {
        if (v >= words.length) { clearInterval(interval); return v; }
        return v + 1;
      });
    }, 1000 / wordsPerSecond);
    return () => clearInterval(interval);
  }, [text, isActive]);

  return words.slice(0, visibleWords).join(" ");
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function ImmersiveDialogue() {
  const [selectedLang, setSelectedLang] = useState<LessonData | null>(null);
  const [lineIndex, setLineIndex] = useState(0);
  const [phase, setPhase] = useState<"auto" | "waiting" | "done">("auto");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lipAmplitude, setLipAmplitude] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showVocab, setShowVocab] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: "teacher" | "student"; text: string; translation: string }[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const teacherChatMutation = trpc.polyLesson.teacherChat.useMutation();

  // Lip sync amplitude
  useEffect(() => {
    onLipSyncAmplitude((amp) => setLipAmplitude(amp));
    return () => { onLipSyncAmplitude(null); };
  }, []);

  const currentLine = selectedLang?.dialogues[lineIndex];

  // Auto-play teacher lines
  const playLine = useCallback(async (line: DialogueLine, lesson: LessonData) => {
    if (line.speaker !== "teacher") {
      setPhase("waiting");
      return;
    }
    setPhase("auto");
    setIsSpeaking(true);
    setShowTranslation(false);
    setShowVocab(false);
    await speakEdgeTTS(line.text, lesson.ttsLang, {
      gender: lesson.teacherGender,
      onStart: () => setIsSpeaking(true),
      onEnd: () => {
        setIsSpeaking(false);
        setShowTranslation(true);
        setShowVocab(true);
        // Auto-advance after 3s if teacher line
        autoAdvanceTimer.current = setTimeout(() => {
          setPhase("waiting");
        }, 3000);
      },
    });
  }, []);

  useEffect(() => {
    if (!selectedLang || !currentLine) return;
    if (currentLine.speaker === "teacher") {
      playLine(currentLine, selectedLang);
    } else {
      setPhase("waiting");
    }
    return () => { if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current); };
  }, [lineIndex, selectedLang]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const handleStudentSend = async () => {
    if (!selectedLang || !currentLine || !userInput.trim()) return;
    const text = userInput.trim();
    setUserInput("");

    // Add student message to history
    setChatHistory(h => [...h, { role: "student", text, translation: text }]);

    // Advance to next line
    const nextIndex = lineIndex + 1;
    if (nextIndex < selectedLang.dialogues.length) {
      setLineIndex(nextIndex);
    } else {
      setPhase("done");
    }
  };

  const handleNextLine = () => {
    if (!selectedLang) return;
    const nextIndex = lineIndex + 1;
    if (nextIndex < selectedLang.dialogues.length) {
      setLineIndex(nextIndex);
    } else {
      setPhase("done");
    }
  };

  const handleReplay = () => {
    if (!selectedLang || !currentLine) return;
    stopEdgeTTS();
    playLine(currentLine, selectedLang);
  };

  const handleRestart = () => {
    stopEdgeTTS();
    setLineIndex(0);
    setPhase("auto");
    setChatHistory([]);
    setShowTranslation(false);
    setShowVocab(false);
  };

  // ── Tela de seleção de idioma ─────────────────────────────────────────────
  if (!selectedLang) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "system-ui, sans-serif" }}>
        <Link href="/" style={{ position: "absolute", top: 20, left: 20, color: "#888", textDecoration: "none", fontSize: 14 }}>← Voltar</Link>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🌍</div>
        <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 900, marginBottom: 8, textAlign: "center" }}>Aula Imersiva com Diálogo Real</h1>
        <p style={{ color: "#888", fontSize: 15, marginBottom: 40, textAlign: "center", maxWidth: 400 }}>
          Professor nativo fala, texto aparece na tela, você responde. Como uma conversa real.
        </p>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
          {LESSONS.map(lesson => (
            <button
              key={lesson.lang}
              onClick={() => { setSelectedLang(lesson); setLineIndex(0); setPhase("auto"); setChatHistory([]); }}
              style={{
                background: `linear-gradient(135deg, ${lesson.sceneColor}22, ${lesson.sceneColor}44)`,
                border: `2px solid ${lesson.sceneColor}`,
                borderRadius: 20, padding: "28px 36px", cursor: "pointer",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
                transition: "transform 0.15s, box-shadow 0.15s",
                minWidth: 180,
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.05)"; e.currentTarget.style.boxShadow = `0 8px 32px ${lesson.sceneColor}60`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <div style={{ fontSize: 52 }}>{lesson.sceneEmoji}</div>
              <div style={{ color: "#fff", fontWeight: 800, fontSize: 20 }}>{lesson.langName}</div>
              <div style={{ color: "#aaa", fontSize: 13 }}>{lesson.sceneName}</div>
              <div style={{ color: lesson.sceneColor, fontSize: 13, fontWeight: 600 }}>{lesson.teacherEmoji} Prof. {lesson.teacherName}</div>
            </button>
          ))}
        </div>
        <p style={{ color: "#555", fontSize: 12, marginTop: 40 }}>Mais idiomas em breve • Sem login necessário</p>
      </div>
    );
  }

  const lesson = selectedLang;
  const line = currentLine!;
  const progress = Math.round(((lineIndex) / lesson.dialogues.length) * 100);

  // ── Tela de conclusão ─────────────────────────────────────────────────────
  if (phase === "done") {
    return (
      <div style={{ minHeight: "100vh", background: `linear-gradient(135deg, #0f0f1a, ${lesson.sceneColor}22)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "system-ui, sans-serif" }}>
        <div style={{ fontSize: 80, marginBottom: 16 }}>🎉</div>
        <h2 style={{ color: "#fff", fontSize: 28, fontWeight: 900, marginBottom: 8 }}>Aula Concluída!</h2>
        <p style={{ color: "#aaa", fontSize: 16, marginBottom: 32, textAlign: "center" }}>
          Você completou o diálogo em {lesson.langName} com o Prof. {lesson.teacherName}.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <button onClick={handleRestart} style={{ background: lesson.sceneColor, border: "none", borderRadius: 14, padding: "14px 28px", color: "#fff", fontWeight: 700, fontSize: 16, cursor: "pointer" }}>
            🔄 Repetir Aula
          </button>
          <button onClick={() => { setSelectedLang(null); stopEdgeTTS(); }} style={{ background: "rgba(255,255,255,0.1)", border: `1px solid ${lesson.sceneColor}`, borderRadius: 14, padding: "14px 28px", color: "#fff", fontWeight: 700, fontSize: 16, cursor: "pointer" }}>
            🌍 Outro Idioma
          </button>
          <Link href="/pricing" style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)", border: "none", borderRadius: 14, padding: "14px 28px", color: "#fff", fontWeight: 700, fontSize: 16, cursor: "pointer", textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
            ⭐ Ver Planos
          </Link>
        </div>
      </div>
    );
  }

  // ── Aula principal ────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(160deg, #0f0f1a 0%, ${lesson.sceneColor}18 100%)`, fontFamily: "system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", background: "rgba(0,0,0,0.4)", borderBottom: `1px solid ${lesson.sceneColor}30` }}>
        <button onClick={() => { stopEdgeTTS(); setSelectedLang(null); }} style={{ background: "transparent", border: "none", color: "#888", cursor: "pointer", fontSize: 20 }}>←</button>
        <div style={{ fontSize: 24 }}>{lesson.sceneEmoji}</div>
        <div>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>{lesson.langName} — {lesson.sceneName}</div>
          <div style={{ color: "#888", fontSize: 12 }}>Prof. {lesson.teacherName} {lesson.teacherEmoji}</div>
        </div>
        <div style={{ flex: 1 }} />
        {/* Progress bar */}
        <div style={{ width: 120, height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 3 }}>
          <div style={{ width: `${progress}%`, height: "100%", background: lesson.sceneColor, borderRadius: 3, transition: "width 0.5s" }} />
        </div>
        <div style={{ color: "#888", fontSize: 12 }}>{lineIndex}/{lesson.dialogues.length}</div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", maxWidth: 640, margin: "0 auto", width: "100%", padding: "20px 16px", gap: 16 }}>

        {/* Chat history */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
          {chatHistory.map((msg, i) => (
            <div key={i} style={{ display: "flex", justifyContent: msg.role === "student" ? "flex-end" : "flex-start", gap: 10, alignItems: "flex-end" }}>
              {msg.role === "teacher" && (
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${lesson.sceneColor}33`, border: `2px solid ${lesson.sceneColor}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                  {lesson.teacherEmoji}
                </div>
              )}
              <div style={{ maxWidth: "75%", padding: "10px 14px", borderRadius: msg.role === "student" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: msg.role === "student" ? lesson.sceneColor : "rgba(255,255,255,0.08)", color: "#fff", fontSize: 14, lineHeight: 1.5 }}>
                <div>{msg.text}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>{msg.translation}</div>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Current line — teacher or student */}
        <div style={{ background: "rgba(0,0,0,0.5)", borderRadius: 20, border: `1px solid ${lesson.sceneColor}40`, overflow: "hidden" }}>

          {/* Teacher speaking */}
          {line.speaker === "teacher" && (
            <div style={{ padding: "20px 20px 16px" }}>
              {/* Teacher avatar + name */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: "50%",
                  background: `linear-gradient(135deg, ${lesson.sceneColor}44, ${lesson.sceneColor}22)`,
                  border: `3px solid ${isSpeaking ? lesson.sceneColor : lesson.sceneColor + "60"}`,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28,
                  boxShadow: isSpeaking ? `0 0 24px ${lesson.sceneColor}80` : "none",
                  transition: "box-shadow 0.2s, border-color 0.2s",
                  animation: isSpeaking ? "teacher-breathe 0.5s ease-in-out infinite alternate" : "none",
                }}>
                  {lesson.teacherEmoji}
                </div>
                <div>
                  <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>Prof. {lesson.teacherName}</div>
                  <div style={{ color: lesson.sceneColor, fontSize: 12 }}>{lesson.langName} nativo</div>
                </div>
                {/* Sound bars when speaking */}
                {isSpeaking && (
                  <div style={{ display: "flex", gap: 3, alignItems: "flex-end", marginLeft: "auto" }}>
                    {[0, 1, 2, 3, 4].map(i => (
                      <div key={i} style={{
                        width: 4, height: 8 + lipAmplitude * 20 + (i % 2) * 4,
                        background: lesson.sceneColor, borderRadius: 2,
                        transition: "height 0.05s",
                        animationDelay: `${i * 0.08}s`,
                      }} />
                    ))}
                  </div>
                )}
              </div>

              {/* Rolling text — teacher speech */}
              <RollingText
                text={line.text}
                isActive={phase === "auto" || isSpeaking}
                color="#fff"
                fontSize={18}
                accentColor={lesson.sceneColor}
                vocab={line.vocab}
              />

              {/* Translation */}
              {showTranslation && (
                <div style={{ marginTop: 10, padding: "8px 12px", background: "rgba(255,255,255,0.05)", borderRadius: 10, borderLeft: `3px solid ${lesson.sceneColor}` }}>
                  <div style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>🇧🇷 Tradução</div>
                  <div style={{ color: "#ccc", fontSize: 14 }}>{line.translation}</div>
                </div>
              )}

              {/* Vocab cards */}
              {showVocab && line.vocab && line.vocab.length > 0 && (
                <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {line.vocab.map((v, i) => (
                    <button
                      key={i}
                      onClick={() => speakEdgeTTS(v.word, lesson.ttsLang, { gender: lesson.teacherGender })}
                      style={{ background: `${lesson.sceneColor}22`, border: `1px solid ${lesson.sceneColor}60`, borderRadius: 10, padding: "6px 12px", color: "#fff", fontSize: 13, cursor: "pointer", display: "flex", gap: 6, alignItems: "center" }}
                    >
                      <span style={{ color: lesson.sceneColor }}>🔊</span>
                      <strong>{v.word}</strong>
                      <span style={{ color: "#aaa" }}>= {v.meaning}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Controls */}
              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                <button onClick={handleReplay} style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 10, padding: "10px 16px", color: "#aaa", cursor: "pointer", fontSize: 13 }}>
                  🔊 Repetir
                </button>
                <button
                  onClick={() => { setShowTranslation(true); setShowVocab(true); }}
                  style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 10, padding: "10px 16px", color: "#aaa", cursor: "pointer", fontSize: 13 }}
                >
                  🇧🇷 Ver tradução
                </button>
                <button
                  onClick={handleNextLine}
                  style={{ flex: 1, background: lesson.sceneColor, border: "none", borderRadius: 10, padding: "10px 16px", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14 }}
                >
                  Continuar →
                </button>
              </div>
            </div>
          )}

          {/* Student turn */}
          {line.speaker === "student" && phase === "waiting" && (
            <div style={{ padding: "20px" }}>
              <div style={{ color: "#888", fontSize: 13, marginBottom: 8 }}>💬 Sua vez de responder:</div>
              <div style={{ padding: "12px 16px", background: `${lesson.sceneColor}11`, borderRadius: 12, border: `1px solid ${lesson.sceneColor}40`, marginBottom: 16 }}>
                <div style={{ color: "#fff", fontSize: 16, fontStyle: "italic" }}>{line.text}</div>
                <div style={{ color: "#888", fontSize: 12, marginTop: 4 }}>💡 {line.translation}</div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <input
                  type="text"
                  value={userInput}
                  onChange={e => setUserInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleStudentSend(); }}
                  placeholder={`Digite em ${lesson.langName}...`}
                  style={{ flex: 1, padding: "12px 14px", borderRadius: 12, border: `2px solid ${lesson.sceneColor}40`, background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: 14, outline: "none" }}
                />
                <button
                  onClick={handleStudentSend}
                  style={{ background: lesson.sceneColor, border: "none", borderRadius: 12, width: 48, height: 48, fontSize: 20, cursor: "pointer" }}
                >
                  ➤
                </button>
              </div>
              <button
                onClick={handleNextLine}
                style={{ width: "100%", marginTop: 10, background: "rgba(255,255,255,0.06)", border: `1px solid ${lesson.sceneColor}30`, borderRadius: 10, padding: "10px", color: "#888", cursor: "pointer", fontSize: 13 }}
              >
                Pular → (ver resposta do professor)
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes teacher-breathe {
          from { transform: scale(1); }
          to { transform: scale(1.04); }
        }
      `}</style>
    </div>
  );
}

// ── RollingText: texto aparece palavra por palavra ────────────────────────────
function RollingText({ text, isActive, color, fontSize, accentColor, vocab }: {
  text: string;
  isActive: boolean;
  color: string;
  fontSize: number;
  accentColor: string;
  vocab?: { word: string; meaning: string }[];
}) {
  const [visibleCount, setVisibleCount] = useState(0);
  const words = text.split(" ");
  const vocabWords = new Set((vocab || []).map(v => v.word.toLowerCase()));

  useEffect(() => {
    if (!isActive) { setVisibleCount(words.length); return; }
    setVisibleCount(0);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setVisibleCount(i);
      if (i >= words.length) clearInterval(interval);
    }, 320);
    return () => clearInterval(interval);
  }, [text, isActive]);

  return (
    <div style={{ fontSize, color, lineHeight: 1.6, minHeight: fontSize * 1.6 * 2 }}>
      {words.map((word, i) => {
        const clean = word.replace(/[.,!?¡¿]/g, "").toLowerCase();
        const isVocab = vocabWords.has(clean);
        return (
          <span
            key={i}
            style={{
              opacity: i < visibleCount ? 1 : 0,
              transition: "opacity 0.2s",
              color: isVocab ? accentColor : color,
              fontWeight: isVocab ? 700 : 400,
              marginRight: 4,
              display: "inline-block",
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
}
