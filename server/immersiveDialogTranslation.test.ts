import { describe, expect, it } from "vitest";
import { getNativeDialogueTranslation, isPortugueseLocale } from "../client/src/lib/immersiveDialogTranslation";

describe("tradução nativa do diálogo imersivo", () => {
  const line = { text: "Welcome to the beach!", textPt: "Bem-vindo à praia!" };

  it("preserva a tradução curricular em português brasileiro", () => {
    expect(isPortugueseLocale("pt-BR")).toBe(true);
    expect(getNativeDialogueTranslation(line, "pt-BR", "Welcome to the beach!")).toBe("Bem-vindo à praia!");
  });

  it("não reutiliza o texto em português para um nativo não-PT", () => {
    expect(isPortugueseLocale("es-MX")).toBe(false);
    expect(getNativeDialogueTranslation(line, "es-MX", "¡Bienvenido a la playa!")).toBe("¡Bienvenido a la playa!");
    expect(getNativeDialogueTranslation(line, "es-MX")).toBe("");
  });
});
