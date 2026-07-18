/**
 * useDevicePerformance.ts
 * Hook React para acessar o perfil de performance do dispositivo.
 * Detecta na montagem e permite ao usuário ajustar manualmente.
 */

import { useState, useEffect, useCallback } from "react";
import {
  detectDevicePerformance,
  overridePerformanceTier,
  type DeviceProfile,
  type PerformanceTier,
} from "@/lib/device-performance";

export function useDevicePerformance() {
  const [profile, setProfile] = useState<DeviceProfile | null>(null);
  const [isDetecting, setIsDetecting] = useState(true);

  useEffect(() => {
    // Detecção assíncrona para não bloquear o render inicial
    const timer = setTimeout(() => {
      const detected = detectDevicePerformance();
      setProfile(detected);
      setIsDetecting(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const overrideTier = useCallback((tier: PerformanceTier) => {
    overridePerformanceTier(tier);
    const updated = detectDevicePerformance(true);
    setProfile(updated);
  }, []);

  return { profile, isDetecting, overrideTier };
}
