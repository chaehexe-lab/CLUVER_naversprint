"use client";

import { useEffect, useState } from "react";
import { screenLocationLabels, type ScreenLocationId } from "@/lib/gameState";

type LocationIndicatorProps = {
  initialScreen?: string;
  initialTheme?: "magicSchool";
};

const LOCATION_KICKER = "\uD604\uC7AC \uC704\uCE58";
const HIDDEN_LOCATION_SCREENS = new Set(["mainScreen", "tutorialScreen", "dreamScreen", "briefingScreen"]);

function isKnownLocation(screenId?: string | null): screenId is ScreenLocationId {
  return Boolean(screenId && screenId in screenLocationLabels);
}

function getActiveScreenId() {
  return document.querySelector(".screen.active")?.id;
}

export default function LocationIndicator({ initialScreen, initialTheme }: LocationIndicatorProps) {
  const [activeScreen, setActiveScreen] = useState<string>(initialScreen ?? "mainScreen");
  const currentLocation = isKnownLocation(activeScreen) && !HIDDEN_LOCATION_SCREENS.has(activeScreen)
    ? initialTheme === "magicSchool" && activeScreen === "interrogationScreen"
      ? "교무 조사실"
      : screenLocationLabels[activeScreen]
    : null;

  useEffect(() => {
    const syncActiveScreen = () => {
      const screenId = getActiveScreenId();
      if (screenId) {
        setActiveScreen(screenId);
      }
    };

    syncActiveScreen();

    const shell = document.querySelector(".game-shell");
    if (!shell) return undefined;

    const observer = new MutationObserver(syncActiveScreen);
    observer.observe(shell, {
      attributes: true,
      attributeFilter: ["class"],
      subtree: true
    });

    return () => observer.disconnect();
  }, []);

  if (!currentLocation) return null;

  return (
    <aside className="hud location-indicator" aria-label={LOCATION_KICKER} aria-live="polite">
      <span className="location-indicator__kicker">{LOCATION_KICKER}</span>
      <strong>{currentLocation}</strong>
    </aside>
  );
}
