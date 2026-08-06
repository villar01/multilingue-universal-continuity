/**
 * 143 idiomas da plataforma MultiLingue Universal
 * Inclui idiomas modernos, antigos, indígenas e construídos
 * Compatível com Web Speech API (SpeechRecognition + SpeechSynthesis)
 */
export interface Language {
  code: string;       // BCP-47 para Web Speech API
  label: string;      // Nome em português
  flag: string;       // Emoji da bandeira
  name: string;       // Nome nativo
  region: string;     // Região geográfica
  available: boolean; // true = disponível agora, false = em breve
  category: "modern" | "ancient" | "indigenous" | "constructed" | "regional";
}

// ── 57 IDIOMAS MODERNOS DISPONÍVEIS AGORA ──────────────────────────────────
const MODERN_AVAILABLE: Language[] = [
  // Europa Ocidental
  { code: "en-US", label: "Inglês (EUA)", flag: "🇺🇸", name: "English (US)", region: "América", available: true, category: "modern" },
  { code: "en-GB", label: "Inglês (UK)", flag: "🇬🇧", name: "English (UK)", region: "Europa", available: true, category: "modern" },
  { code: "es-ES", label: "Espanhol (Espanha)", flag: "🇪🇸", name: "Español", region: "Europa", available: true, category: "modern" },
  { code: "es-MX", label: "Espanhol (México)", flag: "🇲🇽", name: "Español (MX)", region: "América", available: true, category: "modern" },
  { code: "fr-FR", label: "Francês", flag: "🇫🇷", name: "Français", region: "Europa", available: true, category: "modern" },
  { code: "de-DE", label: "Alemão", flag: "🇩🇪", name: "Deutsch", region: "Europa", available: true, category: "modern" },
  { code: "it-IT", label: "Italiano", flag: "🇮🇹", name: "Italiano", region: "Europa", available: true, category: "modern" },
  { code: "pt-PT", label: "Português (Portugal)", flag: "🇵🇹", name: "Português (PT)", region: "Europa", available: true, category: "modern" },
  { code: "nl-NL", label: "Holandês", flag: "🇳🇱", name: "Nederlands", region: "Europa", available: true, category: "modern" },
  { code: "sv-SE", label: "Sueco", flag: "🇸🇪", name: "Svenska", region: "Europa", available: true, category: "modern" },
  { code: "no-NO", label: "Norueguês", flag: "🇳🇴", name: "Norsk", region: "Europa", available: true, category: "modern" },
  { code: "da-DK", label: "Dinamarquês", flag: "🇩🇰", name: "Dansk", region: "Europa", available: true, category: "modern" },
  { code: "fi-FI", label: "Finlandês", flag: "🇫🇮", name: "Suomi", region: "Europa", available: true, category: "modern" },
  { code: "pl-PL", label: "Polonês", flag: "🇵🇱", name: "Polski", region: "Europa", available: true, category: "modern" },
  { code: "cs-CZ", label: "Tcheco", flag: "🇨🇿", name: "Čeština", region: "Europa", available: true, category: "modern" },
  { code: "sk-SK", label: "Eslovaco", flag: "🇸🇰", name: "Slovenčina", region: "Europa", available: true, category: "modern" },
  { code: "hu-HU", label: "Húngaro", flag: "🇭🇺", name: "Magyar", region: "Europa", available: true, category: "modern" },
  { code: "ro-RO", label: "Romeno", flag: "🇷🇴", name: "Română", region: "Europa", available: true, category: "modern" },
  { code: "bg-BG", label: "Búlgaro", flag: "🇧🇬", name: "Български", region: "Europa", available: true, category: "modern" },
  { code: "hr-HR", label: "Croata", flag: "🇭🇷", name: "Hrvatski", region: "Europa", available: true, category: "modern" },
  { code: "sr-RS", label: "Sérvio", flag: "🇷🇸", name: "Српски", region: "Europa", available: true, category: "modern" },
  { code: "uk-UA", label: "Ucraniano", flag: "🇺🇦", name: "Українська", region: "Europa", available: true, category: "modern" },
  { code: "el-GR", label: "Grego", flag: "🇬🇷", name: "Ελληνικά", region: "Europa", available: true, category: "modern" },
  { code: "tr-TR", label: "Turco", flag: "🇹🇷", name: "Türkçe", region: "Europa/Ásia", available: true, category: "modern" },
  { code: "ru-RU", label: "Russo", flag: "🇷🇺", name: "Русский", region: "Europa/Ásia", available: true, category: "modern" },
  { code: "ca-ES", label: "Catalão", flag: "🏴", name: "Català", region: "Europa", available: true, category: "modern" },
  { code: "gl-ES", label: "Galego", flag: "🇪🇸", name: "Galego", region: "Europa", available: true, category: "modern" },
  { code: "eu-ES", label: "Basco", flag: "🇪🇸", name: "Euskara", region: "Europa", available: true, category: "modern" },
  // Ásia
  { code: "ja-JP", label: "Japonês", flag: "🇯🇵", name: "日本語", region: "Ásia", available: true, category: "modern" },
  { code: "zh-CN", label: "Chinês (Mandarim)", flag: "🇨🇳", name: "普通话", region: "Ásia", available: true, category: "modern" },
  { code: "zh-TW", label: "Chinês (Taiwan)", flag: "🇹🇼", name: "繁體中文", region: "Ásia", available: true, category: "modern" },
  { code: "ko-KR", label: "Coreano", flag: "🇰🇷", name: "한국어", region: "Ásia", available: true, category: "modern" },
  { code: "hi-IN", label: "Hindi", flag: "🇮🇳", name: "हिन्दी", region: "Ásia", available: true, category: "modern" },
  { code: "bn-BD", label: "Bengali", flag: "🇧🇩", name: "বাংলা", region: "Ásia", available: true, category: "modern" },
  { code: "th-TH", label: "Tailandês", flag: "🇹🇭", name: "ภาษาไทย", region: "Ásia", available: true, category: "modern" },
  { code: "vi-VN", label: "Vietnamita", flag: "🇻🇳", name: "Tiếng Việt", region: "Ásia", available: true, category: "modern" },
  { code: "id-ID", label: "Indonésio", flag: "🇮🇩", name: "Bahasa Indonesia", region: "Ásia", available: true, category: "modern" },
  { code: "ms-MY", label: "Malaio", flag: "🇲🇾", name: "Bahasa Melayu", region: "Ásia", available: true, category: "modern" },
  { code: "tl-PH", label: "Filipino", flag: "🇵🇭", name: "Filipino", region: "Ásia", available: true, category: "modern" },
  { code: "ur-PK", label: "Urdu", flag: "🇵🇰", name: "اردو", region: "Ásia", available: true, category: "modern" },
  { code: "fa-IR", label: "Persa", flag: "🇮🇷", name: "فارسی", region: "Ásia", available: true, category: "modern" },
  { code: "ne-NP", label: "Nepali", flag: "🇳🇵", name: "नेपाली", region: "Ásia", available: true, category: "modern" },
  { code: "si-LK", label: "Cingalês", flag: "🇱🇰", name: "සිංහල", region: "Ásia", available: true, category: "modern" },
  // Oriente Médio / África
  { code: "ar-SA", label: "Árabe (Saudita)", flag: "🇸🇦", name: "العربية", region: "Oriente Médio", available: true, category: "modern" },
  { code: "ar-EG", label: "Árabe (Egito)", flag: "🇪🇬", name: "العربية (مصر)", region: "Oriente Médio", available: true, category: "modern" },
  { code: "he-IL", label: "Hebraico", flag: "🇮🇱", name: "עברית", region: "Oriente Médio", available: true, category: "modern" },
  { code: "sw-KE", label: "Suaíli", flag: "🇰🇪", name: "Kiswahili", region: "África", available: true, category: "modern" },
  { code: "af-ZA", label: "Africâner", flag: "🇿🇦", name: "Afrikaans", region: "África", available: true, category: "modern" },
  { code: "am-ET", label: "Amárico", flag: "🇪🇹", name: "አማርኛ", region: "África", available: true, category: "modern" },
  { code: "yo-NG", label: "Iorubá", flag: "🇳🇬", name: "Yorùbá", region: "África", available: true, category: "modern" },
  { code: "ha-NG", label: "Hauçá", flag: "🇳🇬", name: "Hausa", region: "África", available: true, category: "modern" },
  // América
  { code: "pt-BR", label: "Português (Brasil)", flag: "🇧🇷", name: "Português (BR)", region: "América", available: true, category: "modern" },
  { code: "es-AR", label: "Espanhol (Argentina)", flag: "🇦🇷", name: "Español (AR)", region: "América", available: true, category: "modern" },
  { code: "es-CO", label: "Espanhol (Colômbia)", flag: "🇨🇴", name: "Español (CO)", region: "América", available: true, category: "modern" },
  { code: "fr-CA", label: "Francês (Canadá)", flag: "🇨🇦", name: "Français (CA)", region: "América", available: true, category: "modern" },
  // Outros Europeus
  { code: "is-IS", label: "Islandês", flag: "🇮🇸", name: "Íslenska", region: "Europa", available: true, category: "modern" },
  { code: "mt-MT", label: "Maltês", flag: "🇲🇹", name: "Malti", region: "Europa", available: true, category: "modern" },
  { code: "cy-GB", label: "Galês", flag: "🏴", name: "Cymraeg", region: "Europa", available: true, category: "modern" },
];

// ── IDIOMAS MODERNOS EM BREVE ──────────────────────────────────────────────
const MODERN_COMING_SOON: Language[] = [
  // Ásia (em breve)
  { code: "km-KH", label: "Khmer", flag: "🇰🇭", name: "ខ្មែរ", region: "Ásia", available: false, category: "modern" },
  { code: "lo-LA", label: "Lao", flag: "🇱🇦", name: "ລາວ", region: "Ásia", available: false, category: "modern" },
  { code: "my-MM", label: "Birmanês", flag: "🇲🇲", name: "မြန်မာ", region: "Ásia", available: false, category: "modern" },
  { code: "km-KM", label: "Cazaque", flag: "🇰🇿", name: "Қазақша", region: "Ásia", available: false, category: "modern" },
  { code: "uz-UZ", label: "Uzbeque", flag: "🇺🇿", name: "Oʻzbekcha", region: "Ásia", available: false, category: "modern" },
  { code: "mn-MN", label: "Mongol", flag: "🇲🇳", name: "Монгол", region: "Ásia", available: false, category: "modern" },
  { code: "ka-GE", label: "Georgiano", flag: "🇬🇪", name: "ქართული", region: "Ásia", available: false, category: "modern" },
  { code: "hy-AM", label: "Armênio", flag: "🇦🇲", name: "Հայերեն", region: "Ásia", available: false, category: "modern" },
  { code: "az-AZ", label: "Azerbaijano", flag: "🇦🇿", name: "Azərbaycanca", region: "Ásia", available: false, category: "modern" },
  { code: "ps-AF", label: "Pashto", flag: "🇦🇫", name: "پښتو", region: "Ásia", available: false, category: "modern" },
  { code: "ku-TR", label: "Curdo", flag: "🏳️", name: "Kurdî", region: "Oriente Médio", available: false, category: "modern" },
  { code: "tg-TJ", label: "Tadjique", flag: "🇹🇯", name: "Тоҷикӣ", region: "Ásia", available: false, category: "modern" },
  { code: "tk-TM", label: "Turcomeno", flag: "🇹🇲", name: "Türkmen", region: "Ásia", available: false, category: "modern" },
  { code: "ky-KG", label: "Quirguiz", flag: "🇰🇬", name: "Кыргызча", region: "Ásia", available: false, category: "modern" },
  // Europa (em breve)
  { code: "sl-SI", label: "Esloveno", flag: "🇸🇮", name: "Slovenščina", region: "Europa", available: false, category: "modern" },
  { code: "lt-LT", label: "Lituano", flag: "🇱🇹", name: "Lietuvių", region: "Europa", available: false, category: "modern" },
  { code: "lv-LV", label: "Letão", flag: "🇱🇻", name: "Latviešu", region: "Europa", available: false, category: "modern" },
  { code: "et-EE", label: "Estoniano", flag: "🇪🇪", name: "Eesti", region: "Europa", available: false, category: "modern" },
  { code: "ga-IE", label: "Irlandês", flag: "🇮🇪", name: "Gaeilge", region: "Europa", available: false, category: "modern" },
  { code: "gd-GB", label: "Gaélico Escocês", flag: "🏴", name: "Gàidhlig", region: "Europa", available: false, category: "modern" },
  { code: "fo-FO", label: "Feroês", flag: "🇫🇴", name: "Føroyskt", region: "Europa", available: false, category: "modern" },
  { code: "br-FR", label: "Bretão", flag: "🇫🇷", name: "Brezhoneg", region: "Europa", available: false, category: "modern" },
  { code: "co-FR", label: "Corsicano", flag: "🇫🇷", name: "Corsu", region: "Europa", available: false, category: "modern" },
  { code: "rm-CH", label: "Romanche", flag: "🇨🇭", name: "Rumantsch", region: "Europa", available: false, category: "modern" },
  { code: "lb-LU", label: "Luxemburguês", flag: "🇱🇺", name: "Lëtzebuergesch", region: "Europa", available: false, category: "modern" },
  { code: "fy-NL", label: "Frísio", flag: "🇳🇱", name: "Frysk", region: "Europa", available: false, category: "modern" },
  // África (em breve)
  { code: "zu-ZA", label: "Zulu", flag: "🇿🇦", name: "isiZulu", region: "África", available: false, category: "modern" },
  { code: "xh-ZA", label: "Xhosa", flag: "🇿🇦", name: "isiXhosa", region: "África", available: false, category: "modern" },
  { code: "st-ZA", label: "Soto do Sul", flag: "🇿🇦", name: "Sesotho", region: "África", available: false, category: "modern" },
  { code: "tn-ZA", label: "Tswana", flag: "🇿🇦", name: "Setswana", region: "África", available: false, category: "modern" },
  { code: "lg-UG", label: "Luganda", flag: "🇺🇬", name: "Luganda", region: "África", available: false, category: "modern" },
  { code: "sn-ZW", label: "Shona", flag: "🇿🇼", name: "ChiShona", region: "África", available: false, category: "modern" },
  { code: "ny-MW", label: "Nianja", flag: "🇲🇼", name: "Chichewa", region: "África", available: false, category: "modern" },
  { code: "mg-MG", label: "Malgaxe", flag: "🇲🇬", name: "Malagasy", region: "África", available: false, category: "modern" },
  { code: "so-SO", label: "Somali", flag: "🇸🇴", name: "Soomaali", region: "África", available: false, category: "modern" },
  { code: "ig-NG", label: "Ibo", flag: "🇳🇬", name: "Igbo", region: "África", available: false, category: "modern" },
  { code: "ti-ET", label: "Tigrínia", flag: "🇪🇹", name: "ትግርኛ", region: "África", available: false, category: "modern" },
  { code: "om-ET", label: "Oromo", flag: "🇪🇹", name: "Oromoo", region: "África", available: false, category: "modern" },
  { code: "rw-RW", label: "Kinyarwanda", flag: "🇷🇼", name: "Kinyarwanda", region: "África", available: false, category: "modern" },
  // Oceania (em breve)
  { code: "mi-NZ", label: "Maori", flag: "🇳🇿", name: "Te Reo Māori", region: "Oceania", available: false, category: "modern" },
  { code: "haw-US", label: "Havaiano", flag: "🇺🇸", name: "ʻŌlelo Hawaiʻi", region: "Oceania", available: false, category: "modern" },
  { code: "sm-WS", label: "Samoano", flag: "🇼🇸", name: "Gagana Sāmoa", region: "Oceania", available: false, category: "modern" },
  { code: "fj-FJ", label: "Fijiano", flag: "🇫🇯", name: "Vosa Vakaviti", region: "Oceania", available: false, category: "modern" },
  { code: "to-TO", label: "Tonganês", flag: "🇹🇴", name: "Lea Faka-Tonga", region: "Oceania", available: false, category: "modern" },
  // América (em breve)
  { code: "ht-HT", label: "Haitiano", flag: "🇭🇹", name: "Kreyòl Ayisyen", region: "América", available: false, category: "modern" },
  // Outros
  { code: "ta-IN", label: "Tâmil", flag: "🇮🇳", name: "தமிழ்", region: "Ásia", available: false, category: "modern" },
  { code: "te-IN", label: "Télugo", flag: "🇮🇳", name: "తెలుగు", region: "Ásia", available: false, category: "modern" },
  { code: "kn-IN", label: "Canarês", flag: "🇮🇳", name: "ಕನ್ನಡ", region: "Ásia", available: false, category: "modern" },
  { code: "ml-IN", label: "Malaiala", flag: "🇮🇳", name: "മലയാളം", region: "Ásia", available: false, category: "modern" },
  { code: "mr-IN", label: "Marata", flag: "🇮🇳", name: "मराठी", region: "Ásia", available: false, category: "modern" },
  { code: "pa-IN", label: "Punjabi", flag: "🇮🇳", name: "ਪੰਜਾਬੀ", region: "Ásia", available: false, category: "modern" },
  { code: "gu-IN", label: "Guzerate", flag: "🇮🇳", name: "ગુજરાતી", region: "Ásia", available: false, category: "modern" },
  { code: "or-IN", label: "Oriá", flag: "🇮🇳", name: "ଓଡ଼ିଆ", region: "Ásia", available: false, category: "modern" },
  { code: "as-IN", label: "Assamês", flag: "🇮🇳", name: "অসমীয়া", region: "Ásia", available: false, category: "modern" },
  { code: "sa-IN", label: "Sânscrito", flag: "🇮🇳", name: "संस्कृतम्", region: "Ásia", available: false, category: "ancient" },
];

// ── IDIOMAS ANTIGOS (em breve) ─────────────────────────────────────────────
const ANCIENT_LANGUAGES: Language[] = [
  { code: "la-LATIN", label: "Latim", flag: "🏛️", name: "Latina", region: "Europa Antiga", available: false, category: "ancient" },
  { code: "grc-GR", label: "Grego Antigo", flag: "🏺", name: "Ἀρχαία Ἑλληνική", region: "Europa Antiga", available: false, category: "ancient" },
  { code: "hbo-IL", label: "Hebraico Bíblico", flag: "📜", name: "לשון הקודש", region: "Oriente Médio Antigo", available: false, category: "ancient" },
  { code: "arc-IL", label: "Aramaico", flag: "📜", name: "ܐܪܡܝܐ", region: "Oriente Médio Antigo", available: false, category: "ancient" },
  { code: "egy-EG", label: "Egípcio Antigo", flag: "𓂀", name: "𓂋𓅓𓀂𓏏𓅓𓂝𓂀", region: "África Antiga", available: false, category: "ancient" },
  { code: "ae-IR", label: "Avéstico", flag: "🔥", name: "𐬀𐬬𐬆𐬯𐬙𐬀𐬥", region: "Ásia Antiga", available: false, category: "ancient" },
  { code: "got-GOT", label: "Gótico", flag: "🛡️", name: "𐌲𐌿𐍄𐌹𐍃𐌺𐌰", region: "Europa Antiga", available: false, category: "ancient" },
  { code: "xcn-MX", label: "Náhuatl Clássico", flag: "🪶", name: "Nāhuatlahtōlli", region: "América Antiga", available: false, category: "ancient" },
  { code: "xma-MY", label: "Maia Clássico", flag: "𓆙", name: "Maya Tz'ib", region: "América Antiga", available: false, category: "ancient" },
  { code: "xog-OG", label: "Gótico Bíblico", flag: "📖", name: "Gothic Biblicus", region: "Europa Antiga", available: false, category: "ancient" },
];

// ── IDIOMAS INDÍGENAS (em breve) ──────────────────────────────────────────
const INDIGENOUS_LANGUAGES: Language[] = [
  { code: "tpw-BR", label: "Tupi-Guarani", flag: "🪶", name: "Tupi-Guarani", region: "América", available: false, category: "indigenous" },
  { code: "gn-PY", label: "Guarani (Paraguai)", flag: "🇵🇾", name: "Avañe'ẽ", region: "América", available: false, category: "indigenous" },
  { code: "qu-PE", label: "Quíchua (Peru)", flag: "🇵🇪", name: "Runa Simi", region: "América", available: false, category: "indigenous" },
  { code: "ay-BO", label: "Aimará (Bolívia)", flag: "🇧🇴", name: "Aymar aru", region: "América", available: false, category: "indigenous" },
  { code: "nah-MX", label: "Náhuatl", flag: "🇲🇽", name: "Nāhuatlahtōlli", region: "América", available: false, category: "indigenous" },
  { code: "myn-MX", label: "Maia (Iucateque)", flag: "🇲🇽", name: "Maaya T'aan", region: "América", available: false, category: "indigenous" },
  { code: "map-CL", label: "Mapudungun", flag: "🇨🇱", name: "Mapudungun", region: "América", available: false, category: "indigenous" },
  { code: "gun-BR", label: "Mbyá-Guarani", flag: "🇧🇷", name: "Ava Guarani", region: "América", available: false, category: "indigenous" },
  { code: "xav-BR", label: "Xavante", flag: "🇧🇷", name: "A'uwe Uptabi", region: "América", available: false, category: "indigenous" },
  { code: "yan-BR", label: "Yanomami", flag: "🇧🇷", name: "Yanõmami", region: "América", available: false, category: "indigenous" },
  { code: "nav-US", label: "Navajo", flag: "🇺🇸", name: "Diné Bizaad", region: "América", available: false, category: "indigenous" },
  { code: "cre-CA", label: "Cree", flag: "🇨🇦", name: "Nēhiyawēwin", region: "América", available: false, category: "indigenous" },
  { code: "gla-CA", label: "Inuktitut", flag: "🇨🇦", name: "ᐃᓄᒃᑎᑑᑦ", region: "América", available: false, category: "indigenous" },
  { code: "qub-BO", label: "Quíchua (Bolívia)", flag: "🇧🇴", name: "Runa Simi", region: "América", available: false, category: "indigenous" },
  { code: "zro-EC", label: "Záparo", flag: "🇪🇨", name: "Záparo", region: "América", available: false, category: "indigenous" },
  { code: "pau-BR", label: "Pataxó", flag: "🇧🇷", name: "Pataxó", region: "América", available: false, category: "indigenous" },
];

// ── IDIOMAS CONSTRUÍDOS (em breve) ─────────────────────────────────────────
const CONSTRUCTED_LANGUAGES: Language[] = [
  { code: "eo-EO", label: "Esperanto", flag: "🌍", name: "Esperanto", region: "Internacional", available: false, category: "constructed" },
  { code: "ia-IA", label: "Interlingua", flag: "🌐", name: "Interlingua", region: "Internacional", available: false, category: "constructed" },
  { code: "tok-PG", label: "Tok Pisin", flag: "🇵🇬", name: "Tok Pisin", region: "Oceania", available: false, category: "constructed" },
  { code: "jbo-JBO", label: "Lojban", flag: "🧮", name: "la .lojban.", region: "Internacional", available: false, category: "constructed" },

];

// ── LISTA COMPLETA: 143 IDIOMAS ────────────────────────────────────────────
export const LANGUAGES_57: Language[] = [
  ...MODERN_AVAILABLE,
  ...MODERN_COMING_SOON,
  ...ANCIENT_LANGUAGES,
  ...INDIGENOUS_LANGUAGES,
  ...CONSTRUCTED_LANGUAGES,
];

// Idiomas agrupados por região para o seletor
export const LANGUAGES_BY_REGION: Record<string, Language[]> = LANGUAGES_57.reduce((acc, lang) => {
  if (!acc[lang.region]) acc[lang.region] = [];
  acc[lang.region].push(lang);
  return acc;
}, {} as Record<string, Language[]>);

export const REGIONS = [
  "América", "Europa", "Ásia", "Oriente Médio", "África", "Oceania",
  "Europa/Ásia", "Europa Antiga", "Oriente Médio Antigo", "África Antiga",
  "Ásia Antiga", "América Antiga", "Internacional"
];

// Idiomas mais populares para seleção rápida
export const POPULAR_LANGUAGES = LANGUAGES_57.filter(l =>
  ["en-US","es-ES","fr-FR","de-DE","it-IT","ja-JP","zh-CN","ko-KR","ru-RU","ar-SA","pt-PT","hi-IN","pt-BR"].includes(l.code)
);

// Idiomas disponíveis agora
export const AVAILABLE_LANGUAGES = LANGUAGES_57.filter(l => l.available);

// Idiomas em breve
export const COMING_SOON_LANGUAGES = LANGUAGES_57.filter(l => !l.available);

// Total de idiomas
export const TOTAL_LANGUAGES = LANGUAGES_57.length; // 143
