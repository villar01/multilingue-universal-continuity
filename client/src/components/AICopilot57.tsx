/**
 * AICopilot57 - Copiloto IA com Auto-Desenvolvimento Claude
 * Analisa o progresso do aluno e sugere melhorias em tempo real
 * Usa Claude via tRPC para respostas inteligentes e personalizadas
 */

import { useState, useEffect, useRef } from 'react';
import { trpc } from '@/lib/trpc';
import { Teacher57 } from '@/data/teachers57';

interface CopilotMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface LearningContext {
  teacher: Teacher57;
  targetLang: string;
  learnedWords: string[];
  xp: number;
  sessionMinutes: number;
  detectedObjects?: string[];
}

interface AICopilot57Props {
  context: LearningContext;
  onSpeakText?: (text: string, lang: string) => void;
  compact?: boolean;
}

export function AICopilot57({ context, onSpeakText, compact = false }: AICopilot57Props) {
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [autoTip, setAutoTip] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatMutation = trpc.ai.chat.useMutation({
    onSuccess: (data) => {
      const reply = data?.response || 'Desculpe, não consegui responder.';
      const msg: CopilotMessage = {
        role: 'assistant',
        content: reply,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, msg]);
      setIsTyping(false);
      // Falar resposta com voz do professor
      if (onSpeakText) {
        onSpeakText(reply, context.teacher.voiceLang);
      }
    },
    onError: () => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Erro ao conectar com IA. Tente novamente.',
        timestamp: Date.now(),
      }]);
    },
  });

  // Auto-dica baseada no progresso
  useEffect(() => {
    const tips = [
      `Você aprendeu ${context.learnedWords.length} palavras! Continue assim! 🎉`,
      `Dica: Repita cada palavra em voz alta para fixar melhor.`,
      `${context.teacher.name} diz: "${context.teacher.greeting}"`,
      `XP atual: ${context.xp}. Próximo nível em ${100 - (context.xp % 100)} XP!`,
      `Tente apontar a câmera para objetos do dia a dia para aprender mais!`,
    ];
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    setAutoTip(randomTip);
  }, [context.learnedWords.length, context.xp]);

  // Scroll automático
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mensagem de boas-vindas
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: `Olá! Sou ${context.teacher.name}, seu copiloto de IA! 🤖\n\nEstou aqui para ajudar você a aprender ${context.teacher.language}.\n\nVocê já aprendeu ${context.learnedWords.length} palavras. Pergunte-me qualquer coisa!`,
        timestamp: Date.now(),
      }]);
    }
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: CopilotMessage = {
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Contexto para o Claude
    const systemPrompt = `Você é ${context.teacher.name}, professor(a) de ${context.teacher.language} (${context.teacher.origin}).
Personalidade: ${context.teacher.personality}
Especialidade: ${context.teacher.specialty}

O aluno está aprendendo ${context.teacher.language} via Realidade Aumentada.
Progresso atual:
- Palavras aprendidas: ${context.learnedWords.join(', ') || 'nenhuma ainda'}
- XP: ${context.xp}
- Tempo de sessão: ${context.sessionMinutes} minutos
- Objetos detectados pela câmera: ${context.detectedObjects?.join(', ') || 'nenhum'}

Responda de forma natural, motivadora e em português (ou no idioma que o aluno usar).
Inclua exemplos práticos e palavras em ${context.teacher.language} quando relevante.
Seja conciso (máx 3 frases) e use emojis com moderação.`;

    chatMutation.mutate({
      message: input,
      languageCode: context.targetLang,
      conversationHistory: [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      ],
    });
  };

  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          🤖 Copiloto IA
          {messages.length > 1 && (
            <span className="bg-purple-400 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {messages.length - 1}
            </span>
          )}
        </button>

        {isOpen && (
          <div className="absolute bottom-12 right-0 w-80 bg-gray-900 rounded-2xl shadow-2xl border border-purple-500/30 z-50">
            <div className="p-3 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{context.teacher.avatar}</span>
                <div>
                  <p className="text-sm font-bold text-white">{context.teacher.name}</p>
                  <p className="text-xs text-purple-400">Copiloto IA Ativo</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <div className="h-48 overflow-y-auto p-3 space-y-2">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-xl px-3 py-2 text-xs ${
                    msg.role === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-200'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-800 rounded-xl px-3 py-2 text-xs text-gray-400">
                    {context.teacher.name} está digitando...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 border-t border-gray-700 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Pergunte algo..."
                className="flex-1 bg-gray-800 text-white text-xs rounded-lg px-2 py-1.5 outline-none border border-gray-700 focus:border-purple-500"
              />
              <button
                onClick={sendMessage}
                disabled={isTyping || !input.trim()}
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs px-2 py-1.5 rounded-lg"
              >
                ➤
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-2xl p-4 text-white">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
          style={{ backgroundColor: context.teacher.color + '33', border: `2px solid ${context.teacher.color}` }}
        >
          {context.teacher.avatar}
        </div>
        <div>
          <h3 className="font-bold text-white">{context.teacher.name}</h3>
          <p className="text-xs text-purple-400">🤖 Copiloto IA • Auto-desenvolvimento ativo</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-xs text-yellow-400">⚡ {context.xp} XP</p>
          <p className="text-xs text-green-400">📚 {context.learnedWords.length} palavras</p>
        </div>
      </div>

      {/* Auto-dica */}
      {autoTip && (
        <div className="bg-purple-900/30 border border-purple-500/30 rounded-xl p-3 mb-3 text-xs text-purple-200">
          💡 {autoTip}
        </div>
      )}

      {/* Mensagens */}
      <div className="h-56 overflow-y-auto space-y-2 mb-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
              msg.role === 'user'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-200'
            }`}>
              {msg.content}
              {msg.role === 'assistant' && onSpeakText && (
                <button
                  onClick={() => onSpeakText(msg.content, context.teacher.voiceLang)}
                  className="ml-2 text-xs opacity-60 hover:opacity-100"
                >
                  🔊
                </button>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-xl px-3 py-2 text-sm text-gray-400 animate-pulse">
              {context.teacher.name} está pensando...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder={`Pergunte para ${context.teacher.name}...`}
          className="flex-1 bg-gray-800 text-white text-sm rounded-xl px-3 py-2 outline-none border border-gray-700 focus:border-purple-500"
        />
        <button
          onClick={sendMessage}
          disabled={isTyping || !input.trim()}
          className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl font-medium transition-colors"
        >
          ➤
        </button>
      </div>

      {/* Sugestões rápidas */}
      <div className="flex gap-2 mt-2 flex-wrap">
        {[
          'Como se diz "obrigado"?',
          'Me dê uma dica',
          'Qual é meu progresso?',
          'Ensine uma frase',
        ].map(suggestion => (
          <button
            key={suggestion}
            onClick={() => { setInput(suggestion); }}
            className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-2 py-1 rounded-lg transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}

export default AICopilot57;
