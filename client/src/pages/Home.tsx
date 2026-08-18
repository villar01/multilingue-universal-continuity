import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getLoginUrl } from "@/const";
import { trackAggregateLearningEvent } from "@/lib/aggregateAnalytics";
import {
  Globe,
  Mic,
  Brain,
  Zap,
  Trophy,
  Sparkles,
  Volume2,
  MessageSquare,
  TrendingUp,
  CheckCircle2,
  Star,
  ChevronDown,
  BookOpen,
  Users,
  Shield,
  Headphones,
  Video,
  Award,
  ArrowRight,
  Cpu,
  CreditCard,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import UserGuide from "@/components/UserGuide";
import { trpc } from "@/lib/trpc";
import { useEffect, useState, useRef, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import AnimatedTeacher from "@/components/AnimatedTeacher";
import { AVAILABLE_LANGUAGES } from "@/lib/languages";
// Floating flag items for hero animation — bandeira SVG + sigla
const FLOAT_FLAGS = [
  { cc: "us", sigla: "US" }, { cc: "br", sigla: "BR" }, { cc: "fr", sigla: "FR" },
  { cc: "de", sigla: "DE" }, { cc: "jp", sigla: "JP" }, { cc: "cn", sigla: "CN" },
  { cc: "es", sigla: "ES" }, { cc: "it", sigla: "IT" }, { cc: "ru", sigla: "RU" },
  { cc: "kr", sigla: "KR" }, { cc: "sa", sigla: "SA" }, { cc: "in", sigla: "IN" },
  { cc: "pt", sigla: "PT" }, { cc: "nl", sigla: "NL" }, { cc: "pl", sigla: "PL" },
  { cc: "se", sigla: "SE" }, { cc: "tr", sigla: "TR" }, { cc: "gr", sigla: "GR" },
  { cc: "ua", sigla: "UA" }, { cc: "vn", sigla: "VN" }, { cc: "id", sigla: "ID" },
  { cc: "th", sigla: "TH" }, { cc: "il", sigla: "IL" }, { cc: "ph", sigla: "PH" },
  { cc: "za", sigla: "ZA" }, { cc: "no", sigla: "NO" }, { cc: "dk", sigla: "DK" },
  { cc: "fi", sigla: "FI" }, { cc: "cz", sigla: "CZ" }, { cc: "hu", sigla: "HU" },
];

const FLOAT_FLAG_EMOJIS: Record<string, string> = {
  us: "🇺🇸", br: "🇧🇷", fr: "🇫🇷", de: "🇩🇪", jp: "🇯🇵", cn: "🇨🇳", es: "🇪🇸", it: "🇮🇹", ru: "🇷🇺", kr: "🇰🇷",
  sa: "🇸🇦", in: "🇮🇳", pt: "🇵🇹", nl: "🇳🇱", pl: "🇵🇱", se: "🇸🇪", tr: "🇹🇷", gr: "🇬🇷", ua: "🇺🇦", vn: "🇻🇳",
  id: "🇮🇩", th: "🇹🇭", il: "🇮🇱", ph: "🇵🇭", za: "🇿🇦", no: "🇳🇴", dk: "🇩🇰", fi: "🇫🇮", cz: "🇨🇿", hu: "🇭🇺",
};

// Todas as escolhas iniciais vêm do catálogo ativo; idiomas em preparação ficam fora deste seletor.
const POPULAR_LANGS = AVAILABLE_LANGUAGES.map(({ code, flag, label }) => ({ code, flag, name: label }));

// Nav dropdown menus
const NAV_IDIOMAS = [
  { label: "Português", flag: "🇧🇷", href: "/dashboard" },
  { label: "Inglês", flag: "🇺🇸", href: "/dashboard" },
  { label: "Espanhol", flag: "🇪🇸", href: "/dashboard" },
  { label: "Francês", flag: "🇫🇷", href: "/dashboard" },
  { label: "Alemão", flag: "🇩🇪", href: "/dashboard" },
  { label: "Italiano", flag: "🇮🇹", href: "/dashboard" },
  { label: "Japonês", flag: "🇯🇵", href: "/dashboard" },
  { label: "Coreano", flag: "🇰🇷", href: "/dashboard" },
  { label: "Ver todos os 143 idiomas →", flag: "🌍", href: "/onboarding" },
];
const NAV_PLATAFORMA = [
  { label: "Aprendizado Natural 🌟", icon: "🧠", href: "/natural-learning" },
  { label: "Cenas Imersivas AR", icon: "🌍", href: "/immersive-scene" },
  { label: "Professores com IA", icon: "👨‍🏫", href: "/ar-teacher" },
  { label: "Treino de Vocabulário", icon: "📚", href: "/dashboard" },
  { label: "Memória Diária", icon: "📚", href: "/daily-memory" },
  { label: "Conversa Livre", icon: "💬", href: "/free-talk" },
  { label: "Batalha de Palavras", icon: "⚔️", href: "/battle-mode" },
];

function FloatingFlag({ cc, sigla, style }: { cc: string; sigla: string; style: React.CSSProperties }) {
  return (
    <div
      className="absolute select-none pointer-events-none opacity-60 flex flex-col items-center gap-1"
      style={style}
    >
      <span role="img" aria-label={sigla} className="text-2xl leading-none drop-shadow-md">{FLOAT_FLAG_EMOJIS[cc] ?? "🌐"}</span>
      <span className="text-[10px] font-bold text-white tracking-widest drop-shadow">{sigla}</span>
    </div>
  );
}

function LangDropdown({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (code: string) => void;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = POPULAR_LANGS.find((l) => l.code === value) || POPULAR_LANGS[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-xl px-4 py-3 text-white font-semibold transition-all min-w-[160px]"
      >
        <span className="text-xl">{selected.flag}</span>
        <span className="flex-1 text-left">{selected.name}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[200] min-w-[200px] overflow-hidden max-h-64 overflow-y-auto">
          <div className="p-2 text-xs text-gray-400 font-semibold px-3 pt-3">{label}</div>
          {POPULAR_LANGS.map((lang) => (
            <button
              key={lang.code}
              onClick={() => { onChange(lang.code); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-purple-50 transition-colors text-left ${value === lang.code ? "bg-purple-50 text-purple-700 font-semibold" : "text-gray-700"}`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span className="text-sm">{lang.name}</span>
              {value === lang.code && <CheckCircle2 className="h-4 w-4 ml-auto text-purple-600" />}
            </button>
          ))}
          <div className="border-t border-gray-100 p-2">
            <Link href="/onboarding">
              <button className="w-full text-center text-xs text-purple-600 font-semibold py-1 hover:underline">
                + Mais idiomas chegando em breve
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function NavDropdown({ label, items }: { label: string; items: { label: string; flag?: string; icon?: string; href: string }[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 text-gray-700 hover:text-purple-700 font-medium transition-colors py-2"
      >
        {label}
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 min-w-[220px] overflow-hidden py-2">
          {items.map((item) => (
            <Link key={item.label} href={item.href}>
              <button
                onClick={() => setOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-purple-50 transition-colors text-left text-gray-700 hover:text-purple-700"
              >
                <span className="text-lg">{item.flag || item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  useEffect(() => {
    trackAggregateLearningEvent("open_public_home");
  }, []);

    const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { profile, setProfile } = useLanguage();
  const showLocalSetup = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("setup") === "local-ai";
  // Language selector state — initialized from LanguageContext (single source of truth)
  const [nativeLang, setNativeLangState] = useState(() => {
    return profile.nativeCode || localStorage.getItem("ml_native_lang") || "pt-BR";
  });
  const [targetLang, setTargetLangState] = useState(() => {
    return profile.targetCode || localStorage.getItem("ml_target_lang") || "en-US";
  });

  // Persist immediately when user changes language — syncs LanguageContext + localStorage
  const setNativeLang = useCallback((code: string) => {
    setNativeLangState(code);
    localStorage.setItem("ml_native_lang", code);
    const info = POPULAR_LANGS.find(l => l.code === code);
    setProfile({ ...profile, nativeCode: code, nativeName: info?.name || code });
  }, [profile, setProfile]);

  const setTargetLang = useCallback((code: string) => {
    setTargetLangState(code);
    localStorage.setItem("ml_target_lang", code);
    const info = POPULAR_LANGS.find(l => l.code === code);
    setProfile({ ...profile, targetCode: code, targetName: info?.name || code, targetFlag: info?.flag || "🌐" });
  }, [profile, setProfile]);

  // Check if authenticated user has accepted terms
  const { data: complianceData, isLoading: complianceLoading } = trpc.compliance.checkAcceptance.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  useEffect(() => {
    if (isAuthenticated && !complianceLoading && complianceData && !complianceData.accepted) {
      setLocation("/terms");
    }
  }, [isAuthenticated, complianceData, complianceLoading, setLocation]);

  // Redirect authenticated users without nativeLanguage to onboarding
  useEffect(() => {
    if (isAuthenticated && user) {
      const hasNativeLang = profile.nativeCode || localStorage.getItem("ml_native_lang");
      if (!hasNativeLang) {
        setLocation("/onboarding");
      }
    }
  }, [isAuthenticated, user, profile.nativeCode, setLocation]);

  const handleStart = () => {
    // Always save language before navigating
    localStorage.setItem("ml_native_lang", nativeLang);
    localStorage.setItem("ml_target_lang", targetLang);
    const nativeInfo = POPULAR_LANGS.find(l => l.code === nativeLang);
    const targetInfo = POPULAR_LANGS.find(l => l.code === targetLang);
    const updatedProfile = {
      nativeCode: nativeLang, nativeName: nativeInfo?.name || nativeLang,
      targetCode: targetLang, targetName: targetInfo?.name || targetLang, targetFlag: targetInfo?.flag || "🌐"
    };
    setProfile(updatedProfile);
    localStorage.setItem("ml_lang_profile", JSON.stringify(updatedProfile));
    if (!isAuthenticated) {
      trackAggregateLearningEvent("begin_signup");
      window.location.href = getLoginUrl();
      return;
    }
    setLocation("/dashboard");
  };

  // Generate floating flags with fixed positions (stable, no re-render jitter)
  const floatingFlags = FLOAT_FLAGS.map(({ cc, sigla }, i) => {
    const col = i % 6;
    const row = Math.floor(i / 6);
    const left = 5 + col * 16 + (row % 2) * 8;
    const top = 8 + row * 22;
    const delay = (i * 0.4) % 3;
    const duration = 3 + (i % 3);
    return { cc, sigla, left, top, delay, duration };
  });

  return (
    <div className="min-h-screen bg-white">

      {/* ── TOP NAVIGATION ── */}
      <header className="border-b border-gray-100 bg-white/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                  <Globe className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-purple-700 to-blue-600 bg-clip-text text-transparent hidden sm:block">
                  MultiLingue Universal
                </span>
              </div>
            </Link>

            {/* Center nav */}
            <nav className="hidden md:flex items-center gap-6">
              <NavDropdown label="Idiomas" items={NAV_IDIOMAS} />
              <NavDropdown label="Plataforma" items={NAV_PLATAFORMA} />
              <Link href="/pricing">
                <button className="text-gray-700 hover:text-purple-700 font-medium transition-colors py-2">
                  Preços
                </button>
              </Link>
              <Link href="/terms">
                <button className="text-gray-700 hover:text-purple-700 font-medium transition-colors py-2">
                  Termos & Privacidade
                </button>
              </Link>
              <UserGuide nativeLang={nativeLang} compact />
            </nav>

            {/* Auth buttons */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <span className="text-sm text-gray-600 hidden sm:block">Olá, {user?.name?.split(" ")[0]}</span>
                  <Link href="/dashboard">
                    <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                      Meu Dashboard
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <a href={getLoginUrl()} className="text-sm text-gray-600 hover:text-purple-700 font-medium hidden sm:block">
                    Entrar
                  </a>
                  <a href={getLoginUrl()}>
                    <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                      Começar Grátis
                    </Button>
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── LGPD/COPPA NOTICE BANNER (for non-authenticated visitors) ── */}
      {!isAuthenticated && (
        <div className="bg-amber-50 border-b border-amber-200 py-2 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
            <p className="text-xs text-amber-800">
              <Shield className="h-3 w-3 inline mr-1" />
              <strong>LGPD · COPPA · GDPR:</strong> Ao se cadastrar, você aceita nossos termos de uso e política de privacidade. Menores de 18 anos precisam de autorização parental.
            </p>
            <Link href="/terms">
              <button className="text-xs text-amber-700 underline font-semibold whitespace-nowrap">
                Ver Termos Completos →
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* ── CONFIGURAÇÃO LOCAL VOLUNTÁRIA ── */}
      {showLocalSetup && (
        <section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Cpu className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm font-medium"><strong>IA Local:</strong> Configuração opcional de provedores locais em ambientes compatíveis, para tarefas de texto.</p>
            </div>
            <Link href="/ia-nativa"><button className="text-sm font-semibold bg-white/20 hover:bg-white/30 px-4 py-1.5 rounded-full transition-all whitespace-nowrap">Abrir configuração →</button></Link>
          </div>
        </section>
      )}

      {/* ── HERO SECTION ── */}
      <section className="relative bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white">
        {/* Floating flags background */}
        <div className="absolute inset-0 overflow-hidden">
          {floatingFlags.map(({ cc, sigla, left, top, delay, duration }, i) => (
            <FloatingFlag
              key={i}
              cc={cc}
              sigla={sigla}
              style={{
                left: `${left}%`,
                top: `${top}%`,
                animation: `heroFloat ${duration}s ease-in-out ${delay}s infinite`,
              }}
            />
          ))}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/60 via-indigo-900/40 to-blue-900/80" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center mb-12">
            <Badge className="mb-6 bg-white/10 text-white border-white/20 hover:bg-white/20 text-sm px-4 py-1.5">
              🌍 143 idiomas · IA avançada · Professores virtuais · Prática guiada em cada etapa
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
              Aprenda Qualquer Idioma
              <br />
              <span className="bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
                Com Inteligência Artificial
              </span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10">
              Professores virtuais com voz natural, cenas imersivas em realidade aumentada e 
              personalização extrema. A plataforma mais avançada para aprender idiomas.
            </p>
          </div>

          {/* Language Selector Card */}
          <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 md:p-8 shadow-2xl">
            <p className="text-white/70 text-sm font-medium text-center mb-5 uppercase tracking-wider">
              Selecione seus idiomas para começar
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
              <div className="flex-1 w-full">
                <p className="text-white/60 text-xs mb-2 font-semibold uppercase tracking-wide">Eu falo</p>
                <LangDropdown value={nativeLang} onChange={setNativeLang} label="Meu idioma nativo" />
              </div>
              <div className="flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/60 font-bold text-lg">
                  →
                </div>
              </div>
              <div className="flex-1 w-full">
                <p className="text-white/60 text-xs mb-2 font-semibold uppercase tracking-wide">Eu quero aprender</p>
                <LangDropdown value={targetLang} onChange={setTargetLang} label="Idioma que quero aprender" />
              </div>
            </div>
            <button
              onClick={handleStart}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold text-lg py-4 rounded-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center justify-center gap-2"
            >
              <Sparkles className="h-5 w-5" />
              Começar Agora — É Grátis!
              <ArrowRight className="h-5 w-5" />
            </button>
            <p className="text-white/40 text-xs text-center mt-3">
              Sem cartão de crédito · Acesso imediato · Cancele quando quiser
            </p>

            {/* ⚠️ AVISO OBRIGATÓRIO — Responsável maior de 18 anos */}
            <div className="mt-4 bg-red-600/30 border-2 border-red-400/60 rounded-2xl px-5 py-4 text-left">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🚨</span>
                <span className="text-red-200 font-extrabold text-sm uppercase tracking-wide">Atenção Obrigatória</span>
              </div>
              <p className="text-white font-semibold text-sm leading-relaxed mb-2">
                O cadastro nesta plataforma <span className="text-yellow-300 underline">só pode ser realizado por pais e/ou responsáveis maiores de 18 anos</span>.
              </p>
              <ul className="text-white/80 text-xs space-y-1">
                <li className="flex items-start gap-1"><span className="text-red-300 mt-0.5">•</span> Menores de 18 anos não podem se cadastrar sozinhos</li>
                <li className="flex items-start gap-1"><span className="text-red-300 mt-0.5">•</span> Os pais ou responsável legal deverão fornecer seus dados e foto de identificação</li>
                <li className="flex items-start gap-1"><span className="text-red-300 mt-0.5">•</span> Dados falsos são rastreados e sujeitos a responsabilidade legal (LGPD / ECA / Código Civil)</li>
              </ul>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-12">
            {[
              { value: "143", label: "Idiomas", icon: "🌍" },
              { value: "57", label: "Disponíveis Agora", icon: "✅" },
              { value: "1.100+", label: "Palavras Pareto", icon: "🧠" },
              { value: "100%", label: "Personalizado", icon: "⚡" },
            ].map((stat) => (
              <div key={stat.label} className="text-center bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="text-2xl font-extrabold text-white">{stat.value}</div>
                <div className="text-xs text-white/60">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES SECTION ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-purple-100 text-purple-700">Por que somos diferentes</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tecnologia que Nenhuma Outra Plataforma Tem
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Combinamos realidade aumentada, IA conversacional e voz natural para criar 
              a experiência de aprendizado mais imersiva do mundo.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Brain className="h-8 w-8 text-violet-600" />,
                bg: "bg-gradient-to-br from-violet-50 to-purple-50",
                border: "border-violet-300",
                title: "🧠 Aprendizado Natural",
                desc: "Aprenda como o cérebro humano aprende: Infância (sons), Adolescência (frases), Adulto (conversação real). O único app que replica a aquisição natural de linguagem.",
              },
              {
                icon: <Globe className="h-8 w-8 text-purple-600" />,
                bg: "bg-purple-50",
                border: "border-purple-200",
                title: "Cenas Imersivas em AR",
                desc: "Explore Paris, Tokyo, Nova York e mais 3 cenários com professor animado e objetos clicáveis. Vocabulário contextual em 143 idiomas.",
              },
              {
                icon: <Mic className="h-8 w-8 text-blue-600" />,
                bg: "bg-blue-50",
                border: "border-blue-200",
                title: "Voz Natural Ultra-Realista",
                desc: "Tecnologia Edge TTS Neural com vozes nativas de cada idioma. Inglês americano, britânico, australiano — você escolhe o sotaque.",
              },
              {
                icon: <Brain className="h-8 w-8 text-pink-600" />,
                bg: "bg-pink-50",
                border: "border-pink-200",
                title: "Método Pareto de Vocabulário",
                desc: "1.100+ palavras mais usadas em cada idioma. Aprenda 20% do vocabulário que cobre 80% das conversações reais.",
              },
              {
                icon: <Users className="h-8 w-8 text-green-600" />,
                bg: "bg-green-50",
                border: "border-green-200",
                title: "143 Professores Virtuais",
                desc: "Cada professor é nativo do seu idioma. Fotos reais, animação labial sincronizada, personalidade única e voz autêntica.",
              },
              {
                icon: <Zap className="h-8 w-8 text-orange-600" />,
                bg: "bg-orange-50",
                border: "border-orange-200",
                title: "Treino de Memória Diária",
                desc: "Sistema de repetição espaçada com 5 modos: cartão, escrita, tradução, sinônimos e ditado. Memorize para sempre.",
              },
              {
                icon: <MessageSquare className="h-8 w-8 text-indigo-600" />,
                bg: "bg-indigo-50",
                border: "border-indigo-200",
                title: "Conversa Livre com IA",
                desc: "Pratique conversação real com IA que corrige sua gramática e pronúncia em tempo real, sem julgamentos.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className={`${f.bg} border ${f.border} rounded-2xl p-6 hover:shadow-lg transition-all`}
              >
                <div className="mb-4">{f.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LANGUAGES SECTION ── */}
      <section className="py-20 bg-gradient-to-r from-purple-700 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">143 Idiomas · 57 Disponíveis Agora</h2>
          <p className="text-lg text-white/80 mb-4">
            Do português ao esperanto, do latim ao tupi-guarani — a maior coleção de idiomas do mundo
          </p>
          <div className="inline-flex items-center gap-2 bg-yellow-400/20 border border-yellow-300/40 rounded-full px-5 py-2 mb-8">
            <span className="text-yellow-300 font-bold text-sm">🔔 Novos idiomas sendo adicionados continuamente</span>
          </div>
          <div className="flex flex-wrap justify-center gap-2 max-w-5xl mx-auto">
            {[
              "🇧🇷 Português", "🇺🇸 Inglês (US)", "🇬🇧 Inglês (UK)",
              "🇪🇸 Espanhol", "🇫🇷 Francês", "🇩🇪 Alemão",
              "🇮🇹 Italiano", "🇯🇵 Japonês", "🇨🇳 Mandarim",
              "🇰🇷 Coreano", "🇷🇺 Russo", "🇸🇦 Árabe",
              "🇮🇳 Hindi", "🇹🇷 Turco", "🇳🇱 Holandês",
              "🇵🇱 Polonês", "🇸🇪 Sueco", "🇮🇱 Hebraico",
              "🏛️ Latim (em breve)", "🪶 Tupi-Guarani (em breve)",
              "🌍 Esperanto (em breve)",
              "+ 120 outros"
            ].map((lang) => (
              <span
                key={lang}
                className="bg-white/15 hover:bg-white/25 border border-white/20 text-white text-sm px-3 py-1.5 rounded-full cursor-default transition-colors"
              >
                {lang}
              </span>
            ))}
          </div>
          <div className="mt-10">
            <Link href="/immersive-scene">
              <Button size="lg" variant="secondary" className="text-purple-700 font-bold text-base px-8">
                <Globe className="mr-2 h-5 w-5" />
                Explorar Cenas Imersivas
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── COMPARISON TABLE ── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-green-100 text-green-700">Comparativo</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Por Que Somos a Melhor Escolha
            </h2>
            <p className="text-lg text-gray-600">
              Compare os recursos e veja a diferença
            </p>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                  <th className="px-6 py-4 text-left font-semibold">Recurso</th>
                  <th className="px-6 py-4 text-center font-semibold">
                    <div className="flex items-center justify-center gap-1">
                      <Globe className="h-4 w-4" /> MultiLingue
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center font-semibold text-white/70">Plataforma A</th>
                  <th className="px-6 py-4 text-center font-semibold text-white/70">Plataforma B</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  ["Cenas Imersivas AR", true, false, false],
                  ["94 Professores Nativos", true, false, false],
                  ["Voz Neural por Idioma", true, "Básica", "Limitada"],
                  ["Método Pareto (1.100+ palavras)", true, false, false],
                  ["Conversa Livre com IA", true, false, "Limitada"],
                  ["Funciona Offline", true, "Parcial", false],
                  ["LGPD + COPPA + GDPR", true, "Parcial", false],
                  ["Autorização Parental", true, false, false],
                ].map(([feature, ml, a, b]) => (
                  <tr key={String(feature)} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3.5 font-medium text-gray-800">{feature}</td>
                    <td className="px-6 py-3.5 text-center">
                      {ml === true ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
                      ) : (
                        <span className="text-gray-500 text-xs">{String(ml)}</span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      {a === false ? (
                        <span className="text-gray-300 text-lg">✗</span>
                      ) : (
                        <span className="text-gray-400 text-xs">{String(a)}</span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      {b === false ? (
                        <span className="text-gray-300 text-lg">✗</span>
                      ) : (
                        <span className="text-gray-400 text-xs">{String(b)}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── TEACHER DEMONSTRATION ── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl overflow-hidden border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-8 md:p-12">
            <div className="grid md:grid-cols-[auto_1fr] items-center gap-8">
              <div className="flex justify-center">
                <AnimatedTeacher
                  teacherName="Ingrid"
                  teacherGender="female"
                  teacherImageUrl="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face"
                  languageCode="en-US"
                  text="Hello! I am Ingrid. Let us learn English together."
                  size="lg"
                />
              </div>
              <div>
                <Badge className="mb-4 bg-violet-100 text-violet-700">Demonstração do professor virtual</Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Aprenda com um professor que explica, fala e acompanha seu ritmo</h2>
                <p className="text-gray-600 text-lg mb-5">A demonstração mostra o professor virtual com fala, movimento, vocabulário contextual e uma sequência de aulas organizada por nível.</p>
                <div className="grid sm:grid-cols-3 gap-3 mb-7 text-sm">
                  <div className="rounded-xl bg-white p-3 border border-indigo-100"><strong className="block text-indigo-700">1. Ouça</strong>Fala no idioma-alvo</div>
                  <div className="rounded-xl bg-white p-3 border border-indigo-100"><strong className="block text-indigo-700">2. Pratique</strong>Repita e responda</div>
                  <div className="rounded-xl bg-white p-3 border border-indigo-100"><strong className="block text-indigo-700">3. Avance</strong>Desbloqueie a próxima aula</div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/ar-teacher"><Button className="bg-indigo-600 hover:bg-indigo-700"><Video className="mr-2 h-4 w-4" />Ver demonstração completa</Button></Link>
                  <Link href="/checkout"><Button variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"><CreditCard className="mr-2 h-4 w-4" />Conhecer os planos</Button></Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── IMMERSIVE SCENE PROMO ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-700 to-pink-600 p-1">
            <div className="bg-white rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <Badge className="mb-4 bg-indigo-100 text-indigo-700">🌍 Realidade Aumentada</Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
                  Cenas Imersivas com Professor Animado
                </h2>
                <p className="text-gray-600 text-lg mb-6">
                  Explore <strong>6 cenários reais</strong> — Paris, Praia Tropical, Floresta, Tokyo, 
                  Nova York e Cozinha — com professor animado e hotspots clicáveis nos objetos.
                </p>
                <div className="flex flex-wrap gap-2 mb-8">
                  {["🗼 Paris", "🏖️ Praia", "🌲 Floresta", "⛩️ Tokyo", "🗽 Nova York", "🍳 Cozinha"].map(s => (
                    <span key={s} className="bg-indigo-50 text-indigo-700 text-sm font-medium px-3 py-1 rounded-full border border-indigo-200">{s}</span>
                  ))}
                </div>
                <Link href="/immersive-scene">
                  <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-base px-8">
                    <Globe className="mr-2 h-5 w-5" />
                    Entrar nas Cenas Imersivas
                  </Button>
                </Link>
              </div>
              <div className="text-center flex-shrink-0">
                <div className="text-8xl mb-4">🌍</div>
                <div className="grid grid-cols-3 gap-2 text-4xl">
                  <span>🗼</span><span>🏖️</span><span>🌲</span>
                  <span>⛩️</span><span>🗽</span><span>🍳</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section className="py-20 bg-gradient-to-r from-purple-700 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Trophy className="h-16 w-16 mx-auto mb-6 text-yellow-300" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Comece Sua Jornada Hoje
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-xl mx-auto">
            Junte-se a milhares de alunos que já estão aprendendo com professores virtuais 
            nativos e inteligência artificial avançada.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={getLoginUrl()}>
              <Button size="lg" className="bg-white text-purple-700 hover:bg-gray-100 font-bold text-lg px-10 py-6">
                <Star className="mr-2 h-5 w-5" />
                Começar Gratuitamente
              </Button>
            </a>
            <Link href="/terms">
              <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 text-lg px-10 py-6">
                <Shield className="mr-2 h-5 w-5" />
                Ver Termos & Privacidade
              </Button>
            </Link>
          </div>
          <p className="text-white/50 text-sm mt-6">
            Plataforma em conformidade com LGPD (Brasil) · COPPA (EUA) · GDPR (Europa)
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-950 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                  <Globe className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-white">MultiLingue Universal</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                A plataforma mais avançada para aprender idiomas com inteligência artificial e realidade aumentada.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-white">Plataforma</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/immersive-scene"><span className="hover:text-white cursor-pointer">Cenas Imersivas</span></Link></li>
                <li><Link href="/ar-teacher"><span className="hover:text-white cursor-pointer">Professores com IA</span></Link></li>
                <li><Link href="/daily-memory"><span className="hover:text-white cursor-pointer">Memória Diária</span></Link></li>
                <li><Link href="/free-talk"><span className="hover:text-white cursor-pointer">Conversa Livre</span></Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-white">Empresa</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Sobre Nós</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><Link href="/pricing"><span className="hover:text-white cursor-pointer">Preços</span></Link></li>
                <li><a href="#" className="hover:text-white">Contato</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-white">Legal & Segurança</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/terms"><span className="hover:text-white cursor-pointer">Termos de Uso</span></Link></li>
                <li><Link href="/terms"><span className="hover:text-white cursor-pointer">Política de Privacidade</span></Link></li>
                <li><Link href="/terms"><span className="hover:text-white cursor-pointer">Proteção de Menores (LGPD/COPPA)</span></Link></li>
                <li><Link href="/terms"><span className="hover:text-white cursor-pointer">Autorização Parental</span></Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              © 2025 MultiLingue Universal. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> LGPD</span>
              <span>·</span>
              <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> COPPA</span>
              <span>·</span>
              <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> GDPR</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ── FLOATING ANIMATION KEYFRAMES ── */}
      <style>{`
        @keyframes heroFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.5; }
          33% { transform: translateY(-12px) rotate(3deg); opacity: 0.7; }
          66% { transform: translateY(-6px) rotate(-2deg); opacity: 0.55; }
        }
      `}</style>
    </div>
  );
}
