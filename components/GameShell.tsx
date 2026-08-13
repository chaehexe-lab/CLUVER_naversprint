"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
const MAIN_SCREEN = "mainScreen";

type GameShellProps = {
  initialScreen?: string;
  initialTheme?: "magicSchool" | "spaceStation";
};

function requestScreen(screenId: string) {
  window.dispatchEvent(
    new CustomEvent("samunmong:screen-request", {
      cancelable: true,
      detail: { screenId }
    })
  );
}

function ensureRequestedStartScreen(initialScreen?: string) {
  const startScreen = new URLSearchParams(window.location.search).get("start") || initialScreen;
  if (!startScreen || !STARTABLE_SCREENS.has(startScreen)) return;

  document.querySelector(".game-shell")?.removeAttribute("data-start-screen");
  requestScreen(startScreen);
}

function ActiveInvestigationScene({ screenId }: { screenId: string }) {
  if (screenId === "fieldOne") return <FieldOneScene />;
  if (screenId === "chunwolRoom") return <ChunwolRoomScene />;
  if (screenId === "mudeokServantRoom") return <MudeokServantRoomScene />;
  if (screenId === "yoomunseokSarangbang") return <YoomunseokSarangbangScene />;
  if (screenId === "dolsoeQuarters") return <DolsoeQuartersScene />;
  if (screenId === "backGateCourtyard") return <BackGateCourtyardScene />;

  const magicScene = magicSchoolScenes.find((scene) => scene.id === screenId);
  if (magicScene) return <MagicSchoolScene scene={magicScene} />;

  const spaceScene = spaceStationScenes.find((scene) => scene.id === screenId);
  return spaceScene ? <SpaceStationScene scene={spaceScene} /> : null;
}

export default function GameShell({ initialScreen, initialTheme }: GameShellProps) {
  const router = useRouter();
  const skipIntro = Boolean(initialScreen);
  const [currentScreen, setCurrentScreen] = useState(
    initialScreen && STARTABLE_SCREENS.has(initialScreen) ? initialScreen : MAIN_SCREEN
  );

  useEffect(() => {
    const navigationWindow = window as Window & { samunmongNavigate?: (href: string) => void };
    const navigate = (href: string) => router.push(href);
    navigationWindow.samunmongNavigate = navigate;

    return () => {
      if (navigationWindow.samunmongNavigate === navigate) {
        delete navigationWindow.samunmongNavigate;
      }
    };
  }, [router]);

  useEffect(() => {
    const handleScreenRequest = (event: Event) => {
      const screenEvent = event as CustomEvent<{ screenId?: string }>;
      const screenId = screenEvent.detail?.screenId;
      if (!screenId || (screenId !== MAIN_SCREEN && !STARTABLE_SCREENS.has(screenId))) return;

      event.preventDefault();
      setCurrentScreen(screenId);
    };

    window.addEventListener("samunmong:screen-request", handleScreenRequest);
    return () => window.removeEventListener("samunmong:screen-request", handleScreenRequest);
  }, []);

  useLayoutEffect(() => {
    document.querySelectorAll(".screen").forEach((screen) => {
      screen.classList.toggle("active", screen.id === currentScreen);
    });
    window.dispatchEvent(
      new CustomEvent("samunmong:screen-change", { detail: { screenId: currentScreen } })
    );
  }, [currentScreen]);

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
    } else if (initialScreen?.startsWith("space")) {
      window.localStorage.setItem("samunmong-current-theme", "spaceStation");
    }

    const loadScript = (src: string) =>
      new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
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
    <div
      className="game-viewport"
      ref={(viewport) => {
        if (!viewport) return;
        const scale = Math.min(window.innerWidth / 1600, window.innerHeight / 900, 1);
        viewport.style.setProperty("--game-scale", String(scale));
      }}
    >
      <main className="game-shell" data-start-screen={initialScreen} data-initial-theme={initialTheme}>
        <TeamIntro disabled={skipIntro} />
        <MainScreen active={currentScreen === MAIN_SCREEN} />
        <TutorialScreen />
        <DreamSelectScreen />
        <BriefingScreen initialTheme={initialTheme} />
        <ActiveInvestigationScene screenId={currentScreen} />
        <InterrogationScreen initialTheme={initialTheme} />
        <LocationIndicator initialScreen={initialScreen} initialTheme={initialTheme} />
        <GameSettingsOverlay />
        <ButtonGuideLayer />
      </main>
    </div>
  );
}
