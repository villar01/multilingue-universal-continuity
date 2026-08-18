import { describe, expect, it } from "vitest";
import { formatSceneTutorFeedback, getFreeDialogQuestionReply, shouldStartSceneTeacherAudio } from "../client/src/lib/immersiveDialogFlow";

const beachObjects = [
  { id: "ocean", label: "ocean", translation: "oceano" },
  { id: "palm", label: "palm tree", translation: "palmeira" },
];

describe("fluxo livre do diálogo imersivo", () => {
  it("solicita a primeira fala do professor independentemente de autenticação", () => {
    expect(shouldStartSceneTeacherAudio({ speaker: "teacher" })).toBe(true);
    expect(shouldStartSceneTeacherAudio({ speaker: "user" })).toBe(false);
  });

  it("retorna uma resposta contextual para pergunta livre antes de validar alternativas", () => {
    const reply = getFreeDialogQuestionReply("what is pool?", beachObjects);
    expect(reply?.text).toContain("piscina");
    expect(reply?.text).toContain("A pool is a place where people swim.");
    expect(reply?.nativeText).toContain("pool significa piscina");
    expect(reply?.immediate).toBe(true);
  });

  it("responde imediatamente se o aluno pergunta se o ocean é big and wide", () => {
    const reply = getFreeDialogQuestionReply("Is the ocean big and wide?", beachObjects);
    expect(reply?.text).toContain("The ocean can be big and wide.");
    expect(reply?.text).toContain("The ocean is big and wide.");
    expect(reply?.nativeText).toContain("O oceano pode ser grande e amplo.");
    expect(reply?.hotspotId).toBe("ocean");
    expect(reply?.immediate).toBe(true);
  });

  it("corrige uma pergunta singular com gramática inicial incorreta e mantém explicação em português", () => {
    const reply = getFreeDialogQuestionReply("where are this beach?", beachObjects);
    expect(reply?.text).toContain("Where is this beach?");
    expect(formatSceneTutorFeedback(reply!)).toContain("porque “beach” é singular");
  });

  it("corrige a mesma estrutura ao perguntar por um objeto visível", () => {
    const reply = getFreeDialogQuestionReply("where are this palm tree?", beachObjects);
    expect(reply?.text).toContain("Where is the palm tree?");
    expect(reply?.text).toContain("I can see the palm tree in this scene.");
    expect(reply?.hotspotId).toBe("palm");
  });

  it("não tenta responder a um envio vazio", () => {
    expect(getFreeDialogQuestionReply("   ", beachObjects)).toBeNull();
  });
});
