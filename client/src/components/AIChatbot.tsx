import { useState, useRef, useEffect, useMemo } from 'react';
import { Send, Mic, Volume2, Bot, User, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { speakText as speakNaturalVoice } from '@/hooks/useNaturalVoice';
import { useLanguage } from '@/contexts/LanguageContext';
import type { CEFRLevel } from '@/lib/lesson-levels';
import { microphoneErrorMessage, requestMicrophoneStream } from '@/lib/microphoneAccess';

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
  level?: CEFRLevel;
  teacherName?: string;
}

/**
 * Chatbot IA Conversacional para prática de idiomas
 * Corrige gramática, sugere melhorias e pratica vocabulário da lição
 */
export default function AIChatbot({ lessonId, vocabulary, languageCode, level = 'A1', teacherName = 'Professor' }: AIChatbotProps) {
  const { profile } = useLanguage();
  const targetLanguage = languageCode || profile.targetCode;
  const nativeLanguage = profile.nativeCode;
  const [latestFeedback, setLatestFeedback] = useState<{
    feedback: string;
    corrections: Array<{ original: string; corrected: string; explanation: string }>;
    encouragement: string;
  } | null>(null);
  const storageKey = `ml_chat_history_${lessonId}_${teacherName}`;
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
        content: `${teacherName}: prática de ${targetLanguage}. Use o vocabulário desta lição e comece com: ${vocabulary.slice(0, 3).map(v => v.word).join(', ')}.`,
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
  const recognitionRef = useRef<any>(null);
  const microphoneStreamRef = useRef<MediaStream | null>(null);

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
  const feedbackMutation = trpc.conversationAI.feedback.useMutation({
    onSuccess: (feedback) => setLatestFeedback(feedback),
    onError: () => {
      // A conversa principal permanece utilizável se o feedback complementar falhar.
      setLatestFeedback(null);
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => () => {
    recognitionRef.current?.stop?.();
    microphoneStreamRef.current?.getTracks().forEach((track) => track.stop());
    microphoneStreamRef.current = null;
  }, []);

  const handleSend = async () => {
    if (!input.trim() || chatMutation.isPending) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLatestFeedback(null);

    // A conversa e o feedback usam o mesmo par de idiomas e estágio CEFR.
    chatMutation.mutate({
      lessonId,
      targetLanguage,
      nativeLanguage,
      userLevel: level,
      history: messages.concat(userMessage).map(m => ({
        role: m.role,
        content: m.content
      }))
    });
    feedbackMutation.mutate({
      lessonId,
      targetLanguage,
      nativeLanguage,
      userLevel: level,
      userMessage: userMessage.content,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const playAudio = (text: string) => {
    speakNaturalVoice(text, targetLanguage, { rate: 0.9 });
  };

  const stopRecording = () => {
    recognitionRef.current?.stop?.();
    recognitionRef.current = null;
    microphoneStreamRef.current?.getTracks().forEach((track) => track.stop());
    microphoneStreamRef.current = null;
    setIsRecording(false);
  };

  const startRecording = async () => {
    if (isRecording) {
      stopRecording();
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('A transcrição por voz não é compatível com este navegador. Digite sua resposta ou use o botão de voz da conversa guiada.');
      return;
    }

    try {
      // Esta chamada ocorre apenas pelo clique do aluno, preservando o pedido de permissão nativo do navegador.
      const stream = await requestMicrophoneStream();
      microphoneStreamRef.current = stream;
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = targetLanguage;
      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let index = event.resultIndex; index < event.results.length; index += 1) {
          transcript += event.results[index][0].transcript;
        }
        setInput(transcript.trim());
      };
      recognition.onerror = (event: any) => {
        if (event.error !== 'aborted') toast.error(`Não foi possível transcrever a fala: ${event.error}.`);
      };
      recognition.onend = () => {
        microphoneStreamRef.current?.getTracks().forEach((track) => track.stop());
        microphoneStreamRef.current = null;
        recognitionRef.current = null;
        setIsRecording(false);
      };
      recognition.start();
      setIsRecording(true);
      toast.info('Microfone ativo. Fale no idioma estudado e toque novamente para encerrar.');
    } catch (error) {
      console.error('[AIChatbot] Microphone error:', error);
      stopRecording();
      toast.error(microphoneErrorMessage(error));
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-xl shadow-lg border-2 border-blue-200">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-xl">
        <Bot className="h-6 w-6" />
        <div className="flex-1">
          <h3 className="font-semibold">Prática de conversa com IA</h3>
          <p className="text-xs text-blue-100">{nativeLanguage} → {targetLanguage} · {level}</p>
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

        {latestFeedback && (
          <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm" aria-label="Feedback gramatical da resposta">
            <p className="font-semibold text-emerald-900">Feedback do professor</p>
            <p className="mt-1 text-emerald-900">{latestFeedback.feedback}</p>
            {latestFeedback.corrections.length > 0 && (
              <div className="mt-3 space-y-2">
                {latestFeedback.corrections.map((correction, index) => (
                  <div key={`${correction.original}-${index}`} className="rounded-lg bg-white p-2 text-xs text-slate-700">
                    <p><span className="font-semibold text-rose-700">Como foi escrito:</span> {correction.original}</p>
                    <p><span className="font-semibold text-emerald-700">Forma sugerida:</span> {correction.corrected}</p>
                    <p className="mt-1 text-slate-600">{correction.explanation}</p>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-2 font-medium text-emerald-800">{latestFeedback.encouragement}</p>
          </section>
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
              placeholder={`Escreva ou fale em ${targetLanguage}...`}
              className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:outline-none resize-none text-sm"
              rows={2}
              disabled={chatMutation.isPending}
            />
            <button
              onClick={startRecording}
              disabled={chatMutation.isPending}
              className="absolute right-3 bottom-3 p-1.5 hover:bg-gray-200 rounded-full transition-colors"
              title={isRecording ? 'Encerrar microfone' : 'Falar resposta'}
              aria-pressed={isRecording}
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
          💡 Dica: use o vocabulário da lição. O feedback gramatical aparece após cada tentativa.
        </p>
      </div>
    </div>
  );
}
