/**
 * ARTeacher v3 — O Professor de Idiomas mais Avançado do Mundo
 * Conversação em Realidade Aumentada com IA Avançada
 * Inovações: Scan AR objetos, Professor animado, Modo Espelho,
 *            Caça-Objetos gamificado, Diálogo IA com voz, 69 idiomas
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { flushSync } from "react-dom";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { TEACHERS_57, type Teacher57 } from "@/data/teachers57";
import { MULTILANG_COUNTRY_ALIASES, getNativeLang } from "@/lib/detect-native-lang";
import { getLessonStrings } from "@/lib/lesson-i18n";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  ArrowLeft, Camera, CameraOff, Mic, MicOff, Send,
  Volume2, Sparkles, Search
} from "lucide-react";
import { VoiceQualityBanner } from "@/components/VoiceQualityBanner";

interface ARLabel {
  word: string; native: string; phonetic: string; article: string; example: string;
  x: number; y: number; id: string;
}
interface Msg {
  role: "user" | "assistant"; content: string; translation?: string; phonetic?: string;
  feedback?: string; score?: number; correction?: string | null; suggestions?: string[];
}
type AppMode = "select-teacher" | "select-mode" | "ar-scan" | "dialogue" | "mirror" | "hunt";

const MODES = [
  { id: "ar-scan",  label: "🔍 Scan AR",      desc: "IA identifica objetos reais → vocabulário flutuante", color: "from-purple-600 to-blue-600" },
  { id: "dialogue", label: "💬 Diálogo IA",   desc: "Professor fala, você responde por voz ou texto",      color: "from-green-600 to-teal-600" },
  { id: "mirror",   label: "🪞 Modo Espelho", desc: "Pratique pronúncia vendo sua boca em tempo real",     color: "from-orange-600 to-red-600" },
  { id: "hunt",     label: "🏆 Caça-Objetos", desc: "Encontre 5 objetos na sala e aprenda as palavras",    color: "from-yellow-600 to-orange-600" },
];

const SCENARIOS = [
  { id: "greeting", label: "Saudações",  emoji: "👋", role: "friendly language teacher" },
  { id: "food",     label: "Comida",     emoji: "🍽️", role: "restaurant waiter" },
  { id: "travel",   label: "Viagem",     emoji: "✈️", role: "travel guide" },
  { id: "work",     label: "Trabalho",   emoji: "💼", role: "business colleague" },
  { id: "health",   label: "Saúde",      emoji: "🏥", role: "doctor" },
  { id: "shopping", label: "Compras",    emoji: "🛍️", role: "shop assistant" },
  { id: "family",   label: "Família",    emoji: "👨‍👩‍👧", role: "family counselor" },
  { id: "nature",   label: "Natureza",   emoji: "🌿", role: "nature guide" },
  { id: "tech",     label: "Tecnologia", emoji: "💻", role: "tech support" },
  { id: "culture",  label: "Cultura",    emoji: "🎭", role: "cultural guide" },
];

const HUNT_TARGETS = ["cadeira","mesa","janela","porta","livro","copo","telefone","planta","luz","teclado"];

export default function ARTeacher() {
  const [mode, setMode]           = useState<AppMode>("select-teacher");
  const [teacher, setTeacher]     = useState<Teacher57 | null>(null);
  const [selMode, setSelMode]     = useState("");
  const [scenario, setScenario]   = useState(SCENARIOS[0]);
  const [camOn, setCamOn]         = useState(false);
  const [micOn, setMicOn]         = useState(false);
  const [msgs, setMsgs]           = useState<Msg[]>([]);
  const [input, setInput]         = useState("");
  const [labels, setLabels]       = useState<ARLabel[]>([]);
  const [scanning, setScanning]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [xp, setXp]               = useState(0);
  const [streak, setStreak]       = useState(0);
  const [huntTargets, setHuntTargets] = useState<string[]>([]);
  const [huntFound, setHuntFound]     = useState<string[]>([]);
  const [emotion, setEmotion]     = useState<"happy"|"encouraging"|"thinking"|"celebrating">("happy");
  const [selLabel, setSelLabel]   = useState<ARLabel | null>(null);
  const [search, setSearch]       = useState("");
  const [quickMode, setQuickMode]  = useState(""); // modo selecionado antes do professor
  // ── Single source of truth: LanguageContext ──
  const { profile, setProfile } = useLanguage();
  const nativeLangCode = profile.nativeCode;   // e.g. "pt-BR"
  const [targetLangCode, setTargetLangCode] = useState<string>(
    () => profile.targetCode || localStorage.getItem("ml_target_lang") || "en-US"
  );
  const [showLangPicker, setShowLangPicker] = useState(false);
  // UI always in the student's NATIVE language, not the target language
  const ui = getLessonStrings(nativeLangCode);
  // Idiomas únicos disponíveis para o seletor
  const UNIQUE_LANGS = Array.from(
    new Map(TEACHERS_57.map(t => [t.voiceLang, { code: t.voiceLang, name: t.language, flag: t.flag }])).values()
  ).sort((a, b) => a.name.localeCompare(b.name));
  const [autoScan, setAutoScan]   = useState(false);

  const autoRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recogRef  = useRef<any>(null);
  const endRef    = useRef<HTMLDivElement>(null);

  const scanMut    = trpc.vision.scanObjects.useMutation();
  const respondMut = trpc.vrConversation.respond.useMutation();
  const startMut   = trpc.vrConversation.start.useMutation();
  const ttsMut     = trpc.tts.speak.useMutation();

  // ── Câmera ──────────────────────────────────────────────────────────────────
  const startCam = useCallback(async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 } }, audio: false,
      });
      streamRef.current = s;
      if (videoRef.current) { videoRef.current.srcObject = s; await videoRef.current.play(); }
      setCamOn(true);
    } catch { toast.error("Câmera não disponível. Verifique as permissões."); }
  }, []);

  const stopCam = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null; setCamOn(false); setLabels([]);
  }, []);

  const captureFrame = useCallback((): string | null => {
    const v = videoRef.current; const c = canvasRef.current;
    if (!v || !c || !camOn) return null;
    c.width = 640; c.height = 360;
    const ctx = c.getContext("2d"); if (!ctx) return null;
    ctx.drawImage(v, 0, 0, 640, 360);
    return c.toDataURL("image/jpeg", 0.7).split(",")[1];
  }, [camOn]);

  // ── TTS com Edge Neural (fallback: melhor voz do browser) ──────────────────
  const speakText = useCallback(async (text: string, lang: string) => {
    if (!text?.trim()) return;
    // Fallback: usa melhor voz disponível no browser (Google/Microsoft Neural)
    const fallback = () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = lang; u.rate = 0.88; u.pitch = 0.9;
        const voices = window.speechSynthesis.getVoices();
        const lp = lang.split('-')[0];
        const lv = voices.filter(v => v.lang.startsWith(lp));
        const best = lv.find(v =>
          v.name.includes('Google') || v.name.includes('Microsoft') ||
          v.name.includes('Neural') || v.name.includes('Enhanced')
        ) || lv[0];
        if (best) u.voice = best;
        window.speechSynthesis.speak(u);
      }
    };
    // Set emotion to "speaking" for lip-sync animation
    setEmotion("thinking");
    const restoreEmotion = () => setEmotion("happy");
    try {
      const r = await ttsMut.mutateAsync({ text: text.slice(0, 300), voiceLang: lang });
      if (r.success && r.audioBase64) {
        const bytes = Uint8Array.from(atob(r.audioBase64), c => c.charCodeAt(0));
        const url = URL.createObjectURL(new Blob([bytes], { type: "audio/mp3" }));
        const a = new Audio(url);
        a.onplay = () => setEmotion("thinking");
        a.onended = () => { URL.revokeObjectURL(url); restoreEmotion(); };
        a.onerror = restoreEmotion;
        a.play().catch(() => { fallback(); restoreEmotion(); });
      } else { fallback(); restoreEmotion(); }
    } catch { fallback(); restoreEmotion(); }
  }, [ttsMut]);

  // ── Scan AR de Objetos ───────────────────────────────────────────────────────
  const scanObjects = useCallback(async () => {
    if (!teacher || scanning) return;
    const b64 = captureFrame();
    if (!b64) { toast.error("Câmera não ativa"); return; }
    setScanning(true);
    try {
      const r = await scanMut.mutateAsync({
        imageBase64: b64, targetLanguage: teacher.voiceLang, nativeLanguage: nativeLangCode,
      });
      if (r.objects?.length > 0) {
        const newLabels: ARLabel[] = r.objects.map((o: any, i: number) => ({
          ...o, id: `lbl-${Date.now()}-${i}`,
        }));
        setLabels(newLabels);
        setXp(p => p + newLabels.length * 5);
        toast.success(`${newLabels.length} objetos identificados! +${newLabels.length * 5} XP`);
        if (selMode === "hunt") {
          const found = newLabels
            .map((l: ARLabel) => l.native.toLowerCase())
            .filter((n: string) => huntTargets.some(t => n.includes(t) || t.includes(n)));
          if (found.length > 0) {
            setHuntFound(p => Array.from(new Set([...p, ...found])));
            setEmotion("celebrating");
            setTimeout(() => setEmotion("happy"), 2000);
          }
        }
        if (newLabels[0]) speakText(newLabels[0].word, teacher.voiceLang);
      } else {
        toast("Nenhum objeto identificado. Aponte para objetos visíveis.");
      }
    } catch { toast.error("Erro ao analisar. Tente novamente."); }
    finally { setScanning(false); }
  }, [teacher, scanning, captureFrame, scanMut, selMode, huntTargets, speakText]);

  // ── Auto-Scan ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (autoScan && camOn && selMode === "ar-scan") {
      autoRef.current = setInterval(scanObjects, 8000);
    }
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [autoScan, camOn, selMode, scanObjects]);

  // ── Iniciar Diálogo ──────────────────────────────────────────────────────────
  const startDialogue = useCallback(async () => {
    if (!teacher) return;
    setLoading(true);
    try {
      const r = await startMut.mutateAsync({
        scenario: scenario.id, avatarName: teacher.name,
        avatarRole: scenario.role, targetLanguage: teacher.voiceLang,
      });
      const m: Msg = {
        role: "assistant", content: r.text || teacher.greeting,
        translation: r.translation, phonetic: r.phonetic, suggestions: r.suggestions || [],
      };
      setMsgs([m]); speakText(m.content, teacher.voiceLang);
    } catch {
      const m: Msg = {
        role: "assistant", content: teacher.greeting,
        translation: "Olá! Vamos praticar!", suggestions: ["Hello!", "Hi!", "Good morning!"],
      };
      setMsgs([m]); speakText(m.content, teacher.voiceLang);
    } finally { setLoading(false); }
  }, [teacher, scenario, startMut, speakText]);

  // ── Enviar Mensagem ──────────────────────────────────────────────────────────
  const sendMsg = useCallback(async (text: string) => {
    if (!text.trim() || !teacher) return;
    setMsgs(p => [...p, { role: "user", content: text }]);
    setInput(""); setLoading(true);
    try {
      const r = await respondMut.mutateAsync({
        scenario: scenario.id, avatarName: teacher.name, avatarRole: scenario.role,
        targetLanguage: teacher.voiceLang,
        history: msgs.slice(-6).map(m => ({ role: m.role, content: m.content })),
        userMessage: text,
      });
      const score = r.score || 70;
      setEmotion(score >= 90 ? "celebrating" : score >= 70 ? "happy" : "encouraging");
      setTimeout(() => setEmotion("happy"), 3000);
      const m: Msg = {
        role: "assistant", content: r.text || "Please continue!",
        translation: r.translation, phonetic: r.phonetic, feedback: r.feedback,
        score, correction: r.correction, suggestions: r.suggestions || [],
      };
      setMsgs(p => [...p, m]); speakText(m.content, teacher.voiceLang);
      setXp(p => p + Math.floor(score / 10));
      if (score >= 80) setStreak(p => p + 1);
    } catch { toast.error("Erro na IA. Tente novamente."); }
    finally { setLoading(false); }
  }, [teacher, scenario, msgs, respondMut, speakText]);

  // ── Microfone ────────────────────────────────────────────────────────────────
  const toggleMic = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { toast.error("Use Chrome para reconhecimento de voz."); return; }
    if (micOn) { recogRef.current?.stop(); setMicOn(false); return; }
    const r = new SR();
    r.lang = teacher?.voiceLang || "en-US"; r.continuous = false; r.interimResults = false;
    r.onresult = (e: any) => {
      const t = e.results[0][0].transcript;
      if (selMode === "dialogue") sendMsg(t); else setInput(t);
      setMicOn(false);
    };
    r.onerror = () => { setMicOn(false); toast.error("Erro no microfone."); };
    r.onend   = () => setMicOn(false);
    recogRef.current = r; r.start(); setMicOn(true);
  }, [micOn, teacher, selMode, sendMsg]);

  // ── Entrar em Modo ───────────────────────────────────────────────────────────
  const enterMode = useCallback(async (modeId: string, forcedTeacher?: Teacher57) => {
    if (forcedTeacher) setTeacher(forcedTeacher);
    setSelMode(modeId); setMode(modeId as AppMode); setMsgs([]); setLabels([]);
    if (modeId === "hunt") {
      const s = [...HUNT_TARGETS].sort(() => Math.random() - 0.5).slice(0, 5);
      setHuntTargets(s); setHuntFound([]);
    }
    await startCam();
    if (modeId === "dialogue") setTimeout(startDialogue, 800);
  }, [startCam, startDialogue]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);
  useEffect(() => () => { stopCam(); recogRef.current?.stop(); }, [stopCam]);

  // ── Avatar Animado ───────────────────────────────────────────────────────────
  const emotionColors: Record<string, string> = {
    happy: "#22c55e", encouraging: "#f59e0b", thinking: "#6366f1", celebrating: "#ec4899",
  };

  // Fotos reais dos professores — usa diretamente o campo photo do teachers57.ts
  const DEFAULT_TEACHER_PHOTO = "https://ui-avatars.com/api/?name=Teacher&background=6366f1&color=fff&size=200";

  const TeacherAvatar = ({ t, em }: { t: Teacher57; em: string }) => {
    const photo = t.photo || DEFAULT_TEACHER_PHOTO;
    const isTalking = em === "speaking" || em === "thinking";
    return (
      <div className="relative w-16 h-16 flex-shrink-0">
        <div
          className="w-16 h-16 rounded-full overflow-hidden border-2 transition-all duration-500"
          style={{ borderColor: emotionColors[em] || "#22c55e" }}
        >
          <img
            src={photo}
            alt={t.name}
            className={`w-full h-full object-cover object-top transition-transform duration-300 ${
              isTalking ? "scale-105" : "scale-100"
            }`}
            onError={(e) => {
              // fallback to emoji if image fails
              const target = e.currentTarget;
              target.style.display = "none";
              const parent = target.parentElement;
              if (parent) {
                parent.style.display = "flex";
                parent.style.alignItems = "center";
                parent.style.justifyContent = "center";
                parent.style.fontSize = "2rem";
                parent.style.background = `${t.color}33`;
                parent.textContent = t.avatar;
              }
            }}
          />
          {/* Lip-sync overlay: barra de boca animada quando fala */}
          {isTalking && (
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-0.5 items-end">
              {[0.6, 1, 0.8, 1.2, 0.7].map((h, i) => (
                <div
                  key={i}
                  className="w-1 rounded-full bg-white/80"
                  style={{
                    height: `${h * 6}px`,
                    animation: `lip-bar 0.${3 + i}s ease-in-out infinite alternate`,
                    animationDelay: `${i * 0.07}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
        <div
          className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-gray-900 transition-colors duration-500"
          style={{ background: emotionColors[em] || "#22c55e" }}
        />
        {em === "celebrating" && (
          <div className="absolute -top-1 -right-1 text-sm animate-bounce">🎉</div>
        )}
      </div>
    );
  };

  // Remove acentos, parênteses, hífens e normaliza para comparação
  const norm = (s: string) => s.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[()\-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Idioma nativo do usuário (detectado/salvo)
  const userNativeLang = getNativeLang();

  // Mapa completo de termos pt-BR → termos de busca em inglês
  const PT_ALIASES: [string, string[]][] = [
    // Inglês - todas as variantes e países
    ["ingles",          ["english","uk","us","british","american","london","new york","australia","canada","ireland","ingrid"]],
    ["ingles americano",["english (us)","usa","united states","american","new york"]],
    ["ingles britanico",["english (uk)","uk","united kingdom","british","london","england"]],
    ["ingles australiano",["english","australian","sydney","melbourne"]],
    ["ingles canadense", ["english","canadian","toronto"]],
    // Países
    ["inglaterra",      ["english (uk)","uk","united kingdom","british","london","england","ingrid"]],
    ["estados unidos",  ["english (us)","usa","united states","american","new york"]],
    ["eua",             ["english (us)","usa","united states","american"]],
    ["reino unido",     ["english (uk)","uk","united kingdom","british","london","england"]],
    ["gra-bretanha",    ["english (uk)","uk","united kingdom","british","london"]],
    ["australia",       ["english","australian","sydney","melbourne"]],
    ["canada",          ["english","french","canadian","toronto","montreal"]],
    ["irlanda",         ["english (uk)","irish","dublin","gaeilge"]],
    ["franca",          ["french","france","paris"]],
    ["alemanha",        ["german","germany","berlin","deutsch"]],
    ["espanha",         ["spanish","spain","madrid","espanol"]],
    ["italia",          ["italian","italy","rome","roma"]],
    ["japao",           ["japanese","japan","tokyo"]],
    ["china",           ["chinese","mandarin","china","beijing","taiwan"]],
    ["brasil",          ["portuguese","brazil","sao paulo","português"]],
    ["portugal",        ["portuguese","portugal","lisbon","lisboa"]],
    ["russia",          ["russian","russia","moscow","moskva"]],
    ["coreia",          ["korean","korea","seoul"]],
    ["india",           ["hindi","india","delhi"]],
    ["arabia",          ["arabic","arab","saudi","arabe"]],
    ["turquia",         ["turkish","turkey","istanbul"]],
    ["holanda",         ["dutch","netherlands","amsterdam"]],
    ["suecia",          ["swedish","sweden","stockholm"]],
    ["noruega",         ["norwegian","norway","oslo"]],
    ["dinamarca",       ["danish","denmark","copenhagen"]],
    ["finlandia",       ["finnish","finland","helsinki"]],
    ["polonia",         ["polish","poland","warsaw"]],
    ["grecia",          ["greek","greece","athens"]],
    ["mexico",          ["spanish","mexico","ciudad de mexico"]],
    ["argentina",       ["spanish","argentina","buenos aires"]],
    ["tailandia",       ["thai","thailand","bangkok"]],
    ["vietna",          ["vietnamese","vietnam","hanoi"]],
    ["indonesia",       ["indonesian","indonesia","jakarta"]],
    ["ucrania",         ["ukrainian","ukraine","kyiv"]],
    ["hungria",         ["hungarian","hungary","budapest"]],
    ["romenia",         ["romanian","romania","bucharest"]],
    ["israel",          ["hebrew","israel","tel aviv"]],
    ["iran",            ["persian","iran","tehran"]],
    ["paquistao",       ["urdu","pakistan"]],
    ["bangladesh",      ["bengali","bangladesh"]],
    ["nigeria",         ["yoruba","igbo","hausa","nigeria"]],
    ["etiopia",         ["amharic","ethiopia"]],
    ["africa",          ["swahili","zulu","xhosa","yoruba","africa"]],
    ["africa do sul",   ["zulu","xhosa","afrikaans","south africa"]],
    ["gales",           ["welsh","cymraeg","cardiff"]],
    ["escocia",         ["scottish","scotland","edinburgh"]],
    ["catalunha",       ["catala","catalan","barcelona"]],
    ["pais basco",      ["basque","euskara","bilbao"]],
    ["galicia",         ["galego","galician","santiago"]],
    ["malta",           ["maltese","malti","valletta"]],
    ["islandia",        ["icelandic","islenska","reykjavik"]],
    ["letonia",         ["latvian","latviesu","riga"]],
    ["lituania",        ["lithuanian","lietuvi","vilnius"]],
    ["estonia",         ["estonian","eesti","tallinn"]],
    ["eslovaquia",      ["slovak","slovencina","bratislava"]],
    ["eslovenia",       ["slovenian","slovenscina","ljubljana"]],
    ["croacia",         ["croatian","hrvatski","zagreb"]],
    ["bulgaria",        ["bulgarian","bulgarski","sofia"]],
    ["peru",            ["quechua","runasimi","cusco"]],
    ["paraguai",        ["guarani","asuncion"]],
    // Idiomas diretos
    ["portugues",       ["portuguese","brazil","portugal"]],
    ["espanhol",        ["spanish","spain","mexico","argentina"]],
    ["frances",         ["french","france","paris"]],
    ["alemao",          ["german","germany","berlin"]],
    ["italiano",        ["italian","italy","rome"]],
    ["japones",         ["japanese","japan","tokyo"]],
    ["chines",          ["chinese","mandarin","china"]],
    ["mandarim",        ["chinese","mandarin","china"]],
    ["russo",           ["russian","russia","moscow"]],
    ["coreano",         ["korean","korea","seoul"]],
    ["arabe",           ["arabic","arab","saudi"]],
    ["hindi",           ["hindi","india","delhi"]],
    ["turco",           ["turkish","turkey","istanbul"]],
    ["holandes",        ["dutch","netherlands","amsterdam"]],
    ["sueco",           ["swedish","sweden","stockholm"]],
    ["noruegues",       ["norwegian","norway","oslo"]],
    ["dinamarques",     ["danish","denmark","copenhagen"]],
    ["finlandes",       ["finnish","finland","helsinki"]],
    ["polones",         ["polish","poland","warsaw"]],
    ["grego",           ["greek","greece","athens"]],
    ["tailandes",       ["thai","thailand","bangkok"]],
    ["vietnamita",      ["vietnamese","vietnam","hanoi"]],
    ["indonesio",       ["indonesian","indonesia","jakarta"]],
    ["ucraniano",       ["ukrainian","ukraine","kyiv"]],
    ["hungaro",         ["hungarian","hungary","budapest"]],
    ["romeno",          ["romanian","romania","bucharest"]],
    ["hebraico",        ["hebrew","israel","tel aviv"]],
    ["persa",           ["persian","iran","tehran"]],
    ["swahili",         ["swahili","africa","nairobi"]],
    ["yoruba",          ["yoruba","nigeria","lagos"]],
    ["zulu",            ["zulu","south africa","durban"]],
    ["gales",           ["welsh","cymraeg","cardiff"]],
    ["catala",          ["catalan","barcelona"]],
    ["basco",           ["basque","euskara","bilbao"]],
    ["galego",          ["galician","galego","santiago"]],
    ["maltes",          ["maltese","malti","valletta"]],
    ["islandes",        ["icelandic","islenska","reykjavik"]],
    ["letao",           ["latvian","latviesu","riga"]],
    ["lituano",         ["lithuanian","lietuvi","vilnius"]],
    ["estonio",         ["estonian","eesti","tallinn"]],
    ["eslovaco",        ["slovak","slovencina","bratislava"]],
    ["esloveno",        ["slovenian","slovenscina","ljubljana"]],
    ["croata",          ["croatian","hrvatski","zagreb"]],
    ["bulgaro",         ["bulgarian","bulgarski","sofia"]],
    ["quechua",         ["quechua","runasimi","cusco"]],
    ["guarani",         ["guarani","asuncion"]],
    ["malaio",          ["malay","malaysia","kuala lumpur"]],
    ["afrikaans",       ["afrikaans","south africa","kaapstad"]],
    ["igbo",            ["igbo","nigeria","enugu"]],
    ["hausa",           ["hausa","nigeria","kano"]],
    ["amharico",        ["amharic","ethiopia"]],
    ["xhosa",           ["xhosa","south africa","cape town"]],
  ];

  const q = norm(search.trim());

  // Conjunto de langCodes que devem aparecer (match por alias)
  const matchedLangCodes = new Set<string>();
  const extraHayTerms: string[] = [];

  if (q.length >= 2) {
    // 1. PT_ALIASES: termos em português/idioma nativo
    PT_ALIASES.forEach(([pt, vals]) => {
      const npt = norm(pt);
      if (npt === q || npt.startsWith(q) || q.startsWith(npt) || npt.includes(q)) {
        vals.forEach(v => extraHayTerms.push(norm(v)));
      }
    });
    // 2. MULTILANG: termos em qualquer idioma → langCodes
    Object.entries(MULTILANG_COUNTRY_ALIASES).forEach(([term, langCodes]) => {
      const nt = norm(term);
      if (nt === q || nt.startsWith(q) || q.startsWith(nt) || nt.includes(q)) {
        langCodes.forEach(lc => {
          matchedLangCodes.add(lc.toLowerCase());
          matchedLangCodes.add(lc.split("-")[0].toLowerCase());
        });
      }
    });
  }

  // Mapa: código ISO do país → termos alternativos que o usuário pode digitar
  const CC_ALIASES: Record<string, string> = {
    gb: "uk england britain british united kingdom reino unido gra-bretanha ingles britanico",
    us: "usa america american united states estados unidos eua ingles americano",
    br: "brazil brasil brasileiro",
    fr: "france franca frances",
    de: "germany alemanha alemao deutsch",
    jp: "japan japao japones",
    cn: "china chines mandarin",
    tw: "taiwan taiwanese",
    kr: "korea coreia coreano",
    ru: "russia russo",
    es: "spain espanha espanhol",
    mx: "mexico mexicano",
    it: "italy italia italiano",
    pt: "portugal portugues europeu",
    ar: "argentina argentino",
    au: "australia australiano",
    ca: "canada canadense",
    ie: "ireland irlanda irlandes",
    nl: "netherlands holanda holandes",
    se: "sweden suecia sueco",
    no: "norway noruega noruegues",
    dk: "denmark dinamarca dinamarques",
    fi: "finland finlandia finlandes",
    pl: "poland polonia polones",
    gr: "greece grecia grego",
    tr: "turkey turquia turco",
    il: "israel hebraico hebrew",
    sa: "saudi arabia saudita arabe",
    in: "india hindi",
    th: "thailand tailandia tailandes",
    vn: "vietnam vietna vietnamita",
    id: "indonesia indonesio",
    my: "malaysia malaio",
    ua: "ukraine ucrania ucraniano",
    hu: "hungary hungria hungaro",
    ro: "romania romenia romeno",
    ng: "nigeria yoruba igbo hausa",
    za: "south africa africa do sul zulu afrikaans",
    is: "iceland islandia islandes",
    mt: "malta maltes",
  };

  const filtered = TEACHERS_57.filter(t => {
    if (!q || q.length < 2) return true;
    // Hay expandido: inclui código de país curto (uk, us, gb, br, jp...) + aliases
    const countryCode = (t.voiceLang.split("-")[1] ?? "").toLowerCase();
    const ccAliases = CC_ALIASES[countryCode] ?? "";
    const hay = norm(
      `${t.name} ${t.language} ${t.origin} ${t.specialty} ${t.langCode} ${t.voiceLang} ${countryCode} ${ccAliases}`
    );
    // 1. Match direto
    if (hay.includes(q)) return true;
    // 2. Match por langCode do MULTILANG
    if (matchedLangCodes.size > 0) {
      const tlc = t.langCode.toLowerCase();
      const tvl = t.voiceLang.toLowerCase();
      if ([...matchedLangCodes].some(lc => tlc === lc || tvl === lc || tlc.startsWith(lc) || tvl.startsWith(lc))) return true;
    }
    // 3. Match por termos extras do PT_ALIASES
    if (extraHayTerms.some(et => et.length >= 2 && hay.includes(et))) return true;
    // 4. Match parcial: cada palavra da query
    const words = q.split(" ").filter(w => w.length >= 2);
    if (words.length > 0 && words.every(w => hay.includes(w))) return true;
    return false;
  });

  // ════════════════════════════════════════════════════════════════════════════
  // TELA 1: Seleção de Professor
  // ════════════════════════════════════════════════════════════════════════════
  if (mode === "select-teacher") return (
    <div className="min-h-screen bg-gray-950 text-white overflow-y-auto">
      <div className="sticky top-0 z-10 bg-gray-950/95 backdrop-blur border-b border-gray-800 px-4 py-3">
        <div className="flex items-center gap-3 max-w-4xl mx-auto">
          <Link href="/ar-mode">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-bold">
              {ui.arTeacherTitle} <Badge className="bg-purple-600 text-white text-xs ml-1">BETA</Badge>
            </h1>
            <p className="text-xs text-gray-400">{ui.nativeTeachersCount}</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={() => {
                // Sorteia APENAS dentro do idioma que o aluno está estudando
                const langPrefix = targetLangCode.split("-")[0]; // ex: "en", "es", "fr"
                const sameLanguage = TEACHERS_57.filter(t =>
                  t.voiceLang.startsWith(langPrefix) || t.langCode.startsWith(langPrefix)
                );
                const pool = sameLanguage.length > 0 ? sameLanguage : TEACHERS_57;
                const rndTeacher = pool[Math.floor(Math.random() * pool.length)];
                const rndMode = MODES[Math.floor(Math.random() * MODES.length)];
                const rndScenario = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
                setTeacher(rndTeacher);
                setScenario(rndScenario);
                window.scrollTo({ top: 0, behavior: 'smooth' });
                toast.success(`🎲 Sorteado: ${rndTeacher.name} ${rndTeacher.flag} (${rndTeacher.language}) • ${rndMode.label.slice(3)} • ${rndScenario.label}`);
                setTimeout(() => enterMode(rndMode.id, rndTeacher), 800);
              }}
              className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-full transition-all"
            >
              🎲 {ui.random}
            </button>
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">⭐ {xp} XP</Badge>
            {streak > 0 && <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">🔥 {streak}</Badge>}
          </div>
        </div>
      </div>
      {/* Modal picker de idioma */}
      {showLangPicker && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setShowLangPicker(false)}>
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-sm max-h-[75vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-white font-bold text-base">🌍 Trocar idioma a estudar</h2>
                <button onClick={() => setShowLangPicker(false)} className="text-gray-500 hover:text-white text-xl">✕</button>
              </div>
              {/* Mostra o idioma nativo atual — não muda */}
              <div className="flex items-center gap-2 p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.05)" }}>
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0"
                  style={{ background: "#ffffff", color: "#1d4ed8", border: "1.5px solid #93c5fd" }}
                >
                  <span>{TEACHERS_57.find(t => t.voiceLang === nativeLangCode || t.voiceLang.startsWith(nativeLangCode.split('-')[0]))?.flag || "🌐"}</span>
                  <span>Meu idioma</span>
                </div>
                <span className="text-gray-400 text-xs">→ Selecione o idioma que quer aprender:</span>
              </div>
            </div>
            <div className="overflow-y-auto flex-1 p-2">
              {UNIQUE_LANGS.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setTargetLangCode(lang.code);
                    localStorage.setItem("ml_target_lang", lang.code);
                    // Sync with LanguageContext (single source of truth)
                    setProfile({ ...profile, targetCode: lang.code, targetName: lang.name, targetFlag: lang.flag });
                    setShowLangPicker(false);
                    toast.success(`✅ Estudando: ${lang.name}`);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all text-left ${
                    lang.code === targetLangCode
                      ? "bg-blue-600/30 border border-blue-500/50 text-white"
                      : "hover:bg-gray-800 text-gray-300"
                  }`}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <span className="text-sm font-medium flex-1">{lang.name}</span>
                  {lang.code === targetLangCode && <span className="text-blue-400 text-xs font-bold">✓ Atual</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Campo de busca — label explícito */}
        <div className="mb-4">
          <label className="block text-xs text-gray-400 font-medium mb-1.5 uppercase tracking-wider">
            🔍 Buscar professor por nome, país ou idioma
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text" placeholder="Ex: Sarah, Brasil, English, Français..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-sm"
              >✕</button>
            )}
          </div>
        </div>
        {/* Banner Cenas Imersivas */}
        <Link href="/immersive-scene">
          <div className="mb-5 rounded-2xl overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-[2px] cursor-pointer hover:scale-[1.01] transition-transform">
            <div className="bg-gray-950 rounded-2xl px-4 py-4 flex items-center gap-4">
              <div className="text-4xl">🌍</div>
              <div className="flex-1">
                <div className="font-bold text-white text-base">{ui.immersiveScenesTitle}</div>
                <div className="text-xs text-gray-400 mt-0.5">Paris · Praia · Floresta · Tokyo · Nova York · Cozinha</div>
                <div className="text-xs text-indigo-400 mt-1">Professor animado + hotspots clicáveis + voz nativa</div>
              </div>
              <div className="text-indigo-400 font-bold text-sm whitespace-nowrap">{ui.enter}</div>
            </div>
          </div>
        </Link>
        <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">{ui.selectMode}</p>
        <div className="grid grid-cols-2 gap-2 mb-6">
          {[
            { id: "ar-scan",  i: "🔍", l: "Scan AR",      d: "IA identifica objetos reais" },
            { id: "dialogue", i: "💬", l: "Diálogo IA",   d: "Conversa com professor nativo" },
            { id: "mirror",   i: "🪞", l: "Modo Espelho", d: "Pratica pronúncia ao vivo" },
            { id: "hunt",     i: "🏆", l: "Caça-Objetos", d: "Aprende explorando a sala" },
          ].map(f => (
            <button
              key={f.l}
              onClick={() => setQuickMode(quickMode === f.id ? "" : f.id)}
              className={`text-left rounded-xl p-3 border transition-all ${
                quickMode === f.id
                  ? "bg-purple-600/20 border-purple-500 text-white"
                  : "bg-gray-900 border-gray-800 hover:border-purple-500/50 hover:bg-gray-800"
              }`}
            >
              <div className="text-xl mb-1">{f.i}</div>
              <div className="font-medium text-sm">{f.l}</div>
              <div className="text-xs text-gray-500">{f.d}</div>
              {quickMode === f.id && <div className="text-xs text-purple-400 mt-1 font-bold">✓ Selecionado</div>}
            </button>
          ))}
        </div>
        {quickMode && <p className="text-xs text-purple-400 mb-3">👆 Agora escolha um professor abaixo para iniciar no modo <strong>{MODES.find(m=>m.id===quickMode)?.label.slice(3)}</strong></p>}
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-gray-500 uppercase tracking-wider">{filtered.length} professores disponíveis</p>
          <span className="text-xs text-gray-600 italic">Cada professor ensina apenas seu idioma nativo</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {filtered.map(t => (
            <button
              key={t.id}
              onClick={(e) => {
                e.stopPropagation();
                if (quickMode) {
                  flushSync(() => setTeacher(t));
                  enterMode(quickMode, t);
                } else {
                  flushSync(() => {
                    setTeacher(t);
                    setMode("select-mode");
                  });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="flex flex-col items-center gap-2 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-purple-500/60 rounded-2xl p-3 text-center transition-all group relative"
            >
              {/* Foto em miniatura */}
              <div
                className="w-16 h-16 rounded-2xl overflow-hidden border-2 flex-shrink-0 flex items-center justify-center relative"
                style={{ borderColor: t.color, background: `${t.color}22` }}
              >
                <img
                  src={t.photo || DEFAULT_TEACHER_PHOTO}
                  alt={t.name}
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    const p = e.currentTarget.parentElement;
                    if (p) { p.style.fontSize = "2rem"; p.textContent = t.avatar; }
                  }}
                />
                {/* Bandeira sobreposta no canto inferior direito */}
                <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-gray-950 border border-gray-700 flex items-center justify-center text-sm leading-none">
                  {t.flag}
                </div>
              </div>
              {/* Nome */}
              <div className="text-xs font-semibold text-white truncate w-full">{t.name}</div>
              {/* Idioma */}
              <div
                className="text-[10px] font-bold px-2 py-0.5 rounded-full w-full truncate"
                style={{ background: `${t.color}22`, color: t.color }}
              >
                {t.language.split(" ")[0]}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // ════════════════════════════════════════════════════════════════════════════
  // TELA 2: Seleção de Modo
  // ════════════════════════════════════════════════════════════════════════════
  if (mode === "select-mode" && teacher) return (
    <div className="min-h-screen bg-gray-950 text-white overflow-y-auto">
      <div className="sticky top-0 z-10 bg-gray-950/95 backdrop-blur border-b border-gray-800 px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setMode("select-teacher")} className="text-gray-400">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <TeacherAvatar t={teacher} em="happy" />
          <div>
            <div className="font-bold">{teacher.name}</div>
            <div className="text-sm text-gray-400">{teacher.language} {teacher.flag}</div>
          </div>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <p className="text-gray-400 text-sm mb-6 italic">"{teacher.greeting}"</p>
        <VoiceQualityBanner lang={teacher.voiceLang} className="mb-4" />
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">Cenário (para Diálogo)</h3>
          <div className="grid grid-cols-5 gap-2">
            {SCENARIOS.map(s => (
              <button
                key={s.id} onClick={() => setScenario(s)}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-xs transition-all ${
                  scenario.id === s.id
                    ? "border-purple-500 bg-purple-500/20 text-white"
                    : "border-gray-800 bg-gray-900 text-gray-400 hover:border-gray-600"
                }`}
              >
                <span className="text-lg">{s.emoji}</span>
                <span className="truncate w-full text-center">{s.label}</span>
              </button>
            ))}
          </div>
        </div>
        <h3 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">Escolha o Modo</h3>
        <div className="grid gap-3">
          {MODES.map(m => (
            <button
              key={m.id} onClick={() => enterMode(m.id)}
              className={`flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r ${m.color} hover:opacity-90 transition-all text-left`}
            >
              <div className="text-3xl">{m.label.split(" ")[0]}</div>
              <div>
                <div className="font-bold text-white">{m.label.slice(3)}</div>
                <div className="text-sm text-white/70">{m.desc}</div>
              </div>
              <div className="ml-auto text-white/70">›</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  if (!teacher) return null;
  const isAR = selMode === "ar-scan" || selMode === "mirror" || selMode === "hunt";
  const huntPct = huntTargets.length > 0 ? (huntFound.length / huntTargets.length) * 100 : 0;

  // ════════════════════════════════════════════════════════════════════════════
  // TELA 3: Modo Ativo
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gray-950/95 backdrop-blur border-b border-gray-800 px-4 py-2">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost" size="icon"
            onClick={() => { stopCam(); setMode("select-mode"); }}
            className="text-gray-400"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <TeacherAvatar t={teacher} em={emotion} />
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm">{teacher.name}</div>
            <div className="text-xs text-gray-400">
              {MODES.find(m => m.id === selMode)?.label} · {teacher.language}
            </div>
          </div>
          <div className="flex gap-2">
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">⭐{xp}</Badge>
            {streak > 0 && <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs">🔥{streak}</Badge>}
          </div>
        </div>
      </div>

      {/* Câmera + Labels AR */}
      {isAR && (
        <div className="relative bg-black" style={{ aspectRatio: "16/9", maxHeight: "45vh" }}>
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          <canvas ref={canvasRef} className="hidden" />

          {/* Labels flutuantes AR */}
          {labels.map(lbl => (
            <button
              key={lbl.id}
              onClick={() => { setSelLabel(lbl); speakText(lbl.word, teacher.voiceLang); }}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
              style={{ left: `${lbl.x}%`, top: `${lbl.y}%` }}
            >
              <div className="bg-purple-600/90 backdrop-blur text-white text-xs font-bold px-2 py-1 rounded-lg shadow-lg border border-purple-400/50 whitespace-nowrap hover:bg-purple-500 transition-colors">
                <div>{lbl.article ? `${lbl.article} ` : ""}{lbl.word}</div>
                <div className="text-purple-200 text-[10px]">{lbl.native}</div>
              </div>
              <div className="w-px h-3 bg-purple-400 mx-auto" />
              <div className="w-2 h-2 bg-purple-400 rounded-full mx-auto" />
            </button>
          ))}

          {/* Modo Espelho: guia de boca */}
          {selMode === "mirror" && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-16 border-2 border-yellow-400/60 rounded-full" />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 rounded-xl px-4 py-2 text-center">
                <div className="text-white text-sm font-bold">🪞 Modo Espelho Ativo</div>
                <div className="text-gray-300 text-xs">Observe sua boca e repita as palavras</div>
              </div>
            </div>
          )}

          {scanning && (
            <div className="absolute inset-0 bg-purple-900/30 flex items-center justify-center">
              <div className="bg-gray-900/90 rounded-xl px-6 py-4 text-center">
                <div className="text-2xl mb-2 animate-pulse">🔍</div>
                <div className="text-white text-sm font-bold">Analisando com IA...</div>
              </div>
            </div>
          )}

          {!camOn && (
            <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
              <div className="text-center">
                <Camera className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm mb-3">Câmera inativa</p>
                <Button onClick={startCam} className="bg-purple-600 hover:bg-purple-700">Ativar Câmera</Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Detalhe do label selecionado */}
      {selLabel && (
        <div className="bg-gray-900 border-b border-gray-800 px-4 py-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold">{selLabel.article} {selLabel.word}</span>
                <button onClick={() => speakText(selLabel.word, teacher.voiceLang)}>
                  <Volume2 className="w-4 h-4 text-purple-400" />
                </button>
              </div>
              <div className="text-sm text-gray-400">{selLabel.native}</div>
              <div className="text-xs text-purple-300 font-mono">{selLabel.phonetic}</div>
              <div className="text-xs text-gray-500 italic mt-1">"{selLabel.example}"</div>
            </div>
            <button onClick={() => setSelLabel(null)} className="text-gray-600 hover:text-white ml-4">✕</button>
          </div>
        </div>
      )}

      {/* Caça-Objetos progress */}
      {selMode === "hunt" && huntTargets.length > 0 && (
        <div className="bg-gray-900 border-b border-gray-800 px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-yellow-400">🏆 Caça-Objetos</span>
            <span className="text-xs text-gray-400">{huntFound.length}/{huntTargets.length}</span>
          </div>
          <Progress value={huntPct} className="h-2 mb-2" />
          <div className="flex flex-wrap gap-2">
            {huntTargets.map(t => (
              <Badge
                key={t}
                className={huntFound.includes(t)
                  ? "bg-green-500/20 text-green-400 border-green-500/30 line-through"
                  : "bg-gray-800 text-gray-400 border-gray-700"}
              >
                {huntFound.includes(t) ? "✓" : "?"} {t}
              </Badge>
            ))}
          </div>
          {huntFound.length === huntTargets.length && (
            <div className="mt-2 text-center text-green-400 font-bold text-sm">
              🎉 Parabéns! Todos encontrados! +100 XP
            </div>
          )}
        </div>
      )}

      {/* Área de Diálogo */}
      {selMode === "dialogue" && (
        <>
          <div className="relative bg-black h-28">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover opacity-30" />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute inset-0 flex items-center justify-center">
              <TeacherAvatar t={teacher} em={emotion} />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ maxHeight: "38vh" }}>
            {msgs.length === 0 && loading && (
              <div className="flex items-center gap-3">
                <TeacherAvatar t={teacher} em="thinking" />
                <div className="bg-gray-800 rounded-xl px-4 py-3 flex gap-1">
                  {[0, 150, 300].map(d => (
                    <div key={d} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              </div>
            )}
            {msgs.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                {m.role === "assistant" && <TeacherAvatar t={teacher} em={emotion} />}
                <div className={`max-w-[75%] flex flex-col gap-1 ${m.role === "user" ? "items-end" : "items-start"}`}>
                  <div className={`rounded-2xl px-4 py-2 ${m.role === "user" ? "bg-purple-600 text-white" : "bg-gray-800 text-white"}`}>
                    <div className="font-medium">{m.content}</div>
                    {m.translation && <div className="text-xs text-gray-400 mt-1">{m.translation}</div>}
                    {m.phonetic && <div className="text-xs text-purple-300 font-mono">{m.phonetic}</div>}
                  </div>
                  {m.role === "assistant" && (
                    <button onClick={() => speakText(m.content, teacher.voiceLang)}>
                      <Volume2 className="w-3 h-3 text-gray-500 hover:text-purple-400" />
                    </button>
                  )}
                  {m.feedback && (
                    <div className="text-xs text-green-400 bg-green-400/10 rounded-lg px-2 py-1">
                      💡 {m.feedback}
                      {m.score !== undefined && <span className="ml-2 font-bold">{m.score}%</span>}
                    </div>
                  )}
                  {m.correction && (
                    <div className="text-xs text-yellow-400 bg-yellow-400/10 rounded-lg px-2 py-1">
                      ✏️ {m.correction}
                    </div>
                  )}
                  {m.suggestions && m.suggestions.length > 0 && m.role === "assistant" && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {m.suggestions.map((s, j) => (
                        <button
                          key={j} onClick={() => sendMsg(s)}
                          className="text-xs bg-gray-700 hover:bg-purple-600 text-gray-300 hover:text-white px-2 py-1 rounded-full transition-colors"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && msgs.length > 0 && (
              <div className="flex gap-3">
                <TeacherAvatar t={teacher} em="thinking" />
                <div className="bg-gray-800 rounded-xl px-4 py-3 flex gap-1">
                  {[0, 150, 300].map(d => (
                    <div key={d} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
        </>
      )}

      {/* Controles */}
      <div className="sticky bottom-0 bg-gray-950/95 backdrop-blur border-t border-gray-800 px-4 py-3">
        {isAR ? (
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <Button
                onClick={scanObjects} disabled={scanning || !camOn}
                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
              >
                {scanning
                  ? <><Sparkles className="w-4 h-4 mr-2 animate-spin" />Analisando...</>
                  : <><Search className="w-4 h-4 mr-2" />Scan AR</>}
              </Button>
              <Button onClick={toggleMic} variant={micOn ? "destructive" : "outline"} size="icon" className="border-gray-700">
                {micOn ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
              <Button onClick={camOn ? stopCam : startCam} variant="outline" size="icon" className="border-gray-700">
                {camOn ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
              </Button>
            </div>
            {selMode === "ar-scan" && (
              <div className="flex items-center justify-between bg-gray-900 rounded-lg px-3 py-2">
                <span className="text-xs text-gray-400">Auto-scan a cada 8s</span>
                <button
                  onClick={() => setAutoScan(p => !p)}
                  className={`w-10 h-5 rounded-full transition-colors ${autoScan ? "bg-purple-600" : "bg-gray-700"}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-0.5 ${autoScan ? "translate-x-5" : "translate-x-0"}`} />
                </button>
              </div>
            )}
            {labels.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {labels.map(lbl => (
                  <button
                    key={lbl.id}
                    onClick={() => { setSelLabel(lbl); speakText(lbl.word, teacher.voiceLang); }}
                    className="flex-shrink-0 bg-gray-800 hover:bg-purple-600/30 border border-gray-700 hover:border-purple-500 rounded-lg px-3 py-1.5 text-left transition-colors"
                  >
                    <div className="text-xs font-bold text-white">{lbl.word}</div>
                    <div className="text-[10px] text-gray-400">{lbl.native}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text" value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMsg(input)}
              placeholder={`Responda em ${teacher.language}...`}
              className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
            <Button onClick={toggleMic} variant={micOn ? "destructive" : "outline"} size="icon" className="border-gray-700 flex-shrink-0">
              {micOn ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            <Button
              onClick={() => sendMsg(input)} disabled={!input.trim() || loading}
              className="bg-purple-600 hover:bg-purple-700 flex-shrink-0" size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
