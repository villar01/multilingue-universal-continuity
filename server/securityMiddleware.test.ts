import { afterEach, describe, expect, it, vi } from "vitest";
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

  it("permite o burst de ativos de múltiplas cenas antes do bloqueio global", () => {
    const request = createRequest("198.51.100.30", {}, "/assets/scene_beach.jpg");
    for (let count = 0; count < 1500; count += 1) {
      securityMiddleware(request as any, createResponse() as any, () => undefined);
    }
    const sceneBurstResponse = createResponse();
    let sceneBurstContinued = false;
    securityMiddleware(request as any, sceneBurstResponse as any, () => { sceneBurstContinued = true; });
    expect(sceneBurstContinued).toBe(true);
    expect(sceneBurstResponse.statusCode).toBe(200);

    for (let count = 1501; count <= 2000; count += 1) {
      securityMiddleware(request as any, createResponse() as any, () => undefined);
    }
    const response = createResponse();
    securityMiddleware(request as any, response as any, () => undefined);
    expect(response.statusCode).toBe(429);
    expect(response.body).toEqual({ error: "Servidor sobrecarregado. Tente novamente." });
  });

  it("não deixa o excesso de uma origem bloquear a navegação legítima de outra", () => {
    const abusiveIp = "198.51.100.32";
    const legitimateIp = "198.51.100.33";
    for (let count = 0; count < 2000; count += 1) {
      securityMiddleware(createRequest(abusiveIp, {}, "/assets/scene_beach.jpg") as any, createResponse() as any, () => undefined);
    }

    const abusiveResponse = createResponse();
    securityMiddleware(createRequest(abusiveIp, {}, "/assets/scene_beach.jpg") as any, abusiveResponse as any, () => undefined);
    expect(abusiveResponse.statusCode).toBe(429);

    const legitimateResponse = createResponse();
    let continued = false;
    securityMiddleware(createRequest(legitimateIp, {}, "/immersive-scene?scene=beach") as any, legitimateResponse as any, () => { continued = true; });
    expect(continued).toBe(true);
    expect(legitimateResponse.statusCode).toBe(200);

    const apiResponse = createResponse();
    let apiContinued = false;
    securityMiddleware(createRequest(legitimateIp, {}, "/api/trpc/lessons.list?batch=1") as any, apiResponse as any, () => { apiContinued = true; });
    expect(apiContinued).toBe(true);
    expect(apiResponse.statusCode).toBe(200);
  });

  it("recupera uma origem depois que a janela de limitação expira", () => {
    const now = vi.spyOn(Date, "now").mockReturnValue(1_000);
    const ip = "198.51.100.34";
    for (let count = 0; count < 2000; count += 1) {
      securityMiddleware(createRequest(ip, {}, "/assets/scene_beach.jpg") as any, createResponse() as any, () => undefined);
    }

    const blockedResponse = createResponse();
    securityMiddleware(createRequest(ip, {}, "/assets/scene_beach.jpg") as any, blockedResponse as any, () => undefined);
    expect(blockedResponse.statusCode).toBe(429);

    now.mockReturnValue(61_001);
    const recoveredResponse = createResponse();
    let continued = false;
    securityMiddleware(createRequest(ip, {}, "/immersive-scene?scene=beach") as any, recoveredResponse as any, () => { continued = true; });
    expect(continued).toBe(true);
    expect(recoveredResponse.statusCode).toBe(200);
  });

  it("protege a memória sob muitas origens e mantém uma origem já atendida", () => {
    const existingIp = "203.0.0.0";
    for (let count = 0; count < 10_000; count += 1) {
      const ip = `203.0.${Math.floor(count / 256)}.${count % 256}`;
      securityMiddleware(createRequest(ip, {}, "/assets/scene_beach.jpg") as any, createResponse() as any, () => undefined);
    }

    const newOriginResponse = createResponse();
    securityMiddleware(createRequest("204.0.0.1", {}, "/assets/scene_beach.jpg") as any, newOriginResponse as any, () => undefined);
    expect(newOriginResponse.statusCode).toBe(429);
    expect(newOriginResponse.body).toEqual({ error: "Servidor temporariamente ocupado. Tente novamente." });

    const existingOriginResponse = createResponse();
    let continued = false;
    securityMiddleware(createRequest(existingIp, {}, "/immersive-scene?scene=beach") as any, existingOriginResponse as any, () => { continued = true; });
    expect(continued).toBe(true);
    expect(existingOriginResponse.statusCode).toBe(200);
  });

  it("libera buckets expirados no teto para novas origens e API legítima", () => {
    const now = vi.spyOn(Date, "now").mockReturnValue(1_000);
    for (let count = 0; count < 10_000; count += 1) {
      const ip = `205.0.${Math.floor(count / 256)}.${count % 256}`;
      securityMiddleware(createRequest(ip, {}, "/api/trpc/lessons.list?batch=1") as any, createResponse() as any, () => undefined);
    }

    now.mockReturnValue(61_001);
    const freshApiResponse = createResponse();
    let continued = false;
    securityMiddleware(createRequest("206.0.0.1", {}, "/api/trpc/lessons.list?batch=1") as any, freshApiResponse as any, () => { continued = true; });
    expect(continued).toBe(true);
    expect(freshApiResponse.statusCode).toBe(200);
  });

  it("mantém a API de uma origem já atendida quando o mapa de buckets está no teto", () => {
    const existingIp = "207.0.0.0";
    for (let count = 0; count < 10_000; count += 1) {
      const ip = `207.0.${Math.floor(count / 256)}.${count % 256}`;
      securityMiddleware(createRequest(ip, {}, "/api/trpc/lessons.list?batch=1") as any, createResponse() as any, () => undefined);
    }

    const response = createResponse();
    let continued = false;
    securityMiddleware(createRequest(existingIp, {}, "/api/trpc/lessons.list?batch=1") as any, response as any, () => { continued = true; });
    expect(continued).toBe(true);
    expect(response.statusCode).toBe(200);
  });

  it("mantém proteção mais estrita para rotas de autenticação", () => {
    const request = createRequest("198.51.100.28", {}, "/api/oauth/callback");
    for (let count = 0; count < 30; count += 1) securityMiddleware(request as any, createResponse() as any, () => undefined);
    const response = createResponse();
    securityMiddleware(request as any, response as any, () => undefined);
    expect(response.statusCode).toBe(429);
  });

  it("emite política restritiva e permite somente o enquadramento pela plataforma oficial", () => {
    const response = createResponse();
    let continued = false;
    securityMiddleware(createRequest("198.51.100.31", {}, "/immersive-scene") as any, response as any, () => { continued = true; });

    expect(continued).toBe(true);
    expect(response.headers["Content-Security-Policy"]).toContain("default-src 'self'");
    expect(response.headers["Content-Security-Policy"]).toContain("object-src 'none'");
    expect(response.headers["Content-Security-Policy"]).toContain("img-src 'self' data: blob: https://*.manuscdn.com https://d36hbw14aib5lz.cloudfront.net https://d2xsxph8kpxj0f.cloudfront.net");
    expect(response.headers["Content-Security-Policy"]).toContain("frame-ancestors 'self' https://manus.im https://*.manus.im https://*.manus.computer");
    expect(response.headers["Content-Security-Policy"]).toContain("media-src 'self' data: blob: https:");
    expect(response.headers["X-Frame-Options"]).toBeUndefined();
    expect(response.headers["X-Permitted-Cross-Domain-Policies"]).toBe("none");
  });
});
