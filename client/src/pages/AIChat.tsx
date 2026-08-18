import { useState, useRef, useEffect } from "react";
import { trpc } from "../lib/trpc";
import { trackAggregateLearningEvent } from "../lib/aggregateAnalytics";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Send, Loader2, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";
import VirtualTeacher from "../components/VirtualTeacher";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [languageCode, setLanguageCode] = useState("en");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const chatMutation = trpc.ai.chat.useMutation();
  const ttsMutation = trpc.tts.generate.useMutation();

  useEffect(() => {
    trackAggregateLearningEvent("open_teacher");
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const response = await chatMutation.mutateAsync({
        message: input,
        languageCode,
        conversationHistory: messages.map((m) => ({
          role: m.role === "user" ? "user" : "assistant",
          content: m.content,
        })),
      });

      const assistantMessage: Message = {
        role: "assistant",
        content: response.response,
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Gerar áudio da resposta
      playAudio(response.response);
    } catch (error) {
      toast.error("Erro ao enviar mensagem");
      console.error(error);
    }
  };

  const playAudio = async (text: string) => {
    try {
      setIsPlayingAudio(true);
      const audioData = await ttsMutation.mutateAsync({
        text,
        languageCode,
      });

      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(audioData.audioUrl);
      audioRef.current = audio;
      
      audio.onended = () => setIsPlayingAudio(false);
      audio.onerror = () => {
        setIsPlayingAudio(false);
        toast.error("Erro ao reproduzir áudio");
      };
      
      await audio.play();
    } catch (error) {
      setIsPlayingAudio(false);
      console.error("Erro ao gerar áudio:", error);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlayingAudio(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid md:grid-cols-[300px_1fr] gap-6">
          {/* Avatar do Professor */}
          <div className="hidden md:block">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Seu Professor</CardTitle>
              </CardHeader>
              <CardContent>
                <VirtualTeacher
                  expression={chatMutation.isPending ? "thinking" : "happy"}
                  text={
                    chatMutation.isPending
                      ? "Pensando..."
                      : messages.length === 0
                      ? "Olá! Como posso ajudar?"
                      : messages[messages.length - 1]?.role === "assistant"
                      ? messages[messages.length - 1].content
                      : ""
                  }
                  audioUrl=""
                />
              </CardContent>
            </Card>
          </div>

          {/* Chat */}
          <Card className="flex flex-col h-[calc(100vh-120px)]">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle>💬 Conversação com IA</CardTitle>
                <div className="flex items-center gap-2">
                  <select
                    value={languageCode}
                    onChange={(e) => setLanguageCode(e.target.value)}
                    className="px-3 py-1 border rounded-md text-sm"
                  >
                    <option value="en">🇬🇧 English</option>
                    <option value="es">🇪🇸 Español</option>
                    <option value="fr">🇫🇷 Français</option>
                    <option value="de">🇩🇪 Deutsch</option>
                    <option value="pt">🇧🇷 Português</option>
                  </select>
                  {isPlayingAudio ? (
                    <Button variant="outline" size="sm" onClick={stopAudio}>
                      <VolumeX className="h-4 w-4" />
                    </Button>
                  ) : null}
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-20">
                  <p className="text-lg font-semibold mb-2">
                    Comece uma conversa!
                  </p>
                  <p className="text-sm">
                    Pratique o idioma conversando naturalmente com a IA
                  </p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        msg.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
              {chatMutation.isPending && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg px-4 py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </CardContent>

            <div className="border-t p-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  disabled={chatMutation.isPending}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  disabled={chatMutation.isPending || !input.trim()}
                >
                  {chatMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
