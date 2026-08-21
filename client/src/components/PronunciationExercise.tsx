import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Volume2, Loader2, CheckCircle, XCircle, RotateCcw } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { trpc } from "../lib/trpc";
import { toast } from "sonner";
import { createAudioRecorder, microphoneErrorMessage, requestMicrophoneStream } from "@/lib/microphoneAccess";
import { getScriptedExerciseFeedback } from "@/lib/scriptedExerciseFeedback";

interface PronunciationExerciseProps {
  vocabulary: string[];
  teacherId: number;
  teacherName: string;
  teacherGender: 'male' | 'female';
  languageCode: string;
}

export default function PronunciationExercise({
  vocabulary,
  teacherId,
  teacherName,
  teacherGender,
  languageCode,
}: PronunciationExerciseProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pronunciationResult, setPronunciationResult] = useState<{
    accuracy: number;
    feedback: string;
    transcription: string;
  } | null>(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  const currentWord = vocabulary[currentWordIndex];

  // Mutations
  const transcribeAudio = trpc.voiceTranscription.transcribe.useMutation();
  const generateTTS = trpc.tts.generate.useMutation();
  const evaluatePronunciation = trpc.pronunciation.evaluate.useMutation();

  // Play teacher dictation when word changes
  useEffect(() => {
    if (currentWord) {
      playTeacherDictation();
    }
  }, [currentWordIndex]);

  const playTeacherDictation = async () => {
    try {
      const result = await generateTTS.mutateAsync({
        text: `Repeat after me: ${currentWord}`,
        languageCode: languageCode,
        voiceGender: teacherGender === 'male' ? "MALE" : "FEMALE",
      });

      if (audioElementRef.current) {
        audioElementRef.current.src = result.audioUrl;
        audioElementRef.current.play();
      }
    } catch (error) {
      console.error("TTS error:", error);
      toast.error("Erro ao gerar áudio do professor");
    }
  };

  const startRecording = async () => {
    try {
      const stream = await requestMicrophoneStream();
      const mediaRecorder = createAudioRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await processRecording(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.info("Gravando... Fale agora!");
    } catch (error) {
      console.error("Recording error:", error);
      toast.error(microphoneErrorMessage(error));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processRecording = async (audioBlob: Blob) => {
    setIsProcessing(true);
    setPronunciationResult(null);

    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;

        // Transcribe audio
        const transcription = await transcribeAudio.mutateAsync({
          audioData: base64Audio,
          language: languageCode.split("-")[0],
        });

        // Evaluate pronunciation
        const evaluation = await evaluatePronunciation.mutateAsync({
          expectedText: currentWord,
          spokenText: transcription.text,
          audioData: base64Audio,
        });

        setPronunciationResult({
          accuracy: evaluation.accuracy,
          feedback: evaluation.feedback,
          transcription: transcription.text,
        });

        setAttempts(attempts + 1);

        if (evaluation.accuracy >= 80) {
          setScore(score + 1);
          toast.success(`Excelente! ${evaluation.accuracy}% de precisão`);
        } else if (evaluation.accuracy >= 60) {
          toast.info(`Bom! ${evaluation.accuracy}% - Tente melhorar`);
        } else {
          toast.error(`${evaluation.accuracy}% - Pratique mais`);
        }
      };
    } catch (error) {
      console.error("Processing error:", error);
      toast.error("Erro ao processar áudio");
    } finally {
      setIsProcessing(false);
    }
  };

  const nextWord = () => {
    if (currentWordIndex < vocabulary.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
      setPronunciationResult(null);
    } else {
      toast.success(`Exercício completo! Pontuação: ${score}/${vocabulary.length}`);
    }
  };

  const repeatWord = () => {
    playTeacherDictation();
  };

  const tryAgain = () => {
    setPronunciationResult(null);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>🎤 Exercício de Pronúncia</span>
          <span className="text-sm font-normal">
            {currentWordIndex + 1}/{vocabulary.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Progresso</span>
            <span>
              {score} corretas de {attempts} tentativas
            </span>
          </div>
          <Progress value={(currentWordIndex / vocabulary.length) * 100} />
        </div>

        {/* Teacher Card */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-2xl">
              👨‍🏫
            </div>
            <div>
              <p className="font-semibold">{teacherName}</p>
              <p className="text-sm text-gray-600">Seu professor de pronúncia</p>
            </div>
          </div>
          <Button onClick={repeatWord} variant="outline" size="sm" className="gap-2">
            <Volume2 className="w-4 h-4" />
            Ouvir novamente
          </Button>
        </div>

        {/* Current Word */}
        <div className="text-center p-8 bg-white rounded-lg border-2 border-blue-200">
          <p className="text-sm text-gray-600 mb-2">Palavra atual:</p>
          <p className="text-5xl font-bold text-blue-600 mb-4">{currentWord}</p>
          <p className="text-gray-500">Clique no microfone e repita a palavra</p>
        </div>

        {/* Recording Controls */}
        <div className="flex justify-center gap-4">
          <Button
            size="lg"
            variant={isRecording ? "destructive" : "default"}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            className="gap-2"
          >
            {isRecording ? (
              <>
                <MicOff className="w-5 h-5" />
                Parar Gravação
              </>
            ) : (
              <>
                <Mic className="w-5 h-5" />
                Gravar Pronúncia
              </>
            )}
          </Button>

          {isProcessing && <Loader2 className="w-8 h-8 animate-spin text-blue-500" />}
        </div>

        {/* Pronunciation Result */}
        {pronunciationResult && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            {(() => {
              const feedback = getScriptedExerciseFeedback(
                pronunciationResult.accuracy >= 80 ? "correct" : pronunciationResult.accuracy >= 60 ? "partial" : "retry",
                languageCode,
              );
              return (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-950">
                  <p className="font-semibold">{feedback.teacherText}</p>
                  <p className="mt-1">{feedback.learnerText}</p>
                  {feedback.studyHref && (
                    <a className="mt-2 inline-block font-semibold underline" href={feedback.studyHref}>{feedback.studyPrompt}</a>
                  )}
                </div>
              );
            })()}
            <div className="text-center">
              <div
                className={`text-6xl font-bold mb-2 ${
                  pronunciationResult.accuracy >= 80
                    ? "text-green-600"
                    : pronunciationResult.accuracy >= 60
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {pronunciationResult.accuracy}%
              </div>
              <p className="text-gray-600">Precisão da pronúncia</p>
            </div>

            <div className="bg-white p-4 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Você disse:</p>
              <p className="text-xl font-medium">{pronunciationResult.transcription}</p>
            </div>

            <div className="bg-white p-4 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Feedback do professor:</p>
              <p className="text-lg">{pronunciationResult.feedback}</p>
            </div>

            <div className="flex gap-3">
              <Button onClick={tryAgain} variant="outline" className="flex-1 gap-2">
                <RotateCcw className="w-4 h-4" />
                Tentar Novamente
              </Button>
              <Button onClick={nextWord} className="flex-1 gap-2">
                {currentWordIndex < vocabulary.length - 1 ? "Próxima Palavra" : "Finalizar"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      <audio ref={audioElementRef} className="hidden" />
    </Card>
  );
}
