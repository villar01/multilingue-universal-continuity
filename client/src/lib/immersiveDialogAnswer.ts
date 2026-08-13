export function normalizeImmersiveDialogAnswer(value: string): string {
  return value
    .toLocaleLowerCase()
    .replace(/[.,!?;:()[\]{}"']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Accepts a full expected reply and a complete transcription that contains it,
 * but never accepts a single short fragment as if it were the student's answer.
 */
export function matchesImmersiveDialogAnswer(expected: string, provided: string): boolean {
  const normalizedExpected = normalizeImmersiveDialogAnswer(expected);
  const normalizedProvided = normalizeImmersiveDialogAnswer(provided);
  if (!normalizedExpected || !normalizedProvided) return false;
  return normalizedProvided === normalizedExpected || normalizedProvided.includes(normalizedExpected);
}

export function findReferencedHotspotId(
  dialogueText: string,
  hotspots: ReadonlyArray<{ id: string; label: string }>,
): string | null {
  const normalizedDialogue = normalizeImmersiveDialogAnswer(dialogueText);
  return hotspots.find((hotspot) => normalizedDialogue.includes(normalizeImmersiveDialogAnswer(hotspot.label)))?.id || null;
}
