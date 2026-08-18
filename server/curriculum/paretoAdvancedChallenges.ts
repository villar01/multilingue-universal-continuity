export type ParetoAdvancedChallenge = {
  level: "Inicial" | "Intermediário" | "Avançado";
  focus: string;
  prompt: string;
  answer: string;
  explanation: string;
};

const CHALLENGES: ParetoAdvancedChallenge[] = [
  {
    level: "Inicial",
    focus: "Sujeito, verbo e complemento",
    prompt: "Coloque em ordem: water / need / I",
    answer: "I need water.",
    explanation: "Em uma frase simples em inglês, o sujeito aparece antes do verbo: I + need + water.",
  },
  {
    level: "Intermediário",
    focus: "Tempo e ação em andamento",
    prompt: "Coloque em ordem: English / my friend / today / is studying",
    answer: "My friend is studying English today.",
    explanation: "O sujeito vem antes do auxiliar is; o verbo com -ing vem depois. O tempo pode fechar a frase.",
  },
  {
    level: "Avançado",
    focus: "Conector e ideia subordinada",
    prompt: "Coloque em ordem: the lesson / although / I was tired / I reviewed / before dinner",
    answer: "Although I was tired, I reviewed the lesson before dinner.",
    explanation: "O conector although abre a ideia de contraste. Depois vem a frase principal em ordem direta.",
  },
  {
    level: "Avançado",
    focus: "Condição e resultado hipotético",
    prompt: "Coloque em ordem: the schedule / I would have joined / if I had known / the meeting earlier",
    answer: "If I had known the schedule, I would have joined the meeting earlier.",
    explanation: "A condição começa com if + passado perfeito; o resultado usa would have + particípio.",
  },
];

export function getParetoAdvancedChallenge(page: number): ParetoAdvancedChallenge {
  return CHALLENGES[Math.abs(page) % CHALLENGES.length];
}
