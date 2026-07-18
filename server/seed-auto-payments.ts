/**
 * SEED: Configurações de Pagamentos Automáticos
 * 
 * Configura despesas recorrentes automáticas (DigitalOcean, PagBank, domínio, etc)
 */

import { drizzle } from "drizzle-orm/mysql2";
import { autoPaymentConfigs, expenses } from "../drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

const autoPaymentsData = [
  {
    provider: "DigitalOcean",
    description: "Hospedagem de servidor (Droplet + Banco de dados)",
    amount: 12000, // R$ 120,00 em centavos
    currency: "BRL",
    frequency: "monthly" as const,
    dayOfMonth: 1,
    paymentMethod: "credit_card",
    paymentDetails: {
      note: "Pagamento automático via cartão cadastrado no DigitalOcean"
    },
    isActive: true,
    notifyBeforeDays: 3,
  },
  {
    provider: "PagBank",
    description: "Taxas de transação PagBank (estimativa mensal)",
    amount: 5000, // R$ 50,00 estimado
    currency: "BRL",
    frequency: "monthly" as const,
    dayOfMonth: 5,
    paymentMethod: "automatic_deduction",
    paymentDetails: {
      note: "Dedução automática das transações processadas"
    },
    isActive: true,
    notifyBeforeDays: 3,
  },
  {
    provider: "Registro.br",
    description: "Renovação de domínio multilingue.com.br",
    amount: 4000, // R$ 40,00 por ano
    currency: "BRL",
    frequency: "yearly" as const,
    dayOfMonth: 15,
    paymentMethod: "credit_card",
    paymentDetails: {
      note: "Renovação anual automática do domínio"
    },
    isActive: true,
    notifyBeforeDays: 30, // Notificar 30 dias antes
  },
];

async function seedAutoPayments() {
  console.log("💳 Iniciando configuração de pagamentos automáticos...\n");

  try {
    for (const paymentConfig of autoPaymentsData) {
      // Criar despesa recorrente correspondente
      const [expense] = await db.insert(expenses).values({
        category: paymentConfig.provider === "DigitalOcean" ? "hosting" :
                  paymentConfig.provider === "PagBank" ? "payment_gateway" :
                  "domain",
        description: paymentConfig.description,
        provider: paymentConfig.provider,
        amount: paymentConfig.amount,
        currency: paymentConfig.currency,
        isRecurring: true,
        recurringFrequency: paymentConfig.frequency,
        autoPayEnabled: true,
        paymentMethod: paymentConfig.paymentMethod,
        status: "pending",
        nextDueDate: new Date(new Date().setDate(paymentConfig.dayOfMonth)),
      }).$returningId();

      // Criar configuração de pagamento automático
      const nextPaymentDate = new Date();
      if (paymentConfig.frequency === "monthly") {
        nextPaymentDate.setDate(paymentConfig.dayOfMonth);
        if (nextPaymentDate < new Date()) {
          nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
        }
      } else if (paymentConfig.frequency === "yearly") {
        nextPaymentDate.setDate(paymentConfig.dayOfMonth);
        if (nextPaymentDate < new Date()) {
          nextPaymentDate.setFullYear(nextPaymentDate.getFullYear() + 1);
        }
      }

      await db.insert(autoPaymentConfigs).values({
        expenseId: expense.id,
        provider: paymentConfig.provider,
        description: paymentConfig.description,
        amount: paymentConfig.amount,
        currency: paymentConfig.currency,
        frequency: paymentConfig.frequency,
        dayOfMonth: paymentConfig.dayOfMonth,
        paymentMethod: paymentConfig.paymentMethod,
        paymentDetails: paymentConfig.paymentDetails,
        isActive: paymentConfig.isActive,
        nextPaymentDate,
        notifyBeforeDays: paymentConfig.notifyBeforeDays,
      });

      console.log(`✅ Configurado: ${paymentConfig.provider} - ${paymentConfig.description}`);
      console.log(`   Valor: R$ ${(paymentConfig.amount / 100).toFixed(2)}`);
      console.log(`   Frequência: ${paymentConfig.frequency}`);
      console.log(`   Próximo pagamento: ${nextPaymentDate.toLocaleDateString('pt-BR')}\n`);
    }

    console.log(`\n🎉 Configuração concluída!`);
    console.log(`   ✅ ${autoPaymentsData.length} pagamentos automáticos configurados`);

  } catch (error) {
    console.error("❌ Erro ao configurar pagamentos automáticos:", error);
    throw error;
  }
}

// Executar seed
seedAutoPayments()
  .then(() => {
    console.log("\n✅ Processo finalizado com sucesso!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Erro fatal:", error);
    process.exit(1);
  });
