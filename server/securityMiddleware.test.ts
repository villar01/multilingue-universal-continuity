import { afterEach, describe, expect, it } from "vitest";
import { __resetSecurityStateForTests, securityMiddleware } from "./securityMiddleware";
import { __resetAbuseProtectionForTests } from "./_core/abuseProtection";

function createResponse() {
  return {
    statusCode: 200,
    body: undefined as unknown,
    headers: {} as Record<string, string>,
    status(code: number) { this.statusCode = code; return this; },
    json(body: unknown) { this.body = body; return this; },
    setHeader(name: string, value: string) { this.headers[name] = value; },
  };
}

function createRequest(ip = "198.51.100.24", query: Record<string, unknown> = {}, path = "/api/trpc/lesson.start") {
  return {
    headers: { "user-agent": "MultiLingueLessonBrowser/1.0" },
    ip,
    socket: { remoteAddress: ip },
    path,
    originalUrl: path,
    query,
    body: {},
  };
}

describe("securityMiddleware", () => {
  afterEach(() => {
    __resetSecurityStateForTests();
    __resetAbuseProtectionForTests();
  });

  it("permite carga legítima de aula com até 300 chamadas de API por minuto", () => {
    const request = createRequest();
    for (let count = 0; count < 300; count += 1) {
      const response = createResponse();
      let continued = false;
      securityMiddleware(request as any, response as any, () => { continued = true; });
      expect(continued).toBe(true);
      expect(response.statusCode).toBe(200);
    }
  });

  it("bloqueia a 301ª chamada de API do mesmo IP dentro da janela", () => {
    const request = createRequest();
    for (let count = 0; count < 300; count += 1) {
      securityMiddleware(request as any, createResponse() as any, () => undefined);
    }
    const response = createResponse();
    securityMiddleware(request as any, response as any, () => undefined);
    expect(response.statusCode).toBe(429);
    expect(response.body).toEqual({ error: "Limite de requisicoes excedido." });
  });

  it("não cobra navegação e ativos estáticos no orçamento da API", () => {
    const staticRequest = createRequest("198.51.100.27", {}, "/immersive-scene?scene=beach");
    for (let count = 0; count < 650; count += 1) {
      const response = createResponse();
      let continued = false;
      securityMiddleware(staticRequest as any, response as any, () => { continued = true; });
      expect(continued).toBe(true);
    }
  });

  it("permite o burst observado da cena: consulta agrupada, health e estado da cena", () => {
    const ip = "198.51.100.29";
    const sceneBurst = [
      "/api/trpc/lessons.list,languages.list,auth.me?batch=1",
      "/api/trpc/system.health",
      "/api/trpc/immersive.sceneState",
    ];
    for (const path of sceneBurst) {
      const response = createResponse();
      let continued = false;
      securityMiddleware(createRequest(ip, {}, path) as any, response as any, () => { continued = true; });
      expect(continued).toBe(true);
      expect(response.statusCode).toBe(200);
    }
  });

  it("mantém o bloqueio global de DDoS após separar navegação e API", () => {
    const request = createRequest("198.51.100.30", {}, "/assets/scene_beach.jpg");
    for (let count = 0; count < 1000; count += 1) {
      securityMiddleware(request as any, createResponse() as any, () => undefined);
    }
    const response = createResponse();
    securityMiddleware(request as any, response as any, () => undefined);
    expect(response.statusCode).toBe(429);
    expect(response.body).toEqual({ error: "Servidor sobrecarregado. Tente novamente." });
  });

  it("mantém proteção mais estrita para rotas de autenticação", () => {
    const request = createRequest("198.51.100.28", {}, "/api/oauth/callback");
    for (let count = 0; count < 30; count += 1) securityMiddleware(request as any, createResponse() as any, () => undefined);
    const response = createResponse();
    securityMiddleware(request as any, response as any, () => undefined);
    expect(response.statusCode).toBe(429);
  });

  it("emite política de conteúdo restritiva sem bloquear recursos já usados pelo aplicativo", () => {
    const response = createResponse();
    let continued = false;
    securityMiddleware(createRequest("198.51.100.31", {}, "/immersive-scene") as any, response as any, () => { continued = true; });

    expect(continued).toBe(true);
    expect(response.headers["Content-Security-Policy"]).toContain("default-src 'self'");
    expect(response.headers["Content-Security-Policy"]).toContain("object-src 'none'");
    expect(response.headers["Content-Security-Policy"]).toContain("frame-ancestors 'none'");
    expect(response.headers["Content-Security-Policy"]).toContain("media-src 'self' data: blob: https:");
    expect(response.headers["X-Permitted-Cross-Domain-Policies"]).toBe("none");
  });
});
