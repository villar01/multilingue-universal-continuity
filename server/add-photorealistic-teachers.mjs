import mysql from 'mysql2/promise';
import 'dotenv/config';

const PHOTOREALISTIC_TEACHERS = [
  {
    languageId: 60046, // pt-BR (Brazilian Portuguese)
    name: "Professor Ricardo",
    title: "Professor",
    gender: "male",
    avatarStyle: "professional",
    skinTone: "medium",
    hairColor: "castanho",
    hairStyle: "curto",
    personality: "Professor experiente e carismático, especializado em ensinar Português Brasileiro com metodologia dinâmica e envolvente.",
    teachingStyle: "Abordagem comunicativa com foco em conversação prática e imersão cultural. Utiliza exemplos do dia a dia e situações reais.",
    specialties: ["Conversação", "Pronúncia", "Gramática Aplicada", "Cultura Brasileira"],
    voiceGender: "MALE",
    voiceLanguageCode: "pt-BR",
    photoUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663082627627/cwQJKiNSqcUZIhTm.png",
    voiceId: "pt-BR-Wavenet-B",
    specialty: "Português Brasileiro - São Paulo",
    greetings: ["Olá! Sou o Professor Ricardo, seu professor de Português!", "Bem-vindo à aula! Vamos aprender juntos?", "Oi! Pronto para praticar português hoje?"],
    encouragements: ["Muito bem! Você está progredindo!", "Excelente pronúncia!", "Continue assim!", "Ótimo trabalho!"],
    corrections: ["Quase lá! Vamos tentar novamente?", "Boa tentativa! Preste atenção nesta parte...", "Você está no caminho certo!"]
  },
  {
    languageId: 60047, // en-US (English)
    name: "Professora Ingrid",
    title: "Teacher",
    gender: "female",
    avatarStyle: "professional",
    skinTone: "light",
    hairColor: "loiro",
    hairStyle: "longo",
    personality: "Professora dinâmica e motivadora, especializada em ensinar Inglês Americano com metodologia moderna e interativa.",
    teachingStyle: "Ensino comunicativo com ênfase em fluência e confiança. Usa recursos multimídia e situações práticas do cotidiano.",
    specialties: ["Business English", "Conversação", "Pronúncia Americana", "TOEFL Preparation"],
    voiceGender: "FEMALE",
    voiceLanguageCode: "en-US",
    photoUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663082627627/rrmsymmrZgBkVcIu.png",
    voiceId: "en-US-Wavenet-F",
    specialty: "American English - California",
    greetings: ["Hello! I'm Teacher Ingrid, your English teacher!", "Welcome to class! Ready to learn?", "Hi! Let's practice English today!"],
    encouragements: ["Great job! You're doing well!", "Excellent pronunciation!", "Keep it up!", "Wonderful work!"],
    corrections: ["Almost there! Let's try again?", "Good attempt! Pay attention to this part...", "You're on the right track!"]
  },
  {
    languageId: 60048, // es-ES (Spanish)
    name: "Professor Carlos",
    title: "Profesor",
    gender: "male",
    avatarStyle: "professional",
    skinTone: "medium",
    hairColor: "preto",
    hairStyle: "curto",
    personality: "Professor apaixonado e experiente, especializado em ensinar Espanhol com metodologia imersiva e cultural.",
    teachingStyle: "Ensino baseado em conversação real e imersão cultural. Integra música, literatura e costumes hispânicos.",
    specialties: ["Conversação", "Cultura Hispânica", "Gramática", "DELE Preparation"],
    voiceGender: "MALE",
    voiceLanguageCode: "es-ES",
    photoUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663082627627/qrODIrIvLLXeCLLN.png",
    voiceId: "es-ES-Wavenet-B",
    specialty: "Español - Madrid",
    greetings: ["¡Hola! Soy el Profesor Carlos, tu profesor de Español!", "¡Bienvenido a clase! ¿Vamos a aprender?", "¡Hola! ¿Listo para practicar español hoy?"],
    encouragements: ["¡Muy bien! ¡Estás progresando!", "¡Excelente pronunciación!", "¡Sigue así!", "¡Buen trabajo!"],
    corrections: ["¡Casi! ¿Intentamos de nuevo?", "¡Buen intento! Presta atención a esta parte...", "¡Vas por buen camino!"]
  },
  {
    languageId: 60049, // fr-FR (French)
    name: "Professor Jean",
    title: "Professeur",
    gender: "male",
    avatarStyle: "professional",
    skinTone: "light",
    hairColor: "castanho",
    hairStyle: "médio",
    personality: "Professor elegante e refinado, especializado em ensinar Francês com metodologia clássica e moderna.",
    teachingStyle: "Combinação de método tradicional com abordagem comunicativa. Ênfase em pronúncia correta e cultura francesa.",
    specialties: ["Pronúncia Francesa", "Conversação", "Gramática", "DELF Preparation"],
    voiceGender: "MALE",
    voiceLanguageCode: "fr-FR",
    photoUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663082627627/CXDuUmSKtpexfEZX.png",
    voiceId: "fr-FR-Wavenet-B",
    specialty: "Français - Paris",
    greetings: ["Bonjour! Je suis le Professeur Jean, votre professeur de Français!", "Bienvenue en classe! On va apprendre ensemble?", "Salut! Prêt à pratiquer le français aujourd'hui?"],
    encouragements: ["Très bien! Vous progressez!", "Excellente prononciation!", "Continuez comme ça!", "Bon travail!"],
    corrections: ["Presque! On essaie encore?", "Bonne tentative! Attention à cette partie...", "Vous êtes sur la bonne voie!"]
  }
];

async function main() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  try {
    console.log('🔧 Adding photo_url column to virtual_teachers table...');
    
    // Add photo_url column if it doesn't exist
    try {
      await connection.query(`
        ALTER TABLE virtual_teachers 
        ADD COLUMN photo_url TEXT AFTER hair_style
      `);
      console.log('✅ photo_url column added successfully');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  photo_url column already exists');
      } else {
        throw error;
      }
    }
    
    // Add voice_id column
    try {
      await connection.query(`
        ALTER TABLE virtual_teachers 
        ADD COLUMN voice_id VARCHAR(100) AFTER voice_language_code
      `);
      console.log('✅ voice_id column added successfully');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  voice_id column already exists');
      } else {
        throw error;
      }
    }
    
    // Add specialty column
    try {
      await connection.query(`
        ALTER TABLE virtual_teachers 
        ADD COLUMN specialty VARCHAR(255) AFTER voice_id
      `);
      console.log('✅ specialty column added successfully');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  specialty column already exists');
      } else {
        throw error;
      }
    }
    
    console.log('\n🎭 Inserting photorealistic teachers...');
    
    for (const teacher of PHOTOREALISTIC_TEACHERS) {
      // Check if teacher already exists
      const [existing] = await connection.query(
        'SELECT id FROM virtual_teachers WHERE name = ? AND language_id = ?',
        [teacher.name, teacher.languageId]
      );
      
      if (existing.length > 0) {
        // Update existing teacher
        await connection.query(`
          UPDATE virtual_teachers 
          SET 
            photo_url = ?,
            voice_id = ?,
            specialty = ?,
            title = ?,
            gender = ?,
            avatar_style = ?,
            skin_tone = ?,
            hair_color = ?,
            hair_style = ?,
            personality = ?,
            teaching_style = ?,
            specialties = ?,
            voice_gender = ?,
            voice_language_code = ?,
            greetings = ?,
            encouragements = ?,
            corrections = ?,
            is_active = 1
          WHERE name = ? AND language_id = ?
        `, [
          teacher.photoUrl,
          teacher.voiceId,
          teacher.specialty,
          teacher.title,
          teacher.gender,
          teacher.avatarStyle,
          teacher.skinTone,
          teacher.hairColor,
          teacher.hairStyle,
          teacher.personality,
          teacher.teachingStyle,
          JSON.stringify(teacher.specialties),
          teacher.voiceGender,
          teacher.voiceLanguageCode,
          JSON.stringify(teacher.greetings),
          JSON.stringify(teacher.encouragements),
          JSON.stringify(teacher.corrections),
          teacher.name,
          teacher.languageId
        ]);
        console.log(`✅ Updated: ${teacher.name} (${teacher.specialty})`);
      } else {
        // Insert new teacher
        await connection.query(`
          INSERT INTO virtual_teachers (
            language_id, name, title, gender, avatar_style, skin_tone, 
            hair_color, hair_style, photo_url, personality, teaching_style, 
            specialties, voice_gender, voice_language_code, voice_id, specialty,
            greetings, encouragements, corrections, is_active
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        `, [
          teacher.languageId,
          teacher.name,
          teacher.title,
          teacher.gender,
          teacher.avatarStyle,
          teacher.skinTone,
          teacher.hairColor,
          teacher.hairStyle,
          teacher.photoUrl,
          teacher.personality,
          teacher.teachingStyle,
          JSON.stringify(teacher.specialties),
          teacher.voiceGender,
          teacher.voiceLanguageCode,
          teacher.voiceId,
          teacher.specialty,
          JSON.stringify(teacher.greetings),
          JSON.stringify(teacher.encouragements),
          JSON.stringify(teacher.corrections)
        ]);
        console.log(`✅ Inserted: ${teacher.name} (${teacher.specialty})`);
      }
    }
    
    console.log('\n✅ All photorealistic teachers added successfully!');
    
    // Verify
    const [teachers] = await connection.query(`
      SELECT id, name, specialty, photo_url 
      FROM virtual_teachers 
      WHERE photo_url IS NOT NULL
    `);
    console.log('\n📋 Photorealistic teachers in database:');
    console.log(teachers);
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

main().catch(console.error);
