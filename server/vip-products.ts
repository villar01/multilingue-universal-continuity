/**
 * VIP PRODUCTS - Planos Premium e VIP
 * Premium: R$ 59,00/mês - Acesso total a lições gerais
 * VIP: R$ 119,90/mês - Acesso a especializações profissionais (negócios/trading/científico)
 * VALORES FIXOS - NÃO ALTERAR SEM AUTORIZAÇÃO
 */

export const VIP_PRODUCTS = {
  premium_monthly: {
    name: "Premium Mensal",
    description: "Acesso total a 200 lições por idioma em 57 idiomas",
    price: 5900, // R$ 59,00 em centavos
    currency: "BRL",
    interval: "month" as const,
    tier: "premium" as const,
    features: [
      "200 lições completas por idioma",
      "57 idiomas disponíveis",
      "Voz natural ultra-realista",
      "Análise de pronúncia em tempo real",
      "Professor virtual 3D animado",
      "Exercícios interativos ilimitados",
      "Progresso sincronizado",
      "Sem anúncios",
    ],
  },
  
  vip_monthly: {
    name: "VIP Mensal",
    description: "Acesso Premium + Especializações Profissionais (Negócios, Trading, Científico)",
    price: 11990, // R$ 119,90 em centavos
    currency: "BRL",
    interval: "month" as const,
    tier: "vip" as const,
    features: [
      "✨ Tudo do Premium",
      "📊 Especialização em Negócios (reuniões, apresentações, e-mails corporativos, networking)",
      "💹 Especialização em Trading/Finanças (terminologia financeira, análise técnica, relatórios, mercado)",
      "🔬 Especialização em Científico (artigos acadêmicos, terminologia técnica, pesquisa, publicações)",
      "🎯 Conteúdo C1-C2 avançado",
      "👨‍🏫 Tutor IA personalizado para sua área",
      "📈 Análise de performance profissional",
      "🏆 Certificado de conclusão",
    ],
  },
  
  premium_annual: {
    name: "Premium Anual",
    description: "Plano Premium anual — pague 10 meses, use 12 (2 meses grátis)",
    price: 59000, // R$ 590,00 (R$ 59,00 × 10 meses) em centavos
    currency: "BRL",
    interval: "year" as const,
    tier: "premium" as const,
    features: [
      "✨ Tudo do Premium Mensal",
      "💰 2 meses grátis (pague 10, use 12)",
      "🎁 Economia de R$ 118,00/ano",
    ],
  },
  
  vip_annual: {
    name: "VIP Anual",
    description: "Plano VIP anual com 2 meses grátis",
    price: 119000, // R$ 1.190,00 (R$ 119,90 × 10 meses) em centavos
    currency: "BRL",
    interval: "year" as const,
    tier: "vip" as const,
    features: [
      "✨ Tudo do VIP Mensal",
      "💰 2 meses grátis (pague 10, use 12)",
      "🎁 Economia de R$ 239,80/ano",
    ],
  },
} as const;

export type SubscriptionTier = "free" | "premium" | "vip";
export type ProductKey = keyof typeof VIP_PRODUCTS;

/**
 * Verifica se usuário tem acesso a especialização
 */
export function hasSpecializationAccess(userTier: SubscriptionTier, specialization: string): boolean {
  if (userTier === "vip") return true; // VIP tem acesso a tudo
  if (specialization === "general") return true; // Todos têm acesso a conteúdo geral
  return false; // Premium e Free não têm acesso a especializações
}

/**
 * Retorna tier necessário para acessar especialização
 */
export function getRequiredTier(specialization: string): SubscriptionTier {
  if (specialization === "general") return "free";
  return "vip"; // negócios, trading, científico requerem VIP
}
