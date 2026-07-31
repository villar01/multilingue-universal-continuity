import { useState, useEffect, useCallback } from 'react';

export interface ConnectionQuality {
  speed: number; // MB/s
  latency: number; // ms
  quality: 'excellent' | 'good' | 'fair' | 'poor' | 'offline';
  downloadTimeEstimate: number; // segundos para 100MB
  lastMeasured: Date | null;
}

export function getConnectionHealthUrl(timestamp: number): string {
  const healthInput = encodeURIComponent(
    JSON.stringify({ json: { timestamp } })
  );
  return `/api/trpc/system.health?input=${healthInput}`;
}

export function useConnectionQuality() {
  const [quality, setQuality] = useState<ConnectionQuality>({
    speed: 0,
    latency: 0,
    quality: 'offline',
    downloadTimeEstimate: 0,
    lastMeasured: null,
  });

  // Medir velocidade de conexão
  const measureSpeed = useCallback(async () => {
    try {
      const testSize = 1024 * 1024; // 1MB
      const testUrl = `data:text/plain;base64,${btoa('x'.repeat(testSize))}`;

      const startTime = performance.now();
      const response = await fetch(testUrl);
      const endTime = performance.now();

      const duration = (endTime - startTime) / 1000; // segundos
      const speed = testSize / (1024 * 1024) / duration; // MB/s

      // Medir latência
      const latencyStart = performance.now();
      await fetch(getConnectionHealthUrl(Date.now())).catch(() => {});
      const latencyEnd = performance.now();
      const latency = latencyEnd - latencyStart;

      // Classificar qualidade
      let qualityLevel: 'excellent' | 'good' | 'fair' | 'poor';
      if (speed > 5) qualityLevel = 'excellent';
      else if (speed > 2) qualityLevel = 'good';
      else if (speed > 0.5) qualityLevel = 'fair';
      else qualityLevel = 'poor';

      // Estimar tempo para 100MB
      const downloadTimeEstimate = speed > 0 ? 100 / speed : 1000;

      setQuality({
        speed: Math.round(speed * 100) / 100,
        latency: Math.round(latency),
        quality: qualityLevel,
        downloadTimeEstimate: Math.round(downloadTimeEstimate),
        lastMeasured: new Date(),
      });
    } catch (error) {
      console.error('Erro ao medir qualidade de conexão:', error);
      setQuality(prev => ({
        ...prev,
        quality: 'offline',
      }));
    }
  }, []);

  // Medir qualidade ao conectar
  useEffect(() => {
    const handleOnline = () => {
      measureSpeed();
    };

    window.addEventListener('online', handleOnline);
    
    // Medir na primeira vez
    if (navigator.onLine) {
      measureSpeed();
    }

    // Medir periodicamente a cada 30 segundos
    const interval = setInterval(() => {
      if (navigator.onLine) {
        measureSpeed();
      }
    }, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      clearInterval(interval);
    };
  }, [measureSpeed]);

  return quality;
}

// Converter velocidade em MB/s para descrição legível
export function getSpeedDescription(speed: number): string {
  if (speed > 5) return 'Excelente (>5 MB/s)';
  if (speed > 2) return 'Boa (2-5 MB/s)';
  if (speed > 0.5) return 'Razoável (0.5-2 MB/s)';
  if (speed > 0) return 'Lenta (<0.5 MB/s)';
  return 'Offline';
}

// Converter tempo em segundos para formato legível
export function formatDownloadTime(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  return `${Math.round(seconds / 3600)}h`;
}
