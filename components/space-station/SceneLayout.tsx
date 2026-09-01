import type { ReactNode } from "react";
import type { SpaceStationScreenId } from "@/lib/spaceStationRoutes";

type SceneLayoutProps = {
  sceneId: SpaceStationScreenId;
  children: ReactNode;
};

export default function SceneLayout({ sceneId, children }: SceneLayoutProps) {
  return (
    <section className="space-station-scene-layout" data-space-station-scene={sceneId}>
      {children}
    </section>
  );
}
