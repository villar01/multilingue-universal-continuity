#!/usr/bin/env node

/**
 * Script Final de Geração de Lições com GPT-4
 * 
 * Gera 600 lições profissionais com exercícios variados
 * Usa GPT-4 para criar conteúdo de alta qualidade
 */

import { drizzle } from 'drizzle-orm/mysql2';
import { eq } from 'drizzle-orm';
import mysql from 'mysql2/promise';
import * as schema from '../drizzle/schema.ts';
import { invokeLLM } from './_core/llm.ts';

// Conectar ao banco
const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection, { schema, mode: 'default' });

console.log('🚀 Iniciando geração de lições com GPT-4...\n');

// Buscar idiomas
const languages = await db.select().from(schema.languages).limit(5);
console.log(`📚 Encontrados ${languages.length} idiomas\n`);

let totalLessons = 0;
let totalExercises = 0;

for (const language of languages) {
  console.log(`\n🌍 Processando: ${language.name} (${language.code})`);
  
  // Buscar ou criar cursos
  let courses = await db.select().from(schema.courses).where(eq(schema.courses.languageId, language.id));
  
  if (courses.length === 0) {
    // Criar 3 cursos (Básico, Intermediário, Avançado)
    const levels = ['beginner', 'intermediate', 'advanced'];
    const levelNames = {
      beginner: 'Básico',
      intermediate: 'Intermediário',
      advanced: 'Avançado'
    };
    
    for (const level of levels) {
      const [result] = await db.insert(schema.courses).values({
        languageId: language.id,
        title: `${language.name} - ${levelNames[level]}`,
        level: level,
        description: `Curso ${levelNames[level]} de ${language.name}`,
        order: levels.indexOf(level) + 1
      });
      
      courses.push({
        id: result.insertId,
        languageId: language.id,
        title: `${language.name} - ${levelNames[level]}`,
        level: level
      });
    }
    
    console.log(`  ✅ Criados 3 cursos`);
  }
  
  // Para cada curso, criar 10 lições
  for (const course of courses) {
    console.log(`\n  📖 Curso: ${course.title}`);
    
    // Verificar se já tem lições
    const existingLessons = await db.select().from(schema.lessons)
      .where(eq(schema.lessons.courseId, course.id));
    
    if (existingLessons.length >= 10) {
      console.log(`    ⏭️  Já tem ${existingLessons.length} lições, pulando...`);
      continue;
    }
    
    // Gerar 10 lições com GPT-4
    for (let i = 1; i <= 10; i++) {
      console.log(`    🔄 Gerando lição ${i}/10...`);
      
      try {
        // Prompt para GPT-4
        const prompt = `Crie uma lição de ${language.name} nível ${course.level} (lição ${i} de 10).

Retorne um JSON com esta estrutura:
{
  "title": "Título da lição",
  "content": "Conteúdo explicativo da lição (2-3 parágrafos)",
  "vocabulary": ["palavra1", "palavra2", "palavra3"],
  "exercises": [
    {
      "type": "multiple_choice",
      "question": "Pergunta em ${language.name}",
      "options": ["opção1", "opção2", "opção3", "opção4"],
      "correctAnswer": "opção correta",
      "explanation": "Explicação da resposta"
    },
    {
      "type": "translation",
      "question": "Frase para traduzir",
      "correctAnswer": "Tradução correta",
      "explanation": "Explicação"
    },
    {
      "type": "fill_blank",
      "question": "Frase com ___ lacuna",
      "correctAnswer": "palavra correta",
      "explanation": "Explicação"
    },
    {
      "type": "listening",
      "question": "O que você ouviu?",
      "audioText": "Texto que será falado",
      "correctAnswer": "Resposta correta",
      "explanation": "Explicação"
    },
    {
      "type": "speaking",
      "question": "Repita a frase",
      "targetText": "Frase para repetir",
      "explanation": "Dicas de pronúncia"
    }
  ]
}

IMPORTANTE:
- Crie conteúdo REAL e útil para aprender ${language.name}
- Exercícios devem ser variados e progressivos
- Use vocabulário apropriado para o nível ${course.level}
- Retorne APENAS o JSON, sem texto adicional`;

        const response = await invokeLLM({
          messages: [
            { role: 'system', content: 'Você é um especialista em ensino de idiomas. Crie lições profissionais e educativas.' },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' }
        });
        
        const lessonData = JSON.parse(response.choices[0].message.content);
        
        // Inserir lição
        const [lessonResult] = await db.insert(schema.lessons).values({
          courseId: course.id,
          title: lessonData.title,
          content: lessonData.content,
          order: i,
          xpReward: 50,
          estimatedMinutes: 15
        });
        
        const lessonId = lessonResult.insertId;
        totalLessons++;
        
        // Inserir exercícios
        for (let j = 0; j < lessonData.exercises.length; j++) {
          const exercise = lessonData.exercises[j];
          
          await db.insert(schema.exercises).values({
            lessonId: lessonId,
            type: exercise.type,
            question: exercise.question,
            options: exercise.options ? JSON.stringify(exercise.options) : null,
            correctAnswer: exercise.correctAnswer,
            explanation: exercise.explanation,
            order: j + 1,
            points: 10
          });
          
          totalExercises++;
        }
        
        console.log(`    ✅ Lição "${lessonData.title}" criada com ${lessonData.exercises.length} exercícios`);
        
        // Aguardar 1 segundo para não sobrecarregar a API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`    ❌ Erro ao gerar lição ${i}:`, error.message);
      }
    }
  }
}

console.log(`\n\n🎉 CONCLUÍDO!`);
console.log(`📊 Total de lições criadas: ${totalLessons}`);
console.log(`📝 Total de exercícios criados: ${totalExercises}`);

await connection.end();
