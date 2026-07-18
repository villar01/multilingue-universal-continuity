/**
 * Tavily AI - Motor de busca gratuito para o SIGA
 * 1.000 buscas/mês grátis: https://tavily.com
 * Alternativa ao Perplexity com API free tier real
 */

const TAVILY_API_URL = "https://api.tavily.com/search";

export interface TavilyResult {
  title: string;
  url: string;
  content: string;
  score: number;
}

export interface TavilyResponse {
  answer: string;
  results: TavilyResult[];
  query: string;
}

/**
 * Busca com Tavily AI - retorna resposta direta + fontes
 */
export async function tavilySearch(
  query: string,
  options: {
    searchDepth?: "basic" | "advanced";
    maxResults?: number;
    includeAnswer?: boolean;
  } = {}
): Promise<TavilyResponse | null> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    console.warn("[Tavily] TAVILY_API_KEY não configurada — busca desativada");
    return null;
  }

  try {
    const res = await fetch(TAVILY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        query,
        search_depth: options.searchDepth ?? "basic",
        max_results: options.maxResults ?? 5,
        include_answer: options.includeAnswer ?? true,
        include_raw_content: false,
      }),
    });

    if (!res.ok) {
      console.error("[Tavily] Erro na busca:", res.status, await res.text());
      return null;
    }

    const data = await res.json() as any;
    return {
      answer: data.answer ?? "",
      results: (data.results ?? []).map((r: any) => ({
        title: r.title,
        url: r.url,
        content: r.content,
        score: r.score,
      })),
      query,
    };
  } catch (err) {
    console.error("[Tavily] Erro:", err);
    return null;
  }
}

/**
 * Pesquisa pedagógica: busca melhores práticas de ensino de idiomas
 */
export async function searchPedagogicalContent(
  topic: string,
  language: string
): Promise<string> {
  const query = `best practices teaching ${language} language ${topic} exercises methodology`;
  const result = await tavilySearch(query, { searchDepth: "advanced", maxResults: 3 });

  if (!result) return "";

  if (result.answer) return result.answer;

  return result.results
    .slice(0, 2)
    .map((r) => r.content)
    .join("\n\n");
}

/**
 * Diagnóstico de problemas: busca soluções para erros específicos
 */
export async function searchSolution(
  problem: string
): Promise<string> {
  const query = `${problem} solution fix best practice 2025`;
  const result = await tavilySearch(query, { searchDepth: "basic", maxResults: 3 });

  if (!result) return "";
  return result.answer || result.results[0]?.content || "";
}
