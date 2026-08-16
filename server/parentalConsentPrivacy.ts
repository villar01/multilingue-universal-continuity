/**
 * Owner notifications are intentionally non-identifying. Guardian data remains
 * in the protected consent record only when it is required for that record.
 */
export function createParentalConsentNotification() {
  return {
    title: "Novo consentimento parental confirmado",
    content: "Um consentimento parental para uma conta de menor foi registrado. Consulte o painel administrativo autorizado somente se uma revisão for necessária.",
  };
}
