/**
 * LLM Free - Sistema de IA independente sem dependência Manus
 * 
 * Usa Blackbox AI (gratuito, sem limites para uso educacional)
 * Modelo: blackbox (rápido e gratuito)
 * 
 * Após deploy, funciona sem necessidade de API key própria.
 * Blackbox AI é completamente gratuito e sem restrições.
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

/**
 * Invoca Blackbox AI (gratuito, sem limites)
 * 
 * @param messages - Array de mensagens do chat
 * @returns Resposta do LLM
 */
export async function invokeLLMFree(params: {
  messages: Message[];
  temperature?: number;
  max_tokens?: number;
}): Promise<LLMResponse> {
  
  // Blackbox AI não requer API key
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
 * Fallback: se Blackbox falhar, tenta Ollama local (100% offline)
 * 
 * Requer Ollama instalado localmente: https://ollama.ai
 * Comando: ollama run llama3.2
 */
export async function invokeLLMLocal(params: {
  messages: Message[];
}): Promise<LLMResponse> {
  const response = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama3.2",
      messages: params.messages,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(
      "Ollama local não disponível. " +
      "Instale Ollama em https://ollama.ai e execute: ollama run llama3.2"
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
 * Sistema inteligente: tenta Blackbox (gratuito), se falhar usa Ollama (local/offline)
 */
export async function invokeLLMSmart(params: {
  messages: Message[];
  temperature?: number;
  max_tokens?: number;
}): Promise<LLMResponse> {
  try {
    return await invokeLLMFree(params);
  } catch (error) {
    console.warn("Blackbox AI falhou, tentando Ollama local:", error);
    return await invokeLLMLocal(params);
  }
}
