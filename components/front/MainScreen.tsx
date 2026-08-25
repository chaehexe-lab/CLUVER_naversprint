"use client";

import { mainMenu, screenImages } from "@/lib/gameData";
import type { CSSProperties } from "react";
import MainRealtimeRig from "@/components/front/MainRealtimeRig";
import styles from "./MainScreen.module.css";

type MenuButtonStyle = CSSProperties & {
  "--menu-y": string;
};

type MainScreenProps = {
  active?: boolean;
};

export default function MainScreen({ active = false }: MainScreenProps) {
  const requestScreen = (screenId: string) => {
    window.dispatchEvent(new CustomEvent("samunmong:screen-request", {
      cancelable: true,
      detail: { screenId }
    }));
  };

  const handleMenuClick = (itemId: string) => {
    if (itemId === "newDream") {
      window.sessionStorage.setItem("samunmong-new-dream-mode", "1");
      requestScreen("tutorialScreen");
      return;
    }
    if (itemId === "continueDream") {
      document.querySelector<HTMLElement>("#saveSlotDialog")?.classList.add("open");
      document.querySelector<HTMLElement>("#saveSlotDialog")?.setAttribute("aria-hidden", "false");
      return;
    }
    if (itemId === "openSettings") {
      document.querySelector<HTMLElement>("#settingsDialog")?.classList.add("open");
      return;
    }
    if (itemId === "exitGame") {
      document.querySelector<HTMLElement>("#exitDialog")?.classList.add("open");
    }
  };

  return (
    <section className={`screen${active ? " active" : ""}`} id="mainScreen">
      <audio id="mainBgm" src="/samunmong/sound/bgm/main.mp3" autoPlay loop preload="metadata" playsInline />
      <img className="plate" src={screenImages.mainScreen} alt="삼운몽 세 개의 꿈 메인 화면" />
      <img
        className="main-clean-plate"
        src="/samunmong/assets/interactions/main-2d/main-static-clean-v3.png"
        alt=""
        aria-hidden="true"
      />
      <div className="main-2d-scene" aria-hidden="true">
        <MainRealtimeRig />
        <div className="main-depth main-depth-mid">
          <div className="main-lantern-lights">
            <span className="main-lantern main-lantern-one" />
            <span className="main-lantern main-lantern-two" />
            <span className="main-lantern main-lantern-three" />
            <span className="main-lantern main-lantern-four" />
          </div>
        </div>
      </div>
      {mainMenu.map((item) => {
        const requiresSave = item.id === "continueDream";

        return (
          <button
            key={item.id}
            className="main-menu-button"
            id={item.id}
            type="button"
            data-open-settings={item.id === "openSettings" ? "true" : undefined}
            disabled={requiresSave}
            aria-disabled={requiresSave}
            data-requires-save={requiresSave ? "true" : undefined}
            style={{ "--menu-y": item.menuY } as MenuButtonStyle}
            onClick={() => handleMenuClick(item.id)}
          >
            {item.label}
          </button>
        );
      })}

      <aside className="dream-notice-dialog save-slot-dialog" id="saveSlotDialog" aria-hidden="true" role="dialog" aria-labelledby="saveSlotTitle">
        <div className="dream-notice-panel save-slot-panel">
          <div className="dream-notice-titlebar">
            <span>SAVE_FILE</span>
            <button className="dream-notice-close" id="closeSaveSlotDialogX" type="button" aria-label="세이브 파일 닫기" onClick={() => {
              document.querySelector<HTMLElement>("#saveSlotDialog")?.classList.remove("open");
              document.querySelector<HTMLElement>("#saveSlotDialog")?.setAttribute("aria-hidden", "true");
            }}>
              ×
            </button>
          </div>
          <span className="dream-notice-seal" aria-hidden="true">▶</span>
          <p className="dream-notice-kicker">DREAM ARCHIVE</p>
          <h2 id="saveSlotTitle">이어갈 꿈을 고르십시오</h2>
          <p id="saveSlotCopy">저장된 꿈을 선택하면 해당 사건의 마지막 위치로 돌아갑니다.</p>
          <div className="save-slot-list" id="saveSlotList" aria-label="세이브 파일 목록">
            <button className="save-slot-item" type="button" data-save-slot-theme="joseon" disabled>
              <strong>조선시대 살인사건</strong>
              <span>저장된 꿈이 없습니다</span>
            </button>
            <button className="save-slot-item" type="button" data-save-slot-theme="magicSchool" disabled>
              <strong>마법학교 방화사건</strong>
              <span>저장된 꿈이 없습니다</span>
            </button>
            <button className="save-slot-item" type="button" data-save-slot-theme="spaceStation" disabled>
              <strong>우주정거장 살인사건</strong>
              <span>저장된 꿈이 없습니다</span>
            </button>
          </div>
          <div className="dream-notice-actions">
            <button className={`button ${styles.retroDialogButton}`} id="closeSaveSlotDialog" type="button" onClick={() => {
              document.querySelector<HTMLElement>("#saveSlotDialog")?.classList.remove("open");
              document.querySelector<HTMLElement>("#saveSlotDialog")?.setAttribute("aria-hidden", "true");
            }}>
              닫기
            </button>
          </div>
        </div>
      </aside>

      <div className="main-dialog" id="exitDialog" role="dialog" aria-modal="true" aria-labelledby="exitTitle">
        <div className="main-dialog-panel">
          <h2 id="exitTitle">꿈을 떠나시겠습니까?</h2>
          <p className="exit-message">현재 진행 위치는 자동으로 저장됩니다.</p>
          <div className="dialog-actions">
            <button className="button" id="cancelExit" type="button" onClick={() => document.querySelector<HTMLElement>("#exitDialog")?.classList.remove("open")}>
              취소
            </button>
            <button className="button primary" id="confirmExit" type="button" onClick={() => {
              document.querySelector<HTMLElement>("#exitDialog")?.classList.remove("open");
              document.querySelector<HTMLElement>("#mainScreen")?.classList.add("exited");
            }}>
              종료
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
