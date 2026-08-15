import { describe, expect, it } from "vitest";
import { getSentenceStarter, getStudyBaseTeacherReply, reviewStudySentence, searchStudyBase } from "../client/src/lib/studyBase";

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

  it("cobre unidades A1 autorais de identidade, necessidades, localização e rotina", () => {
    expect(searchStudyBase("water").map((entry) => entry.id)).toContain("a1-order-water");
    expect(searchStudyBase("preço").map((entry) => entry.id)).toContain("a1-ask-price");
    expect(searchStudyBase("perto").map((entry) => entry.id)).toContain("a1-near-location");
    expect(searchStudyBase("manhã").map((entry) => entry.id)).toContain("a1-morning-routine");
  });

  it("oferece orientação contextual sem repetir conteúdo ofensivo", () => {
    const entry = searchStudyBase("mom")[0]!;
    const reply = getStudyBaseTeacherReply(entry, "you are stupid");
    expect(reply).toContain("prática respeitosa");
    expect(reply.toLowerCase()).not.toContain("stupid");
  });

  it("orienta criação de frases novas a partir da palavra Pareto", () => {
    const entry = searchStudyBase("where")[0]!;
    expect(getSentenceStarter(entry)).toBe("Where is the ___?");
    expect(reviewStudySentence(entry, "Where is the pool?")).toContain("modelo corretamente");
    expect(reviewStudySentence(entry, "Where is the hotel?")).toContain("Boa criação");
    expect(reviewStudySentence(entry, "I like the hotel")).toContain("inclua a palavra Pareto");
  });
});
