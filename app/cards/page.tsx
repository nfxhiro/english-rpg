"use client";

import {
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import Image from "next/image";
import AppLoading from "../components/AppLoading";
import {
  allAttributes,
  attributeEmojiMap,
  EarnedCard,
  getAttributeColor,
  getOwnedCount,
  getStatus,
  MainAttribute,
  monsterCards,
  Rarity,
} from "../../data/cards";
import {
  getAwakeningClassName,
  getAwakeningLevel,
  getMonsterLevelProgress,
} from "../../data/progression";

type OwnedFilter = "all" | "owned" | "notOwned";

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
    return parsedCards.filter((card) => typeof card.cardId === "string");
  } catch {
    localStorage.removeItem("earnedCards");
    return [];
  }
}

function getRarityLabel(rarity: Rarity) {
  if (rarity === "UR") return "ULTIMATE";
  if (rarity === "SSR") return "LEGEND";
  if (rarity === "SR") return "EPIC";
  if (rarity === "R") return "RARE";
  return "NORMAL";
}

function getRarityRank(rarity: Rarity) {
  if (rarity === "UR") return 5;
  if (rarity === "SSR") return 4;
  if (rarity === "SR") return 3;
  if (rarity === "R") return 2;
  return 1;
}

function getRarityMeterActiveStyle(rarity: Rarity): React.CSSProperties {
  if (rarity === "UR")  return { background: "linear-gradient(90deg, #ff50c8, #64c8ff, #facc15)" };
  if (rarity === "SSR") return { background: "linear-gradient(90deg, #facc15, #fb923c)" };
  if (rarity === "SR")  return { background: "linear-gradient(90deg, #a855f7, #22d3ee)" };
  if (rarity === "R")   return { background: "linear-gradient(90deg, #22d3ee, #60a5fa)" };
  return { background: "linear-gradient(90deg, #94a3b8, #e2e8f0)" };
}

function isSrOrHigher(rarity: Rarity) {
  return rarity === "UR" || rarity === "SSR" || rarity === "SR";
}

function getStatusClass(status: string) {
  if (status === "マスター") return "dc-status-master";
  if (status === "成長中") return "dc-status-growing";
  if (status === "獲得済み") return "dc-status-owned";
  return "dc-status-none";
}

export default function CardsPage() {
  const [earnedCards, setEarnedCards] = useState<EarnedCard[]>([]);
  const [searchText, setSearchText] = useState("");
  const [rarityFilter, setRarityFilter] = useState<"すべて" | Rarity>("すべて");
  const [ownedFilter, setOwnedFilter] = useState<OwnedFilter>("all");
  const [attributeFilter, setAttributeFilter] = useState("すべて");
  const [isReady, setIsReady] = useState(false);

  const deferredSearchText = useDeferredValue(searchText);
  const deferredRarityFilter = useDeferredValue(rarityFilter);
  const deferredOwnedFilter = useDeferredValue(ownedFilter);
  const deferredAttributeFilter = useDeferredValue(attributeFilter);

  const isFilterPending =
    deferredSearchText !== searchText ||
    deferredRarityFilter !== rarityFilter ||
    deferredOwnedFilter !== ownedFilter ||
    deferredAttributeFilter !== attributeFilter;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setEarnedCards(loadEarnedCards());
      setIsReady(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const earnedCardMap = useMemo(() => {
    return new Map(earnedCards.map((card) => [card.cardId, card]));
  }, [earnedCards]);

  const ownedCount = earnedCards.length;
  const totalCount = monsterCards.length;
  const collectionRate =
    getCollectionRate(ownedCount, totalCount);

  const totalOwnedCopies = useMemo(() => {
    return earnedCards.reduce((total, card) => total + getOwnedCount(card), 0);
  }, [earnedCards]);

  const masteredCount = useMemo(() => {
    return earnedCards.filter((card) => card.correctCount >= 10).length;
  }, [earnedCards]);

  const srOrHigherCount = useMemo(() => {
    return monsterCards.filter((card) => {
      const earnedCard = earnedCardMap.get(card.id);
      if (!earnedCard) return false;
      return isSrOrHigher(card.rarity);
    }).length;
  }, [earnedCardMap]);

  const filteredCards = useMemo(() => {
    const keyword = deferredSearchText.trim().toLowerCase();
    const rawKeyword = deferredSearchText.trim();

    return monsterCards.filter((card) => {
      const earnedCard = earnedCardMap.get(card.id);
      const isOwned = Boolean(earnedCard);

      const matchesSearch =
        keyword === "" ||
        card.id.toLowerCase().includes(keyword) ||
        card.name.toLowerCase().includes(keyword) ||
        card.title.toLowerCase().includes(keyword) ||
        card.species.toLowerCase().includes(keyword) ||
        card.attribute.includes(rawKeyword) ||
        (card.subAttribute?.includes(rawKeyword) ?? false) ||
        card.rarity.toLowerCase().includes(keyword);

      const matchesRarity =
        deferredRarityFilter === "すべて" || card.rarity === deferredRarityFilter;

      const matchesOwned =
        deferredOwnedFilter === "all" ||
        (deferredOwnedFilter === "owned" && isOwned) ||
        (deferredOwnedFilter === "notOwned" && !isOwned);

      const matchesAttribute =
        deferredAttributeFilter === "すべて" || card.attribute === deferredAttributeFilter;

      return matchesSearch && matchesRarity && matchesOwned && matchesAttribute;
    });
  }, [deferredSearchText, deferredRarityFilter, deferredOwnedFilter, deferredAttributeFilter, earnedCardMap]);


  if (!isReady) {
    return (
      <AppLoading
        icon="🃏"
        iconSrc="/home-icons/cards.png"
        iconWidth={1254}
        iconHeight={787}
        title="カード図鑑を読み込み中..."
        message="所持カード・図鑑達成率・成長状況を確認しています。"
      />
    );
  }

  return (
    <main className="eq-page cards-page">
      <div className="eq-bg-orb eq-bg-orb-one" />
      <div className="eq-bg-orb eq-bg-orb-two" />
      <div className="eq-bg-orb eq-bg-orb-three" />

      <section className="eq-shell">
        <nav className="eq-topbar">
          <Link href="/" className="eq-back-link">
            ← ホームへ戻る
          </Link>
        </nav>

        <div className="eq-hero">
          <div className="eq-hero-copy">
            <div className="eq-eyebrow">
              <span>🃏</span>
              <span>MONSTER CARD BOOK</span>
            </div>

            <h1 className="eq-page-title">カード図鑑</h1>

            <p className="eq-lead">
              モンスターカードを集めて、属性・種族・レア度・成長状況を確認しよう。
              同じカードが出ると所持枚数が増えていきます。
            </p>

            <div className="eq-actions">
              <Link href="/quiz" className="eq-button eq-button-primary">
                <span>⚡</span>
                クエスト開始
              </Link>

              <Link href="/pack" className="eq-button eq-button-secondary">
                <span>🎁</span>
                パック開封
              </Link>
            </div>
          </div>

          <div className="book-stage">
            <div className="eq-display-card">
              <div className="eq-display-shine" />
              <div className="eq-display-icon eq-display-image-frame">
                <Image
                  src="/home-icons/book.png"
                  alt=""
                  width={1229}
                  height={1042}
                  className="eq-display-image"
                  sizes="150px"
                  aria-hidden="true"
                  unoptimized
                />
              </div>
              <p>COLLECTION BOOK</p>
              <h2>{collectionRate}%</h2>
              <span>
                {ownedCount} / {totalCount} types
              </span>
            </div>
          </div>

          <div className="eq-status-strip">
            <div className="eq-status-card">
              <span>所持カード種類</span>
              <strong>{ownedCount}</strong>
            </div>

            <div className="eq-status-card">
              <span>総所持枚数</span>
              <strong>{totalOwnedCopies}</strong>
            </div>

            <div className="eq-status-card is-highlight">
              <span>図鑑達成率</span>
              <strong>{collectionRate}%</strong>
            </div>
          </div>
        </div>

        <div className="eq-panel cards-filter-panel">
          <div className="filter-grid">
            <label className="search-box">
              <span>検索</span>
              <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="ドラゴン / 火 / UR / ブレイズ など"
              />
            </label>

            <div className="rarity-filter">
              <span>レア度</span>
              <div className="rarity-buttons">
                {(["すべて", "N", "R", "SR", "SSR", "UR"] as const).map((rarity) => (
                  <button
                    key={rarity}
                    type="button"
                    onClick={() => setRarityFilter(rarity)}
                    className={rarityFilter === rarity ? "active" : ""}
                  >
                    {rarity}
                  </button>
                ))}
              </div>
            </div>

            <div className="owned-filter">
              <span>表示</span>
              <div className="owned-buttons">
                <button
                  type="button"
                  onClick={() => setOwnedFilter("all")}
                  className={ownedFilter === "all" ? "active" : ""}
                >
                  すべて
                </button>
                <button
                  type="button"
                  onClick={() => setOwnedFilter("owned")}
                  className={ownedFilter === "owned" ? "active" : ""}
                >
                  所持
                </button>
                <button
                  type="button"
                  onClick={() => setOwnedFilter("notOwned")}
                  className={ownedFilter === "notOwned" ? "active" : ""}
                >
                  未所持
                </button>
              </div>
            </div>

          </div>

          <div className="attr-filter">
            <span>属性</span>
            <div className="attr-scroll">
              {["すべて", ...allAttributes].map((attr) => (
                <button
                  key={attr}
                  type="button"
                  onClick={() => setAttributeFilter(attr)}
                  className={attributeFilter === attr ? "active" : ""}
                  style={
                    attributeFilter === attr && attr !== "すべて"
                      ? {
                          borderColor: getAttributeColor(attr),
                          background: `${getAttributeColor(attr)}26`,
                          color: getAttributeColor(attr),
                        }
                      : undefined
                  }
                >
                  {attr === "すべて" ? "すべて" : `${attributeEmojiMap[attr as MainAttribute]} ${attr}`}
                </button>
              ))}
            </div>
          </div>

          <div className="cards-filter-stats">
            <div>
              <span>表示中</span>
              <strong>{filteredCards.length} 件</strong>
            </div>

            <div>
              <span>SR以上 所持</span>
              <strong>{srOrHigherCount}</strong>
            </div>

            <div>
              <span>マスター</span>
              <strong>{masteredCount}</strong>
            </div>

            <div>
              <span>所持率</span>
              <strong>{collectionRate}%</strong>
            </div>
          </div>
        </div>

        {filteredCards.length === 0 ? (
          <div className="eq-panel dex-empty">
            <div>🔍</div>
            <h2>該当するカードがありません</h2>
            <p>検索条件やフィルターを変更してください。</p>
          </div>
        ) : (
          <div className={`card-grid dex-grid${isFilterPending ? " pending" : ""}`}>
            {filteredCards.map((card) => {
              const earnedCard = earnedCardMap.get(card.id);
              const isOwned = Boolean(earnedCard);
              const status = getStatus(card, earnedCards);
              const exp = earnedCard?.exp ?? 0;
              const ownedCopies = getOwnedCount(earnedCard);
              const monsterProgress = getMonsterLevelProgress(exp);
              const expPercent = monsterProgress.percent;
              const awakeningLevel = getAwakeningLevel(ownedCopies);
              const isMaster = status === "マスター";
              const rarityRank = getRarityRank(card.rarity);
              const cardClassName = [
                "monster-card",
                "dex-card",
                `rarity-${card.rarity.toLowerCase()}`,
                isOwned ? getAwakeningClassName(awakeningLevel) : "",
                !isOwned ? "unknown-card" : "",
                isMaster ? "is-master" : "",
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <Link
                  key={card.id}
                  href={`/cards/${encodeURIComponent(card.id)}`}
                  className={cardClassName}
                >
                  <span className="dc-rarity-aura" aria-hidden="true" />

                  <div className="dc-header">
                    <span className="dc-no">
                      No.{String(card.no).padStart(3, "0")}
                    </span>
                    {isMaster && (
                      <span className="dc-badge dc-badge-master">MASTER</span>
                    )}
                    {!isOwned && (
                      <span className="dc-badge dc-badge-unknown">未獲得</span>
                    )}
                  </div>

                  <div className="monster-frame dc-frame">
                    <div className="monster-glow" style={isOwned ? { background: `${getAttributeColor(card.attribute)}4d` } : undefined} />
                    <div className="monster-emoji">
                      {isOwned ? card.monsterEmoji : "?"}
                    </div>
                  </div>

                  <div className="dc-rarity">
                    {isOwned
                      ? `${card.rarity} / ${getRarityLabel(card.rarity)}`
                      : "??? / UNKNOWN"}
                  </div>

                  <div className="dc-rarity-meter" aria-hidden="true">
                    {Array.from({ length: 5 }, (_, tierIndex) => {
                      const isActive = isOwned && tierIndex < rarityRank;
                      return (
                        <span
                          key={tierIndex}
                          className={isActive ? "active" : ""}
                          style={isActive ? getRarityMeterActiveStyle(card.rarity) : undefined}
                        />
                      );
                    })}
                  </div>

                  <h2 className="dc-name">
                    {isOwned ? card.name : "Unknown"}
                  </h2>

                  <p className="dc-attr" style={{ color: isOwned ? getAttributeColor(card.attribute) : undefined }}>
                    {isOwned
                      ? `${card.emoji} ${card.attribute} · ${card.species}`
                      : "??? · ???"}
                  </p>

                  {isOwned && (
                    <div className="dc-growth-row">
                      <span>Lv.{monsterProgress.level}/20</span>
                      <span>覚醒 Lv.{awakeningLevel}</span>
                    </div>
                  )}

                  <div className="dc-footer">
                    <span className={`dc-status ${getStatusClass(status)}`}>
                      {isOwned ? status : "未獲得"}
                    </span>
                    {isOwned && ownedCopies > 1 && (
                      <span className="dc-copies">×{ownedCopies}</span>
                    )}
                  </div>

                  <div className="exp-track dc-exp">
                    <div style={{ width: `${isOwned ? expPercent : 0}%` }} />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <style jsx>{`
        .cards-filter-panel {
          margin-top: 24px;
        }

        .cards-filter-stats {
          margin-top: 18px;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }

        .cards-filter-stats div {
          border-radius: 18px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.055);
          padding: 14px;
        }

        .cards-filter-stats span {
          display: block;
          color: #94a3b8;
          font-size: 11px;
          font-weight: 800;
        }

        .cards-filter-stats strong {
          display: block;
          margin-top: 6px;
          font-size: 18px;
          font-weight: 1000;
        }

        /* Grid top margin */
        .dex-grid {
          margin-top: 22px;
        }

        /* Empty state */
        .dex-empty {
          min-height: 320px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          text-align: center;
          margin-top: 22px;
        }

        .dex-empty div {
          font-size: 72px;
        }

        .dex-empty h2 {
          margin: 18px 0 0;
          font-size: 26px;
          font-weight: 1000;
        }

        .dex-empty p {
          margin: 10px 0 0;
          color: #94a3b8;
        }

        /* ==============================
           Dex Card — trading card style
        ============================== */

        .dex-card {
          --dc-main-rgb: 148 163 184;
          --dc-accent-rgb: 203 213 225;
          --dc-shadow-rgb: 15 23 42;
          --dc-rare-text: #ffffff;
          --dc-foil-opacity: 0.16;
          display: flex;
          flex-direction: column;
          padding: 12px;
          min-height: 278px;
          border-width: 2px;
          border-color: rgb(var(--dc-main-rgb) / 0.36);
          box-shadow:
            0 18px 42px rgba(0, 0, 0, 0.32),
            0 0 22px rgb(var(--dc-main-rgb) / 0.16),
            inset 0 0 0 1px rgb(var(--dc-main-rgb) / 0.12);
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            border-color 0.2s ease,
            background 0.2s ease;
          border-radius: 20px;
          isolation: isolate;
        }

        /* Use double-class specificity to guarantee override of globals.css */
        .monster-card.dex-card {
          background:
            radial-gradient(circle at 76% 0%, rgb(var(--dc-main-rgb) / 0.24), transparent 44%),
            radial-gradient(circle at 12% 100%, rgb(var(--dc-accent-rgb) / 0.12), transparent 38%),
            rgb(15 22 48);
        }

        .dex-card::before,
        .dex-card::after {
          content: "";
          position: absolute;
          pointer-events: none;
        }

        .dex-card::before {
          inset: 0;
          z-index: 1;
          border-radius: inherit;
          opacity: var(--dc-foil-opacity);
          background:
            linear-gradient(112deg, transparent 0 18%, rgb(255 255 255 / 0.38) 23%, transparent 31% 100%);
          transform: translateX(-38%);
          mix-blend-mode: screen;
        }

        .dex-card::after {
          inset: 6px;
          z-index: 1;
          border: 1px solid rgb(var(--dc-main-rgb) / 0.18);
          border-radius: 15px;
          box-shadow: inset 0 0 28px rgb(var(--dc-main-rgb) / 0.08);
        }

        .dex-card > :not(.dc-rarity-aura) {
          position: relative;
          z-index: 2;
        }

        .dex-card:hover {
          transform: translateY(-6px) scale(1.02);
          border-color: rgb(var(--dc-main-rgb) / 0.78);
          box-shadow:
            0 26px 54px rgba(0, 0, 0, 0.38),
            0 0 36px rgb(var(--dc-main-rgb) / 0.34),
            inset 0 0 0 1px rgb(var(--dc-accent-rgb) / 0.18);
        }

        .dex-card:hover::before {
          animation: dcCardFoilSweep 0.9s ease both;
        }

        .dex-card.awakening-1 {
          border-color: rgba(34, 211, 238, 0.5);
          box-shadow:
            0 18px 42px rgba(0, 0, 0, 0.32),
            0 0 28px rgba(34, 211, 238, 0.24),
            inset 0 0 0 1px rgba(34, 211, 238, 0.14);
        }

        .dex-card.awakening-2 .dc-rarity-aura {
          opacity: 0.78;
          filter: blur(16px);
          background:
            radial-gradient(circle at 50% 50%, rgba(34, 211, 238, 0.34), transparent 58%),
            conic-gradient(from 0deg, rgba(34, 211, 238, 0.36), transparent, rgba(250, 204, 21, 0.22), transparent);
        }

        .dex-card.awakening-3 {
          border-color: rgba(250, 204, 21, 0.62);
          box-shadow:
            0 22px 52px rgba(0, 0, 0, 0.38),
            0 0 34px rgba(250, 204, 21, 0.28),
            0 0 48px rgba(34, 211, 238, 0.16),
            inset 0 0 0 1px rgba(250, 204, 21, 0.18);
        }

        .dex-card.awakening-3::after {
          border-color: rgba(250, 204, 21, 0.34);
          box-shadow:
            inset 0 0 28px rgba(250, 204, 21, 0.12),
            0 0 18px rgba(250, 204, 21, 0.16);
        }

        /* Rarity-specific glows & frames */

        /* N — Steel */
        .dex-card.rarity-n {
          --dc-main-rgb: 148 163 184;
          --dc-accent-rgb: 226 232 240;
          --dc-shadow-rgb: 71 85 105;
          --dc-rare-text: #111827;
          --dc-foil-opacity: 0.04;
          border-color: rgba(148, 163, 184, 0.22);
          box-shadow:
            0 14px 30px rgba(0, 0, 0, 0.3),
            0 0 12px rgb(var(--dc-main-rgb) / 0.1),
            inset 0 0 0 1px rgb(var(--dc-main-rgb) / 0.07);
        }
        .dex-card.rarity-n .dc-frame {
          background:
            radial-gradient(circle at 50% 20%, rgba(226, 232, 240, 0.3), transparent 52%),
            linear-gradient(135deg, rgba(71, 85, 105, 0.34), rgba(30, 41, 59, 0.48));
          border-color: rgba(148, 163, 184, 0.28);
        }
        .dex-card.rarity-n .monster-glow {
          background: rgba(148, 163, 184, 0.22);
        }
        .dex-card.rarity-n .dc-rarity {
          color: #e2e8f0;
          background: rgba(148, 163, 184, 0.12);
          border-color: rgba(148, 163, 184, 0.26);
        }

        /* R — Cyan */
        .dex-card.rarity-r {
          --dc-main-rgb: 34 211 238;
          --dc-accent-rgb: 96 165 250;
          --dc-shadow-rgb: 8 145 178;
          --dc-rare-text: #062235;
          --dc-foil-opacity: 0.1;
          border-color: rgba(34, 211, 238, 0.45);
          box-shadow:
            0 0 20px rgba(34, 211, 238, 0.28),
            0 14px 36px rgba(0, 0, 0, 0.3),
            inset 0 3px 0 rgba(34, 211, 238, 0.55),
            inset 0 0 0 1px rgba(34, 211, 238, 0.1);
        }
        .dex-card.rarity-r:hover {
          box-shadow:
            inset 0 3px 0 rgba(34, 211, 238, 0.8),
            0 0 34px rgba(34, 211, 238, 0.58),
            0 18px 42px rgba(0, 0, 0, 0.34);
        }
        .dex-card.rarity-r .dc-frame {
          background:
            radial-gradient(circle at 50% 20%, rgba(34, 211, 238, 0.44), transparent 52%),
            linear-gradient(135deg, rgba(34, 211, 238, 0.3), rgba(59, 130, 246, 0.22));
          border-color: rgba(34, 211, 238, 0.4);
        }
        .dex-card.rarity-r .monster-glow {
          background: rgba(34, 211, 238, 0.32);
        }
        .dex-card.rarity-r .dc-rarity {
          color: #67e8f9;
          background: rgba(34, 211, 238, 0.13);
          border-color: rgba(34, 211, 238, 0.32);
        }

        /* SR — Purple */
        .dex-card.rarity-sr {
          --dc-main-rgb: 168 85 247;
          --dc-accent-rgb: 34 211 238;
          --dc-shadow-rgb: 126 34 206;
          --dc-rare-text: #ffffff;
          --dc-foil-opacity: 0.22;
          border-color: rgba(168, 85, 247, 0.6);
          box-shadow:
            0 20px 48px rgba(0, 0, 0, 0.36),
            0 0 36px rgba(168, 85, 247, 0.42),
            inset 0 3px 0 rgba(168, 85, 247, 0.75),
            inset 0 0 0 1px rgba(216, 180, 254, 0.18);
        }
        .dex-card.rarity-sr:hover {
          box-shadow:
            inset 0 3px 0 rgba(168, 85, 247, 0.9),
            0 0 44px rgba(168, 85, 247, 0.7),
            0 18px 42px rgba(0, 0, 0, 0.34);
        }
        .dex-card.rarity-sr .dc-frame {
          background:
            radial-gradient(circle at 50% 20%, rgba(168, 85, 247, 0.54), transparent 52%),
            linear-gradient(135deg, rgba(168, 85, 247, 0.36), rgba(34, 211, 238, 0.2));
          border-color: rgba(168, 85, 247, 0.52);
        }
        .dex-card.rarity-sr .monster-glow {
          background: rgba(168, 85, 247, 0.38);
        }
        .dex-card.rarity-sr .dc-rarity {
          color: #d8b4fe;
          background: rgba(168, 85, 247, 0.16);
          border-color: rgba(168, 85, 247, 0.38);
        }

        /* SSR — Gold with shimmer */
        .dex-card.rarity-ssr {
          --dc-main-rgb: 250 204 21;
          --dc-accent-rgb: 251 146 60;
          --dc-shadow-rgb: 217 119 6;
          --dc-rare-text: #201007;
          --dc-foil-opacity: 0.32;
          border-width: 2px;
          border-color: rgba(250, 204, 21, 0.65);
          background:
            radial-gradient(circle at 72% 2%, rgba(250, 204, 21, 0.45), transparent 42%),
            radial-gradient(circle at 14% 92%, rgba(251, 146, 60, 0.28), transparent 38%),
            linear-gradient(150deg, rgb(42 26 4), rgb(65 40 8) 45%, rgb(12 10 26));
          animation: dcSSRGlow 2.4s ease-in-out infinite;
        }
        .dex-card.rarity-ssr:hover {
          animation-play-state: paused;
          box-shadow:
            inset 0 4px 0 rgba(250, 204, 21, 0.95),
            0 0 58px rgba(250, 204, 21, 0.78),
            0 20px 46px rgba(0, 0, 0, 0.36);
        }
        .dex-card.rarity-ssr .dc-frame {
          background:
            radial-gradient(circle at 50% 20%, rgba(251, 191, 36, 0.58), transparent 52%),
            linear-gradient(135deg, rgba(251, 191, 36, 0.4), rgba(234, 88, 12, 0.26));
          border-color: rgba(251, 191, 36, 0.56);
          overflow: hidden;
        }
        .dex-card.rarity-ssr .dc-frame::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: linear-gradient(
            110deg,
            transparent 22%,
            rgba(255, 255, 255, 0.32) 48%,
            rgba(255, 248, 120, 0.15) 54%,
            transparent 78%
          );
          background-size: 200% 100%;
          animation: dcFrameShimmer 2.6s ease-in-out infinite;
          pointer-events: none;
        }
        .dex-card.rarity-ssr .monster-glow {
          background: rgba(251, 191, 36, 0.36);
        }
        .dex-card.rarity-ssr .dc-rarity {
          color: #fde047;
          background: rgba(251, 191, 36, 0.16);
          border-color: rgba(251, 191, 36, 0.44);
        }

        /* UR — Rainbow animated */
        .dex-card.rarity-ur {
          --dc-main-rgb: 255 80 200;
          --dc-accent-rgb: 100 200 255;
          --dc-shadow-rgb: 250 204 21;
          --dc-rare-text: #ffffff;
          --dc-foil-opacity: 0.42;
          border-width: 2px;
          background:
            radial-gradient(circle at 72% 0%, rgba(255, 80, 200, 0.5), transparent 38%),
            radial-gradient(circle at 14% 92%, rgba(100, 200, 255, 0.36), transparent 38%),
            radial-gradient(circle at 50% 50%, rgba(250, 200, 80, 0.18), transparent 55%),
            linear-gradient(140deg, rgb(50 8 62), rgb(8 14 44) 42%, rgb(48 22 4));
          animation: dcURGlow 2.8s linear infinite;
        }
        .dex-card.rarity-ur:hover {
          animation-play-state: paused;
          box-shadow:
            inset 0 4px 0 #fff,
            0 0 60px rgba(255, 80, 200, 0.75),
            0 0 30px rgba(100, 200, 255, 0.42),
            0 8px 32px rgba(0, 0, 0, 0.3);
          border-color: rgba(255, 255, 255, 0.96);
        }
        .dex-card.rarity-ur .dc-frame {
          background:
            radial-gradient(circle at 50% 20%, rgba(255, 80, 200, 0.54), transparent 52%),
            linear-gradient(135deg, rgba(255, 80, 200, 0.34), rgba(100, 200, 255, 0.32));
          border-color: rgba(255, 255, 255, 0.58);
          overflow: hidden;
        }
        .dex-card.rarity-ur .dc-frame::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: linear-gradient(
            110deg,
            transparent 15%,
            rgba(255, 255, 255, 0.4) 42%,
            rgba(100, 200, 255, 0.22) 55%,
            transparent 85%
          );
          background-size: 200% 100%;
          animation: dcFrameShimmer 1.8s ease-in-out infinite;
          pointer-events: none;
        }
        .dex-card.rarity-ur .monster-glow {
          width: 130px;
          height: 130px;
          background: rgba(255, 80, 200, 0.4);
          animation: dcURGlowPulse 2s ease-in-out infinite;
        }
        .dex-card.rarity-ur .dc-rarity {
          color: #ffffff;
          background: linear-gradient(135deg, rgba(255, 80, 200, 0.22), rgba(100, 200, 255, 0.2));
          border-color: rgba(255, 255, 255, 0.42);
        }

        .dc-rarity-aura {
          position: absolute;
          inset: -18% -16%;
          z-index: 0;
          border-radius: inherit;
          opacity: 0.32;
          background:
            radial-gradient(circle at 70% 14%, rgb(var(--dc-main-rgb) / 0.5), transparent 30%),
            radial-gradient(circle at 18% 86%, rgb(var(--dc-accent-rgb) / 0.3), transparent 28%);
          filter: blur(18px);
          pointer-events: none;
        }

        .dex-card.rarity-sr .dc-rarity-aura,
        .dex-card.rarity-ssr .dc-rarity-aura,
        .dex-card.rarity-ur .dc-rarity-aura {
          animation: dcAuraPulse 3.8s ease-in-out infinite;
        }

        .dex-card.unknown-card {
          filter: saturate(0.38) brightness(0.58);
        }
        .dex-card.unknown-card:hover {
          filter: saturate(0.52) brightness(0.72);
          transform: translateY(-3px) scale(1.01);
        }
        .dex-card.unknown-card .dc-rarity-aura {
          opacity: 0.12;
        }
        .dex-card.unknown-card::before {
          opacity: 0.06;
        }

        /* Rarity keyframes */
        @keyframes dcSSRGlow {
          0%, 100% {
            box-shadow:
              inset 0 4px 0 rgba(250, 204, 21, 0.9),
              0 0 32px rgba(250, 204, 21, 0.44),
              0 18px 42px rgba(0, 0, 0, 0.32);
          }
          50% {
            box-shadow:
              inset 0 4px 0 rgba(251, 146, 60, 0.9),
              0 0 58px rgba(250, 204, 21, 0.72),
              0 0 28px rgba(234, 88, 12, 0.32),
              0 18px 42px rgba(0, 0, 0, 0.34);
          }
        }
        @keyframes dcURGlow {
          0%, 100% {
            box-shadow:
              inset 0 4px 0 #ff50c8,
              0 0 44px rgba(255, 80, 200, 0.68),
              0 0 80px rgba(255, 80, 200, 0.28),
              0 0 20px rgba(255, 255, 255, 0.2);
            border-color: rgba(255, 80, 200, 0.85);
          }
          33% {
            box-shadow:
              inset 0 4px 0 #64c8ff,
              0 0 44px rgba(100, 200, 255, 0.68),
              0 0 80px rgba(100, 200, 255, 0.28),
              0 0 20px rgba(255, 255, 255, 0.2);
            border-color: rgba(100, 200, 255, 0.85);
          }
          66% {
            box-shadow:
              inset 0 4px 0 #facc15,
              0 0 44px rgba(255, 200, 80, 0.68),
              0 0 80px rgba(255, 200, 80, 0.28),
              0 0 20px rgba(255, 255, 255, 0.2);
            border-color: rgba(255, 200, 80, 0.85);
          }
        }
        @keyframes dcFrameShimmer {
          0% { background-position: -100% 0; }
          60%, 100% { background-position: 200% 0; }
        }
        @keyframes dcURGlowPulse {
          0%, 100% { background: rgba(255, 80, 200, 0.4); }
          50% { background: rgba(100, 200, 255, 0.44); }
        }
        @keyframes dcAuraPulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.46; transform: scale(1.06); }
        }
        @keyframes dcCardFoilSweep {
          0% { transform: translateX(-58%); }
          100% { transform: translateX(62%); }
        }
        /* Header row */
        .dc-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 4px;
          margin-bottom: 4px;
          min-height: 20px;
        }

        .dc-no {
          font-size: 9px;
          font-weight: 1000;
          color: rgb(var(--dc-accent-rgb) / 0.78);
          background: rgb(0 0 0 / 0.24);
          border: 1px solid rgb(var(--dc-main-rgb) / 0.2);
          border-radius: 999px;
          padding: 2px 7px;
        }

        .dc-badge {
          border-radius: 999px;
          padding: 2px 7px;
          font-size: 8px;
          font-weight: 1000;
          letter-spacing: 0.05em;
        }

        .dc-badge-master {
          background: linear-gradient(135deg, rgba(52, 211, 153, 0.3), rgba(34, 211, 238, 0.2));
          border: 1px solid rgba(52, 211, 153, 0.5);
          color: #bbf7d0;
        }

        .dc-badge-unknown {
          background: rgba(148, 163, 184, 0.1);
          border: 1px solid rgba(148, 163, 184, 0.18);
          color: #64748b;
        }

        /* Emoji frame — overrides .monster-frame height */
        .dc-frame {
          margin: 0 0 6px;
          height: 118px;
          border-radius: 16px;
          flex-shrink: 0;
          box-shadow:
            inset 0 0 34px rgb(var(--dc-main-rgb) / 0.1),
            0 12px 28px rgba(0, 0, 0, 0.22);
        }

        .dc-frame::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 1;
          opacity: 0.42;
          background:
            radial-gradient(circle, rgb(255 255 255 / 0.42) 0 1px, transparent 2px),
            radial-gradient(circle, rgb(var(--dc-main-rgb) / 0.58) 0 1px, transparent 2px);
          background-position: 18px 18px, 64px 38px;
          background-size: 62px 62px, 84px 84px;
          pointer-events: none;
        }

        /* Rarity chip */
        .dc-rarity {
          padding: 5px 8px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.07);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #fde68a;
          font-size: 9px;
          font-weight: 1000;
          text-align: center;
          letter-spacing: 0.05em;
        }

        .dex-card.rarity-n .dc-rarity {
          border-radius: 7px;
          background: linear-gradient(90deg, rgba(71, 85, 105, 0.42), rgba(148, 163, 184, 0.16));
        }

        .dex-card.rarity-r .dc-rarity {
          border-radius: 10px;
          background:
            linear-gradient(90deg, rgba(34, 211, 238, 0.36), rgba(59, 130, 246, 0.18));
          box-shadow: inset 4px 0 0 rgba(103, 232, 249, 0.82);
        }

        .dex-card.rarity-sr .dc-rarity {
          border-radius: 12px 4px 12px 4px;
          background:
            linear-gradient(90deg, rgba(168, 85, 247, 0.44), rgba(34, 211, 238, 0.22));
          box-shadow:
            inset 4px 0 0 rgba(216, 180, 254, 0.86),
            0 0 16px rgba(168, 85, 247, 0.26);
        }

        .dex-card.rarity-ssr .dc-rarity {
          border-radius: 5px;
          color: #1f1304;
          background:
            linear-gradient(90deg, #fef3c7, #facc15 42%, #fb923c);
          border-color: rgba(255, 255, 255, 0.34);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.62),
            0 0 20px rgba(250, 204, 21, 0.34);
          text-shadow: 0 1px 0 rgba(255, 255, 255, 0.36);
          font-size: 10px;
          padding: 5px 10px;
        }
        .dex-card.rarity-ssr .dc-rarity::before {
          content: "✦ ";
          font-size: 9px;
        }

        .dex-card.rarity-ur .dc-rarity {
          border-radius: 12px;
          color: white;
          background:
            linear-gradient(#10162e, #10162e) padding-box,
            conic-gradient(from 20deg, #ff50c8, #64c8ff, #facc15, #ffffff, #ff50c8) border-box;
          border: 2px solid transparent;
          font-size: 10px;
          padding: 5px 10px;
          box-shadow:
            0 0 18px rgba(255, 80, 200, 0.36),
            0 0 26px rgba(100, 200, 255, 0.24);
        }
        .dex-card.rarity-ur .dc-rarity::before {
          content: "★ ";
          font-size: 9px;
          background: linear-gradient(90deg, #ff50c8, #64c8ff, #facc15);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .dc-rarity-meter {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 3px;
          margin-top: 8px;
          height: 8px;
        }

        .dc-rarity-meter span {
          border-radius: 999px;
          background: rgba(148, 163, 184, 0.12);
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.05);
        }

        .dc-rarity-meter span.active {
          background: linear-gradient(
            90deg,
            rgb(var(--dc-main-rgb)),
            rgb(var(--dc-accent-rgb))
          );
          box-shadow:
            0 0 8px rgba(var(--dc-main-rgb), 0.7),
            0 0 16px rgba(var(--dc-main-rgb), 0.35);
        }

        .dex-card.rarity-ssr .dc-rarity-meter span.active {
          background: linear-gradient(90deg, #facc15, #fb923c);
          box-shadow: 0 0 8px rgba(250, 204, 21, 0.8), 0 0 16px rgba(250, 204, 21, 0.4);
        }

        .dex-card.rarity-ur .dc-rarity-meter span.active {
          background: linear-gradient(90deg, #ff50c8, #64c8ff, #facc15);
          box-shadow: 0 0 8px rgba(255, 80, 200, 0.8), 0 0 16px rgba(100, 200, 255, 0.4);
        }

        .dex-card.rarity-sr .dc-rarity-meter span.active {
          background: linear-gradient(90deg, #a855f7, #22d3ee);
          box-shadow: 0 0 8px rgba(168, 85, 247, 0.8), 0 0 16px rgba(168, 85, 247, 0.4);
        }

        .dex-card.rarity-r .dc-rarity-meter span.active {
          background: linear-gradient(90deg, #22d3ee, #60a5fa);
          box-shadow: 0 0 8px rgba(34, 211, 238, 0.7), 0 0 14px rgba(34, 211, 238, 0.35);
        }

        .dex-card.rarity-n .dc-rarity-meter span.active {
          background: linear-gradient(90deg, #94a3b8, #e2e8f0);
          box-shadow: none;
        }

        .dex-card.rarity-ssr .dc-frame {
          border-width: 2px;
          box-shadow:
            inset 0 0 44px rgba(250, 204, 21, 0.22),
            0 0 0 1px rgba(254, 243, 199, 0.2),
            0 16px 34px rgba(0, 0, 0, 0.28);
        }

        .dex-card.rarity-ur .dc-frame {
          border: 2px solid transparent;
          background:
            radial-gradient(circle at 50% 20%, rgba(255, 255, 255, 0.38), transparent 44%) padding-box,
            linear-gradient(135deg, rgba(255, 80, 200, 0.44), rgba(100, 200, 255, 0.42)) padding-box,
            conic-gradient(from 0deg, #ff50c8, #64c8ff, #facc15, #ffffff, #ff50c8) border-box;
          box-shadow:
            inset 0 0 50px rgba(255, 255, 255, 0.12),
            0 0 24px rgba(255, 80, 200, 0.28),
            0 0 42px rgba(100, 200, 255, 0.2);
        }

        /* Card name */
        .dc-name {
          margin: 9px 0 0;
          font-size: 15px;
          font-weight: 1000;
          line-height: 1.2;
          white-space: normal;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        /* Attribute / species */
        .dc-attr {
          margin: 4px 0 0;
          color: #94a3b8;
          font-size: 10px;
          font-weight: 800;
          line-height: 1.4;
          white-space: normal;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .dc-growth-row {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          margin-top: 8px;
        }

        .dc-growth-row span {
          border-radius: 999px;
          border: 1px solid rgba(34, 211, 238, 0.18);
          background: rgba(34, 211, 238, 0.08);
          color: #a5f3fc;
          padding: 4px 7px;
          font-size: 9px;
          font-weight: 1000;
          line-height: 1.1;
        }

        /* Footer row */
        .dc-footer {
          margin-top: auto;
          padding-top: 8px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
          flex-wrap: wrap;
        }

        .dc-status {
          border-radius: 999px;
          padding: 4px 8px;
          font-size: 9px;
          font-weight: 1000;
        }

        .dc-status-master {
          background: rgba(52, 211, 153, 0.16);
          color: #bbf7d0;
        }
        .dc-status-growing {
          background: rgba(34, 211, 238, 0.14);
          color: #cffafe;
        }
        .dc-status-owned {
          background: rgb(var(--dc-main-rgb) / 0.16);
          color: rgb(var(--dc-accent-rgb) / 0.96);
          border: 1px solid rgb(var(--dc-main-rgb) / 0.2);
        }
        .dc-status-none {
          background: rgba(148, 163, 184, 0.1);
          color: #64748b;
        }

        .dc-copies {
          font-size: 9px;
          font-weight: 1000;
          color: #fde68a;
          background: rgba(251, 191, 36, 0.1);
          border: 1px solid rgba(251, 191, 36, 0.22);
          border-radius: 999px;
          padding: 3px 7px;
        }

        /* EXP bar at bottom */
        .dc-exp {
          margin-top: 8px;
        }

        .dc-exp div {
          background: linear-gradient(90deg, rgb(var(--dc-main-rgb)), rgb(var(--dc-accent-rgb)));
          box-shadow: 0 0 12px rgb(var(--dc-main-rgb) / 0.42);
        }

        @media (prefers-reduced-motion: reduce) {
          .dex-card,
          .dex-card::before,
          .dex-card .dc-rarity-aura,
          .dex-card .dc-frame::after,
          .dex-card.rarity-ssr,
          .dex-card.rarity-ur {
            animation: none !important;
          }
        }

        /* Attribute filter */
        .attr-filter {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 14px;
        }

        .attr-filter > span {
          font-size: 12px;
          font-weight: 800;
          color: #94a3b8;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .attr-scroll {
          display: flex;
          gap: 6px;
          overflow-x: auto;
          flex: 1;
          padding-bottom: 4px;
          scrollbar-width: thin;
        }

        .attr-scroll button {
          white-space: nowrap;
          padding: 6px 10px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          background: rgba(255, 255, 255, 0.07);
          color: #94a3b8;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.15s;
          flex-shrink: 0;
        }

        .attr-scroll button:hover {
          border-color: rgba(255, 255, 255, 0.3);
          background: rgba(255, 255, 255, 0.12);
          color: white;
        }

        @media (max-width: 1200px) {
          .cards-filter-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 720px) {
          .cards-filter-stats {
            grid-template-columns: 1fr;
          }

          .dex-card {
            min-height: 238px;
          }

          .dc-frame {
            height: 96px;
          }

          .dc-name {
            font-size: 13px;
          }
        }
      `}</style>
    </main>
  );
}
