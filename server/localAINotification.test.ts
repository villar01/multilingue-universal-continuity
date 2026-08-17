import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const notification = readFileSync(path.join(root, "client/src/components/LocalAINotification.tsx"), "utf8");
const home = readFileSync(path.join(root, "client/src/pages/Home.tsx"), "utf8");

describe("configuração local voluntária", () => {
  it("não exibe banner nem notificação técnica na abertura normal", () => {
    expect(notification).toContain("get('setup') === 'local-ai'");
    expect(notification).toContain("!isJourneyStartRoute || !setupRequested");
    expect(notification).not.toContain("setTimeout(() => setVisible(true), 3000)");
    expect(home).toContain('get("setup") === "local-ai"');
    expect(home).toContain("{showLocalSetup && (");
  });
});
