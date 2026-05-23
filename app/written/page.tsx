"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  addGold,
  addHeroExp,
  loadHeroStatus,
  saveHeroStatus,
} from "../../data/hero";
import {
  eiken3Written001_100,
  type WrittenQuestion,
} from "../../data/eiken3_written_001_100";
import { eiken5Written001_100 } from "../../data/eiken5_written_001_100";
import { eiken4Written001_100 } from "../../data/eiken4_written_001_100";
import { eikenPre2Written001_100 } from "../../data/eiken_pre2_written_001_100";

type LevelFilter = WrittenQuestion["level"];

const allWrittenQuestions: WrittenQuestion[] = [
  ...eiken5Written001_100,
  ...eiken4Written001_100,
  ...eiken3Written001_100,
  ...eikenPre2Written001_100,
];

const levelLabels: Record<LevelFilter, string> = {
  "英検5級": "5級",
  "英検4級": "4級",
  "英検3級": "3級",
  "英検準2級": "準2級",
};

const levelFilters: LevelFilter[] = ["英検5級", "英検4級", "英検3級", "英検準2級"];

const categoryLabels: Record<WrittenQuestion["category"], string> = {
  vocabulary: "語彙",
  grammar: "文法",
  phrase: "熟語",
  conversation: "会話",
  writing: "表現",
};

function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function getAnswerLabel(index: number) {
  return String.fromCharCode(65 + index);
}

const STORAGE_KEY = "writtenProgress";

function loadProgress(): { answeredIds: Record<string, boolean>; correctIds: Record<string, boolean> } {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return { answeredIds: {}, correctIds: {} };
}

export default function WrittenPage() {
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("英検5級");
  const [isShuffled, setIsShuffled] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState<WrittenQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [answeredIds, setAnsweredIds] = useState<Record<string, boolean>>({});
  const [correctIds, setCorrectIds] = useState<Record<string, boolean>>({});
  const [goldNotice, setGoldNotice] = useState<number | null>(null);
  const [expNotice, setExpNotice] = useState<{ gained: number } | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const { answeredIds: a, correctIds: c } = loadProgress();
      setAnsweredIds(a);
      setCorrectIds(c);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ answeredIds, correctIds }));
    } catch {}
  }, [answeredIds, correctIds]);

  const baseQuestions = useMemo(() => {
    return allWrittenQuestions.filter((q) => q.level === levelFilter);
  }, [levelFilter]);

  const questions = isShuffled ? shuffledQuestions : baseQuestions;

  const currentQuestion = questions[currentIndex] ?? questions[0];
  const hasAnswered = selectedIndex !== null;
  const isCorrect =
    currentQuestion !== undefined && selectedIndex === currentQuestion.answerIndex;
  const correctCount = Object.values(correctIds).filter(Boolean).length;
  const progressPercent =
    questions.length > 0
      ? Math.round((correctCount / questions.length) * 100)
      : 0;

  useEffect(() => {
    if (goldNotice === null) return;
    const t = setTimeout(() => setGoldNotice(null), 2000);
    return () => clearTimeout(t);
  }, [goldNotice]);

  useEffect(() => {
    if (expNotice === null) return;
    const t = setTimeout(() => setExpNotice(null), 2000);
    return () => clearTimeout(t);
  }, [expNotice]);

  const changeLevel = (level: LevelFilter) => {
    setLevelFilter(level);
    setIsShuffled(false);
    setCurrentIndex(0);
    setSelectedIndex(null);
    setGoldNotice(null);
    setExpNotice(null);
  };

  const handleShuffle = () => {
    setShuffledQuestions(shuffleArray(baseQuestions));
    setIsShuffled(true);
    setCurrentIndex(0);
    setSelectedIndex(null);
    setGoldNotice(null);
    setExpNotice(null);
  };

  const clearShuffle = () => {
    setIsShuffled(false);
    setCurrentIndex(0);
    setSelectedIndex(null);
    setGoldNotice(null);
    setExpNotice(null);
  };

  const goToQuestion = (nextIndex: number) => {
    const boundedIndex = Math.max(0, Math.min(nextIndex, questions.length - 1));
    setCurrentIndex(boundedIndex);
    setSelectedIndex(null);
    setGoldNotice(null);
    setExpNotice(null);
  };

  const handleAnswer = (choiceIndex: number) => {
    if (!currentQuestion || hasAnswered) return;
    setSelectedIndex(choiceIndex);
    setAnsweredIds((prev) => ({ ...prev, [currentQuestion.id]: true }));
    if (choiceIndex === currentQuestion.answerIndex) {
      setCorrectIds((prev) => ({ ...prev, [currentQuestion.id]: true }));
      addGold(3);
      setGoldNotice(3);
      const heroResult = addHeroExp(loadHeroStatus(), 3);
      saveHeroStatus(heroResult.after);
      setExpNotice({ gained: heroResult.gainedExp });
    }
  };

  const resetProgress = () => {
    setAnsweredIds({});
    setCorrectIds({});
    setSelectedIndex(null);
    setCurrentIndex(0);
    setLevelFilter("英検5級");
    setIsShuffled(false);
    setGoldNotice(null);
    setExpNotice(null);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  };

  if (!currentQuestion) {
    return (
      <main className="written-page">
        <section className="written-shell">
          <nav className="eq-topbar written-topbar">
            <Link href="/" className="eq-back-link written-back">← ホームへ戻る</Link>
          </nav>
          <div className="written-empty">問題がありません。</div>
        </section>
      </main>
    );
  }

  return (
    <main className="written-page">
      <section className="written-shell">
        <nav className="eq-topbar written-topbar">
          <Link href="/" className="eq-back-link written-back">← ホームへ戻る</Link>
          <Link href="/quiz" className="eq-back-link written-quest-link">クエストへ →</Link>
        </nav>

        <header className="written-header">
          <div>
            <p className="written-kicker">EIKEN WRITTEN TRAINING</p>
            <h1>筆記問題トレーニング</h1>
          </div>
          <div className="written-progress-card">
            <span>正解数</span>
            <strong>{correctCount} / {questions.length}</strong>
            <div className="written-progress-track" aria-hidden="true">
              <div
                className="written-progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </header>

        <div className="written-filters" aria-label="レベルを選ぶ">
          {levelFilters.map((level) => (
            <button
              key={level}
              type="button"
              className={levelFilter === level ? "active" : ""}
              onClick={() => changeLevel(level)}
            >
              {levelLabels[level]}
            </button>
          ))}
          <button
            type="button"
            className={isShuffled ? "shuffle-btn active" : "shuffle-btn"}
            onClick={isShuffled ? clearShuffle : handleShuffle}
          >
            {isShuffled ? "↺ 順番通り" : "シャッフル"}
          </button>
        </div>

        <section className="written-workspace">
          <aside className="written-index" aria-label="問題一覧">
            {questions.map((question, index) => (
              <button
                key={question.id}
                type="button"
                className={[
                  index === currentIndex ? "current" : "",
                  answeredIds[question.id]
                    ? correctIds[question.id] ? "correct" : "wrong"
                    : "",
                ].filter(Boolean).join(" ")}
                onClick={() => goToQuestion(index)}
              >
                {String(index + 1).padStart(2, "0")}
              </button>
            ))}
          </aside>

          <section className="written-question-panel">
            <div className="written-question-meta">
              <div className="written-meta-left">
                <span className="level-badge">{currentQuestion.level}</span>
                <span>{categoryLabels[currentQuestion.category]}</span>
                <span>{currentIndex + 1} / {questions.length}</span>
              </div>
              {hasAnswered && isCorrect && (
                <div className="written-meta-notices">
                  <div className="written-exp-notice" role="status">
                    <strong>EXP +{expNotice?.gained ?? 3}</strong>
                    <span>主人公EXP</span>
                  </div>
                  <div className="written-gold-notice" role="status">
                    <strong>🪙 +3</strong>
                    <span>ゴールド獲得</span>
                  </div>
                </div>
              )}
            </div>

            <div className="written-question-text">
              {currentQuestion.question}
            </div>

            <div className="written-choice-grid">
              {currentQuestion.choices.map((choice, index) => {
                const isSelected = selectedIndex === index;
                const isAnswer = currentQuestion.answerIndex === index;
                const className = [
                  "written-choice",
                  hasAnswered && isAnswer ? "correct" : "",
                  hasAnswered && isSelected && !isAnswer ? "wrong" : "",
                  hasAnswered && !isSelected && !isAnswer ? "muted" : "",
                ].filter(Boolean).join(" ");

                return (
                  <button
                    key={`${currentQuestion.id}-${choice}`}
                    type="button"
                    className={className}
                    onClick={() => handleAnswer(index)}
                    disabled={hasAnswered}
                  >
                    <span>{getAnswerLabel(index)}</span>
                    <strong>{choice}</strong>
                  </button>
                );
              })}
            </div>

            {hasAnswered && (
              <div className={isCorrect ? "written-result correct" : "written-result wrong"}>
                <strong>{isCorrect ? "正解です" : "もう一度確認しましょう"}</strong>
                <p>{currentQuestion.explanation}</p>
                <span>{currentQuestion.japanese}</span>
              </div>
            )}

            <div className="written-actions">
              <button
                type="button"
                onClick={() => goToQuestion(currentIndex - 1)}
                disabled={currentIndex === 0}
              >
                前へ
              </button>
              <button
                type="button"
                className="primary"
                onClick={() => goToQuestion(currentIndex + 1)}
                disabled={currentIndex >= questions.length - 1}
              >
                次へ
              </button>
              <button type="button" onClick={resetProgress}>
                リセット
              </button>
            </div>
          </section>
        </section>
      </section>

      <style jsx>{`
        .written-page {
          min-height: 100svh;
          color: #f8fafc;
          padding: 16px 20px;
        }

        .written-shell {
          width: 100%;
          max-width: 1360px;
          margin: 0 auto;
        }

        .written-topbar {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 10px;
          padding: 6px 10px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.055);
        }

        .written-back,
        .written-quest-link {
          min-height: 34px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 999px;
          padding: 0 14px;
          background: rgba(255, 255, 255, 0.06);
          color: #cbd5e1;
          font-size: 13px;
          font-weight: 900;
          text-decoration: none;
          transition:
            border-color 0.16s ease,
            background 0.16s ease,
            color 0.16s ease;
        }

        .written-back:hover,
        .written-quest-link:hover {
          border-color: rgba(45, 212, 191, 0.38);
          background: rgba(45, 212, 191, 0.08);
          color: #99f6e4;
        }

        .written-quest-link {
          margin-left: auto;
        }

        .written-header {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 190px;
          gap: 12px;
          align-items: stretch;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 20px;
          padding: 14px 16px;
          background:
            radial-gradient(circle at 92% 18%, rgba(20, 184, 166, 0.18), transparent 32%),
            linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(8, 13, 24, 0.96));
          box-shadow: 0 18px 48px rgba(0, 0, 0, 0.22);
        }

        .written-kicker {
          margin: 0;
          color: #5eead4;
          font-size: 11px;
          font-weight: 1000;
          letter-spacing: 0.1em;
        }

        .written-header h1 {
          margin: 6px 0 0;
          font-size: clamp(22px, 3vw, 32px);
          line-height: 1.14;
          font-weight: 1000;
        }

        .written-progress-card {
          display: flex;
          flex-direction: column;
          justify-content: center;
          border-radius: 16px;
          padding: 12px 14px;
          background:
            radial-gradient(circle at 50% 0%, rgba(45, 212, 191, 0.14), transparent 60%),
            rgba(255, 255, 255, 0.07);
          border: 1px solid rgba(45, 212, 191, 0.18);
        }

        .written-progress-card span {
          color: #94a3b8;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.06em;
        }

        .written-progress-card strong {
          margin-top: 6px;
          color: #fef3c7;
          font-size: 22px;
          line-height: 1;
          font-weight: 1000;
        }

        .written-progress-track {
          height: 6px;
          margin-top: 10px;
          overflow: hidden;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.1);
        }

        .written-progress-fill {
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #2dd4bf, #fde047);
          transition: width 0.3s ease;
        }

        .written-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin: 10px 0;
        }

        .written-filters button,
        .written-actions button {
          min-height: 34px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 999px;
          padding: 0 14px;
          background: rgba(255, 255, 255, 0.06);
          color: #cbd5e1;
          font: inherit;
          font-size: 12px;
          font-weight: 900;
          cursor: pointer;
          transition:
            transform 0.15s ease,
            border-color 0.15s ease,
            background 0.15s ease,
            color 0.15s ease;
        }

        .written-filters button:hover,
        .written-actions button:not(:disabled):hover {
          transform: translateY(-1px);
          border-color: rgba(45, 212, 191, 0.38);
          background: rgba(45, 212, 191, 0.08);
          color: #e2e8f0;
        }

        .written-filters button.active,
        .written-actions button.primary {
          border-color: rgba(45, 212, 191, 0.58);
          background: rgba(45, 212, 191, 0.16);
          color: #ccfbf1;
          box-shadow: 0 0 14px rgba(45, 212, 191, 0.1);
        }

        .written-filters button.active:hover,
        .written-actions button.primary:hover {
          background: rgba(45, 212, 191, 0.22);
          transform: translateY(-1px);
        }

        .shuffle-btn {
          margin-left: auto;
        }

        .shuffle-btn.active {
          border-color: rgba(251, 191, 36, 0.55) !important;
          background: rgba(251, 191, 36, 0.12) !important;
          color: #fde68a !important;
          box-shadow: 0 0 14px rgba(251, 191, 36, 0.1) !important;
        }

        .written-workspace {
          display: grid;
          grid-template-columns: 96px minmax(0, 1fr);
          gap: 14px;
          align-items: start;
        }

        .written-index {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 6px;
          max-height: calc(100svh - 198px);
          overflow: auto;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 8px;
          background: rgba(2, 6, 23, 0.48);
        }

        .written-index button {
          aspect-ratio: 1;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 9px;
          background: rgba(255, 255, 255, 0.055);
          color: #cbd5e1;
          font-size: 11px;
          font-weight: 1000;
          cursor: pointer;
          transition:
            border-color 0.14s ease,
            background 0.14s ease,
            color 0.14s ease;
        }

        .written-index button:hover {
          border-color: rgba(45, 212, 191, 0.44);
          color: #a5f3fc;
          background: rgba(20, 184, 166, 0.1);
        }

        .written-index button.current {
          border-color: rgba(45, 212, 191, 0.7);
          color: #ccfbf1;
          background: rgba(20, 184, 166, 0.18);
        }

        .written-index button.correct {
          border-color: rgba(52, 211, 153, 0.5);
          background: rgba(52, 211, 153, 0.14);
          color: #6ee7b7;
        }

        .written-index button.wrong {
          border-color: rgba(248, 113, 113, 0.55);
          background: rgba(248, 113, 113, 0.12);
          color: #fca5a5;
        }

        .written-question-panel {
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 20px;
          padding: 16px;
          background:
            linear-gradient(145deg, rgba(15, 23, 42, 0.92), rgba(8, 13, 24, 0.98));
          box-shadow:
            0 18px 48px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.04);
        }

        .written-question-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 10px;
        }

        .written-meta-left {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 7px;
        }

        .written-meta-left span {
          min-height: 25px;
          display: inline-flex;
          align-items: center;
          border: 1px solid rgba(255, 255, 255, 0.11);
          border-radius: 999px;
          padding: 0 9px;
          background: rgba(255, 255, 255, 0.055);
          color: #cbd5e1;
          font-size: 11px;
          font-weight: 900;
        }

        .level-badge {
          border-color: rgba(45, 212, 191, 0.35) !important;
          background: rgba(45, 212, 191, 0.1) !important;
          color: #5eead4 !important;
        }

        .written-meta-notices {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }

        .written-question-text {
          min-height: 96px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(45, 212, 191, 0.2);
          border-radius: 16px;
          padding: 16px;
          background: rgba(2, 6, 23, 0.45);
          color: #ffffff;
          text-align: center;
          font-size: clamp(20px, 2.7vw, 30px);
          line-height: 1.3;
          font-weight: 1000;
          overflow-wrap: anywhere;
        }

        .written-choice-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
          margin-top: 10px;
        }

        .written-choice {
          min-height: 62px;
          display: grid;
          grid-template-columns: 32px minmax(0, 1fr);
          align-items: center;
          gap: 10px;
          border: 1px solid rgba(255, 255, 255, 0.11);
          border-radius: 14px;
          padding: 10px 12px;
          background: rgba(255, 255, 255, 0.06);
          color: #f8fafc;
          text-align: left;
          font: inherit;
          cursor: pointer;
          transition:
            transform 0.16s ease,
            border-color 0.16s ease,
            background 0.16s ease,
            opacity 0.16s ease;
        }

        .written-choice:hover:not(:disabled) {
          transform: translateY(-2px);
          border-color: rgba(45, 212, 191, 0.48);
          background: rgba(20, 184, 166, 0.1);
        }

        .written-choice:disabled {
          cursor: default;
        }

        .written-choice span {
          width: 32px;
          height: 32px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.1);
          color: #fef3c7;
          font-size: 13px;
          font-weight: 1000;
          flex-shrink: 0;
        }

        .written-choice strong {
          min-width: 0;
          font-size: 15px;
          line-height: 1.3;
          font-weight: 900;
          overflow-wrap: anywhere;
        }

        .written-choice.correct {
          border-color: rgba(52, 211, 153, 0.72);
          background: rgba(52, 211, 153, 0.14);
          box-shadow: 0 0 18px rgba(52, 211, 153, 0.1);
        }

        .written-choice.correct span {
          background: rgba(52, 211, 153, 0.24);
          color: #6ee7b7;
        }

        .written-choice.wrong {
          border-color: rgba(248, 113, 113, 0.72);
          background: rgba(248, 113, 113, 0.12);
          box-shadow: 0 0 18px rgba(248, 113, 113, 0.08);
        }

        .written-choice.wrong span {
          background: rgba(248, 113, 113, 0.2);
          color: #fca5a5;
        }

        .written-choice.muted {
          opacity: 0.44;
        }

        .written-exp-notice,
        .written-gold-notice {
          width: fit-content;
          min-height: 26px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          border-radius: 999px;
          padding: 0 10px;
          animation: writtenNoticeIn 0.28s ease both;
        }

        .written-exp-notice {
          border: 1px solid rgba(250, 204, 21, 0.42);
          background:
            radial-gradient(circle at 50% 0%, rgba(250, 204, 21, 0.22), transparent 68%),
            rgba(113, 63, 18, 0.24);
          color: #fef3c7;
          box-shadow: 0 8px 24px rgba(250, 204, 21, 0.1);
        }

        .written-gold-notice {
          border: 1px solid rgba(52, 211, 153, 0.42);
          background:
            radial-gradient(circle at 50% 0%, rgba(52, 211, 153, 0.22), transparent 68%),
            rgba(6, 78, 59, 0.28);
          color: #a7f3d0;
          box-shadow: 0 8px 24px rgba(52, 211, 153, 0.1);
        }

        .written-exp-notice strong,
        .written-gold-notice strong {
          font-size: 12px;
          line-height: 1;
          font-weight: 1000;
        }

        .written-exp-notice span,
        .written-gold-notice span {
          color: #cbd5e1;
          font-size: 11px;
          line-height: 1.2;
          font-weight: 900;
        }

        @keyframes writtenNoticeIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.9); }
          to   { opacity: 1; transform: translateY(0)   scale(1);   }
        }

        .written-result {
          margin-top: 10px;
          border-radius: 14px;
          padding: 12px 14px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.06);
          animation: writtenResultIn 0.24s ease both;
        }

        .written-result.correct {
          border-color: rgba(52, 211, 153, 0.52);
          background: rgba(52, 211, 153, 0.08);
          box-shadow: 0 0 24px rgba(52, 211, 153, 0.08);
        }

        .written-result.wrong {
          border-color: rgba(248, 113, 113, 0.52);
          background: rgba(248, 113, 113, 0.08);
          box-shadow: 0 0 24px rgba(248, 113, 113, 0.08);
        }

        .written-result strong {
          display: block;
          color: #fef3c7;
          font-size: 14px;
          font-weight: 1000;
        }

        .written-result p {
          margin: 5px 0 0;
          color: #e2e8f0;
          font-size: 13px;
          line-height: 1.5;
          font-weight: 800;
        }

        .written-result span {
          display: block;
          margin-top: 5px;
          color: #94a3b8;
          font-size: 12px;
          line-height: 1.45;
          font-weight: 800;
        }

        .written-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: flex-end;
          margin-top: 12px;
          padding-top: 10px;
          border-top: 1px solid rgba(255, 255, 255, 0.07);
        }

        .written-actions button:disabled {
          cursor: not-allowed;
          opacity: 0.4;
        }

        .written-empty {
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 18px;
          padding: 24px;
          background: rgba(255, 255, 255, 0.06);
        }

        @keyframes writtenResultIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 820px) {
          .written-header,
          .written-workspace,
          .written-choice-grid {
            grid-template-columns: 1fr;
          }

          .written-index {
            grid-template-columns: repeat(10, minmax(38px, 1fr));
            max-height: none;
          }
        }

        @media (max-width: 520px) {
          .written-page {
            padding: 16px;
          }

          .written-header,
          .written-question-panel {
            border-radius: 18px;
            padding: 16px;
          }

          .written-question-text {
            min-height: 118px;
            padding: 18px 14px;
            font-size: 21px;
          }

          .written-choice {
            grid-template-columns: 30px minmax(0, 1fr);
          }

          .written-index {
            grid-template-columns: repeat(5, minmax(0, 1fr));
          }
        }
      `}</style>
    </main>
  );
}
