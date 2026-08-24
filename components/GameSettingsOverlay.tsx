"use client";

import { useEffect, useState } from "react";

function getActiveScreenId() {
  return document.querySelector(".screen.active")?.id ?? "mainScreen";
}

export default function GameSettingsOverlay() {
  const [activeScreen, setActiveScreen] = useState("mainScreen");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
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
    setConfirmReset(false);
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

  const goToThemeSelection = () => {
    setConfirmReset(false);
    document.querySelector("#settingsDialog")?.classList.remove("open");
    window.dispatchEvent(
      new CustomEvent("samunmong:screen-request", {
        cancelable: true,
        detail: { screenId: "dreamScreen" }
      })
    );
  };

  const getCurrentTheme = () => {
    const requestedTheme = new URLSearchParams(window.location.search).get("theme");
    const storedTheme = window.localStorage.getItem("samunmong-current-theme");
    const theme = requestedTheme || storedTheme || document.documentElement.dataset.samunmongTheme || "joseon";
    if (["magic", "magicSchool", "magic-school"].includes(theme)) return "magicSchool";
    if (["space", "spaceStation", "space-station"].includes(theme)) return "spaceStation";
    return "joseon";
  };

  const resetCurrentDream = () => {
    const theme = getCurrentTheme();
    const suffix = theme === "magicSchool" ? "magic-school" : theme === "spaceStation" ? "space-station" : "joseon";
    const progressKeys = [
      `samunmong-collected-evidence-${suffix}`,
      `samunmong-analyzed-evidence-${suffix}`,
      `samunmong-examined-clues-${suffix}`,
      `samunmong-linked-evidence-${suffix}`,
      `samunmong-conversation-notes-${suffix}`,
      `samunmong-interrogation-question-count-${suffix}`
    ];

    progressKeys.forEach((key) => window.localStorage.removeItem(key));
    if (theme === "joseon") {
      window.localStorage.removeItem("samunmong-field-guide-seen");
      window.localStorage.removeItem("samunmong-sato-skill-state");
    }

    try {
      const slots = JSON.parse(window.localStorage.getItem("samunmong-save-slots") || "{}");
      if (slots && typeof slots === "object") {
        delete slots[theme];
        window.localStorage.setItem("samunmong-save-slots", JSON.stringify(slots));
      }
    } catch {
      window.localStorage.removeItem("samunmong-save-slots");
    }

    try {
      const legacySave = JSON.parse(window.localStorage.getItem("samunmong-demo-state") || "null");
      const legacyTheme = ["magic", "magicSchool", "magic-school"].includes(legacySave?.theme)
        ? "magicSchool"
        : ["space", "spaceStation", "space-station"].includes(legacySave?.theme)
          ? "spaceStation"
          : "joseon";
      if (!legacySave || legacyTheme === theme) {
        window.localStorage.removeItem("samunmong-demo-state");
      }
    } catch {
      window.localStorage.removeItem("samunmong-demo-state");
    }

    window.sessionStorage.removeItem("samunmong-field-guide-pending");
    window.sessionStorage.removeItem("samunmong-new-dream-mode");
    window.sessionStorage.removeItem("samunmong-truth-unlocked");
    window.location.assign("/");
  };

  const exitToMain = () => {
    setConfirmReset(false);
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
            setConfirmReset(false);
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
          <div className="settings-game-actions" aria-label="게임 진행 관리">
            <button className="button settings-reset-button" type="button" onClick={() => setConfirmReset(true)}>
              처음부터 시작
            </button>
            <button className="button settings-exit-button" type="button" onClick={exitToMain}>
              게임 나가기
            </button>
          </div>
          {confirmReset && (
            <div className="settings-reset-confirm" role="alert">
              <strong>현재 꿈을 처음부터 시작할까요?</strong>
              <p>이 꿈의 수사 기록과 저장 지점만 삭제됩니다. 다른 꿈과 설정은 유지됩니다.</p>
              <div>
                <button className="button" type="button" onClick={() => setConfirmReset(false)}>취소</button>
                <button className="button danger" type="button" onClick={resetCurrentDream}>기록 지우고 시작</button>
              </div>
            </div>
          )}
          <div className="dialog-actions">
            {showSettingsHomeButton && (
              <button
                className="button settings-home-button"
                type="button"
                aria-label="테마 선택 화면으로 이동"
                title="처음 화면으로 나가기"
                onClick={goToThemeSelection}
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
