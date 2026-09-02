"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

type Point = { x: number; y: number };
type SpellPhase = "select" | "draw" | "casting" | "complete";

export type MagicSpellId = "light" | "metal-break" | "ice-control" | "wind";
export type MagicSpellResult = "success" | "no-effect";

type MagicSpellDefinition = {
  id: MagicSpellId;
  name: string;
  incantation: string;
  description: string;
  symbol: string;
  drawingTitle: string;
  trace: "star" | "shattered-metal" | "snowflake" | "spiral";
  traceName: string;
};

const lightSpell: MagicSpellDefinition = {
  id: "light",
  name: "빛의 마법",
  incantation: "LUMEN",
  description: "어둠을 걷어 내고 주변을 밝힌다",
  symbol: "☼",
  drawingTitle: "밑그림을 따라 마법진을 그리세요",
  trace: "star",
  traceName: "별",
};

const metalBreakSpell: MagicSpellDefinition = {
  id: "metal-break",
  name: "금속 파괴 마법",
  incantation: "FERRUM FRACTUM",
  description: "금속의 결합을 무너뜨려 자물쇠와 쇠사슬을 파괴한다",
  symbol: "✦",
  drawingTitle: "금이 간 철판 모양을 따라 파괴 마법진을 그리세요",
  trace: "shattered-metal",
  traceName: "금이 간 철판",
};

const iceControlSpell: MagicSpellDefinition = {
  id: "ice-control",
  name: "얼음 조절 마법",
  incantation: "GLACIES TEMPERA",
  description: "얼어붙은 물체의 냉기를 거두어 안전하게 녹인다",
  symbol: "❄",
  drawingTitle: "눈송이 모양을 따라 얼음 조절 마법진을 그리세요",
  trace: "snowflake",
  traceName: "눈송이",
};

const windSpell: MagicSpellDefinition = {
  id: "wind",
  name: "바람 마법",
  incantation: "VENTUS",
  description: "바람을 일으켜 먼지와 가벼운 쓰레기를 걷어 낸다",
  symbol: "≋",
  drawingTitle: "세 갈래 바람 문양을 따라 마법진을 그리세요",
  trace: "spiral",
  traceName: "세 갈래 바람",
};

const availableSpells = [lightSpell, metalBreakSpell, iceControlSpell, windSpell];

function SpellIcon({ spell }: { spell: MagicSpellDefinition }) {
  if (spell.id === "metal-break") {
    return (
      <svg className="metal-break-spell-icon" viewBox="0 0 100 100" focusable="false" aria-hidden="true">
        <path d="M22 15 H78 L91 35 V65 L78 85 H22 L9 65 V35 Z" />
        <path d="M58 16 L43 43 L58 51 L39 84" />
        <path d="M43 43 L27 36 M58 51 L76 63" />
      </svg>
    );
  }

  if (spell.id === "ice-control") {
    return (
      <svg className="ice-control-spell-icon" viewBox="0 0 100 100" focusable="false" aria-hidden="true">
        <path d="M50 8 V92 M14 29 L86 71 M14 71 L86 29" />
        <path d="M50 8 L42 20 M50 8 L58 20 M50 92 L42 80 M50 92 L58 80" />
        <path d="M14 29 L29 30 M14 29 L21 43 M86 71 L71 70 M86 71 L79 57" />
        <path d="M14 71 L21 57 M14 71 L29 70 M86 29 L71 30 M86 29 L79 43" />
      </svg>
    );
  }

  if (spell.id === "wind") {
    return (
      <svg className="wind-spell-icon" viewBox="0 0 100 100" focusable="false" aria-hidden="true">
        <path d="M8 35 C30 19 52 42 72 32 C92 22 87 3 72 8 C61 12 65 25 74 20" />
        <path d="M8 50 C29 36 39 69 60 57 C76 48 69 33 58 37 C49 40 53 51 60 47" />
        <path d="M8 66 C29 54 39 91 66 84 C94 77 94 52 77 53 C64 54 65 70 76 67" />
      </svg>
    );
  }

  return <>{spell.symbol}</>;
}

const VIEWBOX_WIDTH = 600;
const VIEWBOX_HEIGHT = 470;
const REQUIRED_COVERAGE = 72;
const TRACE_TOLERANCE = 30;

function cubicBezierPoints(from: Point, controlA: Point, controlB: Point, to: Point, count: number) {
  return Array.from({ length: count }, (_, index) => {
    const t = index / (count - 1);
    const inverse = 1 - t;
    return {
      x: inverse ** 3 * from.x
        + 3 * inverse ** 2 * t * controlA.x
        + 3 * inverse * t ** 2 * controlB.x
        + t ** 3 * to.x,
      y: inverse ** 3 * from.y
        + 3 * inverse ** 2 * t * controlA.y
        + 3 * inverse * t ** 2 * controlB.y
        + t ** 3 * to.y,
    };
  });
}

const starTrace: Point[] = [
  ...cubicBezierPoints(
    { x: 300, y: 55 }, { x: 310, y: 135 }, { x: 385, y: 220 }, { x: 500, y: 235 }, 32
  ),
  ...cubicBezierPoints(
    { x: 500, y: 235 }, { x: 385, y: 250 }, { x: 310, y: 335 }, { x: 300, y: 415 }, 32
  ),
  ...cubicBezierPoints(
    { x: 300, y: 415 }, { x: 290, y: 335 }, { x: 215, y: 250 }, { x: 100, y: 235 }, 32
  ),
  ...cubicBezierPoints(
    { x: 100, y: 235 }, { x: 215, y: 220 }, { x: 290, y: 135 }, { x: 300, y: 55 }, 32
  ),
];

function linePoints(from: Point, to: Point, count: number) {
  return Array.from({ length: count }, (_, index) => {
    const ratio = index / (count - 1);
    return {
      x: from.x + (to.x - from.x) * ratio,
      y: from.y + (to.y - from.y) * ratio,
    };
  });
}

const shatteredMetalOutlineTrace: Point[] = [
  ...linePoints({ x: 190, y: 70 }, { x: 410, y: 70 }, 32),
  ...linePoints({ x: 410, y: 70 }, { x: 485, y: 150 }, 18),
  ...linePoints({ x: 485, y: 150 }, { x: 485, y: 320 }, 26),
  ...linePoints({ x: 485, y: 320 }, { x: 410, y: 400 }, 18),
  ...linePoints({ x: 410, y: 400 }, { x: 190, y: 400 }, 32),
  ...linePoints({ x: 190, y: 400 }, { x: 115, y: 320 }, 18),
  ...linePoints({ x: 115, y: 320 }, { x: 115, y: 150 }, 26),
  ...linePoints({ x: 115, y: 150 }, { x: 190, y: 70 }, 18),
];

const shatteredMetalCrackTrace: Point[] = [
  ...linePoints({ x: 340, y: 72 }, { x: 268, y: 205 }, 28),
  ...linePoints({ x: 268, y: 205 }, { x: 342, y: 244 }, 18),
  ...linePoints({ x: 342, y: 244 }, { x: 255, y: 398 }, 32),
];

const shatteredMetalBranchTrace: Point[][] = [
  linePoints({ x: 268, y: 205 }, { x: 188, y: 168 }, 20),
  linePoints({ x: 342, y: 244 }, { x: 425, y: 300 }, 20),
];

const snowflakeTrace: Point[][] = [
  linePoints({ x: 300, y: 55 }, { x: 300, y: 415 }, 64),
  linePoints({ x: 145, y: 145 }, { x: 455, y: 325 }, 64),
  linePoints({ x: 145, y: 325 }, { x: 455, y: 145 }, 64),
];

const windTopTrace: Point[] = [
  ...cubicBezierPoints({ x: 80, y: 175 }, { x: 165, y: 105 }, { x: 245, y: 190 }, { x: 345, y: 160 }, 42),
  ...cubicBezierPoints({ x: 345, y: 160 }, { x: 455, y: 128 }, { x: 455, y: 42 }, { x: 385, y: 34 }, 34).slice(1),
  ...cubicBezierPoints({ x: 385, y: 34 }, { x: 325, y: 28 }, { x: 310, y: 105 }, { x: 354, y: 119 }, 30).slice(1),
  ...cubicBezierPoints({ x: 354, y: 119 }, { x: 391, y: 131 }, { x: 405, y: 86 }, { x: 374, y: 78 }, 24).slice(1),
];

const windMiddleTrace: Point[] = [
  ...cubicBezierPoints({ x: 80, y: 225 }, { x: 170, y: 160 }, { x: 205, y: 305 }, { x: 305, y: 267 }, 44),
  ...cubicBezierPoints({ x: 305, y: 267 }, { x: 365, y: 244 }, { x: 350, y: 174 }, { x: 300, y: 180 }, 32).slice(1),
  ...cubicBezierPoints({ x: 300, y: 180 }, { x: 258, y: 185 }, { x: 255, y: 236 }, { x: 292, y: 239 }, 28).slice(1),
  ...cubicBezierPoints({ x: 292, y: 239 }, { x: 322, y: 241 }, { x: 326, y: 205 }, { x: 299, y: 205 }, 22).slice(1),
];

const windBottomTrace: Point[] = [
  ...cubicBezierPoints({ x: 82, y: 286 }, { x: 180, y: 245 }, { x: 230, y: 430 }, { x: 365, y: 395 }, 48),
  ...cubicBezierPoints({ x: 365, y: 395 }, { x: 492, y: 363 }, { x: 500, y: 244 }, { x: 416, y: 241 }, 38).slice(1),
  ...cubicBezierPoints({ x: 416, y: 241 }, { x: 345, y: 238 }, { x: 337, y: 326 }, { x: 399, y: 337 }, 34).slice(1),
  ...cubicBezierPoints({ x: 399, y: 337 }, { x: 448, y: 346 }, { x: 461, y: 282 }, { x: 417, y: 280 }, 26).slice(1),
];

const traceSets = {
  star: {
    paths: ["M300 55 C310 135 385 220 500 235 C385 250 310 335 300 415 C290 335 215 250 100 235 C215 220 290 135 300 55 Z"],
    strokes: [starTrace],
  },
  "shattered-metal": {
    paths: [
      "M190 70 H410 L485 150 V320 L410 400 H190 L115 320 V150 Z",
      "M340 72 L268 205 L342 244 L255 398",
      "M268 205 L188 168",
      "M342 244 L425 300",
    ],
    strokes: [shatteredMetalOutlineTrace, shatteredMetalCrackTrace, ...shatteredMetalBranchTrace],
  },
  snowflake: {
    paths: [
      "M300 55 V415",
      "M145 145 L455 325",
      "M145 325 L455 145",
    ],
    strokes: snowflakeTrace,
  },
  spiral: {
    paths: [
      "M80 175 C165 105 245 190 345 160 C455 128 455 42 385 34 C325 28 310 105 354 119 C391 131 405 86 374 78",
      "M80 225 C170 160 205 305 305 267 C365 244 350 174 300 180 C258 185 255 236 292 239 C322 241 326 205 299 205",
      "M82 286 C180 245 230 430 365 395 C492 363 500 244 416 241 C345 238 337 326 399 337 C448 346 461 282 417 280",
    ],
    strokes: [windTopTrace, windMiddleTrace, windBottomTrace],
  },
};

function toSvgPoint(event: ReactPointerEvent<SVGSVGElement>): Point {
  const bounds = event.currentTarget.getBoundingClientRect();
  return {
    x: ((event.clientX - bounds.left) / bounds.width) * VIEWBOX_WIDTH,
    y: ((event.clientY - bounds.top) / bounds.height) * VIEWBOX_HEIGHT,
  };
}

function pathFromStroke(stroke: Point[]) {
  return stroke.map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ");
}

export default function MagicSpellSystem({
  sceneId,
  onLightChange,
  onSpellCast,
  spells = availableSpells,
  showLockedSpell = true,
}: {
  sceneId: string;
  onLightChange?: (enabled: boolean) => void;
  onSpellCast?: (spellId: MagicSpellId) => MagicSpellResult;
  spells?: MagicSpellDefinition[];
  showLockedSpell?: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [phase, setPhase] = useState<SpellPhase>("select");
  const [selectedSpellId, setSelectedSpellId] = useState<MagicSpellId>(spells[0]?.id ?? "light");
  const [strokes, setStrokes] = useState<Point[][]>([]);
  const [matched, setMatched] = useState<Set<number>>(() => new Set());
  const [isDrawing, setIsDrawing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const completionStarted = useRef(false);
  const closeTimer = useRef<number | null>(null);
  const selectedSpell = spells.find((spell) => spell.id === selectedSpellId) ?? spells[0] ?? lightSpell;
  const activeTrace = traceSets[selectedSpell.trace];
  const tracePoints = activeTrace.strokes.flat();

  const progress = useMemo(
    () => Math.min(100, Math.round((matched.size / tracePoints.length) * 100)),
    [matched, tracePoints.length]
  );
  const hasDrawing = useMemo(() => strokes.some((stroke) => stroke.length > 0), [strokes]);
  const canCast = hasDrawing && progress >= REQUIRED_COVERAGE;
  const spellLocked = phase === "casting" || phase === "complete";
  const wandCursorActive = menuOpen || spellLocked;

  useEffect(() => {
    onLightChange?.(false);
  }, [onLightChange, sceneId]);

  useEffect(() => {
    document.body.classList.toggle("magic-wand-cursor-active", wandCursorActive);
    return () => document.body.classList.remove("magic-wand-cursor-active");
  }, [wandCursorActive]);

  function castSpell() {
    if (!canCast || phase !== "draw" || completionStarted.current) return;
    completionStarted.current = true;
    setMenuOpen(false);
    setPhase("casting");
    const result = onSpellCast?.(selectedSpell.id) ?? "success";
    if (selectedSpell.id === "light" && result === "success") onLightChange?.(true);
    closeTimer.current = window.setTimeout(() => {
      setPhase("complete");
      if (result === "no-effect") setFeedback("아무일도 없었다");
      closeTimer.current = window.setTimeout(() => {
        setMenuOpen(false);
        setPhase("select");
        setFeedback(null);
      }, 1500);
    }, 900);
  }

  useEffect(() => () => {
    if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeSpellUi();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  });

  function resetDrawing() {
    completionStarted.current = false;
    setStrokes([]);
    setMatched(new Set());
    setIsDrawing(false);
  }

  function openSpellDrawing(spellId: MagicSpellId) {
    setSelectedSpellId(spellId);
    resetDrawing();
    setFeedback(null);
    setPhase("draw");
  }

  function closeSpellUi() {
    if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    closeTimer.current = null;
    completionStarted.current = false;
    setMenuOpen(false);
    setPhase("select");
    setIsDrawing(false);
    setFeedback(null);
  }

  function recordPoint(point: Point) {
    setStrokes((current) => {
      if (current.length === 0) return [[point]];
      const next = current.map((stroke) => [...stroke]);
      const activeStroke = next[next.length - 1];
      const previous = activeStroke[activeStroke.length - 1];
      if (!previous || Math.hypot(point.x - previous.x, point.y - previous.y) >= 3) activeStroke.push(point);
      return next;
    });

    setMatched((current) => {
      const next = new Set(current);
      tracePoints.forEach((target, index) => {
        if (Math.hypot(point.x - target.x, point.y - target.y) <= TRACE_TOLERANCE) next.add(index);
      });
      return next;
    });
  }

  function handlePointerDown(event: ReactPointerEvent<SVGSVGElement>) {
    if (phase !== "draw") return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDrawing(true);
    const point = toSvgPoint(event);
    setStrokes((current) => [...current, [point]]);
    setMatched((current) => {
      const next = new Set(current);
      tracePoints.forEach((target, index) => {
        if (Math.hypot(point.x - target.x, point.y - target.y) <= TRACE_TOLERANCE) next.add(index);
      });
      return next;
    });
  }

  function handlePointerMove(event: ReactPointerEvent<SVGSVGElement>) {
    if (!isDrawing || phase !== "draw") return;
    event.preventDefault();
    recordPoint(toSvgPoint(event));
  }

  function finishStroke(event: ReactPointerEvent<SVGSVGElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    setIsDrawing(false);
  }

  function drawForKeyboard() {
    if (completionStarted.current || phase !== "draw") return;
    setStrokes(activeTrace.strokes.map((stroke) => [...stroke]));
    setMatched(new Set(tracePoints.map((_, index) => index)));
  }

  return (
    <div className="magic-spell-system">
      <button
        className={`magic-spell-toggle${menuOpen ? " active" : ""}`}
        type="button"
        disabled={spellLocked}
        onClick={() => {
          if (menuOpen) closeSpellUi();
          else {
            setMenuOpen(true);
            setPhase("select");
          }
        }}
        aria-expanded={menuOpen}
      >
        <span className="magic-spell-toggle-rune" aria-hidden="true">
          <svg viewBox="0 0 100 100" focusable="false">
            <path d="M50 6 C45 28 28 45 6 50 C28 55 45 72 50 94 C55 72 72 55 94 50 C72 45 55 28 50 6 Z" />
          </svg>
        </span>
        <span>마법 사용</span>
      </button>

      {menuOpen && phase === "select" ? (
        <aside className="magic-spell-drawer" aria-label="사용할 마법 선택">
          <header><small>보유 주문</small><strong>사용할 마법을 선택하세요</strong></header>
          {spells.map((spell) => (
            <button className="magic-spell-card available" type="button" onClick={() => openSpellDrawing(spell.id)} key={spell.id}>
              <span className="spell-card-icon" aria-hidden="true"><SpellIcon spell={spell} /></span>
              <span><strong>{spell.name}</strong><small>{spell.description}</small></span>
            </button>
          ))}
          {showLockedSpell ? (
            <div className="magic-spell-card locked" aria-label="아직 잠긴 마법">
              <span className="spell-card-icon" aria-hidden="true">◇</span>
              <span><strong>미지의 마법</strong><small>아직 배울 수 없습니다</small></span>
            </div>
          ) : null}
        </aside>
      ) : null}

      {menuOpen && phase === "draw" ? (
        <>
          <button className="magic-spell-backdrop" type="button" aria-label="마법진 닫기" onClick={closeSpellUi} />
          <section className="magic-circle-modal phase-draw" role="dialog" aria-modal="true" aria-labelledby={`${sceneId}SpellTitle`}>
            <button className="magic-spell-close" type="button" onClick={closeSpellUi} aria-label="닫기">×</button>
            <header>
              <div className="magic-spell-emblem" aria-hidden="true"><SpellIcon spell={selectedSpell} /></div>
              <div>
                <small>{`${selectedSpell.name} · ${selectedSpell.incantation}`}</small>
                <h2 id={`${sceneId}SpellTitle`}>{selectedSpell.drawingTitle}</h2>
                <p>{`${selectedSpell.traceName} 모양을 그려 일치율 ${REQUIRED_COVERAGE}% 이상을 만든 뒤 마법 발동을 누르세요. 기준을 만족해도 자동으로 발동되지는 않습니다.`}</p>
              </div>
            </header>

            <div className="magic-circle-stage">
              <svg
                className="magic-trace-board"
                viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
                role="application"
                aria-label={`${selectedSpell.name} 마법진 그리기 영역`}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={finishStroke}
                onPointerCancel={finishStroke}
              >
                <defs>
                  <filter id={`lightGlow-${sceneId}`} x="-40%" y="-40%" width="180%" height="180%">
                    <feGaussianBlur stdDeviation="5" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>
                <g className="magic-guide-runes">
                  {activeTrace.paths.map((path) => <path d={path} key={path} />)}
                </g>
                <g className="magic-player-strokes" filter={`url(#lightGlow-${sceneId})`}>
                  {strokes.map((stroke, index) => <path d={pathFromStroke(stroke)} key={`${index}-${stroke.length}`} />)}
                </g>
              </svg>
              <div className="magic-trace-status" aria-live="polite">
                <span><i style={{ width: `${progress}%` }} /></span>
                <strong className={canCast ? "ready" : ""}>{`마력 일치율 ${progress}% · 필요 ${REQUIRED_COVERAGE}%`}</strong>
              </div>
            </div>

            <footer>
              <button type="button" onClick={resetDrawing}>다시 그리기</button>
              <button className="magic-keyboard-cast" type="button" onClick={drawForKeyboard}>{`${selectedSpell.traceName} 문양 자동 그리기`}</button>
              <button className="magic-cast-button" type="button" onClick={castSpell} disabled={!canCast}>마법 발동</button>
            </footer>
          </section>
        </>
      ) : null}
      {feedback ? <div className="magic-spell-feedback" role="status">{feedback}</div> : null}
    </div>
  );
}
