/**
 * COMPLETE LESSON PAGE
 * Página de aula completa com 5 fases:
 * 1. Apresentação Visual (Ilustração + Introdução)
 * 2. História Narrativa (Texto + Áudio)
 * 3. Vocabulário Contextual (Palavras clicáveis)
 * 4. Gramática Aplicada
 * 5. Conversação Livre com IA
 */

import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Volume2, Send, BookOpen, MessageSquare, GraduationCap, Sparkles, Mic, MicOff } from "lucide-react";
import { toast } from "sonner";
import EnhancedTeacherAvatar from "@/components/EnhancedTeacherAvatar";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import ClickableText from "@/components/ClickableWord";
import PhrasalVerbsDictionary from "@/components/PhrasalVerbsDictionary";

interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface Lesson {
  id: number;
  courseId?: number;
  title: string;
  description?: string;
  audioUrl?: string;
  vocabularyDetailed?: any;
  grammarDetailed?: any;
  phonetics?: any;
  [key: string]: any;
}

export default function CompleteLesson() {
  const params = useParams();
  const lessonId = parseInt(params.id || "0");
  const [, navigate] = useLocation();

  // Estados
  const [currentPhase, setCurrentPhase] = useState<"intro" | "story" | "vocabulary" | "grammar" | "conversation">("intro");
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [userMessage, setUserMessage] = useState("");
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [lessonStartedAt] = useState(() => Date.now());
  const { isRecording, audioBlob, startRecording, stopRecording, reset: resetRecording } = useVoiceRecording();
  const [isTranscribing, setIsTranscribing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Queries
  const { data: lesson, isLoading } = trpc.lessons.getById.useQuery({ lessonId: lessonId }) as { data: Lesson | undefined, isLoading: boolean };
  
  // Mutations
  const startConversation = trpc.conversationAI.start.useMutation();
  const continueConversation = trpc.conversationAI.continue.useMutation();
  const generateAudio = trpc.tts.generate.useMutation();
  const transcribeAudio = trpc.voiceTranscription.transcribe.useMutation();
  const completeLesson = trpc.progress.completeLesson.useMutation();
  const utils = trpc.useUtils();

  const handleCompleteLesson = async () => {
    if (!lesson) return;

    try {
      await completeLesson.mutateAsync({
        lessonId: lesson.id,
        courseId: lesson.courseId || 1,
        score: 100,
        timeSpentSeconds: Math.max(60, Math.floor((Date.now() - lessonStartedAt) / 1000)),
      });
      await Promise.all([
        utils.progress.getCompletedLessons.invalidate(),
        utils.progress.getStats.invalidate(),
      ]);
      toast.success("Lição concluída! A próxima aula foi desbloqueada.");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error completing lesson:", error);
      toast.error("Não foi possível registrar a conclusão. Tente novamente.");
    }
  };

  // Auto-scroll no chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversationHistory]);

  // Iniciar conversa quando entrar na fase de conversação
  useEffect(() => {
    if (currentPhase === "conversation" && conversationHistory.length === 0 && lesson) {
      handleStartConversation();
    }
  }, [currentPhase, lesson]);

  const handleStartConversation = async () => {
    if (!lesson) return;

    try {
      const result = await startConversation.mutateAsync({
        lessonId: lesson.id,
        userLevel: "beginner",
        targetLanguage: "English",
        nativeLanguage: "Portuguese",
      });

      const aiMessage: ConversationMessage = {
        role: "assistant",
        content: result.question,
        timestamp: new Date(),
      };

      setConversationHistory([aiMessage]);
      
      // Falar a pergunta
      speakText(result.question);
    } catch (error) {
      console.error("Error starting conversation:", error);
      toast.error("Erro ao iniciar conversa");
    }
  };

  // Processar gravação de voz
  const handleVoiceInput = async () => {
    if (isRecording) {
      // Parar gravação
      stopRecording();
      toast.info("⏸️ Gravação parada. Processando...");
    } else {
      // Iniciar gravação
      try {
        console.log("[handleVoiceInput] Solicitando permissão de microfone...");
        await startRecording();
        console.log("[handleVoiceInput] Gravação iniciada com sucesso!");
        toast.success("🎤 Gravando... Fale agora! Clique novamente para parar");
      } catch (error: any) {
        console.error("[handleVoiceInput] Erro ao acessar microfone:", error);
        if (error.name === 'NotAllowedError' || error.message.includes('permission')) {
          toast.error("❌ Permissão de microfone negada! Clique no ícone de controles deslizantes à esquerda do endereço, abra Permissões e permita o Microfone.");
        } else if (error.name === 'NotFoundError') {
          toast.error("❌ Nenhum microfone encontrado! Conecte um microfone e tente novamente.");
        } else {
          toast.error("❌ Erro ao acessar microfone: " + error.message);
        }
      }
    }
  };

  // Transcrever áudio quando blob estiver disponível
  useEffect(() => {
    if (audioBlob && !isTranscribing) {
      handleTranscription();
    }
  }, [audioBlob]);

  const handleTranscription = async () => {
    if (!audioBlob) return;

    setIsTranscribing(true);
    try {
      // Converter blob para base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        
        toast.info("Transcrevendo áudio...");
        const result = await transcribeAudio.mutateAsync({
          audioData: base64Audio,
          language: "en",
        });

        // Adicionar transcrição ao campo de mensagem
        setUserMessage(result.text);
        toast.success("Transcrição concluída!");
        resetRecording();
      };
    } catch (error) {
      console.error("Erro ao transcrever:", error);
      toast.error("Erro ao transcrever áudio");
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!userMessage.trim() || !lesson) {
      console.log("[handleSendMessage] Mensagem vazia ou lição não carregada");
      return;
    }

    const userMsg: ConversationMessage = {
      role: "user",
      content: userMessage,
      timestamp: new Date(),
    };

    console.log("[handleSendMessage] Enviando mensagem:", userMsg.content);
    setConversationHistory(prev => [...prev, userMsg]);
    setUserMessage("");

    try {
      console.log("[handleSendMessage] Chamando continueConversation.mutateAsync...");
      const result = await continueConversation.mutateAsync({
        lessonId: lesson.id,
        userLevel: "beginner",
        targetLanguage: "English",
        nativeLanguage: "Portuguese",
        history: conversationHistory.concat(userMsg).map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
      });

      console.log("[handleSendMessage] Resposta recebida:", result);

      if (!result || !result.response) {
        console.error("[handleSendMessage] Resposta vazia ou inválida:", result);
        throw new Error("Resposta vazia do servidor");
      }

      const aiMessage: ConversationMessage = {
        role: "assistant",
        content: result.response,
        timestamp: new Date(),
      };

      console.log("[handleSendMessage] Adicionando resposta ao histórico:", aiMessage.content);
      setConversationHistory(prev => [...prev, aiMessage]);
      
      // Falar a resposta
      try {
        await speakText(result.response);
      } catch (ttsError) {
        console.error("[handleSendMessage] Erro ao gerar áudio TTS:", ttsError);
        // Não bloquear conversação se TTS falhar
      }
    } catch (error) {
      console.error("[handleSendMessage] Erro ao enviar mensagem:", error);
      toast.error("Erro ao enviar mensagem. Tente novamente.");
      
      // Adicionar mensagem de fallback
      const fallbackMessage: ConversationMessage = {
        role: "assistant",
        content: "[PT] Desculpe, tive um problema técnico. Pode repetir sua pergunta?\n[EN] Sorry, I had a technical issue. Can you repeat your question?",
        timestamp: new Date(),
      };
      setConversationHistory(prev => [...prev, fallbackMessage]);
    }
  };

  const speakText = async (text: string) => {
    setIsAISpeaking(true);
    try {
      const result = await generateAudio.mutateAsync({
        text,
        languageCode: "en-US",
        voiceGender: "FEMALE",
        speakingRate: 1.0,
      });

      const audio = new Audio(result.audioUrl);
      audio.onended = () => setIsAISpeaking(false);
      audio.play();
    } catch (error) {
      console.error("Error generating audio:", error);
      setIsAISpeaking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-lg text-muted-foreground">Lição não encontrada</p>
        <Button onClick={() => navigate("/")}>Voltar</Button>
      </div>
    );
  }

  const vocabularyDetailed = lesson.vocabularyDetailed 
    ? (typeof lesson.vocabularyDetailed === 'string' 
        ? JSON.parse(lesson.vocabularyDetailed) 
        : lesson.vocabularyDetailed)
    : [];

  const grammarDetailed = lesson.grammarDetailed
    ? (typeof lesson.grammarDetailed === 'string'
        ? JSON.parse(lesson.grammarDetailed)
        : lesson.grammarDetailed)
    : [];

  const phonetics = lesson.phonetics
    ? (typeof lesson.phonetics === 'string'
        ? JSON.parse(lesson.phonetics)
        : lesson.phonetics)
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{lesson.title}</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">{lesson.description}</p>
            </div>
            <Button variant="outline" onClick={() => navigate("/")}>
              Voltar
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Tabs */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={currentPhase} onValueChange={(v) => setCurrentPhase(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="intro" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Introdução</span>
            </TabsTrigger>
            <TabsTrigger value="story" className="flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              <span className="hidden sm:inline">História</span>
            </TabsTrigger>
            <TabsTrigger value="vocabulary" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Vocabulário</span>
            </TabsTrigger>
            <TabsTrigger value="grammar" className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              <span className="hidden sm:inline">Gramática</span>
            </TabsTrigger>
            <TabsTrigger value="conversation" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Conversar</span>
            </TabsTrigger>
          </TabsList>

          {/* FASE 1: INTRODUÇÃO */}
          <TabsContent value="intro" className="space-y-6">
            <Card className="p-6">
              {lesson.illustrationUrl && (
                <div className="mb-6">
                  <img
                    src={lesson.illustrationUrl}
                    alt={lesson.title}
                    className="w-full rounded-lg shadow-lg"
                  />
                </div>
              )}
              <div className="prose dark:prose-invert max-w-none">
                <h2>Welcome to this lesson!</h2>
                <p className="text-lg">
                  In this lesson, you will learn about family members, relationships, and daily activities.
                  You'll meet the Smith family and discover their story!
                </p>
                <div className="flex gap-4 mt-6">
                  <Button onClick={() => setCurrentPhase("story")} size="lg">
                    Start Lesson →
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* FASE 2: HISTÓRIA */}
          <TabsContent value="story" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4">The Smith Family Story</h3>
                <ScrollArea className="h-[500px] pr-4">
                  <div className="prose dark:prose-invert">
                    <span className="text-base leading-relaxed">{lesson.storyText}</span>
                  </div>
                </ScrollArea>
              </Card>
              
              <div className="space-y-4">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Your Teacher</h3>
                  <EnhancedTeacherAvatar
                    teacherId={1}
                    isTeaching={true}
                    currentText={lesson.storyText || ""}
                    emotion="happy"
                  />
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* FASE 3: VOCABULÁRIO */}
          <TabsContent value="vocabulary" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-6">Key Vocabulary</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {vocabularyDetailed.map((item: any, idx: number) => (
                  <Card key={idx} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {item.word}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{item.phonetic}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => speakText(item.word)}
                      >
                        <Volume2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-gray-900 dark:text-white mb-2">
                      <strong>Translation:</strong> {item.translation}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      <strong>Synonyms:</strong> {item.synonyms.join(", ")}
                    </p>
                    {item.slang && (
                      <p className="text-sm text-purple-600 dark:text-purple-400 mb-2">
                        <strong>Slang:</strong> {item.slang}
                      </p>
                    )}
                    <p className="text-sm italic text-gray-600 dark:text-gray-400">
                      "{item.example}"
                    </p>
                  </Card>
                ))}
              </div>
            </Card>

            {/* Phonetics */}
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Pronunciation Tips</h3>
              <div className="space-y-4">
                {phonetics.map((item: any, idx: number) => (
                  <div key={idx} className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-bold text-lg">{item.sound} <span className="text-sm text-gray-600">{item.ipa}</span></h4>
                    <p className="text-gray-700 dark:text-gray-300 mb-2">{item.tips}</p>
                    <div className="flex flex-wrap gap-2">
                      {item.examples.map((ex: string, i: number) => (
                        <Button
                          key={i}
                          size="sm"
                          variant="outline"
                          onClick={() => speakText(ex.split(" ")[0])}
                        >
                          {ex}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* FASE 4: GRAMÁTICA */}
          <TabsContent value="grammar" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-6">Grammar Points</h3>
              <div className="space-y-6">
                {grammarDetailed.map((item: any, idx: number) => (
                  <div key={idx} className="border-b pb-6 last:border-b-0">
                    <h4 className="text-lg font-bold text-green-600 dark:text-green-400 mb-2">
                      {item.topic}
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">{item.explanation}</p>
                    
                    <div className="mb-4">
                      <h5 className="font-semibold mb-2">Examples:</h5>
                      <ul className="list-disc list-inside space-y-1">
                        {item.examples.map((ex: string, i: number) => (
                          <li key={i} className="text-gray-700 dark:text-gray-300">{ex}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h5 className="font-semibold mb-2">Practice:</h5>
                      <ul className="list-disc list-inside space-y-1">
                        {item.exercises.map((ex: string, i: number) => (
                          <li key={i} className="text-gray-600 dark:text-gray-400 italic">{ex}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* FASE 5: CONVERSAÇÃO COM IA */}
          <TabsContent value="conversation" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Chat */}
              <Card className="md:col-span-2 p-6">
                <h3 className="text-xl font-bold mb-4">Practice Conversation</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Talk with your AI teacher about the lesson topic and related subjects!
                </p>

                <ScrollArea className="h-[400px] mb-4 border rounded-lg p-4" ref={scrollRef}>
                  <div className="space-y-4">
                    {conversationHistory.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div className="flex items-start gap-2">
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              msg.role === "user"
                                ? "bg-blue-500 text-white"
                                : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                            }`}
                          >
                            <p className="font-medium">{msg.content}</p>
                            {msg.role === "assistant" && msg.content.includes("[PT]") && (
                              <div className="mt-2 pt-2 border-t border-gray-300 dark:border-gray-600">
                                <p className="text-sm opacity-80">
                                  {msg.content.split("[PT]")[1]?.split("[EN]")[0]?.trim() || ""}
                                </p>
                              </div>
                            )}
                            <p className="text-xs mt-1 opacity-70">
                              {msg.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                          {msg.role === "assistant" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => speakText(msg.content)}
                              disabled={isAISpeaking}
                              className="mt-1"
                            >
                              <Volume2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                    {continueConversation.isPending && (
                      <div className="flex justify-start">
                        <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-3">
                          <Loader2 className="w-4 h-4 animate-spin" />
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                <div className="flex gap-2">
                  <Input
                    placeholder={isRecording ? "Gravando..." : "Type your message in English..."}
                    value={userMessage}
                    onChange={(e) => setUserMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    disabled={continueConversation.isPending || isTranscribing}
                  />
                  <Button
                    onClick={handleVoiceInput}
                    disabled={continueConversation.isPending || isTranscribing}
                    variant={isRecording ? "destructive" : "outline"}
                    className={isRecording ? "animate-pulse" : ""}
                  >
                    {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!userMessage.trim() || continueConversation.isPending || isTranscribing}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  onClick={handleCompleteLesson}
                  disabled={completeLesson.isPending}
                  className="mt-4 w-full bg-green-600 hover:bg-green-700"
                >
                  {completeLesson.isPending ? "Registrando conclusão..." : "Concluir lição e desbloquear a próxima"}
                </Button>
              </Card>

              {/* Teacher Avatar */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Your Teacher</h3>
                <EnhancedTeacherAvatar
                  teacherId={1}
                  isTeaching={isAISpeaking}
                  currentText={conversationHistory[conversationHistory.length - 1]?.content || "Hello! Let's practice English together!"}
                  emotion={isAISpeaking ? "encouraging" : "neutral"}
                />
                {isAISpeaking && (
                  <p className="text-sm text-center text-gray-600 dark:text-gray-400 mt-4">
                    🎤 Speaking...
                  </p>
                )}
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Phrasal Verbs Dictionary - Always Available */}
      <PhrasalVerbsDictionary />
    </div>
  );
}
