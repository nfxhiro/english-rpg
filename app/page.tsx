"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  getHeroExpProgress,
  HeroStatus,
  loadHeroStatus,
} from "../data/hero";
import {
  getDisplayTitle,
  getSelectedAvatarEmoji,
  getSelectedAvatarItem,
  getSelectedBackgroundCss,
  getSelectedEffectClass,
  getSelectedEffectItem,
  getSelectedFrameCss,
  loadShopState,
  ShopState,
} from "../data/shop";
import {
  EarnedCard,
  getMonsterCardById,
  getOwnedCount,
  monsterCards,
  MonsterCard,
} from "../data/cards";

type OwnedMonsterCard = {
  card: MonsterCard;
  earnedCard: EarnedCard;
};

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
    ownedAvatars: [],
    ownedTitles: [],
    ownedBackgrounds: [],
    ownedFrames: [],
    ownedEffects: [],
    selectedAvatar: null,
    selectedTitle: null,
    selectedBackground: null,
    selectedFrame: null,
    selectedEffect: null,
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

  const totalOwnedCopies = useMemo(() => {
    return earnedCards.reduce((total, card) => {
      return total + getOwnedCount(card);
    }, 0);
  }, [earnedCards]);

  const featuredMonsters = useMemo(() => {
    const ownedCards = ownedMonsterCards.map((item) => item.card);

    if (ownedCards.length > 0) {
      return ownedCards.slice(0, 6);
    }

    return monsterCards.slice(0, 6);
  }, [ownedMonsterCards]);

  const displayTitle = getDisplayTitle(shopState, hero?.title ?? "はじまりの勇者");
  const selectedAvatarEmoji = getSelectedAvatarEmoji(shopState);
  const selectedAvatarItem = getSelectedAvatarItem(shopState);
  const selectedMonsterCard = shopState.selectedMonsterCardId
    ? getMonsterCardById(shopState.selectedMonsterCardId)
    : null;
  const selectedBgCss = getSelectedBackgroundCss(shopState);
  const selectedFrameCss = getSelectedFrameCss(shopState);
  const selectedEffectItem = getSelectedEffectItem(shopState);
  const selectedEffectClass = getSelectedEffectClass(shopState);

  const showcaseName =
    selectedAvatarItem?.name ?? selectedMonsterCard?.name ?? "ブレイズドラゴン";
  const showcaseDescription = selectedEffectItem
    ? `${selectedEffectItem.name}をまとっています`
    : selectedAvatarItem?.description ??
      (selectedMonsterCard
        ? `${selectedMonsterCard.emoji} ${selectedMonsterCard.attribute}属性の${selectedMonsterCard.species}`
        : "クエストで出会う仲間をここに飾れます");

  return (
    <main className="home-page">
      <section className="home-shell">
        <div className="hero-panel">
          <div className="hero-copy">
            <div className="eyebrow">
              <span>EIKEN QUEST RPG</span>
            </div>

            <h1>Eiken Quest Frontier</h1>

            <p className="lead">
              英単語のクエストで主人公を育て、出会ったモンスターを仲間にする学習RPG。
              迷ったら、まずはクエストへ。
            </p>

            <div className="main-actions">
              <Link href="/quiz" className="primary-action">
                <span>⚡</span>
                クエストに出る
              </Link>

              <Link href="/words" className="secondary-action">
                <span>📚</span>
                単語帳を見る
              </Link>

              <Link href="/written" className="secondary-action">
                <span>📄</span>
                筆記トレーニング
              </Link>
            </div>

            <div className="home-stats" aria-label="冒険の概要">
              <div>
                <span>LEVEL</span>
                <strong>Lv.{hero?.level ?? 1}</strong>
              </div>
              <div>
                <span>CARDS</span>
                <strong>
                  {ownedCount}/{totalCardCount}
                </strong>
              </div>
              <div>
                <span>TICKETS</span>
                <strong>{packTickets}枚</strong>
              </div>
            </div>
          </div>

          <div className="monster-showcase" aria-label="現在のアバター">
            <div
              className="showcase-card"
              style={selectedFrameCss ? { background: selectedFrameCss } : undefined}
            >
              <div
                className="showcase-backdrop"
                style={selectedBgCss ? { background: selectedBgCss } : undefined}
              />
              <div className="showcase-shine" />
              {selectedEffectClass && (
                <div className={`avatar-effect-layer ${selectedEffectClass}`} />
              )}
              <div className="monster-main">{selectedAvatarEmoji}</div>
              <p>ACTIVE AVATAR</p>
              <h2>{showcaseName}</h2>
              <span>{showcaseDescription}</span>
            </div>
          </div>
        </div>

        <nav className="home-action-grid" aria-label="メインメニュー">
          <Link href="/quiz" className="home-action-card is-primary">
            <span className="action-icon">⚔️</span>
            <span className="action-label">Quest</span>
            <strong>クエスト</strong>
            <small>問題に挑戦して経験値を獲得</small>
          </Link>

          <Link href="/pack" className="home-action-card">
            <span className="action-icon">🎁</span>
            <span className="action-label">{packTickets > 0 ? `${packTickets}枚` : "Pack"}</span>
            <strong>パック</strong>
            <small>チケットでカードを仲間にする</small>
          </Link>

          <Link href="/cards" className="home-action-card">
            <span className="action-icon">🃏</span>
            <span className="action-label">{collectionRate}%</span>
            <strong>カード図鑑</strong>
            <small>仲間にしたカードを確認</small>
          </Link>

          <Link href="/shop" className="home-action-card">
            <span className="action-icon">🛒</span>
            <span className="action-label">Style</span>
            <strong>ショップ</strong>
            <small>アバターや称号を整える</small>
          </Link>
        </nav>

        <div className="dashboard-grid">
          <section className="panel hero-status-panel">
            <div className="panel-head">
              <div>
                <p>HERO STATUS</p>
                <h2>冒険者の記録</h2>
              </div>
              <span className="panel-icon">🛡️</span>
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
              主人公を見る →
            </Link>
          </section>

          <section className="panel collection-panel">
            <div className="panel-head">
              <div>
                <p>COLLECTION</p>
                <h2>仲間カード</h2>
              </div>
              <span className="panel-icon">✨</span>
            </div>

            <div className="collection-meter">
              <strong>{collectionRate}%</strong>
              <span>
                {ownedCount}種類 / {totalCardCount}種類
              </span>
              <div className="progress-track">
                <div
                  className="progress-bar collection-progress"
                  style={{ width: `${collectionRate}%` }}
                />
              </div>
            </div>

            <div className="collection-summary">
              <span>総所持枚数</span>
              <strong>{totalOwnedCopies}</strong>
            </div>

            <Link href="/cards" className="panel-link">
              図鑑を開く →
            </Link>
          </section>

          <section className="panel featured-panel">
            <div className="panel-head">
              <div>
                <p>{ownedCount > 0 ? "YOUR MONSTERS" : "FIRST MONSTERS"}</p>
                <h2>{ownedCount > 0 ? "仲間になったカード" : "出会えるカード"}</h2>
              </div>
              <span className="panel-icon">🔥</span>
            </div>

            <div className="monster-row">
              {featuredMonsters.map((card) => (
                <Link
                  key={card.id}
                  href={`/cards/${encodeURIComponent(card.id)}`}
                  className={`mini-monster rarity-${card.rarity.toLowerCase()}`}
                >
                  <span>{card.monsterEmoji}</span>
                  <strong>{card.name}</strong>
                  <small>{card.rarity}</small>
                </Link>
              ))}
            </div>
          </section>
        </div>

        <div className="settings-footer">
          <Link href="/settings" className="settings-footer-link">
            <span>⚙️</span>
            <span>設定・データ管理</span>
          </Link>
        </div>
      </section>

      <style>{`
        .home-page {
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
          background:
            linear-gradient(160deg, #070a12 0%, #101827 44%, #0b161b 100%);
          color: white;
          padding: 28px;
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
          border-radius: 30px;
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

        .lead {
          margin: 20px 0 0;
          max-width: 650px;
          color: #cbd5e1;
          font-size: 16px;
          font-weight: 800;
          line-height: 1.85;
        }

        .main-actions {
          margin-top: 28px;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
          max-width: 620px;
        }

        .primary-action,
        .secondary-action,
        .panel-link {
          min-height: 68px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border-radius: 18px;
          text-decoration: none;
          text-align: center;
          font-size: 17px;
          font-weight: 900;
          line-height: 1.25;
          transition:
            transform 0.18s ease,
            border-color 0.18s ease,
            background 0.18s ease,
            box-shadow 0.18s ease;
        }

        .primary-action {
          border: 1px solid rgba(255, 245, 157, 0.72);
          background: linear-gradient(135deg, #fff7ad 0%, #facc15 44%, #fb923c 100%);
          color: #111827;
          box-shadow: 0 18px 42px rgba(250, 204, 21, 0.26);
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
        .home-action-card:hover,
        .mini-monster:hover {
          transform: translateY(-4px);
        }

        .primary-action:hover {
          box-shadow: 0 22px 50px rgba(250, 204, 21, 0.36);
        }

        .secondary-action:hover {
          border-color: rgba(45, 212, 191, 0.36);
          background: rgba(45, 212, 191, 0.08);
        }

        .panel-link:hover {
          border-color: rgba(45, 212, 191, 0.36) !important;
          background: rgba(45, 212, 191, 0.08) !important;
        }

        .hero-status-panel .panel-link:hover {
          border-color: rgba(56, 189, 248, 0.38) !important;
          background: rgba(14, 165, 233, 0.12) !important;
        }

        .collection-panel .panel-link:hover {
          border-color: rgba(250, 204, 21, 0.38) !important;
          background: rgba(250, 204, 21, 0.12) !important;
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
        .hero-level-row span,
        .collection-meter span,
        .collection-summary span {
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

        .monster-showcase {
          display: flex;
          justify-content: center;
        }

        .showcase-card {
          position: relative;
          width: min(100%, 306px);
          aspect-ratio: 0.72;
          overflow: hidden;
          border-radius: 28px;
          padding: 5px;
          background: linear-gradient(135deg, #fde68a 0%, #14b8a6 42%, #fb7185 100%);
          box-shadow:
            0 24px 58px rgba(0, 0, 0, 0.36),
            0 0 46px rgba(20, 184, 166, 0.16);
        }

        .showcase-card::before {
          content: "";
          position: absolute;
          inset: 5px;
          z-index: 0;
          border-radius: 23px;
          background:
            linear-gradient(180deg, rgba(255, 255, 255, 0.12), transparent 36%),
            #071019;
        }

        .showcase-backdrop {
          position: absolute;
          inset: 5px;
          z-index: 0;
          border-radius: 23px;
          opacity: 0.82;
        }

        .showcase-shine {
          position: absolute;
          inset: -88px;
          z-index: 1;
          background: linear-gradient(
            115deg,
            transparent 35%,
            rgba(255, 255, 255, 0.24),
            transparent 64%
          );
          animation: shine 3.8s ease-in-out infinite;
        }

        .avatar-effect-layer {
          position: absolute;
          inset: 5px;
          z-index: 1;
          border-radius: 23px;
          pointer-events: none;
        }

        .avatar-effect-layer.effect-spark {
          background:
            radial-gradient(circle at 28% 32%, rgba(254, 243, 199, 0.95) 0 4px, transparent 5px),
            radial-gradient(circle at 70% 24%, rgba(103, 232, 249, 0.86) 0 3px, transparent 4px),
            radial-gradient(circle at 62% 76%, rgba(250, 204, 21, 0.8) 0 4px, transparent 5px);
          animation: avatarAuraFloat 2.8s ease-in-out infinite alternate;
        }

        .avatar-effect-layer.effect-flame {
          background:
            radial-gradient(circle at 50% 78%, rgba(248, 113, 113, 0.42), transparent 28%),
            conic-gradient(from 180deg at 50% 82%, transparent, rgba(251, 146, 60, 0.32), transparent 38%, rgba(239, 68, 68, 0.26), transparent);
          animation: avatarAuraSpin 5.5s linear infinite;
        }

        .avatar-effect-layer.effect-aqua {
          background:
            radial-gradient(circle at 50% 50%, transparent 0 38%, rgba(34, 211, 238, 0.34) 39% 40%, transparent 42%),
            radial-gradient(circle at 50% 50%, transparent 0 56%, rgba(103, 232, 249, 0.22) 57% 58%, transparent 60%);
          animation: avatarAuraPulse 2.4s ease-in-out infinite;
        }

        .avatar-effect-layer.effect-shadow {
          background:
            radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.2), transparent 44%),
            conic-gradient(from 20deg, transparent, rgba(168, 85, 247, 0.28), transparent, rgba(34, 211, 238, 0.18), transparent);
          animation: avatarAuraSpin 8s linear infinite;
        }

        .avatar-effect-layer.effect-crown {
          background:
            linear-gradient(180deg, rgba(254, 243, 199, 0.36), transparent 38%),
            radial-gradient(circle at 50% 16%, rgba(250, 204, 21, 0.42), transparent 22%);
          animation: avatarAuraFloat 2.2s ease-in-out infinite alternate;
        }

        .monster-main,
        .showcase-card p,
        .showcase-card h2,
        .showcase-card span {
          position: relative;
          z-index: 2;
          text-align: center;
        }

        .monster-main {
          margin-top: 54px;
          font-size: 104px;
          filter: drop-shadow(0 18px 24px rgba(0, 0, 0, 0.42));
        }

        .showcase-card p {
          margin: 24px 0 0;
          color: #fef3c7;
          font-size: 11px;
          font-weight: 900;
        }

        .showcase-card h2 {
          margin: 9px auto 0;
          max-width: 240px;
          color: white;
          font-size: 25px;
          line-height: 1.18;
          font-weight: 900;
          overflow-wrap: anywhere;
        }

        .showcase-card span {
          display: block;
          max-width: 230px;
          margin: 8px auto 0;
          color: #dbeafe;
          font-size: 13px;
          font-weight: 800;
          line-height: 1.55;
        }

        .home-action-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          margin-top: 18px;
          animation: homeIn 0.55s 0.08s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .home-action-card {
          position: relative;
          min-height: 170px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
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

        .home-action-card:nth-child(2) {
          border-color: rgba(251, 113, 133, 0.28);
          background:
            radial-gradient(circle at 88% 12%, rgba(251, 191, 36, 0.18), transparent 30%),
            radial-gradient(circle at 12% 100%, rgba(251, 113, 133, 0.14), transparent 36%),
            linear-gradient(145deg, rgba(42, 20, 34, 0.9), rgba(11, 17, 29, 0.96));
        }

        .home-action-card:nth-child(3) {
          border-color: rgba(45, 212, 191, 0.28);
          background:
            radial-gradient(circle at 86% 18%, rgba(34, 211, 238, 0.17), transparent 31%),
            radial-gradient(circle at 8% 100%, rgba(52, 211, 153, 0.13), transparent 38%),
            linear-gradient(145deg, rgba(8, 37, 43, 0.9), rgba(10, 16, 28, 0.96));
        }

        .home-action-card:nth-child(4) {
          border-color: rgba(196, 181, 253, 0.25);
          background:
            radial-gradient(circle at 86% 18%, rgba(129, 140, 248, 0.18), transparent 31%),
            radial-gradient(circle at 10% 100%, rgba(244, 114, 182, 0.11), transparent 38%),
            linear-gradient(145deg, rgba(30, 27, 75, 0.76), rgba(10, 16, 28, 0.96));
        }

        .home-action-card.is-primary .action-label {
          color: #86efac;
        }

        .home-action-card:nth-child(2) .action-label {
          color: #fda4af;
        }

        .home-action-card:nth-child(3) .action-label {
          color: #67e8f9;
        }

        .home-action-card:nth-child(4) .action-label {
          color: #c4b5fd;
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
          top: 18px;
          right: 18px;
          font-size: 38px;
          filter: drop-shadow(0 12px 20px rgba(0, 0, 0, 0.38));
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
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
          margin-top: 18px;
          animation: homeIn 0.55s 0.15s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .panel {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 22px;
          background:
            linear-gradient(145deg, rgba(15, 23, 42, 0.86), rgba(8, 12, 22, 0.94));
          box-shadow:
            0 18px 48px rgba(0, 0, 0, 0.28),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        .hero-status-panel {
          border-color: rgba(56, 189, 248, 0.2) !important;
          background:
            radial-gradient(circle at 92% 10%, rgba(56, 189, 248, 0.16), transparent 28%),
            radial-gradient(circle at 12% 100%, rgba(52, 211, 153, 0.1), transparent 34%),
            linear-gradient(145deg, rgba(10, 24, 42, 0.9), rgba(8, 12, 22, 0.95)) !important;
        }

        .collection-panel {
          border-color: rgba(250, 204, 21, 0.22) !important;
          background:
            radial-gradient(circle at 92% 10%, rgba(250, 204, 21, 0.16), transparent 30%),
            radial-gradient(circle at 10% 100%, rgba(45, 212, 191, 0.12), transparent 36%),
            linear-gradient(145deg, rgba(38, 30, 16, 0.82), rgba(8, 12, 22, 0.95)) !important;
        }

        .featured-panel {
          border-color: rgba(251, 113, 133, 0.2) !important;
          background:
            radial-gradient(circle at 96% 4%, rgba(251, 113, 133, 0.13), transparent 28%),
            radial-gradient(circle at 12% 100%, rgba(129, 140, 248, 0.12), transparent 36%),
            linear-gradient(145deg, rgba(31, 22, 43, 0.82), rgba(8, 12, 22, 0.95)) !important;
        }

        .hero-status-panel .panel-head p {
          color: #67e8f9;
        }

        .collection-panel .panel-head p {
          color: #fde68a;
        }

        .featured-panel .panel-head p {
          color: #fda4af;
        }

        .hero-status-panel .panel-link {
          border-color: rgba(56, 189, 248, 0.22) !important;
          background: rgba(14, 165, 233, 0.08) !important;
        }

        .collection-panel .panel-link {
          border-color: rgba(250, 204, 21, 0.24) !important;
          background: rgba(250, 204, 21, 0.08) !important;
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
          font-size: 34px;
          line-height: 1;
        }

        .hero-level-row {
          display: grid;
          grid-template-columns: minmax(0, 1.25fr) minmax(120px, 0.75fr);
          gap: 14px;
          padding-block: 4px 18px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .hero-level-row strong {
          display: block;
          margin-top: 8px;
          color: #fef3c7;
          font-size: 22px;
          line-height: 1.25;
          font-weight: 900;
          overflow-wrap: anywhere;
        }

        .progress-info {
          margin-top: 18px;
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

        .collection-progress {
          background: linear-gradient(90deg, #fb7185, #facc15, #2dd4bf);
        }

        .panel-link {
          width: 100%;
          margin-top: 18px;
          min-height: 50px;
          font-size: 15px;
        }

        .collection-meter {
          padding-bottom: 18px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .collection-meter strong {
          display: block;
          color: #fef3c7;
          font-size: 42px;
          line-height: 1;
          font-weight: 900;
        }

        .collection-meter span {
          display: block;
          margin-top: 8px;
        }

        .collection-summary {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          min-height: 48px;
          margin-top: 14px;
        }

        .collection-summary strong {
          color: white;
          font-size: 24px;
          font-weight: 900;
        }

        .featured-panel {
          grid-column: 1 / -1;
        }

        .monster-row {
          display: grid;
          grid-template-columns: repeat(6, minmax(0, 1fr));
          gap: 12px;
        }

        .mini-monster {
          min-height: 132px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 18px;
          padding: 12px;
          color: white;
          text-align: center;
          text-decoration: none;
          background: rgba(255, 255, 255, 0.055);
          transition:
            transform 0.18s ease,
            border-color 0.18s ease,
            background 0.18s ease;
        }

        .mini-monster:hover {
          border-color: rgba(45, 212, 191, 0.36);
          background: rgba(45, 212, 191, 0.08);
        }

        .mini-monster span {
          font-size: 34px;
          line-height: 1;
        }

        .mini-monster strong {
          max-width: 100%;
          font-size: 13px;
          line-height: 1.28;
          font-weight: 900;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .mini-monster small {
          color: #fef3c7;
          font-size: 11px;
          font-weight: 900;
        }

        .rarity-ur {
          border-color: rgba(255, 255, 255, 0.72);
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0.05));
        }

        .rarity-ssr {
          border-color: rgba(251, 191, 36, 0.54);
          background: linear-gradient(145deg, rgba(251, 191, 36, 0.16), rgba(255, 255, 255, 0.05));
        }

        .rarity-sr {
          border-color: rgba(251, 113, 133, 0.42);
          background: linear-gradient(145deg, rgba(251, 113, 133, 0.14), rgba(255, 255, 255, 0.05));
        }

        .rarity-r {
          border-color: rgba(45, 212, 191, 0.42);
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

        @keyframes avatarAuraSpin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes avatarAuraPulse {
          0%,
          100% {
            opacity: 0.45;
            transform: scale(0.95);
          }

          50% {
            opacity: 0.9;
            transform: scale(1.08);
          }
        }

        @keyframes avatarAuraFloat {
          from {
            opacity: 0.56;
            transform: translateY(2px);
          }

          to {
            opacity: 1;
            transform: translateY(-5px);
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

          .monster-showcase {
            order: -1;
          }

          .home-action-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .monster-row {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 760px) {
          .home-page {
            padding: 18px;
          }

          .hero-panel {
            gap: 24px;
            border-radius: 24px;
            padding: 22px;
          }

          .hero-copy h1 {
            font-size: clamp(34px, 10vw, 48px);
          }

          .lead {
            font-size: 14px;
          }

          .main-actions,
          .home-stats,
          .home-action-grid,
          .dashboard-grid,
          .hero-level-row,
          .monster-row {
            grid-template-columns: 1fr;
          }

          .showcase-card {
            max-width: 248px;
          }

          .monster-main {
            margin-top: 44px;
            font-size: 86px;
          }

          .panel {
            border-radius: 22px;
            padding: 18px;
          }
        }

        @media (max-width: 430px) {
          .hero-copy h1 {
            font-size: 32px;
          }

          .primary-action,
          .secondary-action {
            font-size: 16px;
          }
        }
      `}</style>
    </main>
  );
}
