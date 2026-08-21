function parseAudioBase64(audioBase64: string, fallbackMimeType: string): { base64: string; mimeType: string } {
  const compact = audioBase64.trim().replace(/\s/g, "");
  const dataUrlMatch = compact.match(/^data:([^;,]+);base64,(.+)$/i);
  const base64 = dataUrlMatch ? dataUrlMatch[2] : compact;
  if (!base64) throw new Error("Áudio vazio");
  return { base64, mimeType: dataUrlMatch?.[1] || fallbackMimeType };
}

export function audioBase64ToDataUrl(audioBase64: string, mimeType = "audio/mpeg"): string {
  const normalized = parseAudioBase64(audioBase64, mimeType);
  return `data:${normalized.mimeType};base64,${normalized.base64}`;
}

export function audioBase64ToBlob(audioBase64: string, mimeType = "audio/mpeg"): Blob {
  const normalized = parseAudioBase64(audioBase64, mimeType);
  const binary = atob(normalized.base64);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new Blob([bytes], { type: normalized.mimeType });
}

/**
 * O URL é mantido pelo chamador até a próxima fala ou até o encerramento da cena.
 * Revogá-lo ao fim da fala faria o controle nativo perder a opção de repetição.
 */
export function audioBase64ToObjectUrl(audioBase64: string, mimeType = "audio/mpeg"): string {
  return URL.createObjectURL(audioBase64ToBlob(audioBase64, mimeType));
}
