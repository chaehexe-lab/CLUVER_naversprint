"use client";

import { useEffect, useState } from "react";

type TeamIntroProps = {
  disabled?: boolean;
};

const INTRO_DURATION_MS = 5600;

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
    </section>
  );
}
