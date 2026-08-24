import type { Metadata } from "next";
import "./game.css";
import "./globals.css";

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
    <html lang="ko">
      <body>
        {children}
        <script src="/samunmong/content.js?v=20260824-evidence-scene-v3" />
        <script src="/samunmong/prototype.js?v=20260824-evidence-popup-v114" />
      </body>
    </html>
  );
}
