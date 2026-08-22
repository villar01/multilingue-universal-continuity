import { publicProcedure, router } from "./_core/trpc";

export const DEMO_BEACH_MAX_INTERACTIONS = 3;

const BEACH_DEMO_TURNS = [
  { teacher: "Hello! Welcome to the tropical beach.", translation: "Olá! Bem-vindo à praia tropical.", response: "Hello, James! The beach is beautiful." },
  { teacher: "Look at the ocean. The water is blue.", translation: "Olhe para o oceano. A água é azul.", response: "The ocean is blue and beautiful." },
  { teacher: "Excellent! You used two new words with confidence.", translation: "Excelente! Você usou duas palavras novas com confiança.", response: "Thank you, James!" },
] as const;

/** Amostra deliberadamente pequena; o diálogo canônico integral permanece protegido. */
export const beachDemoRouter = router({
  getSample: publicProcedure.query(() => ({
    scene: {
      id: "beach-demo",
      title: "Praia Tropical",
      teacherName: "James",
      teacherVoiceLanguage: "en-US",
      teacherVoiceGender: "male" as const,
      backgroundImage: "/manus-storage/scene_beach_b760e0e7.jpg",
      teacherImage: "/manus-storage/prof_james_b9f2fff7.png",
    },
    maxInteractions: DEMO_BEACH_MAX_INTERACTIONS,
    turns: BEACH_DEMO_TURNS,
  })),
});
