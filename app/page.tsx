"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  getHeroExpProgress,
  HeroStatus,
  loadHeroStatus,
} from "../data/hero";
import {
  loadShopState,
  ShopState,
} from "../data/shop";
import {
  EarnedCard,
  getMonsterCardById,
  monsterCards,
  MonsterCard,
} from "../data/cards";

type OwnedMonsterCard = {
  card: MonsterCard;
  earnedCard: EarnedCard;
};

const HOME_ICON_ASSETS = {
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
  book: {
    src: "/home-icons/book.png",
    width: 1229,
    height: 1042,
  },
  equip: {
    src: "/home-icons/equip.png",
    width: 1015,
    height: 1034,
  },
  hero: {
    src: "/home-icons/hero.png",
    width: 896,
    height: 1163,
  },
  cards: {
    src: "/home-icons/cards.png",
    width: 1254,
    height: 787,
  },
  written: {
    src: "/home-icons/written.png",
    width: 1254,
    height: 1254,
  },
} as const;

type HomeIconName = keyof typeof HOME_ICON_ASSETS;

function HomeIcon({
  name,
  className,
}: {
  name: HomeIconName;
  className: string;
}) {
  const icon = HOME_ICON_ASSETS[name];

  return (
    <Image
      src={icon.src}
      alt=""
      width={icon.width}
      height={icon.height}
      className={className}
      sizes="96px"
      aria-hidden="true"
    />
  );
}

function getCollectionRate(ownedCount: number, totalCount: number) {
  if (totalCount <= 0) return 0;
  if (ownedCount >= totalCount) return 100;

  return Math.floor((ownedCount / totalCount) * 100);
}

function loadEarnedCards(): EarnedCard[] {
  if (typeof window === "undefined") return [];

  try {
    const savedCardsText = localStorage.getItem("earnedCards");
    const parsedCards = savedCardsText ? JSON.parse(savedCardsText) : [];

    if (!Array.isArray(parsedCards)) return [];

    return parsedCards.filter((card) => {
      return typeof card.cardId === "string";
    });
  } catch {
    localStorage.removeItem("earnedCards");
    return [];
  }
}

function loadPackTickets(): number {
  if (typeof window === "undefined") return 0;

  const value = Number(localStorage.getItem("packTickets") ?? "0");
  return Number.isFinite(value) ? value : 0;
}

export default function Home() {
  const [hero, setHero] = useState<HeroStatus | null>(null);
  const [earnedCards, setEarnedCards] = useState<EarnedCard[]>([]);
  const [packTickets, setPackTickets] = useState(0);
  const [shopState, setShopState] = useState<ShopState>({
    selectedTitle: null,
    selectedBackground: null,
    selectedMonsterCardId: null,
  });
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        setHero(loadHeroStatus());
        setEarnedCards(loadEarnedCards());
        setPackTickets(loadPackTickets());
        setShopState(loadShopState());
      } catch (error) {
        console.error("トップページの読み込みに失敗しました:", error);

        localStorage.removeItem("earnedCards");
        localStorage.removeItem("packTickets");

        setHero(loadHeroStatus());
        setEarnedCards([]);
        setPackTickets(0);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const progress = hero ? getHeroExpProgress(hero) : null;

  const ownedMonsterCards = useMemo<OwnedMonsterCard[]>(() => {
    return earnedCards
      .map((earnedCard) => {
        const card = getMonsterCardById(earnedCard.cardId);

        if (!card) return null;

        return {
          card,
          earnedCard,
        };
      })
      .filter((item): item is OwnedMonsterCard => Boolean(item));
  }, [earnedCards]);

  const ownedCount = ownedMonsterCards.length;
  const totalCardCount = monsterCards.length;
  const collectionRate =
    getCollectionRate(ownedCount, totalCardCount);

  const displayTitle = shopState.selectedTitle ?? hero?.title ?? "はじまりの勇者";

  return (
    <main className="home-page">
      <section className="home-shell">
        <div className="hero-panel">
          <div className="hero-copy">
            <div className="eyebrow">
              <span>ENGLISH RPG</span>
            </div>

            <h1>
              <span>英検クエスト</span>
              <span>フロンティア</span>
            </h1>

            <p className="lead">
              英単語のクエストで主人公を育て、強敵に挑む学習RPG。
              迷ったら、まずはクエストへ。
            </p>

            <div className="main-actions">
              <Link href="/quiz" className="primary-action hero-quest-action">
                <span className="hero-quest-copy">
                  <span className="hero-quest-label">Quest</span>
                  <strong>クエスト</strong>
                  <small>問題に挑戦して経験値を獲得</small>
                </span>
                <span className="hero-quest-icon">
                  <HomeIcon name="quest" className="hero-quest-icon-image" />
                </span>
              </Link>
            </div>
          </div>

          <div className="home-monster-showcase" aria-label="英検クエスト フロンティア キービジュアル">
            <div className="home-showcase-card">
              <Image
                src="/english-rpg-home-cutout.png"
                alt="英検クエスト フロンティア 英単語で冒険する学習RPG"
                width={978}
                height={1378}
                className="home-showcase-image"
                sizes="(max-width: 1040px) 216px, 288px"
                priority
              />
            </div>
          </div>
        </div>

        <nav className="home-action-grid" aria-label="メインメニュー">
          <Link href="/pack" className="home-action-card">
            <span className="action-icon">
              <HomeIcon name="pack" className="home-action-icon-image" />
            </span>
            <span className="action-label">{packTickets > 0 ? `${packTickets}枚` : "Pack"}</span>
            <strong>パック</strong>
            <small>チケットでカードを仲間にする</small>
          </Link>

          <Link href="/cards" className="home-action-card">
            <span className="action-icon">
              <HomeIcon name="book" className="home-action-icon-image" />
            </span>
            <span className="action-label">{collectionRate}%</span>
            <strong>カード図鑑</strong>
            <small>仲間にしたカードを確認</small>
          </Link>

          <Link href="/shop" className="home-action-card">
            <span className="action-icon">
              <HomeIcon name="equip" className="home-action-icon-image" />
            </span>
            <span className="action-label">Equip</span>
            <strong>装備ショップ</strong>
            <small>装備を整えてバトルを有利に</small>
          </Link>

          <Link href="/words" className="home-action-card written-card">
            <span className="action-icon written-icon">
              <HomeIcon name="written" className="home-action-icon-image" />
            </span>
            <span className="action-label">Words</span>
            <strong>単語トレーニング</strong>
            <small>単語を見て暗記と筆記へ進む</small>
          </Link>
        </nav>

        <div className="dashboard-grid">
          <section className="panel hero-status-panel">
            <div className="panel-head">
              <div>
                <p>HERO STATUS</p>
                <h2>冒険者の記録</h2>
              </div>
              <span className="panel-icon">
                <HomeIcon name="hero" className="panel-icon-image" />
              </span>
            </div>

            <div className="hero-level-row">
              <div>
                <span>現在の称号</span>
                <strong>{displayTitle}</strong>
              </div>
              <div>
                <span>レベル</span>
                <strong>Lv.{hero?.level ?? 1}</strong>
              </div>
            </div>

            <div className="progress-info">
              <div>
                <span>次のレベル</span>
                <strong>
                  {progress?.isMaxLevel
                    ? "MAX"
                    : `${progress?.currentExp ?? 0} / ${
                        progress?.requiredExp ?? 100
                      } EXP`}
                </strong>
              </div>

              <div className="progress-track">
                <div
                  className="progress-bar hero-exp"
                  style={{ width: `${progress?.percent ?? 0}%` }}
                />
              </div>
            </div>

            <Link href="/hero" className="panel-link">
              主人公を見る
            </Link>
          </section>

        </div>

        <div className="settings-footer">
          <Link href="/settings" className="settings-footer-link">
            <span>⚙️</span>
            <span>設定・データ管理</span>
          </Link>
        </div>

      </section>

      <footer className="site-footer">
        <p className="site-footer-title">EIKEN QUEST FRONTIER</p>
        <p className="site-footer-copy">© 2026 New Frontier Inc. All rights reserved.</p>
      </footer>

      <style>{`
        :root {
          --radius-page-card: 32px;
          --radius-logo-card: 28px;
          --radius-button: 22px;
          --radius-small-card: 20px;
        }

        .home-page {
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
          color: white;
          padding: 28px 28px calc(40px + env(safe-area-inset-bottom));
        }

        .home-page::before,
        .home-page::after {
          content: none;
        }

        .home-shell {
          width: 100%;
          max-width: 1180px;
          margin: 0 auto;
        }

        .hero-panel {
          position: relative;
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(280px, 360px);
          gap: 34px;
          align-items: center;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: var(--radius-page-card);
          padding: 38px;
          background:
            linear-gradient(135deg, rgba(19, 29, 48, 0.96), rgba(15, 20, 33, 0.96) 54%, rgba(13, 34, 36, 0.92));
          box-shadow:
            0 30px 80px rgba(0, 0, 0, 0.38),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
          animation: homeIn 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        @keyframes homeIn {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .hero-panel::before,
        .hero-panel::after,
        .panel::before {
          content: none;
        }

        .hero-copy,
        .panel-head > div,
        .home-action-card {
          min-width: 0;
        }

        .eyebrow {
          width: fit-content;
          max-width: 100%;
          display: inline-flex;
          align-items: center;
          min-height: 34px;
          padding: 0 14px;
          border-radius: 999px;
          border: 1px solid rgba(45, 212, 191, 0.36);
          background: rgba(20, 184, 166, 0.1);
          color: #99f6e4;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .hero-copy h1 {
          margin: 22px 0 0;
          max-width: 760px;
          color: #fff8df;
          font-size: clamp(42px, 6.4vw, 72px);
          line-height: 1.03;
          font-weight: 900;
          letter-spacing: 0;
          overflow-wrap: anywhere;
        }

        .hero-copy h1 span {
          display: inline;
        }

        .hero-copy h1 span + span::before {
          content: " ";
        }

        .lead {
          margin: 20px 0 0;
          max-width: 650px;
          color: #cbd5e1;
          font-size: 16px;
          font-weight: 800;
          line-height: 1.85;
          overflow-wrap: anywhere;
        }

        .main-actions {
          margin-top: 24px;
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          width: min(100%, 560px);
          max-width: 100%;
        }

        .primary-action,
        .secondary-action,
        .panel-link {
          min-height: 64px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border-radius: var(--radius-button);
          text-decoration: none;
          text-align: center;
          font-size: 17px;
          font-weight: 900;
          line-height: 1.25;
          width: 100%;
          max-width: 100%;
          transition:
            transform 0.18s ease,
            border-color 0.18s ease,
            background 0.18s ease,
            box-shadow 0.18s ease;
        }

        .primary-action {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(255, 245, 157, 0.72);
          background:
            radial-gradient(circle at 84% 12%, rgba(251, 191, 36, 0.34), transparent 38%),
            linear-gradient(135deg, rgba(56, 41, 8, 0.96), rgba(40, 26, 10, 0.92) 56%, rgba(18, 20, 38, 0.92));
          color: #f8fafc;
          box-shadow: 0 18px 42px rgba(250, 204, 21, 0.26);
        }

        .hero-quest-action {
          min-height: 148px;
          justify-content: space-between;
          padding: 22px 24px;
          text-align: left;
          border-color: rgba(250, 204, 21, 0.38) !important;
          background:
            radial-gradient(circle at 86% 18%, rgba(250, 204, 21, 0.22), transparent 31%),
            radial-gradient(circle at 14% 100%, rgba(250, 204, 21, 0.18), transparent 38%),
            linear-gradient(145deg, rgba(70, 48, 9, 0.9), rgba(17, 24, 39, 0.96)) !important;
          color: #f8fafc !important;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3) !important;
        }

        .hero-quest-copy {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 7px;
          min-width: 0;
        }

        .hero-quest-label {
          color: #86efac;
          font-size: 13px;
          font-weight: 1000;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .hero-quest-copy strong {
          color: #ffffff;
          font-size: 34px;
          line-height: 1.05;
          font-weight: 1000;
        }

        .hero-quest-copy small {
          color: #e5e7eb;
          font-size: 15px;
          line-height: 1.35;
          font-weight: 900;
        }

        .hero-quest-icon {
          position: relative;
          z-index: 1;
          flex: 0 0 auto;
          width: 116px;
          height: 116px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-right: -4px;
          filter:
            drop-shadow(0 18px 22px rgba(0, 0, 0, 0.46))
            drop-shadow(0 0 18px rgba(250, 204, 21, 0.22));
        }

        .hero-quest-icon-image {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .secondary-action,
        .panel-link {
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.06);
          color: white;
        }

        .primary-action:hover,
        .secondary-action:hover,
        .panel-link:hover,
        .home-action-card:hover {
          transform: translateY(-4px);
        }

        .primary-action:hover {
          box-shadow: 0 22px 50px rgba(250, 204, 21, 0.36);
        }

        .secondary-action:hover {
          border-color: rgba(45, 212, 191, 0.36);
          background: rgba(45, 212, 191, 0.08);
        }

        .main-action-icon {
          flex: 0 0 auto;
          width: 26px;
          height: 26px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          filter: drop-shadow(0 8px 12px rgba(0, 0, 0, 0.3));
        }

        .main-action-icon-image {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .panel-link:hover {
          border-color: rgba(45, 212, 191, 0.36) !important;
          background: rgba(45, 212, 191, 0.08) !important;
        }

        .hero-status-panel .panel-link:hover {
          border-color: rgba(56, 189, 248, 0.38) !important;
          background: rgba(14, 165, 233, 0.12) !important;
        }

        .home-stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
          max-width: 620px;
          margin-top: 18px;
        }

        .home-stats div {
          min-height: 74px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 12px 16px;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.04);
          transition: border-color 0.18s ease, background 0.18s ease;
        }

        .home-stats div:hover {
          border-color: rgba(45, 212, 191, 0.28);
          background: rgba(45, 212, 191, 0.06);
        }

        .home-stats span,
        .panel-head p,
        .action-label,
        .hero-level-row span {
          color: #94a3b8;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .home-stats strong {
          margin-top: 7px;
          color: #fef3c7;
          font-size: 24px;
          line-height: 1;
          font-weight: 900;
        }

        .home-monster-showcase {
          display: flex;
          justify-content: center;
          overflow: visible;
        }

        .home-showcase-card {
          position: relative;
          display: block;
          width: min(100%, 288px);
          filter:
            drop-shadow(0 28px 50px rgba(0, 0, 0, 0.42))
            drop-shadow(0 0 34px rgba(34, 211, 238, 0.16));
        }

        .home-showcase-card::before {
          content: none;
        }

        .home-showcase-image {
          display: block;
          width: 100%;
          height: auto;
        }

        .home-action-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          margin-top: 18px;
          animation: homeIn 0.55s 0.08s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .action-icon.written-icon {
          top: 8px;
          right: 8px;
          width: 86px;
          height: 86px;
          filter:
            drop-shadow(0 14px 18px rgba(0, 0, 0, 0.42))
            drop-shadow(0 0 18px rgba(45, 212, 191, 0.22));
        }

        .written-card {
          background:
            radial-gradient(circle at 80% 20%, rgba(45, 212, 191, 0.12), transparent 50%),
            linear-gradient(145deg, rgba(16, 24, 40, 0.92), rgba(9, 14, 24, 0.95)) !important;
        }

        .written-card:hover {
          border-color: rgba(45, 212, 191, 0.4) !important;
        }

        .home-action-card {
          position: relative;
          min-height: 170px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-small-card);
          padding: 18px;
          text-decoration: none;
          color: white;
          background:
            linear-gradient(145deg, rgba(16, 24, 40, 0.92), rgba(9, 14, 24, 0.95));
          box-shadow: 0 18px 48px rgba(0, 0, 0, 0.28);
          transition:
            transform 0.18s ease,
            border-color 0.18s ease,
            background 0.18s ease,
            box-shadow 0.18s ease;
        }

        .home-action-card::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 0;
          background:
            radial-gradient(circle at 86% 16%, rgba(255, 255, 255, 0.1), transparent 28%),
            radial-gradient(circle at 18% 100%, rgba(45, 212, 191, 0.1), transparent 34%);
          opacity: 0.78;
          pointer-events: none;
        }

        .home-action-card > * {
          position: relative;
          z-index: 1;
        }

        .home-action-card.is-primary {
          border-color: rgba(250, 204, 21, 0.34);
          background:
            radial-gradient(circle at 12% 100%, rgba(250, 204, 21, 0.2), transparent 38%),
            linear-gradient(145deg, rgba(70, 48, 9, 0.86), rgba(17, 24, 39, 0.96));
        }

        .home-action-card:nth-child(1) {
          border-color: rgba(251, 113, 133, 0.28);
          background:
            radial-gradient(circle at 88% 12%, rgba(251, 191, 36, 0.18), transparent 30%),
            radial-gradient(circle at 12% 100%, rgba(251, 113, 133, 0.14), transparent 36%),
            linear-gradient(145deg, rgba(42, 20, 34, 0.9), rgba(11, 17, 29, 0.96));
        }

        .home-action-card:nth-child(2) {
          border-color: rgba(45, 212, 191, 0.28);
          background:
            radial-gradient(circle at 86% 18%, rgba(34, 211, 238, 0.17), transparent 31%),
            radial-gradient(circle at 8% 100%, rgba(52, 211, 153, 0.13), transparent 38%),
            linear-gradient(145deg, rgba(8, 37, 43, 0.9), rgba(10, 16, 28, 0.96));
        }

        .home-action-card:nth-child(3) {
          border-color: rgba(196, 181, 253, 0.25);
          background:
            radial-gradient(circle at 86% 18%, rgba(129, 140, 248, 0.18), transparent 31%),
            radial-gradient(circle at 10% 100%, rgba(244, 114, 182, 0.11), transparent 38%),
            linear-gradient(145deg, rgba(30, 27, 75, 0.76), rgba(10, 16, 28, 0.96));
        }

        .home-action-card.written-card {
          border-color: rgba(45, 212, 191, 0.28);
          background:
            radial-gradient(circle at 80% 20%, rgba(45, 212, 191, 0.12), transparent 50%),
            linear-gradient(145deg, rgba(16, 24, 40, 0.92), rgba(9, 14, 24, 0.95)) !important;
        }

        .home-action-card.is-primary .action-label {
          color: #86efac;
        }

        .home-action-card:nth-child(1) .action-label {
          color: #fda4af;
        }

        .home-action-card:nth-child(2) .action-label {
          color: #67e8f9;
        }

        .home-action-card:nth-child(3) .action-label {
          color: #c4b5fd;
        }

        .home-action-card.written-card .action-label {
          color: #99f6e4;
        }

        .home-action-card:hover {
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.36);
        }

        .home-action-card.is-primary:hover {
          border-color: rgba(250, 204, 21, 0.52);
          box-shadow: 0 24px 60px rgba(250, 204, 21, 0.14), 0 18px 48px rgba(0, 0, 0, 0.34);
        }

        .home-action-card:nth-child(2):hover {
          border-color: rgba(251, 113, 133, 0.44);
          box-shadow: 0 24px 60px rgba(251, 113, 133, 0.12), 0 18px 48px rgba(0, 0, 0, 0.34);
        }

        .home-action-card:nth-child(3):hover {
          border-color: rgba(45, 212, 191, 0.44);
          box-shadow: 0 24px 60px rgba(20, 184, 166, 0.14), 0 18px 48px rgba(0, 0, 0, 0.34);
        }

        .home-action-card:nth-child(4):hover {
          border-color: rgba(196, 181, 253, 0.42);
          box-shadow: 0 24px 60px rgba(129, 140, 248, 0.12), 0 18px 48px rgba(0, 0, 0, 0.34);
        }

        .action-icon {
          position: absolute;
          top: 10px;
          right: 12px;
          width: 78px;
          height: 78px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border-radius: 0;
          overflow: visible;
          opacity: 0.96;
          filter:
            drop-shadow(0 14px 18px rgba(0, 0, 0, 0.42))
            drop-shadow(0 0 18px rgba(168, 85, 247, 0.18));
          pointer-events: none;
        }

        .home-action-icon-image {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .action-label {
          color: #99f6e4;
        }

        .home-action-card strong {
          display: block;
          margin-top: 8px;
          font-size: 21px;
          line-height: 1.2;
          font-weight: 900;
        }

        .home-action-card small {
          display: block;
          margin-top: 8px;
          color: #cbd5e1;
          font-size: 13px;
          line-height: 1.45;
          font-weight: 800;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 18px;
          margin-top: 18px;
          animation: homeIn 0.55s 0.15s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .panel {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-small-card);
          padding: 22px;
          background:
            linear-gradient(145deg, rgba(15, 23, 42, 0.86), rgba(8, 12, 22, 0.94));
          box-shadow:
            0 18px 48px rgba(0, 0, 0, 0.28),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        .hero-status-panel {
          display: grid;
          grid-template-columns: minmax(220px, 0.8fr) minmax(360px, 1.25fr) minmax(280px, 1fr) 180px;
          align-items: center;
          gap: 18px;
          border-color: rgba(56, 189, 248, 0.2) !important;
          padding: 18px 20px;
          background:
            radial-gradient(circle at 92% 10%, rgba(56, 189, 248, 0.16), transparent 28%),
            radial-gradient(circle at 12% 100%, rgba(52, 211, 153, 0.1), transparent 34%),
            linear-gradient(145deg, rgba(10, 24, 42, 0.9), rgba(8, 12, 22, 0.95)) !important;
        }

        .hero-status-panel .panel-head {
          align-items: center;
          margin-bottom: 0;
        }

        .hero-status-panel .panel-head p {
          color: #67e8f9;
        }

        .hero-status-panel .panel-link {
          width: auto;
          min-width: 0;
          min-height: 44px;
          margin-top: 0;
          border-color: rgba(56, 189, 248, 0.22) !important;
          background: rgba(14, 165, 233, 0.08) !important;
        }

        .panel-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 20px;
        }

        .panel-head p {
          margin: 0;
          color: #99f6e4;
        }

        .panel-head h2 {
          margin: 7px 0 0;
          font-size: 24px;
          line-height: 1.22;
          font-weight: 900;
          overflow-wrap: anywhere;
        }

        .panel-icon {
          flex: 0 0 auto;
          width: 64px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          filter:
            drop-shadow(0 16px 18px rgba(0, 0, 0, 0.36))
            drop-shadow(0 0 16px rgba(168, 85, 247, 0.16));
        }

        .panel-icon-image {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .hero-level-row {
          display: grid;
          grid-template-columns: minmax(0, 1.55fr) minmax(112px, 0.55fr);
          gap: 10px;
          padding-block: 0;
          border-bottom: 0;
        }

        .hero-level-row > div {
          min-height: 72px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 12px 14px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.04);
        }

        .hero-level-row strong {
          display: block;
          margin-top: 7px;
          color: #fef3c7;
          font-size: 21px;
          line-height: 1.25;
          font-weight: 900;
          overflow-wrap: anywhere;
        }

        .progress-info {
          min-width: 0;
          margin-top: 0;
        }

        .progress-info > div:first-child {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          color: #cbd5e1;
          font-size: 13px;
          font-weight: 900;
        }

        .progress-info strong {
          text-align: right;
        }

        .progress-track {
          height: 12px;
          margin-top: 12px;
          overflow: hidden;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.1);
        }

        .progress-bar {
          height: 100%;
          border-radius: inherit;
          transition: width 0.35s ease;
        }

        .hero-exp {
          background: linear-gradient(90deg, #2dd4bf, #fde047, #fb923c);
        }

        .panel-link {
          width: 100%;
          margin-top: 18px;
          min-height: 50px;
          font-size: 15px;
        }

        @keyframes shine {
          0% {
            transform: translateX(-75%) rotate(8deg);
          }

          45%,
          100% {
            transform: translateX(75%) rotate(8deg);
          }
        }

        .settings-footer {
          margin-top: 18px;
          display: flex;
          justify-content: center;
        }

        .settings-footer-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.04);
          color: #64748b;
          font-size: 13px;
          font-weight: 800;
          text-decoration: none;
          transition:
            color 0.18s ease,
            border-color 0.18s ease,
            background 0.18s ease;
        }

        .settings-footer-link:hover {
          color: #94a3b8;
          border-color: rgba(255, 255, 255, 0.18);
          background: rgba(255, 255, 255, 0.07);
        }

        @media (max-width: 1040px) {
          .hero-panel {
            grid-template-columns: 1fr;
          }

          .home-monster-showcase {
            order: -1;
          }

          .home-action-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .hero-status-panel {
            grid-template-columns: minmax(0, 1fr) minmax(260px, 1fr);
          }

          .hero-status-panel .progress-info,
          .hero-status-panel .panel-link {
            grid-column: 1 / -1;
          }

          .hero-status-panel .panel-link {
            width: 100%;
          }
        }

        @media (max-width: 760px) {
          .home-page {
            background-attachment: scroll, scroll;
            background-position: center top, 58% top;
            padding: 18px;
          }

          .hero-panel {
            gap: 24px;
            padding: 22px;
          }

          .hero-copy h1 {
            font-size: clamp(34px, 10vw, 48px);
            line-break: anywhere;
          }

          .hero-copy h1 span {
            display: block;
          }

          .hero-copy h1 span + span::before {
            content: "";
          }

          .lead {
            max-width: 100%;
            font-size: 14px;
            line-break: anywhere;
            word-break: break-word;
          }

          .main-actions,
          .home-stats,
          .home-action-grid,
          .dashboard-grid,
          .hero-status-panel,
          .hero-level-row {
            grid-template-columns: 1fr;
          }

          .home-showcase-card {
            max-width: 216px;
          }

          .panel {
            padding: 18px;
          }
        }

        @media (max-width: 480px) {
          :root {
            --radius-page-card: 28px;
            --radius-logo-card: 24px;
            --radius-button: 18px;
            --radius-small-card: 16px;
          }

          .home-page {
            padding: 18px 14px calc(32px + env(safe-area-inset-bottom));
          }

          .primary-action,
          .secondary-action {
            min-height: 58px;
          }

          .hero-quest-action {
            min-height: 132px;
            padding: 16px;
          }

          .hero-quest-copy strong {
            font-size: 28px;
          }

          .hero-quest-icon {
            width: 88px;
            height: 88px;
          }

          .home-showcase-card {
            width: min(100%, 280px);
          }

          .main-actions {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 430px) {
          .hero-copy h1 {
            font-size: 30px;
            line-height: 1.12;
            word-break: break-word;
          }

          .primary-action,
          .secondary-action {
            font-size: 16px;
          }
        }

        .site-footer {
          text-align: center;
          padding: 20px 24px calc(20px + env(safe-area-inset-bottom));
          border-top: 1px solid rgba(255, 255, 255, 0.07);
          margin-top: 8px;
        }

        .site-footer-title {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: rgba(255, 255, 255, 0.35);
          margin: 0 0 6px;
        }

        .site-footer-copy {
          margin: 0;
          font-size: 10px;
          color: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </main>
  );
}
