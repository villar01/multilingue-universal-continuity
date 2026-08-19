import { ACTIVE_LANGUAGE_COUNT, COMING_SOON_LANGUAGE_COUNT, TOTAL_LANGUAGES } from "@/lib/languages";

export interface TourStep {
  target: string;
  title: string;
  description: string;
  position?: "top" | "bottom" | "left" | "right" | "center";
  action?: string;
  route?: string;
}

export const TOUR_STEPS: Record<string, TourStep[]> = {
  "/": [
    { target: "tour-home-logo", title: "🌍 MultiLingue Universal", description: `Bem-vindo! O catálogo reúne ${TOTAL_LANGUAGES} idiomas: ${ACTIVE_LANGUAGE_COUNT} estão disponíveis agora e ${COMING_SOON_LANGUAGE_COUNT} permanecem identificados como em preparação.`, position: "bottom" },
    { target: "tour-home-start", title: "🚀 Começar agora", description: "Escolha seu idioma nativo e o idioma que quer aprender. Depois clique em Começar para entrar no Dashboard.", position: "bottom", action: "Ir para o Dashboard", route: "/dashboard" },
    { target: "tour-home-features", title: "✨ Funcionalidades únicas", description: "Realidade aumentada, professores com IA, aprendizado natural por fases da vida, batalha de palavras e muito mais.", position: "top" },
  ],
  "/dashboard": [
    { target: "tour-dash-level", title: "📊 Streak e XP", description: "Aqui ficam seu streak (dias seguidos) e XP total. Faça uma lição por dia para manter o streak.", position: "bottom" },
    { target: "tour-dash-lessons", title: "📚 Lições e acesso rápido", description: "Escolha sua etapa CEFR de A1 a C2, veja as lições disponíveis e acesse recursos rápidos.", position: "top" },
    { target: "tour-dash-quick", title: "⚡ Atalhos rápidos", description: "Acesse: Aprendizado Natural, Meu Professor, Conversa Livre, Cenas Imersivas, Batalha e muito mais.", position: "top", action: "Abrir Master Lesson", route: "/master-lesson" },
  ],
  "/master-lesson": [
    { target: "tour-master-list", title: "📋 Escolha sua aula", description: "Aulas com progressão natural: começa com uma palavra, vai até o diálogo completo. Igual ao método Duolingo + Babbel + Pimsleur.", position: "bottom" },
    { target: "tour-master-free", title: "🆓 Aulas gratuitas", description: "As aulas sem 'Premium' são gratuitas. Comece por elas para sentir o método.", position: "bottom" },
    { target: "tour-master-premium", title: "⭐ Aulas Premium", description: "Aulas avançadas com mais vocabulário, contextos reais e diálogos complexos com IA.", position: "bottom" },
  ],
  "/natural-learning": [
    { target: "tour-natural-phases", title: "🧠 Fases da vida", description: "Aprenda como o cérebro humano aprende: Infância (A1) → Criança (A2) → Adolescência (B1) → Adulto (B2) → Fluente (C1).", position: "bottom" },
    { target: "tour-natural-start", title: "🍼 Comece pela Infância", description: "Na fase Infância você aprende palavras isoladas com imagem e som — exatamente como uma criança aprende.", position: "bottom" },
  ],
  "/lessons-hub": [
    { target: "tour-hub-games", title: "🎮 Jogos de idiomas", description: "Escolha entre vários modos: Memória, Palavras Cruzadas, Batalha, Roleplay e mais.", position: "bottom" },
    { target: "tour-hub-scenes", title: "🌍 Cenas imersivas", description: "Aprenda em cenários reais: restaurante, aeroporto, hotel. O professor aparece na cena.", position: "bottom" },
  ],
  "/free-talk": [
    { target: "tour-freetalk-input", title: "💬 Conversa livre", description: "Fale ou escreva qualquer coisa no idioma que está aprendendo. O professor IA responde e corrige.", position: "top" },
  ],
  "/immersive-scene": [
    { target: "tour-scene-select", title: "🌍 Escolha uma cena", description: "Selecione um cenário real: cidade, restaurante, praia. O professor aparece na cena e ensina o vocabulário do local.", position: "bottom" },
  ],
  "/ar-teacher": [
    { target: "tour-ar-teacher", title: "👨‍🏫 Professor com IA", description: "Seu professor virtual com animação labial. Ele fala no idioma nativo e no idioma que você está aprendendo.", position: "bottom" },
  ],
  "/my-teacher": [
    { target: "tour-myteacher-select", title: "👩‍🏫 Escolha seu professor", description: "Selecione o professor ou professora que vai te acompanhar em todas as aulas.", position: "bottom" },
  ],
  "/ranking": [
    { target: "tour-ranking-list", title: "🏆 Ranking global", description: "Veja sua posição entre todos os alunos. Ganhe XP completando lições e suba no ranking.", position: "bottom" },
  ],
  "/achievements": [
    { target: "tour-achievements-list", title: "🥇 Conquistas", description: "Desbloqueie medalhas completando desafios: 7 dias seguidos, 100 palavras, primeira conversa e muito mais.", position: "bottom" },
  ],
  "/pricing": [
    { target: "tour-pricing-plans", title: "💳 Planos", description: "Escolha o plano que cabe no seu bolso. O plano gratuito já dá acesso a muitas aulas.", position: "bottom" },
  ],
};
