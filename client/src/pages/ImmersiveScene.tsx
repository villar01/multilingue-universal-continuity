import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { audioBase64ToObjectUrl } from "@/lib/audioSource";
import VoiceSelector from "../components/VoiceSelector";
import { useLocation } from "wouter";
import Notebook, { NotebookButton, addToNotebook, loadNotebook } from "../components/Notebook";
import ParetoPanel from "../components/ParetoPanel";
import { ParetoPracticeCycle } from "../components/ParetoPracticeCycle";
import { resolvePracticeCEFRLevel } from "@/lib/lesson-levels";
import type { ParetoWord } from "../lib/vocab-pareto";
import { getLessonStrings, getSelectedTeacherLang } from "../lib/lesson-i18n";
import { stopEdgeTTS } from "@/lib/edgeTTSClient";
import { getHotspotLabel } from "../lib/hotspot-translations";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { VoiceQualityBanner } from "@/components/VoiceQualityBanner";
import { getImmersiveHotspotSpeech } from "@/lib/immersiveHotspotSpeech";
import { createImmersiveHotspotInteraction } from "@/lib/immersiveHotspotInteraction";
import { getImmersiveDialogTeacherSpeech } from "@/lib/immersiveDialogSpeech";
import { getNativeDialogueTranslation, isPortugueseLocale } from "@/lib/immersiveDialogTranslation";
import { getNativeHelpSpeechRequest } from "@/lib/immersiveSpeechChannels";
import { type ImmersiveSpeechPurpose } from "@/lib/immersiveSpeechPolicy";
import { formatSceneTutorFeedback, getFreeDialogQuestionReply, shouldStartSceneTeacherAudio } from "@/lib/immersiveDialogFlow";
import { useVisemeSequence } from "@/hooks/useVisemeSequence";
import { useTTSVisemeSync, type VisemeData } from "@/lib/tts-viseme-sync";
import { ImmersionModeToggle } from "@/components/ImmersionModeToggle";
import { createAudioRecorder, microphoneErrorMessage, requestMicrophoneStream } from "@/lib/microphoneAccess";
import { findReferencedHotspotId, matchesImmersiveDialogAnswer } from "@/lib/immersiveDialogAnswer";
import { getSceneTutorReply } from "@/lib/immersiveSceneTutor";
import { getTargetLanguageTeachers, resolveSceneTeacherForTarget } from "@/lib/sceneTeacherResolver";
import type { DialogLine, Hotspot, Scene } from "@shared/immersiveSceneTypes";
import { isInitialCommercialTargetLanguage } from "@shared/commercialLanguageBlocks";
import { JAMES_TROPICAL_PILOT_CLIPS, type JamesTropicalPilotClip, type JamesTropicalPilotClipId } from "@shared/jamesTropicalPilotClips";
import { SOPHIE_CAFE_PILOT_CLIPS, type SophieCafePilotClip, type SophieCafePilotClipId } from "@shared/sophieCafePilotClips";
import { Apple, BookOpen, Car, Cloud, Coffee, Dog, Home, Landmark, Mic, Plane, Shell, Shirt, Sparkles, Square, Sun, TreePalm, Umbrella, Utensils, Waves, type LucideIcon } from "lucide-react";

type ScenePilotClip = JamesTropicalPilotClip | SophieCafePilotClip;

function waitForSpeechResult<T>(task: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => reject(new Error("scene-dialogue-speech-timeout")), timeoutMs);
    task.then(
      (result) => {
        clearTimeout(timeoutId);
        resolve(result);
      },
      (error) => {
        clearTimeout(timeoutId);
        reject(error);
      },
    );
  });
}

const HOTSPOT_ICON_COMPONENTS: Array<[string, LucideIcon]> = [
  ["sun", Sun], ["wave", Waves], ["ocean", Waves], ["sea", Waves], ["palm", TreePalm],
  ["tree", TreePalm], ["shell", Shell], ["sand", Umbrella], ["umbrella", Umbrella],
  ["towel", Shirt],
  ["cloud", Cloud], ["coffee", Coffee], ["restaurant", Utensils], ["food", Utensils],
  ["airport", Plane], ["plane", Plane], ["car", Car], ["home", Home], ["house", Home],
  ["book", BookOpen], ["museum", Landmark], ["apple", Apple], ["dog", Dog], ["shirt", Shirt],
];

const DIALOG_SPEECH_RATES = [
  { value: 0.7, label: "Lento" },
  { value: 0.85, label: "Estudo" },
  { value: 1, label: "Normal" },
] as const;

function HotspotVisual({ hotspot, size = 24 }: { hotspot: Hotspot; size?: number }) {
  const source = `${hotspot.id} ${hotspot.label}`.toLowerCase();
  const Icon = HOTSPOT_ICON_COMPONENTS.find(([key]) => source.includes(key))?.[1] || Sparkles;
  return <Icon size={size} strokeWidth={2.35} aria-hidden="true" />;
}

function audioBlobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error || new Error("Não foi possível ler o áudio gravado."));
    reader.onloadend = () => resolve(String(reader.result || ""));
    reader.readAsDataURL(blob);
  });
}

function getSceneLocationDisclosure(scene: Scene): string {
  const declaredLocations: Record<string, string> = {
    paris: "This lesson is set in Paris, France.",
    tokyo: "This lesson is set in Tokyo, Japan.",
    newyork: "This lesson is set in New York City, United States.",
  };
  return declaredLocations[scene.id]
    || `This is a generic educational illustration called ${scene.nameEn}; it is not assigned to a real country or city.`;
}

type ImmersiveCEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

const IMMERSIVE_CEFR_LEVELS: Array<{ value: ImmersiveCEFRLevel; label: string }> = [
  { value: "A1", label: "A1 · Início" },
  { value: "A2", label: "A2 · Básico" },
  { value: "B1", label: "B1 · Independente" },
  { value: "B2", label: "B2 · Intermediário alto" },
  { value: "C1", label: "C1 · Avançado" },
  { value: "C2", label: "C2 · Domínio" },
];

const sceneCefrLevel = (scene: Scene): ImmersiveCEFRLevel => resolvePracticeCEFRLevel(scene.difficulty) as ImmersiveCEFRLevel;

// ─── Scene Data (29 scenes with CDN images) ───────────────────────────────────
export const IMMERSIVE_VOICE_REFERENCE = {
  sceneId: "beach",
  teacherName: "James",
  language: "en-US",
  gender: "male" as const,
} as const;

export const IMMERSIVE_SCENES: Scene[] = [
  // ══════════════════════════════════════════════════════════════
  // CENAS COMPLETAS (5+ diálogos) — aparecem primeiro
  // ══════════════════════════════════════════════════════════════
  {
    id:"paris", name:"Paris, França", nameEn:"Paris Street", flag:"🇫🇷",
    bgImage:"/manus-storage/scene_paris_40173c5c.jpg",
    teacherImage:"/manus-storage/prof_sophie_a6324ef6.png",
    teacherName:"Sophie", teacherLang:"fr-FR", langCode:"fr", teacherGender:"female",
    teacherGreeting:"Bienvenue à Paris! Cliquez sur les objets pour apprendre!",
    greetingPt:"Bem-vindo a Paris! Clique nos objetos para aprender!",
    difficulty:"beginner", premium:false,
    dialog:[
      {speaker:"teacher", text:"Bonjour! Je m'appelle Sophie. Bienvenue à Paris!", textPt:"Olá! Meu nome é Sophie. Bem-vindo a Paris!"},
      {speaker:"user", text:"Bonjour Sophie! C'est magnifique ici!", textPt:"Olá Sophie! É magnífico aqui!", options:["Bonjour Sophie! C'est magnifique ici!","Je ne comprends pas.","Au revoir!"], correctIndex:0},
      {speaker:"teacher", text:"Oui! Voilà la Tour Eiffel. C'est le symbole de Paris.", textPt:"Sim! Ali está a Torre Eiffel. É o símbolo de Paris."},
      {speaker:"user", text:"Elle est très belle! Je voudrais prendre une photo.", textPt:"Ela é muito bonita! Eu gostaria de tirar uma foto.", options:["Elle est très belle! Je voudrais prendre une photo.","Non, je n'aime pas.","Où est le métro?"], correctIndex:0},
      {speaker:"teacher", text:"Bien sûr! Et regardez ce café — on dit 'café' en français.", textPt:"Claro! E olhe este café — dizemos 'café' em francês."},
      {speaker:"user", text:"Je voudrais un café, s'il vous plaît!", textPt:"Eu gostaria de um café, por favor!", options:["Je voudrais un café, s'il vous plaît!","Je n'aime pas le café.","Où est la boulangerie?"], correctIndex:0},
      {speaker:"teacher", text:"Parfait! Votre français est excellent! Continuez comme ça!", textPt:"Perfeito! Seu francês está excelente! Continue assim!"},
    ],
    hotspots:[
      {id:"tower", x:72, y:18, label:"Tour Eiffel", translation:"Torre Eiffel", pronunciation:"tur-e-FEL", example:"La Tour Eiffel est magnifique.", examplePt:"A Torre Eiffel é magnífica.", icon:"🗼", color:"#6366f1"},
      {id:"cafe", x:18, y:58, label:"Café", translation:"Café", pronunciation:"ka-FÉ", example:"Je prends un café.", examplePt:"Eu tomo um café.", icon:"☕", color:"#f59e0b"},
      {id:"rue", x:50, y:78, label:"Rue", translation:"Rua", pronunciation:"RÜ", example:"La rue est longue.", examplePt:"A rua é longa.", icon:"🛣️", color:"#10b981"},
      {id:"fleur", x:30, y:42, label:"Fleur", translation:"Flor", pronunciation:"FLÖR", example:"La fleur est belle.", examplePt:"A flor é bonita.", icon:"🌸", color:"#ec4899"},
      {id:"immeuble", x:85, y:32, label:"Immeuble", translation:"Prédio", pronunciation:"i-MÖBL", example:"L'immeuble est grand.", examplePt:"O prédio é grande.", icon:"🏢", color:"#8b5cf6"},
      {id:"ciel", x:55, y:12, label:"Ciel", translation:"Céu", pronunciation:"SJEL", example:"Le ciel est bleu.", examplePt:"O céu é azul.", icon:"☁️", color:"#3b82f6"},
      {id:"boulangerie", x:25, y:68, label:"Boulangerie", translation:"Padaria", pronunciation:"bu-lon-JRHI", example:"La boulangerie est ouverte.", examplePt:"A padaria está aberta.", icon:"🥖", color:"#d97706"},
      {id:"pont", x:60, y:55, label:"Pont", translation:"Ponte", pronunciation:"PON", example:"Le pont est ancien.", examplePt:"A ponte é antiga.", icon:"🌉", color:"#0891b2"},
    ]
  },
  {
    id:"beach", name:"Praia Tropical", nameEn:"Tropical Beach", flag:"🌊",
    bgImage:"/manus-storage/scene_beach_b760e0e7.jpg",
    teacherImage:"/manus-storage/prof_james_b9f2fff7.png",
    teacherName:"James", teacherLang:"en-US", langCode:"en", teacherGender:"male",
    // ANIMATED: Professor waves and celebrates on beach
    teacherAnimation: "professor-wave",
    teacherGreeting:"Welcome to the beach! Click the objects to learn!",
    greetingPt:"Bem-vindo à praia! Clique nos objetos para aprender!",
    difficulty:"beginner", premium:false,
    dialog:[
      {speaker:"teacher", text:"Hello! My name is James. Welcome to this beautiful tropical beach!", textPt:"Ol\u00e1! Meu nome \u00e9 James. Bem-vindo a esta linda praia tropical!"},
      {speaker:"user", text:"Hello James! The beach is amazing!", textPt:"Ol\u00e1 James! A praia \u00e9 incr\u00edvel!", options:["Hello James! The beach is amazing!","I don't like the beach.","Where is the hotel?"], correctIndex:0},
      {speaker:"teacher", text:"Look at the ocean! In English we say 'ocean' or 'sea'. The water is blue.", textPt:"Olhe para o oceano! Em ingl\u00eas dizemos 'ocean' ou 'sea'. A \u00e1gua \u00e9 azul."},
      {speaker:"user", text:"The ocean is beautiful! And the sand is warm.", textPt:"O oceano \u00e9 lindo! E a areia est\u00e1 quente.", options:["The ocean is beautiful! And the sand is warm.","I don't see the ocean.","Where is the pool?"], correctIndex:0},
      {speaker:"teacher", text:"Perfect! Now look at the palm tree. In English: 'palm tree'. Can you repeat?", textPt:"Perfeito! Agora olhe para a palmeira. Em ingl\u00eas: 'palm tree'. Voc\u00ea consegue repetir?"},
      {speaker:"user", text:"Palm tree! I can see the palm tree near the beach.", textPt:"Palm tree! Consigo ver a palmeira perto da praia.", options:["Palm tree! I can see the palm tree near the beach.","I don't know this word.","Is that a coconut tree?"], correctIndex:0},
      {speaker:"teacher", text:"Excellent! Your English is great! Keep practicing every day!", textPt:"Excelente! Seu ingl\u00eas est\u00e1 \u00f3timo! Continue praticando todos os dias!"},
    ],
    hotspots:[
      {id:"palm", x:79, y:24, label:"Palm Tree", translation:"Palmeira", pronunciation:"PAAM-tree", example:"The palm tree is tall.", examplePt:"A palmeira é alta.", icon:"🌴", color:"#22c55e"},
      {id:"ocean", x:24, y:66, label:"Ocean", translation:"Oceano", pronunciation:"OH-shën", example:"The ocean is deep.", examplePt:"O oceano é profundo.", icon:"🌊", color:"#06b6d4"},
      {id:"wave", x:38, y:58, label:"Wave", translation:"Onda", pronunciation:"WEYV", example:"The wave is big.", examplePt:"A onda é grande.", icon:"🌊", color:"#14b8a6"},
      {id:"sand", x:59, y:82, label:"Sand", translation:"Areia", pronunciation:"SÆND", example:"The sand is warm.", examplePt:"A areia está quente.", icon:"🏖️", color:"#f59e0b"},
    ]
  },
  {
    id:"forest", name:"Floresta Encantada", nameEn:"Enchanted Forest", flag:"🌲",
    bgImage:"/manus-storage/scene_forest_8d87f524.jpg",
    teacherImage:"/manus-storage/prof_james_b9f2fff7.png",
    teacherName:"James", teacherLang:"en-US", langCode:"en", teacherGender:"male",
    teacherGreeting:"Welcome to the Enchanted Forest! Click the objects to learn!",
    greetingPt:"Bem-vindo à Floresta Encantada! Clique nos objetos para aprender!",
    difficulty:"intermediate", premium:false,
    dialog:[
      {speaker:"teacher", text:"Hello! I'm James. Welcome to this magical enchanted forest!", textPt:"Olá! Sou James. Bem-vindo a esta mágica floresta encantada!"},
      {speaker:"user", text:"Hello James! The forest is so beautiful!", textPt:"Olá James! A floresta é tão bonita!", options:["Hello James! The forest is so beautiful!","I don't like forests.","Where is the hotel?"], correctIndex:0},
      {speaker:"teacher", text:"Look at that tree! In English we say 'tree'. It's very tall and old.", textPt:"Olhe para aquela árvore! Em inglês dizemos 'tree'. É muito alta e velha."},
      {speaker:"user", text:"Tree! And what about that red mushroom over there?", textPt:"Tree! E aquele cogumelo vermelho ali?", options:["Tree! And what about that red mushroom over there?","I don't see it.","Is it dangerous?"], correctIndex:0},
      {speaker:"teacher", text:"That's a mushroom! And the bird singing in the tree — we call it a 'bird'. Can you repeat?", textPt:"Isso é um cogumelo! E o pássaro cantando na árvore — chamamos de 'bird'. Você consegue repetir?"},
      {speaker:"user", text:"Mushroom and bird! I love learning English in the forest!", textPt:"Mushroom e bird! Adoro aprender inglês na floresta!", options:["Mushroom and bird! I love learning English in the forest!","This is too hard.","I give up."], correctIndex:0},
      {speaker:"teacher", text:"Excellent! Your English is improving every day! Keep it up!", textPt:"Excelente! Seu inglês está melhorando a cada dia! Continue assim!"},
    ],
    hotspots:[
      {id:"tree", x:25, y:22, label:"Tree", translation:"Árvore", pronunciation:"TREE", example:"The tree is very tall.", examplePt:"A árvore é muito alta.", icon:"🌲", color:"#16a34a"},
      {id:"mushroom", x:60, y:72, label:"Mushroom", translation:"Cogumelo", pronunciation:"MUSH-rum", example:"The mushroom is red.", examplePt:"O cogumelo é vermelho.", icon:"🍄", color:"#dc2626"},
      {id:"bird", x:75, y:28, label:"Bird", translation:"Pássaro", pronunciation:"BERD", example:"The bird is singing.", examplePt:"O pássaro está cantando.", icon:"🐦", color:"#2563eb"},
      {id:"flower", x:40, y:68, label:"Flower", translation:"Flor", pronunciation:"FLAU-er", example:"The flower is beautiful.", examplePt:"A flor é bonita.", icon:"🌺", color:"#db2777"},
      {id:"river", x:50, y:82, label:"River", translation:"Rio", pronunciation:"RIV-er", example:"The river is cold.", examplePt:"O rio é frio.", icon:"💧", color:"#0891b2"},
      {id:"sun", x:55, y:15, label:"Sun", translation:"Sol", pronunciation:"SÂN", example:"The sun shines through the trees.", examplePt:"O sol brilha entre as árvores.", icon:"☀️", color:"#ca8a04"},
    ]
  },
  {
    id:"tokyo", name:"Tóquio, Japão", nameEn:"Tokyo, Japan", flag:"🇯🇵",
    bgImage:"/manus-storage/scene_tokyo_fd6d9ada.jpg",
    teacherImage:"/manus-storage/prof_yuki_ae657681.png",
    teacherName:"Yuki", teacherLang:"ja-JP", langCode:"ja", teacherGender:"female",
    teacherGreeting:"東京へようこそ！オブジェクトをクリックして学びましょう！",
    greetingPt:"Bem-vindo a Tóquio! Clique nos objetos para aprender!",
    difficulty:"advanced", premium:true,
    dialog:[
      {speaker:"teacher", text:"こんにちは！私はゆきです。東京へようこそ！", textPt:"Olá! Sou Yuki. Bem-vindo a Tóquio!"},
      {speaker:"user", text:"こんにちは、ゆきさん！東京はすごいですね！", textPt:"Olá, Yuki! Tóquio é incrível!", options:["こんにちは、ゆきさん！東京はすごいですね！","わかりません。","さようなら。"], correctIndex:0},
      {speaker:"teacher", text:"ありがとう！あの神社を見てください。日本語で「神社」と言います。", textPt:"Obrigada! Veja aquele santuário. Em japonês dizemos 'jinja'."},
      {speaker:"user", text:"神社！とても美しいです。桜の花も見えます！", textPt:"Jinja! É muito bonito. Também vejo flores de cerejeira!", options:["神社！とても美しいです。桜の花も見えます！","難しいです。","もう一度言ってください。"], correctIndex:0},
      {speaker:"teacher", text:"そうです！桜は日本の象徴です。春に咲きます。", textPt:"Exato! A cerejeira é o símbolo do Japão. Floresce na primavera."},
      {speaker:"user", text:"日本語は難しいですが、とても面白いです！", textPt:"O japonês é difícil, mas muito interessante!", options:["日本語は難しいですが、とても面白いです！","日本語は嫌いです。","もう帰ります。"], correctIndex:0},
      {speaker:"teacher", text:"素晴らしい！毎日練習してください！", textPt:"Maravilhoso! Pratique todos os dias!"},
    ],
    hotspots:[
      {id:"fuji", x:47, y:18, label:"富士山", translation:"Monte Fuji", pronunciation:"fu-dji-san", example:"富士山は高いです。", examplePt:"O Monte Fuji é alto.", icon:"🗻", color:"#64748b"},
      {id:"street", x:54, y:72, label:"通り", translation:"Rua", pronunciation:"to-ori", example:"通りは賑やかです。", examplePt:"A rua é movimentada.", icon:"🛣️", color:"#7c3aed"},
      {id:"billboard", x:22, y:37, label:"広告", translation:"Publicidade", pronunciation:"ko-ku", example:"広告が見えます。", examplePt:"Vejo uma publicidade.", icon:"📋", color:"#0891b2"},
      {id:"screen", x:70, y:40, label:"画面", translation:"Tela", pronunciation:"ga-men", example:"画面が明るいです。", examplePt:"A tela está iluminada.", icon:"📺", color:"#2563eb"},
      {id:"building", x:84, y:48, label:"建物", translation:"Prédio", pronunciation:"ta-te-mo-no", example:"建物が高いです。", examplePt:"O prédio é alto.", icon:"🏢", color:"#6366f1"},
      {id:"sign", x:74, y:56, label:"看板", translation:"Placa", pronunciation:"can-ban", example:"看板が見えます。", examplePt:"Vejo a placa.", icon:"📋", color:"#14b8a6"},
    ]
  },
  {
    id:"newyork", name:"Nova York, EUA", nameEn:"New York City", flag:"🇺🇸",
    bgImage:"/manus-storage/scene_newyork_40ef7561.jpg",
    teacherImage:"/manus-storage/prof_james_b9f2fff7.png",
    teacherName:"James", teacherLang:"en-US", langCode:"en", teacherGender:"male",
    teacherGreeting:"Welcome to New York! Click the objects to learn!",
    greetingPt:"Bem-vindo a Nova York! Clique nos objetos para aprender!",
    difficulty:"intermediate", premium:false,
    dialog:[
      {speaker:"teacher", text:"Hey! Welcome to New York City — the Big Apple!", textPt:"Ei! Bem-vindo à cidade de Nova York — a Grande Maçã!"},
      {speaker:"user", text:"This city is absolutely amazing! The skyscrapers are huge!", textPt:"Esta cidade é absolutamente incrível! Os arranha-céus são enormes!", options:["This city is absolutely amazing! The skyscrapers are huge!","I'm lost.","Where is the hotel?"], correctIndex:0},
      {speaker:"teacher", text:"Yes! Those are skyscrapers. In English: 'sky-scra-per'. Can you say that?", textPt:"Sim! Esses são arranha-céus. Em inglês: 'sky-scra-per'. Você consegue dizer isso?"},
      {speaker:"user", text:"Skyscraper! And I can see a yellow taxi on the street!", textPt:"Skyscraper! E consigo ver um táxi amarelo na rua!", options:["Skyscraper! And I can see a yellow taxi on the street!","I don't understand.","Is that the subway?"], correctIndex:0},
      {speaker:"teacher", text:"Perfect! Yellow taxis are iconic in New York. You can also take the subway underground.", textPt:"Perfeito! Os táxis amarelos são icônicos em Nova York. Você também pode pegar o metrô subterrâneo."},
      {speaker:"user", text:"How do I take the subway? I want to go to Central Park!", textPt:"Como pego o metrô? Quero ir ao Central Park!", options:["How do I take the subway? I want to go to Central Park!","I prefer to walk.","I'll take a taxi."], correctIndex:0},
      {speaker:"teacher", text:"Great choice! Your English is excellent. Keep it up!", textPt:"Ótima escolha! Seu inglês está excelente. Continue assim!"},
    ],
    hotspots:[
      {id:"statue", x:7, y:48, label:"Statue", translation:"Estátua", pronunciation:"STÉ-tchu", example:"The statue is big.", examplePt:"A estátua é grande.", icon:"🗽", color:"#16a34a"},
      {id:"building", x:47, y:36, label:"Building", translation:"Prédio", pronunciation:"BIL-ding", example:"The building is tall.", examplePt:"O prédio é alto.", icon:"🏙️", color:"#6366f1"},
      {id:"city", x:67, y:55, label:"City", translation:"Cidade", pronunciation:"SI-ti", example:"This is a big city.", examplePt:"Esta é uma cidade grande.", icon:"🏙️", color:"#0ea5e9"},
      {id:"water", x:43, y:72, label:"Water", translation:"Água", pronunciation:"UÓ-ter", example:"The water is blue.", examplePt:"A água é azul.", icon:"🌊", color:"#0891b2"},
      {id:"sun", x:79, y:29, label:"Sun", translation:"Sol", pronunciation:"SÂN", example:"The sun is yellow.", examplePt:"O sol é amarelo.", icon:"☀️", color:"#f59e0b"},
      {id:"window", x:79, y:58, label:"Window", translation:"Janela", pronunciation:"WIN-dou", example:"The window is large.", examplePt:"A janela é grande.", icon:"🪟", color:"#64748b"},
    ]
  },
  {
    id:"kitchen", name:"Cozinha Moderna", nameEn:"Modern Kitchen", flag:"🍳",
    bgImage:"/manus-storage/scene_kitchen_305d6ac6.jpg",
    teacherImage:"/manus-storage/prof_carlos_3a763932.jpg",
    teacherName:"Carlos", teacherLang:"es-ES", langCode:"es", teacherGender:"male",
    teacherGreeting:"¡Bienvenido a la cocina! ¡Haz clic en los objetos para aprender!",
    greetingPt:"Bem-vindo à cozinha! Clique nos objetos para aprender!",
    difficulty:"beginner", premium:false,
    dialog:[
      {speaker:"teacher", text:"\u00a1Hola! Me llamo Carlos. \u00a1Bienvenido a mi cocina!", textPt:"Ol\u00e1! Meu nome \u00e9 Carlos. Bem-vindo \u00e0 minha cozinha!"},
      {speaker:"user", text:"\u00a1Hola Carlos! La cocina es muy bonita.", textPt:"Ol\u00e1 Carlos! A cozinha \u00e9 muito bonita.", options:["\u00a1Hola Carlos! La cocina es muy bonita.","No me gusta cocinar.","\u00bfD\u00f3nde est\u00e1 el ba\u00f1o?"], correctIndex:0},
      {speaker:"teacher", text:"\u00a1Gracias! Mira la nevera. En espa\u00f1ol decimos 'nevera' o 'refrigerador'.", textPt:"Obrigado! Olhe a geladeira. Em espanhol dizemos 'nevera' ou 'refrigerador'."},
      {speaker:"user", text:"\u00a1Entiendo! La nevera guarda los alimentos fr\u00edos.", textPt:"Entendo! A geladeira guarda os alimentos frios.", options:["\u00a1Entiendo! La nevera guarda los alimentos fr\u00edos.","No s\u00e9 qu\u00e9 es eso.","\u00bfPuedo comer?"], correctIndex:0},
      {speaker:"teacher", text:"\u00a1Exacto! Y el horno sirve para cocinar. \u00bfSabes c\u00f3mo se dice 'horno' en portugu\u00e9s?", textPt:"Exato! E o forno serve para cozinhar. Voc\u00ea sabe como se diz 'horno' em portugu\u00eas?"},
      {speaker:"user", text:"\u00a1S\u00ed! En portugu\u00e9s se dice 'forno'. \u00a1Son palabras similares!", textPt:"Sim! Em portugu\u00eas se diz 'forno'. S\u00e3o palavras parecidas!", options:["\u00a1S\u00ed! En portugu\u00e9s se dice 'forno'. \u00a1Son palabras similares!","No lo s\u00e9.","\u00bfCu\u00e1l es la diferencia?"], correctIndex:0},
      {speaker:"teacher", text:"\u00a1Muy bien! Tu espa\u00f1ol mejora cada d\u00eda. \u00a1Sigue as\u00ed!", textPt:"Muito bem! Seu espanhol melhora a cada dia. Continue assim!"},
    ],
    hotspots:[
      {id:"nevera", x:15, y:35, label:"Nevera", translation:"Geladeira", pronunciation:"ne-VE-ra", example:"La nevera está fría.", examplePt:"A geladeira está fria.", icon:"🧊", color:"#0ea5e9"},
      {id:"horno", x:50, y:65, label:"Horno", translation:"Forno", pronunciation:"OR-no", example:"El horno está caliente.", examplePt:"O forno está quente.", icon:"🔥", color:"#f97316"},
      {id:"mesa", x:70, y:75, label:"Mesa", translation:"Mesa", pronunciation:"ME-sa", example:"La mesa está limpia.", examplePt:"A mesa está limpa.", icon:"🪑", color:"#a16207"},
      {id:"ventana", x:80, y:25, label:"Ventana", translation:"Janela", pronunciation:"ben-TA-na", example:"La ventana está abierta.", examplePt:"A janela está aberta.", icon:"🪟", color:"#0891b2"},
      {id:"cuchara", x:35, y:52, label:"Cuchara", translation:"Colher", pronunciation:"ku-TCHA-ra", example:"La cuchara está en el recipiente.", examplePt:"A colher está no recipiente.", icon:"🥄", color:"#dc2626"},
      {id:"encimera", x:60, y:80, label:"Encimera", translation:"Bancada", pronunciation:"en-si-ME-ra", example:"La encimera está limpia.", examplePt:"A bancada está limpa.", icon:"🪵", color:"#7c3aed"},
    ]
  },
  {
    id:"restaurant", name:"Restaurante Brasileiro", nameEn:"Brazilian Restaurant", flag:"\ud83c\udde7\ud83c\uddf7",
    bgImage:"/manus-storage/scene_restaurant_d7d3f766.jpg",
    teacherImage:"/manus-storage/prof_ana_241ffde7.png",
    teacherName:"Ana", teacherLang:"pt-BR", langCode:"pt", teacherGender:"female",
    teacherGreeting:"Bem-vindo ao restaurante! Clique nos objetos para aprender!",
    greetingPt:"Bem-vindo ao restaurante! Clique nos objetos para aprender!",
    difficulty:"beginner", premium:false,
    dialog:[
      {speaker:"teacher", text:"Ol\u00e1! Meu nome \u00e9 Ana. Bem-vindo ao nosso restaurante brasileiro!", textPt:"Ol\u00e1! Meu nome \u00e9 Ana. Bem-vindo ao nosso restaurante brasileiro!"},
      {speaker:"user", text:"Ol\u00e1 Ana! O restaurante \u00e9 muito bonito.", textPt:"Ol\u00e1 Ana! O restaurante \u00e9 muito bonito.", options:["Ol\u00e1 Ana! O restaurante \u00e9 muito bonito.","N\u00e3o gosto de restaurantes.","Onde \u00e9 o banheiro?"], correctIndex:0},
      {speaker:"teacher", text:"Obrigada! Veja a mesa — em portugu\u00eas dizemos 'mesa'. E a vela se chama 'vela'.", textPt:"Obrigada! Veja a mesa — em portugu\u00eas dizemos 'mesa'. E a vela se chama 'vela'."},
      {speaker:"user", text:"Entendi! Mesa e vela. Posso ver o card\u00e1pio?", textPt:"Entendi! Mesa e vela. Posso ver o card\u00e1pio?", options:["Entendi! Mesa e vela. Posso ver o card\u00e1pio?","N\u00e3o entendi nada.","Quero ir embora."], correctIndex:0},
      {speaker:"teacher", text:"Claro! O card\u00e1pio est\u00e1 aqui. Temos massa, vinho e sobremesas deliciosas!", textPt:"Claro! O card\u00e1pio est\u00e1 aqui. Temos massa, vinho e sobremesas deliciosas!"},
      {speaker:"user", text:"Que \u00f3timo! Vou querer a massa com molho de tomate, por favor.", textPt:"Que \u00f3timo! Vou querer a massa com molho de tomate, por favor.", options:["Que \u00f3timo! Vou querer a massa com molho de tomate, por favor.","N\u00e3o quero nada.","Prefiro comer em casa."], correctIndex:0},
      {speaker:"teacher", text:"Perfeita escolha! Seu portugu\u00eas est\u00e1 excelente. Parab\u00e9ns!", textPt:"Perfeita escolha! Seu portugu\u00eas est\u00e1 excelente. Parab\u00e9ns!"},
    ],
    hotspots:[
      {id:"massa", x:28, y:77, label:"Massa", translation:"Pasta", pronunciation:"MA-ssa", example:"A massa está deliciosa.", examplePt:"A massa está deliciosa.", icon:"🍝", color:"#f59e0b"},
      {id:"vinho", x:25, y:45, label:"Vinho", translation:"Wine", pronunciation:"VI-nho", example:"O vinho é tinto.", examplePt:"O vinho é tinto.", icon:"🍷", color:"#dc2626"},
      {id:"mesa", x:70, y:54, label:"Mesa", translation:"Table", pronunciation:"ME-za", example:"A mesa está limpa.", examplePt:"A mesa está limpa.", icon:"🪑", color:"#a16207"},
      {id:"vela", x:41, y:49, label:"Vela", translation:"Candle", pronunciation:"VE-la", example:"A vela ilumina a mesa.", examplePt:"A vela ilumina a mesa.", icon:"🕯️", color:"#eab308"},
      {id:"quadro", x:84, y:33, label:"Quadro", translation:"Picture", pronunciation:"KWA-dro", example:"O quadro está na parede.", examplePt:"The picture is on the wall.", icon:"🖼️", color:"#6366f1"},
      {id:"janela", x:14, y:28, label:"Janela", translation:"Window", pronunciation:"ja-NE-la", example:"A janela é grande.", examplePt:"The window is big.", icon:"🪟", color:"#0891b2"},
    ]
  },
  {
    id:"airport", name:"Aeroporto Internacional", nameEn:"International Airport", flag:"✈️",
    bgImage:"/manus-storage/scene_airport_843d9307.jpg",
    teacherImage:"/manus-storage/prof_james_b9f2fff7.png",
    teacherName:"James", teacherLang:"en-US", langCode:"en", teacherGender:"male",
    teacherGreeting:"Welcome to the airport! Let's learn travel vocabulary!",
    greetingPt:"Bem-vindo ao aeroporto! Vamos aprender vocabulário de viagem!",
    difficulty:"intermediate", premium:false,
    dialog:[
      {speaker:"teacher", text:"Welcome to the airport! Do you have your passport ready?", textPt:"Bem-vindo ao aeroporto! Você tem seu passaporte pronto?"},
      {speaker:"user", text:"Yes, here is my passport and boarding pass!", textPt:"Sim, aqui está meu passaporte e cartão de embarque!", options:["Yes, here is my passport and boarding pass!","I lost my passport.","What is a boarding pass?"], correctIndex:0},
      {speaker:"teacher", text:"Great! Your flight is at gate B12. Do you see the screen with flight information?", textPt:"Ótimo! Seu voo é no portão B12. Você vê a tela com informações de voo?"},
      {speaker:"user", text:"Yes! The screen says my flight departs in one hour.", textPt:"Sim! A tela diz que meu voo parte em uma hora.", options:["Yes! The screen says my flight departs in one hour.","I can't read the screen.","Where is gate B12?"], correctIndex:0},
      {speaker:"teacher", text:"Perfect! Don't forget to pass through security. Remove your shoes and belt.", textPt:"Perfeito! Não esqueça de passar pela segurança. Tire os sapatos e o cinto."},
      {speaker:"user", text:"Understood! How heavy can my luggage be?", textPt:"Entendido! Qual é o peso máximo da bagagem?", options:["Understood! How heavy can my luggage be?","I don't have luggage.","Can I bring food?"], correctIndex:0},
      {speaker:"teacher", text:"Usually 23 kilograms for checked luggage. Have a great flight!", textPt:"Geralmente 23 quilos para bagagem despachada. Tenha um ótimo voo!"},
    ],
    hotspots:[
      {id:"gate", x:60, y:30, label:"Gate", translation:"Portão", pronunciation:"GEYT", example:"The gate is open.", examplePt:"O portão está aberto.", icon:"🚪", color:"#6366f1"},
      {id:"person", x:62, y:58, label:"Person", translation:"Pessoa", pronunciation:"PER-son", example:"The person is waiting.", examplePt:"A pessoa está esperando.", icon:"🧍", color:"#f59e0b"},
      {id:"people", x:50, y:55, label:"People", translation:"Pessoas", pronunciation:"PI-pol", example:"The people are waiting.", examplePt:"As pessoas estão esperando.", icon:"👥", color:"#0ea5e9"},
      {id:"sign", x:90, y:18, label:"Sign", translation:"Placa", pronunciation:"SAIN", example:"Read the sign.", examplePt:"Leia a placa.", icon:"📋", color:"#94a3b8"},
      {id:"window", x:20, y:35, label:"Window", translation:"Janela", pronunciation:"WIN-dou", example:"The window is large.", examplePt:"A janela é grande.", icon:"🪟", color:"#8b5cf6"},
      {id:"floor", x:45, y:72, label:"Floor", translation:"Chão", pronunciation:"FLÓR", example:"The floor is clean.", examplePt:"O chão está limpo.", icon:"⬇️", color:"#dc2626"},
    ]
  },
  {
    id:"hotel", name:"Hotel de Luxo", nameEn:"Luxury Hotel", flag:"🏨",
    bgImage:"/manus-storage/scene_hotel_8fff9928.jpg",
    teacherImage:"/manus-storage/prof_giulia_f8adfeb6.png",
    teacherName:"Giulia", teacherLang:"it-IT", langCode:"it", teacherGender:"female",
    teacherGreeting:"Benvenuto in hotel! Impariamo le parole dell'hotel!",
    greetingPt:"Bem-vindo ao hotel! Vamos aprender palavras do hotel!",
    difficulty:"intermediate", premium:false,
    dialog:[
      {speaker:"teacher", text:"Buongiorno! Benvenuto in hotel. Ha una prenotazione?", textPt:"Bom dia! Bem-vindo ao hotel. Tem uma reserva?"},
      {speaker:"user", text:"Sì, ho una prenotazione. Mi chiamo Marco.", textPt:"Sim, tenho uma reserva. Meu nome é Marco.", options:["Sì, ho una prenotazione. Mi chiamo Marco.","No, non ho prenotazione.","Forse, non ricordo."], correctIndex:0},
      {speaker:"teacher", text:"Perfetto, Marco! La sua camera è al terzo piano. Ecco la chiave.", textPt:"Perfeito, Marco! Seu quarto fica no terceiro andar. Aqui está a chave."},
      {speaker:"user", text:"Grazie! Dov'è l'ascensore?", textPt:"Obrigado! Onde fica o elevador?", options:["Grazie! Dov'è l'ascensore?","Non capisco.","Posso avere un'altra camera?"], correctIndex:0},
      {speaker:"teacher", text:"L'ascensore è a destra. La piscina è al piano terra, aperta fino alle 22.", textPt:"O elevador fica à direita. A piscina fica no térreo, aberta até as 22h."},
      {speaker:"user", text:"Meraviglioso! E il ristorante, a che ora apre?", textPt:"Maravilhoso! E o restaurante, a que horas abre?", options:["Meraviglioso! E il ristorante, a che ora apre?","Non ho fame.","Preferisco mangiare fuori."], correctIndex:0},
      {speaker:"teacher", text:"Il ristorante apre alle sette di sera. Buon soggiorno!", textPt:"O restaurante abre às sete da noite. Boa estadia!"},
    ],
    hotspots:[
      {id:"reception", x:40, y:55, label:"Reception", translation:"Recepção", pronunciation:"re-tche-TSIO-ne", example:"La reception è al piano terra.", examplePt:"A recepção fica no térreo.", icon:"🛎️", color:"#f59e0b"},
      {id:"lampadario", x:55, y:22, label:"Lampadario", translation:"Lustre", pronunciation:"lam-pa-DA-rio", example:"Il lampadario è grande.", examplePt:"O lustre é grande.", icon:"💡", color:"#eab308"},
      {id:"colonna", x:80, y:35, label:"Colonna", translation:"Coluna", pronunciation:"ko-LON-na", example:"La colonna è alta.", examplePt:"A coluna é alta.", icon:"🏛️", color:"#6366f1"},
      {id:"poltrona", x:28, y:74, label:"Poltrona", translation:"Poltrona", pronunciation:"pol-TRO-na", example:"La poltrona è comoda.", examplePt:"A poltrona é confortável.", icon:"🪑", color:"#0ea5e9"},
      {id:"pianta", x:48, y:56, label:"Pianta", translation:"Planta", pronunciation:"PIAN-ta", example:"La pianta è verde.", examplePt:"A planta é verde.", icon:"🌿", color:"#8b5cf6"},
      {id:"lampada", x:66, y:55, label:"Lampada", translation:"Luminária", pronunciation:"lam-PA-da", example:"La lampada è accesa.", examplePt:"A luminária está acesa.", icon:"💡", color:"#dc2626"},
    ]
  },
  {
    id:"supermarket", name:"Supermercado", nameEn:"Supermarket", flag:"🛒",
    bgImage:"/manus-storage/scene_supermarket_31f4bb92.jpg",
    teacherImage:"/manus-storage/prof_carlos_3a763932.jpg",
    teacherName:"Carlos", teacherLang:"es-ES", langCode:"es", teacherGender:"male",
    teacherGreeting:"¡Bienvenido al supermercado! ¡Aprendamos a hacer compras!",
    greetingPt:"Bem-vindo ao supermercado! Vamos aprender a fazer compras!",
    difficulty:"beginner", premium:false,
    dialog:[
      {speaker:"teacher", text:"¡Bienvenido al supermercado! ¿Qué necesitas comprar hoy?", textPt:"Bem-vindo ao supermercado! O que você precisa comprar hoje?"},
      {speaker:"user", text:"Necesito leche, pan y fruta fresca.", textPt:"Preciso de leite, pão e fruta fresca.", options:["Necesito leche, pan y fruta fresca.","No necesito nada.","No sé qué comprar."], correctIndex:0},
      {speaker:"teacher", text:"¡Perfecto! La fruta está en el pasillo tres. ¿Sabes cómo pedir el precio?", textPt:"Perfeito! A fruta fica no corredor três. Você sabe como perguntar o preço?"},
      {speaker:"user", text:"¡Sí! Digo: '¿Cuál es el precio de esta fruta?'", textPt:"Sim! Digo: 'Qual é o preço desta fruta?'", options:["¡Sí! Digo: '¿Cuál es el precio de esta fruta?'","No sé cómo preguntar.","Prefiero no preguntar."], correctIndex:0},
      {speaker:"teacher", text:"¡Excelente! Y cuando termines, vas a la caja para pagar.", textPt:"Excelente! E quando terminar, vá ao caixa para pagar."},
      {speaker:"user", text:"¿Puedo pagar con tarjeta de crédito?", textPt:"Posso pagar com cartão de crédito?", options:["¿Puedo pagar con tarjeta de crédito?","Solo tengo efectivo.","¿Dónde está la salida?"], correctIndex:0},
      {speaker:"teacher", text:"¡Claro que sí! Tu español está mejorando mucho. ¡Muy bien!", textPt:"Claro que sim! Seu espanhol está melhorando muito. Muito bem!"},
    ],
    hotspots:[
      {id:"carrito", x:35, y:65, label:"Carrito", translation:"Carrinho", pronunciation:"ka-RRI-to", example:"El carrito está lleno.", examplePt:"O carrinho está cheio.", icon:"🛒", color:"#f59e0b"},
      {id:"fruta", x:20, y:40, label:"Fruta", translation:"Fruta", pronunciation:"FRU-ta", example:"La fruta es fresca.", examplePt:"A fruta está fresca.", icon:"🍎", color:"#dc2626"},
      {id:"pan", x:60, y:45, label:"Pan", translation:"Pão", pronunciation:"pan", example:"El pan está caliente.", examplePt:"O pão está quente.", icon:"🍞", color:"#a16207"},
      {id:"leche", x:75, y:35, label:"Leche", translation:"Leite", pronunciation:"LE-tche", example:"La leche es blanca.", examplePt:"O leite é branco.", icon:"🥛", color:"#e2e8f0"},
      {id:"caja", x:50, y:78, label:"Caja", translation:"Caixa", pronunciation:"KA-kha", example:"La caja está al fondo.", examplePt:"O caixa fica no fundo.", icon:"💳", color:"#6366f1"},
      {id:"precio", x:85, y:55, label:"Precio", translation:"Preço", pronunciation:"PRE-sio", example:"¿Cuál es el precio?", examplePt:"Qual é o preço?", icon:"🏷️", color:"#22c55e"},
    ]
  },
  {
    id:"school", name:"Sala de Aula", nameEn:"Classroom", flag:"📚",
    bgImage:"/manus-storage/scene_school_8568b950.jpg",
    teacherImage:"/manus-storage/prof_james_b9f2fff7.png",
    teacherName:"James", teacherLang:"en-US", langCode:"en", teacherGender:"male",
    teacherGreeting:"Welcome to the classroom! Let's study together!",
    greetingPt:"Bem-vindo à sala de aula! Vamos estudar juntos!",
    difficulty:"beginner", premium:false,
    dialog:[
      {speaker:"teacher", text:"Good morning class! Please open your books to page ten.", textPt:"Bom dia turma! Por favor, abram seus livros na página dez."},
      {speaker:"user", text:"Good morning, teacher! I'm ready to learn!", textPt:"Bom dia, professor! Estou pronto para aprender!", options:["Good morning, teacher! I'm ready to learn!","I forgot my book.","Can I sit in the back?"], correctIndex:0},
      {speaker:"teacher", text:"Excellent attitude! Now look at the blackboard. I will write new vocabulary.", textPt:"Excelente atitude! Agora olhe para a lousa. Vou escrever vocabulário novo."},
      {speaker:"user", text:"I can see the blackboard clearly from my desk.", textPt:"Consigo ver a lousa claramente da minha carteira.", options:["I can see the blackboard clearly from my desk.","I can't see the board.","Can I move my desk?"], correctIndex:0},
      {speaker:"teacher", text:"Great! Use your pencil to write these words in your notebook.", textPt:"Ótimo! Use seu lápis para escrever essas palavras no seu caderno."},
      {speaker:"user", text:"Should I also write the clock time when I take notes?", textPt:"Devo também escrever o horário do relógio quando faço anotações?", options:["Should I also write the clock time when I take notes?","I don't have a pencil.","Can I use a pen instead?"], correctIndex:0},
      {speaker:"teacher", text:"That's a great habit! Your English is improving every lesson!", textPt:"Esse é um ótimo hábito! Seu inglês melhora a cada aula!"},
    ],
    hotspots:[
      {id:"board", x:50, y:22, label:"Blackboard", translation:"Lousa", pronunciation:"BLÆK-bord", example:"Write on the blackboard.", examplePt:"Escreva na lousa.", icon:"📋", color:"#16a34a"},
      {id:"desk", x:35, y:68, label:"Desk", translation:"Carteira", pronunciation:"DESK", example:"Sit at your desk.", examplePt:"Sente-se na sua carteira.", icon:"🪑", color:"#a16207"},
      {id:"book", x:65, y:58, label:"Book", translation:"Livro", pronunciation:"BUK", example:"Read the book.", examplePt:"Leia o livro.", icon:"📖", color:"#6366f1"},
      {id:"pencil", x:20, y:55, label:"Pencil", translation:"Lápis", pronunciation:"PEN-sil", example:"Use a pencil.", examplePt:"Use um lápis.", icon:"✏️", color:"#eab308"},
      {id:"window", x:80, y:30, label:"Window", translation:"Janela", pronunciation:"WIN-dou", example:"Open the window.", examplePt:"Abra a janela.", icon:"🪟", color:"#0ea5e9"},
      {id:"clock", x:85, y:15, label:"Clock", translation:"Relógio", pronunciation:"KLOK", example:"Look at the clock.", examplePt:"Olhe para o relógio.", icon:"🕐", color:"#dc2626"},
    ]
  },
  {
    id:"hospital", name:"Hospital", nameEn:"Hospital", flag:"🏥",
    bgImage:"/manus-storage/scene_hospital_891a1727.jpg",
    teacherImage:"/manus-storage/prof_priya_7c36613d.png",
    teacherName:"Priya", teacherLang:"en-GB", langCode:"en", teacherGender:"female",
    teacherGreeting:"Welcome to the hospital! Learn medical vocabulary!",
    greetingPt:"Bem-vindo ao hospital! Aprenda vocabulário médico!",
    difficulty:"intermediate", premium:true,
    dialog:[
      {speaker:"teacher", text:"Good morning! I'm Dr. Priya. How are you feeling today?", textPt:"Bom dia! Sou a Dra. Priya. Como você está se sentindo hoje?"},
      {speaker:"user", text:"I have a headache and I feel very tired.", textPt:"Estou com dor de cabeça e me sinto muito cansado.", options:["I have a headache and I feel very tired.","I'm perfectly fine.","I don't know what's wrong."], correctIndex:0},
      {speaker:"teacher", text:"I see. How long have you had this headache? Since this morning?", textPt:"Entendo. Há quanto tempo você tem essa dor de cabeça? Desde esta manhã?"},
      {speaker:"user", text:"Yes, since this morning. I also have a fever.", textPt:"Sim, desde esta manhã. Também estou com febre.", options:["Yes, since this morning. I also have a fever.","No, it started yesterday.","I'm not sure."], correctIndex:0},
      {speaker:"teacher", text:"Let me check. The nurse will take your temperature. We may need an X-ray.", textPt:"Deixe-me verificar. A enfermeira vai medir sua temperatura. Podemos precisar de um raio-X."},
      {speaker:"user", text:"Should I take medicine now? I have some in my bag.", textPt:"Devo tomar remédio agora? Tenho alguns na minha bolsa.", options:["Should I take medicine now? I have some in my bag.","I don't want any medicine.","Can I go home?"], correctIndex:0},
      {speaker:"teacher", text:"Wait for the diagnosis first. Rest in the hospital bed for now.", textPt:"Aguarde o diagnóstico primeiro. Descanse na cama hospitalar por enquanto."},
    ],
    hotspots:[
      {id:"doctor", x:30, y:35, label:"Doctor", translation:"Médico", pronunciation:"DOK-ter", example:"The doctor is kind.", examplePt:"O médico é gentil.", icon:"👨‍⚕️", color:"#0ea5e9"},
      {id:"medicine", x:60, y:55, label:"Medicine", translation:"Remédio", pronunciation:"MED-i-sin", example:"Take your medicine.", examplePt:"Tome seu remédio.", icon:"💊", color:"#dc2626"},
      {id:"bed", x:75, y:65, label:"Hospital Bed", translation:"Cama hospitalar", pronunciation:"HOS-pi-tal BED", example:"Rest in the bed.", examplePt:"Descanse na cama.", icon:"🛏️", color:"#8b5cf6"},
      {id:"xray", x:20, y:50, label:"X-Ray", translation:"Raio-X", pronunciation:"EKS-rey", example:"Take an X-ray.", examplePt:"Faça um raio-X.", icon:"🩻", color:"#64748b"},
      {id:"nurse", x:50, y:30, label:"Nurse", translation:"Enfermeira", pronunciation:"NÖRS", example:"The nurse helps.", examplePt:"A enfermeira ajuda.", icon:"👩‍⚕️", color:"#ec4899"},
      {id:"ambulance", x:85, y:75, label:"Ambulance", translation:"Ambulância", pronunciation:"AM-biu-lens", example:"Call an ambulance!", examplePt:"Chame uma ambulância!", icon:"🚑", color:"#f97316"},
    ]
  },
  {
    id:"park", name:"Parque da Cidade", nameEn:"City Park", flag:"🌳",
    bgImage:"/manus-storage/scene_park_22801348.jpg",
    teacherImage:"/manus-storage/prof_sophie_a6324ef6.png",
    teacherName:"Sophie", teacherLang:"fr-FR", langCode:"fr", teacherGender:"female",
    teacherGreeting:"Bienvenue au parc! Profitons de la nature!",
    greetingPt:"Bem-vindo ao parque! Vamos aproveitar a natureza!",
    difficulty:"beginner", premium:false,
    dialog:[
      {speaker:"teacher", text:"Bonjour! Je m'appelle Sophie. Quel beau parc, n'est-ce pas?", textPt:"Bom dia! Meu nome é Sophie. Que parque bonito, não é?"},
      {speaker:"user", text:"Oui, c'est magnifique! J'adore la nature et les arbres.", textPt:"Sim, é magnífico! Adoro a natureza e as árvores.", options:["Oui, c'est magnifique! J'adore la nature et les arbres.","Non, je préfère la ville.","Je ne sais pas."], correctIndex:0},
      {speaker:"teacher", text:"Très bien! Regardez cette fontaine — en français on dit 'fontaine'. C'est beau, non?", textPt:"Muito bem! Olhe esta fonte — em francês dizemos 'fontaine'. É bonito, não é?"},
      {speaker:"user", text:"La fontaine est très belle! Et j'entends un oiseau chanter!", textPt:"A fonte é muito bonita! E ouço um pássaro cantando!", options:["La fontaine est très belle! Et j'entends un oiseau chanter!","Je n'aime pas les fontaines.","Où est le café?"], correctIndex:0},
      {speaker:"teacher", text:"Oui! L'oiseau chante sur le banc. Asseyons-nous et écoutons.", textPt:"Sim! O pássaro canta no banco. Vamos sentar e ouvir."},
      {speaker:"user", text:"Avec plaisir! Le chemin dans le parc est très agréable aussi.", textPt:"Com prazer! O caminho no parque também é muito agradável.", options:["Avec plaisir! Le chemin dans le parc est très agréable aussi.","Je suis fatigué.","Je veux rentrer."], correctIndex:0},
      {speaker:"teacher", text:"Parfait! Votre français progresse très bien. Continuez!", textPt:"Perfeito! Seu francês está progredindo muito bem. Continue!"},
    ],
    hotspots:[
      {id:"arbre", x:25, y:25, label:"Arbre", translation:"Árvore", pronunciation:"AR-bre", example:"L'arbre est grand.", examplePt:"A árvore é grande.", icon:"🌳", color:"#16a34a"},
      {id:"jeux", x:10, y:62, label:"Jeux", translation:"Brinquedos", pronunciation:"JÖ", example:"Les jeux sont dans le parc.", examplePt:"Os brinquedos estão no parque.", icon:"🎠", color:"#a16207"},
      {id:"fontaine", x:70, y:45, label:"Fontaine", translation:"Fonte", pronunciation:"fon-TEN", example:"La fontaine est belle.", examplePt:"A fonte é bonita.", icon:"⛲", color:"#0ea5e9"},
      {id:"personnes", x:50, y:62, label:"Personnes", translation:"Pessoas", pronunciation:"per-SON", example:"Les personnes marchent dans le parc.", examplePt:"As pessoas caminham no parque.", icon:"👥", color:"#dc2626"},
      {id:"chien", x:60, y:68, label:"Chien", translation:"Cachorro", pronunciation:"SHIEN", example:"Le chien est dans le parc.", examplePt:"O cachorro está no parque.", icon:"🐕", color:"#f59e0b"},
      {id:"herbe", x:45, y:80, label:"Herbe", translation:"Grama", pronunciation:"ERB", example:"L'herbe est verte.", examplePt:"A grama é verde.", icon:"🌿", color:"#2563eb"},
    ]
  },
  {
    id:"mountain", name:"Montanha Nevada", nameEn:"Snowy Mountain", flag:"🏔️",
    bgImage:"/manus-storage/scene_mountain_531032d0.jpg",
    teacherImage:"/manus-storage/prof_hans_62b758a6.png",
    teacherName:"Hans", teacherLang:"de-DE", langCode:"de", teacherGender:"male",
    teacherGreeting:"Willkommen auf dem Berg! Lernen wir Natur-Vokabular!",
    greetingPt:"Bem-vindo à montanha! Vamos aprender vocabulário da natureza!",
    difficulty:"intermediate", premium:false,
    dialog:[
      {speaker:"teacher", text:"Willkommen auf dem Berg! Ich bin Hans. Wie gefällt Ihnen die Aussicht?", textPt:"Bem-vindo à montanha! Sou Hans. Como você está gostando da vista?"},
      {speaker:"user", text:"Die Aussicht ist fantastisch! Der Gipfel ist mit Schnee bedeckt!", textPt:"A vista é fantástica! O cume está coberto de neve!", options:["Die Aussicht ist fantastisch! Der Gipfel ist mit Schnee bedeckt!","Ich bin müde.","Wo ist das Hotel?"], correctIndex:0},
      {speaker:"teacher", text:"Ja! Der Schnee macht den Berg sehr schön. Wie hoch ist dieser Berg?", textPt:"Sim! A neve deixa a montanha muito bonita. Qual é a altura desta montanha?"},
      {speaker:"user", text:"Der Berg ist über dreitausend Meter hoch!", textPt:"A montanha tem mais de três mil metros de altura!", options:["Der Berg ist über dreitausend Meter hoch!","Ich weiß es nicht.","Das ist zu hoch!"], correctIndex:0},
      {speaker:"teacher", text:"Richtig! Und schau — ein Adler fliegt über den Felsen. Das ist wunderbar!", textPt:"Correto! E olhe — uma águia voa sobre as rochas. Isso é maravilhoso!"},
      {speaker:"user", text:"Ich sehe den Adler! Er fliegt sehr hoch über den Wolken.", textPt:"Vejo a águia! Ela voa muito alto sobre as nuvens.", options:["Ich sehe den Adler! Er fliegt sehr hoch über den Wolken.","Ich sehe nichts.","Ich habe Angst vor Adlern."], correctIndex:0},
      {speaker:"teacher", text:"Ausgezeichnet! Dein Deutsch ist wirklich gut. Weiter so!", textPt:"Excelente! Seu alemão está realmente bom. Continue assim!"},
    ],
    hotspots:[
      {id:"gipfel", x:50, y:28, label:"Gipfel", translation:"Cume", pronunciation:"GIP-fel", example:"Der Gipfel ist schneebedeckt.", examplePt:"O cume está coberto de neve.", icon:"🏔️", color:"#94a3b8"},
      {id:"schnee", x:35, y:35, label:"Schnee", translation:"Neve", pronunciation:"SHNEY", example:"Der Schnee ist weiß.", examplePt:"A neve é branca.", icon:"❄️", color:"#e2e8f0"},
      {id:"wald2", x:20, y:55, label:"Wald", translation:"Floresta", pronunciation:"VALT", example:"Der Wald ist dunkel.", examplePt:"A floresta é escura.", icon:"🌲", color:"#16a34a"},
      {id:"fels", x:70, y:45, label:"Fels", translation:"Rocha", pronunciation:"FELS", example:"Der Fels ist hart.", examplePt:"A rocha é dura.", icon:"🪨", color:"#78716c"},
      {id:"wolke", x:75, y:18, label:"Wolke", translation:"Nuvem", pronunciation:"VOL-ke", example:"Die Wolke ist weiß.", examplePt:"A nuvem é branca.", icon:"☁️", color:"#94a3b8"},
      {id:"see", x:50, y:65, label:"See", translation:"Lago", pronunciation:"ZE", example:"Der See ist klar.", examplePt:"O lago é claro.", icon:"🌊", color:"#a16207"},
    ]
  },
  {
    id:"desert", name:"Deserto do Saara", nameEn:"Sahara Desert", flag:"🏜️",
    bgImage:"/manus-storage/scene_desert_667d9a87.jpg",
    teacherImage:"/manus-storage/prof_omar_5c108d44.png",
    teacherName:"Omar", teacherLang:"ar-SA", langCode:"ar", teacherGender:"male",
    teacherGreeting:"مرحباً بك في الصحراء! دعنا نتعلم المفردات!",
    greetingPt:"Bem-vindo ao deserto! Vamos aprender vocabulário!",
    difficulty:"advanced", premium:true,
    dialog:[
      {speaker:"teacher", text:"مرحباً! أنا عمر. أهلاً بك في الصحراء الكبرى!", textPt:"Olá! Sou Omar. Bem-vindo ao Saara!"},
      {speaker:"user", text:"مرحباً يا عمر! الصحراء جميلة جداً!", textPt:"Olá Omar! O deserto é muito bonito!", options:["مرحباً يا عمر! الصحراء جميلة جداً!","لا أحب الصحراء.","أين الفندق؟"], correctIndex:0},
      {speaker:"teacher", text:"شكراً! انظر إلى الجمل — هو حيوان الصحراء. كيف تقول 'جمل' بالعربية؟", textPt:"Obrigado! Olhe para o camelo — ele é o animal do deserto. Como se diz 'camelo' em árabe?"},
      {speaker:"user", text:"جمل! وأرى الرمال الذهبية والواحة بعيداً!", textPt:"Jamal! E vejo a areia dourada e o oásis ao longe!", options:["جمل! وأرى الرمال الذهبية والواحة بعيداً!","لا أرى شيئاً.","أين الماء؟"], correctIndex:0},
      {speaker:"teacher", text:"ممتاز! الواحة هي مكان الماء في الصحراء. الشمس حارة جداً هنا.", textPt:"Excelente! O oásis é o lugar da água no deserto. O sol está muito quente aqui."},
      {speaker:"user", text:"نعم، الشمس قوية جداً! وأرى الكثبان الرملية الجميلة.", textPt:"Sim, o sol é muito forte! E vejo as belas dunas de areia.", options:["نعم، الشمس قوية جداً! وأرى الكثبان الرملية الجميلة.","أريد الذهاب.","هذا صعب جداً."], correctIndex:0},
      {speaker:"teacher", text:"رائع! عربيتك تتحسن كثيراً. استمر في التعلم!", textPt:"Maravilhoso! Seu árabe está melhorando muito. Continue aprendendo!"},
    ],
    hotspots:[
      {id:"sand2", x:50, y:75, label:"رمل", translation:"Areia", pronunciation:"raml", example:"الرمل ساخن جداً.", examplePt:"A areia está muito quente.", icon:"🏜️", color:"#f59e0b"},
      {id:"caravan", x:82, y:55, label:"قافلة", translation:"Caravana", pronunciation:"qa-fi-la", example:"القافلة تسير في الصحراء.", examplePt:"A caravana caminha no deserto.", icon:"🐪", color:"#a16207"},
      {id:"sun2", x:70, y:15, label:"شمس", translation:"Sol", pronunciation:"SHAMS", example:"الشمس حارة جداً.", examplePt:"O sol está muito quente.", icon:"☀️", color:"#eab308"},
      {id:"footprints", x:55, y:72, label:"آثار", translation:"Pegadas", pronunciation:"aa-THAAR", example:"الآثار في الرمل.", examplePt:"As pegadas estão na areia.", icon:"👣", color:"#22c55e"},
      {id:"dune", x:55, y:45, label:"كثيب", translation:"Duna", pronunciation:"ka-THIIB", example:"الكثيب رملي.", examplePt:"A duna é de areia.", icon:"🏔️", color:"#d97706"},
    ]
  },
  {
    id:"farm", name:"Fazenda Campestre", nameEn:"Country Farm", flag:"🌾",
    bgImage:"/manus-storage/scene_farm_2fb3b2ba.jpg",
    teacherImage:"/manus-storage/prof_maja_860515c8.png",
    teacherName:"Maja", teacherLang:"pl-PL", langCode:"pl", teacherGender:"female",
    teacherGreeting:"Witaj na farmie! Uczmy się słownictwa wiejskiego!",
    greetingPt:"Bem-vindo à fazenda! Vamos aprender vocabulário rural!",
    difficulty:"intermediate", premium:false,
    dialog:[
      {speaker:"teacher", text:"Dzień dobry! Jestem Maja. Witaj na naszej farmie!", textPt:"Bom dia! Sou Maja. Bem-vindo à nossa fazenda!"},
      {speaker:"user", text:"Dzień dobry, Maja! Jaka piękna farma! Widzę krowy i kury!", textPt:"Bom dia, Maja! Que fazenda bonita! Vejo vacas e galinhas!", options:["Dzień dobry, Maja! Jaka piękna farma! Widzę krowy i kury!","Nie lubię farm.","Gdzie jest miasto?"], correctIndex:0},
      {speaker:"teacher", text:"Tak! Krowa daje nam mleko, a kura znosi jajka. Czy wiesz jak powiedzieć 'traktor'?", textPt:"Sim! A vaca nos dá leite e a galinha bota ovos. Você sabe como dizer 'trator'?"},
      {speaker:"user", text:"Traktor! I widzę wielką stodołę pełną pszenicy!", textPt:"Traktor! E vejo um grande celeiro cheio de trigo!", options:["Traktor! I widzę wielką stodołę pełną pszenicy!","Nie rozumiem.","To za trudne."], correctIndex:0},
      {speaker:"teacher", text:"Doskonale! Pszenica jest złota i piękna. Niebo jest dziś błękitne.", textPt:"Excelente! O trigo é dourado e bonito. O céu está azul hoje."},
      {speaker:"user", text:"Tak, niebo jest cudowne! Chciałbym tu mieszkać!", textPt:"Sim, o céu é maravilhoso! Gostaria de morar aqui!", options:["Tak, niebo jest cudowne! Chciałbym tu mieszkać!","Wolę miasto.","Jest za cicho."], correctIndex:0},
      {speaker:"teacher", text:"Wspaniale! Twój polski jest coraz lepszy. Brawo!", textPt:"Maravilhoso! Seu polonês está cada vez melhor. Parabéns!"},
    ],
    hotspots:[
      {id:"krowa", x:35, y:55, label:"Krowa", translation:"Vaca", pronunciation:"KRO-va", example:"Krowa daje mleko.", examplePt:"A vaca dá leite.", icon:"🐄", color:"#f59e0b"},
      {id:"stodola", x:65, y:40, label:"Stodoła", translation:"Celeiro", pronunciation:"sto-DO-wa", example:"Stodoła jest duża.", examplePt:"O celeiro é grande.", icon:"🏚️", color:"#a16207"},
      {id:"pszenica", x:50, y:72, label:"Pszenica", translation:"Trigo", pronunciation:"PSHE-ni-tsa", example:"Pszenica jest złota.", examplePt:"O trigo é dourado.", icon:"🌾", color:"#eab308"},
      {id:"traktor", x:20, y:65, label:"Traktor", translation:"Trator", pronunciation:"TRAK-tor", example:"Traktor jest czerwony.", examplePt:"O trator é vermelho.", icon:"🚜", color:"#dc2626"},
      {id:"kura", x:80, y:60, label:"Kura", translation:"Galinha", pronunciation:"KU-ra", example:"Kura znosi jajka.", examplePt:"A galinha bota ovos.", icon:"🐔", color:"#f97316"},
      {id:"niebo", x:55, y:15, label:"Niebo", translation:"Céu", pronunciation:"NIE-bo", example:"Niebo jest błękitne.", examplePt:"O céu é azul.", icon:"🌤️", color:"#3b82f6"},
    ]
  },
  {
    id:"museum", name:"Museu de Arte", nameEn:"Art Museum", flag:"🎨",
    bgImage:"/manus-storage/scene_museum_36dd2df4.jpg",
    teacherImage:"/manus-storage/prof_giulia_f8adfeb6.png",
    teacherName:"Giulia", teacherLang:"it-IT", langCode:"it", teacherGender:"female",
    teacherGreeting:"Benvenuto al museo! Scopriamo l'arte insieme!",
    greetingPt:"Bem-vindo ao museu! Vamos descobrir a arte juntos!",
    difficulty:"advanced", premium:true,
    dialog:[
      {speaker:"teacher", text:"Benvenuto al museo! Sono Giulia. Che quadro bellissimo, vero?", textPt:"Bem-vindo ao museu! Sou Giulia. Que quadro lindo, não é?"},
      {speaker:"user", text:"Sì, è un vero capolavoro! Chi è l'artista?", textPt:"Sim, é uma verdadeira obra-prima! Quem é o artista?", options:["Sì, è un vero capolavoro! Chi è l'artista?","Non mi piace l'arte.","Voglio andare via."], correctIndex:0},
      {speaker:"teacher", text:"È un pittore del Rinascimento. La cornice dorata è bellissima, no?", textPt:"É um pintor do Renascimento. A moldura dourada é linda, não é?"},
      {speaker:"user", text:"Sì! E quella scultura in marmo è incredibile!", textPt:"Sim! E aquela escultura de mármore é incrível!", options:["Sì! E quella scultura in marmo è incredibile!","Non vedo la scultura.","Preferisco la fotografia."], correctIndex:0},
      {speaker:"teacher", text:"Esatto! La galleria ha molte opere d'arte. I visitatori vengono da tutto il mondo.", textPt:"Exato! A galeria tem muitas obras de arte. Os visitantes vêm do mundo todo."},
      {speaker:"user", text:"Che luce meravigliosa in questa galleria! Illumina i quadri perfettamente.", textPt:"Que luz maravilhosa nesta galeria! Ilumina os quadros perfeitamente.", options:["Che luce meravigliosa in questa galleria! Illumina i quadri perfettamente.","È troppo luminoso.","Voglio vedere altro."], correctIndex:0},
      {speaker:"teacher", text:"Bravissima! Il tuo italiano è eccellente. Continua così!", textPt:"Muito bem! Seu italiano está excelente. Continue assim!"},
    ],
    hotspots:[
      {id:"quadro", x:40, y:35, label:"Quadro", translation:"Quadro", pronunciation:"KWA-dro", example:"Il quadro è antico.", examplePt:"O quadro é antigo.", icon:"🖼️", color:"#a16207"},
      {id:"scultura", x:65, y:50, label:"Scultura", translation:"Escultura", pronunciation:"skul-TU-ra", example:"La scultura è in marmo.", examplePt:"A escultura é de mármore.", icon:"🗿", color:"#64748b"},
      {id:"cornice", x:20, y:40, label:"Cornice", translation:"Moldura", pronunciation:"KOR-ni-tche", example:"La cornice è dorata.", examplePt:"A moldura é dourada.", icon:"🖼️", color:"#eab308"},
      {id:"visitatore", x:80, y:60, label:"Visitatore", translation:"Visitante", pronunciation:"vi-zi-TA-to-re", example:"Il visitatore guarda.", examplePt:"O visitante olha.", icon:"👤", color:"#6366f1"},
      {id:"galleria", x:50, y:20, label:"Galleria", translation:"Galeria", pronunciation:"gal-LE-ria", example:"La galleria è grande.", examplePt:"A galeria é grande.", icon:"🏛️", color:"#8b5cf6"},
      {id:"luce", x:75, y:25, label:"Luce", translation:"Luz", pronunciation:"LU-tche", example:"La luce illumina il quadro.", examplePt:"A luz ilumina o quadro.", icon:"💡", color:"#fbbf24"},
    ]
  },
  {
    id:"cinema", name:"Cinema Moderno", nameEn:"Modern Cinema", flag:"🎬",
    bgImage:"/manus-storage/scene_cinema_9a35c5af.jpg",
    teacherImage:"/manus-storage/prof_james_b9f2fff7.png",
    teacherName:"James", teacherLang:"en-US", langCode:"en", teacherGender:"male",
    teacherGreeting:"Welcome to the cinema! Let's learn movie vocabulary!",
    greetingPt:"Bem-vindo ao cinema! Vamos aprender vocabulário de filmes!",
    difficulty:"beginner", premium:false,
    dialog:[
      {speaker:"teacher", text:"Welcome to the cinema! What kind of movie do you want to watch tonight?", textPt:"Bem-vindo ao cinema! Que tipo de filme você quer assistir esta noite?"},
      {speaker:"user", text:"I want to watch an action movie on the big screen!", textPt:"Quero assistir um filme de ação na telona!", options:["I want to watch an action movie on the big screen!","I don't know what to watch.","I prefer staying home."], correctIndex:0},
      {speaker:"teacher", text:"Great choice! First, you need to buy a ticket at the box office.", textPt:"Ótima escolha! Primeiro, você precisa comprar um ingresso na bilheteria."},
      {speaker:"user", text:"How much is a ticket? And can I buy popcorn?", textPt:"Quanto custa um ingresso? E posso comprar pipoca?", options:["How much is a ticket? And can I buy popcorn?","I already have a ticket.","I don't eat popcorn."], correctIndex:0},
      {speaker:"teacher", text:"Tickets are about fifteen dollars. Popcorn is a must at the cinema!", textPt:"Os ingressos custam cerca de quinze dólares. Pipoca é obrigatória no cinema!"},
      {speaker:"user", text:"Perfect! Where is my seat? I need to find seat number G7.", textPt:"Perfeito! Onde fica meu assento? Preciso encontrar o assento G7.", options:["Perfect! Where is my seat? I need to find seat number G7.","Any seat is fine.","I'll stand in the back."], correctIndex:0},
      {speaker:"teacher", text:"Check the projector screen for the seat map. Enjoy the movie!", textPt:"Verifique a tela do projetor para o mapa de assentos. Aproveite o filme!"},
    ],
    hotspots:[
      {id:"screen2", x:50, y:30, label:"Screen", translation:"Tela", pronunciation:"SKREEN", example:"The screen is huge.", examplePt:"A tela é enorme.", icon:"📽️", color:"#6366f1"},
      {id:"popcorn", x:25, y:65, label:"Popcorn", translation:"Pipoca", pronunciation:"POP-korn", example:"I love popcorn!", examplePt:"Adoro pipoca!", icon:"🍿", color:"#f59e0b"},
      {id:"seat", x:65, y:70, label:"Seat", translation:"Assento", pronunciation:"SIIT", example:"Find your seat.", examplePt:"Encontre seu assento.", icon:"💺", color:"#dc2626"},
      {id:"ticket", x:80, y:45, label:"Ticket", translation:"Ingresso", pronunciation:"TI-ket", example:"Buy a ticket.", examplePt:"Compre um ingresso.", icon:"🎟️", color:"#22c55e"},
      {id:"projector", x:50, y:15, label:"Projector", translation:"Projetor", pronunciation:"pro-DJEK-ter", example:"The projector is on.", examplePt:"O projetor está ligado.", icon:"📽️", color:"#8b5cf6"},
      {id:"exit", x:15, y:55, label:"Exit", translation:"Saída", pronunciation:"EK-sit", example:"Where is the exit?", examplePt:"Onde fica a saída?", icon:"🚪", color:"#0ea5e9"},
    ]
  },
  {
    id:"gym", name:"Academia de Ginástica", nameEn:"Fitness Gym", flag:"💪",
    bgImage:"/manus-storage/scene_gym_f96cac6f.jpg",
    teacherImage:"/manus-storage/prof_emre_78eb8ccb.png",
    teacherName:"Emre", teacherLang:"tr-TR", langCode:"tr", teacherGender:"male",
    teacherGreeting:"Spor salonuna hoş geldiniz! Spor kelimelerini öğrenelim!",
    greetingPt:"Bem-vindo à academia! Vamos aprender vocabulário de esportes!",
    difficulty:"intermediate", premium:false,
    dialog:[
      {speaker:"teacher", text:"Merhaba! Ben Emre. Spor salonuna hoş geldiniz! Bugün antrenman yapıyor musunuz?", textPt:"Olá! Sou Emre. Bem-vindo à academia! Você vai treinar hoje?"},
      {speaker:"user", text:"Evet, her gün antrenman yapıyorum! Bugün kol egzersizi yapacağım.", textPt:"Sim, treino todos os dias! Hoje vou fazer exercícios de braço.", options:["Evet, her gün antrenman yapıyorum! Bugün kol egzersizi yapacağım.","Hayır, çok yorgunum.","Bilmiyorum ne yapacağımı."], correctIndex:0},
      {speaker:"teacher", text:"Harika! Halterle başlayabilirsiniz. Koç size yardım edecek.", textPt:"Ótimo! Você pode começar com os halteres. O treinador vai te ajudar."},
      {speaker:"user", text:"Tamam! Koşu bandında da koşmak istiyorum.", textPt:"Tudo bem! Também quero correr na esteira.", options:["Tamam! Koşu bandında da koşmak istiyorum.","Sadece halter kullanacağım.","Yoruldum, gidiyorum."], correctIndex:0},
      {speaker:"teacher", text:"Mükemmel plan! Egzersizden önce minderde ısınmayı unutmayın.", textPt:"Plano excelente! Não esqueça de se aquecer no tapete antes do exercício."},
      {speaker:"user", text:"Anladım! Ve egzersiz sırasında su içmem gerekiyor, değil mi?", textPt:"Entendi! E preciso beber água durante o exercício, certo?", options:["Anladım! Ve egzersiz sırasında su içmem gerekiyor, değil mi?","Su içmem gerekmez.","Sadece kahve içerim."], correctIndex:0},
      {speaker:"teacher", text:"Kesinlikle! Aynaya bakarak formunuzu kontrol edin. Başarılar!", textPt:"Com certeza! Verifique sua postura no espelho. Boa sorte!"},
    ],
    hotspots:[
      {id:"dumbbell", x:30, y:60, label:"Dumbbell", translation:"Haltere", pronunciation:"DÂM-bel", example:"Lift the dumbbell.", examplePt:"Levante o haltere.", icon:"🏋️", color:"#dc2626"},
      {id:"treadmill", x:65, y:45, label:"Treadmill", translation:"Esteira", pronunciation:"TRED-mil", example:"Run on the treadmill.", examplePt:"Corra na esteira.", icon:"🏃", color:"#22c55e"},
      {id:"mirror", x:80, y:30, label:"Mirror", translation:"Espelho", pronunciation:"MI-rer", example:"Look in the mirror.", examplePt:"Olhe no espelho.", icon:"🪞", color:"#0ea5e9"},
      {id:"water", x:20, y:50, label:"Water Bottle", translation:"Garrafa d'água", pronunciation:"WO-ter BO-tel", example:"Drink water.", examplePt:"Beba água.", icon:"💧", color:"#3b82f6"},
      {id:"mat", x:50, y:78, label:"Mat", translation:"Tapete", pronunciation:"MÆT", example:"Stretch on the mat.", examplePt:"Alongue-se no tapete.", icon:"🧘", color:"#8b5cf6"},
      {id:"coach", x:45, y:35, label:"Coach", translation:"Treinador", pronunciation:"KOUTCH", example:"The coach is strong.", examplePt:"O treinador é forte.", icon:"👨‍🏫", color:"#f59e0b"},
    ]
  },
  {
    id:"library", name:"Biblioteca", nameEn:"Library", flag:"📚",
    bgImage:"/manus-storage/scene_library_732f048d.jpg",
    teacherImage:"/manus-storage/prof_maja_860515c8.png",
    teacherName:"Maja", teacherLang:"pl-PL", langCode:"pl", teacherGender:"female",
    teacherGreeting:"Witaj w bibliotece! Czytajmy razem!",
    greetingPt:"Bem-vindo à biblioteca! Vamos ler juntos!",
    difficulty:"beginner", premium:false,
    dialog:[
      {speaker:"teacher", text:"Witaj w bibliotece! Jestem Maja. Jaką książkę chcesz przeczytać?", textPt:"Bem-vindo à biblioteca! Sou Maja. Qual livro você quer ler?"},
      {speaker:"user", text:"Chcę przeczytać powieść przygodową. Gdzie jest dział literatury?", textPt:"Quero ler um romance de aventura. Onde fica a seção de literatura?", options:["Chcę przeczytać powieść przygodową. Gdzie jest dział literatury?","Nie wiem co czytać.","Nie lubię czytać."], correctIndex:0},
      {speaker:"teacher", text:"Dział literatury jest na drugiej półce po lewej. Pamiętaj — w bibliotece jest cisza!", textPt:"A seção de literatura fica na segunda prateleira à esquerda. Lembre-se — na biblioteca há silêncio!"},
      {speaker:"user", text:"Oczywiście! Mogę usiąść przy stoliku przy lampie?", textPt:"Claro! Posso sentar na mesa perto da lâmpada?", options:["Oczywiście! Mogę usiąść przy stoliku przy lampie?","Wolę stać.","Czy mogę jeść tutaj?"], correctIndex:0},
      {speaker:"teacher", text:"Tak, stolik jest wolny. Możesz też skorzystać z katalogu, żeby znaleźć książki.", textPt:"Sim, a mesa está livre. Você também pode usar o catálogo para encontrar livros."},
      {speaker:"user", text:"Dziękuję! Jak długo mogę wypożyczyć książkę?", textPt:"Obrigado! Por quanto tempo posso emprestar um livro?", options:["Dziękuję! Jak długo mogę wypożyczyć książkę?","Nie chcę wypożyczać.","Mogę zabrać bez pytania?"], correctIndex:0},
      {speaker:"teacher", text:"Dwa tygodnie. Twój polski jest naprawdę dobry! Brawo!", textPt:"Duas semanas. Seu polonês está realmente bom! Parabéns!"},
    ],
    hotspots:[
      {id:"ksiazka", x:40, y:45, label:"Książka", translation:"Livro", pronunciation:"KSHON-shka", example:"Książka jest ciekawa.", examplePt:"O livro é interessante.", icon:"📖", color:"#6366f1"},
      {id:"polka", x:70, y:35, label:"Półka", translation:"Prateleira", pronunciation:"PUW-ka", example:"Półka jest pełna.", examplePt:"A prateleira está cheia.", icon:"📚", color:"#a16207"},
      {id:"stolik", x:30, y:68, label:"Stolik", translation:"Mesa de leitura", pronunciation:"STO-lik", example:"Stolik jest wolny.", examplePt:"A mesa está livre.", icon:"🪑", color:"#f59e0b"},
      {id:"lampa", x:55, y:25, label:"Lampa", translation:"Lâmpada", pronunciation:"LAM-pa", example:"Lampa świeci.", examplePt:"A lâmpada brilha.", icon:"💡", color:"#eab308"},
      {id:"katalog", x:80, y:55, label:"Katalog", translation:"Catálogo", pronunciation:"KA-ta-log", example:"Szukaj w katalogu.", examplePt:"Procure no catálogo.", icon:"🗂️", color:"#0ea5e9"},
      {id:"cisza", x:15, y:40, label:"Cisza", translation:"Silêncio", pronunciation:"TSHI-sha", example:"W bibliotece jest cisza.", examplePt:"Na biblioteca há silêncio.", icon:"🤫", color:"#8b5cf6"},
    ]
  },
  {
    id:"office", name:"Escritório Moderno", nameEn:"Modern Office", flag:"💼",
    bgImage:"/manus-storage/scene_office_7981f124.jpg",
    teacherImage:"/manus-storage/prof_ivan_5c4962f5.png",
    teacherName:"Ivan", teacherLang:"ru-RU", langCode:"ru", teacherGender:"male",
    teacherGreeting:"Добро пожаловать в офис! Учим деловую лексику!",
    greetingPt:"Bem-vindo ao escritório! Vamos aprender vocabulário de negócios!",
    difficulty:"intermediate", premium:true,
    dialog:[
      {speaker:"teacher", text:"Добрый день! Я Иван. Добро пожаловать в наш офис!", textPt:"Boa tarde! Sou Ivan. Bem-vindo ao nosso escritório!"},
      {speaker:"user", text:"Добрый день, Иван! Очень красивый офис. Как дела на работе?", textPt:"Boa tarde, Ivan! Escritório muito bonito. Como vai o trabalho?", options:["Добрый день, Иван! Очень красивый офис. Как дела на работе?","Не знаю.","Я заблудился."], correctIndex:0},
      {speaker:"teacher", text:"Всё хорошо, спасибо! Вот мой компьютер и рабочий стол.", textPt:"Tudo bem, obrigado! Aqui está meu computador e mesa de trabalho."},
      {speaker:"user", text:"Понятно! А телефон звонит — нужно ответить?", textPt:"Entendi! E o telefone está tocando — precisa atender?", options:["Понятно! А телефон звонит — нужно ответить?","Не обращайте внимания.","Выключите телефон."], correctIndex:0},
      {speaker:"teacher", text:"Да, это важный звонок. Окно открыто — свежий воздух помогает работать.", textPt:"Sim, é uma ligação importante. A janela está aberta — o ar fresco ajuda a trabalhar."},
      {speaker:"user", text:"Согласен! Можно взять кофе из кофемашины?", textPt:"Concordo! Posso pegar café da cafeteira?", options:["Согласен! Можно взять кофе из кофемашины?","Я не пью кофе.","Где столовая?"], correctIndex:0},
      {speaker:"teacher", text:"Конечно! Папка с документами на столе. Ваш русский отличный!", textPt:"Claro! A pasta com documentos está na mesa. Seu russo está excelente!"},
    ],
    hotspots:[
      {id:"komputer", x:50, y:45, label:"Компьютер", translation:"Computador", pronunciation:"kom-PIU-ter", example:"Компьютер работает.", examplePt:"O computador está funcionando.", icon:"💻", color:"#6366f1"},
      {id:"stol", x:35, y:65, label:"Стол", translation:"Mesa", pronunciation:"STOL", example:"Стол большой.", examplePt:"A mesa é grande.", icon:"🪑", color:"#a16207"},
      {id:"telefon", x:70, y:55, label:"Телефон", translation:"Telefone", pronunciation:"te-li-FON", example:"Телефон звонит.", examplePt:"O telefone está tocando.", icon:"📞", color:"#22c55e"},
      {id:"okno", x:80, y:25, label:"Окно", translation:"Janela", pronunciation:"ak-NO", example:"Окно открыто.", examplePt:"A janela está aberta.", icon:"🪟", color:"#0ea5e9"},
      {id:"kofejnik", x:20, y:50, label:"Кофемашина", translation:"Cafeteira", pronunciation:"ko-fe-MA-shi-na", example:"Кофемашина работает.", examplePt:"A cafeteira está funcionando.", icon:"☕", color:"#f59e0b"},
      {id:"papka", x:60, y:30, label:"Папка", translation:"Pasta", pronunciation:"PAP-ka", example:"Папка на столе.", examplePt:"A pasta está na mesa.", icon:"📁", color:"#dc2626"},
    ]
  },
  {
    id:"metro", name:"Metrô de Paris", nameEn:"Paris Metro", flag:"🚇",
    bgImage:"/manus-storage/scene_metro_5fffc615.jpg",
    teacherImage:"/manus-storage/prof_sophie_a6324ef6.png",
    teacherName:"Sophie", teacherLang:"fr-FR", langCode:"fr", teacherGender:"female",
    teacherGreeting:"Bienvenue dans le métro! Apprenons à voyager!",
    greetingPt:"Bem-vindo ao metrô! Vamos aprender a viajar!",
    difficulty:"intermediate", premium:false,
    dialog:[
      {speaker:"teacher", text:"Bienvenue dans le métro de Paris! Je suis Sophie. Quelle station cherchez-vous?", textPt:"Bem-vindo ao metrô de Paris! Sou Sophie. Qual estação você procura?"},
      {speaker:"user", text:"Je cherche la station Louvre. Comment acheter un billet?", textPt:"Procuro a estação Louvre. Como comprar um bilhete?", options:["Je cherche la station Louvre. Comment acheter un billet?","Je ne sais pas où aller.","Je suis perdu."], correctIndex:0},
      {speaker:"teacher", text:"Achetez un billet au guichet ou à la machine. Un ticket coûte deux euros.", textPt:"Compre um bilhete na bilheteria ou na máquina. Um bilhete custa dois euros."},
      {speaker:"user", text:"Merci! Et le train arrive dans combien de minutes?", textPt:"Obrigado! E o trem chega em quantos minutos?", options:["Merci! Et le train arrive dans combien de minutes?","Je n'ai pas d'argent.","Où est la sortie?"], correctIndex:0},
      {speaker:"teacher", text:"Regardez le panneau — le prochain train arrive dans trois minutes. Attendez sur le quai.", textPt:"Olhe o painel — o próximo trem chega em três minutos. Espere na plataforma."},
      {speaker:"user", text:"Je vois la porte s'ouvrir! Je dois entrer par le couloir à droite?", textPt:"Vejo a porta se abrir! Devo entrar pelo corredor à direita?", options:["Je vois la porte s'ouvrir! Je dois entrer par le couloir à droite?","Je ne veux pas entrer.","Où est la sortie?"], correctIndex:0},
      {speaker:"teacher", text:"Oui, entrez vite! Votre français est excellent. Bon voyage!", textPt:"Sim, entre rápido! Seu francês está excelente. Boa viagem!"},
    ],
    hotspots:[
      {id:"train", x:50, y:50, label:"Train", translation:"Trem", pronunciation:"TREN", example:"Le train arrive.", examplePt:"O trem está chegando.", icon:"🚇", color:"#6366f1"},
      {id:"quai", x:30, y:70, label:"Quai", translation:"Plataforma", pronunciation:"KE", example:"Attendez sur le quai.", examplePt:"Espere na plataforma.", icon:"🛤️", color:"#f59e0b"},
      {id:"panneau", x:70, y:30, label:"Panneau", translation:"Painel", pronunciation:"pa-NO", example:"Lisez le panneau.", examplePt:"Leia o painel.", icon:"📋", color:"#0ea5e9"},
      {id:"porte", x:20, y:45, label:"Porte", translation:"Porta", pronunciation:"PORT", example:"La porte s'ouvre.", examplePt:"A porta se abre.", icon:"🚪", color:"#dc2626"},
      {id:"billet", x:80, y:55, label:"Billet", translation:"Bilhete", pronunciation:"bi-YE", example:"Achetez un billet.", examplePt:"Compre um bilhete.", icon:"🎟️", color:"#22c55e"},
      {id:"couloir", x:55, y:80, label:"Couloir", translation:"Corredor", pronunciation:"kul-WAR", example:"Le couloir est long.", examplePt:"O corredor é longo.", icon:"🏃", color:"#8b5cf6"},
    ]
  },
  {
    id:"port", name:"Porto Mediterrâneo", nameEn:"Mediterranean Port", flag:"⛵",
    bgImage:"/manus-storage/scene_port_e35f99dc.jpg",
    teacherImage:"/manus-storage/prof_giulia_f8adfeb6.png",
    teacherName:"Giulia", teacherLang:"it-IT", langCode:"it", teacherGender:"female",
    teacherGreeting:"Benvenuto al porto! Impariamo il vocabolario del mare!",
    greetingPt:"Bem-vindo ao porto! Vamos aprender vocabulário do mar!",
    difficulty:"intermediate", premium:false,
    dialog:[
      {speaker:"teacher", text:"Benvenuto al porto! Sono Giulia. Che bel porto mediterraneo, vero?", textPt:"Bem-vindo ao porto! Sou Giulia. Que porto mediterrâneo bonito, não é?"},
      {speaker:"user", text:"Sì, è bellissimo! Vuoi fare una gita in barca con me?", textPt:"Sim, é lindo! Quer fazer um passeio de barco comigo?", options:["Sì, è bellissimo! Vuoi fare una gita in barca con me?","No, ho paura del mare.","Forse domani."], correctIndex:0},
      {speaker:"teacher", text:"Certo! Il mare è azzurro oggi. Vedi il faro in lontananza?", textPt:"Claro! O mar está azul hoje. Você vê o farol ao longe?"},
      {speaker:"user", text:"Sì! E vedo anche i gabbiani che volano sopra la rete del pescatore.", textPt:"Sim! E também vejo as gaivotas voando sobre a rede do pescador.", options:["Sì! E vedo anche i gabbiani che volano sopra la rete del pescatore.","Non vedo niente.","Ho paura dei gabbiani."], correctIndex:0},
      {speaker:"teacher", text:"Bravissima! L'ancora è pesante — tiene la barca ferma nel porto.", textPt:"Muito bem! A âncora é pesada — mantém o barco fixo no porto."},
      {speaker:"user", text:"Capisco! Il porto è pieno di vita. Mi piace molto l'italiano!", textPt:"Entendo! O porto está cheio de vida. Gosto muito do italiano!", options:["Capisco! Il porto è pieno di vita. Mi piace molto l'italiano!","È troppo difficile.","Voglio tornare a casa."], correctIndex:0},
      {speaker:"teacher", text:"Meraviglioso! Il tuo italiano migliora ogni giorno. Continua!", textPt:"Maravilhoso! Seu italiano melhora a cada dia. Continue!"},
    ],
    hotspots:[
      {id:"barca", x:40, y:55, label:"Barca", translation:"Barco", pronunciation:"BAR-ka", example:"La barca è nel porto.", examplePt:"O barco está no porto.", icon:"⛵", color:"#0ea5e9"},
      {id:"mare", x:65, y:40, label:"Mare", translation:"Mar", pronunciation:"MA-re", example:"Il mare è azzurro.", examplePt:"O mar é azul.", icon:"🌊", color:"#3b82f6"},
      {id:"faro", x:80, y:25, label:"Faro", translation:"Farol", pronunciation:"FA-ro", example:"Il faro guida le navi.", examplePt:"O farol guia os navios.", icon:"🗼", color:"#f59e0b"},
      {id:"gabbiano", x:25, y:30, label:"Gabbiano", translation:"Gaivota", pronunciation:"gab-BIA-no", example:"Il gabbiano vola.", examplePt:"A gaivota voa.", icon:"🕊️", color:"#94a3b8"},
      {id:"rete", x:20, y:65, label:"Rete", translation:"Rede", pronunciation:"RE-te", example:"La rete è piena di pesci.", examplePt:"A rede está cheia de peixes.", icon:"🎣", color:"#16a34a"},
      {id:"ancora", x:55, y:75, label:"Ancora", translation:"Âncora", pronunciation:"AN-ko-ra", example:"L'ancora è pesante.", examplePt:"A âncora é pesada.", icon:"⚓", color:"#dc2626"},
    ]
  },
  {
    id:"medieval", name:"Mercado Medieval", nameEn:"Medieval Market", flag:"🏰",
    bgImage:"/manus-storage/scene_medieval_402d8fa3.jpg",
    teacherImage:"/manus-storage/prof_hans_62b758a6.png",
    teacherName:"Hans", teacherLang:"de-DE", langCode:"de", teacherGender:"male",
    teacherGreeting:"Willkommen auf dem mittelalterlichen Markt! Lernen wir Geschichte!",
    greetingPt:"Bem-vindo ao mercado medieval! Vamos aprender história!",
    difficulty:"advanced", premium:true,
    dialog:[
      {speaker:"teacher", text:"Willkommen auf dem mittelalterlichen Markt! Ich bin Hans. Was möchten Sie kaufen?", textPt:"Bem-vindo ao mercado medieval! Sou Hans. O que você gostaria de comprar?"},
      {speaker:"user", text:"Guten Tag! Wie viel kostet dieser Apfel?", textPt:"Bom dia! Quanto custa esta maçã?", options:["Guten Tag! Wie viel kostet dieser Apfel?","Ich weiß nicht was ich will.","Das ist zu teuer."], correctIndex:0},
      {speaker:"teacher", text:"Nur einen Pfennig! Und schau — die alte Burg dort ist aus dem 12. Jahrhundert.", textPt:"Apenas um centavo! E olhe — aquele castelo antigo é do século XII."},
      {speaker:"user", text:"Die Burg ist beeindruckend! Und der Ritter mit dem Schwert — ist er echt?", textPt:"O castelo é impressionante! E o cavaleiro com a espada — é real?", options:["Die Burg ist beeindruckend! Und der Ritter mit dem Schwert — ist er echt?","Ich habe Angst.","Wo ist der Ausgang?"], correctIndex:0},
      {speaker:"teacher", text:"Ja, er ist ein Schauspieler! Die Fahne weht im Wind — das ist die Flagge des Königs.", textPt:"Sim, ele é um ator! A bandeira tremula no vento — é a bandeira do rei."},
      {speaker:"user", text:"Fantastisch! Und die Kerzen am Brunnen leuchten sehr schön.", textPt:"Fantástico! E as velas na fonte brilham muito bonito.", options:["Fantastisch! Und die Kerzen am Brunnen leuchten sehr schön.","Es ist zu dunkel.","Ich will nach Hause."], correctIndex:0},
      {speaker:"teacher", text:"Wunderbar! Dein Deutsch ist ausgezeichnet. Weiter so!", textPt:"Maravilhoso! Seu alemão está excelente. Continue assim!"},
    ],
    hotspots:[
      {id:"burg", x:70, y:20, label:"Burg", translation:"Castelo", pronunciation:"BURK", example:"Die Burg ist alt.", examplePt:"O castelo é antigo.", icon:"🏰", color:"#64748b"},
      {id:"markt", x:40, y:60, label:"Markt", translation:"Mercado", pronunciation:"MARKT", example:"Der Markt ist voll.", examplePt:"O mercado está cheio.", icon:"🏪", color:"#f59e0b"},
      {id:"ritter", x:25, y:40, label:"Ritter", translation:"Cavaleiro", pronunciation:"RIT-ter", example:"Der Ritter ist tapfer.", examplePt:"O cavaleiro é corajoso.", icon:"⚔️", color:"#94a3b8"},
      {id:"fahne", x:80, y:30, label:"Fahne", translation:"Bandeira", pronunciation:"FA-ne", example:"Die Fahne weht.", examplePt:"A bandeira está tremulando.", icon:"🚩", color:"#dc2626"},
      {id:"brunnen", x:55, y:65, label:"Brunnen", translation:"Poço", pronunciation:"BRUN-nen", example:"Der Brunnen ist tief.", examplePt:"O poço é fundo.", icon:"⛲", color:"#0ea5e9"},
      {id:"kerze", x:20, y:55, label:"Kerze", translation:"Vela", pronunciation:"KER-tse", example:"Die Kerze brennt.", examplePt:"A vela está acesa.", icon:"🕯️", color:"#eab308"},
    ]
  },
  {
    id:"spa", name:"Spa & Bem-Estar", nameEn:"Spa & Wellness", flag:"🧘",
    bgImage:"/manus-storage/scene_spa_abacc5aa.jpg",
    teacherImage:"/manus-storage/prof_priya_7c36613d.png",
    teacherName:"Priya", teacherLang:"en-GB", langCode:"en", teacherGender:"female",
    teacherGreeting:"Welcome to the spa! Let's relax and learn wellness vocabulary!",
    greetingPt:"Bem-vindo ao spa! Vamos relaxar e aprender vocabulário de bem-estar!",
    difficulty:"intermediate", premium:false,
    dialog:[
      {speaker:"teacher", text:"Welcome to the spa! I'm Priya. How do you feel today?", textPt:"Bem-vindo ao spa! Sou Priya. Como você se sente hoje?"},
      {speaker:"user", text:"I feel a bit stressed. I need to relax!", textPt:"Me sinto um pouco estressado. Preciso relaxar!", options:["I feel a bit stressed. I need to relax!","I feel great already.","I don't know."], correctIndex:0},
      {speaker:"teacher", text:"Perfect place to be! The warm pool will help you relax completely.", textPt:"Lugar perfeito para estar! A piscina quente vai te ajudar a relaxar completamente."},
      {speaker:"user", text:"The pool looks amazing! And I can smell the candles — they smell wonderful.", textPt:"A piscina parece incrível! E consigo sentir o cheiro das velas — cheiram maravilhosamente.", options:["The pool looks amazing! And I can smell the candles — they smell wonderful.","I don't like pools.","The smell is too strong."], correctIndex:0},
      {speaker:"teacher", text:"Those are aromatherapy candles. After the pool, you can have a massage.", textPt:"Essas são velas de aromaterapia. Depois da piscina, você pode fazer uma massagem."},
      {speaker:"user", text:"A massage sounds perfect! And the calm music makes everything better.", textPt:"Uma massagem parece perfeito! E a música calma torna tudo melhor.", options:["A massage sounds perfect! And the calm music makes everything better.","I don't like massages.","Can I take the towel home?"], correctIndex:0},
      {speaker:"teacher", text:"Wonderful! Use the fresh towel after your swim. Enjoy your wellness day!", textPt:"Maravilhoso! Use a toalha fresca depois do banho. Aproveite seu dia de bem-estar!"},
    ],
    hotspots:[
      {id:"pool", x:50, y:55, label:"Pool", translation:"Piscina", pronunciation:"PUUL", example:"The pool is warm.", examplePt:"A piscina está quente.", icon:"🏊", color:"#0ea5e9"},
      {id:"towel", x:25, y:65, label:"Towel", translation:"Toalha", pronunciation:"TAU-el", example:"Use a clean towel.", examplePt:"Use uma toalha limpa.", icon:"🏖️", color:"#e2e8f0"},
      {id:"candle", x:70, y:40, label:"Candle", translation:"Vela", pronunciation:"KÆN-del", example:"The candle smells nice.", examplePt:"A vela cheira bem.", icon:"🕯️", color:"#f59e0b"},
      {id:"flower3", x:80, y:60, label:"Flower", translation:"Flor", pronunciation:"FLAU-er", example:"The flower is beautiful.", examplePt:"A flor é bonita.", icon:"🌺", color:"#ec4899"},
      {id:"massage", x:35, y:45, label:"Massage", translation:"Massagem", pronunciation:"ma-SAAJ", example:"A massage is relaxing.", examplePt:"Uma massagem é relaxante.", icon:"💆", color:"#8b5cf6"},
      {id:"music", x:60, y:25, label:"Music", translation:"Música", pronunciation:"MIUU-zik", example:"The music is calm.", examplePt:"A música é calma.", icon:"🎵", color:"#22c55e"},
    ]
  },
  {
    id:"garden", name:"Jardim Japonês", nameEn:"Japanese Garden", flag:"🌸",
    bgImage:"/manus-storage/scene_garden_77e79005.jpg",
    teacherImage:"/manus-storage/prof_yuki_ae657681.png",
    teacherName:"Yuki", teacherLang:"ja-JP", langCode:"ja", teacherGender:"female",
    teacherGreeting:"日本庭園へようこそ！自然の中で学びましょう！",
    greetingPt:"Bem-vindo ao jardim japonês! Aprenda na natureza!",
    difficulty:"advanced", premium:true,
    dialog:[
      {speaker:"teacher", text:"ようこそ！私はゆきです。この日本庭園は美しいですね！", textPt:"Bem-vindo! Sou Yuki. Este jardim japonês é bonito, não é?"},
      {speaker:"user", text:"はい、とても美しいです！桜の花が素晴らしいです！", textPt:"Sim, é muito bonito! As flores de cerejeira são maravilhosas!", options:["はい、とても美しいです！桜の花が素晴らしいです！","わかりません。","怖いです。"], correctIndex:0},
      {speaker:"teacher", text:"そうですね！池の中に魚がいます。橋を渡りましょう！", textPt:"É mesmo! Há peixes no lago. Vamos atravessar a ponte!"},
      {speaker:"user", text:"はい！橋はとても美しいです。石も見えます。", textPt:"Sim! A ponte é muito bonita. Também vejo as pedras.", options:["はい！橋はとても美しいです。石も見えます。","橋が怖いです。","どこに行きますか？"], correctIndex:0},
      {speaker:"teacher", text:"よく見えましたね！竹もあります。竹は日本の象徴です。", textPt:"Você viu bem! Há bambu também. O bambu é símbolo do Japão."},
      {speaker:"user", text:"提灯も光っています！夜はもっと美しいでしょう。", textPt:"As lanternas também estão brilhando! À noite deve ser ainda mais bonito.", options:["提灯も光っています！夜はもっと美しいでしょう。","もう帰りたいです。","日本語は難しいです。"], correctIndex:0},
      {speaker:"teacher", text:"素晴らしい！日本語がとても上手になりましたね！", textPt:"Maravilhoso! Seu japonês melhorou muito!"},
    ],
    hotspots:[
      {id:"sakura2", x:35, y:25, label:"桜", translation:"Cerejeira", pronunciation:"sa-ku-ra", example:"桜が美しい。", examplePt:"A cerejeira é bonita.", icon:"🌸", color:"#ec4899"},
      {id:"ike", x:55, y:60, label:"池", translation:"Lago", pronunciation:"いけ", example:"池に魚がいる。", examplePt:"Há peixes no lago.", icon:"🐟", color:"#3b82f6"},
      {id:"hashi", x:70, y:50, label:"橋", translation:"Ponte", pronunciation:"はし", example:"橋を渡る。", examplePt:"Atravesse a ponte.", icon:"🌉", color:"#a16207"},
      {id:"ishi", x:25, y:65, label:"石", translation:"Pedra", pronunciation:"いし", example:"石は重い。", examplePt:"A pedra é pesada.", icon:"🪨", color:"#64748b"},
      {id:"take", x:80, y:35, label:"竹", translation:"Bambu", pronunciation:"たけ", example:"竹は高い。", examplePt:"O bambu é alto.", icon:"🎋", color:"#16a34a"},
      {id:"chochin2", x:45, y:40, label:"提灯", translation:"Lanterna", pronunciation:"cho-chin", example:"提灯が光る。", examplePt:"A lanterna brilha.", icon:"🏮", color:"#ea580c"},
    ]
  },
  {
    id:"cafe", name:"Café Parisiense", nameEn:"Parisian Café", flag:"☕",
    bgImage:"/manus-storage/scene_cafe_ab4e0305.jpg",
    teacherImage:"/manus-storage/prof_sophie_a6324ef6.png",
    teacherName:"Sophie", teacherLang:"fr-FR", langCode:"fr", teacherGender:"female",
    teacherGreeting:"Bienvenue au café! Commandez en français!",
    greetingPt:"Bem-vindo ao café! Peça em francês!",
    difficulty:"beginner", premium:false,
    dialog:[
      {speaker:"teacher", text:"Bonjour! Je m'appelle Sophie. Bienvenue au café! Que désirez-vous commander?", textPt:"Bom dia! Sou Sophie. Bem-vindo ao café! O que você gostaria de pedir?"},
      {speaker:"user", text:"Bonjour Sophie! Un café et un croissant, s'il vous plaît.", textPt:"Bom dia Sophie! Um café e um croissant, por favor.", options:["Bonjour Sophie! Un café et un croissant, s'il vous plaît.","Je ne veux rien.","L'addition!"], correctIndex:0},
      {speaker:"teacher", text:"Très bon choix! Voulez-vous vous asseoir en terrasse? La vue est magnifique.", textPt:"Ótima escolha! Quer se sentar no terraço? A vista é magnífica."},
      {speaker:"user", text:"Oui, la terrasse est parfaite! Je vais lire le journal en attendant.", textPt:"Sim, o terraço é perfeito! Vou ler o jornal enquanto espero.", options:["Oui, la terrasse est parfaite! Je vais lire le journal en attendant.","Non, je préfère l'intérieur.","Je n'ai pas le temps."], correctIndex:0},
      {speaker:"teacher", text:"Voici votre café et votre croissant! Le croissant est frais du matin.", textPt:"Aqui está seu café e seu croissant! O croissant é fresco da manhã."},
      {speaker:"user", text:"Merci beaucoup! C'est délicieux! L'addition, s'il vous plaît.", textPt:"Muito obrigado! Está delicioso! A conta, por favor.", options:["Merci beaucoup! C'est délicieux! L'addition, s'il vous plaît.","Je n'aime pas le croissant.","C'est trop cher."], correctIndex:0},
      {speaker:"teacher", text:"Avec plaisir! Votre français est excellent. Revenez bientôt!", textPt:"Com prazer! Seu francês está excelente. Volte logo!"},
    ],
    hotspots:[
      {id:"cafe3", x:40, y:55, label:"Café", translation:"Café", pronunciation:"ka-FÉ", example:"Le café est chaud.", examplePt:"O café está quente.", icon:"☕", color:"#a16207"},
      {id:"croissant", x:60, y:65, label:"Croissant", translation:"Croissant", pronunciation:"krwa-SON", example:"Le croissant est frais.", examplePt:"O croissant está fresco.", icon:"🥐", color:"#f59e0b"},
      {id:"garcon", x:25, y:40, label:"Garçon", translation:"Garçom", pronunciation:"gar-SON", example:"Appelez le garçon.", examplePt:"Chame o garçom.", icon:"🧑‍🍳", color:"#6366f1"},
      {id:"terrasse", x:70, y:35, label:"Terrasse", translation:"Terraço", pronunciation:"te-RAS", example:"La terrasse est agréable.", examplePt:"O terraço é agradável.", icon:"🪑", color:"#22c55e"},
      {id:"journal", x:50, y:45, label:"Journal", translation:"Jornal", pronunciation:"zhur-NAL", example:"Je lis le journal.", examplePt:"Leio o jornal.", icon:"📰", color:"#0ea5e9"},
      {id:"addition", x:80, y:60, label:"Addition", translation:"Conta", pronunciation:"a-di-SION", example:"L'addition, s'il vous plaît.", examplePt:"A conta, por favor.", icon:"🧾", color:"#dc2626"},
    ]
  },
  {
    id:"family_home", name:"Casa da Família", nameEn:"Family at Home", flag:"🏠",
    bgImage:"https://d2xsxph8kpxj0f.cloudfront.net/310519663082627627/2PrAxuVNSTauUZFfMWq3zJ/scene_family_home-o3WNxh4WSTa7fkpvh4ALxF.webp",
    teacherImage:"/manus-storage/prof_james_b9f2fff7.png",
    teacherName:"James", teacherLang:"en-US", langCode:"en", teacherGender:"male",
    teacherGreeting:"Welcome home! Let's learn family vocabulary together!",
    greetingPt:"Bem-vindo à casa! Vamos aprender vocabulário de família juntos!",
    difficulty:"beginner", premium:false,
    dialog:[
      {speaker:"teacher", text:"Who is in your family?", textPt:"Quem está na sua família?"},
      {speaker:"user", text:"I have a mom, a dad, and a sister.", textPt:"Tenho uma mãe, um pai e uma irmã.", options:["I have a mom, a dad, and a sister.","I live alone.","I don't know."], correctIndex:0},
      {speaker:"teacher", text:"Great! What do you see in the living room?", textPt:"Ótimo! O que você vê na sala de estar?"},
      {speaker:"user", text:"I see a sofa, a TV, and a table.", textPt:"Vejo um sofá, uma TV e uma mesa.", options:["I see a sofa, a TV, and a table.","I see nothing.","I see a car."], correctIndex:0},
      {speaker:"teacher", text:"Perfect! Tell me about your morning routine at home.", textPt:"Perfeito! Me conte sobre sua rotina matinal em casa."},
      {speaker:"user", text:"We eat breakfast together every morning.", textPt:"Tomamos café da manhã juntos toda manhã.", options:["We eat breakfast together every morning.","We never eat together.","We sleep all day."], correctIndex:0},
    ],
    hotspots:[
      {id:"sofa", x:35, y:65, label:"Sofa", translation:"Sofá", pronunciation:"SOU-fa", example:"The family sits on the sofa.", examplePt:"A família senta no sofá.", icon:"🛋️", color:"#a16207"},
      {id:"tv", x:60, y:40, label:"Television", translation:"Televisão", pronunciation:"te-li-VI-zhon", example:"We watch television together.", examplePt:"Assistimos televisão juntos.", icon:"📺", color:"#1d4ed8"},
      {id:"table", x:50, y:75, label:"Table", translation:"Mesa", pronunciation:"TEY-bel", example:"We eat at the table.", examplePt:"Comemos na mesa.", icon:"🪑", color:"#92400e"},
      {id:"window", x:80, y:30, label:"Window", translation:"Janela", pronunciation:"WIN-dou", example:"Open the window.", examplePt:"Abra a janela.", icon:"🪟", color:"#0ea5e9"},
      {id:"door", x:15, y:50, label:"Door", translation:"Porta", pronunciation:"DOOR", example:"Close the door please.", examplePt:"Feche a porta por favor.", icon:"🚪", color:"#7c3aed"},
      {id:"kitchen2", x:25, y:80, label:"Kitchen", translation:"Cozinha", pronunciation:"KI-tchin", example:"Mom cooks in the kitchen.", examplePt:"A mãe cozinha na cozinha.", icon:"🍳", color:"#dc2626"},
      {id:"bedroom", x:70, y:20, label:"Bedroom", translation:"Quarto", pronunciation:"BED-ruum", example:"My bedroom is upstairs.", examplePt:"Meu quarto fica em cima.", icon:"🛏️", color:"#6366f1"},
      {id:"family_pic", x:45, y:55, label:"Family", translation:"Família", pronunciation:"FÆM-i-li", example:"My family is very close.", examplePt:"Minha família é muito unida.", icon:"👨‍👩‍👧‍👦", color:"#f59e0b"},
    ]
  },
  {
    id:"airport_family", name:"Família no Aeroporto", nameEn:"Family at Airport", flag:"✈️🏠",
    bgImage:"https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&q=80",
    teacherImage:"/manus-storage/prof_james_b9f2fff7.png",
    teacherName:"James", teacherLang:"en-US", langCode:"en", teacherGender:"male",
    teacherGreeting:"The family is at the airport! Let's learn travel phrases!",
    greetingPt:"A família está no aeroporto! Vamos aprender frases de viagem!",
    difficulty:"intermediate", premium:false,
    dialog:[
      {speaker:"teacher", text:"The family is going on vacation! Where are they going?", textPt:"A família vai de férias! Para onde eles vão?"},
      {speaker:"user", text:"They are going to London!", textPt:"Eles vão para Londres!", options:["They are going to London!","They are going home.","They are lost."], correctIndex:0},
      {speaker:"teacher", text:"Excellent! Dad needs to find the gate. What does he ask?", textPt:"Excelente! O pai precisa encontrar o portão. O que ele pergunta?"},
      {speaker:"user", text:"Excuse me, where is gate B12?", textPt:"Com licença, onde fica o portão B12?", options:["Excuse me, where is gate B12?","I don't speak English.","I'm also lost."], correctIndex:0},
      {speaker:"teacher", text:"Perfect! Mom is checking the luggage. What does she say?", textPt:"Perfeito! A mãe está despachando a bagagem. O que ela diz?"},
      {speaker:"user", text:"I have two bags to check in, please.", textPt:"Tenho duas malas para despachar, por favor.", options:["I have two bags to check in, please.","I have no bags.","I lost my bags."], correctIndex:0},
      {speaker:"teacher", text:"Wonderful! The children are excited. What do they say?", textPt:"Maravilhoso! As crianças estão animadas. O que elas dizem?"},
      {speaker:"user", text:"We are so excited about our vacation!", textPt:"Estamos muito animados com nossas férias!", options:["We are so excited about our vacation!","We want to go home.","We are tired."], correctIndex:0},
    ],
    hotspots:[
      {id:"passport2", x:45, y:60, label:"Passport", translation:"Passaporte", pronunciation:"PÆS-port", example:"Show your passport at the gate.", examplePt:"Mostre seu passaporte no portão.", icon:"📘", color:"#1d4ed8"},
      {id:"suitcase", x:30, y:75, label:"Suitcase", translation:"Mala", pronunciation:"SUUT-keys", example:"The suitcase is heavy.", examplePt:"A mala está pesada.", icon:"🧳", color:"#f59e0b"},
      {id:"boarding_pass", x:65, y:50, label:"Boarding Pass", translation:"Cartão de Embarque", pronunciation:"BOR-ding PÆS", example:"Keep your boarding pass safe.", examplePt:"Guarde seu cartão de embarque.", icon:"🎫", color:"#22c55e"},
      {id:"gate2", x:75, y:30, label:"Gate", translation:"Portão", pronunciation:"GEYT", example:"Go to gate B12.", examplePt:"Vá ao portão B12.", icon:"🚪", color:"#6366f1"},
      {id:"flight_board", x:20, y:35, label:"Flight Board", translation:"Painel de Voos", pronunciation:"FLAYT BORD", example:"Check the flight board.", examplePt:"Verifique o painel de voos.", icon:"📋", color:"#0ea5e9"},
      {id:"security2", x:50, y:85, label:"Security", translation:"Segurança", pronunciation:"si-KYUR-iti", example:"Pass through security check.", examplePt:"Passe pela verificação de segurança.", icon:"🔒", color:"#dc2626"},
    ]
  },
];

// ─── Particle Component ───────────────────────────────────────────────────────
function Particles({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-50">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${30 + Math.random() * 40}%`,
            top: `${20 + Math.random() * 60}%`,
            width: `${6 + Math.random() * 10}px`,
            height: `${6 + Math.random() * 10}px`,
            borderRadius: "50%",
            background: `hsl(${Math.random() * 360}, 90%, 60%)`,
            animation: `particle-fly ${0.6 + Math.random() * 0.8}s ease-out forwards`,
            animationDelay: `${Math.random() * 0.3}s`,
          }}
        />
      ))}
    </div>
  );
}

const IMMERSIVE_TEACHER_FACE_POSITIONS: Record<string, { mouthY: number; mouthWidth: number }> = {
  James: { mouthY: 53, mouthWidth: 0.88 },
  Sophie: { mouthY: 48, mouthWidth: 0.84 },
  Priya: { mouthY: 47, mouthWidth: 0.84 },
  Hans: { mouthY: 47, mouthWidth: 0.88 },
  Yuki: { mouthY: 52, mouthWidth: 0.78 },
  Carlos: { mouthY: 49, mouthWidth: 0.87 },
  Giulia: { mouthY: 49, mouthWidth: 0.82 },
  Omar: { mouthY: 46, mouthWidth: 0.89 },
};

// ─── Teacher Component ─────────────────────────────────────────────────────────
function TeacherAvatar({
  scene,
  greeting,
  showGreeting,
  isSpeaking,
  isPreparingAudio,
  spokenText,
  audioViseme,
  overrideName,
  overrideImage,
  activeClip,
  onClipFinished,
}: {
  scene: Scene;
  greeting: string;
  showGreeting: boolean;
  isSpeaking?: boolean;
  isPreparingAudio?: boolean;
  spokenText?: string;
  audioViseme?: VisemeData | null;
  overrideName?: string;
  overrideImage?: string;
  activeClip?: ScenePilotClip | null;
  onClipFinished?: () => void;
}) {
  const { viseme } = useVisemeSequence(spokenText || greeting, Boolean(isSpeaking));
  const facePosition = IMMERSIVE_TEACHER_FACE_POSITIONS[overrideName || scene.teacherName] || { mouthY: 52, mouthWidth: 0.84 };
  const fallbackMouthOpen = ["A", "C", "D", "F"].includes(viseme);
  const synchronizedMouthStyle = audioViseme
    ? {
        width: `${Math.min(18, Math.max(11, audioViseme.mouthWidth * 0.3)) * facePosition.mouthWidth}%`,
        height: `${Math.min(7, Math.max(1.8, audioViseme.mouthHeight * 0.24))}%`,
        borderRadius: `${Math.max(38, Math.min(50, 44 + audioViseme.lipRound * 0.55))}%`,
      }
    : {
        width: `${(fallbackMouthOpen ? 16 : 12) * facePosition.mouthWidth}%`,
        height: fallbackMouthOpen ? "5.5%" : "1.8%",
        borderRadius: viseme === "F" ? "45%" : "50%",
      };
  const jawOffset = audioViseme ? Math.min(4, audioViseme.jawDrop * 0.16) : 0;
  const mouthOpen = audioViseme
    ? audioViseme.mouthHeight >= 14
    : ["A", "C", "D", "F"].includes(viseme);
  const tongueVisible = Boolean(audioViseme?.tongueVisible);
  const teethVisible = audioViseme
    ? !tongueVisible && audioViseme.mouthHeight >= 7 && audioViseme.mouthHeight < 22
    : ["C", "E", "G"].includes(viseme);
  // O retrato permanece sem boca sintética até haver mídia docente aprovada.
  const showSyntheticMouth = false;
  const showPilotClip = Boolean(
    activeClip?.videoUrl
      && activeClip.sceneId === scene.id
      && activeClip.teacherName === (overrideName || scene.teacherName),
  );
  return (
    <div
      className="immersive-teacher absolute bottom-0 right-4 flex flex-col items-center z-30"
      style={{ width: "clamp(120px, 18vw, 220px)" }}
    >
      {/* Speech bubble */}
      {showGreeting && (
        <div
          className="relative mb-2 rounded-2xl px-3 py-2 text-sm font-medium shadow-2xl max-w-xs"
          style={{
            background: "rgba(255,255,255,0.97)",
            color: "#1e293b",
            border: "2px solid rgba(99,102,241,0.3)",
            maxWidth: "clamp(160px, 28vw, 300px)",
            fontSize: "clamp(11px, 1.2vw, 14px)",
          }}
        >
          <div className="font-bold text-indigo-600 mb-1" style={{ fontSize: "clamp(10px, 1vw, 12px)" }}>
            {overrideName || scene.teacherName}
          </div>
          <div>{greeting}</div>
          {isPreparingAudio && (
            <div className="mt-1 text-[10px] font-semibold text-indigo-500" aria-live="polite">
              Preparando voz neural…
            </div>
          )}
          {/* Arrow */}
          <div
            className="absolute -bottom-2 right-6 w-4 h-4 rotate-45"
            style={{ background: "rgba(255,255,255,0.97)", borderRight: "2px solid rgba(99,102,241,0.3)", borderBottom: "2px solid rgba(99,102,241,0.3)" }}
          />
        </div>
      )}

      {/* Teacher image with quality animations */}
      <div
        style={{
          position: "relative",
          width: "100%",
          // A foto permanece estável até existir um motor facial guiado por áudio.
          // Não simulamos gestos ou tremores como se fossem fala natural.
          animation: "none",
          filter: isSpeaking
            ? "drop-shadow(0 8px 40px rgba(99,102,241,0.7)) brightness(1.08)"
            : "drop-shadow(0 8px 32px rgba(0,0,0,0.5))",
          transformOrigin: "bottom center",
          transition: "filter 0.3s ease",
        }}
      >
        <img
          src={overrideImage || scene.teacherImage}
          alt={overrideName || scene.teacherName}
          style={{
            width: "100%",
            height: "auto",
            objectFit: "contain",
            borderRadius: "12px",
          }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
          }}
        />
        {showPilotClip && activeClip?.videoUrl && (
          <video
            key={activeClip.id}
            src={activeClip.videoUrl}
            autoPlay
            muted
            playsInline
            preload="auto"
            aria-label={`Clipe pedagógico de ${activeClip.teacherName}: ${activeClip.dialogue}`}
            onEnded={onClipFinished}
            onError={onClipFinished}
            onAbort={onClipFinished}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "12px",
              pointerEvents: "none",
            }}
          />
        )}
        {/* Eye blink overlay — natural blinking every 3-5 seconds */}
        <div
          style={{
            position: "absolute",
            top: "18%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "30%",
            height: "3%",
            background: "rgba(0,0,0,0)",
            borderRadius: "50%",
            animation: "eye-blink 4s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />
        {/* Subtle eyebrow and cheek micro-expressions retain the portrait's natural appearance. */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute", top: "14%", left: "39%", width: "9%", height: "1.6%",
            borderTop: "2px solid rgba(55,35,28,0.28)", borderRadius: "50%",
            animation: isSpeaking ? "brow-focus 1.8s ease-in-out infinite" : "brow-focus 5s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute", top: "14%", right: "39%", width: "9%", height: "1.6%",
            borderTop: "2px solid rgba(55,35,28,0.28)", borderRadius: "50%",
            animation: isSpeaking ? "brow-focus 1.8s ease-in-out infinite reverse" : "brow-focus 5s ease-in-out infinite reverse",
            pointerEvents: "none",
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute", top: "32%", left: "34%", width: "32%", height: "13%",
            borderRadius: "50%", background: isSpeaking ? "radial-gradient(ellipse, rgba(255,154,154,.12), transparent 68%)" : "transparent",
            animation: "cheek-warmth 2.4s ease-in-out infinite", pointerEvents: "none",
          }}
        />
        {/* A boca fica neutra no retrato até existir mídia facial aprovada. */}
        {showSyntheticMouth && isSpeaking && (
          <div
            style={{
              position: "absolute",
              top: `${facePosition.mouthY}%`,
              left: "50%",
              transform: `translate(-50%, -50%) translateY(${jawOffset}px)`,
              ...synchronizedMouthStyle,
              background: "radial-gradient(ellipse at 50% 48%, rgba(48,10,14,0.9) 0%, rgba(88,27,33,0.86) 62%, rgba(175,75,82,0.34) 82%, transparent 100%)",
              border: "1px solid rgba(82,24,30,0.45)",
              boxShadow: "0 1px 2px rgba(45,8,12,0.35), inset 0 1px 1px rgba(255,209,209,0.18)",
              opacity: audioViseme ? Math.min(0.9, Math.max(0.48, audioViseme.mouthHeight / 24)) : 0.72,
              mixBlendMode: "normal",
              overflow: "hidden",
              transition: "width 55ms linear, height 55ms linear, border-radius 55ms linear, transform 55ms linear",
              pointerEvents: "none",
            }}
            aria-label={audioViseme ? "Viseme sincronizado ao áudio" : `Viseme ${viseme}`}
          >
            {teethVisible && (
              <span
                aria-hidden="true"
                style={{
                  position: "absolute", top: "8%", left: "18%", width: "64%", height: "25%",
                  borderRadius: "50%", background: "rgba(255,240,225,0.68)",
                }}
              />
            )}
            {tongueVisible && (
              <span
                aria-hidden="true"
                style={{
                  position: "absolute", bottom: "3%", left: "22%", width: "56%", height: "54%",
                  borderRadius: "55% 55% 42% 42%", background: "rgba(224,93,108,0.72)",
                }}
              />
            )}
            {mouthOpen && !tongueVisible && (
              <span
                aria-hidden="true"
                style={{
                  position: "absolute", bottom: "4%", left: "24%", width: "52%", height: "30%",
                  borderRadius: "50%", background: "rgba(162,49,64,0.48)",
                }}
              />
            )}
          </div>
        )}
        {/* Glow ring when speaking */}
        {isSpeaking && (
          <div
            style={{
              position: "absolute",
              inset: "-6px",
              borderRadius: "16px",
              border: "2px solid rgba(167,139,250,0.6)",
              animation: "teacher-ring 1.5s ease-out infinite",
              pointerEvents: "none",
            }}
          />
        )}
      </div>
    </div>
  );
}

// ─── Vocabulary Card ────────────────────────────────────────────
function VocabCard({
  hotspot,
  langCode,
  nativeLang,
  nativeLangFlag,
  onClose,
  onSpeak,
  onPractice,
}: {
  hotspot: Hotspot;
  langCode: string;
  nativeLang: string;
  nativeLangFlag: string;
  onClose: () => void;
  onSpeak: (text: string, lang: string) => void;
  onPractice: () => void;
}) {
  return (
    <div
      className="absolute z-50 rounded-2xl shadow-2xl overflow-hidden"
      style={{
        left: `clamp(8px, ${hotspot.x > 60 ? hotspot.x - 32 : hotspot.x + 2}%, calc(100% - 280px))`,
        top: `clamp(8px, ${hotspot.y > 60 ? hotspot.y - 45 : hotspot.y + 6}%, calc(100% - 260px))`,
        width: "clamp(220px, 28vw, 280px)",
        background: "rgba(15, 15, 30, 0.97)",
        border: `2px solid ${hotspot.color}`,
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ background: `${hotspot.color}22` }}
      >
        <div className="flex items-center gap-2">
          <span className="inline-flex" style={{ color: hotspot.color }}><HotspotVisual hotspot={hotspot} size={25} /></span>
          <div>
            {/* Show the word in the target language (what student is learning) */}
            <div className="text-white font-bold" style={{ fontSize: "clamp(14px, 1.8vw, 18px)" }}>
              {getHotspotLabel(hotspot.id, hotspot.label, langCode.split("-")[0].toLowerCase())}
            </div>
            {/* Show native language translation below */}
            <div style={{ color: hotspot.color, fontSize: "clamp(10px, 1.2vw, 13px)" }}>
              {hotspot.translation}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white rounded-full w-7 h-7 flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.1)" }}
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-3">
        {/* Pronunciation */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Como falar</div>
            <div className="text-yellow-300 font-semibold" style={{ fontSize: "clamp(12px, 1.4vw, 15px)" }}>
              {hotspot.pronunciation}
            </div>
          </div>
          <button
            onClick={() => onSpeak(hotspot.label, langCode)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-white text-xs font-semibold active:scale-95 transition-transform"
            style={{ background: hotspot.color }}
          >
            🔊 {getHotspotLabel(hotspot.id, hotspot.label, langCode)}
          </button>
        </div>

         {/* Example */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="text-gray-400 text-xs uppercase tracking-wider">Exemplo</div>
            <button
              onClick={() => onSpeak(hotspot.example, langCode)}
              className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ background: hotspot.color + '33', color: hotspot.color }}
            >🔊 Ouvir</button>
          </div>
          <div className="text-white" style={{ fontSize: "clamp(11px, 1.3vw, 14px)" }}>
            {hotspot.example}
          </div>
        </div>
        {/* Translation in native language */}
        <div
          className="rounded-xl p-2"
          style={{ background: "rgba(255,255,255,0.05)" }}
        >
          <div className="flex items-center justify-between mb-1">
            {/* Idioma nativo: fundo branco, letra azul */}
            <div
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: "#ffffff", color: "#1d4ed8", border: "1px solid #93c5fd", display: "inline-flex", alignItems: "center", gap: 3 }}
            >
              <span>{nativeLangFlag}</span>
              <span style={{ textTransform: "uppercase", letterSpacing: 0.5 }}>{nativeLang.split("-")[0].toUpperCase()}</span>
            </div>
            <button
              onClick={() => onSpeak(hotspot.examplePt, nativeLang)}
              className="text-xs px-2 py-0.5 rounded-full font-semibold text-green-400"
              style={{ background: 'rgba(34,197,94,0.15)' }}
            >🔊 Ouvir</button>
          </div>
          <div className="text-gray-200" style={{ fontSize: "clamp(11px, 1.3vw, 14px)" }}>
            {hotspot.examplePt}
          </div>
        </div>
        <button
          type="button"
          onClick={onPractice}
          className="w-full rounded-xl bg-amber-400 px-3 py-2 text-sm font-black text-slate-950 transition hover:bg-amber-300"
        >
          🧠 Praticar e criar frase
        </button>
      </div>
    </div>
  );
}

// ─── Language code → BCP-47 map (for TTS) ───────────────────────────────────
const LANG_TO_BCP47: Record<string, string> = {
  "pt-BR": "pt-BR", "pt-PT": "pt-PT", "en-US": "en-US", "en-GB": "en-GB",
  "es-ES": "es-ES", "es-MX": "es-MX", "fr-FR": "fr-FR", "de-DE": "de-DE",
  "it-IT": "it-IT", "ja-JP": "ja-JP", "zh-CN": "zh-CN", "ko-KR": "ko-KR",
  "ru-RU": "ru-RU", "ar-SA": "ar-SA", "hi-IN": "hi-IN", "nl-NL": "nl-NL",
  "pl-PL": "pl-PL", "tr-TR": "tr-TR", "sv-SE": "sv-SE", "da-DK": "da-DK",
  "fi-FI": "fi-FI", "nb-NO": "nb-NO", "cs-CZ": "cs-CZ", "hu-HU": "hu-HU",
  "ro-RO": "ro-RO", "uk-UA": "uk-UA", "el-GR": "el-GR", "he-IL": "he-IL",
  "id-ID": "id-ID", "ms-MY": "ms-MY", "th-TH": "th-TH", "vi-VN": "vi-VN",
};

// ─── Native language label map (shows flag + name in VocabCard) ──────────────
const LANG_LABELS: Record<string, { flag: string; name: string }> = {
  "pt-BR": { flag: "🇧🇷", name: "Português" },
  "pt-PT": { flag: "🇵🇹", name: "Português" },
  "en-US": { flag: "🇺🇸", name: "English" },
  "en-GB": { flag: "🇬🇧", name: "English" },
  "es-ES": { flag: "🇪🇸", name: "Español" },
  "es-MX": { flag: "🇲🇽", name: "Español" },
  "fr-FR": { flag: "🇫🇷", name: "Français" },
  "de-DE": { flag: "🇩🇪", name: "Deutsch" },
  "it-IT": { flag: "🇮🇹", name: "Italiano" },
  "ja-JP": { flag: "🇯🇵", name: "日本語" },
  "zh-CN": { flag: "🇨🇳", name: "中文" },
  "ko-KR": { flag: "🇰🇷", name: "한국어" },
  "ru-RU": { flag: "🇷🇺", name: "Русский" },
  "ar-SA": { flag: "🇸🇦", name: "العربية" },
  "hi-IN": { flag: "🇮🇳", name: "हिन्दी" },
  "nl-NL": { flag: "🇳🇱", name: "Nederlands" },
  "pl-PL": { flag: "🇵🇱", name: "Polski" },
  "tr-TR": { flag: "🇹🇷", name: "Türkçe" },
  "sv-SE": { flag: "🇸🇪", name: "Svenska" },
  "id-ID": { flag: "🇮🇩", name: "Bahasa Indonesia" },
};

// ─── Main Component ────────────────────────────────────────────────────────────
export default function ImmersiveScene() {
  const [, setLocation] = useLocation();
  // ── Single source of truth: LanguageContext ──
  const { profile, setProfile, immersionMode } = useLanguage();
  const { isAuthenticated, loading: isAuthLoading } = useAuth();

  // Auto-select scene based on user's target language from LanguageContext profile
  const getInitialScene = (): Scene | null => {
    try {
      const requestedSceneId = new URLSearchParams(window.location.search).get("scene")?.trim();
      if (requestedSceneId) {
        const requestedScene = IMMERSIVE_SCENES.find((scene) => scene.id === requestedSceneId);
        if (requestedScene) return requestedScene;
      }
      // Priority 1: LanguageContext profile (already loaded from localStorage)
      let targetCode = profile.targetCode || "";
      // Priority 2: ml_lang_profile in localStorage
      if (!targetCode) {
        const saved = localStorage.getItem("ml_lang_profile");
        if (saved) { const parsed = JSON.parse(saved); targetCode = parsed.targetCode || ""; }
      }
      // Priority 3: ml_target_lang legacy key
      if (!targetCode) targetCode = localStorage.getItem("ml_target_lang") || "";
      if (targetCode) {
        const base = targetCode.split("-")[0].toLowerCase();
        // Prioriza a etapa A1 da língua escolhida ao iniciar a primeira lição.
        const beginnerMatch = IMMERSIVE_SCENES.find(s => (s.langCode === base || s.teacherLang.startsWith(base)) && sceneCefrLevel(s) === "A1");
        if (beginnerMatch) return beginnerMatch;
        // Fallback to any scene matching the language
        const match = IMMERSIVE_SCENES.find(s => s.langCode === base || s.teacherLang.startsWith(base));
        if (match) return match;
      }
    } catch {}
    return null;
  };

  const [selectedScene, setSelectedScene] = useState<Scene | null>(() => getInitialScene());
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);
  const [activeJamesClipId, setActiveJamesClipId] = useState<JamesTropicalPilotClipId | null>(null);
  const [activeSophieClipId, setActiveSophieClipId] = useState<SophieCafePilotClipId | null>(null);
  const activeJamesClip = activeJamesClipId
    ? JAMES_TROPICAL_PILOT_CLIPS.find((clip) => clip.id === activeJamesClipId) || null
    : null;
  const activeSophieClip = activeSophieClipId
    ? SOPHIE_CAFE_PILOT_CLIPS.find((clip) => clip.id === activeSophieClipId) || null
    : null;
  const playJamesTropicalClip = useCallback((clipId: JamesTropicalPilotClipId) => {
    if (selectedScene?.id !== "beach" || selectedScene.teacherName !== "James") return null;
    const clip = JAMES_TROPICAL_PILOT_CLIPS.find((candidate) => candidate.id === clipId && candidate.videoUrl);
    if (!clip) return null;
    setActiveJamesClipId(clip.id);
    return clip;
  }, [selectedScene?.id, selectedScene?.teacherName]);
  const playSophieCafeClip = useCallback((clipId: SophieCafePilotClipId) => {
    if (selectedScene?.id !== "cafe" || selectedScene.teacherName !== "Sophie") return null;
    const clip = SOPHIE_CAFE_PILOT_CLIPS.find((candidate) => candidate.id === clipId && candidate.videoUrl);
    if (!clip) return null;
    setActiveSophieClipId(clip.id);
    return clip;
  }, [selectedScene?.id, selectedScene?.teacherName]);
  const sceneInitialized = useRef(false); // Track if scene was auto-initialized from targetLang

  useEffect(() => {
    const requestedSceneId = new URLSearchParams(window.location.search).get("scene")?.trim();
    if (!requestedSceneId) return;
    const requestedScene = IMMERSIVE_SCENES.find((scene) => scene.id === requestedSceneId);
    if (requestedScene && requestedScene.id !== selectedScene?.id) {
      setSelectedScene(requestedScene);
      sceneInitialized.current = true;
    }
  }, [selectedScene?.id]);

  // ── Native + Target from LanguageContext (single source of truth) ──
  const nativeLang = profile.nativeCode || "pt-BR";
  const nativeLangInfo = LANG_LABELS[nativeLang] || { flag: "🌐", name: "Nativo" };
  // Always derive targetLang from profile (reactive to LanguageContext changes)
  const profileTarget = profile.targetCode || localStorage.getItem("ml_target_lang") || "en-US";
  const [targetLang, setTargetLang] = useState<string>(() => profileTarget);
  const [selectedSceneTeacherId, setSelectedSceneTeacherId] = useState<string | null>(null);
  const [authorizedSceneMaterial, setAuthorizedSceneMaterial] = useState<{
    lessonKey: string;
    sceneId: string;
    targetLanguage: string;
    nativeLanguage: string;
  } | null>(null);

  // Keep targetLang in sync when LanguageContext profile changes (e.g. user changed language on Home)
  useEffect(() => {
    if (profile.targetCode && profile.targetCode !== targetLang) {
      const newCode = profile.targetCode;
      setTargetLang(newCode);
      // Also auto-switch to matching scene if currently in scene picker
      if (!selectedScene) {
        const base = newCode.split("-")[0].toLowerCase();
        const match = IMMERSIVE_SCENES.find(s => s.langCode === base || s.teacherLang.toLowerCase().startsWith(base));
        if (match) setSelectedScene(match);
      }
    }
  }, [profile.targetCode]);
  const [showLangPicker, setShowLangPicker] = useState(false);

  // Auto-enter the first scene matching the user's target language — only on mount or targetLang change
  // Uses sceneInitialized ref to prevent overriding user navigation
  useEffect(() => {
    if (sceneInitialized.current) return; // Already initialized — don't override user navigation
    if (!targetLang) return;
    const base = targetLang.split("-")[0].toLowerCase();
    const match = IMMERSIVE_SCENES.find(s => s.langCode === base || s.teacherLang.toLowerCase().startsWith(base));
    if (match) {
      setSelectedScene(match);
      sceneInitialized.current = true;
    }
  }, [targetLang]);

  // Effective language for hotspots: use targetLang short code (e.g. 'es' not 'es-ES')
  // hotspot-translations.ts uses short codes as keys
  const effectiveLang = (_scene: { teacherLang: string }) => {
    const code = targetLang || "en-US";
    return code.split("-")[0].toLowerCase();
  };
  // Full BCP-47 code for Web Speech API (e.g. 'es-ES', 'en-US')
  const effectiveSpeakLang = (_scene: { teacherLang: string }) => targetLang || "en-US";
  const sceneTeacherResolution = useMemo(
    () => selectedScene
      ? resolveSceneTeacherForTarget(selectedScene, targetLang)
      : { teacher: null, materialIsInTargetLanguage: false, preserveScenePortrait: true },
    [selectedScene, targetLang],
  );
  const compatibleSceneTeachers = useMemo(
    () => sceneTeacherResolution.materialIsInTargetLanguage ? getTargetLanguageTeachers(targetLang) : [],
    [sceneTeacherResolution.materialIsInTargetLanguage, targetLang],
  );
  const selectedSceneTeacher = compatibleSceneTeachers.find((teacher) => teacher.id === selectedSceneTeacherId) || null;
  const activeSceneTeacher = selectedSceneTeacher || sceneTeacherResolution.teacher;
  const teachingScene = useMemo<Scene | null>(() => {
    if (!activeSceneTeacher || !sceneTeacherResolution.materialIsInTargetLanguage) return selectedScene;
    if (!selectedScene) return null;
    return {
      ...selectedScene,
      teacherName: activeSceneTeacher.name,
      teacherImage: activeSceneTeacher.photo || selectedScene.teacherImage,
      teacherLang: activeSceneTeacher.voiceLang,
      teacherGender: activeSceneTeacher.gender || selectedScene.teacherGender,
    };
  }, [activeSceneTeacher, sceneTeacherResolution.materialIsInTargetLanguage, selectedScene]);

  useEffect(() => {
    if (!selectedSceneTeacherId) return;
    if (!compatibleSceneTeachers.some((teacher) => teacher.id === selectedSceneTeacherId)) {
      setSelectedSceneTeacherId(null);
    }
  }, [compatibleSceneTeachers, selectedSceneTeacherId]);

  useEffect(() => {
    setAuthorizedSceneMaterial(null);
  }, [selectedScene?.id, targetLang, nativeLang]);

  const handleSelectTargetLang = (code: string) => {
    setTargetLang(code);
    setSelectedSceneTeacherId(null);
    localStorage.setItem("ml_target_lang", code);
    // Sync with LanguageContext (single source of truth for the whole app)
    const info = LANG_LABELS[code] || { flag: "🌐", name: code };
    setProfile({ ...profile, targetCode: code, targetName: info.name, targetFlag: info.flag });
    // Auto-switch to a scene matching the new language
    const base = code.split("-")[0].toLowerCase();
    const match = IMMERSIVE_SCENES.find(s => s.langCode === base || s.teacherLang.toLowerCase().startsWith(base));
    if (match) setSelectedScene(match);
    setShowLangPicker(false);
  };
  const currentLangInfo = targetLang
    ? (LANG_LABELS[targetLang] || { flag: "🌐", name: targetLang })
    : { flag: "🌐", name: "Idioma" };
  const targetLanguageBlockIsPlanned = Boolean(targetLang) && !isInitialCommercialTargetLanguage(targetLang);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeSpeechText, setActiveSpeechText] = useState("");
  const [isPreparingNeuralAudio, setIsPreparingNeuralAudio] = useState(false);
  const [dialogAudioSource, setDialogAudioSource] = useState<string | null>(null);
  const [dialogSpeechRate, setDialogSpeechRate] = useState<number>(0.85);
  const [dialogAuthRequired, setDialogAuthRequired] = useState(false);
  const ttsMut = trpc.tts.speak.useMutation();
  const googleTtsMut = trpc.ttsGoogle.generate.useMutation();
  const sceneDialogueVoiceMut = trpc.sceneDialogueVoice.speak.useMutation();
  const authorizeLessonMut = trpc.trialAccess.authorizeLesson.useMutation();
  const dialogTranscribeMut = trpc.voiceTranscription.transcribe.useMutation();
  const dialogTranslateMut = trpc.translate.dialogueText.useMutation();
  const immersiveSceneTutorMut = trpc.immersiveSceneTutor.chat.useMutation();
  const localizedSceneDialogueQuery = trpc.curriculum.localizedSceneDialogue.useQuery({
    lessonKey: authorizedSceneMaterial?.lessonKey || "scene:pending",
    sceneId: selectedScene?.id || "pending",
    targetLanguage: targetLang,
    nativeLanguage: nativeLang,
  }, {
    enabled: isAuthenticated
      && authorizedSceneMaterial?.sceneId === selectedScene?.id
      && authorizedSceneMaterial?.targetLanguage === targetLang
      && authorizedSceneMaterial?.nativeLanguage === nativeLang
      && isInitialCommercialTargetLanguage(targetLang),
    staleTime: 1000 * 60 * 30,
    retry: false,
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const dialogAudioElementRef = useRef<HTMLAudioElement | null>(null);
  const dialogAudioObjectUrlRef = useRef<string | null>(null);
  const localSpeechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const activeDialogLineRef = useRef<string | null>(null);
  const activeDialogWordCountRef = useRef(0);
  const dialogAudioContextRef = useRef<AudioContext | null>(null);
  const activeSpeechRequestRef = useRef<string | null>(null);
  const [audioViseme, setAudioViseme] = useState<VisemeData | null>(null);
  const handleAudioViseme = useCallback((viseme: VisemeData) => setAudioViseme(viseme), []);
  const { stop: stopVisemeSync, primeAudioContext: primeVisemeAudio } = useTTSVisemeSync(handleAudioViseme);

  useEffect(() => {
    if (dialogAudioElementRef.current) dialogAudioElementRef.current.playbackRate = dialogSpeechRate;
    if (nativeHelpAudioRef.current) nativeHelpAudioRef.current.playbackRate = dialogSpeechRate;
  }, [dialogSpeechRate]);

  const stopTeacherAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.removeAttribute("src");
      audioRef.current.load();
      audioRef.current = null;
    }
    if (dialogAudioObjectUrlRef.current) {
      URL.revokeObjectURL(dialogAudioObjectUrlRef.current);
      dialogAudioObjectUrlRef.current = null;
    }
    setDialogAudioSource(null);
    if (localSpeechRef.current && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      localSpeechRef.current = null;
    }
    stopVisemeSync();
    setAudioViseme(null);
    setIsSpeaking(false);
    setIsPreparingNeuralAudio(false);
    setActiveSpeechText("");
    activeSpeechRequestRef.current = null;
  }, [stopVisemeSync]);

  const playLocalDialogFallback = useCallback((text: string, language: string, requestKey: string, gender?: 'male' | 'female') => {
    if (!("speechSynthesis" in window) || !text.trim()) return false;
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return false;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = dialogSpeechRate;
    utterance.pitch = 1;
    const languagePrefix = language.toLowerCase().split("-")[0];
    const regionalVoices = voices.filter((voice) => voice.lang.toLowerCase().startsWith(languagePrefix));
    const maleVoicePattern = /(^|\s)(david|mark|guy|daniel|george|james|ryan|andrew|matthew|eric|brian|michael|christopher|male)(\s|$)/i;
    const femaleVoicePattern = /(^|\s)(zira|hazel|susan|aria|jenny|sara|samantha|female)(\s|$)/i;
    const preferredVoice = gender === "male"
      ? regionalVoices.find((voice) => maleVoicePattern.test(voice.name))
      : gender === "female"
        ? regionalVoices.find((voice) => femaleVoicePattern.test(voice.name))
        : regionalVoices[0];
    if (gender && !preferredVoice) return false;
    if (preferredVoice) utterance.voice = preferredVoice;
    const releaseRequest = () => {
      if (activeSpeechRequestRef.current === requestKey) activeSpeechRequestRef.current = null;
    };
    const finish = () => {
      stopVisemeSync();
      setAudioViseme(null);
      setIsSpeaking(false);
      setIsPreparingNeuralAudio(false);
      if (localSpeechRef.current === utterance) {
        localSpeechRef.current = null;
        setActiveSpeechText("");
      }
      releaseRequest();
    };
    utterance.onstart = () => {
      setIsPreparingNeuralAudio(false);
      setIsSpeaking(true);
      if (activeDialogLineRef.current === text) setDlgAudioClock(false);
    };
    utterance.onend = finish;
    utterance.onerror = () => {
      finish();
      setDlgFeedback("Não foi possível iniciar o áudio neste navegador. Leia a fala em inglês e tente novamente.");
    };
    localSpeechRef.current = utterance;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    return true;
  }, [dialogSpeechRate, stopVisemeSync]);

  const playGuestBrowserVoice = useCallback((text: string, language: string, gender?: 'male' | 'female') => {
    const requestKey = `browser-dialog:${language}:${gender || "female"}:${text}`;
    stopTeacherAudio();
    activeSpeechRequestRef.current = requestKey;
    setActiveSpeechText(text);
    setIsPreparingNeuralAudio(true);
    if (!playLocalDialogFallback(text, language, requestKey, gender)) {
      setIsPreparingNeuralAudio(false);
      setActiveSpeechText("");
      setDlgFeedback("A voz do navegador não está disponível. Entre para usar a voz neural da cena.");
    }
  }, [playLocalDialogFallback, stopTeacherAudio]);

  useEffect(() => () => stopTeacherAudio(), [stopTeacherAudio]);

  const playTeacherAudio = useCallback(async (source: string, phrase: string, _language: string, requestKey: string, revokeOnEnd = false) => {
    const audio = dialogAudioElementRef.current;
    if (!audio) throw new Error("dialogue-audio-control-unavailable");
    if (dialogAudioObjectUrlRef.current && dialogAudioObjectUrlRef.current !== source) {
      URL.revokeObjectURL(dialogAudioObjectUrlRef.current);
      dialogAudioObjectUrlRef.current = null;
    }
    if (source.startsWith("blob:")) dialogAudioObjectUrlRef.current = source;
    audio.pause();
    audio.currentTime = 0;
    audio.src = source;
    audio.preload = "auto";
    audio.setAttribute("playsinline", "");
    audio.muted = false;
    audio.volume = 1;
    audio.playbackRate = dialogSpeechRate;
    audio.load();
    setDialogAudioSource(source);
    audioRef.current = audio;
    const releaseRequest = () => {
      if (activeSpeechRequestRef.current === requestKey) activeSpeechRequestRef.current = null;
    };
    const updatesActiveDialog = () => activeDialogLineRef.current === phrase && activeDialogWordCountRef.current > 0;
    const updateDialogWordsFromAudio = () => {
      if (!updatesActiveDialog() || !Number.isFinite(audio.duration) || audio.duration <= 0) return;
      const wordCount = activeDialogWordCountRef.current;
      const nextWord = Math.min(wordCount, Math.floor((audio.currentTime / audio.duration) * wordCount));
      setDlgWordIdx((current) => Math.max(current, nextWord));
    };
    audio.onplay = () => {
      setIsPreparingNeuralAudio(false);
      setIsSpeaking(true);
      if (updatesActiveDialog()) setDlgAudioClock(true);
    };
    audio.onloadedmetadata = updateDialogWordsFromAudio;
    audio.ontimeupdate = updateDialogWordsFromAudio;
    audio.onended = () => {
      if (updatesActiveDialog()) {
        setDlgWordIdx(activeDialogWordCountRef.current);
        setDlgAudioClock(false);
      }
      stopVisemeSync();
      setAudioViseme(null);
      setIsSpeaking(false);
      if (audioRef.current === audio) {
        audioRef.current = null;
        setActiveSpeechText("");
      }
      releaseRequest();
      if (revokeOnEnd) URL.revokeObjectURL(source);
    };
    audio.onerror = () => {
      if (updatesActiveDialog()) setDlgAudioClock(false);
      stopVisemeSync();
      setAudioViseme(null);
      setIsSpeaking(false);
      setIsPreparingNeuralAudio(false);
      if (audioRef.current === audio) {
        audioRef.current = null;
        setActiveSpeechText("");
      }
      releaseRequest();
      setDlgFeedback("A voz não carregou. Use o botão Ouvir James ou a voz do navegador para tentar novamente.");
    };
    try {
      await audio.play();
    } catch (error) {
      if (updatesActiveDialog()) setDlgAudioClock(false);
      if (audioRef.current === audio) audioRef.current = null;
      setIsPreparingNeuralAudio(false);
      setIsSpeaking(false);
      setDlgFeedback("A reprodução automática foi bloqueada. Use o controle de áudio visível para tentar novamente.");
      throw error;
    }
  }, [dialogSpeechRate, stopVisemeSync]);

  const replayVisibleDialogAudio = useCallback(async () => {
    const audio = dialogAudioElementRef.current;
    if (!audio || !dialogAudioSource) {
      setDlgFeedback("A voz ainda está sendo preparada. Tente novamente em alguns instantes.");
      return;
    }
    try {
      audio.muted = false;
      audio.volume = 1;
      audio.playbackRate = dialogSpeechRate;
      audio.currentTime = 0;
      await audio.play();
      setDlgFeedback("");
    } catch {
      setDlgFeedback("Não foi possível iniciar esta voz. Use a voz do navegador para ouvir a fala.");
    }
  }, [dialogAudioSource, dialogSpeechRate]);

  const primeDialogAudioFromGesture = useCallback(() => {
    try {
      const AudioContextConstructor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextConstructor) return;
      const context = dialogAudioContextRef.current || new AudioContextConstructor();
      dialogAudioContextRef.current = context;
      // Resume happens synchronously in the visitor's click. The actual neural
      // MP3 arrives asynchronously, so this preserves playback eligibility for
      // the first scripted line instead of relying on a later autoplay attempt.
      void context.resume();
    } catch {
      // The visible Ouvir inglês control remains available as an explicit retry.
    }
  }, []);

  const playPublicSceneDialogue = useCallback(async (text: string, language: string, gender: 'male' | 'female', requestKey: string) => {
    const result = await waitForSpeechResult(
      sceneDialogueVoiceMut.mutateAsync({ text: text.slice(0, 500), language, gender }),
      12_000,
    );
    if (!result.success || !("audioBase64" in result)) return false;
    const source = audioBase64ToObjectUrl(result.audioBase64, "audio/mp3");
    await playTeacherAudio(source, text, language, requestKey);
    return true;
  }, [playTeacherAudio, sceneDialogueVoiceMut]);

  // Neural speech only: object pronunciation must never use a system/browser voice.
  const speak = useCallback(async (text: string, lang: string, _rate?: number, gender?: 'male' | 'female', purpose: ImmersiveSpeechPurpose = "teacher") => {
    if (!text?.trim()) return;
    const teacherGender = gender || (selectedScene?.teacherGender === 'male' ? 'male' : 'female');
    const requestKey = `${purpose}:${lang}:${teacherGender}:${text}`;
    // A mesma linha pode ser solicitada por clique e atualização visual quase ao
    // mesmo tempo. Mantemos um único pedido até o áudio encerrar ou falhar.
    if (activeSpeechRequestRef.current === requestKey) return;
    // A troca de fala deve também encerrar o relógio de visemas anterior.
    stopTeacherAudio();
    stopEdgeTTS();
    activeSpeechRequestRef.current = requestKey;
    setActiveSpeechText(text);
    setIsPreparingNeuralAudio(true);

    const playEdgeNeural = async () => {
      const edgeAudio = await ttsMut.mutateAsync({ text: text.slice(0, 500), voiceLang: lang, gender: teacherGender });
      if (!edgeAudio.success || !edgeAudio.audioBase64) return false;
      const source = audioBase64ToObjectUrl(edgeAudio.audioBase64, "audio/mp3");
      await playTeacherAudio(source, text, lang, requestKey);
      return true;
    };

    // Edge uses the locale-and-gender voice map and caches repetitions in the
    // application process, so hotspot clicks are responsive and regionally correct.
    if (purpose === "hotspot") {
      try {
        if (await playEdgeNeural()) return;
      } catch { /* Try the other neural provider below. */ }
    }
    try {
      const googleAudio = await googleTtsMut.mutateAsync({
        text: text.slice(0, 500),
        languageCode: lang,
        gender: teacherGender === "male" ? "MALE" : "FEMALE",
      });
      if (googleAudio.audioUrl) {
        await playTeacherAudio(googleAudio.audioUrl, text, lang, requestKey);
        return;
      }
    } catch { /* Preserve the existing neural-TTS fallback. */ }
    try {
      if (await playEdgeNeural()) return;
    } catch { /* fallback below */ }
    if (playLocalDialogFallback(text, lang, requestKey, selectedScene?.teacherGender)) {
      setDlgFeedback("A voz neural não respondeu. A fala está usando a voz disponível neste navegador; toque em Ouvir inglês para repetir.");
      return;
    }
    if (activeDialogLineRef.current === text) setDlgAudioClock(false);
    setGreetingText("A voz neural não está disponível agora. Toque novamente para ouvir a pronúncia natural.");
    setIsPreparingNeuralAudio(false);
    setIsSpeaking(false);
    setActiveSpeechText("");
    if (activeSpeechRequestRef.current === requestKey) activeSpeechRequestRef.current = null;
  }, [googleTtsMut, playLocalDialogFallback, playTeacherAudio, selectedScene?.teacherGender, stopTeacherAudio, ttsMut]);

  const requestSpeechSafely = useCallback((text: string, language: string, gender?: 'male' | 'female', purpose: ImmersiveSpeechPurpose = "teacher") => {
    if (isAuthLoading) return;
    if (!isAuthenticated) {
      setDialogAuthRequired(true);
      const requestKey = `local-dialog:${language}:${gender || "female"}:${text}`;
      stopTeacherAudio();
      activeSpeechRequestRef.current = requestKey;
      setGreetingText("A sessão ativa a voz neural. Enquanto isso, a fala em inglês usa a voz disponível neste navegador.");
      setShowGreeting(true);
      setActiveSpeechText(text);
      setIsPreparingNeuralAudio(true);
      void playPublicSceneDialogue(text, language, gender || "female", requestKey)
        .then((played) => {
          if (played) return;
          if (activeDialogLineRef.current === text) setDlgAudioClock(false);
          if (playLocalDialogFallback(text, language, requestKey, gender)) return;
          setIsPreparingNeuralAudio(false);
          setActiveSpeechText("");
          setDlgFeedback("A voz da cena não está disponível agora. Leia a fala em inglês e tente novamente.");
        })
        .catch(() => {
          if (activeDialogLineRef.current === text) setDlgAudioClock(false);
          if (playLocalDialogFallback(text, language, requestKey, gender)) return;
          setIsPreparingNeuralAudio(false);
          setActiveSpeechText("");
          setDlgFeedback("A voz da cena não está disponível agora. Leia a fala em inglês e tente novamente.");
        });
      return;
    }
    primeVisemeAudio();
    const requestKey = `dialog-recovery:${language}:${gender || selectedScene?.teacherGender || "female"}:${text}`;
    void speak(text, language, undefined, gender, purpose).catch(() => {
      if (activeDialogLineRef.current === text) setDlgAudioClock(false);
      stopTeacherAudio();
      activeSpeechRequestRef.current = requestKey;
      setIsPreparingNeuralAudio(true);
      void playPublicSceneDialogue(text, language, gender || selectedScene?.teacherGender || "female", requestKey)
        .then((played) => {
          if (played || playLocalDialogFallback(text, language, requestKey, gender || selectedScene?.teacherGender)) return;
          setIsPreparingNeuralAudio(false);
          setIsSpeaking(false);
          setActiveSpeechText("");
          setDlgFeedback((feedback) => feedback || "A resposta está visível. A voz não ficou disponível nesta tentativa; use o controle de áudio ou pergunte novamente.");
        })
        .catch(() => {
          if (playLocalDialogFallback(text, language, requestKey, gender || selectedScene?.teacherGender)) return;
          setIsPreparingNeuralAudio(false);
          setIsSpeaking(false);
          setActiveSpeechText("");
          setDlgFeedback((feedback) => feedback || "A resposta está visível. A voz não ficou disponível nesta tentativa; use o controle de áudio ou pergunte novamente.");
        });
    });
  }, [isAuthenticated, isAuthLoading, playLocalDialogFallback, playPublicSceneDialogue, primeVisemeAudio, speak, stopTeacherAudio]);

  const [showGreeting, setShowGreeting] = useState(true);
  const [greetingText, setGreetingText] = useState("");
  const [practiceHotspot, setPracticeHotspot] = useState<Hotspot | null>(null);
  const [particles, setParticles] = useState(false);
  const [score, setScore] = useState(0);
  const [learnedWords, setLearnedWords] = useState<Set<string>>(() => new Set<string>());
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizFeedback, setQuizFeedback] = useState<"correct" | "wrong" | null>(null);
  const sceneXpMut = trpc.gamification.addXP.useMutation();
  const [filter, setFilter] = useState<"all" | ImmersiveCEFRLevel>("all");
  const [search, setSearch] = useState("");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  // Notebook state
  const [notebookOpen, setNotebookOpen] = useState(false);
  const [notebookCount, setNotebookCount] = useState(() => loadNotebook().length);
  // Pareto Panel state
  const [paretoOpen, setParetoOpen] = useState(false);
  const quizHotspots = selectedScene?.hotspots || [];
  const quizQuestion = quizHotspots.length ? quizHotspots[quizIndex % quizHotspots.length] : null;
  const quizOptions = quizQuestion
    ? [quizQuestion.translation, ...quizHotspots
        .filter((hotspot) => hotspot.id !== quizQuestion.id && hotspot.translation !== quizQuestion.translation)
        .map((hotspot) => hotspot.translation)
        .slice(0, 3)]
    : [];
  const handleQuizAnswer = (answer: string) => {
    if (!quizQuestion || quizFeedback) return;
    const correct = answer === quizQuestion.translation;
    setQuizFeedback(correct ? "correct" : "wrong");
    if (correct) {
      setScore((current) => current + 10);
      sceneXpMut.mutate({ xp: 10, type: "exercise" });
    }
    window.setTimeout(() => {
      setQuizFeedback(null);
      setQuizIndex((current) => current + 1);
    }, 900);
  };
  // ── Native language label for dialog panel ──
  const nativeLangLabel = (() => {
    const code = (nativeLang || 'pt-BR').split('-')[0].toLowerCase();
    const labels: Record<string, string> = { pt: 'PT', en: 'EN', es: 'ES', fr: 'FR', de: 'DE', it: 'IT', ja: 'JA', zh: 'ZH', ko: 'KO', ru: 'RU', ar: 'AR' };
    return labels[code] || code.toUpperCase();
  })();
  // ── Dialog Panel (scrolling text + exercises) ──
  const [dlgOpen, setDlgOpen] = useState(false);
  const [dlgStep, setDlgStep] = useState(0);
  const [dlgWords, setDlgWords] = useState<string[]>([]);
  const [dlgWordIdx, setDlgWordIdx] = useState(0);
  const [dlgAudioClock, setDlgAudioClock] = useState(false);
  const [dlgAnswer, setDlgAnswer] = useState<number | null>(null);
  const [dlgWrittenAnswer, setDlgWrittenAnswer] = useState("");
  const [dlgFeedback, setDlgFeedback] = useState("");
  const [dlgTutorHistory, setDlgTutorHistory] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [dlgTutorLoading, setDlgTutorLoading] = useState(false);
  const [dlgNativeTranslation, setDlgNativeTranslation] = useState("");
  const [dlgTranslationLoading, setDlgTranslationLoading] = useState(false);
  const [dlgSuggestedHotspot, setDlgSuggestedHotspot] = useState<Hotspot | null>(null);
  const [dlgIsRecording, setDlgIsRecording] = useState(false);
  const [dlgIsProcessingSpeech, setDlgIsProcessingSpeech] = useState(false);
  const dlgTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const greetingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nativeHelpAudioRef = useRef<HTMLAudioElement | null>(null);
  const dlgRecorderRef = useRef<MediaRecorder | null>(null);
  const dlgRecordingStreamRef = useRef<MediaStream | null>(null);
  const dlgRecordingSessionRef = useRef(0);
  const dlgTutorRequestRef = useRef(0);

  const getDlgTranslation = (line: DialogLine): string =>
    getNativeDialogueTranslation(line, nativeLang, dlgNativeTranslation);

  useEffect(() => {
    const line = selectedScene?.dialog[dlgStep];
    if (!line || isPortugueseLocale(nativeLang)) {
      setDlgNativeTranslation("");
      setDlgTranslationLoading(false);
      return;
    }

    let active = true;
    setDlgNativeTranslation("");
    setDlgTranslationLoading(true);
    void dialogTranslateMut.mutateAsync({
      text: line.text,
      sourceLanguage: selectedScene.teacherLang,
      targetLanguage: nativeLang || "pt-BR",
    }).then((result) => {
      if (active) setDlgNativeTranslation(result.translation);
    }).catch(() => {
      if (active) setDlgNativeTranslation("");
    }).finally(() => {
      if (active) setDlgTranslationLoading(false);
    });
    return () => { active = false; };
  }, [dlgStep, nativeLang, selectedScene?.id]);

  const speakNativeHelp = useCallback(async (text: string) => {
    const helpText = text.trim();
    if (!helpText) return;
    nativeHelpAudioRef.current?.pause();
    nativeHelpAudioRef.current = null;
    const nativeSpeech = getNativeHelpSpeechRequest(helpText, nativeLang);
    const helpGender = selectedScene?.teacherGender === "male" ? "MALE" : "FEMALE";
    const playHelpAudio = async (source: string, revokeOnEnd = false) => {
      const audio = new Audio(source);
      audio.playbackRate = dialogSpeechRate;
      nativeHelpAudioRef.current = audio;
      const clear = () => {
        if (nativeHelpAudioRef.current === audio) nativeHelpAudioRef.current = null;
        if (revokeOnEnd) URL.revokeObjectURL(source);
      };
      audio.onended = clear;
      audio.onerror = clear;
      await audio.play();
    };
    try {
      const neural = await googleTtsMut.mutateAsync({ text: nativeSpeech.text.slice(0, 500), languageCode: nativeSpeech.language, gender: helpGender });
      if (neural.audioUrl) {
        await playHelpAudio(neural.audioUrl);
        return;
      }
    } catch { /* Use the other neural provider below. */ }
    try {
      const neural = await ttsMut.mutateAsync({ text: nativeSpeech.text.slice(0, 500), voiceLang: nativeSpeech.language, gender: "female" });
      if (neural.success && neural.audioBase64) {
        const bytes = Uint8Array.from(atob(neural.audioBase64), (char) => char.charCodeAt(0));
        await playHelpAudio(URL.createObjectURL(new Blob([bytes], { type: "audio/mp3" })), true);
        return;
      }
    } catch { /* Do not use browser speech for native guidance either. */ }
    setDlgFeedback("A ajuda por voz neural não está disponível agora. Leia a explicação abaixo e tente novamente.");
  }, [dialogSpeechRate, googleTtsMut, nativeLang, ttsMut]);

  // Scene selection is the sole boundary for a teaching session. Reset every
  // coupled visual/audio state together so no prior scene can bleed into it.
  useEffect(() => {
    if (!selectedScene) return;
    stopTeacherAudio();
    setDlgOpen(false);
    setDlgStep(0);
    setDlgWords([]);
    setDlgWordIdx(0);
    setDlgAudioClock(false);
    activeDialogLineRef.current = null;
    activeDialogWordCountRef.current = 0;
    setDlgAnswer(null);
    setDlgWrittenAnswer("");
    setDlgFeedback("");
    setDlgTutorHistory([]);
    setDlgTutorLoading(false);
    setDlgSuggestedHotspot(null);
    setDlgIsRecording(false);
    setDlgIsProcessingSpeech(false);
    dlgRecordingSessionRef.current += 1;
    setActiveHotspot(null);
    setActiveJamesClipId(null);
    setActiveSophieClipId(null);
    setLearnedWords(new Set());
    setQuizIndex(0);
    setQuizFeedback(null);
    setGreetingText(selectedScene.greetingPt);
    setShowGreeting(true);
    if (selectedScene.id === "beach" && selectedScene.teacherName === "James") {
      setActiveJamesClipId("james-tropical-greeting");
    }
    if (selectedScene.id === "cafe" && selectedScene.teacherName === "Sophie") {
      setActiveSophieClipId("sophie-cafe-greeting");
    }
    if (greetingTimerRef.current) clearTimeout(greetingTimerRef.current);
    greetingTimerRef.current = setTimeout(() => setShowGreeting(false), 6000);
    return () => {
      if (greetingTimerRef.current) clearTimeout(greetingTimerRef.current);
      nativeHelpAudioRef.current?.pause();
      nativeHelpAudioRef.current = null;
      dlgRecordingSessionRef.current += 1;
      if (dlgRecorderRef.current?.state === "recording") dlgRecorderRef.current.stop();
      dlgRecordingStreamRef.current?.getTracks().forEach((track) => track.stop());
      dlgRecordingStreamRef.current = null;
    };
  }, [selectedScene?.id, stopTeacherAudio]);

  const startDialog = useCallback((scene: Scene) => {
    const dialogueScene = teachingScene ?? scene;
    const materialLessonKey = `scene:${scene.id}`;
    if (isAuthenticated && isInitialCommercialTargetLanguage(targetLang)) {
      void authorizeLessonMut.mutateAsync({ lessonKey: materialLessonKey })
        .then((access) => setAuthorizedSceneMaterial(access.allowed ? {
          lessonKey: materialLessonKey,
          sceneId: scene.id,
          targetLanguage: targetLang,
          nativeLanguage: nativeLang,
        } : null))
        .catch(() => setAuthorizedSceneMaterial(null));
    }
    primeDialogAudioFromGesture();
    setDialogAuthRequired(false);
    setDlgOpen(true); setDlgStep(0); setDlgAnswer(null); setDlgWrittenAnswer(""); setDlgFeedback(""); setDlgSuggestedHotspot(null); setDlgTutorHistory([]); setDlgTutorLoading(false);
    if (dialogueScene.id === "beach" && dialogueScene.teacherName === "James") playJamesTropicalClip("james-tropical-greeting");
    if (dialogueScene.id === "cafe" && dialogueScene.teacherName === "Sophie") playSophieCafeClip("sophie-cafe-greeting");
    const line = scene.dialog[0];
    if (shouldStartSceneTeacherAudio(line)) {
      const words = line.text.split(' ');
      setDlgWords(words); setDlgWordIdx(0);
      activeDialogLineRef.current = line.text;
      activeDialogWordCountRef.current = words.length;
      setDlgAudioClock(true);
      // This runs directly from the Iniciar Diálogo click. Guests use the public
      // scene voice; authenticated students keep the protected neural path.
      const teacherSpeech = getImmersiveDialogTeacherSpeech(line.text, dialogueScene);
      requestSpeechSafely(teacherSpeech.text, teacherSpeech.language, teacherSpeech.gender, teacherSpeech.purpose);
    } else {
      activeDialogLineRef.current = null;
      activeDialogWordCountRef.current = 0;
      setDlgAudioClock(false);
      setDlgWords([]); setDlgWordIdx(0);
    }
  }, [authorizeLessonMut, isAuthenticated, playJamesTropicalClip, playSophieCafeClip, primeDialogAudioFromGesture, requestSpeechSafely, targetLang, teachingScene]);
  useEffect(() => {
    if (isSpeaking && activeDialogLineRef.current && !dlgOpen) {
      setDlgOpen(true);
    }
  }, [dlgOpen, isSpeaking]);
  useEffect(() => {
    if (!dlgOpen || dlgAudioClock || dlgWords.length === 0 || dlgWordIdx >= dlgWords.length) return;
    dlgTimerRef.current = setTimeout(() => setDlgWordIdx(i => i + 1), Math.round(300 / dialogSpeechRate));
    return () => { if (dlgTimerRef.current) clearTimeout(dlgTimerRef.current); };
  }, [dialogSpeechRate, dlgAudioClock, dlgOpen, dlgWords, dlgWordIdx]);
  const dlgNext = useCallback(() => {
    if (!selectedScene) return;
    const dialogueScene = teachingScene ?? selectedScene;
    const next = dlgStep + 1;
    if (next >= selectedScene.dialog.length) {
      activeDialogLineRef.current = null;
      activeDialogWordCountRef.current = 0;
      setDlgAudioClock(false);
      setDlgOpen(false);
      return;
    }
    setDlgStep(next); setDlgAnswer(null); setDlgWrittenAnswer(""); setDlgFeedback(""); setDlgSuggestedHotspot(null); setDlgIsRecording(false); setDlgIsProcessingSpeech(false); setDlgTutorLoading(false);
    const line = selectedScene.dialog[next];
    if (shouldStartSceneTeacherAudio(line)) {
      const words = line.text.split(' ');
      setDlgWords(words); setDlgWordIdx(0);
      activeDialogLineRef.current = line.text;
      activeDialogWordCountRef.current = words.length;
      setDlgAudioClock(true);
      const teacherSpeech = getImmersiveDialogTeacherSpeech(line.text, dialogueScene);
      requestSpeechSafely(teacherSpeech.text, teacherSpeech.language, teacherSpeech.gender, teacherSpeech.purpose);
    } else {
      activeDialogLineRef.current = null;
      activeDialogWordCountRef.current = 0;
      setDlgAudioClock(false);
      setDlgWords([]); setDlgWordIdx(0);
    }
  }, [dlgStep, isAuthenticated, requestSpeechSafely, selectedScene, teachingScene]);

  const askImmersiveTutor = useCallback(async (answer: string) => {
    const scene = teachingScene ?? selectedScene;
    const question = answer.trim();
    if (!scene || !question) return;
    const requestId = ++dlgTutorRequestRef.current;
    primeDialogAudioFromGesture();
    setDlgTutorLoading(true);
    const fallback = getFreeDialogQuestionReply(question, scene.hotspots);
    const immediateReply = fallback?.immediate
      ? fallback.text.replace(/^[^:]+:\s*/, "")
      : `${scene.teacherName}: I heard you. I will help you practise this lesson step by step.`;
    const immediateFeedback = `${scene.teacherName}: ${immediateReply.replace(/^[^:]+:\s*/, "")}${fallback?.immediate && fallback.nativeText ? `\n${nativeLangLabel}: ${fallback.nativeText}` : ""}`;
    setDlgFeedback(immediateFeedback);
    setDlgTutorHistory((history) => [...history, { role: "user" as const, content: question }, { role: "assistant" as const, content: immediateReply.replace(/^[^:]+:\s*/, "") }].slice(-8));
    requestSpeechSafely(immediateReply.replace(/^[^:]+:\s*/, ""), scene.teacherLang, scene.teacherGender, "teacher");
    const loadingTimeout = window.setTimeout(() => {
      if (requestId === dlgTutorRequestRef.current) {
        setDlgTutorLoading(false);
        setDlgFeedback((current) => current || immediateFeedback);
      }
    }, 10_000);
    try {
      const result = await immersiveSceneTutorMut.mutateAsync({
        teacherName: scene.teacherName,
        targetLanguage: currentLangInfo.name,
        targetLocale: scene.teacherLang,
        nativeLanguage: nativeLang || "pt-BR",
        sceneTitle: scene.nameEn,
        sceneDescription: scene.teacherGreeting,
        locationDisclosure: getSceneLocationDisclosure(scene),
        vocabulary: scene.hotspots.map((hotspot) => ({ label: hotspot.label, translation: hotspot.translation, example: hotspot.example })),
        studentMessage: question,
        history: dlgTutorHistory.slice(-6),
      });
      if (requestId !== dlgTutorRequestRef.current) return;
      const targetReply = result.targetReply.trim() || fallback?.text.replace(/^[^:]+:\s*/, "") || "I can help you practise this lesson. What would you like to learn?";
      const feedbackPrefix = `${scene.teacherName}: ${targetReply}`;
      setDlgFeedback(feedbackPrefix);
      setDlgTutorHistory((history) => [...history, { role: "assistant" as const, content: targetReply }].slice(-8));
      const relatedHotspot = fallback?.hotspotId
        ? scene.hotspots.find((hotspot) => hotspot.id === fallback.hotspotId) || null
        : null;
      setDlgSuggestedHotspot(relatedHotspot);
      requestSpeechSafely(targetReply, scene.teacherLang, scene.teacherGender, "teacher");
      void dialogTranslateMut.mutateAsync({ text: targetReply, sourceLanguage: scene.teacherLang, targetLanguage: nativeLang || "pt-BR" })
        .then((translation) => {
          if (requestId === dlgTutorRequestRef.current && translation.translation) {
            setDlgFeedback(`${feedbackPrefix}\n${nativeLangLabel}: ${translation.translation}`);
          }
        })
        .catch(() => undefined);
    } catch {
      if (requestId !== dlgTutorRequestRef.current) return;
      const targetReply = fallback?.text.replace(/^[^:]+:\s*/, "") || "I can help you practise vocabulary, grammar, and new sentences from this lesson.";
      setDlgFeedback(`${scene.teacherName}: ${targetReply}`);
      requestSpeechSafely(targetReply, scene.teacherLang, scene.teacherGender, "teacher");
    } finally {
      window.clearTimeout(loadingTimeout);
      if (requestId === dlgTutorRequestRef.current) setDlgTutorLoading(false);
    }
  }, [currentLangInfo.name, dialogTranslateMut, dlgTutorHistory, dlgTutorLoading, immersiveSceneTutorMut, nativeLang, nativeLangLabel, primeDialogAudioFromGesture, requestSpeechSafely, selectedScene, teachingScene]);

  const validateDialogAnswer = useCallback((answer: string) => {
    const scene = teachingScene ?? selectedScene;
    if (!scene) return;
    const line = scene.dialog[dlgStep];
    if (!line) return;
    const provided = answer.trim();
    if (!provided) {
      setDlgFeedback("Diga ou escreva sua resposta no idioma estudado antes de conferir.");
      return;
    }
    if (!line.options || line.correctIndex === undefined) {
      void askImmersiveTutor(provided);
      return;
    }
    const expected = line.options[line.correctIndex].trim();
    const correct = matchesImmersiveDialogAnswer(expected, provided);
    if (!correct) {
      if (scene.teacherName === "James") playJamesTropicalClip("james-tropical-retry");
      if (scene.teacherName === "Sophie") playSophieCafeClip("sophie-cafe-retry");
      void askImmersiveTutor(provided);
      return;
    }
    setDlgFeedback("Muito bem. Sua resposta em inglês está correta.");
    setDlgAnswer(line.correctIndex);
    const praiseClip = scene.teacherName === "James"
      ? playJamesTropicalClip("james-tropical-praise")
      : scene.teacherName === "Sophie"
        ? playSophieCafeClip("sophie-cafe-praise")
        : null;
    if (isAuthenticated) {
      const teacherSpeech = getImmersiveDialogTeacherSpeech(praiseClip?.dialogue || `Excellent. ${line.options[line.correctIndex]}`, scene);
      requestSpeechSafely(teacherSpeech.text, teacherSpeech.language, teacherSpeech.gender, teacherSpeech.purpose);
    }
    const referencedHotspotId = findReferencedHotspotId(line.options[line.correctIndex], scene.hotspots);
    const referencedHotspot = referencedHotspotId
      ? scene.hotspots.find((hotspot) => hotspot.id === referencedHotspotId) || null
      : null;
    setDlgSuggestedHotspot(referencedHotspot);
    if (referencedHotspot) {
      setDlgFeedback(`Muito bem. Antes de continuar, pratique “${referencedHotspot.label}” com o ciclo Pareto ou siga para a próxima fala.`);
      return;
    }
    window.setTimeout(() => dlgNext(), 1400);
  }, [askImmersiveTutor, dlgStep, dlgNext, isAuthenticated, playJamesTropicalClip, playSophieCafeClip, requestSpeechSafely, selectedScene, teachingScene]);

  const submitWrittenDialogAnswer = useCallback(() => {
    const question = dlgWrittenAnswer.trim();
    if (!question) return;
    setDlgWrittenAnswer("");
    validateDialogAnswer(question);
  }, [dlgWrittenAnswer, validateDialogAnswer]);

  const stopDialogRecording = useCallback(() => {
    if (dlgRecorderRef.current?.state === "recording") {
      dlgRecorderRef.current.stop();
      setDlgIsRecording(false);
    }
  }, []);

  const startDialogRecording = useCallback(async () => {
    const scene = selectedScene;
    if (!scene || dlgAnswer !== null || dlgIsProcessingSpeech) return;
    if (!window.confirm("Ativar microfone para responder nesta cena? O áudio será usado apenas para transcrever sua resposta e será encerrado ao concluir.")) return;

    try {
      const stream = await requestMicrophoneStream();
      const recorder = createAudioRecorder(stream);
      const chunks: Blob[] = [];
      const recordingSession = ++dlgRecordingSessionRef.current;
      dlgRecorderRef.current = recorder;
      dlgRecordingStreamRef.current = stream;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        if (dlgRecordingStreamRef.current === stream) dlgRecordingStreamRef.current = null;
        if (dlgRecorderRef.current === recorder) dlgRecorderRef.current = null;
        if (recordingSession !== dlgRecordingSessionRef.current) return;
        setDlgIsRecording(false);
        if (!chunks.length) {
          setDlgFeedback("Nenhum áudio foi capturado. Tente novamente e fale após iniciar a gravação.");
          return;
        }
        setDlgIsProcessingSpeech(true);
        try {
          const transcription = await dialogTranscribeMut.mutateAsync({
            audioData: await audioBlobToDataUrl(new Blob(chunks, { type: recorder.mimeType || "audio/webm" })),
            language: scene.teacherLang.split("-")[0],
          });
          if (recordingSession !== dlgRecordingSessionRef.current) return;
          const spokenText = transcription.text.trim();
          setDlgWrittenAnswer(spokenText);
          if (!spokenText) {
            setDlgFeedback("Não foi possível reconhecer uma resposta. Tente falar de forma mais clara ou escreva sua resposta.");
            return;
          }
          validateDialogAnswer(spokenText);
        } catch (error) {
          setDlgFeedback(`Não foi possível transcrever sua resposta. ${microphoneErrorMessage(error)}`);
        } finally {
          setDlgIsProcessingSpeech(false);
        }
      };
      recorder.start();
      setDlgFeedback("Gravando sua resposta. Toque em Parar quando terminar.");
      setDlgIsRecording(true);
    } catch (error) {
      setDlgFeedback(microphoneErrorMessage(error));
    }
  }, [dialogTranscribeMut, dlgAnswer, dlgIsProcessingSpeech, selectedScene, validateDialogAnswer]);
  const handleAddParetoToNotebook = useCallback((word: ParetoWord) => {
    addToNotebook({
      word: word.enUS,
      translation: word.ptBR,
      pronunciation: word.pronunciation,
      example: word.example,
      examplePt: word.examplePt,
      langCode: effectiveLang(selectedScene || { teacherLang: "en-US" }),
      scene: selectedScene?.name || "Vocabulário Pareto",
    });
    setNotebookCount(loadNotebook().length);
  }, [selectedScene]);



  const handleEnterScene = useCallback((scene: Scene) => {
    setSelectedScene(scene);
    setParticles(false);
  }, []);

  const handleHotspotClick = useCallback((hotspot: Hotspot) => {
    if (!selectedScene) return;
    const activeTeacherScene = teachingScene ?? selectedScene;
    setActiveHotspot(hotspot);
    setParticles(true);
    setTimeout(() => setParticles(false), 1000);
    if (!learnedWords.has(hotspot.id)) {
      setLearnedWords(prev => { const next = new Set(Array.from(prev)); next.add(hotspot.id); return next; });
      setScore(prev => prev + 10);
    }
    // Auto-save to notebook
    addToNotebook({
      word: hotspot.label,
      translation: hotspot.translation,
      pronunciation: hotspot.pronunciation,
      example: hotspot.example,
      examplePt: hotspot.examplePt,
      langCode: effectiveLang(selectedScene),
      scene: selectedScene.name,
    });
    setNotebookCount(loadNotebook().length);
    const interaction = createImmersiveHotspotInteraction(hotspot, activeTeacherScene);
    setGreetingText(interaction.greeting);
    setShowGreeting(true);
    // A fala do objeto sempre usa o idioma da cena; tradução fica só como apoio visual.
    const objectFocusClip = activeTeacherScene.teacherName === "James" && hotspot.id === "palm"
      ? playJamesTropicalClip("james-tropical-point-palm")
      : activeTeacherScene.teacherName === "Sophie" && hotspot.id === "croissant"
        ? playSophieCafeClip("sophie-cafe-point-croissant")
        : null;
    if (objectFocusClip) {
      requestSpeechSafely(objectFocusClip.dialogue, interaction.speech.language, interaction.speech.gender, interaction.speech.purpose);
    } else {
      requestSpeechSafely(interaction.speech.text, interaction.speech.language, interaction.speech.gender, interaction.speech.purpose);
    }
    setTimeout(() => setShowGreeting(false), 5000);
  }, [selectedScene, teachingScene, learnedWords, nativeLang, playJamesTropicalClip, playSophieCafeClip, requestSpeechSafely]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width - 0.5,
      y: (e.clientY - rect.top) / rect.height - 0.5,
    });
  }, []);

  const filteredScenes = IMMERSIVE_SCENES.filter(s => {
    if (filter !== "all" && sceneCefrLevel(s) !== filter) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) &&
        !s.nameEn.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    // Sort: scenes matching the user's target language come first
    const base = (targetLang || "").split("-")[0].toLowerCase();
    const aMatch = base && (a.langCode === base || a.teacherLang.startsWith(base)) ? 0 : 1;
    const bMatch = base && (b.langCode === base || b.teacherLang.startsWith(base)) ? 0 : 1;
    return aMatch - bMatch;
  });

  const cefrColor = (level: ImmersiveCEFRLevel) =>
    level === "A1" || level === "A2" ? "#22c55e" : level === "B1" || level === "B2" ? "#f59e0b" : "#ef4444";
  const cefrLabel = (level: ImmersiveCEFRLevel) => IMMERSIVE_CEFR_LEVELS.find((item) => item.value === level)?.label || level;

  if (isAuthLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-center text-slate-100">
        <p className="text-sm font-semibold">Preparando seu espaço de aprendizagem…</p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#1e3a8a,_#0f172a_58%,_#020617)] px-6 text-center text-slate-100">
        <section className="max-w-md rounded-3xl border border-cyan-200/20 bg-slate-950/75 p-8 shadow-2xl backdrop-blur">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">MultiLingue Universal</p>
          <h1 className="mt-3 text-2xl font-black">Sua jornada de aprendizagem está protegida</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">Entre para acessar as cenas, professores, materiais de estudo e o seu progresso pessoal.</p>
          <button
            type="button"
            onClick={() => { window.location.href = getLoginUrl(); }}
            className="mt-6 rounded-xl bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-200"
          >
            Entrar para aprender
          </button>
          <button
            type="button"
            onClick={() => setLocation("/")}
            className="mt-3 block w-full text-sm font-semibold text-slate-300 hover:text-white"
          >
            Voltar ao início
          </button>
        </section>
      </main>
    );
  }

  // ── Scene View ──
  if (selectedScene) {
    return (
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden select-none"
        style={{ height: "100dvh", background: "#000" }}
        onMouseMove={handleMouseMove}
        onClick={() => { if (activeHotspot) setActiveHotspot(null); }}
      >
        {/* CSS Animations */}
        <style>{`
          /* ── Professor breathing (idle) ── */
          @keyframes teacher-breathe {
            0%,100% { transform: scaleY(1) translateY(0); }
            50% { transform: scaleY(1.018) translateY(-4px); }
          }
          /* ── Natural head sway (gentle side-to-side) ── */
          @keyframes head-sway {
            0%,100% { transform: rotate(0deg) translateY(0); }
            25% { transform: rotate(-1.5deg) translateY(-2px); }
            50% { transform: rotate(0deg) translateY(-3px); }
            75% { transform: rotate(1.5deg) translateY(-2px); }
          }
          /* ── Eye blink (natural every 3-5 seconds) ── */
          @keyframes eye-blink {
            0%, 92%, 100% { transform: translateX(-50%) scaleY(1); opacity: 0; }
            94%, 96% { transform: translateX(-50%) scaleY(0.1); opacity: 0.8; background: rgba(0,0,0,0.15); }
            98% { transform: translateX(-50%) scaleY(1); opacity: 0; }
          }
          @keyframes brow-focus {
            0%,100% { transform: translateY(0) rotate(0deg); opacity: .46; }
            50% { transform: translateY(-2px) rotate(-2deg); opacity: .78; }
          }
          @keyframes cheek-warmth {
            0%,100% { opacity: .25; transform: scale(.94); }
            50% { opacity: .72; transform: scale(1.04); }
          }
          /* ── Mouth talk (lip-sync simulation) ── */
          @keyframes mouth-talk {
            0% { transform: translateX(-50%) scaleY(0.3); width: 8%; }
            20% { transform: translateX(-50%) scaleY(1); width: 14%; }
            40% { transform: translateX(-50%) scaleY(0.5); width: 10%; }
            60% { transform: translateX(-50%) scaleY(0.8); width: 12%; }
            80% { transform: translateX(-50%) scaleY(0.4); width: 9%; }
            100% { transform: translateX(-50%) scaleY(0.6); width: 11%; }
          }
          /* ── Hand gesture (teacher explaining) ── */
          @keyframes hand-gesture {
            0%, 100% { transform: translateX(0) rotate(0deg); opacity: 0; }
            10% { opacity: 0.6; }
            30% { transform: translateX(8px) rotate(5deg); opacity: 0.8; }
            50% { transform: translateX(-5px) rotate(-3deg); opacity: 0.6; }
            70% { transform: translateX(6px) rotate(4deg); opacity: 0.7; }
            90% { opacity: 0.3; }
          }
          /* ── Natural transition between idle and speaking ── */
          @keyframes natural-transition {
            0% { transform: scale(1) translateY(0); }
            50% { transform: scale(1.01) translateY(-2px); }
            100% { transform: scale(1) translateY(0); }
          }
          /* ── Professor talking (lip-sync simulation) ── */
          @keyframes teacher-talk {
            0%   { transform: translateY(0)    scaleY(1); }
            25%  { transform: translateY(-1px) scaleY(1.005); }
            50%  { transform: translateY(-2px) scaleY(1.01); }
            75%  { transform: translateY(-1px) scaleY(1.005); }
            100% { transform: translateY(0)    scaleY(1); }
          }
          /* ── Lip-sync overlay (mouth movement) ── */
          @keyframes lip-sync {
            0%,100% { transform: scaleY(1) scaleX(1); }
            10%     { transform: scaleY(1.4) scaleX(0.95); }
            20%     { transform: scaleY(0.8) scaleX(1.05); }
            35%     { transform: scaleY(1.5) scaleX(0.92); }
            50%     { transform: scaleY(0.7) scaleX(1.08); }
            65%     { transform: scaleY(1.3) scaleX(0.96); }
            80%     { transform: scaleY(0.9) scaleX(1.03); }
          }
          /* ── Head nod (natural movement) ── */
          @keyframes head-nod {
            0%,100% { transform: rotate(0deg) translateY(0); }
            20%     { transform: rotate(-2deg) translateY(-2px); }
            40%     { transform: rotate(1.5deg) translateY(1px); }
            60%     { transform: rotate(-1deg) translateY(-1px); }
            80%     { transform: rotate(2deg) translateY(0); }
          }
          /* ── Professor wave ── */
          @keyframes professor-wave {
            0%, 100% { transform: rotate(0deg); transform-origin: 80% 20%; }
            20%  { transform: rotate(18deg); transform-origin: 80% 20%; }
            40%  { transform: rotate(-12deg); transform-origin: 80% 20%; }
            60%  { transform: rotate(15deg); transform-origin: 80% 20%; }
            80%  { transform: rotate(-8deg); transform-origin: 80% 20%; }
          }
          /* ── Professor nod ── */
          @keyframes professor-nod {
            0%, 100% { transform: rotateX(0deg) translateY(0); transform-origin: center top; }
            25%  { transform: rotateX(-10deg) translateY(-3px); }
            75%  { transform: rotateX(8deg) translateY(2px); }
          }
          /* ── Professor celebrate (bounce) ── */
          @keyframes professor-celebrate {
            0%, 100% { transform: scale(1) translateY(0); }
            30%  { transform: scale(1.06) translateY(-10px); }
            60%  { transform: scale(0.98) translateY(3px); }
            80%  { transform: scale(1.03) translateY(-5px); }
          }
          /* ── Hotspot float: defined in index.css as .hs-float / .hs-float-N ── */
          /* ── Teacher speaking ring ── */
          @keyframes teacher-ring {
            0%   { transform: scale(1); opacity: 0.9; }
            100% { transform: scale(2.5); opacity: 0; }
          }
          /* ── Sound bars (speaking indicator) ── */
          @keyframes sound-bar {
            0%   { transform: scaleY(0.3); }
            50%  { transform: scaleY(1); }
            100% { transform: scaleY(0.3); }
          }
          /* ── Particle fly (word learned) ── */
          @keyframes particle-fly {
            0%   { transform: translate(0,0) scale(1) rotate(0deg); opacity: 1; }
            100% { transform: translate(${Math.random() > 0.5 ? "" : "-"}${40 + Math.random() * 60}px, -${60 + Math.random() * 80}px) scale(0) rotate(180deg); opacity: 0; }
          }
          /* ── Label pop in ── */
          @keyframes label-pop {
            0%   { transform: scale(0.6) translateY(8px); opacity: 0; }
            70%  { transform: scale(1.05) translateY(-2px); opacity: 1; }
            100% { transform: scale(1) translateY(0); opacity: 1; }
          }
          /* ── Vocab card slide in ── */
          @keyframes vocab-slide-in {
            0%   { transform: scale(0.82) translateY(14px); opacity: 0; }
            70%  { transform: scale(1.02) translateY(-2px); opacity: 1; }
            100% { transform: scale(1) translateY(0); opacity: 1; }
          }
          /* ── Greeting text scroll ── */
          @keyframes greeting-scroll {
            0%   { transform: translateY(20px); opacity: 0; }
            15%  { transform: translateY(0); opacity: 1; }
            75%  { transform: translateY(0); opacity: 1; }
            100% { transform: translateY(-20px); opacity: 0; }
          }
          /* ── Scene card hover lift ── */
          @keyframes card-lift {
            0%   { transform: translateY(0) scale(1); }
            100% { transform: translateY(-6px) scale(1.02); }
          }
          /* ── Correct answer flash ── */
          @keyframes correct-flash {
            0%,100% { background: rgba(34,197,94,0.0); }
            30%     { background: rgba(34,197,94,0.35); }
            60%     { background: rgba(34,197,94,0.15); }
          }
          /* ── Wrong answer shake ── */
          @keyframes wrong-shake {
            0%,100% { transform: translateX(0); }
            20%     { transform: translateX(-8px); }
            40%     { transform: translateX(8px); }
            60%     { transform: translateX(-5px); }
            80%     { transform: translateX(5px); }
          }
          /* ── Floating score +1 ── */
          @keyframes score-float {
            0%   { transform: translateY(0) scale(1); opacity: 1; }
            100% { transform: translateY(-50px) scale(1.4); opacity: 0; }
          }
          /* ── Hotspot discovered glow ── */
          @keyframes discovered-glow {
            0%,100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
            50%     { box-shadow: 0 0 20px 8px rgba(34,197,94,0.6); }
          }
          /* ── Smooth button press ── */
          .btn-press:active { transform: scale(0.95); transition: transform 0.12s cubic-bezier(0.23,1,0.32,1); }
          .btn-press { transition: transform 0.16s cubic-bezier(0.23,1,0.32,1), opacity 0.16s; }
          .btn-press:hover { opacity: 0.9; }
          /* ── Scene card hover ── */
          .scene-card { transition: transform 0.22s cubic-bezier(0.23,1,0.32,1), box-shadow 0.22s; }
          .scene-card:hover { transform: translateY(-6px) scale(1.02); box-shadow: 0 16px 40px rgba(0,0,0,0.5); }
          /* ── Hotspot hover ── */
          .hotspot-btn { transition: transform 0.15s cubic-bezier(0.23,1,0.32,1); }
          .hotspot-btn:hover { transform: translate(-50%,-50%) scale(1.15); }
          /* ── Compact mobile scene controls: preserve hotspots and a safe lower dialogue area. ── */
          @media (max-width: 640px) {
            .immersive-hud {
              padding: 8px !important;
              gap: 6px;
              align-items: flex-start !important;
            }
            .immersive-hud-title { display: none !important; }
            .immersive-hud-actions {
              gap: 4px !important;
              max-width: calc(100vw - 92px);
              overflow-x: auto;
              scrollbar-width: none;
            }
            .immersive-hud-actions::-webkit-scrollbar { display: none; }
            .immersive-hud-actions > :nth-child(n+5) { display: none !important; }
            .immersive-teacher {
              right: 8px !important;
              width: 112px !important;
            }
            .immersive-start-dialog { bottom: 52px !important; }
            .immersive-dialog {
              bottom: 52px !important;
              padding-right: 116px !important;
              padding-left: 8px !important;
            }
          }
          /* ── Fade in ── */
          @keyframes fade-in {
            from { opacity: 0; } to { opacity: 1; }
          }
          @media (prefers-reduced-motion: reduce) {
            * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
          }
        `}</style>

        {/* Background with parallax — img tag so hotspot % coords align correctly on mobile */}
        {/* OLD (background-image approach — hotspots misaligned on mobile because cover crops differently):
        <div style={{ position:"absolute", inset:"-3%", backgroundImage:`url(${selectedScene.bgImage})`,
          backgroundSize:"cover", backgroundPosition:"center",
          transform:`translate(${mousePos.x*18}px,${mousePos.y*12}px)`,
          transition:"transform 0.15s ease-out", filter:"brightness(1.05) saturate(1.1)" }} />
        */}
        {/* Background image — inset:0 so hotspot % coords align perfectly on mobile */}
        <img
          src={selectedScene.bgImage}
          alt=""
          draggable={false}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            filter: "brightness(1.05) saturate(1.1)",
            userSelect: "none",
            pointerEvents: "none",
          }}
        />

        {/* Subtle vignette only at edges */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.35) 100%)",
            pointerEvents: "none",
          }}
        />

        {/* Top HUD */}
        <div
          className="immersive-hud absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 z-40"
          style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)" }}
        >
          <button
            onClick={() => { stopEdgeTTS(); setLocation("/"); }}
            className="flex items-center gap-2 text-white font-semibold px-3 py-1.5 rounded-full"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)" }}
          >
            ← Voltar
          </button>
          <div className="immersive-hud-title flex items-center gap-2 text-white font-bold" style={{ fontSize: "clamp(13px, 1.8vw, 18px)" }}>
            <span>{selectedScene.flag}</span>
            <span>{immersionMode ? selectedScene.nameEn : selectedScene.name}</span>
          </div>
          <div className="immersive-hud-actions flex items-center gap-2">
            {/* Idioma nativo: fica oculto durante a imersão total */}
            {!immersionMode && <div
              style={{ background: "#ffffff", color: "#1d4ed8", border: "1.5px solid #93c5fd", borderRadius: "9999px", padding: "4px 10px", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}
              title={`Idioma nativo: ${nativeLang}`}
            >
              <span>{nativeLangInfo.flag}</span>
              <span style={{ textTransform: "uppercase", letterSpacing: 1 }}>{nativeLang.split("-")[0].toUpperCase()}</span>
            </div>}
            {/* Language picker button */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowLangPicker(v => !v)}
                className="flex items-center gap-1 text-white font-semibold px-3 py-1.5 rounded-full text-xs"
                style={{ background: "rgba(99,102,241,0.35)", backdropFilter: "blur(8px)", border: "1px solid rgba(99,102,241,0.6)" }}
                title="Mudar idioma a estudar"
              >
                {currentLangInfo.flag} {currentLangInfo.name}
              </button>
              {showLangPicker && (
                <div
                  style={{
                    position: "absolute", top: "110%", right: 0, zIndex: 100,
                    background: "rgba(15,12,41,0.97)", backdropFilter: "blur(16px)",
                    border: "1px solid rgba(99,102,241,0.5)", borderRadius: 12,
                    padding: 8, minWidth: 180, maxHeight: 280, overflowY: "auto",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.6)"
                  }}
                  onClick={e => e.stopPropagation()}
                >
                  <div style={{ fontSize: 11, color: "#a78bfa", fontWeight: 700, padding: "4px 8px 8px", textTransform: "uppercase", letterSpacing: 1 }}>{immersionMode ? "Target language" : "Estudar idioma"}</div>
                  {Object.entries(LANG_LABELS).map(([code, info]) => (
                    <button
                      key={code}
                      onClick={() => handleSelectTargetLang(code)}
                      style={{
                        display: "flex", alignItems: "center", gap: 8,
                        width: "100%", padding: "6px 10px", borderRadius: 8,
                        background: targetLang === code ? "rgba(99,102,241,0.6)" : "transparent",
                        color: targetLang === code ? "#ffffff" : "rgba(255,255,255,0.75)",
                        fontSize: 13, fontWeight: targetLang === code ? 700 : 400,
                        border: targetLang === code ? "1px solid rgba(167,139,250,0.8)" : "1px solid transparent",
                        cursor: "pointer", textAlign: "left"
                      }}
                    >
                      <span>{info.flag}</span>
                      <span>{info.name}</span>
                      <span style={{ color: "#6b7280", fontSize: 11, marginLeft: "auto" }}>{code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {targetLanguageBlockIsPlanned && !immersionMode && (
              <span
                className="rounded-full border border-sky-300/40 bg-sky-400/15 px-2 py-1 text-[10px] font-bold text-sky-100"
                title="Este idioma será liberado em um bloco próprio, após a localização e a validação pedagógica."
              >
                Bloco em preparação
              </span>
            )}
            {sceneTeacherResolution.materialIsInTargetLanguage && compatibleSceneTeachers.length > 0 && !immersionMode && (
              <label className="hidden items-center gap-1 rounded-full border border-white/20 bg-slate-950/55 px-2 py-1 text-xs text-white lg:flex" title="Professor compatível com o idioma estudado">
                <span className="sr-only">Professor da cena</span>
                <select
                  value={selectedSceneTeacherId || activeSceneTeacher?.id || ""}
                  onChange={(event) => setSelectedSceneTeacherId(event.target.value || null)}
                  className="max-w-32 bg-transparent text-xs font-semibold text-white outline-none"
                  aria-label="Professor da cena"
                >
                  {compatibleSceneTeachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id} className="bg-slate-950 text-white">
                      {teacher.flag} {teacher.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <ImmersionModeToggle compact />
            {!immersionMode && <>
              <VoiceSelector
                langCode={targetLang || effectiveLang(selectedScene)}
                langName={currentLangInfo.name || selectedScene.name}
                compact
              />
              <NotebookButton onClick={() => setNotebookOpen(true)} count={notebookCount} />
              <button
                onClick={() => setParetoOpen(true)}
                className="flex items-center gap-1 text-white font-semibold px-3 py-1.5 rounded-full text-xs"
                style={{ background: "rgba(20,184,166,0.25)", backdropFilter: "blur(8px)", border: "1px solid rgba(20,184,166,0.6)" }}
                title="Vocabulário Pareto 1000+"
              >
                📚 Pareto
              </button>
              <div
                className="flex items-center gap-1 text-yellow-400 font-bold px-3 py-1.5 rounded-full"
                style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
              >
                ⭐ {score}
              </div>
              <button
                type="button"
                onClick={(event) => { event.stopPropagation(); setQuizFeedback(null); setQuizOpen((open) => !open); }}
                className="rounded-full px-3 py-1.5 text-xs font-bold text-white transition hover:scale-105"
                style={{ background: "rgba(99,102,241,.88)", backdropFilter: "blur(8px)" }}
              >
                {quizOpen ? "Fechar quiz" : "Quiz da cena"}
              </button>
              <div
                className="text-white px-3 py-1.5 rounded-full"
                style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", fontSize: "clamp(11px, 1.3vw, 14px)" }}
              >
                {learnedWords.size}/{selectedScene.hotspots.length}
              </div>
            </>}
          </div>
        </div>

        {/* AR Hotspots */}
        {selectedScene.hotspots.map((hotspot) => {
          const learned = learnedWords.has(hotspot.id);
          return (
            <div
              key={hotspot.id}
              style={{
                position: "absolute",
                left: `${hotspot.x}%`,
                top: `${hotspot.y}%`,
                transform: "translate(-50%, -50%)",
                zIndex: 20,
                cursor: "pointer",
              }}
              onClick={(e) => { e.stopPropagation(); handleHotspotClick(hotspot); }}
            >
              {/* Float wrapper: CSS class hs-float-N — translateY only, no inline style conflict */}
              <div className={learned ? undefined : `hs-float hs-float-${hotspot.id.charCodeAt(hotspot.id.length - 1) % 10}`}>
              {/* Main button — clean, no glow, no ring */}
              <div
                style={{
                  width: "clamp(44px, 5.5vw, 58px)",
                  height: "clamp(44px, 5.5vw, 58px)",
                  borderRadius: "50%",
                  background: learned
                    ? `${hotspot.color}33`
                    : `linear-gradient(135deg, ${hotspot.color}cc, ${hotspot.color}88)`,
                  border: `2.5px solid ${hotspot.color}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "clamp(18px, 2.2vw, 26px)",
                  backdropFilter: "blur(8px)",
                  transition: "transform 0.15s ease",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "scale(1.12)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "scale(1)"; }}
              >
                {learned ? "✓" : <HotspotVisual hotspot={hotspot} size={24} />}
              </div>
              {/* Label always visible — translated to student's target language */}
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 6px)",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "rgba(0,0,0,0.85)",
                  color: "#fff",
                  padding: "3px 8px",
                  borderRadius: "20px",
                  fontSize: "clamp(9px, 1.1vw, 12px)",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  border: `1px solid ${hotspot.color}66`,
                  backdropFilter: "blur(4px)",
                  animation: "label-pop 0.3s ease-out",
                }}
              >
                {hotspot.label}
              </div>
              </div>{/* end float wrapper */}
            </div>
          );
        })}

        {/* Vocabulary Card */}
        {activeHotspot && (
          <div
            style={{ animation: "vocab-slide-in 0.25s ease-out" }}
            onClick={(e) => e.stopPropagation()}
          >
            <VocabCard
              hotspot={activeHotspot}
              langCode={targetLang || effectiveLang(selectedScene)}
              nativeLang={nativeLang}
              nativeLangFlag={nativeLangInfo?.flag || "🇧🇷"}
              onClose={() => setActiveHotspot(null)}
              onSpeak={(text, language) => requestSpeechSafely(text, language, selectedScene.teacherGender, "hotspot")}
              onPractice={() => setPracticeHotspot(activeHotspot)}
            />
          </div>
        )}

        {practiceHotspot && (
          <ParetoPracticeCycle
            term={{ word: practiceHotspot.label, translation: practiceHotspot.translation, example: practiceHotspot.example }}
            onClose={() => setPracticeHotspot(null)}
            onSpeak={(text) => requestSpeechSafely(text, selectedScene.teacherLang, selectedScene.teacherGender, "hotspot")}
            level={sceneCefrLevel(selectedScene)}
          />
        )}

        {quizOpen && quizQuestion && (
          <div
            className="absolute left-1/2 top-1/2 z-40 w-[min(92vw,440px)] -translate-x-1/2 -translate-y-1/2 rounded-3xl border p-5 shadow-2xl"
            style={{ background: "rgba(15,23,42,.95)", borderColor: "rgba(129,140,248,.65)", backdropFilter: "blur(18px)" }}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Quiz da cena"
          >
            <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-indigo-200">
              <span>Revisão da cena</span>
              <span>+10 XP</span>
            </div>
            <p className="mb-1 text-sm text-slate-300">Qual é a tradução de:</p>
            <p className="mb-5 text-3xl font-black text-white">{getHotspotLabel(quizQuestion.id, quizQuestion.label, effectiveLang(selectedScene))}</p>
            <div className="grid gap-2">
              {quizOptions.map((option) => {
                const isCorrectOption = option === quizQuestion.translation;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleQuizAnswer(option)}
                    className="rounded-xl border px-4 py-3 text-left text-sm font-semibold text-white transition hover:border-indigo-300 hover:bg-indigo-500/20"
                    style={{
                      borderColor: quizFeedback && isCorrectOption ? "#4ade80" : quizFeedback === "wrong" && !isCorrectOption ? "rgba(248,113,113,.4)" : "rgba(148,163,184,.35)",
                      background: quizFeedback && isCorrectOption ? "rgba(34,197,94,.18)" : "rgba(255,255,255,.04)",
                    }}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            {quizFeedback && (
              <p className={`mt-4 text-sm font-bold ${quizFeedback === "correct" ? "text-emerald-300" : "text-amber-200"}`}>
                {quizFeedback === "correct" ? "Correto! Você ganhou 10 XP." : `Quase. A resposta é “${quizQuestion.translation}”.`}
              </p>
            )}
          </div>
        )}

        {/* Particles */}
        <Particles active={particles} />

        {/* Teacher */}
        <TeacherAvatar
          scene={teachingScene ?? selectedScene!}
          greeting={greetingText}
          showGreeting={showGreeting}
          isSpeaking={isSpeaking}
          isPreparingAudio={isPreparingNeuralAudio}
          spokenText={activeSpeechText || greetingText}
          audioViseme={audioViseme}
          activeClip={activeJamesClip || activeSophieClip}
          onClipFinished={() => { setActiveJamesClipId(null); setActiveSophieClipId(null); }}
        />

        {/* ── Dialog Panel: scrolling text + exercises ── */}
        {!(dlgOpen || (isSpeaking && activeDialogLineRef.current)) && (
          <button
            onClick={(e) => { e.stopPropagation(); startDialog(selectedScene); }}
            className="immersive-start-dialog absolute z-50 flex items-center gap-2 text-white font-semibold px-4 py-2 rounded-full"
            style={{
              bottom: "100px", left: "50%", transform: "translateX(-50%)",
              background: "rgba(99,102,241,0.85)", backdropFilter: "blur(8px)",
              border: "1px solid rgba(99,102,241,0.6)", fontSize: "clamp(12px,1.4vw,15px)",
              boxShadow: "0 4px 20px rgba(99,102,241,0.4)",
            }}
          >
            {immersionMode ? "💬 Start dialogue" : "💬 Iniciar Diálogo"}
          </button>
        )}
        {dialogAuthRequired && !isAuthenticated && (
          <div
            className="absolute left-1/2 z-[60] w-[min(92vw,420px)] -translate-x-1/2 rounded-2xl border p-4 text-center shadow-2xl"
            style={{ bottom: "148px", background: "rgba(15,23,42,.94)", borderColor: "rgba(129,140,248,.72)", backdropFilter: "blur(14px)" }}
            role="status"
          >
            <p className="text-sm font-semibold text-white">O diálogo com voz neural requer uma sessão protegida.</p>
            <p className="mt-1 text-xs text-slate-300">As cenas e o vocabulário continuam visíveis; entre para ativar fala, resposta e sincronização labial.</p>
            <div className="mt-3 flex items-center justify-center gap-2">
              <button type="button" onClick={() => { window.location.href = getLoginUrl(); }} className="rounded-full bg-indigo-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-indigo-400">Entrar</button>
              <button type="button" onClick={() => setDialogAuthRequired(false)} className="rounded-full border border-slate-500 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-300">Agora não</button>
            </div>
          </div>
        )}
        {(dlgOpen || (isSpeaking && activeDialogLineRef.current)) && selectedScene.dialog[dlgStep] && (
          <div
            className="immersive-dialog absolute left-0 right-0 z-[70]"
            style={{
              bottom: "clamp(112px, 16vh, 150px)",
              padding: "0 clamp(8px,2vw,24px)",
              paddingRight: "clamp(130px,20vw,240px)",
            }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Diálogo da cena"
          >
            <div
              style={{
                background: "rgba(0,0,0,0.82)",
                backdropFilter: "blur(12px)",
                borderRadius: "16px",
                border: "1px solid rgba(255,255,255,0.12)",
                padding: "16px 20px",
                maxHeight: "min(43vh, 340px)",
                overflowY: "auto",
              }}
            >
              <div className="mb-3 flex items-center justify-between gap-3 border-b border-white/10 pb-2">
                {!immersionMode && <span className="text-xs font-black uppercase tracking-[0.16em] text-indigo-200">Diálogo da cena</span>}
                <button
                  type="button"
                  onClick={() => setLocation("/base-de-estudos?returnTo=%2Fimmersive-scene")}
                  className="ml-auto rounded-full border border-amber-300/45 bg-amber-300/10 px-3 py-1 text-xs font-extrabold text-amber-100 hover:bg-amber-300/20"
                  title="Abrir Consulta Rápida e Total sem perder esta cena"
                >
                  {immersionMode ? "Consulta" : "Consulta Rápida e Total"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    stopTeacherAudio();
                    activeDialogLineRef.current = null;
                    activeDialogWordCountRef.current = 0;
                    setDlgAudioClock(false);
                    setDlgOpen(false);
                  }}
                  className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold text-white hover:bg-white/20"
                >
                  Fechar
                </button>
              </div>
              {/* Speaker label */}
              <div className="flex items-center gap-2 mb-2">
                <span style={{ fontSize: "11px", fontWeight: 700, color: selectedScene.dialog[dlgStep].speaker === 'teacher' ? '#818cf8' : '#34d399', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {selectedScene.dialog[dlgStep].speaker === 'teacher' ? `🏫 ${selectedScene.teacherName}` : '👤 Você'}
                </span>
                {!immersionMode && dlgTranslationLoading && !isPortugueseLocale(nativeLang) && (
                  <span className="text-[11px] text-cyan-100/65">Traduzindo para {nativeLangLabel}…</span>
                )}
{!immersionMode && getDlgTranslation(selectedScene.dialog[dlgStep]) && (
                  <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)" }}>
                    — {getDlgTranslation(selectedScene.dialog[dlgStep])}
                  </span>
                )}
                {getDlgTranslation(selectedScene.dialog[dlgStep]) && (
                  <button
                    type="button"
                    onClick={() => speakNativeHelp(getDlgTranslation(selectedScene.dialog[dlgStep]))}
                    className="ml-auto rounded-full border border-cyan-300/35 bg-cyan-400/10 px-2 py-1 text-[10px] font-bold text-cyan-100 hover:bg-cyan-400/20"
                    title="Ouvir ajuda na língua nativa"
                    aria-label="Ouvir ajuda na língua nativa"
                  >
                    {immersionMode ? "?" : `Ouvir ajuda ${nativeLangLabel}`}
                  </button>
                )}
              </div>
              {selectedScene.dialog[dlgStep].speaker === 'teacher' && (
                <div className="mb-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const teacherSpeech = getImmersiveDialogTeacherSpeech(selectedScene.dialog[dlgStep].text, selectedScene);
                      requestSpeechSafely(teacherSpeech.text, teacherSpeech.language, teacherSpeech.gender, teacherSpeech.purpose);
                    }}
                    className="rounded-full border border-indigo-300/45 bg-indigo-400/10 px-3 py-1.5 text-xs font-extrabold text-indigo-100 transition hover:bg-indigo-400/20"
                    title="Repetir a fala do professor em inglês"
                  >
                    {isPreparingNeuralAudio ? "Preparando inglês…" : isSpeaking ? "Reiniciar inglês" : "Ouvir inglês"}
                  </button>
                  {!isAuthenticated && (
                    <button
                      type="button"
                      onClick={() => {
                        const teacherSpeech = getImmersiveDialogTeacherSpeech(selectedScene.dialog[dlgStep].text, selectedScene);
                        playGuestBrowserVoice(teacherSpeech.text, teacherSpeech.language, teacherSpeech.gender);
                      }}
                      className="rounded-full border border-emerald-300/45 bg-emerald-400/10 px-3 py-1.5 text-xs font-extrabold text-emerald-100 transition hover:bg-emerald-400/20"
                      title="Usar a voz disponível neste navegador"
                    >
                      {immersionMode ? "Browser voice" : "Usar voz do navegador"}
                    </button>
                  )}
                  <div className="flex items-center gap-1 rounded-full border border-white/15 bg-slate-950/60 p-1" role="group" aria-label="Velocidade da fala do professor e da ajuda nativa">
                    {DIALOG_SPEECH_RATES.map((rate) => (
                      <button
                        key={rate.value}
                        type="button"
                        onClick={() => setDialogSpeechRate(rate.value)}
                        aria-pressed={dialogSpeechRate === rate.value}
                        className={dialogSpeechRate === rate.value
                          ? "rounded-full bg-cyan-300 px-2 py-1 text-[10px] font-extrabold text-slate-950"
                          : "rounded-full px-2 py-1 text-[10px] font-bold text-slate-200 hover:bg-white/10"}
                        title={`Ouvir fala e ajuda em ${rate.value}×`}
                      >
                        {immersionMode ? `${rate.value}×` : rate.label}
                      </button>
                    ))}
                  </div>
                  <audio
                    ref={dialogAudioElementRef}
                    src={dialogAudioSource || undefined}
                    controls={Boolean(dialogAudioSource)}
                    preload="auto"
                    className={dialogAudioSource ? "h-8 max-w-[220px]" : "hidden"}
                    aria-label="Áudio da fala em inglês"
                  />
                  {dialogAudioSource && (
                    <button
                      type="button"
                      onClick={() => { void replayVisibleDialogAudio(); }}
                      className="rounded-full border border-cyan-300/60 bg-cyan-400/15 px-3 py-1.5 text-xs font-bold text-cyan-50 transition hover:bg-cyan-400/25"
                    >
                      ▶ Ouvir James
                    </button>
                  )}
                </div>
              )}
              {/* Scrolling text word by word */}
              {selectedScene.dialog[dlgStep].speaker === 'teacher' && (
                <div style={{ fontSize: "clamp(16px,2vw,22px)", fontWeight: 600, color: "#fff", lineHeight: 1.5, minHeight: "2em", letterSpacing: "0.01em" }}>
                  {dlgWords.slice(0, dlgWordIdx).map((w, i) => (
                    <span key={i} style={{ display: 'inline-block', marginRight: '0.3em', opacity: 1, animation: 'wordFadeIn 0.25s ease' }}>{w}</span>
                  ))}
                  {dlgWordIdx < dlgWords.length && (
                    <span style={{ display: 'inline-block', width: '8px', height: '18px', background: '#818cf8', borderRadius: '2px', verticalAlign: 'middle', animation: 'cursorBlink 0.8s infinite' }} />
                  )}
                </div>
              )}
              {selectedScene.dialog[dlgStep].speaker === 'teacher' && (
                <div className="mt-3 rounded-xl border border-cyan-200/20 bg-cyan-500/5 p-3">
                  <p className="mb-2 text-xs font-semibold text-cyan-100">Pergunte ao professor sobre esta fala, a cena ou uma palavra:</p>
                  <div className="flex gap-2">
                    <input
                      value={dlgWrittenAnswer}
                      onChange={(event) => setDlgWrittenAnswer(event.target.value)}
                      onKeyDown={(event) => { if (event.key === "Enter") submitWrittenDialogAnswer(); }}
                      placeholder="Ex.: What is pool?"
                      className="min-w-0 flex-1 rounded-lg border border-white/20 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300"
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      onClick={submitWrittenDialogAnswer}
                      className="rounded-lg bg-cyan-300 px-3 py-2 text-sm font-extrabold text-slate-950 disabled:opacity-50"
                    >
                      {dlgTutorLoading ? "Respondendo…" : "Perguntar"}
                    </button>
                  </div>
                  {dlgFeedback && (
                    <div className="mt-3 rounded-lg border border-amber-300/35 bg-amber-300/10 px-3 py-2">
                      <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.08em] text-amber-100">Resposta escrita do professor</p>
                      <div role="status" aria-live="polite" className="whitespace-pre-line text-sm font-medium text-amber-100">
                        {dlgFeedback}
                      </div>
                    </div>
                  )}
                  {localizedSceneDialogueQuery.data?.status === "ready" && localizedSceneDialogueQuery.data.turns.length > 0 && (
                    <section className="mt-3 rounded-lg border border-emerald-300/25 bg-emerald-950/20 px-3 py-2" aria-label="Material localizado da cena">
                      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-emerald-100">Material localizado da cena</p>
                      <div className="space-y-2 text-sm text-emerald-50">
                        {localizedSceneDialogueQuery.data.turns.map((turn, index) => (
                          <div key={`${index}-${turn.targetText}`}>
                            <p className="font-semibold">{turn.targetText}</p>
                            <p className="text-emerald-100/80">{nativeLangInfo.name}: {turn.nativeHelp}</p>
                          </div>
                        ))}
                      </div>
                      {localizedSceneDialogueQuery.data.objects.length > 0 && (
                        <div className="mt-3 border-t border-emerald-300/15 pt-3">
                          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.14em] text-emerald-200">Objetos para praticar</p>
                          <div className="grid gap-2 sm:grid-cols-2">
                            {localizedSceneDialogueQuery.data.objects.map((object, index) => (
                              <div key={`${index}-${object.targetText}`} className="rounded-md bg-emerald-300/10 px-2.5 py-2">
                                <p className="text-sm font-semibold text-emerald-50">{object.targetText}</p>
                                <p className="text-xs text-emerald-100/80">{nativeLangInfo.name}: {object.nativeHelp}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </section>
                  )}
                  <div className="mt-3 rounded-lg border border-violet-300/20 bg-violet-400/5 p-2.5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-violet-100">Começar só pelas palavras Pareto</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedScene.hotspots.slice(0, 6).map((hotspot) => (
                        <button
                          key={hotspot.id}
                          type="button"
                          onClick={() => {
                            setPracticeHotspot(hotspot);
                            setDlgFeedback(`Vamos começar por “${hotspot.label}”. Ouça, escreva e crie uma frase quando estiver pronto.`);
                            requestSpeechSafely(hotspot.label, selectedScene.teacherLang, selectedScene.teacherGender, "hotspot");
                          }}
                          className="rounded-full border border-violet-300/35 bg-violet-300/10 px-2.5 py-1 text-xs font-bold text-violet-100 hover:bg-violet-300/20"
                        >
                          {hotspot.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {/* Multiple choice — only for user turns */}
              {selectedScene.dialog[dlgStep].speaker === 'user' && selectedScene.dialog[dlgStep].options && (
                <div className="flex flex-col gap-2 mt-1">
                  {selectedScene.dialog[dlgStep].options!.map((opt, i) => (
                    <button
                      key={i}
                      disabled={dlgAnswer !== null}
                      onClick={() => {
                        setDlgAnswer(i);
                        const correct = selectedScene.dialog[dlgStep].correctIndex === i;
                        if (correct) {
                          const praiseClip = playJamesTropicalClip("james-tropical-praise") || playSophieCafeClip("sophie-cafe-praise");
                          const teacherSpeech = getImmersiveDialogTeacherSpeech(praiseClip?.dialogue || `✅ ${opt}`, selectedScene);
                          requestSpeechSafely(teacherSpeech.text, teacherSpeech.language, teacherSpeech.gender, teacherSpeech.purpose);
                        } else {
                          const retryClip = playJamesTropicalClip("james-tropical-retry") || playSophieCafeClip("sophie-cafe-retry");
                          if (retryClip) requestSpeechSafely(retryClip.dialogue, retryClip.language, retryClip.teacherName === "James" ? "male" : "female", "teacher");
                        }
                        setTimeout(() => dlgNext(), 1400);
                      }}
                      style={{
                        textAlign: 'left', padding: '10px 14px', borderRadius: '10px', fontSize: 'clamp(13px,1.5vw,16px)', fontWeight: 500, cursor: dlgAnswer !== null ? 'default' : 'pointer', transition: 'all 0.2s',
                        background: dlgAnswer === null ? 'rgba(255,255,255,0.1)' : i === selectedScene.dialog[dlgStep].correctIndex ? 'rgba(34,197,94,0.3)' : dlgAnswer === i ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.06)',
                        border: dlgAnswer === null ? '1px solid rgba(255,255,255,0.15)' : i === selectedScene.dialog[dlgStep].correctIndex ? '1px solid #22c55e' : dlgAnswer === i ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.08)',
                        color: '#fff',
                      }}
                    >
                      {dlgAnswer !== null && i === selectedScene.dialog[dlgStep].correctIndex && <span style={{marginRight:'6px'}}>✅</span>}
                      {dlgAnswer === i && i !== selectedScene.dialog[dlgStep].correctIndex && <span style={{marginRight:'6px'}}>❌</span>}
                      {opt}
                    </button>
                  ))}
                  <div className="mt-2 rounded-xl border border-cyan-200/20 bg-cyan-500/5 p-3">
                    <p className="mb-2 text-xs font-semibold text-cyan-100">Ou escreva sua resposta no idioma estudado:</p>
                    <div className="flex gap-2">
                      <input
                        value={dlgWrittenAnswer}
                        onChange={(event) => setDlgWrittenAnswer(event.target.value)}
                        onKeyDown={(event) => { if (event.key === "Enter") submitWrittenDialogAnswer(); }}
                        disabled={dlgAnswer !== null}
                        placeholder="Digite sua resposta no idioma estudado"
                        className="min-w-0 flex-1 rounded-lg border border-white/20 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300"
                        autoComplete="off"
                      />
                      <button
                        type="button"
                        onClick={submitWrittenDialogAnswer}
                        disabled={dlgAnswer !== null}
                        className="rounded-lg bg-cyan-300 px-3 py-2 text-sm font-extrabold text-slate-950 disabled:opacity-50"
                      >
                        {dlgTutorLoading ? "Respondendo…" : "Responder"}
                      </button>
                    </div>
                    {dlgFeedback && (
                      <div role="status" className="mt-3 whitespace-pre-line rounded-lg border border-amber-300/35 bg-amber-300/10 px-3 py-2 text-sm font-medium text-amber-100">
                        {dlgFeedback}
                      </div>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={dlgIsRecording ? stopDialogRecording : startDialogRecording}
                        disabled={dlgAnswer !== null || dlgIsProcessingSpeech}
                        className="inline-flex items-center gap-2 rounded-lg border border-emerald-300/45 bg-emerald-400/10 px-3 py-2 text-sm font-extrabold text-emerald-100 hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {dlgIsRecording ? <Square size={15} fill="currentColor" /> : <Mic size={16} />}
                        {dlgIsRecording ? "Parar gravação" : dlgIsProcessingSpeech ? "Transcrevendo…" : "Responder com microfone"}
                      </button>
                      <span className="text-[11px] text-cyan-100/65">O navegador pedirá permissão antes de gravar.</span>
                    </div>
                  </div>
                </div>
              )}
              {dlgSuggestedHotspot && dlgAnswer !== null && (
                <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-amber-300/30 bg-amber-400/10 p-3">
                  <span className="text-xs font-semibold text-amber-100">Objeto visível: {dlgSuggestedHotspot.label}</span>
                  <button
                    type="button"
                    onClick={() => setPracticeHotspot(dlgSuggestedHotspot)}
                    className="rounded-lg bg-amber-300 px-3 py-2 text-xs font-extrabold text-slate-950"
                  >
                    Praticar com Pareto
                  </button>
                  <button
                    type="button"
                    onClick={dlgNext}
                    className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs font-bold text-white hover:bg-white/15"
                  >
                    Continuar diálogo
                  </button>
                </div>
              )}
              {/* Continue button for teacher lines */}
              {selectedScene.dialog[dlgStep].speaker === 'teacher' && dlgWordIdx >= dlgWords.length && (
                <button
                  onClick={dlgNext}
                  style={{ marginTop: '12px', padding: '8px 20px', borderRadius: '8px', background: 'rgba(99,102,241,0.7)', color: '#fff', fontWeight: 600, fontSize: '14px', border: '1px solid rgba(99,102,241,0.5)', cursor: 'pointer' }}
                >
                  {immersionMode ? "Next →" : "Continuar →"}
                </button>
              )}
            </div>
          </div>
        )}
        <style>{`
          @keyframes wordFadeIn { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }
          @keyframes cursorBlink { 0%,100% { opacity:1; } 50% { opacity:0; } }
        `}</style>

        {/* Bottom bar */}
        <div
          className="absolute left-0 right-0 z-40 flex items-center justify-between px-4 py-3"
          style={{
            bottom: "48px",
            background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
            paddingRight: "clamp(130px, 20vw, 240px)",
            paddingBottom: "clamp(12px, 2vh, 20px)",
          }}
        >
          <div />
          <div className="flex gap-2">
            {selectedScene.hotspots.map((h) => (
              <div
                key={h.id}
                style={{
                  width: "clamp(8px, 1vw, 12px)",
                  height: "clamp(8px, 1vw, 12px)",
                  borderRadius: "50%",
                  background: learnedWords.has(h.id) ? h.color : "rgba(255,255,255,0.3)",
                  transition: "background 0.3s",
                }}
              />
            ))}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              const idx = IMMERSIVE_SCENES.findIndex(s => s.id === selectedScene.id);
              const next = IMMERSIVE_SCENES[(idx + 1) % IMMERSIVE_SCENES.length];
              console.log('[Próxima] clicked. current:', selectedScene.id, 'idx:', idx, 'next:', next.id);
              setSelectedScene(next);
            }}
            className="flex items-center gap-2 text-white font-semibold px-4 py-2 rounded-full btn-press"
            style={{ background: "rgba(99,102,241,0.8)", backdropFilter: "blur(8px)", border: "1px solid rgba(99,102,241,0.5)", fontSize: "clamp(11px, 1.3vw, 14px)" }}
          >
            {immersionMode ? "Next →" : "Próxima →"}
          </button>
        </div>
        {/* Notebook Modal */}
        <Notebook
          isOpen={notebookOpen}
          onClose={() => setNotebookOpen(false)}
          onSpeak={speak}
          nativeLang={nativeLang}
        />
        {/* Pareto Vocabulary Panel */}
        <ParetoPanel
          isOpen={paretoOpen}
          onClose={() => setParetoOpen(false)}
          targetLang={targetLang || "en-US"}
          targetLangName={currentLangInfo.name || "English"}
          currentScene={selectedScene?.id}
          practiceLevel={selectedScene ? sceneCefrLevel(selectedScene) : "A1"}
          voiceGender={selectedScene?.teacherGender}
          onAddToNotebook={handleAddParetoToNotebook}
        />
      </div>
    );
  }

  // ── Scene Selection Grid ──
  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)" }}>
      {/* Header */}
      <div
        className="sticky top-0 z-10 px-4 py-4"
        style={{ background: "rgba(15,12,41,0.9)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => { stopEdgeTTS(); setLocation("/"); }}
            className="flex items-center gap-2 text-gray-400 hover:text-white px-3 py-1.5 rounded-full text-sm transition-colors"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            ← Voltar
          </button>
          <div className="text-center">
            <h1 className="text-white font-bold" style={{ fontSize: "clamp(16px, 2.5vw, 24px)" }}>
              🌍 Immersive Scenes
            </h1>
            <p className="text-gray-400 text-xs">{IMMERSIVE_SCENES.length} environments • Native teacher • Contextual vocabulary</p>
          </div>
          <div
            className="text-yellow-400 font-bold px-3 py-1.5 rounded-full text-sm"
            style={{ background: "rgba(234,179,8,0.15)", border: "1px solid rgba(234,179,8,0.3)" }}
          >
            ⭐ {score}
          </div>
        </div>

        {/* Language selector for study target */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Estudar:</span>
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowLangPicker(v => !v)}
              className="flex items-center gap-1 text-white font-semibold px-3 py-1.5 rounded-full text-sm"
              style={{ background: targetLang ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.1)", border: "1px solid rgba(99,102,241,0.5)" }}
            >
              {currentLangInfo.flag} {currentLangInfo.name || "Selecionar idioma"} ▾
            </button>
            {showLangPicker && (
              <div
                style={{
                  position: "absolute", top: "110%", left: 0, zIndex: 100,
                  background: "rgba(15,12,41,0.98)", backdropFilter: "blur(16px)",
                  border: "1px solid rgba(99,102,241,0.5)", borderRadius: 12,
                  padding: 8, minWidth: 200, maxHeight: 300, overflowY: "auto",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.8)"
                }}
              >
                <div style={{ fontSize: 11, color: "#a78bfa", fontWeight: 700, padding: "4px 8px 8px", textTransform: "uppercase", letterSpacing: 1 }}>Escolha o idioma a estudar</div>
                {Object.entries(LANG_LABELS).map(([code, info]) => (
                  <button
                    key={code}
                    onClick={() => handleSelectTargetLang(code)}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      width: "100%", padding: "7px 10px", borderRadius: 8,
                      background: targetLang === code ? "rgba(99,102,241,0.4)" : "transparent",
                      color: "white", fontSize: 13, fontWeight: targetLang === code ? 700 : 400,
                      border: "none", cursor: "pointer", textAlign: "left"
                    }}
                  >
                    <span>{info.flag}</span>
                    <span>{info.name}</span>
                    <span style={{ color: "#6b7280", fontSize: 11, marginLeft: "auto" }}>{code}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {targetLang && (
            <span className="text-green-400 text-xs">✓ Idioma selecionado — as cenas mostrarão vocabulário em {currentLangInfo.name}</span>
          )}
        </div>
        {targetLang && <VoiceQualityBanner lang={targetLang} className="mb-3" />}

        {/* Search + Filters */}
        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            placeholder="🔍 Buscar cena..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-32 px-3 py-2 rounded-full text-white text-sm outline-none"
            style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", color: "white" }}
          />
          {(["all", ...IMMERSIVE_CEFR_LEVELS.map((item) => item.value)] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-2 rounded-full text-sm font-semibold transition-all"
              style={{
                background: filter === f ? "#6366f1" : "rgba(255,255,255,0.08)",
                color: filter === f ? "white" : "#94a3b8",
                border: filter === f ? "1px solid #6366f1" : "1px solid rgba(255,255,255,0.1)",
              }}
            >
              {f === "all" ? "Todos" : cefrLabel(f)}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="p-4 grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(clamp(150px, 42vw, 280px), 1fr))" }}>
        {filteredScenes.map((scene) => (
          <div
            key={scene.id}
            onClick={() => handleEnterScene(scene)}
            className="relative rounded-2xl overflow-hidden cursor-pointer group"
            style={{
              aspectRatio: "16/10",
              border: "1px solid rgba(255,255,255,0.1)",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform = "scale(1.03)";
              (e.currentTarget as HTMLDivElement).style.boxShadow = "0 20px 60px rgba(99,102,241,0.4)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform = "scale(1)";
              (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
            }}
          >
            {/* Background image */}
            <img
              src={scene.bgImage}
              alt={scene.name}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "transform 0.4s",
              }}
              className="group-hover:scale-105"
            />

            {/* Overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)",
              }}
            />

            {/* Badges */}
            <div className="absolute top-2 left-2 flex gap-1">
              <span
                className="px-2 py-0.5 rounded-full text-white font-bold"
                style={{ background: cefrColor(sceneCefrLevel(scene)), fontSize: "clamp(8px, 1vw, 11px)" }}
              >
                {cefrLabel(sceneCefrLevel(scene))}
              </span>
              {scene.premium && (
                <span
                  className="px-2 py-0.5 rounded-full text-white font-bold"
                  style={{ background: "#f59e0b", fontSize: "clamp(8px, 1vw, 11px)" }}
                >
                  ⭐ PRO
                </span>
              )}
            </div>

            {/* Object count */}
            <div
              className="absolute top-2 right-2 text-white font-semibold px-2 py-0.5 rounded-full"
              style={{ background: "rgba(0,0,0,0.6)", fontSize: "clamp(8px, 1vw, 11px)" }}
            >
              {scene.hotspots.length} objetos
            </div>

            {/* Bottom info */}
            <div className="absolute bottom-0 left-0 right-0 px-3 py-2">
              <div className="text-white font-bold" style={{ fontSize: "clamp(12px, 1.6vw, 16px)" }}>
                {scene.name}
              </div>
              <div className="text-gray-300" style={{ fontSize: "clamp(9px, 1.1vw, 12px)" }}>
                {scene.nameEn}
              </div>
              {/* Hotspot icons preview */}
              <div className="flex gap-1 mt-1 flex-wrap">
                {scene.hotspots.slice(0, 4).map((h) => (
                  <span
                    key={h.id}
                    className="px-1.5 py-0.5 rounded-full text-white"
                    style={{ background: `${h.color}44`, border: `1px solid ${h.color}66`, fontSize: "clamp(8px, 1vw, 11px)" }}
                  >
                    {h.icon} {getHotspotLabel(h.id, h.label, targetLang || "en-US")}
                  </span>
                ))}
                {scene.hotspots.length > 4 && (
                  <span className="text-gray-400" style={{ fontSize: "clamp(8px, 1vw, 11px)" }}>
                    +{scene.hotspots.length - 4}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
