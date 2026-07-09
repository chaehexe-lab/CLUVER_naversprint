(() => {

    const screens = [...document.querySelectorAll(".screen")];
    const fade = document.querySelector("#fade");
    const toast = document.querySelector("#toast");
    const briefingCopy = document.querySelector("#briefingCopy");
    const startCaseButton = document.querySelector("#startCase");
    const briefingCard = document.querySelector(".briefing-card");
    const briefingPrevButton = document.querySelector("#briefingPrev");
    const briefingNextButton = document.querySelector("#briefingNext");
    const briefingPanels = [...document.querySelectorAll("[data-briefing-panel]")];
    const fieldGuide = document.querySelector("#fieldOnboarding");
    const fieldGuidePanels = [...document.querySelectorAll("[data-field-guide-panel]")];
    const fieldGuideNextButton = document.querySelector("#nextFieldGuide");
    const fieldGuideSkipButton = document.querySelector("#skipFieldGuide");
    let selectedEvidence = "";
    let isAskingAi = false;
    const interrogationHistories = new Map();
    const entryParams = new URLSearchParams(window.location.search);
    const briefingText = sentenceBreakText("“사또님, 관아 근처에서 사람이 쓰러진 채 발견되었습니다.”\n\n당신은 이 꿈에서 고을의 사또입니다. 현장을 조사하고, 증거를 모아 용의자를 심문해야 합니다.");
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

    function getLastSuspectAnswer(suspectId) {
      return [...getInterrogationHistory(suspectId)]
        .reverse()
        .find((message) => message.role === "assistant")?.content || "";
    }

    function syncVisibleSuspectReply() {
      const suspect = suspects[suspectIndex];
      const reply = document.querySelector("#suspectReply");
      const replyText = document.querySelector("#suspectReplyText");
      if (!suspect || !reply || !replyText) return;

      const lastAnswer = getLastSuspectAnswer(suspect.id);
      if (!lastAnswer) {
        reply.hidden = true;
        replyText.textContent = "질문을 보내면 용의자가 답합니다.";
        setAiMode(suspect.name);
        return;
      }

      showSuspectReply(lastAnswer, suspect.name);
    }

    let suspectIndex = 0;
    let activeNoteSuspectId = suspects[0]?.id || "dolsoe";
    let briefingStepIndex = 0;
    let isBriefingTyped = false;
    const conversationNotes = new Map();
    const sleeveCheckedSuspects = new Set();
    const saveKey = "samunmong-demo-state";
    const collectedEvidenceKey = "samunmong-collected-evidence";
    const analyzedEvidenceKey = "samunmong-analyzed-evidence";
    const conversationNotesKey = "samunmong-conversation-notes";
    const interrogationQuestionCountKey = "samunmong-interrogation-question-count";
    const fieldGuidePendingKey = "samunmong-field-guide-pending";
    const fieldGuideSeenKey = "samunmong-field-guide-seen";
    const settingsKey = "samunmong-demo-settings";
    const bgmStateKey = "samunmong-bgm-state";
    const interrogationQuestionLimit = 50;
    let fieldGuideStep = "";
    let fieldGuideMapTimer = 0;
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
      const collected = new Set(readStoredNames(collectedEvidenceKey));
      collected.add(name);
      localStorage.setItem(collectedEvidenceKey, JSON.stringify([...collected]));
    }

    function hasSeenFieldGuide() {
      return localStorage.getItem(fieldGuideSeenKey) === "1";
    }

    function markFieldGuideSeen() {
      localStorage.setItem(fieldGuideSeenKey, "1");
      sessionStorage.removeItem(fieldGuidePendingKey);
    }

    function readConversationNotes() {
      const stored = readStored(conversationNotesKey, {});
      if (!stored || typeof stored !== "object" || Array.isArray(stored)) return {};
      return stored;
    }

    function saveConversationNotes() {
      const entries = {};
      conversationNotes.forEach((messages, suspectId) => {
        entries[suspectId] = messages
          .filter((message) => message && typeof message.text === "string")
          .map((message) => ({
            sender: message.sender === "player" ? "player" : "suspect",
            text: message.text,
            meta: typeof message.meta === "string" ? message.meta : ""
          }));
      });
      localStorage.setItem(conversationNotesKey, JSON.stringify(entries));
    }

    function restoreConversationNotes() {
      const stored = readConversationNotes();
      Object.entries(stored).forEach(([suspectId, messages]) => {
        if (!Array.isArray(messages)) return;
        conversationNotes.set(
          suspectId,
          messages
            .filter((message) => message && typeof message.text === "string")
            .map((message) => ({
              sender: message.sender === "player" ? "player" : "suspect",
              text: message.text,
              meta: typeof message.meta === "string" ? message.meta : ""
            }))
        );
      });
    }

    function saveAnalyzedEvidence(name) {
      const analyzed = new Set(readStoredNames(analyzedEvidenceKey));
      analyzed.add(name);
      localStorage.setItem(analyzedEvidenceKey, JSON.stringify([...analyzed]));
    }

    function hasAnalyzedEvidence(name) {
      return readStoredNames(analyzedEvidenceKey).includes(name);
    }

    function readStoredNames(key) {
      const stored = readStored(key, []);
      return Array.isArray(stored)
        ? stored.filter((name) => typeof name === "string" && name.trim())
        : [];
    }

    function readInterrogationQuestionCount() {
      const count = Number(localStorage.getItem(interrogationQuestionCountKey) || 0);
      return Number.isFinite(count) ? Math.max(0, count) : 0;
    }

    function getRemainingInterrogationQuestions() {
      return Math.max(0, interrogationQuestionLimit - readInterrogationQuestionCount());
    }

    function updateInterrogationQuestionLimitUI() {
      const remaining = getRemainingInterrogationQuestions();
      const status = document.querySelector("#questionLimitStatus");
      const input = document.querySelector("#questionInput");
      const askButton = document.querySelector("#askButton");
      const exhausted = remaining <= 0;

      if (status) {
        status.textContent = `남은 질문: ${remaining}회`;
      }
      if (input) {
        input.disabled = exhausted;
        input.placeholder = exhausted ? "취조 가능한 질문 횟수를 모두 사용했습니다." : "용의자에게 질문을 입력하세요. 필요하면 증거를 함께 제시할 수 있습니다.";
      }
      if (askButton && !isAskingAi) {
        askButton.disabled = exhausted;
        askButton.textContent = exhausted ? "종료" : "질문";
      }
    }

    function recordInterrogationQuestion() {
      const nextCount = Math.min(interrogationQuestionLimit, readInterrogationQuestionCount() + 1);
      localStorage.setItem(interrogationQuestionCountKey, String(nextCount));
      updateInterrogationQuestionLimitUI();
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

    function updateBriefingStep() {
      const lastIndex = Math.max(0, briefingPanels.length - 1);
      briefingStepIndex = Math.max(0, Math.min(lastIndex, briefingStepIndex));
      briefingCard?.setAttribute("data-briefing-step", String(briefingStepIndex));

      briefingPanels.forEach((panel) => {
        const isActive = Number(panel.dataset.briefingPanel) === briefingStepIndex;
        panel.classList.toggle("active", isActive);
        panel.setAttribute("aria-hidden", String(!isActive));
      });

      if (briefingPrevButton) {
        briefingPrevButton.disabled = briefingStepIndex === 0;
      }
      if (briefingNextButton) {
        briefingNextButton.hidden = briefingStepIndex === lastIndex;
        briefingNextButton.disabled = briefingStepIndex === 0 && !isBriefingTyped;
      }
      if (startCaseButton) {
        startCaseButton.hidden = briefingStepIndex !== lastIndex;
        startCaseButton.classList.toggle("ready", briefingStepIndex === lastIndex);
      }
    }

    function startBriefingSequence() {
      briefingStepIndex = 0;
      isBriefingTyped = false;
      updateBriefingStep();
      typeBriefing();
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
      toast.textContent = sentenceBreakText(message);
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
      if (copyEl) copyEl.textContent = sentenceBreakText(copy);
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
      openNoteProp: "등장인물과 나눈 대화를 기록합니다.",
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
      if (target.matches(".note-chip")) return "등장인물과 나눈 대화를 기록합니다.";
      if (target.matches(".journal-chip")) return "처음 사건 일지를 다시 봅니다.";
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

    const fieldGuideTargets = {
      "map-click": ["#openMapFromField"],
      "map-open": ["#mapPanel .map-pin-button.current", "#mapPanel .map-label.current"],
      tools: ["#openBagFromField", "#fieldOne .open-tool-panel", "#openNoteFromField", "#fieldOne .room-chip"]
    };

    function clearFieldGuideHighlights() {
      document.querySelectorAll(".field-guide-highlight").forEach((item) => item.classList.remove("field-guide-highlight"));
      document.querySelector("#mapPanel")?.classList.remove("field-guide-map-focus");
    }

    function setFieldGuideStep(step) {
      fieldGuideStep = step;
      clearFieldGuideHighlights();

      if (!fieldGuide || !step) {
        if (fieldGuide) fieldGuide.hidden = true;
        return;
      }

      fieldGuide.hidden = false;
      fieldGuide.dataset.guideStep = step;
      fieldGuidePanels.forEach((panel) => {
        const isActive = panel.dataset.fieldGuidePanel === step;
        panel.classList.toggle("active", isActive);
        panel.setAttribute("aria-hidden", String(!isActive));
      });

      (fieldGuideTargets[step] || []).forEach((selector) => {
        document.querySelectorAll(selector).forEach((item) => item.classList.add("field-guide-highlight"));
      });

      if (step === "map-open") {
        document.querySelector("#mapPanel")?.classList.add("field-guide-map-focus");
      }

      if (fieldGuideNextButton) {
        fieldGuideNextButton.hidden = false;
        fieldGuideNextButton.textContent = step === "tools" ? "알겠습니다" : "다음";
      }
    }

    function advanceFieldGuideAfterMap() {
      if (fieldGuideStep !== "map-open") return;
      setFieldGuideStep("tools");
    }

    function isFieldGuideBlockingControls() {
      return Boolean(fieldGuide && !fieldGuide.hidden && fieldGuideStep === "tools");
    }

    function startFieldGuide() {
      if (getActiveScreenId() !== "fieldOne") return;
      sessionStorage.removeItem(fieldGuidePendingKey);
      localStorage.setItem(fieldGuideSeenKey, "1");
      setFieldGuideStep("map-click");
    }

    function closeFieldGuide() {
      markFieldGuideSeen();
      setFieldGuideStep("");
      clearFieldGuideHighlights();
    }

    function maybeStartFieldGuide() {
      if (hasSeenFieldGuide()) {
        sessionStorage.removeItem(fieldGuidePendingKey);
        return;
      }
      if (sessionStorage.getItem(fieldGuidePendingKey) !== "1") return;
      setTimeout(startFieldGuide, 640);
    }

    const loadingDuration = 2600;
    const themeStartLoadingDuration = 4200;
    const themeStartMaxWait = 9000;
    const themeStartAssets = [
      "/samunmong/assets/mudeok-interaction/evidence-jeomsun-neck-exam-paper.png",
      "/samunmong/assets/mudeok-interaction/evidence-jeomsun-hand-exam-paper.png",
      "/samunmong/assets/suspects/dolsoe-seated.png",
      "/samunmong/assets/suspects/chunwol-seated.png",
      "/samunmong/assets/suspects/yoomunseok-seated.png",
      "/samunmong/assets/suspects/mudeok-seated.png"
    ];

    function showLoading(message = "이동 중...") {
      fade?.classList.add("show");
      if (fade) fade.textContent = message;
    }

    function hideLoading() {
      fade?.classList.remove("show");
    }

    function preloadImage(src) {
      return new Promise((resolve) => {
        if (!src) {
          resolve(src);
          return;
        }

        const image = new Image();
        image.onload = () => resolve(src);
        image.onerror = () => resolve(src);
        image.src = src;

        if (image.complete) {
          resolve(src);
        }
      });
    }

    function preloadImages(sources) {
      const uniqueSources = [...new Set(sources.filter(Boolean))];
      if (!uniqueSources.length) return Promise.resolve();
      return Promise.all(uniqueSources.map((src) => preloadImage(src)));
    }

    function goAfterPreload(id, assets, options = {}) {
      stopBriefingTyping();
      document.querySelector(".game-shell")?.removeAttribute("data-start-screen");
      playSfx(options.sfx || "move", options.volume ?? 0.82);
      showLoading(options.message || "이동 중...");

      const startedAt = Date.now();
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        const elapsed = Date.now() - startedAt;
        const delay = Math.max(0, (options.minDuration || 0) - elapsed);
        setTimeout(() => {
          screens.forEach((screen) => screen.classList.toggle("active", screen.id === id));
          updateCurrentLocation(id);
          saveProgress(id);
          hideLoading();
          updateBgmForScreen(id);
          options.after?.();
        }, delay + 180);
      };

      preloadImages(assets).then(finish);
      setTimeout(finish, options.maxWait || themeStartMaxWait);
    }

    function go(id, message = "이동 중...", options = {}) {
      stopBriefingTyping();
      document.querySelector(".game-shell")?.removeAttribute("data-start-screen");
      playSfx("move", 0.82);
      const duration = options.loading ? options.duration || loadingDuration : 260;
      showLoading(message);
      setTimeout(() => {
        screens.forEach((screen) => screen.classList.toggle("active", screen.id === id));
        updateCurrentLocation(id);
        saveProgress(id);
        hideLoading();
        updateBgmForScreen(id);
        if (id === "fieldOne") maybeStartFieldGuide();
      }, duration);
    }

    function goRush(id, message = "현장으로 이동 중...") {
      stopBriefingTyping();
      document.querySelector(".game-shell")?.removeAttribute("data-start-screen");
      playSfx("briefingNext", 0.9);
      fade?.classList.add("show");
      if (fade) fade.textContent = message;
      fade?.classList.add("long");
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
        if (id === "fieldOne") maybeStartFieldGuide();
      }, 520);
      setTimeout(() => fade?.classList.remove("long"), 980);
    }

    function typeBriefing() {
      if (!briefingCopy) return;
      briefingCopy.textContent = "";
      briefingCopy.classList.remove("done");
      isBriefingTyped = false;
      updateBriefingStep();
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
          isBriefingTyped = true;
          updateBriefingStep();
        }
      }, speed || 1);
    }

    function showInitialScreenFromSetup() {
      const startScreen = entryParams.get("start") || document.querySelector(".game-shell")?.dataset.startScreen;
      const allowedScreens = new Set(["tutorialScreen", "dreamScreen", "briefingScreen", "fieldOne", "chunwolRoom", "mudeokServantRoom", "yoomunseokSarangbang", "dolsoeQuarters", "backGateCourtyard", "interrogationScreen"]);

      if (!allowedScreens.has(startScreen)) {
        return;
      }

      screens.forEach((screen) => screen.classList.toggle("active", screen.id === startScreen));

      if (startScreen === "briefingScreen") {
        startBriefingSequence();
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
      showLoading("이동 중...");
      setTimeout(() => {
        window.location.href = `/result?${params.toString()}`;
      }, loadingDuration);
    }

    const settingsDialog = document.querySelector("#settingsDialog");
    const exitDialog = document.querySelector("#exitDialog");
    const defaultSettings = { volume: 70, reduceMotion: false, highContrast: false };
    applySettings({ ...defaultSettings, ...readStored(settingsKey, {}) });
    updateContinueButtonState();
    updateInterrogationQuestionLimitUI();
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
      localStorage.removeItem(conversationNotesKey);
      localStorage.removeItem(interrogationQuestionCountKey);
      localStorage.removeItem(fieldGuideSeenKey);
      sessionStorage.removeItem(fieldGuidePendingKey);
      conversationNotes.clear();
      updateContinueButtonState();
      updateInterrogationQuestionLimitUI();
      go("tutorialScreen");
    });
    on("#continueDream", "click", () => {
      const saved = readStored(saveKey, null);
      const valid = isValidSavedProgress(saved);
      if (!valid) return;

      markFieldGuideSeen();
      go(saved.screenId, "지난 꿈으로 돌아가는 중...");
      if (saved?.screenId === "briefingScreen") setTimeout(startBriefingSequence, 300);
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
    on("#skipTutorial", "click", () => go("dreamScreen", "이동 중...", { loading: true }));
    on("#nextTutorial", "click", () => go("dreamScreen", "이동 중...", { loading: true }));
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
      goAfterPreload("briefingScreen", themeStartAssets, {
        sfx: "dream",
        volume: 0.9,
        minDuration: themeStartLoadingDuration,
        maxWait: themeStartMaxWait,
        after: startBriefingSequence
      });
    });
    on("#briefingPrev", "click", () => {
      briefingStepIndex -= 1;
      updateBriefingStep();
    });
    on("#briefingNext", "click", () => {
      if (briefingStepIndex === 0 && !isBriefingTyped) return;
      briefingStepIndex += 1;
      updateBriefingStep();
    });
    on("#startCase", "click", () => {
      if (hasSeenFieldGuide()) {
        sessionStorage.removeItem(fieldGuidePendingKey);
      } else {
        sessionStorage.setItem(fieldGuidePendingKey, "1");
      }
      goRush("fieldOne", "현장으로 이동 중...");
    });
    on("#nextFieldGuide", "click", () => {
      if (fieldGuideStep === "map-click") {
        openGlobalPanel("mapPanel");
        return;
      }
      if (fieldGuideStep === "map-open") {
        closeGlobalPanel();
        return;
      }
      closeFieldGuide();
    });
    document.querySelectorAll("[data-go]").forEach((button) => {
      button.addEventListener("click", () => {
        if (isFieldGuideBlockingControls()) return;
        const target = button.dataset.go;
        go(target, target === "briefingScreen" ? "사건 일지를 펼치는 중..." : "이동 중...");
        if (target === "briefingScreen") {
          setTimeout(startBriefingSequence, 340);
        }
      });
    });
    on("#accuseButton", "click", openResultPage);

    let hopaeCollected = false;
    let portraitCollected = false;
    let pendingEvidenceName = "";
    let pendingEvidenceHotspot = null;
    let currentEvidenceForTool = "";
    let selectedToolForAnalysis = "";
    let swipeStartPoint = null;
    const TOOL_NEEDED_HINT = "특정 도구를 이용해 자세히 알아봐야 할 것 같다.";

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
        note: "점순 옆에서 발견된 신분 단서. 유문석의 물건처럼 보이지만 일부 글자가 긁혀 있다.",
        img: "/samunmong/assets/evidence-wooden-tag.png",
        tool: "먼지털이 붓",
        toolResult: "먼지털이 붓으로 털자 긁힌 글자 홈 사이에 고운 분가루가 남아 있다.\n거칠게 굴러다닌 물건이라기보다, 누군가 손에 쥐고 옮긴 뒤 일부러 현장에 둔 듯하다."
      },
      "돌쇠의 그림": {
        note: "최춘월의 방에서 발견된 숨겨둔 초상. 춘월이 돌쇠에게 마음을 두었는지 추적할 단서다.",
        img: "/samunmong/assets/evidence-portrait-v2.png",
        tool: "돋보기",
        toolResult: "돋보기로 보니 선이 섬세하고 여러 번 고쳐 그린 흔적이 있다.\n우연히 본 얼굴이라기엔 지나치게 정성스럽다. 춘월은 왜 이 그림을 숨겨 두었을까?"
      },
      "헐거워진 노리개": {
        note: "끊어진 장식과 급히 잡아챈 듯한 흔적이 남은 노리개. 누가 지녔는지 확인해야 한다.",
        img: "/samunmong/assets/evidence-transparent/evidence-norigae-transparent.png"
      },
      "무덕의 번진 일기": {
        note: "먹이 번져 읽기 어려운 일기. 점순과 돌쇠의 도망 계획이 주변에 새어 나갔는지 추적할 수 있다.",
        img: "/samunmong/assets/mudeok-interaction/evidence-mudeok-smeared-diary.png",
        tool: "촛불 비추기",
        toolResult: "촛불을 비추자 번진 먹 아래 기록이 또렷해진다."
      },
      "진흙 묻은 짚신": {
        note: "문밖 젖은 길과 닮은 진흙이 묻은 짚신. 이동 경로를 비교할 단서다.",
        img: "/samunmong/assets/mudeok-interaction/evidence-mudeok-muddy-straw-shoes.png"
      },
      "찢어진 옷고름": {
        note: "무덕의 방에서 발견된 찢어진 옷고름. 하인 옷감보다 고급스럽고, 목을 조를 때 쓰였을 가능성이 있다.",
        img: "/samunmong/assets/mudeok-interaction/evidence-torn-collar-tie.png"
      },
      "빈 호패 주머니": {
        note: "호패가 빠진 듯한 빈 주머니. 주인과 호패 조각의 관계를 확인할 수 있다.",
        img: "/samunmong/assets/evidence-transparent/evidence-empty-hopae-holder.png"
      },
      "하인 장부": {
        note: "하인들의 출입과 심부름 기록이 적힌 장부. 장소 이동을 대조할 수 있다.",
        img: "/samunmong/assets/evidence-transparent/evidence-servant-ledger.png"
      },
      "혼서 조각": {
        note: "혼례와 관련 있어 보이는 문서 조각. 인물 관계를 다시 보게 만드는 단서다.",
        img: "/samunmong/assets/evidence-transparent/evidence-marriage-letter.png"
      },
      "피 묻은 붕대": {
        note: "피처럼 보이는 얼룩이 남은 붕대. 상처나 몸싸움 흔적과 연결될 수 있다.",
        img: "/samunmong/assets/evidence-transparent/evidence-bloodied-bandage.png"
      },
      "돌쇠의 팔 상처": {
        note: "심문 중 돌쇠의 소매 아래에서 확인한 상처. 붕대를 감았던 흔적과 함께 봐야 한다.",
        img: "/samunmong/assets/evidence-transparent/evidence-scratched-arm.png"
      },
      "도망 보따리": {
        note: "급히 싼 듯한 보따리. 누군가 떠날 준비를 했는지 확인해야 한다.",
        img: "/samunmong/assets/evidence-transparent/evidence-escape-bundle.png"
      },
      "긁힌 팔 흔적": {
        note: "심문 중 소매 아래에서 확인한 긁힌 흔적. 점순이 마지막 순간 저항하며 남긴 상처일 수 있다.",
        img: "/samunmong/assets/evidence-transparent/evidence-scratched-arm.png"
      },
      "작은 발자국": {
        note: "뒷문 마당에 남은 작은 발자국. 젖은 돌길의 이동 경로와 맞춰볼 수 있다.",
        img: "/samunmong/assets/evidence-transparent/evidence-small-footprints.png"
      },
      "끊어진 호패끈": {
        note: "호패와 연결되었을 법한 끊어진 끈. 호패 조각과 함께 봐야 한다.",
        img: "/samunmong/assets/evidence-transparent/evidence-cut-hopae-cord.png"
      },
      "찢어진 약속 편지": {
        note: "점순의 손에서 발견된 찢어진 약속 편지. 정중한 말투가 돌쇠의 평소 말투와 맞지 않는다.",
        img: "/samunmong/assets/evidence-transparent/evidence-torn-letter-transparent.png"
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

    function sentenceBreakText(value) {
      return String(value ?? "")
        .replace(/\r\n/g, "\n")
        .replace(/([.!?])\s+(?=[“"'‘’]?[\p{Script=Hangul}0-9])/gu, "$1\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
    }

    function sentenceBreakHtml(value) {
      return escapeHtml(sentenceBreakText(value));
    }

    function getEvidenceLocation(name) {
      return evidenceData[name]?.location || "획득 장소 미상";
    }

    function formatEvidenceEntries(name) {
      const entries = evidenceData[name]?.entries;
      if (!Array.isArray(entries) || !entries.length) return "";

      return entries
        .map((entry) => {
          const lines = String(entry.text || "")
            .split(". ")
            .map((part, index, list) => {
              const sentence = index < list.length - 1 && !part.endsWith(".") ? `${part}.` : part;
              return `  ${sentence.trim()}`;
            })
            .filter((line) => line.trim());

          return `${entry.date}\n${lines.join("\n")}`;
        })
        .join("\n\n");
    }

    function getEvidenceAnalysisText(name) {
      const data = evidenceData[name] || {};
      const lines = [sentenceBreakText(data.toolResult || "추가 분석 결과가 없습니다.")];
      const entries = formatEvidenceEntries(name);
      if (entries) {
        lines.push(entries);
      }
      return lines.filter(Boolean).join("\n\n");
    }

    function getEvidenceDetailText(name, analyzed = false) {
      const data = evidenceData[name] || {};
      const lines = [
        sentenceBreakText(data.note || "현장에서 발견한 단서입니다."),
        `획득 장소: ${getEvidenceLocation(name)}`
      ];

      if (data.logic) lines.push(sentenceBreakText(data.logic));
      if (analyzed && formatEvidenceEntries(name)) lines.push(`확인된 내용:\n${formatEvidenceEntries(name)}`);

      return lines.filter(Boolean).join("\n");
    }

    function evidenceCardHtml(name) {
      const data = evidenceData[name] || {};
      return `
        <img class="evidence-thumb" src="${escapeHtml(data.img || "/samunmong/assets/evidence-wooden-tag.png")}" alt="">
        <span class="evidence-card-copy">
          <strong>${escapeHtml(name)}</strong>
          ${data.tool ? `<span class="evidence-tool-cue">${escapeHtml(TOOL_NEEDED_HINT)}</span>` : ""}
          <span class="evidence-location">획득: ${escapeHtml(getEvidenceLocation(name))}</span>
          <span>${sentenceBreakHtml(data.note || "현장에서 발견된 단서")}</span>
          ${data.logic ? `<span class="evidence-logic">${sentenceBreakHtml(data.logic)}</span>` : ""}
        </span>`;
    }

    function getEvidenceLocationSection(list, location) {
      const sectionId = `bag-section-${location.replace(/\s+/g, "-")}`;
      let section = list.querySelector(`[data-evidence-location-section="${location}"]`);
      if (section) return section.querySelector(".evidence-location-grid");

      section = document.createElement("section");
      section.className = "evidence-location-section";
      section.dataset.evidenceLocationSection = location;
      section.id = sectionId;
      section.innerHTML = `
        <div class="evidence-location-head">
          <strong>${escapeHtml(location)}</strong>
          <span>0</span>
        </div>
        <div class="evidence-location-grid"></div>
      `;
      list.appendChild(section);
      addEvidenceLocationTab(location);
      setActiveEvidenceLocation(getActiveEvidenceLocation() || location);
      return section.querySelector(".evidence-location-grid");
    }

    function getActiveEvidenceLocation() {
      return document.querySelector("#evidenceLocationTabs .active")?.dataset.evidenceLocation || "";
    }

    function addEvidenceLocationTab(location) {
      const tabs = document.querySelector("#evidenceLocationTabs");
      if (!tabs || tabs.querySelector(`[data-evidence-location="${location}"]`)) return;

      const button = document.createElement("button");
      button.className = "evidence-location-tab";
      button.type = "button";
      button.dataset.evidenceLocation = location;
      button.textContent = location;
      button.addEventListener("click", () => {
        playSfx("buttonAlt", 0.48);
        setActiveEvidenceLocation(location);
      });
      tabs.appendChild(button);
    }

    function setActiveEvidenceLocation(location) {
      const tabs = document.querySelector("#evidenceLocationTabs");
      if (!tabs || !location) return;

      tabs.querySelectorAll(".evidence-location-tab").forEach((button) => {
        const isActive = button.dataset.evidenceLocation === location;
        button.classList.toggle("active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
      });
      document.querySelectorAll("#evidenceList .evidence-location-section").forEach((section) => {
        section.classList.toggle("active", section.dataset.evidenceLocationSection === location);
      });
    }

    function updateEvidenceLocationCounts() {
      document.querySelectorAll("#evidenceList .evidence-location-section").forEach((section) => {
        const count = section.querySelectorAll(".evidence[data-evidence]").length;
        const location = section.dataset.evidenceLocationSection;
        section.querySelector(".evidence-location-head span").textContent = `${count}점`;
        const tab = document.querySelector(`#evidenceLocationTabs [data-evidence-location="${location}"]`);
        if (tab) tab.textContent = `${location} · ${count}점`;
      });
    }

    function addEvidenceToNote(name) {
      return;
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
      return;
    }

    function addEvidenceToBag(name) {
      saveCollectedEvidence(name);
      addEvidenceCardToInterrogation(name);
      addEvidenceToToolPanel(name);
      playSfx("bag", 0.7);
    }

    function restoreSavedInvestigation() {
      const collectedEvidence = readStoredNames(collectedEvidenceKey);
      const analyzedEvidence = new Set(readStoredNames(analyzedEvidenceKey));

      collectedEvidence.forEach((name) => {
        addEvidenceToNote(name);
        addEvidenceCardToInterrogation(name);
        addEvidenceToToolPanel(name);
        markEvidenceCollectedInScene(name);
      });

      analyzedEvidence.forEach((name) => {
        const data = evidenceData[name];
        if (!data) return;

        addObservationToNote(`${name} 추가 분석`, data.toolResult || "도구로 추가 분석을 마쳤다.");
        document.querySelectorAll(`[data-evidence-name="${name}"]`).forEach((item) => item.classList.add("analyzed"));
        document.querySelectorAll(`#toolEvidenceList [data-evidence="${name}"]`).forEach((item) => item.classList.add("analyzed"));
      });
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
      const data = evidenceData[name] || {};
      if (!data.tool) return;

      list.querySelector(".evidence-empty")?.remove();
      const exists = [...list.children].some((item) => item.dataset.evidence === name);
      if (exists) return;

      const button = document.createElement("button");
      button.className = `tool-evidence-option${hasAnalyzedEvidence(name) ? " analyzed" : ""}`;
      button.type = "button";
      button.dataset.evidence = name;
      button.innerHTML = `<img src="${escapeHtml(data.img || "/samunmong/assets/evidence-wooden-tag.png")}" alt=""><span><strong>${escapeHtml(name)}</strong>${sentenceBreakHtml(data.tool ? TOOL_NEEDED_HINT : "확인 완료")}</span>`;
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
          ? sentenceBreakText(`${getEvidenceDetailText(name)}${data.tool ? `\n${TOOL_NEEDED_HINT}` : ""}`)
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
        updateEvidenceLocationCounts();
        return;
      }

      const location = getEvidenceLocation(name);
      const sectionGrid = getEvidenceLocationSection(list, location);
      const button = document.createElement("button");
      button.className = "evidence evidence-card";
      button.type = "button";
      button.dataset.evidence = name;
      button.dataset.location = location;
      button.innerHTML = evidenceCardHtml(name);
      button.addEventListener("click", () => selectEvidence(button));
      sectionGrid.appendChild(button);
      updateEvidenceLocationCounts();
      setActiveEvidenceLocation(location);
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
        button.innerHTML = `<img src="${escapeHtml(tool.img)}" alt=""><span><strong>${escapeHtml(name)}</strong>${sentenceBreakHtml(tool.note)}</span>`;
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
      document.querySelector("#toolResultText").textContent = sentenceBreakText(resultText);
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
      if (previewNote) previewNote.textContent = sentenceBreakText(resultText);
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
      if (data.tool) setAnalysisTarget(name);

      document.querySelector("#genericEvidenceImage").src = data.img || "/samunmong/assets/evidence-wooden-tag.png";
      document.querySelector("#genericEvidenceTitle").textContent = name;
      document.querySelector("#genericEvidenceText").textContent = data.tool ? sentenceBreakText(TOOL_NEEDED_HINT) : "";
      document.querySelector("#genericEvidenceText").hidden = !data.tool;
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
      document.querySelector("#suspectStage").dataset.suspect = suspect.id;
      document.querySelector("#interrogationPlate").src = suspect.scene;
      activeNoteSuspectId = suspect.id;
      renderConversationNotes();
      syncVisibleSuspectReply();
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
    function getConversationNoteList(suspectId) {
      if (!conversationNotes.has(suspectId)) {
        conversationNotes.set(suspectId, []);
      }
      return conversationNotes.get(suspectId);
    }

    function getSuspectById(suspectId) {
      return suspects.find((item) => item.id === suspectId) || suspects[0];
    }

    function renderConversationNotes() {
      const activeSuspect = getSuspectById(activeNoteSuspectId);
      const messages = getConversationNoteList(activeSuspect.id);

      document.querySelectorAll(".note-current-suspect").forEach((item) => {
        item.textContent = activeSuspect.name;
      });

      document.querySelectorAll(".note-suspect-tab").forEach((button) => {
        const isActive = button.dataset.suspectId === activeSuspect.id;
        button.classList.toggle("active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
      });

      document.querySelectorAll("[data-note-log]").forEach((log) => {
        log.replaceChildren();

        if (!messages.length) {
          const empty = document.createElement("p");
          empty.className = "conversation-empty";
          empty.textContent = "아직 이 인물과 나눈 대화가 없습니다.";
          log.appendChild(empty);
          return;
        }

        messages.forEach((message) => {
          const bubble = document.createElement("article");
          bubble.className = `conversation-message ${message.sender}`;

          const name = document.createElement("strong");
          name.className = "conversation-speaker";
          name.textContent = message.sender === "player" ? "사또" : activeSuspect.name;

          const text = document.createElement("p");
          text.className = "conversation-text";
          text.textContent = sentenceBreakText(message.text);

          bubble.append(name, text);
          if (message.meta) {
            const meta = document.createElement("span");
            meta.className = "conversation-meta";
            meta.textContent = sentenceBreakText(message.meta);
            bubble.appendChild(meta);
          }
          log.appendChild(bubble);
        });

        log.scrollTop = log.scrollHeight;
      });
    }

    function addConversationMessage(suspectId, sender, text, meta = "", shouldFocus = true) {
      getConversationNoteList(suspectId).push({ sender, text, meta });
      if (shouldFocus) activeNoteSuspectId = suspectId;
      saveConversationNotes();
      renderConversationNotes();
    }

    function setNote(open) {
      if (open) {
        activeNoteSuspectId = suspects[suspectIndex].id;
        renderConversationNotes();
      }
      noteDrawer.classList.toggle("open", open);
      overlay.classList.toggle("show", open);
      noteDrawer.setAttribute("aria-hidden", String(!open));
    }
    document.querySelector("#openNoteProp").addEventListener("click", () => setNote(true));
    document.querySelector("#closeNote").addEventListener("click", () => setNote(false));
    overlay.addEventListener("click", () => setNote(false));
    document.querySelectorAll(".note-suspect-tab").forEach((button) => {
      button.addEventListener("click", () => {
        activeNoteSuspectId = button.dataset.suspectId || activeNoteSuspectId;
        playSfx("buttonAlt", 0.48);
        renderConversationNotes();
      });
    });

    const evidenceBagPop = document.querySelector("#evidenceBagPop");
    const toggleEvidenceBag = document.querySelector("#toggleEvidenceBag");
    function setEvidenceBag(open) {
      if (open && isFieldGuideBlockingControls()) return;
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
      if (id !== "mapPanel" && isFieldGuideBlockingControls()) return;
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
      if (id === "fieldNotePanel") {
        playSfx("buttonAlt", 0.62);
        renderConversationNotes();
      }
      if (id === "mapPanel" && (fieldGuideStep === "map-click" || fieldGuide?.dataset.guideStep === "map-click")) {
        clearTimeout(fieldGuideMapTimer);
        fieldGuideMapTimer = window.setTimeout(() => {
          const isMapStillOpen = document.querySelector("#mapPanel")?.classList.contains("show");
          if (isMapStillOpen && fieldGuideStep === "map-click") setFieldGuideStep("map-open");
        }, 120);
      }
      updateToolCursor();
    }

    function closeGlobalPanel() {
      const wasGuideMapOpen = ["map-click", "map-open"].includes(fieldGuideStep) && document.querySelector("#mapPanel")?.classList.contains("show");
      clearTimeout(fieldGuideMapTimer);
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
      if (wasGuideMapOpen) setFieldGuideStep("tools");
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
      if (isFieldGuideBlockingControls()) return;
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
        if (["map-click", "map-open"].includes(fieldGuideStep)) {
          closeGlobalPanel();
          return;
        }
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
      const suspect = suspects[suspectIndex];
      const evidence = selectedEvidence || "증거 제시 없음";
      addConversationMessage(suspect.id, "player", question, `제시 증거: ${evidence}`);
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
      replyText.textContent = sentenceBreakText(text);
      setAiMode(mode);
    }

    document.querySelector("#closeSuspectReply")?.addEventListener("click", () => {
      const reply = document.querySelector("#suspectReply");
      if (reply) reply.hidden = true;
      playSfx("buttonAlt", 0.42);
    });

    function addInterrogationAnswer(suspect, answer, source, warning) {
      const isCurrentSuspect = suspects[suspectIndex]?.id === suspect.id;
      addConversationMessage(suspect.id, "suspect", answer, "", isCurrentSuspect);
      if (suspects[suspectIndex]?.id === suspect.id) {
        showSuspectReply(answer, suspect.name);
      }
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
        history.push({ role: "user", content: question }, { role: "assistant", content: answer });
        while (history.length > 8) history.shift();
        addInterrogationAnswer(suspect, answer, data.source, data.warning);
        if (suspects[suspectIndex]?.id === suspect.id) {
          setAiMode(suspect.name);
        }
        showToast(data.source === "openai" ? "용의자가 답했습니다." : "임시 답변을 표시했습니다.");
      } catch (error) {
        if (suspects[suspectIndex]?.id === suspect.id) {
          showSuspectReply("지금은 답하기 어려워 보입니다.", "오류");
        }
        showToast("AI 답변을 받지 못했습니다.");
      } finally {
        isAskingAi = false;
        updateInterrogationQuestionLimitUI();
      }
    }

    document.querySelector("#askButton").addEventListener("click", async () => {
      const question = document.querySelector("#questionInput").value.trim();
      if (!question) {
        showToast("질문을 입력하거나 위의 문장을 눌러줘");
        return;
      }
      if (getRemainingInterrogationQuestions() <= 0) {
        showSuspectReply("더는 대답하지 않으려 한다.", "침묵");
        showToast("취조 가능한 질문 횟수를 모두 사용했습니다.");
        updateInterrogationQuestionLimitUI();
        return;
      }
      playSfx("ask", 0.82);
      recordInterrogationQuestion();
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
        } else if (suspect.id === "dolsoe") {
          addEvidenceToBag("돌쇠의 팔 상처");
          addEvidenceToNote("돌쇠의 팔 상처");
          addObservationToNote("소매 확인", `${suspect.name}의 소매 아래에서 붕대를 감았던 듯한 팔 상처를 확인했다.`);
          setAnalysisTarget("돌쇠의 팔 상처");
          showToast("돌쇠의 팔 상처를 증거로 기록했습니다.");
        } else {
          addObservationToNote("소매 확인", `${suspect.name}의 소매 아래를 확인했지만 뚜렷한 상처는 보이지 않았다.`);
          showToast(`${suspect.name}의 소매 아래를 확인했습니다.`);
        }
      } else {
        const suspect = suspects[suspectIndex];
        document.querySelector("#interrogationPlate").src = suspect.scene;
        showToast(`${suspect.name}에게 질문을 던졌습니다.`);
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
    restoreConversationNotes();
    restoreSavedInvestigation();
    renderConversationNotes();
    setupButtonGuides();
    showInitialScreenFromSetup();
  

})();
