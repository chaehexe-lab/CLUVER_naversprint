"use client";

import { useEffect, useRef, useState } from "react";
import MagicSpellSystem, { type MagicSpellId, type MagicSpellResult } from "@/components/MagicSpellSystem";

type UnlockPhase = "locked" | "casting" | "unlocked";
const UNLOCK_STORAGE_KEY = "samunmong-magic-library-door-unlocked";

export default function MagicUnlockDoorScene() {
  const [phase, setPhase] = useState<UnlockPhase>("locked");
  const timer = useRef<number | null>(null);

  useEffect(() => {
    const previewMode = new URLSearchParams(window.location.search).get("preview");
    const isAlreadyUnlocked = window.localStorage.getItem(UNLOCK_STORAGE_KEY) === "1";

    if (previewMode === "unlocked" || (previewMode !== "locked" && isAlreadyUnlocked)) setPhase("unlocked");
    return () => { if (timer.current !== null) window.clearTimeout(timer.current); };
  }, []);

  function castSpell(spellId: MagicSpellId): MagicSpellResult {
    if (spellId !== "metal-break" || phase !== "locked") return "no-effect";
    setPhase("casting");
    timer.current = window.setTimeout(() => {
      window.localStorage.setItem(UNLOCK_STORAGE_KEY, "1");
      setPhase("unlocked");
    }, 1900);
    return "success";
  }

  function moveTo(screenId: string) {
    window.dispatchEvent(new CustomEvent("samunmong:screen-request", {
      cancelable: true,
      detail: { screenId }
    }));
  }

  return (
    <section className={`screen active magic-unlock-screen phase-${phase}`} id="magicUnlockDoor">
      <div className="magic-unlock-backdrop">
        <img
          className="magic-door-scene-image door-scene-locked"
          src="/samunmong/assets/magic-school/scenes/locked-cleaning-closet-door-v1.png"
          alt="보라색 번개가 치는 마법학교 복도에서 황동 자물쇠와 쇠사슬로 굳게 잠긴 고딕 목재 문"
          draggable="false"
        />
        <img
          className="magic-door-scene-image door-scene-unlocked"
          src="/samunmong/assets/magic-school/scenes/unlocked-cleaning-closet-door-v1.png"
          alt="자물쇠 고리가 열리고 쇠사슬이 바닥으로 늘어진 채 살짝 열린 도서관 문"
          draggable="false"
        />
        <span className="magic-door-vignette" aria-hidden="true" />
      </div>
      <header className="magic-unlock-copy">
        <p>현재 위치 · 도서관 앞</p>
        <h1>{phase === "unlocked" ? "금속 봉인이 파괴되었습니다" : phase === "casting" ? "금속 붕괴 중" : "문이 잠겨 있습니다"}</h1>
        <span aria-live="polite">
          {phase === "locked" && "금속 파괴 마법으로 문을 묶은 자물쇠와 쇠사슬을 부수세요."}
          {phase === "casting" && "파괴 주문이 금속의 결합을 무너뜨리고 있습니다…"}
          {phase === "unlocked" && "문 너머의 도서관을 조사할 수 있습니다."}
        </span>
      </header>

      <div className="magic-door-stage" aria-label={phase === "unlocked" ? "자물쇠가 풀려 열린 문" : "마법 자물쇠로 잠긴 문"}>
        <div className="unlock-spell-rings" aria-hidden="true">
          <i /><i /><i />
          <svg viewBox="0 0 200 200" focusable="false">
            <path d="M55 30 H145 L175 60 V140 L145 170 H55 L25 140 V60 Z" />
            <path d="M118 31 88 88 118 104 80 169 M88 88 53 71 M118 104 153 129" />
          </svg>
        </div>
        <span className="lock-spark spark-one" aria-hidden="true" />
        <span className="lock-spark spark-two" aria-hidden="true" />
        <span className="lock-spark spark-three" aria-hidden="true" />
      </div>

      <div className="magic-unlock-actions">
        {phase === "unlocked" && <button className="unlock-enter-button" type="button" onClick={() => moveTo("magicLibrary")}>문을 열고 들어가기</button>}
      </div>
      {phase !== "unlocked" ? (
        <MagicSpellSystem
          sceneId="magicUnlockDoor"
          showLockedSpell={false}
          onSpellCast={castSpell}
        />
      ) : null}
      <button className="magic-unlock-return" type="button" onClick={() => moveTo("magicCleaningCloset")}>이전 장소로 돌아가기</button>
    </section>
  );
}
