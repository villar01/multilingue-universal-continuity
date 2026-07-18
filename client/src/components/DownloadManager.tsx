import { useState, useEffect } from 'react';
import { Download, X, CheckCircle, AlertCircle, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { cacheLessons, cacheExercises, getCacheSize } from '@/lib/offlineDB';
import { trpc } from '@/lib/trpc';

interface DownloadState {
  isDownloading: boolean;
  isPaused: boolean;
  progress: number;
  currentItem: string;
  totalItems: number;
  downloadedItems: number;
  estimatedTime: number; // segundos
  downloadedSize: number; // MB
  totalSize: number; // MB
  error: string | null;
}

export function DownloadManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<'basico' | 'intermediario' | 'avancado' | 'negocios_tecnologia'>('basico');
  const [state, setState] = useState<DownloadState>({
    isDownloading: false,
    isPaused: false,
    progress: 0,
    currentItem: '',
    totalItems: 0,
    downloadedItems: 0,
    estimatedTime: 0,
    downloadedSize: 0,
    totalSize: 0,
    error: null,
  });

  const { data: lessons } = trpc.lessons.listByLevel.useQuery({ courseLevel: selectedLevel });

  const startDownload = async () => {
    if (!lessons || lessons.length === 0) {
      toast.error('Nenhuma lição encontrada para este nível');
      return;
    }

    setState(prev => ({
      ...prev,
      isDownloading: true,
      isPaused: false,
      progress: 0,
      downloadedItems: 0,
      totalItems: lessons.length,
      error: null,
    }));

    try {
      let downloadedSize = 0;
      const startTime = Date.now();

      for (let i = 0; i < lessons.length; i++) {
        if (state.isPaused) {
          setState(prev => ({ ...prev, isPaused: true }));
          return;
        }

        const lesson = lessons[i];
        setState(prev => ({
          ...prev,
          currentItem: lesson.title,
          downloadedItems: i + 1,
        }));

        try {
          // Cachear lição
          await cacheLessons([{
            ...lesson,
            createdAt: new Date(lesson.createdAt),
            updatedAt: new Date(lesson.updatedAt),
          }]);

          // Buscar e cachear exercícios
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
            console.error(`Erro ao cachear exercícios da lição ${lesson.id}:`, err);
          }

          // Atualizar progresso
          downloadedSize = await getCacheSize();
          const elapsedTime = (Date.now() - startTime) / 1000;
          const estimatedTotalTime = elapsedTime / ((i + 1) / lessons.length);
          const estimatedRemainingTime = estimatedTotalTime - elapsedTime;

          setState(prev => ({
            ...prev,
            progress: Math.round(((i + 1) / lessons.length) * 100),
            downloadedSize: Math.round(downloadedSize * 100) / 100,
            estimatedTime: Math.round(estimatedRemainingTime),
          }));
        } catch (err) {
          console.error(`Erro ao cachear lição ${lesson.id}:`, err);
        }
      }

      setState(prev => ({
        ...prev,
        isDownloading: false,
        progress: 100,
      }));

      toast.success('Download completo! Você pode usar o app offline agora.');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
      setState(prev => ({
        ...prev,
        isDownloading: false,
        error: errorMsg,
      }));
      toast.error(`Erro no download: ${errorMsg}`);
    }
  };

  const togglePause = () => {
    setState(prev => ({
      ...prev,
      isPaused: !prev.isPaused,
    }));
  };

  const cancelDownload = () => {
    setState(prev => ({
      ...prev,
      isDownloading: false,
      isPaused: false,
      progress: 0,
      downloadedItems: 0,
      error: null,
    }));
  };

  return (
    <>
      {/* Botão flutuante */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 right-4 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors z-30"
        title="Download Completo"
      >
        <Download className="h-5 w-5" />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Download Completo</CardTitle>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </CardHeader>

            <CardContent className="space-y-4">
              {!state.isDownloading ? (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Selecione o nível:</label>
                    <select
                      value={selectedLevel}
                      onChange={(e) => setSelectedLevel(e.target.value as 'basico' | 'intermediario' | 'avancado' | 'negocios_tecnologia')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="basico">Básico</option>
                      <option value="intermediario">Intermediário</option>
                      <option value="avancado">Avançado</option>
                      <option value="negocios">Negócios/Tecnologia</option>
                    </select>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-900">
                    <p>📦 Lições: {lessons?.length || 0}</p>
                    <p>💾 Espaço necessário: ~{Math.round((lessons?.length || 0) * 2)} MB</p>
                  </div>

                  <Button
                    onClick={startDownload}
                    disabled={!lessons || lessons.length === 0}
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Iniciar Download
                  </Button>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{state.currentItem}</span>
                      <span className="text-gray-600">{state.downloadedItems}/{state.totalItems}</span>
                    </div>
                    <Progress value={state.progress} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{state.progress}%</span>
                      <span>Tempo restante: {Math.round(state.estimatedTime / 60)}m</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-md text-sm">
                    <p>📊 Cache: {state.downloadedSize.toFixed(1)} MB</p>
                    <p>⏱️ Tempo decorrido: {Math.round(state.estimatedTime)}s</p>
                  </div>

                  {state.error && (
                    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
                      <AlertCircle className="h-4 w-4" />
                      {state.error}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={togglePause}
                      variant="outline"
                      className="flex-1"
                    >
                      {state.isPaused ? (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Retomar
                        </>
                      ) : (
                        <>
                          <Pause className="h-4 w-4 mr-2" />
                          Pausar
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={cancelDownload}
                      variant="outline"
                      className="flex-1"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
