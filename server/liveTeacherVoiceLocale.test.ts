import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { resolveActiveLanguageLocale } from "../client/src/lib/languages";

describe("locale de voz do Professor ao Vivo", () => {
  it("mantém o locale regional do idioma-alvo e não substitui idiomas ativos por inglês", () => {
    expect(resolveActiveLanguageLocale("es-MX")).toBe("es-MX");
    expect(resolveActiveLanguageLocale("Spanish")).toBe("es-ES");
    expect(resolveActiveLanguageLocale("Français")).toBe("fr-FR");
    expect(resolveActiveLanguageLocale("Japonês")).toBe("ja-JP");
    expect(resolveActiveLanguageLocale("idioma inexistente")).toBeNull();
  });

  it("interrompe a fala se não houver locale regional válido, sem fallback en-US", () => {
    const component = readFileSync(
      resolve(process.cwd(), "client/src/components/LiveLessonTeacher.tsx"),
      "utf8",
    );

    expect(component).toContain("const targetLocale = resolveActiveLanguageLocale(targetLang)");
    expect(component).toContain("voz neural não está disponível para o idioma selecionado");
    expect(component).not.toContain('targetLang.length <= 10 ? targetLang : "en-US"');
  });
});
