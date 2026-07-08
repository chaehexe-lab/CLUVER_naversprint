import { mudeokServantRoomScene } from "@/lib/gameData";
import { hotspotStyle } from "./hotspotStyle";
import type { CSSProperties } from "react";


type PropStyle = CSSProperties & {
  "--x": string;
  "--y": string;
  "--w": string;
  "--rot"?: string;
};


function propStyle(prop: (typeof mudeokServantRoomScene.props)[number]): PropStyle {
  return {
    "--x": prop.x,
    "--y": prop.y,
    "--w": prop.w,
    "--rot": prop.rot
  };
}

export default function MudeokServantRoomScene() {
  return (
    <section className="screen" id={mudeokServantRoomScene.id}>
      <img className="plate" src={mudeokServantRoomScene.image} alt={mudeokServantRoomScene.alt} />
      <div className="shade" />

      {mudeokServantRoomScene.props.map((prop) => (
        <img
          key={`${prop.image}-${prop.x}-${prop.y}`}
          className="scene-prop evidence-prop"
          src={prop.image}
          alt={prop.alt}
          style={propStyle(prop)}
        />
      ))}

      {mudeokServantRoomScene.hotspots.map((hotspot) => (
        <button
          key={hotspot.evidenceName}
          className="hotspot object-outline"
          data-evidence-name={hotspot.evidenceName}
          style={hotspotStyle(hotspot)}
          type="button"
          aria-label={hotspot.ariaLabel}
        />
      ))}

      <nav className="hud scene-dock" aria-label="무덕의 하인방 메뉴">
        {mudeokServantRoomScene.dock.map((action) => {
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
    </section>
  );
}
