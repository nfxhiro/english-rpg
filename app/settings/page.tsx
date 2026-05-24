"use client";

import { useState } from "react";
import Link from "next/link";

type ResetPhase = "idle" | "confirming" | "done";

const ALL_STORAGE_KEYS = [
  "earnedCards",
  "packTickets",
  "eikenQuestFrontierProgress",
  "furiganaEnabled",
  "bgmEnabled",
  "heroStatus",
  "heroGold",
  "shopState",
];

function resetAllData() {
  for (const key of ALL_STORAGE_KEYS) {
    localStorage.removeItem(key);
  }
}

export default function SettingsPage() {
  const [phase, setPhase] = useState<ResetPhase>("idle");
  const [confirmationText, setConfirmationText] = useState("");

  const canConfirmReset = confirmationText === "初期化";

  const handleResetRequest = () => {
    setConfirmationText("");
    setPhase("confirming");
  };
  const handleCancel = () => {
    setConfirmationText("");
    setPhase("idle");
  };
  const handleConfirm = () => {
    if (!canConfirmReset) return;
    resetAllData();
    setConfirmationText("");
    setPhase("done");
  };

  return (
    <main className="eq-page settings-page">
      <div className="eq-bg-orb eq-bg-orb-one" />
      <div className="eq-bg-orb eq-bg-orb-two" />
      <div className="eq-bg-orb eq-bg-orb-three" />

      <section className="eq-shell">
        <nav className="eq-topbar">
          <Link href="/" className="eq-back-link">
            ホームへ戻る
          </Link>
        </nav>

        <div className="settings-hero">
          <div className="eq-eyebrow">
            <span>⚙️</span>
            <span>SETTINGS</span>
          </div>
          <h1 className="eq-page-title">設定</h1>
          <p className="eq-lead">
            セーブデータの確認と初期化を行えます。通常のプレイでは変更不要です。
          </p>
        </div>

        <div className="settings-content">
          {phase === "done" ? (
            <div className="eq-panel settings-done-panel">
              <div className="settings-done-inner">
                <div className="settings-done-icon">✅</div>
                <h3>初期化が完了しました</h3>
                <p>すべてのゲームデータが削除されました。最初からやり直せます。</p>
                <Link href="/" className="eq-button eq-button-ghost settings-home-link">
                  ホームへ戻る
                </Link>
              </div>
            </div>
          ) : (
            <div className="eq-panel settings-danger-panel">
              <div className="eq-panel-head">
                <div>
                  <p className="eq-panel-kicker settings-danger-kicker">DANGER ZONE</p>
                  <h2 className="eq-panel-title settings-danger-title">ゲームデータを初期化する</h2>
                </div>
                <span className="eq-panel-icon">🗑️</span>
              </div>

              <p className="settings-danger-lead">
                最初からやり直したい場合だけ使用してください。削除後の復元はできません。
              </p>

              <ul className="settings-data-list">
                <li>🃏 獲得カードデータ</li>
                <li>🎁 パックチケット</li>
                <li>⚔️ クエスト進行状況</li>
                <li>🛡️ 主人公のレベル・経験値</li>
                <li>💰 所持ゴールド</li>
                <li>🛒 ショップの設定・アバター</li>
              </ul>

              {phase === "idle" && (
                <div className="settings-idle-footer">
                  <p className="settings-warning-note">
                    上記のデータがすべて削除されます。この操作は取り消せません。
                  </p>
                  <button
                    type="button"
                    className="settings-reset-trigger"
                    onClick={handleResetRequest}
                  >
                    全データを初期化する
                  </button>
                </div>
              )}

              {phase === "confirming" && (
                <div className="settings-confirm-box">
                  <p className="settings-confirm-title">⚠️ 本当に初期化しますか？</p>
                  <p className="settings-confirm-body">
                    カード・チケット・レベル・ゴールド・クエスト進行がすべて消えます。
                    <br />
                    <strong>削除したデータは復元できません。</strong>
                  </p>
                  <label className="settings-confirm-label">
                    <span>確認のため「初期化」と入力してください</span>
                    <input
                      value={confirmationText}
                      onChange={(event) => setConfirmationText(event.target.value)}
                      placeholder="初期化"
                      autoComplete="off"
                    />
                  </label>
                  <div className="settings-confirm-actions">
                    <button
                      type="button"
                      className="settings-cancel-btn"
                      onClick={handleCancel}
                    >
                      やめておく
                    </button>
                    <button
                      type="button"
                      className="settings-execute-btn"
                      onClick={handleConfirm}
                      disabled={!canConfirmReset}
                    >
                      全データを削除する（復元不可）
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <style>{`
        .settings-page {
          min-height: 100dvh;
          padding-bottom: 72px;
        }

        .settings-hero {
          margin-bottom: 24px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 28px;
          padding: 36px 40px;
          background:
            radial-gradient(circle at 88% 18%, rgba(45, 212, 191, 0.1), transparent 40%),
            linear-gradient(145deg, rgba(15, 23, 42, 0.88), rgba(8, 13, 24, 0.94));
          box-shadow: 0 24px 70px rgba(0, 0, 0, 0.28);
          max-width: 980px;
        }

        .settings-hero .eq-page-title {
          margin-top: 18px;
        }

        .settings-hero .eq-lead {
          margin-top: 14px;
          max-width: 600px;
          line-height: 1.85;
        }

        .settings-content {
          max-width: 980px;
        }

        /* ===== Danger panel ===== */
        .settings-danger-panel {
          border-color: rgba(239, 68, 68, 0.28) !important;
          background:
            radial-gradient(circle at 94% 0%, rgba(239, 68, 68, 0.1), transparent 36%),
            rgba(15, 23, 42, 0.78) !important;
          display: flex;
          flex-direction: column;
          gap: 22px;
        }

        .settings-danger-panel .eq-panel-head {
          margin-bottom: 0;
        }

        .settings-danger-kicker {
          color: #fca5a5 !important;
        }

        .settings-danger-title {
          color: #fecaca !important;
        }

        .settings-danger-lead {
          margin: 0;
          color: #cbd5e1;
          font-size: 15px;
          line-height: 1.8;
          font-weight: 800;
          max-width: 680px;
        }

        .settings-data-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }

        .settings-data-list li {
          min-height: 48px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #cbd5e1;
          padding: 10px 14px;
          background: rgba(255, 255, 255, 0.045);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.07);
          font-weight: 800;
          line-height: 1.4;
        }

        .settings-idle-footer {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .settings-warning-note {
          font-size: 14px;
          color: #94a3b8;
          margin: 0;
          line-height: 1.7;
          font-weight: 800;
        }

        .settings-reset-trigger {
          align-self: flex-start;
          border: 1px solid rgba(239, 68, 68, 0.45);
          border-radius: 18px;
          background: rgba(239, 68, 68, 0.08);
          color: #fecaca;
          font: inherit;
          font-size: 15px;
          font-weight: 900;
          padding: 14px 24px;
          cursor: pointer;
          transition: background 0.16s ease, border-color 0.16s ease;
        }

        .settings-reset-trigger:hover {
          background: rgba(239, 68, 68, 0.14);
          border-color: rgba(239, 68, 68, 0.65);
        }

        /* ===== Confirm box ===== */
        .settings-confirm-box {
          border: 1px solid rgba(239, 68, 68, 0.5);
          border-radius: 20px;
          background: rgba(30, 8, 8, 0.65);
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .settings-confirm-title {
          font-size: 17px;
          font-weight: 900;
          color: #fca5a5;
          margin: 0;
        }

        .settings-confirm-body {
          font-size: 14px;
          color: #94a3b8;
          line-height: 1.75;
          margin: 0;
        }

        .settings-confirm-body strong {
          color: #f87171;
          font-weight: 900;
        }

        .settings-confirm-label {
          display: flex;
          flex-direction: column;
          gap: 10px;
          color: #cbd5e1;
          font-size: 13px;
          font-weight: 900;
        }

        .settings-confirm-label input {
          min-height: 48px;
          border: 1px solid rgba(239, 68, 68, 0.4);
          border-radius: 14px;
          background: rgba(2, 6, 23, 0.68);
          color: #fecaca;
          font: inherit;
          font-size: 15px;
          font-weight: 900;
          padding: 0 14px;
          outline: none;
        }

        .settings-confirm-label input:focus {
          border-color: rgba(248, 113, 113, 0.76);
          box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
        }

        .settings-confirm-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .settings-cancel-btn {
          flex: 1;
          min-height: 46px;
          border: 1px solid rgba(100, 116, 139, 0.4);
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.05);
          color: #94a3b8;
          font: inherit;
          font-size: 15px;
          font-weight: 900;
          cursor: pointer;
          transition: background 0.14s ease;
        }

        .settings-cancel-btn:hover {
          background: rgba(255, 255, 255, 0.09);
          color: #cbd5e1;
        }

        .settings-execute-btn {
          flex: 2;
          min-height: 46px;
          border: 1px solid rgba(239, 68, 68, 0.7);
          border-radius: 14px;
          background: linear-gradient(135deg, #7f1d1d, #991b1b);
          color: #fecaca;
          font: inherit;
          font-size: 14px;
          font-weight: 900;
          cursor: pointer;
          transition: opacity 0.14s ease;
        }

        .settings-execute-btn:hover {
          opacity: 0.85;
        }

        .settings-execute-btn:disabled {
          opacity: 0.42;
          cursor: not-allowed;
        }

        /* ===== Done state ===== */
        .settings-done-panel {
          border-color: rgba(52, 211, 153, 0.28) !important;
          background:
            radial-gradient(circle at 50% 0%, rgba(52, 211, 153, 0.12), transparent 40%),
            rgba(15, 23, 42, 0.78) !important;
        }

        .settings-done-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          padding: 20px 0;
          text-align: center;
        }

        .settings-done-icon {
          font-size: 48px;
        }

        .settings-done-inner h3 {
          font-size: 22px;
          font-weight: 900;
          color: #6ee7b7;
          margin: 0;
        }

        .settings-done-inner p {
          font-size: 15px;
          color: #cbd5e1;
          line-height: 1.7;
          margin: 0;
          max-width: 420px;
        }

        .settings-home-link {
          margin-top: 8px;
        }

        @media (max-width: 760px) {
          .settings-hero {
            padding: 28px 26px;
          }
        }

        @media (max-width: 560px) {
          .settings-page {
            padding-bottom: 40px;
          }

          .settings-hero {
            padding: 22px 20px;
          }

          .settings-data-list {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
      `}</style>
    </main>
  );
}
