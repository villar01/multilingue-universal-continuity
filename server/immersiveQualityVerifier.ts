import { IMMERSIVE_SCENES } from "../client/src/lib/immersiveScenesCatalog";
import { SECURE_SCENE_SEEDS, type SecureSceneSeed } from "./curriculum/secureSceneSeeds";
import type { MaintenanceVerification } from "../shared/continuousMaintenanceContract";

type QualityScene = {
  id: string;
  bgImage: string;
  teacherImage: string;
  teacherName: string;
  teacherLang: string;
  langCode: string;
  dialog: unknown[];
  hotspots: unknown[];
};

export type ImmersiveQualityReport = {
  status: "passed" | "failed";
  issueCount: number;
  summary: string;
  verifications: readonly MaintenanceVerification[];
};

function verification(kind: "scene_catalog" | "teacher_media", passed: boolean, evidence: string): MaintenanceVerification {
  return { kind, status: passed ? "passed" : "failed", evidence };
}

/**
 * Auditoria estática, segura para Heartbeat: não abre mídia, não reproduz áudio,
 * não acessa contas e não altera produção. Ela apenas valida contratos canônicos.
 */
export function verifyImmersiveQuality(
  scenes: readonly QualityScene[] = IMMERSIVE_SCENES,
  seeds: Record<string, SecureSceneSeed> = SECURE_SCENE_SEEDS,
): ImmersiveQualityReport {
  const ids = scenes.map((scene) => scene.id);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  const invalidVisuals = scenes.filter((scene) => !scene.bgImage || !scene.teacherImage);
  const invalidTeacherMatrix = scenes.filter((scene) => !scene.teacherName || !scene.teacherLang || scene.teacherLang.split("-")[0] !== scene.langCode);
  const leakedPublicCurriculum = scenes.filter((scene) => scene.dialog.length > 0 || scene.hotspots.length > 0);
  const missingProtectedSeeds = scenes.filter((scene) => !seeds[scene.id] || seeds[scene.id].dialog.length === 0 || seeds[scene.id].hotspots.length === 0);

  const sceneCatalogOk = scenes.length === 29 && duplicateIds.length === 0 && invalidVisuals.length === 0;
  const teacherMediaOk = invalidTeacherMatrix.length === 0 && missingProtectedSeeds.length === 0 && leakedPublicCurriculum.length === 0;
  const issues = duplicateIds.length + invalidVisuals.length + invalidTeacherMatrix.length + missingProtectedSeeds.length + leakedPublicCurriculum.length + (scenes.length === 29 ? 0 : 1);
  const status = issues === 0 ? "passed" : "failed";

  return {
    status,
    issueCount: issues,
    summary: status === "passed"
      ? "Qualidade das 29 cenas verificada: matriz docente, mídia de prévia, currículo protegido e metadados de voz consistentes."
      : "A verificação encontrou inconsistências na matriz de cenas. Nenhuma alteração automática foi aplicada.",
    verifications: [
      verification("scene_catalog", sceneCatalogOk, sceneCatalogOk
        ? "As 29 cenas têm identificadores únicos e referências visuais presentes."
        : "Há contagem, identificador ou referência visual de cena inconsistente."),
      verification("teacher_media", teacherMediaOk, teacherMediaOk
        ? "Professor, idioma de voz, semente curricular protegida e prévia pública estão coerentes."
        : "Há professor, voz, semente protegida ou prévia pública inconsistente."),
    ],
  };
}
