import mysql from 'mysql2/promise';
import 'dotenv/config';

const lessons = [
  {
    id: 180006,
    title: "Lesson 6: Traveling",
    description: "Learn travel vocabulary, airport expressions, and tourist phrases",
    story: `**Anna's Trip to Paris**

Anna is at JFK Airport in New York, about to board her flight to Paris. She's excited for her first international trip!

At the check-in counter, the agent asks, "May I see your passport and ticket, please?" Anna hands them over nervously. "Would you like a window or aisle seat?" asks the agent. "Window, please!" Anna replies with a smile.

After passing through security, Anna waits at the gate. The announcement comes: "Flight AF007 to Paris is now boarding." Anna joins the queue and shows her boarding pass to the flight attendant.

During the 7-hour flight, Anna watches movies, eats the airplane meal, and tries to sleep. The pilot announces, "We are now descending into Paris Charles de Gaulle Airport."

At immigration in Paris, the officer asks in English, "What is the purpose of your visit?" "Tourism," Anna answers. "How long will you stay?" "Two weeks." The officer stamps her passport and says, "Enjoy your stay in France!"

Anna collects her luggage from the baggage claim and takes a taxi to her hotel. "Bonjour! I have a reservation under Anna Smith," she tells the receptionist. After checking in, Anna goes to her room, opens the window, and sees the Eiffel Tower in the distance. "This is going to be an amazing adventure!" she exclaims.`,
    vocabulary: [
      {word:"airport",phonetic:"/ˈerˌpɔːrt/",translation:"aeroporto",synonyms:["terminal"],slang:"the port",example:"We arrived at the airport early."},
      {word:"passport",phonetic:"/ˈpæspɔːrt/",translation:"passaporte",synonyms:["travel document"],slang:"pass",example:"Don't forget your passport!"},
      {word:"luggage",phonetic:"/ˈlʌɡɪdʒ/",translation:"bagagem",synonyms:["baggage","suitcase"],slang:"bags",example:"Where is the luggage claim?"},
      {word:"hotel",phonetic:"/hoʊˈtel/",translation:"hotel",synonyms:["inn","lodge"],slang:"place to crash",example:"I booked a hotel near the beach."},
      {word:"tourist",phonetic:"/ˈtʊrɪst/",translation:"turista",synonyms:["traveler","visitor"],slang:"sightseer",example:"The city is full of tourists."},
      {word:"reservation",phonetic:"/ˌrezərˈveɪʃən/",translation:"reserva",synonyms:["booking"],slang:"reso",example:"I made a reservation for tonight."}
    ],
    grammar: [
      {topic:"Future with 'going to'",explanation:"Use 'going to' for planned future actions.",examples:["I'm going to visit Paris.","She's going to stay for two weeks."],exercises:["Complete: We _____ (go) to travel next month."]},
      {topic:"Prepositions of Movement",explanation:"Use to, from, through, into for movement.",examples:["I'm flying to Paris.","She's from New York.","We went through security."],exercises:["Complete: The plane is flying _____ London."]}
    ],
    phonetics: [
      {sound:"Silent l",ipa:"/tɔːk/",tips:"L is silent in some words",examples:["walk /wɔːk/","talk /tɔːk/"]},
      {sound:"Word stress",ipa:"Emphasis",tips:"Stress patterns in travel words",examples:["AIR-port","PASS-port","ho-TEL"]}
    ],
    prompts: ["Have you ever traveled abroad?","What is your favorite travel destination?","Do you prefer beach or mountain vacations?","What do you always pack when traveling?","Have you ever missed a flight?","Do you like to plan trips or be spontaneous?","What is the longest flight you've taken?","Do you prefer traveling alone or with others?","What country would you most like to visit?","Have you ever experienced culture shock?"]
  },
  {
    id: 180007,
    title: "Lesson 7: Health and Wellness",
    description: "Learn health vocabulary, medical expressions, and wellness topics",
    story: `**Dr. Martinez's Clinic**

James wakes up feeling terrible. He has a high fever, a sore throat, and a bad cough. "I need to see a doctor," he thinks.

He calls Dr. Martinez's clinic and speaks to the receptionist. "I'd like to make an appointment, please. I'm not feeling well." "Can you come in at 2 PM today?" asks the receptionist. "Yes, thank you!"

At the clinic, James fills out a medical form with his personal information and symptoms. The nurse calls his name: "James Wilson, please come in." She checks his temperature, blood pressure, and weight. "The doctor will see you shortly."

Dr. Martinez enters the examination room. "Hello, James. What seems to be the problem?" James explains his symptoms. The doctor examines his throat, listens to his lungs with a stethoscope, and checks his ears.

"You have a throat infection," Dr. Martinez diagnoses. "I'm going to prescribe antibiotics and some cough syrup. Take the medication three times a day after meals. Get plenty of rest and drink lots of water."

At the pharmacy, James picks up his prescription. The pharmacist explains, "Take one pill every 8 hours. If you don't feel better in 3 days, call your doctor."

A week later, James feels completely recovered. "I should take better care of my health," he promises himself, planning to exercise more and eat healthier.`,
    vocabulary: [
      {word:"doctor",phonetic:"/ˈdɑːktər/",translation:"médico",synonyms:["physician"],slang:"doc",example:"I need to see a doctor."},
      {word:"symptom",phonetic:"/ˈsɪmptəm/",translation:"sintoma",synonyms:["sign"],slang:"what's wrong",example:"What are your symptoms?"},
      {word:"medicine",phonetic:"/ˈmedɪsən/",translation:"remédio",synonyms:["medication","drug"],slang:"meds",example:"Take your medicine twice a day."},
      {word:"fever",phonetic:"/ˈfiːvər/",translation:"febre",synonyms:["high temperature"],slang:"temp",example:"I have a fever of 102°F."},
      {word:"prescription",phonetic:"/prɪˈskrɪpʃən/",translation:"receita médica",synonyms:["script"],slang:"scrip",example:"The doctor gave me a prescription."},
      {word:"pharmacy",phonetic:"/ˈfɑːrməsi/",translation:"farmácia",synonyms:["drugstore","chemist"],slang:"the pharm",example:"I'll pick it up at the pharmacy."}
    ],
    grammar: [
      {topic:"Present Perfect for Health",explanation:"Use present perfect for health experiences.",examples:["I have had a cold for three days.","Have you ever broken a bone?"],exercises:["Complete: She _____ (be) sick since Monday."]},
      {topic:"Should for Advice",explanation:"Use 'should' to give health advice.",examples:["You should rest.","You shouldn't eat junk food."],exercises:["Give advice: I have a headache. → You _____ take aspirin."]}
    ],
    phonetics: [
      {sound:"th sound",ipa:"/θ/",tips:"Voiceless th",examples:["health /helθ/","throat /θroʊt/"]},
      {sound:"Word stress",ipa:"Emphasis",tips:"Stress patterns",examples:["DOC-tor","MED-i-cine","phar-MA-cy"]}
    ],
    prompts: ["How often do you visit the doctor?","Do you prefer natural remedies or medicine?","What do you do when you have a cold?","Do you exercise regularly?","What is your favorite healthy food?","Do you get enough sleep?","Have you ever been hospitalized?","Do you take any vitamins or supplements?","How do you manage stress?","What is your health goal for this year?"]
  },
  {
    id: 180008,
    title: "Lesson 8: Hobbies and Leisure",
    description: "Learn hobby vocabulary, expressing preferences, and leisure activities",
    story: `**Weekend Activities**

It's Saturday morning, and the Johnson family is planning their weekend activities. Everyone has different hobbies and interests.

Dad, Robert, is an avid reader. "I'm going to the bookstore to buy the latest mystery novel," he announces. He loves spending quiet afternoons reading in his favorite armchair.

Mom, Jennifer, is passionate about gardening. "I need to plant some new flowers in the backyard," she says, putting on her gardening gloves. She finds it relaxing to work with plants and watch them grow.

Their teenage son, Alex, is a music enthusiast. "I have band practice this afternoon," he reminds everyone. He plays the electric guitar and dreams of becoming a professional musician someday.

Their daughter, Sophie, loves painting. "I'm taking an art class at the community center," she says excitedly. She's been learning watercolor techniques and wants to create a landscape painting.

In the evening, the family gathers to watch a movie together. "Let's watch a comedy!" suggests Sophie. They make popcorn, dim the lights, and enjoy quality time together.

On Sunday, they go hiking in the nearby mountains. "This is my favorite family activity," says Robert. "It combines exercise, nature, and time together." Everyone agrees that balancing different hobbies makes life more interesting and fulfilling.`,
    vocabulary: [
      {word:"hobby",phonetic:"/ˈhɑːbi/",translation:"hobby",synonyms:["pastime","interest"],slang:"thing",example:"What are your hobbies?"},
      {word:"painting",phonetic:"/ˈpeɪntɪŋ/",translation:"pintura",synonyms:["art","artwork"],slang:"art stuff",example:"I enjoy painting landscapes."},
      {word:"reading",phonetic:"/ˈriːdɪŋ/",translation:"leitura",synonyms:["studying books"],slang:"hitting the books",example:"Reading is my favorite hobby."},
      {word:"music",phonetic:"/ˈmjuːzɪk/",translation:"música",synonyms:["tunes","melodies"],slang:"jams",example:"I love listening to music."},
      {word:"hiking",phonetic:"/ˈhaɪkɪŋ/",translation:"caminhada",synonyms:["trekking","walking"],slang:"hitting the trails",example:"We go hiking every weekend."},
      {word:"gardening",phonetic:"/ˈɡɑːrdənɪŋ/",translation:"jardinagem",synonyms:["cultivating"],slang:"green thumb stuff",example:"Gardening is very relaxing."}
    ],
    grammar: [
      {topic:"Gerunds for Hobbies",explanation:"Use gerunds (verb + -ing) to talk about hobbies.",examples:["I enjoy reading.","She loves painting.","They like hiking."],exercises:["Complete: He enjoys _____ (play) guitar."]},
      {topic:"Frequency Adverbs",explanation:"Use always, usually, often, sometimes, never with hobbies.",examples:["I always read before bed.","She sometimes paints on weekends."],exercises:["Complete: I _____ (often) go hiking."]}
    ],
    phonetics: [
      {sound:"ng sound",ipa:"/ŋ/",tips:"Nasal sound at the end",examples:["reading /ˈriːdɪŋ/","painting /ˈpeɪntɪŋ/","hiking /ˈhaɪkɪŋ/"]},
      {sound:"Word stress",ipa:"Emphasis",tips:"First syllable stress",examples:["HOB-by","PAINT-ing","GAR-den-ing"]}
    ],
    prompts: ["What are your favorite hobbies?","How much time do you spend on your hobbies?","Have you ever tried a new hobby and loved it?","Do you prefer indoor or outdoor activities?","What hobby would you like to learn?","Do you collect anything?","What do you do to relax?","Do you play any musical instruments?","Do you prefer active or quiet hobbies?","What hobby have you had the longest?"]
  },
  {
    id: 180009,
    title: "Lesson 9: Talking about Weather",
    description: "Learn weather vocabulary, making small talk, and describing climate",
    story: `**Four Seasons in New York**

Maria has lived in New York City for one year and has experienced all four seasons.

**Spring (March-May):** "Spring is beautiful here!" Maria tells her friend on the phone. "The weather is getting warmer, flowers are blooming everywhere, and people are spending more time outdoors. It rains quite often, so I always carry an umbrella. The temperature is usually around 60-70°F (15-21°C)."

**Summer (June-August):** Summer arrives with hot and humid weather. "It's so hot today!" Maria complains, wiping sweat from her forehead. "The temperature reached 90°F (32°C)! I need to stay in air-conditioned places. At least the sunny days are perfect for going to the beach."

**Fall/Autumn (September-November):** "Fall is my favorite season," Maria writes in her journal. "The leaves are changing colors - red, orange, yellow, and brown. The weather is cool and comfortable, perfect for wearing sweaters and drinking hot coffee. It's not too hot and not too cold."

**Winter (December-February):** Maria experiences her first snowfall. "It's snowing!" she exclaims excitedly, looking out the window. "Everything is covered in white. It's freezing outside - only 25°F (-4°C)! I need to wear a heavy coat, gloves, scarf, and boots. The streets are icy and slippery."

"Each season has its own beauty," Maria reflects. "I've learned to appreciate them all and prepare for the changing weather."`,
    vocabulary: [
      {word:"weather",phonetic:"/ˈweðər/",translation:"clima",synonyms:["climate","conditions"],slang:"the elements",example:"What's the weather like today?"},
      {word:"sunny",phonetic:"/ˈsʌni/",translation:"ensolarado",synonyms:["bright","clear"],slang:"nice out",example:"It's a sunny day!"},
      {word:"rainy",phonetic:"/ˈreɪni/",translation:"chuvoso",synonyms:["wet"],slang:"pouring",example:"It's rainy and cold."},
      {word:"temperature",phonetic:"/ˈtemprətʃər/",translation:"temperatura",synonyms:["degrees"],slang:"temp",example:"The temperature is 75°F."},
      {word:"snow",phonetic:"/snoʊ/",translation:"neve",synonyms:["snowfall"],slang:"white stuff",example:"It's going to snow tomorrow."},
      {word:"forecast",phonetic:"/ˈfɔːrkæst/",translation:"previsão",synonyms:["prediction"],slang:"weather report",example:"Check the weather forecast."}
    ],
    grammar: [
      {topic:"Present Continuous for Current Weather",explanation:"Use present continuous to describe current weather.",examples:["It's raining now.","The sun is shining."],exercises:["Complete: It _____ (snow) outside."]},
      {topic:"Future with 'will' for Predictions",explanation:"Use 'will' for weather predictions.",examples:["It will rain tomorrow.","It won't be sunny."],exercises:["Complete: It _____ (be) cold next week."]}
    ],
    phonetics: [
      {sound:"th sound",ipa:"/ð/",tips:"Voiced th",examples:["weather /ˈweðər/"]},
      {sound:"Word stress",ipa:"Emphasis",tips:"Stress patterns",examples:["WEATH-er","SUN-ny","tem-PER-a-ture"]}
    ],
    prompts: ["What's the weather like today where you are?","What is your favorite season and why?","Do you prefer hot or cold weather?","What do you do on rainy days?","Have you ever experienced extreme weather?","Do you check the weather forecast daily?","What is the climate like in your country?","Do you like snow? Why or why not?","What weather makes you feel happy?","How does weather affect your mood?"]
  },
  {
    id: 180010,
    title: "Lesson 10: Shopping",
    description: "Learn shopping vocabulary, asking about prices, and making purchases",
    story: `**Shopping Day at the Mall**

Rachel needs to buy some new clothes for the upcoming season. She decides to spend Saturday afternoon at the mall.

First, she visits a clothing store. "May I help you?" asks a friendly sales assistant. "Yes, I'm looking for a dress for a wedding," Rachel explains. The assistant shows her several options. "This blue dress is very popular, and it's on sale - 30% off!"

Rachel tries on the dress in the fitting room. "It fits perfectly!" she says, looking in the mirror. "I'll take it. Do you accept credit cards?" "Yes, we do," replies the assistant.

Next, Rachel goes to a shoe store. "How much are these black heels?" she asks. "They're $79.99," the salesperson answers. "Do you have them in size 8?" "Let me check... Yes, here you are. Would you like to try them on?" Rachel tries them and decides to buy them.

At the cosmetics store, Rachel buys some makeup. The cashier asks, "Do you have our loyalty card?" "No, but I'd like to sign up," Rachel responds. "Great! You'll get 10 points for every dollar you spend."

Finally, Rachel stops at a bookstore. She browses the bestsellers section and picks up a novel. At the checkout, the cashier says, "That'll be $24.95. Cash or card?" "Card, please."

Rachel leaves the mall with her shopping bags, feeling satisfied with her purchases. "I found everything I needed, and I got some good deals!" she thinks happily.`,
    vocabulary: [
      {word:"store",phonetic:"/stɔːr/",translation:"loja",synonyms:["shop"],slang:"place",example:"Let's go to the store."},
      {word:"price",phonetic:"/praɪs/",translation:"preço",synonyms:["cost"],slang:"damage",example:"What's the price?"},
      {word:"discount",phonetic:"/ˈdɪskaʊnt/",translation:"desconto",synonyms:["sale","reduction"],slang:"deal",example:"There's a 20% discount."},
      {word:"receipt",phonetic:"/rɪˈsiːt/",translation:"recibo",synonyms:["proof of purchase"],slang:"slip",example:"Keep your receipt."},
      {word:"cashier",phonetic:"/kæˈʃɪr/",translation:"caixa",synonyms:["checkout person"],slang:"register person",example:"Pay at the cashier."},
      {word:"fitting room",phonetic:"/ˈfɪtɪŋ ruːm/",translation:"provador",synonyms:["changing room","dressing room"],slang:"try-on room",example:"The fitting room is over there."}
    ],
    grammar: [
      {topic:"How much/How many",explanation:"Use 'how much' for uncountable, 'how many' for countable.",examples:["How much is this shirt?","How many do you want?"],exercises:["Complete: _____ much does it cost?"]},
      {topic:"Comparatives for Shopping",explanation:"Use comparatives to compare products.",examples:["This one is cheaper.","That dress is more expensive."],exercises:["Complete: This shirt is _____ (good) than that one."]}
    ],
    phonetics: [
      {sound:"Silent p",ipa:"/rɪˈsiːt/",tips:"P is silent in receipt",examples:["receipt /rɪˈsiːt/"]},
      {sound:"Word stress",ipa:"Emphasis",tips:"Stress patterns",examples:["PRICE","DIS-count","ca-SHIER"]}
    ],
    prompts: ["Do you enjoy shopping? Why or why not?","Do you prefer shopping online or in stores?","What was the last thing you bought?","Do you usually compare prices before buying?","Have you ever returned something to a store?","Do you like to shop alone or with friends?","What is your favorite store?","Do you wait for sales before buying?","What is the most expensive thing you've ever bought?","Do you prefer paying with cash or card?"]
  }
];

async function createLessons() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  try {
    for (const lesson of lessons) {
      console.log(`Creating ${lesson.title}...`);
      
      await connection.execute(
        `INSERT INTO lessons (id, courseId, title, description, orderIndex, languageCode, estimatedMinutes, storyText, vocabularyDetailed, grammarDetailed, phonetics, conversationPrompts)
         VALUES (?, 90001, ?, ?, ?, 'en-US', 30, ?, ?, ?, ?, ?)`,
        [
          lesson.id,
          lesson.title,
          lesson.description,
          lesson.id - 180000,
          lesson.story,
          JSON.stringify(lesson.vocabulary),
          JSON.stringify(lesson.grammar),
          JSON.stringify(lesson.phonetics),
          JSON.stringify(lesson.prompts)
        ]
      );
      
      console.log(`✅ ${lesson.title} created!`);
    }
    
    console.log('\n🎉 Lessons 6-10 created successfully!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

createLessons();
