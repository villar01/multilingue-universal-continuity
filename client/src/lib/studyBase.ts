import type { CEFRLevel } from "@/lib/lesson-levels";
import type { StructuredStudyUnit, StudyEntry, StudyEntryKind } from "@/lib/curriculum-types";

export type { StructuredStudyUnit, StudyEntry, StudyEntryKind } from "@/lib/curriculum-types";

const NORMALIZE = (value: string) => value
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLocaleLowerCase("pt-BR")
  .trim();

export function searchStudyBase(
  entries: StudyEntry[],
  query: string,
  kind: StudyEntryKind | "all" = "all",
  level: CEFRLevel = "A1",
): StudyEntry[] {
  const normalized = NORMALIZE(query);
  return entries.filter((entry) => {
    const matchesKind = kind === "all" || entry.kind === kind;
    const matchesLevel = entry.cefr === level;
    if (!normalized) return matchesKind && matchesLevel;
    const searchable = [
      entry.title, entry.subtitle, entry.targetText, entry.example, entry.exampleTranslation,
      entry.nativeExplanation, entry.paretoWord, entry.paretoTranslation, entry.relatedScene, ...entry.searchTerms,
    ].map(NORMALIZE);
    return matchesKind && matchesLevel && searchable.some((term) => term.includes(normalized));
  });
}

export function getStudyUnits(entries: StudyEntry[], level: CEFRLevel = "A1"): string[] {
  return [...new Set(entries.filter((entry) => entry.cefr === level).map((entry) => entry.unit))];
}

export function getStructuredStudyUnit(units: StructuredStudyUnit[], unit: string | null | undefined): StructuredStudyUnit | null {
  return units.find((item) => item.unit === unit) || null;
}

export function filterStudyEntriesByUnit(entries: StudyEntry[], unit: string | "all"): StudyEntry[] {
  return unit === "all" ? entries : entries.filter((entry) => entry.unit === unit);
}

const UNSAFE_PATTERN = /\b(idiot|stupid|hate|kill|suicide|sex|nude|weapon|drug|drogas?|matar|morte|sexo|nudez|arma|ofensa)\b/i;

export function getStudyBaseTeacherReply(entry: StudyEntry, question: string): string {
  const normalized = NORMALIZE(question);
  if (UNSAFE_PATTERN.test(normalized)) return "Vamos manter a prática respeitosa e ligada à lição. Posso ajudar você a ouvir, entender ou usar este conteúdo em uma frase curta.";
  if (!normalized) return `Vamos praticar ${entry.paretoWord}. Leia a frase, ouça a voz natural e tente criar uma resposta curta.`;
  if (/(pronuncia|pronunciaçao|falar|dizer|speak|say)/.test(normalized)) return `A pronúncia figurativa é “${entry.figurativePronunciation}”. Ouça o áudio e repita uma vez devagar antes de usar a frase.`;
  if (/(significa|meaning|quer dizer|o que e|what is)/.test(normalized)) return `${entry.paretoWord} significa “${entry.paretoTranslation}” neste nível. ${entry.nativeExplanation}`;
  if (/(exemplo|frase|example|sentence)/.test(normalized)) return `Exemplo: “${entry.example}”. Agora escreva uma nova frase curta usando ${entry.paretoWord}.`;
  return `${entry.nativeExplanation} Tente responder com uma frase curta usando “${entry.paretoWord}”.`;
}

export function getSentenceStarter(entry: StudyEntry): string {
  const starters: Record<string, string> = {
    "a1-introduce-yourself": "My name is ___.", "a1-ask-for-help": "Can you help me with ___, please?", "a1-where-is": "Where is the ___?", "a1-this-is": "This is a ___.", "a1-family-mom": "My mom is ___.", "a1-routine-now": "I need ___ now.", "a1-order-water": "I would like ___, please.", "a1-ask-price": "How much is this ___?", "a1-near-location": "The ___ is near the ___.", "a1-repeat-please": "Please repeat ___.", "a1-morning-routine": "I ___ in the morning.",
  };
  return starters[entry.id] || entry.targetText;
}

export type SentenceTransformation = { source: string; instruction: string; hint: string };

export function getSentenceTransformation(entry: StudyEntry): SentenceTransformation {
  const transformations: Record<string, SentenceTransformation> = {
    "a1-introduce-yourself": { source: "My name is Ana.", instruction: "Troque Ana pelo seu nome.", hint: "Mantenha: My name is ___." },
    "a1-ask-for-help": { source: "Can you help me, please?", instruction: "Acrescente o que você precisa, sem tirar help.", hint: "Can you help me with ___, please?" },
    "a1-where-is": { source: "Where is the pool?", instruction: "Troque pool por outro lugar singular.", hint: "Where is the hotel?" },
    "a1-this-is": { source: "This is a book.", instruction: "Troque book por outro objeto próximo.", hint: "This is a table." },
    "a1-family-mom": { source: "My mom is at home.", instruction: "Troque at home por outro lugar ou situação.", hint: "My mom is at work." },
    "a1-routine-now": { source: "I need water now.", instruction: "Troque water pelo que você precisa agora.", hint: "I need help now." },
    "a1-order-water": { source: "I would like water, please.", instruction: "Acrescente uma qualidade ao pedido.", hint: "I would like cold water, please." },
    "a1-ask-price": { source: "How much is this ticket?", instruction: "Troque ticket por outro item singular.", hint: "How much is this book?" },
    "a1-near-location": { source: "The hotel is near the beach.", instruction: "Troque um dos lugares e mantenha near.", hint: "The restaurant is near the hotel." },
    "a1-repeat-please": { source: "Please repeat that.", instruction: "Acrescente como você quer ouvir novamente.", hint: "Please repeat that slowly." },
    "a1-morning-routine": { source: "I study English in the morning.", instruction: "Troque a ação, mas mantenha morning.", hint: "I work in the morning." },
  };
  return transformations[entry.id] || { source: entry.targetText, instruction: "Mude uma informação e mantenha a palavra Pareto.", hint: getSentenceStarter(entry) };
}

export function reviewStudySentence(entry: StudyEntry, sentence: string): string {
  const normalized = NORMALIZE(sentence);
  if (!normalized) return "Escreva uma frase curta para receber orientação.";
  if (UNSAFE_PATTERN.test(normalized)) return "Vamos manter a prática respeitosa e ligada à lição. Tente uma frase simples com a palavra Pareto.";
  if (normalized.split(/\s+/).length < 3) return "Acrescente mais palavras para formar uma frase completa. Use o modelo como apoio.";
  const paretoWord = NORMALIZE(entry.paretoWord);
  if (!normalized.includes(paretoWord)) return `Boa tentativa. Agora inclua a palavra Pareto “${entry.paretoWord}” para ligar sua frase ao conteúdo estudado.`;
  if (normalized === NORMALIZE(entry.targetText) || normalized === NORMALIZE(entry.example)) return "Você reproduziu o modelo corretamente. Agora troque uma informação e crie uma frase nova com a mesma estrutura.";
  return `Boa criação. Sua frase reutiliza “${entry.paretoWord}”. Ouça-a, revise uma palavra se desejar e crie mais uma variação.`;
}

export function reviewStudyTransformation(entry: StudyEntry, sentence: string): string {
  const normalized = NORMALIZE(sentence);
  const transformation = getSentenceTransformation(entry);
  if (!normalized) return "Escreva a frase transformada para receber orientação.";
  if (UNSAFE_PATTERN.test(normalized)) return "Vamos manter a prática respeitosa e ligada à lição. Transforme a frase usando a palavra Pareto.";
  if (normalized.split(/\s+/).length < 3) return "Use uma frase completa. Siga a estrutura do modelo e mude apenas uma informação.";
  if (normalized === NORMALIZE(transformation.source)) return "Você manteve o modelo. Agora altere uma informação para criar uma nova situação.";
  if (!normalized.includes(NORMALIZE(entry.paretoWord))) return `Mantenha a palavra Pareto “${entry.paretoWord}” para praticar o conteúdo desta unidade.`;
  return `Boa transformação. Você preservou “${entry.paretoWord}” e criou uma situação nova. Ouça a frase e depois faça mais uma variação.`;
}
