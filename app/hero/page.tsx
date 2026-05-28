"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import PageTopBar from "../components/PageTopBar";
import {
  HeroStatus,
  loadHeroStatus,
} from "../../data/hero";
import {
  loadShopState,
  ShopState,
} from "../../data/shop";
import {
  EarnedCard,
  getMonsterCardById,
} from "../../data/cards";
import {
  getBuddyState,
  getMonsterNextExpLabel,
  getTitleUnlockRate,
  getTitlesByCategory,
  loadQuestProgressSnapshot,
  TITLE_CATEGORY_LABELS,
  TitleCategory,
  type ProgressionContext,
  type QuestProgressSnapshot,
} from "../../data/progression";


const DEFAULT_SHOP_STATE: ShopState = {
  selectedTitle: null,
  selectedBackground: null,
  selectedMonsterCardId: null,
};

function loadEarnedCards(): EarnedCard[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem("earnedCards");
    const parsed = saved ? JSON.parse(saved) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((c) => typeof c.cardId === "string");
  } catch {
    return [];
  }
}

export default function HeroPage() {
  const [hero, setHero] = useState<HeroStatus | null>(null);
  const [shopState, setShopState] = useState<ShopState>(DEFAULT_SHOP_STATE);
  const [earnedCards, setEarnedCards] = useState<EarnedCard[]>([]);
  const [questProgress, setQuestProgress] = useState<QuestProgressSnapshot>({});
  const [activeTitleCategory, setActiveTitleCategory] =
    useState<TitleCategory>("learning");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setHero(loadHeroStatus());
      setShopState(loadShopState());
      setEarnedCards(loadEarnedCards());
      setQuestProgress(loadQuestProgressSnapshot());
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const currentLevel = hero?.level ?? 1;
  const currentTitle = hero?.title ?? "はじまりの勇者";
  const progressionContext = useMemo<ProgressionContext>(
    () => ({
      heroLevel: currentLevel,
      earnedCards,
      selectedMonsterCardId: shopState.selectedMonsterCardId,
      questProgress,
    }),
    [currentLevel, earnedCards, shopState.selectedMonsterCardId, questProgress]
  );
  const unlockedTitles = useMemo(
    () => getTitlesByCategory(activeTitleCategory),
    [activeTitleCategory]
  );
  const activeNextTitle = useMemo(
    () => unlockedTitles.find((title) => !title.isUnlocked(progressionContext)),
    [progressionContext, unlockedTitles]
  );
  const displayTitle = currentTitle;
  const buddyEmoji = shopState.selectedMonsterCardId
    ? (getMonsterCardById(shopState.selectedMonsterCardId)?.monsterEmoji ?? null)
    : null;
  const buddyState = getBuddyState(progressionContext);
  const milestoneRate = getTitleUnlockRate(progressionContext);

  return (
    <main className="eq-page hero-page">
      <div className="eq-bg-orb eq-bg-orb-one" />
      <div className="eq-bg-orb eq-bg-orb-two" />
      <div className="eq-bg-orb eq-bg-orb-three" />

      <section className="eq-shell">
        <PageTopBar />

        <div
          className="eq-hero"
        >
          <div className="eq-hero-copy">
            <div className="eq-eyebrow">
              <span>⚔️</span>
              <span>HERO STATUS</span>
            </div>

            <h1 className="eq-page-title">主人公</h1>

            <p className="eq-lead">
              クエストで正解すると主人公にEXPが入り、レベルと称号が上がっていきます。
              英単語を覚えるほど、冒険者として成長します。
            </p>

          </div>

          <div className="hero-stage">
            <div className="eq-display-card">
              <div className="eq-display-shine" />
              <div className="hero-sprite-group">
                {buddyEmoji && (
                  <span className="hero-buddy-companion" aria-hidden="true">
                    {buddyEmoji}
                  </span>
                )}
                <Image
                  src="/images/hero/hero_ready.png"
                  alt="勇者"
                  width={1254}
                  height={1254}
                  sizes="220px"
                  className="hero-card-sprite"
                />
              </div>
              <p>ADVENTURER</p>
              <h2>Lv.{currentLevel}</h2>
              <span>{displayTitle}</span>
              <span className="hero-card-rate">{milestoneRate}% 称号達成</span>
            </div>
          </div>

        </div>

        <div className="hero-dashboard">
          <div className="eq-panel hero-main-card">
            <div className="eq-panel-head">
              <div>
                <p className="eq-panel-kicker">BUDDY STATUS</p>
                <h2 className="eq-panel-title">相棒の成長</h2>
              </div>
              <span className="eq-panel-icon">✨</span>
            </div>

            <div className="hero-buddy-status">
              {buddyState?.earnedCard ? (
                <>
                  <div className="hero-buddy-icon">{buddyState.card.monsterEmoji}</div>
                  <div>
                    <span>相棒モンスター</span>
                    <strong>
                      {buddyState.card.name} Lv.{buddyState.levelProgress.level} / {buddyState.levelProgress.maxLevel}
                    </strong>
                    <p>
                      覚醒 Lv.{buddyState.awakeningLevel} ・ {buddyState.growthStage} ・ {getMonsterNextExpLabel(buddyState.levelProgress)}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="hero-buddy-icon">✦</div>
                  <div>
                    <span>相棒モンスター</span>
                    <strong>未設定</strong>
                    <p>カード図鑑のモンスターページから相棒に設定できます。</p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="eq-panel hero-road-panel">
            <div className="eq-panel-head">
              <div>
                <p className="eq-panel-kicker">HERO ROAD</p>
                <h2 className="eq-panel-title">称号ロード</h2>
              </div>
              <span className="eq-panel-icon">🛤️</span>
            </div>

            <div className="hero-title-tabs" role="tablist" aria-label="称号カテゴリ">
              {(Object.keys(TITLE_CATEGORY_LABELS) as TitleCategory[]).map((category) => (
                <button
                  key={category}
                  type="button"
                  className={activeTitleCategory === category ? "active" : ""}
                  onClick={() => setActiveTitleCategory(category)}
                >
                  {TITLE_CATEGORY_LABELS[category]}
                </button>
              ))}
            </div>

            <div className="hero-road-list">
              {unlockedTitles.map((milestone) => {
                const isAchieved = milestone.isUnlocked(progressionContext);
                const isNext = activeNextTitle?.id === milestone.id;

                return (
                  <div
                    key={milestone.id}
                    className={
                      isAchieved
                        ? "hero-road-item achieved"
                        : isNext
                          ? "hero-road-item next"
                          : "hero-road-item"
                    }
                  >
                    <div className="hero-road-icon">{milestone.icon}</div>

                    <div className="hero-road-content">
                      <div className="hero-road-top">
                        <span>{milestone.level ? `Lv.${milestone.level}` : milestone.conditionLabel}</span>
                        {isAchieved && <strong>達成済み</strong>}
                        {isNext && <strong>次の目標</strong>}
                      </div>

                      <h3>{milestone.label}</h3>
                      <p>{milestone.description}</p>
                      <p className="hero-road-condition">{milestone.conditionLabel}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>


        </div>
      </section>

      <style jsx>{`
        .hero-page .eq-hero {
          gap: 24px;
          padding: 28px;
        }

        .hero-page .eq-panel {
          padding: 18px;
          border-radius: 20px;
        }

        .hero-page .eq-panel-head {
          margin-bottom: 14px;
        }

        .hero-page .eq-panel-title {
          font-size: 22px;
        }

        .hero-page .eq-display-card {
          width: 252px;
          height: 352px;
          border-radius: 32px;
        }

        .hero-page .eq-display-card::before {
          border-radius: 28px;
        }

        /* ===================================
           ヒーロー表示カード内テキスト
        =================================== */
        .eq-display-card p,
        .eq-display-card h2,
        .eq-display-card > span {
          position: relative;
          z-index: 2;
          text-align: center;
        }

        .eq-display-card p {
          margin: 18px 0 0;
          color: #fde68a;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.18em;
        }

        .eq-display-card h2 {
          margin: 7px 0 0;
          font-size: 25px;
          font-weight: 900;
        }

        .eq-display-card > span {
          display: block;
          margin: 6px auto 0;
          max-width: 220px;
          color: #94a3b8;
          font-size: 13px;
          font-weight: 900;
        }

        .hero-card-rate {
          display: block;
          margin: 10px auto 0 !important;
          width: fit-content;
          padding: 5px 12px;
          border-radius: 999px;
          border: 1px solid rgba(250, 204, 21, 0.3);
          background: rgba(250, 204, 21, 0.1);
          color: #fde68a !important;
          font-size: 11px !important;
          font-weight: 1000 !important;
          letter-spacing: 0.06em;
        }

        .hero-sprite-group {
          display: flex;
          align-items: flex-end;
          justify-content: center;
          position: relative;
          z-index: 2;
          margin-top: 8px;
        }

        .hero-buddy-companion {
          font-size: 40px;
          line-height: 1;
          margin-bottom: 26px;
          margin-right: -10px;
          transform: rotate(-4deg);
          filter: drop-shadow(0 8px 12px rgba(0, 0, 0, 0.5));
        }

        /* ===================================
           ヒーロースプライト（PNG）
        =================================== */
        :global(.hero-card-sprite) {
          display: block;
          width: 132px;
          height: 154px;
          object-fit: contain;
          object-position: bottom center;
          filter: drop-shadow(0 18px 28px rgba(0, 0, 0, 0.52));
        }

        .hero-dashboard {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: 18px;
        }

        .hero-main-card {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .hero-buddy-status {
          margin-top: 0;
          display: grid;
          grid-template-columns: 70px 1fr;
          gap: 14px;
          align-items: center;
          border: 1px solid rgba(34, 211, 238, 0.2);
          border-radius: 18px;
          background:
            radial-gradient(circle at 0% 0%, rgba(34, 211, 238, 0.14), transparent 34%),
            rgba(2, 6, 23, 0.3);
          padding: 12px;
        }

        .hero-buddy-icon {
          width: 70px;
          height: 70px;
          display: grid;
          place-items: center;
          border-radius: 16px;
          border: 1px solid rgba(34, 211, 238, 0.28);
          background: rgba(34, 211, 238, 0.08);
          font-size: 38px;
        }

        .hero-buddy-status span {
          display: block;
          color: #94a3b8;
          font-size: 12px;
          font-weight: 900;
        }

        .hero-buddy-status strong {
          display: block;
          margin-top: 6px;
          color: #fef3c7;
          font-size: 20px;
          line-height: 1.25;
          font-weight: 1000;
        }

        .hero-buddy-status p,
        .next-unlock-hint,
        .background-next {
          margin: 8px 0 0;
          color: #cbd5e1;
          font-size: 13px;
          line-height: 1.55;
          font-weight: 800;
        }

        .hero-title-tabs {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px;
          margin-bottom: 14px;
        }

        .hero-title-tabs button {
          min-height: 40px;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.11);
          background: rgba(255, 255, 255, 0.055);
          color: #cbd5e1;
          font: inherit;
          font-size: 13px;
          font-weight: 1000;
          cursor: pointer;
          transition: all 0.16s ease;
        }

        .hero-title-tabs button:hover,
        .hero-title-tabs button.active {
          border-color: rgba(34, 211, 238, 0.45);
          background: rgba(34, 211, 238, 0.12);
          color: #ecfeff;
          transform: translateY(-1px);
        }

        .hero-road-list {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .hero-road-item {
          display: grid;
          grid-template-columns: 54px 1fr;
          gap: 12px;
          align-items: center;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.055);
          padding: 12px;
        }

        .hero-road-item.achieved {
          border-color: rgba(52, 211, 153, 0.3);
          background: rgba(52, 211, 153, 0.08);
        }

        .hero-road-item.next {
          border-color: rgba(251, 191, 36, 0.34);
          background: rgba(251, 191, 36, 0.09);
        }

        .hero-road-icon {
          width: 54px;
          height: 54px;
          display: grid;
          place-items: center;
          border-radius: 16px;
          background:
            radial-gradient(circle at 50% 18%, rgba(255, 255, 255, 0.2), transparent 45%),
            linear-gradient(135deg, rgba(34, 211, 238, 0.18), rgba(168, 85, 247, 0.18));
          font-size: 30px;
        }

        .hero-road-top {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .hero-road-top span {
          color: #a5f3fc;
          font-size: 11px;
          font-weight: 1000;
          letter-spacing: 0.12em;
        }

        .hero-road-top strong {
          border-radius: 999px;
          padding: 4px 8px;
          background: rgba(251, 191, 36, 0.13);
          color: #fde68a;
          font-size: 10px;
          font-weight: 1000;
        }

        .hero-road-content h3 {
          margin: 6px 0 0;
          font-size: 16px;
          font-weight: 1000;
        }

        .hero-road-content p {
          margin: 6px 0 0;
          color: #cbd5e1;
          line-height: 1.5;
          font-size: 12px;
          font-weight: 800;
        }

        .hero-road-condition {
          color: #a5f3fc !important;
          font-size: 12px !important;
        }

        @media (max-width: 1020px) {
          .hero-road-list {
            grid-template-columns: 1fr;
          }

          .hero-page .eq-hero {
            grid-template-columns: 1fr;
          }

          .hero-page .eq-hero-copy {
            width: 100%;
            min-width: 0;
          }

          .hero-page .eq-lead {
            max-width: 100%;
            overflow-wrap: anywhere;
          }
        }

        @media (max-width: 720px) {
          .hero-page .eq-hero {
            padding: 18px;
          }

          .hero-dashboard {
            gap: 18px;
            margin-top: 18px;
          }

          .hero-road-item,
          .hero-buddy-status {
            grid-template-columns: 1fr;
          }

          .hero-title-tabs {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
      `}</style>
    </main>
  );
}
