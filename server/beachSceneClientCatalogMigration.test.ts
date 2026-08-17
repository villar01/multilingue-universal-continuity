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

  it("remove também o roteiro e os objetos canônicos do Supermercado do catálogo cliente", () => {
    expect(clientSceneSource).not.toContain("¡Bienvenido al supermercado! ¿Qué necesitas comprar hoy?");
    expect(clientSceneSource).not.toContain("El carrito está lleno.");
    expect(serverSeedSource).toContain("¡Bienvenido al supermercado! ¿Qué necesitas comprar hoy?");
    expect(serverSeedSource).toContain("El carrito está lleno.");
    expect(clientSceneSource).toContain('selectedScene?.id === "supermarket"');
  });

  it("remove também o roteiro e os objetos canônicos da Sala de Aula do catálogo cliente", () => {
    expect(clientSceneSource).not.toContain("Good morning class! Please open your books to page ten.");
    expect(clientSceneSource).not.toContain("Write on the blackboard.");
    expect(serverSeedSource).toContain("Good morning class! Please open your books to page ten.");
    expect(serverSeedSource).toContain("Write on the blackboard.");
    expect(clientSceneSource).toContain('selectedScene?.id === "school"');
  });

  it("remove também o roteiro e os objetos canônicos da Montanha Nevada do catálogo cliente", () => {
    expect(clientSceneSource).not.toContain("Willkommen auf dem Berg! Ich bin Hans. Wie gefällt Ihnen die Aussicht?");
    expect(clientSceneSource).not.toContain("Der Gipfel ist schneebedeckt.");
    expect(serverSeedSource).toContain("Willkommen auf dem Berg! Ich bin Hans. Wie gefällt Ihnen die Aussicht?");
    expect(serverSeedSource).toContain("Der Gipfel ist schneebedeckt.");
    expect(clientSceneSource).toContain('selectedScene?.id === "mountain"');
  });

  it("remove também o roteiro e os objetos canônicos do Aeroporto Internacional do catálogo cliente", () => {
    expect(clientSceneSource).not.toContain("Welcome to the airport! Do you have your passport ready?");
    expect(clientSceneSource).not.toContain("The gate is open.");
    expect(serverSeedSource).toContain("Welcome to the airport! Do you have your passport ready?");
    expect(serverSeedSource).toContain("The gate is open.");
    expect(clientSceneSource).toContain('selectedScene?.id === "airport"');
  });

  it("remove também o roteiro e os objetos canônicos do Parque da Cidade do catálogo cliente", () => {
    expect(clientSceneSource).not.toContain("Bonjour! Je m'appelle Sophie. Quel beau parc, n'est-ce pas?");
    expect(clientSceneSource).not.toContain("L'arbre est grand.");
    expect(serverSeedSource).toContain("Bonjour! Je m'appelle Sophie. Quel beau parc, n'est-ce pas?");
    expect(serverSeedSource).toContain("L'arbre est grand.");
    expect(clientSceneSource).toContain('selectedScene?.id === "park"');
  });

  it("remove também o roteiro e os objetos canônicos do Hospital do catálogo cliente", () => {
    expect(clientSceneSource).not.toContain("Good morning! I'm Dr. Priya. How are you feeling today?");
    expect(clientSceneSource).not.toContain("The doctor is kind.");
    expect(serverSeedSource).toContain("Good morning! I'm Dr. Priya. How are you feeling today?");
    expect(serverSeedSource).toContain("The doctor is kind.");
    expect(clientSceneSource).toContain('selectedScene?.id === "hospital"');
  });

  it("remove também o roteiro e os objetos canônicos do Museu de Arte do catálogo cliente", () => {
    expect(clientSceneSource).not.toContain("Benvenuto al museo! Sono Giulia. Che quadro bellissimo, vero?");
    expect(clientSceneSource).not.toContain("Il quadro è antico.");
    expect(serverSeedSource).toContain("Benvenuto al museo! Sono Giulia. Che quadro bellissimo, vero?");
    expect(serverSeedSource).toContain("Il quadro è antico.");
    expect(clientSceneSource).toContain('selectedScene?.id === "museum"');
  });

  it("remove também o roteiro e os objetos canônicos do Porto Mediterrâneo do catálogo cliente", () => {
    expect(clientSceneSource).not.toContain("Benvenuto al porto! Sono Giulia. Che bel porto mediterraneo, vero?");
    expect(clientSceneSource).not.toContain("La barca è nel porto.");
    expect(serverSeedSource).toContain("Benvenuto al porto! Sono Giulia. Che bel porto mediterraneo, vero?");
    expect(serverSeedSource).toContain("La barca è nel porto.");
    expect(clientSceneSource).toContain('selectedScene?.id === "port"');
  });

  it("remove também o roteiro e os objetos canônicos do Mercado Medieval do catálogo cliente", () => {
    expect(clientSceneSource).not.toContain("Willkommen auf dem mittelalterlichen Markt! Ich bin Hans. Was möchten Sie kaufen?");
    expect(clientSceneSource).not.toContain("Die Burg ist alt.");
    expect(serverSeedSource).toContain("Willkommen auf dem mittelalterlichen Markt! Ich bin Hans. Was möchten Sie kaufen?");
    expect(serverSeedSource).toContain("Die Burg ist alt.");
    expect(clientSceneSource).toContain('selectedScene?.id === "medieval"');
  });

  it("remove também o roteiro e os objetos canônicos do Cinema Moderno do catálogo cliente", () => {
    expect(clientSceneSource).not.toContain("Welcome to the cinema! What kind of movie do you want to watch tonight?");
    expect(clientSceneSource).not.toContain("The screen is huge.");
    expect(serverSeedSource).toContain("Welcome to the cinema! What kind of movie do you want to watch tonight?");
    expect(serverSeedSource).toContain("The screen is huge.");
    expect(clientSceneSource).toContain('selectedScene?.id === "cinema"');
  });

  it("remove também o roteiro e os objetos canônicos do Spa & Bem-Estar do catálogo cliente", () => {
    expect(clientSceneSource).not.toContain("Welcome to the spa! I'm Priya. How do you feel today?");
    expect(clientSceneSource).not.toContain("The pool is warm.");
    expect(serverSeedSource).toContain("Welcome to the spa! I'm Priya. How do you feel today?");
    expect(serverSeedSource).toContain("The pool is warm.");
    expect(clientSceneSource).toContain('selectedScene?.id === "spa"');
  });
});
