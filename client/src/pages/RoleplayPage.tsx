import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Mic, Send, Volume2, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { createAudioRecorder, microphoneErrorMessage, requestMicrophoneStream } from "@/lib/microphoneAccess";

interface DialogueMessage {
  role: "npc" | "user";
  text: string;
  audioUrl?: string | null;
  feedback?: {
    grammarScore: number;
    pronunciationScore: number;
    vocabularyScore: number;
    fluencyScore: number;
  };
}

export default function RoleplayPage() {
  const { user } = useAuth();
  const [scenarioId, setScenarioId] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<DialogueMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentNode, setCurrentNode] = useState<any>(null);
  const [sessionStats, setSessionStats] = useState({
    grammarScore: 0,
    pronunciationScore: 0,
    vocabularyScore: 0,
    fluencyScore: 0,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const startScenarioMutation = trpc.conversationAI.start.useMutation();
  const submitResponseMutation = trpc.conversationAI.continue.useMutation();
  const completeConversationMutation = trpc.conversationAI?.feedback.useMutation();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize scenario
  useEffect(() => {
    if (!scenarioId || !user) return;

    const initScenario = async () => {
      try {
        setIsLoading(true);
        const result = await startScenarioMutation.mutateAsync({ scenarioId, lessonId: 1, userLevel: "beginner", targetLanguage: "en", nativeLanguage: "pt" } as any) as any;
        setSessionId(result?.sessionId);
        setCurrentNode(result?.firstNode);

        if (result?.firstNode) {
          setMessages([
            {
              role: "npc",
              text: result?.firstNode.npcDialogue,
              audioUrl: result?.firstNode.npcAudioUrl,
            },
          ]);
        }
      } catch (error) {
        toast.error("Failed to start scenario");
      } finally {
        setIsLoading(false);
      }
    };

    initScenario();
  }, [scenarioId, user]);

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await requestMicrophoneStream();
      const mediaRecorder = createAudioRecorder(stream);

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        audioChunksRef.current = [];

        // Upload audio (simplified - would use storage service in production)
        const audioUrl = URL.createObjectURL(audioBlob);
        await submitUserResponse(userInput, audioUrl);
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (error) {
      toast.error(microphoneErrorMessage(error));
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Submit user response
  const submitUserResponse = async (text: string, audioUrl?: string) => {
    if (!sessionId || !currentNode || !user) return;

    try {
      setIsLoading(true);

      const result = await submitResponseMutation.mutateAsync({
        lessonId: 1,
        userLevel: "beginner",
        targetLanguage: "en",
        nativeLanguage: "pt",
        history: [{ role: "user" as const, content: text }],
      } as any) as any;

      // Add user message
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          text,
          audioUrl,
          feedback: {
            grammarScore: result?.feedback.grammarScore,
            pronunciationScore: result?.feedback.pronunciationScore,
            vocabularyScore: result?.feedback.vocabularyScore,
            fluencyScore: result?.feedback.fluencyScore,
          },
        },
      ]);

      // Update stats
      setSessionStats({
        grammarScore: result?.feedback.grammarScore,
        pronunciationScore: result?.feedback.pronunciationScore,
        vocabularyScore: result?.feedback.vocabularyScore,
        fluencyScore: result?.feedback.fluencyScore,
      });

      // Add NPC response
      if (result.nextNode && result.nextNode !== null) {
        setMessages((prev) => [
          ...prev,
          {
            role: "npc",
            text: result.nextNode!.npcDialogue,
            audioUrl: result.nextNode!.npcAudioUrl,
          },
        ]);
        setCurrentNode(result.nextNode);
      } else {
        // Conversation ended
        await completeConversation();
      }

      setUserInput("");
    } catch (error) {
      toast.error("Failed to submit response");
    } finally {
      setIsLoading(false);
    }
  };

  // Complete conversation
  const completeConversation = async () => {
    if (!sessionId) return;

    try {
      const result = await completeConversationMutation.mutateAsync({ lessonId: 1, userLevel: "beginner", targetLanguage: "en", nativeLanguage: "pt", userMessage: userInput } as any) as any;
      toast.success(`Conversation completed! Overall score: ${result?.overallScore}`);
      setCurrentNode(null);
    } catch (error) {
      toast.error("Failed to complete conversation");
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Please log in to access roleplay scenarios</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Interactive Roleplay</h1>
          <p className="text-gray-600">Practice real-world conversations with AI</p>
        </div>

        {/* Scenario Selection */}
        {!scenarioId && (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Choose a Scenario</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {["Restaurant", "Interview", "Travel", "Business", "Shopping", "Doctor"].map(
                (category) => (
                  <Button
                    key={category}
                    onClick={() => setScenarioId(Math.floor(Math.random() * 100) + 1)}
                    className="h-20 text-lg"
                    variant="outline"
                  >
                    {category}
                  </Button>
                )
              )}
            </div>
          </Card>
        )}

        {/* Conversation Area */}
        {scenarioId && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              <Card className="p-3 text-center">
                <div className="text-2xl font-bold text-blue-600">{sessionStats.grammarScore}</div>
                <div className="text-xs text-gray-600">Grammar</div>
              </Card>
              <Card className="p-3 text-center">
                <div className="text-2xl font-bold text-green-600">{sessionStats.pronunciationScore}</div>
                <div className="text-xs text-gray-600">Pronunciation</div>
              </Card>
              <Card className="p-3 text-center">
                <div className="text-2xl font-bold text-purple-600">{sessionStats.vocabularyScore}</div>
                <div className="text-xs text-gray-600">Vocabulary</div>
              </Card>
              <Card className="p-3 text-center">
                <div className="text-2xl font-bold text-orange-600">{sessionStats.fluencyScore}</div>
                <div className="text-xs text-gray-600">Fluency</div>
              </Card>
            </div>

            {/* Messages */}
            <Card className="p-6 mb-6 h-96 overflow-y-auto bg-white">
              <div className="space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        msg.role === "user"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-900"
                      }`}
                    >
                      <p>{msg.text}</p>
                      {msg.audioUrl && (
                        <button className="mt-2 flex items-center gap-2 text-sm">
                          <Volume2 size={16} />
                          Play
                        </button>
                      )}
                      {msg?.feedback && (
                        <div className="mt-2 text-xs space-y-1">
                          <div className="flex items-center gap-2">
                            <CheckCircle size={12} />
                            Grammar: {msg?.feedback.grammarScore}%
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle size={12} />
                            Pronunciation: {msg?.feedback.pronunciationScore}%
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </Card>

            {/* Input Area */}
            {currentNode && (
              <Card className="p-6">
                <div className="space-y-4">
                  {/* Context Hint */}
                  {currentNode.contextHint && (
                    <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-900">
                      <strong>Hint:</strong> {currentNode.contextHint}
                    </div>
                  )}

                  {/* Suggested Responses */}
                  {currentNode.suggestedResponses && (
                    <div>
                      <p className="text-sm font-semibold mb-2">Suggested responses:</p>
                      <div className="space-y-2">
                        {currentNode.suggestedResponses.slice(0, 3).map((resp: any, idx: number) => (
                          <Button
                            key={idx}
                            onClick={() => submitUserResponse(resp.text)}
                            variant="outline"
                            className="w-full text-left justify-start"
                          >
                            {resp.text}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Input */}
                  <div className="flex gap-2">
                    <Input
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder="Type your response..."
                      onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                        if (e.key === "Enter" && userInput.trim()) {
                          submitUserResponse(userInput);
                        }
                      }}
                    />
                    <Button
                      onClick={() => (isRecording ? stopRecording() : startRecording())}
                      variant={isRecording ? "destructive" : "outline"}
                    >
                      <Mic size={20} />
                    </Button>
                    <Button
                      onClick={() => submitUserResponse(userInput)}
                      disabled={!userInput.trim() || isLoading}
                    >
                      {isLoading ? <Loader2 className="animate-spin" /> : <Send size={20} />}
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
