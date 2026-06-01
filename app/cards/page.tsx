"use client";

import {
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import Image from "next/image";
import PageTopBar from "../components/PageTopBar";
import {
  allAttributes,
  attributeEmojiMap,
  getAttributeLabel,
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
  if (rarity === "SAR") return "SPECIAL ART";
  if (rarity === "UR") return "ULTIMATE";
  if (rarity === "SSR") return "LEGEND";
  if (rarity === "SR") return "EPIC";
  if (rarity === "R") return "RARE";
  return "NORMAL";
}

function getRarityRank(rarity: Rarity) {
  if (rarity === "SAR") return 6;
  if (rarity === "UR") return 5;
  if (rarity === "SSR") return 4;
  if (rarity === "SR") return 3;
  if (rarity === "R") return 2;
  return 1;
}

function getRarityMeterActiveStyle(rarity: Rarity): React.CSSProperties {
  if (rarity === "SAR") return { background: "linear-gradient(90deg, #fde68a, #fb7185, #a855f7, #22d3ee)" };
  if (rarity === "UR") return { background: "linear-gradient(90deg, #ff50c8, #64c8ff, #facc15)" };
  if (rarity === "SSR") return { background: "linear-gradient(90deg, #facc15, #fb923c)" };
  if (rarity === "SR") return { background: "linear-gradient(90deg, #a855f7, #22d3ee)" };
  if (rarity === "R") return { background: "linear-gradient(90deg, #22d3ee, #60a5fa)" };
  return { background: "linear-gradient(90deg, #94a3b8, #e2e8f0)" };
}

function isSrOrHigher(rarity: Rarity) {
  return rarity === "SAR" || rarity === "UR" || rarity === "SSR" || rarity === "SR";
}

function getStatusClass(status: string) {
  if (status === "マスター") return "dc-status-master";
  if (status === "成長中") return "dc-status-growing";
  if (status === "獲得済み") return "dc-status-owned";
  return "dc-status-none";
}

const INITIAL_LIMIT = 60;
const PAGE_SIZE = 60;

export default function CardsPage() {
  const [earnedCards, setEarnedCards] = useState<EarnedCard[]>([]);
  const [rarityFilter, setRarityFilter] = useState<"すべて" | Rarity>("すべて");
  const [ownedFilter, setOwnedFilter] = useState<OwnedFilter>("all");
  const [attributeFilter, setAttributeFilter] = useState("すべて");
  const [displayLimit, setDisplayLimit] = useState({
    count: INITIAL_LIMIT,
    filterKey: "",
  });

  const deferredRarityFilter = useDeferredValue(rarityFilter);
  const deferredOwnedFilter = useDeferredValue(ownedFilter);
  const deferredAttributeFilter = useDeferredValue(attributeFilter);

  const isFilterPending =
    deferredRarityFilter !== rarityFilter ||
    deferredOwnedFilter !== ownedFilter ||
    deferredAttributeFilter !== attributeFilter;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const loaded = loadEarnedCards();
      setEarnedCards(loaded);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const filterKey = `${deferredRarityFilter}|${deferredOwnedFilter}|${deferredAttributeFilter}`;
  const displayCount =
    displayLimit.filterKey === filterKey ? displayLimit.count : INITIAL_LIMIT;

  const earnedCardMap = useMemo(() => {
    return new Map(earnedCards.map((card) => [card.cardId, card]));
  }, [earnedCards]);

  const ownedCount = earnedCards.length;
  const totalCount = monsterCards.length;
  const collectionRate =
    getCollectionRate(ownedCount, totalCount);

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
    return monsterCards.filter((card) => {
      const earnedCard = earnedCardMap.get(card.id);
      const isOwned = Boolean(earnedCard);

      const matchesRarity =
        deferredRarityFilter === "すべて" || card.rarity === deferredRarityFilter;

      const matchesOwned =
        deferredOwnedFilter === "all" ||
        (deferredOwnedFilter === "owned" && isOwned) ||
        (deferredOwnedFilter === "notOwned" && !isOwned);

      const matchesAttribute =
        deferredAttributeFilter === "すべて" || card.attribute === deferredAttributeFilter;

      return matchesRarity && matchesOwned && matchesAttribute;
    });
  }, [deferredRarityFilter, deferredOwnedFilter, deferredAttributeFilter, earnedCardMap]);

  const displayedCards = useMemo(
    () => filteredCards.slice(0, displayCount),
    [filteredCards, displayCount],
  );
  const hasMore = displayCount < filteredCards.length;


  return (
    <main className="eq-page cards-page">
      <div className="eq-bg-orb eq-bg-orb-one" />
      <div className="eq-bg-orb eq-bg-orb-two" />
      <div className="eq-bg-orb eq-bg-orb-three" />

      <section className="eq-shell">
        <PageTopBar />

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

          </div>

          <div className="book-stage">
            <div className="eq-display-card cards-display-card">
              <div className="eq-display-shine" />
              <div className="eq-display-icon eq-display-image-frame">
                <Image
                  src="/home-icons/cards.png"
                  alt=""
                  width={1254}
                  height={787}
                  className="eq-display-image"
                  sizes="150px"
                  aria-hidden="true"
                />
              </div>
              <p>MONSTER CARDS</p>
              <h2>{ownedCount}/{totalCount}</h2>
              <span>{collectionRate}% collected</span>
            </div>
          </div>
        </div>

        <div className="eq-panel cards-filter-panel">
          <div className="filter-grid">
            <div className="rarity-filter">
              <span>レア度</span>
              <div className="rarity-buttons">
                {(["すべて", "N", "R", "SR", "SSR", "UR", "SAR"] as const).map((rarity) => (
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
                  {attr === "すべて" ? "すべて" : `${attributeEmojiMap[attr as MainAttribute]} ${getAttributeLabel(attr as MainAttribute)}`}
                </button>
              ))}
            </div>
          </div>

          <div className="cards-filter-stats">
            <div>
              <span>表示中</span>
              <strong>{displayedCards.length} / {filteredCards.length} 件</strong>
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
            {displayedCards.map((card) => {
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
                    {Array.from({ length: 6 }, (_, tierIndex) => {
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
                      ? `${card.emoji} ${getAttributeLabel(card.attribute)} · ${card.species}`
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

        {hasMore && (
          <button
            type="button"
            className="cards-load-more"
            onClick={() =>
              setDisplayLimit({
                count: displayCount + PAGE_SIZE,
                filterKey,
              })
            }
          >
            さらに {Math.min(PAGE_SIZE, filteredCards.length - displayCount)} 件表示
            <span className="cards-load-more-count">
              {displayCount} / {filteredCards.length}
            </span>
          </button>
        )}
      </section>

      <style jsx>{`
        .cards-filter-panel {
          margin-top: 18px;
          padding: 18px;
        }

        .cards-filter-panel .filter-grid {
          display: grid;
          grid-template-columns: minmax(430px, 1.4fr) minmax(260px, 0.75fr);
          gap: 14px;
          align-items: end;
        }

        .cards-filter-panel .rarity-filter,
        .cards-filter-panel .owned-filter {
          min-width: 0;
        }

        .cards-filter-panel .rarity-filter > span,
        .cards-filter-panel .owned-filter > span,
        .cards-filter-panel .attr-filter > span {
          display: block;
          margin: 0 0 7px;
          color: #94a3b8;
          font-size: 11px;
          font-weight: 1000;
          letter-spacing: 0.08em;
        }

        .cards-filter-panel .rarity-buttons,
        .cards-filter-panel .owned-buttons {
          display: grid;
          gap: 8px;
        }

        .cards-filter-panel .rarity-buttons {
          grid-template-columns: repeat(7, minmax(0, 1fr));
        }

        .cards-filter-panel .owned-buttons {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .cards-filter-panel .rarity-buttons button,
        .cards-filter-panel .owned-buttons button,
        .cards-filter-panel .attr-scroll button {
          min-width: 0;
          min-height: 42px;
          border-radius: 14px;
          padding: 0 10px;
        }

        .cards-filter-panel .owned-buttons button {
          min-width: 0;
        }

        .cards-filter-panel .attr-filter {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr);
          align-items: center;
          gap: 12px;
          margin-top: 14px;
          padding-top: 14px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .cards-filter-panel .attr-filter > span {
          margin-bottom: 0;
        }

        .cards-filter-panel .attr-scroll {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          overflow: visible;
          padding-bottom: 0;
        }

        .cards-filter-panel .attr-scroll button {
          min-width: 0;
          min-height: 34px;
          border-radius: 999px;
          font-size: 12px;
        }

        .cards-page .eq-hero {
          gap: 32px;
          padding: 38px;
        }

        .book-stage {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cards-page .eq-display-card {
          width: 252px;
          height: 352px;
          border-radius: 32px;
        }

        .cards-page .eq-display-card::before {
          border-radius: 28px;
        }

        .cards-display-card {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .cards-display-card .eq-display-image-frame {
          width: 168px;
          height: 112px;
          margin-top: 62px;
        }

        .cards-display-card p,
        .cards-display-card h2,
        .cards-display-card > span {
          position: relative;
          z-index: 2;
          text-align: center;
        }

        .cards-display-card p {
          margin: 44px 0 0;
          color: #fde68a;
          font-size: 11px;
          font-weight: 1000;
          letter-spacing: 0.18em;
        }

        .cards-display-card h2 {
          margin: 9px 0 0;
          color: #f8fafc;
          font-size: 28px;
          line-height: 1;
          font-weight: 1000;
        }

        .cards-display-card > span {
          display: block;
          margin: 7px auto 0;
          max-width: 220px;
          color: #cbd5e1;
          font-size: 13px;
          line-height: 1.3;
          font-weight: 900;
        }

        .cards-filter-stats {
          margin-top: 14px;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
        }

        .cards-filter-stats div {
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.055);
          padding: 12px;
        }

        .cards-filter-stats span {
          display: block;
          color: #94a3b8;
          font-size: 11px;
          font-weight: 800;
        }

        .cards-filter-stats strong {
          display: block;
          margin-top: 5px;
          font-size: 17px;
          font-weight: 1000;
        }

        /* Grid top margin */
        .dex-grid {
          margin-top: 16px;
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
          min-height: 254px;
          border-width: 2px;
          border-color: rgba(255, 255, 255, 0.1);
          box-shadow: 0 16px 34px rgba(0, 0, 0, 0.3);
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            border-color 0.2s ease,
            background 0.2s ease;
          border-radius: 18px;
          isolation: isolate;
        }

        /* Use double-class specificity to guarantee override of globals.css */
        .monster-card.dex-card {
          background: rgb(15 22 48);
        }

        .dex-card .monster-glow {
          display: none;
        }

        .dex-card::before,
        .dex-card::after {
          display: none;
        }

        .dex-card > * {
          position: relative;
          z-index: 2;
        }

        .dex-card:hover {
          transform: translateY(-3px);
          border-color: rgba(255, 255, 255, 0.22);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.34);
        }

        .dex-card.awakening-1 {
          border-color: rgba(255, 255, 255, 0.14);
          box-shadow: 0 16px 34px rgba(0, 0, 0, 0.3);
        }

        .dex-card.awakening-2 .dc-rarity-aura {
          display: none;
        }

        .dex-card.awakening-3 {
          border-color: rgba(255, 255, 255, 0.18);
          box-shadow: 0 16px 34px rgba(0, 0, 0, 0.3);
        }

        .dex-card.awakening-3::after {
          display: none;
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
          box-shadow: 0 14px 30px rgba(0, 0, 0, 0.3);
        }
        .dex-card.rarity-n .dc-frame {
          background: linear-gradient(135deg, rgba(71, 85, 105, 0.34), rgba(30, 41, 59, 0.48));
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
          border-color: rgba(255, 255, 255, 0.12);
          box-shadow: 0 14px 30px rgba(0, 0, 0, 0.3);
        }
        .dex-card.rarity-r:hover {
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.34);
        }
        .dex-card.rarity-r .dc-frame {
          background: linear-gradient(135deg, rgba(34, 211, 238, 0.18), rgba(59, 130, 246, 0.14));
          border-color: rgba(34, 211, 238, 0.28);
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
          border-color: rgba(255, 255, 255, 0.14);
          box-shadow: 0 14px 30px rgba(0, 0, 0, 0.3);
        }
        .dex-card.rarity-sr:hover {
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.34);
        }
        .dex-card.rarity-sr .dc-frame {
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(34, 211, 238, 0.12));
          border-color: rgba(168, 85, 247, 0.32);
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
          border-color: rgba(255, 255, 255, 0.16);
          background: linear-gradient(150deg, rgb(42 26 4), rgb(65 40 8) 45%, rgb(12 10 26));
        }
        .dex-card.rarity-ssr:hover {
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.34);
        }
        .dex-card.rarity-ssr .dc-frame {
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.22), rgba(234, 88, 12, 0.14));
          border-color: rgba(251, 191, 36, 0.36);
          overflow: hidden;
        }
        .dex-card.rarity-ssr .dc-frame::after {
          display: none;
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
          background: linear-gradient(140deg, rgb(50 8 62), rgb(8 14 44) 42%, rgb(48 22 4));
        }
        .dex-card.rarity-ur:hover {
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.34);
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
          display: none;
        }
        .dex-card.rarity-ur .monster-glow {
          width: 130px;
          height: 130px;
          background: rgba(255, 80, 200, 0.4);
        }
        .dex-card.rarity-ur .dc-rarity {
          color: #ffffff;
          background: linear-gradient(135deg, rgba(255, 80, 200, 0.22), rgba(100, 200, 255, 0.2));
          border-color: rgba(255, 255, 255, 0.42);
        }

        .dex-card.rarity-sar {
          --dc-main-rgb: 253 230 138;
          --dc-accent-rgb: 244 114 182;
          --dc-shadow-rgb: 124 58 237;
          --dc-rare-text: #ffffff;
          --dc-foil-opacity: 0.5;
          border-width: 2px;
          background:
            radial-gradient(circle at 50% 10%, rgba(255, 255, 255, 0.18), transparent 34%),
            linear-gradient(140deg, rgb(55 35 8), rgb(67 20 64) 48%, rgb(11 20 50));
        }
        .dex-card.rarity-sar:hover {
          border-color: rgba(253, 230, 138, 0.86);
          box-shadow: 0 20px 42px rgba(0, 0, 0, 0.34);
        }
        .dex-card.rarity-sar .dc-frame {
          background:
            radial-gradient(circle at 50% 18%, rgba(253, 230, 138, 0.48), transparent 48%),
            linear-gradient(135deg, rgba(244, 114, 182, 0.28), rgba(34, 211, 238, 0.22));
          border-color: rgba(253, 230, 138, 0.62);
          overflow: hidden;
        }
        .dex-card.rarity-sar .monster-glow {
          width: 138px;
          height: 138px;
          background: rgba(253, 230, 138, 0.42);
        }
        .dex-card.rarity-sar .dc-rarity {
          color: #1f1304;
          background: linear-gradient(90deg, #fef3c7, #fb7185 44%, #a855f7 72%, #22d3ee);
          border-color: rgba(255, 255, 255, 0.48);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.72),
            0 0 24px rgba(253, 230, 138, 0.38);
          text-shadow: 0 1px 0 rgba(255, 255, 255, 0.34);
        }

        .dc-rarity-aura {
          display: none;
        }

        .dex-card.rarity-sr .dc-rarity-aura,
        .dex-card.rarity-ssr .dc-rarity-aura,
        .dex-card.rarity-ur .dc-rarity-aura,
        .dex-card.rarity-sar .dc-rarity-aura {
          display: none;
        }

        .dex-card.unknown-card {
          opacity: 0.45;
        }
        .dex-card.unknown-card:hover {
          opacity: 0.62;
          transform: translateY(-3px) scale(1.01);
        }
        .dex-card.unknown-card .dc-rarity-aura {
          display: none;
        }
        .dex-card.unknown-card::before {
          opacity: 0.06;
        }

        /* Disable hover lift on touch devices — avoids stuck :hover on mobile */
        @media (hover: none) {
          .dex-card:hover,
          .dex-card.unknown-card:hover {
            transform: none;
            opacity: inherit;
          }
          .dex-card {
            transition: none;
          }
        }

        .cards-load-more {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          margin-top: 16px;
          padding: 14px;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.05);
          color: #94a3b8;
          font: inherit;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          transition: background 0.18s, color 0.18s;
        }
        .cards-load-more:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #f1f5f9;
        }
        .cards-load-more-count {
          font-size: 11px;
          color: #64748b;
          font-weight: 700;
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
          height: 102px;
          border-radius: 14px;
          flex-shrink: 0;
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.22);
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

        .dex-card.rarity-sar .dc-rarity::before {
          content: "SPECIAL ";
          color: #1f1304;
          font-size: 8px;
        }

        .dc-rarity-meter {
          display: grid;
          grid-template-columns: repeat(6, minmax(0, 1fr));
          gap: 4px;
          height: 7px;
          margin-top: 7px;
        }

        .dc-rarity-meter span {
          border-radius: 999px;
          background: rgba(148, 163, 184, 0.14);
        }

        .dc-rarity-meter span.active {
          box-shadow: none;
        }

        .dex-card.rarity-ssr .dc-frame {
          border-width: 2px;
          box-shadow: 0 16px 34px rgba(0, 0, 0, 0.28);
        }

        .dex-card.rarity-ur .dc-frame {
          border: 2px solid transparent;
          background:
            linear-gradient(135deg, rgba(255, 80, 200, 0.2), rgba(100, 200, 255, 0.18)) padding-box,
            conic-gradient(from 0deg, #ff50c8, #64c8ff, #facc15, #ffffff, #ff50c8) border-box;
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.3);
        }

        .dex-card.rarity-sar .dc-frame {
          border: 2px solid transparent;
          background:
            linear-gradient(135deg, rgba(253, 230, 138, 0.22), rgba(244, 114, 182, 0.2)) padding-box,
            conic-gradient(from 0deg, #fde68a, #fb7185, #a855f7, #22d3ee, #fef3c7, #fde68a) border-box;
        }

        .cards-page .monster-card.dex-card,
        .cards-page .monster-card.dex-card.rarity-n,
        .cards-page .monster-card.dex-card.rarity-r,
        .cards-page .monster-card.dex-card.rarity-sr,
        .cards-page .monster-card.dex-card.rarity-ssr,
        .cards-page .monster-card.dex-card.rarity-ur,
        .cards-page .monster-card.dex-card.rarity-sar,
        .cards-page .monster-card.dex-card.awakening-1,
        .cards-page .monster-card.dex-card.awakening-2,
        .cards-page .monster-card.dex-card.awakening-3 {
          border-color: rgba(255, 255, 255, 0.1) !important;
          box-shadow: none !important;
        }

        .cards-page .monster-card.dex-card:hover {
          border-color: rgba(255, 255, 255, 0.18) !important;
          box-shadow: none !important;
        }

        /* Card name */
        .dc-name {
          margin: 7px 0 0;
          font-size: 14px;
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
          margin-top: 6px;
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
          padding-top: 6px;
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
          margin-top: 6px;
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
          margin-top: 12px;
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
          .cards-filter-panel .filter-grid {
            grid-template-columns: 1fr 1fr;
          }

          .cards-filter-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 720px) {
          .dex-card {
            isolation: auto;
          }

          .cards-page .eq-hero {
            padding: 18px;
          }

          .cards-filter-panel .filter-grid,
          .cards-filter-panel .attr-filter {
            grid-template-columns: 1fr;
          }

          .cards-filter-panel .rarity-buttons {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }

          .cards-filter-panel .owned-buttons {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .cards-filter-panel .owned-filter {
            grid-column: auto;
          }

          .cards-filter-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
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
