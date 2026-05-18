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
            ← ホームへ戻る
          </Link>
        </nav>

        <div className="settings-hero">
          <div className="eq-eyebrow">
            <span>⚙️</span>
            <span>SETTINGS</span>
          </div>
          <h1 className="eq-page-title">設定</h1>
          <p className="eq-lead">保存されたゲームデータの管理を行います。</p>
        </div>

        <div className="settings-sections">
          <section className="settings-section">
            <div className="settings-section-head">
              <span className="settings-section-icon">🗑️</span>
              <div>
                <h2>データ管理</h2>
                <p>保存されたゲームデータの操作</p>
              </div>
            </div>

            {phase === "done" ? (
              <div className="settings-done-card">
                <div className="settings-done-icon">✅</div>
                <h3>初期化が完了しました</h3>
                <p>すべてのゲームデータが削除されました。最初からやり直せます。</p>
                <Link href="/" className="eq-button eq-button-ghost settings-home-link">
                  ホームへ戻る
                </Link>
              </div>
            ) : (
              <div className="settings-danger-card">
                <div className="settings-danger-header">
                  <span className="settings-danger-badge">⚠️ 危険な操作</span>
                  <h3>全データを初期化する</h3>
                </div>

                <ul className="settings-data-list">
                  <li>🃏 獲得カードデータ</li>
                  <li>🎁 パックチケット</li>
                  <li>⚔️ クエスト進行状況</li>
                  <li>🛡️ 主人公のレベル・経験値</li>
                  <li>💰 所持ゴールド</li>
                  <li>🛒 ショップの設定・アバター</li>
                </ul>

                {phase === "idle" && (
                  <>
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
                  </>
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
          </section>
        </div>
      </section>

      <style>{`
        .settings-page {
          min-height: 100dvh;
          padding-bottom: 60px;
        }

        .settings-hero {
          margin-bottom: 32px;
        }

        .settings-hero .eq-lead {
          max-width: 480px;
          margin-top: 8px;
        }

        .settings-sections {
          display: flex;
          flex-direction: column;
          gap: 24px;
          max-width: 600px;
        }

        .settings-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .settings-section-head {
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }

        .settings-section-icon {
          font-size: 28px;
          line-height: 1;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .settings-section-head h2 {
          font-size: 18px;
          font-weight: 900;
          color: #f1f5f9;
          margin: 0 0 2px;
        }

        .settings-section-head p {
          font-size: 13px;
          color: #64748b;
          margin: 0;
        }

        .settings-danger-card {
          border: 1px solid rgba(239, 68, 68, 0.28);
          border-radius: 24px;
          background: rgba(239, 68, 68, 0.04);
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .settings-danger-header {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .settings-danger-badge {
          font-size: 11px;
          font-weight: 900;
          color: #f87171;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .settings-danger-header h3 {
          font-size: 17px;
          font-weight: 900;
          color: #fca5a5;
          margin: 0;
        }

        .settings-data-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .settings-data-list li {
          font-size: 13px;
          color: #94a3b8;
          padding: 6px 10px;
          background: rgba(255,255,255,0.03);
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.05);
        }

        .settings-warning-note {
          font-size: 13px;
          color: #94a3b8;
          margin: 0;
          line-height: 1.6;
        }

        .settings-reset-trigger {
          align-self: flex-start;
          border: 1px solid rgba(239, 68, 68, 0.45);
          border-radius: 14px;
          background: rgba(239, 68, 68, 0.08);
          color: #f87171;
          font: inherit;
          font-size: 14px;
          font-weight: 900;
          padding: 10px 18px;
          cursor: pointer;
          transition: background 0.16s ease, border-color 0.16s ease;
        }

        .settings-reset-trigger:hover {
          background: rgba(239, 68, 68, 0.14);
          border-color: rgba(239, 68, 68, 0.65);
        }

        .settings-confirm-box {
          border: 1px solid rgba(239, 68, 68, 0.55);
          border-radius: 18px;
          background: rgba(30, 8, 8, 0.7);
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .settings-confirm-title {
          font-size: 16px;
          font-weight: 900;
          color: #fca5a5;
          margin: 0;
        }

        .settings-confirm-body {
          font-size: 13px;
          color: #94a3b8;
          line-height: 1.7;
          margin: 0;
        }

        .settings-confirm-body strong {
          color: #f87171;
          font-weight: 900;
        }

        .settings-confirm-label {
          display: flex;
          flex-direction: column;
          gap: 8px;
          color: #cbd5e1;
          font-size: 12px;
          font-weight: 900;
        }

        .settings-confirm-label input {
          min-height: 44px;
          border: 1px solid rgba(239, 68, 68, 0.4);
          border-radius: 14px;
          background: rgba(2, 6, 23, 0.68);
          color: #fecaca;
          font: inherit;
          font-size: 14px;
          font-weight: 900;
          padding: 0 12px;
          outline: none;
        }

        .settings-confirm-label input:focus {
          border-color: rgba(248, 113, 113, 0.76);
          box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
        }

        .settings-confirm-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .settings-cancel-btn {
          flex: 1;
          min-height: 42px;
          border: 1px solid rgba(100, 116, 139, 0.4);
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.05);
          color: #94a3b8;
          font: inherit;
          font-size: 14px;
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
          min-height: 42px;
          border: 1px solid rgba(239, 68, 68, 0.7);
          border-radius: 14px;
          background: linear-gradient(135deg, #7f1d1d, #991b1b);
          color: #fecaca;
          font: inherit;
          font-size: 13px;
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

        .settings-done-card {
          border: 1px solid rgba(52, 211, 153, 0.3);
          border-radius: 24px;
          background: rgba(52, 211, 153, 0.05);
          padding: 32px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          text-align: center;
        }

        .settings-done-icon {
          font-size: 40px;
        }

        .settings-done-card h3 {
          font-size: 18px;
          font-weight: 900;
          color: #6ee7b7;
          margin: 0;
        }

        .settings-done-card p {
          font-size: 14px;
          color: #64748b;
          line-height: 1.6;
          margin: 0;
        }

        .settings-home-link {
          margin-top: 8px;
        }

        @media (max-width: 560px) {
          .settings-page {
            padding-bottom: 36px;
          }

          .settings-hero {
            margin-bottom: 22px;
          }

          .settings-sections {
            gap: 18px;
          }

        }

      `}</style>
    </main>
  );
}
