import { expect, test, type Locator, type Page } from "@playwright/test";

type WorldPoint = readonly [number, number];

async function canvasPoint(canvas: Locator, [worldX, worldY]: WorldPoint) {
  const box = await canvas.boundingBox();
  if (!box) throw new Error("편지 복원 캔버스의 위치를 찾지 못했습니다.");

  const aspect = box.width / box.height;
  const tangent = Math.tan((36 * Math.PI / 180) / 2);
  const verticalDistance = 7.15 / (2 * tangent);
  const horizontalDistance = (11.75 / aspect) / (2 * tangent);
  const cameraZ = Math.max(verticalDistance, horizontalDistance) + .45;
  const halfHeight = cameraZ * tangent;
  const halfWidth = halfHeight * aspect;

  return {
    x: box.x + (.5 + worldX / (2 * halfWidth)) * box.width,
    y: box.y + (.5 - worldY / (2 * halfHeight)) * box.height
  };
}

async function rotatePiece(page: Page, canvas: Locator, point: WorldPoint, times: number) {
  const screenPoint = await canvasPoint(canvas, point);
  for (let index = 0; index < times; index += 1) {
    await page.mouse.click(screenPoint.x, screenPoint.y);
    await page.waitForTimeout(180);
  }
}

async function dragPiece(page: Page, canvas: Locator, from: WorldPoint, to: WorldPoint) {
  const start = await canvasPoint(canvas, from);
  const end = await canvasPoint(canvas, to);
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(end.x, end.y, { steps: 18 });
  await page.mouse.up();
  await page.waitForTimeout(520);
}

test("찢어진 편지는 Three.js 조각을 맞춘 뒤에만 복원된다", async ({ page }) => {
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
  await page.getByRole("button", { name: "찢어진 편지 조각 조사" }).click();
  await page.getByRole("button", { name: "알림 닫기" }).click();
  await page.getByRole("button", { name: "보따리 열기" }).click();
  await page.getByRole("button", { name: "미확인 증거 찢어진 편지 조각" }).click();
  await page.getByRole("button", { name: "편지 조각 직접 맞추기" }).click();

  const canvas = page.getByLabel("입체 찢어진 약속 편지 복원대");
  await expect(canvas).toHaveAttribute("data-engine", /three\.js r\d+/);
  await expect.poll(async () => Number(await canvas.getAttribute("data-frame"))).toBeGreaterThan(2);

  await rotatePiece(page, canvas, [-3.55, -1.32], 1);
  await dragPiece(page, canvas, [-3.55, -1.32], [-2.02, .38]);
  await rotatePiece(page, canvas, [0, -1.5], 7);
  await dragPiece(page, canvas, [0, -1.5], [0, .38]);
  await rotatePiece(page, canvas, [3.55, -1.28], 6);
  await dragPiece(page, canvas, [3.55, -1.28], [1.92, .38]);

  await expect(page.locator(".joseon-letter-evidence-3d")).toHaveAttribute("data-assembled", "true");
  await expect(page.getByRole("button", { name: "복원 확인" })).toBeVisible();
});
