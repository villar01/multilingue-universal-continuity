import { useState } from "react";
import { Link } from "wouter";
import { LockKeyhole, CheckCircle2, BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

type DemoLessonContent = {
  number: number;
  title: string;
  objective: string;
  vocabulary: readonly { english: string; portuguese: string; example: string }[];
  dialogue: readonly { speaker: "James" | "Aluno"; text: string; translation: string }[];
  practicePrompt: string;
};

export default function DemoA1() {
  const [selectedLesson, setSelectedLesson] = useState(1);
  const path = trpc.demoA1.getPath.useQuery();
  const lesson = trpc.demoA1.getFreeLesson.useQuery({ lessonNumber: selectedLesson }, { enabled: selectedLesson <= 3, retry: false });
  const isLocked = selectedLesson > 3;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 px-4 py-10 text-white">
      <section className="mx-auto max-w-6xl">
        <Link href="/" className="text-sm text-white/70 hover:text-white">← Voltar ao início</Link>
        <div className="mt-8 grid gap-8 lg:grid-cols-[0.82fr_1.18fr]">
          <aside className="rounded-3xl border border-white/15 bg-white/5 p-5 shadow-2xl backdrop-blur">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">Demonstração A1</p>
                <h1 className="mt-2 text-3xl font-black">Inglês do início à primeira conversa</h1>
                <p className="mt-3 text-sm leading-relaxed text-white/70">As três primeiras lições são abertas. As próximas etapas mostram a progressão do curso completo.</p>
              </div>
              <BookOpen className="h-8 w-8 shrink-0 text-cyan-200" />
            </div>
            <div className="mt-7 space-y-2">
              {path.data?.lessons.map((item) => {
                const active = selectedLesson === item.number;
                return <button key={item.number} onClick={() => setSelectedLesson(item.number)} className={`w-full rounded-2xl border p-3 text-left transition ${active ? "border-cyan-300 bg-cyan-300/15" : "border-white/10 bg-black/10 hover:bg-white/10"}`}>
                  <div className="flex items-center gap-3">
                    <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${item.available ? "bg-emerald-400 text-slate-950" : "bg-white/15 text-white/75"}`}>{item.available ? <CheckCircle2 className="h-4 w-4" /> : <LockKeyhole className="h-4 w-4" />}</span>
                    <span className="min-w-0"><span className="block text-xs text-white/55">Lição {item.number} de {path.data.totalLessons}</span><span className="block truncate text-sm font-semibold">{item.title}</span></span>
                  </div>
                </button>;
              })}
            </div>
          </aside>
          <section className="rounded-3xl border border-white/15 bg-white/5 p-6 shadow-2xl backdrop-blur sm:p-8">
            {isLocked ? <LockedLesson number={selectedLesson} title={path.data?.lessons.find((item) => item.number === selectedLesson)?.title ?? "Próxima lição"} /> : lesson.data ? <FreeLesson lesson={lesson.data} onNext={() => setSelectedLesson((current) => Math.min(3, current + 1))} /> : <div className="py-20 text-center text-white/65">Preparando sua lição...</div>}
          </section>
        </div>
      </section>
    </main>
  );
}

function FreeLesson({ lesson, onNext }: { lesson: DemoLessonContent; onNext: () => void }) {
  return <div>
    <p className="text-sm font-semibold text-emerald-300">Lição {lesson.number} de 10 · acesso aberto</p>
    <h2 className="mt-2 text-3xl font-black">{lesson.title}</h2>
    <p className="mt-3 text-lg text-white/75">{lesson.objective}</p>
    <div className="mt-7 grid gap-3 sm:grid-cols-2">{lesson.vocabulary.map((word) => <article key={word.english} className="rounded-2xl border border-white/10 bg-slate-950/30 p-4"><p className="text-xl font-bold text-cyan-100">{word.english}</p><p className="mt-1 text-sm text-white/70">{word.portuguese}</p><p className="mt-3 text-sm italic text-white/55">“{word.example}”</p></article>)}</div>
    <div className="mt-7 rounded-2xl border border-violet-300/20 bg-violet-500/10 p-5"><p className="text-sm font-semibold text-violet-200">Diálogo guiado com James</p>{lesson.dialogue.map((line) => <div key={line.text} className="mt-4"><p className="font-bold text-white">{line.speaker}: <span className="font-medium">{line.text}</span></p><p className="mt-1 text-sm text-white/60">{line.translation}</p></div>)}</div>
    <div className="mt-6 rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4"><p className="text-sm font-bold text-amber-100">Prática rápida</p><p className="mt-1 text-white/80">{lesson.practicePrompt}</p></div>
    <div className="mt-8 flex flex-wrap gap-3"><Button onClick={onNext} className="bg-cyan-300 font-bold text-slate-950 hover:bg-cyan-200">Próxima lição aberta <ArrowRight className="ml-2 h-4 w-4" /></Button><Link href="/pricing"><Button variant="outline" className="border-white/25 bg-transparent text-white hover:bg-white/10">Ver o curso completo</Button></Link></div>
  </div>;
}

function LockedLesson({ number, title }: { number: number; title: string }) {
  return <div className="flex min-h-[430px] flex-col items-center justify-center text-center"><span className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-300 text-slate-950"><LockKeyhole className="h-7 w-7" /></span><p className="mt-6 text-sm font-semibold text-amber-200">Lição {number} de 10</p><h2 className="mt-2 text-3xl font-black">{title}</h2><p className="mx-auto mt-4 max-w-md text-white/70">Esta etapa mantém a progressão A1 e é liberada com o percurso completo. As três primeiras lições continuam disponíveis para você praticar agora.</p><Link href="/pricing" className="mt-8"><Button className="bg-gradient-to-r from-amber-300 to-orange-400 font-bold text-slate-950 hover:from-amber-200 hover:to-orange-300">Continuar com um plano <ArrowRight className="ml-2 h-4 w-4" /></Button></Link></div>;
}
