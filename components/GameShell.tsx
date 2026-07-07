"use client";

import { useEffect } from "react";
import BriefingScreen from "@/components/front/BriefingScreen";
import DreamSelectScreen from "@/components/front/DreamSelectScreen";
import MainScreen from "@/components/front/MainScreen";
import TutorialScreen from "@/components/front/TutorialScreen";
import BackGateCourtyardScene from "@/components/scenes/BackGateCourtyardScene";
import ChunwolRoomScene from "@/components/scenes/ChunwolRoomScene";
import DolsoeQuartersScene from "@/components/scenes/DolsoeQuartersScene";
import FieldOneScene from "@/components/scenes/FieldOneScene";
import InterrogationScreen from "@/components/scenes/InterrogationScreen";
import MudeokServantRoomScene from "@/components/scenes/MudeokServantRoomScene";
import YoomunseokSarangbangScene from "@/components/scenes/YoomunseokSarangbangScene";
import { STARTABLE_SCREENS } from "@/lib/gameState";

const CONTENT_SCRIPT = "/samunmong/content.js";
const PROTOTYPE_SCRIPT = "/samunmong/prototype.js";
type GameShellProps = {
  initialScreen?: string;
};

function ensureRequestedStartScreen(initialScreen?: string) {
  const startScreen = new URLSearchParams(window.location.search).get("start") || initialScreen;
  if (!startScreen || !STARTABLE_SCREENS.has(startScreen)) return;

  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.toggle("active", screen.id === startScreen);
  });
  window.dispatchEvent(new CustomEvent("samunmong:screen-change", { detail: { screenId: startScreen } }));
}

export default function GameShell({ initialScreen }: GameShellProps) {
  useEffect(() => {
    let cancelled = false;
    const loadedScripts: HTMLScriptElement[] = [];

    const loadScript = (src: string) =>
      new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = `${src}?v=${Date.now()}`;
        script.async = false;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.body.appendChild(script);
        loadedScripts.push(script);
      });

    async function bootScripts() {
      await loadScript(CONTENT_SCRIPT);
      if (cancelled) return;
      await loadScript(PROTOTYPE_SCRIPT);
      ensureRequestedStartScreen(initialScreen);
    }

    bootScripts().catch((error) => console.error(error));

    return () => {
      cancelled = true;
      loadedScripts.forEach((script) => script.remove());
    };
  }, [initialScreen]);

  return (
    <main className="game-shell">
      <MainScreen />
      <TutorialScreen />
      <DreamSelectScreen />
      <BriefingScreen />
      <FieldOneScene />
      <ChunwolRoomScene />
      <MudeokServantRoomScene />
      <YoomunseokSarangbangScene />
      <DolsoeQuartersScene />
      <BackGateCourtyardScene />
      <InterrogationScreen />
      <div className="current-location-indicator" id="currentLocationIndicator" aria-live="polite" hidden>
        <span className="location-kicker">현재 위치</span>
        <strong id="currentLocationName">유문석 집 앞</strong>
      </div>
    </main>
  );
}
