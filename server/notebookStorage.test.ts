import { beforeEach, describe, expect, it } from "vitest";
import { addToNotebook, loadNotebook, saveNotebook } from "../client/src/lib/notebookStorage";

type NotebookStorage = Record<string, string>;

let storage: NotebookStorage;

beforeEach(() => {
  storage = {};
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => storage[key] ?? null,
      setItem: (key: string, value: string) => {
        storage[key] = value;
      },
    },
  });
});

describe("persistência do Caderno", () => {
  it("salva e recupera uma anotação sem mudar seus campos", () => {
    const entry = {
      id: "word-1",
      word: "beach",
      translation: "praia",
      pronunciation: "biːtʃ",
      example: "The beach is wide.",
      examplePt: "A praia é ampla.",
      langCode: "en-US",
      scene: "beach",
      addedAt: 1,
      reviewed: 0,
      starred: false,
    };

    saveNotebook([entry]);
    expect(loadNotebook()).toEqual([entry]);
  });

  it("reusa a palavra já salva e aumenta sua revisão", () => {
    const first = addToNotebook({
      word: "ocean",
      translation: "oceano",
      pronunciation: "ˈoʊʃən",
      example: "The ocean is blue.",
      examplePt: "O oceano é azul.",
      langCode: "en-US",
      scene: "beach",
    });
    const repeated = addToNotebook({
      word: "ocean",
      translation: "oceano",
      pronunciation: "ˈoʊʃən",
      example: "The ocean is blue.",
      examplePt: "O oceano é azul.",
      langCode: "en-US",
      scene: "beach",
    });

    expect(repeated.id).toBe(first.id);
    expect(repeated.reviewed).toBe(1);
    expect(loadNotebook()).toHaveLength(1);
  });
});
