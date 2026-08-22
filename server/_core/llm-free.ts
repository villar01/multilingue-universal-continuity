/**
 * LLM Free - Sistema de IA com prioridade LOCAL (gratuito, offline)
 * 
 * Prioridade 1: Ollama local (Qwen2.5:3b — melhor IA gratuita multilingual)
 * Prioridade 2: LM Studio local (se disponível)
 * Prioridade 3: Blackbox AI (gratuito online, fallback)
 * 
 * O aluno deve instalar Ollama + Qwen2.5 para melhor desempenho.
 * Ver página /ia-nativa no app para instruções.
 */

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

interface LLMResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

const LOCAL_QWEN_MODELS = ["qwen2.5:1.5b", "qwen2.5:3b"] as const;

export type LocalQwenAvailability = {
  available: boolean;
  selectedModel: (typeof LOCAL_QWEN_MODELS)[number] | null;
  reason: "ready" | "ollama_unreachable" | "qwen_model_missing";
};

/**
 * A porta do Ollama não é evidência suficiente de disponibilidade. Só marcamos
 * o provedor local como pronto quando um dos modelos Qwen aprovados estiver
 * instalado e listado pela própria instância.
 */
export async function getLocalQwenAvailability(): Promise<LocalQwenAvailability> {
  try {
    const response = await fetch("http://localhost:11434/api/tags", {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) {
      return { available: false, selectedModel: null, reason: "ollama_unreachable" };
    }

    const payload = await response.json() as { models?: Array<{ name?: string }> };
    const installedNames = new Set(
      (payload.models ?? []).map((model) => model.name?.trim().toLowerCase()).filter(Boolean),
    );
    const selectedModel = [...LOCAL_QWEN_MODELS].reverse().find((model) => installedNames.has(model)) ?? null;

    return selectedModel
      ? { available: true, selectedModel, reason: "ready" }
      : { available: false, selectedModel: null, reason: "qwen_model_missing" };
  } catch {
    return { available: false, selectedModel: null, reason: "ollama_unreachable" };
  }
}

/**
 * Invoca Ollama local (Qwen2.5:3b — 100% gratuito e offline)
 * 
 * Requer Ollama instalado: https://ollama.ai
 * Comando: ollama pull qwen2.5:3b
 */
export async function invokeLLMLocal(params: {
  messages: Message[];
  temperature?: number;
  max_tokens?: number;
}): Promise<LLMResponse> {
  const availability = await getLocalQwenAvailability();
  if (!availability.available || !availability.selectedModel) {
    throw new Error("Ollama local com modelo Qwen2.5 aprovado não está disponível.");
  }

  const response = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: availability.selectedModel,
      messages: params.messages,
      stream: false,
      options: {
        temperature: params.temperature ?? 0.7,
        num_predict: params.max_tokens ?? 2000,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(
      "Ollama local não disponível. " +
      "Instale Ollama em https://ollama.ai e execute: ollama pull qwen2.5:3b"
    );
  }

  const data = await response.json();
  
  // Converte formato Ollama para formato OpenAI
  return {
    choices: [{
      message: {
        content: data.message.content,
      },
    }],
  };
}

/**
 * Verifica se Ollama local está disponível
 */
export async function isLocalAvailable(): Promise<boolean> {
  return (await getLocalQwenAvailability()).available;
}

/**
 * Invoca Blackbox AI (gratuito online, fallback quando IA local não disponível)
 */
export async function invokeLLMFree(params: {
  messages: Message[];
  temperature?: number;
  max_tokens?: number;
}): Promise<LLMResponse> {
  const response = await fetch("https://api.blackbox.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "blackbox",
      messages: params.messages,
      temperature: params.temperature ?? 0.7,
      max_tokens: params.max_tokens ?? 2000,
      stream: false,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Blackbox AI error: ${response.status} - ${error}`);
  }

  return response.json();
}

/**
 * Sistema inteligente: IA LOCAL primeiro (gratuito, offline, privado),
 * se falhar usa Blackbox AI (gratuito online) como fallback
 */
export async function invokeLLMSmart(params: {
  messages: Message[];
  temperature?: number;
  max_tokens?: number;
}): Promise<LLMResponse> {
  // Prioridade 1: Ollama local (Qwen2.5:3b)
  try {
    const localStatus = await getLocalQwenAvailability();
    if (localStatus.available && localStatus.selectedModel) {
      console.log(`[IA] Usando Ollama local (${localStatus.selectedModel}) — gratuito e offline`);
      return await invokeLLMLocal(params);
    }
  } catch (error) {
    console.warn("[IA] Ollama local falhou, tentando fallback online:", error);
  }

  // Prioridade 2: Blackbox AI (gratuito online)
  console.log("[IA] Usando Blackbox AI (gratuito online) — fallback");
  return await invokeLLMFree(params);
}
