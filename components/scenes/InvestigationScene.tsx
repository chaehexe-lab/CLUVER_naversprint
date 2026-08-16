import type { ReactNode } from "react";
import type { InvestigationSceneData } from "@/lib/gameTypes";
import { hotspotStyle, propStyle } from "./hotspotStyle";

type InvestigationSceneProps = {
  scene: InvestigationSceneData;
  dockAriaLabel: string;
  propClassName?: string;
  children?: ReactNode;
};

export default function InvestigationScene({
  scene,
  dockAriaLabel,
  propClassName = "",
  children
}: InvestigationSceneProps) {
  return (
    <section className="screen" id={scene.id}>
      <img className="plate" src={scene.image} alt={scene.alt} />
      <div className="shade" />

      {scene.props.map((prop) => (
        <img
          key={`${scene.id}-${prop.image}-${prop.x}-${prop.y}`}
          className={`scene-prop evidence-prop${propClassName ? ` ${propClassName}` : ""}${prop.className ? ` ${prop.className}` : ""}`}
          src={prop.image}
          alt={prop.alt}
          style={propStyle(prop)}
          draggable={false}
        />
      ))}

      {scene.hotspots.map((hotspot) => (
        <button
          key={hotspot.id ?? hotspot.evidenceName ?? hotspot.ariaLabel}
          className={`hotspot object-outline${hotspot.className ? ` ${hotspot.className}` : ""}`}
          data-evidence-name={hotspot.evidenceName}
          style={hotspotStyle(hotspot)}
          id={hotspot.id}
          type="button"
          aria-label={hotspot.ariaLabel}
        />
      ))}

      <nav className="hud scene-dock" aria-label={dockAriaLabel}>
        {scene.dock.map((action) => (
          <button
            key={action.id ?? `${scene.id}-${action.className}`}
            className={`scene-chip ${action.className}`}
            id={action.id}
            data-go={action.goTo}
            type="button"
            aria-label={action.ariaLabel}
          >
            <img src={action.image} alt="" draggable={false} />
            <span className="sr-only">{action.label}</span>
          </button>
        ))}
      </nav>

      {scene.inspect && (
        <aside className="hud inspect-pop" id={scene.inspect.id} aria-live="polite">
          {scene.inspect.closeButtonId && (
            <button
              className="inspect-close"
              id={scene.inspect.closeButtonId}
              type="button"
              aria-label={scene.inspect.closeButtonLabel}
            >
              ×
            </button>
          )}
          <img src={scene.inspect.image} alt="" />
          <div>
            <strong>{scene.inspect.title}</strong>
            <p>{scene.inspect.text}</p>
          </div>
          {scene.inspect.buttonId && scene.inspect.buttonLabel && (
            <button className="button primary" id={scene.inspect.buttonId} type="button">
              {scene.inspect.buttonLabel}
            </button>
          )}
        </aside>
      )}

      {children}
    </section>
  );
}
