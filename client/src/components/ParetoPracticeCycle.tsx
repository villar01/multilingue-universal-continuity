import { useMemo, useState } from "react";
import {
  checkParetoAssembly,
  checkParetoRecall,
  checkParetoSentence,
  getParetoAssemblyModel,
  getParetoLevelRequirement,
  type ParetoPracticeStep,
  type ParetoPracticeTerm,
} from "@/lib/paretoPracticeCycle";
import { getScriptedExerciseFeedback } from "@/lib/scriptedExerciseFeedback";
import type { CEFRLevel } from "@/lib/lesson-levels";

interface ParetoPracticeCycleProps {
  term: ParetoPracticeTerm;
  onClose: () => void;
  onComplete?: () => void;
  onNext?: () => void;
  onSpeak?: (text: string) => void;
  embedded?: boolean;
  level?: CEFRLevel;
  feedbackLanguage?: string;
}

const STEP_LABEL: Record<ParetoPracticeStep, string> = {
  observe: "1. Observe",
  recall: "2. Lembre",
  write: "3. Escreva",
  assemble: "4. Monte",
  create: "5. Crie",
};

export function ParetoPracticeCycle({ term, onClose, onComplete, onNext, onSpeak, embedded = false, level = "A1", feedbackLanguage = "pt-BR" }: ParetoPracticeCycleProps) {
  const [step, setStep] = useState<ParetoPracticeStep>("observe");
  const [recall, setRecall] = useState("");
  const [written, setWritten] = useState("");
  const [assembledTokens, setAssembledTokens] = useState<number[]>([]);
  const [sentence, setSentence] = useState("");
  const [feedback, setFeedback] = useState("");
  const [completed, setCompleted] = useState(false);
  const activeStep = useMemo(() => ["observe", "recall", "write", "assemble", "create"].indexOf(step), [step]);
  const levelRequirement = useMemo(() => getParetoLevelRequirement(level), [level]);
  const assemblyModel = useMemo(() => getParetoAssemblyModel(term), [term]);
  const assemblyTokens = useMemo(() => assemblyModel.split(/\s+/), [assemblyModel]);
  const assembledSentence = assembledTokens.map((index) => assemblyTokens[index]).join(" ");
  const withScriptedFeedback = (message: string, correct: boolean) => {
    const scripted = getScriptedExerciseFeedback(correct ? "correct" : "retry", feedbackLanguage);
    return correct
      ? `${message} ${scripted.teacherText}`
      : `${message} ${scripted.teacherText} ${scripted.studyPrompt}`;
  };

  const checkRecall = (value: string, next: ParetoPracticeStep) => {
    const result = checkParetoRecall(value, term);
    setFeedback(withScriptedFeedback(result.message, result.correct));
    if (result.correct) setStep(next);
  };

  const checkSentence = () => {
    const result = checkParetoSentence(sentence, term, levelRequirement);
    setFeedback(withScriptedFeedback(result.message, result.correct));
    if (result.correct) {
      setCompleted(true);
      onComplete?.();
    }
  };

  const checkAssembly = () => {
    const result = checkParetoAssembly(assembledSentence, term);
    setFeedback(withScriptedFeedback(result.message, result.correct));
    if (result.correct) setStep("create");
  };

  return (
    <section className={`${embedded ? "relative" : "absolute inset-x-3 bottom-3 z-[70]"} mx-auto max-w-xl rounded-3xl border border-amber-200 bg-[#fffefb] p-4 text-slate-900 shadow-2xl shadow-amber-950/15`} aria-label="Prática Pareto">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-800">Ciclo Pareto de memória</p>
          <h3 className="mt-1 text-xl font-black">{term.word} <span className="text-sm font-medium text-slate-600">— {term.translation}</span></h3>
        </div>
        <button type="button" onClick={onClose} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm hover:bg-amber-50">Fechar</button>
      </div>

      <div className="mb-4 grid grid-cols-5 gap-1 text-center text-[10px] font-bold sm:text-xs">
        {(Object.keys(STEP_LABEL) as ParetoPracticeStep[]).map((key, index) => (
          <span key={key} className={`rounded-full px-1 py-1.5 ${index <= activeStep ? "bg-amber-400 text-slate-950" : "bg-amber-50 text-slate-500"}`}>{STEP_LABEL[key]}</span>
        ))}
      </div>

      {step === "observe" && (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">Primeiro compreenda o sentido em português. Depois leia, ouça e associe a palavra ao uso antes de tentar lembrar sem olhar.</p>
          {term.example && (
            <div className="rounded-xl border border-sky-200 bg-sky-50 p-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-sky-800">Uso em inglês</p>
              <p className="mt-1 text-base font-semibold">{term.example}</p>
              <p className="mt-2 text-sm font-medium text-amber-800"><span className="font-bold">Em português:</span> {term.exampleTranslation ?? `Sentido da palavra: ${term.translation}.`}</p>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => onSpeak?.(term.word)} className="rounded-xl bg-cyan-500 px-3 py-2 text-sm font-bold text-slate-950">Ouvir voz natural</button>
            <button type="button" onClick={() => setStep("recall")} className="rounded-xl bg-amber-400 px-3 py-2 text-sm font-bold text-slate-950">Agora lembrar</button>
          </div>
        </div>
      )}

      {step === "recall" && (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">Sem olhar: escreva em inglês a palavra para <strong>{term.translation}</strong>.</p>
          <input value={recall} onChange={(event) => setRecall(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none focus:border-amber-400" autoComplete="off" />
          <button type="button" onClick={() => checkRecall(recall, "write")} className="rounded-xl bg-amber-400 px-3 py-2 text-sm font-bold text-slate-950">Conferir memória</button>
        </div>
      )}

      {step === "write" && (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">Escreva novamente a palavra para fixar a grafia.</p>
          <input value={written} onChange={(event) => setWritten(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none focus:border-amber-400" autoComplete="off" />
          <button type="button" onClick={() => checkRecall(written, "assemble")} className="rounded-xl bg-amber-400 px-3 py-2 text-sm font-bold text-slate-950">Validar escrita</button>
        </div>
      )}

      {step === "assemble" && (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">Monte a frase-modelo antes de criar uma frase própria.</p>
          <div className="min-h-11 rounded-xl border border-sky-200 bg-sky-50 p-3 text-sm font-semibold text-slate-800" aria-live="polite">
            {assembledSentence || "Toque nas palavras na ordem correta."}
          </div>
          <div className="flex flex-wrap gap-2">
            {assemblyTokens.map((token, index) => (
              <button key={`${token}-${index}`} type="button" disabled={assembledTokens.includes(index)} onClick={() => setAssembledTokens((current) => [...current, index])} className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-950 disabled:cursor-not-allowed disabled:opacity-40">
                {token}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setAssembledTokens([])} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700">Limpar montagem</button>
            <button type="button" onClick={checkAssembly} disabled={assembledTokens.length !== assemblyTokens.length} className="rounded-xl bg-amber-400 px-3 py-2 text-sm font-bold text-slate-950 disabled:opacity-40">Conferir montagem</button>
          </div>
        </div>
      )}

      {step === "create" && !completed && (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">{levelRequirement.guidance} Use <strong>{term.word}</strong> em uma nova frase de {levelRequirement.minSentenceWords} a {levelRequirement.maxSentenceWords} palavras.</p>
          <textarea value={sentence} onChange={(event) => setSentence(event.target.value)} rows={2} className="w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none focus:border-amber-400" placeholder={`I see ${term.word}.`} />
          <button type="button" onClick={checkSentence} className="rounded-xl bg-amber-400 px-3 py-2 text-sm font-bold text-slate-950">Concluir prática</button>
        </div>
      )}

      {completed && (
        <div className="space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
          <p className="font-bold text-emerald-900">Memória concluída: você lembrou, escreveu e criou uma frase com <strong>{term.word}</strong>.</p>
          <button type="button" onClick={onNext || onClose} className="rounded-xl bg-emerald-300 px-3 py-2 text-sm font-bold text-slate-950">
            {onNext ? "Praticar próxima palavra" : "Concluir ciclo"}
          </button>
        </div>
      )}

      {feedback && <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-2 text-sm font-medium text-amber-950">{feedback}</p>}
    </section>
  );
}
