/**
 * Local AI Notification Component
 * 
 * Informs the user/student that installing a free local AI (Qwen 2.5 or similar)
 * on their computer will:
 * - Provide maximum quality natural voice
 * - Enable extreme animation (lip-sync, head movements)
 * - Reduce app costs (no external API usage)
 * - Work offline after initial setup
 * 
 * The notification appears once on first visit and can be dismissed.
 * User can choose: install automatically (guided) or manually.
 */

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'local-ai-notification-dismissed';

export default function LocalAINotification() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(STORAGE_KEY);
      if (!dismissed) {
        // Show after 3 seconds
        const timer = setTimeout(() => setVisible(true), 3000);
        return () => clearTimeout(timer);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {}
    setVisible(false);
  };

  const handleInstall = () => {
    setExpanded(true);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-2 right-2 z-50 w-[calc(100vw-1rem)] max-w-md animate-in slide-in-from-bottom-5 duration-300 sm:bottom-4 sm:right-4 sm:w-auto">
      <div className="relative rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-3 shadow-lg dark:border-blue-800 dark:from-blue-950 dark:to-indigo-950 sm:p-5">
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Fechar aviso de IA Local"
          className="absolute right-2 top-2 rounded-full px-2 py-0.5 text-sm font-bold text-blue-700 transition hover:bg-blue-100 dark:text-blue-200 dark:hover:bg-blue-900"
        >
          ×
        </button>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <svg className="h-6 w-6 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-blue-900 dark:text-blue-100">
              Melhore sua experiência com IA Local
            </h3>
            <p className="mt-1 pr-6 text-xs text-blue-700 dark:text-blue-300">
              Instale uma IA gratuita no seu computador para ter:
            </p>
            <ul className="mt-2 hidden space-y-1 text-xs text-blue-600 dark:text-blue-400 sm:block">
              <li className="flex items-center gap-1.5">
                <span className="text-green-500">✓</span> Voz natural de altíssima qualidade
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-green-500">✓</span> Animação extrema (lábios e cabeça)
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-green-500">✓</span> Funcionamento offline
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-green-500">✓</span> Sem custos de uso (IA gratuita)
              </li>
            </ul>

            {!expanded ? (
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={handleInstall}
                  className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 active:scale-95"
                >
                  Saiba como instalar
                </button>
                <button
                  onClick={handleDismiss}
                  className="rounded-lg border border-blue-300 px-3 py-1.5 text-xs font-medium text-blue-600 transition hover:bg-blue-100 active:scale-95 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900"
                >
                  Agora não
                </button>
              </div>
            ) : (
              <div className="mt-3 space-y-2 rounded-lg bg-blue-100/50 p-3 dark:bg-blue-900/30">
                <p className="text-xs font-semibold text-blue-800 dark:text-blue-200">
                  Instalação completa passo a passo (Qwen 2.5):
                </p>
                <ol className="space-y-2 text-xs text-blue-700 dark:text-blue-300">
                  <li>
                    <strong>Passo 1:</strong> Clique no botão Iniciar do Windows, digite <code className="rounded bg-blue-200 px-1 dark:bg-blue-800">powershell</code>, clique com botão direito em "Windows PowerShell" e selecione <strong>"Executar como administrador"</strong>. Se aparecer tela azul perguntando permissão, clique em <strong>"Sim"</strong>.
                  </li>
                  <li>
                    <strong>Passo 2:</strong> Se o Ollama não estiver instalado, no PowerShell cole este comando e tecle Enter:{' '}
                    <code className="rounded bg-blue-200 px-1 dark:bg-blue-800">irm https://ollama.com/install.ps1 | iex</code>
                    <br />Ou baixe em{' '}
                    <a href="https://ollama.com/download" target="_blank" rel="noopener noreferrer" className="underline font-semibold">
                      ollama.com/download
                    </a>{' '}e clique em "Download for Windows".
                  </li>
                  <li>
                    <strong>Passo 3:</strong> No PowerShell (como administrador), digite exatamente:{' '}
                    <code className="rounded bg-blue-200 px-1 dark:bg-blue-800">ollama run qwen2.5</code>
                    <br />Tecle <strong>Enter</strong>. Ele vai baixar uns 4GB. Aguarde terminar.
                  </li>
                  <li>
                    <strong>Passo 4:</strong> Quando aparecer <code className="rounded bg-blue-200 px-1 dark:bg-blue-800">&gt;&gt;&gt;</code> significa que está pronto. Digite <code className="rounded bg-blue-200 px-1 dark:bg-blue-800">/bye</code> e tecle Enter para sair. A IA fica instalada permanentemente.
                  </li>
                  <li>
                    <strong>Passo 5:</strong> O app MultiLingue Universal detecta automaticamente o Ollama na porta 11434 e usa o Qwen 2.5 para voz natural e animação de qualidade, sem custos, funcionando offline.
                  </li>
                </ol>
                <div className="mt-2 rounded-lg bg-amber-100/50 p-2 dark:bg-amber-900/20">
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                    Alternativas gratuitas (se Qwen 2.5 se tornar pago):
                  </p>
                  <ul className="mt-1 space-y-1 text-xs text-amber-600 dark:text-amber-400">
                    <li>• <strong>Llama 3.2</strong> (Meta) — gratuito e permanente: <code className="rounded bg-amber-200 px-1 dark:bg-amber-800">ollama run llama3.2</code></li>
                    <li>• <strong>Phi-3 Mini</strong> (Microsoft) — leve e gratuito: <code className="rounded bg-amber-200 px-1 dark:bg-amber-800">ollama run phi3</code></li>
                    <li>• <strong>Gemma 2</strong> (Google) — gratuito e permanente: <code className="rounded bg-amber-200 px-1 dark:bg-amber-800">ollama run gemma2</code></li>
                  </ul>
                  <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                    Todas essas IAs são gratuitas, permanentes e funcionam offline. O app detecta qualquer uma automaticamente.
                  </p>
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  A IA local melhora voz, animação e reduz custos do app.
                  Você pode usar o app sem ela, mas com a IA instalada a qualidade é máxima.
                </p>
                <button
                  onClick={handleDismiss}
                  className="mt-2 w-full rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 active:scale-95"
                >
                  Entendi, fechar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
