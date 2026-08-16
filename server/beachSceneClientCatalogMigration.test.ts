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
});
