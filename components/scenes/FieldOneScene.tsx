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

      <div className="field-onboarding" id="fieldOnboarding" data-guide-step="map-click" hidden>
        <article className="hud field-guide-card" aria-live="polite">
          <div className="field-guide-panel active" data-field-guide-panel="map-click">
            <p className="field-guide-kicker">첫 수사 안내</p>
            <h2>마을 지도를 먼저 펼쳐 보십시오</h2>
            <p>사또님, 지금 서 계신 현장이 어디인지부터 확인해야 합니다. 왼쪽 아래의 <strong>마을 지도</strong>를 눌러 주십시오.</p>
          </div>
          <div className="field-guide-panel" data-field-guide-panel="map-open" aria-hidden="true">
            <p className="field-guide-kicker">현재 위치</p>
            <h2>첫 현장: 유문석 집 앞</h2>
            <p>지도에서 붉게 빛나는 곳이 현재 위치입니다. 이후 다른 장소로 이동할 때도 이 지도에서 위치를 확인할 수 있습니다.</p>
          </div>
          <div className="field-guide-panel" data-field-guide-panel="tools" aria-hidden="true">
            <p className="field-guide-kicker">현장 도구</p>
            <h2>아래 도구들을 번갈아 사용합니다</h2>
            <ul>
              <li><strong>보따리</strong>: 수집한 증거를 다시 확인합니다.</li>
              <li><strong>도구</strong>: 돋보기와 붓으로 증거를 더 자세히 봅니다.</li>
              <li><strong>기록장</strong>: 용의자별 질문과 답변을 대화처럼 남깁니다.</li>
              <li><strong>취조실</strong>: 네 용의자를 불러 신문합니다.</li>
            </ul>
          </div>
          <div className="field-guide-actions">
            <button className="field-guide-next" id="nextFieldGuide" type="button" hidden>다음</button>
          </div>
        </article>
      </div>
    </section>
  );
}
