"use client";

import { useEffect, useState } from "react";

function getActiveScreenId() {
  return document.querySelector(".screen.active")?.id ?? "mainScreen";
}

export default function GameSettingsOverlay() {
  const [activeScreen, setActiveScreen] = useState("mainScreen");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const showSettingsHomeButton = !["mainScreen", "tutorialScreen", "dreamScreen"].includes(activeScreen);

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
    const fullscreenRoot = document.documentElement as HTMLElement & {
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

  const closeSettings = () => {
    const volumeSetting = document.querySelector<HTMLInputElement>("#volumeSetting");
    const contrastSetting = document.querySelector<HTMLInputElement>("#contrastSetting");
    const settings = {
      volume: Number(volumeSetting?.value ?? 70),
      highContrast: Boolean(contrastSetting?.checked)
    };

    window.localStorage.setItem("samunmong-demo-settings", JSON.stringify(settings));
    document.body.classList.toggle("high-contrast", settings.highContrast);
    document.querySelector("#settingsDialog")?.classList.remove("open");
  };

  const goToMain = () => {
    document.querySelector("#settingsDialog")?.classList.remove("open");
    window.dispatchEvent(
      new CustomEvent("samunmong:screen-request", {
        cancelable: true,
        detail: { screenId: "mainScreen" }
      })
    );
  };

  return (
    <>
      <div className="game-utility-buttons">
        <button
          className="game-settings-button"
          id="toggleFullscreen"
          type="button"
          aria-label={isFullscreen ? "전체화면 종료" : "전체화면으로 보기"}
          title={isFullscreen ? "전체화면 종료" : "전체화면"}
          onClick={toggleFullscreen}
        >
          {isFullscreen ? (
            <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 8H6.5Q8 8 8 6.5V4M20 8H17.5Q16 8 16 6.5V4M4 16H6.5Q8 16 8 17.5V20M20 16H17.5Q16 16 16 17.5V20"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <span aria-hidden="true">⛶</span>
          )}
        </button>

        <button
          className="game-settings-button"
          id="openGameSettings"
          type="button"
          data-open-settings="true"
          aria-label="설정 열기"
          onClick={() => {
            document.querySelector<HTMLElement>("#settingsDialog")?.classList.add("open");
          }}
        >
          <span aria-hidden="true">⚙</span>
        </button>
      </div>

      <div className="main-dialog" id="settingsDialog" role="dialog" aria-modal="true" aria-labelledby="settingsTitle">
        <div className="main-dialog-panel">
          <h2 id="settingsTitle">설정</h2>
          <label className="setting-row">
            <span>음량</span>
            <input id="volumeSetting" type="range" min="0" max="100" defaultValue="70" />
          </label>
          <label className="setting-row">
            <span>고대비 화면</span>
            <input id="contrastSetting" type="checkbox" />
          </label>
          <div className="dialog-actions">
            {showSettingsHomeButton && (
              <button
                className="button settings-home-button"
                type="button"
                aria-label="메인 화면으로 이동"
                title="메인 화면으로 이동"
                onClick={goToMain}
              >
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 10.5 12 4l8 6.5V20h-5v-6H9v6H4z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
            <button className="button primary" id="closeSettings" type="button" onClick={closeSettings}>
              확인
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
