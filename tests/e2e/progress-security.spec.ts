import { expect, test, type APIRequestContext } from "@playwright/test";

async function enterScreen(
  request: APIRequestContext,
  theme: "joseon" | "spaceStation",
  screenId: string
) {
  const response = await request.post("/api/game/progress/", {
    data: { action: "enter", theme, screenId }
  });
  expect(response.ok()).toBeTruthy();
}

test("서버 성공 판정 없이 진실 해설을 열 수 없다", async ({ page }) => {
  await page.addInitScript(() => {
    window.sessionStorage.setItem("samunmong-truth-unlocked", "chunwol");
  });

  await page.goto("/interpretation/");

  await expect(page).not.toHaveURL(/\/interpretation$/);
});

test("현장 확인표 없이 증거를 직접 수집할 수 없다", async ({ request }) => {
  await request.post("/api/game/progress/", {
    data: { action: "reset", theme: "joseon" }
  });
  await enterScreen(request, "joseon", "fieldOne");

  const directCollect = await request.post("/api/game/progress/", {
    data: {
      action: "collect",
      theme: "joseon",
      screenId: "fieldOne",
      evidenceName: "찢어진 약속 편지"
    }
  });

  expect(directCollect.status()).toBe(400);
});

test("서버 확인표는 해당 장소와 증거에 한 번만 사용할 수 있다", async ({ request }) => {
  await request.post("/api/game/progress/", {
    data: { action: "reset", theme: "joseon" }
  });
  await enterScreen(request, "joseon", "fieldOne");

  const inspection = await request.post("/api/game/progress/", {
    data: {
      action: "inspect",
      theme: "joseon",
      screenId: "fieldOne",
      evidenceName: "찢어진 약속 편지"
    }
  });
  expect(inspection.ok()).toBeTruthy();
  const { interactionToken } = await inspection.json();

  const collect = await request.post("/api/game/progress/", {
    data: {
      action: "collect",
      theme: "joseon",
      screenId: "fieldOne",
      evidenceName: "찢어진 약속 편지",
      interactionToken
    }
  });
  expect(collect.ok()).toBeTruthy();

  const replay = await request.post("/api/game/progress/", {
    data: {
      action: "collect",
      theme: "joseon",
      screenId: "fieldOne",
      evidenceName: "찢어진 약속 편지",
      interactionToken
    }
  });
  expect(replay.status()).toBe(403);
});

test("실제 현장 클릭은 확인표 발급과 수집을 이어서 완료한다", async ({ page }) => {
  await page.request.post("/api/game/progress/", {
    data: { action: "reset", theme: "joseon" }
  });
  await enterScreen(page.request, "joseon", "fieldOne");
  await page.addInitScript(() => {
    window.localStorage.setItem("samunmong-field-guide-seen", "1");
  });

  await page.goto("/?start=fieldOne&theme=joseon");
  const letter = page.locator('[data-evidence-name="찢어진 약속 편지"]');
  await letter.click();

  await expect(letter).toHaveClass(/collected/);
  await expect(page.getByText("보따리에 담았습니다.")).toBeVisible();
});

test("우주 전력 접근 패널은 요청 전에는 렌더링을 가리지 않는다", async ({ page }) => {
  await page.request.post("/api/game/progress/", {
    data: { action: "reset", theme: "spaceStation" }
  });
  await enterScreen(page.request, "spaceStation", "spaceAirlock");

  await page.goto("/?start=spaceAirlock&theme=spaceStation");
  const panel = page.locator("#spacePowerAccessPanel");
  const overlay = page.locator("#spacePowerAccessOverlay");

  await expect(panel).toBeHidden();
  await expect(overlay).toHaveCSS("pointer-events", "none");

  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent("samunmong:space-power-access-request"));
  });
  await expect(panel).toBeVisible();

  await page.locator("#closeSpacePowerAccess").click();
  await expect(panel).toBeHidden();
});
