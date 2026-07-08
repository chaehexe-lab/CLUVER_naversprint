import { chunwolRoomScene } from "@/lib/gameData";
import { hotspotStyle } from "./hotspotStyle";
import type { CSSProperties } from "react";


type PropStyle = CSSProperties & {
  "--x": string;
  "--y": string;
  "--w": string;
  "--rot"?: string;
};


function propStyle(prop: (typeof chunwolRoomScene.props)[number]): PropStyle {
  return {
    "--x": prop.x,
    "--y": prop.y,
    "--w": prop.w,
    "--rot": prop.rot
  };
}

export default function ChunwolRoomScene() {
  return (
    <section className="screen" id={chunwolRoomScene.id}>
      <img className="plate" src={chunwolRoomScene.image} alt={chunwolRoomScene.alt} />
      <div className="shade" />

      {chunwolRoomScene.props.map((prop) => (
        <img
          key={`${prop.image}-${prop.x}-${prop.y}`}
          className="scene-prop evidence-prop"
          src={prop.image}
          alt={prop.alt}
          style={propStyle(prop)}
        />
      ))}

      {chunwolRoomScene.hotspots.map((hotspot) => (
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

      <nav className="hud scene-dock" aria-label="춘월의 방 메뉴">
        {chunwolRoomScene.dock.map((action) => {
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

      <aside className="hud inspect-pop" id={chunwolRoomScene.inspect.id} aria-live="polite">
        <img src={chunwolRoomScene.inspect.image} alt="" />
        <div>
          <strong>{chunwolRoomScene.inspect.title}</strong>
          <p>{chunwolRoomScene.inspect.text}</p>
        </div>
        <button className="button primary" id={chunwolRoomScene.inspect.buttonId} type="button">
          {chunwolRoomScene.inspect.buttonLabel}
        </button>
      </aside>
    </section>
  );
}
