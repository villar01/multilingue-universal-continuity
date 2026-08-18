import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const source = fs.readFileSync(path.resolve(process.cwd(), "client/src/pages/ImmersiveScene.tsx"), "utf8");

describe("fallback de retrato do professor na cena imersiva", () => {
  it("mantém a foto original montada sob o clipe opcional", () => {
    const portraitIndex = source.indexOf("src={overrideImage || scene.teacherImage}");
    const videoIndex = source.indexOf("{showPilotClip && activeClip?.videoUrl && (");
    expect(portraitIndex).toBeGreaterThan(-1);
    expect(videoIndex).toBeGreaterThan(portraitIndex);
    expect(source).toContain("zIndex: 2");
  });

  it("remove somente a camada de clipe quando ela encerra ou falha", () => {
    expect(source).toContain("onError={onClipFinished}");
    expect(source).toContain('onClipFinished={() => { setActiveJamesClipId(null); setActiveSophieClipId(null); }}');
    expect(source).toContain('const showPilotClip = Boolean(');
    expect(source).toContain('const showSyntheticMouth = false;');
  });
});
