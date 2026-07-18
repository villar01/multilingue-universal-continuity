/**
 * 69 idiomas suportados pela plataforma MultiLingue Universal
 * Compatível com Web Speech API (SpeechRecognition + SpeechSynthesis)
 */
export interface Language {
  code: string;     // BCP-47 para Web Speech API
  label: string;    // Nome em português
  flag: string;     // Emoji da bandeira
  name: string;     // Nome nativo
  region: string;   // Região geográfica
}

export const LANGUAGES_57: Language[] = [
  // ── Europeus Ocidentais ──────────────────────────────────────────────────
  { code: "en-US", label: "Inglês (EUA)", flag: "🇺🇸", name: "English (US)", region: "América" },
  { code: "en-GB", label: "Inglês (UK)", flag: "🇬🇧", name: "English (UK)", region: "Europa" },
  { code: "es-ES", label: "Espanhol (Espanha)", flag: "🇪🇸", name: "Español", region: "Europa" },
  { code: "es-MX", label: "Espanhol (México)", flag: "🇲🇽", name: "Español (MX)", region: "América" },
  { code: "fr-FR", label: "Francês", flag: "🇫🇷", name: "Français", region: "Europa" },
  { code: "de-DE", label: "Alemão", flag: "🇩🇪", name: "Deutsch", region: "Europa" },
  { code: "it-IT", label: "Italiano", flag: "🇮🇹", name: "Italiano", region: "Europa" },
  { code: "pt-PT", label: "Português (Portugal)", flag: "🇵🇹", name: "Português (PT)", region: "Europa" },
  { code: "nl-NL", label: "Holandês", flag: "🇳🇱", name: "Nederlands", region: "Europa" },
  { code: "sv-SE", label: "Sueco", flag: "🇸🇪", name: "Svenska", region: "Europa" },
  { code: "no-NO", label: "Norueguês", flag: "🇳🇴", name: "Norsk", region: "Europa" },
  { code: "da-DK", label: "Dinamarquês", flag: "🇩🇰", name: "Dansk", region: "Europa" },
  { code: "fi-FI", label: "Finlandês", flag: "🇫🇮", name: "Suomi", region: "Europa" },
  { code: "pl-PL", label: "Polonês", flag: "🇵🇱", name: "Polski", region: "Europa" },
  { code: "cs-CZ", label: "Tcheco", flag: "🇨🇿", name: "Čeština", region: "Europa" },
  { code: "sk-SK", label: "Eslovaco", flag: "🇸🇰", name: "Slovenčina", region: "Europa" },
  { code: "hu-HU", label: "Húngaro", flag: "🇭🇺", name: "Magyar", region: "Europa" },
  { code: "ro-RO", label: "Romeno", flag: "🇷🇴", name: "Română", region: "Europa" },
  { code: "bg-BG", label: "Búlgaro", flag: "🇧🇬", name: "Български", region: "Europa" },
  { code: "hr-HR", label: "Croata", flag: "🇭🇷", name: "Hrvatski", region: "Europa" },
  { code: "sr-RS", label: "Sérvio", flag: "🇷🇸", name: "Српски", region: "Europa" },
  { code: "uk-UA", label: "Ucraniano", flag: "🇺🇦", name: "Українська", region: "Europa" },
  { code: "el-GR", label: "Grego", flag: "🇬🇷", name: "Ελληνικά", region: "Europa" },
  { code: "tr-TR", label: "Turco", flag: "🇹🇷", name: "Türkçe", region: "Europa/Ásia" },
  { code: "ru-RU", label: "Russo", flag: "🇷🇺", name: "Русский", region: "Europa/Ásia" },
  { code: "ca-ES", label: "Catalão", flag: "🏴󠁥󠁳󠁣󠁴󠁿", name: "Català", region: "Europa" },
  { code: "gl-ES", label: "Galego", flag: "🇪🇸", name: "Galego", region: "Europa" },
  { code: "eu-ES", label: "Basco", flag: "🇪🇸", name: "Euskara", region: "Europa" },
  // ── Asiáticos ────────────────────────────────────────────────────────────
  { code: "ja-JP", label: "Japonês", flag: "🇯🇵", name: "日本語", region: "Ásia" },
  { code: "zh-CN", label: "Chinês (Mandarim)", flag: "🇨🇳", name: "普通话", region: "Ásia" },
  { code: "zh-TW", label: "Chinês (Taiwan)", flag: "🇹🇼", name: "繁體中文", region: "Ásia" },
  { code: "ko-KR", label: "Coreano", flag: "🇰🇷", name: "한국어", region: "Ásia" },
  { code: "hi-IN", label: "Hindi", flag: "🇮🇳", name: "हिन्दी", region: "Ásia" },
  { code: "bn-BD", label: "Bengali", flag: "🇧🇩", name: "বাংলা", region: "Ásia" },
  { code: "th-TH", label: "Tailandês", flag: "🇹🇭", name: "ภาษาไทย", region: "Ásia" },
  { code: "vi-VN", label: "Vietnamita", flag: "🇻🇳", name: "Tiếng Việt", region: "Ásia" },
  { code: "id-ID", label: "Indonésio", flag: "🇮🇩", name: "Bahasa Indonesia", region: "Ásia" },
  { code: "ms-MY", label: "Malaio", flag: "🇲🇾", name: "Bahasa Melayu", region: "Ásia" },
  { code: "tl-PH", label: "Filipino", flag: "🇵🇭", name: "Filipino", region: "Ásia" },
  { code: "ur-PK", label: "Urdu", flag: "🇵🇰", name: "اردو", region: "Ásia" },
  { code: "fa-IR", label: "Persa", flag: "🇮🇷", name: "فارسی", region: "Ásia" },
  { code: "ne-NP", label: "Nepali", flag: "🇳🇵", name: "नेपाली", region: "Ásia" },
  { code: "si-LK", label: "Cingalês", flag: "🇱🇰", name: "සිංහල", region: "Ásia" },
  // ── Oriente Médio / África ───────────────────────────────────────────────
  { code: "ar-SA", label: "Árabe (Saudita)", flag: "🇸🇦", name: "العربية", region: "Oriente Médio" },
  { code: "ar-EG", label: "Árabe (Egito)", flag: "🇪🇬", name: "العربية (مصر)", region: "Oriente Médio" },
  { code: "he-IL", label: "Hebraico", flag: "🇮🇱", name: "עברית", region: "Oriente Médio" },
  { code: "sw-KE", label: "Suaíli", flag: "🇰🇪", name: "Kiswahili", region: "África" },
  { code: "af-ZA", label: "Africâner", flag: "🇿🇦", name: "Afrikaans", region: "África" },
  { code: "am-ET", label: "Amárico", flag: "🇪🇹", name: "አማርኛ", region: "África" },
  { code: "yo-NG", label: "Iorubá", flag: "🇳🇬", name: "Yorùbá", region: "África" },
  { code: "ha-NG", label: "Hauçá", flag: "🇳🇬", name: "Hausa", region: "África" },
  // ── Americanos ───────────────────────────────────────────────────────────
  { code: "pt-BR", label: "Português (Brasil)", flag: "🇧🇷", name: "Português (BR)", region: "América" },
  { code: "es-AR", label: "Espanhol (Argentina)", flag: "🇦🇷", name: "Español (AR)", region: "América" },
  { code: "es-CO", label: "Espanhol (Colômbia)", flag: "🇨🇴", name: "Español (CO)", region: "América" },
  { code: "fr-CA", label: "Francês (Canadá)", flag: "🇨🇦", name: "Français (CA)", region: "América" },
  // ── Outros ───────────────────────────────────────────────────────────────
  { code: "is-IS", label: "Islandês", flag: "🇮🇸", name: "Íslenska", region: "Europa" },
  { code: "mt-MT", label: "Maltês", flag: "🇲🇹", name: "Malti", region: "Europa" },
  { code: "cy-GB", label: "Galês", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", name: "Cymraeg", region: "Europa" },
];

// Idiomas agrupados por região para o seletor
export const LANGUAGES_BY_REGION: Record<string, Language[]> = LANGUAGES_57.reduce((acc, lang) => {
  if (!acc[lang.region]) acc[lang.region] = [];
  acc[lang.region].push(lang);
  return acc;
}, {} as Record<string, Language[]>);

export const REGIONS = ["América", "Europa", "Ásia", "Oriente Médio", "África", "Europa/Ásia"];

// Idiomas mais populares para seleção rápida
export const POPULAR_LANGUAGES = LANGUAGES_57.filter(l =>
  ["en-US","es-ES","fr-FR","de-DE","it-IT","ja-JP","zh-CN","ko-KR","ru-RU","ar-SA","pt-PT","hi-IN"].includes(l.code)
);
