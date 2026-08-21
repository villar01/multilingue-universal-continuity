import { getInitialCommercialTargetBlock, type InitialCommercialTargetBlockId } from "../../shared/commercialLanguageBlocks";

export type CommercialLanguageA1Unit = {
  id: string;
  targetBlockId: InitialCommercialTargetBlockId;
  targetLocale: string;
  cefr: "A1";
  paretoVocabulary: readonly string[];
  teacherCue: string;
  dialogue: readonly { teacher: string; learner: string }[];
  writingPrompt: string;
  question: { prompt: string; expectedAnswer: string };
  reviewAnchor: string;
  nativeGuidanceKey: "ask-location" | "request-service";
};

/**
 * Unidades autorais mínimas por idioma-alvo. O texto é mantido exclusivamente
 * no servidor e cada unidade usa uma âncora própria do idioma, sem tradução de
 * outro bloco como conteúdo de fallback.
 */
const COMMERCIAL_A1_UNITS: Record<InitialCommercialTargetBlockId, readonly CommercialLanguageA1Unit[]> = {
  english: [
    { id: "en-a1-find-station", targetBlockId: "english", targetLocale: "en-US", cefr: "A1", paretoVocabulary: ["station", "map", "nearby"], teacherCue: "Ask for a place clearly and politely.", dialogue: [{ teacher: "Excuse me, can I help you?", learner: "Where is the station?" }, { teacher: "It is nearby.", learner: "Thank you for the help." }], writingPrompt: "Write one short question asking where a useful place is.", question: { prompt: "Where is the station?", expectedAnswer: "The station is nearby." }, reviewAnchor: "Where is the...", nativeGuidanceKey: "ask-location" },
    { id: "en-a1-request-water", targetBlockId: "english", targetLocale: "en-US", cefr: "A1", paretoVocabulary: ["water", "cup", "please"], teacherCue: "Make a simple, courteous request.", dialogue: [{ teacher: "What would you like?", learner: "I would like water, please." }, { teacher: "Here is your cup.", learner: "Thank you." }], writingPrompt: "Write a polite request for a drink or everyday item.", question: { prompt: "What would you like?", expectedAnswer: "I would like water, please." }, reviewAnchor: "I would like...", nativeGuidanceKey: "request-service" },
  ],
  spanish: [
    { id: "es-a1-find-station", targetBlockId: "spanish", targetLocale: "es-ES", cefr: "A1", paretoVocabulary: ["estación", "mapa", "cerca"], teacherCue: "Pregunta por un lugar con claridad y cortesía.", dialogue: [{ teacher: "Disculpe, ¿puedo ayudarle?", learner: "¿Dónde está la estación?" }, { teacher: "Está cerca.", learner: "Gracias por la ayuda." }], writingPrompt: "Escribe una pregunta corta para localizar un lugar útil.", question: { prompt: "¿Dónde está la estación?", expectedAnswer: "La estación está cerca." }, reviewAnchor: "¿Dónde está...?", nativeGuidanceKey: "ask-location" },
    { id: "es-a1-request-water", targetBlockId: "spanish", targetLocale: "es-ES", cefr: "A1", paretoVocabulary: ["agua", "vaso", "favor"], teacherCue: "Haz una petición sencilla y amable.", dialogue: [{ teacher: "¿Qué desea?", learner: "Quisiera agua, por favor." }, { teacher: "Aquí tiene su vaso.", learner: "Gracias." }], writingPrompt: "Escribe una petición educada de una bebida u objeto cotidiano.", question: { prompt: "¿Qué desea?", expectedAnswer: "Quisiera agua, por favor." }, reviewAnchor: "Quisiera...", nativeGuidanceKey: "request-service" },
  ],
  french: [
    { id: "fr-a1-find-station", targetBlockId: "french", targetLocale: "fr-FR", cefr: "A1", paretoVocabulary: ["gare", "plan", "près"], teacherCue: "Demande un lieu avec clarté et politesse.", dialogue: [{ teacher: "Excusez-moi, puis-je vous aider ?", learner: "Où est la gare ?" }, { teacher: "Elle est tout près.", learner: "Merci pour votre aide." }], writingPrompt: "Écris une courte question pour trouver un lieu utile.", question: { prompt: "Où est la gare ?", expectedAnswer: "La gare est tout près." }, reviewAnchor: "Où est...?", nativeGuidanceKey: "ask-location" },
    { id: "fr-a1-request-water", targetBlockId: "french", targetLocale: "fr-FR", cefr: "A1", paretoVocabulary: ["eau", "verre", "s’il vous plaît"], teacherCue: "Fais une demande simple et polie.", dialogue: [{ teacher: "Que désirez-vous ?", learner: "Je voudrais de l’eau, s’il vous plaît." }, { teacher: "Voici votre verre.", learner: "Merci." }], writingPrompt: "Écris une demande polie pour une boisson ou un objet quotidien.", question: { prompt: "Que désirez-vous ?", expectedAnswer: "Je voudrais de l’eau, s’il vous plaît." }, reviewAnchor: "Je voudrais...", nativeGuidanceKey: "request-service" },
  ],
  italian: [
    { id: "it-a1-find-station", targetBlockId: "italian", targetLocale: "it-IT", cefr: "A1", paretoVocabulary: ["stazione", "mappa", "vicino"], teacherCue: "Chiedi un luogo con chiarezza e cortesia.", dialogue: [{ teacher: "Mi scusi, posso aiutarla?", learner: "Dov’è la stazione?" }, { teacher: "È qui vicino.", learner: "Grazie per l’aiuto." }], writingPrompt: "Scrivi una domanda breve per trovare un luogo utile.", question: { prompt: "Dov’è la stazione?", expectedAnswer: "La stazione è qui vicino." }, reviewAnchor: "Dov’è...?", nativeGuidanceKey: "ask-location" },
    { id: "it-a1-request-water", targetBlockId: "italian", targetLocale: "it-IT", cefr: "A1", paretoVocabulary: ["acqua", "bicchiere", "per favore"], teacherCue: "Fai una richiesta semplice e cortese.", dialogue: [{ teacher: "Che cosa desidera?", learner: "Vorrei dell’acqua, per favore." }, { teacher: "Ecco il suo bicchiere.", learner: "Grazie." }], writingPrompt: "Scrivi una richiesta gentile per una bevanda o un oggetto quotidiano.", question: { prompt: "Che cosa desidera?", expectedAnswer: "Vorrei dell’acqua, per favore." }, reviewAnchor: "Vorrei...", nativeGuidanceKey: "request-service" },
  ],
  german: [
    { id: "de-a1-find-station", targetBlockId: "german", targetLocale: "de-DE", cefr: "A1", paretoVocabulary: ["Bahnhof", "Karte", "nah"], teacherCue: "Frage klar und höflich nach einem Ort.", dialogue: [{ teacher: "Entschuldigung, kann ich Ihnen helfen?", learner: "Wo ist der Bahnhof?" }, { teacher: "Er ist ganz nah.", learner: "Danke für die Hilfe." }], writingPrompt: "Schreibe eine kurze Frage nach einem nützlichen Ort.", question: { prompt: "Wo ist der Bahnhof?", expectedAnswer: "Der Bahnhof ist ganz nah." }, reviewAnchor: "Wo ist der...?", nativeGuidanceKey: "ask-location" },
    { id: "de-a1-request-water", targetBlockId: "german", targetLocale: "de-DE", cefr: "A1", paretoVocabulary: ["Wasser", "Glas", "bitte"], teacherCue: "Bitte höflich und einfach um etwas.", dialogue: [{ teacher: "Was möchten Sie?", learner: "Ich hätte gern Wasser, bitte." }, { teacher: "Hier ist Ihr Glas.", learner: "Danke." }], writingPrompt: "Schreibe eine höfliche Bitte um ein Getränk oder einen Alltagsgegenstand.", question: { prompt: "Was möchten Sie?", expectedAnswer: "Ich hätte gern Wasser, bitte." }, reviewAnchor: "Ich hätte gern...", nativeGuidanceKey: "request-service" },
  ],
};

export function getCommercialLanguageA1Units(targetLanguage: string): readonly CommercialLanguageA1Unit[] | null {
  const block = getInitialCommercialTargetBlock(targetLanguage);
  return block ? COMMERCIAL_A1_UNITS[block.id] : null;
}
