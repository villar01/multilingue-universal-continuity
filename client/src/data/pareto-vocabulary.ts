/**
 * SISTEMA PARETO DE VOCABULÁRIO
 * 
 * Estrutura: 6 níveis progressivos, 200 palavras por nível
 * Total base: 1200 palavras
 * Crescimento: +200 palavras por dia (desbloqueio automático)
 * Níveis: Primário → Fundamental → Intermediário → Avançado → Profissional → Científico
 * 
 * Cada palavra tem:
 * - word: a palavra no idioma alvo (en-US como referência)
 * - ptBR: tradução em português
 * - level: 1-6 (primário ao científico)
 * - category: categoria temática
 * - frequency: frequência de uso (1=mais comum)
 * - ipa: pronúncia IPA
 * - example: frase exemplo
 * - examplePt: frase exemplo em português
 */

export type VocabLevel = 1 | 2 | 3 | 4 | 5 | 6;

export const LEVEL_NAMES: Record<VocabLevel, { name: string; color: string; icon: string }> = {
  1: { name: "Primário", color: "#22c55e", icon: "🌱" },
  2: { name: "Fundamental", color: "#3b82f6", icon: "📚" },
  3: { name: "Intermediário", color: "#f59e0b", icon: "🎓" },
  4: { name: "Avançado", color: "#ef4444", icon: "🏆" },
  5: { name: "Profissional", color: "#8b5cf6", icon: "💼" },
  6: { name: "Científico", color: "#06b6d4", icon: "🔬" },
};

export interface VocabWord {
  id: number;
  word: string;
  ptBR: string;
  level: VocabLevel;
  category: string;
  frequency: number;
  ipa: string;
  example: string;
  examplePt: string;
}

// ============================================================
// NÍVEL 1 — PRIMÁRIO (palavras 1-200)
// As 200 palavras mais usadas no dia a dia
// ============================================================
export const LEVEL1_WORDS: VocabWord[] = [
  // Artigos e pronomes
  { id:1, word:"the", ptBR:"o/a", level:1, category:"artigos", frequency:1, ipa:"ðə", example:"The cat is here.", examplePt:"O gato está aqui." },
  { id:2, word:"a", ptBR:"um/uma", level:1, category:"artigos", frequency:2, ipa:"ə", example:"A dog ran.", examplePt:"Um cachorro correu." },
  { id:3, word:"I", ptBR:"eu", level:1, category:"pronomes", frequency:3, ipa:"aɪ", example:"I am happy.", examplePt:"Eu estou feliz." },
  { id:4, word:"you", ptBR:"você", level:1, category:"pronomes", frequency:4, ipa:"juː", example:"You are kind.", examplePt:"Você é gentil." },
  { id:5, word:"he", ptBR:"ele", level:1, category:"pronomes", frequency:5, ipa:"hiː", example:"He is tall.", examplePt:"Ele é alto." },
  { id:6, word:"she", ptBR:"ela", level:1, category:"pronomes", frequency:6, ipa:"ʃiː", example:"She is smart.", examplePt:"Ela é inteligente." },
  { id:7, word:"we", ptBR:"nós", level:1, category:"pronomes", frequency:7, ipa:"wiː", example:"We are friends.", examplePt:"Nós somos amigos." },
  { id:8, word:"they", ptBR:"eles/elas", level:1, category:"pronomes", frequency:8, ipa:"ðeɪ", example:"They are here.", examplePt:"Eles estão aqui." },
  { id:9, word:"it", ptBR:"isso/ele/ela (coisa)", level:1, category:"pronomes", frequency:9, ipa:"ɪt", example:"It is cold.", examplePt:"Está frio." },
  { id:10, word:"my", ptBR:"meu/minha", level:1, category:"pronomes", frequency:10, ipa:"maɪ", example:"My name is Ana.", examplePt:"Meu nome é Ana." },
  // Verbos essenciais
  { id:11, word:"be", ptBR:"ser/estar", level:1, category:"verbos", frequency:11, ipa:"biː", example:"I want to be happy.", examplePt:"Quero ser feliz." },
  { id:12, word:"have", ptBR:"ter", level:1, category:"verbos", frequency:12, ipa:"hæv", example:"I have a book.", examplePt:"Eu tenho um livro." },
  { id:13, word:"do", ptBR:"fazer", level:1, category:"verbos", frequency:13, ipa:"duː", example:"I do my homework.", examplePt:"Eu faço minha lição." },
  { id:14, word:"say", ptBR:"dizer", level:1, category:"verbos", frequency:14, ipa:"seɪ", example:"What did you say?", examplePt:"O que você disse?" },
  { id:15, word:"go", ptBR:"ir", level:1, category:"verbos", frequency:15, ipa:"ɡoʊ", example:"Let's go home.", examplePt:"Vamos para casa." },
  { id:16, word:"get", ptBR:"pegar/obter", level:1, category:"verbos", frequency:16, ipa:"ɡɛt", example:"Get the ball.", examplePt:"Pegue a bola." },
  { id:17, word:"make", ptBR:"fazer/criar", level:1, category:"verbos", frequency:17, ipa:"meɪk", example:"Make a cake.", examplePt:"Faça um bolo." },
  { id:18, word:"know", ptBR:"saber/conhecer", level:1, category:"verbos", frequency:18, ipa:"noʊ", example:"I know the answer.", examplePt:"Eu sei a resposta." },
  { id:19, word:"think", ptBR:"pensar", level:1, category:"verbos", frequency:19, ipa:"θɪŋk", example:"I think it's true.", examplePt:"Acho que é verdade." },
  { id:20, word:"see", ptBR:"ver", level:1, category:"verbos", frequency:20, ipa:"siː", example:"I can see the sky.", examplePt:"Posso ver o céu." },
  { id:21, word:"come", ptBR:"vir", level:1, category:"verbos", frequency:21, ipa:"kʌm", example:"Come here please.", examplePt:"Venha aqui por favor." },
  { id:22, word:"want", ptBR:"querer", level:1, category:"verbos", frequency:22, ipa:"wɒnt", example:"I want water.", examplePt:"Eu quero água." },
  { id:23, word:"look", ptBR:"olhar", level:1, category:"verbos", frequency:23, ipa:"lʊk", example:"Look at the stars.", examplePt:"Olhe para as estrelas." },
  { id:24, word:"use", ptBR:"usar", level:1, category:"verbos", frequency:24, ipa:"juːz", example:"Use a pen.", examplePt:"Use uma caneta." },
  { id:25, word:"find", ptBR:"encontrar", level:1, category:"verbos", frequency:25, ipa:"faɪnd", example:"Find your keys.", examplePt:"Encontre suas chaves." },
  { id:26, word:"give", ptBR:"dar", level:1, category:"verbos", frequency:26, ipa:"ɡɪv", example:"Give me a hug.", examplePt:"Me dê um abraço." },
  { id:27, word:"tell", ptBR:"contar/dizer", level:1, category:"verbos", frequency:27, ipa:"tɛl", example:"Tell me a story.", examplePt:"Me conte uma história." },
  { id:28, word:"work", ptBR:"trabalhar", level:1, category:"verbos", frequency:28, ipa:"wɜːrk", example:"I work every day.", examplePt:"Eu trabalho todo dia." },
  { id:29, word:"call", ptBR:"chamar/ligar", level:1, category:"verbos", frequency:29, ipa:"kɔːl", example:"Call me later.", examplePt:"Me ligue mais tarde." },
  { id:30, word:"try", ptBR:"tentar", level:1, category:"verbos", frequency:30, ipa:"traɪ", example:"Try your best.", examplePt:"Dê o seu melhor." },
  // Substantivos do cotidiano
  { id:31, word:"time", ptBR:"tempo/hora", level:1, category:"substantivos", frequency:31, ipa:"taɪm", example:"What time is it?", examplePt:"Que horas são?" },
  { id:32, word:"year", ptBR:"ano", level:1, category:"substantivos", frequency:32, ipa:"jɪər", example:"Happy new year!", examplePt:"Feliz ano novo!" },
  { id:33, word:"day", ptBR:"dia", level:1, category:"substantivos", frequency:33, ipa:"deɪ", example:"Have a good day.", examplePt:"Tenha um bom dia." },
  { id:34, word:"man", ptBR:"homem", level:1, category:"substantivos", frequency:34, ipa:"mæn", example:"The man is tall.", examplePt:"O homem é alto." },
  { id:35, word:"woman", ptBR:"mulher", level:1, category:"substantivos", frequency:35, ipa:"ˈwʊmən", example:"The woman is kind.", examplePt:"A mulher é gentil." },
  { id:36, word:"child", ptBR:"criança", level:1, category:"substantivos", frequency:36, ipa:"tʃaɪld", example:"The child is playing.", examplePt:"A criança está brincando." },
  { id:37, word:"house", ptBR:"casa", level:1, category:"substantivos", frequency:37, ipa:"haʊs", example:"My house is big.", examplePt:"Minha casa é grande." },
  { id:38, word:"hand", ptBR:"mão", level:1, category:"substantivos", frequency:38, ipa:"hænd", example:"Wash your hands.", examplePt:"Lave as mãos." },
  { id:39, word:"eye", ptBR:"olho", level:1, category:"substantivos", frequency:39, ipa:"aɪ", example:"Her eyes are blue.", examplePt:"Seus olhos são azuis." },
  { id:40, word:"water", ptBR:"água", level:1, category:"substantivos", frequency:40, ipa:"ˈwɔːtər", example:"Drink more water.", examplePt:"Beba mais água." },
  { id:41, word:"food", ptBR:"comida", level:1, category:"substantivos", frequency:41, ipa:"fuːd", example:"The food is delicious.", examplePt:"A comida é deliciosa." },
  { id:42, word:"school", ptBR:"escola", level:1, category:"substantivos", frequency:42, ipa:"skuːl", example:"I go to school.", examplePt:"Eu vou à escola." },
  { id:43, word:"book", ptBR:"livro", level:1, category:"substantivos", frequency:43, ipa:"bʊk", example:"Read a book.", examplePt:"Leia um livro." },
  { id:44, word:"friend", ptBR:"amigo", level:1, category:"substantivos", frequency:44, ipa:"frɛnd", example:"She is my friend.", examplePt:"Ela é minha amiga." },
  { id:45, word:"family", ptBR:"família", level:1, category:"substantivos", frequency:45, ipa:"ˈfæməli", example:"I love my family.", examplePt:"Eu amo minha família." },
  { id:46, word:"mother", ptBR:"mãe", level:1, category:"família", frequency:46, ipa:"ˈmʌðər", example:"My mother is kind.", examplePt:"Minha mãe é gentil." },
  { id:47, word:"father", ptBR:"pai", level:1, category:"família", frequency:47, ipa:"ˈfɑːðər", example:"My father works hard.", examplePt:"Meu pai trabalha muito." },
  { id:48, word:"brother", ptBR:"irmão", level:1, category:"família", frequency:48, ipa:"ˈbrʌðər", example:"My brother is funny.", examplePt:"Meu irmão é engraçado." },
  { id:49, word:"sister", ptBR:"irmã", level:1, category:"família", frequency:49, ipa:"ˈsɪstər", example:"My sister is tall.", examplePt:"Minha irmã é alta." },
  { id:50, word:"name", ptBR:"nome", level:1, category:"substantivos", frequency:50, ipa:"neɪm", example:"What is your name?", examplePt:"Qual é o seu nome?" },
  // Adjetivos básicos
  { id:51, word:"good", ptBR:"bom/boa", level:1, category:"adjetivos", frequency:51, ipa:"ɡʊd", example:"This is good.", examplePt:"Isso é bom." },
  { id:52, word:"bad", ptBR:"mau/ruim", level:1, category:"adjetivos", frequency:52, ipa:"bæd", example:"That was bad.", examplePt:"Isso foi ruim." },
  { id:53, word:"big", ptBR:"grande", level:1, category:"adjetivos", frequency:53, ipa:"bɪɡ", example:"A big tree.", examplePt:"Uma árvore grande." },
  { id:54, word:"small", ptBR:"pequeno", level:1, category:"adjetivos", frequency:54, ipa:"smɔːl", example:"A small cat.", examplePt:"Um gato pequeno." },
  { id:55, word:"new", ptBR:"novo", level:1, category:"adjetivos", frequency:55, ipa:"njuː", example:"A new phone.", examplePt:"Um telefone novo." },
  { id:56, word:"old", ptBR:"velho/antigo", level:1, category:"adjetivos", frequency:56, ipa:"oʊld", example:"An old house.", examplePt:"Uma casa velha." },
  { id:57, word:"hot", ptBR:"quente", level:1, category:"adjetivos", frequency:57, ipa:"hɒt", example:"The coffee is hot.", examplePt:"O café está quente." },
  { id:58, word:"cold", ptBR:"frio", level:1, category:"adjetivos", frequency:58, ipa:"koʊld", example:"It's cold today.", examplePt:"Está frio hoje." },
  { id:59, word:"happy", ptBR:"feliz", level:1, category:"adjetivos", frequency:59, ipa:"ˈhæpi", example:"I am happy.", examplePt:"Estou feliz." },
  { id:60, word:"sad", ptBR:"triste", level:1, category:"adjetivos", frequency:60, ipa:"sæd", example:"She looks sad.", examplePt:"Ela parece triste." },
  // Números
  { id:61, word:"one", ptBR:"um", level:1, category:"números", frequency:61, ipa:"wʌn", example:"One apple.", examplePt:"Uma maçã." },
  { id:62, word:"two", ptBR:"dois", level:1, category:"números", frequency:62, ipa:"tuː", example:"Two cats.", examplePt:"Dois gatos." },
  { id:63, word:"three", ptBR:"três", level:1, category:"números", frequency:63, ipa:"θriː", example:"Three books.", examplePt:"Três livros." },
  { id:64, word:"four", ptBR:"quatro", level:1, category:"números", frequency:64, ipa:"fɔːr", example:"Four chairs.", examplePt:"Quatro cadeiras." },
  { id:65, word:"five", ptBR:"cinco", level:1, category:"números", frequency:65, ipa:"faɪv", example:"Five fingers.", examplePt:"Cinco dedos." },
  { id:66, word:"ten", ptBR:"dez", level:1, category:"números", frequency:66, ipa:"tɛn", example:"Ten minutes.", examplePt:"Dez minutos." },
  { id:67, word:"hundred", ptBR:"cem/cento", level:1, category:"números", frequency:67, ipa:"ˈhʌndrəd", example:"One hundred.", examplePt:"Cem." },
  // Cores
  { id:68, word:"red", ptBR:"vermelho", level:1, category:"cores", frequency:68, ipa:"rɛd", example:"A red rose.", examplePt:"Uma rosa vermelha." },
  { id:69, word:"blue", ptBR:"azul", level:1, category:"cores", frequency:69, ipa:"bluː", example:"The blue sky.", examplePt:"O céu azul." },
  { id:70, word:"green", ptBR:"verde", level:1, category:"cores", frequency:70, ipa:"ɡriːn", example:"Green grass.", examplePt:"Grama verde." },
  { id:71, word:"yellow", ptBR:"amarelo", level:1, category:"cores", frequency:71, ipa:"ˈjɛloʊ", example:"A yellow sun.", examplePt:"Um sol amarelo." },
  { id:72, word:"white", ptBR:"branco", level:1, category:"cores", frequency:72, ipa:"waɪt", example:"White snow.", examplePt:"Neve branca." },
  { id:73, word:"black", ptBR:"preto", level:1, category:"cores", frequency:73, ipa:"blæk", example:"A black cat.", examplePt:"Um gato preto." },
  // Animais
  { id:74, word:"cat", ptBR:"gato", level:1, category:"animais", frequency:74, ipa:"kæt", example:"The cat sleeps.", examplePt:"O gato dorme." },
  { id:75, word:"dog", ptBR:"cachorro", level:1, category:"animais", frequency:75, ipa:"dɒɡ", example:"The dog barks.", examplePt:"O cachorro late." },
  { id:76, word:"bird", ptBR:"pássaro", level:1, category:"animais", frequency:76, ipa:"bɜːrd", example:"A bird sings.", examplePt:"Um pássaro canta." },
  { id:77, word:"fish", ptBR:"peixe", level:1, category:"animais", frequency:77, ipa:"fɪʃ", example:"Fish swim fast.", examplePt:"Peixes nadam rápido." },
  { id:78, word:"horse", ptBR:"cavalo", level:1, category:"animais", frequency:78, ipa:"hɔːrs", example:"A white horse.", examplePt:"Um cavalo branco." },
  // Corpo humano
  { id:79, word:"head", ptBR:"cabeça", level:1, category:"corpo", frequency:79, ipa:"hɛd", example:"My head hurts.", examplePt:"Minha cabeça dói." },
  { id:80, word:"face", ptBR:"rosto", level:1, category:"corpo", frequency:80, ipa:"feɪs", example:"A beautiful face.", examplePt:"Um rosto bonito." },
  { id:81, word:"mouth", ptBR:"boca", level:1, category:"corpo", frequency:81, ipa:"maʊθ", example:"Open your mouth.", examplePt:"Abra a boca." },
  { id:82, word:"ear", ptBR:"orelha", level:1, category:"corpo", frequency:82, ipa:"ɪər", example:"My ear hurts.", examplePt:"Minha orelha dói." },
  { id:83, word:"nose", ptBR:"nariz", level:1, category:"corpo", frequency:83, ipa:"noʊz", example:"A big nose.", examplePt:"Um nariz grande." },
  { id:84, word:"leg", ptBR:"perna", level:1, category:"corpo", frequency:84, ipa:"lɛɡ", example:"My leg is tired.", examplePt:"Minha perna está cansada." },
  { id:85, word:"foot", ptBR:"pé", level:1, category:"corpo", frequency:85, ipa:"fʊt", example:"My foot hurts.", examplePt:"Meu pé dói." },
  // Comida e bebida
  { id:86, word:"bread", ptBR:"pão", level:1, category:"comida", frequency:86, ipa:"brɛd", example:"Fresh bread.", examplePt:"Pão fresco." },
  { id:87, word:"milk", ptBR:"leite", level:1, category:"comida", frequency:87, ipa:"mɪlk", example:"Drink your milk.", examplePt:"Beba seu leite." },
  { id:88, word:"egg", ptBR:"ovo", level:1, category:"comida", frequency:88, ipa:"ɛɡ", example:"A boiled egg.", examplePt:"Um ovo cozido." },
  { id:89, word:"apple", ptBR:"maçã", level:1, category:"comida", frequency:89, ipa:"ˈæpəl", example:"An apple a day.", examplePt:"Uma maçã por dia." },
  { id:90, word:"rice", ptBR:"arroz", level:1, category:"comida", frequency:90, ipa:"raɪs", example:"Rice and beans.", examplePt:"Arroz e feijão." },
  // Lugares
  { id:91, word:"home", ptBR:"lar/casa", level:1, category:"lugares", frequency:91, ipa:"hoʊm", example:"I'm going home.", examplePt:"Estou indo para casa." },
  { id:92, word:"city", ptBR:"cidade", level:1, category:"lugares", frequency:92, ipa:"ˈsɪti", example:"A big city.", examplePt:"Uma cidade grande." },
  { id:93, word:"street", ptBR:"rua", level:1, category:"lugares", frequency:93, ipa:"striːt", example:"Cross the street.", examplePt:"Atravesse a rua." },
  { id:94, word:"park", ptBR:"parque", level:1, category:"lugares", frequency:94, ipa:"pɑːrk", example:"Play in the park.", examplePt:"Brinque no parque." },
  { id:95, word:"store", ptBR:"loja", level:1, category:"lugares", frequency:95, ipa:"stɔːr", example:"Go to the store.", examplePt:"Vá à loja." },
  // Tempo
  { id:96, word:"today", ptBR:"hoje", level:1, category:"tempo", frequency:96, ipa:"təˈdeɪ", example:"Today is Monday.", examplePt:"Hoje é segunda-feira." },
  { id:97, word:"tomorrow", ptBR:"amanhã", level:1, category:"tempo", frequency:97, ipa:"təˈmɒroʊ", example:"See you tomorrow.", examplePt:"Até amanhã." },
  { id:98, word:"yesterday", ptBR:"ontem", level:1, category:"tempo", frequency:98, ipa:"ˈjɛstərdeɪ", example:"Yesterday was fun.", examplePt:"Ontem foi divertido." },
  { id:99, word:"now", ptBR:"agora", level:1, category:"tempo", frequency:99, ipa:"naʊ", example:"Do it now.", examplePt:"Faça agora." },
  { id:100, word:"morning", ptBR:"manhã", level:1, category:"tempo", frequency:100, ipa:"ˈmɔːrnɪŋ", example:"Good morning!", examplePt:"Bom dia!" },
  // Saudações e expressões
  { id:101, word:"hello", ptBR:"olá", level:1, category:"saudações", frequency:101, ipa:"həˈloʊ", example:"Hello, how are you?", examplePt:"Olá, como vai?" },
  { id:102, word:"goodbye", ptBR:"tchau/adeus", level:1, category:"saudações", frequency:102, ipa:"ˌɡʊdˈbaɪ", example:"Goodbye, see you!", examplePt:"Tchau, até logo!" },
  { id:103, word:"please", ptBR:"por favor", level:1, category:"saudações", frequency:103, ipa:"pliːz", example:"Please sit down.", examplePt:"Por favor, sente-se." },
  { id:104, word:"thank you", ptBR:"obrigado", level:1, category:"saudações", frequency:104, ipa:"θæŋk juː", example:"Thank you very much.", examplePt:"Muito obrigado." },
  { id:105, word:"sorry", ptBR:"desculpe", level:1, category:"saudações", frequency:105, ipa:"ˈsɒri", example:"I'm sorry.", examplePt:"Sinto muito." },
  { id:106, word:"yes", ptBR:"sim", level:1, category:"expressões", frequency:106, ipa:"jɛs", example:"Yes, I agree.", examplePt:"Sim, concordo." },
  { id:107, word:"no", ptBR:"não", level:1, category:"expressões", frequency:107, ipa:"noʊ", example:"No, thank you.", examplePt:"Não, obrigado." },
  { id:108, word:"help", ptBR:"ajuda/ajudar", level:1, category:"expressões", frequency:108, ipa:"hɛlp", example:"Can you help me?", examplePt:"Você pode me ajudar?" },
  // Preposições básicas
  { id:109, word:"in", ptBR:"em/dentro", level:1, category:"preposições", frequency:109, ipa:"ɪn", example:"In the box.", examplePt:"Na caixa." },
  { id:110, word:"on", ptBR:"em/sobre", level:1, category:"preposições", frequency:110, ipa:"ɒn", example:"On the table.", examplePt:"Na mesa." },
  { id:111, word:"at", ptBR:"em/no", level:1, category:"preposições", frequency:111, ipa:"æt", example:"At school.", examplePt:"Na escola." },
  { id:112, word:"with", ptBR:"com", level:1, category:"preposições", frequency:112, ipa:"wɪð", example:"With my friends.", examplePt:"Com meus amigos." },
  { id:113, word:"for", ptBR:"para/por", level:1, category:"preposições", frequency:113, ipa:"fɔːr", example:"For you.", examplePt:"Para você." },
  { id:114, word:"to", ptBR:"para/a", level:1, category:"preposições", frequency:114, ipa:"tuː", example:"Go to school.", examplePt:"Vá para a escola." },
  { id:115, word:"from", ptBR:"de/desde", level:1, category:"preposições", frequency:115, ipa:"frɒm", example:"From Brazil.", examplePt:"Do Brasil." },
  { id:116, word:"of", ptBR:"de", level:1, category:"preposições", frequency:116, ipa:"ɒv", example:"A cup of tea.", examplePt:"Uma xícara de chá." },
  // Dias da semana
  { id:117, word:"Monday", ptBR:"segunda-feira", level:1, category:"dias", frequency:117, ipa:"ˈmʌndeɪ", example:"See you Monday.", examplePt:"Até segunda." },
  { id:118, word:"Friday", ptBR:"sexta-feira", level:1, category:"dias", frequency:118, ipa:"ˈfraɪdeɪ", example:"TGIF! Friday!", examplePt:"Ufa! Sexta-feira!" },
  { id:119, word:"Sunday", ptBR:"domingo", level:1, category:"dias", frequency:119, ipa:"ˈsʌndeɪ", example:"Sunday is rest day.", examplePt:"Domingo é dia de descanso." },
  { id:120, word:"weekend", ptBR:"fim de semana", level:1, category:"dias", frequency:120, ipa:"ˈwiːkɛnd", example:"Happy weekend!", examplePt:"Bom fim de semana!" },
  // Objetos do cotidiano
  { id:121, word:"phone", ptBR:"telefone", level:1, category:"objetos", frequency:121, ipa:"foʊn", example:"My phone is new.", examplePt:"Meu telefone é novo." },
  { id:122, word:"car", ptBR:"carro", level:1, category:"objetos", frequency:122, ipa:"kɑːr", example:"A fast car.", examplePt:"Um carro rápido." },
  { id:123, word:"door", ptBR:"porta", level:1, category:"objetos", frequency:123, ipa:"dɔːr", example:"Open the door.", examplePt:"Abra a porta." },
  { id:124, word:"window", ptBR:"janela", level:1, category:"objetos", frequency:124, ipa:"ˈwɪndoʊ", example:"Close the window.", examplePt:"Feche a janela." },
  { id:125, word:"chair", ptBR:"cadeira", level:1, category:"objetos", frequency:125, ipa:"tʃɛər", example:"Sit on the chair.", examplePt:"Sente-se na cadeira." },
  { id:126, word:"table", ptBR:"mesa", level:1, category:"objetos", frequency:126, ipa:"ˈteɪbəl", example:"Set the table.", examplePt:"Ponha a mesa." },
  { id:127, word:"bed", ptBR:"cama", level:1, category:"objetos", frequency:127, ipa:"bɛd", example:"Go to bed.", examplePt:"Vá dormir." },
  { id:128, word:"bag", ptBR:"bolsa/mochila", level:1, category:"objetos", frequency:128, ipa:"bæɡ", example:"My school bag.", examplePt:"Minha mochila escolar." },
  { id:129, word:"money", ptBR:"dinheiro", level:1, category:"objetos", frequency:129, ipa:"ˈmʌni", example:"Save your money.", examplePt:"Economize seu dinheiro." },
  { id:130, word:"key", ptBR:"chave", level:1, category:"objetos", frequency:130, ipa:"kiː", example:"The house key.", examplePt:"A chave da casa." },
  // Natureza
  { id:131, word:"sun", ptBR:"sol", level:1, category:"natureza", frequency:131, ipa:"sʌn", example:"The sun is bright.", examplePt:"O sol está brilhante." },
  { id:132, word:"moon", ptBR:"lua", level:1, category:"natureza", frequency:132, ipa:"muːn", example:"Full moon tonight.", examplePt:"Lua cheia esta noite." },
  { id:133, word:"star", ptBR:"estrela", level:1, category:"natureza", frequency:133, ipa:"stɑːr", example:"Count the stars.", examplePt:"Conte as estrelas." },
  { id:134, word:"tree", ptBR:"árvore", level:1, category:"natureza", frequency:134, ipa:"triː", example:"A tall tree.", examplePt:"Uma árvore alta." },
  { id:135, word:"flower", ptBR:"flor", level:1, category:"natureza", frequency:135, ipa:"ˈflaʊər", example:"A red flower.", examplePt:"Uma flor vermelha." },
  { id:136, word:"rain", ptBR:"chuva", level:1, category:"natureza", frequency:136, ipa:"reɪn", example:"It will rain.", examplePt:"Vai chover." },
  { id:137, word:"sky", ptBR:"céu", level:1, category:"natureza", frequency:137, ipa:"skaɪ", example:"Blue sky.", examplePt:"Céu azul." },
  { id:138, word:"sea", ptBR:"mar", level:1, category:"natureza", frequency:138, ipa:"siː", example:"The sea is calm.", examplePt:"O mar está calmo." },
  { id:139, word:"mountain", ptBR:"montanha", level:1, category:"natureza", frequency:139, ipa:"ˈmaʊntɪn", example:"A high mountain.", examplePt:"Uma montanha alta." },
  { id:140, word:"river", ptBR:"rio", level:1, category:"natureza", frequency:140, ipa:"ˈrɪvər", example:"The river flows.", examplePt:"O rio flui." },
  // Ações do dia a dia
  { id:141, word:"eat", ptBR:"comer", level:1, category:"ações", frequency:141, ipa:"iːt", example:"Eat your vegetables.", examplePt:"Coma seus legumes." },
  { id:142, word:"drink", ptBR:"beber", level:1, category:"ações", frequency:142, ipa:"drɪŋk", example:"Drink water.", examplePt:"Beba água." },
  { id:143, word:"sleep", ptBR:"dormir", level:1, category:"ações", frequency:143, ipa:"sliːp", example:"Sleep well.", examplePt:"Durma bem." },
  { id:144, word:"walk", ptBR:"caminhar", level:1, category:"ações", frequency:144, ipa:"wɔːk", example:"Walk to school.", examplePt:"Caminhe até a escola." },
  { id:145, word:"run", ptBR:"correr", level:1, category:"ações", frequency:145, ipa:"rʌn", example:"Run fast!", examplePt:"Corra rápido!" },
  { id:146, word:"play", ptBR:"brincar/jogar", level:1, category:"ações", frequency:146, ipa:"pleɪ", example:"Play outside.", examplePt:"Brinque lá fora." },
  { id:147, word:"read", ptBR:"ler", level:1, category:"ações", frequency:147, ipa:"riːd", example:"Read every day.", examplePt:"Leia todo dia." },
  { id:148, word:"write", ptBR:"escrever", level:1, category:"ações", frequency:148, ipa:"raɪt", example:"Write your name.", examplePt:"Escreva seu nome." },
  { id:149, word:"listen", ptBR:"ouvir/escutar", level:1, category:"ações", frequency:149, ipa:"ˈlɪsən", example:"Listen carefully.", examplePt:"Ouça com atenção." },
  { id:150, word:"speak", ptBR:"falar", level:1, category:"ações", frequency:150, ipa:"spiːk", example:"Speak slowly.", examplePt:"Fale devagar." },
  // Palavras de conexão
  { id:151, word:"and", ptBR:"e", level:1, category:"conectivos", frequency:151, ipa:"ænd", example:"Cats and dogs.", examplePt:"Gatos e cachorros." },
  { id:152, word:"but", ptBR:"mas", level:1, category:"conectivos", frequency:152, ipa:"bʌt", example:"Nice but small.", examplePt:"Bonito mas pequeno." },
  { id:153, word:"or", ptBR:"ou", level:1, category:"conectivos", frequency:153, ipa:"ɔːr", example:"Tea or coffee?", examplePt:"Chá ou café?" },
  { id:154, word:"because", ptBR:"porque", level:1, category:"conectivos", frequency:154, ipa:"bɪˈkɒz", example:"Because I said so.", examplePt:"Porque eu disse." },
  { id:155, word:"if", ptBR:"se", level:1, category:"conectivos", frequency:155, ipa:"ɪf", example:"If you want.", examplePt:"Se você quiser." },
  { id:156, word:"when", ptBR:"quando", level:1, category:"conectivos", frequency:156, ipa:"wɛn", example:"When will you come?", examplePt:"Quando você virá?" },
  { id:157, word:"where", ptBR:"onde", level:1, category:"conectivos", frequency:157, ipa:"wɛər", example:"Where are you?", examplePt:"Onde você está?" },
  { id:158, word:"what", ptBR:"o que/qual", level:1, category:"conectivos", frequency:158, ipa:"wɒt", example:"What do you want?", examplePt:"O que você quer?" },
  { id:159, word:"who", ptBR:"quem", level:1, category:"conectivos", frequency:159, ipa:"huː", example:"Who is there?", examplePt:"Quem está lá?" },
  { id:160, word:"how", ptBR:"como", level:1, category:"conectivos", frequency:160, ipa:"haʊ", example:"How are you?", examplePt:"Como vai você?" },
  // Adjetivos de qualidade
  { id:161, word:"beautiful", ptBR:"bonito/lindo", level:1, category:"adjetivos", frequency:161, ipa:"ˈbjuːtɪfəl", example:"A beautiful day.", examplePt:"Um dia lindo." },
  { id:162, word:"fast", ptBR:"rápido", level:1, category:"adjetivos", frequency:162, ipa:"fæst", example:"A fast car.", examplePt:"Um carro rápido." },
  { id:163, word:"slow", ptBR:"lento", level:1, category:"adjetivos", frequency:163, ipa:"sloʊ", example:"A slow turtle.", examplePt:"Uma tartaruga lenta." },
  { id:164, word:"easy", ptBR:"fácil", level:1, category:"adjetivos", frequency:164, ipa:"ˈiːzi", example:"An easy test.", examplePt:"Um teste fácil." },
  { id:165, word:"hard", ptBR:"difícil/duro", level:1, category:"adjetivos", frequency:165, ipa:"hɑːrd", example:"A hard question.", examplePt:"Uma pergunta difícil." },
  { id:166, word:"clean", ptBR:"limpo", level:1, category:"adjetivos", frequency:166, ipa:"kliːn", example:"Clean hands.", examplePt:"Mãos limpas." },
  { id:167, word:"dirty", ptBR:"sujo", level:1, category:"adjetivos", frequency:167, ipa:"ˈdɜːrti", example:"Dirty shoes.", examplePt:"Sapatos sujos." },
  { id:168, word:"loud", ptBR:"alto/barulhento", level:1, category:"adjetivos", frequency:168, ipa:"laʊd", example:"A loud noise.", examplePt:"Um barulho alto." },
  { id:169, word:"quiet", ptBR:"quieto/silencioso", level:1, category:"adjetivos", frequency:169, ipa:"ˈkwaɪət", example:"Be quiet please.", examplePt:"Fique quieto por favor." },
  { id:170, word:"strong", ptBR:"forte", level:1, category:"adjetivos", frequency:170, ipa:"strɒŋ", example:"A strong man.", examplePt:"Um homem forte." },
  // Mais substantivos essenciais
  { id:171, word:"love", ptBR:"amor/amar", level:1, category:"sentimentos", frequency:171, ipa:"lʌv", example:"I love you.", examplePt:"Eu te amo." },
  { id:172, word:"life", ptBR:"vida", level:1, category:"substantivos", frequency:172, ipa:"laɪf", example:"Life is beautiful.", examplePt:"A vida é bela." },
  { id:173, word:"world", ptBR:"mundo", level:1, category:"substantivos", frequency:173, ipa:"wɜːrld", example:"Around the world.", examplePt:"Ao redor do mundo." },
  { id:174, word:"country", ptBR:"país", level:1, category:"substantivos", frequency:174, ipa:"ˈkʌntri", example:"My country.", examplePt:"Meu país." },
  { id:175, word:"people", ptBR:"pessoas", level:1, category:"substantivos", frequency:175, ipa:"ˈpiːpəl", example:"Many people.", examplePt:"Muitas pessoas." },
  { id:176, word:"music", ptBR:"música", level:1, category:"substantivos", frequency:176, ipa:"ˈmjuːzɪk", example:"I love music.", examplePt:"Eu amo música." },
  { id:177, word:"game", ptBR:"jogo", level:1, category:"substantivos", frequency:177, ipa:"ɡeɪm", example:"Play a game.", examplePt:"Jogue um jogo." },
  { id:178, word:"sport", ptBR:"esporte", level:1, category:"substantivos", frequency:178, ipa:"spɔːrt", example:"I like sport.", examplePt:"Gosto de esporte." },
  { id:179, word:"color", ptBR:"cor", level:1, category:"substantivos", frequency:179, ipa:"ˈkʌlər", example:"What color?", examplePt:"Que cor?" },
  { id:180, word:"number", ptBR:"número", level:1, category:"substantivos", frequency:180, ipa:"ˈnʌmbər", example:"A big number.", examplePt:"Um número grande." },
  // Mais verbos essenciais
  { id:181, word:"open", ptBR:"abrir", level:1, category:"verbos", frequency:181, ipa:"ˈoʊpən", example:"Open the door.", examplePt:"Abra a porta." },
  { id:182, word:"close", ptBR:"fechar", level:1, category:"verbos", frequency:182, ipa:"kloʊz", example:"Close the window.", examplePt:"Feche a janela." },
  { id:183, word:"start", ptBR:"começar", level:1, category:"verbos", frequency:183, ipa:"stɑːrt", example:"Let's start!", examplePt:"Vamos começar!" },
  { id:184, word:"stop", ptBR:"parar", level:1, category:"verbos", frequency:184, ipa:"stɒp", example:"Stop the car.", examplePt:"Pare o carro." },
  { id:185, word:"buy", ptBR:"comprar", level:1, category:"verbos", frequency:185, ipa:"baɪ", example:"Buy some food.", examplePt:"Compre comida." },
  { id:186, word:"sell", ptBR:"vender", level:1, category:"verbos", frequency:186, ipa:"sɛl", example:"Sell your car.", examplePt:"Venda seu carro." },
  { id:187, word:"bring", ptBR:"trazer", level:1, category:"verbos", frequency:187, ipa:"brɪŋ", example:"Bring your book.", examplePt:"Traga seu livro." },
  { id:188, word:"take", ptBR:"pegar/levar", level:1, category:"verbos", frequency:188, ipa:"teɪk", example:"Take your bag.", examplePt:"Pegue sua bolsa." },
  { id:189, word:"put", ptBR:"colocar", level:1, category:"verbos", frequency:189, ipa:"pʊt", example:"Put it here.", examplePt:"Coloque aqui." },
  { id:190, word:"leave", ptBR:"sair/deixar", level:1, category:"verbos", frequency:190, ipa:"liːv", example:"Leave at 8.", examplePt:"Saia às 8." },
  // Mais adjetivos e advérbios
  { id:191, word:"very", ptBR:"muito", level:1, category:"advérbios", frequency:191, ipa:"ˈvɛri", example:"Very good!", examplePt:"Muito bom!" },
  { id:192, word:"also", ptBR:"também", level:1, category:"advérbios", frequency:192, ipa:"ˈɔːlsoʊ", example:"I also like it.", examplePt:"Eu também gosto." },
  { id:193, word:"here", ptBR:"aqui", level:1, category:"advérbios", frequency:193, ipa:"hɪər", example:"Come here.", examplePt:"Venha aqui." },
  { id:194, word:"there", ptBR:"lá/ali", level:1, category:"advérbios", frequency:194, ipa:"ðɛər", example:"Go there.", examplePt:"Vá lá." },
  { id:195, word:"always", ptBR:"sempre", level:1, category:"advérbios", frequency:195, ipa:"ˈɔːlweɪz", example:"Always be kind.", examplePt:"Seja sempre gentil." },
  { id:196, word:"never", ptBR:"nunca", level:1, category:"advérbios", frequency:196, ipa:"ˈnɛvər", example:"Never give up.", examplePt:"Nunca desista." },
  { id:197, word:"often", ptBR:"frequentemente", level:1, category:"advérbios", frequency:197, ipa:"ˈɒfən", example:"I often walk.", examplePt:"Eu caminho frequentemente." },
  { id:198, word:"again", ptBR:"de novo", level:1, category:"advérbios", frequency:198, ipa:"əˈɡɛn", example:"Say it again.", examplePt:"Diga de novo." },
  { id:199, word:"more", ptBR:"mais", level:1, category:"advérbios", frequency:199, ipa:"mɔːr", example:"I want more.", examplePt:"Quero mais." },
  { id:200, word:"less", ptBR:"menos", level:1, category:"advérbios", frequency:200, ipa:"lɛs", example:"Less sugar please.", examplePt:"Menos açúcar por favor." },
];

// ============================================================
// NÍVEL 2 — FUNDAMENTAL (palavras 201-400)
// Vocabulário escolar e social
// ============================================================
export const LEVEL2_WORDS: VocabWord[] = [
  { id:201, word:"answer", ptBR:"resposta/responder", level:2, category:"escola", frequency:201, ipa:"ˈænsər", example:"Answer the question.", examplePt:"Responda a pergunta." },
  { id:202, word:"question", ptBR:"pergunta", level:2, category:"escola", frequency:202, ipa:"ˈkwɛstʃən", example:"Ask a question.", examplePt:"Faça uma pergunta." },
  { id:203, word:"learn", ptBR:"aprender", level:2, category:"escola", frequency:203, ipa:"lɜːrn", example:"Learn every day.", examplePt:"Aprenda todo dia." },
  { id:204, word:"teach", ptBR:"ensinar", level:2, category:"escola", frequency:204, ipa:"tiːtʃ", example:"Teach me please.", examplePt:"Me ensine por favor." },
  { id:205, word:"student", ptBR:"estudante", level:2, category:"escola", frequency:205, ipa:"ˈstjuːdənt", example:"A good student.", examplePt:"Um bom estudante." },
  { id:206, word:"teacher", ptBR:"professor", level:2, category:"escola", frequency:206, ipa:"ˈtiːtʃər", example:"My teacher is kind.", examplePt:"Meu professor é gentil." },
  { id:207, word:"class", ptBR:"aula/turma", level:2, category:"escola", frequency:207, ipa:"klɑːs", example:"English class.", examplePt:"Aula de inglês." },
  { id:208, word:"test", ptBR:"teste/prova", level:2, category:"escola", frequency:208, ipa:"tɛst", example:"Pass the test.", examplePt:"Passe no teste." },
  { id:209, word:"homework", ptBR:"lição de casa", level:2, category:"escola", frequency:209, ipa:"ˈhoʊmwɜːrk", example:"Do your homework.", examplePt:"Faça sua lição." },
  { id:210, word:"exercise", ptBR:"exercício", level:2, category:"escola", frequency:210, ipa:"ˈɛksərsaɪz", example:"Do the exercise.", examplePt:"Faça o exercício." },
  { id:211, word:"language", ptBR:"idioma/língua", level:2, category:"idiomas", frequency:211, ipa:"ˈlæŋɡwɪdʒ", example:"Learn a language.", examplePt:"Aprenda um idioma." },
  { id:212, word:"word", ptBR:"palavra", level:2, category:"idiomas", frequency:212, ipa:"wɜːrd", example:"New word today.", examplePt:"Nova palavra hoje." },
  { id:213, word:"sentence", ptBR:"frase/sentença", level:2, category:"idiomas", frequency:213, ipa:"ˈsɛntəns", example:"Write a sentence.", examplePt:"Escreva uma frase." },
  { id:214, word:"grammar", ptBR:"gramática", level:2, category:"idiomas", frequency:214, ipa:"ˈɡræmər", example:"Study grammar.", examplePt:"Estude gramática." },
  { id:215, word:"vocabulary", ptBR:"vocabulário", level:2, category:"idiomas", frequency:215, ipa:"voʊˈkæbjəlɛri", example:"Build vocabulary.", examplePt:"Construa vocabulário." },
  { id:216, word:"pronunciation", ptBR:"pronúncia", level:2, category:"idiomas", frequency:216, ipa:"prəˌnʌnsiˈeɪʃən", example:"Good pronunciation.", examplePt:"Boa pronúncia." },
  { id:217, word:"translate", ptBR:"traduzir", level:2, category:"idiomas", frequency:217, ipa:"trænsˈleɪt", example:"Translate this.", examplePt:"Traduza isso." },
  { id:218, word:"understand", ptBR:"entender", level:2, category:"idiomas", frequency:218, ipa:"ˌʌndərˈstænd", example:"Do you understand?", examplePt:"Você entende?" },
  { id:219, word:"repeat", ptBR:"repetir", level:2, category:"idiomas", frequency:219, ipa:"rɪˈpiːt", example:"Please repeat.", examplePt:"Por favor, repita." },
  { id:220, word:"practice", ptBR:"praticar", level:2, category:"idiomas", frequency:220, ipa:"ˈpræktɪs", example:"Practice makes perfect.", examplePt:"A prática leva à perfeição." },
  // Saúde
  { id:221, word:"doctor", ptBR:"médico", level:2, category:"saúde", frequency:221, ipa:"ˈdɒktər", example:"See a doctor.", examplePt:"Consulte um médico." },
  { id:222, word:"hospital", ptBR:"hospital", level:2, category:"saúde", frequency:222, ipa:"ˈhɒspɪtəl", example:"Go to hospital.", examplePt:"Vá ao hospital." },
  { id:223, word:"medicine", ptBR:"remédio/medicina", level:2, category:"saúde", frequency:223, ipa:"ˈmɛdɪsɪn", example:"Take your medicine.", examplePt:"Tome seu remédio." },
  { id:224, word:"sick", ptBR:"doente", level:2, category:"saúde", frequency:224, ipa:"sɪk", example:"I feel sick.", examplePt:"Estou me sentindo mal." },
  { id:225, word:"healthy", ptBR:"saudável", level:2, category:"saúde", frequency:225, ipa:"ˈhɛlθi", example:"Stay healthy.", examplePt:"Mantenha-se saudável." },
  { id:226, word:"pain", ptBR:"dor", level:2, category:"saúde", frequency:226, ipa:"peɪn", example:"I feel pain.", examplePt:"Sinto dor." },
  { id:227, word:"fever", ptBR:"febre", level:2, category:"saúde", frequency:227, ipa:"ˈfiːvər", example:"High fever.", examplePt:"Febre alta." },
  { id:228, word:"sleep", ptBR:"sono/dormir", level:2, category:"saúde", frequency:228, ipa:"sliːp", example:"Need more sleep.", examplePt:"Preciso dormir mais." },
  { id:229, word:"rest", ptBR:"descanso/descansar", level:2, category:"saúde", frequency:229, ipa:"rɛst", example:"Rest and recover.", examplePt:"Descanse e recupere-se." },
  { id:230, word:"exercise", ptBR:"exercitar-se", level:2, category:"saúde", frequency:230, ipa:"ˈɛksərsaɪz", example:"Exercise daily.", examplePt:"Exercite-se diariamente." },
  // Trabalho
  { id:231, word:"job", ptBR:"emprego/trabalho", level:2, category:"trabalho", frequency:231, ipa:"dʒɒb", example:"Find a job.", examplePt:"Encontre um emprego." },
  { id:232, word:"office", ptBR:"escritório", level:2, category:"trabalho", frequency:232, ipa:"ˈɒfɪs", example:"Go to the office.", examplePt:"Vá ao escritório." },
  { id:233, word:"meeting", ptBR:"reunião", level:2, category:"trabalho", frequency:233, ipa:"ˈmiːtɪŋ", example:"Team meeting.", examplePt:"Reunião de equipe." },
  { id:234, word:"manager", ptBR:"gerente", level:2, category:"trabalho", frequency:234, ipa:"ˈmænɪdʒər", example:"My manager.", examplePt:"Meu gerente." },
  { id:235, word:"salary", ptBR:"salário", level:2, category:"trabalho", frequency:235, ipa:"ˈsæləri", example:"Monthly salary.", examplePt:"Salário mensal." },
  { id:236, word:"company", ptBR:"empresa", level:2, category:"trabalho", frequency:236, ipa:"ˈkʌmpəni", example:"Big company.", examplePt:"Grande empresa." },
  { id:237, word:"project", ptBR:"projeto", level:2, category:"trabalho", frequency:237, ipa:"ˈprɒdʒɛkt", example:"New project.", examplePt:"Novo projeto." },
  { id:238, word:"deadline", ptBR:"prazo", level:2, category:"trabalho", frequency:238, ipa:"ˈdɛdlaɪn", example:"Meet the deadline.", examplePt:"Cumpra o prazo." },
  { id:239, word:"email", ptBR:"e-mail", level:2, category:"trabalho", frequency:239, ipa:"ˈiːmeɪl", example:"Send an email.", examplePt:"Envie um e-mail." },
  { id:240, word:"report", ptBR:"relatório", level:2, category:"trabalho", frequency:240, ipa:"rɪˈpɔːrt", example:"Write a report.", examplePt:"Escreva um relatório." },
  // Viagem
  { id:241, word:"travel", ptBR:"viajar/viagem", level:2, category:"viagem", frequency:241, ipa:"ˈtrævəl", example:"I love to travel.", examplePt:"Adoro viajar." },
  { id:242, word:"airport", ptBR:"aeroporto", level:2, category:"viagem", frequency:242, ipa:"ˈɛərpɔːrt", example:"At the airport.", examplePt:"No aeroporto." },
  { id:243, word:"hotel", ptBR:"hotel", level:2, category:"viagem", frequency:243, ipa:"hoʊˈtɛl", example:"Book a hotel.", examplePt:"Reserve um hotel." },
  { id:244, word:"passport", ptBR:"passaporte", level:2, category:"viagem", frequency:244, ipa:"ˈpɑːspɔːrt", example:"Show your passport.", examplePt:"Mostre seu passaporte." },
  { id:245, word:"ticket", ptBR:"bilhete/ingresso", level:2, category:"viagem", frequency:245, ipa:"ˈtɪkɪt", example:"Buy a ticket.", examplePt:"Compre um bilhete." },
  { id:246, word:"flight", ptBR:"voo", level:2, category:"viagem", frequency:246, ipa:"flaɪt", example:"Long flight.", examplePt:"Voo longo." },
  { id:247, word:"luggage", ptBR:"bagagem", level:2, category:"viagem", frequency:247, ipa:"ˈlʌɡɪdʒ", example:"Heavy luggage.", examplePt:"Bagagem pesada." },
  { id:248, word:"map", ptBR:"mapa", level:2, category:"viagem", frequency:248, ipa:"mæp", example:"Read the map.", examplePt:"Leia o mapa." },
  { id:249, word:"guide", ptBR:"guia", level:2, category:"viagem", frequency:249, ipa:"ɡaɪd", example:"A tour guide.", examplePt:"Um guia turístico." },
  { id:250, word:"tourist", ptBR:"turista", level:2, category:"viagem", frequency:250, ipa:"ˈtʊərɪst", example:"Many tourists.", examplePt:"Muitos turistas." },
  // Tecnologia
  { id:251, word:"computer", ptBR:"computador", level:2, category:"tecnologia", frequency:251, ipa:"kəmˈpjuːtər", example:"Use a computer.", examplePt:"Use um computador." },
  { id:252, word:"internet", ptBR:"internet", level:2, category:"tecnologia", frequency:252, ipa:"ˈɪntərˌnɛt", example:"Fast internet.", examplePt:"Internet rápida." },
  { id:253, word:"website", ptBR:"site/website", level:2, category:"tecnologia", frequency:253, ipa:"ˈwɛbsaɪt", example:"Visit the website.", examplePt:"Visite o site." },
  { id:254, word:"download", ptBR:"baixar/download", level:2, category:"tecnologia", frequency:254, ipa:"ˈdaʊnloʊd", example:"Download the app.", examplePt:"Baixe o aplicativo." },
  { id:255, word:"password", ptBR:"senha", level:2, category:"tecnologia", frequency:255, ipa:"ˈpæswɜːrd", example:"Strong password.", examplePt:"Senha forte." },
  { id:256, word:"screen", ptBR:"tela", level:2, category:"tecnologia", frequency:256, ipa:"skriːn", example:"Big screen.", examplePt:"Tela grande." },
  { id:257, word:"camera", ptBR:"câmera", level:2, category:"tecnologia", frequency:257, ipa:"ˈkæmərə", example:"Take a photo.", examplePt:"Tire uma foto." },
  { id:258, word:"battery", ptBR:"bateria", level:2, category:"tecnologia", frequency:258, ipa:"ˈbætəri", example:"Low battery.", examplePt:"Bateria fraca." },
  { id:259, word:"message", ptBR:"mensagem", level:2, category:"tecnologia", frequency:259, ipa:"ˈmɛsɪdʒ", example:"Send a message.", examplePt:"Envie uma mensagem." },
  { id:260, word:"video", ptBR:"vídeo", level:2, category:"tecnologia", frequency:260, ipa:"ˈvɪdioʊ", example:"Watch a video.", examplePt:"Assista a um vídeo." },
  // Completar até 400 com mais categorias
  { id:261, word:"restaurant", ptBR:"restaurante", level:2, category:"lugares", frequency:261, ipa:"ˈrɛstərɒnt", example:"Nice restaurant.", examplePt:"Restaurante bom." },
  { id:262, word:"menu", ptBR:"cardápio", level:2, category:"restaurante", frequency:262, ipa:"ˈmɛnjuː", example:"Read the menu.", examplePt:"Leia o cardápio." },
  { id:263, word:"waiter", ptBR:"garçom", level:2, category:"restaurante", frequency:263, ipa:"ˈweɪtər", example:"Call the waiter.", examplePt:"Chame o garçom." },
  { id:264, word:"order", ptBR:"pedir/pedido", level:2, category:"restaurante", frequency:264, ipa:"ˈɔːrdər", example:"Take your order.", examplePt:"Faça seu pedido." },
  { id:265, word:"bill", ptBR:"conta", level:2, category:"restaurante", frequency:265, ipa:"bɪl", example:"Pay the bill.", examplePt:"Pague a conta." },
  { id:266, word:"tip", ptBR:"gorjeta", level:2, category:"restaurante", frequency:266, ipa:"tɪp", example:"Leave a tip.", examplePt:"Deixe uma gorjeta." },
  { id:267, word:"reservation", ptBR:"reserva", level:2, category:"restaurante", frequency:267, ipa:"ˌrɛzərˈveɪʃən", example:"Make a reservation.", examplePt:"Faça uma reserva." },
  { id:268, word:"vegetarian", ptBR:"vegetariano", level:2, category:"restaurante", frequency:268, ipa:"ˌvɛdʒɪˈtɛəriən", example:"Vegetarian option.", examplePt:"Opção vegetariana." },
  { id:269, word:"dessert", ptBR:"sobremesa", level:2, category:"comida", frequency:269, ipa:"dɪˈzɜːrt", example:"Sweet dessert.", examplePt:"Sobremesa doce." },
  { id:270, word:"coffee", ptBR:"café", level:2, category:"comida", frequency:270, ipa:"ˈkɒfi", example:"Black coffee.", examplePt:"Café preto." },
  { id:271, word:"tea", ptBR:"chá", level:2, category:"comida", frequency:271, ipa:"tiː", example:"Hot tea.", examplePt:"Chá quente." },
  { id:272, word:"juice", ptBR:"suco", level:2, category:"comida", frequency:272, ipa:"dʒuːs", example:"Orange juice.", examplePt:"Suco de laranja." },
  { id:273, word:"soup", ptBR:"sopa", level:2, category:"comida", frequency:273, ipa:"suːp", example:"Hot soup.", examplePt:"Sopa quente." },
  { id:274, word:"salad", ptBR:"salada", level:2, category:"comida", frequency:274, ipa:"ˈsæləd", example:"Fresh salad.", examplePt:"Salada fresca." },
  { id:275, word:"chicken", ptBR:"frango", level:2, category:"comida", frequency:275, ipa:"ˈtʃɪkɪn", example:"Grilled chicken.", examplePt:"Frango grelhado." },
  { id:276, word:"beef", ptBR:"carne bovina", level:2, category:"comida", frequency:276, ipa:"biːf", example:"Beef steak.", examplePt:"Bife de carne." },
  { id:277, word:"pasta", ptBR:"macarrão", level:2, category:"comida", frequency:277, ipa:"ˈpæstə", example:"Italian pasta.", examplePt:"Macarrão italiano." },
  { id:278, word:"cheese", ptBR:"queijo", level:2, category:"comida", frequency:278, ipa:"tʃiːz", example:"Fresh cheese.", examplePt:"Queijo fresco." },
  { id:279, word:"butter", ptBR:"manteiga", level:2, category:"comida", frequency:279, ipa:"ˈbʌtər", example:"Spread butter.", examplePt:"Passe manteiga." },
  { id:280, word:"sugar", ptBR:"açúcar", level:2, category:"comida", frequency:280, ipa:"ˈʃʊɡər", example:"Less sugar.", examplePt:"Menos açúcar." },
  // Emoções
  { id:281, word:"angry", ptBR:"com raiva", level:2, category:"emoções", frequency:281, ipa:"ˈæŋɡri", example:"Don't be angry.", examplePt:"Não fique com raiva." },
  { id:282, word:"excited", ptBR:"animado/empolgado", level:2, category:"emoções", frequency:282, ipa:"ɪkˈsaɪtɪd", example:"I'm so excited!", examplePt:"Estou muito animado!" },
  { id:283, word:"scared", ptBR:"com medo", level:2, category:"emoções", frequency:283, ipa:"skɛrd", example:"I'm scared.", examplePt:"Estou com medo." },
  { id:284, word:"surprised", ptBR:"surpreso", level:2, category:"emoções", frequency:284, ipa:"sərˈpraɪzd", example:"I'm surprised!", examplePt:"Estou surpreso!" },
  { id:285, word:"tired", ptBR:"cansado", level:2, category:"emoções", frequency:285, ipa:"ˈtaɪərd", example:"I'm very tired.", examplePt:"Estou muito cansado." },
  { id:286, word:"bored", ptBR:"entediado", level:2, category:"emoções", frequency:286, ipa:"bɔːrd", example:"I'm bored.", examplePt:"Estou entediado." },
  { id:287, word:"nervous", ptBR:"nervoso", level:2, category:"emoções", frequency:287, ipa:"ˈnɜːrvəs", example:"I feel nervous.", examplePt:"Estou nervoso." },
  { id:288, word:"proud", ptBR:"orgulhoso", level:2, category:"emoções", frequency:288, ipa:"praʊd", example:"I'm proud of you.", examplePt:"Tenho orgulho de você." },
  { id:289, word:"lonely", ptBR:"solitário", level:2, category:"emoções", frequency:289, ipa:"ˈloʊnli", example:"Feeling lonely.", examplePt:"Sentindo-se solitário." },
  { id:290, word:"grateful", ptBR:"grato", level:2, category:"emoções", frequency:290, ipa:"ˈɡreɪtfəl", example:"I'm grateful.", examplePt:"Sou grato." },
  // Mais palavras fundamentais para completar 400
  { id:291, word:"problem", ptBR:"problema", level:2, category:"substantivos", frequency:291, ipa:"ˈprɒbləm", example:"Solve the problem.", examplePt:"Resolva o problema." },
  { id:292, word:"solution", ptBR:"solução", level:2, category:"substantivos", frequency:292, ipa:"səˈluːʃən", example:"Find a solution.", examplePt:"Encontre uma solução." },
  { id:293, word:"idea", ptBR:"ideia", level:2, category:"substantivos", frequency:293, ipa:"aɪˈdɪə", example:"Great idea!", examplePt:"Ótima ideia!" },
  { id:294, word:"plan", ptBR:"plano", level:2, category:"substantivos", frequency:294, ipa:"plæn", example:"Make a plan.", examplePt:"Faça um plano." },
  { id:295, word:"change", ptBR:"mudança/mudar", level:2, category:"verbos", frequency:295, ipa:"tʃeɪndʒ", example:"Change is good.", examplePt:"Mudança é boa." },
  { id:296, word:"choose", ptBR:"escolher", level:2, category:"verbos", frequency:296, ipa:"tʃuːz", example:"Choose wisely.", examplePt:"Escolha sabiamente." },
  { id:297, word:"decide", ptBR:"decidir", level:2, category:"verbos", frequency:297, ipa:"dɪˈsaɪd", example:"Decide now.", examplePt:"Decida agora." },
  { id:298, word:"agree", ptBR:"concordar", level:2, category:"verbos", frequency:298, ipa:"əˈɡriː", example:"I agree.", examplePt:"Concordo." },
  { id:299, word:"disagree", ptBR:"discordar", level:2, category:"verbos", frequency:299, ipa:"ˌdɪsəˈɡriː", example:"I disagree.", examplePt:"Discordo." },
  { id:300, word:"explain", ptBR:"explicar", level:2, category:"verbos", frequency:300, ipa:"ɪkˈspleɪn", example:"Please explain.", examplePt:"Por favor, explique." },
  { id:301, word:"describe", ptBR:"descrever", level:2, category:"verbos", frequency:301, ipa:"dɪˈskraɪb", example:"Describe the scene.", examplePt:"Descreva a cena." },
  { id:302, word:"compare", ptBR:"comparar", level:2, category:"verbos", frequency:302, ipa:"kəmˈpɛər", example:"Compare the prices.", examplePt:"Compare os preços." },
  { id:303, word:"improve", ptBR:"melhorar", level:2, category:"verbos", frequency:303, ipa:"ɪmˈpruːv", example:"Improve your skills.", examplePt:"Melhore suas habilidades." },
  { id:304, word:"increase", ptBR:"aumentar", level:2, category:"verbos", frequency:304, ipa:"ɪnˈkriːs", example:"Increase the speed.", examplePt:"Aumente a velocidade." },
  { id:305, word:"decrease", ptBR:"diminuir", level:2, category:"verbos", frequency:305, ipa:"dɪˈkriːs", example:"Decrease the volume.", examplePt:"Diminua o volume." },
  { id:306, word:"remember", ptBR:"lembrar", level:2, category:"verbos", frequency:306, ipa:"rɪˈmɛmbər", example:"Remember this.", examplePt:"Lembre-se disso." },
  { id:307, word:"forget", ptBR:"esquecer", level:2, category:"verbos", frequency:307, ipa:"fərˈɡɛt", example:"Don't forget.", examplePt:"Não esqueça." },
  { id:308, word:"believe", ptBR:"acreditar", level:2, category:"verbos", frequency:308, ipa:"bɪˈliːv", example:"I believe you.", examplePt:"Acredito em você." },
  { id:309, word:"hope", ptBR:"esperança/esperar", level:2, category:"verbos", frequency:309, ipa:"hoʊp", example:"I hope so.", examplePt:"Espero que sim." },
  { id:310, word:"dream", ptBR:"sonho/sonhar", level:2, category:"verbos", frequency:310, ipa:"driːm", example:"Dream big.", examplePt:"Sonhe grande." },
  { id:311, word:"achieve", ptBR:"alcançar/conquistar", level:2, category:"verbos", frequency:311, ipa:"əˈtʃiːv", example:"Achieve your goals.", examplePt:"Alcance seus objetivos." },
  { id:312, word:"success", ptBR:"sucesso", level:2, category:"substantivos", frequency:312, ipa:"səkˈsɛs", example:"Key to success.", examplePt:"Chave para o sucesso." },
  { id:313, word:"failure", ptBR:"fracasso", level:2, category:"substantivos", frequency:313, ipa:"ˈfeɪljər", example:"Learn from failure.", examplePt:"Aprenda com o fracasso." },
  { id:314, word:"opportunity", ptBR:"oportunidade", level:2, category:"substantivos", frequency:314, ipa:"ˌɒpərˈtjuːnɪti", example:"Great opportunity.", examplePt:"Ótima oportunidade." },
  { id:315, word:"challenge", ptBR:"desafio", level:2, category:"substantivos", frequency:315, ipa:"ˈtʃælɪndʒ", example:"Accept the challenge.", examplePt:"Aceite o desafio." },
  { id:316, word:"experience", ptBR:"experiência", level:2, category:"substantivos", frequency:316, ipa:"ɪkˈspɪəriəns", example:"Good experience.", examplePt:"Boa experiência." },
  { id:317, word:"knowledge", ptBR:"conhecimento", level:2, category:"substantivos", frequency:317, ipa:"ˈnɒlɪdʒ", example:"Share knowledge.", examplePt:"Compartilhe conhecimento." },
  { id:318, word:"skill", ptBR:"habilidade", level:2, category:"substantivos", frequency:318, ipa:"skɪl", example:"New skill.", examplePt:"Nova habilidade." },
  { id:319, word:"ability", ptBR:"capacidade", level:2, category:"substantivos", frequency:319, ipa:"əˈbɪlɪti", example:"Natural ability.", examplePt:"Capacidade natural." },
  { id:320, word:"talent", ptBR:"talento", level:2, category:"substantivos", frequency:320, ipa:"ˈtælənt", example:"Hidden talent.", examplePt:"Talento escondido." },
  { id:321, word:"culture", ptBR:"cultura", level:2, category:"substantivos", frequency:321, ipa:"ˈkʌltʃər", example:"Rich culture.", examplePt:"Cultura rica." },
  { id:322, word:"tradition", ptBR:"tradição", level:2, category:"substantivos", frequency:322, ipa:"trəˈdɪʃən", example:"Old tradition.", examplePt:"Tradição antiga." },
  { id:323, word:"history", ptBR:"história", level:2, category:"substantivos", frequency:323, ipa:"ˈhɪstəri", example:"Learn history.", examplePt:"Aprenda história." },
  { id:324, word:"science", ptBR:"ciência", level:2, category:"substantivos", frequency:324, ipa:"ˈsaɪəns", example:"Love science.", examplePt:"Ame a ciência." },
  { id:325, word:"art", ptBR:"arte", level:2, category:"substantivos", frequency:325, ipa:"ɑːrt", example:"Modern art.", examplePt:"Arte moderna." },
  { id:326, word:"nature", ptBR:"natureza", level:2, category:"substantivos", frequency:326, ipa:"ˈneɪtʃər", example:"Love nature.", examplePt:"Ame a natureza." },
  { id:327, word:"environment", ptBR:"meio ambiente", level:2, category:"substantivos", frequency:327, ipa:"ɪnˈvaɪrənmənt", example:"Protect the environment.", examplePt:"Proteja o meio ambiente." },
  { id:328, word:"energy", ptBR:"energia", level:2, category:"substantivos", frequency:328, ipa:"ˈɛnərdʒi", example:"Solar energy.", examplePt:"Energia solar." },
  { id:329, word:"power", ptBR:"poder/energia", level:2, category:"substantivos", frequency:329, ipa:"ˈpaʊər", example:"Electric power.", examplePt:"Energia elétrica." },
  { id:330, word:"technology", ptBR:"tecnologia", level:2, category:"substantivos", frequency:330, ipa:"tɛkˈnɒlədʒi", example:"New technology.", examplePt:"Nova tecnologia." },
  // Mais palavras para completar 400
  { id:331, word:"important", ptBR:"importante", level:2, category:"adjetivos", frequency:331, ipa:"ɪmˈpɔːrtənt", example:"Very important.", examplePt:"Muito importante." },
  { id:332, word:"necessary", ptBR:"necessário", level:2, category:"adjetivos", frequency:332, ipa:"ˈnɛsɪsɛri", example:"Necessary step.", examplePt:"Passo necessário." },
  { id:333, word:"possible", ptBR:"possível", level:2, category:"adjetivos", frequency:333, ipa:"ˈpɒsɪbəl", example:"Anything is possible.", examplePt:"Tudo é possível." },
  { id:334, word:"impossible", ptBR:"impossível", level:2, category:"adjetivos", frequency:334, ipa:"ɪmˈpɒsɪbəl", example:"Nothing is impossible.", examplePt:"Nada é impossível." },
  { id:335, word:"different", ptBR:"diferente", level:2, category:"adjetivos", frequency:335, ipa:"ˈdɪfərənt", example:"We are different.", examplePt:"Somos diferentes." },
  { id:336, word:"similar", ptBR:"similar/parecido", level:2, category:"adjetivos", frequency:336, ipa:"ˈsɪmɪlər", example:"Similar styles.", examplePt:"Estilos parecidos." },
  { id:337, word:"special", ptBR:"especial", level:2, category:"adjetivos", frequency:337, ipa:"ˈspɛʃəl", example:"Special day.", examplePt:"Dia especial." },
  { id:338, word:"common", ptBR:"comum", level:2, category:"adjetivos", frequency:338, ipa:"ˈkɒmən", example:"Common mistake.", examplePt:"Erro comum." },
  { id:339, word:"popular", ptBR:"popular", level:2, category:"adjetivos", frequency:339, ipa:"ˈpɒpjʊlər", example:"Popular song.", examplePt:"Música popular." },
  { id:340, word:"famous", ptBR:"famoso", level:2, category:"adjetivos", frequency:340, ipa:"ˈfeɪməs", example:"Famous actor.", examplePt:"Ator famoso." },
  { id:341, word:"rich", ptBR:"rico", level:2, category:"adjetivos", frequency:341, ipa:"rɪtʃ", example:"Rich and famous.", examplePt:"Rico e famoso." },
  { id:342, word:"poor", ptBR:"pobre", level:2, category:"adjetivos", frequency:342, ipa:"pɔːr", example:"Help the poor.", examplePt:"Ajude os pobres." },
  { id:343, word:"free", ptBR:"livre/grátis", level:2, category:"adjetivos", frequency:343, ipa:"friː", example:"Free time.", examplePt:"Tempo livre." },
  { id:344, word:"busy", ptBR:"ocupado", level:2, category:"adjetivos", frequency:344, ipa:"ˈbɪzi", example:"Very busy day.", examplePt:"Dia muito ocupado." },
  { id:345, word:"ready", ptBR:"pronto", level:2, category:"adjetivos", frequency:345, ipa:"ˈrɛdi", example:"Are you ready?", examplePt:"Você está pronto?" },
  { id:346, word:"safe", ptBR:"seguro", level:2, category:"adjetivos", frequency:346, ipa:"seɪf", example:"Stay safe.", examplePt:"Fique seguro." },
  { id:347, word:"dangerous", ptBR:"perigoso", level:2, category:"adjetivos", frequency:347, ipa:"ˈdeɪndʒərəs", example:"Dangerous road.", examplePt:"Estrada perigosa." },
  { id:348, word:"interesting", ptBR:"interessante", level:2, category:"adjetivos", frequency:348, ipa:"ˈɪntrɪstɪŋ", example:"Interesting book.", examplePt:"Livro interessante." },
  { id:349, word:"boring", ptBR:"chato/entediante", level:2, category:"adjetivos", frequency:349, ipa:"ˈbɔːrɪŋ", example:"Boring class.", examplePt:"Aula chata." },
  { id:350, word:"funny", ptBR:"engraçado", level:2, category:"adjetivos", frequency:350, ipa:"ˈfʌni", example:"Funny joke.", examplePt:"Piada engraçada." },
  { id:351, word:"serious", ptBR:"sério", level:2, category:"adjetivos", frequency:351, ipa:"ˈsɪəriəs", example:"Serious matter.", examplePt:"Assunto sério." },
  { id:352, word:"kind", ptBR:"gentil", level:2, category:"adjetivos", frequency:352, ipa:"kaɪnd", example:"Be kind.", examplePt:"Seja gentil." },
  { id:353, word:"rude", ptBR:"grosseiro", level:2, category:"adjetivos", frequency:353, ipa:"ruːd", example:"Don't be rude.", examplePt:"Não seja grosseiro." },
  { id:354, word:"polite", ptBR:"educado", level:2, category:"adjetivos", frequency:354, ipa:"pəˈlaɪt", example:"Be polite.", examplePt:"Seja educado." },
  { id:355, word:"honest", ptBR:"honesto", level:2, category:"adjetivos", frequency:355, ipa:"ˈɒnɪst", example:"Be honest.", examplePt:"Seja honesto." },
  { id:356, word:"brave", ptBR:"corajoso", level:2, category:"adjetivos", frequency:356, ipa:"breɪv", example:"Be brave.", examplePt:"Seja corajoso." },
  { id:357, word:"smart", ptBR:"inteligente", level:2, category:"adjetivos", frequency:357, ipa:"smɑːrt", example:"Smart student.", examplePt:"Estudante inteligente." },
  { id:358, word:"creative", ptBR:"criativo", level:2, category:"adjetivos", frequency:358, ipa:"kriˈeɪtɪv", example:"Creative mind.", examplePt:"Mente criativa." },
  { id:359, word:"patient", ptBR:"paciente", level:2, category:"adjetivos", frequency:359, ipa:"ˈpeɪʃənt", example:"Be patient.", examplePt:"Seja paciente." },
  { id:360, word:"confident", ptBR:"confiante", level:2, category:"adjetivos", frequency:360, ipa:"ˈkɒnfɪdənt", example:"Feel confident.", examplePt:"Sinta-se confiante." },
  { id:361, word:"careful", ptBR:"cuidadoso", level:2, category:"adjetivos", frequency:361, ipa:"ˈkɛərfəl", example:"Be careful!", examplePt:"Tenha cuidado!" },
  { id:362, word:"responsible", ptBR:"responsável", level:2, category:"adjetivos", frequency:362, ipa:"rɪˈspɒnsɪbəl", example:"Be responsible.", examplePt:"Seja responsável." },
  { id:363, word:"independent", ptBR:"independente", level:2, category:"adjetivos", frequency:363, ipa:"ˌɪndɪˈpɛndənt", example:"Independent person.", examplePt:"Pessoa independente." },
  { id:364, word:"flexible", ptBR:"flexível", level:2, category:"adjetivos", frequency:364, ipa:"ˈflɛksɪbəl", example:"Stay flexible.", examplePt:"Seja flexível." },
  { id:365, word:"organized", ptBR:"organizado", level:2, category:"adjetivos", frequency:365, ipa:"ˈɔːrɡənaɪzd", example:"Stay organized.", examplePt:"Mantenha-se organizado." },
  { id:366, word:"efficient", ptBR:"eficiente", level:2, category:"adjetivos", frequency:366, ipa:"ɪˈfɪʃənt", example:"Efficient worker.", examplePt:"Trabalhador eficiente." },
  { id:367, word:"effective", ptBR:"eficaz", level:2, category:"adjetivos", frequency:367, ipa:"ɪˈfɛktɪv", example:"Effective method.", examplePt:"Método eficaz." },
  { id:368, word:"professional", ptBR:"profissional", level:2, category:"adjetivos", frequency:368, ipa:"prəˈfɛʃənəl", example:"Professional attitude.", examplePt:"Atitude profissional." },
  { id:369, word:"personal", ptBR:"pessoal", level:2, category:"adjetivos", frequency:369, ipa:"ˈpɜːrsənəl", example:"Personal space.", examplePt:"Espaço pessoal." },
  { id:370, word:"social", ptBR:"social", level:2, category:"adjetivos", frequency:370, ipa:"ˈsoʊʃəl", example:"Social media.", examplePt:"Mídia social." },
  { id:371, word:"political", ptBR:"político", level:2, category:"adjetivos", frequency:371, ipa:"pəˈlɪtɪkəl", example:"Political debate.", examplePt:"Debate político." },
  { id:372, word:"economic", ptBR:"econômico", level:2, category:"adjetivos", frequency:372, ipa:"ˌiːkəˈnɒmɪk", example:"Economic growth.", examplePt:"Crescimento econômico." },
  { id:373, word:"cultural", ptBR:"cultural", level:2, category:"adjetivos", frequency:373, ipa:"ˈkʌltʃərəl", example:"Cultural exchange.", examplePt:"Intercâmbio cultural." },
  { id:374, word:"natural", ptBR:"natural", level:2, category:"adjetivos", frequency:374, ipa:"ˈnætʃərəl", example:"Natural beauty.", examplePt:"Beleza natural." },
  { id:375, word:"digital", ptBR:"digital", level:2, category:"adjetivos", frequency:375, ipa:"ˈdɪdʒɪtəl", example:"Digital world.", examplePt:"Mundo digital." },
  { id:376, word:"global", ptBR:"global", level:2, category:"adjetivos", frequency:376, ipa:"ˈɡloʊbəl", example:"Global warming.", examplePt:"Aquecimento global." },
  { id:377, word:"local", ptBR:"local", level:2, category:"adjetivos", frequency:377, ipa:"ˈloʊkəl", example:"Local food.", examplePt:"Comida local." },
  { id:378, word:"national", ptBR:"nacional", level:2, category:"adjetivos", frequency:378, ipa:"ˈnæʃənəl", example:"National holiday.", examplePt:"Feriado nacional." },
  { id:379, word:"international", ptBR:"internacional", level:2, category:"adjetivos", frequency:379, ipa:"ˌɪntərˈnæʃənəl", example:"International flight.", examplePt:"Voo internacional." },
  { id:380, word:"modern", ptBR:"moderno", level:2, category:"adjetivos", frequency:380, ipa:"ˈmɒdərn", example:"Modern city.", examplePt:"Cidade moderna." },
  { id:381, word:"traditional", ptBR:"tradicional", level:2, category:"adjetivos", frequency:381, ipa:"trəˈdɪʃənəl", example:"Traditional food.", examplePt:"Comida tradicional." },
  { id:382, word:"original", ptBR:"original", level:2, category:"adjetivos", frequency:382, ipa:"əˈrɪdʒɪnəl", example:"Original idea.", examplePt:"Ideia original." },
  { id:383, word:"typical", ptBR:"típico", level:2, category:"adjetivos", frequency:383, ipa:"ˈtɪpɪkəl", example:"Typical behavior.", examplePt:"Comportamento típico." },
  { id:384, word:"normal", ptBR:"normal", level:2, category:"adjetivos", frequency:384, ipa:"ˈnɔːrməl", example:"Normal day.", examplePt:"Dia normal." },
  { id:385, word:"unusual", ptBR:"incomum", level:2, category:"adjetivos", frequency:385, ipa:"ʌnˈjuːʒuəl", example:"Unusual event.", examplePt:"Evento incomum." },
  { id:386, word:"perfect", ptBR:"perfeito", level:2, category:"adjetivos", frequency:386, ipa:"ˈpɜːrfɪkt", example:"Perfect timing.", examplePt:"Momento perfeito." },
  { id:387, word:"excellent", ptBR:"excelente", level:2, category:"adjetivos", frequency:387, ipa:"ˈɛksələnt", example:"Excellent work!", examplePt:"Trabalho excelente!" },
  { id:388, word:"terrible", ptBR:"terrível", level:2, category:"adjetivos", frequency:388, ipa:"ˈtɛrɪbəl", example:"Terrible mistake.", examplePt:"Erro terrível." },
  { id:389, word:"wonderful", ptBR:"maravilhoso", level:2, category:"adjetivos", frequency:389, ipa:"ˈwʌndərfəl", example:"Wonderful news!", examplePt:"Notícia maravilhosa!" },
  { id:390, word:"amazing", ptBR:"incrível", level:2, category:"adjetivos", frequency:390, ipa:"əˈmeɪzɪŋ", example:"Amazing view!", examplePt:"Vista incrível!" },
  { id:391, word:"awful", ptBR:"horrível", level:2, category:"adjetivos", frequency:391, ipa:"ˈɔːfəl", example:"Awful weather.", examplePt:"Tempo horrível." },
  { id:392, word:"gorgeous", ptBR:"deslumbrante", level:2, category:"adjetivos", frequency:392, ipa:"ˈɡɔːrdʒəs", example:"Gorgeous sunset.", examplePt:"Pôr do sol deslumbrante." },
  { id:393, word:"delicious", ptBR:"delicioso", level:2, category:"adjetivos", frequency:393, ipa:"dɪˈlɪʃəs", example:"Delicious food!", examplePt:"Comida deliciosa!" },
  { id:394, word:"comfortable", ptBR:"confortável", level:2, category:"adjetivos", frequency:394, ipa:"ˈkʌmftəbəl", example:"Comfortable chair.", examplePt:"Cadeira confortável." },
  { id:395, word:"convenient", ptBR:"conveniente", level:2, category:"adjetivos", frequency:395, ipa:"kənˈviːniənt", example:"Convenient location.", examplePt:"Localização conveniente." },
  { id:396, word:"expensive", ptBR:"caro", level:2, category:"adjetivos", frequency:396, ipa:"ɪkˈspɛnsɪv", example:"Too expensive.", examplePt:"Muito caro." },
  { id:397, word:"cheap", ptBR:"barato", level:2, category:"adjetivos", frequency:397, ipa:"tʃiːp", example:"Cheap price.", examplePt:"Preço barato." },
  { id:398, word:"valuable", ptBR:"valioso", level:2, category:"adjetivos", frequency:398, ipa:"ˈvæljuəbəl", example:"Valuable lesson.", examplePt:"Lição valiosa." },
  { id:399, word:"useful", ptBR:"útil", level:2, category:"adjetivos", frequency:399, ipa:"ˈjuːsfəl", example:"Useful tool.", examplePt:"Ferramenta útil." },
  { id:400, word:"worthless", ptBR:"sem valor", level:2, category:"adjetivos", frequency:400, ipa:"ˈwɜːrθlɪs", example:"Worthless effort.", examplePt:"Esforço sem valor." },
];

// Níveis 3-6 serão carregados dinamicamente via IA conforme o aluno avança
// Estrutura base para os próximos 800 palavras (carregamento lazy)
export const LEVEL_WORD_COUNTS = {
  1: 200,  // Primário - palavras 1-200
  2: 200,  // Fundamental - palavras 201-400
  3: 200,  // Intermediário - palavras 401-600 (gerado por IA)
  4: 200,  // Avançado - palavras 601-800 (gerado por IA)
  5: 200,  // Profissional - palavras 801-1000 (gerado por IA)
  6: 200,  // Científico - palavras 1001-1200 (gerado por IA)
};

// ============================================================
// SISTEMA DE DESBLOQUEIO PROGRESSIVO
// +200 palavras por dia, do nível primário ao científico
// ============================================================

export interface DailyProgress {
  startDate: string;        // ISO date quando o aluno começou
  wordsUnlocked: number;    // Total de palavras desbloqueadas
  currentLevel: VocabLevel; // Nível atual
  daysActive: number;       // Dias de uso
}

/** Calcula quantas palavras estão desbloqueadas baseado nos dias de uso */
export function getUnlockedWordCount(startDateISO?: string): number {
  if (!startDateISO) {
    // Primeiro acesso: desbloqueia nível 1 completo (200 palavras)
    return 200;
  }
  
  const startDate = new Date(startDateISO);
  const today = new Date();
  const daysActive = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Dia 0: 200 palavras (nível 1)
  // Dia 1: +200 = 400 palavras (nível 2)
  // Dia 2: +200 = 600 palavras (nível 3)
  // ...
  // Dia 5+: 1200 palavras (todos os níveis)
  const baseWords = 200; // Sempre começa com 200
  const dailyAddition = 200;
  const maxWords = 1200;
  
  return Math.min(baseWords + (daysActive * dailyAddition), maxWords);
}

/** Retorna o nível atual baseado nas palavras desbloqueadas */
export function getCurrentLevel(wordsUnlocked: number): VocabLevel {
  if (wordsUnlocked <= 200) return 1;
  if (wordsUnlocked <= 400) return 2;
  if (wordsUnlocked <= 600) return 3;
  if (wordsUnlocked <= 800) return 4;
  if (wordsUnlocked <= 1000) return 5;
  return 6;
}

/** Inicializa ou recupera o progresso diário do aluno */
export function getDailyProgress(): DailyProgress {
  try {
    const saved = localStorage.getItem("ml_daily_progress");
    if (saved) {
      const progress = JSON.parse(saved) as DailyProgress;
      // Atualizar contagem baseado nos dias
      const wordsUnlocked = getUnlockedWordCount(progress.startDate);
      const today = new Date();
      const startDate = new Date(progress.startDate);
      const daysActive = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      const updated: DailyProgress = {
        ...progress,
        wordsUnlocked,
        currentLevel: getCurrentLevel(wordsUnlocked),
        daysActive,
      };
      localStorage.setItem("ml_daily_progress", JSON.stringify(updated));
      return updated;
    }
  } catch {}
  
  // Primeiro acesso
  const initial: DailyProgress = {
    startDate: new Date().toISOString(),
    wordsUnlocked: 200,
    currentLevel: 1,
    daysActive: 0,
  };
  try {
    localStorage.setItem("ml_daily_progress", JSON.stringify(initial));
  } catch {}
  return initial;
}

/** Retorna as palavras disponíveis para o aluno hoje */
export function getAvailableWords(): VocabWord[] {
  const progress = getDailyProgress();
  const allWords = [...LEVEL1_WORDS, ...LEVEL2_WORDS];
  return allWords.slice(0, progress.wordsUnlocked);
}

/** Retorna palavras por nível */
export function getWordsByLevel(level: VocabLevel): VocabWord[] {
  const allWords = [...LEVEL1_WORDS, ...LEVEL2_WORDS];
  return allWords.filter(w => w.level === level);
}

/** Retorna palavras por categoria */
export function getWordsByCategory(category: string): VocabWord[] {
  const allWords = [...LEVEL1_WORDS, ...LEVEL2_WORDS];
  return allWords.filter(w => w.category === category);
}

/** Retorna palavras aleatórias para quiz */
export function getRandomWords(count: number, level?: VocabLevel): VocabWord[] {
  const pool = level ? getWordsByLevel(level) : getAvailableWords();
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export const ALL_WORDS = [...LEVEL1_WORDS, ...LEVEL2_WORDS];
