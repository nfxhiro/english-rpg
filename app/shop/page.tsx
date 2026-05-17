"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadGold, spendGold } from "../../data/hero";
import {
  loadShopState,
  saveShopState,
  ShopItem,
  ShopState,
  SHOP_AVATARS,
  SHOP_TITLES,
  SHOP_BACKGROUNDS,
  SHOP_FRAMES,
  SHOP_EFFECTS,
} from "../../data/shop";

type ShopTab = "avatar" | "title" | "background" | "frame" | "effect";

const DEFAULT_STATE: ShopState = {
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

const TAB_ITEMS: Record<ShopTab, ShopItem[]> = {
  avatar: SHOP_AVATARS,
  title: SHOP_TITLES,
  background: SHOP_BACKGROUNDS,
  frame: SHOP_FRAMES,
  effect: SHOP_EFFECTS,
};

const TAB_LABELS: Record<ShopTab, string> = {
  avatar: "🧑 アバター",
  title: "👑 称号",
  background: "🌌 背景",
  frame: "🖼️ フレーム",
  effect: "✨ エフェクト",
};

export default function ShopPage() {
  const [gold, setGold] = useState(0);
  const [shopState, setShopState] = useState<ShopState>(DEFAULT_STATE);
  const [activeTab, setActiveTab] = useState<ShopTab>("avatar");
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setGold(loadGold());
      setShopState(loadShopState());
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function getOwnedList(category: ShopItemCategory): string[] {
    if (category === "avatar") return shopState.ownedAvatars;
    if (category === "title") return shopState.ownedTitles;
    if (category === "background") return shopState.ownedBackgrounds;
    if (category === "frame") return shopState.ownedFrames;
    return shopState.ownedEffects;
  }

  function isOwned(item: ShopItem): boolean {
    return getOwnedList(item.category).includes(item.id);
  }

  function isEquipped(item: ShopItem): boolean {
    if (item.category === "avatar") return shopState.selectedAvatar === item.id;
    if (item.category === "title") return shopState.selectedTitle === item.name;
    if (item.category === "background") return shopState.selectedBackground === item.id;
    if (item.category === "frame") return shopState.selectedFrame === item.id;
    return shopState.selectedEffect === item.id;
  }

  function handlePurchase(item: ShopItem) {
    if (gold < item.price || isOwned(item)) return;
    const success = spendGold(item.price);
    if (!success) return;

    const newGold = loadGold();
    setGold(newGold);

    const newState = { ...shopState };
    if (item.category === "avatar") {
      newState.ownedAvatars = [...newState.ownedAvatars, item.id];
    } else if (item.category === "title") {
      newState.ownedTitles = [...newState.ownedTitles, item.id];
    } else if (item.category === "background") {
      newState.ownedBackgrounds = [...newState.ownedBackgrounds, item.id];
    } else if (item.category === "frame") {
      newState.ownedFrames = [...newState.ownedFrames, item.id];
    } else {
      newState.ownedEffects = [...newState.ownedEffects, item.id];
    }
    saveShopState(newState);
    setShopState(newState);
    setFeedback(`「${item.name}」を購入しました！`);
    window.setTimeout(() => setFeedback(null), 2500);
  }

  function handleEquip(item: ShopItem) {
    const currentlyEquipped = isEquipped(item);
    const newState = { ...shopState };
    if (item.category === "avatar") {
      newState.selectedAvatar = currentlyEquipped ? null : item.id;
    } else if (item.category === "title") {
      newState.selectedTitle = currentlyEquipped ? null : item.name;
    } else if (item.category === "background") {
      newState.selectedBackground = currentlyEquipped ? null : item.id;
    } else if (item.category === "frame") {
      newState.selectedFrame = currentlyEquipped ? null : item.id;
    } else {
      newState.selectedEffect = currentlyEquipped ? null : item.id;
    }
    saveShopState(newState);
    setShopState(newState);
  }

  const currentItems = TAB_ITEMS[activeTab];
  const selectedAvatar = SHOP_AVATARS.find((item) => item.id === shopState.selectedAvatar);
  const selectedBackground = SHOP_BACKGROUNDS.find(
    (item) => item.id === shopState.selectedBackground
  );
  const selectedFrame = SHOP_FRAMES.find((item) => item.id === shopState.selectedFrame);
  const selectedEffect = SHOP_EFFECTS.find((item) => item.id === shopState.selectedEffect);
  const loadoutBackground = selectedBackground?.backgroundCss;
  const loadoutFrame = selectedFrame?.frameCss;
  const loadoutEffectClass = selectedEffect?.effectClass;

  return (
    <main className="eq-page shop-page">
      <div className="eq-bg-orb eq-bg-orb-one" />
      <div className="eq-bg-orb eq-bg-orb-two" />
      <div className="eq-bg-orb eq-bg-orb-three" />

      {feedback && <div className="shop-feedback">✨ {feedback}</div>}

      <section className="eq-shell">
        <div className="eq-topbar">
          <Link href="/" className="eq-back-link">
            ← ホームへ戻る
          </Link>
        </div>

        <div className="shop-header">
          <div className="shop-header-text">
            <div className="eq-eyebrow">
              <span>🛒</span>
              <span>FRONTIER SHOP</span>
            </div>
            <h1 className="eq-page-title">Frontier Shop</h1>
            <p className="eq-lead">
              ゴールドを使ってアバター・称号・背景をカスタマイズしよう。
              クエストで稼いだゴールドが、個性を彩るアイテムに変わります。
            </p>
          </div>

          <div className="shop-gold-box">
            <span>所持ゴールド</span>
            <strong>{gold.toLocaleString()}G</strong>
            <Link href="/quiz" className="shop-earn-link">
              ⚡ クエストで稼ぐ
            </Link>
          </div>
        </div>

        <section className="eq-panel shop-loadout-panel" aria-label="現在の装備">
          <div className="shop-loadout-stage">
            <div
              className="shop-loadout-card"
              style={loadoutFrame ? { background: loadoutFrame } : undefined}
            >
              <div
                className="shop-loadout-inner"
                style={loadoutBackground ? { background: loadoutBackground } : undefined}
              >
                {loadoutEffectClass && (
                  <span className={`shop-avatar-effect ${loadoutEffectClass}`} />
                )}
                <span className="shop-loadout-avatar">
                  {selectedAvatar?.emoji ?? "🐉"}
                </span>
              </div>
            </div>
          </div>

          <div className="shop-loadout-copy">
            <p className="eq-panel-kicker">CURRENT LOADOUT</p>
            <h2 className="eq-panel-title">現在の装備</h2>
            <div className="shop-loadout-chips">
              <span>🧑 {selectedAvatar?.name ?? "未装備"}</span>
              <span>🌌 {selectedBackground?.name ?? "未装備"}</span>
              <span>🖼️ {selectedFrame?.name ?? "未装備"}</span>
              <span>✨ {selectedEffect?.name ?? "未装備"}</span>
            </div>
          </div>
        </section>

        <div className="shop-tabs">
          {(["avatar", "title", "background", "frame", "effect"] as ShopTab[]).map((tab) => (
            <button
              key={tab}
              className={`shop-tab${activeTab === tab ? " active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>

        <div className="shop-grid">
          {currentItems.map((item) => {
            const owned = isOwned(item);
            const equipped = isEquipped(item);
            const canAfford = gold >= item.price;

            return (
              <div
                key={item.id}
                className={`shop-card${equipped ? " is-equipped" : ""}${owned && !equipped ? " is-owned" : ""}`}
              >
                {equipped && <div className="shop-equipped-badge">装備中</div>}

                {item.category === "background" && item.backgroundCss ? (
                  <div
                    className="shop-card-preview bg-preview"
                    style={{ background: item.backgroundCss }}
                  >
                    <span className="shop-card-emoji">{item.emoji}</span>
                  </div>
                ) : item.category === "frame" && item.frameCss ? (
                  <div className="shop-card-preview frame-preview">
                    <span
                      className="shop-frame-sample"
                      style={{ background: item.frameCss }}
                    >
                      <span>{selectedAvatar?.emoji ?? "🐉"}</span>
                    </span>
                  </div>
                ) : item.category === "effect" && item.effectClass ? (
                  <div className="shop-card-preview">
                    <span className={`shop-avatar-effect ${item.effectClass}`} />
                    <span className="shop-card-emoji">{item.emoji}</span>
                  </div>
                ) : (
                  <div className="shop-card-preview">
                    <span className="shop-card-emoji">{item.emoji}</span>
                  </div>
                )}

                <div className="shop-card-body">
                  <p className="shop-card-name">{item.name}</p>
                  <p className="shop-card-desc">{item.description}</p>

                  <div className="shop-card-footer">
                    <span className="shop-card-price">
                      {item.price.toLocaleString()}G
                    </span>

                    {!owned ? (
                      <button
                        className={`shop-btn buy-btn${!canAfford ? " is-disabled" : ""}`}
                        onClick={() => handlePurchase(item)}
                        disabled={!canAfford}
                      >
                        {canAfford ? "購入する" : "G不足"}
                      </button>
                    ) : equipped ? (
                      <button
                        className="shop-btn equipped-btn"
                        onClick={() => handleEquip(item)}
                      >
                        ✓ 装備中
                      </button>
                    ) : (
                      <button
                        className="shop-btn equip-btn"
                        onClick={() => handleEquip(item)}
                      >
                        装備する
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="eq-panel shop-guide-panel">
          <div className="eq-panel-head">
            <div>
              <p className="eq-panel-kicker">EQUIP GUIDE</p>
              <h2 className="eq-panel-title">装備のしかた</h2>
            </div>
            <span className="eq-panel-icon">💡</span>
          </div>

          <div className="shop-guide-grid">
            <div className="shop-guide-item">
              <strong>🧑 アバター</strong>
              <span>ホーム画面のカードエリアに表示されます</span>
            </div>
            <div className="shop-guide-item">
              <strong>👑 称号</strong>
              <span>ホーム画面のHERO STATUSに表示されます</span>
            </div>
            <div className="shop-guide-item">
              <strong>🌌 背景</strong>
              <span>ホームと主人公ページの舞台に反映されます</span>
            </div>
            <div className="shop-guide-item">
              <strong>🖼️ フレーム</strong>
              <span>アバターカードの縁取りとして背景と同時に反映されます</span>
            </div>
            <div className="shop-guide-item">
              <strong>✨ エフェクト</strong>
              <span>アバターの周囲に光・炎・魔法陣などの演出を重ねます</span>
            </div>
            <div className="shop-guide-item">
              <strong>🛤️ HERO ROAD 称号</strong>
              <span>主人公ページでレベル到達の称号を装備できます</span>
            </div>
          </div>

          <Link href="/hero" className="eq-button eq-button-ghost shop-hero-link">
            ⚔️ HERO ROADの称号を見る →
          </Link>
        </div>
      </section>

      <style jsx>{`
        .shop-feedback {
          position: fixed;
          top: 24px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 200;
          padding: 13px 26px;
          border-radius: 999px;
          background: linear-gradient(135deg, rgba(34,197,94,0.32), rgba(21,128,61,0.42));
          border: 1px solid rgba(34,197,94,0.55);
          color: #86efac;
          font-size: 14px;
          font-weight: 900;
          white-space: nowrap;
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
          animation: feedbackIn 0.3s ease both;
        }

        @keyframes feedbackIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-12px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }

        .shop-header {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 24px;
          align-items: start;
          margin-bottom: 32px;
        }

        .shop-header-text {
          min-width: 0;
        }

        .shop-gold-box {
          flex-shrink: 0;
          min-width: 190px;
          border: 1px solid rgba(250,204,21,0.42);
          border-radius: 22px;
          padding: 18px 22px;
          background:
            radial-gradient(circle at 50% 0%, rgba(250,204,21,0.16), transparent 50%),
            linear-gradient(145deg, rgba(14,21,52,0.92), rgba(9,11,28,0.98));
          text-align: center;
        }

        .shop-gold-box span {
          display: block;
          color: #94a3b8;
          font-size: 11px;
          font-weight: 900;
        }

        .shop-gold-box strong {
          display: block;
          margin-top: 6px;
          color: #fde047;
          font-size: 28px;
          font-weight: 900;
        }

        .shop-earn-link {
          display: inline-block;
          margin-top: 10px;
          padding: 7px 14px;
          border-radius: 999px;
          border: 1px solid rgba(250,204,21,0.28);
          background: rgba(250,204,21,0.08);
          color: #fde68a;
          font-size: 12px;
          font-weight: 900;
          text-decoration: none;
          transition: background 0.15s ease;
        }

        .shop-earn-link:hover {
          background: rgba(250,204,21,0.16);
        }

        .shop-loadout-panel {
          display: grid;
          grid-template-columns: 190px minmax(0, 1fr);
          gap: 22px;
          align-items: center;
          margin-bottom: 24px;
        }

        .shop-loadout-stage {
          display: flex;
          justify-content: center;
        }

        .shop-loadout-card {
          width: 158px;
          height: 206px;
          border-radius: 28px;
          padding: 4px;
          background: linear-gradient(135deg, #fde68a, #7c3aed, #22d3ee);
          box-shadow: 0 18px 44px rgba(0,0,0,0.32), 0 0 34px rgba(168,85,247,0.18);
        }

        .shop-loadout-inner {
          position: relative;
          width: 100%;
          height: 100%;
          display: grid;
          place-items: center;
          overflow: hidden;
          border-radius: 24px;
          background:
            radial-gradient(circle at 50% 16%, rgba(255,255,255,0.16), transparent 40%),
            #050816;
        }

        .shop-loadout-avatar {
          position: relative;
          z-index: 2;
          font-size: 76px;
          line-height: 1;
          filter: drop-shadow(0 16px 22px rgba(0,0,0,0.5));
        }

        .shop-loadout-copy {
          min-width: 0;
        }

        .shop-loadout-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 14px;
        }

        .shop-loadout-chips span {
          min-height: 34px;
          display: inline-flex;
          align-items: center;
          border: 1px solid rgba(250,204,21,0.2);
          border-radius: 999px;
          background: rgba(255,255,255,0.06);
          color: #e2e8f0;
          padding: 7px 12px;
          font-size: 12px;
          font-weight: 900;
        }

        .shop-tabs {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 10px;
          margin-bottom: 24px;
        }

        .shop-tab {
          flex: 1;
          min-height: 52px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.055);
          color: #94a3b8;
          font-size: 15px;
          font-weight: 900;
          cursor: pointer;
          transition: all 0.18s ease;
        }

        .shop-tab:hover {
          border-color: rgba(250,204,21,0.3);
          color: #fde68a;
          background: rgba(250,204,21,0.06);
          transform: translateY(-2px);
        }

        .shop-tab.active {
          border-color: rgba(250,204,21,0.55);
          background: linear-gradient(135deg, rgba(250,204,21,0.16), rgba(251,146,60,0.1));
          color: #fde047;
          box-shadow: 0 0 24px rgba(250,204,21,0.1), inset 0 1px 0 rgba(255,255,255,0.08);
        }

        .shop-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
          margin-bottom: 32px;
        }

        .shop-card {
          position: relative;
          border: 1px solid rgba(250,204,21,0.18);
          border-radius: 26px;
          overflow: hidden;
          background:
            radial-gradient(circle at 92% 0%, rgba(250,204,21,0.08), transparent 35%),
            linear-gradient(145deg, rgba(14,21,52,0.9), rgba(9,11,28,0.96));
          box-shadow: 0 14px 40px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.05);
          transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
        }

        .shop-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 22px 56px rgba(0,0,0,0.32), 0 0 0 1px rgba(250,204,21,0.24);
          border-color: rgba(250,204,21,0.36);
        }

        .shop-card.is-equipped {
          border-color: rgba(34,197,94,0.52);
          background:
            radial-gradient(circle at 50% 0%, rgba(34,197,94,0.1), transparent 40%),
            linear-gradient(145deg, rgba(5,46,22,0.55), rgba(14,21,52,0.94));
          box-shadow: 0 0 36px rgba(34,197,94,0.14), 0 14px 40px rgba(0,0,0,0.24);
        }

        .shop-card.is-owned {
          border-color: rgba(34,211,238,0.3);
        }

        .shop-equipped-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          z-index: 2;
          padding: 4px 10px;
          border-radius: 999px;
          background: rgba(34,197,94,0.28);
          border: 1px solid rgba(34,197,94,0.52);
          color: #86efac;
          font-size: 11px;
          font-weight: 900;
        }

        .shop-card-preview {
          position: relative;
          height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.07), transparent 55%);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .shop-card-preview.bg-preview {
          position: relative;
        }

        .shop-card-preview.bg-preview::after {
          content: "";
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.15);
          pointer-events: none;
        }

        .shop-card-emoji {
          font-size: 58px;
          filter: drop-shadow(0 6px 14px rgba(0,0,0,0.45));
          position: relative;
          z-index: 1;
          line-height: 1;
        }

        .shop-frame-sample {
          width: 84px;
          height: 104px;
          display: grid;
          place-items: center;
          border-radius: 22px;
          padding: 4px;
          box-shadow: 0 14px 28px rgba(0,0,0,0.28);
        }

        .shop-frame-sample span {
          width: 100%;
          height: 100%;
          display: grid;
          place-items: center;
          border-radius: 18px;
          background: #050816;
          font-size: 42px;
        }

        .shop-avatar-effect {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
        }

        .effect-spark {
          background:
            radial-gradient(circle at 28% 32%, rgba(254,243,199,0.95) 0 3px, transparent 4px),
            radial-gradient(circle at 70% 24%, rgba(103,232,249,0.9) 0 2px, transparent 3px),
            radial-gradient(circle at 62% 76%, rgba(250,204,21,0.8) 0 3px, transparent 4px);
          animation: shopAuraFloat 2.8s ease-in-out infinite alternate;
        }

        .effect-flame {
          background:
            radial-gradient(circle at 50% 78%, rgba(248,113,113,0.42), transparent 28%),
            conic-gradient(from 180deg at 50% 82%, transparent, rgba(251,146,60,0.32), transparent 38%, rgba(239,68,68,0.26), transparent);
          animation: shopAuraSpin 5.5s linear infinite;
        }

        .effect-aqua {
          background:
            radial-gradient(circle at 50% 50%, transparent 0 38%, rgba(34,211,238,0.34) 39% 40%, transparent 42%),
            radial-gradient(circle at 50% 50%, transparent 0 56%, rgba(103,232,249,0.22) 57% 58%, transparent 60%);
          animation: shopAuraPulse 2.4s ease-in-out infinite;
        }

        .effect-shadow {
          background:
            radial-gradient(circle at 50% 50%, rgba(168,85,247,0.2), transparent 44%),
            conic-gradient(from 20deg, transparent, rgba(168,85,247,0.28), transparent, rgba(34,211,238,0.18), transparent);
          animation: shopAuraSpin 8s linear infinite;
        }

        .effect-crown {
          background:
            linear-gradient(180deg, rgba(254,243,199,0.36), transparent 38%),
            radial-gradient(circle at 50% 16%, rgba(250,204,21,0.42), transparent 22%);
          animation: shopAuraFloat 2.2s ease-in-out infinite alternate;
        }

        @keyframes shopAuraSpin {
          to { transform: rotate(360deg); }
        }

        @keyframes shopAuraPulse {
          0%, 100% { opacity: 0.45; transform: scale(0.95); }
          50% { opacity: 0.9; transform: scale(1.08); }
        }

        @keyframes shopAuraFloat {
          from { opacity: 0.56; transform: translateY(2px); }
          to { opacity: 1; transform: translateY(-5px); }
        }

        .shop-card-body {
          padding: 16px;
        }

        .shop-card-name {
          margin: 0;
          font-size: 16px;
          font-weight: 900;
          color: white;
          line-height: 1.3;
        }

        .shop-card-desc {
          margin: 6px 0 0;
          color: #94a3b8;
          font-size: 12px;
          font-weight: 800;
          line-height: 1.55;
        }

        .shop-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-top: 14px;
        }

        .shop-card-price {
          color: #fde047;
          font-size: 15px;
          font-weight: 900;
          flex-shrink: 0;
        }

        .shop-btn {
          min-height: 34px;
          padding: 0 13px;
          border-radius: 11px;
          border: 1px solid transparent;
          font-size: 12px;
          font-weight: 900;
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .buy-btn {
          background: linear-gradient(135deg, #fde047, #fb923c);
          color: #111827;
          border-color: rgba(255,245,157,0.5);
        }

        .buy-btn:hover:not(.is-disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(250,204,21,0.42);
        }

        .buy-btn.is-disabled {
          background: rgba(255,255,255,0.07);
          color: #475569;
          border-color: rgba(255,255,255,0.1);
          cursor: not-allowed;
        }

        .equip-btn {
          background: rgba(34,211,238,0.12);
          color: #67e8f9;
          border-color: rgba(34,211,238,0.35);
        }

        .equip-btn:hover {
          background: rgba(34,211,238,0.22);
          transform: translateY(-2px);
        }

        .equipped-btn {
          background: rgba(34,197,94,0.16);
          color: #86efac;
          border-color: rgba(34,197,94,0.42);
        }

        .equipped-btn:hover {
          background: rgba(239,68,68,0.14);
          color: #fca5a5;
          border-color: rgba(239,68,68,0.35);
        }

        .shop-guide-panel {
          margin-bottom: 48px;
        }

        .shop-guide-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 18px;
        }

        .shop-guide-item {
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 18px;
          padding: 14px 16px;
          background: rgba(255,255,255,0.04);
        }

        .shop-guide-item strong {
          display: block;
          color: #fde68a;
          font-size: 14px;
          font-weight: 900;
        }

        .shop-guide-item span {
          display: block;
          margin-top: 5px;
          color: #94a3b8;
          font-size: 12px;
          font-weight: 800;
          line-height: 1.5;
        }

        .shop-hero-link {
          display: flex;
          min-height: 50px;
          font-size: 15px;
        }

        @media (max-width: 900px) {
          .shop-header {
            grid-template-columns: 1fr;
          }

          .shop-loadout-panel {
            grid-template-columns: 1fr;
          }

          .shop-gold-box {
            min-width: 0;
            text-align: left;
            display: flex;
            align-items: center;
            gap: 16px;
            flex-wrap: wrap;
          }

          .shop-gold-box span,
          .shop-gold-box strong {
            display: inline;
            margin-top: 0;
          }

          .shop-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .shop-tabs {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .shop-guide-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 580px) {
          .shop-grid {
            grid-template-columns: 1fr;
          }

          .shop-tabs {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}

type ShopItemCategory = ShopItem["category"];
