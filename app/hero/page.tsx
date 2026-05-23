"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  getHeroExpProgress,
  HeroStatus,
  loadHeroStatus,
} from "../../data/hero";
import {
  loadShopState,
  saveShopState,
  ShopState,
} from "../../data/shop";
import {
  EarnedCard,
  getMonsterCardById,
  getOwnedCount,
  MonsterCard,
} from "../../data/cards";
import {
  getAwakeningLevel,
  getBuddyState,
  getMonsterLevelProgress,
  getMonsterNextExpLabel,
  getNextGlobalUnlockLabel,
  getNextLearningTitle,
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

  const ownedMonsterCards = useMemo<MonsterCard[]>(() => {
    return earnedCards
      .map((ec) => getMonsterCardById(ec.cardId))
      .filter((c): c is MonsterCard => Boolean(c));
  }, [earnedCards]);

  function handleSelectMonster(cardId: string | null) {
    const newState: ShopState = { ...shopState, selectedMonsterCardId: cardId };
    saveShopState(newState);
    setShopState(newState);
  }


  const progress = hero ? getHeroExpProgress(hero) : null;

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
  const nextUnlockLabel = getNextGlobalUnlockLabel(progressionContext);

  const nextMilestone = useMemo(
    () => getNextLearningTitle(progressionContext),
    [progressionContext]
  );

  const milestoneRate = getTitleUnlockRate(progressionContext);

  return (
    <main className="eq-page hero-page">
      <div className="eq-bg-orb eq-bg-orb-one" />
      <div className="eq-bg-orb eq-bg-orb-two" />
      <div className="eq-bg-orb eq-bg-orb-three" />

      <section className="eq-shell">
        <nav className="eq-topbar">
          <Link href="/" className="eq-back-link">
            ← ホームへ戻る
          </Link>
        </nav>

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

            <div className="eq-actions">
              <Link href="/quiz" className="eq-button eq-button-primary">
                <span>⚡</span>
                クエスト開始
              </Link>

              <Link href="/words" className="eq-button eq-button-secondary">
                <span>📚</span>
                単語帳を見る
              </Link>
            </div>
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
                <img
                  src="/images/hero/hero_ready.png"
                  alt="勇者"
                  className="hero-card-sprite"
                />
              </div>
              <p>ADVENTURER</p>
              <h2>Lv.{currentLevel}</h2>
              <span>{displayTitle}</span>
            </div>
          </div>

          <div className="eq-status-strip">
            <div className="eq-status-card">
              <span>現在レベル</span>
              <strong>Lv.{currentLevel}</strong>
            </div>

            <div className="eq-status-card">
              <span>現在の称号</span>
              <strong className="hero-title-text">{displayTitle}</strong>
            </div>

            <div className="eq-status-card is-highlight">
              <span>称号達成率</span>
              <strong>{milestoneRate}%</strong>
            </div>
          </div>
        </div>

        <div className="hero-dashboard">
          <div className="eq-panel hero-main-card">
            <div className="eq-panel-head">
              <div>
                <p className="eq-panel-kicker">CURRENT STATUS</p>
                <h2 className="eq-panel-title">現在の成長</h2>
              </div>
              <span className="eq-panel-icon">✨</span>
            </div>

            <div className="hero-current-box">
              <div className="hero-current-icon">
                <img
                  src="/images/hero/hero_ready.png"
                  alt="勇者"
                  className="hero-panel-sprite"
                />
              </div>

              <div>
                <span>現在の称号</span>
                <strong>
                  Lv.{currentLevel} {displayTitle}
                </strong>
                <div className="hero-loadout-row">
                  <span>🧑 {buddyState?.card.name ?? "未設定"}</span>
                </div>
                <p>
                  {nextMilestone
                    ? `次の学習目標は Lv.${nextMilestone.level}「${nextMilestone.label}」です。`
                    : "学習称号をすべて達成しています。すごいです！"}
                </p>
              </div>
            </div>

            <div className="hero-exp-area">
              <div className="hero-exp-label">
                <span>EXP</span>
                <strong>
                  {progress
                    ? `${progress.currentExp} / ${progress.requiredExp}`
                    : "0 / 100"}
                </strong>
              </div>

              <div className="eq-progress-track">
                <div
                  className="eq-progress-bar"
                  style={{ width: `${progress?.percent ?? 0}%` }}
                />
              </div>

              <p>
                正解するとEXPを獲得します。クエストを続けるほど、主人公が成長します。
              </p>
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
                    <p>カード図鑑か下の一覧からお気に入りを選ぶと、クエストに同行します。</p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="eq-panel">
            <div className="eq-panel-head">
              <div>
                <p className="eq-panel-kicker">NEXT GOAL</p>
                <h2 className="eq-panel-title">次の目標</h2>
              </div>
              <span className="eq-panel-icon">🎯</span>
            </div>

            {nextMilestone ? (
              <div className="next-goal-card">
                <div className="next-goal-icon">{nextMilestone.icon}</div>

                <div>
                  <span>Lv.{nextMilestone.level}</span>
                  <strong>{nextMilestone.label}</strong>
                  <p>{nextMilestone.description}</p>
                </div>
              </div>
            ) : (
              <div className="next-goal-card">
                <div className="next-goal-icon">👑</div>

                <div>
                  <span>MASTER</span>
                  <strong>称号コンプリート</strong>
                  <p>これまでの冒険の積み重ねで、すべての称号を達成しています。</p>
                </div>
              </div>
            )}

            <p className="next-unlock-hint">{nextUnlockLabel}</p>

            <Link href="/quiz" className="eq-button eq-button-ghost hero-panel-link">
              次のクエストへ →
            </Link>
          </div>

          <div className="eq-panel fmp-panel">
            <div className="eq-panel-head">
              <div>
                <p className="eq-panel-kicker">FAVORITE MONSTER</p>
                <h2 className="eq-panel-title">お気に入りモンスター</h2>
              </div>
              <span className="eq-panel-icon">🐲</span>
            </div>

            <p className="fmp-desc">
              所持モンスターの中からお気に入りを選ぶと、相棒としてアバター画面とクエストに同行します。
            </p>

            {ownedMonsterCards.length === 0 ? (
              <div className="fmp-empty">
                まだモンスターカードがありません。クエストでゴールドを稼ぎ、パックを開封してモンスターを集めましょう。
              </div>
            ) : (
              <>
                {!buddyState?.earnedCard && (
                  <div className="fmp-empty fmp-hint">
                    お気に入りを1体選ぶと、称号「相棒と歩む者」が解放されます。
                  </div>
                )}
                <div className="fmp-grid">
                  {ownedMonsterCards.map((card) => {
                    const isSelected = shopState.selectedMonsterCardId === card.id;
                    const earnedCard = earnedCards.find((earned) => earned.cardId === card.id);
                    const levelProgress = getMonsterLevelProgress(earnedCard?.exp ?? 0);
                    const awakeningLevel = getAwakeningLevel(getOwnedCount(earnedCard));

                    return (
                      <button
                        key={card.id}
                        type="button"
                        className={`fmp-card${isSelected ? " is-selected" : ""}`}
                        onClick={() => handleSelectMonster(isSelected ? null : card.id)}
                      >
                        {isSelected && <div className="fmp-check">✓</div>}
                        <span className="fmp-emoji">{card.monsterEmoji}</span>
                        <strong className="fmp-name">{card.name}</strong>
                        <small className="fmp-attr">{card.emoji} {card.attribute}</small>
                        <span className="fmp-meta">
                          Lv.{levelProgress.level}/20 ・ 覚醒{awakeningLevel}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
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


          <div className="eq-panel">
            <div className="eq-panel-head">
              <div>
                <p className="eq-panel-kicker">GROWTH TIPS</p>
                <h2 className="eq-panel-title">成長のコツ</h2>
              </div>
              <span className="eq-panel-icon">💡</span>
            </div>

            <div className="hero-tips">
              <Link href="/words">
                <strong>単語帳で先に見る</strong>
                <span>意味と例文を見てからクエストに挑戦</span>
              </Link>

              <Link href="/quiz">
                <strong>10問チャレンジを続ける</strong>
                <span>短い回数で毎日続けやすい</span>
              </Link>

              <Link href="/pack">
                <strong>チケットでパック開封</strong>
                <span>学習のごほうびとしてカードを集める</span>
              </Link>

              <Link href="/cards">
                <strong>図鑑で成果を確認</strong>
                <span>集めたカードを見て達成感を得る</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .hero-title-text {
          font-size: 24px !important;
          line-height: 1.2 !important;
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
          margin: 22px 0 0;
          color: #fde68a;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.18em;
        }

        .eq-display-card h2 {
          margin: 8px 0 0;
          font-size: 26px;
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

        .hero-loadout-row {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          margin-top: 10px;
        }

        .hero-loadout-row span {
          min-height: 30px;
          display: inline-flex;
          align-items: center;
          border: 1px solid rgba(250, 204, 21, 0.18);
          border-radius: 999px;
          background: rgba(2, 6, 23, 0.34);
          color: #e2e8f0;
          padding: 6px 10px;
          font-size: 11px;
          font-weight: 900;
        }

        /* ===================================
           ヒーロースプライト（PNG）
        =================================== */
        .hero-card-sprite {
          display: block;
          width: 150px;
          height: 175px;
          object-fit: contain;
          object-position: bottom center;
          filter: drop-shadow(0 18px 28px rgba(0, 0, 0, 0.52));
        }

        .hero-panel-sprite {
          display: block;
          width: 56px;
          height: 74px;
          object-fit: contain;
          object-position: bottom center;
          filter: drop-shadow(0 8px 12px rgba(0, 0, 0, 0.5));
        }

        /* ===================================
           お気に入りモンスターパネル
        =================================== */
        .fmp-panel {
          grid-column: span 2;
        }

        .fmp-desc {
          color: #94a3b8;
          font-size: 13px;
          font-weight: 800;
          margin: 0 0 14px;
        }

        .fmp-empty {
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.04);
          padding: 18px;
          color: #94a3b8;
          font-size: 14px;
          line-height: 1.7;
        }

        .fmp-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(88px, 1fr));
          gap: 10px;
          max-height: 360px;
          overflow-y: auto;
          scrollbar-width: thin;
          padding-right: 4px;
        }

        .fmp-card {
          position: relative;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.055);
          padding: 10px 8px;
          text-align: center;
          cursor: pointer;
          transition: all 0.15s;
          color: white;
        }

        .fmp-card:hover {
          border-color: rgba(34, 211, 238, 0.42);
          background: rgba(34, 211, 238, 0.08);
          transform: translateY(-2px);
        }

        .fmp-card.is-selected {
          border-color: rgba(52, 211, 153, 0.6);
          background: rgba(52, 211, 153, 0.12);
        }

        .fmp-check {
          position: absolute;
          top: 4px;
          right: 4px;
          width: 16px;
          height: 16px;
          border-radius: 999px;
          background: rgba(52, 211, 153, 0.85);
          color: white;
          font-size: 9px;
          font-weight: 1000;
          display: grid;
          place-items: center;
        }

        .fmp-emoji {
          display: block;
          font-size: 28px;
          line-height: 1;
        }

        .fmp-name {
          display: block;
          margin-top: 6px;
          font-size: 10px;
          font-weight: 900;
          line-height: 1.3;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .fmp-attr {
          display: block;
          margin-top: 3px;
          font-size: 9px;
          color: #94a3b8;
        }

        .fmp-meta {
          display: block;
          margin-top: 7px;
          border-radius: 999px;
          background: rgba(2, 6, 23, 0.36);
          color: #a5f3fc;
          padding: 4px 6px;
          font-size: 9px;
          font-weight: 1000;
          line-height: 1.2;
        }

        .fmp-hint {
          margin-bottom: 12px;
          border-color: rgba(34, 211, 238, 0.2);
          background: rgba(34, 211, 238, 0.07);
          color: #cbd5e1;
        }

        .hero-dashboard {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 22px;
          margin-top: 24px;
        }

        .hero-main-card,
        .hero-road-panel,
        .background-panel {
          grid-column: span 2;
        }

        .hero-current-box {
          display: grid;
          grid-template-columns: 86px 1fr;
          gap: 16px;
          align-items: center;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.055);
          padding: 18px;
        }

        .hero-current-icon {
          width: 86px;
          height: 86px;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: 10px;
          box-sizing: border-box;
          border-radius: 24px;
          background:
            radial-gradient(circle at 50% 18%, rgba(255, 255, 255, 0.26), transparent 45%),
            linear-gradient(135deg, rgba(34, 211, 238, 0.22), rgba(168, 85, 247, 0.2));
        }

        .hero-current-box span,
        .next-goal-card span {
          display: block;
          color: #94a3b8;
          font-size: 12px;
          font-weight: 800;
        }

        .hero-current-box strong,
        .next-goal-card strong {
          display: block;
          margin-top: 6px;
          color: #fde68a;
          font-size: 24px;
          line-height: 1.25;
          font-weight: 1000;
        }

        .hero-current-box p,
        .next-goal-card p,
        .hero-exp-area p {
          margin: 10px 0 0;
          color: #cbd5e1;
          line-height: 1.7;
          font-size: 14px;
          font-weight: 800;
        }

        .hero-exp-area {
          margin-top: 18px;
        }

        .hero-buddy-status {
          margin-top: 18px;
          display: grid;
          grid-template-columns: 70px 1fr;
          gap: 14px;
          align-items: center;
          border: 1px solid rgba(34, 211, 238, 0.2);
          border-radius: 24px;
          background:
            radial-gradient(circle at 0% 0%, rgba(34, 211, 238, 0.14), transparent 34%),
            rgba(2, 6, 23, 0.3);
          padding: 15px;
        }

        .hero-buddy-icon {
          width: 70px;
          height: 70px;
          display: grid;
          place-items: center;
          border-radius: 20px;
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
          line-height: 1.6;
          font-weight: 800;
        }

        .hero-exp-label {
          display: flex;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 12px;
          color: #cbd5e1;
          font-size: 13px;
          font-weight: 1000;
        }

        .hero-exp-label strong {
          color: #fde68a;
        }

        .next-goal-card {
          display: grid;
          grid-template-columns: 70px 1fr;
          gap: 14px;
          align-items: center;
          border: 1px solid rgba(251, 191, 36, 0.22);
          border-radius: 24px;
          background: rgba(251, 191, 36, 0.08);
          padding: 16px;
        }

        .next-goal-icon {
          width: 70px;
          height: 70px;
          display: grid;
          place-items: center;
          border-radius: 22px;
          background:
            radial-gradient(circle at 50% 18%, rgba(255, 255, 255, 0.24), transparent 45%),
            linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(168, 85, 247, 0.18));
          font-size: 40px;
        }

        .hero-panel-link {
          width: 100%;
          margin-top: 16px;
          min-height: 50px;
          font-size: 14px;
        }

        .hero-title-tabs {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px;
          margin-bottom: 14px;
        }

        .hero-title-tabs button {
          min-height: 46px;
          border-radius: 16px;
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
          gap: 12px;
        }

        .hero-road-item {
          display: grid;
          grid-template-columns: 64px 1fr;
          gap: 14px;
          align-items: center;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.055);
          padding: 14px;
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
          width: 64px;
          height: 64px;
          display: grid;
          place-items: center;
          border-radius: 20px;
          background:
            radial-gradient(circle at 50% 18%, rgba(255, 255, 255, 0.2), transparent 45%),
            linear-gradient(135deg, rgba(34, 211, 238, 0.18), rgba(168, 85, 247, 0.18));
          font-size: 34px;
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
          font-size: 18px;
          font-weight: 1000;
        }

        .hero-road-content p {
          margin: 6px 0 0;
          color: #cbd5e1;
          line-height: 1.6;
          font-size: 13px;
          font-weight: 800;
        }

        .hero-road-condition {
          color: #a5f3fc !important;
          font-size: 12px !important;
        }

        .bg-select-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 12px;
        }

        .bg-select-card {
          min-height: 150px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.055);
          color: white;
          padding: 12px;
          text-align: left;
          font: inherit;
          cursor: pointer;
          transition: all 0.16s ease;
        }

        .bg-select-card:hover,
        .bg-select-card.is-selected {
          border-color: rgba(250, 204, 21, 0.38);
          background: rgba(250, 204, 21, 0.08);
          transform: translateY(-2px);
        }

        .bg-preview {
          min-height: 74px;
          display: grid;
          place-items: center;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 28px;
          box-shadow: inset 0 0 24px rgba(0, 0, 0, 0.22);
        }

        .bg-select-card strong,
        .bg-select-card small {
          display: block;
        }

        .bg-select-card strong {
          margin-top: 10px;
          font-size: 15px;
          font-weight: 1000;
        }

        .bg-select-card small {
          margin-top: 4px;
          color: #94a3b8;
          font-size: 11px;
          font-weight: 900;
          line-height: 1.4;
        }


        .hero-tips {
          display: grid;
          gap: 12px;
        }

        .hero-tips a {
          display: block;
          text-decoration: none;
          color: white;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.055);
          padding: 14px;
          transition:
            transform 0.18s ease,
            background 0.18s ease;
        }

        .hero-tips a:hover {
          transform: translateY(-3px);
          background: rgba(255, 255, 255, 0.09);
        }

        .hero-tips strong {
          display: block;
          color: white;
          font-size: 16px;
          font-weight: 1000;
        }

        .hero-tips span {
          display: block;
          margin-top: 4px;
          color: #94a3b8;
          font-size: 12px;
          line-height: 1.5;
          font-weight: 800;
        }

        @media (max-width: 1020px) {
          .hero-dashboard {
            grid-template-columns: 1fr;
          }

          .hero-main-card,
          .hero-road-panel,
          .fmp-panel,
          .background-panel {
            grid-column: span 1;
          }
        }

        @media (max-width: 720px) {
          .hero-dashboard {
            gap: 18px;
            margin-top: 18px;
          }

          .hero-current-box,
          .next-goal-card,
          .hero-road-item,
          .hero-buddy-status {
            grid-template-columns: 1fr;
          }

          .hero-title-tabs {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .hero-current-icon,
          .next-goal-icon,
          .hero-road-icon {
            width: 70px;
            height: 70px;
          }

          .hero-title-text {
            font-size: 22px !important;
          }
        }
      `}</style>
    </main>
  );
}
