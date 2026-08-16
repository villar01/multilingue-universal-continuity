import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const clientSceneSource = readFileSync("client/src/pages/ImmersiveScene.tsx", "utf8");
const serverSeedSource = readFileSync("server/curriculum/secureSceneSeeds.ts", "utf8");

describe("migração protegida da Praia Tropical", () => {
  it("mantém diálogo e objetos canônicos somente na semente do servidor", () => {
    expect(clientSceneSource).toContain("// Curriculum is delivered only after lesson authorization from the server.");
    expect(clientSceneSource).toContain("dialog: []");
    expect(clientSceneSource).toContain("hotspots: []");
    expect(clientSceneSource).not.toContain("Hello! My name is James. Welcome to this beautiful tropical beach!");
    expect(clientSceneSource).not.toContain("The palm tree is tall.");
    expect(serverSeedSource).toContain("Hello! My name is James. Welcome to this beautiful tropical beach!");
    expect(serverSeedSource).toContain("The palm tree is tall.");
  });

  it("faz a interface consumir diálogo e objetos ativos autorizados", () => {
    expect(clientSceneSource).toContain("const activeSceneDialog = canonicalSceneMaterialQuery.data?.dialog || selectedScene?.dialog || []");
    expect(clientSceneSource).toContain("const activeSceneHotspots = canonicalSceneMaterialQuery.data?.hotspots || selectedScene?.hotspots || []");
    expect(clientSceneSource).toContain("sceneCanonicalMaterial.useQuery");
    expect(clientSceneSource).toContain("Preparando material protegido da cena…");
  });

  it("remove também o roteiro e os objetos canônicos do Café Parisiense do catálogo cliente", () => {
    expect(clientSceneSource).not.toContain("Bonjour! Je m'appelle Sophie. Bienvenue au café!");
    expect(clientSceneSource).not.toContain("Le café est chaud.");
    expect(serverSeedSource).toContain("Bonjour! Je m'appelle Sophie. Bienvenue au café!");
    expect(serverSeedSource).toContain("Le café est chaud.");
  });

  it("remove também o roteiro e os objetos canônicos da Floresta Encantada do catálogo cliente", () => {
    expect(clientSceneSource).not.toContain("Hello! I'm James. Welcome to this magical enchanted forest!");
    expect(clientSceneSource).not.toContain("The tree is very tall.");
    expect(serverSeedSource).toContain("Hello! I'm James. Welcome to this magical enchanted forest!");
    expect(serverSeedSource).toContain("The tree is very tall.");
  });

  it("remove também o roteiro e os objetos canônicos de Paris, França do catálogo cliente", () => {
    expect(clientSceneSource).not.toContain("Bonjour! Je m'appelle Sophie. Bienvenue à Paris!");
    expect(clientSceneSource).not.toContain("La Tour Eiffel est magnifique.");
    expect(serverSeedSource).toContain("Bonjour! Je m'appelle Sophie. Bienvenue à Paris!");
    expect(serverSeedSource).toContain("La Tour Eiffel est magnifique.");
    expect(clientSceneSource).toContain('selectedScene?.id === "paris"');
  });

  it("remove também o roteiro e os objetos canônicos de Nova York do catálogo cliente", () => {
    expect(clientSceneSource).not.toContain("Hey! Welcome to New York City — the Big Apple!");
    expect(clientSceneSource).not.toContain("The building is tall.");
    expect(serverSeedSource).toContain("Hey! Welcome to New York City — the Big Apple!");
    expect(serverSeedSource).toContain("The building is tall.");
    expect(clientSceneSource).toContain('selectedScene?.id === "newyork"');
  });

  it("remove também o roteiro e os objetos canônicos da Cozinha Moderna do catálogo cliente", () => {
    expect(clientSceneSource).not.toContain("¡Hola! Me llamo Carlos. ¡Bienvenido a mi cocina!");
    expect(clientSceneSource).not.toContain("La nevera está fría.");
    expect(serverSeedSource).toContain("¡Hola! Me llamo Carlos. ¡Bienvenido a mi cocina!");
    expect(serverSeedSource).toContain("La nevera está fría.");
    expect(clientSceneSource).toContain('selectedScene?.id === "kitchen"');
  });

  it("remove também o roteiro e os objetos canônicos do Restaurante Brasileiro do catálogo cliente", () => {
    expect(clientSceneSource).not.toContain("Olá! Meu nome é Ana. Bem-vindo ao nosso restaurante brasileiro!");
    expect(clientSceneSource).not.toContain("A massa está deliciosa.");
    expect(serverSeedSource).toContain("Olá! Meu nome é Ana. Bem-vindo ao nosso restaurante brasileiro!");
    expect(serverSeedSource).toContain("A massa está deliciosa.");
    expect(clientSceneSource).toContain('selectedScene?.id === "restaurant"');
  });

  it("remove também o roteiro e os objetos canônicos do Hotel de Luxo do catálogo cliente", () => {
    expect(clientSceneSource).not.toContain("Buongiorno! Benvenuto in hotel. Ha una prenotazione?");
    expect(clientSceneSource).not.toContain("La reception è al piano terra.");
    expect(serverSeedSource).toContain("Buongiorno! Benvenuto in hotel. Ha una prenotazione?");
    expect(serverSeedSource).toContain("La reception è al piano terra.");
    expect(clientSceneSource).toContain('selectedScene?.id === "hotel"');
  });
});
