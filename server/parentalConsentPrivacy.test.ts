import { describe, expect, it } from "vitest";
import { createParentalConsentNotification } from "./parentalConsentPrivacy";

describe("parental consent notification privacy", () => {
  it("contains no guardian identity, contact, document, age or account identifier", () => {
    const notification = createParentalConsentNotification();
    expect(notification.title).toBe("Novo consentimento parental confirmado");
    expect(notification.content).not.toMatch(/responsável:|e-mail|usuário id|idade|documento/i);
  });
});
