/**
 * VOICE RECORDER COMPONENT
 * Componente para gravar áudio do microfone e enviar para análise de pronúncia
 */

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, MicOff, Loader2, Volume2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

interface VoiceRecorderProps {
  targetText: string; // Texto que o aluno deve falar
  targetLanguage: string; // Idioma alvo (ex: "English")
  onSuccess?: (feedback: string) => void;
}

export default function VoiceRecorder({ targetText, targetLanguage, onSuccess }: VoiceRecorderProps) {
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcription, setTranscription] = useState("");
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState<number | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const transcribeAudio = trpc.voiceTranscription.transcribe.useMutation();
  const analyzePronunciation = trpc.pronunciation.analyze.useMutation();

  const isPremium = user?.subscriptionType !== "free";

  const startRecording = async () => {
    if (!isPremium) {
      toast.error("🔒 Recurso Premium", {
        description: "A gravação de voz está disponível apenas no plano Premium"
      });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        
        // Parar todas as tracks do stream
        stream.getTracks().forEach(track => track.stop());
        
        // Enviar para transcrição
        await handleTranscription(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success("🎤 Gravando...", {
        description: "Fale agora: \"" + targetText + "\""
      });
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error("Erro ao acessar microfone", {
        description: "Verifique as permissões do navegador"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleTranscription = async (blob: Blob) => {
    try {
      // Converter blob para base64
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        
        // Transcrever áudio
        const result = await transcribeAudio.mutateAsync({
          audioData: base64Audio,
          language: targetLanguage.toLowerCase().substring(0, 2), // "en" para English
        });

        setTranscription(result.text);
        
        // Analisar pronúncia
        await handlePronunciationAnalysis(result.text);
      };
    } catch (error) {
      console.error("Error transcribing audio:", error);
      toast.error("Erro ao transcrever áudio");
    }
  };

  const handlePronunciationAnalysis = async (spokenText: string) => {
    try {
      const result = await analyzePronunciation.mutateAsync({
        targetText: targetText,
        spokenText: spokenText,
        language: targetLanguage,
      });

      setFeedback(result.feedback);
      setScore(result.score);
      
      if (result.score >= 80) {
        toast.success("🎉 Excelente pronúncia!", {
          description: `Pontuação: ${result.score}%`
        });
        onSuccess?.(result.feedback);
      } else if (result.score >= 60) {
        toast.info("👍 Boa pronúncia!", {
          description: `Pontuação: ${result.score}%. Continue praticando!`
        });
      } else {
        toast.warning("💪 Continue praticando!", {
          description: `Pontuação: ${result.score}%. Tente novamente!`
        });
      }
    } catch (error) {
      console.error("Error analyzing pronunciation:", error);
      toast.error("Erro ao analisar pronúncia");
    }
  };

  const playRecording = () => {
    if (audioBlob) {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Target Text */}
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-2">Fale em inglês:</p>
          <p className="text-xl font-bold text-blue-600">{targetText}</p>
        </div>

        {/* Recording Button */}
        <div className="flex justify-center">
          {!isRecording ? (
            <Button
              size="lg"
              onClick={startRecording}
              disabled={transcribeAudio.isPending || analyzePronunciation.isPending}
              className="w-32 h-32 rounded-full bg-gradient-to-br from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
            >
              {transcribeAudio.isPending || analyzePronunciation.isPending ? (
                <Loader2 className="h-12 w-12 animate-spin" />
              ) : (
                <Mic className="h-12 w-12" />
              )}
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={stopRecording}
              className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800 animate-pulse"
            >
              <MicOff className="h-12 w-12" />
            </Button>
          )}
        </div>

        {!isPremium && (
          <div className="text-center text-sm text-gray-500">
            🔒 Recurso disponível apenas no plano Premium
          </div>
        )}

        {/* Transcription Result */}
        {transcription && (
          <div className="space-y-3">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <Volume2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-700 mb-1">Você disse:</p>
                  <p className="text-lg">{transcription}</p>
                </div>
                {audioBlob && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={playRecording}
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Score */}
            {score !== null && (
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
                <div className="flex items-center gap-3">
                  {score >= 80 ? (
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  ) : score >= 60 ? (
                    <CheckCircle2 className="h-8 w-8 text-yellow-600" />
                  ) : (
                    <XCircle className="h-8 w-8 text-red-600" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-700 mb-1">Pontuação:</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all ${
                            score >= 80
                              ? "bg-gradient-to-r from-green-500 to-emerald-500"
                              : score >= 60
                              ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                              : "bg-gradient-to-r from-red-500 to-pink-500"
                          }`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                      <span className="text-2xl font-bold">{score}%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Feedback */}
            {feedback && (
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">💡 Feedback do Professor:</p>
                <p className="text-gray-800">{feedback}</p>
              </div>
            )}

            {/* Try Again Button */}
            <Button
              onClick={() => {
                setAudioBlob(null);
                setTranscription("");
                setFeedback("");
                setScore(null);
              }}
              variant="outline"
              className="w-full"
            >
              Gravar Novamente
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
