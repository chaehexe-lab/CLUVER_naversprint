"use client";

import Link from "next/link";
import { type MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { finalCulpritId } from "@/lib/persona";

const suspects = [
  {
    id: "dolsoe",
    name: "돌쇠",
    image: "/samunmong/assets/suspects/dolsoe-seated.png",
    slot: { left: "13.22%", top: "36.56%", width: "13.94%", height: "31.24%" },
    nameLeft: "20.16%",
    offsetX: "0%"
  },
  {
    id: "chunwol",
    name: "최춘월",
    image: "/samunmong/assets/suspects/chunwol-seated.png",
    slot: { left: "32.78%", top: "36.56%", width: "13.82%", height: "31.24%" },
    nameLeft: "39.65%",
    offsetX: "12%"
  },
  {
    id: "yoomunseok",
    name: "유문석",
    image: "/samunmong/assets/suspects/yoomunseok-seated.png",
    slot: { left: "52.57%", top: "36.56%", width: "13.88%", height: "31.24%" },
    nameLeft: "59.51%",
    offsetX: "0%"
  },
  {
    id: "mudeok",
    name: "무덕",
    image: "/samunmong/assets/suspects/mudeok-seated.png",
    slot: { left: "72.01%", top: "36.56%", width: "13.64%", height: "31.24%" },
    nameLeft: "78.83%",
    offsetX: "6.5%"
  }
] as const;

const requiredEvidence = [
  "호패 조각",
  "돌쇠의 그림",
  "긁힌 팔 흔적",
  "작은 발자국",
  "찢어진 문서 조각"
] as const;

const correctSuspectId = process.env.NEXT_PUBLIC_SAMUNMONG_CULPRIT_ID || finalCulpritId;
const soundBase = "/samunmong/sound";
const resultBgmPath = `${soundBase}/bgm/joseon.mp3`;
const buttonSfxPath = `${soundBase}/sfx/button.mp3`;
const bgmStateKey = "samunmong-bgm-state";
const joseonBgmKey = "joseon";
const typeSfxPaths = [
  `${soundBase}/sfx/type-1.mp3`,
  `${soundBase}/sfx/type-2.mp3`,
  `${soundBase}/sfx/type-3.mp3`
] as const;

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

function readCollectedEvidence() {
  if (typeof window === "undefined") return [] as string[];

  try {
    const parsed = JSON.parse(window.localStorage.getItem("samunmong-collected-evidence") || "[]");
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function resetDreamProgress() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem("samunmong-demo-state");
  window.localStorage.removeItem("samunmong-collected-evidence");
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
  const searchParams = useSearchParams();
  const { playButtonSfx, playTypingSfx } = useResultAudio();
  const initialSuspectId = searchParams.get("suspectId");
  const [selectedSuspectId, setSelectedSuspectId] = useState(
    suspects.some((suspect) => suspect.id === initialSuspectId) ? initialSuspectId : suspects[0].id
  );
  const [showWarning, setShowWarning] = useState(false);
  const [showExitPrompt, setShowExitPrompt] = useState(false);

  const selectedSuspect = suspects.find((suspect) => suspect.id === selectedSuspectId) ?? suspects[0];
  const selectedIndex = suspects.findIndex((suspect) => suspect.id === selectedSuspect.id);
  const missingEvidence = useMemo(() => {
    const collected = new Set(readCollectedEvidence());
    return requiredEvidence.filter((name) => !collected.has(name));
  }, [showWarning]);

  useEffect(() => {
    if (searchParams.get("previewWarning") === "1" && missingEvidence.length > 0) {
      setShowWarning(true);
    }
  }, [missingEvidence.length, searchParams]);

  function handleResultClick(event: MouseEvent<HTMLElement>) {
    const target = event.target;
    if (target instanceof Element && target.closest("button, a")) {
      playButtonSfx();
    }
  }

  function confirmAccusation(force = false) {
    if (!force && missingEvidence.length > 0) {
      setShowWarning(true);
      return;
    }

    const outcome = correctSuspectId && selectedSuspect.id === correctSuspectId ? "success" : "failure";
    const params = new URLSearchParams({
      suspect: selectedSuspect.name,
      suspectId: selectedSuspect.id,
      outcome
    });
    window.location.href = `/result?${params.toString()}&accused=1`;
  }

  if (searchParams.get("accused") === "1") {
    const outcome = searchParams.get("outcome") === "success" ? "success" : "failure";
    const copy = outcomeCopy[outcome];
    const accusedSuspect =
      suspects.find((suspect) => suspect.id === searchParams.get("suspectId")) ??
      suspects.find((suspect) => suspect.name === searchParams.get("suspect")) ??
      selectedSuspect;

    return (
      <main className={`result-screen result-verdict result-${outcome}`} onClickCapture={handleResultClick}>
        <img className="result-full-bg" src="/samunmong/assets/final-accusation-bg.png" alt="" />
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
              <Link className="wood-result-button" href="/?start=briefingScreen" onClick={resetDreamProgress}>
                이번 꿈을 다시 꾸기
              </Link>
              <button className="wood-result-button primary" type="button" onClick={() => setShowExitPrompt(true)}>
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
                <Link className="button primary" href="/?start=dreamScreen">
                  돌아가기
                </Link>
                <button className="button" type="button" onClick={() => setShowExitPrompt(false)}>
                  머무르기
                </button>
              </div>
            </div>
          </aside>
        ) : null}
      </main>
    );
  }

  return (
    <main className="result-screen accusation-screen" onClickCapture={handleResultClick}>
      <section className="accusation-stage" aria-labelledby="resultTitle">
        <img className="accusation-bg" src="/samunmong/assets/final-accusation-bg.png" alt="" />
        <h1 id="resultTitle" className="accusation-title">
          최종 범인 지목
        </h1>

        {suspects.map((suspect) => (
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

        {suspects.map((suspect) => (
          <span className="accusation-name" key={`${suspect.id}-name`} style={{ left: suspect.nameLeft }}>
            {suspect.name}
          </span>
        ))}

        <div
          className="accusation-stamp"
          aria-hidden="true"
          style={{ left: `${24.25 + selectedIndex * 19.45}%` }}
        >
          지목
        </div>

        <div className="accusation-actions">
          <button className="wood-result-button primary" type="button" onClick={() => confirmAccusation()}>
            이 자를 지목한다
          </button>
          <Link className="wood-result-button" href="/interrogation">
            취조실로 돌아간다
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
    </main>
  );
}
