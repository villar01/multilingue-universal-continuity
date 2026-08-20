import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { LessonRecoveryBoundary } from "../client/src/components/LessonRecoveryBoundary";

const root = path.resolve(import.meta.dirname, "..");
const appSource = readFileSync(path.join(root, "client/src/App.tsx"), "utf8");
const boundarySource = readFileSync(path.join(root, "client/src/components/LessonRecoveryBoundary.tsx"), "utf8");

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("recuperação local da lição", () => {
  it("contém somente a rota de lição e preserva o aplicativo", () => {
    expect(appSource).toContain('import { LessonRecoveryBoundary } from "./components/LessonRecoveryBoundary"');
    expect(appSource).toContain("const ResilientLesson = () => (");
    expect(appSource).toContain('<Route path={"/lesson/:id"} component={ResilientLesson} />');
    expect(appSource).toContain("const ResilientStructuredLesson = () => (");
    expect(appSource).toContain('<Route path="/structured-lesson" component={ResilientStructuredLesson} />');
    expect(appSource).toContain("const ResilientCompleteLesson = () => (");
    expect(appSource).toContain('<Route path="/complete-lesson/:id" component={ResilientCompleteLesson} />');
    expect(appSource).toContain("const ResilientPracticeClips = () => (");
    expect(appSource).toContain('<Route path="/practice/clips" component={ResilientPracticeClips} />');
    expect(appSource).toContain("const ResilientVideoPlayer = () => (");
    expect(appSource).toContain('<Route path="/practice/clips/:id" component={ResilientVideoPlayer} />');
    expect(appSource).toContain("const ResilientImmersiveLesson = () => (");
    expect(appSource).toContain('<Route path="/immersive-lesson" component={ResilientImmersiveLesson} />');
    expect(appSource).toContain("const ResilientABCBook = () => (");
    expect(appSource).toContain('<Route path="/abc-book" component={ResilientABCBook} />');
    expect(appSource).toContain("const ResilientStudyBase = () => (");
    expect(appSource).toContain('<Route path="/base-de-estudos" component={ResilientStudyBase} />');
    expect(boundarySource).toContain("Lição temporariamente indisponível");
    expect(boundarySource).toContain('window.location.assign("/lessons-hub")');
    expect(boundarySource).toContain('window.location.assign("/dashboard")');
  });

  it("tenta uma única recuperação automática e limitada antes das saídas", () => {
    expect(boundarySource).toContain("autoRecoveryUsed: boolean");
    expect(boundarySource).toContain("if (!this.state.autoRecoveryUsed)");
    expect(boundarySource).toContain("}, 250);");
    expect(boundarySource).toContain("Seu progresso permanece preservado");
  });

  it("recupera uma falha real uma única vez sem acionar a fronteira global", () => {
    vi.useFakeTimers();
    vi.stubGlobal("window", { setTimeout, clearTimeout, location: { assign: vi.fn() } });

    const boundary = new LessonRecoveryBoundary({ children: "lição protegida" });
    Object.defineProperty(boundary, "setState", {
      value: (update: unknown) => {
        const patch = typeof update === "function"
          ? (update as (state: typeof boundary.state) => Partial<typeof boundary.state>)(boundary.state)
          : update as Partial<typeof boundary.state>;
        boundary.state = { ...boundary.state, ...patch };
      },
    });

    expect(LessonRecoveryBoundary.getDerivedStateFromError()).toEqual({ hasError: true });
    boundary.state = { hasError: true, retryKey: 0, autoRecoveryUsed: false, isRecovering: false };
    boundary.componentDidCatch(new Error("falha de lição"), { componentStack: "Lesson" });
    expect(boundary.state.isRecovering).toBe(true);

    vi.advanceTimersByTime(250);
    expect(boundary.state).toMatchObject({ hasError: false, retryKey: 1, autoRecoveryUsed: true, isRecovering: false });

    boundary.state = { hasError: true, retryKey: 1, autoRecoveryUsed: true, isRecovering: false };
    boundary.componentDidCatch(new Error("falha repetida"), { componentStack: "Lesson" });
    vi.runAllTimers();
    expect(boundary.state).toMatchObject({ hasError: true, retryKey: 1, autoRecoveryUsed: true, isRecovering: false });
  });

});
