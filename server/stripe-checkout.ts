import Stripe from "stripe";
import { PRODUCTS } from "./products";

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured. Please set it in your environment.");
  }
  return new Stripe(key, { apiVersion: "2025-12-15.clover" });
}

export async function createCheckoutSession(
  plan: "MONTHLY" | "ANNUAL" | "LIFETIME",
  userId: string,
  userEmail: string,
  userName: string,
  origin: string
) {
  const stripe = getStripe();
  const product = PRODUCTS[plan];

  // Plano Vitalício é pagamento único (one_time), não assinatura
  const isOneTime = plan === "LIFETIME";

  const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = isOneTime
    ? {
        price_data: {
          currency: product.currency,
          product_data: {
            name: product.name,
            description: `MultiLingue Universal — ${product.name} (1 ano e meio de acesso (vitalício))`,
          },
          unit_amount: product.amount,
        },
        quantity: 1,
      }
    : {
        price_data: {
          currency: product.currency,
          product_data: {
            name: product.name,
            description: `MultiLingue Universal — ${product.name}`,
          },
          unit_amount: product.amount,
          recurring: {
            interval: product.interval as "month" | "year",
          },
        },
        quantity: 1,
      };

  const session = await stripe.checkout.sessions.create({
    mode: isOneTime ? "payment" : "subscription",
    payment_method_types: ["card"],
    line_items: [lineItem],
    customer_email: userEmail,
    client_reference_id: userId,
    metadata: {
      user_id: userId,
      customer_email: userEmail,
      customer_name: userName,
      plan: plan,
    },
    allow_promotion_codes: true,
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/pricing`,
  });

  return session.url;
}
