import type { Metadata } from "next";
import "./game.css";
import "./space-station.css";
import "./globals.css";
import "./magic-briefing-v2.css";

export const metadata: Metadata = {
  title: "삼운몽: 세 개의 꿈",
  description: "조선시대 꿈속 사건을 조사하는 추리 게임 프로토타입"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
