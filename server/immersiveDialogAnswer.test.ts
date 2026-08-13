import { describe, expect, it } from "vitest";
import { findReferencedHotspotId, matchesImmersiveDialogAnswer, normalizeImmersiveDialogAnswer } from "../client/src/lib/immersiveDialogAnswer";

describe("immersive dialogue answer validation", () => {
  it("normalizes punctuation and whitespace from microphone transcription", () => {
    expect(normalizeImmersiveDialogAnswer("  Hello, James! The beach is amazing. ")).toBe(
      "hello james the beach is amazing",
    );
  });

  it("accepts a complete expected reply inside a natural transcription", () => {
    expect(matchesImmersiveDialogAnswer(
      "Hello James! The beach is amazing!",
      "Hello James, the beach is amazing.",
    )).toBe(true);
    expect(matchesImmersiveDialogAnswer(
      "Bonjour Sophie! C'est magnifique ici!",
      "Oui. Bonjour Sophie, c'est magnifique ici!",
    )).toBe(true);
  });

  it("rejects incomplete fragments that cannot demonstrate the dialogue answer", () => {
    expect(matchesImmersiveDialogAnswer("The ocean is beautiful! And the sand is warm.", "ocean")).toBe(false);
    expect(matchesImmersiveDialogAnswer("The ocean is beautiful!", "")).toBe(false);
  });

  it("offers Pareto only for an object that is visibly mapped in the active scene", () => {
    const hotspots = [
      { id: "ocean", label: "Ocean" },
      { id: "sand", label: "Sand" },
      { id: "palm", label: "Palm Tree" },
    ];
    expect(findReferencedHotspotId("The ocean is beautiful and the sand is warm.", hotspots)).toBe("ocean");
    expect(findReferencedHotspotId("Hello James, the beach is amazing!", hotspots)).toBeNull();
  });
});
