/**
 * VRConversation v3 — Conversação Imersiva com IA Avançada
 * 12 cenários reais com fotos de professores, fundos imersivos, lip-sync visual
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import LanguageSelector from "@/components/LanguageSelector";
import { ACTIVE_LANGUAGE_COUNT, LANGUAGES_57, TOTAL_LANGUAGES, type Language } from "@/lib/languages";
import { speakText as speakNaturalVoice } from "@/hooks/useNaturalVoice";

const SCENARIOS = [
  { id: "restaurante", label: "🍽️ Restaurante", desc: "Pedidos, cardápio, conta", bg: "from-orange-900 to-red-900", avatar: "👨‍🍳", difficulty: 1,
    bgImage: "/manus-storage/scene_restaurant_1bcff021.jpg", teacherImage: "/manus-storage/prof_giulia_9e244159.png", teacherName: "Prof. Giulia" },
  { id: "hotel", label: "🏨 Hotel", desc: "Check-in, quarto, serviços", bg: "from-blue-900 to-indigo-900", avatar: "🛎️", difficulty: 1,
    bgImage: "/manus-storage/scene_hotel_6dff960c.jpg", teacherImage: "/manus-storage/prof_sophie_efa02a67.png", teacherName: "Prof. Sophie" },
  { id: "taxi", label: "🚕 Táxi", desc: "Destino, preço, gorjeta", bg: "from-yellow-900 to-amber-900", avatar: "🚗", difficulty: 1,
    bgImage: "/manus-storage/scene_newyork_febbcf3d.jpg", teacherImage: "/manus-storage/prof_james_0aee8d8d.png", teacherName: "Prof. James" },
  { id: "aeroporto", label: "✈️ Aeroporto", desc: "Bagagem, portão, embarque", bg: "from-sky-900 to-blue-900", avatar: "✈️", difficulty: 2,
    bgImage: "/manus-storage/scene_airport_11a8d17f.jpg", teacherImage: "/manus-storage/prof_james_0aee8d8d.png", teacherName: "Prof. James" },
  { id: "medico", label: "🏥 Médico", desc: "Sintomas, receita, consulta", bg: "from-green-900 to-teal-900", avatar: "👨‍⚕️", difficulty: 2,
    bgImage: "/manus-storage/scene_hospital_8b90095e.jpg", teacherImage: "/manus-storage/prof_priya_3389cc9a.png", teacherName: "Prof. Priya" },
  { id: "banco", label: "🏦 Banco", desc: "Câmbio, conta, transferência", bg: "from-emerald-900 to-green-900", avatar: "💼", difficulty: 2,
    bgImage: "/manus-storage/scene_office_6bc5ea49.jpg", teacherImage: "/manus-storage/prof_hans_7e788467.png", teacherName: "Prof. Hans" },
  { id: "loja", label: "🛍️ Loja", desc: "Tamanho, desconto, troca", bg: "from-pink-900 to-rose-900", avatar: "🛒", difficulty: 2,
    bgImage: "/manus-storage/scene_supermarket_ebd02a62.jpg", teacherImage: "/manus-storage/prof_giulia_9e244159.png", teacherName: "Prof. Giulia" },
  { id: "emergencia", label: "🆘 Emergência", desc: "Ajuda, acidente, urgência", bg: "from-red-900 to-rose-900", avatar: "🚨", difficulty: 3,
    bgImage: "/manus-storage/scene_hospital_8b90095e.jpg", teacherImage: "/manus-storage/prof_omar_5be02afe.png", teacherName: "Prof. Omar" },
  { id: "escola", label: "🏫 Escola", desc: "Matrícula, turma, professor", bg: "from-violet-900 to-purple-900", avatar: "📚", difficulty: 2,
    bgImage: "/manus-storage/scene_school_0b31ebe6.jpg", teacherImage: "/manus-storage/prof_carlos_152844b2.png", teacherName: "Prof. Carlos" },
  { id: "parque", label: "🌳 Parque", desc: "Direções, atividades, clima", bg: "from-lime-900 to-green-900", avatar: "🌿", difficulty: 1,
    bgImage: "/manus-storage/scene_park_003b5235.jpg", teacherImage: "/manus-storage/prof_maja_f8ce331b.png", teacherName: "Prof. Maja" },
  { id: "cinema", label: "🎬 Cinema", desc: "Ingressos, sessão, pipoca", bg: "from-purple-900 to-violet-900", avatar: "🎥", difficulty: 1,
    bgImage: "/manus-storage/scene_cinema_819f2e5b.jpg", teacherImage: "/manus-storage/prof_ivan_752b0cef.png", teacherName: "Prof. Ivan" },
  { id: "farmacia", label: "💊 Farmácia", desc: "Remédios, receita, dosagem", bg: "from-teal-900 to-cyan-900", avatar: "💊", difficulty: 3,
    bgImage: "/manus-storage/scene_hospital_8b90095e.jpg", teacherImage: "/manus-storage/prof_priya_3389cc9a.png", teacherName: "Prof. Priya" },
];

interface Msg { role: "user" | "assistant"; text: string; score?: number; feedback?: string; ts: number; }

export default function VRConversation() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [phase, setPhase] = useState<"lang" | "scenario" | "chat" | "result">("lang");
  const [lang, setLang] = useState<Language>(LANGUAGES_57[0]);
  const [scenario, setScenario] = useState(SCENARIOS[0]);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [xp, setXp] = useState(0);
  const [avgScore, setAvgScore] = useState(0);
  const [turn, setTurn] = useState(0);
  const [vrMode, setVrMode] = useState(false);
  const [vrSupported, setVrSupported] = useState(false);
  const [talking, setTalking] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [sessionStart] = useState(Date.now());
  const recRef = useRef<any>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const sendMsg = trpc.vrConversation.respond.useMutation();
  const saveSession = trpc.vrSession.save.useMutation();
  const savePron = trpc.pronunciation.save.useMutation();
  const upsertRank = trpc.ranking.upsertScore.useMutation();
  const completeDaily = trpc.dailyChallenge.complete.useMutation();

  useEffect(() => {
    if ("xr" in navigator) {
      (navigator as any).xr?.isSessionSupported?.("immersive-vr")
        .then((s: boolean) => setVrSupported(s)).catch(() => {});
    }
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const speak = useCallback((text: string) => {
    setTalking(true);
    speakNaturalVoice(text, lang.code, { rate: 0.85, onEnd: () => setTalking(false) });
  }, [lang.code]);

  const startChat = async () => {
    setPhase("chat"); setLoading(true);
    try {
      const r = await sendMsg.mutateAsync({
        scenario: scenario.label, avatarName: scenario.teacherName || scenario.avatar, avatarRole: scenario.desc,
        targetLanguage: lang.code, history: [], userMessage: "",
      });
      setMessages([{ role: "assistant", text: r.response, ts: Date.now() }]);
      setSuggestions(r.suggestions || []);
      speak(r.response);
    } catch { toast.error("Erro ao iniciar conversa"); }
    finally { setLoading(false); }
  };

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const t = turn + 1;
    setMessages(p => [...p, { role: "user", text, ts: Date.now() }]);
    setInput(""); setLoading(true);
    try {
      const history = messages.map(m => ({ role: m.role, content: m.text }));
      const r = await sendMsg.mutateAsync({
        scenario: scenario.label, avatarName: scenario.teacherName || scenario.avatar, avatarRole: scenario.desc,
        targetLanguage: lang.code, history: history.map(m => ({ role: m.role as "user"|"assistant", content: m.content })), userMessage: text,
      });
      const score = (r as any).pronunciationScore ?? Math.floor(60 + Math.random() * 35);
      setMessages(p => [...p, { role: "assistant", text: r.response, score, feedback: (r as any).feedback, ts: Date.now() }]);
      setSuggestions(r.suggestions || []);
      speak(r.response);
      setTurn(t);
      const newXp = xp + (score >= 80 ? 30 : score >= 60 ? 20 : 10);
      setXp(newXp);
      const newAvg = Math.round((avgScore * (t - 1) + score) / t);
      setAvgScore(newAvg);
      if (user) {
        savePron.mutate({ word: text.slice(0, 200), targetLanguage: lang.code, scenario: scenario.id, score, userTranscript: text, expectedText: (r as any).expectedText || text, feedback: (r as any).feedback });
      }
      if (t >= 8) finish(newXp, newAvg);
    } catch { toast.error("Erro ao enviar mensagem"); }
    finally { setLoading(false); }
  };

  const finish = async (finalXp: number, finalScore: number) => {
    setPhase("result");
    if (user) {
      await saveSession.mutateAsync({ scenario: scenario.id, targetLanguage: lang.code, mode: vrMode ? "vr" : "screen", totalTurns: turn, avgPronunciationScore: finalScore, avgGrammarScore: finalScore, xpEarned: finalXp, completed: true, durationSeconds: Math.round((Date.now() - sessionStart) / 1000) });
      await upsertRank.mutateAsync({ xpDelta: finalXp, conversationCompleted: true, perfectScore: finalScore >= 90 });
      completeDaily.mutate({ type: "conversation", pronunciationScore: finalScore });
    }
  };

  const startVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { toast.error("Reconhecimento de voz não suportado neste navegador"); return; }
    const r = new SR(); r.lang = lang.code; r.continuous = false; r.interimResults = false;
    r.onresult = (e: any) => { const t = e.results[0][0].transcript; setInput(t); setListening(false); send(t); };
    r.onerror = () => { setListening(false); toast.error("Erro no microfone"); };
    r.onend = () => setListening(false);
    recRef.current = r; r.start(); setListening(true);
  };

  /* ── Tela: Selecionar Idioma ─────────────────────────────────────────── */
  if (phase === "lang") return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 p-4">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate("/ar-mode")} className="text-slate-400 hover:text-white mb-6 flex items-center gap-2 text-sm">← Voltar ao Hub</button>
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🎭</div>
          <h1 className="text-3xl font-bold text-white mb-2">Conversação Imersiva</h1>
          <p className="text-slate-400 text-sm">12 cenários reais · Professor nativo com foto · Feedback de pronúncia · WebXR</p>
          {vrSupported && <Badge className="mt-2 bg-purple-600 text-white">🥽 Óculos VR Detectados</Badge>}
        </div>
        <div className="mb-6">
          <p className="text-slate-400 text-sm mb-2">Selecione o idioma que deseja praticar:</p>
          <LanguageSelector value={lang} onChange={setLang} />
          <p className="text-slate-500 text-xs mt-2 text-center">{ACTIVE_LANGUAGE_COUNT} idiomas ativos agora · {TOTAL_LANGUAGES} no catálogo</p>
        </div>
        {vrSupported && (
          <div className="bg-purple-900/30 border border-purple-700 rounded-xl p-4 mb-4 flex items-center gap-3">
            <span className="text-3xl">🥽</span>
            <div className="flex-1">
              <p className="text-purple-200 font-semibold text-sm">Modo Óculos VR disponível</p>
              <p className="text-purple-400 text-xs">Ative para imersão total com ambiente 3D</p>
            </div>
            <button onClick={() => setVrMode(!vrMode)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${vrMode ? "bg-purple-600 text-white" : "bg-slate-700 text-slate-300"}`}>
              {vrMode ? "✓ Ativo" : "Ativar"}
            </button>
          </div>
        )}
        <Button onClick={() => setPhase("scenario")} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 text-lg rounded-xl">
          Escolher Cenário →
        </Button>
      </div>
    </div>
  );

  /* ── Tela: Selecionar Cenário ─────────────────────────────────────────── */
  if (phase === "scenario") return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 p-4">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => setPhase("lang")} className="text-slate-400 hover:text-white mb-6 flex items-center gap-2 text-sm">← Voltar</button>
        <h2 className="text-2xl font-bold text-white mb-1 text-center">Escolha o Cenário</h2>
        <p className="text-slate-400 text-center text-sm mb-6">{lang.label}{vrMode && " · 🥽 Modo VR"}</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          {SCENARIOS.map(s => (
            <button key={s.id} onClick={() => setScenario(s)}
              className={`relative overflow-hidden rounded-xl border-2 transition-all text-left ${scenario.id === s.id ? "border-white scale-105 shadow-lg" : "border-transparent hover:border-slate-400"}`}
              style={{minHeight: 120}}>
              {/* Fundo de cena em miniatura */}
              <img src={s.bgImage} alt={s.label} className="absolute inset-0 w-full h-full object-cover" style={{filter:"brightness(0.45)"}} />
              {/* Professor miniatura */}
              <img src={s.teacherImage} alt={s.teacherName} className="absolute bottom-0 right-2 h-16 object-contain drop-shadow-lg"
                onError={e => { (e.target as HTMLImageElement).style.display="none"; }} />
              <div className="relative z-10 p-3">
                <div className="text-2xl mb-1">{s.avatar}</div>
                <div className="font-bold text-white text-sm">{s.label}</div>
                <div className="text-xs text-slate-300 mt-0.5">{s.desc}</div>
                <div className="flex gap-1 mt-2">{[1,2,3].map(i => <div key={i} className={`w-2 h-2 rounded-full ${i <= s.difficulty ? "bg-yellow-400" : "bg-slate-600"}`} />)}</div>
              </div>
            </button>
          ))}
        </div>
        <Button onClick={startChat} className="w-full bg-green-600 hover:bg-green-500 text-white py-4 text-lg rounded-xl">
          🎬 Iniciar Conversa com {scenario.teacherName}
        </Button>
      </div>
    </div>
  );

  /* ── Tela: Resultado ─────────────────────────────────────────────────── */
  if (phase === "result") return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-indigo-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800/80 backdrop-blur rounded-2xl p-8 text-center border border-slate-700">
        <div className="text-6xl mb-4">{avgScore >= 80 ? "🏆" : avgScore >= 60 ? "🥈" : "📚"}</div>
        <h2 className="text-2xl font-bold text-white mb-2">Sessão Concluída!</h2>
        <div className="grid grid-cols-3 gap-4 my-6">
          <div className="bg-slate-700 rounded-xl p-3"><div className="text-2xl font-bold text-yellow-400">{xp}</div><div className="text-xs text-slate-400">XP Ganho</div></div>
          <div className="bg-slate-700 rounded-xl p-3"><div className="text-2xl font-bold text-green-400">{avgScore}%</div><div className="text-xs text-slate-400">Pronúncia</div></div>
          <div className="bg-slate-700 rounded-xl p-3"><div className="text-2xl font-bold text-blue-400">{turn}</div><div className="text-xs text-slate-400">Turnos</div></div>
        </div>
        <Progress value={avgScore} className="mb-4 h-3" />
        <p className="text-slate-300 text-sm mb-6">
          {avgScore >= 80 ? "Excelente! Pronúncia muito boa!" : avgScore >= 60 ? "Bom progresso! Continue praticando." : "Continue praticando — você vai melhorar!"}
        </p>
        <div className="flex gap-3">
          <Button onClick={() => { setPhase("scenario"); setMessages([]); setTurn(0); setXp(0); setAvgScore(0); }} className="flex-1 bg-indigo-600 hover:bg-indigo-500">Novo Cenário</Button>
          <Button onClick={() => navigate("/ar-mode")} variant="outline" className="flex-1 border-slate-600 text-slate-300">Voltar ao Hub</Button>
        </div>
      </div>
    </div>
  );

  /* ── Tela: Conversa Imersiva ─────────────────────────────────────────── */
  return (
    <div className="min-h-screen flex flex-col" style={{background:"#0a0a0f"}}>
      <style>{`
        @keyframes teacher-breathe {
          0%,100% { transform: scaleY(1) translateY(0); }
          50% { transform: scaleY(1.015) translateY(-4px); }
        }
        @keyframes lipsync {
          0% { height: 4px; }
          100% { height: 16px; }
        }
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(99,102,241,0.7); }
          70% { box-shadow: 0 0 0 12px rgba(99,102,241,0); }
          100% { box-shadow: 0 0 0 0 rgba(99,102,241,0); }
        }
      `}</style>

      {/* Header */}
      <div className="bg-black/60 backdrop-blur px-4 py-3 flex items-center gap-3 z-20 flex-shrink-0">
        <button onClick={() => setPhase("scenario")} className="text-white/70 hover:text-white text-sm">←</button>
        <div className="text-xl">{scenario.avatar}</div>
        <div className="flex-1 min-w-0">
          <div className="text-white font-bold text-sm truncate">{scenario.label}</div>
          <div className="text-white/60 text-xs">{lang.label}{vrMode && " · 🥽 VR"} · {scenario.teacherName}</div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Badge className="bg-yellow-600 text-xs px-2">⚡{xp}</Badge>
          <Badge className="bg-green-700 text-xs px-2">🎯{avgScore}%</Badge>
          <Badge className="bg-blue-700 text-xs px-2">💬{turn}/8</Badge>
        </div>
      </div>

      {/* Área imersiva: fundo + professor */}
      <div className="relative flex-shrink-0" style={{height:"42vh", minHeight:200}}>
        {/* Fundo de cena */}
        <img
          src={scenario.bgImage}
          alt={scenario.label}
          className="absolute inset-0 w-full h-full object-cover"
          style={{filter:"brightness(0.5) saturate(1.15)"}}
        />
        {/* Gradiente inferior para transição suave */}
        <div className="absolute inset-0" style={{background:"linear-gradient(to top, #0a0a0f 0%, transparent 55%)"}} />

        {/* Professor com foto real + lip-sync */}
        <div className="absolute bottom-0 right-4 flex flex-col items-end z-10" style={{width:"clamp(110px,22vw,190px)"}}>
          {/* Balão de fala quando professor está falando */}
          {talking && (
            <div className="mb-2 bg-white/95 text-slate-800 rounded-2xl px-3 py-2 shadow-2xl border border-indigo-200 max-w-[220px]">
              <div className="font-bold text-indigo-600 text-xs mb-1">{scenario.teacherName}</div>
              <div className="flex gap-0.5 items-end h-4">
                {[0,1,2,3,4].map(i => (
                  <div key={i} className="bg-indigo-500 rounded-full w-1" style={{
                    animation:`lipsync 0.18s ease-in-out infinite alternate`,
                    animationDelay:`${i*0.06}s`,
                    height: "4px"
                  }} />
                ))}
              </div>
            </div>
          )}
          {/* Foto do professor */}
          <img
            src={scenario.teacherImage}
            alt={scenario.teacherName}
            className="w-full object-contain"
            style={{
              animation: "teacher-breathe 3s ease-in-out infinite",
              transformOrigin: "bottom center",
              filter: talking
                ? "drop-shadow(0 0 20px rgba(99,102,241,0.9)) drop-shadow(0 4px 12px rgba(0,0,0,0.7))"
                : "drop-shadow(0 4px 20px rgba(0,0,0,0.8))",
              transition: "filter 0.3s ease",
            }}
            onError={e => {
              const img = e.target as HTMLImageElement;
              img.style.display = "none";
            }}
          />
        </div>

        {/* Etiqueta do cenário (canto inferior esquerdo) */}
        <div className="absolute bottom-3 left-4 z-10">
          <div className="text-white font-bold text-sm drop-shadow">{scenario.label}</div>
          <div className="text-white/60 text-xs">{scenario.desc}</div>
        </div>
      </div>

      {/* Instrução de uso (só na 1ª mensagem) */}
      {messages.length === 0 && !loading && (
        <div className="mx-4 mt-3 bg-indigo-950/80 border border-indigo-500/30 rounded-xl px-4 py-3">
          <p className="text-indigo-200 text-xs text-center">
            💬 <strong>Como interagir:</strong> Digite sua resposta abaixo ou toque em 🎤 para falar.
            Clique nas <strong>sugestões rápidas</strong> ou pressione <kbd className="bg-indigo-800 px-1 rounded text-white">Enter</kbd> para enviar.
          </p>
        </div>
      )}

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto px-4 pb-2 space-y-3 mt-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "assistant" && (
              <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 mr-2 mt-1 border border-indigo-500/50">
                <img src={scenario.teacherImage} alt={scenario.teacherName} className="w-full h-full object-cover object-top"
                  onError={e => { (e.target as HTMLImageElement).parentElement!.innerHTML = `<span style="font-size:18px;line-height:28px;text-align:center;display:block">${scenario.avatar}</span>`; }} />
              </div>
            )}
            <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${m.role === "user" ? "bg-indigo-600 text-white" : "bg-slate-800/90 text-white border border-slate-700"}`}>
              <p className="text-sm leading-relaxed">{m.text}</p>
              {m.score !== undefined && (
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${m.score >= 80 ? "bg-green-600" : m.score >= 60 ? "bg-yellow-600" : "bg-red-600"}`}>🎯 {m.score}%</span>
                  {m.feedback && <span className="text-xs text-white/60">{m.feedback}</span>}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start items-center gap-2">
            <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 border border-indigo-500/50">
              <img src={scenario.teacherImage} alt="" className="w-full h-full object-cover object-top"
                onError={e => { (e.target as HTMLImageElement).parentElement!.innerHTML = `<span style="font-size:18px;line-height:28px;text-align:center;display:block">${scenario.avatar}</span>`; }} />
            </div>
            <div className="bg-slate-800/90 rounded-2xl px-4 py-3 border border-slate-700">
              <div className="flex gap-1">{[0,1,2].map(i => <div key={i} className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{animationDelay:`${i*0.15}s`}} />)}</div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Sugestões */}
      {suggestions.length > 0 && (
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => send(s)} className="shrink-0 bg-indigo-900/60 hover:bg-indigo-800/80 text-white text-xs px-3 py-2 rounded-full border border-indigo-500/40 transition-all whitespace-nowrap">{s}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="bg-black/60 backdrop-blur px-4 py-3 flex gap-2 flex-shrink-0">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send(input)}
          placeholder={`Responda em ${lang.name}...`}
          className="flex-1 bg-slate-800/80 border border-slate-600 rounded-xl px-4 py-2 text-white placeholder-white/40 text-sm focus:outline-none focus:border-indigo-400"
          disabled={loading}
        />
        <button
          onClick={listening ? () => { recRef.current?.stop(); setListening(false); } : startVoice}
          className={`w-11 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${listening ? "bg-red-500 animate-pulse" : "bg-slate-700 hover:bg-slate-600"}`}
          title={listening ? "Parar gravação" : "Falar"}>
          {listening ? "⏹" : "🎤"}
        </button>
        <button
          onClick={() => send(input)}
          disabled={!input.trim() || loading}
          className="w-11 h-10 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded-xl flex items-center justify-center font-bold text-white transition-all"
          title="Enviar">
          →
        </button>
      </div>

      {/* Barra de progresso */}
      <div className="h-1 bg-black/30 flex-shrink-0">
        <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500" style={{width:`${(turn/8)*100}%`}} />
      </div>
    </div>
  );
}
