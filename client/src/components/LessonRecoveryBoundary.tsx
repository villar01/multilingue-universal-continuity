import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { ArrowLeft, BookOpen, RefreshCw } from "lucide-react";

type Props = { children: ReactNode };
type State = { hasError: boolean; retryKey: number; autoRecoveryUsed: boolean; isRecovering: boolean };

/**
 * Contém uma falha de lição na própria rota. A falha não alcança a fronteira
 * global e o aluno mantém acesso ao painel e às outras lições.
 */
export class LessonRecoveryBoundary extends Component<Props, State> {
  state: State = { hasError: false, retryKey: 0, autoRecoveryUsed: false, isRecovering: false };
  private autoRecoveryTimer?: number;

  static getDerivedStateFromError(): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[LessonRecovery]", error.message, errorInfo.componentStack);

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

  private retryLesson = () => {
    this.setState((current) => ({ hasError: false, retryKey: current.retryKey + 1 }));
  };

  render() {
    if (this.state.hasError) {
      if (this.state.isRecovering) {
        return (
          <main className="min-h-screen bg-slate-950 px-5 py-12 text-white">
            <section className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center text-center">
              <RefreshCw className="mb-5 animate-spin text-cyan-200" size={34} aria-hidden="true" />
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-cyan-200">Restaurando a lição</p>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-300">Seu progresso permanece preservado enquanto esta lição é recuperada.</p>
            </section>
          </main>
        );
      }

      return (
        <main className="min-h-screen bg-slate-950 px-5 py-12 text-white">
          <section className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center text-center">
            <div className="mb-5 rounded-2xl border border-cyan-300/30 bg-cyan-400/10 p-4 text-cyan-100">
              <BookOpen aria-hidden="true" size={34} />
            </div>
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.16em] text-cyan-200">Lição temporariamente indisponível</p>
            <h1 className="mb-3 text-2xl font-black">O restante do seu estudo continua disponível.</h1>
            <p className="max-w-md text-sm leading-6 text-slate-300">Tente esta lição novamente ou continue outra atividade. Seu progresso permanece preservado.</p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <button type="button" onClick={this.retryLesson} className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-5 py-2.5 text-sm font-extrabold text-slate-950 transition hover:bg-cyan-300">
                <RefreshCw size={16} aria-hidden="true" /> Tentar esta lição
              </button>
              <button type="button" onClick={() => window.location.assign("/lessons-hub")} className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/10">
                <BookOpen size={16} aria-hidden="true" /> Outras lições
              </button>
              <button type="button" onClick={() => window.location.assign("/dashboard")} className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/10">
                <ArrowLeft size={16} aria-hidden="true" /> Voltar ao painel
              </button>
            </div>
          </section>
        </main>
      );
    }

    return <span key={this.state.retryKey}>{this.props.children}</span>;
  }
}
