import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const indexHtml = readFileSync(path.join(root, "client/index.html"), "utf8");

describe("análise agregada e privacidade", () => {
  it("mantém somente o script configurado de métricas agregadas", () => {
    expect(indexHtml).toContain('src="%VITE_ANALYTICS_ENDPOINT%/umami"');
    expect(indexHtml).toContain('data-website-id="%VITE_ANALYTICS_WEBSITE_ID%"');
    expect(indexHtml).not.toContain("googletagmanager.com");
    expect(indexHtml).not.toContain("connect.facebook.net");
    expect(indexHtml).not.toContain("G-XXXXXXXXXX");
    expect(indexHtml).not.toContain("YOUR_PIXEL_ID");
    expect(indexHtml).not.toContain("fbq(");
  });
});
