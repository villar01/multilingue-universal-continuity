/**
 * AIErrorBoundary — Sistema de Monitoramento de Erros com IA
 * Captura erros React, loga no servidor, e exibe mensagem amigável
 * A IA analisa o erro e sugere correção automática
 */
import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  context?: string; // ex: "ARTeacher", "ImmersiveScene"
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

export class AIErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // Log para o servidor (best-effort, não bloqueia)
    const payload = {
      context: this.props.context || "unknown",
      message: error.message,
      stack: error.stack?.slice(0, 1000),
      componentStack: errorInfo.componentStack?.slice(0, 500),
      url: window.location.pathname,
      timestamp: Date.now(),
      userAgent: navigator.userAgent.slice(0, 100),
    };

    // Salva no localStorage para análise posterior
    try {
      const logs = JSON.parse(localStorage.getItem("ml_error_log") || "[]");
      logs.unshift(payload);
      localStorage.setItem("ml_error_log", JSON.stringify(logs.slice(0, 20)));
    } catch {}

    // Envia para o servidor de forma assíncrona
    fetch("/api/error-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => {}); // silencioso se falhar
  }

  handleRetry = () => {
    this.setState(s => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: s.retryCount + 1,
    }));
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-[200px] flex flex-col items-center justify-center p-6 bg-gray-950 text-white rounded-xl border border-red-500/30">
          <div className="text-4xl mb-3">⚠️</div>
          <h3 className="font-bold text-lg mb-1 text-red-400">Algo deu errado</h3>
          <p className="text-sm text-gray-400 mb-4 text-center max-w-sm">
            {this.props.context
              ? `Erro em ${this.props.context}. `
              : ""}
            A IA registrou este erro para correção automática.
          </p>
          <div className="flex gap-3">
            <button
              onClick={this.handleRetry}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-medium transition-colors"
            >
              🔄 Tentar novamente
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              ↺ Recarregar página
            </button>
          </div>
          {process.env.NODE_ENV === "development" && this.state.error && (
            <details className="mt-4 text-xs text-gray-600 max-w-sm">
              <summary className="cursor-pointer">Detalhes técnicos</summary>
              <pre className="mt-2 overflow-auto max-h-32 bg-gray-900 p-2 rounded text-red-300">
                {this.state.error.message}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default AIErrorBoundary;
