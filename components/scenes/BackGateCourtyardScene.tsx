import { backGateCourtyardScene } from "@/lib/gameData";
import { hotspotStyle } from "./hotspotStyle";
import type { CSSProperties } from "react";


type PropStyle = CSSProperties & {
  "--x": string;
  "--y": string;
  "--w": string;
  "--rot"?: string;
};


function propStyle(prop: (typeof backGateCourtyardScene.props)[number]): PropStyle {
  return {
    "--x": prop.x,
    "--y": prop.y,
    "--w": prop.w,
    "--rot": prop.rot
  };
}

export default function BackGateCourtyardScene() {
  return (
    <section className="screen" id={backGateCourtyardScene.id}>
      <img className="plate" src={backGateCourtyardScene.image} alt={backGateCourtyardScene.alt} />
      <div className="shade" />

      {backGateCourtyardScene.props.map((prop) => (
        <img
          key={`${prop.image}-${prop.x}-${prop.y}`}
          className={`scene-prop evidence-prop${prop.className ? ` ${prop.className}` : ""}`}
          src={prop.image}
          alt={prop.alt}
          style={propStyle(prop)}
        />
      ))}

      {backGateCourtyardScene.hotspots.map((hotspot) => (
        <button
          key={hotspot.evidenceName}
          className="hotspot object-outline"
          data-evidence-name={hotspot.evidenceName}
          style={hotspotStyle(hotspot)}
          type="button"
          aria-label={hotspot.ariaLabel}
        />
      ))}

      <nav className="hud scene-dock" aria-label="뒷문 마당 메뉴">
        {backGateCourtyardScene.dock.map((action) => (
          <button
            key={action.className}
            className={`scene-chip ${action.className}`}
            data-go={action.goTo}
            type="button"
            aria-label={action.ariaLabel}
          >
            <img src={action.image} alt="" />
            <span className="sr-only">{action.label}</span>
          </button>
        ))}
      </nav>
    </section>
  );
}
