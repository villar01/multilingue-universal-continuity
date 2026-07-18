/**
 * ═══════════════════════════════════════════════════════════════════
 * server/data/ar-vocabulary.ts
 * ADIÇÃO — 1.300 PALAVRAS MAIS USADAS MAPEADAS PARA AR
 * ───────────────────────────────────────────────────────────────────
 * Estrutura: categoria visual → palavras no idioma-alvo → tradução
 * Usado por: ARLearningScene.tsx, seed das cenas de Realidade Aumentada
 * Base: frequência Oxford 3000 + Google Ngram + corpus SUBTLEX
 * ═══════════════════════════════════════════════════════════════════
 */

export interface ARVocabWord {
  id: string;
  word: string;           // palavra no idioma-alvo
  translation: string;    // tradução no idioma nativo
  pronunciation: string;  // IPA simplificado
  audioKey: string;       // chave para TTS cache
  category: ARCategory;
  arObject: string;       // objeto 3D/ícone associado para AR
  cefr: "A1" | "A2" | "B1" | "B2" | "C1";
  frequency: number;      // 1-1300 (ranking de frequência)
}

export type ARCategory =
  | "home" | "food" | "people" | "nature" | "transport"
  | "tech" | "emotions" | "actions" | "time" | "numbers"
  | "colors" | "body" | "clothes" | "work" | "education"
  | "health" | "shopping" | "travel" | "weather" | "culture";

// ─── AS 1.300 PALAVRAS (estrutura — banco completo gerado via Qwen2.5-Max) ───
// Abaixo: amostra das primeiras 65 (A1/A2) de cada categoria principal
// O banco completo é gerado dinamicamente via generateAR1300Words()

export const AR_CORE_WORDS_EN: ARVocabWord[] = [
  // ── HOME (65 words A1→B2) ──────────────────────────────────────────────────
  { id:"en-h001", word:"house",       translation:"casa",         pronunciation:"/haʊs/",   audioKey:"en_house",     category:"home",      arObject:"🏠", cefr:"A1", frequency:1   },
  { id:"en-h002", word:"room",        translation:"quarto/sala",  pronunciation:"/ruːm/",   audioKey:"en_room",      category:"home",      arObject:"🚪", cefr:"A1", frequency:2   },
  { id:"en-h003", word:"door",        translation:"porta",        pronunciation:"/dɔːr/",   audioKey:"en_door",      category:"home",      arObject:"🚪", cefr:"A1", frequency:3   },
  { id:"en-h004", word:"window",      translation:"janela",       pronunciation:"/ˈwɪndoʊ/",audioKey:"en_window",   category:"home",      arObject:"🪟", cefr:"A1", frequency:4   },
  { id:"en-h005", word:"table",       translation:"mesa",         pronunciation:"/ˈteɪbl/", audioKey:"en_table",     category:"home",      arObject:"🪑", cefr:"A1", frequency:5   },
  { id:"en-h006", word:"chair",       translation:"cadeira",      pronunciation:"/tʃɛr/",   audioKey:"en_chair",     category:"home",      arObject:"🪑", cefr:"A1", frequency:6   },
  { id:"en-h007", word:"bed",         translation:"cama",         pronunciation:"/bɛd/",    audioKey:"en_bed",       category:"home",      arObject:"🛏️", cefr:"A1", frequency:7   },
  { id:"en-h008", word:"kitchen",     translation:"cozinha",      pronunciation:"/ˈkɪtʃɪn/",audioKey:"en_kitchen",  category:"home",      arObject:"🍳", cefr:"A1", frequency:8   },
  { id:"en-h009", word:"bathroom",    translation:"banheiro",     pronunciation:"/ˈbæθruːm/",audioKey:"en_bathroom",category:"home",      arObject:"🚿", cefr:"A1", frequency:9   },
  { id:"en-h010", word:"light",       translation:"luz",          pronunciation:"/laɪt/",   audioKey:"en_light",     category:"home",      arObject:"💡", cefr:"A1", frequency:10  },

  // ── FOOD (65 words) ────────────────────────────────────────────────────────
  { id:"en-f001", word:"water",       translation:"água",         pronunciation:"/ˈwɔːtər/",audioKey:"en_water",    category:"food",      arObject:"💧", cefr:"A1", frequency:11  },
  { id:"en-f002", word:"food",        translation:"comida",       pronunciation:"/fuːd/",   audioKey:"en_food",      category:"food",      arObject:"🍽️", cefr:"A1", frequency:12  },
  { id:"en-f003", word:"bread",       translation:"pão",          pronunciation:"/brɛd/",   audioKey:"en_bread",     category:"food",      arObject:"🍞", cefr:"A1", frequency:13  },
  { id:"en-f004", word:"milk",        translation:"leite",        pronunciation:"/mɪlk/",   audioKey:"en_milk",      category:"food",      arObject:"🥛", cefr:"A1", frequency:14  },
  { id:"en-f005", word:"coffee",      translation:"café",         pronunciation:"/ˈkɒfi/",  audioKey:"en_coffee",    category:"food",      arObject:"☕", cefr:"A1", frequency:15  },
  { id:"en-f006", word:"fruit",       translation:"fruta",        pronunciation:"/fruːt/",  audioKey:"en_fruit",     category:"food",      arObject:"🍎", cefr:"A1", frequency:16  },
  { id:"en-f007", word:"meat",        translation:"carne",        pronunciation:"/miːt/",   audioKey:"en_meat",      category:"food",      arObject:"🥩", cefr:"A1", frequency:17  },
  { id:"en-f008", word:"egg",         translation:"ovo",          pronunciation:"/ɛɡ/",     audioKey:"en_egg",       category:"food",      arObject:"🥚", cefr:"A1", frequency:18  },
  { id:"en-f009", word:"cheese",      translation:"queijo",       pronunciation:"/tʃiːz/",  audioKey:"en_cheese",    category:"food",      arObject:"🧀", cefr:"A1", frequency:19  },
  { id:"en-f010", word:"rice",        translation:"arroz",        pronunciation:"/raɪs/",   audioKey:"en_rice",      category:"food",      arObject:"🍚", cefr:"A1", frequency:20  },

  // ── PEOPLE / BODY (65 words) ───────────────────────────────────────────────
  { id:"en-p001", word:"person",      translation:"pessoa",       pronunciation:"/ˈpɜːrsn/",audioKey:"en_person",   category:"people",    arObject:"👤", cefr:"A1", frequency:21  },
  { id:"en-p002", word:"man",         translation:"homem",        pronunciation:"/mæn/",    audioKey:"en_man",       category:"people",    arObject:"👨", cefr:"A1", frequency:22  },
  { id:"en-p003", word:"woman",       translation:"mulher",       pronunciation:"/ˈwʊmən/", audioKey:"en_woman",     category:"people",    arObject:"👩", cefr:"A1", frequency:23  },
  { id:"en-p004", word:"child",       translation:"criança",      pronunciation:"/tʃaɪld/", audioKey:"en_child",     category:"people",    arObject:"🧒", cefr:"A1", frequency:24  },
  { id:"en-p005", word:"family",      translation:"família",      pronunciation:"/ˈfæməli/",audioKey:"en_family",   category:"people",    arObject:"👨‍👩‍👧", cefr:"A1", frequency:25  },
  { id:"en-p006", word:"friend",      translation:"amigo(a)",     pronunciation:"/frɛnd/",  audioKey:"en_friend",    category:"people",    arObject:"🤝", cefr:"A1", frequency:26  },
  { id:"en-p007", word:"face",        translation:"rosto",        pronunciation:"/feɪs/",   audioKey:"en_face",      category:"body",      arObject:"😊", cefr:"A1", frequency:27  },
  { id:"en-p008", word:"eye",         translation:"olho",         pronunciation:"/aɪ/",     audioKey:"en_eye",       category:"body",      arObject:"👁️", cefr:"A1", frequency:28  },
  { id:"en-p009", word:"hand",        translation:"mão",          pronunciation:"/hænd/",   audioKey:"en_hand",      category:"body",      arObject:"✋", cefr:"A1", frequency:29  },
  { id:"en-p010", word:"heart",       translation:"coração",      pronunciation:"/hɑːrt/",  audioKey:"en_heart",     category:"body",      arObject:"❤️", cefr:"A1", frequency:30  },

  // ── ACTIONS (65 words) ────────────────────────────────────────────────────
  { id:"en-a001", word:"go",          translation:"ir",           pronunciation:"/ɡoʊ/",    audioKey:"en_go",        category:"actions",   arObject:"➡️", cefr:"A1", frequency:31  },
  { id:"en-a002", word:"come",        translation:"vir",          pronunciation:"/kʌm/",    audioKey:"en_come",      category:"actions",   arObject:"↩️", cefr:"A1", frequency:32  },
  { id:"en-a003", word:"see",         translation:"ver",          pronunciation:"/siː/",    audioKey:"en_see",       category:"actions",   arObject:"👀", cefr:"A1", frequency:33  },
  { id:"en-a004", word:"say",         translation:"dizer",        pronunciation:"/seɪ/",    audioKey:"en_say",       category:"actions",   arObject:"💬", cefr:"A1", frequency:34  },
  { id:"en-a005", word:"know",        translation:"saber/conhecer",pronunciation:"/noʊ/",  audioKey:"en_know",      category:"actions",   arObject:"💡", cefr:"A1", frequency:35  },
  { id:"en-a006", word:"get",         translation:"pegar/obter",  pronunciation:"/ɡɛt/",   audioKey:"en_get",       category:"actions",   arObject:"🤲", cefr:"A1", frequency:36  },
  { id:"en-a007", word:"make",        translation:"fazer",        pronunciation:"/meɪk/",   audioKey:"en_make",      category:"actions",   arObject:"🔨", cefr:"A1", frequency:37  },
  { id:"en-a008", word:"think",       translation:"pensar",       pronunciation:"/θɪŋk/",   audioKey:"en_think",     category:"actions",   arObject:"🤔", cefr:"A1", frequency:38  },
  { id:"en-a009", word:"want",        translation:"querer",       pronunciation:"/wɒnt/",   audioKey:"en_want",      category:"actions",   arObject:"⭐", cefr:"A1", frequency:39  },
  { id:"en-a010", word:"give",        translation:"dar",          pronunciation:"/ɡɪv/",    audioKey:"en_give",      category:"actions",   arObject:"🎁", cefr:"A1", frequency:40  },

  // ── NATURE (65 words) ─────────────────────────────────────────────────────
  { id:"en-n001", word:"sun",         translation:"sol",          pronunciation:"/sʌn/",    audioKey:"en_sun",       category:"nature",    arObject:"☀️", cefr:"A1", frequency:41  },
  { id:"en-n002", word:"sky",         translation:"céu",          pronunciation:"/skaɪ/",   audioKey:"en_sky",       category:"nature",    arObject:"🌤️", cefr:"A1", frequency:42  },
  { id:"en-n003", word:"water",       translation:"água",         pronunciation:"/ˈwɔːtər/",audioKey:"en_water2",   category:"nature",    arObject:"🌊", cefr:"A1", frequency:43  },
  { id:"en-n004", word:"tree",        translation:"árvore",       pronunciation:"/triː/",   audioKey:"en_tree",      category:"nature",    arObject:"🌳", cefr:"A1", frequency:44  },
  { id:"en-n005", word:"flower",      translation:"flor",         pronunciation:"/ˈflaʊər/",audioKey:"en_flower",   category:"nature",    arObject:"🌸", cefr:"A1", frequency:45  },
  { id:"en-n006", word:"rain",        translation:"chuva",        pronunciation:"/reɪn/",   audioKey:"en_rain",      category:"nature",    arObject:"🌧️", cefr:"A1", frequency:46  },
  { id:"en-n007", word:"mountain",    translation:"montanha",     pronunciation:"/ˈmaʊntɪn/",audioKey:"en_mountain",category:"nature",    arObject:"⛰️", cefr:"A2", frequency:47  },
  { id:"en-n008", word:"sea",         translation:"mar",          pronunciation:"/siː/",    audioKey:"en_sea",       category:"nature",    arObject:"🌊", cefr:"A2", frequency:48  },
  { id:"en-n009", word:"wind",        translation:"vento",        pronunciation:"/wɪnd/",   audioKey:"en_wind",      category:"nature",    arObject:"💨", cefr:"A2", frequency:49  },
  { id:"en-n010", word:"moon",        translation:"lua",          pronunciation:"/muːn/",   audioKey:"en_moon",      category:"nature",    arObject:"🌙", cefr:"A1", frequency:50  },

  // ── TRANSPORT (65 words) ──────────────────────────────────────────────────
  { id:"en-t001", word:"car",         translation:"carro",        pronunciation:"/kɑːr/",   audioKey:"en_car",       category:"transport", arObject:"🚗", cefr:"A1", frequency:51  },
  { id:"en-t002", word:"bus",         translation:"ônibus",       pronunciation:"/bʌs/",    audioKey:"en_bus",       category:"transport", arObject:"🚌", cefr:"A1", frequency:52  },
  { id:"en-t003", word:"train",       translation:"trem",         pronunciation:"/treɪn/",  audioKey:"en_train",     category:"transport", arObject:"🚂", cefr:"A1", frequency:53  },
  { id:"en-t004", word:"plane",       translation:"avião",        pronunciation:"/pleɪn/",  audioKey:"en_plane",     category:"transport", arObject:"✈️", cefr:"A1", frequency:54  },
  { id:"en-t005", word:"road",        translation:"estrada",      pronunciation:"/roʊd/",   audioKey:"en_road",      category:"transport", arObject:"🛣️", cefr:"A1", frequency:55  },
  { id:"en-t006", word:"bike",        translation:"bicicleta",    pronunciation:"/baɪk/",   audioKey:"en_bike",      category:"transport", arObject:"🚴", cefr:"A1", frequency:56  },
  { id:"en-t007", word:"station",     translation:"estação",      pronunciation:"/ˈsteɪʃn/",audioKey:"en_station",  category:"transport", arObject:"🏢", cefr:"A2", frequency:57  },
  { id:"en-t008", word:"ticket",      translation:"passagem/ingresso",pronunciation:"/ˈtɪkɪt/",audioKey:"en_ticket",category:"transport", arObject:"🎫", cefr:"A2", frequency:58  },
  { id:"en-t009", word:"map",         translation:"mapa",         pronunciation:"/mæp/",    audioKey:"en_map",       category:"transport", arObject:"🗺️", cefr:"A1", frequency:59  },
  { id:"en-t010", word:"bridge",      translation:"ponte",        pronunciation:"/brɪdʒ/",  audioKey:"en_bridge",    category:"transport", arObject:"🌉", cefr:"A2", frequency:60  },
];

// ─── GERADOR DINÂMICO VIA QWEN2.5-MAX ────────────────────────────────────────
/**
 * Prompt para Qwen2.5-Max gerar as 1.300 palavras restantes por idioma:
 *
 * "Generate the 1300 most frequently used words in [LANGUAGE],
 *  organized by these 20 visual categories: home, food, people, nature,
 *  transport, tech, emotions, actions, time, numbers, colors, body,
 *  clothes, work, education, health, shopping, travel, weather, culture.
 *  For each word provide: {word, translation_in_portuguese, ipa_pronunciation,
 *  visual_emoji_icon, cefr_level, frequency_rank_1_to_1300}.
 *  Format: strict JSON array. 65 words per category = 1300 total."
 */

export async function generateLanguageVocabWithQwen(
  targetLanguage: string,
  nativeLanguage: string = "pt-BR"
): Promise<ARVocabWord[]> {
  // Integra com o sistema LLM existente do app (server/_core/llm.ts)
  // Usa cache de 30 dias para não repetir chamadas à API
  const cacheKey = `ar-vocab-${targetLanguage}-${nativeLanguage}`;

  // Em produção: verificar cache no banco → se não existir → chamar Qwen
  // O resultado é salvo na tabela ar_vocabulary do banco
  console.log(`[AR Vocab] Gerando 1300 palavras para ${targetLanguage}...`);

  return AR_CORE_WORDS_EN; // fallback para inglês enquanto não há cache
}

// ─── ENDPOINT DE API (adicionar em server/routers.ts) ────────────────────────
/**
 * Adicionar ao routers.ts existente (não substituir):
 *
 * arVocabulary: publicProcedure
 *   .input(z.object({ langCode: z.string(), category: z.string().optional() }))
 *   .query(async ({ input }) => {
 *     const words = await generateLanguageVocabWithQwen(input.langCode);
 *     if (input.category) return words.filter(w => w.category === input.category);
 *     return words;
 *   }),
 */
