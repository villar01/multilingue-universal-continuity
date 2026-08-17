import { ParetoPracticeCycle } from "@/components/ParetoPracticeCycle";
import { Button } from "@/components/ui/button";
import type { ParetoWord } from "@/lib/curriculum-types";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft, BookOpen, CheckCircle2, Headphones, PenLine, Sparkles, Target } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "wouter";

const SESSION_SIZE = 10;
const PROGRESS_KEY_PREFIX = "multilingue_pareto_1000_completed";

function progressKey(targetLanguage: string, nativeLanguage: string): string {
  return `${PROGRESS_KEY_PREFIX}:${targetLanguage.trim().toLowerCase()}:${nativeLanguage.trim().toLowerCase()}`;
}

function loadCompletedWords(key: string): Set<string> {
  try {
    const stored = localStorage.getItem(key);
    return stored ? new Set(JSON.parse(stored) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function saveCompletedWords(key: string, words: Set<string>) {
  try {
    localStorage.setItem(key, JSON.stringify([...words]));
  } catch {
    // The active practice stays available when local persistence is unavailable.
  }
}

export default function Pareto1000() {
  const [location] = useLocation();
  const [page, setPage] = useState(0);
  const { profile } = useLanguage();
  const targetLanguage = profile.targetCode || "en-US";
  const nativeLanguage = profile.nativeCode || "pt-BR";
  const activeProgressKey = useMemo(() => progressKey(targetLanguage, nativeLanguage), [targetLanguage, nativeLanguage]);
  const paretoQuery = trpc.curriculum.localizedPareto.useQuery({
    lessonKey: "/pareto-1000",
    targetLanguage,
    nativeLanguage,
    page,
    pageSize: SESSION_SIZE,
  });
  const words = useMemo<ParetoWord[]>(() => (paretoQuery.data?.items ?? []).map((word) => ({
    id: word.id,
    enUS: word.targetWord,
    ptBR: word.nativeTranslation,
    pronunciation: word.pronunciation,
    category: word.category,
    frequency: word.frequency,
    example: word.targetExample,
    examplePt: word.nativeExample,
    scene: word.scene,
  })), [paretoQuery.data]);
  const [completed, setCompleted] = useState<Set<string>>(() => loadCompletedWords(activeProgressKey));
  const [practiceWord, setPracticeWord] = useState<ParetoWord | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speakMutation = trpc.tts.speak.useMutation();
  const sessionStart = page * SESSION_SIZE;
  const sessionWords = words;
  const totalPages = paretoQuery.data?.totalPages ?? 1;
  const completedCount = words.filter((word) => completed.has(word.id)).length;
  const nextWord = words.find((word) => !completed.has(word.id)) ?? null;
  const programReadyCount = paretoQuery.data?.total ?? 0;
  const returnTo = useMemo(() => {
    const requestedDestination = new URLSearchParams(location.split("?")[1] ?? "").get("returnTo");
    return requestedDestination?.startsWith("/base-de-estudos") || requestedDestination?.startsWith("/abc-book")
      ? requestedDestination
      : "/base-de-estudos";
  }, [location]);

  useEffect(() => {
    setCompleted(loadCompletedWords(activeProgressKey));
    setPage(0);
    setPracticeWord(null);
  }, [activeProgressKey]);

  if (paretoQuery.isLoading) {
    return <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-center text-sm text-slate-200">Carregando vocabulário Pareto protegido…</main>;
  }

  if (paretoQuery.isError) {
    return <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-center text-sm text-slate-200">Não foi possível autorizar a entrega do vocabulário Pareto.</main>;
  }

  if (paretoQuery.data?.status !== "ready") {
    return <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-center text-sm text-slate-200">O material desta dupla de idiomas está sendo preparado com segurança. Escolha outra prática disponível ou tente novamente em instantes.</main>;
  }

  const speak = useCallback(async (text: string) => {
    if (!text.trim()) return;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    try {
      const result = await speakMutation.mutateAsync({ text: text.slice(0, 400), voiceLang: targetLanguage, gender: "male" });
      if (!result.success || !result.audioBase64) return;
      const bytes = Uint8Array.from(atob(result.audioBase64), (char) => char.charCodeAt(0));
      const url = URL.createObjectURL(new Blob([bytes], { type: "audio/mpeg" }));
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        URL.revokeObjectURL(url);
        if (audioRef.current === audio) audioRef.current = null;
      };
      await audio.play();
    } catch {
      // Recall and writing practice remain usable if neural speech is unavailable.
    }
  }, [speakMutation]);

  const completeWord = useCallback(() => {
    if (!practiceWord) return;
    setCompleted((previous) => {
      const next = new Set(previous).add(practiceWord.id);
      saveCompletedWords(activeProgressKey, next);
      return next;
    });
  }, [activeProgressKey, practiceWord]);

  const openNextWord = useCallback(() => {
    const currentIndex = practiceWord ? words.findIndex((word) => word.id === practiceWord.id) : -1;
    const candidate = words.slice(Math.max(currentIndex + 1, 0)).find((word) => !completed.has(word.id))
      ?? words.find((word) => !completed.has(word.id))
      ?? null;
    setPracticeWord(candidate);
  }, [completed, practiceWord, words]);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/95 backdrop-blur">
        <div className="container flex items-center justify-between gap-3 py-4">
          <Link href={returnTo}><Button variant="ghost" className="gap-2 text-slate-200 hover:bg-white/10 hover:text-white"><ArrowLeft className="h-4 w-4" />Voltar à Base</Button></Link>
          <span className="text-sm font-bold text-amber-100">Pareto · 1.000 palavras</span>
        </div>
      </header>

      <div className="container py-8 sm:py-12">
        <section className="rounded-3xl border border-amber-300/30 bg-gradient-to-br from-amber-300/15 via-slate-900 to-cyan-500/15 p-6 shadow-2xl sm:p-9">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/35 bg-amber-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-amber-100"><Target className="h-4 w-4" />Programa de memorização ativo</div>
            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">Rumo a mil palavras para lembrar, escrever e usar.</h1>
            <p className="mt-4 text-base leading-7 text-slate-200 sm:text-lg">O curso ensina as palavras em textos e situações. Aqui, o aluno recupera sem olhar, escreve novamente, cria uma frase e revisa até fixar. {programReadyCount.toLocaleString("pt-BR")} termos do idioma estudado foram autorizados para esta trilha.</p>
          </div>
          <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/55 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-amber-200">Progresso de memória</p><p className="mt-1 text-2xl font-black">{completedCount} <span className="text-base font-semibold text-slate-300">/ {programReadyCount} palavras únicas liberadas</span></p><p className="mt-1 text-xs text-slate-400">Meta do programa: 1.000 palavras únicas.</p></div><Button type="button" onClick={() => setPracticeWord(nextWord)} disabled={!nextWord} className="gap-2 bg-amber-300 font-bold text-slate-950 hover:bg-amber-200"><Sparkles className="h-4 w-4" />{nextWord ? "Continuar memorização" : "Trilha atual concluída"}</Button></div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-amber-300 transition-all" style={{ width: `${Math.max(1, (completedCount / Math.max(programReadyCount, 1)) * 100)}%` }} /></div>
          </div>
        </section>

        <section className="mt-7 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <aside className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-xl">
            <div className="flex items-center gap-2"><PenLine className="h-5 w-5 text-amber-200" /><h2 className="font-black">Como cada palavra é treinada</h2></div>
            <ol className="mt-4 space-y-3 text-sm leading-6 text-slate-200"><li><strong className="text-amber-100">1. Observe:</strong> leia, ouça e associe ao exemplo.</li><li><strong className="text-amber-100">2. Lembre:</strong> escreva em inglês sem olhar.</li><li><strong className="text-amber-100">3. Escreva:</strong> repita a grafia para fixar.</li><li><strong className="text-amber-100">4. Crie:</strong> use a palavra em uma frase nova.</li></ol>
            <p className="mt-5 rounded-xl border border-cyan-300/20 bg-cyan-300/5 p-3 text-sm text-cyan-100">A cartilha apresenta o sentido e a gramática. O Pareto fixa o vocabulário por recuperação ativa e escrita.</p>
          </aside>
          <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-xl sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-cyan-200">Sessão {page + 1} de {totalPages}</p><h2 className="mt-1 text-2xl font-black">Dez palavras para praticar agora</h2></div><Button type="button" variant="outline" onClick={() => setPracticeWord(sessionWords.find((word) => !completed.has(word.id)) ?? sessionWords[0] ?? null)} className="border-amber-300/45 text-amber-100 hover:bg-amber-300/10 hover:text-amber-50">Iniciar esta sessão</Button></div>
            <div className="mt-5 space-y-3">
              {sessionWords.map((word, index) => (
                <div key={word.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4"><div><p className="text-xs font-bold text-slate-500">{sessionStart + index + 1} / {programReadyCount} · {word.category}</p><p className="mt-1 text-lg font-black text-white">{word.enUS} <span className="text-sm font-semibold text-cyan-100">· {word.ptBR}</span></p><p className="mt-1 text-sm text-slate-300">{word.example}</p></div><div className="flex gap-2"><Button type="button" size="sm" variant="outline" onClick={() => speak(word.enUS)} disabled={speakMutation.isPending} className="border-cyan-300/45 text-cyan-100 hover:bg-cyan-300/10 hover:text-cyan-50"><Headphones className="h-4 w-4" /></Button><Button type="button" size="sm" onClick={() => setPracticeWord(word)} className={completed.has(word.id) ? "bg-emerald-300 text-slate-950 hover:bg-emerald-200" : "bg-amber-300 text-slate-950 hover:bg-amber-200"}>{completed.has(word.id) ? <CheckCircle2 className="h-4 w-4" /> : "Praticar"}</Button></div></div>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-between"><Button type="button" variant="outline" disabled={page === 0} onClick={() => setPage((current) => current - 1)}>Sessão anterior</Button><Button type="button" variant="outline" disabled={page >= totalPages - 1} onClick={() => setPage((current) => current + 1)}>Próximas 10 palavras</Button></div>
          </section>
        </section>
      </div>
      {practiceWord && <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/75 p-4 backdrop-blur-sm sm:items-center"><ParetoPracticeCycle embedded level="A1" term={{ word: practiceWord.enUS, translation: practiceWord.ptBR, example: practiceWord.example }} onSpeak={speak} onClose={() => setPracticeWord(null)} onComplete={completeWord} onNext={openNextWord} /></div>}
    </main>
  );
}
