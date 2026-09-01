import {
  beginEvidenceInteraction,
  createGameProgress,
  enterProgressScreen,
  isPublicStartScreen,
  readGameProgressFromRequest,
  recordAnalyzedEvidence,
  recordCollectedEvidenceFromInteraction,
  serializeGameProgressCookie
} from "@/lib/server/gameProgress";
import type { GameProgress, GameTheme } from "@/lib/gameProgressTypes";

type ProgressRequest = {
  action?: "enter" | "inspect" | "collect" | "analyze" | "reset";
  theme?: GameTheme;
  screenId?: string;
  evidenceName?: string;
  interactionToken?: string;
};

function isTheme(value: unknown): value is GameTheme {
  return value === "joseon" || value === "magicSchool" || value === "spaceStation";
}

async function progressResponse(progress: GameProgress, status = 200, extra: Record<string, unknown> = {}) {
  return Response.json(
    {
      ok: true,
      theme: progress.theme,
      currentScreen: progress.currentScreen,
      collectedEvidenceCount: progress.collectedEvidenceNames.length,
      ...extra
    },
    { status, headers: { "Set-Cookie": await serializeGameProgressCookie(progress) } }
  );
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as ProgressRequest | null;
  if (!body || !isTheme(body.theme) || !body.action) {
    return Response.json({ error: "올바르지 않은 진행 요청입니다." }, { status: 400 });
  }

  const existing = await readGameProgressFromRequest(request, body.theme);

  if (body.action === "reset") {
    return progressResponse(createGameProgress(body.theme));
  }

  if (body.action === "enter") {
    if (!body.screenId) return Response.json({ error: "이동할 화면이 없습니다." }, { status: 400 });
    const progress = existing || (isPublicStartScreen(body.screenId) ? createGameProgress(body.theme) : null);
    if (!progress) return Response.json({ error: "정상 플레이로 해금되지 않은 장소입니다." }, { status: 403 });
    const next = enterProgressScreen(progress, body.screenId);
    if (!next) return Response.json({ error: "아직 해금되지 않은 장소입니다." }, { status: 403 });
    return progressResponse(next);
  }

  if (!existing) {
    return Response.json({ error: "서버 진행 기록이 없습니다. 사건 브리핑부터 시작해 주세요." }, { status: 403 });
  }

  if (body.action === "inspect") {
    if (!body.screenId || !body.evidenceName) {
      return Response.json({ error: "확인할 증거 정보가 없습니다." }, { status: 400 });
    }
    const next = beginEvidenceInteraction(existing, body.screenId, body.evidenceName);
    if (!next?.pendingEvidenceInteraction) {
      return Response.json({ error: "현재 장소에서 확인할 수 없는 증거입니다." }, { status: 403 });
    }
    return progressResponse(next, 200, { interactionToken: next.pendingEvidenceInteraction.token });
  }

  if (body.action === "collect") {
    if (!body.screenId || !body.evidenceName || !body.interactionToken) {
      return Response.json({ error: "증거를 먼저 현장에서 확인해 주세요." }, { status: 400 });
    }
    const next = recordCollectedEvidenceFromInteraction(
      existing,
      body.screenId,
      body.evidenceName,
      body.interactionToken
    );
    if (!next) {
      return Response.json({ error: "증거 확인 시간이 지났거나 확인표가 올바르지 않습니다." }, { status: 403 });
    }
    return progressResponse(next);
  }

  if (body.action === "analyze") {
    if (!body.evidenceName) return Response.json({ error: "감식 정보가 없습니다." }, { status: 400 });
    const next = recordAnalyzedEvidence(existing, body.evidenceName);
    if (!next) return Response.json({ error: "수집되지 않은 증거는 감식할 수 없습니다." }, { status: 403 });
    return progressResponse(next);
  }

  return Response.json({ error: "지원하지 않는 진행 요청입니다." }, { status: 400 });
}
