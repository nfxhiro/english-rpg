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

const APP_URL = "https://eiken.nfx.co.jp";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: "EIKEN QUEST FRONTIER｜英検5級〜準2級対応の英語学習RPG",
  description:
    "EIKEN QUEST FRONTIERは、英検5級・4級・3級・準2級の単語と熟語を、RPGのクエスト形式で楽しく学べる英語学習アプリです。問題に答えてモンスターを倒し、ゴールドを集め、カードや装備を手に入れながら英語力を高めていきます。",
  keywords: [
    "英検",
    "英検5級",
    "英検4級",
    "英検3級",
    "英検準2級",
    "英語学習",
    "英単語",
    "熟語",
    "RPG",
    "英語ゲーム",
    "小学生英語",
    "英検対策",
    "英語学習アプリ",
  ],
  alternates: {
    canonical: `${APP_URL}/`,
  },
  openGraph: {
    title: "EIKEN QUEST FRONTIER｜英検対応の英語学習RPG",
    description:
      "英検5級〜準2級の単語・熟語を、クエスト形式で楽しく学べる英語学習RPG。小学生から大人まで、ゲーム感覚で英検対策ができます。",
    url: `${APP_URL}/`,
    siteName: "EIKEN QUEST FRONTIER",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "EIKEN QUEST FRONTIER",
      },
    ],
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EIKEN QUEST FRONTIER｜英検対応の英語学習RPG",
    description:
      "英検5級〜準2級の単語・熟語を、ゲーム感覚で楽しく学べる英語学習RPG。",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalApplication",
  name: "EIKEN QUEST FRONTIER",
  applicationCategory: "EducationalApplication",
  operatingSystem: "Web",
  url: `${APP_URL}/`,
  description:
    "英検5級〜準2級の単語・熟語を、RPG形式で楽しく学べる英語学習アプリ",
  inLanguage: "ja",
  publisher: {
    "@type": "Organization",
    name: "New Frontier Inc.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={notoSansJP.variable} data-scroll-behavior="smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <StyledJsxRegistry>{children}</StyledJsxRegistry>
        <GlobalBgmButton />
      </body>
    </html>
  );
}
