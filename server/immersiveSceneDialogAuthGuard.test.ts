import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../client/src/pages/ImmersiveScene.tsx", import.meta.url), "utf8");

describe("bloqueio de sessão do diálogo imersivo", () => {
  it("interrompe o diálogo antes das mutações de voz quando não há sessão", () => {
    expect(source).toContain("const { isAuthenticated, loading: isAuthLoading } = useAuth();");
    expect(source).toContain("if (!isAuthenticated) {");
    expect(source).toContain("setDialogAuthRequired(true);");
    expect(source).toContain("Entre para iniciar o diálogo com voz neural e movimentos labiais sincronizados.");
  });

  it("mantém a escolha de autenticar no visitante sem esconder a cena", () => {
    expect(source).toContain("O diálogo com voz neural requer uma sessão protegida.");
    expect(source).toContain("window.location.href = getLoginUrl();");
    expect(source).toContain("As cenas e o vocabulário continuam visíveis");
  });
});
