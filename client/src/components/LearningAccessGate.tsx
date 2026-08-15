import { LockKeyhole } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { hasLearningAccess, requiresLearningEnrollment } from "@/lib/learningAccess";

export function LearningAccessGate({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { isAuthenticated, loading } = useAuth();
  const isLearningRoute = requiresLearningEnrollment(location);
  const acceptanceQuery = trpc.compliance.checkAcceptance.useQuery(undefined, {
    enabled: isAuthenticated && isLearningRoute,
    retry: false,
  });

  if (!isLearningRoute) return <>{children}</>;

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-center text-sm text-slate-300">
        Verificando acesso protegido…
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 px-5 py-10">
        <section className="w-full max-w-lg rounded-3xl border border-white/15 bg-white/10 p-7 text-center shadow-2xl backdrop-blur-sm">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-300 text-slate-950">
            <LockKeyhole className="h-7 w-7" aria-hidden="true" />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">Acesso protegido</p>
          <h1 className="mt-2 text-2xl font-bold text-white">Inscrição necessária para iniciar o curso</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-200">
            Cartilha, Pareto, cenas, exercícios e professor exigem uma conta. A apresentação do aplicativo continua aberta; as lições são liberadas somente após inscrição e configuração do perfil protegido.
          </p>
          <Button
            className="mt-6 w-full bg-cyan-300 font-bold text-slate-950 hover:bg-cyan-200"
            onClick={() => {
              sessionStorage.setItem("ml_protected_destination", location);
              window.location.href = getLoginUrl();
            }}
          >
            Criar conta ou entrar
          </Button>
          <p className="mt-4 text-xs leading-relaxed text-slate-300">
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

  if (hasLearningAccess({ isAuthenticated, acceptedProtectionTerms: acceptanceQuery.data?.accepted === true })) return <>{children}</>;

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
