(() => {
    if (window.__SAMUNMONG_PROTOTYPE_BOOTED__) return;
    window.__SAMUNMONG_PROTOTYPE_BOOTED__ = true;

    const knownScreenIds = new Set([
      "mainScreen", "tutorialScreen", "dreamScreen", "briefingScreen", "fieldOne",
      "chunwolRoom", "mudeokServantRoom", "yoomunseokSarangbang", "dolsoeQuarters",
      "backGateCourtyard", "magicAlchemyLab", "magicCleaningCloset", "magicLibrary",
      "magicRecordCrystalRoom", "magicDormHallway", "spaceAirlock", "spaceMedicalBay",
      "spaceOxygenGenerator", "spaceDataCore", "spaceScienceLab", "interrogationScreen"
    ]);
    const getScreens = () => [...document.querySelectorAll(".screen")];
    const fade = document.querySelector("#fade");
    const toast = document.querySelector("#toast");
    const briefingCopy = document.querySelector("#briefingCopy");
    const startCaseButton = document.querySelector("#startCase");
    const startCaseLabelNode = document.querySelector("[data-start-case-label]");
    const briefingCard = document.querySelector(".briefing-card");
    const briefingScreen = document.querySelector("#briefingScreen");
    const briefingTitle = document.querySelector("#briefingScreen .briefing-card h2");
    const memoryOrbTrigger = document.querySelector("#memoryOrbTrigger");
    const briefingPrevButton = document.querySelector("#briefingPrev");
    const briefingNextButton = document.querySelector("#briefingNext");
    const briefingJournalCloseButton = document.querySelector("#closeBriefingJournal");
    const magicRecordIntro = document.querySelector(".magic-record-intro");
    const magicRecordTabs = [...document.querySelectorAll("[data-record-card-tab]")];
    const magicStudentPages = [...document.querySelectorAll("[data-record-card]")];
    const magicStudentPrevButton = document.querySelector("[data-student-prev]");
    const magicStudentNextButton = document.querySelector("[data-student-next]");
    const magicStudentPageIndicator = document.querySelector("[data-student-page-indicator]");
    const memoryTraceSequence = document.querySelector(".memory-trace-sequence");
    const memoryDrawZone = document.querySelector("[data-memory-draw-zone]");
    const memoryDrawPath = document.querySelector("[data-memory-draw-path]");
    const memoryTraceEvidenceNodes = [...document.querySelectorAll("[data-memory-evidence]")];
    const memoryTraceInstruction = document.querySelector("[data-memory-trace-instruction]");
    const memoryTraceCopy = document.querySelector("[data-memory-trace-copy]");
    const memoryTraceContinue = document.querySelector("[data-memory-trace-continue]");
    let startCaseLabel = startCaseButton?.textContent?.trim() || "수사 시작";
    let magicStudentPageIndex = 0;
    let memoryTraceComplete = false;
    let memoryTraceTypingTimer = 0;
    let memoryTracePoints = [];
    const briefingPanels = [...document.querySelectorAll("[data-briefing-panel]")];
    let fieldGuide = document.querySelector("#fieldOnboarding");
    let fieldGuidePanels = [...document.querySelectorAll("[data-field-guide-panel]")];
    let fieldGuideNextButton = document.querySelector("#nextFieldGuide");
    let fieldGuideSkipButton = document.querySelector("#skipFieldGuide");
    let selectedEvidence = "";
    const defaultInterrogationPrompts = [
      "이 증거를 본 적 있나?",
      "사건 직전 어디에 있었지?",
      "이 물건이 왜 여기 있지?",
      "숨긴 말이 더 있나?"
    ];
    let currentToolResultEvidence = "";
    let isAskingAi = false;
    const interrogationHistories = new Map();

    function setStartCaseLabel(label) {
      if (!startCaseButton) return;
      startCaseButton.setAttribute("aria-label", label);
      if (startCaseLabelNode) {
        startCaseLabelNode.textContent = label;
      } else {
        startCaseButton.textContent = label;
      }
    }
    const entryParams = new URLSearchParams(window.location.search);
    const navigateWithinApp = (href) => {
      if (typeof window.samunmongNavigate === "function") {
        window.samunmongNavigate(href);
        return;
      }
      window.location.href = href;
    };
    const themeKey = "samunmong-current-theme";
    const requestedTheme = entryParams.get("theme");
    const requestedStart = entryParams.get("start") || "";
    const isMagicStart = requestedStart.startsWith("magic") || window.location.pathname.startsWith("/magic-");
    const isSpaceStart = requestedStart.startsWith("space") || window.location.pathname.startsWith("/space-");
    const hasExplicitTheme = requestedTheme === "magicSchool" || requestedTheme === "spaceStation" || requestedTheme === "joseon";
    if (requestedTheme === "magicSchool" || requestedTheme === "spaceStation" || requestedTheme === "joseon") {
      localStorage.setItem(themeKey, requestedTheme);
    } else if (isMagicStart) {
      localStorage.setItem(themeKey, "magicSchool");
    } else if (isSpaceStart) {
      localStorage.setItem(themeKey, "spaceStation");
    } else if (!requestedStart && window.location.pathname === "/") {
      localStorage.setItem(themeKey, "joseon");
    }
    const storedTheme = localStorage.getItem(themeKey);
    const activeTheme = hasExplicitTheme
      ? requestedTheme
      : isMagicStart
        ? "magicSchool"
        : isSpaceStart
          ? "spaceStation"
          : "joseon";
    const isMagicTheme = activeTheme === "magicSchool";
    const isSpaceTheme = activeTheme === "spaceStation";
    if (isMagicTheme || isSpaceTheme) startCaseLabel = "조사 시작";
    document.documentElement.dataset.samunmongTheme = activeTheme;
    const magicBriefingText = sentenceBreakText("“선생님, 제1 연금술 실습실이 밤새 불탔습니다.”\n\n당신은 이 꿈에서 갓 부임한 마법 교사입니다.\n마력의 시선으로 잔류 마법을 살피고, 학생과 교직원을 심문해 방화의 진범을 찾아야 합니다.");
    const spaceBriefingText = sentenceBreakText("“오르빗-13에서 외부 작업 중 대원이 궤도 밖으로 이탈했습니다.”\n\n당신은 이 꿈에서 정거장 사고 조사관입니다.\n정전 기록, 산소 장치, 우주복 점검 로그와 마지막 무전을 맞춰 보며 사고처럼 보이는 죽음의 진실을 추적해야 합니다.");
    const briefingText = isSpaceTheme
      ? spaceBriefingText
      : isMagicTheme
      ? magicBriefingText
      : sentenceBreakText("“사또님, 관아 근처에서 사람이 쓰러진 채 발견되었습니다.”\n\n당신은 이 꿈에서 고을의 사또입니다.\n현장을 조사하여 증거를 모으고, 용의자를 심문하여 범인을 찾아야 합니다.");
    const magicSuspects = [
      { name: "말포이", id: "malpoi", scene: "/samunmong/assets/magic-school/interrogation/office-empty.webp", sprite: "/samunmong/assets/magic-school/interrogation/malpoi-sprite.webp", sleeveScene: "/samunmong/assets/magic-school/interrogation/office-empty.webp" },
      { name: "말포삼", id: "malposam", scene: "/samunmong/assets/magic-school/interrogation/office-empty.webp", sprite: "/samunmong/assets/magic-school/interrogation/malposam-sprite.webp", sleeveScene: "/samunmong/assets/magic-school/interrogation/office-empty.webp" },
      { name: "말포일", id: "malpoil", scene: "/samunmong/assets/magic-school/interrogation/office-empty.webp", sprite: "/samunmong/assets/magic-school/interrogation/malpoil-sprite.webp", sleeveScene: "/samunmong/assets/magic-school/interrogation/office-empty.webp" }
    ];
    const spaceConfig = window.SAMUNMONG_SPACE_STATION || (() => {
      try {
        return JSON.parse(document.querySelector("#spaceStationRuntimeData")?.textContent || "{}");
      } catch {
        return {};
      }
    })();
    const spacePersonnelAuthIds = spaceConfig.personnelAuthIds || {};
    const spaceSuspects = spaceConfig.suspects || [];
    const suspects = isSpaceTheme ? spaceSuspects : isMagicTheme ? magicSuspects : window.SAMUNMONG_CONTENT?.suspects || [
      { name: "돌쇠", id: "dolsoe", scene: "/samunmong/assets/scene-interrogation-dolsoe.webp?v=scene-20260707", sleeveScene: "/samunmong/assets/scene-interrogation-dolsoe-sleeve.webp?v=sleeve-20260707", lieScene: "/samunmong/assets/interrogation-expressions/scene-interrogation-dolsoe-lie.png?v=lie-20260824" },
      { name: "최춘월", id: "chunwol", scene: "/samunmong/assets/scene-interrogation-chunwol.webp?v=scene-20260707", sleeveScene: "/samunmong/assets/scene-interrogation-chunwol-sleeve.webp?v=sleeve-20260707", lieScene: "/samunmong/assets/interrogation-expressions/scene-interrogation-chunwol-lie.png?v=lie-20260824" },
      { name: "유문석", id: "yoomunseok", scene: "/samunmong/assets/scene-interrogation-yoomunseok.webp?v=scene-20260707", sleeveScene: "/samunmong/assets/scene-interrogation-yoomunseok-sleeve.webp?v=sleeve-20260707", lieScene: "/samunmong/assets/interrogation-expressions/scene-interrogation-yoomunseok-lie.png?v=lie-20260824" },
      { name: "무덕", id: "mudeok", scene: "/samunmong/assets/scene-interrogation-mudeok.webp?v=scene-20260707", sleeveScene: "/samunmong/assets/scene-interrogation-mudeok-sleeve.webp?v=sleeve-20260707", lieScene: "/samunmong/assets/interrogation-expressions/scene-interrogation-mudeok-lie.png?v=lie-20260824" }
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
    let activeNoteSuspectId = suspects[0]?.id || (isSpaceTheme ? "harry" : isMagicTheme ? "malpoi" : "dolsoe");
    let briefingStepIndex = 0;
    let briefingRestoreTimer = 0;
    let isBriefingTyped = false;
    const conversationNotes = new Map();
    const sleeveCheckedSuspects = new Set();
    const saveKey = "samunmong-demo-state";
    const saveSlotsKey = "samunmong-save-slots";
    const newDreamModeKey = "samunmong-new-dream-mode";
    const themeId = isSpaceTheme ? "spaceStation" : isMagicTheme ? "magicSchool" : "joseon";
    const themeLabels = {
      joseon: "조선시대 살인사건",
      magicSchool: "마법학교 방화사건",
      spaceStation: "우주정거장 살인사건"
    };
    const themeSuffixes = {
      joseon: "joseon",
      magicSchool: "magic-school",
      spaceStation: "space-station"
    };
    const themeStorageSuffix = isSpaceTheme ? "space-station" : isMagicTheme ? "magic-school" : "joseon";
    const collectedEvidenceKey = `samunmong-collected-evidence-${themeStorageSuffix}`;
    const unreadEvidenceKey = `samunmong-unread-evidence-${themeStorageSuffix}`;
    const analyzedEvidenceKey = `samunmong-analyzed-evidence-${themeStorageSuffix}`;
    const examinedCluesKey = `samunmong-examined-clues-${themeStorageSuffix}`;
    const linkedEvidenceKey = `samunmong-linked-evidence-${themeStorageSuffix}`;
    const spaceMedicalRecordRecoveryKey = "samunmong-space-medical-record-recovered";
    const retiredJoseonEvidenceNames = new Set(["헐거워진 노리개"]);
    const conversationNotesKey = `samunmong-conversation-notes-${themeStorageSuffix}`;
    const interrogationQuestionCountKey = `samunmong-interrogation-question-count-${themeStorageSuffix}`;
    const interrogationKnownFactsKey = `samunmong-interrogation-known-facts-${themeStorageSuffix}`;
    const fieldGuidePendingKey = "samunmong-field-guide-pending";
    const fieldGuideSeenKey = "samunmong-field-guide-seen";
    const settingsKey = "samunmong-demo-settings";
    const bgmStateKey = "samunmong-bgm-state";
    const interrogationQuestionLimit = 50;
    let fieldGuideStep = "";
    let fieldGuideMapTimer = 0;
    let briefingReturnScreenId = "fieldOne";
    let interrogationReactionTimer = 0;
    let interrogationThinkingSoundTimer = 0;
    let newFactToastTimer = 0;

    const magicLinearProgression = [
      { screenId: "magicAlchemyLab", name: "제1 연금술 실습실", evidence: ["부러진 지팡이", "화염 감지 룬스톤", "기록의 수정구"] },
      { screenId: "magicCleaningCloset", name: "청소도구함", evidence: ["금지된 마법 담배 재"] },
      { screenId: "magicLibrary", name: "도서관", evidence: ["도서관 대출 기록부", "빙결 흔적이 남은 반납 도서"] },
      { screenId: "magicRecordCrystalRoom", name: "기록 수정구실", evidence: ["조작된 기록 수정구"] },
      { screenId: "magicDormHallway", name: "학생들 기숙사", evidence: ["버려진 지팡이 조각"] },
      { screenId: "interrogationScreen", name: "교무 조사실", evidence: [] }
    ];
    let magicUnlockedIndex = -1;

    function getMagicUnlockedIndex() {
      if (!isMagicTheme) return magicLinearProgression.length - 1;
      const collected = new Set(readStoredNames(collectedEvidenceKey));
      let unlockedIndex = 0;

      for (let index = 0; index < magicLinearProgression.length - 1; index += 1) {
        const locationComplete = magicLinearProgression[index].evidence.every((name) => collected.has(name));
        if (!locationComplete) break;
        unlockedIndex = index + 1;
      }

      return unlockedIndex;
    }

    function getMagicLockMessage(targetScreenId) {
      const targetIndex = magicLinearProgression.findIndex((location) => location.screenId === targetScreenId);
      if (targetIndex <= 0) return "";
      const previous = magicLinearProgression[targetIndex - 1];
      const collected = new Set(readStoredNames(collectedEvidenceKey));
      const remaining = previous.evidence.filter((name) => !collected.has(name)).length;
      return `${previous.name}의 증거 ${remaining}개를 더 찾아야 봉인이 풀립니다.`;
    }

    function canAccessMagicScreen(targetScreenId) {
      if (!isMagicTheme) return true;
      const targetIndex = magicLinearProgression.findIndex((location) => location.screenId === targetScreenId);
      return targetIndex < 0 || targetIndex <= getMagicUnlockedIndex();
    }

    function syncMagicMapProgress({ announce = false } = {}) {
      if (!isMagicTheme) return;
      const unlockedIndex = getMagicUnlockedIndex();
      const newlyUnlocked = magicUnlockedIndex >= 0 && unlockedIndex > magicUnlockedIndex;
      magicUnlockedIndex = unlockedIndex;

      magicLinearProgression.forEach((location, index) => {
        const isLocked = index > unlockedIndex;
        const pin = document.querySelector(`.map-pin-button[data-location-screen="${location.screenId}"]`);
        const label = document.querySelector(`.map-label[data-location-screen="${location.screenId}"]`);
        const dockButton = location.screenId === "interrogationScreen"
          ? document.querySelector(`.magic-school-dock [data-go="${location.screenId}"]`)
          : null;

        [pin, dockButton].forEach((button) => {
          if (!(button instanceof HTMLButtonElement)) return;
          button.disabled = isLocked;
          button.classList.toggle("locked", isLocked);
          button.setAttribute("aria-disabled", String(isLocked));
          button.title = isLocked ? getMagicLockMessage(location.screenId) : `${location.name}으로 이동`;
        });
        label?.classList.toggle("locked", isLocked);
      });

      const current = magicLinearProgression[Math.min(unlockedIndex, magicLinearProgression.length - 1)];
      const progress = document.querySelector("#magicMapProgress");
      if (progress) {
        const collected = new Set(readStoredNames(collectedEvidenceKey));
        const remaining = current.evidence.filter((name) => !collected.has(name)).length;
        progress.textContent = current.evidence.length && remaining > 0
          ? `${current.name} 조사 중 · 남은 증거 ${remaining}개`
          : unlockedIndex === magicLinearProgression.length - 1
            ? "모든 조사 장소의 봉인이 풀렸습니다."
            : `${magicLinearProgression[unlockedIndex + 1].name}의 봉인이 풀렸습니다.`;
      }

      if (announce && newlyUnlocked) {
        const unlockedLocation = magicLinearProgression[unlockedIndex];
        window.setTimeout(() => showToast(`${unlockedLocation.name}의 봉인이 풀렸습니다.`), 2100);
      }
    }

    const joseonLocationMeta = {
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
    const magicLocationMeta = {
      tutorialScreen: { name: "튜토리얼", x: "18%", y: "18%" },
      dreamScreen: { name: "꿈 선택", x: "18%", y: "18%" },
      briefingScreen: { name: "사건 브리핑", x: "18%", y: "18%" },
      magicAlchemyLab: { name: "제1 연금술 실습실", x: "23.4%", y: "27.6%" },
      magicCleaningCloset: { name: "청소도구함", x: "44.0%", y: "27.2%" },
      magicLibrary: { name: "도서관", x: "65.7%", y: "23.8%" },
      magicRecordCrystalRoom: { name: "기록 수정구실", x: "78.4%", y: "47.4%" },
      magicDormHallway: { name: "학생들 기숙사", x: "27.3%", y: "61.0%" },
      interrogationScreen: { name: "교무 조사실", x: "70.3%", y: "73.6%" }
    };
    const spaceLocationMeta = spaceConfig.locations || {};
    const locationMeta = isSpaceTheme ? spaceLocationMeta : isMagicTheme ? magicLocationMeta : joseonLocationMeta;
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
      lie: "/samunmong/audio/joseon-dream-trace-sting-v1.wav",
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

    const nonResumableScreenIds = new Set(["mainScreen", "tutorialScreen", "dreamScreen"]);

    function isValidSavedProgress(saved = readStored(saveKey, null)) {
      return knownScreenIds.has(saved?.screenId) && !nonResumableScreenIds.has(saved.screenId);
    }

    function readSaveSlots() {
      const slots = readStored(saveSlotsKey, {});
      return slots && typeof slots === "object" && !Array.isArray(slots) ? slots : {};
    }

    function writeSaveSlots(slots) {
      localStorage.setItem(saveSlotsKey, JSON.stringify(slots));
    }

    function normalizeThemeName(theme) {
      return themeLabels[theme] ? theme : "joseon";
    }

    function inferThemeFromScreen(screenId, fallbackTheme = themeId) {
      if (screenId?.startsWith("magic")) return "magicSchool";
      if (screenId?.startsWith("space")) return "spaceStation";
      return normalizeThemeName(fallbackTheme);
    }

    function getLegacySaveSlot() {
      const legacy = readStored(saveKey, null);
      if (!isValidSavedProgress(legacy)) return null;
      const legacyTheme = inferThemeFromScreen(legacy.screenId, legacy.theme || localStorage.getItem(themeKey) || themeId);
      return { ...legacy, theme: legacyTheme, savedAt: legacy.savedAt || Date.now() };
    }

    function getSaveSlot(theme) {
      const normalizedTheme = normalizeThemeName(theme);
      const slot = readSaveSlots()[normalizedTheme];
      if (isValidSavedProgress(slot)) return { ...slot, theme: normalizedTheme };

      const legacy = getLegacySaveSlot();
      return legacy?.theme === normalizedTheme ? legacy : null;
    }

    function getValidSaveSlots() {
      const slots = readSaveSlots();
      const legacy = getLegacySaveSlot();
      if (legacy && !slots[legacy.theme]) {
        slots[legacy.theme] = legacy;
        writeSaveSlots(slots);
      }

      return Object.entries(slots).filter(([theme, slot]) => themeLabels[theme] && isValidSavedProgress(slot));
    }

    function formatSavedAt(timestamp) {
      if (!timestamp) return "저장 시각 없음";
      try {
        return new Intl.DateTimeFormat("ko-KR", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        }).format(new Date(timestamp));
      } catch {
        return "저장됨";
      }
    }

    function getLocationName(theme, screenId) {
      const metaByTheme = { joseon: joseonLocationMeta, magicSchool: magicLocationMeta, spaceStation: spaceLocationMeta };
      return metaByTheme[theme]?.[screenId]?.name || "이어가기 지점";
    }

    function renderSaveSlots() {
      const slots = readSaveSlots();
      const legacy = getLegacySaveSlot();
      if (legacy && !slots[legacy.theme]) {
        slots[legacy.theme] = legacy;
        writeSaveSlots(slots);
      }

      document.querySelectorAll("[data-save-slot-theme]").forEach((button) => {
        const slotTheme = normalizeThemeName(button.dataset.saveSlotTheme);
        const slot = getSaveSlot(slotTheme);
        const title = button.querySelector("strong");
        const meta = button.querySelector("span");
        if (title) title.textContent = themeLabels[slotTheme];

        if (slot) {
          button.disabled = false;
          button.removeAttribute("aria-disabled");
          button.title = `${themeLabels[slotTheme]} 이어가기`;
          if (meta) meta.textContent = `${getLocationName(slotTheme, slot.screenId)} · ${formatSavedAt(slot.savedAt)}`;
        } else {
          button.disabled = true;
          button.setAttribute("aria-disabled", "true");
          button.title = "저장된 꿈이 없습니다";
          if (meta) meta.textContent = "저장된 꿈이 없습니다";
        }
      });
    }

    function openSaveSlotDialog() {
      renderSaveSlots();
      const dialog = document.querySelector("#saveSlotDialog");
      if (!dialog) {
        const firstSlot = getValidSaveSlots()[0];
        if (firstSlot) restoreSaveSlot(firstSlot[0], firstSlot[1]);
        return;
      }

      dialog.classList.add("open");
      dialog.setAttribute("aria-hidden", "false");
    }

    function closeSaveSlotDialog() {
      const dialog = document.querySelector("#saveSlotDialog");
      dialog?.classList.remove("open");
      dialog?.setAttribute("aria-hidden", "true");
    }

    function restoreSaveSlot(slotTheme, slot) {
      if (!isValidSavedProgress(slot)) return;
      const normalizedTheme = normalizeThemeName(slotTheme || slot.theme);
      markFieldGuideSeen();
      localStorage.setItem(themeKey, normalizedTheme);
      closeSaveSlotDialog();

      const params = new URLSearchParams({ start: slot.screenId, theme: normalizedTheme });
      navigateWithinApp(`/?${params.toString()}`);
    }

    function clearThemeProgress(theme) {
      const normalizedTheme = normalizeThemeName(theme);
      const suffix = themeSuffixes[normalizedTheme] || themeSuffixes.joseon;
      localStorage.removeItem(`samunmong-collected-evidence-${suffix}`);
      localStorage.removeItem(`samunmong-unread-evidence-${suffix}`);
      localStorage.removeItem(`samunmong-analyzed-evidence-${suffix}`);
      localStorage.removeItem(`samunmong-examined-clues-${suffix}`);
      localStorage.removeItem(`samunmong-linked-evidence-${suffix}`);
      localStorage.removeItem(`samunmong-conversation-notes-${suffix}`);
      localStorage.removeItem(`samunmong-interrogation-question-count-${suffix}`);
      localStorage.removeItem(`samunmong-interrogation-known-facts-${suffix}`);
      if (normalizedTheme === "spaceStation") localStorage.removeItem(spaceMedicalRecordRecoveryKey);
      if (normalizedTheme === "joseon") localStorage.removeItem(fieldGuideSeenKey);

      const slots = readSaveSlots();
      delete slots[normalizedTheme];
      writeSaveSlots(slots);

      const legacy = readStored(saveKey, null);
      if (legacy?.theme === normalizedTheme || (!legacy?.theme && normalizedTheme === themeId)) {
        localStorage.removeItem(saveKey);
      }
    }

    function consumeNewDreamMode(theme) {
      const mode = sessionStorage.getItem(newDreamModeKey);
      if (!mode) return;
      if (mode === "restart" || mode === "1") clearThemeProgress(theme);
      sessionStorage.removeItem(newDreamModeKey);
    }

    function updateContinueButtonState() {
      const continueButton = document.querySelector("#continueDream");
      if (!continueButton) return;

      const enabled = getValidSaveSlots().length > 0;
      continueButton.disabled = !enabled;
      continueButton.setAttribute("aria-disabled", String(!enabled));
      if (enabled) {
        continueButton.removeAttribute("title");
      } else {
        continueButton.title = "저장된 꿈이 없습니다";
      }
    }

    function saveProgress(screenId) {
      if (nonResumableScreenIds.has(screenId)) return;
      const slot = { theme: themeId, screenId, savedAt: Date.now() };
      const slots = readSaveSlots();
      slots[themeId] = slot;
      writeSaveSlots(slots);
      localStorage.setItem(saveKey, JSON.stringify(slot));
      renderSaveSlots();
      updateContinueButtonState();
    }

    function saveCollectedEvidence(name) {
      const collected = new Set(readStoredNames(collectedEvidenceKey));
      const isNewEvidence = !collected.has(name);
      collected.add(name);
      localStorage.setItem(collectedEvidenceKey, JSON.stringify([...collected]));
      if (isNewEvidence) markEvidenceBagUnread();
      if (isNewEvidence) syncMagicMapProgress({ announce: true });
    }

    function syncEvidenceBagUnreadIndicator() {
      const hasUnreadEvidence = localStorage.getItem(unreadEvidenceKey) === "1";
      document.querySelectorAll(".bag-chip").forEach((button) => {
        button.classList.toggle("has-unread-evidence", hasUnreadEvidence);
      });
    }

    function markEvidenceBagUnread() {
      localStorage.setItem(unreadEvidenceKey, "1");
      syncEvidenceBagUnreadIndicator();
    }

    function clearEvidenceBagUnread() {
      localStorage.removeItem(unreadEvidenceKey);
      syncEvidenceBagUnreadIndicator();
    }

    window.addEventListener("samunmong:screen-change", syncEvidenceBagUnreadIndicator);

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
        ? stored.filter((name) => typeof name === "string" && name.trim() && !(themeId === "joseon" && retiredJoseonEvidenceNames.has(name)))
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

    const decisiveEvidenceNames = new Set([
      "찢어진 약속 편지", "찢어진 옷고름", "긁힌 팔 흔적", "돌쇠의 팔 상처",
      "돌쇠의 그림", "도망 보따리", "호패 조각", "끊어진 호패끈",
      "빈 호패 주머니", "무덕의 번진 일기", "혼서 조각"
    ]);

    function getEvidenceMaterial(name = "") {
      if (/(편지|일기|장부|혼서|기록|그림|책)/.test(name)) return "paper";
      if (/(호패|쇠|금속|도끼|룬|수정구|수정|지팡이)/.test(name)) return "metal";
      if (/(옷고름|비단|붕대|보따리|옷|소매)/.test(name)) return "cloth";
      if (/(상처|피|발자국)/.test(name)) return "organic";
      return "wood";
    }

    function dispatchEvidenceFeedback(name, target, forceCritical = false) {
      const rect = target?.getBoundingClientRect?.();
      const shellRect = document.querySelector(".game-shell")?.getBoundingClientRect();
      window.dispatchEvent(new CustomEvent("samunmong:evidence-feedback", {
        detail: {
          name,
          importance: forceCritical || decisiveEvidenceNames.has(name) ? "critical" : "standard",
          material: getEvidenceMaterial(name),
          x: rect ? rect.left + rect.width / 2 : shellRect ? shellRect.left + shellRect.width / 2 : window.innerWidth / 2,
          y: rect ? rect.top + rect.height / 2 : shellRect ? shellRect.top + shellRect.height / 2 : window.innerHeight / 2
        }
      }));
    }

    function playDreamTraceSfx() {
      const level = getAudioLevel();
      if (level <= 0) return;
      const activeTrack = bgmTracks[currentBgm || bgmForScreen(getActiveScreenId())];
      if (activeTrack) activeTrack.volume = Math.max(0, Math.min(1, level * 0.14));
      const sound = new Audio("/samunmong/audio/joseon-dream-trace-sting-v2.wav");
      sound.volume = Math.max(0.42, Math.min(0.88, level * 0.86));
      sound.play().catch(() => {});
      window.setTimeout(() => applyAudioVolume(), 2480);
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
      clearTimeout(typeBriefing.decodeTimer);
      clearTimeout(briefingRestoreTimer);
    }

    function renderBriefingText(text) {
      if (!briefingCopy || !isSpaceTheme) {
        if (briefingCopy) briefingCopy.textContent = text;
        return;
      }

      const roleText = "당신은 이 꿈에서 정거장 사고 조사관입니다.";
      const roleStart = briefingText.indexOf(roleText);
      if (roleStart < 0 || text.length <= roleStart) {
        briefingCopy.textContent = text;
        return;
      }

      const roleEnd = roleStart + roleText.length;
      const visibleRoleText = text.slice(roleStart, roleEnd);
      const roleLine = document.createElement("span");
      roleLine.className = "space-briefing-role-line";
      const emphasisText = "정거장 사고 조사관";
      const emphasisStart = roleText.indexOf(emphasisText);
      const emphasisEnd = emphasisStart + emphasisText.length;
      const emphasis = document.createElement("strong");
      emphasis.textContent = visibleRoleText.slice(emphasisStart, emphasisEnd);
      roleLine.append(
        document.createTextNode(visibleRoleText.slice(0, emphasisStart)),
        emphasis,
        document.createTextNode(visibleRoleText.slice(emphasisEnd))
      );
      briefingCopy.replaceChildren(
        document.createTextNode(text.slice(0, roleStart)),
        roleLine,
        document.createTextNode(text.slice(roleEnd))
      );
    }

    function finishBriefingTyping() {
      clearInterval(typeBriefing.timer);
      clearTimeout(typeBriefing.decodeTimer);
      if (briefingCopy) {
        renderBriefingText(briefingText);
        briefingCopy.classList.add("done");
        briefingCopy.classList.remove("rune-decoding");
      }
      isBriefingTyped = true;
      updateBriefingStep();
    }

    function makeRunePreview(text) {
      const runes = ["ᚱ", "ᚢ", "ᚾ", "ᛖ", "ᛗ", "ᚨ", "ᚾ", "ᚨ", "ᛟ", "ᚲ"];
      let runeIndex = 0;
      return [...text].map((char) => {
        if (char === "\n" || /\s/.test(char)) return char;
        runeIndex += 1;
        return runes[runeIndex % runes.length];
      }).join("");
    }

    function resetMemoryTrace() {
      memoryTraceComplete = false;
      memoryTracePoints = [];
      clearInterval(memoryTraceTypingTimer);
      memoryTraceSequence?.setAttribute("data-memory-trace-state", "intro");
      if (memoryDrawPath) memoryDrawPath.setAttribute("d", "");
      memoryTraceEvidenceNodes.forEach((node) => node.classList.remove("revealed"));
      if (memoryTraceInstruction) {
        memoryTraceInstruction.textContent = "지팡이를 이용해 원을 그려 사건의 잔상을 확인하세요.";
      }
      if (memoryTraceCopy) memoryTraceCopy.textContent = "";
      if (memoryTraceContinue) memoryTraceContinue.disabled = true;
    }

    function typeMemoryTraceStory() {
      const story = [
        "선생님께서 처음 이 학교에 부임하셨을 때...",
        "제1 연금술 실습실에서 좋지 않은 사건이 발생했다고 합니다.",
        "흩어진 잔상 속 단서들을 따라, 그 사건의 진실을 밝혀야 합니다."
      ].join("\n\n");
      let index = 0;
      clearInterval(memoryTraceTypingTimer);
      if (memoryTraceCopy) memoryTraceCopy.textContent = "";
      if (memoryTraceContinue) memoryTraceContinue.disabled = true;
      memoryTraceTypingTimer = window.setInterval(() => {
        index += 1;
        if (memoryTraceCopy) memoryTraceCopy.textContent = story.slice(0, index);
        if (index >= story.length) {
          clearInterval(memoryTraceTypingTimer);
          if (memoryTraceContinue) memoryTraceContinue.disabled = false;
        }
      }, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 28);
    }

    function completeMemoryTrace() {
      if (memoryTraceComplete) return;
      memoryTraceComplete = true;
      memoryTraceSequence?.setAttribute("data-memory-trace-state", "complete");
      memoryTraceEvidenceNodes.forEach((node, index) => {
        setTimeout(() => node.classList.add("revealed"), index * 180);
      });
      if (memoryTraceInstruction) {
        memoryTraceInstruction.textContent = "잔상이 떠오르고 있습니다...";
      }
      setTimeout(typeMemoryTraceStory, 1150);
    }

    function updateMemoryDrawPath() {
      if (!memoryDrawPath || memoryTracePoints.length < 2) return;
      const d = memoryTracePoints.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(" ");
      memoryDrawPath.setAttribute("d", d);
    }

    function getMemoryDrawPoint(event) {
      const drawingSvg = memoryDrawPath?.ownerSVGElement;
      const screenMatrix = drawingSvg?.getScreenCTM();
      if (drawingSvg && screenMatrix) {
        const svgPoint = drawingSvg.createSVGPoint();
        svgPoint.x = event.clientX;
        svgPoint.y = event.clientY;
        const localPoint = svgPoint.matrixTransform(screenMatrix.inverse());
        return { x: localPoint.x, y: localPoint.y };
      }

      const rect = memoryDrawZone?.getBoundingClientRect();
      if (!rect) return null;
      return {
        x: ((event.clientX - rect.left) / rect.width) * 100,
        y: ((event.clientY - rect.top) / rect.height) * 100
      };
    }

    function isMemoryCircleComplete() {
      if (memoryTracePoints.length < 28) return false;
      const first = memoryTracePoints[0];
      const last = memoryTracePoints[memoryTracePoints.length - 1];
      const closeDistance = Math.hypot(first.x - last.x, first.y - last.y);
      const xs = memoryTracePoints.map((point) => point.x);
      const ys = memoryTracePoints.map((point) => point.y);
      const width = Math.max(...xs) - Math.min(...xs);
      const height = Math.max(...ys) - Math.min(...ys);
      return closeDistance < 16 && width > 36 && height > 28;
    }

    function setBriefingMode(mode = "full") {
      const journalMode = mode === "deathOnly";
      briefingCard?.classList.toggle("journal-mode", journalMode);
      briefingCard?.setAttribute("data-briefing-mode", journalMode ? "deathOnly" : "full");
      setStartCaseLabel(journalMode ? "닫기" : startCaseLabel);
    }

    function updateBriefingStep() {
      const lastIndex = Math.max(0, briefingPanels.length - 1);
      const journalMode = briefingCard?.dataset.briefingMode === "deathOnly";
      briefingStepIndex = Math.max(0, Math.min(lastIndex, briefingStepIndex));
      if (isMagicTheme && !journalMode && briefingStepIndex === 1) {
        briefingStepIndex = 2;
      }
      briefingCard?.setAttribute("data-briefing-step", String(briefingStepIndex));

      briefingPanels.forEach((panel) => {
        const isActive = Number(panel.dataset.briefingPanel) === briefingStepIndex;
        panel.classList.toggle("active", isActive);
        panel.setAttribute("aria-hidden", String(!isActive));
      });

      if (briefingPrevButton) {
        briefingPrevButton.hidden = journalMode;
        briefingPrevButton.disabled = briefingStepIndex === 0;
      }
      if (briefingNextButton) {
        briefingNextButton.hidden = journalMode || briefingStepIndex === lastIndex;
        briefingNextButton.disabled = !journalMode && briefingStepIndex === 0 && briefingScreen?.classList.contains("awaiting-memory-orb");
        if (isMagicTheme && !journalMode && briefingStepIndex < lastIndex && !briefingScreen?.classList.contains("awaiting-memory-orb")) {
          briefingNextButton.hidden = false;
        }
        if (isMagicTheme && !journalMode && briefingStepIndex === 0) {
          briefingNextButton.hidden = true;
        }
      }
      if (startCaseButton) {
        startCaseButton.hidden = !journalMode && briefingStepIndex !== lastIndex;
        startCaseButton.classList.toggle("ready", journalMode || briefingStepIndex === lastIndex);
      }
    }

    function startBriefingSequence(mode = "full") {
      const journalMode = mode === "deathOnly";
      setBriefingMode(mode);
      briefingStepIndex = journalMode ? Math.min(1, Math.max(0, briefingPanels.length - 1)) : 0;
      isBriefingTyped = journalMode;
      stopBriefingTyping();
      briefingScreen?.classList.remove("memory-restoring", "memory-restored");
      briefingScreen?.classList.toggle("awaiting-memory-orb", isMagicTheme && !journalMode);
      if (memoryOrbTrigger) {
        memoryOrbTrigger.disabled = false;
      }
      updateBriefingStep();
      if (journalMode) {
        if (briefingCopy) {
          briefingCopy.textContent = "";
          briefingCopy.classList.add("done");
        }
      } else if (isMagicTheme) {
        if (briefingCopy) {
          briefingCopy.textContent = "";
          briefingCopy.classList.remove("done", "rune-decoding");
        }
        resetMemoryTrace();
      } else {
        typeBriefing();
      }
    }

    function openBriefingJournal() {
      briefingReturnScreenId = getActiveScreenId() || "fieldOne";
      if (isSpaceTheme) {
        setBriefingMode("full");
        window.dispatchEvent(new CustomEvent("samunmong:briefing-journal-open"));
        return;
      } else {
        startBriefingSequence("deathOnly");
      }
      revealBriefingJournal();
    }

    function revealBriefingJournal() {
      briefingScreen?.classList.add("journal-overlay-open");
      briefingJournalCloseButton?.focus();
      playSfx("buttonAlt", 0.62);
    }

    function closeBriefingJournal() {
      briefingScreen?.classList.remove("journal-overlay-open");
      setBriefingMode("full");
      if (isSpaceTheme) {
        window.dispatchEvent(new CustomEvent("samunmong:briefing-journal-close"));
      }
      document.querySelector(`[data-go="briefingScreen"]`)?.focus();
      playSfx("buttonAlt", 0.58);
    }

    function beginMemoryRestoration() {
      if (!isMagicTheme || briefingCard?.dataset.briefingMode === "deathOnly") return;
      if (!briefingScreen?.classList.contains("awaiting-memory-orb")) return;
      stopBriefingTyping();
      memoryOrbTrigger?.setAttribute("disabled", "true");
      briefingScreen.classList.remove("awaiting-memory-orb");
      briefingScreen.classList.remove("memory-restored");
      briefingScreen.classList.add("memory-restoring");
      playSfx("briefingNext", 0.75);
      briefingRestoreTimer = window.setTimeout(() => {
        briefingScreen.classList.remove("memory-restoring");
        briefingScreen.classList.remove("awaiting-memory-orb");
        briefingScreen.classList.add("memory-restored");
        if (isMagicTheme) {
          finishBriefingTyping();
        } else {
          typeBriefing();
        }
      }, 2600);
    }

    function applySettings(settings) {
      document.body.classList.toggle("high-contrast", settings.highContrast);
      const volumeSetting = document.querySelector("#volumeSetting");
      const contrastSetting = document.querySelector("#contrastSetting");
      if (volumeSetting) volumeSetting.value = settings.volume;
      if (contrastSetting) contrastSetting.checked = settings.highContrast;
      applyAudioVolume();
    }

    function showToast(message, options = {}) {
      const image = document.querySelector("#toastEvidenceImage");
      const title = document.querySelector("#toastTitle");
      const messageEl = document.querySelector("#toastMessage");
      const closeButton = document.querySelector("#closeToast");
      const hasEvidence = Boolean(options.image && options.title);
      const isDismissible = Boolean(options.dismissible) && !(hasEvidence && isSpaceTheme);

      clearTimeout(closeToast.cleanupTimer);
      toast.classList.toggle("evidence-toast", hasEvidence);
      toast.classList.toggle("hint-toast", options.variant === "hint");
      toast.classList.toggle("dismissible", isDismissible);
      toast.setAttribute("role", hasEvidence ? "dialog" : "status");
      if (image) {
        image.hidden = !hasEvidence;
        image.src = hasEvidence ? options.image : "";
        image.alt = hasEvidence ? `${options.title} 증거 사진` : "";
      }
      if (title) {
        title.hidden = !hasEvidence;
        title.textContent = hasEvidence ? options.title : "";
      }
      if (closeButton) closeButton.hidden = !isDismissible;
      if (messageEl) {
        const displayMessage = hasEvidence && isSpaceTheme
          ? "증거 보관함에 저장되었습니다."
          : message;
        messageEl.textContent = sentenceBreakText(displayMessage);
      }
      toast.classList.add("show");
      clearTimeout(showToast.timer);
      if (!isDismissible) {
        showToast.timer = setTimeout(() => toast.classList.remove("show"), options.duration || 1900);
      }
    }

    function closeToast() {
      clearTimeout(showToast.timer);
      clearTimeout(closeToast.cleanupTimer);
      toast.classList.remove("show");
      closeToast.cleanupTimer = setTimeout(() => {
        if (toast.classList.contains("show")) return;
        toast.classList.remove("dismissible", "evidence-toast", "hint-toast");
        toast.setAttribute("role", "status");
        document.querySelector("#closeToast")?.setAttribute("hidden", "");
      }, 200);
    }

    document.querySelector("#closeToast")?.addEventListener("click", closeToast);

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
  "spaceAirlock",
  "spaceMedicalBay",
  "spaceOxygenGenerator",
  "spaceDataCore",
  "spaceScienceLab",
  "interrogationScreen"
]);

    function getButtonGuideText(target) {
      if (!target) return "";
      if (target.dataset.guide) return target.dataset.guide;
      if (buttonGuideTextById[target.id]) return buttonGuideTextById[target.id];
      if (target.matches(".map-chip")) return isSpaceTheme ? "오르빗-13의 구역 도면을 펼칩니다." : "조사 장소를 오갑니다.";
      if (target.matches(".bag-chip")) return isSpaceTheme ? "증거 보관함에서 수집물을 확인합니다." : isMagicTheme ? "차원 주머니 속 증거를 불러옵니다." : "모은 증거를 확인합니다.";
      if (target.matches(".briefing-chip")) return "초기 사고 보고서를 다시 확인합니다.";
      if (target.matches(".tool-chip")) return isMagicTheme ? "마력 감지로 잔류 흔적을 분석합니다." : "증거를 더 자세히 분석합니다.";
      if (target.matches(".note-chip")) return isSpaceTheme ? "대원별 통신 로그를 확인합니다." : "등장인물과 나눈 대화를 기록합니다.";
      if (target.matches(".journal-chip")) return isSpaceTheme ? "초기 사고 보고서를 다시 확인합니다." : isMagicTheme ? "수사 일지에서 관계자별 기록을 확인합니다." : "처음 사건 일지를 다시 봅니다.";
      if (target.matches(".room-chip")) return target.getAttribute("aria-current") === "page" ? "현재 위치입니다." : isSpaceTheme ? "보안 조사실로 이동합니다." : "취조실로 이동합니다.";
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
      const scale = shellRect.width / (shell.offsetWidth || shellRect.width) || 1;
      const shellWidth = shell.offsetWidth || shellRect.width;
      const shellHeight = shell.offsetHeight || shellRect.height;
      const targetLeft = (targetRect.left - shellRect.left) / scale;
      const targetRight = (targetRect.right - shellRect.left) / scale;
      const targetTop = (targetRect.top - shellRect.top) / scale;
      const targetBottom = (targetRect.bottom - shellRect.top) / scale;
      const centerX = targetLeft + (targetRight - targetLeft) / 2;
      const centerY = targetTop + (targetBottom - targetTop) / 2;
      const guideWidth = Math.min(300, Math.max(210, String(element.textContent || "").length * 13 + 44));
      const guideHeight = Math.max(54, Math.min(112, Math.ceil(String(element.textContent || "").length / 15) * 22 + 22));
      const margin = 18;
      const gap = 18;
      const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
      const fitsRight = targetRight + gap + guideWidth <= shellWidth - margin;
      const fitsLeft = targetLeft - gap - guideWidth >= margin;
      const fitsBottom = targetBottom + gap + guideHeight <= shellHeight - margin;
      const fitsTop = targetTop - gap - guideHeight >= margin;
      let placement = "top";
      let left = centerX;
      let top = targetTop - gap;

      if ((target.matches(".map-chip") || (isSpaceTheme && target.matches(".room-chip"))) && fitsTop) {
        placement = "top";
        const horizontalOffset = isSpaceTheme && target.matches(".room-chip") ? 60 : 0;
        left = clamp(centerX + horizontalOffset, margin + guideWidth / 2, shellWidth - margin - guideWidth / 2);
        top = targetTop - gap;
      } else if (targetRight > shellWidth * .68 && fitsLeft) {
        placement = "left";
        left = targetLeft - gap;
        top = clamp(centerY, margin + guideHeight / 2, shellHeight - margin - guideHeight / 2);
      } else if (targetLeft < shellWidth * .32 && fitsRight) {
        placement = "right";
        left = targetRight + gap;
        top = clamp(centerY, margin + guideHeight / 2, shellHeight - margin - guideHeight / 2);
      } else if (!fitsTop && fitsBottom) {
        placement = "bottom";
        left = clamp(centerX, margin + guideWidth / 2, shellWidth - margin - guideWidth / 2);
        top = targetBottom + gap;
      } else if (fitsTop) {
        placement = "top";
        left = clamp(centerX, margin + guideWidth / 2, shellWidth - margin - guideWidth / 2);
        top = targetTop - gap;
      } else if (fitsBottom) {
        placement = "bottom";
        left = clamp(centerX, margin + guideWidth / 2, shellWidth - margin - guideWidth / 2);
        top = targetBottom + gap;
      } else {
        placement = "right";
        left = clamp(targetRight + gap, margin + guideWidth / 2, shellWidth - margin - guideWidth / 2);
        top = clamp(centerY, margin + guideHeight / 2, shellHeight - margin - guideHeight / 2);
      }

      element.style.setProperty("--guide-left", `${left}px`);
      element.style.setProperty("--guide-top", `${top}px`);
      element.dataset.placement = placement;
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
      if (document.querySelector("#fieldOnboarding:not([hidden])")) {
        hideButtonGuides();
        return;
      }
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

    function applyMagicUiCopies() {
      if (!isMagicTheme) return;

      const magicBriefingTitle = document.querySelector(".briefing-card h2");
      if (magicBriefingTitle) magicBriefingTitle.textContent = "마법학교 방화사건";
      const magicBriefingKicker = document.querySelector(".briefing-kicker");
      if (magicBriefingKicker) magicBriefingKicker.textContent = "기억 수정구";
      setStartCaseLabel("조사 시작");
      const magicBriefingCaption = document.querySelector("[data-briefing-panel='1'] .briefing-caption");
      if (magicBriefingCaption) magicBriefingCaption.textContent = "실습실의 불은 어떻게 번졌는가";

      const evidenceStack = document.querySelector(".briefing-evidence-stack");
      if (evidenceStack) {
        evidenceStack.innerHTML = `
          <figure class="briefing-evidence-photo">
            <img src="/samunmong/assets/magic-school/scenes/alchemy-lab.webp" alt="불탄 제1 연금술 실습실" draggable="false" />
            <figcaption>현장: 제1 연금술 실습실</figcaption>
          </figure>
          <figure class="briefing-evidence-photo briefing-evidence-photo-small">
            <img src="/samunmong/assets/magic-school/evidence/evidence-sheet.webp" alt="마법학교 방화 사건 증거품" draggable="false" />
            <figcaption>단서: 잔류 마력 증거</figcaption>
          </figure>
        `;
      }

      const deathCopy = document.querySelector(".briefing-death-copy");
      if (deathCopy) {
        deathCopy.innerHTML = `
          <p>선생님, 불길은 꺼졌지만 실습실에는 <strong>붉은 화염 마력</strong>과 <strong>하늘색 빙결 마력</strong>이 함께 남아 있습니다.</p>
          <p>경보 룬스톤은 얼어붙었고, 기록 수정구에는 <strong>보라색 환각층</strong>이 덧씌워져 있었습니다.</p>
          <p>범인은 먼저 경보와 기록을 무력화한 뒤 말포이에게 의심이 가도록 흔적을 남긴 듯합니다.</p>
        `;
      }

      const suspectCaption = document.querySelector("[data-briefing-panel='2'] .briefing-caption");
      if (suspectCaption) suspectCaption.textContent = "세 권의 기록 책을 차례로 펼쳐 보십시오, 선생님.";

      const suspectGrid = document.querySelector(".briefing-suspect-tags");
      if (suspectGrid && !magicRecordIntro) {
        const roles = {
          malpoi: "화염 마법 학생",
          malposam: "환각 마법 학생",
          malpoil: "모범생"
        };
        suspectGrid.innerHTML = magicSuspects.map((suspect) => `
          <section class="briefing-suspect-tag magic-suspect-tag" data-suspect="${suspect.name}">
            <img src="${suspect.sprite || suspect.scene}" alt="" draggable="false" />
            <div>
              <strong>${suspect.name}</strong>
              <span>${roles[suspect.id]}</span>
            </div>
          </section>
        `).join("");
      }

      const toolCopy = {
        openMapFromInterrogation: ["학교 지도 열기", "학교 지도", "/samunmong/assets/magic-school/ui/icon-school-map.webp"],
        openNoteProp: ["수사 일지 보기", "수사 일지", "/samunmong/assets/magic-school/ui/icon-investigation-journal.webp"],
        toggleEvidenceBag: ["마법 가방 열기", "마법 가방", "/samunmong/assets/magic-school/ui/icon-magic-bag.webp"]
      };
      Object.entries(toolCopy).forEach(([id, [ariaLabel, label, image]]) => {
        const button = document.querySelector(`#${id}`);
        button?.setAttribute("aria-label", ariaLabel);
        const icon = button?.querySelector("img");
        if (icon) icon.src = image;
        const sr = button?.querySelector(".sr-only");
        if (sr) sr.textContent = label;
      });
      const toolChip = document.querySelector("#interrogationScreen .tool-chip.open-tool-panel img");
      if (toolChip) toolChip.src = "/samunmong/assets/magic-school/ui/icon-mana-tools.webp";
      const journalChip = document.querySelector("#interrogationScreen .journal-chip img");
      if (journalChip) journalChip.src = "/samunmong/assets/magic-school/ui/icon-investigation-journal.webp";
      const interrogationJournalChip = document.querySelector("#interrogationScreen .journal-chip");
      interrogationJournalChip?.setAttribute("aria-label", "수사 일지 열기");
      const interrogationJournalLabel = interrogationJournalChip?.querySelector(".sr-only");
      if (interrogationJournalLabel) interrogationJournalLabel.textContent = "수사 일지";
      document.querySelectorAll(".magic-school-screen .journal-chip .magic-scene-chip-label").forEach((label) => {
        label.textContent = "수사 일지";
      });
      const accuseChip = document.querySelector("#accuseButton img");
      if (accuseChip) accuseChip.src = "/samunmong/assets/magic-school/ui/icon-final-accuse.webp";
      const hintChip = document.querySelector("#interrogationHint img");
      if (hintChip) hintChip.src = "/samunmong/assets/magic-school/ui/icon-arcane-hint-compass.png";
      const hintLabel = document.querySelector("#interrogationHint .sr-only");
      if (hintLabel) hintLabel.textContent = "마력 감지";
      const magicBagTitle = document.querySelector("#evidenceBagPop .bag-pop-head strong");
      if (magicBagTitle) magicBagTitle.textContent = "차원 주머니";
      const bagGuide = document.querySelector("#evidenceBagPop .bag-pop-guide");
      if (bagGuide) bagGuide.textContent = "차원 주머니에서 떠오른 증거를 선택해 심문에 제시합니다.";
      const emptyBag = document.querySelector("#emptyInterrogationEvidence");
      if (emptyBag) emptyBag.textContent = "차원 주머니에 떠오른 증거가 없습니다.";
      const magicToolTitle = document.querySelector("#toolPanel h2");
      if (magicToolTitle) magicToolTitle.textContent = "마력 도구";
      const magicToolKicker = document.querySelector("#toolPanel .tool-panel-kicker");
      if (magicToolKicker) magicToolKicker.textContent = "마력 분석";
      const toolPanelLead = document.querySelector("#toolPanel > p");
      if (toolPanelLead) toolPanelLead.textContent = "마력 도구를 먼저 고른 뒤 증거를 선택하면 잔류 마법의 의미를 확인할 수 있습니다.";
      document.querySelectorAll(".investigation-note-panel h2").forEach((heading) => {
        heading.textContent = "수사 일지";
      });
      document.querySelectorAll(".note-lead").forEach((lead) => {
        lead.textContent = "관계자별 질문과 답변을 대화처럼 확인합니다.";
      });
      document.querySelectorAll(".note-current-suspect").forEach((item) => {
        item.textContent = magicSuspects[0]?.name || "건달프";
      });
    }

    function setMagicRecordTab(tabName) {
      if (!magicRecordIntro) return;
      magicRecordIntro.dataset.recordKind = tabName;
      updateMagicStudentPage(Number(tabName) || 0);
    }

    function updateMagicStudentPage(nextIndex) {
      if (!magicStudentPages.length) return;
      const total = magicStudentPages.length;
      magicStudentPageIndex = (nextIndex + total) % total;
      magicStudentPages.forEach((page, index) => {
        const isActive = index === magicStudentPageIndex;
        page.classList.toggle("active", isActive);
        page.setAttribute("aria-hidden", String(!isActive));
      });
      magicRecordTabs.forEach((tab, index) => {
        const isActive = index === magicStudentPageIndex;
        tab.classList.toggle("active", isActive);
        tab.setAttribute("aria-selected", String(isActive));
      });
      if (magicStudentPageIndicator) {
        magicStudentPageIndicator.textContent = `${magicStudentPageIndex + 1} / ${total}`;
      }
    }

    function getActiveScreenId() {
      return document.querySelector(".screen.active")?.id || "mainScreen";
    }

    function refreshFieldGuideNodes() {
      fieldGuide = document.querySelector("#fieldOnboarding");
      fieldGuidePanels = [...document.querySelectorAll("[data-field-guide-panel]")];
      fieldGuideNextButton = document.querySelector("#nextFieldGuide");
      fieldGuideSkipButton = document.querySelector("#skipFieldGuide");
    }

    // Collected evidence tooltip offsets: +x right, -x left, +y down, -y up.
    const collectedEvidenceTooltipOffsets = {
      "엔지니어 공구 클램프": { x: -10, y: 30 },
      "추진 레버 결빙 기록": { x: 60, y: 60 },
      "마지막 무전 기록": { x: -130, y: 95 },
      "소독천과 장갑": { x: 40, y: 35 },
      "삭제된 의료 기록": { x: 35, y: 70 },
      "조작된 지연 타이머": { x: -45, y: 25 },
      "손상된 압력 센서": { x: -47, y: 25 },
      "접속 키카드 칩": { x: 20, y: 34 },
      "암호화된 연구 보상 계약": { x: -55, y: 20 },
      "커피 텀블러": { x: 25, y: 65 },
      "미승인 약물 앰풀": { x: 31, y: 60 }
    };

    function getCollectedEvidenceTooltip() {
      let tooltip = document.querySelector("#collectedEvidenceTooltip");
      if (tooltip) return tooltip;

      tooltip = document.createElement("div");
      tooltip.id = "collectedEvidenceTooltip";
      tooltip.className = "collected-evidence-tooltip";
      tooltip.setAttribute("role", "status");
      tooltip.setAttribute("aria-hidden", "true");
      tooltip.innerHTML = '<strong class="collected-evidence-tooltip-title"></strong>';
      document.body.appendChild(tooltip);
      return tooltip;
    }

    function showCollectedEvidenceTooltip(hotspot) {
      if (!isSpaceTheme || !hotspot.classList.contains("collected")) return;
      const tooltip = getCollectedEvidenceTooltip();
      const title = tooltip.querySelector(".collected-evidence-tooltip-title");
      const name = hotspot.dataset.evidenceName || hotspot.getAttribute("aria-label") || "수집한 증거";
      if (title) title.textContent = getEvidenceDisplayName(name);

      tooltip.classList.add("show");
      tooltip.setAttribute("aria-hidden", "false");
      const hotspotRect = hotspot.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      const margin = 14;
      const offset = collectedEvidenceTooltipOffsets[name] || { x: 0, y: 0 };
      const left = Math.min(
        window.innerWidth - tooltipRect.width / 2 - margin,
        Math.max(tooltipRect.width / 2 + margin, hotspotRect.left + hotspotRect.width / 2 + offset.x)
      );
      const preferredTop = hotspotRect.top - tooltipRect.height - 14 + offset.y;
      const top = preferredTop >= margin ? preferredTop : hotspotRect.bottom + 14 + offset.y;
      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${top}px`;
    }

    function hideCollectedEvidenceTooltip() {
      const tooltip = document.querySelector("#collectedEvidenceTooltip");
      if (!tooltip) return;
      tooltip.classList.remove("show");
      tooltip.setAttribute("aria-hidden", "true");
    }

    const detailedSpaceEvidence = {
      "추진 레버 결빙 기록": {
        kicker: "ORBIT-13 · EQUIPMENT DIAGNOSTIC",
        title: "추진 레버 결빙 기록",
        image: "/assets/space-station/evidence/thruster-freeze-record-detail.webp",
        imageAlt: "정면에서 본 추진 레버 결빙 진단 화면",
        description: "데이비드의 우주복에서 전송된 마지막 장비 진단 화면이다. 비상 추진 레버 연결부가 정체불명의 투명한 결빙 물질로 뒤덮여 있다. 레버 작동 신호는 입력됐지만 추진 가스 밸브는 열리지 않았다. 기록만으로는 결빙 물질의 정확한 성분을 확인할 수 없다."
      },
      "엔지니어 공구 클램프": {
        kicker: "ORBIT-13 · TOOL RETURN LOG",
        title: "공구함 반납 기록",
        image: "/assets/space-station/evidence/engineer-tool-clamp.webp",
        imageAlt: "엔지니어 공구 클램프",
        description: "- 사용 목적: 우주복 점검\n- 공구함 반납 시각: OST 21:37\n- 마지막 사용자 ID: ORBIT-13-MNT-0821\n- 점검 결과: 우주복 손상 및 특이 잔류물 없음"
      },
      "마지막 무전 기록": {
        kicker: "ORBIT-13 · COMMUNICATION LOG",
        title: "마지막 무전 기록",
        image: "/assets/space-station/evidence/final-radio-log.webp",
        imageAlt: "데이비드의 마지막 무전 기록 장치",
        description: "[OST 22:14]\n“오르빗-13 관제실, 데이비드다.\n외부 통신 장치 점검을 시작한다.\n안전 로프와 우주복 상태 모두 정상이다.”\n\n[OST 22:19]\n“관제실, 심박이 갑자기 불규칙해졌다.\n손에도 힘이 잘 들어가지 않아.\n우주복 문제인지 확인해 줘.”\n\n[OST 22:21]\n“비상 추진 장치를 점검 중이다.\n레버 작동 신호는 들어가는데 가스 밸브가 반응하지 않는다.”\n\n“레버 연결부에 투명한 물질이 붙어 있어.\n외부 온도에서 완전히 얼어붙은 것 같다.”\n\n[OST 22:22]\n“우주복 산소 수치가 급격히 떨어지고 있다.\n누출 경고는 없는데 잔량만 계속 감소한다.\n관제실, 즉시 복귀 허가를 요청한다.”\n\n[OST 22:23]\n“외벽 통신 장치의 고정 전력이 끊겼다!\n패널 하나가 구조물에서 이탈했다.”\n\n“외벽 패널이 안전 로프를 쳤다.\n연결 고리가 파손됐다!”\n\n“정거장에서 멀어지고 있다.\n몸이 계속 회전해… 추진 레버도 움직이지 않아.”\n\n[OST 22:24]\n“오르빗-13, 응답해.\n안전 로프가 끊어졌고 비상 추진 장치도 작동하지 않는다.”\n\n“정거장 뒤편의 통신 음영 구역(Shadow Zone)으로 진입하고 있다.\n태양광이 사라졌고 외부 온도가 계속 내려간다.\n아직 정거장 신호는 잡힌다. 구조 장비를 보내 줘..”"
      },
      "삭제된 의료 기록": {
        kicker: "ORBIT-13 · MEDICAL ARCHIVE",
        title: "삭제된 의료 기록",
        image: "/assets/space-station/evidence/deleted-medical-record.webp",
        imageAlt: "삭제된 데이비드의 의료 기록",
        description: "",
        requiresRecovery: true
      }
    };

    function setSpaceEvidenceDetail(open, evidenceName) {
      if (!isSpaceTheme) return;
      const panel = document.querySelector("#spaceEvidenceDetail");
      const overlay = document.querySelector("#spaceEvidenceDetailOverlay");
      if (!panel || !overlay) return;
      let focusRecoveryInput = false;
      if (open) {
        const detail = detailedSpaceEvidence[evidenceName];
        if (!detail) return;
        panel.dataset.evidence = evidenceName;
        const image = panel.querySelector("#spaceEvidenceDetailImage");
        const kicker = panel.querySelector("#spaceEvidenceDetailKicker");
        const title = panel.querySelector("#spaceEvidenceDetailTitle");
        const description = panel.querySelector("#spaceEvidenceDetailDescription");
        const recoveryForm = panel.querySelector("#spaceMedicalRecoveryForm");
        const recoveredRecord = panel.querySelector("#spaceMedicalRecoveredRecord");
        const recoveryError = panel.querySelector("#spaceMedicalRecoveryError");
        if (image) {
          image.src = detail.image;
          image.alt = detail.imageAlt;
        }
        if (kicker) kicker.textContent = detail.kicker;
        if (title) title.textContent = detail.title;
        if (description) {
          description.textContent = detail.description;
          description.hidden = Boolean(detail.requiresRecovery);
        }
        const recovered = detail.requiresRecovery && localStorage.getItem(spaceMedicalRecordRecoveryKey) === "1";
        if (recoveryForm) {
          recoveryForm.hidden = !detail.requiresRecovery || recovered;
          if (detail.requiresRecovery && !recovered) recoveryForm.reset();
        }
        if (recoveredRecord) recoveredRecord.hidden = !detail.requiresRecovery || !recovered;
        if (recoveryError) recoveryError.textContent = "";
        focusRecoveryInput = Boolean(detail.requiresRecovery && !recovered);
      }
      panel.classList.toggle("show", open);
      overlay.classList.toggle("show", open);
      panel.setAttribute("aria-hidden", String(!open));
      overlay.setAttribute("aria-hidden", String(!open));
      if (open) {
        hideCollectedEvidenceTooltip();
        document.querySelector(focusRecoveryInput ? "#spaceMedicalRecoveryPassword" : "#closeSpaceEvidenceDetail")?.focus();
      }
    }

    document.querySelector("#spaceMedicalRecoveryForm")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const input = form.querySelector("#spaceMedicalRecoveryPassword");
      const error = form.querySelector("#spaceMedicalRecoveryError");
      const recoveredRecord = document.querySelector("#spaceMedicalRecoveredRecord");
      if (input?.value !== "0319") {
        if (error) error.textContent = "비밀번호가 틀렸습니다.";
        if (input) {
          input.value = "";
          input.focus();
        }
        playSfx("buttonAlt", 0.38);
        return;
      }
      localStorage.setItem(spaceMedicalRecordRecoveryKey, "1");
      form.hidden = true;
      if (recoveredRecord) recoveredRecord.hidden = false;
      if (error) error.textContent = "";
      playSfx("evidence", 0.5);
    });

    function setupEvidenceScreen(screenId) {
      const screen = document.getElementById(screenId);
      if (!screen) return;

      const evidenceHotspots = [...screen.querySelectorAll(".hotspot[data-evidence-name], #hopaeHotspot, #portraitHotspot")];
      evidenceHotspots.forEach((hotspot) => {
        hotspot.classList.add("evidence-hotspot");
        if (!isSpaceTheme || hotspot.dataset.collectedTooltipBound === "true") return;
        hotspot.dataset.collectedTooltipBound = "true";
        hotspot.addEventListener("mouseenter", () => showCollectedEvidenceTooltip(hotspot));
        hotspot.addEventListener("mouseleave", hideCollectedEvidenceTooltip);
        hotspot.addEventListener("focus", () => showCollectedEvidenceTooltip(hotspot));
        hotspot.addEventListener("blur", hideCollectedEvidenceTooltip);
      });
      readStoredNames(collectedEvidenceKey).forEach((name) => {
        screen.querySelectorAll(`[data-evidence-name="${CSS.escape(name)}"]`).forEach((item) => {
          item.classList.add("collected");
          if (item instanceof HTMLButtonElement) item.disabled = !isSpaceTheme;
          item.setAttribute("aria-disabled", "true");
        });
      });
      readStoredNames(analyzedEvidenceKey).forEach((name) => {
        screen.querySelectorAll(`[data-evidence-name="${CSS.escape(name)}"]`).forEach((item) => item.classList.add("analyzed"));
      });

      if (!evidenceHotspots.length || screen.querySelector(".scene-hint")) return;
      const hint = document.createElement("button");
      hint.className = "scene-hint";
      hint.type = "button";
      hint.textContent = "힌트";
      hint.setAttribute("aria-label", "이 장면의 증거 위치 힌트");
      if (isSpaceTheme) {
        hint.textContent = "";
        const hintIcon = document.createElement("img");
        hintIcon.src = "/assets/space-station/ui-icons-v3/hint-beacon.webp";
        hintIcon.alt = "";
        hintIcon.draggable = false;
        hintIcon.style.position = "absolute";
        hintIcon.style.left = "50%";
        hintIcon.style.top = "-2px";
        hintIcon.style.width = "62px";
        hintIcon.style.height = "62px";
        hintIcon.style.objectFit = "contain";
        hintIcon.style.transform = "translateX(-50%)";
        hintIcon.style.zIndex = "1";
        hint.appendChild(hintIcon);
        const hintText = document.createElement("span");
        hintText.textContent = "힌트";
        hintText.style.position = "relative";
        hintText.style.zIndex = "2";
        hintText.style.alignSelf = "end";
        hint.appendChild(hintText);
      }
      hint.addEventListener("click", () => {
        const collectedNames = isSpaceTheme ? new Set(readStoredNames(collectedEvidenceKey)) : null;
        const remainingEvidence = isSpaceTheme
          ? [...screen.querySelectorAll(".hotspot[data-evidence-name]")]
              .filter((hotspot) => !collectedNames.has(hotspot.dataset.evidenceName || ""))
          : evidenceHotspots.filter((hotspot) => !hotspot.classList.contains("collected"));
        if (!remainingEvidence.length) {
          showToast("이 장면의 증거를 모두 찾았습니다.", { variant: "hint" });
          return;
        }
        screen.classList.remove("hint-active");
        void screen.offsetWidth;
        screen.classList.add("hint-active");
        clearTimeout(screen.hintTimer);
        screen.hintTimer = setTimeout(() => screen.classList.remove("hint-active"), 2500);
      });
      screen.appendChild(hint);
    }

    window.addEventListener("samunmong:screen-change", (event) => {
      const screenId = event.detail?.screenId || getActiveScreenId();
      hideCollectedEvidenceTooltip();
      refreshFieldGuideNodes();
      setupEvidenceScreen(screenId);
      updateCurrentLocation(screenId);
      syncMagicMapProgress();
    });

    const fieldGuideTargets = {
      "map-click": ["#openMapFromField"],
      "map-open": ["#mapPanel .map-pin-button.current", "#mapPanel .map-label.current"],
      room: ["#fieldOne .room-chip"],
      tools: ["#fieldOne .journal-chip", "#openNoteFromField", "#openBagFromField", "#fieldOne .open-tool-panel"]
    };

    function clearFieldGuideHighlights() {
      document.querySelectorAll(".field-guide-highlight").forEach((item) => item.classList.remove("field-guide-highlight"));
      document.querySelector("#mapPanel")?.classList.remove("field-guide-map-focus");
    }

    function setFieldGuideStep(step) {
      fieldGuideStep = step;
      clearFieldGuideHighlights();
      if (step) hideButtonGuides();

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
        fieldGuideNextButton.hidden = step === "map-click";
        fieldGuideNextButton.textContent = step === "tools" ? "확인" : "다음";
      }
    }

    function advanceFieldGuideAfterMap() {
      if (fieldGuideStep !== "map-open") return;
      setFieldGuideStep("room");
    }

    function isFieldGuideBlockingControls() {
      return Boolean(fieldGuide && !fieldGuide.hidden && ["room", "suspects", "tools"].includes(fieldGuideStep));
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
    const joseonThemeStartAssets = [
      "/samunmong/assets/mudeok-interaction/evidence-jeomsun-neck-exam-paper.webp",
      "/samunmong/assets/mudeok-interaction/evidence-jeomsun-hand-exam-paper.webp",
      "/samunmong/assets/suspects/dolsoe-seated.webp",
      "/samunmong/assets/suspects/chunwol-seated.webp",
      "/samunmong/assets/suspects/yoomunseok-seated.webp",
      "/samunmong/assets/suspects/mudeok-seated.webp"
    ];
    const magicThemeStartAssets = [
      "/samunmong/assets/magic-school/scenes/alchemy-lab.webp",
      "/samunmong/assets/magic-school/scenes/library.webp",
      "/samunmong/assets/magic-school/interrogation/malpoi.webp",
      "/samunmong/assets/magic-school/interrogation/malposam.webp",
      "/samunmong/assets/magic-school/interrogation/malpoil.webp"
    ];
    const spaceThemeStartAssets = [
      "/assets/space-station/backgrounds/orbit-13-airlock-evidence-v4.webp",
      "/assets/space-station/backgrounds/emergency-investigation-room-v2.webp",
      "/assets/space-station/backgrounds/medical-bay-evidence-v2.webp",
      "/assets/space-station/backgrounds/oxygen-generator-evidence-v2.webp",
      "/assets/space-station/backgrounds/data-core-evidence-v2.webp",
      "/assets/space-station/backgrounds/science-lab-evidence-v2.webp",
      "/assets/space-station/panels/log-record-panel-v2.webp",
      "/assets/space-station/panels/evidence-vault-panel-v2.webp",
      "/assets/space-station/maps/orbit-13-six-location-map.webp",
      "/assets/space-station/ui-icons-v2/emergency-investigation-v2.webp",
      "/assets/space-station/ui-icons-v3/orbit-blueprint.webp",
      "/assets/space-station/ui-icons-v3/evidence-vault.webp",
      "/assets/space-station/ui-icons-v3/log-record.webp",
      "/assets/space-station/ui-icons-v3/case-briefing.webp",
      "/assets/space-station/ui-icons-v3/final-report.webp",
      "/assets/space-station/ui-icons-v3/accuse-target.webp",
      "/assets/space-station/ui-icons-v3/hint-beacon.webp",
      "/assets/space-station/ui-buttons/space-next-button.svg",
      "/assets/space-station/characters/harry-upper.webp",
      "/assets/space-station/characters/mers-upper.webp",
      "/assets/space-station/characters/aladdindin-upper.webp",
      "/assets/space-station/characters/einspanner-upper.webp",
      "/assets/space-station/evidence/control-terminal.webp",
      "/assets/space-station/evidence/final-radio-log.webp",
      "/assets/space-station/evidence/disinfectant-cloth-glove.webp",
      "/assets/space-station/evidence/deleted-medical-record.webp",
      "/assets/space-station/evidence/damaged-pressure-sensor.webp",
      "/assets/space-station/evidence/tampered-delay-timer.webp",
      "/assets/space-station/evidence/access-keycard-chip.webp",
      "/assets/space-station/evidence/encrypted-research-contract.webp",
      "/assets/space-station/evidence/engineer-tool-clamp.webp",
      "/assets/space-station/evidence/coffee-tumbler.webp",
      "/assets/space-station/evidence/unauthorized-drug-ampoule.webp",
      "/assets/space-station/panels/digital-human-scan-v3.png",
      "/assets/space-station/loading/space-transition-bg.webp"
    ];
    const themeStartAssets = isSpaceTheme ? spaceThemeStartAssets : isMagicTheme ? magicThemeStartAssets : joseonThemeStartAssets;
    const magicLoadingArtwork =
      "url('/samunmong/assets/magic-school/loading/magic-transition-bg.webp') center / cover no-repeat, #050403";
    const spaceLoadingArtwork =
      "url('/assets/space-station/loading/space-transition-bg.webp') center / cover no-repeat, #030608";
    const magicThemeLoadingScreens = new Set([
      "briefingScreen",
      "magicAlchemyLab",
      "magicCleaningCloset",
      "magicLibrary",
      "magicRecordCrystalRoom",
      "magicDormHallway",
      "interrogationScreen"
    ]);
    const preThemeLoadingScreens = new Set(["mainScreen", "tutorialScreen", "dreamScreen"]);

    function shouldUseMagicLoading(targetScreenId) {
      if (!isMagicTheme) return false;
      const currentScreenId = getActiveScreenId();
      return magicThemeLoadingScreens.has(targetScreenId) || magicThemeLoadingScreens.has(currentScreenId);
    }

    function shouldUseSpaceLoading(targetScreenId) {
      if (!isSpaceTheme) return false;
      const currentScreenId = getActiveScreenId();
      return spaceLocationMeta[targetScreenId] || spaceLocationMeta[currentScreenId];
    }

    function setLoadingArtwork(targetScreenId) {
      if (!fade) return;
      fade.classList.remove("magic-rune-transition");
      if (preThemeLoadingScreens.has(targetScreenId)) {
        fade.style.removeProperty("background");
        return;
      }
      if (shouldUseMagicLoading(targetScreenId)) {
        fade.style.background = magicLoadingArtwork;
      } else if (shouldUseSpaceLoading(targetScreenId)) {
        fade.style.background = spaceLoadingArtwork;
      } else {
        fade.style.removeProperty("background");
      }
    }

    function showLoading(message = "이동 중...", targetScreenId) {
      setLoadingArtwork(targetScreenId);
      fade?.classList.add("show");
      if (fade) fade.textContent = message;
    }

    function hideLoading() {
      fade?.classList.remove("show");
      fade?.classList.remove("magic-rune-transition");
      fade?.style.removeProperty("background");
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

    function activateScreen(id, { rush = false } = {}) {
      const request = new CustomEvent("samunmong:screen-request", {
        cancelable: true,
        detail: { screenId: id }
      });
      const handledByReact = !window.dispatchEvent(request);

      if (!handledByReact) {
        getScreens().forEach((screen) => screen.classList.toggle("active", screen.id === id));
        window.dispatchEvent(new CustomEvent("samunmong:screen-change", { detail: { screenId: id } }));
      }

      if (rush) {
        requestAnimationFrame(() => {
          const screen = document.getElementById(id);
          screen?.classList.remove("rush-in");
          if (screen) {
            void screen.offsetWidth;
            screen.classList.add("rush-in");
          }
        });
      }
    }

    function goAfterPreload(id, assets, options = {}) {
      stopBriefingTyping();
      document.querySelector(".game-shell")?.removeAttribute("data-start-screen");
      playSfx(options.sfx || "move", options.volume ?? 0.82);
      showLoading(options.message || "이동 중...", id);

      const startedAt = Date.now();
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        const elapsed = Date.now() - startedAt;
        const delay = Math.max(0, (options.minDuration || 0) - elapsed);
        setTimeout(() => {
          activateScreen(id);
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
      showLoading(message, id);
      setTimeout(() => {
        activateScreen(id);
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
      setLoadingArtwork(id);
      fade?.classList.add("show");
      if (fade) fade.textContent = message;
      fade?.classList.add("long");
      setTimeout(() => {
        activateScreen(id, { rush: true });
        fade?.classList.remove("show");
        fade?.style.removeProperty("background");
        updateCurrentLocation(id);
        saveProgress(id);
        updateBgmForScreen(id);
        if (id === "fieldOne") maybeStartFieldGuide();
      }, 520);
      setTimeout(() => fade?.classList.remove("long"), 980);
    }

    function typeBriefing() {
      if (!briefingCopy) return;
      if (!isMagicTheme && !isSpaceTheme) {
        const discoveryLine = document.createElement("span");
        const roleLine = document.createElement("span");
        const missionLine = document.createElement("span");
        const emphasis = document.createElement("strong");
        discoveryLine.className = "briefing-copy-line briefing-copy-discovery";
        discoveryLine.textContent = "“사또님, 관아 근처에서 사람이 쓰러진 채 발견되었습니다.”";
        roleLine.className = "briefing-copy-line briefing-copy-role";
        roleLine.append(
          document.createTextNode("당신은 이 꿈에서 "),
          emphasis,
          document.createTextNode("입니다.")
        );
        missionLine.className = "briefing-copy-line";
        missionLine.textContent = "현장을 조사하여 증거를 모으고, 용의자를 심문하여 범인을 찾아야 합니다.";
        emphasis.textContent = "고을의 사또";
        clearInterval(typeBriefing.timer);
        clearTimeout(typeBriefing.decodeTimer);
        briefingCopy.replaceChildren(discoveryLine, roleLine, missionLine);
        briefingCopy.classList.add("done");
        briefingCopy.classList.remove("rune-decoding", "briefing-rise-in");
        void briefingCopy.offsetWidth;
        briefingCopy.classList.add("briefing-rise-in");
        isBriefingTyped = true;
        updateBriefingStep();
        return;
      }
      briefingCopy.textContent = "";
      briefingCopy.classList.remove("done");
      briefingCopy.classList.toggle("rune-decoding", isMagicTheme);
      isBriefingTyped = false;
      updateBriefingStep();
      let index = 0;
      const speed = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 32;

      clearInterval(typeBriefing.timer);
      clearTimeout(typeBriefing.decodeTimer);

      const writeDecodedText = () => {
        typeBriefing.timer = setInterval(() => {
        renderBriefingText(briefingText.slice(0, index));
        if (briefingText[index] && !/\s/.test(briefingText[index]) && index % 3 === 0) {
          playTypeSfx();
        }
        index += 1;

        if (index > briefingText.length) {
          clearInterval(typeBriefing.timer);
          briefingCopy.classList.add("done");
          briefingCopy.classList.remove("rune-decoding");
          isBriefingTyped = true;
          updateBriefingStep();
        }
        }, speed || 1);
      };

      if (isMagicTheme) {
        briefingCopy.textContent = makeRunePreview(briefingText);
        typeBriefing.decodeTimer = window.setTimeout(() => {
          briefingCopy.textContent = "";
          writeDecodedText();
        }, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : 720);
      } else {
        writeDecodedText();
      }
    }

    function showInitialScreenFromSetup() {
      const startScreen = entryParams.get("start") || document.querySelector(".game-shell")?.dataset.startScreen;
      const allowedScreens = new Set(["tutorialScreen", "dreamScreen", "briefingScreen", "fieldOne", "chunwolRoom", "mudeokServantRoom", "yoomunseokSarangbang", "dolsoeQuarters", "backGateCourtyard", "magicAlchemyLab", "magicCleaningCloset", "magicLibrary", "magicRecordCrystalRoom", "magicDormHallway", "spaceAirlock", "spaceMedicalBay", "spaceOxygenGenerator", "spaceDataCore", "spaceScienceLab", "interrogationScreen"]);

      if (!allowedScreens.has(startScreen)) {
        return;
      }

      activateScreen(startScreen);

      if (startScreen === "briefingScreen") {
        startBriefingSequence();
      } else if (startScreen === "dreamScreen" && entryParams.get("dreamExit") === "1") {
        showDreamNotice(
          "꿈은 아직 끝나지 않았습니다",
          "첫 번째 꿈은 멀어졌지만, 남은 두 꿈은 아직 당신을 부르고 있습니다."
        );
      }
    }

    function openResultPage() {
      const suspect = suspects[suspectIndex].name;
      const suspectId = suspects[suspectIndex].id;
      const params = new URLSearchParams({
        suspect,
        suspectId,
        theme: isSpaceTheme ? "spaceStation" : isMagicTheme ? "magicSchool" : "joseon"
      });

      playSfx("dream", 0.85);
      writeBgmState(currentBgm || bgmForScreen(getActiveScreenId()), bgmTracks[currentBgm || bgmForScreen(getActiveScreenId())]);
      showLoading("이동 중...");
      setTimeout(() => {
        navigateWithinApp(`/result?${params.toString()}`);
      }, loadingDuration);
    }

    const settingsDialog = document.querySelector("#settingsDialog");
    const exitDialog = document.querySelector("#exitDialog");
    const defaultSettings = { volume: 70, highContrast: false };
    applySettings({ ...defaultSettings, ...readStored(settingsKey, {}) });
    if (briefingTitle && isSpaceTheme) briefingTitle.textContent = "우주정거장 살인사건";
    applyMagicUiCopies();
    setMagicRecordTab("0");
    updateMagicStudentPage(0);
    renderSaveSlots();
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
      // React owns the NEW DREAM archive popup and navigation.
    });
    window.addEventListener("samunmong:new-dream-confirmed", () => {
      // Keep every theme slot intact until the player actually chooses a dream.
      // consumeNewDreamMode() then resets only that selected theme.
      conversationNotes.clear();
      renderSaveSlots();
      updateContinueButtonState();
      updateInterrogationQuestionLimitUI();
    });
    window.addEventListener("samunmong:progress-cleared", () => {
      renderSaveSlots();
      updateContinueButtonState();
    });
    on("#continueDream", "click", () => {
      if (!getValidSaveSlots().length) return;
      openSaveSlotDialog();
    });
    on("#closeSaveSlotDialog", "click", closeSaveSlotDialog);
    on("#closeSaveSlotDialogX", "click", closeSaveSlotDialog);
    document.querySelectorAll("[data-save-slot-theme]").forEach((button) => {
      button.addEventListener("click", () => {
        const slotTheme = normalizeThemeName(button.dataset.saveSlotTheme);
        const slot = getSaveSlot(slotTheme);
        if (!slot) return;
        restoreSaveSlot(slotTheme, slot);
      });
    });
    document.querySelectorAll("[data-open-settings='true']").forEach((button) => {
      button.addEventListener("click", () => settingsDialog?.classList.add("open"));
    });
    on("#volumeSetting", "input", () => {
      applyAudioVolume();
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
      consumeNewDreamMode("joseon");
      localStorage.setItem(themeKey, "joseon");
      if (activeTheme !== "joseon") {
        navigateWithinApp("/?start=briefingScreen&theme=joseon");
        return;
      }
      goAfterPreload("briefingScreen", joseonThemeStartAssets, {
        sfx: "dream",
        volume: 0.9,
        minDuration: themeStartLoadingDuration,
        maxWait: themeStartMaxWait,
        after: () => startBriefingSequence("full")
      });
    });
    on("#chooseMagicSchool", "click", () => {
      consumeNewDreamMode("magicSchool");
      localStorage.setItem(themeKey, "magicSchool");
      navigateWithinApp("/?start=briefingScreen&theme=magicSchool");
    });
    on("#chooseSpaceStation", "click", () => {
      consumeNewDreamMode("spaceStation");
      localStorage.setItem(themeKey, "spaceStation");
      navigateWithinApp("/?start=briefingScreen&theme=spaceStation");
    });
    on("#memoryOrbTrigger", "click", beginMemoryRestoration);
    document.addEventListener("click", (event) => {
      const clickTarget = event.target instanceof Element ? event.target : event.target?.parentElement;
      const recordTab = clickTarget?.closest("[data-record-card-tab]");
      if (!recordTab) return;
      setMagicRecordTab(recordTab.dataset.recordCardTab || "0");
    });
    magicStudentPrevButton?.addEventListener("click", () => updateMagicStudentPage(magicStudentPageIndex - 1));
    magicStudentNextButton?.addEventListener("click", () => updateMagicStudentPage(magicStudentPageIndex + 1));

    memoryDrawZone?.addEventListener("pointerdown", (event) => {
      if (memoryTraceComplete) return;
      event.preventDefault();
      memoryTraceSequence?.setAttribute("data-memory-trace-state", "drawing");
      memoryTracePoints = [];
      const point = getMemoryDrawPoint(event);
      if (point) memoryTracePoints.push(point);
      updateMemoryDrawPath();
      memoryDrawZone.setPointerCapture?.(event.pointerId);
    });

    memoryDrawZone?.addEventListener("pointermove", (event) => {
      if (memoryTraceComplete || !memoryDrawZone.hasPointerCapture?.(event.pointerId)) return;
      const pointerEvents = event.getCoalescedEvents?.() || [];
      const sampledEvents = pointerEvents.length > 0 ? pointerEvents : [event];
      sampledEvents.forEach((sampledEvent) => {
        const point = getMemoryDrawPoint(sampledEvent);
        if (point) memoryTracePoints.push(point);
      });
      updateMemoryDrawPath();
      if (isMemoryCircleComplete()) completeMemoryTrace();
    });

    memoryDrawZone?.addEventListener("pointerup", (event) => {
      if (memoryDrawZone.hasPointerCapture?.(event.pointerId)) {
        memoryDrawZone.releasePointerCapture(event.pointerId);
      }
      if (!memoryTraceComplete && isMemoryCircleComplete()) {
        completeMemoryTrace();
      }
    });

    memoryTraceContinue?.addEventListener("click", () => {
      briefingStepIndex = 2;
      updateBriefingStep();
    });

    document.addEventListener("click", (event) => {
      const clickTarget = event.target instanceof Element ? event.target : event.target?.parentElement;
      if (clickTarget?.closest("[data-briefing-prev-zone]")) {
        event.preventDefault();
        briefingStepIndex = isMagicTheme && briefingStepIndex === 2 ? 0 : briefingStepIndex - 1;
        updateBriefingStep();
        return;
      }
      if (clickTarget?.closest("[data-briefing-next-zone]")) {
        event.preventDefault();
        briefingStepIndex = isMagicTheme && briefingStepIndex === 0 ? 2 : briefingStepIndex + 1;
        updateBriefingStep();
        return;
      }
      if (clickTarget?.closest("#briefingPrev")) {
        briefingStepIndex = isMagicTheme && briefingStepIndex === 2 ? 0 : briefingStepIndex - 1;
        updateBriefingStep();
        return;
      }
      if (clickTarget?.closest("#briefingNext")) {
        if (briefingStepIndex === 0 && !isBriefingTyped) {
          finishBriefingTyping();
          return;
        }
        if (briefingStepIndex >= briefingPanels.length - 1) {
          startCaseButton?.click();
          return;
        }
        briefingStepIndex = isMagicTheme && briefingStepIndex === 0 ? 2 : briefingStepIndex + 1;
        updateBriefingStep();
      }
    });
    on("#startCase", "click", () => {
      if (briefingCard?.dataset.briefingMode === "deathOnly") {
        closeBriefingJournal();
        return;
      }

      ensureJoseonBriefingEvidence();

      if (isMagicTheme || isSpaceTheme || hasSeenFieldGuide()) {
        sessionStorage.removeItem(fieldGuidePendingKey);
      } else {
        sessionStorage.setItem(fieldGuidePendingKey, "1");
      }
      goRush(isSpaceTheme ? "spaceAirlock" : isMagicTheme ? "magicAlchemyLab" : "fieldOne", isSpaceTheme ? "에어록으로 이동 중..." : isMagicTheme ? "실습실로 이동 중..." : "현장으로 이동 중...");
    });
    document.addEventListener("click", (event) => {
      if (!(event.target instanceof Element) || !event.target.closest("#nextFieldGuide")) return;
      if (fieldGuideStep === "map-click") {
        openGlobalPanel("mapPanel");
        return;
      }
      if (fieldGuideStep === "map-open") {
        closeGlobalPanel();
        return;
      }
      if (fieldGuideStep === "room") {
        setFieldGuideStep("suspects");
        return;
      }
      if (fieldGuideStep === "suspects") {
        setFieldGuideStep("tools");
        return;
      }
      closeFieldGuide();
    });
    document.addEventListener("click", (event) => {
      const button = event.target instanceof Element ? event.target.closest("[data-go]") : null;
      if (!button || isFieldGuideBlockingControls()) return;
      const target = button.dataset.go;
      if (!canAccessMagicScreen(target)) {
        showToast(getMagicLockMessage(target));
        return;
      }
      const isJournalBriefing = target === "briefingScreen";
      if (isJournalBriefing && !isMagicTheme) {
        event.preventDefault();
        openBriefingJournal();
        return;
      }
      go(target, isJournalBriefing ? "사건 일지를 펼치는 중..." : "이동 중...");
      if (isJournalBriefing) {
        setTimeout(() => startBriefingSequence("deathOnly"), 340);
      }
    });
    briefingJournalCloseButton?.addEventListener("click", closeBriefingJournal);
    window.addEventListener("samunmong:briefing-journal-ready", revealBriefingJournal);
    window.addEventListener("samunmong:briefing-journal-close-request", closeBriefingJournal);
    on("#accuseButton", "click", openResultPage);

    let hopaeCollected = false;
    let portraitCollected = false;
    let pendingEvidenceName = "";
    let pendingEvidenceHotspot = null;
    let currentEvidenceForTool = "";
    let selectedToolForAnalysis = "";
    let swipeStartPoint = null;
    let swipeLastPoint = null;
    let toolAnalysisProgress = 0;
    let toolAnalysisCompleted = false;
    let toolLastMoveAt = 0;
    let toolLastDirection = 0;
    let toolDirectionChanges = 0;
    let toolPage = 0;
    let evidenceFlipped = false;
    let documentPuzzleEvidence = "";
    let tactilePuzzleBypass = false;
    let tactilePuzzleProgress = 0;
    let tactilePuzzlePointer = null;
    let rubbingStrokeStep = 0;
    let rubbingDragState = null;
    let footprintDragState = null;
    let footprintPuzzleStep = 0;
    let footprintMeasureDragState = null;
    let knotPuzzleStep = 0;
    let knotDragState = null;
    let sampleDragState = null;
    let materialPuzzleMode = "";
    let materialPuzzleTool = "";
    let materialPuzzleFolder = "";
    let materialPuzzleStage = 0;
    const placedMaterialSamples = new Set();
    let materialLastDirection = 0;
    let materialDirectDrag = null;
    let specialPuzzleMode = "";
    let specialPuzzleStep = 0;
    let specialDragState = null;
    let specialSurfaceDrag = null;
    let specialExplorerDrag = null;
    let pendingEvidenceComparison = null;
    let pendingConfrontationQuestion = "";
    let confrontationStep = 0;
    let ritualDragState = null;
    let pendingSleeveQuestion = "";
    let sleeveInspectionStep = 0;
    let sleeveInspectionBypass = false;
    const placedDocumentPieces = new Set();
    const documentPieceState = new Map();
    let draggedDocumentPiece = null;
    const documentPieceLayouts = {
      default: {
        a: { startX: 15, startY: 80, startRotation: -45, targetX: 28, targetY: 43, targetRotation: 0 },
        b: { startX: 50, startY: 82, startRotation: 45, targetX: 50, targetY: 45, targetRotation: 0 },
        c: { startX: 85, startY: 80, startRotation: 90, targetX: 72, targetY: 43, targetRotation: 0 }
      },
      honseo: {
        a: { startX: 13, startY: 80, startRotation: -45, targetX: 25, targetY: 48, targetRotation: 0 },
        b: { startX: 51, startY: 82, startRotation: 45, targetX: 50, targetY: 48, targetRotation: 0 },
        c: { startX: 87, startY: 80, startRotation: 90, targetX: 76, targetY: 48, targetRotation: 0 }
      }
    };

    function getDocumentPieceLayout(pieceId) {
      return documentPieceLayouts[documentPuzzleEvidence === "혼서 조각" ? "honseo" : "default"][pieceId];
    }
    const TOOL_NEEDED_HINT = "특정 도구를 이용해 자세히 알아봐야 할 것 같다.";

    const magicTools = {
      "마력의 시선": {
        img: "/samunmong/assets/magic-school/ui/tool-mana-vision.webp",
        note: "증거 주변에 남은 마력을 색으로 드러냅니다."
      },
      "잔류 마력 렌즈": {
        img: "/samunmong/assets/magic-school/ui/tool-residue-lens.webp",
        note: "책, 룬스톤, 수정구에 남은 미세한 마력 결을 확대합니다."
      },
      "룬 해독 펜": {
        img: "/samunmong/assets/magic-school/ui/tool-rune-pen.webp",
        note: "보안 룬과 기록 수정구의 조작 흔적을 해독합니다."
      }
    };

    const magicEvidenceData = {
      "부러진 지팡이": {
        note: "실습실 바닥에서 발견된 지팡이 조각. 붉은 화염 마력이 남아 있어 말포이를 범인처럼 보이게 한다.",
        location: "제1 연금술 실습실",
        logic: "말포이는 지팡이를 자주 부수는 학생이라 초반 의심을 받지만, 이 지팡이가 직접 버린 것인지 누가 주워 쓴 것인지 확인해야 한다.",
        relatedSuspects: ["말포이", "말포일"],
        img: "/samunmong/assets/magic-school/evidence-cutouts/broken-wand.webp",
        tool: "마력의 시선",
        toolResult: "붉은 마력이 선명하지만, 손잡이 주변의 잔류 마력은 최근 사용자의 것과 섞여 있다.\n말포이의 지팡이처럼 보이지만 누군가 주워 다시 쓴 흔적이 있다."
      },
      "화염 감지 룬스톤": {
        note: "화재를 알려야 할 룬스톤이 꺼져 있다. 표면에는 성에와 하늘색 빙결 마력이 남아 있다.",
        location: "제1 연금술 실습실",
        logic: "화재 경보가 울리지 않은 이유를 설명하는 수법 단서다. 섬세한 빙결 마법을 못 쓰는 말포이와 맞지 않는다.",
        relatedSuspects: ["말포이", "말포일"],
        img: "/samunmong/assets/magic-school/evidence-cutouts/fire-rune-stone.webp",
        tool: "룬 해독 펜",
        toolResult: "룬의 공명선이 얼음 원소에 눌려 끊겨 있다.\n화재가 난 뒤 꺼진 것이 아니라, 불이 번지기 전에 먼저 무력화된 상태다."
      },
      "기록의 수정구": {
        note: "복도 기록이 아무 일 없는 장면으로 덮여 있다. 보라색 환각 마력이 수정구 안쪽에서 흐른다.",
        location: "제1 연금술 실습실",
        logic: "누군가 현장 출입 기록을 환각으로 덮었다. 환각 마법을 다루는 말포삼과 연결된다.",
        relatedSuspects: ["말포삼", "말포일"],
        img: "/samunmong/assets/magic-school/evidence-cutouts/record-crystal.webp",
        tool: "룬 해독 펜",
        toolResult: "기록 자체가 사라진 것이 아니라, 환각층이 위에 덧씌워져 있다.\n환각 마법을 건 사람과 지시한 사람을 따로 확인해야 한다."
      },
      "금지된 마법 담배 재": {
        note: "청소도구함에서 발견된 초록 마력의 재와 환각 환타지아 잎. 덩쿨도어가 숨긴 알리바이 단서다.",
        location: "청소도구함",
        logic: "덩쿨도어는 현장 근처에 있었고 탄 냄새가 났지만, 실제로는 금지된 마법 담배를 피우고 있었다.",
        relatedSuspects: ["덩쿨도어"],
        img: "/samunmong/assets/magic-school/evidence-cutouts/magic-cigarette-ash.webp",
        tool: "마력의 시선",
        toolResult: "초록 마력이 재 주변에만 둥글게 남아 있다.\n방화의 붉은 마력과 결이 달라, 덩쿨도어의 탄 냄새는 담배 쪽에 가깝다."
      },
      "도서관 대출 기록부": {
        note: "말포일의 이름으로 보안 마법 책이 대출된 기록. 건달프의 도서관 힌트와 이어진다.",
        location: "도서관",
        logic: "말포일이 화염 감지 룬스톤의 약점을 미리 조사했다는 정황이다.",
        relatedSuspects: ["말포일"],
        img: "/samunmong/assets/magic-school/evidence-cutouts/library-loan-ledger.webp",
        tool: "잔류 마력 렌즈",
        toolResult: "기록부의 해당 줄 주변에 말포일이 자주 쓰는 잉크와 같은 보라빛 먼지가 남아 있다.\n책을 빌린 사실을 단순한 우연으로 보기 어렵다."
      },
      "빙결 흔적이 남은 반납 도서": {
        note: "보안 마법 책 표지에 룬스톤과 같은 하늘색 빙결 흔적이 남아 있다.",
        location: "도서관",
        logic: "말포일이 책 지식으로 룬스톤 무력화를 연습했다는 수법 단서다.",
        relatedSuspects: ["말포일", "말포이"],
        img: "/samunmong/assets/magic-school/evidence-cutouts/frost-returned-book.webp",
        tool: "잔류 마력 렌즈",
        toolResult: "책 표지의 빙결 마력 결이 룬스톤 표면의 흔적과 거의 같다.\n이는 단순 독서가 아니라 실제 연습 흔적이다."
      },
      "조작된 기록 수정구": {
        note: "기록 수정구실의 중심 수정구. 실습실의 수정구와 같은 보라색 환각층이 남아 있다.",
        location: "기록 수정구실",
        logic: "말포삼이 환각 마법을 걸었고, 누군가가 그에게 부탁했다는 사실로 이어진다.",
        relatedSuspects: ["말포삼", "말포일"],
        img: "/samunmong/assets/magic-school/evidence-cutouts/record-crystal.webp",
        tool: "룬 해독 펜",
        toolResult: "수정구 조작 주문은 서툴지만 목적은 분명하다.\n직접 범행을 숨기려는 사람보다, 누군가의 부탁을 받고 덮은 흔적에 가깝다."
      },
      "버려진 지팡이 조각": {
        note: "학생들 기숙사에서 발견된 버려진 지팡이 조각. 실습실 지팡이와 결이 이어진다.",
        location: "학생들 기숙사",
        logic: "말포이가 버린 지팡이를 누군가 주워 방화에 이용했을 가능성을 보여 준다.",
        relatedSuspects: ["말포이", "말포일"],
        img: "/samunmong/assets/magic-school/evidence-cutouts/discarded-wand-shard.webp",
        tool: "마력의 시선",
        toolResult: "버려진 조각에는 말포이의 강한 마력 흔적이 남아 있지만, 실습실 지팡이에는 다른 손길의 잔류 마력이 덧씌워져 있다."
      },
      "말포삼의 자백": {
        note: "말포삼이 말포일의 부탁으로 기록 수정구에 환각 마법을 걸었다고 털어놓은 진술.",
        location: "교무 조사실",
        logic: "수정구 조작의 실행자는 말포삼이지만, 지시자는 말포일이라는 결정타 증언이다.",
        relatedSuspects: ["말포삼", "말포일"],
        img: "/samunmong/assets/magic-school/evidence-cutouts/crystal-confession-vial.webp"
      }
    };


    const tools = isSpaceTheme ? {} : isMagicTheme ? magicTools : {
      "돋보기": {
        img: "/samunmong/assets/mudeok-interaction/tool-magnifying-glass.webp",
        note: "작은 글자, 긁힌 자국, 미세한 흔적을 확대합니다."
      },
      "먼지털이 붓": {
        img: "/samunmong/assets/mudeok-interaction/tool-dusting-brush.webp",
        note: "흙먼지나 재를 털어 숨은 표면을 드러냅니다."
      },
      "촛불 비추기": {
        img: "/samunmong/assets/mudeok-interaction/tool-candle-lantern.webp",
        note: "어두운 곳, 비침, 눌린 자국을 빛으로 확인합니다."
      },
      "발자국 실측줄": {
        img: "/samunmong/assets/interactions/evidence-tools/expanded/tool-footprint-measuring-cord.png",
        note: "발자국과 신발의 폭·길이·보폭을 나란히 잽니다."
      },
      "문서 맞춤판": {
        img: "/samunmong/assets/interactions/evidence-tools/expanded/tool-document-matching-board.png",
        note: "찢긴 종이의 결, 먹선과 절단면을 고정해 맞춥니다."
      },
      "혈흔 시험포": {
        img: "/samunmong/assets/interactions/evidence-tools/expanded/tool-blood-test-cloth.png",
        note: "얼룩을 시험포에 옮겨 피인지 다른 물질인지 가립니다."
      },
      "탁본 도구": {
        img: "/samunmong/assets/interactions/evidence-tools/secondary/tool-rubbing-kit.png",
        note: "종이와 먹주머니로 패인 글자와 눌린 자국을 떠냅니다."
      },
      "섬유 대조틀": {
        img: "/samunmong/assets/interactions/evidence-tools/secondary/tool-fiber-comparison-frame.png",
        note: "실의 꼬임과 광택을 나란히 고정해 비교합니다."
      },
      "먹빛 시험석": {
        img: "/samunmong/assets/interactions/evidence-tools/secondary/tool-ink-comparison-kit.png",
        note: "먹 번짐과 농도를 시험지에 옮겨 서로 대조합니다."
      },
      "증거 연결판": {
        img: "/samunmong/assets/interactions/evidence-tools/crosscheck/tool-evidence-connection-board.webp",
        note: "서로 떨어져 발견된 물건을 한 판에 고정해 연결합니다."
      },
      "흙 대조 접시": {
        img: "/samunmong/assets/interactions/evidence-tools/crosscheck/tool-soil-comparison-tray.webp",
        note: "흙과 짚 부스러기를 칸별로 걸러 이동 흔적을 대조합니다."
      },
      "상처 대조첩": {
        img: "/samunmong/assets/interactions/evidence-tools/crosscheck/tool-wound-comparison-folio.webp",
        note: "상처 기록과 붕대의 얼룩 위치를 나란히 맞춥니다."
      },
      "문서 펼침칼": {
        img: "/samunmong/assets/interactions/evidence-tools/hidden-structure/tool-document-opening-knife.webp",
        note: "붙거나 겹친 한지 층을 손상 없이 천천히 분리합니다."
      },
      "매듭 해체 송곳": {
        img: "/samunmong/assets/interactions/evidence-tools/hidden-structure/tool-knot-picking-awl.webp",
        note: "조여진 매듭을 끊지 않고 고리 순서대로 풀어냅니다."
      },
      "압흔 탁본판": {
        img: "/samunmong/assets/interactions/evidence-tools/hidden-structure/tool-pressure-rubbing-board.webp",
        note: "종이 아래에 남은 붓의 눌림과 필압을 먹가루로 떠냅니다."
      }
    };
    const isJoseonToolInteraction = !isMagicTheme && !isSpaceTheme;

    const spaceEvidenceData = spaceConfig.evidence || {};
    const evidenceData = isSpaceTheme ? spaceEvidenceData : isMagicTheme ? magicEvidenceData : window.SAMUNMONG_CONTENT?.evidenceData || {
      "호패 조각": {
        note: "점순 옆에서 발견된 신분 단서. 유문석의 물건처럼 보이지만 일부 글자가 긁혀 있다.",
        img: "/samunmong/assets/evidence-transparent/evidence-wooden-tag-transparent.webp",
        tool: "먼지털이 붓",
        toolResult: "이름 홈의 먼지를 털자 오래된 새김 위로 더 얕고 거친 새 긁힘이 드러난다."
      },
      "돌쇠의 그림": {
        note: "최춘월의 방에서 발견된 붉은 끈으로 단단히 묶인 두루마리. 펼치기 전에는 안의 그림을 알 수 없다.",
        img: "/samunmong/assets/evidence-transparent/evidence-portrait-concealed-v1.png",
        toolResultAsset: "/samunmong/assets/evidence-transparent/evidence-portrait-strokes-clean-v2.png",
        tool: "돋보기",
        toolResult: "돋보기로 보니 돌쇠의 눈매와 옷깃이 여러 번 고쳐져 있고, 그림 가장자리에는 지운 글씨의 눌린 획이 남아 있다."
      },
      "헐거워진 노리개": {
        note: "끊어진 장식과 급히 잡아챈 듯한 흔적이 남은 노리개. 누가 지녔는지 확인해야 한다.",
        img: "/samunmong/assets/evidence-transparent/evidence-norigae-transparent.webp"
      },
      "무덕의 번진 일기": {
        note: "먹이 번져 읽기 어려운 일기. 사건 전 며칠의 밤 이동과 전달 경로를 추적할 수 있다.",
        img: "/samunmong/assets/evidence-transparent/evidence-smeared-diary-clean-v2.png",
        tool: "촛불 비추기",
        toolResultAsset: "/samunmong/assets/interactions/diary-timeline-puzzle/state-2.png",
        toolResult: "번진 세 장을 펼치자 사건 전날까지의 기록이 이어진다. 무덕은 뒷문이 열린 밤을 보았고, 마지막 장에는 아씨가 돌쇠의 이름을 되물었다고 적었다. 왜 돌쇠를 물었을까?"
      },
      "진흙 묻은 짚신": {
        note: "문밖 젖은 길과 닮은 진흙이 묻은 짚신. 이동 경로를 비교할 단서다.",
        img: "/samunmong/assets/evidence-transparent/evidence-muddy-straw-shoes-clean-v2.png"
      },
      "찢어진 옷고름": {
        note: "무덕의 방 바닥에서 발견된 붉은 비단끈. 가운데가 단단히 조여 있고 한쪽 끝이 찢어져 있다.",
        img: "/samunmong/assets/evidence-transparent/evidence-torn-silk-tie-clean-v2.png",
        tool: "돋보기",
        toolResultAsset: "/samunmong/assets/interactions/silk-tension-puzzle/state-2.png",
        toolResult: "매듭을 펴자 가운데에 좁게 조여 마찰로 번들거린 자국과, 힘을 받아 한 방향으로 늘어난 찢김이 드러난다. 단순히 낡아 끊어진 끈은 아닌 것 같다."
      },
      "빈 호패 주머니": {
        note: "호패가 빠진 듯한 빈 주머니. 주인과 호패 조각의 관계를 확인할 수 있다.",
        img: "/samunmong/assets/evidence-transparent/evidence-empty-hopae-holder.webp",
        tool: "돋보기",
        toolResultAsset: "/samunmong/assets/interactions/pouch-lining-puzzle/state-2.png",
        toolResult: "안감을 끝까지 뒤집자 길쭉한 나무패 눌림과 잘린 붉은 끈 섬유가 함께 드러난다. 이 주머니에는 호패가 들어 있었고, 저절로 빠진 것이 아니라 누군가 끈을 끊어 꺼낸 것일까?"
      },
      "하인 장부": {
        note: "하인들의 출입과 심부름 기록이 적힌 장부. 장소 이동을 대조할 수 있다.",
        img: "/samunmong/assets/evidence-transparent/evidence-servant-ledger.webp"
      },
      "혼서 조각": {
        note: "춘월의 혼인을 재촉하는 문서 조각. 춘월이 자기 삶을 통제하지 못하던 처지를 보여 준다.",
        img: "/samunmong/assets/evidence-transparent/evidence-marriage-letter.webp"
      },
      "피 묻은 붕대": {
        note: "피처럼 보이는 얼룩이 남은 붕대. 상처나 몸싸움 흔적과 연결될 수 있다.",
        img: "/samunmong/assets/evidence-transparent/evidence-bloodied-bandage.webp"
      },
      "돌쇠의 팔 상처": {
        note: "심문 중 돌쇠의 소매 아래에서 확인한 상처. 붕대를 감았던 흔적과 함께 봐야 한다.",
        img: "/samunmong/assets/evidence-transparent/evidence-dolsoe-work-cut-v3.png"
      },
      "도망 보따리": {
        note: "급히 싼 듯한 보따리. 점순과 돌쇠가 떠나려 했고, 그 사실이 누군가의 감정을 건드렸는지 확인해야 한다.",
        img: "/samunmong/assets/evidence-transparent/evidence-escape-bundle.webp"
      },
      "긁힌 팔 흔적": {
        note: "심문 중 소매 아래에서 확인한 긁힌 흔적. 점순이 마지막 순간 저항하며 남긴 상처일 수 있다.",
        img: "/samunmong/assets/evidence-transparent/evidence-scratched-arm.webp"
      },
      "작은 발자국": {
        note: "뒷문 마당에 남은 작은 발자국. 젖은 돌길의 이동 경로와 맞춰볼 수 있다.",
        img: "/samunmong/assets/evidence-transparent/evidence-small-footprints.webp"
      },
      "끊어진 호패끈": {
        note: "뒷문 마당에서 발견된 짙은 붉은 꼰끈. 한쪽에는 매듭과 술이 남고, 반대쪽 끝은 거칠게 끊겨 있다.",
        img: "/samunmong/assets/evidence-transparent/evidence-cut-hopae-cord-v2.png"
      },
      "찢어진 약속 편지": {
        note: "점순의 손에서 발견된 찢어진 약속 편지. 정중한 말투가 돌쇠의 평소 말투와 맞지 않는다.",
        img: "/samunmong/assets/evidence-transparent/evidence-torn-letter-master-v5.svg"
      }
    };

    function removeUnknownSpaceEvidence() {
      if (!isSpaceTheme) return;
      const stored = readStored(collectedEvidenceKey, []);
      if (!Array.isArray(stored)) return;
      const renamedEvidence = {
        "마지막 무전 로그": "마지막 무전 기록"
      };
      const migrated = stored.map((name) => renamedEvidence[name] || name);
      const valid = [...new Set(migrated.filter((name) => typeof name === "string" && evidenceData[name]))];
      if (JSON.stringify(valid) !== JSON.stringify(stored)) {
        localStorage.setItem(collectedEvidenceKey, JSON.stringify(valid));
      }
    }

    removeUnknownSpaceEvidence();

    const joseonEvidenceImageByName = {
      "호패 조각": "/samunmong/assets/evidence-transparent/evidence-wooden-tag-transparent.webp",
      "돌쇠의 그림": "/samunmong/assets/evidence-transparent/evidence-portrait-concealed-v1.png",
      "헐거워진 노리개": "/samunmong/assets/evidence-transparent/evidence-norigae-transparent.webp",
      "무덕의 번진 일기": "/samunmong/assets/evidence-transparent/evidence-smeared-diary-clean-v2.png",
      "진흙 묻은 짚신": "/samunmong/assets/evidence-transparent/evidence-muddy-straw-shoes-clean-v2.png",
      "찢어진 옷고름": "/samunmong/assets/evidence-transparent/evidence-torn-silk-tie-clean-v2.png",
      "빈 호패 주머니": "/samunmong/assets/evidence-transparent/evidence-empty-hopae-holder.webp",
      "하인 장부": "/samunmong/assets/evidence-transparent/evidence-servant-ledger.webp",
      "혼서 조각": "/samunmong/assets/evidence-transparent/evidence-marriage-letter.webp",
      "피 묻은 붕대": "/samunmong/assets/evidence-transparent/evidence-bloodied-bandage.webp",
      "돌쇠의 팔 상처": "/samunmong/assets/evidence-transparent/evidence-dolsoe-work-cut-v3.png",
      "도망 보따리": "/samunmong/assets/evidence-transparent/evidence-escape-bundle.webp",
      "긁힌 팔 흔적": "/samunmong/assets/evidence-transparent/evidence-scratched-arm.webp",
      "작은 발자국": "/samunmong/assets/evidence-transparent/evidence-small-footprints.webp",
      "끊어진 호패끈": "/samunmong/assets/evidence-transparent/evidence-cut-hopae-cord-v2.png",
      "찢어진 약속 편지": "/samunmong/assets/evidence-transparent/evidence-torn-letter-master-v5.svg"
    };

    // Keep canonical evidence keys for saves/interrogation, but do not reveal
    // their story meaning in the inventory before the player examines them.
    const joseonUnexaminedEvidenceNames = {
      "호패 조각": "글자 지워진 나무패",
      "돌쇠의 그림": "의문의 그림",
      "무덕의 번진 일기": "먹 번진 책자",
      "진흙 묻은 짚신": "흙 묻은 짚신",
      "찢어진 옷고름": "찢긴 비단끈",
      "빈 호패 주머니": "빈 가죽 주머니",
      "하인 장부": "낡은 기록 장부",
      "혼서 조각": "글씨 적힌 종잇조각",
      "피 묻은 붕대": "붉은 얼룩 천",
      "도망 보따리": "단단히 묶인 보따리",
      "작은 발자국": "작은 신발 자국",
      "끊어진 호패끈": "끊어진 붉은 꼰끈",
      "찢어진 약속 편지": "찢어진 편지 조각"
    };

    const joseonUnexaminedEvidenceSummaries = {
      "호패 조각": "낡은 나무패의 글자 부분이 긁혀 있다.",
      "돌쇠의 그림": "붉은 끈이 단단히 감겨 안쪽이 보이지 않는다.",
      "무덕의 번진 일기": "표지와 종이에 번진 먹 때문에 내용을 읽기 어렵다.",
      "진흙 묻은 짚신": "밑창에 마르지 않은 흙이 붙어 있다.",
      "찢어진 옷고름": "찢긴 결이 고운 천 조각이다.",
      "빈 호패 주머니": "안에 무엇이 들었는지 알 수 없는 빈 주머니다.",
      "하인 장부": "몇몇 줄이 흐리고 덧칠되어 있다.",
      "혼서 조각": "글과 인장이 잘려 전체 뜻을 읽을 수 없다.",
      "피 묻은 붕대": "붉고 검게 마른 얼룩이 남아 있다.",
      "도망 보따리": "매듭이 단단해 내용물을 볼 수 없다.",
      "작은 발자국": "젖은 마당에 짧고 좁은 자국이 이어진다.",
      "끊어진 호패끈": "매듭과 술은 남아 있지만 반대쪽 끝이 끊겨 있다. 무엇에 매였던 끈인지는 알 수 없다.",
      "찢어진 약속 편지": "찢어진 글줄 몇 자만 흩어져 보인다."
    };

    function getEvidenceImage(name, fallback = "/samunmong/assets/evidence-wooden-tag.webp") {
      if (!isJoseonToolInteraction) return evidenceData[name]?.img || fallback;
      const transformed = readExaminedClues().filter((clue) => clue.source === name).at(-1);
      if (transformed?.img) return transformed.img;
      return joseonEvidenceImageByName[name] || evidenceData[name]?.img || fallback;
    }

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

    function getToolAnalysisSteps(name) {
      const data = evidenceData[name] || {};
      const primary = data.tool ? [{ tool: data.tool, result: data.toolResult, asset: data.toolResultAsset }] : [];
      const followUps = Array.isArray(data.followUpTools) ? data.followUpTools : [];
      const preferInkPuzzle = ["무덕의 번진 일기", "찢어진 약속 편지"].includes(name);
      const selectedFollowUp = preferInkPuzzle
        ? followUps.find((step) => step.tool === "먹빛 시험석")
        : followUps.at(-1);
      const decisiveFollowUp = selectedFollowUp ? [selectedFollowUp] : [];
      return primary.concat(decisiveFollowUp);
    }

    function hasCompletedToolStep(name, toolName) {
      if (evidenceData[name]?.tool === toolName && hasAnalyzedEvidence(name)) return true;
      return readStoredNames(analyzedEvidenceKey).includes(`${name}::${toolName}`);
    }

    function getPendingToolStep(name) {
      const steps = getToolAnalysisSteps(name);
      return steps.find((step) => !hasCompletedToolStep(name, step.tool)) || null;
    }

    function saveCompletedToolStep(name, toolName) {
      if (evidenceData[name]?.tool === toolName) {
        saveAnalyzedEvidence(name);
        return;
      }
      const analyzed = new Set(readStoredNames(analyzedEvidenceKey));
      analyzed.add(`${name}::${toolName}`);
      localStorage.setItem(analyzedEvidenceKey, JSON.stringify([...analyzed]));
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

    const evidenceStoryCues = {
      "점순의 목 압박 흔적": ["수법", "좁은 끈에 눌린 흔적"],
      "점순의 손톱 밑 흔적": ["저항", "몸싸움 중 남은 흔적"],
      "호패 조각": ["누명", "오래된 새김 위 새 긁힘"],
      "돌쇠의 그림": ["동기", "여러 번 고쳐 그린 초상"],
      "헐거워진 노리개": ["접촉", "장식 고리에 걸린 옷감"],
      "무덕의 번진 일기": ["진술", "도망 계획을 아는 인물"],
      "진흙 묻은 짚신": ["동선", "짚신 ≠ 작은 발자국"],
      "찢어진 옷고름": ["수법", "좁게 눌린 비단 끈"],
      "빈 호패 주머니": ["누명", "방에서 사라진 호패"],
      "하인 장부": ["동선", "지워진 출입 기록"],
      "혼서 조각": ["동기", "강요된 혼인 → 압박"],
      "피 묻은 붕대": ["상흔", "사건 전후를 알 수 없는 피"],
      "돌쇠의 팔 상처": ["상흔", "붕대를 감았던 자리"],
      "도망 보따리": ["동기", "점순·돌쇠의 도망"],
      "긁힌 팔 흔적": ["저항", "점순이 남긴 상처"],
      "작은 발자국": ["동선", "뒷문을 지난 작은 신발 자국"],
      "끊어진 호패끈": ["누명", "잘라낸 호패끈"],
      "찢어진 약속 편지": ["진술", "평소와 다른 말투"]
    };

    const evidenceStoryMeanings = {
      "점순의 목 압박 흔적": "이 폭과 닮은 끈이 따로 있는 것일까?",
      "점순의 손톱 밑 흔적": "마지막에 붙잡은 누군가의 흔적인 것 같다.",
      "호패 조각": "이름을 감추려 뒤늦게 긁어 낸 것인가?",
      "돌쇠의 그림": "여러 번 고쳐 그릴 만큼 마음에 둔 사람이 있었던 것 같다.",
      "헐거워진 노리개": "벌어진 고리에 다른 옷감이 걸린 것인가? 언제 스친 흔적인지는 더 따져봐야 한다.",
      "무덕의 번진 일기": "밤의 기척을 들은 사람이 있었던 것 같다.",
      "진흙 묻은 짚신": "작은 발자국과 맞지 않는다면 다른 동선의 흔적인가?",
      "찢어진 옷고름": "목의 흔적과 닮았지만, 정말 같은 끈인 것일까?",
      "빈 호패 주머니": "주인이 꺼낸 것일까, 누군가 몰래 가져간 것일까?",
      "하인 장부": "감추고 싶은 출입이 한 줄쯤 있었던 것 같다.",
      "혼서 조각": "원치 않은 혼인이 누군가의 마음을 뒤틀어 놓은 것일까?",
      "피 묻은 붕대": "몸싸움의 피인가, 그보다 먼저 생긴 상처의 피인가?",
      "돌쇠의 팔 상처": "붕대를 감았던 자리 같지만, 언제 생긴 상처일까?",
      "도망 보따리": "두 사람이 함께 떠날 준비를 했던 것 같다.",
      "긁힌 팔 흔적": "점순이 마지막으로 붙잡은 사람에게 남긴 것인가?",
      "작은 발자국": "누군가 뒷문을 평범하게 지나며 남긴 자국 같다. 일부러 만든 흔적으로 보이지는 않는다.",
      "끊어진 호패끈": "저절로 끊어진 것이 아니라 누군가 손을 댄 것인가?",
      "찢어진 약속 편지": "돌쇠의 말투를 흉내 낸 글은 아닐까?"
    };

    const evidenceConnections = [
      ["호패 조각", "빈 호패 주머니", "크기는 맞는다. 그렇다면 호패는 이 주머니에서 빠져나온 것인가?"],
      ["호패 조각", "끊어진 호패끈", "마찰 홈과 끈은 이어지는 듯하다. 누가 끈을 끊었을까?"],
      ["빈 호패 주머니", "끊어진 호패끈", "안쪽 섬유와 끈의 결이 닮았다. 원래 한 물건이었던 것인가?"],
      ["진흙 묻은 짚신", "작은 발자국", "크기가 맞지 않는다. 서로 다른 사람이 지나간 것일까?"],
      ["피 묻은 붕대", "돌쇠의 팔 상처", "감긴 자리는 닮았다. 하지만 이 상처가 그날 밤 생긴 것인지는 알 수 없다."],
      ["도망 보따리", "무덕의 번진 일기", "도망 준비를 눈치챈 사람이 있었던 것 같다. 이야기는 어디까지 퍼졌을까?"],
      ["찢어진 옷고름", "점순의 목 압박 흔적", "폭과 마찰 자국은 닮았다. 정말 같은 끈이 남긴 흔적일까?"],
      ["긁힌 팔 흔적", "점순의 손톱 밑 흔적", "세 흔적의 간격과 방향이 닮았다. 같은 접촉에서 남은 것일까?"]
    ];

    function getEvidenceSource(name) {
      return evidenceData[name]?.source || name;
    }

    function getEvidenceConnection(first, second) {
      const sourceA = getEvidenceSource(first);
      const sourceB = getEvidenceSource(second);
      return evidenceConnections.find(([a, b]) => (a === sourceA && b === sourceB) || (a === sourceB && b === sourceA));
    }

    function withKoreanParticle(word, pair) {
      const value = String(word || "");
      const code = value.charCodeAt(value.length - 1);
      const hasBatchim = code >= 0xac00 && code <= 0xd7a3 ? (code - 0xac00) % 28 !== 0 : false;
      const [withBatchim, withoutBatchim] = pair.split("/");
      return `${value}${hasBatchim ? withBatchim : withoutBatchim}`;
    }

    const evidenceQuestionTemplates = {
      "누명": [
        (name) => `${withKoreanParticle(name, "이/가")} 왜 현장에 있었지?`,
        () => "누가 이 물건을 옮길 수 있었나?",
        () => "사라진 호패를 마지막으로 본 때는?"
      ],
      "동선": [
        (name) => `${withKoreanParticle(name, "과/와")} 네 이동 경로가 왜 다르지?`,
        () => "뒷문을 지난 사람이 누구냐?",
        () => "사건 직전 어디에서 누구를 보았지?"
      ],
      "동기": [
        (name) => `${withKoreanParticle(name, "을/를")} 알고 있었나?`,
        () => "점순이 떠나려 한 사실을 알았나?",
        () => "혼인과 도망 계획을 누가 반대했지?"
      ],
      "수법": [
        (name) => `${withKoreanParticle(name, "은/는")} 몸싸움에서 생긴 것인가?`,
        () => "점순의 목에 남은 흔적을 설명해라.",
        () => "사건 뒤 옷과 몸을 감춘 이유는?"
      ],
      "상흔": [
        (name) => `${withKoreanParticle(name, "과/와")} 네 상처가 왜 맞지?`,
        () => "그 상처는 언제 누구에게 생겼나?",
        () => "붕대를 감춘 이유를 말해라."
      ],
      "저항": [
        (name) => `${withKoreanParticle(name, "은/는")} 점순의 저항 흔적인가?`,
        () => "사건 당시 몸싸움이 있었나?",
        () => "소매 아래 상처를 왜 숨겼지?"
      ],
      "진술": [
        (name) => `${name} 내용이 네 말과 왜 다르지?`,
        () => "이 글을 쓴 사람의 말투를 아나?",
        () => "도망 계획을 언제 처음 알았지?"
      ]
    };

    function updateEvidenceInterrogationUI(name) {
      if (themeId !== "joseon") return;
      const data = evidenceData[name] || {};
      const source = getEvidenceSource(name);
      const [role] = getEvidenceStoryCue(name, data);
      const image = document.querySelector("#presentedEvidenceImage");
      const roleBadge = document.querySelector("#presentedEvidenceRole");
      if (image) {
        image.src = getEvidenceImage(name);
        image.alt = source;
        image.hidden = false;
      }
      if (roleBadge) {
        roleBadge.textContent = role;
        roleBadge.hidden = false;
      }
      const templates = evidenceQuestionTemplates[role] || [
        (evidenceName) => `${evidenceName}을 본 적 있나?`,
        () => "이 증거와 네 진술이 어떻게 이어지지?",
        () => "이 증거에 대해 숨긴 말이 있나?"
      ];
      document.querySelectorAll(".prompt-line").forEach((button, index) => {
        button.hidden = index >= 3;
        if (index >= 3) return;
        const template = templates[index % templates.length];
        button.textContent = template(source);
        button.classList.add("evidence-question");
      });
    }

    function clearPresentedEvidence() {
      selectedEvidence = "";
      document.querySelectorAll("#evidenceList .evidence.active").forEach((item) => item.classList.remove("active"));
      const presented = document.querySelector("#presentedEvidence");
      const image = document.querySelector("#presentedEvidenceImage");
      const roleBadge = document.querySelector("#presentedEvidenceRole");
      if (presented) presented.textContent = "없음";
      if (image) {
        image.hidden = true;
        image.alt = "";
      }
      if (roleBadge) roleBadge.hidden = true;
      if (themeId === "joseon") {
        document.querySelectorAll(".prompt-line").forEach((button, index) => {
          button.hidden = false;
          button.textContent = defaultInterrogationPrompts[index] || defaultInterrogationPrompts[0];
          button.classList.remove("evidence-question");
        });
      }
    }

    function showEvidenceResponseMarker(name) {
      const marker = document.querySelector("#evidenceResponseMarker");
      if (!marker) return;
      marker.hidden = themeId !== "joseon" || !name;
      if (marker.hidden) return;
      const data = evidenceData[name] || {};
      const [role] = getEvidenceStoryCue(name, data);
      document.querySelector("#responseEvidenceImage").src = getEvidenceImage(name);
      document.querySelector("#responseEvidenceImage").alt = getEvidenceSource(name);
      document.querySelector("#responseEvidenceRole").textContent = `${role} 증거와 대면`;
      document.querySelector("#responseEvidenceMeaning").textContent = getEvidenceStoryMeaning(name, data);
    }

    function saveEvidenceConnection(first, second) {
      const linked = new Set(readStoredNames(linkedEvidenceKey));
      linked.add(evidencePairKey(getEvidenceSource(first), getEvidenceSource(second)));
      localStorage.setItem(linkedEvidenceKey, JSON.stringify([...linked]));
      updateEvidenceThreadUI();
    }

    function getUnlockedStoryConnections() {
      const linked = new Set(readStoredNames(linkedEvidenceKey));
      return evidenceConnections.filter(([first, second]) => linked.has(evidencePairKey(first, second)));
    }

    function updateEvidenceThreadUI() {
      const count = document.querySelector("#evidenceThreadCount");
      if (count) count.textContent = "0";
      const trigger = document.querySelector("#openEvidenceThread");
      trigger?.classList.remove("has-clues");
      document.querySelectorAll("#evidenceList .evidence[data-evidence]").forEach((card) => {
        card.classList.remove("story-linked");
      });
    }

    function renderEvidenceThread() {
      const list = document.querySelector("#evidenceThreadList");
      if (!list) return;
      const unlocked = getUnlockedStoryConnections();
      const examined = readExaminedClues();
      if (!unlocked.length && !examined.length) {
        list.innerHTML = `<div class="evidence-thread-empty"><b>아직 이어진 실마리가 없습니다</b><span>증거를 열고 관련 증거 하나를 골라 이어 보십시오.</span></div>`;
        return;
      }
      const examinedHtml = examined.map((clue, index) => {
        const data = evidenceData[clue.name] || { source: clue.source, note: clue.note, img: clue.img };
        const [role] = getEvidenceStoryCue(clue.name, data);
        return `<article class="evidence-thread-entry examined-thread-entry">
          <em>${String(index + 1).padStart(2, "0")}</em>
          <div class="examined-thread-flow">
            <span><img src="${escapeHtml(getEvidenceImage(clue.source, clue.img))}" alt=""><b>${escapeHtml(clue.source)}</b></span>
            <i aria-hidden="true">→</i>
            <span><img src="${escapeHtml(clue.img)}" alt=""><b>${escapeHtml(clue.note)}</b></span>
          </div>
          <strong><small>${escapeHtml(role)}</small>${escapeHtml(getEvidenceStoryMeaning(clue.name, data))}</strong>
        </article>`;
      }).join("");
      const linkedHtml = unlocked.map(([first, second, conclusion], index) => {
        const firstData = evidenceData[first] || {};
        const secondData = evidenceData[second] || {};
        return `<article class="evidence-thread-entry">
          <em>${String(examined.length + index + 1).padStart(2, "0")}</em>
          <div class="evidence-thread-pair">
            <span><img src="${escapeHtml(getEvidenceImage(first))}" alt=""><b>${escapeHtml(first)}</b></span>
            <i aria-hidden="true">＋</i>
            <span><img src="${escapeHtml(getEvidenceImage(second))}" alt=""><b>${escapeHtml(second)}</b></span>
          </div>
          <strong>${escapeHtml(conclusion)}</strong>
        </article>`;
      }).join("");
      list.innerHTML = examinedHtml + linkedHtml;
    }

    function getEvidenceStoryCue(name, data) {
      const cue = evidenceStoryCues[data.source || name] || ["단서", "사건과 연결"];
      return cue;
    }

    function getEvidenceStoryMeaning(name, data) {
      return evidenceStoryMeanings[data.source || name] || "다른 증거와 이어지는 단서";
    }

    function isEvidenceMeaningRevealed(name, data = evidenceData[name] || {}) {
      if (data.derived) return true;
      if (name === "끊어진 호패끈") {
        return readExaminedClues().some((clue) => clue.source === name);
      }
      if (!data.tool) return true;
      const source = data.source || name;
      return readExaminedClues().some((clue) => clue.source === source);
    }

    function getEvidenceDisplayName(name) {
      if (isJoseonToolInteraction && !isEvidenceMeaningRevealed(name)) {
        return joseonUnexaminedEvidenceNames[name] || "정체 모를 물건";
      }
      if (isJoseonToolInteraction) {
        const transformed = readExaminedClues().filter((clue) => clue.source === name).at(-1);
        if (transformed?.name) return transformed.name;
      }
      return name;
    }

    function getEvidenceCardSummary(name, data = evidenceData[name] || {}) {
      if (isJoseonToolInteraction && !isEvidenceMeaningRevealed(name, data)) {
        return joseonUnexaminedEvidenceSummaries[name] || "도구로 살펴봐야 정체를 알 수 있다.";
      }
      if (isJoseonToolInteraction) {
        const transformed = readExaminedClues().filter((clue) => clue.source === name).at(-1);
        if (transformed?.note) return transformed.note;
      }
      return sentenceBreakText(data.note || "현장에서 발견된 단서입니다.").split("\n").find(Boolean) || "";
    }

    function refreshEvidenceCard(name) {
      const card = [...document.querySelectorAll("#evidenceList .evidence[data-evidence]")]
        .find((item) => item.dataset.evidence === name);
      if (!card) return;
      const data = evidenceData[name] || {};
      const revealed = isEvidenceMeaningRevealed(name, data);
      card.dataset.storyRole = revealed ? getEvidenceStoryCue(name, data)[0] : "???";
      card.classList.toggle("meaning-revealed", revealed);
      card.classList.toggle("meaning-unknown", !revealed);
      card.innerHTML = evidenceCardHtml(name);
    }

    function showToolConclusion(name, factText = "", meaningText = "") {
      const panel = document.querySelector("#toolConclusion");
      if (!panel) return;
      const data = evidenceData[name] || {};
      const [role, storyBeat] = getEvidenceStoryCue(name, data);
      const fact = sentenceBreakText(factText || data.note || storyBeat).split("\n").find(Boolean) || storyBeat;
      panel.hidden = false;
      document.querySelector("#toolConclusionRole").textContent = role;
      document.querySelector("#toolConclusionFact").textContent = fact;
      document.querySelector("#toolConclusionMeaning").textContent = meaningText || getEvidenceStoryMeaning(name, data);
    }

    function hideToolConclusion() {
      const panel = document.querySelector("#toolConclusion");
      if (panel) panel.hidden = true;
    }

    function matchesEvidenceStoryFilter(role, filter) {
      if (filter === "all") return true;
      if (filter === "수법") return ["수법", "상흔", "저항"].includes(role);
      return role === filter;
    }

    function setEvidenceStoryFilter(filter = "all") {
      const bag = document.querySelector("#evidenceBagPop");
      const filters = document.querySelector("#evidenceStoryFilters");
      if (!bag || !filters) return;

      bag.classList.toggle("story-filtering", filter !== "all");
      filters.querySelectorAll("[data-story-filter]").forEach((button) => {
        const isActive = button.dataset.storyFilter === filter;
        button.classList.toggle("active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
      });

      document.querySelectorAll("#evidenceList .evidence-location-section").forEach((section) => {
        let visibleCount = 0;
        section.querySelectorAll(".evidence[data-evidence]").forEach((card) => {
          const visible = matchesEvidenceStoryFilter(card.dataset.storyRole || "단서", filter);
          card.classList.toggle("story-filter-hidden", !visible);
          if (visible) visibleCount += 1;
        });
        section.classList.toggle("story-section-hidden", filter !== "all" && visibleCount === 0);
        const count = section.querySelector(".evidence-location-head span");
        if (filter !== "all" && count) count.textContent = `${visibleCount}점`;
      });

      if (filter === "all") {
        updateEvidenceLocationCounts();
        setActiveEvidenceLocation(getActiveEvidenceLocation() || document.querySelector("#evidenceLocationTabs [data-evidence-location]")?.dataset.evidenceLocation);
      }
    }

    document.querySelector("#evidenceStoryFilters")?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-story-filter]");
      if (!button) return;
      playSfx("buttonAlt", 0.48);
      setEvidenceStoryFilter(button.dataset.storyFilter || "all");
    });

    function evidenceCardHtml(name) {
      const data = evidenceData[name] || {};
      const summary = getEvidenceCardSummary(name, data);
      const meaningRevealed = isEvidenceMeaningRevealed(name, data);
      const stateFrame = data.derived
        ? data.isNew
          ? "/samunmong/assets/interactions/sato-skills/inventory-states/new.png"
          : "/samunmong/assets/interactions/sato-skills/inventory-states/resolved.png"
        : meaningRevealed
          ? "/samunmong/assets/interactions/sato-skills/inventory-states/resolved.png"
          : "/samunmong/assets/interactions/sato-skills/inventory-states/basic.png";
      return `
        <span class="evidence-visual">
          <img class="evidence-thumb" src="${escapeHtml(getEvidenceImage(name))}" alt="">
          <img class="evidence-state-frame" src="${stateFrame}" alt="">
        </span>
        <span class="evidence-card-copy">
          <span class="evidence-kind-mark">${data.derived ? data.isNew ? "새 증좌" : "검험 증좌" : meaningRevealed ? "감식 완료" : "미확인 증거"}</span>
          <strong>${escapeHtml(getEvidenceDisplayName(name))}</strong>
          <span class="evidence-summary">${escapeHtml(summary)}</span>
        </span>`;
    }

    function getExaminedClueName(evidenceName, toolName) {
      if (evidenceName === "무덕의 번진 일기" && toolName === "촛불 비추기") {
        return "일기 속 밤 기록";
      }
      if (evidenceName === "빈 호패 주머니" && toolName === "돋보기") {
        return "주머니 속 호패 자국";
      }
      if (evidenceName === "찢어진 옷고름" && toolName === "돋보기") {
        return "비단끈의 조임 흔적";
      }
      if (evidenceName === "끊어진 호패끈" && toolName === "호패 조각과 대조") {
        return "호패에서 끊긴 매듭끈";
      }
      const source = String(evidenceName || "증거")
        .replace(/^(무덕|돌쇠|춘월|유문석)의\s*/, "")
        .replace(/피 묻은\s*/, "");
      const findingByTool = {
        "돋보기": "확대 흔적",
        "먼지털이 붓": "숨은 가루",
        "촛불 비추기": "배면 기록",
        "발자국 실측줄": "치수 대조",
        "문서 맞춤판": "복원 문서",
        "혈흔 시험포": "혈흔 반응",
        "탁본 도구": "새김 탁본",
        "섬유 대조틀": "섬유 대조",
        "먹빛 시험석": "먹빛 대조",
        "증거 연결판": "연결 관계",
        "흙 대조 접시": "토질 대조",
        "상처 대조첩": "상흔 대조",
        "문서 펼침칼": "숨은 종이층",
        "매듭 해체 송곳": "매듭 속 흔적",
        "압흔 탁본판": "눌린 필획"
      };
      return `${source} · ${findingByTool[toolName] || "검험 흔적"}`;
    }

    function readExaminedClues() {
      const stored = readStored(examinedCluesKey, []);
      if (!Array.isArray(stored)) return [];
      const valid = stored.filter((item) => {
        if (!item || typeof item.name !== "string" || typeof item.source !== "string" || typeof item.tool !== "string") return false;
        return hasCompletedToolStep(item.source, item.tool);
      }).map((item) => {
        if (item.source === "돌쇠의 그림") {
          return { ...item, img: "/samunmong/assets/evidence-transparent/evidence-portrait-strokes-clean-v2.png" };
        }
        return item;
      });
      if (JSON.stringify(valid) !== JSON.stringify(stored)) {
        localStorage.setItem(examinedCluesKey, JSON.stringify(valid));
        const hasAnyCompletedAnalysis = readStoredNames(analyzedEvidenceKey).length > 0;
        if (!valid.length && stored.length && !hasAnyCompletedAnalysis) {
          localStorage.removeItem(linkedEvidenceKey);
        }
      }
      return valid;
    }

    function registerExaminedClue(evidenceName, toolName, resultText, resultAsset) {
      const name = getExaminedClueName(evidenceName, toolName);
      const note = sentenceBreakText(resultText).split("\n").find(Boolean) || "검험으로 새 흔적을 확인했다.";
      const clue = {
        name,
        source: evidenceName,
        tool: toolName,
        note,
        img: resultAsset || getEvidenceImage(evidenceName),
        isNew: true
      };
      const saved = readExaminedClues().filter((item) => item.name !== name);
      saved.push(clue);
      localStorage.setItem(examinedCluesKey, JSON.stringify(saved));
      evidenceData[name] = {
        note,
        location: "검험 증좌",
        img: clue.img,
        derived: true,
        isNew: true,
        source: evidenceName
      };
      refreshEvidenceCard(evidenceName);
      document.querySelectorAll(`#toolEvidenceList [data-evidence="${CSS.escape(evidenceName)}"]`).forEach((item) => item.remove());
      return name;
    }

    function restoreExaminedClues() {
      const clues = readExaminedClues();
      const known = new Set(clues.map((clue) => `${clue.source}::${clue.tool}`));
      readStoredNames(analyzedEvidenceKey).forEach((storedName) => {
        const [source, storedTool] = storedName.split("::");
        const tool = storedTool || evidenceData[source]?.tool;
        if (!source || !tool || known.has(`${source}::${tool}`) || !evidenceData[source]) return;
        const step = getToolAnalysisSteps(source).find((item) => item.tool === tool);
        const resultText = step?.result || evidenceData[source].toolResult || "검험으로 새 흔적을 확인했다.";
        clues.push({
          name: getExaminedClueName(source, tool),
          source,
          tool,
          note: sentenceBreakText(resultText).split("\n").find(Boolean),
          img: step?.asset || evidenceData[source].toolResultAsset || evidenceData[source].img,
          isNew: false
        });
        known.add(`${source}::${tool}`);
      });
      localStorage.setItem(examinedCluesKey, JSON.stringify(clues));
      clues.forEach((clue) => {
        evidenceData[clue.name] = {
          note: clue.note,
          location: "검험 증좌",
          img: clue.img,
          derived: true,
          isNew: Boolean(clue.isNew),
          source: clue.source
        };
        refreshEvidenceCard(clue.source);
      });
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
        setEvidenceStoryFilter("all");
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
      document.querySelectorAll(`[data-evidence-name="${name}"]`).forEach((item) => {
        item.classList.add("collected");
        if (item instanceof HTMLButtonElement) item.disabled = !isSpaceTheme;
        item.setAttribute("aria-disabled", "true");
      });
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
      unlockCollectedEvidenceConnections();
      playSfx("bag", 0.7);
    }

    function unlockCollectedEvidenceConnections() {
      if (!isJoseonToolInteraction) return;
      const collected = new Set(readStoredNames(collectedEvidenceKey));
      const linked = new Set(readStoredNames(linkedEvidenceKey));
      let changed = false;
      evidenceConnections.forEach(([first, second]) => {
        if (!collected.has(first) || !collected.has(second)) return;
        const key = evidencePairKey(first, second);
        if (linked.has(key)) return;
        linked.add(key);
        changed = true;
      });
      if (changed) localStorage.setItem(linkedEvidenceKey, JSON.stringify([...linked]));
    }

    function ensureJoseonBriefingEvidence() {
      if (isMagicTheme || isSpaceTheme) return;
      ["점순의 목 압박 흔적", "점순의 손톱 밑 흔적"].forEach((name) => {
        if (readStoredNames(collectedEvidenceKey).includes(name)) return;
        saveCollectedEvidence(name);
        addEvidenceCardToInterrogation(name);
      });
    }

    function restoreSavedInvestigation() {
      ensureJoseonBriefingEvidence();
      const collectedEvidence = readStoredNames(collectedEvidenceKey);
      const analyzedEvidence = new Set(readStoredNames(analyzedEvidenceKey));

      collectedEvidence.forEach((name) => {
        addEvidenceToNote(name);
        addEvidenceCardToInterrogation(name);
        addEvidenceToToolPanel(name);
        markEvidenceCollectedInScene(name);
      });
      restoreExaminedClues();

      analyzedEvidence.forEach((name) => {
        const data = evidenceData[name];
        if (!data) return;

        addObservationToNote(`${name} 추가 분석`, data.toolResult || "도구로 추가 분석을 마쳤다.");
        document.querySelectorAll(`[data-evidence-name="${name}"]`).forEach((item) => item.classList.add("analyzed"));
        document.querySelectorAll(`#toolEvidenceList [data-evidence="${name}"]`).forEach((item) => item.classList.add("analyzed"));
      });
      unlockCollectedEvidenceConnections();
    }

    function setAnalysisTarget(name) {
      currentEvidenceForTool = name;
      evidenceFlipped = false;
      resetToolInteraction(true);
      document.querySelector("#analysisTarget").textContent = getEvidenceDisplayName(name);
      document.querySelectorAll("#toolEvidenceList .tool-evidence-option").forEach((item) => {
        item.classList.toggle("selected", item.dataset.evidence === name);
      });
      updateToolPreview(name);
    }

    function evidencePairKey(firstName, secondName) {
      return [firstName, secondName].sort((a, b) => a.localeCompare(b, "ko")).join("::");
    }

    const evidencePairComparisons = new Map([
      [["호패 조각", "빈 호패 주머니"], {
        result: "주머니 안쪽의 눌린 자리와 호패 조각의 폭이 맞는다.",
        asset: "/samunmong/assets/interactions/evidence-tools/crosscheck/result-hopae-three-way-link.webp"
      }],
      [["호패 조각", "끊어진 호패끈"], {
        result: "끊어진 끝을 호패 구멍에 대자 끈의 굵기와 오래 눌린 마찰 홈이 맞는다. 이 끈은 호패에 매여 있던 끈인 것 같다.",
        asset: "/samunmong/assets/interactions/hopae-thread-puzzle/state-2.png"
      }],
      [["진흙 묻은 짚신", "작은 발자국"], {
        result: "뒤꿈치를 맞춰 겹치자 짚신이 발자국보다 길고 폭도 넓다.",
        asset: "/samunmong/assets/interactions/evidence-tools/expanded/result-footprint-shoe-mismatch-v3.png"
      }],
      [["피 묻은 붕대", "돌쇠의 팔 상처"], {
        result: "감긴 방향은 돌쇠의 팔과 닮았다. 그러나 한 줄로 아문 상처는 손톱에 긁힌 흔적과 달라 보인다.",
        asset: "/samunmong/assets/interactions/evidence-tools/crosscheck/result-bandage-work-cut-v2.png"
      }],
      [["찢어진 옷고름", "점순의 목 압박 흔적"], {
        result: "옷고름의 폭과 눌린 마찰 자국이 목에 남은 좁은 압박 흔적과 맞는다.",
        asset: "/samunmong/assets/interactions/evidence-tools/expanded/result-fiber-comparison.png"
      }],
      [["긁힌 팔 흔적", "점순의 손톱 밑 흔적"], {
        result: "세 흔적의 간격과 방향이 닮았다. 같은 접촉에서 남은 것일까?",
        asset: "/samunmong/assets/interactions/evidence-tools/crosscheck/result-nail-trace-scratch-v2.png"
      }]
    ].map(([names, comparison]) => [evidencePairKey(names[0], names[1]), comparison]));

    function compareEvidencePair(firstName, secondName) {
      if (!firstName || !secondName || firstName === secondName) return;
      const key = evidencePairKey(firstName, secondName);
      const comparison = evidencePairComparisons.get(key);
      if (!comparison) {
        playSfx("buttonAlt", 0.42);
        showToast("연결되지 않음");
        return;
      }
      openRedThreadPuzzle(firstName, secondName, key, comparison);
    }

    function addEvidenceToToolPanel(name) {
      const list = document.querySelector("#toolEvidenceList");
      if (!list) return;
      const data = evidenceData[name] || {};
      if (!data.tool) return;
      if (getToolAnalysisSteps(name).some((step) => hasCompletedToolStep(name, step.tool))) return;

      list.querySelector(".evidence-empty")?.remove();
      const exists = [...list.children].some((item) => item.dataset.evidence === name);
      if (exists) return;

      const button = document.createElement("button");
      button.className = `tool-evidence-option${getToolAnalysisSteps(name).length > 0 && !getPendingToolStep(name) ? " analyzed" : ""}`;
      button.type = "button";
      button.dataset.evidence = name;
      button.draggable = isJoseonToolInteraction;
      button.innerHTML = `<img src="${escapeHtml(getEvidenceImage(name))}" alt=""><span><strong>${escapeHtml(getEvidenceDisplayName(name))}</strong></span>`;
      button.addEventListener("click", () => setAnalysisTarget(name));
      button.addEventListener("dragstart", (event) => {
        event.dataTransfer?.setData("text/x-samunmong-evidence", name);
        if (event.dataTransfer) event.dataTransfer.effectAllowed = "link";
        showToast(`${getEvidenceDisplayName(name)} · 다른 증거에 겹쳐 보기`);
      });
      button.addEventListener("dragover", (event) => {
        const sourceName = event.dataTransfer?.types.includes("text/x-samunmong-evidence");
        if (!sourceName) return;
        event.preventDefault();
        if (event.dataTransfer) event.dataTransfer.dropEffect = "link";
      });
      button.addEventListener("drop", (event) => {
        event.preventDefault();
        const sourceName = event.dataTransfer?.getData("text/x-samunmong-evidence");
        compareEvidencePair(sourceName, name);
      });
      if (readStoredNames(linkedEvidenceKey).some((key) => key.split("::").includes(name))) button.classList.add("linked");
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
      const revealImage = document.querySelector("#toolRevealImage");
      const title = document.querySelector("#toolPreviewTitle");
      const note = document.querySelector("#toolPreviewNote");
      if (!image || !title || !note) return;
      const analyzed = Boolean(name && hasAnalyzedEvidence(name));
      const steps = getToolAnalysisSteps(name);
      const pendingStep = getPendingToolStep(name);
      const allStepsComplete = steps.length > 0 && !pendingStep;

      image.src = getEvidenceImage(name);
      if (revealImage) revealImage.src = image.src;
      image.alt = name ? `${name} 확대 이미지` : "";
      title.textContent = name ? getEvidenceDisplayName(name) : "증거를 선택하세요";
      note.textContent = analyzed
        ? allStepsComplete
          ? "분석 완료 · 자세한 내용은 기록장에 저장됨"
          : `한 번 더 확인 가능 · ${pendingStep?.tool || "추가 도구"}`
        : name
          ? "반응할 것 같은 도구를 골라 증거 위를 한 번 훑으십시오."
          : "왼쪽에서 증거를 고르십시오.";
      const examinedClue = readExaminedClues().slice().reverse().find((clue) => clue.source === name);
      if (examinedClue) {
        const clueData = evidenceData[examinedClue.name] || { source: examinedClue.source, note: examinedClue.note };
        showToolConclusion(examinedClue.name, examinedClue.note, getEvidenceStoryMeaning(examinedClue.name, clueData));
      } else {
        hideToolConclusion();
      }
      const preview = document.querySelector(".tool-preview");
      preview?.classList.remove("revealed", "wrong-tool");
      preview?.classList.toggle("revealed", analyzed);
      document.querySelectorAll(`#toolEvidenceList [data-evidence="${name}"]`).forEach((item) => {
        item.classList.toggle("analyzed", allStepsComplete);
      });
      const target = document.querySelector("#analysisTarget");
      if (target && name) {
        const evidenceButtons = [...document.querySelectorAll("#toolEvidenceList .tool-evidence-option")];
        const completeCount = evidenceButtons.filter((button) => getToolAnalysisSteps(button.dataset.evidence).length > 0 && !getPendingToolStep(button.dataset.evidence)).length;
        target.textContent = allStepsComplete
          ? `${completeCount}/${evidenceButtons.length} · 완료`
          : pendingStep
            ? `${completeCount}/${evidenceButtons.length} · ${pendingStep.tool}`
            : name;
      }
      requestAnimationFrame(syncEvidenceShadowBounds);
      setTimeout(syncEvidenceShadowBounds, 80);
      renderTools();
    }

    function flipCurrentEvidence() {
      const data = evidenceData[currentEvidenceForTool] || {};
      if (!data.reverseImg) {
        showToast("뒤집어 볼 면이 없습니다");
        return;
      }
      evidenceFlipped = !evidenceFlipped;
      const image = document.querySelector("#toolPreviewImage");
      const revealImage = document.querySelector("#toolRevealImage");
      const nextImage = evidenceFlipped ? data.reverseImg : getEvidenceImage(currentEvidenceForTool);
      if (image) image.src = nextImage;
      if (revealImage) revealImage.src = nextImage;
      const title = document.querySelector("#toolPreviewTitle");
      if (title) {
        const displayName = getEvidenceDisplayName(currentEvidenceForTool);
        title.textContent = evidenceFlipped ? `${displayName} · 뒷면` : displayName;
      }
      const note = document.querySelector("#toolPreviewNote");
      if (note) note.textContent = evidenceFlipped ? "뒷면의 흔적이 드러났습니다." : "앞면으로 되돌렸습니다.";
      playSfx("buttonAlt", 0.58);
      showToast(evidenceFlipped ? "증거 뒤집기" : "앞면 확인");
      requestAnimationFrame(syncEvidenceShadowBounds);
    }

    function addEvidenceCardToInterrogation(name) {
      const list = document.querySelector("#evidenceList");
      if (isSpaceTheme && !evidenceData[name]) return;
      const data = evidenceData[name] || {};
      document.querySelector("#emptyInterrogationEvidence")?.remove();
      const existing = [...list.querySelectorAll(".evidence")].find((item) => item.dataset.evidence === name);
      if (existing) {
        existing.classList.remove("hidden");
        refreshEvidenceCard(name);
        updateEvidenceLocationCounts();
        return;
      }

      const location = getEvidenceLocation(name);
      const sectionGrid = getEvidenceLocationSection(list, location);
      const button = document.createElement("button");
      const meaningRevealed = isEvidenceMeaningRevealed(name, data);
      button.className = `evidence evidence-card${data.derived ? " examined-evidence" : " field-evidence"}${data.isNew ? " new-evidence" : ""}${meaningRevealed ? " meaning-revealed" : " meaning-unknown"}`;
      button.type = "button";
      button.dataset.evidence = name;
      button.dataset.location = location;
      button.dataset.storyRole = meaningRevealed ? getEvidenceStoryCue(name, data)[0] : "???";
      button.innerHTML = evidenceCardHtml(name);
      button.addEventListener("click", () => {
        if (isSpaceTheme && detailedSpaceEvidence[name]) {
          setSpaceEvidenceDetail(true, name);
          playSfx("buttonAlt", 0.48);
          return;
        }
        if (isJoseonToolInteraction) {
          selectedEvidence = name;
          document.querySelectorAll("#evidenceList .evidence").forEach((item) => item.classList.toggle("active", item === button));
          showEvidenceStoryPreview(name);
          playSfx("paper", 0.48);
          return;
        }
        selectEvidence(button);
      });
      sectionGrid.appendChild(button);
      updateEvidenceLocationCounts();
      setActiveEvidenceLocation(location);
    }

    function selectEvidence(button) {
      if (button.closest("#evidenceList")) return;
      document.querySelectorAll(".evidence").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      selectedEvidence = button.dataset.evidence;
      const selectedData = evidenceData[selectedEvidence];
      if (selectedData?.derived && selectedData.isNew) {
        selectedData.isNew = false;
        const clues = readExaminedClues();
        const savedClue = clues.find((clue) => clue.name === selectedEvidence);
        if (savedClue) savedClue.isNew = false;
        localStorage.setItem(examinedCluesKey, JSON.stringify(clues));
        button.classList.remove("new-evidence");
        button.querySelector(".evidence-kind-mark").textContent = "검험 증좌";
        button.querySelector(".evidence-state-frame").src = "/samunmong/assets/interactions/sato-skills/inventory-states/resolved.png";
      }
      playSfx("buttonAlt", 0.62);
      const presented = document.querySelector("#presentedEvidence");
      if (presented) presented.textContent = getEvidenceDisplayName(selectedEvidence);
      updateEvidenceInterrogationUI(selectedEvidence);
      showToast(`증거 선택: ${getEvidenceDisplayName(selectedEvidence)}`);
    }

    function showEvidenceStoryPreview(name) {
      const preview = document.querySelector("#evidenceStoryPreview");
      const data = evidenceData[name] || {};
      if (!preview) return;
      const [role, fact] = getEvidenceStoryCue(name, data);
      const meaningRevealed = isEvidenceMeaningRevealed(name, data);
      preview.hidden = false;
      document.querySelector("#evidencePreviewKind").textContent = data.derived ? "검험으로 얻은 증좌" : meaningRevealed ? `감식으로 확인한 ${role} 증거` : "아직 의미를 모르는 현장 증거";
      document.querySelector("#evidencePreviewTitle").textContent = getEvidenceDisplayName(data.source || name);
      document.querySelector("#evidencePreviewImage").src = getEvidenceImage(name);
      document.querySelector("#evidencePreviewImage").alt = name;
      document.querySelector("#evidencePreviewObject").textContent = getEvidenceDisplayName(data.source || name);
      const directAction = joseonDirectEvidenceInteractions[name];
      const directActionButton = document.querySelector("#evidenceDirectAction");
      const interactionComplete = directAction ? hasCompletedToolStep(name, directAction.tool) : false;
      document.querySelector("#evidencePreviewFact").textContent = meaningRevealed ? fact : directAction ? "직접 펼치거나 맞추면 숨은 내용이 드러납니다." : getEvidenceCardSummary(name, data);
      document.querySelector("#evidencePreviewRole").textContent = meaningRevealed ? `${role} 증거` : "???";
      document.querySelector("#evidencePreviewMeaning").textContent = meaningRevealed ? getEvidenceStoryMeaning(name, data) : directAction ? "직접 살펴보면 이 증거가 남긴 의문이 열립니다." : "다른 증거와 진술에 제시해 의미를 확인할 수 있습니다.";
      if (directActionButton) {
        directActionButton.hidden = !directAction || interactionComplete;
        directActionButton.textContent = directAction?.label || "직접 살펴보기";
        directActionButton.dataset.evidence = directAction ? name : "";
      }
      renderEvidencePeople(name);
      const connectionResult = document.querySelector("#evidenceConnectionResult");
      if (connectionResult) {
        connectionResult.hidden = true;
        connectionResult.classList.remove("no-connection", "connected");
      }

      const relatedRow = document.querySelector("#evidenceRelatedRow");
      const related = [];
      const relatedSources = new Set([data.source || name]);
      const collectedCards = [...document.querySelectorAll("#evidenceList .evidence[data-evidence]")];
      collectedCards.sort((a, b) => Number(Boolean(getEvidenceConnection(name, b.dataset.evidence))) - Number(Boolean(getEvidenceConnection(name, a.dataset.evidence))));
      collectedCards.forEach((card) => {
        const cardData = evidenceData[card.dataset.evidence] || {};
        const source = cardData.source || card.dataset.evidence;
        const matchesRole = matchesEvidenceStoryFilter(card.dataset.storyRole || "단서", role === "상흔" || role === "저항" ? "수법" : role);
        if ((!matchesRole && !getEvidenceConnection(name, card.dataset.evidence)) || relatedSources.has(source) || related.length >= 3) return;
        relatedSources.add(source);
        related.push(card);
      });
      const collected = new Set(readStoredNames(collectedEvidenceKey));
      const automaticConnections = evidenceConnections.filter(([first, second]) => {
        const source = data.source || name;
        return (first === source || second === source) && collected.has(first) && collected.has(second);
      });
      relatedRow.innerHTML = automaticConnections.length ? `<span>함께 모여 자동으로 이어진 증거</span>` : "";
      automaticConnections.forEach(([first, second, conclusion]) => {
        const relatedButton = document.createElement("button");
        relatedButton.type = "button";
        relatedButton.className = "connected";
        relatedButton.textContent = first === (data.source || name) ? second : first;
        relatedButton.addEventListener("click", () => {
          const other = first === (data.source || name) ? second : first;
          connectEvidenceClues(name, other, relatedButton);
          document.querySelector("#evidenceConnectionText").textContent = conclusion;
        });
        relatedRow.appendChild(relatedButton);
      });
      if (automaticConnections.length) {
        const [first, second, conclusion] = automaticConnections[0];
        connectEvidenceClues(first, second);
        document.querySelector("#evidenceConnectionText").textContent = conclusion;
      }
      if (isJoseonToolInteraction) return;
      related.forEach((card) => {
        const relatedButton = document.createElement("button");
        relatedButton.type = "button";
        relatedButton.textContent = evidenceData[card.dataset.evidence]?.source || card.dataset.evidence;
        relatedButton.addEventListener("click", () => connectEvidenceClues(name, card.dataset.evidence, relatedButton));
        relatedRow.appendChild(relatedButton);
      });
    }

    const joseonDirectEvidenceInteractions = {
      "돌쇠의 그림": { tool: "돋보기", label: "두루마리 직접 펼치기", open: () => openPortraitStrokePuzzle() },
      "찢어진 약속 편지": { tool: "문서 맞춤판", label: "편지 조각 직접 맞추기", open: () => openDocumentAssembly("찢어진 약속 편지") },
      "빈 호패 주머니": { tool: "돋보기", label: "주머니 안감 직접 뒤집기", open: () => openPouchLiningPuzzle() },
      "찢어진 옷고름": { tool: "돋보기", label: "조인 비단끈 직접 펼치기", open: () => openSilkTensionPuzzle() },
      "하인 장부": { tool: "촛불 비추기", label: "지워진 장부 직접 복원하기", open: () => openLedgerTimelinePuzzle() },
      "도망 보따리": { tool: "먼지털이 붓", label: "보따리 매듭 직접 풀기", open: () => openBundlePuzzle() },
      "무덕의 번진 일기": { tool: "촛불 비추기", label: "번진 일기 직접 읽어 보기", open: () => openDiaryTimelinePuzzle() }
    };

    document.querySelector("#evidenceDirectAction")?.addEventListener("click", (event) => {
      const name = event.currentTarget.dataset.evidence;
      const interaction = joseonDirectEvidenceInteractions[name];
      if (!interaction) return;
      currentEvidenceForTool = name;
      evidenceFlipped = false;
      resetToolInteraction(true);
      setEvidenceBag(false);
      interaction.open();
    });

    const suspectPortraits = {
      dolsoe: "/samunmong/assets/suspects/dolsoe-seated.webp",
      chunwol: "/samunmong/assets/suspects/chunwol-seated.webp",
      yoomunseok: "/samunmong/assets/suspects/yoomunseok-seated.webp",
      mudeok: "/samunmong/assets/suspects/mudeok-seated.webp"
    };

    function findJoseonSuspect(personName) {
      return suspects.find((suspect) => suspect.name === personName || suspect.name.includes(personName) || personName.includes(suspect.name));
    }

    function renderEvidencePeople(name) {
      const row = document.querySelector("#evidencePeopleRow");
      if (!row) return;
      row.replaceChildren();
      if (themeId !== "joseon") {
        row.hidden = true;
        return;
      }
      row.hidden = false;
      const label = document.createElement("span");
      label.textContent = "누구에게 제시할까";
      row.appendChild(label);
      suspects.slice(0, 4).forEach((suspect) => {
        const button = document.createElement("button");
        button.type = "button";
        button.setAttribute("aria-label", `${suspect.name}에게 이 증거 제시`);
        button.innerHTML = `<img src="${escapeHtml(suspectPortraits[suspect.id] || suspect.scene)}" alt=""><span><b>${escapeHtml(suspect.name)}</b><small>에게 묻기</small></span>`;
        button.addEventListener("click", () => presentEvidenceToSuspect(name, suspect.id));
        row.appendChild(button);
      });
    }

    function presentEvidenceToSuspect(name, suspectId) {
      const targetIndex = suspects.findIndex((suspect) => suspect.id === suspectId);
      if (targetIndex < 0) return;
      selectedEvidence = name;
      suspectIndex = targetIndex;
      updateSuspect(false);
      const presented = document.querySelector("#presentedEvidence");
      if (presented) presented.textContent = getEvidenceDisplayName(name);
      updateEvidenceInterrogationUI(name);
      closeEvidenceStoryPreview();
      closeToolResultPopup();
      setEvidenceBag(false);
      playSfx("buttonAlt", 0.62);
      showToast(`${suspects[targetIndex].name}에게 ${getEvidenceSource(name)} 제시`);
      if (getActiveScreenId() !== "interrogationScreen") {
        go("interrogationScreen", `${suspects[targetIndex].name}을 불러 심문 중...`);
      }
      window.setTimeout(() => document.querySelector("#questionInput")?.focus(), 380);
    }

    function connectEvidenceClues(first, second, button) {
      const result = document.querySelector("#evidenceConnectionResult");
      if (!result) return;
      const connection = getEvidenceConnection(first, second);
      result.hidden = false;
      result.classList.remove("no-connection", "connected");
      void result.offsetWidth;
      if (!connection) {
        result.classList.add("no-connection");
        document.querySelector("#evidenceConnectionText").textContent = "두 증거는 아직 직접 이어지지 않는다.";
        playSfx("buttonAlt", 0.35);
        return;
      }
      result.classList.add("connected");
      document.querySelector("#connectionImageA").src = getEvidenceImage(first);
      document.querySelector("#connectionImageB").src = getEvidenceImage(second);
      document.querySelector("#connectionImageA").alt = getEvidenceSource(first);
      document.querySelector("#connectionImageB").alt = getEvidenceSource(second);
      document.querySelector("#evidenceConnectionText").textContent = connection[2];
      button?.classList.add("connected");
      saveEvidenceConnection(first, second);
      playSfx("seal", 0.58);
      showToast("실마리가 이어졌습니다");
    }

    function closeEvidenceStoryPreview() {
      const preview = document.querySelector("#evidenceStoryPreview");
      if (preview) preview.hidden = true;
    }

    document.querySelector("#closeEvidenceStoryPreview")?.addEventListener("click", () => {
      playSfx("buttonAlt", 0.45);
      closeEvidenceStoryPreview();
    });

    document.querySelector("#confirmEvidencePresent")?.addEventListener("click", () => {
      if (!selectedEvidence) return;
      const presented = document.querySelector("#presentedEvidence");
      if (presented) presented.textContent = getEvidenceDisplayName(selectedEvidence);
      updateEvidenceInterrogationUI(selectedEvidence);
      closeEvidenceStoryPreview();
      setEvidenceBag(false);
      dispatchEvidenceFeedback(selectedEvidence, document.querySelector(`[data-evidence="${CSS.escape(selectedEvidence)}"]`));
      playSfx("buttonAlt", 0.62);
      showToast(`증거 제시: ${getEvidenceDisplayName(selectedEvidence)}`);
    });

    document.querySelector("#openEvidenceThread")?.addEventListener("click", () => {
      closeEvidenceStoryPreview();
      renderEvidenceThread();
      const panel = document.querySelector("#evidenceThreadPanel");
      if (panel) panel.hidden = false;
      playSfx("paper", 0.52);
    });

    document.querySelector("#closeEvidenceThread")?.addEventListener("click", () => {
      const panel = document.querySelector("#evidenceThreadPanel");
      if (panel) panel.hidden = true;
      playSfx("buttonAlt", 0.42);
    });

    const joseonCoreToolNames = ["돋보기", "먼지털이 붓", "촛불 비추기"];
    const joseonRequiredToolGroups = {
      "발자국 실측줄": "돋보기",
      "혈흔 시험포": "돋보기",
      "섬유 대조틀": "돋보기",
      "증거 연결판": "돋보기",
      "상처 대조첩": "돋보기",
      "탁본 도구": "먼지털이 붓",
      "흙 대조 접시": "먼지털이 붓",
      "매듭 해체 송곳": "먼지털이 붓",
      "문서 맞춤판": "촛불 비추기",
      "먹빛 시험석": "촛불 비추기",
      "문서 펼침칼": "촛불 비추기",
      "압흔 탁본판": "촛불 비추기"
    };

    function getJoseonCoreTool(requiredTool) {
      return joseonRequiredToolGroups[requiredTool] || requiredTool;
    }

    function renderTools() {
      const grid = document.querySelector("#toolGrid");
      grid.innerHTML = "";
      const entries = Object.entries(tools);
      let visibleEntries = entries;
      if (isJoseonToolInteraction) {
        visibleEntries = joseonCoreToolNames.map((name) => [name, tools[name]]).filter(([, tool]) => Boolean(tool));
      }
      visibleEntries.forEach(([name, tool]) => {
        const button = document.createElement("button");
        button.className = `tool-card option${selectedToolForAnalysis === name ? " active" : ""}`;
        button.type = "button";
        button.dataset.tool = name;
        button.draggable = isJoseonToolInteraction;
        button.setAttribute("aria-label", `${name}을 증거에 사용`);
        button.innerHTML = isJoseonToolInteraction
          ? `<img src="${escapeHtml(tool.img)}" alt=""><strong>${escapeHtml(name)}</strong>`
          : `<img src="${escapeHtml(tool.img)}" alt=""><span><strong>${escapeHtml(name)}</strong><span>사용하기</span></span>`;
        button.addEventListener("click", () => {
          activateTool(name);
          showToast(`${name} 선택 · ${getToolGestureCopy(name)}`);
        });
        button.addEventListener("dragstart", (event) => {
          activateTool(name);
          event.dataTransfer?.setData("text/x-samunmong-tool", name);
          if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
          showToast(`${name}을 증거 위에 놓으십시오`);
        });
        grid.appendChild(button);
      });
      syncToolChoiceState();
    }

    function syncToolChoiceState() {
      const hasLockedChoice = isJoseonToolInteraction && Boolean(selectedToolForAnalysis);
      document.querySelectorAll("#toolGrid .tool-card").forEach((item) => {
        const isSelected = item.dataset.tool === selectedToolForAnalysis;
        const isDisabled = hasLockedChoice && !isSelected;
        item.classList.toggle("active", isSelected);
        item.classList.toggle("tool-disabled", isDisabled);
        item.disabled = isDisabled;
        item.setAttribute("aria-disabled", String(isDisabled));
      });
    }

    function activateTool(name) {
      selectedToolForAnalysis = name;
      resetToolInteraction(false);
      syncToolInteractionMode();
      updateToolCursor();
      syncToolChoiceState();
    }

    const toolReactionAssets = {
      "돋보기": {
        primary: "/samunmong/assets/interactions/evidence-tools/lens-focus.png",
        secondary: "/samunmong/assets/interactions/evidence-tools/fiber-highlight.png",
        mode: "lens"
      },
      "먼지털이 붓": {
        primary: "/samunmong/assets/interactions/evidence-tools/wood-dust-stroke.png",
        secondary: "/samunmong/assets/interactions/evidence-tools/charcoal-sweep.png",
        mode: "brush"
      },
      "촛불 비추기": {
        primary: "/samunmong/assets/interactions/evidence-tools/candle-bloom.png",
        secondary: "/samunmong/assets/interactions/evidence-tools/ink-reveal.png",
        mode: "light"
      },
      "발자국 실측줄": {
        primary: "/samunmong/assets/interactions/evidence-tools/expanded/result-footprint-shoe-mismatch-v3.png",
        secondary: "/samunmong/assets/interactions/evidence-tools/expanded/result-evidence-confirmed.png",
        mode: "measure"
      },
      "문서 맞춤판": {
        primary: "/samunmong/assets/interactions/evidence-tools/expanded/result-document-reconstruction.png",
        secondary: "/samunmong/assets/interactions/evidence-tools/expanded/result-backlit-writing.png",
        mode: "document"
      },
      "혈흔 시험포": {
        primary: "/samunmong/assets/interactions/evidence-tools/expanded/result-blood-reaction.png",
        secondary: "/samunmong/assets/interactions/evidence-tools/expanded/result-evidence-confirmed.png",
        mode: "blood"
      },
      "탁본 도구": {
        primary: "/samunmong/assets/interactions/evidence-tools/secondary/result-hopae-rubbing.png",
        secondary: "/samunmong/assets/interactions/evidence-tools/secondary/result-secondary-analysis-complete.png",
        mode: "rubbing"
      },
      "섬유 대조틀": {
        primary: "/samunmong/assets/interactions/evidence-tools/secondary/result-fiber-match.png",
        secondary: "/samunmong/assets/interactions/evidence-tools/secondary/result-cord-reconstruction.png",
        mode: "fiber"
      },
      "먹빛 시험석": {
        primary: "/samunmong/assets/interactions/evidence-tools/secondary/result-ink-diffusion.png",
        secondary: "/samunmong/assets/interactions/evidence-tools/secondary/result-secondary-analysis-complete.png",
        mode: "ink"
      },
      "증거 연결판": {
        primary: "/samunmong/assets/interactions/evidence-tools/crosscheck/result-hopae-three-way-link.webp",
        secondary: "/samunmong/assets/interactions/evidence-tools/crosscheck/feedback-evidence-slots.webp",
        mode: "connect"
      },
      "흙 대조 접시": {
        primary: "/samunmong/assets/interactions/evidence-tools/crosscheck/result-footprint-soil-link.webp",
        secondary: "/samunmong/assets/interactions/evidence-tools/crosscheck/feedback-soil-layers.webp",
        mode: "soil"
      },
      "상처 대조첩": {
        primary: "/samunmong/assets/interactions/evidence-tools/crosscheck/result-bandage-work-cut-v2.png",
        secondary: "/samunmong/assets/interactions/evidence-tools/crosscheck/feedback-stain-patterns.webp",
        mode: "wound"
      },
      "문서 펼침칼": {
        primary: "/samunmong/assets/interactions/evidence-tools/hidden-structure/result-unfolded-document.webp",
        secondary: "/samunmong/assets/interactions/evidence-tools/hidden-structure/feedback-separated-paper-layers.webp",
        mode: "unfold"
      },
      "매듭 해체 송곳": {
        primary: "/samunmong/assets/interactions/evidence-tools/hidden-structure/result-loosened-knot-sequence.webp",
        secondary: "/samunmong/assets/interactions/evidence-tools/hidden-structure/feedback-knot-opening-stages.webp",
        mode: "knot"
      },
      "압흔 탁본판": {
        primary: "/samunmong/assets/interactions/evidence-tools/hidden-structure/result-pressure-writing.webp",
        secondary: "/samunmong/assets/interactions/evidence-tools/hidden-structure/feedback-impression-reveal.webp",
        mode: "impression"
      }
    };

    function getToolGestureCopy(toolName) {
      const gestures = {
        "돋보기": "천천히 훑기",
        "촛불 비추기": "빛을 한 번 통과시키기",
        "발자국 실측줄": "발끝에서 뒤꿈치까지 긋기",
        "문서 맞춤판": "찢긴 선 따라 긋기",
        "혈흔 시험포": "얼룩 두 곳 누르기",
        "탁본 도구": "좌우로 한 번 문지르기",
        "섬유 대조틀": "실을 따라 훑기",
        "먹빛 시험석": "작은 원 그리기",
        "증거 연결판": "연결점 두 곳 누르기",
        "흙 대조 접시": "좌우로 한 번 거르기",
        "상처 대조첩": "대응 지점 두 곳 누르기",
        "문서 펼침칼": "가장자리 따라 밀기",
        "매듭 해체 송곳": "매듭 둘레에 원 그리기",
        "압흔 탁본판": "좌우로 한 번 문지르기"
      };
      return gestures[toolName] || "한 번 쓸어 내리기";
    }

    function getToolInteractionType(toolName) {
      if (["혈흔 시험포", "증거 연결판", "상처 대조첩"].includes(toolName)) return "tap";
      if (["발자국 실측줄", "문서 맞춤판", "섬유 대조틀", "문서 펼침칼"].includes(toolName)) return "trace";
      return "sweep";
    }

    function updateToolProgress(value) {
      toolAnalysisProgress = Math.max(0, Math.min(100, value));
      const fill = document.querySelector("#toolAnalysisProgressFill");
      const progress = document.querySelector("#toolAnalysisProgress");
      fill?.style.setProperty("--tool-progress", `${toolAnalysisProgress}%`);
      document.querySelector(".tool-preview-image")?.style.setProperty("--tool-reveal", `${toolAnalysisProgress}%`);
      progress?.classList.toggle("active", toolAnalysisProgress > 0 && toolAnalysisProgress < 100);
      progress?.classList.toggle("complete", toolAnalysisProgress >= 100);
      const stage = document.querySelector("#toolAnalysisStage");
      if (stage) {
        stage.textContent = toolAnalysisProgress >= 100
          ? "단서 확정"
          : toolAnalysisProgress >= 68
            ? "숨은 흔적 대조"
            : toolAnalysisProgress >= 34
              ? "미세 흔적 분리"
              : toolAnalysisProgress > 0
                ? "표면 확인"
                : "조사 준비";
        stage.classList.toggle("active", toolAnalysisProgress > 0);
        stage.classList.toggle("complete", toolAnalysisProgress >= 100);
      }
    }

    function resetToolInteraction(clearTool = true) {
      swipeStartPoint = null;
      swipeLastPoint = null;
      toolAnalysisCompleted = false;
      toolLastMoveAt = 0;
      toolLastDirection = 0;
      toolDirectionChanges = 0;
      updateToolProgress(0);
      const preview = document.querySelector(".tool-preview");
      preview?.classList.remove("swiping", "wrong-tool", "tool-reacting");
      preview?.removeAttribute("data-tool-mode");
      document.querySelector("#toolReactionLayer")?.classList.remove("show", "wrong", "success");
      if (clearTool) {
        selectedToolForAnalysis = "";
        syncToolChoiceState();
        updateToolCursor();
      }
      syncToolInteractionMode();
    }

    function syncToolInteractionMode() {
      const reaction = toolReactionAssets[selectedToolForAnalysis];
      const preview = document.querySelector(".tool-preview");
      const primary = document.querySelector("#toolReactionPrimary");
      const secondary = document.querySelector("#toolReactionSecondary");
      const guide = document.querySelector("#toolGestureGuide");
      if (reaction) {
        preview?.setAttribute("data-tool-mode", reaction.mode);
        if (primary) primary.src = reaction.primary;
        if (secondary) secondary.src = reaction.secondary;
      }
      if (guide) {
        guide.textContent = selectedToolForAnalysis
          ? `이제 증거 위에서 · ${getToolGestureCopy(selectedToolForAnalysis)}`
          : evidenceData[currentEvidenceForTool]?.reverseImg
            ? "좌우로 밀면 뒷면 · 아래 도구로 감식"
            : "아래 도구 중 하나를 올려놓으세요";
      }
    }

    function positionToolReaction(event) {
      const area = document.querySelector(".tool-preview-image");
      const layer = document.querySelector("#toolReactionLayer");
      if (!area || !layer) return;
      const rect = area.getBoundingClientRect();
      layer.style.setProperty("--reaction-x", `${event.clientX - rect.left}px`);
      layer.style.setProperty("--reaction-y", `${event.clientY - rect.top}px`);
    }

    function showWrongToolReaction(event) {
      const layer = document.querySelector("#toolReactionLayer");
      const primary = document.querySelector("#toolReactionPrimary");
      if (primary) primary.src = "/samunmong/assets/interactions/evidence-tools/wrong-tool-puff.png";
      positionToolReaction(event);
      layer?.classList.add("show", "wrong");
      window.setTimeout(() => {
        layer?.classList.remove("show", "wrong");
        syncToolInteractionMode();
      }, 620);
    }

    function showSuccessfulToolReaction() {
      const layer = document.querySelector("#toolReactionLayer");
      const primary = document.querySelector("#toolReactionPrimary");
      if (primary) primary.src = "/samunmong/assets/interactions/evidence-tools/discovery-burst.png";
      layer?.classList.add("show", "success");
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

    function dragToolOverEvidence(event) {
      if (!isJoseonToolInteraction || !selectedToolForAnalysis) return;
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
      positionToolReaction(event);
      document.querySelector(".tool-preview")?.classList.add("tool-reacting");
      document.querySelector("#toolReactionLayer")?.classList.add("show");
    }

    function dropToolOnEvidence(event) {
      if (!isJoseonToolInteraction) return;
      event.preventDefault();
      const droppedTool = event.dataTransfer?.getData("text/x-samunmong-tool") || selectedToolForAnalysis;
      if (!droppedTool || !currentEvidenceForTool) return;
      activateTool(droppedTool);
      positionToolReaction(event);
      const expectedTool = getPendingToolStep(currentEvidenceForTool)?.tool;
      if (getJoseonCoreTool(expectedTool) !== droppedTool) {
        showWrongToolReaction(event);
        document.querySelector(".tool-preview")?.classList.add("wrong-tool");
        window.setTimeout(() => document.querySelector(".tool-preview")?.classList.remove("wrong-tool"), 420);
        showToast("반응 없음");
        return;
      }
      updateToolProgress(100);
      document.querySelector("#toolReactionLayer")?.classList.add("show");
      window.setTimeout(() => analyzeEvidenceWithTool(expectedTool), 140);
    }

    function showToolResultPopup(evidenceName, toolName, resultText, resultAsset = "") {
      const panel = document.querySelector("#toolResultPopup");
      if (!panel) return;
      const resultData = evidenceData[evidenceName] || {};
      const sourceName = resultData.source || "";
      const sourceData = evidenceData[sourceName] || {};
      const [storyRole, storyBeat] = getEvidenceStoryCue(evidenceName, resultData);
      currentToolResultEvidence = evidenceName;

      document.querySelector("#toolResultKicker").textContent = toolName === "현장 채증" ? "새로운 증거" : "새 단서 확정";
      document.querySelector("#toolResultTitle").textContent = evidenceName;
      document.querySelector("#toolResultStoryRole").textContent = storyRole;
      document.querySelector("#toolResultStoryBeat").textContent = storyBeat;
      document.querySelector("#toolResultLocation").textContent = `발견 · ${getEvidenceLocation(evidenceName)}`;
      renderToolResultPeople(evidenceName);
      const resultHeadline = sentenceBreakText(resultText).split("\n").find(Boolean) || "새로운 흔적을 찾았습니다.";
      document.querySelector("#toolResultText").textContent = resultHeadline;
      const sourceImage = document.querySelector("#toolResultSourceImage");
      if (sourceImage) sourceImage.src = sourceData.img || resultData.img || resultAsset || "/samunmong/assets/evidence-wooden-tag.webp";
      const resultImage = document.querySelector("#toolResultImage");
      if (resultImage) {
        resultImage.hidden = false;
        resultImage.src = resultAsset || getEvidenceImage(evidenceName, "/samunmong/assets/interactions/evidence-tools/expanded/result-evidence-confirmed.png");
      }
      panel.classList.remove("acquired");
      panel.classList.toggle("has-transformation", Boolean(sourceName));
      void panel.offsetWidth;
      panel.classList.add("show");
      panel.classList.add("acquired");
      panel.setAttribute("aria-hidden", "false");
      globalOverlay.classList.add("show");
      playSfx("evidence", 0.9);
    }

    function renderToolResultPeople(name) {
      const row = document.querySelector("#toolResultPeople");
      if (!row) return;
      const data = evidenceData[name] || {};
      const sourceData = evidenceData[data.source || name] || data;
      const hasDreamTrace = Boolean(joseonDreamTraceByEvidence[data.source || name]);
      row.hidden = hasDreamTrace;
      row.replaceChildren();
      if (hasDreamTrace) return;
      const people = Array.isArray(sourceData.relatedSuspects) ? sourceData.relatedSuspects : [];
      people.slice(0, 3).forEach((personName) => {
        const suspect = findJoseonSuspect(personName);
        if (!suspect) return;
        const button = document.createElement("button");
        button.type = "button";
        button.setAttribute("aria-label", `${suspect.name}에게 바로 묻기`);
        button.innerHTML = `<img src="${escapeHtml(suspectPortraits[suspect.id] || suspect.scene)}" alt=""><span>${escapeHtml(suspect.name)}</span>`;
        button.addEventListener("click", () => presentEvidenceToSuspect(name, suspect.id));
        row.appendChild(button);
      });
    }

    document.querySelector("#openResultInBag")?.addEventListener("click", () => {
      if (!currentToolResultEvidence) return;
      const name = currentToolResultEvidence;
      closeToolResultPopup();
      setEvidenceBag(true);
      setActiveEvidenceLocation(getEvidenceLocation(name));
      showEvidenceStoryPreview(name);
      playSfx("bag", 0.62);
    });

    function openDocumentAssembly(evidenceName) {
      documentPuzzleEvidence = evidenceName;
      placedDocumentPieces.clear();
      const isHonseo = evidenceName === "혼서 조각";
      const stage = document.querySelector("#documentAssemblyStage");
      stage?.setAttribute("data-document-kind", isHonseo ? "honseo" : "letter");
      const honseoPieces = {
        a: "/samunmong/assets/interactions/document-puzzle/honseo-pieces/fragment-a-v2.png",
        b: "/samunmong/assets/interactions/document-puzzle/honseo-pieces/fragment-b-v2.png",
        c: "/samunmong/assets/interactions/document-puzzle/honseo-pieces/fragment-c-v2.png"
      };
      const promiseLetterPieces = {
        a: "/samunmong/assets/interactions/document-puzzle/drag-pieces/fragment-a-letter-v4.png",
        b: "/samunmong/assets/interactions/document-puzzle/drag-pieces/fragment-b-letter-v4.png",
        c: "/samunmong/assets/interactions/document-puzzle/drag-pieces/fragment-c-letter-v4.png"
      };
      stage?.querySelectorAll("[data-document-piece], [data-document-target]").forEach((item) => {
        const pieceId = item.dataset.documentPiece || item.dataset.documentTarget;
        const image = item.querySelector("img");
        if (image) image.src = isHonseo ? honseoPieces[pieceId] : promiseLetterPieces[pieceId];
      });
      document.querySelector("#documentAssemblyTitle").textContent = evidenceName;
      document.querySelector("#documentAssemblyGuide").textContent = isHonseo ? "인장과 테두리가 이어지도록 혼서 조각을 직접 맞추십시오 · 짧게 누르면 회전" : "찢긴 글줄이 이어지도록 편지 조각을 끌어 맞추십시오 · 짧게 누르면 회전";
      document.querySelector("#documentAssemblyBoard").src = "/samunmong/assets/interactions/document-puzzle/board-empty.webp";
      document.querySelector("#documentAssemblyStage")?.classList.remove("completed");
      document.querySelectorAll(".document-piece").forEach((button) => {
        button.disabled = false;
        button.classList.remove("placed", "dragging", "wrong-fit");
        const config = getDocumentPieceLayout(button.dataset.documentPiece);
        const state = { x: config.startX, y: config.startY, rotation: config.startRotation };
        documentPieceState.set(button.dataset.documentPiece, state);
        updateDocumentPiecePosition(button, state);
      });
      openGlobalPanel("documentAssemblyPanel");
      playSfx("map", 0.62);
    }

    function updateDocumentPiecePosition(button, state) {
      button.style.setProperty("--piece-x", `${state.x}%`);
      button.style.setProperty("--piece-y", `${state.y}%`);
      button.style.setProperty("--piece-rotation", `${state.rotation}deg`);
    }

    function startDocumentPieceDrag(button, event) {
      const pieceId = button.dataset.documentPiece;
      if (!pieceId || placedDocumentPieces.has(pieceId)) return;
      draggedDocumentPiece = { button, pieceId, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, moved: false };
      button.setPointerCapture?.(event.pointerId);
      button.classList.add("dragging");
      event.preventDefault();
    }

    function moveDocumentPiece(event) {
      if (!draggedDocumentPiece || draggedDocumentPiece.pointerId !== event.pointerId) return;
      const rect = document.querySelector("#documentAssemblyStage")?.getBoundingClientRect();
      if (!rect?.width || !rect.height) return;
      const state = documentPieceState.get(draggedDocumentPiece.pieceId);
      state.x = Math.max(8, Math.min(92, ((event.clientX - rect.left) / rect.width) * 100));
      state.y = Math.max(10, Math.min(88, ((event.clientY - rect.top) / rect.height) * 100));
      draggedDocumentPiece.moved ||= Math.hypot(event.clientX - draggedDocumentPiece.startX, event.clientY - draggedDocumentPiece.startY) > 7;
      updateDocumentPiecePosition(draggedDocumentPiece.button, state);
      event.preventDefault();
    }

    function finishDocumentPieceDrag(event) {
      if (!draggedDocumentPiece || draggedDocumentPiece.pointerId !== event.pointerId) return;
      const { button, pieceId, moved } = draggedDocumentPiece;
      const state = documentPieceState.get(pieceId);
      button.classList.remove("dragging");
      draggedDocumentPiece = null;
      if (!moved) {
        state.rotation = (state.rotation + 45) % 360;
        updateDocumentPiecePosition(button, state);
        playSfx("buttonAlt", 0.42);
        return;
      }
      const target = getDocumentPieceLayout(pieceId);
      const rawRotationDelta = Math.abs(state.rotation - target.targetRotation) % 360;
      const rotationDelta = Math.min(rawRotationDelta, 360 - rawRotationDelta);
      const distance = Math.hypot(state.x - target.targetX, state.y - target.targetY);
      if (distance > 12 || rotationDelta > 20) {
        button.classList.add("wrong-fit");
        window.setTimeout(() => button.classList.remove("wrong-fit"), 320);
        document.querySelector("#documentAssemblyGuide").textContent = rotationDelta > 20 ? "방향이 맞지 않습니다 · 조각을 짧게 눌러 회전" : "찢어진 가장자리가 맞는 자리를 찾아보십시오";
        playSfx("buttonAlt", 0.36);
        return;
      }
      state.x = target.targetX;
      state.y = target.targetY;
      state.rotation = target.targetRotation;
      updateDocumentPiecePosition(button, state);
      placedDocumentPieces.add(pieceId);
      button.classList.add("placed");
      button.disabled = true;
      const count = placedDocumentPieces.size;
      if (count === 3) {
        document.querySelector("#documentAssemblyBoard").src = documentPuzzleEvidence === "혼서 조각" ? "/samunmong/assets/interactions/document-puzzle/board-complete-honseo-v2.png" : "/samunmong/assets/interactions/document-puzzle/board-complete-letter-v3.png";
        document.querySelector("#documentAssemblyStage")?.classList.add("completed");
      }
      document.querySelector("#documentAssemblyGuide").textContent = count === 3 ? "문서 복원 완료" : `조각이 맞물렸습니다 · ${count}/3`;
      playSfx(count === 3 ? "evidence" : "buttonAlt", count === 3 ? 0.9 : 0.58);
      if (count === 3) {
        finishTactilePuzzle("문서 맞춤판");
      }
    }

    function clearInteractionEarnedEvidence(panel) {
      if (!panel) return;
      panel.querySelector(".interaction-earned-evidence")?.remove();
      panel.classList.remove("interaction-complete");
      const closeButton = panel.querySelector(".global-close");
      if (closeButton?.dataset.defaultLabel) closeButton.textContent = closeButton.dataset.defaultLabel;
    }

    const joseonDreamTraceByEvidence = {
      "도망 보따리": {
        image: "/samunmong/assets/interactions/dream-traces/escape-bundle-packed-v3.png",
        alt: "정체를 감춘 한 사람이 두 사람 몫의 물건을 보따리에 꾸리는 몽흔",
        observed: "두 사람 몫의 물건이 한 보따리에 함께 꾸려짐",
        scene: "누군가 두 사람 몫의 떠날 채비를 꾸린 순간",
        question: "누가 이 계획을 알고 있었던 것일까?"
      },
      "작은 발자국": {
        image: "/samunmong/assets/interactions/dream-traces/small-shoeprints-natural-v3.png",
        alt: "정체를 감춘 인물이 뒷문을 지나며 작은 신발 자국을 자연스럽게 남기는 몽흔",
        observed: "짧고 좁은 신발 자국이 뒷문 쪽으로 이어짐",
        scene: "누군가 젖은 마당을 지나며 자연히 자국을 남긴 순간",
        question: "이 길을 지난 사람은 누구였을까?",
        caution: "일부러 놓은 흔적이 아니라 실제 이동 중 남은 자국으로 보임"
      },
      "빈 호패 주머니": {
        image: "/samunmong/assets/interactions/dream-traces/empty-hopae-pouch-v2.png",
        alt: "정체를 감춘 인물이 주머니에서 호패를 꺼내는 몽흔",
        observed: "안감에 호패 눌림과 잘린 끈 섬유가 함께 남음",
        scene: "주머니의 끈을 끊고 호패를 꺼낸 듯한 순간",
        question: "주인이 꺼낸 것일까, 다른 손이 가져간 것일까?"
      },
      "하인 장부": {
        image: "/samunmong/assets/interactions/dream-traces/ledger-record-erased-v1.png",
        alt: "정체를 감춘 인물이 이미 적힌 출입 기록을 먹으로 덮어 지우는 몽흔",
        observed: "한 줄의 필획만 나중 먹으로 덮여 있음",
        scene: "이미 적힌 출입 기록 하나를 다시 가린 순간",
        question: "지워진 행에는 누구의 이름이 있었을까?"
      },
      "찢어진 약속 편지": {
        image: "/samunmong/assets/interactions/dream-traces/promise-letter-written-v3.png",
        alt: "정체를 감춘 인물이 온전한 약속 편지를 쓰는 몽흔",
        observed: "정중한 문장이 한 번에 이어져 있음",
        scene: "누군가 정중한 말투로 약속을 적은 순간",
        question: "이 문장은 돌쇠의 평소 말투와 같은 것일까?"
      },
      "돌쇠의 그림": {
        image: "/samunmong/assets/interactions/dream-traces/portrait-redrawn-v1.png",
        alt: "정체를 감춘 인물이 돌쇠의 초상을 여러 번 덧그리는 몽흔",
        observed: "눈매와 옷깃에 지우고 덧그린 획이 여러 겹 남음",
        scene: "누군가 감춰 둔 초상을 오래 고쳐 그린 순간",
        question: "그린 이는 왜 이 얼굴을 거듭 붙잡았을까?"
      },
      "무덕의 번진 일기": {
        image: "/samunmong/assets/interactions/dream-traces/mudeok-diary-overheard-v4.png",
        alt: "어린 하인이 닫힌 문밖의 소리를 듣고 번진 일기에 기록하는 몽흔",
        observed: "번진 먹 아래 밤의 문소리와 들은 말이 기록됨",
        scene: "무덕이 닫힌 문밖의 기척을 듣고 기억을 적은 순간",
        question: "무덕이 들은 이야기는 누구에게까지 전해졌을까?"
      }
    };

    function renderInteractionEarnedEvidence(panel, clue) {
      if (!panel || !clue) return;
      clearInteractionEarnedEvidence(panel);
      const data = evidenceData[clue.name] || { source: clue.source, note: clue.note, img: clue.img };
      const sourceName = clue.source || data.source || clue.name;
      const dreamTrace = joseonDreamTraceByEvidence[sourceName];
      const [storyRole] = getEvidenceStoryCue(sourceName, evidenceData[sourceName] || data);
      const storyQuestion = getEvidenceStoryMeaning(sourceName, evidenceData[sourceName] || data);
      const result = document.createElement("article");
      result.className = `interaction-earned-evidence ${dreamTrace ? "dream-trace-evidence" : "evidence-still-result"}`;
      result.setAttribute("aria-live", "polite");
      result.innerHTML = `
        <section class="evidence-recovery-still">
          <div class="evidence-object-stage">
            <img src="${escapeHtml(clue.img || data.img || "/samunmong/assets/evidence-wooden-tag.webp")}" alt="${escapeHtml(clue.name)}" draggable="false">
            <i aria-hidden="true">증좌</i>
          </div>
          <div class="evidence-recovery-copy">
            <span>검험을 마쳤습니다</span>
            <strong>${escapeHtml(clue.name)}</strong>
            <small>새 증좌가 보따리에 기록됨</small>
            <div class="evidence-story-bridge">
              <span><b>확인</b>${escapeHtml(dreamTrace?.observed || clue.note || data.note || "새 흔적을 확인함")}</span>
              <i aria-hidden="true">→</i>
              <span><b>${escapeHtml(storyRole)}</b>${escapeHtml(storyQuestion)}</span>
            </div>
            ${dreamTrace ? '<button type="button" class="dream-trace-toggle"><b>꿈자취 살피기</b><em>증좌에 밴 지난 순간을 엿봄</em></button>' : ""}
          </div>
        </section>
        ${dreamTrace ? `<figure class="dream-trace-still" hidden>
          <img src="${escapeHtml(dreamTrace.image)}" alt="${escapeHtml(dreamTrace.alt)}" draggable="false">
          <figcaption>
            <span>꿈자취 · 재구성</span>
            <div class="dream-trace-caption-copy">
              <strong>${escapeHtml(dreamTrace.scene)}</strong>
              <em>${escapeHtml(dreamTrace.question)}</em>
              ${dreamTrace.caution ? `<small>${escapeHtml(dreamTrace.caution)}</small>` : ""}
            </div>
            <button type="button" class="dream-trace-return">증좌로 돌아가기</button>
          </figcaption>
        </figure>` : ""}`;
      const evidenceStill = result.querySelector(".evidence-recovery-still");
      const dreamTraceStill = result.querySelector(".dream-trace-still");
      const traceToggle = result.querySelector(".dream-trace-toggle");
      const traceReturn = result.querySelector(".dream-trace-return");
      traceToggle?.addEventListener("click", () => {
        result.classList.remove("trace-revealed");
        dreamTraceStill.hidden = false;
        evidenceStill.hidden = true;
        void result.offsetWidth;
        result.classList.add("trace-revealed");
        playDreamTraceSfx();
      });
      traceReturn?.addEventListener("click", () => {
        result.classList.remove("trace-revealed");
        dreamTraceStill.hidden = true;
        evidenceStill.hidden = false;
      });
      panel.appendChild(result);
      panel.classList.add("interaction-complete");
      const closeButton = panel.querySelector(".global-close");
      if (closeButton) {
        if (!closeButton.dataset.defaultLabel) closeButton.dataset.defaultLabel = closeButton.textContent || "그만두기";
        closeButton.textContent = "확인하고 닫기";
      }
      result.scrollIntoView?.({ behavior: "smooth", block: "nearest" });
    }

    function finishTactilePuzzle(toolName) {
      playSfx("evidence", 0.9);
      const completedPanel = document.querySelector(".global-panel.show");
      const completedSource = currentEvidenceForTool;
      window.setTimeout(() => {
        tactilePuzzleBypass = true;
        analyzeEvidenceWithTool(toolName);
        tactilePuzzleBypass = false;
        const clue = readExaminedClues().slice().reverse().find((item) => item.source === completedSource && item.tool === toolName);
        renderInteractionEarnedEvidence(completedPanel, clue);
      }, 420);
    }

    function openRubbingPuzzle() {
      tactilePuzzleProgress = 0;
      tactilePuzzlePointer = null;
      rubbingStrokeStep = 0;
      rubbingDragState = null;
      document.querySelector("#rubbingPuzzleImage").src = "/samunmong/assets/interactions/ledger-rubbing-puzzle/state-1-v1.png";
      document.querySelector("#rubbingPuzzleGuide").textContent = "아래쪽의 붉은 손가락 고리에 손을 넣고, 먹뭉치를 한지의 검은 띠 전체에 가로로 길게 문지르십시오.";
      document.querySelectorAll("[data-rubbing-lane]").forEach((lane, index) => {
        lane.classList.toggle("active", index === 0);
        lane.classList.remove("complete");
      });
      const charcoal = document.querySelector("#rubbingCharcoal");
      charcoal?.classList.remove("dragging", "wrong-fit");
      if (charcoal) {
        charcoal.disabled = false;
        charcoal.dataset.rubbingStep = "1";
      }
      charcoal?.style.setProperty("--rubbing-x", "0px");
      charcoal?.style.setProperty("--rubbing-y", "0px");
      openGlobalPanel("rubbingPuzzlePanel");
      playSfx("map", 0.62);
    }

    function startRubbingDrag(event) {
      if (tactilePuzzleProgress < 0) return;
      const charcoal = event.currentTarget;
      charcoal.setPointerCapture?.(event.pointerId);
      rubbingDragState = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY };
      charcoal.classList.add("dragging");
      event.preventDefault();
    }

    function moveRubbingDrag(event) {
      if (!rubbingDragState || rubbingDragState.pointerId !== event.pointerId) return;
      const charcoal = document.querySelector("#rubbingCharcoal");
      charcoal?.style.setProperty("--rubbing-x", `${event.clientX - rubbingDragState.startX}px`);
      charcoal?.style.setProperty("--rubbing-y", `${event.clientY - rubbingDragState.startY}px`);
      event.preventDefault();
    }

    function finishRubbingDrag(event) {
      if (!rubbingDragState || rubbingDragState.pointerId !== event.pointerId) return;
      const charcoal = document.querySelector("#rubbingCharcoal");
      const dx = event.clientX - rubbingDragState.startX;
      const dy = event.clientY - rubbingDragState.startY;
      const validStroke = Math.abs(dx) > 150 && Math.abs(dx) > Math.abs(dy) * 1.8;
      charcoal?.classList.remove("dragging");
      charcoal?.style.setProperty("--rubbing-x", "0px");
      charcoal?.style.setProperty("--rubbing-y", "0px");
      rubbingDragState = null;
      if (!validStroke) {
        charcoal?.classList.remove("wrong-fit");
        void charcoal?.offsetWidth;
        charcoal?.classList.add("wrong-fit");
        document.querySelector("#rubbingPuzzleGuide").textContent = "먹뭉치를 검게 덮인 한지 띠에 대고 한쪽 끝에서 반대쪽 끝까지 길게 문지르십시오.";
        return;
      }
      rubbingStrokeStep = 1;
      document.querySelectorAll("[data-rubbing-lane]").forEach((lane) => lane.classList.remove("active"));
      document.querySelector("#rubbingPuzzleImage").src = "/samunmong/assets/interactions/ledger-rubbing-puzzle/state-4-v1.png";
      document.querySelector("#rubbingPuzzleGuide").textContent = "한 번에 뜬 압흔에서 가운데 출입 기록만 나중에 덮어 지운 흔적이 드러났습니다.";
      playSfx("buttonAlt", 0.56);
      tactilePuzzleProgress = -999;
      charcoal?.setAttribute("disabled", "true");
      finishTactilePuzzle(selectedToolForAnalysis);
    }

    function openKnotPuzzle() {
      knotPuzzleStep = 0;
      knotDragState = null;
      document.querySelector("#knotPuzzleImage").src = "/samunmong/assets/interactions/knot-puzzle/state-1.png";
      document.querySelector("#knotPuzzleGuide").textContent = "빛나는 매듭 중심을 아래로 당겨 바깥 고리를 느슨하게 만드십시오.";
      document.querySelectorAll("[data-knot-loop]").forEach((button) => button.disabled = false);
      document.querySelector("#knotPuzzleStage")?.setAttribute("data-knot-step", "1");
      openGlobalPanel("knotPuzzlePanel");
      playSfx("map", 0.62);
    }

    function startKnotDrag(button, event) {
      if (button.disabled) return;
      knotDragState = { button, loop: Number(button.dataset.knotLoop), pointerId: event.pointerId, x: event.clientX, y: event.clientY };
      button.setPointerCapture?.(event.pointerId);
      button.classList.add("dragging");
      event.preventDefault();
    }

    function moveKnotDrag(event) {
      if (!knotDragState || knotDragState.pointerId !== event.pointerId) return;
      const dx = event.clientX - knotDragState.x;
      const dy = event.clientY - knotDragState.y;
      knotDragState.button.style.setProperty("--pull-x", `${Math.max(-64, Math.min(64, dx))}px`);
      knotDragState.button.style.setProperty("--pull-y", `${Math.max(-64, Math.min(64, dy))}px`);
      event.preventDefault();
    }

    function finishKnotDrag(event) {
      if (!knotDragState || knotDragState.pointerId !== event.pointerId) return;
      const { button, loop, x, y } = knotDragState;
      const dx = event.clientX - x;
      const dy = event.clientY - y;
      const pulledCorrectly = loop === 1 ? dy > 42 && Math.abs(dx) < 55 : loop === 2 ? dx < -42 : dx > 42;
      button.classList.remove("dragging");
      button.style.removeProperty("--pull-x");
      button.style.removeProperty("--pull-y");
      knotDragState = null;
      if (!pulledCorrectly) {
        document.querySelector("#knotPuzzleGuide").textContent = "화살표 방향으로 고리를 길게 당기십시오";
        return;
      }
      pullKnotLoop(loop);
    }

    function pullKnotLoop(loopNumber) {
      const sequence = [1, 3];
      if (Number(loopNumber) !== sequence[knotPuzzleStep]) {
        document.querySelector("#knotPuzzleGuide").textContent = "그 고리는 더 조여집니다 · 다른 고리부터";
        document.querySelector("#knotPuzzlePanel")?.classList.add("puzzle-miss");
        window.setTimeout(() => document.querySelector("#knotPuzzlePanel")?.classList.remove("puzzle-miss"), 280);
        playSfx("buttonAlt", 0.4);
        return;
      }
      knotPuzzleStep += 1;
      document.querySelector("#knotPuzzleImage").src = `/samunmong/assets/interactions/knot-puzzle/state-${knotPuzzleStep + 1}.png`;
      document.querySelector(`[data-knot-loop="${loopNumber}"]`)?.setAttribute("disabled", "true");
      document.querySelector("#knotPuzzleStage")?.setAttribute("data-knot-step", String(Math.min(2, knotPuzzleStep + 1)));
      document.querySelector("#knotPuzzleGuide").textContent = knotPuzzleStep < 2 ? "매듭 중심이 풀렸습니다. 드러난 오른쪽 숨은 실을 바깥으로 당기십시오." : "매듭 속에 감춰졌던 다른 색의 섬유를 찾았습니다.";
      playSfx("buttonAlt", 0.62);
      if (knotPuzzleStep === 2) {
        document.querySelector("#knotPuzzleImage").src = "/samunmong/assets/interactions/knot-puzzle/state-4.png";
        finishTactilePuzzle("매듭 해체 송곳");
      }
    }

    function openFootprintPuzzle() {
      tactilePuzzleProgress = 0;
      tactilePuzzlePointer = null;
      footprintDragState = null;
      footprintMeasureDragState = null;
      footprintPuzzleStep = 0;
      document.querySelector("#footprintPuzzleImage").src = "/samunmong/assets/interactions/footprint-puzzle/state-1.png";
      document.querySelector("#footprintPuzzleGuide").textContent = "오른쪽의 짚신 밑창을 왼쪽 발자국 윤곽에 직접 포개십시오.";
      const shoe = document.querySelector("#footprintShoePiece");
      shoe?.classList.remove("dragging", "matched", "wrong-fit");
      shoe?.style.setProperty("--shoe-x", "0px");
      shoe?.style.setProperty("--shoe-y", "0px");
      document.querySelector("#footprintDropTarget")?.classList.remove("matched");
      document.querySelector("#footprintPuzzleStage")?.setAttribute("data-footprint-step", "sole");
      const measureTool = document.querySelector("#footprintMeasureTool");
      measureTool?.classList.remove("dragging", "placed", "wrong-fit");
      measureTool?.style.setProperty("--measure-x", "0px");
      measureTool?.style.setProperty("--measure-y", "0px");
      openGlobalPanel("footprintPuzzlePanel");
      playSfx("map", 0.62);
    }

    function startFootprintDrag(event) {
      if (tactilePuzzleProgress < 0) return;
      const shoe = event.currentTarget;
      shoe.setPointerCapture?.(event.pointerId);
      footprintDragState = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY };
      shoe.classList.add("dragging");
      event.preventDefault();
    }

    function moveFootprintDrag(event) {
      if (!footprintDragState || footprintDragState.pointerId !== event.pointerId) return;
      const shoe = document.querySelector("#footprintShoePiece");
      shoe?.style.setProperty("--shoe-x", `${event.clientX - footprintDragState.startX}px`);
      shoe?.style.setProperty("--shoe-y", `${event.clientY - footprintDragState.startY}px`);
      event.preventDefault();
    }

    function finishFootprintDrag(event) {
      if (!footprintDragState || footprintDragState.pointerId !== event.pointerId) return;
      const shoe = document.querySelector("#footprintShoePiece");
      const target = document.querySelector("#footprintDropTarget");
      const shoeRect = shoe?.getBoundingClientRect();
      const targetRect = target?.getBoundingClientRect();
      const centerX = shoeRect ? shoeRect.left + shoeRect.width / 2 : 0;
      const centerY = shoeRect ? shoeRect.top + shoeRect.height / 2 : 0;
      const matched = targetRect && centerX >= targetRect.left && centerX <= targetRect.right && centerY >= targetRect.top && centerY <= targetRect.bottom;
      footprintDragState = null;
      shoe?.classList.remove("dragging");
      if (!matched) {
        shoe?.style.setProperty("--shoe-x", "0px");
        shoe?.style.setProperty("--shoe-y", "0px");
        shoe?.classList.remove("wrong-fit");
        void shoe?.offsetWidth;
        shoe?.classList.add("wrong-fit");
        document.querySelector("#footprintPuzzleGuide").textContent = "뒤꿈치부터 빛나는 윤곽 안에 포개 보십시오.";
        return;
      }
      shoe?.classList.add("matched");
      target?.classList.add("matched");
      document.querySelector("#footprintPuzzleImage").src = "/samunmong/assets/interactions/footprint-puzzle/state-3.png";
      document.querySelector("#footprintPuzzleGuide").textContent = "밑창을 포갰습니다. 이제 실측줄을 발끝부터 뒤꿈치까지 놓아 길이를 확인하십시오.";
      document.querySelector("#footprintPuzzleStage")?.setAttribute("data-footprint-step", "measure");
      footprintPuzzleStep = 1;
    }

    function startFootprintMeasureDrag(event) {
      if (footprintPuzzleStep !== 1) return;
      const tool = event.currentTarget;
      tool.setPointerCapture?.(event.pointerId);
      footprintMeasureDragState = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY };
      tool.classList.add("dragging");
      event.preventDefault();
    }

    function moveFootprintMeasureDrag(event) {
      if (!footprintMeasureDragState || footprintMeasureDragState.pointerId !== event.pointerId) return;
      const tool = document.querySelector("#footprintMeasureTool");
      tool?.style.setProperty("--measure-x", `${event.clientX - footprintMeasureDragState.startX}px`);
      tool?.style.setProperty("--measure-y", `${event.clientY - footprintMeasureDragState.startY}px`);
      event.preventDefault();
    }

    function finishFootprintMeasureDrag(event) {
      if (!footprintMeasureDragState || footprintMeasureDragState.pointerId !== event.pointerId) return;
      const tool = document.querySelector("#footprintMeasureTool");
      const target = document.querySelector("#footprintMeasureTarget");
      const toolRect = tool?.getBoundingClientRect();
      const targetRect = target?.getBoundingClientRect();
      const centerX = toolRect ? toolRect.left + toolRect.width / 2 : 0;
      const centerY = toolRect ? toolRect.top + toolRect.height / 2 : 0;
      const placed = targetRect && centerX >= targetRect.left && centerX <= targetRect.right && centerY >= targetRect.top && centerY <= targetRect.bottom;
      footprintMeasureDragState = null;
      tool?.classList.remove("dragging");
      if (!placed) {
        tool?.style.setProperty("--measure-x", "0px");
        tool?.style.setProperty("--measure-y", "0px");
        tool?.classList.remove("wrong-fit");
        void tool?.offsetWidth;
        tool?.classList.add("wrong-fit");
        document.querySelector("#footprintPuzzleGuide").textContent = "실측줄 가운데를 발자국의 발끝과 뒤꿈치 사이에 놓으십시오.";
        return;
      }
      tool?.classList.add("placed");
      document.querySelector("#footprintPuzzleImage").src = "/samunmong/assets/interactions/footprint-puzzle/state-4.png";
      document.querySelector("#footprintPuzzleGuide").textContent = "길이와 폭이 맞지 않습니다 · 이 짚신의 주인이 남긴 발자국이 아닙니다.";
      document.querySelector("#footprintPuzzleStage")?.setAttribute("data-footprint-step", "complete");
      footprintPuzzleStep = 2;
      tactilePuzzleProgress = -999;
      finishTactilePuzzle("발자국 실측줄");
    }

    const materialPuzzleConfig = {
      "돋보기": { mode: "focus", folder: "focus-puzzle", title: "초점 맞추기", guide: "렌즈를 천천히 원형으로 움직여 선명한 지점을 찾으십시오.", gesture: "◎ 초점 찾기" },
      "먼지털이 붓": { mode: "brush", folder: "brush-puzzle", title: "먼지 털어내기", guide: "붓을 좌우로 왕복해 홈 속 먼지를 털어내십시오.", gesture: "↔ 왕복 쓸기" },
      "촛불 비추기": { mode: "light", folder: "candle-puzzle", title: "배면광 맞추기", guide: "촛불을 종이 뒤쪽으로 끌어 숨은 획을 찾으십시오.", gesture: "↗ 빛 옮기기" },
      "혈흔 시험포": { mode: "sample", folder: "comparison-puzzle", title: "얼룩 옮겨 찍기", guide: "얼룩포와 깨끗한 대조포를 위의 빈 백자 잔에 하나씩 올리십시오.", gesture: "천 조각을 백자 잔에 올리기" },
      "섬유 대조틀": { mode: "sample", folder: "comparison-puzzle", title: "섬유 결 맞추기", guide: "남색 비단실과 비교 모시실을 위의 두 백자 표본 잔에 하나씩 올리십시오.", gesture: "실꾸러미를 표본 잔에 올리기" },
      "먹빛 시험석": { mode: "sample", folder: "comparison-puzzle", title: "먹 농도 맞추기", guide: "마른 먹 시험지와 젖은 먹 시험지를 위의 두 백자 표본 잔에 하나씩 올리십시오.", gesture: "한지 시험편을 표본 잔에 올리기" },
      "증거 연결판": { mode: "sample", folder: "comparison-puzzle", title: "증거 연결하기", guide: "두 흔적을 올리고 공통 지점을 붉은 핀으로 고정하십시오.", gesture: "연결점 3곳 누르기" },
      "흙 대조 접시": { mode: "sample", folder: "comparison-puzzle", title: "흙 알갱이 가르기", guide: "양쪽 흙을 놓고 같은 알갱이를 골라내십시오.", gesture: "표본 3곳 누르기" },
      "상처 대조첩": { mode: "sample", folder: "comparison-puzzle", title: "상처 자국 포개기", guide: "얼룩과 상처 방향을 차례로 고정하십시오.", gesture: "대조점 3곳 누르기" },
      "문서 펼침칼": { mode: "peel", folder: "paper-peel-puzzle", title: "혼서의 붙은 종이층 펼치기", guide: "오른쪽 아래에서 말려 올라온 한지 귀퉁이 밑으로 펼침칼을 밀어 넣으십시오.", gesture: "들린 종이 귀퉁이 열기" }
    };

    function openMaterialPuzzle(toolName) {
      const config = materialPuzzleConfig[toolName];
      if (!config) return false;
      materialPuzzleMode = config.mode;
      materialPuzzleTool = toolName;
      materialPuzzleFolder = config.mode === "peel" && currentEvidenceForTool === "혼서 조각" ? "honseo-peel-puzzle" : config.folder;
      materialPuzzleStage = 0;
      placedMaterialSamples.clear();
      materialLastDirection = 0;
      tactilePuzzleProgress = 0;
      tactilePuzzlePointer = null;
      document.querySelector("#materialPuzzleTitle").textContent = config.title;
      document.querySelector("#materialPuzzleGuide").textContent = config.guide;
      document.querySelector("#materialPuzzleGesture").textContent = config.gesture;
      document.querySelector("#materialPuzzleImage").src = materialPuzzleFolder === "honseo-peel-puzzle"
        ? "/samunmong/assets/interactions/honseo-peel-puzzle/state-1-v1.png"
        : `/samunmong/assets/interactions/${materialPuzzleFolder}/state-1.png`;
      const touchPoints = document.querySelector("#sampleTouchPoints");
      touchPoints.hidden = config.mode !== "sample";
      const sampleKindByTool = { "혈흔 시험포": "blood", "섬유 대조틀": "fiber", "먹빛 시험석": "ink", "증거 연결판": "link", "흙 대조 접시": "soil", "상처 대조첩": "wound" };
      const sampleLabels = {
        blood: ["얼룩포", "대조포", "시약"], fiber: ["현장 실", "비교 실", "꼬임핀"], ink: ["원문 먹", "대조 먹", "번짐 고정"],
        link: ["첫 증좌", "둘째 증좌", "붉은 핀"], soil: ["현장 흙", "비교 흙", "같은 알갱이"], wound: ["상처 방향", "붕대 결", "겹침핀"]
      };
      const sampleTargets = {
        blood: ["얼룩 홈", "대조 홈", "시약 홈"], fiber: ["왼쪽 틀", "오른쪽 틀", "꼬임 중앙"], ink: ["원문 벼루", "대조 벼루", "번짐점"],
        link: ["왼쪽 증좌", "오른쪽 증좌", "연결점"], soil: ["왼 접시", "오른 접시", "공통 알갱이"], wound: ["상처 윤곽", "붕대 윤곽", "겹친 중심"]
      };
      const sampleSprites = {
        blood: [
          "/samunmong/assets/interactions/material-samples/blood-stained-cloth-v1.png",
          "/samunmong/assets/interactions/material-samples/clean-comparison-cloth-v1.png",
          ""
        ],
        fiber: [
          "/samunmong/assets/interactions/material-samples/dark-silk-fibers-v1.png",
          "/samunmong/assets/interactions/material-samples/pale-ramie-fibers-v1.png",
          ""
        ],
        ink: [
          "/samunmong/assets/interactions/material-samples/dry-ink-hanji-v1.png",
          "/samunmong/assets/interactions/material-samples/wet-ink-hanji-v1.png",
          ""
        ],
        soil: [
          "/samunmong/assets/interactions/evidence-reverse/muddy-straw-shoe-sole-v2.png",
          "/samunmong/assets/evidence-transparent/evidence-small-footprints.webp",
          ""
        ],
        wound: [
          "/samunmong/assets/interactions/evidence-reverse/bloodied-bandage-inner-v2.png",
          "/samunmong/assets/evidence-transparent/evidence-dolsoe-work-cut-v3.png",
          ""
        ],
        link: [
          "/samunmong/assets/evidence-transparent/evidence-wooden-tag-transparent.webp",
          "/samunmong/assets/evidence-transparent/evidence-cut-hopae-cord.webp",
          ""
        ]
      };
      const sampleKind = sampleKindByTool[toolName] || "link";
      touchPoints.dataset.sampleKind = sampleKind;
      touchPoints.querySelectorAll("button").forEach((button, index) => {
        button.hidden = config.mode === "sample" && index === 2;
        button.disabled = config.mode === "sample" && index === 2;
        button.dataset.label = sampleLabels[sampleKind][index];
        button.setAttribute("aria-label", `${sampleLabels[sampleKind][index]} 끌기`);
        const sampleImage = button.querySelector("[data-sample-image]");
        const sampleSprite = sampleSprites[sampleKind]?.[index] || "";
        sampleImage.src = sampleSprite;
        sampleImage.alt = sampleSprite ? sampleLabels[sampleKind][index] : "";
        sampleImage.hidden = !sampleSprite;
        button.classList.remove("dragging", "wrong-fit");
        button.style.removeProperty("--sample-x");
        button.style.removeProperty("--sample-y");
      });
      touchPoints.querySelectorAll("[data-sample-target]").forEach((target, index) => {
        target.hidden = config.mode === "sample" && index === 2;
        target.textContent = sampleTargets[sampleKind][index];
        target.classList.toggle("active", config.mode === "sample" && index < 2);
        target.classList.remove("complete");
      });
      const directLayer = document.querySelector("#materialDirectLayer");
      directLayer.hidden = config.mode === "sample";
      directLayer.dataset.mode = config.mode;
      directLayer.querySelectorAll("[data-material-target]").forEach((target, index) => {
        target.classList.toggle("active", index === 0);
        target.classList.remove("complete");
        target.hidden = config.mode === "peel" && index > 0;
      });
      const handTool = document.querySelector("#materialHandTool");
      const toolSprites = {
        focus: ["/samunmong/assets/mudeok-interaction/tool-magnifying-glass.webp", "조선식 돋보기"],
        brush: ["/samunmong/assets/interactions/hand-tools-generated/joseon-dusting-brush-v2.png", "대나무 먼지털이 붓"],
        light: ["/samunmong/assets/interactions/hand-tools-generated/joseon-candle-holder-v2.png", "황동 촛대"],
        peel: ["/samunmong/assets/interactions/hand-tools-generated/joseon-paper-knife-v2.png", "대나무 문서 펼침칼"]
      };
      const [toolSprite, label] = toolSprites[config.mode] || toolSprites.focus;
      const handToolImage = document.querySelector("#materialHandToolImage");
      handToolImage.src = toolSprite;
      handToolImage.alt = label;
      document.querySelector("#materialHandToolName").textContent = label;
      handTool.setAttribute("aria-label", `${label}를 잡아 빛나는 지점으로 옮기기`);
      handTool.classList.remove("dragging", "wrong-fit", "complete");
      handTool.style.setProperty("--material-x", "0px");
      handTool.style.setProperty("--material-y", "0px");
      materialDirectDrag = null;
      openGlobalPanel("materialPuzzlePanel");
      playSfx("map", 0.62);
      return true;
    }

    function startMaterialDirectDrag(event) {
      if (materialPuzzleMode === "sample" || tactilePuzzleProgress < 0) return;
      const tool = event.currentTarget;
      tool.setPointerCapture?.(event.pointerId);
      materialDirectDrag = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY };
      tool.classList.add("dragging");
      event.preventDefault();
    }

    function moveMaterialDirectDrag(event) {
      if (!materialDirectDrag || materialDirectDrag.pointerId !== event.pointerId) return;
      const tool = document.querySelector("#materialHandTool");
      tool?.style.setProperty("--material-x", `${event.clientX - materialDirectDrag.startX}px`);
      tool?.style.setProperty("--material-y", `${event.clientY - materialDirectDrag.startY}px`);
      event.preventDefault();
    }

    function finishMaterialDirectDrag(event) {
      if (!materialDirectDrag || materialDirectDrag.pointerId !== event.pointerId) return;
      const tool = document.querySelector("#materialHandTool");
      const nextStep = materialPuzzleStage + 1;
      const target = document.querySelector(`[data-material-target="${nextStep}"]`);
      const targetRect = target?.getBoundingClientRect();
      const toolRect = tool?.getBoundingClientRect();
      const x = toolRect ? toolRect.left + toolRect.width / 2 : 0;
      const y = toolRect ? toolRect.top + toolRect.height / 2 : 0;
      const hit = targetRect && x >= targetRect.left && x <= targetRect.right && y >= targetRect.top && y <= targetRect.bottom;
      materialDirectDrag = null;
      tool?.classList.remove("dragging");
      tool?.style.setProperty("--material-x", "0px");
      tool?.style.setProperty("--material-y", "0px");
      if (!hit) {
        tool?.classList.remove("wrong-fit");
        void tool?.offsetWidth;
        tool?.classList.add("wrong-fit");
        const retryCopy = {
          focus: "렌즈 중심을 빛나는 획 위에 천천히 겹치십시오.",
          brush: "붓 끝을 빛나는 먼지 결 위에 놓으십시오.",
          light: "촛불 불빛을 종이 뒤의 빛나는 자리로 옮기십시오.",
          peel: "칼끝을 들뜬 종이 가장자리의 빛나는 곳에 대십시오."
        };
        document.querySelector("#materialPuzzleGuide").textContent = retryCopy[materialPuzzleMode] || "도구 중심을 현재 빛나는 흔적 위에 정확히 놓으십시오.";
        return;
      }
      target?.classList.remove("active");
      target?.classList.add("complete");
      materialPuzzleStage += 1;
      const config = materialPuzzleConfig[materialPuzzleTool];
      if (materialPuzzleMode === "peel" && materialPuzzleFolder === "honseo-peel-puzzle") {
        document.querySelector("#materialPuzzleImage").src = "/samunmong/assets/interactions/honseo-peel-puzzle/state-4-v1.png";
        document.querySelector("#materialPuzzleGuide").textContent = "겹쳐 붙인 종이 아래에서 이어진 붉은 인장과 오래 눌린 접힘이 한눈에 드러났습니다.";
        tactilePuzzleProgress = -999;
        tool?.classList.add("complete");
        playSfx("buttonAlt", 0.55);
        finishTactilePuzzle(materialPuzzleTool);
        return;
      }
      document.querySelector("#materialPuzzleImage").src = `/samunmong/assets/interactions/${materialPuzzleFolder}/state-${materialPuzzleStage + 1}.png`;
      const progressCopy = {
        focus: ["초점이 잡혔습니다. 이어지는 가는 선으로 렌즈를 옮기십시오.", "표면 아래 숨은 긁힘과 덧그린 선이 선명해졌습니다."],
        brush: ["겉먼지가 걷혔습니다. 드러난 홈을 따라 붓을 옮기십시오.", "홈 안에 끼어 있던 흙과 섬유가 드러났습니다."],
        light: ["빛이 종이 뒤로 스몄습니다. 어둡게 겹친 수정 획으로 옮기십시오.", "지운 글 아래에 눌린 원래 기록이 드러났습니다."],
        peel: ["들뜬 모서리를 열었습니다. 봉인선을 따라 칼을 옮기십시오.", "겹쳐 붙였던 안쪽 종이와 기록이 펼쳐졌습니다."]
      };
      document.querySelector("#materialPuzzleGuide").textContent = progressCopy[materialPuzzleMode]?.[materialPuzzleStage - 1] || `감식 진행 · ${materialPuzzleStage}/2`;
      playSfx("buttonAlt", 0.55);
      if (materialPuzzleStage === 2) {
        document.querySelector("#materialPuzzleImage").src = `/samunmong/assets/interactions/${materialPuzzleFolder}/state-4.png`;
        tactilePuzzleProgress = -999;
        tool?.classList.add("complete");
        finishTactilePuzzle(materialPuzzleTool);
        return;
      }
      document.querySelector(`[data-material-target="${materialPuzzleStage + 1}"]`)?.classList.add("active");
    }

    function updateMaterialPuzzle(distance, dx, dy) {
      if (tactilePuzzleProgress < 0 || materialPuzzleMode === "sample") return;
      let gain = distance * 0.12;
      if (materialPuzzleMode === "brush") {
        const direction = Math.sign(dx);
        if (direction && materialLastDirection && direction !== materialLastDirection) gain += 16;
        if (direction) materialLastDirection = direction;
      } else if (materialPuzzleMode === "focus") {
        gain = Math.min(8, distance * 0.2);
      } else if (materialPuzzleMode === "light") {
        gain = Math.max(0, (-dy + dx) * 0.14);
      } else if (materialPuzzleMode === "peel") {
        gain = Math.max(0, dx * 0.2);
      }
      tactilePuzzleProgress = Math.min(100, tactilePuzzleProgress + gain);
      const state = Math.min(4, Math.floor(tactilePuzzleProgress / 28) + 1);
      const config = materialPuzzleConfig[materialPuzzleTool];
      document.querySelector("#materialPuzzleImage").src = `/samunmong/assets/interactions/${materialPuzzleFolder || config.folder}/state-${state}.png`;
      if (state > materialPuzzleStage) {
        materialPuzzleStage = state;
        playSfx("buttonAlt", 0.46);
      }
      if (tactilePuzzleProgress >= 84) {
        tactilePuzzleProgress = -999;
        document.querySelector("#materialPuzzleGuide").textContent = "숨은 흔적을 확인했습니다.";
        finishTactilePuzzle(materialPuzzleTool);
      }
    }

    function placeSamplePoint(point, targetPoint = point) {
      const samplePoint = Number(point);
      if (materialPuzzleMode !== "sample" || ![1, 2].includes(samplePoint) || placedMaterialSamples.has(samplePoint)) return;
      placedMaterialSamples.add(samplePoint);
      materialPuzzleStage = placedMaterialSamples.size;
      const config = materialPuzzleConfig[materialPuzzleTool];
      document.querySelector("#materialPuzzleImage").src = `/samunmong/assets/interactions/${config.folder}/state-${materialPuzzleStage === 2 ? 4 : 2}.png`;
      document.querySelector(`[data-sample-point="${point}"]`)?.setAttribute("disabled", "true");
      document.querySelector(`[data-sample-target="${targetPoint}"]`)?.classList.remove("active");
      document.querySelector(`[data-sample-target="${targetPoint}"]`)?.classList.add("complete");
      const placedLabel = document.querySelector(`[data-sample-point="${point}"]`)?.dataset.label || "표본";
      const finalSampleCopy = {
        "혈흔 시험포": "두 얼룩이 놓이자 시험포가 자동으로 번집니다. 피의 반응 색과 중심이 이어집니다.",
        "섬유 대조틀": "두 실을 걸자 대조틀의 눈금에서 굵기와 꼬임 방향이 이어집니다.",
        "먹빛 시험석": "두 먹방울이 번지며 서로 다른 마름 속도와 테두리가 드러납니다.",
        "증거 연결판": "두 증좌가 놓이자 공통 흔적의 붉은 핀이 자동으로 맞물립니다.",
        "흙 대조 접시": "두 흙을 놓자 체가 고운 흙과 짚 부스러기를 갈라 차이를 보여줍니다.",
        "상처 대조첩": "상처와 붕대를 포개자 피가 스민 중심과 감긴 방향이 맞물립니다."
      };
      document.querySelector("#materialPuzzleGuide").textContent = materialPuzzleStage === 1
        ? ["혈흔 시험포", "섬유 대조틀", "먹빛 시험석"].includes(materialPuzzleTool)
          ? `${placedLabel}을 놓았습니다. 남은 표본도 비어 있는 백자 잔에 올리십시오.`
          : `${placedLabel}을 놓았습니다. 남은 표본도 빛나는 자리에 올리십시오.`
        : finalSampleCopy[materialPuzzleTool] || "두 표본이 놓이자 공통 흔적이 드러났습니다.";
      playSfx("buttonAlt", 0.58);
      if (materialPuzzleStage === 2) finishTactilePuzzle(materialPuzzleTool);
    }

    function startSampleDrag(button, event) {
      if (materialPuzzleMode !== "sample" || button.disabled) return;
      sampleDragState = { button, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY };
      button.setPointerCapture?.(event.pointerId);
      button.classList.add("dragging");
      event.preventDefault();
    }

    function moveSampleDrag(event) {
      if (!sampleDragState || sampleDragState.pointerId !== event.pointerId) return;
      sampleDragState.button.style.setProperty("--sample-x", `${event.clientX - sampleDragState.startX}px`);
      sampleDragState.button.style.setProperty("--sample-y", `${event.clientY - sampleDragState.startY}px`);
      event.preventDefault();
    }

    function finishSampleDrag(event) {
      if (!sampleDragState || sampleDragState.pointerId !== event.pointerId) return;
      const { button } = sampleDragState;
      const point = Number(button.dataset.samplePoint);
      const sampleRect = button.getBoundingClientRect();
      const openTargets = [...document.querySelectorAll("#sampleTouchPoints [data-sample-target]")]
        .filter((target) => !target.hidden && !target.classList.contains("complete"));
      const matchedTarget = openTargets.find((target) => {
        const dropZone = target.getBoundingClientRect();
        const overlapWidth = Math.max(0, Math.min(sampleRect.right, dropZone.right) - Math.max(sampleRect.left, dropZone.left));
        const overlapHeight = Math.max(0, Math.min(sampleRect.bottom, dropZone.bottom) - Math.max(sampleRect.top, dropZone.top));
        const overlapArea = overlapWidth * overlapHeight;
        const sampleArea = Math.max(1, sampleRect.width * sampleRect.height);
        const pointerInside = event.clientX >= dropZone.left && event.clientX <= dropZone.right && event.clientY >= dropZone.top && event.clientY <= dropZone.bottom;
        return pointerInside || overlapArea / sampleArea >= 0.12;
      });
      sampleDragState = null;
      button.classList.remove("dragging");
      if (matchedTarget) {
        button.style.removeProperty("--sample-x");
        button.style.removeProperty("--sample-y");
        placeSamplePoint(button.dataset.samplePoint, matchedTarget.dataset.sampleTarget);
        return;
      }
      button.classList.add("wrong-fit");
      button.style.removeProperty("--sample-x");
      button.style.removeProperty("--sample-y");
      window.setTimeout(() => button.classList.remove("wrong-fit"), 260);
      document.querySelector("#materialPuzzleGuide").textContent = ["혈흔 시험포", "섬유 대조틀", "먹빛 시험석"].includes(materialPuzzleTool)
        ? "천 조각이 백자 잔을 충분히 덮도록 올리십시오. 왼쪽과 오른쪽 어느 빈 잔이든 괜찮습니다."
        : "현재 표본과 같은 이름의 빛나는 자리에 놓으십시오.";
    }

    function prepareSpecialPuzzle(mode, folder, title, guide, gesture) {
      specialPuzzleMode = mode;
      specialPuzzleStep = 0;
      tactilePuzzleProgress = 0;
      tactilePuzzlePointer = null;
      materialLastDirection = 0;
      document.querySelector("#specialPuzzleTitle").textContent = title;
      document.querySelector("#specialPuzzleGuide").textContent = guide;
      document.querySelector("#specialPuzzleGesture").textContent = gesture;
      document.querySelector("#ledgerRecoveredRecords")?.remove();
      const puzzleImage = document.querySelector("#specialPuzzleImage");
      puzzleImage.src = getSpecialPuzzleImageSrc(folder, 1);
      puzzleImage.onload = () => requestAnimationFrame(syncDirectAffordanceFragments);
      const points = document.querySelector("#specialTouchPoints");
      points.hidden = mode === "soil";
      points.dataset.specialMode = mode;
      points.dataset.activeStep = "1";
      const surfaceHandle = document.querySelector("#specialSurfaceHandle");
      surfaceHandle.hidden = mode !== "soil";
      surfaceHandle.dataset.surfaceMode = mode;
      const surfaceImage = document.querySelector("#specialSurfaceToolImage");
      surfaceImage.src = mode === "bandage" ? "/samunmong/assets/interactions/evidence-reverse/bloodied-bandage-inner-v2.png" : "/samunmong/assets/interactions/hand-tools-generated/joseon-bamboo-sieve-v2.png";
      surfaceImage.alt = mode === "bandage" ? "풀어낼 피 묻은 붕대 끝" : "조선식 대나무 체";
      document.querySelector("#specialSurfaceDirection").textContent = mode === "bandage" ? "→" : "↔";
      surfaceHandle.setAttribute("aria-label", mode === "bandage" ? "붕대 끝을 잡아 오른쪽으로 풀기" : "대나무 체를 잡아 좌우로 기울이기");
      surfaceHandle.classList.remove("dragging", "wrong-fit", "complete");
      surfaceHandle.style.setProperty("--surface-x", "0px");
      surfaceHandle.style.setProperty("--surface-y", "0px");
      surfaceHandle.style.setProperty("--surface-tilt", "0deg");
      specialSurfaceDrag = null;
      const explorerTool = document.querySelector("#specialExplorerTool");
      const explorerImage = document.querySelector("#specialExplorerToolImage");
      const explorerReaction = document.querySelector("#specialExplorerReaction");
      const usesExplorerTool = mode === "ink";
      explorerTool.hidden = !usesExplorerTool;
      explorerTool.classList.remove("dragging", "wrong-fit", "complete");
      explorerTool.style.setProperty("--explorer-x", "0px");
      explorerTool.style.setProperty("--explorer-y", "0px");
      specialExplorerDrag = null;
      if (usesExplorerTool) {
        explorerImage.src = "/samunmong/assets/interactions/direct-affordances/finger-loop-rubbing-wad-v1.png";
        explorerImage.alt = "먹선을 문지를 손가락 고리 먹뭉치";
        explorerReaction.src = mode === "ink"
            ? "/samunmong/assets/interactions/evidence-tools/ink-reveal.png"
            : "/samunmong/assets/interactions/evidence-tools/charcoal-sweep.png";
        explorerTool.setAttribute("aria-label", "먹뭉치를 잡아 겹친 먹선 문지르기");
      }
      const gestureArrows = getSpecialGestureArrows(mode);
      points.querySelectorAll("button").forEach((button, index) => {
        button.disabled = false;
        button.dataset.gesture = gestureArrows[index];
        button.dataset.label = mode === "pouch"
          ? ["반쯤 뒤집힌 주머니 안감", "", ""][index]
            : mode === "ledger"
            ? ["장부틀 왼쪽 등잔 손잡이", "", ""][index]
            : mode === "bandage"
              ? ["오른쪽으로 들린 붕대 끝", "", ""][index]
            : mode === "portrait"
              ? ["묶인 초상의 풀린 붉은 끈", "", ""][index]
              : mode === "ink"
                ? ["편지 먹", "덧쓴 먹", "장부 먹"][index]
                : mode === "norigae"
                  ? ["휘어진 고리에 걸린 남색 옷감", "", ""][index]
                  : mode === "bundle"
                    ? ["매듭에서 길게 나온 붉은 끈", "", ""][index]
                    : mode === "silk"
                      ? ["조인 고리 밖으로 나온 비단 꼬리", "", ""][index]
                      : mode === "hopaeThread"
                        ? ["호패 구멍 앞의 끊어진 끈 끝", "", ""][index]
                        : mode === "stride"
                          ? ["짚신 윤곽", "발뒤꿈치 기준", "보폭 실측줄"][index]
                          : mode === "thread"
                            ? ["첫 증거패", "둘째 증거패", "결론 매듭"][index]
                            : mode === "diary"
                              ? ["일기장을 잠근 대나무 핀", "", ""][index]
                              : mode === "hopaeMark"
                                ? ["말려 올라온 한지 탁본", "", ""][index]
                                : mode === "shoeMud" ? ["들린 진흙 껍질", "", ""][index]
                                : mode === "footprintTrace" ? ["기름 한지 대나무 축", "", ""][index]
            : "";
        button.setAttribute("aria-label", ["pouch", "ledger", "bandage", "portrait", "ink", "norigae", "bundle", "silk", "hopaeThread", "stride", "thread", "diary", "hopaeMark", "shoeMud", "footprintTrace"].includes(mode) ? `${button.dataset.label} 직접 움직이기` : `${index + 1}번째 흔적 직접 움직이기`);
        button.classList.remove("dragging", "wrong-fit");
        button.style.removeProperty("--special-x");
        button.style.removeProperty("--special-y");
      });
      openGlobalPanel("specialEvidencePuzzlePanel");
      requestAnimationFrame(syncDirectAffordanceFragments);
      playSfx("map", 0.62);
    }

    function getSpecialPuzzleImageSrc(folder, state) {
      const versions = {
        "bandage-puzzle": "unrolled-blood-pattern-v4",
        "bundle-puzzle": "two-person-escape-kit-v6",
        "hopae-thread-puzzle": "physical-hopae-cord-fit-v4",
        "hopae-mark-puzzle": "peeled-hopae-rubbing-v5",
        "ledger-timeline-puzzle": "rail-backlight-ledger-v5",
        "diary-timeline-puzzle": "accordion-diary-v4",
        "portrait-stroke-puzzle": "concealed-until-open-v5",
        "norigae-puzzle": "foreign-navy-fiber-v2",
        "pouch-lining-puzzle": "inside-out-cloth-pouch-v5",
        "silk-tension-puzzle": "flattened-goreum-v4",
        "stride-puzzle": "physical-stride-v3",
        "shoe-mud-puzzle": "peeled-mud-cast-v4",
        "footprint-trace-puzzle": "rolled-oiled-hanji-v4"
      };
      const version = versions[folder] ? `?v=${versions[folder]}` : "";
      return `/samunmong/assets/interactions/${folder}/state-${state}.png${version}`;
    }

    function getSpecialGestureArrows(mode) {
      return {
        norigae: ["↗", "←", "→"],
        bundle: ["→", "→", "→"],
        bandage: ["→", "→", "→"],
        ink: ["→", "←", "→"],
        portrait: ["↘", "↗", "↓"],
        hopaeThread: ["←", "←", "←"],
        stride: ["↓", "→", "→"],
        pouch: ["↓", "↓", "→"],
        silk: ["←", "→", "↓"],
        ledger: ["→", "→", "↓"],
        diary: ["→", "↑", "↑"], hopaeMark: ["↖", "←", "↓"], shoeMud: ["→", "→", "←"], footprintTrace: ["←", "↓", "→"],
        thread: ["→", "↘", "←"]
      }[mode] || ["→", "↓", "←"];
    }

    function getDirectAffordanceVector(gesture) {
      return {
        "→": [7, 0], "←": [-7, 0], "↑": [0, -7], "↓": [0, 7],
        "↗": [5, -5], "↖": [-5, -5], "↘": [5, 5], "↙": [-5, 5]
      }[gesture] || [5, 0];
    }

    function getPhysicalAffordanceAsset(mode, point) {
      const key = `${mode}:${point}`;
      if (["norigae:2", "norigae:3", "thread:1", "thread:3"].includes(key)) {
        return "/samunmong/assets/interactions/direct-affordances/cord-pull-loop-v1.png";
      }
      if (["footprintTrace:3", "stride:3"].includes(key)) {
        return "/samunmong/assets/interactions/evidence-tools/expanded/tool-footprint-measuring-cord.png";
      }
      return "";
    }

    function getPhysicalContactTrace(mode, point) {
      const key = `${mode}:${point}`;
      return "";
    }

    function syncDirectAffordanceFragments() {
      const stage = document.querySelector("#specialPuzzleStage");
      const board = document.querySelector("#specialPuzzleImage");
      const points = document.querySelector("#specialTouchPoints");
      if (!stage || !board || !points || !stage.clientWidth || !stage.clientHeight) return;
      points.querySelectorAll("button").forEach((button) => {
        let fragment = button.querySelector(".direct-affordance-fragment");
        if (!fragment) {
          fragment = document.createElement("img");
          fragment.className = "direct-affordance-fragment";
          fragment.alt = "";
          fragment.draggable = false;
          fragment.setAttribute("aria-hidden", "true");
          button.appendChild(fragment);
        }
        fragment.src = board.currentSrc || board.src;
        fragment.style.width = `${stage.clientWidth}px`;
        fragment.style.height = `${stage.clientHeight}px`;
        fragment.style.left = `${-button.offsetLeft}px`;
        fragment.style.top = `${-button.offsetTop}px`;
        const [idleX, idleY] = getDirectAffordanceVector(button.dataset.gesture);
        button.style.setProperty("--affordance-idle-x", `${idleX}px`);
        button.style.setProperty("--affordance-idle-y", `${idleY}px`);
        let physicalCue = button.querySelector(".physical-pull-affordance");
        const cueAsset = getPhysicalAffordanceAsset(points.dataset.specialMode, button.dataset.specialPoint);
        if (cueAsset && !physicalCue) {
          physicalCue = document.createElement("img");
          physicalCue.className = "physical-pull-affordance";
          physicalCue.alt = "";
          physicalCue.draggable = false;
          physicalCue.setAttribute("aria-hidden", "true");
          button.appendChild(physicalCue);
        }
        if (physicalCue) {
          physicalCue.hidden = !cueAsset;
          if (cueAsset) physicalCue.src = cueAsset;
        }
        button.classList.toggle("has-physical-affordance", Boolean(cueAsset));
        let contactTrace = button.querySelector(".physical-contact-trace");
        const traceAsset = getPhysicalContactTrace(points.dataset.specialMode, button.dataset.specialPoint);
        if (traceAsset && !contactTrace) {
          contactTrace = document.createElement("img");
          contactTrace.className = "physical-contact-trace";
          contactTrace.alt = "";
          contactTrace.draggable = false;
          contactTrace.setAttribute("aria-hidden", "true");
          button.prepend(contactTrace);
        }
        if (contactTrace) {
          contactTrace.hidden = !traceAsset;
          if (traceAsset) contactTrace.src = traceAsset;
        }
      });
    }

    function startSpecialDrag(button, event) {
      if (["soil", "ink"].includes(specialPuzzleMode) || button.disabled) return;
      specialDragState = { button, pointerId: event.pointerId, x: event.clientX, y: event.clientY };
      button.setPointerCapture?.(event.pointerId);
      button.classList.add("dragging");
      document.querySelector("#specialPuzzleStage")?.classList.add("is-direct-manipulating");
      event.preventDefault();
    }

    function moveSpecialDrag(event) {
      if (!specialDragState || specialDragState.pointerId !== event.pointerId) return;
      specialDragState.button.style.setProperty("--special-x", `${Math.max(-80, Math.min(80, event.clientX - specialDragState.x))}px`);
      specialDragState.button.style.setProperty("--special-y", `${Math.max(-80, Math.min(80, event.clientY - specialDragState.y))}px`);
      event.preventDefault();
    }

    function specialGestureMatches(arrow, dx, dy) {
      const vectors = { "→": [1, 0], "←": [-1, 0], "↑": [0, -1], "↓": [0, 1], "↗": [0.7, -0.7], "↖": [-0.7, -0.7], "↘": [0.7, 0.7], "↙": [-0.7, 0.7] };
      const [vx, vy] = vectors[arrow] || [1, 0];
      return dx * vx + dy * vy > 42;
    }

    function finishSpecialDrag(event) {
      if (!specialDragState || specialDragState.pointerId !== event.pointerId) return;
      const { button, x, y } = specialDragState;
      specialDragState = null;
      const matches = specialGestureMatches(button.dataset.gesture, event.clientX - x, event.clientY - y);
      button.classList.remove("dragging");
      document.querySelector("#specialPuzzleStage")?.classList.remove("is-direct-manipulating");
      button.style.removeProperty("--special-x");
      button.style.removeProperty("--special-y");
      if (matches) {
        selectSpecialPoint(button.dataset.specialPoint);
        return;
      }
      button.classList.add("wrong-fit");
      window.setTimeout(() => button.classList.remove("wrong-fit"), 280);
      document.querySelector("#specialPuzzleGuide").textContent = specialPuzzleMode === "pouch"
        ? "입구 밖으로 나온 베이지색 안감의 아래 끝을 잡아 아래로 끝까지 뒤집으십시오."
        : `${button.dataset.label || "움직이는 부분"}을 잡고 물건이 풀리는 결을 따라 끝까지 움직이십시오.`;
      playSfx("buttonAlt", 0.34);
    }

    function startSpecialExplorerDrag(event) {
      const tool = document.querySelector("#specialExplorerTool");
      if (!tool || tool.hidden || !["portrait", "ink"].includes(specialPuzzleMode)) return;
      specialExplorerDrag = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
      tool.setPointerCapture?.(event.pointerId);
      tool.classList.add("dragging");
      document.querySelector("#specialPuzzleStage")?.classList.add("is-direct-manipulating");
      event.preventDefault();
    }

    function moveSpecialExplorerDrag(event) {
      if (!specialExplorerDrag || specialExplorerDrag.pointerId !== event.pointerId) return;
      const tool = document.querySelector("#specialExplorerTool");
      tool?.style.setProperty("--explorer-x", `${event.clientX - specialExplorerDrag.x}px`);
      tool?.style.setProperty("--explorer-y", `${event.clientY - specialExplorerDrag.y}px`);
      event.preventDefault();
    }

    function finishSpecialExplorerDrag(event) {
      if (!specialExplorerDrag || specialExplorerDrag.pointerId !== event.pointerId) return;
      specialExplorerDrag = null;
      const tool = document.querySelector("#specialExplorerTool");
      tool?.classList.remove("dragging");
      tool?.style.setProperty("--explorer-x", "0px");
      tool?.style.setProperty("--explorer-y", "0px");
      document.querySelector("#specialPuzzleStage")?.classList.remove("is-direct-manipulating");
      const hit = [...document.querySelectorAll("#specialTouchPoints [data-special-point]:not(:disabled)")].find((target) => {
        const rect = target.getBoundingClientRect();
        return event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
      });
      if (hit) {
        selectSpecialPoint(hit.dataset.specialPoint);
        return;
      }
      tool?.classList.add("wrong-fit");
      window.setTimeout(() => tool?.classList.remove("wrong-fit"), 320);
      document.querySelector("#specialPuzzleGuide").textContent = specialPuzzleMode === "portrait"
          ? "먹뭉치를 겹쳐진 얼굴선 위에 대고 문질러 보십시오."
          : "먹뭉치를 번짐 테두리가 다른 먹자국 위에 대고 문질러 보십시오.";
      playSfx("buttonAlt", 0.34);
    }

    function openNorigaePuzzle() {
      prepareSpecialPuzzle("norigae", "norigae-puzzle", "노리개에 걸린 옷감 빼내기", "휘어진 장식 고리에 팽팽하게 걸린 남색 옷감 끝을 잡아 오른쪽 위로 빼내십시오.", "걸린 남색 옷감 빼내기");
    }

    function openSoilSievePuzzle() {
      prepareSpecialPuzzle("soil", "soil-sieve-puzzle", "흙과 짚 가려내기", "접시를 좌우로 번갈아 흔들어 알갱이를 층으로 나누십시오.", "↔ 접시 흔들기");
    }

    function openRedThreadPuzzle(firstName, secondName, key, comparison) {
      pendingEvidenceComparison = { firstName, secondName, key, comparison };
      const names = new Set([firstName, secondName]);
      if (names.has("호패 조각") && names.has("끊어진 호패끈")) {
        prepareSpecialPuzzle("hopaeThread", "hopae-thread-puzzle", "붉은 꼰끈의 주인 찾기", "따로 놓인 끈의 거칠게 끊어진 끝을 잡아 호패의 둥근 구멍에 직접 대어 보십시오.", "끊어진 끝을 호패 구멍에 맞추기");
        return;
      }
      if (names.has("진흙 묻은 짚신") && names.has("작은 발자국")) {
        prepareSpecialPuzzle("stride", "stride-puzzle", "짚신과 발자국 포개기", "따로 놓인 짚신을 직접 잡아 진흙 발자국 위에 포개십시오.", "윤곽 포개기 → 실측줄 늘리기");
        return;
      }
      prepareSpecialPuzzle("thread", "red-thread-puzzle", "두 증거의 공통 흔적 묶기", "첫 증거패에서 풀려 나온 붉은 실을 잡아 다른 증거패에 이으십시오.", "증거 잇기 → 결론 매듭 죄기");
    }

    function openBundlePuzzle() {
      prepareSpecialPuzzle("bundle", "bundle-puzzle", "돌쇠의 도망 보따리 풀기", "중앙 매듭에서 오른쪽으로 길게 나온 붉은 끈을 잡아 한 번에 당기십시오.", "실제 매듭끈을 당겨 보따리 펼치기");
    }

    function openBandagePuzzle() {
      prepareSpecialPuzzle("bandage", "bandage-puzzle", "피 묻은 붕대 펼치기", "오른쪽 끝에서 들려 있는 실제 붕대 끝을 잡아 오른쪽으로 길게 당기십시오.", "붕대 한 번에 펼치기");
    }

    function openInkMatchPuzzle() {
      prepareSpecialPuzzle("ink", "ink-match-puzzle", "먹 번짐 대조하기", "정답 순서는 없습니다. 세 먹자국을 어느 것부터든 문질러 번지는 속도와 테두리를 비교하십시오.", "먹자국 하나씩 문질러 보기");
    }

    function openPortraitStrokePuzzle() {
      prepareSpecialPuzzle("portrait", "portrait-stroke-puzzle", "숨겨 둔 돌쇠의 초상 펼치기", "말아 둔 초상을 묶은 붉은 끈의 풀린 끝을 잡아 오른쪽 아래로 당기십시오.", "초상 묶은 끈 풀기");
    }

    function openPouchLiningPuzzle() {
      prepareSpecialPuzzle("pouch", "pouch-lining-puzzle", "주머니 속에 있던 물건 확인하기", "주머니 가운데로 길게 나온 베이지색 안감의 접힌 아랫단을 잡아 아래로 당기십시오. 안쪽에 남은 물건 자국이 선명해집니다.", "베이지색 안감 아랫단 당기기");
    }

    function openSilkTensionPuzzle() {
      prepareSpecialPuzzle("silk", "silk-tension-puzzle", "조인 비단끈 풀어 보기", "매듭에서 길게 빠져나온 찢긴 비단 끝을 잡아 왼쪽으로 천천히 당기십시오.", "찢긴 비단 끝 잡아당기기");
    }

    function openLedgerTimelinePuzzle() {
      prepareSpecialPuzzle("ledger", "ledger-timeline-puzzle", "덧칠된 출입 기록 비추기", "장부틀 왼쪽에서 튀어나온 검은 나무 손잡이를 잡아 오른쪽으로 미십시오.", "등잔 손잡이 오른쪽으로 밀기");
    }

    function showLedgerRecoveredRecords() {
      const stage = document.querySelector("#specialPuzzleStage");
      if (!stage || document.querySelector("#ledgerRecoveredRecords")) return;
      const records = [
        ["유시", "무덕", "사랑방에 차를 올림"],
        ["초경", "돌쇠", "심부름 뒤 바깥채로 돌아감"],
        ["초경 반", "춘월", "혼서 문제로 사랑방을 다녀감"],
        ["이경", "유문석", "대문과 뒷문 빗장을 살핌"],
        ["이경 뒤", "무덕", "빗소리에 젖은 빨래를 걷음"],
        ["이경 뒤", "먹으로 덧칠됨", "안채에서 뒷문 쪽으로 나감"]
      ];
      const reveal = document.createElement("section");
      reveal.id = "ledgerRecoveredRecords";
      reveal.className = "ledger-recovered-records";
      reveal.setAttribute("aria-label", "등잔으로 복원한 하인 장부 출입 기록");
      reveal.innerHTML = `
        <header><span>등잔 아래 드러난 기록</span><strong>유월 그믐밤 출입 장부</strong></header>
        <ol>${records.map(([time, name, action], index) => `
          <li class="${index === records.length - 1 ? "erased" : ""}">
            <time>${escapeHtml(time)}</time><b>${escapeHtml(name)}</b><span>${escapeHtml(action)}</span>
          </li>`).join("")}</ol>
        <p>여러 사람이 오간 기록 사이에서 마지막 이름만 덮였음. 누가 지웠고 누구의 이름인지는 이 장부만으로 알 수 없음.</p>
        <button type="button">장부에 옮겨 적기</button>`;
      reveal.querySelector("button")?.addEventListener("click", () => {
        finishTactilePuzzle("촛불 비추기");
      }, { once: true });
      stage.appendChild(reveal);
      document.querySelector("#specialPuzzleGuide").textContent = "여러 사람이 오간 기록 사이에서 이름 하나만 나중에 덮였습니다. 내용을 살핀 뒤 장부에 옮겨 적으십시오.";
      playSfx("paper", 0.65);
    }

    function openDiaryTimelinePuzzle() {
      prepareSpecialPuzzle("diary", "diary-timeline-puzzle", "먹에 붙은 일기 세 장 펼치기", "오른쪽으로 튀어나온 대나무 손잡이를 잡아 오른쪽으로 당기면, 붙어 있던 세 장의 날짜 기록이 펼쳐집니다.", "오른쪽 대나무 손잡이 당기기");
    }
    function openHopaeMarkPuzzle() {
      prepareSpecialPuzzle("hopaeMark", "hopae-mark-puzzle", "호패 이름 홈 탁본 벗기기", "호패 위에서 말려 올라온 한지 귀퉁이를 잡아 왼쪽 위로 벗기십시오.", "한지 탁본 벗기기");
    }
    function openShoeMudPuzzle() { prepareSpecialPuzzle("shoeMud", "shoe-mud-puzzle", "짚신 밑창의 진흙 본 벗기기", "뒤꿈치에서 들린 진흙 껍질을 잡아 짚신 앞쪽으로 한 번에 벗기십시오.", "진흙 껍질 벗기기"); }
    function openFootprintTracePuzzle() { prepareSpecialPuzzle("footprintTrace", "footprint-trace-puzzle", "작은 발자국 윤곽 뜨기", "오른쪽 대나무 축을 잡아 왼쪽으로 굴려 기름 한지를 발자국 위에 펼치십시오.", "한지 축 왼쪽으로 굴리기"); }

    function selectSpecialPoint(point) {
      if (specialPuzzleMode === "soil") return;
      const expectedSequences = {
        norigae: [1],
        bundle: [1],
        bandage: [1],
        ink: [2, 1, 3],
        portrait: [1],
        hopaeThread: [1],
        stride: [1, 3],
        pouch: [1],
        silk: [1],
        ledger: [1],
        diary: [1], hopaeMark: [1], shoeMud: [1], footprintTrace: [1],
        thread: [1, 3]
      };
      const expected = expectedSequences[specialPuzzleMode] || [1, 2, 3];
      if (!["portrait", "ink"].includes(specialPuzzleMode) && Number(point) !== expected[specialPuzzleStep]) {
        document.querySelector("#specialPuzzleGuide").textContent = specialPuzzleMode === "norigae" ? "실 길이가 맞지 않습니다 · 다른 장식부터" : specialPuzzleMode === "bundle" ? "아래 천이 걸렸습니다 · 위쪽 귀부터" : specialPuzzleMode === "ink" ? "먹빛이 너무 진해집니다 · 연한 먹부터" : specialPuzzleMode === "portrait" ? "이 선은 위에 덧그려졌습니다 · 아래 획부터" : specialPuzzleMode === "stride" ? "보폭 순서가 어긋납니다 · 뒤꿈치부터" : specialPuzzleMode === "pouch" ? ["가운데 홈의 말린 받침천 귀퉁이를 잡아 올리십시오.", "들린 받침천을 아래쪽으로 끝까지 벗기십시오."][specialPuzzleStep] : specialPuzzleMode === "silk" ? "비단 결이 반대로 꺾입니다 · 늘어난 끝부터" : specialPuzzleMode === "ledger" ? "시간 간격이 맞지 않습니다 · 이른 흔적부터" : "연결 순서가 어긋납니다 · 시작점부터";
        document.querySelector("#specialEvidencePuzzlePanel")?.classList.add("puzzle-miss");
        window.setTimeout(() => document.querySelector("#specialEvidencePuzzlePanel")?.classList.remove("puzzle-miss"), 280);
        return;
      }
      specialPuzzleStep += 1;
      const folderByMode = { norigae: "norigae-puzzle", bundle: "bundle-puzzle", bandage: "bandage-puzzle", ink: "ink-match-puzzle", portrait: "portrait-stroke-puzzle", hopaeThread: "hopae-thread-puzzle", stride: "stride-puzzle", pouch: "pouch-lining-puzzle", silk: "silk-tension-puzzle", ledger: "ledger-timeline-puzzle", diary: "diary-timeline-puzzle", hopaeMark: "hopae-mark-puzzle", shoeMud: "shoe-mud-puzzle", footprintTrace: "footprint-trace-puzzle", thread: "red-thread-puzzle" };
      const folder = folderByMode[specialPuzzleMode] || "red-thread-puzzle";
      document.querySelector("#specialPuzzleImage").src = getSpecialPuzzleImageSrc(folder, specialPuzzleStep + 1);
      document.querySelector(`[data-special-point="${point}"]`)?.setAttribute("disabled", "true");
      document.querySelector("#specialTouchPoints").dataset.activeStep = String(Math.min(3, specialPuzzleStep + 1));
      requestAnimationFrame(syncDirectAffordanceFragments);
      document.querySelector("#specialPuzzleGuide").textContent = specialPuzzleMode === "pouch"
        ? ["", "안감에 길쭉한 호패 눌림과 잘린 붉은 끈 섬유가 함께 남았습니다. 누군가 끈을 끊어 호패를 꺼낸 것일까요?"][specialPuzzleStep]
        : specialPuzzleMode === "norigae"
          ? ["", "휘어진 고리에서 노리개와 재질이 다른 남색 옷감이 빠졌습니다. 오래 닳은 것이 아니라 다른 옷에 강하게 걸렸던 흔적입니다."][specialPuzzleStep]
        : specialPuzzleMode === "bundle"
            ? ["", "크기가 다른 두 벌의 옷과 두 끼분 식량, 노잣돈이 함께 싸여 있습니다. 두 사람이 떠날 준비였고, 젖은 마당 흙이 묻은 뒤 마른 실내에서 한 번 열렸습니다."][specialPuzzleStep]
            : specialPuzzleMode === "bandage"
              ? ["", "왼쪽의 짙은 최초 혈흔에서 오른쪽으로 옅어지는 반복 자국이 이어집니다. 좁은 팔에 감았던 붕대이며, 팔 상처와 대조해야 주인을 알 수 있습니다."][specialPuzzleStep]
          : specialPuzzleMode === "silk"
            ? ["", "매듭을 펴자 가운데에 좁게 조여 마찰로 번들거린 자국과, 힘을 받아 한 방향으로 늘어난 찢김이 드러납니다. 단순히 낡아 끊어진 끈은 아닌 것 같습니다."][specialPuzzleStep]
              : specialPuzzleMode === "hopaeThread"
                ? ["", "끊어진 끝을 대자 끈의 굵기와 호패 구멍 안쪽의 오래 눌린 마찰 홈이 맞습니다. 이 붉은 끈은 호패에 매여 있던 끈인 것 같습니다."][specialPuzzleStep]
                : specialPuzzleMode === "stride"
                  ? ["", "뒤꿈치를 맞추자 짚신 앞코가 발자국 밖으로 나옵니다. 실측줄을 오른쪽으로 늘리십시오.", "현장 발자국은 짚신보다 짧고 폭도 좁아 같은 사람의 흔적이 아닙니다."][specialPuzzleStep]
                  : specialPuzzleMode === "thread"
                    ? ["", "두 증거가 한 줄로 이어졌습니다. 위쪽 결론 매듭을 왼쪽으로 당겨 고정하십시오.", "두 증거의 공통 흔적이 하나의 사건 흐름으로 묶였습니다."][specialPuzzleStep]
        : specialPuzzleMode === "ledger"
          ? ["", "등잔의 배면광 아래 검은 덧칠보다 먼저 눌린 붓획이 한 줄 전체에 이어집니다. 이 칸은 처음부터 빈칸이 아니라 기록한 뒤 일부러 지운 자리입니다."][specialPuzzleStep]
        : specialPuzzleMode === "diary"
            ? ["", "세 장이 펼쳐졌습니다. 6월 29일의 울음, 6월 30일의 뒷문 발자국, 7월 1일 아씨가 돌쇠 이름을 물었다는 기록이 이어집니다."][specialPuzzleStep]
            : specialPuzzleMode === "hopaeMark"
              ? ["", "탁본의 짙고 이어진 원래 홈 위로, 옅고 끊긴 새 긁힘이 겹칩니다. 누군가 이름 홈을 나중에 일부러 훼손했습니다."][specialPuzzleStep]
              : specialPuzzleMode === "shoeMud" ? ["", "진흙 본과 드러난 짚신 밑창에 같은 짜임이 남았습니다. 다른 발자국과 대조할 수 있는 밑창 무늬를 확보했습니다."][specialPuzzleStep]
              : specialPuzzleMode === "footprintTrace" ? ["", "기름 한지에 짧고 좁은 발 윤곽과 이동 방향이 그대로 남았습니다. 짚신 밑창 기록과 대조할 수 있습니다."][specialPuzzleStep]
          : specialPuzzleMode === "portrait"
            ? ["", "묶인 초상에서 여러 번 고친 얼굴과 가장자리의 지운 글씨 획이 드러났습니다."][specialPuzzleStep]
            : specialPuzzleMode === "ink"
              ? ["", "첫 먹은 천천히 번지고 가장자리가 고르게 마릅니다.", "다른 먹은 빠르게 퍼져 테두리가 짙게 남습니다.", "원문과 덧쓴 문장은 같은 때 쓴 것이 아니라, 다른 먹으로 나중에 고친 흔적입니다."][specialPuzzleStep]
          : specialPuzzleStep < 3 ? `한 단계 진행했습니다 · ${specialPuzzleStep}/3` : specialPuzzleMode === "norigae" ? "매듭 속 낯선 남색 섬유가 드러났습니다." : specialPuzzleMode === "bundle" ? "보따리 속 이동 준비물이 모두 드러났습니다." : specialPuzzleMode === "ink" ? "문서와 같은 먹 농도를 찾았습니다." : specialPuzzleMode === "portrait" ? "처음 그린 선과 지워진 흔적을 복원했습니다." : specialPuzzleMode === "hopaeThread" ? "끈 굵기와 오래된 마찰 홈이 정확히 맞습니다." : specialPuzzleMode === "stride" ? "짚신보다 발자국의 길이와 보폭이 짧습니다." : specialPuzzleMode === "silk" ? "비단실이 날이 아니라 강한 힘에 끊겼습니다." : "두 증거의 물리적 관계가 이어졌습니다.";
      playSfx("buttonAlt", 0.58);
      const requiredSpecialSteps = ["ledger", "bandage", "hopaeMark", "portrait", "norigae", "diary", "shoeMud", "footprintTrace", "pouch", "silk", "bundle", "hopaeThread"].includes(specialPuzzleMode) ? 1 : ["stride", "thread"].includes(specialPuzzleMode) ? 2 : 3;
      if (specialPuzzleStep !== requiredSpecialSteps) return;
      document.querySelector("#specialExplorerTool")?.classList.add("complete");
      if (specialPuzzleMode === "norigae") {
        finishTactilePuzzle(getPendingToolStep(currentEvidenceForTool)?.tool || "매듭 해체 송곳");
        return;
      }
      if (specialPuzzleMode === "bundle") {
        finishTactilePuzzle(getPendingToolStep(currentEvidenceForTool)?.tool || "먼지털이 붓");
        return;
      }
      if (specialPuzzleMode === "bandage") {
        finishTactilePuzzle(getPendingToolStep(currentEvidenceForTool)?.tool || "혈흔 시험포");
        return;
      }
      if (specialPuzzleMode === "ink") {
        finishTactilePuzzle("먹빛 시험석");
        return;
      }
      if (specialPuzzleMode === "portrait") {
        finishTactilePuzzle("돋보기");
        return;
      }
      if (["pouch", "silk"].includes(specialPuzzleMode)) {
        finishTactilePuzzle("돋보기");
        return;
      }
      if (specialPuzzleMode === "ledger") {
        showLedgerRecoveredRecords();
        return;
      }
      if (specialPuzzleMode === "diary") {
        finishTactilePuzzle("촛불 비추기");
        return;
      }
      if (specialPuzzleMode === "hopaeMark") { finishTactilePuzzle("먼지털이 붓"); return; }
      if (["shoeMud", "footprintTrace"].includes(specialPuzzleMode)) { finishTactilePuzzle("발자국 실측줄"); return; }
      const pending = pendingEvidenceComparison;
      if (!pending) return;
      if (specialPuzzleMode === "hopaeThread") {
        registerExaminedClue(
          "끊어진 호패끈",
          "호패 조각과 대조",
          pending.comparison.result,
          pending.comparison.asset
        );
      }
      const linkedPairs = new Set(readStoredNames(linkedEvidenceKey));
      linkedPairs.add(pending.key);
      localStorage.setItem(linkedEvidenceKey, JSON.stringify([...linkedPairs]));
      document.querySelectorAll(`#toolEvidenceList [data-evidence="${pending.firstName}"], #toolEvidenceList [data-evidence="${pending.secondName}"]`).forEach((item) => item.classList.add("linked"));
      const storyConclusion = evidenceConnections.find(([first, second]) => evidencePairKey(first, second) === pending.key)?.[2] || "두 증거가 같은 사건 흐름을 가리킵니다.";
      window.setTimeout(() => {
        openGlobalPanel("toolPanel");
        const previewNote = document.querySelector("#toolPreviewNote");
        if (previewNote) previewNote.textContent = sentenceBreakText(pending.comparison.result).split("\n").find(Boolean) || "두 증거의 관계를 확인했습니다.";
        showToolConclusion(pending.firstName, pending.comparison.result, storyConclusion);
        updateEvidenceThreadUI();
        showToast("증거 연결 완료");
      }, 420);
      playSfx("evidence", 0.86);
    }

    function startSpecialSurfaceDrag(event) {
      if (!['soil', 'bandage'].includes(specialPuzzleMode) || tactilePuzzleProgress < 0) return;
      const handle = event.currentTarget;
      handle.setPointerCapture?.(event.pointerId);
      specialSurfaceDrag = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY };
      handle.classList.add("dragging");
      event.preventDefault();
    }

    function moveSpecialSurfaceDrag(event) {
      if (!specialSurfaceDrag || specialSurfaceDrag.pointerId !== event.pointerId) return;
      const handle = document.querySelector("#specialSurfaceHandle");
      const dx = event.clientX - specialSurfaceDrag.startX;
      const dy = event.clientY - specialSurfaceDrag.startY;
      handle?.style.setProperty("--surface-x", `${dx}px`);
      handle?.style.setProperty("--surface-y", `${dy}px`);
      handle?.style.setProperty("--surface-tilt", `${Math.max(-13, Math.min(13, dx / 9))}deg`);
      event.preventDefault();
    }

    function finishSpecialSurfaceDrag(event) {
      if (!specialSurfaceDrag || specialSurfaceDrag.pointerId !== event.pointerId) return;
      const handle = document.querySelector("#specialSurfaceHandle");
      const dx = event.clientX - specialSurfaceDrag.startX;
      const dy = event.clientY - specialSurfaceDrag.startY;
      const expectedDirection = specialPuzzleMode === "bandage" ? 1 : (specialPuzzleStep % 2 === 0 ? -1 : 1);
      const correct = Math.abs(dx) > 80 && Math.abs(dx) > Math.abs(dy) * 1.7 && Math.sign(dx) === expectedDirection;
      specialSurfaceDrag = null;
      handle?.classList.remove("dragging");
      handle?.style.setProperty("--surface-x", "0px");
      handle?.style.setProperty("--surface-y", "0px");
      handle?.style.setProperty("--surface-tilt", "0deg");
      if (!correct) {
        handle?.classList.remove("wrong-fit");
        void handle?.offsetWidth;
        handle?.classList.add("wrong-fit");
        document.querySelector("#specialPuzzleGuide").textContent = specialPuzzleMode === "bandage" ? "붕대 끝을 감긴 결을 따라 오른쪽으로 길게 당기십시오." : `${expectedDirection < 0 ? "왼쪽" : "오른쪽"}으로 체 손잡이를 기울이십시오.`;
        return;
      }
      specialPuzzleStep += 1;
      const folder = specialPuzzleMode === "bandage" ? "bandage-puzzle" : "soil-sieve-puzzle";
      document.querySelector("#specialPuzzleImage").src = getSpecialPuzzleImageSrc(folder, specialPuzzleStep + 1);
      const surfaceRequiredSteps = specialPuzzleMode === "bandage" ? 1 : 2;
      if (specialPuzzleMode === "bandage") {
        document.querySelector("#specialPuzzleGuide").textContent = "붕대가 한 번에 펼쳐져 안쪽 혈흔의 시작점과 감긴 방향이 드러났습니다.";
      } else {
        const nextDirection = specialPuzzleStep % 2 === 0 ? "왼쪽" : "오른쪽";
        document.querySelector("#specialPuzzleGuide").textContent = specialPuzzleStep < surfaceRequiredSteps ? `굵은 흙이 한쪽으로 갈렸습니다. 체를 ${nextDirection}으로 한 번 더 기울이십시오.` : "두 번 체질하자 흙과 짚 사이에서 창백한 돌 알갱이가 분리됐습니다.";
      }
      playSfx("buttonAlt", 0.58);
      if (specialPuzzleStep === surfaceRequiredSteps) {
        document.querySelector("#specialPuzzleImage").src = getSpecialPuzzleImageSrc(folder, 4);
        tactilePuzzleProgress = -999;
        handle?.classList.add("complete");
        finishTactilePuzzle(specialPuzzleMode === "bandage" ? "상처 대조첩" : "흙 대조 접시");
      }
    }

    function closeToolResultPopup() {
      const panel = document.querySelector("#toolResultPopup");
      panel?.classList.remove("show");
      panel?.setAttribute("aria-hidden", "true");
      const hasOpenGlobalPanel = globalPanels.some((panel) => panel.classList.contains("show"));
      if (!hasOpenGlobalPanel && !evidenceBagPop.classList.contains("open")) {
        globalOverlay.classList.remove("show");
      }
      const evidenceButtons = [...document.querySelectorAll("#toolEvidenceList .tool-evidence-option")];
      const currentIndex = evidenceButtons.findIndex((button) => button.dataset.evidence === currentEvidenceForTool);
      const orderedButtons = evidenceButtons.slice(currentIndex + 1).concat(evidenceButtons.slice(0, currentIndex + 1));
      const nextButton = orderedButtons.find((button) => getPendingToolStep(button.dataset.evidence));
      if (nextButton && nextButton.dataset.evidence !== currentEvidenceForTool) {
        setAnalysisTarget(nextButton.dataset.evidence);
        showToast(`다음 증거 · ${nextButton.dataset.evidence}`);
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

      const activeStep = getPendingToolStep(currentEvidenceForTool);
      if (!activeStep && getToolAnalysisSteps(currentEvidenceForTool).length) {
        showToast("이 증거의 도구 분석은 모두 마쳤습니다.");
        return;
      }
      const expectedTool = activeStep?.tool || data.tool;
      if (expectedTool !== toolName) {
        document.querySelector(".tool-preview")?.classList.add("wrong-tool");
        setTimeout(() => document.querySelector(".tool-preview")?.classList.remove("wrong-tool"), 520);
        showToast("다른 도구를 시도해 보세요.");
        return;
      }
      if (!tactilePuzzleBypass && toolName === "문서 맞춤판" && ["혼서 조각", "찢어진 약속 편지"].includes(currentEvidenceForTool)) {
        openDocumentAssembly(currentEvidenceForTool);
        return;
      }
      if (!tactilePuzzleBypass && ["탁본 도구", "압흔 탁본판"].includes(toolName)) {
        openRubbingPuzzle();
        return;
      }
      if (!tactilePuzzleBypass && toolName === "돋보기" && currentEvidenceForTool === "헐거워진 노리개") {
        openNorigaePuzzle();
        return;
      }
      if (!tactilePuzzleBypass && toolName === "먼지털이 붓" && currentEvidenceForTool === "호패 조각") { openHopaeMarkPuzzle(); return; }
      if (!tactilePuzzleBypass && toolName === "먼지털이 붓" && currentEvidenceForTool === "도망 보따리") { openBundlePuzzle(); return; }
      if (!tactilePuzzleBypass && toolName === "돋보기" && currentEvidenceForTool === "돌쇠의 그림") {
        openPortraitStrokePuzzle();
        return;
      }
      if (!tactilePuzzleBypass && toolName === "돋보기" && currentEvidenceForTool === "빈 호패 주머니") {
        openPouchLiningPuzzle();
        return;
      }
      if (!tactilePuzzleBypass && toolName === "돋보기" && currentEvidenceForTool === "찢어진 옷고름") {
        openSilkTensionPuzzle();
        return;
      }
      if (!tactilePuzzleBypass && toolName === "촛불 비추기" && currentEvidenceForTool === "하인 장부") {
        openLedgerTimelinePuzzle();
        return;
      }
      if (!tactilePuzzleBypass && toolName === "촛불 비추기" && currentEvidenceForTool === "무덕의 번진 일기") {
        openDiaryTimelinePuzzle();
        return;
      }
      if (!tactilePuzzleBypass && toolName === "매듭 해체 송곳") {
        if (currentEvidenceForTool === "헐거워진 노리개") {
          openNorigaePuzzle();
          return;
        }
        if (currentEvidenceForTool === "도망 보따리") {
          openBundlePuzzle();
          return;
        }
        openKnotPuzzle();
        return;
      }
      if (!tactilePuzzleBypass && toolName === "발자국 실측줄") {
        if (currentEvidenceForTool === "진흙 묻은 짚신") openShoeMudPuzzle();
        else if (currentEvidenceForTool === "작은 발자국") openFootprintTracePuzzle();
        else openFootprintPuzzle();
        return;
      }
      if (!tactilePuzzleBypass && toolName === "흙 대조 접시") {
        openSoilSievePuzzle();
        return;
      }
      if (!tactilePuzzleBypass && toolName === "상처 대조첩" && currentEvidenceForTool === "피 묻은 붕대") {
        openBandagePuzzle();
        return;
      }
      if (!tactilePuzzleBypass && toolName === "먹빛 시험석" && ["무덕의 번진 일기", "하인 장부", "혼서 조각", "찢어진 약속 편지"].includes(currentEvidenceForTool)) {
        openInkMatchPuzzle();
        return;
      }
      if (!tactilePuzzleBypass && openMaterialPuzzle(toolName)) return;

      const requiredEvidence = [
        ...(Array.isArray(data.comparisonWith) ? data.comparisonWith : data.comparisonWith ? [data.comparisonWith] : []),
        ...(Array.isArray(activeStep?.requiresEvidence) ? activeStep.requiresEvidence : [])
      ];
      const missingEvidence = requiredEvidence.find((name) => !readStoredNames(collectedEvidenceKey).includes(name));
      if (missingEvidence) {
        toolAnalysisCompleted = false;
        updateToolProgress(72);
        document.querySelector("#toolReactionLayer")?.classList.remove("show", "success");
        showToast(`교차 대조할 증거 ‘${missingEvidence}’도 먼저 확보해야 합니다.`);
        const previewNote = document.querySelector("#toolPreviewNote");
        if (previewNote) previewNote.textContent = `현재 증거의 기록은 얻었지만 ‘${missingEvidence}’이 없어 아직 교차 대조할 수 없습니다.`;
        return;
      }

      const resultText = sentenceBreakText(activeStep?.result || getEvidenceAnalysisText(currentEvidenceForTool));
      addObservationToNote(`${currentEvidenceForTool} 추가 분석`, resultText);
      saveCompletedToolStep(currentEvidenceForTool, toolName);
      document.querySelectorAll(`[data-evidence-name="${currentEvidenceForTool}"]`).forEach((item) => item.classList.add("analyzed"));
      document.querySelectorAll(`#toolEvidenceList [data-evidence="${currentEvidenceForTool}"]`).forEach((item) => item.classList.add("analyzed"));
      document.querySelector(".tool-preview")?.classList.add("revealed");
      toolAnalysisCompleted = true;
      updateToolProgress(100);
      showSuccessfulToolReaction();
      const previewNote = document.querySelector("#toolPreviewNote");
      if (previewNote) previewNote.textContent = "단서 확인 완료";
      const resultAsset = activeStep?.asset || data.toolResultAsset || toolReactionAssets[toolName]?.primary || "/samunmong/assets/interactions/evidence-tools/discovery-burst.png";
      const sourceEvidenceName = currentEvidenceForTool;
      const examinedClueName = registerExaminedClue(sourceEvidenceName, toolName, resultText, resultAsset);
      if (previewNote) previewNote.textContent = sentenceBreakText(resultText).split("\n").find(Boolean) || "새로운 흔적을 확인했습니다.";
      showToolConclusion(examinedClueName, resultText);
      updateEvidenceThreadUI();
      showToast(`의문 기록 · ${getEvidenceStoryMeaning(examinedClueName, evidenceData[examinedClueName] || {})}`);
    }

    function beginToolSwipe(event) {
      if (!currentEvidenceForTool) {
        showToast("먼저 분석할 증거를 선택하세요.");
        return;
      }
      event.preventDefault();
      event.currentTarget?.setPointerCapture?.(event.pointerId);
      swipeStartPoint = { x: event.clientX, y: event.clientY };
      swipeLastPoint = { x: event.clientX, y: event.clientY };
      toolLastMoveAt = performance.now();
      updateWipePosition(event);
      positionToolReaction(event);
      const data = evidenceData[currentEvidenceForTool] || {};
      const pendingStep = getPendingToolStep(currentEvidenceForTool);
      if (!pendingStep && getToolAnalysisSteps(currentEvidenceForTool).length) {
        showToast("이 증거의 도구 분석은 모두 마쳤습니다.");
        return;
      }
      const expectedTool = pendingStep?.tool || data.tool;
      const isCorrectTool = Boolean(isJoseonToolInteraction && selectedToolForAnalysis && getJoseonCoreTool(expectedTool) === selectedToolForAnalysis);
      const interactionType = getToolInteractionType(selectedToolForAnalysis);
      document.querySelector(".tool-preview")?.classList.add("swiping");
      document.querySelector(".tool-preview")?.classList.toggle("tool-reacting", isCorrectTool);
      document.querySelector("#toolReactionLayer")?.classList.toggle("show", isCorrectTool);
      if (isCorrectTool && interactionType === "tap" && !toolAnalysisCompleted) {
        updateToolProgress(toolAnalysisProgress + 52);
        showToast(toolAnalysisProgress >= 100 ? "채취 완료" : "한 곳 더 누르기");
        if (toolAnalysisProgress >= 100) {
          window.setTimeout(() => analyzeEvidenceWithTool(expectedTool), 120);
        }
      }
    }

    function moveToolSwipe(event) {
      if (!swipeStartPoint) return;
      event.preventDefault();
      moveToolCursor(event);
      updateWipePosition(event);
      positionToolReaction(event);
      const data = evidenceData[currentEvidenceForTool] || {};
      const expectedTool = getPendingToolStep(currentEvidenceForTool)?.tool || data.tool;
      if (isJoseonToolInteraction && selectedToolForAnalysis && getJoseonCoreTool(expectedTool) === selectedToolForAnalysis && swipeLastPoint && !toolAnalysisCompleted) {
        const dx = event.clientX - swipeLastPoint.x;
        const dy = event.clientY - swipeLastPoint.y;
        const segment = Math.hypot(dx, dy);
        const now = performance.now();
        const elapsed = Math.max(8, now - toolLastMoveAt);
        const speed = segment / elapsed;
        let gain = 0;
        if (selectedToolForAnalysis === "먼지털이 붓") {
          const direction = Math.abs(dx) >= Math.abs(dy) ? Math.sign(dx) : Math.sign(dy);
          if (toolLastDirection && direction && direction !== toolLastDirection) toolDirectionChanges += 1;
          if (direction) toolLastDirection = direction;
          gain = segment < 75 ? segment / 7 + Math.min(2.4, toolDirectionChanges * .18) : 0;
        } else if (selectedToolForAnalysis === "돋보기") {
          gain = speed >= .08 && speed <= 1.05 && segment < 55 ? segment / 6.4 : 0;
        } else if (selectedToolForAnalysis === "촛불 비추기") {
          gain = speed >= .04 && speed <= .72 && segment < 48 ? segment / 6.8 + elapsed / 180 : 0;
        } else if (selectedToolForAnalysis === "발자국 실측줄") {
          gain = Math.abs(dx) >= Math.abs(dy) * .65 && speed <= 1.2 && segment < 65 ? segment / 5.8 : 0;
        } else if (selectedToolForAnalysis === "문서 맞춤판") {
          gain = speed <= .9 && segment < 52 ? segment / 6.2 : 0;
        } else if (selectedToolForAnalysis === "혈흔 시험포") {
          gain = segment < 30 ? segment / 4.8 + elapsed / 240 : 0;
        } else if (selectedToolForAnalysis === "탁본 도구") {
          gain = Math.abs(dx) > Math.abs(dy) * .8 && segment < 58 ? segment / 5.8 : 0;
        } else if (selectedToolForAnalysis === "섬유 대조틀") {
          gain = Math.abs(dy) > Math.abs(dx) * .55 && speed <= 1 && segment < 52 ? segment / 6 : 0;
        } else if (selectedToolForAnalysis === "먹빛 시험석") {
          gain = speed <= .95 && segment < 44 ? segment / 5.7 : 0;
        } else if (selectedToolForAnalysis === "증거 연결판") {
          gain = segment < 64 ? segment / 5.6 : 0;
        } else if (selectedToolForAnalysis === "흙 대조 접시") {
          gain = Math.abs(dx) > Math.abs(dy) * .65 && segment < 60 ? segment / 5.5 : 0;
        } else if (selectedToolForAnalysis === "상처 대조첩") {
          gain = speed <= 1.05 && segment < 54 ? segment / 5.8 : 0;
        } else if (selectedToolForAnalysis === "문서 펼침칼") {
          gain = Math.abs(dx) > Math.abs(dy) * .72 && speed <= .82 && segment < 50 ? segment / 5.5 : 0;
        } else if (selectedToolForAnalysis === "매듭 해체 송곳") {
          gain = speed <= .9 && segment < 42 ? segment / 5.25 : 0;
        } else if (selectedToolForAnalysis === "압흔 탁본판") {
          gain = Math.abs(dx) > Math.abs(dy) * .62 && segment < 58 ? segment / 5.4 : 0;
        }
        if (gain <= 0 && segment < 80) gain = segment / 12;
        if (gain > 0) updateToolProgress(toolAnalysisProgress + gain * 2.75);
        toolLastMoveAt = now;
      }
      swipeLastPoint = { x: event.clientX, y: event.clientY };
      const distance = Math.min(180, Math.max(72, 72 + toolAnalysisProgress * .9));
      document.querySelector(".tool-preview-image")?.style.setProperty("--wipe-size", `${distance}px`);
      if (toolAnalysisProgress >= 100 && !toolAnalysisCompleted) {
        analyzeEvidenceWithTool(expectedTool);
      }
    }

    function finishToolSwipe(event) {
      if (!swipeStartPoint) return;
      event.preventDefault();
      event.currentTarget?.releasePointerCapture?.(event.pointerId);
      const dx = event.clientX - swipeStartPoint.x;
      const dy = event.clientY - swipeStartPoint.y;
      const distance = Math.hypot(dx, dy);
      swipeStartPoint = null;
      swipeLastPoint = null;
      document.querySelector(".tool-preview")?.classList.remove("swiping", "tool-reacting");
      if (!toolAnalysisCompleted) document.querySelector("#toolReactionLayer")?.classList.remove("show");

      if (!selectedToolForAnalysis) {
        if (Math.abs(dx) > Math.abs(dy) && distance >= 48) {
          flipCurrentEvidence();
        } else {
          showToast(evidenceData[currentEvidenceForTool]?.reverseImg ? "좌우로 밀어 뒤집기" : "도구를 골라 사용하기");
        }
        return;
      }
      if (!isJoseonToolInteraction) {
        if (distance < 56) {
          showToast("증거 위를 조금 더 길게 문질러 보세요.");
          return;
        }
        analyzeEvidenceWithTool(selectedToolForAnalysis);
        return;
      }
      const data = evidenceData[currentEvidenceForTool] || {};
      const expectedTool = getPendingToolStep(currentEvidenceForTool)?.tool || data.tool;
      const interactionType = getToolInteractionType(selectedToolForAnalysis);
      if (getJoseonCoreTool(expectedTool) !== selectedToolForAnalysis) {
        showWrongToolReaction(event);
        document.querySelector(".tool-preview")?.classList.add("wrong-tool");
        setTimeout(() => document.querySelector(".tool-preview")?.classList.remove("wrong-tool"), 520);
        showToast("반응 없음");
        return;
      }
      if (interactionType === "tap") {
        window.setTimeout(() => document.querySelector("#toolReactionLayer")?.classList.remove("show"), 160);
        return;
      }
      if (toolAnalysisProgress >= 100 && !toolAnalysisCompleted) {
        analyzeEvidenceWithTool(expectedTool);
      }
      if (distance < 56) {
        showToast(getToolGestureCopy(selectedToolForAnalysis));
        return;
      }
      if (!toolAnalysisCompleted) {
        showToast(`${Math.round(toolAnalysisProgress)}% · 한 번 더`);
      }
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
      dispatchEvidenceFeedback("호패 조각", document.querySelector("#hopaeHotspot"));
      playSfx("evidence", 0.85);
      addEvidenceToBag("호패 조각");
      addEvidenceToNote("호패 조각");
    }
    function collectPortrait() {
      const alreadyCollected = portraitCollected || readStoredNames(collectedEvidenceKey).includes("돌쇠의 그림");
      if (alreadyCollected) {
        portraitCollected = true;
        setAnalysisTarget("돌쇠의 그림");
        openGlobalPanel("toolPanel");
        return;
      }
      portraitCollected = true;
      const portraitHotspot = document.querySelector("#portraitHotspot");
      if (portraitHotspot) beginEvidenceCollection("돌쇠의 그림", portraitHotspot);
      const collectButton = document.querySelector("#collectPortrait");
      if (collectButton) collectButton.textContent = "보따리에서 분석하기";
      hideInspectPanels();
    }
    function showGenericEvidence(name, hotspot) {
      const data = evidenceData[name] || {};
      pendingEvidenceName = name;
      pendingEvidenceHotspot = hotspot;
      const alreadyCollected = hotspot.classList.contains("collected");
      if (!alreadyCollected) {
        beginEvidenceCollection(name, hotspot);
        return;
      }
      if (data.tool) setAnalysisTarget(name);

      document.querySelector("#genericEvidenceImage").src = getEvidenceImage(name);
      document.querySelector("#genericEvidenceTitle").textContent = getEvidenceDisplayName(name);
      document.querySelector("#genericEvidenceText").textContent = data.tool ? sentenceBreakText(TOOL_NEEDED_HINT) : "";
      document.querySelector("#genericEvidenceText").hidden = !data.tool;
      document.querySelector("#genericEvidenceInspect").classList.add("show");
      clearTimeout(showInspect.timer);
    }

    function beginEvidenceCollection(name, hotspot) {
      hideInspectPanels();
      closeToast();
      pendingEvidenceName = name;
      pendingEvidenceHotspot = hotspot;
      markEvidenceCollectedInScene(name);
      dispatchEvidenceFeedback(name, hotspot);
      playSfx("evidence", 0.9);
      addEvidenceToBag(name);
      addEvidenceToNote(name);
      if (evidenceData[name]?.tool) setAnalysisTarget(name);
      showToast("보따리에 담았습니다.", {
        image: getEvidenceImage(name),
        title: getEvidenceDisplayName(name),
        dismissible: true,
      });
      pendingEvidenceName = "";
      pendingEvidenceHotspot = null;
    }

    document.addEventListener("click", (event) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;

      if (target.closest("#closeSpaceEvidenceDetail, #spaceEvidenceDetailOverlay")) {
        setSpaceEvidenceDetail(false);
        return;
      }

      if (target.closest("#closeHopaeInspect, #closeGenericEvidenceInspect")) {
        hideInspectPanels();
        return;
      }
      if (target.closest("#collectPortrait")) {
        collectPortrait();
        return;
      }

      const hotspot = target.closest("[data-evidence-name], #hopaeHotspot, #portraitHotspot");
      if (!hotspot) return;
      if (hotspot.classList.contains("collected") || hotspot.getAttribute("aria-disabled") === "true") {
        if (isSpaceTheme && detailedSpaceEvidence[hotspot.dataset.evidenceName]) {
          setSpaceEvidenceDetail(true, hotspot.dataset.evidenceName);
          playSfx("buttonAlt", 0.48);
        }
        return;
      }
      if (event.__samunmongEvidenceHandled) return;
      event.__samunmongEvidenceHandled = true;
      if (hotspot.id === "hopaeHotspot") {
        const hasHopae = readStoredNames(collectedEvidenceKey).includes("호패 조각");
        if (!hasHopae) {
          hopaeCollected = true;
          beginEvidenceCollection("호패 조각", hotspot);
        } else {
          hopaeCollected = true;
          addEvidenceCardToInterrogation("호패 조각");
          setAnalysisTarget("호패 조각");
          showInspect("#hopaeInspect");
        }
        return;
      }
      if (hotspot.id === "portraitHotspot") {
        collectPortrait();
        return;
      }
      showGenericEvidence(hotspot.dataset.evidenceName, hotspot);
    });
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
    document.querySelector(".tool-preview-image")?.addEventListener("dragover", dragToolOverEvidence);
    document.querySelector(".tool-preview-image")?.addEventListener("drop", dropToolOnEvidence);
    document.querySelector(".tool-preview-image")?.addEventListener("dragleave", () => {
      document.querySelector(".tool-preview")?.classList.remove("tool-reacting");
      document.querySelector("#toolReactionLayer")?.classList.remove("show");
    });
    document.querySelectorAll(".document-piece").forEach((button) => {
      button.addEventListener("pointerdown", (event) => startDocumentPieceDrag(button, event));
    });
    document.querySelector("#documentAssemblyStage")?.addEventListener("pointermove", moveDocumentPiece);
    document.querySelector("#documentAssemblyStage")?.addEventListener("pointerup", finishDocumentPieceDrag);
    document.querySelector("#documentAssemblyStage")?.addEventListener("pointercancel", finishDocumentPieceDrag);
    document.querySelectorAll("[data-knot-loop]").forEach((button) => {
      button.addEventListener("pointerdown", (event) => startKnotDrag(button, event));
    });
    const knotStageElement = document.querySelector("#knotPuzzleStage");
    knotStageElement?.addEventListener("pointermove", moveKnotDrag);
    knotStageElement?.addEventListener("pointerup", finishKnotDrag);
    knotStageElement?.addEventListener("pointercancel", finishKnotDrag);
    const rubbingStage = document.querySelector("#rubbingPuzzleStage");
    document.querySelector("#rubbingCharcoal")?.addEventListener("pointerdown", startRubbingDrag);
    rubbingStage?.addEventListener("pointermove", moveRubbingDrag);
    rubbingStage?.addEventListener("pointerup", finishRubbingDrag);
    rubbingStage?.addEventListener("pointercancel", finishRubbingDrag);
    const footprintStage = document.querySelector("#footprintPuzzleStage");
    document.querySelector("#footprintShoePiece")?.addEventListener("pointerdown", startFootprintDrag);
    document.querySelector("#footprintMeasureTool")?.addEventListener("pointerdown", startFootprintMeasureDrag);
    footprintStage?.addEventListener("pointermove", moveFootprintDrag);
    footprintStage?.addEventListener("pointerup", finishFootprintDrag);
    footprintStage?.addEventListener("pointercancel", finishFootprintDrag);
    footprintStage?.addEventListener("pointermove", moveFootprintMeasureDrag);
    footprintStage?.addEventListener("pointerup", finishFootprintMeasureDrag);
    footprintStage?.addEventListener("pointercancel", finishFootprintMeasureDrag);
    document.querySelectorAll("[data-sample-point]").forEach((button) => {
      button.addEventListener("pointerdown", (event) => startSampleDrag(button, event));
    });
    const materialStageElement = document.querySelector("#materialPuzzleStage");
    document.querySelector("#materialHandTool")?.addEventListener("pointerdown", startMaterialDirectDrag);
    materialStageElement?.addEventListener("pointermove", moveSampleDrag);
    materialStageElement?.addEventListener("pointerup", finishSampleDrag);
    materialStageElement?.addEventListener("pointercancel", finishSampleDrag);
    materialStageElement?.addEventListener("pointermove", moveMaterialDirectDrag);
    materialStageElement?.addEventListener("pointerup", finishMaterialDirectDrag);
    materialStageElement?.addEventListener("pointercancel", finishMaterialDirectDrag);
    document.querySelectorAll("[data-special-point]").forEach((button) => {
      button.addEventListener("pointerdown", (event) => startSpecialDrag(button, event));
    });
    document.querySelectorAll("[data-ritual-kind]").forEach((piece) => {
      piece.addEventListener("pointerdown", (event) => startRitualDrag(piece, event));
    });
    [document.querySelector("#confrontationStage"), document.querySelector("#sleeveInspectionStage")].forEach((stage) => {
      stage?.addEventListener("pointermove", moveRitualDrag);
      stage?.addEventListener("pointerup", finishRitualDrag);
      stage?.addEventListener("pointercancel", finishRitualDrag);
    });
    const specialStageElement = document.querySelector("#specialPuzzleStage");
    document.querySelector("#specialSurfaceHandle")?.addEventListener("pointerdown", startSpecialSurfaceDrag);
    document.querySelector("#specialExplorerTool")?.addEventListener("pointerdown", startSpecialExplorerDrag);
    specialStageElement?.addEventListener("pointermove", moveSpecialDrag);
    specialStageElement?.addEventListener("pointerup", finishSpecialDrag);
    specialStageElement?.addEventListener("pointercancel", finishSpecialDrag);
    specialStageElement?.addEventListener("pointermove", moveSpecialSurfaceDrag);
    specialStageElement?.addEventListener("pointerup", finishSpecialSurfaceDrag);
    specialStageElement?.addEventListener("pointercancel", finishSpecialSurfaceDrag);
    specialStageElement?.addEventListener("pointermove", moveSpecialExplorerDrag);
    specialStageElement?.addEventListener("pointerup", finishSpecialExplorerDrag);
    specialStageElement?.addEventListener("pointercancel", finishSpecialExplorerDrag);
    document.querySelector("#toolPreviewImage")?.addEventListener("dragstart", (event) => event.preventDefault());
    document.querySelector("#toolPreviewImage")?.addEventListener("load", syncEvidenceShadowBounds);
    setupEvidenceScreen(getActiveScreenId());

    function updateSuspect(shouldAnnounce = true) {
      const suspect = suspects[suspectIndex];
      const suspectNamePanel = document.querySelector("#suspectName");
      const suspectNameValue = suspectNamePanel?.querySelector(".suspect-name-value");
      const suspectAuthId = suspectNamePanel?.querySelector(".suspect-auth-id");
      if (suspectNameValue) {
        suspectNameValue.textContent = suspect.name;
        if (suspectAuthId) suspectAuthId.textContent = suspect.authId || "";
      } else if (suspectNamePanel) {
        suspectNamePanel.textContent = suspect.name;
      }
      document.querySelector("#suspectStage").dataset.suspect = suspect.id;
      const interrogationScreen = document.querySelector("#interrogationScreen");
      setLieExpressionOverlay(false);
      if (isMagicTheme || isSpaceTheme) {
        document.querySelector("#interrogationPlate").src = suspect.scene;
      } else {
        document.querySelector("#interrogationPlate").src = "/samunmong/assets/interactions/interrogation-candle/interrogation-room-common-clean-v2.png";
        interrogationScreen.dataset.characterScene = sleeveCheckedSuspects.has(suspect.id) ? suspect.sleeveScene : suspect.scene;
      }
      const suspectSprite = document.querySelector("#suspectSprite");
      if ((isMagicTheme || isSpaceTheme) && suspectSprite && suspect.sprite) {
        suspectSprite.src = suspect.sprite;
        suspectSprite.hidden = false;
      } else if (suspectSprite) {
        suspectSprite.src = suspect.sleeveScene || suspect.scene;
        suspectSprite.hidden = false;
      }
      activeNoteSuspectId = suspect.id;
      renderConversationNotes();
      syncVisibleSuspectReply();
      if (shouldAnnounce && !isSpaceTheme && getActiveScreenId() === "interrogationScreen") {
        showToast(`${suspect.name} 심문으로 전환`);
      }
    }

    window.addEventListener("samunmong:suspect-request", (event) => {
      const direction = event.detail?.direction;
      if (direction === "previous") {
        suspectIndex = (suspectIndex - 1 + suspects.length) % suspects.length;
      } else if (direction === "next") {
        suspectIndex = (suspectIndex + 1) % suspects.length;
      } else {
        return;
      }
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
          name.textContent = message.sender === "player"
            ? (isSpaceTheme ? "조사관" : isMagicTheme ? "선생님" : "사또")
            : activeSuspect.name;

          const text = document.createElement("p");
          text.className = "conversation-text";
          text.textContent = sentenceBreakText(message.text);

          bubble.append(name, text);
          if (message.meta && !isSpaceTheme) {
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

    function hydrateSuspectTabs() {
      document.querySelectorAll("[data-note-tabs]").forEach((tabs) => {
        tabs.replaceChildren();
        suspects.forEach((suspect, index) => {
          const button = document.createElement("button");
          button.className = `note-suspect-tab${index === 0 ? " active" : ""}`;
          button.type = "button";
          button.dataset.suspectId = suspect.id;
          button.textContent = suspect.name;
          tabs.appendChild(button);
        });
      });
      document.querySelectorAll(".note-suspect-tab").forEach((button) => {
        button.addEventListener("click", () => {
          activeNoteSuspectId = button.dataset.suspectId || activeNoteSuspectId;
          playSfx("buttonAlt", 0.48);
          renderConversationNotes();
        });
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
    hydrateSuspectTabs();
    updateSuspect(false);
    renderConversationNotes();

    const evidenceBagPop = document.querySelector("#evidenceBagPop");
    const toggleEvidenceBag = document.querySelector("#toggleEvidenceBag");
    function setEvidenceBag(open) {
      if (open && isFieldGuideBlockingControls()) return;
      if (open) {
        evidenceBagPop.classList.remove("closing");
        clearEvidenceBagUnread();
      }
      if (!open && evidenceBagPop.classList.contains("open")) {
        evidenceBagPop.classList.add("closing");
        setTimeout(() => evidenceBagPop.classList.remove("closing"), 360);
      }
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
      if (isSpaceTheme && id === "toolPanel") return;
      if (id !== "mapPanel" && isFieldGuideBlockingControls()) return;
      if (document.querySelector("#mainScreen")?.classList.contains("active")) {
        globalPanels.forEach((panel) => {
          panel.classList.remove("show", "closing");
          panel.setAttribute("aria-hidden", "true");
        });
        globalOverlay.classList.remove("show");
        return;
      }
      hideInspectPanels();
      setEvidenceBag(false);

      const openingPanel = document.getElementById(id);
      if (openingPanel && !openingPanel.classList.contains("show")) clearInteractionEarnedEvidence(openingPanel);

      globalPanels.forEach((panel) => {
        const isOpen = panel.id === id;
        if (isOpen) panel.classList.remove("closing");
        panel.classList.toggle("show", isOpen);
        panel.setAttribute("aria-hidden", String(!isOpen));
      });
      globalOverlay.classList.add("show");
      if (id === "mapPanel") playSfx("map", 0.78);
      if (id === "toolPanel") playSfx("buttonAlt", 0.62);
      if (id === "toolPanel" && !currentEvidenceForTool) {
        const firstPendingEvidence = [...document.querySelectorAll("#toolEvidenceList .tool-evidence-option")]
          .find((button) => getPendingToolStep(button.dataset.evidence));
        if (firstPendingEvidence) setAnalysisTarget(firstPendingEvidence.dataset.evidence);
      }
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
        if (panel.classList.contains("show")) {
          panel.classList.add("closing");
          setTimeout(() => panel.classList.remove("closing"), 360);
        }
        panel.classList.remove("show");
        panel.setAttribute("aria-hidden", "true");
      });
      document.querySelector("#toolResultPopup")?.classList.remove("show");
      document.querySelector("#toolResultPopup")?.setAttribute("aria-hidden", "true");
      setEvidenceBag(false);
      globalOverlay.classList.remove("show");
      document.body.classList.remove("tool-cursor-active");
      document.querySelector("#selectedToolCursor")?.classList.remove("show");
      if (wasGuideMapOpen) setFieldGuideStep("room");
    }

    function closeOrReturnFromGlobalPanel(event) {
      const toolSubPanel = event?.currentTarget?.closest?.(
        "#documentAssemblyPanel, #rubbingPuzzlePanel, #knotPuzzlePanel, #footprintPuzzlePanel, #materialPuzzlePanel, #specialEvidencePuzzlePanel"
      );
      if (toolSubPanel) {
        tactilePuzzlePointer = null;
        specialDragState = null;
        specialSurfaceDrag = null;
        sampleDragState = null;
        draggedDocumentPiece = null;
        toolSubPanel.querySelectorAll(".dragging, .wrong-fit").forEach((item) => item.classList.remove("dragging", "wrong-fit"));
        resetToolInteraction(true);
        renderTools();
        if (isJoseonToolInteraction) {
          closeGlobalPanel();
          setEvidenceBag(true);
          if (currentEvidenceForTool) showEvidenceStoryPreview(currentEvidenceForTool);
          return;
        }
        openGlobalPanel("toolPanel");
        return;
      }
      closeGlobalPanel();
    }

    document.addEventListener("click", (event) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;
      if (target.closest(".open-map-panel, #openMapFromField, #openMapFromRoom, #openMapFromMudeokRoom, #openMapFromInterrogation")) {
        openGlobalPanel("mapPanel");
      } else if (target.closest(".open-bag-panel, #openBagFromField, #openBagFromRoom, #openBagFromMudeokRoom")) {
        setEvidenceBag(true);
      } else if (target.closest(".open-tool-panel")) {
        openGlobalPanel("toolPanel");
      } else if (target.closest(".open-note-panel, #openNoteFromField, #openNoteFromRoom, #openNoteFromMudeokRoom")) {
        openGlobalPanel("fieldNotePanel");
      }
    });
    document.querySelector("#toolPanel")?.addEventListener("click", (event) => {
      if (!isJoseonToolInteraction || !selectedToolForAnalysis) return;
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;
      if (target.closest("button, a, input, select, textarea, [contenteditable='true'], .tool-preview-image, [draggable='true']")) return;
      resetToolInteraction(true);
    });
    document.addEventListener("keydown", (event) => {
      const target = event.target;
      const isTyping = target?.matches?.("input, textarea, select, [contenteditable='true']");
      if (event.key !== "Tab" || event.altKey || event.ctrlKey || event.metaKey || isTyping) return;
      if (isFieldGuideBlockingControls()) return;
      event.preventDefault();
      openGlobalPanel("toolPanel");
    });
    document.querySelectorAll(".global-close").forEach((button) => button.addEventListener("click", closeOrReturnFromGlobalPanel));
    window.addEventListener("resize", syncDirectAffordanceFragments);
    on("#closeToolResult", "click", closeToolResultPopup);
    globalOverlay.addEventListener("click", () => {
      if (document.querySelector(".tactile-puzzle-panel.show.interaction-complete")) {
        showToast("새 증좌를 확인한 뒤 ‘확인하고 닫기’를 눌러 주십시오.");
        return;
      }
      closeGlobalPanel();
    });
    document.querySelectorAll("[data-map-go]").forEach((button) => {
      button.addEventListener("pointerdown", () => button.classList.add("pressing"));
      button.addEventListener("pointerup", () => button.classList.remove("pressing"));
      button.addEventListener("pointerleave", () => button.classList.remove("pressing"));
      button.addEventListener("blur", () => button.classList.remove("pressing"));
      button.addEventListener("click", () => {
        const target = button.dataset.mapGo;
        if (!canAccessMagicScreen(target)) {
          showToast(getMagicLockMessage(target));
          return;
        }
        button.classList.add("pressing");
        playSfx("move", 0.82);
        if (["map-click", "map-open"].includes(fieldGuideStep)) {
          closeGlobalPanel();
          return;
        }
        closeGlobalPanel();
        go(target, isSpaceTheme ? "정거장 지도에서 이동 중..." : isMagicTheme ? "학교 지도에서 이동 중..." : "마을 지도에서 이동 중...");
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
      const evidenceMeta = isSpaceTheme ? "" : `제시 증거: ${selectedEvidence || "증거 제시 없음"}`;
      addConversationMessage(suspect.id, "player", question, evidenceMeta);
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

    const newFactTitles = {
      CHUNWOL_HEARD_ESCAPE_PLAN: "춘월은 두 사람의 도망 가능성을 들었다",
      CHUNWOL_HIDDEN_PORTRAIT: "춘월이 숨긴 돌쇠의 초상",
      CHUNWOL_LETTER_ACCESS: "양반가의 종이와 정중한 편지 말투",
      CHUNWOL_RIBBON_MATERIAL: "점순의 목 흔적과 맞는 고급 비단",
      CHUNWOL_ARM_SCRATCH: "춘월의 소매 아래 긁힌 상처",
      CHUNWOL_HOPAE_POWDER: "호패에 남은 향 섞인 분가루",
      DOLSOE_ESCAPE_PLAN: "돌쇠와 점순의 도망 계획",
      DOLSOE_LETTER_MISMATCH: "돌쇠의 말투와 다른 약속 편지",
      YOOMUNSEOK_MISSING_HOPAE: "사건 전날 사라진 유문석의 호패",
      MUDEOK_TOLD_CHUNWOL: "무덕이 춘월에게 흘린 점순의 행방",
      MUDEOK_FOUND_RIBBON: "무덕이 집 근처에서 주운 옷고름"
    };

    function stopInterrogationThinkingSound() {
      window.clearInterval(interrogationThinkingSoundTimer);
      interrogationThinkingSoundTimer = 0;
    }

    function setLieExpressionOverlay(show = false) {
      if (isMagicTheme || isSpaceTheme) return;
      const screen = document.querySelector("#interrogationScreen");
      const suspect = suspects[suspectIndex];
      if (!screen || !suspect?.lieScene) return;
      const characterRig = screen.querySelector(".interrogation-character-rig");

      let overlay = document.querySelector("#interrogationLieExpression");
      if (!overlay) {
        overlay = document.createElement("img");
        overlay.id = "interrogationLieExpression";
        overlay.alt = "";
        overlay.draggable = false;
        overlay.setAttribute("aria-hidden", "true");
        Object.assign(overlay.style, {
          position: "absolute",
          inset: "0",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: "0",
          pointerEvents: "none",
          transition: "opacity 220ms ease",
          zIndex: "3"
        });
        screen.appendChild(overlay);
      }

      overlay.src = suspect.lieScene;
      overlay.style.opacity = show ? "1" : "0";
      if (characterRig) {
        characterRig.style.opacity = show ? "0" : "1";
      }
    }

    function getJoseonExpressionOnlyReaction(reaction = "calm") {
      if (isMagicTheme || isSpaceTheme) return reaction;
      return ["avoid", "nervous", "shocked", "silent", "lie"].includes(reaction) ? "lie" : reaction;
    }

    function setInterrogationReaction(reaction = "calm", holdMs = 0) {
      const screen = document.querySelector("#interrogationScreen");
      const candle = document.querySelector("#interrogationCandle");
      const normalized = ["calm", "lie", "thinking", "attentive", "avoid", "nervous", "shocked", "silent"].includes(reaction)
        ? reaction
        : "calm";
      const visualReaction = getJoseonExpressionOnlyReaction(normalized);

      window.clearTimeout(interrogationReactionTimer);
      screen?.setAttribute("data-interrogation-reaction", visualReaction);
      candle?.setAttribute("data-state", visualReaction);
      setLieExpressionOverlay(visualReaction === "lie");

      if (normalized === "thinking") {
        stopInterrogationThinkingSound();
        playSfx("type1", 0.1);
        interrogationThinkingSoundTimer = window.setInterval(() => {
          if (!document.hidden) playSfx("type1", 0.08);
        }, 850);
      } else {
        stopInterrogationThinkingSound();
      }
      if (visualReaction === "lie") {
        playSfx("lie", 0.34);
      }

      if (holdMs > 0 && normalized !== "calm") {
        interrogationReactionTimer = window.setTimeout(() => setInterrogationReaction("calm"), holdMs);
      }
    }

    function getLieExpressionReaction(answer = "", reaction = "attentive") {
      const normalizedAnswer = answer.replace(/\s+/g, " ");
      const lieOrEvasionPattern =
        /(모릅니다|모르겠|기억(?:이)?\s*(?:안|나지|없)|본\s*적\s*없|들은\s*적\s*없|간\s*적\s*없|제\s*것(?:이)?\s*아닙|아닙니다|그런\s*적\s*없|말씀드리기\s*어렵|답하기\s*어렵|글쎄|어찌\s*알겠|알\s*수\s*없)/;
      if (lieOrEvasionPattern.test(normalizedAnswer)) return "lie";
      return getJoseonExpressionOnlyReaction(reaction);
    }

    function showNewFactDiscovery(factId) {
      if (!factId) return;
      const toast = document.querySelector("#newFactToast");
      const title = document.querySelector("#newFactTitle");
      if (!toast || !title) return;

      window.clearTimeout(newFactToastTimer);
      title.textContent = newFactTitles[factId] || "새로운 사실이 기록되었습니다";
      toast.classList.add("show");
      toast.setAttribute("aria-hidden", "false");
      playSfx("evidence", 0.48);
      newFactToastTimer = window.setTimeout(() => {
        toast.classList.remove("show");
        toast.setAttribute("aria-hidden", "true");
      }, 3600);
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
        showEvidenceResponseMarker(selectedEvidence);
      }
      if (source === "fallback" && warning) {
        showToast(warning);
      }
    }

    function maybeCollectInterrogationEvidence(suspect, answer, usedEvidenceNames = []) {
      if (!isMagicTheme || suspect.id !== "malposam") return;
      if (getCollectedEvidenceNames().includes("말포삼의 자백")) return;

      const hasCrystalEvidence = usedEvidenceNames.some((name) => ["기록의 수정구", "조작된 기록 수정구", "말포삼의 자백"].includes(name));
      const confessed = /말포일/.test(answer) && /(부탁|시켰|말했|환각|수정구)/.test(answer);
      if (!hasCrystalEvidence || !confessed) return;

      addEvidenceToBag("말포삼의 자백");
      markEvidenceCollectedInScene("말포삼의 자백");
      showToast("말포삼의 자백을 마법 가방에 기록했습니다.");
    }

    async function requestAiAnswer(question) {
      if (isAskingAi) return;
      const askButton = document.querySelector("#askButton");
      const suspect = suspects[suspectIndex];
      const history = getInterrogationHistory(suspect.id);
      isAskingAi = true;
      askButton.disabled = true;
      askButton.textContent = "답변 중";
      showSuspectReply("답을 고르는 중", "답변 중");
      setInterrogationReaction("thinking");

      try {
        const response = await fetch("/api/interrogate/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            suspectId: suspect.id,
            userMessage: question,
            presentedEvidenceNames: selectedEvidence ? [selectedEvidence] : [],
            collectedEvidenceNames: getCollectedEvidenceNames(),
            conversationHistory: history.slice(-8),
            knownFactIds: readStoredNames(interrogationKnownFactsKey)
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
        maybeCollectInterrogationEvidence(suspect, answer, data.usedEvidenceNames);
        setInterrogationReaction(getLieExpressionReaction(answer, data.reaction || "attentive"), data.newFactId ? 4200 : 3000);
        if (data.newFactId) showNewFactDiscovery(data.newFactId);
        if (data.newFactId) {
          const knownFactIds = new Set(readStoredNames(interrogationKnownFactsKey));
          knownFactIds.add(data.newFactId);
          localStorage.setItem(interrogationKnownFactsKey, JSON.stringify([...knownFactIds]));
        }
        if (suspects[suspectIndex]?.id === suspect.id) {
          setAiMode(suspect.name);
        }
        showToast(data.source === "rag" || data.source === "openai" ? "용의자가 답했습니다." : "임시 답변을 표시했습니다.");
      } catch (error) {
        setInterrogationReaction("calm");
        if (suspects[suspectIndex]?.id === suspect.id) {
          showSuspectReply("지금은 답하기 어려워 보입니다.", "오류");
        }
        showToast("AI 답변을 받지 못했습니다.");
      } finally {
        if (document.querySelector("#interrogationCandle")?.getAttribute("data-state") === "thinking") {
          setInterrogationReaction("calm");
        }
        isAskingAi = false;
        clearPresentedEvidence();
        updateInterrogationQuestionLimitUI();
      }
    }

    function openEvidenceConfrontation(question) {
      pendingConfrontationQuestion = question;
      confrontationStep = 0;
      document.querySelector("#confrontationTitle").textContent = `${suspects[suspectIndex].name}에게 증거 대면`;
      document.querySelector("#confrontationEvidenceName").textContent = getEvidenceDisplayName(selectedEvidence);
      document.querySelector("#confrontationGuide").textContent = "증거패를 심문상에 올린 뒤 관인을 끌어 찍어 대면을 확정하십시오.";
      document.querySelector("#confrontationImage").src = "/samunmong/assets/interactions/confrontation-puzzle/state-1.png";
      resetRitualDrag("confrontation");
      openGlobalPanel("evidenceConfrontationPanel");
      playSfx("map", 0.62);
    }

    function openSleeveInspection(question) {
      const suspect = suspects[suspectIndex];
      pendingSleeveQuestion = question;
      sleeveInspectionStep = 0;
      document.querySelector("#sleeveInspectionTitle").textContent = `${suspect.name}의 소매 확인`;
      document.querySelector("#sleeveInspectionGuide").textContent = "손목 끈을 풀고 소매를 올려 팔의 흔적을 직접 확인하십시오.";
      document.querySelector("#sleeveInspectionImage").src = "/samunmong/assets/interactions/sleeve-inspection-puzzle/state-1.png";
      resetRitualDrag("sleeve");
      openGlobalPanel("sleeveInspectionPanel");
      playSfx("map", 0.62);
    }

    function advanceSleeveInspection(step) {
      if (Number(step) !== sleeveInspectionStep + 1) {
        showToast("손목 끈부터 순서대로 확인하십시오.");
        return;
      }
      sleeveInspectionStep += 1;
      document.querySelector("#sleeveInspectionImage").src = `/samunmong/assets/interactions/sleeve-inspection-puzzle/state-${sleeveInspectionStep === 2 ? 4 : sleeveInspectionStep + 1}.png`;
      completeRitualStep("sleeve", sleeveInspectionStep);
      document.querySelector("#sleeveInspectionGuide").textContent = sleeveInspectionStep === 1 ? "손목 끈이 풀렸습니다. 소매 끝을 위로 밀어 올리십시오." : "소매 아래 팔의 흔적이 드러났고 증거 기록에 자동으로 남았습니다.";
      playSfx(sleeveInspectionStep === 2 ? "evidence" : "buttonAlt", sleeveInspectionStep === 2 ? 0.9 : 0.58);
      if (sleeveInspectionStep === 2) {
        const question = pendingSleeveQuestion;
        window.setTimeout(async () => {
          closeGlobalPanel();
          sleeveInspectionBypass = true;
          try {
            await performInterrogationQuestion(question);
          } finally {
            sleeveInspectionBypass = false;
          }
        }, 360);
      }
    }

    async function performInterrogationQuestion(question) {
      const isSleeveQuestion = /소매/.test(question) && /(걷|올리|보|확인|드러|살펴)/.test(question);
      if (isJoseonToolInteraction && isSleeveQuestion && !sleeveInspectionBypass) {
        openSleeveInspection(question);
        return;
      }
      playSfx("ask", 0.82);
      recordInterrogationQuestion();
      addInterrogationSummary(question);
      if (isSleeveQuestion) {
        const suspect = suspects[suspectIndex];
        sleeveCheckedSuspects.add(suspect.id);
        if (isMagicTheme || isSpaceTheme) {
          document.querySelector("#interrogationPlate").src = suspect.sleeveScene;
        } else {
          document.querySelector("#interrogationScreen").dataset.characterScene = suspect.sleeveScene;
        }
        if (isMagicTheme && suspect.sprite) document.querySelector("#suspectSprite").src = suspect.sprite;
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
        if (isMagicTheme || isSpaceTheme) {
          document.querySelector("#interrogationPlate").src = suspect.scene;
        } else {
          document.querySelector("#interrogationPlate").src = "/samunmong/assets/interactions/interrogation-candle/interrogation-room-common-clean-v2.png";
          document.querySelector("#interrogationScreen").dataset.characterScene = sleeveCheckedSuspects.has(suspect.id) ? suspect.sleeveScene : suspect.scene;
        }
        if (isMagicTheme && suspect.sprite) document.querySelector("#suspectSprite").src = suspect.sprite;
        showToast(`${suspect.name}에게 질문을 던졌습니다.`);
      }
      document.querySelector("#questionInput").value = "";
      await requestAiAnswer(question);
    }

    function advanceEvidenceConfrontation(step) {
      if (Number(step) !== confrontationStep + 1) {
        showToast("대면 절차를 순서대로 진행하십시오.");
        return;
      }
      confrontationStep += 1;
      document.querySelector("#confrontationImage").src = `/samunmong/assets/interactions/confrontation-puzzle/state-${confrontationStep === 2 ? 4 : confrontationStep + 1}.png`;
      completeRitualStep("confrontation", confrontationStep);
      document.querySelector("#confrontationGuide").textContent = confrontationStep === 1 ? "증거가 심문상에 놓였습니다. 오른쪽 위의 관인을 끌어 찍으십시오." : "관인이 찍혀 증거 대면이 확정됐습니다.";
      playSfx(confrontationStep === 2 ? "evidence" : "buttonAlt", confrontationStep === 2 ? 0.9 : 0.58);
      if (confrontationStep === 2) {
        const question = pendingConfrontationQuestion;
        window.setTimeout(() => {
          closeGlobalPanel();
          performInterrogationQuestion(question);
        }, 360);
      }
    }

    function resetRitualDrag(kind) {
      ritualDragState = null;
      document.querySelectorAll(`[data-ritual-kind="${kind}"]`).forEach((piece) => {
        piece.classList.toggle("active", piece.dataset.ritualStep === "1");
        piece.classList.remove("complete", "dragging", "wrong-fit");
        piece.style.setProperty("--ritual-x", "0px");
        piece.style.setProperty("--ritual-y", "0px");
      });
      document.querySelectorAll(`[data-ritual-target^="${kind}-"]`).forEach((target, index) => {
        target.classList.toggle("active", index === 0);
        target.classList.remove("complete");
      });
    }

    function completeRitualStep(kind, step) {
      const piece = document.querySelector(`[data-ritual-kind="${kind}"][data-ritual-step="${step}"]`);
      const target = document.querySelector(`[data-ritual-target="${kind}-${step}"]`);
      piece?.classList.remove("active", "dragging");
      piece?.classList.add("complete");
      target?.classList.remove("active");
      target?.classList.add("complete");
      document.querySelector(`[data-ritual-kind="${kind}"][data-ritual-step="${step + 1}"]`)?.classList.add("active");
      document.querySelector(`[data-ritual-target="${kind}-${step + 1}"]`)?.classList.add("active");
    }

    function startRitualDrag(piece, event) {
      if (!piece.classList.contains("active") || piece.classList.contains("complete")) return;
      event.preventDefault();
      const stage = piece.closest(".ritual-drag-stage");
      stage?.setPointerCapture?.(event.pointerId);
      ritualDragState = { piece, stage, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY };
      piece.classList.add("dragging");
    }

    function moveRitualDrag(event) {
      if (!ritualDragState || ritualDragState.pointerId !== event.pointerId) return;
      event.preventDefault();
      ritualDragState.piece.style.setProperty("--ritual-x", `${event.clientX - ritualDragState.startX}px`);
      ritualDragState.piece.style.setProperty("--ritual-y", `${event.clientY - ritualDragState.startY}px`);
    }

    function finishRitualDrag(event) {
      if (!ritualDragState || ritualDragState.pointerId !== event.pointerId) return;
      const { piece } = ritualDragState;
      const kind = piece.dataset.ritualKind;
      const step = Number(piece.dataset.ritualStep);
      const target = document.querySelector(`[data-ritual-target="${kind}-${step}"]`);
      const pieceRect = piece.getBoundingClientRect();
      const targetRect = target?.getBoundingClientRect();
      const centerX = pieceRect.left + pieceRect.width / 2;
      const centerY = pieceRect.top + pieceRect.height / 2;
      const hit = targetRect && centerX >= targetRect.left && centerX <= targetRect.right && centerY >= targetRect.top && centerY <= targetRect.bottom;
      piece.classList.remove("dragging");
      ritualDragState = null;
      if (hit) {
        if (kind === "confrontation") advanceEvidenceConfrontation(step);
        else advanceSleeveInspection(step);
        return;
      }
      piece.style.setProperty("--ritual-x", "0px");
      piece.style.setProperty("--ritual-y", "0px");
      piece.classList.remove("wrong-fit");
      void piece.offsetWidth;
      piece.classList.add("wrong-fit");
      showToast(kind === "confrontation" ? "빛나는 자리에 패를 직접 올려놓으십시오." : "화살표가 가리키는 자리까지 직접 움직이십시오.");
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
      const isSleeveQuestion = /소매/.test(question) && /(걷|올리|보|확인|드러|살펴)/.test(question);
      if (isJoseonToolInteraction && selectedEvidence && !isSleeveQuestion) {
        openEvidenceConfrontation(question);
        return;
      }
      await performInterrogationQuestion(question);
    });

    document.querySelector("#questionInput").addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        document.querySelector("#askButton").click();
      }
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stopInterrogationThinkingSound();
    });
    window.addEventListener("pagehide", () => {
      stopInterrogationThinkingSound();
      window.clearTimeout(interrogationReactionTimer);
      window.clearTimeout(newFactToastTimer);
    });

    function applyContentImages() {
      const screenImages = window.SAMUNMONG_CONTENT?.screenImages || {};
      Object.entries(screenImages).forEach(([screenId, imageSrc]) => {
        if ((isMagicTheme || isSpaceTheme) && screenId === "interrogationScreen") return;
        document.querySelector(`#${screenId} .plate`)?.setAttribute("src", imageSrc);
      });
      if (isMagicTheme) {
        document.querySelector("#interrogationPlate")?.setAttribute("src", "/samunmong/assets/magic-school/interrogation/office-empty.webp");
      } else if (isSpaceTheme) {
        updateSuspect(false);
      }
    }

    applyContentImages();
    renderTools();
    restoreConversationNotes();
    restoreSavedInvestigation();
    syncMagicMapProgress();
    syncEvidenceBagUnreadIndicator();
    renderConversationNotes();
    setupButtonGuides();
    showInitialScreenFromSetup();
  

})();
