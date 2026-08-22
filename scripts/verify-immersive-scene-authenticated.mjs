import { spawn } from "node:child_process";
import { chromium } from "playwright-core";

const baseUrl = process.env.IMMERSIVE_RELEASE_URL || "http://localhost:3000";
let ownedServer = null;

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function canReachApp() {
  try {
    const response = await fetch(`${baseUrl}/`);
    return response.ok;
  } catch {
    return false;
  }
}

async function ensureApp() {
  if (await canReachApp()) return;
  ownedServer = spawn("pnpm", ["run", "dev"], {
    cwd: process.cwd(),
    env: { ...process.env, NODE_ENV: "development" },
    stdio: "ignore",
  });

  const deadline = Date.now() + 25_000;
  while (Date.now() < deadline) {
    if (await canReachApp()) return;
    await wait(250);
  }
  throw new Error("A prévia local não ficou disponível para a checagem autenticada da Cena Imersiva.");
}

function responseData(procedure) {
  if (procedure === "auth.me") {
    return { id: 7001, openId: "release-gate-owner", name: "Release Gate", role: "admin" };
  }
  if (procedure === "compliance.checkAcceptance") return { accepted: true };
  if (procedure === "trialAccess.authorizeLesson") return { allowed: true };
  if (procedure === "curriculum.sceneCanonicalMaterial") {
    return {
      dialog: [{ speaker: "teacher", text: "Hello James learner.", textPt: "Olá estudante de James." }],
      hotspots: [{ id: "palm", label: "Palm Tree", translation: "Palmeira", pronunciation: "PAAM-tree", example: "The palm tree is tall.", examplePt: "A palmeira é alta.", icon: "🌴", x: 79, y: 24, color: "#22c55e" }],
    };
  }
  if (procedure === "curriculum.localizedSceneDialogue") return null;
  if (procedure === "curriculum.sceneInteractionProgression") return null;
  return null;
}

async function run() {
  await ensureApp();
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });

  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    await page.addInitScript(() => {
      localStorage.setItem("ml_native_lang", "pt-BR");
      localStorage.setItem("ml_target_lang", "en-US");
    });
    await page.route("**/api/trpc/**", async (route) => {
      const url = new URL(route.request().url());
      const suffix = url.pathname.split("/api/trpc/")[1] || "";
      const procedures = suffix.split(",").filter(Boolean);
      const payload = procedures.map((procedure) => ({ result: { data: { json: responseData(procedure) } } }));
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(payload) });
    });

    await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
    await page.evaluate(() => {
      const sceneLink = document.querySelector('a[href="/immersive-scene"]');
      if (!sceneLink) throw new Error("O link interno para a Cena Imersiva não foi encontrado.");
      sceneLink.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }));
    });
    await page.waitForSelector('img[alt="James"]', { timeout: 12_000 });
    await page.locator(".immersive-start-dialog").waitFor({ timeout: 12_000 });
    await page.getByText(/Ouvir apresentação de James/).waitFor({ timeout: 12_000 });
    await page.getByText("Praia Tropical", { exact: true }).first().waitFor({ timeout: 12_000 });
    const pageText = await page.locator("body").innerText();
    if (pageText.includes("Ativar acesso")) {
      throw new Error("A cena autenticada permaneceu no estado de ativação de acesso.");
    }
    await page.locator(".immersive-start-dialog").click();
    const dialogPanel = page.locator('.immersive-dialog[role="dialog"]');
    await dialogPanel.waitFor({ state: "visible", timeout: 12_000 });
    const panelBox = await dialogPanel.boundingBox();
    if (!panelBox || panelBox.y < 0 || panelBox.y + panelBox.height > 720) {
      throw new Error("O painel inferior do diálogo não permaneceu visível na apresentação autenticada.");
    }
    console.log("Checagem autenticada da Cena Imersiva aprovada: Praia Tropical, James, Iniciar Diálogo e painel inferior visível.");
  } finally {
    await browser.close();
  }
}

try {
  await run();
} finally {
  if (ownedServer) ownedServer.kill("SIGTERM");
}
