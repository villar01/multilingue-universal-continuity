/**
 * ============================================================
 * SISTEMA DE AUTOAPERFEIÇOAMENTO COM IA
 * ============================================================
 * 
 * IA aprende com erros dos alunos e ajusta automaticamente:
 * - Detecta exercícios com alta taxa de erro
 * - Ajusta dificuldade baseado em performance
 * - Sugere revisão de vocabulário/gramática problemáticos
 * - Gera exercícios personalizados para pontos fracos
 */

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { exercises, userProgress } from '../drizzle/schema';
import { eq, sql, and, gte } from 'drizzle-orm';
import { invokeLLM } from './_core/llm';

const DATABASE_URL = process.env.DATABASE_URL!;

// ============================================================
// TIPOS
// ============================================================

interface ExerciseAnalytics {
  exerciseId: number;
  lessonId: number;
  question: string;
  totalAttempts: number;
  correctAttempts: number;
  errorRate: number;
  averageTimeSeconds: number;
}

interface LessonDifficultyAdjustment {
  lessonId: number;
  currentDifficulty: number;
  suggestedDifficulty: number;
  reason: string;
}

interface PersonalizedReview {
  userId: number;
  weakTopics: string[];
  suggestedExercises: any[];
  vocabularyToReview: string[];
}

// ============================================================
// ANÁLISE DE PERFORMANCE
// ============================================================

/**
 * Detectar exercícios com alta taxa de erro
 */
export async function detectProblematicExercises(threshold: number = 0.6): Promise<ExerciseAnalytics[]> {
  const connection = await mysql.createConnection(DATABASE_URL);
  const db = drizzle(connection);
  
  try {
    // Query para calcular taxa de erro por exercício
    const [rows] = await connection.execute(`
      SELECT 
        e.id as exerciseId,
        e.lessonId,
        e.question,
        COUNT(*) as totalAttempts,
        SUM(CASE WHEN up.score >= 80 THEN 1 ELSE 0 END) as correctAttempts,
        (1 - SUM(CASE WHEN up.score >= 80 THEN 1 ELSE 0 END) / COUNT(*)) as errorRate,
        AVG(up.timeSpentSeconds) as averageTimeSeconds
      FROM exercises e
      JOIN userProgress up ON e.lessonId = up.lessonId
      WHERE up.completedAt IS NOT NULL
      GROUP BY e.id, e.lessonId, e.question
      HAVING errorRate > ?
      ORDER BY errorRate DESC, totalAttempts DESC
      LIMIT 50
    `, [threshold]);
    
    await connection.end();
    
    return rows as ExerciseAnalytics[];
    
  } catch (error) {
    console.error('Erro ao detectar exercícios problemáticos:', error);
    await connection.end();
    return [];
  }
}

/**
 * Analisar performance geral de uma lição
 */
export async function analyzeLessonPerformance(lessonId: number): Promise<{
  averageScore: number;
  completionRate: number;
  averageTime: number;
  totalAttempts: number;
}> {
  const connection = await mysql.createConnection(DATABASE_URL);
  
  try {
    const [rows] = await connection.execute(`
      SELECT 
        AVG(score) as averageScore,
        COUNT(CASE WHEN completedAt IS NOT NULL THEN 1 END) / COUNT(*) as completionRate,
        AVG(timeSpentSeconds) as averageTime,
        COUNT(*) as totalAttempts
      FROM userProgress
      WHERE lessonId = ?
    `, [lessonId]);
    
    await connection.end();
    
    const result = (rows as any)[0];
    return {
      averageScore: result.averageScore || 0,
      completionRate: result.completionRate || 0,
      averageTime: result.averageTime || 0,
      totalAttempts: result.totalAttempts || 0
    };
    
  } catch (error) {
    console.error('Erro ao analisar performance da lição:', error);
    await connection.end();
    return {
      averageScore: 0,
      completionRate: 0,
      averageTime: 0,
      totalAttempts: 0
    };
  }
}

// ============================================================
// AJUSTE AUTOMÁTICO DE DIFICULDADE
// ============================================================

/**
 * IA sugere ajuste de dificuldade baseado em analytics
 */
export async function suggestDifficultyAdjustments(): Promise<LessonDifficultyAdjustment[]> {
  console.log('🤖 Analisando dificuldade das lições com IA...');
  
  const connection = await mysql.createConnection(DATABASE_URL);
  
  try {
    // Buscar lições com mais de 10 tentativas
    const [lessons] = await connection.execute(`
      SELECT 
        l.id as lessonId,
        l.title,
        l.difficultyScore as currentDifficulty,
        AVG(up.score) as averageScore,
        COUNT(*) as totalAttempts,
        AVG(up.timeSpentSeconds) as averageTime
      FROM lessons l
      JOIN userProgress up ON l.id = up.lessonId
      WHERE up.completedAt IS NOT NULL
      GROUP BY l.id, l.title, l.difficultyScore
      HAVING totalAttempts >= 10
      ORDER BY totalAttempts DESC
      LIMIT 20
    `);
    
    const adjustments: LessonDifficultyAdjustment[] = [];
    
    for (const lesson of lessons as any[]) {
      // IA analisa e sugere ajuste
      const prompt = `Analyze this lesson performance data and suggest difficulty adjustment:

Lesson: "${lesson.title}"
Current Difficulty: ${lesson.currentDifficulty} (0.0 = easiest, 1.0 = hardest)
Average Score: ${lesson.averageScore}%
Total Attempts: ${lesson.totalAttempts}
Average Time: ${lesson.averageTime} seconds

Based on this data, suggest:
1. New difficulty score (0.0-1.0)
2. Brief reason for adjustment

Return ONLY valid JSON:
{
  "suggestedDifficulty": 0.65,
  "reason": "Students scoring too high (avg 92%), increase difficulty slightly"
}`;

      try {
        const response = await invokeLLM({
          messages: [
            { role: 'system', content: 'You are an expert educational data analyst. Return only valid JSON.' },
            { role: 'user', content: prompt }
          ]
        });
        
        const content = response.choices[0].message.content;
        if (!content || typeof content !== 'string') continue;
        
        const suggestion = JSON.parse(content);
        
        adjustments.push({
          lessonId: lesson.lessonId,
          currentDifficulty: lesson.currentDifficulty,
          suggestedDifficulty: suggestion.suggestedDifficulty,
          reason: suggestion.reason
        });
        
        console.log(`✅ Lição ${lesson.lessonId}: ${lesson.currentDifficulty} → ${suggestion.suggestedDifficulty}`);
        
      } catch (error) {
        console.error(`❌ Erro ao analisar lição ${lesson.lessonId}:`, error);
      }
    }
    
    await connection.end();
    
    console.log(`\n🎯 ${adjustments.length} ajustes sugeridos`);
    return adjustments;
    
  } catch (error) {
    console.error('Erro ao sugerir ajustes:', error);
    await connection.end();
    return [];
  }
}

/**
 * Aplicar ajustes de dificuldade automaticamente
 */
export async function applyDifficultyAdjustments(adjustments: LessonDifficultyAdjustment[]): Promise<number> {
  const connection = await mysql.createConnection(DATABASE_URL);
  
  try {
    let appliedCount = 0;
    
    for (const adjustment of adjustments) {
      await connection.execute(
        `UPDATE lessons SET difficultyScore = ? WHERE id = ?`,
        [adjustment.suggestedDifficulty, adjustment.lessonId]
      );
      appliedCount++;
    }
    
    await connection.end();
    
    console.log(`✅ ${appliedCount} ajustes aplicados com sucesso`);
    return appliedCount;
    
  } catch (error) {
    console.error('Erro ao aplicar ajustes:', error);
    await connection.end();
    return 0;
  }
}

// ============================================================
// REVISÃO PERSONALIZADA
// ============================================================

/**
 * Gerar revisão personalizada para usuário baseado em erros
 */
export async function generatePersonalizedReview(userId: number): Promise<PersonalizedReview> {
  const connection = await mysql.createConnection(DATABASE_URL);
  
  try {
    // Buscar lições com baixa performance do usuário
    const [weakLessons] = await connection.execute(`
      SELECT 
        l.title,
        l.vocabulary,
        l.grammar,
        up.score
      FROM userProgress up
      JOIN lessons l ON up.lessonId = l.id
      WHERE up.userId = ? AND up.score < 70
      ORDER BY up.completedAt DESC
      LIMIT 10
    `, [userId]);
    
    await connection.end();
    
    // Extrair tópicos fracos
    const weakTopics: string[] = [];
    const vocabularyToReview: string[] = [];
    
    for (const lesson of weakLessons as any[]) {
      if (lesson.grammar) {
        const grammar = JSON.parse(lesson.grammar);
        weakTopics.push(...grammar);
      }
      if (lesson.vocabulary) {
        const vocab = JSON.parse(lesson.vocabulary);
        vocabularyToReview.push(...vocab);
      }
    }
    
    return {
      userId,
      weakTopics: Array.from(new Set(weakTopics)).slice(0, 5),
      suggestedExercises: [],
      vocabularyToReview: Array.from(new Set(vocabularyToReview)).slice(0, 10)
    };
    
  } catch (error) {
    console.error('Erro ao gerar revisão personalizada:', error);
    await connection.end();
    return {
      userId,
      weakTopics: [],
      suggestedExercises: [],
      vocabularyToReview: []
    };
  }
}

// ============================================================
// EXECUÇÃO AUTOMÁTICA
// ============================================================

/**
 * Executar ciclo completo de autoaperfeiçoamento
 */
export async function runSelfImprovementCycle(): Promise<{
  problematicExercises: number;
  adjustmentsApplied: number;
  timestamp: Date;
}> {
  console.log('\n🚀 Iniciando ciclo de autoaperfeiçoamento...\n');
  
  const startTime = Date.now();
  
  // 1. Detectar exercícios problemáticos
  const problematic = await detectProblematicExercises(0.6);
  console.log(`📊 ${problematic.length} exercícios com alta taxa de erro detectados`);
  
  // 2. Sugerir ajustes de dificuldade
  const adjustments = await suggestDifficultyAdjustments();
  
  // 3. Aplicar ajustes automaticamente
  const applied = await applyDifficultyAdjustments(adjustments);
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  console.log(`\n✅ Ciclo concluído em ${duration}s`);
  console.log(`   📊 ${problematic.length} exercícios problemáticos`);
  console.log(`   🎯 ${applied} ajustes aplicados\n`);
  
  return {
    problematicExercises: problematic.length,
    adjustmentsApplied: applied,
    timestamp: new Date()
  };
}

// Executar ciclo se chamado diretamente
if (require.main === module) {
  runSelfImprovementCycle()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Erro fatal:', error);
      process.exit(1);
    });
}
