"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import PageTopBar from "../components/PageTopBar";
import { addGold, loadGold, spendGold } from "../../data/hero";
import {
  EquipCategory,
  EquipItem,
  EquipState,
  loadEquipState,
  saveEquipState,
  calcTotalEffects,
  EQUIP_ITEMS,
} from "../../data/shop";

const CATEGORY_TABS: {
  id: EquipCategory;
  label: string;
  icon: string;
  image: string;
}[] = [
  { id: "weapon",    label: "武器",         icon: "⚔️", image: "/images/equipment/weapon.png" },
  { id: "shield",    label: "盾",           icon: "🛡️", image: "/images/equipment/shield.png" },
  { id: "armor",     label: "よろい",       icon: "🥋", image: "/images/equipment/armor.png" },
  { id: "helmet",    label: "かぶと",       icon: "🪖", image: "/images/equipment/helmet.png" },
  { id: "accessory", label: "アクセサリー", icon: "💍", image: "/images/equipment/accessory.png" },
];

const EFFECT_LABELS: Record<string, string> = {
  attack:          "攻撃力",
  hp:              "HP",
  damageReduction: "被ダメ軽減",
  criticalRate:    "クリティカル",
  healBonus:       "回復ボーナス",
  goldBonus:       "G増加",
  expBonus:        "EXP増加",
  partnerExpBonus: "相棒EXP",
};

const EFFECT_ICONS: Record<string, string> = {
  attack:          "⚔️",
  hp:              "❤️",
  damageReduction: "🛡️",
  criticalRate:    "⚡",
  healBonus:       "💚",
  goldBonus:       "🪙",
  expBonus:        "📘",
  partnerExpBonus: "🤝",
};

const EFFECT_UNITS: Record<string, string> = {
  attack:          "",
  hp:              "",
  damageReduction: "%",
  criticalRate:    "倍",
  healBonus:       "倍",
  goldBonus:       "%",
  expBonus:        "%",
  partnerExpBonus: "%",
};

const DEFAULT_EQUIP_STATE: EquipState = {
  ownedItems: [],
  equippedItems: { weapon: null, shield: null, armor: null, helmet: null, accessory: null },
};

export default function ShopPage() {
  const [gold, setGold] = useState(0);
  const [equipState, setEquipState] = useState<EquipState>(DEFAULT_EQUIP_STATE);
  const [activeTab, setActiveTab] = useState<EquipCategory>("weapon");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSecretFeedback, setIsSecretFeedback] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setGold(loadGold());
      setEquipState(loadEquipState());
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const SECRET = "GOLD";
    let buf = "";
    let feedbackTimer: ReturnType<typeof setTimeout>;

    function onKey(e: KeyboardEvent) {
      if (e.key.length !== 1) return;
      buf = (buf + e.key.toUpperCase()).slice(-SECRET.length);
      if (buf === SECRET) {
        addGold(10000);
        setGold(loadGold());
        setIsSecretFeedback(true);
        setFeedback("10,000ゴールドゲット！");
        clearTimeout(feedbackTimer);
        feedbackTimer = setTimeout(() => {
          setFeedback(null);
          setIsSecretFeedback(false);
        }, 2800);
        buf = "";
      }
    }

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      clearTimeout(feedbackTimer);
    };
  }, []);

  function handlePurchase(item: EquipItem) {
    if (equipState.ownedItems.includes(item.id) || gold < item.price) return;
    const success = spendGold(item.price);
    if (!success) return;
    const newState: EquipState = {
      ...equipState,
      ownedItems: [...equipState.ownedItems, item.id],
    };
    saveEquipState(newState);
    setEquipState(newState);
    setGold(loadGold());
    setIsSecretFeedback(false);
    setFeedback(`「${item.name}」を購入しました！`);
    window.setTimeout(() => setFeedback(null), 2500);
  }

  function handleEquip(item: EquipItem) {
    const isEquipped = equipState.equippedItems[item.category] === item.id;
    const newState: EquipState = {
      ...equipState,
      equippedItems: {
        ...equipState.equippedItems,
        [item.category]: isEquipped ? null : item.id,
      },
    };
    saveEquipState(newState);
    setEquipState(newState);
  }

  const currentItems = EQUIP_ITEMS.filter((i) => i.category === activeTab);
  const totalEffects = calcTotalEffects(equipState);
  const hasEffects = Object.keys(totalEffects).length > 0;

  return (
    <main className="eq-page shop-page">
      <div className="eq-bg-orb eq-bg-orb-one" />
      <div className="eq-bg-orb eq-bg-orb-two" />
      <div className="eq-bg-orb eq-bg-orb-three" />

      {feedback && (
        <div className={isSecretFeedback ? "shop-feedback secret" : "shop-feedback"}>
          {isSecretFeedback ? (
            <>
              <span className="shop-feedback-icon">G</span>
              <div>
                <strong>SECRET COMMAND</strong>
                <p>{feedback}</p>
              </div>
            </>
          ) : (
            <>✨ {feedback}</>
          )}
        </div>
      )}

      <section className="eq-shell">
        <PageTopBar />

        <div className="shop-header">
          <div className="shop-header-text">
            <div className="eq-eyebrow">
              <span>⚔️</span>
              <span>EQUIPMENT SHOP</span>
            </div>
            <h1 className="eq-page-title">装備ショップ</h1>
            <p className="eq-lead">
              武器・盾・よろいを揃えてバトルを有利に進めよう。
              クエストで稼いだゴールドで強力な装備を手に入れよう。
            </p>
          </div>

          <div className="shop-gold-box">
            <span>所持ゴールド</span>
            <strong>{gold.toLocaleString()}G</strong>
          </div>
        </div>

        {/* Equipped slots strip */}
        <div className="shop-equipped-strip">
          {CATEGORY_TABS.map(({ id, label, image }) => {
            const equippedId = equipState.equippedItems[id];
            const equippedItem = equippedId ? EQUIP_ITEMS.find((i) => i.id === equippedId) : null;
            return (
              <button
                key={id}
                className={`strip-slot${equippedItem ? " is-equipped" : ""}${activeTab === id ? " is-active" : ""}`}
                onClick={() => setActiveTab(id)}
              >
                <span className="strip-icon-frame">
                  <Image
                    src={image}
                    alt=""
                    width={1254}
                    height={1254}
                    className="strip-icon-image"
                    sizes="36px"
                    aria-hidden="true"
                  />
                </span>
                <span className="strip-label">{label}</span>
                <strong className="strip-name">{equippedItem ? equippedItem.name : "未装備"}</strong>
              </button>
            );
          })}
        </div>

        {/* Effects summary panel */}
        <section className="eq-panel shop-effects-panel" aria-label="装備効果合計">
          <div className="eq-panel-head">
            <div>
              <p className="eq-panel-kicker">TOTAL EFFECTS</p>
              <h2 className="eq-panel-title">装備効果合計</h2>
            </div>
            <span className="eq-panel-icon">✨</span>
          </div>
          {hasEffects ? (
            <div className="effects-grid">
              {Object.entries(totalEffects).map(([key, val]) => (
                <div key={key} className="effect-chip">
                  <span className="effect-icon">{EFFECT_ICONS[key] ?? "✦"}</span>
                  <span className="effect-label">{EFFECT_LABELS[key] ?? key}</span>
                  <strong className="effect-value">+{val}{EFFECT_UNITS[key] ?? ""}</strong>
                </div>
              ))}
            </div>
          ) : (
            <p className="effects-empty">装備を購入して装備すると、ここに効果が表示されます。</p>
          )}
        </section>

        {/* Category tabs */}
        <div className="equipment-category-grid" aria-label="装備カテゴリ">
          {CATEGORY_TABS.map(({ id, label, image }) => (
            <button
              key={id}
              type="button"
              className={`equipment-category-card${activeTab === id ? " is-active" : ""}`}
              aria-pressed={activeTab === id}
              onClick={() => setActiveTab(id)}
            >
              <span className="equipment-category-image-frame">
                <Image
                  src={image}
                  alt=""
                  width={1254}
                  height={1254}
                  className="equipment-category-image"
                  sizes="(max-width: 580px) 128px, 160px"
                  aria-hidden="true"
                />
              </span>
              <span className="equipment-category-label">{label}</span>
            </button>
          ))}
        </div>

        {/* Item grid */}
        <div className="shop-grid">
          {currentItems.map((item) => {
            const owned = equipState.ownedItems.includes(item.id);
            const equipped = equipState.equippedItems[item.category] === item.id;
            const canAfford = gold >= item.price;
            return (
              <div
                key={item.id}
                className={`shop-card${equipped ? " is-equipped" : ""}${owned && !equipped ? " is-owned" : ""}`}
              >
                {equipped && <div className="shop-equipped-badge">装備中</div>}

                <div className="shop-card-preview">
                  <span className="shop-card-emoji">{item.icon}</span>
                </div>

                <div className="shop-card-body">
                  <p className="shop-card-name">{item.name}</p>
                  <p className="shop-card-desc">{item.description}</p>

                  <div className="shop-stat-row">
                    {Object.entries(item.effects).map(([key, val]) => (
                      <span key={key}>
                        {EFFECT_ICONS[key] ?? "✦"} {EFFECT_LABELS[key] ?? key} +{val}{EFFECT_UNITS[key] ?? ""}
                      </span>
                    ))}
                  </div>

                  <p className="shop-card-rec">▶ {item.recommendedFor}</p>

                  <div className="shop-card-footer">
                    <span className="shop-card-price">{item.price.toLocaleString()}G</span>
                    {!owned ? (
                      <button
                        className={`shop-btn buy-btn${!canAfford ? " is-disabled" : ""}`}
                        onClick={() => handlePurchase(item)}
                        disabled={!canAfford}
                      >
                        {canAfford ? "購入する" : "ゴールド不足"}
                      </button>
                    ) : equipped ? (
                      <button className="shop-btn equipped-btn" onClick={() => handleEquip(item)}>
                        ✓ 装備中
                      </button>
                    ) : (
                      <button className="shop-btn equip-btn" onClick={() => handleEquip(item)}>
                        装備する
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Guide panel */}
        <div className="eq-panel shop-guide-panel">
          <div className="eq-panel-head">
            <div>
              <p className="eq-panel-kicker">EQUIP GUIDE</p>
              <h2 className="eq-panel-title">装備の効果一覧</h2>
            </div>
            <span className="eq-panel-icon">💡</span>
          </div>

          <div className="shop-guide-grid">
            <div className="shop-guide-item">
              <strong>⚔️ 攻撃力</strong>
              <span>ボスへのダメージが増加します</span>
            </div>
            <div className="shop-guide-item">
              <strong>❤️ HP</strong>
              <span>バトル開始時の最大HPが増えます</span>
            </div>
            <div className="shop-guide-item">
              <strong>🛡️ 被ダメ軽減</strong>
              <span>ミス時のダメージが%分減少します</span>
            </div>
            <div className="shop-guide-item">
              <strong>⚡ クリティカル</strong>
              <span>正解連続時に会心の一撃が出やすくなります</span>
            </div>
            <div className="shop-guide-item">
              <strong>💚 回復ボーナス</strong>
              <span>正解時のHP回復量が増加します</span>
            </div>
            <div className="shop-guide-item">
              <strong>🪙 G増加</strong>
              <span>クエスト報酬のゴールドが%増加します</span>
            </div>
            <div className="shop-guide-item">
              <strong>📘 EXP増加</strong>
              <span>クエスト後の主人公EXPが%増加します</span>
            </div>
            <div className="shop-guide-item">
              <strong>🤝 相棒EXP増加</strong>
              <span>クエスト後の相棒EXPが%増加します</span>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .shop-feedback {
          position: fixed;
          bottom: 36px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          z-index: 9999;
          padding: 16px 24px;
          border-radius: 20px;
          background: rgba(10, 14, 24, 0.96);
          border: 1px solid rgba(250, 204, 21, 0.42);
          color: white;
          font-size: 14px;
          font-weight: 900;
          white-space: nowrap;
          box-shadow: 0 24px 56px rgba(0, 0, 0, 0.55);
          animation: feedbackIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .shop-feedback.secret {
          border-color: rgba(250, 204, 21, 0.48);
          background:
            radial-gradient(circle at 18% 20%, rgba(250, 204, 21, 0.18), transparent 34%),
            rgba(10, 14, 24, 0.96);
          box-shadow:
            0 24px 56px rgba(0, 0, 0, 0.55),
            0 0 42px rgba(250, 204, 21, 0.2);
        }

        .shop-feedback-icon {
          display: grid;
          place-items: center;
          width: 42px;
          height: 42px;
          flex: 0 0 auto;
          border-radius: 14px;
          background: linear-gradient(135deg, #fde047, #f59e0b);
          color: #0a0e18;
          font-size: 24px;
          font-weight: 1000;
          box-shadow: 0 0 24px rgba(250, 204, 21, 0.32);
        }

        .shop-feedback strong {
          display: block;
          color: #fde68a;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.08em;
        }

        .shop-feedback p {
          margin: 4px 0 0;
          color: white;
          font-size: 18px;
          font-weight: 900;
        }

        @keyframes feedbackIn {
          from { opacity: 0; transform: translateX(-50%) scale(0.72) translateY(20px); }
          to   { opacity: 1; transform: translateX(-50%) scale(1)    translateY(0); }
        }

        .shop-header {
          display: grid !important;
          grid-template-columns: minmax(0, 1fr) minmax(176px, auto) !important;
          gap: 18px !important;
          align-items: center !important;
          margin-bottom: 16px !important;
          padding: 24px !important;
        }

        .shop-header-text {
          min-width: 0;
        }

        .shop-gold-box {
          flex-shrink: 0;
          min-width: 176px !important;
          border: 1px solid rgba(250,204,21,0.42);
          border-radius: 18px;
          padding: 14px 18px;
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
          font-size: 24px;
          font-weight: 900;
        }

        /* Equipped strip */
        .shop-equipped-strip {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 8px;
          margin-bottom: 14px;
        }

        .strip-slot {
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          padding: 10px 9px;
          background: rgba(255,255,255,0.04);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          cursor: pointer;
          transition: all 0.18s ease;
          text-align: center;
          font-family: inherit;
        }

        .strip-slot:hover {
          border-color: rgba(250,204,21,0.25);
          background: rgba(250,204,21,0.05);
        }

        .strip-slot.is-active {
          border-color: rgba(250,204,21,0.45);
          background: rgba(250,204,21,0.08);
        }

        .strip-slot.is-equipped {
          border-color: rgba(34,197,94,0.4);
          background: rgba(34,197,94,0.07);
        }

        .strip-slot.is-equipped.is-active {
          border-color: rgba(34,197,94,0.65);
        }

        .strip-icon-frame {
          width: 38px;
          height: 38px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          filter:
            drop-shadow(0 8px 10px rgba(0, 0, 0, 0.34))
            drop-shadow(0 0 10px rgba(34, 211, 238, 0.12));
        }

        .strip-icon-image {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .strip-label {
          font-size: 10px;
          color: #64748b;
          font-weight: 800;
          letter-spacing: 0.04em;
        }

        .strip-name {
          font-size: 11px;
          font-weight: 900;
          color: #64748b;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 100%;
        }

        .strip-slot.is-equipped .strip-name {
          color: #86efac;
        }

        /* Effects panel */
        .shop-effects-panel {
          margin-bottom: 16px;
          padding: 18px;
        }

        .effects-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 6px;
        }

        .effect-chip {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          padding: 8px 14px;
          border-radius: 14px;
          border: 1px solid rgba(34,211,238,0.25);
          background: rgba(34,211,238,0.07);
          min-width: 88px;
        }

        .effect-icon {
          font-size: 18px;
          line-height: 1;
        }

        .effect-label {
          font-size: 11px;
          color: #94a3b8;
          font-weight: 800;
        }

        .effect-value {
          font-size: 17px;
          color: #67e8f9;
          font-weight: 900;
        }

        .effects-empty {
          margin: 8px 0 0;
          color: #475569;
          font-size: 13px;
          font-weight: 800;
        }

        /* Category cards */
        .equipment-category-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 10px;
          margin-bottom: 16px;
        }

        .equipment-category-card {
          position: relative;
          min-height: 126px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 7px;
          overflow: hidden;
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,0.12);
          background:
            radial-gradient(circle at 50% 12%, rgba(34,211,238,0.1), transparent 38%),
            linear-gradient(145deg, rgba(15,23,42,0.92), rgba(7,12,24,0.97));
          color: #e5e7eb;
          padding: 10px;
          font-weight: 900;
          cursor: pointer;
          font-family: inherit;
          box-shadow:
            0 14px 34px rgba(0,0,0,0.24),
            inset 0 1px 0 rgba(255,255,255,0.05);
          transition:
            transform 0.18s ease,
            border-color 0.18s ease,
            background 0.18s ease,
            box-shadow 0.18s ease;
        }

        .equipment-category-card::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            linear-gradient(125deg, transparent 0 36%, rgba(255,255,255,0.1) 46%, transparent 58%),
            radial-gradient(circle at 82% 12%, rgba(250,204,21,0.11), transparent 28%);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.18s ease;
        }

        .equipment-category-card:hover {
          transform: translateY(-2px);
          border-color: rgba(250,204,21,0.34);
          background:
            radial-gradient(circle at 50% 12%, rgba(250,204,21,0.12), transparent 38%),
            linear-gradient(145deg, rgba(20,28,52,0.95), rgba(8,13,26,0.98));
          box-shadow:
            0 18px 42px rgba(0,0,0,0.32),
            0 0 0 1px rgba(250,204,21,0.12),
            inset 0 1px 0 rgba(255,255,255,0.08);
        }

        .equipment-category-card:hover::before,
        .equipment-category-card.is-active::before {
          opacity: 1;
        }

        .equipment-category-card.is-active {
          transform: translateY(-2px);
          border-color: rgba(250,204,21,0.68);
          background:
            radial-gradient(circle at 50% 16%, rgba(250,204,21,0.22), transparent 42%),
            linear-gradient(145deg, rgba(48,36,13,0.9), rgba(12,18,38,0.98));
          color: #fef3c7;
          box-shadow:
            0 20px 48px rgba(0,0,0,0.34),
            0 0 32px rgba(250,204,21,0.18),
            inset 0 1px 0 rgba(255,255,255,0.12);
        }

        .equipment-category-image-frame {
          position: relative;
          z-index: 1;
          width: min(100%, 100px);
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 16px;
          background:
            radial-gradient(circle at 50% 52%, rgba(255,255,255,0.08), transparent 58%);
        }

        .equipment-category-image {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: contain;
          filter:
            drop-shadow(0 14px 16px rgba(0,0,0,0.42))
            drop-shadow(0 0 16px rgba(34,211,238,0.1));
        }

        .equipment-category-card.is-active .equipment-category-image {
          filter:
            drop-shadow(0 16px 18px rgba(0,0,0,0.42))
            drop-shadow(0 0 20px rgba(250,204,21,0.24));
        }

        .equipment-category-label {
          position: relative;
          z-index: 1;
          color: inherit;
          font-size: 15px;
          font-weight: 900;
          line-height: 1.15;
          text-align: center;
          white-space: normal;
          overflow-wrap: anywhere;
        }

        /* Item grid */
        .shop-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 18px;
        }

        .shop-card {
          position: relative;
          border: 1px solid rgba(250,204,21,0.18);
          border-radius: 20px;
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
          top: 10px;
          right: 10px;
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
          height: 88px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.07), transparent 55%);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .shop-card-emoji {
          font-size: 46px;
          filter: drop-shadow(0 6px 14px rgba(0,0,0,0.45));
          position: relative;
          z-index: 1;
          line-height: 1;
        }

        .shop-card-body {
          padding: 13px;
        }

        .shop-card-name {
          margin: 0;
          font-size: 15px;
          font-weight: 900;
          color: white;
          line-height: 1.3;
        }

        .shop-card-desc {
          margin: 5px 0 0;
          color: #94a3b8;
          font-size: 12px;
          font-weight: 800;
          line-height: 1.45;
        }

        .shop-card-rec {
          margin: 6px 0 0;
          color: #475569;
          font-size: 11px;
          font-weight: 800;
        }

        .shop-stat-row {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 8px;
        }

        .shop-stat-row span {
          display: inline-flex;
          align-items: center;
          min-height: 22px;
          border: 1px solid rgba(34,211,238,0.24);
          border-radius: 999px;
          background: rgba(34,211,238,0.08);
          padding: 4px 8px;
          color: #bae6fd;
          font-size: 10px;
          font-weight: 900;
          line-height: 1;
        }

        .shop-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-top: 12px;
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
          font-family: inherit;
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

        /* Guide panel */
        .shop-guide-panel {
          margin-bottom: 30px;
          padding: 18px;
        }

        .shop-guide-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }

        .shop-guide-item {
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 12px 14px;
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

        @media (max-width: 900px) {
          .shop-header {
            grid-template-columns: 1fr !important;
            padding: 18px !important;
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

          .equipment-category-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .equipment-category-card {
            min-height: 138px;
          }

          .shop-equipped-strip {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .shop-guide-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 580px) {
          .shop-grid {
            grid-template-columns: 1fr;
          }

          .equipment-category-grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            overflow-x: visible;
            gap: 10px;
            max-width: 100%;
            padding-bottom: 0;
          }

          .equipment-category-card {
            flex: unset;
            min-height: 118px;
            border-radius: 16px;
            padding: 8px 6px;
            scroll-snap-align: unset;
          }

          .equipment-category-image-frame {
            width: 64px;
          }

          .equipment-category-label {
            font-size: 12px;
          }

          .shop-equipped-strip {
            display: grid;
            grid-template-columns: repeat(5, minmax(0, 1fr));
            overflow-x: visible;
            max-width: 100%;
            padding-bottom: 0;
          }

          .strip-slot {
            flex: unset;
            padding: 8px 4px;
            scroll-snap-align: unset;
          }
        }
      `}</style>
    </main>
  );
}
