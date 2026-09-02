import { finalCulpritId } from "@/lib/persona";
import type { GameTheme } from "@/lib/gameProgressTypes";
import {
  getMissingRequirements,
  readGameProgressFromRequest,
  recordAccusation,
  serializeGameProgressCookie
} from "@/lib/server/gameProgress";

const suspectIdsByTheme: Record<GameTheme, readonly string[]> = {
  joseon: ["dolsoe", "chunwol", "yoomunseok", "mudeok"],
  magicSchool: ["malpoi", "malposam", "malpoil"],
  spaceStation: ["harry", "mers", "aladdindin", "einspanner"]
};

const culpritByTheme: Record<GameTheme, string> = {
  joseon: process.env.SAMUNMONG_CULPRIT_ID || finalCulpritId,
  magicSchool: "malpoil",
  spaceStation: "mers"
};

function isTheme(value: unknown): value is GameTheme {
  return value === "joseon" || value === "magicSchool" || value === "spaceStation";
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { theme?: GameTheme; suspectId?: string } | null;
  if (!body || !isTheme(body.theme) || typeof body.suspectId !== "string") {
    return Response.json({ error: "올바르지 않은 지목 요청입니다." }, { status: 400 });
  }

  const progress = await readGameProgressFromRequest(request, body.theme);
  if (!progress) {
    return Response.json({ error: "검증할 수 있는 수사 기록이 없습니다." }, { status: 403 });
  }
  if (!suspectIdsByTheme[body.theme].includes(body.suspectId)) {
    return Response.json({ error: "이 사건의 용의자가 아닙니다." }, { status: 400 });
  }

  const missingRequirements = getMissingRequirements(progress);
  const correctSuspect = body.suspectId === culpritByTheme[body.theme];
  const hasInsufficientEvidence = body.theme !== "spaceStation" && missingRequirements.length > 0;
  const reason = hasInsufficientEvidence
    ? "insufficient-evidence"
    : correctSuspect
      ? "correct"
      : "incorrect-suspect";
  const outcome = reason === "correct" ? "success" : "failure";
  const accusation = {
    suspectId: body.suspectId,
    outcome,
    reason,
    accusedAt: Date.now()
  } as const;
  const next = recordAccusation(progress, accusation);

  return Response.json(
    { ok: true, verdict: accusation, missingRequirements },
    { headers: { "Set-Cookie": await serializeGameProgressCookie(next) } }
  );
}
