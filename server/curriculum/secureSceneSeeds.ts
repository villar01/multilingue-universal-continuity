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
const SECURE_SCENE_SEEDS: Record<string, SecureSceneSeed> = {
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
};

export function getSecureSceneSeed(sceneId: string): SecureSceneSeed | null {
  return SECURE_SCENE_SEEDS[sceneId] ?? null;
}
