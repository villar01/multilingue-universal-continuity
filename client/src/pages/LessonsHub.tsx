import { useState } from "react";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { speakText as speakNaturalVoice } from "@/hooks/useNaturalVoice";
import { CEFR_LEVELS as CEFR_CONFIGS, type CEFRLevel } from "@/lib/lesson-levels";

// ─── Types ────────────────────────────────────────────────────────────────────
type LegacyLevel = "beginner" | "intermediate" | "advanced";
type GameType = "flashcard" | "match" | "fill" | "scene";

interface VisualScene {
  id: string;
  title: string;
  titlePt: string;
  emoji: string;
  image: string;
  level: LegacyLevel;
  words: { word: string; translation: string; emoji: string }[];
  dialogues?: { speaker: string; text: string; translation: string }[];
  lessonNumber?: number;
  teacher?: string;
}

interface MemoryCard {
  id: string;
  word: string;
  translation: string;
  emoji: string;
  category: string;
}

// ─── Pareto Vocabulary by Level ───────────────────────────────────────────────
const PARETO_BEGINNER: MemoryCard[] = [
  { id:"1", word:"Hello", translation:"Olá", emoji:"👋", category:"greetings" },
  { id:"2", word:"Goodbye", translation:"Tchau", emoji:"🙋", category:"greetings" },
  { id:"3", word:"Thank you", translation:"Obrigado", emoji:"🙏", category:"greetings" },
  { id:"4", word:"Please", translation:"Por favor", emoji:"🤲", category:"greetings" },
  { id:"5", word:"Yes", translation:"Sim", emoji:"✅", category:"basics" },
  { id:"6", word:"No", translation:"Não", emoji:"❌", category:"basics" },
  { id:"7", word:"Water", translation:"Água", emoji:"💧", category:"food" },
  { id:"8", word:"Food", translation:"Comida", emoji:"🍽️", category:"food" },
  { id:"9", word:"House", translation:"Casa", emoji:"🏠", category:"places" },
  { id:"10", word:"Family", translation:"Família", emoji:"👨‍👩‍👧‍👦", category:"family" },
  { id:"11", word:"Mother", translation:"Mãe", emoji:"👩", category:"family" },
  { id:"12", word:"Father", translation:"Pai", emoji:"👨", category:"family" },
  { id:"13", word:"Brother", translation:"Irmão", emoji:"👦", category:"family" },
  { id:"14", word:"Sister", translation:"Irmã", emoji:"👧", category:"family" },
  { id:"15", word:"Friend", translation:"Amigo", emoji:"🤝", category:"social" },
  { id:"16", word:"School", translation:"Escola", emoji:"🏫", category:"places" },
  { id:"17", word:"Work", translation:"Trabalho", emoji:"💼", category:"places" },
  { id:"18", word:"Day", translation:"Dia", emoji:"☀️", category:"time" },
  { id:"19", word:"Night", translation:"Noite", emoji:"🌙", category:"time" },
  { id:"20", word:"Good", translation:"Bom", emoji:"👍", category:"adjectives" },
];

const PARETO_INTERMEDIATE: MemoryCard[] = [
  { id:"i1", word:"Understand", translation:"Entender", emoji:"🧠", category:"verbs" },
  { id:"i2", word:"Remember", translation:"Lembrar", emoji:"💭", category:"verbs" },
  { id:"i3", word:"Believe", translation:"Acreditar", emoji:"💡", category:"verbs" },
  { id:"i4", word:"Explain", translation:"Explicar", emoji:"📖", category:"verbs" },
  { id:"i5", word:"Opportunity", translation:"Oportunidade", emoji:"🌟", category:"nouns" },
  { id:"i6", word:"Experience", translation:"Experiência", emoji:"🎯", category:"nouns" },
  { id:"i7", word:"Knowledge", translation:"Conhecimento", emoji:"📚", category:"nouns" },
  { id:"i8", word:"Important", translation:"Importante", emoji:"❗", category:"adjectives" },
  { id:"i9", word:"Different", translation:"Diferente", emoji:"🔄", category:"adjectives" },
  { id:"i10", word:"Possible", translation:"Possível", emoji:"✨", category:"adjectives" },
  { id:"i11", word:"Although", translation:"Embora", emoji:"⚖️", category:"connectors" },
  { id:"i12", word:"However", translation:"Porém", emoji:"↔️", category:"connectors" },
  { id:"i13", word:"Therefore", translation:"Portanto", emoji:"➡️", category:"connectors" },
  { id:"i14", word:"Meanwhile", translation:"Enquanto isso", emoji:"⏳", category:"time" },
  { id:"i15", word:"Suddenly", translation:"De repente", emoji:"⚡", category:"adverbs" },
  { id:"i16", word:"Appointment", translation:"Compromisso", emoji:"📅", category:"nouns" },
  { id:"i17", word:"Neighborhood", translation:"Bairro", emoji:"🏘️", category:"places" },
  { id:"i18", word:"Responsibility", translation:"Responsabilidade", emoji:"🎖️", category:"nouns" },
  { id:"i19", word:"Achievement", translation:"Conquista", emoji:"🏆", category:"nouns" },
  { id:"i20", word:"Challenge", translation:"Desafio", emoji:"⛰️", category:"nouns" },
];

// ─── Visual Scenes ─────────────────────────────────────────────────────────────
const VISUAL_SCENES: VisualScene[] = [
  {
    id:"family_home", title:"Family at Home", titlePt:"Família em Casa",
    emoji:"🏠", level:"beginner", lessonNumber:1, teacher:"Ingrid",
    image:"https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=800&q=80",
    dialogues:[
      { speaker:"Ingrid", text:"Welcome! This is the living room.", translation:"Bem-vindo! Esta é a sala de estar." },
      { speaker:"Aluno", text:"What is that room?", translation:"Que cômodo é esse?" },
      { speaker:"Ingrid", text:"That is the kitchen. We cook there.", translation:"Aquela é a cozinha. Cozinhamos lá." },
      { speaker:"Aluno", text:"And where is the bedroom?", translation:"E onde fica o quarto?" },
      { speaker:"Ingrid", text:"The bedroom is upstairs.", translation:"O quarto fica no andar de cima." },
    ],
    words:[
      { word:"Living room", translation:"Sala de estar", emoji:"🛋️" },
      { word:"Kitchen", translation:"Cozinha", emoji:"🍳" },
      { word:"Bedroom", translation:"Quarto", emoji:"🛏️" },
      { word:"Bathroom", translation:"Banheiro", emoji:"🚿" },
      { word:"Door", translation:"Porta", emoji:"🚪" },
      { word:"Window", translation:"Janela", emoji:"🪟" },
    ]
  },
  {
    id:"airport", title:"At the Airport", titlePt:"No Aeroporto",
    emoji:"✈️", level:"beginner", lessonNumber:2, teacher:"Ricardo",
    image:"https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80",
    dialogues:[
      { speaker:"Ricardo", text:"May I see your passport, please?", translation:"Posso ver seu passaporte, por favor?" },
      { speaker:"Aluno", text:"Here it is. Where is gate 12?", translation:"Aqui está. Onde fica o portão 12?" },
      { speaker:"Ricardo", text:"Gate 12 is to the right. Your flight boards at 3pm.", translation:"O portão 12 é à direita. Seu voo embarca às 15h." },
      { speaker:"Aluno", text:"Thank you! How much is the luggage fee?", translation:"Obrigado! Quanto é a taxa de bagagem?" },
      { speaker:"Ricardo", text:"One suitcase is free. Extra bags cost $30.", translation:"Uma mala é gratuita. Malas extras custam $30." },
    ],
    words:[
      { word:"Passport", translation:"Passaporte", emoji:"📘" },
      { word:"Suitcase", translation:"Mala", emoji:"🧳" },
      { word:"Gate", translation:"Portão", emoji:"🚪" },
      { word:"Flight", translation:"Voo", emoji:"✈️" },
      { word:"Ticket", translation:"Passagem", emoji:"🎫" },
      { word:"Boarding", translation:"Embarque", emoji:"🛫" },
    ]
  },
  {
    id:"restaurant", title:"At the Restaurant", titlePt:"No Restaurante",
    emoji:"🍽️", level:"beginner", lessonNumber:3, teacher:"Ingrid",
    image:"https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
    dialogues:[
      { speaker:"Garçom", text:"Good evening! Do you have a reservation?", translation:"Boa noite! Você tem uma reserva?" },
      { speaker:"Aluno", text:"Yes, for two people. My name is Silva.", translation:"Sim, para duas pessoas. Meu nome é Silva." },
      { speaker:"Garçom", text:"Please follow me. Here is the menu.", translation:"Por favor, me siga. Aqui está o cardápio." },
      { speaker:"Aluno", text:"What do you recommend?", translation:"O que você recomenda?" },
      { speaker:"Garçom", text:"The pasta is excellent today!", translation:"O macarrão está excelente hoje!" },
    ],
    words:[
      { word:"Menu", translation:"Cardápio", emoji:"📋" },
      { word:"Waiter", translation:"Garçom", emoji:"🧑‍🍳" },
      { word:"Bill", translation:"Conta", emoji:"🧾" },
      { word:"Reservation", translation:"Reserva", emoji:"📅" },
      { word:"Appetizer", translation:"Entrada", emoji:"🥗" },
      { word:"Dessert", translation:"Sobremesa", emoji:"🍰" },
    ]
  },
  {
    id:"office", title:"At the Office", titlePt:"No Escritório",
    emoji:"💼", level:"intermediate", lessonNumber:1, teacher:"Ricardo",
    image:"https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
    dialogues:[
      { speaker:"Ricardo", text:"Good morning! The meeting starts at 9.", translation:"Bom dia! A reunião começa às 9." },
      { speaker:"Aluno", text:"I have a deadline today. Can we reschedule?", translation:"Tenho um prazo hoje. Podemos remarcar?" },
      { speaker:"Ricardo", text:"Sure. Let's meet after lunch to discuss the project.", translation:"Claro. Vamos nos reunir depois do almoço para discutir o projeto." },
      { speaker:"Aluno", text:"I'll prepare the presentation by then.", translation:"Vou preparar a apresentação até lá." },
    ],
    words:[
      { word:"Meeting", translation:"Reunião", emoji:"👥" },
      { word:"Deadline", translation:"Prazo", emoji:"⏰" },
      { word:"Colleague", translation:"Colega", emoji:"🤝" },
      { word:"Project", translation:"Projeto", emoji:"📊" },
      { word:"Presentation", translation:"Apresentação", emoji:"📽️" },
      { word:"Budget", translation:"Orçamento", emoji:"💰" },
    ]
  },
  {
    id:"hospital", title:"At the Hospital", titlePt:"No Hospital",
    emoji:"🏥", level:"intermediate",
    image:"https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80",
    words:[
      { word:"Doctor", translation:"Médico", emoji:"👨‍⚕️" },
      { word:"Nurse", translation:"Enfermeiro", emoji:"👩‍⚕️" },
      { word:"Prescription", translation:"Receita", emoji:"📝" },
      { word:"Symptom", translation:"Sintoma", emoji:"🤒" },
      { word:"Treatment", translation:"Tratamento", emoji:"💊" },
      { word:"Emergency", translation:"Emergência", emoji:"🚨" },
    ]
  },
  {
    id:"smith_family", title:"The Smith Family", titlePt:"A Família Smith",
    emoji:"👨‍👩‍👧‍👦", level:"beginner", lessonNumber:4, teacher:"Ingrid",
    image:"https://images.unsplash.com/photo-1511895426328-dc8714191011?w=800&q=80",
    dialogues:[
      { speaker:"Ingrid", text:"This is the Smith family. John is the father.", translation:"Esta é a família Smith. John é o pai." },
      { speaker:"Aluno", text:"Who is the mother?", translation:"Quem é a mãe?" },
      { speaker:"Ingrid", text:"Mary is the mother. Tom is the son and Emma is the daughter.", translation:"Mary é a mãe. Tom é o filho e Emma é a filha." },
      { speaker:"Aluno", text:"Are they having dinner together?", translation:"Eles estão jantando juntos?" },
      { speaker:"Ingrid", text:"Yes! The family loves to eat together.", translation:"Sim! A família adora comer juntos." },
    ],
    words:[
      { word:"Father", translation:"Pai", emoji:"👨" },
      { word:"Mother", translation:"Mãe", emoji:"👩" },
      { word:"Son", translation:"Filho", emoji:"👦" },
      { word:"Daughter", translation:"Filha", emoji:"👧" },
      { word:"Husband", translation:"Marido", emoji:"💍" },
      { word:"Wife", translation:"Esposa", emoji:"💐" },
      { word:"Parents", translation:"Pais", emoji:"👫" },
      { word:"Children", translation:"Filhos", emoji:"👶" },
      { word:"Home", translation:"Lar", emoji:"🏡" },
      { word:"Dinner", translation:"Jantar", emoji:"🍽️" },
      { word:"Together", translation:"Juntos", emoji:"🤝" },
      { word:"Love", translation:"Amor", emoji:"❤️" },
    ]
  },
  {
    id:"supermarket", title:"At the Supermarket", titlePt:"No Supermercado",
    emoji:"🛒", level:"beginner",
    image:"https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80",
    words:[
      { word:"Cart", translation:"Carrinho", emoji:"🛒" },
      { word:"Cashier", translation:"Caixa", emoji:"💳" },
      { word:"Aisle", translation:"Corredor", emoji:"🏪" },
      { word:"Price", translation:"Preço", emoji:"🏷️" },
      { word:"Discount", translation:"Desconto", emoji:"💸" },
      { word:"Receipt", translation:"Recibo", emoji:"🧾" },
      { word:"Bread", translation:"Pão", emoji:"🍞" },
      { word:"Milk", translation:"Leite", emoji:"🥛" },
    ]
  },
  {
    id:"train_station", title:"Train Station", titlePt:"Estação de Trem",
    emoji:"🚂", level:"intermediate",
    image:"https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=800&q=80",
    words:[
      { word:"Platform", translation:"Plataforma", emoji:"🚉" },
      { word:"Departure", translation:"Partida", emoji:"🛫" },
      { word:"Arrival", translation:"Chegada", emoji:"🛬" },
      { word:"Conductor", translation:"Condutor", emoji:"👷" },
      { word:"Schedule", translation:"Horário", emoji:"🕐" },
      { word:"Delay", translation:"Atraso", emoji:"⏰" },
      { word:"Luggage", translation:"Bagagem", emoji:"🧳" },
      { word:"Commuter", translation:"Passageiro", emoji:"🧑" },
    ]
  },
  {
    id:"university", title:"At the University", titlePt:"Na Universidade",
    emoji:"🎓", level:"advanced", lessonNumber:1, teacher:"Ricardo",
    image:"https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80",
    dialogues:[
      { speaker:"Professor", text:"Your dissertation must be submitted by Friday.", translation:"Sua dissertação deve ser entregue até sexta-feira." },
      { speaker:"Aluno", text:"I need more time to review the curriculum requirements.", translation:"Preciso de mais tempo para revisar os requisitos do currículo." },
      { speaker:"Professor", text:"Have you applied for the scholarship?", translation:"Você se candidatou à bolsa de estudos?" },
      { speaker:"Aluno", text:"Yes, the lecture on Thursday helped me understand the process.", translation:"Sim, a palestra de quinta-feira me ajudou a entender o processo." },
    ],
    words:[
      { word:"Lecture", translation:"Palestra", emoji:"🎤" },
      { word:"Thesis", translation:"Tese", emoji:"📜" },
      { word:"Professor", translation:"Professor", emoji:"👨‍🏫" },
      { word:"Campus", translation:"Campus", emoji:"🏛️" },
      { word:"Scholarship", translation:"Bolsa de estudos", emoji:"🏆" },
      { word:"Curriculum", translation:"Currículo", emoji:"📋" },
      { word:"Dissertation", translation:"Dissertação", emoji:"📖" },
      { word:"Semester", translation:"Semestre", emoji:"📅" },
    ]
  },
  {
    id:"courtroom", title:"In the Courtroom", titlePt:"No Tribunal",
    emoji:"⚖️", level:"advanced", lessonNumber:2, teacher:"Ingrid",
    image:"https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80",
    dialogues:[
      { speaker:"Juiz", text:"Order in the court! The defendant may speak.", translation:"Ordem no tribunal! O réu pode falar." },
      { speaker:"Advogado", text:"Your Honor, the evidence clearly supports acquittal.", translation:"Meritíssimo, as evidências claramente apoiam a absolvição." },
      { speaker:"Juiz", text:"The testimony of the witness is crucial.", translation:"O testemunho da testemunha é crucial." },
      { speaker:"Advogado", text:"We await the verdict with confidence.", translation:"Aguardamos o veredicto com confiança." },
    ],
    words:[
      { word:"Judge", translation:"Juiz", emoji:"⚖️" },
      { word:"Lawyer", translation:"Advogado", emoji:"👨‍💼" },
      { word:"Verdict", translation:"Veredicto", emoji:"🔨" },
      { word:"Evidence", translation:"Evidência", emoji:"🔍" },
      { word:"Defendant", translation:"Réu", emoji:"🧑" },
      { word:"Plaintiff", translation:"Autor", emoji:"📄" },
      { word:"Testimony", translation:"Testemunho", emoji:"🗣️" },
      { word:"Acquittal", translation:"Absolvição", emoji:"✅" },
    ]
  },
  {
    id:"conference", title:"International Conference", titlePt:"Conferência Internacional",
    emoji:"🌐", level:"advanced",
    image:"https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
    words:[
      { word:"Keynote", translation:"Palestra principal", emoji:"🎙️" },
      { word:"Delegate", translation:"Delegado", emoji:"🤵" },
      { word:"Agenda", translation:"Pauta", emoji:"📋" },
      { word:"Negotiation", translation:"Negociação", emoji:"🤝" },
      { word:"Consensus", translation:"Consenso", emoji:"✅" },
      { word:"Resolution", translation:"Resolução", emoji:"📜" },
      { word:"Proposal", translation:"Proposta", emoji:"💡" },
      { word:"Bilateral", translation:"Bilateral", emoji:"↔️" },
    ]
  },
  {
    id:"museum", title:"At the Museum", titlePt:"No Museu",
    emoji:"🏛️", level:"advanced",
    image:"https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=800&q=80",
    words:[
      { word:"Exhibition", translation:"Exposição", emoji:"🖼️" },
      { word:"Artifact", translation:"Artefato", emoji:"🏺" },
      { word:"Curator", translation:"Curador", emoji:"👨‍🎨" },
      { word:"Heritage", translation:"Patrimônio", emoji:"🏛️" },
      { word:"Sculpture", translation:"Escultura", emoji:"🗿" },
      { word:"Masterpiece", translation:"Obra-prima", emoji:"🎨" },
      { word:"Renaissance", translation:"Renascimento", emoji:"✨" },
      { word:"Contemporary", translation:"Contemporâneo", emoji:"🔮" },
    ]
  },
  {
    id:"luxury_hotel", title:"Luxury Hotel", titlePt:"Hotel de Luxo",
    emoji:"🏨", level:"advanced",
    image:"https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
    words:[
      { word:"Concierge", translation:"Concierge", emoji:"🛎️" },
      { word:"Suite", translation:"Suíte", emoji:"🛏️" },
      { word:"Amenities", translation:"Comodidades", emoji:"🛁" },
      { word:"Valet", translation:"Manobrista", emoji:"🚗" },
      { word:"Complimentary", translation:"Cortesia", emoji:"🎁" },
      { word:"Checkout", translation:"Check-out", emoji:"🔑" },
      { word:"Reservation", translation:"Reserva", emoji:"📅" },
      { word:"Penthouse", translation:"Cobertura", emoji:"🌆" },
    ]
  },
  // ── BEGINNER EXTRA SCENES ─────────────────────────────────────────────────
  {
    id:"playground", title:"At the Playground", titlePt:"No Parque Infantil",
    emoji:"🛝", level:"beginner",
    image:"https://images.unsplash.com/photo-1575783970733-1aaedde1db74?w=800&q=80",
    words:[
      { word:"Slide", translation:"Escorregador", emoji:"🛝" },
      { word:"Swing", translation:"Balanço", emoji:"🏃" },
      { word:"Ball", translation:"Bola", emoji:"⚽" },
      { word:"Child", translation:"Criança", emoji:"👦" },
      { word:"Run", translation:"Correr", emoji:"🏃" },
      { word:"Play", translation:"Brincar", emoji:"🎮" },
      { word:"Fun", translation:"Diversão", emoji:"😄" },
      { word:"Friend", translation:"Amigo", emoji:"🤝" },
    ]
  },
  {
    id:"bedroom", title:"In the Bedroom", titlePt:"No Quarto",
    emoji:"🛏️", level:"beginner",
    image:"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
    words:[
      { word:"Bed", translation:"Cama", emoji:"🛏️" },
      { word:"Pillow", translation:"Travesseiro", emoji:"🛌" },
      { word:"Blanket", translation:"Cobertor", emoji:"🧣" },
      { word:"Alarm", translation:"Despertador", emoji:"⏰" },
      { word:"Sleep", translation:"Dormir", emoji:"😴" },
      { word:"Wake up", translation:"Acordar", emoji:"☀️" },
      { word:"Lamp", translation:"Abajur", emoji:"💡" },
      { word:"Mirror", translation:"Espelho", emoji:"🪞" },
    ]
  },
  {
    id:"kitchen", title:"In the Kitchen", titlePt:"Na Cozinha",
    emoji:"🍳", level:"beginner",
    image:"https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",
    words:[
      { word:"Stove", translation:"Fogão", emoji:"🔥" },
      { word:"Fridge", translation:"Geladeira", emoji:"🧊" },
      { word:"Pot", translation:"Panela", emoji:"🍲" },
      { word:"Fork", translation:"Garfo", emoji:"🍴" },
      { word:"Knife", translation:"Faca", emoji:"🔪" },
      { word:"Spoon", translation:"Colher", emoji:"🥄" },
      { word:"Cook", translation:"Cozinhar", emoji:"👨‍🍳" },
      { word:"Plate", translation:"Prato", emoji:"🍽️" },
    ]
  },
  {
    id:"school_classroom", title:"In the Classroom", titlePt:"Na Sala de Aula",
    emoji:"📚", level:"beginner",
    image:"https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80",
    words:[
      { word:"Teacher", translation:"Professor", emoji:"👨‍🏫" },
      { word:"Student", translation:"Aluno", emoji:"🎒" },
      { word:"Book", translation:"Livro", emoji:"📖" },
      { word:"Pencil", translation:"Lápis", emoji:"✏️" },
      { word:"Board", translation:"Quadro", emoji:"📋" },
      { word:"Desk", translation:"Mesa", emoji:"🪑" },
      { word:"Learn", translation:"Aprender", emoji:"🧠" },
      { word:"Write", translation:"Escrever", emoji:"✍️" },
    ]
  },
  {
    id:"birthday_party", title:"Birthday Party", titlePt:"Festa de Aniversário",
    emoji:"🎂", level:"beginner",
    image:"https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80",
    words:[
      { word:"Cake", translation:"Bolo", emoji:"🎂" },
      { word:"Candle", translation:"Vela", emoji:"🕯️" },
      { word:"Gift", translation:"Presente", emoji:"🎁" },
      { word:"Balloon", translation:"Balão", emoji:"🎈" },
      { word:"Sing", translation:"Cantar", emoji:"🎵" },
      { word:"Happy", translation:"Feliz", emoji:"😊" },
      { word:"Party", translation:"Festa", emoji:"🎉" },
      { word:"Wish", translation:"Desejo", emoji:"⭐" },
    ]
  },
  {
    id:"pet_care", title:"Taking Care of Pets", titlePt:"Cuidando dos Animais",
    emoji:"🐕", level:"beginner",
    image:"https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80",
    words:[
      { word:"Dog", translation:"Cachorro", emoji:"🐕" },
      { word:"Cat", translation:"Gato", emoji:"🐈" },
      { word:"Feed", translation:"Alimentar", emoji:"🍖" },
      { word:"Walk", translation:"Passear", emoji:"🦮" },
      { word:"Bath", translation:"Banho", emoji:"🛁" },
      { word:"Vet", translation:"Veterinário", emoji:"💉" },
      { word:"Collar", translation:"Coleira", emoji:"📿" },
      { word:"Love", translation:"Amor", emoji:"❤️" },
    ]
  },
  {
    id:"morning_routine", title:"Morning Routine", titlePt:"Rotina Matinal",
    emoji:"🌅", level:"beginner",
    image:"https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80",
    words:[
      { word:"Wake up", translation:"Acordar", emoji:"⏰" },
      { word:"Shower", translation:"Tomar banho", emoji:"🚿" },
      { word:"Brush teeth", translation:"Escovar dentes", emoji:"🪥" },
      { word:"Breakfast", translation:"Café da manhã", emoji:"🥞" },
      { word:"Dress", translation:"Se vestir", emoji:"👕" },
      { word:"Comb", translation:"Pentear", emoji:"💇" },
      { word:"Ready", translation:"Pronto", emoji:"✅" },
      { word:"Leave", translation:"Sair", emoji:"🚶" },
    ]
  },
  {
    id:"grocery_shopping", title:"Grocery Shopping", titlePt:"Fazendo Compras",
    emoji:"🛍️", level:"beginner",
    image:"https://images.unsplash.com/photo-1534723452862-4c874986ebad?w=800&q=80",
    words:[
      { word:"List", translation:"Lista", emoji:"📝" },
      { word:"Vegetable", translation:"Legume", emoji:"🥦" },
      { word:"Fruit", translation:"Fruta", emoji:"🍎" },
      { word:"Meat", translation:"Carne", emoji:"🥩" },
      { word:"Pay", translation:"Pagar", emoji:"💳" },
      { word:"Bag", translation:"Sacola", emoji:"🛍️" },
      { word:"Change", translation:"Troco", emoji:"💰" },
      { word:"Fresh", translation:"Fresco", emoji:"🌿" },
    ]
  },
  {
    id:"park_walk", title:"Walking in the Park", titlePt:"Caminhando no Parque",
    emoji:"🌳", level:"beginner",
    image:"https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800&q=80",
    words:[
      { word:"Tree", translation:"Árvore", emoji:"🌳" },
      { word:"Flower", translation:"Flor", emoji:"🌸" },
      { word:"Bird", translation:"Pássaro", emoji:"🐦" },
      { word:"Path", translation:"Caminho", emoji:"🛤️" },
      { word:"Bench", translation:"Banco", emoji:"🪑" },
      { word:"Sun", translation:"Sol", emoji:"☀️" },
      { word:"Fresh air", translation:"Ar fresco", emoji:"💨" },
      { word:"Exercise", translation:"Exercício", emoji:"🏃" },
    ]
  },
  {
    id:"beach_day", title:"Day at the Beach", titlePt:"Dia na Praia",
    emoji:"🏖️", level:"beginner",
    image:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
    words:[
      { word:"Sand", translation:"Areia", emoji:"🏜️" },
      { word:"Wave", translation:"Onda", emoji:"🌊" },
      { word:"Sunscreen", translation:"Protetor solar", emoji:"🧴" },
      { word:"Towel", translation:"Toalha", emoji:"🏖️" },
      { word:"Swim", translation:"Nadar", emoji:"🏊" },
      { word:"Shell", translation:"Concha", emoji:"🐚" },
      { word:"Hot", translation:"Quente", emoji:"🌡️" },
      { word:"Relax", translation:"Relaxar", emoji:"😌" },
    ]
  },
  {
    id:"clothing_store", title:"At the Clothing Store", titlePt:"Na Loja de Roupas",
    emoji:"👗", level:"beginner",
    image:"https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&q=80",
    words:[
      { word:"Shirt", translation:"Camisa", emoji:"👕" },
      { word:"Pants", translation:"Calça", emoji:"👖" },
      { word:"Dress", translation:"Vestido", emoji:"👗" },
      { word:"Shoes", translation:"Sapatos", emoji:"👟" },
      { word:"Size", translation:"Tamanho", emoji:"📏" },
      { word:"Try on", translation:"Experimentar", emoji:"🪞" },
      { word:"Color", translation:"Cor", emoji:"🎨" },
      { word:"Buy", translation:"Comprar", emoji:"🛒" },
    ]
  },
  {
    id:"doctor_visit", title:"Visiting the Doctor", titlePt:"Visita ao Médico",
    emoji:"🩺", level:"beginner",
    image:"https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80",
    words:[
      { word:"Sick", translation:"Doente", emoji:"🤒" },
      { word:"Pain", translation:"Dor", emoji:"😣" },
      { word:"Fever", translation:"Febre", emoji:"🌡️" },
      { word:"Medicine", translation:"Remédio", emoji:"💊" },
      { word:"Rest", translation:"Descansar", emoji:"🛌" },
      { word:"Better", translation:"Melhor", emoji:"😊" },
      { word:"Appointment", translation:"Consulta", emoji:"📅" },
      { word:"Healthy", translation:"Saudável", emoji:"💪" },
    ]
  },
  {
    id:"bus_ride", title:"Taking the Bus", titlePt:"Andando de Ônibus",
    emoji:"🚌", level:"beginner",
    image:"https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80",
    words:[
      { word:"Bus stop", translation:"Ponto de ônibus", emoji:"🚏" },
      { word:"Ticket", translation:"Passagem", emoji:"🎫" },
      { word:"Seat", translation:"Assento", emoji:"💺" },
      { word:"Driver", translation:"Motorista", emoji:"🧑‍✈️" },
      { word:"Wait", translation:"Esperar", emoji:"⏳" },
      { word:"Get on", translation:"Embarcar", emoji:"⬆️" },
      { word:"Get off", translation:"Desembarcar", emoji:"⬇️" },
      { word:"Route", translation:"Rota", emoji:"🗺️" },
    ]
  },
  {
    id:"library", title:"At the Library", titlePt:"Na Biblioteca",
    emoji:"📚", level:"beginner",
    image:"https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80",
    words:[
      { word:"Book", translation:"Livro", emoji:"📖" },
      { word:"Shelf", translation:"Prateleira", emoji:"🗄️" },
      { word:"Borrow", translation:"Emprestar", emoji:"🤲" },
      { word:"Return", translation:"Devolver", emoji:"↩️" },
      { word:"Quiet", translation:"Silêncio", emoji:"🤫" },
      { word:"Read", translation:"Ler", emoji:"📚" },
      { word:"Librarian", translation:"Bibliotecário", emoji:"👩‍💼" },
      { word:"Search", translation:"Pesquisar", emoji:"🔍" },
    ]
  },
  {
    id:"weather", title:"Talking About Weather", titlePt:"Falando do Tempo",
    emoji:"🌤️", level:"beginner",
    image:"https://images.unsplash.com/photo-1504608524841-42584120d693?w=800&q=80",
    words:[
      { word:"Sunny", translation:"Ensolarado", emoji:"☀️" },
      { word:"Rainy", translation:"Chuvoso", emoji:"🌧️" },
      { word:"Cloudy", translation:"Nublado", emoji:"☁️" },
      { word:"Cold", translation:"Frio", emoji:"🥶" },
      { word:"Hot", translation:"Quente", emoji:"🥵" },
      { word:"Wind", translation:"Vento", emoji:"💨" },
      { word:"Snow", translation:"Neve", emoji:"❄️" },
      { word:"Umbrella", translation:"Guarda-chuva", emoji:"☂️" },
    ]
  },
  {
    id:"numbers_colors", title:"Numbers and Colors", titlePt:"Números e Cores",
    emoji:"🔢", level:"beginner",
    image:"https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
    words:[
      { word:"One", translation:"Um", emoji:"1️⃣" },
      { word:"Two", translation:"Dois", emoji:"2️⃣" },
      { word:"Red", translation:"Vermelho", emoji:"🔴" },
      { word:"Blue", translation:"Azul", emoji:"🔵" },
      { word:"Green", translation:"Verde", emoji:"🟢" },
      { word:"Yellow", translation:"Amarelo", emoji:"🟡" },
      { word:"Ten", translation:"Dez", emoji:"🔟" },
      { word:"Count", translation:"Contar", emoji:"🧮" },
    ]
  },
  {
    id:"greetings", title:"Daily Greetings", titlePt:"Cumprimentos Diários",
    emoji:"👋", level:"beginner",
    image:"https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80",
    words:[
      { word:"Good morning", translation:"Bom dia", emoji:"🌅" },
      { word:"Good afternoon", translation:"Boa tarde", emoji:"🌤️" },
      { word:"Good night", translation:"Boa noite", emoji:"🌙" },
      { word:"How are you?", translation:"Como vai?", emoji:"🤔" },
      { word:"Fine", translation:"Bem", emoji:"😊" },
      { word:"See you", translation:"Até logo", emoji:"👋" },
      { word:"Please", translation:"Por favor", emoji:"🙏" },
      { word:"Thank you", translation:"Obrigado", emoji:"🙌" },
    ]
  },
  {
    id:"farm", title:"On the Farm", titlePt:"Na Fazenda",
    emoji:"🚜", level:"beginner",
    image:"https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80",
    words:[
      { word:"Cow", translation:"Vaca", emoji:"🐄" },
      { word:"Chicken", translation:"Galinha", emoji:"🐔" },
      { word:"Pig", translation:"Porco", emoji:"🐷" },
      { word:"Horse", translation:"Cavalo", emoji:"🐴" },
      { word:"Tractor", translation:"Trator", emoji:"🚜" },
      { word:"Harvest", translation:"Colheita", emoji:"🌾" },
      { word:"Barn", translation:"Celeiro", emoji:"🏚️" },
      { word:"Farmer", translation:"Fazendeiro", emoji:"👨‍🌾" },
    ]
  },
  {
    id:"sports", title:"Playing Sports", titlePt:"Praticando Esportes",
    emoji:"⚽", level:"beginner",
    image:"https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80",
    words:[
      { word:"Football", translation:"Futebol", emoji:"⚽" },
      { word:"Basketball", translation:"Basquete", emoji:"🏀" },
      { word:"Swimming", translation:"Natação", emoji:"🏊" },
      { word:"Run", translation:"Correr", emoji:"🏃" },
      { word:"Team", translation:"Time", emoji:"👥" },
      { word:"Win", translation:"Ganhar", emoji:"🏆" },
      { word:"Lose", translation:"Perder", emoji:"😢" },
      { word:"Score", translation:"Placar", emoji:"📊" },
    ]
  },
  {
    id:"body_parts", title:"Parts of the Body", titlePt:"Partes do Corpo",
    emoji:"🫀", level:"beginner",
    image:"https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
    words:[
      { word:"Head", translation:"Cabeça", emoji:"🗣️" },
      { word:"Hand", translation:"Mão", emoji:"✋" },
      { word:"Foot", translation:"Pé", emoji:"🦶" },
      { word:"Eye", translation:"Olho", emoji:"👁️" },
      { word:"Ear", translation:"Orelha", emoji:"👂" },
      { word:"Nose", translation:"Nariz", emoji:"👃" },
      { word:"Mouth", translation:"Boca", emoji:"👄" },
      { word:"Heart", translation:"Coração", emoji:"❤️" },
    ]
  },
  // ── INTERMEDIATE EXTRA SCENES ──────────────────────────────────────────────
  {
    id:"job_interview", title:"Job Interview", titlePt:"Entrevista de Emprego",
    emoji:"💼", level:"intermediate",
    image:"https://images.unsplash.com/photo-1565688534245-05d6b5be184a?w=800&q=80",
    words:[
      { word:"Resume", translation:"Currículo", emoji:"📄" },
      { word:"Qualification", translation:"Qualificação", emoji:"🎓" },
      { word:"Salary", translation:"Salário", emoji:"💰" },
      { word:"Position", translation:"Cargo", emoji:"🏢" },
      { word:"Strengths", translation:"Pontos fortes", emoji:"💪" },
      { word:"Experience", translation:"Experiência", emoji:"🏆" },
      { word:"Hire", translation:"Contratar", emoji:"🤝" },
      { word:"Candidate", translation:"Candidato", emoji:"🧑" },
    ]
  },
  {
    id:"travel_hotel", title:"Checking into a Hotel", titlePt:"Check-in no Hotel",
    emoji:"🏨", level:"intermediate",
    image:"https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80",
    words:[
      { word:"Check-in", translation:"Check-in", emoji:"🔑" },
      { word:"Room key", translation:"Chave do quarto", emoji:"🗝️" },
      { word:"Floor", translation:"Andar", emoji:"🏢" },
      { word:"Breakfast included", translation:"Café incluído", emoji:"🥐" },
      { word:"Wi-Fi", translation:"Wi-Fi", emoji:"📶" },
      { word:"Housekeeping", translation:"Limpeza", emoji:"🧹" },
      { word:"Complaint", translation:"Reclamação", emoji:"😤" },
      { word:"Extension", translation:"Extensão de estadia", emoji:"📅" },
    ]
  },
  {
    id:"bank", title:"At the Bank", titlePt:"No Banco",
    emoji:"🏦", level:"intermediate",
    image:"https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?w=800&q=80",
    words:[
      { word:"Account", translation:"Conta", emoji:"💳" },
      { word:"Deposit", translation:"Depósito", emoji:"💵" },
      { word:"Withdraw", translation:"Saque", emoji:"🏧" },
      { word:"Transfer", translation:"Transferência", emoji:"↔️" },
      { word:"Interest", translation:"Juros", emoji:"📈" },
      { word:"Loan", translation:"Empréstimo", emoji:"🤝" },
      { word:"Statement", translation:"Extrato", emoji:"📊" },
      { word:"PIN", translation:"Senha", emoji:"🔐" },
    ]
  },
  {
    id:"pharmacy", title:"At the Pharmacy", titlePt:"Na Farmácia",
    emoji:"💊", level:"intermediate",
    image:"https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80",
    words:[
      { word:"Prescription", translation:"Receita", emoji:"📝" },
      { word:"Dosage", translation:"Dosagem", emoji:"⚖️" },
      { word:"Side effect", translation:"Efeito colateral", emoji:"⚠️" },
      { word:"Generic", translation:"Genérico", emoji:"💊" },
      { word:"Pharmacist", translation:"Farmacêutico", emoji:"👩‍⚕️" },
      { word:"Refill", translation:"Reposição", emoji:"🔄" },
      { word:"Allergy", translation:"Alergia", emoji:"🤧" },
      { word:"Insurance", translation:"Plano de saúde", emoji:"🏥" },
    ]
  },
  {
    id:"car_rental", title:"Renting a Car", titlePt:"Alugando um Carro",
    emoji:"🚗", level:"intermediate",
    image:"https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80",
    words:[
      { word:"Rental", translation:"Aluguel", emoji:"🚗" },
      { word:"License", translation:"Carteira de motorista", emoji:"🪪" },
      { word:"Insurance", translation:"Seguro", emoji:"🛡️" },
      { word:"Mileage", translation:"Quilometragem", emoji:"🛣️" },
      { word:"Fuel", translation:"Combustível", emoji:"⛽" },
      { word:"Return", translation:"Devolver", emoji:"↩️" },
      { word:"Damage", translation:"Dano", emoji:"💥" },
      { word:"Deposit", translation:"Caução", emoji:"💰" },
    ]
  },
  {
    id:"gym", title:"At the Gym", titlePt:"Na Academia",
    emoji:"🏋️", level:"intermediate",
    image:"https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
    words:[
      { word:"Workout", translation:"Treino", emoji:"💪" },
      { word:"Treadmill", translation:"Esteira", emoji:"🏃" },
      { word:"Weight", translation:"Peso", emoji:"🏋️" },
      { word:"Repetition", translation:"Repetição", emoji:"🔄" },
      { word:"Personal trainer", translation:"Personal trainer", emoji:"👨‍🏫" },
      { word:"Stretch", translation:"Alongar", emoji:"🧘" },
      { word:"Membership", translation:"Mensalidade", emoji:"💳" },
      { word:"Progress", translation:"Progresso", emoji:"📈" },
    ]
  },
  {
    id:"real_estate", title:"Renting an Apartment", titlePt:"Alugando um Apartamento",
    emoji:"🏠", level:"intermediate",
    image:"https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
    words:[
      { word:"Landlord", translation:"Proprietário", emoji:"🏠" },
      { word:"Tenant", translation:"Inquilino", emoji:"🧑" },
      { word:"Lease", translation:"Contrato", emoji:"📄" },
      { word:"Deposit", translation:"Caução", emoji:"💰" },
      { word:"Utilities", translation:"Serviços básicos", emoji:"💡" },
      { word:"Neighborhood", translation:"Bairro", emoji:"🏘️" },
      { word:"Maintenance", translation:"Manutenção", emoji:"🔧" },
      { word:"Eviction", translation:"Despejo", emoji:"📦" },
    ]
  },
  {
    id:"cooking_class", title:"Cooking Class", titlePt:"Aula de Culinária",
    emoji:"👨‍🍳", level:"intermediate",
    image:"https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",
    words:[
      { word:"Recipe", translation:"Receita", emoji:"📖" },
      { word:"Ingredient", translation:"Ingrediente", emoji:"🥕" },
      { word:"Chop", translation:"Picar", emoji:"🔪" },
      { word:"Boil", translation:"Ferver", emoji:"♨️" },
      { word:"Season", translation:"Temperar", emoji:"🧂" },
      { word:"Taste", translation:"Provar", emoji:"😋" },
      { word:"Serve", translation:"Servir", emoji:"🍽️" },
      { word:"Portion", translation:"Porção", emoji:"⚖️" },
    ]
  },
  {
    id:"city_directions", title:"Asking for Directions", titlePt:"Pedindo Direções",
    emoji:"🗺️", level:"intermediate",
    image:"https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80",
    words:[
      { word:"Turn left", translation:"Vire à esquerda", emoji:"⬅️" },
      { word:"Turn right", translation:"Vire à direita", emoji:"➡️" },
      { word:"Straight ahead", translation:"Em frente", emoji:"⬆️" },
      { word:"Block", translation:"Quarteirão", emoji:"🏢" },
      { word:"Intersection", translation:"Cruzamento", emoji:"✖️" },
      { word:"Landmark", translation:"Ponto de referência", emoji:"🗿" },
      { word:"Distance", translation:"Distância", emoji:"📏" },
      { word:"Lost", translation:"Perdido", emoji:"😕" },
    ]
  },
  {
    id:"wedding", title:"At a Wedding", titlePt:"Em um Casamento",
    emoji:"💒", level:"intermediate",
    image:"https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
    words:[
      { word:"Bride", translation:"Noiva", emoji:"👰" },
      { word:"Groom", translation:"Noivo", emoji:"🤵" },
      { word:"Ceremony", translation:"Cerimônia", emoji:"💒" },
      { word:"Vows", translation:"Votos", emoji:"📜" },
      { word:"Reception", translation:"Recepção", emoji:"🎊" },
      { word:"Toast", translation:"Brinde", emoji:"🥂" },
      { word:"Dance", translation:"Dançar", emoji:"💃" },
      { word:"Congratulations", translation:"Parabéns", emoji:"🎉" },
    ]
  },
  {
    id:"emergency", title:"Emergency Situation", titlePt:"Situação de Emergência",
    emoji:"🚨", level:"intermediate",
    image:"https://images.unsplash.com/photo-1587745416684-47953f16f02f?w=800&q=80",
    words:[
      { word:"Help!", translation:"Socorro!", emoji:"🆘" },
      { word:"Call 911", translation:"Ligue para o 190", emoji:"📞" },
      { word:"Fire", translation:"Incêndio", emoji:"🔥" },
      { word:"Ambulance", translation:"Ambulância", emoji:"🚑" },
      { word:"Police", translation:"Polícia", emoji:"👮" },
      { word:"Accident", translation:"Acidente", emoji:"💥" },
      { word:"Injured", translation:"Ferido", emoji:"🤕" },
      { word:"Safe", translation:"Seguro", emoji:"🛡️" },
    ]
  },
  {
    id:"technology", title:"Using Technology", titlePt:"Usando Tecnologia",
    emoji:"💻", level:"intermediate",
    image:"https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
    words:[
      { word:"Password", translation:"Senha", emoji:"🔐" },
      { word:"Download", translation:"Baixar", emoji:"⬇️" },
      { word:"Upload", translation:"Enviar", emoji:"⬆️" },
      { word:"Browser", translation:"Navegador", emoji:"🌐" },
      { word:"Software", translation:"Software", emoji:"💿" },
      { word:"Update", translation:"Atualizar", emoji:"🔄" },
      { word:"Crash", translation:"Travar", emoji:"💥" },
      { word:"Backup", translation:"Cópia de segurança", emoji:"💾" },
    ]
  },
  {
    id:"travel_customs", title:"Passing Through Customs", titlePt:"Passando pela Alfândega",
    emoji:"🛃", level:"intermediate",
    image:"https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80",
    words:[
      { word:"Customs", translation:"Alfândega", emoji:"🛃" },
      { word:"Declaration", translation:"Declaração", emoji:"📋" },
      { word:"Duty", translation:"Taxa", emoji:"💸" },
      { word:"Visa", translation:"Visto", emoji:"📘" },
      { word:"Inspection", translation:"Inspeção", emoji:"🔍" },
      { word:"Prohibited", translation:"Proibido", emoji:"🚫" },
      { word:"Declare", translation:"Declarar", emoji:"✋" },
      { word:"Border", translation:"Fronteira", emoji:"🗺️" },
    ]
  },
  // ── ADVANCED EXTRA SCENES ──────────────────────────────────────────────────
  {
    id:"business_meeting", title:"Business Meeting", titlePt:"Reunião de Negócios",
    emoji:"📊", level:"advanced",
    image:"https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80",
    words:[
      { word:"Stakeholder", translation:"Parte interessada", emoji:"🤝" },
      { word:"Quarterly", translation:"Trimestral", emoji:"📅" },
      { word:"Revenue", translation:"Receita", emoji:"💰" },
      { word:"Forecast", translation:"Previsão", emoji:"📈" },
      { word:"Merger", translation:"Fusão", emoji:"🔗" },
      { word:"Acquisition", translation:"Aquisição", emoji:"🏢" },
      { word:"Benchmark", translation:"Referência", emoji:"📊" },
      { word:"Strategy", translation:"Estratégia", emoji:"♟️" },
    ]
  },
  {
    id:"medical_consultation", title:"Medical Consultation", titlePt:"Consulta Médica Especializada",
    emoji:"🩻", level:"advanced",
    image:"https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80",
    words:[
      { word:"Diagnosis", translation:"Diagnóstico", emoji:"🩺" },
      { word:"Prognosis", translation:"Prognóstico", emoji:"📋" },
      { word:"Chronic", translation:"Crônico", emoji:"⏳" },
      { word:"Acute", translation:"Agudo", emoji:"⚡" },
      { word:"Biopsy", translation:"Biópsia", emoji:"🔬" },
      { word:"Oncology", translation:"Oncologia", emoji:"🎗️" },
      { word:"Remission", translation:"Remissão", emoji:"✅" },
      { word:"Immunotherapy", translation:"Imunoterapia", emoji:"💉" },
    ]
  },
  {
    id:"political_debate", title:"Political Debate", titlePt:"Debate Político",
    emoji:"🗳️", level:"advanced",
    image:"https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&q=80",
    words:[
      { word:"Democracy", translation:"Democracia", emoji:"🗳️" },
      { word:"Legislation", translation:"Legislação", emoji:"📜" },
      { word:"Amendment", translation:"Emenda", emoji:"✏️" },
      { word:"Referendum", translation:"Referendo", emoji:"🗳️" },
      { word:"Sovereignty", translation:"Soberania", emoji:"👑" },
      { word:"Constituency", translation:"Eleitorado", emoji:"👥" },
      { word:"Bipartisan", translation:"Bipartidário", emoji:"🤝" },
      { word:"Filibuster", translation:"Obstrução", emoji:"🚧" },
    ]
  },
  {
    id:"scientific_lab", title:"In the Science Lab", titlePt:"No Laboratório Científico",
    emoji:"🔬", level:"advanced",
    image:"https://images.unsplash.com/photo-1532094349884-543559059a2b?w=800&q=80",
    words:[
      { word:"Hypothesis", translation:"Hipótese", emoji:"💡" },
      { word:"Experiment", translation:"Experimento", emoji:"🧪" },
      { word:"Variable", translation:"Variável", emoji:"📊" },
      { word:"Microscope", translation:"Microscópio", emoji:"🔬" },
      { word:"Catalyst", translation:"Catalisador", emoji:"⚗️" },
      { word:"Specimen", translation:"Espécime", emoji:"🧫" },
      { word:"Peer review", translation:"Revisão por pares", emoji:"📝" },
      { word:"Publication", translation:"Publicação", emoji:"📰" },
    ]
  },
  {
    id:"financial_market", title:"Financial Markets", titlePt:"Mercado Financeiro",
    emoji:"📈", level:"advanced",
    image:"https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
    words:[
      { word:"Portfolio", translation:"Carteira", emoji:"💼" },
      { word:"Dividend", translation:"Dividendo", emoji:"💰" },
      { word:"Volatility", translation:"Volatilidade", emoji:"📊" },
      { word:"Hedge", translation:"Proteção", emoji:"🛡️" },
      { word:"Liquidity", translation:"Liquidez", emoji:"💧" },
      { word:"Derivative", translation:"Derivativo", emoji:"📉" },
      { word:"Bull market", translation:"Mercado em alta", emoji:"🐂" },
      { word:"Bear market", translation:"Mercado em baixa", emoji:"🐻" },
    ]
  },
  {
    id:"architecture", title:"Architecture & Design", titlePt:"Arquitetura e Design",
    emoji:"🏛️", level:"advanced",
    image:"https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&q=80",
    words:[
      { word:"Blueprint", translation:"Planta baixa", emoji:"📐" },
      { word:"Facade", translation:"Fachada", emoji:"🏛️" },
      { word:"Sustainable", translation:"Sustentável", emoji:"♻️" },
      { word:"Renovation", translation:"Renovação", emoji:"🔨" },
      { word:"Aesthetic", translation:"Estético", emoji:"🎨" },
      { word:"Structural", translation:"Estrutural", emoji:"🏗️" },
      { word:"Zoning", translation:"Zoneamento", emoji:"🗺️" },
      { word:"Landmark", translation:"Marco histórico", emoji:"🗿" },
    ]
  },
  {
    id:"philosophy", title:"Philosophy Discussion", titlePt:"Discussão Filosófica",
    emoji:"🤔", level:"advanced",
    image:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
    words:[
      { word:"Ethics", translation:"Ética", emoji:"⚖️" },
      { word:"Morality", translation:"Moralidade", emoji:"🧭" },
      { word:"Consciousness", translation:"Consciência", emoji:"🧠" },
      { word:"Paradox", translation:"Paradoxo", emoji:"🔄" },
      { word:"Empiricism", translation:"Empirismo", emoji:"🔬" },
      { word:"Rationalism", translation:"Racionalismo", emoji:"💡" },
      { word:"Existentialism", translation:"Existencialismo", emoji:"🌌" },
      { word:"Dialectic", translation:"Dialética", emoji:"↔️" },
    ]
  },
];

// ─── CEFR Curriculum Mapping ──────────────────────────────────────────────────
const CEFR_ORDER: CEFRLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

const CEFR_STAGE_BY_SCENE: Record<string, CEFRLevel> = {
  family_home: "A1", smith_family: "A1", playground: "A1", bedroom: "A1", kitchen: "A1",
  school_classroom: "A1", birthday_party: "A1", pet_care: "A1", greetings: "A1", numbers_colors: "A1",
  body_parts: "A1",
  airport: "A2", restaurant: "A2", supermarket: "A2", morning_routine: "A2", grocery_shopping: "A2",
  park_walk: "A2", beach_day: "A2", clothing_store: "A2", doctor_visit: "A2", bus_ride: "A2",
  library: "A2", weather: "A2", farm: "A2", sports: "A2",
  office: "B1", hospital: "B1", train_station: "B1", job_interview: "B1", travel_hotel: "B1",
  gym: "B1", cooking_class: "B1", city_directions: "B1", wedding: "B1", emergency: "B1", technology: "B1",
  bank: "B2", pharmacy: "B2", car_rental: "B2", real_estate: "B2", travel_customs: "B2",
  business_meeting: "B2", medical_consultation: "B2",
  university: "C1", courtroom: "C1", conference: "C1", museum: "C1", luxury_hotel: "C1",
  political_debate: "C1", scientific_lab: "C1", financial_market: "C1", architecture: "C1",
  philosophy: "C2",
};

function getSceneCefrLevel(scene: VisualScene): CEFRLevel {
  return CEFR_STAGE_BY_SCENE[scene.id] || "A1";
}

function makeSceneVocabularyCards(cefrLevel: CEFRLevel): MemoryCard[] {
  return VISUAL_SCENES
    .filter((scene) => getSceneCefrLevel(scene) === cefrLevel)
    .flatMap((scene) => scene.words)
    .slice(0, 20)
    .map((word, index) => ({ id: `${cefrLevel.toLowerCase()}-${index + 1}`, ...word, category: `cefr-${cefrLevel.toLowerCase()}` }));
}

const PARETO_CEFR_CARDS: Record<CEFRLevel, MemoryCard[]> = {
  A1: PARETO_BEGINNER.slice(0, 10),
  A2: PARETO_BEGINNER.slice(10),
  B1: PARETO_INTERMEDIATE.slice(0, 10),
  B2: PARETO_INTERMEDIATE.slice(10),
  C1: makeSceneVocabularyCards("C1"),
  C2: makeSceneVocabularyCards("C2"),
};

const CEFR_DISPLAY: Record<CEFRLevel, { color: string; bg: string; border: string; gradient: string; badge: string }> = {
  A1: { color: "text-green-700", bg: "bg-green-50", border: "border-green-300", gradient: "from-green-500 to-emerald-600", badge: "bg-green-600" },
  A2: { color: "text-lime-700", bg: "bg-lime-50", border: "border-lime-300", gradient: "from-lime-500 to-green-600", badge: "bg-lime-600" },
  B1: { color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-300", gradient: "from-blue-500 to-cyan-600", badge: "bg-blue-600" },
  B2: { color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-300", gradient: "from-orange-500 to-amber-600", badge: "bg-orange-600" },
  C1: { color: "text-violet-700", bg: "bg-violet-50", border: "border-violet-300", gradient: "from-violet-500 to-purple-600", badge: "bg-violet-600" },
  C2: { color: "text-pink-700", bg: "bg-pink-50", border: "border-pink-300", gradient: "from-pink-500 to-rose-600", badge: "bg-pink-600" },
};

const LEVELS = CEFR_ORDER.map((id) => ({
  id,
  label: id,
  sublabel: CEFR_CONFIGS[id].label,
  emoji: CEFR_CONFIGS[id].icon,
  description: CEFR_CONFIGS[id].description,
  topics: CEFR_CONFIGS[id].topics,
  xpPerLesson: Math.max(10, Math.round((CEFR_CONFIGS[id].xpToAdvance || 10000) / 100)),
  ...CEFR_DISPLAY[id],
}));

// ─── Flashcard Game ────────────────────────────────────────────────────────────
function FlashcardGame({ cards, onComplete }: { cards: MemoryCard[]; onComplete: (xp: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);

  const card = cards[idx];

  function handleAnswer(knew: boolean) {
    if (knew) setCorrect(c => c + 1);
    if (idx + 1 >= cards.length) {
      setDone(true);
    } else {
      setIdx(i => i + 1);
      setFlipped(false);
    }
  }

  if (done) {
    const xp = correct * 5;
    return (
      <div className="text-center py-10">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-2xl font-bold mb-2">Parabéns!</h3>
        <p className="text-gray-600 mb-4">{correct}/{cards.length} palavras dominadas</p>
        <div className="text-3xl font-bold text-yellow-500 mb-6">+{xp} XP</div>
        <Button onClick={() => onComplete(xp)} className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl text-lg">
          Continuar →
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-gray-500">{idx + 1} / {cards.length}</span>
        <Progress value={((idx) / cards.length) * 100} className="flex-1 mx-4 h-2" />
        <span className="text-sm font-medium text-green-600">{correct} ✓</span>
      </div>

      {/* Card */}
      <div
        className="relative h-52 cursor-pointer"
        onClick={() => setFlipped(f => !f)}
        style={{ perspective: "1000px" }}
      >
        <div
          className="absolute inset-0 rounded-2xl shadow-lg flex flex-col items-center justify-center transition-all duration-500"
          style={{
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex flex-col items-center justify-center text-white"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="text-5xl mb-3">{card.emoji}</div>
            <div className="text-2xl font-bold">{card.word}</div>
            <div className="text-sm opacity-75 mt-2">Toque para revelar</div>
          </div>
          {/* Back */}
          <div
            className="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex flex-col items-center justify-center text-white"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <div className="text-5xl mb-3">{card.emoji}</div>
            <div className="text-2xl font-bold">{card.translation}</div>
            <div className="text-sm opacity-75 mt-2">{card.word}</div>
          </div>
        </div>
      </div>

      {flipped && (
        <div className="flex gap-4 mt-6 justify-center">
          <Button
            onClick={() => handleAnswer(false)}
            variant="outline"
            className="flex-1 border-red-300 text-red-600 hover:bg-red-50 py-3 rounded-xl text-base"
          >
            😕 Não sabia
          </Button>
          <Button
            onClick={() => handleAnswer(true)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl text-base"
          >
            😊 Sabia!
          </Button>
        </div>
      )}
      {!flipped && (
        <p className="text-center text-gray-400 mt-4 text-sm">Toque no cartão para ver a tradução</p>
      )}
    </div>
  );
}

// ─── Match Pairs Game ──────────────────────────────────────────────────────────
function MatchPairsGame({ cards, onComplete }: { cards: MemoryCard[]; onComplete: (xp: number) => void }) {
  const subset = cards.slice(0, 6);
  const [selected, setSelected] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [errors, setErrors] = useState(0);

  // Build pairs: word tiles + translation tiles
  const wordTiles = subset.map(c => ({ id: `w-${c.id}`, text: `${c.emoji} ${c.word}`, pairId: c.id }));
  const transTiles = subset.map(c => ({ id: `t-${c.id}`, text: c.translation, pairId: c.id }));
  const [tiles] = useState(() => {
    const all = [...wordTiles, ...transTiles];
    return all.sort(() => Math.random() - 0.5);
  });

  function handleTile(tileId: string, pairId: string) {
    if (matched.includes(pairId)) return;
    if (selected.includes(tileId)) return;

    const newSel = [...selected, tileId];
    if (newSel.length === 2) {
      const [a, b] = newSel;
      const pairA = tiles.find(t => t.id === a)?.pairId;
      const pairB = tiles.find(t => t.id === b)?.pairId;
      if (pairA === pairB) {
        setMatched(m => [...m, pairA!]);
        setSelected([]);
      } else {
        setErrors(e => e + 1);
        setTimeout(() => setSelected([]), 800);
      }
    } else {
      setSelected(newSel);
    }
  }

  const done = matched.length === subset.length;
  const xp = Math.max(0, 30 - errors * 3);

  if (done) {
    return (
      <div className="text-center py-10">
        <div className="text-6xl mb-4">🎯</div>
        <h3 className="text-2xl font-bold mb-2">Perfeito!</h3>
        <p className="text-gray-600 mb-4">Todos os pares encontrados! {errors > 0 ? `(${errors} erros)` : "Sem erros!"}</p>
        <div className="text-3xl font-bold text-yellow-500 mb-6">+{xp} XP</div>
        <Button onClick={() => onComplete(xp)} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl text-lg">
          Continuar →
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-gray-500">{matched.length}/{subset.length} pares</span>
        <span className="text-sm text-red-500">{errors} erros</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {tiles.map(tile => {
          const isMatched = matched.includes(tile.pairId);
          const isSelected = selected.includes(tile.id);
          return (
            <button
              key={tile.id}
              onClick={() => handleTile(tile.id, tile.pairId)}
              className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 min-h-[56px] ${
                isMatched
                  ? "bg-green-100 border-2 border-green-400 text-green-700 scale-95"
                  : isSelected
                  ? "bg-blue-100 border-2 border-blue-500 text-blue-700 scale-105 shadow-md"
                  : "bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-300 hover:scale-102"
              }`}
            >
              {tile.text}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Fill in the Blank ─────────────────────────────────────────────────────────
function FillBlankGame({ cards, onComplete }: { cards: MemoryCard[]; onComplete: (xp: number) => void }) {
  const subset = cards.slice(0, 8);
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [score, setScore] = useState(0);

  const card = subset[idx];
  const sentences = [
    `A palavra em inglês para "${card.translation}" é _____.`,
    `Como se diz "${card.translation}" em inglês?`,
    `Complete: ${card.emoji} = _____ (em inglês)`,
  ];
  const sentence = sentences[idx % sentences.length];

  function checkAnswer() {
    const correct = input.trim().toLowerCase() === card.word.toLowerCase();
    setFeedback(correct ? "correct" : "wrong");
    if (correct) setScore(s => s + 1);
    setTimeout(() => {
      if (idx + 1 >= subset.length) {
        onComplete(score * 4);
      } else {
        setIdx(i => i + 1);
        setInput("");
        setFeedback(null);
      }
    }, 1200);
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-gray-500">{idx + 1} / {subset.length}</span>
        <Progress value={(idx / subset.length) * 100} className="flex-1 mx-4 h-2" />
        <span className="text-sm font-medium text-green-600">{score} ✓</span>
      </div>

      <div className={`rounded-2xl p-6 mb-4 transition-colors ${
        feedback === "correct" ? "bg-green-50 border-2 border-green-400"
        : feedback === "wrong" ? "bg-red-50 border-2 border-red-400"
        : "bg-gray-50 border-2 border-gray-200"
      }`}>
        <div className="text-4xl text-center mb-3">{card.emoji}</div>
        <p className="text-lg text-center text-gray-700 mb-4">{sentence}</p>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !feedback && checkAnswer()}
          placeholder="Digite em inglês..."
          disabled={!!feedback}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:outline-none text-center text-lg"
        />
        {feedback === "wrong" && (
          <p className="text-center text-red-600 mt-2 font-medium">Resposta correta: <strong>{card.word}</strong></p>
        )}
        {feedback === "correct" && (
          <p className="text-center text-green-600 mt-2 font-medium">✅ Correto!</p>
        )}
      </div>

      {!feedback && (
        <Button
          onClick={checkAnswer}
          disabled={!input.trim()}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl text-base"
        >
          Verificar →
        </Button>
      )}
    </div>
  );
}

// ─── Scene Lesson ──────────────────────────────────────────────────────────────
function SceneLesson({ scene, cefrLevel, curricularLessonNumber, onComplete }: { scene: VisualScene; cefrLevel: CEFRLevel; curricularLessonNumber: number; onComplete: (xp: number) => void }) {
  const [revealed, setRevealed] = useState<string[]>([]);
  const [lessonStep, setLessonStep] = useState<"intro" | "vocabulary" | "dialogue" | "practice" | "review">("intro");
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [practiceAnswer, setPracticeAnswer] = useState("");
  const [practiceResult, setPracticeResult] = useState<"correct" | "retry" | null>(null);

  function revealWord(id: string) {
    if (!revealed.includes(id)) setRevealed(r => [...r, id]);
  }

  function speakWord(text: string) {
    speakNaturalVoice(text, 'en-US', { rate: 0.85 });
  }

  const vocabularyDone = revealed.length >= scene.words.length;
  const progress = Math.round((revealed.length / scene.words.length) * 100);
  const cefrDisplay = CEFR_DISPLAY[cefrLevel];
  const practiceWord = scene.words[practiceIndex];
  const lessonSteps = [
    { id: "intro", label: "1. Apresentação" },
    { id: "vocabulary", label: "2. Vocabulário" },
    { id: "dialogue", label: "3. Diálogo" },
    { id: "practice", label: "4. Prática" },
    { id: "review", label: "5. Revisão" },
  ] as const;

  function checkPracticeAnswer() {
    if (!practiceWord || !practiceAnswer.trim()) return;
    const isCorrect = practiceAnswer.trim().toLocaleLowerCase() === practiceWord.word.toLocaleLowerCase();
    setPracticeResult(isCorrect ? "correct" : "retry");
    if (!isCorrect) return;
    speakWord(practiceWord.word);
    window.setTimeout(() => {
      setPracticeResult(null);
      setPracticeAnswer("");
      if (practiceIndex < scene.words.length - 1) setPracticeIndex(index => index + 1);
      else setLessonStep("review");
    }, 700);
  }

  return (
    <div className="space-y-4">
      {/* Scene Image — tall, immersive */}
      <div className="relative rounded-2xl overflow-hidden" style={{ height: "260px" }}>
        <img src={scene.image} alt={scene.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        {/* Lesson number badge */}
        {curricularLessonNumber > 0 && (
          <div className="absolute top-3 left-3 bg-white/90 text-gray-800 text-xs font-bold px-2.5 py-1 rounded-full shadow">
            Aula {cefrLevel}.{curricularLessonNumber}
          </div>
        )}
        {/* Level badge */}
        <div className={`absolute top-3 right-3 ${cefrDisplay.badge} text-white text-xs font-bold px-2.5 py-1 rounded-full shadow`}>
          {cefrLevel} · {CEFR_CONFIGS[cefrLevel].label}
        </div>
        {/* Title */}
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <div className="text-2xl font-bold drop-shadow">{scene.emoji} {scene.titlePt}</div>
          <div className="text-sm opacity-80 italic">{scene.title}</div>
          {scene.teacher && (
            <div className="text-xs mt-1 opacity-70">👩‍🏫 Prof. {scene.teacher}</div>
          )}
        </div>
        {/* Audio button */}
        <button
          onClick={() => speakWord(scene.title)}
          className="absolute bottom-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur rounded-full flex items-center justify-center text-white transition-all"
          title="Ouvir título em inglês"
        >
          🔊
        </button>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Vocabulário aprendido</span>
          <span>{revealed.length}/{scene.words.length} palavras</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Roteiro didático contínuo: a aula segue uma ordem única e visível. */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-3">
        <div className="mb-2 text-xs font-bold uppercase tracking-wide text-blue-700">Roteiro desta aula</div>
        <div className="flex flex-wrap gap-1.5">
          {lessonSteps.map((item, index) => {
            const isActive = item.id === lessonStep;
            const isDone = lessonSteps.findIndex(step => step.id === lessonStep) > index;
            return (
              <span key={item.id} className={`rounded-full px-2 py-1 text-[11px] font-semibold ${isActive ? "bg-blue-600 text-white" : isDone ? "bg-green-100 text-green-700" : "bg-white text-gray-400"}`}>
                {item.label}
              </span>
            );
          })}
        </div>
      </div>

      {lessonStep === "intro" && (
        <div className="rounded-2xl border border-purple-100 bg-purple-50 p-4 text-center">
          <div className="mb-2 text-sm font-bold text-purple-800">{scene.teacher || "Professor"} apresenta a aula</div>
          <p className="mb-3 text-sm leading-6 text-purple-900">Nesta cena, você vai aprender as palavras dos objetos, acompanhar um diálogo curto e responder perguntas usando o vocabulário estudado.</p>
          <Button onClick={() => setLessonStep("vocabulary")} className="bg-purple-600 text-white hover:bg-purple-700">Começar vocabulário</Button>
        </div>
      )}

      {/* Vocabulary Grid */}
      {lessonStep === "vocabulary" && (
        <>
          <p className="text-sm text-gray-500 text-center">Toque em cada palavra para revelar a tradução</p>
          <div className="grid grid-cols-2 gap-3">
            {scene.words.map(w => {
              const isRevealed = revealed.includes(w.word);
              return (
                <button
                  key={w.word}
                  onClick={() => { revealWord(w.word); speakWord(w.word); }}
                  className={`p-3 rounded-xl text-left transition-all duration-300 active:scale-95 ${
                    isRevealed
                      ? "bg-green-50 border-2 border-green-400 shadow-sm"
                      : "bg-white border-2 border-gray-200 hover:border-blue-300 hover:shadow-sm"
                  }`}
                >
                  <div className="text-2xl mb-1">{w.emoji}</div>
                  <div className="font-bold text-sm text-gray-800">{w.word}</div>
                  {isRevealed ? (
                    <div className="text-xs text-green-600 font-medium mt-0.5">{w.translation}</div>
                  ) : (
                    <div className="text-xs text-gray-400 mt-0.5">Toque para revelar</div>
                  )}
                  {isRevealed && (
                    <button
                      onClick={e => { e.stopPropagation(); speakWord(w.word); }}
                      className="mt-1 text-xs text-blue-500 hover:text-blue-700"
                    >
                      🔊 Ouvir
                    </button>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}

      {lessonStep === "dialogue" && scene.dialogues && scene.dialogues.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500 text-center">Acompanhe cada fala antes de avançar</p>
          {scene.dialogues.slice(0, dialogueIndex + 1).map((d, i) => (
            <div
              key={i}
              className={`flex gap-3 ${
                i % 2 === 0 ? "flex-row" : "flex-row-reverse"
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {d.speaker[0]}
              </div>
              <div className={`flex-1 rounded-2xl p-3 ${
                i % 2 === 0 ? "bg-blue-50 rounded-tl-none" : "bg-purple-50 rounded-tr-none"
              }`}>
                <div className="text-xs font-bold text-gray-500 mb-1">{d.speaker}</div>
                <div className="font-medium text-gray-800">{d.text}</div>
                <div className="text-xs text-gray-500 italic mt-1">{d.translation}</div>
                <button
                  onClick={() => speakWord(d.text)}
                  className="mt-1 text-xs text-blue-500 hover:text-blue-700"
                >
                  🔊 Ouvir
                </button>
              </div>
            </div>
          ))}
          <div className="flex justify-between gap-3 pt-2">
            <Button variant="outline" onClick={() => dialogueIndex > 0 && setDialogueIndex(index => index - 1)} disabled={dialogueIndex === 0}>Repetir fala</Button>
            {dialogueIndex < scene.dialogues.length - 1 ? (
              <Button onClick={() => setDialogueIndex(index => index + 1)} className="bg-purple-600 text-white hover:bg-purple-700">Próxima fala</Button>
            ) : (
              <Button onClick={() => setLessonStep("practice")} className="bg-green-600 text-white hover:bg-green-700">Praticar vocabulário</Button>
            )}
          </div>
        </div>
      )}

      {lessonStep === "vocabulary" && vocabularyDone && (
        <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-4 text-center">
          <div className="text-3xl mb-2">🎉</div>
          <div className="text-green-700 font-bold text-lg mb-1">Vocabulário concluído</div>
          <div className="text-green-600 text-sm mb-4">Agora use as mesmas palavras no diálogo da cena.</div>
          <Button onClick={() => setLessonStep("dialogue")} className="bg-green-600 hover:bg-green-700 text-white">Continuar para o diálogo</Button>
        </div>
      )}

      {lessonStep === "practice" && practiceWord && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="mb-1 text-xs font-bold uppercase tracking-wide text-amber-700">Prática de memorização {practiceIndex + 1}/{scene.words.length}</div>
          <div className="mb-2 text-lg font-bold text-amber-900">Como se diz “{practiceWord.translation}” em inglês?</div>
          <p className="mb-4 text-sm text-amber-800">Responda usando a palavra estudada nesta cena.</p>
          <div className="flex gap-2">
            <input value={practiceAnswer} onChange={event => setPracticeAnswer(event.target.value)} onKeyDown={event => event.key === "Enter" && checkPracticeAnswer()} placeholder="Digite a palavra" className="min-w-0 flex-1 rounded-xl border border-amber-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-amber-500" />
            <Button onClick={checkPracticeAnswer} className="bg-amber-600 text-white hover:bg-amber-700">Conferir</Button>
          </div>
          <button onClick={() => speakWord(practiceWord.word)} className="mt-3 text-sm font-semibold text-amber-700 hover:text-amber-900">🔊 Ouvir novamente</button>
          {practiceResult === "correct" && <p className="mt-3 font-semibold text-green-700">Correto. Muito bem!</p>}
          {practiceResult === "retry" && <p className="mt-3 font-semibold text-red-700">Ainda não. Ouça novamente e tente outra vez.</p>}
        </div>
      )}

      {lessonStep === "review" && (
        <div className="rounded-2xl border-2 border-green-300 bg-green-50 p-5 text-center">
          <div className="mb-2 text-3xl">🏁</div>
          <div className="text-lg font-bold text-green-800">Revisão concluída</div>
          <p className="mt-2 text-sm text-green-700">Você estudou {scene.words.length} palavras, acompanhou o diálogo e respondeu à prática de memorização desta aula.</p>
          <Button onClick={() => onComplete(35)} className="mt-4 bg-green-600 text-white hover:bg-green-700">Concluir aula e continuar</Button>
        </div>
      )}
    </div>
  );
}

// ─── Main LessonsHub Page ──────────────────────────────────────────────────────
export default function LessonsHub() {
  const [location, setLocation] = useLocation();
  const requestedReturnTo = new URLSearchParams(location.split("?")[1] ?? "").get("returnTo");
  const lessonsReturnTo = requestedReturnTo?.startsWith("/base-de-estudos") ? requestedReturnTo : "/dashboard";
  const { profile } = useLanguage();
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel>(() => {
    const saved = localStorage.getItem("lessonsHub_cefr");
    return CEFR_ORDER.includes(saved as CEFRLevel) ? saved as CEFRLevel : "A1";
  });
  const [activeGame, setActiveGame] = useState<{ type: GameType; sceneId?: string } | null>(null);
  const [totalXP, setTotalXP] = useState(() => parseInt(localStorage.getItem("lessonsHub_xp") || "0"));
  const [completedGames, setCompletedGames] = useState<string[]>(() =>
    JSON.parse(localStorage.getItem("lessonsHub_completed") || "[]")
  );
  const [streak, setStreak] = useState(() => parseInt(localStorage.getItem("lessonsHub_streak") || "0"));

  const level = LEVELS.find(l => l.id === selectedLevel)!;
  const cards = PARETO_CEFR_CARDS[selectedLevel];
  const scenes = VISUAL_SCENES.filter((scene) => getSceneCefrLevel(scene) === selectedLevel);

  function selectLevel(cefrLevel: CEFRLevel) {
    localStorage.setItem("lessonsHub_cefr", cefrLevel);
    setSelectedLevel(cefrLevel);
  }

  function handleGameComplete(xp: number, gameKey: string) {
    const newXP = totalXP + xp;
    const newCompleted = [...completedGames, gameKey];
    const newStreak = streak + 1;
    setTotalXP(newXP);
    setCompletedGames(newCompleted);
    setStreak(newStreak);
    localStorage.setItem("lessonsHub_xp", String(newXP));
    localStorage.setItem("lessonsHub_completed", JSON.stringify(newCompleted));
    localStorage.setItem("lessonsHub_streak", String(newStreak));
    setActiveGame(null);
  }

  // ── Active Game View ──
  if (activeGame) {
    const gameKey = `${selectedLevel}-${activeGame.type}-${activeGame.sceneId || ""}`;
    const scene = activeGame.sceneId ? VISUAL_SCENES.find(s => s.id === activeGame.sceneId) : null;
    const curricularLessonNumber = scene ? scenes.findIndex((item) => item.id === scene.id) + 1 : 0;

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-lg mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setActiveGame(null)}
              className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              ←
            </button>
            <div className="flex-1">
              <div className="font-bold text-gray-800">
                {activeGame.type === "flashcard" && "🃏 Flashcards"}
                {activeGame.type === "match" && "🎯 Conectar Pares"}
                {activeGame.type === "fill" && "✏️ Preencher Lacunas"}
                {activeGame.type === "scene" && `🖼️ Aula ${selectedLevel}.${curricularLessonNumber} · ${scene?.titlePt}`}
              </div>
              <div className="text-xs text-gray-500">{level.label} · {level.sublabel} • {profile.targetName || "Inglês"}</div>
            </div>
            <div className="text-sm font-bold text-yellow-600">⚡ {totalXP} XP</div>
          </div>

          {/* Game */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            {activeGame.type === "flashcard" && (
              <FlashcardGame cards={cards} onComplete={xp => handleGameComplete(xp, gameKey)} />
            )}
            {activeGame.type === "match" && (
              <MatchPairsGame cards={cards} onComplete={xp => handleGameComplete(xp, gameKey)} />
            )}
            {activeGame.type === "fill" && (
              <FillBlankGame cards={cards} onComplete={xp => handleGameComplete(xp, gameKey)} />
            )}
            {activeGame.type === "scene" && scene && (
              <SceneLesson scene={scene} cefrLevel={selectedLevel} curricularLessonNumber={curricularLessonNumber} onComplete={xp => handleGameComplete(xp, gameKey)} />
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Hub View ──
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setLocation(lessonsReturnTo)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Voltar
          </button>
          <div className="font-bold text-gray-800">📚 Trilhas de Aulas</div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-orange-500 font-bold">🔥 {streak}</span>
            <span className="text-yellow-600 font-bold">⚡ {totalXP} XP</span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* Level Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {LEVELS.map(l => (
            <button
              key={l.id}
              onClick={() => selectLevel(l.id)}
              className={`p-3 rounded-2xl border-2 transition-all duration-200 text-left ${
                selectedLevel === l.id
                  ? `${l.bg} ${l.border} shadow-md scale-105`
                  : "bg-white border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="text-2xl mb-1">{l.emoji}</div>
              <div className={`font-bold text-sm ${selectedLevel === l.id ? l.color : "text-gray-700"}`}>{l.label}</div>
              <div className="text-xs text-gray-400">{l.sublabel}</div>
            </button>
          ))}
        </div>

        {/* Level Info */}
        <div className={`rounded-2xl p-4 ${level.bg} border ${level.border}`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{level.emoji}</span>
            <span className={`font-bold ${level.color}`}>{level.label} — {level.sublabel}</span>
          </div>
          <p className="text-sm text-gray-600 mb-2">{level.description}</p>
          <div className="flex flex-wrap gap-1">
            {level.topics.map(t => (
              <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
            ))}
          </div>
        </div>

        {/* Visual Scenes Section */}
        {scenes.length > 0 && (
          <div>
            <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span>🖼️</span> Aulas {selectedLevel} — sequência curricular
              <Badge variant="secondary" className="text-xs">{scenes.length} aulas</Badge>
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {scenes.map((scene, index) => {
                const gameKey = `${selectedLevel}-scene-${scene.id}`;
                const done = completedGames.includes(gameKey);
                const curricularLessonNumber = index + 1;
                return (
                  <button
                    key={scene.id}
                    onClick={() => setActiveGame({ type: "scene", sceneId: scene.id })}
                    className="relative rounded-2xl overflow-hidden text-left hover:scale-[1.01] transition-transform shadow-sm"
                    style={{ height: "120px" }}
                  >
                    <img src={scene.image} alt={scene.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/20" />
                    <div className="absolute inset-0 p-4 flex items-center justify-between">
                      <div className="text-white">
                        <div className="inline-flex rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-bold mb-1">Aula {selectedLevel}.{curricularLessonNumber}</div>
                        <div className="text-xl font-bold">{scene.emoji} {scene.titlePt}</div>
                        <div className="text-sm opacity-80">{scene.words.length} palavras • +25 XP</div>
                      </div>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${done ? "bg-green-500" : "bg-white/20 border-2 border-white"}`}>
                        {done ? "✓" : "▶"}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Memory Games Section */}
        <div>
          <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span>🎮</span> Exercícios de Memorização
            <Badge className={`text-xs bg-gradient-to-r ${level.gradient} text-white border-0`}>
              +{level.xpPerLesson} XP cada
            </Badge>
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {[
              {
                type: "flashcard" as GameType,
                title: "🃏 Flashcards",
                desc: `${cards.length} palavras Pareto — vire o cartão e teste sua memória`,
                xp: 50, time: "5 min",
                color: "from-indigo-500 to-purple-600",
              },
              {
                type: "match" as GameType,
                title: "🎯 Conectar Pares",
                desc: "Conecte a palavra em inglês com a tradução em português",
                xp: 30, time: "3 min",
                color: "from-blue-500 to-cyan-600",
              },
              {
                type: "fill" as GameType,
                title: "✏️ Preencher Lacunas",
                desc: "Escreva a palavra correta em inglês a partir da dica em português",
                xp: 40, time: "4 min",
                color: "from-orange-500 to-red-500",
              },
            ].map(game => {
              const gameKey = `${selectedLevel}-${game.type}-`;
              const done = completedGames.includes(gameKey);
              return (
                <button
                  key={game.type}
                  onClick={() => setActiveGame({ type: game.type })}
                  className="bg-white rounded-2xl border border-gray-200 p-4 text-left hover:shadow-md hover:scale-[1.01] transition-all duration-200 flex items-center gap-4"
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${game.color} flex items-center justify-center text-2xl flex-shrink-0 shadow-sm`}>
                    {game.type === "flashcard" ? "🃏" : game.type === "match" ? "🎯" : "✏️"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-800">{game.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">{game.desc}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-yellow-600 font-medium">+{game.xp} XP</span>
                      <span className="text-xs text-gray-400">• {game.time}</span>
                    </div>
                  </div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${done ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                    {done ? "✓" : "▶"}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Go to Full Lessons */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-5 text-white">
          <div className="font-bold text-lg mb-1">📖 Aulas Completas com Professor</div>
          <p className="text-sm text-gray-300 mb-4">
            Continue com aulas estruturadas, professor virtual com voz neural e exercícios avançados.
          </p>
          <div className="flex gap-3">
            <Button
              onClick={() => setLocation("/dashboard")}
              className="bg-white text-gray-900 hover:bg-gray-100 font-bold"
            >
              Ver Aulas →
            </Button>
            <Button
              onClick={() => setLocation("/ar-teacher")}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
            >
              🎓 Professor IA
            </Button>
          </div>
        </div>

        {/* Pareto Vocabulary Preview */}
        <div>
          <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span>📊</span> Vocabulário do estágio — {level.label}
            <span className="text-xs text-gray-400">({cards.length} palavras curriculares)</span>
          </h2>
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {cards.map(card => (
                <div key={card.id} className="flex items-center gap-2 py-1.5 border-b border-gray-50 last:border-0">
                  <span className="text-lg">{card.emoji}</span>
                  <div>
                    <div className="text-sm font-medium text-gray-800">{card.word}</div>
                    <div className="text-xs text-gray-500">{card.translation}</div>
                  </div>
                </div>
              ))}
            </div>
            <Button
              onClick={() => setLocation("/dashboard")}
              variant="outline"
              className="w-full mt-3 text-sm"
            >
              Ver vocabulário completo (1.100 palavras) →
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
