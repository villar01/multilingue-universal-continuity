/**
 * ARCopilotIA - Copiloto de IA para Realidade Aumentada
 * Integrado com Claude via tRPC para contexto completo de AR
 * Analisa objetos detectados, vocabulário, progresso do aluno
 * Auto-aperfeiçoamento: melhora sugestões com base no histórico
 */
import React, { useState, useRef, useCallback, useEffect } from "react";
import { trpc } from "../lib/trpc";

interface DetectedObject {
  label: string;
  confidence: number;
  x: number;
  y: number;
}

interface ARCopilotContext {
  detectedObjects: DetectedObject[];
  currentLanguage: string;
  currentTeacher: string;
  xpTotal: number;
  level: number;
  recentWords: string[];
  sceneType?: string;
}

interface ARCopilotIAProps {
  context: ARCopilotContext;
  isVisible: boolean;
  onClose: () => void;
  onSuggestWord?: (word: string, translation: string) => void;
  onSpeakText?: (text: string) => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

const ARCopilotIA: React.FC<ARCopilotIAProps> = ({
  context,
  isVisible,
  onClose,
  onSuggestWord,
  onSpeakText,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const aiChat = trpc.ai.chat.useMutation();

  // Scroll automático
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mensagem inicial de boas-vindas
  useEffect(() => {
    if (isVisible && messages.length === 0) {
      const objectList = context.detectedObjects.length > 0
        ? context.detectedObjects.map(o => o.label).join(", ")
        : "nenhum objeto detectado ainda";

      setMessages([{
        role: "assistant",
        content: `Olá! Sou seu Copiloto IA de AR. 🤖\n\nEstou vendo: **${objectList}**\n\nIdioma atual: **${context.currentLanguage}** | Nível: **${context.level}** | XP: **${context.xpTotal}**\n\nPosso ajudar com:\n• Vocabulário dos objetos detectados\n• Pronúncia e frases\n• Dicas de aprendizado\n• Quizzes personalizados\n\nO que você quer aprender?`,
        timestamp: Date.now(),
      }]);
    }
  }, [isVisible, context.detectedObjects.length]);

  // Construir prompt de contexto AR
  const buildARPrompt = useCallback((userMessage: string): string => {
    const objectList = context.detectedObjects.length > 0
      ? context.detectedObjects.map(o => `${o.label} (${Math.round(o.confidence * 100)}%)`).join(", ")
      : "nenhum";

    return `Você é um assistente de aprendizado de idiomas especializado em Realidade Aumentada.

CONTEXTO ATUAL DO ALUNO:
- Idioma aprendendo: ${context.currentLanguage}
- Professor: ${context.currentTeacher}
- Nível: ${context.level} | XP: ${context.xpTotal}
- Palavras recentes: ${context.recentWords.slice(-5).join(", ") || "nenhuma"}
- Cena: ${context.sceneType || "geral"}

OBJETOS DETECTADOS PELA CÂMERA AR:
${objectList}

MENSAGEM DO ALUNO: ${userMessage}

Responda em português de forma concisa e educativa. 
Se o aluno perguntar sobre vocabulário, forneça:
1. A palavra em ${context.currentLanguage}
2. Pronúncia fonética
3. Uma frase de exemplo curta
4. Dica de memorização

Mantenha respostas com máximo 150 palavras. Use emojis para tornar mais visual.`;
  }, [context]);

  // Enviar mensagem
  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    setMessages(prev => [...prev, {
      role: "user",
      content: userMessage,
      timestamp: Date.now(),
    }]);

    try {
      const prompt = buildARPrompt(userMessage);
      const result = await aiChat.mutateAsync({
        message: prompt,
        languageCode: context.currentLanguage || "en",
        conversationHistory: messages.slice(-6).map(m => ({ role: m.role, content: m.content })),
      });

      const response = result.response || "Desculpe, não consegui processar sua pergunta.";

      setMessages(prev => [...prev, {
        role: "assistant",
        content: response,
        timestamp: Date.now(),
      }]);

      // Auto-falar resposta se disponível
      onSpeakText?.(response.replace(/[*#_`]/g, "").substring(0, 200));

    } catch (error) {
      // Fallback inteligente sem API
      const fallbackResponse = generateFallbackResponse(userMessage, context);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: fallbackResponse,
        timestamp: Date.now(),
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, buildARPrompt, aiChat, onSpeakText, context]);

  // Resposta fallback quando IA offline
  const generateFallbackResponse = (message: string, ctx: ARCopilotContext): string => {
    const msg = message.toLowerCase();
    const lang = ctx.currentLanguage;

    if (msg.includes("vocabulário") || msg.includes("palavra") || msg.includes("como se diz")) {
      const obj = ctx.detectedObjects[0];
      if (obj) {
        return `📚 Objeto detectado: **${obj.label}**\n\nEm ${lang}: procure no dicionário online para a tradução mais precisa.\n\n💡 Dica: Toque no objeto na tela para ver a tradução automática!`;
      }
    }

    if (msg.includes("quiz") || msg.includes("teste") || msg.includes("exercício")) {
      return `🎯 Quiz rápido!\n\nObjetos detectados: ${ctx.detectedObjects.map(o => o.label).join(", ")}\n\nQual desses objetos você já sabe em ${lang}? Tente pronunciar em voz alta!`;
    }

    if (msg.includes("nível") || msg.includes("progresso") || msg.includes("xp")) {
      return `📊 Seu progresso:\n• Nível: **${ctx.level}**\n• XP Total: **${ctx.xpTotal}**\n• Palavras recentes: ${ctx.recentWords.length}\n\nContinue praticando! Cada objeto que você toca ganha XP! 🌟`;
    }

    return `🤖 Estou analisando o contexto AR...\n\nObjetos visíveis: ${ctx.detectedObjects.map(o => o.label).join(", ") || "nenhum"}\n\nTente tocar nos objetos na tela para aprender vocabulário em ${lang}!`;
  };

  // Sugestões rápidas baseadas no contexto
  const quickSuggestions = [
    "Como se diz os objetos que vejo?",
    "Me dê um quiz sobre o que está na tela",
    "Mostre frases com esses objetos",
    "Qual meu progresso hoje?",
  ];

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col"
      style={{ width: isMinimized ? "auto" : "320px" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 rounded-t-xl cursor-pointer"
        style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-white font-bold text-sm">🤖 Copiloto AR</span>
          {context.detectedObjects.length > 0 && (
            <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
              {context.detectedObjects.length} objetos
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            className="text-white/70 hover:text-white text-xs px-1"
            onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
          >
            {isMinimized ? "▲" : "▼"}
          </button>
          <button
            className="text-white/70 hover:text-white text-xs px-1"
            onClick={(e) => { e.stopPropagation(); onClose(); }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Body */}
      {!isMinimized && (
        <div className="flex flex-col bg-gray-900/95 backdrop-blur rounded-b-xl border border-purple-500/30 shadow-2xl">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ maxHeight: "300px", minHeight: "200px" }}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-800 text-gray-100 border border-gray-700"
                  }`}
                >
                  {msg.content.split("\n").map((line, i) => (
                    <div key={i}>
                      {line.split(/(\*\*[^*]+\*\*)/).map((part, j) =>
                        part.startsWith("**") && part.endsWith("**")
                          ? <strong key={j}>{part.slice(2, -2)}</strong>
                          : part
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 rounded-xl px-3 py-2 border border-gray-700">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          {messages.length <= 1 && (
            <div className="px-3 pb-2 flex flex-wrap gap-1">
              {quickSuggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => { setInput(s); inputRef.current?.focus(); }}
                  className="text-xs bg-purple-900/50 hover:bg-purple-800/50 text-purple-300 border border-purple-700/50 rounded-full px-2 py-1 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex gap-2 p-3 border-t border-gray-700/50">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Pergunte ao Copiloto AR..."
              className="flex-1 bg-gray-800 text-white text-xs rounded-lg px-3 py-2 border border-gray-700 focus:border-purple-500 focus:outline-none"
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-lg px-3 py-2 text-xs font-bold transition-colors"
            >
              ➤
            </button>
          </div>

          {/* Context info */}
          <div className="px-3 pb-2 flex items-center gap-2 text-xs text-gray-500">
            <span>🌍 {context.currentLanguage}</span>
            <span>⭐ Nível {context.level}</span>
            <span>🎯 {context.xpTotal} XP</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ARCopilotIA;
