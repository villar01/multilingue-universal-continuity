import type { DialogLine, Hotspot } from "../../shared/immersiveSceneTypes";

export type SecureSceneSeed = {
  dialog: DialogLine[];
  hotspots: Hotspot[];
};

/**
 * Canonical curriculum seeds live server-side. The beach seed is the first
 * migration slice; authenticated localization can use it without importing its
 * pedagogical text into a client-facing module.
 */
const SECURE_SCENE_SEEDS: Record<string, SecureSceneSeed> = {
  beach: {
    dialog: [
      { speaker: "teacher", text: "Hello! My name is James. Welcome to this beautiful tropical beach!", textPt: "Olá! Meu nome é James. Bem-vindo a esta linda praia tropical!" },
      { speaker: "user", text: "Hello James! The beach is amazing!", textPt: "Olá James! A praia é incrível!", options: ["Hello James! The beach is amazing!", "I don't like the beach.", "Where is the hotel?"], correctIndex: 0 },
      { speaker: "teacher", text: "Look at the ocean! In English we say 'ocean' or 'sea'. The water is blue.", textPt: "Olhe para o oceano! Em inglês dizemos 'ocean' ou 'sea'. A água é azul." },
      { speaker: "user", text: "The ocean is beautiful! And the sand is warm.", textPt: "O oceano é lindo! E a areia está quente.", options: ["The ocean is beautiful! And the sand is warm.", "I don't see the ocean.", "Where is the pool?"], correctIndex: 0 },
      { speaker: "teacher", text: "Perfect! Now look at the palm tree. In English: 'palm tree'. Can you repeat?", textPt: "Perfeito! Agora olhe para a palmeira. Em inglês: 'palm tree'. Você consegue repetir?" },
      { speaker: "user", text: "Palm tree! I can see the palm tree near the beach.", textPt: "Palm tree! Consigo ver a palmeira perto da praia.", options: ["Palm tree! I can see the palm tree near the beach.", "I don't know this word.", "Is that a coconut tree?"], correctIndex: 0 },
      { speaker: "teacher", text: "Excellent! Your English is great! Keep practicing every day!", textPt: "Excelente! Seu inglês está ótimo! Continue praticando todos os dias!" },
    ],
    hotspots: [
      { id: "palm", x: 79, y: 24, label: "Palm Tree", translation: "Palmeira", pronunciation: "PAAM-tree", example: "The palm tree is tall.", examplePt: "A palmeira é alta.", icon: "🌴", color: "#22c55e" },
      { id: "ocean", x: 24, y: 66, label: "Ocean", translation: "Oceano", pronunciation: "OH-shën", example: "The ocean is deep.", examplePt: "O oceano é profundo.", icon: "🌊", color: "#06b6d4" },
      { id: "wave", x: 38, y: 58, label: "Wave", translation: "Onda", pronunciation: "WEYV", example: "The wave is big.", examplePt: "A onda é grande.", icon: "🌊", color: "#14b8a6" },
      { id: "sand", x: 59, y: 82, label: "Sand", translation: "Areia", pronunciation: "SÆND", example: "The sand is warm.", examplePt: "A areia está quente.", icon: "🏖️", color: "#f59e0b" },
    ],
  },
  cafe: {
    dialog: [
      { speaker: "teacher", text: "Bonjour! Je m'appelle Sophie. Bienvenue au café! Que désirez-vous commander?", textPt: "Bom dia! Sou Sophie. Bem-vindo ao café! O que você gostaria de pedir?" },
      { speaker: "user", text: "Bonjour Sophie! Un café et un croissant, s'il vous plaît.", textPt: "Bom dia Sophie! Um café e um croissant, por favor.", options: ["Bonjour Sophie! Un café et un croissant, s'il vous plaît.", "Je ne veux rien.", "L'addition!"], correctIndex: 0 },
      { speaker: "teacher", text: "Très bon choix! Voulez-vous vous asseoir en terrasse? La vue est magnifique.", textPt: "Ótima escolha! Quer se sentar no terraço? A vista é magnífica." },
      { speaker: "user", text: "Oui, la terrasse est parfaite! Je vais lire le journal en attendant.", textPt: "Sim, o terraço é perfeito! Vou ler o jornal enquanto espero.", options: ["Oui, la terrasse est parfaite! Je vais lire le journal en attendant.", "Non, je préfère l'intérieur.", "Je n'ai pas le temps."], correctIndex: 0 },
      { speaker: "teacher", text: "Voici votre café et votre croissant! Le croissant est frais du matin.", textPt: "Aqui está seu café e seu croissant! O croissant é fresco da manhã." },
      { speaker: "user", text: "Merci beaucoup! C'est délicieux! L'addition, s'il vous plaît.", textPt: "Muito obrigado! Está delicioso! A conta, por favor.", options: ["Merci beaucoup! C'est délicieux! L'addition, s'il vous plaît.", "Je n'aime pas le croissant.", "C'est trop cher."], correctIndex: 0 },
      { speaker: "teacher", text: "Avec plaisir! Votre français est excellent. Revenez bientôt!", textPt: "Com prazer! Seu francês está excelente. Volte logo!" },
    ],
    hotspots: [
      { id: "cafe3", x: 40, y: 55, label: "Café", translation: "Café", pronunciation: "ka-FÉ", example: "Le café est chaud.", examplePt: "O café está quente.", icon: "☕", color: "#a16207" },
      { id: "croissant", x: 60, y: 65, label: "Croissant", translation: "Croissant", pronunciation: "krwa-SON", example: "Le croissant est frais.", examplePt: "O croissant é fresco da manhã.", icon: "🥐", color: "#f59e0b" },
      { id: "garcon", x: 25, y: 40, label: "Garçon", translation: "Garçom", pronunciation: "gar-SON", example: "Appelez le garçon.", examplePt: "Chame o garçom.", icon: "🧑‍🍳", color: "#6366f1" },
      { id: "terrasse", x: 70, y: 35, label: "Terrasse", translation: "Terraço", pronunciation: "te-RAS", example: "La terrasse est agréable.", examplePt: "O terraço é agradável.", icon: "🪑", color: "#22c55e" },
      { id: "journal", x: 50, y: 45, label: "Journal", translation: "Jornal", pronunciation: "zhur-NAL", example: "Je lis le journal.", examplePt: "Leio o jornal.", icon: "📰", color: "#0ea5e9" },
      { id: "addition", x: 80, y: 60, label: "Addition", translation: "Conta", pronunciation: "a-di-SION", example: "L'addition, s'il vous plaît.", examplePt: "A conta, por favor.", icon: "🧾", color: "#dc2626" },
    ],
  },
};

export function getSecureSceneSeed(sceneId: string): SecureSceneSeed | null {
  return SECURE_SCENE_SEEDS[sceneId] ?? null;
}
