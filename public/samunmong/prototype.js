(() => {

    const knownScreenIds = new Set([
      "mainScreen", "tutorialScreen", "dreamScreen", "briefingScreen", "fieldOne",
      "chunwolRoom", "mudeokServantRoom", "yoomunseokSarangbang", "dolsoeQuarters",
      "backGateCourtyard", "magicAlchemyLab", "magicCleaningCloset", "magicLibrary",
      "magicRecordCrystalRoom", "magicDormHallway", "interrogationScreen"
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
    const themeKey = "samunmong-current-theme";
    const requestedTheme = entryParams.get("theme");
    const requestedStart = entryParams.get("start") || "";
    const isMagicStart = requestedStart.startsWith("magic") || window.location.pathname.startsWith("/magic-");
    if (requestedTheme === "magicSchool" || requestedTheme === "spaceStation" || requestedTheme === "joseon") {
      localStorage.setItem(themeKey, requestedTheme);
    } else if (isMagicStart) {
      localStorage.setItem(themeKey, "magicSchool");
    }
    const storedTheme = localStorage.getItem(themeKey);
    const activeTheme = storedTheme === "magicSchool" || storedTheme === "spaceStation" ? storedTheme : "joseon";
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
      : sentenceBreakText("“사또님, 관아 근처에서 사람이 쓰러진 채 발견되었습니다.”\n\n당신은 이 꿈에서 고을의 사또입니다. 현장을 조사하고, 증거를 모아 용의자를 심문해야 합니다.");
    const magicSuspects = [
      { name: "건달프", id: "gandalf", scene: "/samunmong/assets/magic-school/interrogation/office-empty.png", sprite: "/samunmong/assets/magic-school/interrogation/gandalf-sprite.png", sleeveScene: "/samunmong/assets/magic-school/interrogation/office-empty.png" },
      { name: "덩쿨도어", id: "dunguldoor", scene: "/samunmong/assets/magic-school/interrogation/office-empty.png", sprite: "/samunmong/assets/magic-school/interrogation/dunguldoor-sprite.png", sleeveScene: "/samunmong/assets/magic-school/interrogation/office-empty.png" },
      { name: "말포일", id: "malpoil", scene: "/samunmong/assets/magic-school/interrogation/office-empty.png", sprite: "/samunmong/assets/magic-school/interrogation/malpoil-sprite.png", sleeveScene: "/samunmong/assets/magic-school/interrogation/office-empty.png" },
      { name: "말포이", id: "malpoi", scene: "/samunmong/assets/magic-school/interrogation/office-empty.png", sprite: "/samunmong/assets/magic-school/interrogation/malpoi-sprite.png", sleeveScene: "/samunmong/assets/magic-school/interrogation/office-empty.png" },
      { name: "말포삼", id: "malposam", scene: "/samunmong/assets/magic-school/interrogation/office-empty.png", sprite: "/samunmong/assets/magic-school/interrogation/malposam-sprite.png", sleeveScene: "/samunmong/assets/magic-school/interrogation/office-empty.png" }
    ];
    const spaceSuspects = [
      { name: "해리", id: "harry", scene: "/assets/space-station/backgrounds/emergency-investigation-room-v2.png", sprite: "/assets/space-station/characters/harry-upper-transparent.png", sleeveScene: "/assets/space-station/characters/harry-upper-transparent.png" },
      { name: "메르스", id: "mers", scene: "/assets/space-station/backgrounds/emergency-investigation-room-v2.png", sprite: "/assets/space-station/characters/mers-upper-aligned.png", sleeveScene: "/assets/space-station/characters/mers-upper-aligned.png" },
      { name: "알라딘딘", id: "aladdindin", scene: "/assets/space-station/backgrounds/emergency-investigation-room-v2.png", sprite: "/assets/space-station/characters/aladdindin-upper-aligned.png", sleeveScene: "/assets/space-station/characters/aladdindin-upper-aligned.png" },
      { name: "안성줴줴이", id: "ansungjyejyei", scene: "/assets/space-station/backgrounds/emergency-investigation-room-v2.png", sprite: "/assets/space-station/characters/ansungjyejyei-upper-aligned.png", sleeveScene: "/assets/space-station/characters/ansungjyejyei-upper-aligned.png" },
      { name: "아인슈페너", id: "einspanner", scene: "/assets/space-station/backgrounds/emergency-investigation-room-v2.png", sprite: "/assets/space-station/characters/einspanner-upper-aligned.png", sleeveScene: "/assets/space-station/characters/einspanner-upper-aligned.png" }
    ];
    const suspects = isSpaceTheme ? spaceSuspects : isMagicTheme ? magicSuspects : window.SAMUNMONG_CONTENT?.suspects || [
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
    let activeNoteSuspectId = suspects[0]?.id || (isSpaceTheme ? "harry" : isMagicTheme ? "gandalf" : "dolsoe");
    let briefingStepIndex = 0;
    let briefingRestoreTimer = 0;
    let isBriefingTyped = false;
    const conversationNotes = new Map();
    const sleeveCheckedSuspects = new Set();
    const saveKey = "samunmong-demo-state";
    const themeStorageSuffix = isSpaceTheme ? "space-station" : isMagicTheme ? "magic-school" : "joseon";
    const collectedEvidenceKey = `samunmong-collected-evidence-${themeStorageSuffix}`;
    const analyzedEvidenceKey = `samunmong-analyzed-evidence-${themeStorageSuffix}`;
    const conversationNotesKey = `samunmong-conversation-notes-${themeStorageSuffix}`;
    const interrogationQuestionCountKey = `samunmong-interrogation-question-count-${themeStorageSuffix}`;
    const fieldGuidePendingKey = "samunmong-field-guide-pending";
    const fieldGuideSeenKey = "samunmong-field-guide-seen";
    const settingsKey = "samunmong-demo-settings";
    const bgmStateKey = "samunmong-bgm-state";
    const interrogationQuestionLimit = 50;
    let fieldGuideStep = "";
    let fieldGuideMapTimer = 0;
    let briefingReturnScreenId = "fieldOne";

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
    const spaceLocationMeta = {
      tutorialScreen: { name: "튜토리얼", x: "18%", y: "18%" },
      dreamScreen: { name: "꿈 선택", x: "18%", y: "18%" },
      briefingScreen: { name: "사건 브리핑", x: "18%", y: "18%" },
      spaceAirlock: { name: "에어록", x: "18%", y: "25%" },
      spaceMedicalBay: { name: "의료실", x: "18%", y: "39%" },
      spaceOxygenGenerator: { name: "산소 발생기실", x: "18%", y: "55%" },
      spaceDataCore: { name: "데이터실", x: "18%", y: "72%" },
      spaceScienceLab: { name: "과학 실험실", x: "82%", y: "25%" },
      spaceGalleyCorridor: { name: "주방 복도", x: "82%", y: "39%" },
      spaceSuitPrep: { name: "외부 작업 준비실", x: "82%", y: "55%" },
      spaceObservation: { name: "관측 구역", x: "82%", y: "72%" },
      interrogationScreen: { name: "비상 조사실", x: "50%", y: "78%" }
    };
    const locationMeta = isSpaceTheme ? spaceLocationMeta : isMagicTheme ? magicLocationMeta : joseonLocationMeta;
    const magicMapPins = [
      { goTo: "magicAlchemyLab", label: "제1 연금술 실습실로 이동", text: "제1 연금술 실습실", x: "23.4%", y: "27.6%", rot: "0deg" },
      { goTo: "magicCleaningCloset", label: "청소도구함으로 이동", text: "청소도구함", x: "44.0%", y: "27.2%", rot: "0deg" },
      { goTo: "magicLibrary", label: "도서관으로 이동", text: "도서관", x: "65.7%", y: "23.8%", rot: "0deg" },
      { goTo: "magicRecordCrystalRoom", label: "기록 수정구실로 이동", text: "기록 수정구실", x: "78.4%", y: "47.4%", rot: "0deg" },
      { goTo: "magicDormHallway", label: "학생들 기숙사로 이동", text: "학생들 기숙사", x: "27.3%", y: "61.0%", rot: "0deg" },
      { goTo: "interrogationScreen", label: "교무 조사실로 이동", text: "교무 조사실", x: "70.3%", y: "73.6%", rot: "0deg" }
    ];
    const spaceMapPins = [
      { screen: "spaceAirlock", goTo: "spaceAirlock", label: "에어록으로 이동", text: "에어록", x: "18%", y: "25%", rot: "0deg" },
      { screen: "spaceMedicalBay", goTo: "spaceMedicalBay", label: "의료실로 이동", text: "의료실", x: "18%", y: "39%", rot: "0deg" },
      { screen: "spaceOxygenGenerator", goTo: "spaceOxygenGenerator", label: "산소 발생기실로 이동", text: "산소 발생기실", x: "18%", y: "55%", rot: "0deg" },
      { screen: "spaceDataCore", goTo: "spaceDataCore", label: "데이터실로 이동", text: "데이터실", x: "18%", y: "72%", rot: "0deg" },
      { screen: "spaceScienceLab", goTo: "spaceScienceLab", label: "과학 실험실로 이동", text: "과학 실험실", x: "82%", y: "25%", rot: "0deg" },
      { screen: "spaceGalleyCorridor", goTo: "spaceGalleyCorridor", label: "주방 복도로 이동", text: "주방 복도", x: "82%", y: "39%", rot: "0deg" },
      { screen: "spaceSuitPrep", goTo: "spaceSuitPrep", label: "외부 작업 준비실로 이동", text: "외부 작업 준비실", x: "82%", y: "55%", rot: "0deg" },
      { screen: "spaceObservation", label: "관측 구역 위치", text: "관측 구역", x: "82%", y: "72%", rot: "0deg" },
      { screen: "interrogationScreen", goTo: "interrogationScreen", label: "비상 조사실로 이동", text: "비상 조사실", x: "50%", y: "78%", rot: "0deg" }
    ];
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
      return knownScreenIds.has(saved?.screenId) && saved.screenId !== "mainScreen";
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
      clearTimeout(typeBriefing.decodeTimer);
      clearTimeout(briefingRestoreTimer);
    }

    function finishBriefingTyping() {
      clearInterval(typeBriefing.timer);
      clearTimeout(typeBriefing.decodeTimer);
      if (briefingCopy) {
        briefingCopy.textContent = briefingText;
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
      if (target.matches(".map-chip")) return isSpaceTheme ? "오르빗-13의 구역 도면을 펼칩니다." : "조사 장소를 오갑니다.";
      if (target.matches(".bag-chip")) return isSpaceTheme ? "증거 보관함에서 수집물을 확인합니다." : isMagicTheme ? "차원 주머니 속 증거를 불러옵니다." : "모은 증거를 확인합니다.";
      if (target.matches(".tool-chip")) return isSpaceTheme ? "스캔 도구로 잔류 신호를 분석합니다." : isMagicTheme ? "마력 감지로 잔류 흔적을 분석합니다." : "증거를 더 자세히 분석합니다.";
      if (target.matches(".note-chip")) return isSpaceTheme ? "대원별 통신 로그를 확인합니다." : "등장인물과 나눈 대화를 기록합니다.";
      if (target.matches(".journal-chip")) return isSpaceTheme ? "초기 사고 보고서를 다시 확인합니다." : isMagicTheme ? "수사 일지에서 관계자별 기록을 확인합니다." : "처음 사건 일지를 다시 봅니다.";
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

      if (targetRight > shellWidth * .68 && fitsLeft) {
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

    function applyThemeMap() {
      if (!isMagicTheme && !isSpaceTheme) return;
      const mapConfig = isSpaceTheme
        ? {
          src: "/assets/space-station/maps/orbit-13-blueprint.png",
          alt: "우주정거장 오르빗-13 조사 구역 도면",
          pins: spaceMapPins,
          labelOffset: "0%"
        }
        : {
          src: "/samunmong/assets/magic-school/ui/school-map.png",
          alt: "마법학교 조사 장소가 표시된 학교 지도",
          pins: magicMapPins,
          labelOffset: "-12%"
        };
      const mapImage = document.querySelector("#mapPanel .map-board img");
      if (mapImage) {
        mapImage.src = mapConfig.src;
        mapImage.alt = mapConfig.alt;
      }

      const labels = [...document.querySelectorAll(".map-label")];
      const pins = [...document.querySelectorAll(".map-pin-button")];
      mapConfig.pins.forEach((item, index) => {
        const label = labels[index];
        if (label) {
          label.hidden = false;
          label.textContent = item.text;
          label.dataset.locationScreen = item.screen || item.goTo;
          label.style.setProperty("--x", item.x);
          label.style.setProperty("--y", `calc(${item.y} + ${mapConfig.labelOffset})`);
          label.style.setProperty("--rot", item.rot);
        }
        const pin = pins[index];
        if (pin) {
          pin.hidden = false;
          if (item.goTo) {
            pin.dataset.mapGo = item.goTo;
            pin.disabled = false;
          } else {
            delete pin.dataset.mapGo;
            pin.disabled = true;
          }
          pin.setAttribute("aria-label", item.label);
          pin.style.setProperty("--x", item.x);
          pin.style.setProperty("--y", item.y);
        }
      });

      labels.slice(mapConfig.pins.length).forEach((label) => { label.hidden = true; });
      pins.slice(mapConfig.pins.length).forEach((pin) => { pin.hidden = true; });
    }

    function applyMagicUiCopies() {
      if (!isMagicTheme) return;

      document.querySelector(".briefing-card h2").textContent = "마법학교 방화사건";
      document.querySelector(".briefing-kicker").textContent = "기억 수정구";
      setStartCaseLabel("조사 시작");
      document.querySelector("[data-briefing-panel='1'] .briefing-caption").textContent = "실습실의 불은 어떻게 번졌는가";

      const evidenceStack = document.querySelector(".briefing-evidence-stack");
      if (evidenceStack) {
        evidenceStack.innerHTML = `
          <figure class="briefing-evidence-photo">
            <img src="/samunmong/assets/magic-school/scenes/alchemy-lab.png" alt="불탄 제1 연금술 실습실" draggable="false" />
            <figcaption>현장: 제1 연금술 실습실</figcaption>
          </figure>
          <figure class="briefing-evidence-photo briefing-evidence-photo-small">
            <img src="/samunmong/assets/magic-school/evidence/evidence-sheet.png" alt="마법학교 방화 사건 증거품" draggable="false" />
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
          gandalf: "경비원",
          dunguldoor: "학년부장",
          malpoil: "모범생",
          malpoi: "천재 학생",
          malposam: "환각 마법 학생"
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
        openMapFromInterrogation: ["학교 지도 열기", "학교 지도", "/samunmong/assets/magic-school/ui/icon-school-map.png"],
        openNoteProp: ["수사 일지 보기", "수사 일지", "/samunmong/assets/magic-school/ui/icon-investigation-journal.png"],
        toggleEvidenceBag: ["마법 가방 열기", "마법 가방", "/samunmong/assets/magic-school/ui/icon-magic-bag.png"]
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
      if (toolChip) toolChip.src = "/samunmong/assets/magic-school/ui/icon-mana-tools.png";
      const journalChip = document.querySelector("#interrogationScreen .journal-chip img");
      if (journalChip) journalChip.src = "/samunmong/assets/magic-school/ui/icon-investigation-journal.png";
      const interrogationJournalChip = document.querySelector("#interrogationScreen .journal-chip");
      interrogationJournalChip?.setAttribute("aria-label", "수사 일지 열기");
      const interrogationJournalLabel = interrogationJournalChip?.querySelector(".sr-only");
      if (interrogationJournalLabel) interrogationJournalLabel.textContent = "수사 일지";
      document.querySelectorAll(".magic-school-screen .journal-chip .magic-scene-chip-label").forEach((label) => {
        label.textContent = "수사 일지";
      });
      const accuseChip = document.querySelector("#accuseButton img");
      if (accuseChip) accuseChip.src = "/samunmong/assets/magic-school/ui/icon-final-accuse.png";
      const hintChip = document.querySelector("#interrogationHint img");
      if (hintChip) hintChip.src = "/samunmong/assets/magic-school/ui/icon-mana-hint.png";
      const hintLabel = document.querySelector("#interrogationHint .sr-only");
      if (hintLabel) hintLabel.textContent = "마력 감지";
      document.querySelector("#evidenceBagPop .bag-pop-head strong").textContent = "차원 주머니";
      const bagGuide = document.querySelector("#evidenceBagPop .bag-pop-guide");
      if (bagGuide) bagGuide.textContent = "차원 주머니에서 떠오른 증거를 선택해 심문에 제시합니다.";
      const emptyBag = document.querySelector("#emptyInterrogationEvidence");
      if (emptyBag) emptyBag.textContent = "차원 주머니에 떠오른 증거가 없습니다.";
      document.querySelector("#toolPanel h2").textContent = "마력 도구";
      document.querySelector("#toolPanel .tool-panel-kicker").textContent = "마력 분석";
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

    function setupEvidenceScreen(screenId) {
      const screen = document.getElementById(screenId);
      if (!screen) return;

      const evidenceHotspots = [...screen.querySelectorAll(".hotspot[data-evidence-name], #hopaeHotspot, #portraitHotspot")];
      evidenceHotspots.forEach((hotspot) => hotspot.classList.add("evidence-hotspot"));
      readStoredNames(collectedEvidenceKey).forEach((name) => {
        screen.querySelectorAll(`[data-evidence-name="${CSS.escape(name)}"]`).forEach((item) => item.classList.add("collected"));
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
        hintIcon.src = "/assets/space-station/ui-icons-v3/hint-beacon.png";
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
    }

    window.addEventListener("samunmong:screen-change", (event) => {
      const screenId = event.detail?.screenId || getActiveScreenId();
      refreshFieldGuideNodes();
      setupEvidenceScreen(screenId);
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
    const joseonThemeStartAssets = [
      "/samunmong/assets/mudeok-interaction/evidence-jeomsun-neck-exam-paper.png",
      "/samunmong/assets/mudeok-interaction/evidence-jeomsun-hand-exam-paper.png",
      "/samunmong/assets/suspects/dolsoe-seated.png",
      "/samunmong/assets/suspects/chunwol-seated.png",
      "/samunmong/assets/suspects/yoomunseok-seated.png",
      "/samunmong/assets/suspects/mudeok-seated.png"
    ];
    const magicThemeStartAssets = [
      "/samunmong/assets/magic-school/scenes/alchemy-lab.png",
      "/samunmong/assets/magic-school/scenes/cleaning-closet.png",
      "/samunmong/assets/magic-school/scenes/library.png",
      "/samunmong/assets/magic-school/interrogation/gandalf.png",
      "/samunmong/assets/magic-school/interrogation/dunguldoor.png",
      "/samunmong/assets/magic-school/interrogation/malpoil.png",
      "/samunmong/assets/magic-school/interrogation/malpoi.png",
      "/samunmong/assets/magic-school/interrogation/malposam.png"
    ];
    const spaceThemeStartAssets = [
      "/assets/space-station/backgrounds/orbit-13-airlock.png",
      "/assets/space-station/backgrounds/emergency-investigation-room-v2.png",
      "/assets/space-station/backgrounds/medical-bay.png",
      "/assets/space-station/backgrounds/oxygen-generator.png",
      "/assets/space-station/backgrounds/data-core.png",
      "/assets/space-station/backgrounds/suit-prep.png",
      "/assets/space-station/backgrounds/science-lab.png",
      "/assets/space-station/backgrounds/galley-corridor.png",
      "/assets/space-station/panels/log-record-panel-v2.png",
      "/assets/space-station/panels/evidence-vault-panel-v2.png",
      "/assets/space-station/panels/scan-tools-panel-v2.png",
      "/assets/space-station/maps/orbit-13-blueprint.png",
      "/assets/space-station/ui-icons-v2/emergency-investigation-v2.png",
      "/assets/space-station/ui-icons-v3/orbit-blueprint.png",
      "/assets/space-station/ui-icons-v3/evidence-vault.png",
      "/assets/space-station/ui-icons-v3/log-record.png",
      "/assets/space-station/ui-icons-v3/scan-tool.png",
      "/assets/space-station/ui-icons-v3/final-report.png",
      "/assets/space-station/ui-icons-v3/accuse-target.png",
      "/assets/space-station/ui-icons-v3/hint-beacon.png",
      "/assets/space-station/ui-buttons/space-next-button.svg",
      "/assets/space-station/characters/harry-upper.png",
      "/assets/space-station/characters/mers-upper.png",
      "/assets/space-station/characters/aladdindin-upper.png",
      "/assets/space-station/characters/ansungjyejyei-upper.png",
      "/assets/space-station/characters/einspanner-upper.png",
      "/assets/space-station/evidence/frozen-lever-gel.png",
      "/assets/space-station/evidence/final-radio-log.png",
      "/assets/space-station/evidence/disinfectant-cloth-glove.png",
      "/assets/space-station/evidence/deleted-medical-record.png",
      "/assets/space-station/evidence/damaged-pressure-sensor.png",
      "/assets/space-station/evidence/access-keycard-chip.png",
      "/assets/space-station/evidence/engineer-tool-clamp.png",
      "/assets/space-station/evidence/coffee-tumbler.png",
      "/assets/space-station/loading/space-transition-bg.png"
    ];
    const themeStartAssets = isSpaceTheme ? spaceThemeStartAssets : isMagicTheme ? magicThemeStartAssets : joseonThemeStartAssets;
    const magicLoadingArtwork =
      "url('/samunmong/assets/magic-school/loading/magic-transition-bg.png') center / cover no-repeat, #050403";
    const spaceLoadingArtwork =
      "url('/assets/space-station/loading/space-transition-bg.png') center / cover no-repeat, #030608";
    const magicThemeLoadingScreens = new Set([
      "briefingScreen",
      "magicAlchemyLab",
      "magicCleaningCloset",
      "magicLibrary",
      "magicRecordCrystalRoom",
      "magicDormHallway",
      "interrogationScreen"
    ]);

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
        briefingCopy.textContent = briefingText.slice(0, index);
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
      const allowedScreens = new Set(["tutorialScreen", "dreamScreen", "briefingScreen", "fieldOne", "chunwolRoom", "mudeokServantRoom", "yoomunseokSarangbang", "dolsoeQuarters", "backGateCourtyard", "magicAlchemyLab", "magicCleaningCloset", "magicLibrary", "magicRecordCrystalRoom", "magicDormHallway", "spaceAirlock", "spaceMedicalBay", "spaceOxygenGenerator", "spaceDataCore", "spaceScienceLab", "spaceGalleyCorridor", "spaceSuitPrep", "interrogationScreen"]);

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
        window.location.href = `/result?${params.toString()}`;
      }, loadingDuration);
    }

    const settingsDialog = document.querySelector("#settingsDialog");
    const exitDialog = document.querySelector("#exitDialog");
    const defaultSettings = { volume: 70, reduceMotion: false, highContrast: false };
    applySettings({ ...defaultSettings, ...readStored(settingsKey, {}) });
    if (briefingTitle && isSpaceTheme) briefingTitle.textContent = "우주정거장 살인사건";
    applyThemeMap();
    applyMagicUiCopies();
    setMagicRecordTab("0");
    updateMagicStudentPage(0);
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
      localStorage.setItem(themeKey, "joseon");
      if (isMagicTheme) {
        window.location.href = "/?start=briefingScreen&theme=joseon";
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
      localStorage.setItem(themeKey, "magicSchool");
      window.location.href = "/?start=briefingScreen&theme=magicSchool";
    });
    on("#chooseSpaceStation", "click", () => {
      localStorage.setItem(themeKey, "spaceStation");
      window.location.href = "/?start=briefingScreen&theme=spaceStation";
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
      const point = getMemoryDrawPoint(event);
      if (!point) return;
      memoryTracePoints.push(point);
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
        briefingStepIndex = isMagicTheme && briefingStepIndex === 0 ? 2 : briefingStepIndex + 1;
        updateBriefingStep();
      }
    });
    on("#startCase", "click", () => {
      if (briefingCard?.dataset.briefingMode === "deathOnly") {
        const returnScreen = knownScreenIds.has(briefingReturnScreenId)
          ? briefingReturnScreenId
          : (isMagicTheme ? "magicAlchemyLab" : "fieldOne");
        go(returnScreen, "사건 일지를 덮는 중...");
        return;
      }

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
      closeFieldGuide();
    });
    document.addEventListener("click", (event) => {
      const button = event.target instanceof Element ? event.target.closest("[data-go]") : null;
      if (!button || isFieldGuideBlockingControls()) return;
      const target = button.dataset.go;
      const isJournalBriefing = target === "briefingScreen";
      if (isJournalBriefing) {
        briefingReturnScreenId = getActiveScreenId() || "fieldOne";
      }
      go(target, isJournalBriefing ? "사건 일지를 펼치는 중..." : "이동 중...");
      if (target === "briefingScreen") {
        setTimeout(() => startBriefingSequence("deathOnly"), 340);
      }
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

    const magicTools = {
      "마력의 시선": {
        img: "/samunmong/assets/magic-school/ui/tool-mana-vision.png",
        note: "증거 주변에 남은 마력을 색으로 드러냅니다."
      },
      "잔류 마력 렌즈": {
        img: "/samunmong/assets/magic-school/ui/tool-residue-lens.png",
        note: "책, 룬스톤, 수정구에 남은 미세한 마력 결을 확대합니다."
      },
      "룬 해독 펜": {
        img: "/samunmong/assets/magic-school/ui/tool-rune-pen.png",
        note: "보안 룬과 기록 수정구의 조작 흔적을 해독합니다."
      }
    };

    const magicEvidenceData = {
      "부러진 지팡이": {
        note: "실습실 바닥에서 발견된 지팡이 조각. 붉은 화염 마력이 남아 있어 말포이를 범인처럼 보이게 한다.",
        location: "제1 연금술 실습실",
        logic: "말포이는 지팡이를 자주 부수는 학생이라 초반 의심을 받지만, 이 지팡이가 직접 버린 것인지 누가 주워 쓴 것인지 확인해야 한다.",
        relatedSuspects: ["말포이", "말포일"],
        img: "/samunmong/assets/magic-school/evidence-cutouts/broken-wand.png",
        tool: "마력의 시선",
        toolResult: "붉은 마력이 선명하지만, 손잡이 주변의 잔류 마력은 최근 사용자의 것과 섞여 있다.\n말포이의 지팡이처럼 보이지만 누군가 주워 다시 쓴 흔적이 있다."
      },
      "화염 감지 룬스톤": {
        note: "화재를 알려야 할 룬스톤이 꺼져 있다. 표면에는 성에와 하늘색 빙결 마력이 남아 있다.",
        location: "제1 연금술 실습실",
        logic: "화재 경보가 울리지 않은 이유를 설명하는 수법 단서다. 섬세한 빙결 마법을 못 쓰는 말포이와 맞지 않는다.",
        relatedSuspects: ["말포이", "말포일"],
        img: "/samunmong/assets/magic-school/evidence-cutouts/fire-rune-stone.png",
        tool: "룬 해독 펜",
        toolResult: "룬의 공명선이 얼음 원소에 눌려 끊겨 있다.\n화재가 난 뒤 꺼진 것이 아니라, 불이 번지기 전에 먼저 무력화된 상태다."
      },
      "기록의 수정구": {
        note: "복도 기록이 아무 일 없는 장면으로 덮여 있다. 보라색 환각 마력이 수정구 안쪽에서 흐른다.",
        location: "제1 연금술 실습실",
        logic: "누군가 현장 출입 기록을 환각으로 덮었다. 환각 마법을 다루는 말포삼과 연결된다.",
        relatedSuspects: ["말포삼", "말포일"],
        img: "/samunmong/assets/magic-school/evidence-cutouts/record-crystal.png",
        tool: "룬 해독 펜",
        toolResult: "기록 자체가 사라진 것이 아니라, 환각층이 위에 덧씌워져 있다.\n환각 마법을 건 사람과 지시한 사람을 따로 확인해야 한다."
      },
      "금지된 마법 담배 재": {
        note: "청소도구함에서 발견된 초록 마력의 재와 환각 환타지아 잎. 덩쿨도어가 숨긴 알리바이 단서다.",
        location: "청소도구함",
        logic: "덩쿨도어는 현장 근처에 있었고 탄 냄새가 났지만, 실제로는 금지된 마법 담배를 피우고 있었다.",
        relatedSuspects: ["덩쿨도어"],
        img: "/samunmong/assets/magic-school/evidence-cutouts/magic-cigarette-ash.png",
        tool: "마력의 시선",
        toolResult: "초록 마력이 재 주변에만 둥글게 남아 있다.\n방화의 붉은 마력과 결이 달라, 덩쿨도어의 탄 냄새는 담배 쪽에 가깝다."
      },
      "도서관 대출 기록부": {
        note: "말포일의 이름으로 보안 마법 책이 대출된 기록. 건달프의 도서관 힌트와 이어진다.",
        location: "도서관",
        logic: "말포일이 화염 감지 룬스톤의 약점을 미리 조사했다는 정황이다.",
        relatedSuspects: ["말포일"],
        img: "/samunmong/assets/magic-school/evidence-cutouts/library-loan-ledger.png",
        tool: "잔류 마력 렌즈",
        toolResult: "기록부의 해당 줄 주변에 말포일이 자주 쓰는 잉크와 같은 보라빛 먼지가 남아 있다.\n책을 빌린 사실을 단순한 우연으로 보기 어렵다."
      },
      "빙결 흔적이 남은 반납 도서": {
        note: "보안 마법 책 표지에 룬스톤과 같은 하늘색 빙결 흔적이 남아 있다.",
        location: "도서관",
        logic: "말포일이 책 지식으로 룬스톤 무력화를 연습했다는 수법 단서다.",
        relatedSuspects: ["말포일", "말포이"],
        img: "/samunmong/assets/magic-school/evidence-cutouts/frost-returned-book.png",
        tool: "잔류 마력 렌즈",
        toolResult: "책 표지의 빙결 마력 결이 룬스톤 표면의 흔적과 거의 같다.\n이는 단순 독서가 아니라 실제 연습 흔적이다."
      },
      "조작된 기록 수정구": {
        note: "기록 수정구실의 중심 수정구. 실습실의 수정구와 같은 보라색 환각층이 남아 있다.",
        location: "기록 수정구실",
        logic: "말포삼이 환각 마법을 걸었고, 누군가가 그에게 부탁했다는 사실로 이어진다.",
        relatedSuspects: ["말포삼", "말포일"],
        img: "/samunmong/assets/magic-school/evidence-cutouts/record-crystal.png",
        tool: "룬 해독 펜",
        toolResult: "수정구 조작 주문은 서툴지만 목적은 분명하다.\n직접 범행을 숨기려는 사람보다, 누군가의 부탁을 받고 덮은 흔적에 가깝다."
      },
      "버려진 지팡이 조각": {
        note: "학생들 기숙사에서 발견된 버려진 지팡이 조각. 실습실 지팡이와 결이 이어진다.",
        location: "학생들 기숙사",
        logic: "말포이가 버린 지팡이를 누군가 주워 방화에 이용했을 가능성을 보여 준다.",
        relatedSuspects: ["말포이", "말포일"],
        img: "/samunmong/assets/magic-school/evidence-cutouts/discarded-wand-shard.png",
        tool: "마력의 시선",
        toolResult: "버려진 조각에는 말포이의 강한 마력 흔적이 남아 있지만, 실습실 지팡이에는 다른 손길의 잔류 마력이 덧씌워져 있다."
      },
      "말포삼의 자백": {
        note: "말포삼이 말포일의 부탁으로 기록 수정구에 환각 마법을 걸었다고 털어놓은 진술.",
        location: "교무 조사실",
        logic: "수정구 조작의 실행자는 말포삼이지만, 지시자는 말포일이라는 결정타 증언이다.",
        relatedSuspects: ["말포삼", "말포일"],
        img: "/samunmong/assets/magic-school/evidence-cutouts/crystal-confession-vial.png"
      }
    };

    const spaceTools = {
      "신호 스캐너": {
        img: "/assets/space-station/ui-icons-v3/scan-tool.png",
        note: "잔류 전자 신호와 장비 작동 흔적을 읽습니다."
      },
      "의료 분석 렌즈": {
        img: "/assets/space-station/ui-icons-v3/hint-beacon.png",
        note: "의료용 젤, 약품, 생체 기록의 미세 흔적을 확인합니다."
      },
      "로그 복구 모듈": {
        img: "/assets/space-station/ui-icons-v3/log-record.png",
        note: "삭제되거나 끊긴 기록의 조각을 복구합니다."
      }
    };

    const spaceEvidenceData = {
      "얼어붙은 추진 레버 젤": {
        note: "외부 작업용 우주복 추진 레버 홈에서 발견된 투명한 얼음막. 내부 점검 때는 보이지 않았을 가능성이 있다.",
        location: "에어록",
        logic: "정거장 내부에서는 액체였지만 그늘 구역의 극저온에서 얼어붙어 레버를 막았다는 수법 단서다.",
        relatedSuspects: ["메르스", "알라딘딘"],
        img: "/assets/space-station/evidence/frozen-lever-gel.png",
        tool: "의료 분석 렌즈",
        toolResult: "성분이 의료실 수술용 밀봉 젤과 일치한다.\n기계 결함이 아니라 누군가 레버 홈에 젤을 미리 채워 넣은 흔적이다."
      },
      "마지막 무전 로그": {
        note: "데이비드가 표류 직전 남긴 마지막 통신 기록. 겉으로는 구조 요청처럼 들리지만 표현이 지나치게 침착하다.",
        location: "에어록",
        logic: "데이비드가 사고를 연기했을 가능성과 메르스와의 비밀 계약을 암시한다.",
        relatedSuspects: ["데이비드", "메르스"],
        img: "/assets/space-station/evidence/final-radio-log.png",
        tool: "로그 복구 모듈",
        toolResult: "무전 마지막에 짧은 숨 고르기와 암호화된 개인 채널 호출 흔적이 남아 있다.\n단순 비명보다 누군가에게 보내는 신호처럼 들린다."
      },
      "소독천과 장갑": {
        note: "의료실 폐기함 근처에서 발견된 소독천과 장갑. 투명 젤 성분이 희미하게 묻어 있다.",
        location: "의료실",
        logic: "범행 도구가 의료실에서 준비됐다는 정황이다.",
        relatedSuspects: ["메르스"],
        img: "/assets/space-station/evidence/disinfectant-cloth-glove.png",
        tool: "의료 분석 렌즈",
        toolResult: "장갑 안쪽에는 메르스가 쓰는 의료용 소독제와 같은 잔류 성분이 남아 있다.\n레버 젤과 의료실이 연결된다."
      },
      "삭제된 의료 기록": {
        note: "데이비드의 퇴행성 근위축증 진단 기록이 해리 계정으로 삭제된 흔적.",
        location: "의료실",
        logic: "해리가 데이터를 날린 것이 아니라 누군가 해리 계정을 이용해 데이비드의 병을 숨겼다는 단서다.",
        relatedSuspects: ["해리", "메르스", "데이비드"],
        img: "/assets/space-station/evidence/deleted-medical-record.png",
        tool: "로그 복구 모듈",
        toolResult: "삭제 명령은 해리 계정으로 실행됐지만 접근 위치는 의료실 단말이다.\n해리의 실수라는 설명과 맞지 않는다."
      },
      "손상된 압력 센서": {
        note: "산소 발생기 압력 밸브의 미세 센서가 얇은 날붙이로 손상되어 있다.",
        location: "산소 발생기실",
        logic: "정전은 우연이 아니라 외부 작업 시간에 맞춘 지연 장치였음을 보여 준다.",
        relatedSuspects: ["메르스"],
        img: "/assets/space-station/evidence/damaged-pressure-sensor.png",
        tool: "신호 스캐너",
        toolResult: "센서 손상 뒤에도 약 5시간 동안 정상값을 흉내 낸 기록이 남아 있다.\n정전 당시 알리바이는 범행 시간을 설명하지 못한다."
      },
      "접속 키카드 칩": {
        note: "데이터실 바닥에서 발견된 접속 칩. 해리 계정 세션과 의료실 단말 접근 기록이 함께 남아 있다.",
        location: "데이터실",
        logic: "데이터 삭제가 해리 본인의 실수가 아니라 계정 도용일 수 있음을 보강한다.",
        relatedSuspects: ["해리", "메르스"],
        img: "/assets/space-station/evidence/access-keycard-chip.png",
        tool: "로그 복구 모듈",
        toolResult: "칩의 마지막 인증 위치가 데이터실이 아니라 의료실 보조 단말로 찍혀 있다.\n해리가 자책하던 삭제 사고는 누군가의 위장일 가능성이 커진다."
      },
      "엔지니어 공구 클램프": {
        note: "외부 작업 준비실의 공구 클램프. 알라딘딘의 점검 루틴에 쓰였지만 레버 젤 흔적은 없다.",
        location: "외부 작업 준비실",
        logic: "알라딘딘이 우주복을 점검했을 때 젤이 보이지 않았다는 진술을 뒷받침한다.",
        relatedSuspects: ["알라딘딘"],
        img: "/assets/space-station/evidence/engineer-tool-clamp.png"
      },
      "커피 텀블러": {
        note: "정전 직전 복도에 떠다니던 텀블러. 대원들이 각자 어디에 있었는지 맞추는 알리바이 단서다.",
        location: "주방 복도",
        logic: "정전 당시 위치보다 정전이 준비된 시점이 더 중요하다는 점을 드러낸다.",
        relatedSuspects: ["안성줴줴이", "아인슈페너"],
        img: "/assets/space-station/evidence/coffee-tumbler.png"
      }
    };

    const tools = isSpaceTheme ? spaceTools : isMagicTheme ? magicTools : {
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

    const evidenceData = isSpaceTheme ? spaceEvidenceData : isMagicTheme ? magicEvidenceData : window.SAMUNMONG_CONTENT?.evidenceData || {
      "호패 조각": {
        note: "점순 옆에서 발견된 신분 단서. 유문석의 물건처럼 보이지만 일부 글자가 긁혀 있다.",
        img: "/samunmong/assets/evidence-wooden-tag.png",
        tool: "먼지털이 붓",
        toolResult: "먼지털이 붓으로 털자 긁힌 글자 홈 사이에 고운 분가루가 남아 있다.\n거칠게 굴러다닌 물건이라기보다, 누군가 손에 쥐고 옮긴 뒤 일부러 현장에 둔 듯하다."
      },
      "돌쇠의 그림": {
        note: "최춘월의 방에서 발견된 숨겨둔 초상. 오래 숨긴 마음과 집착을 추적할 단서다.",
        img: "/samunmong/assets/evidence-portrait-v2.png",
        tool: "돋보기",
        toolResult: "돋보기로 보니 돌쇠의 눈매와 옷깃이 여러 번 고쳐져 있다.\n그림 가장자리에는 지운 글씨 자국이 남아 있고, ‘떠나지 마라’로 보이는 획이 희미하다.\n우연한 초상이라기보다 오래 눌러 둔 마음에 가깝다."
      },
      "헐거워진 노리개": {
        note: "끊어진 장식과 급히 잡아챈 듯한 흔적이 남은 노리개. 누가 지녔는지 확인해야 한다.",
        img: "/samunmong/assets/evidence-transparent/evidence-norigae-transparent.png"
      },
      "무덕의 번진 일기": {
        note: "먹이 번져 읽기 어려운 일기. 점순과 돌쇠의 도망 계획이 춘월에게 닿은 경로를 추적할 수 있다.",
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
        note: "춘월의 혼인을 재촉하는 문서 조각. 춘월이 자기 삶을 통제하지 못하던 처지를 보여 준다.",
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
        note: "급히 싼 듯한 보따리. 점순과 돌쇠가 떠나려 했고, 그 사실이 누군가의 감정을 건드렸는지 확인해야 한다.",
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
    document.addEventListener("click", (event) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;

      if (target.closest("#closeHopaeInspect, #closeGenericEvidenceInspect")) {
        hideInspectPanels();
        return;
      }
      if (target.closest("#collectPortrait")) {
        collectPortrait();
        return;
      }

      const hotspot = target.closest("[data-evidence-name]");
      if (!hotspot) return;
      if (hotspot.id === "hopaeHotspot") {
        collectHopae();
        showInspect("#hopaeInspect");
        return;
      }
      if (hotspot.id === "portraitHotspot") {
        collectPortrait();
        document.querySelector("#collectPortrait").textContent = "보따리에서 분석하기";
        showInspect("#portraitInspect");
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
    document.querySelector("#toolPreviewImage")?.addEventListener("dragstart", (event) => event.preventDefault());
    document.querySelector("#toolPreviewImage")?.addEventListener("load", syncEvidenceShadowBounds);
    setupEvidenceScreen(getActiveScreenId());

    function updateSuspect(shouldAnnounce = true) {
      const suspect = suspects[suspectIndex];
      document.querySelector("#suspectName").textContent = suspect.name;
      document.querySelector("#suspectStage").dataset.suspect = suspect.id;
      document.querySelector("#interrogationPlate").src = suspect.scene;
      const suspectSprite = document.querySelector("#suspectSprite");
      if ((isMagicTheme || isSpaceTheme) && suspectSprite && suspect.sprite) {
        suspectSprite.src = suspect.sprite;
      } else if (suspectSprite) {
        suspectSprite.src = suspect.sleeveScene || suspect.scene;
      }
      activeNoteSuspectId = suspect.id;
      renderConversationNotes();
      syncVisibleSuspectReply();
      if (shouldAnnounce && getActiveScreenId() === "interrogationScreen") {
        showToast(`${suspect.name} 심문으로 전환`);
      }
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
          name.textContent = message.sender === "player" ? (isMagicTheme ? "선생님" : "사또") : activeSuspect.name;

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
      if (open) evidenceBagPop.classList.remove("closing");
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
      if (id !== "mapPanel" && isFieldGuideBlockingControls()) return;
      hideInspectPanels();
      setEvidenceBag(false);

      globalPanels.forEach((panel) => {
        const isOpen = panel.id === id;
        if (isOpen) panel.classList.remove("closing");
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
      if (wasGuideMapOpen) setFieldGuideStep("tools");
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
    document.addEventListener("keydown", (event) => {
      const target = event.target;
      const isTyping = target?.matches?.("input, textarea, select, [contenteditable='true']");
      if (event.key !== "Tab" || event.altKey || event.ctrlKey || event.metaKey || isTyping) return;
      if (isFieldGuideBlockingControls()) return;
      event.preventDefault();
      openGlobalPanel("toolPanel");
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
        go(target, isSpaceTheme ? "궤도 도면에서 이동 중..." : isMagicTheme ? "학교 지도에서 이동 중..." : "마을 지도에서 이동 중...");
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
        maybeCollectInterrogationEvidence(suspect, answer, data.usedEvidenceNames);
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
        document.querySelector("#interrogationPlate").src = suspect.scene;
        if (isMagicTheme && suspect.sprite) document.querySelector("#suspectSprite").src = suspect.sprite;
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
        if ((isMagicTheme || isSpaceTheme) && screenId === "interrogationScreen") return;
        document.querySelector(`#${screenId} .plate`)?.setAttribute("src", imageSrc);
      });
      if (isMagicTheme) {
        document.querySelector("#interrogationPlate")?.setAttribute("src", "/samunmong/assets/magic-school/interrogation/office-empty.png");
      } else if (isSpaceTheme) {
        updateSuspect(false);
      }
    }

    applyContentImages();
    renderTools();
    restoreConversationNotes();
    restoreSavedInvestigation();
    renderConversationNotes();
    setupButtonGuides();
    showInitialScreenFromSetup();
  

})();
