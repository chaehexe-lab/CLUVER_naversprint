import type { CSSProperties, ReactNode } from "react";
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

      {scene.lights && scene.lights.length > 0 && (
        <div className="scene-lantern-layer" aria-hidden="true">
          {scene.lights.map((light, index) => (
            <i
              key={`${scene.id}-light-${index}`}
              className="scene-lantern-light"
              style={{ left: light.x, top: light.y, width: light.size ?? "7%", "--scene-light-strength": light.strength ?? 0.32, animationDelay: light.delay ?? `${index * -0.63}s` } as CSSProperties}
            />
          ))}
        </div>
      )}

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
        >
          {hotspot.image && <img className="hotspot-evidence-visual" src={hotspot.image} alt="" draggable={false} />}
        </button>
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
