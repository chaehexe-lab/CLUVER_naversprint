"use client";

import { useCallback, useState } from "react";
import MagicSpellSystem from "@/components/MagicSpellSystem";
import { magicSchoolScenes } from "@/lib/gameData";
import { hotspotStyle } from "./hotspotStyle";

type MagicScene = (typeof magicSchoolScenes)[number];

export default function MagicSchoolScene({ scene }: { scene: MagicScene }) {
  const requiresLightSpell = scene.id === "magicAlchemyLab";
  const [lightEnabled, setLightEnabled] = useState(false);
  const handleLightChange = useCallback((enabled: boolean) => setLightEnabled(enabled), []);
  const lightClassName = requiresLightSpell
    ? ` magic-light-required${lightEnabled ? " light-magic-active" : ""}`
    : "";

  return (
    <section className={`screen active magic-school-screen${lightClassName}`} id={scene.id}>
      <img className="plate" src={scene.image} alt={scene.alt} />
      <div className="shade magic-shade" />
      <div className="magic-light-bloom" aria-hidden="true" />

      {scene.hotspots.map((hotspot) => {
        const hotspotKey = "id" in hotspot && typeof hotspot.id === "string" ? hotspot.id : hotspot.evidenceName;
        const className = "className" in hotspot && typeof hotspot.className === "string" ? ` ${hotspot.className}` : "";

        return (
          <button
            key={hotspotKey}
            className={`hotspot${className}`}
            type="button"
            data-evidence-name={hotspot.evidenceName}
            aria-label={hotspot.ariaLabel}
            style={{
              ...hotspotStyle(hotspot),
              clipPath: hotspot.clipPath,
              borderRadius: hotspot.radius
            }}
          />
        );
      })}

      <nav className="hud scene-dock magic-school-dock" aria-label="마법학교 조사 도구">
        {scene.dock.map((action) => {
          const id = "id" in action && typeof action.id === "string" ? action.id : undefined;
          const goTo = "goTo" in action && typeof action.goTo === "string" ? action.goTo : undefined;

          return (
            <button
              className={`scene-chip ${action.className}`}
              id={id}
              type="button"
            data-go={goTo}
            aria-label={action.ariaLabel}
            key={`${scene.id}-${action.label}`}
          >
            <img src={action.image} alt="" draggable="false" />
            <span className="magic-scene-chip-label">{action.label}</span>
          </button>
          );
        })}
      </nav>
      <MagicSpellSystem sceneId={scene.id} onLightChange={handleLightChange} />
    </section>
  );
}
