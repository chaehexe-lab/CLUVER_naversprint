"use client";

import Link from "next/link";
import { type MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { finalCulpritId } from "@/lib/persona";
import { joseonAjeonAssets, joseonSatoSkillAssets } from "@/lib/joseonSatoSkillAssets";

type ResultTheme = "joseon" | "magicSchool" | "spaceStation";

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

const spaceSuspects = [
  {
    id: "harry",
    name: "해리",
    image: "/assets/space-station/characters/harry-upper.webp",
    slot: { left: "13.22%", top: "38.5%", width: "13.5%", height: "30%" },
    nameLeft: "19.9%",
    stampLeft: "23.8%",
    offsetX: "0%"
  },
  {
    id: "mers",
    name: "메르스",
    image: "/assets/space-station/characters/mers-upper.webp",
    slot: { left: "32.78%", top: "37%", width: "13.5%", height: "31%" },
    nameLeft: "39.5%",
    stampLeft: "43.4%",
    offsetX: "0%"
  },
  {
    id: "aladdindin",
    name: "알라딘딘",
    image: "/assets/space-station/characters/aladdindin-upper.webp",
    slot: { left: "52.57%", top: "37.8%", width: "13.5%", height: "30.4%" },
    nameLeft: "59.3%",
    stampLeft: "63.2%",
    offsetX: "0%"
  },
  {
    id: "einspanner",
    name: "아인슈페너",
    image: "/assets/space-station/characters/einspanner-upper.webp",
    slot: { left: "72.01%", top: "38.2%", width: "13.5%", height: "30%" },
    nameLeft: "78.7%",
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

const spaceRequiredEvidence = [
  "얼어붙은 추진 레버 젤",
  "손상된 압력 센서",
  "조작된 지연 타이머",
  "삭제된 의료 기록",
  "접속 키카드 칩",
  "암호화된 연구 보상 계약",
  "마지막 무전 로그"
] as const;

const correctSuspectByTheme = {
  joseon: process.env.NEXT_PUBLIC_SAMUNMONG_CULPRIT_ID || finalCulpritId,
  magicSchool: "malpoil",
  spaceStation: "mers"
} as const;
const soundBase = "/samunmong/sound";
const resultBgmPath = `${soundBase}/bgm/joseon.mp3`;
const buttonSfxPath = `${soundBase}/sfx/button.mp3`;
const bgmStateKey = "samunmong-bgm-state";
const joseonBgmKey = "joseon";
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

function getEvidenceStorageKey(theme: ResultTheme) {
  if (theme === "spaceStation") return "samunmong-collected-evidence-space-station";
  if (theme === "magicSchool") return "samunmong-collected-evidence-magic-school";
  return "samunmong-collected-evidence-joseon";
}

function readCollectedEvidence(theme: ResultTheme) {
  if (typeof window === "undefined") return [] as string[];

  try {
    const parsed = JSON.parse(window.localStorage.getItem(getEvidenceStorageKey(theme)) || "[]");
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function readAnalyzedEvidence() {
  if (typeof window === "undefined") return [] as string[];

  try {
    const parsed = JSON.parse(window.localStorage.getItem("samunmong-analyzed-evidence-joseon") || "[]");
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

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

function writeBgmState(track: HTMLAudioElement) {
  if (typeof window === "undefined" || !Number.isFinite(track.currentTime)) return;
  const previous = readBgmState();
  window.localStorage.setItem(
    bgmStateKey,
    JSON.stringify({
      ...previous,
      [joseonBgmKey]: {
        time: track.currentTime,
        savedAt: Date.now()
      }
    })
  );
}

function restoreBgmState(track: HTMLAudioElement) {
  const state = readBgmState()[joseonBgmKey];
  if (!state || !Number.isFinite(state.time) || !track.duration) return;
  const age = Date.now() - Number(state.savedAt || 0);
  if (age > 1000 * 60 * 30) return;
  track.currentTime = Math.min(Number(state.time), Math.max(0, track.duration - 0.2));
}

function useResultAudio() {
  const typeIndexRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const audio = new Audio(resultBgmPath);
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = readAudioVolume() * 0.7;

    let disposed = false;
    const restore = () => restoreBgmState(audio);
    const playBgm = () => {
      if (disposed) return;
      audio.volume = readAudioVolume() * 0.7;
      audio.play().catch(() => {});
    };

    audio.addEventListener("loadedmetadata", restore, { once: true });
    if (audio.readyState) restore();
    playBgm();
    const handlePageHide = () => writeBgmState(audio);
    window.addEventListener("pointerdown", playBgm, { once: true });
    window.addEventListener("keydown", playBgm, { once: true });
    window.addEventListener("pagehide", handlePageHide);
    const saveTimer = window.setInterval(() => writeBgmState(audio), 1200);

    return () => {
      disposed = true;
      writeBgmState(audio);
      window.clearInterval(saveTimer);
      window.removeEventListener("pointerdown", playBgm);
      window.removeEventListener("keydown", playBgm);
      window.removeEventListener("pagehide", handlePageHide);
      audio.pause();
    };
  }, []);

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

export default function ResultScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resultRouteState = searchParams.toString();
  const { playButtonSfx, playTypingSfx } = useResultAudio();
  const theme = (searchParams.get("theme") === "spaceStation" ? "spaceStation" : searchParams.get("theme") === "magicSchool" ? "magicSchool" : "joseon") satisfies ResultTheme;
  const activeSuspects = theme === "spaceStation" ? spaceSuspects : suspects;
  const requiredEvidence = theme === "spaceStation" ? spaceRequiredEvidence : joseonRequiredEvidence;
  const correctSuspectId = correctSuspectByTheme[theme];
  const resultBg = theme === "spaceStation" ? "/assets/space-station/backgrounds/emergency-investigation-room-v2.webp" : "/samunmong/assets/final-accusation-bg.webp";
  const accusationTitle = theme === "spaceStation" ? "최종 보고 대상 지목" : "최종 범인 지목";
  const backToInterrogationHref = theme === "spaceStation" ? "/?start=interrogationScreen&theme=spaceStation" : "/interrogation";
  const initialSuspectId = searchParams.get("suspectId");
  const [selectedSuspectId, setSelectedSuspectId] = useState(
    activeSuspects.some((suspect) => suspect.id === initialSuspectId) ? initialSuspectId : activeSuspects[0].id
  );
  const [showWarning, setShowWarning] = useState(false);
  const [showExitPrompt, setShowExitPrompt] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [showSealRitual, setShowSealRitual] = useState(false);
  const [sealStep, setSealStep] = useState<"ready" | "inked" | "pressed">("ready");
  const loadingTimerRef = useRef<number | null>(null);

  const selectedSuspect = activeSuspects.find((suspect) => suspect.id === selectedSuspectId) ?? activeSuspects[0];
  const missingEvidence = useMemo(() => {
    const collected = new Set(readCollectedEvidence(theme));
    const missingCollected = requiredEvidence.filter((name) => !collected.has(name));
    if (theme !== "joseon") return missingCollected;

    const analyzed = new Set(readAnalyzedEvidence());
    const missingAnalyzed = joseonRequiredAnalysisSteps
      .filter(([storageName]) => !analyzed.has(storageName))
      .map(([, label]) => label);
    return [...missingCollected, ...missingAnalyzed];
  }, [requiredEvidence, showWarning, theme]);

  useEffect(() => {
    if (searchParams.get("previewWarning") === "1" && missingEvidence.length > 0) {
      setShowWarning(true);
    }
  }, [missingEvidence.length, searchParams]);

  useEffect(() => {
    if (loadingTimerRef.current !== null) {
      window.clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }
    setShowLoading(false);
  }, [resultRouteState]);

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

  function finalizeAccusation() {
    const outcome = correctSuspectId && selectedSuspect.id === correctSuspectId ? "success" : "failure";
    const params = new URLSearchParams({
      suspect: selectedSuspect.name,
      suspectId: selectedSuspect.id,
      outcome,
      theme
    });
    navigateWithLoading(`/result?${params.toString()}&accused=1`);
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

  if (searchParams.get("accused") === "1") {
    const outcome = searchParams.get("outcome") === "success" ? "success" : "failure";
    const copy = outcomeCopy[outcome];
    const accusedSuspect =
      activeSuspects.find((suspect) => suspect.id === searchParams.get("suspectId")) ??
      activeSuspects.find((suspect) => suspect.name === searchParams.get("suspect")) ??
      selectedSuspect;

    return (
      <main className={`result-screen result-verdict result-${outcome}`} onClickCapture={handleResultClick}>
        <img className="result-full-bg" src={resultBg} alt="" />
        <section className="verdict-stage" aria-labelledby="resultTitle">
          <article
            className="verdict-tag"
            aria-label={`${accusedSuspect.name} 지목 결과`}
            style={{ ["--portrait-x" as string]: accusedSuspect.offsetX }}
          >
            <span className="verdict-seal" aria-hidden="true" />
            <span className="verdict-corner-stamp" aria-hidden="true">失證</span>
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
              {outcome === "success" && accusedSuspect.id === correctSuspectId ? (
                <button
                  className="wood-result-button"
                  type="button"
                  onClick={() => navigateWithLoading("/interpretation", unlockTruthPage)}
                >
                  해몽하기
                </button>
              ) : (
                <button
                  className="wood-result-button"
                  type="button"
                  onClick={() => navigateWithLoading("/?start=briefingScreen", returnToBriefingWithProgress)}
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
    <main className="result-screen accusation-screen" onClickCapture={handleResultClick}>
      <section className="accusation-stage" aria-labelledby="resultTitle">
        <img className="accusation-bg" src={resultBg} alt="" />
        <h1 id="resultTitle" className="accusation-title">
          {accusationTitle}
        </h1>

        {activeSuspects.map((suspect) => (
          <button
            className={`accusation-suspect ${selectedSuspectId === suspect.id ? "selected" : ""}`}
            type="button"
            key={suspect.id}
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
          </button>
        ))}

        {activeSuspects.map((suspect) => (
          <span className="accusation-name" key={`${suspect.id}-name`} style={{ left: suspect.nameLeft }}>
            {suspect.name}
          </span>
        ))}

        <div
          className="accusation-stamp"
          aria-hidden="true"
          style={{ left: selectedSuspect.stampLeft }}
        >
          지목
        </div>

        <div className="accusation-actions">
          <button className="wood-result-button primary" type="button" onClick={() => confirmAccusation()}>
            이 자를 지목한다
          </button>
          <Link className="wood-result-button" href={backToInterrogationHref}>
            {theme === "spaceStation" ? "보안 조사실로 돌아간다" : "취조실로 돌아간다"}
          </Link>
        </div>
      </section>

      {showWarning ? (
        <div className="accusation-dialog-backdrop" role="presentation">
          <section className="accusation-dialog" role="alertdialog" aria-modal="true" aria-labelledby="warningTitle">
            <h2 id="warningTitle">사또님...</h2>
            <p>아직 맞춰 보지 못한 흔적이 있습니다. 그래도 이 자를 지목하시겠습니까?</p>
            <div className="accusation-dialog-actions">
              <button className="wood-result-button primary" type="button" onClick={() => confirmAccusation(true)}>
                그래도 지목한다
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
