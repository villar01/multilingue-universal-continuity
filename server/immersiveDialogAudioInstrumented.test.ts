import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const sceneSource = fs.readFileSync(path.resolve(process.cwd(), "client/src/pages/ImmersiveScene.tsx"), "utf8");

describe("controle instrumental do áudio imersivo", () => {
  it("mantém um único elemento de áudio e expõe posição e duração medidas pela mesma faixa", () => {
    expect(sceneSource).toContain('const [dialogAudioDuration, setDialogAudioDuration] = useState<number | null>(null);');
    expect(sceneSource).toContain("setDialogAudioDuration(audio.duration);");
    expect(sceneSource).toContain("setDialogAudioPosition(audio.currentTime);");
    expect(sceneSource).toContain('ref={dialogAudioElementRef}');
    expect(sceneSource).toContain('aria-label={`Controle de áudio da fala de ${(teachingScene ?? selectedScene).teacherName}`}');
    expect(sceneSource).toContain('aria-label={`Posição da fala de ${(teachingScene ?? selectedScene).teacherName}`}');
    expect(sceneSource).toContain('max={dialogAudioDuration || 0}');
  });

  it("mantém a barra nativa oculta e evita sobreposição sobre a frase ou os exercícios", () => {
    expect(sceneSource).toContain("controls={false}");
    expect(sceneSource).toContain('className="sr-only"');
    expect(sceneSource).not.toContain('className="hidden"');
    expect(sceneSource).not.toContain('top-[160px] z-[75] h-9');
    expect(sceneSource).not.toContain('bottom-[112px] left-1/2 z-[75]');
  });
});
