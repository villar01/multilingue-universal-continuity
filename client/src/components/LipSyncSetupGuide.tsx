import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { CheckCircle2, ChevronRight, Cpu, ExternalLink, ShieldCheck, Sparkles, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GPU_INTERACTION_NOTICE, LIP_SYNC_GUIDE_STORAGE_KEY, LIP_SYNC_SETUP_STEPS } from "@/lib/lipSyncSetup";

const START_ROUTES = new Set(["/"]);

export function LipSyncSetupGuide() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const setupRequested = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("setup") === "local-ai";
    if (!START_ROUTES.has(location) || !setupRequested) {
      setOpen(false);
      return;
    }

    try {
      setOpen(localStorage.getItem(LIP_SYNC_GUIDE_STORAGE_KEY) !== "1");
    } catch {
      // Sem armazenamento persistente, não sobrepor a jornada de aprendizagem.
      setOpen(false);
    }
  }, [location]);

  const closeGuide = () => {
    try {
      localStorage.setItem(LIP_SYNC_GUIDE_STORAGE_KEY, "1");
    } catch {
      // Sem acesso ao armazenamento local, a orientação continuará disponível nesta abertura.
    }
    setOpen(false);
  };

  if (!open || !START_ROUTES.has(location)) return null;

  return (
    <section
      className="fixed inset-0 z-[70] overflow-y-auto bg-slate-950/70 px-3 py-5 backdrop-blur-sm sm:px-6 sm:py-10"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lip-sync-setup-title"
    >
      <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-3xl border border-cyan-200/40 bg-white shadow-2xl">
        <header className="bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 px-5 py-6 text-white sm:px-8 sm:py-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-400/20">
              <Cpu className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">Preparação opcional do computador</p>
              <h2 id="lip-sync-setup-title" className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Guia de IA local e animação facial</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-200">
                Conheça os recursos já disponíveis e as opções que podem ampliar sua experiência no futuro. A animação facial avançada é preparada como uma camada independente, para preservar uma apresentação estável em cada atividade.
              </p>
            </div>
          </div>
        </header>

        <div className="space-y-5 p-5 sm:p-8">
          <div className="grid gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 sm:grid-cols-[auto_1fr]">
            <ShieldCheck className="h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" />
            <p>
              <strong>Pronto para aprender agora:</strong> as lições, a voz, os exercícios e os clipes pedagógicos já funcionam neste notebook. Uma GPU NVIDIA compatível pode ampliar, em uma etapa opcional futura, os recursos visuais locais.
            </p>
          </div>

          <ol className="space-y-3" aria-label="Passos de preparação">
            {LIP_SYNC_SETUP_STEPS.map((step, index) => (
              <li key={step.title} className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-700 text-xs font-bold text-white">{index + 1}</span>
                <div>
                  <h3 className="font-bold text-slate-950">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-700">{step.description}</p>
                  {index === 1 ? (
                    <code className="mt-2 block overflow-x-auto rounded-lg bg-slate-950 px-3 py-2 text-xs text-cyan-100">Get-CimInstance Win32_VideoController | Select-Object Name</code>
                  ) : null}
                  {index === 2 ? (
                    <a className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-cyan-800 underline underline-offset-2" href="https://ollama.com/download" target="_blank" rel="noreferrer">
                      Abrir o instalador oficial do Ollama <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>

          <section className="rounded-2xl border border-violet-200 bg-violet-50 p-4" aria-label="Capacidade de interação visual por GPU">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-violet-700" aria-hidden="true" />
              <div className="space-y-3 text-sm text-violet-950">
                <p><strong>O que uma GPU compatível poderá melhorar:</strong> {GPU_INTERACTION_NOTICE.withCuda}</p>
                <p><strong>Recursos disponíveis hoje:</strong> {GPU_INTERACTION_NOTICE.withoutCuda}</p>
                <p className="text-xs text-violet-800">{GPU_INTERACTION_NOTICE.availability}</p>
              </div>
            </div>
          </section>

          <div className="flex items-start gap-3 rounded-2xl border border-cyan-200 bg-cyan-50 p-4 text-sm text-cyan-950">
            <Volume2 className="mt-0.5 h-5 w-5 shrink-0 text-cyan-800" aria-hidden="true" />
            <p><strong>Próximo passo:</strong> aproveite a voz, o diálogo e os clipes pedagógicos disponíveis. Quando houver uma configuração facial compatível, ela será apresentada com validação técnica e visual antes de ser ativada.</p>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
            <Button variant="outline" className="border-slate-300" onClick={closeGuide}>Ler depois</Button>
            <Button className="bg-cyan-700 text-white hover:bg-cyan-800" onClick={closeGuide}>
              Entendi, iniciar o aplicativo <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
          <p className="flex items-center gap-1.5 text-xs text-slate-500"><CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> Nenhum arquivo pessoal é acessado por este guia.</p>
        </div>
      </div>
    </section>
  );
}
