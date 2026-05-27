"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import AppLoading from "../../components/AppLoading";
import CommonGameNav from "../../components/CommonGameNav";
import {
  EarnedCard,
  getAttributeLabel,
  getAttributeColor,
  getMonsterCardById,
  getOwnedCount,
  getStatus,
  MonsterCard,
  Rarity,
} from "../../../data/cards";
import {
  loadShopState,
  saveShopState,
  ShopState,
} from "../../../data/shop";
import {
  getAwakeningClassName,
  getAwakeningLevel,
  getCardDetailUnlockSummary,
  getMonsterGrowthStage,
  getMonsterLevelProgress,
  getMonsterNextExpLabel,
  getNextAwakeningRequirement,
  loadQuestProgressSnapshot,
  type ProgressionContext,
  type QuestProgressSnapshot,
} from "../../../data/progression";
import { loadHeroStatus } from "../../../data/hero";

function loadEarnedCards(): EarnedCard[] {
  if (typeof window === "undefined") return [];

  try {
    const savedCardsText = localStorage.getItem("earnedCards");
    const parsedCards = savedCardsText ? JSON.parse(savedCardsText) : [];
    if (!Array.isArray(parsedCards)) return [];

    return parsedCards
      .filter((card) => typeof card?.cardId === "string")
      .map((card) => ({
        ...card,
        cardId: card.cardId,
        correctCount: Math.max(0, Math.floor(Number(card.correctCount) || 0)),
        exp: Math.max(0, Math.floor(Number(card.exp) || 0)),
        obtainedAt:
          typeof card.obtainedAt === "string"
            ? card.obtainedAt
            : new Date().toISOString(),
      })) as EarnedCard[];
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

function getStatusClass(status: string) {
  if (status === "マスター") return "status-master";
  if (status === "成長中") return "status-growing";
  if (status === "獲得済み") return "status-owned";
  return "status-none";
}

function getRarityMessage(rarity: Rarity) {
  if (rarity === "SAR") return "特別なアートと演出を持つ、とても貴重なスペシャルアートレアです。";
  if (rarity === "UR") return "究極級のとても貴重なモンスターカードです。";
  if (rarity === "SSR") return "伝説級のモンスターカードです。";
  if (rarity === "SR") return "かなり貴重な上級カードです。";
  if (rarity === "R") return "冒険で頼れるレアカードです。";
  return "基本となる大切なカードです。";
}

function getEarnedCard(card: MonsterCard, earnedCards: EarnedCard[]) {
  return earnedCards.find((earned) => earned.cardId === card.id);
}

const DEFAULT_SHOP_STATE: ShopState = {
  selectedTitle: null,
  selectedBackground: null,
  selectedMonsterCardId: null,
};

export default function CardDetailPage() {
  const pathname = usePathname();
  const [earnedCards, setEarnedCards] = useState<EarnedCard[]>([]);
  const [shopState, setShopState] = useState<ShopState>(DEFAULT_SHOP_STATE);
  const [heroLevel, setHeroLevel] = useState(1);
  const [questProgress, setQuestProgress] = useState<QuestProgressSnapshot>({});
  const [isReady, setIsReady] = useState(false);

  const cardIdFromUrl = useMemo(() => {
    const encodedId = pathname.split("/").pop() ?? "";
    return decodeURIComponent(encodedId);
  }, [pathname]);

  const card = useMemo(() => {
    return getMonsterCardById(cardIdFromUrl);
  }, [cardIdFromUrl]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setEarnedCards(loadEarnedCards());
      setShopState(loadShopState());
      setHeroLevel(loadHeroStatus().level);
      setQuestProgress(loadQuestProgressSnapshot());
      setIsReady(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  if (!isReady) {
    return (
      <AppLoading
        icon="🃏"
        iconSrc="/home-icons/cards.png"
        iconWidth={1254}
        iconHeight={787}
        title="カードを読み込み中..."
        message="モンスターカード情報を確認しています。"
      />
    );
  }

  if (!card) {
    return (
      <main className="card-detail-page">
        <div className="bg-orb orb-one" />
        <div className="bg-orb orb-two" />
        <div className="bg-orb orb-three" />

        <section className="detail-shell">
          <nav className="eq-topbar">
            <CommonGameNav />
          </nav>

          <div className="not-found-panel">
            <div className="eyebrow">
              <span>⚠️</span>
              <span>CARD NOT FOUND</span>
            </div>

            <h1>カードが見つかりません</h1>

            <p>
              URLから取得したID：
              <strong>{cardIdFromUrl}</strong>
            </p>

            <Link href="/cards" className="primary-action single">
              カード図鑑へ戻る
            </Link>
          </div>
        </section>

        <style jsx>{pageStyles}</style>
      </main>
    );
  }

  const earnedCard = getEarnedCard(card, earnedCards);
  const isOwned = Boolean(earnedCard);
  const ownedCopies = getOwnedCount(earnedCard);
  const exp = earnedCard?.exp ?? 0;
  const status = getStatus(card, earnedCards);
  const monsterProgress = getMonsterLevelProgress(exp);
  const monsterExpPercent = monsterProgress.percent;
  const awakeningLevel = getAwakeningLevel(ownedCopies);
  const nextAwakening = getNextAwakeningRequirement(ownedCopies);
  const currentCardId = card.id;
  const isFavorite = shopState.selectedMonsterCardId === currentCardId;
  const progressionContext: ProgressionContext = {
    heroLevel,
    earnedCards,
    selectedMonsterCardId: shopState.selectedMonsterCardId,
    questProgress,
  };
  const unlockSummary = getCardDetailUnlockSummary({
    card,
    earnedCard,
    context: progressionContext,
  });

  function handleToggleFavorite() {
    if (!isOwned) return;

    const nextState: ShopState = {
      ...shopState,
      selectedMonsterCardId: isFavorite ? null : currentCardId,
    };
    saveShopState(nextState);
    setShopState(nextState);
  }

  return (
    <main className="card-detail-page">
      <div className="bg-orb orb-one" />
      <div className="bg-orb orb-two" />
      <div className="bg-orb orb-three" />

      <section className="detail-shell">
        <nav className="eq-topbar">
          <CommonGameNav />
        </nav>

        <div className="detail-hero-panel">
          <div className="detail-copy">
            <div className="eyebrow">
              <span>🃏</span>
              <span>MONSTER CARD</span>
            </div>

            <h1>{isOwned ? card.name : "Unknown"}</h1>

            <p className="lead">
              {isOwned
                ? card.description
                : "このカードはまだ仲間になっていません。クエストでゴールドを稼ぎ、チケットを買ってパックを開封し、このモンスターカードに出会うと情報が解放されます。"}
            </p>

            <div className="main-actions">
              {isOwned && (
                <button
                  type="button"
                  className={isFavorite ? "favorite-action is-selected" : "favorite-action"}
                  onClick={handleToggleFavorite}
                >
                  <span>{isFavorite ? "✓" : "💠"}</span>
                  {isFavorite ? "相棒に設定中" : "相棒にする"}
                </button>
              )}
            </div>
          </div>

          <div className="card-stage">
            <div
              className={
                isOwned
                  ? `big-card rarity-${card.rarity.toLowerCase()} ${getAwakeningClassName(awakeningLevel)}`
                  : "big-card unknown-card"
              }
            >
              <div className="big-card-shine" />

              <div className="big-card-top">
                <span>
                  {isOwned
                    ? `${card.rarity} / ${getRarityLabel(card.rarity)}`
                    : "??? / UNKNOWN"}
                </span>
                <strong>No.{card.no}</strong>
              </div>

              <div className="big-monster-frame" style={isOwned ? { background: `radial-gradient(circle at 50% 18%, ${getAttributeColor(card.attribute)}40, transparent 45%), linear-gradient(135deg, ${getAttributeColor(card.attribute)}28, rgba(168, 85, 247, 0.25))` } : undefined}>
                <div className="big-monster-glow" style={isOwned ? { background: `${getAttributeColor(card.attribute)}33` } : undefined} />
                <div className="big-monster">
                  {isOwned ? card.monsterEmoji : "?"}
                </div>
              </div>

              <p>{isOwned ? card.title : "UNKNOWN MONSTER"}</p>
              <h2>{isOwned ? card.name : "未発見"}</h2>
              <small style={{ color: isOwned ? getAttributeColor(card.attribute) : undefined }}>
                {isOwned
                  ? `${card.emoji} ${getAttributeLabel(card.attribute)}属性 / ${card.species}`
                  : "？？？"}
              </small>

              {isOwned && (
                <div className="big-card-growth">
                  <span>Lv.{monsterProgress.level} / 20</span>
                  <span>覚醒 Lv.{awakeningLevel}</span>
                  <span>所持 {ownedCopies}枚</span>
                </div>
              )}
            </div>
          </div>

        </div>

        <div className="dashboard-grid">
          <div className="panel card-info-panel">
            <div className="panel-head">
              <div>
                <p>CARD STATUS</p>
                <h2>カード情報</h2>
              </div>
              <span className="panel-icon">{isOwned ? card.emoji : "?"}</span>
            </div>

            <div className="info-grid">
              <div>
                <span>状態</span>
                <strong className={getStatusClass(status)}>
                  {isOwned ? status : "未獲得"}
                </strong>
              </div>

              <div>
                <span>所持枚数</span>
                <strong>{isOwned ? `${ownedCopies}枚` : "0枚"}</strong>
              </div>

              <div>
                <span>属性</span>
                <strong style={{ color: isOwned ? getAttributeColor(card.attribute) : undefined }}>
                  {isOwned ? `${card.emoji} ${getAttributeLabel(card.attribute)}` : "???"}
                </strong>
              </div>

              <div>
                <span>種族</span>
                <strong>{isOwned ? card.species : "???"}</strong>
              </div>

              <div>
                <span>レア度</span>
                <strong>{isOwned ? card.rarity : "???"}</strong>
              </div>
            </div>

            <div className="message-box">
              <span>メモ</span>
              <p>
                {isOwned
                  ? getRarityMessage(card.rarity)
                  : "未獲得のため、詳細はまだ表示されません。"}
              </p>
            </div>
          </div>

          <div className="panel growth-panel">
            <div className="panel-head">
              <div>
                <p>GROWTH</p>
                <h2>成長状況</h2>
              </div>
              <span className="panel-icon">{isOwned ? card.emoji : "?"}</span>
            </div>

            {isOwned ? (
              <>
                <div className="growth-stats">
                  <div>
                    <span>モンスターLv</span>
                    <strong>Lv.{monsterProgress.level} / 20</strong>
                  </div>

                  <div>
                    <span>覚醒Lv</span>
                    <strong>Lv.{awakeningLevel}</strong>
                  </div>

                  <div>
                    <span>成長段階</span>
                    <strong>{getMonsterGrowthStage(monsterProgress.level)}</strong>
                  </div>
                </div>

                <div className="progress-info">
                  <div>
                    <span>次のLvまで</span>
                    <strong>
                      {monsterProgress.isMaxLevel
                        ? "MAX"
                        : `${monsterProgress.currentExp} / ${monsterProgress.requiredExp}`}
                    </strong>
                  </div>

                  <div className="progress-track">
                    <div
                      className="progress-bar card-exp"
                      style={{ width: `${monsterExpPercent}%` }}
                    />
                  </div>

                  <p>
                    {getMonsterNextExpLabel(monsterProgress)}
                  </p>
                </div>

                {nextAwakening && (
                  <div className="awakening-box">
                    <span>次の覚醒</span>
                    <strong>あと{nextAwakening.remainingCopies}枚</strong>
                    <p>
                      {nextAwakening.requiredCopies}枚所持で覚醒Lv.{nextAwakening.targetLevel}になります。
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="loading-box">
                まだこのカードは未獲得です。クエストでゴールドを稼ぎ、チケットを買ってパックを開封すると仲間にできます。
              </div>
            )}
          </div>

          <div className="panel unlock-panel">
            <div className="panel-head">
              <div>
                <p>UNLOCK</p>
                <h2>解放状況</h2>
              </div>
              <span className="panel-icon">{isOwned ? card.emoji : "?"}</span>
            </div>

            {isOwned ? (
              <div className="unlock-columns">
                <div className="unlock-section unlock-done">
                  <span>解放済み</span>
                  {unlockSummary.unlocked.length > 0 ? (
                    <ul>
                      {unlockSummary.unlocked.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>このカードの追加解放はまだありません。</p>
                  )}
                </div>

                <div className="unlock-section unlock-next">
                  <span>次の解放</span>
                  {unlockSummary.next.length > 0 ? (
                    <ul>
                      {unlockSummary.next.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>このカードで確認できる次の解放は達成済みです。</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="loading-box">
                パックから契約すると、称号・背景・覚醒フレームの解放状況が表示されます。
              </div>
            )}
          </div>
        </div>
      </section>

      <style jsx>{pageStyles}</style>
    </main>
  );
}

const pageStyles = `
  .card-detail-page {
    min-height: 100vh;
    position: relative;
    overflow-x: hidden;
    background:
      radial-gradient(circle at 18% 8%, rgba(34, 211, 238, 0.2), transparent 28%),
      radial-gradient(circle at 88% 12%, rgba(168, 85, 247, 0.24), transparent 30%),
      radial-gradient(circle at 50% 100%, rgba(251, 191, 36, 0.13), transparent 32%),
      #050816;
    color: white;
    padding: 22px;
  }

  .bg-orb {
    position: fixed;
    border-radius: 999px;
    filter: blur(70px);
    pointer-events: none;
    opacity: 0.85;
  }

  .orb-one {
    width: 300px;
    height: 300px;
    background: rgba(34, 211, 238, 0.18);
    top: -120px;
    left: -100px;
  }

  .orb-two {
    width: 380px;
    height: 380px;
    background: rgba(168, 85, 247, 0.2);
    top: 40px;
    right: -140px;
  }

  .orb-three {
    width: 340px;
    height: 340px;
    background: rgba(251, 191, 36, 0.12);
    bottom: -150px;
    left: 35%;
  }

  .detail-shell {
    position: relative;
    z-index: 1;
    max-width: 1180px;
    margin: 0 auto;
  }

  .detail-hero-panel {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(248px, 292px) !important;
    gap: 24px;
    align-items: center;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 30px;
    padding: 26px;
    background: linear-gradient(
      135deg,
      rgba(24, 31, 68, 0.94),
      rgba(8, 13, 32, 0.98)
    );
    box-shadow: 0 34px 90px rgba(0, 0, 0, 0.38);
  }

  .eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 8px 13px;
    border-radius: 999px;
    border: 1px solid rgba(251, 191, 36, 0.32);
    background: rgba(251, 191, 36, 0.1);
    color: #fde68a;
    font-size: 12px;
    font-weight: 1000;
    letter-spacing: 0.22em;
  }

  .detail-copy h1,
  .not-found-panel h1 {
    margin: 18px 0 0;
    font-size: clamp(40px, 6vw, 66px);
    line-height: 0.96;
    letter-spacing: 0;
    font-weight: 1000;
  }

  .lead {
    margin: 18px 0 0;
    max-width: 620px;
    color: #cbd5e1;
    line-height: 1.8;
    font-size: 14px;
  }

  .main-actions {
    margin-top: 22px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 12px;
    max-width: 560px;
  }

  .primary-action,
  .pack-action,
  .favorite-action {
    min-height: 58px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    border-radius: 20px;
    text-decoration: none;
    font-size: 16px;
    font-weight: 1000;
    border: 0;
    font-family: inherit;
    cursor: pointer;
    transition:
      transform 0.18s ease,
      box-shadow 0.18s ease;
  }

  .primary-action {
    background: linear-gradient(135deg, #fde047, #fb923c);
    color: #111827;
    box-shadow: 0 20px 46px rgba(251, 191, 36, 0.28);
  }

  .primary-action.single {
    margin-top: 26px;
    max-width: 280px;
  }

  .pack-action {
    background: linear-gradient(
      135deg,
      rgba(168, 85, 247, 0.34),
      rgba(34, 211, 238, 0.18)
    );
    color: white;
    border: 1px solid rgba(216, 180, 254, 0.35);
  }

  .favorite-action {
    background:
      linear-gradient(135deg, rgba(34, 211, 238, 0.22), rgba(250, 204, 21, 0.12)),
      rgba(15, 23, 42, 0.76);
    color: #ecfeff;
    border: 1px solid rgba(34, 211, 238, 0.34);
  }

  .favorite-action.is-selected {
    border-color: rgba(52, 211, 153, 0.55);
    background: rgba(52, 211, 153, 0.14);
    color: #bbf7d0;
  }

  .primary-action:hover,
  .pack-action:hover,
  .favorite-action:hover {
    transform: translateY(-4px);
  }

  .card-stage {
    display: flex;
    justify-content: center;
  }

  .big-card {
    position: relative;
    width: 252px;
    min-height: 392px;
    overflow: hidden;
    border-radius: 32px;
    padding: 4px 4px 16px;
    background: linear-gradient(135deg, #94a3b8, #22d3ee, #a855f7);
    box-shadow: 0 0 70px rgba(168, 85, 247, 0.28);
  }

  .big-card::before {
    content: "";
    position: absolute;
    inset: 4px;
    border-radius: 28px;
    background:
      radial-gradient(circle at 50% 16%, rgba(255, 255, 255, 0.18), transparent 40%),
      #050816;
    z-index: 0;
  }

  .big-card.rarity-ssr {
    background: linear-gradient(135deg, #fde047, #f59e0b, #22d3ee);
    box-shadow: 0 0 78px rgba(251, 191, 36, 0.32);
  }

  .big-card.rarity-sar {
    background: conic-gradient(from 15deg, #fef3c7, #fb7185, #a855f7, #22d3ee, #fde68a, #fef3c7);
    box-shadow:
      0 0 92px rgba(253, 230, 138, 0.38),
      0 0 56px rgba(244, 114, 182, 0.24);
  }

  .big-card.rarity-sr {
    background: linear-gradient(135deg, #c084fc, #22d3ee, #facc15);
  }

  .big-card.rarity-r {
    background: linear-gradient(135deg, #22d3ee, #60a5fa, #a855f7);
  }

  .big-card.awakening-1 {
    box-shadow:
      0 0 70px rgba(168, 85, 247, 0.28),
      0 0 28px rgba(34, 211, 238, 0.28);
  }

  .big-card.awakening-2::after,
  .big-card.awakening-3::after {
    content: "";
    position: absolute;
    inset: -24px;
    z-index: 0;
    border-radius: 46px;
    background: conic-gradient(from 0deg, transparent, rgba(34, 211, 238, 0.22), transparent, rgba(250, 204, 21, 0.16), transparent);
    animation: shine 5s linear infinite;
  }

  .big-card.awakening-3 {
    background: conic-gradient(from 15deg, #fef3c7, #22d3ee, #a855f7, #facc15, #fef3c7);
    box-shadow:
      0 0 78px rgba(250, 204, 21, 0.34),
      0 0 48px rgba(34, 211, 238, 0.2);
  }

  .unknown-card {
    opacity: 0.72;
    background: linear-gradient(135deg, #334155, #64748b, #0f172a);
  }

  .big-card-shine {
    position: absolute;
    inset: -90px;
    background: linear-gradient(
      115deg,
      transparent 35%,
      rgba(255, 255, 255, 0.28),
      transparent 65%
    );
    animation: shine 3.2s ease-in-out infinite;
    z-index: 1;
  }

  .big-card-top,
  .big-monster-frame,
  .big-card p,
  .big-card h2,
  .big-card small,
  .big-owned-count,
  .big-card-growth {
    position: relative;
    z-index: 2;
  }

  .big-card-top {
    margin: 16px 16px 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .big-card-top span,
  .big-card-top strong {
    border-radius: 999px;
    padding: 7px 10px;
    background: rgba(255, 255, 255, 0.12);
    font-size: 10px;
    font-weight: 1000;
  }

  .big-monster-frame {
    margin: 18px 16px 0;
    height: 172px;
    display: grid;
    place-items: center;
    overflow: hidden;
    border-radius: 24px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background:
      radial-gradient(circle at 50% 18%, rgba(255, 255, 255, 0.3), transparent 45%),
      linear-gradient(135deg, rgba(34, 211, 238, 0.28), rgba(168, 85, 247, 0.25));
  }

  .big-monster-glow {
    position: absolute;
    width: 140px;
    height: 140px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.12);
    filter: blur(26px);
  }

  .big-monster {
    position: relative;
    z-index: 1;
    font-size: 92px;
    filter: drop-shadow(0 18px 28px rgba(0, 0, 0, 0.42));
  }

  .unknown-card .big-monster {
    color: #64748b;
    filter: blur(1px);
  }

  .big-card p {
    margin: 18px 18px 0;
    color: #fde68a;
    font-size: 11px;
    font-weight: 1000;
    letter-spacing: 0.16em;
    text-align: center;
  }

  .big-card h2 {
    margin: 8px 18px 0;
    font-size: 25px;
    line-height: 1.18;
    font-weight: 1000;
    text-align: center;
    white-space: normal;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .big-card small {
    display: block;
    margin: 7px 18px 0;
    color: #cbd5e1;
    font-size: 12px;
    line-height: 1.35;
    font-weight: 900;
    text-align: center;
    white-space: normal;
    overflow-wrap: anywhere;
  }

  .big-owned-count {
    margin: 14px 22px 0;
    border-radius: 999px;
    padding: 9px 12px;
    text-align: center;
    background: rgba(251, 191, 36, 0.13);
    border: 1px solid rgba(251, 191, 36, 0.28);
    color: #fde68a;
    font-size: 13px;
    font-weight: 1000;
  }

  .big-card-growth {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 7px;
    margin: 12px 16px 0;
  }

  .big-card-growth span {
    border-radius: 999px;
    border: 1px solid rgba(34, 211, 238, 0.22);
    background: rgba(2, 6, 23, 0.32);
    color: #ecfeff;
    padding: 6px 8px;
    font-size: 10px;
    font-weight: 1000;
  }

  .status-strip {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
  }

  .status-card {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.055);
    border-radius: 18px;
    padding: 14px 16px;
  }

  .status-card.highlight {
    border-color: rgba(251, 191, 36, 0.32);
    background: rgba(251, 191, 36, 0.1);
  }

  .status-card span {
    display: block;
    color: #94a3b8;
    font-size: 12px;
    font-weight: 800;
  }

  .status-card strong {
    display: block;
    margin-top: 6px;
    font-size: 24px;
    font-weight: 1000;
  }

  .dashboard-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 16px;
    margin-top: 16px;
  }

  .panel,
  .not-found-panel {
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 26px;
    padding: 24px;
    background: rgba(8, 14, 35, 0.88);
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.3);
  }

  .card-info-panel {
    border-color: rgba(251, 191, 36, 0.2);
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.3), inset 0 2px 0 rgba(251, 191, 36, 0.2);
  }

  .growth-panel {
    border-color: rgba(34, 211, 238, 0.2);
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.3), inset 0 2px 0 rgba(34, 211, 238, 0.2);
  }

  .unlock-panel {
    border-color: rgba(168, 85, 247, 0.2);
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.3), inset 0 2px 0 rgba(168, 85, 247, 0.22);
  }

  .not-found-panel {
    padding: 38px;
  }

  .not-found-panel p {
    margin-top: 24px;
    color: #cbd5e1;
    line-height: 1.8;
  }

  .not-found-panel strong {
    color: #fde68a;
  }

  .panel-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 18px;
    margin-bottom: 20px;
    padding-bottom: 18px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  }

  .panel-head p {
    margin: 0;
    color: #a5f3fc;
    font-size: 12px;
    font-weight: 1000;
    letter-spacing: 0.24em;
  }

  .card-info-panel .panel-head p { color: #fde68a; }
  .unlock-panel .panel-head p { color: #d8b4fe; }

  .panel-head h2 {
    margin: 6px 0 0;
    font-size: 22px;
    font-weight: 1000;
  }

  .panel-icon {
    font-size: 34px;
  }

  .info-grid,
  .growth-stats {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .growth-stats {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .info-grid div,
  .growth-stats div,
  .example-box,
  .message-box,
  .loading-box {
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.055);
    padding: 14px;
  }

  .info-grid span,
  .growth-stats span,
  .example-box span,
  .message-box span {
    display: block;
    color: #94a3b8;
    font-size: 12px;
    font-weight: 800;
  }

  .info-grid strong,
  .growth-stats strong {
    display: block;
    margin-top: 7px;
    font-size: 16px;
    font-weight: 1000;
  }

  .message-box {
    margin-top: 16px;
  }

  .message-box p,
  .loading-box,
  .awakening-box p {
    color: #cbd5e1;
    line-height: 1.8;
    font-size: 14px;
  }

  .message-box p {
    margin: 8px 0 0;
  }

  .progress-info {
    margin-top: 18px;
  }

  .progress-info > div:first-child {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    color: #cbd5e1;
    font-size: 13px;
    font-weight: 900;
  }

  .progress-track {
    margin-top: 12px;
    height: 14px;
    overflow: hidden;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.1);
  }

  .progress-bar {
    height: 100%;
    border-radius: 999px;
    transition: width 0.3s ease;
  }

  .card-exp {
    background: linear-gradient(90deg, #22d3ee, #fde047, #fb923c);
    box-shadow: 0 0 24px rgba(251, 191, 36, 0.24);
  }

  .progress-info p {
    margin: 12px 0 0;
    color: #cbd5e1;
    line-height: 1.8;
    font-size: 14px;
  }

  .awakening-box {
    margin-top: 16px;
    border: 1px solid rgba(34, 211, 238, 0.16);
    border-radius: 22px;
    background: rgba(34, 211, 238, 0.065);
    padding: 16px;
  }

  .awakening-box span {
    display: block;
    color: #94a3b8;
    font-size: 12px;
    font-weight: 800;
  }

  .awakening-box strong {
    display: block;
    margin-top: 7px;
    color: #a5f3fc;
    font-size: 20px;
    font-weight: 1000;
  }

  .awakening-box p {
    margin: 8px 0 0;
  }

  .unlock-columns {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .unlock-section {
    border-radius: 18px;
    padding: 16px;
  }

  .unlock-done {
    border: 1px solid rgba(52, 211, 153, 0.22);
    background: rgba(52, 211, 153, 0.05);
  }

  .unlock-next {
    border: 1px solid rgba(251, 191, 36, 0.22);
    background: rgba(251, 191, 36, 0.04);
  }

  .unlock-section > span {
    display: block;
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 12px;
  }

  .unlock-done > span { color: #34d399; }
  .unlock-next > span { color: #fbbf24; }

  .unlock-section ul {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .unlock-done li {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    color: #a7f3d0;
    font-size: 13px;
    line-height: 1.6;
    padding: 9px 12px;
    border-radius: 12px;
    background: rgba(52, 211, 153, 0.08);
    border: 1px solid rgba(52, 211, 153, 0.14);
  }

  .unlock-done li::before {
    content: "✓";
    flex-shrink: 0;
    color: #34d399;
    font-weight: 900;
    font-size: 12px;
    line-height: 1.6;
  }

  .unlock-next li {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    color: #fde68a;
    font-size: 13px;
    line-height: 1.6;
    padding: 9px 12px;
    border-radius: 12px;
    background: rgba(251, 191, 36, 0.07);
    border: 1px solid rgba(251, 191, 36, 0.16);
  }

  .unlock-next li::before {
    content: "◎";
    flex-shrink: 0;
    color: #fbbf24;
    font-weight: 900;
    font-size: 12px;
    line-height: 1.6;
  }

  .unlock-section p {
    color: #64748b;
    font-size: 13px;
    line-height: 1.7;
    margin: 0;
  }

  .example-box + .example-box {
    margin-top: 14px;
  }

  .example-box strong {
    display: block;
    margin-top: 8px;
    font-size: 18px;
    line-height: 1.7;
  }

  .status-master {
    color: #bbf7d0;
  }

  .status-growing {
    color: #cffafe;
  }

  .status-owned {
    color: #fde68a;
  }

  .status-none {
    color: #94a3b8;
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

  @media (max-width: 1020px) {
    .detail-hero-panel {
      grid-template-columns: 1fr !important;
    }

    .card-stage {
      order: -1;
    }

    .dashboard-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 680px) {
    .card-detail-page {
      padding: 18px;
    }

    .detail-hero-panel,
    .panel,
    .not-found-panel {
      border-radius: 28px;
      padding: 22px;
    }

    .main-actions,
    .status-strip,
    .info-grid,
    .growth-stats {
      grid-template-columns: 1fr;
    }

    .big-card {
      width: 240px;
      min-height: 395px;
    }

    .big-monster-frame {
      height: 170px;
    }

    .big-monster {
      font-size: 92px;
    }

    .big-card h2 {
      font-size: 26px;
    }
  }
`;
