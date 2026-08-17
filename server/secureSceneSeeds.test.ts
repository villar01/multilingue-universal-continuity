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

  it("mantém o conteúdo do Supermercado disponível somente no contrato do servidor", () => {
    const supermarket = getSecureSceneSeed("supermarket");
    expect(supermarket?.dialog).toHaveLength(7);
    expect(supermarket?.hotspots.map((hotspot) => hotspot.id)).toEqual(["carrito", "fruta", "pan", "leche", "caja", "precio"]);
  });

  it("mantém o conteúdo da Sala de Aula disponível somente no contrato do servidor", () => {
    const school = getSecureSceneSeed("school");
    expect(school?.dialog).toHaveLength(7);
    expect(school?.hotspots.map((hotspot) => hotspot.id)).toEqual(["board", "desk", "book", "pencil", "window", "clock"]);
  });

  it("mantém o conteúdo da Montanha Nevada disponível somente no contrato do servidor", () => {
    const mountain = getSecureSceneSeed("mountain");
    expect(mountain?.dialog).toHaveLength(7);
    expect(mountain?.hotspots.map((hotspot) => hotspot.id)).toEqual(["gipfel", "schnee", "wald2", "fels", "wolke", "see"]);
  });

  it("mantém o conteúdo do Aeroporto Internacional disponível somente no contrato do servidor", () => {
    const airport = getSecureSceneSeed("airport");
    expect(airport?.dialog).toHaveLength(7);
    expect(airport?.hotspots.map((hotspot) => hotspot.id)).toEqual(["gate", "person", "people", "sign", "window", "floor"]);
  });

  it("mantém o conteúdo do Parque da Cidade disponível somente no contrato do servidor", () => {
    const park = getSecureSceneSeed("park");
    expect(park?.dialog).toHaveLength(7);
    expect(park?.hotspots.map((hotspot) => hotspot.id)).toEqual(["arbre", "jeux", "fontaine", "personnes", "chien", "herbe"]);
  });

  it("mantém o conteúdo do Hospital disponível somente no contrato do servidor", () => {
    const hospital = getSecureSceneSeed("hospital");
    expect(hospital?.dialog).toHaveLength(7);
    expect(hospital?.hotspots.map((hotspot) => hotspot.id)).toEqual(["doctor", "medicine", "bed", "xray", "nurse", "ambulance"]);
  });

  it("mantém o conteúdo do Museu de Arte disponível somente no contrato do servidor", () => {
    const museum = getSecureSceneSeed("museum");
    expect(museum?.dialog).toHaveLength(7);
    expect(museum?.hotspots.map((hotspot) => hotspot.id)).toEqual(["quadro", "scultura", "cornice", "visitatore", "galleria", "luce"]);
  });

  it("mantém o conteúdo do Porto Mediterrâneo disponível somente no contrato do servidor", () => {
    const port = getSecureSceneSeed("port");
    expect(port?.dialog).toHaveLength(7);
    expect(port?.hotspots.map((hotspot) => hotspot.id)).toEqual(["barca", "mare", "faro", "gabbiano", "rete", "ancora"]);
  });

  it("mantém o conteúdo do Mercado Medieval disponível somente no contrato do servidor", () => {
    const medieval = getSecureSceneSeed("medieval");
    expect(medieval?.dialog).toHaveLength(7);
    expect(medieval?.hotspots.map((hotspot) => hotspot.id)).toEqual(["burg", "markt", "ritter", "fahne", "brunnen", "kerze"]);
  });

  it("mantém o conteúdo do Cinema Moderno disponível somente no contrato do servidor", () => {
    const cinema = getSecureSceneSeed("cinema");
    expect(cinema?.dialog).toHaveLength(7);
    expect(cinema?.hotspots.map((hotspot) => hotspot.id)).toEqual(["screen2", "popcorn", "seat", "ticket", "projector", "exit"]);
  });

  it("mantém o conteúdo do Spa & Bem-Estar disponível somente no contrato do servidor", () => {
    const spa = getSecureSceneSeed("spa");
    expect(spa?.dialog).toHaveLength(7);
    expect(spa?.hotspots.map((hotspot) => hotspot.id)).toEqual(["pool", "towel", "candle", "flower3", "massage", "music"]);
  });

  it("mantém o conteúdo de Tóquio disponível somente no contrato do servidor", () => {
    const tokyo = getSecureSceneSeed("tokyo");
    expect(tokyo?.dialog).toHaveLength(7);
    expect(tokyo?.hotspots.map((hotspot) => hotspot.id)).toEqual(["fuji", "street", "billboard", "screen", "building", "sign"]);
  });

  it("mantém o conteúdo do Deserto do Saara disponível somente no contrato do servidor", () => {
    const desert = getSecureSceneSeed("desert");
    expect(desert?.dialog).toHaveLength(7);
    expect(desert?.hotspots.map((hotspot) => hotspot.id)).toEqual(["sand2", "caravan", "sun2", "footprints", "dune"]);
  });

  it("não inventa conteúdo para cenas ainda não migradas", () => {
    expect(getSecureSceneSeed("unmigrated-scene")).toBeNull();
  });
});
