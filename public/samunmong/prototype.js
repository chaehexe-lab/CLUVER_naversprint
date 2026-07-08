

    const screens = [...document.querySelectorAll(".screen")];
    const fade = document.querySelector("#fade");
    const toast = document.querySelector("#toast");
    const briefingCopy = document.querySelector("#briefingCopy");
    const startCaseButton = document.querySelector("#startCase");
    let selectedEvidence = "";
    let isAskingAi = false;
    const interrogationHistory = [];
    const entryParams = new URLSearchParams(window.location.search);
    const briefingText = "“사또님, 관아 근처에서 사람이 쓰러진 채 발견되었습니다.”\n\n당신은 이 꿈에서 고을의 사또입니다. 현장을 조사하고, 증거를 모아 용의자를 심문해야 합니다.";
    const suspects = window.SAMUNMONG_CONTENT?.suspects || [
      { name: "돌쇠", id: "dolsoe", scene: "/samunmong/assets/scene-interrogation-dolsoe.png?v=scene-20260707", sleeveScene: "/samunmong/assets/scene-interrogation-dolsoe-sleeve.png?v=sleeve-20260707" },
      { name: "최춘월", id: "chunwol", scene: "/samunmong/assets/scene-interrogation-chunwol.png?v=scene-20260707", sleeveScene: "/samunmong/assets/scene-interrogation-chunwol-sleeve.png?v=sleeve-20260707" },
      { name: "유문석", id: "yoomunseok", scene: "/samunmong/assets/scene-interrogation-yoomunseok.png?v=scene-20260707", sleeveScene: "/samunmong/assets/scene-interrogation-yoomunseok-sleeve.png?v=sleeve-20260707" },
      { name: "무덕", id: "mudeok", scene: "/samunmong/assets/scene-interrogation-mudeok.png?v=scene-20260707", sleeveScene: "/samunmong/assets/scene-interrogation-mudeok-sleeve.png?v=sleeve-20260707" }
    ];
    let suspectIndex = 0;
    const sleeveCheckedSuspects = new Set();
    const saveKey = "samunmong-demo-state";
    const collectedEvidenceKey = "samunmong-collected-evidence";
    const settingsKey = "samunmong-demo-settings";


    function readStored(key, fallback) {
      try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
      catch { return fallback; }
    }

    function saveProgress(screenId) {
      if (screenId === "mainScreen") return;
      localStorage.setItem(saveKey, JSON.stringify({ screenId, savedAt: Date.now() }));
    }

    function saveCollectedEvidence(name) {
      const collected = new Set(readStored(collectedEvidenceKey, []));
      collected.add(name);
      localStorage.setItem(collectedEvidenceKey, JSON.stringify([...collected]));
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
          track.pause();
          track.currentTime = 0;
        }
      });
      currentBgm = nextBgm;
      if (!audioUnlocked) return;
      bgmTracks[nextBgm]?.play().catch(() => {});
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
      bgmTracks[activeBgm]?.play()
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
      document.querySelector("#volumeSetting").value = settings.volume;
      document.querySelector("#motionSetting").checked = settings.reduceMotion;
      document.querySelector("#contrastSetting").checked = settings.highContrast;
      applyAudioVolume();
    }

    function showToast(message) {
      toast.textContent = message;
      toast.classList.add("show");
      clearTimeout(showToast.timer);
      showToast.timer = setTimeout(() => toast.classList.remove("show"), 1900);
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
      updateCurrentLocation(event.detail?.screenId || getActiveScreenId());
    });

    function go(id, message = "이동 중...") {
      stopBriefingTyping();
      playSfx("move", 0.82);
      fade.textContent = message;
      fade.classList.add("show");
      setTimeout(() => {
        screens.forEach((screen) => screen.classList.toggle("active", screen.id === id));
        updateCurrentLocation(id);
        saveProgress(id);
        fade.classList.remove("show");
        updateBgmForScreen(id);
      }, 260);
    }

    function goRush(id, message = "사건 현장으로 진입 중...") {
      stopBriefingTyping();
      playSfx("briefingNext", 0.9);
      fade.textContent = message;
      fade.classList.add("show", "long");
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
        fade.classList.remove("show");
        updateCurrentLocation(id);
        saveProgress(id);
        updateBgmForScreen(id);
      }, 520);
      setTimeout(() => fade.classList.remove("long"), 980);
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
      window.location.href = `/result?${params.toString()}`;
    }

    const settingsDialog = document.querySelector("#settingsDialog");
    const exitDialog = document.querySelector("#exitDialog");
    const defaultSettings = { volume: 70, reduceMotion: false, highContrast: false };
    applySettings({ ...defaultSettings, ...readStored(settingsKey, {}) });
    updateBgmForScreen();
    startAutoplayRetries();
    window.addEventListener("focus", tryAutoplayBgm);
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

    document.querySelector("#newDream").addEventListener("click", () => {
      localStorage.removeItem(saveKey);
      localStorage.removeItem(collectedEvidenceKey);
      go("tutorialScreen");
    });
    document.querySelector("#continueDream").addEventListener("click", () => {
      const saved = readStored(saveKey, null);
      const valid = screens.some((screen) => screen.id === saved?.screenId) && saved.screenId !== "mainScreen";
      go(valid ? saved.screenId : "tutorialScreen", valid ? "지난 꿈으로 돌아가는 중..." : "새로운 꿈을 시작합니다...");
      if (saved?.screenId === "briefingScreen") setTimeout(typeBriefing, 300);
    });
    document.querySelector("#openSettings").addEventListener("click", () => settingsDialog.classList.add("open"));
    document.querySelector("#closeSettings").addEventListener("click", () => {
      const settings = {
        volume: Number(document.querySelector("#volumeSetting").value),
        reduceMotion: document.querySelector("#motionSetting").checked,
        highContrast: document.querySelector("#contrastSetting").checked
      };
      localStorage.setItem(settingsKey, JSON.stringify(settings));
      applySettings(settings);
      settingsDialog.classList.remove("open");
      showToast("설정을 저장했습니다.");
    });
    document.querySelector("#exitGame").addEventListener("click", () => exitDialog.classList.add("open"));
    document.querySelector("#cancelExit").addEventListener("click", () => exitDialog.classList.remove("open"));
    document.querySelector("#confirmExit").addEventListener("click", () => {
      exitDialog.classList.remove("open");
      document.querySelector("#mainScreen").classList.add("exited");
      document.querySelectorAll(".main-menu-button").forEach((button) => { button.hidden = true; });
      showToast("게임을 종료했습니다. 창을 닫아도 진행 위치가 보존됩니다.");
      window.close();
    });
    document.querySelector("#skipTutorial").addEventListener("click", () => go("dreamScreen"));
    document.querySelector("#nextTutorial").addEventListener("click", () => go("dreamScreen"));
    document.querySelector("#chooseJoseon").addEventListener("click", () => {
      playSfx("dream", 0.9);
      go("briefingScreen");
      setTimeout(typeBriefing, 300);
    });
    document.querySelector("#startCase").addEventListener("click", () => goRush("fieldOne", "사건 현장으로 진입 중..."));
    document.querySelectorAll("[data-go]").forEach((button) => {
      button.addEventListener("click", () => go(button.dataset.go));
    });
    document.querySelector("#accuseButton").addEventListener("click", openResultPage);

    let hopaeCollected = false;
    let portraitCollected = false;
    let pendingEvidenceName = "";
    let pendingEvidenceHotspot = null;
    let currentEvidenceForTool = "";

    const tools = {
      "돋보기": {
        img: "/samunmong/assets/mudeok-interaction/tool-magnifying-glass.png",
        note: "작은 글자, 긁힌 자국, 미세한 흔적을 확대합니다."
      },
      "먼지털이 붓": {
        img: "/samunmong/assets/mudeok-interaction/tool-dusting-brush.png",
        note: "흙먼지나 재를 털어 숨은 표면을 드러냅니다."
      },
      "문서칼": {
        img: "/samunmong/assets/mudeok-interaction/tool-document-knife.png",
        note: "겹친 종이나 묶인 끈을 조심스럽게 벌립니다."
      },
      "촛불 등불": {
        img: "/samunmong/assets/mudeok-interaction/tool-candle-lantern.png",
        note: "어두운 곳, 비침, 눌린 자국을 빛으로 확인합니다."
      },
      "먹물 테스트 천": {
        img: "/samunmong/assets/mudeok-interaction/tool-ink-test-cloth.png",
        note: "먹, 피, 젖은 얼룩을 문질러 반응을 봅니다."
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
        tool: "촛불 등불",
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
        tool: "문서칼",
        toolResult: "문서칼로 틈을 살피자 상자 안쪽에 종이 가루가 남아 있다."
      },
      "무덕의 번진 일기": {
        note: "먹이 번져 읽기 어려운 일기. 도구로 얼룩을 확인하면 숨긴 문장을 더 추적할 수 있다.",
        img: "/samunmong/assets/mudeok-interaction/evidence-mudeok-smeared-diary.png",
        tool: "먹물 테스트 천",
        toolResult: "먹물 테스트 천에 묻어난 얼룩이 최근에 젖은 흔적처럼 번진다."
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
        tool: "촛불 등불",
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
        tool: "문서칼",
        toolResult: "붙어 있던 장부장을 벌리자 빠진 줄 하나가 드러난다."
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
        tool: "먹물 테스트 천",
        toolResult: "천에 묻은 가루가 물기와 닿자 짙은 먹빛으로 번진다."
      },
      "혼서 조각": {
        note: "혼례와 관련 있어 보이는 문서 조각. 인물 관계를 다시 보게 만드는 단서다.",
        img: "/samunmong/assets/evidence-transparent/evidence-marriage-letter.png",
        tool: "촛불 등불",
        toolResult: "빛에 비추자 접힌 자국 아래 희미한 붉은 인장이 보인다."
      },
      "도끼와 칼": {
        note: "돌쇠 처소에서 확인한 날붙이. 직접 결론보다 사용 흔적을 조사해야 한다.",
        img: "/samunmong/assets/evidence-transparent/evidence-axe-knife.png",
        tool: "먹물 테스트 천",
        toolResult: "날 가장자리에는 오래된 얼룩과 새 얼룩이 섞여 있다."
      },
      "피 묻은 붕대": {
        note: "피처럼 보이는 얼룩이 남은 붕대. 상처나 몸싸움 흔적과 연결될 수 있다.",
        img: "/samunmong/assets/evidence-transparent/evidence-bloodied-bandage.png",
        tool: "먹물 테스트 천",
        toolResult: "천으로 찍어 보니 얼룩 일부는 아직 짙게 번진다."
      },
      "도망 보따리": {
        note: "급히 싼 듯한 보따리. 누군가 떠날 준비를 했는지 확인해야 한다.",
        img: "/samunmong/assets/evidence-transparent/evidence-escape-bundle.png",
        tool: "문서칼",
        toolResult: "묶음을 살짝 벌리자 안쪽에 접힌 종이 조각이 끼어 있다."
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
        tool: "촛불 등불",
        toolResult: "낮게 비춘 빛에 발자국 가장자리의 물기가 선명해진다."
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
        tool: "문서칼",
        toolResult: "문서칼로 가장자리를 맞추자 찢어진 결이 자연스럽게 이어진다."
      },
      "찢어진 편지 조각": {
        note: "찢겨 나간 편지의 일부. 누군가 숨기려 했던 말이 남아 있을 수 있다.",
        img: "/samunmong/assets/evidence-transparent/evidence-torn-letter-transparent.png",
        tool: "촛불 등불",
        toolResult: "빛을 비추자 종이 뒷면에 흐릿한 먹 자국이 보인다."
      }
    };

    function addEvidenceToNote(name) {
      const list = document.querySelector("#collectedEvidenceNote");
      document.querySelector("#emptyEvidenceNote")?.remove();
      const exists = [...list.children].some((item) => item.dataset.evidence === name);
      if (!exists) {
        const item = document.createElement("li");
        item.dataset.evidence = name;
        item.textContent = `${name}: ${evidenceData[name]?.note || "현장에서 발견된 단서"}`;
        list.appendChild(item);
      }

      const fieldList = document.querySelector("#fieldNoteList");
      document.querySelector("#emptyFieldNote")?.remove();
      const fieldExists = [...fieldList.children].some((item) => item.dataset.evidence === name);
      if (!fieldExists) {
        const item = document.createElement("li");
        item.dataset.evidence = name;
        item.textContent = `${name}: ${evidenceData[name]?.note || "현장에서 발견된 단서"}`;
        fieldList.appendChild(item);
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
      const list = document.querySelector("#bagPanelList");
      list.querySelector(".empty")?.remove();
      const exists = [...list.children].some((item) => item.dataset.evidence === name);
      if (exists) {
        addEvidenceCardToInterrogation(name);
        addEvidenceToToolPanel(name);
        return;
      }

      const item = document.createElement("button");
      item.className = "bag-item";
      item.type = "button";
      item.dataset.evidence = name;
      item.innerHTML = `<img src="${evidenceData[name]?.img || "/samunmong/assets/evidence-wooden-tag.png"}" alt=""><span><strong>${name}</strong><br>${evidenceData[name]?.note || "현장에서 발견된 단서"}</span>`;
      item.addEventListener("click", () => {
        setAnalysisTarget(name);
        showToast(`${name} 선택. 도구 탭에서 크게 확인할 수 있습니다.`);
      });
      list.appendChild(item);
      addEvidenceCardToInterrogation(name);
      addEvidenceToToolPanel(name);
      playSfx("bag", 0.7);
    }

    function setAnalysisTarget(name) {
      currentEvidenceForTool = name;
      document.querySelector("#analysisTarget").textContent = name;
      document.querySelectorAll("#bagPanelList .bag-item").forEach((item) => {
        item.classList.toggle("selected", item.dataset.evidence === name);
      });
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
      button.className = "tool-evidence-option";
      button.type = "button";
      button.dataset.evidence = name;
      button.innerHTML = `<img src="${data.img || "/samunmong/assets/evidence-wooden-tag.png"}" alt=""><span><strong>${name}</strong>${data.tool ? `${data.tool} 필요` : "추가 분석 없음"}</span>`;
      button.addEventListener("click", () => setAnalysisTarget(name));
      list.appendChild(button);
    }

    function updateToolPreview(name) {
      const data = evidenceData[name] || {};
      const image = document.querySelector("#toolPreviewImage");
      const title = document.querySelector("#toolPreviewTitle");
      const note = document.querySelector("#toolPreviewNote");
      if (!image || !title || !note) return;

      image.src = data.img || "/samunmong/assets/evidence-wooden-tag.png";
      image.alt = name ? `${name} 확대 이미지` : "";
      title.textContent = name || "증거를 선택하세요";
      note.textContent = name
        ? `${data.note || "현장에서 발견된 단서입니다."} ${data.tool ? `알맞은 도구: ${data.tool}` : "추가 도구 분석은 필요하지 않습니다."}`
        : "왼쪽 목록에서 분석할 증거를 고르면 이곳에 크게 표시됩니다.";
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
      button.innerHTML = `<img class="evidence-thumb" src="${evidenceData[name]?.img || "/samunmong/assets/evidence-wooden-tag.png"}" alt=""><span>${evidenceData[name]?.note || "현장에서 발견된 단서"}</span>`;
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
          document.querySelectorAll(".tool-card").forEach((item) => item.classList.toggle("active", item.dataset.tool === name));
          analyzeEvidenceWithTool(name);
        });
        grid.appendChild(button);
      });
    }

    function analyzeEvidenceWithTool(toolName) {
      if (!currentEvidenceForTool) {
        showToast("먼저 수사 가방에서 분석할 증거를 선택하세요.");
        return;
      }

      const data = evidenceData[currentEvidenceForTool] || {};
      if (!data.tool) {
        showToast(`${currentEvidenceForTool}은 추가 도구 분석이 필요하지 않습니다.`);
        return;
      }

      if (data.tool !== toolName) {
        showToast(`${currentEvidenceForTool}에는 ${data.tool}이 더 알맞아 보입니다.`);
        return;
      }

      addObservationToNote(`${currentEvidenceForTool} 추가 분석`, data.toolResult);
      document.querySelectorAll(`[data-evidence-name="${currentEvidenceForTool}"]`).forEach((item) => item.classList.add("analyzed"));
      document.querySelectorAll(`#toolEvidenceList [data-evidence="${currentEvidenceForTool}"]`).forEach((item) => item.classList.add("analyzed"));
      const previewNote = document.querySelector("#toolPreviewNote");
      if (previewNote) previewNote.textContent = data.toolResult;
      showToast(`${toolName}로 ${currentEvidenceForTool}을 분석했습니다.`);
    }

    function showInspect(id) {
      document.querySelectorAll(".inspect-pop").forEach((panel) => panel.classList.remove("show"));
      document.querySelector(id)?.classList.add("show");
      clearTimeout(showInspect.timer);
      showInspect.timer = setTimeout(hideInspectPanels, 1500);
    }

    function hideInspectPanels() {
      document.querySelectorAll(".inspect-pop").forEach((panel) => panel.classList.remove("show"));
    }

    function collectHopae() {
      if (hopaeCollected) {
        setAnalysisTarget("호패 조각");
        openGlobalPanel("toolPanel");
        return;
      }
      hopaeCollected = true;
      document.querySelector("#collectHopae").textContent = "수집 완료";
      document.querySelector("#hopaeHotspot")?.classList.add("collected");
      playSfx("evidence", 0.85);
      addEvidenceToBag("호패 조각");
      addEvidenceToNote("호패 조각");
      hideInspectPanels();
      showToast("호패 조각이 조용히 가방 속으로 들어갔다. 이 조각은 누군가 일부러 남긴 말처럼 보인다.");
    }
    document.querySelector("#collectHopae").addEventListener("click", collectHopae);
    document.querySelector("#hopaeHotspot").addEventListener("click", () => {
      collectHopae();
      document.querySelector("#collectHopae").textContent = "가방에서 분석하기";
      showInspect("#hopaeInspect");
    });

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
      document.querySelector("#collectPortrait").textContent = "가방에서 분석하기";
      showInspect("#portraitInspect");
    });
    function showGenericEvidence(name, hotspot) {
      const data = evidenceData[name] || {};
      pendingEvidenceName = name;
      pendingEvidenceHotspot = hotspot;
      const alreadyCollected = hotspot.classList.contains("collected");
      if (!alreadyCollected) {
        hotspot.classList.add("collected");
        playSfx("evidence", 0.85);
        addEvidenceToBag(name);
        addEvidenceToNote(name);
      }

      document.querySelector("#genericEvidenceImage").src = data.img || "/samunmong/assets/evidence-wooden-tag.png";
      document.querySelector("#genericEvidenceTitle").textContent = name;
      document.querySelector("#genericEvidenceText").textContent = `${data.note || "현장에서 발견한 단서입니다."} ${data.tool ? "수사 가방에서 이 증거를 선택하면 도구로 추가 분석할 수 있습니다." : "도구 없이 확인 가능한 단서입니다."}`;
      document.querySelector("#collectGenericEvidence").textContent = data.tool ? "가방에서 분석하기" : "확인";
      document.querySelector("#genericEvidenceInspect").classList.add("show");
      clearTimeout(showInspect.timer);
      showInspect.timer = setTimeout(hideInspectPanels, 1500);
      showToast(alreadyCollected ? `이미 수집한 증거: ${name}` : `${name} 확보. 이 단서는 누군가의 말끝을 다시 묻게 만든다.`);
    }

    function collectGenericEvidence() {
      if (!pendingEvidenceName) return;
      const data = evidenceData[pendingEvidenceName] || {};
      if (!data.tool) {
        hideInspectPanels();
        return;
      }
      hideInspectPanels();
      setAnalysisTarget(pendingEvidenceName);
      openGlobalPanel("toolPanel");
    }

    document.querySelector("#collectGenericEvidence").addEventListener("click", collectGenericEvidence);
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
      toggleEvidenceBag.setAttribute("aria-expanded", String(open));
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
      if (id === "bagPanel") playSfx("bag", 0.72);
      if (id === "toolPanel") playSfx("buttonAlt", 0.62);
    }

    function closeGlobalPanel() {
      globalPanels.forEach((panel) => {
        panel.classList.remove("show");
        panel.setAttribute("aria-hidden", "true");
      });
      setEvidenceBag(false);
      globalOverlay.classList.remove("show");
    }

    ["#openMapFromField", "#openMapFromRoom", "#openMapFromMudeokRoom", "#openMapFromInterrogation"].forEach((selector) => {
      document.querySelector(selector)?.addEventListener("click", () => openGlobalPanel("mapPanel"));
    });
    document.querySelectorAll(".open-map-panel").forEach((button) => {
      button.addEventListener("click", () => openGlobalPanel("mapPanel"));
    });
    ["#openBagFromField", "#openBagFromRoom", "#openBagFromMudeokRoom"].forEach((selector) => {
      document.querySelector(selector)?.addEventListener("click", () => openGlobalPanel("bagPanel"));
    });
    document.querySelectorAll(".open-bag-panel").forEach((button) => {
      button.addEventListener("click", () => openGlobalPanel("bagPanel"));
    });
    document.querySelectorAll(".open-tool-panel").forEach((button) => {
      button.addEventListener("click", () => openGlobalPanel("toolPanel"));
    });
    ["#openNoteFromField", "#openNoteFromRoom", "#openNoteFromMudeokRoom"].forEach((selector) => {
      document.querySelector(selector)?.addEventListener("click", () => openGlobalPanel("fieldNotePanel"));
    });
    document.querySelectorAll(".open-note-panel").forEach((button) => {
      button.addEventListener("click", () => openGlobalPanel("fieldNotePanel"));
    });
    document.querySelectorAll(".global-close").forEach((button) => button.addEventListener("click", closeGlobalPanel));
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
      document.querySelectorAll("#bagPanelList .bag-item[data-evidence], #evidenceList .evidence[data-evidence]").forEach((item) => {
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
      showSuspectReply(answer, source === "mistral" ? "Mistral" : "임시 답변");
      if (source === "fallback" && warning) {
        showToast(warning);
      }
    }

    async function requestAiAnswer(question) {
      if (isAskingAi) return;
      const askButton = document.querySelector("#askButton");
      const suspect = suspects[suspectIndex];
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
            conversationHistory: interrogationHistory.slice(-8)
          })
        });

        const data = await response.json();
        if (!response.ok || data.error) {
          throw new Error(data.error || "AI 답변을 받지 못했습니다.");
        }

        const answer = data.answer || "지금은 답하기 어렵습니다.";
        addInterrogationAnswer(answer, data.source, data.warning);
        interrogationHistory.push({ role: "user", content: question }, { role: "assistant", content: answer });
        while (interrogationHistory.length > 8) interrogationHistory.shift();
        setAiMode(data.source === "mistral" ? "Mistral" : "임시 답변");
        showToast(data.source === "mistral" ? "용의자가 답했습니다." : "임시 답변을 표시했습니다.");
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
    showInitialScreenFromSetup();
  

})();
