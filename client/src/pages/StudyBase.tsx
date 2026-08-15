import { ParetoPracticeCycle } from "@/components/ParetoPracticeCycle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CEFRLevel } from "@/lib/lesson-levels";
import {
  filterStudyEntriesByUnit,
  getStudyBaseTeacherReply,
  getStudyUnits,
  getSentenceStarter,
  getSentenceTransformation,
  getStructuredStudyUnit,
  reviewStudySentence,
  reviewStudyTransformation,
  searchStudyBase,
  STUDY_BASE_A1_ENTRIES,
  type StudyEntry,
  type StudyEntryKind,
} from "@/lib/studyBase";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  Headphones,
  MessageCircleMore,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { Link } from "wouter";

const FILTERS: Array<{ id: StudyEntryKind | "all"; label: string }> = [
  { id: "all", label: "Tudo" },
  { id: "vocabulary", label: "Vocabulário" },
  { id: "grammar", label: "Gramática" },
  { id: "situation", label: "Situações reais" },
];

type StudyPath = "cartilha" | "pareto" | "unidade" | "consulta";

function getStoredLevel(): CEFRLevel {
  try {
    const saved = localStorage.getItem("multilingue_cefr_level");
    if (saved && ["A1", "A2", "B1", "B2", "C1", "C2"].includes(saved)) return saved as CEFRLevel;
  } catch {
    // The pilot remains usable with the conservative A1 default.
  }
  return "A1";
}

export default function StudyBase() {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<StudyEntryKind | "all">("all");
  const [unit, setUnit] = useState<string | "all">("all");
  const [level] = useState<CEFRLevel>(getStoredLevel);
  const [selectedEntry, setSelectedEntry] = useState<StudyEntry | null>(null);
  const [practiceEntry, setPracticeEntry] = useState<StudyEntry | null>(null);
  const [teacherQuestion, setTeacherQuestion] = useState("");
  const [teacherReply, setTeacherReply] = useState("");
  const [sentenceDraft, setSentenceDraft] = useState("");
  const [sentenceFeedback, setSentenceFeedback] = useState("");
  const [transformationDraft, setTransformationDraft] = useState("");
  const [transformationFeedback, setTransformationFeedback] = useState("");
  const [comprehensionAnswers, setComprehensionAnswers] = useState<Record<string, number>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const speakMutation = trpc.tts.speak.useMutation();
  const returnTo = useMemo(() => {
    const destination = typeof window === "undefined"
      ? null
      : new URLSearchParams(window.location.search).get("returnTo");
    return destination?.startsWith("/") ? destination : "/dashboard";
  }, []);

  const units = useMemo(() => getStudyUnits(level), [level]);
  const entries = useMemo(
    () => filterStudyEntriesByUnit(searchStudyBase(query, kind, level), unit),
    [kind, level, query, unit],
  );
  const activeEntry = selectedEntry && entries.some((entry) => entry.id === selectedEntry.id)
    ? selectedEntry
    : entries[0] ?? null;
  const structuredUnit = getStructuredStudyUnit(activeEntry?.unit);

  const chooseStudyPath = useCallback((path: StudyPath) => {
    if (path === "consulta") {
      window.setTimeout(() => searchInputRef.current?.focus(), 0);
      return;
    }
    if (path === "pareto") {
      if (activeEntry) setPracticeEntry(activeEntry);
      return;
    }
    setQuery("");
    setKind("all");
    setUnit(path === "cartilha" ? "all" : "Unidade 1 · Cumprimentos e identidade");
    setSelectedEntry(null);
  }, [activeEntry]);

  const playTargetVoice = useCallback(async (text: string) => {
    if (!text.trim()) return;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    try {
      const result = await speakMutation.mutateAsync({ text: text.slice(0, 400), voiceLang: "en-US", gender: "male" });
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
      // The written and Pareto practice paths stay usable if neural audio is temporarily unavailable.
    }
  }, [speakMutation]);

  const askTeacher = useCallback(() => {
    if (!activeEntry) return;
    setTeacherReply(getStudyBaseTeacherReply(activeEntry, teacherQuestion));
  }, [activeEntry, teacherQuestion]);

  const reviewSentence = useCallback(() => {
    if (!activeEntry) return;
    setSentenceFeedback(reviewStudySentence(activeEntry, sentenceDraft));
  }, [activeEntry, sentenceDraft]);

  const reviewTransformation = useCallback(() => {
    if (!activeEntry) return;
    setTransformationFeedback(reviewStudyTransformation(activeEntry, transformationDraft));
  }, [activeEntry, transformationDraft]);

  const openEntry = (entry: StudyEntry) => {
    setSelectedEntry(entry);
    setTeacherQuestion("");
    setTeacherReply("");
    setSentenceDraft("");
    setSentenceFeedback("");
    setTransformationDraft("");
    setTransformationFeedback("");
    setComprehensionAnswers({});
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/95 backdrop-blur">
        <div className="container flex items-center justify-between gap-4 py-4">
          <Link href={returnTo}>
            <Button variant="ghost" className="gap-2 text-slate-200 hover:bg-white/10 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              {returnTo === "/immersive-scene" ? "Voltar à cena" : "Voltar ao painel"}
            </Button>
          </Link>
          <div className="flex items-center gap-2 text-sm text-cyan-200">
            <ShieldCheck className="h-4 w-4" />
            Conteúdo curricular original
          </div>
        </div>
      </header>

      <div className="container py-8 sm:py-12">
        <section className="rounded-3xl border border-cyan-400/25 bg-gradient-to-br from-cyan-500/15 via-slate-900 to-violet-500/15 p-6 shadow-2xl sm:p-9">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-cyan-100">
              <BrainCircuit className="h-4 w-4" />
              Base de Estudos · piloto A1
            </div>
            <h1 className="text-3xl font-black tracking-tight sm:text-5xl">Pesquise, entenda e pratique no mesmo lugar.</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">
              Esta base conecta explicações originais, vocabulário Pareto, pronúncia figurativa, prática ativa e orientação contextual do professor.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-slate-100">
              <span className="rounded-full bg-white/10 px-3 py-1.5">PT-BR → inglês</span>
              <span className="rounded-full bg-white/10 px-3 py-1.5">Nível {level}</span>
              <span className="rounded-full bg-white/10 px-3 py-1.5">Pareto: lembrar, escrever e criar</span>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Escolha como estudar">
          <button type="button" onClick={() => chooseStudyPath("cartilha")} className="rounded-2xl border border-fuchsia-300/35 bg-fuchsia-300/10 p-4 text-left transition hover:bg-fuchsia-300/20">
            <BookOpen className="h-5 w-5 text-fuchsia-100" />
            <strong className="mt-3 block text-fuchsia-50">Cartilha Completa</strong>
            <span className="mt-1 block text-sm leading-5 text-slate-200">Textos, gramática, compreensão, escrita e exercícios por unidade.</span>
          </button>
          <button type="button" onClick={() => chooseStudyPath("pareto")} className="rounded-2xl border border-amber-300/35 bg-amber-300/10 p-4 text-left transition hover:bg-amber-300/20">
            <BrainCircuit className="h-5 w-5 text-amber-100" />
            <strong className="mt-3 block text-amber-50">Pareto · 1.000 palavras</strong>
            <span className="mt-1 block text-sm leading-5 text-slate-200">Memorizar, escrever, recuperar e revisar. Piloto atual: {STUDY_BASE_A1_ENTRIES.length} entradas.</span>
          </button>
          <button type="button" onClick={() => chooseStudyPath("unidade")} className="rounded-2xl border border-cyan-300/35 bg-cyan-300/10 p-4 text-left transition hover:bg-cyan-300/20">
            <Sparkles className="h-5 w-5 text-cyan-100" />
            <strong className="mt-3 block text-cyan-50">Estudar por unidade</strong>
            <span className="mt-1 block text-sm leading-5 text-slate-200">Avançar por texto, explicação, treino e criação de frases.</span>
          </button>
          <button type="button" onClick={() => chooseStudyPath("consulta")} className="rounded-2xl border border-violet-300/35 bg-violet-300/10 p-4 text-left transition hover:bg-violet-300/20">
            <Search className="h-5 w-5 text-violet-100" />
            <strong className="mt-3 block text-violet-50">Consulta Rápida e Total</strong>
            <span className="mt-1 block text-sm leading-5 text-slate-200">Pesquisar palavra, gramática, frase ou situação e voltar ao estudo.</span>
          </button>
        </section>

        <section className="mt-7 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-xl">
            <label htmlFor="study-search" className="text-sm font-bold text-slate-100">O que você quer estudar?</label>
            <div className="relative mt-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="study-search"
                ref={searchInputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Ex.: pool, mãe, onde, apresentação..."
                className="border-white/15 bg-slate-950 py-6 pl-10 text-white placeholder:text-slate-500 focus-visible:ring-cyan-300"
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2" aria-label="Filtrar conteúdo da Base de Estudos">
              {FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setKind(filter.id)}
                  className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ${
                    kind === filter.id
                      ? "border-cyan-300 bg-cyan-300 text-slate-950"
                      : "border-white/15 bg-white/5 text-slate-200 hover:border-cyan-300/60 hover:bg-cyan-300/10"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-cyan-300/15 bg-cyan-300/5 p-3">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-cyan-100">Progressão A1 · palavra → frase → conversa</p>
              <div className="mt-2 flex flex-wrap gap-2" aria-label="Selecionar unidade curricular">
                <button
                  type="button"
                  onClick={() => setUnit("all")}
                  className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${unit === "all" ? "border-cyan-300 bg-cyan-300 text-slate-950" : "border-white/15 text-slate-200 hover:border-cyan-300/60"}`}
                >
                  Todo A1
                </button>
                {units.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setUnit(item)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${unit === item ? "border-cyan-300 bg-cyan-300 text-slate-950" : "border-white/15 text-slate-200 hover:border-cyan-300/60"}`}
                  >
                    {item.replace("Unidade ", "U")}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 space-y-3" aria-live="polite">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">{entries.length} resultado{entries.length === 1 ? "" : "s"}</p>
              {entries.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => openEntry(entry)}
                  className={`w-full rounded-2xl border p-4 text-left transition-colors ${
                    activeEntry?.id === entry.id
                      ? "border-cyan-300 bg-cyan-300/10"
                      : "border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.08em] text-cyan-200">{entry.unit}</p>
                      <p className="text-sm font-black text-white">{entry.title}</p>
                      <p className="mt-1 text-sm text-slate-300">{entry.subtitle}</p>
                    </div>
                    <span className="rounded-full bg-white/10 px-2 py-1 text-[11px] font-bold text-cyan-100">{entry.cefr}</span>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-amber-200">{entry.paretoWord} · {entry.paretoTranslation}</p>
                </button>
              ))}
              {entries.length === 0 && (
                <div className="rounded-2xl border border-dashed border-white/15 p-5 text-sm text-slate-300">
                  Nenhum conteúdo A1 encontrado para esta busca. Tente um termo como “pool”, “ajuda”, “mãe” ou “onde”.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-xl sm:p-7">
            {activeEntry ? (
              <article>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-cyan-200">
                    <BookOpen className="h-5 w-5" />
                    <span className="text-sm font-bold">Base de Estudos · {activeEntry.cefr}</span>
                  </div>
                  <span className="rounded-full border border-violet-300/30 bg-violet-300/10 px-3 py-1 text-xs font-bold text-violet-100">Cena: {activeEntry.relatedScene}</span>
                </div>
                <p className="mt-3 text-xs font-bold uppercase tracking-[0.12em] text-cyan-200">{activeEntry.unit} · Pareto: lembrar, escrever e criar</p>
                <h2 className="mt-5 text-2xl font-black sm:text-3xl">{activeEntry.title}</h2>
                <p className="mt-2 text-slate-300">{activeEntry.subtitle}</p>

                {structuredUnit && (
                  <section className="mt-5 rounded-2xl border border-fuchsia-300/25 bg-fuchsia-300/5 p-4" aria-labelledby="structured-unit-heading">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.12em] text-fuchsia-200">Cartilha original · texto → gramática → escrita</p>
                        <h3 id="structured-unit-heading" className="mt-1 text-lg font-black text-white">{structuredUnit.readingTitle}</h3>
                      </div>
                      <span className="rounded-full border border-fuchsia-300/30 bg-fuchsia-300/10 px-3 py-1 text-xs font-bold text-fuchsia-100">Objetivo A1</span>
                    </div>
                    <p className="mt-3 text-sm font-semibold leading-6 text-fuchsia-50">{structuredUnit.objective}</p>
                    <div className="mt-4 rounded-xl border border-white/10 bg-slate-950/60 p-4">
                      <p className="text-base font-semibold leading-7 text-white">{structuredUnit.reading}</p>
                      <p className="mt-3 border-l-2 border-fuchsia-300 pl-3 text-sm leading-6 text-slate-300">{structuredUnit.readingTranslation}</p>
                      <Button type="button" onClick={() => playTargetVoice(structuredUnit.reading)} disabled={speakMutation.isPending} className="mt-4 gap-2 bg-fuchsia-300 font-bold text-slate-950 hover:bg-fuchsia-200">
                        <Headphones className="h-4 w-4" />
                        Ouvir o texto
                      </Button>
                    </div>
                    <div className="mt-4 rounded-xl border border-cyan-300/20 bg-cyan-300/5 p-4">
                      <p className="text-sm font-bold text-cyan-100">{structuredUnit.grammarTitle}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-200">{structuredUnit.grammarExplanation}</p>
                    </div>
                    <div className="mt-4 space-y-3">
                      <p className="text-sm font-bold text-white">Compreensão do texto</p>
                      {structuredUnit.questions.map((question) => {
                        const selected = comprehensionAnswers[question.id];
                        return (
                          <div key={question.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                            <p className="text-sm font-semibold text-slate-100">{question.prompt}</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {question.options.map((option, index) => (
                                <button key={option} type="button" onClick={() => setComprehensionAnswers((answers) => ({ ...answers, [question.id]: index }))} className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${selected === index ? (index === question.correctIndex ? "border-emerald-300 bg-emerald-300/15 text-emerald-100" : "border-rose-300 bg-rose-300/15 text-rose-100") : "border-white/15 bg-slate-950/50 text-slate-200 hover:border-fuchsia-300/60"}`}>
                                  {option}
                                </button>
                              ))}
                            </div>
                            {selected !== undefined && <p role="status" className="mt-2 text-sm text-slate-300">{selected === question.correctIndex ? `Correto. ${question.explanation}` : `Revise o texto. ${question.explanation}`}</p>}
                          </div>
                        );
                      })}
                    </div>
                    <p className="mt-4 rounded-lg border border-amber-300/25 bg-amber-300/10 px-3 py-2 text-sm leading-6 text-amber-100"><strong>Escrita para fixar:</strong> {structuredUnit.writingPrompt}</p>
                  </section>
                )}

                <div className="mt-6 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-amber-200">Frase-alvo</p>
                  <p className="mt-2 text-xl font-black text-white">{activeEntry.targetText}</p>
                  {activeEntry.figurativePronunciation && (
                    <p className="mt-2 text-sm font-semibold text-amber-100">Pronúncia figurativa: {activeEntry.figurativePronunciation}</p>
                  )}
                  <Button
                    type="button"
                    onClick={() => playTargetVoice(activeEntry.targetText)}
                    disabled={speakMutation.isPending}
                    className="mt-4 gap-2 bg-cyan-300 font-bold text-slate-950 hover:bg-cyan-200"
                  >
                    <Headphones className="h-4 w-4" />
                    {speakMutation.isPending ? "Preparando voz..." : "Ouvir inglês"}
                  </Button>
                </div>

                <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Explicação em português</p>
                  <p className="mt-2 leading-7 text-slate-100">{activeEntry.nativeExplanation}</p>
                  <div className="mt-4 border-l-2 border-cyan-300 pl-3">
                    <p className="font-semibold text-cyan-100">{activeEntry.example}</p>
                    <p className="mt-1 text-sm text-slate-300">{activeEntry.exampleTranslation}</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setPracticeEntry(activeEntry)}
                    className="flex items-center gap-3 rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4 text-left transition-colors hover:bg-amber-300/20"
                  >
                    <Sparkles className="h-5 w-5 text-amber-200" />
                    <span><strong className="block text-amber-100">Praticar Pareto</strong><span className="text-sm text-slate-300">Lembrar, escrever e criar frase</span></span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTeacherReply(getStudyBaseTeacherReply(activeEntry, ""))}
                    className="flex items-center gap-3 rounded-2xl border border-violet-300/30 bg-violet-300/10 p-4 text-left transition-colors hover:bg-violet-300/20"
                  >
                    <MessageCircleMore className="h-5 w-5 text-violet-200" />
                    <span><strong className="block text-violet-100">Pedir orientação</strong><span className="text-sm text-slate-300">Professor explica o próximo passo</span></span>
                  </button>
                </div>

                <section className="mt-5 rounded-2xl border border-cyan-300/25 bg-cyan-300/5 p-4" aria-labelledby="sentence-workshop-heading">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-cyan-200" />
                    <h3 id="sentence-workshop-heading" className="font-bold text-white">Criar frases novas com Pareto</h3>
                  </div>
                  <p className="mt-2 text-sm text-slate-300">Use a mesma palavra em outra situação. Primeiro siga o modelo; depois altere uma informação e crie sua própria frase.</p>
                  <p className="mt-3 rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm font-semibold text-cyan-100">Modelo: {getSentenceStarter(activeEntry)}</p>
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <Input
                      value={sentenceDraft}
                      onChange={(event) => setSentenceDraft(event.target.value)}
                      onKeyDown={(event) => { if (event.key === "Enter") reviewSentence(); }}
                      placeholder={`Crie uma frase com ${activeEntry.paretoWord}`}
                      className="border-white/15 bg-slate-950 text-white placeholder:text-slate-500"
                    />
                    <Button type="button" onClick={reviewSentence} className="bg-cyan-300 font-bold text-slate-950 hover:bg-cyan-200">Revisar frase</Button>
                    <Button type="button" variant="outline" disabled={!sentenceDraft.trim() || speakMutation.isPending} onClick={() => playTargetVoice(sentenceDraft)} className="border-cyan-300/45 text-cyan-100 hover:bg-cyan-300/10 hover:text-cyan-50">Ouvir frase</Button>
                  </div>
                  {sentenceFeedback && <p role="status" className="mt-3 rounded-lg border border-amber-300/25 bg-amber-300/10 px-3 py-2 text-sm text-amber-100">{sentenceFeedback}</p>}
                </section>

                <section className="mt-5 rounded-2xl border border-emerald-300/25 bg-emerald-300/5 p-4" aria-labelledby="sentence-transform-heading">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-emerald-200" />
                    <h3 id="sentence-transform-heading" className="font-bold text-white">Transformar a frase</h3>
                  </div>
                  <p className="mt-2 text-sm text-slate-300">{getSentenceTransformation(activeEntry).instruction}</p>
                  <p className="mt-3 rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm font-semibold text-emerald-100">Modelo: {getSentenceTransformation(activeEntry).source}</p>
                  <p className="mt-2 text-sm text-slate-300">Pista: {getSentenceTransformation(activeEntry).hint}</p>
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <Input
                      value={transformationDraft}
                      onChange={(event) => setTransformationDraft(event.target.value)}
                      onKeyDown={(event) => { if (event.key === "Enter") reviewTransformation(); }}
                      placeholder="Escreva a frase transformada"
                      className="border-white/15 bg-slate-950 text-white placeholder:text-slate-500"
                    />
                    <Button type="button" onClick={reviewTransformation} className="bg-emerald-300 font-bold text-slate-950 hover:bg-emerald-200">Conferir mudança</Button>
                    <Button type="button" variant="outline" disabled={!transformationDraft.trim() || speakMutation.isPending} onClick={() => playTargetVoice(transformationDraft)} className="border-emerald-300/45 text-emerald-100 hover:bg-emerald-300/10 hover:text-emerald-50">Ouvir mudança</Button>
                  </div>
                  {transformationFeedback && <p role="status" className="mt-3 rounded-lg border border-emerald-300/25 bg-emerald-300/10 px-3 py-2 text-sm text-emerald-100">{transformationFeedback}</p>}
                </section>

                <section className="mt-5 rounded-2xl border border-white/10 bg-slate-950/60 p-4" aria-labelledby="study-teacher-heading">
                  <div className="flex items-center gap-2">
                    <MessageCircleMore className="h-5 w-5 text-violet-200" />
                    <h3 id="study-teacher-heading" className="font-bold text-white">Professor da Base de Estudos</h3>
                  </div>
                  <p className="mt-2 text-sm text-slate-300">Pergunte sobre significado, pronúncia, exemplo ou como usar o conteúdo nesta lição.</p>
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <Input
                      value={teacherQuestion}
                      onChange={(event) => setTeacherQuestion(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") askTeacher();
                      }}
                      placeholder="Ex.: Como pronuncio isso?"
                      className="border-white/15 bg-white/5 text-white placeholder:text-slate-500"
                    />
                    <Button type="button" onClick={askTeacher} className="bg-violet-400 font-bold text-slate-950 hover:bg-violet-300">Perguntar</Button>
                  </div>
                  {teacherReply && (
                    <div className="mt-3 rounded-xl border border-violet-300/25 bg-violet-300/10 p-3 text-sm leading-6 text-violet-50" role="status">
                      <span className="font-bold">Professor:</span> {teacherReply}
                    </div>
                  )}
                </section>
              </article>
            ) : (
              <div className="flex min-h-72 flex-col items-center justify-center text-center text-slate-400">
                <BookOpen className="h-12 w-12" />
                <p className="mt-4 font-semibold">Escolha um resultado para estudar.</p>
              </div>
            )}
          </div>
        </section>

        {practiceEntry && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/75 p-4 backdrop-blur-sm sm:items-center" role="dialog" aria-modal="true">
            <ParetoPracticeCycle
              embedded
              level={practiceEntry.cefr}
              term={{
                word: practiceEntry.paretoWord,
                translation: practiceEntry.paretoTranslation,
                example: practiceEntry.example,
              }}
              onSpeak={playTargetVoice}
              onClose={() => setPracticeEntry(null)}
              onComplete={() => setTeacherReply(`Excelente. Você concluiu o ciclo Pareto para “${practiceEntry.paretoWord}”. Agora use a frase-alvo em uma conversa curta.`)}
            />
          </div>
        )}

        <footer className="mt-8 flex items-center gap-2 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4 text-sm text-emerald-100">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          O piloto usa conteúdo autoral A1 para PT-BR → inglês. A expansão para outros idiomas exige conteúdo, gramática, voz e validação próprios.
        </footer>
      </div>
    </main>
  );
}
