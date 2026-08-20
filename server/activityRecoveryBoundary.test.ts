import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), "utf8");

describe("recuperação local de atividades", () => {
  it("mantém falhas interativas fora da fronteira global com uma tentativa única", () => {
    const boundary = read("client/src/components/ActivityRecoveryBoundary.tsx");
    expect(boundary).toContain("autoRecoveryUsed");
    expect(boundary).toContain("Restaurando a atividade");
    expect(boundary).toContain("O restante do aplicativo continua disponível.");
    expect(boundary).toContain('window.location.assign("/dashboard")');
  });

  it("protege vídeos interativos e roleplay com a fronteira local", () => {
    const app = read("client/src/App.tsx");
    expect(app).toContain("const ResilientInteractiveVideos");
    expect(app).toContain('<Route path="/interactive-videos" component={ResilientInteractiveVideos} />');
    expect(app).toContain("const ResilientRoleplay");
    expect(app).toContain('<Route path="/roleplay" component={ResilientRoleplay} />');
  });
});
