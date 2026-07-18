/**
 * Sistema de nomes dinâmicos por idioma para os 10 arquétipos de professores.
 * Cada arquétipo tem uma foto fixa e um nome que muda conforme o idioma da lição.
 * Isso elimina a necessidade de 65+ professores no banco — apenas 10 arquétipos.
 */

// Mapeamento: teacherId → { languageCode → { name, voiceId } }
export const TEACHER_NAMES_BY_LANGUAGE: Record<number, Record<string, { name: string; voiceId: string }>> = {
  // ID 1 — Ricardo (Caucasiano Masculino, pele clara)
  1: {
    "pt-BR": { name: "Professor Ricardo", voiceId: "pt-BR-Wavenet-B" },
    "pt-PT": { name: "Professor Rui", voiceId: "pt-PT-Wavenet-B" },
    "en-US": { name: "Professor Richard", voiceId: "en-US-Wavenet-D" },
    "en-GB": { name: "Professor Richard", voiceId: "en-GB-Wavenet-B" },
    "de-DE": { name: "Professor Klaus", voiceId: "de-DE-Wavenet-B" },
    "fr-FR": { name: "Professeur René", voiceId: "fr-FR-Wavenet-B" },
    "es-ES": { name: "Profesor Ricardo", voiceId: "es-ES-Wavenet-B" },
    "es-MX": { name: "Profesor Ricardo", voiceId: "es-US-Wavenet-B" },
    "it-IT": { name: "Professore Riccardo", voiceId: "it-IT-Wavenet-C" },
    "nl-NL": { name: "Professor Rik", voiceId: "nl-NL-Wavenet-B" },
    "ru-RU": { name: "Профессор Роман", voiceId: "ru-RU-Wavenet-B" },
    "pl-PL": { name: "Profesor Ryszard", voiceId: "pl-PL-Wavenet-B" },
    "default": { name: "Professor Ricardo", voiceId: "en-US-Wavenet-D" },
  },

  // ID 30001 — Ingrid (Europeia Feminina, pele clara)
  30001: {
    "de-DE": { name: "Lehrerin Ingrid", voiceId: "de-DE-Wavenet-C" },
    "en-US": { name: "Teacher Ingrid", voiceId: "en-US-Wavenet-F" },
    "en-GB": { name: "Teacher Ingrid", voiceId: "en-GB-Wavenet-A" },
    "pt-BR": { name: "Professora Ingrid", voiceId: "pt-BR-Wavenet-A" },
    "fr-FR": { name: "Professeure Inès", voiceId: "fr-FR-Wavenet-A" },
    "es-ES": { name: "Profesora Inés", voiceId: "es-ES-Wavenet-A" },
    "nl-NL": { name: "Lerares Inge", voiceId: "nl-NL-Wavenet-A" },
    "sv-SE": { name: "Lärare Ingrid", voiceId: "sv-SE-Wavenet-A" },
    "no-NO": { name: "Lærer Ingrid", voiceId: "nb-NO-Wavenet-A" },
    "da-DK": { name: "Lærer Ingrid", voiceId: "da-DK-Wavenet-A" },
    "default": { name: "Teacher Ingrid", voiceId: "en-US-Wavenet-F" },
  },

  // ID 90002 — Professora Ingrid manuscdn (Europeia Feminina 2, pele clara)
  90002: {
    "de-DE": { name: "Lehrerin Heidi", voiceId: "de-DE-Wavenet-A" },
    "en-US": { name: "Teacher Helen", voiceId: "en-US-Wavenet-E" },
    "en-GB": { name: "Teacher Helen", voiceId: "en-GB-Wavenet-C" },
    "pt-BR": { name: "Professora Helena", voiceId: "pt-BR-Wavenet-A" },
    "fr-FR": { name: "Professeure Hélène", voiceId: "fr-FR-Wavenet-C" },
    "es-ES": { name: "Profesora Elena", voiceId: "es-ES-Wavenet-C" },
    "it-IT": { name: "Professoressa Elena", voiceId: "it-IT-Wavenet-A" },
    "ru-RU": { name: "Учительница Елена", voiceId: "ru-RU-Wavenet-A" },
    "default": { name: "Teacher Helen", voiceId: "en-US-Wavenet-E" },
  },

  // ID 90003 — Professor Carlos manuscdn (Latino Masculino, pele média)
  90003: {
    "pt-BR": { name: "Professor Carlos", voiceId: "pt-BR-Wavenet-B" },
    "es-ES": { name: "Profesor Carlos", voiceId: "es-ES-Wavenet-B" },
    "es-MX": { name: "Profesor Carlos", voiceId: "es-US-Wavenet-B" },
    "es-AR": { name: "Profesor Carlos", voiceId: "es-US-Wavenet-B" },
    "en-US": { name: "Professor Carlos", voiceId: "en-US-Wavenet-D" },
    "fr-FR": { name: "Professeur Carlos", voiceId: "fr-FR-Wavenet-B" },
    "it-IT": { name: "Professore Carlo", voiceId: "it-IT-Wavenet-C" },
    "default": { name: "Professor Carlos", voiceId: "es-ES-Wavenet-B" },
  },

  // ID 90004 — Professor Jean manuscdn (Europeu Masculino 2, pele clara)
  90004: {
    "fr-FR": { name: "Professeur Jean", voiceId: "fr-FR-Wavenet-B" },
    "fr-CA": { name: "Professeur Jean", voiceId: "fr-CA-Wavenet-B" },
    "en-US": { name: "Professor John", voiceId: "en-US-Wavenet-A" },
    "en-GB": { name: "Professor John", voiceId: "en-GB-Wavenet-D" },
    "pt-BR": { name: "Professor João", voiceId: "pt-BR-Wavenet-B" },
    "es-ES": { name: "Profesor Juan", voiceId: "es-ES-Wavenet-B" },
    "de-DE": { name: "Professor Johann", voiceId: "de-DE-Wavenet-B" },
    "it-IT": { name: "Professore Giovanni", voiceId: "it-IT-Wavenet-C" },
    "default": { name: "Professeur Jean", voiceId: "fr-FR-Wavenet-B" },
  },

  // ID 150003 — Professor Carlos Unsplash (Latino Masculino 2, pele média)
  150003: {
    "pt-BR": { name: "Professor André", voiceId: "pt-BR-Wavenet-B" },
    "es-ES": { name: "Profesor Andrés", voiceId: "es-ES-Wavenet-B" },
    "es-MX": { name: "Profesor Andrés", voiceId: "es-US-Wavenet-B" },
    "en-US": { name: "Professor Andrew", voiceId: "en-US-Wavenet-B" },
    "fr-FR": { name: "Professeur André", voiceId: "fr-FR-Wavenet-B" },
    "default": { name: "Professor André", voiceId: "pt-BR-Wavenet-B" },
  },

  // ID 150004 — Teacher Jeanne Unsplash (Feminina Média, pele média)
  150004: {
    "en-US": { name: "Teacher Jeanne", voiceId: "en-US-Wavenet-F" },
    "en-GB": { name: "Teacher Jeanne", voiceId: "en-GB-Wavenet-A" },
    "fr-FR": { name: "Professeure Jeanne", voiceId: "fr-FR-Wavenet-A" },
    "pt-BR": { name: "Professora Joana", voiceId: "pt-BR-Wavenet-A" },
    "es-ES": { name: "Profesora Juana", voiceId: "es-ES-Wavenet-A" },
    "es-MX": { name: "Profesora Juana", voiceId: "es-US-Wavenet-A" },
    "it-IT": { name: "Professoressa Giovanna", voiceId: "it-IT-Wavenet-A" },
    "ar-XA": { name: "المعلمة جنى", voiceId: "ar-XA-Wavenet-A" },
    "default": { name: "Teacher Jeanne", voiceId: "en-US-Wavenet-F" },
  },

  // ID 180001 — Professor Kwame Asante (Africano Masculino, pele escura)
  180001: {
    "en-US": { name: "Professor Kwame", voiceId: "en-US-Wavenet-D" },
    "en-GB": { name: "Professor Kwame", voiceId: "en-GB-Wavenet-B" },
    "fr-FR": { name: "Professeur Kwame", voiceId: "fr-FR-Wavenet-B" },
    "pt-BR": { name: "Professor Kwame", voiceId: "pt-BR-Wavenet-B" },
    "es-ES": { name: "Profesor Kwame", voiceId: "es-ES-Wavenet-B" },
    "sw-TZ": { name: "Mwalimu Kwame", voiceId: "en-US-Wavenet-D" },
    "ar-XA": { name: "الأستاذ كوامي", voiceId: "ar-XA-Wavenet-B" },
    "default": { name: "Professor Kwame", voiceId: "en-US-Wavenet-D" },
  },

  // ID 210001 — Professora Mei (Asiática Feminina, pele amarela)
  210001: {
    "zh-CN": { name: "老师美", voiceId: "cmn-CN-Wavenet-A" },
    "zh-TW": { name: "老師美", voiceId: "cmn-TW-Wavenet-A" },
    "ja-JP": { name: "先生 美", voiceId: "ja-JP-Wavenet-A" },
    "ko-KR": { name: "선생님 미", voiceId: "ko-KR-Wavenet-A" },
    "vi-VN": { name: "Cô Mei", voiceId: "vi-VN-Wavenet-A" },
    "th-TH": { name: "ครูเหมย", voiceId: "th-TH-Neural2-C" },
    "en-US": { name: "Teacher Mei", voiceId: "en-US-Wavenet-F" },
    "pt-BR": { name: "Professora Mei", voiceId: "pt-BR-Wavenet-A" },
    "default": { name: "Teacher Mei", voiceId: "en-US-Wavenet-F" },
  },

  // ID 210002 — Professor Takeshi (Asiático Masculino, pele amarela)
  210002: {
    "ja-JP": { name: "先生 武", voiceId: "ja-JP-Wavenet-C" },
    "zh-CN": { name: "老师武", voiceId: "cmn-CN-Wavenet-B" },
    "zh-TW": { name: "老師武", voiceId: "cmn-TW-Wavenet-B" },
    "ko-KR": { name: "선생님 타케시", voiceId: "ko-KR-Wavenet-C" },
    "vi-VN": { name: "Thầy Takeshi", voiceId: "vi-VN-Wavenet-B" },
    "en-US": { name: "Teacher Takeshi", voiceId: "en-US-Wavenet-D" },
    "pt-BR": { name: "Professor Takeshi", voiceId: "pt-BR-Wavenet-B" },
    "default": { name: "Teacher Takeshi", voiceId: "ja-JP-Wavenet-C" },
  },
};

/**
 * Retorna o nome e voiceId do professor para o idioma da lição.
 * Se não houver mapeamento específico, usa "default".
 */
export function getTeacherDisplayName(
  teacherId: number,
  languageCode: string
): { name: string; voiceId: string } {
  const map = TEACHER_NAMES_BY_LANGUAGE[teacherId];
  if (!map) return { name: "Professor", voiceId: "en-US-Wavenet-D" };

  // Try exact match first (e.g., "pt-BR")
  if (map[languageCode]) return map[languageCode];

  // Try prefix match (e.g., "en" matches "en-US")
  const prefix = languageCode.split("-")[0];
  const prefixMatch = Object.keys(map).find(k => k.startsWith(prefix + "-"));
  if (prefixMatch) return map[prefixMatch];

  // Fallback to default
  return map["default"] || { name: "Professor", voiceId: "en-US-Wavenet-D" };
}
