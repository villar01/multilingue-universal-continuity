import { useEffect, useState, ReactNode } from 'react';
// Hook useAuth será substituído por trpc
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface ContentProtectionProps {
  children: ReactNode;
  showWatermark?: boolean;
}

/**
 * Componente de Proteção Anti-Cópia
 * - Bloqueia botão direito do mouse
 * - Bloqueia atalhos de teclado (Ctrl+C, Ctrl+S, Ctrl+P, F12)
 * - Adiciona CSS user-select: none
 * - Exibe marca d'água com identificador interno mínimo (opcional)
 * - Mostra mensagem de marketing para upgrade
 */
export default function ContentProtection({ 
  children, 
  showWatermark = true 
}: ContentProtectionProps) {
  const { data: user } = trpc.auth.me.useQuery();
  
  // Verificar se usuário é FREE (sem assinatura ativa) - admin users have full access
  const isFreeUser = !user || user.role === 'user';
  
  // Estado para controlar se popup foi dispensado
  const [isPopupDismissed, setIsPopupDismissed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('contentPopupDismissed') === 'true';
  });
  
  // Função para dispensar popup permanentemente
  const dismissPopup = () => {
    setIsPopupDismissed(true);
    localStorage.setItem('contentPopupDismissed', 'true');
  };

  useEffect(() => {
    if (!isFreeUser) return; // Não aplicar proteção para usuários pagos

    // Bloquear botão direito do mouse
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      toast.info('🔒 Conteúdo protegido. Faça upgrade para desbloquear downloads!', {
        duration: 3000,
      });
    };

    // Bloquear atalhos de teclado
    const handleKeyDown = (e: KeyboardEvent) => {
      // Bloquear Ctrl+C (copiar)
      if (e.ctrlKey && e.key === 'c') {
        e.preventDefault();
        toast.info('🔒 Cópia bloqueada no período de demonstração', {
          duration: 2000,
        });
      }

      // Bloquear Ctrl+S (salvar)
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        toast.info('🔒 Download bloqueado. Faça upgrade para salvar conteúdo!', {
          duration: 3000,
        });
      }

      // Bloquear Ctrl+P (imprimir)
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        toast.info('🔒 Impressão bloqueada no período de demonstração', {
          duration: 2000,
        });
      }

      // Bloquear F12 (DevTools)
      if (e.key === 'F12') {
        e.preventDefault();
        toast.warning('⚠️ DevTools bloqueado durante demonstração', {
          duration: 2000,
        });
      }

      // Bloquear Ctrl+Shift+I (DevTools alternativo)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
      }

      // Bloquear Ctrl+U (view source)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
      }
    };

    // Bloquear seleção de texto via CSS
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';

    // Adicionar event listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFreeUser]);

  return (
    <div className="relative">
      {/* Watermark visível para usuários FREE */}
      {isFreeUser && showWatermark && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50 opacity-10 select-none">
          <div className="text-gray-900 text-6xl font-bold rotate-[-45deg] whitespace-nowrap">
            ACESSO PROTEGIDO {user?.id ? `• CONTA #${user.id}` : ''}
          </div>
        </div>
      )}

      {/* Banner de marketing para upgrade */}
      {isFreeUser && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 text-center mb-4 rounded-lg shadow-lg">
          <p className="text-sm font-medium">
            🔒 <strong>Período de Demonstração</strong> - Conteúdo protegido contra cópia
          </p>
          <p className="text-xs mt-1 opacity-90">
            Faça upgrade para <strong>Premium</strong> ou <strong>VIP</strong> e desbloqueie downloads parciais das lições!
          </p>
        </div>
      )}

      {/* Conteúdo protegido */}
      <div className={isFreeUser ? 'select-none' : ''}>
        {children}
      </div>

      {/* Tooltip flutuante */}
      {isFreeUser && !isPopupDismissed && (
        <div className="fixed bottom-4 right-4 bg-white border-2 border-blue-500 rounded-lg shadow-xl p-4 max-w-xs z-50 animate-bounce">
          <button 
            onClick={dismissPopup}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Não mostrar novamente"
          >
            ✕
          </button>
          <div className="flex items-start gap-3">
            <div className="text-3xl">🔓</div>
            <div>
              <p className="font-bold text-gray-900 text-sm">Desbloqueie Conteúdo</p>
              <p className="text-xs text-gray-600 mt-1">
                Após a compra, você poderá copiar textos e baixar materiais das lições!
              </p>
              <div className="flex gap-2 mt-2">
                <a href="/pricing-comparison" className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors inline-block">
                  Ver Planos
                </a>
                <button 
                  onClick={dismissPopup}
                  className="text-gray-500 text-xs px-2 py-1.5 hover:text-gray-700 transition-colors"
                >
                  Não mostrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
