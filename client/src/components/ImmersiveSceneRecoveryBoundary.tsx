import { Component, type ErrorInfo, type ReactNode } from "react";
import { ArrowLeft, RefreshCw, Route } from "lucide-react";

type Props = { children: ReactNode };
type State = { hasError: boolean; retryKey: number; autoRecoveryUsed: boolean; isRecovering: boolean };

/**
 * Contém uma falha da Cena Imersiva sem permitir que ela alcance a fronteira
 * global do aplicativo. O aluno mantém saídas claras e nenhum dado é alterado.
 */
export class ImmersiveSceneRecoveryBoundary extends Component<Props, State> {
  state: State = { hasError: false, retryKey: 0, autoRecoveryUsed: false, isRecovering: false };
  private autoRecoveryTimer?: number;

  static getDerivedStateFromError(): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ImmersiveSceneRecovery]", error.message, errorInfo.componentStack);

    if (!this.state.autoRecoveryUsed) {
      this.setState({ isRecovering: true });
      this.autoRecoveryTimer = window.setTimeout(() => {
        this.setState((current) => ({
          hasError: false,
          retryKey: current.retryKey + 1,
          autoRecoveryUsed: true,
          isRecovering: false,
        }));
      }, 250);
    }
  }

  componentWillUnmount() {
    if (this.autoRecoveryTimer) {
      window.clearTimeout(this.autoRecoveryTimer);
    }
  }

  private retryScene = () => {
    this.setState((current) => ({ hasError: false, retryKey: current.retryKey + 1 }));
  };

  private leaveToDashboard = () => {
    window.location.assign("/dashboard");
  };

  private leaveToLessons = () => {
    window.location.assign("/lessons-hub");
  };

  render() {
    if (this.state.hasError) {
      if (this.state.isRecovering) {
        return (
          <main className="min-h-screen bg-slate-950 px-5 py-12 text-white">
            <section className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center text-center">
              <RefreshCw className="mb-5 animate-spin text-cyan-200" size={34} aria-hidden="true" />
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-cyan-200">Restaurando a cena</p>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-300">Seu percurso permanece preservado enquanto esta atividade é recuperada.</p>
            </section>
          </main>
        );
      }

      return (
        <main className="min-h-screen bg-slate-950 px-5 py-12 text-white">
          <section className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center text-center">
            <div className="mb-5 rounded-2xl border border-cyan-300/30 bg-cyan-400/10 p-4 text-cyan-100">
              <Route aria-hidden="true" size={34} />
            </div>
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.16em] text-cyan-200">Cena temporariamente indisponível</p>
            <h1 className="mb-3 text-2xl font-black">O restante do seu estudo continua disponível.</h1>
            <p className="max-w-md text-sm leading-6 text-slate-300">
              Tente abrir esta cena novamente ou retorne ao seu percurso. Seu progresso e suas outras atividades permanecem preservados.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <button type="button" onClick={this.retryScene} className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-5 py-2.5 text-sm font-extrabold text-slate-950 transition hover:bg-cyan-300">
                <RefreshCw size={16} aria-hidden="true" /> Tentar esta cena
              </button>
              <button type="button" onClick={this.leaveToLessons} className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/10">
                <Route size={16} aria-hidden="true" /> Continuar nas lições
              </button>
              <button type="button" onClick={this.leaveToDashboard} className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/10">
                <ArrowLeft size={16} aria-hidden="true" /> Voltar ao painel
              </button>
            </div>
          </section>
        </main>
      );
    }

    return <>{this.props.children}</>;
  }
}
