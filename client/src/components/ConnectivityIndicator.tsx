/**
 * ConnectivityIndicator — Shows online/offline status banner
 * Displays a dismissible banner when connection is lost or restored
 */
import { useState, useEffect } from "react";
import { Wifi, WifiOff, X } from "lucide-react";

export default function ConnectivityIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBanner, setShowBanner] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        setShowBanner(true);
        setTimeout(() => setShowBanner(false), 5000);
      }
      setWasOffline(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      setShowBanner(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [wasOffline]);

  if (!showBanner && isOnline) return null;

  return (
    <>
      {/* Offline banner - persistent */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-[9999] bg-red-600 text-white px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium shadow-lg">
          <WifiOff className="h-4 w-4" />
          <span>Sem conexão com a internet — Modo offline ativo</span>
        </div>
      )}

      {/* Restored banner - temporary */}
      {isOnline && showBanner && (
        <div className="fixed top-0 left-0 right-0 z-[9999] bg-green-600 text-white px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium shadow-lg animate-in slide-in-from-top duration-300">
          <Wifi className="h-4 w-4" />
          <span>Conexão restaurada!</span>
          <button
            onClick={() => setShowBanner(false)}
            className="ml-2 hover:bg-green-700 rounded p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
    </>
  );
}
