import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { PARETO_BOOK_CONTEXT_IDS } from "./curriculum/paretoBookContexts";

const clientSource = readFileSync(path.resolve(process.cwd(), "client/src/pages/Pareto1000.tsx"), "utf8");

describe("contextos do Pareto do Livro no cliente", () => {
  it("preserva todos os contextos protegidos encaminhados pelos capítulos A1", () => {
    expect(PARETO_BOOK_CONTEXT_IDS).toEqual([
      "foundation",
      "family",
      "social-circle",
      "routine-time",
      "home",
      "transport",
    ]);
    for (const contextId of PARETO_BOOK_CONTEXT_IDS) {
      expect(clientSource).toContain(`"${contextId}"`);
    }
    expect(clientSource).toContain('window.location.search');
    expect(clientSource).toContain('const requestedPath = searchParams.get("path");');
    expect(clientSource).toContain('const requestedContext = searchParams.get("bookContext");');
    expect(clientSource).toContain('bookContext: paretoPath === "book" ? bookContext : undefined');
  });

  it("nomeia o retorno de acordo com a origem contextual preservada", () => {
    expect(clientSource).toContain('if (returnTo.startsWith("/immersive-scene")) return "Voltar à cena";');
    expect(clientSource).toContain('if (returnTo.startsWith("/abc-book")) return "Voltar ao Livro ABC";');
    expect(clientSource).toContain('if (returnTo.startsWith("/lesson/") || returnTo.startsWith("/structured-lesson")) return "Voltar à lição";');
    expect(clientSource).toContain('<ArrowLeft className="h-4 w-4" />{returnLabel}');
  });
});
