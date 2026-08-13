import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const routerSource = readFileSync(resolve(process.cwd(), "server/parental-control-router.ts"), "utf8");
const panelSource = readFileSync(resolve(process.cwd(), "client/src/pages/ParentalControlPanel.tsx"), "utf8");

describe("histórico parental supervisionável", () => {
  it("restringe a consulta ao perfil infantil pertencente ao responsável e devolve apenas metadados", () => {
    expect(routerSource).toContain("listSupervisedInteractions: protectedProcedure");
    expect(routerSource).toContain("await requireChildOwnership(database, input.childId, ctx.user.id)");
    expect(routerSource).toContain("interaction_type AS interactionType");
    expect(routerSource).toContain("language_code AS languageCode");
    expect(routerSource).toContain("is_flagged AS isFlagged");
    expect(routerSource).not.toContain("listSupervisedInteractions: protectedProcedure\n    .input(z.object({ childId: z.number().positive(), limit: z.number().min(1).max(50).default(20) }))\n    .query(async ({ input, ctx }) => {\n      const database = await getDb();\n      if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB unavailable' });\n      const child = await requireChildOwnership(database, input.childId, ctx.user.id);\n\n      const linkedUserId = child.linkedUserId;\n      const result = linkedUserId\n        ? await database.execute(sql`\n            SELECT *");
  });

  it("apresenta no painel somente atividade, idioma, horário e indicação de atenção", () => {
    expect(panelSource).toContain("listSupervisedInteractions.useQuery({ childId, limit: 20 })");
    expect(panelSource).toContain("Histórico supervisionável e minimizado");
    expect(panelSource).toContain("Mensagens, respostas e transcrições não são exibidas neste painel.");
    expect(panelSource).not.toContain("interaction.content");
    expect(panelSource).not.toContain("interaction.teacherResponse");
  });

  it("retorna alertas como metadados e deriva motivos seguros no painel", () => {
    expect(routerSource).toContain("alertType: parentalAlerts.alertType");
    expect(routerSource).toContain("createdAt: parentalAlerts.createdAt");
    expect(routerSource).not.toContain("const alerts = await database.select().from(parentalAlerts)");
    expect(panelSource).toContain("const safeAlertReason");
    expect(panelSource).toContain("getSafeAlertReason(alert.alertType)");
    expect(panelSource).not.toContain("{alert.title}");
    expect(panelSource).not.toContain("{alert.detail || ''}");
  });

  it("não expõe conteúdo bruto pelo procedimento legado de logs parentais", () => {
    expect(routerSource).toContain("listInteractionLogs: protectedProcedure");
    expect(routerSource).not.toContain("SELECT * FROM interaction_logs WHERE user_id = ${ctx.user.id}");
  });
});
