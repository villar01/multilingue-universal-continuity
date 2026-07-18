import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
dotenv.config();

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// Mapeamento de idioma → voz Google TTS (Wavenet quando disponível)
// Formato: { male: { voice_id, voice_language_code }, female: { voice_id, voice_language_code } }
const voiceMap = {
  'en':    { male: { voice_id: 'en-US-Wavenet-D',   voice_language_code: 'en-US', voice_gender: 'MALE'   }, female: { voice_id: 'en-US-Wavenet-F',   voice_language_code: 'en-US', voice_gender: 'FEMALE' } },
  'pt':    { male: { voice_id: 'pt-BR-Wavenet-B',   voice_language_code: 'pt-BR', voice_gender: 'MALE'   }, female: { voice_id: 'pt-BR-Wavenet-A',   voice_language_code: 'pt-BR', voice_gender: 'FEMALE' } },
  'es':    { male: { voice_id: 'es-ES-Wavenet-B',   voice_language_code: 'es-ES', voice_gender: 'MALE'   }, female: { voice_id: 'es-ES-Wavenet-C',   voice_language_code: 'es-ES', voice_gender: 'FEMALE' } },
  'fr':    { male: { voice_id: 'fr-FR-Wavenet-B',   voice_language_code: 'fr-FR', voice_gender: 'MALE'   }, female: { voice_id: 'fr-FR-Wavenet-A',   voice_language_code: 'fr-FR', voice_gender: 'FEMALE' } },
  'de':    { male: { voice_id: 'de-DE-Wavenet-B',   voice_language_code: 'de-DE', voice_gender: 'MALE'   }, female: { voice_id: 'de-DE-Wavenet-A',   voice_language_code: 'de-DE', voice_gender: 'FEMALE' } },
  'it':    { male: { voice_id: 'it-IT-Wavenet-C',   voice_language_code: 'it-IT', voice_gender: 'MALE'   }, female: { voice_id: 'it-IT-Wavenet-A',   voice_language_code: 'it-IT', voice_gender: 'FEMALE' } },
  'ja':    { male: { voice_id: 'ja-JP-Wavenet-C',   voice_language_code: 'ja-JP', voice_gender: 'MALE'   }, female: { voice_id: 'ja-JP-Wavenet-A',   voice_language_code: 'ja-JP', voice_gender: 'FEMALE' } },
  'zh':    { male: { voice_id: 'cmn-CN-Wavenet-B',  voice_language_code: 'cmn-CN', voice_gender: 'MALE'  }, female: { voice_id: 'cmn-CN-Wavenet-A',  voice_language_code: 'cmn-CN', voice_gender: 'FEMALE' } },
  'ko':    { male: { voice_id: 'ko-KR-Wavenet-C',   voice_language_code: 'ko-KR', voice_gender: 'MALE'   }, female: { voice_id: 'ko-KR-Wavenet-A',   voice_language_code: 'ko-KR', voice_gender: 'FEMALE' } },
  'ru':    { male: { voice_id: 'ru-RU-Wavenet-B',   voice_language_code: 'ru-RU', voice_gender: 'MALE'   }, female: { voice_id: 'ru-RU-Wavenet-A',   voice_language_code: 'ru-RU', voice_gender: 'FEMALE' } },
  'ar':    { male: { voice_id: 'ar-XA-Wavenet-B',   voice_language_code: 'ar-XA', voice_gender: 'MALE'   }, female: { voice_id: 'ar-XA-Wavenet-A',   voice_language_code: 'ar-XA', voice_gender: 'FEMALE' } },
  'hi':    { male: { voice_id: 'hi-IN-Wavenet-B',   voice_language_code: 'hi-IN', voice_gender: 'MALE'   }, female: { voice_id: 'hi-IN-Wavenet-A',   voice_language_code: 'hi-IN', voice_gender: 'FEMALE' } },
  'nl':    { male: { voice_id: 'nl-NL-Wavenet-B',   voice_language_code: 'nl-NL', voice_gender: 'MALE'   }, female: { voice_id: 'nl-NL-Wavenet-A',   voice_language_code: 'nl-NL', voice_gender: 'FEMALE' } },
  'pl':    { male: { voice_id: 'pl-PL-Wavenet-B',   voice_language_code: 'pl-PL', voice_gender: 'MALE'   }, female: { voice_id: 'pl-PL-Wavenet-A',   voice_language_code: 'pl-PL', voice_gender: 'FEMALE' } },
  'sv':    { male: { voice_id: 'sv-SE-Wavenet-C',   voice_language_code: 'sv-SE', voice_gender: 'MALE'   }, female: { voice_id: 'sv-SE-Wavenet-A',   voice_language_code: 'sv-SE', voice_gender: 'FEMALE' } },
  'da':    { male: { voice_id: 'da-DK-Wavenet-C',   voice_language_code: 'da-DK', voice_gender: 'MALE'   }, female: { voice_id: 'da-DK-Wavenet-A',   voice_language_code: 'da-DK', voice_gender: 'FEMALE' } },
  'no':    { male: { voice_id: 'nb-NO-Wavenet-B',   voice_language_code: 'nb-NO', voice_gender: 'MALE'   }, female: { voice_id: 'nb-NO-Wavenet-A',   voice_language_code: 'nb-NO', voice_gender: 'FEMALE' } },
  'fi':    { male: { voice_id: 'fi-FI-Wavenet-A',   voice_language_code: 'fi-FI', voice_gender: 'MALE'   }, female: { voice_id: 'fi-FI-Standard-A',  voice_language_code: 'fi-FI', voice_gender: 'FEMALE' } },
  'cs':    { male: { voice_id: 'cs-CZ-Wavenet-A',   voice_language_code: 'cs-CZ', voice_gender: 'MALE'   }, female: { voice_id: 'cs-CZ-Standard-A',  voice_language_code: 'cs-CZ', voice_gender: 'FEMALE' } },
  'hu':    { male: { voice_id: 'hu-HU-Wavenet-A',   voice_language_code: 'hu-HU', voice_gender: 'MALE'   }, female: { voice_id: 'hu-HU-Standard-A',  voice_language_code: 'hu-HU', voice_gender: 'FEMALE' } },
  'ro':    { male: { voice_id: 'ro-RO-Wavenet-A',   voice_language_code: 'ro-RO', voice_gender: 'MALE'   }, female: { voice_id: 'ro-RO-Standard-A',  voice_language_code: 'ro-RO', voice_gender: 'FEMALE' } },
  'uk':    { male: { voice_id: 'uk-UA-Wavenet-A',   voice_language_code: 'uk-UA', voice_gender: 'MALE'   }, female: { voice_id: 'uk-UA-Standard-A',  voice_language_code: 'uk-UA', voice_gender: 'FEMALE' } },
  'tr':    { male: { voice_id: 'tr-TR-Wavenet-B',   voice_language_code: 'tr-TR', voice_gender: 'MALE'   }, female: { voice_id: 'tr-TR-Wavenet-A',   voice_language_code: 'tr-TR', voice_gender: 'FEMALE' } },
  'vi':    { male: { voice_id: 'vi-VN-Wavenet-B',   voice_language_code: 'vi-VN', voice_gender: 'MALE'   }, female: { voice_id: 'vi-VN-Wavenet-A',   voice_language_code: 'vi-VN', voice_gender: 'FEMALE' } },
  'th':    { male: { voice_id: 'th-TH-Neural2-C',   voice_language_code: 'th-TH', voice_gender: 'MALE'   }, female: { voice_id: 'th-TH-Neural2-C',   voice_language_code: 'th-TH', voice_gender: 'FEMALE' } },
  'id':    { male: { voice_id: 'id-ID-Wavenet-B',   voice_language_code: 'id-ID', voice_gender: 'MALE'   }, female: { voice_id: 'id-ID-Wavenet-A',   voice_language_code: 'id-ID', voice_gender: 'FEMALE' } },
  'ms':    { male: { voice_id: 'ms-MY-Wavenet-B',   voice_language_code: 'ms-MY', voice_gender: 'MALE'   }, female: { voice_id: 'ms-MY-Wavenet-A',   voice_language_code: 'ms-MY', voice_gender: 'FEMALE' } },
  'el':    { male: { voice_id: 'el-GR-Wavenet-A',   voice_language_code: 'el-GR', voice_gender: 'MALE'   }, female: { voice_id: 'el-GR-Standard-A',  voice_language_code: 'el-GR', voice_gender: 'FEMALE' } },
  'he':    { male: { voice_id: 'he-IL-Wavenet-B',   voice_language_code: 'he-IL', voice_gender: 'MALE'   }, female: { voice_id: 'he-IL-Wavenet-A',   voice_language_code: 'he-IL', voice_gender: 'FEMALE' } },
  'fa':    { male: { voice_id: 'fa-IR-Standard-B',  voice_language_code: 'fa-IR', voice_gender: 'MALE'   }, female: { voice_id: 'fa-IR-Standard-A',  voice_language_code: 'fa-IR', voice_gender: 'FEMALE' } },
  'bn':    { male: { voice_id: 'bn-IN-Wavenet-B',   voice_language_code: 'bn-IN', voice_gender: 'MALE'   }, female: { voice_id: 'bn-IN-Wavenet-A',   voice_language_code: 'bn-IN', voice_gender: 'FEMALE' } },
  'ta':    { male: { voice_id: 'ta-IN-Wavenet-C',   voice_language_code: 'ta-IN', voice_gender: 'MALE'   }, female: { voice_id: 'ta-IN-Wavenet-A',   voice_language_code: 'ta-IN', voice_gender: 'FEMALE' } },
  'te':    { male: { voice_id: 'te-IN-Standard-B',  voice_language_code: 'te-IN', voice_gender: 'MALE'   }, female: { voice_id: 'te-IN-Standard-A',  voice_language_code: 'te-IN', voice_gender: 'FEMALE' } },
  'ml':    { male: { voice_id: 'ml-IN-Wavenet-C',   voice_language_code: 'ml-IN', voice_gender: 'MALE'   }, female: { voice_id: 'ml-IN-Wavenet-A',   voice_language_code: 'ml-IN', voice_gender: 'FEMALE' } },
  'mr':    { male: { voice_id: 'mr-IN-Wavenet-B',   voice_language_code: 'mr-IN', voice_gender: 'MALE'   }, female: { voice_id: 'mr-IN-Wavenet-A',   voice_language_code: 'mr-IN', voice_gender: 'FEMALE' } },
  'gu':    { male: { voice_id: 'gu-IN-Wavenet-B',   voice_language_code: 'gu-IN', voice_gender: 'MALE'   }, female: { voice_id: 'gu-IN-Wavenet-A',   voice_language_code: 'gu-IN', voice_gender: 'FEMALE' } },
  'kn':    { male: { voice_id: 'kn-IN-Wavenet-B',   voice_language_code: 'kn-IN', voice_gender: 'MALE'   }, female: { voice_id: 'kn-IN-Wavenet-A',   voice_language_code: 'kn-IN', voice_gender: 'FEMALE' } },
  'pa':    { male: { voice_id: 'pa-IN-Standard-B',  voice_language_code: 'pa-IN', voice_gender: 'MALE'   }, female: { voice_id: 'pa-IN-Standard-A',  voice_language_code: 'pa-IN', voice_gender: 'FEMALE' } },
  'ur':    { male: { voice_id: 'ur-IN-Wavenet-B',   voice_language_code: 'ur-IN', voice_gender: 'MALE'   }, female: { voice_id: 'ur-IN-Wavenet-A',   voice_language_code: 'ur-IN', voice_gender: 'FEMALE' } },
  'sk':    { male: { voice_id: 'sk-SK-Wavenet-A',   voice_language_code: 'sk-SK', voice_gender: 'MALE'   }, female: { voice_id: 'sk-SK-Standard-A',  voice_language_code: 'sk-SK', voice_gender: 'FEMALE' } },
  'sl':    { male: { voice_id: 'sl-SI-Standard-B',  voice_language_code: 'sl-SI', voice_gender: 'MALE'   }, female: { voice_id: 'sl-SI-Standard-A',  voice_language_code: 'sl-SI', voice_gender: 'FEMALE' } },
  'lt':    { male: { voice_id: 'lt-LT-Standard-A',  voice_language_code: 'lt-LT', voice_gender: 'MALE'   }, female: { voice_id: 'lt-LT-Standard-A',  voice_language_code: 'lt-LT', voice_gender: 'FEMALE' } },
  'lv':    { male: { voice_id: 'lv-LV-Standard-A',  voice_language_code: 'lv-LV', voice_gender: 'MALE'   }, female: { voice_id: 'lv-LV-Standard-A',  voice_language_code: 'lv-LV', voice_gender: 'FEMALE' } },
  'et':    { male: { voice_id: 'et-EE-Standard-A',  voice_language_code: 'et-EE', voice_gender: 'MALE'   }, female: { voice_id: 'et-EE-Standard-A',  voice_language_code: 'et-EE', voice_gender: 'FEMALE' } },
  'is':    { male: { voice_id: 'is-IS-Standard-A',  voice_language_code: 'is-IS', voice_gender: 'MALE'   }, female: { voice_id: 'is-IS-Standard-A',  voice_language_code: 'is-IS', voice_gender: 'FEMALE' } },
  'ca':    { male: { voice_id: 'ca-ES-Standard-B',  voice_language_code: 'ca-ES', voice_gender: 'MALE'   }, female: { voice_id: 'ca-ES-Standard-A',  voice_language_code: 'ca-ES', voice_gender: 'FEMALE' } },
  'gl':    { male: { voice_id: 'gl-ES-Standard-A',  voice_language_code: 'gl-ES', voice_gender: 'MALE'   }, female: { voice_id: 'gl-ES-Standard-A',  voice_language_code: 'gl-ES', voice_gender: 'FEMALE' } },
  'eu':    { male: { voice_id: 'eu-ES-Standard-A',  voice_language_code: 'eu-ES', voice_gender: 'MALE'   }, female: { voice_id: 'eu-ES-Standard-A',  voice_language_code: 'eu-ES', voice_gender: 'FEMALE' } },
  'af':    { male: { voice_id: 'af-ZA-Standard-A',  voice_language_code: 'af-ZA', voice_gender: 'MALE'   }, female: { voice_id: 'af-ZA-Standard-A',  voice_language_code: 'af-ZA', voice_gender: 'FEMALE' } },
  'zu':    { male: { voice_id: 'zu-ZA-Standard-A',  voice_language_code: 'zu-ZA', voice_gender: 'MALE'   }, female: { voice_id: 'zu-ZA-Standard-A',  voice_language_code: 'zu-ZA', voice_gender: 'FEMALE' } },
  'xh':    { male: { voice_id: 'xh-ZA-Standard-A',  voice_language_code: 'xh-ZA', voice_gender: 'MALE'   }, female: { voice_id: 'xh-ZA-Standard-A',  voice_language_code: 'xh-ZA', voice_gender: 'FEMALE' } },
  'am':    { male: { voice_id: 'am-ET-Standard-B',  voice_language_code: 'am-ET', voice_gender: 'MALE'   }, female: { voice_id: 'am-ET-Standard-A',  voice_language_code: 'am-ET', voice_gender: 'FEMALE' } },
  'ha':    { male: { voice_id: 'ha-NG-Standard-A',  voice_language_code: 'ha-NG', voice_gender: 'MALE'   }, female: { voice_id: 'ha-NG-Standard-A',  voice_language_code: 'ha-NG', voice_gender: 'FEMALE' } },
  'yo':    { male: { voice_id: 'yo-NG-Standard-A',  voice_language_code: 'yo-NG', voice_gender: 'MALE'   }, female: { voice_id: 'yo-NG-Standard-A',  voice_language_code: 'yo-NG', voice_gender: 'FEMALE' } },
  'ig':    { male: { voice_id: 'ig-NG-Standard-A',  voice_language_code: 'ig-NG', voice_gender: 'MALE'   }, female: { voice_id: 'ig-NG-Standard-A',  voice_language_code: 'ig-NG', voice_gender: 'FEMALE' } },
  'sw':    { male: { voice_id: 'sw-KE-Standard-C',  voice_language_code: 'sw-KE', voice_gender: 'MALE'   }, female: { voice_id: 'sw-KE-Standard-A',  voice_language_code: 'sw-KE', voice_gender: 'FEMALE' } },
  'bg':    { male: { voice_id: 'bg-BG-Standard-A',  voice_language_code: 'bg-BG', voice_gender: 'MALE'   }, female: { voice_id: 'bg-BG-Standard-A',  voice_language_code: 'bg-BG', voice_gender: 'FEMALE' } },
  'sr':    { male: { voice_id: 'sr-RS-Standard-A',  voice_language_code: 'sr-RS', voice_gender: 'MALE'   }, female: { voice_id: 'sr-RS-Standard-A',  voice_language_code: 'sr-RS', voice_gender: 'FEMALE' } },
  'hr':    { male: { voice_id: 'hr-HR-Standard-A',  voice_language_code: 'hr-HR', voice_gender: 'MALE'   }, female: { voice_id: 'hr-HR-Standard-A',  voice_language_code: 'hr-HR', voice_gender: 'FEMALE' } },
  'qu':    { male: { voice_id: 'es-PE-Standard-A',  voice_language_code: 'es-PE', voice_gender: 'MALE'   }, female: { voice_id: 'es-PE-Standard-A',  voice_language_code: 'es-PE', voice_gender: 'FEMALE' } }, // Quechua → usar espanhol peruano como proxy
};

// Buscar todos os professores com idioma
const [rows] = await conn.execute(`
  SELECT vt.id, vt.name, vt.gender, vt.voice_id, vt.voice_language_code, vt.voice_gender,
         l.name as lang_name, l.code as lang_code
  FROM virtual_teachers vt
  LEFT JOIN languages l ON l.id = vt.language_id
  ORDER BY vt.id
`);

let fixed = 0;
let skipped = 0;

for (const r of rows) {
  const langCode = (r.lang_code || 'en').toLowerCase().substring(0, 2);
  const gender = (r.gender || 'male').toLowerCase();
  const voiceEntry = voiceMap[langCode];

  if (!voiceEntry) {
    // Idioma sem mapeamento → usar inglês como fallback
    const fallback = voiceMap['en'][gender === 'female' ? 'female' : 'male'];
    if (!r.voice_id) {
      await conn.execute(
        `UPDATE virtual_teachers SET voice_id=?, voice_language_code=?, voice_gender=? WHERE id=?`,
        [fallback.voice_id, fallback.voice_language_code, fallback.voice_gender, r.id]
      );
      console.log(`⚠️  ID:${r.id} ${r.name} — idioma ${r.lang_code} sem mapeamento, usando en-US fallback`);
      fixed++;
    }
    continue;
  }

  const targetVoice = voiceEntry[gender === 'female' ? 'female' : 'male'];

  // Verificar se precisa corrigir
  const needsFix = !r.voice_id || 
    r.voice_language_code !== targetVoice.voice_language_code ||
    r.voice_gender !== targetVoice.voice_gender;

  if (needsFix) {
    await conn.execute(
      `UPDATE virtual_teachers SET voice_id=?, voice_language_code=?, voice_gender=? WHERE id=?`,
      [targetVoice.voice_id, targetVoice.voice_language_code, targetVoice.voice_gender, r.id]
    );
    console.log(`✅ CORRIGIDO ID:${r.id} ${r.name} | ${r.lang_name} | ${r.voice_id || 'NULL'} → ${targetVoice.voice_id}`);
    fixed++;
  } else {
    skipped++;
  }
}

console.log(`\n=== RESULTADO ===`);
console.log(`Corrigidos: ${fixed}`);
console.log(`Já corretos: ${skipped}`);
console.log(`Total: ${rows.length}`);

await conn.end();
