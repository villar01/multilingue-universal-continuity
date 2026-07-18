/**
 * 54 idiomas suportados pela plataforma
 */

export const LANGUAGES = [
  // Europeus (20)
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧", region: "Europe", speakers: 1500000000 },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸", region: "Europe", speakers: 559000000 },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷", region: "Europe", speakers: 280000000 },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪", region: "Europe", speakers: 134000000 },
  { code: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹", region: "Europe", speakers: 85000000 },
  { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇧🇷", region: "Europe", speakers: 264000000 },
  { code: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺", region: "Europe", speakers: 258000000 },
  { code: "pl", name: "Polish", nativeName: "Polski", flag: "🇵🇱", region: "Europe", speakers: 45000000 },
  { code: "nl", name: "Dutch", nativeName: "Nederlands", flag: "🇳🇱", region: "Europe", speakers: 25000000 },
  { code: "uk", name: "Ukrainian", nativeName: "Українська", flag: "🇺🇦", region: "Europe", speakers: 40000000 },
  { code: "cs", name: "Czech", nativeName: "Čeština", flag: "🇨🇿", region: "Europe", speakers: 13000000 },
  { code: "sv", name: "Swedish", nativeName: "Svenska", flag: "🇸🇪", region: "Europe", speakers: 13000000 },
  { code: "ro", name: "Romanian", nativeName: "Română", flag: "🇷🇴", region: "Europe", speakers: 26000000 },
  { code: "el", name: "Greek", nativeName: "Ελληνικά", flag: "🇬🇷", region: "Europe", speakers: 13000000 },
  { code: "hu", name: "Hungarian", nativeName: "Magyar", flag: "🇭🇺", region: "Europe", speakers: 13000000 },
  { code: "da", name: "Danish", nativeName: "Dansk", flag: "🇩🇰", region: "Europe", speakers: 6000000 },
  { code: "fi", name: "Finnish", nativeName: "Suomi", flag: "🇫🇮", region: "Europe", speakers: 5500000 },
  { code: "no", name: "Norwegian", nativeName: "Norsk", flag: "🇳🇴", region: "Europe", speakers: 5000000 },
  { code: "bg", name: "Bulgarian", nativeName: "Български", flag: "🇧🇬", region: "Europe", speakers: 8000000 },
  { code: "hr", name: "Croatian", nativeName: "Hrvatski", flag: "🇭🇷", region: "Europe", speakers: 7000000 },

  // Asiáticos (15)
  { code: "zh", name: "Chinese", nativeName: "中文", flag: "🇨🇳", region: "Asia", speakers: 1300000000 },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳", region: "Asia", speakers: 602000000 },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵", region: "Asia", speakers: 125000000 },
  { code: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷", region: "Asia", speakers: 81000000 },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt", flag: "🇻🇳", region: "Asia", speakers: 85000000 },
  { code: "th", name: "Thai", nativeName: "ไทย", flag: "🇹🇭", region: "Asia", speakers: 60000000 },
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia", flag: "🇮🇩", region: "Asia", speakers: 199000000 },
  { code: "ms", name: "Malay", nativeName: "Bahasa Melayu", flag: "🇲🇾", region: "Asia", speakers: 77000000 },
  { code: "tl", name: "Tagalog", nativeName: "Tagalog", flag: "🇵🇭", region: "Asia", speakers: 82000000 },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", flag: "🇧🇩", region: "Asia", speakers: 265000000 },
  { code: "ur", name: "Urdu", nativeName: "اردو", flag: "🇵🇰", region: "Asia", speakers: 230000000 },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", flag: "🇮🇳", region: "Asia", speakers: 81000000 },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", flag: "🇮🇳", region: "Asia", speakers: 95000000 },
  { code: "mr", name: "Marathi", nativeName: "मराठी", flag: "🇮🇳", region: "Asia", speakers: 83000000 },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", flag: "🇮🇳", region: "Asia", speakers: 60000000 },

  // Oriente Médio e África (10)
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦", region: "Middle East", speakers: 422000000 },
  { code: "tr", name: "Turkish", nativeName: "Türkçe", flag: "🇹🇷", region: "Middle East", speakers: 88000000 },
  { code: "fa", name: "Persian", nativeName: "فارسی", flag: "🇮🇷", region: "Middle East", speakers: 110000000 },
  { code: "he", name: "Hebrew", nativeName: "עברית", flag: "🇮🇱", region: "Middle East", speakers: 9000000 },
  { code: "sw", name: "Swahili", nativeName: "Kiswahili", flag: "🇰🇪", region: "Africa", speakers: 200000000 },
  { code: "am", name: "Amharic", nativeName: "አማርኛ", flag: "🇪🇹", region: "Africa", speakers: 57000000 },
  { code: "ha", name: "Hausa", nativeName: "Hausa", flag: "🇳🇬", region: "Africa", speakers: 77000000 },
  { code: "yo", name: "Yoruba", nativeName: "Yorùbá", flag: "🇳🇬", region: "Africa", speakers: 45000000 },
  { code: "ig", name: "Igbo", nativeName: "Igbo", flag: "🇳🇬", region: "Africa", speakers: 45000000 },
  { code: "zu", name: "Zulu", nativeName: "isiZulu", flag: "🇿🇦", region: "Africa", speakers: 27000000 },

  // Américas (5)
  { code: "pt-BR", name: "Brazilian Portuguese", nativeName: "Português Brasileiro", flag: "🇧🇷", region: "Americas", speakers: 215000000 },
  { code: "es-MX", name: "Mexican Spanish", nativeName: "Español Mexicano", flag: "🇲🇽", region: "Americas", speakers: 130000000 },
  { code: "fr-CA", name: "Canadian French", nativeName: "Français Canadien", flag: "🇨🇦", region: "Americas", speakers: 10000000 },
  { code: "qu", name: "Quechua", nativeName: "Runa Simi", flag: "🇵🇪", region: "Americas", speakers: 10000000 },
  { code: "gn", name: "Guarani", nativeName: "Avañe'ẽ", flag: "🇵🇾", region: "Americas", speakers: 6500000 },

  // Outros (4)
  { code: "af", name: "Afrikaans", nativeName: "Afrikaans", flag: "🇿🇦", region: "Africa", speakers: 7000000 },
  { code: "sq", name: "Albanian", nativeName: "Shqip", flag: "🇦🇱", region: "Europe", speakers: 7500000 },
  { code: "hy", name: "Armenian", nativeName: "Հայերեն", flag: "🇦🇲", region: "Asia", speakers: 6700000 },
  { code: "ka", name: "Georgian", nativeName: "ქართული", flag: "🇬🇪", region: "Asia", speakers: 4000000 },

  // Multi-Idiomas (Professores Especiais - 4)
  { code: "multi-ac", name: "Africa Central", nativeName: "Central Africa", flag: "🌍", region: "Africa", speakers: 200000000 },
  { code: "multi-as", name: "Asia do Sul", nativeName: "South Asia", flag: "🌏", region: "Asia", speakers: 1500000000 },
  { code: "multi-om", name: "Oriente Medio", nativeName: "Middle East", flag: "🌏", region: "Middle East", speakers: 400000000 },
  { code: "multi-en", name: "Europa Nordica", nativeName: "Nordic Europe", flag: "🌍", region: "Europe", speakers: 50000000 },
];
