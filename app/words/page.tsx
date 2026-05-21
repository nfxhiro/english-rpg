"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  addGold,
  addHeroExp,
  loadHeroStatus,
  saveHeroStatus,
  type HeroExpResult,
} from "../../data/hero";
import { getReadingForLevel } from "../../data/readings";
import {
  getStoredFuriganaEnabled,
  setStoredFuriganaEnabled,
  subscribeToFuriganaEnabledChange,
} from "../../data/preferences";
import { learningWords, type LearningWord } from "../../data/words";
import SpeechButton from "../components/SpeechButton";

const DISPLAY_STEP = 100;

type StudyMode = "list" | "memory";
type KindFilter = "all" | "word" | "phrase";
type StudyExpNotice = Pick<
  HeroExpResult,
  "gainedExp" | "leveledUp" | "before" | "after"
>;

const kindFilterOptions: {
  value: KindFilter;
  label: string;
}[] = [
  { value: "all", label: "すべて" },
  { value: "word", label: "単語" },
  { value: "phrase", label: "熟語" },
];

const DEFAULT_MEMORY_PERFECT_XP = 3;

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

function getMemoryStudyXp() {
  return DEFAULT_MEMORY_PERFECT_XP;
}

function getAnswerLabel(index: number) {
  return String.fromCharCode(65 + index);
}

function getMemoryChoiceReading(currentWord: LearningWord, choice: string) {
  const sameLevelReading = getReadingForLevel(currentWord.level, choice);
  if (sameLevelReading) return sameLevelReading;

  const sourceWord = learningWords.find((word) => word.meaning === choice);
  return sourceWord ? getReadingForLevel(sourceWord.level, choice) : undefined;
}

function getChoiceSeed(word: LearningWord) {
  const source = `${word.no}-${word.word}-${word.meaning}`;
  let seed = 2166136261;

  for (let i = 0; i < source.length; i += 1) {
    seed ^= source.charCodeAt(i);
    seed = Math.imul(seed, 16777619);
  }

  return seed >>> 0;
}

function shuffleWithSeed<T>(items: T[], seed: number) {
  const nextItems = [...items];
  let nextSeed = seed || 1;

  for (let i = nextItems.length - 1; i > 0; i -= 1) {
    nextSeed = (Math.imul(nextSeed, 1664525) + 1013904223) >>> 0;
    const j = nextSeed % (i + 1);
    [nextItems[i], nextItems[j]] = [nextItems[j], nextItems[i]];
  }

  return nextItems;
}

function createMemoryAnswerChoices(
  currentWord: LearningWord,
  sourceWords: LearningWord[]
) {
  const seenMeanings = new Set([currentWord.meaning]);
  const wrongChoices: string[] = [];

  const addWrongChoice = (word: LearningWord) => {
    if (
      word.word === currentWord.word ||
      seenMeanings.has(word.meaning) ||
      wrongChoices.length >= 3
    ) {
      return;
    }

    seenMeanings.add(word.meaning);
    wrongChoices.push(word.meaning);
  };

  const candidateGroups = [
    sourceWords.filter(
      (word) =>
        word.level === currentWord.level && word.type === currentWord.type
    ),
    sourceWords.filter(
      (word) =>
        word.level === currentWord.level && word.type !== currentWord.type
    ),
    sourceWords.filter((word) => word.level !== currentWord.level),
    learningWords,
  ];

  for (const group of candidateGroups) {
    for (const word of group) {
      addWrongChoice(word);
    }

    if (wrongChoices.length >= 3) break;
  }

  return shuffleWithSeed(
    [currentWord.meaning, ...wrongChoices].slice(0, 4),
    getChoiceSeed(currentWord)
  );
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
  const [memorySelectedIndex, setMemorySelectedIndex] = useState<number | null>(
    null
  );
  const [memoryDoneCount, setMemoryDoneCount] = useState(0);
  const [memoryHistory, setMemoryHistory] = useState<LearningWord[]>([]);
  const [sessionWords, setSessionWords] = useState<LearningWord[]>(() => [...learningWords]);
  const [clearedNos, setClearedNos] = useState<Set<string>>(new Set());
  const [wrongNos, setWrongNos] = useState<Set<string>>(new Set());
  const [studyExpNotice, setStudyExpNotice] =
    useState<StudyExpNotice | null>(null);
  const [studyGoldNotice, setStudyGoldNotice] = useState<number | null>(null);
  const [rangeIndex, setRangeIndex] = useState<number | null>(null);
  const furiganaEnabled = useSyncExternalStore(
    subscribeToFuriganaEnabledChange,
    getStoredFuriganaEnabled,
    () => false
  );

  useEffect(() => {
    if (!studyExpNotice) return;
    const t = setTimeout(() => setStudyExpNotice(null), 2000);
    return () => clearTimeout(t);
  }, [studyExpNotice]);

  useEffect(() => {
    if (studyGoldNotice === null) return;
    const t = setTimeout(() => setStudyGoldNotice(null), 2000);
    return () => clearTimeout(t);
  }, [studyGoldNotice]);

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
  const memoryAnswerChoices = useMemo(() => {
    if (!currentMemoryWord) return [];
    return createMemoryAnswerChoices(
      currentMemoryWord,
      filteredWords.length > 1 ? filteredWords : learningWords
    );
  }, [currentMemoryWord, filteredWords]);
  const selectedMemoryAnswer =
    memorySelectedIndex === null
      ? undefined
      : memoryAnswerChoices[memorySelectedIndex];
  const memoryIsCorrect =
    currentMemoryWord !== undefined &&
    selectedMemoryAnswer === currentMemoryWord.meaning;
  useEffect(() => {
    if (studyMode !== "memory") return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [studyMode]);

  const resetDisplayCount = () => {
    setDisplayCount(DISPLAY_STEP);
  };

  const resetMemorySessionForWords = (words: LearningWord[]) => {
    setSessionWords(words);
    setClearedNos(new Set());
    setWrongNos(new Set());
    setMemoryQueue(words);
    setMemoryDoneCount(0);
    setMemoryHistory([]);
    setMemoryAnswered(false);
    setMemorySelectedIndex(null);
    setStudyExpNotice(null);
    setStudyGoldNotice(null);
  };

  const resetMemorySession = () => {
    resetMemorySessionForWords(filteredWords);
  };

  const handleMemoryJump = (index: number) => {
    if (index <= 0) return;
    setMemoryQueue((currentQueue) => {
      const nextQueue = [...currentQueue];
      const [selectedWord] = nextQueue.splice(index, 1);
      return selectedWord ? [selectedWord, ...nextQueue] : currentQueue;
    });
    setMemoryAnswered(false);
    setMemorySelectedIndex(null);
    setStudyExpNotice(null);
    setStudyGoldNotice(null);
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
    setMemorySelectedIndex(null);
    setStudyExpNotice(null);
    setStudyGoldNotice(null);
    if (mode === "list") setRangeIndex(null);
  };

  const toggleFurigana = () => {
    setStoredFuriganaEnabled(!furiganaEnabled);
  };

  const handleMemoryAnswer = (choiceIndex: number) => {
    const studiedWord = memoryQueue[0];
    if (!studiedWord || memoryAnswered) return;

    const selectedAnswer = memoryAnswerChoices[choiceIndex];
    const isCorrect = selectedAnswer === studiedWord.meaning;
    setMemorySelectedIndex(choiceIndex);
    setMemoryAnswered(true);

    if (isCorrect) {
      setClearedNos((prev) => new Set([...prev, studiedWord.no]));
      setWrongNos((prev) => { const next = new Set(prev); next.delete(studiedWord.no); return next; });
      addGold(3);
      setStudyGoldNotice(3);
      const gainedExp = getMemoryStudyXp();
      const heroResult = addHeroExp(loadHeroStatus(), gainedExp);
      saveHeroStatus(heroResult.after);
      setStudyExpNotice({
        gainedExp: heroResult.gainedExp,
        leveledUp: heroResult.leveledUp,
        before: heroResult.before,
        after: heroResult.after,
      });
    } else {
      setWrongNos((prev) => new Set([...prev, studiedWord.no]));
      setStudyExpNotice(null);
      setStudyGoldNotice(null);
    }
  };

  const handleMemoryNext = () => {
    if (!memoryAnswered) return;
    const currentWord = memoryQueue[0];
    if (!currentWord) return;
    setMemoryHistory((prev) => [...prev, currentWord]);
    setMemoryQueue((currentQueue) => {
      const [head, ...nextWords] = currentQueue;
      if (!head) return currentQueue;
      return memoryIsCorrect ? nextWords : [...nextWords, head];
    });
    setMemoryDoneCount((current) => current + 1);
    setMemoryAnswered(false);
    setMemorySelectedIndex(null);
    setStudyExpNotice(null);
    setStudyGoldNotice(null);
  };

  const handleMemoryPrev = () => {
    if (memoryHistory.length === 0) return;
    const prevWord = memoryHistory[memoryHistory.length - 1];
    setMemoryHistory((prev) => prev.slice(0, -1));
    setMemoryQueue((prev) => [prevWord, ...prev]);
    setMemoryDoneCount((current) => Math.max(0, current - 1));
    setMemoryAnswered(false);
    setMemorySelectedIndex(null);
    setStudyExpNotice(null);
    setStudyGoldNotice(null);
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
          <button
            type="button"
            className={`wordbook-furigana-toggle${
              furiganaEnabled ? " is-on" : ""
            }`}
            onClick={toggleFurigana}
            aria-pressed={furiganaEnabled}
          >
            ふりがな {furiganaEnabled ? "ON" : "OFF"}
          </button>
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
              <div className={rangeIndex === null ? "memory-workspace no-aside" : "memory-workspace"}>
                {rangeIndex !== null && (
                  <aside className="memory-index" aria-label="残りの暗記カード">
                    {sessionWords.map((word, index) => {
                      const isCleared = clearedNos.has(word.no);
                      const isWrong = !isCleared && wrongNos.has(word.no);
                      const isCurrent = word.no === currentMemoryWord?.no;
                      const queueIndex = memoryQueue.findIndex((q) => q.no === word.no);
                      const className = [
                        isCleared ? "cleared" : "",
                        isWrong && !isCurrent ? "wrong" : "",
                        isCurrent ? "current" : "",
                        !isCleared && !isCurrent && queueIndex < 0 ? "done" : "",
                      ].filter(Boolean).join(" ") || undefined;
                      return (
                        <button
                          key={word.no}
                          type="button"
                          className={className}
                          onClick={() => {
                            if (!isCleared && queueIndex >= 0) handleMemoryJump(queueIndex);
                          }}
                          title={word.word}
                          disabled={isCleared}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </button>
                      );
                    })}
                  </aside>
                )}

                <article
                  className={
                    memoryAnswered
                      ? "memory-card is-answered"
                      : "memory-card"
                  }
                >
                  <div className="memory-card-glow" />

                  <div className="memory-progress-row">
                    <div className="memory-progress-left">
                      {rangeIndex !== null ? (
                        <>
                          <span>
                            クリア {clearedNos.size} / {sessionWords.length} 語
                          </span>
                          <span className="memory-progress-remain">
                            残り {memoryQueue.length} 語
                          </span>
                        </>
                      ) : (
                        <span>
                          暗記進捗 {memoryCurrentNumber} / {memorySessionTotal}
                        </span>
                      )}
                    </div>
                    {memoryAnswered && memoryIsCorrect && (
                      <div className="memory-meta-notices">
                        <div className="memory-exp-notice" role="status">
                          <strong>EXP +{studyExpNotice?.gainedExp ?? 3}</strong>
                          <span>
                            {studyExpNotice?.leveledUp
                              ? `Lv.${studyExpNotice.before.level} → Lv.${studyExpNotice.after.level}`
                              : "主人公EXP"}
                          </span>
                        </div>
                        <div className="memory-gold-notice" role="status">
                          <strong>🪙 +{studyGoldNotice ?? 3}</strong>
                          <span>ゴールド獲得</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div
                    className="memory-progress-track"
                    aria-hidden="true"
                  >
                    <div
                      style={{
                        width: rangeIndex !== null
                          ? `${sessionWords.length > 0 ? Math.round((clearedNos.size / sessionWords.length) * 100) : 0}%`
                          : `${memoryProgressPercent}%`
                      }}
                    />
                  </div>

                  <div className="memory-badges">
                    <span>{currentMemoryWord.level}</span>
                    <span>{currentMemoryWord.type}</span>
                  </div>

                  <p className="memory-kicker">MEMORY MODE</p>
                  <h2 className="memory-word">{currentMemoryWord.word}</h2>

                  <div className="memory-tools-row">
                    <SpeechButton
                      text={currentMemoryWord.word}
                      label="単語を聞く"
                      activeLabel="停止"
                      title={`${currentMemoryWord.word} を読み上げる`}
                      className="memory-speech-button"
                    />
                  </div>

                  <div className="memory-choice-grid">
                    {memoryAnswerChoices.map((choice, index) => {
                      const isSelected = memorySelectedIndex === index;
                      const isAnswer = choice === currentMemoryWord.meaning;
                      const reading = furiganaEnabled
                        ? getMemoryChoiceReading(currentMemoryWord, choice)
                        : undefined;
                      const className = [
                        "memory-choice",
                        memoryAnswered && isAnswer ? "correct" : "",
                        memoryAnswered && isSelected && !isAnswer
                          ? "wrong"
                          : "",
                        memoryAnswered && !isSelected && !isAnswer
                          ? "muted"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ");

                      return (
                        <button
                          key={`${currentMemoryWord.word}-${choice}`}
                          type="button"
                          onClick={() => handleMemoryAnswer(index)}
                          className={className}
                          disabled={memoryAnswered}
                        >
                          <span>{getAnswerLabel(index)}</span>
                          <strong>
                            {choice}
                            {reading && (
                              <span className="memory-choice-reading">
                                {reading}
                              </span>
                            )}
                          </strong>
                        </button>
                      );
                    })}
                  </div>


                  {memoryAnswered && (
                    <div
                      className={
                        memoryIsCorrect
                          ? "memory-result correct"
                          : "memory-result wrong"
                      }
                    >
                      <strong>
                        {memoryIsCorrect
                          ? "正解です"
                          : "もう一度確認しましょう"}
                      </strong>
                      <p>
                        {`${currentMemoryWord.word} は「${currentMemoryWord.meaning}」という意味です。${
                          memoryIsCorrect
                            ? ""
                            : " 間違えた単語は後でもう一度出ます。"
                        }`}
                      </p>
                    </div>
                  )}

                  <div className="memory-actions">
                    <button
                      type="button"
                      onClick={handleMemoryPrev}
                      disabled={memoryHistory.length === 0}
                    >
                      前へ
                    </button>
                    <button
                      type="button"
                      className="primary"
                      onClick={handleMemoryNext}
                      disabled={!memoryAnswered}
                    >
                      次へ
                    </button>
                    <button type="button" onClick={resetMemorySession}>
                      リセット
                    </button>
                  </div>
                </article>
              </div>
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
                        {furiganaEnabled && reading && (
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
        .wordbook-furigana-toggle {
          margin-left: auto;
          min-height: 36px;
          border: 1px solid rgba(45, 212, 191, 0.3);
          border-radius: 999px;
          background: rgba(20, 184, 166, 0.08);
          color: #99f6e4;
          padding: 0 14px;
          font: inherit;
          font-size: 13px;
          font-weight: 1000;
          cursor: pointer;
          transition:
            border-color 0.16s ease,
            background 0.16s ease,
            color 0.16s ease;
        }

        .wordbook-furigana-toggle.is-on {
          border-color: rgba(250, 204, 21, 0.52);
          background: rgba(250, 204, 21, 0.12);
          color: #fef3c7;
        }

        .wordbook-stage {
          display: flex;
          justify-content: center;
        }

        .wordbook-mode-actions {
          max-width: 600px;
        }

        .wordbook-mode-action {
          font-family: inherit;
          border-color: rgba(255, 255, 255, 0.12) !important;
          background: rgba(255, 255, 255, 0.06) !important;
          color: #f8fafc !important;
          box-shadow: none !important;
        }

        .wordbook-mode-action span {
          line-height: 1;
        }

        .wordbook-mode-action.active {
          border-color: rgba(45, 212, 191, 0.48) !important;
          background:
            linear-gradient(135deg, rgba(20, 184, 166, 0.2), rgba(15, 23, 42, 0.76)) !important;
          color: #ccfbf1 !important;
          outline: 1px solid rgba(45, 212, 191, 0.28);
          outline-offset: 3px;
        }

        .wordbook-mode-action:hover {
          border-color: rgba(45, 212, 191, 0.36) !important;
          background: rgba(45, 212, 191, 0.08) !important;
        }

        .wordbook-mode-action.active:hover {
          background:
            linear-gradient(135deg, rgba(20, 184, 166, 0.24), rgba(15, 23, 42, 0.8)) !important;
        }

        .wordbook-memory-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-top: 0;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 20px;
          padding: 10px 12px;
          background:
            radial-gradient(circle at 92% 18%, rgba(20, 184, 166, 0.18), transparent 32%),
            linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(8, 13, 24, 0.96));
          box-shadow: 0 18px 48px rgba(0, 0, 0, 0.22);
        }

        .wordbook-memory-summary {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .wordbook-memory-label {
          color: #99f6e4;
          font-size: 11px;
          font-weight: 1000;
        }

        .wordbook-memory-summary strong {
          color: #fef3c7;
          font-size: 16px;
          line-height: 1.2;
          font-weight: 1000;
        }

        .wordbook-memory-controls {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
          flex-wrap: wrap;
        }

        .memory-level-tabs {
          max-width: min(100%, 620px);
          display: flex;
          align-items: center;
          gap: 6px;
          overflow-x: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(45, 212, 191, 0.42) transparent;
          padding: 2px;
        }

        .memory-level-tab {
          min-height: 34px;
          flex: 0 0 auto;
          border: 1px solid rgba(34, 211, 238, 0.24);
          border-radius: 999px;
          background: rgba(15, 23, 42, 0.7);
          color: #cbd5e1;
          padding: 0 12px;
          font: inherit;
          font-size: 12px;
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
          border-color: rgba(45, 212, 191, 0.58);
          background: rgba(45, 212, 191, 0.16);
          color: #ccfbf1;
          box-shadow: none;
        }

        .memory-range-tabs {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          padding: 2px 0;
        }

        .memory-range-tab {
          min-height: 28px;
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
          border-color: rgba(250, 204, 21, 0.42);
          background: rgba(250, 204, 21, 0.12);
          color: #fef3c7;
          box-shadow: none;
        }

        .wordbook-memory-back-button {
          min-height: 34px;
          flex: 0 0 auto;
          border: 1px solid rgba(34, 211, 238, 0.34);
          border-radius: 12px;
          background: rgba(20, 184, 166, 0.08);
          color: #99f6e4;
          padding: 0 12px;
          font: inherit;
          font-size: 12px;
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
          margin-top: 10px;
        }

        .memory-workspace {
          display: grid;
          grid-template-columns: 96px minmax(0, 1fr);
          gap: 14px;
          align-items: start;
        }

        .memory-workspace.no-aside {
          grid-template-columns: minmax(0, 1fr);
        }

        .memory-index {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 6px;
          max-height: calc(100svh - 190px);
          overflow: auto;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 8px;
          background: rgba(2, 6, 23, 0.48);
        }

        .memory-index button {
          aspect-ratio: 1;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 9px;
          background: rgba(255, 255, 255, 0.055);
          color: #cbd5e1;
          font: inherit;
          font-size: 11px;
          font-weight: 1000;
          cursor: pointer;
          transition:
            border-color 0.16s ease,
            background 0.16s ease,
            color 0.16s ease;
        }

        .memory-index button:hover:not(:disabled),
        .memory-index button.current {
          border-color: rgba(45, 212, 191, 0.7);
          color: #ccfbf1;
          background: rgba(20, 184, 166, 0.18);
        }

        .memory-index button.cleared {
          border-color: rgba(52, 211, 153, 0.5);
          background: rgba(52, 211, 153, 0.14);
          color: #6ee7b7;
          cursor: default;
          opacity: 0.8;
        }

        .memory-index button.wrong {
          border-color: rgba(248, 113, 113, 0.55);
          background: rgba(248, 113, 113, 0.12);
          color: #fca5a5;
        }

        .memory-index button.current {
          border-color: rgba(45, 212, 191, 0.9);
          background: rgba(20, 184, 166, 0.24);
          color: #ccfbf1;
          box-shadow: 0 0 0 2px rgba(45, 212, 191, 0.22);
        }

        .memory-card {
          position: relative;
          isolation: isolate;
          width: 100%;
          min-height: auto;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 20px;
          padding: 16px;
          background:
            linear-gradient(145deg, rgba(15, 23, 42, 0.92), rgba(8, 13, 24, 0.98));
          box-shadow:
            0 18px 48px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
          transition: border-color 0.22s ease, box-shadow 0.22s ease;
        }

        .memory-card::before {
          content: none;
        }

        .memory-card-glow {
          position: absolute;
          top: -60px;
          right: -60px;
          width: 200px;
          height: 200px;
          border-radius: 999px;
          background: radial-gradient(circle, rgba(45, 212, 191, 0.12), transparent 64%);
          pointer-events: none;
          animation: memoryGlowPulse 4s ease-in-out infinite;
        }

        @keyframes memoryGlowPulse {
          0%, 100% { opacity: 0.6; transform: scale(0.96); }
          50% { opacity: 1; transform: scale(1.08); }
        }

        .memory-progress-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .memory-progress-left {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .memory-progress-left span,
        .memory-progress-row span {
          color: #94a3b8;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0;
        }

        .memory-meta-notices {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }

        .memory-progress-remain {
          color: #64748b !important;
        }

        .memory-progress-track {
          height: 6px;
          margin-top: 8px;
          overflow: hidden;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.08);
        }

        .memory-progress-track div {
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #2dd4bf, #fde047);
          transition: width 0.3s ease;
        }

        .memory-exp-notice {
          width: fit-content;
          max-width: 100%;
          min-height: 26px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          border: 1px solid rgba(250, 204, 21, 0.42);
          border-radius: 999px;
          background:
            radial-gradient(
              circle at 50% 0%,
              rgba(250, 204, 21, 0.22),
              transparent 68%
            ),
            rgba(113, 63, 18, 0.24);
          padding: 0 10px;
          color: #fef3c7;
          box-shadow: 0 16px 42px rgba(250, 204, 21, 0.12);
          animation: memoryExpPop 0.28s ease both;
        }

        .memory-exp-notice strong {
          font-size: 12px;
          line-height: 1;
          font-weight: 1000;
        }

        .memory-exp-notice span {
          color: #cbd5e1;
          font-size: 11px;
          line-height: 1.2;
          font-weight: 900;
        }

        .memory-gold-notice {
          width: fit-content;
          max-width: 100%;
          min-height: 26px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          border: 1px solid rgba(52, 211, 153, 0.42);
          border-radius: 999px;
          background:
            radial-gradient(
              circle at 50% 0%,
              rgba(52, 211, 153, 0.22),
              transparent 68%
            ),
            rgba(6, 78, 59, 0.28);
          padding: 0 10px;
          color: #a7f3d0;
          box-shadow: 0 16px 42px rgba(52, 211, 153, 0.1);
          animation: memoryExpPop 0.28s ease both;
        }

        .memory-gold-notice strong {
          font-size: 12px;
          line-height: 1;
          font-weight: 1000;
        }

        .memory-gold-notice span {
          color: #cbd5e1;
          font-size: 11px;
          line-height: 1.2;
          font-weight: 900;
        }

        .memory-badges {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 6px;
          margin-top: 8px;
        }

        .memory-badges span {
          min-height: 22px;
          display: inline-flex;
          align-items: center;
          border-radius: 999px;
          padding: 0 8px;
          border: 1px solid rgba(34, 211, 238, 0.36);
          background: rgba(34, 211, 238, 0.1);
          color: #a5f3fc;
          font-size: 10px;
          font-weight: 1000;
          line-height: 1.25;
        }

        .memory-kicker {
          display: block;
          margin: 8px 0 0;
          color: #5eead4;
          font-size: 10px;
          font-weight: 1000;
          text-align: center;
          letter-spacing: 0.14em;
          opacity: 0.7;
        }

        .memory-word {
          min-height: 92px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 8px 0 0;
          border: 1px solid rgba(45, 212, 191, 0.2);
          border-radius: 16px;
          padding: 14px;
          background: rgba(2, 6, 23, 0.45);
          text-align: center;
          color: #ffffff;
          text-shadow: none;
          font-size: clamp(24px, 4vw, 42px);
          line-height: 1.12;
          font-weight: 1000;
          letter-spacing: 0;
          overflow-wrap: anywhere;
        }

        .memory-tools-row {
          display: flex;
          justify-content: center;
          margin-top: 8px;
        }

        :global(.memory-speech-button) {
          width: min(100%, 210px);
          min-height: 38px;
          border-radius: 12px;
          padding: 0 12px;
          font-size: 13px;
          box-shadow: none;
        }

        .memory-choice-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
          margin-top: 10px;
        }

        .memory-choice {
          min-height: 60px;
          display: grid;
          grid-template-columns: 30px minmax(0, 1fr);
          align-items: center;
          gap: 10px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.065);
          color: #f8fafc;
          padding: 10px;
          text-align: left;
          font: inherit;
          cursor: pointer;
          transition:
            transform 0.16s ease,
            border-color 0.16s ease,
            background 0.16s ease,
            opacity 0.16s ease;
        }

        .memory-choice:hover:not(:disabled) {
          transform: translateY(-2px);
          border-color: rgba(45, 212, 191, 0.54);
          background: rgba(20, 184, 166, 0.16);
        }

        .memory-choice:disabled {
          cursor: default;
        }

        .memory-choice > span {
          width: 30px;
          height: 30px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.1);
          color: #a5f3fc;
          font-size: 12px;
          font-weight: 1000;
        }

        .memory-choice strong {
          min-width: 0;
          font-size: 16px;
          line-height: 1.28;
          font-weight: 900;
          overflow-wrap: anywhere;
        }

        .memory-choice-reading {
          display: block;
          margin-top: 4px;
          color: #6ee7b7;
          font-size: 12px;
          line-height: 1.25;
          font-weight: 900;
        }

        .memory-choice.correct {
          border-color: rgba(52, 211, 153, 0.72);
          background: rgba(52, 211, 153, 0.18);
        }

        .memory-choice.wrong {
          border-color: rgba(248, 113, 113, 0.76);
          background: rgba(248, 113, 113, 0.16);
        }

        .memory-choice.muted {
          opacity: 0.58;
        }

        .memory-result {
          animation: memoryAnswerIn 0.24s ease both;
          margin-top: 10px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 14px;
          padding: 12px 14px;
          margin-bottom: 0;
          background: rgba(255, 255, 255, 0.06);
        }

        .memory-result.correct {
          border-color: rgba(52, 211, 153, 0.52);
          background: rgba(52, 211, 153, 0.09);
          box-shadow: 0 0 20px rgba(52, 211, 153, 0.08);
        }

        .memory-result.wrong {
          border-color: rgba(248, 113, 113, 0.52);
          background: rgba(248, 113, 113, 0.09);
          box-shadow: 0 0 20px rgba(248, 113, 113, 0.08);
        }

        .memory-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: flex-end;
          margin-top: 12px;
          padding-top: 10px;
          border-top: 1px solid rgba(255, 255, 255, 0.07);
        }

        .memory-actions button {
          min-height: 34px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 999px;
          padding: 0 13px;
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

        .memory-actions button:not(:disabled):hover {
          transform: translateY(-1px);
          border-color: rgba(45, 212, 191, 0.38);
          background: rgba(45, 212, 191, 0.08);
          color: #e2e8f0;
        }

        .memory-actions button.primary {
          border-color: rgba(45, 212, 191, 0.58);
          background: rgba(45, 212, 191, 0.16);
          color: #ccfbf1;
          box-shadow: 0 0 14px rgba(45, 212, 191, 0.1);
        }

        .memory-actions button.primary:not(:disabled):hover {
          background: rgba(45, 212, 191, 0.22);
        }

        .memory-actions button:disabled {
          cursor: not-allowed;
          opacity: 0.4;
        }

        .memory-result strong {
          color: #fef3c7;
          font-size: 14px;
          line-height: 1.35;
          font-weight: 1000;
        }

        .memory-result p {
          margin: 5px 0 0;
          color: #cbd5e1;
          font-size: 15px;
          line-height: 1.6;
          font-weight: 800;
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
          .eq-topbar {
            display: grid;
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
            margin-bottom: 10px !important;
            padding: 6px 8px !important;
          }

          .eq-back-link {
            width: 100%;
            min-width: 0;
            justify-content: center;
            padding-inline: 10px !important;
          }

          .wordbook-furigana-toggle {
            width: 100%;
            min-width: 0;
            margin-left: 0;
            min-height: 34px;
            padding: 0 11px;
            font-size: 12px;
          }

          .eq-hero {
            grid-template-columns: 1fr;
            gap: 12px;
            padding: 16px !important;
          }

          .eq-page-title {
            margin-top: 12px;
            font-size: 30px !important;
            line-height: 1.12 !important;
          }

          .eq-lead {
            margin-top: 10px;
            font-size: 13px;
            line-height: 1.55;
            overflow-wrap: anywhere;
          }

          .wordbook-stage {
            display: none;
          }

          .wordbook-mode-actions {
            grid-template-columns: 1fr;
            gap: 8px;
            margin-top: 14px;
          }

          .wordbook-mode-action {
            min-height: 48px;
            font-size: 14px;
          }

          .eq-status-strip {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
            gap: 8px;
          }

          .eq-status-card {
            min-height: 0;
            padding: 10px 8px !important;
            border-radius: 14px !important;
          }

          .eq-status-card span {
            font-size: 10px;
          }

          .eq-status-card strong {
            margin-top: 4px;
            font-size: 20px;
          }

          .words-filter-panel {
            gap: 12px;
            margin-top: 12px;
            padding: 14px;
          }

          .wordbook-search {
            min-height: 44px;
            border-radius: 14px;
            font-size: 13px;
          }

          .words-filter-head {
            gap: 8px;
          }

          .words-filter-head strong {
            font-size: 11px;
          }

          .wordbook-memory-toolbar {
            align-items: stretch;
            flex-direction: column;
            gap: 8px;
            margin-top: 0;
            padding: 8px;
          }

          .wordbook-memory-controls {
            justify-content: stretch;
            gap: 8px;
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
            gap: 7px;
          }

          .words-kind-tabs {
            grid-template-columns: 1fr;
            gap: 7px;
          }

          .wordbook-level-tab,
          .wordbook-kind-chip,
          .memory-level-tab,
          .wordbook-memory-back-button {
            min-height: 40px;
            border-radius: 13px;
            font-size: 12px;
          }

          .memory-stage {
            margin-top: 8px;
          }

          .memory-workspace {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .memory-index {
            grid-template-columns: repeat(10, minmax(38px, 1fr));
            max-height: none;
            border-radius: 16px;
            padding: 8px;
          }

          .memory-card {
            min-height: 0;
            border-radius: 18px;
            padding: 14px;
          }

          .memory-card::before {
            content: none;
          }

          .memory-progress-row {
            align-items: flex-start;
            flex-direction: column;
          }

          .memory-progress-row button {
            width: 100%;
          }

          .memory-word {
            margin-top: 8px;
            min-height: 92px;
            padding: 16px 12px;
            font-size: clamp(26px, 10vw, 40px);
            line-height: 1.2;
          }

          .memory-tools-row {
            margin-top: 10px;
          }

          :global(.memory-speech-button) {
            width: 100%;
          }

          .memory-choice-grid {
            grid-template-columns: 1fr;
            gap: 8px;
            margin-top: 10px;
          }

          .memory-choice {
            min-height: 58px;
            border-radius: 14px;
          }

          .memory-result {
            border-radius: 14px;
            padding: 12px;
          }

          .memory-actions button {
            min-height: 40px;
            border-radius: 999px;
          }

          .words-list {
            gap: 10px;
            margin-top: 12px;
          }

          .words-card {
            border-radius: 18px !important;
            padding: 12px !important;
          }

          .words-card-top {
            flex-direction: column;
            gap: 8px;
          }

          .words-badges {
            justify-content: flex-start;
            gap: 6px;
          }

          .words-badges span {
            min-height: 24px;
            padding: 0 8px;
            font-size: 10px;
          }

          .words-word-area h2 {
            font-size: 22px;
          }

          .words-word-area .words-meaning {
            margin-top: 4px;
            font-size: 15px;
          }

          .words-word-area .words-reading {
            margin-top: 2px;
            font-size: 12px;
            line-height: 1.35;
          }

          .words-example {
            margin-top: 10px;
            border-radius: 14px;
            padding: 10px;
          }

          .words-example-head {
            align-items: flex-start;
            flex-direction: column;
            gap: 6px;
            margin-bottom: 6px;
          }

          .words-example-en {
            font-size: 14px;
            line-height: 1.45;
          }

          .words-example-ja {
            margin-top: 4px;
            font-size: 13px;
            line-height: 1.45;
          }

          .words-more-area {
            margin: 14px 0 0;
          }

          .words-more-button {
            min-width: 0;
            min-height: 48px;
          }
        }

        @media (max-width: 420px) {
          .memory-badges {
            justify-content: flex-start;
          }

          .memory-kicker {
            text-align: left;
          }

        }
      `}</style>
    </main>
  );
}
