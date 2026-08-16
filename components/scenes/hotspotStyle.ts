import type { CSSProperties } from "react";
import type { SceneHotspot, SceneProp } from "@/lib/gameTypes";

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

export type PropStyle = CSSProperties & {
  "--x": string;
  "--y": string;
  "--w": string;
  "--rot"?: string;
};

export function propStyle(prop: SceneProp): PropStyle {
  return {
    "--x": prop.x,
    "--y": prop.y,
    "--w": prop.w,
    "--rot": prop.rot
  };
}
