import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { buildSafeConversationAlert } from "./parentalConversationAlert";
import { hasAudibleParentalAlert, isAudibleParentalAlertType } from "../client/src/lib/parentalAlertSound";

const panelSource = fs.readFileSync(path.resolve(process.cwd(), "client/src/pages/ParentalControlPanel.tsx"), "utf8");

describe("fluxo seguro de alerta parental", () => {
  it("transforma um bloqueio de entrada em categoria auditável sem texto da conversa", () => {
    const alert = buildSafeConversationAlert("blocked_input");

    expect(alert.alertType).toBe("content_blocked");
    expect(alert.title).toBe("Interação bloqueada pelo filtro de proteção");
    expect(alert.detail).toContain("texto não foi armazenado");
    expect(alert.detail).not.toContain("mensagem original");
  });

  it("mantém o mesmo alerta visível e sonoro somente após escolha do responsável", () => {
    const alert = { id: 99, alertType: "content_blocked", isRead: false };

    expect(hasAudibleParentalAlert([alert])).toBe(true);
    expect(isAudibleParentalAlertType(alert.alertType)).toBe(true);
    expect(panelSource).toContain("const [soundEnabled, setSoundEnabled] = useState(false)");
    expect(panelSource).toContain("if (!soundEnabled || !hasAudibleParentalAlert(alerts)) return;");
    expect(panelSource).toContain("Nenhum texto da interação é exibido.");
  });
});
