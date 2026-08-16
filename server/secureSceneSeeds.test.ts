import { describe, expect, it } from "vitest";
import { getSecureSceneSeed } from "./curriculum/secureSceneSeeds";

describe("sementes canônicas protegidas de cena", () => {
  it("mantém o conteúdo da Praia Tropical disponível somente no contrato do servidor", () => {
    const beach = getSecureSceneSeed("beach");
    expect(beach?.dialog).toHaveLength(7);
    expect(beach?.hotspots.map((hotspot) => hotspot.id)).toEqual(["palm", "ocean", "wave", "sand"]);
  });

  it("mantém o conteúdo do Café Parisiense disponível somente no contrato do servidor", () => {
    const cafe = getSecureSceneSeed("cafe");
    expect(cafe?.dialog).toHaveLength(7);
    expect(cafe?.hotspots.map((hotspot) => hotspot.id)).toEqual(["cafe3", "croissant", "garcon", "terrasse", "journal", "addition"]);
  });

  it("não inventa conteúdo para cenas ainda não migradas", () => {
    expect(getSecureSceneSeed("unmigrated-scene")).toBeNull();
  });
});
