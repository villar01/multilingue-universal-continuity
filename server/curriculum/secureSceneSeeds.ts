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
};

export function getSecureSceneSeed(sceneId: string): SecureSceneSeed | null {
  return SECURE_SCENE_SEEDS[sceneId] ?? null;
}
