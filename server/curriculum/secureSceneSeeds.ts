import type { DialogLine, Hotspot } from "../../shared/immersiveSceneTypes";

export type SecureSceneSeed = {
  dialog: DialogLine[];
  hotspots: Hotspot[];
};

/**
 * Canonical curriculum seeds live server-side. The beach seed is the first
 * migration slice; authenticated localization can use it without importing its
 * pedagogical text into a client-facing module.
 */
export const SECURE_SCENE_SEEDS: Record<string, SecureSceneSeed> = {
  beach: {
    dialog: [
      { speaker: "teacher", text: "Hello! My name is James. Welcome to this beautiful tropical beach!", textPt: "Olá! Meu nome é James. Bem-vindo a esta linda praia tropical!" },
      { speaker: "user", text: "Hello James! The beach is amazing!", textPt: "Olá James! A praia é incrível!", options: ["Hello James! The beach is amazing!", "I don't like the beach.", "Where is the hotel?"], correctIndex: 0 },
      { speaker: "teacher", text: "Look at the ocean! In English we say 'ocean' or 'sea'. The water is blue.", textPt: "Olhe para o oceano! Em inglês dizemos 'ocean' ou 'sea'. A água é azul." },
      { speaker: "user", text: "The ocean is beautiful! And the sand is warm.", textPt: "O oceano é lindo! E a areia está quente.", options: ["The ocean is beautiful! And the sand is warm.", "I don't see the ocean.", "Where is the pool?"], correctIndex: 0 },
      { speaker: "teacher", text: "Perfect! Now look at the palm tree. In English: 'palm tree'. Can you repeat?", textPt: "Perfeito! Agora olhe para a palmeira. Em inglês: 'palm tree'. Você consegue repetir?" },
      { speaker: "user", text: "Palm tree! I can see the palm tree near the beach.", textPt: "Palm tree! Consigo ver a palmeira perto da praia.", options: ["Palm tree! I can see the palm tree near the beach.", "I don't know this word.", "Is that a coconut tree?"], correctIndex: 0 },
      { speaker: "teacher", text: "Excellent! Your English is great! Keep practicing every day!", textPt: "Excelente! Seu inglês está ótimo! Continue praticando todos os dias!" },
    ],
    hotspots: [
      { id: "palm", x: 79, y: 24, label: "Palm Tree", translation: "Palmeira", pronunciation: "PAAM-tree", example: "The palm tree is tall.", examplePt: "A palmeira é alta.", icon: "🌴", color: "#22c55e" },
      { id: "ocean", x: 24, y: 66, label: "Ocean", translation: "Oceano", pronunciation: "OH-shën", example: "The ocean is deep.", examplePt: "O oceano é profundo.", icon: "🌊", color: "#06b6d4" },
      { id: "wave", x: 38, y: 58, label: "Wave", translation: "Onda", pronunciation: "WEYV", example: "The wave is big.", examplePt: "A onda é grande.", icon: "🌊", color: "#14b8a6" },
      { id: "sand", x: 59, y: 82, label: "Sand", translation: "Areia", pronunciation: "SÆND", example: "The sand is warm.", examplePt: "A areia está quente.", icon: "🏖️", color: "#f59e0b" },
    ],
  },
  garden: {
    dialog: [
      { speaker: "teacher", text: "ようこそ！私はゆきです。この日本庭園は美しいですね！", textPt: "Bem-vindo! Sou Yuki. Este jardim japonês é bonito, não é?" },
      { speaker: "user", text: "はい、とても美しいです！桜の花が素晴らしいです！", textPt: "Sim, é muito bonito! As flores de cerejeira são maravilhosas!", options: ["はい、とても美しいです！桜の花が素晴らしいです！", "わかりません。", "怖いです。"], correctIndex: 0 },
      { speaker: "teacher", text: "そうですね！池の中に魚がいます。橋を渡りましょう！", textPt: "É mesmo! Há peixes no lago. Vamos atravessar a ponte!" },
      { speaker: "user", text: "はい！橋はとても美しいです。石も見えます。", textPt: "Sim! A ponte é muito bonita. Também vejo as pedras.", options: ["はい！橋はとても美しいです。石も見えます。", "橋が怖いです。", "どこに行きますか？"], correctIndex: 0 },
      { speaker: "teacher", text: "よく見えましたね！竹もあります。竹は日本の象徴です。", textPt: "Você viu bem! Há bambu também. O bambu é símbolo do Japão." },
      { speaker: "user", text: "提灯も光っています！夜はもっと美しいでしょう。", textPt: "As lanternas também estão brilhando! À noite deve ser ainda mais bonito.", options: ["提灯も光っています！夜はもっと美しいでしょう。", "もう帰りたいです。", "日本語は難しいです。"], correctIndex: 0 },
      { speaker: "teacher", text: "素晴らしい！日本語がとても上手になりましたね！", textPt: "Maravilhoso! Seu japonês melhorou muito!" },
    ],
    hotspots: [
      { id: "sakura2", x: 35, y: 25, label: "桜", translation: "Cerejeira", pronunciation: "sa-ku-ra", example: "桜が美しい。", examplePt: "A cerejeira é bonita.", icon: "🌸", color: "#ec4899" },
      { id: "ike", x: 55, y: 60, label: "池", translation: "Lago", pronunciation: "いけ", example: "池に魚がいる。", examplePt: "Há peixes no lago.", icon: "🐟", color: "#3b82f6" },
      { id: "hashi", x: 70, y: 50, label: "橋", translation: "Ponte", pronunciation: "はし", example: "橋を渡る。", examplePt: "Atravesse a ponte.", icon: "🌉", color: "#a16207" },
      { id: "ishi", x: 25, y: 65, label: "石", translation: "Pedra", pronunciation: "いし", example: "石は重い。", examplePt: "A pedra é pesada.", icon: "🪨", color: "#64748b" },
      { id: "take", x: 80, y: 35, label: "竹", translation: "Bambu", pronunciation: "たけ", example: "竹は高い。", examplePt: "O bambu é alto.", icon: "🎋", color: "#16a34a" },
      { id: "chochin2", x: 45, y: 40, label: "提灯", translation: "Lanterna", pronunciation: "cho-chin", example: "提灯が光る。", examplePt: "A lanterna brilha.", icon: "🏮", color: "#ea580c" },
    ],
  },
  family_home: {
    dialog: [
      { speaker: "teacher", text: "Who is in your family?", textPt: "Quem está na sua família?" },
      { speaker: "user", text: "I have a mom, a dad, and a sister.", textPt: "Tenho uma mãe, um pai e uma irmã.", options: ["I have a mom, a dad, and a sister.", "I live alone.", "I don't know."], correctIndex: 0 },
      { speaker: "teacher", text: "Great! What do you see in the living room?", textPt: "Ótimo! O que você vê na sala de estar?" },
      { speaker: "user", text: "I see a sofa, a TV, and a table.", textPt: "Vejo um sofá, uma TV e uma mesa.", options: ["I see a sofa, a TV, and a table.", "I see nothing.", "I see a car."], correctIndex: 0 },
      { speaker: "teacher", text: "Perfect! Tell me about your morning routine at home.", textPt: "Perfeito! Me conte sobre sua rotina matinal em casa." },
      { speaker: "user", text: "We eat breakfast together every morning.", textPt: "Tomamos café da manhã juntos toda manhã.", options: ["We eat breakfast together every morning.", "We never eat together.", "We sleep all day."], correctIndex: 0 },
    ],
    hotspots: [
      { id: "sofa", x: 35, y: 65, label: "Sofa", translation: "Sofá", pronunciation: "SOU-fa", example: "The family sits on the sofa.", examplePt: "A família senta no sofá.", icon: "🛋️", color: "#a16207" },
      { id: "tv", x: 60, y: 40, label: "Television", translation: "Televisão", pronunciation: "te-li-VI-zhon", example: "We watch television together.", examplePt: "Assistimos televisão juntos.", icon: "📺", color: "#1d4ed8" },
      { id: "table", x: 50, y: 75, label: "Table", translation: "Mesa", pronunciation: "TEY-bel", example: "We eat at the table.", examplePt: "Comemos na mesa.", icon: "🪑", color: "#92400e" },
      { id: "window", x: 80, y: 30, label: "Window", translation: "Janela", pronunciation: "WIN-dou", example: "Open the window.", examplePt: "Abra a janela.", icon: "🪟", color: "#0ea5e9" },
      { id: "door", x: 15, y: 50, label: "Door", translation: "Porta", pronunciation: "DOOR", example: "Close the door please.", examplePt: "Feche a porta por favor.", icon: "🚪", color: "#7c3aed" },
      { id: "kitchen2", x: 25, y: 80, label: "Kitchen", translation: "Cozinha", pronunciation: "KI-tchin", example: "Mom cooks in the kitchen.", examplePt: "A mãe cozinha na cozinha.", icon: "🍳", color: "#dc2626" },
      { id: "bedroom", x: 70, y: 20, label: "Bedroom", translation: "Quarto", pronunciation: "BED-ruum", example: "My bedroom is upstairs.", examplePt: "Meu quarto fica em cima.", icon: "🛏️", color: "#6366f1" },
      { id: "family_pic", x: 45, y: 55, label: "Family", translation: "Família", pronunciation: "FÆM-i-li", example: "My family is very close.", examplePt: "Minha família é muito unida.", icon: "👨‍👩‍👧‍👦", color: "#f59e0b" },
    ],
  },
  airport_family: {
    dialog: [
      { speaker: "teacher", text: "The family is going on vacation! Where are they going?", textPt: "A família vai de férias! Para onde eles vão?" },
      { speaker: "user", text: "They are going to London!", textPt: "Eles vão para Londres!", options: ["They are going to London!", "They are going home.", "They are lost."], correctIndex: 0 },
      { speaker: "teacher", text: "Excellent! Dad needs to find the gate. What does he ask?", textPt: "Excelente! O pai precisa encontrar o portão. O que ele pergunta?" },
      { speaker: "user", text: "Excuse me, where is gate B12?", textPt: "Com licença, onde fica o portão B12?", options: ["Excuse me, where is gate B12?", "I don't speak English.", "I'm also lost."], correctIndex: 0 },
      { speaker: "teacher", text: "Perfect! Mom is checking the luggage. What does she say?", textPt: "Perfeito! A mãe está despachando a bagagem. O que ela diz?" },
      { speaker: "user", text: "I have two bags to check in, please.", textPt: "Tenho duas malas para despachar, por favor.", options: ["I have two bags to check in, please.", "I have no bags.", "I lost my bags."], correctIndex: 0 },
      { speaker: "teacher", text: "Wonderful! The children are excited. What do they say?", textPt: "Maravilhoso! As crianças estão animadas. O que elas dizem?" },
      { speaker: "user", text: "We are so excited about our vacation!", textPt: "Estamos muito animados com nossas férias!", options: ["We are so excited about our vacation!", "We want to go home.", "We are tired."], correctIndex: 0 },
    ],
    hotspots: [
      { id: "passport2", x: 45, y: 60, label: "Passport", translation: "Passaporte", pronunciation: "PÆS-port", example: "Show your passport at the gate.", examplePt: "Mostre seu passaporte no portão.", icon: "📘", color: "#1d4ed8" },
      { id: "suitcase", x: 30, y: 75, label: "Suitcase", translation: "Mala", pronunciation: "SUUT-keys", example: "The suitcase is heavy.", examplePt: "A mala está pesada.", icon: "🧳", color: "#f59e0b" },
      { id: "boarding_pass", x: 65, y: 50, label: "Boarding Pass", translation: "Cartão de Embarque", pronunciation: "BOR-ding PÆS", example: "Keep your boarding pass safe.", examplePt: "Guarde seu cartão de embarque.", icon: "🎫", color: "#22c55e" },
      { id: "gate2", x: 75, y: 30, label: "Gate", translation: "Portão", pronunciation: "GEYT", example: "Go to gate B12.", examplePt: "Vá ao portão B12.", icon: "🚪", color: "#6366f1" },
      { id: "flight_board", x: 20, y: 35, label: "Flight Board", translation: "Painel de Voos", pronunciation: "FLAYT BORD", example: "Check the flight board.", examplePt: "Verifique o painel de voos.", icon: "📋", color: "#0ea5e9" },
      { id: "security2", x: 50, y: 85, label: "Security", translation: "Segurança", pronunciation: "si-KYUR-iti", example: "Pass through security check.", examplePt: "Passe pela verificação de segurança.", icon: "🔒", color: "#dc2626" },
    ],
  },
  airport: {
    dialog: [
      { speaker: "teacher", text: "Welcome to the airport! Do you have your passport ready?", textPt: "Bem-vindo ao aeroporto! Você tem seu passaporte pronto?" },
      { speaker: "user", text: "Yes, here is my passport and boarding pass!", textPt: "Sim, aqui está meu passaporte e cartão de embarque!", options: ["Yes, here is my passport and boarding pass!", "I lost my passport.", "What is a boarding pass?"], correctIndex: 0 },
      { speaker: "teacher", text: "Great! Your flight is at gate B12. Do you see the screen with flight information?", textPt: "Ótimo! Seu voo é no portão B12. Você vê a tela com informações de voo?" },
      { speaker: "user", text: "Yes! The screen says my flight departs in one hour.", textPt: "Sim! A tela diz que meu voo parte em uma hora.", options: ["Yes! The screen says my flight departs in one hour.", "I can't read the screen.", "Where is gate B12?"], correctIndex: 0 },
      { speaker: "teacher", text: "Perfect! Don't forget to pass through security. Remove your shoes and belt.", textPt: "Perfeito! Não esqueça de passar pela segurança. Tire os sapatos e o cinto." },
      { speaker: "user", text: "Understood! How heavy can my luggage be?", textPt: "Entendido! Qual é o peso máximo da bagagem?", options: ["Understood! How heavy can my luggage be?", "I don't have luggage.", "Can I bring food?"], correctIndex: 0 },
      { speaker: "teacher", text: "Usually 23 kilograms for checked luggage. Have a great flight!", textPt: "Geralmente 23 quilos para bagagem despachada. Tenha um ótimo voo!" },
    ],
    hotspots: [
      { id: "gate", x: 60, y: 30, label: "Gate", translation: "Portão", pronunciation: "GEYT", example: "The gate is open.", examplePt: "O portão está aberto.", icon: "🚪", color: "#6366f1" },
      { id: "person", x: 62, y: 58, label: "Person", translation: "Pessoa", pronunciation: "PER-son", example: "The person is waiting.", examplePt: "A pessoa está esperando.", icon: "🧍", color: "#f59e0b" },
      { id: "people", x: 50, y: 55, label: "People", translation: "Pessoas", pronunciation: "PI-pol", example: "The people are waiting.", examplePt: "As pessoas estão esperando.", icon: "👥", color: "#0ea5e9" },
      { id: "sign", x: 90, y: 18, label: "Sign", translation: "Placa", pronunciation: "SAIN", example: "Read the sign.", examplePt: "Leia a placa.", icon: "📋", color: "#94a3b8" },
      { id: "window", x: 20, y: 35, label: "Window", translation: "Janela", pronunciation: "WIN-dou", example: "The window is large.", examplePt: "A janela é grande.", icon: "🪟", color: "#8b5cf6" },
      { id: "floor", x: 45, y: 72, label: "Floor", translation: "Chão", pronunciation: "FLÓR", example: "The floor is clean.", examplePt: "O chão está limpo.", icon: "⬇️", color: "#dc2626" },
    ],
  },
  cafe: {
    dialog: [
      { speaker: "teacher", text: "Bonjour! Je m'appelle Sophie. Bienvenue au café! Que désirez-vous commander?", textPt: "Bom dia! Sou Sophie. Bem-vindo ao café! O que você gostaria de pedir?" },
      { speaker: "user", text: "Bonjour Sophie! Un café et un croissant, s'il vous plaît.", textPt: "Bom dia Sophie! Um café e um croissant, por favor.", options: ["Bonjour Sophie! Un café et un croissant, s'il vous plaît.", "Je ne veux rien.", "L'addition!"], correctIndex: 0 },
      { speaker: "teacher", text: "Très bon choix! Voulez-vous vous asseoir en terrasse? La vue est magnifique.", textPt: "Ótima escolha! Quer se sentar no terraço? A vista é magnífica." },
      { speaker: "user", text: "Oui, la terrasse est parfaite! Je vais lire le journal en attendant.", textPt: "Sim, o terraço é perfeito! Vou ler o jornal enquanto espero.", options: ["Oui, la terrasse est parfaite! Je vais lire le journal en attendant.", "Non, je préfère l'intérieur.", "Je n'ai pas le temps."], correctIndex: 0 },
      { speaker: "teacher", text: "Voici votre café et votre croissant! Le croissant est frais du matin.", textPt: "Aqui está seu café e seu croissant! O croissant é fresco da manhã." },
      { speaker: "user", text: "Merci beaucoup! C'est délicieux! L'addition, s'il vous plaît.", textPt: "Muito obrigado! Está delicioso! A conta, por favor.", options: ["Merci beaucoup! C'est délicieux! L'addition, s'il vous plaît.", "Je n'aime pas le croissant.", "C'est trop cher."], correctIndex: 0 },
      { speaker: "teacher", text: "Avec plaisir! Votre français est excellent. Revenez bientôt!", textPt: "Com prazer! Seu francês está excelente. Volte logo!" },
    ],
    hotspots: [
      { id: "cafe3", x: 40, y: 55, label: "Café", translation: "Café", pronunciation: "ka-FÉ", example: "Le café est chaud.", examplePt: "O café está quente.", icon: "☕", color: "#a16207" },
      { id: "croissant", x: 60, y: 65, label: "Croissant", translation: "Croissant", pronunciation: "krwa-SON", example: "Le croissant est frais.", examplePt: "O croissant é fresco da manhã.", icon: "🥐", color: "#f59e0b" },
      { id: "garcon", x: 25, y: 40, label: "Garçon", translation: "Garçom", pronunciation: "gar-SON", example: "Appelez le garçon.", examplePt: "Chame o garçom.", icon: "🧑‍🍳", color: "#6366f1" },
      { id: "terrasse", x: 70, y: 35, label: "Terrasse", translation: "Terraço", pronunciation: "te-RAS", example: "La terrasse est agréable.", examplePt: "O terraço é agradável.", icon: "🪑", color: "#22c55e" },
      { id: "journal", x: 50, y: 45, label: "Journal", translation: "Jornal", pronunciation: "zhur-NAL", example: "Je lis le journal.", examplePt: "Leio o jornal.", icon: "📰", color: "#0ea5e9" },
      { id: "addition", x: 80, y: 60, label: "Addition", translation: "Conta", pronunciation: "a-di-SION", example: "L'addition, s'il vous plaît.", examplePt: "A conta, por favor.", icon: "🧾", color: "#dc2626" },
    ],
  },
  paris: {
    dialog: [
      { speaker: "teacher", text: "Bonjour! Je m'appelle Sophie. Bienvenue à Paris!", textPt: "Olá! Meu nome é Sophie. Bem-vindo a Paris!" },
      { speaker: "user", text: "Bonjour Sophie! C'est magnifique ici!", textPt: "Olá Sophie! É magnífico aqui!", options: ["Bonjour Sophie! C'est magnifique ici!", "Je ne comprends pas.", "Au revoir!"], correctIndex: 0 },
      { speaker: "teacher", text: "Oui! Voilà la Tour Eiffel. C'est le symbole de Paris.", textPt: "Sim! Ali está a Torre Eiffel. É o símbolo de Paris." },
      { speaker: "user", text: "Elle est très belle! Je voudrais prendre une photo.", textPt: "Ela é muito bonita! Eu gostaria de tirar uma foto.", options: ["Elle est très belle! Je voudrais prendre une photo.", "Non, je n'aime pas.", "Où est le métro?"], correctIndex: 0 },
      { speaker: "teacher", text: "Bien sûr! Et regardez ce café — on dit 'café' en français.", textPt: "Claro! E olhe este café — dizemos 'café' em francês." },
      { speaker: "user", text: "Je voudrais un café, s'il vous plaît!", textPt: "Eu gostaria de um café, por favor!", options: ["Je voudrais un café, s'il vous plaît!", "Je n'aime pas le café.", "Où est la boulangerie?"], correctIndex: 0 },
      { speaker: "teacher", text: "Parfait! Votre français est excellent! Continuez comme ça!", textPt: "Perfeito! Seu francês está excelente! Continue assim!" },
    ],
    hotspots: [
      { id: "tower", x: 72, y: 18, label: "Tour Eiffel", translation: "Torre Eiffel", pronunciation: "tur-e-FEL", example: "La Tour Eiffel est magnifique.", examplePt: "A Torre Eiffel é magnífica.", icon: "🗼", color: "#6366f1" },
      { id: "cafe", x: 18, y: 58, label: "Café", translation: "Café", pronunciation: "ka-FÉ", example: "Je prends un café.", examplePt: "Eu tomo um café.", icon: "☕", color: "#f59e0b" },
      { id: "rue", x: 50, y: 78, label: "Rue", translation: "Rua", pronunciation: "RÜ", example: "La rue est longue.", examplePt: "A rua é longa.", icon: "🛣️", color: "#10b981" },
      { id: "fleur", x: 30, y: 42, label: "Fleur", translation: "Flor", pronunciation: "FLÖR", example: "La fleur est belle.", examplePt: "A flor é bonita.", icon: "🌸", color: "#ec4899" },
      { id: "immeuble", x: 85, y: 32, label: "Immeuble", translation: "Prédio", pronunciation: "i-MÖBL", example: "L'immeuble est grand.", examplePt: "O prédio é grande.", icon: "🏢", color: "#8b5cf6" },
      { id: "ciel", x: 55, y: 12, label: "Ciel", translation: "Céu", pronunciation: "SJEL", example: "Le ciel est bleu.", examplePt: "O céu é azul.", icon: "☁️", color: "#3b82f6" },
      { id: "boulangerie", x: 25, y: 68, label: "Boulangerie", translation: "Padaria", pronunciation: "bu-lon-JRHI", example: "La boulangerie est ouverte.", examplePt: "A padaria está aberta.", icon: "🥖", color: "#d97706" },
      { id: "pont", x: 60, y: 55, label: "Pont", translation: "Ponte", pronunciation: "PON", example: "Le pont est ancien.", examplePt: "A ponte é antiga.", icon: "🌉", color: "#0891b2" },
    ],
  },
  newyork: {
    dialog: [
      { speaker: "teacher", text: "Hey! Welcome to New York City — the Big Apple!", textPt: "Ei! Bem-vindo à cidade de Nova York — a Grande Maçã!" },
      { speaker: "user", text: "This city is absolutely amazing! The skyscrapers are huge!", textPt: "Esta cidade é absolutamente incrível! Os arranha-céus são enormes!", options: ["This city is absolutely amazing! The skyscrapers are huge!", "I'm lost.", "Where is the hotel?"], correctIndex: 0 },
      { speaker: "teacher", text: "Yes! Those are skyscrapers. In English: 'sky-scra-per'. Can you say that?", textPt: "Sim! Esses são arranha-céus. Em inglês: 'sky-scra-per'. Você consegue dizer isso?" },
      { speaker: "user", text: "Skyscraper! And I can see a yellow taxi on the street!", textPt: "Skyscraper! E consigo ver um táxi amarelo na rua!", options: ["Skyscraper! And I can see a yellow taxi on the street!", "I don't understand.", "Is that the subway?"], correctIndex: 0 },
      { speaker: "teacher", text: "Perfect! Yellow taxis are iconic in New York. You can also take the subway underground.", textPt: "Perfeito! Os táxis amarelos são icônicos em Nova York. Você também pode pegar o metrô subterrâneo." },
      { speaker: "user", text: "How do I take the subway? I want to go to Central Park!", textPt: "Como pego o metrô? Quero ir ao Central Park!", options: ["How do I take the subway? I want to go to Central Park!", "I prefer to walk.", "I'll take a taxi."], correctIndex: 0 },
      { speaker: "teacher", text: "Great choice! Your English is excellent. Keep it up!", textPt: "Ótima escolha! Seu inglês está excelente. Continue assim!" },
    ],
    hotspots: [
      { id: "statue", x: 7, y: 48, label: "Statue", translation: "Estátua", pronunciation: "STÉ-tchu", example: "The statue is big.", examplePt: "A estátua é grande.", icon: "🗽", color: "#16a34a" },
      { id: "building", x: 47, y: 36, label: "Building", translation: "Prédio", pronunciation: "BIL-ding", example: "The building is tall.", examplePt: "O prédio é alto.", icon: "🏙️", color: "#6366f1" },
      { id: "city", x: 67, y: 55, label: "City", translation: "Cidade", pronunciation: "SI-ti", example: "This is a big city.", examplePt: "Esta é uma cidade grande.", icon: "🏙️", color: "#0ea5e9" },
      { id: "water", x: 43, y: 72, label: "Water", translation: "Água", pronunciation: "UÓ-ter", example: "The water is blue.", examplePt: "A água é azul.", icon: "🌊", color: "#0891b2" },
      { id: "sun", x: 79, y: 29, label: "Sun", translation: "Sol", pronunciation: "SÂN", example: "The sun is yellow.", examplePt: "O sol é amarelo.", icon: "☀️", color: "#f59e0b" },
      { id: "window", x: 79, y: 58, label: "Window", translation: "Janela", pronunciation: "WIN-dou", example: "The window is large.", examplePt: "A janela é grande.", icon: "🪟", color: "#64748b" },
    ],
  },
  kitchen: {
    dialog: [
      { speaker: "teacher", text: "¡Hola! Me llamo Carlos. ¡Bienvenido a mi cocina!", textPt: "Olá! Meu nome é Carlos. Bem-vindo à minha cozinha!" },
      { speaker: "user", text: "¡Hola Carlos! La cocina es muy bonita.", textPt: "Olá Carlos! A cozinha é muito bonita.", options: ["¡Hola Carlos! La cocina es muy bonita.", "No me gusta cocinar.", "¿Dónde está el baño?"], correctIndex: 0 },
      { speaker: "teacher", text: "¡Gracias! Mira la nevera. En español decimos 'nevera' o 'refrigerador'.", textPt: "Obrigado! Olhe a geladeira. Em espanhol dizemos 'nevera' ou 'refrigerador'." },
      { speaker: "user", text: "¡Entiendo! La nevera guarda los alimentos fríos.", textPt: "Entendo! A geladeira guarda os alimentos frios.", options: ["¡Entiendo! La nevera guarda los alimentos fríos.", "No sé qué es eso.", "¿Puedo comer?"], correctIndex: 0 },
      { speaker: "teacher", text: "¡Exacto! Y el horno sirve para cocinar. ¿Sabes cómo se dice 'horno' en portugués?", textPt: "Exato! E o forno serve para cozinhar. Você sabe como se diz 'horno' em português?" },
      { speaker: "user", text: "¡Sí! En portugués se dice 'forno'. ¡Son palabras similares!", textPt: "Sim! Em português se diz 'forno'. São palavras parecidas!", options: ["¡Sí! En portugués se dice 'forno'. ¡Son palabras similares!", "No lo sé.", "¿Cuál es la diferencia?"], correctIndex: 0 },
      { speaker: "teacher", text: "¡Muy bien! Tu español mejora cada día. ¡Sigue así!", textPt: "Muito bem! Seu espanhol melhora a cada dia. Continue assim!" },
    ],
    hotspots: [
      { id: "nevera", x: 15, y: 35, label: "Nevera", translation: "Geladeira", pronunciation: "ne-VE-ra", example: "La nevera está fría.", examplePt: "A geladeira está fria.", icon: "🧊", color: "#0ea5e9" },
      { id: "horno", x: 50, y: 65, label: "Horno", translation: "Forno", pronunciation: "OR-no", example: "El horno está caliente.", examplePt: "O forno está quente.", icon: "🔥", color: "#f97316" },
      { id: "mesa", x: 70, y: 75, label: "Mesa", translation: "Mesa", pronunciation: "ME-sa", example: "La mesa está limpia.", examplePt: "A mesa está limpa.", icon: "🪑", color: "#a16207" },
      { id: "ventana", x: 80, y: 25, label: "Ventana", translation: "Janela", pronunciation: "ben-TA-na", example: "La ventana está abierta.", examplePt: "A janela está aberta.", icon: "🪟", color: "#0891b2" },
      { id: "cuchara", x: 35, y: 52, label: "Cuchara", translation: "Colher", pronunciation: "ku-TCHA-ra", example: "La cuchara está en el recipiente.", examplePt: "A colher está no recipiente.", icon: "🥄", color: "#dc2626" },
      { id: "encimera", x: 60, y: 80, label: "Encimera", translation: "Bancada", pronunciation: "en-si-ME-ra", example: "La encimera está limpia.", examplePt: "A bancada está limpa.", icon: "🪵", color: "#7c3aed" },
    ],
  },
  restaurant: {
    dialog: [
      { speaker: "teacher", text: "Olá! Meu nome é Ana. Bem-vindo ao nosso restaurante brasileiro!", textPt: "Olá! Meu nome é Ana. Bem-vindo ao nosso restaurante brasileiro!" },
      { speaker: "user", text: "Olá Ana! O restaurante é muito bonito.", textPt: "Olá Ana! O restaurante é muito bonito.", options: ["Olá Ana! O restaurante é muito bonito.", "Não gosto de restaurantes.", "Onde é o banheiro?"], correctIndex: 0 },
      { speaker: "teacher", text: "Obrigada! Veja a mesa — em português dizemos 'mesa'. E a vela se chama 'vela'.", textPt: "Obrigada! Veja a mesa — em português dizemos 'mesa'. E a vela se chama 'vela'." },
      { speaker: "user", text: "Entendi! Mesa e vela. Posso ver o cardápio?", textPt: "Entendi! Mesa e vela. Posso ver o cardápio?", options: ["Entendi! Mesa e vela. Posso ver o cardápio?", "Não entendi nada.", "Quero ir embora."], correctIndex: 0 },
      { speaker: "teacher", text: "Claro! O cardápio está aqui. Temos massa, vinho e sobremesas deliciosas!", textPt: "Claro! O cardápio está aqui. Temos massa, vinho e sobremesas deliciosas!" },
      { speaker: "user", text: "Que ótimo! Vou querer a massa com molho de tomate, por favor.", textPt: "Que ótimo! Vou querer a massa com molho de tomate, por favor.", options: ["Que ótimo! Vou querer a massa com molho de tomate, por favor.", "Não quero nada.", "Prefiro comer em casa."], correctIndex: 0 },
      { speaker: "teacher", text: "Perfeita escolha! Seu português está excelente. Parabéns!", textPt: "Perfeita escolha! Seu português está excelente. Parabéns!" },
    ],
    hotspots: [
      { id: "massa", x: 28, y: 77, label: "Massa", translation: "Pasta", pronunciation: "MA-ssa", example: "A massa está deliciosa.", examplePt: "A massa está deliciosa.", icon: "🍝", color: "#f59e0b" },
      { id: "vinho", x: 25, y: 45, label: "Vinho", translation: "Wine", pronunciation: "VI-nho", example: "O vinho é tinto.", examplePt: "O vinho é tinto.", icon: "🍷", color: "#dc2626" },
      { id: "mesa", x: 70, y: 54, label: "Mesa", translation: "Table", pronunciation: "ME-za", example: "A mesa está limpa.", examplePt: "A mesa está limpa.", icon: "🪑", color: "#a16207" },
      { id: "vela", x: 41, y: 49, label: "Vela", translation: "Candle", pronunciation: "VE-la", example: "A vela ilumina a mesa.", examplePt: "A vela ilumina a mesa.", icon: "🕯️", color: "#eab308" },
      { id: "quadro", x: 84, y: 33, label: "Quadro", translation: "Picture", pronunciation: "KWA-dro", example: "O quadro está na parede.", examplePt: "The picture is on the wall.", icon: "🖼️", color: "#6366f1" },
      { id: "janela", x: 14, y: 28, label: "Janela", translation: "Window", pronunciation: "ja-NE-la", example: "A janela é grande.", examplePt: "The window is big.", icon: "🪟", color: "#0891b2" },
    ],
  },
  hotel: {
    dialog: [
      { speaker: "teacher", text: "Buongiorno! Benvenuto in hotel. Ha una prenotazione?", textPt: "Bom dia! Bem-vindo ao hotel. Tem uma reserva?" },
      { speaker: "user", text: "Sì, ho una prenotazione. Mi chiamo Marco.", textPt: "Sim, tenho uma reserva. Meu nome é Marco.", options: ["Sì, ho una prenotazione. Mi chiamo Marco.", "No, non ho prenotazione.", "Forse, non ricordo."], correctIndex: 0 },
      { speaker: "teacher", text: "Perfetto, Marco! La sua camera è al terzo piano. Ecco la chiave.", textPt: "Perfeito, Marco! Seu quarto fica no terceiro andar. Aqui está a chave." },
      { speaker: "user", text: "Grazie! Dov'è l'ascensore?", textPt: "Obrigado! Onde fica o elevador?", options: ["Grazie! Dov'è l'ascensore?", "Non capisco.", "Posso avere un'altra camera?"], correctIndex: 0 },
      { speaker: "teacher", text: "L'ascensore è a destra. La piscina è al piano terra, aperta fino alle 22.", textPt: "O elevador fica à direita. A piscina fica no térreo, aberta até as 22h." },
      { speaker: "user", text: "Meraviglioso! E il ristorante, a che ora apre?", textPt: "Maravilhoso! E o restaurante, a que horas abre?", options: ["Meraviglioso! E il ristorante, a che ora apre?", "Non ho fame.", "Preferisco mangiare fuori."], correctIndex: 0 },
      { speaker: "teacher", text: "Il ristorante apre alle sette di sera. Buon soggiorno!", textPt: "O restaurante abre às sete da noite. Boa estadia!" },
    ],
    hotspots: [
      { id: "reception", x: 40, y: 55, label: "Reception", translation: "Recepção", pronunciation: "re-tche-TSIO-ne", example: "La reception è al piano terra.", examplePt: "A recepção fica no térreo.", icon: "🛎️", color: "#f59e0b" },
      { id: "lampadario", x: 55, y: 22, label: "Lampadario", translation: "Lustre", pronunciation: "lam-pa-DA-rio", example: "Il lampadario è grande.", examplePt: "O lustre é grande.", icon: "💡", color: "#eab308" },
      { id: "colonna", x: 80, y: 35, label: "Colonna", translation: "Coluna", pronunciation: "ko-LON-na", example: "La colonna è alta.", examplePt: "A coluna é alta.", icon: "🏛️", color: "#6366f1" },
      { id: "poltrona", x: 28, y: 74, label: "Poltrona", translation: "Poltrona", pronunciation: "pol-TRO-na", example: "La poltrona è comoda.", examplePt: "A poltrona é confortável.", icon: "🪑", color: "#0ea5e9" },
      { id: "pianta", x: 48, y: 56, label: "Pianta", translation: "Planta", pronunciation: "PIAN-ta", example: "La pianta è verde.", examplePt: "A planta é verde.", icon: "🌿", color: "#8b5cf6" },
      { id: "lampada", x: 66, y: 55, label: "Lampada", translation: "Luminária", pronunciation: "lam-PA-da", example: "La lampada è accesa.", examplePt: "A luminária está acesa.", icon: "💡", color: "#dc2626" },
    ],
  },
  supermarket: {
    dialog: [
      { speaker: "teacher", text: "¡Bienvenido al supermercado! ¿Qué necesitas comprar hoy?", textPt: "Bem-vindo ao supermercado! O que você precisa comprar hoje?" },
      { speaker: "user", text: "Necesito leche, pan y fruta fresca.", textPt: "Preciso de leite, pão e fruta fresca.", options: ["Necesito leche, pan y fruta fresca.", "No necesito nada.", "No sé qué comprar."], correctIndex: 0 },
      { speaker: "teacher", text: "¡Perfecto! La fruta está en el pasillo tres. ¿Sabes cómo pedir el precio?", textPt: "Perfeito! A fruta fica no corredor três. Você sabe como perguntar o preço?" },
      { speaker: "user", text: "¡Sí! Digo: '¿Cuál es el precio de esta fruta?'", textPt: "Sim! Digo: 'Qual é o preço desta fruta?'", options: ["¡Sí! Digo: '¿Cuál es el precio de esta fruta?'", "No sé cómo preguntar.", "Prefiero no preguntar."], correctIndex: 0 },
      { speaker: "teacher", text: "¡Excelente! Y cuando termines, vas a la caja para pagar.", textPt: "Excelente! E quando terminar, vá ao caixa para pagar." },
      { speaker: "user", text: "¿Puedo pagar con tarjeta de crédito?", textPt: "Posso pagar com cartão de crédito?", options: ["¿Puedo pagar con tarjeta de crédito?", "Solo tengo efectivo.", "¿Dónde está la salida?"], correctIndex: 0 },
      { speaker: "teacher", text: "¡Claro que sí! Tu español está mejorando mucho. ¡Muy bien!", textPt: "Claro que sim! Seu espanhol está melhorando muito. Muito bem!" },
    ],
    hotspots: [
      { id: "carrito", x: 35, y: 65, label: "Carrito", translation: "Carrinho", pronunciation: "ka-RRI-to", example: "El carrito está lleno.", examplePt: "O carrinho está cheio.", icon: "🛒", color: "#f59e0b" },
      { id: "fruta", x: 20, y: 40, label: "Fruta", translation: "Fruta", pronunciation: "FRU-ta", example: "La fruta es fresca.", examplePt: "A fruta está fresca.", icon: "🍎", color: "#dc2626" },
      { id: "pan", x: 60, y: 45, label: "Pan", translation: "Pão", pronunciation: "pan", example: "El pan está caliente.", examplePt: "O pão está quente.", icon: "🍞", color: "#a16207" },
      { id: "leche", x: 75, y: 35, label: "Leche", translation: "Leite", pronunciation: "LE-tche", example: "La leche es blanca.", examplePt: "O leite é branco.", icon: "🥛", color: "#e2e8f0" },
      { id: "caja", x: 50, y: 78, label: "Caja", translation: "Caixa", pronunciation: "KA-kha", example: "La caja está al fondo.", examplePt: "O caixa fica no fundo.", icon: "💳", color: "#6366f1" },
      { id: "precio", x: 85, y: 55, label: "Precio", translation: "Preço", pronunciation: "PRE-sio", example: "¿Cuál es el precio?", examplePt: "Qual é o preço?", icon: "🏷️", color: "#22c55e" },
    ],
  },
  school: {
    dialog: [
      { speaker: "teacher", text: "Good morning class! Please open your books to page ten.", textPt: "Bom dia turma! Por favor, abram seus livros na página dez." },
      { speaker: "user", text: "Good morning, teacher! I'm ready to learn!", textPt: "Bom dia, professor! Estou pronto para aprender!", options: ["Good morning, teacher! I'm ready to learn!", "I forgot my book.", "Can I sit in the back?"], correctIndex: 0 },
      { speaker: "teacher", text: "Excellent attitude! Now look at the blackboard. I will write new vocabulary.", textPt: "Excelente atitude! Agora olhe para a lousa. Vou escrever vocabulário novo." },
      { speaker: "user", text: "I can see the blackboard clearly from my desk.", textPt: "Consigo ver a lousa claramente da minha carteira.", options: ["I can see the blackboard clearly from my desk.", "I can't see the board.", "Can I move my desk?"], correctIndex: 0 },
      { speaker: "teacher", text: "Great! Use your pencil to write these words in your notebook.", textPt: "Ótimo! Use seu lápis para escrever essas palavras no seu caderno." },
      { speaker: "user", text: "Should I also write the clock time when I take notes?", textPt: "Devo também escrever o horário do relógio quando faço anotações?", options: ["Should I also write the clock time when I take notes?", "I don't have a pencil.", "Can I use a pen instead?"], correctIndex: 0 },
      { speaker: "teacher", text: "That's a great habit! Your English is improving every lesson!", textPt: "Esse é um ótimo hábito! Seu inglês melhora a cada aula!" },
    ],
    hotspots: [
      { id: "board", x: 50, y: 22, label: "Blackboard", translation: "Lousa", pronunciation: "BLÆK-bord", example: "Write on the blackboard.", examplePt: "Escreva na lousa.", icon: "📋", color: "#16a34a" },
      { id: "desk", x: 35, y: 68, label: "Desk", translation: "Carteira", pronunciation: "DESK", example: "Sit at your desk.", examplePt: "Sente-se na sua carteira.", icon: "🪑", color: "#a16207" },
      { id: "book", x: 65, y: 58, label: "Book", translation: "Livro", pronunciation: "BUK", example: "Read the book.", examplePt: "Leia o livro.", icon: "📖", color: "#6366f1" },
      { id: "pencil", x: 20, y: 55, label: "Pencil", translation: "Lápis", pronunciation: "PEN-sil", example: "Use a pencil.", examplePt: "Use um lápis.", icon: "✏️", color: "#eab308" },
      { id: "window", x: 80, y: 30, label: "Window", translation: "Janela", pronunciation: "WIN-dou", example: "Open the window.", examplePt: "Abra a janela.", icon: "🪟", color: "#0ea5e9" },
      { id: "clock", x: 85, y: 15, label: "Clock", translation: "Relógio", pronunciation: "KLOK", example: "Look at the clock.", examplePt: "Olhe para o relógio.", icon: "🕐", color: "#dc2626" },
    ],
  },
  cinema: {
    dialog: [
      { speaker: "teacher", text: "Welcome to the cinema! What kind of movie do you want to watch tonight?", textPt: "Bem-vindo ao cinema! Que tipo de filme você quer assistir esta noite?" },
      { speaker: "user", text: "I want to watch an action movie on the big screen!", textPt: "Quero assistir um filme de ação na telona!", options: ["I want to watch an action movie on the big screen!", "I don't know what to watch.", "I prefer staying home."], correctIndex: 0 },
      { speaker: "teacher", text: "Great choice! First, you need to buy a ticket at the box office.", textPt: "Ótima escolha! Primeiro, você precisa comprar um ingresso na bilheteria." },
      { speaker: "user", text: "How much is a ticket? And can I buy popcorn?", textPt: "Quanto custa um ingresso? E posso comprar pipoca?", options: ["How much is a ticket? And can I buy popcorn?", "I already have a ticket.", "I don't eat popcorn."], correctIndex: 0 },
      { speaker: "teacher", text: "Tickets are about fifteen dollars. Popcorn is a must at the cinema!", textPt: "Os ingressos custam cerca de quinze dólares. Pipoca é obrigatória no cinema!" },
      { speaker: "user", text: "Perfect! Where is my seat? I need to find seat number G7.", textPt: "Perfeito! Onde fica meu assento? Preciso encontrar o assento G7.", options: ["Perfect! Where is my seat? I need to find seat number G7.", "Any seat is fine.", "I'll stand in the back."], correctIndex: 0 },
      { speaker: "teacher", text: "Check the projector screen for the seat map. Enjoy the movie!", textPt: "Verifique a tela do projetor para o mapa de assentos. Aproveite o filme!" },
    ],
    hotspots: [
      { id: "screen2", x: 50, y: 30, label: "Screen", translation: "Tela", pronunciation: "SKREEN", example: "The screen is huge.", examplePt: "A tela é enorme.", icon: "📽️", color: "#6366f1" },
      { id: "popcorn", x: 25, y: 65, label: "Popcorn", translation: "Pipoca", pronunciation: "POP-korn", example: "I love popcorn!", examplePt: "Adoro pipoca!", icon: "🍿", color: "#f59e0b" },
      { id: "seat", x: 65, y: 70, label: "Seat", translation: "Assento", pronunciation: "SIIT", example: "Find your seat.", examplePt: "Encontre seu assento.", icon: "💺", color: "#dc2626" },
      { id: "ticket", x: 80, y: 45, label: "Ticket", translation: "Ingresso", pronunciation: "TI-ket", example: "Buy a ticket.", examplePt: "Compre um ingresso.", icon: "🎟️", color: "#22c55e" },
      { id: "projector", x: 50, y: 15, label: "Projector", translation: "Projetor", pronunciation: "pro-DJEK-ter", example: "The projector is on.", examplePt: "O projetor está ligado.", icon: "📽️", color: "#8b5cf6" },
      { id: "exit", x: 15, y: 55, label: "Exit", translation: "Saída", pronunciation: "EK-sit", example: "Where is the exit?", examplePt: "Onde fica a saída?", icon: "🚪", color: "#0ea5e9" },
    ],
  },
  desert: {
    dialog: [
      { speaker: "teacher", text: "مرحباً! أنا عمر. أهلاً بك في الصحراء الكبرى!", textPt: "Olá! Sou Omar. Bem-vindo ao Saara!" },
      { speaker: "user", text: "مرحباً يا عمر! الصحراء جميلة جداً!", textPt: "Olá Omar! O deserto é muito bonito!", options: ["مرحباً يا عمر! الصحراء جميلة جداً!", "لا أحب الصحراء.", "أين الفندق؟"], correctIndex: 0 },
      { speaker: "teacher", text: "شكراً! انظر إلى الجمل — هو حيوان الصحراء. كيف تقول 'جمل' بالعربية؟", textPt: "Obrigado! Olhe para o camelo — ele é o animal do deserto. Como se diz 'camelo' em árabe?" },
      { speaker: "user", text: "جمل! وأرى الرمال الذهبية والواحة بعيداً!", textPt: "Jamal! E vejo a areia dourada e o oásis ao longe!", options: ["جمل! وأرى الرمال الذهبية والواحة بعيداً!", "لا أرى شيئاً.", "أين الماء؟"], correctIndex: 0 },
      { speaker: "teacher", text: "ممتاز! الواحة هي مكان الماء في الصحراء. الشمس حارة جداً هنا.", textPt: "Excelente! O oásis é o lugar da água no deserto. O sol está muito quente aqui." },
      { speaker: "user", text: "نعم، الشمس قوية جداً! وأرى الكثبان الرملية الجميلة.", textPt: "Sim, o sol é muito forte! E vejo as belas dunas de areia.", options: ["نعم، الشمس قوية جداً! وأرى الكثبان الرملية الجميلة.", "أريد الذهاب.", "هذا صعب جداً."], correctIndex: 0 },
      { speaker: "teacher", text: "رائع! عربيتك تتحسن كثيراً. استمر في التعلم!", textPt: "Maravilhoso! Seu árabe está melhorando muito. Continue aprendendo!" },
    ],
    hotspots: [
      { id: "sand2", x: 50, y: 75, label: "رمل", translation: "Areia", pronunciation: "raml", example: "الرمل ساخن جداً.", examplePt: "A areia está muito quente.", icon: "🏜️", color: "#f59e0b" },
      { id: "caravan", x: 82, y: 55, label: "قافلة", translation: "Caravana", pronunciation: "qa-fi-la", example: "القافلة تسير في الصحراء.", examplePt: "A caravana caminha no deserto.", icon: "🐪", color: "#a16207" },
      { id: "sun2", x: 70, y: 15, label: "شمس", translation: "Sol", pronunciation: "SHAMS", example: "الشمس حارة جداً.", examplePt: "O sol está muito quente.", icon: "☀️", color: "#eab308" },
      { id: "footprints", x: 55, y: 72, label: "آثار", translation: "Pegadas", pronunciation: "aa-THAAR", example: "الآثار في الرمل.", examplePt: "As pegadas estão na areia.", icon: "👣", color: "#22c55e" },
      { id: "dune", x: 55, y: 45, label: "كثيب", translation: "Duna", pronunciation: "ka-THIIB", example: "الكثيب رملي.", examplePt: "A duna é de areia.", icon: "🏔️", color: "#d97706" },
    ],
  },
  farm: {
    dialog: [
      { speaker: "teacher", text: "Dzień dobry! Jestem Maja. Witaj na naszej farmie!", textPt: "Bom dia! Sou Maja. Bem-vindo à nossa fazenda!" },
      { speaker: "user", text: "Dzień dobry, Maja! Jaka piękna farma! Widzę krowy i kury!", textPt: "Bom dia, Maja! Que fazenda bonita! Vejo vacas e galinhas!", options: ["Dzień dobry, Maja! Jaka piękna farma! Widzę krowy i kury!", "Nie lubię farm.", "Gdzie jest miasto?"], correctIndex: 0 },
      { speaker: "teacher", text: "Tak! Krowa daje nam mleko, a kura znosi jajka. Czy wiesz jak powiedzieć 'traktor'?", textPt: "Sim! A vaca nos dá leite e a galinha bota ovos. Você sabe como dizer 'trator'?" },
      { speaker: "user", text: "Traktor! I widzę wielką stodołę pełną pszenicy!", textPt: "Traktor! E vejo um grande celeiro cheio de trigo!", options: ["Traktor! I widzę wielką stodołę pełną pszenicy!", "Nie rozumiem.", "To za trudne."], correctIndex: 0 },
      { speaker: "teacher", text: "Doskonale! Pszenica jest złota i piękna. Niebo jest dziś błękitne.", textPt: "Excelente! O trigo é dourado e bonito. O céu está azul hoje." },
      { speaker: "user", text: "Tak, niebo jest cudowne! Chciałbym tu mieszkać!", textPt: "Sim, o céu é maravilhoso! Gostaria de morar aqui!", options: ["Tak, niebo jest cudowne! Chciałbym tu mieszkać!", "Wolę miasto.", "Jest za cicho."], correctIndex: 0 },
      { speaker: "teacher", text: "Wspaniale! Twój polski jest coraz lepszy. Brawo!", textPt: "Maravilhoso! Seu polonês está cada vez melhor. Parabéns!" },
    ],
    hotspots: [
      { id: "krowa", x: 35, y: 55, label: "Krowa", translation: "Vaca", pronunciation: "KRO-va", example: "Krowa daje mleko.", examplePt: "A vaca dá leite.", icon: "🐄", color: "#f59e0b" },
      { id: "stodola", x: 65, y: 40, label: "Stodoła", translation: "Celeiro", pronunciation: "sto-DO-wa", example: "Stodoła jest duża.", examplePt: "O celeiro é grande.", icon: "🏚️", color: "#a16207" },
      { id: "pszenica", x: 50, y: 72, label: "Pszenica", translation: "Trigo", pronunciation: "PSHE-ni-tsa", example: "Pszenica jest złota.", examplePt: "O trigo é dourado.", icon: "🌾", color: "#eab308" },
      { id: "traktor", x: 20, y: 65, label: "Traktor", translation: "Trator", pronunciation: "TRAK-tor", example: "Traktor jest czerwony.", examplePt: "O trator é vermelho.", icon: "🚜", color: "#dc2626" },
      { id: "kura", x: 80, y: 60, label: "Kura", translation: "Galinha", pronunciation: "KU-ra", example: "Kura znosi jajka.", examplePt: "A galinha bota ovos.", icon: "🐔", color: "#f97316" },
      { id: "niebo", x: 55, y: 15, label: "Niebo", translation: "Céu", pronunciation: "NIE-bo", example: "Niebo jest błękitne.", examplePt: "O céu é azul.", icon: "🌤️", color: "#3b82f6" },
    ],
  },
  tokyo: {
    dialog: [
      { speaker: "teacher", text: "こんにちは！私はゆきです。東京へようこそ！", textPt: "Olá! Sou Yuki. Bem-vindo a Tóquio!" },
      { speaker: "user", text: "こんにちは、ゆきさん！東京はすごいですね！", textPt: "Olá, Yuki! Tóquio é incrível!", options: ["こんにちは、ゆきさん！東京はすごいですね！", "わかりません。", "さようなら。"], correctIndex: 0 },
      { speaker: "teacher", text: "ありがとう！あの神社を見てください。日本語で「神社」と言います。", textPt: "Obrigada! Veja aquele santuário. Em japonês dizemos 'jinja'." },
      { speaker: "user", text: "神社！とても美しいです。桜の花も見えます！", textPt: "Jinja! É muito bonito. Também vejo flores de cerejeira!", options: ["神社！とても美しいです。桜の花も見えます！", "難しいです。", "もう一度言ってください。"], correctIndex: 0 },
      { speaker: "teacher", text: "そうです！桜は日本の象徴です。春に咲きます。", textPt: "Exato! A cerejeira é o símbolo do Japão. Floresce na primavera." },
      { speaker: "user", text: "日本語は難しいですが、とても面白いです！", textPt: "O japonês é difícil, mas muito interessante!", options: ["日本語は難しいですが、とても面白いです！", "日本語は嫌いです。", "もう帰ります。"], correctIndex: 0 },
      { speaker: "teacher", text: "素晴らしい！毎日練習してください！", textPt: "Maravilhoso! Pratique todos os dias!" },
    ],
    hotspots: [
      { id: "fuji", x: 47, y: 18, label: "富士山", translation: "Monte Fuji", pronunciation: "fu-dji-san", example: "富士山は高いです。", examplePt: "O Monte Fuji é alto.", icon: "🗻", color: "#64748b" },
      { id: "street", x: 54, y: 72, label: "通り", translation: "Rua", pronunciation: "to-ori", example: "通りは賑やかです。", examplePt: "A rua é movimentada.", icon: "🛣️", color: "#7c3aed" },
      { id: "billboard", x: 22, y: 37, label: "広告", translation: "Publicidade", pronunciation: "ko-ku", example: "広告が見えます。", examplePt: "Vejo uma publicidade.", icon: "📋", color: "#0891b2" },
      { id: "screen", x: 70, y: 40, label: "画面", translation: "Tela", pronunciation: "ga-men", example: "画面が明るいです。", examplePt: "A tela está iluminada.", icon: "📺", color: "#2563eb" },
      { id: "building", x: 84, y: 48, label: "建物", translation: "Prédio", pronunciation: "ta-te-mo-no", example: "建物が高いです。", examplePt: "O prédio é alto.", icon: "🏢", color: "#6366f1" },
      { id: "sign", x: 74, y: 56, label: "看板", translation: "Placa", pronunciation: "can-ban", example: "看板が見えます。", examplePt: "Vejo a placa.", icon: "📋", color: "#14b8a6" },
    ],
  },
  spa: {
    dialog: [
      { speaker: "teacher", text: "Welcome to the spa! I'm Priya. How do you feel today?", textPt: "Bem-vindo ao spa! Sou Priya. Como você se sente hoje?" },
      { speaker: "user", text: "I feel a bit stressed. I need to relax!", textPt: "Me sinto um pouco estressado. Preciso relaxar!", options: ["I feel a bit stressed. I need to relax!", "I feel great already.", "I don't know."], correctIndex: 0 },
      { speaker: "teacher", text: "Perfect place to be! The warm pool will help you relax completely.", textPt: "Lugar perfeito para estar! A piscina quente vai te ajudar a relaxar completamente." },
      { speaker: "user", text: "The pool looks amazing! And I can smell the candles — they smell wonderful.", textPt: "A piscina parece incrível! E consigo sentir o cheiro das velas — cheiram maravilhosamente.", options: ["The pool looks amazing! And I can smell the candles — they smell wonderful.", "I don't like pools.", "The smell is too strong."], correctIndex: 0 },
      { speaker: "teacher", text: "Those are aromatherapy candles. After the pool, you can have a massage.", textPt: "Essas são velas de aromaterapia. Depois da piscina, você pode fazer uma massagem." },
      { speaker: "user", text: "A massage sounds perfect! And the calm music makes everything better.", textPt: "Uma massagem parece perfeito! E a música calma torna tudo melhor.", options: ["A massage sounds perfect! And the calm music makes everything better.", "I don't like massages.", "Can I take the towel home?"], correctIndex: 0 },
      { speaker: "teacher", text: "Wonderful! Use the fresh towel after your swim. Enjoy your wellness day!", textPt: "Maravilhoso! Use a toalha fresca depois do banho. Aproveite seu dia de bem-estar!" },
    ],
    hotspots: [
      { id: "pool", x: 50, y: 55, label: "Pool", translation: "Piscina", pronunciation: "PUUL", example: "The pool is warm.", examplePt: "A piscina está quente.", icon: "🏊", color: "#0ea5e9" },
      { id: "towel", x: 25, y: 65, label: "Towel", translation: "Toalha", pronunciation: "TAU-el", example: "Use a clean towel.", examplePt: "Use uma toalha limpa.", icon: "🏖️", color: "#e2e8f0" },
      { id: "candle", x: 70, y: 40, label: "Candle", translation: "Vela", pronunciation: "KÆN-del", example: "The candle smells nice.", examplePt: "A vela cheira bem.", icon: "🕯️", color: "#f59e0b" },
      { id: "flower3", x: 80, y: 60, label: "Flower", translation: "Flor", pronunciation: "FLAU-er", example: "The flower is beautiful.", examplePt: "A flor é bonita.", icon: "🌺", color: "#ec4899" },
      { id: "massage", x: 35, y: 45, label: "Massage", translation: "Massagem", pronunciation: "ma-SAAJ", example: "A massage is relaxing.", examplePt: "Uma massagem é relaxante.", icon: "💆", color: "#8b5cf6" },
      { id: "music", x: 60, y: 25, label: "Music", translation: "Música", pronunciation: "MIUU-zik", example: "The music is calm.", examplePt: "A música é calma.", icon: "🎵", color: "#22c55e" },
    ],
  },
  medieval: {
    dialog: [
      { speaker: "teacher", text: "Willkommen auf dem mittelalterlichen Markt! Ich bin Hans. Was möchten Sie kaufen?", textPt: "Bem-vindo ao mercado medieval! Sou Hans. O que você gostaria de comprar?" },
      { speaker: "user", text: "Guten Tag! Wie viel kostet dieser Apfel?", textPt: "Bom dia! Quanto custa esta maçã?", options: ["Guten Tag! Wie viel kostet dieser Apfel?", "Ich weiß nicht was ich will.", "Das ist zu teuer."], correctIndex: 0 },
      { speaker: "teacher", text: "Nur einen Pfennig! Und schau — die alte Burg dort ist aus dem 12. Jahrhundert.", textPt: "Apenas um centavo! E olhe — aquele castelo antigo é do século XII." },
      { speaker: "user", text: "Die Burg ist beeindruckend! Und der Ritter mit dem Schwert — ist er echt?", textPt: "O castelo é impressionante! E o cavaleiro com a espada — é real?", options: ["Die Burg ist beeindruckend! Und der Ritter mit dem Schwert — ist er echt?", "Ich habe Angst.", "Wo ist der Ausgang?"], correctIndex: 0 },
      { speaker: "teacher", text: "Ja, er ist ein Schauspieler! Die Fahne weht im Wind — das ist die Flagge des Königs.", textPt: "Sim, ele é um ator! A bandeira tremula no vento — é a bandeira do rei." },
      { speaker: "user", text: "Fantastisch! Und die Kerzen am Brunnen leuchten sehr schön.", textPt: "Fantástico! E as velas na fonte brilham muito bonito.", options: ["Fantastisch! Und die Kerzen am Brunnen leuchten sehr schön.", "Es ist zu dunkel.", "Ich will nach Hause."], correctIndex: 0 },
      { speaker: "teacher", text: "Wunderbar! Dein Deutsch ist ausgezeichnet. Weiter so!", textPt: "Maravilhoso! Seu alemão está excelente. Continue assim!" },
    ],
    hotspots: [
      { id: "burg", x: 70, y: 20, label: "Burg", translation: "Castelo", pronunciation: "BURK", example: "Die Burg ist alt.", examplePt: "O castelo é antigo.", icon: "🏰", color: "#64748b" },
      { id: "markt", x: 40, y: 60, label: "Markt", translation: "Mercado", pronunciation: "MARKT", example: "Der Markt ist voll.", examplePt: "O mercado está cheio.", icon: "🏪", color: "#f59e0b" },
      { id: "ritter", x: 25, y: 40, label: "Ritter", translation: "Cavaleiro", pronunciation: "RIT-ter", example: "Der Ritter ist tapfer.", examplePt: "O cavaleiro é corajoso.", icon: "⚔️", color: "#94a3b8" },
      { id: "fahne", x: 80, y: 30, label: "Fahne", translation: "Bandeira", pronunciation: "FA-ne", example: "Die Fahne weht.", examplePt: "A bandeira está tremulando.", icon: "🚩", color: "#dc2626" },
      { id: "brunnen", x: 55, y: 65, label: "Brunnen", translation: "Poço", pronunciation: "BRUN-nen", example: "Der Brunnen ist tief.", examplePt: "O poço é fundo.", icon: "⛲", color: "#0ea5e9" },
      { id: "kerze", x: 20, y: 55, label: "Kerze", translation: "Vela", pronunciation: "KER-tse", example: "Die Kerze brennt.", examplePt: "A vela está acesa.", icon: "🕯️", color: "#eab308" },
    ],
  },
  port: {
    dialog: [
      { speaker: "teacher", text: "Benvenuto al porto! Sono Giulia. Che bel porto mediterraneo, vero?", textPt: "Bem-vindo ao porto! Sou Giulia. Que porto mediterrâneo bonito, não é?" },
      { speaker: "user", text: "Sì, è bellissimo! Vuoi fare una gita in barca con me?", textPt: "Sim, é lindo! Quer fazer um passeio de barco comigo?", options: ["Sì, è bellissimo! Vuoi fare una gita in barca con me?", "No, ho paura del mare.", "Forse domani."], correctIndex: 0 },
      { speaker: "teacher", text: "Certo! Il mare è azzurro oggi. Vedi il faro in lontananza?", textPt: "Claro! O mar está azul hoje. Você vê o farol ao longe?" },
      { speaker: "user", text: "Sì! E vedo anche i gabbiani che volano sopra la rete del pescatore.", textPt: "Sim! E também vejo as gaivotas voando sobre a rede do pescador.", options: ["Sì! E vedo anche i gabbiani che volano sopra la rete del pescatore.", "Non vedo niente.", "Ho paura dei gabbiani."], correctIndex: 0 },
      { speaker: "teacher", text: "Bravissima! L'ancora è pesante — tiene la barca ferma nel porto.", textPt: "Muito bem! A âncora é pesada — mantém o barco fixo no porto." },
      { speaker: "user", text: "Capisco! Il porto è pieno di vita. Mi piace molto l'italiano!", textPt: "Entendo! O porto está cheio de vida. Gosto muito do italiano!", options: ["Capisco! Il porto è pieno di vita. Mi piace molto l'italiano!", "È troppo difficile.", "Voglio tornare a casa."], correctIndex: 0 },
      { speaker: "teacher", text: "Meraviglioso! Il tuo italiano migliora ogni giorno. Continua!", textPt: "Maravilhoso! Seu italiano melhora a cada dia. Continue!" },
    ],
    hotspots: [
      { id: "barca", x: 40, y: 55, label: "Barca", translation: "Barco", pronunciation: "BAR-ka", example: "La barca è nel porto.", examplePt: "O barco está no porto.", icon: "⛵", color: "#0ea5e9" },
      { id: "mare", x: 65, y: 40, label: "Mare", translation: "Mar", pronunciation: "MA-re", example: "Il mare è azzurro.", examplePt: "O mar é azul.", icon: "🌊", color: "#3b82f6" },
      { id: "faro", x: 80, y: 25, label: "Faro", translation: "Farol", pronunciation: "FA-ro", example: "Il faro guida le navi.", examplePt: "O farol guia os navios.", icon: "🗼", color: "#f59e0b" },
      { id: "gabbiano", x: 25, y: 30, label: "Gabbiano", translation: "Gaivota", pronunciation: "gab-BIA-no", example: "Il gabbiano vola.", examplePt: "A gaivota voa.", icon: "🕊️", color: "#94a3b8" },
      { id: "rete", x: 20, y: 65, label: "Rete", translation: "Rede", pronunciation: "RE-te", example: "La rete è piena di pesci.", examplePt: "A rede está cheia de peixes.", icon: "🎣", color: "#16a34a" },
      { id: "ancora", x: 55, y: 75, label: "Ancora", translation: "Âncora", pronunciation: "AN-ko-ra", example: "L'ancora è pesante.", examplePt: "A âncora é pesada.", icon: "⚓", color: "#dc2626" },
    ],
  },
  museum: {
    dialog: [
      { speaker: "teacher", text: "Benvenuto al museo! Sono Giulia. Che quadro bellissimo, vero?", textPt: "Bem-vindo ao museu! Sou Giulia. Que quadro lindo, não é?" },
      { speaker: "user", text: "Sì, è un vero capolavoro! Chi è l'artista?", textPt: "Sim, é uma verdadeira obra-prima! Quem é o artista?", options: ["Sì, è un vero capolavoro! Chi è l'artista?", "Non mi piace l'arte.", "Voglio andare via."], correctIndex: 0 },
      { speaker: "teacher", text: "È un pittore del Rinascimento. La cornice dorata è bellissima, no?", textPt: "É um pintor do Renascimento. A moldura dourada é linda, não é?" },
      { speaker: "user", text: "Sì! E quella scultura in marmo è incredibile!", textPt: "Sim! E aquela escultura de mármore é incrível!", options: ["Sì! E quella scultura in marmo è incredibile!", "Non vedo la scultura.", "Preferisco la fotografia."], correctIndex: 0 },
      { speaker: "teacher", text: "Esatto! La galleria ha molte opere d'arte. I visitatori vengono da tutto il mondo.", textPt: "Exato! A galeria tem muitas obras de arte. Os visitantes vêm do mundo todo." },
      { speaker: "user", text: "Che luce meravigliosa in questa galleria! Illumina i quadri perfettamente.", textPt: "Que luz maravilhosa nesta galeria! Ilumina os quadros perfeitamente.", options: ["Che luce meravigliosa in questa galleria! Illumina i quadri perfettamente.", "È troppo luminoso.", "Voglio vedere altro."], correctIndex: 0 },
      { speaker: "teacher", text: "Bravissima! Il tuo italiano è eccellente. Continua così!", textPt: "Muito bem! Seu italiano está excelente. Continue assim!" },
    ],
    hotspots: [
      { id: "quadro", x: 40, y: 35, label: "Quadro", translation: "Quadro", pronunciation: "KWA-dro", example: "Il quadro è antico.", examplePt: "O quadro é antigo.", icon: "🖼️", color: "#a16207" },
      { id: "scultura", x: 65, y: 50, label: "Scultura", translation: "Escultura", pronunciation: "skul-TU-ra", example: "La scultura è in marmo.", examplePt: "A escultura é de mármore.", icon: "🗿", color: "#64748b" },
      { id: "cornice", x: 20, y: 40, label: "Cornice", translation: "Moldura", pronunciation: "KOR-ni-tche", example: "La cornice è dorata.", examplePt: "A moldura é dourada.", icon: "🖼️", color: "#eab308" },
      { id: "visitatore", x: 80, y: 60, label: "Visitatore", translation: "Visitante", pronunciation: "vi-zi-TA-to-re", example: "Il visitatore guarda.", examplePt: "O visitante olha.", icon: "👤", color: "#6366f1" },
      { id: "galleria", x: 50, y: 20, label: "Galleria", translation: "Galeria", pronunciation: "gal-LE-ria", example: "La galleria è grande.", examplePt: "A galeria é grande.", icon: "🏛️", color: "#8b5cf6" },
      { id: "luce", x: 75, y: 25, label: "Luce", translation: "Luz", pronunciation: "LU-tche", example: "La luce illumina il quadro.", examplePt: "A luz ilumina o quadro.", icon: "💡", color: "#fbbf24" },
    ],
  },
  hospital: {
    dialog: [
      { speaker: "teacher", text: "Good morning! I'm Dr. Priya. How are you feeling today?", textPt: "Bom dia! Sou a Dra. Priya. Como você está se sentindo hoje?" },
      { speaker: "user", text: "I have a headache and I feel very tired.", textPt: "Estou com dor de cabeça e me sinto muito cansado.", options: ["I have a headache and I feel very tired.", "I'm perfectly fine.", "I don't know what's wrong."], correctIndex: 0 },
      { speaker: "teacher", text: "I see. How long have you had this headache? Since this morning?", textPt: "Entendo. Há quanto tempo você tem essa dor de cabeça? Desde esta manhã?" },
      { speaker: "user", text: "Yes, since this morning. I also have a fever.", textPt: "Sim, desde esta manhã. Também estou com febre.", options: ["Yes, since this morning. I also have a fever.", "No, it started yesterday.", "I'm not sure."], correctIndex: 0 },
      { speaker: "teacher", text: "Let me check. The nurse will take your temperature. We may need an X-ray.", textPt: "Deixe-me verificar. A enfermeira vai medir sua temperatura. Podemos precisar de um raio-X." },
      { speaker: "user", text: "Should I take medicine now? I have some in my bag.", textPt: "Devo tomar remédio agora? Tenho alguns na minha bolsa.", options: ["Should I take medicine now? I have some in my bag.", "I don't want any medicine.", "Can I go home?"], correctIndex: 0 },
      { speaker: "teacher", text: "Wait for the diagnosis first. Rest in the hospital bed for now.", textPt: "Aguarde o diagnóstico primeiro. Descanse na cama hospitalar por enquanto." },
    ],
    hotspots: [
      { id: "doctor", x: 30, y: 35, label: "Doctor", translation: "Médico", pronunciation: "DOK-ter", example: "The doctor is kind.", examplePt: "O médico é gentil.", icon: "👨‍⚕️", color: "#0ea5e9" },
      { id: "medicine", x: 60, y: 55, label: "Medicine", translation: "Remédio", pronunciation: "MED-i-sin", example: "Take your medicine.", examplePt: "Tome seu remédio.", icon: "💊", color: "#dc2626" },
      { id: "bed", x: 75, y: 65, label: "Hospital Bed", translation: "Cama hospitalar", pronunciation: "HOS-pi-tal BED", example: "Rest in the bed.", examplePt: "Descanse na cama.", icon: "🛏️", color: "#8b5cf6" },
      { id: "xray", x: 20, y: 50, label: "X-Ray", translation: "Raio-X", pronunciation: "EKS-rey", example: "Take an X-ray.", examplePt: "Faça um raio-X.", icon: "🩻", color: "#64748b" },
      { id: "nurse", x: 50, y: 30, label: "Nurse", translation: "Enfermeira", pronunciation: "NÖRS", example: "The nurse helps.", examplePt: "A enfermeira ajuda.", icon: "👩‍⚕️", color: "#ec4899" },
      { id: "ambulance", x: 85, y: 75, label: "Ambulance", translation: "Ambulância", pronunciation: "AM-biu-lens", example: "Call an ambulance!", examplePt: "Chame uma ambulância!", icon: "🚑", color: "#f97316" },
    ],
  },
  park: {
    dialog: [
      { speaker: "teacher", text: "Bonjour! Je m'appelle Sophie. Quel beau parc, n'est-ce pas?", textPt: "Bom dia! Meu nome é Sophie. Que parque bonito, não é?" },
      { speaker: "user", text: "Oui, c'est magnifique! J'adore la nature et les arbres.", textPt: "Sim, é magnífico! Adoro a natureza e as árvores.", options: ["Oui, c'est magnifique! J'adore la nature et les arbres.", "Non, je préfère la ville.", "Je ne sais pas."], correctIndex: 0 },
      { speaker: "teacher", text: "Très bien! Regardez cette fontaine — en français on dit 'fontaine'. C'est beau, non?", textPt: "Muito bem! Olhe esta fonte — em francês dizemos 'fontaine'. É bonito, não é?" },
      { speaker: "user", text: "La fontaine est très belle! Et j'entends un oiseau chanter!", textPt: "A fonte é muito bonita! E ouço um pássaro cantando!", options: ["La fontaine est très belle! Et j'entends un oiseau chanter!", "Je n'aime pas les fontaines.", "Où est le café?"], correctIndex: 0 },
      { speaker: "teacher", text: "Oui! L'oiseau chante sur le banc. Asseyons-nous et écoutons.", textPt: "Sim! O pássaro canta no banco. Vamos sentar e ouvir." },
      { speaker: "user", text: "Avec plaisir! Le chemin dans le parc est très agréable aussi.", textPt: "Com prazer! O caminho no parque também é muito agradável.", options: ["Avec plaisir! Le chemin dans le parc est très agréable aussi.", "Je suis fatigué.", "Je veux rentrer."], correctIndex: 0 },
      { speaker: "teacher", text: "Parfait! Votre français progresse très bien. Continuez!", textPt: "Perfeito! Seu francês está progredindo muito bem. Continue!" },
    ],
    hotspots: [
      { id: "arbre", x: 25, y: 25, label: "Arbre", translation: "Árvore", pronunciation: "AR-bre", example: "L'arbre est grand.", examplePt: "A árvore é grande.", icon: "🌳", color: "#16a34a" },
      { id: "jeux", x: 10, y: 62, label: "Jeux", translation: "Brinquedos", pronunciation: "JÖ", example: "Les jeux sont dans le parc.", examplePt: "Os brinquedos estão no parque.", icon: "🎠", color: "#a16207" },
      { id: "fontaine", x: 70, y: 45, label: "Fontaine", translation: "Fonte", pronunciation: "fon-TEN", example: "La fontaine est belle.", examplePt: "A fonte é bonita.", icon: "⛲", color: "#0ea5e9" },
      { id: "personnes", x: 50, y: 62, label: "Personnes", translation: "Pessoas", pronunciation: "per-SON", example: "Les personnes marchent dans le parc.", examplePt: "As pessoas caminham no parque.", icon: "👥", color: "#dc2626" },
      { id: "chien", x: 60, y: 68, label: "Chien", translation: "Cachorro", pronunciation: "SHIEN", example: "Le chien est dans le parc.", examplePt: "O cachorro está no parque.", icon: "🐕", color: "#f59e0b" },
      { id: "herbe", x: 45, y: 80, label: "Herbe", translation: "Grama", pronunciation: "ERB", example: "L'herbe est verte.", examplePt: "A grama é verde.", icon: "🌿", color: "#2563eb" },
    ],
  },
  mountain: {
    dialog: [
      { speaker: "teacher", text: "Willkommen auf dem Berg! Ich bin Hans. Wie gefällt Ihnen die Aussicht?", textPt: "Bem-vindo à montanha! Sou Hans. Como você está gostando da vista?" },
      { speaker: "user", text: "Die Aussicht ist fantastisch! Der Gipfel ist mit Schnee bedeckt!", textPt: "A vista é fantástica! O cume está coberto de neve!", options: ["Die Aussicht ist fantastisch! Der Gipfel ist mit Schnee bedeckt!", "Ich bin müde.", "Wo ist das Hotel?"], correctIndex: 0 },
      { speaker: "teacher", text: "Ja! Der Schnee macht den Berg sehr schön. Wie hoch ist dieser Berg?", textPt: "Sim! A neve deixa a montanha muito bonita. Qual é a altura desta montanha?" },
      { speaker: "user", text: "Der Berg ist über dreitausend Meter hoch!", textPt: "A montanha tem mais de três mil metros de altura!", options: ["Der Berg ist über dreitausend Meter hoch!", "Ich weiß es nicht.", "Das ist zu hoch!"], correctIndex: 0 },
      { speaker: "teacher", text: "Richtig! Und schau — ein Adler fliegt über den Felsen. Das ist wunderbar!", textPt: "Correto! E olhe — uma águia voa sobre as rochas. Isso é maravilhoso!" },
      { speaker: "user", text: "Ich sehe den Adler! Er fliegt sehr hoch über den Wolken.", textPt: "Vejo a águia! Ela voa muito alto sobre as nuvens.", options: ["Ich sehe den Adler! Er fliegt sehr hoch über den Wolken.", "Ich sehe nichts.", "Ich habe Angst vor Adlern."], correctIndex: 0 },
      { speaker: "teacher", text: "Ausgezeichnet! Dein Deutsch ist wirklich gut. Weiter so!", textPt: "Excelente! Seu alemão está realmente bom. Continue assim!" },
    ],
    hotspots: [
      { id: "gipfel", x: 50, y: 28, label: "Gipfel", translation: "Cume", pronunciation: "GIP-fel", example: "Der Gipfel ist schneebedeckt.", examplePt: "O cume está coberto de neve.", icon: "🏔️", color: "#94a3b8" },
      { id: "schnee", x: 35, y: 35, label: "Schnee", translation: "Neve", pronunciation: "SHNEY", example: "Der Schnee ist weiß.", examplePt: "A neve é branca.", icon: "❄️", color: "#e2e8f0" },
      { id: "wald2", x: 20, y: 55, label: "Wald", translation: "Floresta", pronunciation: "VALT", example: "Der Wald ist dunkel.", examplePt: "A floresta é escura.", icon: "🌲", color: "#16a34a" },
      { id: "fels", x: 70, y: 45, label: "Fels", translation: "Rocha", pronunciation: "FELS", example: "Der Fels ist hart.", examplePt: "A rocha é dura.", icon: "🪨", color: "#78716c" },
      { id: "wolke", x: 75, y: 18, label: "Wolke", translation: "Nuvem", pronunciation: "VOL-ke", example: "Die Wolke ist weiß.", examplePt: "A nuvem é branca.", icon: "☁️", color: "#94a3b8" },
      { id: "see", x: 50, y: 65, label: "See", translation: "Lago", pronunciation: "ZE", example: "Der See ist klar.", examplePt: "O lago é claro.", icon: "🌊", color: "#a16207" },
    ],
  },
  forest: {
    dialog: [
      { speaker: "teacher", text: "Hello! I'm James. Welcome to this magical enchanted forest!", textPt: "Olá! Sou James. Bem-vindo a esta mágica floresta encantada!" },
      { speaker: "user", text: "Hello James! The forest is so beautiful!", textPt: "Olá James! A floresta é tão bonita!", options: ["Hello James! The forest is so beautiful!", "I don't like forests.", "Where is the hotel?"], correctIndex: 0 },
      { speaker: "teacher", text: "Look at that tree! In English we say 'tree'. It's very tall and old.", textPt: "Olhe para aquela árvore! Em inglês dizemos 'tree'. É muito alta e velha." },
      { speaker: "user", text: "Tree! And what about that red mushroom over there?", textPt: "Tree! E aquele cogumelo vermelho ali?", options: ["Tree! And what about that red mushroom over there?", "I don't see it.", "Is it dangerous?"], correctIndex: 0 },
      { speaker: "teacher", text: "That's a mushroom! And the bird singing in the tree — we call it a 'bird'. Can you repeat?", textPt: "Isso é um cogumelo! E o pássaro cantando na árvore — chamamos de 'bird'. Você consegue repetir?" },
      { speaker: "user", text: "Mushroom and bird! I love learning English in the forest!", textPt: "Mushroom e bird! Adoro aprender inglês na floresta!", options: ["Mushroom and bird! I love learning English in the forest!", "This is too hard.", "I give up."], correctIndex: 0 },
      { speaker: "teacher", text: "Excellent! Your English is improving every day! Keep it up!", textPt: "Excelente! Seu inglês está melhorando a cada dia! Continue assim!" },
    ],
    hotspots: [
      { id: "tree", x: 25, y: 22, label: "Tree", translation: "Árvore", pronunciation: "TREE", example: "The tree is very tall.", examplePt: "A árvore é muito alta.", icon: "🌲", color: "#16a34a" },
      { id: "mushroom", x: 60, y: 72, label: "Mushroom", translation: "Cogumelo", pronunciation: "MUSH-rum", example: "The mushroom is red.", examplePt: "O cogumelo é vermelho.", icon: "🍄", color: "#dc2626" },
      { id: "bird", x: 75, y: 28, label: "Bird", translation: "Pássaro", pronunciation: "BERD", example: "The bird is singing.", examplePt: "O pássaro está cantando.", icon: "🐦", color: "#2563eb" },
      { id: "flower", x: 40, y: 68, label: "Flower", translation: "Flor", pronunciation: "FLAU-er", example: "The flower is beautiful.", examplePt: "A flor é bonita.", icon: "🌺", color: "#db2777" },
      { id: "river", x: 50, y: 82, label: "River", translation: "Rio", pronunciation: "RIV-er", example: "The river is cold.", examplePt: "O rio é frio.", icon: "💧", color: "#0891b2" },
      { id: "sun", x: 55, y: 15, label: "Sun", translation: "Sol", pronunciation: "SÂN", example: "The sun shines through the trees.", examplePt: "O sol brilha entre as árvores.", icon: "☀️", color: "#ca8a04" },
    ],
  },
  gym: {
    dialog: [
      { speaker: "teacher", text: "Merhaba! Ben Emre. Spor salonuna hoş geldiniz! Bugün antrenman yapıyor musunuz?", textPt: "Olá! Sou Emre. Bem-vindo à academia! Você vai treinar hoje?" },
      { speaker: "user", text: "Evet, her gün antrenman yapıyorum! Bugün kol egzersizi yapacağım.", textPt: "Sim, treino todos os dias! Hoje vou fazer exercícios de braço.", options: ["Evet, her gün antrenman yapıyorum! Bugün kol egzersizi yapacağım.", "Hayır, çok yorgunum.", "Bilmiyorum ne yapacağımı."], correctIndex: 0 },
      { speaker: "teacher", text: "Harika! Halterle başlayabilirsiniz. Koç size yardım edecek.", textPt: "Ótimo! Você pode começar com os halteres. O treinador vai te ajudar." },
      { speaker: "user", text: "Tamam! Koşu bandında da koşmak istiyorum.", textPt: "Tudo bem! Também quero correr na esteira.", options: ["Tamam! Koşu bandında da koşmak istiyorum.", "Sadece halter kullanacağım.", "Yoruldum, gidiyorum."], correctIndex: 0 },
      { speaker: "teacher", text: "Mükemmel plan! Egzersizden önce minderde ısınmayı unutmayın.", textPt: "Plano excelente! Não esqueça de se aquecer no tapete antes do exercício." },
      { speaker: "user", text: "Anladım! Ve egzersiz sırasında su içmem gerekiyor, değil mi?", textPt: "Entendi! E preciso beber água durante o exercício, certo?", options: ["Anladım! Ve egzersiz sırasında su içmem gerekiyor, değil mi?", "Su içmem gerekmez.", "Sadece kahve içerim."], correctIndex: 0 },
      { speaker: "teacher", text: "Kesinlikle! Aynaya bakarak formunuzu kontrol edin. Başarılar!", textPt: "Com certeza! Verifique sua postura no espelho. Boa sorte!" },
    ],
    hotspots: [
      { id: "dumbbell", x: 30, y: 60, label: "Dumbbell", translation: "Haltere", pronunciation: "DÂM-bel", example: "Lift the dumbbell.", examplePt: "Levante o haltere.", icon: "🏋️", color: "#dc2626" },
      { id: "treadmill", x: 65, y: 45, label: "Treadmill", translation: "Esteira", pronunciation: "TRED-mil", example: "Run on the treadmill.", examplePt: "Corra na esteira.", icon: "🏃", color: "#22c55e" },
      { id: "mirror", x: 80, y: 30, label: "Mirror", translation: "Espelho", pronunciation: "MI-rer", example: "Look in the mirror.", examplePt: "Olhe no espelho.", icon: "🪞", color: "#0ea5e9" },
      { id: "water", x: 20, y: 50, label: "Water Bottle", translation: "Garrafa d'água", pronunciation: "WO-ter BO-tel", example: "Drink water.", examplePt: "Beba água.", icon: "💧", color: "#3b82f6" },
      { id: "mat", x: 50, y: 78, label: "Mat", translation: "Tapete", pronunciation: "MÆT", example: "Stretch on the mat.", examplePt: "Alongue-se no tapete.", icon: "🧘", color: "#8b5cf6" },
      { id: "coach", x: 45, y: 35, label: "Coach", translation: "Treinador", pronunciation: "KOUTCH", example: "The coach is strong.", examplePt: "O treinador é forte.", icon: "👨‍🏫", color: "#f59e0b" },
    ],
  },
  library: {
    dialog: [
      { speaker: "teacher", text: "Witaj w bibliotece! Jestem Maja. Jaką książkę chcesz przeczytać?", textPt: "Bem-vindo à biblioteca! Sou Maja. Qual livro você quer ler?" },
      { speaker: "user", text: "Chcę przeczytać powieść przygodową. Gdzie jest dział literatury?", textPt: "Quero ler um romance de aventura. Onde fica a seção de literatura?", options: ["Chcę przeczytać powieść przygodową. Gdzie jest dział literatury?", "Nie wiem co czytać.", "Nie lubię czytać."], correctIndex: 0 },
      { speaker: "teacher", text: "Dział literatury jest na drugiej półce po lewej. Pamiętaj — w bibliotece jest cisza!", textPt: "A seção de literatura fica na segunda prateleira à esquerda. Lembre-se — na biblioteca há silêncio!" },
      { speaker: "user", text: "Oczywiście! Mogę usiąść przy stoliku przy lampie?", textPt: "Claro! Posso sentar na mesa perto da lâmpada?", options: ["Oczywiście! Mogę usiąść przy stoliku przy lampie?", "Wolę stać.", "Czy mogę jeść tutaj?"], correctIndex: 0 },
      { speaker: "teacher", text: "Tak, stolik jest wolny. Możesz też skorzystać z katalogu, żeby znaleźć książki.", textPt: "Sim, a mesa está livre. Você também pode usar o catálogo para encontrar livros." },
      { speaker: "user", text: "Dziękuję! Jak długo mogę wypożyczyć książkę?", textPt: "Obrigado! Por quanto tempo posso emprestar um livro?", options: ["Dziękuję! Jak długo mogę wypożyczyć książkę?", "Nie chcę wypożyczać.", "Mogę zabrać bez pytania?"], correctIndex: 0 },
      { speaker: "teacher", text: "Dwa tygodnie. Twój polski jest naprawdę dobry! Brawo!", textPt: "Duas semanas. Seu polonês está realmente bom! Parabéns!" },
    ],
    hotspots: [
      { id: "ksiazka", x: 40, y: 45, label: "Książka", translation: "Livro", pronunciation: "KSHON-shka", example: "Książka jest ciekawa.", examplePt: "O livro é interessante.", icon: "📖", color: "#6366f1" },
      { id: "polka", x: 70, y: 35, label: "Półka", translation: "Prateleira", pronunciation: "PUW-ka", example: "Półka jest pełna.", examplePt: "A prateleira está cheia.", icon: "📚", color: "#a16207" },
      { id: "stolik", x: 30, y: 68, label: "Stolik", translation: "Mesa de leitura", pronunciation: "STO-lik", example: "Stolik jest wolny.", examplePt: "A mesa está livre.", icon: "🪑", color: "#f59e0b" },
      { id: "lampa", x: 55, y: 25, label: "Lampa", translation: "Lâmpada", pronunciation: "LAM-pa", example: "Lampa świeci.", examplePt: "A lâmpada brilha.", icon: "💡", color: "#eab308" },
      { id: "katalog", x: 80, y: 55, label: "Katalog", translation: "Catálogo", pronunciation: "KA-ta-log", example: "Szukaj w katalogu.", examplePt: "Procure no catálogo.", icon: "🗂️", color: "#0ea5e9" },
      { id: "cisza", x: 15, y: 40, label: "Cisza", translation: "Silêncio", pronunciation: "TSHI-sha", example: "W bibliotece jest cisza.", examplePt: "Na biblioteca há silêncio.", icon: "🤫", color: "#8b5cf6" },
    ],
  },
  office: {
    dialog: [
      { speaker: "teacher", text: "Добрый день! Я Иван. Добро пожаловать в наш офис!", textPt: "Boa tarde! Sou Ivan. Bem-vindo ao nosso escritório!" },
      { speaker: "user", text: "Добрый день, Иван! Очень красивый офис. Как дела на работе?", textPt: "Boa tarde, Ivan! Escritório muito bonito. Como vai o trabalho?", options: ["Добрый день, Иван! Очень красивый офис. Как дела на работе?", "Не знаю.", "Я заблудился."], correctIndex: 0 },
      { speaker: "teacher", text: "Всё хорошо, спасибо! Вот мой компьютер и рабочий стол.", textPt: "Tudo bem, obrigado! Aqui está meu computador e mesa de trabalho." },
      { speaker: "user", text: "Понятно! А телефон звонит — нужно ответить?", textPt: "Entendi! E o telefone está tocando — precisa atender?", options: ["Понятно! А телефон звонит — нужно ответить?", "Не обращайте внимания.", "Выключите телефон."], correctIndex: 0 },
      { speaker: "teacher", text: "Да, это важный звонок. Окно открыто — свежий воздух помогает работать.", textPt: "Sim, é uma ligação importante. A janela está aberta — o ar fresco ajuda a trabalhar." },
      { speaker: "user", text: "Согласен! Можно взять кофе из кофемашины?", textPt: "Concordo! Posso pegar café da cafeteira?", options: ["Согласен! Можно взять кофе из кофемашины?", "Я не пью кофе.", "Где столовая?"], correctIndex: 0 },
      { speaker: "teacher", text: "Конечно! Папка с документами на столе. Ваш русский отличный!", textPt: "Claro! A pasta com documentos está na mesa. Seu russo está excelente!" },
    ],
    hotspots: [
      { id: "komputer", x: 50, y: 45, label: "Компьютер", translation: "Computador", pronunciation: "kom-PIU-ter", example: "Компьютер работает.", examplePt: "O computador está funcionando.", icon: "💻", color: "#6366f1" },
      { id: "stol", x: 35, y: 65, label: "Стол", translation: "Mesa", pronunciation: "STOL", example: "Стол большой.", examplePt: "A mesa é grande.", icon: "🪑", color: "#a16207" },
      { id: "telefon", x: 70, y: 55, label: "Телефон", translation: "Telefone", pronunciation: "te-li-FON", example: "Телефон звонит.", examplePt: "O telefone está tocando.", icon: "📞", color: "#22c55e" },
      { id: "okno", x: 80, y: 25, label: "Окно", translation: "Janela", pronunciation: "ak-NO", example: "Окно открыто.", examplePt: "A janela está aberta.", icon: "🪟", color: "#0ea5e9" },
      { id: "kofejnik", x: 20, y: 50, label: "Кофемашина", translation: "Cafeteira", pronunciation: "ko-fe-MA-shi-na", example: "Кофемашина работает.", examplePt: "A cafeteira está funcionando.", icon: "☕", color: "#f59e0b" },
      { id: "papka", x: 60, y: 30, label: "Папка", translation: "Pasta", pronunciation: "PAP-ka", example: "Папка на столе.", examplePt: "A pasta está na mesa.", icon: "📁", color: "#dc2626" },
    ],
  },
  metro: {
    dialog: [
      { speaker: "teacher", text: "Bienvenue dans le métro de Paris! Je suis Sophie. Quelle station cherchez-vous?", textPt: "Bem-vindo ao metrô de Paris! Sou Sophie. Qual estação você procura?" },
      { speaker: "user", text: "Je cherche la station Louvre. Comment acheter un billet?", textPt: "Procuro a estação Louvre. Como comprar um bilhete?", options: ["Je cherche la station Louvre. Comment acheter un billet?", "Je ne sais pas où aller.", "Je suis perdu."], correctIndex: 0 },
      { speaker: "teacher", text: "Achetez un billet au guichet ou à la machine. Un ticket coûte deux euros.", textPt: "Compre um bilhete na bilheteria ou na máquina. Um bilhete custa dois euros." },
      { speaker: "user", text: "Merci! Et le train arrive dans combien de minutes?", textPt: "Obrigado! E o trem chega em quantos minutos?", options: ["Merci! Et le train arrive dans combien de minutes?", "Je n'ai pas d'argent.", "Où est la sortie?"], correctIndex: 0 },
      { speaker: "teacher", text: "Regardez le panneau — le prochain train arrive dans trois minutes. Attendez sur le quai.", textPt: "Olhe o painel — o próximo trem chega em três minutos. Espere na plataforma." },
      { speaker: "user", text: "Je vois la porte s'ouvrir! Je dois entrer par le couloir à droite?", textPt: "Vejo a porta se abrir! Devo entrar pelo corredor à direita?", options: ["Je vois la porte s'ouvrir! Je dois entrer par le couloir à droite?", "Je ne veux pas entrer.", "Où est la sortie?"], correctIndex: 0 },
      { speaker: "teacher", text: "Oui, entrez vite! Votre français est excellent. Bon voyage!", textPt: "Sim, entre rápido! Seu francês está excelente. Boa viagem!" },
    ],
    hotspots: [
      { id: "train", x: 50, y: 50, label: "Train", translation: "Trem", pronunciation: "TREN", example: "Le train arrive.", examplePt: "O trem está chegando.", icon: "🚇", color: "#6366f1" },
      { id: "quai", x: 30, y: 70, label: "Quai", translation: "Plataforma", pronunciation: "KE", example: "Attendez sur le quai.", examplePt: "Espere na plataforma.", icon: "🛤️", color: "#f59e0b" },
      { id: "panneau", x: 70, y: 30, label: "Panneau", translation: "Painel", pronunciation: "pa-NO", example: "Lisez le panneau.", examplePt: "Leia o painel.", icon: "📋", color: "#0ea5e9" },
      { id: "porte", x: 20, y: 45, label: "Porte", translation: "Porta", pronunciation: "PORT", example: "La porte s'ouvre.", examplePt: "A porta se abre.", icon: "🚪", color: "#dc2626" },
      { id: "billet", x: 80, y: 55, label: "Billet", translation: "Bilhete", pronunciation: "bi-YE", example: "Achetez un billet.", examplePt: "Compre um bilhete.", icon: "🎟️", color: "#22c55e" },
      { id: "couloir", x: 55, y: 80, label: "Couloir", translation: "Corredor", pronunciation: "kul-WAR", example: "Le couloir est long.", examplePt: "O corredor é longo.", icon: "🏃", color: "#8b5cf6" },
    ],
  },
};

export function getSecureSceneSeed(sceneId: string): SecureSceneSeed | null {
  return SECURE_SCENE_SEEDS[sceneId] ?? null;
}

const PT_BR_ENGLISH_SCENE_SEEDS: Record<string, SecureSceneSeed> = {
  desert: {
    dialog: [
      { speaker: "teacher", text: "Hello! I am Ingrid. Welcome to the Sahara Desert!", textPt: "Olá! Eu sou a Ingrid. Bem-vindo ao Deserto do Saara!" },
      { speaker: "user", text: "Hello, Ingrid! The desert is beautiful.", textPt: "Olá, Ingrid! O deserto é bonito.", options: ["Hello, Ingrid! The desert is beautiful.", "I do not like the desert.", "Where is the hotel?"], correctIndex: 0 },
      { speaker: "teacher", text: "Look at the caravan. Camels can travel through the desert.", textPt: "Olhe para a caravana. Os camelos podem viajar pelo deserto." },
      { speaker: "user", text: "I can see the sand, the sun, and the dunes.", textPt: "Eu consigo ver a areia, o sol e as dunas.", options: ["I can see the sand, the sun, and the dunes.", "I cannot see anything.", "Where is the water?"], correctIndex: 0 },
      { speaker: "teacher", text: "Excellent! The sun is hot, and the footprints are in the sand.", textPt: "Excelente! O sol está quente e as pegadas estão na areia." },
      { speaker: "user", text: "The desert is hot, but it is amazing.", textPt: "O deserto é quente, mas é incrível.", options: ["The desert is hot, but it is amazing.", "I want to leave now.", "This is too difficult."], correctIndex: 0 },
      { speaker: "teacher", text: "Great work! Keep practicing your English every day.", textPt: "Ótimo trabalho! Continue praticando seu inglês todos os dias." },
    ],
    hotspots: [
      { id: "sand2", x: 50, y: 75, label: "Sand", translation: "Areia", pronunciation: "SÆND", example: "The sand is very hot.", examplePt: "A areia está muito quente.", icon: "🏜️", color: "#f59e0b" },
      { id: "caravan", x: 82, y: 55, label: "Caravan", translation: "Caravana", pronunciation: "KA-rə-van", example: "The caravan travels through the desert.", examplePt: "A caravana viaja pelo deserto.", icon: "🐪", color: "#a16207" },
      { id: "sun2", x: 70, y: 15, label: "Sun", translation: "Sol", pronunciation: "SʌN", example: "The sun is very hot.", examplePt: "O sol está muito quente.", icon: "☀️", color: "#eab308" },
      { id: "footprints", x: 55, y: 72, label: "Footprints", translation: "Pegadas", pronunciation: "FUT-prints", example: "The footprints are in the sand.", examplePt: "As pegadas estão na areia.", icon: "👣", color: "#22c55e" },
      { id: "dune", x: 55, y: 45, label: "Dune", translation: "Duna", pronunciation: "DYOON", example: "The dune is made of sand.", examplePt: "A duna é feita de areia.", icon: "🏔️", color: "#d97706" },
    ],
  },
  farm: {
    dialog: [
      { speaker: "teacher", text: "Hello! I am Ingrid. Welcome to our farm!", textPt: "Olá! Eu sou a Ingrid. Bem-vindo à nossa fazenda!" },
      { speaker: "user", text: "Hello, Ingrid! It is a beautiful farm. I can see cows and chickens.", textPt: "Olá, Ingrid! É uma fazenda bonita. Eu consigo ver vacas e galinhas.", options: ["Hello, Ingrid! It is a beautiful farm. I can see cows and chickens.", "I do not like farms.", "Where is the city?"], correctIndex: 0 },
      { speaker: "teacher", text: "Yes! A cow gives us milk, and a chicken lays eggs. Can you say tractor?", textPt: "Sim! Uma vaca nos dá leite e uma galinha bota ovos. Você consegue dizer trator?" },
      { speaker: "user", text: "Tractor! I can also see a barn full of wheat.", textPt: "Trator! Eu também consigo ver um celeiro cheio de trigo.", options: ["Tractor! I can also see a barn full of wheat.", "I do not understand.", "This is too difficult."], correctIndex: 0 },
      { speaker: "teacher", text: "Excellent! The wheat is golden, and the sky is blue today.", textPt: "Excelente! O trigo é dourado e o céu está azul hoje." },
      { speaker: "user", text: "Yes, the sky is wonderful. I would like to live here.", textPt: "Sim, o céu está maravilhoso. Eu gostaria de morar aqui.", options: ["Yes, the sky is wonderful. I would like to live here.", "I prefer the city.", "It is too quiet."], correctIndex: 0 },
      { speaker: "teacher", text: "Wonderful! Your English is getting better. Well done!", textPt: "Maravilhoso! Seu inglês está melhorando. Muito bem!" },
    ],
    hotspots: [
      { id: "krowa", x: 35, y: 55, label: "Cow", translation: "Vaca", pronunciation: "KAU", example: "The cow gives milk.", examplePt: "A vaca dá leite.", icon: "🐄", color: "#f59e0b" },
      { id: "stodola", x: 65, y: 40, label: "Barn", translation: "Celeiro", pronunciation: "BAARN", example: "The barn is big.", examplePt: "O celeiro é grande.", icon: "🏚️", color: "#a16207" },
      { id: "pszenica", x: 50, y: 72, label: "Wheat", translation: "Trigo", pronunciation: "WEET", example: "The wheat is golden.", examplePt: "O trigo é dourado.", icon: "🌾", color: "#eab308" },
      { id: "traktor", x: 20, y: 65, label: "Tractor", translation: "Trator", pronunciation: "TRAK-ter", example: "The tractor is red.", examplePt: "O trator é vermelho.", icon: "🚜", color: "#dc2626" },
      { id: "kura", x: 80, y: 60, label: "Chicken", translation: "Galinha", pronunciation: "CHI-ken", example: "The chicken lays eggs.", examplePt: "A galinha bota ovos.", icon: "🐔", color: "#f97316" },
      { id: "niebo", x: 55, y: 15, label: "Sky", translation: "Céu", pronunciation: "SKAI", example: "The sky is blue.", examplePt: "O céu está azul.", icon: "🌤️", color: "#3b82f6" },
    ],
  },
  library: {
    dialog: [
      { speaker: "teacher", text: "Hello! I am Ingrid. Welcome to the library. What book would you like to read?", textPt: "Olá! Eu sou a Ingrid. Bem-vindo à biblioteca. Que livro você gostaria de ler?" },
      { speaker: "user", text: "I would like to read an adventure novel. Where is the literature section?", textPt: "Eu gostaria de ler um romance de aventura. Onde fica a seção de literatura?", options: ["I would like to read an adventure novel. Where is the literature section?", "I do not know what to read.", "I do not like reading."], correctIndex: 0 },
      { speaker: "teacher", text: "The literature section is on the second shelf to the left. Remember: the library is quiet.", textPt: "A seção de literatura fica na segunda prateleira à esquerda. Lembre-se: a biblioteca é silenciosa." },
      { speaker: "user", text: "Of course. Can I sit at the table near the lamp?", textPt: "Claro. Posso sentar à mesa perto da lâmpada?", options: ["Of course. Can I sit at the table near the lamp?", "I prefer to stand.", "Can I eat here?"], correctIndex: 0 },
      { speaker: "teacher", text: "Yes, the table is free. You can also use the catalog to find books.", textPt: "Sim, a mesa está livre. Você também pode usar o catálogo para encontrar livros." },
      { speaker: "user", text: "Thank you. How long can I borrow a book?", textPt: "Obrigado. Por quanto tempo posso pegar um livro emprestado?", options: ["Thank you. How long can I borrow a book?", "I do not want to borrow a book.", "Can I take it without asking?"], correctIndex: 0 },
      { speaker: "teacher", text: "For two weeks. Your English is getting better. Well done!", textPt: "Por duas semanas. Seu inglês está melhorando. Muito bem!" },
    ],
    hotspots: [
      { id: "ksiazka", x: 40, y: 45, label: "Book", translation: "Livro", pronunciation: "BUK", example: "The book is interesting.", examplePt: "O livro é interessante.", icon: "📖", color: "#6366f1" },
      { id: "polka", x: 70, y: 35, label: "Shelf", translation: "Prateleira", pronunciation: "SHELF", example: "The shelf is full.", examplePt: "A prateleira está cheia.", icon: "📚", color: "#a16207" },
      { id: "stolik", x: 30, y: 68, label: "Reading Table", translation: "Mesa de leitura", pronunciation: "REE-ding TEI-bəl", example: "The reading table is free.", examplePt: "A mesa de leitura está livre.", icon: "🪑", color: "#f59e0b" },
      { id: "lampa", x: 55, y: 25, label: "Lamp", translation: "Lâmpada", pronunciation: "LAMP", example: "The lamp is bright.", examplePt: "A lâmpada está acesa.", icon: "💡", color: "#eab308" },
      { id: "katalog", x: 80, y: 55, label: "Catalog", translation: "Catálogo", pronunciation: "KA-tə-log", example: "Look in the catalog.", examplePt: "Procure no catálogo.", icon: "🗂️", color: "#0ea5e9" },
      { id: "cisza", x: 15, y: 40, label: "Quiet", translation: "Silêncio", pronunciation: "KWAI-et", example: "The library is quiet.", examplePt: "A biblioteca é silenciosa.", icon: "🤫", color: "#8b5cf6" },
    ],
  },
};

export function getSecureSceneSeedForLanguage(sceneId: string, targetLanguage: string, nativeLanguage: string): SecureSceneSeed | null {
  const isPortugueseToEnglish = nativeLanguage.toLowerCase().startsWith("pt")
    && targetLanguage.toLowerCase().startsWith("en");
  if (isPortugueseToEnglish && PT_BR_ENGLISH_SCENE_SEEDS[sceneId]) {
    return PT_BR_ENGLISH_SCENE_SEEDS[sceneId];
  }
  return getSecureSceneSeed(sceneId);
}

export function getSecureSceneSeedCatalog() {
  return Object.entries(SECURE_SCENE_SEEDS).map(([sceneId, seed]) => ({
    sceneId,
    dialogLines: seed.dialog.length,
    hotspotCount: seed.hotspots.length,
  }));
}
