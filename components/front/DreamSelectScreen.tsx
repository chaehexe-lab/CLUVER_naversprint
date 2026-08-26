"use client";

import { dreamOptions, screenImages } from "@/lib/gameData";
import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

type DreamStyle = CSSProperties & {
  "--dream-image": string;
};

export default function DreamSelectScreen() {
  const [unplayedOnly, setUnplayedOnly] = useState(false);
  const [playedThemes, setPlayedThemes] = useState<Set<string>>(new Set());

  useEffect(() => {
    setUnplayedOnly(window.sessionStorage.getItem("samunmong-new-dream-mode") === "unplayed");
    try {
      const slots = JSON.parse(window.localStorage.getItem("samunmong-save-slots") || "{}");
      setPlayedThemes(new Set(Object.keys(slots || {})));
    } catch {
      setPlayedThemes(new Set());
    }
  }, []);

  const chooseDream = (id?: string) => {
    const themeById: Record<string, string> = {
      chooseJoseon: "joseon",
      chooseMagicSchool: "magicSchool",
      chooseSpaceStation: "spaceStation"
    };
    const theme = id ? themeById[id] : undefined;
    if (!theme) return;
    if (unplayedOnly && playedThemes.has(theme)) return;
    window.localStorage.setItem("samunmong-current-theme", theme);
    window.location.assign(`/?start=briefingScreen&theme=${theme}`);
  };

  return (
    <section className="screen" id="dreamScreen">
      <img className="plate" src={screenImages.dreamScreen} alt="" />
      <div className="shade" />
      <article className="hud dream-select-card">
        <div className="dream-select-head">
          <h2>어떤 꿈을 꾸시겠습니까?</h2>
        </div>
        <div className="dream-grid">
          {dreamOptions.map((dream) => {
            const dreamId = "id" in dream ? dream.id : undefined;
            const themeById: Record<string, string> = {
              chooseJoseon: "joseon",
              chooseMagicSchool: "magicSchool",
              chooseSpaceStation: "spaceStation"
            };
            const theme = dreamId ? themeById[dreamId] : undefined;
            const alreadyPlayed = Boolean(theme && playedThemes.has(theme));
            const disabled = dream.disabled || (unplayedOnly && alreadyPlayed);

            return <button
              key={dream.kicker}
              className={`dream${disabled ? " disabled" : ""}`}
              id={dreamId}
              type="button"
              disabled={disabled}
              data-dream-disabled={disabled ? "true" : undefined}
              style={{ "--dream-image": `url('${dream.image}')` } as DreamStyle}
              aria-label={dream.ariaLabel}
              onClick={() => chooseDream(dreamId)}
            >
              <span className={`dream-state${disabled ? "" : " playable"}`}>
                {unplayedOnly && alreadyPlayed ? "진행 기록 있음" : dream.state}
              </span>
              <span className="dream-kicker">{dream.kicker}</span>
              <strong>{dream.title}</strong>
              <span className="dream-desc">{dream.description}</span>
            </button>;
          })}
        </div>
      </article>
      <aside className="dream-notice-dialog" id="dreamNoticeDialog" aria-hidden="true" role="dialog" aria-labelledby="dreamNoticeTitle">
        <div className="dream-notice-panel">
          <div className="dream-notice-titlebar">
            <span>DREAM_ALERT</span>
            <button className="dream-notice-close" id="closeDreamNoticeX" type="button" aria-label="안내 닫기">
              ×
            </button>
          </div>
          <span className="dream-notice-seal" aria-hidden="true">!</span>
          <p className="dream-notice-kicker">SYSTEM MESSAGE</p>
          <h2 id="dreamNoticeTitle">꿈은 아직 끝나지 않았습니다</h2>
          <p id="dreamNoticeCopy">첫 번째 꿈은 멀어졌지만, 남은 두 꿈은 아직 당신을 부르고 있습니다.</p>
          <button className="button primary" id="closeDreamNotice" type="button">
            확인
          </button>
        </div>
      </aside>
    </section>
  );
}
