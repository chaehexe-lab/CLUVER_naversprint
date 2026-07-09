(() => {

    const screens = [...document.querySelectorAll(".screen")];
    const fade = document.querySelector("#fade");
    const toast = document.querySelector("#toast");
    const briefingCopy = document.querySelector("#briefingCopy");
    const startCaseButton = document.querySelector("#startCase");
    let selectedEvidence = "";
    let isAskingAi = false;
    const interrogationHistories = new Map();
    const entryParams = new URLSearchParams(window.location.search);
    const briefingText = "“사또님, 관아 근처에서 사람이 쓰러진 채 발견되었습니다.”\n\n당신은 이 꿈에서 고을의 사또입니다. 현장을 조사하고, 증거를 모아 용의자를 심문해야 합니다.";
    const suspects = window.SAMUNMONG_CONTENT?.suspects || [
      { name: "돌쇠", id: "dolsoe", scene: "/samunmong/assets/scene-interrogation-dolsoe.png?v=scene-20260707", sleeveScene: "/samunmong/assets/scene-interrogation-dolsoe-sleeve.png?v=sleeve-20260707" },
      { name: "최춘월", id: "chunwol", scene: "/samunmong/assets/scene-interrogation-chunwol.png?v=scene-20260707", sleeveScene: "/samunmong/assets/scene-interrogation-chunwol-sleeve.png?v=sleeve-20260707" },
      { name: "유문석", id: "yoomunseok", scene: "/samunmong/assets/scene-interrogation-yoomunseok.png?v=scene-20260707", sleeveScene: "/samunmong/assets/scene-interrogation-yoomunseok-sleeve.png?v=sleeve-20260707" },
      { name: "무덕", id: "mudeok", scene: "/samunmong/assets/scene-interrogation-mudeok.png?v=scene-20260707", sleeveScene: "/samunmong/assets/scene-interrogation-mudeok-sleeve.png?v=sleeve-20260707" }
    ];

    function getInterrogationHistory(suspectId) {
      if (!interrogationHistories.has(suspectId)) {
        interrogationHistories.set(suspectId, []);
      }

      return interrogationHistories.get(suspectId);
    }

    let suspectIndex = 0;
    const sleeveCheckedSuspects = new Set();
    const saveKey = "samunmong-demo-state";
    const collectedEvidenceKey = "samunmong-collected-evidence";
    const analyzedEvidenceKey = "samunmong-analyzed-evidence";
    const settingsKey = "samunmong-demo-settings";
    const bgmStateKey = "samunmong-bgm-state";
    const locationMeta = {
      tutorialScreen: { name: "튜토리얼", x: "18%", y: "18%" },
      dreamScreen: { name: "꿈 선택", x: "18%", y: "18%" },
      briefingScreen: { name: "사건 브리핑", x: "18%", y: "18%" },
      fieldOne: { name: "유문석 집 앞", x: "29%", y: "32%" },
      chunwolRoom: { name: "춘월의 방", x: "67%", y: "25%" },
      mudeokServantRoom: { name: "무덕의 하인방", x: "63%", y: "44%" },
      yoomunseokSarangbang: { name: "유문석 사랑방", x: "50%", y: "33%" },
      dolsoeQuarters: { name: "돌쇠 처소", x: "24%", y: "68%" },
      backGateCourtyard: { name: "뒷문 마당", x: "48%", y: "86%" },
      interrogationScreen: { name: "취조실", x: "73%", y: "78%" }
    };
    const soundBase = "/samunmong/sound";
    const bgmTracks = {
      main: document.querySelector("#mainBgm") || new Audio(`${soundBase}/bgm/main.mp3`),
      joseon: new Audio(`${soundBase}/bgm/joseon.mp3`)
    };
    const sfxPaths = {
      ask: `${soundBase}/sfx/ask.mp3`,
      bag: `${soundBase}/sfx/bag.mp3`,
      briefingNext: `${soundBase}/sfx/briefing-next.mp3`,
      button: `${soundBase}/sfx/button.mp3`,
      buttonAlt: `${soundBase}/sfx/button-alt.mp3`,
      dream: `${soundBase}/sfx/dream.mp3`,
      evidence: `${soundBase}/sfx/evidence.mp3`,
      map: `${soundBase}/sfx/map.mp3`,
      move: `${soundBase}/sfx/move.mp3`,
      type1: `${soundBase}/sfx/type-1.mp3`,
      type2: `${soundBase}/sfx/type-2.mp3`,
      type3: `${soundBase}/sfx/type-3.mp3`
    };
    const typeSfxKeys = ["type1", "type2", "type3"];
    let audioUnlocked = false;
    let currentBgm = "";
    let typeSfxIndex = 0;
    let lastTypeSfxAt = 0;
    let lastButtonSfxAt = 0;
    let autoplayRetryTimer = null;


    function readStored(key, fallback) {
      try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
      catch { return fallback; }
    }

    function isValidSavedProgress(saved = readStored(saveKey, null)) {
      return screens.some((screen) => screen.id === saved?.screenId) && saved.screenId !== "mainScreen";
    }

    function updateContinueButtonState() {
      const continueButton = document.querySelector("#continueDream");
      if (!continueButton) return;

      const enabled = isValidSavedProgress();
      continueButton.disabled = !enabled;
      continueButton.setAttribute("aria-disabled", String(!enabled));
      if (enabled) {
        continueButton.removeAttribute("title");
      } else {
        continueButton.title = "저장된 꿈이 없습니다";
      }
    }

    function saveProgress(screenId) {
      if (screenId === "mainScreen") return;
      localStorage.setItem(saveKey, JSON.stringify({ screenId, savedAt: Date.now() }));
      updateContinueButtonState();
    }

    function saveCollectedEvidence(name) {
      const collected = new Set(readStored(collectedEvidenceKey, []));
      collected.add(name);
      localStorage.setItem(collectedEvidenceKey, JSON.stringify([...collected]));
    }

    function saveAnalyzedEvidence(name) {
      const analyzed = new Set(readStored(analyzedEvidenceKey, []));
      analyzed.add(name);
      localStorage.setItem(analyzedEvidenceKey, JSON.stringify([...analyzed]));
    }

    function hasAnalyzedEvidence(name) {
      return readStored(analyzedEvidenceKey, []).includes(name);
    }

    function getAudioLevel() {
      const stored = readStored(settingsKey, {});
      const fromInput = Number(document.querySelector("#volumeSetting")?.value);
      const volume = Number.isFinite(fromInput) ? fromInput : Number(stored.volume ?? 70);
      return Math.max(0, Math.min(1, volume / 100));
    }

    function applyAudioVolume() {
      const level = getAudioLevel();
      Object.values(bgmTracks).forEach((track) => {
        track.volume = level * 0.42;
      });
    }

    function readBgmState() {
      return readStored(bgmStateKey, {});
    }

    function writeBgmState(trackKey, track) {
      if (!trackKey || !track || !Number.isFinite(track.currentTime)) return;
      const previous = readBgmState();
      localStorage.setItem(bgmStateKey, JSON.stringify({
        ...previous,
        [trackKey]: {
          time: track.currentTime,
          savedAt: Date.now()
        }
      }));
    }

    function restoreBgmState(trackKey, track) {
      const state = readBgmState()[trackKey];
      if (!state || !Number.isFinite(state.time) || !track.duration) return;
      const age = Date.now() - Number(state.savedAt || 0);
      if (age > 1000 * 60 * 30) return;
      track.currentTime = Math.min(state.time, Math.max(0, track.duration - 0.2));
    }

    function bgmForScreen(screenId) {
      if (screenId === "mainScreen" || screenId === "tutorialScreen" || screenId === "dreamScreen") return "main";
      return "joseon";
    }

    function getActiveScreenId() {
      return document.querySelector(".screen.active")?.id || "mainScreen";
    }

    function updateBgmForScreen(screenId = getActiveScreenId()) {
      const nextBgm = bgmForScreen(screenId);
      if (currentBgm === nextBgm) return;
      Object.entries(bgmTracks).forEach(([key, track]) => {
        if (key !== nextBgm) {
          writeBgmState(key, track);
          track.pause();
        }
      });
      currentBgm = nextBgm;
      const nextTrack = bgmTracks[nextBgm];
      if (nextTrack?.readyState) restoreBgmState(nextBgm, nextTrack);
      else nextTrack?.addEventListener("loadedmetadata", () => restoreBgmState(nextBgm, nextTrack), { once: true });
      if (!audioUnlocked) return;
      nextTrack?.play().catch(() => {});
    }

    function unlockAudio() {
      audioUnlocked = true;
      clearInterval(autoplayRetryTimer);
      applyAudioVolume();
      updateBgmForScreen();
      const activeBgm = currentBgm || bgmForScreen(getActiveScreenId());
      bgmTracks[activeBgm]?.play().catch(() => {});
    }

    function tryAutoplayBgm() {
      applyAudioVolume();
      const activeBgm = currentBgm || bgmForScreen(getActiveScreenId());
      currentBgm = activeBgm;
      const activeTrack = bgmTracks[activeBgm];
      if (activeTrack?.readyState) restoreBgmState(activeBgm, activeTrack);
      else activeTrack?.addEventListener("loadedmetadata", () => restoreBgmState(activeBgm, activeTrack), { once: true });
      activeTrack?.play()
        .then(() => {
          audioUnlocked = true;
          clearInterval(autoplayRetryTimer);
        })
        .catch(() => {});
    }

    function startAutoplayRetries() {
      clearInterval(autoplayRetryTimer);
      tryAutoplayBgm();
      autoplayRetryTimer = setInterval(() => {
        if (audioUnlocked) {
          clearInterval(autoplayRetryTimer);
          return;
        }
        tryAutoplayBgm();
      }, 700);
      setTimeout(() => clearInterval(autoplayRetryTimer), 9000);
    }

    function playSfx(key, volumeScale = 1) {
      if (!audioUnlocked || !sfxPaths[key]) return;
      const sound = new Audio(sfxPaths[key]);
      sound.volume = Math.max(0, Math.min(1, getAudioLevel() * volumeScale));
      sound.play().catch(() => {});
    }

    function playButtonSfx(volumeScale = 0.58) {
      const now = performance.now();
      if (now - lastButtonSfxAt < 120) return;
      lastButtonSfxAt = now;
      playSfx("button", volumeScale);
    }

    function playTypeSfx() {
      const now = performance.now();
      if (now - lastTypeSfxAt < 95) return;
      const key = typeSfxKeys[typeSfxIndex % typeSfxKeys.length];
      typeSfxIndex += 1;
      lastTypeSfxAt = now;
      playSfx(key, 0.28);
    }

    function stopBriefingTyping() {
      clearInterval(typeBriefing.timer);
    }

    function applySettings(settings) {
      document.body.classList.toggle("reduce-motion", settings.reduceMotion);
      document.body.classList.toggle("high-contrast", settings.highContrast);
      const volumeSetting = document.querySelector("#volumeSetting");
      const motionSetting = document.querySelector("#motionSetting");
      const contrastSetting = document.querySelector("#contrastSetting");
      if (volumeSetting) volumeSetting.value = settings.volume;
      if (motionSetting) motionSetting.checked = settings.reduceMotion;
      if (contrastSetting) contrastSetting.checked = settings.highContrast;
      applyAudioVolume();
    }

    function showToast(message) {
      toast.textContent = message;
      toast.classList.add("show");
      clearTimeout(showToast.timer);
      showToast.timer = setTimeout(() => toast.classList.remove("show"), 1900);
    }

    function on(selector, eventName, handler) {
      document.querySelector(selector)?.addEventListener(eventName, handler);
    }

    function showDreamNotice(title = "꿈은 아직 끝나지 않았습니다", copy = "첫 번째 꿈은 멀어졌지만, 남은 두 꿈은 아직 당신을 부르고 있습니다.") {
      const dialog = document.querySelector("#dreamNoticeDialog");
      const titleEl = document.querySelector("#dreamNoticeTitle");
      const copyEl = document.querySelector("#dreamNoticeCopy");
      if (!dialog) {
        showToast(copy);
        return;
      }

      if (titleEl) titleEl.textContent = title;
      if (copyEl) copyEl.textContent = copy;
      dialog.classList.add("open");
      dialog.setAttribute("aria-hidden", "false");
    }

    function closeDreamNotice() {
      const dialog = document.querySelector("#dreamNoticeDialog");
      dialog?.classList.remove("open");
      dialog?.setAttribute("aria-hidden", "true");
    }

    const buttonGuideTextById = {
      openMapFromInterrogation: "조사 장소를 오갑니다.",
      openNoteProp: "수집한 증거와 심문 기록을 봅니다.",
      toggleEvidenceBag: "모은 증거를 꺼내 제시합니다.",
      interrogationHint: "질문 방향을 떠올립니다.",
      accuseButton: "충분히 모았을 때 판결로 갑니다."
    };

    let buttonGuideHideTimer = null;
    let activeGuideTarget = null;
    const buttonGuideScreenIds = new Set([
      "fieldOne",
      "chunwolRoom",
      "mudeokServantRoom",
      "yoomunseokSarangbang",
      "dolsoeQuarters",
      "backGateCourtyard",
      "interrogationScreen"
    ]);

    function getButtonGuideText(target) {
      if (!target) return "";
      if (target.dataset.guide) return target.dataset.guide;
      if (buttonGuideTextById[target.id]) return buttonGuideTextById[target.id];
      if (target.matches(".map-chip")) return "조사 장소를 오갑니다.";
      if (target.matches(".bag-chip")) return "모은 증거를 확인합니다.";
      if (target.matches(".tool-chip")) return "증거를 더 자세히 분석합니다.";
      if (target.matches(".note-chip")) return "단서와 심문 내용을 정리합니다.";
      if (target.matches(".room-chip")) return target.getAttribute("aria-current") === "page" ? "현재 위치입니다." : "취조실로 이동합니다.";
      if (target.matches(".scene-hint")) return "남은 단서 위치를 잠깐 밝힙니다.";
      if (target.matches(".map-pin-button")) return target.getAttribute("aria-label") || "해당 장소로 이동합니다.";
      if (target.matches(".close-button")) return target.getAttribute("aria-label") || "창을 닫습니다.";
      return target.getAttribute("aria-label") || target.title || target.textContent.trim();
    }

    function positionGuideElement(element, target) {
      const shell = document.querySelector(".game-shell");
      if (!element || !target || !shell) return;
      const shellRect = shell.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const centerX = targetRect.left + targetRect.width / 2 - shellRect.left;
      const targetTop = targetRect.top - shellRect.top;
      const targetBottom = targetRect.bottom - shellRect.top;
      const guideHalfWidth = Math.min(150, Math.max(96, shellRect.width * .36));
      const left = Math.max(guideHalfWidth, Math.min(shellRect.width - guideHalfWidth, centerX));
      const showBelow = targetTop < 130;
      const top = showBelow ? targetBottom + 8 : targetTop - 8;
      element.style.setProperty("--guide-left", `${left}px`);
      element.style.setProperty("--guide-top", `${top}px`);
      element.dataset.placement = showBelow ? "bottom" : "top";
    }

    function hideGuideElement(element) {
      if (!element) return;
      element.classList.remove("is-visible");
      clearTimeout(element.hideTimer);
      element.hideTimer = setTimeout(() => {
        if (!element.classList.contains("is-visible")) element.hidden = true;
      }, 180);
    }

    function hideButtonGuides() {
      hideGuideElement(document.querySelector("#buttonGuideTooltip"));
      activeGuideTarget = null;
    }

    function showHoverGuide(target) {
      const tooltip = document.querySelector("#buttonGuideTooltip");
      const text = getButtonGuideText(target);
      if (!tooltip || !text || target.disabled || target.hidden) return;
      clearTimeout(buttonGuideHideTimer);
      activeGuideTarget = target;
      tooltip.textContent = text;
      tooltip.hidden = false;
      positionGuideElement(tooltip, target);
      requestAnimationFrame(() => tooltip.classList.add("is-visible"));
    }

    function scheduleHideHoverGuide() {
      clearTimeout(buttonGuideHideTimer);
      buttonGuideHideTimer = setTimeout(() => hideGuideElement(document.querySelector("#buttonGuideTooltip")), 80);
    }

    function setupButtonGuides() {
      const selector = [
        ".scene-chip",
        ".tool-prop",
        ".scene-hint"
      ].join(",");

      if (document.documentElement.dataset.buttonGuidesBound === "true") return;
      document.documentElement.dataset.buttonGuidesBound = "true";

      const findGuideTarget = (node) => {
        const button = node instanceof Element ? node.closest(selector) : null;
        const screen = button?.closest(".screen.active");
        if (!screen || !buttonGuideScreenIds.has(screen.id)) return null;
        return button;
      };
      const showFromEvent = (event) => {
        const button = findGuideTarget(event.target);
        if (button) showHoverGuide(button);
      };
      const hideFromEvent = (event) => {
        const button = findGuideTarget(event.target);
        const relatedButton = findGuideTarget(event.relatedTarget);
        if (button && button !== relatedButton) scheduleHideHoverGuide();
      };

      document.addEventListener("pointerover", showFromEvent);
      document.addEventListener("mouseover", showFromEvent);
      document.addEventListener("pointerout", hideFromEvent);
      document.addEventListener("mouseout", hideFromEvent);
      window.addEventListener("resize", () => {
        if (activeGuideTarget) positionGuideElement(document.querySelector("#buttonGuideTooltip"), activeGuideTarget);
      });
      document.addEventListener("pointerdown", hideButtonGuides, { capture: true });
    }

    function updateCurrentLocation(screenId) {
      const location = locationMeta[screenId];
      const indicator = document.querySelector("#currentLocationIndicator");
      const indicatorName = document.querySelector("#currentLocationName");
      const mapName = document.querySelector("#mapCurrentLocation");
      const marker = document.querySelector("#mapCurrentMarker");

      if (indicator) {
        indicator.hidden = !location;
      }

      if (!location) return;

      if (indicatorName) indicatorName.textContent = location.name;
      if (mapName) mapName.textContent = location.name;
      if (marker) {
        marker.style.setProperty("--x", location.x);
        marker.style.setProperty("--y", location.y);
      }

      document.querySelectorAll(".map-label").forEach((label) => {
        label.classList.toggle("current", label.dataset.locationScreen === screenId);
      });
      document.querySelectorAll(".map-pin-button").forEach((pin) => {
        const isCurrent = pin.dataset.mapGo === screenId;
        pin.classList.toggle("current", isCurrent);
        pin.setAttribute("aria-current", isCurrent ? "location" : "false");
      });
    }

    function getActiveScreenId() {
      return document.querySelector(".screen.active")?.id || "mainScreen";
    }

    window.addEventListener("samunmong:screen-change", (event) => {
      const screenId = event.detail?.screenId || getActiveScreenId();
      updateCurrentLocation(screenId);
    });

    function go(id, message = "이동 중...") {
      stopBriefingTyping();
      document.querySelector(".game-shell")?.removeAttribute("data-start-screen");
      playSfx("move", 0.82);
      fade?.classList.add("show");
      if (fade) fade.textContent = message;
      setTimeout(() => {
        screens.forEach((screen) => screen.classList.toggle("active", screen.id === id));
        updateCurrentLocation(id);
        saveProgress(id);
        fade?.classList.remove("show");
        updateBgmForScreen(id);
      }, 260);
    }

    function goRush(id, message = "사건 현장으로 진입 중...") {
      stopBriefingTyping();
      document.querySelector(".game-shell")?.removeAttribute("data-start-screen");
      playSfx("briefingNext", 0.9);
      fade?.classList.add("show", "long");
      if (fade) fade.textContent = message;
      setTimeout(() => {
        screens.forEach((screen) => {
          const isActive = screen.id === id;
          screen.classList.toggle("active", isActive);
          screen.classList.remove("rush-in");
          if (isActive) {
            void screen.offsetWidth;
            screen.classList.add("rush-in");
          }
        });
        fade?.classList.remove("show");
        updateCurrentLocation(id);
        saveProgress(id);
        updateBgmForScreen(id);
      }, 520);
      setTimeout(() => fade?.classList.remove("long"), 980);
    }

    function typeBriefing() {
      if (!briefingCopy) return;
      briefingCopy.textContent = "";
      briefingCopy.classList.remove("done");
      startCaseButton?.classList.remove("ready");
      let index = 0;
      const speed = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 32;

      clearInterval(typeBriefing.timer);
      typeBriefing.timer = setInterval(() => {
        briefingCopy.textContent = briefingText.slice(0, index);
        if (briefingText[index] && !/\s/.test(briefingText[index]) && index % 3 === 0) {
          playTypeSfx();
        }
        index += 1;

        if (index > briefingText.length) {
          clearInterval(typeBriefing.timer);
          briefingCopy.classList.add("done");
          startCaseButton?.classList.add("ready");
        }
      }, speed || 1);
    }

    function showInitialScreenFromSetup() {
      const startScreen = entryParams.get("start");
      const allowedScreens = new Set(["tutorialScreen", "dreamScreen", "briefingScreen", "fieldOne", "chunwolRoom", "mudeokServantRoom", "yoomunseokSarangbang", "dolsoeQuarters", "backGateCourtyard", "interrogationScreen"]);

      if (!allowedScreens.has(startScreen)) {
        return;
      }

      screens.forEach((screen) => screen.classList.toggle("active", screen.id === startScreen));

      if (startScreen === "briefingScreen") {
        typeBriefing();
      } else if (startScreen === "dreamScreen" && entryParams.get("dreamExit") === "1") {
        showDreamNotice(
          "꿈은 아직 끝나지 않았습니다",
          "첫 번째 꿈은 멀어졌지만, 남은 두 꿈은 아직 당신을 부르고 있습니다."
        );
      } else {
        showToast("선택한 설정으로 사건을 시작합니다.");
      }
    }

    function openResultPage() {
      const suspect = suspects[suspectIndex].name;
      const suspectId = suspects[suspectIndex].id;
      const params = new URLSearchParams({
        suspect,
        suspectId
      });

      playSfx("dream", 0.85);
      writeBgmState(currentBgm || bgmForScreen(getActiveScreenId()), bgmTracks[currentBgm || bgmForScreen(getActiveScreenId())]);
      window.location.href = `/result?${params.toString()}`;
    }

    const settingsDialog = document.querySelector("#settingsDialog");
    const exitDialog = document.querySelector("#exitDialog");
    const defaultSettings = { volume: 70, reduceMotion: false, highContrast: false };
    applySettings({ ...defaultSettings, ...readStored(settingsKey, {}) });
    updateContinueButtonState();
    updateBgmForScreen();
    startAutoplayRetries();
    window.addEventListener("focus", tryAutoplayBgm);
    window.addEventListener("pagehide", () => {
      writeBgmState(currentBgm || bgmForScreen(getActiveScreenId()), bgmTracks[currentBgm || bgmForScreen(getActiveScreenId())]);
    });
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) tryAutoplayBgm();
    });
    document.addEventListener("pointerdown", (event) => {
      unlockAudio();
      if (event.target.closest("button, a")) playButtonSfx(0.72);
    }, { once: true, capture: true });
    document.addEventListener("keydown", unlockAudio, { once: true });
    document.addEventListener("click", (event) => {
      if (event.target.closest("button, a")) playButtonSfx(0.52);
    });

    on("#newDream", "click", () => {
      localStorage.removeItem(saveKey);
      localStorage.removeItem(collectedEvidenceKey);
      localStorage.removeItem(analyzedEvidenceKey);
      updateContinueButtonState();
      go("tutorialScreen");
    });
    on("#continueDream", "click", () => {
      const saved = readStored(saveKey, null);
      const valid = isValidSavedProgress(saved);
      if (!valid) return;

      go(saved.screenId, "지난 꿈으로 돌아가는 중...");
      if (saved?.screenId === "briefingScreen") setTimeout(typeBriefing, 300);
    });
    document.querySelectorAll("[data-open-settings='true']").forEach((button) => {
      button.addEventListener("click", () => settingsDialog?.classList.add("open"));
    });
    on("#volumeSetting", "input", () => {
      applyAudioVolume();
    });
    on("#closeSettings", "click", () => {
      const settings = {
        volume: Number(document.querySelector("#volumeSetting").value),
        reduceMotion: document.querySelector("#motionSetting").checked,
        highContrast: document.querySelector("#contrastSetting").checked
      };
      localStorage.setItem(settingsKey, JSON.stringify(settings));
      applySettings(settings);
      settingsDialog?.classList.remove("open");
      showToast("설정을 저장했습니다.");
    });
    on("#exitGame", "click", () => exitDialog?.classList.add("open"));
    on("#cancelExit", "click", () => exitDialog?.classList.remove("open"));
    on("#confirmExit", "click", () => {
      exitDialog?.classList.remove("open");
      document.querySelector("#mainScreen")?.classList.add("exited");
      document.querySelectorAll(".main-menu-button").forEach((button) => { button.hidden = true; });
      showToast("게임을 종료했습니다. 창을 닫아도 진행 위치가 보존됩니다.");
      window.close();
    });
    on("#skipTutorial", "click", () => go("dreamScreen"));
    on("#nextTutorial", "click", () => go("dreamScreen"));
    on("#closeDreamNotice", "click", closeDreamNotice);
    on("#closeDreamNoticeX", "click", closeDreamNotice);
    document.querySelectorAll("[data-dream-disabled='true']").forEach((button) => {
      button.addEventListener("click", () => {
        showDreamNotice(
          "아직 꿈을 그리고 있습니다...",
          "이 꿈은 아직 완성되지 않았습니다. 봉인이 풀릴 때까지 기다려 주세요."
        );
      });
    });
    on("#chooseJoseon", "click", () => {
      playSfx("dream", 0.9);
      go("briefingScreen");
      setTimeout(typeBriefing, 300);
    });
    on("#startCase", "click", () => goRush("fieldOne", "사건 현장으로 진입 중..."));
    document.querySelectorAll("[data-go]").forEach((button) => {
      button.addEventListener("click", () => go(button.dataset.go));
    });
    on("#accuseButton", "click", openResultPage);

    let hopaeCollected = false;
    let portraitCollected = false;
    let pendingEvidenceName = "";
    let pendingEvidenceHotspot = null;
    let currentEvidenceForTool = "";
    let selectedToolForAnalysis = "";
    let swipeStartPoint = null;

    const tools = {
      "돋보기": {
        img: "/samunmong/assets/mudeok-interaction/tool-magnifying-glass.png",
        note: "작은 글자, 긁힌 자국, 미세한 흔적을 확대합니다."
      },
      "먼지털이 붓": {
        img: "/samunmong/assets/mudeok-interaction/tool-dusting-brush.png",
        note: "흙먼지나 재를 털어 숨은 표면을 드러냅니다."
      },
      "촛불 비추기": {
        img: "/samunmong/assets/mudeok-interaction/tool-candle-lantern.png",
        note: "어두운 곳, 비침, 눌린 자국을 빛으로 확인합니다."
      }
    };

    const evidenceData = window.SAMUNMONG_CONTENT?.evidenceData || {
      "호패 조각": {
        note: "점순 옆에서 발견된 신분 단서. 양반 호패로 추정되지만 일부 글자가 긁혀 있다.",
        img: "/samunmong/assets/evidence-wooden-tag.png",
        tool: "돋보기",
        toolResult: "긁힌 글자 주변에 일부러 표면을 문지른 흔적이 보인다."
      },
      "돌쇠의 그림": {
        note: "최춘월의 방에서 발견된 숨겨둔 초상. 춘월과 돌쇠의 관계를 추적할 단서다.",
        img: "/samunmong/assets/evidence-portrait.png",
        tool: "촛불 비추기",
        toolResult: "빛을 비추자 그림 뒤쪽에 접착된 얇은 종이 흔적이 보인다."
      },
      "사라진 노리개": {
        note: "끊어진 장식과 급히 잡아챈 듯한 흔적이 남은 노리개. 누가 지녔는지 확인해야 한다.",
        img: "/samunmong/assets/evidence-transparent/evidence-norigae-transparent.png",
        tool: "돋보기",
        toolResult: "작은 연결 고리에 억지로 잡아당긴 흔적이 보인다."
      },
      "나무 상자": {
        note: "사랑방에서 확인한 작은 나무 상자. 안에 무엇이 있었는지 살펴야 한다.",
        img: "/samunmong/assets/evidence-transparent/evidence-wooden-box-transparent.png",
        tool: "돋보기",
        toolResult: "틈새를 자세히 살피자 상자 안쪽에 종이 가루가 남아 있다."
      },
      "무덕의 번진 일기": {
        note: "먹이 번져 읽기 어려운 일기. 도구로 얼룩을 확인하면 숨긴 문장을 더 추적할 수 있다.",
        img: "/samunmong/assets/mudeok-interaction/evidence-mudeok-smeared-diary.png",
        tool: "촛불 비추기",
        toolResult: "빛을 비추자 번진 먹 아래로 최근에 젖은 듯한 얼룩 경계가 드러난다."
      },
      "진흙 묻은 짚신": {
        note: "문밖 젖은 길과 닮은 진흙이 묻은 짚신. 이동 경로를 비교할 단서다.",
        img: "/samunmong/assets/mudeok-interaction/evidence-mudeok-muddy-straw-shoes.png",
        tool: "먼지털이 붓",
        toolResult: "먼지를 털자 짚신 바닥의 젖은 흙이 또렷하게 드러난다."
      },
      "찢어진 옷고름": {
        note: "거칠게 끊어진 옷고름. 몸싸움이나 급한 움직임을 의심하게 한다.",
        img: "/samunmong/assets/mudeok-interaction/evidence-torn-collar-tie.png",
        tool: "돋보기",
        toolResult: "돋보기로 보니 실밥이 한 방향으로 잡아뜯긴 모양이다."
      },
      "손톱 밑 실 샘플": {
        note: "작은 실오라기 샘플. 옷감이나 끈과 대조할 수 있다.",
        img: "/samunmong/assets/mudeok-interaction/evidence-fingernail-thread-sample.png",
        tool: "돋보기",
        toolResult: "확대해 보니 옷고름의 실 결하고 비슷한 꼬임이 보인다."
      },
      "점순 목 검사 종이": {
        note: "점순의 목 주변을 살핀 기록지. 직접적인 결론 대신 흔적의 위치만 남겨져 있다.",
        img: "/samunmong/assets/mudeok-interaction/evidence-jeomsun-neck-exam-paper.png",
        tool: "촛불 비추기",
        toolResult: "빛을 비추자 종이 위에 눌린 선이 희미하게 떠오른다."
      },
      "빈 호패 주머니": {
        note: "호패가 빠진 듯한 빈 주머니. 주인과 호패 조각의 관계를 확인할 수 있다.",
        img: "/samunmong/assets/evidence-transparent/evidence-empty-hopae-holder.png",
        tool: "돋보기",
        toolResult: "안쪽 가장자리에서 끊어진 끈의 마찰 흔적이 보인다."
      },
      "하인 장부": {
        note: "하인들의 출입과 심부름 기록이 적힌 장부. 장소 이동을 대조할 수 있다.",
        img: "/samunmong/assets/evidence-transparent/evidence-servant-ledger.png",
        tool: "촛불 비추기",
        toolResult: "빛에 비추자 장부장 사이로 눌려 있던 빈 줄 하나가 드러난다."
      },
      "종이칼": {
        note: "사랑방 책상에 놓인 종이칼. 편지 조각과 절단면을 비교할 수 있다.",
        img: "/samunmong/assets/evidence-transparent/evidence-paper-knife.png",
        tool: "돋보기",
        toolResult: "칼끝에 아주 작은 종이 섬유가 붙어 있다."
      },
      "먹가루": {
        note: "책상 주변에 흩어진 먹가루. 문서가 급히 지워졌는지 확인할 수 있다.",
        img: "/samunmong/assets/evidence-transparent/evidence-ink-powder.png",
        tool: "돋보기",
        toolResult: "확대해 보니 가루가 문지른 자국을 따라 고르게 흩어져 있다."
      },
      "혼서 조각": {
        note: "혼례와 관련 있어 보이는 문서 조각. 인물 관계를 다시 보게 만드는 단서다.",
        img: "/samunmong/assets/evidence-transparent/evidence-marriage-letter.png",
        tool: "촛불 비추기",
        toolResult: "빛에 비추자 접힌 자국 아래 희미한 붉은 인장이 보인다."
      },
      "도끼와 칼": {
        note: "돌쇠 처소에서 확인한 날붙이. 직접 결론보다 사용 흔적을 조사해야 한다.",
        img: "/samunmong/assets/evidence-transparent/evidence-axe-knife.png",
        tool: "돋보기",
        toolResult: "날 가장자리에 오래된 얼룩과 새 얼룩이 섞인 듯한 흔적이 보인다."
      },
      "피 묻은 붕대": {
        note: "피처럼 보이는 얼룩이 남은 붕대. 상처나 몸싸움 흔적과 연결될 수 있다.",
        img: "/samunmong/assets/evidence-transparent/evidence-bloodied-bandage.png",
        tool: "돋보기",
        toolResult: "얼룩 가장자리가 아직 짙고 불규칙하게 번진 흔적이 보인다."
      },
      "도망 보따리": {
        note: "급히 싼 듯한 보따리. 누군가 떠날 준비를 했는지 확인해야 한다.",
        img: "/samunmong/assets/evidence-transparent/evidence-escape-bundle.png",
        tool: "돋보기",
        toolResult: "묶음 틈을 살피자 안쪽에 접힌 종이 조각이 끼어 있다."
      },
      "긁힌 팔 흔적": {
        note: "심문 중 소매 아래에서 확인한 긁힌 흔적. 실오라기나 몸싸움 흔적과 대조할 수 있다.",
        img: "/samunmong/assets/evidence-transparent/evidence-scratched-arm.png",
        tool: "돋보기",
        toolResult: "상처 주변에 작은 섬유 먼지가 붙어 있는 듯하다."
      },
      "작은 발자국": {
        note: "뒷문 마당에 남은 작은 발자국. 젖은 돌길의 이동 경로와 맞춰볼 수 있다.",
        img: "/samunmong/assets/evidence-transparent/evidence-small-footprints.png",
        tool: "촛불 비추기",
        toolResult: "촛불을 낮게 비추자 발자국의 폭과 앞코 모양이 드러났다. 남성의 짚신이 아니라 여성의 고급 신발 자국으로 보인다."
      },
      "끊어진 호패끈": {
        note: "호패와 연결되었을 법한 끊어진 끈. 호패 조각과 함께 봐야 한다.",
        img: "/samunmong/assets/evidence-transparent/evidence-cut-hopae-cord.png",
        tool: "돋보기",
        toolResult: "끊어진 단면이 칼로 잘린 듯 매끈한 부분과 거친 부분으로 나뉜다."
      },
      "맞물리는 종이 조각": {
        note: "다른 편지 조각과 맞물릴 수 있는 종이. 조각들을 맞춰 확인해야 한다.",
        img: "/samunmong/assets/evidence-transparent/evidence-matching-paper-scraps.png",
        tool: "촛불 비추기",
        toolResult: "빛 아래에서 가장자리를 맞춰 보니 찢어진 결이 자연스럽게 이어진다."
      },
      "찢어진 편지 조각": {
        note: "찢겨 나간 편지의 일부. 누군가 숨기려 했던 말이 남아 있을 수 있다.",
        img: "/samunmong/assets/evidence-transparent/evidence-torn-letter-transparent.png",
        tool: "촛불 비추기",
        toolResult: "빛을 비추자 종이 뒷면에 흐릿한 먹 자국이 보인다."
      }
    };

    function escapeHtml(value) {
      return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
    }

    function getEvidenceLocation(name) {
      return evidenceData[name]?.location || "획득 장소 미상";
    }

    function formatEvidenceEntries(name) {
      const entries = evidenceData[name]?.entries;
      if (!Array.isArray(entries) || !entries.length) return "";

      return entries.map((entry) => `${entry.date}: ${entry.text}`).join("\n");
    }

    function getEvidenceAnalysisText(name) {
      const data = evidenceData[name] || {};
      const lines = [data.toolResult || "추가 분석 결과가 없습니다."];
      const entries = formatEvidenceEntries(name);
      if (entries) {
        lines.push("드러난 기록", entries);
      }
      if (data.logic) {
        lines.push(data.logic);
      }
      return lines.filter(Boolean).join("\n\n");
    }

    function getEvidenceDetailText(name, analyzed = false) {
      const data = evidenceData[name] || {};
      const lines = [
        data.note || "현장에서 발견한 단서입니다.",
        `획득 장소: ${getEvidenceLocation(name)}`
      ];

      if (data.logic) lines.push(data.logic);
      if (data.relatedSuspects?.length) lines.push(`관련 인물: ${data.relatedSuspects.join(", ")}`);
      if (analyzed && formatEvidenceEntries(name)) lines.push(`확인된 내용:\n${formatEvidenceEntries(name)}`);
      if (data.tool) lines.push(`추천 도구: ${data.tool}`);

      return lines.filter(Boolean).join("\n");
    }

    function evidenceCardHtml(name) {
      const data = evidenceData[name] || {};
      return `
        <img class="evidence-thumb" src="${escapeHtml(data.img || "/samunmong/assets/evidence-wooden-tag.png")}" alt="">
        <span class="evidence-card-copy">
          <strong>${escapeHtml(name)}</strong>
          <span class="evidence-location">획득: ${escapeHtml(getEvidenceLocation(name))}</span>
          <span>${escapeHtml(data.note || "현장에서 발견된 단서")}</span>
          ${data.logic ? `<span class="evidence-logic">${escapeHtml(data.logic)}</span>` : ""}
        </span>`;
    }

    function addEvidenceToNote(name) {
      const list = document.querySelector("#collectedEvidenceNote");
      document.querySelector("#emptyEvidenceNote")?.remove();
      const exists = [...list.children].some((item) => item.dataset.evidence === name);
      if (!exists) {
        const item = document.createElement("li");
        item.dataset.evidence = name;
        item.textContent = `${name} / 획득: ${getEvidenceLocation(name)} - ${evidenceData[name]?.logic || evidenceData[name]?.note || "현장에서 발견된 단서"}`;
        list.appendChild(item);
      }

      const fieldList = document.querySelector("#fieldNoteList");
      document.querySelector("#emptyFieldNote")?.remove();
      const fieldExists = [...fieldList.children].some((item) => item.dataset.evidence === name);
      if (!fieldExists) {
        const item = document.createElement("li");
        item.dataset.evidence = name;
        item.textContent = `${name} / 획득: ${getEvidenceLocation(name)} - ${evidenceData[name]?.logic || evidenceData[name]?.note || "현장에서 발견된 단서"}`;
        fieldList.appendChild(item);
      }
    }

    function markEvidenceCollectedInScene(name) {
      document.querySelectorAll(`[data-evidence-name="${name}"]`).forEach((item) => item.classList.add("collected"));
      const propSelectors = {
        "작은 발자국": ".footprints-prop",
        "끊어진 호패끈": ".cord-prop"
      };
      const propSelector = propSelectors[name];
      if (propSelector) {
        document.querySelectorAll(propSelector).forEach((item) => item.classList.add("collected"));
      }
    }

    function addObservationToNote(name, text) {
      const noteText = `${name}: ${text}`;
      const lists = [document.querySelector("#collectedEvidenceNote"), document.querySelector("#fieldNoteList")];
      document.querySelector("#emptyEvidenceNote")?.remove();
      document.querySelector("#emptyFieldNote")?.remove();
      lists.forEach((list) => {
        const exists = [...list.children].some((item) => item.dataset.evidence === name);
        if (!exists) {
          const item = document.createElement("li");
          item.dataset.evidence = name;
          item.textContent = noteText;
          list.appendChild(item);
        }
      });
    }

    function addEvidenceToBag(name) {
      saveCollectedEvidence(name);
      addEvidenceCardToInterrogation(name);
      addEvidenceToToolPanel(name);
      playSfx("bag", 0.7);
    }

    function setAnalysisTarget(name) {
      currentEvidenceForTool = name;
      document.querySelector("#analysisTarget").textContent = name;
      document.querySelectorAll("#toolEvidenceList .tool-evidence-option").forEach((item) => {
        item.classList.toggle("selected", item.dataset.evidence === name);
      });
      updateToolPreview(name);
    }

    function addEvidenceToToolPanel(name) {
      const list = document.querySelector("#toolEvidenceList");
      if (!list) return;
      list.querySelector(".evidence-empty")?.remove();
      const exists = [...list.children].some((item) => item.dataset.evidence === name);
      if (exists) return;

      const data = evidenceData[name] || {};
      const button = document.createElement("button");
      button.className = `tool-evidence-option${hasAnalyzedEvidence(name) ? " analyzed" : ""}`;
      button.type = "button";
      button.dataset.evidence = name;
      button.innerHTML = `<img src="${data.img || "/samunmong/assets/evidence-wooden-tag.png"}" alt=""><span><strong>${name}</strong>${data.tool ? "자세히 살펴보기" : "확인 완료"}</span>`;
      button.addEventListener("click", () => setAnalysisTarget(name));
      list.appendChild(button);
    }

    function syncEvidenceShadowBounds() {
      const target = document.querySelector(".tool-preview-image");
      const image = document.querySelector("#toolPreviewImage");
      if (!target || !image) return;
      const targetRect = target.getBoundingClientRect();
      const imageRect = image.getBoundingClientRect();
      if (imageRect.width < 2 || imageRect.height < 2) return;
      target.style.setProperty("--evidence-left", `${imageRect.left - targetRect.left}px`);
      target.style.setProperty("--evidence-top", `${imageRect.top - targetRect.top}px`);
      target.style.setProperty("--evidence-width", `${imageRect.width}px`);
      target.style.setProperty("--evidence-height", `${imageRect.height}px`);
    }

    function updateToolPreview(name) {
      const data = evidenceData[name] || {};
      const image = document.querySelector("#toolPreviewImage");
      const title = document.querySelector("#toolPreviewTitle");
      const note = document.querySelector("#toolPreviewNote");
      if (!image || !title || !note) return;
      const analyzed = Boolean(name && hasAnalyzedEvidence(name));

      image.src = data.img || "/samunmong/assets/evidence-wooden-tag.png";
      image.alt = name ? `${name} 확대 이미지` : "";
      title.textContent = name || "증거를 선택하세요";
      note.textContent = analyzed
        ? getEvidenceAnalysisText(name)
        : name
          ? `${getEvidenceDetailText(name)}\n${data.tool ? "증거를 관찰하고 어울리는 도구를 직접 골라 보세요." : "추가 도구 분석은 필요하지 않습니다."}`
        : "수집한 증거를 고르면 이곳에 크게 표시됩니다.";
      const preview = document.querySelector(".tool-preview");
      preview?.classList.remove("revealed", "wrong-tool");
      preview?.classList.toggle("revealed", analyzed);
      document.querySelectorAll(`#toolEvidenceList [data-evidence="${name}"]`).forEach((item) => {
        item.classList.toggle("analyzed", analyzed);
      });
      requestAnimationFrame(syncEvidenceShadowBounds);
      setTimeout(syncEvidenceShadowBounds, 80);
    }

    function addEvidenceCardToInterrogation(name) {
      const list = document.querySelector("#evidenceList");
      document.querySelector("#emptyInterrogationEvidence")?.remove();
      const existing = [...list.querySelectorAll(".evidence")].find((item) => item.dataset.evidence === name);
      if (existing) {
        existing.classList.remove("hidden");
        return;
      }

      const button = document.createElement("button");
      button.className = "evidence evidence-card";
      button.type = "button";
      button.dataset.evidence = name;
      button.innerHTML = evidenceCardHtml(name);
      button.addEventListener("click", () => selectEvidence(button));
      list.appendChild(button);
    }

    function selectEvidence(button) {
      document.querySelectorAll(".evidence").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      selectedEvidence = button.dataset.evidence;
      document.querySelector("#presentedEvidence").textContent = selectedEvidence;
      setEvidenceBag(false);
      playSfx("buttonAlt", 0.62);
      showToast(`증거 제시: ${selectedEvidence}`);
    }

    function renderTools() {
      const grid = document.querySelector("#toolGrid");
      grid.innerHTML = "";
      Object.entries(tools).forEach(([name, tool]) => {
        const button = document.createElement("button");
        button.className = "tool-card";
        button.type = "button";
        button.dataset.tool = name;
        button.innerHTML = `<img src="${tool.img}" alt=""><span><strong>${name}</strong>${tool.note}</span>`;
        button.addEventListener("click", () => {
          selectedToolForAnalysis = name;
          updateToolCursor();
          document.querySelectorAll(".tool-card").forEach((item) => item.classList.toggle("active", item.dataset.tool === name));
          showToast(`${name} 선택. 증거 위를 문질러 보세요.`);
        });
        grid.appendChild(button);
      });
    }

    function ensureToolCursor() {
      let cursor = document.querySelector("#selectedToolCursor");
      if (cursor) return cursor;

      cursor = document.createElement("img");
      cursor.id = "selectedToolCursor";
      cursor.className = "tool-cursor";
      cursor.alt = "";
      cursor.setAttribute("aria-hidden", "true");
      document.body.appendChild(cursor);
      return cursor;
    }

    function updateToolCursor() {
      const tool = tools[selectedToolForAnalysis];
      const cursor = ensureToolCursor();
      const toolPanelOpen = document.querySelector("#toolPanel")?.classList.contains("show");
      const inToolArea = document.querySelector(".tool-preview-image")?.classList.contains("cursor-inside");
      if (!tool || !toolPanelOpen || !inToolArea) {
        document.body.classList.remove("tool-cursor-active");
        cursor.classList.remove("show");
        return;
      }

      cursor.src = tool.img;
      cursor.classList.add("show");
      document.body.classList.add("tool-cursor-active");
    }

    function moveToolCursor(event) {
      const cursor = document.querySelector("#selectedToolCursor");
      if (!cursor || !cursor.classList.contains("show")) return;
      cursor.style.left = `${event.clientX + 14}px`;
      cursor.style.top = `${event.clientY + 16}px`;
    }

    function updateWipePosition(event) {
      const target = document.querySelector(".tool-preview-image");
      const image = document.querySelector("#toolPreviewImage");
      if (!target || !image) return;
      const imageRect = image.getBoundingClientRect();
      syncEvidenceShadowBounds();
      const x = Math.max(0, Math.min(100, ((event.clientX - imageRect.left) / imageRect.width) * 100));
      const y = Math.max(0, Math.min(100, ((event.clientY - imageRect.top) / imageRect.height) * 100));
      target.style.setProperty("--wipe-x", `${x}%`);
      target.style.setProperty("--wipe-y", `${y}%`);
    }

    function updateToolAreaHover(event) {
      const area = document.querySelector(".tool-preview-image");
      if (!area) return;
      const element = document.elementFromPoint(event.clientX, event.clientY);
      const isInside = Boolean(element && area.contains(element));
      area.classList.toggle("cursor-inside", isInside);
      updateToolCursor();
      if (isInside) updateWipePosition(event);
    }

    function showToolResultPopup(evidenceName, toolName, resultText) {
      const panel = document.querySelector("#toolResultPopup");
      if (!panel) return;

      document.querySelector("#toolResultKicker").textContent = `${toolName} 분석`;
      document.querySelector("#toolResultTitle").textContent = evidenceName;
      document.querySelector("#toolResultText").textContent = resultText;
      panel.classList.add("show");
      panel.setAttribute("aria-hidden", "false");
      globalOverlay.classList.add("show");
    }

    function closeToolResultPopup() {
      const panel = document.querySelector("#toolResultPopup");
      panel?.classList.remove("show");
      panel?.setAttribute("aria-hidden", "true");
      const hasOpenGlobalPanel = globalPanels.some((panel) => panel.classList.contains("show"));
      if (!hasOpenGlobalPanel && !evidenceBagPop.classList.contains("open")) {
        globalOverlay.classList.remove("show");
      }
    }

    function analyzeEvidenceWithTool(toolName) {
      if (!currentEvidenceForTool) {
        showToast("분석할 증거를 선택하세요.");
        return;
      }

      const data = evidenceData[currentEvidenceForTool] || {};
      if (!data.tool) {
        showToast(`${currentEvidenceForTool}은 추가 도구 분석이 필요하지 않습니다.`);
        return;
      }

      if (data.tool !== toolName) {
        document.querySelector(".tool-preview")?.classList.add("wrong-tool");
        setTimeout(() => document.querySelector(".tool-preview")?.classList.remove("wrong-tool"), 520);
        showToast("다른 도구를 시도해 보세요.");
        return;
      }

      const resultText = getEvidenceAnalysisText(currentEvidenceForTool);
      addObservationToNote(`${currentEvidenceForTool} 추가 분석`, resultText);
      saveAnalyzedEvidence(currentEvidenceForTool);
      document.querySelectorAll(`[data-evidence-name="${currentEvidenceForTool}"]`).forEach((item) => item.classList.add("analyzed"));
      document.querySelectorAll(`#toolEvidenceList [data-evidence="${currentEvidenceForTool}"]`).forEach((item) => item.classList.add("analyzed"));
      document.querySelector(".tool-preview")?.classList.add("revealed");
      const previewNote = document.querySelector("#toolPreviewNote");
      if (previewNote) previewNote.textContent = resultText;
      showToolResultPopup(currentEvidenceForTool, toolName, resultText);
      showToast(`${toolName}로 ${currentEvidenceForTool}을 분석했습니다.`);
    }

    function beginToolSwipe(event) {
      if (!currentEvidenceForTool) {
        showToast("먼저 분석할 증거를 선택하세요.");
        return;
      }
      event.preventDefault();
      event.currentTarget?.setPointerCapture?.(event.pointerId);
      swipeStartPoint = { x: event.clientX, y: event.clientY };
      updateWipePosition(event);
      document.querySelector(".tool-preview")?.classList.add("swiping");
    }

    function moveToolSwipe(event) {
      if (!swipeStartPoint) return;
      event.preventDefault();
      moveToolCursor(event);
      updateWipePosition(event);
      const dx = event.clientX - swipeStartPoint.x;
      const dy = event.clientY - swipeStartPoint.y;
      const distance = Math.min(170, Math.max(70, Math.hypot(dx, dy)));
      document.querySelector(".tool-preview-image")?.style.setProperty("--wipe-size", `${distance}px`);
    }

    function finishToolSwipe(event) {
      if (!swipeStartPoint) return;
      event.preventDefault();
      event.currentTarget?.releasePointerCapture?.(event.pointerId);
      const dx = event.clientX - swipeStartPoint.x;
      const dy = event.clientY - swipeStartPoint.y;
      const distance = Math.hypot(dx, dy);
      swipeStartPoint = null;
      document.querySelector(".tool-preview")?.classList.remove("swiping");

      if (!selectedToolForAnalysis) {
        showToast("아래 도구 탭에서 도구를 먼저 고르세요.");
        return;
      }
      if (distance < 56) {
        showToast("증거 위를 조금 더 길게 문질러 보세요.");
        return;
      }
      analyzeEvidenceWithTool(selectedToolForAnalysis);
    }

    function showInspect(id) {
      document.querySelectorAll(".inspect-pop").forEach((panel) => panel.classList.remove("show"));
      document.querySelector(id)?.classList.add("show");
      clearTimeout(showInspect.timer);
    }

    function hideInspectPanels() {
      document.querySelectorAll(".inspect-pop").forEach((panel) => panel.classList.remove("show"));
    }

    function collectHopae() {
      if (hopaeCollected) {
        setAnalysisTarget("호패 조각");
        return;
      }
      hopaeCollected = true;
      document.querySelector("#hopaeHotspot")?.classList.add("collected");
      playSfx("evidence", 0.85);
      addEvidenceToBag("호패 조각");
      addEvidenceToNote("호패 조각");
    }
    document.querySelector("#hopaeHotspot").addEventListener("click", () => {
      collectHopae();
      showInspect("#hopaeInspect");
    });
    document.querySelector("#closeHopaeInspect")?.addEventListener("click", hideInspectPanels);

    function collectPortrait() {
      if (portraitCollected) {
        setAnalysisTarget("돌쇠의 그림");
        openGlobalPanel("toolPanel");
        return;
      }
      portraitCollected = true;
      document.querySelector("#collectPortrait").textContent = "수집 완료";
      document.querySelector("#portraitHotspot")?.classList.add("collected");
      playSfx("evidence", 0.85);
      addEvidenceToBag("돌쇠의 그림");
      addEvidenceToNote("돌쇠의 그림");
      hideInspectPanels();
      showToast("돌쇠의 그림이 기록에 남았다. 감춰둔 시선에는 반드시 이유가 있다.");
    }
    document.querySelector("#collectPortrait").addEventListener("click", collectPortrait);
    document.querySelector("#portraitHotspot").addEventListener("click", () => {
      collectPortrait();
      document.querySelector("#collectPortrait").textContent = "보따리에서 분석하기";
      showInspect("#portraitInspect");
    });
    function showGenericEvidence(name, hotspot) {
      const data = evidenceData[name] || {};
      pendingEvidenceName = name;
      pendingEvidenceHotspot = hotspot;
      const alreadyCollected = hotspot.classList.contains("collected");
      if (!alreadyCollected) {
        markEvidenceCollectedInScene(name);
        playSfx("evidence", 0.85);
        addEvidenceToBag(name);
        addEvidenceToNote(name);
      }
      setAnalysisTarget(name);

      document.querySelector("#genericEvidenceImage").src = data.img || "/samunmong/assets/evidence-wooden-tag.png";
      document.querySelector("#genericEvidenceTitle").textContent = name;
      document.querySelector("#genericEvidenceText").textContent = `${getEvidenceDetailText(name, hasAnalyzedEvidence(name))}\n${data.tool ? "수사 도구로 더 자세히 살펴볼 수 있습니다." : "도구 없이 확인 가능한 단서입니다."}`;
      document.querySelector("#genericEvidenceInspect").classList.add("show");
      clearTimeout(showInspect.timer);
    }
    document.querySelector("#closeGenericEvidenceInspect")?.addEventListener("click", hideInspectPanels);
    document.addEventListener("pointermove", (event) => {
      updateToolAreaHover(event);
      moveToolCursor(event);
    });
    document.querySelector(".tool-preview-image")?.addEventListener("pointerenter", (event) => {
      event.currentTarget.classList.add("cursor-inside");
      updateToolCursor();
      moveToolCursor(event);
      updateWipePosition(event);
    });
    document.querySelector(".tool-preview-image")?.addEventListener("pointerleave", (event) => {
      if (swipeStartPoint) return;
      event.currentTarget.classList.remove("cursor-inside");
      updateToolCursor();
    });
    document.querySelector(".tool-preview-image")?.addEventListener("pointerdown", beginToolSwipe);
    document.querySelector(".tool-preview-image")?.addEventListener("pointermove", moveToolSwipe);
    document.querySelector(".tool-preview-image")?.addEventListener("pointerup", finishToolSwipe);
    document.querySelector(".tool-preview-image")?.addEventListener("pointercancel", () => {
      swipeStartPoint = null;
      document.querySelector(".tool-preview")?.classList.remove("swiping");
    });
    document.querySelector("#toolPreviewImage")?.addEventListener("dragstart", (event) => event.preventDefault());
    document.querySelector("#toolPreviewImage")?.addEventListener("load", syncEvidenceShadowBounds);
    document.querySelectorAll("[data-evidence-name]").forEach((hotspot) => {
      hotspot.addEventListener("click", () => showGenericEvidence(hotspot.dataset.evidenceName, hotspot));
    });

    document.querySelectorAll(".screen").forEach((screen) => {
      const evidenceHotspots = [...screen.querySelectorAll(".hotspot[data-evidence-name], #hopaeHotspot, #portraitHotspot")];
      if (!evidenceHotspots.length) return;
      evidenceHotspots.forEach((hotspot) => hotspot.classList.add("evidence-hotspot"));
      const hint = document.createElement("button");
      hint.className = "scene-hint";
      hint.type = "button";
      hint.textContent = "힌트";
      hint.setAttribute("aria-label", "이 장면의 증거 위치 힌트");
      hint.addEventListener("click", () => {
        const remainingEvidence = evidenceHotspots.filter((hotspot) => !hotspot.classList.contains("collected"));
        if (!remainingEvidence.length) {
          showToast("이 장면의 증거를 모두 찾았습니다.");
          return;
        }
        screen.classList.remove("hint-active");
        void screen.offsetWidth;
        screen.classList.add("hint-active");
        clearTimeout(screen.hintTimer);
        screen.hintTimer = setTimeout(() => screen.classList.remove("hint-active"), 2500);
      });
      screen.appendChild(hint);
    });

    function updateSuspect() {
      const suspect = suspects[suspectIndex];
      document.querySelector("#suspectName").textContent = suspect.name;
      document.querySelector("#noteSuspect").textContent = suspect.name;
      document.querySelector("#suspectStage").dataset.suspect = suspect.id;
      document.querySelector("#interrogationPlate").src = sleeveCheckedSuspects.has(suspect.id) ? suspect.sleeveScene : suspect.scene;
      showToast(`${suspect.name} 심문으로 전환`);
    }

    document.querySelector("#prevSuspect").addEventListener("click", () => {
      suspectIndex = (suspectIndex - 1 + suspects.length) % suspects.length;
      updateSuspect();
    });
    document.querySelector("#nextSuspect").addEventListener("click", () => {
      suspectIndex = (suspectIndex + 1) % suspects.length;
      updateSuspect();
    });

    const noteDrawer = document.querySelector("#noteDrawer");
    const overlay = document.querySelector("#overlay");
    function setNote(open) {
      noteDrawer.classList.toggle("open", open);
      overlay.classList.toggle("show", open);
      noteDrawer.setAttribute("aria-hidden", String(!open));
    }
    document.querySelector("#openNoteProp").addEventListener("click", () => setNote(true));
    document.querySelector("#closeNote").addEventListener("click", () => setNote(false));
    overlay.addEventListener("click", () => setNote(false));

    const evidenceBagPop = document.querySelector("#evidenceBagPop");
    const toggleEvidenceBag = document.querySelector("#toggleEvidenceBag");
    function setEvidenceBag(open) {
      evidenceBagPop.classList.toggle("open", open);
      evidenceBagPop.setAttribute("aria-hidden", String(!open));
      document.querySelectorAll("#toggleEvidenceBag, .bag-chip, .open-bag-panel").forEach((button) => {
        button.setAttribute("aria-expanded", String(open));
      });
      globalOverlay.classList.toggle("show", open);
      if (open) playSfx("bag", 0.7);
    }
    toggleEvidenceBag.addEventListener("click", () => setEvidenceBag(!evidenceBagPop.classList.contains("open")));
    document.querySelector("#closeEvidenceBag").addEventListener("click", () => setEvidenceBag(false));

    const globalOverlay = document.querySelector("#globalOverlay");
    const globalPanels = [...document.querySelectorAll(".global-panel")];

    function openGlobalPanel(id) {
      hideInspectPanels();
      setEvidenceBag(false);

      globalPanels.forEach((panel) => {
        const isOpen = panel.id === id;
        panel.classList.toggle("show", isOpen);
        panel.setAttribute("aria-hidden", String(!isOpen));
      });
      globalOverlay.classList.add("show");
      if (id === "mapPanel") playSfx("map", 0.78);
      if (id === "toolPanel") playSfx("buttonAlt", 0.62);
      updateToolCursor();
    }

    function closeGlobalPanel() {
      globalPanels.forEach((panel) => {
        panel.classList.remove("show");
        panel.setAttribute("aria-hidden", "true");
      });
      document.querySelector("#toolResultPopup")?.classList.remove("show");
      document.querySelector("#toolResultPopup")?.setAttribute("aria-hidden", "true");
      setEvidenceBag(false);
      globalOverlay.classList.remove("show");
      document.body.classList.remove("tool-cursor-active");
      document.querySelector("#selectedToolCursor")?.classList.remove("show");
    }

    ["#openMapFromField", "#openMapFromRoom", "#openMapFromMudeokRoom", "#openMapFromInterrogation"].forEach((selector) => {
      document.querySelector(selector)?.addEventListener("click", () => openGlobalPanel("mapPanel"));
    });
    document.querySelectorAll(".open-map-panel").forEach((button) => {
      button.addEventListener("click", () => openGlobalPanel("mapPanel"));
    });
    ["#openBagFromField", "#openBagFromRoom", "#openBagFromMudeokRoom"].forEach((selector) => {
      document.querySelector(selector)?.addEventListener("click", () => setEvidenceBag(true));
    });
    document.querySelectorAll(".open-bag-panel").forEach((button) => {
      button.addEventListener("click", () => setEvidenceBag(true));
    });
    document.querySelectorAll(".open-tool-panel").forEach((button) => {
      button.addEventListener("click", () => openGlobalPanel("toolPanel"));
    });
    document.addEventListener("keydown", (event) => {
      const target = event.target;
      const isTyping = target?.matches?.("input, textarea, select, [contenteditable='true']");
      if (event.key !== "Tab" || event.altKey || event.ctrlKey || event.metaKey || isTyping) return;
      event.preventDefault();
      openGlobalPanel("toolPanel");
    });
    ["#openNoteFromField", "#openNoteFromRoom", "#openNoteFromMudeokRoom"].forEach((selector) => {
      document.querySelector(selector)?.addEventListener("click", () => openGlobalPanel("fieldNotePanel"));
    });
    document.querySelectorAll(".open-note-panel").forEach((button) => {
      button.addEventListener("click", () => openGlobalPanel("fieldNotePanel"));
    });
    document.querySelectorAll(".global-close").forEach((button) => button.addEventListener("click", closeGlobalPanel));
    on("#closeToolResult", "click", closeToolResultPopup);
    globalOverlay.addEventListener("click", closeGlobalPanel);
    document.querySelectorAll("[data-map-go]").forEach((button) => {
      button.addEventListener("pointerdown", () => button.classList.add("pressing"));
      button.addEventListener("pointerup", () => button.classList.remove("pressing"));
      button.addEventListener("pointerleave", () => button.classList.remove("pressing"));
      button.addEventListener("blur", () => button.classList.remove("pressing"));
      button.addEventListener("click", () => {
        const target = button.dataset.mapGo;
        button.classList.add("pressing");
        playSfx("move", 0.82);
        closeGlobalPanel();
        go(target, "마을 지도에서 이동 중...");
      });
    });

    document.querySelectorAll(".evidence").forEach((button) => {
      button.addEventListener("click", () => selectEvidence(button));
    });

    document.querySelectorAll(".prompt-line").forEach((button) => {
      button.addEventListener("click", () => {
        playSfx("buttonAlt", 0.6);
        document.querySelector("#questionInput").value = button.textContent;
        document.querySelector("#questionInput").focus();
      });
    });

    document.querySelector("#interrogationHint").addEventListener("click", () => {
      showToast("용의자들의 소매 밑에 뭐가 있는 것 같은데..? 소매를 걷어 보라고 해볼까?");
      addObservationToNote("심문 힌트", "용의자의 소매 아래를 확인하면 숨겨진 상처나 흔적을 찾을 수 있을지도 모른다.");
    });

    function addInterrogationSummary(question) {
      const list = document.querySelector("#interrogationSummary");
      document.querySelector("#emptyInterrogationSummary")?.remove();
      const item = document.createElement("li");
      const suspect = suspects[suspectIndex].name;
      const evidence = selectedEvidence || "증거 제시 없음";
      item.textContent = `${suspect} 심문 질문: "${question}" / 제시 증거: ${evidence}`;
      list.appendChild(item);
    }

    function getCollectedEvidenceNames() {
      const names = new Set();
      document.querySelectorAll("#evidenceList .evidence[data-evidence]").forEach((item) => {
        if (item.dataset.evidence) names.add(item.dataset.evidence);
      });
      if (selectedEvidence) names.add(selectedEvidence);
      return [...names];
    }

    function setAiMode(text) {
      const badge = document.querySelector("#aiModeBadge");
      if (badge) badge.textContent = text;
    }

    function showSuspectReply(text, mode = "답변") {
      const reply = document.querySelector("#suspectReply");
      const replyText = document.querySelector("#suspectReplyText");
      if (!reply || !replyText) return;
      reply.hidden = false;
      replyText.textContent = text;
      setAiMode(mode);
    }

    function addInterrogationAnswer(answer, source, warning) {
      const list = document.querySelector("#interrogationSummary");
      document.querySelector("#emptyInterrogationSummary")?.remove();
      const suspect = suspects[suspectIndex].name;
      const item = document.createElement("li");
      item.textContent = `${suspect} 심문 답변: "${answer}"`;
      list.appendChild(item);
      showSuspectReply(answer, suspect);
      if (source === "fallback" && warning) {
        showToast(warning);
      }
    }

    async function requestAiAnswer(question) {
      if (isAskingAi) return;
      const askButton = document.querySelector("#askButton");
      const suspect = suspects[suspectIndex];
      const history = getInterrogationHistory(suspect.id);
      isAskingAi = true;
      askButton.disabled = true;
      askButton.textContent = "답변 중";
      showSuspectReply("...", "답변 중");

      try {
        const response = await fetch("/api/interrogate/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            suspectId: suspect.id,
            userMessage: question,
            presentedEvidenceNames: selectedEvidence ? [selectedEvidence] : [],
            collectedEvidenceNames: getCollectedEvidenceNames(),
            conversationHistory: history.slice(-8)
          })
        });

        const data = await response.json();
        if (!response.ok || data.error) {
          throw new Error(data.error || "AI 답변을 받지 못했습니다.");
        }

        const answer = data.answer || "지금은 답하기 어렵습니다.";
        addInterrogationAnswer(answer, data.source, data.warning);
        history.push({ role: "user", content: question }, { role: "assistant", content: answer });
        while (history.length > 8) history.shift();
        setAiMode(suspect.name);
        showToast(data.source === "openai" ? "용의자가 답했습니다." : "임시 답변을 표시했습니다.");
      } catch (error) {
        const message = error instanceof Error ? error.message : "알 수 없는 오류";
        showSuspectReply("지금은 답하기 어려워 보입니다.", "오류");
        showToast("AI 답변을 받지 못했습니다.");
      } finally {
        isAskingAi = false;
        askButton.disabled = false;
        askButton.textContent = "질문";
      }
    }

    document.querySelector("#askButton").addEventListener("click", async () => {
      const question = document.querySelector("#questionInput").value.trim();
      if (!question) {
        showToast("질문을 입력하거나 위의 문장을 눌러줘");
        return;
      }
      playSfx("ask", 0.82);
      addInterrogationSummary(question);
      if (/소매/.test(question) && /(걷|올리|보|확인|드러|살펴)/.test(question)) {
        const suspect = suspects[suspectIndex];
        sleeveCheckedSuspects.add(suspect.id);
        document.querySelector("#interrogationPlate").src = suspect.sleeveScene;
        if (suspect.id === "chunwol") {
          addEvidenceToBag("긁힌 팔 흔적");
          addEvidenceToNote("긁힌 팔 흔적");
          addObservationToNote("소매 확인", `${suspect.name}의 소매 아래에서 긁힌 듯한 흔적을 확인했다.`);
          setAnalysisTarget("긁힌 팔 흔적");
          showToast("소매 밑에서 긁힌 팔 흔적을 발견했습니다.");
        } else {
          addObservationToNote("소매 확인", `${suspect.name}의 소매 아래를 확인했지만 뚜렷한 상처는 보이지 않았다.`);
          showToast(`${suspect.name}의 소매 아래를 확인했습니다.`);
        }
      } else {
        showToast(`${suspects[suspectIndex].name}에게 질문을 던졌습니다.`);
      }
      document.querySelector("#questionInput").value = "";
      await requestAiAnswer(question);
    });

    document.querySelector("#questionInput").addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        document.querySelector("#askButton").click();
      }
    });

    function applyContentImages() {
      const screenImages = window.SAMUNMONG_CONTENT?.screenImages || {};
      Object.entries(screenImages).forEach(([screenId, imageSrc]) => {
        document.querySelector(`#${screenId} .plate`)?.setAttribute("src", imageSrc);
      });
    }

    applyContentImages();
    renderTools();
    setupButtonGuides();
    showInitialScreenFromSetup();
  

})();
