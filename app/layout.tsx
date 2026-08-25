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
      <body>{children}</body>
    </html>
  );
}
