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
