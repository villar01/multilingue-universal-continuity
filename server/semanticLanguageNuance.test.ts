import { describe, expect, it } from "vitest";
import { getABCBookDelivery } from "./curriculum/abcBookContent";

describe("nuances semânticas e figuras de linguagem protegidas", () => {
  it("entrega always, ever e marcadores de tempo com sentido contextual e prática", () => {
    const delivery = getABCBookDelivery({ nativeLanguage: "pt-BR", targetLanguage: "en-US" });
    expect(delivery.available).toBe(true);
    if (!delivery.available) return;

    const contrast = delivery.semanticContrasts.find((item) => item.id === "frequency-ever-always");
    expect(contrast).toMatchObject({
      focus: "always / ever / never / already / yet / still",
      level: "initial",
    });
    expect(contrast?.examples.map((example) => example.target)).toEqual(expect.arrayContaining([
      "Do you ever study at night?",
      "I have never visited London.",
      "I have already finished the exercise.",
      "I have not finished the exercise yet.",
      "She is still studying.",
    ]));
    expect(contrast?.comprehensionPrompt).toContain("continuidade");
    expect(contrast?.paretoPrompt).toContain("pergunta de experiência");
  });

  it("inclui figuras de linguagem com sentido literal, registro e exercício no material protegido", () => {
    const delivery = getABCBookDelivery({ nativeLanguage: "pt-BR", targetLanguage: "en-US" });
    expect(delivery.available).toBe(true);
    if (!delivery.available) return;

    const figures = delivery.semanticContrasts.find((item) => item.id === "rhetoric-figures-register");
    expect(figures?.kind).toBe("rhetorical_figure");
    expect(figures?.examples).toHaveLength(5);
    expect(figures?.examples.map((example) => example.meaning).join(" ")).toMatch(/metáfora|personificação|hipérbole|onomatopeia|pleonasmo/i);
    expect(figures?.comprehensionPrompt).toContain("forma literal");
    expect(delivery.sections.some((section) => section.title === "Figuras de linguagem: entender o efeito e escolher o registro")).toBe(true);
    expect(delivery.sections.find((section) => section.title === "Frequência, experiência e tempo na frase")?.paretoPrompt).toContain("continuidade");
  });

  it("mantém nuances e figuras fora das entregas para pares de idioma ainda não aprovados", () => {
    const delivery = getABCBookDelivery({ nativeLanguage: "en-US", targetLanguage: "pt-BR" });
    expect(delivery).toMatchObject({ available: false });
  });
});
