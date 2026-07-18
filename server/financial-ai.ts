/**
 * IA de Análise Financeira
 * 
 * Analisa métricas financeiras e gera insights automáticos
 */

import { invokeLLM } from "./_core/llm";
import * as db from "./db";

/**
 * Analisar saúde financeira e gerar insights
 */
export async function analyzeFinancialHealth(month: number, year: number) {
  // Buscar dados financeiros
  const revenues = await db.listRevenues({ limit: 100 });
  const expenses = await db.listExpenses({ limit: 100 });
  const autoPayments = await db.listAutoPaymentConfigs(true);
  
  const totalRevenue = revenues.reduce((sum, rev) => sum + rev.netAmount, 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  
  // Calcular métricas
  const metrics = {
    totalRevenue: totalRevenue / 100, // Converter para reais
    totalExpenses: totalExpenses / 100,
    netProfit: netProfit / 100,
    profitMargin: totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(2) : 0,
    revenueCount: revenues.length,
    expenseCount: expenses.length,
    recurringExpenses: autoPayments.length,
    month,
    year,
  };
  
  // Prompt para IA
  const prompt = `Você é um analista financeiro especializado em SaaS e plataformas educacionais.

Analise os seguintes dados financeiros da plataforma MultiLingue (ensino de idiomas):

**Período:** ${month}/${year}

**Receitas:**
- Total: R$ ${metrics.totalRevenue.toFixed(2)}
- Transações: ${metrics.revenueCount}

**Despesas:**
- Total: R$ ${metrics.totalExpenses.toFixed(2)}
- Quantidade: ${metrics.expenseCount}
- Despesas recorrentes configuradas: ${metrics.recurringExpenses}

**Resultado:**
- Lucro Líquido: R$ ${metrics.netProfit.toFixed(2)}
- Margem de Lucro: ${metrics.profitMargin}%

**Forneça uma análise detalhada incluindo:**

1. **Avaliação da Saúde Financeira** (1-10)
2. **Principais Pontos Positivos**
3. **Principais Pontos de Atenção**
4. **Recomendações Específicas** (3-5 ações práticas)
5. **Previsões e Alertas** (tendências, riscos potenciais)

Seja direto, prático e focado em ações concretas.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "Você é um analista financeiro especializado em SaaS educacionais. Forneça análises práticas e acionáveis." },
        { role: "user", content: prompt }
      ],
    });

    const analysis = response.choices[0].message.content;
    
    return {
      metrics,
      analysis,
      generatedAt: new Date(),
    };
  } catch (error) {
    console.error("Erro ao gerar análise financeira:", error);
    return {
      metrics,
      analysis: "Erro ao gerar análise. Por favor, tente novamente.",
      generatedAt: new Date(),
    };
  }
}

/**
 * Gerar alertas automáticos
 */
export async function generateFinancialAlerts() {
  const expenses = await db.listExpenses({ status: "pending", limit: 100 });
  const autoPayments = await db.listAutoPaymentConfigs(true);
  
  const alerts: Array<{
    type: "warning" | "info" | "critical";
    title: string;
    message: string;
    actionRequired: boolean;
  }> = [];
  
  // Verificar despesas vencidas
  const now = new Date();
  const overdueExpenses = expenses.filter(exp => 
    exp.dueDate && new Date(exp.dueDate) < now
  );
  
  if (overdueExpenses.length > 0) {
    alerts.push({
      type: "critical",
      title: "Despesas Vencidas",
      message: `Você tem ${overdueExpenses.length} despesa(s) vencida(s) que precisam ser pagas.`,
      actionRequired: true,
    });
  }
  
  // Verificar pagamentos automáticos próximos
  const next7Days = new Date();
  next7Days.setDate(next7Days.getDate() + 7);
  
  const upcomingPayments = autoPayments.filter(payment => 
    payment.nextPaymentDate && 
    new Date(payment.nextPaymentDate) <= next7Days &&
    new Date(payment.nextPaymentDate) >= now
  );
  
  if (upcomingPayments.length > 0) {
    const totalAmount = upcomingPayments.reduce((sum, p) => sum + p.amount, 0);
    alerts.push({
      type: "info",
      title: "Pagamentos Automáticos Próximos",
      message: `${upcomingPayments.length} pagamento(s) automático(s) serão processados nos próximos 7 dias. Total: R$ ${(totalAmount / 100).toFixed(2)}`,
      actionRequired: false,
    });
  }
  
  // Verificar margem de lucro baixa
  const revenues = await db.listRevenues({ limit: 30 });
  const recentExpenses = await db.listExpenses({ limit: 30 });
  
  const totalRevenue = revenues.reduce((sum, rev) => sum + rev.netAmount, 0);
  const totalExpenses = recentExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  
  if (totalRevenue > 0) {
    const profitMargin = ((totalRevenue - totalExpenses) / totalRevenue) * 100;
    
    if (profitMargin < 20) {
      alerts.push({
        type: "warning",
        title: "Margem de Lucro Baixa",
        message: `Sua margem de lucro está em ${profitMargin.toFixed(1)}%. Considere revisar despesas ou aumentar receitas.`,
        actionRequired: true,
      });
    }
  }
  
  return alerts;
}

/**
 * Gerar recomendações de otimização fiscal
 */
export async function generateTaxOptimizationRecommendations(month: number, year: number) {
  const revenues = await db.listRevenues({ limit: 100 });
  const expenses = await db.listExpenses({ limit: 100 });
  
  const totalRevenue = revenues.reduce((sum, rev) => sum + rev.netAmount, 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  
  const prompt = `Como consultor fiscal especializado em empresas de tecnologia e SaaS no Brasil:

**Dados:**
- Receita mensal: R$ ${(totalRevenue / 100).toFixed(2)}
- Despesas mensais: R$ ${(totalExpenses / 100).toFixed(2)}
- Lucro: R$ ${((totalRevenue - totalExpenses) / 100).toFixed(2)}

**Forneça:**
1. Regime tributário mais vantajoso (Simples, Lucro Presumido, Lucro Real)
2. Deduções fiscais aplicáveis
3. Estratégias de otimização fiscal legais
4. Documentação necessária para IR
5. Prazos importantes

Seja específico para empresas de SaaS educacional no Brasil.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "Você é um consultor fiscal especializado em empresas de tecnologia no Brasil." },
        { role: "user", content: prompt }
      ],
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Erro ao gerar recomendações fiscais:", error);
    return "Erro ao gerar recomendações. Consulte um contador.";
  }
}

/**
 * Prever receita futura baseada em histórico
 */
export async function predictFutureRevenue(months: number = 3) {
  const revenues = await db.listRevenues({ limit: 365 }); // Último ano
  
  if (revenues.length < 3) {
    return {
      prediction: null,
      confidence: 0,
      message: "Dados insuficientes para previsão (mínimo 3 meses)",
    };
  }
  
  // Agrupar por mês
  const monthlyRevenue: { [key: string]: number } = {};
  
  revenues.forEach(rev => {
    if (rev.paidAt) {
      const date = new Date(rev.paidAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyRevenue[key] = (monthlyRevenue[key] || 0) + rev.netAmount;
    }
  });
  
  const monthlyValues = Object.values(monthlyRevenue);
  const avgRevenue = monthlyValues.reduce((sum, val) => sum + val, 0) / monthlyValues.length;
  
  // Calcular tendência (crescimento/decrescimento)
  const recentMonths = monthlyValues.slice(-3);
  const olderMonths = monthlyValues.slice(-6, -3);
  
  const recentAvg = recentMonths.reduce((sum, val) => sum + val, 0) / recentMonths.length;
  const olderAvg = olderMonths.length > 0 
    ? olderMonths.reduce((sum, val) => sum + val, 0) / olderMonths.length 
    : recentAvg;
  
  const growthRate = olderAvg > 0 ? (recentAvg - olderAvg) / olderAvg : 0;
  
  // Prever próximos meses
  const predictions = [];
  let currentPrediction = recentAvg;
  
  for (let i = 1; i <= months; i++) {
    currentPrediction = currentPrediction * (1 + growthRate);
    predictions.push({
      month: i,
      predictedRevenue: Math.round(currentPrediction),
      predictedRevenueFormatted: `R$ ${(currentPrediction / 100).toFixed(2)}`,
    });
  }
  
  return {
    predictions,
    avgMonthlyRevenue: Math.round(avgRevenue),
    growthRate: (growthRate * 100).toFixed(2) + "%",
    confidence: monthlyValues.length >= 6 ? "Alta" : "Média",
    dataPoints: monthlyValues.length,
  };
}
