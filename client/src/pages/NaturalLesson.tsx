/**
 * NaturalLesson — Aula gamificada por fase da vida
 * Usa o sistema PolyLesson + generateLessonContent para criar aulas dinâmicas
 * Infância: sons + imagens | Adolescência: frases + contexto | Adulto: conversação real
 */
import { useState, useEffect, Suspense, lazy } from "react";
import { useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { createLessonGenerationGuard } from "@/lib/lessonGenerationGuard";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Brain } from "lucide-react";

const PolyLesson = lazy(() => import("@/components/PolyLesson"));

type LifePhase = "infancia" | "crianca" | "adolescencia" | "adulto" | "fluente";

export default function NaturalLesson() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);

  const title = params.get("title") || "Greetings";
  const emoji = params.get("emoji") || "👋";
  const lang = params.get("lang") || "en-US";
  const phase = (params.get("phase") || "infancia") as LifePhase;
  const level = params.get("level") || "basico";

  const [lessonContent, setLessonContent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const generateMutation = trpc.ai.generateLessonContent.useMutation();

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    setLessonContent(null);

    const guard = createLessonGenerationGuard({ onTimeout: () => {
      setError("A preparação está demorando mais que o esperado. Você pode tentar novamente ou continuar por outra aula.");
      setIsLoading(false);
    }});

    generateMutation.mutateAsync({
      lessonTitle: title,
      lessonDescription: "",
      languageCode: lang,
      nativeLanguage: "pt",
      level: level,
    }).then((data: unknown) => {
      guard.finish(() => {
        setLessonContent(data);
        setIsLoading(false);
      });
    }).catch((err: unknown) => {
      guard.finish(() => {
        console.error("NaturalLesson generate error:", err);
        setError("Esta aula ainda não pôde ser preparada. Você pode tentar novamente ou continuar por outra aula.");
        setIsLoading(false);
      });
    });

    return guard.cancel;
  }, [title, lang, level, retryKey]);

  const handleComplete = (score: number, xp: number) => {
    toast.success(`🏆 Lição concluída! +${xp} XP`, { duration: 3000 });
    setTimeout(() => navigate("/natural-learning"), 1500);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: "linear-gradient(180deg, #0f0c29 0%, #302b63 100%)" }}>
        <div className="text-center">
          <div className="text-6xl mb-6 animate-bounce">{emoji}</div>
          <div className="flex items-center gap-3 mb-4">
            <Loader2 className="h-6 w-6 text-purple-400 animate-spin" />
            <span className="text-white font-bold text-lg">Preparando sua aula...</span>
          </div>
          <p className="text-white/50 text-sm">{title}</p>
          <div className="mt-6 flex items-center gap-2 justify-center text-purple-400/60 text-xs">
            <Brain className="h-4 w-4" />
            <span>IA gerando conteúdo personalizado para sua fase</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !lessonContent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: "linear-gradient(180deg, #0f0c29 0%, #302b63 100%)" }}>
        <div className="text-center">
          <div className="text-5xl mb-4">😕</div>
          <p className="text-white font-bold mb-2">{error || "Aula não disponível"}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setRetryKey((current) => current + 1)}
              className="px-6 py-2 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors"
            >
              Tentar novamente
            </button>
            <button
              onClick={() => navigate("/natural-learning")}
              className="px-6 py-2 rounded-xl border border-white/30 text-white font-semibold hover:bg-white/10 transition-colors"
            >
              Outras aulas
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #0f0c29 0%, #302b63 50%, #24243e 100%)" }}>
      {/* Back button */}
      <div className="sticky top-0 z-50 px-4 py-3 flex items-center gap-3 border-b border-white/10" style={{ background: "rgba(15,12,41,0.85)", backdropFilter: "blur(10px)" }}>
        <button onClick={() => navigate("/natural-learning")} className="text-white/60 hover:text-white transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="text-white font-semibold">{emoji} {title}</span>
      </div>

      <Suspense fallback={
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
        </div>
      }>
        <PolyLesson
          lesson={lessonContent}
          languageCode={lang}
          onComplete={handleComplete}
        />
      </Suspense>
    </div>
  );
}
