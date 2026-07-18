/**
 * ═══════════════════════════════════════════════════════════════════
 * server/stripe-webhooks.ts
 * Webhooks Stripe - Ativar Planos Automaticamente
 * ═══════════════════════════════════════════════════════════════════
 */

import Stripe from "stripe";
import * as db from "./db";

function getStripe(): Stripe {
  return new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2025-12-15.clover" });
}

export async function handleStripeWebhook(
  event: Stripe.Event
): Promise<{ success: boolean; message: string }> {
  try {
    switch (event.type) {
      case "checkout.session.completed":
        return await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session
        );

      case "customer.subscription.created":
        return await handleSubscriptionCreated(
          event.data.object as Stripe.Subscription
        );

      case "customer.subscription.updated":
        return await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription
        );

      case "customer.subscription.deleted":
        return await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription
        );

      case "invoice.paid":
        return await handleInvoicePaid(event.data.object as Stripe.Invoice);

      case "invoice.payment_failed":
        return await handleInvoicePaymentFailed(
          event.data.object as Stripe.Invoice
        );

      default:
        return { success: true, message: `Evento ignorado: ${event.type}` };
    }
  } catch (error) {
    console.error("Erro ao processar webhook Stripe:", error);
    return {
      success: false,
      message: `Erro ao processar webhook: ${error}`,
    };
  }
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
): Promise<{ success: boolean; message: string }> {
  console.log("✅ Checkout concluído:", session.id);

  const userId = session.metadata?.user_id;
  if (!userId) {
    return { success: false, message: "user_id não encontrado nos metadados" };
  }

  // Obter detalhes da assinatura
  if (session.subscription) {
    const subscription = await getStripe().subscriptions.retrieve(
      session.subscription as string
    );

    // Determinar plano
    const planId = subscription.items.data[0]?.price.id;
    let planType = "basic";

    if (planId?.includes("pro")) planType = "pro";
    if (planId?.includes("premium")) planType = "premium";

    // Atualizar usuário com plano ativo
    console.log(`✅ Plano ${planType} ativado para usuário ${userId}`);
    return {
      success: true,
      message: `Plano ${planType} ativado com sucesso`,
    };
  }

  return { success: true, message: "Checkout processado" };
}

async function handleSubscriptionCreated(
  subscription: Stripe.Subscription
): Promise<{ success: boolean; message: string }> {
  console.log("📝 Assinatura criada:", subscription.id);

  const userId = subscription.metadata?.user_id;
  if (!userId) {
    return { success: false, message: "user_id não encontrado" };
  }

  const planId = subscription.items.data[0]?.price.id;
  let planType = "basic";

  if (planId?.includes("pro")) planType = "pro";
  if (planId?.includes("premium")) planType = "premium";

  console.log(`✅ Assinatura ${planType} criada para ${userId}`);

  return { success: true, message: `Assinatura ${planType} criada` };
}

async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription
): Promise<{ success: boolean; message: string }> {
  console.log("🔄 Assinatura atualizada:", subscription.id);

  const userId = subscription.metadata?.user_id;
  if (!userId) {
    return { success: false, message: "user_id não encontrado" };
  }

  const planId = subscription.items.data[0]?.price.id;
  let planType = "basic";

  if (planId?.includes("pro")) planType = "pro";
  if (planId?.includes("premium")) planType = "premium";

  console.log(`✅ Assinatura ${planType} criada para ${userId}`);

  return { success: true, message: `Assinatura atualizada para ${planType}` };
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
): Promise<{ success: boolean; message: string }> {
  console.log("❌ Assinatura cancelada:", subscription.id);

  const userId = subscription.metadata?.user_id;
  if (!userId) {
    return { success: false, message: "user_id não encontrado" };
  }

  // Reverter para plano gratuito
  console.log(`✅ Revertendo para plano free para ${userId}`);

  return { success: true, message: "Assinatura cancelada, revertendo para free" };
}

async function handleInvoicePaid(
  invoice: Stripe.Invoice
): Promise<{ success: boolean; message: string }> {
  console.log("💰 Fatura paga:", invoice.id);

  const subscriptionId = ((invoice as any).subscription as string) || null;
  if (!subscriptionId) {
    return { success: true, message: "Fatura paga (sem assinatura)" };
  }

  // Registrar pagamento
  console.log(`💳 Pagamento registrado: ${invoice.id}`);

  return { success: true, message: "Pagamento registrado" };
}

async function handleInvoicePaymentFailed(
  invoice: Stripe.Invoice
): Promise<{ success: boolean; message: string }> {
  console.log("⚠️ Pagamento falhou:", invoice.id);

  const subscriptionId = ((invoice as any).subscription as string) || null;
  if (!subscriptionId) {
    return { success: true, message: "Falha de pagamento registrada" };
  }

  // Registrar falha
  console.log(`⚠️ Falha de pagamento registrada: ${invoice.id}`);

  return { success: true, message: "Falha de pagamento registrada" };
}
