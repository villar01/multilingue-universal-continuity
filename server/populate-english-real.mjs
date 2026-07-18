import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const conn = await mysql.createConnection(process.env.DATABASE_URL);

console.log('🚀 Criando lições REAIS de Inglês - Beginner\n');

// Buscar curso de inglês beginner
const [courses] = await conn.query(`
  SELECT c.id FROM courses c
  JOIN languages l ON c.languageId = l.id
  WHERE l.code = 'en' AND c.level = 'beginner'
  LIMIT 1
`);

if (courses.length === 0) {
  console.log('❌ Curso de inglês não encontrado!');
  process.exit(1);
}

const courseId = courses[0].id;
console.log('✅ Curso ID:', courseId);

// Deletar lições antigas
await conn.query('DELETE FROM exercises WHERE lessonId IN (SELECT id FROM lessons WHERE courseId = ?)', [courseId]);
await conn.query('DELETE FROM lessons WHERE courseId = ?', [courseId]);
console.log('✅ Lições antigas removidas\n');

// Lições com conteúdo REAL
const lessons = [
  {
    title: 'Lesson 1: Greetings and Basic Introductions',
    description: 'Learn how to greet people and introduce yourself in English',
    content: `# Greetings and Basic Introductions

## Vocabulary
- **Hello** - Olá (formal and informal)
- **Hi** - Oi (informal)
- **Good morning** - Bom dia (until 12pm)
- **Good afternoon** - Boa tarde (12pm-6pm)
- **Good evening** - Boa noite (after 6pm)
- **Goodbye** - Tchau (formal)
- **Bye** - Tchau (informal)
- **My name is...** - Meu nome é...
- **What is your name?** - Qual é o seu nome?
- **Nice to meet you** - Prazer em conhecê-lo

## Grammar: Personal Pronouns
- **I** (eu) - I am John
- **You** (você) - You are Maria
- **He** (ele) - He is my friend
- **She** (ela) - She is a teacher

## Examples
- "Hello! My name is John. What is your name?"
- "Hi! I am Maria. Nice to meet you!"
- "Good morning! How are you?"`,
    exercises: [
      { question: 'How do you say "Olá" in English?', answer: 'Hello', options: ['Hello', 'Goodbye', 'Thanks', 'Please'] },
      { question: 'What is the correct greeting in the morning?', answer: 'Good morning', options: ['Good morning', 'Good night', 'Good afternoon', 'Good evening'] },
      { question: 'Complete: "My name ___ John"', answer: 'is', options: ['is', 'are', 'am', 'be'] },
      { question: 'How do you ask someone\'s name?', answer: 'What is your name?', options: ['What is your name?', 'How are you?', 'Where are you?', 'Who are you?'] },
      { question: 'What does "Nice to meet you" mean?', answer: 'Prazer em conhecê-lo', options: ['Prazer em conhecê-lo', 'Como vai?', 'Até logo', 'Obrigado'] }
    ]
  },
  {
    title: 'Lesson 2: Numbers 1-20',
    description: 'Learn to count from 1 to 20 in English',
    content: `# Numbers 1-20

## Vocabulary: Numbers 1-10
- **1** - one
- **2** - two
- **3** - three
- **4** - four
- **5** - five
- **6** - six
- **7** - seven
- **8** - eight
- **9** - nine
- **10** - ten

## Vocabulary: Numbers 11-20
- **11** - eleven
- **12** - twelve
- **13** - thirteen
- **14** - fourteen
- **15** - fifteen
- **16** - sixteen
- **17** - seventeen
- **18** - eighteen
- **19** - nineteen
- **20** - twenty

## Grammar: Using Numbers
- "I have **two** brothers" (Eu tenho dois irmãos)
- "She is **fifteen** years old" (Ela tem quinze anos)
- "There are **twenty** students" (Há vinte estudantes)

## Examples
- "I am twenty years old"
- "My phone number is five-five-five, one-two-three-four"`,
    exercises: [
      { question: 'What number is "seven"?', answer: '7', options: ['7', '8', '9', '6'] },
      { question: 'How do you say "15" in English?', answer: 'fifteen', options: ['fifteen', 'fifty', 'five', 'fourteen'] },
      { question: 'Complete: "I have ___ apples" (3)', answer: 'three', options: ['three', 'tree', 'free', 'third'] },
      { question: 'What comes after nineteen?', answer: 'twenty', options: ['twenty', 'twenty-one', 'eighteen', 'thirty'] },
      { question: 'How do you write "12"?', answer: 'twelve', options: ['twelve', 'twenty', 'two', 'eleven'] }
    ]
  },
  {
    title: 'Lesson 3: Colors and Descriptions',
    description: 'Learn basic colors and how to describe things',
    content: `# Colors and Descriptions

## Vocabulary: Colors
- **Red** - vermelho
- **Blue** - azul
- **Yellow** - amarelo
- **Green** - verde
- **Black** - preto
- **White** - branco
- **Orange** - laranja
- **Purple** - roxo
- **Pink** - rosa
- **Brown** - marrom

## Grammar: Adjectives
Adjectives describe nouns. In English, adjectives come BEFORE the noun.

- "The **red** car" (O carro vermelho)
- "A **big** house" (Uma casa grande)
- "**Beautiful** flowers" (Flores bonitas)

## Common Adjectives
- **Big** - grande
- **Small** - pequeno
- **Beautiful** - bonito
- **Ugly** - feio
- **New** - novo
- **Old** - velho

## Examples
- "I have a blue car"
- "The sky is blue"
- "She has beautiful green eyes"`,
    exercises: [
      { question: 'What color is the sky?', answer: 'blue', options: ['blue', 'green', 'red', 'yellow'] },
      { question: 'How do you say "vermelho" in English?', answer: 'red', options: ['red', 'read', 'bread', 'bed'] },
      { question: 'Complete: "The ___ is yellow" (sun)', answer: 'sun', options: ['sun', 'moon', 'star', 'cloud'] },
      { question: 'What is the opposite of "big"?', answer: 'small', options: ['small', 'large', 'huge', 'tall'] },
      { question: 'Which is correct?', answer: 'a red car', options: ['a red car', 'a car red', 'red a car', 'car a red'] }
    ]
  },
  {
    title: 'Lesson 4: Family Members',
    description: 'Learn vocabulary about family relationships',
    content: `# Family Members

## Vocabulary: Immediate Family
- **Father / Dad** - pai
- **Mother / Mom** - mãe
- **Brother** - irmão
- **Sister** - irmã
- **Son** - filho
- **Daughter** - filha
- **Husband** - marido
- **Wife** - esposa

## Vocabulary: Extended Family
- **Grandfather / Grandpa** - avô
- **Grandmother / Grandma** - avó
- **Uncle** - tio
- **Aunt** - tia
- **Cousin** - primo/prima
- **Nephew** - sobrinho
- **Niece** - sobrinha

## Grammar: Possessive Adjectives
- **My** - meu/minha
- **Your** - seu/sua
- **His** - dele
- **Her** - dela

## Examples
- "This is my father"
- "Her mother is a doctor"
- "I have two brothers and one sister"`,
    exercises: [
      { question: 'What is "pai" in English?', answer: 'father', options: ['father', 'mother', 'brother', 'uncle'] },
      { question: 'Complete: "___ mother is a teacher" (dela)', answer: 'Her', options: ['Her', 'His', 'My', 'Your'] },
      { question: 'What is the female version of "brother"?', answer: 'sister', options: ['sister', 'daughter', 'mother', 'aunt'] },
      { question: 'How do you say "avó"?', answer: 'grandmother', options: ['grandmother', 'mother', 'aunt', 'sister'] },
      { question: 'What is "sobrinho" in English?', answer: 'nephew', options: ['nephew', 'cousin', 'uncle', 'son'] }
    ]
  },
  {
    title: 'Lesson 5: Common Verbs - Present Simple',
    description: 'Learn essential verbs and how to use them in present tense',
    content: `# Common Verbs - Present Simple

## Vocabulary: Essential Verbs
- **To be** - ser/estar (I am, you are, he/she is)
- **To have** - ter (I have, you have, he/she has)
- **To go** - ir (I go, you go, he/she goes)
- **To do** - fazer (I do, you do, he/she does)
- **To eat** - comer
- **To drink** - beber
- **To sleep** - dormir
- **To work** - trabalhar
- **To study** - estudar
- **To live** - morar

## Grammar: Present Simple
Use for habits, facts, and routines.

**Structure:**
- I/You/We/They + verb
- He/She/It + verb + **s**

## Examples
- "I **work** every day" (Eu trabalho todo dia)
- "She **works** at a hospital" (Ela trabalha em um hospital)
- "They **study** English" (Eles estudam inglês)
- "He **goes** to school" (Ele vai para a escola)`,
    exercises: [
      { question: 'Complete: "I ___ English" (study)', answer: 'study', options: ['study', 'studies', 'studying', 'studied'] },
      { question: 'Complete: "She ___ coffee" (drink)', answer: 'drinks', options: ['drinks', 'drink', 'drinking', 'drank'] },
      { question: 'What is "trabalhar" in English?', answer: 'to work', options: ['to work', 'to walk', 'to talk', 'to watch'] },
      { question: 'Complete: "He ___ to school" (go)', answer: 'goes', options: ['goes', 'go', 'going', 'gone'] },
      { question: 'Which is correct?', answer: 'I have a car', options: ['I have a car', 'I has a car', 'I having a car', 'I haves a car'] }
    ]
  },
  {
    title: 'Lesson 6: Days of the Week',
    description: 'Learn the days of the week and time expressions',
    content: `# Days of the Week

## Vocabulary: Days
- **Monday** - segunda-feira
- **Tuesday** - terça-feira
- **Wednesday** - quarta-feira
- **Thursday** - quinta-feira
- **Friday** - sexta-feira
- **Saturday** - sábado
- **Sunday** - domingo

## Vocabulary: Time Expressions
- **Today** - hoje
- **Tomorrow** - amanhã
- **Yesterday** - ontem
- **Week** - semana
- **Weekend** - fim de semana
- **Every day** - todo dia

## Grammar: Prepositions of Time
- **On** + days: "on Monday", "on Friday"
- **In** + parts of day: "in the morning", "in the evening"
- **At** + specific time: "at 8 o'clock", "at night"

## Examples
- "I work on Monday"
- "The class is on Wednesday"
- "I don't work on Saturday and Sunday"`,
    exercises: [
      { question: 'What day comes after Monday?', answer: 'Tuesday', options: ['Tuesday', 'Wednesday', 'Thursday', 'Sunday'] },
      { question: 'How do you say "sábado"?', answer: 'Saturday', options: ['Saturday', 'Sunday', 'Friday', 'Thursday'] },
      { question: 'Complete: "I work ___ Monday"', answer: 'on', options: ['on', 'in', 'at', 'to'] },
      { question: 'What is "amanhã" in English?', answer: 'tomorrow', options: ['tomorrow', 'today', 'yesterday', 'tonight'] },
      { question: 'Which days are the weekend?', answer: 'Saturday and Sunday', options: ['Saturday and Sunday', 'Monday and Friday', 'Friday and Saturday', 'Sunday and Monday'] }
    ]
  },
  {
    title: 'Lesson 7: Food and Drinks',
    description: 'Learn vocabulary about food, drinks, and meals',
    content: `# Food and Drinks

## Vocabulary: Meals
- **Breakfast** - café da manhã
- **Lunch** - almoço
- **Dinner** - jantar
- **Snack** - lanche

## Vocabulary: Food
- **Bread** - pão
- **Rice** - arroz
- **Meat** - carne
- **Chicken** - frango
- **Fish** - peixe
- **Egg** - ovo
- **Cheese** - queijo
- **Fruit** - fruta
- **Vegetable** - vegetal

## Vocabulary: Drinks
- **Water** - água
- **Milk** - leite
- **Coffee** - café
- **Tea** - chá
- **Juice** - suco
- **Soda** - refrigerante

## Grammar: Like/Love + -ing
- "I **like eating** pizza"
- "She **loves drinking** coffee"

## Examples
- "I have breakfast at 7 AM"
- "I like chicken and rice"
- "Do you want water or juice?"`,
    exercises: [
      { question: 'What is "café da manhã" in English?', answer: 'breakfast', options: ['breakfast', 'lunch', 'dinner', 'snack'] },
      { question: 'How do you say "água"?', answer: 'water', options: ['water', 'milk', 'juice', 'coffee'] },
      { question: 'Complete: "I ___ pizza" (like)', answer: 'like', options: ['like', 'likes', 'liking', 'liked'] },
      { question: 'What is "frango" in English?', answer: 'chicken', options: ['chicken', 'fish', 'meat', 'egg'] },
      { question: 'Which is a drink?', answer: 'tea', options: ['tea', 'bread', 'rice', 'cheese'] }
    ]
  },
  {
    title: 'Lesson 8: Common Questions',
    description: 'Learn how to ask and answer basic questions',
    content: `# Common Questions

## Question Words
- **What** - o que
- **Where** - onde
- **When** - quando
- **Who** - quem
- **Why** - por que
- **How** - como
- **How much** - quanto (preço)
- **How many** - quantos

## Common Questions
- **What is your name?** - Qual é o seu nome?
- **Where are you from?** - De onde você é?
- **How old are you?** - Quantos anos você tem?
- **What do you do?** - O que você faz? (profissão)
- **Where do you live?** - Onde você mora?
- **How are you?** - Como você está?

## Grammar: Question Structure
**Yes/No Questions:**
- Do/Does + subject + verb?
- "Do you like coffee?"

**Wh- Questions:**
- Wh-word + do/does + subject + verb?
- "Where do you live?"

## Examples
- "What is your name?" - "My name is John"
- "Where are you from?" - "I am from Brazil"
- "How old are you?" - "I am 25 years old"`,
    exercises: [
      { question: 'What question word means "onde"?', answer: 'Where', options: ['Where', 'When', 'What', 'Who'] },
      { question: 'Complete: "___ is your name?"', answer: 'What', options: ['What', 'Where', 'When', 'Why'] },
      { question: 'How do you ask someone\'s age?', answer: 'How old are you?', options: ['How old are you?', 'How are you?', 'What are you?', 'Where are you?'] },
      { question: 'What does "Why" mean?', answer: 'por que', options: ['por que', 'quando', 'onde', 'como'] },
      { question: 'Complete: "___ do you live?"', answer: 'Where', options: ['Where', 'What', 'Who', 'When'] }
    ]
  },
  {
    title: 'Lesson 9: Telling Time',
    description: 'Learn how to tell time and talk about hours',
    content: `# Telling Time

## Vocabulary: Time
- **Hour** - hora
- **Minute** - minuto
- **Second** - segundo
- **Clock** - relógio
- **Watch** - relógio de pulso
- **Time** - hora/tempo

## Telling Time
- **O'clock** - hora exata
  - "It's 3 o'clock" (São 3 horas)
- **Half past** - meia hora
  - "It's half past 2" (São 2 e meia)
- **Quarter past** - 15 minutos
  - "It's quarter past 5" (São 5 e quinze)
- **Quarter to** - faltam 15 minutos
  - "It's quarter to 7" (São 6 e quarenta e cinco)

## Asking Time
- **What time is it?** - Que horas são?
- **What time do you...?** - A que horas você...?

## Examples
- "What time is it?" - "It's 9 o'clock"
- "What time do you wake up?" - "I wake up at 7 AM"
- "The class starts at half past 2"`,
    exercises: [
      { question: 'How do you ask the time?', answer: 'What time is it?', options: ['What time is it?', 'What is time?', 'When is it?', 'How is time?'] },
      { question: 'What does "o\'clock" mean?', answer: 'hora exata', options: ['hora exata', 'meia hora', 'quinze minutos', 'meio dia'] },
      { question: 'Complete: "It\'s 3 ___"', answer: 'o\'clock', options: ['o\'clock', 'hour', 'hours', 'time'] },
      { question: 'What is "relógio" in English?', answer: 'clock', options: ['clock', 'time', 'hour', 'watch'] },
      { question: 'What does "half past 2" mean?', answer: '2:30', options: ['2:30', '2:15', '2:45', '2:00'] }
    ]
  },
  {
    title: 'Lesson 10: Review and Practice',
    description: 'Review everything you learned in the beginner course',
    content: `# Review and Practice

## What You Learned

### Lesson 1-2: Basics
- Greetings (Hello, Good morning)
- Numbers 1-20
- Personal pronouns (I, you, he, she)

### Lesson 3-4: Descriptions
- Colors (red, blue, green)
- Family members (father, mother, brother)
- Adjectives (big, small, beautiful)

### Lesson 5-6: Actions and Time
- Common verbs (work, study, eat)
- Present Simple tense
- Days of the week

### Lesson 7-9: Daily Life
- Food and drinks
- Common questions
- Telling time

## Practice Sentences
1. "Hello! My name is John. I am 25 years old."
2. "I have two brothers and one sister."
3. "I work on Monday, Tuesday, and Wednesday."
4. "I like eating pizza and drinking coffee."
5. "What time is it? It's 3 o'clock."

## Next Steps
- Practice speaking every day
- Watch English videos
- Read simple English texts
- Continue to Intermediate level!`,
    exercises: [
      { question: 'How do you introduce yourself?', answer: 'My name is...', options: ['My name is...', 'I have...', 'I like...', 'I work...'] },
      { question: 'Complete: "I ___ two brothers" (have)', answer: 'have', options: ['have', 'has', 'having', 'had'] },
      { question: 'What is the correct order?', answer: 'I like coffee', options: ['I like coffee', 'I coffee like', 'Like I coffee', 'Coffee I like'] },
      { question: 'Which is a greeting?', answer: 'Good morning', options: ['Good morning', 'Thank you', 'Goodbye', 'Please'] },
      { question: 'Complete: "She ___ on Monday" (work)', answer: 'works', options: ['works', 'work', 'working', 'worked'] }
    ]
  }
];

console.log('📝 Criando 10 lições com conteúdo real...\n');

for (let i = 0; i < lessons.length; i++) {
  const lesson = lessons[i];
  
  // Inserir lição
  const [result] = await conn.query(`
    INSERT INTO lessons (courseId, title, description, orderIndex, content, estimatedMinutes, languageCode)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [courseId, lesson.title, lesson.description, i + 1, lesson.content, 15, 'en']);
  
  const lessonId = result.insertId;
  
  // Inserir exercícios
  for (let j = 0; j < lesson.exercises.length; j++) {
    const ex = lesson.exercises[j];
    await conn.query(`
      INSERT INTO exercises (lessonId, type, question, correctAnswer, options, orderIndex, points)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [lessonId, 'multiple_choice', ex.question, ex.answer, JSON.stringify(ex.options), j + 1, 20]);
  }
  
  console.log(`✅ Lição ${i + 1}: ${lesson.title}`);
}

console.log('\n🎉 CONCLUÍDO! 10 lições reais de inglês criadas!');
console.log('📊 Total: 10 lições + 50 exercícios com conteúdo real');

await conn.end();
