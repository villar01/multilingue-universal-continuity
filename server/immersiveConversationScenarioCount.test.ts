import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { IMMERSIVE_CONVERSATION_SCENARIO_COUNT } from "../client/src/lib/immersiveConversationStats";

describe("contagem de cenários da conversação imersiva", () => {
  it("mantém o hub sincronizado com a lista real de cenários", () => {
    const vrSource = fs.readFileSync(path.join(process.cwd(), "client/src/pages/VRConversation.tsx"), "utf8");
    const hub = fs.readFileSync(path.join(process.cwd(), "client/src/pages/ARMode.tsx"), "utf8");
    const scenarioSection = vrSource.slice(vrSource.indexOf("const SCENARIOS = ["), vrSource.indexOf("interface Msg"));

    expect((scenarioSection.match(/\bid:/g) || [])).toHaveLength(12);
    expect(IMMERSIVE_CONVERSATION_SCENARIO_COUNT).toBe((scenarioSection.match(/\bid:/g) || []).length);
    expect(hub).toContain("IMMERSIVE_CONVERSATION_SCENARIO_COUNT");
    expect(hub).not.toContain('description: "8 cenários reais');
  });
});
