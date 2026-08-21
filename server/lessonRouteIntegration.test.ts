import { act, Component, createElement, type ReactNode } from "react";
import { create } from "react-test-renderer";
import { Route, Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ResilientLesson } from "../client/src/App";

const FaultingLesson = () => {
  throw new Error("falha controlada da rota de lição");
};

class GlobalFallbackProbe extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    return this.state.hasError
      ? createElement("p", null, "Fallback global acionado")
      : this.props.children;
  }
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("integração da rota real de lição com recuperação local", () => {
  it("captura a falha em /lesson/:id na fronteira local sem uma fronteira global", () => {
    vi.useFakeTimers();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    vi.stubGlobal("window", { setTimeout, clearTimeout, location: { assign: vi.fn() } });
    const { hook } = memoryLocation({ path: "/lesson/controlled-failure", static: true });
    const RouteContent = () => createElement(ResilientLesson, null, createElement(FaultingLesson));

    let tree: ReturnType<typeof create>;
    act(() => {
      tree = create(
        createElement(Router, { hook }, createElement(GlobalFallbackProbe, null, createElement(Route, { path: "/lesson/:id", component: RouteContent }))),
      );
    });

    expect(JSON.stringify(tree!.toJSON())).toContain("Restaurando a lição");
    expect(JSON.stringify(tree!.toJSON())).not.toContain("Fallback global acionado");
    act(() => {
      vi.advanceTimersByTime(250);
    });
    const rendered = JSON.stringify(tree!.toJSON());
    expect(rendered).toContain("Lição temporariamente indisponível");
    expect(rendered).not.toContain("Fallback global acionado");

    const buttons = tree!.root.findAllByType("button");
    const controls = buttons.map((button) => button.children.filter((child): child is string => typeof child === "string").join(" "));
    expect(controls.some((control) => control.includes("Outras lições"))).toBe(true);
    expect(controls.some((control) => control.includes("Voltar ao painel"))).toBe(true);

    act(() => buttons[1].props.onClick());
    act(() => buttons[2].props.onClick());
    expect(window.location.assign).toHaveBeenCalledWith("/lessons-hub");
    expect(window.location.assign).toHaveBeenCalledWith("/dashboard");
  });
});
