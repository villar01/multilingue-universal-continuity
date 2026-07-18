/**
 * STRIPE PRODUCTS & PRICING
 * Preços em BRL (Real Brasileiro)
 * Mensal: R$59,90 | Anual: R$549,90 (≈ R$45,83/mês) | Vitalício: R$998,90 (1 ano e meio = 18 meses)
 * VALORES FIXOS - NÃO ALTERAR SEM AUTORIZAÇÃO
 */

export const PRODUCTS = {
  MONTHLY: {
    name: "Plano Premium Mensal",
    priceId: "price_monthly",
    amount: 5990, // R$ 59,90
    currency: "brl",
    interval: "month",
    installments: 1,
    features: [
      "Acesso ilimitado a todas as lições",
      "59 idiomas disponíveis",
      "Professores virtuais com IA",
      "Conversação com professores nativos",
      "Análise de pronúncia em tempo real",
      "Gamificação e badges",
      "Suporte prioritário"
    ]
  },
  ANNUAL: {
    name: "Plano Anual",
    priceId: "price_annual",
    amount: 54990, // R$ 549,90 (≈ R$45,83/mês — economize R$168,90 vs mensal)
    currency: "brl",
    interval: "year",
    installments: 12, // 12x de R$ 45,83
    installmentAmount: 4583,
    features: [
      "Tudo do plano mensal",
      "Economize R$168,90/ano vs mensal",
      "Acesso a novos recursos gratuitos",
      "Certificados de conclusão",
      "Download de lições offline",
      "Suporte VIP 24/7"
    ],
    savings: "Economize R$168,90/ano (≈ 3 meses grátis)"
  },
  LIFETIME: {
    name: "Plano Vitalício — 1 Ano e Meio",
    priceId: "price_lifetime",
    amount: 99890, // R$ 998,90 — pague uma vez, acesso vitalício (equivale a 1 ano e meio (18 meses))
    currency: "brl",
    interval: "one_time",
    installments: 12, // 12x de R$ 83,24
    installmentAmount: 8324,
    features: [
      "Acesso vitalício a todos os recursos",
      "Todos os 59 idiomas para sempre",
      "Atualizações gratuitas eternamente",
      "Suporte VIP prioritário",
      "Certificados ilimitados",
      "Sem mensalidades nunca mais",
      "Equivale a ~17 meses de mensalidades"
    ],
    savings: "Economize R$440,90 vs 24 meses de mensalidades"
  },
  FREE: {
    name: "Plano Gratuito",
    amount: 0,
    features: [
      "5 lições gratuitas",
      "1 idioma disponível",
      "Acesso básico às aulas",
      "Suporte por email"
    ]
  }
};

export const STRIPE_CONFIG = {
  successUrl: "/checkout/success",
  cancelUrl: "/pricing",
  allowPromotionCodes: true,
};
