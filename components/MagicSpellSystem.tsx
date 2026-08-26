"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

type Point = { x: number; y: number };
type SpellPhase = "select" | "draw" | "casting" | "complete";

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

const tracePoints: Point[] = [
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
}: {
  sceneId: string;
  onLightChange: (enabled: boolean) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [phase, setPhase] = useState<SpellPhase>("select");
  const [strokes, setStrokes] = useState<Point[][]>([]);
  const [matched, setMatched] = useState<Set<number>>(() => new Set());
  const [isDrawing, setIsDrawing] = useState(false);
  const completionStarted = useRef(false);
  const closeTimer = useRef<number | null>(null);

  const progress = useMemo(
    () => Math.min(100, Math.round((matched.size / tracePoints.length) * 100)),
    [matched]
  );
  const hasDrawing = useMemo(() => strokes.some((stroke) => stroke.length > 0), [strokes]);
  const canCast = hasDrawing && progress >= REQUIRED_COVERAGE;
  const spellLocked = phase === "casting" || phase === "complete";

  useEffect(() => {
    onLightChange(false);
  }, [onLightChange, sceneId]);

  function castSpell() {
    if (!canCast || phase !== "draw" || completionStarted.current) return;
    completionStarted.current = true;
    setMenuOpen(false);
    setPhase("casting");
    onLightChange(true);
    closeTimer.current = window.setTimeout(() => {
      setPhase("complete");
      closeTimer.current = window.setTimeout(() => {
        setMenuOpen(false);
        setPhase("select");
      }, 1200);
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

  function openSpellDrawing() {
    resetDrawing();
    setPhase("draw");
  }

  function closeSpellUi() {
    if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    closeTimer.current = null;
    completionStarted.current = false;
    setMenuOpen(false);
    setPhase("select");
    setIsDrawing(false);
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
    setStrokes([[...tracePoints]]);
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
          <button className="magic-spell-card available" type="button" onClick={openSpellDrawing}>
            <span className="spell-card-icon" aria-hidden="true">☼</span>
            <span><strong>빛의 마법</strong><small>어둠을 걷어 내고 주변을 밝힌다</small></span>
          </button>
          <div className="magic-spell-card locked" aria-label="아직 잠긴 마법">
            <span className="spell-card-icon" aria-hidden="true">◇</span>
            <span><strong>미지의 마법</strong><small>아직 배울 수 없습니다</small></span>
          </div>
        </aside>
      ) : null}

      {menuOpen && phase === "draw" ? (
        <>
          <button className="magic-spell-backdrop" type="button" aria-label="마법진 닫기" onClick={closeSpellUi} />
          <section className="magic-circle-modal phase-draw" role="dialog" aria-modal="true" aria-labelledby="lightSpellTitle">
            <button className="magic-spell-close" type="button" onClick={closeSpellUi} aria-label="닫기">×</button>
            <header>
              <div className="magic-spell-emblem" aria-hidden="true">☼</div>
              <div>
                <small>빛의 마법 · LUMEN</small>
                <h2 id="lightSpellTitle">밑그림을 따라 마법진을 그리세요</h2>
                <p>{`별을 그려 일치율 ${REQUIRED_COVERAGE}% 이상을 만든 뒤 마법 발동을 누르세요. 기준을 만족해도 자동으로 발동되지는 않습니다.`}</p>
              </div>
            </header>

            <div className="magic-circle-stage">
              <svg
                className="magic-trace-board"
                viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
                role="application"
                aria-label="빛의 마법진 그리기 영역"
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
                  <path d="M300 55 C310 135 385 220 500 235 C385 250 310 335 300 415 C290 335 215 250 100 235 C215 220 290 135 300 55 Z" />
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
              <button className="magic-keyboard-cast" type="button" onClick={drawForKeyboard}>별 문양 자동 그리기</button>
              <button className="magic-cast-button" type="button" onClick={castSpell} disabled={!canCast}>마법 발동</button>
            </footer>
          </section>
        </>
      ) : null}
    </div>
  );
}
