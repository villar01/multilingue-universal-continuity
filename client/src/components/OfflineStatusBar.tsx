import { useOfflineSync } from '@/hooks/useOfflineSync';
import { useConnectionQuality, getSpeedDescription, formatDownloadTime } from '@/hooks/useConnectionQuality';
import { Wifi, WifiOff, Download, CheckCircle, AlertCircle, Zap, Signal } from 'lucide-react';
import { useEffect, useState } from 'react';

export function OfflineStatusBar() {
  const { status, syncData } = useOfflineSync();
  const connectionQuality = useConnectionQuality();
  const [showDetails, setShowDetails] = useState(false);

  if (status.isOnline && !showDetails) {
    return null; // Não mostrar quando online
  }

  return (
    <div className={`fixed bottom-4 right-4 max-w-sm rounded-lg shadow-lg border-2 p-4 z-40 ${
      status.isOnline 
        ? 'bg-green-50 border-green-200' 
        : 'bg-yellow-50 border-yellow-200'
    }`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 pt-0.5">
          {status.isOnline ? (
            <Wifi className="h-5 w-5 text-green-600" />
          ) : (
            <WifiOff className="h-5 w-5 text-yellow-600" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-sm ${
            status.isOnline ? 'text-green-900' : 'text-yellow-900'
          }`}>
            {status.isOnline ? 'Conectado' : 'Modo Offline'}
          </h3>

          {status.isSyncing && (
            <div className="flex items-center gap-1 mt-1 text-xs text-gray-600">
              <Download className="h-3 w-3 animate-spin" />
              Sincronizando dados...
            </div>
          )}

          {status.syncError && (
            <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
              <AlertCircle className="h-3 w-3" />
              {status.syncError}
            </div>
          )}

          {status.lastSync && !status.isSyncing && (
            <div className="flex items-center gap-1 mt-1 text-xs text-gray-600">
              <CheckCircle className="h-3 w-3 text-green-600" />
              Última sincronização: {status.lastSync.toLocaleTimeString('pt-BR')}
            </div>
          )}

          {showDetails && (
            <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-600 space-y-1">
              <div>📦 Cache: {status.cacheSize.toFixed(1)} MB</div>
              <div>📚 Itens: {status.cachedItemsCount}</div>
              {status.isOnline && (
                <>
                  <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-200">
                    <Signal className="h-3 w-3" />
                    <span>Velocidade: {getSpeedDescription(connectionQuality.speed)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    <span>Latência: {connectionQuality.latency}ms</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Download className="h-3 w-3" />
                    <span>Download 100MB: {formatDownloadTime(connectionQuality.downloadTimeEstimate)}</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2 flex-shrink-0">
          {status.isOnline && !status.isSyncing && (
            <button
              onClick={() => syncData()}
              className="px-2 py-1 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Sincronizar
            </button>
          )}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="px-2 py-1 text-xs font-medium bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          >
            {showDetails ? 'Ocultar' : 'Detalhes'}
          </button>
        </div>
      </div>
    </div>
  );
}
