import { mainMenu, screenImages } from "@/lib/gameData";
import type { CSSProperties } from "react";

type MenuButtonStyle = CSSProperties & {
  "--menu-y": string;
};

export default function MainScreen() {
  return (
    <section className="screen active" id="mainScreen">
      <audio id="mainBgm" src="/samunmong/sound/bgm/main.mp3" autoPlay loop preload="auto" playsInline />
      <img className="plate" src={screenImages.mainScreen} alt="삼운몽 세 개의 꿈 메인 화면" />
      {mainMenu.map((item) => (
        <button
          key={item.id}
          className="main-menu-button"
          id={item.id}
          type="button"
          data-open-settings={item.id === "openSettings" ? "true" : undefined}
          disabled={item.id === "continueDream"}
          data-requires-save={item.id === "continueDream" ? "true" : undefined}
          style={{ "--menu-y": item.menuY } as MenuButtonStyle}
        >
          {item.label}
        </button>
      ))}

      <div className="main-dialog" id="exitDialog" role="dialog" aria-modal="true" aria-labelledby="exitTitle">
        <div className="main-dialog-panel">
          <h2 id="exitTitle">꿈을 떠나시겠습니까?</h2>
          <p className="exit-message">현재 진행 위치는 자동으로 저장됩니다.</p>
          <div className="dialog-actions">
            <button className="button" id="cancelExit" type="button">
              취소
            </button>
            <button className="button primary" id="confirmExit" type="button">
              종료
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
