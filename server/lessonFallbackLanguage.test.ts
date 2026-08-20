import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { permitsEnglishLessonFallback } from "./lessonFallbackLanguage";

const routerSource = readFileSync(path.resolve(import.meta.dirname, "routers.ts"), "utf8");

describe("fallback de idioma da Aula Natural", () => {
  it("permite o conteúdo de emergência em inglês somente para aulas de inglês", () => {
    expect(permitsEnglishLessonFallback("en-US")).toBe(true);
    expect(permitsEnglishLessonFallback("EN-gb")).toBe(true);
    expect(permitsEnglishLessonFallback("pt-BR")).toBe(false);
    expect(permitsEnglishLessonFallback("es-ES")).toBe(false);
    expect(permitsEnglishLessonFallback("fr-FR")).toBe(false);
    expect(permitsEnglishLessonFallback("it-IT")).toBe(false);
    expect(permitsEnglishLessonFallback("de-DE")).toBe(false);
  });

  it("bloqueia o fallback em inglês antes de montar o vocabulário fixo", () => {
    const guardPosition = routerSource.indexOf("if (!permitsEnglishLessonFallback(input.languageCode))");
    const englishFallbackPosition = routerSource.indexOf("{ word: 'hello', translation: 'olá'");

    expect(guardPosition).toBeGreaterThan(-1);
    expect(englishFallbackPosition).toBeGreaterThan(guardPosition);
    expect(routerSource).toContain('code: "SERVICE_UNAVAILABLE"');
  });
});
