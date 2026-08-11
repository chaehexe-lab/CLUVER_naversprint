import { spaceStationScenes } from "@/lib/gameData";
import type { CSSProperties } from "react";

type SpaceScene = (typeof spaceStationScenes)[number];

type HotspotStyle = CSSProperties & {
  "--x": string;
  "--y": string;
  "--w": string;
  "--h": string;
  "--rot"?: string;
};

type PropStyle = CSSProperties & {
  "--x": string;
  "--y": string;
  "--w": string;
  "--rot"?: string;
};

function hotspotStyle(hotspot: SpaceScene["hotspots"][number]): HotspotStyle {
  return {
    "--x": hotspot.x,
    "--y": hotspot.y,
    "--w": hotspot.w,
    "--h": hotspot.h,
    "--rot": hotspot.rot
  };
}

function propStyle(prop: SpaceScene["props"][number]): PropStyle {
  return {
    "--x": prop.x,
    "--y": prop.y,
    "--w": prop.w,
    "--rot": prop.rot
  };
}

export default function SpaceStationScene({ scene }: { scene: SpaceScene }) {
  return (
    <section className="screen use-text-ui" id={scene.id}>
      <img className="plate" src={scene.image} alt={scene.alt} />
      <div className="shade" />

      {scene.props.map((prop) => (
        <img
          key={`${scene.id}-${prop.image}-${prop.x}`}
          className="scene-prop evidence-prop"
          src={prop.image}
          alt={prop.alt}
          style={propStyle(prop)}
          draggable={false}
        />
      ))}

      {scene.hotspots.map((hotspot) => (
        <button
          key={`${scene.id}-${hotspot.evidenceName}`}
          className="hotspot object-outline"
          type="button"
          data-evidence-name={hotspot.evidenceName}
          aria-label={hotspot.ariaLabel}
          style={{
            ...hotspotStyle(hotspot),
            clipPath: hotspot.clipPath,
            borderRadius: hotspot.radius
          }}
        />
      ))}

      <nav className="hud scene-dock" aria-label="우주정거장 조사 도구">
        {scene.dock.map((action) => (
          <button
            className={`scene-chip ${action.className}`}
            type="button"
            data-go={action.goTo}
            aria-label={action.ariaLabel}
            key={`${scene.id}-${action.label}`}
          >
            <img src={action.image} alt="" draggable={false} />
            <span className="sr-only">{action.label}</span>
          </button>
        ))}
      </nav>
    </section>
  );
}
