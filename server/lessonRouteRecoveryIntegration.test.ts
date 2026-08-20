import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Router } from "../client/src/App";
import ErrorBoundary from "../client/src/components/ErrorBoundary";

vi.mock("../client/src/pages/Lesson", () => ({
  default: () => {
    throw new Error("falha simulada da rota de lição");
  },
}));

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

beforeEach(() => {
  vi.stubGlobal("React", { createElement });
  const location = {
    pathname: "/lesson/42",
    search: "",
    hash: "",
    protocol: "https:",
    host: "multilingue.test",
    href: "https://multilingue.test/lesson/42",
    assign: vi.fn(),
  };
  vi.stubGlobal("location", location);
  vi.stubGlobal("history", { state: null, pushState: vi.fn(), replaceState: vi.fn() });
  vi.stubGlobal("addEventListener", vi.fn());
  vi.stubGlobal("removeEventListener", vi.fn());
  vi.stubGlobal("window", {
    location,
    history: globalThis.history,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    setTimeout,
    clearTimeout,
  });
});

describe("integração de recuperação da rota /lesson/:id", () => {
  it("navega para a rota real, captura o erro em Lesson localmente e não mostra a fronteira global", async () => {
    vi.useFakeTimers();
    Object.assign(window, { setTimeout, clearTimeout });
    let renderer: ReactTestRenderer | undefined;

    await act(async () => {
      renderer = create(createElement(ErrorBoundary, null, createElement(Router)));
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(JSON.stringify(renderer?.toJSON())).toContain("Restaurando a lição");
    expect(JSON.stringify(renderer?.toJSON())).not.toContain("Algo deu errado");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(250);
    });

    expect(JSON.stringify(renderer?.toJSON())).toContain("Lição temporariamente indisponível");
    expect(JSON.stringify(renderer?.toJSON())).not.toContain("Algo deu errado");
  });
});
