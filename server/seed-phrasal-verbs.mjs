/**
 * SEED PHRASAL VERBS
 * Popular banco de dados com phrasal verbs mais comuns do inglês
 */

import mysql from 'mysql2/promise';

const phrasalVerbs = [
  {
    verb: "break",
    particle: "up",
    phrasalVerb: "break up",
    meaning: "End a relationship or separate into pieces",
    translations: JSON.stringify(["terminar relacionamento", "separar", "dividir em pedaços"]),
    category: "relationships",
    difficulty: "beginner",
    examples: JSON.stringify([
      { en: "They broke up last month.", pt: "Eles terminaram o relacionamento mês passado." },
      { en: "Break up the chocolate into small pieces.", pt: "Divida o chocolate em pedaços pequenos." }
    ]),
    synonyms: JSON.stringify(["split up", "separate", "end relationship"]),
    relatedPhrases: JSON.stringify(["break down", "break in", "break out"]),
    notes: "Muito comum em contextos de relacionamentos amorosos",
    languageCode: "en"
  },
  {
    verb: "give",
    particle: "up",
    phrasalVerb: "give up",
    meaning: "Stop trying or quit",
    translations: JSON.stringify(["desistir", "abandonar", "parar de tentar"]),
    category: "daily_life",
    difficulty: "beginner",
    examples: JSON.stringify([
      { en: "Don't give up! You can do it!", pt: "Não desista! Você consegue!" },
      { en: "I gave up smoking last year.", pt: "Eu parei de fumar ano passado." }
    ]),
    synonyms: JSON.stringify(["quit", "surrender", "abandon"]),
    relatedPhrases: JSON.stringify(["give in", "give away", "give back"]),
    notes: "Expressão muito motivacional e comum no dia a dia",
    languageCode: "en"
  },
  {
    verb: "look",
    particle: "up",
    phrasalVerb: "look up",
    meaning: "Search for information or improve",
    translations: JSON.stringify(["procurar (informação)", "pesquisar", "melhorar"]),
    category: "study",
    difficulty: "beginner",
    examples: JSON.stringify([
      { en: "Look up the word in the dictionary.", pt: "Procure a palavra no dicionário." },
      { en: "Things are looking up!", pt: "As coisas estão melhorando!" }
    ]),
    synonyms: JSON.stringify(["search for", "research", "find"]),
    relatedPhrases: JSON.stringify(["look after", "look for", "look into"]),
    notes: "Tem dois significados principais: pesquisar e melhorar",
    languageCode: "en"
  },
  {
    verb: "bring",
    particle: "up",
    phrasalVerb: "bring up",
    meaning: "Mention a topic or raise a child",
    translations: JSON.stringify(["mencionar", "criar (filho)", "trazer à tona"]),
    category: "conversation",
    difficulty: "intermediate",
    examples: JSON.stringify([
      { en: "Don't bring up that topic at dinner.", pt: "Não mencione esse assunto no jantar." },
      { en: "She was brought up in Brazil.", pt: "Ela foi criada no Brasil." }
    ]),
    synonyms: JSON.stringify(["mention", "raise (topic)", "raise (child)"]),
    relatedPhrases: JSON.stringify(["bring about", "bring back", "bring down"]),
    notes: "Contexto determina o significado: conversa ou criação",
    languageCode: "en"
  },
  {
    verb: "take",
    particle: "off",
    phrasalVerb: "take off",
    meaning: "Remove clothing or depart (plane)",
    translations: JSON.stringify(["tirar (roupa)", "decolar (avião)", "sair rapidamente"]),
    category: "travel",
    difficulty: "beginner",
    examples: JSON.stringify([
      { en: "Take off your shoes before entering.", pt: "Tire seus sapatos antes de entrar." },
      { en: "The plane takes off at 3 PM.", pt: "O avião decola às 15h." }
    ]),
    synonyms: JSON.stringify(["remove", "depart", "leave"]),
    relatedPhrases: JSON.stringify(["take on", "take out", "take over"]),
    notes: "Muito usado em viagens e situações cotidianas",
    languageCode: "en"
  },
  {
    verb: "put",
    particle: "off",
    phrasalVerb: "put off",
    meaning: "Postpone or delay",
    translations: JSON.stringify(["adiar", "postergar", "deixar para depois"]),
    category: "work",
    difficulty: "intermediate",
    examples: JSON.stringify([
      { en: "Don't put off until tomorrow what you can do today.", pt: "Não deixe para amanhã o que pode fazer hoje." },
      { en: "We had to put off the meeting.", pt: "Tivemos que adiar a reunião." }
    ]),
    synonyms: JSON.stringify(["postpone", "delay", "defer"]),
    relatedPhrases: JSON.stringify(["put on", "put up", "put down"]),
    notes: "Comum em contextos de trabalho e compromissos",
    languageCode: "en"
  },
  {
    verb: "get",
    particle: "over",
    phrasalVerb: "get over",
    meaning: "Recover from illness or difficult situation",
    translations: JSON.stringify(["superar", "recuperar-se", "esquecer"]),
    category: "emotions",
    difficulty: "intermediate",
    examples: JSON.stringify([
      { en: "It took me months to get over the breakup.", pt: "Levei meses para superar o término." },
      { en: "I'm getting over a cold.", pt: "Estou me recuperando de um resfriado." }
    ]),
    synonyms: JSON.stringify(["recover from", "overcome", "move on"]),
    relatedPhrases: JSON.stringify(["get on", "get up", "get through"]),
    notes: "Muito usado para falar de superação emocional",
    languageCode: "en"
  },
  {
    verb: "run",
    particle: "into",
    phrasalVerb: "run into",
    meaning: "Meet someone by chance or collide with",
    translations: JSON.stringify(["encontrar por acaso", "esbarrar em", "colidir com"]),
    category: "social",
    difficulty: "intermediate",
    examples: JSON.stringify([
      { en: "I ran into an old friend at the mall.", pt: "Encontrei um velho amigo no shopping por acaso." },
      { en: "The car ran into a tree.", pt: "O carro colidiu com uma árvore." }
    ]),
    synonyms: JSON.stringify(["bump into", "meet unexpectedly", "collide with"]),
    relatedPhrases: JSON.stringify(["run out", "run away", "run over"]),
    notes: "Comum em conversas sobre encontros inesperados",
    languageCode: "en"
  },
  {
    verb: "turn",
    particle: "down",
    phrasalVerb: "turn down",
    meaning: "Refuse or reject, or reduce volume",
    translations: JSON.stringify(["recusar", "rejeitar", "diminuir (volume)"]),
    category: "decisions",
    difficulty: "intermediate",
    examples: JSON.stringify([
      { en: "She turned down the job offer.", pt: "Ela recusou a oferta de emprego." },
      { en: "Can you turn down the music?", pt: "Você pode diminuir a música?" }
    ]),
    synonyms: JSON.stringify(["reject", "refuse", "decline", "lower"]),
    relatedPhrases: JSON.stringify(["turn up", "turn on", "turn off"]),
    notes: "Dois significados: recusar algo ou diminuir volume",
    languageCode: "en"
  },
  {
    verb: "come",
    particle: "across",
    phrasalVerb: "come across",
    meaning: "Find by chance or seem/appear",
    translations: JSON.stringify(["encontrar por acaso", "deparar-se com", "parecer"]),
    category: "discovery",
    difficulty: "intermediate",
    examples: JSON.stringify([
      { en: "I came across this old photo yesterday.", pt: "Encontrei esta foto antiga ontem por acaso." },
      { en: "He comes across as very confident.", pt: "Ele parece muito confiante." }
    ]),
    synonyms: JSON.stringify(["find", "discover", "encounter", "seem"]),
    relatedPhrases: JSON.stringify(["come up", "come down", "come by"]),
    notes: "Pode significar encontrar algo ou a impressão que alguém causa",
    languageCode: "en"
  }
];

async function seedPhrasalVerbs() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  try {
    console.log("🌱 Seeding phrasal verbs...");
    
    // Criar tabela se não existir
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS phrasal_verbs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        verb VARCHAR(50) NOT NULL,
        particle VARCHAR(50) NOT NULL,
        phrasal_verb VARCHAR(100) NOT NULL,
        meaning TEXT NOT NULL,
        translations JSON NOT NULL,
        category VARCHAR(50) NOT NULL,
        difficulty ENUM('beginner', 'intermediate', 'advanced') NOT NULL,
        examples JSON NOT NULL,
        synonyms JSON,
        related_phrases JSON,
        notes TEXT,
        language_code VARCHAR(10) NOT NULL DEFAULT 'en',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_phrasal_verb (phrasal_verb),
        INDEX idx_category (category),
        INDEX idx_difficulty (difficulty)
      )
    `);
    
    // Inserir phrasal verbs
    for (const pv of phrasalVerbs) {
      await connection.execute(
        `INSERT INTO phrasal_verbs 
        (verb, particle, phrasal_verb, meaning, translations, category, difficulty, examples, synonyms, related_phrases, notes, language_code, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          pv.verb,
          pv.particle,
          pv.phrasalVerb,
          pv.meaning,
          pv.translations,
          pv.category,
          pv.difficulty,
          pv.examples,
          pv.synonyms,
          pv.relatedPhrases,
          pv.notes,
          pv.languageCode
        ]
      );
      console.log(`✅ Added: ${pv.phrasalVerb}`);
    }
    
    console.log(`\n🎉 Successfully seeded ${phrasalVerbs.length} phrasal verbs!`);
  } catch (error) {
    console.error("❌ Error seeding phrasal verbs:", error);
  } finally {
    await connection.end();
  }
}

seedPhrasalVerbs();
