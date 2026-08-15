import { describe, expect, it } from "vitest";
import { getSceneTutorReply } from "../client/src/lib/immersiveSceneTutor";

const beachObjects = [
  { id: "ocean", label: "ocean", translation: "oceano", example: "The ocean is blue." },
  { id: "palm", label: "palm tree", translation: "palmeira" },
];

describe("tutor contextual da cena imersiva", () => {
  it("responde a pergunta livre sobre pool sem depender de alternativa estática", () => {
    expect(getSceneTutorReply("what is pool?", beachObjects)?.text).toContain("piscina");
  });

  it("explica objetos visíveis pelo vocabulário da cena", () => {
    expect(getSceneTutorReply("what is ocean?", beachObjects)?.text).toContain("oceano");
  });

  it("responde perguntas livres fora das alternativas usando o contexto da cena", () => {
    expect(getSceneTutorReply("where is my house near to the beach?", beachObjects)?.text).toContain("can’t see a house");
  });

  it("recusa linguagem abusiva sem repetir ofensa ao aluno", () => {
    const reply = getSceneTutorReply("you are an asshole", beachObjects);
    expect(reply?.blocked).toBe(true);
    expect(reply?.text).toContain("respectful");
  });
});
