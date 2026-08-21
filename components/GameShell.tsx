"use client";

import { useEffect, useLayoutEffect, useState, type ComponentType } from "react";
import { useRouter } from "next/navigation";
import BriefingScreen from "@/components/front/BriefingScreen";
import ButtonGuideLayer from "@/components/ButtonGuideLayer";
import DreamSelectScreen from "@/components/front/DreamSelectScreen";
import GameSettingsOverlay from "@/components/GameSettingsOverlay";
import MainScreen from "@/components/front/MainScreen";
import TeamIntro from "@/components/front/TeamIntro";
import TutorialScreen from "@/components/front/TutorialScreen";
import LocationIndicator from "@/components/LocationIndicator";
import CinematicEvidenceFeedback from "@/components/effects/CinematicEvidenceFeedback";
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

const CONTENT_SCRIPT = "/samunmong/content.js?v=20260816-interactions-v91";
const PROTOTYPE_SCRIPT = "/samunmong/prototype.js?v=20260822-3d-evidence-v111";
const MAIN_SCREEN = "mainScreen";

const INVESTIGATION_SCENE_COMPONENTS: Record<string, ComponentType> = {
  fieldOne: FieldOneScene,
  chunwolRoom: ChunwolRoomScene,
  mudeokServantRoom: MudeokServantRoomScene,
  yoomunseokSarangbang: YoomunseokSarangbangScene,
  dolsoeQuarters: DolsoeQuartersScene,
  backGateCourtyard: BackGateCourtyardScene
};

const MAGIC_SCENES_BY_ID = new Map<string, (typeof magicSchoolScenes)[number]>(
  magicSchoolScenes.map((scene) => [scene.id, scene])
);
const SPACE_SCENES_BY_ID = new Map<string, (typeof spaceStationScenes)[number]>(
  spaceStationScenes.map((scene) => [scene.id, scene])
);

type GameShellProps = {
  initialScreen?: string;
  initialTheme?: "magicSchool" | "spaceStation";
};

type GameTheme = "joseon" | "magicSchool" | "spaceStation";

function normalizeTheme(theme: string | null | undefined): GameTheme {
  if (theme === "magicSchool" || theme === "spaceStation") return theme;
  return "joseon";
}

function getThemeFromHref(href: string): GameTheme | undefined {
  const destination = new URL(href, window.location.href);
  const requestedTheme = destination.searchParams.get("theme");
  if (requestedTheme === "joseon" || requestedTheme === "magicSchool" || requestedTheme === "spaceStation") {
    return requestedTheme;
  }

  const requestedScreen = destination.searchParams.get("start") ?? "";
  if (requestedScreen.startsWith("magic")) return "magicSchool";
  if (requestedScreen.startsWith("space")) return "spaceStation";
  if (INVESTIGATION_SCENE_COMPONENTS[requestedScreen]) return "joseon";
  return undefined;
}

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
  const InvestigationComponent = INVESTIGATION_SCENE_COMPONENTS[screenId];
  if (InvestigationComponent) return <InvestigationComponent />;

  const magicScene = MAGIC_SCENES_BY_ID.get(screenId);
  if (magicScene) return <MagicSchoolScene scene={magicScene} />;

  const spaceScene = SPACE_SCENES_BY_ID.get(screenId);
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
    const navigate = (href: string) => {
      const destinationTheme = getThemeFromHref(href);
      const mountedTheme = normalizeTheme(document.documentElement.dataset.samunmongTheme);

      // prototype.js owns global listeners and theme-specific data. A full reload is
      // required when dreams change so listeners from the previous theme cannot survive.
      if (destinationTheme && destinationTheme !== mountedTheme) {
        window.location.assign(href);
        return;
      }

      router.push(href);
    };
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
    if (currentScreen === MAIN_SCREEN) {
      document.querySelectorAll<HTMLElement>(".global-panel").forEach((panel) => {
        panel.classList.remove("show", "closing");
        panel.setAttribute("aria-hidden", "true");
      });
      document.querySelectorAll<HTMLElement>("#globalOverlay, #overlay").forEach((overlay) => {
        overlay.classList.remove("show");
      });
      document.querySelector<HTMLElement>("#evidenceBagPop")?.classList.remove("open", "closing");
      document.body.classList.remove("tool-cursor-active");
    }
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
    const requestedTheme = new URLSearchParams(window.location.search).get("theme");
    if (requestedTheme === "joseon" || requestedTheme === "magicSchool" || requestedTheme === "spaceStation") {
      window.localStorage.setItem("samunmong-current-theme", requestedTheme);
    } else if (initialTheme) {
      window.localStorage.setItem("samunmong-current-theme", initialTheme);
    } else if (initialScreen?.startsWith("magic")) {
      window.localStorage.setItem("samunmong-current-theme", "magicSchool");
    } else if (initialScreen?.startsWith("space")) {
      window.localStorage.setItem("samunmong-current-theme", "spaceStation");
    } else if (initialScreen && INVESTIGATION_SCENE_COMPONENTS[initialScreen]) {
      window.localStorage.setItem("samunmong-current-theme", "joseon");
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
      onDragStartCapture={(event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement) || !target.closest('[draggable="true"]')) {
          event.preventDefault();
        }
      }}
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
        <CinematicEvidenceFeedback />
      </main>
    </div>
  );
}
