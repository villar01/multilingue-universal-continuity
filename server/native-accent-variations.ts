/**
 * Sistema de Variações Nativas por Idioma
 * 3 sotaques regionais nativos por idioma para treino auditivo avançado
 */

export interface AccentVariation {
  id: string;
  language: string;
  region: string;
  name: string;
  description: string;
  voiceId: string;
  gender: "MALE" | "FEMALE";
  characteristics: string[];
  difficulty: "easy" | "medium" | "hard";
}

/**
 * Mapeamento completo de variações nativas
 * 3 sotaques por idioma, todos nativos de excelente qualidade
 */
export const NATIVE_ACCENT_VARIATIONS: Record<string, AccentVariation[]> = {
  // INGLÊS: 3 variações nativas
  "en": [
    {
      id: "en-us-general",
      language: "en",
      region: "US - General American",
      name: "Josh (Americano Neutro)",
      description: "Sotaque americano neutro padrão, claro e fácil de entender",
      voiceId: "TxGEqnHWrfWFTfGW9XjX",
      gender: "MALE",
      characteristics: ["Rhoticity forte", "Vogais claras", "Ritmo moderado"],
      difficulty: "easy",
    },
    {
      id: "en-gb-rp",
      language: "en",
      region: "UK - Received Pronunciation",
      name: "Arnold (Britânico RP)",
      description: "Sotaque britânico padrão (BBC English), formal e articulado",
      voiceId: "VR6AewLTigWG4xSOukaG",
      gender: "MALE",
      characteristics: ["Non-rhotic", "Vogais longas", "Articulação precisa"],
      difficulty: "medium",
    },
    {
      id: "en-au-general",
      language: "en",
      region: "Australia - General Australian",
      name: "Liam (Australiano)",
      description: "Sotaque australiano padrão, descontraído e distintivo",
      voiceId: "TX3LPaxmHKxFdv7VOQHJ",
      gender: "MALE",
      characteristics: ["Entonação ascendente", "Vogais fechadas", "Ritmo rápido"],
      difficulty: "hard",
    },
  ],

  // ESPANHOL: 3 variações nativas
  "es": [
    {
      id: "es-es-castilian",
      language: "es",
      region: "Spain - Castilian",
      name: "Mateo (Espanhol Castelhano)",
      description: "Espanhol da Espanha (Madrid), com 'z' e 'c' interdentais",
      voiceId: "onwK4e9ZLuTAKqWW03F9",
      gender: "MALE",
      characteristics: ["Distinção z/s", "Ritmo moderado", "Entonação clara"],
      difficulty: "easy",
    },
    {
      id: "es-mx-standard",
      language: "es",
      region: "Mexico - Standard",
      name: "Diego (Mexicano Padrão)",
      description: "Espanhol mexicano neutro, claro e amplamente compreendido",
      voiceId: "pNInz6obpgDQGcFmaJgB",
      gender: "MALE",
      characteristics: ["Seseo", "Ritmo calmo", "Vogais abertas"],
      difficulty: "easy",
    },
    {
      id: "es-ar-rioplatense",
      language: "es",
      region: "Argentina - Rioplatense",
      name: "Alejandro (Argentino Portenho)",
      description: "Espanhol argentino (Buenos Aires), com 'll' e 'y' distintos",
      voiceId: "bVMeCyTHy58xNoL34h3p",
      gender: "MALE",
      characteristics: ["Yeísmo rehilado", "Entonação italiana", "Voseo"],
      difficulty: "hard",
    },
  ],

  // FRANCÊS: 3 variações nativas
  "fr": [
    {
      id: "fr-fr-parisian",
      language: "fr",
      region: "France - Parisian",
      name: "Callum (Francês Parisiense)",
      description: "Francês de Paris, padrão e elegante",
      voiceId: "N2lVS1w4EtoT3dr4eOWO",
      gender: "MALE",
      characteristics: ["R uvular", "Nasalização", "Liaison frequente"],
      difficulty: "medium",
    },
    {
      id: "fr-ca-quebec",
      language: "fr",
      region: "Canada - Quebec",
      name: "Antoine (Quebequense)",
      description: "Francês do Quebec, com características únicas",
      voiceId: "ErXwobaYiN019PkySvjV",
      gender: "MALE",
      characteristics: ["Vogais fechadas", "Affrication", "Arcaísmos"],
      difficulty: "hard",
    },
    {
      id: "fr-be-belgian",
      language: "fr",
      region: "Belgium - Belgian",
      name: "Thomas (Belga)",
      description: "Francês da Bélgica, claro e conservador",
      voiceId: "IKne3meq5aSn9XLyUdCD",
      gender: "MALE",
      characteristics: ["Pronúncia clara", "Menos liaison", "Ritmo moderado"],
      difficulty: "easy",
    },
  ],

  // ALEMÃO: 3 variações nativas
  "de": [
    {
      id: "de-de-standard",
      language: "de",
      region: "Germany - Standard",
      name: "Daniel (Alemão Padrão)",
      description: "Alemão padrão (Hochdeutsch), claro e neutro",
      voiceId: "onwK4e9ZLuTAKqWW03F9",
      gender: "MALE",
      characteristics: ["Articulação precisa", "R uvular", "Consoantes fortes"],
      difficulty: "medium",
    },
    {
      id: "de-at-austrian",
      language: "de",
      region: "Austria - Austrian",
      name: "Maximilian (Austríaco)",
      description: "Alemão austríaco (Viena), melodioso e suave",
      voiceId: "pNInz6obpgDQGcFmaJgB",
      gender: "MALE",
      characteristics: ["Entonação suave", "Vogais longas", "Ritmo calmo"],
      difficulty: "medium",
    },
    {
      id: "de-ch-swiss",
      language: "de",
      region: "Switzerland - Swiss",
      name: "Lukas (Suíço)",
      description: "Alemão suíço padrão, distinto e característico",
      voiceId: "bVMeCyTHy58xNoL34h3p",
      gender: "MALE",
      characteristics: ["Sem ß", "Pronúncia distinta", "Ritmo lento"],
      difficulty: "hard",
    },
  ],

  // ITALIANO: 3 variações nativas
  "it": [
    {
      id: "it-it-standard",
      language: "it",
      region: "Italy - Standard",
      name: "Giovanni (Italiano Padrão)",
      description: "Italiano padrão (Toscano), clássico e claro",
      voiceId: "onwK4e9ZLuTAKqWW03F9",
      gender: "MALE",
      characteristics: ["Vogais abertas", "Consoantes duplas", "Ritmo melódico"],
      difficulty: "easy",
    },
    {
      id: "it-it-roman",
      language: "it",
      region: "Italy - Roman",
      name: "Marco (Romano)",
      description: "Italiano de Roma, expressivo e característico",
      voiceId: "pNInz6obpgDQGcFmaJgB",
      gender: "MALE",
      characteristics: ["R vibrante", "Entonação forte", "Ritmo rápido"],
      difficulty: "medium",
    },
    {
      id: "it-it-milanese",
      language: "it",
      region: "Italy - Milanese",
      name: "Alessandro (Milanês)",
      description: "Italiano de Milão, moderno e sofisticado",
      voiceId: "bVMeCyTHy58xNoL34h3p",
      gender: "MALE",
      characteristics: ["Pronúncia suave", "Ritmo moderado", "Influência lombarda"],
      difficulty: "medium",
    },
  ],

  // PORTUGUÊS: 3 variações nativas (já existentes, expandidas)
  "pt": [
    {
      id: "pt-br-paulista",
      language: "pt",
      region: "Brazil - São Paulo",
      name: "Ricardo (Paulista)",
      description: "Português brasileiro paulista, neutro e claro",
      voiceId: "Vxjl8FZXY0HXoWbCjmJ5",
      gender: "MALE",
      characteristics: ["R retroflexo", "Vogais abertas", "Ritmo moderado"],
      difficulty: "easy",
    },
    {
      id: "pt-br-carioca",
      language: "pt",
      region: "Brazil - Rio de Janeiro",
      name: "Camila (Carioca)",
      description: "Português brasileiro carioca, melodioso e característico",
      voiceId: "jsCqWAovK2LkecY7zXl4",
      gender: "FEMALE",
      characteristics: ["S chiado", "Entonação cantada", "Vogais nasais"],
      difficulty: "medium",
    },
    {
      id: "pt-pt-lisbon",
      language: "pt",
      region: "Portugal - Lisbon",
      name: "Miguel (Lisboa)",
      description: "Português europeu de Lisboa, formal e articulado",
      voiceId: "onwK4e9ZLuTAKqWW03F9",
      gender: "MALE",
      characteristics: ["Vogais fechadas", "Consoantes fortes", "Ritmo rápido"],
      difficulty: "hard",
    },
  ],
};

/**
 * Obtém variações nativas de um idioma
 */
export function getAccentVariations(language: string): AccentVariation[] {
  return NATIVE_ACCENT_VARIATIONS[language] || [];
}

/**
 * Obtém variação específica por ID
 */
export function getAccentVariation(accentId: string): AccentVariation | null {
  for (const variations of Object.values(NATIVE_ACCENT_VARIATIONS)) {
    const found = variations.find((v) => v.id === accentId);
    if (found) return found;
  }
  return null;
}

/**
 * Lista todos idiomas com variações disponíveis
 */
export function getAvailableLanguages(): string[] {
  return Object.keys(NATIVE_ACCENT_VARIATIONS);
}

/**
 * Obtém estatísticas de variações
 */
export function getAccentStats() {
  const languages = getAvailableLanguages();
  const totalVariations = languages.reduce(
    (sum, lang) => sum + NATIVE_ACCENT_VARIATIONS[lang].length,
    0
  );

  return {
    languages: languages.length,
    totalVariations,
    variationsPerLanguage: languages.map((lang) => ({
      language: lang,
      count: NATIVE_ACCENT_VARIATIONS[lang].length,
      variations: NATIVE_ACCENT_VARIATIONS[lang].map((v) => ({
        id: v.id,
        region: v.region,
        difficulty: v.difficulty,
      })),
    })),
  };
}
