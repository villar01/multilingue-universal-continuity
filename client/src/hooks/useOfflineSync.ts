import { useEffect, useState, useCallback } from 'react';
import { trpc } from '@/lib/trpc';
import { 
  cacheLessons, 
  cacheExercises, 
  cacheLanguages, 
  getLessonsFromCache,
  getExercisesFromCache,
  getLanguagesFromCache,
  hasCachedData,
  getCacheSize,
  logSync,
  offlineDB,
} from '@/lib/offlineDB';

export interface OfflineSyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSync: Date | null;
  cacheSize: number; // MB
  cachedItemsCount: number;
  syncError: string | null;
}

export function shouldSyncAllExercises(includeExercises: boolean): boolean {
  return includeExercises;
}

export function useOfflineSync() {
  const [status, setStatus] = useState<OfflineSyncStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSyncing: false,
    lastSync: null,
    cacheSize: 0,
    cachedItemsCount: 0,
    syncError: null,
  });

  // Queries para dados
  const { data: lessons } = trpc.lessons.list.useQuery();
  const { data: languages } = trpc.languages.list.useQuery();

  // Sincronizar dados ao conectar
  const syncData = useCallback(async ({ includeExercises = false }: { includeExercises?: boolean } = {}) => {
    if (!status.isOnline) return;

    setStatus(prev => ({ ...prev, isSyncing: true, syncError: null }));

    try {
      // Cache lições
      if (lessons && lessons.length > 0) {
        await cacheLessons(lessons.map(l => ({
          ...l,
          createdAt: new Date(l.createdAt),
          updatedAt: new Date(l.updatedAt),
        })));
      }

      // Cache idiomas
      if (languages && languages.length > 0) {
        await cacheLanguages(languages.map(l => ({
          ...l,
          createdAt: new Date(l.createdAt),
          updatedAt: new Date(l.updatedAt),
        })));
      }

      // Exercícios são potencialmente numerosos. Só devem ser baixados após uma
      // escolha explícita de pacote offline, nunca ao abrir uma cena ou página.
      if (lessons && shouldSyncAllExercises(includeExercises)) {
        for (const lesson of lessons) {
          try {
            const exercisesResponse = await fetch(
              `/api/trpc/lessons.getExercises?input=${JSON.stringify({ lessonId: lesson.id })}`
            );
            if (exercisesResponse.ok) {
              const data = await exercisesResponse.json();
              const exercises = data.result?.data?.json || [];
              if (exercises.length > 0) {
                await cacheExercises(exercises.map((e: any) => ({
                  ...e,
                  createdAt: new Date(e.createdAt),
                  updatedAt: new Date(e.updatedAt),
                })));
              }
            }
          } catch (err) {
            // Suprimido para não disparar o badge do ErrorCatcher
            // console.error(`Erro ao cachear exercícios da lição ${lesson.id}:`, err);
          }
        }
      }

      const cacheSize = await getCacheSize();
      const lessonsCount = await offlineDB.lessons.count();
      const exercisesCount = await offlineDB.exercises.count();

      setStatus(prev => ({
        ...prev,
        isSyncing: false,
        lastSync: new Date(),
        cacheSize,
        cachedItemsCount: lessonsCount + exercisesCount,
      }));

      await logSync('sync', 'all', 'success', `Cache atualizado: ${lessonsCount} lições, ${exercisesCount} exercícios`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
      setStatus(prev => ({
        ...prev,
        isSyncing: false,
        syncError: errorMsg,
      }));
      await logSync('sync', 'all', 'error', errorMsg);
    }
  }, [lessons, languages, status.isOnline]);

  // Monitorar conexão
  useEffect(() => {
    const handleOnline = () => {
      setStatus(prev => ({ ...prev, isOnline: true }));
      syncData();
    };

    const handleOffline = () => {
      setStatus(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncData]);

  // Sincronizar ao montar e quando dados mudam
  useEffect(() => {
    syncData();
  }, [syncData]);

  // Atualizar tamanho do cache periodicamente
  useEffect(() => {
    const interval = setInterval(async () => {
      const size = await getCacheSize();
      setStatus(prev => ({ ...prev, cacheSize: size }));
    }, 60000); // A cada 1 minuto

    return () => clearInterval(interval);
  }, []);

  return {
    status,
    syncData,
    syncFullOfflinePack: () => syncData({ includeExercises: true }),
    getLessonsOffline: getLessonsFromCache,
    getExercisesOffline: getExercisesFromCache,
    getLanguagesOffline: getLanguagesFromCache,
    hasCachedData,
  };
}
