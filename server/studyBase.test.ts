import { describe, expect, it } from "vitest";
import { getStudyBaseTeacherReply, searchStudyBase } from "../client/src/lib/studyBase";

describe("Base de Estudos A1", () => {
  it("encontra conhecimento por termo em português e inglês", () => {
    expect(searchStudyBase("piscina").map((entry) => entry.id)).toContain("a1-where-is");
    expect(searchStudyBase("hello").map((entry) => entry.id)).toContain("a1-introduce-yourself");
    expect(searchStudyBase("hotel").map((entry) => entry.id)).toContain("a1-where-is");
  });

  it("filtra por tipo de conhecimento e nível", () => {
    expect(searchStudyBase("", "grammar", "A1").every((entry) => entry.kind === "grammar")).toBe(true);
    expect(searchStudyBase("", "all", "A2")).toHaveLength(0);
  });

  it("oferece orientação contextual sem repetir conteúdo ofensivo", () => {
    const entry = searchStudyBase("mom")[0]!;
    const reply = getStudyBaseTeacherReply(entry, "you are stupid");
    expect(reply).toContain("prática respeitosa");
    expect(reply.toLowerCase()).not.toContain("stupid");
  });
});
