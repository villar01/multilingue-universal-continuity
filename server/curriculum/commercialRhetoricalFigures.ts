import type { ABCBookSemanticContrast } from "./abcBookContent";

type CommercialPair = "pt-es" | "pt-fr" | "pt-it" | "pt-de" | "en-pt";

const isPrefix = (value: string, prefix: string) => value.toLowerCase().startsWith(prefix);

function pairFor(nativeLanguage: string, targetLanguage: string): CommercialPair | null {
  if (isPrefix(nativeLanguage, "pt") && isPrefix(targetLanguage, "es")) return "pt-es";
  if (isPrefix(nativeLanguage, "pt") && isPrefix(targetLanguage, "fr")) return "pt-fr";
  if (isPrefix(nativeLanguage, "pt") && isPrefix(targetLanguage, "it")) return "pt-it";
  if (isPrefix(nativeLanguage, "pt") && isPrefix(targetLanguage, "de")) return "pt-de";
  if (isPrefix(nativeLanguage, "en") && isPrefix(targetLanguage, "pt")) return "en-pt";
  return null;
}

const COMMON_GUIDANCE = {
  level: "advanced" as const,
  kind: "rhetorical_figure" as const,
  focus: "figuras de linguagem: metáfora, personificação, hipérbole, onomatopeia e ênfase expressiva",
  contrast: "Uma figura de linguagem produz imagem, ênfase ou efeito sonoro. Ela é útil em conversa, narrativa e arte; em orientação, segurança ou pedido profissional, a forma literal costuma ser mais clara.",
};

const COMMERCIAL_RHETORICAL_FIGURES: Record<CommercialPair, ABCBookSemanticContrast> = {
  "pt-es": {
    id: "rhetoric-figures-pt-es", ...COMMON_GUIDANCE,
    explanation: "Em espanhol, reconheça o efeito antes de traduzir. Uma metáfora ou hipérbole pode ter equivalente próprio; não a traduza palavra por palavra quando isso produzir uma frase pouco natural. Em registro formal, prefira a reescrita direta.",
    examples: [
      { target: "Eres un rayo de sol.", native: "Você é um raio de sol.", meaning: "metáfora: pessoa alegre, não luz literal" },
      { target: "La ciudad nunca duerme.", native: "A cidade nunca dorme.", meaning: "personificação: cidade muito ativa" },
      { target: "Te lo he dicho un millón de veces.", native: "Eu já lhe disse isso um milhão de vezes.", meaning: "hipérbole: exagero intencional" },
      { target: "¡Pum! La puerta se cerró.", native: "Pum! A porta se fechou.", meaning: "onomatopeia: efeito de som" },
      { target: "Lo vi con mis propios ojos.", native: "Eu vi com meus próprios olhos.", meaning: "ênfase expressiva; em texto técnico, Vi isso pode bastar" },
    ],
    comprehensionPrompt: "Identifique o efeito e reescreva uma frase de modo literal em espanhol. Explique quando a versão figurada ajuda e quando a versão direta é melhor.",
    paretoPrompt: "No Pareto, recupere rayo, ciudad, nunca, millón, pum e ojos. Classifique cada exemplo como imagem, personificação, exagero, som ou ênfase.",
  },
  "pt-fr": {
    id: "rhetoric-figures-pt-fr", ...COMMON_GUIDANCE,
    explanation: "Em francês, uma expressão figurada deve ser aprendida pelo sentido e pelo registro. Procure a imagem produzida pela frase e escolha uma alternativa literal quando a comunicação exigir máxima precisão.",
    examples: [
      { target: "Tu es un rayon de soleil.", native: "Você é um raio de sol.", meaning: "metáfora: pessoa alegre" },
      { target: "La ville ne dort jamais.", native: "A cidade nunca dorme.", meaning: "personificação: cidade ativa" },
      { target: "Je te l'ai dit un million de fois.", native: "Eu já te disse isso um milhão de vezes.", meaning: "hipérbole: exagero deliberado" },
      { target: "Bam ! La porte s'est fermée.", native: "Bam! A porta se fechou.", meaning: "onomatopeia: som escrito" },
      { target: "Je l'ai vu de mes propres yeux.", native: "Eu vi isso com meus próprios olhos.", meaning: "ênfase; a forma curta é mais objetiva em relatório" },
    ],
    comprehensionPrompt: "Diga se a frase cria imagem, ação humana, exagero, som ou ênfase. Depois produza uma versão literal clara em francês.",
    paretoPrompt: "No Pareto, recupere rayon, ville, jamais, million, bam e yeux; associe cada termo ao efeito e ao registro apropriado.",
  },
  "pt-it": {
    id: "rhetoric-figures-pt-it", ...COMMON_GUIDANCE,
    explanation: "Em italiano, use a figura para compreender tom e intenção, não como tradução automática. Compare a forma figurada com uma frase literal e escolha a segunda em instruções formais ou situações de risco.",
    examples: [
      { target: "Sei un raggio di sole.", native: "Você é um raio de sol.", meaning: "metáfora: pessoa alegre" },
      { target: "La città non dorme mai.", native: "A cidade nunca dorme.", meaning: "personificação: cidade ativa" },
      { target: "Te l'ho detto un milione di volte.", native: "Eu já te disse isso um milhão de vezes.", meaning: "hipérbole: exagero consciente" },
      { target: "Bang! La porta si è chiusa.", native: "Bang! A porta se fechou.", meaning: "onomatopeia: som representado" },
      { target: "L'ho visto con i miei occhi.", native: "Eu vi isso com meus próprios olhos.", meaning: "ênfase expressiva; em registro formal, L'ho visto pode ser suficiente" },
    ],
    comprehensionPrompt: "Reconheça a figura, explique o sentido não literal e reescreva uma das frases para uma comunicação profissional em italiano.",
    paretoPrompt: "No Pareto, recupere raggio, città, mai, milione, bang e occhi; contraste efeito expressivo e forma literal.",
  },
  "pt-de": {
    id: "rhetoric-figures-pt-de", ...COMMON_GUIDANCE,
    explanation: "Em alemão, observe se a frase produz uma imagem, exagera ou imita um som. Não presuma que a tradução palavra por palavra mantém o mesmo efeito; aprenda o exemplo como construção contextualizada.",
    examples: [
      { target: "Du bist ein Sonnenstrahl.", native: "Você é um raio de sol.", meaning: "metáfora: pessoa alegre" },
      { target: "Die Stadt schläft nie.", native: "A cidade nunca dorme.", meaning: "personificação: cidade ativa" },
      { target: "Ich habe es dir schon eine Million Mal gesagt.", native: "Eu já te disse isso um milhão de vezes.", meaning: "hipérbole: exagero intencional" },
      { target: "Bumm! Die Tür fiel zu.", native: "Bum! A porta bateu e fechou.", meaning: "onomatopeia: efeito sonoro" },
      { target: "Ich habe es mit meinen eigenen Augen gesehen.", native: "Eu vi isso com meus próprios olhos.", meaning: "ênfase; a versão curta é preferível em comunicação técnica" },
    ],
    comprehensionPrompt: "Identifique o recurso expressivo e escolha uma reescrita literal em alemão adequada para uma orientação objetiva.",
    paretoPrompt: "No Pareto, recupere Sonne, Stadt, nie, Million, Bumm e Augen; classifique o efeito antes de criar uma alternativa direta.",
  },
  "en-pt": {
    id: "rhetoric-figures-en-pt", ...COMMON_GUIDANCE,
    explanation: "No português, a expressão figurada pode reforçar uma ideia, dar ritmo ou reproduzir um som. Aprenda a imagem pelo uso; em aviso, trabalho ou orientação importante, prefira a frase literal e objetiva.",
    examples: [
      { target: "Você é um raio de sol.", native: "You are a ray of sunshine.", meaning: "metáfora: pessoa alegre" },
      { target: "A cidade nunca dorme.", native: "The city never sleeps.", meaning: "personificação: cidade sempre ativa" },
      { target: "Eu já te disse isso um milhão de vezes.", native: "I have told you this a million times.", meaning: "hipérbole: exagero intencional" },
      { target: "Pum! A porta bateu.", native: "Bang! The door slammed.", meaning: "onomatopeia: representação de som" },
      { target: "Vi isso com meus próprios olhos.", native: "I saw it with my own eyes.", meaning: "ênfase expressiva; em relatório, Vi isso pode bastar" },
    ],
    comprehensionPrompt: "Explique em inglês se a frase cria imagem, personifica, exagera, reproduz som ou dá ênfase. Depois reescreva uma delas em português literal.",
    paretoPrompt: "No Pareto, recupere raio, cidade, nunca, milhão, pum e olhos; compare a forma expressiva com a alternativa clara e formal.",
  },
};

export function getCommercialRhetoricalFigures(input: { nativeLanguage: string; targetLanguage: string }): ABCBookSemanticContrast | null {
  const pair = pairFor(input.nativeLanguage, input.targetLanguage);
  return pair ? COMMERCIAL_RHETORICAL_FIGURES[pair] : null;
}

export const COMMERCIAL_RHETORICAL_FIGURE_PAIRS = ["pt-es", "pt-fr", "pt-it", "pt-de", "en-pt"] as const;
