export function audioBase64ToDataUrl(audioBase64: string, mimeType = "audio/mpeg"): string {
  const normalized = audioBase64.replace(/\s/g, "");
  if (!normalized) throw new Error("Áudio vazio");
  return `data:${mimeType};base64,${normalized}`;
}
