"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
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

const ALL_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const WORD_MEMORY_STORAGE_KEY = "wordMemoryProgress";
const WORD_MEMORY_CHANGE_EVENT = "wordMemoryProgressChange";

type StudyMode = "list" | "memory";
type MemorySource = "all" | "review";
type StudyExpNotice = Pick<
  HeroExpResult,
  "gainedExp" | "leveledUp" | "before" | "after"
>;
type WordMemoryRecord = {
  no: string;
  correctCount: number;
  wrongCount: number;
  streak: number;
  needsReview: boolean;
  lastAnsweredAt: string;
  lastCorrectAt?: string;
};
type WordMemoryProgress = Record<string, WordMemoryRecord>;

const DEFAULT_MEMORY_PERFECT_XP = 3;
const EMPTY_WORD_MEMORY_PROGRESS: WordMemoryProgress = {};
let cachedWordMemoryProgressText: string | null = null;
let cachedWordMemoryProgress: WordMemoryProgress = EMPTY_WORD_MEMORY_PROGRESS;


function getFilteredWords(searchText: string, levelFilter: string) {
  const keyword = searchText.trim().toLowerCase();
  return learningWords.filter((word) => {
    const matchesSearch =
      keyword === "" ||
      word.word.toLowerCase().includes(keyword) ||
      word.meaning.includes(searchText);
    const matchesLevel = levelFilter === "all" || word.level === levelFilter;
    return matchesSearch && matchesLevel;
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

function getWordKey(word: LearningWord) {
  return word.no || word.word;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeWordMemoryProgress(value: unknown): WordMemoryProgress {
  if (!isRecord(value)) return {};

  const progress: WordMemoryProgress = {};

  for (const [key, rawRecord] of Object.entries(value)) {
    if (!isRecord(rawRecord)) continue;

    const no = typeof rawRecord.no === "string" ? rawRecord.no : key;
    const correctCount = Math.max(0, Math.floor(Number(rawRecord.correctCount) || 0));
    const wrongCount = Math.max(0, Math.floor(Number(rawRecord.wrongCount) || 0));
    const streak = Math.max(0, Math.floor(Number(rawRecord.streak) || 0));
    const lastAnsweredAt =
      typeof rawRecord.lastAnsweredAt === "string" ? rawRecord.lastAnsweredAt : "";
    const lastCorrectAt =
      typeof rawRecord.lastCorrectAt === "string" ? rawRecord.lastCorrectAt : undefined;
    const needsReview = rawRecord.needsReview === true || (wrongCount > 0 && streak < 2);

    if (correctCount === 0 && wrongCount === 0 && !lastAnsweredAt) continue;

    progress[no] = {
      no,
      correctCount,
      wrongCount,
      streak,
      needsReview,
      lastAnsweredAt,
      ...(lastCorrectAt ? { lastCorrectAt } : {}),
    };
  }

  return progress;
}

function loadWordMemoryProgress(): WordMemoryProgress {
  if (typeof window === "undefined") return {};

  try {
    const savedText = localStorage.getItem(WORD_MEMORY_STORAGE_KEY) ?? "{}";

    if (savedText === cachedWordMemoryProgressText) {
      return cachedWordMemoryProgress;
    }

    cachedWordMemoryProgressText = savedText;
    cachedWordMemoryProgress = normalizeWordMemoryProgress(JSON.parse(savedText));

    return cachedWordMemoryProgress;
  } catch {
    localStorage.removeItem(WORD_MEMORY_STORAGE_KEY);
    cachedWordMemoryProgressText = "{}";
    cachedWordMemoryProgress = EMPTY_WORD_MEMORY_PROGRESS;
    return cachedWordMemoryProgress;
  }
}

function saveWordMemoryProgress(progress: WordMemoryProgress) {
  if (typeof window === "undefined") return;

  const text = JSON.stringify(progress);
  cachedWordMemoryProgressText = text;
  cachedWordMemoryProgress = progress;
  localStorage.setItem(WORD_MEMORY_STORAGE_KEY, text);
  window.dispatchEvent(new CustomEvent(WORD_MEMORY_CHANGE_EVENT));
}

function subscribeToWordMemoryProgressChange(onChange: () => void) {
  if (typeof window === "undefined") return () => {};

  const handleChange = () => onChange();
  window.addEventListener(WORD_MEMORY_CHANGE_EVENT, handleChange);
  window.addEventListener("storage", handleChange);

  return () => {
    window.removeEventListener(WORD_MEMORY_CHANGE_EVENT, handleChange);
    window.removeEventListener("storage", handleChange);
  };
}

function updateWordMemoryRecord(
  progress: WordMemoryProgress,
  word: LearningWord,
  isCorrect: boolean
) {
  const no = getWordKey(word);
  const current = progress[no];
  const now = new Date().toISOString();
  const nextStreak = isCorrect ? (current?.streak ?? 0) + 1 : 0;
  const nextRecord: WordMemoryRecord = {
    no,
    correctCount: (current?.correctCount ?? 0) + (isCorrect ? 1 : 0),
    wrongCount: (current?.wrongCount ?? 0) + (isCorrect ? 0 : 1),
    streak: nextStreak,
    needsReview: isCorrect ? nextStreak < 2 && (current?.wrongCount ?? 0) > 0 : true,
    lastAnsweredAt: now,
    ...(isCorrect ? { lastCorrectAt: now } : current?.lastCorrectAt ? { lastCorrectAt: current.lastCorrectAt } : {}),
  };

  return {
    ...progress,
    [no]: nextRecord,
  };
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
  const [studyMode, setStudyMode] = useState<StudyMode>("list");
  const [memorySource, setMemorySource] = useState<MemorySource>("all");
  const [activeLetter, setActiveLetter] = useState("A");
  const [levelFilter, setLevelFilter] = useState("all");
  const [rangeIndex, setRangeIndex] = useState<number | null>(null);
  const [sessionWords, setSessionWords] = useState<LearningWord[]>(() => [...learningWords]);
  const [clearedNos, setClearedNos] = useState<Set<string>>(new Set());
  const [wrongNos, setWrongNos] = useState<Set<string>>(new Set());
  const [memoryQueue, setMemoryQueue] = useState<LearningWord[]>(() => [
    ...learningWords,
  ]);
  const [memoryAnswered, setMemoryAnswered] = useState(false);
  const [memorySelectedIndex, setMemorySelectedIndex] = useState<number | null>(
    null
  );
  const [memoryDoneCount, setMemoryDoneCount] = useState(0);
  const [memoryHistory, setMemoryHistory] = useState<LearningWord[]>([]);
  const [memoryIsReviewingHistory, setMemoryIsReviewingHistory] =
    useState(false);
  const [studyExpNotice, setStudyExpNotice] =
    useState<StudyExpNotice | null>(null);
  const [studyGoldNotice, setStudyGoldNotice] = useState<number | null>(null);
  const [sessionWrongNos, setSessionWrongNos] = useState<Set<string>>(new Set());
  const [answerCorrectCount, setAnswerCorrectCount] = useState(0);
  const [answerTotalCount, setAnswerTotalCount] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionBlurTimeoutRef = useRef<number | null>(null);
  const furiganaEnabled = useSyncExternalStore(
    subscribeToFuriganaEnabledChange,
    getStoredFuriganaEnabled,
    () => false
  );
  const wordMemoryProgress = useSyncExternalStore(
    subscribeToWordMemoryProgressChange,
    loadWordMemoryProgress,
    () => EMPTY_WORD_MEMORY_PROGRESS
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

  const filteredWords = useMemo(() => getFilteredWords(searchText, "all"), [searchText]);

  const suggestions = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    if (!keyword) return [];
    return learningWords
      .filter((w) => w.word.toLowerCase().includes(keyword))
      .sort((a, b) => {
        const aStarts = a.word.toLowerCase().startsWith(keyword);
        const bStarts = b.word.toLowerCase().startsWith(keyword);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return a.word.localeCompare(b.word);
      })
      .slice(0, 8);
  }, [searchText]);

  const dictGroups = useMemo(() => {
    const sorted = [...filteredWords].sort((a, b) =>
      a.word.toLowerCase().localeCompare(b.word.toLowerCase())
    );
    const groups = new Map<string, LearningWord[]>();
    for (const word of sorted) {
      const first = word.word[0]?.toUpperCase() ?? "#";
      const key = /^[A-Z]$/.test(first) ? first : "#";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(word);
    }
    return groups;
  }, [filteredWords]);

  const hasSearchKeyword = searchText.trim().length > 0;
  const firstVisibleLetter = useMemo(() => {
    return Array.from(dictGroups.keys()).sort()[0] ?? "A";
  }, [dictGroups]);

  const currentDictLetter =
    !hasSearchKeyword && dictGroups.has(activeLetter)
      ? activeLetter
      : firstVisibleLetter;

  const levels = useMemo(() => {
    return Array.from(new Set(learningWords.map((word) => word.level)));
  }, []);

  const levelOnlyWords = useMemo(() => {
    if (levelFilter === "all") return [];
    return learningWords.filter((w) => w.level === levelFilter);
  }, [levelFilter]);

  const rangeCount = Math.ceil(levelOnlyWords.length / 100);

  const reviewWordCount = useMemo(() => {
    return learningWords.filter(
      (word) => wordMemoryProgress[getWordKey(word)]?.needsReview
    ).length;
  }, [wordMemoryProgress]);

  const getMemoryWordsFor = useCallback((
    level: string,
    range: number | null,
    source: MemorySource
  ) => {
    const base = getFilteredWords("", level);
    const rangeFiltered = applyRangeFilter(base, level, range, levelOnlyWords);

    if (source === "review") {
      return rangeFiltered.filter(
        (word) => wordMemoryProgress[getWordKey(word)]?.needsReview
      );
    }

    return rangeFiltered;
  }, [levelOnlyWords, wordMemoryProgress]);

  const memoryFilteredWords = useMemo(() => {
    return getMemoryWordsFor(levelFilter, rangeIndex, memorySource);
  }, [getMemoryWordsFor, levelFilter, rangeIndex, memorySource]);

  const currentMemoryWord = memoryQueue[0];
  const memorySessionTotal = memoryDoneCount + memoryQueue.length;
  const memoryRemainingLabel =
    sessionWords.length === memoryQueue.length
      ? `${sessionWords.length} 語`
      : `${sessionWords.length} 語中 残り ${memoryQueue.length} 語`;
  const memoryProgressPercent =
    memorySessionTotal > 0
      ? Math.min(100, Math.round((memoryDoneCount / memorySessionTotal) * 100))
      : 0;
  const memoryAccuracy =
    answerTotalCount > 0
      ? Math.round((answerCorrectCount / answerTotalCount) * 100)
      : null;
  const displayedDictEntries = useMemo(() => {
    const sortedEntries = Array.from(dictGroups.entries()).sort(([a], [b]) =>
      a.localeCompare(b)
    );

    if (hasSearchKeyword) return sortedEntries;

    const words = dictGroups.get(currentDictLetter);
    return words ? [[currentDictLetter, words] as [string, LearningWord[]]] : [];
  }, [currentDictLetter, dictGroups, hasSearchKeyword]);
  const memoryAnswerChoices = useMemo(() => {
    if (!currentMemoryWord) return [];
    return createMemoryAnswerChoices(
      currentMemoryWord,
      memoryFilteredWords.length > 1 ? memoryFilteredWords : learningWords
    );
  }, [currentMemoryWord, memoryFilteredWords]);
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

  const resetMemorySessionForWords = (words: LearningWord[]) => {
    setSessionWords(words);
    setClearedNos(new Set());
    setWrongNos(new Set());
    setSessionWrongNos(new Set());
    setAnswerCorrectCount(0);
    setAnswerTotalCount(0);
    setMemoryQueue(words);
    setMemoryDoneCount(0);
    setMemoryHistory([]);
    setMemoryIsReviewingHistory(false);
    setMemoryAnswered(false);
    setMemorySelectedIndex(null);
    setStudyExpNotice(null);
    setStudyGoldNotice(null);
  };

  const resetMemorySession = () => {
    resetMemorySessionForWords(sessionWords);
  };

  const handleSearchChange = (value: string) => {
    setSearchText(value);
  };

  const handleSuggestionSelect = (word: LearningWord) => {
    handleSearchChange(word.word);
    setShowSuggestions(false);
    if (suggestionBlurTimeoutRef.current !== null) {
      window.clearTimeout(suggestionBlurTimeoutRef.current);
      suggestionBlurTimeoutRef.current = null;
    }
    const first = word.word[0]?.toUpperCase() ?? "A";
    setActiveLetter(/^[A-Z]$/.test(first) ? first : "A");
  };

  const handleSearchBlur = () => {
    suggestionBlurTimeoutRef.current = window.setTimeout(() => {
      setShowSuggestions(false);
      suggestionBlurTimeoutRef.current = null;
    }, 150);
  };

  const handleLevelChange = (level: string) => {
    setLevelFilter(level);
    setRangeIndex(null);
    resetMemorySessionForWords(getMemoryWordsFor(level, null, memorySource));
  };

  const handleRangeChange = (idx: number | null) => {
    setRangeIndex(idx);
    resetMemorySessionForWords(getMemoryWordsFor(levelFilter, idx, memorySource));
  };

  const handleMemorySourceChange = (source: MemorySource) => {
    setMemorySource(source);
    resetMemorySessionForWords(getMemoryWordsFor(levelFilter, rangeIndex, source));
  };

  const handleModeChange = (mode: StudyMode) => {
    setStudyMode(mode);
    setMemoryAnswered(false);
    setMemorySelectedIndex(null);
    setMemoryIsReviewingHistory(false);
    setStudyExpNotice(null);
    setStudyGoldNotice(null);
    if (mode === "memory") {
      resetMemorySessionForWords(memoryFilteredWords);
    }
    if (mode === "list") setRangeIndex(null);
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
    setMemoryIsReviewingHistory(false);
    setAnswerTotalCount((count) => count + 1);

    saveWordMemoryProgress(
      updateWordMemoryRecord(wordMemoryProgress, studiedWord, isCorrect)
    );

    if (isCorrect) {
      setClearedNos((prev) => new Set([...prev, studiedWord.no]));
      setWrongNos((prev) => { const next = new Set(prev); next.delete(studiedWord.no); return next; });
      setAnswerCorrectCount((count) => count + 1);
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
      setSessionWrongNos((prev) => new Set([...prev, studiedWord.no]));
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
      if (memoryIsReviewingHistory) return nextWords;
      return memoryIsCorrect ? nextWords : [...nextWords, head];
    });
    setMemoryDoneCount((current) => current + 1);
    setMemoryAnswered(false);
    setMemorySelectedIndex(null);
    setMemoryIsReviewingHistory(false);
    setStudyExpNotice(null);
    setStudyGoldNotice(null);
  };

  const handleMemoryPrev = () => {
    if (memoryHistory.length === 0) return;
    const prevWord = memoryHistory[memoryHistory.length - 1];
    const prevChoices = createMemoryAnswerChoices(
      prevWord,
      memoryFilteredWords.length > 1 ? memoryFilteredWords : learningWords
    );
    setMemoryHistory((prev) => prev.slice(0, -1));
    setMemoryQueue((prev) => [prevWord, ...prev]);
    setMemoryDoneCount((current) => Math.max(0, current - 1));
    setMemoryAnswered(true);
    setMemorySelectedIndex(prevChoices.indexOf(prevWord.meaning));
    setMemoryIsReviewingHistory(true);
    setStudyExpNotice(null);
    setStudyGoldNotice(null);
  };

  const handleRetryWrong = () => {
    const wrongWords = sessionWords.filter((w) => sessionWrongNos.has(w.no));
    if (wrongWords.length > 0) resetMemorySessionForWords(wrongWords);
  };

  const memoryHandlersRef = useRef({ handleMemoryAnswer, handleMemoryNext, handleMemoryPrev, memoryAnswered, currentMemoryWord });

  useEffect(() => {
    memoryHandlersRef.current = {
      handleMemoryAnswer,
      handleMemoryNext,
      handleMemoryPrev,
      memoryAnswered,
      currentMemoryWord,
    };
  });

  useEffect(() => {
    if (studyMode !== "memory") return;
    const handleKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT") return;
      const { handleMemoryAnswer, handleMemoryNext, handleMemoryPrev, memoryAnswered, currentMemoryWord } = memoryHandlersRef.current;
      const keyMap: Record<string, number> = { a: 0, b: 1, c: 2, d: 3, "1": 0, "2": 1, "3": 2, "4": 3 };
      const choiceIndex = keyMap[e.key.toLowerCase()];
      if (choiceIndex !== undefined && !memoryAnswered && currentMemoryWord) {
        handleMemoryAnswer(choiceIndex);
      } else if ((e.key === "Enter" || e.key === " " || e.key === "ArrowRight") && memoryAnswered) {
        e.preventDefault();
        handleMemoryNext();
      } else if (e.key === "ArrowLeft") {
        handleMemoryPrev();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [studyMode]);

  return (
    <main className="eq-page wordbook-page">
      <div className="eq-bg-orb eq-bg-orb-one" />
      <div className="eq-bg-orb eq-bg-orb-two" />
      <div className="eq-bg-orb eq-bg-orb-three" />

      <section className="eq-shell">
        <nav className="eq-topbar">
          <Link href="/" className="eq-back-link">
            ホームへ戻る
          </Link>
          <Link href="/quiz" className="eq-back-link wordbook-quest-link">
            クエストへ
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
                <span>VOCAB TRAINING</span>
              </div>

              <h1 className="eq-page-title">単語トレーニング</h1>

              <p className="eq-lead">
                英単語・熟語を意味と例文で確認し、暗記練習から筆記問題まで進めます。
                まずは単語を見て、覚えたら問題で定着させましょう。
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
                  <span>📖</span>
                  単語を見る
                </button>

                <button
                  type="button"
                  onClick={() => handleModeChange("memory")}
                  aria-pressed="false"
                  className="eq-button eq-button-secondary wordbook-mode-action"
                >
                  <span>⭐</span>
                  暗記する
                </button>

                <Link
                  href="/written"
                  className="eq-button eq-button-secondary wordbook-mode-action"
                >
                  <span>✏️</span>
                  筆記で確認
                </Link>
              </div>

              <div className="wordbook-stats-row">
                <span className="wordbook-stat-item">
                  <em>収録語数</em>
                  <strong>{learningWords.length}</strong>
                </span>
                <span className="wordbook-stat-item">
                  <em>表示中</em>
                  <strong>{filteredWords.length}</strong>
                </span>
              </div>
            </div>

            <div className="wordbook-stage">
              <div className="eq-display-card wordbook-display-card">
                <div className="eq-display-shine" />
                <div className="eq-display-icon eq-display-image-frame">
                  <Image
                    src="/home-icons/written.png"
                    alt=""
                    width={1254}
                    height={1254}
                    className="eq-display-image"
                    sizes="156px"
                    aria-hidden="true"
                  />
                </div>
                <div className="wordbook-card-runes" aria-hidden="true">
                  <span>A</span>
                  <span>B</span>
                  <span>C</span>
                  <span>D</span>
                  <span>E</span>
                </div>
                <p>VOCAB TRAINING</p>
                <h2>{learningWords.length}</h2>
                <span>words ready</span>
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
                {" "}/ {memoryRemainingLabel}
              </strong>
            </div>

            <div className="wordbook-memory-controls">
              <div className="memory-source-tabs" aria-label="暗記する単語の種類を選ぶ">
                <button
                  type="button"
                  onClick={() => handleMemorySourceChange("all")}
                  className={memorySource === "all" ? "memory-source-tab active" : "memory-source-tab"}
                >
                  全単語
                </button>
                <button
                  type="button"
                  onClick={() => handleMemorySourceChange("review")}
                  className={memorySource === "review" ? "memory-source-tab active" : "memory-source-tab"}
                  disabled={reviewWordCount === 0}
                >
                  苦手復習
                  {reviewWordCount > 0 ? ` ${reviewWordCount}` : ""}
                </button>
              </div>

              <div className="memory-level-tabs" aria-label="暗記する級を選ぶ">
                <button
                  type="button"
                  onClick={() => handleLevelChange("all")}
                  className={levelFilter === "all" ? "memory-level-tab active" : "memory-level-tab"}
                >
                  すべて
                </button>

                {levels.map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => handleLevelChange(level)}
                    className={levelFilter === level ? "memory-level-tab active" : "memory-level-tab"}
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
                辞書モードへ
              </button>
            </div>
          </div>
        )}

        {studyMode === "list" && (
          <div className="words-search-outer">
            <div className="eq-panel words-filter-panel">
              <div className="words-search-wrap">
                <span className="words-search-icon">🔎</span>
                <input
                  type="text"
                  value={searchText}
                  onChange={(event) => { handleSearchChange(event.target.value); setShowSuggestions(true); }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={handleSearchBlur}
                  placeholder="英単語・意味・例文で検索"
                  className="wordbook-search"
                />
              </div>
            </div>

            {showSuggestions && suggestions.length > 0 && (
              <div className="search-suggestions-list">
                {suggestions.map((word) => (
                  <div
                    key={word.no}
                    onMouseDown={() => handleSuggestionSelect(word)}
                    className="search-suggestion-item"
                  >
                    <span className="suggestion-word">{word.word}</span>
                    <span className="suggestion-meaning">{word.meaning}</span>
                  </div>
                ))}
              </div>
            )}
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
                        <>
                          <span>
                            クリア {clearedNos.size} / {sessionWords.length} 語
                          </span>
                          <span className="memory-progress-remain">
                            残り {memoryQueue.length} 語
                          </span>
                        </>
                      )}
                      {memoryAccuracy !== null && (
                        <span className="memory-progress-remain">
                          正答率 {memoryAccuracy}% ・ 苦手 {sessionWrongNos.size}語
                        </span>
                      )}
                    </div>
                    {memoryAnswered && memoryIsCorrect && !memoryIsReviewingHistory && (
                      <div className="memory-meta-notices" role="status">
                        <div className="memory-exp-notice">
                          <strong>EXP +{studyExpNotice?.gainedExp ?? 3}</strong>
                          <span>
                            {studyExpNotice?.leveledUp
                              ? `Lv.${studyExpNotice.before.level} → Lv.${studyExpNotice.after.level}`
                              : "主人公EXP"}
                          </span>
                        </div>
                        <div className="memory-gold-notice">
                          <strong>🪙 +{studyGoldNotice ?? 3}</strong>
                          <span>ゴールド獲得</span>
                        </div>
                      </div>
                    )}
                    <p className="memory-keyboard-hint">
                      A〜D で選択 · Enter/Space で次へ · ← → で移動
                    </p>
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
                    <>
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

                      {memoryIsCorrect && (
                        <div className="memory-meta-notices" role="status">
                          <div className="memory-exp-notice">
                            <strong>EXP +{studyExpNotice?.gainedExp ?? 3}</strong>
                            <span>
                              {studyExpNotice?.leveledUp
                                ? `Lv.${studyExpNotice.before.level} → Lv.${studyExpNotice.after.level}`
                                : "主人公EXP"}
                            </span>
                          </div>
                          <div className="memory-gold-notice">
                            <strong>🪙 +{studyGoldNotice ?? 3}</strong>
                            <span>ゴールド獲得</span>
                          </div>
                        </div>
                      )}
                    </>
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
                <h2>
                  {memorySource === "review" && sessionWords.length === 0
                    ? "復習する苦手単語はありません"
                    : "今回の暗記が完了しました"}
                </h2>
                <span>
                  {memorySource === "review" && sessionWords.length === 0
                    ? "間違えた単語はここに集まり、2回連続で正解すると復習リストから外れます。"
                    : "もう一度挑戦すると、同じ条件の単語を最初から確認できます。"}
                </span>
                <div className="memory-complete-actions">
                  <button
                    type="button"
                    onClick={() => {
                      if (memorySource === "review" && sessionWords.length === 0) {
                        handleMemorySourceChange("all");
                        return;
                      }
                      resetMemorySession();
                    }}
                    className="eq-button eq-button-primary"
                  >
                    {memorySource === "review" && sessionWords.length === 0
                      ? "全単語で練習する"
                      : "もう一度はじめる"}
                  </button>
                  {sessionWrongNos.size > 0 && memorySource !== "review" && (
                    <button
                      type="button"
                      onClick={handleRetryWrong}
                      className="eq-button eq-button-secondary"
                    >
                      間違えた {sessionWrongNos.size} 語を復習
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <nav className="dict-index-bar" aria-label="アルファベット索引">
              {ALL_LETTERS.map((letter) => {
                const hasLetter = dictGroups.has(letter);
                return hasLetter ? (
                  <button
                    key={letter}
                    type="button"
                    className={`dict-index-btn${currentDictLetter === letter ? " is-active" : ""}`}
                    onClick={() => setActiveLetter(letter)}
                  >
                    {letter}
                  </button>
                ) : (
                  <span key={letter} className="dict-index-btn is-empty" aria-hidden="true">
                    {letter}
                  </span>
                );
              })}
            </nav>

            <div className="dict-sections">
              {displayedDictEntries.map(([letter, words]) => (
                  <section className="dict-group" key={letter}>
                    <div className="dict-letter-head">
                      <span>{letter}</span>
                      <small>{words.length}語</small>
                    </div>
                    <div className="dict-words-grid">
                      {words.map((word, index) => {
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
                  </section>
              ))}
            </div>
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

        .wordbook-quest-link {
          border-color: rgba(45, 212, 191, 0.32) !important;
          background: rgba(45, 212, 191, 0.08) !important;
          color: #ccfbf1 !important;
        }

        .wordbook-quest-link:hover {
          border-color: rgba(45, 212, 191, 0.5) !important;
          background: rgba(45, 212, 191, 0.14) !important;
        }

        .wordbook-furigana-toggle.is-on {
          border-color: rgba(250, 204, 21, 0.55);
          background: rgba(250, 204, 21, 0.12);
          color: #fde68a;
        }

        .wordbook-stage {
          display: flex;
          justify-content: center;
        }

        .wordbook-display-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          height: auto;
          padding-bottom: 28px;
        }

        .wordbook-display-card .eq-display-image-frame {
          width: 156px;
          height: 156px;
          margin-top: 42px;
        }

        .wordbook-card-runes {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: repeat(5, 28px);
          gap: 8px;
          margin-top: 14px;
        }

        .wordbook-card-runes span {
          width: 28px;
          height: 28px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(253, 230, 138, 0.32);
          border-radius: 10px;
          background: rgba(250, 204, 21, 0.08);
          color: #fef3c7;
          font-size: 12px;
          font-weight: 1000;
          box-shadow: inset 0 0 14px rgba(45, 212, 191, 0.08);
        }

        .eq-display-card p,
        .eq-display-card h2,
        .eq-display-card > span {
          position: relative;
          z-index: 2;
          text-align: center;
        }

        .eq-display-card p {
          margin: 18px 0 0;
          color: #fde68a;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.18em;
        }

        .eq-display-card h2 {
          margin: 8px 0 0;
          font-size: 26px;
          font-weight: 900;
        }

        .eq-display-card > span {
          display: block;
          margin: 6px auto 0;
          max-width: 220px;
          color: #94a3b8;
          font-size: 13px;
          font-weight: 900;
        }

        .wordbook-mode-actions {
          grid-template-columns: repeat(3, minmax(0, 1fr));
          max-width: 760px;
          margin-top: 16px;
          gap: 12px;
        }

        .wordbook-mode-action {
          min-height: 64px;
          font-family: inherit;
          border-color: rgba(255, 255, 255, 0.12) !important;
          background: rgba(255, 255, 255, 0.06) !important;
          color: #f8fafc !important;
          box-shadow: none !important;
          white-space: nowrap;
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
          font-weight: 800;
        }

        .wordbook-memory-summary strong {
          color: #fef3c7;
          font-size: 16px;
          line-height: 1.2;
          font-weight: 900;
        }

        .wordbook-memory-controls {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
          flex-wrap: wrap;
        }

        .memory-source-tabs {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          flex: 0 0 auto;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 999px;
          padding: 3px;
          background: rgba(2, 6, 23, 0.42);
        }

        .memory-source-tab {
          min-height: 30px;
          border: 0;
          border-radius: 999px;
          background: transparent;
          color: #94a3b8;
          padding: 0 11px;
          font: inherit;
          font-size: 11px;
          font-weight: 1000;
          white-space: nowrap;
          cursor: pointer;
          transition:
            background 0.16s ease,
            color 0.16s ease,
            opacity 0.16s ease;
        }

        .memory-source-tab.active {
          background: rgba(250, 204, 21, 0.16);
          color: #fef3c7;
        }

        .memory-source-tab:disabled {
          cursor: not-allowed;
          opacity: 0.42;
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
          overflow: visible;
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

        .search-suggestions {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          right: 0;
          z-index: 100;
          padding: 4px;
          background: rgba(10, 18, 36, 0.97);
          border: 1px solid rgba(45, 212, 191, 0.32);
          border-radius: 12px;
          box-shadow: 0 8px 28px rgba(0, 0, 0, 0.48);
        }

        .words-search-outer {
          position: relative;
        }

        .search-suggestions-list {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          right: 0;
          z-index: 200;
          padding: 4px;
          background: rgba(10, 18, 36, 0.97);
          border: 1px solid rgba(45, 212, 191, 0.32);
          border-radius: 12px;
          box-shadow: 0 8px 28px rgba(0, 0, 0, 0.48);
          max-height: 280px;
          overflow-y: auto;
        }

        .search-suggestion-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.12s ease;
        }

        .search-suggestion-item:hover {
          background: rgba(45, 212, 191, 0.12);
        }

        .search-suggestion-item .suggestion-word {
          font-weight: 700;
          color: #e2e8f0;
          font-size: 14px;
          min-width: 110px;
          flex-shrink: 0;
        }

        .search-suggestion-item .suggestion-meaning {
          color: #94a3b8;
          font-size: 12px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .wordbook-stats-row {
          display: flex;
          gap: 16px;
          margin-top: 18px;
        }

        .wordbook-stat-item {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          padding: 5px 12px;
        }

        .wordbook-stat-item em {
          font-style: normal;
          font-size: 11px;
          color: #94a3b8;
        }

        .wordbook-stat-item strong {
          font-size: 14px;
          font-weight: 800;
          color: #e2e8f0;
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
          min-width: 0;
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
          justify-content: flex-end;
          gap: 6px;
          flex-shrink: 0;
          flex-wrap: wrap;
          margin: 0 0 0 auto;
        }

        .memory-meta-notices + .memory-keyboard-hint,
        .memory-result + .memory-meta-notices {
          display: none;
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
          font-weight: 800;
          line-height: 1.25;
        }

        .memory-kicker {
          display: block;
          margin: 8px 0 0;
          color: #5eead4;
          font-size: 10px;
          font-weight: 800;
          text-align: center;
          letter-spacing: 0.1em;
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

        .memory-complete-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
        }

        .memory-keyboard-hint {
          flex: 0 0 auto;
          margin: 0 0 0 auto;
          text-align: right;
          color: #64748b;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.03em;
          white-space: nowrap;
        }

        @media (hover: none) {
          .memory-keyboard-hint { display: none; }
        }

        .dict-index-bar {
          position: sticky;
          top: 0;
          z-index: 10;
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          padding: 10px 14px;
          margin-top: 18px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          background: rgba(8, 12, 22, 0.88);
          backdrop-filter: blur(14px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.32);
        }

        .dict-index-btn {
          width: 32px;
          height: 32px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
          border: 1px solid rgba(45, 212, 191, 0.32);
          background: rgba(20, 184, 166, 0.08);
          color: #99f6e4;
          font-size: 13px;
          font-weight: 1000;
          text-decoration: none;
          cursor: pointer;
          transition:
            transform 0.13s ease,
            background 0.13s ease,
            border-color 0.13s ease;
        }

        .dict-index-btn:hover {
          transform: translateY(-2px);
          background: rgba(45, 212, 191, 0.2);
          border-color: rgba(45, 212, 191, 0.6);
        }

        .dict-index-btn.is-active {
          background: rgba(45, 212, 191, 0.45) !important;
          border: 2px solid rgba(45, 212, 191, 1) !important;
          color: #ffffff !important;
          box-shadow: 0 0 16px rgba(45, 212, 191, 0.55), inset 0 0 6px rgba(45, 212, 191, 0.2) !important;
          transform: translateY(-2px) !important;
        }

        .dict-index-btn.is-empty {
          border-color: rgba(255, 255, 255, 0.06);
          background: transparent;
          color: rgba(255, 255, 255, 0.16);
          cursor: default;
        }

        .dict-sections {
          margin-top: 22px;
          display: grid;
          gap: 32px;
        }

        .dict-group {
          scroll-margin-top: 72px;
          content-visibility: auto;
          contain-intrinsic-size: 520px;
        }

        .dict-letter-head {
          display: flex;
          align-items: baseline;
          gap: 10px;
          padding-bottom: 10px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          margin-bottom: 14px;
        }

        .dict-letter-head > span {
          font-size: 38px;
          font-weight: 1000;
          line-height: 1;
          color: #fef3c7;
        }

        .dict-letter-head small {
          color: #64748b;
          font-size: 12px;
          font-weight: 900;
        }

        .dict-words-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .words-card {
          min-width: 0;
          content-visibility: auto;
          contain-intrinsic-size: 250px;
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

        @media (prefers-reduced-motion: reduce) {
          .memory-card-glow,
          .memory-result,
          .memory-complete {
            animation: none !important;
          }

          .memory-choice,
          .words-card,
          .dict-index-btn,
          .memory-level-tab,
          .memory-range-tab,
          .wordbook-memory-back-button,
          .memory-actions button,
          .memory-progress-track div {
            transition: none !important;
          }
        }

        @media (max-width: 960px) {
          .dict-words-grid {
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

          .memory-keyboard-hint {
            margin-left: 0;
            text-align: left;
            white-space: normal;
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

          .dict-words-grid {
            gap: 10px;
          }

          .dict-letter-head > span {
            font-size: 30px;
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
