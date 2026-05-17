"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  addHeroExp,
  loadHeroStatus,
  saveHeroStatus,
  type HeroExpResult,
} from "../../data/hero";
import { getReadingForLevel } from "../../data/readings";
import { learningWords, type LearningWord } from "../../data/words";
import SpeechButton from "../components/SpeechButton";

const DISPLAY_STEP = 100;

type StudyMode = "list" | "memory";
type MemoryChoice = "again" | "ok" | "perfect";
type KindFilter = "all" | "word" | "phrase";
type StudyExpNotice = Pick<
  HeroExpResult,
  "gainedExp" | "leveledUp" | "before" | "after"
>;

const memoryChoices: {
  value: MemoryChoice;
  label: string;
  note: string;
  className: string;
}[] = [
  {
    value: "again",
    label: "もう一回",
    note: "後でもう一度出す",
    className: "again",
  },
  {
    value: "ok",
    label: "だいたいOK",
    note: "次へ進む",
    className: "ok",
  },
  {
    value: "perfect",
    label: "完璧",
    note: "魔導書に刻む",
    className: "perfect",
  },
];

const kindFilterOptions: {
  value: KindFilter;
  label: string;
}[] = [
  { value: "all", label: "すべて" },
  { value: "word", label: "単語" },
  { value: "phrase", label: "熟語" },
];

const memoryPerfectXpByLevel: Record<string, number> = {
  "英検5級": 8,
  "英検4級": 10,
  "英検3級": 12,
  "英検準2級": 16,
};

const memoryChoiceXpMultiplier: Record<MemoryChoice, number> = {
  again: 0,
  ok: 0.5,
  perfect: 1,
};

const DEFAULT_MEMORY_PERFECT_XP = 8;

function getFilteredWords(
  searchText: string,
  levelFilter: string,
  kindFilter: KindFilter
) {
  const keyword = searchText.trim().toLowerCase();

  return learningWords.filter((word) => {
    const matchesSearch =
      keyword === "" ||
      word.word.toLowerCase().includes(keyword) ||
      word.meaning.includes(searchText) ||
      word.example.toLowerCase().includes(keyword) ||
      word.exampleMeaning.includes(searchText);

    const matchesLevel = levelFilter === "all" || word.level === levelFilter;

    const matchesKind =
      kindFilter === "all" ||
      (kindFilter === "phrase" && word.type === "熟語") ||
      (kindFilter === "word" && word.type !== "熟語");

    return matchesSearch && matchesLevel && matchesKind;
  });
}

function applyRangeFilter(
  words: LearningWord[],
  level: string,
  rangeIndex: number | null,
  levelOnlyWords: LearningWord[]
) {
  if (rangeIndex === null || level === "all") return words;
  const start = rangeIndex * 100;
  const rangeNos = new Set(levelOnlyWords.slice(start, start + 100).map((w) => w.no));
  return words.filter((w) => rangeNos.has(w.no));
}

function getMemoryStudyXp(word: LearningWord, choice: MemoryChoice) {
  const multiplier = memoryChoiceXpMultiplier[choice];
  if (multiplier <= 0) return 0;

  const perfectXp =
    memoryPerfectXpByLevel[word.level] ?? DEFAULT_MEMORY_PERFECT_XP;

  return Math.max(1, Math.round(perfectXp * multiplier));
}

export default function WordsPage() {
  const [searchText, setSearchText] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [kindFilter, setKindFilter] = useState<KindFilter>("all");
  const [displayCount, setDisplayCount] = useState(DISPLAY_STEP);
  const [studyMode, setStudyMode] = useState<StudyMode>("list");
  const [memoryQueue, setMemoryQueue] = useState<LearningWord[]>(() => [
    ...learningWords,
  ]);
  const [memoryAnswered, setMemoryAnswered] = useState(false);
  const [memoryDoneCount, setMemoryDoneCount] = useState(0);
  const [studyExpNotice, setStudyExpNotice] =
    useState<StudyExpNotice | null>(null);
  const [rangeIndex, setRangeIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!studyExpNotice) return;
    const t = setTimeout(() => setStudyExpNotice(null), 2000);
    return () => clearTimeout(t);
  }, [studyExpNotice]);

  const levels = useMemo(() => {
    return Array.from(new Set(learningWords.map((word) => word.level)));
  }, []);

  const levelOnlyWords = useMemo(() => {
    if (levelFilter === "all") return [];
    return learningWords.filter((w) => w.level === levelFilter);
  }, [levelFilter]);

  const rangeCount = Math.ceil(levelOnlyWords.length / 100);

  const filteredWords = useMemo(() => {
    const base = getFilteredWords(searchText, levelFilter, kindFilter);
    return applyRangeFilter(base, levelFilter, rangeIndex, levelOnlyWords);
  }, [searchText, levelFilter, kindFilter, rangeIndex, levelOnlyWords]);

  const visibleWords = useMemo(() => {
    return filteredWords.slice(0, displayCount);
  }, [filteredWords, displayCount]);

  const hasMore = displayCount < filteredWords.length;
  const currentMemoryWord = memoryQueue[0];
  const memorySessionTotal = memoryDoneCount + memoryQueue.length;
  const memoryCurrentNumber = currentMemoryWord
    ? memoryDoneCount + 1
    : memorySessionTotal;
  const memoryProgressPercent =
    memorySessionTotal > 0
      ? Math.min(100, Math.round((memoryDoneCount / memorySessionTotal) * 100))
      : 0;
  const currentMemoryReading = currentMemoryWord
    ? getReadingForLevel(currentMemoryWord.level, currentMemoryWord.meaning)
    : undefined;

  useEffect(() => {
    if (studyMode !== "memory") return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [studyMode]);

  const resetDisplayCount = () => {
    setDisplayCount(DISPLAY_STEP);
  };

  const resetMemorySessionForWords = (words: LearningWord[]) => {
    setMemoryQueue(words);
    setMemoryDoneCount(0);
    setMemoryAnswered(false);
    setStudyExpNotice(null);
  };

  const resetMemorySession = () => {
    resetMemorySessionForWords(filteredWords);
  };

  const handleSearchChange = (value: string) => {
    setSearchText(value);
    resetDisplayCount();
    const base = getFilteredWords(value, levelFilter, kindFilter);
    resetMemorySessionForWords(applyRangeFilter(base, levelFilter, rangeIndex, levelOnlyWords));
  };

  const handleLevelChange = (level: string) => {
    setLevelFilter(level);
    setRangeIndex(null);
    resetDisplayCount();
    resetMemorySessionForWords(getFilteredWords(searchText, level, kindFilter));
  };

  const handleKindChange = (kind: KindFilter) => {
    setKindFilter(kind);
    resetDisplayCount();
    const base = getFilteredWords(searchText, levelFilter, kind);
    resetMemorySessionForWords(applyRangeFilter(base, levelFilter, rangeIndex, levelOnlyWords));
  };

  const handleRangeChange = (idx: number | null) => {
    setRangeIndex(idx);
    const base = getFilteredWords(searchText, levelFilter, kindFilter);
    resetMemorySessionForWords(applyRangeFilter(base, levelFilter, idx, levelOnlyWords));
  };

  const handleModeChange = (mode: StudyMode) => {
    setStudyMode(mode);
    setMemoryAnswered(false);
    setStudyExpNotice(null);
    if (mode === "list") setRangeIndex(null);
  };

  const handleMemoryChoice = (choice: MemoryChoice) => {
    const studiedWord = memoryQueue[0];
    const gainedExp = studiedWord ? getMemoryStudyXp(studiedWord, choice) : 0;

    if (gainedExp > 0) {
      const heroResult = addHeroExp(loadHeroStatus(), gainedExp);
      saveHeroStatus(heroResult.after);
      setStudyExpNotice({
        gainedExp: heroResult.gainedExp,
        leveledUp: heroResult.leveledUp,
        before: heroResult.before,
        after: heroResult.after,
      });
    } else {
      setStudyExpNotice(null);
    }

    setMemoryQueue((currentQueue) => {
      const [currentWord, ...nextWords] = currentQueue;
      if (!currentWord) return currentQueue;

      if (choice === "again") {
        return [...nextWords, currentWord];
      }

      return nextWords;
    });
    setMemoryDoneCount((current) => current + 1);
    setMemoryAnswered(false);
  };

  return (
    <main className="eq-page wordbook-page">
      <div className="eq-bg-orb eq-bg-orb-one" />
      <div className="eq-bg-orb eq-bg-orb-two" />
      <div className="eq-bg-orb eq-bg-orb-three" />

      <section className="eq-shell">
        <nav className="eq-topbar">
          <Link href="/" className="eq-back-link">
            ← ホームへ戻る
          </Link>
        </nav>

        {studyMode === "list" && (
          <div className="eq-hero">
            <div className="eq-hero-copy">
              <div className="eq-eyebrow">
                <span>📚</span>
                <span>WORD BOOK</span>
              </div>

              <h1 className="eq-page-title">単語の魔導書</h1>

              <p className="eq-lead">
                登録されている英単語・熟語の意味・例文を確認できます。
                このページだけで、一覧確認と1語ずつの暗記練習を切り替えられます。
              </p>

              <div
                className="eq-actions wordbook-mode-actions"
                aria-label="単語帳モード選択"
              >
                <button
                  type="button"
                  onClick={() => handleModeChange("list")}
                  aria-pressed="true"
                  className="eq-button eq-button-primary wordbook-mode-action active"
                >
                  <span>📋</span>
                  一覧モード
                </button>

                <button
                  type="button"
                  onClick={() => handleModeChange("memory")}
                  aria-pressed="false"
                  className="eq-button eq-button-secondary wordbook-mode-action"
                >
                  <span>⭐</span>
                  暗記モード
                </button>
              </div>
            </div>

            <div className="wordbook-stage">
              <div className="eq-display-card">
                <div className="eq-display-shine" />
                <div className="eq-display-icon">📖</div>
                <p>WORD BOOK</p>
                <h2>{learningWords.length}</h2>
                <span>registered words</span>
              </div>
            </div>

            <div className="eq-status-strip">
              <div className="eq-status-card">
                <span>登録語数</span>
                <strong>{learningWords.length}</strong>
              </div>

              <div className="eq-status-card">
                <span>検索結果</span>
                <strong>{filteredWords.length}</strong>
              </div>

              <div className="eq-status-card is-highlight">
                <span>表示中</span>
                <strong>{visibleWords.length}</strong>
              </div>
            </div>
          </div>
        )}

        {studyMode === "memory" && (
          <div className="wordbook-memory-toolbar">
            <div className="wordbook-memory-summary">
              <span className="wordbook-memory-label">暗記モード</span>
              <strong>
                {levelFilter === "all" ? "すべて" : levelFilter}
                {rangeIndex !== null
                  ? ` / ${rangeIndex * 100 + 1}-${Math.min((rangeIndex + 1) * 100, levelOnlyWords.length)}`
                  : ""}
                {" "}/ 残り {memoryQueue.length} 語
              </strong>
            </div>

            <div className="wordbook-memory-controls">
              <div className="memory-level-tabs" aria-label="暗記する級を選ぶ">
                <button
                  type="button"
                  onClick={() => handleLevelChange("all")}
                  className={
                    levelFilter === "all"
                      ? "memory-level-tab active"
                      : "memory-level-tab"
                  }
                >
                  すべて
                </button>

                {levels.map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => handleLevelChange(level)}
                    className={
                      levelFilter === level
                        ? "memory-level-tab active"
                        : "memory-level-tab"
                    }
                  >
                    {level}
                  </button>
                ))}
              </div>

              {levelFilter !== "all" && rangeCount > 1 && (
                <div className="memory-range-tabs" aria-label="100語ずつ選ぶ">
                  <button
                    type="button"
                    onClick={() => handleRangeChange(null)}
                    className={rangeIndex === null ? "memory-range-tab active" : "memory-range-tab"}
                  >
                    全体
                  </button>
                  {Array.from({ length: rangeCount }, (_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleRangeChange(i)}
                      className={rangeIndex === i ? "memory-range-tab active" : "memory-range-tab"}
                    >
                      {i * 100 + 1}–{Math.min((i + 1) * 100, levelOnlyWords.length)}
                    </button>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => handleModeChange("list")}
                className="wordbook-memory-back-button"
              >
                一覧モードへ
              </button>
            </div>
          </div>
        )}

        {studyMode === "list" && (
          <div className="eq-panel words-filter-panel">
            <div className="words-search-wrap">
              <span className="words-search-icon">🔎</span>
              <input
                type="text"
                value={searchText}
                onChange={(event) => handleSearchChange(event.target.value)}
                placeholder="英単語・意味・例文で検索"
                className="wordbook-search"
              />
            </div>

            <div className="words-filter-block">
              <div className="words-filter-head">
                <span>LEVEL</span>
                <strong>レベルで絞り込み</strong>
              </div>

              <div className="words-level-tabs">
                <button
                  type="button"
                  onClick={() => handleLevelChange("all")}
                  className={
                    levelFilter === "all"
                      ? "wordbook-level-tab active"
                      : "wordbook-level-tab"
                  }
                >
                  すべて
                </button>

                {levels.map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => handleLevelChange(level)}
                    className={
                      levelFilter === level
                        ? "wordbook-level-tab active"
                        : "wordbook-level-tab"
                    }
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="words-filter-block">
              <div className="words-filter-head">
                <span>KIND</span>
                <strong>種類</strong>
              </div>

              <div className="words-kind-tabs">
                {kindFilterOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleKindChange(option.value)}
                    className={
                      kindFilter === option.value
                        ? "wordbook-kind-chip active"
                        : "wordbook-kind-chip"
                    }
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {filteredWords.length === 0 ? (
          <div className="eq-panel words-empty">
            <div>🔍</div>
            <h2>該当する単語がありません</h2>
            <p>検索条件を変えて、もう一度試してください。</p>
          </div>
        ) : studyMode === "memory" ? (
          <div className="memory-stage">
            {currentMemoryWord ? (
              <article
                className={
                  memoryAnswered
                    ? "memory-card is-answered"
                    : "memory-card"
                }
              >
                <div className="memory-card-glow" />

                <div className="memory-progress-row">
                  <span>
                    暗記進捗 {memoryCurrentNumber} / {memorySessionTotal}
                  </span>
                  <button type="button" onClick={resetMemorySession}>
                    最初から
                  </button>
                </div>

                <div
                  className="memory-progress-track"
                  aria-hidden="true"
                >
                  <div style={{ width: `${memoryProgressPercent}%` }} />
                </div>

                <div
                  className={
                    studyExpNotice
                      ? "memory-exp-notice"
                      : "memory-exp-notice is-empty"
                  }
                  role={studyExpNotice ? "status" : undefined}
                  aria-hidden={studyExpNotice ? undefined : true}
                >
                  {studyExpNotice ? (
                    <>
                    <strong>EXP +{studyExpNotice.gainedExp}</strong>
                    <span>
                      {studyExpNotice.leveledUp
                        ? `Lv.${studyExpNotice.before.level} → Lv.${studyExpNotice.after.level}`
                        : "主人公EXP"}
                    </span>
                    </>
                  ) : (
                    <>
                      <strong>EXP +0</strong>
                      <span>主人公EXP</span>
                    </>
                  )}
                </div>

                <div className="memory-badges">
                  <span>{currentMemoryWord.level}</span>
                  <span>{currentMemoryWord.type}</span>
                </div>

                <p className="memory-kicker">MEMORY MODE</p>
                <h2 className="memory-word">{currentMemoryWord.word}</h2>

                <div
                  className={
                    memoryAnswered
                      ? "memory-primary-actions is-reviewing"
                      : "memory-primary-actions"
                  }
                >
                  {memoryAnswered ? (
                    memoryChoices.map((choice) => (
                      <button
                        key={choice.value}
                        type="button"
                        onClick={() => handleMemoryChoice(choice.value)}
                        className={`memory-review-button ${choice.className}`}
                      >
                        <strong>{choice.label}</strong>
                        <span>{choice.note}</span>
                      </button>
                    ))
                  ) : (
                    <>
                      <SpeechButton
                        text={currentMemoryWord.word}
                        label="単語を聞く"
                        activeLabel="停止"
                        title={`${currentMemoryWord.word} を読み上げる`}
                        className="memory-speech-button"
                      />

                      <button
                        type="button"
                        onClick={() => setMemoryAnswered(true)}
                        className="memory-reveal-button"
                      >
                        答えを見る
                      </button>

                      <span className="memory-action-spacer" aria-hidden="true" />
                    </>
                  )}
                </div>

                {memoryAnswered && (
                  <div className="memory-answer">
                    <div className="memory-answer-grid">
                      <section className="memory-answer-box">
                        <span>日本語訳</span>
                        <strong>{currentMemoryWord.meaning}</strong>
                      </section>

                      <section className="memory-answer-box">
                        <span>ふりがな</span>
                        <strong>
                          {currentMemoryReading ?? "ふりがな未登録"}
                        </strong>
                      </section>
                    </div>

                    <section className="memory-answer-box memory-example-box">
                      <span>例文</span>
                      <p className="memory-example-en">
                        {currentMemoryWord.example}
                      </p>
                      <p className="memory-example-ja">
                        {currentMemoryWord.exampleMeaning}
                      </p>
                    </section>

                  </div>
                )}
              </article>
            ) : (
              <div className="eq-panel memory-complete">
                <p>MEMORY COMPLETE</p>
                <h2>今回の暗記が完了しました</h2>
                <span>
                  もう一度挑戦すると、同じ条件の単語を最初から確認できます。
                </span>
                <button
                  type="button"
                  onClick={resetMemorySession}
                  className="eq-button eq-button-primary"
                >
                  もう一度はじめる
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="words-list">
              {visibleWords.map((word, index) => {
                const reading = getReadingForLevel(word.level, word.meaning);

                return (
                  <article key={`${word.word}-${index}`} className="words-card">
                    <div className="words-card-top">
                      <div className="words-word-area">
                        <div className="words-word-title">
                          <h2>{word.word}</h2>
                          <SpeechButton
                            text={word.word}
                            label="単語を聞く"
                            title={`${word.word} を読み上げる`}
                          />
                        </div>
                        <p className="words-meaning">{word.meaning}</p>
                        {reading && (
                          <p className="words-reading">({reading})</p>
                        )}
                      </div>

                      <div className="words-badges">
                        <span>{word.level}</span>
                        <span>{word.type}</span>
                      </div>
                    </div>

                    <div className="words-example">
                      <div className="words-example-head">
                        <span>例文</span>
                        <SpeechButton
                          text={word.example}
                          label="例文を聞く"
                          title="例文を読み上げる"
                        />
                      </div>
                      <p className="words-example-en">{word.example}</p>
                      <p className="words-example-ja">{word.exampleMeaning}</p>
                    </div>
                  </article>
                );
              })}
            </div>

            {hasMore && (
              <div className="words-more-area">
                <button
                  type="button"
                  onClick={() =>
                    setDisplayCount((current) => current + DISPLAY_STEP)
                  }
                  className="eq-button eq-button-primary words-more-button"
                >
                  もっと見る
                  <span>
                    {visibleWords.length} / {filteredWords.length}
                  </span>
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <style jsx>{`
        .wordbook-stage {
          display: flex;
          justify-content: center;
        }

        .wordbook-mode-actions {
          max-width: 600px;
        }

        .wordbook-mode-action {
          font-family: inherit;
        }

        .wordbook-mode-action span {
          line-height: 1;
        }

        .wordbook-mode-action.active {
          outline: 2px solid rgba(255, 255, 255, 0.34);
          outline-offset: 3px;
        }

        .wordbook-memory-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: 8px;
          border: 1px solid rgba(34, 211, 238, 0.22);
          border-radius: 18px;
          padding: 10px 12px;
          background: rgba(8, 12, 22, 0.72);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
        }

        .wordbook-memory-summary {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .wordbook-memory-label {
          color: #99f6e4;
          font-size: 12px;
          font-weight: 1000;
        }

        .wordbook-memory-summary strong {
          color: #fef3c7;
          font-size: 14px;
          line-height: 1.2;
          font-weight: 1000;
        }

        .wordbook-memory-controls {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
          flex-wrap: wrap;
        }

        .memory-level-tabs {
          max-width: min(100%, 620px);
          display: flex;
          align-items: center;
          gap: 8px;
          overflow-x: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(45, 212, 191, 0.42) transparent;
          padding: 2px;
        }

        .memory-level-tab {
          min-height: 38px;
          flex: 0 0 auto;
          border: 1px solid rgba(34, 211, 238, 0.24);
          border-radius: 999px;
          background: rgba(15, 23, 42, 0.7);
          color: #cbd5e1;
          padding: 0 13px;
          font: inherit;
          font-size: 13px;
          font-weight: 1000;
          white-space: nowrap;
          cursor: pointer;
          transition:
            transform 0.16s ease,
            border-color 0.16s ease,
            color 0.16s ease,
            background 0.16s ease;
        }

        .memory-level-tab:hover {
          transform: translateY(-1px);
          border-color: rgba(45, 212, 191, 0.5);
          color: #f8fafc;
          background: rgba(20, 184, 166, 0.12);
        }

        .memory-level-tab.active {
          border-color: rgba(251, 191, 36, 0.82);
          background: linear-gradient(135deg, #fde68a, #f59e0b);
          color: #111827;
          box-shadow: 0 10px 24px rgba(245, 158, 11, 0.2);
        }

        .memory-range-tabs {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          padding: 2px 0;
        }

        .memory-range-tab {
          min-height: 30px;
          flex: 0 0 auto;
          border: 1px solid rgba(168, 85, 247, 0.28);
          border-radius: 999px;
          background: rgba(15, 23, 42, 0.6);
          color: #c4b5fd;
          padding: 0 10px;
          font: inherit;
          font-size: 11px;
          font-weight: 900;
          white-space: nowrap;
          cursor: pointer;
          transition:
            transform 0.14s ease,
            border-color 0.14s ease,
            color 0.14s ease,
            background 0.14s ease;
        }

        .memory-range-tab:hover {
          transform: translateY(-1px);
          border-color: rgba(168, 85, 247, 0.56);
          color: #e9d5ff;
          background: rgba(168, 85, 247, 0.1);
        }

        .memory-range-tab.active {
          border-color: rgba(168, 85, 247, 0.82);
          background: linear-gradient(135deg, #a855f7, #7c3aed);
          color: #fff;
          box-shadow: 0 6px 18px rgba(168, 85, 247, 0.24);
        }

        .wordbook-memory-back-button {
          min-height: 40px;
          flex: 0 0 auto;
          border: 1px solid rgba(34, 211, 238, 0.34);
          border-radius: 14px;
          background: rgba(20, 184, 166, 0.08);
          color: #99f6e4;
          padding: 0 14px;
          font: inherit;
          font-size: 13px;
          font-weight: 1000;
          cursor: pointer;
          transition:
            transform 0.16s ease,
            border-color 0.16s ease,
            background 0.16s ease;
        }

        .wordbook-memory-back-button:hover {
          transform: translateY(-1px);
          border-color: rgba(45, 212, 191, 0.58);
          background: rgba(45, 212, 191, 0.12);
        }

        .words-filter-panel {
          display: grid;
          gap: 18px;
          margin-top: 24px;
        }

        .words-search-wrap {
          position: relative;
        }

        .words-search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          opacity: 0.72;
          font-size: 15px;
          pointer-events: none;
        }

        .words-filter-block {
          display: grid;
          gap: 10px;
        }

        .words-filter-head {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .words-filter-head span {
          display: inline-flex;
          align-items: center;
          min-height: 24px;
          border-radius: 999px;
          padding: 0 10px;
          background: rgba(251, 191, 36, 0.1);
          border: 1px solid rgba(251, 191, 36, 0.22);
          color: #fde68a;
          font-size: 10px;
          font-weight: 1000;
          letter-spacing: 0.16em;
        }

        .words-filter-head strong {
          color: #cbd5e1;
          font-size: 12px;
          font-weight: 1000;
        }

        .words-level-tabs {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 8px;
        }

        .words-kind-tabs {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 160px));
          gap: 8px;
        }

        .wordbook-kind-chip {
          min-height: 50px;
          border: 1px solid rgba(148, 163, 184, 0.22);
          border-radius: 16px;
          background: rgba(15, 23, 42, 0.72);
          color: #cbd5e1;
          padding: 0 16px;
          font: inherit;
          font-size: 14px;
          font-weight: 1000;
          cursor: pointer;
          white-space: normal;
          line-height: 1.2;
          transition:
            transform 0.16s ease,
            border-color 0.16s ease,
            background 0.16s ease,
            color 0.16s ease,
            box-shadow 0.16s ease;
        }

        .wordbook-kind-chip:hover,
        .wordbook-kind-chip.active {
          transform: translateY(-1px);
          border-color: rgba(250, 204, 21, 0.56);
          background:
            radial-gradient(
              circle at 50% 0%,
              rgba(250, 204, 21, 0.18),
              transparent 62%
            ),
            rgba(41, 37, 36, 0.78);
          color: #fef3c7;
          box-shadow:
            0 0 0 1px rgba(250, 204, 21, 0.08),
            0 14px 42px rgba(250, 204, 21, 0.1);
        }

        .memory-stage {
          width: 100%;
          display: grid;
          place-items: center;
          margin-top: 6px;
        }

        .memory-card {
          position: relative;
          isolation: isolate;
          width: min(100%, 1040px);
          min-height: auto;
          overflow: hidden;
          border: 1px solid rgba(34, 211, 238, 0.24);
          border-radius: 26px;
          padding: 18px;
          background:
            linear-gradient(rgba(34, 211, 238, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 211, 238, 0.05) 1px, transparent 1px),
            radial-gradient(
              circle at 50% -10%,
              rgba(34, 211, 238, 0.18),
              transparent 42%
            ),
            radial-gradient(
              circle at 100% 100%,
              rgba(251, 191, 36, 0.12),
              transparent 34%
            ),
            linear-gradient(145deg, #020617, #0f172a 56%, #061121);
          background-size:
            26px 26px,
            26px 26px,
            auto,
            auto,
            auto;
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.08),
            inset 0 -24px 60px rgba(2, 6, 23, 0.54),
            0 28px 90px rgba(0, 0, 0, 0.38),
            0 0 80px rgba(34, 211, 238, 0.1);
        }

        .memory-card::before {
          content: "";
          position: absolute;
          inset: 12px;
          z-index: -1;
          border: 1px solid rgba(34, 211, 238, 0.12);
          border-radius: 20px;
          pointer-events: none;
        }

        .memory-card-glow {
          position: absolute;
          inset: auto 12% -28% 12%;
          height: 180px;
          z-index: -1;
          border-radius: 999px;
          background: rgba(34, 211, 238, 0.12);
          filter: blur(48px);
          pointer-events: none;
        }

        .memory-progress-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .memory-progress-row span {
          color: #a5f3fc;
          font-size: 13px;
          font-weight: 1000;
          letter-spacing: 0.08em;
        }

        .memory-progress-row button {
          min-height: 36px;
          border: 1px solid rgba(148, 163, 184, 0.24);
          border-radius: 999px;
          background: rgba(15, 23, 42, 0.7);
          color: #cbd5e1;
          padding: 0 14px;
          font: inherit;
          font-size: 12px;
          font-weight: 1000;
          cursor: pointer;
          transition:
            transform 0.15s ease,
            border-color 0.15s ease,
            color 0.15s ease;
        }

        .memory-progress-row button:hover {
          transform: translateY(-1px);
          border-color: rgba(34, 211, 238, 0.5);
          color: #ecfeff;
        }

        .memory-progress-track {
          height: 8px;
          margin-top: 10px;
          overflow: hidden;
          border-radius: 999px;
          background: rgba(15, 23, 42, 0.9);
          border: 1px solid rgba(148, 163, 184, 0.16);
        }

        .memory-progress-track div {
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #22d3ee, #facc15);
          box-shadow: 0 0 18px rgba(34, 211, 238, 0.46);
          transition: width 0.24s ease;
        }

        .memory-exp-notice {
          width: fit-content;
          max-width: 100%;
          min-height: 32px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin: 8px auto 0;
          border: 1px solid rgba(250, 204, 21, 0.42);
          border-radius: 999px;
          background:
            radial-gradient(
              circle at 50% 0%,
              rgba(250, 204, 21, 0.22),
              transparent 68%
            ),
            rgba(113, 63, 18, 0.24);
          padding: 0 12px;
          color: #fef3c7;
          box-shadow: 0 16px 42px rgba(250, 204, 21, 0.12);
          animation: memoryExpPop 0.28s ease both;
        }

        .memory-exp-notice strong {
          font-size: 14px;
          line-height: 1;
          font-weight: 1000;
        }

        .memory-exp-notice span {
          color: #cbd5e1;
          font-size: 12px;
          line-height: 1.2;
          font-weight: 900;
        }

        .memory-exp-notice.is-empty {
          visibility: hidden;
          animation: none;
        }

        .memory-badges {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 8px;
          margin-top: 12px;
        }

        .memory-badges span {
          min-height: 24px;
          display: inline-flex;
          align-items: center;
          border-radius: 999px;
          padding: 0 9px;
          border: 1px solid rgba(34, 211, 238, 0.36);
          background: rgba(34, 211, 238, 0.1);
          color: #a5f3fc;
          font-size: 11px;
          font-weight: 1000;
          line-height: 1.25;
        }

        .memory-kicker {
          display: none;
        }

        .memory-word {
          margin: 12px 0 0;
          text-align: center;
          color: #f8fafc;
          text-shadow:
            0 0 24px rgba(34, 211, 238, 0.32),
            0 4px 24px rgba(0, 0, 0, 0.44);
          font-size: clamp(42px, 5.5vw, 68px);
          line-height: 1;
          font-weight: 1000;
          letter-spacing: 0;
          overflow-wrap: anywhere;
        }

        .memory-primary-actions {
          display: grid;
          grid-template-columns: repeat(3, minmax(172px, 212px));
          justify-content: center;
          gap: 10px;
          margin-top: 14px;
        }

        .memory-primary-actions.is-reviewing {
          margin-top: 14px;
        }

        .memory-action-spacer {
          display: block;
        }

        :global(.memory-speech-button) {
          width: 100%;
          min-height: 52px;
          border-radius: 14px;
          padding: 0 14px;
          font-size: 14px;
          box-shadow: 0 16px 44px rgba(34, 211, 238, 0.14);
        }

        .memory-reveal-button {
          width: 100%;
          min-height: 52px;
          border: 1px solid rgba(251, 191, 36, 0.46);
          border-radius: 14px;
          background:
            radial-gradient(
              circle at 50% 0%,
              rgba(254, 240, 138, 0.28),
              transparent 64%
            ),
            linear-gradient(135deg, #f59e0b, #0e7490);
          color: #fff7ed;
          padding: 0 18px;
          font: inherit;
          font-size: 15px;
          font-weight: 1000;
          line-height: 1.2;
          cursor: pointer;
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.24),
            0 20px 60px rgba(245, 158, 11, 0.18);
          transition:
            transform 0.16s ease,
            box-shadow 0.16s ease;
        }

        .memory-reveal-button:hover {
          transform: translateY(-2px);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.28),
            0 24px 72px rgba(34, 211, 238, 0.2);
        }

        .memory-answer {
          margin-top: 14px;
          animation: memoryAnswerIn 0.24s ease both;
        }

        .memory-answer-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .memory-answer-box {
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 12px 14px;
          background: rgba(2, 6, 23, 0.58);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        .memory-answer-box span {
          display: block;
          color: #67e8f9;
          font-size: 10px;
          font-weight: 1000;
          letter-spacing: 0.12em;
        }

        .memory-answer-box strong {
          display: block;
          margin-top: 4px;
          color: #fde68a;
          font-size: 19px;
          line-height: 1.3;
          font-weight: 1000;
          overflow-wrap: anywhere;
        }

        .memory-example-box {
          margin-top: 10px;
        }

        .memory-example-en {
          margin: 6px 0 0;
          color: #ffffff;
          font-size: 16px;
          line-height: 1.45;
          font-weight: 900;
        }

        .memory-example-ja {
          margin: 3px 0 0;
          color: #cbd5e1;
          font-size: 14px;
          line-height: 1.45;
          font-weight: 800;
        }

        .memory-review-button {
          width: 100%;
          min-height: 56px;
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 14px;
          background: rgba(15, 23, 42, 0.78);
          color: #f8fafc;
          padding: 8px 10px;
          font: inherit;
          cursor: pointer;
          transition:
            transform 0.16s ease,
            border-color 0.16s ease,
            background 0.16s ease,
            box-shadow 0.16s ease;
        }

        .memory-review-button strong,
        .memory-review-button span {
          display: block;
          line-height: 1.25;
        }

        .memory-review-button strong {
          font-size: 15px;
          font-weight: 1000;
        }

        .memory-review-button span {
          margin-top: 4px;
          color: #cbd5e1;
          font-size: 11px;
          font-weight: 900;
        }

        .memory-review-button:hover {
          transform: translateY(-2px);
        }

        .memory-review-button.again {
          border-color: rgba(248, 113, 113, 0.34);
          background: rgba(127, 29, 29, 0.22);
        }

        .memory-review-button.again:hover {
          box-shadow: 0 18px 50px rgba(248, 113, 113, 0.14);
        }

        .memory-review-button.ok {
          border-color: rgba(34, 211, 238, 0.38);
          background: rgba(14, 116, 144, 0.24);
        }

        .memory-review-button.ok:hover {
          box-shadow: 0 18px 50px rgba(34, 211, 238, 0.16);
        }

        .memory-review-button.perfect {
          border-color: rgba(250, 204, 21, 0.4);
          background: rgba(113, 63, 18, 0.26);
        }

        .memory-review-button.perfect:hover {
          box-shadow: 0 18px 50px rgba(250, 204, 21, 0.16);
        }

        .memory-complete {
          width: min(100%, 720px);
          min-height: 360px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          text-align: center;
        }

        .memory-complete p {
          margin: 0;
          color: #67e8f9;
          font-size: 12px;
          font-weight: 1000;
          letter-spacing: 0.16em;
        }

        .memory-complete h2 {
          margin: 12px 0 0;
          color: #f8fafc;
          font-size: 30px;
          line-height: 1.25;
          font-weight: 1000;
          letter-spacing: 0;
        }

        .memory-complete span {
          max-width: 480px;
          display: block;
          margin: 10px 0 22px;
          color: #94a3b8;
          font-size: 14px;
          line-height: 1.8;
          font-weight: 800;
        }

        .words-list {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
          margin-top: 24px;
        }

        .words-card {
          min-width: 0;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 18px;
          background: rgba(15, 23, 42, 0.74);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.22);
          transition:
            transform 0.18s ease,
            background 0.18s ease;
        }

        .words-card:hover {
          transform: translateY(-4px);
          background: rgba(255, 255, 255, 0.075);
        }

        .words-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 14px;
        }

        .words-word-area {
          flex: 1 1 260px;
          min-width: 0;
        }

        .words-word-title {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .words-word-area h2 {
          margin: 0;
          font-size: 30px;
          line-height: 1.1;
          font-weight: 1000;
          letter-spacing: 0;
          word-break: break-word;
        }

        .words-word-area .words-meaning {
          margin: 8px 0 0;
          color: #fde68a;
          font-size: 18px;
          line-height: 1.35;
          font-weight: 1000;
        }

        .words-word-area .words-reading {
          margin: 4px 0 0;
          color: #6ee7b7;
          font-size: 13px;
          line-height: 1.5;
          font-weight: 900;
        }

        .words-badges {
          flex: 1 1 150px;
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-end;
          align-content: flex-start;
          gap: 8px;
        }

        .words-badges span {
          max-width: 100%;
          min-height: 30px;
          display: inline-flex;
          align-items: center;
          border-radius: 999px;
          padding: 0 10px;
          border: 1px solid rgba(34, 211, 238, 0.32);
          background: rgba(34, 211, 238, 0.1);
          color: #a5f3fc;
          font-size: 11px;
          font-weight: 1000;
          white-space: normal;
          line-height: 1.25;
        }

        .words-example {
          margin-top: 14px;
          border-radius: 18px;
          padding: 14px;
          background: rgba(2, 6, 23, 0.52);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .words-example-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 8px;
        }

        .words-example-head span {
          color: #94a3b8;
          font-size: 11px;
          font-weight: 900;
        }

        .words-example-en {
          margin: 0;
          color: white;
          font-size: 15px;
          line-height: 1.6;
          font-weight: 900;
        }

        .words-example-ja {
          margin: 6px 0 0;
          color: #cbd5e1;
          font-size: 14px;
          line-height: 1.6;
          font-weight: 700;
        }

        .words-more-area {
          display: flex;
          justify-content: center;
          margin: 24px 0 10px;
        }

        .words-more-button {
          min-width: 240px;
        }

        .words-more-button span {
          display: block;
          margin-left: 4px;
          font-size: 12px;
          opacity: 0.8;
        }

        .words-empty {
          min-height: 300px;
          margin-top: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          text-align: center;
        }

        .words-empty div {
          font-size: 72px;
        }

        .words-empty h2 {
          margin: 18px 0 0;
          font-size: 26px;
          font-weight: 1000;
        }

        .words-empty p {
          margin: 10px 0 0;
          color: #94a3b8;
          font-size: 14px;
          font-weight: 800;
        }

        @keyframes memoryAnswerIn {
          from {
            transform: translateY(10px);
            opacity: 0;
          }

          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes memoryExpPop {
          from {
            transform: translateY(-6px) scale(0.96);
            opacity: 0;
          }

          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }

        @media (max-width: 960px) {
          .words-list {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 720px) {
          .wordbook-memory-toolbar {
            align-items: stretch;
            flex-direction: column;
          }

          .wordbook-memory-controls {
            justify-content: stretch;
          }

          .memory-level-tabs,
          .wordbook-memory-back-button {
            flex: 1 1 160px;
          }

          .memory-level-tabs {
            max-width: 100%;
          }

          .words-level-tabs {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .words-kind-tabs {
            grid-template-columns: 1fr;
          }

          .memory-card {
            min-height: 0;
            border-radius: 22px;
            padding: 16px;
          }

          .memory-card::before {
            inset: 10px;
            border-radius: 18px;
          }

          .memory-progress-row {
            align-items: flex-start;
            flex-direction: column;
          }

          .memory-progress-row button {
            width: 100%;
          }

          .memory-word {
            font-size: clamp(40px, 15vw, 62px);
          }

          .memory-primary-actions {
            display: grid;
            grid-template-columns: 1fr;
          }

          .memory-action-spacer {
            display: none;
          }

          :global(.memory-speech-button),
          .memory-reveal-button {
            width: 100%;
          }

          .memory-answer-grid {
            grid-template-columns: 1fr;
          }

          .memory-review-button {
            min-height: 52px;
          }

          .words-card-top {
            flex-direction: column;
          }

          .words-badges {
            justify-content: flex-start;
          }

          .words-word-area h2 {
            font-size: 26px;
          }

          .words-word-area .words-meaning {
            font-size: 16px;
          }

          .words-example-head {
            align-items: flex-start;
            flex-direction: column;
          }
        }

        @media (max-width: 420px) {
          .memory-badges {
            justify-content: flex-start;
          }

          .memory-kicker,
          .memory-word {
            text-align: left;
          }

          .memory-answer-box strong {
            font-size: 19px;
          }

          .memory-example-en {
            font-size: 16px;
          }
        }
      `}</style>
    </main>
  );
}
