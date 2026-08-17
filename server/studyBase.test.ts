import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { filterStudyEntriesByUnit, getSentenceStarter, getSentenceTransformation, getStructuredStudyUnit, getStudyBaseTeacherReply, getStudyUnits, reviewStudySentence, reviewStudyTransformation, searchStudyBase } from "../client/src/lib/studyBase";
import { STRUCTURED_A1_UNITS, STUDY_BASE_A1_ENTRIES } from "./curriculum/studyBaseContent";

describe("Base de Estudos A1", () => {
  it("encontra conhecimento por termo em português e inglês", () => {
    expect(searchStudyBase(STUDY_BASE_A1_ENTRIES, "piscina").map((entry) => entry.id)).toContain("a1-where-is");
    expect(searchStudyBase(STUDY_BASE_A1_ENTRIES, "hello").map((entry) => entry.id)).toContain("a1-introduce-yourself");
    expect(searchStudyBase(STUDY_BASE_A1_ENTRIES, "hotel").map((entry) => entry.id)).toContain("a1-where-is");
  });

  it("filtra por tipo de conhecimento e nível", () => {
    expect(searchStudyBase(STUDY_BASE_A1_ENTRIES, "", "grammar", "A1").every((entry) => entry.kind === "grammar")).toBe(true);
    expect(searchStudyBase(STUDY_BASE_A1_ENTRIES, "", "all", "A2")).toHaveLength(0);
  });

  it("cobre unidades A1 autorais de identidade, necessidades, localização e rotina", () => {
    expect(searchStudyBase(STUDY_BASE_A1_ENTRIES, "water").map((entry) => entry.id)).toContain("a1-order-water");
    expect(searchStudyBase(STUDY_BASE_A1_ENTRIES, "preço").map((entry) => entry.id)).toContain("a1-ask-price");
    expect(searchStudyBase(STUDY_BASE_A1_ENTRIES, "perto").map((entry) => entry.id)).toContain("a1-near-location");
    expect(searchStudyBase(STUDY_BASE_A1_ENTRIES, "manhã").map((entry) => entry.id)).toContain("a1-morning-routine");
  });

  it("expõe a progressão curricular e filtra cada unidade sem perder a busca", () => {
    expect(getStudyUnits(STUDY_BASE_A1_ENTRIES, "A1")).toEqual([
      "Unidade 1 · Cumprimentos e identidade",
      "Unidade 2 · Necessidades imediatas",
      "Unidade 3 · Lugares e localização",
      "Unidade 4 · Pessoas e rotina",
      "Unidade 5 · Números, tempo e agenda",
      "Unidade 6 · Objetos, lugares e posse",
      "Unidade 7 · Ações, hábitos e necessidades",
      "Unidade 8 · Serviços, comida e escolhas",
      "Unidade 9 · Descrever, comparar e opinar",
      "Unidade 10 · Conversa, revisão e autonomia",
    ]);
    const locationUnit = filterStudyEntriesByUnit(searchStudyBase(STUDY_BASE_A1_ENTRIES, "", "all", "A1"), "Unidade 3 · Lugares e localização");
    expect(locationUnit.map((entry) => entry.id)).toEqual(["a1-where-is", "a1-near-location"]);
  });

  it("oferece cartilha original com texto, gramática, compreensão e escrita antes da revisão Pareto", () => {
    const unit = getStructuredStudyUnit(STRUCTURED_A1_UNITS, "Unidade 1 · Cumprimentos e identidade");
    expect(unit?.reading).toContain("My name is James");
    expect(unit?.grammarExplanation).toContain("My name is");
    expect(unit?.questions).toHaveLength(2);
    expect(unit?.writingPrompt).toContain("Escreva duas frases");
  });

  it("expande o primeiro volume contínuo com leitura, gramática, compreensão e escrita até a conversa", () => {
    expect(STRUCTURED_A1_UNITS).toHaveLength(7);
    expect(STRUCTURED_A1_UNITS.slice(1).every((unit) => unit.questions.length === 2)).toBe(true);
    expect(searchStudyBase(STUDY_BASE_A1_ENTRIES, "finally").map((entry) => entry.id)).toContain("a1-connect-ideas");
    expect(searchStudyBase(STUDY_BASE_A1_ENTRIES, "sandwich").map((entry) => entry.id)).toContain("a1-cafe-order");
  });

  it("oferece orientação contextual sem repetir conteúdo ofensivo", () => {
    const entry = searchStudyBase(STUDY_BASE_A1_ENTRIES, "mom")[0]!;
    const reply = getStudyBaseTeacherReply(entry, "you are stupid");
    expect(reply).toContain("prática respeitosa");
    expect(reply.toLowerCase()).not.toContain("stupid");
  });

  it("orienta criação de frases novas a partir da palavra Pareto", () => {
    const entry = searchStudyBase(STUDY_BASE_A1_ENTRIES, "where")[0]!;
    expect(getSentenceStarter(entry)).toBe("Where is the ___?");
    expect(reviewStudySentence(entry, "Where is the pool?")).toContain("modelo corretamente");
    expect(reviewStudySentence(entry, "Where is the hotel?")).toContain("Boa criação");
    expect(reviewStudySentence(entry, "I like the hotel")).toContain("inclua a palavra Pareto");
  });

  it("ensina a transformar o modelo mantendo a palavra Pareto", () => {
    const entry = searchStudyBase(STUDY_BASE_A1_ENTRIES, "pool")[0]!;
    expect(getSentenceTransformation(entry)).toMatchObject({ source: "Where is the pool?", hint: "Where is the hotel?" });
    expect(reviewStudyTransformation(entry, "Where is the pool?")).toContain("altere uma informação");
    expect(reviewStudyTransformation(entry, "Where is the hotel?")).toContain("Boa transformação");
  });

  it("apresenta a cena como exploração aplicada após o estudo, com retorno curricular", () => {
    const source = fs.readFileSync(path.resolve(import.meta.dirname, "../client/src/pages/StudyBase.tsx"), "utf8");
    expect(source).toContain("Explorar em cena");
    expect(source).toContain("interagir e retornar ao estudo");
    expect(source).toContain("openRelatedScene(activeEntry)");
  });
});
