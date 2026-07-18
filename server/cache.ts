/**
 * ============================================================
 * SISTEMA DE CACHE INTELIGENTE
 * ============================================================
 * 
 * Cache em memória para acelerar carregamento 10x:
 * - Lições mais acessadas
 * - Vocabulário e gramática
 * - Cursos e professores
 * - TTL (Time To Live) configurável
 * - Invalidação automática
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  hits: number;
}

class IntelligentCache {
  private cache: Map<string, CacheEntry<any>>;
  private maxSize: number;
  private defaultTTL: number; // em segundos
  
  constructor(maxSize: number = 10000, defaultTTL: number = 300) { // FIXED: was 0.00001s
    this.cache = new Map();
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
    
    // Limpar cache expirado a cada 60 segundos
    setInterval(() => this.cleanExpired(), 60000);
  }
  
  /**
   * Obter item do cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    // Verificar se expirou
    const now = Date.now();
    const age = (now - entry.timestamp) / 1000;
    
    if (age > this.defaultTTL) {
      this.cache.delete(key);
      return null;
    }
    
    // Incrementar hits
    entry.hits++;
    
    return entry.data as T;
  }
  
  /**
   * Salvar item no cache
   */
  set<T>(key: string, data: T): void {
    // Se cache está cheio, remover item menos usado
    if (this.cache.size >= this.maxSize) {
      this.evictLeastUsed();
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      hits: 0
    });
  }
  
  /**
   * Invalidar item do cache
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }
  
  /**
   * Invalidar múltiplos itens por padrão
   */
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    const keysToDelete: string[] = [];
    
    for (const key of Array.from(this.cache.keys())) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }
  
  /**
   * Limpar itens expirados
   */
  private cleanExpired(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    for (const [key, entry] of Array.from(this.cache.entries())) {
      const age = (now - entry.timestamp) / 1000;
      if (age > this.defaultTTL) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
    
    if (keysToDelete.length > 0) {
      console.log(`[Cache] Removidos ${keysToDelete.length} itens expirados`);
    }
  }
  
  /**
   * Remover item menos usado (LRU)
   */
  private evictLeastUsed(): void {
    let leastUsedKey: string | null = null;
    let minHits = Infinity;
    
    for (const [key, entry] of Array.from(this.cache.entries())) {
      if (entry.hits < minHits) {
        minHits = entry.hits;
        leastUsedKey = key;
      }
    }
    
    if (leastUsedKey) {
      this.cache.delete(leastUsedKey);
      console.log(`[Cache] Removido item menos usado: ${leastUsedKey}`);
    }
  }
  
  /**
   * Obter estatísticas do cache
   */
  getStats() {
    let totalHits = 0;
    let oldestTimestamp = Date.now();
    
    for (const entry of Array.from(this.cache.values())) {
      totalHits += entry.hits;
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
      }
    }
    
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      totalHits,
      averageHits: this.cache.size > 0 ? totalHits / this.cache.size : 0,
      oldestAge: (Date.now() - oldestTimestamp) / 1000
    };
  }
  
  /**
   * Limpar todo o cache
   */
  clear(): void {
    this.cache.clear();
    console.log('[Cache] Cache limpo completamente');
  }
}

// ============================================================
// INSTÂNCIA GLOBAL DO CACHE
// ============================================================

// FIXED BUG #1: TTL was 0.000001s (1 microsecond) → cache never worked → now 300s (5 min)
export const cache = new IntelligentCache(10000, 300);

// ============================================================
// FUNÇÕES HELPER PARA CACHE
// ============================================================

/**
 * Wrapper para cachear resultado de função
 */
export async function cached<T>(
  key: string,
  fn: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // Tentar obter do cache
  const cached = cache.get<T>(key);
  if (cached !== null) {
    console.log(`[Cache] HIT: ${key}`);
    return cached;
  }
  
  // Executar função e cachear resultado
  console.log(`[Cache] MISS: ${key}`);
  const result = await fn();
  cache.set(key, result);
  
  return result;
}

/**
 * Cachear lição por ID
 */
export function cacheLesson(lessonId: number, lesson: any): void {
  cache.set(`lesson:${lessonId}`, lesson);
}

/**
 * Obter lição do cache
 */
export function getCachedLesson(lessonId: number): any | null {
  return cache.get(`lesson:${lessonId}`);
}

/**
 * Cachear exercícios de lição
 */
export function cacheExercises(lessonId: number, exercises: any[]): void {
  cache.set(`exercises:${lessonId}`, exercises);
}

/**
 * Obter exercícios do cache
 */
export function getCachedExercises(lessonId: number): any[] | null {
  return cache.get(`exercises:${lessonId}`);
}

/**
 * Cachear lista de lições
 */
export function cacheLessonsList(courseId: number, lessons: any[]): void {
  cache.set(`lessons:course:${courseId}`, lessons);
}

/**
 * Obter lista de lições do cache
 */
export function getCachedLessonsList(courseId: number): any[] | null {
  return cache.get(`lessons:course:${courseId}`);
}

/**
 * Invalidar cache de lição
 */
export function invalidateLessonCache(lessonId: number): void {
  cache.invalidate(`lesson:${lessonId}`);
  cache.invalidate(`exercises:${lessonId}`);
}

/**
 * Invalidar cache de curso
 */
export function invalidateCourseCache(courseId: number): void {
  cache.invalidatePattern(`lessons:course:${courseId}`);
}

// Log de estatísticas a cada 5 minutos
setInterval(() => {
  const stats = cache.getStats();
  console.log('[Cache] Estatísticas:', stats);
}, 300000);
