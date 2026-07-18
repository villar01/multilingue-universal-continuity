/**
 * SEED: Professores Virtuais para os 54 Idiomas
 * 
 * Gera professores com nomes culturalmente apropriados para cada idioma
 */

import { drizzle } from "drizzle-orm/mysql2";
import { virtualTeachers, languages } from "../drizzle/schema";
import { eq } from "drizzle-orm";

const db = drizzle(process.env.DATABASE_URL!);

// Definição de professores por idioma (nomes culturalmente apropriados)
const teachersData = [
  // Português
  { langCode: "pt", name: "Ana Silva", title: "Professora", gender: "female" as const, skinTone: "medium", hairColor: "castanho", hairStyle: "ondulado médio" },
  
  // Inglês
  { langCode: "en", name: "Michael Johnson", title: "Professor", gender: "male" as const, skinTone: "light", hairColor: "loiro", hairStyle: "curto" },
  
  // Espanhol
  { langCode: "es", name: "María García", title: "Profesora", gender: "female" as const, skinTone: "medium", hairColor: "preto", hairStyle: "longo liso" },
  
  // Francês
  { langCode: "fr", name: "Jean Dubois", title: "Professeur", gender: "male" as const, skinTone: "light", hairColor: "castanho", hairStyle: "curto elegante" },
  
  // Alemão
  { langCode: "de", name: "Hans Müller", title: "Lehrer", gender: "male" as const, skinTone: "light", hairColor: "loiro escuro", hairStyle: "curto profissional" },
  
  // Italiano
  { langCode: "it", name: "Sofia Rossi", title: "Professoressa", gender: "female" as const, skinTone: "medium", hairColor: "castanho escuro", hairStyle: "médio ondulado" },
  
  // Japonês
  { langCode: "ja", name: "Yuki Tanaka", title: "先生 (Sensei)", gender: "female" as const, skinTone: "light", hairColor: "preto", hairStyle: "longo liso" },
  
  // Chinês (Mandarim)
  { langCode: "zh", name: "Wei Chen", title: "老师 (Lǎoshī)", gender: "male" as const, skinTone: "light", hairColor: "preto", hairStyle: "curto" },
  
  // Russo
  { langCode: "ru", name: "Dmitri Ivanov", title: "Учитель (Uchitel)", gender: "male" as const, skinTone: "light", hairColor: "castanho", hairStyle: "curto" },
  
  // Árabe
  { langCode: "ar", name: "Ahmed Al-Rashid", title: "أستاذ (Ustadh)", gender: "male" as const, skinTone: "medium", hairColor: "preto", hairStyle: "curto" },
  
  // Coreano
  { langCode: "ko", name: "Min-ji Park", title: "선생님 (Seonsaengnim)", gender: "female" as const, skinTone: "light", hairColor: "preto", hairStyle: "médio liso" },
  
  // Hindi
  { langCode: "hi", name: "Priya Sharma", title: "शिक्षक (Shikshak)", gender: "female" as const, skinTone: "medium", hairColor: "preto", hairStyle: "longo liso" },
  
  // Turco
  { langCode: "tr", name: "Mehmet Yılmaz", title: "Öğretmen", gender: "male" as const, skinTone: "medium", hairColor: "preto", hairStyle: "curto" },
  
  // Holandês
  { langCode: "nl", name: "Emma van der Berg", title: "Leraar", gender: "female" as const, skinTone: "light", hairColor: "loiro", hairStyle: "médio liso" },
  
  // Sueco
  { langCode: "sv", name: "Erik Andersson", title: "Lärare", gender: "male" as const, skinTone: "light", hairColor: "loiro", hairStyle: "curto" },
  
  // Polonês
  { langCode: "pl", name: "Anna Kowalski", title: "Nauczyciel", gender: "female" as const, skinTone: "light", hairColor: "loiro escuro", hairStyle: "médio ondulado" },
  
  // Grego
  { langCode: "el", name: "Nikos Papadopoulos", title: "Δάσκαλος (Daskalos)", gender: "male" as const, skinTone: "medium", hairColor: "preto", hairStyle: "curto" },
  
  // Hebraico
  { langCode: "he", name: "Sarah Cohen", title: "מורה (Moreh)", gender: "female" as const, skinTone: "medium", hairColor: "castanho", hairStyle: "longo ondulado" },
  
  // Tailandês
  { langCode: "th", name: "Somchai Patel", title: "ครู (Khru)", gender: "male" as const, skinTone: "medium", hairColor: "preto", hairStyle: "curto" },
  
  // Vietnamita
  { langCode: "vi", name: "Linh Nguyen", title: "Giáo viên", gender: "female" as const, skinTone: "light", hairColor: "preto", hairStyle: "longo liso" },
  
  // Indonésio
  { langCode: "id", name: "Budi Santoso", title: "Guru", gender: "male" as const, skinTone: "medium", hairColor: "preto", hairStyle: "curto" },
  
  // Malaio
  { langCode: "ms", name: "Fatimah Rahman", title: "Guru", gender: "female" as const, skinTone: "medium", hairColor: "preto", hairStyle: "médio com hijab" },
  
  // Filipino (Tagalog)
  { langCode: "tl", name: "Maria Santos", title: "Guro", gender: "female" as const, skinTone: "medium", hairColor: "preto", hairStyle: "longo liso" },
  
  // Persa (Farsi)
  { langCode: "fa", name: "Reza Hosseini", title: "معلم (Moallem)", gender: "male" as const, skinTone: "medium", hairColor: "preto", hairStyle: "curto" },
  
  // Urdu
  { langCode: "ur", name: "Ayesha Khan", title: "استاد (Ustad)", gender: "female" as const, skinTone: "medium", hairColor: "preto", hairStyle: "longo liso" },
  
  // Bengali
  { langCode: "bn", name: "Rahul Das", title: "শিক্ষক (Shikkhok)", gender: "male" as const, skinTone: "medium", hairColor: "preto", hairStyle: "curto" },
  
  // Swahili
  { langCode: "sw", name: "Amani Mwangi", title: "Mwalimu", gender: "female" as const, skinTone: "dark", hairColor: "preto", hairStyle: "curto crespo" },
  
  // Norueguês
  { langCode: "no", name: "Lars Hansen", title: "Lærer", gender: "male" as const, skinTone: "light", hairColor: "loiro", hairStyle: "curto" },
  
  // Dinamarquês
  { langCode: "da", name: "Sofie Nielsen", title: "Lærer", gender: "female" as const, skinTone: "light", hairColor: "loiro", hairStyle: "médio liso" },
  
  // Finlandês
  { langCode: "fi", name: "Mika Virtanen", title: "Opettaja", gender: "male" as const, skinTone: "light", hairColor: "loiro", hairStyle: "curto" },
  
  // Tcheco
  { langCode: "cs", name: "Petra Novák", title: "Učitel", gender: "female" as const, skinTone: "light", hairColor: "castanho", hairStyle: "médio liso" },
  
  // Húngaro
  { langCode: "hu", name: "István Nagy", title: "Tanár", gender: "male" as const, skinTone: "light", hairColor: "castanho", hairStyle: "curto" },
  
  // Romeno
  { langCode: "ro", name: "Elena Popescu", title: "Profesor", gender: "female" as const, skinTone: "light", hairColor: "castanho escuro", hairStyle: "longo ondulado" },
  
  // Ucraniano
  { langCode: "uk", name: "Olena Kovalenko", title: "Вчитель (Vchytel)", gender: "female" as const, skinTone: "light", hairColor: "loiro", hairStyle: "médio liso" },
  
  // Búlgaro
  { langCode: "bg", name: "Ivan Petrov", title: "Учител (Uchitel)", gender: "male" as const, skinTone: "light", hairColor: "castanho", hairStyle: "curto" },
  
  // Sérvio
  { langCode: "sr", name: "Marko Jovanović", title: "Nastavnik", gender: "male" as const, skinTone: "light", hairColor: "castanho escuro", hairStyle: "curto" },
  
  // Croata
  { langCode: "hr", name: "Ana Horvat", title: "Učitelj", gender: "female" as const, skinTone: "light", hairColor: "castanho", hairStyle: "médio ondulado" },
  
  // Eslovaco
  { langCode: "sk", name: "Martin Horváth", title: "Učiteľ", gender: "male" as const, skinTone: "light", hairColor: "castanho", hairStyle: "curto" },
  
  // Esloveno
  { langCode: "sl", name: "Maja Novak", title: "Učitelj", gender: "female" as const, skinTone: "light", hairColor: "castanho", hairStyle: "médio liso" },
  
  // Lituano
  { langCode: "lt", name: "Jonas Kazlauskas", title: "Mokytojas", gender: "male" as const, skinTone: "light", hairColor: "loiro", hairStyle: "curto" },
  
  // Letão
  { langCode: "lv", name: "Līga Bērziņa", title: "Skolotājs", gender: "female" as const, skinTone: "light", hairColor: "loiro", hairStyle: "médio liso" },
  
  // Estoniano
  { langCode: "et", name: "Toomas Tamm", title: "Õpetaja", gender: "male" as const, skinTone: "light", hairColor: "loiro", hairStyle: "curto" },
  
  // Islandês
  { langCode: "is", name: "Guðrún Sigurðardóttir", title: "Kennari", gender: "female" as const, skinTone: "light", hairColor: "loiro", hairStyle: "longo liso" },
  
  // Catalão
  { langCode: "ca", name: "Jordi Martí", title: "Professor", gender: "male" as const, skinTone: "medium", hairColor: "castanho", hairStyle: "curto" },
  
  // Galego
  { langCode: "gl", name: "Carmen Fernández", title: "Profesora", gender: "female" as const, skinTone: "light", hairColor: "castanho", hairStyle: "médio ondulado" },
  
  // Basco
  { langCode: "eu", name: "Iker Etxebarria", title: "Irakasle", gender: "male" as const, skinTone: "light", hairColor: "preto", hairStyle: "curto" },
  
  // Africâner
  { langCode: "af", name: "Pieter van Wyk", title: "Onderwyser", gender: "male" as const, skinTone: "light", hairColor: "loiro", hairStyle: "curto" },
  
  // Zulu
  { langCode: "zu", name: "Thandi Dlamini", title: "Uthisha", gender: "female" as const, skinTone: "dark", hairColor: "preto", hairStyle: "curto crespo" },
  
  // Xhosa
  { langCode: "xh", name: "Sipho Mthembu", title: "Utitshala", gender: "male" as const, skinTone: "dark", hairColor: "preto", hairStyle: "curto" },
  
  // Amárico
  { langCode: "am", name: "Selam Tesfaye", title: "መምህር (Memhir)", gender: "female" as const, skinTone: "dark", hairColor: "preto", hairStyle: "médio crespo" },
  
  // Hausa
  { langCode: "ha", name: "Ibrahim Bello", title: "Malami", gender: "male" as const, skinTone: "dark", hairColor: "preto", hairStyle: "curto" },
  
  // Yoruba
  { langCode: "yo", name: "Adebayo Okafor", title: "Olùkọ́", gender: "male" as const, skinTone: "dark", hairColor: "preto", hairStyle: "curto" },
  
  // Igbo
  { langCode: "ig", name: "Chiamaka Nwosu", title: "Onye nkuzi", gender: "female" as const, skinTone: "dark", hairColor: "preto", hairStyle: "curto crespo" },
  
  // Somali
  { langCode: "so", name: "Fatima Hassan", title: "Macalin", gender: "female" as const, skinTone: "dark", hairColor: "preto", hairStyle: "médio com hijab" },
  
  // Professor 11: Kofi Mensah - Africa Ocidental
  { langCode: "multi-af", name: "Kofi Mensah", title: "Mwalimu", gender: "male" as const, skinTone: "dark", hairColor: "preto", hairStyle: "curto" },
  
  // Professor 12: Luna Quetzal - Americas Indigenas
  { langCode: "multi-am", name: "Luna Quetzal", title: "Maestra", gender: "female" as const, skinTone: "medium", hairColor: "preto", hairStyle: "longo com tranças" },

  // Professor 13: Amara Okonkwo - Africa Central
  { langCode: "multi-ac", name: "Amara Okonkwo", title: "Onye nkuzi", gender: "female" as const, skinTone: "dark", hairColor: "preto", hairStyle: "curto crespo" },

  // Professor 14: Raj Patel - Asia do Sul
  { langCode: "multi-as", name: "Raj Patel", title: "Shikshak", gender: "male" as const, skinTone: "medium", hairColor: "preto", hairStyle: "curto" },

  // Professor 15: Leila Al-Rashid - Oriente Médio
  { langCode: "multi-om", name: "Leila Al-Rashid", title: "معلمة (Moallema)", gender: "female" as const, skinTone: "medium", hairColor: "preto", hairStyle: "longo com hijab" },

  // Professor 16: Soren Andersen - Europa Nórdica
  { langCode: "multi-en", name: "Soren Andersen", title: "Lærer", gender: "male" as const, skinTone: "light", hairColor: "loiro", hairStyle: "curto profissional" },
];

async function seedTeachers() {
  console.log("🎓 Iniciando seed de professores virtuais...\n");

  try {
    // Buscar todos os idiomas
    const allLanguages = await db.select().from(languages);
    console.log(`✅ ${allLanguages.length} idiomas encontrados no banco\n`);

    let created = 0;
    let skipped = 0;

    for (const teacherData of teachersData) {
      // Encontrar idioma correspondente
      const language = allLanguages.find(l => l.code === teacherData.langCode);
      
      if (!language) {
        console.log(`⚠️  Idioma ${teacherData.langCode} não encontrado - pulando ${teacherData.name}`);
        skipped++;
        continue;
      }

      // Verificar se já existe professor para este idioma
      const existing = await db
        .select()
        .from(virtualTeachers)
        .where(eq(virtualTeachers.languageId, language.id))
        .limit(1);

      if (existing.length > 0) {
        console.log(`⏭️  Professor já existe para ${language.name} - pulando`);
        skipped++;
        continue;
      }

      // Criar professor
      await db.insert(virtualTeachers).values({
        languageId: language.id,
        name: teacherData.name,
        title: teacherData.title,
        gender: teacherData.gender,
        avatarStyle: "professional",
        skinTone: teacherData.skinTone,
        hairColor: teacherData.hairColor,
        hairStyle: teacherData.hairStyle,
        personality: `Professor(a) ${teacherData.gender === "male" ? "experiente e paciente" : "dedicada e encorajadora"}, especializado(a) em ensinar ${language.name} para falantes de outros idiomas.`,
        teachingStyle: `Abordagem comunicativa com foco em conversação prática e imersão cultural. Utiliza exemplos do dia a dia e situações reais para facilitar o aprendizado.`,
        specialties: ["Conversação", "Pronúncia", "Gramática Aplicada", "Cultura"],
        voiceGender: teacherData.gender === "male" ? "MALE" : "FEMALE",
        voiceLanguageCode: teacherData.langCode,
        greetings: [
          `Olá! Sou ${teacherData.title} ${teacherData.name.split(" ")[0]}, seu professor de ${language.name}!`,
          `Bem-vindo à aula de ${language.name}! Vamos aprender juntos?`,
          `Oi! Pronto para praticar ${language.name} hoje?`,
        ],
        encouragements: [
          "Muito bem! Você está progredindo!",
          "Excelente pronúncia!",
          "Continue assim, você está indo muito bem!",
          "Ótimo trabalho! Vamos para o próximo?",
        ],
        corrections: [
          "Quase lá! Vamos tentar novamente?",
          "Boa tentativa! Preste atenção nesta parte...",
          "Você está no caminho certo, apenas ajuste...",
          "Não se preocupe, vamos praticar mais esta parte.",
        ],
        isActive: true,
      });

      console.log(`✅ Criado: ${teacherData.title} ${teacherData.name} (${language.name})`);
      created++;
    }

    console.log(`\n🎉 Seed concluído!`);
    console.log(`   ✅ ${created} professores criados`);
    console.log(`   ⏭️  ${skipped} professores pulados (já existentes ou idioma não encontrado)`);

  } catch (error) {
    console.error("❌ Erro ao fazer seed:", error);
    throw error;
  }
}

// Executar seed
seedTeachers()
  .then(() => {
    console.log("\n✅ Processo finalizado com sucesso!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Erro fatal:", error);
    process.exit(1);
  });
