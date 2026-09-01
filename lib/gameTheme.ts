import { getSpaceStationRoute } from "./spaceStationRoutes";

export type GameTheme = "joseon" | "magicSchool" | "spaceStation";

const JOSEON_SCREENS = new Set([
  "fieldOne",
  "chunwolRoom",
  "mudeokServantRoom",
  "yoomunseokSarangbang",
  "dolsoeQuarters",
  "backGateCourtyard"
]);

export function normalizeGameTheme(theme: string | null | undefined): GameTheme {
  if (theme === "magicSchool" || theme === "spaceStation") return theme;
  return "joseon";
}

export function getThemeForScreen(screenId: string | null | undefined): GameTheme | undefined {
  if (!screenId) return undefined;
  if (screenId.startsWith("magic")) return "magicSchool";
  if (screenId.startsWith("space")) return "spaceStation";
  if (JOSEON_SCREENS.has(screenId)) return "joseon";
  return undefined;
}

export function getThemeEntryHref(screenId: string, theme: GameTheme) {
  if (theme === "spaceStation") {
    return getSpaceStationRoute(screenId) ?? "/space-station/briefing";
  }
  const params = new URLSearchParams({ start: screenId, theme });
  return `/?${params.toString()}`;
}
