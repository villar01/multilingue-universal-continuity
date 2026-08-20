import { describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ActivityRecoveryBoundary } from "../client/src/components/ActivityRecoveryBoundary";

const root = process.cwd();
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), "utf8");

describe("recuperação local de atividades", () => {
  it("mantém falhas interativas fora da fronteira global com uma tentativa única", () => {
    const boundary = read("client/src/components/ActivityRecoveryBoundary.tsx");
    expect(boundary).toContain("autoRecoveryUsed");
    expect(boundary).toContain("Restaurando a atividade");
    expect(boundary).toContain("O restante do aplicativo continua disponível.");
    expect(boundary).toContain('window.location.assign("/dashboard")');
  });

  it("recupera uma falha simulada uma vez e mantém o fallback local depois de nova falha", () => {
    let runRecovery: (() => void) | undefined;
    vi.stubGlobal("window", {
      setTimeout: (callback: () => void) => {
        runRecovery = callback;
        return 1;
      },
      clearTimeout: vi.fn(),
      location: { assign: vi.fn() },
    });
    vi.stubGlobal("React", React);

    const boundary = new ActivityRecoveryBoundary({ activityLabel: "o modo de realidade aumentada", children: "atividade AR" });
    (boundary as any).setState = (update: any) => {
      const next = typeof update === "function" ? update(boundary.state) : update;
      boundary.state = { ...boundary.state, ...next };
    };

    boundary.state = { ...boundary.state, ...ActivityRecoveryBoundary.getDerivedStateFromError() };
    boundary.componentDidCatch(new Error("camera unavailable"), { componentStack: "\n at ARMode" });
    expect(boundary.state).toMatchObject({ hasError: true, isRecovering: true, autoRecoveryUsed: false });

    runRecovery?.();
    expect(boundary.state).toMatchObject({ hasError: false, isRecovering: false, autoRecoveryUsed: true, retryKey: 1 });
    expect((boundary.render() as any).props.children).toBe("atividade AR");

    boundary.state = { ...boundary.state, hasError: true, isRecovering: false };
    const fallbackMarkup = renderToStaticMarkup(boundary.render() as any);
    expect(fallbackMarkup).toContain("Atividade temporariamente indisponível");
    expect(fallbackMarkup).toContain("O restante do aplicativo continua disponível.");
    vi.unstubAllGlobals();
  });

  it("protege vídeos, Reels, revisões, Pareto, diálogo, roleplay, batalha e experiências de realidade aumentada com a fronteira local", () => {
    const app = read("client/src/App.tsx");
    expect(app).toContain("const ResilientInteractiveVideos");
    expect(app).toContain('<Route path="/interactive-videos" component={ResilientInteractiveVideos} />');
    expect(app).toContain("const ResilientReels");
    expect(app).toContain('<Route path="/reels" component={ResilientReels} />');
    expect(app).toContain("const ResilientRoleplay");
    expect(app).toContain('<Route path="/roleplay" component={ResilientRoleplay} />');
    expect(app).toContain("const ResilientARMode");
    expect(app).toContain('<Route path="/ar-mode" component={ResilientARMode} />');
    expect(app).toContain('<Route path="/ar-ultimate" component={ResilientARMode} />');
    expect(app).toContain("const ResilientVRConversation");
    expect(app).toContain('<Route path="/vr-conversation" component={ResilientVRConversation} />');
    expect(app).toContain("const ResilientWordGame");
    expect(app).toContain('<Route path="/word-game" component={ResilientWordGame} />');
    expect(app).toContain("const ResilientBattleMode");
    expect(app).toContain('<Route path="/battle" component={ResilientBattleMode} />');
    expect(app).toContain("const ResilientFreeTalk");
    expect(app).toContain('<Route path="/free-talk" component={ResilientFreeTalk} />');
    expect(app).toContain("const ResilientARTeacher");
    expect(app).toContain('<Route path="/ar-teacher" component={ResilientARTeacher} />');
    expect(app).toContain("const ResilientDailyMemory");
    expect(app).toContain('<Route path="/daily-memory" component={ResilientDailyMemory} />');
    expect(app).toContain("const ResilientSmartReview");
    expect(app).toContain('<Route path="/smart-review" component={ResilientSmartReview} />');
    expect(app).toContain("const ResilientPareto1000");
    expect(app).toContain('<Route path="/pareto-1000" component={ResilientPareto1000} />');
    expect(app).toContain("const ResilientImmersiveDialogue");
    expect(app).toContain('<Route path="/dialogue" component={ResilientImmersiveDialogue} />');
  });
});
