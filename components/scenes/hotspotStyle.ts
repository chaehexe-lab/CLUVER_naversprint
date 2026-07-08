import type { CSSProperties } from "react";
import type { SceneHotspot } from "@/lib/gameTypes";

export type HotspotStyle = CSSProperties & {
  "--x": string;
  "--y": string;
  "--w": string;
  "--h": string;
  "--clip"?: string;
  "--radius"?: string;
  "--rot"?: string;
};

export function hotspotStyle(hotspot: SceneHotspot): HotspotStyle {
  return {
    "--x": hotspot.x,
    "--y": hotspot.y,
    "--w": hotspot.w,
    "--h": hotspot.h,
    "--clip": hotspot.clipPath,
    "--radius": hotspot.radius,
    "--rot": hotspot.rot
  };
}
