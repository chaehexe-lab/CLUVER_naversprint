import type { Metadata } from "next";
import type { ReactNode } from "react";
import SpaceStationShell from "@/components/space-station/SpaceStationShell";

export const metadata: Metadata = {
  title: "오르빗-13 사건 | 삼운몽",
  description: "우주정거장 오르빗-13 의문사 사건 조사"
};

export default function SpaceStationLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-station-app-layout">
      <SpaceStationShell>{children}</SpaceStationShell>
    </div>
  );
}
