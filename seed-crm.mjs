#!/usr/bin/env node
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./drizzle/schema.ts";

const pool = mysql.createPool(process.env.DATABASE_URL);
const db = drizzle(pool, { schema, mode: 'default' });

async function seedCRM() {
  console.log("🌱 Populando dados demo do CRM...");

  try {
    // Inserir contatos
    const contacts = [
      { name: "João Silva", email: "joao@empresa.com", phone: "+55 11 98765-4321", company: "Tech Solutions", targetLanguage: "English", segment: "professional", status: "qualified" },
      { name: "Maria Santos", email: "maria@startup.com", phone: "+55 21 99876-5432", company: "StartUp Brasil", targetLanguage: "Spanish", segment: "student", status: "customer" },
      { name: "Carlos Oliveira", email: "carlos@corp.com", phone: "+55 31 97654-3210", company: "Corporação XYZ", targetLanguage: "French", segment: "company", status: "customer" },
      { name: "Ana Costa", email: "ana@freelance.com", phone: "+55 85 98765-1234", company: "Freelancer", targetLanguage: "German", segment: "individual", status: "new" },
      { name: "Pedro Martins", email: "pedro@empresa.com", phone: "+55 47 99876-6789", company: "Empresa ABC", targetLanguage: "Italian", segment: "professional", status: "qualified" },
    ];

    for (const contact of contacts) {
      await db.insert(schema.crmContacts).values(contact);
    }
    console.log("✅ Contatos inseridos");

    // Inserir deals
    const deals = [
      { contactId: 1, title: "Pacote Premium - João Silva", value: 29990, currency: "BRL", stage: "proposal", probability: 75, expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
      { contactId: 2, title: "Plano Anual - Maria Santos", value: 120000, currency: "BRL", stage: "won", probability: 100, expectedCloseDate: new Date() },
      { contactId: 3, title: "Licença Corporativa - Carlos", value: 500000, currency: "BRL", stage: "proposal", probability: 60, expectedCloseDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000) },
      { contactId: 4, title: "Trial - Ana Costa", value: 0, currency: "BRL", stage: "lead", probability: 30, expectedCloseDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) },
      { contactId: 5, title: "Pacote Trimestral - Pedro", value: 59990, currency: "BRL", stage: "won", probability: 100, expectedCloseDate: new Date() },
    ];

    for (const deal of deals) {
      await db.insert(schema.crmDeals).values(deal);
    }
    console.log("✅ Deals inseridos");

    // Inserir atividades
    const activities = [
      { contactId: 1, type: "call", title: "Ligação inicial", description: "Interesse em pacote premium", status: "completed", scheduledAt: new Date() },
      { contactId: 2, type: "email", title: "Proposta comercial", description: "Envio de proposta", status: "completed", scheduledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      { contactId: 3, type: "meeting", title: "Reunião com decisor", description: "Licença corporativa", status: "pending", scheduledAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) },
      { contactId: 4, type: "email", title: "Link de trial", description: "Envio de link de trial", status: "completed", scheduledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { contactId: 5, type: "call", title: "Follow-up pós-venda", description: "Verificar satisfação", status: "pending", scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
    ];

    for (const activity of activities) {
      await db.insert(schema.crmActivities).values(activity);
    }
    console.log("✅ Atividades inseridas");

    // Inserir metas de vendas
    const targets = [
      { period: "monthly", year: 2026, month: 4, revenueTarget: 1000000, leadsTarget: 10, dealsTarget: 5, conversionsTarget: 2 },
      { period: "quarterly", year: 2026, quarter: 2, revenueTarget: 3000000, leadsTarget: 30, dealsTarget: 15, conversionsTarget: 6 },
    ];

    for (const target of targets) {
      await db.insert(schema.salesTargets).values(target);
    }
    console.log("✅ Metas inseridas");

    console.log("✨ CRM demo data populado com sucesso!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Erro:", err.message);
    process.exit(1);
  }
}

seedCRM();
