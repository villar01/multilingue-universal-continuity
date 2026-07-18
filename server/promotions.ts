/**
 * SISTEMA DE PROMOÇÕES AUTOMÁTICO
 * Ativa descontos baseado em volume de vendas
 */

interface PromotionRule {
  minSales: number;
  discount: number; // percentual
  code: string;
  description: string;
}

export const PROMOTION_RULES: PromotionRule[] = [
  { minSales: 100, discount: 10, code: "EARLY100", description: "10% OFF - Primeiros 100 clientes" },
  { minSales: 500, discount: 15, code: "GROWTH500", description: "15% OFF - 500 vendas alcançadas!" },
  { minSales: 1000, discount: 20, code: "MILESTONE1K", description: "20% OFF - 1000 clientes!" },
  { minSales: 5000, discount: 25, code: "VIRAL5K", description: "25% OFF - 5000 alunos!" },
  { minSales: 10000, discount: 30, code: "MEGA10K", description: "30% OFF - 10K celebração!" },
];

export function getActivePromotion(totalSales: number): PromotionRule | null {
  // Retorna a maior promoção ativa baseada nas vendas
  const activePromotions = PROMOTION_RULES.filter(rule => totalSales >= rule.minSales);
  return activePromotions.length > 0 
    ? activePromotions[activePromotions.length - 1] 
    : null;
}

export function calculateDiscountedPrice(originalPrice: number, discount: number): number {
  return Math.round(originalPrice * (1 - discount / 100));
}

// Promoções especiais por data
export function getSeasonalPromotion(): { code: string; discount: number; description: string } | null {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  
  // Black Friday (Novembro)
  if (month === 11 && day >= 20 && day <= 30) {
    return { code: "BLACKFRIDAY", discount: 40, description: "Black Friday - 40% OFF!" };
  }
  
  // Cyber Monday (primeira segunda após Black Friday)
  if (month === 12 && day >= 1 && day <= 5) {
    return { code: "CYBERMONDAY", discount: 35, description: "Cyber Monday - 35% OFF!" };
  }
  
  // Ano Novo
  if ((month === 12 && day >= 26) || (month === 1 && day <= 7)) {
    return { code: "NEWYEAR", discount: 30, description: "Ano Novo - 30% OFF!" };
  }
  
  // Volta às Aulas (Janeiro-Fevereiro)
  if ((month === 1 && day >= 15) || (month === 2 && day <= 15)) {
    return { code: "BACKTOSCHOOL", discount: 25, description: "Volta às Aulas - 25% OFF!" };
  }
  
  return null;
}
