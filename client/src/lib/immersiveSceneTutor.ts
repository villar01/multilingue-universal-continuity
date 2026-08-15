export type SceneTutorHotspot = {
  id: string;
  label: string;
  translation: string;
  example?: string;
  pronunciation?: string;
};

export type SceneTutorReply = {
  text: string;
  nativeText?: string;
  hotspotId?: string;
  blocked?: boolean;
  immediate?: boolean;
};

const normalize = (value: string) => value.toLocaleLowerCase().replace(/[^a-zà-ÿ0-9 ]/gi, " ").replace(/\s+/g, " ").trim();

export function getSceneTutorReply(question: string, hotspots: SceneTutorHotspot[]): SceneTutorReply | null {
  const normalizedQuestion = normalize(question);
  if (!normalizedQuestion) return null;

  if (/\b(fuck|bitch|asshole|porn|nude|kill yourself)\b/.test(normalizedQuestion)) {
    return {
      text: "James: Let’s keep this conversation respectful and focused on the lesson. Ask me about an object or phrase in this scene.",
      blocked: true,
      immediate: true,
    };
  }

  if (/\b(hello|hi|good morning|good afternoon|good evening)\b/.test(normalizedQuestion)) {
    return {
      text: "James: Hello! Nice to meet you. Thank you for introducing yourself. Let’s practise one short sentence about this beach together.",
      nativeText: "Olá! Prazer em conhecer você. Obrigado por se apresentar. Vamos praticar juntos uma frase curta sobre esta praia.",
      immediate: true,
    };
  }

  if (/\bwhat is (a |an |the )?pool\b|\bpool\b/.test(normalizedQuestion)) {
    return {
      text: 'James: “Pool” means “piscina”. A pool is a place where people swim. Repeat: pool.',
      hotspotId: hotspots.find((hotspot) => normalize(hotspot.label).includes("pool"))?.id,
      immediate: true,
    };
  }

  const isLocationQuestion = /\bwhere\s+(is|are)\b/.test(normalizedQuestion);
  if (isLocationQuestion && /\bhouse\b|\bhome\b/.test(normalizedQuestion)) {
    const visibleObjects = hotspots.slice(0, 4).map((hotspot) => hotspot.label).join(", ");
    return {
      text: `James: I can’t see a house in this scene. I can see ${visibleObjects}.`,
      nativeText: "Nesta cena não há uma casa visível. Pergunte sobre um objeto ou lugar que apareça na imagem.",
      immediate: true,
    };
  }
  const mentionedHotspot = hotspots.find((item) => {
    const label = normalize(item.label);
    const translation = normalize(item.translation);
    return normalizedQuestion.includes(label) || normalizedQuestion.includes(translation);
  });
  const mentionsBeach = /\bbeach\b/.test(normalizedQuestion);
  if (isLocationQuestion && (mentionedHotspot || mentionsBeach)) {
    const subject = mentionedHotspot ? `the ${mentionedHotspot.label}` : "this beach";
    const correctedQuestion = `Where is ${subject}?`;
    const needsSingularCorrection = /\bwhere\s+are\b/.test(normalizedQuestion);
    const location = mentionedHotspot
      ? `I can see ${subject} in this scene.`
      : "This is our tropical beach scene.";
    return {
      text: `James: ${needsSingularCorrection ? `Say: ‘${correctedQuestion}’ ` : ""}${location}`,
      nativeText: needsSingularCorrection
        ? `Correção: use ‘is’ porque “${mentionedHotspot?.label || "beach"}” é singular. Em português: “Onde fica ${mentionedHotspot ? `a/o ${mentionedHotspot.translation}` : "esta praia"}?”`
        : `Em português: “Onde fica ${mentionedHotspot ? `a/o ${mentionedHotspot.translation}` : "esta praia"}?”`,
      hotspotId: mentionedHotspot?.id,
      immediate: true,
    };
  }

  const hotspot = hotspots.find((item) => {
    const label = normalize(item.label);
    const translation = normalize(item.translation);
    return label.length > 1 && (normalizedQuestion.includes(label) || normalizedQuestion.includes(translation));
  });
  if (hotspot) {
    const pronunciation = hotspot.pronunciation ? ` Say it like this: ${hotspot.pronunciation}.` : "";
    const example = hotspot.example ? ` Example: ${hotspot.example}` : "";
    return {
      text: `James: “${hotspot.label}” means “${hotspot.translation}”.${pronunciation}${example}`,
      hotspotId: hotspot.id,
      immediate: true,
    };
  }

  if (/\bwhere is\b/.test(normalizedQuestion)) {
    const house = /\bhouse\b|\bhome\b/.test(normalizedQuestion);
    const visibleObjects = hotspots.slice(0, 4).map((hotspot) => hotspot.label).join(", ");
    return {
      text: house
        ? `James: I can’t see a house in this scene. I can see ${visibleObjects}.`
        : `James: Let’s look at the objects in this scene: ${visibleObjects}.`,
      immediate: true,
    };
  }

  if (/\bwhat is\b|\bwhat does\b|\bmeaning\b|\bmeaning of\b/.test(normalizedQuestion)) {
    const availableObjects = hotspots.slice(0, 4).map((hotspot) => hotspot.label).join(", ");
    return { text: `James: Ask me about an object you can see here, such as ${availableObjects}.`, immediate: true };
  }

  const availableObjects = hotspots.slice(0, 4).map((hotspot) => hotspot.label).join(", ");
  return { text: `James: I’m here to help with this lesson. Ask me about ${availableObjects}, or try a sentence in English.` };
}
