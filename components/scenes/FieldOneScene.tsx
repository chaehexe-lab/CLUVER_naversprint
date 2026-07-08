import { fieldOneScene } from "@/lib/gameData";
import { hotspotStyle } from "./hotspotStyle";
import type { CSSProperties } from "react";


type PropStyle = CSSProperties & {
  "--x": string;
  "--y": string;
  "--w": string;
  "--rot"?: string;
};


function propStyle(prop: (typeof fieldOneScene.props)[number]): PropStyle {
  return {
    "--x": prop.x,
    "--y": prop.y,
    "--w": prop.w,
    "--rot": prop.rot
  };
}

export default function FieldOneScene() {
  return (
    <section className="screen" id={fieldOneScene.id}>
      <img className="plate" src={fieldOneScene.image} alt={fieldOneScene.alt} />
      <div className="shade" />

      {fieldOneScene.props.map((prop) => (
        <img
          key={`${prop.image}-${prop.x}-${prop.y}`}
          className="scene-prop evidence-prop field-evidence-prop"
          src={prop.image}
          alt={prop.alt}
          style={propStyle(prop)}
        />
      ))}

      {fieldOneScene.hotspots.map((hotspot) => (
        <button
          key={hotspot.id ?? hotspot.evidenceName}
          className={`hotspot object-outline${hotspot.className ? ` ${hotspot.className}` : ""}`}
          data-evidence-name={hotspot.evidenceName}
          style={hotspotStyle(hotspot)}
          id={hotspot.id}
          type="button"
          aria-label={hotspot.ariaLabel}
        />
      ))}

      <nav className="hud scene-dock" aria-label="현장 메뉴">
        {fieldOneScene.dock.map((action) => {
          const actionId = "id" in action ? action.id : undefined;
          return (
            <button
              key={actionId ?? action.className}
              className={`scene-chip ${action.className}`}
              id={actionId}
              data-go={action.goTo}
              type="button"
              aria-label={action.ariaLabel}
            >
              <img src={action.image} alt="" />
              <span className="sr-only">{action.label}</span>
            </button>
          );
        })}
      </nav>

      <aside className="hud inspect-pop" id={fieldOneScene.inspect.id} aria-live="polite">
        <button className="inspect-close" id="closeHopaeInspect" type="button" aria-label="호패 조각 팝업 닫기">
          ×
        </button>
        <img src={fieldOneScene.inspect.image} alt="" />
        <div>
          <strong>{fieldOneScene.inspect.title}</strong>
          <p>{fieldOneScene.inspect.text}</p>
        </div>
      </aside>
    </section>
  );
}
