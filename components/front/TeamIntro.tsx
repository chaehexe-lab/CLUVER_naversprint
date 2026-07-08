"use client";

import { useEffect, useState } from "react";

type TeamIntroProps = {
  disabled?: boolean;
};

const INTRO_DURATION_MS = 9000;
const introTypeSfxPaths = [
  "/samunmong/sound/sfx/type-1.mp3",
  "/samunmong/sound/sfx/type-2.mp3",
  "/samunmong/sound/sfx/type-3.mp3"
] as const;
const introClickSfxPath = "/samunmong/sound/sfx/button.mp3";

function readIntroAudioVolume() {
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

function playIntroTypeSfx(index: number) {
  if (typeof window === "undefined") return;

  const audio = new Audio(introTypeSfxPaths[index % introTypeSfxPaths.length]);
  audio.volume = readIntroAudioVolume() * 0.48;
  audio.play().catch(() => {});
}

function playIntroClickSfx() {
  if (typeof window === "undefined") return;

  const audio = new Audio(introClickSfxPath);
  audio.volume = readIntroAudioVolume() * 0.58;
  audio.play().catch(() => {});
}

export default function TeamIntro({ disabled = false }: TeamIntroProps) {
  const [visible, setVisible] = useState(!disabled);

  useEffect(() => {
    if (disabled) {
      setVisible(false);
      return;
    }

    const timer = window.setTimeout(() => setVisible(false), INTRO_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [disabled]);

  useEffect(() => {
    if (disabled || !visible) return;

    const timeouts = Array.from({ length: 14 }, (_, index) =>
      window.setTimeout(() => playIntroTypeSfx(index), 1180 + index * 74)
    );
    timeouts.push(window.setTimeout(playIntroClickSfx, 2720));

    return () => {
      timeouts.forEach((timeout) => window.clearTimeout(timeout));
    };
  }, [disabled, visible]);

  if (!visible) return null;

  return (
    <section className="team-intro" aria-label="CLUVER 팀 인트로">
      <div className="intro-stage">
        <img
          className="intro-cursor"
          src="/samunmong/assets/intro/pixel-cursor.svg"
          alt=""
          aria-hidden="true"
        />

        <div className="intro-search" aria-hidden="true">
          <span className="search-lens" />
          <span className="search-type">https://cluver</span>
          <span className="search-submit" />
        </div>

      </div>

      <div className="intro-logo-scene" aria-hidden="true">
        <div className="intro-clouds">
          <img className="intro-cloud intro-cloud-left" src="/samunmong/assets/intro/soft-cloud.png" alt="" />
          <img className="intro-cloud intro-cloud-right" src="/samunmong/assets/intro/soft-cloud.png" alt="" />
        </div>
        <div className="intro-logo-aura" />
        <div className="intro-logo-word" aria-label="CLUVER">
          <span>C</span>
          <span>L</span>
          <span>U</span>
          <span>V</span>
          <span>E</span>
          <span>R</span>
        </div>
      </div>
    </section>
  );
}
