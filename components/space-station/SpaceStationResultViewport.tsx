"use client";

import { type ReactNode, useEffect, useRef } from "react";

type SpaceStationResultViewportProps = {
  children: ReactNode;
};

export default function SpaceStationResultViewport({ children }: SpaceStationResultViewportProps) {
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const syncScale = () => {
      const scale = Math.min(window.innerWidth / 1600, window.innerHeight / 900, 1);
      viewportRef.current?.style.setProperty("--game-scale", String(scale));
    };

    syncScale();
    window.addEventListener("resize", syncScale);
    return () => window.removeEventListener("resize", syncScale);
  }, []);

  return (
    <div className="game-viewport space-result-viewport" ref={viewportRef}>
      <div className="game-shell space-result-shell">{children}</div>
    </div>
  );
}
