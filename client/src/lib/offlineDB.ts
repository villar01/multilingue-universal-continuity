import Dexie, { Table } from 'dexie';

// Tipos de dados offline
export interface CachedLesson {
  id: number;
  title: string;
  content: string | null;
  languageCode: string | null;
  courseLevel: string | null;
  orderIndex: number;
  difficultyScore: number | null;
  grammar: string[] | null;
  vocabulary: string[] | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CachedExercise {
  id: number;
  lessonId: number;
  question: string;
  correctAnswer: string;
  options: string[] | null;
  exerciseType: string;
  difficultyScore: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CachedAudio {
  id: string; // hash do texto + idioma + voz
  text: string;
  languageCode: string;
  voiceId: string | null;
  audioData: Blob;
  createdAt: Date;
}

export interface CachedLanguage {
  id: number;
  name: string;
  code: string;
  nativeName: string;
  flag: string | null;
  createdAt: Date;
  updatedAt: Date;
  isActive?: boolean | null;
  elevenLabsVoiceId?: string | null;
  elevenLabsVoiceName?: string | null;
}

export interface SyncLog {
  id?: number;
  action: 'download' | 'upload' | 'sync';
  resource: string;
  status: 'pending' | 'success' | 'error';
  timestamp: Date;
  details?: string;
}

// Banco de dados offline
export class OfflineDB extends Dexie {
  lessons!: Table<CachedLesson>;
  exercises!: Table<CachedExercise>;
  audio!: Table<CachedAudio>;
  languages!: Table<CachedLanguage>;
  syncLog!: Table<SyncLog>;

  constructor() {
    super('MultiLingueOfflineDB');
    this.version(1).stores({
      lessons: '++id, languageCode, courseLevel',
      exercises: '++id, lessonId',
      audio: '++id, languageCode',
      languages: '++id, code',
      syncLog: '++id, timestamp',
    });
  }
}

// Instância global
export const offlineDB = new OfflineDB();

// Funções de cache
export async function cacheLessons(lessons: CachedLesson[]): Promise<void> {
  await offlineDB.lessons.bulkPut(lessons);
  await logSync('download', 'lessons', 'success', `${lessons.length} lições`);
}

export async function cacheExercises(exercises: CachedExercise[]): Promise<void> {
  await offlineDB.exercises.bulkPut(exercises);
  await logSync('download', 'exercises', 'success', `${exercises.length} exercícios`);
}

export async function cacheLanguages(languages: CachedLanguage[]): Promise<void> {
  await offlineDB.languages.bulkPut(languages);
  await logSync('download', 'languages', 'success', `${languages.length} idiomas`);
}

export async function cacheAudio(id: string, text: string, languageCode: string, voiceId: string | null, audioData: Blob): Promise<void> {
  await offlineDB.audio.put({
    id,
    text,
    languageCode,
    voiceId,
    audioData,
    createdAt: new Date(),
  });
}

export async function getAudioFromCache(id: string): Promise<Blob | undefined> {
  const cached = await offlineDB.audio.get(id);
  return cached?.audioData;
}

export async function getLessonsFromCache(courseLevel?: string): Promise<CachedLesson[]> {
  if (courseLevel) {
    return await offlineDB.lessons.where('courseLevel').equals(courseLevel).toArray();
  }
  return await offlineDB.lessons.toArray();
}

export async function getExercisesFromCache(lessonId: number): Promise<CachedExercise[]> {
  return await offlineDB.exercises.where('lessonId').equals(lessonId).toArray();
}

export async function getLanguagesFromCache(): Promise<CachedLanguage[]> {
  return await offlineDB.languages.toArray();
}

export async function clearCache(): Promise<void> {
  await offlineDB.lessons.clear();
  await offlineDB.exercises.clear();
  await offlineDB.audio.clear();
  await offlineDB.languages.clear();
}

export async function logSync(action: 'download' | 'upload' | 'sync', resource: string, status: 'pending' | 'success' | 'error', details?: string): Promise<void> {
  await offlineDB.syncLog.add({
    action,
    resource,
    status,
    timestamp: new Date(),
    details,
  });
}

export async function getSyncLogs(): Promise<SyncLog[]> {
  return await offlineDB.syncLog.orderBy('timestamp').reverse().limit(50).toArray();
}

// Verificar se há dados em cache
export async function hasCachedData(): Promise<boolean> {
  const lessonsCount = await offlineDB.lessons.count();
  const exercisesCount = await offlineDB.exercises.count();
  return lessonsCount > 0 && exercisesCount > 0;
}

// Obter tamanho do cache em MB
export async function getCacheSize(): Promise<number> {
  const lessons = await offlineDB.lessons.toArray();
  const exercises = await offlineDB.exercises.toArray();
  const audio = await offlineDB.audio.toArray();
  
  let size = 0;
  size += JSON.stringify(lessons).length;
  size += JSON.stringify(exercises).length;
  audio.forEach(a => {
    size += a.audioData.size;
  });
  
  return size / (1024 * 1024); // Converter para MB
}
