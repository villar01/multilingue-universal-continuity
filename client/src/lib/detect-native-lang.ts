/**
 * detect-native-lang.ts
 * Detecta o idioma nativo do usuário pelo navegador/SO.
 * Suporta 69 idiomas. Permite override manual salvo no localStorage.
 */

export interface LangInfo {
  code: string;       // ex: "pt-BR"
  name: string;       // nome no próprio idioma, ex: "Português (Brasil)"
  nameInPt: string;   // nome em português, ex: "Português (Brasil)"
  flag: string;       // emoji de bandeira
  region: string;     // ex: "Brasil"
}

/** Mapa completo de códigos BCP-47 → info do idioma */
export const LANG_MAP: Record<string, LangInfo> = {
  "pt-BR": { code: "pt-BR", name: "Português (Brasil)",    nameInPt: "Português (Brasil)",       flag: "🇧🇷", region: "Brasil" },
  "pt-PT": { code: "pt-PT", name: "Português (Portugal)",  nameInPt: "Português (Portugal)",     flag: "🇵🇹", region: "Portugal" },
  "en-US": { code: "en-US", name: "English (US)",          nameInPt: "Inglês (EUA)",             flag: "🇺🇸", region: "United States" },
  "en-GB": { code: "en-GB", name: "English (UK)",          nameInPt: "Inglês (Reino Unido)",     flag: "🇬🇧", region: "United Kingdom" },
  "en-AU": { code: "en-AU", name: "English (Australia)",   nameInPt: "Inglês (Austrália)",       flag: "🇦🇺", region: "Australia" },
  "en-CA": { code: "en-CA", name: "English (Canada)",      nameInPt: "Inglês (Canadá)",          flag: "🇨🇦", region: "Canada" },
  "es-ES": { code: "es-ES", name: "Español (España)",      nameInPt: "Espanhol (Espanha)",       flag: "🇪🇸", region: "España" },
  "es-MX": { code: "es-MX", name: "Español (México)",      nameInPt: "Espanhol (México)",        flag: "🇲🇽", region: "México" },
  "es-AR": { code: "es-AR", name: "Español (Argentina)",   nameInPt: "Espanhol (Argentina)",     flag: "🇦🇷", region: "Argentina" },
  "fr-FR": { code: "fr-FR", name: "Français",              nameInPt: "Francês",                  flag: "🇫🇷", region: "France" },
  "fr-CA": { code: "fr-CA", name: "Français (Canada)",     nameInPt: "Francês (Canadá)",         flag: "🇨🇦", region: "Canada" },
  "de-DE": { code: "de-DE", name: "Deutsch",               nameInPt: "Alemão",                   flag: "🇩🇪", region: "Deutschland" },
  "it-IT": { code: "it-IT", name: "Italiano",              nameInPt: "Italiano",                 flag: "🇮🇹", region: "Italia" },
  "ja-JP": { code: "ja-JP", name: "日本語",                nameInPt: "Japonês",                  flag: "🇯🇵", region: "日本" },
  "zh-CN": { code: "zh-CN", name: "中文 (简体)",           nameInPt: "Chinês (Simplificado)",    flag: "🇨🇳", region: "中国" },
  "zh-TW": { code: "zh-TW", name: "中文 (繁體)",           nameInPt: "Chinês (Tradicional)",     flag: "🇹🇼", region: "台灣" },
  "ko-KR": { code: "ko-KR", name: "한국어",                nameInPt: "Coreano",                  flag: "🇰🇷", region: "한국" },
  "ru-RU": { code: "ru-RU", name: "Русский",               nameInPt: "Russo",                    flag: "🇷🇺", region: "Россия" },
  "ar-XA": { code: "ar-XA", name: "العربية",               nameInPt: "Árabe",                    flag: "🇸🇦", region: "العالم العربي" },
  "hi-IN": { code: "hi-IN", name: "हिन्दी",               nameInPt: "Hindi",                    flag: "🇮🇳", region: "भारत" },
  "nl-NL": { code: "nl-NL", name: "Nederlands",            nameInPt: "Holandês",                 flag: "🇳🇱", region: "Nederland" },
  "pl-PL": { code: "pl-PL", name: "Polski",                nameInPt: "Polonês",                  flag: "🇵🇱", region: "Polska" },
  "sv-SE": { code: "sv-SE", name: "Svenska",               nameInPt: "Sueco",                    flag: "🇸🇪", region: "Sverige" },
  "da-DK": { code: "da-DK", name: "Dansk",                 nameInPt: "Dinamarquês",              flag: "🇩🇰", region: "Danmark" },
  "fi-FI": { code: "fi-FI", name: "Suomi",                 nameInPt: "Finlandês",                flag: "🇫🇮", region: "Suomi" },
  "nb-NO": { code: "nb-NO", name: "Norsk",                 nameInPt: "Norueguês",                flag: "🇳🇴", region: "Norge" },
  "tr-TR": { code: "tr-TR", name: "Türkçe",                nameInPt: "Turco",                    flag: "🇹🇷", region: "Türkiye" },
  "uk-UA": { code: "uk-UA", name: "Українська",            nameInPt: "Ucraniano",                flag: "🇺🇦", region: "Україна" },
  "cs-CZ": { code: "cs-CZ", name: "Čeština",               nameInPt: "Tcheco",                   flag: "🇨🇿", region: "Česká republika" },
  "hu-HU": { code: "hu-HU", name: "Magyar",                nameInPt: "Húngaro",                  flag: "🇭🇺", region: "Magyarország" },
  "ro-RO": { code: "ro-RO", name: "Română",                nameInPt: "Romeno",                   flag: "🇷🇴", region: "România" },
  "bg-BG": { code: "bg-BG", name: "Български",             nameInPt: "Búlgaro",                  flag: "🇧🇬", region: "България" },
  "hr-HR": { code: "hr-HR", name: "Hrvatski",              nameInPt: "Croata",                   flag: "🇭🇷", region: "Hrvatska" },
  "sk-SK": { code: "sk-SK", name: "Slovenčina",            nameInPt: "Eslovaco",                 flag: "🇸🇰", region: "Slovensko" },
  "sl-SI": { code: "sl-SI", name: "Slovenščina",           nameInPt: "Esloveno",                 flag: "🇸🇮", region: "Slovenija" },
  "et-EE": { code: "et-EE", name: "Eesti",                 nameInPt: "Estoniano",                flag: "🇪🇪", region: "Eesti" },
  "lv-LV": { code: "lv-LV", name: "Latviešu",              nameInPt: "Letão",                    flag: "🇱🇻", region: "Latvija" },
  "lt-LT": { code: "lt-LT", name: "Lietuvių",              nameInPt: "Lituano",                  flag: "🇱🇹", region: "Lietuva" },
  "vi-VN": { code: "vi-VN", name: "Tiếng Việt",            nameInPt: "Vietnamita",               flag: "🇻🇳", region: "Việt Nam" },
  "id-ID": { code: "id-ID", name: "Bahasa Indonesia",      nameInPt: "Indonésio",                flag: "🇮🇩", region: "Indonesia" },
  "ms-MY": { code: "ms-MY", name: "Bahasa Melayu",         nameInPt: "Malaio",                   flag: "🇲🇾", region: "Malaysia" },
  "fa-IR": { code: "fa-IR", name: "فارسی",                 nameInPt: "Persa",                    flag: "🇮🇷", region: "ایران" },
  "he-IL": { code: "he-IL", name: "עברית",                 nameInPt: "Hebraico",                 flag: "🇮🇱", region: "ישראל" },
  "el-GR": { code: "el-GR", name: "Ελληνικά",              nameInPt: "Grego",                    flag: "🇬🇷", region: "Ελλάδα" },
  "af-ZA": { code: "af-ZA", name: "Afrikaans",             nameInPt: "Africâner",                flag: "🇿🇦", region: "South Africa" },
  "sw-KE": { code: "sw-KE", name: "Kiswahili",             nameInPt: "Suaíli",                   flag: "🇰🇪", region: "Kenya" },
  "zu-ZA": { code: "zu-ZA", name: "isiZulu",               nameInPt: "Zulu",                     flag: "🇿🇦", region: "South Africa" },
  "yo-NG": { code: "yo-NG", name: "Yorùbá",                nameInPt: "Iorubá",                   flag: "🇳🇬", region: "Nigeria" },
  "ha-NG": { code: "ha-NG", name: "Hausa",                 nameInPt: "Hausa",                    flag: "🇳🇬", region: "Nigeria" },
  "ig-NG": { code: "ig-NG", name: "Igbo",                  nameInPt: "Igbo",                     flag: "🇳🇬", region: "Nigeria" },
  "am-ET": { code: "am-ET", name: "አማርኛ",                  nameInPt: "Amárico",                  flag: "🇪🇹", region: "ኢትዮጵያ" },
  "bn-IN": { code: "bn-IN", name: "বাংলা",                 nameInPt: "Bengali",                  flag: "🇧🇩", region: "বাংলাদেশ" },
  "ur-IN": { code: "ur-IN", name: "اردو",                  nameInPt: "Urdu",                     flag: "🇵🇰", region: "پاکستان" },
  "ca-ES": { code: "ca-ES", name: "Català",                nameInPt: "Catalão",                  flag: "🏴󠁥󠁳󠁣󠁴󠁿", region: "Catalunya" },
  "eu-ES": { code: "eu-ES", name: "Euskara",               nameInPt: "Basco",                    flag: "🏴", region: "Euskal Herria" },
  "gl-ES": { code: "gl-ES", name: "Galego",                nameInPt: "Galego",                   flag: "🇪🇸", region: "Galicia" },
  "sr-RS": { code: "sr-RS", name: "Српски",                nameInPt: "Sérvio",                   flag: "🇷🇸", region: "Србија" },
};

/** Prefixos de idioma sem região → código completo preferido */
const LANG_PREFIX_MAP: Record<string, string> = {
  pt: "pt-BR", en: "en-US", es: "es-ES", fr: "fr-FR", de: "de-DE",
  it: "it-IT", ja: "ja-JP", zh: "zh-CN", ko: "ko-KR", ru: "ru-RU",
  ar: "ar-XA", hi: "hi-IN", nl: "nl-NL", pl: "pl-PL", sv: "sv-SE",
  da: "da-DK", fi: "fi-FI", nb: "nb-NO", tr: "tr-TR", uk: "uk-UA",
  cs: "cs-CZ", hu: "hu-HU", ro: "ro-RO", bg: "bg-BG", hr: "hr-HR",
  sk: "sk-SK", sl: "sl-SI", et: "et-EE", lv: "lv-LV", lt: "lt-LT",
  vi: "vi-VN", id: "id-ID", ms: "ms-MY", fa: "fa-IR", he: "he-IL",
  el: "el-GR", af: "af-ZA", sw: "sw-KE", zu: "zu-ZA", yo: "yo-NG",
  ha: "ha-NG", ig: "ig-NG", am: "am-ET", bn: "bn-IN", ur: "ur-IN",
  ca: "ca-ES", eu: "eu-ES", gl: "gl-ES", sr: "sr-RS",
};

const STORAGE_KEY = "ml_native_lang";
const STORAGE_CONFIRMED_KEY = "ml_native_lang_confirmed";

/**
 * Detecta o idioma nativo pelo navegador/SO.
 * Prioridade: localStorage → navigator.languages → navigator.language → fallback pt-BR
 */
export function detectNativeLang(): { code: string; info: LangInfo; fromStorage: boolean; confirmed: boolean } {
  // 1. Verificar se já foi salvo manualmente
  const stored = localStorage.getItem(STORAGE_KEY);
  const confirmed = localStorage.getItem(STORAGE_CONFIRMED_KEY) === "true";
  if (stored && LANG_MAP[stored]) {
    return { code: stored, info: LANG_MAP[stored], fromStorage: true, confirmed };
  }

  // 2. Tentar navigator.languages (lista ordenada por preferência do usuário)
  const browserLangs = navigator.languages || [navigator.language || "pt-BR"];
  for (const lang of browserLangs) {
    // Exact match
    if (LANG_MAP[lang]) {
      return { code: lang, info: LANG_MAP[lang], fromStorage: false, confirmed: false };
    }
    // Prefix match (ex: "pt" → "pt-BR")
    const prefix = lang.split("-")[0].toLowerCase();
    const mapped = LANG_PREFIX_MAP[prefix];
    if (mapped && LANG_MAP[mapped]) {
      return { code: mapped, info: LANG_MAP[mapped], fromStorage: false, confirmed: false };
    }
  }

  // 3. Fallback: português do Brasil
  return { code: "pt-BR", info: LANG_MAP["pt-BR"], fromStorage: false, confirmed: false };
}

/** Salva o idioma nativo escolhido pelo usuário */
export function saveNativeLang(code: string, confirmed = true) {
  localStorage.setItem(STORAGE_KEY, code);
  localStorage.setItem(STORAGE_CONFIRMED_KEY, confirmed ? "true" : "false");
}

/** Retorna o idioma nativo salvo ou detectado */
export function getNativeLang(): string {
  return localStorage.getItem(STORAGE_KEY) || detectNativeLang().code;
}

/** Lista de todos os idiomas disponíveis */
export const ALL_LANG_INFOS: LangInfo[] = Object.values(LANG_MAP);

/**
 * Mapa multilíngue: nome do país/idioma em cada idioma nativo → código do professor
 * Usado na busca do ARTeacher para aceitar termos no idioma do usuário
 */
export const MULTILANG_COUNTRY_ALIASES: Record<string, string[]> = {
  // Inglês (UK/US/AU/CA)
  "england":            ["en-GB"], "united kingdom":     ["en-GB"], "uk":                 ["en-GB"],
  "great britain":      ["en-GB"], "britain":            ["en-GB"], "angleterre":         ["en-GB"],
  "inghilterra":        ["en-GB"], "inglaterra":         ["en-GB", "en-US"],
  "angliya":            ["en-GB"],
  "united states":   ["en-US"], "usa":             ["en-US"], "america":         ["en-US"],
  "états-unis":      ["en-US"], "stati uniti":     ["en-US"], "estados unidos":  ["en-US"],
  "vereinigte staaten": ["en-US"], "соединённые штаты": ["en-US"],
  "australia":          ["en-AU"], "australie":          ["en-AU"], "australien":         ["en-AU"],
  "canada":             ["en-CA", "fr-CA"], "kanada":             ["en-CA", "fr-CA"],
  // Espanhol
  "españa":          ["es-ES"], "espagne":         ["es-ES"], "spain":           ["es-ES"],
  "spanien":         ["es-ES"], "spagna":          ["es-ES"], "испания":         ["es-ES"],
  "mexico":          ["es-MX"], "méxico":          ["es-MX"], "mexique":         ["es-MX"],
  "argentina":       ["es-AR"], "argentine":       ["es-AR"],
  // Francês
  "france":          ["fr-FR"], "frankreich":      ["fr-FR"], "francia":         ["fr-FR"],
  "франция":         ["fr-FR"], "فرنسا":           ["fr-FR"],
  // Alemão
  "germany":         ["de-DE"], "deutschland":     ["de-DE"], "allemagne":       ["de-DE"],
  "alemanha":        ["de-DE"], "germania":        ["de-DE"], "германия":        ["de-DE"],
  // Italiano
  "italy":           ["it-IT"], "italia":          ["it-IT"], "italie":          ["it-IT"],
  "italien":         ["it-IT"], "италия":          ["it-IT"],
  // Japonês
  "japan":           ["ja-JP"], "japon":           ["ja-JP"], "japão":           ["ja-JP"],
  "日本":             ["ja-JP"], "japonya":         ["ja-JP"],
  // Chinês
  "china":              ["zh-CN"], "chine":              ["zh-CN"],
  "中国":             ["zh-CN"], "台湾":             ["zh-TW"], "taiwan":          ["zh-TW"],
  // Coreano
  "korea":           ["ko-KR"], "corée":           ["ko-KR"], "coreia":          ["ko-KR"],
  "한국":             ["ko-KR"], "südkorea":        ["ko-KR"],
  // Russo
  "russia":          ["ru-RU"], "russie":          ["ru-RU"], "rússia":          ["ru-RU"],
  "россия":          ["ru-RU"], "rusya":           ["ru-RU"],
  // Árabe
  "arabia":          ["ar-XA"], "arab":            ["ar-XA"], "arábia":          ["ar-XA"],
  "العربية":          ["ar-XA"], "arabic":          ["ar-XA"],
  // Hindi
  "india":           ["hi-IN"], "inde":            ["hi-IN"], "índia":           ["hi-IN"],
  "भारत":             ["hi-IN"], "hindistan":       ["hi-IN"],
  // Holandês
  "netherlands":     ["nl-NL"], "holland":         ["nl-NL"], "holanda":         ["nl-NL"],
  "pays-bas":        ["nl-NL"], "niederlande":     ["nl-NL"],
  // Polonês
  "poland":          ["pl-PL"], "pologne":         ["pl-PL"], "polônia":         ["pl-PL"],
  "polska":          ["pl-PL"], "польша":          ["pl-PL"],
  // Sueco
  "sweden":          ["sv-SE"], "suède":           ["sv-SE"], "suécia":          ["sv-SE"],
  "sverige":         ["sv-SE"], "schweden":        ["sv-SE"],
  // Turco
  "turkey":          ["tr-TR"], "turquie":         ["tr-TR"], "turquia":         ["tr-TR"],
  "türkiye":         ["tr-TR"], "турция":          ["tr-TR"],
  // Ucraniano
  "ukraine":         ["uk-UA"], "ucrânia":         ["uk-UA"], "україна":         ["uk-UA"],
  "украина":         ["uk-UA"],
  // Grego
  "greece":          ["el-GR"], "grèce":           ["el-GR"], "grécia":          ["el-GR"],
  "ελλάδα":          ["el-GR"], "griechenland":    ["el-GR"],
  // Hebraico
  "israel":          ["he-IL"], "israël":          ["he-IL"], "ישראל":           ["he-IL"],
  // Persa
  "iran":            ["fa-IR"], "irã":             ["fa-IR"], "ایران":           ["fa-IR"],
  // Vietnamita
  "vietnam":         ["vi-VN"], "viêt nam":        ["vi-VN"], "vietnã":          ["vi-VN"],
  "việt nam":        ["vi-VN"],
  // Indonésio
  "indonesia":       ["id-ID"], "indonésie":       ["id-ID"], "indonésia":       ["id-ID"],
  // Malaio
  "malaysia":        ["ms-MY"], "malaisie":        ["ms-MY"], "malásia":         ["ms-MY"],
  // Africano
  "south africa":    ["af-ZA", "zu-ZA"], "afrique du sud": ["af-ZA"],
  "áfrica do sul":   ["af-ZA", "zu-ZA"],
  "kenya":           ["sw-KE"], "kenia":           ["sw-KE"],
  "nigeria":         ["yo-NG", "ha-NG", "ig-NG"], "nigéria": ["yo-NG", "ha-NG", "ig-NG"],
  "ethiopia":        ["am-ET"], "etiópia":         ["am-ET"],
  // Bengali
  "bangladesh":      ["bn-IN"], "bengali":         ["bn-IN"],
  // Urdu
  "pakistan":        ["ur-IN"], "paquistão":       ["ur-IN"],
  // Catalão/Basco/Galego
  "catalonia":       ["ca-ES"], "catalunha":       ["ca-ES"],
  "basque country":  ["eu-ES"], "país basco":      ["eu-ES"],
  "galicia":         ["gl-ES"], "galícia":         ["gl-ES"],
  // Sérvio
  "serbia":          ["sr-RS"], "sérvia":          ["sr-RS"], "srbija":          ["sr-RS"],
};
