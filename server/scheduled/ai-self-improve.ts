/**
 * IA de Autoaperfeiçoamento — MultiLingue Universal
 * Analisa telemetria do app, detecta padrões de erro e gera insights com LLM.
 * Roda diariamente via cron (Heartbeat) e também pode ser acionado manualmente.
 * 
 * SEGURANÇA: Nunca aplica mudanças críticas automaticamente.
 * Mudanças de segurança, autenticação ou dados sensíveis são apresentadas ao admin para aprovação.
 */

import { getDb } from "../db";
import { generateAI } from "../aiProvider";
import { notifyOwner } from "../_core/notification";
import { createScheduledMaintenanceAssessment } from "../../shared/continuousMaintenanceContract";

interface TelemetryRow {
  event_type: string;
  context: string | null;
  count: number;
}

function extractTelemetryRows(result: unknown): TelemetryRow[] {
  const rows = Array.isArray(result) && Array.isArray(result[0]) ? result[0] : result;
  return Array.isArray(rows) ? rows as TelemetryRow[] : [];
}

function extractInsertId(result: unknown): number {
  const header = Array.isArray(result) ? result[0] : result;
  const insertId = (header as { insertId?: unknown } | undefined)?.insertId;
  return typeof insertId === "number" ? insertId : 0;
}

export async function runAISelfImprove(): Promise<{ success: boolean; message: string; insightId?: number }> {
  const db = await getDb();
  const today = new Date().toISOString().split("T")[0];
  if (!db) return { success: false, message: "Banco de dados não disponível." };
  // O adaptador pode expor um pool MySQL de callback ou um cliente de Promise.
  // Ambos são aceitos; o resultado é normalizado antes de ser consumido.
  const client = db.$client as any;
  const pool = typeof client.promise === "function" ? client.promise() : client;
  const maintenanceAssessment = createScheduledMaintenanceAssessment();

  try {
    // 1. Coletar telemetria das últimas 24h
    const telemetryResult = await pool.execute(`
      SELECT 
        event_type,
        context,
        COUNT(*) as count
      FROM app_telemetry
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      GROUP BY event_type, context
      ORDER BY count DESC
      LIMIT 50
    `);
    const telemetryRows = extractTelemetryRows(telemetryResult);

    if (!telemetryRows || telemetryRows.length === 0) {
      return { success: true, message: "Sem telemetria para analisar nas últimas 24h." };
    }

    // 2. Formatar dados para o LLM
    const telemetrySummary = telemetryRows.map((r: TelemetryRow) =>
      `[${r.event_type}] contexto técnico: ${r.context || "não informado"} (${r.count}x)`
    ).join("\n");

    const totalErrors = telemetryRows
      .filter((r: TelemetryRow) => r.event_type === "error")
      .reduce((sum: number, r: TelemetryRow) => sum + Number(r.count), 0);

    // 3. Análise com LLM
    const localDiagnosis = await generateAI({
      messages: [
        {
          role: "system",
          content: `Você é a IA de autoaperfeiçoamento do MultiLingue Universal, uma plataforma de ensino de idiomas com RA/RV.
          
Analise os dados de telemetria do app e gere um diagnóstico técnico em JSON com:
- topIssue: o problema mais crítico em 1 frase
- diagnosis: análise detalhada dos problemas encontrados (máx 300 palavras)
- recommendations: array de objetos com { action, priority, isSecurity, estimatedImpact }
  * isSecurity: true se a recomendação envolve segurança/autenticação/dados sensíveis (requer aprovação do admin)
  * priority: "low" | "medium" | "high" | "critical"
- autoFixable: array de correções que podem ser aplicadas automaticamente (apenas bugs de UI/UX, nunca segurança)
- securityAlerts: array de alertas de segurança que DEVEM ser aprovados pelo admin antes de qualquer ação

IMPORTANTE: Nunca sugira correções automáticas para: autenticação, permissões, dados de usuários, pagamentos, chaves de API.`
        },
        {
          role: "user",
          content: `Telemetria das últimas 24h (${telemetryRows.length} tipos de evento, ${totalErrors} erros totais):\n\n${telemetrySummary}`
        }
      ],
      temperature: 0.1,
      max_tokens: 1400,
      preferredProvider: "ollama",
      useCache: false,
      allowRemoteFallback: false,
    });

    const content = localDiagnosis.content;
    if (!content) throw new Error("LLM não retornou conteúdo");

    const diagnosis = typeof content === "string" ? JSON.parse(content) : content;

    // O diagnóstico é sempre uma proposta bloqueada: ele não executa TypeScript,
    // regressões ou publicação e nunca altera produção por conta própria.
    await pool.execute(`
      INSERT INTO maintenance_runs
        (source, decision, summary, detected_issues, verifications)
      VALUES (?, ?, ?, ?, ?)
    `, [
      "ai_self_improve",
      maintenanceAssessment.decision.state,
      String(diagnosis.topIssue || "Diagnóstico agendado concluído para revisão."),
      totalErrors + Number(diagnosis.securityAlerts?.length || 0),
      JSON.stringify(maintenanceAssessment.verifications),
    ]);

    // 4. Salvar insight no banco
    const insertResult = await pool.execute(`
      INSERT INTO ai_insights 
        (insight_type, title, description, data_source, affected_users, recommendations, severity, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      "performance_issue",
      `Análise Diária ${today}: ${diagnosis.topIssue}`,
      diagnosis.diagnosis,
      "app_telemetry",
      0,
      JSON.stringify(diagnosis.recommendations),
      totalErrors > 10 ? "critical" : totalErrors > 3 ? "warning" : "info",
      "new"
    ]);

    const insightId = extractInsertId(insertResult);

    // 5. Notificar owner se há alertas de segurança ou erros críticos
    const hasSecurityAlerts = diagnosis.securityAlerts?.length > 0;
    const hasCriticalErrors = totalErrors > 10;

    if (hasSecurityAlerts || hasCriticalErrors) {
      const securitySection = hasSecurityAlerts
        ? `\n\n🔴 ALERTAS DE SEGURANÇA (requerem sua aprovação):\n${diagnosis.securityAlerts.map((a: string) => `• ${a}`).join("\n")}`
        : "";

      await notifyOwner({
        title: `⚠️ IA Autoaperfeiçoamento: ${hasCriticalErrors ? "Erros Críticos" : "Alerta de Segurança"}`,
        content: `Análise de ${today}\n\nProblema principal: ${diagnosis.topIssue}\n\n${diagnosis.diagnosis}${securitySection}\n\nAcesse o painel admin para revisar e aprovar recomendações.`
      });
    }

    return {
      success: true,
      message: `Análise concluída. ${diagnosis.recommendations.length} recomendações geradas. ${hasSecurityAlerts ? "⚠️ Alertas de segurança enviados para aprovação." : ""}`,
      insightId
    };

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("[AI Self-Improve] Erro:", errorMessage);
    return { success: false, message: `Erro na análise: ${errorMessage}` };
  }
}
