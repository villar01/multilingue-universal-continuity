/**
 * Perplexity AI Integration — SIGA Engine
 * Usa o modelo sonar para diagnóstico em tempo real com busca na web
 * Endpoint: https://api.perplexity.ai/chat/completions
 */

const PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions";

export interface PerplexityMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface PerplexityResponse {
  id: string;
  model: string;
  choices: Array<{
    message: { role: string; content: string };
    finish_reason: string;
  }>;
  usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}

/**
 * Chama a API do Perplexity com o modelo sonar (mais barato, com busca web)
 */
export async function askPerplexity(
  messages: PerplexityMessage[],
  model: "sonar" | "sonar-pro" | "sonar-reasoning" = "sonar"
): Promise<string> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    throw new Error("PERPLEXITY_API_KEY não configurada. Acesse Configurações → Segredos para adicionar.");
  }

  const response = await fetch(PERPLEXITY_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 2048,
      temperature: 0.2,
      return_citations: true,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Perplexity API error ${response.status}: ${error}`);
  }

  const data = (await response.json()) as PerplexityResponse;
  return data.choices[0]?.message?.content ?? "";
}

/**
 * Diagnóstico SIGA: analisa problema específico do app e retorna solução
 */
export async function sigaDiagnose(problem: string, context: string): Promise<{
  diagnosis: string;
  solution: string;
  priority: "critical" | "high" | "medium" | "low";
  autoFixable: boolean;
}> {
  const content = await askPerplexity([
    {
      role: "system",
      content: `Você é o SIGA (Sistema Inteligente de Gerenciamento e Aprimoramento) do app MultiLingue Universal.
Analise problemas técnicos e pedagógicos do app de ensino de idiomas com IA.
Responda SEMPRE em JSON válido com os campos: diagnosis, solution, priority (critical/high/medium/low), autoFixable (boolean).
Seja direto, técnico e preciso. Não use markdown fora do JSON.`,
    },
    {
      role: "user",
      content: `PROBLEMA: ${problem}\n\nCONTEXTO DO APP: ${context}\n\nRetorne JSON com diagnosis, solution, priority, autoFixable.`,
    },
  ]);

  try {
    // Extrair JSON da resposta
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {}

  // Fallback estruturado
  return {
    diagnosis: content.substring(0, 500),
    solution: "Análise manual necessária",
    priority: "medium",
    autoFixable: false,
  };
}

/**
 * Pesquisa pedagógica: busca melhores práticas para ensino de idiomas
 */
export async function sigaResearch(topic: string, language: string): Promise<string> {
  return askPerplexity([
    {
      role: "system",
      content: `Você é especialista em linguística aplicada e ensino de idiomas com IA.
Pesquise e forneça informações precisas e atuais sobre metodologias de ensino.
Responda em português brasileiro, de forma direta e aplicável.`,
    },
    {
      role: "user",
      content: `Pesquise: ${topic} para ensino de ${language}. Foque em aplicações práticas para app mobile.`,
    },
  ]);
}
