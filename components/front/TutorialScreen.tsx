"use client";

import { screenImages, tutorialCopy } from "@/lib/gameData";

export default function TutorialScreen() {
  return (
    <section className="screen" id="tutorialScreen">
      <img className="plate" src={screenImages.tutorialScreen} alt="" />
      <div className="shade" />
      <article className="hud story-card">
        <h1>{tutorialCopy.title}</h1>
        {tutorialCopy.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        <button className="button primary" id="nextTutorial" type="button" onClick={() => {
          window.dispatchEvent(new CustomEvent("samunmong:screen-request", {
            cancelable: true,
            detail: { screenId: "dreamScreen" }
          }));
        }}>
          계속
        </button>
      </article>
    </section>
  );
}
