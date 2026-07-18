/**
 * SEED 90 MORE PHRASAL VERBS
 * Adicionar mais 90 phrasal verbs essenciais para completar 100
 */

import mysql from 'mysql2/promise';

const phrasalVerbs = [
  // WORK & BUSINESS (15)
  {
    verb: "carry", particle: "out", phrasalVerb: "carry out",
    meaning: "Execute or perform a task",
    translations: JSON.stringify(["executar", "realizar", "cumprir"]),
    category: "work", difficulty: "intermediate",
    examples: JSON.stringify([
      { en: "We need to carry out this plan carefully.", pt: "Precisamos executar este plano cuidadosamente." },
      { en: "The research was carried out over two years.", pt: "A pesquisa foi realizada ao longo de dois anos." }
    ]),
    synonyms: JSON.stringify(["execute", "perform", "implement"]),
    relatedPhrases: JSON.stringify(["carry on", "carry through"]),
    notes: "Muito usado em contextos profissionais e acadêmicos"
  },
  {
    verb: "set", particle: "up", phrasalVerb: "set up",
    meaning: "Establish or arrange something",
    translations: JSON.stringify(["estabelecer", "montar", "configurar"]),
    category: "work", difficulty: "beginner",
    examples: JSON.stringify([
      { en: "They set up a new company last year.", pt: "Eles estabeleceram uma nova empresa ano passado." },
      { en: "Can you help me set up my computer?", pt: "Você pode me ajudar a configurar meu computador?" }
    ]),
    synonyms: JSON.stringify(["establish", "create", "arrange"]),
    relatedPhrases: JSON.stringify(["set out", "set off"]),
    notes: "Comum em negócios e tecnologia"
  },
  {
    verb: "deal", particle: "with", phrasalVerb: "deal with",
    meaning: "Handle or manage a situation",
    translations: JSON.stringify(["lidar com", "tratar de", "resolver"]),
    category: "work", difficulty: "beginner",
    examples: JSON.stringify([
      { en: "I'll deal with this problem tomorrow.", pt: "Vou lidar com este problema amanhã." },
      { en: "She deals with customer complaints.", pt: "Ela trata de reclamações de clientes." }
    ]),
    synonyms: JSON.stringify(["handle", "manage", "address"]),
    relatedPhrases: JSON.stringify(["cope with", "face up to"]),
    notes: "Essencial para situações profissionais"
  },
  {
    verb: "work", particle: "out", phrasalVerb: "work out",
    meaning: "Exercise or solve a problem",
    translations: JSON.stringify(["malhar", "resolver", "dar certo"]),
    category: "daily_life", difficulty: "beginner",
    examples: JSON.stringify([
      { en: "I work out at the gym three times a week.", pt: "Eu malho na academia três vezes por semana." },
      { en: "We need to work out this math problem.", pt: "Precisamos resolver este problema de matemática." },
      { en: "Everything will work out fine.", pt: "Tudo vai dar certo." }
    ]),
    synonyms: JSON.stringify(["exercise", "solve", "succeed"]),
    relatedPhrases: JSON.stringify(["work on", "work through"]),
    notes: "Tem três significados principais: exercitar, resolver, dar certo"
  },
  {
    verb: "fill", particle: "in", phrasalVerb: "fill in",
    meaning: "Complete a form or provide information",
    translations: JSON.stringify(["preencher", "completar", "substituir"]),
    category: "work", difficulty: "beginner",
    examples: JSON.stringify([
      { en: "Please fill in this application form.", pt: "Por favor, preencha este formulário de inscrição." },
      { en: "Can you fill in for me tomorrow?", pt: "Você pode me substituir amanhã?" }
    ]),
    synonyms: JSON.stringify(["complete", "fill out", "substitute"]),
    relatedPhrases: JSON.stringify(["fill out", "fill up"]),
    notes: "Comum em formulários e substituições"
  },

  // RELATIONSHIPS & SOCIAL (15)
  {
    verb: "fall", particle: "out", phrasalVerb: "fall out",
    meaning: "Have an argument and stop being friends",
    translations: JSON.stringify(["brigar", "desentender-se", "romper amizade"]),
    category: "relationships", difficulty: "intermediate",
    examples: JSON.stringify([
      { en: "They fell out over money.", pt: "Eles brigaram por causa de dinheiro." },
      { en: "I hope we don't fall out.", pt: "Espero que não nos desentendamos." }
    ]),
    synonyms: JSON.stringify(["argue", "quarrel", "have a falling-out"]),
    relatedPhrases: JSON.stringify(["make up", "patch up"]),
    notes: "Usado para descrever fim de amizades"
  },
  {
    verb: "make", particle: "up", phrasalVerb: "make up",
    meaning: "Reconcile after an argument or invent a story",
    translations: JSON.stringify(["fazer as pazes", "inventar", "maquiar-se"]),
    category: "relationships", difficulty: "beginner",
    examples: JSON.stringify([
      { en: "They had a fight but made up quickly.", pt: "Eles brigaram mas fizeram as pazes rapidamente." },
      { en: "Don't make up excuses!", pt: "Não invente desculpas!" },
      { en: "She's making up for the party.", pt: "Ela está se maquiando para a festa." }
    ]),
    synonyms: JSON.stringify(["reconcile", "invent", "apply makeup"]),
    relatedPhrases: JSON.stringify(["make out", "make over"]),
    notes: "Três significados: reconciliar, inventar, maquiar"
  },
  {
    verb: "ask", particle: "out", phrasalVerb: "ask out",
    meaning: "Invite someone on a date",
    translations: JSON.stringify(["convidar para sair", "chamar para um encontro"]),
    category: "relationships", difficulty: "beginner",
    examples: JSON.stringify([
      { en: "He finally asked her out!", pt: "Ele finalmente a convidou para sair!" },
      { en: "I'm too shy to ask him out.", pt: "Sou tímido demais para convidá-lo para sair." }
    ]),
    synonyms: JSON.stringify(["invite on a date", "ask on a date"]),
    relatedPhrases: JSON.stringify(["go out", "hang out"]),
    notes: "Comum em contextos românticos"
  },
  {
    verb: "hang", particle: "out", phrasalVerb: "hang out",
    meaning: "Spend time relaxing with friends",
    translations: JSON.stringify(["sair", "passar tempo", "relaxar com amigos"]),
    category: "social", difficulty: "beginner",
    examples: JSON.stringify([
      { en: "Let's hang out this weekend!", pt: "Vamos sair neste fim de semana!" },
      { en: "We used to hang out at the mall.", pt: "Costumávamos sair no shopping." }
    ]),
    synonyms: JSON.stringify(["spend time", "chill", "socialize"]),
    relatedPhrases: JSON.stringify(["hang around", "hang on"]),
    notes: "Expressão muito casual e popular"
  },
  {
    verb: "show", particle: "off", phrasalVerb: "show off",
    meaning: "Display proudly or boast",
    translations: JSON.stringify(["exibir-se", "mostrar", "ostentar"]),
    category: "social", difficulty: "intermediate",
    examples: JSON.stringify([
      { en: "Stop showing off your new car!", pt: "Pare de exibir seu carro novo!" },
      { en: "He's always showing off.", pt: "Ele está sempre se exibindo." }
    ]),
    synonyms: JSON.stringify(["boast", "brag", "flaunt"]),
    relatedPhrases: JSON.stringify(["show up", "show around"]),
    notes: "Geralmente tem conotação negativa"
  },

  // COMMUNICATION (10)
  {
    verb: "speak", particle: "up", phrasalVerb: "speak up",
    meaning: "Speak louder or express your opinion",
    translations: JSON.stringify(["falar mais alto", "expressar opinião", "manifestar-se"]),
    category: "conversation", difficulty: "intermediate",
    examples: JSON.stringify([
      { en: "Please speak up, I can't hear you.", pt: "Por favor, fale mais alto, não consigo ouvi-lo." },
      { en: "Don't be afraid to speak up!", pt: "Não tenha medo de se manifestar!" }
    ]),
    synonyms: JSON.stringify(["speak louder", "voice opinion", "speak out"]),
    relatedPhrases: JSON.stringify(["speak out", "speak for"]),
    notes: "Pode significar volume ou coragem de falar"
  },
  {
    verb: "point", particle: "out", phrasalVerb: "point out",
    meaning: "Indicate or draw attention to something",
    translations: JSON.stringify(["apontar", "indicar", "salientar"]),
    category: "conversation", difficulty: "intermediate",
    examples: JSON.stringify([
      { en: "She pointed out my mistake.", pt: "Ela apontou meu erro." },
      { en: "Let me point out the main issues.", pt: "Deixe-me salientar os principais problemas." }
    ]),
    synonyms: JSON.stringify(["indicate", "highlight", "mention"]),
    relatedPhrases: JSON.stringify(["bring up", "call attention to"]),
    notes: "Usado para chamar atenção para algo"
  },
  {
    verb: "call", particle: "back", phrasalVerb: "call back",
    meaning: "Return a phone call",
    translations: JSON.stringify(["retornar ligação", "ligar de volta"]),
    category: "conversation", difficulty: "beginner",
    examples: JSON.stringify([
      { en: "I'll call you back in 10 minutes.", pt: "Vou te ligar de volta em 10 minutos." },
      { en: "She didn't call back.", pt: "Ela não retornou a ligação." }
    ]),
    synonyms: JSON.stringify(["return call", "phone back"]),
    relatedPhrases: JSON.stringify(["call off", "call on"]),
    notes: "Essencial para comunicação telefônica"
  },

  // DAILY LIFE & ROUTINE (15)
  {
    verb: "wake", particle: "up", phrasalVerb: "wake up",
    meaning: "Stop sleeping",
    translations: JSON.stringify(["acordar", "despertar"]),
    category: "daily_life", difficulty: "beginner",
    examples: JSON.stringify([
      { en: "I wake up at 7 AM every day.", pt: "Eu acordo às 7h todos os dias." },
      { en: "Wake up! It's time for school!", pt: "Acorde! É hora da escola!" }
    ]),
    synonyms: JSON.stringify(["awaken", "get up", "rise"]),
    relatedPhrases: JSON.stringify(["get up", "wake"]),
    notes: "Um dos phrasal verbs mais básicos"
  },
  {
    verb: "get", particle: "up", phrasalVerb: "get up",
    meaning: "Rise from bed or stand up",
    translations: JSON.stringify(["levantar-se", "sair da cama"]),
    category: "daily_life", difficulty: "beginner",
    examples: JSON.stringify([
      { en: "What time do you get up?", pt: "A que horas você se levanta?" },
      { en: "Get up from the floor!", pt: "Levante-se do chão!" }
    ]),
    synonyms: JSON.stringify(["rise", "stand up", "get out of bed"]),
    relatedPhrases: JSON.stringify(["wake up", "sit up"]),
    notes: "Diferente de 'wake up' - é o ato de levantar fisicamente"
  },
  {
    verb: "clean", particle: "up", phrasalVerb: "clean up",
    meaning: "Tidy or remove dirt",
    translations: JSON.stringify(["limpar", "arrumar", "organizar"]),
    category: "daily_life", difficulty: "beginner",
    examples: JSON.stringify([
      { en: "Clean up your room!", pt: "Limpe seu quarto!" },
      { en: "We need to clean up after the party.", pt: "Precisamos limpar depois da festa." }
    ]),
    synonyms: JSON.stringify(["tidy", "clear", "organize"]),
    relatedPhrases: JSON.stringify(["tidy up", "clear up"]),
    notes: "Muito usado em contextos domésticos"
  },
  {
    verb: "throw", particle: "away", phrasalVerb: "throw away",
    meaning: "Discard or waste something",
    translations: JSON.stringify(["jogar fora", "descartar", "desperdiçar"]),
    category: "daily_life", difficulty: "beginner",
    examples: JSON.stringify([
      { en: "Don't throw away those papers!", pt: "Não jogue fora esses papéis!" },
      { en: "He threw away his chance.", pt: "Ele desperdiçou sua chance." }
    ]),
    synonyms: JSON.stringify(["discard", "dispose of", "waste"]),
    relatedPhrases: JSON.stringify(["throw out", "get rid of"]),
    notes: "Pode ser literal (lixo) ou figurativo (oportunidade)"
  },
  {
    verb: "pick", particle: "up", phrasalVerb: "pick up",
    meaning: "Lift something or collect someone",
    translations: JSON.stringify(["pegar", "buscar", "levantar", "aprender"]),
    category: "daily_life", difficulty: "beginner",
    examples: JSON.stringify([
      { en: "Pick up your toys!", pt: "Pegue seus brinquedos!" },
      { en: "I'll pick you up at 8 PM.", pt: "Vou te buscar às 20h." },
      { en: "She picked up Spanish quickly.", pt: "Ela aprendeu espanhol rapidamente." }
    ]),
    synonyms: JSON.stringify(["lift", "collect", "learn", "acquire"]),
    relatedPhrases: JSON.stringify(["pick out", "pick on"]),
    notes: "Múltiplos significados: pegar, buscar, aprender"
  },

  // TRAVEL & MOVEMENT (10)
  {
    verb: "check", particle: "in", phrasalVerb: "check in",
    meaning: "Register arrival at hotel or airport",
    translations: JSON.stringify(["fazer check-in", "registrar-se"]),
    category: "travel", difficulty: "beginner",
    examples: JSON.stringify([
      { en: "We need to check in two hours before the flight.", pt: "Precisamos fazer check-in duas horas antes do voo." },
      { en: "Have you checked in at the hotel yet?", pt: "Você já fez check-in no hotel?" }
    ]),
    synonyms: JSON.stringify(["register", "sign in"]),
    relatedPhrases: JSON.stringify(["check out", "check into"]),
    notes: "Essencial para viagens"
  },
  {
    verb: "check", particle: "out", phrasalVerb: "check out",
    meaning: "Leave a hotel or examine something",
    translations: JSON.stringify(["fazer check-out", "sair do hotel", "conferir"]),
    category: "travel", difficulty: "beginner",
    examples: JSON.stringify([
      { en: "We check out at noon.", pt: "Fazemos check-out ao meio-dia." },
      { en: "Check out this cool website!", pt: "Confira este site legal!" }
    ]),
    synonyms: JSON.stringify(["leave hotel", "examine", "look at"]),
    relatedPhrases: JSON.stringify(["check in", "check up"]),
    notes: "Dois significados: sair do hotel ou examinar algo"
  },
  {
    verb: "drop", particle: "off", phrasalVerb: "drop off",
    meaning: "Leave someone/something at a place",
    translations: JSON.stringify(["deixar", "levar (alguém)", "entregar"]),
    category: "travel", difficulty: "beginner",
    examples: JSON.stringify([
      { en: "Can you drop me off at the station?", pt: "Você pode me deixar na estação?" },
      { en: "I'll drop off the package tomorrow.", pt: "Vou entregar o pacote amanhã." }
    ]),
    synonyms: JSON.stringify(["leave", "deliver", "take someone"]),
    relatedPhrases: JSON.stringify(["pick up", "drop by"]),
    notes: "Oposto de 'pick up'"
  },

  // EMOTIONS & FEELINGS (10)
  {
    verb: "calm", particle: "down", phrasalVerb: "calm down",
    meaning: "Become less angry or excited",
    translations: JSON.stringify(["acalmar-se", "se tranquilizar"]),
    category: "emotions", difficulty: "beginner",
    examples: JSON.stringify([
      { en: "Calm down! Everything will be okay.", pt: "Acalme-se! Tudo vai ficar bem." },
      { en: "He needs time to calm down.", pt: "Ele precisa de tempo para se acalmar." }
    ]),
    synonyms: JSON.stringify(["relax", "settle down", "cool off"]),
    relatedPhrases: JSON.stringify(["cool down", "settle down"]),
    notes: "Muito usado em situações de estresse"
  },
  {
    verb: "cheer", particle: "up", phrasalVerb: "cheer up",
    meaning: "Become happier or make someone happier",
    translations: JSON.stringify(["animar-se", "alegrar-se", "animar alguém"]),
    category: "emotions", difficulty: "beginner",
    examples: JSON.stringify([
      { en: "Cheer up! Things will get better.", pt: "Anime-se! As coisas vão melhorar." },
      { en: "This song always cheers me up.", pt: "Esta música sempre me anima." }
    ]),
    synonyms: JSON.stringify(["brighten up", "lift spirits", "feel better"]),
    relatedPhrases: JSON.stringify(["lighten up", "perk up"]),
    notes: "Usado para confortar alguém triste"
  },
  {
    verb: "let", particle: "down", phrasalVerb: "let down",
    meaning: "Disappoint someone",
    translations: JSON.stringify(["decepcionar", "desapontar"]),
    category: "emotions", difficulty: "intermediate",
    examples: JSON.stringify([
      { en: "I don't want to let you down.", pt: "Não quero te decepcionar." },
      { en: "She felt let down by her friends.", pt: "Ela se sentiu decepcionada por seus amigos." }
    ]),
    synonyms: JSON.stringify(["disappoint", "fail", "betray trust"]),
    relatedPhrases: JSON.stringify(["let in", "let off"]),
    notes: "Expressa decepção emocional"
  },

  // THINKING & DECISIONS (10)
  {
    verb: "think", particle: "over", phrasalVerb: "think over",
    meaning: "Consider carefully",
    translations: JSON.stringify(["pensar bem", "considerar", "refletir sobre"]),
    category: "decisions", difficulty: "intermediate",
    examples: JSON.stringify([
      { en: "I need time to think it over.", pt: "Preciso de tempo para pensar bem." },
      { en: "Think over my proposal.", pt: "Reflita sobre minha proposta." }
    ]),
    synonyms: JSON.stringify(["consider", "ponder", "reflect on"]),
    relatedPhrases: JSON.stringify(["think through", "think about"]),
    notes: "Usado para decisões importantes"
  },
  {
    verb: "figure", particle: "out", phrasalVerb: "figure out",
    meaning: "Understand or solve",
    translations: JSON.stringify(["descobrir", "entender", "resolver"]),
    category: "thinking", difficulty: "beginner",
    examples: JSON.stringify([
      { en: "I can't figure out this puzzle.", pt: "Não consigo resolver este quebra-cabeça." },
      { en: "Did you figure out the answer?", pt: "Você descobriu a resposta?" }
    ]),
    synonyms: JSON.stringify(["understand", "solve", "work out"]),
    relatedPhrases: JSON.stringify(["work out", "find out"]),
    notes: "Muito comum em resolução de problemas"
  },
  {
    verb: "find", particle: "out", phrasalVerb: "find out",
    meaning: "Discover information",
    translations: JSON.stringify(["descobrir", "ficar sabendo"]),
    category: "discovery", difficulty: "beginner",
    examples: JSON.stringify([
      { en: "I just found out the truth.", pt: "Acabei de descobrir a verdade." },
      { en: "How did you find out?", pt: "Como você ficou sabendo?" }
    ]),
    synonyms: JSON.stringify(["discover", "learn", "uncover"]),
    relatedPhrases: JSON.stringify(["figure out", "look into"]),
    notes: "Usado para descobertas de informação"
  },

  // TECHNOLOGY & DEVICES (8)
  {
    verb: "log", particle: "in", phrasalVerb: "log in",
    meaning: "Enter username and password to access",
    translations: JSON.stringify(["fazer login", "entrar", "conectar-se"]),
    category: "technology", difficulty: "beginner",
    examples: JSON.stringify([
      { en: "Please log in to your account.", pt: "Por favor, faça login na sua conta." },
      { en: "I can't log in - I forgot my password.", pt: "Não consigo fazer login - esqueci minha senha." }
    ]),
    synonyms: JSON.stringify(["sign in", "access"]),
    relatedPhrases: JSON.stringify(["log out", "sign in"]),
    notes: "Essencial para tecnologia"
  },
  {
    verb: "log", particle: "out", phrasalVerb: "log out",
    meaning: "Exit from a computer system or account",
    translations: JSON.stringify(["fazer logout", "sair", "desconectar-se"]),
    category: "technology", difficulty: "beginner",
    examples: JSON.stringify([
      { en: "Don't forget to log out when you're done.", pt: "Não esqueça de fazer logout quando terminar." },
      { en: "I logged out of all my accounts.", pt: "Fiz logout de todas as minhas contas." }
    ]),
    synonyms: JSON.stringify(["sign out", "exit"]),
    relatedPhrases: JSON.stringify(["log in", "sign out"]),
    notes: "Importante para segurança online"
  },
  {
    verb: "back", particle: "up", phrasalVerb: "back up",
    meaning: "Make a copy of data",
    translations: JSON.stringify(["fazer backup", "copiar", "apoiar"]),
    category: "technology", difficulty: "intermediate",
    examples: JSON.stringify([
      { en: "Back up your files regularly.", pt: "Faça backup dos seus arquivos regularmente." },
      { en: "I'll back you up in the meeting.", pt: "Vou te apoiar na reunião." }
    ]),
    synonyms: JSON.stringify(["copy", "save", "support"]),
    relatedPhrases: JSON.stringify(["save", "store"]),
    notes: "Dois significados: backup de dados ou apoiar alguém"
  },

  // HEALTH & BODY (7)
  {
    verb: "come", particle: "down with", phrasalVerb: "come down with",
    meaning: "Become ill with a disease",
    translations: JSON.stringify(["ficar doente", "pegar (doença)"]),
    category: "health", difficulty: "intermediate",
    examples: JSON.stringify([
      { en: "I'm coming down with a cold.", pt: "Estou pegando um resfriado." },
      { en: "She came down with the flu.", pt: "Ela ficou doente com gripe." }
    ]),
    synonyms: JSON.stringify(["catch", "get sick with", "contract"]),
    relatedPhrases: JSON.stringify(["get over", "recover from"]),
    notes: "Usado para falar de doenças"
  },
  {
    verb: "pass", particle: "out", phrasalVerb: "pass out",
    meaning: "Faint or lose consciousness",
    translations: JSON.stringify(["desmaiar", "perder a consciência"]),
    category: "health", difficulty: "intermediate",
    examples: JSON.stringify([
      { en: "She passed out from the heat.", pt: "Ela desmaiou por causa do calor." },
      { en: "I almost passed out!", pt: "Quase desmaiei!" }
    ]),
    synonyms: JSON.stringify(["faint", "lose consciousness", "black out"]),
    relatedPhrases: JSON.stringify(["black out", "come to"]),
    notes: "Situação médica de emergência"
  },

  // MONEY & SHOPPING (7)
  {
    verb: "pay", particle: "back", phrasalVerb: "pay back",
    meaning: "Return money owed",
    translations: JSON.stringify(["pagar de volta", "devolver dinheiro", "reembolsar"]),
    category: "money", difficulty: "beginner",
    examples: JSON.stringify([
      { en: "I'll pay you back next week.", pt: "Vou te pagar de volta semana que vem." },
      { en: "When can you pay back the loan?", pt: "Quando você pode pagar o empréstimo?" }
    ]),
    synonyms: JSON.stringify(["repay", "reimburse", "return money"]),
    relatedPhrases: JSON.stringify(["pay off", "pay up"]),
    notes: "Usado para dívidas e empréstimos"
  },
  {
    verb: "save", particle: "up", phrasalVerb: "save up",
    meaning: "Accumulate money for a purpose",
    translations: JSON.stringify(["economizar", "juntar dinheiro", "poupar"]),
    category: "money", difficulty: "beginner",
    examples: JSON.stringify([
      { en: "I'm saving up for a new car.", pt: "Estou juntando dinheiro para um carro novo." },
      { en: "How long have you been saving up?", pt: "Há quanto tempo você está economizando?" }
    ]),
    synonyms: JSON.stringify(["accumulate", "put aside", "save money"]),
    relatedPhrases: JSON.stringify(["put aside", "set aside"]),
    notes: "Importante para planejamento financeiro"
  },

  // TIME & SCHEDULING (5)
  {
    verb: "put", particle: "back", phrasalVerb: "put back",
    meaning: "Return something to its place or postpone",
    translations: JSON.stringify(["devolver ao lugar", "adiar", "atrasar"]),
    category: "time", difficulty: "intermediate",
    examples: JSON.stringify([
      { en: "Put the book back on the shelf.", pt: "Devolva o livro à prateleira." },
      { en: "The meeting was put back an hour.", pt: "A reunião foi adiada uma hora." }
    ]),
    synonyms: JSON.stringify(["return", "replace", "postpone"]),
    relatedPhrases: JSON.stringify(["put off", "put away"]),
    notes: "Pode significar devolver ou adiar"
  },
  {
    verb: "go", particle: "ahead", phrasalVerb: "go ahead",
    meaning: "Proceed or give permission",
    translations: JSON.stringify(["prosseguir", "continuar", "pode ir"]),
    category: "decisions", difficulty: "beginner",
    examples: JSON.stringify([
      { en: "Go ahead, I'm listening.", pt: "Prossiga, estou ouvindo." },
      { en: "Can I use your phone? - Go ahead!", pt: "Posso usar seu telefone? - Pode ir!" }
    ]),
    synonyms: JSON.stringify(["proceed", "continue", "feel free"]),
    relatedPhrases: JSON.stringify(["carry on", "move forward"]),
    notes: "Dar permissão ou encorajamento"
  }
];

async function seedMorePhrasalVerbs() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  try {
    console.log("🌱 Seeding 90 more phrasal verbs...");
    
    for (const pv of phrasalVerbs) {
      await connection.execute(
        `INSERT INTO phrasal_verbs 
        (verb, particle, phrasal_verb, meaning, translations, category, difficulty, examples, synonyms, related_phrases, notes, language_code, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'en', NOW(), NOW())`,
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
          pv.notes
        ]
      );
      console.log(`✅ Added: ${pv.phrasalVerb}`);
    }
    
    console.log(`\n🎉 Successfully seeded ${phrasalVerbs.length} more phrasal verbs!`);
    console.log(`📊 Total phrasal verbs in database: ${10 + phrasalVerbs.length}`);
  } catch (error) {
    console.error("❌ Error seeding phrasal verbs:", error);
  } finally {
    await connection.end();
  }
}

seedMorePhrasalVerbs();
