/**
 * Content Filter & Interaction Logger
 * 
 * Filters inappropriate content from LLM responses and teacher-student interactions.
 * Logs all interactions for parental monitoring.
 * 
 * Legal compliance: GDPR (EU), COPPA (US), Lei 13.859 (Brazil)
 */

import { getDb } from './db.js';
import { sql } from 'drizzle-orm';

// In-memory cache of blocked patterns (refreshed every 5 minutes)
let blockedPatternsCache: Array<{
  category: string;
  pattern: string;
  language_code: string;
  severity: string;
}> = [];
let lastCacheRefresh = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Refresh the blocked patterns cache from the database
 */
async function refreshBlockedPatternsCache(): Promise<void> {
  try {
    const now = Date.now();
    if (now - lastCacheRefresh < CACHE_TTL && blockedPatternsCache.length > 0) {
      return; // Cache still fresh
    }

    const db = await getDb();
    if (!db) throw new Error('Database not available');
    const result = await db.execute(sql`
      SELECT category, pattern, language_code, severity
      FROM content_filter_rules
      WHERE is_active = TRUE
    `);

    blockedPatternsCache = (result[0] as unknown as typeof blockedPatternsCache) || [];
    lastCacheRefresh = now;
  } catch (error) {
    console.error('[ContentFilter] Failed to refresh cache:', error);
    // Keep using existing cache if available
  }
}

/**
 * Check if text contains blocked content
 * Returns { isBlocked: boolean, matchedPatterns: string[], category: string | null }
 */
export async function checkContent(
  text: string,
  languageCode: string = 'all'
): Promise<{
  isBlocked: boolean;
  matchedPatterns: string[];
  category: string | null;
  severity: string | null;
}> {
  await refreshBlockedPatternsCache();

  const lowerText = text.toLowerCase();
  const matchedPatterns: string[] = [];
  let matchedCategory: string | null = null;
  let matchedSeverity: string | null = null;

  for (const rule of blockedPatternsCache) {
    // Check if rule applies to this language or is universal
    if (rule.language_code !== 'all' && rule.language_code !== languageCode) {
      continue;
    }

    const pattern = rule.pattern.toLowerCase();
    if (lowerText.includes(pattern)) {
      matchedPatterns.push(rule.pattern);
      matchedCategory = rule.category;
      matchedSeverity = rule.severity;
      
      // If severity is 'block', we can return immediately
      if (rule.severity === 'block') {
        return {
          isBlocked: true,
          matchedPatterns,
          category: matchedCategory,
          severity: matchedSeverity,
        };
      }
    }
  }

  return {
    isBlocked: matchedPatterns.length > 0,
    matchedPatterns,
    category: matchedCategory,
    severity: matchedSeverity,
  };
}

/**
 * Sanitize text by replacing blocked words with asterisks
 */
export async function sanitizeContent(
  text: string,
  languageCode: string = 'all'
): Promise<string> {
  await refreshBlockedPatternsCache();

  let sanitized = text;
  for (const rule of blockedPatternsCache) {
    if (rule.language_code !== 'all' && rule.language_code !== languageCode) {
      continue;
    }
    if (rule.severity !== 'block') continue;

    const pattern = rule.pattern;
    const regex = new RegExp(pattern, 'gi');
    sanitized = sanitized.replace(regex, '*'.repeat(pattern.length));
  }

  return sanitized;
}

/**
 * Log a teacher-student interaction
 */
export async function logInteraction(params: {
  userId: number;
  childProfileId?: number | null;
  teacherId?: number | null;
  interactionType: string;
  content: string;
  teacherResponse?: string | null;
  languageCode?: string;
}): Promise<void> {
  try {
    // Check content for blocked words
    const contentCheck = await checkContent(params.content, params.languageCode || 'all');
    const responseCheck = params.teacherResponse 
      ? await checkContent(params.teacherResponse, params.languageCode || 'all')
      : { isBlocked: false, category: null };

    const isFlagged = contentCheck.isBlocked || responseCheck.isBlocked;
    const flagReason = contentCheck.isBlocked 
      ? `User content: ${contentCheck.category}` 
      : responseCheck.isBlocked 
      ? `Teacher response: ${responseCheck.category}` 
      : null;

    const db = await getDb();
    if (!db) throw new Error('Database not available');
    await db.execute(sql`
      INSERT INTO interaction_logs 
        (user_id, child_profile_id, teacher_id, interaction_type, content, teacher_response, language_code, is_flagged, flag_reason)
      VALUES 
        (${params.userId}, ${params.childProfileId || null}, ${params.teacherId || null}, 
         ${params.interactionType}, ${params.content}, ${params.teacherResponse || null}, 
         ${params.languageCode || 'en'}, ${isFlagged}, ${flagReason})
    `);

    if (isFlagged) {
      console.warn(`[ContentFilter] Flagged interaction: ${flagReason}`);
      // Create a parental alert
      await db.execute(sql`
        INSERT INTO parental_alerts
          (user_id, child_profile_id, alert_type, severity, message)
        VALUES
          (${params.userId}, ${params.childProfileId || null}, 'inappropriate_content', 'high',
           ${`Conteúdo inadequado detectado em interação: ${flagReason}`})
      `);
    }
  } catch (error) {
    console.error('[ContentFilter] Failed to log interaction:', error);
    // Don't throw - logging is non-blocking
  }
}

/**
 * Get interaction history for parental monitoring
 */
export async function getInteractionHistory(
  userId: number,
  childProfileId?: number | null,
  limit: number = 50,
  offset: number = 0
): Promise<any[]> {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    if (childProfileId) {
      const result = await db.execute(sql`
        SELECT il.*, vt.name as teacher_name, vt.photo_url as teacher_photo
        FROM interaction_logs il
        LEFT JOIN virtual_teachers vt ON il.teacher_id = vt.id
        WHERE il.user_id = ${userId} AND il.child_profile_id = ${childProfileId}
        ORDER BY il.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `);
      return (result[0] as unknown as any[]) || [];
    } else {
      const result = await db.execute(sql`
        SELECT il.*, vt.name as teacher_name, vt.photo_url as teacher_photo
        FROM interaction_logs il
        LEFT JOIN virtual_teachers vt ON il.teacher_id = vt.id
        WHERE il.user_id = ${userId}
        ORDER BY il.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `);
      return (result[0] as unknown as any[]) || [];
    }
  } catch (error) {
    console.error('[ContentFilter] Failed to get interaction history:', error);
    return [];
  }
}

/**
 * Get flagged interactions count for parental alerts
 */
export async function getFlaggedCount(
  userId: number,
  childProfileId?: number | null
): Promise<number> {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    if (childProfileId) {
      const result = await db.execute(sql`
        SELECT COUNT(*) as count FROM interaction_logs
        WHERE user_id = ${userId} AND child_profile_id = ${childProfileId} AND is_flagged = TRUE
      `);
      const rows = result[0] as unknown as any[];
      return (rows?.[0] as any)?.count || 0;
    } else {
      const result = await db.execute(sql`
        SELECT COUNT(*) as count FROM interaction_logs
        WHERE user_id = ${userId} AND is_flagged = TRUE
      `);
      const rows = result[0] as unknown as any[];
      return (rows?.[0] as any)?.count || 0;
    }
  } catch (error) {
    console.error('[ContentFilter] Failed to get flagged count:', error);
    return 0;
  }
}

/**
 * Summarize interaction patterns using aggregate data only. Detailed message content
 * stays restricted to the protected interaction-history view.
 */
export async function getUsagePatterns(userId: number, childProfileId?: number): Promise<{
  totalInteractions: number;
  activeDays: number;
  flaggedInteractions: number;
  peakHour: number | null;
  topLanguages: Array<{ languageCode: string; count: number }>;
  topActivities: Array<{ interactionType: string; count: number }>;
}> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const childFilter = childProfileId ? sql` AND child_profile_id = ${childProfileId}` : sql``;
    const summaryResult = await db.execute(sql`
      SELECT COUNT(*) AS totalInteractions,
             COUNT(DISTINCT DATE(created_at)) AS activeDays,
             SUM(CASE WHEN is_flagged = TRUE THEN 1 ELSE 0 END) AS flaggedInteractions
      FROM interaction_logs WHERE user_id = ${userId}${childFilter}
    `);
    const languageResult = await db.execute(sql`
      SELECT language_code AS languageCode, COUNT(*) AS count
      FROM interaction_logs WHERE user_id = ${userId}${childFilter}
      GROUP BY language_code ORDER BY count DESC LIMIT 3
    `);
    const activityResult = await db.execute(sql`
      SELECT interaction_type AS interactionType, COUNT(*) AS count
      FROM interaction_logs WHERE user_id = ${userId}${childFilter}
      GROUP BY interaction_type ORDER BY count DESC LIMIT 3
    `);
    const hourlyResult = await db.execute(sql`
      SELECT HOUR(created_at) AS hour, COUNT(*) AS count
      FROM interaction_logs WHERE user_id = ${userId}${childFilter}
      GROUP BY HOUR(created_at) ORDER BY count DESC LIMIT 1
    `);
    const summary = ((summaryResult[0] as unknown as any[]) || [])[0] || {};
    const peak = ((hourlyResult[0] as unknown as any[]) || [])[0] || null;
    return {
      totalInteractions: Number(summary.totalInteractions || 0),
      activeDays: Number(summary.activeDays || 0),
      flaggedInteractions: Number(summary.flaggedInteractions || 0),
      peakHour: peak ? Number(peak.hour) : null,
      topLanguages: (((languageResult[0] as unknown as any[]) || [])).map((row) => ({ languageCode: String(row.languageCode || ""), count: Number(row.count || 0) })),
      topActivities: (((activityResult[0] as unknown as any[]) || [])).map((row) => ({ interactionType: String(row.interactionType || ""), count: Number(row.count || 0) })),
    };
  } catch (error) {
    console.error("[ContentFilter] Failed to analyze interaction patterns:", error);
    return { totalInteractions: 0, activeDays: 0, flaggedInteractions: 0, peakHour: null, topLanguages: [], topActivities: [] };
  }
}

/**
 * Age-based content restrictions based on country laws
 * - COPPA (US): Under 13 requires parental consent
 * - GDPR (EU): Under 16 requires parental consent (varies by member state)
 * - Lei 13.859 (Brazil): Content rating, parental consent for minors
 */
export function getAgeRestrictions(age: number, country: string = 'BR'): {
  requiresParentalConsent: boolean;
  maxDailyMinutes: number;
  allowedLevels: string[];
  contentRating: string;
} {
  // Default restrictions
  let restrictions = {
    requiresParentalConsent: false,
    maxDailyMinutes: 240, // 4 hours default
    allowedLevels: ['beginner', 'intermediate', 'advanced'],
    contentRating: 'all',
  };

  // COPPA (US) - Under 13
  if (country === 'US' && age < 13) {
    restrictions.requiresParentalConsent = true;
    restrictions.maxDailyMinutes = 120; // 2 hours
    restrictions.allowedLevels = ['beginner'];
    restrictions.contentRating = 'child';
  }

  // GDPR (EU) - Under 16
  if (['DE', 'FR', 'ES', 'IT', 'PT', 'NL', 'BE', 'AT', 'PL'].includes(country) && age < 16) {
    restrictions.requiresParentalConsent = true;
    restrictions.maxDailyMinutes = 120;
    restrictions.allowedLevels = ['beginner', 'intermediate'];
    restrictions.contentRating = 'teen';
  }

  // Lei 13.859 (Brazil) - Under 18
  if (country === 'BR' && age < 18) {
    restrictions.requiresParentalConsent = true;
    if (age < 12) {
      restrictions.maxDailyMinutes = 90; // 1.5 hours
      restrictions.allowedLevels = ['beginner'];
      restrictions.contentRating = 'child';
    } else if (age < 16) {
      restrictions.maxDailyMinutes = 120; // 2 hours
      restrictions.allowedLevels = ['beginner', 'intermediate'];
      restrictions.contentRating = 'teen';
    } else {
      restrictions.maxDailyMinutes = 180; // 3 hours
      restrictions.allowedLevels = ['beginner', 'intermediate', 'advanced'];
      restrictions.contentRating = 'teen';
    }
  }

  // General: under 7 always most restrictive
  if (age < 7) {
    restrictions.maxDailyMinutes = 60; // 1 hour
    restrictions.allowedLevels = ['beginner'];
    restrictions.contentRating = 'child';
  }

  return restrictions;
}

/**
 * Check if user has completed mandatory parental setup
 */
export async function hasParentalSetup(userId: number): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    const result = await db.execute(sql`
      SELECT COUNT(*) as count FROM parental_settings WHERE user_id = ${userId}
    `);
    const rows = result[0] as unknown as any[];
    return (((rows?.[0] as any)?.count || 0) > 0);
  } catch (error) {
    console.error('[ContentFilter] Failed to check parental setup:', error);
    return false;
  }
}
