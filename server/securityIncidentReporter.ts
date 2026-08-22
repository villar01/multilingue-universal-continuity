import { securityEvents } from "../drizzle/schema";
import { getDb } from "./db";
import { notifyOwner } from "./_core/notification";

export type SecurityIncidentKind =
  | "api_rate_limit"
  | "global_rate_limit"
  | "suspicious_user_agent"
  | "sql_injection"
  | "xss_attempt";

type SecurityIncidentRecord = {
  eventType:
    | "rate_limit_exceeded"
    | "ddos_attempt"
    | "bot_detected"
    | "sql_injection"
    | "xss_attempt";
  severity: "low" | "medium" | "high" | "critical";
  endpoint: string;
  description: string;
  evidence: Record<string, boolean | number | string>;
  actionTaken: "blocked" | "rate_limited" | "admin_notified";
  adminNotified: boolean;
  adminNotifiedAt: Date | null;
  adminTips: string;
};

type SecurityIncidentInput = {
  kind: SecurityIncidentKind;
  endpoint: string;
  now?: number;
};

type IncidentReporterDependencies = {
  sendOwnerAlert: (payload: { title: string; content: string }) => Promise<boolean>;
  persistIncident: (record: SecurityIncidentRecord) => Promise<void>;
};

const OWNER_ALERT_COOLDOWN_MS = 5 * 60 * 1000;

const INCIDENT_DETAILS = {
  api_rate_limit: {
    eventType: "rate_limit_exceeded",
    severity: "medium",
    label: "limite de acesso à API",
    description: "Um padrão de acesso excedeu o limite permitido e foi contido automaticamente.",
    tip: "Revise o resumo privado de segurança. Se o padrão persistir, decida se deseja ampliar a contenção.",
    actionTaken: "rate_limited",
  },
  global_rate_limit: {
    eventType: "ddos_attempt",
    severity: "high",
    label: "volume anômalo de requisições",
    description: "Um volume anômalo de requisições foi limitado automaticamente para preservar a disponibilidade.",
    tip: "Revise o resumo privado de segurança e confirme se a contenção proporcional deve continuar.",
    actionTaken: "rate_limited",
  },
  suspicious_user_agent: {
    eventType: "bot_detected",
    severity: "high",
    label: "ferramenta de varredura não autorizada",
    description: "Uma tentativa identificada como varredura não autorizada foi bloqueada automaticamente.",
    tip: "Revise o relatório privado. A proteção já bloqueou a tentativa; qualquer medida adicional depende de sua decisão.",
    actionTaken: "blocked",
  },
  sql_injection: {
    eventType: "sql_injection",
    severity: "high",
    label: "padrão de entrada maliciosa",
    description: "Um padrão de entrada potencialmente maliciosa foi bloqueado antes de alcançar as rotas de dados.",
    tip: "Revise o relatório privado. Nenhum conteúdo da tentativa é preservado no evento operacional.",
    actionTaken: "blocked",
  },
  xss_attempt: {
    eventType: "xss_attempt",
    severity: "high",
    label: "padrão de conteúdo malicioso",
    description: "Um padrão de conteúdo potencialmente malicioso foi bloqueado antes de ser processado.",
    tip: "Revise o relatório privado. Nenhum conteúdo da tentativa é preservado no evento operacional.",
    actionTaken: "blocked",
  },
} as const;

function getSafeEndpointScope(endpoint: string): string {
  return endpoint.startsWith("/api/") ? "/api" : "/application";
}

async function persistSecurityIncident(record: SecurityIncidentRecord): Promise<void> {
  try {
    const db = await getDb();
    if (!db) return;
    await db.insert(securityEvents).values({
      eventType: record.eventType,
      severity: record.severity,
      userId: null,
      ipAddress: null,
      userAgent: null,
      endpoint: record.endpoint,
      description: record.description,
      evidence: record.evidence,
      actionTaken: record.actionTaken,
      adminNotified: record.adminNotified,
      adminNotifiedAt: record.adminNotifiedAt,
      adminTips: record.adminTips,
      resolved: false,
    });
  } catch {
    console.warn("[SECURITY] Unable to persist a private security incident record");
  }
}

export function createSecurityIncidentReporter(dependencies: IncidentReporterDependencies) {
  const lastOwnerAlertByKind = new Map<SecurityIncidentKind, number>();

  const report = async ({ kind, endpoint, now = Date.now() }: SecurityIncidentInput): Promise<void> => {
    const detail = INCIDENT_DETAILS[kind];
    const lastAlertAt = lastOwnerAlertByKind.get(kind) ?? 0;
    const shouldAlertOwner = now - lastAlertAt >= OWNER_ALERT_COOLDOWN_MS;
    let alertDelivered = false;

    if (shouldAlertOwner) {
      lastOwnerAlertByKind.set(kind, now);
      try {
        alertDelivered = await dependencies.sendOwnerAlert({
          title: "Segurança: contenção automática aplicada",
          content: `${detail.description} Categoria: ${detail.label}. A tentativa foi contida sem incluir identificadores de visitantes ou conteúdo recebido nesta notificação. ${detail.tip}`,
        });
      } catch {
        console.warn("[SECURITY] Owner alert delivery was unavailable");
      }
    }

    await dependencies.persistIncident({
      eventType: detail.eventType,
      severity: detail.severity,
      endpoint: getSafeEndpointScope(endpoint),
      description: detail.description,
      evidence: {
        blocked: true,
        alertAttempted: shouldAlertOwner,
        alertDelivered,
        source: "security-middleware",
      },
      actionTaken: alertDelivered ? "admin_notified" : detail.actionTaken,
      adminNotified: alertDelivered,
      adminNotifiedAt: alertDelivered ? new Date(now) : null,
      adminTips: detail.tip,
    });
  };

  return {
    report,
    reset: () => lastOwnerAlertByKind.clear(),
  };
}

const defaultReporter = createSecurityIncidentReporter({
  sendOwnerAlert: notifyOwner,
  persistIncident: persistSecurityIncident,
});

export const reportSecurityIncident = defaultReporter.report;

/** Somente para isolamento determinístico dos testes de segurança. */
export function __resetSecurityIncidentReporterForTests(): void {
  defaultReporter.reset();
}
