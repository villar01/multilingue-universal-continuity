import { afterEach, describe, expect, it } from "vitest";
import { __resetSecurityStateForTests, securityMiddleware } from "./securityMiddleware";

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

function createRequest(ip = "198.51.100.24", query: Record<string, unknown> = {}) {
  return {
    headers: { "user-agent": "MultiLingueLessonBrowser/1.0" },
    ip,
    socket: { remoteAddress: ip },
    query,
    body: {},
  };
}

describe("securityMiddleware", () => {
  afterEach(() => __resetSecurityStateForTests());

  it("permite a carga normal de uma aula com até 300 requisições por minuto", () => {
    const request = createRequest();
    for (let count = 0; count < 300; count += 1) {
      const response = createResponse();
      let continued = false;
      securityMiddleware(request as any, response as any, () => { continued = true; });
      expect(continued).toBe(true);
      expect(response.statusCode).toBe(200);
    }
  });

  it("bloqueia a 301ª requisição do mesmo IP dentro da janela", () => {
    const request = createRequest();
    for (let count = 0; count < 300; count += 1) {
      securityMiddleware(request as any, createResponse() as any, () => undefined);
    }
    const response = createResponse();
    securityMiddleware(request as any, response as any, () => undefined);
    expect(response.statusCode).toBe(429);
    expect(response.body).toEqual({ error: "Limite de requisicoes excedido." });
  });
});
