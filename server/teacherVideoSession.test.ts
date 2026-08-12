import { describe, expect, it } from "vitest";
import { canAttachTeacherVideo } from "../client/src/lib/teacherVideoSession";

describe("vídeo fotorrealista por sessão de fala", () => {
  it("aceita somente o vídeo concluído durante a mesma fala ativa", () => {
    expect(canAttachTeacherVideo(4, 4, true)).toBe(true);
  });

  it("descarta o vídeo que chega depois do fim ou de uma nova fala", () => {
    expect(canAttachTeacherVideo(4, 5, true)).toBe(false);
    expect(canAttachTeacherVideo(4, 4, false)).toBe(false);
  });
});
