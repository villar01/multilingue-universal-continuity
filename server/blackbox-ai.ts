/**
 * Blackbox AI Integration
 * Sistema de IA autoaperfeiçoamento para acelerar desenvolvimento
 * e corrigir automaticamente problemas de pronúncia/qualidade
 */

interface BlackboxRequest {
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

interface BlackboxResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
  }>;
}

/**
 * Invoca Blackbox API para geração de código e análise
 */
export async function invokeBlackboxAI(request: BlackboxRequest): Promise<string> {
  const apiUrl = "https://api.blackbox.ai/v1/chat/completions";
  
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: request.messages,
        model: request.model || "blackbox",
        temperature: request.temperature || 0.7,
        max_tokens: request.max_tokens || 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Blackbox API error: ${response.status} ${response.statusText}`);
    }

    const data: BlackboxResponse = await response.json();
    return data.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("[Blackbox AI] Error:", error);
    throw error;
  }
}

/**
 * Analisa qualidade de pronúncia TTS e sugere melhorias
 */
export async function analyzeTTSQuality(params: {
  language: string;
  text: string;
  currentVoiceId: string;
  issues: string[];
}): Promise<{
  analysis: string;
  suggestedVoiceId: string;
  suggestedRate: number;
  suggestedPitch: number;
  improvements: string[];
}> {
  const prompt = `Você é um especialista em Text-to-Speech e fonética. Analise os seguintes problemas de pronúncia:

Idioma: ${params.language}
Texto: "${params.text}"
Voz atual: ${params.currentVoiceId}
Problemas reportados: ${params.issues.join(", ")}

Forneça uma análise detalhada e sugestões de melhoria no formato JSON:
{
  "analysis": "análise detalhada dos problemas",
  "suggestedVoiceId": "ID da voz recomendada (ElevenLabs ou Google Cloud)",
  "suggestedRate": número entre 0.5 e 1.5,
  "suggestedPitch": número entre -20 e 20,
  "improvements": ["melhoria 1", "melhoria 2", ...]
}`;

  const response = await invokeBlackboxAI({
    messages: [
      {
        role: "system",
        content: "Você é um especialista em TTS e fonética. Responda APENAS com JSON válido, sem texto adicional.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.3,
  });

  try {
    // Extrair JSON da resposta (pode vir com markdown)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Resposta não contém JSON válido");
    }
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("[Blackbox AI] Failed to parse response:", response);
    // Fallback com valores padrão
    return {
      analysis: "Erro ao analisar resposta da IA",
      suggestedVoiceId: params.currentVoiceId,
      suggestedRate: 0.95,
      suggestedPitch: 0,
      improvements: ["Verificar configuração de voz", "Testar taxa de fala mais lenta"],
    };
  }
}

/**
 * Gera código automaticamente para funcionalidades pendentes
 */
export async function generateFeatureCode(params: {
  featureName: string;
  description: string;
  techStack: string[];
  existingCode?: string;
}): Promise<{
  code: string;
  explanation: string;
  dependencies: string[];
  testCases: string[];
}> {
  const prompt = `Gere código completo e funcional para a seguinte funcionalidade:

Nome: ${params.featureName}
Descrição: ${params.description}
Stack: ${params.techStack.join(", ")}
${params.existingCode ? `\nCódigo existente:\n${params.existingCode}` : ""}

Forneça a resposta no formato JSON:
{
  "code": "código completo TypeScript/React",
  "explanation": "explicação do que foi implementado",
  "dependencies": ["dependência1", "dependência2"],
  "testCases": ["caso de teste 1", "caso de teste 2"]
}`;

  const response = await invokeBlackboxAI({
    messages: [
      {
        role: "system",
        content: "Você é um desenvolvedor sênior especializado em TypeScript, React e Next.js. Gere código limpo, tipado e seguindo best practices. Responda APENAS com JSON válido.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.5,
    max_tokens: 4000,
  });

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Resposta não contém JSON válido");
    }
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("[Blackbox AI] Failed to parse code generation response:", response);
    throw new Error("Falha ao gerar código automaticamente");
  }
}

/**
 * Sistema de autoaperfeiçoamento: detecta problemas e gera soluções
 */
export async function autoImproveSystem(params: {
  problemDescription: string;
  affectedFiles: string[];
  errorLogs?: string[];
}): Promise<{
  rootCause: string;
  solution: string;
  codeChanges: Array<{
    file: string;
    changes: string;
  }>;
  preventionSteps: string[];
}> {
  const prompt = `Analise o seguinte problema e forneça uma solução completa:

Problema: ${params.problemDescription}
Arquivos afetados: ${params.affectedFiles.join(", ")}
${params.errorLogs ? `\nLogs de erro:\n${params.errorLogs.join("\n")}` : ""}

Forneça análise e solução no formato JSON:
{
  "rootCause": "causa raiz do problema",
  "solution": "solução detalhada passo a passo",
  "codeChanges": [
    {
      "file": "caminho/do/arquivo.ts",
      "changes": "código corrigido ou instruções de mudança"
    }
  ],
  "preventionSteps": ["passo 1 para prevenir", "passo 2"]
}`;

  const response = await invokeBlackboxAI({
    messages: [
      {
        role: "system",
        content: "Você é um arquiteto de software sênior especializado em debugging e otimização. Forneça soluções práticas e testáveis. Responda APENAS com JSON válido.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.4,
    max_tokens: 3000,
  });

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Resposta não contém JSON válido");
    }
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("[Blackbox AI] Failed to parse auto-improvement response:", response);
    throw new Error("Falha ao gerar solução automaticamente");
  }
}
