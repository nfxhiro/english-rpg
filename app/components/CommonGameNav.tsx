"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MouseEvent } from "react";

const NAV_ICON_ASSETS = {
  home: {
    src: "/home-icons/home-nav-clean.png",
    width: 964,
    height: 1072,
  },
  quest: {
    src: "/home-icons/quest.png",
    width: 918,
    height: 1060,
  },
  pack: {
    src: "/home-icons/pack.png",
    width: 709,
    height: 1179,
  },
  cards: {
    src: "/home-icons/book.png",
    width: 1229,
    height: 1042,
  },
  shop: {
    src: "/home-icons/equip.png",
    width: 1015,
    height: 1034,
  },
  words: {
    src: "/home-icons/written.png",
    width: 1254,
    height: 1254,
  },
  hero: {
    src: "/home-icons/hero.png",
    width: 896,
    height: 1163,
  },
} as const;

const GAME_NAV_ITEMS = [
  {
    key: "home",
    label: "ホーム",
    href: "/",
    match: ["/"],
    icon: NAV_ICON_ASSETS.home,
  },
  {
    key: "quest",
    label: "クエスト",
    href: "/quiz",
    match: ["/quiz"],
    icon: NAV_ICON_ASSETS.quest,
  },
  {
    key: "pack",
    label: "パック",
    href: "/pack",
    match: ["/pack"],
    icon: NAV_ICON_ASSETS.pack,
  },
  {
    key: "cards",
    label: "図鑑",
    href: "/cards",
    match: ["/cards"],
    icon: NAV_ICON_ASSETS.cards,
  },
  {
    key: "shop",
    label: "装備ショップ",
    href: "/shop",
    match: ["/shop"],
    icon: NAV_ICON_ASSETS.shop,
  },
  {
    key: "words",
    label: "単語トレーニング",
    href: "/words",
    match: ["/words"],
    icon: NAV_ICON_ASSETS.words,
  },
  {
    key: "hero",
    label: "主人公",
    href: "/hero",
    match: ["/hero"],
    icon: NAV_ICON_ASSETS.hero,
  },
] as const;

function isActivePath(pathname: string, matchPaths: readonly string[]) {
  return matchPaths.some((matchPath) => {
    if (matchPath === "/") return pathname === "/";
    return pathname === matchPath || pathname.startsWith(`${matchPath}/`);
  });
}

export default function CommonGameNav({
  onQuestClick,
}: {
  onQuestClick?: () => void;
}) {
  const pathname = usePathname();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>, key: string) => {
    if (key !== "quest" || !onQuestClick) return;
    event.preventDefault();
    onQuestClick();
  };

  return (
    <nav className="common-game-nav" aria-label="共通ゲームナビゲーション">
      {GAME_NAV_ITEMS.map((item) => {
        const isActive = isActivePath(pathname, item.match);

        return (
          <Link
            key={item.key}
            href={item.href}
            className={`common-game-nav__item${isActive ? " is-active" : ""}`}
            aria-label={`${item.label}へ移動`}
            aria-current={isActive ? "page" : undefined}
            onClick={(event) => handleClick(event, item.key)}
          >
            <span className="common-game-nav__icon">
              <Image
                src={item.icon.src}
                alt={`${item.label}アイコン`}
                width={item.icon.width}
                height={item.icon.height}
                sizes="32px"
                className="common-game-nav__image"
              />
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
