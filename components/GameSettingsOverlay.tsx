"use client";

import { useEffect, useState } from "react";

function getActiveScreenId() {
  return document.querySelector(".screen.active")?.id ?? "mainScreen";
}

export default function GameSettingsOverlay() {
  const [activeScreen, setActiveScreen] = useState("mainScreen");
  const [isFullscreen, setIsFullscreen] = useState(false);
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


  useEffect(() => {
    const syncFullscreen = () => {
      const fullscreenElement = document.fullscreenElement || (document as Document & { webkitFullscreenElement?: Element }).webkitFullscreenElement;
      setIsFullscreen(Boolean(fullscreenElement));
    };

    syncFullscreen();
    document.addEventListener("fullscreenchange", syncFullscreen);
    document.addEventListener("webkitfullscreenchange", syncFullscreen);

    return () => {
      document.removeEventListener("fullscreenchange", syncFullscreen);
      document.removeEventListener("webkitfullscreenchange", syncFullscreen);
    };
  }, []);

  const toggleFullscreen = async () => {
    const fullscreenDocument = document as Document & {
      webkitExitFullscreen?: () => Promise<void> | void;
      webkitFullscreenElement?: Element;
    };
    const fullscreenRoot = (document.querySelector(".game-viewport") || document.documentElement) as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void> | void;
    };

    try {
      if (document.fullscreenElement || fullscreenDocument.webkitFullscreenElement) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else {
          await fullscreenDocument.webkitExitFullscreen?.();
        }
      } else if (fullscreenRoot.requestFullscreen) {
        await fullscreenRoot.requestFullscreen();
      } else {
        await fullscreenRoot.webkitRequestFullscreen?.();
      }
    } catch (error) {
      console.error("전체화면 전환에 실패했습니다.", error);
    }
  };

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

      <button
        className="game-settings-button"
        id="toggleFullscreen"
        type="button"
        aria-label={isFullscreen ? "전체화면 종료" : "전체화면으로 보기"}
        title={isFullscreen ? "전체화면 종료" : "전체화면"}
        onClick={toggleFullscreen}
        style={{
          left: showGameSettingsButton
            ? "calc(clamp(30px, 5.6vw, 78px) + 56px)"
            : "clamp(30px, 5.6vw, 78px)",
        }}
      >
        {isFullscreen ? (
          <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 9H7.5Q9 9 9 7.5V4M20 9H16.5Q15 9 15 7.5V4M4 15H7.5Q9 15 9 16.5V20M20 15H16.5Q15 15 15 16.5V20"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <span aria-hidden="true">⛶</span>
        )}
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
