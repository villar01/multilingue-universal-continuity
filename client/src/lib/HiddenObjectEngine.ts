/**
 * HiddenObjectEngine — Motor central de Hidden Objects para AR
 * Detecta objetos via IA (Gemini Vision / TensorFlow fallback)
 * 7 interações por objeto: nome, áudio, gênero, frase, diálogo, cultura, quiz
 * Spaced Repetition SM-2 integrado
 */

export interface HiddenObject {
  id: string;
  label: string;           // nome no idioma-alvo
  labelNative: string;     // nome em português (referência)
  phonetic: string;        // pronúncia IPA
  gender?: string;         // artigo/gênero (der/die/das, le/la, o/a)
  genderColor?: string;    // cor visual do gênero
  exampleSentence: string; // frase de uso cotidiano
  dialogue: string[];      // mini-diálogo 2 turnos
  culturalNote: string;    // curiosidade cultural
  quiz: QuizItem;          // pergunta flash
  category: ObjectCategory;
  difficulty: number;      // 1-10
  x: number;               // posição % na imagem
  y: number;               // posição % na imagem
  width: number;           // tamanho % na imagem
  height: number;
  revealed: boolean;
  mastered: boolean;
  // Spaced Repetition SM-2
  sm2Interval: number;     // dias até próxima revisão
  sm2Repetitions: number;
  sm2EaseFactor: number;
  nextReview: Date;
}

export type ObjectCategory =
  | 'furniture' | 'electronics' | 'food' | 'architecture'
  | 'clothing' | 'nature' | 'vehicle' | 'body' | 'tool' | 'other';

export interface QuizItem {
  question: string;
  options: string[];
  correct: number;
  type: 'translation' | 'pronunciation' | 'usage';
}

export interface ARSession {
  id: string;
  imageUrl: string;
  language: string;
  teacherId: string;
  objects: HiddenObject[];
  score: number;
  startTime: Date;
  environment: string; // detected scene type
}

// ─────────────────────────────────────────────
// Vocabulário offline para 69 idiomas (subset)
// ─────────────────────────────────────────────
const OBJECT_VOCAB: Record<string, Record<string, {
  word: string; phonetic: string; gender?: string; genderColor?: string;
  sentence: string; culturalNote: string;
}>> = {
  'en-US': {
    'book': { word: 'book', phonetic: '/bʊk/', sentence: 'I read a book every night.', culturalNote: 'Books are often given as gifts in English-speaking cultures.' },
    'chair': { word: 'chair', phonetic: '/tʃɛr/', sentence: 'Please sit on the chair.', culturalNote: 'The "chair" also means the person leading a meeting.' },
    'table': { word: 'table', phonetic: '/ˈteɪbəl/', sentence: 'Dinner is on the table.', culturalNote: '"To table a discussion" means to postpone it in American English.' },
    'window': { word: 'window', phonetic: '/ˈwɪndoʊ/', sentence: 'Open the window, please.', culturalNote: 'Windows in old English homes were taxed, so some were bricked up.' },
    'door': { word: 'door', phonetic: '/dɔːr/', sentence: 'Close the door behind you.', culturalNote: '"When one door closes, another opens" is a common English proverb.' },
    'phone': { word: 'phone', phonetic: '/foʊn/', sentence: 'My phone needs charging.', culturalNote: 'The first phone call was made by Alexander Graham Bell in 1876.' },
    'cup': { word: 'cup', phonetic: '/kʌp/', sentence: 'Would you like a cup of tea?', culturalNote: 'Tea drinking is a strong tradition in British culture.' },
    'laptop': { word: 'laptop', phonetic: '/ˈlæptɒp/', sentence: 'I work on my laptop all day.', culturalNote: 'The first laptop was the Osborne 1, released in 1981.' },
    'clock': { word: 'clock', phonetic: '/klɒk/', sentence: 'The clock on the wall shows noon.', culturalNote: 'Big Ben in London is one of the world\'s most famous clocks.' },
    'plant': { word: 'plant', phonetic: '/plænt/', sentence: 'Water the plant every day.', culturalNote: 'Houseplants became popular in Victorian England as status symbols.' },
    'pen': { word: 'pen', phonetic: '/pɛn/', sentence: 'Can I borrow your pen?', culturalNote: 'The ballpoint pen was invented by László Bíró in 1938.' },
    'bag': { word: 'bag', phonetic: '/bæɡ/', sentence: 'I packed my bag for the trip.', culturalNote: '"Bag" can also mean to catch or obtain something informally.' },
  },
  'pt-BR': {
    'livro': { word: 'livro', phonetic: '/ˈlivɾu/', gender: 'o', genderColor: '#3B82F6', sentence: 'Eu leio um livro todo dia.', culturalNote: 'O Brasil tem uma das maiores feiras do livro do mundo, em Frankfurt.' },
    'cadeira': { word: 'cadeira', phonetic: '/kaˈdejɾa/', gender: 'a', genderColor: '#EC4899', sentence: 'Sente-se na cadeira.', culturalNote: 'A cadeira de balanço é muito comum nas casas do Nordeste brasileiro.' },
    'mesa': { word: 'mesa', phonetic: '/ˈmeza/', gender: 'a', genderColor: '#EC4899', sentence: 'O jantar está na mesa.', culturalNote: '"Mesa" em Portugal pode significar "plateau" geográfico.' },
    'janela': { word: 'janela', phonetic: '/ʒaˈnɛla/', gender: 'a', genderColor: '#EC4899', sentence: 'Abra a janela, por favor.', culturalNote: 'As janelas coloridas das casas coloniais são patrimônio histórico.' },
    'porta': { word: 'porta', phonetic: '/ˈpɔɾta/', gender: 'a', genderColor: '#EC4899', sentence: 'Feche a porta ao sair.', culturalNote: '"Porta" também significa oportunidade em expressões populares.' },
    'celular': { word: 'celular', phonetic: '/seluˈlaɾ/', gender: 'o', genderColor: '#3B82F6', sentence: 'Meu celular precisa de bateria.', culturalNote: 'O Brasil é um dos maiores mercados de smartphones do mundo.' },
    'xícara': { word: 'xícara', phonetic: '/ˈʃikaɾa/', gender: 'a', genderColor: '#EC4899', sentence: 'Quer uma xícara de café?', culturalNote: 'O Brasil é o maior produtor de café do mundo desde 1840.' },
  },
  'es-ES': {
    'libro': { word: 'libro', phonetic: '/ˈliβɾo/', gender: 'el', genderColor: '#3B82F6', sentence: 'Leo un libro cada noche.', culturalNote: 'El Día del Libro se celebra el 23 de abril en España.' },
    'silla': { word: 'silla', phonetic: '/ˈsiʎa/', gender: 'la', genderColor: '#EC4899', sentence: 'Siéntate en la silla.', culturalNote: 'La silla de montar española es famosa en la equitación mundial.' },
    'mesa': { word: 'mesa', phonetic: '/ˈmesa/', gender: 'la', genderColor: '#EC4899', sentence: 'La cena está en la mesa.', culturalNote: '"Mesa" también significa meseta geográfica en español.' },
    'ventana': { word: 'ventana', phonetic: '/benˈtana/', gender: 'la', genderColor: '#EC4899', sentence: 'Abre la ventana, por favor.', culturalNote: 'Las ventanas con rejas son características de la arquitectura andaluza.' },
    'puerta': { word: 'puerta', phonetic: '/ˈpweɾta/', gender: 'la', genderColor: '#EC4899', sentence: 'Cierra la puerta al salir.', culturalNote: 'La Puerta del Sol en Madrid es el kilómetro cero de España.' },
    'teléfono': { word: 'teléfono', phonetic: '/teˈlefono/', gender: 'el', genderColor: '#3B82F6', sentence: 'Mi teléfono necesita cargarse.', culturalNote: 'España tiene una de las tasas más altas de uso de smartphones en Europa.' },
  },
  'fr-FR': {
    'livre': { word: 'livre', phonetic: '/livʁ/', gender: 'le', genderColor: '#3B82F6', sentence: 'Je lis un livre chaque soir.', culturalNote: 'La France publie plus de 70 000 nouveaux livres par an.' },
    'chaise': { word: 'chaise', phonetic: '/ʃɛz/', gender: 'la', genderColor: '#EC4899', sentence: 'Asseyez-vous sur la chaise.', culturalNote: 'La chaise longue est une invention française du XVIIIe siècle.' },
    'table': { word: 'table', phonetic: '/tabl/', gender: 'la', genderColor: '#EC4899', sentence: 'Le dîner est sur la table.', culturalNote: 'La table ronde du roi Arthur est un symbole de la culture médiévale.' },
    'fenêtre': { word: 'fenêtre', phonetic: '/fənɛtʁ/', gender: 'la', genderColor: '#EC4899', sentence: 'Ouvrez la fenêtre, s\'il vous plaît.', culturalNote: 'Les fenêtres à guillotine sont typiques de l\'architecture haussmannienne.' },
    'porte': { word: 'porte', phonetic: '/pɔʁt/', gender: 'la', genderColor: '#EC4899', sentence: 'Fermez la porte en sortant.', culturalNote: 'La Porte de Versailles est un lieu d\'exposition célèbre à Paris.' },
  },
  'de-DE': {
    'Buch': { word: 'Buch', phonetic: '/buːx/', gender: 'das', genderColor: '#10B981', sentence: 'Ich lese jeden Abend ein Buch.', culturalNote: 'Deutschland hat eine der ältesten Buchmessen der Welt in Frankfurt.' },
    'Stuhl': { word: 'Stuhl', phonetic: '/ʃtuːl/', gender: 'der', genderColor: '#3B82F6', sentence: 'Setz dich auf den Stuhl.', culturalNote: 'Der Bauhaus-Stuhl ist ein Klassiker des deutschen Designs.' },
    'Tisch': { word: 'Tisch', phonetic: '/tɪʃ/', gender: 'der', genderColor: '#3B82F6', sentence: 'Das Abendessen steht auf dem Tisch.', culturalNote: '"Den Tisch decken" bedeutet, den Tisch für eine Mahlzeit vorzubereiten.' },
    'Fenster': { word: 'Fenster', phonetic: '/ˈfɛnstɐ/', gender: 'das', genderColor: '#10B981', sentence: 'Bitte öffne das Fenster.', culturalNote: 'Fachwerk-Fenster sind typisch für die deutsche Architektur.' },
    'Tür': { word: 'Tür', phonetic: '/tyːɐ̯/', gender: 'die', genderColor: '#EC4899', sentence: 'Schließ die Tür hinter dir.', culturalNote: 'Das Brandenburger Tor in Berlin ist das bekannteste Tor Deutschlands.' },
  },
  'ja-JP': {
    '本': { word: '本', phonetic: '/hoɴ/', sentence: '毎晩本を読みます。', culturalNote: '日本は世界で最も漫画が発達した国の一つです。' },
    '椅子': { word: '椅子', phonetic: '/isu/', sentence: '椅子に座ってください。', culturalNote: '日本の伝統的な座り方は床に直接座ることです。' },
    'テーブル': { word: 'テーブル', phonetic: '/teːburu/', sentence: '夕食はテーブルの上にあります。', culturalNote: '日本の食卓では箸を使います。' },
    '窓': { word: '窓', phonetic: '/mado/', sentence: '窓を開けてください。', culturalNote: '日本の伝統的な窓は障子と呼ばれる和紙で作られています。' },
    'ドア': { word: 'ドア', phonetic: '/doa/', sentence: 'ドアを閉めてください。', culturalNote: '日本の引き戸（スライドドア）は省スペース設計です。' },
  },
  'zh-CN': {
    '书': { word: '书', phonetic: '/ʂu⁵⁵/', sentence: '我每天晚上读书。', culturalNote: '中国是世界上最早发明印刷术的国家。' },
    '椅子': { word: '椅子', phonetic: '/i²¹⁴.tsɨ/', sentence: '请坐在椅子上。', culturalNote: '中国传统家具以红木为主要材料。' },
    '桌子': { word: '桌子', phonetic: '/ʈʂuo⁵⁵.tsɨ/', sentence: '晚饭在桌子上。', culturalNote: '中国的圆桌象征团圆和平等。' },
    '窗户': { word: '窗户', phonetic: '/ʈʂʰuaŋ⁵⁵.xu/', sentence: '请打开窗户。', culturalNote: '中国传统窗户上有精美的木雕花纹。' },
    '门': { word: '门', phonetic: '/mən³⁵/', sentence: '请关上门。', culturalNote: '中国传统红门象征吉祥和好运。' },
  },
};

// ─────────────────────────────────────────────
// Gerar quiz para um objeto
// ─────────────────────────────────────────────
function generateQuiz(obj: Partial<HiddenObject>, language: string, allObjects: string[]): QuizItem {
  const wrongOptions = allObjects
    .filter(o => o !== obj.label)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const options = [...wrongOptions, obj.label!].sort(() => Math.random() - 0.5);
  const correct = options.indexOf(obj.label!);

  return {
    question: `What is "${obj.labelNative}" in ${language}?`,
    options,
    correct,
    type: 'translation',
  };
}

// ─────────────────────────────────────────────
// Gerar diálogo contextual para um objeto
// ─────────────────────────────────────────────
function generateDialogue(word: string, sentence: string): string[] {
  return [
    `Teacher: Can you see the ${word} in this scene?`,
    `Student: Yes! "${sentence}"`,
  ];
}

// ─────────────────────────────────────────────
// Motor principal — detecta objetos em imagem
// ─────────────────────────────────────────────
export class HiddenObjectEngine {
  private language: string;
  private langCode: string;
  private masteredObjects: Set<string>;

  constructor(language: string, langCode: string, masteredObjects: string[] = []) {
    this.language = language;
    this.langCode = langCode;
    this.masteredObjects = new Set(masteredObjects);
  }

  /**
   * Detecta objetos via TensorFlow COCO-SSD (client-side, offline)
   * e enriquece com vocabulário do idioma-alvo
   */
  async detectFromTensorFlow(
    predictions: Array<{ class: string; score: number; bbox: [number, number, number, number] }>,
    imageWidth: number,
    imageHeight: number
  ): Promise<HiddenObject[]> {
    const vocab = OBJECT_VOCAB[this.langCode] || OBJECT_VOCAB['en-US'];
    const allWords = Object.values(vocab).map(v => v.word);

    return predictions
      .filter(p => p.score > 0.4)
      .slice(0, 12)
      .map((pred, i) => {
        const nativeLabel = pred.class.toLowerCase();
        const vocabEntry = vocab[nativeLabel] || vocab[Object.keys(vocab)[i % Object.keys(vocab).length]];

        const obj: HiddenObject = {
          id: `obj-${Date.now()}-${i}`,
          label: vocabEntry?.word || nativeLabel,
          labelNative: nativeLabel,
          phonetic: vocabEntry?.phonetic || `/${nativeLabel}/`,
          gender: vocabEntry?.gender,
          genderColor: vocabEntry?.genderColor,
          exampleSentence: vocabEntry?.sentence || `This is a ${nativeLabel}.`,
          dialogue: generateDialogue(vocabEntry?.word || nativeLabel, vocabEntry?.sentence || ''),
          culturalNote: vocabEntry?.culturalNote || `The ${nativeLabel} is common in everyday life.`,
          quiz: generateQuiz({ label: vocabEntry?.word || nativeLabel, labelNative: nativeLabel }, this.language, allWords),
          category: this.categorize(nativeLabel),
          difficulty: this.masteredObjects.has(nativeLabel) ? 7 : 3,
          x: (pred.bbox[0] / imageWidth) * 100,
          y: (pred.bbox[1] / imageHeight) * 100,
          width: (pred.bbox[2] / imageWidth) * 100,
          height: (pred.bbox[3] / imageHeight) * 100,
          revealed: false,
          mastered: this.masteredObjects.has(nativeLabel),
          sm2Interval: 1,
          sm2Repetitions: 0,
          sm2EaseFactor: 2.5,
          nextReview: new Date(),
        };
        return obj;
      });
  }

  /**
   * Detecta objetos via Gemini Vision (server-side, richer results)
   * Retorna lista de objetos com vocabulário completo
   */
  async detectFromGeminiResponse(geminiResult: string): Promise<HiddenObject[]> {
    try {
      const parsed = JSON.parse(geminiResult.replace(/```json|```/g, '').trim());
      const vocab = OBJECT_VOCAB[this.langCode] || OBJECT_VOCAB['en-US'];
      const allWords = Object.values(vocab).map(v => v.word);

      return (parsed as Array<{ object: string; word: string; phonetic: string; x?: number; y?: number }>)
        .slice(0, 15)
        .map((item, i) => {
          const nativeLabel = item.object.toLowerCase();
          const vocabEntry = vocab[nativeLabel];

          return {
            id: `gem-${Date.now()}-${i}`,
            label: item.word || vocabEntry?.word || item.object,
            labelNative: nativeLabel,
            phonetic: item.phonetic || vocabEntry?.phonetic || `/${item.word}/`,
            gender: vocabEntry?.gender,
            genderColor: vocabEntry?.genderColor,
            exampleSentence: vocabEntry?.sentence || `This is a ${item.word}.`,
            dialogue: generateDialogue(item.word, vocabEntry?.sentence || ''),
            culturalNote: vocabEntry?.culturalNote || `The ${nativeLabel} is part of daily life.`,
            quiz: generateQuiz({ label: item.word, labelNative: nativeLabel }, this.language, allWords),
            category: this.categorize(nativeLabel),
            difficulty: Math.floor(Math.random() * 5) + 1,
            x: item.x ?? Math.random() * 70 + 5,
            y: item.y ?? Math.random() * 70 + 5,
            width: 15,
            height: 10,
            revealed: false,
            mastered: this.masteredObjects.has(nativeLabel),
            sm2Interval: 1,
            sm2Repetitions: 0,
            sm2EaseFactor: 2.5,
            nextReview: new Date(),
          } as HiddenObject;
        });
    } catch {
      return this.getSimulatedObjects();
    }
  }

  /**
   * Objetos simulados para modo offline / demo
   */
  getSimulatedObjects(): HiddenObject[] {
    const vocab = OBJECT_VOCAB[this.langCode] || OBJECT_VOCAB['en-US'];
    const entries = Object.entries(vocab).slice(0, 8);
    const allWords = entries.map(([, v]) => v.word);

    const positions = [
      { x: 10, y: 15 }, { x: 60, y: 10 }, { x: 30, y: 50 },
      { x: 70, y: 55 }, { x: 15, y: 70 }, { x: 50, y: 75 },
      { x: 80, y: 25 }, { x: 40, y: 30 },
    ];

    return entries.map(([nativeLabel, v], i) => ({
      id: `sim-${i}`,
      label: v.word,
      labelNative: nativeLabel,
      phonetic: v.phonetic,
      gender: v.gender,
      genderColor: v.genderColor,
      exampleSentence: v.sentence,
      dialogue: generateDialogue(v.word, v.sentence),
      culturalNote: v.culturalNote,
      quiz: generateQuiz({ label: v.word, labelNative: nativeLabel }, this.language, allWords),
      category: this.categorize(nativeLabel),
      difficulty: i + 1,
      x: positions[i]?.x ?? 20,
      y: positions[i]?.y ?? 20,
      width: 18,
      height: 12,
      revealed: false,
      mastered: this.masteredObjects.has(nativeLabel),
      sm2Interval: 1,
      sm2Repetitions: 0,
      sm2EaseFactor: 2.5,
      nextReview: new Date(),
    }));
  }

  /**
   * SM-2 Spaced Repetition — atualiza intervalo após resposta
   * quality: 0-5 (0=blackout, 3=correct with difficulty, 5=perfect)
   */
  updateSM2(obj: HiddenObject, quality: number): HiddenObject {
    let { sm2Interval, sm2Repetitions, sm2EaseFactor } = obj;

    if (quality < 3) {
      sm2Repetitions = 0;
      sm2Interval = 1;
    } else {
      if (sm2Repetitions === 0) sm2Interval = 1;
      else if (sm2Repetitions === 1) sm2Interval = 6;
      else sm2Interval = Math.round(sm2Interval * sm2EaseFactor);

      sm2Repetitions += 1;
    }

    sm2EaseFactor = Math.max(1.3, sm2EaseFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + sm2Interval);

    return { ...obj, sm2Interval, sm2Repetitions, sm2EaseFactor, nextReview, mastered: sm2Repetitions >= 3 };
  }

  private categorize(label: string): ObjectCategory {
    const cats: Record<string, ObjectCategory> = {
      chair: 'furniture', table: 'furniture', sofa: 'furniture', bed: 'furniture', desk: 'furniture',
      laptop: 'electronics', phone: 'electronics', tv: 'electronics', computer: 'electronics',
      apple: 'food', cup: 'food', bottle: 'food', bowl: 'food',
      window: 'architecture', door: 'architecture', wall: 'architecture',
      shirt: 'clothing', bag: 'clothing', hat: 'clothing',
      plant: 'nature', tree: 'nature', flower: 'nature',
      car: 'vehicle', bicycle: 'vehicle', bus: 'vehicle',
      book: 'tool', pen: 'tool', clock: 'tool',
    };
    return cats[label] || 'other';
  }
}

export default HiddenObjectEngine;
