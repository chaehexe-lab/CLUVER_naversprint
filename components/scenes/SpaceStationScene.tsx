import { spaceStationScenes } from "@/lib/gameData";
import { hotspotStyle, propStyle } from "./hotspotStyle";

type SpaceScene = (typeof spaceStationScenes)[number];

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
          key={`${scene.id}-${hotspot.id ?? hotspot.evidenceName ?? hotspot.ariaLabel}`}
          className={`hotspot object-outline${hotspot.className ? ` ${hotspot.className}` : ""}`}
          id={hotspot.id}
          type="button"
          data-evidence-name={hotspot.evidenceName}
          aria-label={hotspot.ariaLabel}
          style={hotspotStyle(hotspot)}
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
