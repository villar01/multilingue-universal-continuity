export function audioBase64ToDataUrl(audioBase64: string, mimeType = "audio/mpeg"): string {
  const normalized = audioBase64.replace(/\s/g, "");
  if (!normalized) throw new Error("Áudio vazio");
  return `data:${mimeType};base64,${normalized}`;
}

export function audioBase64ToBlob(audioBase64: string, mimeType = "audio/mpeg"): Blob {
  const normalized = audioBase64.replace(/\s/g, "");
  if (!normalized) throw new Error("Áudio vazio");
  const binary = atob(normalized);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new Blob([bytes], { type: mimeType });
}

/**
 * O URL é mantido pelo chamador até a próxima fala ou até o encerramento da cena.
 * Revogá-lo ao fim da fala faria o controle nativo perder a opção de repetição.
 */
export function audioBase64ToObjectUrl(audioBase64: string, mimeType = "audio/mpeg"): string {
  return URL.createObjectURL(audioBase64ToBlob(audioBase64, mimeType));
}
