import { useState, useEffect, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import VoiceSelector, { speakWithPreference } from "../components/VoiceSelector";
import { useLocation } from "wouter";
import Notebook, { NotebookButton, addToNotebook, loadNotebook } from "../components/Notebook";
import ParetoPanel from "../components/ParetoPanel";
import type { ParetoWord } from "../lib/vocab-pareto";
import { getLessonStrings, getSelectedTeacherLang } from "../lib/lesson-i18n";
import { stopEdgeTTS } from "@/lib/edgeTTSClient";
import { getHotspotLabel } from "../lib/hotspot-translations";
import { useLanguage } from "@/contexts/LanguageContext";
import { VoiceQualityBanner } from "@/components/VoiceQualityBanner";
import { useVisemeSequence } from "@/hooks/useVisemeSequence";
import { useTTSVisemeSync, type VisemeData } from "@/lib/tts-viseme-sync";
import { ImmersionModeToggle } from "@/components/ImmersionModeToggle";

// ─── Teacher map: idioma do aluno → professor ─────────────────────────────────
const LANG_TEACHERS: Record<string, { name: string; image: string }> = {
  "en":  { name: "James",  image: "/manus-storage/prof_james_b9f2fff7.png" },
  "pt":  { name: "Ana",    image: "/manus-storage/prof_ana_241ffde7.png" },
  "es":  { name: "Carlos", image: "/manus-storage/prof_carlos_3a763932.jpg" },
  "fr":  { name: "Sophie", image: "/manus-storage/prof_sophie_a6324ef6.png" },
  "de":  { name: "Hans",   image: "/manus-storage/prof_hans_62b758a6.png" },
  "it":  { name: "Giulia", image: "/manus-storage/prof_giulia_f8adfeb6.png" },
  "ja":  { name: "Yuki",   image: "/manus-storage/prof_yuki_ae657681.png" },
  "ar":  { name: "Omar",   image: "/manus-storage/prof_omar_5c108d44.png" },
  "ru":  { name: "Ivan",   image: "/manus-storage/prof_ivan_5c4962f5.png" },
  "pl":  { name: "Maja",   image: "/manus-storage/prof_maja_860515c8.png" },
  "tr":  { name: "Emre",   image: "/manus-storage/prof_emre_78eb8ccb.png" },
  "hi":  { name: "Priya",  image: "/manus-storage/prof_priya_7c36613d.png" },
};
function getTeacherForLang(targetLang: string, fallback: { name: string; image: string }) {
  const base = (targetLang || "").split("-")[0].toLowerCase();
  return LANG_TEACHERS[base] || fallback;
}

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Hotspot {
  id: string; x: number; y: number;
  label: string; translation: string; pronunciation: string;
  example: string; examplePt: string; icon: string; color: string;
}
interface DialogLine {
  speaker: "teacher" | "user";
  text: string; textPt: string;
  options?: string[]; correctIndex?: number;
}
export interface Scene {
  id: string; name: string; nameEn: string;
  bgImage: string; teacherImage: string; teacherName: string;
  teacherLang: string; langCode: string; flag: string;
  teacherGender?: 'male' | 'female';
  teacherGreeting: string; greetingPt: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  premium: boolean; hotspots: Hotspot[];
  dialog: DialogLine[];
  teacherAnimation?: "professor-wave" | "professor-nod" | "professor-celebrate"; // Optional animation for professor
}

// ─── Scene Data (25 scenes with CDN images) ───────────────────────────────────
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
      {id:"ocean", x:60, y:32, label:"Ocean", translation:"Oceano", pronunciation:"OH-shën", example:"The ocean is deep.", examplePt:"O oceano é profundo.", icon:"🌊", color:"#06b6d4"}, // Turquoise
      {id:"sand", x:40, y:72, label:"Sand", translation:"Areia", pronunciation:"SÆND", example:"The sand is warm.", examplePt:"A areia está quente.", icon:"🏖️", color:"#f59e0b"},
      {id:"palm", x:15, y:28, label:"Palm Tree", translation:"Palmeira", pronunciation:"PAAM-tree", example:"The palm tree is tall.", examplePt:"A palmeira é alta.", icon:"🌴", color:"#22c55e"},
      {id:"shell", x:70, y:77, label:"Shell", translation:"Concha", pronunciation:"SHEL", example:"I found a shell.", examplePt:"Encontrei uma concha.", icon:"🐚", color:"#f97316"},
      {id:"sun", x:82, y:12, label:"Sun", translation:"Sol", pronunciation:"SÂN", example:"The sun is bright.", examplePt:"O sol está brilhante.", icon:"☀️", color:"#eab308"},
      {id:"wave", x:50, y:52, label:"Wave", translation:"Onda", pronunciation:"WEYV", example:"The wave is big.", examplePt:"A onda é grande.", icon:"🌊", color:"#14b8a6"}, // Turquoise net
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
      {id:"jinja", x:30, y:32, label:"神社", translation:"Santuário", pronunciation:"djin-dja", example:"神社は美しいです。", examplePt:"O santuário é bonito.", icon:"⛩️", color:"#dc2626"},
      {id:"tori", x:55, y:65, label:"通り", translation:"Rua", pronunciation:"to-ori", example:"通りは賑やかです。", examplePt:"A rua é movimentada.", icon:"🛣️", color:"#7c3aed"},
      {id:"kanban", x:70, y:38, label:"看板", translation:"Placa", pronunciation:"can-ban", example:"看板が見えます。", examplePt:"Vejo a placa.", icon:"📋", color:"#0891b2"},
      {id:"chochin", x:20, y:58, label:"提灯", translation:"Lanterna", pronunciation:"cho-chin", example:"提灯が光ります。", examplePt:"A lanterna brilha.", icon:"🏮", color:"#ea580c"},
      {id:"sakura", x:45, y:22, label:"桜", translation:"Cerejeira", pronunciation:"sa-ku-ra", example:"桜が咲いています。", examplePt:"A cerejeira está florescendo.", icon:"🌸", color:"#ec4899"},
      {id:"fuji", x:80, y:22, label:"富士山", translation:"Monte Fuji", pronunciation:"fu-dji-san", example:"富士山は高いです。", examplePt:"O Monte Fuji é alto.", icon:"🗻", color:"#64748b"},
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
      {id:"sky", x:65, y:18, label:"Skyscraper", translation:"Arranha-céu", pronunciation:"SCAI-screi-per", example:"The skyscraper is tall.", examplePt:"O arranha-céu é alto.", icon:"🏙️", color:"#6366f1"},
      {id:"taxi", x:40, y:72, label:"Taxi", translation:"Táxi", pronunciation:"TÆK-si", example:"I need a taxi.", examplePt:"Preciso de um táxi.", icon:"🚕", color:"#eab308"},
      {id:"bridge", x:20, y:45, label:"Bridge", translation:"Ponte", pronunciation:"BRIDJ", example:"The bridge is long.", examplePt:"A ponte é longa.", icon:"🌉", color:"#94a3b8"},
      {id:"park", x:55, y:58, label:"Park", translation:"Parque", pronunciation:"PAARK", example:"The park is green.", examplePt:"O parque é verde.", icon:"🌳", color:"#22c55e"},
      {id:"hotdog", x:30, y:78, label:"Hot Dog", translation:"Cachorro-quente", pronunciation:"HOT-dog", example:"I eat a hot dog.", examplePt:"Eu como um cachorro-quente.", icon:"🌭", color:"#f97316"},
      {id:"subway", x:75, y:80, label:"Subway", translation:"Metrô", pronunciation:"SÂB-wei", example:"Take the subway.", examplePt:"Pegue o metrô.", icon:"🚇", color:"#8b5cf6"},
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
      {id:"cuchillo", x:35, y:55, label:"Cuchillo", translation:"Faca", pronunciation:"ku-TCHI-lho", example:"El cuchillo es afilado.", examplePt:"A faca é afiada.", icon:"🔪", color:"#dc2626"},
      {id:"plato", x:60, y:80, label:"Plato", translation:"Prato", pronunciation:"PLA-to", example:"El plato está en la mesa.", examplePt:"O prato está na mesa.", icon:"🍽️", color:"#7c3aed"},
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
      {id:"pasta", x:50, y:65, label:"Massa", translation:"Pasta", pronunciation:"MA-ssa", example:"A massa está deliciosa.", examplePt:"A massa está deliciosa.", icon:"🍝", color:"#f59e0b"},
      {id:"vino", x:25, y:45, label:"Vinho", translation:"Wine", pronunciation:"VI-nho", example:"O vinho é tinto.", examplePt:"O vinho é tinto.", icon:"🍷", color:"#dc2626"},
      {id:"tavolo", x:65, y:75, label:"Mesa", translation:"Table", pronunciation:"ME-za", example:"A mesa está limpa.", examplePt:"A mesa está limpa.", icon:"🪑", color:"#a16207"},
      {id:"candela", x:45, y:35, label:"Vela", translation:"Candle", pronunciation:"VE-la", example:"A vela ilumina a mesa.", examplePt:"A vela ilumina a mesa.", icon:"🕯️", color:"#eab308"},
      {id:"menu", x:80, y:40, label:"Cardápio", translation:"Menu", pronunciation:"kar-DA-piu", example:"O cardápio tem muitas opções.", examplePt:"O cardápio tem muitas opções.", icon:"📋", color:"#6366f1"},
      {id:"cameriere", x:15, y:30, label:"Garçom", translation:"Waiter", pronunciation:"gar-sõ", example:"O garçom é muito atencioso.", examplePt:"O garçom é muito atencioso.", icon:"🧑‍🍳", color:"#0891b2"},
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
      {id:"luggage", x:30, y:70, label:"Luggage", translation:"Bagagem", pronunciation:"LÆG-idj", example:"My luggage is heavy.", examplePt:"Minha bagagem é pesada.", icon:"🧳", color:"#f59e0b"},
      {id:"passport", x:50, y:55, label:"Passport", translation:"Passaporte", pronunciation:"PÆS-port", example:"Show your passport.", examplePt:"Mostre seu passaporte.", icon:"📘", color:"#0ea5e9"},
      {id:"plane", x:75, y:20, label:"Airplane", translation:"Avião", pronunciation:"EYR-pleyn", example:"The airplane is landing.", examplePt:"O avião está pousando.", icon:"✈️", color:"#94a3b8"},
      {id:"screen", x:20, y:35, label:"Screen", translation:"Tela", pronunciation:"SKREEN", example:"Check the screen.", examplePt:"Verifique a tela.", icon:"📺", color:"#8b5cf6"},
      {id:"security", x:45, y:80, label:"Security", translation:"Segurança", pronunciation:"si-KYUR-iti", example:"Pass through security.", examplePt:"Passe pela segurança.", icon:"🔒", color:"#dc2626"},
    ]
  },
  {
    id:"hotel", name:"Hotel de Luxo", nameEn:"Luxury Hotel", flag:"🏨",
    bgImage:"/manus-storage/scene_hotel_8fff9928.jpg",
    teacherImage:"/manus-storage/prof_giulia_f8adfeb6.png",
    teacherName:"Giulia", teacherLang:"en-US", langCode:"en", teacherGender:"female",
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
      {id:"chiave", x:65, y:45, label:"Chiave", translation:"Chave", pronunciation:"KIA-ve", example:"Ecco la chiave della camera.", examplePt:"Aqui está a chave do quarto.", icon:"🗝️", color:"#eab308"},
      {id:"ascensore", x:80, y:35, label:"Ascensore", translation:"Elevador", pronunciation:"a-shen-SO-re", example:"L'ascensore è a destra.", examplePt:"O elevador fica à direita.", icon:"🛗", color:"#6366f1"},
      {id:"piscina", x:20, y:40, label:"Piscina", translation:"Piscina", pronunciation:"pi-SHI-na", example:"La piscina è grande.", examplePt:"A piscina é grande.", icon:"🏊", color:"#0ea5e9"},
      {id:"camera", x:55, y:25, label:"Camera", translation:"Quarto", pronunciation:"KA-me-ra", example:"La camera è al terzo piano.", examplePt:"O quarto fica no terceiro andar.", icon:"🛏️", color:"#8b5cf6"},
      {id:"ristorante", x:30, y:75, label:"Ristorante", translation:"Restaurante", pronunciation:"ris-to-RAN-te", example:"Il ristorante apre alle sette.", examplePt:"O restaurante abre às sete.", icon:"🍽️", color:"#dc2626"},
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
    teacherName:"Sophie", teacherLang:"en-US", langCode:"en",
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
      {id:"banc", x:55, y:65, label:"Banc", translation:"Banco", pronunciation:"BON", example:"Assieds-toi sur le banc.", examplePt:"Sente-se no banco.", icon:"🪑", color:"#a16207"},
      {id:"fontaine", x:70, y:45, label:"Fontaine", translation:"Fonte", pronunciation:"fon-TEN", example:"La fontaine est belle.", examplePt:"A fonte é bonita.", icon:"⛲", color:"#0ea5e9"},
      {id:"fleur2", x:35, y:72, label:"Fleur", translation:"Flor", pronunciation:"FLÖR", example:"La fleur est rouge.", examplePt:"A flor é vermelha.", icon:"🌹", color:"#dc2626"},
      {id:"chemin", x:50, y:80, label:"Chemin", translation:"Caminho", pronunciation:"SHMEN", example:"Le chemin est long.", examplePt:"O caminho é longo.", icon:"🛤️", color:"#f59e0b"},
      {id:"oiseau", x:80, y:20, label:"Oiseau", translation:"Pássaro", pronunciation:"wa-ZO", example:"L'oiseau chante.", examplePt:"O pássaro canta.", icon:"🐦", color:"#2563eb"},
    ]
  },
  {
    id:"mountain", name:"Montanha Nevada", nameEn:"Snowy Mountain", flag:"🏔️",
    bgImage:"/manus-storage/scene_mountain_531032d0.jpg",
    teacherImage:"/manus-storage/prof_hans_62b758a6.png",
    teacherName:"Hans", teacherLang:"en-US", langCode:"en", teacherGender:"male",
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
      {id:"gipfel", x:50, y:15, label:"Gipfel", translation:"Cume", pronunciation:"GIP-fel", example:"Der Gipfel ist schneebedeckt.", examplePt:"O cume está coberto de neve.", icon:"🏔️", color:"#94a3b8"},
      {id:"schnee", x:35, y:35, label:"Schnee", translation:"Neve", pronunciation:"SHNEY", example:"Der Schnee ist weiß.", examplePt:"A neve é branca.", icon:"❄️", color:"#e2e8f0"},
      {id:"wald2", x:20, y:55, label:"Wald", translation:"Floresta", pronunciation:"VALT", example:"Der Wald ist dunkel.", examplePt:"A floresta é escura.", icon:"🌲", color:"#16a34a"},
      {id:"fels", x:70, y:45, label:"Fels", translation:"Rocha", pronunciation:"FELS", example:"Der Fels ist hart.", examplePt:"A rocha é dura.", icon:"🪨", color:"#78716c"},
      {id:"wolke", x:75, y:18, label:"Wolke", translation:"Nuvem", pronunciation:"VOL-ke", example:"Die Wolke ist weiß.", examplePt:"A nuvem é branca.", icon:"☁️", color:"#94a3b8"},
      {id:"adler", x:85, y:30, label:"Adler", translation:"Águia", pronunciation:"AA-dler", example:"Der Adler fliegt hoch.", examplePt:"A águia voa alto.", icon:"🦅", color:"#a16207"},
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
      {id:"camel", x:30, y:45, label:"جمل", translation:"Camelo", pronunciation:"jamal", example:"الجمل حيوان الصحراء.", examplePt:"O camelo é o animal do deserto.", icon:"🐪", color:"#a16207"},
      {id:"sun2", x:70, y:15, label:"شمس", translation:"Sol", pronunciation:"SHAMS", example:"الشمس حارة جداً.", examplePt:"O sol está muito quente.", icon:"☀️", color:"#eab308"},
      {id:"oasis", x:20, y:55, label:"واحة", translation:"Oásis", pronunciation:"WA-ha", example:"الواحة في الصحراء.", examplePt:"O oásis fica no deserto.", icon:"🌴", color:"#22c55e"},
      {id:"dune", x:75, y:55, label:"كثيب", translation:"Duna", pronunciation:"ka-THIIB", example:"الكثيب رملي.", examplePt:"A duna é de areia.", icon:"🏔️", color:"#d97706"},
      {id:"star", x:85, y:20, label:"نجمة", translation:"Estrela", pronunciation:"najma", example:"النجمة تلمع.", examplePt:"A estrela brilha.", icon:"⭐", color:"#fbbf24"},
    ]
  },
  {
    id:"farm", name:"Fazenda Campestre", nameEn:"Country Farm", flag:"🌾",
    bgImage:"/manus-storage/scene_farm_2fb3b2ba.jpg",
    teacherImage:"/manus-storage/prof_maja_860515c8.png",
    teacherName:"Maja", teacherLang:"en-US", langCode:"en", teacherGender:"female",
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
    teacherName:"Giulia", teacherLang:"en-US", langCode:"en", teacherGender:"female",
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
    teacherName:"Emre", teacherLang:"en-US", langCode:"en", teacherGender:"male",
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
    teacherName:"Maja", teacherLang:"en-US", langCode:"en", teacherGender:"female",
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
    teacherName:"Ivan", teacherLang:"en-US", langCode:"en", teacherGender:"male",
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
    teacherName:"Sophie", teacherLang:"en-US", langCode:"en",
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
    teacherName:"Giulia", teacherLang:"en-US", langCode:"en", teacherGender:"female",
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
    teacherName:"Hans", teacherLang:"en-US", langCode:"en", teacherGender:"male",
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
    difficulty:"beginner", premium:false,
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
      {id:"tv", x:60, y:40, label:"Television", translation:"Televisão", pronunciation:"te-li-VI-zhon", example:"We watch TV together.", examplePt:"Assistimos TV juntos.", icon:"📺", color:"#1d4ed8"},
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
    difficulty:"beginner", premium:false,
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

// ─── Teacher Component ─────────────────────────────────────────────────────────
function TeacherAvatar({
  scene,
  greeting,
  showGreeting,
  isSpeaking,
  spokenText,
  audioViseme,
  overrideName,
  overrideImage,
}: {
  scene: Scene;
  greeting: string;
  showGreeting: boolean;
  isSpeaking?: boolean;
  spokenText?: string;
  audioViseme?: VisemeData | null;
  overrideName?: string;
  overrideImage?: string;
}) {
  const { viseme, mouthStyle } = useVisemeSequence(spokenText || greeting, Boolean(isSpeaking));
  const synchronizedMouthStyle = audioViseme
    ? {
        width: `${Math.max(7, audioViseme.mouthWidth * 0.22)}%`,
        height: `${Math.max(2, audioViseme.mouthHeight * 0.22)}%`,
        borderRadius: `${Math.max(38, 48 + audioViseme.lipRound * 0.25)}%`,
      }
    : mouthStyle;
  return (
    <div
      className="absolute bottom-0 right-4 flex flex-col items-center z-30"
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
          animation: isSpeaking
            ? "teacher-talk 1.2s ease-in-out infinite, head-sway 3s ease-in-out infinite"
            : (scene.teacherAnimation
              ? `${scene.teacherAnimation} 4s ease-in-out infinite, teacher-breathe 4s ease-in-out infinite`
              : "teacher-breathe 4s ease-in-out infinite, head-sway 5s ease-in-out infinite"),
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
        {/* Mouth animation overlay — visible when speaking */}
        {isSpeaking && (
          <div
            style={{
              position: "absolute",
              top: "35%",
              left: "50%",
              transform: "translateX(-50%)",
              ...synchronizedMouthStyle,
              background: "rgba(139,69,69,0.3)",
              transition: "width 75ms linear, height 75ms linear, border-radius 75ms linear",
              pointerEvents: "none",
            }}
            aria-label={audioViseme ? "Viseme sincronizado ao áudio" : `Viseme ${viseme}`}
          />
        )}
        {/* Hand gesture overlay — visible when explaining */}
        {isSpeaking && (
          <div
            style={{
              position: "absolute",
              bottom: "15%",
              right: "10%",
              width: "15%",
              height: "20%",
              background: "rgba(255,255,255,0.1)",
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.15)",
              animation: "hand-gesture 2s ease-in-out infinite",
              pointerEvents: "none",
            }}
          />
        )}
        {/* Lip-sync sound bars — visible when speaking */}
        {isSpeaking && (
          <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1"
            style={{ background: "rgba(0,0,0,0.5)", borderRadius: 8, padding: "4px 8px" }}
          >
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  width: "4px",
                  height: "16px",
                  background: "#a78bfa",
                  borderRadius: "2px",
                  animation: `sound-bar 0.25s ease-in-out infinite alternate`,
                  animationDelay: `${i * 0.07}s`,
                }}
              />
            ))}
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
}: {
  hotspot: Hotspot;
  langCode: string;
  nativeLang: string;
  nativeLangFlag: string;
  onClose: () => void;
  onSpeak: (text: string, lang: string) => void;
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
          <span style={{ fontSize: "1.6rem" }}>{hotspot.icon}</span>
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

  // Auto-select scene based on user's target language from LanguageContext profile
  const getInitialScene = (): Scene | null => {
    try {
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
        // Prefer beginner difficulty scene for the target language (first lesson should be easy)
        const beginnerMatch = IMMERSIVE_SCENES.find(s => (s.langCode === base || s.teacherLang.startsWith(base)) && s.difficulty === "beginner");
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
  const sceneInitialized = useRef(false); // Track if scene was auto-initialized from targetLang

  // ── Native + Target from LanguageContext (single source of truth) ──
  const nativeLang = profile.nativeCode || "pt-BR";
  const nativeLangInfo = LANG_LABELS[nativeLang] || { flag: "🌐", name: "Nativo" };
  // Always derive targetLang from profile (reactive to LanguageContext changes)
  const profileTarget = profile.targetCode || localStorage.getItem("ml_target_lang") || "en-US";
  const [targetLang, setTargetLang] = useState<string>(() => profileTarget);

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
  const handleSelectTargetLang = (code: string) => {
    setTargetLang(code);
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

  const [isSpeaking, setIsSpeaking] = useState(false);
  const ttsMut = trpc.tts.speak.useMutation();
  const googleTtsMut = trpc.ttsGoogle.generate.useMutation();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioViseme, setAudioViseme] = useState<VisemeData | null>(null);
  const handleAudioViseme = useCallback((viseme: VisemeData) => setAudioViseme(viseme), []);
  const { syncWithAudio, stop: stopVisemeSync } = useTTSVisemeSync(handleAudioViseme);

  const playTeacherAudio = useCallback(async (source: string, phrase: string, language: string, revokeOnEnd = false) => {
    const audio = new Audio(source);
    audioRef.current = audio;
    audio.onplay = () => setIsSpeaking(true);
    audio.onended = () => {
      stopVisemeSync();
      setAudioViseme(null);
      setIsSpeaking(false);
      if (revokeOnEnd) URL.revokeObjectURL(source);
    };
    audio.onerror = () => {
      stopVisemeSync();
      setAudioViseme(null);
      setIsSpeaking(false);
      if (revokeOnEnd) URL.revokeObjectURL(source);
    };
    syncWithAudio(audio, phrase, language);
    await audio.play();
  }, [stopVisemeSync, syncWithAudio]);

  // Speak using Microsoft Neural TTS (server) — fallback to browser speech
  const speak = useCallback(async (text: string, lang: string, _rate?: number, gender?: 'male' | 'female') => {
    if (!text?.trim()) return;
    // Stop any currently playing audio
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    stopEdgeTTS();
    const teacherGender = gender || (selectedScene?.teacherGender === 'male' ? 'male' : 'female');
    try {
      const googleAudio = await googleTtsMut.mutateAsync({
        text: text.slice(0, 500),
        languageCode: lang,
        gender: teacherGender === "male" ? "MALE" : "FEMALE",
      });
      if (googleAudio.audioUrl) {
        await playTeacherAudio(googleAudio.audioUrl, text, lang);
        return;
      }
    } catch { /* Preserve the existing neural-TTS fallback. */ }
    try {
      const r = await ttsMut.mutateAsync({ text: text.slice(0, 500), voiceLang: lang, gender: teacherGender });
      if (r.success && r.audioBase64) {
        const bytes = Uint8Array.from(atob(r.audioBase64), c => c.charCodeAt(0));
        const url = URL.createObjectURL(new Blob([bytes], { type: "audio/mp3" }));
        await playTeacherAudio(url, text, lang, true);
        return;
      }
    } catch { /* fallback below */ }
    // Fallback: browser speech
    speakWithPreference(text, lang, {
      rate: 0.85,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
    });
  }, [googleTtsMut, playTeacherAudio, selectedScene?.teacherGender, ttsMut]);

  const [showGreeting, setShowGreeting] = useState(true);
  const [greetingText, setGreetingText] = useState("");
  const [particles, setParticles] = useState(false);
  const [score, setScore] = useState(0);
  const [learnedWords, setLearnedWords] = useState<Set<string>>(() => new Set<string>());
  const [filter, setFilter] = useState<"all" | "beginner" | "intermediate" | "advanced">("all");
  const [search, setSearch] = useState("");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  // Notebook state
  const [notebookOpen, setNotebookOpen] = useState(false);
  const [notebookCount, setNotebookCount] = useState(() => loadNotebook().length);
  // Pareto Panel state
  const [paretoOpen, setParetoOpen] = useState(false);
  // ── Native language label for dialog panel ──
  const nativeLangLabel = (() => {
    const code = (nativeLang || 'pt-BR').split('-')[0].toLowerCase();
    const labels: Record<string, string> = { pt: 'PT', en: 'EN', es: 'ES', fr: 'FR', de: 'DE', it: 'IT', ja: 'JA', zh: 'ZH', ko: 'KO', ru: 'RU', ar: 'AR' };
    return labels[code] || code.toUpperCase();
  })();
  // Returns the best available translation for a dialog line based on native language
  const getDlgTranslation = (line: DialogLine): string => {
    const code = (nativeLang || 'pt-BR').split('-')[0].toLowerCase();
    // Use textPt for Portuguese natives; for others, show the target text with a 'Translation:' prefix
    if (code === 'pt') return line.textPt || '';
    // For EN natives learning another language: show English translation if available
    // textPt is always Portuguese — for non-PT natives we show it as context with lang label
    return line.textPt ? `[${nativeLangLabel}] ${line.textPt}` : '';
  };

  // ── Dialog Panel (scrolling text + exercises) ──
  const [dlgOpen, setDlgOpen] = useState(false);
  const [dlgStep, setDlgStep] = useState(0);
  const [dlgWords, setDlgWords] = useState<string[]>([]);
  const [dlgWordIdx, setDlgWordIdx] = useState(0);
  const [dlgAnswer, setDlgAnswer] = useState<number | null>(null);
  const dlgTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startDialog = useCallback((scene: Scene) => {
    setDlgOpen(true); setDlgStep(0); setDlgAnswer(null);
    const line = scene.dialog[0];
    if (line?.speaker === 'teacher') {
      const words = line.text.split(' ');
      setDlgWords(words); setDlgWordIdx(0);
      speak(line.text, scene.teacherLang);
    } else { setDlgWords([]); setDlgWordIdx(0); }
  }, [speak]);
  useEffect(() => {
    if (!dlgOpen || dlgWords.length === 0 || dlgWordIdx >= dlgWords.length) return;
    dlgTimerRef.current = setTimeout(() => setDlgWordIdx(i => i + 1), 300);
    return () => { if (dlgTimerRef.current) clearTimeout(dlgTimerRef.current); };
  }, [dlgOpen, dlgWords, dlgWordIdx]);
  const dlgNext = useCallback(() => {
    if (!selectedScene) return;
    const next = dlgStep + 1;
    if (next >= selectedScene.dialog.length) { setDlgOpen(false); return; }
    setDlgStep(next); setDlgAnswer(null);
    const line = selectedScene.dialog[next];
    if (line.speaker === 'teacher') {
      const words = line.text.split(' ');
      setDlgWords(words); setDlgWordIdx(0);
      speak(line.text, selectedScene.teacherLang);
    } else { setDlgWords([]); setDlgWordIdx(0); }
  }, [dlgStep, selectedScene, speak]);
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
    setActiveHotspot(null);
    setShowGreeting(true);
    setGreetingText(scene.greetingPt);
    setParticles(false);
    setTimeout(() => setShowGreeting(false), 6000);
  }, []);

  const handleHotspotClick = useCallback((hotspot: Hotspot) => {
    if (!selectedScene) return;
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
    setGreetingText(`${hotspot.label} — ${hotspot.translation}`);
    setShowGreeting(true);
    // Speak in target language (student's chosen language), then in native language
    // targetLang is the BCP-47 code the user selected (e.g. 'pt-BR', 'en-US', 'es-ES')
    speak(hotspot.label, targetLang || effectiveSpeakLang(selectedScene));
    setTimeout(() => speak(hotspot.translation, nativeLang), 1800);
    setTimeout(() => setShowGreeting(false), 5000);
  }, [selectedScene, learnedWords, speak, nativeLang]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width - 0.5,
      y: (e.clientY - rect.top) / rect.height - 0.5,
    });
  }, []);

  const filteredScenes = IMMERSIVE_SCENES.filter(s => {
    if (filter !== "all" && s.difficulty !== filter) return false;
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

  const difficultyColor = (d: string) =>
    d === "beginner" ? "#22c55e" : d === "intermediate" ? "#f59e0b" : "#ef4444";
  const difficultyLabel = (d: string) =>
    d === "beginner" ? "A1-A2 · Iniciante" : d === "intermediate" ? "B1-B2 · Intermediário" : "C1-C2 · Avançado";

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

        {/* Turquoise net overlay for Tropical Beach scene — the fishing net is part of the background image */}
        {/* Positioned at bottom-left area where the net typically appears in beach scenes */}
        {selectedScene.id === "beach" && (
          <div
            style={{
              position: "absolute",
              left: "2%",
              bottom: "15%",
              width: "28%",
              height: "35%",
              pointerEvents: "none",
              zIndex: 2,
              // Net pattern using CSS — turquoise/teal color
              backgroundImage: `
                linear-gradient(rgba(20,184,166,0.55) 2px, transparent 2px),
                linear-gradient(90deg, rgba(20,184,166,0.55) 2px, transparent 2px)
              `,
              backgroundSize: "18px 18px",
              borderRadius: "4px",
              // Subtle glow
              filter: "drop-shadow(0 0 8px rgba(20,184,166,0.7))",
            }}
          />
        )}

        {/* Top HUD */}
        <div
          className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 z-40"
          style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)" }}
        >
          <button
            onClick={() => { stopEdgeTTS(); setLocation("/"); }}
            className="flex items-center gap-2 text-white font-semibold px-3 py-1.5 rounded-full"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)" }}
          >
            ← Voltar
          </button>
          <div className="flex items-center gap-2 text-white font-bold" style={{ fontSize: "clamp(13px, 1.8vw, 18px)" }}>
            <span>{selectedScene.flag}</span>
            <span>{immersionMode ? selectedScene.nameEn : selectedScene.name}</span>
          </div>
          <div className="flex items-center gap-2">
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
                  <div style={{ fontSize: 11, color: "#a78bfa", fontWeight: 700, padding: "4px 8px 8px", textTransform: "uppercase", letterSpacing: 1 }}>Estudar idioma</div>
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
            {/* Voice selector compact button */}
            <VoiceSelector
              langCode={targetLang || effectiveLang(selectedScene)}
              langName={currentLangInfo.name || selectedScene.name}
              compact
            />
            <ImmersionModeToggle compact />
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
            <div
              className="text-white px-3 py-1.5 rounded-full"
              style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", fontSize: "clamp(11px, 1.3vw, 14px)" }}
            >
              {learnedWords.size}/{selectedScene.hotspots.length}
            </div>
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
                {learned ? "✓" : hotspot.icon}
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
                {getHotspotLabel(hotspot.id, hotspot.label, effectiveLang(selectedScene))}
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
              onSpeak={speak}
            />
          </div>
        )}

        {/* Particles */}
        <Particles active={particles} />

        {/* Teacher */}
        <TeacherAvatar
          scene={selectedScene}
          greeting={greetingText}
          showGreeting={showGreeting}
          isSpeaking={isSpeaking}
          spokenText={greetingText}
          audioViseme={audioViseme}
          overrideName={getTeacherForLang(targetLang, { name: selectedScene.teacherName, image: selectedScene.teacherImage }).name}
          overrideImage={getTeacherForLang(targetLang, { name: selectedScene.teacherName, image: selectedScene.teacherImage }).image}
        />

        {/* ── Dialog Panel: scrolling text + exercises ── */}
        {!dlgOpen && (
          <button
            onClick={(e) => { e.stopPropagation(); startDialog(selectedScene); }}
            className="absolute z-50 flex items-center gap-2 text-white font-semibold px-4 py-2 rounded-full"
            style={{
              bottom: "100px", left: "50%", transform: "translateX(-50%)",
              background: "rgba(99,102,241,0.85)", backdropFilter: "blur(8px)",
              border: "1px solid rgba(99,102,241,0.6)", fontSize: "clamp(12px,1.4vw,15px)",
              boxShadow: "0 4px 20px rgba(99,102,241,0.4)",
            }}
          >
            💬 Iniciar Diálogo
          </button>
        )}
        {dlgOpen && selectedScene.dialog[dlgStep] && (
          <div
            className="absolute left-0 right-0 z-50"
            style={{
              bottom: "60px",
              padding: "0 clamp(8px,2vw,24px)",
              paddingRight: "clamp(130px,20vw,240px)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                background: "rgba(0,0,0,0.82)",
                backdropFilter: "blur(12px)",
                borderRadius: "16px",
                border: "1px solid rgba(255,255,255,0.12)",
                padding: "16px 20px",
              }}
            >
              {/* Speaker label */}
              <div className="flex items-center gap-2 mb-2">
                <span style={{ fontSize: "11px", fontWeight: 700, color: selectedScene.dialog[dlgStep].speaker === 'teacher' ? '#818cf8' : '#34d399', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {selectedScene.dialog[dlgStep].speaker === 'teacher' ? `🏫 ${selectedScene.teacherName}` : '👤 Você'}
                </span>
{getDlgTranslation(selectedScene.dialog[dlgStep]) && (
                  <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)" }}>
                    — {getDlgTranslation(selectedScene.dialog[dlgStep])}
                  </span>
                )}
              </div>
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
                        if (correct) speak('✅ ' + opt, selectedScene.teacherLang);
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
                </div>
              )}
              {/* Continue button for teacher lines */}
              {selectedScene.dialog[dlgStep].speaker === 'teacher' && dlgWordIdx >= dlgWords.length && (
                <button
                  onClick={dlgNext}
                  style={{ marginTop: '12px', padding: '8px 20px', borderRadius: '8px', background: 'rgba(99,102,241,0.7)', color: '#fff', fontWeight: 600, fontSize: '14px', border: '1px solid rgba(99,102,241,0.5)', cursor: 'pointer' }}
                >
                  Continuar →
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
          className="absolute left-0 right-0 flex items-center justify-between px-4 py-3 z-50"
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
              setActiveHotspot(null);
              setLearnedWords(new Set());
              setShowGreeting(true);
              setGreetingText(next.greetingPt);
              setTimeout(() => setShowGreeting(false), 6000);
            }}
            className="flex items-center gap-2 text-white font-semibold px-4 py-2 rounded-full btn-press"
            style={{ background: "rgba(99,102,241,0.8)", backdropFilter: "blur(8px)", border: "1px solid rgba(99,102,241,0.5)", fontSize: "clamp(11px, 1.3vw, 14px)" }}
          >
            Próxima →
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
          {(["all", "beginner", "intermediate", "advanced"] as const).map((f) => (
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
              {f === "all" ? "Todos" : f === "beginner" ? "A1-A2 Iniciante" : f === "intermediate" ? "B1-B2 Médio" : "C1-C2 Avançado"}
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
                style={{ background: difficultyColor(scene.difficulty), fontSize: "clamp(8px, 1vw, 11px)" }}
              >
                {difficultyLabel(scene.difficulty)}
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
