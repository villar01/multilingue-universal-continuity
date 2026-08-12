import { useState, useRef, useEffect, useMemo } from 'react';
import { Send, Mic, Volume2, Bot, User, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { speakText as speakNaturalVoice } from '@/hooks/useNaturalVoice';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatbotProps {
  lessonId: number;
  vocabulary: Array<{
    word: string;
    translation: string;
    phonetic: string;
    example: string;
  }>;
  languageCode: string;
}

/**
 * Chatbot IA Conversacional para prática de idiomas
 * Corrige gramática, sugere melhorias e pratica vocabulário da lição
 */
export default function AIChatbot({ lessonId, vocabulary, languageCode }: AIChatbotProps) {
  const storageKey = `ml_chat_history_${lessonId}`;
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
        }
      }
    } catch {}
    return [
      {
        role: 'assistant',
        content: `Hello! I'm your AI conversation partner. Let's practice using the vocabulary from this lesson. Try using words like: ${vocabulary.slice(0, 3).map(v => v.word).join(', ')}...`,
        timestamp: new Date(),
      },
    ];
  });

  // Persist conversation history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages.slice(-50))); // Keep last 50 messages
    } catch {}
  }, [messages, storageKey]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversationStats = useMemo(() => {
    const learnerMessages = messages.filter((message) => message.role === 'user');
    const learnerWords = learnerMessages.reduce((total, message) => {
      return total + message.content.trim().split(/\s+/).filter(Boolean).length;
    }, 0);
    const practicedWords = vocabulary.filter((item) => {
      const normalizedWord = item.word.toLocaleLowerCase();
      return learnerMessages.some((message) => message.content.toLocaleLowerCase().includes(normalizedWord));
    });

    return {
      turns: learnerMessages.length,
      learnerWords,
      practicedWords,
    };
  }, [messages, vocabulary]);

  const chatMutation = trpc.conversationAI.continue.useMutation({
    onSuccess: (response: any) => {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: response.response,
          timestamp: new Date(),
        },
      ]);
    },
    onError: (error: any) => {
      toast.error('Erro na conversa: ' + error.message);
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || chatMutation.isPending) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Enviar para IA com contexto da lição
    chatMutation.mutate({
      lessonId,
      targetLanguage: "English",
      nativeLanguage: "Portuguese",
      userLevel: "beginner",
      history: messages.concat(userMessage).map(m => ({
        role: m.role,
        content: m.content
      }))
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const playAudio = (text: string) => {
    speakNaturalVoice(text, languageCode, { rate: 0.9 });
  };

  const startRecording = () => {
    // Implementar gravação de voz (Web Speech API)
    toast.info('Gravação de voz em desenvolvimento');
  };

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-xl shadow-lg border-2 border-blue-200">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-xl">
        <Bot className="h-6 w-6" />
        <div className="flex-1">
          <h3 className="font-semibold">AI Conversation Partner</h3>
          <p className="text-xs text-blue-100">Practice speaking naturally</p>
        </div>
        <div className="flex items-center gap-1.5 bg-white/20 px-2 py-1 rounded-full text-xs">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          Online
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 border-b border-blue-100 bg-blue-50 px-4 py-2 text-center text-xs">
        <div><strong className="block text-blue-700">{conversationStats.turns}</strong><span className="text-slate-500">turnos</span></div>
        <div><strong className="block text-blue-700">{conversationStats.learnerWords}</strong><span className="text-slate-500">palavras</span></div>
        <div><strong className="block text-blue-700">{conversationStats.practicedWords.length}</strong><span className="text-slate-500">vocábulos praticados</span></div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-purple-600 text-white'
              }`}
            >
              {msg.role === 'user' ? (
                <User className="h-5 w-5" />
              ) : (
                <Bot className="h-5 w-5" />
              )}
            </div>

            {/* Message bubble */}
            <div
              className={`flex-1 max-w-[75%] ${
                msg.role === 'user' ? 'text-right' : 'text-left'
              }`}
            >
              <div
                className={`inline-block px-4 py-3 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-gray-100 text-gray-900 rounded-tl-none'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </p>
              </div>

              {/* Audio button for assistant messages */}
              {msg.role === 'assistant' && (
                <button
                  onClick={() => playAudio(msg.content)}
                  className="mt-1 ml-2 p-1.5 hover:bg-gray-200 rounded-full transition-colors"
                  title="Ouvir pronúncia"
                >
                  <Volume2 className="h-3.5 w-3.5 text-gray-600" />
                </button>
              )}

              <p className="text-xs text-gray-500 mt-1 px-2">
                {msg.timestamp.toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {chatMutation.isPending && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center">
              <Bot className="h-5 w-5" />
            </div>
            <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-tl-none">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message in English..."
              className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:outline-none resize-none text-sm"
              rows={2}
              disabled={chatMutation.isPending}
            />
            <button
              onClick={startRecording}
              className="absolute right-3 bottom-3 p-1.5 hover:bg-gray-200 rounded-full transition-colors"
              title="Gravar voz"
            >
              <Mic className={`h-4 w-4 ${isRecording ? 'text-red-500' : 'text-gray-600'}`} />
            </button>
          </div>

          <button
            onClick={handleSend}
            disabled={!input.trim() || chatMutation.isPending}
            className="flex-shrink-0 p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
          >
            {chatMutation.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-2 text-center">
          💡 Dica: Use o vocabulário da lição para praticar. A IA corrigirá sua gramática automaticamente!
        </p>
      </div>
    </div>
  );
}
