"use client";

import { useEffect, useRef, useState } from "react";

type FlashPhase = "low" | "peak" | "after";

type Strike = {
  frame: number;
  key: number;
  phase: FlashPhase;
  window: number;
};

const STRIKE_ROOT =
  "/samunmong/assets/magic-school/scenes/motion/library-windows/strikes";

function strikeSource(windowIndex: number, frameIndex: number) {
  return `${STRIKE_ROOT}/library-window-${windowIndex}-strike-${frameIndex}.png?v=1`;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load scene effect asset: ${src}`));
    image.src = src;
  });
}

export default function MagicLibraryStormLayer() {
  const [strike, setStrike] = useState<Strike | null>(null);
  const strikeCountRef = useRef(0);

  useEffect(() => {
    let disposed = false;
    const timers = new Set<number>();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const later = (callback: () => void, delay: number) => {
      const timer = window.setTimeout(() => {
        timers.delete(timer);
        if (!disposed) callback();
      }, delay);
      timers.add(timer);
    };

    const clear = () => setStrike(null);

    const scheduleNext = () => {
      if (reducedMotion || disposed) return;
      later(runStrike, 4300 + Math.random() * 5600);
    };

    const runStrike = () => {
      if (disposed) return;
      if (document.hidden) {
        scheduleNext();
        return;
      }

      const frame = Math.floor(Math.random() * 6) + 1;
      const targetWindow = Math.floor(Math.random() * 3) + 1;
      const doubleFlash = Math.random() < 0.34;
      strikeCountRef.current += 1;
      const key = strikeCountRef.current;

      setStrike({ frame, key, phase: "low", window: targetWindow });
      later(() => setStrike({ frame, key, phase: "peak", window: targetWindow }), 86);
      later(() => setStrike({ frame, key, phase: "after", window: targetWindow }), 420);
      later(clear, 820);

      if (doubleFlash) {
        later(() => setStrike({ frame, key, phase: "peak", window: targetWindow }), 958);
        later(() => setStrike({ frame, key, phase: "after", window: targetWindow }), 1228);
        later(clear, 1490);
      }

      later(scheduleNext, doubleFlash ? 1560 : 880);
    };

    const sources = Array.from({ length: 3 }, (_, windowIndex) =>
      Array.from({ length: 6 }, (_, frameIndex) =>
        strikeSource(windowIndex + 1, frameIndex + 1),
      ),
    ).flat();

    Promise.all(sources.map(loadImage))
      .then(() => {
        if (disposed || reducedMotion) return;
        later(runStrike, 900 + Math.random() * 900);
      })
      .catch(clear);

    return () => {
      disposed = true;
      timers.forEach((timer) => window.clearTimeout(timer));
      timers.clear();
      setStrike(null);
    };
  }, []);

  return (
    <div
      className="magic-library-lightning-layer"
      data-flash-active={strike ? "true" : "false"}
      data-strike-count={strikeCountRef.current}
      data-last-window={strike?.window ?? ""}
      data-last-frame={strike?.frame ?? ""}
      aria-hidden="true"
    >
      {strike ? (
        <img
          key={`${strike.key}-${strike.phase}`}
          className={`magic-library-lightning-strike is-${strike.phase}`}
          src={strikeSource(strike.window, strike.frame)}
          alt=""
          draggable={false}
        />
      ) : null}
    </div>
  );
}
