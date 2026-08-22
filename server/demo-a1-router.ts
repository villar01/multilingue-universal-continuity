import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";

export type DemoA1Lesson = {
  number: number;
  title: string;
  objective: string;
  vocabulary: readonly { english: string; portuguese: string; example: string }[];
  dialogue: readonly { speaker: "James" | "Aluno"; text: string; translation: string }[];
  practicePrompt: string;
};

/** Conteúdo demonstrativo mantido apenas no servidor. */
export const DEMO_A1_LESSONS: readonly DemoA1Lesson[] = [
  { number: 1, title: "Cumprimentar e despedir-se", objective: "Usar saudações simples com segurança.", vocabulary: [{ english: "Hello", portuguese: "Olá", example: "Hello, James." }, { english: "Goodbye", portuguese: "Tchau / Adeus", example: "Goodbye, see you soon." }], dialogue: [{ speaker: "James", text: "Hello! How are you?", translation: "Olá! Como você está?" }, { speaker: "Aluno", text: "I am well, thank you.", translation: "Estou bem, obrigado/a." }], practicePrompt: "Diga: Hello! I am well." },
  { number: 2, title: "Apresentar-se", objective: "Dizer nome e origem em uma frase curta.", vocabulary: [{ english: "My name is", portuguese: "Meu nome é", example: "My name is Ana." }, { english: "I am from", portuguese: "Eu sou de", example: "I am from Brazil." }], dialogue: [{ speaker: "James", text: "What is your name?", translation: "Qual é o seu nome?" }, { speaker: "Aluno", text: "My name is Ana. I am from Brazil.", translation: "Meu nome é Ana. Eu sou do Brasil." }], practicePrompt: "Monte: My name is ___. I am from Brazil." },
  { number: 3, title: "Perguntas essenciais", objective: "Perguntar e responder onde alguém mora.", vocabulary: [{ english: "Where", portuguese: "Onde", example: "Where do you live?" }, { english: "I live", portuguese: "Eu moro", example: "I live in São Paulo." }], dialogue: [{ speaker: "James", text: "Where do you live?", translation: "Onde você mora?" }, { speaker: "Aluno", text: "I live in São Paulo.", translation: "Eu moro em São Paulo." }], practicePrompt: "Responda: I live in ___." },
  { number: 4, title: "Pessoas e família", objective: "Falar de relações familiares básicas.", vocabulary: [{ english: "mother", portuguese: "mãe", example: "My mother is kind." }, { english: "brother", portuguese: "irmão", example: "I have one brother." }], dialogue: [{ speaker: "James", text: "Do you have brothers or sisters?", translation: "Você tem irmãos ou irmãs?" }, { speaker: "Aluno", text: "Yes, I have one brother.", translation: "Sim, eu tenho um irmão." }], practicePrompt: "Descreva uma pessoa da sua família." },
  { number: 5, title: "Rotina diária", objective: "Usar verbos simples para falar da manhã.", vocabulary: [{ english: "wake up", portuguese: "acordar", example: "I wake up at seven." }, { english: "work", portuguese: "trabalhar", example: "I work in the morning." }], dialogue: [{ speaker: "James", text: "What time do you wake up?", translation: "A que horas você acorda?" }, { speaker: "Aluno", text: "I wake up at seven.", translation: "Eu acordo às sete." }], practicePrompt: "Conte uma ação da sua rotina." },
  { number: 6, title: "Comida e preferências", objective: "Pedir algo simples e dizer do que gosta.", vocabulary: [{ english: "I would like", portuguese: "Eu gostaria de", example: "I would like water, please." }, { english: "I like", portuguese: "Eu gosto de", example: "I like fruit." }], dialogue: [{ speaker: "James", text: "What would you like?", translation: "O que você gostaria?" }, { speaker: "Aluno", text: "I would like water, please.", translation: "Eu gostaria de água, por favor." }], practicePrompt: "Faça um pedido educado." },
  { number: 7, title: "Lugares da cidade", objective: "Identificar destinos cotidianos.", vocabulary: [{ english: "school", portuguese: "escola", example: "The school is near." }, { english: "market", portuguese: "mercado", example: "The market is open." }], dialogue: [{ speaker: "James", text: "Where is the market?", translation: "Onde fica o mercado?" }, { speaker: "Aluno", text: "The market is near the school.", translation: "O mercado fica perto da escola." }], practicePrompt: "Indique um lugar da sua cidade." },
  { number: 8, title: "Números e compras", objective: "Usar números em uma compra curta.", vocabulary: [{ english: "one", portuguese: "um", example: "I need one ticket." }, { english: "price", portuguese: "preço", example: "What is the price?" }], dialogue: [{ speaker: "James", text: "How many tickets do you need?", translation: "De quantos bilhetes você precisa?" }, { speaker: "Aluno", text: "I need one ticket, please.", translation: "Eu preciso de um bilhete, por favor." }], practicePrompt: "Peça um item usando um número." },
  { number: 9, title: "Direções simples", objective: "Entender referências de localização.", vocabulary: [{ english: "left", portuguese: "esquerda", example: "Turn left here." }, { english: "right", portuguese: "direita", example: "The bank is on the right." }], dialogue: [{ speaker: "James", text: "Is the hotel on the left?", translation: "O hotel fica à esquerda?" }, { speaker: "Aluno", text: "No, it is on the right.", translation: "Não, ele fica à direita." }], practicePrompt: "Dê uma direção curta." },
  { number: 10, title: "Conversa A1 completa", objective: "Unir apresentação, rotina e pedido em uma conversa.", vocabulary: [{ english: "nice to meet you", portuguese: "prazer em conhecer você", example: "Nice to meet you, James." }, { english: "every day", portuguese: "todos os dias", example: "I study every day." }], dialogue: [{ speaker: "James", text: "Nice to meet you. Do you study every day?", translation: "Prazer em conhecer você. Você estuda todos os dias?" }, { speaker: "Aluno", text: "Yes, I study every day.", translation: "Sim, eu estudo todos os dias." }], practicePrompt: "Faça uma apresentação completa." },
] as const;

export const DEMO_A1_FREE_LIMIT = 3;

export function getDemoA1FreeLesson(lessonNumber: number): DemoA1Lesson | null {
  if (lessonNumber > DEMO_A1_FREE_LIMIT) return null;
  return DEMO_A1_LESSONS.find((lesson) => lesson.number === lessonNumber) ?? null;
}

export const demoA1Router = router({
  getPath: publicProcedure.query(() => ({
    totalLessons: DEMO_A1_LESSONS.length,
    freeLessons: DEMO_A1_FREE_LIMIT,
    lessons: DEMO_A1_LESSONS.map(({ number, title, objective }) => ({
      number,
      title,
      objective,
      available: number <= DEMO_A1_FREE_LIMIT,
    })),
  })),
  getFreeLesson: publicProcedure
    .input(z.object({ lessonNumber: z.number().int().min(1).max(DEMO_A1_LESSONS.length) }))
    .query(({ input }) => {
      const lesson = getDemoA1FreeLesson(input.lessonNumber);
      if (!lesson) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Esta etapa faz parte do percurso completo. Escolha um plano para continuar.",
        });
      }
      return lesson;
    }),
});
