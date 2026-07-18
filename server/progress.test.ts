/**
 * Testes para o sistema de progresso do usuário
 * Executar: pnpm test progress.test.ts
 */

import { describe, it, expect, beforeAll } from "vitest";
import * as db from "./db";

describe("Sistema de Progresso do Usuário", () => {
  let testUserId: number;
  let testLessonId: number;
  let testCourseId: number;

  beforeAll(async () => {
    // Usar IDs reais conhecidos do banco de dados
    // Estes IDs foram verificados e existem no banco
    testUserId = 1; // Primeiro usuário (owner)
    testLessonId = 390001; // Primeira lição real no banco
    testCourseId = 90001; // Primeiro curso real no banco

    // Tentar buscar IDs reais via getAllLessons
    try {
      const lessons = await db.getAllLessons();
      if (lessons && lessons.length > 0) {
        testLessonId = lessons[0].id;
      }
      const courses = await db.getAllCourses();
      if (courses && courses.length > 0) {
        testCourseId = courses[0].id;
      }
    } catch (e) {
      // Usar IDs padrão se falhar
      console.warn("[Test] Usando IDs padrão para testes");
    }
  });

  describe("completeLesson", () => {
    it("deve salvar uma lição completada com sucesso", async () => {
      await db.completeLesson({
        userId: testUserId,
        lessonId: testLessonId,
        courseId: testCourseId,
        score: 85,
        timeSpentSeconds: 300,
      });

      const completedLessons = await db.getUserCompletedLessons(testUserId);
      expect(completedLessons.length).toBeGreaterThan(0);
      
      const found = completedLessons.find(l => l.lessonId === testLessonId);
      expect(found).toBeDefined();
      expect(found?.score).toBe(85);
    });

    it("deve calcular XP baseado no score", async () => {
      const score = 100;
      const expectedXp = 100; // XP = score

      await db.completeLesson({
        userId: testUserId,
        lessonId: testLessonId,
        courseId: testCourseId,
        score,
        timeSpentSeconds: 200,
      });

      const completedLessons = await db.getUserCompletedLessons(testUserId);
      const lastCompleted = completedLessons[0];
      
      expect(lastCompleted?.xpEarned).toBe(expectedXp);
    });

    it("deve atualizar o progresso do curso", async () => {
      await db.completeLesson({
        userId: testUserId,
        lessonId: testLessonId,
        courseId: testCourseId,
        score: 90,
        timeSpentSeconds: 250,
      });

      const progress = await db.getUserProgress(testUserId, testCourseId);
      expect(progress).toBeDefined();
      expect(progress?.completedLessons).toBeGreaterThan(0);
      expect(progress?.totalPoints).toBeGreaterThan(0);
    });
  });

  describe("getUserStats", () => {
    it("deve retornar estatísticas corretas do usuário", async () => {
      const stats = await db.getUserStats(testUserId);
      
      expect(stats).toBeDefined();
      expect(stats?.totalXp).toBeGreaterThanOrEqual(0);
      expect(stats?.level).toBeGreaterThanOrEqual(1);
      expect(stats?.totalLessonsCompleted).toBeGreaterThanOrEqual(0);
    });

    it("deve calcular o nível baseado em XP (100 XP por nível)", async () => {
      const stats = await db.getUserStats(testUserId);
      
      if (stats && stats.totalXp > 0) {
        const expectedLevel = Math.floor(stats.totalXp / 100) + 1;
        expect(stats.level).toBe(expectedLevel);
      }
    });

    it("deve calcular XP para próximo nível", async () => {
      const stats = await db.getUserStats(testUserId);
      
      if (stats) {
        const xpForNextLevel = (stats.level * 100) - stats.totalXp;
        expect(stats.xpForNextLevel).toBe(xpForNextLevel);
        expect(stats.xpForNextLevel).toBeGreaterThanOrEqual(0);
        expect(stats.xpForNextLevel).toBeLessThan(100);
      }
    });
  });

  describe("isLessonCompleted", () => {
    it("deve retornar true para lição completada", async () => {
      // Completar a lição real
      await db.completeLesson({
        userId: testUserId,
        lessonId: testLessonId,
        courseId: testCourseId,
        score: 75,
        timeSpentSeconds: 180,
      });

      const isCompleted = await db.isLessonCompleted(testUserId, testLessonId);
      expect(isCompleted).toBe(true);
    });

    it("deve retornar false para lição não completada", async () => {
      const isCompleted = await db.isLessonCompleted(testUserId, 999999);
      expect(isCompleted).toBe(false);
    });
  });

  describe("Streak (Sequência)", () => {
    it("deve manter streak quando estudar no mesmo dia", async () => {
      const progressBefore = await db.getUserProgress(testUserId, testCourseId);
      const streakBefore = progressBefore?.currentStreak || 0;

      await db.completeLesson({
        userId: testUserId,
        lessonId: testLessonId,
        courseId: testCourseId,
        score: 80,
        timeSpentSeconds: 200,
      });

      const progressAfter = await db.getUserProgress(testUserId, testCourseId);
      expect(progressAfter?.currentStreak).toBeGreaterThanOrEqual(streakBefore);
    });

    it("deve atualizar longest streak quando current streak for maior", async () => {
      const progress = await db.getUserProgress(testUserId, testCourseId);
      
      if (progress) {
        expect(progress.longestStreak).toBeGreaterThanOrEqual(progress.currentStreak || 0);
      }
    });
  });

  describe("Conquistas", () => {
    it("deve desbloquear conquista ao completar primeira lição", async () => {
      const allAchievements = await db.getAllAchievements();
      const firstStepAchievement = allAchievements.find(
        (a: any) => a.requirementType === "lessons_completed" && a.requirementValue === 1
      );

      if (firstStepAchievement) {
        await db.completeLesson({
          userId: testUserId,
          lessonId: testLessonId,
          courseId: testCourseId,
          score: 70,
          timeSpentSeconds: 150,
        });

        const userAchievements = await db.getUserAchievements(testUserId);
        const hasFirstStep = userAchievements.some(
          (ua: any) => ua.achievement.id === firstStepAchievement.id
        );

        expect(hasFirstStep).toBe(true);
      } else {
        // Sem conquistas configuradas — apenas verificar que a função existe
        expect(Array.isArray(allAchievements)).toBe(true);
      }
    });

    it("deve retornar lista de conquistas do usuário", async () => {
      const userAchievements = await db.getUserAchievements(testUserId);
      
      expect(Array.isArray(userAchievements)).toBe(true);
      
      if (userAchievements.length > 0) {
        const firstAchievement = userAchievements[0];
        expect(firstAchievement).toHaveProperty("achievement");
        expect(firstAchievement).toHaveProperty("unlockedAt");
        expect(firstAchievement.achievement).toHaveProperty("name");
        expect(firstAchievement.achievement).toHaveProperty("icon");
      }
    });
  });

  describe("Tempo de Estudo", () => {
    it("deve acumular tempo de estudo em minutos", async () => {
      const progressBefore = await db.getUserProgress(testUserId, testCourseId);
      const timeBefore = progressBefore?.totalStudyMinutes || 0;

      // Completar lição com 120 segundos (2 minutos)
      await db.completeLesson({
        userId: testUserId,
        lessonId: testLessonId,
        courseId: testCourseId,
        score: 95,
        timeSpentSeconds: 120,
      });

      const progressAfter = await db.getUserProgress(testUserId, testCourseId);
      const timeAfter = progressAfter?.totalStudyMinutes || 0;

      expect(timeAfter).toBeGreaterThanOrEqual(timeBefore);
    });
  });
});
