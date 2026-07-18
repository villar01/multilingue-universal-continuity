import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  offlineDB,
  cacheLessons,
  cacheExercises,
  getLessonsFromCache,
  getExercisesFromCache,
  hasCachedData,
  getCacheSize,
  clearCache,
  type CachedLesson,
  type CachedExercise,
} from './offlineDB';

describe('OfflineDB', () => {
  beforeEach(async () => {
    // Limpar banco antes de cada teste
    await clearCache();
  });

  afterEach(async () => {
    // Limpar banco após cada teste
    await clearCache();
  });

  describe('cacheLessons', () => {
    it('deve cachear lições corretamente', async () => {
      const lessons: CachedLesson[] = [
        {
          id: 1,
          title: 'Greetings',
          content: 'Hello, how are you?',
          languageCode: 'en',
          courseLevel: 'basico',
          orderIndex: 1,
          difficultyScore: 0.2,
          grammar: ['Present Simple'],
          vocabulary: ['hello', 'hi'],
          description: 'Learn basic greetings',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      await cacheLessons(lessons);
      const cached = await getLessonsFromCache();

      expect(cached).toHaveLength(1);
      expect(cached[0].title).toBe('Greetings');
    });

    it('deve filtrar lições por nível', async () => {
      const lessons: CachedLesson[] = [
        {
          id: 1,
          title: 'Basics',
          content: null,
          languageCode: 'en',
          courseLevel: 'basico',
          orderIndex: 1,
          difficultyScore: 0.2,
          grammar: null,
          vocabulary: null,
          description: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          title: 'Advanced',
          content: null,
          languageCode: 'en',
          courseLevel: 'avancado',
          orderIndex: 2,
          difficultyScore: 0.8,
          grammar: null,
          vocabulary: null,
          description: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      await cacheLessons(lessons);
      const basicLessons = await getLessonsFromCache('basico');

      expect(basicLessons).toHaveLength(1);
      expect(basicLessons[0].courseLevel).toBe('basico');
    });
  });

  describe('cacheExercises', () => {
    it('deve cachear exercícios corretamente', async () => {
      const exercises: CachedExercise[] = [
        {
          id: 1,
          lessonId: 1,
          question: 'What is your name?',
          correctAnswer: 'My name is...',
          options: ['My name is...', 'I am...', 'You are...'],
          exerciseType: 'multiple-choice',
          difficultyScore: 0.3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      await cacheExercises(exercises);
      const cached = await getExercisesFromCache(1);

      expect(cached).toHaveLength(1);
      expect(cached[0].question).toBe('What is your name?');
    });
  });

  describe('hasCachedData', () => {
    it('deve retornar false quando não há dados', async () => {
      const has = await hasCachedData();
      expect(has).toBe(false);
    });

    it('deve retornar true quando há dados', async () => {
      const lessons: CachedLesson[] = [
        {
          id: 1,
          title: 'Test',
          content: null,
          languageCode: 'en',
          courseLevel: 'basico',
          orderIndex: 1,
          difficultyScore: 0.5,
          grammar: null,
          vocabulary: null,
          description: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const exercises: CachedExercise[] = [
        {
          id: 1,
          lessonId: 1,
          question: 'Test?',
          correctAnswer: 'Yes',
          options: null,
          exerciseType: 'text',
          difficultyScore: 0.5,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      await cacheLessons(lessons);
      await cacheExercises(exercises);

      const has = await hasCachedData();
      expect(has).toBe(true);
    });
  });

  describe('getCacheSize', () => {
    it('deve calcular tamanho do cache', async () => {
      const lessons: CachedLesson[] = [
        {
          id: 1,
          title: 'Test Lesson',
          content: 'Content here',
          languageCode: 'en',
          courseLevel: 'basico',
          orderIndex: 1,
          difficultyScore: 0.5,
          grammar: ['Present'],
          vocabulary: ['test'],
          description: 'Description',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      await cacheLessons(lessons);
      const size = await getCacheSize();

      expect(size).toBeGreaterThan(0);
      expect(typeof size).toBe('number');
    });
  });

  describe('clearCache', () => {
    it('deve limpar todo o cache', async () => {
      const lessons: CachedLesson[] = [
        {
          id: 1,
          title: 'Test',
          content: null,
          languageCode: 'en',
          courseLevel: 'basico',
          orderIndex: 1,
          difficultyScore: 0.5,
          grammar: null,
          vocabulary: null,
          description: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      await cacheLessons(lessons);
      let cached = await getLessonsFromCache();
      expect(cached).toHaveLength(1);

      await clearCache();
      cached = await getLessonsFromCache();
      expect(cached).toHaveLength(0);
    });
  });
});
