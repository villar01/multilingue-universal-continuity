import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2, Send } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface VideoCharacterChatProps {
  characterName: string;
  videoTitle: string;
  videoContext: string;
}

export default function VideoCharacterChat({
  characterName,
  videoTitle,
  videoContext,
}: VideoCharacterChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const chatMutation = trpc.aiTranslation.chatWithCharacter.useMutation({
    onSuccess: (data: any) => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
    },
  });

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);

    chatMutation.mutate({
      characterName,
      videoContext,
      userMessage: input,
      conversationHistory: messages,
    });

    setInput("");
  };

  return (
    <Card className="p-4 mt-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">
          💬 Converse com {characterName}
        </h3>
        <p className="text-sm text-muted-foreground">
          Pratique conversação sobre "{videoTitle}"
        </p>
      </div>

      <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <p>Inicie uma conversa com {characterName}!</p>
            <p className="text-sm mt-2">
              Pergunte sobre o vídeo, peça dicas ou pratique diálogos.
            </p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {chatMutation.isPending && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg px-4 py-2">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={`Converse com ${characterName}...`}
          className="min-h-[60px]"
          disabled={chatMutation.isPending}
        />
        <Button
          onClick={handleSend}
          disabled={!input.trim() || chatMutation.isPending}
          size="icon"
          className="h-[60px] w-[60px]"
        >
          {chatMutation.isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>
    </Card>
  );
}
