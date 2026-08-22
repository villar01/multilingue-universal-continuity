import { describe, expect, it, vi } from "vitest";
import { notifyOwnerOfCriticalSupport } from "./customer-support-router";

describe("notificações privadas de feedback crítico", () => {
  it("alerta o proprietário para relato de segurança sem incluir conteúdo do cliente", async () => {
    const notify = vi.fn().mockResolvedValue(true);

    await expect(notifyOwnerOfCriticalSupport("security", notify)).resolves.toBe(true);
    expect(notify).toHaveBeenCalledWith({
      title: "Novo relato de segurança para revisão",
      content: expect.stringContaining("nenhum conteúdo ou identificador"),
    });
  });

  it("não dispara alerta operacional para categorias de rotina", async () => {
    const notify = vi.fn().mockResolvedValue(true);

    await expect(notifyOwnerOfCriticalSupport("feedback", notify)).resolves.toBe(false);
    expect(notify).not.toHaveBeenCalled();
  });
});
