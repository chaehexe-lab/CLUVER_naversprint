"use client";

import Link from "next/link";
import { type MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { finalCulpritId } from "@/lib/persona";
import { joseonAjeonAssets, joseonSatoSkillAssets } from "@/lib/joseonSatoSkillAssets";
import { spaceStationResultSuspects, spaceStationTheme } from "@/lib/spaceStationTheme";
import type { VerifiedAccusation } from "@/lib/gameProgressTypes";

type ResultTheme = "joseon" | "magicSchool" | "spaceStation";

type ResultScreenProps = {
  initialTheme: ResultTheme;
  collectedEvidenceNames: string[];
  analyzedEvidenceNames: string[];
  verifiedVerdict?: VerifiedAccusation;
};

const suspects = [
  {
    id: "dolsoe",
    name: "돌쇠",
    image: "/samunmong/assets/suspects/dolsoe-seated.webp",
    slot: { left: "13.22%", top: "36.56%", width: "13.94%", height: "31.24%" },
    nameLeft: "20.16%",
    stampLeft: "24.25%",
    offsetX: "0%"
  },
  {
    id: "chunwol",
    name: "최춘월",
    image: "/samunmong/assets/suspects/chunwol-seated.webp",
    slot: { left: "32.78%", top: "36.56%", width: "13.82%", height: "31.24%" },
    nameLeft: "39.65%",
    stampLeft: "43.7%",
    offsetX: "12%"
  },
  {
    id: "yoomunseok",
    name: "유문석",
    image: "/samunmong/assets/suspects/yoomunseok-seated.webp",
    slot: { left: "52.57%", top: "36.56%", width: "13.88%", height: "31.24%" },
    nameLeft: "59.51%",
    stampLeft: "63.15%",
    offsetX: "0%"
  },
  {
    id: "mudeok",
    name: "무덕",
    image: "/samunmong/assets/suspects/mudeok-seated.webp",
    slot: { left: "72.01%", top: "36.56%", width: "13.64%", height: "31.24%" },
    nameLeft: "78.83%",
    stampLeft: "82.6%",
    offsetX: "6.5%"
  }
] as const;

const magicSchoolSuspects = [
  {
    id: "malpoi",
    name: "말포이",
    image: "/samunmong/assets/magic-school/interrogation/malpoi-sprite.webp",
    slot: { left: "13.22%", top: "36.56%", width: "13.94%", height: "31.24%" },
    nameLeft: "20.16%",
    stampLeft: "24.25%",
    offsetX: "0%"
  },
  {
    id: "malposam",
    name: "말포삼",
    image: "/samunmong/assets/magic-school/interrogation/malposam-sprite.webp",
    slot: { left: "32.78%", top: "36.56%", width: "13.82%", height: "31.24%" },
    nameLeft: "39.65%",
    stampLeft: "43.7%",
    offsetX: "0%"
  },
  {
    id: "malpoil",
    name: "말포일",
    image: "/samunmong/assets/magic-school/interrogation/malpoil-sprite.webp",
    slot: { left: "52.57%", top: "36.56%", width: "13.88%", height: "31.24%" },
    nameLeft: "59.51%",
    stampLeft: "63.15%",
    offsetX: "0%"
  },
  {
    id: "dunguldoor",
    name: "덩쿨도어",
    image: "/samunmong/assets/magic-school/interrogation/dunguldoor-sprite.webp",
    slot: { left: "72.01%", top: "36.56%", width: "13.64%", height: "31.24%" },
    nameLeft: "78.83%",
    stampLeft: "82.6%",
    offsetX: "0%"
  }
] as const;
const joseonRequiredEvidence = [
  "호패 조각",
  "점순의 목 압박 흔적",
  "찢어진 옷고름",
  "긁힌 팔 흔적",
  "찢어진 약속 편지"
] as const;

const joseonRequiredAnalysisSteps = [
  ["호패 조각", "호패 조각 감식"],
  ["찢어진 옷고름", "찢어진 옷고름 감식"],
  ["찢어진 약속 편지::먹빛 시험석", "찢어진 약속 편지 먹빛 대조"]
] as const;

const spaceRequiredEvidence = spaceStationTheme.requiredEvidence;

const magicSchoolRequiredEvidence = [
  "부러진 지팡이",
  "화염 감지 룬스톤",
  "도서관 대출 기록부",
  "조작된 기록 수정구",
  "말포삼의 자백"
] as const;

const soundBase = "/samunmong/sound";
const buttonSfxPath = `${soundBase}/sfx/button.mp3`;
const bgmStateKey = "samunmong-bgm-state";
const accusationBgmByTheme = {
  joseon: { key: "joseon", path: `${soundBase}/bgm/joseon.mp3` },
  magicSchool: { key: "magicSchoolAccusation", path: `${soundBase}/bgm/magic-accusation.mp3` },
  spaceStation: { key: "spaceStationAccusation", path: `${soundBase}/bgm/space-accusation.mp3` }
} as const;
const truthUnlockKey = "samunmong-truth-unlocked";
const typeSfxPaths = [
  `${soundBase}/sfx/type-1.mp3`,
  `${soundBase}/sfx/type-2.mp3`,
  `${soundBase}/sfx/type-3.mp3`
] as const;
const loadingDuration = 2600;

const outcomeCopy = {
  success: {
    kicker: "판결",
    title: "꿈의 매듭이 풀렸다",
    stamp: "범인",
    lines: [
      "붉은 인장 아래, 마지막 진술이 무너졌다.",
      "사또님의 지목은 사건의 끝에 닿았다.",
      "첫 번째 꿈이 서서히 갈라지기 시작한다."
    ]
  },
  failure: {
    kicker: "오판",
    title: "이 자가 범인이 아니다",
    stamp: "무죄",
    lines: [
      "이 자의 죄로는 꿈이 풀리지 않는다.",
      "사라진 말과 남은 흔적이 아직 맞물리지 않았다.",
      "진술의 틈으로 다시 돌아가라."
    ]
  }
} as const;

const magicSchoolOutcomeCopy = {
  success: {
    kicker: "마법 판결",
    stamp: "진범",
    lines: [
      "얼어붙은 룬스톤과 금서의 기록이 하나의 주문으로 이어졌다.",
      "조작된 수정구와 말포삼의 자백이 거짓 알리바이를 깨뜨렸다.",
      "마법학교 방화사건의 진실이 마침내 모습을 드러낸다."
    ]
  },
  failure: {
    kicker: "판정 불일치",
    stamp: "무고",
    lines: [
      "이 학생을 향한 의심만으로는 방화 주문이 완성되지 않는다.",
      "얼어붙은 경보와 지워진 출입 기록을 다시 연결해야 한다.",
      "교무 조사실로 돌아가 남은 진술을 확인하라."
    ]
  }
} as const;

const spaceStationOutcomeCopy = {
  success: {
    kicker: "보안 판정",
    title: "오르빗-13의 진범이 확인됐다",
    stamp: "확정",
    lines: [
      "정거장 기록과 생체 분석 결과가 하나의 범행 경로로 이어졌다.",
      "조작된 전력 계통과 삭제된 의료 기록이 마지막 진술을 무너뜨렸다.",
      "오르빗-13 의문사 사건의 최종 보고가 승인된다."
    ]
  },
  failure: {
    kicker: "판정 불일치",
    title: "지목과 수사 기록이 일치하지 않는다",
    stamp: "보류",
    lines: [
      "현재 기록만으로는 이 대원을 범인으로 확정할 수 없다.",
      "접속 기록과 의료 자료, 전력 계통의 연결을 다시 확인해야 한다.",
      "보안 조사실로 돌아가 남은 모순을 추적하라."
    ]
  }
} as const;

const insufficientEvidenceCopy = {
  joseon: {
    kicker: "증거 불충분",
    title: "판결을 뒷받침할 흔적이 모자라다",
    stamp: "보류",
    lines: ["지목은 남았으나, 판결을 확정할 증거가 아직 이어지지 않았다.", "현장과 취조실로 돌아가 빠진 흔적을 맞춰야 한다."]
  },
  magicSchool: {
    kicker: "마력 증거 불충분",
    title: "지목을 확정할 마력 흔적이 모자라다",
    stamp: "보류",
    lines: ["학생을 향한 의심만으로는 방화 주문의 경로를 증명할 수 없다.", "남은 장소의 마력 잔류와 진술을 다시 연결해야 한다."]
  },
  spaceStation: {
    kicker: "보고 보류",
    title: "최종 판정을 위한 기록이 부족하다",
    stamp: "보류",
    lines: ["지목 대상은 기록됐지만 사건 경로를 확정할 자료가 부족하다.", "누락된 장치 기록과 분석 자료를 확보한 뒤 다시 보고해야 한다."]
  }
} as const;

function objectParticle(name: string) {
  const last = name.charCodeAt(name.length - 1) - 0xac00;
  return last >= 0 && last <= 11171 && last % 28 !== 0 ? "을" : "를";
}

function returnToBriefingWithProgress() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    "samunmong-demo-state",
    JSON.stringify({ screenId: "briefingScreen", savedAt: Date.now() })
  );
  window.localStorage.setItem("samunmong-field-guide-seen", "1");
  window.sessionStorage.removeItem("samunmong-field-guide-pending");
}

function unlockTruthPage() {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(truthUnlockKey, finalCulpritId);
}

function readAudioVolume() {
  if (typeof window === "undefined") return 0.7;

  try {
    const raw = window.localStorage.getItem("samunmong-demo-settings");
    const parsed = raw ? JSON.parse(raw) : null;
    const volume = Number(parsed?.volume ?? 70);
    return Math.max(0, Math.min(1, volume / 100));
  } catch {
    return 0.7;
  }
}

function readBgmState() {
  if (typeof window === "undefined") return {} as Record<string, { time?: number; savedAt?: number }>;

  try {
    const parsed = JSON.parse(window.localStorage.getItem(bgmStateKey) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeBgmState(trackKey: string, track: HTMLAudioElement) {
  if (typeof window === "undefined" || !Number.isFinite(track.currentTime)) return;
  const previous = readBgmState();
  window.localStorage.setItem(
    bgmStateKey,
    JSON.stringify({
      ...previous,
      [trackKey]: {
        time: track.currentTime,
        savedAt: Date.now()
      }
    })
  );
}

function restoreBgmState(trackKey: string, track: HTMLAudioElement) {
  const state = readBgmState()[trackKey];
  if (!state || !Number.isFinite(state.time) || !track.duration) return;
  const age = Date.now() - Number(state.savedAt || 0);
  if (age > 1000 * 60 * 30) return;
  track.currentTime = Math.min(Number(state.time), Math.max(0, track.duration - 0.2));
}

function useResultAudio(theme: ResultTheme) {
  const typeIndexRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const bgm = accusationBgmByTheme[theme];
    const audio = new Audio(bgm.path);
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = readAudioVolume() * 0.7;

    let disposed = false;
    const restore = () => restoreBgmState(bgm.key, audio);
    const playBgm = () => {
      if (disposed) return;
      audio.volume = readAudioVolume() * 0.7;
      audio.play().catch(() => {});
    };

    audio.addEventListener("loadedmetadata", restore, { once: true });
    if (audio.readyState) restore();
    playBgm();
    const handlePageHide = () => writeBgmState(bgm.key, audio);
    window.addEventListener("pointerdown", playBgm, { once: true });
    window.addEventListener("keydown", playBgm, { once: true });
    window.addEventListener("pagehide", handlePageHide);
    const saveTimer = window.setInterval(() => writeBgmState(bgm.key, audio), 1200);

    return () => {
      disposed = true;
      writeBgmState(bgm.key, audio);
      window.clearInterval(saveTimer);
      window.removeEventListener("pointerdown", playBgm);
      window.removeEventListener("keydown", playBgm);
      window.removeEventListener("pagehide", handlePageHide);
      audio.pause();
    };
  }, [theme]);

  const playButtonSfx = useCallback(() => {
    if (typeof window === "undefined") return;
    const audio = new Audio(buttonSfxPath);
    audio.volume = readAudioVolume() * 0.6;
    audio.play().catch(() => {});
  }, []);

  const playTypingSfx = useCallback(() => {
    if (typeof window === "undefined") return;
    const source = typeSfxPaths[typeIndexRef.current % typeSfxPaths.length];
    typeIndexRef.current += 1;
    const audio = new Audio(source);
    audio.volume = readAudioVolume() * 0.48;
    audio.play().catch(() => {});
  }, []);

  return { playButtonSfx, playTypingSfx };
}

function TypewriterLines({ lines, onType }: { lines: readonly string[]; onType?: () => void }) {
  const [visibleLines, setVisibleLines] = useState(() => lines.map(() => ""));
  const [activeLine, setActiveLine] = useState(0);

  useEffect(() => {
    let lineIndex = 0;
    let charIndex = 0;
    let timer: number;
    let cancelled = false;

    setVisibleLines(lines.map(() => ""));
    setActiveLine(0);

    const tick = () => {
      if (cancelled || lineIndex >= lines.length) return;

      const currentLineIndex = lineIndex;
      const currentCharIndex = charIndex;
      const currentLine = lines[currentLineIndex];
      const currentChar = currentLine[currentCharIndex] ?? "";

      setVisibleLines((current) => {
        const next = [...current];
        next[currentLineIndex] = currentLine.slice(0, currentCharIndex + 1);
        return next;
      });

      if (currentChar.trim() && currentCharIndex % 3 === 0) {
        onType?.();
      }

      charIndex += 1;

      if (charIndex < currentLine.length) {
        timer = window.setTimeout(tick, 38);
        return;
      }

      lineIndex += 1;
      charIndex = 0;
      setActiveLine(lineIndex);

      if (lineIndex < lines.length) {
        timer = window.setTimeout(tick, 320);
      }
    };

    timer = window.setTimeout(tick, 220);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [lines, onType]);

  return (
    <div className="typewriter-lines" aria-label={lines.join(" ")}>
      {lines.map((line, index) => (
        <p className={index === activeLine ? "typing" : ""} key={line}>
          {visibleLines[index]}
        </p>
      ))}
    </div>
  );
}

export default function ResultScreen({
  initialTheme,
  collectedEvidenceNames,
  analyzedEvidenceNames,
  verifiedVerdict
}: ResultScreenProps) {
  const router = useRouter();
  const theme = initialTheme;
  const { playButtonSfx, playTypingSfx } = useResultAudio(theme);
  const activeSuspects = theme === "spaceStation" ? spaceStationResultSuspects : theme === "magicSchool" ? magicSchoolSuspects : suspects;
  const requiredEvidence = theme === "spaceStation" ? spaceRequiredEvidence : theme === "magicSchool" ? magicSchoolRequiredEvidence : joseonRequiredEvidence;
  const resultBg = theme === "spaceStation"
    ? "/assets/space-station/backgrounds/emergency-investigation-room-v2.webp"
    : theme === "magicSchool"
      ? "/samunmong/assets/magic-school/interrogation/office-empty.webp"
      : "/samunmong/assets/final-accusation-bg.webp";
  const accusationTitle = theme === "spaceStation" ? "최종 보고 대상 지목" : theme === "magicSchool" ? "최종 방화범 지목" : "최종 범인 지목";
  const backToInterrogationHref = theme === "spaceStation"
    ? "/?start=interrogationScreen&theme=spaceStation"
    : theme === "magicSchool"
      ? "/?start=interrogationScreen&theme=magicSchool"
      : "/interrogation";
  const [selectedSuspectId, setSelectedSuspectId] = useState<string>(activeSuspects[0].id);
  const [showWarning, setShowWarning] = useState(false);
  const [showExitPrompt, setShowExitPrompt] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [showSealRitual, setShowSealRitual] = useState(false);
  const [sealStep, setSealStep] = useState<"ready" | "inked" | "pressed">("ready");
  const [submissionError, setSubmissionError] = useState("");
  const loadingTimerRef = useRef<number | null>(null);

  const selectedSuspect = activeSuspects.find((suspect) => suspect.id === selectedSuspectId) ?? activeSuspects[0];
  const missingEvidence = useMemo(() => {
    const collected = new Set(collectedEvidenceNames);
    const missingCollected = requiredEvidence.filter((name) => !collected.has(name));
    if (theme !== "joseon") return missingCollected;

    const analyzed = new Set(analyzedEvidenceNames);
    const missingAnalyzed = joseonRequiredAnalysisSteps
      .filter(([storageName]) => !analyzed.has(storageName))
      .map(([, label]) => label);
    return [...missingCollected, ...missingAnalyzed];
  }, [analyzedEvidenceNames, collectedEvidenceNames, requiredEvidence, theme]);

  useEffect(() => {
    return () => {
      if (loadingTimerRef.current !== null) {
        window.clearTimeout(loadingTimerRef.current);
      }
    };
  }, []);

  function handleResultClick(event: MouseEvent<HTMLElement>) {
    const target = event.target;
    if (target instanceof Element && target.closest("button, a")) {
      playButtonSfx();
    }
  }

  function withLoading(action: () => void, delay = loadingDuration) {
    if (loadingTimerRef.current !== null) {
      window.clearTimeout(loadingTimerRef.current);
    }
    setShowLoading(true);
    loadingTimerRef.current = window.setTimeout(() => {
      loadingTimerRef.current = null;
      action();
    }, delay);
  }

  function navigateWithLoading(path: string, beforeNavigate?: () => void) {
    beforeNavigate?.();
    withLoading(() => {
      router.push(path);
    });
  }

  async function finalizeAccusation() {
    setSubmissionError("");
    setShowLoading(true);
    try {
      const flushProgress = (window as Window & { samunmongFlushProgress?: () => Promise<unknown> }).samunmongFlushProgress;
      await flushProgress?.();
      const response = await fetch("/api/game/accuse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme, suspectId: selectedSuspect.id })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "최종 지목을 검증하지 못했습니다.");
      router.push(`/result?theme=${theme}&verdict=1`);
    } catch (error) {
      setShowLoading(false);
      setShowSealRitual(false);
      setSubmissionError(error instanceof Error ? error.message : "최종 지목을 검증하지 못했습니다.");
    }
  }

  function confirmAccusation(force = false) {
    if (!force && missingEvidence.length > 0) {
      withLoading(() => {
        setShowLoading(false);
        setShowWarning(true);
      });
      return;
    }
    setShowWarning(false);
    if (theme === "joseon") {
      setSealStep("ready");
      setShowSealRitual(true);
      return;
    }
    finalizeAccusation();
  }

  function openExitPrompt() {
    withLoading(() => {
      setShowLoading(false);
      setShowExitPrompt(true);
    });
  }

  if (verifiedVerdict) {
    const outcome = verifiedVerdict.outcome;
    const accusedSuspect = activeSuspects.find((suspect) => suspect.id === verifiedVerdict.suspectId) ?? selectedSuspect;
    const baseCopy = outcomeCopy[outcome];
    const magicCopy = magicSchoolOutcomeCopy[outcome];
    const spaceCopy = spaceStationOutcomeCopy[outcome];
    const copy = verifiedVerdict.reason === "insufficient-evidence"
      ? insufficientEvidenceCopy[theme]
      : theme === "magicSchool"
      ? {
          ...magicCopy,
          title: outcome === "success"
            ? `${accusedSuspect.name}이 진범이다`
            : `${accusedSuspect.name}${objectParticle(accusedSuspect.name)} 잘못 지목했다`
        }
      : theme === "spaceStation"
        ? spaceCopy
        : baseCopy;

    return (
      <main className={`result-screen result-verdict result-${outcome} theme-${theme}`} onClickCapture={handleResultClick}>
        <img className="result-full-bg" src={resultBg} alt="" />
        <section className="verdict-stage" aria-labelledby="resultTitle">
          <article
            className="verdict-tag"
            aria-label={`${accusedSuspect.name} 지목 결과`}
            style={{ ["--portrait-x" as string]: accusedSuspect.offsetX }}
          >
            <span className="verdict-seal" aria-hidden="true" />
            <span className="verdict-corner-stamp" aria-hidden="true">{theme === "spaceStation" ? "SEC" : "失證"}</span>
            <div className="verdict-portrait-frame">
              <img src={accusedSuspect.image} alt="" />
            </div>
            <div className={`verdict-stamp verdict-stamp-${outcome}`} aria-hidden="true">
              {copy.stamp}
            </div>
            <strong>{accusedSuspect.name}</strong>
          </article>

          <article className="verdict-message">
            <p className="verdict-kicker">{copy.kicker}</p>
            <h1 id="resultTitle">{copy.title}</h1>
            <TypewriterLines lines={copy.lines} onType={playTypingSfx} />
            <div className="verdict-actions">
              {theme === "joseon" && outcome === "success" ? (
                <button
                  className="wood-result-button"
                  type="button"
                  onClick={() => navigateWithLoading("/interpretation", unlockTruthPage)}
                >
                  해몽하기
                </button>
              ) : theme === "magicSchool" && outcome === "success" ? (
                <button
                  className="wood-result-button"
                  type="button"
                  onClick={() => navigateWithLoading("/?start=briefingScreen&theme=magicSchool")}
                >
                  사건 다시 보기
                </button>
              ) : theme === "spaceStation" && outcome === "success" ? (
                <button
                  className="wood-result-button"
                  type="button"
                  onClick={() => navigateWithLoading("/?start=briefingScreen&theme=spaceStation")}
                >
                  사건 기록 다시 보기
                </button>
              ) : (
                <button
                  className="wood-result-button"
                  type="button"
                  onClick={() => navigateWithLoading(backToInterrogationHref, theme === "joseon" ? returnToBriefingWithProgress : undefined)}
                >
                  다시 조사하기
                </button>
              )}
              <button className="wood-result-button primary" type="button" onClick={openExitPrompt}>
                꿈에서 나가기
              </button>
            </div>
          </article>
        </section>

        {showExitPrompt ? (
          <aside className="dream-notice-dialog result-exit-dialog open" role="dialog" aria-modal="true" aria-labelledby="resultExitTitle">
            <div className="dream-notice-panel">
              <div className="dream-notice-titlebar">
                <span>DREAM_ALERT</span>
                <button className="dream-notice-close" type="button" aria-label="안내 닫기" onClick={() => setShowExitPrompt(false)}>
                  ×
                </button>
              </div>
              <span className="dream-notice-seal" aria-hidden="true">!</span>
              <p className="dream-notice-kicker">SYSTEM MESSAGE</p>
              <h2 id="resultExitTitle">꿈은 아직 끝나지 않았습니다.</h2>
              <p>테마 선택으로 돌아가시겠습니까?</p>
              <div className="dream-notice-actions">
                <button
                  className="button primary"
                  type="button"
                  onClick={() => navigateWithLoading("/?start=dreamScreen&dreamExit=1")}
                >
                  돌아가기
                </button>
                <button className="button" type="button" onClick={() => setShowExitPrompt(false)}>
                  머무르기
                </button>
              </div>
            </div>
          </aside>
        ) : null}
        {showLoading ? <div className="dream-loading-overlay" role="status" aria-label="이동 중">이동 중...</div> : null}
      </main>
    );
  }

  return (
    <main className={`result-screen accusation-screen theme-${theme}`} onClickCapture={handleResultClick}>
      <section className="accusation-stage" aria-labelledby="resultTitle">
        <img className="accusation-bg" src={resultBg} alt="" />
        <h1 id="resultTitle" className="accusation-title">
          {accusationTitle}
        </h1>
        {theme === "spaceStation" ? (
          <p className="accusation-instruction">사건의 범인이라고 판단되는 인물을 선택하세요.</p>
        ) : null}

        {activeSuspects.map((suspect) => (
          <button
            className={`accusation-suspect ${selectedSuspectId === suspect.id ? "selected" : ""}`}
            type="button"
            key={suspect.id}
            data-suspect-id={suspect.id}
            onClick={() => setSelectedSuspectId(suspect.id)}
            aria-label={`${suspect.name} 지목`}
            aria-pressed={selectedSuspectId === suspect.id}
            style={{
              left: suspect.slot.left,
              top: suspect.slot.top,
              width: suspect.slot.width,
              height: suspect.slot.height,
              ["--portrait-x" as string]: suspect.offsetX
            }}
          >
            <img src={suspect.image} alt="" />
            {theme === "spaceStation" && "role" in suspect ? (
              <span className="space-accusation-card-copy">
                <strong>{suspect.name}</strong>
                <small>{suspect.role}</small>
              </span>
            ) : null}
          </button>
        ))}

        {theme !== "spaceStation" ? activeSuspects.map((suspect) => (
            <span className="accusation-name" key={`${suspect.id}-name`} style={{ left: suspect.nameLeft }}>
              {suspect.name}
            </span>
          )) : null}

        {theme !== "spaceStation" ? (
          <div
            className="accusation-stamp"
            aria-hidden="true"
            style={{ left: selectedSuspect.stampLeft }}
          >
            {theme === "magicSchool" ? "선택" : "지목"}
          </div>
        ) : null}

        <div className="accusation-actions">
          <button className="wood-result-button primary" type="button" onClick={() => confirmAccusation()}>
            {theme === "spaceStation" ? "이 대원을 지목한다" : theme === "magicSchool" ? "이 학생을 지목한다" : "이 자를 지목한다"}
          </button>
          {theme !== "spaceStation" ? (
            <Link className="wood-result-button" href={backToInterrogationHref}>
              {theme === "magicSchool" ? "교무 조사실로 돌아간다" : "취조실로 돌아간다"}
            </Link>
          ) : null}
        </div>
        {submissionError ? <p className="accusation-submit-error" role="alert">{submissionError}</p> : null}
      </section>

      {showWarning ? (
        <div className="accusation-dialog-backdrop" role="presentation">
          <section className="accusation-dialog" role="alertdialog" aria-modal="true" aria-labelledby="warningTitle">
            <h2 id="warningTitle">{theme === "spaceStation" ? "조사관님..." : theme === "magicSchool" ? "선생님..." : "사또님..."}</h2>
            <p>{theme === "spaceStation" ? "아직 연결하지 못한 장치 기록과 분석 자료가 있습니다. 그래도 이 대원을 최종 보고하시겠습니까?" : theme === "magicSchool" ? "아직 해석하지 못한 마력 흔적이 있습니다. 그래도 이 학생을 지목하시겠습니까?" : "아직 맞춰 보지 못한 흔적이 있습니다. 그래도 이 자를 지목하시겠습니까?"}</p>
            <div className="accusation-dialog-actions">
              <button className="wood-result-button primary" type="button" onClick={() => confirmAccusation(true)}>
                {theme === "spaceStation" ? "그래도 보고한다" : theme === "magicSchool" ? "판정을 내린다" : "그래도 지목한다"}
              </button>
              <button className="wood-result-button" type="button" onClick={() => setShowWarning(false)}>
                더 조사한다
              </button>
            </div>
          </section>
        </div>
      ) : null}
      {showSealRitual ? (
        <div className="official-seal-backdrop" role="presentation">
          <section className="official-seal-ritual" role="dialog" aria-modal="true" aria-labelledby="officialSealTitle">
            <img className="official-seal-workbench" src={joseonSatoSkillAssets.officialSeal.workbench} alt="" />
            <button className="official-seal-close" type="button" aria-label="관인 확정 닫기" onClick={() => setShowSealRitual(false)}>×</button>
            <header>
              <img src={sealStep === "pressed" ? joseonAjeonAssets.portraits.confirmed : joseonAjeonAssets.portraits.officialReport} alt="판결을 보좌하는 아전" />
              <div><small>사또의 권한 · 관인 확정</small><h2 id="officialSealTitle">{selectedSuspect.name}{objectParticle(selectedSuspect.name)} 공식 수사 가설로 확정</h2><p>{sealStep === "ready" ? "관인을 먼저 인주에 묻히십시오." : sealStep === "inked" ? "판결문의 빈 인영 위에 관인을 내리십시오." : "관인이 찍혔습니다. 이제 판결을 고할 수 있습니다."}</p></div>
            </header>
            <div className="official-seal-suspect">
              <img src={selectedSuspect.image} alt="" />
              <strong>{selectedSuspect.name}</strong>
            </div>
            <button
              className={`official-seal-object step-${sealStep}`}
              type="button"
              onClick={() => setSealStep((step) => step === "ready" ? "inked" : step === "inked" ? "pressed" : step)}
              aria-label={sealStep === "ready" ? "관인에 인주 묻히기" : sealStep === "inked" ? "판결문에 관인 찍기" : "관인 확정 완료"}
            >
              <img src={sealStep === "ready" ? joseonSatoSkillAssets.officialSeal.objects[0] : sealStep === "inked" ? joseonSatoSkillAssets.officialSeal.objects[1] : joseonSatoSkillAssets.officialSeal.objects[3]} alt="" />
            </button>
            {sealStep === "pressed" ? <img className="official-seal-imprint" src={joseonSatoSkillAssets.officialSeal.objects[7]} alt="찍힌 관인" /> : null}
            <button className="official-seal-confirm" type="button" disabled={sealStep !== "pressed"} onClick={finalizeAccusation}>판결을 확정한다</button>
          </section>
        </div>
      ) : null}
      {showLoading ? <div className="dream-loading-overlay" role="status" aria-label="이동 중">이동 중...</div> : null}
    </main>
  );
}
