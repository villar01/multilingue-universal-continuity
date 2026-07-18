/**
 * Script para gerar áudio de todas as lições usando Google Cloud TTS
 * e fazer upload para S3
 */

import { db } from '../server/db.ts';
import { lessons, exercises } from '../drizzle/schema.ts';
import { generateSpeech } from '../server/_core/tts.ts';
import { storagePut } from '../server/storage.ts';
import { eq } from 'drizzle-orm';

// Função para gerar slug único
function generateSlug(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Função para gerar áudio e fazer upload
async function generateAndUploadAudio(text, languageCode, filename) {
  try {
    console.log(`Gerando áudio: ${filename}`);
    
    // Gerar áudio com Google Cloud TTS
    const audioBuffer = await generateSpeech({
      text,
      languageCode
    });
    
    // Upload para S3
    const s3Key = `audio/lessons/${languageCode}/${filename}.mp3`;
    const { url } = await storagePut(s3Key, audioBuffer, 'audio/mpeg');
    
    console.log(`✓ Áudio gerado e enviado: ${url}`);
    return url;
  } catch (error) {
    console.error(`✗ Erro ao gerar áudio para ${filename}:`, error.message);
    return null;
  }
}

// Processar lições
async function processLessons() {
  console.log('🎵 Iniciando geração de áudio para todas as lições...\n');
  
  // Buscar todas as lições
  const allLessons = await db.select().from(lessons);
  console.log(`Total de lições: ${allLessons.length}\n`);
  
  let processed = 0;
  let success = 0;
  let failed = 0;
  
  for (const lesson of allLessons) {
    processed++;
    console.log(`\n[${processed}/${allLessons.length}] Processando: ${lesson.title}`);
    
    try {
      // Gerar áudio para o título/introdução da lição
      const introText = `Lição ${lesson.order}: ${lesson.title}. ${lesson.description || ''}`;
      const filename = `lesson-${lesson.id}-intro`;
      
      const audioUrl = await generateAndUploadAudio(
        introText,
        lesson.language_code,
        filename
      );
      
      if (audioUrl) {
        // Atualizar banco de dados com URL do áudio
        await db.update(lessons)
          .set({ audio_url: audioUrl })
          .where(eq(lessons.id, lesson.id));
        
        success++;
        console.log(`✓ Lição atualizada no banco de dados`);
      } else {
        failed++;
      }
      
      // Aguardar 500ms para não sobrecarregar a API
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      failed++;
      console.error(`✗ Erro ao processar lição ${lesson.id}:`, error.message);
    }
  }
  
  console.log(`\n\n📊 RESUMO:`);
  console.log(`Total processado: ${processed}`);
  console.log(`Sucesso: ${success}`);
  console.log(`Falhas: ${failed}`);
}

// Processar exercícios
async function processExercises() {
  console.log('\n\n🎵 Iniciando geração de áudio para exercícios...\n');
  
  // Buscar todos os exercícios
  const allExercises = await db.select().from(exercises);
  console.log(`Total de exercícios: ${allExercises.length}\n`);
  
  let processed = 0;
  let success = 0;
  let failed = 0;
  
  for (const exercise of allExercises) {
    processed++;
    
    // Apenas gerar áudio para exercícios que têm texto
    if (!exercise.question && !exercise.text) {
      continue;
    }
    
    console.log(`\n[${processed}/${allExercises.length}] Processando exercício ${exercise.id}`);
    
    try {
      const textToSpeak = exercise.text || exercise.question;
      const filename = `exercise-${exercise.id}`;
      
      // Buscar lição para pegar o idioma
      const lesson = await db.select()
        .from(lessons)
        .where(eq(lessons.id, exercise.lesson_id))
        .limit(1);
      
      if (lesson.length === 0) {
        console.log(`✗ Lição não encontrada para exercício ${exercise.id}`);
        failed++;
        continue;
      }
      
      const audioUrl = await generateAndUploadAudio(
        textToSpeak,
        lesson[0].language_code,
        filename
      );
      
      if (audioUrl) {
        // Atualizar banco de dados
        await db.update(exercises)
          .set({ audio_url: audioUrl })
          .where(eq(exercises.id, exercise.id));
        
        success++;
        console.log(`✓ Exercício atualizado no banco de dados`);
      } else {
        failed++;
      }
      
      // Aguardar 500ms
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      failed++;
      console.error(`✗ Erro ao processar exercício ${exercise.id}:`, error.message);
    }
  }
  
  console.log(`\n\n📊 RESUMO EXERCÍCIOS:`);
  console.log(`Total processado: ${processed}`);
  console.log(`Sucesso: ${success}`);
  console.log(`Falhas: ${failed}`);
}

// Executar
async function main() {
  try {
    console.log('🚀 Iniciando geração de áudio em lote...\n');
    console.log('Isso pode levar alguns minutos...\n');
    
    // Processar lições
    await processLessons();
    
    // Processar exercícios
    await processExercises();
    
    console.log('\n\n✅ Processo concluído!');
    process.exit(0);
  } catch (error) {
    console.error('\n\n❌ Erro fatal:', error);
    process.exit(1);
  }
}

main();
