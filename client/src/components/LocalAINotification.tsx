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
    <div className="fixed bottom-4 right-4 z-50 max-w-md animate-in slide-in-from-bottom-5 duration-300">
      <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-5 shadow-lg dark:border-blue-800 dark:from-blue-950 dark:to-indigo-950">
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
            <p className="mt-1 text-xs text-blue-700 dark:text-blue-300">
              Instale uma IA gratuita no seu computador para ter:
            </p>
            <ul className="mt-2 space-y-1 text-xs text-blue-600 dark:text-blue-400">
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
              <div className="mt-3 flex gap-2">
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
                  Como instalar a IA local (Qwen 2.5):
                </p>
                <ol className="space-y-1.5 text-xs text-blue-700 dark:text-blue-300">
                  <li>
                    <strong>1.</strong> Baixe o Ollama em{' '}
                    <a href="https://ollama.ai/download" target="_blank" rel="noopener noreferrer" className="underline font-semibold">
                      ollama.ai/download
                    </a>
                  </li>
                  <li>
                    <strong>2.</strong> Instale no seu computador (Windows, Mac ou Linux)
                  </li>
                  <li>
                    <strong>3.</strong> Abra o terminal e execute: <code className="rounded bg-blue-200 px-1 dark:bg-blue-800">ollama run qwen2.5:3b</code>
                  </li>
                  <li>
                    <strong>4.</strong> A IA será detectada automaticamente pelo app
                  </li>
                </ol>
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
