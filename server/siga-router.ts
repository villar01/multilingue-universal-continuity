/**
 * SIGA — Sistema Inteligente de Gerenciamento e Aprimoramento
 * Motor: invokeLLM (Manus built-in, equivalente Claude) + Tavily AI (busca web)
 * Supervisor: Renato Villar (owner)
 */

import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "./_core/trpc";
import { getDb } from "./db";
import { sql } from "drizzle-orm";
import { tavilySearch, searchPedagogicalContent, searchSolution } from "./tavily";
import { notifyOwner } from "./_core/notification";
import { invokeLLM } from "./_core/llm";

// ─── Helpers ────────────────────────────────────────────────────────────────

async function getAppStatus() {
  const db = await getDb();
  const [lessonCount] = await db!.execute(sql`SELECT COUNT(*) as total FROM lessons`);
  const [exerciseCount] = await db!.execute(sql`SELECT COUNT(*) as total FROM exercises`);
  const [teacherCount] = await db!.execute(sql`SELECT COUNT(*) as total FROM virtual_teachers WHERE is_active = 1`);
  const [userCount] = await db!.execute(sql`SELECT COUNT(*) as total FROM users`);
  const [lessonsNoExercises] = await db!.execute(sql`
    SELECT COUNT(*) as total FROM lessons l
    WHERE NOT EXISTS (SELECT 1 FROM exercises e WHERE e.lessonId = l.id)
  `);
  const [teachersNoVoice] = await db!.execute(sql`
    SELECT COUNT(*) as total FROM virtual_teachers
    WHERE (voice_id IS NULL OR voice_id = '') AND is_active = 1
  `);
  const [trivialExercises] = await db!.execute(sql`
    SELECT COUNT(*) as total FROM exercises
    WHERE LOWER(TRIM(question)) = LOWER(TRIM(correctAnswer))
    OR correctAnswer IS NULL OR correctAnswer = ''
  `);
  const [genderMismatch] = await db!.execute(sql`
    SELECT COUNT(*) as total FROM virtual_teachers
    WHERE (gender = 'female' AND (name LIKE '%Jean%' OR name LIKE '%Carlos%' OR name LIKE '%Ricardo%' OR name LIKE '%Hans%'))
    OR (gender = 'male' AND (name LIKE '%Maria%' OR name LIKE '%Sofia%' OR name LIKE '%Emma%'))
  `);

  return {
    lessons: (((lessonCount as unknown) as any[])[0] as any)?.total ?? 0,
    exercises: (((exerciseCount as unknown) as any[])[0] as any)?.total ?? 0,
    teachers: (((teacherCount as unknown) as any[])[0] as any)?.total ?? 0,
    users: (((userCount as unknown) as any[])[0] as any)?.total ?? 0,
    lessonsWithoutExercises: (((lessonsNoExercises as unknown) as any[])[0] as any)?.total ?? 0,
    teachersWithoutVoice: (((teachersNoVoice as unknown) as any[])[0] as any)?.total ?? 0,
    trivialExercises: (((trivialExercises as unknown) as any[])[0] as any)?.total ?? 0,
    genderMismatch: (((genderMismatch as unknown) as any[])[0] as any)?.total ?? 0,
  };
}

// ─── Router ─────────────────────────────────────────────────────────────────

export const sigaRouter = router({

  // Status geral do app
  getStatus: protectedProcedure.query(async () => {
    const status = await getAppStatus();
    const issues: Array<{ type: string; description: string; severity: "critical" | "warning" | "info" }> = [];

    if (status.lessonsWithoutExercises > 0)
      issues.push({ type: "missing_exercises", description: `${status.lessonsWithoutExercises} lições sem exercícios`, severity: "critical" });
    if (status.teachersWithoutVoice > 0)
      issues.push({ type: "missing_voice", description: `${status.teachersWithoutVoice} professores sem voz TTS`, severity: "warning" });
    if (status.trivialExercises > 0)
      issues.push({ type: "trivial_exercises", description: `${status.trivialExercises} exercícios com respostas triviais`, severity: "critical" });
    if (status.genderMismatch > 0)
      issues.push({ type: "gender_mismatch", description: `${status.genderMismatch} professores com nome/gênero incompatível`, severity: "warning" });

    return {
      ...status,
      issues,
      health: issues.some(i => i.severity === "critical") ? "critical" : issues.length > 0 ? "warning" : "ok",
      llmEnabled: true, // invokeLLM sempre disponível
      tavilyEnabled: !!process.env.TAVILY_API_KEY,
    };
  }),

  // Diagnóstico inteligente com LLM + Tavily
  diagnose: protectedProcedure
    .input(z.object({
      problem: z.string().min(5).max(1000),
      context: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const status = await getAppStatus();

      // 1. Busca web com Tavily (se disponível)
      let webContext = "";
      if (process.env.TAVILY_API_KEY) {
        try {
          const webResult = await searchSolution(input.problem);
          if (webResult) webContext = `\n\nReferências web (Tavily):\n${webResult.slice(0, 600)}`;
        } catch (e) { /* ignora */ }
      }

      // 2. Diagnóstico com LLM (invokeLLM — equivalente Claude)
      const llmResponse = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `Você é o SIGA, sistema de diagnóstico do app MultiLingue Universal (plataforma de ensino de idiomas com IA).
Status atual do app: ${JSON.stringify(status, null, 2)}
Responda em português, de forma direta e técnica. Identifique a causa raiz, impacto e solução em 3 passos.${webContext}`,
          },
          {
            role: "user",
            content: `Problema reportado: ${input.problem}${input.context ? `\nContexto adicional: ${input.context}` : ""}`,
          },
        ],
      });

      const diagnosis = (llmResponse as any)?.choices?.[0]?.message?.content ?? "Diagnóstico não disponível";

      // 3. Notificar owner
      await notifyOwner({
        title: `🔍 SIGA: Diagnóstico — ${input.problem.slice(0, 60)}`,
        content: `**Problema:** ${input.problem}\n\n**Diagnóstico IA:**\n${diagnosis.slice(0, 800)}`,
      });

      return {
        diagnosis,
        webContext: webContext || null,
        status,
        diagnosedAt: new Date().toISOString(),
      };
    }),

  // Scan automático completo com LLM
  autoScan: protectedProcedure.mutation(async () => {
    const status = await getAppStatus();
    const problems: Array<{ type: string; description: string; count: number; severity: string }> = [];

    if (status.lessonsWithoutExercises > 0)
      problems.push({ type: "missing_exercises", description: `${status.lessonsWithoutExercises} lições sem exercícios`, count: status.lessonsWithoutExercises, severity: "critical" });
    if (status.teachersWithoutVoice > 0)
      problems.push({ type: "missing_voice", description: `${status.teachersWithoutVoice} professores sem voz TTS`, count: status.teachersWithoutVoice, severity: "warning" });
    if (status.trivialExercises > 0)
      problems.push({ type: "trivial_exercises", description: `${status.trivialExercises} exercícios triviais`, count: status.trivialExercises, severity: "critical" });
    if (status.genderMismatch > 0)
      problems.push({ type: "gender_mismatch", description: `${status.genderMismatch} professores com nome/gênero errado`, count: status.genderMismatch, severity: "warning" });

    // Análise inteligente com LLM se há problemas
    let aiAnalysis = null;
    if (problems.length > 0) {
      try {
        const llmResponse = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "Você é o SIGA, analisador do app MultiLingue Universal. Analise os problemas encontrados e priorize as correções. Seja direto e técnico. Responda em português.",
            },
            {
              role: "user",
              content: `Problemas encontrados no scan:\n${problems.map(p => `- [${p.severity.toUpperCase()}] ${p.description}`).join("\n")}\n\nStatus geral: ${JSON.stringify(status)}\n\nPriorize e sugira ações imediatas.`,
            },
          ],
        });
        aiAnalysis = (llmResponse as any)?.choices?.[0]?.message?.content ?? null;
      } catch (e) {
        aiAnalysis = "LLM temporariamente indisponível.";
      }
    }

    // Enriquecer com Tavily se disponível
    let tavilyInsight = null;
    if (process.env.TAVILY_API_KEY && problems.length > 0) {
      try {
        const topProblem = problems[0].description;
        const solution = await searchSolution(`language learning app fix: ${topProblem}`);
        if (solution) tavilyInsight = solution.slice(0, 400);
      } catch (e) { /* ignora */ }
    }

    // Notificar owner
    if (problems.length > 0) {
      await notifyOwner({
        title: `📊 SIGA: ${problems.length} problema(s) detectado(s)`,
        content: problems.map(p => `• [${p.severity}] ${p.description}`).join("\n")
          + (aiAnalysis ? `\n\n**Análise IA:**\n${aiAnalysis.slice(0, 600)}` : ""),
      });
    }

    return { problems, aiAnalysis, tavilyInsight, scannedAt: new Date().toISOString(), status };
  }),

  // Gerar exercícios com LLM para lições sem conteúdo
  generateExercises: protectedProcedure
    .input(z.object({
      lessonId: z.number(),
      count: z.number().min(1).max(10).default(5),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      const [lessonRows] = await db!.execute(sql`SELECT * FROM lessons WHERE id = ${input.lessonId}`);
      const lesson = (lessonRows as any)?.[0];
      if (!lesson) throw new Error("Lição não encontrada");

      const llmResponse = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `Você é um especialista em pedagogia de idiomas. Crie ${input.count} exercícios de múltipla escolha para a lição abaixo. 
Retorne APENAS JSON válido no formato:
[{"question":"...","correctAnswer":"...","options":["op1","op2","op3","op4"],"explanation":"..."}]
Regras: pergunta clara, 4 opções, 1 correta, 3 distratores plausíveis, sem trivialidades.`,
          },
          {
            role: "user",
            content: `Lição: "${lesson.title}" | Idioma: ${lesson.languageCode || 'en'} | Nível: ${lesson.level || 'A1'} | Descrição: ${lesson.description || ''}`,
          },
        ],
        response_format: { type: "json_object" } as any,
      });

      let exercises: any[] = [];
      try {
        const content = (llmResponse as any)?.choices?.[0]?.message?.content ?? "[]";
        const parsed = JSON.parse(content);
        exercises = Array.isArray(parsed) ? parsed : (parsed.exercises ?? []);
      } catch (e) {
        throw new Error("LLM retornou formato inválido");
      }

      // Inserir no banco
      let inserted = 0;
      for (const ex of exercises) {
        if (!ex.question || !(ex.correctAnswer || ex.correct_answer)) continue;
        const answer = ex.correctAnswer || ex.correct_answer;
        await db!.execute(sql`
          INSERT INTO exercises (lessonId, type, question, correctAnswer, options, orderIndex, difficultyScore, points, createdAt, updatedAt)
          VALUES (
            ${input.lessonId}, 'multiple_choice', ${ex.question}, ${answer},
            ${JSON.stringify(ex.options || [])}, 1, 0.5, 10,
            NOW(), NOW()
          )
        `);
        inserted++;
      }

      await notifyOwner({
        title: `✅ SIGA: ${inserted} exercícios gerados para "${lesson.title}"`,
        content: `Lição ID ${input.lessonId} agora tem ${inserted} novos exercícios gerados pela IA.`,
      });

      return { inserted, lessonTitle: lesson.title };
    }),

  // Verificar se LLM e Tavily estão configurados
  checkEngines: publicProcedure.query(() => {
    return {
      llm: { enabled: true, name: "Manus LLM (built-in)", description: "Motor principal de IA — sempre disponível" },
      tavily: {
        enabled: !!process.env.TAVILY_API_KEY,
        name: "Tavily AI",
        description: process.env.TAVILY_API_KEY
          ? "✅ Ativo — busca web em tempo real (1.000/mês grátis)"
          : "⚠️ Inativo — configure TAVILY_API_KEY (grátis em tavily.com)",
      },
    };
  }),

  // Pesquisa pedagógica com Tavily
  research: protectedProcedure
    .input(z.object({ topic: z.string(), language: z.string() }))
    .mutation(async ({ input }) => {
      const content = await searchPedagogicalContent(input.topic, input.language);
      return { content, available: !!process.env.TAVILY_API_KEY };
    }),

  // Busca direta com Tavily
  search: protectedProcedure
    .input(z.object({ query: z.string() }))
    .mutation(async ({ input }) => {
      const result = await tavilySearch(input.query, { searchDepth: "advanced", maxResults: 5 });
      return result ?? { answer: "Tavily não configurado", results: [], query: input.query };
    }),
});
