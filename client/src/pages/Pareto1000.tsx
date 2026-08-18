import { ParetoPracticeCycle } from "@/components/ParetoPracticeCycle";
import { Button } from "@/components/ui/button";
import type { ParetoWord } from "@/lib/curriculum-types";
import { completedProgramCount } from "@/lib/paretoProgress";
import { getDueParetoReviewIds, getParetoProgramIndex, recordSuccessfulParetoReview, type ParetoReviewSchedule } from "@/lib/paretoSpacedReview";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft, CheckCircle2, Headphones, PenLine } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "wouter";

const SESSION_SIZE = 10;
const PROGRESS_KEY_PREFIX = "multilingue_pareto_1000_completed";
const REVIEW_KEY_PREFIX = "multilingue_pareto_1000_reviews";
const PARETO_PATHS = ["book", "advanced"] as const;
const BOOK_CONTEXT_IDS = ["foundation", "family", "social-circle", "routine-time", "home", "transport"] as const;

function progressKey(targetLanguage: string, nativeLanguage: string): string {
  return `${PROGRESS_KEY_PREFIX}:${targetLanguage.trim().toLowerCase()}:${nativeLanguage.trim().toLowerCase()}`;
}

function reviewKey(targetLanguage: string, nativeLanguage: string): string {
  return `${REVIEW_KEY_PREFIX}:${targetLanguage.trim().toLowerCase()}:${nativeLanguage.trim().toLowerCase()}`;
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

function loadReviewSchedule(key: string): ParetoReviewSchedule {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) as ParetoReviewSchedule : {};
  } catch {
    return {};
  }
}

function saveReviewSchedule(key: string, schedule: ParetoReviewSchedule) {
  try {
    localStorage.setItem(key, JSON.stringify(schedule));
  } catch {
    // The current practice remains available if local review persistence is unavailable.
  }
}

export default function Pareto1000() {
  const [location, setLocation] = useLocation();
  const [page, setPage] = useState(0);
  const { profile } = useLanguage();
  const targetLanguage = profile.targetCode || "en-US";
  const nativeLanguage = profile.nativeCode || "pt-BR";
  const searchParams = useMemo(
    () => new URLSearchParams(typeof window === "undefined" ? "" : window.location.search),
    [location],
  );
  const activeProgressKey = useMemo(() => progressKey(targetLanguage, nativeLanguage), [targetLanguage, nativeLanguage]);
  const activeReviewKey = useMemo(() => reviewKey(targetLanguage, nativeLanguage), [targetLanguage, nativeLanguage]);
  const paretoPath = useMemo(() => {
    const requestedPath = searchParams.get("path");
    return PARETO_PATHS.find((path) => path === requestedPath) ?? "advanced";
  }, [searchParams]);
  const bookContext = useMemo(() => {
    const requestedContext = searchParams.get("bookContext");
    return BOOK_CONTEXT_IDS.find((contextId) => contextId === requestedContext) ?? "foundation";
  }, [searchParams]);
  const sceneId = useMemo(() => searchParams.get("scene")?.trim() || undefined, [searchParams]);
  const paretoQuery = trpc.curriculum.localizedPareto.useQuery({
    lessonKey: "/pareto-1000",
    targetLanguage,
    nativeLanguage,
    bookContext: paretoPath === "book" ? bookContext : undefined,
    scene: paretoPath === "advanced" ? sceneId : undefined,
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
  const [reviewSchedule, setReviewSchedule] = useState<ParetoReviewSchedule>(() => loadReviewSchedule(activeReviewKey));
  const [practiceWord, setPracticeWord] = useState<ParetoWord | null>(null);
  const [pendingReviewId, setPendingReviewId] = useState<string | null>(null);
  const [structureAttempt, setStructureAttempt] = useState("");
  const [structureChecked, setStructureChecked] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speakMutation = trpc.tts.speak.useMutation();
  const sessionStart = page * SESSION_SIZE;
  const sessionWords = words;
  const totalPages = paretoQuery.data?.totalPages ?? 1;
  const nextWord = words.find((word) => !completed.has(word.id)) ?? null;
  const programReadyCount = paretoQuery.data?.total ?? 0;
  const completedCount = useMemo(
    () => completedProgramCount(completed, programReadyCount),
    [completed, programReadyCount],
  );
  const dueReviewIds = useMemo(() => getDueParetoReviewIds(reviewSchedule), [reviewSchedule]);
  const dueReviewSet = useMemo(() => new Set(dueReviewIds), [dueReviewIds]);
  const returnTo = useMemo(() => {
    const requestedDestination = searchParams.get("returnTo");
    const allowedReturnPrefixes = ["/base-de-estudos", "/abc-book", "/immersive-scene", "/lesson/", "/structured-lesson", "/dashboard"];
    return requestedDestination && allowedReturnPrefixes.some((prefix) => requestedDestination.startsWith(prefix))
      ? requestedDestination
      : "/base-de-estudos";
  }, [searchParams]);

  const selectParetoPath = useCallback((nextPath: (typeof PARETO_PATHS)[number]) => {
    const params = new URLSearchParams({ path: nextPath, returnTo });
    if (nextPath === "book") params.set("bookContext", bookContext);
    setLocation(`/pareto-1000?${params.toString()}`);
  }, [bookContext, returnTo, setLocation]);

  useEffect(() => {
    setCompleted(loadCompletedWords(activeProgressKey));
    setReviewSchedule(loadReviewSchedule(activeReviewKey));
    setPage(0);
    setPracticeWord(null);
    setPendingReviewId(null);
  }, [activeProgressKey, activeReviewKey]);

  useEffect(() => {
    setPage(0);
    setPracticeWord(null);
    setStructureAttempt("");
    setStructureChecked(false);
  }, [paretoPath, bookContext]);

  useEffect(() => {
    setStructureAttempt("");
    setStructureChecked(false);
  }, [page]);

  useEffect(() => {
    if (!pendingReviewId) return;
    const dueWord = words.find((word) => word.id === pendingReviewId);
    if (!dueWord) return;
    setPracticeWord(dueWord);
    setPendingReviewId(null);
  }, [pendingReviewId, words]);

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
    setReviewSchedule((previous) => {
      const next = recordSuccessfulParetoReview(previous, practiceWord.id);
      saveReviewSchedule(activeReviewKey, next);
      return next;
    });
  }, [activeProgressKey, activeReviewKey, practiceWord]);

  const openDueReview = useCallback(() => {
    const wordId = dueReviewIds[0];
    if (!wordId) return;
    const programIndex = getParetoProgramIndex(wordId);
    if (programIndex !== null) setPage(Math.floor(programIndex / SESSION_SIZE));
    setPendingReviewId(wordId);
  }, [dueReviewIds]);

  const openNextWord = useCallback(() => {
    const currentIndex = practiceWord ? words.findIndex((word) => word.id === practiceWord.id) : -1;
    const candidate = words.slice(Math.max(currentIndex + 1, 0)).find((word) => !completed.has(word.id))
      ?? words.find((word) => !completed.has(word.id))
      ?? null;
    setPracticeWord(candidate);
  }, [completed, practiceWord, words]);

  const advancedChallenge = paretoPath === "advanced" ? paretoQuery.data?.advancedChallenge : null;
  const structureAnswerIsCorrect = advancedChallenge
    ? structureAttempt.trim().toLocaleLowerCase("en-US") === advancedChallenge.answer.toLocaleLowerCase("en-US")
    : false;

  if (paretoQuery.isLoading) {
    return <main className="flex min-h-screen items-center justify-center bg-[#f8f6ef] px-6 text-center text-sm text-slate-700">Carregando vocabulário Pareto protegido…</main>;
  }

  if (paretoQuery.isError) {
    return <main className="flex min-h-screen items-center justify-center bg-[#f8f6ef] px-6 text-center text-sm text-slate-700">Não foi possível autorizar a entrega do vocabulário Pareto.</main>;
  }

  if (paretoQuery.data?.status !== "ready") {
    return <main className="flex min-h-screen items-center justify-center bg-[#f8f6ef] px-6 text-center text-sm text-slate-700">O material desta dupla de idiomas está sendo preparado com segurança. Escolha outra prática disponível ou tente novamente em instantes.</main>;
  }

  return (
    <main className="min-h-screen bg-[#f8f6ef] px-4 py-6 text-slate-900 sm:px-6 sm:py-10">
      <article className="mx-auto max-w-4xl border border-stone-200 bg-white shadow-[0_12px_36px_rgba(15,23,42,0.08)]">
        <header className="border-b border-stone-200 px-6 py-5 sm:px-10 sm:py-7">
          <div className="flex items-center justify-between gap-3">
            <Link href={returnTo}><Button variant="ghost" className="h-auto gap-2 px-0 py-1 text-sm font-bold text-slate-600 hover:bg-transparent hover:text-slate-950"><ArrowLeft className="h-4 w-4" />Voltar à Base</Button></Link>
            <span className="text-xs font-black uppercase tracking-[0.14em] text-amber-800">Pareto · 1.000 palavras</span>
          </div>
          <p className="mt-6 text-xs font-black uppercase tracking-[0.14em] text-amber-800">{paretoPath === "book" ? paretoQuery.data?.bookContext?.bookStep : sceneId ? "Pareto da cena imersiva" : "Curso Pareto avançado"}</p>
          <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{paretoPath === "book" ? (paretoQuery.data?.bookContext?.title ?? "Uma palavra de cada vez") : sceneId ? "Palavras desta cena para lembrar e usar" : "Mil palavras para lembrar e usar"}</h1>
          <p className="mt-3 max-w-3xl leading-7 text-slate-700">{paretoPath === "book" ? (paretoQuery.data?.bookContext?.grammarFocus ?? "Leia o sentido, ouça, escreva sem olhar e crie uma frase.") : sceneId ? "Pratique o vocabulário entregue para a cena atual. Leia o sentido, recupere sem olhar, escreva e retorne ao mesmo ponto para usar as palavras com o Professor." : "Percurso completo com mil palavras, recuperação ativa, escrita, voz e revisões espaçadas. Escolha este caminho quando quiser praticar além do capítulo atual."}</p>
          <div className="mt-5 flex flex-wrap gap-2 border-y border-stone-200 py-3"><Button type="button" variant={paretoPath === "book" ? "default" : "outline"} onClick={() => selectParetoPath("book")} className={paretoPath === "book" ? "bg-slate-900 text-white hover:bg-slate-800" : "border-stone-300 bg-white text-slate-700 hover:bg-stone-50"}>Pareto do Livro</Button><Button type="button" variant={paretoPath === "advanced" ? "default" : "outline"} onClick={() => selectParetoPath("advanced")} className={paretoPath === "advanced" ? "bg-slate-900 text-white hover:bg-slate-800" : "border-stone-300 bg-white text-slate-700 hover:bg-stone-50"}>Curso Pareto avançado</Button></div>
          <div className="mt-6 border-y border-stone-200 py-4">
            <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.12em] text-amber-800">Progresso</p><p className="mt-1 font-serif text-2xl font-bold text-slate-950">{completedCount} <span className="text-base font-semibold text-slate-600">de {programReadyCount} palavras</span></p>{dueReviewIds.length > 0 && <p className="mt-1 text-sm font-semibold text-sky-800">Há {dueReviewIds.length} revisão{dueReviewIds.length === 1 ? "" : "ões"} para retomar.</p>}</div><Button type="button" onClick={dueReviewIds.length > 0 ? openDueReview : () => setPracticeWord(nextWord)} disabled={dueReviewIds.length === 0 && !nextWord} className="bg-slate-900 font-bold text-white hover:bg-slate-800">{dueReviewIds.length > 0 ? "Revisar pendências" : nextWord ? "Começar a próxima palavra" : "Trilha concluída"}</Button></div>
            <div className="mt-4 h-1.5 overflow-hidden bg-stone-200"><div className="h-full bg-amber-500 transition-all" style={{ width: `${Math.max(1, (completedCount / Math.max(programReadyCount, 1)) * 100)}%` }} /></div>
          </div>
        </header>

        <section className="border-b border-stone-200 px-6 py-6 sm:px-10">
          <div className="flex items-center gap-2"><PenLine className="h-5 w-5 text-amber-700" /><h2 className="font-serif text-xl font-bold">Como cada palavra é treinada</h2></div>
          <ol className="mt-4 grid gap-3 text-sm leading-6 text-slate-700 sm:grid-cols-2"><li><strong className="text-slate-950">1. Observe.</strong> Leia, ouça e associe ao exemplo.</li><li><strong className="text-slate-950">2. Lembre.</strong> Escreva em inglês sem olhar.</li><li><strong className="text-slate-950">3. Escreva.</strong> Repita a grafia com atenção.</li><li><strong className="text-slate-950">4. Use.</strong> Crie uma frase curta e verdadeira.</li></ol>
          {paretoPath === "book" && paretoQuery.data?.bookContext && <p className="mt-4 border-l-2 border-violet-300 pl-4 text-sm font-semibold leading-6 text-slate-700">{paretoQuery.data.bookContext.recallPrompt}</p>}
        </section>

        {advancedChallenge && <section className="border-b border-stone-200 px-6 py-6 sm:px-10">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-amber-800">Desafio de estrutura · {advancedChallenge.level}</p>
          <h2 className="mt-2 font-serif text-xl font-bold text-slate-950">{advancedChallenge.focus}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-700">{advancedChallenge.prompt}</p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row"><input value={structureAttempt} onChange={(event) => { setStructureAttempt(event.target.value); setStructureChecked(false); }} placeholder="Escreva a frase em inglês" className="min-w-0 flex-1 border border-stone-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none ring-amber-500 focus:ring-2" /><Button type="button" onClick={() => setStructureChecked(true)} disabled={!structureAttempt.trim()} className="bg-slate-900 text-white hover:bg-slate-800">Conferir ordem</Button></div>
          {structureChecked && <p className={`mt-3 border-l-2 pl-4 text-sm leading-6 ${structureAnswerIsCorrect ? "border-emerald-500 text-emerald-800" : "border-amber-500 text-slate-700"}`}>{structureAnswerIsCorrect ? "Correto. " : `Resposta-modelo: ${advancedChallenge.answer} `}{advancedChallenge.explanation}</p>}
        </section>}

        <section className="px-6 py-7 sm:px-10 sm:py-9">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-stone-200 pb-4"><div><p className="text-xs font-black uppercase tracking-[0.12em] text-amber-800">Sessão {page + 1} de {totalPages}</p><h2 className="mt-1 font-serif text-2xl font-bold">Palavras desta sessão</h2></div><Button type="button" variant="outline" onClick={() => setPracticeWord(sessionWords.find((word) => !completed.has(word.id)) ?? sessionWords[0] ?? null)} className="border-stone-300 bg-white text-slate-800 hover:bg-stone-50">Começar esta sessão</Button></div>
          {paretoPath === "book" && paretoQuery.data?.bookContext && <p className="mt-4 border-b border-stone-200 pb-4 text-sm leading-6 text-slate-700"><strong className="text-slate-950">Ordem da frase:</strong> {paretoQuery.data.bookContext.orderPrompt}</p>}
          <ol className="divide-y divide-stone-200">
            {sessionWords.map((word, index) => {
              const reviewDue = dueReviewSet.has(word.id);
              return <li key={word.id} className="grid gap-4 py-5 sm:grid-cols-[3rem_1fr_auto] sm:items-center"><span className="font-serif text-xl font-bold text-amber-700">{String(sessionStart + index + 1).padStart(2, "0")}</span><div><p className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">{word.category}</p><p className="mt-1 font-serif text-xl font-bold text-slate-950">{word.enUS} <span className="text-base font-semibold text-sky-800">— {word.ptBR}</span></p><p className="mt-2 text-sm leading-6 text-slate-700">{word.example}</p><p className="mt-1 text-sm font-semibold leading-6 text-slate-600">Em português: {word.examplePt}</p></div><div className="flex gap-2"><Button type="button" size="sm" variant="ghost" onClick={() => speak(word.enUS)} disabled={speakMutation.isPending} className="text-sky-800 hover:bg-sky-50 hover:text-sky-950" aria-label={`Ouvir ${word.enUS}`}><Headphones className="h-4 w-4" /></Button><Button type="button" size="sm" onClick={() => setPracticeWord(word)} className={reviewDue ? "bg-sky-700 text-white hover:bg-sky-800" : completed.has(word.id) ? "bg-emerald-700 text-white hover:bg-emerald-800" : "bg-slate-900 text-white hover:bg-slate-800"}>{reviewDue ? "Revisar" : completed.has(word.id) ? <CheckCircle2 className="h-4 w-4" /> : "Praticar"}</Button></div></li>;
            })}
          </ol>
          <div className="mt-7 flex items-center justify-between border-t border-stone-200 pt-5"><Button type="button" variant="ghost" disabled={page === 0} onClick={() => setPage((current) => current - 1)} className="text-slate-700 hover:bg-stone-50">Sessão anterior</Button><Button type="button" variant="ghost" disabled={page >= totalPages - 1} onClick={() => setPage((current) => current + 1)} className="text-slate-700 hover:bg-stone-50">Próximas 10 palavras</Button></div>
        </section>
      </article>
      {practiceWord && <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/35 p-4 backdrop-blur-sm sm:items-center"><ParetoPracticeCycle embedded level="A1" term={{ word: practiceWord.enUS, translation: practiceWord.ptBR, example: practiceWord.example, exampleTranslation: practiceWord.examplePt }} onSpeak={speak} onClose={() => setPracticeWord(null)} onComplete={completeWord} onNext={openNextWord} /></div>}
    </main>
  );
}
