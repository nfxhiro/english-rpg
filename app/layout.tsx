import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import StyledJsxRegistry from "./registry";
import GlobalBgmButton from "./components/GlobalBgmButton";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-noto-sans-jp",
  display: "swap",
});

export const metadata: Metadata = {
  title: "英検クエスト フロンティア",
  description: "英検単語で冒険する、カード学習RPG",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={notoSansJP.variable} data-scroll-behavior="smooth">
      <body>
        <StyledJsxRegistry>{children}</StyledJsxRegistry>
        <GlobalBgmButton />
      </body>
    </html>
  );
}
