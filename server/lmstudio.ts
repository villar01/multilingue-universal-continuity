import axios from "axios";

const LMSTUDIO_BASE_URL = process.env.LMSTUDIO_BASE_URL || "http://localhost:1234";

export interface LMStudioMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LMStudioOptions {
  model?: string;
  messages: LMStudioMessage[];
  temperature?: number;
  max_tokens?: number;
}

export interface LMStudioResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Check if LM Studio service is available
 */
export async function isLMStudioAvailable(): Promise<boolean> {
  try {
    const response = await axios.get(`${LMSTUDIO_BASE_URL}/v1/models`, {
        timeout: 5000, // 5 seconds - tempo razoável para verificar disponibilidade
    });
    return response.status === 200;
  } catch (error) {
    console.warn("[LM Studio] Service not available:", error instanceof Error ? error.message : error);
    return false;
  }
}

/**
 * List available models in LM Studio
 */
export async function listLMStudioModels(): Promise<string[]> {
  try {
    const response = await axios.get(`${LMSTUDIO_BASE_URL}/v1/models`);
    return response.data.data?.map((m: any) => m.id) || [];
  } catch (error) {
    console.error("[LM Studio] Failed to list models:", error);
    return [];
  }
}

/**
 * Generate completion using LM Studio (OpenAI-compatible API)
 */
export async function generateWithLMStudio(
  options: LMStudioOptions
): Promise<{ content: string; tokensUsed: number; responseTime: number }> {
  const startTime = Date.now();
  
  try {
    const response = await axios.post<LMStudioResponse>(
      `${LMSTUDIO_BASE_URL}/v1/chat/completions`,
      {
        model: options.model || "local-model",
        messages: options.messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 2000,
      },
      {
        timeout: 60000, // 60 seconds - tempo para geração de resposta
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const responseTime = Date.now() - startTime;
    const tokensUsed = response.data.usage.total_tokens;

    return {
      content: response.data.choices[0]?.message.content || "",
      tokensUsed,
      responseTime,
    };
  } catch (error) {
    console.error("[LM Studio] Generation failed:", error);
    throw new Error(
      `LM Studio generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
