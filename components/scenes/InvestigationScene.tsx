"use client";

import { useLayoutEffect, type CSSProperties, type ReactNode } from "react";
import type { InvestigationSceneData } from "@/lib/gameTypes";
import { hotspotStyle, propStyle } from "./hotspotStyle";

type InvestigationSceneProps = {
  scene: InvestigationSceneData;
  dockAriaLabel: string;
  propClassName?: string;
  backgroundStates?: readonly { state: string; image: string }[];
  children?: ReactNode;
};

export default function InvestigationScene({
  scene,
  dockAriaLabel,
  propClassName = "",
  backgroundStates,
  children
}: InvestigationSceneProps) {
  useLayoutEffect(() => {
    let collectedNames: string[] = [];
    try {
      const stored = window.localStorage.getItem("samunmong-collected-evidence-joseon");
      const parsed = stored ? JSON.parse(stored) : [];
      if (Array.isArray(parsed)) collectedNames = parsed.filter((name): name is string => typeof name === "string");
    } catch {
      collectedNames = [];
    }

    const screen = document.getElementById(scene.id);
    if (!screen) return;
    collectedNames.forEach((name) => {
      screen.querySelectorAll<HTMLElement>(`[data-evidence-name="${CSS.escape(name)}"]`).forEach((hotspot) => {
        hotspot.classList.add("collected");
        hotspot.setAttribute("aria-disabled", "true");
        if (hotspot instanceof HTMLButtonElement) hotspot.disabled = true;
      });
    });
    screen.dataset.evidenceStateReady = "true";
  }, [scene.id]);

  const openMap = () => {
    const mapPanel = document.querySelector<HTMLElement>("#mapPanel");
    const globalOverlay = document.querySelector<HTMLElement>("#globalOverlay");
    if (!mapPanel || !globalOverlay) return;

    document.querySelectorAll<HTMLElement>(".global-panel").forEach((panel) => {
      const isMap = panel === mapPanel;
      panel.classList.toggle("show", isMap);
      panel.classList.remove("closing");
      panel.setAttribute("aria-hidden", String(!isMap));
    });
    globalOverlay.classList.add("show");
  };

  return (
    <section className="screen" id={scene.id}>
      <img className="plate" src={scene.image} alt={scene.alt} />
      {backgroundStates && backgroundStates.length > 0 && (
        <div className="scene-state-backgrounds" aria-hidden="true">
          {backgroundStates.map((background) => (
            <img
              key={background.state}
              className="scene-state-background"
              data-scene-state={background.state}
              src={background.image}
              alt=""
              draggable={false}
              loading="eager"
              fetchPriority="high"
            />
          ))}
        </div>
      )}
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
          onClick={action.className.includes("map-chip") ? openMap : undefined}
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
