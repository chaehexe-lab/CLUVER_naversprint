"use client";

import { useEffect } from "react";
import BriefingScreen from "@/components/front/BriefingScreen";
import ButtonGuideLayer from "@/components/ButtonGuideLayer";
import DreamSelectScreen from "@/components/front/DreamSelectScreen";
import GameSettingsOverlay from "@/components/GameSettingsOverlay";
import MainScreen from "@/components/front/MainScreen";
import TeamIntro from "@/components/front/TeamIntro";
import TutorialScreen from "@/components/front/TutorialScreen";
import LocationIndicator from "@/components/LocationIndicator";
import BackGateCourtyardScene from "@/components/scenes/BackGateCourtyardScene";
import ChunwolRoomScene from "@/components/scenes/ChunwolRoomScene";
import DolsoeQuartersScene from "@/components/scenes/DolsoeQuartersScene";
import FieldOneScene from "@/components/scenes/FieldOneScene";
import InterrogationScreen from "@/components/scenes/InterrogationScreen";
import MagicSchoolScene from "@/components/scenes/MagicSchoolScene";
import MudeokServantRoomScene from "@/components/scenes/MudeokServantRoomScene";
import SpaceStationScene from "@/components/scenes/SpaceStationScene";
import YoomunseokSarangbangScene from "@/components/scenes/YoomunseokSarangbangScene";
import { magicSchoolScenes, spaceStationScenes } from "@/lib/gameData";
import { STARTABLE_SCREENS } from "@/lib/gameState";

const CONTENT_SCRIPT = "/samunmong/content.js";
const PROTOTYPE_SCRIPT = "/samunmong/prototype.js";

type GameShellProps = {
  initialScreen?: string;
  initialTheme?: "magicSchool" | "spaceStation";
};

function ensureRequestedStartScreen(initialScreen?: string) {
  const startScreen = new URLSearchParams(window.location.search).get("start") || initialScreen;
  if (!startScreen || !STARTABLE_SCREENS.has(startScreen)) return;

  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.toggle("active", screen.id === startScreen);
  });
  document.querySelector(".game-shell")?.removeAttribute("data-start-screen");
  window.dispatchEvent(new CustomEvent("samunmong:screen-change", { detail: { screenId: startScreen } }));
}

export default function GameShell({ initialScreen, initialTheme }: GameShellProps) {
  const skipIntro = Boolean(initialScreen);

  useEffect(() => {
    const syncGameScale = () => {
      const viewport = document.querySelector<HTMLElement>(".game-viewport");
      if (!viewport) return;

      const baseWidth = 1600;
      const baseHeight = 900;
      const scale = Math.min(window.innerWidth / baseWidth, window.innerHeight / baseHeight, 1);
      viewport.style.setProperty("--game-scale", String(scale));
    };

    syncGameScale();
    window.addEventListener("resize", syncGameScale);

    return () => {
      window.removeEventListener("resize", syncGameScale);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadedScripts: HTMLScriptElement[] = [];
    if (initialTheme) {
      window.localStorage.setItem("samunmong-current-theme", initialTheme);
    } else if (initialScreen?.startsWith("magic")) {
      window.localStorage.setItem("samunmong-current-theme", "magicSchool");
    }

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
  }, [initialScreen, initialTheme]);

  return (
    <div className="game-viewport">
      <main className="game-shell" data-start-screen={initialScreen} data-initial-theme={initialTheme}>
        <TeamIntro disabled={skipIntro} />
        <MainScreen />
        <TutorialScreen />
        <DreamSelectScreen />
        <BriefingScreen initialTheme={initialTheme} />
        <FieldOneScene />
        <ChunwolRoomScene />
        <MudeokServantRoomScene />
        <YoomunseokSarangbangScene />
        <DolsoeQuartersScene />
        <BackGateCourtyardScene />
        {magicSchoolScenes.map((scene) => (
          <MagicSchoolScene scene={scene} key={scene.id} />
        ))}
        {spaceStationScenes.map((scene) => (
          <SpaceStationScene scene={scene} key={scene.id} />
        ))}
        <InterrogationScreen initialTheme={initialTheme} />
        <LocationIndicator initialScreen={initialScreen} initialTheme={initialTheme} />
        <GameSettingsOverlay />
        <ButtonGuideLayer />
      </main>
    </div>
  );
}
