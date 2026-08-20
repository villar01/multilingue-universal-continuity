import { Component, type ErrorInfo, type ReactNode } from "react";
import { ArrowLeft, RefreshCw, ShieldCheck } from "lucide-react";

type Props = {
  children: ReactNode;
  activityLabel: string;
};

type State = {
  hasError: boolean;
  retryKey: number;
  autoRecoveryUsed: boolean;
  isRecovering: boolean;
};

/** Mantém falhas de atividades interativas isoladas da fronteira global. */
export class ActivityRecoveryBoundary extends Component<Props, State> {
  state: State = { hasError: false, retryKey: 0, autoRecoveryUsed: false, isRecovering: false };
  private autoRecoveryTimer?: number;

  static getDerivedStateFromError(): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ActivityRecovery]", this.props.activityLabel, error.message, errorInfo.componentStack);
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
    if (this.autoRecoveryTimer) window.clearTimeout(this.autoRecoveryTimer);
  }

  private retryActivity = () => {
    this.setState((current) => ({ hasError: false, retryKey: current.retryKey + 1 }));
  };

  render() {
    if (this.state.hasError) {
      if (this.state.isRecovering) {
        return <main className="min-h-screen bg-slate-950 px-5 py-12 text-white"><section className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center text-center"><RefreshCw className="mb-5 animate-spin text-cyan-200" size={34} aria-hidden="true" /><p className="text-sm font-bold uppercase tracking-[0.16em] text-cyan-200">Restaurando a atividade</p><p className="mt-2 max-w-md text-sm leading-6 text-slate-300">Seu progresso permanece preservado durante a recuperação.</p></section></main>;
      }

      return <main className="min-h-screen bg-slate-950 px-5 py-12 text-white"><section className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center text-center"><div className="mb-5 rounded-2xl border border-cyan-300/30 bg-cyan-400/10 p-4 text-cyan-100"><ShieldCheck aria-hidden="true" size={34} /></div><p className="mb-2 text-sm font-bold uppercase tracking-[0.16em] text-cyan-200">Atividade temporariamente indisponível</p><h1 className="mb-3 text-2xl font-black">O restante do aplicativo continua disponível.</h1><p className="max-w-md text-sm leading-6 text-slate-300">Tente {this.props.activityLabel.toLowerCase()} novamente ou retorne ao painel. Seu progresso permanece preservado.</p><div className="mt-7 flex flex-wrap justify-center gap-3"><button type="button" onClick={this.retryActivity} className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-5 py-2.5 text-sm font-extrabold text-slate-950 transition hover:bg-cyan-300"><RefreshCw size={16} aria-hidden="true" /> Tentar novamente</button><button type="button" onClick={() => window.location.assign("/dashboard")} className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/10"><ArrowLeft size={16} aria-hidden="true" /> Voltar ao painel</button></div></section></main>;
    }

    return <span key={this.state.retryKey}>{this.props.children}</span>;
  }
}
