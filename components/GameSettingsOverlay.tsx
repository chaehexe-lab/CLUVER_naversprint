"use client";

import { useEffect, useState } from "react";

function getActiveScreenId() {
  return document.querySelector(".screen.active")?.id ?? "mainScreen";
}

export default function GameSettingsOverlay() {
  const [activeScreen, setActiveScreen] = useState("mainScreen");
  const showGameSettingsButton = activeScreen !== "mainScreen";

  useEffect(() => {
    const syncActiveScreen = () => setActiveScreen(getActiveScreenId());

    syncActiveScreen();

    const shell = document.querySelector(".game-shell");
    if (!shell) return undefined;

    const observer = new MutationObserver(syncActiveScreen);
    observer.observe(shell, {
      attributes: true,
      attributeFilter: ["class"],
      subtree: true
    });

    window.addEventListener("samunmong:screen-change", syncActiveScreen);

    return () => {
      observer.disconnect();
      window.removeEventListener("samunmong:screen-change", syncActiveScreen);
    };
  }, []);

  return (
    <>
      <button
        className="game-settings-button"
        id="openGameSettings"
        type="button"
        data-open-settings="true"
        aria-label="설정 열기"
        hidden={!showGameSettingsButton}
      >
        <span aria-hidden="true">⚙</span>
      </button>

      <div className="main-dialog" id="settingsDialog" role="dialog" aria-modal="true" aria-labelledby="settingsTitle">
        <div className="main-dialog-panel">
          <h2 id="settingsTitle">설정</h2>
          <label className="setting-row">
            <span>음량</span>
            <input id="volumeSetting" type="range" min="0" max="100" defaultValue="70" />
          </label>
          <label className="setting-row">
            <span>화면 움직임 줄이기</span>
            <input id="motionSetting" type="checkbox" />
          </label>
          <label className="setting-row">
            <span>고대비 화면</span>
            <input id="contrastSetting" type="checkbox" />
          </label>
          <div className="dialog-actions">
            <button className="button primary" id="closeSettings" type="button">
              확인
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
