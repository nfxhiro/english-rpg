"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import PageTopBar from "../components/PageTopBar";
import {
  monsterCards,
  MonsterCard,
  Rarity,
} from "../../data/cards";
import { loadGold, spendGold } from "../../data/hero";
import { bgmPlayer } from "../../data/bgm";
import {
  clearLastPackOpenResult,
  loadLastPackOpenResult,
  openStoredPack,
  queueForcedGodPack,
} from "../../data/packStorage";

const TICKET_PRICE_ONE = 100;
const TICKET_PRICE_TEN = 900;

type TenPackItem = {
  card: MonsterCard;
  isNew: boolean;
};

function loadPackTickets(): number {
  if (typeof window === "undefined") return 0;

  const value = Number(localStorage.getItem("packTickets") ?? "0");
  return Number.isFinite(value) ? value : 0;
}

function getRarityLabel(rarity: Rarity) {
  if (rarity === "SAR") return "スペシャルアート";
  if (rarity === "UR")  return "アルティメット";
  if (rarity === "SSR") return "レジェンド";
  if (rarity === "SR")  return "スーパーレア";
  if (rarity === "R")   return "レア";
  return "ノーマル";
}

function isPrizeRarity(rarity: Rarity) {
  return rarity === "SAR" || rarity === "UR" || rarity === "SSR" || rarity === "SR";
}

function getPrizeRevealClass(rarity: Rarity) {
  if (rarity === "SAR") return " prize-reveal prize-sar";
  if (rarity === "UR")  return " prize-reveal prize-ur";
  if (rarity === "SSR") return " prize-reveal prize-ssr";
  if (rarity === "SR")  return " prize-reveal prize-sr";
  return "";
}

function getDropCallout(rarity: Rarity) {
  if (rarity === "SAR") return "ULTIMATE DROP";
  if (rarity === "UR")  return "ULTIMATE DROP";
  if (rarity === "SSR") return "LEGEND DROP";
  if (rarity === "SR")  return "EPIC DROP";
  return null;
}

function getTenPackFlipDelay(rarity: Rarity) {
  if (rarity === "SAR") return 1500;
  if (rarity === "UR") return 1350;
  if (rarity === "SSR") return 1120;
  if (rarity === "SR") return 860;
  if (rarity === "R") return 620;
  return 480;
}

function getTenPackRevealHoldDelay(rarity: Rarity) {
  if (rarity === "SAR") return 3100;
  if (rarity === "UR") return 2750;
  if (rarity === "SSR") return 2300;
  if (rarity === "SR") return 1650;
  if (rarity === "R") return 1120;
  return 900;
}

function renderCardRevealEffects(rarity: Rarity) {
  const sparkCount = rarity === "SAR" ? 24 : rarity === "UR" ? 20 : rarity === "SSR" ? 14 : 10;
  return (
    <div className={`card-reveal-effects rarity-${rarity.toLowerCase()}`} aria-hidden="true">
      {Array.from({ length: sparkCount }, (_, index) => (
        <span key={index} />
      ))}
    </div>
  );
}

function renderPrizeRays(rarity: Rarity) {
  const rayCount = rarity === "SAR" ? 14 : rarity === "UR" ? 12 : rarity === "SSR" ? 8 : 6;
  return (
    <div className={`pack-prize-effects rays-${rarity.toLowerCase()}`} aria-hidden="true">
      {Array.from({ length: rayCount }, (_, i) => <span key={i} />)}
    </div>
  );
}

export default function PackPage() {
  const router = useRouter();
  const [packTickets, setPackTickets] = useState(0);
  const [gold, setGold] = useState(0);
  const [openedCard, setOpenedCard] = useState<MonsterCard | null>(null);
  const [isNewCard, setIsNewCard] = useState(false);
  const [openedCopies, setOpenedCopies] = useState(0);
  const [isOpening, setIsOpening] = useState(false);
  const [tenPackResult, setTenPackResult] = useState<TenPackItem[] | null>(null);
  const [isOpeningTen, setIsOpeningTen] = useState(false);
  const [tenPackCurrentIndex, setTenPackCurrentIndex] = useState(0);
  const [tenPackCardFlipped, setTenPackCardFlipped] = useState(false);
  const [revealFlash, setRevealFlash] = useState<{ rarity: Rarity; key: number } | null>(null);
  const isGodPack = false;
  const godPackPhase = 0;
  const [cheatToast, setCheatToast] = useState(false);
  const [prizeOverlay, setPrizeOverlay] = useState<{
    rarity: Rarity;
    emoji: string;
    name: string;
    isNew: boolean;
    key: number;
  } | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPackTickets(loadPackTickets());
      setGold(loadGold());
      const lastResult = loadLastPackOpenResult();
      if (lastResult) {
        if (lastResult.mode === "single" && !lastResult.isGodPack) {
          const resolvedItems = lastResult.items
            .map((item) => {
              const card = monsterCards.find((monsterCard) => monsterCard.id === item.cardId);
              return card ? { card, isNew: item.isNew, ownedCopies: item.ownedCopies } : null;
            })
            .filter((item): item is TenPackItem & { ownedCopies: number } => item !== null);

          const [singleItem] = resolvedItems;
          if (singleItem) {
            setOpenedCard(singleItem.card);
            setIsNewCard(singleItem.isNew);
            setOpenedCopies(singleItem.ownedCopies);
          }
        }
        clearLastPackOpenResult();
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const SECRET = "GODPACK";
    let buf = "";
    let toastTimer: ReturnType<typeof setTimeout>;

    function onKey(e: KeyboardEvent) {
      if (e.key.length !== 1) return;
      buf = (buf + e.key.toUpperCase()).slice(-SECRET.length);
      if (buf === SECRET) {
        queueForcedGodPack();
        setCheatToast(true);
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => setCheatToast(false), 2800);
        buf = "";
      }
    }

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      clearTimeout(toastTimer);
    };
  }, []);

  useEffect(() => {
    if (!tenPackResult || tenPackCardFlipped || tenPackCurrentIndex >= tenPackResult.length) return;
    const item = tenPackResult[tenPackCurrentIndex];
    const timer = window.setTimeout(() => {
      bgmPlayer.playSfxCardFlip();
      setTenPackCardFlipped(true);
    }, getTenPackFlipDelay(item.card.rarity));
    return () => window.clearTimeout(timer);
  }, [tenPackResult, tenPackCurrentIndex, tenPackCardFlipped]);

  useEffect(() => {
    if (!openedCard) return;
    bgmPlayer.playSfxReveal(openedCard.rarity);
    if (isPrizeRarity(openedCard.rarity)) {
      const timer = window.setTimeout(() => {
        setRevealFlash({ rarity: openedCard.rarity, key: Date.now() });
      }, 0);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [openedCard]);

  useEffect(() => {
    if (!tenPackCardFlipped || !tenPackResult) return;
    const item = tenPackResult[tenPackCurrentIndex];
    if (!item) return;
    bgmPlayer.playSfxReveal(item.card.rarity);
    if (isPrizeRarity(item.card.rarity)) {
      const timer = window.setTimeout(() => {
        setRevealFlash({ rarity: item.card.rarity, key: Date.now() });
      }, 0);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [tenPackCardFlipped, tenPackResult, tenPackCurrentIndex]);

  useEffect(() => {
    if (!tenPackCardFlipped || !tenPackResult) return;
    const item = tenPackResult[tenPackCurrentIndex];
    if (!item) return;
    if (item.card.rarity === "SSR" || item.card.rarity === "UR" || item.card.rarity === "SAR") {
      const timer = window.setTimeout(() => setPrizeOverlay({
        rarity: item.card.rarity,
        emoji: item.card.monsterEmoji,
        name: item.card.name,
        isNew: item.isNew,
        key: Date.now(),
      }), 0);

      return () => window.clearTimeout(timer);
    }

    return undefined;
  }, [tenPackCardFlipped, tenPackResult, tenPackCurrentIndex]);

  useEffect(() => {
    if (!prizeOverlay) return;
    const dur = prizeOverlay.rarity === "SAR" ? 2600 : prizeOverlay.rarity === "UR" ? 2100 : 1750;
    const t = window.setTimeout(() => setPrizeOverlay(null), dur);
    return () => window.clearTimeout(t);
  }, [prizeOverlay]);

  useEffect(() => {
    if (!tenPackCardFlipped || !tenPackResult) return;
    const item = tenPackResult[tenPackCurrentIndex];
    if (!item) return;

    const timer = window.setTimeout(() => {
      setTenPackCurrentIndex((currentIndex) =>
        Math.min(currentIndex + 1, tenPackResult.length)
      );
      setTenPackCardFlipped(false);
    }, getTenPackRevealHoldDelay(item.card.rarity));

    return () => window.clearTimeout(timer);
  }, [tenPackCardFlipped, tenPackResult, tenPackCurrentIndex]);

  const isTenPackComplete = Boolean(
    tenPackResult && tenPackCurrentIndex >= tenPackResult.length
  );
  const revealedTenPackCount = tenPackResult
    ? isTenPackComplete
      ? tenPackResult.length
      : tenPackCurrentIndex + (tenPackCardFlipped ? 1 : 0)
    : 0;
  const tenPackProgressPercent = tenPackResult
    ? Math.round((revealedTenPackCount / tenPackResult.length) * 100)
    : 0;
  const currentTenPackItem = (
    tenPackResult && !isTenPackComplete ? tenPackResult[tenPackCurrentIndex] : null
  ) as TenPackItem;
  const currentTenPackPrizeClass =
    currentTenPackItem && tenPackCardFlipped
      ? getPrizeRevealClass(currentTenPackItem.card.rarity)
      : "";
  const currentTenPackCallout = currentTenPackItem
    ? getDropCallout(currentTenPackItem.card.rarity)
    : null;
  const openedCardPrizeClass = openedCard ? getPrizeRevealClass(openedCard.rarity) : "";
  const openedCardCallout = openedCard ? getDropCallout(openedCard.rarity) : null;
  const tenPackNewCount = useMemo(() => {
    return tenPackResult?.filter((item) => item.isNew).length ?? 0;
  }, [tenPackResult]);
  const isTenPackAutoRevealing = false;
  const canOpenPack = packTickets > 0 && !isOpening && !isOpeningTen && !isTenPackAutoRevealing && godPackPhase === 0;
  const canOpenTenPack = packTickets >= 10 && !isOpening && !isOpeningTen && !isTenPackAutoRevealing && godPackPhase === 0;

  const openPack = () => {
    if (!canOpenPack) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
    window.setTimeout(() => {
      setIsOpening(true);
      setOpenedCard(null);
      setTenPackResult(null);
      setTenPackCurrentIndex(0);
      setTenPackCardFlipped(false);
      window.setTimeout(() => {
        bgmPlayer.playSfxPackOpen();
        const result = openStoredPack("single");
        setIsOpening(false);
        if (!result.ok || !result.items[0]) return;
        const item = result.items[0];
        setPackTickets(result.remainingTickets);
        setOpenedCard(item.card);
        setIsNewCard(item.isNew);
        setOpenedCopies(item.ownedCopies);
      }, 700);
    }, 400);
  };

  const skipTenPack = () => {
    if (!tenPackResult) return;
    setTenPackCurrentIndex(tenPackResult.length);
    setTenPackCardFlipped(false);
  };

  const openTenPack = () => {
    if (!canOpenTenPack) return;
    setIsOpeningTen(true);
    window.setTimeout(() => {
      const openId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      sessionStorage.setItem(`pack-open-ready:${openId}`, "1");
      router.replace(`/pack/open?mode=ten&openId=${encodeURIComponent(openId)}`);
    }, 420);
  };

  const buyTickets = (count: 1 | 10) => {
    const price = count === 1 ? TICKET_PRICE_ONE : TICKET_PRICE_TEN;
    if (gold < price) return;
    const success = spendGold(price);
    if (!success) return;
    const nextGold = gold - price;
    const nextTickets = packTickets + count;
    localStorage.setItem("packTickets", String(nextTickets));
    setGold(nextGold);
    setPackTickets(nextTickets);
  };

  return (
    <main className="eq-page pack-page">
      <div className="pack-page-bg" aria-hidden="true" />
      <div className="pack-page-bg-overlay" aria-hidden="true" />
      <div className="eq-bg-orb eq-bg-orb-one" />
      <div className="eq-bg-orb eq-bg-orb-two" />
      <div className="eq-bg-orb eq-bg-orb-three" />

      {/* GOD Pack Intro Overlay */}
      {godPackPhase > 0 && (
        <div
          className={`god-pack-overlay god-pack-phase-${godPackPhase}`}
          aria-live="assertive"
          aria-label="GODパック発動"
        >
          <div className="god-pack-bg" />
          <div className="god-pack-cracks" aria-hidden="true">
            {Array.from({ length: 8 }, (_, i) => <span key={i} />)}
          </div>
          <div className="god-pack-circle" aria-hidden="true">
            <div className="god-pack-circle-inner" />
          </div>
          <div className="god-pack-content">
            <p className="god-pack-kicker">神域解放</p>
            <h2 className="god-pack-name">GOD PACK</h2>
            <div className="god-pack-guarantees">
              <span>✦ SARまたはUR 1枚確定</span>
              <span>✦ SSR 2枚以上確定</span>
              <span>✦ 10枚すべてSR以上</span>
            </div>
            <p className="god-pack-flavor">伝説の召喚が始まる</p>
          </div>
        </div>
      )}

      {/* SSR / UR / SAR ドラマティック出現オーバーレイ */}
      {prizeOverlay && (
        <div
          key={prizeOverlay.key}
          className={`prize-overlay prize-overlay-${prizeOverlay.rarity.toLowerCase()}`}
          aria-live="assertive"
          aria-label={`${prizeOverlay.rarity} 出現`}
        >
          <div className="prize-overlay-bg" />
          <div className="prize-overlay-rays" aria-hidden="true">
            {Array.from({ length: prizeOverlay.rarity === "SAR" ? 20 : prizeOverlay.rarity === "UR" ? 16 : 12 }, (_, i) => (
              <span key={i} />
            ))}
          </div>
          <div className="prize-overlay-rings" aria-hidden="true">
            <span /><span /><span />
          </div>
          <div className="prize-overlay-particles" aria-hidden="true">
            {Array.from({ length: 30 }, (_, i) => <span key={i} />)}
          </div>
          <div className="prize-overlay-content">
            <div className="prize-overlay-rarity-tag">{prizeOverlay.rarity}</div>
            <div className="prize-overlay-emoji">{prizeOverlay.emoji}</div>
            <div className="prize-overlay-label">{getRarityLabel(prizeOverlay.rarity)}</div>
            <div className="prize-overlay-name">{prizeOverlay.name}</div>
            {prizeOverlay.isNew && <div className="prize-overlay-new-badge">NEW CARD</div>}
          </div>
        </div>
      )}

      <section className="eq-shell">
        <PageTopBar />

        <div className="eq-hero">
          <div className="eq-hero-copy">
            <div className="eq-eyebrow">
              <span>🎁</span>
              <span>MONSTER CARD PACK</span>
            </div>

            <h1 className="eq-page-title">パック開封</h1>

            <p className="eq-lead pack-lead">
              クエストで集めたゴールドをチケットに交換して、仲間になるモンスターカードを召喚しよう。
              10連ではレアな出会いに期待できます。
            </p>

            <div className="pack-gold-bar">
              <span className="pack-gold-label">💰 ゴールド</span>
              <strong className="pack-gold-amount">{gold.toLocaleString()}G</strong>
            </div>

            <div className="pack-shop">
              <div className="pack-shop-grid">
                <button
                  type="button"
                  className={gold >= TICKET_PRICE_ONE ? "pack-shop-btn" : "pack-shop-btn disabled"}
                  disabled={gold < TICKET_PRICE_ONE}
                  onClick={() => buyTickets(1)}
                >
                  <span>🎫</span>
                  <strong>チケットを1枚買う</strong>
                  <small>{TICKET_PRICE_ONE}G</small>
                </button>
                <button
                  type="button"
                  className={gold >= TICKET_PRICE_TEN ? "pack-shop-btn pack-shop-btn-ten" : "pack-shop-btn pack-shop-btn-ten disabled"}
                  disabled={gold < TICKET_PRICE_TEN}
                  onClick={() => buyTickets(10)}
                >
                  <span>🌟</span>
                  <strong>チケットを10枚買う</strong>
                  <small>{TICKET_PRICE_TEN}G（お得）</small>
                </button>
              </div>
            </div>

            <div className="eq-actions">
              <button
                type="button"
                onClick={openPack}
                disabled={!canOpenPack}
                className={
                  canOpenPack
                    ? "eq-button eq-button-primary pack-open-button"
                    : "eq-button eq-button-ghost pack-open-button disabled"
                }
              >
                <span>{isOpening ? "✨" : "🎁"}</span>
                {isOpening ? "開封中..." : "1枚開封（チケット×1）"}
              </button>

              <button
                type="button"
                onClick={openTenPack}
                disabled={!canOpenTenPack}
                className={
                  canOpenTenPack
                    ? "eq-button eq-button-tenpack pack-open-button"
                    : "eq-button eq-button-ghost pack-open-button disabled"
                }
              >
                <span>{isOpeningTen ? "✨" : "🌟"}</span>
                {isOpeningTen ? "開封中..." : "10連開封（チケット×10）"}
              </button>
            </div>
          </div>

          <div className="pack-stage">
            {tenPackResult && !isTenPackComplete && false ? (
              <div className="tenpack-reveal-wrap">
                <div className="tenpack-reveal-header">
                  <span className="tenpack-reveal-label">10連召喚</span>
                  <span className="tenpack-reveal-counter">{tenPackCurrentIndex + 1} / 10</span>
                </div>
                <div className="tenpack-reveal-meter-bar">
                  <div style={{ width: `${tenPackProgressPercent}%` }} />
                </div>
                <div
                  key={`tenpack-stage-${tenPackCurrentIndex}-${tenPackCardFlipped ? "front" : "back"}`}
                  className={`pack-display${
                    !tenPackCardFlipped
                      ? " tenpack-suspense"
                      : ` opened tenpack-revealed rarity-${currentTenPackItem?.card.rarity.toLowerCase() ?? "n"}${currentTenPackPrizeClass}`
                  }`}
                  aria-live="polite"
                >
                  <div className="eq-display-shine" />
                  {tenPackCardFlipped && currentTenPackItem
                    ? renderCardRevealEffects(currentTenPackItem!.card.rarity)
                    : null}
                  {tenPackCardFlipped && currentTenPackCallout && currentTenPackItem
                    ? renderPrizeRays(currentTenPackItem!.card.rarity)
                    : null}
                  {!tenPackCardFlipped ? (
                    <>
                      <div className="pack-gift">
                        <Image
                          src="/home-icons/pack.png"
                          alt=""
                          width={709}
                          height={1179}
                          className="pack-gift-image"
                          sizes="130px"
                          style={{ width: "100%", height: "100%", objectFit: "contain" }}
                          aria-hidden="true"
                        />
                      </div>
                      <p>10 PACK SUMMON</p>
                      <h2>開封中...</h2>
                      <span>自動でカードを呼び出しています</span>
                    </>
                  ) : currentTenPackItem ? (
                    <>
                      {currentTenPackCallout && currentTenPackItem && (
                        <div className={`pack-rarity-callout callout-${currentTenPackItem.card.rarity.toLowerCase()}`}>{currentTenPackCallout}</div>
                      )}
                      <div className="pack-card-rarity">
                        {currentTenPackItem.card.rarity} / {getRarityLabel(currentTenPackItem.card.rarity)}
                      </div>
                      <div className="pack-result-emoji">{currentTenPackItem.card.monsterEmoji}</div>
                      <p>{currentTenPackItem.isNew ? "新しいカード" : "獲得済み"}</p>
                      <h2>{currentTenPackItem.card.name}</h2>
                      <div className={currentTenPackItem.isNew ? "pack-stage-chip new" : "pack-stage-chip"}>
                        {currentTenPackItem.isNew ? "新しいカード!" : "すでに所持"}
                      </div>
                    </>
                  ) : null}
                </div>
                <div className="tenpack-auto-note">
                  {tenPackCardFlipped
                    ? tenPackCurrentIndex >= 9
                      ? "結果へ自動で進みます"
                      : `次のカードへ自動で進みます（${tenPackCurrentIndex + 2}/10）`
                    : "カードをめくっています"}
                </div>
                <button
                  type="button"
                  className="tenpack-skip-btn"
                  onClick={skipTenPack}
                >
                  スキップ ▶▶
                </button>
              </div>
            ) : isTenPackComplete && tenPackResult && false ? (
              <div className={`tenpack-stage-display complete${isGodPack ? " god-pack-complete" : ""}`}>
                <div className="eq-display-shine" />
                {isGodPack && (
                  <div className="god-pack-stage-banner">
                    <div className="god-pack-stage-title">✧ GOD PACK ✧</div>
                    <div className="god-pack-stage-badges">
                      <span className="gpbadge gpbadge-ur">SAR/UR 1枚確定</span>
                      <span className="gpbadge gpbadge-ssr">SSR 2枚以上確定</span>
                      <span className="gpbadge gpbadge-sr">ALL SR+</span>
                    </div>
                  </div>
                )}
                <div className="tenpack-stage-head">
                  <div>
                    <p>{isGodPack ? "特別召喚の結果" : "10連召喚の結果"}</p>
                    <h2>{isGodPack ? "神域召喚完了!" : "10連開封完了!"}</h2>
                  </div>
                  <strong>NEW {tenPackNewCount}</strong>
                </div>
                <div className="tenpack-stage-meter">
                  <div style={{ width: "100%" }} />
                </div>
              </div>
            ) : (
              <div
                className={`pack-display${isOpening ? " opening" : ""}${
                  openedCard
                    ? ` opened rarity-${openedCard.rarity.toLowerCase()}${openedCardPrizeClass}`
                    : ""
                }`}
              >
                <div className="eq-display-shine" />
                {openedCardCallout && openedCard && renderPrizeRays(openedCard.rarity)}

                {openedCard ? (
                  <>
                    {renderCardRevealEffects(openedCard.rarity)}
                    {openedCardCallout && openedCard && (
                      <div className={`pack-rarity-callout callout-${openedCard.rarity.toLowerCase()}`}>{openedCardCallout}</div>
                    )}
                    <div className="pack-card-rarity">
                      {openedCard.rarity} / {getRarityLabel(openedCard.rarity)}
                    </div>

                    <div className="pack-result-emoji">{openedCard.monsterEmoji}</div>

                    <p>{isNewCard ? "新しいカード" : "獲得済み"}</p>
                    <h2>{openedCard.name}</h2>
                    <span>
                      {openedCard.emoji} {openedCard.attribute}属性 /{" "}
                      {openedCard.species}
                    </span>

                    <div className={isNewCard ? "pack-stage-chip new" : "pack-stage-chip"}>
                      {isNewCard ? "新しいカード!" : `${openedCopies}枚目`}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="pack-gift">
                        <Image
                          src="/home-icons/pack.png"
                          alt=""
                          width={709}
                          height={1179}
                          className="pack-gift-image"
                          sizes="130px"
                          style={{ width: "100%", height: "100%", objectFit: "contain" }}
                          aria-hidden="true"
                        />
                    </div>
                    <p>{isOpening ? "パック開封" : "パック召喚"}</p>
                    <h2>{isOpening ? "開封中..." : `${packTickets}枚`}</h2>
                    <span>
                      {isOpening ? "カードを呼び出しています" : "open a monster card"}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

        </div>

      </section>

      {revealFlash && (
        <div
          key={revealFlash.key}
          className={`pack-full-flash flash-${revealFlash.rarity.toLowerCase()}`}
        />
      )}

      <style jsx>{`
        .pack-page {
          background:
            radial-gradient(circle at 20% 42%, rgba(168, 85, 247, 0.22), transparent 38%),
            radial-gradient(circle at 82% 58%, rgba(34, 211, 238, 0.18), transparent 36%),
            linear-gradient(180deg, rgba(2, 6, 23, 0.58), rgba(2, 6, 23, 0.78)),
            url("/ten-pack-result-bg.png") center / cover no-repeat fixed !important;
        }

        .pack-page-bg,
        .pack-page-bg-overlay {
          display: none;
        }

        .pack-page .eq-bg-orb {
          opacity: 0.16;
        }

        .pack-page .eq-shell {
          max-width: 1180px !important;
        }

        .pack-page .eq-hero {
          gap: 30px;
          padding: 38px;
          align-items: start;
          border-color: rgba(255, 255, 255, 0.1);
          background:
            radial-gradient(circle at 20% 22%, rgba(168, 85, 247, 0.12), transparent 34%),
            linear-gradient(180deg, rgba(15, 23, 42, 0.66), rgba(2, 6, 23, 0.78));
          box-shadow:
            0 32px 96px rgba(0, 0, 0, 0.48),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(8px);
        }

        .pack-lead {
          max-width: 620px;
          margin-top: 16px;
        }

        .pack-page .eq-panel {
          padding: 18px;
          border-radius: 20px;
          border-color: rgba(255, 255, 255, 0.1);
          background:
            radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.08), transparent 38%),
            linear-gradient(180deg, rgba(15, 23, 42, 0.7), rgba(2, 6, 23, 0.82));
          backdrop-filter: blur(8px);
        }

        .pack-page .eq-panel-head {
          margin-bottom: 14px;
        }

        .pack-page .eq-panel-title {
          font-size: 22px;
        }

        .pack-open-button {
          width: 100%;
        }

        /* ゴールド残高バー */
        .pack-gold-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border: 1px solid rgba(45, 212, 191, 0.3);
          border-radius: 14px;
          background: linear-gradient(90deg, rgba(45, 212, 191, 0.07), rgba(20, 184, 166, 0.03));
          padding: 12px 16px;
          margin-top: 18px;
          margin-bottom: 16px;
        }

        .pack-gold-label {
          color: #99f6e4;
          font-size: 14px;
          font-weight: 900;
          letter-spacing: 0.06em;
        }

        .pack-gold-amount {
          color: #f0fdfa;
          font-size: 17px;
          font-weight: 1000;
          text-shadow: 0 0 16px rgba(45, 212, 191, 0.35);
        }

        /* ショップエリア */
        .pack-shop {
          margin-bottom: 0;
          width: 100%;
        }

        .pack-shop-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .pack-page .eq-actions {
          max-width: 100%;
          width: 100%;
          margin-top: 20px;
        }

        .pack-page .eq-button.pack-open-button {
          font-size: 15px;
          min-height: 58px;
        }

        /* ---- 1枚買うボタン（ティール） ---- */
        .pack-shop-btn {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          border: 1.5px solid rgba(45, 212, 191, 0.42);
          border-radius: 14px;
          background: linear-gradient(160deg, rgba(45, 212, 191, 0.12) 0%, rgba(20, 184, 166, 0.06) 100%);
          color: white;
          padding: 16px 8px;
          font: inherit;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
          box-shadow: 0 4px 16px rgba(45, 212, 191, 0.08);
        }

        .pack-shop-btn:hover:not(.disabled) {
          transform: translateY(-3px);
          background: linear-gradient(160deg, rgba(45, 212, 191, 0.22) 0%, rgba(20, 184, 166, 0.14) 100%);
          box-shadow: 0 8px 28px rgba(45, 212, 191, 0.24);
          border-color: rgba(45, 212, 191, 0.72);
        }

        .pack-shop-btn.disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .pack-shop-btn span {
          font-size: 21px;
          filter: drop-shadow(0 2px 6px rgba(0,0,0,0.4));
        }

        .pack-shop-btn strong {
          font-size: 12px;
          font-weight: 900;
          color: #f0fdfa;
        }

        .pack-shop-btn small {
          color: #99f6e4;
          font-size: 11px;
          font-weight: 900;
        }

        /* ---- 10枚買うボタン（パープル） ---- */
        .pack-shop-btn-ten {
          border-color: rgba(168, 85, 247, 0.52);
          background: linear-gradient(160deg, rgba(168, 85, 247, 0.14) 0%, rgba(99, 102, 241, 0.08) 100%);
          box-shadow: 0 4px 20px rgba(168, 85, 247, 0.1);
        }

        .pack-shop-btn-ten strong {
          color: #e9d5ff;
        }

        .pack-shop-btn-ten small {
          color: #c4b5fd;
        }

        .pack-shop-btn-ten:hover:not(.disabled) {
          transform: translateY(-3px);
          background: linear-gradient(160deg, rgba(168, 85, 247, 0.28) 0%, rgba(99, 102, 241, 0.18) 100%);
          box-shadow: 0 8px 30px rgba(168, 85, 247, 0.32);
          border-color: rgba(168, 85, 247, 0.82);
        }

        /* 開封ボタン群 — 背景に馴染む半透明スタイル */
        .pack-page .eq-button-primary.pack-open-button {
          border-color: rgba(45, 212, 191, 0.45) !important;
          background: rgba(45, 212, 191, 0.1) !important;
          color: #99f6e4 !important;
          box-shadow: none !important;
        }

        .pack-page .eq-button-primary.pack-open-button:hover {
          background: rgba(45, 212, 191, 0.18) !important;
          box-shadow: 0 0 18px rgba(45, 212, 191, 0.15) !important;
        }

        .pack-page .eq-button-tenpack.pack-open-button {
          border-color: rgba(168, 85, 247, 0.45) !important;
          background: rgba(168, 85, 247, 0.1) !important;
          color: #d8b4fe !important;
          box-shadow: none !important;
          text-shadow: none !important;
          animation: none !important;
        }

        .pack-page .eq-button-tenpack.pack-open-button::after {
          display: none !important;
        }

        .pack-page .eq-button-tenpack.pack-open-button:hover {
          background: rgba(168, 85, 247, 0.18) !important;
          box-shadow: 0 0 18px rgba(168, 85, 247, 0.15) !important;
        }

        .pack-open-button.disabled {
          cursor: not-allowed;
          opacity: 0.55;
          transform: none;
        }

        .pack-open-button.disabled:hover {
          transform: none;
        }

        /* ================================
           GOD Pack Overlay
        ================================ */
        .god-pack-overlay {
          position: fixed;
          inset: 0;
          z-index: 9000;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          overflow: hidden;
        }

        .god-pack-bg {
          position: absolute;
          inset: 0;
        }

        .god-pack-phase-1 .god-pack-bg {
          animation: godPackDarken1 0.7s ease forwards;
        }

        .god-pack-phase-2 .god-pack-bg,
        .god-pack-phase-3 .god-pack-bg,
        .god-pack-phase-4 .god-pack-bg {
          background: rgba(0, 0, 0, 0.92);
        }

        @keyframes godPackDarken1 {
          0%   { background: rgba(0, 0, 0, 0); }
          100% { background: rgba(0, 0, 0, 0.78); }
        }

        /* Cracks */
        .god-pack-cracks {
          position: absolute;
          inset: 0;
          opacity: 0;
          pointer-events: none;
        }

        .god-pack-phase-2 .god-pack-cracks,
        .god-pack-phase-3 .god-pack-cracks,
        .god-pack-phase-4 .god-pack-cracks {
          opacity: 1;
        }

        .god-pack-cracks span {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 2px;
          height: 0;
          transform-origin: top center;
        }

        .god-pack-phase-2 .god-pack-cracks span,
        .god-pack-phase-3 .god-pack-cracks span,
        .god-pack-phase-4 .god-pack-cracks span {
          animation: godCrackGrow 0.6s ease-out forwards;
        }

        .god-pack-cracks span:nth-child(1) { background: linear-gradient(180deg, transparent, #fff, #facc15, transparent); transform: rotate(0deg);   animation-delay: 0s;    }
        .god-pack-cracks span:nth-child(2) { background: linear-gradient(180deg, transparent, #fff, #e879f9, transparent); transform: rotate(45deg);  animation-delay: 0.06s; }
        .god-pack-cracks span:nth-child(3) { background: linear-gradient(180deg, transparent, #fff, #22d3ee, transparent); transform: rotate(90deg);  animation-delay: 0.02s; }
        .god-pack-cracks span:nth-child(4) { background: linear-gradient(180deg, transparent, #fff, #818cf8, transparent); transform: rotate(135deg); animation-delay: 0.08s; }
        .god-pack-cracks span:nth-child(5) { background: linear-gradient(180deg, transparent, #fff, #facc15, transparent); transform: rotate(180deg); animation-delay: 0.04s; }
        .god-pack-cracks span:nth-child(6) { background: linear-gradient(180deg, transparent, #fff, #e879f9, transparent); transform: rotate(225deg); animation-delay: 0.07s; }
        .god-pack-cracks span:nth-child(7) { background: linear-gradient(180deg, transparent, #fff, #22d3ee, transparent); transform: rotate(270deg); animation-delay: 0.03s; }
        .god-pack-cracks span:nth-child(8) { background: linear-gradient(180deg, transparent, #fff, #818cf8, transparent); transform: rotate(315deg); animation-delay: 0.05s; }

        @keyframes godCrackGrow {
          0%   { height: 0; opacity: 0; }
          15%  { opacity: 1; }
          100% { height: min(55vw, 340px); opacity: 0.85; }
        }

        /* Summoning Circle */
        .god-pack-circle {
          position: absolute;
          width: min(480px, 88vw);
          height: min(480px, 88vw);
          border-radius: 50%;
          border: 2px solid rgba(250, 204, 21, 0.7);
          box-shadow:
            0 0 30px rgba(250, 204, 21, 0.4),
            0 0 60px rgba(168, 85, 247, 0.3),
            inset 0 0 30px rgba(250, 204, 21, 0.08);
          opacity: 0;
          pointer-events: none;
        }

        .god-pack-circle-inner {
          position: absolute;
          inset: 22px;
          border-radius: 50%;
          border: 1px solid rgba(168, 85, 247, 0.5);
          box-shadow: inset 0 0 20px rgba(168, 85, 247, 0.12);
        }

        .god-pack-phase-3 .god-pack-circle,
        .god-pack-phase-4 .god-pack-circle {
          animation: godCircleAppear 0.6s ease forwards, godCircleSpin 8s linear infinite;
        }

        @keyframes godCircleAppear {
          from { transform: scale(0.55); opacity: 0; }
          to   { transform: scale(1);    opacity: 0.8; }
        }

        @keyframes godCircleSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        /* Text Content */
        .god-pack-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          text-align: center;
          padding: 0 20px;
          opacity: 0;
          pointer-events: none;
        }

        .god-pack-phase-3 .god-pack-content,
        .god-pack-phase-4 .god-pack-content {
          opacity: 1;
        }

        .god-pack-kicker {
          opacity: 0;
          font-size: clamp(16px, 4vw, 22px);
          font-weight: 1000;
          letter-spacing: 0.4em;
          color: #fde68a;
          text-shadow: 0 0 24px rgba(250, 204, 21, 0.9);
        }

        .god-pack-phase-3 .god-pack-kicker,
        .god-pack-phase-4 .god-pack-kicker {
          animation: godTextSlam 0.55s cubic-bezier(0.2, 1.4, 0.34, 1) forwards;
        }

        .god-pack-name {
          opacity: 0;
          font-size: clamp(52px, 14vw, 88px);
          font-weight: 1000;
          letter-spacing: 0.04em;
          line-height: 1;
          background: linear-gradient(135deg, #fff7ad, #facc15, #fb923c, #e879f9, #818cf8, #22d3ee, #fff7ad);
          background-size: 300% 300%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .god-pack-phase-4 .god-pack-name {
          animation:
            godNameReveal 0.65s cubic-bezier(0.18, 1.35, 0.34, 1) forwards,
            godNameShimmer 3s linear 0.65s infinite;
        }

        @keyframes godNameReveal {
          0%   { opacity: 0; transform: scale(0.65); }
          65%  { opacity: 1; transform: scale(1.06); }
          100% { opacity: 1; transform: scale(1); }
        }

        @keyframes godNameShimmer {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .god-pack-guarantees {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
          opacity: 0;
        }

        .god-pack-phase-4 .god-pack-guarantees {
          animation: godRise 0.5s ease 0.3s forwards;
        }

        .god-pack-guarantees span {
          padding: 6px 14px;
          border-radius: 999px;
          font-size: clamp(11px, 2.5vw, 13px);
          font-weight: 1000;
          letter-spacing: 0.05em;
          background: rgba(250, 204, 21, 0.1);
          border: 1px solid rgba(250, 204, 21, 0.5);
          color: #fde68a;
        }

        .god-pack-flavor {
          opacity: 0;
          font-size: clamp(13px, 3vw, 16px);
          font-weight: 700;
          color: rgba(255, 255, 255, 0.55);
          letter-spacing: 0.12em;
        }

        .god-pack-phase-4 .god-pack-flavor {
          animation: godRise 0.5s ease 0.5s forwards;
        }

        @keyframes godTextSlam {
          from { opacity: 0; transform: translateY(-28px) scale(1.15); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }

        @keyframes godRise {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ================================
           GOD Pack Card Styling in Grid
        ================================ */
        .god-pack-grid .god-pack-card.rarity-sr {
          border-color: rgba(168, 85, 247, 0.9);
          box-shadow: 0 0 22px rgba(168, 85, 247, 0.7), 0 0 44px rgba(168, 85, 247, 0.28);
          animation: tenpackReveal 0.45s cubic-bezier(0.34, 1.3, 0.64, 1) both, godSRGlow 1.8s ease 0.5s infinite alternate;
        }

        .god-pack-grid .god-pack-card.rarity-ssr {
          border-color: rgba(250, 204, 21, 0.95);
          box-shadow: 0 0 30px rgba(250, 204, 21, 0.75), 0 0 60px rgba(250, 204, 21, 0.32);
          animation: tenpackRevealSSR 0.55s cubic-bezier(0.34, 1.3, 0.64, 1) both, godSSRPulse 1.5s ease 0.5s infinite alternate;
        }

        .god-pack-grid .god-pack-card.rarity-ur {
          animation: tenpackRevealSSR 0.55s cubic-bezier(0.34, 1.3, 0.64, 1) both, godURRainbow 2.4s linear 0.5s infinite;
        }

        @keyframes godSRGlow {
          from { box-shadow: 0 0 22px rgba(168, 85, 247, 0.7),  0 0 44px rgba(168, 85, 247, 0.28); }
          to   { box-shadow: 0 0 34px rgba(168, 85, 247, 0.95), 0 0 68px rgba(168, 85, 247, 0.45); }
        }

        @keyframes godSSRPulse {
          from { box-shadow: 0 0 30px rgba(250, 204, 21, 0.75), 0 0 60px rgba(250, 204, 21, 0.32); }
          to   { box-shadow: 0 0 48px rgba(250, 204, 21, 1.0),  0 0 96px rgba(250, 204, 21, 0.52); }
        }

        @keyframes godURRainbow {
          0%   { border-color: #facc15; box-shadow: 0 0 40px rgba(250, 204, 21, 0.9), 0 0 80px rgba(250, 204, 21, 0.42); }
          25%  { border-color: #e879f9; box-shadow: 0 0 40px rgba(232, 121, 249, 0.9), 0 0 80px rgba(232, 121, 249, 0.42); }
          50%  { border-color: #22d3ee; box-shadow: 0 0 40px rgba(34, 211, 238, 0.9),  0 0 80px rgba(34, 211, 238, 0.42); }
          75%  { border-color: #818cf8; box-shadow: 0 0 40px rgba(129, 140, 248, 0.9), 0 0 80px rgba(129, 140, 248, 0.42); }
          100% { border-color: #facc15; box-shadow: 0 0 40px rgba(250, 204, 21, 0.9), 0 0 80px rgba(250, 204, 21, 0.42); }
        }

        .tenpack-item-dupe {
          position: absolute;
          top: 8px;
          right: 8px;
          z-index: 3;
          border-radius: 999px;
          padding: 3px 7px;
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.35), rgba(34, 211, 238, 0.25));
          border: 1px solid rgba(168, 85, 247, 0.5);
          color: #d8b4fe;
          font-size: 9px;
          font-weight: 1000;
          letter-spacing: 0.04em;
          white-space: nowrap;
        }

        /* ================================
           GOD Pack Result Banners
        ================================ */
        .god-pack-stage-banner,
        .god-pack-panel-banner {
          text-align: center;
          padding: 14px 18px;
          border-radius: 18px;
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.12), rgba(250, 204, 21, 0.12));
          border: 1px solid rgba(250, 204, 21, 0.38);
          margin-bottom: 14px;
          animation: godBannerAppear 0.6s cubic-bezier(0.2, 1.3, 0.34, 1) both;
        }

        @keyframes godBannerAppear {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }

        .god-pack-result-title,
        .god-pack-stage-title {
          font-size: 18px;
          font-weight: 1000;
          letter-spacing: 0.18em;
          background: linear-gradient(135deg, #fff7ad, #facc15, #fb923c, #e879f9, #818cf8);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: godBannerShimmer 3s linear infinite;
        }

        @keyframes godBannerShimmer {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .god-pack-result-badges,
        .god-pack-stage-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          justify-content: center;
          margin-top: 8px;
        }

        .gpbadge {
          padding: 4px 12px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 1000;
          letter-spacing: 0.05em;
        }

        .gpbadge-ur  { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.7); color: #ffffff; }
        .gpbadge-ssr { background: rgba(250,204,21,0.1);  border: 1px solid rgba(250,204,21,0.65); color: #fde68a; }
        .gpbadge-sr  { background: rgba(168,85,247,0.1);  border: 1px solid rgba(168,85,247,0.65); color: #d8b4fe; }

        .god-pack-complete {
          border-color: rgba(250, 204, 21, 0.4);
          box-shadow: 0 0 60px rgba(250, 204, 21, 0.18), 0 0 120px rgba(168, 85, 247, 0.12);
        }

        /* ================================
           Existing tenpack button styles
        ================================ */
        .eq-button-tenpack {
          animation: tenpackBtnGradient 5s ease-in-out infinite;
        }

        .eq-button-tenpack::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            105deg,
            transparent 20%,
            rgba(255, 255, 255, 0.44) 50%,
            transparent 80%
          );
          transform: translateX(-120%);
          animation: tenpackBtnSweep 3.8s ease-in-out 1.2s infinite;
          pointer-events: none;
          border-radius: inherit;
        }

        @keyframes tenpackBtnGradient {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes tenpackBtnSweep {
          0%, 30%  { transform: translateX(-120%); opacity: 0; }
          38%      { opacity: 1; }
          62%      { opacity: 0; transform: translateX(120%); }
          100%     { transform: translateX(120%); opacity: 0; }
        }

        .pack-stage {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 390px;
        }

        .pack-hero--tenpack {
          grid-template-columns: 1fr !important;
        }

        .pack-stage.has-tenpack {
          width: 100%;
          min-height: auto;
        }

        .pack-display {
          position: relative;
          width: 252px;
          min-height: 352px;
          overflow: hidden;
          border-radius: 32px;
          padding: 4px 4px 20px;
          background: linear-gradient(135deg, #facc15, #a855f7, #22d3ee);
          box-shadow: 0 0 70px rgba(168, 85, 247, 0.28);
        }

        .pack-page .pack-display {
          box-shadow:
            0 0 70px rgba(168, 85, 247, 0.32),
            0 28px 80px rgba(0, 0, 0, 0.45);
        }

        .pack-display::before {
          content: "";
          position: absolute;
          inset: 4px;
          border-radius: 28px;
          background:
            radial-gradient(circle at 50% 16%, rgba(255, 255, 255, 0.18), transparent 40%),
            #050816;
          z-index: 0;
        }

        .pack-display.opening {
          animation: packPulse 0.72s ease-in-out infinite alternate;
        }

        .pack-display.opened {
          animation: singleCardReveal 0.68s cubic-bezier(0.2, 1.2, 0.34, 1) both;
        }

        .pack-display.opened.rarity-n {
          background: linear-gradient(135deg, #475569, #64748b, #334155);
          box-shadow: 0 0 28px rgba(100, 116, 139, 0.22);
        }

        .pack-display.opened.rarity-r {
          background: linear-gradient(135deg, #22d3ee, #0891b2, #0ea5e9);
          box-shadow: 0 0 64px rgba(34, 211, 238, 0.5);
        }

        .pack-display.opened.rarity-sr {
          background: linear-gradient(135deg, #a855f7, #7c3aed, #4f46e5, #22d3ee);
          box-shadow: 0 0 96px rgba(168, 85, 247, 0.55);
        }

        .pack-display.opened.rarity-ssr {
          background: linear-gradient(135deg, #facc15, #f59e0b, #ea580c, #db2777);
          box-shadow:
            0 0 80px rgba(250, 204, 21, 0.68),
            0 0 130px rgba(234, 88, 12, 0.38);
        }

        .pack-display.opened.rarity-ur {
          background: conic-gradient(from 0deg, #fff, #fde047, #fb7185, #a855f7, #22d3ee, #86efac, #fff);
          box-shadow:
            0 0 80px rgba(255, 255, 255, 0.85),
            0 0 160px rgba(34, 211, 238, 0.55);
        }

        .pack-display.prize-reveal {
          isolation: isolate;
          animation:
            singleCardReveal 0.68s cubic-bezier(0.2, 1.2, 0.34, 1) both,
            prizeStageBurst 1.4s ease both;
        }

        .pack-display.prize-sr {
          background: linear-gradient(135deg, #a855f7, #7c3aed, #22d3ee, #a855f7);
          box-shadow:
            0 0 48px rgba(168, 85, 247, 0.65),
            0 0 108px rgba(168, 85, 247, 0.32);
        }

        .pack-display.prize-ssr {
          background:
            conic-gradient(from 30deg, #fde047, #fb7185, #a855f7, #22d3ee, #fde047);
          box-shadow:
            0 0 44px rgba(250, 204, 21, 0.66),
            0 0 120px rgba(251, 113, 133, 0.42),
            0 0 170px rgba(34, 211, 238, 0.28);
        }

        .pack-display.prize-ur {
          background:
            conic-gradient(from 0deg, #fff, #fde047, #fb7185, #a855f7, #22d3ee, #86efac, #fde047, #fff);
          box-shadow:
            0 0 60px rgba(255, 255, 255, 0.72),
            0 0 130px rgba(251, 113, 133, 0.55),
            0 0 200px rgba(34, 211, 238, 0.38);
          animation: prizeShimmer 0.9s ease both, urPulse 1.8s 0.9s ease-in-out infinite alternate;
        }

        .pack-display.tenpack-revealed {
          transform-style: preserve-3d;
          animation: cardStageFlip 0.72s cubic-bezier(0.18, 1.2, 0.34, 1) both;
        }

        .pack-display.tenpack-revealed.prize-reveal {
          animation:
            cardStageFlip 0.72s cubic-bezier(0.18, 1.2, 0.34, 1) both,
            prizeStageBurst 1.4s ease both;
        }

        @keyframes urPulse {
          from { filter: brightness(1) hue-rotate(0deg); }
          to   { filter: brightness(1.32) saturate(1.4) hue-rotate(40deg); }
        }

        @keyframes prizeShimmer {
          0%   { filter: brightness(1) saturate(1); }
          28%  { filter: brightness(1.72) saturate(1.6); }
          100% { filter: brightness(1.04) saturate(1.08); }
        }

        /* ── フルスクリーン フラッシュ ── */
        .pack-full-flash {
          position: fixed;
          inset: 0;
          z-index: 9998;
          pointer-events: none;
        }

        .pack-full-flash.flash-sr {
          background:
            radial-gradient(ellipse at 50% 38%, rgba(168, 85, 247, 0.65), rgba(34, 211, 238, 0.28) 44%, transparent 70%);
          animation: fullFlashSR 1.3s ease-out forwards;
        }

        .pack-full-flash.flash-ssr {
          background:
            radial-gradient(ellipse at 50% 38%, rgba(255, 220, 0, 0.78), rgba(251, 113, 133, 0.38) 44%, transparent 70%);
          animation: fullFlashSSR 1.8s ease-out forwards;
        }

        .pack-full-flash.flash-ur {
          background:
            conic-gradient(from 0deg,
              rgba(255, 255, 255, 0.88),
              rgba(34, 211, 238, 0.72),
              rgba(168, 85, 247, 0.72),
              rgba(251, 191, 36, 0.84),
              rgba(251, 113, 133, 0.72),
              rgba(134, 239, 172, 0.62),
              rgba(255, 255, 255, 0.88));
          animation: fullFlashUR 2.6s ease-out forwards;
        }

        @keyframes fullFlashSR {
          0%   { opacity: 0; }
          7%   { opacity: 0.75; }
          100% { opacity: 0; }
        }

        @keyframes fullFlashSSR {
          0%   { opacity: 0; }
          10%  { opacity: 0.88; }
          100% { opacity: 0; }
        }

        @keyframes fullFlashUR {
          0%   { opacity: 0; transform: scale(0.8); }
          7%   { opacity: 1; transform: scale(1); }
          32%  { opacity: 0.58; }
          100% { opacity: 0; transform: scale(1.14); }
        }

        .pack-display.prize-reveal::after {
          content: "";
          position: absolute;
          inset: -34%;
          z-index: 1;
          pointer-events: none;
          background:
            linear-gradient(90deg, transparent 38%, rgba(255, 255, 255, 0.8), transparent 62%),
            radial-gradient(circle, rgba(255, 255, 255, 0.34) 0 2px, transparent 3px);
          background-size: 100% 100%, 46px 46px;
          mix-blend-mode: screen;
          animation: prizeSweep 1.15s ease both;
        }

        .pack-prize-effects {
          position: absolute;
          inset: 0;
          z-index: 2;
          pointer-events: none;
        }

        .pack-prize-effects span {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 9px;
          height: 72px;
          border-radius: 999px;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0), #fde68a, rgba(255, 255, 255, 0));
          transform-origin: 50% 0;
          opacity: 0;
          animation: prizeRay 0.95s ease both;
        }

        .pack-prize-effects span:nth-child(1) { transform: rotate(0deg)   translateY(-18px); }
        .pack-prize-effects span:nth-child(2) { transform: rotate(60deg)  translateY(-18px); }
        .pack-prize-effects span:nth-child(3) { transform: rotate(120deg) translateY(-18px); }
        .pack-prize-effects span:nth-child(4) { transform: rotate(180deg) translateY(-18px); }
        .pack-prize-effects span:nth-child(5) { transform: rotate(240deg) translateY(-18px); }
        .pack-prize-effects span:nth-child(6) { transform: rotate(300deg) translateY(-18px); }

        /* SSR 追加レイ (7-8) */
        .pack-prize-effects span:nth-child(7) { transform: rotate(30deg)  translateY(-18px); }
        .pack-prize-effects span:nth-child(8) { transform: rotate(210deg) translateY(-18px); }

        /* UR 追加レイ (9-12) */
        .pack-prize-effects span:nth-child(9)  { transform: rotate(90deg)  translateY(-18px); }
        .pack-prize-effects span:nth-child(10) { transform: rotate(150deg) translateY(-18px); }
        .pack-prize-effects span:nth-child(11) { transform: rotate(270deg) translateY(-18px); }
        .pack-prize-effects span:nth-child(12) { transform: rotate(330deg) translateY(-18px); }

        /* UR のレイは太く長く */
        .pack-prize-effects.rays-ur span {
          width: 13px;
          height: 100px;
          background: linear-gradient(180deg, rgba(255,255,255,0), rgba(255,255,255,0.9), rgba(255,255,255,0));
          animation-duration: 1.15s;
        }

        /* SSR のレイはゴールド */
        .pack-prize-effects.rays-ssr span {
          width: 11px;
          height: 88px;
          background: linear-gradient(180deg, rgba(255,255,255,0), #fde68a, rgba(255,255,255,0));
          animation-duration: 1.05s;
        }

        .card-reveal-effects {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          overflow: hidden;
        }

        .card-reveal-effects span {
          --spark-x: 0px;
          --spark-y: -120px;
          --spark-size: 8px;
          position: absolute;
          left: 50%;
          top: 48%;
          width: var(--spark-size);
          height: var(--spark-size);
          border-radius: 999px;
          background: #e2e8f0;
          box-shadow: 0 0 16px currentColor;
          color: #e2e8f0;
          opacity: 0;
          animation: cardSpark 0.9s ease-out both;
        }

        .card-reveal-effects.rarity-n span {
          color: #a5f3fc;
          background: #a5f3fc;
          animation-duration: 0.72s;
        }

        .card-reveal-effects.rarity-r span {
          color: #22d3ee;
          background: #67e8f9;
          animation-duration: 0.84s;
        }

        .card-reveal-effects.rarity-sr span {
          color: #fde047;
          background: linear-gradient(135deg, #fde047, #a855f7);
          animation-duration: 1.04s;
        }

        .card-reveal-effects.rarity-ssr span,
        .card-reveal-effects.rarity-ur span {
          color: #fde68a;
          background: linear-gradient(135deg, #fff, #fde047, #fb7185, #22d3ee);
          animation-duration: 1.24s;
        }

        .card-reveal-effects.rarity-ur span {
          --spark-size: 10px;
          box-shadow: 0 0 22px #fff, 0 0 36px #22d3ee;
        }

        .card-reveal-effects span:nth-child(1) { --spark-x: -104px; --spark-y: -150px; animation-delay: 0.02s; }
        .card-reveal-effects span:nth-child(2) { --spark-x: -56px; --spark-y: -178px; animation-delay: 0.09s; }
        .card-reveal-effects span:nth-child(3) { --spark-x: 12px; --spark-y: -170px; animation-delay: 0.04s; }
        .card-reveal-effects span:nth-child(4) { --spark-x: 86px; --spark-y: -140px; animation-delay: 0.12s; }
        .card-reveal-effects span:nth-child(5) { --spark-x: 112px; --spark-y: -34px; animation-delay: 0.03s; }
        .card-reveal-effects span:nth-child(6) { --spark-x: 72px; --spark-y: 94px; animation-delay: 0.1s; }
        .card-reveal-effects span:nth-child(7) { --spark-x: -16px; --spark-y: 122px; animation-delay: 0.06s; }
        .card-reveal-effects span:nth-child(8) { --spark-x: -96px; --spark-y: 72px; animation-delay: 0.14s; }
        .card-reveal-effects span:nth-child(9) { --spark-x: -124px; --spark-y: -42px; animation-delay: 0.07s; }
        .card-reveal-effects span:nth-child(10) { --spark-x: 126px; --spark-y: 48px; animation-delay: 0.16s; }

        /* SSR 追加スパーク (11-14) */
        .card-reveal-effects span:nth-child(11) { --spark-x: 48px;  --spark-y: -166px; animation-delay: 0.05s; }
        .card-reveal-effects span:nth-child(12) { --spark-x: -78px; --spark-y: 118px;  animation-delay: 0.11s; }
        .card-reveal-effects span:nth-child(13) { --spark-x: 140px; --spark-y: -88px;  animation-delay: 0.08s; }
        .card-reveal-effects span:nth-child(14) { --spark-x: -144px;--spark-y: 26px;   animation-delay: 0.13s; }

        /* UR 追加スパーク (15-20) */
        .card-reveal-effects span:nth-child(15) { --spark-x: 80px;  --spark-y: 140px;  animation-delay: 0.04s; }
        .card-reveal-effects span:nth-child(16) { --spark-x: -34px; --spark-y: -192px; animation-delay: 0.15s; }
        .card-reveal-effects span:nth-child(17) { --spark-x: 158px; --spark-y: 60px;   animation-delay: 0.06s; }
        .card-reveal-effects span:nth-child(18) { --spark-x: -158px;--spark-y: -58px;  animation-delay: 0.18s; }
        .card-reveal-effects span:nth-child(19) { --spark-x: -90px; --spark-y: 162px;  animation-delay: 0.03s; }
        .card-reveal-effects span:nth-child(20) { --spark-x: 104px; --spark-y: -132px; animation-delay: 0.20s; }

        .pack-rarity-callout {
          position: relative;
          z-index: 4;
          width: fit-content;
          margin: 10px auto -4px;
          border-radius: 999px;
          padding: 7px 13px;
          background: linear-gradient(90deg, #fde047, #a855f7, #22d3ee);
          color: #050816;
          font-size: 11px;
          font-weight: 1000;
          letter-spacing: 0.14em;
          box-shadow: 0 0 26px rgba(168, 85, 247, 0.45);
          animation: prizeCallout 0.72s cubic-bezier(0.2, 1.3, 0.34, 1) both;
        }

        .pack-rarity-callout.callout-sr {
          background: linear-gradient(90deg, #a855f7, #7c3aed, #22d3ee, #a855f7);
          color: #ffffff;
          box-shadow:
            0 0 24px rgba(168, 85, 247, 0.75),
            0 0 50px rgba(34, 211, 238, 0.38);
          animation:
            prizeCallout 0.72s cubic-bezier(0.2, 1.3, 0.34, 1) both,
            calloutSRPulse 1.6s ease-in-out 0.72s infinite alternate;
        }

        @keyframes calloutSRPulse {
          from { box-shadow: 0 0 24px rgba(168, 85, 247, 0.75), 0 0 50px rgba(34, 211, 238, 0.38); }
          to   { box-shadow: 0 0 38px rgba(168, 85, 247, 1.0), 0 0 80px rgba(34, 211, 238, 0.6); transform: scale(1.03); }
        }

        .pack-rarity-callout.callout-ssr {
          background: linear-gradient(90deg, #fde047, #fb923c, #fb7185, #fde047);
          box-shadow:
            0 0 28px rgba(250, 204, 21, 0.8),
            0 0 56px rgba(251, 113, 133, 0.45);
          font-size: 12px;
          padding: 8px 16px;
          animation:
            prizeCallout 0.72s cubic-bezier(0.2, 1.3, 0.34, 1) both,
            calloutSSRPulse 1.4s ease-in-out 0.72s infinite alternate;
        }

        .pack-rarity-callout.callout-ur {
          background: conic-gradient(from 0deg, #fff, #fde047, #fb7185, #a855f7, #22d3ee, #86efac, #fff);
          box-shadow:
            0 0 36px rgba(255, 255, 255, 0.9),
            0 0 70px rgba(34, 211, 238, 0.55),
            0 0 110px rgba(168, 85, 247, 0.4);
          font-size: 13px;
          font-weight: 1000;
          padding: 9px 18px;
          letter-spacing: 0.18em;
          animation:
            prizeCallout 0.72s cubic-bezier(0.2, 1.3, 0.34, 1) both,
            calloutURPulse 1.1s ease-in-out 0.72s infinite alternate;
        }

        @keyframes calloutSSRPulse {
          from { box-shadow: 0 0 28px rgba(250,204,21,0.8), 0 0 56px rgba(251,113,133,0.45); }
          to   { box-shadow: 0 0 44px rgba(250,204,21,1),   0 0 88px rgba(251,113,133,0.7); transform: scale(1.04); }
        }

        @keyframes calloutURPulse {
          from { box-shadow: 0 0 36px rgba(255,255,255,0.9), 0 0 70px rgba(34,211,238,0.55); transform: scale(1); }
          to   { box-shadow: 0 0 54px rgba(255,255,255,1),   0 0 110px rgba(34,211,238,0.85); transform: scale(1.08); }
        }

        .pack-gift,
        .pack-result-emoji,
        .pack-display p,
        .pack-display h2,
        .pack-display span,
        .pack-card-rarity,
        .pack-stage-chip {
          position: relative;
          z-index: 2;
          text-align: center;
        }

        .pack-gift {
          width: 142px;
          height: 168px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 32px auto 0;
          filter: drop-shadow(0 20px 28px rgba(0, 0, 0, 0.42));
        }

        .pack-gift-image {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .pack-display.tenpack-suspense .pack-gift {
          animation: cardBackFloat 0.95s ease-in-out infinite alternate;
        }

        .pack-result-emoji {
          margin-top: 20px;
          font-size: 78px;
          filter: drop-shadow(0 16px 22px rgba(0, 0, 0, 0.42));
        }

        .pack-display.opened .pack-result-emoji {
          animation:
            cardEmojiPop 0.78s cubic-bezier(0.18, 1.25, 0.34, 1) both,
            cardEmojiFloat 2.8s ease-in-out 0.78s infinite;
        }

        .pack-display.opened.rarity-ssr .pack-result-emoji {
          animation:
            cardEmojiPop 0.86s cubic-bezier(0.18, 1.35, 0.34, 1) both,
            cardEmojiFloat 2.4s ease-in-out 0.86s infinite;
        }

        .pack-display.opened.rarity-ur .pack-result-emoji {
          animation:
            cardEmojiPop 0.92s cubic-bezier(0.18, 1.35, 0.34, 1) both,
            cardEmojiFloat 2.2s ease-in-out 0.92s infinite,
            urEmojiHue 3s linear 0.92s infinite;
          filter: drop-shadow(0 0 18px rgba(255, 80, 200, 0.8)) drop-shadow(0 0 36px rgba(100, 200, 255, 0.5));
        }

        @keyframes urEmojiHue {
          from { filter: drop-shadow(0 0 18px rgba(255, 80, 200, 0.8)) drop-shadow(0 0 36px rgba(100, 200, 255, 0.5)) hue-rotate(0deg) brightness(1.15); }
          to   { filter: drop-shadow(0 0 18px rgba(255, 80, 200, 0.8)) drop-shadow(0 0 36px rgba(100, 200, 255, 0.5)) hue-rotate(360deg) brightness(1.15); }
        }

        .pack-card-rarity {
          width: fit-content;
          margin: 14px auto 0;
          border-radius: 999px;
          padding: 7px 12px;
          background: rgba(251, 191, 36, 0.13);
          border: 1px solid rgba(251, 191, 36, 0.32);
          color: #fde68a;
          font-size: 11px;
          font-weight: 1000;
          letter-spacing: 0.12em;
        }

        .pack-display.opened.rarity-n .pack-card-rarity {
          background: rgba(148, 163, 184, 0.12);
          border-color: rgba(148, 163, 184, 0.32);
          color: #cbd5e1;
        }

        .pack-display.opened.rarity-r .pack-card-rarity {
          background: rgba(34, 211, 238, 0.12);
          border-color: rgba(34, 211, 238, 0.48);
          color: #a5f3fc;
        }

        .pack-display.opened.rarity-sr .pack-card-rarity {
          background: rgba(168, 85, 247, 0.16);
          border-color: rgba(168, 85, 247, 0.58);
          color: #d8b4fe;
          font-size: 12px;
          padding: 7px 14px;
        }

        .pack-display.opened.rarity-ssr .pack-card-rarity {
          background: linear-gradient(90deg, rgba(250, 204, 21, 0.18), rgba(251, 146, 60, 0.14));
          border-color: rgba(250, 204, 21, 0.62);
          color: #fde047;
          font-size: 12px;
          padding: 8px 15px;
          box-shadow: 0 0 18px rgba(250, 204, 21, 0.3);
        }

        .pack-display.opened.rarity-ur .pack-card-rarity {
          background: linear-gradient(#0a0e1f, #0a0e1f) padding-box,
            conic-gradient(from 0deg, #ff50c8, #64c8ff, #facc15, #ff50c8) border-box;
          border: 2px solid transparent;
          color: white;
          font-size: 13px;
          padding: 8px 16px;
          box-shadow: 0 0 22px rgba(255, 80, 200, 0.4), 0 0 38px rgba(100, 200, 255, 0.28);
        }

        .pack-display p {
          margin: 12px 0 0;
          color: #fde68a;
          font-size: 11px;
          font-weight: 1000;
          letter-spacing: 0.18em;
        }

        .pack-display h2 {
          margin: 8px 18px 0;
          font-size: 26px;
          line-height: 1.15;
          font-weight: 1000;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .pack-display span {
          display: block;
          margin: 6px auto 0;
          max-width: 220px;
          color: #cbd5e1;
          font-size: 13px;
          line-height: 1.3;
          font-weight: 900;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .pack-display.opened .pack-card-rarity,
        .pack-display.opened p,
        .pack-display.opened h2,
        .pack-display.opened span,
        .pack-display.opened .pack-stage-chip {
          animation: cardCopyRise 0.58s ease both;
        }

        .pack-display.opened h2 {
          animation-delay: 0.08s;
        }

        .pack-display.opened span,
        .pack-display.opened .pack-stage-chip {
          animation-delay: 0.15s;
        }

        .pack-display.opened .card-reveal-effects span {
          animation-name: cardSpark;
          animation-duration: 0.9s;
          animation-timing-function: ease-out;
          animation-fill-mode: both;
        }

        .pack-display.opened .card-reveal-effects.rarity-n span {
          animation-duration: 0.72s;
        }

        .pack-display.opened .card-reveal-effects.rarity-r span {
          animation-duration: 0.84s;
        }

        .pack-display.opened .card-reveal-effects.rarity-sr span {
          animation-duration: 1.04s;
        }

        .pack-display.opened .card-reveal-effects.rarity-ssr span,
        .pack-display.opened .card-reveal-effects.rarity-ur span {
          animation-duration: 1.24s;
        }

        .pack-display.opened .pack-prize-effects span {
          animation-name: prizeRay;
          animation-duration: 0.95s;
          animation-timing-function: ease;
          animation-fill-mode: both;
        }

        .pack-display .card-reveal-effects span {
          position: absolute;
          display: block;
          margin: 0;
          max-width: none;
        }

        .pack-display .pack-prize-effects span {
          position: absolute;
          display: block;
          margin: 0;
          max-width: none;
        }

        .pack-stage-chip {
          width: fit-content;
          margin: 12px auto 0;
          border-radius: 999px;
          padding: 7px 12px;
          border: 1px solid rgba(34, 211, 238, 0.32);
          background: rgba(34, 211, 238, 0.13);
          color: #a5f3fc;
          font-size: 12px;
          font-weight: 1000;
        }

        .pack-stage-chip.new {
          border-color: rgba(251, 191, 36, 0.42);
          background: rgba(251, 191, 36, 0.16);
          color: #fde68a;
        }

        .pack-dashboard {
          display: grid;
          grid-template-columns: minmax(0, 1.8fr) minmax(260px, 1fr);
          gap: 16px;
          margin-top: 18px;
          align-items: start;
        }

        .pack-dashboard.is-tenpack-revealing {
          display: none;
        }

        .pack-dashboard--rarity-only {
          grid-template-columns: 1fr;
        }

        .pack-dashboard--rarity-only > .eq-panel {
          max-width: 680px;
        }

        .pack-dashboard > .eq-panel {
          min-width: 0;
        }

        .pack-result-card {
          display: grid;
          grid-template-columns: 170px 1fr;
          gap: 18px;
          align-items: center;
        }

        .pack-result-frame {
          position: relative;
          height: 170px;
          display: grid;
          place-items: center;
          overflow: hidden;
          border-radius: 28px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background:
            radial-gradient(circle at 50% 18%, rgba(255, 255, 255, 0.28), transparent 45%),
            linear-gradient(135deg, rgba(34, 211, 238, 0.28), rgba(168, 85, 247, 0.25));
        }

        .pack-result-glow {
          position: absolute;
          width: 130px;
          height: 130px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.1);
          filter: blur(22px);
        }

        .pack-result-main {
          position: relative;
          z-index: 1;
          font-size: 84px;
          filter: drop-shadow(0 14px 22px rgba(0, 0, 0, 0.4));
        }

        .pack-result-rarity {
          display: inline-flex;
          border-radius: 999px;
          padding: 7px 10px;
          background: rgba(251, 191, 36, 0.13);
          border: 1px solid rgba(251, 191, 36, 0.28);
          color: #fde68a;
          font-size: 11px;
          font-weight: 1000;
          letter-spacing: 0.12em;
        }

        .pack-result-info h3 {
          margin: 12px 0 0;
          color: white;
          font-size: 30px;
          line-height: 1.2;
          font-weight: 1000;
        }

        .pack-result-info p {
          margin: 8px 0 0;
          color: #cbd5e1;
          font-size: 15px;
          font-weight: 800;
        }

        .result-chip {
          width: fit-content;
          margin-top: 14px;
          border-radius: 999px;
          padding: 9px 13px;
          background: rgba(34, 211, 238, 0.12);
          border: 1px solid rgba(34, 211, 238, 0.28);
          color: #a5f3fc;
          font-size: 13px;
          font-weight: 1000;
        }

        .result-chip.new {
          background: rgba(251, 191, 36, 0.13);
          border-color: rgba(251, 191, 36, 0.34);
          color: #fde68a;
        }

        .pack-empty-result {
          min-height: 240px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          text-align: center;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 26px;
          background: rgba(255, 255, 255, 0.055);
          padding: 24px;
        }

        .pack-empty-icon {
          width: 52px;
          height: 78px;
          display: flex;
          align-items: center;
          justify-content: center;
          filter:
            drop-shadow(0 18px 24px rgba(0, 0, 0, 0.42))
            drop-shadow(0 0 18px rgba(168, 85, 247, 0.2));
        }

        .pack-empty-image {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .pack-empty-result h3 {
          margin: 12px 0 0;
          font-size: 24px;
          font-weight: 1000;
        }

        .pack-empty-result p {
          margin: 8px 0 0;
          color: #cbd5e1;
          font-size: 14px;
          line-height: 1.7;
          font-weight: 800;
        }

        .rarity-rate-list span {
          display: block;
          color: #94a3b8;
          font-size: 11px;
          font-weight: 800;
        }

        .rarity-rate-list strong {
          display: block;
          margin-top: 4px;
          color: #fde68a;
          font-size: 16px;
          line-height: 1;
          font-weight: 1000;
        }

        .pack-progress-block {
          margin-top: 12px;
        }

        .pack-progress-label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 10px;
          color: #cbd5e1;
          font-size: 13px;
          font-weight: 900;
        }

        .pack-progress-label strong {
          color: #fde68a;
        }

        .ticket-bar {
          background: linear-gradient(90deg, #a855f7, #22d3ee, #fde047);
        }

        .rarity-rate-list {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
        }

        .rarity-rate-list div {
          min-width: 0;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.055);
          padding: 8px 10px;
        }

        .rarity-guaranteed-note {
          margin-top: 10px;
          border: 1px solid rgba(168, 85, 247, 0.35);
          background: rgba(168, 85, 247, 0.1);
          border-radius: 12px;
          padding: 8px 12px;
        }

        .rarity-guaranteed-note p {
          margin: 0;
          color: #e9d5ff;
          font-size: 11px;
          font-weight: 900;
        }

        @keyframes cardFlipIn {
          0%   { transform: rotateY(-90deg) scale(0.8); opacity: 0; }
          100% { transform: rotateY(0deg)   scale(1);   opacity: 1; }
        }

        @keyframes singleCardReveal {
          0% {
            transform: translateY(14px) rotateY(-18deg) scale(0.9);
            opacity: 0;
          }

          60% {
            transform: translateY(-4px) rotateY(4deg) scale(1.035);
            opacity: 1;
          }

          100% {
            transform: translateY(0) rotateY(0deg) scale(1);
            opacity: 1;
          }
        }

        @keyframes cardStageFlip {
          0% {
            transform: translateY(18px) rotateY(-82deg) scale(0.86);
            opacity: 0;
          }
          48% {
            transform: translateY(-5px) rotateY(8deg) scale(1.045);
            opacity: 1;
          }
          100% {
            transform: translateY(0) rotateY(0deg) scale(1);
            opacity: 1;
          }
        }

        @keyframes cardEmojiPop {
          0% {
            transform: translateY(18px) scale(0.48) rotate(-8deg);
            opacity: 0;
          }
          58% {
            transform: translateY(-7px) scale(1.18) rotate(4deg);
            opacity: 1;
          }
          100% {
            transform: translateY(0) scale(1) rotate(0deg);
            opacity: 1;
          }
        }

        @keyframes cardEmojiFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-7px); }
        }

        @keyframes cardCopyRise {
          0% {
            transform: translateY(10px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes cardSpark {
          0% {
            transform: translate(-50%, -50%) scale(0.35);
            opacity: 0;
          }
          22% {
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) translate(var(--spark-x), var(--spark-y)) scale(0.08);
            opacity: 0;
          }
        }

        @keyframes cardBackFloat {
          from {
            transform: translateY(0) rotate(-2deg);
            filter: drop-shadow(0 20px 28px rgba(0, 0, 0, 0.42));
          }
          to {
            transform: translateY(-9px) rotate(2deg);
            filter: drop-shadow(0 24px 34px rgba(34, 211, 238, 0.28));
          }
        }

        @keyframes tenpackAutoNotePulse {
          from { border-color: rgba(34, 211, 238, 0.22); }
          to {
            border-color: rgba(250, 204, 21, 0.38);
            background: rgba(250, 204, 21, 0.12);
            color: #fde68a;
          }
        }

        @keyframes prizeStageBurst {
          0% { filter: saturate(1) brightness(1); }
          22% { filter: saturate(1.45) brightness(1.32); }
          100% { filter: saturate(1.08) brightness(1.05); }
        }

        @keyframes prizeSweep {
          0% {
            opacity: 0;
            transform: translateX(-46%) rotate(18deg) scale(0.92);
          }
          32% {
            opacity: 0.95;
          }
          100% {
            opacity: 0;
            transform: translateX(46%) rotate(18deg) scale(1.06);
          }
        }

        @keyframes prizeRay {
          0% {
            opacity: 0;
            height: 14px;
          }
          28% {
            opacity: 0.9;
            height: 92px;
          }
          100% {
            opacity: 0;
            height: 120px;
          }
        }

        @keyframes prizeCallout {
          0% {
            opacity: 0;
            transform: translateY(10px) scale(0.74);
          }
          62% {
            opacity: 1;
            transform: translateY(-2px) scale(1.08);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes rarityGlow {
          0%   { box-shadow: 0 0 0 rgba(168, 85, 247, 0); }
          50%  { box-shadow: 0 0 40px rgba(168, 85, 247, 0.6), 0 0 70px rgba(251, 191, 36, 0.3); }
          100% { box-shadow: 0 0 18px rgba(168, 85, 247, 0.25); }
        }

        @keyframes rarityGlowGold {
          0%   { box-shadow: 0 0 0 rgba(251, 191, 36, 0); }
          50%  { box-shadow: 0 0 50px rgba(251, 191, 36, 0.7), 0 0 90px rgba(248, 113, 113, 0.3); }
          100% { box-shadow: 0 0 22px rgba(251, 191, 36, 0.3); }
        }

        @keyframes bestCardHalo {
          to { transform: rotate(360deg); }
        }

        @keyframes tenpackCharge {
          0% { box-shadow: 0 0 60px rgba(34, 211, 238, 0.22); }
          100% { box-shadow: 0 0 96px rgba(250, 204, 21, 0.34); }
        }

        @keyframes tenpackSweep {
          0% {
            opacity: 0;
            transform: translateX(-90%) rotate(18deg);
          }

          35% {
            opacity: 0.75;
          }

          100% {
            opacity: 0;
            transform: translateX(90%) rotate(18deg);
          }
        }

        .animate-flip {
          animation: cardFlipIn 0.55s cubic-bezier(0.34, 1.4, 0.64, 1) both;
        }

        .tenpack-stage-display {
          position: relative;
          width: 100%;
          max-width: 100%;
          overflow: visible;
          border-radius: 34px;
          padding: 18px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background:
            linear-gradient(135deg, rgba(34, 211, 238, 0.18), rgba(168, 85, 247, 0.2)),
            rgba(5, 8, 22, 0.94);
          box-shadow: 0 0 84px rgba(34, 211, 238, 0.24);
        }

        .tenpack-stage-display.revealing {
          animation: tenpackCharge 0.9s ease-in-out infinite alternate;
        }

        .tenpack-stage-display.complete {
          box-shadow: 0 0 90px rgba(250, 204, 21, 0.28);
        }

        .tenpack-stage-display::before {
          content: "";
          position: absolute;
          inset: 1px;
          border-radius: 32px;
          pointer-events: none;
          background:
            radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.2), transparent 34%),
            linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent);
          opacity: 0.72;
        }

        .tenpack-stage-head,
        .tenpack-stage-meter,
        .tenpack-grid {
          position: relative;
          z-index: 1;
        }

        .tenpack-stage-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 12px;
        }

        .tenpack-stage-head p {
          margin: 0;
          color: #fde68a;
          font-size: 11px;
          font-weight: 1000;
          letter-spacing: 0.16em;
        }

        .tenpack-stage-head h2 {
          margin: 4px 0 0;
          color: white;
          font-size: 26px;
          line-height: 1.12;
          font-weight: 1000;
        }

        .tenpack-stage-head strong {
          flex: 0 0 auto;
          border-radius: 999px;
          padding: 8px 11px;
          background: rgba(250, 204, 21, 0.14);
          border: 1px solid rgba(250, 204, 21, 0.32);
          color: #fde68a;
          font-size: 13px;
          font-weight: 1000;
        }

        .tenpack-stage-meter {
          height: 8px;
          overflow: hidden;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.1);
          margin-bottom: 14px;
        }

        .tenpack-stage-meter div {
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #22d3ee, #a855f7, #fde047);
          transition: width 0.3s ease;
        }


        .tenpack-panel-result {
          display: grid;
          gap: 14px;
        }

        .tenpack-panel-summary {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          border-radius: 20px;
          padding: 12px 14px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.055);
        }

        .tenpack-panel-summary span {
          color: #94a3b8;
          font-size: 12px;
          font-weight: 1000;
          letter-spacing: 0.12em;
        }

        .tenpack-panel-summary strong {
          color: #fde68a;
          font-size: 15px;
          font-weight: 1000;
        }

        .tenpack-panel-finish {
          display: grid;
          grid-template-columns: minmax(0, 1.35fr) minmax(220px, 0.65fr);
          gap: 12px;
          align-items: stretch;
        }

        .tenpack-best-card {
          position: relative;
          min-height: 150px;
          overflow: hidden;
          border-radius: 22px;
          padding: 16px;
          display: grid;
          grid-template-columns: 96px minmax(0, 1fr);
          gap: 16px;
          align-items: center;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background:
            radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.18), transparent 34%),
            rgba(255, 255, 255, 0.055);
        }

        .tenpack-best-card.rarity-sr,
        .tenpack-best-card.rarity-ssr {
          border-color: rgba(250, 204, 21, 0.5);
          box-shadow:
            0 0 34px rgba(250, 204, 21, 0.18),
            inset 0 0 46px rgba(168, 85, 247, 0.1);
        }

        .tenpack-best-card.rarity-ssr::after,
        .tenpack-best-card.rarity-sr::after {
          content: "";
          position: absolute;
          inset: -45%;
          background: conic-gradient(from 0deg, transparent, rgba(255, 255, 255, 0.26), transparent 28%);
          animation: bestCardHalo 4.5s linear infinite;
        }

        .tenpack-best-emoji,
        .tenpack-best-copy {
          position: relative;
          z-index: 1;
        }

        .tenpack-best-emoji {
          display: grid;
          place-items: center;
          min-height: 96px;
          border-radius: 18px;
          background: rgba(0, 0, 0, 0.2);
          font-size: 58px;
          filter: drop-shadow(0 12px 18px rgba(0, 0, 0, 0.42));
        }

        .tenpack-best-copy span,
        .tenpack-panel-stats span {
          display: block;
          color: #94a3b8;
          font-size: 11px;
          font-weight: 1000;
          letter-spacing: 0.12em;
        }

        .tenpack-best-copy strong {
          display: block;
          margin-top: 6px;
          color: #fde68a;
          font-size: 16px;
          font-weight: 1000;
        }

        .tenpack-best-copy p {
          margin: 7px 0 0;
          color: white;
          font-size: 22px;
          line-height: 1.2;
          font-weight: 1000;
        }

        .tenpack-panel-stats {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
        }

        .tenpack-panel-stats div {
          min-height: 0;
          border-radius: 18px;
          padding: 13px 14px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.055);
        }

        .tenpack-panel-stats strong {
          display: block;
          margin-top: 5px;
          color: #fde68a;
          font-size: 24px;
          line-height: 1;
          font-weight: 1000;
        }

        .tenpack-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 10px;
        }

        .tenpack-grid-stage {
          gap: 9px;
        }

        .tenpack-item {
          position: relative;
          height: 210px;
        }

        .tenpack-grid-stage .tenpack-item {
          height: 170px;
        }

        .tenpack-card-face {
          position: absolute;
          inset: 0;
          border-radius: 20px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
          padding: 10px 6px;
          text-align: center;
        }

        .tenpack-card-back {
          border: 1px solid rgba(255, 255, 255, 0.14);
          background:
            radial-gradient(circle at 50% 18%, rgba(255, 255, 255, 0.14), transparent 42%),
            linear-gradient(160deg, rgba(34, 211, 238, 0.18), rgba(8, 13, 32, 0.9));
        }

        .tenpack-back-glyph {
          font-size: 42px;
          font-weight: 1000;
          color: rgba(255, 255, 255, 0.25);
        }

        .tenpack-card-front {
          border: 1px solid rgba(255, 255, 255, 0.15);
          background:
            radial-gradient(circle at 50% 18%, rgba(255, 255, 255, 0.14), transparent 42%),
            rgba(255, 255, 255, 0.06);
          animation: tenpackReveal 0.45s cubic-bezier(0.34, 1.3, 0.64, 1) both;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          cursor: default;
        }

        .tenpack-card-front:hover {
          transform: translateY(-6px) scale(1.04);
          z-index: 10;
        }

        .tenpack-card-front::after {
          content: "";
          position: absolute;
          inset: -35%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.56), transparent);
          pointer-events: none;
          animation: tenpackSweep 0.76s ease 0.18s both;
        }

        .tenpack-slot-number {
          position: absolute;
          top: 8px;
          left: 8px;
          z-index: 2;
          border-radius: 999px;
          padding: 3px 7px;
          background: rgba(0, 0, 0, 0.24);
          color: rgba(255, 255, 255, 0.72);
          font-size: 10px;
          font-weight: 1000;
        }

        .tenpack-card-front.rarity-n {
          border-color: rgba(148, 163, 184, 0.42);
          background:
            radial-gradient(circle at 50% 18%, rgba(226, 232, 240, 0.16), transparent 42%),
            linear-gradient(160deg, rgba(100, 116, 139, 0.16), rgba(8, 13, 32, 0.9));
          box-shadow: 0 0 14px rgba(148, 163, 184, 0.2);
        }

        .tenpack-card-front.rarity-r {
          border-color: rgba(34, 211, 238, 0.55);
          background:
            radial-gradient(circle at 50% 18%, rgba(34, 211, 238, 0.24), transparent 42%),
            linear-gradient(160deg, rgba(34, 211, 238, 0.1), rgba(8, 13, 32, 0.9));
          box-shadow: 0 0 18px rgba(34, 211, 238, 0.32);
        }

        .tenpack-card-front.rarity-r:hover {
          box-shadow: 0 0 28px rgba(34, 211, 238, 0.55);
        }

        .tenpack-card-front.rarity-sr {
          border-color: rgba(168, 85, 247, 0.65);
          background:
            radial-gradient(circle at 50% 18%, rgba(168, 85, 247, 0.3), transparent 42%),
            linear-gradient(160deg, rgba(168, 85, 247, 0.14), rgba(34, 211, 238, 0.06), rgba(8, 13, 32, 0.9));
          box-shadow: 0 0 24px rgba(168, 85, 247, 0.5), 0 0 48px rgba(168, 85, 247, 0.2);
          animation: tenpackReveal 0.45s cubic-bezier(0.34, 1.3, 0.64, 1) both, rarityGlow 0.7s ease 0.3s both;
        }

        .tenpack-card-front.rarity-sr:hover {
          box-shadow: 0 0 36px rgba(168, 85, 247, 0.7), 0 0 60px rgba(168, 85, 247, 0.3);
        }

        .tenpack-card-front.rarity-ssr {
          border-color: rgba(250, 204, 21, 0.72);
          background:
            radial-gradient(circle at 50% 18%, rgba(250, 204, 21, 0.3), transparent 42%),
            linear-gradient(160deg, rgba(250, 204, 21, 0.14), rgba(251, 113, 133, 0.1), rgba(8, 13, 32, 0.9));
          box-shadow: 0 0 32px rgba(250, 204, 21, 0.6), 0 0 60px rgba(250, 204, 21, 0.25);
          animation: tenpackRevealSSR 0.55s cubic-bezier(0.34, 1.3, 0.64, 1) both, rarityGlowGold 0.8s ease 0.3s both;
        }

        .tenpack-card-front.rarity-ssr:hover {
          box-shadow: 0 0 44px rgba(250, 204, 21, 0.8), 0 0 80px rgba(250, 204, 21, 0.35);
        }

        .tenpack-card-front.rarity-ur {
          border-color: rgba(255, 255, 255, 0.9);
          background:
            radial-gradient(circle at 50% 16%, rgba(255, 255, 255, 0.46), transparent 26%),
            conic-gradient(from 0deg, rgba(255, 255, 255, 0.34), rgba(250, 204, 21, 0.28), rgba(251, 113, 133, 0.22), rgba(168, 85, 247, 0.24), rgba(34, 211, 238, 0.22), rgba(134, 239, 172, 0.22), rgba(255, 255, 255, 0.34)),
            rgba(8, 13, 32, 0.94);
          box-shadow:
            0 0 42px rgba(255, 255, 255, 0.56),
            0 0 94px rgba(34, 211, 238, 0.34),
            0 0 124px rgba(250, 204, 21, 0.28);
          animation:
            tenpackRevealSSR 0.62s cubic-bezier(0.34, 1.3, 0.64, 1) both,
            rarityGlowGold 1.4s ease 0.2s both;
        }

        .tenpack-card-front.tenpack-guaranteed {
          border-color: rgba(168, 85, 247, 0.55);
          background:
            radial-gradient(circle at 50% 18%, rgba(250, 204, 21, 0.24), transparent 42%),
            linear-gradient(160deg, rgba(168, 85, 247, 0.18), rgba(8, 13, 32, 0.9));
        }

        .tenpack-card-front.latest {
          outline: 2px solid rgba(255, 255, 255, 0.42);
          outline-offset: 2px;
          filter: brightness(1.08);
        }

        @keyframes tenpackReveal {
          0%   { transform: scale(0.65); opacity: 0; }
          60%  { opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes tenpackRevealSSR {
          0%   { transform: scale(0.55); opacity: 0; }
          45%  { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }

        .tenpack-guarantee-label {
          position: absolute;
          top: -10px;
          left: 50%;
          transform: translateX(-50%);
          max-width: calc(100% - 12px);
          white-space: normal;
          line-height: 1.15;
          border-radius: 999px;
          padding: 3px 9px;
          background: linear-gradient(90deg, #a855f7, #fde047);
          color: #0a0a1a;
          font-size: 10px;
          font-weight: 1000;
          letter-spacing: 0.06em;
        }

        .tenpack-item-emoji {
          font-size: 46px;
          filter: drop-shadow(0 5px 8px rgba(0, 0, 0, 0.4));
        }

        .tenpack-grid-stage .tenpack-item-emoji {
          font-size: 38px;
        }

        .tenpack-item-rarity {
          font-size: 10px;
          font-weight: 1000;
          color: #fde68a;
          letter-spacing: 0.04em;
        }

        .tenpack-item-name {
          font-size: 11px;
          font-weight: 900;
          color: #e2e8f0;
          line-height: 1.3;
          max-width: 100%;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .tenpack-item-new {
          position: absolute;
          top: 8px;
          right: 8px;
          z-index: 3;
          border-radius: 999px;
          padding: 3px 8px;
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.4), rgba(251, 113, 133, 0.28));
          border: 1px solid rgba(251, 191, 36, 0.65);
          color: #fde68a;
          font-size: 9px;
          font-weight: 1000;
          letter-spacing: 0.06em;
          animation: newBadgePulse 2s ease-in-out infinite;
        }

        .tenpack-guaranteed-badge {
          position: absolute;
          bottom: 8px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 3;
          border-radius: 999px;
          padding: 2px 8px;
          background: linear-gradient(90deg, #a855f7, #fde047);
          color: #0a0a1a;
          font-size: 8px;
          font-weight: 1000;
          white-space: nowrap;
        }

        @keyframes newBadgePulse {
          0%, 100% { box-shadow: 0 0 4px rgba(251, 191, 36, 0.4); }
          50% { box-shadow: 0 0 10px rgba(251, 191, 36, 0.8); }
        }

        .tenpack-result-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 16px;
        }

        .tenpack-result-actions .eq-button {
          min-height: 52px;
          font-size: 15px;
        }

        @keyframes packPulse {
          from {
            transform: scale(1);
            box-shadow: 0 0 70px rgba(168, 85, 247, 0.28);
          }

          to {
            transform: scale(1.025);
            box-shadow: 0 0 92px rgba(251, 191, 36, 0.34);
          }
        }

        .pack-display.tenpack-suspense {
          animation: tenpackSuspense 1.1s ease-in-out infinite alternate;
        }

        @keyframes tenpackSuspense {
          from {
            transform: scale(1);
            box-shadow: 0 0 60px rgba(168, 85, 247, 0.22);
          }
          to {
            transform: scale(1.022);
            box-shadow: 0 0 100px rgba(250, 204, 21, 0.32);
          }
        }

        .tenpack-reveal-wrap {
          width: min(100%, 920px);
          display: grid;
          grid-template-columns: 286px minmax(0, 1fr);
          grid-template-areas:
            "header grid"
            "meter grid"
            "card grid"
            "note grid"
            "skip grid";
          align-items: center;
          justify-content: center;
          gap: 12px 18px;
        }

        .tenpack-reveal-header {
          grid-area: header;
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 286px;
          gap: 10px;
        }

        .tenpack-reveal-label {
          color: #fde68a;
          font-size: 11px;
          font-weight: 1000;
          letter-spacing: 0.16em;
        }

        .tenpack-reveal-counter {
          border-radius: 999px;
          padding: 6px 12px;
          background: rgba(250, 204, 21, 0.14);
          border: 1px solid rgba(250, 204, 21, 0.32);
          color: #fde68a;
          font-size: 13px;
          font-weight: 1000;
        }

        .tenpack-reveal-meter-bar {
          grid-area: meter;
          width: 286px;
          height: 8px;
          overflow: hidden;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.1);
        }

        .tenpack-reveal-meter-bar div {
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #22d3ee, #a855f7, #fde047);
          transition: width 0.4s ease;
        }

        .tenpack-reveal-guarantee {
          position: relative;
          z-index: 2;
          width: fit-content;
          margin: 6px auto 0;
          border-radius: 999px;
          padding: 5px 12px;
          background: linear-gradient(90deg, #a855f7, #fde047);
          color: #0a0a1a;
          font-size: 11px;
          font-weight: 1000;
          letter-spacing: 0.06em;
          text-align: center;
        }

        .tenpack-auto-note {
          grid-area: note;
          width: 286px;
          min-height: 44px;
          display: grid;
          place-items: center;
          border-radius: 18px;
          border: 1px solid rgba(34, 211, 238, 0.24);
          background: rgba(34, 211, 238, 0.1);
          color: #a5f3fc;
          font-size: 13px;
          font-weight: 1000;
          text-align: center;
          animation: tenpackAutoNotePulse 1.2s ease-in-out infinite alternate;
        }

        .tenpack-skip-btn {
          grid-area: skip;
          width: 286px;
          padding: 10px 20px;
          border-radius: 18px;
          border: 1px solid rgba(148, 163, 184, 0.28);
          background: rgba(148, 163, 184, 0.1);
          color: #94a3b8;
          font-size: 13px;
          font-weight: 1000;
          cursor: pointer;
          transition: all 0.18s;
          letter-spacing: 0.06em;
        }

        .tenpack-skip-btn:hover {
          border-color: rgba(148, 163, 184, 0.52);
          background: rgba(148, 163, 184, 0.18);
          color: #e2e8f0;
        }

        .tenpack-reveal-wrap > .pack-display {
          grid-area: card;
          justify-self: center;
        }


        .tenpack-next-btn {
          width: 286px;
          padding: 14px 20px;
          border-radius: 20px;
          border: 1px solid rgba(250, 204, 21, 0.38);
          background: rgba(250, 204, 21, 0.14);
          color: #fde68a;
          font-size: 15px;
          font-weight: 1000;
          cursor: pointer;
          transition: all 0.2s;
          animation: tenpackNextFadeIn 0.3s ease both;
        }

        .tenpack-next-btn:hover {
          background: rgba(250, 204, 21, 0.24);
          border-color: rgba(250, 204, 21, 0.6);
          transform: translateY(-2px);
        }

        @keyframes tenpackNextFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 860px) {
          .pack-dashboard {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 900px) {
          .tenpack-grid {
            grid-template-columns: repeat(5, minmax(0, 1fr));
          }
        }

        @media (max-width: 600px) {
          .tenpack-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .tenpack-result-actions {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 720px) {
          .pack-dashboard {
            gap: 18px;
            margin-top: 18px;
          }

          .pack-stage {
            min-height: 360px;
            padding: 24px 0;
          }

          .pack-stage.has-tenpack {
            min-height: auto;
            padding: 0;
          }

          .pack-display {
            width: 240px;
            min-height: 340px;
          }

          .tenpack-reveal-header,
          .tenpack-reveal-meter-bar,
          .tenpack-auto-note,
          .tenpack-skip-btn,
          .tenpack-next-btn {
            width: 240px;
          }

          .tenpack-reveal-wrap {
            width: 100%;
            grid-template-columns: 1fr;
            grid-template-areas:
              "header"
              "meter"
              "card"
              "note"
              "grid"
              "skip";
            justify-items: center;
            gap: 10px;
          }


          .pack-gift {
            width: 126px;
            height: 150px;
            margin-top: 30px;
          }

          .pack-result-emoji {
            margin-top: 16px;
            font-size: 74px;
          }

          .pack-display h2 {
            font-size: 24px;
          }

          .tenpack-stage-display {
            padding: 14px;
            border-radius: 28px;
          }

          .tenpack-stage-head h2 {
            font-size: 22px;
          }

          .tenpack-stage-head strong {
            font-size: 12px;
          }

          .tenpack-grid-stage .tenpack-item {
            height: 150px;
          }

          .pack-result-card {
            grid-template-columns: 1fr;
          }

          .tenpack-panel-finish {
            grid-template-columns: 1fr;
          }

          .tenpack-best-card {
            grid-template-columns: 80px minmax(0, 1fr);
            min-height: 128px;
          }

          .tenpack-best-emoji {
            min-height: 80px;
            font-size: 48px;
          }

          .pack-result-frame {
            height: 150px;
          }

          .pack-result-main {
            font-size: 76px;
          }

          .rarity-rate-list {
            grid-template-columns: 1fr;
          }
        }

        /* ================================================
           PRIZE OVERLAY — SSR/UR/SAR ドラマティック演出
        ================================================ */
        .prize-overlay {
          position: fixed;
          inset: 0;
          z-index: 8950;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          pointer-events: none;
        }

        .prize-overlay-ssr { animation: prizeOverlayOut 0.5s ease-out 1.25s both; }
        .prize-overlay-ur  { animation: prizeOverlayOut 0.5s ease-out 1.6s  both; }
        .prize-overlay-sar { animation: prizeOverlayOut 0.6s ease-out 2.0s  both; }

        @keyframes prizeOverlayOut {
          from { opacity: 1; transform: scale(1); }
          to   { opacity: 0; transform: scale(1.06); }
        }

        /* Background */
        .prize-overlay-bg {
          position: absolute;
          inset: 0;
          animation: prizeOverlayBgIn 0.22s ease-out both;
        }

        @keyframes prizeOverlayBgIn {
          from { opacity: 0; transform: scale(0.75); }
          to   { opacity: 1; transform: scale(1); }
        }

        .prize-overlay-ssr .prize-overlay-bg {
          background: radial-gradient(ellipse at 50% 42%,
            rgba(250,204,21,0.97) 0%,
            rgba(251,113,133,0.65) 38%,
            rgba(0,0,0,0.88) 72%);
        }

        .prize-overlay-ur .prize-overlay-bg {
          background: conic-gradient(from 0deg,
            rgba(255,255,255,0.92),
            rgba(251,191,36,0.9),
            rgba(251,113,133,0.9),
            rgba(168,85,247,0.9),
            rgba(34,211,238,0.9),
            rgba(134,239,172,0.8),
            rgba(255,255,255,0.92));
          animation: prizeOverlayBgIn 0.22s ease-out both, prizeOverlayBgSpin 2.8s linear 0.22s infinite;
        }

        .prize-overlay-sar .prize-overlay-bg {
          background: conic-gradient(from 0deg,
            #fff, #fde047, #fb7185, #a855f7, #22d3ee, #86efac, #fde047, #fff);
          animation: prizeOverlayBgIn 0.15s ease-out both, prizeOverlayBgSpin 1.8s linear 0.15s infinite;
        }

        @keyframes prizeOverlayBgSpin {
          from { transform: rotate(0deg) scale(1.6); }
          to   { transform: rotate(360deg) scale(1.6); }
        }

        /* Rays */
        .prize-overlay-rays {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .prize-overlay-rays span {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 7px;
          height: 80vh;
          border-radius: 999px;
          transform-origin: 50% 0;
          opacity: 0;
          animation: prizeOverlayRay 0.9s ease-out 0.08s both;
        }

        .prize-overlay-ssr .prize-overlay-rays span {
          background: linear-gradient(180deg, rgba(250,204,21,0.95), rgba(251,113,133,0.5) 55%, transparent);
        }
        .prize-overlay-ur .prize-overlay-rays span {
          width: 9px;
          background: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(34,211,238,0.6) 55%, transparent);
        }
        .prize-overlay-sar .prize-overlay-rays span {
          width: 11px;
          background: linear-gradient(180deg, rgba(255,255,255,1), rgba(253,230,138,0.7) 40%, transparent);
        }

        .prize-overlay-rays span:nth-child(1)  { transform: rotate(0deg)   translateY(-50%); animation-delay: 0.05s; }
        .prize-overlay-rays span:nth-child(2)  { transform: rotate(30deg)  translateY(-50%); animation-delay: 0.09s; }
        .prize-overlay-rays span:nth-child(3)  { transform: rotate(60deg)  translateY(-50%); animation-delay: 0.06s; }
        .prize-overlay-rays span:nth-child(4)  { transform: rotate(90deg)  translateY(-50%); animation-delay: 0.11s; }
        .prize-overlay-rays span:nth-child(5)  { transform: rotate(120deg) translateY(-50%); animation-delay: 0.07s; }
        .prize-overlay-rays span:nth-child(6)  { transform: rotate(150deg) translateY(-50%); animation-delay: 0.12s; }
        .prize-overlay-rays span:nth-child(7)  { transform: rotate(180deg) translateY(-50%); animation-delay: 0.05s; }
        .prize-overlay-rays span:nth-child(8)  { transform: rotate(210deg) translateY(-50%); animation-delay: 0.10s; }
        .prize-overlay-rays span:nth-child(9)  { transform: rotate(240deg) translateY(-50%); animation-delay: 0.07s; }
        .prize-overlay-rays span:nth-child(10) { transform: rotate(270deg) translateY(-50%); animation-delay: 0.13s; }
        .prize-overlay-rays span:nth-child(11) { transform: rotate(300deg) translateY(-50%); animation-delay: 0.06s; }
        .prize-overlay-rays span:nth-child(12) { transform: rotate(330deg) translateY(-50%); animation-delay: 0.09s; }
        .prize-overlay-rays span:nth-child(13) { transform: rotate(15deg)  translateY(-50%); animation-delay: 0.14s; }
        .prize-overlay-rays span:nth-child(14) { transform: rotate(45deg)  translateY(-50%); animation-delay: 0.08s; }
        .prize-overlay-rays span:nth-child(15) { transform: rotate(75deg)  translateY(-50%); animation-delay: 0.11s; }
        .prize-overlay-rays span:nth-child(16) { transform: rotate(105deg) translateY(-50%); animation-delay: 0.04s; }
        .prize-overlay-rays span:nth-child(17) { transform: rotate(135deg) translateY(-50%); animation-delay: 0.13s; }
        .prize-overlay-rays span:nth-child(18) { transform: rotate(165deg) translateY(-50%); animation-delay: 0.07s; }
        .prize-overlay-rays span:nth-child(19) { transform: rotate(195deg) translateY(-50%); animation-delay: 0.15s; }
        .prize-overlay-rays span:nth-child(20) { transform: rotate(225deg) translateY(-50%); animation-delay: 0.05s; }

        @keyframes prizeOverlayRay {
          0%   { opacity: 0; height: 0; }
          25%  { opacity: 0.9; }
          100% { opacity: 0.35; height: 80vh; }
        }

        /* Expanding rings */
        .prize-overlay-rings {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }

        .prize-overlay-rings span {
          position: absolute;
          border-radius: 50%;
          border: 3px solid rgba(255, 255, 255, 0.75);
          animation: prizeOverlayRingExpand 1.1s ease-out both;
        }

        .prize-overlay-rings span:nth-child(1) { animation-delay: 0.04s; }
        .prize-overlay-rings span:nth-child(2) { animation-delay: 0.18s; border-color: rgba(255,255,255,0.55); }
        .prize-overlay-rings span:nth-child(3) { animation-delay: 0.34s; border-color: rgba(255,255,255,0.35); }

        @keyframes prizeOverlayRingExpand {
          0%   { width: 0;      height: 0;      opacity: 0.95; }
          100% { width: 250vmax; height: 250vmax; opacity: 0; }
        }

        /* Particles */
        .prize-overlay-particles {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .prize-overlay-particles span {
          --px: 50%; --py: 50%;
          --pdx: 0px; --pdy: -120px;
          --pc: #fde68a;
          position: absolute;
          left: var(--px);
          top: var(--py);
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--pc);
          box-shadow: 0 0 10px var(--pc), 0 0 20px var(--pc);
          opacity: 0;
          animation: prizeOverlayParticle 0.9s ease-out both;
        }

        @keyframes prizeOverlayParticle {
          0%   { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
          100% { transform: translate(calc(-50% + var(--pdx)), calc(-50% + var(--pdy))) scale(0); opacity: 0; }
        }

        .prize-overlay-particles span:nth-child(1)  { --pdx:   0px; --pdy:-170px; --pc:#fde047; animation-delay:0.08s; }
        .prize-overlay-particles span:nth-child(2)  { --pdx:  54px; --pdy:-160px; --pc:#fb7185; animation-delay:0.12s; }
        .prize-overlay-particles span:nth-child(3)  { --pdx: 105px; --pdy:-132px; --pc:#a855f7; animation-delay:0.07s; }
        .prize-overlay-particles span:nth-child(4)  { --pdx: 147px; --pdy: -85px; --pc:#22d3ee; animation-delay:0.14s; }
        .prize-overlay-particles span:nth-child(5)  { --pdx: 170px; --pdy: -26px; --pc:#86efac; animation-delay:0.09s; }
        .prize-overlay-particles span:nth-child(6)  { --pdx: 166px; --pdy:  40px; --pc:#fde047; animation-delay:0.16s; }
        .prize-overlay-particles span:nth-child(7)  { --pdx: 130px; --pdy:  96px; --pc:#fb7185; animation-delay:0.06s; }
        .prize-overlay-particles span:nth-child(8)  { --pdx:  74px; --pdy: 143px; --pc:#a855f7; animation-delay:0.13s; }
        .prize-overlay-particles span:nth-child(9)  { --pdx:   8px; --pdy: 165px; --pc:#22d3ee; animation-delay:0.08s; }
        .prize-overlay-particles span:nth-child(10) { --pdx: -60px; --pdy: 160px; --pc:#fde047; animation-delay:0.17s; }
        .prize-overlay-particles span:nth-child(11) { --pdx:-118px; --pdy: 124px; --pc:#fb7185; animation-delay:0.05s; }
        .prize-overlay-particles span:nth-child(12) { --pdx:-158px; --pdy:  70px; --pc:#a855f7; animation-delay:0.14s; }
        .prize-overlay-particles span:nth-child(13) { --pdx:-170px; --pdy:   5px; --pc:#22d3ee; animation-delay:0.09s; }
        .prize-overlay-particles span:nth-child(14) { --pdx:-158px; --pdy: -60px; --pc:#86efac; animation-delay:0.18s; }
        .prize-overlay-particles span:nth-child(15) { --pdx:-120px; --pdy:-118px; --pc:#fde047; animation-delay:0.07s; }
        .prize-overlay-particles span:nth-child(16) { --pdx: -62px; --pdy:-158px; --pc:#fb7185; animation-delay:0.15s; }
        .prize-overlay-particles span:nth-child(17) { --pdx:  30px; --pdy:-200px; --pc:#a855f7; animation-delay:0.10s; }
        .prize-overlay-particles span:nth-child(18) { --pdx: 120px; --pdy:-190px; --pc:#fde047; animation-delay:0.06s; }
        .prize-overlay-particles span:nth-child(19) { --pdx: 190px; --pdy:-110px; --pc:#22d3ee; animation-delay:0.13s; }
        .prize-overlay-particles span:nth-child(20) { --pdx: 210px; --pdy:  20px; --pc:#fb7185; animation-delay:0.08s; }
        .prize-overlay-particles span:nth-child(21) { --pdx: 170px; --pdy: 150px; --pc:#86efac; animation-delay:0.16s; }
        .prize-overlay-particles span:nth-child(22) { --pdx:  80px; --pdy: 200px; --pc:#fde047; animation-delay:0.05s; }
        .prize-overlay-particles span:nth-child(23) { --pdx: -40px; --pdy: 205px; --pc:#a855f7; animation-delay:0.12s; }
        .prize-overlay-particles span:nth-child(24) { --pdx:-140px; --pdy: 168px; --pc:#22d3ee; animation-delay:0.07s; }
        .prize-overlay-particles span:nth-child(25) { --pdx:-200px; --pdy:  80px; --pc:#fb7185; animation-delay:0.17s; }
        .prize-overlay-particles span:nth-child(26) { --pdx:-210px; --pdy: -40px; --pc:#fde047; animation-delay:0.09s; }
        .prize-overlay-particles span:nth-child(27) { --pdx:-172px; --pdy:-146px; --pc:#86efac; animation-delay:0.14s; }
        .prize-overlay-particles span:nth-child(28) { --pdx: -90px; --pdy:-200px; --pc:#a855f7; animation-delay:0.06s; }
        .prize-overlay-particles span:nth-child(29) { --pdx:  50px; --pdy:-130px; --pc:#fde047; animation-delay:0.11s; }
        .prize-overlay-particles span:nth-child(30) { --pdx: 140px; --pdy: -60px; --pc:#22d3ee; animation-delay:0.04s; }

        /* Content */
        .prize-overlay-content {
          position: relative;
          z-index: 5;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          text-align: center;
          padding: 0 20px;
        }

        .prize-overlay-rarity-tag {
          font-size: clamp(13px, 3.5vw, 17px);
          font-weight: 1000;
          letter-spacing: 0.55em;
          color: rgba(255, 255, 255, 0.9);
          text-shadow: 0 0 24px rgba(255, 255, 255, 0.9);
          animation: prizeOverlayTextSlam 0.38s cubic-bezier(0.2, 1.4, 0.34, 1) 0.12s both;
        }

        .prize-overlay-emoji {
          font-size: clamp(92px, 24vw, 148px);
          line-height: 1;
          filter: drop-shadow(0 0 50px rgba(255, 255, 255, 0.85)) drop-shadow(0 10px 30px rgba(0,0,0,0.6));
          animation: prizeOverlayEmojiBurst 0.58s cubic-bezier(0.18, 1.35, 0.34, 1) 0.06s both;
        }

        .prize-overlay-sar .prize-overlay-emoji {
          animation:
            prizeOverlayEmojiBurst 0.58s cubic-bezier(0.18, 1.35, 0.34, 1) 0.06s both,
            prizeOverlayEmojiSpin 4s linear 0.65s infinite;
        }

        .prize-overlay-label {
          font-size: clamp(26px, 7.5vw, 52px);
          font-weight: 1000;
          letter-spacing: 0.06em;
          line-height: 1;
          color: white;
          text-shadow: 0 0 40px rgba(255, 255, 255, 0.9), 0 4px 18px rgba(0,0,0,0.55);
          animation: prizeOverlayTextSlam 0.44s cubic-bezier(0.2, 1.4, 0.34, 1) 0.2s both;
        }

        .prize-overlay-ssr .prize-overlay-label {
          background: linear-gradient(135deg, #fef3c7, #fde047, #fb923c);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: none;
          filter: drop-shadow(0 0 24px rgba(250,204,21,0.9));
        }

        .prize-overlay-ur .prize-overlay-label {
          background: linear-gradient(135deg, #fff, #fde047, #fb7185, #a855f7, #22d3ee);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: none;
          animation:
            prizeOverlayTextSlam 0.44s cubic-bezier(0.2, 1.4, 0.34, 1) 0.2s both,
            godNameShimmer 2s linear 0.65s infinite;
        }

        .prize-overlay-sar .prize-overlay-label {
          background: linear-gradient(90deg, #fde68a, #fb7185, #a855f7, #22d3ee, #fef3c7);
          background-size: 300% 300%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: none;
          animation:
            prizeOverlayTextSlam 0.44s cubic-bezier(0.2, 1.4, 0.34, 1) 0.2s both,
            godNameShimmer 1.4s linear 0.65s infinite;
        }

        .prize-overlay-name {
          font-size: clamp(18px, 4.5vw, 30px);
          font-weight: 1000;
          color: rgba(255, 255, 255, 0.94);
          text-shadow: 0 2px 14px rgba(0,0,0,0.65);
          animation: prizeOverlayTextRise 0.42s ease 0.34s both;
        }

        .prize-overlay-new-badge {
          padding: 6px 18px;
          border-radius: 999px;
          background: rgba(251, 191, 36, 0.25);
          border: 1px solid rgba(251, 191, 36, 0.65);
          color: #fde68a;
          font-size: 13px;
          font-weight: 1000;
          letter-spacing: 0.16em;
          animation: prizeOverlayTextRise 0.42s ease 0.46s both;
        }

        @keyframes prizeOverlayEmojiBurst {
          0%   { transform: scale(0.1) rotate(-18deg); filter: brightness(6) drop-shadow(0 0 60px rgba(255,255,255,1)); }
          55%  { transform: scale(1.18) rotate(6deg);  filter: brightness(1.6); }
          100% { transform: scale(1)    rotate(0deg);  filter: drop-shadow(0 0 40px rgba(255,255,255,0.7)); }
        }

        @keyframes prizeOverlayEmojiSpin {
          from { filter: drop-shadow(0 0 40px rgba(255,255,255,0.7)) hue-rotate(0deg); }
          to   { filter: drop-shadow(0 0 40px rgba(255,255,255,0.7)) hue-rotate(360deg); }
        }

        @keyframes prizeOverlayTextSlam {
          0%   { opacity: 0; transform: scale(2.2) translateY(-16px); }
          65%  { opacity: 1; transform: scale(0.97) translateY(2px); }
          100% { opacity: 1; transform: scale(1)    translateY(0); }
        }

        @keyframes prizeOverlayTextRise {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ================================================
           サスペンス演出強化 — テンションリング & チャージバー
        ================================================ */
        .suspense-tension-rings {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 0;
          pointer-events: none;
        }

        .suspense-tension-rings span {
          position: absolute;
          border-radius: 50%;
          border: 2px solid rgba(34, 211, 238, 0.35);
          animation: suspenseRingPulse 1.6s ease-in-out infinite;
        }

        .suspense-tension-rings span:nth-child(1) { width: 100px;  height: 100px;  animation-delay: 0s;    border-color: rgba(34,211,238,0.5); }
        .suspense-tension-rings span:nth-child(2) { width: 165px;  height: 165px;  animation-delay: 0.28s; border-color: rgba(168,85,247,0.4); }
        .suspense-tension-rings span:nth-child(3) { width: 230px;  height: 230px;  animation-delay: 0.54s; border-color: rgba(250,204,21,0.3); }
        .suspense-tension-rings span:nth-child(4) { width: 300px;  height: 300px;  animation-delay: 0.82s; border-color: rgba(34,211,238,0.18); }

        @keyframes suspenseRingPulse {
          0%, 100% { transform: scale(0.88); opacity: 0; }
          50%      { transform: scale(1);    opacity: 1; }
        }

        .suspense-card-back {
          animation: suspenseCardBeat 0.88s ease-in-out infinite alternate !important;
          filter: drop-shadow(0 0 18px rgba(34, 211, 238, 0.4)) drop-shadow(0 20px 28px rgba(0, 0, 0, 0.42));
        }

        @keyframes suspenseCardBeat {
          from { transform: translateY(0)   scale(1)    rotate(-1.5deg); filter: drop-shadow(0 0 18px rgba(34,211,238,0.35)); }
          to   { transform: translateY(-8px) scale(1.04) rotate(1.5deg);  filter: drop-shadow(0 0 36px rgba(250,204,21,0.55)) drop-shadow(0 24px 32px rgba(0,0,0,0.4)); }
        }

        .suspense-summon-label {
          position: relative;
          z-index: 2;
          animation: suspenseLabelPulse 1.1s ease-in-out infinite alternate !important;
        }

        @keyframes suspenseLabelPulse {
          from { opacity: 0.6; letter-spacing: 0.18em; }
          to   { opacity: 1;   letter-spacing: 0.24em; color: #fde68a; }
        }

        .suspense-card-num {
          position: relative;
          z-index: 2;
          font-size: 32px !important;
          letter-spacing: 0.18em;
          animation: suspenseNumPop 0.42s cubic-bezier(0.2, 1.4, 0.34, 1) both !important;
        }

        @keyframes suspenseNumPop {
          from { transform: scale(0.6) translateY(8px); opacity: 0; }
          to   { transform: scale(1)   translateY(0);   opacity: 1; }
        }

        .suspense-charge-bar {
          position: relative;
          z-index: 2;
          width: 180px;
          height: 5px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.1);
          overflow: hidden;
          margin-top: 4px;
        }

        .suspense-charge-fill {
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #22d3ee, #a855f7, #fde047);
          animation: suspenseChargeFill var(--charge-dur, 1s) ease-in-out both;
          box-shadow: 0 0 10px rgba(34, 211, 238, 0.7);
        }

        @keyframes suspenseChargeFill {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
      <style jsx global>{`
        .pack-page .tenpack-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 10px;
        }

        .pack-page .tenpack-grid-stage {
          gap: 9px;
        }

        .pack-page .tenpack-item {
          position: relative;
          height: 210px;
          min-width: 0;
        }

        .pack-page .tenpack-grid-stage .tenpack-item {
          height: 170px;
        }

        .pack-page .tenpack-card-face {
          position: absolute;
          inset: 0;
          border-radius: 20px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
          padding: 10px 6px;
          text-align: center;
        }

        .pack-page .tenpack-card-back {
          border: 1px solid rgba(255, 255, 255, 0.14);
          background:
            radial-gradient(circle at 50% 18%, rgba(255, 255, 255, 0.14), transparent 42%),
            linear-gradient(160deg, rgba(34, 211, 238, 0.18), rgba(8, 13, 32, 0.9));
        }

        .pack-page .tenpack-back-glyph {
          font-size: 42px;
          font-weight: 1000;
          color: rgba(255, 255, 255, 0.25);
        }

        .pack-page .tenpack-card-front {
          border: 1px solid rgba(255, 255, 255, 0.15);
          background:
            radial-gradient(circle at 50% 18%, rgba(255, 255, 255, 0.14), transparent 42%),
            rgba(255, 255, 255, 0.06);
          animation: tenpackRevealGlobal 0.45s cubic-bezier(0.34, 1.3, 0.64, 1) both;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          cursor: default;
        }

        .pack-page .tenpack-card-front > * {
          position: relative;
          z-index: 2;
        }

        .pack-page .tenpack-card-front:hover {
          transform: translateY(-6px) scale(1.04);
          z-index: 10;
        }

        .pack-page .tenpack-card-front::after {
          content: "";
          position: absolute;
          inset: -35%;
          z-index: 1;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.56), transparent);
          pointer-events: none;
          animation: tenpackSweepGlobal 0.76s ease 0.18s both;
        }

        .pack-page .tenpack-slot-number {
          position: absolute;
          top: 8px;
          left: 8px;
          z-index: 3;
          border-radius: 999px;
          padding: 3px 7px;
          background: rgba(0, 0, 0, 0.24);
          color: rgba(255, 255, 255, 0.72);
          font-size: 10px;
          font-weight: 1000;
        }

        .pack-page .tenpack-card-front.rarity-n {
          border-color: rgba(148, 163, 184, 0.42);
          background:
            radial-gradient(circle at 50% 18%, rgba(226, 232, 240, 0.16), transparent 42%),
            linear-gradient(160deg, rgba(100, 116, 139, 0.16), rgba(8, 13, 32, 0.9));
          box-shadow: 0 0 14px rgba(148, 163, 184, 0.2);
        }

        .pack-page .tenpack-card-front.rarity-r {
          border-color: rgba(34, 211, 238, 0.55);
          background:
            radial-gradient(circle at 50% 18%, rgba(34, 211, 238, 0.24), transparent 42%),
            linear-gradient(160deg, rgba(34, 211, 238, 0.1), rgba(8, 13, 32, 0.9));
          box-shadow: 0 0 18px rgba(34, 211, 238, 0.32);
        }

        .pack-page .tenpack-card-front.rarity-sr {
          border-color: rgba(250, 204, 21, 0.7);
          background:
            radial-gradient(circle at 50% 16%, rgba(250, 204, 21, 0.3), transparent 38%),
            radial-gradient(circle at 50% 64%, rgba(168, 85, 247, 0.26), transparent 48%),
            linear-gradient(160deg, rgba(168, 85, 247, 0.2), rgba(34, 211, 238, 0.08), rgba(8, 13, 32, 0.9));
          box-shadow:
            0 0 28px rgba(250, 204, 21, 0.34),
            0 0 58px rgba(168, 85, 247, 0.26);
          animation:
            tenpackRevealGlobal 0.45s cubic-bezier(0.34, 1.3, 0.64, 1) both,
            rarityGlowGlobal 1.35s ease 0.24s both;
        }

        .pack-page .tenpack-card-front.rarity-ssr {
          border-color: rgba(250, 204, 21, 0.88);
          background:
            radial-gradient(circle at 50% 16%, rgba(255, 255, 255, 0.34), transparent 28%),
            radial-gradient(circle at 50% 30%, rgba(250, 204, 21, 0.34), transparent 42%),
            conic-gradient(from 20deg, rgba(250, 204, 21, 0.24), rgba(251, 113, 133, 0.18), rgba(168, 85, 247, 0.2), rgba(34, 211, 238, 0.14), rgba(250, 204, 21, 0.24)),
            rgba(8, 13, 32, 0.94);
          box-shadow:
            0 0 36px rgba(250, 204, 21, 0.58),
            0 0 76px rgba(251, 113, 133, 0.3),
            0 0 104px rgba(34, 211, 238, 0.18);
          animation:
            tenpackRevealSSRGlobal 0.6s cubic-bezier(0.34, 1.3, 0.64, 1) both,
            rarityGlowGoldGlobal 1.6s ease 0.2s both;
        }

        .pack-page .tenpack-card-front.rarity-ur {
          border-color: rgba(255, 255, 255, 0.9);
          background:
            radial-gradient(circle at 50% 16%, rgba(255, 255, 255, 0.46), transparent 26%),
            conic-gradient(from 0deg, rgba(255, 255, 255, 0.34), rgba(250, 204, 21, 0.28), rgba(251, 113, 133, 0.22), rgba(168, 85, 247, 0.24), rgba(34, 211, 238, 0.22), rgba(134, 239, 172, 0.22), rgba(255, 255, 255, 0.34)),
            rgba(8, 13, 32, 0.94);
          box-shadow:
            0 0 42px rgba(255, 255, 255, 0.56),
            0 0 94px rgba(34, 211, 238, 0.34),
            0 0 124px rgba(250, 204, 21, 0.28);
          animation:
            tenpackRevealSSRGlobal 0.62s cubic-bezier(0.34, 1.3, 0.64, 1) both,
            rarityGlowGoldGlobal 1.6s ease 0.2s both;
        }

        .pack-page .tenpack-card-front.rarity-sar,
        .pack-page .pack-display.opened.rarity-sar {
          border-color: rgba(253, 230, 138, 0.95);
          background:
            radial-gradient(circle at 50% 14%, rgba(255, 255, 255, 0.5), transparent 26%),
            conic-gradient(from 0deg, rgba(253, 230, 138, 0.36), rgba(251, 113, 133, 0.28), rgba(168, 85, 247, 0.28), rgba(34, 211, 238, 0.24), rgba(253, 230, 138, 0.36)),
            rgba(8, 13, 32, 0.96);
          box-shadow:
            0 0 46px rgba(253, 230, 138, 0.62),
            0 0 104px rgba(251, 113, 133, 0.34),
            0 0 132px rgba(34, 211, 238, 0.22);
          animation:
            tenpackRevealSSRGlobal 0.66s cubic-bezier(0.34, 1.3, 0.64, 1) both,
            rarityGlowGoldGlobal 1.6s ease 0.2s both;
        }

        .pack-page .tenpack-item.is-prize .tenpack-card-front::before {
          content: "";
          position: absolute;
          inset: -42%;
          z-index: 0;
          background:
            conic-gradient(from 0deg, transparent, rgba(255, 255, 255, 0.55), transparent 20%, rgba(250, 204, 21, 0.38), transparent 46%),
            radial-gradient(circle, rgba(255, 255, 255, 0.24) 0 2px, transparent 3px);
          background-size: 100% 100%, 34px 34px;
          mix-blend-mode: screen;
          animation: tenpackPrizeRingGlobal 3.2s linear infinite;
        }

        .pack-page .tenpack-card-front.tenpack-guaranteed {
          border-color: rgba(168, 85, 247, 0.55);
        }

        .pack-page .tenpack-card-front.latest {
          outline: 2px solid rgba(255, 255, 255, 0.42);
          outline-offset: 2px;
          filter: brightness(1.08);
        }

        .pack-page .tenpack-prize-callout {
          position: absolute;
          top: 27px;
          left: 50%;
          z-index: 4;
          transform: translateX(-50%);
          border-radius: 999px;
          padding: 3px 8px;
          background: linear-gradient(90deg, #fde047, #fb7185, #a855f7, #22d3ee);
          color: #050816;
          font-size: 8px;
          font-weight: 1000;
          letter-spacing: 0.08em;
          white-space: nowrap;
          box-shadow: 0 0 16px rgba(250, 204, 21, 0.5);
          animation: tenpackPrizeCalloutGlobal 0.62s cubic-bezier(0.2, 1.35, 0.34, 1) both;
        }

        .pack-page .tenpack-item-emoji {
          font-size: 46px;
          filter: drop-shadow(0 5px 8px rgba(0, 0, 0, 0.4));
        }

        .pack-page .tenpack-grid-stage .tenpack-item-emoji {
          font-size: 38px;
        }

        .pack-page .tenpack-item-rarity {
          font-size: 10px;
          font-weight: 1000;
          color: #fde68a;
          letter-spacing: 0.04em;
        }

        .pack-page .tenpack-item-name {
          font-size: 11px;
          font-weight: 900;
          color: #e2e8f0;
          line-height: 1.3;
          max-width: 100%;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .pack-page .tenpack-item-new {
          position: absolute;
          top: 8px;
          right: 8px;
          z-index: 4;
          border-radius: 999px;
          padding: 3px 8px;
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.4), rgba(251, 113, 133, 0.28));
          border: 1px solid rgba(251, 191, 36, 0.65);
          color: #fde68a;
          font-size: 9px;
          font-weight: 1000;
          letter-spacing: 0.06em;
          animation: newBadgePulseGlobal 2s ease-in-out infinite;
        }

        .pack-page .tenpack-guaranteed-badge {
          position: absolute;
          bottom: 8px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 4;
          border-radius: 999px;
          padding: 2px 8px;
          background: linear-gradient(90deg, #a855f7, #fde047);
          color: #0a0a1a;
          font-size: 8px;
          font-weight: 1000;
          white-space: nowrap;
        }

        .pack-page .card-reveal-effects {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          overflow: hidden;
        }

        .pack-page .card-reveal-effects span {
          --spark-x: 0px;
          --spark-y: -120px;
          --spark-size: 8px;
          position: absolute;
          left: 50%;
          top: 48%;
          width: var(--spark-size);
          height: var(--spark-size);
          border-radius: 999px;
          background: #e2e8f0;
          box-shadow: 0 0 16px currentColor;
          color: #e2e8f0;
          opacity: 0;
          animation: cardSparkGlobal 0.9s ease-out both;
        }

        .pack-page .card-reveal-effects.rarity-n span {
          color: #a5f3fc;
          background: #a5f3fc;
          animation-duration: 0.72s;
        }

        .pack-page .card-reveal-effects.rarity-r span {
          color: #22d3ee;
          background: #67e8f9;
          animation-duration: 0.84s;
        }

        .pack-page .card-reveal-effects.rarity-sr span {
          color: #fde047;
          background: linear-gradient(135deg, #fde047, #a855f7);
          animation-duration: 1.04s;
        }

        .pack-page .card-reveal-effects.rarity-ssr span,
        .pack-page .card-reveal-effects.rarity-ur span,
        .pack-page .card-reveal-effects.rarity-sar span {
          color: #fde68a;
          background: linear-gradient(135deg, #fff, #fde047, #fb7185, #22d3ee);
          animation-duration: 1.24s;
        }

        .pack-page .card-reveal-effects.rarity-ur span,
        .pack-page .card-reveal-effects.rarity-sar span {
          --spark-size: 10px;
          box-shadow: 0 0 22px #fff, 0 0 36px #22d3ee;
        }

        .pack-page .card-reveal-effects span:nth-child(1) { --spark-x: -104px; --spark-y: -150px; animation-delay: 0.02s; }
        .pack-page .card-reveal-effects span:nth-child(2) { --spark-x: -56px; --spark-y: -178px; animation-delay: 0.09s; }
        .pack-page .card-reveal-effects span:nth-child(3) { --spark-x: 12px; --spark-y: -170px; animation-delay: 0.04s; }
        .pack-page .card-reveal-effects span:nth-child(4) { --spark-x: 86px; --spark-y: -140px; animation-delay: 0.12s; }
        .pack-page .card-reveal-effects span:nth-child(5) { --spark-x: 112px; --spark-y: -34px; animation-delay: 0.03s; }
        .pack-page .card-reveal-effects span:nth-child(6) { --spark-x: 72px; --spark-y: 94px; animation-delay: 0.1s; }
        .pack-page .card-reveal-effects span:nth-child(7) { --spark-x: -16px; --spark-y: 122px; animation-delay: 0.06s; }
        .pack-page .card-reveal-effects span:nth-child(8) { --spark-x: -96px; --spark-y: 72px; animation-delay: 0.14s; }
        .pack-page .card-reveal-effects span:nth-child(9) { --spark-x: -124px; --spark-y: -42px; animation-delay: 0.07s; }
        .pack-page .card-reveal-effects span:nth-child(10) { --spark-x: 126px; --spark-y: 48px; animation-delay: 0.16s; }

        @keyframes tenpackRevealGlobal {
          0% { transform: scale(0.65); opacity: 0; }
          60% { opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes tenpackRevealSSRGlobal {
          0% { transform: scale(0.55) rotate(-3deg); opacity: 0; }
          45% { transform: scale(1.12) rotate(2deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }

        @keyframes tenpackSweepGlobal {
          0% { opacity: 0; transform: translateX(-90%) rotate(18deg); }
          35% { opacity: 0.75; }
          100% { opacity: 0; transform: translateX(90%) rotate(18deg); }
        }

        @keyframes tenpackPrizeRingGlobal {
          to { transform: rotate(360deg); }
        }

        @keyframes tenpackPrizeCalloutGlobal {
          0% { opacity: 0; transform: translateX(-50%) translateY(8px) scale(0.76); }
          100% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
        }

        @keyframes rarityGlowGlobal {
          0% { box-shadow: 0 0 0 rgba(168, 85, 247, 0); }
          45% { box-shadow: 0 0 46px rgba(168, 85, 247, 0.64), 0 0 76px rgba(250, 204, 21, 0.36); }
          100% { box-shadow: 0 0 24px rgba(168, 85, 247, 0.3), 0 0 48px rgba(250, 204, 21, 0.2); }
        }

        @keyframes rarityGlowGoldGlobal {
          0% { box-shadow: 0 0 0 rgba(251, 191, 36, 0); }
          42% { box-shadow: 0 0 58px rgba(251, 191, 36, 0.82), 0 0 106px rgba(248, 113, 113, 0.42); }
          100% { box-shadow: 0 0 34px rgba(251, 191, 36, 0.42), 0 0 84px rgba(34, 211, 238, 0.18); }
        }

        @keyframes newBadgePulseGlobal {
          0%, 100% { box-shadow: 0 0 4px rgba(251, 191, 36, 0.4); }
          50% { box-shadow: 0 0 10px rgba(251, 191, 36, 0.8); }
        }

        @keyframes cardSparkGlobal {
          0% {
            transform: translate(-50%, -50%) scale(0.35);
            opacity: 0;
          }
          22% {
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) translate(var(--spark-x), var(--spark-y)) scale(0.08);
            opacity: 0;
          }
        }

        @media (max-width: 900px) {
          .pack-page {
            background:
              radial-gradient(circle at 30% 24%, rgba(168, 85, 247, 0.2), transparent 36%),
              radial-gradient(circle at 80% 58%, rgba(34, 211, 238, 0.16), transparent 34%),
              linear-gradient(180deg, rgba(2, 6, 23, 0.68), rgba(2, 6, 23, 0.82)),
              url("/ten-pack-result-bg.png") center top / cover no-repeat fixed !important;
          }

          .pack-page .tenpack-grid {
            grid-template-columns: repeat(5, minmax(0, 1fr));
          }
        }

        @media (max-width: 720px) {
          .pack-page .tenpack-grid-stage .tenpack-item {
            height: 150px;
          }
        }

        @media (max-width: 600px) {
          .pack-page .tenpack-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        .cheat-toast {
          position: fixed;
          bottom: 36px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 24px;
          border-radius: 20px;
          border: 1px solid rgba(250, 204, 21, 0.42);
          background: rgba(10, 14, 24, 0.96);
          box-shadow: 0 24px 56px rgba(0, 0, 0, 0.55);
          animation: cheat-pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
          white-space: nowrap;
          z-index: 9999;
        }
        .cheat-toast > span { font-size: 40px; }
        .cheat-toast strong {
          display: block;
          color: #fde68a;
          font-size: 11px;
          font-weight: 900;
        }
        .cheat-toast p {
          margin: 4px 0 0;
          color: white;
          font-size: 18px;
          font-weight: 900;
        }
        @keyframes cheat-pop {
          from { opacity: 0; transform: translateX(-50%) scale(0.72) translateY(20px); }
          to   { opacity: 1; transform: translateX(-50%) scale(1)    translateY(0); }
        }

        .pack-page .tenpack-stage-display.complete {
          width: min(100%, 1120px) !important;
          margin: 0 auto !important;
          padding: clamp(16px, 2vw, 24px) !important;
        }

        .pack-page .tenpack-stage-display.complete .tenpack-grid,
        .pack-page .tenpack-grid-panel {
          width: min(100%, 1080px) !important;
          max-width: 1080px !important;
          margin: 0 auto !important;
          grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
          gap: 12px !important;
        }

        .pack-page .tenpack-stage-display.complete .tenpack-item,
        .pack-page .tenpack-grid-panel .tenpack-item {
          height: auto !important;
          aspect-ratio: 3 / 4 !important;
          min-height: 0 !important;
        }

        .pack-page .tenpack-stage-display.complete .tenpack-card-face,
        .pack-page .tenpack-grid-panel .tenpack-card-face {
          border-radius: 16px !important;
          padding: 34px 10px 14px !important;
          justify-content: center !important;
          gap: 7px !important;
        }

        .pack-page .tenpack-stage-display.complete .tenpack-card-front:hover,
        .pack-page .tenpack-grid-panel .tenpack-card-front:hover {
          transform: none !important;
        }

        .pack-page .tenpack-stage-display.complete .tenpack-prize-callout,
        .pack-page .tenpack-grid-panel .tenpack-prize-callout {
          top: 32px !important;
          max-width: calc(100% - 24px) !important;
          padding: 4px 9px !important;
          font-size: 10px !important;
          letter-spacing: 0 !important;
        }

        .pack-page .tenpack-stage-display.complete .tenpack-item-emoji,
        .pack-page .tenpack-grid-panel .tenpack-item-emoji {
          font-size: clamp(42px, 4.5vw, 68px) !important;
          line-height: 1 !important;
        }

        .pack-page .tenpack-stage-display.complete .tenpack-item-rarity,
        .pack-page .tenpack-grid-panel .tenpack-item-rarity {
          font-size: clamp(11px, 1vw, 13px) !important;
          letter-spacing: 0 !important;
        }

        .pack-page .tenpack-stage-display.complete .tenpack-item-name,
        .pack-page .tenpack-grid-panel .tenpack-item-name {
          font-size: clamp(12px, 1.1vw, 15px) !important;
          line-height: 1.35 !important;
          padding: 0 4px !important;
        }

        .pack-page .tenpack-stage-head p {
          letter-spacing: 0 !important;
        }

        @media (max-width: 760px) {
          .pack-page .tenpack-stage-display.complete .tenpack-grid,
          .pack-page .tenpack-grid-panel {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            width: min(100%, 430px) !important;
          }
        }
      `}</style>

      {cheatToast && (
        <div className="cheat-toast">
          <span>G</span>
          <div>
            <strong>SECRET COMMAND</strong>
            <p>GOD PACK READY</p>
          </div>
        </div>
      )}
    </main>
  );
}
