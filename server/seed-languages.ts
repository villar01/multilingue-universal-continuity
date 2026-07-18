/**
 * SEED SCRIPT: 50+ IDIOMAS DO MUNDO
 * Popular banco de dados com todos os principais idiomas
 * Configurar vozes ElevenLabs para cada idioma
 */

import { getDb } from "./db";
import { languages } from "../drizzle/schema";

const WORLD_LANGUAGES = [
  // Tier 1: Idiomas mais populares (20)
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧", elevenLabsVoiceId: "21m00Tcm4TlvDq8ikWAM", elevenLabsVoiceName: "Rachel" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸", elevenLabsVoiceId: "VR6AewLTigWG4xSOukaG", elevenLabsVoiceName: "Arnold" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷", elevenLabsVoiceId: "ThT5KcBeYPX3keUQqHPh", elevenLabsVoiceName: "Dorothy" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪", elevenLabsVoiceId: "yoZ06aMxZJJ28mfd3POQ", elevenLabsVoiceName: "Sam" },
  { code: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹", elevenLabsVoiceId: "AZnzlk1XvdvUeBnXmlld", elevenLabsVoiceName: "Domi" },
  { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇧🇷", elevenLabsVoiceId: "pNInz6obpgDQGcFmaJgB", elevenLabsVoiceName: "Adam" },
  { code: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺", elevenLabsVoiceId: "EXAVITQu4vr4xnSDxMaL", elevenLabsVoiceName: "Bella" },
  { code: "zh", name: "Chinese (Mandarin)", nativeName: "中文", flag: "🇨🇳", elevenLabsVoiceId: "XB0fDUnXU5powFXDhCwa", elevenLabsVoiceName: "Charlotte" },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵", elevenLabsVoiceId: "IKne3meq5aSn9XLyUdCD", elevenLabsVoiceName: "Charlie" },
  { code: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷", elevenLabsVoiceId: "onwK4e9ZLuTAKqWW03F9", elevenLabsVoiceName: "Daniel" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦", elevenLabsVoiceId: "TxGEqnHWrfWFTfGW9XjX", elevenLabsVoiceName: "Josh" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳", elevenLabsVoiceId: "ErXwobaYiN019PkySvjV", elevenLabsVoiceName: "Antoni" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe", flag: "🇹🇷", elevenLabsVoiceId: "GBv7mTt0atIp3Br8iCZE", elevenLabsVoiceName: "Thomas" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands", flag: "🇳🇱", elevenLabsVoiceId: "N2lVS1w4EtoT3dr4eOWO", elevenLabsVoiceName: "Callum" },
  { code: "pl", name: "Polish", nativeName: "Polski", flag: "🇵🇱", elevenLabsVoiceId: "bVMeCyTHy58xNoL34h3p", elevenLabsVoiceName: "Jeremy" },
  { code: "sv", name: "Swedish", nativeName: "Svenska", flag: "🇸🇪", elevenLabsVoiceId: "pqHfZKP75CvOlQylNhV4", elevenLabsVoiceName: "Bill" },
  { code: "da", name: "Danish", nativeName: "Dansk", flag: "🇩🇰", elevenLabsVoiceId: "CwhRBWXzGAHq8TQ4Fs17", elevenLabsVoiceName: "George" },
  { code: "no", name: "Norwegian", nativeName: "Norsk", flag: "🇳🇴", elevenLabsVoiceId: "ODq5zmih8GrVes37Dizd", elevenLabsVoiceName: "Patrick" },
  { code: "fi", name: "Finnish", nativeName: "Suomi", flag: "🇫🇮", elevenLabsVoiceId: "SOYHLrjzK2X1ezoPC6cr", elevenLabsVoiceName: "Harry" },
  { code: "el", name: "Greek", nativeName: "Ελληνικά", flag: "🇬🇷", elevenLabsVoiceId: "ZQe5CZNOzWyzPSCn5a3c", elevenLabsVoiceName: "James" },

  // Tier 2: Idiomas adicionais importantes (30)
  { code: "he", name: "Hebrew", nativeName: "עברית", flag: "🇮🇱", elevenLabsVoiceId: "flq6f7yk4E4fJM5XTYuZ", elevenLabsVoiceName: "Michael" },
  { code: "th", name: "Thai", nativeName: "ไทย", flag: "🇹🇭", elevenLabsVoiceId: "XrExE9yKIg1WjnnlVkGX", elevenLabsVoiceName: "Matilda" },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt", flag: "🇻🇳", elevenLabsVoiceId: "cgSgspJ2msm6clMCkdW9", elevenLabsVoiceName: "Jessica" },
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia", flag: "🇮🇩", elevenLabsVoiceId: "pFZP5JQG7iQjIQuC4Bku", elevenLabsVoiceName: "Lily" },
  { code: "ms", name: "Malay", nativeName: "Bahasa Melayu", flag: "🇲🇾", elevenLabsVoiceId: "t0jbNlBVZ17f02VDIeMI", elevenLabsVoiceName: "Freya" },
  { code: "tl", name: "Filipino (Tagalog)", nativeName: "Tagalog", flag: "🇵🇭", elevenLabsVoiceId: "nPczCjzI2devNBz1zQrb", elevenLabsVoiceName: "Brian" },
  { code: "uk", name: "Ukrainian", nativeName: "Українська", flag: "🇺🇦", elevenLabsVoiceId: "iP95p4xoKVk53GoZ742B", elevenLabsVoiceName: "Chris" },
  { code: "cs", name: "Czech", nativeName: "Čeština", flag: "🇨🇿", elevenLabsVoiceId: "JBFqnCBsd6RMkjVDRZzb", elevenLabsVoiceName: "Gigi" },
  { code: "ro", name: "Romanian", nativeName: "Română", flag: "🇷🇴", elevenLabsVoiceId: "MF3mGyEYCl7XYWbV9V6O", elevenLabsVoiceName: "Ethan" },
  { code: "hu", name: "Hungarian", nativeName: "Magyar", flag: "🇭🇺", elevenLabsVoiceId: "TX3LPaxmHKxFdv7VOQHJ", elevenLabsVoiceName: "Liam" },
  { code: "bg", name: "Bulgarian", nativeName: "Български", flag: "🇧🇬", elevenLabsVoiceId: "pMsXgVXv3BLzUgSXRplE", elevenLabsVoiceName: "Mimi" },
  { code: "hr", name: "Croatian", nativeName: "Hrvatski", flag: "🇭🇷", elevenLabsVoiceId: "g5CIjZEefAph4nQFvHAz", elevenLabsVoiceName: "Grace" },
  { code: "sr", name: "Serbian", nativeName: "Српски", flag: "🇷🇸", elevenLabsVoiceId: "jBpfuIE2acCO8z3wKNLl", elevenLabsVoiceName: "Joseph" },
  { code: "sk", name: "Slovak", nativeName: "Slovenčina", flag: "🇸🇰", elevenLabsVoiceId: "jsCqWAovK2LkecY7zXl4", elevenLabsVoiceName: "Arnold" },
  { code: "sl", name: "Slovenian", nativeName: "Slovenščina", flag: "🇸🇮", elevenLabsVoiceId: "piTKgcLEGmPE4e6mEKli", elevenLabsVoiceName: "Clyde" },
  { code: "ca", name: "Catalan", nativeName: "Català", flag: "🇪🇸", elevenLabsVoiceId: "oWAxZDx7w5VEj9dCyTzz", elevenLabsVoiceName: "Dave" },
  { code: "gl", name: "Galician", nativeName: "Galego", flag: "🇪🇸", elevenLabsVoiceId: "2EiwWnXFnvU5JabPnv8n", elevenLabsVoiceName: "Fin" },
  { code: "eu", name: "Basque", nativeName: "Euskara", flag: "🇪🇸", elevenLabsVoiceId: "VR6AewLTigWG4xSOukaG", elevenLabsVoiceName: "Glinda" },
  { code: "is", name: "Icelandic", nativeName: "Íslenska", flag: "🇮🇸", elevenLabsVoiceId: "cjVigY5qzO86Huf0OWal", elevenLabsVoiceName: "Emily" },
  { code: "lt", name: "Lithuanian", nativeName: "Lietuvių", flag: "🇱🇹", elevenLabsVoiceId: "TX3LPaxmHKxFdv7VOQHJ", elevenLabsVoiceName: "Ethan" },
  { code: "lv", name: "Latvian", nativeName: "Latviešu", flag: "🇱🇻", elevenLabsVoiceId: "pNInz6obpgDQGcFmaJgB", elevenLabsVoiceName: "Adam" },
  { code: "et", name: "Estonian", nativeName: "Eesti", flag: "🇪🇪", elevenLabsVoiceId: "21m00Tcm4TlvDq8ikWAM", elevenLabsVoiceName: "Rachel" },
  { code: "fa", name: "Persian (Farsi)", nativeName: "فارسی", flag: "🇮🇷", elevenLabsVoiceId: "TxGEqnHWrfWFTfGW9XjX", elevenLabsVoiceName: "Josh" },
  { code: "ur", name: "Urdu", nativeName: "اردو", flag: "🇵🇰", elevenLabsVoiceId: "ErXwobaYiN019PkySvjV", elevenLabsVoiceName: "Antoni" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", flag: "🇧🇩", elevenLabsVoiceId: "IKne3meq5aSn9XLyUdCD", elevenLabsVoiceName: "Charlie" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", flag: "🇮🇳", elevenLabsVoiceId: "onwK4e9ZLuTAKqWW03F9", elevenLabsVoiceName: "Daniel" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", flag: "🇮🇳", elevenLabsVoiceId: "GBv7mTt0atIp3Br8iCZE", elevenLabsVoiceName: "Thomas" },
  { code: "mr", name: "Marathi", nativeName: "मराठी", flag: "🇮🇳", elevenLabsVoiceId: "N2lVS1w4EtoT3dr4eOWO", elevenLabsVoiceName: "Callum" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", flag: "🇮🇳", elevenLabsVoiceId: "bVMeCyTHy58xNoL34h3p", elevenLabsVoiceName: "Jeremy" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", flag: "🇮🇳", elevenLabsVoiceId: "pqHfZKP75CvOlQylNhV4", elevenLabsVoiceName: "Bill" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം", flag: "🇮🇳", elevenLabsVoiceId: "CwhRBWXzGAHq8TQ4Fs17", elevenLabsVoiceName: "George" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", flag: "🇮🇳", elevenLabsVoiceId: "ODq5zmih8GrVes37Dizd", elevenLabsVoiceName: "Patrick" },
  { code: "af", name: "Afrikaans", nativeName: "Afrikaans", flag: "🇿🇦", elevenLabsVoiceId: "SOYHLrjzK2X1ezoPC6cr", elevenLabsVoiceName: "Harry" },
  { code: "sw", name: "Swahili", nativeName: "Kiswahili", flag: "🇰🇪", elevenLabsVoiceId: "ZQe5CZNOzWyzPSCn5a3c", elevenLabsVoiceName: "James" },
  { code: "am", name: "Amharic", nativeName: "አማርኛ", flag: "🇪🇹", elevenLabsVoiceId: "flq6f7yk4E4fJM5XTYuZ", elevenLabsVoiceName: "Michael" },
  { code: "zu", name: "Zulu", nativeName: "isiZulu", flag: "🇿🇦", elevenLabsVoiceId: "XrExE9yKIg1WjnnlVkGX", elevenLabsVoiceName: "Matilda" },
  { code: "xh", name: "Xhosa", nativeName: "isiXhosa", flag: "🇿🇦", elevenLabsVoiceId: "cgSgspJ2msm6clMCkdW9", elevenLabsVoiceName: "Jessica" },
];

async function seedLanguages() {
  console.log("🌍 Seeding 50+ languages from around the world...");

  const db = await getDb();
  if (!db) {
    console.error("❌ Database not available");
    process.exit(1);
  }

  try {
    // Insert all languages
    for (const lang of WORLD_LANGUAGES) {
      await db.insert(languages).values({
        ...lang,
        isActive: true,
      }).onDuplicateKeyUpdate({
        set: {
          name: lang.name,
          nativeName: lang.nativeName,
          flag: lang.flag,
          elevenLabsVoiceId: lang.elevenLabsVoiceId,
          elevenLabsVoiceName: lang.elevenLabsVoiceName,
        },
      });
    }

    console.log(`✅ Successfully seeded ${WORLD_LANGUAGES.length} languages!`);
    console.log("\n📊 Language Statistics:");
    console.log(`   - Total languages: ${WORLD_LANGUAGES.length}`);
    console.log(`   - Tier 1 (Popular): 20 languages`);
    console.log(`   - Tier 2 (Additional): 30 languages`);
    console.log(`   - All configured with ElevenLabs voices`);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding languages:", error);
    process.exit(1);
  }
}

// Run seed
seedLanguages();
