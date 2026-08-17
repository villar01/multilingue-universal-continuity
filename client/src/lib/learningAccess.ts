const PUBLIC_PRESENTATION_PATHS = new Set([
  "/",
  "/onboarding",
  "/terms",
  "/pricing",
  "/pricing-comparison",
  "/prelaunch",
  "/demo",
  "/checkout",
  "/upgrade",
]);

/**
 * Conteúdo pedagógico não pode ser servido a visitante anônimo. A página
 * inicial e os caminhos de cadastro, termos e apresentação permanecem públicos.
 */
export function requiresLearningEnrollment(pathname: string): boolean {
  const normalizedPath = pathname.split("?")[0].replace(/\/+$/, "") || "/";
  return !PUBLIC_PRESENTATION_PATHS.has(normalizedPath);
}

export function hasLearningAccess(input: { isAuthenticated: boolean; acceptedProtectionTerms: boolean }): boolean {
  return input.isAuthenticated && input.acceptedProtectionTerms;
}

export function createTrialLessonKey(pathname: string): string {
  const normalizedPath = pathname.split("?")[0].replace(/\/+$/, "") || "/";
  const lessonMatch = normalizedPath.match(/^\/lesson\/(\d+)$/);
  if (normalizedPath === "/immersive-scene") {
    const query = pathname.includes("?") ? pathname.slice(pathname.indexOf("?") + 1) : "";
    const sceneId = new URLSearchParams(query).get("scene")?.trim();
    return sceneId ? `scene:${sceneId}` : "scene:catalog";
  }
  return lessonMatch ? `lesson:${lessonMatch[1]}` : normalizedPath;
}
