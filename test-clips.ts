import { getDb } from './server/db';

async function testClips() {
  const db = await getDb();
  if (!db) {
    console.log('❌ Não foi possível conectar ao banco');
    return;
  }

  const { videoClips } = await import('./drizzle/schema');
  const clips = await db.select().from(videoClips);
  
  console.log('✅ Total de clipes no banco:', clips.length);
  
  if (clips.length > 0) {
    console.log('\n📹 Primeiro clipe:');
    console.log('- ID:', clips[0].id);
    console.log('- Title:', clips[0].title);
    console.log('- Target Language:', clips[0].targetLanguage);
    console.log('- Difficulty:', clips[0].difficulty);
    console.log('- Category:', clips[0].category);
  } else {
    console.log('\n⚠️ Nenhum clipe encontrado no banco!');
  }
}

testClips().catch(console.error);
