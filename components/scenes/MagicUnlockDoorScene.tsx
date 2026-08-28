"use client";

import { useEffect, useRef, useState } from "react";
import MagicSpellSystem, { type MagicSpellId, type MagicSpellResult } from "@/components/MagicSpellSystem";

type UnlockPhase = "locked" | "casting" | "unlocked";
const UNLOCK_STORAGE_KEY = "samunmong-magic-cleaning-closet-unlocked";

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
    if (spellId !== "unlock" || phase !== "locked") return "no-effect";
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
          alt="자물쇠 고리가 열리고 쇠사슬이 바닥으로 늘어진 채 살짝 열린 청소도구함 문"
          draggable="false"
        />
        <span className="magic-door-vignette" aria-hidden="true" />
      </div>
      <header className="magic-unlock-copy">
        <p>현재 위치 · 청소도구함 앞</p>
        <h1>{phase === "unlocked" ? "봉인이 풀렸습니다" : phase === "casting" ? "봉인 해제 중" : "문이 잠겨 있습니다"}</h1>
        <span aria-live="polite">
          {phase === "locked" && "자물쇠 해제 마법으로 문에 걸린 봉인을 푸세요."}
          {phase === "casting" && "해제 주문이 자물쇠의 룬을 분해하고 있습니다…"}
          {phase === "unlocked" && "문 너머의 청소도구함을 조사할 수 있습니다."}
        </span>
      </header>

      <div className="magic-door-stage" aria-label={phase === "unlocked" ? "자물쇠가 풀려 열린 문" : "마법 자물쇠로 잠긴 문"}>
        <div className="unlock-spell-rings" aria-hidden="true">
          <i /><i /><i />
          <svg viewBox="0 0 200 200" focusable="false"><path d="M100 12 121 62 174 40 138 82 188 100 138 118 174 160 121 138 100 188 79 138 26 160 62 118 12 100 62 82 26 40 79 62Z" /><circle cx="100" cy="100" r="58" /></svg>
        </div>
        <span className="lock-spark spark-one" aria-hidden="true" />
        <span className="lock-spark spark-two" aria-hidden="true" />
        <span className="lock-spark spark-three" aria-hidden="true" />
      </div>

      <div className="magic-unlock-actions">
        {phase === "unlocked" && <button className="unlock-enter-button" type="button" onClick={() => moveTo("magicCleaningCloset")}>문을 열고 들어가기</button>}
      </div>
      {phase !== "unlocked" ? (
        <MagicSpellSystem
          sceneId="magicUnlockDoor"
          showLockedSpell={false}
          onSpellCast={castSpell}
        />
      ) : null}
      <button className="magic-unlock-return" type="button" onClick={() => moveTo("magicAlchemyLab")}>이전 장소로 돌아가기</button>
    </section>
  );
}
