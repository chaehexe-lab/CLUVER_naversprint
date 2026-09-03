"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type MouseEvent as ReactMouseEvent } from "react";
import MagicSpellSystem, { battleSpells, type MagicSpellId, type MagicSpellResult } from "@/components/MagicSpellSystem";
import { magicSchoolScenes } from "@/lib/gameData";
import { hotspotStyle } from "./hotspotStyle";

type MagicScene = (typeof magicSchoolScenes)[number];

const FROZEN_BOOK_NAME = "빙결 흔적이 남은 반납 도서";
const FROZEN_BOOK_THAWED_KEY = "samunmong-magic-library-frozen-book-thawed";
const DORM_EVIDENCE_NAME = "버려진 지팡이 조각";
const DORM_HALLWAY_CLEARED_KEY = "samunmong-magic-dorm-hallway-cleared";
const DORM_BEAST_STAGE_KEY = "samunmong-magic-beast-battle-stage";
const DORM_BEAST_COMPLETE_KEY = "samunmong-magic-beast-battle-complete";
const DORM_BEAST_TRIGGERED_KEY = "samunmong-magic-beast-battle-triggered";

const dormBeastStages = [
  {
    spellId: "metal-break" as MagicSpellId,
    hint: "갑옷을 부숴야 할 것 같다.",
    success: "연금술 금속 갑옷이 산산이 부서졌다.",
    image: "/samunmong/assets/magic-school/beast-encounter/escaped-magic-beast-armored-v2.png",
  },
  {
    spellId: "ice-control" as MagicSpellId,
    hint: "움직임을 얼려서 막아야 할 것 같다.",
    success: "얼음이 동물을 다치게 하지 않고 움직임을 붙잡았다.",
    image: "/samunmong/assets/magic-school/beast-encounter/states/beast-state-1-armor-broken-alpha-v1.png",
  },
  {
    spellId: "wind" as MagicSpellId,
    hint: "바람으로 불길을 약하게 해야 할 것 같다.",
    success: "바람이 불길과 연금술 증기를 흩어 냈다.",
    image: "/samunmong/assets/magic-school/beast-encounter/states/beast-state-2-frozen-alpha-v1.png",
  },
  {
    spellId: "light" as MagicSpellId,
    hint: "빛으로 변이 마력을 정화해야 할 것 같다.",
    success: "빛이 동물에게 엉겨 붙은 변이 마력만 정화했다.",
    image: "/samunmong/assets/magic-school/beast-encounter/states/beast-state-3-wind-weakened-alpha-v1.png",
  },
] as const;

type HolyParticleStyle = CSSProperties & {
  "--particle-start-x": string;
  "--particle-drift": string;
  "--particle-fall": string;
  "--particle-delay": string;
  "--particle-duration": string;
  "--particle-size": string;
  "--particle-spin": string;
  "--particle-opacity": string;
};

type HeavenlyBeamStyle = CSSProperties & {
  "--beam-start-x": string;
  "--beam-start-y": string;
  "--beam-angle": string;
  "--beam-length": string;
  "--beam-width": string;
  "--beam-delay": string;
  "--beam-brightness": string;
};

type IceBurstParticleStyle = CSSProperties & {
  "--ice-dx": string;
  "--ice-dy": string;
  "--ice-delay": string;
  "--ice-duration": string;
  "--ice-size": string;
  "--ice-spin": string;
};

type IceSpreadOriginStyle = CSSProperties & {
  "--ice-origin-x": string;
  "--ice-origin-y": string;
};

type WindDebrisStyle = CSSProperties & {
  "--wind-start-x": string;
  "--wind-start-y": string;
  "--wind-delay": string;
  "--wind-dx": string;
  "--wind-dy": string;
  "--wind-spin": string;
};

const holyParticles: HolyParticleStyle[] = Array.from({ length: 180 }, (_, index) => {
  return {
    "--particle-start-x": `${(index * 47 + (index % 7) * 3) % 101}%`,
    "--particle-drift": `${((index * 31) % 25) - 12}vw`,
    "--particle-fall": `${108 + (index % 8) * 5}vh`,
    "--particle-delay": `${(index % 45) * 0.028}s`,
    "--particle-duration": `${2.6 + (index % 10) * 0.12}s`,
    "--particle-size": `${2.5 + (index % 6) * 1.1}px`,
    "--particle-spin": `${120 + (index % 11) * 37}deg`,
    "--particle-opacity": `${0.55 + (index % 5) * 0.09}`
  } satisfies HolyParticleStyle;
});

const heavenlyBeams: HeavenlyBeamStyle[] = [
  [50, 3, 4, 118, 10.5, 0.02, 0.88],
  [50, 1, 15, 122, 8.5, 0.05, 0.92],
  [50, -2, 26, 132, 11, 0.01, 0.96],
  [50, -8, 36, 182, 9.5, 0.04, 0.98],
  [50, -8, 43, 171, 7.2, 0.02, 0.9],
  [50, -8, 50, 163, 10.5, 0.06, 1.06],
  [50, -8, 58, 153, 6.8, 0, 0.92],
  [50, -8, 66, 146, 11.5, 0.05, 1.1],
  [50, -8, 74, 140, 7.5, 0.03, 0.96],
  [50, -8, 82, 136, 12.5, 0.07, 1.12],
  [50, -8, 90, 134, 9.5, 0, 1.18],
  [50, -8, 98, 136, 12, 0.06, 1.1],
  [50, -8, 106, 140, 7.3, 0.02, 0.95],
  [50, -8, 114, 146, 11.2, 0.05, 1.08],
  [50, -8, 122, 153, 6.6, 0, 0.9],
  [50, -8, 130, 163, 10.2, 0.07, 1.04],
  [50, -8, 137, 171, 7, 0.03, 0.9],
  [50, -8, 144, 182, 9.2, 0.05, 0.98],
  [50, -2, 154, 132, 11, 0.01, 0.96],
  [50, 1, 165, 122, 8.5, 0.05, 0.92],
  [50, 3, 176, 118, 10.5, 0.02, 0.88]
].map(([startX, startY, angle, length, width, delay, brightness]) => ({
  "--beam-start-x": `${startX}%`,
  "--beam-start-y": `${startY}%`,
  "--beam-angle": `${angle}deg`,
  "--beam-length": `${length}vh`,
  "--beam-width": `${width}vw`,
  "--beam-delay": `${delay}s`,
  "--beam-brightness": `${brightness}`
}));

const iceBurstParticles: IceBurstParticleStyle[] = Array.from({ length: 64 }, (_, index) => {
  const angle = (Math.PI * 2 * index) / 64 + ((index % 5) - 2) * 0.035;
  const distance = 105 + (index % 8) * 34;
  return {
    "--ice-dx": `${Math.cos(angle) * distance}px`,
    "--ice-dy": `${Math.sin(angle) * distance * 0.72}px`,
    "--ice-delay": `${(index % 9) * 0.025}s`,
    "--ice-duration": `${0.95 + (index % 7) * 0.11}s`,
    "--ice-size": `${3 + (index % 6) * 1.35}px`,
    "--ice-spin": `${150 + (index % 10) * 41}deg`
  } satisfies IceBurstParticleStyle;
});

const windDebris: WindDebrisStyle[] = Array.from({ length: 18 }, (_, index) => ({
  "--wind-start-x": `${52 + (index % 6) * 3.6}%`,
  "--wind-start-y": `${77 + (index % 4) * 2}%`,
  "--wind-delay": `${(index % 7) * 0.045}s`,
  "--wind-dx": `${260 + (index % 5) * 38}px`,
  "--wind-dy": `${-150 - (index % 6) * 24}px`,
  "--wind-spin": `${220 + (index % 5) * 70}deg`,
}));

export default function MagicSchoolScene({ scene }: { scene: MagicScene }) {
  const requiresLightSpell = scene.id === "magicAlchemyLab";
  const [lightEnabled, setLightEnabled] = useState(false);
  const [lightCastCount, setLightCastCount] = useState(0);
  const [frozenBookThawed, setFrozenBookThawed] = useState(false);
  const [frozenBookNotice, setFrozenBookNotice] = useState<string | null>(null);
  const [noticeIcon, setNoticeIcon] = useState("❄");
  const [iceBurstCount, setIceBurstCount] = useState(0);
  const [dormHallwayCleared, setDormHallwayCleared] = useState(false);
  const [dormBeastStage, setDormBeastStage] = useState(0);
  const [dormBeastTriggered, setDormBeastTriggered] = useState(false);
  const [windBurstCount, setWindBurstCount] = useState(0);
  const noticeTimer = useRef<number | null>(null);
  const iceBurstTimer = useRef<number | null>(null);

  useEffect(() => {
    if (scene.id !== "magicLibrary") return;
    setFrozenBookThawed(window.localStorage.getItem(FROZEN_BOOK_THAWED_KEY) === "1");
  }, [scene.id]);

  useEffect(() => {
    if (scene.id !== "magicDormHallway") return;
    let evidenceWasAlreadyCollected = false;
    try {
      const storedEvidence = JSON.parse(window.localStorage.getItem("samunmong-collected-evidence-magic-school") || "[]");
      evidenceWasAlreadyCollected = Array.isArray(storedEvidence) && storedEvidence.includes(DORM_EVIDENCE_NAME);
    } catch {
      evidenceWasAlreadyCollected = false;
    }
    const isCleared = window.localStorage.getItem(DORM_HALLWAY_CLEARED_KEY) === "1" || evidenceWasAlreadyCollected;
    setDormHallwayCleared(isCleared);
    if (isCleared) window.localStorage.setItem(DORM_HALLWAY_CLEARED_KEY, "1");

    const battleComplete = window.localStorage.getItem(DORM_BEAST_COMPLETE_KEY) === "1";
    setDormBeastTriggered(window.localStorage.getItem(DORM_BEAST_TRIGGERED_KEY) === "1" && !battleComplete);
    const storedStage = Number.parseInt(window.localStorage.getItem(DORM_BEAST_STAGE_KEY) ?? "0", 10);
    const restoredStage = battleComplete
      ? dormBeastStages.length
      : Math.min(Math.max(Number.isFinite(storedStage) ? storedStage : 0, 0), dormBeastStages.length - 1);
    setDormBeastStage(restoredStage);
  }, [scene.id]);

  useEffect(() => {
    if (scene.id !== "magicDormHallway") return;
    const showDormBeast = () => setDormBeastTriggered(true);
    window.addEventListener("samunmong:magic-beast-triggered", showDormBeast);
    return () => window.removeEventListener("samunmong:magic-beast-triggered", showDormBeast);
  }, [scene.id]);

  useEffect(() => () => {
    if (noticeTimer.current !== null) window.clearTimeout(noticeTimer.current);
    if (iceBurstTimer.current !== null) window.clearTimeout(iceBurstTimer.current);
  }, []);

  const showFrozenBookNotice = useCallback((message: string, icon = "❄") => {
    if (noticeTimer.current !== null) window.clearTimeout(noticeTimer.current);
    setNoticeIcon(icon);
    setFrozenBookNotice(message);
    noticeTimer.current = window.setTimeout(() => setFrozenBookNotice(null), 2600);
  }, []);
  const handleLightChange = useCallback((enabled: boolean) => {
    setLightEnabled(enabled);
    if (enabled) setLightCastCount((count) => count + 1);
  }, []);
  const isDormBeastBlocking = scene.id === "magicDormHallway" && dormBeastTriggered && dormBeastStage < dormBeastStages.length;
  const dormBeast = dormBeastStages[Math.min(dormBeastStage, dormBeastStages.length - 1)];

  useEffect(() => {
    if (!isDormBeastBlocking) return;
    const handleBattleHint = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element) || !target.closest("#magicDormHallway .scene-hint")) return;
      event.preventDefault();
      event.stopPropagation();
      showFrozenBookNotice(dormBeast.hint, "?");
    };
    document.addEventListener("click", handleBattleHint, true);
    return () => document.removeEventListener("click", handleBattleHint, true);
  }, [dormBeast.hint, isDormBeastBlocking, showFrozenBookNotice]);

  const handleSpellCast = useCallback((spellId: MagicSpellId): MagicSpellResult => {
    if (scene.id === "magicDormHallway" && dormBeastTriggered && dormBeastStage < dormBeastStages.length) {
      const expectedStage = dormBeastStages[dormBeastStage];
      if (spellId !== expectedStage.spellId) {
        showFrozenBookNotice(expectedStage.hint, "?");
        return "no-effect";
      }

      const nextStage = dormBeastStage + 1;
      setDormBeastStage(nextStage);
      window.localStorage.setItem(DORM_BEAST_STAGE_KEY, String(nextStage));
      showFrozenBookNotice(expectedStage.success, "✦");

      if (spellId === "wind") {
        setDormHallwayCleared(true);
        setWindBurstCount((count) => count + 1);
        window.localStorage.setItem(DORM_HALLWAY_CLEARED_KEY, "1");
      }

      if (nextStage === dormBeastStages.length) {
        window.localStorage.setItem(DORM_BEAST_COMPLETE_KEY, "1");
        window.localStorage.removeItem(DORM_BEAST_TRIGGERED_KEY);
        setDormBeastTriggered(false);
        showFrozenBookNotice("온순했던 동물이 정신을 되찾았다. 교무 조사실로 가야 할 것 같다.", "☼");
      }

      return "success";
    }

    if (spellId === "light") return "success";
    if (spellId === "ice-control" && scene.id === "magicLibrary") {
      setFrozenBookThawed(true);
      setIceBurstCount((count) => count + 1);
      if (iceBurstTimer.current !== null) window.clearTimeout(iceBurstTimer.current);
      iceBurstTimer.current = window.setTimeout(() => setIceBurstCount(0), 2200);
      window.localStorage.setItem(FROZEN_BOOK_THAWED_KEY, "1");
      showFrozenBookNotice("냉기가 걷혔습니다. 이제 책을 획득할 수 있습니다.");
      return "success";
    }
    if (spellId === "wind" && scene.id === "magicDormHallway") {
      setDormHallwayCleared(true);
      setWindBurstCount((count) => count + 1);
      window.localStorage.setItem(DORM_HALLWAY_CLEARED_KEY, "1");
      showFrozenBookNotice("바람이 흙먼지와 쓰레기를 걷어 냈습니다. 그 아래에서 지팡이 조각이 드러났습니다.", "≋");
      return "success";
    }
    return "no-effect";
  }, [dormBeastStage, dormBeastTriggered, scene.id, showFrozenBookNotice]);
  const lightClassName = `${requiresLightSpell ? " magic-light-required" : ""}${lightEnabled ? " light-magic-active" : ""}${frozenBookThawed ? " frozen-book-thawed" : ""}${scene.id === "magicDormHallway" ? dormHallwayCleared ? " dorm-hallway-cleared" : " dorm-hallway-dirty" : ""}`;
  const frozenBookHotspot = scene.hotspots.find((hotspot) => hotspot.evidenceName === FROZEN_BOOK_NAME);
  const iceSpreadOrigin: IceSpreadOriginStyle = {
    "--ice-origin-x": frozenBookHotspot
      ? `${parseFloat(frozenBookHotspot.x) - 2}%`
      : "50%",
    "--ice-origin-y": frozenBookHotspot
      ? `${parseFloat(frozenBookHotspot.y) - 3}%`
      : "50%"
  };

  return (
    <section className={`screen active magic-school-screen${lightClassName}`} id={scene.id}>
      <img className="plate" src={scene.image} alt={scene.alt} />
      <div className="shade magic-shade" />
      <div className="magic-light-bloom" aria-hidden="true" />
      <div className="magic-heavenly-light" aria-hidden="true" key={`heavenly-light-${lightCastCount}`}>
        {heavenlyBeams.map((style, index) => (
          <span className="heavenly-light-beam" style={style} key={index} />
        ))}
      </div>
      <div className="magic-holy-particles" aria-hidden="true" key={lightCastCount}>
        {holyParticles.map((style, index) => (
          <span className={index % 9 === 0 ? "holy-particle star" : "holy-particle"} style={style} key={index} />
        ))}
      </div>

      {scene.id === "magicDormHallway" ? (
        <img
          className="magic-dorm-clutter"
          src="/samunmong/assets/magic-school/scenes/dorm-hallway-dust-trash-v1.png"
          alt=""
          aria-hidden="true"
          draggable="false"
        />
      ) : null}

      {scene.id === "magicDormHallway" && windBurstCount > 0 ? (
        <div className="dorm-wind-effect" aria-hidden="true" key={`wind-burst-${windBurstCount}`}>
          <span className="wind-sweep wind-sweep-one" />
          <span className="wind-sweep wind-sweep-two" />
          <span className="wind-sweep wind-sweep-three" />
          {windDebris.map((style, index) => (
            <i className={index % 3 === 0 ? "wind-debris paper" : "wind-debris dust"} style={style} key={index} />
          ))}
        </div>
      ) : null}

      {isDormBeastBlocking ? (
        <div className={`magic-dorm-beast magic-dorm-beast-stage-${dormBeastStage}`} aria-hidden="true">
          <span className="magic-dorm-beast-aura" />
          <img src={dormBeast.image} alt="" draggable="false" />
          {dormBeastStage === 2 ? <span className="magic-dorm-beast-frost" /> : null}
          {dormBeastStage === 3 ? <span className="magic-dorm-beast-weak-pulse" /> : null}
        </div>
      ) : null}

      {iceBurstCount > 0 ? (
        <div className="ice-spread-effect" style={iceSpreadOrigin} aria-hidden="true" key={`ice-burst-${iceBurstCount}`}>
          <span className="ice-burst-flash" />
          <span className="ice-burst-ring" />
          {iceBurstParticles.map((style, index) => (
            <i className={index % 4 === 0 ? "ice-particle snowflake" : "ice-particle shard"} style={style} key={index} />
          ))}
        </div>
      ) : null}

      {scene.hotspots.map((hotspot) => {
        const hotspotKey = "id" in hotspot && typeof hotspot.id === "string" ? hotspot.id : hotspot.evidenceName;
        const className = "className" in hotspot && typeof hotspot.className === "string" ? ` ${hotspot.className}` : "";
        const isFrozenBook = scene.id === "magicLibrary" && hotspot.evidenceName === FROZEN_BOOK_NAME;
        const isDormEvidence = scene.id === "magicDormHallway" && hotspot.evidenceName === DORM_EVIDENCE_NAME;
        const isDormEvidenceConcealed = isDormEvidence && !dormHallwayCleared;

        const handleHotspotClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
          if (!isFrozenBook || frozenBookThawed || event.currentTarget.classList.contains("collected")) return;
          event.preventDefault();
          event.stopPropagation();
          showFrozenBookNotice("책이 꽁꽁 얼어 있어 획득할 수 없습니다.");
        };

        const handleSceneHotspotClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
          if (isDormEvidenceConcealed) {
            event.preventDefault();
            event.stopPropagation();
            showFrozenBookNotice("흙먼지와 쓰레기가 바닥을 덮고 있습니다. 바람 마법으로 치워야 합니다.", "≋");
            return;
          }
          handleHotspotClick(event);
        };

        return (
          <button
            key={hotspotKey}
            className={`hotspot${className}${isFrozenBook ? frozenBookThawed ? " frozen-book-hotspot thawed" : " frozen-book-hotspot frozen" : ""}${isDormEvidence ? dormHallwayCleared ? " dorm-evidence revealed" : " dorm-evidence concealed" : ""}`}
            type="button"
            data-evidence-name={hotspot.evidenceName}
            aria-label={hotspot.ariaLabel}
            aria-description={isFrozenBook && !frozenBookThawed ? "얼음 조절 마법을 사용해야 획득할 수 있습니다" : isDormEvidenceConcealed ? "바람 마법으로 먼지와 쓰레기를 제거해야 발견할 수 있습니다" : undefined}
            aria-disabled={isFrozenBook && !frozenBookThawed || isDormEvidenceConcealed ? "true" : undefined}
            onClick={handleSceneHotspotClick}
            style={{
              ...hotspotStyle(hotspot),
              clipPath: hotspot.clipPath,
              borderRadius: hotspot.radius
            }}
          />
        );
      })}

      {frozenBookNotice ? (
        <div className="frozen-book-notice" role="status" aria-live="polite">
          <span aria-hidden="true">{noticeIcon}</span>
          <strong>{frozenBookNotice}</strong>
        </div>
      ) : null}

      <nav className="hud scene-dock magic-school-dock" aria-label="마법학교 조사 도구">
        {scene.dock.map((action) => {
          const id = "id" in action && typeof action.id === "string" ? action.id : undefined;
          const goTo = "goTo" in action && typeof action.goTo === "string" ? action.goTo : undefined;

          return (
            <button
              className={`scene-chip ${action.className}`}
              id={id}
              type="button"
            data-go={goTo}
            aria-label={action.ariaLabel}
            key={`${scene.id}-${action.label}`}
          >
            <img src={action.image} alt="" draggable="false" />
            <span className="magic-scene-chip-label">{action.label}</span>
          </button>
          );
        })}
      </nav>
      <MagicSpellSystem
        sceneId={scene.id}
        onLightChange={handleLightChange}
        onSpellCast={handleSpellCast}
        spells={isDormBeastBlocking ? battleSpells : undefined}
        noEffectMessage={isDormBeastBlocking ? "상황에 맞는 마법을 써야 할 것 같다." : undefined}
      />
    </section>
  );
}
