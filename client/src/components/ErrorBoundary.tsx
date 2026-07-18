import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCcw, RefreshCw } from "lucide-react";
import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  context?: string;
}
interface State {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const context = this.props.context || window.location.pathname;
    const payload = {
      context,
      message: error.message,
      stack: error.stack?.slice(0, 800),
      componentStack: errorInfo.componentStack?.slice(0, 400),
      url: window.location.pathname,
      timestamp: Date.now(),
    };
    try {
      const logs: unknown[] = JSON.parse(localStorage.getItem("ml_error_log") || "[]");
      logs.unshift(payload);
      localStorage.setItem("ml_error_log", JSON.stringify(logs.slice(0, 20)));
    } catch {}
    fetch("/api/error-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => {});
  }

  handleRetry = () => {
    this.setState(s => ({ hasError: false, error: null, retryCount: s.retryCount + 1 }));
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-8 bg-background">
          <div className="flex flex-col items-center w-full max-w-2xl p-8 text-center">
            <AlertTriangle size={48} className="text-destructive mb-4 flex-shrink-0" />
            <h2 className="text-xl font-bold mb-2">Algo deu errado</h2>
            <p className="text-sm text-muted-foreground mb-6">
              A IA registrou este erro automaticamente para análise e correção.
              {this.state.retryCount > 0 && (
                <span className="block mt-1 text-yellow-500">
                  Tentativa {this.state.retryCount} — se persistir, recarregue a página.
                </span>
              )}
            </p>
            <div className="flex gap-3">
              <button
                onClick={this.handleRetry}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg",
                  "bg-purple-600 text-white hover:bg-purple-500 transition-colors cursor-pointer"
                )}
              >
                <RefreshCw size={16} />
                Tentar novamente
              </button>
              <button
                onClick={() => window.location.reload()}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg",
                  "bg-muted text-foreground hover:opacity-90 cursor-pointer"
                )}
              >
                <RotateCcw size={16} />
                Recarregar
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
export default ErrorBoundary;

/**
 * SilentErrorBoundary — envolve componentes individuais.
 * Se falhar, renderiza null sem mostrar nada ao usuário.
 */
export class SilentErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }
  componentDidCatch(error: Error) {
    console.warn('[SilentErrorBoundary] Componente falhou silenciosamente:', error.message);
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}
