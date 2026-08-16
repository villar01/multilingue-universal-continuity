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

  it("mantém o conteúdo da Floresta Encantada disponível somente no contrato do servidor", () => {
    const forest = getSecureSceneSeed("forest");
    expect(forest?.dialog).toHaveLength(7);
    expect(forest?.hotspots.map((hotspot) => hotspot.id)).toEqual(["tree", "mushroom", "bird", "flower", "river", "sun"]);
  });

  it("mantém o conteúdo de Paris, França disponível somente no contrato do servidor", () => {
    const paris = getSecureSceneSeed("paris");
    expect(paris?.dialog).toHaveLength(7);
    expect(paris?.hotspots.map((hotspot) => hotspot.id)).toEqual(["tower", "cafe", "rue", "fleur", "immeuble", "ciel", "boulangerie", "pont"]);
  });

  it("mantém o conteúdo de Nova York disponível somente no contrato do servidor", () => {
    const newyork = getSecureSceneSeed("newyork");
    expect(newyork?.dialog).toHaveLength(7);
    expect(newyork?.hotspots.map((hotspot) => hotspot.id)).toEqual(["statue", "building", "city", "water", "sun", "window"]);
  });

  it("mantém o conteúdo da Cozinha Moderna disponível somente no contrato do servidor", () => {
    const kitchen = getSecureSceneSeed("kitchen");
    expect(kitchen?.dialog).toHaveLength(7);
    expect(kitchen?.hotspots.map((hotspot) => hotspot.id)).toEqual(["nevera", "horno", "mesa", "ventana", "cuchara", "encimera"]);
  });

  it("mantém o conteúdo do Restaurante Brasileiro disponível somente no contrato do servidor", () => {
    const restaurant = getSecureSceneSeed("restaurant");
    expect(restaurant?.dialog).toHaveLength(7);
    expect(restaurant?.hotspots.map((hotspot) => hotspot.id)).toEqual(["massa", "vinho", "mesa", "vela", "quadro", "janela"]);
  });

  it("mantém o conteúdo do Hotel de Luxo disponível somente no contrato do servidor", () => {
    const hotel = getSecureSceneSeed("hotel");
    expect(hotel?.dialog).toHaveLength(7);
    expect(hotel?.hotspots.map((hotspot) => hotspot.id)).toEqual(["reception", "lampadario", "colonna", "poltrona", "pianta", "lampada"]);
  });

  it("não inventa conteúdo para cenas ainda não migradas", () => {
    expect(getSecureSceneSeed("unmigrated-scene")).toBeNull();
  });
});
