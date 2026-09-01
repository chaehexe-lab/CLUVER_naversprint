"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import GameShell from "@/components/GameShell";
import SceneLayout from "@/components/space-station/SceneLayout";
import { getSpaceStationScreen } from "@/lib/spaceStationRoutes";

type SpaceStationShellProps = {
  children: ReactNode;
};

export default function SpaceStationShell({ children }: SpaceStationShellProps) {
  const pathname = usePathname();
  if (pathname === "/space-station/result") return children;

  const initialScreen = getSpaceStationScreen(pathname) ?? "briefingScreen";
  return (
    <SceneLayout sceneId={initialScreen}>
      <div className="space-station-route-shell" data-space-station-route={initialScreen}>
        <GameShell initialScreen={initialScreen} initialTheme="spaceStation" routeMode="spaceStation" />
      </div>
    </SceneLayout>
  );
}
