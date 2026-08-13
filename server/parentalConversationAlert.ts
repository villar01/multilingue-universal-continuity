import { eq } from "drizzle-orm";
import { childProfiles, parentalAlerts } from "../drizzle/schema";
import { getDb } from "./db";

export type ConversationSafetyEvent = "blocked_input" | "blocked_output";

export function buildSafeConversationAlert(event: ConversationSafetyEvent) {
  return event === "blocked_input"
    ? {
        alertType: "content_blocked",
        title: "Interação bloqueada pelo filtro de proteção",
        detail: "Uma mensagem foi bloqueada antes de seguir para a conversa. O texto não foi armazenado no alerta.",
      }
    : {
        alertType: "content_blocked",
        title: "Resposta bloqueada pelo filtro de proteção",
        detail: "Uma resposta foi interrompida antes de ser exibida. O texto não foi armazenado no alerta.",
      };
}

export async function recordConversationSafetyAlert(userId: number, event: ConversationSafetyEvent) {
  const database = await getDb();
  if (!database) return false;
  const [child] = await database.select().from(childProfiles)
    .where(eq(childProfiles.linkedUserId, userId))
    .limit(1);
  if (!child) return false;

  const alert = buildSafeConversationAlert(event);
  await database.insert(parentalAlerts).values({
    childId: child.id,
    alertType: alert.alertType,
    title: alert.title,
    detail: alert.detail,
    icon: "🛡️",
  });
  return true;
}
