import { useMemo, useState } from "react";
import {
  checkParetoRecall,
  checkParetoSentence,
  getParetoLevelRequirement,
  type ParetoPracticeStep,
  type ParetoPracticeTerm,
} from "@/lib/paretoPracticeCycle";
import type { CEFRLevel } from "@/lib/lesson-levels";

interface ParetoPracticeCycleProps {
  term: ParetoPracticeTerm;
  onClose: () => void;
  onSpeak?: (text: string) => void;
  embedded?: boolean;
  level?: CEFRLevel;
}

const STEP_LABEL: Record<ParetoPracticeStep, string> = {
  observe: "1. Observe",
  recall: "2. Lembre",
  write: "3. Escreva",
  create: "4. Crie",
};

export function ParetoPracticeCycle({ term, onClose, onSpeak, embedded = false, level = "A1" }: ParetoPracticeCycleProps) {
  const [step, setStep] = useState<ParetoPracticeStep>("observe");
  const [recall, setRecall] = useState("");
  const [written, setWritten] = useState("");
  const [sentence, setSentence] = useState("");
  const [feedback, setFeedback] = useState("");
  const activeStep = useMemo(() => ["observe", "recall", "write", "create"].indexOf(step), [step]);
  const levelRequirement = useMemo(() => getParetoLevelRequirement(level), [level]);

  const checkRecall = (value: string, next: ParetoPracticeStep) => {
    const result = checkParetoRecall(value, term);
    setFeedback(result.message);
    if (result.correct) setStep(next);
  };

  const checkSentence = () => {
    const result = checkParetoSentence(sentence, term, levelRequirement);
    setFeedback(result.message);
    if (result.correct) setStep("create");
  };

  return (
    <section className={`${embedded ? "relative" : "absolute inset-x-3 bottom-3 z-[70]"} mx-auto max-w-xl rounded-3xl border border-amber-300/60 bg-slate-950/95 p-4 text-white shadow-2xl backdrop-blur-xl`} aria-label="Prática Pareto">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-300">Ciclo Pareto de memória</p>
          <h3 className="mt-1 text-xl font-black">{term.word} <span className="text-sm font-medium text-slate-300">— {term.translation}</span></h3>
        </div>
        <button type="button" onClick={onClose} className="rounded-full bg-white/10 px-3 py-1 text-sm hover:bg-white/20">Fechar</button>
      </div>

      <div className="mb-4 grid grid-cols-4 gap-1 text-center text-[10px] font-bold sm:text-xs">
        {(Object.keys(STEP_LABEL) as ParetoPracticeStep[]).map((key, index) => (
          <span key={key} className={`rounded-full px-1 py-1.5 ${index <= activeStep ? "bg-amber-400 text-slate-950" : "bg-white/10 text-slate-400"}`}>{STEP_LABEL[key]}</span>
        ))}
      </div>

      {step === "observe" && (
        <div className="space-y-3">
          <p className="text-sm text-slate-200">Leia, ouça e associe a palavra ao objeto antes de tentar lembrar sem olhar.</p>
          {term.example && <p className="rounded-xl bg-white/5 p-3 text-base font-semibold">{term.example}</p>}
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => onSpeak?.(term.word)} className="rounded-xl bg-cyan-500 px-3 py-2 text-sm font-bold text-slate-950">Ouvir voz natural</button>
            <button type="button" onClick={() => setStep("recall")} className="rounded-xl bg-amber-400 px-3 py-2 text-sm font-bold text-slate-950">Agora lembrar</button>
          </div>
        </div>
      )}

      {step === "recall" && (
        <div className="space-y-3">
          <p className="text-sm text-slate-200">Sem olhar: escreva em inglês a palavra para <strong>{term.translation}</strong>.</p>
          <input value={recall} onChange={(event) => setRecall(event.target.value)} className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white outline-none focus:border-amber-300" autoComplete="off" />
          <button type="button" onClick={() => checkRecall(recall, "write")} className="rounded-xl bg-amber-400 px-3 py-2 text-sm font-bold text-slate-950">Conferir memória</button>
        </div>
      )}

      {step === "write" && (
        <div className="space-y-3">
          <p className="text-sm text-slate-200">Escreva novamente a palavra para fixar a grafia.</p>
          <input value={written} onChange={(event) => setWritten(event.target.value)} className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white outline-none focus:border-amber-300" autoComplete="off" />
          <button type="button" onClick={() => checkRecall(written, "create")} className="rounded-xl bg-amber-400 px-3 py-2 text-sm font-bold text-slate-950">Validar escrita</button>
        </div>
      )}

      {step === "create" && (
        <div className="space-y-3">
          <p className="text-sm text-slate-200">{levelRequirement.guidance} Use <strong>{term.word}</strong> em uma nova frase de {levelRequirement.minSentenceWords} a {levelRequirement.maxSentenceWords} palavras.</p>
          <textarea value={sentence} onChange={(event) => setSentence(event.target.value)} rows={2} className="w-full resize-none rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white outline-none focus:border-amber-300" placeholder={`I see ${term.word}.`} />
          <button type="button" onClick={checkSentence} className="rounded-xl bg-amber-400 px-3 py-2 text-sm font-bold text-slate-950">Concluir prática</button>
        </div>
      )}

      {feedback && <p className="mt-3 rounded-xl bg-white/10 p-2 text-sm text-amber-100">{feedback}</p>}
    </section>
  );
}
