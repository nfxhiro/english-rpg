"use client";

import { CSSProperties, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  getHeroExpProgress,
  HeroStatus,
  loadHeroStatus,
} from "../../data/hero";
import {
  getDisplayTitle,
  getSelectedAvatarEmoji,
  getSelectedAvatarItem,
  getSelectedBackgroundCss,
  getSelectedBackgroundItem,
  getSelectedEffectClass,
  getSelectedEffectItem,
  getSelectedFrameCss,
  getSelectedFrameItem,
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
  getSelectedProgressionBackground,
  getTitleUnlockRate,
  getTitlesByCategory,
  getUnlockedBackgrounds,
  loadQuestProgressSnapshot,
  TITLE_CATEGORY_LABELS,
  TitleCategory,
  UNLOCKABLE_BACKGROUNDS,
  type ProgressionContext,
  type QuestProgressSnapshot,
} from "../../data/progression";

function getHeroLevelStyle(level: number): CSSProperties {
  if (level >= 90) return { "--hero-main": "#d946ef", "--hero-light": "#f0abfc", "--hero-dark": "#a21caf", "--hero-darkest": "#701a75" } as CSSProperties;
  if (level >= 70) return { "--hero-main": "#22d3ee", "--hero-light": "#67e8f9", "--hero-dark": "#0891b2", "--hero-darkest": "#155e75" } as CSSProperties;
  if (level >= 50) return { "--hero-main": "#f59e0b", "--hero-light": "#fcd34d", "--hero-dark": "#b45309", "--hero-darkest": "#78350f" } as CSSProperties;
  if (level >= 40) return { "--hero-main": "#f97316", "--hero-light": "#fdba74", "--hero-dark": "#c2410c", "--hero-darkest": "#9a3412" } as CSSProperties;
  if (level >= 30) return { "--hero-main": "#a855f7", "--hero-light": "#d8b4fe", "--hero-dark": "#7e22ce", "--hero-darkest": "#581c87" } as CSSProperties;
  if (level >= 20) return { "--hero-main": "#3b82f6", "--hero-light": "#93c5fd", "--hero-dark": "#1d4ed8", "--hero-darkest": "#1e3a8a" } as CSSProperties;
  if (level >= 10) return { "--hero-main": "#10b981", "--hero-light": "#6ee7b7", "--hero-dark": "#047857", "--hero-darkest": "#064e3b" } as CSSProperties;
  return {} as CSSProperties;
}

const DEFAULT_SHOP_STATE: ShopState = {
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

  function handleEquipMilestoneTitle(title: string) {
    const isCurrentlyEquipped = shopState.selectedTitle === title;
    const newState: ShopState = {
      ...shopState,
      selectedTitle: isCurrentlyEquipped ? null : title,
    };
    saveShopState(newState);
    setShopState(newState);
  }

  function handleSelectBackground(backgroundId: string) {
    const newState: ShopState = {
      ...shopState,
      selectedBackground: backgroundId,
    };
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
  const displayTitle = getDisplayTitle(shopState, currentTitle);
  const selectedAvatarEmoji = getSelectedAvatarEmoji(shopState);
  const selectedAvatarItem = getSelectedAvatarItem(shopState);
  const selectedBackgroundItem = getSelectedBackgroundItem(shopState);
  const selectedFrameItem = getSelectedFrameItem(shopState);
  const selectedFrameCss = getSelectedFrameCss(shopState);
  const selectedEffectItem = getSelectedEffectItem(shopState);
  const selectedEffectClass = getSelectedEffectClass(shopState);
  const progressionBackground = getSelectedProgressionBackground(
    progressionContext,
    shopState.selectedBackground
  );
  const selectedProgressionBackground = getUnlockedBackgrounds(
    progressionContext
  ).find((background) => background.id === shopState.selectedBackground);
  const selectedBgCss =
    selectedProgressionBackground?.backgroundCss ??
    getSelectedBackgroundCss(shopState) ??
    progressionBackground.backgroundCss;
  const selectedBackgroundName =
    selectedProgressionBackground?.label ??
    selectedBackgroundItem?.name ??
    progressionBackground.label;
  const buddyState = getBuddyState(progressionContext);
  const nextUnlockLabel = getNextGlobalUnlockLabel(progressionContext);
  const unlockedBackgrounds = getUnlockedBackgrounds(progressionContext);
  const nextBackground = UNLOCKABLE_BACKGROUNDS.find(
    (background) => !background.isUnlocked(progressionContext)
  );

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
          style={selectedBgCss ? { background: selectedBgCss } : undefined}
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
            <div
              className="eq-display-card"
              style={selectedFrameCss ? { background: selectedFrameCss } : undefined}
            >
              <div className="eq-display-shine" />
              {selectedEffectClass && (
                <div className={`hero-avatar-effect ${selectedEffectClass}`} />
              )}
              <div className="hero-card-sprite" style={getHeroLevelStyle(currentLevel)}>
                <span className="hcs-cape" />
                <span className="hcs-head" />
                <span className="hcs-body" />
                <span className="hcs-shield" />
                <span className="hcs-sword" />
              </div>
              <div className="hero-avatar-badge">
                <span>{selectedAvatarEmoji}</span>
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
                <div className="hero-panel-sprite" style={getHeroLevelStyle(currentLevel)}>
                  <span className="hps-cape" />
                  <span className="hps-head" />
                  <span className="hps-body" />
                  <span className="hps-shield" />
                  <span className="hps-sword" />
                </div>
              </div>

              <div>
                <span>現在の称号</span>
                <strong>
                  Lv.{currentLevel} {displayTitle}
                </strong>
                <div className="hero-loadout-row">
                  <span>🧑 {buddyState?.card.name ?? selectedAvatarItem?.name ?? "通常"}</span>
                  <span>🌌 {selectedBackgroundName}</span>
                  <span>🖼️ {selectedFrameItem?.name ?? "通常"}</span>
                  <span>✨ {selectedEffectItem?.name ?? "通常"}</span>
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
                      {isAchieved && (
                        <button
                          className={`hero-road-equip-btn${shopState.selectedTitle === milestone.label ? " is-equipped" : ""}`}
                          onClick={() => handleEquipMilestoneTitle(milestone.label)}
                        >
                          {shopState.selectedTitle === milestone.label
                            ? "✓ 装備中"
                            : "装備する"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="eq-panel background-panel">
            <div className="eq-panel-head">
              <div>
                <p className="eq-panel-kicker">BACKGROUND</p>
                <h2 className="eq-panel-title">背景の解放</h2>
              </div>
              <span className="eq-panel-icon">🌌</span>
            </div>

            <div className="bg-select-grid">
              {unlockedBackgrounds.map((background) => {
                const isSelected = shopState.selectedBackground === background.id;
                return (
                  <button
                    key={background.id}
                    type="button"
                    className={isSelected ? "bg-select-card is-selected" : "bg-select-card"}
                    onClick={() => handleSelectBackground(background.id)}
                  >
                    <span className="bg-preview" style={{ background: background.backgroundCss }}>
                      {background.icon}
                    </span>
                    <strong>{background.label}</strong>
                    <small>{background.conditionLabel}</small>
                  </button>
                );
              })}
            </div>

            <p className="background-next">
              {nextBackground
                ? `次の背景: ${nextBackground.label}（${nextBackground.conditionLabel}）`
                : "背景はすべて解放済みです。"}
            </p>
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

        .hero-avatar-effect {
          position: absolute;
          inset: 4px;
          z-index: 1;
          border-radius: 34px;
          pointer-events: none;
        }

        .hero-avatar-effect.effect-spark {
          background:
            radial-gradient(circle at 28% 32%, rgba(254, 243, 199, 0.95) 0 4px, transparent 5px),
            radial-gradient(circle at 70% 24%, rgba(103, 232, 249, 0.86) 0 3px, transparent 4px),
            radial-gradient(circle at 62% 76%, rgba(250, 204, 21, 0.8) 0 4px, transparent 5px);
          animation: heroAuraFloat 2.8s ease-in-out infinite alternate;
        }

        .hero-avatar-effect.effect-flame {
          background:
            radial-gradient(circle at 50% 78%, rgba(248, 113, 113, 0.42), transparent 28%),
            conic-gradient(from 180deg at 50% 82%, transparent, rgba(251, 146, 60, 0.32), transparent 38%, rgba(239, 68, 68, 0.26), transparent);
          animation: heroAuraSpin 5.5s linear infinite;
        }

        .hero-avatar-effect.effect-aqua {
          background:
            radial-gradient(circle at 50% 50%, transparent 0 38%, rgba(34, 211, 238, 0.34) 39% 40%, transparent 42%),
            radial-gradient(circle at 50% 50%, transparent 0 56%, rgba(103, 232, 249, 0.22) 57% 58%, transparent 60%);
          animation: heroAuraPulse 2.4s ease-in-out infinite;
        }

        .hero-avatar-effect.effect-shadow {
          background:
            radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.2), transparent 44%),
            conic-gradient(from 20deg, transparent, rgba(168, 85, 247, 0.28), transparent, rgba(34, 211, 238, 0.18), transparent);
          animation: heroAuraSpin 8s linear infinite;
        }

        .hero-avatar-effect.effect-crown {
          background:
            linear-gradient(180deg, rgba(254, 243, 199, 0.36), transparent 38%),
            radial-gradient(circle at 50% 16%, rgba(250, 204, 21, 0.42), transparent 22%);
          animation: heroAuraFloat 2.2s ease-in-out infinite alternate;
        }

        .hero-avatar-badge {
          position: absolute;
          right: 32px;
          top: 132px;
          z-index: 3;
          width: 58px;
          height: 58px;
          display: grid;
          place-items: center;
          border: 1px solid rgba(250, 204, 21, 0.36);
          border-radius: 20px;
          background: rgba(2, 6, 23, 0.58);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.34);
        }

        .hero-avatar-badge span {
          font-size: 32px;
          line-height: 1;
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
           ヒーローカード用スプライト（大）
        =================================== */
        .hero-card-sprite {
          position: relative;
          z-index: 2;
          width: 110px;
          height: 146px;
          margin: 56px auto 0;
          filter: drop-shadow(0 18px 28px rgba(0, 0, 0, 0.52));
          --hero-main: #dc2626;
          --hero-light: #f87171;
          --hero-dark: #991b1b;
          --hero-darkest: #7f1d1d;
        }

        .hcs-cape {
          position: absolute;
          left: 25px;
          top: 39px;
          width: 63px;
          height: 92px;
          border-radius: 8px 8px 42px 29px;
          background: linear-gradient(165deg, var(--hero-dark), var(--hero-main), var(--hero-dark));
          transform: skewX(-5deg);
        }

        .hcs-head {
          position: absolute;
          left: 35px;
          top: 4px;
          width: 39px;
          height: 39px;
          border: 2px solid rgba(203, 213, 225, 0.85);
          border-radius: 17px 17px 7px 7px;
          background: linear-gradient(170deg, #94a3b8, #64748b, #475569);
        }

        .hcs-head::before {
          content: "";
          position: absolute;
          left: 5px;
          top: 19px;
          width: 27px;
          height: 5px;
          border-radius: 2px;
          background: linear-gradient(90deg, rgba(0, 0, 0, 0.85), rgba(15, 23, 42, 0.6), rgba(0, 0, 0, 0.85));
        }

        .hcs-head::after {
          content: "";
          position: absolute;
          left: 50%;
          top: -17px;
          width: 10px;
          height: 20px;
          transform: translateX(-50%);
          border-radius: 5px 5px 1px 1px;
          background: linear-gradient(180deg, var(--hero-light), var(--hero-main), var(--hero-dark));
        }

        .hcs-body {
          position: absolute;
          left: 29px;
          top: 45px;
          width: 55px;
          height: 72px;
          border: 2px solid rgba(203, 213, 225, 0.75);
          border-radius: 13px 13px 7px 7px;
          background: linear-gradient(180deg, #cbd5e1, #94a3b8, #64748b, #475569);
        }

        .hcs-body::before {
          content: "";
          position: absolute;
          left: 50%;
          top: 7px;
          transform: translateX(-50%);
          width: 8px;
          height: 45px;
          border-radius: 4px;
          background: linear-gradient(180deg, #fde68a, #f59e0b, #d97706);
        }

        .hcs-shield {
          position: absolute;
          left: 13px;
          top: 52px;
          width: 35px;
          height: 54px;
          border: 2px solid #fde68a;
          border-radius: 16px 16px 24px 24px;
          background: linear-gradient(180deg, var(--hero-main), var(--hero-dark), var(--hero-darkest));
        }

        .hcs-shield::before {
          content: "";
          position: absolute;
          left: 50%;
          top: 46%;
          width: 14px;
          height: 14px;
          transform: translate(-50%, -50%);
          border: 1.5px solid rgba(253, 230, 138, 0.9);
          border-radius: 50%;
          background: radial-gradient(circle, #fde68a 30%, #d97706);
        }

        .hcs-sword {
          position: absolute;
          right: 10px;
          top: 21px;
          width: 16px;
          height: 81px;
          border-radius: 8px 8px 2px 2px;
          background: linear-gradient(90deg, #94a3b8, #f8fafc, #f1f5f9, #94a3b8);
        }

        .hcs-sword::after {
          content: "";
          position: absolute;
          bottom: -13px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-top: 14px solid #94a3b8;
        }

        .hcs-sword::before {
          content: "";
          position: absolute;
          top: 28px;
          left: 50%;
          transform: translateX(-50%);
          width: 34px;
          height: 9px;
          border-radius: 4px;
          background: linear-gradient(90deg, #92400e, #fde68a, #f59e0b, #fde68a, #92400e);
        }

        /* ===================================
           パネル用スプライト（小）
        =================================== */
        .hero-panel-sprite {
          position: relative;
          width: 56px;
          height: 74px;
          filter: drop-shadow(0 8px 12px rgba(0, 0, 0, 0.5));
          --hero-main: #dc2626;
          --hero-light: #f87171;
          --hero-dark: #991b1b;
          --hero-darkest: #7f1d1d;
        }

        .hps-cape {
          position: absolute;
          left: 13px;
          top: 20px;
          width: 32px;
          height: 47px;
          border-radius: 4px 4px 22px 15px;
          background: linear-gradient(165deg, var(--hero-dark), var(--hero-main), var(--hero-dark));
          transform: skewX(-5deg);
        }

        .hps-head {
          position: absolute;
          left: 18px;
          top: 2px;
          width: 20px;
          height: 20px;
          border: 1.5px solid rgba(203, 213, 225, 0.85);
          border-radius: 9px 9px 4px 4px;
          background: linear-gradient(170deg, #94a3b8, #64748b, #475569);
        }

        .hps-head::before {
          content: "";
          position: absolute;
          left: 3px;
          top: 10px;
          width: 13px;
          height: 3px;
          border-radius: 1px;
          background: rgba(0, 0, 0, 0.8);
        }

        .hps-head::after {
          content: "";
          position: absolute;
          left: 50%;
          top: -9px;
          width: 5px;
          height: 10px;
          transform: translateX(-50%);
          border-radius: 3px 3px 1px 1px;
          background: linear-gradient(180deg, var(--hero-light), var(--hero-main));
        }

        .hps-body {
          position: absolute;
          left: 15px;
          top: 23px;
          width: 28px;
          height: 37px;
          border: 1.5px solid rgba(203, 213, 225, 0.75);
          border-radius: 7px 7px 4px 4px;
          background: linear-gradient(180deg, #cbd5e1, #94a3b8, #64748b, #475569);
        }

        .hps-body::before {
          content: "";
          position: absolute;
          left: 50%;
          top: 4px;
          transform: translateX(-50%);
          width: 4px;
          height: 23px;
          border-radius: 2px;
          background: linear-gradient(180deg, #fde68a, #f59e0b);
        }

        .hps-shield {
          position: absolute;
          left: 7px;
          top: 27px;
          width: 18px;
          height: 28px;
          border: 1.5px solid #fde68a;
          border-radius: 8px 8px 12px 12px;
          background: linear-gradient(180deg, var(--hero-main), var(--hero-darkest));
        }

        .hps-shield::before {
          content: "";
          position: absolute;
          left: 50%;
          top: 45%;
          width: 7px;
          height: 7px;
          transform: translate(-50%, -50%);
          border: 1px solid rgba(253, 230, 138, 0.9);
          border-radius: 50%;
          background: radial-gradient(circle, #fde68a 30%, #d97706);
        }

        .hps-sword {
          position: absolute;
          right: 5px;
          top: 11px;
          width: 8px;
          height: 41px;
          border-radius: 4px 4px 1px 1px;
          background: linear-gradient(90deg, #94a3b8, #f8fafc, #94a3b8);
        }

        .hps-sword::after {
          content: "";
          position: absolute;
          bottom: -7px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 4px solid transparent;
          border-right: 4px solid transparent;
          border-top: 8px solid #94a3b8;
        }

        .hps-sword::before {
          content: "";
          position: absolute;
          top: 14px;
          left: 50%;
          transform: translateX(-50%);
          width: 17px;
          height: 5px;
          border-radius: 2px;
          background: linear-gradient(90deg, #92400e, #fde68a, #92400e);
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

        .hero-road-equip-btn {
          margin-top: 10px;
          padding: 6px 14px;
          min-height: 30px;
          border-radius: 10px;
          border: 1px solid rgba(34, 211, 238, 0.35);
          background: rgba(34, 211, 238, 0.1);
          color: #67e8f9;
          font-size: 12px;
          font-weight: 900;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .hero-road-equip-btn:hover {
          background: rgba(34, 211, 238, 0.2);
          transform: translateY(-1px);
        }

        .hero-road-equip-btn.is-equipped {
          border-color: rgba(34, 197, 94, 0.45);
          background: rgba(34, 197, 94, 0.14);
          color: #86efac;
        }

        .hero-road-equip-btn.is-equipped:hover {
          background: rgba(239, 68, 68, 0.12);
          border-color: rgba(239, 68, 68, 0.35);
          color: #fca5a5;
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

        @keyframes heroAuraSpin {
          to { transform: rotate(360deg); }
        }

        @keyframes heroAuraPulse {
          0%, 100% { opacity: 0.45; transform: scale(0.95); }
          50% { opacity: 0.9; transform: scale(1.08); }
        }

        @keyframes heroAuraFloat {
          from { opacity: 0.56; transform: translateY(2px); }
          to { opacity: 1; transform: translateY(-5px); }
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
