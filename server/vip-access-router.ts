import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { VIP_PRODUCTS, hasSpecializationAccess, getRequiredTier, type SubscriptionTier } from "./vip-products";
import Stripe from "stripe";

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not configured");
  return new Stripe(key, { apiVersion: "2025-12-15.clover" });
}

export const vipAccessRouter = router({
  /**
   * Verifica se usuário tem acesso a especialização
   */
  checkAccess: protectedProcedure
    .input(z.object({
      specialization: z.enum(["general", "business", "trading", "scientific"]),
    }))
    .query(async ({ ctx, input }) => {
      const db = await import("./db").then(m => m.getDb());
      if (!db) throw new Error("Database not available");
      
      const [user] = await db.select({ subscriptionTier: users.subscriptionTier })
        .from(users)
        .where(eq(users.id, ctx.user.id));
      
      const userTier = user?.subscriptionTier || "free";
      const hasAccess = hasSpecializationAccess(userTier, input.specialization);
      const requiredTier = getRequiredTier(input.specialization);
      
      return {
        hasAccess,
        userTier,
        requiredTier,
        isLocked: !hasAccess,
      };
    }),
  
  /**
   * Lista produtos VIP disponíveis
   */
  listProducts: publicProcedure
    .query(() => {
      return Object.entries(VIP_PRODUCTS).map(([key, product]) => ({
        key,
        ...product,
      }));
    }),
  
  /**
   * Cria checkout session para upgrade VIP
   */
  createCheckoutSession: protectedProcedure
    .input(z.object({
      productKey: z.enum(["premium_monthly", "premium_annual", "vip_monthly", "vip_annual"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const product = VIP_PRODUCTS[input.productKey];
      
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: product.currency.toLowerCase(),
              product_data: {
                name: product.name,
                description: product.description,
              },
              unit_amount: product.price,
              recurring: {
                interval: product.interval,
              },
            },
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${ctx.req.headers.origin}/dashboard?upgrade=success`,
        cancel_url: `${ctx.req.headers.origin}/upgrade?canceled=true`,
        customer_email: ctx.user.email || undefined,
        client_reference_id: ctx.user.id.toString(),
        metadata: {
          user_id: ctx.user.id.toString(),
          customer_email: ctx.user.email || "",
          customer_name: ctx.user.name || "",
          subscription_tier: product.tier,
          product_key: input.productKey,
        },
        allow_promotion_codes: true,
      });
      
      return {
        sessionId: session.id,
        url: session.url,
      };
    }),
  
  /**
   * Atualiza tier do usuário (chamado pelo webhook Stripe)
   */
  updateUserTier: protectedProcedure
    .input(z.object({
      userId: z.number(),
      tier: z.enum(["free", "premium", "vip"]),
    }))
    .mutation(async ({ input }) => {
      const db = await import("./db").then(m => m.getDb());
      if (!db) throw new Error("Database not available");
      
      await db.update(users)
        .set({ subscriptionTier: input.tier })
        .where(eq(users.id, input.userId));
      
      return { success: true };
    }),
  
  /**
   * Retorna estatísticas de upgrade
   */
  getUpgradeStats: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await import("./db").then(m => m.getDb());
      if (!db) throw new Error("Database not available");
      
      const [user] = await db.select({
        subscriptionTier: users.subscriptionTier,
        subscriptionType: users.subscriptionType,
      })
        .from(users)
        .where(eq(users.id, ctx.user.id));
      
      const tier = user?.subscriptionTier || "free";
      const type = user?.subscriptionType || "free";
      
      // Calcular economia anual
      const monthlyPrice = tier === "vip" ? 9990 : 3990;
      const annualPrice = tier === "vip" ? 95904 : 38304;
      const savings = (monthlyPrice * 12) - annualPrice;
      
      return {
        currentTier: tier,
        currentType: type,
        canUpgrade: tier !== "vip",
        savings: savings / 100, // converter para reais
      };
    }),
});
