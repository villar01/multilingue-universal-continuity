/**
 * upgrade-exercises.mjs
 * Substitui exercícios triviais por exercícios ricos com vocabulário contextual via IA
 * Usa o invokeLLM do servidor para gerar exercícios de alta qualidade
 */
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env') });

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) throw new Error('DATABASE_URL not set');

// Parse DATABASE_URL
function parseDbUrl(url) {
  // Remove query string for parsing
  const cleanUrl = url.split('?')[0];
  const match = cleanUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  if (!match) throw new Error('Invalid DATABASE_URL: ' + cleanUrl);
  return {
    user: match[1],
    password: match[2],
    host: match[3],
    port: parseInt(match[4]),
    database: match[5],
    ssl: { rejectUnauthorized: true },
  };
}

const FORGE_API_URL = process.env.BUILT_IN_FORGE_API_URL;
const FORGE_API_KEY = process.env.BUILT_IN_FORGE_API_KEY;

async function callLLM(prompt) {
  const res = await fetch(`${FORGE_API_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${FORGE_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an expert language teacher creating high-quality exercises. Always respond with valid JSON only, no markdown.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });
  const data = await res.json();
  return data.choices[0].message.content;
}

// Exercícios pré-definidos de alta qualidade para cada tema (fallback sem IA)
const RICH_EXERCISES = {
  // English lessons
  'Colors Around Us': [
    { type: 'multiple_choice', question: 'Which color do you get when you mix red and blue?', correctAnswer: 'Purple', options: ['Purple', 'Orange', 'Green', 'Brown'], points: 15 },
    { type: 'fill_blank', question: 'The traffic light turns _____ when you must stop.', correctAnswer: 'red', options: ['red', 'green', 'yellow', 'blue'], points: 10 },
    { type: 'multiple_choice', question: 'What color is associated with nature, trees, and grass?', correctAnswer: 'Green', options: ['Green', 'Brown', 'Blue', 'Yellow'], points: 10 },
    { type: 'fill_blank', question: 'The ocean and the sky are both shades of _____.', correctAnswer: 'blue', options: ['blue', 'green', 'gray', 'white'], points: 10 },
    { type: 'multiple_choice', question: 'Which color represents caution and is used on warning signs?', correctAnswer: 'Yellow', options: ['Yellow', 'Red', 'Orange', 'Black'], points: 15 },
    { type: 'translation', question: 'Translate to English: "A cor do sangue é vermelha."', correctAnswer: 'The color of blood is red.', options: null, points: 20 },
    { type: 'fill_blank', question: 'Snow and clouds are usually _____ in color.', correctAnswer: 'white', options: ['white', 'gray', 'silver', 'cream'], points: 10 },
    { type: 'multiple_choice', question: 'What color do you associate with gold and sunshine?', correctAnswer: 'Golden yellow', options: ['Golden yellow', 'Orange', 'Beige', 'Cream'], points: 15 },
  ],
  'The Family': [
    { type: 'multiple_choice', question: 'What do you call your mother\'s sister?', correctAnswer: 'Aunt', options: ['Aunt', 'Cousin', 'Niece', 'Grandmother'], points: 10 },
    { type: 'fill_blank', question: 'My father\'s father is my _____.', correctAnswer: 'grandfather', options: ['grandfather', 'uncle', 'father-in-law', 'stepfather'], points: 10 },
    { type: 'multiple_choice', question: 'Which word describes a child whose parents are not married?', correctAnswer: 'None of these — all children are equal', options: ['None of these — all children are equal', 'Orphan', 'Stepchild', 'Foster child'], points: 15 },
    { type: 'fill_blank', question: 'When a woman marries, her husband\'s mother becomes her _____.', correctAnswer: 'mother-in-law', options: ['mother-in-law', 'stepmother', 'aunt', 'godmother'], points: 15 },
    { type: 'multiple_choice', question: 'What is the correct term for children of your siblings?', correctAnswer: 'Nieces and nephews', options: ['Nieces and nephews', 'Cousins', 'Godchildren', 'Stepchildren'], points: 15 },
    { type: 'translation', question: 'Translate: "Minha irmã mais velha tem dois filhos gêmeos."', correctAnswer: 'My older sister has two twin children.', options: null, points: 20 },
    { type: 'fill_blank', question: 'A person who has lost both parents is called an _____.', correctAnswer: 'orphan', options: ['orphan', 'widow', 'guardian', 'foster child'], points: 15 },
    { type: 'multiple_choice', question: 'What do you call the ceremony where two people get married?', correctAnswer: 'Wedding', options: ['Wedding', 'Baptism', 'Funeral', 'Graduation'], points: 10 },
  ],
  'Greetings & Introductions': [
    { type: 'multiple_choice', question: 'Which greeting is most appropriate for a formal business meeting?', correctAnswer: 'Good morning, it\'s a pleasure to meet you.', options: ['Good morning, it\'s a pleasure to meet you.', 'Hey, what\'s up?', 'Yo, how\'s it going?', 'Sup dude!'], points: 15 },
    { type: 'fill_blank', question: 'When meeting someone for the first time, you say "Nice to _____ you."', correctAnswer: 'meet', options: ['meet', 'see', 'know', 'find'], points: 10 },
    { type: 'multiple_choice', question: 'What is the correct response to "How do you do?"', correctAnswer: 'How do you do?', options: ['How do you do?', 'I\'m fine, thanks.', 'Very good.', 'Not bad.'], points: 20 },
    { type: 'translation', question: 'Translate: "Prazer em conhecê-lo. Meu nome é Carlos."', correctAnswer: 'Pleased to meet you. My name is Carlos.', options: null, points: 20 },
    { type: 'fill_blank', question: '"Good _____ " is used when saying goodbye in the evening.', correctAnswer: 'night', options: ['night', 'evening', 'bye', 'day'], points: 10 },
    { type: 'multiple_choice', question: 'Which phrase means you are introducing yourself?', correctAnswer: 'Allow me to introduce myself.', options: ['Allow me to introduce myself.', 'I\'d like to introduce you.', 'Let me present her.', 'This is my friend.'], points: 15 },
    { type: 'fill_blank', question: 'In a formal email, you start with "Dear Mr./Ms. _____ ."', correctAnswer: '[Last Name]', options: ['[Last Name]', '[First Name]', '[Nickname]', '[Title]'], points: 15 },
    { type: 'multiple_choice', question: 'What does "RSVP" mean on an invitation?', correctAnswer: 'Please respond (from French: Répondez s\'il vous plaît)', options: ['Please respond (from French: Répondez s\'il vous plaît)', 'Reserved seating very preferred', 'Respond soon via phone', 'Regrets sent via post'], points: 20 },
  ],
  'Daily Routines': [
    { type: 'multiple_choice', question: 'What is the correct order of a typical morning routine?', correctAnswer: 'Wake up → brush teeth → shower → get dressed → have breakfast', options: ['Wake up → brush teeth → shower → get dressed → have breakfast', 'Have breakfast → wake up → shower → brush teeth → get dressed', 'Shower → wake up → brush teeth → have breakfast → get dressed', 'Get dressed → wake up → shower → have breakfast → brush teeth'], points: 20 },
    { type: 'fill_blank', question: 'I _____ my teeth twice a day — once in the morning and once before bed.', correctAnswer: 'brush', options: ['brush', 'clean', 'wash', 'scrub'], points: 10 },
    { type: 'multiple_choice', question: 'Which verb is used with "a nap"?', correctAnswer: 'Take', options: ['Take', 'Have', 'Do', 'Make'], points: 15 },
    { type: 'translation', question: 'Translate: "Eu acordo às 6h e tomo café da manhã antes de ir trabalhar."', correctAnswer: 'I wake up at 6 AM and have breakfast before going to work.', options: null, points: 20 },
    { type: 'fill_blank', question: 'She _____ to work by subway every day.', correctAnswer: 'commutes', options: ['commutes', 'travels', 'goes', 'rides'], points: 15 },
    { type: 'multiple_choice', question: 'What does "to pull an all-nighter" mean?', correctAnswer: 'To stay awake all night working or studying', options: ['To stay awake all night working or studying', 'To sleep for more than 12 hours', 'To wake up very early', 'To take a long nap'], points: 20 },
    { type: 'fill_blank', question: 'After dinner, he usually _____ the dishes.', correctAnswer: 'washes', options: ['washes', 'cleans', 'does', 'makes'], points: 10 },
    { type: 'multiple_choice', question: 'Which expression means to exercise regularly?', correctAnswer: 'Work out', options: ['Work out', 'Work up', 'Work over', 'Work through'], points: 15 },
  ],
  'Food & Drinks': [
    { type: 'multiple_choice', question: 'Which cooking method involves submerging food in hot oil?', correctAnswer: 'Deep frying', options: ['Deep frying', 'Steaming', 'Braising', 'Poaching'], points: 15 },
    { type: 'fill_blank', question: 'A dish that is cooked slowly in liquid over low heat is said to be _____.', correctAnswer: 'simmered', options: ['simmered', 'boiled', 'fried', 'baked'], points: 15 },
    { type: 'multiple_choice', question: 'What is the difference between "rare" and "well-done" when ordering a steak?', correctAnswer: 'Rare is barely cooked (pink inside); well-done is fully cooked (no pink)', options: ['Rare is barely cooked (pink inside); well-done is fully cooked (no pink)', 'Rare is expensive; well-done is cheap', 'Rare means small portion; well-done means large portion', 'Rare is grilled; well-done is fried'], points: 20 },
    { type: 'translation', question: 'Translate: "Eu sou vegetariano. Você tem opções sem carne?"', correctAnswer: 'I am vegetarian. Do you have meat-free options?', options: null, points: 20 },
    { type: 'fill_blank', question: 'The waiter brought the _____ so we could choose our meal.', correctAnswer: 'menu', options: ['menu', 'bill', 'receipt', 'order'], points: 10 },
    { type: 'multiple_choice', question: 'What does "al dente" mean when describing pasta?', correctAnswer: 'Cooked but still firm to the bite', options: ['Cooked but still firm to the bite', 'Very soft and overcooked', 'Served cold', 'Mixed with sauce'], points: 20 },
    { type: 'fill_blank', question: 'Could I have the _____ please? I\'d like to pay for my meal.', correctAnswer: 'bill', options: ['bill', 'menu', 'receipt', 'check'], points: 10 },
    { type: 'multiple_choice', question: 'Which phrase do you use to ask for a recommendation at a restaurant?', correctAnswer: 'What do you recommend?', options: ['What do you recommend?', 'What is your favorite?', 'What should I eat?', 'What is good here?'], points: 15 },
  ],
  'Travel Adventures': [
    { type: 'multiple_choice', question: 'What document do you need to travel internationally?', correctAnswer: 'Passport', options: ['Passport', 'Driver\'s license', 'Birth certificate', 'Student ID'], points: 10 },
    { type: 'fill_blank', question: 'Please fasten your _____ belt during takeoff and landing.', correctAnswer: 'seat', options: ['seat', 'safety', 'shoulder', 'lap'], points: 10 },
    { type: 'multiple_choice', question: 'What does "jet lag" mean?', correctAnswer: 'Fatigue caused by traveling across multiple time zones', options: ['Fatigue caused by traveling across multiple time zones', 'Fear of flying', 'Luggage that arrives late', 'A type of aircraft'], points: 20 },
    { type: 'translation', question: 'Translate: "Onde fica o check-in para o voo para Londres?"', correctAnswer: 'Where is the check-in for the flight to London?', options: null, points: 20 },
    { type: 'fill_blank', question: 'The hotel offers a complimentary _____ every morning from 7 to 10 AM.', correctAnswer: 'breakfast', options: ['breakfast', 'lunch', 'dinner', 'snack'], points: 10 },
    { type: 'multiple_choice', question: 'What is a "layover" in air travel?', correctAnswer: 'A stop at an intermediate airport before reaching the final destination', options: ['A stop at an intermediate airport before reaching the final destination', 'A type of seat in business class', 'Extra luggage fee', 'A delayed flight'], points: 20 },
    { type: 'fill_blank', question: 'Could you recommend a good _____ near the city center?', correctAnswer: 'hotel', options: ['hotel', 'hostel', 'motel', 'resort'], points: 10 },
    { type: 'multiple_choice', question: 'What does "all-inclusive" mean at a resort?', correctAnswer: 'All meals, drinks, and activities are included in the price', options: ['All meals, drinks, and activities are included in the price', 'Only breakfast is included', 'Only the room is included', 'Activities are extra'], points: 15 },
  ],
  'Business Meeting': [
    { type: 'multiple_choice', question: 'What does "to table a proposal" mean in American English?', correctAnswer: 'To postpone discussing a proposal', options: ['To postpone discussing a proposal', 'To present a proposal', 'To reject a proposal', 'To approve a proposal'], points: 20 },
    { type: 'fill_blank', question: 'Let\'s _____ the meeting to next Tuesday at 3 PM.', correctAnswer: 'reschedule', options: ['reschedule', 'postpone', 'cancel', 'move'], points: 15 },
    { type: 'multiple_choice', question: 'What is an "agenda" in the context of a business meeting?', correctAnswer: 'A list of topics to be discussed', options: ['A list of topics to be discussed', 'A type of presentation software', 'A financial report', 'A meeting room booking'], points: 10 },
    { type: 'translation', question: 'Translate: "Podemos agendar uma reunião para discutir a proposta?"', correctAnswer: 'Can we schedule a meeting to discuss the proposal?', options: null, points: 20 },
    { type: 'fill_blank', question: 'The CEO will give a _____ on the company\'s quarterly results.', correctAnswer: 'presentation', options: ['presentation', 'speech', 'lecture', 'talk'], points: 10 },
    { type: 'multiple_choice', question: 'What does "KPI" stand for?', correctAnswer: 'Key Performance Indicator', options: ['Key Performance Indicator', 'Knowledge Process Integration', 'Key Project Initiative', 'Known Profit Index'], points: 15 },
    { type: 'fill_blank', question: 'Could you please _____ the main points of your proposal?', correctAnswer: 'summarize', options: ['summarize', 'explain', 'describe', 'list'], points: 10 },
    { type: 'multiple_choice', question: 'What is the purpose of "minutes" in a business meeting?', correctAnswer: 'A written record of what was discussed and decided', options: ['A written record of what was discussed and decided', 'The duration of the meeting', 'A summary of the financial results', 'An attendance list'], points: 15 },
  ],
  'Health and Fitness': [
    { type: 'multiple_choice', question: 'What is the recommended amount of moderate exercise per week for adults?', correctAnswer: '150 minutes', options: ['150 minutes', '30 minutes', '60 minutes', '300 minutes'], points: 15 },
    { type: 'fill_blank', question: 'You should _____ before exercising to prevent muscle injuries.', correctAnswer: 'warm up', options: ['warm up', 'cool down', 'stretch out', 'work out'], points: 10 },
    { type: 'multiple_choice', question: 'What does "cardiovascular exercise" primarily improve?', correctAnswer: 'Heart and lung health', options: ['Heart and lung health', 'Muscle strength', 'Flexibility', 'Balance'], points: 15 },
    { type: 'translation', question: 'Translate: "Preciso marcar uma consulta com o médico."', correctAnswer: 'I need to make an appointment with the doctor.', options: null, points: 20 },
    { type: 'fill_blank', question: 'The doctor prescribed _____ for the patient\'s infection.', correctAnswer: 'antibiotics', options: ['antibiotics', 'vitamins', 'painkillers', 'supplements'], points: 15 },
    { type: 'multiple_choice', question: 'What does "BMI" stand for?', correctAnswer: 'Body Mass Index', options: ['Body Mass Index', 'Basic Metabolic Intake', 'Blood Mineral Indicator', 'Body Muscle Intensity'], points: 15 },
    { type: 'fill_blank', question: 'Drinking at least 8 glasses of _____ per day is essential for good health.', correctAnswer: 'water', options: ['water', 'juice', 'milk', 'tea'], points: 10 },
    { type: 'multiple_choice', question: 'Which nutrient is the body\'s primary source of energy?', correctAnswer: 'Carbohydrates', options: ['Carbohydrates', 'Protein', 'Fat', 'Vitamins'], points: 15 },
  ],
  'At the Restaurant': [
    { type: 'multiple_choice', question: 'What do you say to get a waiter\'s attention politely?', correctAnswer: 'Excuse me!', options: ['Excuse me!', 'Hey you!', 'Come here!', 'Wait!'], points: 10 },
    { type: 'fill_blank', question: 'I\'d like to _____ a table for two for Saturday evening.', correctAnswer: 'reserve', options: ['reserve', 'book', 'make', 'get'], points: 10 },
    { type: 'multiple_choice', question: 'What is a "sommelier" at a restaurant?', correctAnswer: 'A wine expert who recommends and serves wine', options: ['A wine expert who recommends and serves wine', 'A head chef', 'A restaurant manager', 'A dessert specialist'], points: 20 },
    { type: 'translation', question: 'Translate: "Eu tenho alergia a amendoim. O prato contém amendoim?"', correctAnswer: 'I have a peanut allergy. Does the dish contain peanuts?', options: null, points: 20 },
    { type: 'fill_blank', question: 'The _____ of the day is grilled salmon with vegetables.', correctAnswer: 'special', options: ['special', 'dish', 'meal', 'course'], points: 10 },
    { type: 'multiple_choice', question: 'What does "a la carte" mean on a menu?', correctAnswer: 'Each dish is ordered and priced separately', options: ['Each dish is ordered and priced separately', 'A fixed-price meal with multiple courses', 'A daily special', 'A vegetarian option'], points: 20 },
    { type: 'fill_blank', question: 'Could we have separate _____ please? We\'re paying individually.', correctAnswer: 'bills', options: ['bills', 'checks', 'receipts', 'invoices'], points: 15 },
    { type: 'multiple_choice', question: 'What percentage is a standard tip in the USA?', correctAnswer: '15-20%', options: ['15-20%', '5-10%', '25-30%', '10%'], points: 15 },
  ],
  'Clothes & Shopping': [
    { type: 'multiple_choice', question: 'What does "off the rack" mean when buying clothes?', correctAnswer: 'Ready-made clothing sold in standard sizes', options: ['Ready-made clothing sold in standard sizes', 'Custom-made clothing', 'Discounted clothing', 'Second-hand clothing'], points: 20 },
    { type: 'fill_blank', question: 'These jeans are too tight. Do you have them in a larger _____?', correctAnswer: 'size', options: ['size', 'fit', 'cut', 'style'], points: 10 },
    { type: 'multiple_choice', question: 'What is a "fitting room" used for?', correctAnswer: 'Trying on clothes before buying them', options: ['Trying on clothes before buying them', 'Storing clothes', 'Repairing clothes', 'Washing clothes'], points: 10 },
    { type: 'translation', question: 'Translate: "Esta blusa está em promoção. Tem 50% de desconto."', correctAnswer: 'This blouse is on sale. It has a 50% discount.', options: null, points: 20 },
    { type: 'fill_blank', question: 'I\'m looking for a formal _____ to wear to the job interview.', correctAnswer: 'outfit', options: ['outfit', 'costume', 'uniform', 'dress'], points: 10 },
    { type: 'multiple_choice', question: 'What does "fast fashion" refer to?', correctAnswer: 'Cheap, trendy clothing produced quickly and in large quantities', options: ['Cheap, trendy clothing produced quickly and in large quantities', 'Expensive designer clothing', 'Vintage clothing', 'Sustainable clothing'], points: 20 },
    { type: 'fill_blank', question: 'Can I _____ this jacket? I want to see if it fits.', correctAnswer: 'try on', options: ['try on', 'put on', 'wear', 'test'], points: 15 },
    { type: 'multiple_choice', question: 'What is the difference between "wholesale" and "retail" prices?', correctAnswer: 'Wholesale is the price for bulk buying; retail is the price for individual consumers', options: ['Wholesale is the price for bulk buying; retail is the price for individual consumers', 'Wholesale is more expensive than retail', 'Retail is for businesses; wholesale is for consumers', 'They are the same'], points: 20 },
  ],
  'Weather & Seasons': [
    { type: 'multiple_choice', question: 'What is the difference between "climate" and "weather"?', correctAnswer: 'Climate is the long-term pattern; weather is the day-to-day conditions', options: ['Climate is the long-term pattern; weather is the day-to-day conditions', 'They mean the same thing', 'Climate is local; weather is global', 'Weather is long-term; climate is short-term'], points: 20 },
    { type: 'fill_blank', question: 'It\'s _____ outside — you should bring an umbrella.', correctAnswer: 'pouring', options: ['pouring', 'raining', 'drizzling', 'showering'], points: 15 },
    { type: 'multiple_choice', question: 'What does "partly cloudy" mean in a weather forecast?', correctAnswer: 'Some clouds but also some sunshine', options: ['Some clouds but also some sunshine', 'Completely overcast', 'Light rain expected', 'Clear skies'], points: 15 },
    { type: 'translation', question: 'Translate: "A previsão do tempo diz que vai nevar amanhã."', correctAnswer: 'The weather forecast says it will snow tomorrow.', options: null, points: 20 },
    { type: 'fill_blank', question: 'In autumn, the leaves change color and _____ from the trees.', correctAnswer: 'fall', options: ['fall', 'drop', 'blow', 'fly'], points: 10 },
    { type: 'multiple_choice', question: 'What is a "heat wave"?', correctAnswer: 'A prolonged period of excessively hot weather', options: ['A prolonged period of excessively hot weather', 'A type of ocean current', 'A summer storm', 'A tropical hurricane'], points: 15 },
    { type: 'fill_blank', question: 'The temperature is below zero — it\'s _____ cold outside.', correctAnswer: 'freezing', options: ['freezing', 'very', 'extremely', 'bitterly'], points: 10 },
    { type: 'multiple_choice', question: 'What causes the seasons to change?', correctAnswer: 'The tilt of the Earth\'s axis as it orbits the Sun', options: ['The tilt of the Earth\'s axis as it orbits the Sun', 'The distance from the Sun', 'The rotation of the Earth', 'The phases of the Moon'], points: 20 },
  ],
  'Body Parts & Health': [
    { type: 'multiple_choice', question: 'What is the largest organ in the human body?', correctAnswer: 'The skin', options: ['The skin', 'The liver', 'The brain', 'The lungs'], points: 15 },
    { type: 'fill_blank', question: 'The _____ pumps blood throughout the body.', correctAnswer: 'heart', options: ['heart', 'liver', 'kidney', 'lung'], points: 10 },
    { type: 'multiple_choice', question: 'What does the immune system do?', correctAnswer: 'Protects the body against disease and infection', options: ['Protects the body against disease and infection', 'Digests food', 'Controls breathing', 'Regulates body temperature'], points: 15 },
    { type: 'translation', question: 'Translate: "Estou com dor de cabeça e febre desde ontem."', correctAnswer: 'I have had a headache and fever since yesterday.', options: null, points: 20 },
    { type: 'fill_blank', question: 'The doctor listened to my _____ with a stethoscope.', correctAnswer: 'heartbeat', options: ['heartbeat', 'breathing', 'pulse', 'chest'], points: 15 },
    { type: 'multiple_choice', question: 'What is the function of the kidneys?', correctAnswer: 'Filter waste products from the blood and produce urine', options: ['Filter waste products from the blood and produce urine', 'Produce insulin', 'Regulate breathing', 'Store bile'], points: 20 },
    { type: 'fill_blank', question: 'I twisted my _____ while running and now it\'s swollen.', correctAnswer: 'ankle', options: ['ankle', 'knee', 'wrist', 'elbow'], points: 10 },
    { type: 'multiple_choice', question: 'What does "chronic" mean when describing a health condition?', correctAnswer: 'Long-lasting or recurring over a long period', options: ['Long-lasting or recurring over a long period', 'Very severe and dangerous', 'Contagious', 'Treatable with antibiotics'], points: 20 },
  ],
};

async function upgradeExercises() {
  const dbConfig = parseDbUrl(DB_URL);
  const conn = await mysql.createConnection(dbConfig);
  
  console.log('🔍 Fetching all lessons...');
  const [lessons] = await conn.execute('SELECT id, title, languageCode FROM lessons ORDER BY id');
  
  let totalUpgraded = 0;
  let totalInserted = 0;
  
  for (const lesson of lessons) {
    const lessonTitle = lesson.title;
    const exercises = RICH_EXERCISES[lessonTitle];
    
    if (!exercises) {
      console.log(`⏭️  No rich exercises for: "${lessonTitle}" (${lesson.languageCode})`);
      continue;
    }
    
    console.log(`\n📚 Upgrading: "${lessonTitle}" (ID: ${lesson.id})`);
    
    // Delete existing exercises for this lesson
    const [delResult] = await conn.execute('DELETE FROM exercises WHERE lessonId = ?', [lesson.id]);
    console.log(`   🗑️  Deleted ${delResult.affectedRows} old exercises`);
    
    // Insert rich exercises
    for (let i = 0; i < exercises.length; i++) {
      const ex = exercises[i];
      const optionsJson = ex.options ? JSON.stringify(ex.options) : null;
      
      await conn.execute(
        `INSERT INTO exercises (lessonId, type, question, correctAnswer, options, orderIndex, difficultyScore, points) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          lesson.id,
          ex.type,
          ex.question,
          ex.correctAnswer,
          optionsJson,
          i + 1,
          ex.type === 'translation' ? 0.8 : (ex.points >= 20 ? 0.7 : 0.5),
          ex.points,
        ]
      );
      totalInserted++;
    }
    
    console.log(`   ✅ Inserted ${exercises.length} rich exercises`);
    totalUpgraded++;
  }
  
  await conn.end();
  
  console.log(`\n🎉 Done! Upgraded ${totalUpgraded} lessons with ${totalInserted} rich exercises.`);
}

upgradeExercises().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
