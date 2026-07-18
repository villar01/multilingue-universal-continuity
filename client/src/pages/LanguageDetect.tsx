/**
 * LanguageDetect.tsx
 * Tela exibida ANTES do onboarding para detectar e confirmar o idioma nativo do usuário.
 *
 * Fluxo:
 * 1. Detecta idioma pelo navegador/SO automaticamente
 * 2. Pergunta ao usuário: "Este é seu idioma nativo?"
 * 3. Se sim → salva e vai para /onboarding
 * 4. Se não → mostra lista de 69 idiomas para seleção manual
 * 5. Após seleção → salva e vai para /onboarding
 *
 * Caso especial: brasileiro no exterior com celular em inglês →
 *   o app detecta "en-US" mas o usuário pode trocar para "pt-BR" em 1 clique.
 */

import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Globe, Check, Search, ChevronRight, Languages } from "lucide-react";
import {
  detectNativeLang,
  saveNativeLang,
  ALL_LANG_INFOS,
  type LangInfo,
} from "@/lib/detect-native-lang";

// Textos de UI em cada idioma para a pergunta de confirmação
const CONFIRM_TEXTS: Record<string, { question: string; yes: string; no: string; title: string; subtitle: string; searchPlaceholder: string }> = {
  "pt-BR": { title: "Bem-vindo!", subtitle: "Detectamos seu idioma nativo", question: "Este é o seu idioma nativo?", yes: "Sim, é este", no: "Não, escolher outro", searchPlaceholder: "Buscar idioma..." },
  "pt-PT": { title: "Bem-vindo!", subtitle: "Detetámos o seu idioma nativo", question: "Este é o seu idioma nativo?", yes: "Sim, é este", no: "Não, escolher outro", searchPlaceholder: "Pesquisar idioma..." },
  "en-US": { title: "Welcome!", subtitle: "We detected your native language", question: "Is this your native language?", yes: "Yes, that's it", no: "No, choose another", searchPlaceholder: "Search language..." },
  "en-GB": { title: "Welcome!", subtitle: "We detected your native language", question: "Is this your native language?", yes: "Yes, that's it", no: "No, choose another", searchPlaceholder: "Search language..." },
  "es-ES": { title: "¡Bienvenido!", subtitle: "Detectamos tu idioma nativo", question: "¿Es este tu idioma nativo?", yes: "Sí, es este", no: "No, elegir otro", searchPlaceholder: "Buscar idioma..." },
  "es-MX": { title: "¡Bienvenido!", subtitle: "Detectamos tu idioma nativo", question: "¿Es este tu idioma nativo?", yes: "Sí, es este", no: "No, elegir otro", searchPlaceholder: "Buscar idioma..." },
  "fr-FR": { title: "Bienvenue!", subtitle: "Nous avons détecté votre langue", question: "Est-ce votre langue maternelle?", yes: "Oui, c'est ça", no: "Non, choisir une autre", searchPlaceholder: "Rechercher une langue..." },
  "de-DE": { title: "Willkommen!", subtitle: "Wir haben Ihre Sprache erkannt", question: "Ist das Ihre Muttersprache?", yes: "Ja, das ist sie", no: "Nein, andere wählen", searchPlaceholder: "Sprache suchen..." },
  "it-IT": { title: "Benvenuto!", subtitle: "Abbiamo rilevato la tua lingua", question: "È questa la tua lingua madre?", yes: "Sì, è questa", no: "No, scegliere un'altra", searchPlaceholder: "Cerca lingua..." },
  "ja-JP": { title: "ようこそ！", subtitle: "母国語を検出しました", question: "これはあなたの母国語ですか？", yes: "はい、そうです", no: "いいえ、別の言語を選ぶ", searchPlaceholder: "言語を検索..." },
  "zh-CN": { title: "欢迎！", subtitle: "我们检测到了您的母语", question: "这是您的母语吗？", yes: "是的", no: "不，选择其他语言", searchPlaceholder: "搜索语言..." },
  "ko-KR": { title: "환영합니다!", subtitle: "모국어를 감지했습니다", question: "이것이 당신의 모국어입니까?", yes: "네, 맞습니다", no: "아니요, 다른 언어 선택", searchPlaceholder: "언어 검색..." },
  "ru-RU": { title: "Добро пожаловать!", subtitle: "Мы определили ваш родной язык", question: "Это ваш родной язык?", yes: "Да, это он", no: "Нет, выбрать другой", searchPlaceholder: "Поиск языка..." },
  "ar-XA": { title: "مرحباً!", subtitle: "اكتشفنا لغتك الأم", question: "هل هذه لغتك الأم؟", yes: "نعم، هذه هي", no: "لا، اختر أخرى", searchPlaceholder: "ابحث عن لغة..." },
  "hi-IN": { title: "स्वागत है!", subtitle: "हमने आपकी मातृभाषा का पता लगाया", question: "क्या यह आपकी मातृभाषा है?", yes: "हाँ, यही है", no: "नहीं, दूसरी चुनें", searchPlaceholder: "भाषा खोजें..." },
};

function getTexts(code: string) {
  return CONFIRM_TEXTS[code] || CONFIRM_TEXTS["en-US"];
}

export default function LanguageDetect() {
  const [, setLocation] = useLocation();
  const detected = useMemo(() => detectNativeLang(), []);
  const [showList, setShowList] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<LangInfo>(detected.info);

  const texts = getTexts(selected.code);

  const norm = (s: string) =>
    s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[()]/g, "");

  const filtered = useMemo(() => {
    if (!search.trim()) return ALL_LANG_INFOS;
    const q = norm(search);
    return ALL_LANG_INFOS.filter(l =>
      norm(l.name).includes(q) ||
      norm(l.nameInPt).includes(q) ||
      norm(l.region).includes(q) ||
      norm(l.code).includes(q)
    );
  }, [search]);

  const confirm = (lang: LangInfo) => {
    saveNativeLang(lang.code, true);
    // Também salva como ml_native_lang para o Onboarding
    localStorage.setItem("ml_native_lang", lang.code);
    setLocation("/onboarding");
  };

  const isRTL = ["ar-XA", "fa-IR", "he-IL", "ur-IN"].includes(selected.code);

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-blue-950 flex flex-col items-center justify-center px-4 py-8"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <Globe className="h-8 w-8 text-purple-400" />
        <span className="text-xl font-bold text-white">MultiLingue Universal</span>
      </div>

      {!showList ? (
        /* ── Tela de confirmação ── */
        <div className="w-full max-w-sm bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8 text-center">
          <Languages className="h-12 w-12 text-purple-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-1">{texts.title}</h1>
          <p className="text-gray-400 text-sm mb-6">{texts.subtitle}</p>

          {/* Idioma detectado */}
          <div className="bg-white/10 rounded-xl p-4 mb-6 flex items-center gap-3">
            <span className="text-4xl">{selected.flag}</span>
            <div className="text-left flex-1">
              <div className="text-white font-semibold text-lg">{selected.name}</div>
              <div className="text-gray-400 text-sm">{selected.region}</div>
              {!detected.fromStorage && (
                <div className="text-purple-400 text-xs mt-0.5">
                  {selected.code === detected.code ? "🔍 Detectado automaticamente" : "✏️ Selecionado manualmente"}
                </div>
              )}
            </div>
          </div>

          <p className="text-white font-medium mb-5">{texts.question}</p>

          {/* Botões */}
          <button
            onClick={() => confirm(selected)}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3 px-6 rounded-xl transition-all mb-3"
          >
            <Check className="h-5 w-5" />
            {texts.yes}
          </button>

          <button
            onClick={() => setShowList(true)}
            className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-gray-300 font-medium py-3 px-6 rounded-xl transition-all"
          >
            {texts.no}
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* Aviso para usuários no exterior */}
          <p className="text-gray-500 text-xs mt-4">
            {selected.code === "pt-BR"
              ? "Você pode trocar o idioma a qualquer momento nas configurações."
              : "You can change the language anytime in settings."}
          </p>
        </div>
      ) : (
        /* ── Lista de seleção ── */
        <div className="w-full max-w-sm">
          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-4 mb-4">
            <h2 className="text-white font-bold text-lg mb-3 text-center">
              {selected.code.startsWith("pt") ? "Escolha seu idioma nativo" :
               selected.code.startsWith("en") ? "Choose your native language" :
               selected.code.startsWith("es") ? "Elige tu idioma nativo" :
               selected.code.startsWith("fr") ? "Choisissez votre langue" :
               "Select your native language"}
            </h2>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={texts.searchPlaceholder}
                className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                autoFocus
              />
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl overflow-hidden max-h-[60vh] overflow-y-auto">
            {filtered.map(lang => (
              <button
                key={lang.code}
                onClick={() => {
                  setSelected(lang);
                  setShowList(false);
                  setSearch("");
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-all border-b border-white/5 last:border-0 ${
                  lang.code === selected.code ? "bg-purple-600/20" : ""
                }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <div className="flex-1 text-left">
                  <div className="text-white text-sm font-medium">{lang.name}</div>
                  <div className="text-gray-500 text-xs">{lang.nameInPt} · {lang.region}</div>
                </div>
                {lang.code === selected.code && (
                  <Check className="h-4 w-4 text-purple-400" />
                )}
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="text-center text-gray-500 py-8 text-sm">
                Nenhum idioma encontrado
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
