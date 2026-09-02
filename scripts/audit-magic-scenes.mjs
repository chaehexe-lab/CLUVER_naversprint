import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("../node_modules/.pnpm/playwright@1.55.0/node_modules/playwright");

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = path.join(root, "artifacts", "magic-scene-audit");
const baseUrl = process.env.MAGIC_AUDIT_URL || "http://127.0.0.1:3147";
const build = process.env.MAGIC_AUDIT_BUILD || "baseline";
const review = process.env.MAGIC_AUDIT_REVIEW === "1";
const hideReviewOverlay = process.env.MAGIC_AUDIT_HIDE_OVERLAY === "1";
const captureDelayMs = Number(process.env.MAGIC_AUDIT_CAPTURE_DELAY_MS || 500);
const waitForLightning = process.env.MAGIC_AUDIT_WAIT_FOR_LIGHTNING === "1";
const verifyCollectionState = process.env.MAGIC_AUDIT_COLLECTION_STATE === "1";
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
  || "C:/Users/USER/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe";

const scenes = [
  "magicAlchemyLab",
  "magicCleaningCloset",
  "magicLibrary",
  "magicRecordCrystalRoom",
  "magicDormHallway"
];

const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "laptop", width: 1366, height: 768 }
];

const browser = await chromium.launch({ executablePath, headless: true });
const report = [];

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    const consoleErrors = [];
    const failedResponses = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("response", (response) => {
      if (response.status() >= 400) {
        failedResponses.push({ status: response.status(), url: response.url() });
      }
    });

    for (const sceneId of scenes) {
      const params = new URLSearchParams({ start: sceneId, theme: "magicSchool" });
      if (review) params.set("magicReview", "1");
      await page.goto(`${baseUrl}/?${params}`, { waitUntil: "networkidle" });
      await page.waitForSelector(`#${sceneId}.active .plate`, { state: "visible" });
      if (hideReviewOverlay) {
        await page.addStyleTag({ content: ".magic-evidence-review { display: none !important; }" });
      }
      await page.waitForTimeout(captureDelayMs);
      const hasLightning = await page.locator(`#${sceneId} canvas[data-has-lightning="true"]`).count() > 0;
      let lightningCaptured = false;
      if (waitForLightning && hasLightning) {
        await page.waitForFunction((activeSceneId) => {
          const canvas = document.getElementById(activeSceneId)?.querySelector("canvas[data-magic-scene-rig]");
          return Number(canvas?.dataset.lightning || 0) > 0.25;
        }, sceneId, { timeout: 12000, polling: 16 });
        const lightningDirectory = path.join(outputRoot, build, viewport.name);
        await mkdir(lightningDirectory, { recursive: true });
        await page.screenshot({ path: path.join(lightningDirectory, `${sceneId}-lightning.png`), fullPage: false });
        lightningCaptured = true;
      }

      const firstFrame = await page.evaluate((activeSceneId) =>
        Number(document.getElementById(activeSceneId)?.querySelector("canvas[data-magic-scene-rig]")?.dataset.frame || 0), sceneId);
      await page.waitForTimeout(650);
      const data = await page.evaluate((activeSceneId) => {
        const rootElement = document.getElementById(activeSceneId);
        const plate = rootElement?.querySelector(".plate");
        const rectToObject = (rect) => ({
          x: Number(rect.x.toFixed(2)),
          y: Number(rect.y.toFixed(2)),
          width: Number(rect.width.toFixed(2)),
          height: Number(rect.height.toFixed(2))
        });
        return {
          scene: rootElement ? rectToObject(rootElement.getBoundingClientRect()) : null,
          plate: plate ? rectToObject(plate.getBoundingClientRect()) : null,
          naturalSize: plate instanceof HTMLImageElement
            ? { width: plate.naturalWidth, height: plate.naturalHeight }
            : null,
          hotspots: Array.from(rootElement?.querySelectorAll(".hotspot[data-evidence-name]") || []).map((element) => ({
            name: element.dataset.evidenceName,
            rect: rectToObject(element.getBoundingClientRect()),
            clipPath: getComputedStyle(element).clipPath
          })),
          reviewOutlines: Array.from(rootElement?.querySelectorAll(".magic-review-visible-outline, .magic-review-hitbox-outline") || []).map((element) => {
            const style = getComputedStyle(element);
            return {
              kind: element.classList.contains("magic-review-hitbox-outline") ? "hitbox" : "visible",
              label: element.textContent?.trim(),
              rect: rectToObject(element.getBoundingClientRect()),
              borderColor: style.borderColor,
              opacity: style.opacity,
              display: style.display,
              clipPath: style.clipPath
            };
          }),
          rigFrames: Number(rootElement?.querySelector("canvas[data-magic-scene-rig]")?.dataset.frame || 0),
          lightningFlash: Number(rootElement?.querySelector("canvas[data-magic-scene-rig]")?.dataset.lightning || 0)
        };
      }, sceneId);
      data.rigFrameDelta = Math.max(0, data.rigFrames - firstFrame);

      const directory = path.join(outputRoot, build, viewport.name);
      await mkdir(directory, { recursive: true });
      await page.screenshot({ path: path.join(directory, `${sceneId}.png`), fullPage: false });
      let collectionState = null;
      if (verifyCollectionState) {
        collectionState = await page.evaluate(async (activeSceneId) => {
          const rootElement = document.getElementById(activeSceneId);
          const plate = rootElement?.querySelector(".plate");
          const before = plate instanceof HTMLImageElement ? plate.currentSrc : "";
          const evidenceNames = Array.from(rootElement?.querySelectorAll(".hotspot[data-evidence-name]") || [])
            .map((element) => element.dataset.evidenceName)
            .filter(Boolean);
          evidenceNames.forEach((name) => {
            rootElement?.querySelectorAll(`[data-evidence-name="${CSS.escape(name)}"]`).forEach((element) => {
              element.classList.add("collected");
              element.setAttribute("aria-disabled", "true");
            });
            rootElement?.querySelectorAll(`[data-evidence-prop="${CSS.escape(name)}"]`).forEach((element) => {
              element.classList.add("collected");
            });
          });
          await new Promise((resolve) => setTimeout(resolve, 280));
          const after = plate instanceof HTMLImageElement ? plate.currentSrc : "";
          const props = Array.from(rootElement?.querySelectorAll("[data-evidence-prop]") || []).map((element) => ({
            name: element.dataset.evidenceProp,
            opacity: getComputedStyle(element).opacity,
            collected: element.classList.contains("collected")
          }));
          return { before, after, backgroundUnchanged: Boolean(before) && before === after, props };
        }, sceneId);
      }
      report.push({
        viewport,
        sceneId,
        ...data,
        lightningCaptured,
        collectionState,
        consoleErrors: [...consoleErrors],
        failedResponses: [...failedResponses]
      });
      consoleErrors.length = 0;
      failedResponses.length = 0;
    }

    await context.close();
  }
} finally {
  await browser.close();
}

await mkdir(path.join(outputRoot, build), { recursive: true });
await writeFile(path.join(outputRoot, build, "report.json"), JSON.stringify(report, null, 2));
console.log(`Magic scene audit written to ${path.join(outputRoot, build)}`);
