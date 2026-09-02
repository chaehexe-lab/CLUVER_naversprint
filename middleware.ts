import { NextRequest, NextResponse } from "next/server";
import type { GameTheme } from "@/lib/gameProgressTypes";
import {
  canAccessProgressScreen,
  getProgressCookieName,
  getThemeForProtectedScreen,
  isPublicStartScreen,
  verifyGameProgressToken
} from "@/lib/server/gameProgress";

const routeScreens: Record<string, { screenId: string; theme: GameTheme }> = {
  "/crime_scene": { screenId: "fieldOne", theme: "joseon" },
  "/field-one": { screenId: "fieldOne", theme: "joseon" },
  "/chunwol-room": { screenId: "chunwolRoom", theme: "joseon" },
  "/mudeok-servant-room": { screenId: "mudeokServantRoom", theme: "joseon" },
  "/yoomunseok-sarangbang": { screenId: "yoomunseokSarangbang", theme: "joseon" },
  "/dolsoe-quarters": { screenId: "dolsoeQuarters", theme: "joseon" },
  "/back-gate-courtyard": { screenId: "backGateCourtyard", theme: "joseon" },
  "/interrogation": { screenId: "interrogationScreen", theme: "joseon" },
  "/magic-alchemy-lab": { screenId: "magicAlchemyLab", theme: "magicSchool" },
  "/magic-unlock-door": { screenId: "magicUnlockDoor", theme: "magicSchool" },
  "/magic-cleaning-closet": { screenId: "magicCleaningCloset", theme: "magicSchool" },
  "/magic-library": { screenId: "magicLibrary", theme: "magicSchool" },
  "/magic-record-crystal-room": { screenId: "magicRecordCrystalRoom", theme: "magicSchool" },
  "/magic-dorm-hallway": { screenId: "magicDormHallway", theme: "magicSchool" }
};

function requestedTheme(request: NextRequest) {
  const theme = request.nextUrl.searchParams.get("theme");
  return theme === "joseon" || theme === "magicSchool" || theme === "spaceStation" ? theme : undefined;
}

export async function middleware(request: NextRequest) {
  const normalizedPath = request.nextUrl.pathname.replace(/\/+$/, "") || "/";
  const routeEntry = routeScreens[normalizedPath];
  const queryScreen = normalizedPath === "/" ? request.nextUrl.searchParams.get("start") : null;
  const screenId = routeEntry?.screenId || queryScreen;
  if (!screenId || isPublicStartScreen(screenId)) return NextResponse.next();

  const isLocalHost = request.nextUrl.hostname === "127.0.0.1" || request.nextUrl.hostname === "localhost";
  const isLocalMagicReview = isLocalHost
    && (process.env.NODE_ENV !== "production" || process.env.MAGIC_EVIDENCE_REVIEW === "1")
    && request.nextUrl.searchParams.get("magicReview") === "1"
    && screenId.startsWith("magic");
  if (isLocalMagicReview) return NextResponse.next();

  const theme = routeEntry?.theme || getThemeForProtectedScreen(screenId, requestedTheme(request));
  if (!theme) return NextResponse.next();

  const token = request.cookies.get(getProgressCookieName(theme))?.value;
  const progress = await verifyGameProgressToken(token, theme);
  if (canAccessProgressScreen(progress, screenId)) return NextResponse.next();

  const destination = request.nextUrl.clone();
  destination.pathname = "/";
  destination.search = "";
  destination.searchParams.set("blocked", "locked-location");
  return NextResponse.redirect(destination);
}

export const config = {
  matcher: [
    "/",
    "/crime_scene",
    "/field-one",
    "/chunwol-room",
    "/mudeok-servant-room",
    "/yoomunseok-sarangbang",
    "/dolsoe-quarters",
    "/back-gate-courtyard",
    "/interrogation",
    "/magic-alchemy-lab",
    "/magic-unlock-door",
    "/magic-cleaning-closet",
    "/magic-library",
    "/magic-record-crystal-room",
    "/magic-dorm-hallway"
  ]
};
