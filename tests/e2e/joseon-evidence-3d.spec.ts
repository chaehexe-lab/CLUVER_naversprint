import { expect, test } from "@playwright/test";

test("도망 보따리는 고화질 WebGL 감식대에서 끈을 당겨 연다", async ({ page }) => {
  await page.request.post("/api/game/progress/", {
    data: { action: "reset", theme: "joseon" }
  });
  await page.request.post("/api/game/progress/", {
    data: { action: "enter", theme: "joseon", screenId: "fieldOne" }
  });
  await page.request.post("/api/game/progress/", {
    data: { action: "enter", theme: "joseon", screenId: "dolsoeQuarters" }
  });
  await page.addInitScript(() => {
    window.localStorage.setItem("samunmong-field-guide-seen", "1");
  });

  await page.goto("/?start=dolsoeQuarters&theme=joseon");
  await page.getByRole("button", { name: "도망 보따리 조사" }).click();
  await page.getByRole("button", { name: "알림 닫기" }).click();
  await page.getByRole("button", { name: "보따리 열기" }).click();
  await page.getByRole("button", { name: "미확인 증거 단단히 묶인 보따리" }).click();
  await page.getByRole("button", { name: "보따리 매듭 직접 풀기" }).click();

  const canvas = page.getByLabel("붉은 매듭끈을 당겨 도망 보따리를 푸는 입체 감식대");
  await expect(canvas).toHaveAttribute("data-engine", /three\.js/);
  await expect.poll(async () => Number(await canvas.getAttribute("data-frame"))).toBeGreaterThan(2);
  await expect(page.getByRole("button", { name: "증거로 돌아가기" })).toBeVisible();

  const box = await canvas.boundingBox();
  if (!box) throw new Error("보따리 감식 캔버스의 위치를 찾지 못했습니다.");
  await page.mouse.click(box.x + box.width * .06, box.y + box.height * .08);
  await expect(page.locator("#specialPuzzleGuide")).toContainText("오른쪽으로 나온 붉은 끈");

  const startX = box.x + box.width * .75;
  const startY = box.y + box.height * .56;
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX + box.width * .27, startY, { steps: 24 });
  await page.mouse.up();

  await expect(page.locator("#specialEvidencePuzzlePanel")).toHaveClass(/interaction-complete/, { timeout: 5_000 });
});

test("증거 감식대는 키보드만으로도 조작을 완료할 수 있다", async ({ page }) => {
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
  await page.evaluate(() => {
    const panel = document.getElementById("specialEvidencePuzzlePanel");
    const stage = document.getElementById("specialPuzzleStage");
    if (!panel || !stage) throw new Error("증거 감식대를 찾지 못했습니다.");
    panel.setAttribute("aria-hidden", "false");
    panel.classList.add("show");
    stage.dataset.specialMode = "bandage";
    window.dispatchEvent(new CustomEvent("samunmong:evidence-3d-open", { detail: { mode: "bandage" } }));
  });

  const canvas = page.getByLabel("들린 붕대 끝을 잡아 피 묻은 붕대를 펼치는 입체 감식대");
  await expect(canvas).toHaveAttribute("data-mode", "bandage");
  await canvas.focus();
  await page.keyboard.press("Enter");
  await expect.poll(async () => Number(await canvas.getAttribute("data-progress"))).toBeGreaterThan(.98);
});

test("작은 가로 화면에서도 증거와 안내가 잘리지 않고 드래그할 수 있다", async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await page.request.post("/api/game/progress/", {
    data: { action: "reset", theme: "joseon" }
  });
  await page.request.post("/api/game/progress/", {
    data: { action: "enter", theme: "joseon", screenId: "fieldOne" }
  });
  await page.request.post("/api/game/progress/", {
    data: { action: "enter", theme: "joseon", screenId: "dolsoeQuarters" }
  });
  await page.addInitScript(() => {
    window.localStorage.setItem("samunmong-field-guide-seen", "1");
  });

  await page.goto("/?start=dolsoeQuarters&theme=joseon");
  await page.getByRole("button", { name: "도망 보따리 조사" }).click();
  await page.getByRole("button", { name: "알림 닫기" }).click();
  await page.getByRole("button", { name: "보따리 열기" }).click();
  await page.getByRole("button", { name: "미확인 증거 단단히 묶인 보따리" }).click();
  await page.getByRole("button", { name: "보따리 매듭 직접 풀기" }).click();

  const panel = page.locator("#specialEvidencePuzzlePanel");
  const canvas = page.getByLabel("붉은 매듭끈을 당겨 도망 보따리를 푸는 입체 감식대");
  await expect(canvas).toHaveAttribute("data-mode", "bundle");
  await expect(panel.locator("#specialPuzzleGuide")).toBeVisible();
  const panelBox = await panel.boundingBox();
  if (!panelBox) throw new Error("작은 화면의 감식 창을 찾지 못했습니다.");
  expect(panelBox.y).toBeGreaterThanOrEqual(0);
  expect(panelBox.y + panelBox.height).toBeLessThanOrEqual(390);
  await page.screenshot({ path: "test-results/qa-joseon-evidence/small-landscape-bundle-panel.png" });

  const box = await canvas.boundingBox();
  if (!box) throw new Error("작은 화면의 감식 캔버스를 찾지 못했습니다.");
  const startX = box.x + box.width * .75;
  const startY = box.y + box.height * .56;
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX + box.width * .3, startY, { steps: 18 });
  await page.mouse.up();
  await expect(panel).toHaveClass(/interaction-complete/, { timeout: 5_000 });
});
