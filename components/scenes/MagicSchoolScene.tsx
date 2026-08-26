"use client";

import { useCallback, useState, type CSSProperties } from "react";
import MagicSpellSystem from "@/components/MagicSpellSystem";
import { magicSchoolScenes } from "@/lib/gameData";
import { hotspotStyle } from "./hotspotStyle";

type MagicScene = (typeof magicSchoolScenes)[number];

type HolyParticleStyle = CSSProperties & {
  "--particle-x": string;
  "--particle-y": string;
  "--particle-delay": string;
  "--particle-duration": string;
  "--particle-size": string;
  "--particle-spin": string;
};

const holyParticles: HolyParticleStyle[] = Array.from({ length: 28 }, (_, index) => {
  const angle = (index / 28) * Math.PI * 2 + (index % 3) * 0.09;
  const distance = 190 + (index % 6) * 64;

  return {
    "--particle-x": `${Math.cos(angle) * distance}px`,
    "--particle-y": `${Math.sin(angle) * distance * 0.72}px`,
    "--particle-delay": `${(index % 7) * 0.055}s`,
    "--particle-duration": `${1.55 + (index % 5) * 0.18}s`,
    "--particle-size": `${5 + (index % 4) * 2}px`,
    "--particle-spin": `${90 + (index % 6) * 47}deg`
  } satisfies HolyParticleStyle;
});

export default function MagicSchoolScene({ scene }: { scene: MagicScene }) {
  const requiresLightSpell = scene.id === "magicAlchemyLab";
  const [lightEnabled, setLightEnabled] = useState(false);
  const [lightCastCount, setLightCastCount] = useState(0);
  const handleLightChange = useCallback((enabled: boolean) => {
    setLightEnabled(enabled);
    if (enabled) setLightCastCount((count) => count + 1);
  }, []);
  const lightClassName = `${requiresLightSpell ? " magic-light-required" : ""}${lightEnabled ? " light-magic-active" : ""}`;

  return (
    <section className={`screen active magic-school-screen${lightClassName}`} id={scene.id}>
      <img className="plate" src={scene.image} alt={scene.alt} />
      <div className="shade magic-shade" />
      <div className="magic-light-bloom" aria-hidden="true" />
      <div className="magic-holy-particles" aria-hidden="true" key={lightCastCount}>
        {holyParticles.map((style, index) => (
          <span className={index % 4 === 0 ? "holy-particle star" : "holy-particle"} style={style} key={index} />
        ))}
      </div>

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
