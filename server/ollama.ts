import axios from "axios";

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";

export interface OllamaMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OllamaGenerateOptions {
  model?: string;
  messages: OllamaMessage[];
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
}

export interface OllamaResponse {
  model: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  eval_count?: number;
}

/**
 * Check if Ollama service is available
 */
export async function isOllamaAvailable(): Promise<boolean> {
  try {
    const response = await axios.get(`${OLLAMA_BASE_URL}/api/tags`, {
        timeout: 5000, // 5 seconds - tempo razoável para verificar disponibilidade
    });
    return response.status === 200;
  } catch (error) {
    console.warn("[Ollama] Service not available:", error instanceof Error ? error.message : error);
    return false;
  }
}

/**
 * List available models in Ollama
 */
export async function listOllamaModels(): Promise<string[]> {
  try {
    const response = await axios.get(`${OLLAMA_BASE_URL}/api/tags`);
    return response.data.models?.map((m: any) => m.name) || [];
  } catch (error) {
    console.error("[Ollama] Failed to list models:", error);
    return [];
  }
}

/**
 * Generate completion using Ollama
 */
export async function generateWithOllama(
  options: OllamaGenerateOptions
): Promise<{ content: string; tokensUsed: number; responseTime: number }> {
  const startTime = Date.now();
  
  try {
    const model = options.model || "qwen2.5:3b";
    
    const response = await axios.post<OllamaResponse>(
      `${OLLAMA_BASE_URL}/api/chat`,
      {
        model,
        messages: options.messages,
        stream: false,
        options: {
          temperature: options.temperature || 0.7,
          num_predict: options.max_tokens || 2000,
        },
      },
      {
        timeout: 60000, // 60 seconds - tempo para geração de resposta
      }
    );

    const responseTime = Date.now() - startTime;
    const tokensUsed = (response.data.prompt_eval_count || 0) + (response.data.eval_count || 0);

    return {
      content: response.data.message.content,
      tokensUsed,
      responseTime,
    };
  } catch (error) {
    console.error("[Ollama] Generation failed:", error);
    throw new Error(
      `Ollama generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Pull a model from Ollama registry
 */
export async function pullOllamaModel(modelName: string): Promise<boolean> {
  try {
    await axios.post(`${OLLAMA_BASE_URL}/api/pull`, {
      name: modelName,
    });
    return true;
  } catch (error) {
    console.error("[Ollama] Failed to pull model:", error);
    return false;
  }
}

/**
 * Get model info
 */
export async function getModelInfo(modelName: string): Promise<any> {
  try {
    const response = await axios.post(`${OLLAMA_BASE_URL}/api/show`, {
      name: modelName,
    });
    return response.data;
  } catch (error) {
    console.error("[Ollama] Failed to get model info:", error);
    return null;
  }
}
