export const SPACE_STATION_ROUTE_BY_SCREEN = {
  briefingScreen: "/space-station/briefing",
  spaceAirlock: "/space-station/airlock",
  spaceMedicalBay: "/space-station/medical",
  spaceOxygenGenerator: "/space-station/power",
  spaceDataCore: "/space-station/data",
  spaceScienceLab: "/space-station/science",
  interrogationScreen: "/space-station/interrogation"
} as const;

export type SpaceStationScreenId = keyof typeof SPACE_STATION_ROUTE_BY_SCREEN;

export const SPACE_STATION_SCREEN_BY_ROUTE = Object.fromEntries(
  Object.entries(SPACE_STATION_ROUTE_BY_SCREEN).map(([screenId, route]) => [route, screenId])
) as Record<string, SpaceStationScreenId>;

export function getSpaceStationRoute(screenId: string) {
  return SPACE_STATION_ROUTE_BY_SCREEN[screenId as SpaceStationScreenId];
}

export function getSpaceStationScreen(pathname: string) {
  const normalizedPathname = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return SPACE_STATION_SCREEN_BY_ROUTE[normalizedPathname];
}

export function normalizeSpaceStationHref(href: string, currentHref: string) {
  const destination = new URL(href, currentHref);
  const startScreen = destination.searchParams.get("start");
  const route = startScreen ? getSpaceStationRoute(startScreen) : undefined;
  if (route) return `${route}${destination.hash}`;

  if (destination.pathname === "/result" && destination.searchParams.get("theme") === "spaceStation") {
    destination.searchParams.delete("theme");
    const query = destination.searchParams.toString();
    return `/space-station/result${query ? `?${query}` : ""}${destination.hash}`;
  }

  return href;
}
