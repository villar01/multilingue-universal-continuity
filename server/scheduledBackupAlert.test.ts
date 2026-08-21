import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  authenticateRequest: vi.fn(),
  getDb: vi.fn(),
  runScheduledBackup: vi.fn(),
  verifyBackupSnapshot: vi.fn(),
  notifyOwner: vi.fn(),
}));

vi.mock("./_core/sdk", () => ({ sdk: { authenticateRequest: mocks.authenticateRequest } }));
vi.mock("./db", () => ({ getDb: mocks.getDb }));
vi.mock("./backupRestore", () => ({
  runScheduledBackup: mocks.runScheduledBackup,
  verifyBackupSnapshot: mocks.verifyBackupSnapshot,
}));
vi.mock("./_core/notification", () => ({ notifyOwner: mocks.notifyOwner }));

import { handleScheduledBackup } from "./scheduled/backup";

function createResponse() {
  return {
    statusCode: 200,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(body: unknown) {
      this.body = body;
      return this;
    },
  };
}

describe("snapshot automático: alerta de falha", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.authenticateRequest.mockResolvedValue({ isCron: true, taskUid: "backup-task" });
    mocks.getDb.mockResolvedValue({
      $client: { promise: () => ({ execute: vi.fn().mockResolvedValue([[{ heartbeat_task_uid: "backup-task" }]]) }) },
    });
    mocks.notifyOwner.mockResolvedValue(true);
    mocks.verifyBackupSnapshot.mockResolvedValue(true);
  });

  it("alerta o proprietário sem expor dados do snapshot quando a cópia falha", async () => {
    mocks.runScheduledBackup.mockResolvedValue({ status: "failed" });
    const response = createResponse();

    await handleScheduledBackup({} as any, response as any);

    expect(response.statusCode).toBe(500);
    expect(mocks.notifyOwner).toHaveBeenCalledWith({
      title: "Snapshot automático precisa de verificação",
      content: "Um snapshot automático não foi concluído. O aplicativo permanece em funcionamento; verifique o histórico de backup antes de qualquer manutenção.",
    });
  });

  it("alerta o proprietário quando o snapshot concluído não passa na verificação leve", async () => {
    mocks.runScheduledBackup.mockResolvedValue({ id: "backup_scheduled_1", status: "completed" });
    mocks.verifyBackupSnapshot.mockResolvedValue(false);
    const response = createResponse();

    await handleScheduledBackup({} as any, response as any);

    expect(mocks.verifyBackupSnapshot).toHaveBeenCalledWith("backup_scheduled_1");
    expect(response.statusCode).toBe(500);
    expect(mocks.notifyOwner).toHaveBeenCalledOnce();
  });
});
