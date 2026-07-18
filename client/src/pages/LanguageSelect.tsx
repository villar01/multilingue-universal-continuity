/**
 * LanguageSelect.tsx — MultiLingue Universal
 * Fluxo 2 etapas:
 *   1. Confirmar idioma nativo (detectado automaticamente)
 *   2. Escolher idioma para estudar (56 bandeiras — exclui o nativo)
 *
 * Perguntas exibidas em DOIS idiomas: nativo do usuário + inglês
 * Design leve: apenas emojis de bandeira + CSS, sem bibliotecas extras
 */
import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, CheckCircle2, Globe } from "lucide-react";
import { detectNativeLang, saveNativeLang, LANG_MAP } from "@/lib/detect-native-lang";

// ── Lista completa dos 69 idiomas ────────────────────────────────────────────
export const LANGUAGE_LIST = [
  { num: 1,  sub: "",  country: "Brazil",              language: "Portuguese (Brazilian)",   flag: "🇧🇷", langCode: "pt-BR", nativeName: "Português (Brasil)" },
  { num: 2,  sub: "",  country: "United States",       language: "English (American)",       flag: "🇺🇸", langCode: "en-US", nativeName: "English (US)" },
  { num: 3,  sub: "",  country: "United Kingdom",      language: "English (British)",        flag: "🇬🇧", langCode: "en-GB", nativeName: "English (UK)" },
  { num: 4,  sub: "",  country: "France",              language: "French",                   flag: "🇫🇷", langCode: "fr-FR", nativeName: "Français" },
  { num: 5,  sub: "",  country: "Spain",               language: "Spanish (Spain)",          flag: "🇪🇸", langCode: "es-ES", nativeName: "Español (España)" },
  { num: 6,  sub: "",  country: "Mexico",              language: "Spanish (Mexican)",        flag: "🇲🇽", langCode: "es-MX", nativeName: "Español (México)" },
  { num: 7,  sub: "",  country: "Germany",             language: "German",                   flag: "🇩🇪", langCode: "de-DE", nativeName: "Deutsch" },
  { num: 8,  sub: "",  country: "Italy",               language: "Italian",                  flag: "🇮🇹", langCode: "it-IT", nativeName: "Italiano" },
  { num: 9,  sub: "",  country: "Japan",               language: "Japanese",                 flag: "🇯🇵", langCode: "ja-JP", nativeName: "日本語" },
  { num: 10, sub: "A", country: "China",               language: "Mandarin (Simplified)",    flag: "🇨🇳", langCode: "zh-CN", nativeName: "普通话 (简体)" },
  { num: 10, sub: "B", country: "China / Taiwan",      language: "Mandarin (Traditional)",   flag: "🇹🇼", langCode: "zh-TW", nativeName: "普通話 (繁體)" },
  { num: 11, sub: "",  country: "Russia",              language: "Russian",                  flag: "🇷🇺", langCode: "ru-RU", nativeName: "Русский" },
  { num: 12, sub: "",  country: "South Korea",         language: "Korean",                   flag: "🇰🇷", langCode: "ko-KR", nativeName: "한국어" },
  { num: 13, sub: "",  country: "Saudi Arabia",        language: "Arabic (Modern Standard)", flag: "🇸🇦", langCode: "ar-SA", nativeName: "العربية" },
  { num: 14, sub: "",  country: "Egypt",               language: "Arabic (Egyptian)",        flag: "🇪🇬", langCode: "ar-EG", nativeName: "العربية المصرية" },
  { num: 15, sub: "",  country: "Portugal",            language: "Portuguese (European)",    flag: "🇵🇹", langCode: "pt-PT", nativeName: "Português (Portugal)" },
  { num: 16, sub: "",  country: "Netherlands",         language: "Dutch",                    flag: "🇳🇱", langCode: "nl-NL", nativeName: "Nederlands" },
  { num: 17, sub: "",  country: "Poland",              language: "Polish",                   flag: "🇵🇱", langCode: "pl-PL", nativeName: "Polski" },
  { num: 18, sub: "",  country: "Sweden",              language: "Swedish",                  flag: "🇸🇪", langCode: "sv-SE", nativeName: "Svenska" },
  { num: 19, sub: "",  country: "Norway",              language: "Norwegian",                flag: "🇳🇴", langCode: "nb-NO", nativeName: "Norsk" },
  { num: 20, sub: "",  country: "Denmark",             language: "Danish",                   flag: "🇩🇰", langCode: "da-DK", nativeName: "Dansk" },
  { num: 21, sub: "",  country: "Finland",             language: "Finnish",                  flag: "🇫🇮", langCode: "fi-FI", nativeName: "Suomi" },
  { num: 22, sub: "",  country: "Greece",              language: "Greek",                    flag: "🇬🇷", langCode: "el-GR", nativeName: "Ελληνικά" },
  { num: 23, sub: "",  country: "Turkey",              language: "Turkish",                  flag: "🇹🇷", langCode: "tr-TR", nativeName: "Türkçe" },
  { num: 24, sub: "A", country: "India",               language: "Hindi",                    flag: "🇮🇳", langCode: "hi-IN", nativeName: "हिन्दी" },
  { num: 24, sub: "B", country: "India",               language: "Tamil",                    flag: "🇮🇳", langCode: "ta-IN", nativeName: "தமிழ்" },
  { num: 25, sub: "",  country: "Indonesia",           language: "Indonesian",               flag: "🇮🇩", langCode: "id-ID", nativeName: "Bahasa Indonesia" },
  { num: 26, sub: "",  country: "Malaysia",            language: "Malay",                    flag: "🇲🇾", langCode: "ms-MY", nativeName: "Bahasa Melayu" },
  { num: 27, sub: "",  country: "Thailand",            language: "Thai",                     flag: "🇹🇭", langCode: "th-TH", nativeName: "ภาษาไทย" },
  { num: 28, sub: "",  country: "Vietnam",             language: "Vietnamese",               flag: "🇻🇳", langCode: "vi-VN", nativeName: "Tiếng Việt" },
  { num: 29, sub: "",  country: "Philippines",         language: "Filipino (Tagalog)",       flag: "🇵🇭", langCode: "fil-PH", nativeName: "Filipino" },
  { num: 30, sub: "",  country: "Israel",              language: "Hebrew",                   flag: "🇮🇱", langCode: "he-IL", nativeName: "עברית" },
  { num: 31, sub: "",  country: "Iran",                language: "Persian (Farsi)",          flag: "🇮🇷", langCode: "fa-IR", nativeName: "فارسی" },
  { num: 32, sub: "",  country: "Ukraine",             language: "Ukrainian",                flag: "🇺🇦", langCode: "uk-UA", nativeName: "Українська" },
  { num: 33, sub: "",  country: "Czech Republic",      language: "Czech",                    flag: "🇨🇿", langCode: "cs-CZ", nativeName: "Čeština" },
  { num: 34, sub: "A", country: "Switzerland",         language: "Swiss German",             flag: "🇨🇭", langCode: "de-CH", nativeName: "Schweizerdeutsch" },
  { num: 34, sub: "B", country: "Switzerland",         language: "Swiss French",             flag: "🇨🇭", langCode: "fr-CH", nativeName: "Français (Suisse)" },
  { num: 34, sub: "C", country: "Switzerland",         language: "Swiss Italian",            flag: "🇨🇭", langCode: "it-CH", nativeName: "Italiano (Svizzera)" },
  { num: 35, sub: "A", country: "Belgium",             language: "Belgian French",           flag: "🇧🇪", langCode: "fr-BE", nativeName: "Français (Belgique)" },
  { num: 35, sub: "B", country: "Belgium",             language: "Flemish (Dutch)",          flag: "🇧🇪", langCode: "nl-BE", nativeName: "Vlaams" },
  { num: 36, sub: "A", country: "Canada",              language: "English (Canadian)",       flag: "🇨🇦", langCode: "en-CA", nativeName: "English (Canada)" },
  { num: 36, sub: "B", country: "Canada",              language: "French (Canadian)",        flag: "🇨🇦", langCode: "fr-CA", nativeName: "Français (Canada)" },
  { num: 37, sub: "",  country: "Australia",           language: "English (Australian)",     flag: "🇦🇺", langCode: "en-AU", nativeName: "English (Australia)" },
  { num: 38, sub: "",  country: "Argentina",           language: "Spanish (Rioplatense)",    flag: "🇦🇷", langCode: "es-AR", nativeName: "Español (Argentina)" },
  { num: 39, sub: "",  country: "Colombia",            language: "Spanish (Colombian)",      flag: "🇨🇴", langCode: "es-CO", nativeName: "Español (Colombia)" },
  { num: 40, sub: "",  country: "Romania",             language: "Romanian",                 flag: "🇷🇴", langCode: "ro-RO", nativeName: "Română" },
  { num: 41, sub: "",  country: "Hungary",             language: "Hungarian",                flag: "🇭🇺", langCode: "hu-HU", nativeName: "Magyar" },
  { num: 42, sub: "",  country: "Slovakia",            language: "Slovak",                   flag: "🇸🇰", langCode: "sk-SK", nativeName: "Slovenčina" },
  { num: 43, sub: "",  country: "Croatia",             language: "Croatian",                 flag: "🇭🇷", langCode: "hr-HR", nativeName: "Hrvatski" },
  { num: 44, sub: "",  country: "Serbia",              language: "Serbian",                  flag: "🇷🇸", langCode: "sr-RS", nativeName: "Српски" },
  { num: 45, sub: "",  country: "Bulgaria",            language: "Bulgarian",                flag: "🇧🇬", langCode: "bg-BG", nativeName: "Български" },
  { num: 46, sub: "",  country: "Lithuania",           language: "Lithuanian",               flag: "🇱🇹", langCode: "lt-LT", nativeName: "Lietuvių" },
  { num: 47, sub: "",  country: "Latvia",              language: "Latvian",                  flag: "🇱🇻", langCode: "lv-LV", nativeName: "Latviešu" },
  { num: 48, sub: "",  country: "Estonia",             language: "Estonian",                 flag: "🇪🇪", langCode: "et-EE", nativeName: "Eesti" },
  { num: 49, sub: "",  country: "Nigeria",             language: "Yoruba",                   flag: "🇳🇬", langCode: "yo-NG", nativeName: "Yorùbá" },
  { num: 50, sub: "A", country: "South Africa",        language: "Zulu",                     flag: "🇿🇦", langCode: "zu-ZA", nativeName: "isiZulu" },
  { num: 50, sub: "B", country: "South Africa",        language: "Afrikaans",                flag: "🇿🇦", langCode: "af-ZA", nativeName: "Afrikaans" },
  { num: 51, sub: "",  country: "Ethiopia",            language: "Amharic",                  flag: "🇪🇹", langCode: "am-ET", nativeName: "አማርኛ" },
  { num: 52, sub: "",  country: "Kenya",               language: "Swahili",                  flag: "🇰🇪", langCode: "sw-KE", nativeName: "Kiswahili" },
  { num: 53, sub: "",  country: "Pakistan",            language: "Urdu",                     flag: "🇵🇰", langCode: "ur-PK", nativeName: "اردو" },
  { num: 54, sub: "",  country: "Bangladesh",          language: "Bengali",                  flag: "🇧🇩", langCode: "bn-BD", nativeName: "বাংলা" },
  { num: 55, sub: "",  country: "Nepal",               language: "Nepali",                   flag: "🇳🇵", langCode: "ne-NP", nativeName: "नेपाली" },
  { num: 56, sub: "",  country: "Mongolia",            language: "Mongolian",                flag: "🇲🇳", langCode: "mn-MN", nativeName: "Монгол" },
  { num: 57, sub: "",  country: "New Zealand",         language: "English (NZ) / Māori",     flag: "🇳🇿", langCode: "en-NZ", nativeName: "English (NZ)" },
] as const;

export type LanguageEntry = (typeof LANGUAGE_LIST)[number];

// ── Mapa: código BCP-47 → pergunta "Qual idioma quer estudar?" no idioma nativo ──
const STUDY_QUESTION: Record<string, string> = {
  "pt-BR": "Qual idioma você quer estudar?",
  "pt-PT": "Qual idioma deseja estudar?",
  "en-US": "Which language do you want to study?",
  "en-GB": "Which language would you like to study?",
  "en-AU": "Which language would you like to study?",
  "en-CA": "Which language would you like to study?",
  "en-NZ": "Which language would you like to study?",
  "es-ES": "¿Qué idioma quieres estudiar?",
  "es-MX": "¿Qué idioma quieres estudiar?",
  "es-AR": "¿Qué idioma querés estudiar?",
  "es-CO": "¿Qué idioma quieres estudiar?",
  "fr-FR": "Quelle langue voulez-vous étudier ?",
  "fr-CA": "Quelle langue voulez-vous étudier ?",
  "fr-BE": "Quelle langue voulez-vous étudier ?",
  "fr-CH": "Quelle langue voulez-vous étudier ?",
  "de-DE": "Welche Sprache möchten Sie lernen?",
  "de-CH": "Welche Sprache möchten Sie lernen?",
  "it-IT": "Quale lingua vuoi studiare?",
  "it-CH": "Quale lingua vuoi studiare?",
  "ja-JP": "どの言語を勉強したいですか？",
  "zh-CN": "您想学习哪种语言？",
  "zh-TW": "您想學習哪種語言？",
  "ko-KR": "어떤 언어를 공부하고 싶으신가요?",
  "ru-RU": "Какой язык вы хотите изучать?",
  "ar-SA": "ما اللغة التي تريد دراستها؟",
  "ar-EG": "إيه اللغة اللي عايز تتعلمها؟",
  "hi-IN": "आप कौन सी भाषा सीखना चाहते हैं?",
  "ta-IN": "நீங்கள் எந்த மொழி படிக்க விரும்புகிறீர்கள்?",
  "nl-NL": "Welke taal wil je studeren?",
  "nl-BE": "Welke taal wil je studeren?",
  "pl-PL": "Jakiego języka chcesz się uczyć?",
  "sv-SE": "Vilket språk vill du studera?",
  "nb-NO": "Hvilket språk vil du studere?",
  "da-DK": "Hvilket sprog vil du studere?",
  "fi-FI": "Mitä kieltä haluat opiskella?",
  "el-GR": "Ποια γλώσσα θέλεις να μάθεις;",
  "tr-TR": "Hangi dili öğrenmek istiyorsunuz?",
  "uk-UA": "Яку мову ви хочете вивчати?",
  "cs-CZ": "Jaký jazyk chcete studovat?",
  "hu-HU": "Melyik nyelvet szeretné tanulni?",
  "ro-RO": "Ce limbă vrei să studiezi?",
  "bg-BG": "Какъв език искате да учите?",
  "hr-HR": "Koji jezik želite učiti?",
  "sk-SK": "Aký jazyk chcete študovať?",
  "sl-SI": "Kateri jezik želite študirati?",
  "et-EE": "Millist keelt soovite õppida?",
  "lv-LV": "Kādu valodu vēlaties mācīties?",
  "lt-LT": "Kokią kalbą norite mokytis?",
  "vi-VN": "Bạn muốn học ngôn ngữ nào?",
  "id-ID": "Bahasa apa yang ingin Anda pelajari?",
  "ms-MY": "Bahasa apa yang anda ingin belajar?",
  "th-TH": "คุณต้องการเรียนภาษาอะไร?",
  "fil-PH": "Anong wika ang gusto mong pag-aralan?",
  "he-IL": "?איזו שפה אתה רוצה ללמוד",
  "fa-IR": "می‌خواهید کدام زبان را یاد بگیرید؟",
  "af-ZA": "Watter taal wil jy studeer?",
  "sw-KE": "Unataka kujifunza lugha gani?",
  "yo-NG": "Èdè wo ni o fẹ́ kọ́?",
  "zu-ZA": "Ufuna ukufunda ulimi luni?",
  "am-ET": "የትኛውን ቋንቋ መማር ይፈልጋሉ?",
  "ur-PK": "آپ کون سی زبان سیکھنا چاہتے ہیں؟",
  "bn-BD": "আপনি কোন ভাষা শিখতে চান?",
  "ne-NP": "तपाईं कुन भाषा सिक्न चाहनुहुन्छ?",
  "mn-MN": "Та ямар хэл сурахыг хүсч байна вэ?",
};

// ── Mapa: código → "Este é seu idioma?" no idioma nativo ──
const IS_NATIVE_QUESTION: Record<string, string> = {
  "pt-BR": "Este é o seu idioma nativo?",
  "pt-PT": "Esta é a sua língua nativa?",
  "en-US": "Is this your native language?",
  "en-GB": "Is this your native language?",
  "en-AU": "Is this your native language?",
  "en-CA": "Is this your native language?",
  "en-NZ": "Is this your native language?",
  "es-ES": "¿Es este tu idioma nativo?",
  "es-MX": "¿Es este tu idioma nativo?",
  "es-AR": "¿Es este tu idioma nativo?",
  "es-CO": "¿Es este tu idioma nativo?",
  "fr-FR": "Est-ce votre langue maternelle ?",
  "fr-CA": "Est-ce votre langue maternelle ?",
  "fr-BE": "Est-ce votre langue maternelle ?",
  "fr-CH": "Est-ce votre langue maternelle ?",
  "de-DE": "Ist das Ihre Muttersprache?",
  "de-CH": "Ist das Ihre Muttersprache?",
  "it-IT": "Questa è la tua lingua madre?",
  "it-CH": "Questa è la tua lingua madre?",
  "ja-JP": "これはあなたの母国語ですか？",
  "zh-CN": "这是您的母语吗？",
  "zh-TW": "這是您的母語嗎？",
  "ko-KR": "이것이 당신의 모국어입니까?",
  "ru-RU": "Это ваш родной язык?",
  "ar-SA": "هل هذه لغتك الأم؟",
  "ar-EG": "ده لغتك الأصلية؟",
  "hi-IN": "क्या यह आपकी मातृभाषा है?",
  "ta-IN": "இது உங்கள் தாய்மொழியா?",
  "nl-NL": "Is dit uw moedertaal?",
  "nl-BE": "Is dit uw moedertaal?",
  "pl-PL": "Czy to jest twój język ojczysty?",
  "sv-SE": "Är detta ditt modersmål?",
  "nb-NO": "Er dette ditt morsmål?",
  "da-DK": "Er dette dit modersmål?",
  "fi-FI": "Onko tämä äidinkielesi?",
  "el-GR": "Είναι αυτή η μητρική σου γλώσσα;",
  "tr-TR": "Bu sizin ana diliniz mi?",
  "uk-UA": "Це ваша рідна мова?",
  "cs-CZ": "Je toto váš rodný jazyk?",
  "hu-HU": "Ez az Ön anyanyelve?",
  "ro-RO": "Aceasta este limba ta maternă?",
  "bg-BG": "Това ли е вашият роден език?",
  "hr-HR": "Je li ovo vaš materinski jezik?",
  "sk-SK": "Je toto váš materinský jazyk?",
  "sl-SI": "Je to vaš materni jezik?",
  "et-EE": "Kas see on teie emakeel?",
  "lv-LV": "Vai šī ir jūsu dzimtā valoda?",
  "lt-LT": "Ar tai jūsų gimtoji kalba?",
  "vi-VN": "Đây có phải ngôn ngữ mẹ đẻ của bạn không?",
  "id-ID": "Apakah ini bahasa ibu Anda?",
  "ms-MY": "Adakah ini bahasa ibunda anda?",
  "th-TH": "นี่คือภาษาแม่ของคุณหรือไม่?",
  "fil-PH": "Ito ba ang iyong katutubong wika?",
  "he-IL": "?האם זו שפת האם שלך",
  "fa-IR": "آیا این زبان مادری شماست؟",
  "af-ZA": "Is dit jou moedertaal?",
  "sw-KE": "Je, hii ni lugha yako ya kwanza?",
  "yo-NG": "Ṣé èdè ìbí rẹ ni èyí?",
  "zu-ZA": "Ingabe lolu ulimi lwakho lokuqala?",
  "am-ET": "ይህ የእናቶ ቋንቋዎ ነው?",
  "ur-PK": "کیا یہ آپ کی مادری زبان ہے؟",
  "bn-BD": "এটা কি আপনার মাতৃভাষা?",
  "ne-NP": "के यो तपाईंको मातृभाषा हो?",
  "mn-MN": "Энэ таны эх хэл үү?",
};

// ── Mapa: código → "Sim" no idioma nativo ──
const YES_LABEL: Record<string, string> = {
  "pt-BR": "Sim, é este", "pt-PT": "Sim, é este",
  "en-US": "Yes, this is it", "en-GB": "Yes, this is it", "en-AU": "Yes, this is it",
  "en-CA": "Yes, this is it", "en-NZ": "Yes, this is it",
  "es-ES": "Sí, es este", "es-MX": "Sí, es este", "es-AR": "Sí, es este", "es-CO": "Sí, es este",
  "fr-FR": "Oui, c'est ça", "fr-CA": "Oui, c'est ça", "fr-BE": "Oui, c'est ça", "fr-CH": "Oui, c'est ça",
  "de-DE": "Ja, das ist es", "de-CH": "Ja, das ist es",
  "it-IT": "Sì, è questo", "it-CH": "Sì, è questo",
  "ja-JP": "はい、そうです", "zh-CN": "是的，就是这个", "zh-TW": "是的，就是這個",
  "ko-KR": "네, 맞습니다", "ru-RU": "Да, это он", "ar-SA": "نعم، هذا هو", "ar-EG": "أيوه، ده هو",
  "hi-IN": "हाँ, यही है", "ta-IN": "ஆம், இதுதான்", "nl-NL": "Ja, dit is het", "nl-BE": "Ja, dit is het",
  "pl-PL": "Tak, to jest to", "sv-SE": "Ja, det är det", "nb-NO": "Ja, det er det",
  "da-DK": "Ja, det er det", "fi-FI": "Kyllä, se on se", "el-GR": "Ναι, αυτό είναι",
  "tr-TR": "Evet, bu o", "uk-UA": "Так, це він", "cs-CZ": "Ano, to je ono",
  "hu-HU": "Igen, ez az", "ro-RO": "Da, acesta este", "bg-BG": "Да, това е",
  "hr-HR": "Da, to je to", "sk-SK": "Áno, to je ono", "sl-SI": "Da, to je to",
  "et-EE": "Jah, see on see", "lv-LV": "Jā, tas ir tas", "lt-LT": "Taip, tai yra",
  "vi-VN": "Vâng, đúng rồi", "id-ID": "Ya, itu dia", "ms-MY": "Ya, itulah dia",
  "th-TH": "ใช่ นั่นคือมัน", "fil-PH": "Oo, iyon nga", "he-IL": "כן, זה הוא",
  "fa-IR": "بله، همین است", "af-ZA": "Ja, dit is dit", "sw-KE": "Ndiyo, hiyo ndiyo",
  "yo-NG": "Bẹ́ẹ̀ ni, ìyẹn ni", "zu-ZA": "Yebo, yilolo", "am-ET": "አዎ፣ ይህ ነው",
  "ur-PK": "ہاں، یہی ہے", "bn-BD": "হ্যাঁ, এটাই", "ne-NP": "हो, यही हो", "mn-MN": "Тийм, энэ юм",
};

// ── Mapa: código → "Não, corrigir" no idioma nativo ──
const NO_LABEL: Record<string, string> = {
  "pt-BR": "Não, corrigir", "pt-PT": "Não, corrigir",
  "en-US": "No, change it", "en-GB": "No, change it", "en-AU": "No, change it",
  "en-CA": "No, change it", "en-NZ": "No, change it",
  "es-ES": "No, cambiar", "es-MX": "No, cambiar", "es-AR": "No, cambiar", "es-CO": "No, cambiar",
  "fr-FR": "Non, changer", "fr-CA": "Non, changer", "fr-BE": "Non, changer", "fr-CH": "Non, changer",
  "de-DE": "Nein, ändern", "de-CH": "Nein, ändern",
  "it-IT": "No, cambia", "it-CH": "No, cambia",
  "ja-JP": "いいえ、変更する", "zh-CN": "不，更改", "zh-TW": "不，更改",
  "ko-KR": "아니요, 변경", "ru-RU": "Нет, изменить", "ar-SA": "لا، تغيير", "ar-EG": "لأ، غير",
  "hi-IN": "नहीं, बदलें", "ta-IN": "இல்லை, மாற்று", "nl-NL": "Nee, wijzigen", "nl-BE": "Nee, wijzigen",
  "pl-PL": "Nie, zmień", "sv-SE": "Nej, ändra", "nb-NO": "Nei, endre",
  "da-DK": "Nej, skift", "fi-FI": "Ei, muuta", "el-GR": "Όχι, αλλαγή",
  "tr-TR": "Hayır, değiştir", "uk-UA": "Ні, змінити", "cs-CZ": "Ne, změnit",
  "hu-HU": "Nem, módosítás", "ro-RO": "Nu, schimbă", "bg-BG": "Не, промяна",
  "hr-HR": "Ne, promijeni", "sk-SK": "Nie, zmeniť", "sl-SI": "Ne, spremeni",
  "et-EE": "Ei, muuda", "lv-LV": "Nē, mainīt", "lt-LT": "Ne, keisti",
  "vi-VN": "Không, thay đổi", "id-ID": "Tidak, ubah", "ms-MY": "Tidak, tukar",
  "th-TH": "ไม่ เปลี่ยน", "fil-PH": "Hindi, baguhin", "he-IL": "לא, שנה",
  "fa-IR": "نه، تغییر دهید", "af-ZA": "Nee, verander", "sw-KE": "Hapana, badilisha",
  "yo-NG": "Rárá, yípadà", "zu-ZA": "Cha, shintsha", "am-ET": "አይ፣ ቀይር",
  "ur-PK": "نہیں، تبدیل کریں", "bn-BD": "না, পরিবর্তন করুন", "ne-NP": "होइन, परिवर्तन गर्नुस्", "mn-MN": "Үгүй, өөрчлөх",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function getLangCode(code: string): string {
  // Normaliza: "pt-BR" → "pt-BR", "pt" → "pt-BR", etc.
  return code;
}

function getQ(map: Record<string, string>, code: string, fallback: string): string {
  return map[code] || map[code.split("-")[0]] || fallback;
}

// ── Componente Principal ──────────────────────────────────────────────────────
export default function LanguageSelect() {
  const [, navigate] = useLocation();

  // Detectar idioma nativo
  const detected = detectNativeLang();
  const [nativeCode, setNativeCode] = useState(detected.code);
  const [step, setStep] = useState<"confirm-native" | "choose-study" | "picking-native">(
    detected.confirmed ? "choose-study" : "confirm-native"
  );
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<LanguageEntry | null>(null);

  // Info do idioma nativo atual
  const nativeInfo = LANG_MAP[nativeCode] || {
    code: nativeCode, name: nativeCode, nameInPt: nativeCode, flag: "🌐", region: ""
  };

  // Pergunta no idioma nativo
  const nativeQuestion = getQ(STUDY_QUESTION, nativeCode, "Which language do you want to study?");
  const isNativeQuestion = getQ(IS_NATIVE_QUESTION, nativeCode, "Is this your native language?");
  const yesLabel = getQ(YES_LABEL, nativeCode, "Yes");
  const noLabel = getQ(NO_LABEL, nativeCode, "No, change");

  // Lista filtrada: exclui o idioma nativo e aplica busca
  const studyList = useMemo(() => {
    const nativeLang = nativeCode.split("-")[0].toLowerCase();
    const nativeFull = nativeCode.toLowerCase();

    let list = (LANGUAGE_LIST as unknown as LanguageEntry[]).filter(e => {
      const eLang = e.langCode.split("-")[0].toLowerCase();
      const eFull = e.langCode.toLowerCase();
      // Exclui se for o mesmo idioma (ex: pt-BR exclui pt-BR e pt-PT)
      return eLang !== nativeLang && eFull !== nativeFull;
    });

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(e =>
        `${e.num}${e.sub}`.toLowerCase() === q ||
        e.country.toLowerCase().includes(q) ||
        e.language.toLowerCase().includes(q) ||
        e.nativeName.toLowerCase().includes(q) ||
        e.flag.includes(q)
      );
    }
    return list;
  }, [nativeCode, search]);

  // Lista de todos os idiomas para escolha do nativo
  const allLangs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return LANGUAGE_LIST as unknown as LanguageEntry[];
    return (LANGUAGE_LIST as unknown as LanguageEntry[]).filter(e =>
      e.country.toLowerCase().includes(q) ||
      e.language.toLowerCase().includes(q) ||
      e.nativeName.toLowerCase().includes(q)
    );
  }, [search]);

  function confirmNative() {
    saveNativeLang(nativeCode, true);
    setStep("choose-study");
    setSearch("");
    setSelected(null);
  }

  function pickNative(entry: LanguageEntry) {
    setNativeCode(entry.langCode);
    saveNativeLang(entry.langCode, true);
    setStep("confirm-native");
    setSearch("");
  }

  function handleSelectStudy(entry: LanguageEntry) {
    setSelected(entry);
    localStorage.setItem("ml_target_lang", entry.langCode);
    localStorage.setItem("ml_target_country", entry.country);
    localStorage.setItem("ml_target_language", entry.language);
    localStorage.setItem("ml_target_flag", entry.flag);
  }

  function handleConfirmStudy() {
    if (!selected) return;
    navigate("/ar-teacher");
  }

  // ── ETAPA: Escolher idioma nativo ─────────────────────────────────────────
  if (step === "picking-native") {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gray-950/95 backdrop-blur border-b border-gray-800 px-4 py-3">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => { setStep("confirm-native"); setSearch(""); }}
              className="flex items-center gap-2 text-gray-400 hover:text-white mb-3 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back / Voltar
            </button>
            <div className="text-center mb-3">
              <p className="text-sm text-gray-300 font-medium">Select your native language</p>
              <p className="text-xs text-gray-500">Selecione seu idioma nativo</p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search / Buscar..."
                className="pl-10 bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500"
                autoFocus
              />
            </div>
          </div>
        </div>
        {/* Grid */}
        <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-4">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {allLangs.map(entry => (
              <button
                key={`${entry.num}${entry.sub}`}
                onClick={() => pickNative(entry)}
                className="flex flex-col items-center gap-1 p-3 rounded-xl bg-gray-900 hover:bg-blue-900/40 hover:border-blue-500/50 border border-transparent transition-all active:scale-95"
              >
                <span className="text-3xl leading-none">{entry.flag}</span>
                <span className="text-xs text-gray-300 text-center leading-tight font-medium line-clamp-2">
                  {entry.language}
                </span>
                <span className="text-[10px] text-gray-500 text-center leading-tight line-clamp-1">
                  {entry.country}
                </span>
              </button>
            ))}
          </div>
          {allLangs.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Globe className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No language found</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── ETAPA 1: Confirmar idioma nativo ─────────────────────────────────────
  if (step === "confirm-native") {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          {/* Logo / ícone */}
          <div className="mb-6">
            <Globe className="w-12 h-12 text-purple-400 mx-auto mb-2" />
            <h1 className="text-2xl font-bold text-white">MultiLingue Universal</h1>
          </div>

          {/* Bandeira grande */}
          <div className="mb-6">
            <div className="text-8xl mb-3 leading-none">{nativeInfo.flag}</div>
            <div className="text-xl font-bold text-white">{nativeInfo.name}</div>
            <div className="text-sm text-gray-400">{nativeInfo.region}</div>
          </div>

          {/* Pergunta em 2 idiomas */}
          <div className="mb-6 space-y-1">
            <p className="text-base font-semibold text-gray-100">{isNativeQuestion}</p>
            <p className="text-sm text-gray-400 italic">Is this your native language?</p>
          </div>

          {/* Botões */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={confirmNative}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 text-base"
            >
              <CheckCircle2 className="w-5 h-5 mr-2" />
              {yesLabel}
            </Button>
            <Button
              onClick={() => { setStep("picking-native"); setSearch(""); }}
              variant="outline"
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white py-3 text-base"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {noLabel}
            </Button>
          </div>

          <p className="mt-4 text-xs text-gray-600">
            Automatically detected from your device · Detectado automaticamente
          </p>
        </div>
      </div>
    );
  }

  // ── ETAPA 2: Escolher idioma para estudar (56 bandeiras) ─────────────────
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header sticky */}
      <div className="sticky top-0 z-10 bg-gray-950/95 backdrop-blur border-b border-gray-800 px-4 py-3">
        <div className="max-w-3xl mx-auto">
          {/* Botão voltar + idioma nativo */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => { setStep("confirm-native"); setSelected(null); setSearch(""); }}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>Native:</span>
              <span className="text-lg">{nativeInfo.flag}</span>
              <span className="text-gray-300 font-medium">{nativeInfo.name}</span>
            </div>
          </div>

          {/* Pergunta em 2 idiomas */}
          <div className="text-center mb-3">
            <h2 className="text-lg font-bold text-white">{nativeQuestion}</h2>
            <p className="text-sm text-gray-400 italic">Which language do you want to study?</p>
            <p className="text-xs text-gray-600 mt-1">
              {studyList.length} languages available · {studyList.length} idiomas disponíveis
            </p>
          </div>

          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or country... / Buscar por nome ou país..."
              className="pl-10 bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-4">

        {/* Banner de seleção confirmada */}
        {selected && (
          <div className="mb-4 p-4 rounded-xl bg-purple-600/20 border border-purple-500/50 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-4xl leading-none">{selected.flag}</span>
              <div>
                <div className="font-bold text-purple-200 text-base">{selected.language}</div>
                <div className="text-xs text-gray-400">{selected.country} · {selected.nativeName}</div>
              </div>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              <Button
                onClick={handleConfirmStudy}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-5 py-2"
              >
                Start! →
              </Button>
              <button
                onClick={() => setSelected(null)}
                className="text-xs text-gray-500 hover:text-gray-300 text-center"
              >
                ← {noLabel}
              </button>
            </div>
          </div>
        )}

        {/* Grid de bandeiras */}
        {studyList.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {studyList.map(entry => {
              const isSelected = selected?.langCode === entry.langCode;
              const hasMultiple = entry.sub !== "";
              return (
                <button
                  key={`${entry.num}${entry.sub}`}
                  onClick={() => handleSelectStudy(entry)}
                  className={`relative flex flex-col items-center gap-1 p-3 rounded-xl border transition-all active:scale-95 ${
                    isSelected
                      ? "bg-purple-600/30 border-purple-500 shadow-lg shadow-purple-900/30"
                      : "bg-gray-900 border-transparent hover:bg-gray-800 hover:border-gray-600"
                  }`}
                >
                  {/* Número */}
                  <span className={`absolute top-1 left-2 text-[10px] font-mono font-bold ${
                    isSelected ? "text-purple-300" : "text-gray-600"
                  }`}>
                    {entry.num}{entry.sub}
                  </span>
                  {/* Checkmark se selecionado */}
                  {isSelected && (
                    <CheckCircle2 className="absolute top-1 right-1 w-3.5 h-3.5 text-purple-400" />
                  )}
                  {/* Badge A/B/C para múltiplos idiomas */}
                  {hasMultiple && !isSelected && (
                    <span className="absolute top-1 right-1 text-[9px] font-bold text-yellow-400 bg-yellow-900/40 rounded px-0.5">
                      {entry.sub}
                    </span>
                  )}
                  {/* Bandeira grande */}
                  <span className="text-4xl leading-none mt-2">{entry.flag}</span>
                  {/* Nome do idioma em inglês */}
                  <span className={`text-xs text-center leading-tight font-medium line-clamp-2 mt-1 ${
                    isSelected ? "text-purple-200" : "text-gray-200"
                  }`}>
                    {entry.language}
                  </span>
                  {/* País */}
                  <span className="text-[10px] text-gray-500 text-center leading-tight line-clamp-1">
                    {entry.country}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500">
            <Globe className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-base">No language found</p>
            <p className="text-sm mt-1">Nenhum idioma encontrado para "{search}"</p>
            <button
              onClick={() => setSearch("")}
              className="mt-3 text-purple-400 hover:text-purple-300 text-sm underline"
            >
              Clear search / Limpar busca
            </button>
          </div>
        )}

        {/* Rodapé */}
        <div className="mt-8 text-center text-xs text-gray-700 pb-4">
          MultiLingue Universal · {LANGUAGE_LIST.length} languages · Your native language is excluded
        </div>
      </div>
    </div>
  );
}
