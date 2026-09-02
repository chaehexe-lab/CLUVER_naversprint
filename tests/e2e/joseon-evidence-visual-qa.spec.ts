import { expect, test } from "@playwright/test";

const modes = [
  "hopaeMark",
  "diary",
  "silk",
  "bundle",
  "norigae",
  "bandage",
  "portrait",
  "hopaeThread",
  "pouch",
  "ledger",
  "shoeMud",
  "footprintTrace"
] as const;

const gestures: Record<(typeof modes)[number], {
  hotspot: readonly [number, number];
  direction: readonly [number, number];
  scale?: number;
  offset?: readonly [number, number];
}> = {
  hopaeMark: { hotspot: [.57, .69], direction: [-.72, -.7] },
  diary: { hotspot: [.77, .43], direction: [1, 0] },
  silk: { hotspot: [.2, .68], direction: [-1, 0], scale: .9, offset: [.015, 0] },
  bundle: { hotspot: [.75, .56], direction: [1, 0] },
  norigae: { hotspot: [.78, .27], direction: [.72, -.7], scale: .86, offset: [.01, 0] },
  bandage: { hotspot: [.88, .43], direction: [1, 0] },
  portrait: { hotspot: [.82, .76], direction: [.72, .7] },
  hopaeThread: { hotspot: [.64, .28], direction: [-1, 0] },
  pouch: { hotspot: [.5, .78], direction: [0, 1] },
  ledger: { hotspot: [.14, .51], direction: [1, 0] },
  shoeMud: { hotspot: [.27, .27], direction: [1, 0] },
  footprintTrace: { hotspot: [.84, .49], direction: [-1, 0] }
};

test("조선 증거 감식대 12종 시각 점검", async ({ page }) => {
  test.setTimeout(120_000);
  await page.request.post("/api/game/progress/", {
    data: { action: "reset", theme: "joseon" }
  });
  await page.request.post("/api/game/progress/", {
    data: { action: "enter", theme: "joseon", screenId: "fieldOne" }
  });
  await page.addInitScript(() => {
    window.localStorage.setItem("samunmong-field-guide-seen", "1");
  });
  await page.goto("/?start=fieldOne&theme=joseon");

  for (const mode of modes) {
    await page.evaluate((nextMode) => {
      const panel = document.getElementById("specialEvidencePuzzlePanel");
      const stage = document.getElementById("specialPuzzleStage");
      if (!panel || !stage) throw new Error("증거 감식대를 찾지 못했습니다.");
      panel.setAttribute("aria-hidden", "false");
      panel.classList.add("show");
      stage.dataset.specialMode = nextMode;
      window.dispatchEvent(new CustomEvent("samunmong:evidence-3d-open", { detail: { mode: nextMode } }));
    }, mode);

    const canvas = page.locator(".joseon-evidence-inspection-3d canvas");
    await expect(page.locator("#specialPuzzleStage")).toHaveAttribute("data-webgl-evidence", "ready");
    await expect(canvas).toHaveAttribute("data-mode", mode);
    await expect.poll(async () => Number(await canvas.getAttribute("data-frame"))).toBeGreaterThan(2);
    await page.waitForTimeout(180);
    await canvas.screenshot({ path: `test-results/qa-joseon-evidence/${mode}.png` });

    const box = await canvas.boundingBox();
    if (!box) throw new Error(`${mode} 감식대의 위치를 찾지 못했습니다.`);
    const gesture = gestures[mode];
    const scale = gesture.scale ?? 1;
    const offset = gesture.offset ?? [0, 0];
    const startX = box.x + box.width * (.5 + (gesture.hotspot[0] - .5) * scale + offset[0]);
    const startY = box.y + box.height * (.5 + (gesture.hotspot[1] - .5) * scale - offset[1]);
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(
      startX + box.width * .32 * gesture.direction[0],
      startY + box.height * .32 * gesture.direction[1],
      { steps: 20 }
    );
    await page.mouse.up();
    await expect.poll(async () => Number(await canvas.getAttribute("data-progress"))).toBeGreaterThan(.98);
    await canvas.screenshot({ path: `test-results/qa-joseon-evidence/${mode}-final.png` });
  }
});
