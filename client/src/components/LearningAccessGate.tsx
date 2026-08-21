import { LockKeyhole } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { createTrialLessonKey, hasLearningAccess, requiresLearningEnrollment } from "@/lib/learningAccess";

export function LearningAccessGate({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { isAuthenticated, loading } = useAuth();
  const isLearningRoute = requiresLearningEnrollment(location);
  const acceptanceQuery = trpc.compliance.checkAcceptance.useQuery(undefined, {
    enabled: isAuthenticated && isLearningRoute,
    retry: false,
  });
  const [trialState, setTrialState] = useState<"idle" | "checking" | "allowed" | "blocked" | "revoked" | "error">("idle");
  const [authWaitExceeded, setAuthWaitExceeded] = useState(false);
  const trialAccess = trpc.trialAccess.authorizeLesson.useMutation();

  const canCheckTrial = hasLearningAccess({ isAuthenticated, acceptedProtectionTerms: acceptanceQuery.data?.accepted === true });

  useEffect(() => {
    if (!isLearningRoute || !canCheckTrial) return;
    let active = true;
    setTrialState("checking");
    trialAccess.mutate({ lessonKey: createTrialLessonKey(location) }, {
      onSuccess: (result) => {
        if (active) setTrialState(result.allowed ? "allowed" : ("revoked" in result && result.revoked ? "revoked" : "blocked"));
      },
      onError: () => {
        if (active) setTrialState("error");
      },
    });
    return () => { active = false; };
  }, [canCheckTrial, isLearningRoute, location]);

  useEffect(() => {
    if (!isLearningRoute || !loading) {
      setAuthWaitExceeded(false);
      return;
    }
    const timeout = window.setTimeout(() => setAuthWaitExceeded(true), 2500);
    return () => window.clearTimeout(timeout);
  }, [isLearningRoute, loading]);

  if (!isLearningRoute) return <>{children}</>;

  if (loading && !authWaitExceeded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f6ef] px-6 text-center text-sm text-slate-700">
        Preparando sua entrada segura…
      </main>
    );
  }

  if (!isAuthenticated || authWaitExceeded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f6ef] px-5 py-10">
        <section className="w-full max-w-lg border border-stone-200 bg-white p-7 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
            <LockKeyhole className="h-7 w-7" aria-hidden="true" />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-800">Entrada protegida</p>
          <h1 className="mt-2 font-serif text-2xl font-bold text-slate-950">Inscrição necessária para iniciar o curso</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">
            Cartilha, Pareto, cenas, exercícios e professor exigem uma conta. A apresentação do aplicativo continua aberta; as lições são liberadas somente após inscrição e configuração do perfil protegido.
          </p>
          <Button
            className="mt-6 w-full bg-slate-900 font-bold text-white hover:bg-slate-800"
            onClick={() => {
              sessionStorage.setItem("ml_protected_destination", location);
              window.location.href = getLoginUrl();
            }}
          >
            Criar conta ou entrar
          </Button>
          <p className="mt-4 text-xs leading-relaxed text-slate-600">
            O acesso pedagógico seguirá os termos aceitos, a faixa etária e os controles de proteção aplicáveis.
          </p>
        </section>
      </main>
    );
  }

  if (acceptanceQuery.isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-center text-sm text-slate-300">
        Verificando a proteção da conta…
      </main>
    );
  }

  if (canCheckTrial && trialState === "allowed") return <>{children}</>;

  if (canCheckTrial && trialState === "checking") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-center text-sm text-slate-300">
        Verificando sua lição de teste protegida…
      </main>
    );
  }

  if (canCheckTrial && trialState === "blocked") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 px-5 py-10">
        <section className="w-full max-w-lg rounded-3xl border border-amber-300/30 bg-white/10 p-7 text-center shadow-2xl backdrop-blur-sm">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-300 text-slate-950"><LockKeyhole className="h-7 w-7" aria-hidden="true" /></div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-200">Período gratuito concluído</p>
          <h1 className="mt-2 text-2xl font-bold text-white">As 10 lições iniciais foram utilizadas</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-200">Para proteger o conteúdo e continuar o aprendizado, novas lições ficam bloqueadas após o período de teste.</p>
          <Button className="mt-6 w-full bg-amber-300 font-bold text-slate-950 hover:bg-amber-200" onClick={() => window.location.assign("/pricing")}>Ver opções de continuidade</Button>
        </section>
      </main>
    );
  }

  if (canCheckTrial && trialState === "revoked") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 px-5 py-10">
        <section className="w-full max-w-lg rounded-3xl border border-cyan-300/30 bg-white/10 p-7 text-center shadow-2xl backdrop-blur-sm">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-300 text-slate-950"><LockKeyhole className="h-7 w-7" aria-hidden="true" /></div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">Acesso de avaliação encerrado</p>
          <h1 className="mt-2 text-2xl font-bold text-white">Esta conta não libera novas lições de avaliação</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-200">O encerramento protege o conteúdo desta conta. Você pode retornar ao painel a qualquer momento.</p>
          <Button className="mt-6 w-full bg-cyan-300 font-bold text-slate-950 hover:bg-cyan-200" onClick={() => window.location.assign("/dashboard")}>Voltar ao painel</Button>
        </section>
      </main>
    );
  }

  if (canCheckTrial && trialState === "error") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-center text-sm text-slate-300">
        Não foi possível autorizar esta lição protegida. Tente novamente.
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 px-5 py-10">
      <section className="w-full max-w-lg rounded-3xl border border-white/15 bg-white/10 p-7 text-center shadow-2xl backdrop-blur-sm">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-300 text-slate-950">
          <LockKeyhole className="h-7 w-7" aria-hidden="true" />
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">Proteção obrigatória</p>
        <h1 className="mt-2 text-2xl font-bold text-white">Conclua o aceite antes de iniciar as lições</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-200">
          Sua conta foi identificada, mas ainda precisa concluir a verificação de idade, os termos e os controles de proteção aplicáveis antes de acessar cartilha, Pareto, cenas, exercícios e professor.
        </p>
        <Button
          className="mt-6 w-full bg-cyan-300 font-bold text-slate-950 hover:bg-cyan-200"
          onClick={() => {
            sessionStorage.setItem("ml_protected_destination", location);
            window.location.assign("/terms");
          }}
        >
          Concluir proteção da conta
        </Button>
        <p className="mt-4 text-xs leading-relaxed text-slate-300">
          O acesso pedagógico seguirá os termos aceitos, a faixa etária e os controles de proteção aplicáveis.
        </p>
      </section>
    </main>
  );
}
