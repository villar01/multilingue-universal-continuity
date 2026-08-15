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
});
