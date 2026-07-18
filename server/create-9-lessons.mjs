import mysql from 'mysql2/promise';
import 'dotenv/config';

const lessons = [
  {
    id: 180002,
    title: "At the Supermarket",
    description: "Learn shopping vocabulary, asking for prices, and making purchases",
    story: `**At the Supermarket**

Sarah and Tom are at the local supermarket doing their weekly shopping. They have a long list of items to buy.

"Let's start with the fresh produce section," says Sarah, pushing the shopping cart. Tom picks up some apples, oranges, and bananas. "These look fresh and delicious!"

In the dairy aisle, they get milk, cheese, and yogurt. "Don't forget the eggs," reminds Sarah. Tom carefully places a carton of eggs in the cart.

They move to the meat section. "We need chicken breast for dinner tonight," says Tom. The butcher helps them choose the best cut.

At the bakery, the smell of fresh bread fills the air. "Let's get a whole wheat loaf," suggests Sarah. They also pick up some croissants for breakfast.

In the beverage aisle, they choose orange juice, water bottles, and Tom's favorite coffee. "This brand is on sale!" Tom exclaims happily.

Finally, they go to the checkout counter. The cashier scans all their items. "Your total is $87.50," she says with a smile. Tom pays with his credit card, and they pack their groceries into reusable bags.

"Shopping together makes it faster and more fun," says Sarah as they load the car.`,
    vocabularyDetailed: JSON.stringify([
      {
        word: "supermarket",
        phonetic: "/ˈsuːpərˌmɑːrkɪt/",
        translation: "supermercado",
        synonyms: ["grocery store", "market"],
        slang: "the store",
        example: "We go to the supermarket every Saturday."
      },
      {
        word: "shopping cart",
        phonetic: "/ˈʃɑːpɪŋ kɑːrt/",
        translation: "carrinho de compras",
        synonyms: ["trolley", "cart"],
        slang: "buggy",
        example: "Push the shopping cart carefully."
      },
      {
        word: "fresh produce",
        phonetic: "/freʃ ˈproʊduːs/",
        translation: "produtos frescos",
        synonyms: ["fruits and vegetables", "fresh food"],
        slang: "veggies and fruits",
        example: "The fresh produce section has organic options."
      },
      {
        word: "checkout",
        phonetic: "/ˈtʃekaʊt/",
        translation: "caixa (de pagamento)",
        synonyms: ["cashier", "register"],
        slang: "the till",
        example: "Please proceed to the checkout counter."
      },
      {
        word: "on sale",
        phonetic: "/ɑːn seɪl/",
        translation: "em promoção",
        synonyms: ["discounted", "reduced price"],
        slang: "on special",
        example: "This coffee is on sale this week."
      },
      {
        word: "aisle",
        phonetic: "/aɪl/",
        translation: "corredor (do supermercado)",
        synonyms: ["lane", "passage"],
        slang: "row",
        example: "The milk is in aisle 3."
      }
    ]),
    grammarDetailed: JSON.stringify({
      topics: [
        {
          title: "Countable and Uncountable Nouns",
          explanation: "Countable nouns can be counted (one apple, two apples). Uncountable nouns cannot be counted directly (milk, cheese, bread).",
          examples: [
            "Countable: apples, eggs, bottles",
            "Uncountable: milk, cheese, bread, water"
          ],
          practice: [
            "Complete: I need three _____ (apple) and some _____ (milk).",
            "Complete: Can I have two _____ (bottle) of water?"
          ]
        },
        {
          title: "Asking for Prices",
          explanation: "Use 'How much is/are...?' to ask about prices.",
          examples: [
            "How much is this bread?",
            "How much are these apples?",
            "What's the price of this cheese?"
          ],
          practice: [
            "Ask: _____ much _____ these bananas?",
            "Ask: What's the _____ of this chicken?"
          ]
        }
      ]
    }),
    phonetics: JSON.stringify({
      sounds: [
        "Silent 'l' in 'aisle' → /aɪl/ (sounds like 'I'll')",
        "'th' sound in 'the' → /ðə/ (voiced)",
        "Stress in 'SUper-market' (first syllable)"
      ],
      linking: [
        "on_sale → /ɑːn_seɪl/ sounds like 'on-sail'",
        "check_out → /tʃek_aʊt/ sounds like 'check-out'"
      ],
      stress: [
        "SU-per-mar-ket (stress on first syllable)",
        "pro-DUCE (stress on second syllable when noun)"
      ]
    }),
    conversationPrompts: JSON.stringify([
      "What do you usually buy at the supermarket?",
      "Do you prefer shopping alone or with someone?",
      "What's your favorite section in the supermarket?",
      "Do you make a shopping list before going?",
      "Have you ever forgotten something important at the store?",
      "Do you like to try new products or stick to familiar brands?",
      "What time of day do you prefer to shop?",
      "Do you use coupons or look for sales?",
      "What's the most expensive thing you've bought at a supermarket?",
      "Do you prefer fresh food or frozen food?"
    ])
  },
  {
    id: 180003,
    title: "At the Restaurant",
    description: "Learn how to order food, make reservations, and interact with waiters",
    story: `**Dinner at Luigi's Italian Restaurant**

Michael and Lisa are celebrating their anniversary at Luigi's, a cozy Italian restaurant downtown.

"Good evening! Do you have a reservation?" asks the host with a warm smile. "Yes, under the name Michael Johnson," Michael replies. The host checks his list and says, "Right this way, please."

They are seated at a romantic table by the window. A waiter named Marco approaches with menus. "Good evening! I'm Marco, and I'll be your server tonight. Can I start you off with something to drink?"

"I'll have a glass of red wine, please," says Lisa. "And I'll have sparkling water with lemon," adds Michael. Marco nods and returns shortly with their drinks.

"Are you ready to order?" Marco asks. Lisa looks at the menu thoughtfully. "I'll have the Caesar salad to start, and then the seafood pasta, please." Michael decides on the minestrone soup and the grilled chicken with vegetables.

While they wait, they enjoy the soft music and candlelight. "This place has such a nice atmosphere," Lisa comments.

The food arrives beautifully presented. "This looks amazing!" exclaims Michael. They enjoy every bite, savoring the flavors.

After finishing, Marco asks, "Would you like to see the dessert menu?" They share a delicious tiramisu and espresso.

"The check, please," Michael requests. Marco brings the bill. "The total is $95. Service was excellent!" Michael leaves a generous tip.

"Thank you for a wonderful evening," Lisa says as they leave, hand in hand.`,
    vocabularyDetailed: JSON.stringify([
      {
        word: "reservation",
        phonetic: "/ˌrezərˈveɪʃən/",
        translation: "reserva",
        synonyms: ["booking"],
        slang: "table booking",
        example: "I made a reservation for 7 PM."
      },
      {
        word: "waiter/server",
        phonetic: "/ˈweɪtər/ /ˈsɜːrvər/",
        translation: "garçom/garçonete",
        synonyms: ["waitress (female)"],
        slang: "wait staff",
        example: "The waiter was very friendly."
      },
      {
        word: "menu",
        phonetic: "/ˈmenjuː/",
        translation: "cardápio",
        synonyms: ["bill of fare"],
        slang: "food list",
        example: "Can I see the menu, please?"
      },
      {
        word: "appetizer",
        phonetic: "/ˈæpɪtaɪzər/",
        translation: "entrada/aperitivo",
        synonyms: ["starter"],
        slang: "apps",
        example: "We ordered calamari as an appetizer."
      },
      {
        word: "check/bill",
        phonetic: "/tʃek/ /bɪl/",
        translation: "conta",
        synonyms: ["tab"],
        slang: "damage (informal)",
        example: "Can we have the check, please?"
      },
      {
        word: "tip",
        phonetic: "/tɪp/",
        translation: "gorjeta",
        synonyms: ["gratuity"],
        slang: "something extra",
        example: "We left a 20% tip."
      }
    ]),
    grammarDetailed: JSON.stringify({
      topics: [
        {
          title: "Polite Requests",
          explanation: "Use 'Could/Can I...?' and 'I'd like...' for polite requests in restaurants.",
          examples: [
            "Could I have the menu, please?",
            "I'd like to order the pasta.",
            "Can we have the check, please?"
          ],
          practice: [
            "Make polite: Give me water. → _____ I have some water, please?",
            "Make polite: I want the steak. → I'd _____ the steak, please."
          ]
        },
        {
          title: "Present Perfect for Experiences",
          explanation: "Use present perfect to talk about dining experiences: 'Have you ever...?'",
          examples: [
            "Have you ever tried sushi?",
            "I've been to this restaurant before.",
            "We've never eaten Thai food."
          ],
          practice: [
            "Complete: _____ you ever _____ (try) Italian food?",
            "Complete: I _____ never _____ (be) to this restaurant."
          ]
        }
      ]
    }),
    phonetics: JSON.stringify({
      sounds: [
        "Silent 't' in 'restaurant' → /ˈrestərɑːnt/",
        "'ch' in 'check' → /tʃ/ (like 'chair')",
        "Stress in 'res-er-VA-tion' (third syllable)"
      ],
      linking: [
        "check_out → sounds like 'check-out'",
        "I'd_like → /aɪd_laɪk/ sounds like 'I-dlike'"
      ],
      stress: [
        "res-er-VA-tion (stress on third syllable)",
        "AP-pe-ti-zer (stress on first syllable)"
      ]
    }),
    conversationPrompts: JSON.stringify([
      "What's your favorite type of restaurant?",
      "Do you prefer eating out or cooking at home?",
      "Have you ever tried exotic cuisine?",
      "What's the best meal you've ever had at a restaurant?",
      "Do you usually leave a tip? How much?",
      "Have you ever sent food back to the kitchen?",
      "Do you like to try new dishes or order the same thing?",
      "What's your favorite dessert?",
      "Do you prefer casual or fancy restaurants?",
      "Have you ever worked in a restaurant?"
    ])
  }
];

async function createLessons() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  try {
    for (const lesson of lessons) {
      console.log(`Creating lesson: ${lesson.title}...`);
      
      await connection.execute(
        `INSERT INTO lessons (id, language_id, title, description, level, order_index, story_text, vocabulary_detailed, grammar_detailed, phonetics, conversation_prompts)
         VALUES (?, 1, ?, ?, 'beginner', ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         title = VALUES(title),
         description = VALUES(description),
         story_text = VALUES(story_text),
         vocabulary_detailed = VALUES(vocabulary_detailed),
         grammar_detailed = VALUES(grammar_detailed),
         phonetics = VALUES(phonetics),
         conversation_prompts = VALUES(conversation_prompts)`,
        [
          lesson.id,
          lesson.title,
          lesson.description,
          lesson.id - 180000,
          lesson.story,
          lesson.vocabularyDetailed,
          lesson.grammarDetailed,
          lesson.phonetics,
          lesson.conversationPrompts
        ]
      );
      
      console.log(`✅ Lesson ${lesson.title} created!`);
    }
    
    console.log('\n🎉 All lessons created successfully!');
  } catch (error) {
    console.error('Error creating lessons:', error);
  } finally {
    await connection.end();
  }
}

createLessons();
