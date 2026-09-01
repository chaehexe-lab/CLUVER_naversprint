import type {
  GameProgress,
  GameTheme,
  PendingEvidenceInteraction,
  VerifiedAccusation
} from "@/lib/gameProgressTypes";

const COOKIE_PREFIX = "samunmong_progress";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const MAX_PROGRESS_AGE_MS = COOKIE_MAX_AGE_SECONDS * 1000;
const EVIDENCE_INTERACTION_MAX_AGE_MS = 30 * 1000;
const publicScreens = new Set(["tutorialScreen", "dreamScreen", "briefingScreen"]);

const joseonInvestigationScreens = [
  "fieldOne",
  "chunwolRoom",
  "mudeokServantRoom",
  "yoomunseokSarangbang",
  "dolsoeQuarters",
  "backGateCourtyard",
  "interrogationScreen"
];

const spaceInvestigationScreens = [
  "spaceAirlock",
  "spaceMedicalBay",
  "spaceDataCore",
  "spaceScienceLab",
  "interrogationScreen"
];

const magicProgression = [
  { screenId: "magicAlchemyLab", evidence: ["부러진 지팡이", "화염 감지 룬스톤", "기록의 수정구"] },
  { screenId: "magicCleaningCloset", evidence: ["금지된 마법 담배 재"] },
  { screenId: "magicLibrary", evidence: ["도서관 대출 기록부", "빙결 흔적이 남은 반납 도서"] },
  { screenId: "magicRecordCrystalRoom", evidence: ["조작된 기록 수정구"] },
  { screenId: "magicDormHallway", evidence: ["버려진 지팡이 조각"] },
  { screenId: "interrogationScreen", evidence: [] }
] as const;

const evidenceScreens: Record<GameTheme, Record<string, string[]>> = {
  joseon: {
    "찢어진 약속 편지": ["fieldOne"],
    "호패 조각": ["fieldOne"],
    "점순의 목 압박 흔적": ["briefingScreen", "fieldOne"],
    "점순의 손톱 밑 흔적": ["briefingScreen", "fieldOne"],
    "고름이 뜯긴 저고리": ["chunwolRoom"],
    "돌쇠의 그림": ["chunwolRoom"],
    "무덕의 번진 일기": ["mudeokServantRoom"],
    "진흙 묻은 짚신": ["mudeokServantRoom"],
    "찢어진 옷고름": ["mudeokServantRoom"],
    "빈 호패 주머니": ["yoomunseokSarangbang"],
    "하인 장부": ["yoomunseokSarangbang"],
    "혼서 조각": ["yoomunseokSarangbang"],
    "피 묻은 붕대": ["dolsoeQuarters"],
    "도망 보따리": ["dolsoeQuarters"],
    "작은 발자국": ["backGateCourtyard"],
    "끊어진 호패끈": ["backGateCourtyard"],
    "긁힌 팔 흔적": ["interrogationScreen"],
    "돌쇠의 팔 상처": ["interrogationScreen"]
  },
  magicSchool: {
    "부러진 지팡이": ["magicAlchemyLab"],
    "화염 감지 룬스톤": ["magicAlchemyLab"],
    "기록의 수정구": ["magicAlchemyLab"],
    "금지된 마법 담배 재": ["magicCleaningCloset"],
    "도서관 대출 기록부": ["magicLibrary"],
    "빙결 흔적이 남은 반납 도서": ["magicLibrary"],
    "조작된 기록 수정구": ["magicRecordCrystalRoom"],
    "버려진 지팡이 조각": ["magicDormHallway"],
    "말포삼의 자백": ["interrogationScreen"]
  },
  spaceStation: {
    "엔지니어 공구 클램프": ["spaceAirlock"],
    "추진 레버 결빙 기록": ["spaceAirlock"],
    "마지막 무전 기록": ["spaceAirlock"],
    "소독천과 장갑": ["spaceMedicalBay"],
    "삭제된 의료 기록": ["spaceMedicalBay"],
    "조작된 전압 센서": ["spaceOxygenGenerator"],
    "비인가 지연 타이머": ["spaceOxygenGenerator"],
    "접속 키카드 칩": ["spaceDataCore"],
    "암호화된 파일": ["spaceDataCore"],
    "암호화된 연구 보상 계약": ["spaceDataCore"],
    "혈액 시료 분석 기록": ["spaceScienceLab"],
    "미승인 약물": ["spaceScienceLab"],
    "전력 제어실 출입 카드": ["interrogationScreen"]
  }
};

export const requiredEvidenceByTheme: Record<GameTheme, readonly string[]> = {
  joseon: ["호패 조각", "점순의 목 압박 흔적", "찢어진 옷고름", "긁힌 팔 흔적", "찢어진 약속 편지"],
  magicSchool: ["부러진 지팡이", "화염 감지 룬스톤", "도서관 대출 기록부", "조작된 기록 수정구", "말포삼의 자백"],
  spaceStation: ["추진 레버 결빙 기록", "조작된 전압 센서", "비인가 지연 타이머", "삭제된 의료 기록", "접속 키카드 칩", "암호화된 파일", "마지막 무전 기록"]
};

export const requiredAnalysisByTheme: Record<GameTheme, readonly string[]> = {
  joseon: ["호패 조각", "찢어진 옷고름", "찢어진 약속 편지::먹빛 시험석"],
  magicSchool: [],
  spaceStation: []
};

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function getSecret() {
  const configured = process.env.GAME_STATE_SECRET;

  if (configured) return configured;
  if (process.env.NODE_ENV !== "production") return "samunmong-local-progress-secret";
  return null;
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function importSigningKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function isGameTheme(value: unknown): value is GameTheme {
  return value === "joseon" || value === "magicSchool" || value === "spaceStation";
}

function sanitizeStringArray(value: unknown) {
  return Array.isArray(value)
    ? unique(value.filter((item): item is string => typeof item === "string").slice(0, 80))
    : [];
}

function migrateEvidenceNames(theme: GameTheme, names: string[]) {
  if (theme !== "spaceStation") return names;
  return unique(names.map((name) =>
    name === "미승인 약물 앰풀" ? "미승인 약물" : name
  ));
}

function normalizeProgress(value: unknown, expectedTheme?: GameTheme): GameProgress | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<GameProgress>;
  if (candidate.version !== 1 || !isGameTheme(candidate.theme)) return null;
  if (expectedTheme && candidate.theme !== expectedTheme) return null;
  if (typeof candidate.currentScreen !== "string" || typeof candidate.updatedAt !== "number") return null;
  if (Date.now() - candidate.updatedAt > MAX_PROGRESS_AGE_MS) return null;

  const accusation = candidate.accusation;
  const normalizedAccusation: VerifiedAccusation | undefined =
    accusation &&
    typeof accusation.suspectId === "string" &&
    (accusation.outcome === "success" || accusation.outcome === "failure") &&
    (accusation.reason === "correct" || accusation.reason === "incorrect-suspect" || accusation.reason === "insufficient-evidence") &&
    typeof accusation.accusedAt === "number"
      ? accusation
      : undefined;
  const interaction = candidate.pendingEvidenceInteraction;
  const normalizedInteraction: PendingEvidenceInteraction | undefined =
    interaction &&
    typeof interaction.screenId === "string" &&
    typeof interaction.evidenceName === "string" &&
    typeof interaction.token === "string" &&
    typeof interaction.issuedAt === "number" &&
    Date.now() - interaction.issuedAt <= EVIDENCE_INTERACTION_MAX_AGE_MS
      ? interaction
      : undefined;

  return {
    version: 1,
    theme: candidate.theme,
    currentScreen: candidate.currentScreen,
    visitedScreens: sanitizeStringArray(candidate.visitedScreens),
    collectedEvidenceNames: migrateEvidenceNames(candidate.theme, sanitizeStringArray(candidate.collectedEvidenceNames)),
    analyzedEvidenceNames: migrateEvidenceNames(candidate.theme, sanitizeStringArray(candidate.analyzedEvidenceNames)),
    knownFactIds: sanitizeStringArray(candidate.knownFactIds),
    pendingEvidenceInteraction: normalizedInteraction,
    accusation: normalizedAccusation,
    updatedAt: candidate.updatedAt
  };
}

export function getProgressCookieName(theme: GameTheme) {
  return `${COOKIE_PREFIX}_${theme}`;
}

export function createGameProgress(theme: GameTheme): GameProgress {
  return {
    version: 1,
    theme,
    currentScreen: "briefingScreen",
    visitedScreens: ["briefingScreen"],
    collectedEvidenceNames: [],
    analyzedEvidenceNames: [],
    knownFactIds: [],
    updatedAt: Date.now()
  };
}

export async function signGameProgress(progress: GameProgress) {
  const secret = getSecret();
  if (!secret) throw new Error("GAME_STATE_SECRET 환경변수가 필요합니다.");
  const payload = bytesToBase64Url(new TextEncoder().encode(JSON.stringify(progress)));
  const key = await importSigningKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return `${payload}.${bytesToBase64Url(new Uint8Array(signature))}`;
}

export async function verifyGameProgressToken(token: string | undefined, expectedTheme?: GameTheme) {
  if (!token) return null;
  const secret = getSecret();
  if (!secret) return null;
  const separator = token.lastIndexOf(".");
  if (separator <= 0) return null;

  try {
    const payload = token.slice(0, separator);
    const signature = base64UrlToBytes(token.slice(separator + 1));
    const key = await importSigningKey(secret);
    const valid = await crypto.subtle.verify("HMAC", key, signature, new TextEncoder().encode(payload));
    if (!valid) return null;
    const decoded = new TextDecoder().decode(base64UrlToBytes(payload));
    return normalizeProgress(JSON.parse(decoded), expectedTheme);
  } catch {
    return null;
  }
}

export function parseCookieHeader(header: string | null) {
  const values = new Map<string, string>();
  header?.split(";").forEach((entry) => {
    const separator = entry.indexOf("=");
    if (separator < 0) return;
    values.set(entry.slice(0, separator).trim(), decodeURIComponent(entry.slice(separator + 1).trim()));
  });
  return values;
}

export async function readGameProgressFromRequest(request: Request, theme: GameTheme) {
  const token = parseCookieHeader(request.headers.get("cookie")).get(getProgressCookieName(theme));
  return verifyGameProgressToken(token, theme);
}

export async function serializeGameProgressCookie(progress: GameProgress) {
  const token = await signGameProgress(progress);
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${getProgressCookieName(progress.theme)}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${COOKIE_MAX_AGE_SECONDS}${secure}`;
}

export function getThemeForSuspect(suspectId: string | undefined): GameTheme | null {
  if (["dolsoe", "chunwol", "yoomunseok", "mudeok"].includes(suspectId || "")) return "joseon";
  if (["gandalf", "dunguldoor", "malpoil", "malpoi", "malposam"].includes(suspectId || "")) return "magicSchool";
  if (["harry", "mers", "aladdindin", "einspanner"].includes(suspectId || "")) return "spaceStation";
  return null;
}

export function getThemeForProtectedScreen(screenId: string, fallbackTheme?: GameTheme): GameTheme | null {
  if (screenId.startsWith("magic")) return "magicSchool";
  if (screenId.startsWith("space")) return "spaceStation";
  if (screenId === "interrogationScreen") return fallbackTheme || "joseon";
  if (joseonInvestigationScreens.includes(screenId)) return "joseon";
  return null;
}

export function deriveUnlockedScreens(progress: GameProgress) {
  const unlocked = new Set<string>(["briefingScreen"]);
  const collected = new Set(progress.collectedEvidenceNames);

  if (progress.theme === "joseon") {
    unlocked.add("fieldOne");
    if (progress.visitedScreens.includes("fieldOne")) {
      joseonInvestigationScreens.forEach((screenId) => unlocked.add(screenId));
    }
  }

  if (progress.theme === "magicSchool") {
    unlocked.add("magicAlchemyLab");
    for (let index = 0; index < magicProgression.length - 1; index += 1) {
      const current = magicProgression[index];
      if (!current.evidence.every((name) => collected.has(name))) break;
      const next = magicProgression[index + 1];
      unlocked.add(next.screenId);
      if (index === 0) unlocked.add("magicUnlockDoor");
    }
  }

  if (progress.theme === "spaceStation") {
    unlocked.add("spaceAirlock");
    if (progress.visitedScreens.includes("spaceAirlock")) {
      spaceInvestigationScreens.forEach((screenId) => unlocked.add(screenId));
    }
    if (collected.has("전력 제어실 출입 카드")) unlocked.add("spaceOxygenGenerator");
  }

  return unlocked;
}

export function canAccessProgressScreen(progress: GameProgress | null, screenId: string) {
  if (publicScreens.has(screenId)) return true;
  return Boolean(progress && deriveUnlockedScreens(progress).has(screenId));
}

export function enterProgressScreen(progress: GameProgress, screenId: string) {
  if (!canAccessProgressScreen(progress, screenId)) return null;
  return {
    ...progress,
    currentScreen: screenId,
    visitedScreens: unique([...progress.visitedScreens, screenId]),
    pendingEvidenceInteraction: undefined,
    accusation: undefined,
    updatedAt: Date.now()
  } satisfies GameProgress;
}

export function beginEvidenceInteraction(progress: GameProgress, screenId: string, evidenceName: string) {
  const allowedScreens = evidenceScreens[progress.theme][evidenceName];
  if (!allowedScreens?.includes(screenId)) return null;
  if (progress.currentScreen !== screenId || !progress.visitedScreens.includes(screenId)) return null;

  const pendingEvidenceInteraction: PendingEvidenceInteraction = {
    screenId,
    evidenceName,
    token: crypto.randomUUID(),
    issuedAt: Date.now()
  };

  return {
    ...progress,
    pendingEvidenceInteraction,
    updatedAt: Date.now()
  } satisfies GameProgress;
}

export function recordCollectedEvidence(progress: GameProgress, screenId: string, evidenceName: string) {
  const allowedScreens = evidenceScreens[progress.theme][evidenceName];
  if (!allowedScreens?.includes(screenId)) return null;
  if (progress.currentScreen !== screenId || !progress.visitedScreens.includes(screenId)) return null;
  return {
    ...progress,
    collectedEvidenceNames: unique([...progress.collectedEvidenceNames, evidenceName]),
    pendingEvidenceInteraction: undefined,
    accusation: undefined,
    updatedAt: Date.now()
  } satisfies GameProgress;
}

export function recordCollectedEvidenceFromInteraction(
  progress: GameProgress,
  screenId: string,
  evidenceName: string,
  interactionToken: string
) {
  const interaction = progress.pendingEvidenceInteraction;
  if (!interaction || interaction.token !== interactionToken) return null;
  if (interaction.screenId !== screenId || interaction.evidenceName !== evidenceName) return null;
  if (Date.now() - interaction.issuedAt > EVIDENCE_INTERACTION_MAX_AGE_MS) return null;
  return recordCollectedEvidence(progress, screenId, evidenceName);
}

export function recordAnalyzedEvidence(progress: GameProgress, evidenceName: string) {
  const sourceName = evidenceName.split("::")[0];
  if (!progress.collectedEvidenceNames.includes(sourceName)) return null;
  return {
    ...progress,
    analyzedEvidenceNames: unique([...progress.analyzedEvidenceNames, evidenceName]),
    accusation: undefined,
    updatedAt: Date.now()
  } satisfies GameProgress;
}

export function recordKnownFact(progress: GameProgress, factId: string | null | undefined) {
  if (!factId) return progress;
  return {
    ...progress,
    knownFactIds: unique([...progress.knownFactIds, factId]),
    updatedAt: Date.now()
  } satisfies GameProgress;
}

export function getMissingRequirements(progress: GameProgress) {
  const collected = new Set(progress.collectedEvidenceNames);
  const analyzed = new Set(progress.analyzedEvidenceNames);
  return [
    ...requiredEvidenceByTheme[progress.theme].filter((name) => !collected.has(name)),
    ...requiredAnalysisByTheme[progress.theme].filter((name) => !analyzed.has(name))
  ];
}

export function recordAccusation(progress: GameProgress, accusation: VerifiedAccusation) {
  return { ...progress, accusation, updatedAt: Date.now() } satisfies GameProgress;
}

export function isPublicStartScreen(screenId: string) {
  return publicScreens.has(screenId);
}
