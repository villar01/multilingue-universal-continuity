import { getDb } from './db';
import { sql } from 'drizzle-orm';
import { TRPCError } from "@trpc/server";

export interface CertificateData {
  studentName: string;
  languageName: string;
  completionDate: Date;
  totalLessons: number;
  completedLessons: number;
  certificateId: string;
}

export async function generateCertificate(userId: number, languageCode: string): Promise<CertificateData> {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

  // Buscar dados do usuário
  const userRows = await db.execute(sql`SELECT name, email FROM user WHERE id = ${userId}`);
  const userArr = (userRows as any).rows ?? userRows;
  if (!userArr || (userArr as any[]).length === 0) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Usuário não encontrado" });
  }
  const user = (userArr as any[])[0];

  // Buscar idioma
  const langRows = await db.execute(sql`SELECT name FROM languages WHERE code = ${languageCode}`);
  const langArr = (langRows as any).rows ?? langRows;
  if (!langArr || (langArr as any[]).length === 0) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Idioma não encontrado" });
  }
  const language = (langArr as any[])[0];

  // Buscar progresso do usuário
  const progressRows = await db.execute(sql`SELECT COUNT(DISTINCT lesson_id) as completed FROM user_progress WHERE user_id = ${userId} AND completed = 1`);
  const progressArr = (progressRows as any).rows ?? progressRows;
  const completedLessons = progressArr && (progressArr as any[]).length > 0
    ? (progressArr as any[])[0].completed
    : 0;

  // Buscar total de lições do idioma
  const totalRows = await db.execute(sql`SELECT COUNT(*) as total FROM lessons WHERE languageCode = ${languageCode}`);
  const totalArr = (totalRows as any).rows ?? totalRows;
  const totalLessons = totalArr && (totalArr as any[]).length > 0
    ? (totalArr as any[])[0].total
    : 0;

  // Verificar se completou pelo menos 80%
  const completionPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
  if (completionPercentage < 80) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `Complete pelo menos 80% das lições para obter o certificado. Progresso atual: ${Math.round(completionPercentage)}%`
    });
  }

  return {
    studentName: user.name || "Estudante",
    languageName: language.name || languageCode,
    completionDate: new Date(),
    totalLessons: Number(totalLessons),
    completedLessons: Number(completedLessons),
    certificateId: `CERT-${userId}-${languageCode.toUpperCase()}-${Date.now()}`,
  };
}
