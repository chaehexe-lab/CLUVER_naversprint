"use client";

import { useEffect, useLayoutEffect, useState, type ComponentType, type MouseEvent } from "react";
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
import MagicUnlockDoorScene from "@/components/scenes/MagicUnlockDoorScene";
import MudeokServantRoomScene from "@/components/scenes/MudeokServantRoomScene";
import SpaceStationScene from "@/components/scenes/SpaceStationScene";
import YoomunseokSarangbangScene from "@/components/scenes/YoomunseokSarangbangScene";
import { magicSchoolScenes, spaceStationScenes } from "@/lib/gameData";
import { spaceStationRuntimeConfig } from "@/lib/spaceStationTheme";
import { STARTABLE_SCREENS } from "@/lib/gameState";
import {
  getSpaceStationRoute,
  getSpaceStationScreen,
  normalizeSpaceStationHref
} from "@/lib/spaceStationRoutes";
import {
  getThemeEntryHref,
  getThemeForScreen,
  normalizeGameTheme,
  type GameTheme
} from "@/lib/gameTheme";

const CONTENT_SCRIPT = "/samunmong/content.js?v=20260824-evidence-scene-v3";
const PROTOTYPE_SCRIPT = "/samunmong/prototype.js?v=20260831-signed-progress-v134";
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
  initialTheme?: GameTheme;
  routeMode?: "spaceStation";
};

function getThemeFromHref(href: string): GameTheme | undefined {
  const destination = new URL(href, window.location.href);
  if (destination.pathname.startsWith("/space-station")) return "spaceStation";
  const requestedTheme = destination.searchParams.get("theme");
  if (requestedTheme === "joseon" || requestedTheme === "magicSchool" || requestedTheme === "spaceStation") {
    return requestedTheme;
  }

  const requestedScreen = destination.searchParams.get("start") ?? "";
  return getThemeForScreen(requestedScreen);
}

function requestScreen(screenId: string) {
  window.dispatchEvent(
    new CustomEvent("samunmong:screen-request", {
      cancelable: true,
      detail: { screenId }
    })
  );
}

function startMagicBriefingAudio(event: MouseEvent<HTMLDivElement>) {
  const target = event.target;
  if (!(target instanceof Element) || !target.closest("#chooseMagicSchool")) return;

  const alarmAudio = new Audio("/samunmong/sound/sfx/magic-school-alarm.mp3");
  const fireAudio = new Audio("/samunmong/sound/sfx/magic-school-fire.mp3");
  alarmAudio.volume = 0.62;
  fireAudio.volume = 0.42;
  fireAudio.loop = true;
  const audioWindow = window as Window & {
    __samunmongMagicIntroAudio?: { alarmAudio: HTMLAudioElement; fireAudio: HTMLAudioElement };
  };
  audioWindow.__samunmongMagicIntroAudio?.alarmAudio.pause();
  audioWindow.__samunmongMagicIntroAudio?.fireAudio.pause();
  audioWindow.__samunmongMagicIntroAudio = { alarmAudio, fireAudio };
  void alarmAudio.play().catch(() => undefined);
  void fireAudio.play().catch(() => undefined);
}

function ensureRequestedStartScreen(initialScreen?: string) {
  const startScreen = new URLSearchParams(window.location.search).get("start") || initialScreen;
  if (!startScreen || !STARTABLE_SCREENS.has(startScreen)) return;

  requestScreen(startScreen);
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.toggle("active", screen.id === startScreen);
  });
  window.setTimeout(() => {
    document.querySelector(".game-shell")?.removeAttribute("data-start-screen");
  }, 0);
}

function ActiveInvestigationScene({ screenId }: { screenId: string }) {
  if (screenId === "magicUnlockDoor") return <MagicUnlockDoorScene />;

  const InvestigationComponent = INVESTIGATION_SCENE_COMPONENTS[screenId];
  if (InvestigationComponent) return <InvestigationComponent />;

  const magicScene = MAGIC_SCENES_BY_ID.get(screenId);
  if (magicScene) return <MagicSchoolScene key={magicScene.id} scene={magicScene} />;

  const spaceScene = SPACE_SCENES_BY_ID.get(screenId);
  return spaceScene ? <SpaceStationScene key={spaceScene.id} scene={spaceScene} /> : null;
}

export default function GameShell({ initialScreen, initialTheme, routeMode }: GameShellProps) {
  const router = useRouter();
  const skipIntro = Boolean(initialScreen);
  const renderedTheme = initialTheme ?? getThemeForScreen(initialScreen) ?? "joseon";
  const [currentScreen, setCurrentScreen] = useState(
    initialScreen && STARTABLE_SCREENS.has(initialScreen) ? initialScreen : MAIN_SCREEN
  );

  useLayoutEffect(() => {
    document.documentElement.dataset.samunmongTheme = renderedTheme;
    window.localStorage.setItem("samunmong-current-theme", renderedTheme);
  }, [renderedTheme]);

  useLayoutEffect(() => {
    const requestedStart = new URLSearchParams(window.location.search).get("start") || initialScreen;
    if (requestedStart && STARTABLE_SCREENS.has(requestedStart)) {
      setCurrentScreen(requestedStart);
    }
  }, [initialScreen]);

  useEffect(() => {
    const navigationWindow = window as Window & { samunmongNavigate?: (href: string) => void };
    const navigate = (href: string) => {
      if (routeMode === "spaceStation") {
        const normalizedHref = normalizeSpaceStationHref(href, window.location.href);
        if (normalizedHref !== href) {
          window.location.assign(normalizedHref);
          return;
        }
      }
      const destinationTheme = getThemeFromHref(href);
      const mountedTheme = normalizeGameTheme(document.documentElement.dataset.samunmongTheme);
      const hasExplicitTheme = new URL(href, window.location.href).searchParams.has("theme");

      // prototype.js owns global listeners and theme-specific data. A full reload is
      // required when dreams change so listeners from the previous theme cannot survive.
      if (destinationTheme && (destinationTheme !== mountedTheme || hasExplicitTheme)) {
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
  }, [routeMode, router]);

  useEffect(() => {
    const handleScreenRequest = (event: Event) => {
      const screenEvent = event as CustomEvent<{ screenId?: string }>;
      const screenId = screenEvent.detail?.screenId;
      if (!screenId || (screenId !== MAIN_SCREEN && !STARTABLE_SCREENS.has(screenId))) return;

      const destinationTheme = getThemeForScreen(screenId);
      const mountedTheme = normalizeGameTheme(document.documentElement.dataset.samunmongTheme);
      if (destinationTheme && destinationTheme !== mountedTheme) {
        event.preventDefault();
        window.location.assign(getThemeEntryHref(screenId, destinationTheme));
        return;
      }

      event.preventDefault();
      if (routeMode === "spaceStation") {
        const route = getSpaceStationRoute(screenId);
        if (route && window.location.pathname !== route) {
          window.history.pushState({ samunmongScreen: screenId }, "", route);
        }
      }
      setCurrentScreen(screenId);
    };

    window.addEventListener("samunmong:screen-request", handleScreenRequest);
    return () => window.removeEventListener("samunmong:screen-request", handleScreenRequest);
  }, [routeMode]);

  useEffect(() => {
    if (routeMode !== "spaceStation") return;

    const handlePopState = () => {
      const screenId = getSpaceStationScreen(window.location.pathname);
      if (screenId) setCurrentScreen(screenId);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [routeMode]);

  useLayoutEffect(() => {
    if (routeMode === "spaceStation") {
      const briefingScreen = document.querySelector<HTMLElement>("#briefingScreen");
      briefingScreen?.classList.remove("journal-overlay-open");
      briefingScreen?.querySelector<HTMLElement>(".briefing-card")?.classList.remove("journal-mode");
      window.dispatchEvent(new CustomEvent("samunmong:briefing-journal-close"));
    }
    document.querySelectorAll(".screen").forEach((screen) => {
      screen.classList.toggle("active", screen.id === currentScreen);
    });
    if (currentScreen === MAIN_SCREEN || routeMode === "spaceStation") {
      document.querySelectorAll<HTMLElement>(".global-panel").forEach((panel) => {
        panel.classList.remove("show", "closing");
        panel.setAttribute("aria-hidden", "true");
      });
      document.querySelectorAll<HTMLElement>(
        "#globalOverlay, #overlay, .space-evidence-detail-overlay, .space-analysis-overlay, .space-keycard-terminal-overlay, .space-power-access-overlay"
      ).forEach((overlay) => {
        overlay.classList.remove("show");
        overlay.setAttribute("aria-hidden", "true");
      });
      if (routeMode === "spaceStation") {
        document.querySelectorAll<HTMLElement>(
          ".space-evidence-detail, .space-eva-record-dialog, .space-analysis-panel, .space-keycard-terminal-panel, .space-power-access-panel"
        ).forEach((panel) => {
          panel.classList.remove("show");
          panel.setAttribute("aria-hidden", "true");
        });
        document.querySelectorAll<HTMLElement>(
          "#spacePowerAccessCursor, #spaceKeycardTerminalCursor, #spaceAnalysisSampleCursor"
        ).forEach((cursor) => cursor.classList.remove("show"));
      }
      document.querySelector<HTMLElement>("#evidenceBagPop")?.classList.remove("open", "closing");
      document.querySelectorAll<HTMLElement>(
        ".inspect-pop, .toast, .new-fact-toast, #toolResultPopup, #toolReactionLayer"
      ).forEach((popup) => {
        popup.classList.remove("show", "open", "closing", "success", "wrong");
        popup.setAttribute("aria-hidden", "true");
      });
      document.querySelectorAll<HTMLElement>(".note-drawer").forEach((drawer) => {
        drawer.classList.remove("open");
        drawer.setAttribute("aria-hidden", "true");
      });
      document.body.classList.remove("tool-cursor-active");
    }
    window.dispatchEvent(
      new CustomEvent("samunmong:screen-change", { detail: { screenId: currentScreen } })
    );
  }, [currentScreen, routeMode]);

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
    const screenTheme = getThemeForScreen(initialScreen);
    if (screenTheme) {
      window.localStorage.setItem("samunmong-current-theme", screenTheme);
    } else if (requestedTheme === "joseon" || requestedTheme === "magicSchool" || requestedTheme === "spaceStation") {
      window.localStorage.setItem("samunmong-current-theme", requestedTheme);
    } else if (initialTheme) {
      window.localStorage.setItem("samunmong-current-theme", initialTheme);
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
      (window as Window & { SAMUNMONG_SPACE_STATION?: typeof spaceStationRuntimeConfig }).SAMUNMONG_SPACE_STATION = spaceStationRuntimeConfig;
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
    <>
    <script
      dangerouslySetInnerHTML={{
        __html: `(() => {
          const params = new URLSearchParams(window.location.search);
          const requestedTheme = params.get("theme");
          const theme = ["joseon", "magicSchool", "spaceStation"].includes(requestedTheme)
            ? requestedTheme
            : ${JSON.stringify(renderedTheme)};
          document.documentElement.dataset.samunmongTheme = theme;
        })();`
      }}
    />
    <script
      id="spaceStationRuntimeData"
      type="application/json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(spaceStationRuntimeConfig).replace(/</g, "\\u003c") }}
    />
    <div
      className="game-viewport"
      onClickCapture={startMagicBriefingAudio}
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
      <main className="game-shell" data-start-screen={initialScreen} data-initial-theme={renderedTheme}>
        <TeamIntro disabled={skipIntro} />
        <MainScreen active={currentScreen === MAIN_SCREEN} />
        <TutorialScreen />
        <DreamSelectScreen />
        <BriefingScreen initialTheme={renderedTheme} active={currentScreen === "briefingScreen"} />
        <ActiveInvestigationScene screenId={currentScreen} />
        <InterrogationScreen initialTheme={renderedTheme} />
        <LocationIndicator initialScreen={initialScreen} initialTheme={renderedTheme} />
        <GameSettingsOverlay />
        <ButtonGuideLayer />
        <CinematicEvidenceFeedback />
      </main>
    </div>
    </>
  );
}
