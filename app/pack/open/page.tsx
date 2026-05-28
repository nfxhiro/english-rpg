"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { CSSProperties } from "react";
import CommonGameNav from "../../components/CommonGameNav";
import type { Rarity } from "../../../data/cards";
import { bgmPlayer } from "../../../data/bgm";
import {
  openStoredPack,
  PackOpenItem,
  PackOpenMode,
  saveLastPackOpenResult,
} from "../../../data/packStorage";

type Phase = "loading" | "charge" | "summon" | "godBurst" | "opening" | "done" | "error";

const rarityRank: Record<Rarity, number> = {
  N: 0,
  R: 1,
  SR: 2,
  SSR: 3,
  UR: 4,
  SAR: 5,
};

const rarityLabel: Record<Rarity, string> = {
  N: "ノーマル",
  R: "レア",
  SR: "スーパーレア",
  SSR: "レジェンド",
  UR: "アルティメット",
  SAR: "スペシャルアート",
};

function getMode(value: string | null): PackOpenMode {
  return value === "ten" ? "ten" : "single";
}

function isLegendRarity(rarity: Rarity) {
  return rarityRank[rarity] >= 3;
}

function getDropLabel(rarity: Rarity) {
  if (rarity === "SAR") return "SPECIAL ART";
  if (rarity === "UR") return "ULTIMATE DROP";
  if (rarity === "SSR") return "LEGEND DROP";
  if (rarity === "SR") return "EPIC DROP";
  return null;
}

function getRarityLabel(rarity: Rarity) {
  if (rarity === "SAR") return "スペシャルアート";
  if (rarity === "UR") return "アルティメット";
  if (rarity === "SSR") return "レジェンド";
  if (rarity === "SR") return "スーパーレア";
  if (rarity === "R") return "レア";
  return "ノーマル";
}

function getOpeningText(rarity: Rarity, isGodPack: boolean, revealed: boolean) {
  if (isGodPack) {
    return revealed ? "特別なパックから強い光が広がっています" : "いつもと違う重みのあるパックです";
  }

  if (rarity === "SAR") return revealed ? "特別な一枚が現れました" : "袋の奥で虹色の箔がきらめいています";
  if (rarity === "UR") return revealed ? "最高レアの輝きです" : "開け口から強い光が漏れています";
  if (rarity === "SSR") return revealed ? "大当たりのカードです" : "金色の反射が走っています";
  if (rarity === "SR") return revealed ? "レアなカードが出ました" : "少し厚みのあるカードが見えます";
  if (rarity === "R") return "カードのふちが光っています";
  return "次のカードを開封しています";
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

function renderCardRevealEffects(rarity: Rarity) {
  const sparkCount = rarity === "SAR" ? 24 : rarity === "UR" ? 20 : rarity === "SSR" ? 14 : 10;
  return (
    <div className={`card-reveal-effects rarity-${rarity.toLowerCase()}`} aria-hidden="true">
      {Array.from({ length: sparkCount }, (_, i) => (
        <span key={i} />
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

function getRevealDelay(rarity: Rarity, isLast: boolean) {
  const base =
    rarity === "SAR" ? 2000 :
    rarity === "UR" ? 1700 :
    rarity === "SSR" ? 1400 :
    rarity === "SR" ? 1100 :
    rarity === "R" ? 850 :
    700;

  return base + (isLast ? 250 : 0);
}

function getHoldDelay(rarity: Rarity, isLast: boolean) {
  const base =
    rarity === "SAR" ? 2200 :
    rarity === "UR" ? 1900 :
    rarity === "SSR" ? 1500 :
    rarity === "SR" ? 1200 :
    rarity === "R" ? 950 :
    800;

  return base + (isLast ? 350 : 0);
}

function getSummonText(rarity: Rarity, isGodPack: boolean, revealed: boolean) {
  if (isGodPack) {
    return revealed ? "すべての封印が共鳴している..." : "禁じられた召喚が始まる...";
  }

  if (rarity === "SAR") return revealed ? "神話級のカードが現れる..." : "星々が沈黙した...";
  if (rarity === "UR") return revealed ? "古の力が目覚める..." : "封印が砕け始めた...";
  if (rarity === "SSR") return revealed ? "ただならぬ気配がする..." : "空気が震えている...";
  if (rarity === "SR") return revealed ? "黄金の魔力が集まる..." : "強い光が漏れ出した...";
  if (rarity === "R") return "魔力がカードに宿る...";
  return "封印を解いています...";
}

function PackImage({ phase }: { phase: Phase }) {
  const imagePhase = phase === "opening" ? "opening" : phase;

  return (
    <div className={`pack-image pack-image-${imagePhase}`} aria-hidden="true">
      <Image
        src="/home-icons/pack.png"
        alt=""
        width={709}
        height={1179}
        priority
        sizes="101px"
      />
      <span className="pack-open-burst" />
    </div>
  );
}

function CardTile({
  item,
  index,
  revealed,
  current,
  godPack,
}: {
  item: PackOpenItem;
  index: number;
  revealed: boolean;
  current: boolean;
  godPack: boolean;
}) {
  const dropLabel = getDropLabel(item.card.rarity);

  return (
    <div
      className={`card-tile rarity-${item.card.rarity.toLowerCase()}${revealed ? " revealed" : " sealed"}${current ? " current" : ""}${godPack ? " god-marked" : ""}${item.isNew ? " new" : ""}`}
      style={{ "--i": index } as CSSProperties}
    >
      <i>{String(index + 1).padStart(2, "0")}</i>
      {revealed && item.isNew && <em>NEW</em>}
      {revealed && dropLabel && <small>{dropLabel}</small>}

      {revealed ? (
        <>
          <span className="tile-emoji">{item.card.monsterEmoji}</span>
          <b>{item.card.rarity} / {getRarityLabel(item.card.rarity)}</b>
          <strong>{item.card.name}</strong>
        </>
      ) : (
        <div className="card-back">
          <span className="cb-outer-ring" />
          <span className="cb-inner-ring" />
          <span className="cb-gem" />
        </div>
      )}
    </div>
  );
}

function PanelMonsterInfo({ item }: { item: PackOpenItem }) {
  const dropLabel = getDropLabel(item.card.rarity);

  return (
    <>
      {dropLabel && (
        <div className={`panel-drop-label label-${item.card.rarity.toLowerCase()}`}>
          {dropLabel}
        </div>
      )}
      <div className="panel-rarity-chip">{item.card.rarity} / {getRarityLabel(item.card.rarity)}</div>
      <div className="panel-monster-emoji">{item.card.monsterEmoji}</div>
      <div className="panel-status">{item.isNew ? "新しいカード" : "獲得済み"}</div>
      <div className="panel-card-name">{item.card.name}</div>
      <div className="panel-card-meta">
        {item.card.emoji} {item.card.attribute}属性 / {item.card.species}
      </div>
      <div className="panel-footer">
        <div className={item.isNew ? "panel-stage-chip new" : "panel-stage-chip"}>
          {item.isNew ? "NEW CARD" : `${item.ownedCopies}枚目`}
        </div>
      </div>
    </>
  );
}

function PackOpenContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = getMode(searchParams.get("mode"));
  const openId = searchParams.get("openId");
  const [phase, setPhase] = useState<Phase>("loading");
  const [items, setItems] = useState<PackOpenItem[]>([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState<Set<number>>(() => new Set());
  const [isGodPack, setIsGodPack] = useState(false);
  const [flashKey, setFlashKey] = useState(0);
  const [leftPanelReveal, setLeftPanelReveal] = useState<{ item: PackOpenItem; key: number } | null>(null);
  const [showGodOverlay, setShowGodOverlay] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  const openAreaRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (mode === "ten") {
      const readyKey = openId ? `pack-open-ready:${openId}` : "";
      const consumedKey = openId ? `pack-open-consumed:${openId}` : "";
      const canConsumeOpenRequest =
        openId &&
        sessionStorage.getItem(readyKey) === "1" &&
        sessionStorage.getItem(consumedKey) !== "1";

      if (!canConsumeOpenRequest) {
        router.replace("/pack");
        return;
      }
    }

    const timer = window.setTimeout(() => {
      if (mode === "ten" && openId) {
        sessionStorage.setItem(`pack-open-consumed:${openId}`, "1");
        sessionStorage.removeItem(`pack-open-ready:${openId}`);
      }

      const result = openStoredPack(mode);
      if (!result.ok) {
        setPhase("error");
        return;
      }

      setItems(result.items);
      setIsGodPack(result.isGodPack);
      saveLastPackOpenResult(mode, result.isGodPack, result.items);
      setDataReady(true);
    }, 260);

    return () => window.clearTimeout(timer);
  }, [mode, openId, router]);

  useEffect(() => {
    if (mode !== "ten" || !openId) return;

    function handlePageShow(event: PageTransitionEvent) {
      if (!event.persisted) return;
      if (sessionStorage.getItem(`pack-open-consumed:${openId}`) === "1") {
        router.replace("/pack");
      }
    }

    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [mode, openId, router]);

  useEffect(() => {
    if (!dataReady) return;

    const isTen = mode === "ten";
    const chargeMs = isTen ? 1600 : 0;
    const summonMs = isTen ? 1400 : 0;
    const timers: number[] = [];

    timers.push(window.setTimeout(() => { setPhase("charge"); }, 0));

    if (isTen) {
      timers.push(window.setTimeout(() => { setPhase("summon"); }, chargeMs));
    }

    timers.push(window.setTimeout(() => {
      if (isTen && isGodPack) {
        setShowGodOverlay(true);
        setPhase("godBurst");
      } else {
        bgmPlayer.playSfxPackOpen();
        setPhase("opening");
      }
    }, chargeMs + summonMs));

    if (isTen && isGodPack) {
      timers.push(window.setTimeout(() => {
        setShowGodOverlay(false);
        bgmPlayer.playSfxPackOpen();
        setPhase("opening");
      }, chargeMs + summonMs + 4200));
    }

    return () => { timers.forEach((t) => window.clearTimeout(t)); };
  }, [dataReady, isGodPack, mode]);

  const currentItem = items[index] ?? null;
  const currentRarity = currentItem?.card.rarity ?? "N";
  const currentIsLast = index === items.length - 1;
  const isTenPackResultScreen = mode === "ten" && phase === "done";
  const shouldShowTenPackBackground = mode === "ten" && phase !== "error";
  const openedCount = revealed.size;
  const openingText = getOpeningText(currentRarity, isGodPack, revealed.has(index));
  const bestItem = useMemo(() => {
    if (!items.length) return null;
    return items.reduce((best, item) =>
      rarityRank[item.card.rarity] > rarityRank[best.card.rarity] ? item : best
    );
  }, [items]);

  const advance = useCallback(() => {
    setIndex((currentIndex) => {
      const next = currentIndex + 1;
      if (next >= items.length) {
        setPhase("done");
        return currentIndex;
      }
      return next;
    });
  }, [items.length]);


  useEffect(() => {
    if (phase !== "opening" || !currentItem || revealed.has(index)) return;

    const revealTimer = window.setTimeout(() => {
      bgmPlayer.playSfxCardFlip();
      setRevealed((prev) => new Set(prev).add(index));
      bgmPlayer.playSfxReveal(currentItem.card.rarity);
      setLeftPanelReveal({ item: currentItem, key: Date.now() });

      if (rarityRank[currentItem.card.rarity] >= 2) setFlashKey((key) => key + 1);
      if (isLegendRarity(currentItem.card.rarity)) {
        if (typeof navigator !== "undefined" && "vibrate" in navigator) {
          navigator.vibrate(currentItem.card.rarity === "SAR" ? [25, 45, 80] : 35);
        }
      }
    }, getRevealDelay(currentItem.card.rarity, currentIsLast));

    return () => window.clearTimeout(revealTimer);
  }, [currentIsLast, currentItem, index, phase, revealed]);

  useEffect(() => {
    if (phase !== "opening" || !currentItem || !revealed.has(index)) return;

    const holdTimer = window.setTimeout(
      advance,
      getHoldDelay(currentItem.card.rarity, currentIsLast),
    );

    return () => window.clearTimeout(holdTimer);
  }, [advance, currentIsLast, currentItem, index, phase, revealed]);

  function skip() {
    setRevealed(new Set(items.map((_, itemIndex) => itemIndex)));
    setPhase("done");
  }

  return (
    <main className={`pack-open-page mode-${mode} rarity-${currentRarity.toLowerCase()} phase-${phase}${isGodPack ? " god-pack" : ""}${shouldShowTenPackBackground ? " tenpack-result-bg" : ""}`}>
      {flashKey > 0 && <div key={flashKey} className={`screen-flash rarity-${currentRarity.toLowerCase()}`} aria-hidden="true" />}

      {/* ── プレリュード（魔法陣チャージ） — portal で body 直下にマウント ── */}
      {(phase === "charge" || phase === "summon") && createPortal(
        <div className={`ten-prelude ten-prelude-${phase}`} aria-hidden="true">
          <div className="prelude-bg" />
          <div className="prelude-circle" />
          <div className="prelude-ring prelude-ring-1" />
          <div className="prelude-ring prelude-ring-2" />
          <div className="prelude-ring prelude-ring-3" />
          <div className="prelude-particles">
            {Array.from({ length: 28 }, (_, i) => <span key={i} style={{ "--pi": i } as CSSProperties} />)}
          </div>
          {phase === "summon" && (
            <div className={`prelude-pack${isGodPack ? " god-charge" : ""}`}>
              <PackImage phase="loading" />
            </div>
          )}
        </div>,
        document.body
      )}

      {/* ── GODパック演出オーバーレイ — portal で body 直下にマウント ── */}
      {showGodOverlay && createPortal(
        <div className="god-burst-overlay" aria-hidden="true">
          <div className="god-darkness" />
          <div className="god-magic-circle" />
          <div className="god-magic-circle god-magic-circle-inner" />
          <div className="god-cracks">
            {Array.from({ length: 8 }, (_, i) => (
              <span key={i} style={{ "--ci": i } as CSSProperties} />
            ))}
          </div>
          <div className="god-pillars">
            {Array.from({ length: 5 }, (_, i) => (
              <span key={i} style={{ "--pi": i } as CSSProperties} />
            ))}
          </div>
          {(["🐉","👹","💀","🦇","🐺","🐍","👿"] as const).map((emoji, i) => (
            <div key={i} className={`god-monster god-monster-${i}`} style={{ "--mi": i } as CSSProperties}>
              {emoji}
            </div>
          ))}
          <div className="god-particles">
            {Array.from({ length: 40 }, (_, i) => (
              <span key={i} style={{ "--gi": i } as CSSProperties} />
            ))}
          </div>
          <div className="god-text-container">
            <div className="god-text-en">GOD PACK</div>
            <div className="god-text-ja">神引き確定</div>
          </div>
        </div>,
        document.body
      )}

      <section className="open-shell" aria-live="polite">
        {phase === "error" ? (
          <div className="error-panel">
            <p>開封できません</p>
            <h1>チケットが足りません</h1>
            <span>パック画面でチケットを用意してから、もう一度開封してください。</span>
            <a href="/pack">パック画面へ戻る</a>
          </div>
        ) : (
          <>
            <div className="summon-layout">
              <aside className="pack-panel">
                {isTenPackResultScreen && bestItem ? (
                  <div className={`pack-panel-frame result-card result-best revealed rarity-${bestItem.card.rarity.toLowerCase()}`}>
                    <PanelMonsterInfo item={bestItem} />
                  </div>
                ) : leftPanelReveal && phase === "opening" ? (
                  <div
                    key={leftPanelReveal.key}
                    className={`pack-display opened rarity-${leftPanelReveal.item.card.rarity.toLowerCase()}${getPrizeRevealClass(leftPanelReveal.item.card.rarity)}`}
                  >
                    <div className="eq-display-shine" />
                    {renderCardRevealEffects(leftPanelReveal.item.card.rarity)}
                    {getDropLabel(leftPanelReveal.item.card.rarity) && (
                      <div className={`pack-rarity-callout callout-${leftPanelReveal.item.card.rarity.toLowerCase()}`}>
                        {getDropLabel(leftPanelReveal.item.card.rarity)}
                      </div>
                    )}
                    <div className="pack-card-rarity">
                      {leftPanelReveal.item.card.rarity} / {rarityLabel[leftPanelReveal.item.card.rarity]}
                    </div>
                    <div className="pack-result-emoji">{leftPanelReveal.item.card.monsterEmoji}</div>
                    <p>{leftPanelReveal.item.isNew ? "新しいカード" : "獲得済み"}</p>
                    <h2>{leftPanelReveal.item.card.name}</h2>
                    <span className="pack-display-meta">
                      {leftPanelReveal.item.card.emoji} {leftPanelReveal.item.card.attribute}属性 /{" "}
                      {leftPanelReveal.item.card.species}
                    </span>
                    <div className={leftPanelReveal.item.isNew ? "pack-stage-chip new" : "pack-stage-chip"}>
                      {leftPanelReveal.item.isNew ? "新しいカード!" : `${leftPanelReveal.item.ownedCopies}枚目`}
                    </div>
                  </div>
                ) : (
                  <div className="pack-display">
                    <div className="eq-display-shine" />
                    <PackImage phase="loading" />
                    <p>パック開封</p>
                    <h2>開封中...</h2>
                  </div>
                )}
              </aside>

              <section className="cards-panel" ref={openAreaRef}>
                <header className="result-head">
                  <div>
                    <p>{mode === "ten" ? "10 PACK RESULT" : "PACK RESULT"}</p>
                    <h1>{phase === "done" ? (mode === "ten" ? "10連開封完了!" : "開封完了!") : "カード開封中"}</h1>
                  </div>
                  {isGodPack && phase === "opening" && <div className="god-pack-omen">GOD PACK 開封中</div>}
                  {isGodPack && phase === "done" && <div className="god-pack-badge">GOD PACK</div>}
                </header>

                <div className="cards-grid">
                  {items.map((item, itemIndex) => (
                    <CardTile
                      key={`${item.card.id}-${itemIndex}`}
                      item={item}
                      index={itemIndex}
                      revealed={revealed.has(itemIndex)}
                      current={phase === "opening" && itemIndex === index}
                      godPack={isGodPack}
                    />
                  ))}
                </div>

                <nav className="result-actions">
                  {phase !== "done" ? (
                    <button type="button" onClick={skip} disabled={items.length === 0}>
                      スキップ
                    </button>
                  ) : (
                    <div className="result-nav-icons">
                      <CommonGameNav />
                    </div>
                  )}
                </nav>
              </section>
            </div>
          </>
        )}
      </section>

      <style jsx global>{`
        .pack-open-page {
          position: relative;
          min-height: 100dvh;
          overflow: hidden;
          display: grid;
          place-items: center;
          padding: 18px;
          color: #fff;
          background:
            radial-gradient(circle at 22% 26%, rgba(168, 85, 247, 0.18), transparent 30%),
            radial-gradient(circle at 82% 76%, rgba(34, 211, 238, 0.16), transparent 30%),
            linear-gradient(180deg, #020617 0%, #07111f 56%, #020617 100%);
        }

        .pack-open-page.tenpack-result-bg {
          background: #020617;
        }

        .pack-open-page.tenpack-result-bg::before,
        .pack-open-page.tenpack-result-bg::after {
          content: "";
          position: fixed;
          inset: 0;
          pointer-events: none;
        }

        .pack-open-page.tenpack-result-bg::before {
          z-index: 0;
          background-image: url("/ten-pack-result-bg.png");
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          transform: scale(1.02);
        }

        .pack-open-page.tenpack-result-bg::after {
          z-index: 1;
          background:
            radial-gradient(circle at 20% 45%, rgba(168, 85, 247, 0.24), transparent 38%),
            radial-gradient(circle at 82% 60%, rgba(34, 211, 238, 0.2), transparent 36%),
            linear-gradient(180deg, rgba(2, 6, 23, 0.52), rgba(2, 6, 23, 0.68));
        }

        .pack-open-page.tenpack-result-bg .open-shell {
          position: relative;
          z-index: 2;
        }

        .screen-flash {
          position: fixed;
          inset: 0;
          z-index: 20;
          pointer-events: none;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.28), transparent 62%);
          animation: flashOut 0.42s ease both;
        }
        .screen-flash.rarity-sr  { background: radial-gradient(circle, rgba(250, 204, 21, 0.42), rgba(168, 85, 247, 0.18) 42%, transparent 68%); animation-duration: 0.34s; }
        .screen-flash.rarity-ssr { background: radial-gradient(circle, rgba(250, 204, 21, 0.48), rgba(2, 6, 23, 0.58) 44%, transparent 72%); animation: flashOutLegend 0.52s ease both; }
        .screen-flash.rarity-ur  { background: linear-gradient(115deg, transparent 18%, rgba(127, 29, 29, 0.46) 38%, rgba(250, 204, 21, 0.32) 45%, transparent 58%), rgba(2, 6, 23, 0.18); animation-duration: 0.46s; }
        .screen-flash.rarity-sar {
          background:
            radial-gradient(circle, rgba(245, 243, 255, 0.42), rgba(91, 33, 182, 0.34) 38%, rgba(2, 6, 23, 0.48) 62%, transparent 76%);
          animation: flashOutSAR 0.64s ease both;
        }
        @keyframes flashOutLegend {
          0%   { opacity: 0.92; filter: brightness(0.3); }
          24%  { opacity: 0.88; filter: brightness(1.5); }
          100% { opacity: 0; filter: brightness(1); }
        }
        @keyframes flashOutSAR {
          0%   { opacity: 0; transform: scale(0.94); filter: brightness(1.6); }
          24%  { opacity: 0.95; }
          100% { opacity: 0; transform: scale(1.12); filter: brightness(1); }
        }
        .pack-open-page.phase-done .cards-grid {
          animation: gridDoneReveal 0.65s cubic-bezier(0.18, 1.26, 0.32, 1) both;
        }
        @keyframes gridDoneReveal {
          from { transform: scale(0.95) translateY(8px); opacity: 0.65; }
          to   { transform: scale(1) translateY(0); opacity: 1; }
        }

        /* ============================================
           TEN-PACK PRELUDE — 魔法陣チャージ演出
        ============================================ */
        .ten-prelude {
          position: fixed;
          inset: 0;
          z-index: 150;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          pointer-events: none;
        }

        .prelude-bg {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 50% 50%, rgba(88, 28, 135, 0.55) 0%, transparent 60%),
            radial-gradient(circle at 30% 70%, rgba(34, 211, 238, 0.18) 0%, transparent 45%),
            rgba(4, 2, 20, 0.97);
          animation: preludeBgIn 0.3s ease both;
        }
        @keyframes preludeBgIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        .prelude-circle {
          position: absolute;
          inset: 0;
          margin: auto;
          width: 56vmin;
          height: 56vmin;
          border-radius: 50%;
          border: 2px solid rgba(168, 85, 247, 0.7);
          box-shadow:
            0 0 60px rgba(168, 85, 247, 0.45),
            0 0 120px rgba(168, 85, 247, 0.2),
            inset 0 0 50px rgba(34, 211, 238, 0.15);
          animation: magicCircleExpand 1.4s cubic-bezier(0.15, 1.1, 0.3, 1) both;
        }
        .ten-prelude-summon .prelude-circle {
          animation: magicCirclePulse 0.55s ease-in-out infinite alternate;
          border-color: rgba(250, 204, 21, 0.8);
          box-shadow: 0 0 80px rgba(250, 204, 21, 0.5), 0 0 160px rgba(168, 85, 247, 0.3), inset 0 0 60px rgba(250, 204, 21, 0.1);
        }

        .prelude-ring {
          position: absolute;
          inset: 0;
          margin: auto;
          border-radius: 50%;
          border: 1px solid rgba(250, 204, 21, 0.35);
          animation: ringExpand 1.4s ease both;
        }
        .prelude-ring-1 { width: 42vmin; height: 42vmin; animation-delay: 0.18s; }
        .prelude-ring-2 { width: 68vmin; height: 68vmin; border-color: rgba(34, 211, 238, 0.28); animation-delay: 0.35s; }
        .prelude-ring-3 { width: 88vmin; height: 88vmin; border-color: rgba(168, 85, 247, 0.18); animation-delay: 0.55s; }
        .ten-prelude-summon .prelude-ring {
          animation: ringPulse 0.7s ease-in-out infinite alternate;
        }

        .prelude-particles { position: absolute; inset: 0; }
        .prelude-particles span {
          position: absolute;
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: rgba(250, 204, 21, 0.8);
          top: 50%;
          left: 50%;
          margin: -1.5px;
          transform-origin: 0 0;
          animation: particleOrbit 2s linear infinite;
          animation-delay: calc(var(--pi, 0) * -0.0714s);
          filter: blur(0.5px);
        }

        .prelude-pack {
          position: relative;
          z-index: 5;
          width: 100px;
          animation: packSummonShake 0.18s ease-in-out infinite alternate;
          filter: drop-shadow(0 0 28px rgba(168, 85, 247, 0.6));
        }
        .prelude-pack.god-charge {
          animation: packGodShake 0.12s ease-in-out infinite alternate;
          filter: drop-shadow(0 0 40px rgba(250, 204, 21, 0.9)) drop-shadow(0 0 20px rgba(255, 100, 50, 0.6));
        }

        .prelude-text {
          display: none;
        }

        @keyframes magicCircleExpand {
          from { transform: scale(0.08) rotate(-180deg); opacity: 0.6; }
          to   { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes magicCirclePulse {
          from { transform: scale(0.95) rotate(0deg);   box-shadow: 0 0 40px rgba(250, 204, 21, 0.4), inset 0 0 30px rgba(250, 204, 21, 0.08); }
          to   { transform: scale(1.05) rotate(3deg);   box-shadow: 0 0 110px rgba(250, 204, 21, 0.7), inset 0 0 60px rgba(250, 204, 21, 0.18); }
        }
        @keyframes ringExpand {
          from { transform: scale(0.12); opacity: 0.5; }
          to   { transform: scale(1); opacity: 1; }
        }
        @keyframes ringPulse {
          from { transform: scale(0.97); opacity: 0.6; }
          to   { transform: scale(1.03); opacity: 1; }
        }
        @keyframes particleOrbit {
          from { transform: rotate(0deg)    translateX(22vmin); }
          to   { transform: rotate(360deg)  translateX(22vmin); }
        }
        @keyframes packSummonShake {
          from { transform: rotate(-2deg) scale(1); }
          to   { transform: rotate(2deg) scale(1.02); }
        }
        @keyframes packGodShake {
          from { transform: rotate(-4deg) scale(0.97) translateX(-3px); }
          to   { transform: rotate(4deg) scale(1.05) translateX(3px); }
        }
        @keyframes fadeInText {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 0.85; transform: translateY(0); }
        }

        /* ============================================
           GOD PACK BURST OVERLAY
        ============================================ */
        .god-burst-overlay {
          position: fixed;
          inset: 0;
          z-index: 200;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          pointer-events: none;
          animation: godOverlayFadeIn 0.35s ease both;
        }
        @keyframes godOverlayFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        .god-darkness {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 50%, rgba(18, 4, 48, 0.97), rgba(1, 0, 8, 0.99));
        }

        .god-magic-circle {
          position: absolute;
          inset: 0;
          margin: auto;
          width: 78vmin;
          height: 78vmin;
          border-radius: 50%;
          border: 3px solid rgba(250, 204, 21, 0.85);
          box-shadow:
            0 0 70px rgba(250, 204, 21, 0.5),
            0 0 140px rgba(168, 85, 247, 0.35),
            inset 0 0 70px rgba(250, 204, 21, 0.12);
          animation: godCircleExpand 1.3s cubic-bezier(0.1, 1.15, 0.3, 1) both;
        }
        .god-magic-circle-inner {
          width: 52vmin;
          height: 52vmin;
          border-color: rgba(34, 211, 238, 0.6);
          box-shadow: 0 0 40px rgba(34, 211, 238, 0.4), inset 0 0 40px rgba(34, 211, 238, 0.08);
          animation-delay: 0.2s;
          animation-direction: reverse;
        }
        @keyframes godCircleExpand {
          from { transform: scale(0.05) rotate(-270deg); opacity: 0; }
          to   { transform: scale(1) rotate(0deg); opacity: 1; }
        }

        /* クラック */
        .god-cracks { position: absolute; inset: 0; z-index: 3; overflow: hidden; }
        .god-cracks span {
          position: absolute;
          top: 50%;
          left: 50%;
          height: 2px;
          width: 65vw;
          background: linear-gradient(90deg, rgba(250, 204, 21, 0.95), rgba(255, 255, 255, 0.6) 15%, transparent 80%);
          transform-origin: left center;
          animation: godCrack 0.7s ease-out both;
          animation-delay: calc(0.5s + var(--ci, 0) * 0.055s);
          opacity: 0;
        }
        .god-cracks span:nth-child(1) { transform: rotate(0deg); }
        .god-cracks span:nth-child(2) { transform: rotate(45deg); }
        .god-cracks span:nth-child(3) { transform: rotate(90deg); }
        .god-cracks span:nth-child(4) { transform: rotate(135deg); }
        .god-cracks span:nth-child(5) { transform: rotate(180deg); }
        .god-cracks span:nth-child(6) { transform: rotate(225deg); }
        .god-cracks span:nth-child(7) { transform: rotate(270deg); }
        .god-cracks span:nth-child(8) { transform: rotate(315deg); }
        @keyframes godCrack {
          from { opacity: 0; clip-path: inset(0 100% 0 0); }
          30%  { opacity: 1; }
          to   { opacity: 0.7; clip-path: inset(0 0% 0 0); }
        }

        /* 光の柱 */
        .god-pillars { position: absolute; inset: 0; z-index: 4; overflow: hidden; }
        .god-pillars span {
          position: absolute;
          bottom: 0;
          width: 6px;
          height: 100%;
          background: linear-gradient(to top, transparent 0%, rgba(250, 204, 21, 0.5) 30%, rgba(255, 255, 255, 0.9) 50%, rgba(250, 204, 21, 0.5) 70%, transparent 100%);
          filter: blur(4px);
          animation: pillarRise 1.1s ease both;
          animation-delay: calc(0.25s + var(--pi, 0) * 0.12s);
          opacity: 0;
          left: calc(10% + var(--pi, 0) * 20%);
        }
        @keyframes pillarRise {
          from { opacity: 0; transform: scaleY(0); transform-origin: bottom; }
          40%  { opacity: 1; }
          to   { opacity: 0.8; transform: scaleY(1); transform-origin: bottom; }
        }

        /* モンスター */
        .god-monster {
          position: absolute;
          font-size: 13vmin;
          z-index: 6;
          line-height: 1;
          filter: drop-shadow(0 0 22px rgba(250, 204, 21, 0.7)) brightness(0.65) saturate(0.45) contrast(1.1);
          animation: monsterBurst 1.1s cubic-bezier(0.15, 1.3, 0.3, 1) both;
          animation-delay: calc(0.28s + var(--mi, 0) * 0.09s);
          opacity: 0;
        }
        .god-monster-0 { top: 8%;    left: 4%;   transform-origin: 20% 20%; }
        .god-monster-1 { top: 6%;    right: 5%;  transform-origin: 80% 20%; }
        .god-monster-2 { bottom: 8%; left: 6%;   transform-origin: 18% 80%; }
        .god-monster-3 { bottom: 6%; right: 4%;  transform-origin: 82% 80%; }
        .god-monster-4 { top: 42%;   left: -2%;  transform-origin: 5%  50%; font-size: 11vmin; }
        .god-monster-5 { top: 42%;   right: -2%; transform-origin: 95% 50%; font-size: 11vmin; }
        .god-monster-6 {
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          font-size: 22vmin;
          z-index: 5;
          filter: drop-shadow(0 0 50px rgba(250, 204, 21, 1)) brightness(0.45) saturate(0.3) contrast(1.2);
          animation-delay: 0.7s;
          transform-origin: center center;
        }
        @keyframes monsterBurst {
          from { opacity: 0; transform: scale(0.08) rotate(-20deg); filter: drop-shadow(0 0 50px rgba(250, 204, 21, 1)) brightness(0.35) saturate(0.25) blur(12px); }
          55%  { opacity: 0.95; filter: drop-shadow(0 0 28px rgba(250, 204, 21, 0.8)) brightness(0.65) saturate(0.45) blur(0); }
          to   { opacity: 0.82; transform: scale(1) rotate(0deg); }
        }

        /* パーティクル */
        .god-particles { position: absolute; inset: 0; z-index: 3; pointer-events: none; }
        .god-particles span {
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          top: calc(30% + (var(--gi, 0) * 1.4%));
          left: calc(5%  + (var(--gi, 0) * 2.3%));
          background: rgba(250, 204, 21, 0.9);
          animation: godParticle 2.4s ease both;
          animation-delay: calc(var(--gi, 0) * 0.06s);
          opacity: 0;
          filter: blur(0.5px);
        }
        .god-particles span:nth-child(even) { background: rgba(168, 85, 247, 0.9); width: 3px; height: 3px; }
        .god-particles span:nth-child(3n)   { background: rgba(34, 211, 238, 0.9); }
        @keyframes godParticle {
          0%   { opacity: 0; transform: translate(0, 0) scale(0); }
          20%  { opacity: 1; transform: translate(calc(var(--gi, 0) * 1.5px - 30px), calc(var(--gi, 0) * -1.2px - 20px)) scale(1); }
          100% { opacity: 0; transform: translate(calc(var(--gi, 0) * 4px - 80px), calc(var(--gi, 0) * -3px - 80px)) scale(0.3); }
        }

        /* GODテキスト */
        .god-text-container {
          position: absolute;
          z-index: 10;
          text-align: center;
          animation: godTextPop 0.55s cubic-bezier(0.15, 1.6, 0.3, 1) 1.6s both;
          opacity: 0;
        }
        .god-text-en {
          font-size: clamp(42px, 13vw, 96px);
          font-weight: 1000;
          letter-spacing: 0.12em;
          line-height: 1;
          background: linear-gradient(135deg, #fde047 0%, #fb923c 40%, #fde047 80%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0 0 28px rgba(250, 204, 21, 0.9));
        }
        .god-text-ja {
          font-size: clamp(14px, 4vw, 26px);
          font-weight: 900;
          color: #e9d5ff;
          letter-spacing: 0.35em;
          margin-top: 10px;
          animation: godTextPop 0.45s cubic-bezier(0.15, 1.6, 0.3, 1) 2.1s both;
          opacity: 0;
        }
        @keyframes godTextPop {
          from { opacity: 0; transform: scale(0.25) translateY(24px); filter: blur(14px); }
          to   { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); }
        }

        /* ============================================
           カードタイル — opening演出強化
        ============================================ */
        .pack-open-page.mode-ten.phase-opening .card-tile.sealed {
          animation: cardTileAwaken 0.45s ease-in-out infinite alternate;
        }
        .pack-open-page.mode-ten.phase-opening .card-tile.current.sealed {
          animation: cardTileCurrentPulse 0.28s ease-in-out infinite alternate;
          z-index: 2;
        }
        @keyframes cardTileAwaken {
          from { box-shadow: inset 0 0 8px rgba(168, 85, 247, 0.12); }
          to   { box-shadow: inset 0 0 18px rgba(168, 85, 247, 0.4), 0 0 10px rgba(168, 85, 247, 0.18); }
        }
        @keyframes cardTileCurrentPulse {
          from { transform: scale(1);    box-shadow: 0 0 12px rgba(250, 204, 21, 0.45), inset 0 0 10px rgba(250, 204, 21, 0.15); }
          to   { transform: scale(1.03); box-shadow: 0 0 36px rgba(250, 204, 21, 0.85), inset 0 0 20px rgba(250, 204, 21, 0.3); }
        }
        /* GODパック時のカードタイル待機演出 */
        .pack-open-page.mode-ten.phase-opening.god-pack .card-tile.sealed {
          animation: cardTileGodAwaken 0.38s ease-in-out infinite alternate;
        }
        @keyframes cardTileGodAwaken {
          from { box-shadow: inset 0 0 8px rgba(250, 204, 21, 0.1); }
          to   { box-shadow: inset 0 0 24px rgba(250, 204, 21, 0.5), 0 0 14px rgba(250, 204, 21, 0.28); }
        }

        .open-shell {
          width: min(100%, 1120px);
          display: grid;
          gap: 12px;
        }

        .summon-layout {
          display: grid;
          grid-template-columns: minmax(210px, 280px) minmax(0, 1fr);
          align-items: stretch;
          gap: 16px;
        }

        .pack-panel,
        .cards-panel {
          min-width: 0;
        }

        .pack-panel-frame {
          position: relative;
          overflow: hidden;
          height: 100%;
          min-height: 430px;
          display: grid;
          place-items: center;
          align-content: center;
          gap: 12px;
          border: 4px solid transparent;
          border-radius: 28px;
          padding: 20px;
          text-align: center;
          background:
            linear-gradient(#050816, #050816) padding-box,
            linear-gradient(160deg, #fde047, #a855f7, #22d3ee) border-box;
          box-shadow: 0 30px 90px rgba(0, 0, 0, 0.38);
        }

        .pack-open-page.tenpack-result-bg .pack-panel-frame {
          border-color: rgba(255, 255, 255, 0.12);
          background:
            radial-gradient(circle at 50% 28%, rgba(168, 85, 247, 0.16), transparent 48%),
            linear-gradient(180deg, rgba(15, 23, 42, 0.58), rgba(2, 6, 23, 0.72));
          box-shadow:
            0 30px 90px rgba(0, 0, 0, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(8px);
        }

        .pack-open-page.mode-ten .pack-panel-frame,
        .pack-panel-frame.result-card {
          width: min(100%, 252px);
          height: 352px;
          min-height: 352px;
          max-height: 352px;
          align-self: center;
          justify-self: center;
          align-content: center;
          gap: 8px;
          padding: 18px;
          border-radius: 32px;
          grid-template-columns: 1fr;
          text-align: center;
        }

        .pack-open-page.mode-ten .pack-panel-frame {
          border: 0;
          background: linear-gradient(135deg, #facc15, #a855f7, #22d3ee);
          box-shadow:
            0 0 70px rgba(168, 85, 247, 0.32),
            0 30px 90px rgba(0, 0, 0, 0.5);
        }

        .pack-open-page.mode-ten .pack-panel-frame::before {
          content: "";
          position: absolute;
          inset: 4px;
          z-index: 0;
          border-radius: 28px;
          background:
            radial-gradient(circle at 50% 16%, rgba(255, 255, 255, 0.16), transparent 40%),
            #050816;
          pointer-events: none;
        }

        .pack-open-page.mode-ten .pack-panel-frame:not(.result-card) .pack-image {
          width: 101px;
        }

        .pack-panel-frame.result-card .panel-monster-emoji {
          font-size: 64px;
        }

        .pack-panel-frame.result-card .panel-card-name {
          font-size: 21px;
        }

        /* ── BEST CARD バッジ ── */
        .pack-panel-frame.result-best::after {
          content: "✦ BEST CARD ✦";
          position: absolute;
          top: 12px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #fde047, #fb923c);
          color: #111827;
          font-size: 10px;
          font-weight: 1000;
          letter-spacing: 0.2em;
          padding: 4px 14px;
          border-radius: 999px;
          white-space: nowrap;
          z-index: 10;
          box-shadow: 0 4px 18px rgba(250, 204, 21, 0.45);
          animation: bestBadgePop 0.5s cubic-bezier(0.2, 1.5, 0.3, 1) 0.4s both;
        }
        @keyframes bestBadgePop {
          from { transform: translateX(-50%) scale(0.4); opacity: 0; }
          to   { transform: translateX(-50%) scale(1);   opacity: 1; }
        }

        /* ── レアリティ別パネル背景 ── */
        .pack-panel-frame.revealed {
          background: linear-gradient(160deg, rgba(8, 14, 30, 0.97), rgba(2, 6, 23, 0.99));
          animation: panelReveal 0.62s cubic-bezier(0.18, 1.25, 0.34, 1) both;
        }

        .pack-panel-frame.revealed.rarity-n {
          border-color: rgba(100, 116, 139, 0.65);
          box-shadow: 0 0 28px rgba(100, 116, 139, 0.22), 0 30px 90px rgba(0,0,0,0.38);
        }

        .pack-open-page.mode-ten .pack-panel-frame.revealed {
          background: linear-gradient(135deg, #facc15, #a855f7, #22d3ee);
        }

        .pack-panel-frame.revealed.rarity-r {
          border-color: rgba(34, 211, 238, 0.75);
          box-shadow: 0 0 64px rgba(34, 211, 238, 0.5), 0 30px 90px rgba(0,0,0,0.38);
        }

        .pack-panel-frame.revealed.rarity-sr {
          border-color: rgba(168, 85, 247, 0.85);
          box-shadow: 0 0 96px rgba(168, 85, 247, 0.55), 0 30px 90px rgba(0,0,0,0.38);
          animation: panelReveal 0.62s cubic-bezier(0.18, 1.25, 0.34, 1) both,
                     panelSRGlow 1.8s ease 0.62s infinite alternate;
        }

        .pack-panel-frame.revealed.rarity-ssr {
          border-color: rgba(250, 204, 21, 0.88);
          box-shadow: 0 0 80px rgba(250, 204, 21, 0.68), 0 0 130px rgba(234, 88, 12, 0.38);
          animation: panelReveal 0.62s cubic-bezier(0.18, 1.25, 0.34, 1) both,
                     panelSSRPulse 1.5s ease 0.62s infinite alternate;
        }

        .pack-panel-frame.revealed.rarity-ur {
          border-color: rgba(255, 255, 255, 0.72);
          box-shadow: 0 0 80px rgba(255,255,255,0.85), 0 0 160px rgba(34,211,238,0.55);
          animation: panelReveal 0.62s cubic-bezier(0.18, 1.25, 0.34, 1) both,
                     panelURRainbow 2.4s linear 0.62s infinite;
        }

        .pack-panel-frame.revealed.rarity-sar {
          border-color: rgba(245, 243, 255, 0.82);
          box-shadow: 0 0 76px rgba(245, 243, 255, 0.58), 0 0 150px rgba(88, 28, 135, 0.58);
          animation: panelReveal 0.62s cubic-bezier(0.18, 1.25, 0.34, 1) both,
                     panelSARMyth 2.2s ease-in-out 0.62s infinite alternate;
        }

        /* ── スパーク ── */
        .panel-sparks {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
        }

        .panel-sparks span {
          --spark-x: 0px;
          --spark-y: -120px;
          --spark-size: 8px;
          position: absolute;
          left: 50%;
          top: 46%;
          width: var(--spark-size);
          height: var(--spark-size);
          border-radius: 999px;
          background: #e2e8f0;
          box-shadow: 0 0 16px currentColor;
          color: #e2e8f0;
          opacity: 0;
          animation: panelSpark 0.9s ease-out both;
        }

        .panel-sparks.rarity-r span { color: #22d3ee; background: #67e8f9; animation-duration: 0.84s; }
        .panel-sparks.rarity-sr span { color: #fde047; background: linear-gradient(135deg, #fde047, #a855f7); animation-duration: 1.04s; }
        .panel-sparks.rarity-ssr span,
        .panel-sparks.rarity-ur span,
        .panel-sparks.rarity-sar span {
          color: #fde68a;
          background: linear-gradient(135deg, #fff, #fde047, #fb7185, #22d3ee);
          animation-duration: 1.24s;
        }
        .panel-sparks.rarity-ur span,
        .panel-sparks.rarity-sar span { --spark-size: 10px; box-shadow: 0 0 22px #fff, 0 0 36px #22d3ee; }

        .panel-sparks span:nth-child(1)  { --spark-x: -104px; --spark-y: -150px; animation-delay: 0.02s; }
        .panel-sparks span:nth-child(2)  { --spark-x: -56px;  --spark-y: -178px; animation-delay: 0.09s; }
        .panel-sparks span:nth-child(3)  { --spark-x: 12px;   --spark-y: -170px; animation-delay: 0.04s; }
        .panel-sparks span:nth-child(4)  { --spark-x: 86px;   --spark-y: -140px; animation-delay: 0.12s; }
        .panel-sparks span:nth-child(5)  { --spark-x: 112px;  --spark-y: -34px;  animation-delay: 0.03s; }
        .panel-sparks span:nth-child(6)  { --spark-x: 72px;   --spark-y: 94px;   animation-delay: 0.10s; }
        .panel-sparks span:nth-child(7)  { --spark-x: -16px;  --spark-y: 122px;  animation-delay: 0.06s; }
        .panel-sparks span:nth-child(8)  { --spark-x: -96px;  --spark-y: 72px;   animation-delay: 0.14s; }
        .panel-sparks span:nth-child(9)  { --spark-x: -124px; --spark-y: -42px;  animation-delay: 0.07s; }
        .panel-sparks span:nth-child(10) { --spark-x: 126px;  --spark-y: 48px;   animation-delay: 0.16s; }
        .panel-sparks span:nth-child(11) { --spark-x: 48px;   --spark-y: -166px; animation-delay: 0.05s; }
        .panel-sparks span:nth-child(12) { --spark-x: -78px;  --spark-y: 118px;  animation-delay: 0.11s; }
        .panel-sparks span:nth-child(13) { --spark-x: 140px;  --spark-y: -88px;  animation-delay: 0.08s; }
        .panel-sparks span:nth-child(14) { --spark-x: -144px; --spark-y: 26px;   animation-delay: 0.13s; }
        .panel-sparks span:nth-child(15) { --spark-x: 80px;   --spark-y: 140px;  animation-delay: 0.04s; }
        .panel-sparks span:nth-child(16) { --spark-x: -34px;  --spark-y: -192px; animation-delay: 0.15s; }
        .panel-sparks span:nth-child(17) { --spark-x: 158px;  --spark-y: 60px;   animation-delay: 0.06s; }
        .panel-sparks span:nth-child(18) { --spark-x: -158px; --spark-y: -58px;  animation-delay: 0.18s; }
        .panel-sparks span:nth-child(19) { --spark-x: -90px;  --spark-y: 162px;  animation-delay: 0.03s; }
        .panel-sparks span:nth-child(20) { --spark-x: 104px;  --spark-y: -132px; animation-delay: 0.20s; }

        /* ── 衝撃波リング (全レアリティ) ── */
        .panel-rings {
          position: absolute;
          inset: 0;
          z-index: 2;
          pointer-events: none;
        }

        .panel-rings span {
          position: absolute;
          left: 50%;
          top: 44%;
          width: 70px;
          height: 70px;
          border-radius: 999px;
          border: 2px solid rgba(250, 204, 21, 0.85);
          transform: translate(-50%, -50%) scale(0.1);
          opacity: 0;
          animation: ringBurst 0.88s ease-out both;
        }
        .panel-rings span:nth-child(1) { animation-delay: 0.04s; }
        .panel-rings span:nth-child(2) { animation-delay: 0.22s; }
        .panel-rings span:nth-child(3) { animation-delay: 0.40s; }
        .panel-rings span:nth-child(4) { animation-delay: 0.58s; }

        .panel-rings.rings-n   span { border-color: rgba(148, 163, 184, 0.72); }
        .panel-rings.rings-r   span { border-color: rgba(34, 211, 238, 0.88); width: 80px; height: 80px; }
        .panel-rings.rings-sr  span { border-color: rgba(168, 85, 247, 0.90); box-shadow: 0 0 14px rgba(168,85,247,0.5); width: 86px; height: 86px; }
        .panel-rings.rings-ssr span { border-color: rgba(250, 204, 21, 0.92); box-shadow: 0 0 18px rgba(250,204,21,0.6); width: 92px; height: 92px; border-width: 3px; }
        .panel-rings.rings-ur  span { border-color: rgba(34, 211, 238, 0.94); box-shadow: 0 0 22px rgba(34,211,238,0.7), 0 0 40px rgba(168,85,247,0.4); width: 100px; height: 100px; border-width: 3px; animation-name: ringBurstUR; }
        .panel-rings.rings-sar span { border-color: rgba(255, 215, 0, 0.96); box-shadow: 0 0 24px rgba(255,215,0,0.7), 0 0 48px rgba(232,121,249,0.5); width: 100px; height: 100px; border-width: 4px; animation-name: ringBurstSAR; }

        @keyframes ringBurst {
          0%   { transform: translate(-50%, -50%) scale(0.1); opacity: 0.95; }
          65%  { opacity: 0.6; }
          100% { transform: translate(-50%, -50%) scale(2.8); opacity: 0; }
        }
        @keyframes ringBurstUR {
          0%   { transform: translate(-50%, -50%) scale(0.1); opacity: 0.95; filter: hue-rotate(0deg); }
          100% { transform: translate(-50%, -50%) scale(3.0); opacity: 0; filter: hue-rotate(120deg); }
        }
        @keyframes ringBurstSAR {
          0%   { transform: translate(-50%, -50%) scale(0.1); opacity: 1; filter: hue-rotate(0deg); }
          100% { transform: translate(-50%, -50%) scale(3.2); opacity: 0; filter: hue-rotate(360deg); }
        }

        /* ── パネル内コンテンツ ── */
        .panel-drop-label {
          position: relative;
          z-index: 3;
          border-radius: 999px;
          padding: 6px 12px;
          background: linear-gradient(90deg, #fde047, #fb7185, #a855f7, #22d3ee);
          color: #050816;
          font-size: 10px;
          font-weight: 1000;
          letter-spacing: 0.14em;
          animation: panelLabelPop 0.55s cubic-bezier(0.2, 1.3, 0.34, 1) both;
        }

        .panel-drop-label.label-sr  { background: linear-gradient(90deg, #a855f7, #7c3aed, #22d3ee); color: #fff; }
        .panel-drop-label.label-ssr { background: linear-gradient(90deg, #fde047, #fb923c, #fb7185); }
        .panel-drop-label.label-ur { background: linear-gradient(90deg, #fee2e2, #facc15, #7f1d1d); font-size: 11px; padding: 7px 14px; }
        .panel-drop-label.label-sar { background: linear-gradient(90deg, #f8fafc, #d8b4fe, #fef3c7, #111827); color: #111827; font-size: 11px; padding: 7px 14px; }

        .panel-monster-emoji {
          position: relative;
          z-index: 3;
          font-size: clamp(54px, 6.5vw, 74px);
          line-height: 1;
          filter: drop-shadow(0 12px 22px rgba(0,0,0,0.5));
          animation: panelEmojiPop 0.72s cubic-bezier(0.18, 1.3, 0.34, 1) both;
        }

        .pack-panel-frame.revealed.rarity-ur .panel-monster-emoji,
        .pack-panel-frame.revealed.rarity-sar .panel-monster-emoji {
          animation: panelEmojiPop 0.82s cubic-bezier(0.18, 1.35, 0.34, 1) both,
                     panelEmojiFloat 2.2s ease-in-out 0.82s infinite,
                     panelEmojiHue 3s linear 0.82s infinite;
        }

        .pack-panel-frame.revealed.rarity-ssr .panel-monster-emoji {
          animation: panelEmojiPop 0.78s cubic-bezier(0.18, 1.3, 0.34, 1) both,
                     panelEmojiFloat 2.4s ease-in-out 0.78s infinite;
        }

        .panel-rarity-chip {
          position: relative;
          z-index: 3;
          border-radius: 999px;
          padding: 6px 12px;
          background: rgba(251, 191, 36, 0.13);
          border: 1px solid rgba(251, 191, 36, 0.32);
          color: #fde68a;
          font-size: 11px;
          font-weight: 1000;
          letter-spacing: 0.1em;
          animation: panelCopyRise 0.5s ease 0.06s both;
        }

        .pack-panel-frame.revealed.rarity-r .panel-rarity-chip  { background: rgba(34,211,238,0.12); border-color: rgba(34,211,238,0.48); color: #a5f3fc; }
        .pack-panel-frame.revealed.rarity-sr .panel-rarity-chip { background: rgba(168,85,247,0.16); border-color: rgba(168,85,247,0.58); color: #d8b4fe; }

        .panel-card-name {
          position: relative;
          z-index: 3;
          color: #fff;
          font-size: clamp(17px, 2vw, 22px);
          font-weight: 1000;
          line-height: 1.2;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          max-width: 100%;
          animation: panelCopyRise 0.5s ease 0.12s both;
        }

        .panel-status {
          position: relative;
          z-index: 3;
          color: #fde68a;
          font-size: 12px;
          font-weight: 1000;
          line-height: 1;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.45);
          animation: panelCopyRise 0.5s ease 0.1s both;
        }

        .panel-card-meta {
          position: relative;
          z-index: 3;
          color: rgba(255, 255, 255, 0.82);
          font-size: 12px;
          font-weight: 900;
          line-height: 1.25;
          max-width: 100%;
          overflow-wrap: anywhere;
          animation: panelCopyRise 0.5s ease 0.15s both;
        }

        .panel-footer {
          position: relative;
          z-index: 3;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          animation: panelCopyRise 0.5s ease 0.18s both;
        }

        .panel-new-chip {
          border-radius: 999px;
          padding: 5px 10px;
          border: 1px solid rgba(250, 204, 21, 0.56);
          background: rgba(113, 63, 18, 0.42);
          color: #fef3c7;
          font-size: 10px;
          font-weight: 1000;
          letter-spacing: 0.08em;
        }

        .panel-stage-chip,
        .panel-count-chip {
          border-radius: 999px;
          padding: 7px 14px;
          border: 1px solid rgba(34, 211, 238, 0.5);
          background: rgba(8, 47, 73, 0.72);
          color: #a5f3fc;
          font-size: 12px;
          font-weight: 1000;
          line-height: 1;
        }

        .panel-stage-chip.new {
          border-color: rgba(250, 204, 21, 0.56);
          background: rgba(113, 63, 18, 0.55);
          color: #fef3c7;
        }

        /* ── キーフレーム ── */
        @keyframes panelReveal {
          0%   { transform: scale(0.93) translateY(8px); filter: brightness(1.6); opacity: 0.8; }
          58%  { transform: scale(1.025) translateY(-2px); opacity: 1; }
          100% { transform: scale(1) translateY(0); filter: brightness(1); opacity: 1; }
        }

        @keyframes panelSpark {
          0%   { transform: translate(-50%, -50%) scale(0.35); opacity: 0; }
          22%  { opacity: 1; }
          100% { transform: translate(-50%, -50%) translate(var(--spark-x), var(--spark-y)) scale(0.08); opacity: 0; }
        }


        @keyframes panelEmojiPop {
          0%   { transform: translateY(18px) scale(0.48) rotate(-8deg); opacity: 0; }
          58%  { transform: translateY(-7px) scale(1.18) rotate(4deg); opacity: 1; }
          100% { transform: translateY(0) scale(1) rotate(0deg); opacity: 1; }
        }

        @keyframes panelEmojiFloat {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-7px); }
        }

        @keyframes panelEmojiHue {
          from { filter: drop-shadow(0 0 18px rgba(255,80,200,0.8)) hue-rotate(0deg) brightness(1.15); }
          to   { filter: drop-shadow(0 0 18px rgba(255,80,200,0.8)) hue-rotate(360deg) brightness(1.15); }
        }

        @keyframes panelCopyRise {
          from { transform: translateY(10px); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }

        @keyframes panelLabelPop {
          0%   { transform: translateY(10px) scale(0.74); opacity: 0; }
          62%  { transform: translateY(-2px) scale(1.08); opacity: 1; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }

        @keyframes panelSRGlow {
          from { box-shadow: 0 0 96px rgba(168,85,247,0.55), 0 30px 90px rgba(0,0,0,0.38); }
          to   { box-shadow: 0 0 140px rgba(168,85,247,0.9), 0 30px 90px rgba(0,0,0,0.38); }
        }

        @keyframes panelSSRPulse {
          from { box-shadow: 0 0 80px rgba(250,204,21,0.68), 0 0 130px rgba(234,88,12,0.38); }
          to   { box-shadow: 0 0 110px rgba(250,204,21,1.0), 0 0 180px rgba(234,88,12,0.6); }
        }

        @keyframes panelURRainbow {
          0%   { box-shadow: 0 0 80px rgba(250,204,21,0.9),  0 0 160px rgba(250,204,21,0.42); }
          25%  { box-shadow: 0 0 80px rgba(232,121,249,0.9), 0 0 160px rgba(232,121,249,0.42); }
          50%  { box-shadow: 0 0 80px rgba(34,211,238,0.9),  0 0 160px rgba(34,211,238,0.42); }
          75%  { box-shadow: 0 0 80px rgba(129,140,248,0.9), 0 0 160px rgba(129,140,248,0.42); }
          100% { box-shadow: 0 0 80px rgba(250,204,21,0.9),  0 0 160px rgba(250,204,21,0.42); }
        }

        @keyframes panelSARMyth {
          from { box-shadow: 0 0 76px rgba(245,243,255,0.5), 0 0 150px rgba(88,28,135,0.48); }
          to   { box-shadow: 0 0 96px rgba(245,243,255,0.74), 0 0 190px rgba(88,28,135,0.66); }
        }

        @keyframes summonCircleSpin {
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }

        @keyframes summonRingSpin {
          to { transform: translate(-50%, -50%) rotate(-360deg); }
        }

        @keyframes summonMistDrift {
          from { transform: translate(-56%, -48%) scale(0.95); opacity: 0.42; }
          to   { transform: translate(-44%, -52%) scale(1.08); opacity: 0.7; }
        }

        @keyframes summonAuraPulse {
          from { transform: translate(-50%, -50%) scale(0.86); opacity: 0.36; }
          to   { transform: translate(-50%, -50%) scale(1.18); opacity: 0.78; }
        }

        @keyframes summonShock {
          0%   { transform: translate(-50%, -50%) scale(0.52); opacity: 0; }
          20%  { opacity: 0.82; }
          100% { transform: translate(-50%, -50%) scale(2.58); opacity: 0; }
        }

        @keyframes summonDarkBeat {
          from { filter: brightness(0.82) saturate(1.05); }
          to   { filter: brightness(1.2) saturate(1.22); }
        }

        @keyframes summonLightning {
          0%, 48%, 100% { opacity: 0; transform: skewX(0deg); }
          50%, 56%      { opacity: 0.48; transform: skewX(-8deg); }
          62%           { opacity: 0.22; transform: skewX(6deg); }
        }

        @keyframes summonTextPulse {
          from { opacity: 0.78; transform: translateY(0); }
          to   { opacity: 1; transform: translateY(-1px); }
        }

        .pack-image {
          position: relative;
          isolation: isolate;
          width: clamp(104px, 12vw, 148px);
          aspect-ratio: 709 / 1179;
          display: grid;
          place-items: center;
          filter: drop-shadow(0 22px 28px rgba(0, 0, 0, 0.5)) drop-shadow(0 0 26px rgba(168, 85, 247, 0.38));
        }

        .pack-image::before,
        .pack-image::after {
          content: "";
          position: absolute;
          z-index: 2;
          opacity: 0;
          pointer-events: none;
        }

        .pack-image::before {
          left: 16%;
          right: 16%;
          top: 42%;
          height: 14px;
          border-radius: 999px;
          background:
            linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.92), rgba(250, 204, 21, 0.82), transparent);
          filter: blur(0.2px) drop-shadow(0 0 14px rgba(250, 204, 21, 0.82));
          transform: scaleX(0.18);
        }

        .pack-image::after {
          left: 50%;
          top: 18%;
          width: 58%;
          aspect-ratio: 3 / 4;
          border: 1px solid rgba(255, 255, 255, 0.72);
          border-radius: 10px;
          background:
            radial-gradient(circle at 50% 18%, rgba(255, 255, 255, 0.94), transparent 30%),
            linear-gradient(160deg, rgba(250, 204, 21, 0.82), rgba(168, 85, 247, 0.72), rgba(34, 211, 238, 0.72));
          box-shadow:
            0 0 22px rgba(255, 255, 255, 0.58),
            0 0 44px rgba(250, 204, 21, 0.42);
          transform: translate(-50%, 34%) scale(0.54);
        }

        .pack-image img {
          position: relative;
          z-index: 1;
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .pack-open-burst {
          position: absolute;
          inset: -24%;
          z-index: 0;
          border-radius: 999px;
          opacity: 0;
          background:
            radial-gradient(circle, rgba(255, 255, 255, 0.82), rgba(250, 204, 21, 0.34) 22%, rgba(34, 211, 238, 0.18) 42%, transparent 68%);
          pointer-events: none;
        }

        .pack-image-opening {
          animation: packOpeningPulse 0.76s ease-in-out infinite alternate;
        }

        .pack-image-opening img {
          animation: packEnvelopeOpen 0.76s ease-in-out infinite alternate;
        }

        .pack-image-opening::before {
          animation: packSeamLight 0.9s ease-in-out infinite;
        }

        .pack-image-opening::after {
          animation: packCardPeek 0.9s ease-in-out infinite alternate;
        }

        .pack-image-opening .pack-open-burst {
          opacity: 0.75;
          animation: packChargeGlow 0.9s ease-in-out infinite alternate;
        }

        .pack-image-done .pack-open-burst {
          animation: packOpenBurst 0.74s ease both;
        }

        .pack-panel-frame p {
          margin: 4px 0 0;
          color: #fde68a;
          font-size: 13px;
          font-weight: 1000;
        }

        .pack-panel-frame strong {
          color: #fff;
          font-size: clamp(28px, 3.2vw, 36px);
          line-height: 1;
          font-weight: 1000;
        }

        .pack-panel-frame span {
          color: #cbd5e1;
          font-size: 12px;
          font-weight: 900;
        }

        .pack-panel-frame > p,
        .pack-panel-frame > strong,
        .pack-panel-frame > span,
        .pack-panel-frame > .pack-image,
        .pack-panel-frame > .summon-text {
          position: relative;
          z-index: 4;
        }

        .summon-stage {
          position: absolute;
          inset: 5px;
          z-index: 1;
          overflow: hidden;
          border-radius: 27px;
          pointer-events: none;
        }

        .summon-circle,
        .summon-ring,
        .summon-mist,
        .summon-aura,
        .summon-shock {
          position: absolute;
          left: 50%;
          top: 46%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }

        .summon-circle {
          width: 190px;
          aspect-ratio: 1;
          border-radius: 999px;
          opacity: 0.42;
          background:
            repeating-conic-gradient(from 0deg, rgba(191, 219, 254, 0.18) 0 8deg, transparent 8deg 18deg),
            radial-gradient(circle, transparent 38%, rgba(34, 211, 238, 0.22) 39% 41%, transparent 42% 54%, rgba(168, 85, 247, 0.22) 55% 57%, transparent 58%);
          filter: blur(0.2px);
          animation: summonCircleSpin 18s linear infinite;
        }

        .summon-ring {
          width: 156px;
          aspect-ratio: 1;
          border-radius: 999px;
          border: 1px solid rgba(147, 197, 253, 0.34);
          box-shadow: 0 0 22px rgba(34, 211, 238, 0.2), inset 0 0 18px rgba(168, 85, 247, 0.1);
          animation: summonRingSpin 12s linear infinite;
        }

        .summon-ring.ring-b {
          width: 108px;
          border-color: rgba(216, 180, 254, 0.34);
          animation-duration: 8s;
          animation-direction: reverse;
        }

        .summon-mist {
          width: 210px;
          height: 118px;
          border-radius: 999px;
          background: radial-gradient(ellipse, rgba(126, 34, 206, 0.28), rgba(34, 211, 238, 0.08) 46%, transparent 72%);
          filter: blur(18px);
          opacity: 0.58;
          animation: summonMistDrift 5.8s ease-in-out infinite alternate;
        }

        .summon-mist.mist-b {
          top: 56%;
          width: 180px;
          height: 96px;
          background: radial-gradient(ellipse, rgba(49, 46, 129, 0.34), rgba(250, 204, 21, 0.08) 48%, transparent 74%);
          animation-delay: -2.2s;
          animation-direction: alternate-reverse;
        }

        .summon-aura {
          width: 138px;
          aspect-ratio: 1;
          border-radius: 999px;
          background: radial-gradient(circle, rgba(224, 242, 254, 0.2), rgba(168, 85, 247, 0.18) 44%, transparent 70%);
          filter: blur(10px);
          animation: summonAuraPulse 1.7s ease-in-out infinite alternate;
        }

        .summon-shock {
          width: 88px;
          aspect-ratio: 1;
          border-radius: 999px;
          border: 2px solid rgba(191, 219, 254, 0.58);
          opacity: 0;
          animation: summonShock 0.72s ease-out both;
        }

        .pack-panel-frame.summoning.rarity-sr .summon-ring,
        .pack-panel-frame.summoning.rarity-ssr .summon-ring {
          border-color: rgba(250, 204, 21, 0.52);
          box-shadow: 0 0 26px rgba(250, 204, 21, 0.24), inset 0 0 18px rgba(168, 85, 247, 0.14);
        }

        .pack-panel-frame.summoning.rarity-ssr .summon-stage {
          animation: summonDarkBeat 1.28s ease-in-out infinite alternate;
        }

        .pack-panel-frame.summoning.rarity-ur .summon-stage::after,
        .pack-panel-frame.summoning.rarity-sar .summon-stage::after {
          content: "";
          position: absolute;
          inset: 16px;
          border-radius: 24px;
          background:
            linear-gradient(122deg, transparent 38%, rgba(250, 204, 21, 0.44) 40%, transparent 43%),
            linear-gradient(62deg, transparent 54%, rgba(127, 29, 29, 0.38) 56%, transparent 59%);
          opacity: 0.38;
          filter: blur(0.4px);
          animation: summonLightning 0.95s steps(2, end) infinite;
        }

        .pack-panel-frame.summoning.rarity-sar .summon-circle {
          opacity: 0.58;
          background:
            repeating-conic-gradient(from 0deg, rgba(245, 243, 255, 0.24) 0 6deg, transparent 6deg 17deg),
            radial-gradient(circle, transparent 34%, rgba(221, 214, 254, 0.24) 35% 37%, transparent 38% 51%, rgba(250, 204, 21, 0.24) 52% 54%, transparent 55%);
        }

        .pack-open-page.god-pack.phase-opening .pack-panel-frame.summoning .summon-circle {
          opacity: 0.68;
          filter: drop-shadow(0 0 20px rgba(250, 204, 21, 0.34));
          animation-duration: 10s;
        }

        .summon-text {
          width: min(100%, 210px);
          margin-top: 2px;
          border: 1px solid rgba(191, 219, 254, 0.22);
          border-radius: 999px;
          padding: 7px 10px;
          color: #dbeafe;
          background: rgba(2, 6, 23, 0.52);
          box-shadow: 0 0 18px rgba(34, 211, 238, 0.12);
          font-size: 11px;
          font-weight: 1000;
          line-height: 1.15;
          text-align: center;
          text-shadow: 0 1px 8px rgba(0, 0, 0, 0.62);
          animation: summonTextPulse 1.2s ease-in-out infinite alternate;
        }

        .cards-panel {
          display: grid;
          grid-template-rows: auto 1fr auto;
          gap: 12px;
          min-height: 430px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 24px;
          padding: 16px;
          background:
            radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.1), transparent 36%),
            linear-gradient(180deg, rgba(15, 23, 42, 0.78), rgba(2, 6, 23, 0.82));
          box-shadow: 0 26px 80px rgba(0, 0, 0, 0.34);
        }

        .pack-open-page.mode-ten .cards-panel {
          gap: 22px;
        }

        .pack-open-page.tenpack-result-bg .cards-panel {
          gap: 22px;
          border-color: rgba(255, 255, 255, 0.12);
          background:
            radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.09), transparent 34%),
            linear-gradient(180deg, rgba(15, 23, 42, 0.72), rgba(2, 6, 23, 0.86));
          box-shadow:
            0 30px 96px rgba(0, 0, 0, 0.52),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(8px);
        }

        .result-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          min-width: 0;
        }

        .result-head p {
          margin: 0 0 5px;
          color: #fde68a;
          font-size: 12px;
          font-weight: 1000;
          letter-spacing: 0;
        }

        .result-head h1 {
          margin: 0;
          color: #fff;
          font-size: clamp(24px, 2.7vw, 34px);
          line-height: 1;
          font-weight: 1000;
          letter-spacing: 0;
        }

        .pack-open-page.tenpack-result-bg .result-head h1 {
          color: #fff7ed;
          text-shadow:
            0 2px 18px rgba(0, 0, 0, 0.72),
            0 0 28px rgba(250, 204, 21, 0.22);
        }

        .pack-open-page.tenpack-result-bg .result-head p {
          color: #fde68a;
          text-shadow: 0 1px 10px rgba(0, 0, 0, 0.7);
        }

        .pack-open-page.tenpack-result-bg .result-head {
          padding-bottom: 4px;
        }


        .cards-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          grid-template-rows: repeat(2, minmax(172px, 1fr));
          gap: 10px;
          align-self: stretch;
        }

        .card-tile {
          position: relative;
          min-width: 0;
          min-height: 150px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
          border: 1px solid rgba(120, 136, 166, 0.34);
          border-radius: 18px;
          padding: 42px 8px 12px;
          background:
            radial-gradient(circle at 50% 18%, rgba(168, 85, 247, 0.1), transparent 38%),
            linear-gradient(160deg, rgba(15, 23, 42, 0.92), rgba(2, 6, 23, 0.96));
          text-align: center;
          box-shadow:
            0 4px 24px rgba(0, 0, 0, 0.32),
            inset 0 1px 0 rgba(255, 255, 255, 0.05),
            inset 0 -18px 36px rgba(34, 211, 238, 0.04);
          animation: cardIn 0.28s ease calc(var(--i, 0) * 0.035s) both;
        }

        .pack-open-page.tenpack-result-bg .card-tile {
          border-color: rgba(100, 116, 139, 0.22);
          background: linear-gradient(160deg, rgba(10, 17, 34, 0.94), rgba(2, 6, 23, 0.98));
        }

        .card-tile.current {
          outline: 2px solid rgba(34, 211, 238, 0.72);
          outline-offset: 2px;
          box-shadow: 0 0 28px rgba(34, 211, 238, 0.26), 0 4px 24px rgba(0, 0, 0, 0.32);
        }

        .card-tile.current.rarity-sr {
          outline-color: rgba(250, 204, 21, 0.86);
          animation: rareWaiting 0.72s ease-in-out infinite alternate;
        }

        .card-tile.current.rarity-ssr {
          outline-color: rgba(250, 204, 21, 0.92);
          box-shadow: 0 0 34px rgba(250, 204, 21, 0.34), 0 4px 24px rgba(0, 0, 0, 0.32);
          animation: rareWaiting 0.84s ease-in-out infinite alternate;
        }

        .card-tile.current.rarity-ur {
          outline-color: rgba(250, 204, 21, 0.94);
          box-shadow: 0 0 18px rgba(250, 204, 21, 0.26), 0 0 34px rgba(127, 29, 29, 0.36), 0 4px 24px rgba(0, 0, 0, 0.32);
          animation: rareWaitingUR 0.82s ease-in-out infinite alternate;
        }

        .card-tile.current.rarity-sar {
          outline-color: rgba(245, 243, 255, 0.95);
          box-shadow: 0 0 20px rgba(245, 243, 255, 0.32), 0 0 42px rgba(88, 28, 135, 0.54), 0 4px 24px rgba(0, 0, 0, 0.32);
          animation: rareWaitingSAR 0.9s ease-in-out infinite alternate;
        }

        .card-tile.sealed.current.rarity-ssr .card-back::after,
        .card-tile.sealed.current.rarity-ur .card-back::after,
        .card-tile.sealed.current.rarity-sar .card-back::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 18px;
          pointer-events: none;
          background:
            linear-gradient(118deg, transparent 22%, rgba(250, 204, 21, 0.46) 24%, transparent 28%),
            linear-gradient(72deg, transparent 56%, rgba(245, 243, 255, 0.34) 58%, transparent 62%);
          opacity: 0.66;
          animation: sealCrackPulse 0.9s steps(2, end) infinite;
        }

        .card-tile.sealed.current.rarity-ur .card-back::after {
          background:
            linear-gradient(118deg, transparent 20%, rgba(250, 204, 21, 0.54) 23%, transparent 28%),
            linear-gradient(64deg, transparent 48%, rgba(127, 29, 29, 0.52) 51%, transparent 56%);
        }

        .card-tile.sealed.current.rarity-sar .card-back::after {
          background:
            radial-gradient(circle at 50% 45%, rgba(245, 243, 255, 0.26), transparent 34%),
            linear-gradient(118deg, transparent 20%, rgba(245, 243, 255, 0.48) 23%, transparent 29%),
            linear-gradient(64deg, transparent 48%, rgba(88, 28, 135, 0.52) 51%, transparent 58%);
        }

        .card-tile.revealed {
          animation: flipIn 0.58s cubic-bezier(0.2, 1.16, 0.32, 1) both;
        }

        .card-tile.revealed.rarity-n {
          border-color: rgba(148, 163, 184, 0.48);
          background: linear-gradient(160deg, rgba(30, 41, 59, 0.88), rgba(2, 6, 23, 0.95));
          box-shadow: inset 0 3px 0 rgba(148, 163, 184, 0.45), 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .card-tile.revealed.rarity-r {
          border-color: rgba(99, 179, 237, 0.58);
          background: linear-gradient(160deg, rgba(12, 36, 64, 0.9), rgba(2, 6, 23, 0.96));
          box-shadow: inset 0 3px 0 rgba(99, 179, 237, 0.62), 0 4px 22px rgba(99, 179, 237, 0.1);
        }

        .card-tile.revealed.rarity-sr {
          border-color: rgba(250, 204, 21, 0.65);
          background: linear-gradient(160deg, rgba(41, 30, 5, 0.9), rgba(2, 6, 23, 0.96));
          box-shadow: inset 0 3px 0 rgba(250, 204, 21, 0.7), 0 6px 36px rgba(250, 204, 21, 0.22);
        }

        .card-tile.revealed.rarity-ssr {
          border-color: rgba(250, 204, 21, 0.8);
          background: linear-gradient(160deg, rgba(45, 22, 4, 0.92), rgba(2, 6, 23, 0.97));
          animation: flipInLegend 0.72s cubic-bezier(0.18, 1.24, 0.28, 1) both, ssrGlow 1.8s ease-in-out 0.72s infinite alternate;
        }

        .card-tile.revealed.rarity-ur {
          border-color: rgba(34, 211, 238, 0.82);
          background: linear-gradient(160deg, rgba(4, 34, 52, 0.93), rgba(2, 6, 23, 0.97));
          animation: flipInLegend 0.78s cubic-bezier(0.15, 1.30, 0.25, 1) both, urGlow 2.4s linear 0.78s infinite;
        }

        .card-tile.revealed.rarity-sar {
          border-color: rgba(168, 85, 247, 0.85);
          background: linear-gradient(160deg, rgba(24, 8, 44, 0.96), rgba(2, 6, 23, 0.99));
          animation: flipInLegend 0.84s cubic-bezier(0.13, 1.36, 0.23, 1) both, sarGlow 2.0s linear 0.84s infinite;
        }

        .pack-open-page.phase-done .card-tile {
          overflow: hidden;
        }

        .card-tile.revealed.rarity-sr::before,
        .card-tile.revealed.rarity-ssr::before,
        .card-tile.revealed.rarity-ur::before,
        .card-tile.revealed.rarity-sar::before {
          content: "";
          position: absolute;
          inset: -14%;
          z-index: 0;
          pointer-events: none;
          background:
            conic-gradient(
              from 0deg,
              rgba(250, 204, 21, 0.9),
              rgba(251, 113, 133, 0.72),
              rgba(168, 85, 247, 0.78),
              rgba(34, 211, 238, 0.86),
              rgba(134, 239, 172, 0.62),
              rgba(250, 204, 21, 0.9)
            );
          opacity: 0.42;
          filter: blur(7px) saturate(1.25);
          animation: rareCardSpin 3.2s linear infinite;
        }

        .card-tile.revealed.rarity-ssr::before {
          opacity: 0.54;
          filter: blur(7px) saturate(1.42);
          animation-duration: 2.6s;
        }

        .card-tile.revealed.rarity-ur::before,
        .card-tile.revealed.rarity-sar::before {
          opacity: 0.66;
          filter: blur(7px) saturate(1.62) brightness(1.08);
          animation-duration: 2.1s;
        }

        .card-tile.revealed.rarity-sar::before {
          background:
            conic-gradient(
              from 0deg,
              rgba(245, 243, 255, 0.88),
              rgba(88, 28, 135, 0.7),
              rgba(250, 204, 21, 0.5),
              rgba(2, 6, 23, 0.24),
              rgba(245, 243, 255, 0.88)
            );
          opacity: 0.58;
          filter: blur(8px) saturate(1.08);
          animation-duration: 3.4s;
        }

        .card-tile.revealed.rarity-sr .tile-emoji,
        .card-tile.revealed.rarity-sr b,
        .card-tile.revealed.rarity-sr strong,
        .card-tile.revealed.rarity-ssr .tile-emoji,
        .card-tile.revealed.rarity-ssr b,
        .card-tile.revealed.rarity-ssr strong,
        .card-tile.revealed.rarity-ur .tile-emoji,
        .card-tile.revealed.rarity-ur b,
        .card-tile.revealed.rarity-ur strong,
        .card-tile.revealed.rarity-sar .tile-emoji,
        .card-tile.revealed.rarity-sar b,
        .card-tile.revealed.rarity-sar strong {
          position: relative;
          z-index: 2;
        }

        .card-tile.revealed.rarity-sr,
        .card-tile.revealed.rarity-ssr,
        .card-tile.revealed.rarity-ur,
        .card-tile.revealed.rarity-sar {
          padding-top: 54px;
          gap: 7px;
        }

        .card-tile i,
        .card-tile em,
        .card-tile small {
          position: absolute;
          z-index: 2;
          font-style: normal;
          font-weight: 1000;
        }

        .card-tile i {
          top: 7px;
          left: 8px;
          color: rgba(255, 255, 255, 0.42);
          font-size: 9px;
        }

        .card-tile em {
          top: 7px;
          right: 7px;
          border: 1px solid rgba(250, 204, 21, 0.56);
          border-radius: 999px;
          padding: 1px 4px;
          color: #fef3c7;
          background: rgba(113, 63, 18, 0.42);
          font-size: 7px;
          line-height: 1.15;
        }

        .card-tile small {
          top: 18px;
          left: 50%;
          transform: translateX(-50%);
          max-width: calc(100% - 18px);
          border-radius: 999px;
          padding: 3px 8px;
          color: #050816;
          background: linear-gradient(90deg, #fde047, #fb7185, #a855f7, #22d3ee);
          box-shadow: 0 0 18px rgba(250, 204, 21, 0.42);
          font-size: clamp(8px, 0.75vw, 10px);
          white-space: nowrap;
        }

        .card-tile.revealed.rarity-sr small,
        .card-tile.revealed.rarity-ssr small,
        .card-tile.revealed.rarity-ur small,
        .card-tile.revealed.rarity-sar small {
          position: absolute;
          top: 12px;
          left: 50%;
          z-index: 4;
          transform: translateX(-50%);
        }

        .card-back {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          border-radius: 18px;
          background:
            linear-gradient(#080c1e, #080c1e) padding-box,
            linear-gradient(160deg, #a37010, #ffd700 30%, #c8960c 58%, #ffd700 80%, #8b6914) border-box;
          border: 2px solid transparent;
          box-shadow:
            inset 0 1px 0 rgba(255, 215, 0, 0.10),
            inset 0 -18px 36px rgba(109, 40, 217, 0.10);
        }

        .card-tile.god-marked.sealed .card-back {
          background:
            linear-gradient(#07111f, #07111f) padding-box,
            linear-gradient(160deg, #c8960c, #ffd700 28%, #f5e27a 52%, #ffd700 76%, #a37010) border-box;
          box-shadow:
            inset 0 1px 0 rgba(255, 215, 0, 0.18),
            inset 0 -18px 36px rgba(250, 204, 21, 0.14),
            0 0 24px rgba(250, 204, 21, 0.18);
        }

        /* ── カード裏面の装飾 ── */
        .card-back::before {
          content: "";
          position: absolute;
          inset: 5px;
          border-radius: 13px;
          border: 1px solid rgba(200, 150, 12, 0.38);
          pointer-events: none;
          z-index: 0;
        }

        .cb-outer-ring,
        .cb-inner-ring,
        .cb-gem {
          position: absolute;
          display: block;
          pointer-events: none;
          border-radius: 5px;
          transform: rotate(45deg);
          aspect-ratio: 1;
        }

        /* 紫のダイヤモンド面 */
        .cb-outer-ring {
          width: 66%;
          background: linear-gradient(145deg, #5b21b6, #3b0764 48%, #6d28d9);
          border: 2px solid rgba(200, 150, 12, 0.78);
          box-shadow:
            0 0 22px rgba(109, 40, 217, 0.50),
            inset 0 0 22px rgba(50, 5, 90, 0.55);
        }

        /* 斜め金光沢 */
        .cb-outer-ring::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 3px;
          background: linear-gradient(
            45deg,
            transparent 22%,
            rgba(255, 215, 0, 0.14) 38%,
            rgba(255, 215, 0, 0.38) 50%,
            rgba(255, 215, 0, 0.14) 62%,
            transparent 78%
          );
        }

        /* 内側の金フレーム */
        .cb-inner-ring {
          width: 40%;
          border: 1.5px solid rgba(212, 175, 55, 0.72);
          box-shadow: 0 0 8px rgba(212, 175, 55, 0.20);
        }

        /* 中央クリスタルジェム */
        .cb-gem {
          width: 20%;
          background: radial-gradient(circle at 35% 30%, rgba(233, 213, 255, 0.9), #a855f7 42%, #6d28d9 85%);
          border: 1.5px solid rgba(212, 175, 55, 0.90);
          box-shadow:
            0 0 16px rgba(168, 85, 247, 0.65),
            0 0 30px rgba(109, 40, 217, 0.40),
            inset 0 0 6px rgba(255, 255, 255, 0.22);
          animation: cbGemPulse 3s ease-in-out infinite alternate;
        }

        /* current カードのジェム強調 */
        .card-tile.current.rarity-sr .cb-gem,
        .card-tile.current.rarity-ssr .cb-gem {
          border-color: rgba(250, 204, 21, 0.95);
          box-shadow: 0 0 22px rgba(250, 204, 21, 0.70), 0 0 44px rgba(234, 88, 12, 0.35);
          animation: cbGemHighPulse 0.72s ease-in-out infinite alternate;
        }

        .card-tile.current.rarity-ur .cb-gem {
          border-color: rgba(34, 211, 238, 0.95);
          box-shadow: 0 0 26px rgba(34, 211, 238, 0.70), 0 0 50px rgba(168, 85, 247, 0.40);
          animation: cbGemHighPulse 0.56s ease-in-out infinite alternate;
        }

        .card-tile.current.rarity-sar .cb-gem {
          border-color: rgba(245, 243, 255, 0.98);
          box-shadow: 0 0 30px rgba(245, 243, 255, 0.72), 0 0 60px rgba(88, 28, 135, 0.60);
          animation: cbGemHighPulse 0.48s ease-in-out infinite alternate;
        }

        /* god pack */
        .card-tile.god-marked.sealed .cb-outer-ring {
          border-color: rgba(255, 215, 0, 0.90);
          box-shadow: 0 0 24px rgba(250, 204, 21, 0.50), inset 0 0 20px rgba(100, 50, 0, 0.30);
        }

        .card-tile.god-marked.sealed .cb-inner-ring {
          border-color: rgba(255, 215, 0, 0.78);
        }

        .card-tile.god-marked.sealed .cb-gem {
          border-color: rgba(255, 215, 0, 0.95);
          box-shadow: 0 0 20px rgba(250, 204, 21, 0.62), 0 0 42px rgba(250, 204, 21, 0.32);
        }

        .tile-emoji {
          position: relative;
          z-index: 1;
          display: block;
          font-size: clamp(34px, 3.6vw, 52px);
          line-height: 1;
        }

        .card-tile b {
          position: relative;
          z-index: 1;
          max-width: 100%;
          color: #fde68a;
          display: block;
          font-size: clamp(10px, 0.82vw, 12px);
          font-weight: 1000;
          line-height: 1.15;
          white-space: nowrap;
        }

        .card-tile strong {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 100%;
          color: #e2e8f0;
          display: -webkit-box;
          font-size: clamp(10px, 0.9vw, 12px);
          line-height: 1.25;
          overflow-wrap: anywhere;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        @keyframes cbGemPulse {
          from { transform: rotate(45deg) scale(1.00); }
          to   { transform: rotate(45deg) scale(1.12); }
        }

        @keyframes cbGemHighPulse {
          from { transform: rotate(45deg) scale(1.00); }
          to   { transform: rotate(45deg) scale(1.24); }
        }

        @keyframes ssrGlow {
          from { box-shadow: inset 0 3px 0 rgba(250, 204, 21, 0.85), 0 6px 28px rgba(250, 204, 21, 0.18); }
          to   { box-shadow: inset 0 3px 0 rgba(250, 204, 21, 0.85), 0 6px 44px rgba(250, 204, 21, 0.46); }
        }

        @keyframes urGlow {
          0%   { box-shadow: inset 0 3px 0 rgba(34, 211, 238, 0.9),  0 6px 36px rgba(34, 211, 238, 0.35); }
          33%  { box-shadow: inset 0 3px 0 rgba(168, 85, 247, 0.9),  0 6px 36px rgba(168, 85, 247, 0.32); }
          66%  { box-shadow: inset 0 3px 0 rgba(250, 204, 21, 0.88), 0 6px 36px rgba(250, 204, 21, 0.30); }
          100% { box-shadow: inset 0 3px 0 rgba(34, 211, 238, 0.9),  0 6px 36px rgba(34, 211, 238, 0.35); }
        }

        @keyframes sarGlow {
          from { box-shadow: inset 0 3px 0 rgba(245, 243, 255, 0.92), 0 6px 38px rgba(88, 28, 135, 0.42); }
          to   { box-shadow: inset 0 3px 0 rgba(250, 204, 21, 0.76), 0 6px 48px rgba(245, 243, 255, 0.34); }
        }

        /* ── 絵文字: ポップ登場＋サイズ＋持続エフェクト (レアリティ別) ── */
        .card-tile.revealed .tile-emoji {
          animation: emojiPopN 0.42s ease-out both;
          animation-delay: calc(var(--i, 0) * 0.055s);
        }
        .card-tile.revealed.rarity-n .tile-emoji {
          font-size: clamp(24px, 2.4vw, 34px);
        }
        .card-tile.revealed.rarity-r .tile-emoji {
          font-size: clamp(28px, 2.9vw, 42px);
          animation: emojiPopR 0.50s cubic-bezier(0.2, 1.1, 0.32, 1) both;
          animation-delay: calc(var(--i, 0) * 0.055s);
        }
        .card-tile.revealed.rarity-sr .tile-emoji {
          margin-top: 6px;
          animation: emojiPopSR 0.62s cubic-bezier(0.18, 1.26, 0.28, 1) both,
                     tileFloat 3.2s ease-in-out infinite;
          animation-delay: calc(var(--i, 0) * 0.055s), calc(var(--i, 0) * 0.055s + 0.62s);
        }
        .card-tile.revealed.rarity-ssr .tile-emoji {
          font-size: clamp(38px, 3.9vw, 56px);
          margin-top: 6px;
          animation: emojiPopSSR 0.74s cubic-bezier(0.15, 1.36, 0.24, 1) both,
                     tileFloat 2.8s ease-in-out infinite,
                     tileGoldBright 2.8s ease-in-out infinite alternate;
          animation-delay:
            calc(0.72s + var(--i, 0) * 0.055s),
            calc(1.46s + var(--i, 0) * 0.055s),
            calc(1.46s + var(--i, 0) * 0.055s);
        }
        .card-tile.revealed.rarity-ur .tile-emoji {
          font-size: clamp(40px, 4.1vw, 60px);
          margin-top: 6px;
          animation: emojiPopUR 0.84s cubic-bezier(0.12, 1.44, 0.20, 1) both,
                     tileFloat 2.4s ease-in-out infinite,
                     tileHueUR 5s linear infinite;
          animation-delay:
            calc(0.78s + var(--i, 0) * 0.055s),
            calc(1.62s + var(--i, 0) * 0.055s),
            calc(1.62s + var(--i, 0) * 0.055s);
        }
        .card-tile.revealed.rarity-sar .tile-emoji {
          font-size: clamp(40px, 4.1vw, 60px);
          margin-top: 6px;
          animation: emojiPopSAR 0.92s cubic-bezier(0.10, 1.50, 0.18, 1) both,
                     tileFloat 2.2s ease-in-out infinite,
                     tileHueSAR 3.5s linear infinite;
          animation-delay:
            calc(0.84s + var(--i, 0) * 0.055s),
            calc(1.76s + var(--i, 0) * 0.055s),
            calc(1.76s + var(--i, 0) * 0.055s);
        }

        /* ── SSR/UR/SAR: カード名テキストカラー ── */
        .card-tile.revealed.rarity-ssr strong { color: #fde68a; text-shadow: 0 0 10px rgba(250, 204, 21, 0.32); }
        .card-tile.revealed.rarity-ur  strong { color: #a5f3fc; text-shadow: 0 0 10px rgba(34, 211, 238, 0.38); }
        .card-tile.revealed.rarity-sar strong { color: #e9d5ff; text-shadow: 0 0 10px rgba(168, 85, 247, 0.42); }

        /* ── UR/SAR: レアリティラベル文字色 ── */
        .card-tile.revealed.rarity-ur  b { color: #a5f3fc; }
        .card-tile.revealed.rarity-sar b { color: #d8b4fe; }

        /* ── SSR/UR/SAR: シマースイープ ── */
        .card-tile.revealed.rarity-ssr::after,
        .card-tile.revealed.rarity-ur::after,
        .card-tile.revealed.rarity-sar::after {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 0;
          border-radius: 16px;
          pointer-events: none;
          background: linear-gradient(
            110deg,
            transparent 30%,
            rgba(255, 255, 255, 0.07) 50%,
            transparent 70%
          );
          background-size: 250% 100%;
          animation: tileShimmer 3.0s linear 1.2s infinite;
        }
        .card-tile.revealed.rarity-ur::after {
          background: linear-gradient(110deg, transparent 30%, rgba(34, 211, 238, 0.11) 50%, transparent 70%);
          background-size: 250% 100%;
          animation: tileShimmer 2.2s linear 1.0s infinite;
        }
        .card-tile.revealed.rarity-sar::after {
          background: linear-gradient(110deg, transparent 30%, rgba(168, 85, 247, 0.14) 50%, transparent 70%);
          background-size: 250% 100%;
          animation: tileShimmer 1.9s linear 0.8s infinite;
        }

        @keyframes tileFloat {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-5px); }
        }
        @keyframes tileGoldBright {
          from { filter: drop-shadow(0 4px 12px rgba(250, 204, 21, 0.55)) brightness(1.0); }
          to   { filter: drop-shadow(0 4px 18px rgba(250, 204, 21, 0.8))  brightness(1.14); }
        }
        @keyframes tileHueUR {
          from { filter: drop-shadow(0 4px 14px rgba(34, 211, 238, 0.65)) hue-rotate(0deg); }
          to   { filter: drop-shadow(0 4px 14px rgba(34, 211, 238, 0.65)) hue-rotate(360deg); }
        }
        @keyframes tileHueSAR {
          from { filter: drop-shadow(0 4px 14px rgba(245, 243, 255, 0.58)) brightness(1); }
          to   { filter: drop-shadow(0 4px 20px rgba(88, 28, 135, 0.76)) brightness(1.12); }
        }
        @keyframes tileShimmer {
          0%   { background-position: -100% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes rareCardSpin {
          to { transform: rotate(360deg); }
        }
        @keyframes rareWaitingUR {
          from { transform: translateY(0) scale(1); filter: brightness(1); }
          to   { transform: translateY(-4px) scale(1.03); filter: brightness(1.34); }
        }

        @keyframes rareWaitingSAR {
          from { transform: translateY(0) scale(1); filter: brightness(0.94); }
          to   { transform: translateY(-4px) scale(1.025); filter: brightness(1.22); }
        }

        @keyframes sealCrackPulse {
          0%, 42%, 100% { opacity: 0.18; filter: brightness(0.8); }
          48%, 58%      { opacity: 0.78; filter: brightness(1.55); }
        }

        @keyframes emojiPopN {
          0%   { transform: scale(0.3) translateY(10px); opacity: 0; }
          70%  { transform: scale(1.15) translateY(-4px); opacity: 1; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes emojiPopR {
          0%   { transform: scale(0.2) translateY(14px); opacity: 0; }
          65%  { transform: scale(1.35) translateY(-8px); opacity: 1; }
          85%  { transform: scale(0.92) translateY(2px); }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes emojiPopSR {
          0%   { transform: scale(0.1) translateY(18px); opacity: 0; }
          60%  { transform: scale(1.6) translateY(-12px); opacity: 1; }
          80%  { transform: scale(0.88) translateY(3px); }
          92%  { transform: scale(1.06) translateY(-2px); }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes emojiPopSSR {
          0%   { transform: scale(0.05) translateY(22px); opacity: 0; }
          55%  { transform: scale(1.9) translateY(-16px); opacity: 1; }
          75%  { transform: scale(0.84) translateY(5px); }
          90%  { transform: scale(1.1) translateY(-4px); }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes emojiPopUR {
          0%   { transform: scale(0.02) translateY(26px); opacity: 0; }
          50%  { transform: scale(2.3) translateY(-20px); opacity: 1; }
          70%  { transform: scale(0.78) translateY(7px); }
          87%  { transform: scale(1.16) translateY(-6px); }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes emojiPopSAR {
          0%   { transform: scale(0.01) translateY(30px) rotate(-8deg); opacity: 0; }
          45%  { transform: scale(2.7) translateY(-24px) rotate(5deg); }
          68%  { transform: scale(0.74) translateY(9px) rotate(-2deg); }
          86%  { transform: scale(1.22) translateY(-8px) rotate(1deg); }
          100% { transform: scale(1) translateY(0) rotate(0deg); opacity: 1; }
        }
        /* GOD PACK effects */
        .pack-open-page.god-pack .cards-panel {
          border: 2px solid rgba(255, 210, 60, 0.85);
          box-shadow: 0 0 28px rgba(255, 200, 40, 0.5), inset 0 0 18px rgba(255, 210, 60, 0.12);
          animation: godPanelPulse 2.4s ease-in-out infinite alternate;
        }
        .pack-open-page.god-pack .card-tile.god-marked.sealed::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 12px;
          background: radial-gradient(ellipse at 50% 60%, rgba(255,215,60,0.35) 0%, transparent 72%);
          pointer-events: none;
          animation: godCardAura 2s ease-in-out infinite alternate;
          z-index: 0;
        }
        .god-pack-omen {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 5px 12px;
          border: 1px solid rgba(250, 204, 21, 0.4);
          border-radius: 999px;
          color: #fef3c7;
          background: rgba(2, 6, 23, 0.54);
          box-shadow: 0 0 18px rgba(250, 204, 21, 0.16);
          font-size: 11px;
          font-weight: 1000;
          letter-spacing: 0;
          animation: godOmenStill 1.2s steps(2, end) infinite;
        }
        .god-pack-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 14px;
          border-radius: 20px;
          background: linear-gradient(90deg, #b8860b, #ffd700, #ffec6e, #ffd700, #b8860b);
          background-size: 300% 100%;
          color: #3a2000;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          animation: godBadgeShimmer 1.8s linear infinite;
          box-shadow: 0 2px 12px rgba(255, 200, 0, 0.7);
        }
        @keyframes godPanelPulse {
          from { box-shadow: 0 0 18px rgba(255,200,40,0.35), inset 0 0 12px rgba(255,210,60,0.08); }
          to   { box-shadow: 0 0 42px rgba(255,210,60,0.75), inset 0 0 26px rgba(255,215,60,0.22); }
        }
        @keyframes godCardAura {
          from { opacity: 0.6; }
          to   { opacity: 1; }
        }
        @keyframes godBadgeShimmer {
          0%   { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }
        @keyframes godOmenStill {
          0%, 84%, 100% { transform: translateX(0); opacity: 0.86; }
          86% { transform: translateX(-1px); opacity: 1; }
          88% { transform: translateX(1px); }
        }

        .pack-panel-frame.opening-pack {
          border-color: rgba(250, 204, 21, 0.26);
          background:
            radial-gradient(circle at 50% 28%, rgba(250, 204, 21, 0.12), transparent 38%),
            linear-gradient(180deg, rgba(15, 23, 42, 0.94), rgba(2, 6, 23, 0.98));
        }

        .card-back {
          background:
            linear-gradient(120deg, transparent 0 36%, rgba(255, 255, 255, 0.18) 44%, transparent 52%) -180% 0 / 260% 100%,
            repeating-linear-gradient(90deg, rgba(255,255,255,0.035) 0 1px, transparent 1px 9px),
            radial-gradient(circle at 50% 28%, rgba(250, 204, 21, 0.18), transparent 34%),
            linear-gradient(rgba(8, 15, 36, 1), rgba(8, 15, 36, 1)) padding-box,
            linear-gradient(160deg, rgba(250, 204, 21, 0.78), rgba(251, 113, 133, 0.42), rgba(34, 211, 238, 0.72)) border-box;
          animation: packBackSheen 2.8s ease-in-out infinite;
        }

        .card-back .seal-ring {
          width: 72%;
          height: 2px;
          aspect-ratio: auto;
          border: 0;
          border-radius: 999px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.84), rgba(250,204,21,0.7), transparent);
          box-shadow: 0 0 16px rgba(250, 204, 21, 0.42);
          animation: packTearLine 1.6s ease-in-out infinite alternate;
        }

        .card-back .seal-crack {
          width: 76%;
          height: 18px;
          clip-path: none;
          opacity: 0.58;
          background:
            radial-gradient(circle, rgba(255,255,255,0.72) 0 1px, transparent 1.5px) 0 50% / 12px 4px repeat-x;
          animation: packPerforation 1.3s ease-in-out infinite alternate;
        }

        .card-back .seal-bolt {
          width: 38%;
          height: 78%;
          clip-path: none;
          border-radius: 999px;
          opacity: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.32), transparent);
          animation: packVerticalGlint 2.1s ease-in-out infinite;
        }

        .card-back > span:last-child {
          width: 30%;
          border-radius: 12px;
          border-color: rgba(250, 204, 21, 0.58);
          background:
            radial-gradient(circle at 50% 35%, rgba(255,255,255,0.18), transparent 42%),
            linear-gradient(160deg, rgba(250, 204, 21, 0.22), rgba(34, 211, 238, 0.12));
          animation: packBadgePulse 1.9s ease-in-out infinite alternate;
        }

        .card-tile.current {
          outline-color: rgba(250, 204, 21, 0.72);
          box-shadow:
            0 0 22px rgba(250, 204, 21, 0.22),
            0 4px 24px rgba(0, 0, 0, 0.32);
        }

        .card-tile.sealed.current.rarity-ssr .card-back::after,
        .card-tile.sealed.current.rarity-ur .card-back::after,
        .card-tile.sealed.current.rarity-sar .card-back::after {
          background: linear-gradient(112deg, transparent 18%, rgba(255,255,255,0.52) 46%, transparent 62%);
          opacity: 0;
          animation: packRareSweep 0.95s ease-in-out infinite;
        }

        .card-tile.current.rarity-ssr .seal-crack,
        .card-tile.current.rarity-sar .seal-crack,
        .card-tile.current.rarity-ur .seal-bolt {
          opacity: 0.82;
          animation: packPerforation 0.72s ease-in-out infinite alternate;
        }

        .card-tile.revealed {
          animation: cardPackOpen 0.58s cubic-bezier(0.2, 1.12, 0.28, 1) both;
        }

        .card-tile.revealed.rarity-ssr,
        .card-tile.revealed.rarity-ur,
        .card-tile.revealed.rarity-sar {
          animation: cardPackOpenRare 0.72s cubic-bezier(0.16, 1.22, 0.24, 1) both;
        }

        @keyframes packBackSheen {
          0%, 68% { background-position: -180% 0, 0 0, 0 0, 0 0, 0 0; }
          100% { background-position: 180% 0, 0 0, 0 0, 0 0, 0 0; }
        }

        @keyframes packTearLine {
          from { transform: translate(-50%, -50%) scaleX(0.82); opacity: 0.52; }
          to { transform: translate(-50%, -50%) scaleX(1.08); opacity: 1; }
        }

        @keyframes packPerforation {
          from { transform: translate(-50%, -50%) translateY(0); filter: brightness(0.9); }
          to { transform: translate(-50%, -50%) translateY(-2px); filter: brightness(1.45); }
        }

        @keyframes packVerticalGlint {
          0%, 44%, 100% { opacity: 0; transform: translate(-90%, -50%); }
          58% { opacity: 0.74; transform: translate(20%, -50%); }
        }

        @keyframes packBadgePulse {
          from { box-shadow: 0 0 16px rgba(250, 204, 21, 0.3); transform: rotate(45deg) scale(0.98); }
          to { box-shadow: 0 0 28px rgba(34, 211, 238, 0.34); transform: rotate(45deg) scale(1.08); }
        }

        @keyframes packRareSweep {
          0% { opacity: 0; transform: translateX(-72%); }
          34% { opacity: 0.72; }
          100% { opacity: 0; transform: translateX(72%); }
        }

        @keyframes cardPackOpen {
          0% { opacity: 0; transform: perspective(520px) rotateY(78deg) translateY(8px) scale(0.9); filter: brightness(1.8); }
          58% { opacity: 1; transform: perspective(520px) rotateY(-7deg) translateY(-3px) scale(1.04); filter: brightness(1.08); }
          100% { opacity: 1; transform: perspective(520px) rotateY(0deg) translateY(0) scale(1); filter: brightness(1); }
        }

        @keyframes cardPackOpenRare {
          0% { opacity: 0; transform: perspective(520px) rotateY(84deg) translateY(12px) scale(0.84); filter: brightness(2.8) saturate(1.4); }
          44% { opacity: 1; transform: perspective(520px) rotateY(-13deg) translateY(-8px) scale(1.11); filter: brightness(1.22) saturate(1.2); }
          72% { transform: perspective(520px) rotateY(4deg) translateY(2px) scale(0.98); }
          100% { transform: perspective(520px) rotateY(0deg) translateY(0) scale(1); filter: brightness(1); }
        }

        .result-actions {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 10px;
        }

        .result-nav-icons {
          display: flex;
          justify-content: center;
          width: 100%;
        }

        .pack-open-page.tenpack-result-bg .result-nav-icons {
          border-radius: 999px;
          padding: 8px 12px;
          background: rgba(2, 6, 23, 0.42);
          backdrop-filter: blur(8px);
        }

        button,
        .error-panel a {
          min-height: 42px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 999px;
          padding: 9px 17px;
          color: #fff;
          background: rgba(15, 23, 42, 0.78);
          font-size: 14px;
          font-weight: 900;
          text-decoration: none;
          cursor: pointer;
        }

        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .error-panel {
          width: min(100%, 520px);
          margin: auto;
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 22px;
          padding: 28px;
          background: rgba(15, 23, 42, 0.78);
          text-align: center;
        }

        .error-panel h1 {
          margin: 8px 0;
        }

        .error-panel span {
          display: block;
          margin-bottom: 18px;
          color: #cbd5e1;
        }

        @keyframes packFloat {
          from { transform: translateY(0) rotate(-2deg); }
          to { transform: translateY(-12px) rotate(2deg); }
        }

        @keyframes packOpeningPulse {
          from {
            transform: translateY(0) rotate(-1.5deg) scale(1);
            filter: drop-shadow(0 22px 28px rgba(0, 0, 0, 0.5)) drop-shadow(0 0 18px rgba(168, 85, 247, 0.34));
          }
          to {
            transform: translateY(-7px) rotate(1.5deg) scale(1.045);
            filter: drop-shadow(0 26px 30px rgba(0, 0, 0, 0.5)) drop-shadow(0 0 46px rgba(250, 204, 21, 0.62));
          }
        }

        @keyframes packEnvelopeOpen {
          from { transform: perspective(420px) rotateX(0deg) scale(1); filter: brightness(1); }
          to { transform: perspective(420px) rotateX(-8deg) scale(0.985); filter: brightness(1.22); }
        }

        @keyframes packSeamLight {
          0% { opacity: 0; transform: scaleX(0.18) translateY(0); }
          34% { opacity: 1; transform: scaleX(1.08) translateY(-1px); }
          100% { opacity: 0; transform: scaleX(0.32) translateY(-8px); }
        }

        @keyframes packCardPeek {
          from { opacity: 0.16; transform: translate(-50%, 34%) scale(0.54) rotate(-2deg); }
          to { opacity: 0.9; transform: translate(-50%, -6%) scale(0.74) rotate(2deg); }
        }

        @keyframes packChargeGlow {
          from { transform: scale(0.8); opacity: 0.22; }
          to { transform: scale(1.18); opacity: 0.86; }
        }

        @keyframes packOpenBurst {
          0% { transform: scale(0.55); opacity: 0; }
          24% { opacity: 0.95; }
          100% { transform: scale(1.45); opacity: 0; }
        }

        @keyframes cardIn {
          from { opacity: 0; transform: scale(0.92) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        @keyframes flipIn {
          0%   { opacity: 0; transform: perspective(480px) rotateY(88deg) scale(0.88); filter: brightness(2.4); }
          32%  { opacity: 1; filter: brightness(1.5); }
          64%  { transform: perspective(480px) rotateY(-8deg) scale(1.06); filter: brightness(1.05); }
          82%  { transform: perspective(480px) rotateY(3deg) scale(0.98); }
          100% { transform: perspective(480px) rotateY(0deg) scale(1); filter: brightness(1); }
        }
        @keyframes flipInLegend {
          0%   { opacity: 0; transform: perspective(440px) rotateY(92deg) scale(0.76); filter: brightness(7) saturate(2.2); }
          22%  { opacity: 1; filter: brightness(3.2) saturate(1.7); }
          52%  { transform: perspective(440px) rotateY(-16deg) scale(1.20); filter: brightness(1.15); }
          74%  { transform: perspective(440px) rotateY(5deg) scale(0.94); }
          100% { transform: perspective(440px) rotateY(0deg) scale(1); filter: brightness(1); }
        }

        @keyframes rareWaiting {
          from { transform: translateY(0) scale(1); filter: brightness(1); }
          to { transform: translateY(-3px) scale(1.02); filter: brightness(1.25); }
        }

        @keyframes rareAfterglow {
          from { box-shadow: 0 0 24px rgba(250, 204, 21, 0.24), 0 18px 52px rgba(0, 0, 0, 0.27); }
          to { box-shadow: 0 0 44px rgba(250, 204, 21, 0.5), 0 18px 52px rgba(0, 0, 0, 0.27); }
        }

        @keyframes flashOut {
          from { opacity: 0.86; }
          to { opacity: 0; }
        }

        @media (max-width: 900px) {
          .pack-open-page {
            overflow-y: auto;
            place-items: start center;
            padding: 14px;
          }

          /* 10連パックはページ全体を固定高さの2段レイアウトに */
          .pack-open-page.mode-ten {
            height: 100svh;
            overflow: hidden;
            padding: 0;
            display: flex;
            flex-direction: column;
            align-items: stretch;
          }

          .pack-open-page.mode-ten .open-shell {
            flex: 1;
            min-height: 0;
            display: flex;
            flex-direction: column;
            width: 100%;
            max-width: 100%;
          }

          .pack-open-page.mode-ten .summon-layout {
            flex: 1;
            min-height: 0;
            display: flex;
            flex-direction: column;
          }

          .pack-open-page.mode-ten .pack-panel {
            flex-shrink: 0;
            padding: 10px 14px 6px;
            background: #020617;
          }

          .pack-open-page.mode-ten .cards-panel {
            flex: 1;
            min-height: 0;
            overflow-y: auto;
            padding: 0 14px 14px;
          }

          /* 通常（1枚）開封 */
          .summon-layout {
            grid-template-columns: 1fr;
          }

          .pack-panel-frame {
            min-height: 260px;
            grid-template-columns: auto 1fr;
            text-align: left;
          }

          .pack-open-page.mode-ten .pack-panel-frame,
          .pack-panel-frame.result-card {
            width: min(100%, 252px);
            height: 260px;
            min-height: 260px;
            max-height: 260px;
            grid-template-columns: 1fr;
            text-align: center;
            margin: 0 auto;
          }

          .pack-open-page.mode-ten .pack-panel-frame:not(.result-card) .pack-image {
            width: 101px;
            grid-row: auto;
          }

          .pack-panel-frame .pack-image {
            width: 94px;
            grid-row: span 3;
          }

          .cards-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            grid-template-rows: none;
          }

          .card-tile {
            min-height: 140px;
          }

          .pack-open-page.tenpack-result-bg::before {
            background-position: center top;
          }

          .pack-open-page.tenpack-result-bg::after {
            background:
              radial-gradient(circle at 30% 24%, rgba(168, 85, 247, 0.2), transparent 36%),
              radial-gradient(circle at 80% 58%, rgba(34, 211, 238, 0.16), transparent 34%),
              linear-gradient(180deg, rgba(2, 6, 23, 0.66), rgba(2, 6, 23, 0.78));
          }
        }

        @media (max-width: 480px) {
          .result-head {
            align-items: flex-start;
            flex-direction: column;
          }

        }

        /* ============================================
           PACK DISPLAY — 1枚開封と同じカード演出
        ============================================ */
        .pack-panel .pack-display {
          width: min(100%, 252px);
          min-height: 352px;
          height: auto;
          align-self: center;
          justify-self: center;
        }

        /* 初期状態のパック画像サイズ */
        .pack-panel .pack-display .pack-image {
          width: 101px;
          margin-top: 20px;
        }

        /* カード名は長くなるので小さめに・3行まで許可 */
        .pack-panel .pack-display.opened h2 {
          font-size: 20px;
          margin: 6px 12px 0;
          -webkit-line-clamp: 3;
        }

        /* レアカードでコンテンツが詰まらないよう縮小 */
        .pack-panel .pack-display .pack-result-emoji {
          font-size: 60px;
          margin-top: 12px;
        }
        .pack-panel .pack-display .pack-rarity-callout {
          padding: 5px 11px;
          font-size: 9px;
          margin: 8px auto -4px;
        }
        .pack-panel .pack-display .pack-card-rarity {
          margin-top: 10px;
          padding: 5px 10px;
          font-size: 10px;
        }
        .pack-panel .pack-display p {
          margin-top: 8px;
        }

        .pack-display {
          position: relative;
          overflow: hidden;
          border-radius: 32px;
          padding: 4px 4px 20px;
          background: linear-gradient(135deg, #facc15, #a855f7, #22d3ee);
          box-shadow: 0 0 70px rgba(168, 85, 247, 0.28), 0 28px 80px rgba(0, 0, 0, 0.45);
          display: flex;
          flex-direction: column;
          align-items: center;
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

        .eq-display-shine {
          position: absolute;
          inset: 4px;
          border-radius: 28px;
          background: linear-gradient(155deg, rgba(255,255,255,0.08) 0%, transparent 48%);
          z-index: 1;
          pointer-events: none;
        }

        /* ── 開封アニメ ── */
        .pack-display.opened {
          animation: packDisplayReveal 0.68s cubic-bezier(0.2, 1.2, 0.34, 1) both;
        }

        /* ── レアリティ別枠色 ── */
        .pack-display.opened.rarity-n {
          background: linear-gradient(135deg, #475569, #64748b, #334155);
          box-shadow: 0 0 28px rgba(100, 116, 139, 0.22), 0 28px 80px rgba(0,0,0,0.45);
        }
        .pack-display.opened.rarity-r {
          background: linear-gradient(135deg, #22d3ee, #0891b2, #0ea5e9);
          box-shadow: 0 0 64px rgba(34, 211, 238, 0.5), 0 28px 80px rgba(0,0,0,0.45);
        }
        .pack-display.opened.rarity-sr {
          background: linear-gradient(135deg, #a855f7, #7c3aed, #4f46e5, #22d3ee);
          box-shadow: 0 0 96px rgba(168, 85, 247, 0.55), 0 28px 80px rgba(0,0,0,0.45);
        }
        .pack-display.opened.rarity-ssr {
          background: linear-gradient(135deg, #facc15, #f59e0b, #ea580c, #db2777);
          box-shadow: 0 0 80px rgba(250, 204, 21, 0.68), 0 0 130px rgba(234, 88, 12, 0.38);
        }
        .pack-display.opened.rarity-ur {
          background: conic-gradient(from 0deg, #fff, #fde047, #fb7185, #a855f7, #22d3ee, #86efac, #fff);
          box-shadow: 0 0 80px rgba(255, 255, 255, 0.85), 0 0 160px rgba(34, 211, 238, 0.55);
        }
        .pack-display.opened.rarity-sar {
          background: conic-gradient(from 0deg, #f8f0ff, #c084fc, #7c3aed, #4c1d95, #7c3aed, #c084fc, #f8f0ff);
          box-shadow: 0 0 80px rgba(168, 85, 247, 0.85), 0 0 160px rgba(124, 58, 237, 0.55);
        }

        /* ── プライズ演出 ── */
        .pack-display.prize-reveal {
          isolation: isolate;
          animation:
            packDisplayReveal 0.68s cubic-bezier(0.2, 1.2, 0.34, 1) both,
            packDisplayPrizeBurst 1.4s ease both;
        }
        .pack-display.prize-sr {
          background: linear-gradient(135deg, #a855f7, #7c3aed, #22d3ee, #a855f7);
          box-shadow: 0 0 48px rgba(168, 85, 247, 0.65), 0 0 108px rgba(168, 85, 247, 0.32);
        }
        .pack-display.prize-ssr {
          background: conic-gradient(from 30deg, #fde047, #fb7185, #a855f7, #22d3ee, #fde047);
          box-shadow: 0 0 44px rgba(250, 204, 21, 0.66), 0 0 120px rgba(251, 113, 133, 0.42), 0 0 170px rgba(34, 211, 238, 0.28);
        }
        .pack-display.prize-ur {
          background: conic-gradient(from 0deg, #fff, #fde047, #fb7185, #a855f7, #22d3ee, #86efac, #fde047, #fff);
          box-shadow: 0 0 60px rgba(255, 255, 255, 0.72), 0 0 130px rgba(251, 113, 133, 0.55), 0 0 200px rgba(34, 211, 238, 0.38);
          animation: packDisplayPrizeShimmer 0.9s ease both, packDisplayUrPulse 1.8s 0.9s ease-in-out infinite alternate;
        }
        .pack-display.prize-sar {
          background: conic-gradient(from 0deg, #f8f0ff, #e879f9, #a855f7, #4c1d95, #a855f7, #e879f9, #f8f0ff);
          box-shadow: 0 0 60px rgba(168, 85, 247, 0.8), 0 0 130px rgba(232, 121, 249, 0.55), 0 0 200px rgba(124, 58, 237, 0.38);
          animation: packDisplayPrizeShimmer 0.9s ease both, packDisplaySarPulse 1.8s 0.9s ease-in-out infinite alternate;
        }
        .pack-display.prize-reveal::after {
          content: "";
          position: absolute;
          inset: -34%;
          z-index: 1;
          pointer-events: none;
          background:
            linear-gradient(90deg, transparent 38%, rgba(255,255,255,0.8), transparent 62%),
            radial-gradient(circle, rgba(255,255,255,0.34) 0 2px, transparent 3px);
          background-size: 100% 100%, 46px 46px;
          mix-blend-mode: screen;
          animation: packDisplayPrizeSweep 1.15s ease both;
        }

        /* ── コンテンツ z-index ── */
        .pack-display .pack-rarity-callout,
        .pack-display .pack-card-rarity,
        .pack-display .pack-result-emoji,
        .pack-display p,
        .pack-display h2,
        .pack-display .pack-display-meta,
        .pack-display .pack-stage-chip {
          position: relative;
          z-index: 2;
          text-align: center;
        }

        /* エフェクト span は absolute 位置にリセット */
        .pack-display .card-reveal-effects span,
        .pack-display .pack-prize-effects span {
          position: absolute;
          display: block;
          margin: 0;
          max-width: none;
          text-align: left;
        }

        /* ── レアリティ表示コールアウト ── */
        .pack-rarity-callout {
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
          animation: packDisplayCallout 0.72s cubic-bezier(0.2, 1.3, 0.34, 1) both;
        }
        .pack-rarity-callout.callout-sr {
          background: linear-gradient(90deg, #a855f7, #7c3aed, #22d3ee, #a855f7);
          color: #ffffff;
          box-shadow: 0 0 24px rgba(168, 85, 247, 0.75), 0 0 50px rgba(34, 211, 238, 0.38);
          animation: packDisplayCallout 0.72s cubic-bezier(0.2, 1.3, 0.34, 1) both, packCalloutSRPulse 1.6s ease-in-out 0.72s infinite alternate;
        }
        .pack-rarity-callout.callout-ssr {
          background: linear-gradient(90deg, #fde047, #fb923c, #fb7185, #fde047);
          color: #050816;
          box-shadow: 0 0 28px rgba(250, 204, 21, 0.8), 0 0 56px rgba(251, 113, 133, 0.45);
          font-size: 12px;
          padding: 8px 16px;
          animation: packDisplayCallout 0.72s cubic-bezier(0.2, 1.3, 0.34, 1) both, packCalloutSSRPulse 1.4s ease-in-out 0.72s infinite alternate;
        }
        .pack-rarity-callout.callout-ur {
          background: conic-gradient(from 0deg, #fff, #fde047, #fb7185, #a855f7, #22d3ee, #86efac, #fff);
          color: #050816;
          box-shadow: 0 0 36px rgba(255,255,255,0.9), 0 0 70px rgba(34,211,238,0.55), 0 0 110px rgba(168,85,247,0.4);
          font-size: 13px;
          padding: 9px 18px;
          letter-spacing: 0.18em;
          animation: packDisplayCallout 0.72s cubic-bezier(0.2, 1.3, 0.34, 1) both, packCalloutURPulse 1.1s ease-in-out 0.72s infinite alternate;
        }
        .pack-rarity-callout.callout-sar {
          background: linear-gradient(90deg, #f8f0ff, #c084fc, #7c3aed, #c084fc, #f8f0ff);
          color: #f8f0ff;
          box-shadow: 0 0 36px rgba(168,85,247,0.9), 0 0 70px rgba(232,121,249,0.55), 0 0 110px rgba(124,58,237,0.4);
          font-size: 13px;
          padding: 9px 18px;
          letter-spacing: 0.18em;
          animation: packDisplayCallout 0.72s cubic-bezier(0.2, 1.3, 0.34, 1) both, packCalloutSARPulse 1.1s ease-in-out 0.72s infinite alternate;
        }

        /* ── レアリティチップ ── */
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
        .pack-display.opened.rarity-n .pack-card-rarity { background: rgba(148,163,184,0.12); border-color: rgba(148,163,184,0.32); color: #cbd5e1; }
        .pack-display.opened.rarity-r .pack-card-rarity { background: rgba(34,211,238,0.12); border-color: rgba(34,211,238,0.48); color: #a5f3fc; }
        .pack-display.opened.rarity-sr .pack-card-rarity { background: rgba(168,85,247,0.16); border-color: rgba(168,85,247,0.58); color: #d8b4fe; font-size: 12px; padding: 7px 14px; }
        .pack-display.opened.rarity-ssr .pack-card-rarity { background: linear-gradient(90deg, rgba(250,204,21,0.18), rgba(251,146,60,0.14)); border-color: rgba(250,204,21,0.62); color: #fde047; font-size: 12px; padding: 8px 15px; box-shadow: 0 0 18px rgba(250,204,21,0.3); }
        .pack-display.opened.rarity-ur .pack-card-rarity,
        .pack-display.opened.rarity-sar .pack-card-rarity {
          background: linear-gradient(#0a0e1f, #0a0e1f) padding-box,
            conic-gradient(from 0deg, #ff50c8, #64c8ff, #facc15, #ff50c8) border-box;
          border: 2px solid transparent;
          color: white;
          font-size: 13px;
          padding: 8px 16px;
          box-shadow: 0 0 22px rgba(255,80,200,0.4), 0 0 38px rgba(100,200,255,0.28);
        }

        /* ── 絵文字 ── */
        .pack-result-emoji {
          margin-top: 20px;
          font-size: 78px;
          filter: drop-shadow(0 16px 22px rgba(0,0,0,0.42));
        }
        .pack-display.opened .pack-result-emoji {
          animation: packDisplayEmojiPop 0.78s cubic-bezier(0.18, 1.25, 0.34, 1) both,
                     packDisplayEmojiFloat 2.8s ease-in-out 0.78s infinite;
        }
        .pack-display.opened.rarity-ssr .pack-result-emoji {
          animation: packDisplayEmojiPop 0.86s cubic-bezier(0.18, 1.35, 0.34, 1) both,
                     packDisplayEmojiFloat 2.4s ease-in-out 0.86s infinite;
        }
        .pack-display.opened.rarity-ur .pack-result-emoji,
        .pack-display.opened.rarity-sar .pack-result-emoji {
          animation: packDisplayEmojiPop 0.92s cubic-bezier(0.18, 1.35, 0.34, 1) both,
                     packDisplayEmojiFloat 2.2s ease-in-out 0.92s infinite,
                     packDisplayEmojiHue 3s linear 0.92s infinite;
          filter: drop-shadow(0 0 18px rgba(255,80,200,0.8)) drop-shadow(0 0 36px rgba(100,200,255,0.5));
        }

        /* ── テキスト ── */
        .pack-display p { margin: 12px 0 0; color: #fde68a; font-size: 11px; font-weight: 1000; letter-spacing: 0.18em; }
        .pack-display h2 { margin: 8px 18px 0; font-size: 26px; line-height: 1.15; font-weight: 1000; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
        .pack-display-meta { display: block; margin: 6px auto 0; max-width: 220px; color: #cbd5e1; font-size: 13px; line-height: 1.3; font-weight: 900; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .pack-display.opened .pack-card-rarity,
        .pack-display.opened p,
        .pack-display.opened h2,
        .pack-display.opened .pack-stage-chip { animation: packDisplayCopyRise 0.58s ease both; }
        .pack-display.opened h2 { animation-delay: 0.08s; }
        .pack-display.opened .pack-display-meta,
        .pack-display.opened .pack-stage-chip { animation-delay: 0.15s; }

        /* ── ステージチップ ── */
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

        /* ── スパーク エフェクト ── */
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
          animation: packDisplaySpark 0.9s ease-out both;
        }
        .card-reveal-effects.rarity-n span { color: #a5f3fc; background: #a5f3fc; animation-duration: 0.72s; }
        .card-reveal-effects.rarity-r span { color: #22d3ee; background: #67e8f9; animation-duration: 0.84s; }
        .card-reveal-effects.rarity-sr span { color: #fde047; background: linear-gradient(135deg, #fde047, #a855f7); animation-duration: 1.04s; }
        .card-reveal-effects.rarity-ssr span,
        .card-reveal-effects.rarity-ur span,
        .card-reveal-effects.rarity-sar span { color: #fde68a; background: linear-gradient(135deg, #fff, #fde047, #fb7185, #22d3ee); animation-duration: 1.24s; }
        .card-reveal-effects.rarity-ur span,
        .card-reveal-effects.rarity-sar span { --spark-size: 10px; box-shadow: 0 0 22px #fff, 0 0 36px #22d3ee; }

        .card-reveal-effects span:nth-child(1)  { --spark-x: -104px; --spark-y: -150px; animation-delay: 0.02s; }
        .card-reveal-effects span:nth-child(2)  { --spark-x: -56px;  --spark-y: -178px; animation-delay: 0.09s; }
        .card-reveal-effects span:nth-child(3)  { --spark-x: 12px;   --spark-y: -170px; animation-delay: 0.04s; }
        .card-reveal-effects span:nth-child(4)  { --spark-x: 86px;   --spark-y: -140px; animation-delay: 0.12s; }
        .card-reveal-effects span:nth-child(5)  { --spark-x: 112px;  --spark-y: -34px;  animation-delay: 0.03s; }
        .card-reveal-effects span:nth-child(6)  { --spark-x: 72px;   --spark-y: 94px;   animation-delay: 0.10s; }
        .card-reveal-effects span:nth-child(7)  { --spark-x: -16px;  --spark-y: 122px;  animation-delay: 0.06s; }
        .card-reveal-effects span:nth-child(8)  { --spark-x: -96px;  --spark-y: 72px;   animation-delay: 0.14s; }
        .card-reveal-effects span:nth-child(9)  { --spark-x: -124px; --spark-y: -42px;  animation-delay: 0.07s; }
        .card-reveal-effects span:nth-child(10) { --spark-x: 126px;  --spark-y: 48px;   animation-delay: 0.16s; }
        .card-reveal-effects span:nth-child(11) { --spark-x: 48px;   --spark-y: -166px; animation-delay: 0.05s; }
        .card-reveal-effects span:nth-child(12) { --spark-x: -78px;  --spark-y: 118px;  animation-delay: 0.11s; }
        .card-reveal-effects span:nth-child(13) { --spark-x: 140px;  --spark-y: -88px;  animation-delay: 0.08s; }
        .card-reveal-effects span:nth-child(14) { --spark-x: -144px; --spark-y: 26px;   animation-delay: 0.13s; }
        .card-reveal-effects span:nth-child(15) { --spark-x: 80px;   --spark-y: 140px;  animation-delay: 0.04s; }
        .card-reveal-effects span:nth-child(16) { --spark-x: -34px;  --spark-y: -192px; animation-delay: 0.15s; }
        .card-reveal-effects span:nth-child(17) { --spark-x: 158px;  --spark-y: 60px;   animation-delay: 0.06s; }
        .card-reveal-effects span:nth-child(18) { --spark-x: -158px; --spark-y: -58px;  animation-delay: 0.18s; }
        .card-reveal-effects span:nth-child(19) { --spark-x: -90px;  --spark-y: 162px;  animation-delay: 0.03s; }
        .card-reveal-effects span:nth-child(20) { --spark-x: 104px;  --spark-y: -132px; animation-delay: 0.20s; }
        .card-reveal-effects span:nth-child(21) { --spark-x: -120px; --spark-y: 90px;   animation-delay: 0.07s; }
        .card-reveal-effects span:nth-child(22) { --spark-x: 130px;  --spark-y: -62px;  animation-delay: 0.12s; }
        .card-reveal-effects span:nth-child(23) { --spark-x: -50px;  --spark-y: -200px; animation-delay: 0.09s; }
        .card-reveal-effects span:nth-child(24) { --spark-x: 60px;   --spark-y: 168px;  animation-delay: 0.17s; }

        /* ── 光線エフェクト ── */
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
          background: linear-gradient(180deg, rgba(255,255,255,0), #fde68a, rgba(255,255,255,0));
          transform-origin: 50% 0;
          opacity: 0;
          animation: packDisplayPrizeRay 0.95s ease both;
        }
        .pack-prize-effects span:nth-child(1)  { transform: rotate(0deg)   translateY(-18px); }
        .pack-prize-effects span:nth-child(2)  { transform: rotate(60deg)  translateY(-18px); }
        .pack-prize-effects span:nth-child(3)  { transform: rotate(120deg) translateY(-18px); }
        .pack-prize-effects span:nth-child(4)  { transform: rotate(180deg) translateY(-18px); }
        .pack-prize-effects span:nth-child(5)  { transform: rotate(240deg) translateY(-18px); }
        .pack-prize-effects span:nth-child(6)  { transform: rotate(300deg) translateY(-18px); }
        .pack-prize-effects span:nth-child(7)  { transform: rotate(30deg)  translateY(-18px); animation-delay: 0.08s; }
        .pack-prize-effects span:nth-child(8)  { transform: rotate(210deg) translateY(-18px); animation-delay: 0.08s; }
        .pack-prize-effects span:nth-child(9)  { transform: rotate(90deg)  translateY(-18px); animation-delay: 0.04s; }
        .pack-prize-effects span:nth-child(10) { transform: rotate(150deg) translateY(-18px); animation-delay: 0.04s; }
        .pack-prize-effects span:nth-child(11) { transform: rotate(270deg) translateY(-18px); animation-delay: 0.12s; }
        .pack-prize-effects span:nth-child(12) { transform: rotate(330deg) translateY(-18px); animation-delay: 0.12s; }
        .pack-prize-effects span:nth-child(13) { transform: rotate(15deg)  translateY(-18px); animation-delay: 0.06s; }
        .pack-prize-effects span:nth-child(14) { transform: rotate(195deg) translateY(-18px); animation-delay: 0.06s; }
        .pack-prize-effects.rays-sr  span { background: linear-gradient(180deg, rgba(255,255,255,0), #c084fc, rgba(255,255,255,0)); }
        .pack-prize-effects.rays-ssr span { width: 11px; height: 88px; background: linear-gradient(180deg, rgba(255,255,255,0), #fde68a, rgba(255,255,255,0)); animation-duration: 1.05s; }
        .pack-prize-effects.rays-ur  span { width: 13px; height: 100px; background: linear-gradient(180deg, rgba(255,255,255,0), rgba(255,255,255,0.9), rgba(255,255,255,0)); animation-duration: 1.15s; }
        .pack-prize-effects.rays-sar span { width: 13px; height: 100px; background: linear-gradient(180deg, rgba(255,255,255,0), rgba(200,170,255,0.9), rgba(255,255,255,0)); animation-duration: 1.15s; }

        /* ── キーフレーム ── */
        @keyframes packDisplayReveal {
          0%   { transform: translateY(14px) rotateY(-18deg) scale(0.9); opacity: 0; }
          60%  { transform: translateY(-4px) rotateY(4deg) scale(1.035); opacity: 1; }
          100% { transform: translateY(0) rotateY(0deg) scale(1); opacity: 1; }
        }
        @keyframes packDisplayPrizeBurst {
          0%   { filter: saturate(1) brightness(1); }
          22%  { filter: saturate(1.45) brightness(1.32); }
          100% { filter: saturate(1.08) brightness(1.05); }
        }
        @keyframes packDisplayPrizeSweep {
          0%   { opacity: 0; transform: translateX(-46%) rotate(18deg) scale(0.92); }
          32%  { opacity: 0.95; }
          100% { opacity: 0; transform: translateX(46%) rotate(18deg) scale(1.06); }
        }
        @keyframes packDisplayPrizeRay {
          0%   { opacity: 0; }
          20%  { opacity: 0.9; }
          80%  { opacity: 0.5; }
          100% { opacity: 0; }
        }
        @keyframes packDisplayCallout {
          0%   { transform: translateY(10px) scale(0.74); opacity: 0; }
          62%  { transform: translateY(-2px) scale(1.08); opacity: 1; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes packCalloutSRPulse {
          from { box-shadow: 0 0 24px rgba(168,85,247,0.75), 0 0 50px rgba(34,211,238,0.38); }
          to   { box-shadow: 0 0 38px rgba(168,85,247,1.0), 0 0 80px rgba(34,211,238,0.6); transform: scale(1.03); }
        }
        @keyframes packCalloutSSRPulse {
          from { box-shadow: 0 0 28px rgba(250,204,21,0.8), 0 0 56px rgba(251,113,133,0.45); }
          to   { box-shadow: 0 0 44px rgba(250,204,21,1),   0 0 88px rgba(251,113,133,0.7); transform: scale(1.04); }
        }
        @keyframes packCalloutURPulse {
          from { transform: scale(1); box-shadow: 0 0 36px rgba(255,255,255,0.9), 0 0 70px rgba(34,211,238,0.55); }
          to   { transform: scale(1.08); box-shadow: 0 0 54px rgba(255,255,255,1), 0 0 110px rgba(34,211,238,0.85); }
        }
        @keyframes packCalloutSARPulse {
          from { transform: scale(1); box-shadow: 0 0 36px rgba(168,85,247,0.9), 0 0 70px rgba(232,121,249,0.55); }
          to   { transform: scale(1.08); box-shadow: 0 0 54px rgba(168,85,247,1), 0 0 110px rgba(232,121,249,0.85); }
        }
        @keyframes packDisplayEmojiPop {
          0%   { transform: translateY(18px) scale(0.48) rotate(-8deg); opacity: 0; }
          58%  { transform: translateY(-7px) scale(1.18) rotate(4deg); opacity: 1; }
          100% { transform: translateY(0) scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes packDisplayEmojiFloat {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-7px); }
        }
        @keyframes packDisplayEmojiHue {
          from { filter: drop-shadow(0 0 18px rgba(255,80,200,0.8)) hue-rotate(0deg) brightness(1.15); }
          to   { filter: drop-shadow(0 0 18px rgba(255,80,200,0.8)) hue-rotate(360deg) brightness(1.15); }
        }
        @keyframes packDisplayCopyRise {
          from { transform: translateY(10px); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
        @keyframes packDisplaySpark {
          0%   { transform: translate(-50%, -50%) scale(0.35); opacity: 0; }
          22%  { opacity: 1; }
          100% { transform: translate(-50%, -50%) translate(var(--spark-x), var(--spark-y)) scale(0.08); opacity: 0; }
        }
        @keyframes packDisplayPrizeShimmer {
          0%   { filter: brightness(1) saturate(1); }
          28%  { filter: brightness(1.72) saturate(1.6); }
          100% { filter: brightness(1.04) saturate(1.08); }
        }
        @keyframes packDisplayUrPulse {
          from { filter: brightness(1) hue-rotate(0deg); }
          to   { filter: brightness(1.32) saturate(1.4) hue-rotate(40deg); }
        }
        @keyframes packDisplaySarPulse {
          from { filter: brightness(1) hue-rotate(0deg); }
          to   { filter: brightness(1.28) saturate(1.3) hue-rotate(-20deg); }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.001ms !important;
          }
        }
      `}</style>
    </main>
  );
}

export default function PackOpenPage() {
  return (
    <Suspense fallback={<main className="pack-open-page" />}>
      <PackOpenContent />
    </Suspense>
  );
}
