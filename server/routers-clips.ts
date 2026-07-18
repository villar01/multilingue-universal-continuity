import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import {
  educationalClips,
  avatarVideos,
  clipInteractions,
  teacherProfiles,
  lipSyncData,
} from "../drizzle/schema";
import { eq, desc, and, inArray } from "drizzle-orm";

export const clipsRouter = router({
  // Get all clips with filtering
  getClips: publicProcedure
    .input(
      z.object({
        languageId: z.number().optional(),
        cefrLevel: z.string().optional(),
        category: z.string().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const conditions = [];
      if (input.languageId) conditions.push(eq(educationalClips.languageId, input.languageId));
      if (input.cefrLevel) conditions.push(eq(educationalClips.cefrLevel, input.cefrLevel as any));

      const clips = await db
        .select()
        .from(educationalClips)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(educationalClips.viewCount))
        .limit(input.limit)
        .offset(input.offset);

      return clips;
    }),

  // Get single clip with full details
  getClipById: publicProcedure
    .input(z.object({ clipId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const clip = await db
        .select()
        .from(educationalClips)
        .where(eq(educationalClips.id, input.clipId))
        .limit(1);

      if (!clip[0]) throw new Error("Clip not found");

      // Track view if user is authenticated
      if (ctx.user) {
        await (db.insert(clipInteractions) as any).values({
          clipId: input.clipId,
          userId: ctx.user.id,
          interactionType: "view",
        });

        // Update view count
        await db
          .update(educationalClips)
          .set({ viewCount: (clip[0].viewCount || 0) + 1 })
          .where(eq(educationalClips.id, input.clipId));
      }

      return clip[0];
    }),

  // Like a clip
  toggleLikeClip: protectedProcedure
    .input(z.object({ clipId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Check if already liked
      const existing = await db
        .select()
        .from(clipInteractions)
        .where(
          and(
            eq(clipInteractions.clipId, input.clipId),
            eq(clipInteractions.userId, ctx.user!.id),
            eq(clipInteractions.interactionType, "like")
          )
        )
        .limit(1);

      if (existing.length > 0) {
        // Unlike
        await db
          .update(educationalClips)
          .set({ likeCount: (await getClipLikes(input.clipId, db)) - 1 })
          .where(eq(educationalClips.id, input.clipId));

        return { liked: false };
      } else {
        // Like
        await (db.insert(clipInteractions) as any).values({
          clipId: input.clipId,
          userId: ctx.user!.id,
          interactionType: "like",
        });

        await db
          .update(educationalClips)
          .set({ likeCount: (await getClipLikes(input.clipId, db)) + 1 })
          .where(eq(educationalClips.id, input.clipId));

        return { liked: true };
      }
    }),

  // Get teacher profiles
  getTeachers: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    return await (db as any).select().from(teacherProfiles);
  }),

  // Get avatar videos for a lesson
  getAvatarVideos: publicProcedure
    .input(z.object({ clipId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      return await db
        .select()
        .from(avatarVideos)
        .where(eq(avatarVideos.clipId, input.clipId));
    }),

  // Get lip-sync data for avatar animation
  getLipSyncData: publicProcedure
    .input(z.object({ avatarVideoId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const data = await db
        .select()
        .from(lipSyncData)
        .where(eq(lipSyncData.avatarVideoId, input.avatarVideoId))
        .limit(1);

      return data[0] || null;
    }),

  // Get trending clips
  getTrendingClips: publicProcedure
    .input(z.object({ limit: z.number().default(20) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      return await db
        .select()
        .from(educationalClips)
        .orderBy(desc(educationalClips.likeCount))
        .limit(input.limit);
    }),

  // Search clips by keywords
  searchClips: publicProcedure
    .input(z.object({ query: z.string(), limit: z.number().default(20) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Simple keyword search (can be enhanced with full-text search)
      const clips = await db
        .select()
        .from(educationalClips)
        .limit(input.limit);

      return clips.filter((clip) => {
        return (
          clip.title?.toLowerCase().includes(input.query.toLowerCase()) ||
          clip.description?.toLowerCase().includes(input.query.toLowerCase())
        );
      });
    }),

  // Get recommended clips based on user progress
  getRecommendedClips: protectedProcedure
    .input(z.object({ limit: z.number().default(10) }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get user's current level and language
      const user = await db
        .select()
        .from(educationalClips)
        .limit(input.limit);

      return user;
    }),

  // Create avatar video (admin only)
  createAvatarVideo: protectedProcedure
    .input(
      z.object({
        lessonId: z.number(),
        teacherId: z.number(),
        script: z.string(),
        language: z.string(),
        avatarExpression: z.string().optional(),
        voiceProvider: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      if (ctx.user?.role !== "admin") {
        throw new Error("Only admins can create avatar videos");
      }

      const result = await (db as any).insert(avatarVideos).values({
        teacherId: input.teacherId,
        script: input.script,
        language: input.language,
        avatarExpression: input.avatarExpression || "neutral",
        voiceProvider: input.voiceProvider || "elevenlabs",
      });

      return {
        success: true,
        videoId: (result as any).insertId || 0,
      };
    }),

  // Add clip interaction (bookmark, share, etc.)
  addClipInteraction: protectedProcedure
    .input(
      z.object({
        clipId: z.number(),
        interactionType: z.enum(["view", "like", "share", "bookmark"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await (db.insert(clipInteractions) as any).values({
        clipId: input.clipId,
        userId: ctx.user!.id,
        interactionType: input.interactionType,
      });

      return { success: true };
    }),

  // Get user's clip history
  getUserClipHistory: protectedProcedure
    .input(z.object({ limit: z.number().default(20) }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const interactions = await db
        .select()
        .from(clipInteractions)
        .where(
          and(
            eq(clipInteractions.userId, ctx.user!.id),
            eq(clipInteractions.interactionType, "view")
          )
        )
        .orderBy(desc(clipInteractions.createdAt))
        .limit(input.limit);

      const clipIds = interactions.map((i) => i.clipId);
      if (clipIds.length === 0) return [];

      return await db
        .select()
        .from(educationalClips)
        .where(inArray(educationalClips.id, clipIds));
    }),
});

// Helper function
async function getClipLikes(clipId: number, db: any): Promise<number> {
  const result = await db
    .select()
    .from(educationalClips)
    .where(eq(educationalClips.id, clipId))
    .limit(1);

  return result[0]?.likeCount || 0;
}
