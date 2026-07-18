import { drizzle } from "drizzle-orm/mysql2";
import { languages } from "./drizzle/schema.ts";

const db = drizzle(process.env.DATABASE_URL);

const multiLanguages = [
  { code: "multi-af", name: "Africa Ocidental", nativeName: "West Africa", flag: "🌍" },
  { code: "multi-am", name: "Americas Indigenas", nativeName: "Indigenous Americas", flag: "🌎" },
  { code: "multi-ac", name: "Africa Central", nativeName: "Central Africa", flag: "🌍" },
  { code: "multi-as", name: "Asia do Sul", nativeName: "South Asia", flag: "🌏" },
  { code: "multi-om", name: "Oriente Medio", nativeName: "Middle East", flag: "🌏" },
  { code: "multi-en", name: "Europa Nordica", nativeName: "Nordic Europe", flag: "🌍" },
];

async function seedMultiLanguages() {
  console.log("Inserindo idiomas multi...");
  for (const lang of multiLanguages) {
    try {
      await db.insert(languages).values({
        code: lang.code,
        name: lang.name,
        nativeName: lang.nativeName,
        flag: lang.flag,
        isActive: true,
      });
      console.log(`✅ ${lang.code} inserido`);
    } catch (e) {
      console.log(`⚠️  ${lang.code} já existe`);
    }
  }
  console.log("Concluído!");
}

seedMultiLanguages().catch(console.error);
