#!/usr/bin/env node
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./drizzle/schema.ts";

const pool = mysql.createPool(process.env.DATABASE_URL);
const db = drizzle(pool, { schema, mode: 'default' });

async function checkCRM() {
  try {
    const contacts = await db.select().from(schema.crmContacts);
    console.log(`✅ Contatos: ${contacts.length}`);
    contacts.forEach(c => console.log(`   - ${c.name} (${c.email})`));

    const deals = await db.select().from(schema.crmDeals);
    console.log(`✅ Deals: ${deals.length}`);

    const activities = await db.select().from(schema.crmActivities);
    console.log(`✅ Atividades: ${activities.length}`);

    const targets = await db.select().from(schema.salesTargets);
    console.log(`✅ Metas: ${targets.length}`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Erro:", err.message);
    process.exit(1);
  }
}

checkCRM();
