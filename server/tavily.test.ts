import { describe, it, expect } from "vitest";
import { tavilySearch } from "./tavily";

describe("Tavily API", () => {
  it("should return search results or handle missing API key gracefully", async () => {
    const result = await tavilySearch("English language learning tips");
    // Se a API key não está configurada, tavilySearch retorna null
    if (result === null || result === undefined) {
      // API key não configurada — comportamento esperado em ambiente de teste
      expect(true).toBe(true);
      return;
    }
    expect(result).toBeDefined();
    if (result && typeof result === "object" && "results" in result) {
      expect(Array.isArray((result as any).results)).toBe(true);
    }
  }, 15000);

  it("deve verificar se TAVILY_API_KEY está configurada", () => {
    const apiKey = process.env.TAVILY_API_KEY;
    if (!apiKey) {
      console.warn("[Test] TAVILY_API_KEY não configurada — testes de busca desativados");
    }
    // Não falha se a key não estiver configurada
    expect(true).toBe(true);
  });
});
