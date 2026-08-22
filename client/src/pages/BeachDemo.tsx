import { useState } from "react";
import { Link } from "wouter";
import { ArrowRight, Volume2, LockKeyhole, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { speakEdgeTTS, stopEdgeTTS } from "@/lib/edgeTTSClient";

type BeachTurn = { teacher: string; translation: string; response: string };

export default function BeachDemo() {
  const sample = trpc.beachDemo.getSample.useQuery();
  const [interaction, setInteraction] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const data = sample.data;
  const turn = data?.turns[interaction] as BeachTurn | undefined;
  const completed = data ? interaction >= data.maxInteractions : false;

  async function speakJames() {
    if (!turn || !data) return;
    setIsSpeaking(true);
    try {
      await speakEdgeTTS(turn.teacher, data.scene.teacherVoiceLanguage, { gender: "male" });
    } finally {
      setIsSpeaking(false);
    }
  }

  if (!data) return <main className="min-h-screen bg-slate-950 p-8 text-center text-white/70">Preparando a cena de demonstração...</main>;

  return <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
    <img src={data.scene.backgroundImage} alt="Praia tropical" className="absolute inset-0 h-full w-full object-cover opacity-35" />
    <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/45 to-slate-950" />
    <section className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-8 sm:px-8">
      <Link href="/demo" className="w-fit text-sm text-white/80 hover:text-white">← Voltar às lições de demonstração</Link>
      <div className="my-auto grid items-center gap-8 py-10 lg:grid-cols-[0.72fr_1.28fr]">
        <aside className="rounded-3xl border border-white/20 bg-slate-950/45 p-5 text-center shadow-2xl backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">Amostra imersiva</p>
          <div className="mx-auto mt-5 h-56 w-56 overflow-hidden rounded-3xl border-4 border-cyan-200/40 bg-slate-900 shadow-xl">
            <img src={data.scene.teacherImage} alt="Professor James" className="h-full w-full object-cover" />
          </div>
          <h1 className="mt-5 text-3xl font-black">James na Praia Tropical</h1>
          <p className="mt-2 text-sm leading-relaxed text-white/70">Três interações abertas para conhecer a prática guiada. O restante da cena permanece no percurso protegido.</p>
          <p className="mt-5 flex items-center justify-center gap-2 text-sm font-semibold text-cyan-100"><Waves className="h-4 w-4" /> Inglês com voz masculina en-US</p>
        </aside>
        <section className="rounded-3xl border border-white/20 bg-slate-950/50 p-6 shadow-2xl backdrop-blur sm:p-8">
          {completed ? <Completion /> : turn ? <div>
            <p className="text-sm font-semibold text-cyan-200">Interação {interaction + 1} de {data.maxInteractions}</p>
            <div className="mt-5 rounded-3xl border border-cyan-200/20 bg-cyan-300/10 p-6">
              <p className="text-sm font-bold text-cyan-100">James</p>
              <p className="mt-3 text-2xl font-bold leading-snug">{turn.teacher}</p>
              <p className="mt-3 text-base text-white/70">{turn.translation}</p>
              <Button onClick={speakJames} disabled={isSpeaking} variant="outline" className="mt-5 border-white/25 bg-transparent text-white hover:bg-white/10"><Volume2 className="mr-2 h-4 w-4" />{isSpeaking ? "James está falando" : "Ouvir James"}</Button>
            </div>
            <div className="mt-5 rounded-3xl border border-white/15 bg-white/10 p-6"><p className="text-sm font-semibold text-white/70">Sua resposta guiada</p><p className="mt-3 text-xl font-bold">{turn.response}</p></div>
            <Button onClick={() => { stopEdgeTTS(); setInteraction((count) => count + 1); }} className="mt-7 bg-gradient-to-r from-cyan-300 to-blue-400 font-bold text-slate-950 hover:from-cyan-200 hover:to-blue-300">Responder e continuar <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </div> : null}
        </section>
      </div>
    </section>
  </main>;
}

function Completion() {
  return <div className="flex min-h-[380px] flex-col items-center justify-center text-center"><span className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-300 text-slate-950"><LockKeyhole className="h-7 w-7" /></span><p className="mt-6 text-sm font-semibold text-amber-200">Amostra concluída</p><h2 className="mt-2 text-3xl font-black">Continue a conversa completa com James</h2><p className="mx-auto mt-4 max-w-lg text-white/70">A cena completa inclui prática guiada, vocabulário protegido, correção e novas interações conforme seu progresso.</p><Link href="/pricing" className="mt-8"><Button className="bg-gradient-to-r from-amber-300 to-orange-400 font-bold text-slate-950 hover:from-amber-200 hover:to-orange-300">Conhecer planos <ArrowRight className="ml-2 h-4 w-4" /></Button></Link></div>;
}
