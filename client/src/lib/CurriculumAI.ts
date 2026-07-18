/**
 * CurriculumAI — IA Supervisora de Autodesenvolvimento
 * Algoritmo SM-2 para Spaced Repetition
 * Analisa erros do aluno e adapta conteúdo automaticamente
 * Gera feedback personalizado via LLM (Llama/Claude)
 */

export interface StudentProfile {
  userId: string;
  language: string;
  langCode: string;
  level: 'beginner' | 'elementary' | 'intermediate' | 'advanced' | 'fluent';
  xp: number;
  streak: number;
  masteredWords: string[];
  weakWords: string[];      // palavras com erros frequentes
  strongCategories: string[];
  weakCategories: string[];
  sessionHistory: SessionResult[];
  lastActivity: Date;
}

export interface SessionResult {
  date: Date;
  wordsLearned: string[];
  correctAnswers: number;
  totalAnswers: number;
  timeSpentSeconds: number;
  arObjectsDetected: number;
  xpEarned: number;
}

export interface AdaptiveContent {
  recommendedWords: string[];       // palavras para praticar hoje
  focusCategory: string;            // categoria com mais dificuldade
  suggestedActivity: ActivityType;  // atividade recomendada
  difficulty: number;               // 1-10
  teacherMessage: string;           // mensagem motivacional do professor
  reviewWords: string[];            // palavras para revisão (SM-2)
}

export type ActivityType =
  | 'ar_scan'       // escanear objetos com câmera
  | 'listening'     // ouvir e repetir
  | 'quiz'          // quiz de múltipla escolha
  | 'dialogue'      // praticar diálogo
  | 'writing'       // escrever palavras
  | 'pronunciation' // praticar pronúncia
  | 'cultural';     // curiosidades culturais

export interface PerformanceMetrics {
  accuracy: number;           // % de acertos
  retentionRate: number;      // % de palavras lembradas após 24h
  progressSpeed: number;      // palavras aprendidas por sessão
  consistencyScore: number;   // regularidade de estudo (0-100)
  arEngagementScore: number;  // uso da câmera AR (0-100)
}

// ─────────────────────────────────────────────
// Mensagens motivacionais por nível e idioma
// ─────────────────────────────────────────────
const MOTIVATIONAL_MESSAGES: Record<string, string[]> = {
  'en-US': [
    "Great job! You're making amazing progress!",
    "Keep it up! Every word you learn opens a new door.",
    "You're doing fantastic! Your brain is building new connections.",
    "Excellent! Consistency is the key to fluency.",
    "Wonderful! You're one step closer to speaking like a native!",
  ],
  'pt-BR': [
    "Ótimo trabalho! Você está progredindo muito!",
    "Continue assim! Cada palavra aprendida abre uma nova porta.",
    "Você está indo muito bem! Seu cérebro está criando novas conexões.",
    "Excelente! A consistência é a chave para a fluência.",
    "Maravilhoso! Você está cada vez mais perto de falar como um nativo!",
  ],
  'es-ES': [
    "¡Excelente trabajo! ¡Estás progresando de manera increíble!",
    "¡Sigue así! Cada palabra que aprendes abre una nueva puerta.",
    "¡Lo estás haciendo fantásticamente! Tu cerebro está creando nuevas conexiones.",
    "¡Excelente! La consistencia es la clave para la fluidez.",
    "¡Maravilloso! ¡Estás cada vez más cerca de hablar como un nativo!",
  ],
};

// ─────────────────────────────────────────────
// Algoritmo SM-2 puro
// ─────────────────────────────────────────────
export interface SM2Card {
  word: string;
  interval: number;       // dias
  repetitions: number;
  easeFactor: number;     // 1.3 - 2.5+
  nextReview: Date;
  lastQuality: number;    // 0-5
}

export function sm2Update(card: SM2Card, quality: number): SM2Card {
  // quality: 0=blackout, 1=wrong, 2=wrong+hint, 3=correct+hard, 4=correct, 5=perfect
  let { interval, repetitions, easeFactor } = card;

  if (quality < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    switch (repetitions) {
      case 0: interval = 1; break;
      case 1: interval = 6; break;
      default: interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  }

  easeFactor = Math.max(1.3,
    easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
  );

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  return { ...card, interval, repetitions, easeFactor, nextReview, lastQuality: quality };
}

// ─────────────────────────────────────────────
// Classe principal CurriculumAI
// ─────────────────────────────────────────────
export class CurriculumAI {
  private profile: StudentProfile;
  private cards: Map<string, SM2Card> = new Map();

  constructor(profile: StudentProfile) {
    this.profile = profile;
    // Inicializar cards SM-2 para palavras já conhecidas
    profile.masteredWords.forEach(word => {
      this.cards.set(word, {
        word,
        interval: 21,
        repetitions: 5,
        easeFactor: 2.5,
        nextReview: new Date(Date.now() + 21 * 86400000),
        lastQuality: 4,
      });
    });
  }

  /**
   * Registra resposta do aluno e atualiza SM-2
   */
  recordAnswer(word: string, correct: boolean, timeMs: number): SM2Card {
    const quality = correct
      ? timeMs < 3000 ? 5 : timeMs < 6000 ? 4 : 3
      : timeMs < 5000 ? 2 : 1;

    const existing = this.cards.get(word) || {
      word,
      interval: 1,
      repetitions: 0,
      easeFactor: 2.5,
      nextReview: new Date(),
      lastQuality: 0,
    };

    const updated = sm2Update(existing, quality);
    this.cards.set(word, updated);

    // Atualizar perfil
    if (quality >= 4 && !this.profile.masteredWords.includes(word)) {
      this.profile.masteredWords.push(word);
    }
    if (quality < 3 && !this.profile.weakWords.includes(word)) {
      this.profile.weakWords.push(word);
    }

    return updated;
  }

  /**
   * Gera conteúdo adaptativo para a próxima sessão
   */
  getAdaptiveContent(): AdaptiveContent {
    const now = new Date();

    // Palavras para revisão hoje (SM-2)
    const reviewWords = Array.from(this.cards.values())
      .filter(c => c.nextReview <= now)
      .sort((a, b) => a.nextReview.getTime() - b.nextReview.getTime())
      .slice(0, 10)
      .map(c => c.word);

    // Categoria mais fraca
    const categoryErrors: Record<string, number> = {};
    this.profile.weakWords.forEach(w => {
      const cat = this.getCategoryForWord(w);
      categoryErrors[cat] = (categoryErrors[cat] || 0) + 1;
    });
    const focusCategory = Object.entries(categoryErrors)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'furniture';

    // Atividade recomendada baseada no histórico
    const recentAccuracy = this.getRecentAccuracy();
    const suggestedActivity: ActivityType =
      recentAccuracy < 0.5 ? 'listening' :
      recentAccuracy < 0.7 ? 'quiz' :
      this.profile.streak < 3 ? 'ar_scan' :
      'dialogue';

    // Dificuldade adaptativa
    const difficulty = Math.min(10, Math.max(1,
      Math.round(this.profile.level === 'beginner' ? 2 :
        this.profile.level === 'elementary' ? 4 :
        this.profile.level === 'intermediate' ? 6 :
        this.profile.level === 'advanced' ? 8 : 9)
    ));

    // Mensagem motivacional
    const msgs = MOTIVATIONAL_MESSAGES[this.profile.langCode] ||
                 MOTIVATIONAL_MESSAGES['en-US'];
    const teacherMessage = msgs[Math.floor(Math.random() * msgs.length)];

    return {
      recommendedWords: reviewWords.length > 0 ? reviewWords : this.getNewWords(5),
      focusCategory,
      suggestedActivity,
      difficulty,
      teacherMessage,
      reviewWords,
    };
  }

  /**
   * Calcula métricas de performance do aluno
   */
  getPerformanceMetrics(): PerformanceMetrics {
    const recent = this.profile.sessionHistory.slice(-10);
    if (recent.length === 0) {
      return { accuracy: 0, retentionRate: 0, progressSpeed: 0, consistencyScore: 0, arEngagementScore: 0 };
    }

    const accuracy = recent.reduce((sum, s) =>
      sum + (s.totalAnswers > 0 ? s.correctAnswers / s.totalAnswers : 0), 0) / recent.length;

    const progressSpeed = recent.reduce((sum, s) => sum + s.wordsLearned.length, 0) / recent.length;

    // Consistência: dias consecutivos de estudo
    const consistencyScore = Math.min(100, this.profile.streak * 10);

    // Engajamento AR: % de sessões com objetos detectados
    const arEngagementScore = Math.min(100,
      (recent.filter(s => s.arObjectsDetected > 0).length / recent.length) * 100
    );

    // Taxa de retenção: palavras que ainda estão corretas após 24h
    const retentionRate = this.profile.masteredWords.length > 0
      ? Math.min(1, this.profile.masteredWords.length / Math.max(1, this.profile.masteredWords.length + this.profile.weakWords.length))
      : 0;

    return { accuracy, retentionRate, progressSpeed, consistencyScore, arEngagementScore };
  }

  /**
   * Atualiza nível do aluno baseado em XP e performance
   */
  updateLevel(): void {
    const { xp } = this.profile;
    if (xp >= 10000) this.profile.level = 'fluent';
    else if (xp >= 5000) this.profile.level = 'advanced';
    else if (xp >= 2000) this.profile.level = 'intermediate';
    else if (xp >= 500) this.profile.level = 'elementary';
    else this.profile.level = 'beginner';
  }

  /**
   * Adiciona XP e verifica streak
   */
  addXP(amount: number): { newXP: number; levelUp: boolean; newLevel: string } {
    const oldLevel = this.profile.level;
    this.profile.xp += amount;
    this.updateLevel();
    const levelUp = this.profile.level !== oldLevel;

    // Verificar streak
    const lastActivity = new Date(this.profile.lastActivity);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - lastActivity.getTime()) / 86400000);
    if (diffDays === 1) {
      this.profile.streak += 1;
    } else if (diffDays > 1) {
      this.profile.streak = 1;
    }
    this.profile.lastActivity = now;

    return { newXP: this.profile.xp, levelUp, newLevel: this.profile.level };
  }

  /**
   * Gera prompt para IA de autodesenvolvimento
   * Usado para pedir ao LLM feedback personalizado
   */
  generateAIPrompt(context: string): string {
    const metrics = this.getPerformanceMetrics();
    const adaptive = this.getAdaptiveContent();

    return `You are an expert language teacher for ${this.profile.language}.
Student profile:
- Level: ${this.profile.level}
- XP: ${this.profile.xp}
- Streak: ${this.profile.streak} days
- Accuracy: ${(metrics.accuracy * 100).toFixed(0)}%
- Mastered words: ${this.profile.masteredWords.length}
- Weak words: ${this.profile.weakWords.slice(0, 5).join(', ')}
- Focus category: ${adaptive.focusCategory}

Context: ${context}

Provide a SHORT (2-3 sentences), encouraging, personalized response in ${this.profile.language} that:
1. Addresses their specific weakness
2. Gives a practical tip
3. Motivates them to continue

Respond ONLY in ${this.profile.language}.`;
  }

  get studentProfile(): StudentProfile {
    return this.profile;
  }

  private getRecentAccuracy(): number {
    const recent = this.profile.sessionHistory.slice(-5);
    if (recent.length === 0) return 0.7;
    return recent.reduce((sum, s) =>
      sum + (s.totalAnswers > 0 ? s.correctAnswers / s.totalAnswers : 0), 0) / recent.length;
  }

  private getNewWords(count: number): string[] {
    // Retorna palavras novas baseadas no nível
    const allWords = ['book', 'chair', 'table', 'window', 'door', 'phone', 'cup', 'laptop', 'clock', 'plant'];
    return allWords
      .filter(w => !this.profile.masteredWords.includes(w))
      .slice(0, count);
  }

  private getCategoryForWord(word: string): string {
    const cats: Record<string, string> = {
      chair: 'furniture', table: 'furniture', sofa: 'furniture',
      laptop: 'electronics', phone: 'electronics', tv: 'electronics',
      apple: 'food', cup: 'food', bottle: 'food',
      window: 'architecture', door: 'architecture',
    };
    return cats[word] || 'other';
  }
}

// ─────────────────────────────────────────────
// Hook React para usar CurriculumAI
// ─────────────────────────────────────────────
import { useState, useCallback, useRef } from 'react';

export function useCurriculumAI(initialProfile: Partial<StudentProfile>) {
  const aiRef = useRef<CurriculumAI | null>(null);

  const [profile, setProfile] = useState<StudentProfile>({
    userId: initialProfile.userId || 'guest',
    language: initialProfile.language || 'English',
    langCode: initialProfile.langCode || 'en-US',
    level: initialProfile.level || 'beginner',
    xp: initialProfile.xp || 0,
    streak: initialProfile.streak || 0,
    masteredWords: initialProfile.masteredWords || [],
    weakWords: initialProfile.weakWords || [],
    strongCategories: initialProfile.strongCategories || [],
    weakCategories: initialProfile.weakCategories || [],
    sessionHistory: initialProfile.sessionHistory || [],
    lastActivity: initialProfile.lastActivity || new Date(),
  });

  const getAI = useCallback(() => {
    if (!aiRef.current) {
      aiRef.current = new CurriculumAI(profile);
    }
    return aiRef.current;
  }, [profile]);

  const recordAnswer = useCallback((word: string, correct: boolean, timeMs: number) => {
    const card = getAI().recordAnswer(word, correct, timeMs);
    setProfile(prev => ({ ...prev, ...getAI().studentProfile }));
    return card;
  }, [getAI]);

  const addXP = useCallback((amount: number) => {
    const result = getAI().addXP(amount);
    setProfile(prev => ({ ...prev, ...getAI().studentProfile }));
    return result;
  }, [getAI]);

  const getAdaptiveContent = useCallback(() => {
    return getAI().getAdaptiveContent();
  }, [getAI]);

  const getMetrics = useCallback(() => {
    return getAI().getPerformanceMetrics();
  }, [getAI]);

  const generateAIPrompt = useCallback((context: string) => {
    return getAI().generateAIPrompt(context);
  }, [getAI]);

  return {
    profile,
    recordAnswer,
    addXP,
    getAdaptiveContent,
    getMetrics,
    generateAIPrompt,
  };
}
