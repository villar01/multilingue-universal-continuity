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
});
