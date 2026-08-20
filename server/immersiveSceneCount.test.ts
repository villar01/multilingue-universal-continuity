import { describe, expect, it } from "vitest";
import { IMMERSIVE_SCENES } from "../client/src/lib/immersiveScenesCatalog";
import { IMMERSIVE_SCENE_COUNT } from "../client/src/lib/immersiveSceneStats";
import fs from "node:fs";
import path from "node:path";

describe("contagem pública de cenas imersivas", () => {
  it("mantém o número do hub AR sincronizado com o catálogo de cenas", () => {
    const hub = fs.readFileSync(path.join(process.cwd(), "client/src/pages/ARMode.tsx"), "utf8");
    expect(IMMERSIVE_SCENES).toHaveLength(29);
    expect(IMMERSIVE_SCENE_COUNT).toBe(IMMERSIVE_SCENES.length);
    expect(hub).toContain("IMMERSIVE_SCENE_COUNT");
    expect(hub).not.toContain('stats: ["6 cenas"');
  });
});
