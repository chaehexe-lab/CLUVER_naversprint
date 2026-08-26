"use client";

import { useCallback, useState, type CSSProperties } from "react";
import MagicSpellSystem from "@/components/MagicSpellSystem";
import { magicSchoolScenes } from "@/lib/gameData";
import { hotspotStyle } from "./hotspotStyle";

type MagicScene = (typeof magicSchoolScenes)[number];

type HolyParticleStyle = CSSProperties & {
  "--particle-start-x": string;
  "--particle-drift": string;
  "--particle-fall": string;
  "--particle-delay": string;
  "--particle-duration": string;
  "--particle-size": string;
  "--particle-spin": string;
  "--particle-opacity": string;
};

type HeavenlyBeamStyle = CSSProperties & {
  "--beam-start-x": string;
  "--beam-start-y": string;
  "--beam-angle": string;
  "--beam-length": string;
  "--beam-width": string;
  "--beam-delay": string;
  "--beam-brightness": string;
};

const holyParticles: HolyParticleStyle[] = Array.from({ length: 180 }, (_, index) => {
  return {
    "--particle-start-x": `${(index * 47 + (index % 7) * 3) % 101}%`,
    "--particle-drift": `${((index * 31) % 25) - 12}vw`,
    "--particle-fall": `${108 + (index % 8) * 5}vh`,
    "--particle-delay": `${(index % 45) * 0.028}s`,
    "--particle-duration": `${2.6 + (index % 10) * 0.12}s`,
    "--particle-size": `${2.5 + (index % 6) * 1.1}px`,
    "--particle-spin": `${120 + (index % 11) * 37}deg`,
    "--particle-opacity": `${0.55 + (index % 5) * 0.09}`
  } satisfies HolyParticleStyle;
});

const heavenlyBeams: HeavenlyBeamStyle[] = [
  [50, 3, 4, 118, 10.5, 0.02, 0.88],
  [50, 1, 15, 122, 8.5, 0.05, 0.92],
  [50, -2, 26, 132, 11, 0.01, 0.96],
  [50, -8, 36, 182, 9.5, 0.04, 0.98],
  [50, -8, 43, 171, 7.2, 0.02, 0.9],
  [50, -8, 50, 163, 10.5, 0.06, 1.06],
  [50, -8, 58, 153, 6.8, 0, 0.92],
  [50, -8, 66, 146, 11.5, 0.05, 1.1],
  [50, -8, 74, 140, 7.5, 0.03, 0.96],
  [50, -8, 82, 136, 12.5, 0.07, 1.12],
  [50, -8, 90, 134, 9.5, 0, 1.18],
  [50, -8, 98, 136, 12, 0.06, 1.1],
  [50, -8, 106, 140, 7.3, 0.02, 0.95],
  [50, -8, 114, 146, 11.2, 0.05, 1.08],
  [50, -8, 122, 153, 6.6, 0, 0.9],
  [50, -8, 130, 163, 10.2, 0.07, 1.04],
  [50, -8, 137, 171, 7, 0.03, 0.9],
  [50, -8, 144, 182, 9.2, 0.05, 0.98],
  [50, -2, 154, 132, 11, 0.01, 0.96],
  [50, 1, 165, 122, 8.5, 0.05, 0.92],
  [50, 3, 176, 118, 10.5, 0.02, 0.88]
].map(([startX, startY, angle, length, width, delay, brightness]) => ({
  "--beam-start-x": `${startX}%`,
  "--beam-start-y": `${startY}%`,
  "--beam-angle": `${angle}deg`,
  "--beam-length": `${length}vh`,
  "--beam-width": `${width}vw`,
  "--beam-delay": `${delay}s`,
  "--beam-brightness": `${brightness}`
}));

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
      <div className="magic-heavenly-light" aria-hidden="true" key={`heavenly-light-${lightCastCount}`}>
        {heavenlyBeams.map((style, index) => (
          <span className="heavenly-light-beam" style={style} key={index} />
        ))}
      </div>
      <div className="magic-holy-particles" aria-hidden="true" key={lightCastCount}>
        {holyParticles.map((style, index) => (
          <span className={index % 9 === 0 ? "holy-particle star" : "holy-particle"} style={style} key={index} />
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
