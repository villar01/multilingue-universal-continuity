import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const router = readFileSync(resolve(process.cwd(), "server/customer-support-router.ts"), "utf8");
const page = readFileSync(resolve(process.cwd(), "client/src/pages/CustomerSupport.tsx"), "utf8");

describe("customer support sales intent", () => {
  it("records opt-in commercial interest only inside private support", () => {
    expect(router).toContain('"sales"');
    expect(page).toContain('"Tenho interesse"');
    expect(router).not.toContain("publishCampaign");
    expect(router).not.toContain("chargeCustomer");
  });
});
