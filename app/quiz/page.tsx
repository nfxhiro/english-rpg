"use client";

import type { CSSProperties } from "react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Link from "next/link";
import SpeechButton from "../components/SpeechButton";
import { learningWords, LearningWord } from "../../data/words";
import {
  wordGroupsByLevel,
  levelOrder,
  type WordGroup,
} from "../../data/wordGroups";
import {
  availableQuestWorlds,
  defaultBoss,
  defaultQuestConfig,
  getBossForQuest,
  getPartClearReward,
  getQuestBackgroundConfig,
  getQuestBlockConfig,
  getQuestModeConfig,
  getQuestWorldByLevel,
  questModeConfigList,
  type BossConfig as Boss,
  type PartClearReward,
  type QuestBackgroundConfig,
  type QuestConfig,
  type QuestMode,
} from "../../data/questConfig";
import { getReadingForLevel } from "../../data/readings";
import {
  addGold,
  addHeroExp,
  applyGoldBonus,
  clampGoldBonusRate,
  getHeroGoldBonusRate,
  getHeroExpProgress,
  HeroExpResult,
  HeroStatus,
  loadGold,
  loadHeroStatus,
  saveHeroStatus,
} from "../../data/hero";
import {
  bgmPlayer,
  getStoredBgmEnabled,
  subscribeToBgmEnabledChange,
} from "../../data/bgm";
import {
  getStoredFuriganaEnabled,
  setStoredFuriganaEnabled,
  subscribeToFuriganaEnabledChange,
} from "../../data/preferences";
import {
  EarnedCard,
  MonsterCard,
} from "../../data/cards";
import {
  getSelectedMonsterCard,
  loadShopState,
} from "../../data/shop";
import {
  addBuddyExpToEarnedCards,
  getBuddyQuestExpReward,
  getMonsterLevelProgress,
  getPartnerLevelGoldBonusRate,
  getPartnerRarityGoldBonusRate,
  type BuddyExpResult,
} from "../../data/progression";
import styles from "./quest-mode.module.css";

type AnswerRecord = {
  word: string;
  meaning: string;
  selectedAnswer: string;
  isCorrect: boolean;
};

type AnswerEffect = {
  type: "correct" | "wrong";
  word: string;
  correctAnswer: string;
  damageAmount?: number;
  bossDefeated?: boolean;
  heroExpGained?: number;
  heroLevelBefore?: number;
  heroLevelAfter?: number;
  heroLeveledUp?: boolean;
  goldEarned?: number;
};

type GameStatus = "playing" | "clear" | "gameOver";

type BlockProgress = {
  miniCleared: boolean;
  normalCleared: boolean;
  bossCleared: boolean;
  completeCleared: boolean;
  crowned: boolean;
};

type BlockProgressMap = Record<string, BlockProgress>;

type QuestType = "block" | "review" | "challenge";

type GoldRewardResult = {
  baseGold: number;
  heroBonusRate: number;
  partnerLevelBonusRate: number | null;
  partnerRarityBonusRate: number | null;
  partnerLevel: number | null;
  partnerRarity: MonsterCard["rarity"] | null;
  totalBonusRate: number;
  finalGold: number;
  heroLevel: number;
  heroLevelBefore: number;
  heroLevelAfter: number;
  heroBonusRateBefore: number;
  heroBonusRateAfter: number;
  heroBonusRateChanged: boolean;
};

type BuddyQuestExpResult = BuddyExpResult & {
  card: MonsterCard;
};

type QuestStartHandler = (
  sourceWords: LearningWord[],
  title: string,
  config: QuestConfig,
  blockId?: string | null,
  questType?: QuestType
) => void;

const QUEST_PROGRESS_STORAGE_KEY = "eikenQuestFrontierProgress";

const QUEST_BASE_GOLD: Record<QuestMode, number> = {
  mini: 100,
  normal: 300,
  boss: 500,
  complete: 1000,
};

const LEVEL_GOLD_MULTIPLIER: Record<string, number> = {
  "英検5級": 1.0,
  "英検4級": 1.1,
  "英検3級": 1.25,
  "英検準2級": 1.5,
};

const LEVEL_XP_PER_CORRECT: Record<string, number> = {
  "英検5級": 10,
  "英検4級": 12,
  "英検3級": 15,
  "英検準2級": 20,
};

const DEFAULT_XP_PER_CORRECT = 10;
const DEFAULT_GOLD_MULTIPLIER = 1.0;

const questModeClassNames: Record<QuestMode, string> = {
  mini: styles.questModeMini,
  normal: styles.questModeNormal,
  boss: styles.questModeBoss,
  complete: styles.questModeComplete,
};

function cx(...classNames: Array<string | false | null | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

type QuestBackgroundStyle = CSSProperties & Record<
  "--quest-bg-image" | "--quest-bg-overlay" | "--quest-bg-pattern" | "--quest-bg-accent",
  string
>;

function getQuestBackgroundStyle(
  background: QuestBackgroundConfig,
  questMode?: QuestMode
): QuestBackgroundStyle {
  const useBossOverlay = questMode === "boss" || questMode === "complete";

  return {
    "--quest-bg-image": background.backgroundImage,
    "--quest-bg-overlay": useBossOverlay ? background.bossOverlay : background.overlay,
    "--quest-bg-pattern": background.pattern,
    "--quest-bg-accent": background.accent,
  };
}

function shuffleArray<T>(array: T[]) {
  const copiedArray = [...array];

  for (let i = copiedArray.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [copiedArray[i], copiedArray[randomIndex]] = [
      copiedArray[randomIndex],
      copiedArray[i],
    ];
  }

  return copiedArray;
}

function createRandomQuestions(sourceWords: LearningWord[], count: number) {
  return shuffleArray(sourceWords).slice(0, Math.min(count, sourceWords.length));
}

function createChoices(currentWord: LearningWord): string[] {
  const pool = learningWords.filter((w) => w.word !== currentWord.word);

  const sameLevelSameType = shuffleArray(
    pool.filter((w) => w.type === currentWord.type && w.level === currentWord.level)
  );
  const otherLevelSameType = shuffleArray(
    pool.filter((w) => w.type === currentWord.type && w.level !== currentWord.level)
  );
  const differentType = shuffleArray(
    pool.filter((w) => w.type !== currentWord.type)
  );

  const prioritized = [...sameLevelSameType, ...otherLevelSameType, ...differentType];
  const seen = new Set<string>([currentWord.meaning]);
  const wrongChoices: string[] = [];

  for (const w of prioritized) {
    if (wrongChoices.length >= 3) break;
    if (!seen.has(w.meaning)) {
      seen.add(w.meaning);
      wrongChoices.push(w.meaning);
    }
  }

  return shuffleArray([currentWord.meaning, ...wrongChoices]);
}

function createEmptyBlockProgress(): BlockProgress {
  return {
    miniCleared: false,
    normalCleared: false,
    bossCleared: false,
    completeCleared: false,
    crowned: false,
  };
}

function normalizeQuestConfig(config: QuestConfig, sourceCount: number): QuestConfig {
  const questionCount = Math.max(1, Math.min(config.questionCount, sourceCount));

  if (questionCount === config.questionCount) return config;

  const clearRate = config.clearCorrectCount / config.questionCount;
  const missRate = config.maxMissCount / config.questionCount;

  return {
    ...config,
    questionCount,
    clearCorrectCount: Math.max(1, Math.ceil(questionCount * clearRate)),
    maxMissCount: Math.max(1, Math.round(questionCount * missRate)),
  };
}

function createLargeQuestConfig(questionCount: number): QuestConfig {
  const clearCorrectCount = Math.ceil(questionCount * 0.9);
  const maxMissCount = Math.max(1, questionCount - clearCorrectCount);

  return {
    mode: "complete",
    label: `${questionCount}問大ボス戦`,
    questionCount,
    clearCorrectCount,
    maxMissCount,
  };
}

function loadQuestProgress(): BlockProgressMap {
  try {
    const stored = localStorage.getItem(QUEST_PROGRESS_STORAGE_KEY);
    if (!stored) return {};

    const parsed = JSON.parse(stored) as BlockProgressMap;
    if (!parsed || typeof parsed !== "object") return {};

    return parsed;
  } catch {
    return {};
  }
}

function saveQuestProgress(progress: BlockProgressMap) {
  try {
    localStorage.setItem(QUEST_PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error("クエスト進行の保存に失敗しました:", error);
  }
}

function loadEarnedCards(): EarnedCard[] {
  if (typeof window === "undefined") return [];

  try {
    const savedCardsText = localStorage.getItem("earnedCards");
    const parsedCards = savedCardsText ? JSON.parse(savedCardsText) : [];
    if (!Array.isArray(parsedCards)) return [];
    const now = new Date().toISOString();
    return parsedCards
      .filter((card) => typeof card.cardId === "string")
      .map((card) => {
        const earnedCard = card as Partial<EarnedCard> & { cardId: string };
        const ownedCount = Number(earnedCard.ownedCount);

        return {
          ...earnedCard,
          cardId: earnedCard.cardId,
          correctCount: Math.max(0, Math.floor(Number(earnedCard.correctCount) || 0)),
          exp: Math.max(0, Math.floor(Number(earnedCard.exp) || 0)),
          obtainedAt: typeof earnedCard.obtainedAt === "string" ? earnedCard.obtainedAt : now,
          ownedCount: Number.isFinite(ownedCount) && ownedCount > 0
            ? Math.floor(ownedCount)
            : earnedCard.ownedCount,
        } as EarnedCard;
      });
  } catch {
    return [];
  }
}

function saveEarnedCards(cards: EarnedCard[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("earnedCards", JSON.stringify(cards));
}

function getBlockProgress(
  progressMap: BlockProgressMap,
  blockId: string
): BlockProgress {
  return {
    ...createEmptyBlockProgress(),
    ...(progressMap[blockId] ?? {}),
  };
}

function getBlockProgressPercent(progress: BlockProgress) {
  const totalQuestCount = questModeConfigList.length;
  if (totalQuestCount === 0) return 0;

  const clearedCount = questModeConfigList.filter((config) => {
    return progress[config.progressKey];
  }).length;

  return Math.round((clearedCount / totalQuestCount) * 100);
}

function getQuestCleared(progress: BlockProgress, mode: QuestMode) {
  return progress[getQuestModeConfig(mode).progressKey];
}

function getQuestModeClass(mode: QuestMode) {
  return questModeClassNames[mode];
}

function updateBlockProgressAfterClear(
  currentProgress: BlockProgress,
  config: QuestConfig,
  correctCount: number,
  totalQuestions: number
): BlockProgress {
  const nextProgress = { ...currentProgress };
  const progressKey = getQuestModeConfig(config.mode).progressKey;

  nextProgress[progressKey] = true;
  if (config.mode === "complete") {
    if (correctCount === totalQuestions) nextProgress.crowned = true;
  }

  return nextProgress;
}


function getScoreMessage(
  gameStatus: GameStatus,
  correctCount: number,
  totalQuestions: number,
  clearCorrectCount: number,
  isPerfectClear = false
) {
  if (gameStatus === "clear" && isPerfectClear) {
    return `全${totalQuestions}問をミスなし正解！完璧なクエストクリアです。`;
  }

  if (gameStatus === "clear") {
    return `${correctCount}問正解！クリア条件の${clearCorrectCount}問を達成して、クエストクリアです。`;
  }

  return "勇者が大きなダメージを受けました。ミスした単語を復習して、もう一度挑戦しましょう。";
}

function getBossHpByCorrectCount(correctCount: number, clearCorrectCount: number) {
  return Math.max(0, 100 - correctCount * (100 / clearCorrectCount));
}

function getPlayerHpByMistakeCount(mistakeCount: number, maxMissCount: number) {
  return Math.max(0, 100 - mistakeCount * (100 / maxMissCount));
}

function formatDamageAmount(amount: number) {
  return Math.max(1, Math.round(amount));
}

function formatBonusRate(rate: number) {
  return `+${Math.round(rate * 100)}%`;
}

function getLevelColorSuffix(level: string) {
  return getQuestWorldByLevel(level)?.colorSuffix ?? "default";
}

function getDominantLevel(words: LearningWord[]): string | null {
  if (words.length === 0) return null;
  const counts: Record<string, number> = {};
  for (const w of words) counts[w.level] = (counts[w.level] ?? 0) + 1;
  return Object.entries(counts).reduce((a, b) => (b[1] > a[1] ? b : a))[0];
}

function getChoiceReading(currentQuestion: LearningWord, choice: string) {
  const sameLevelReading = getReadingForLevel(currentQuestion.level, choice);
  if (sameLevelReading) return sameLevelReading;

  const sourceWord = learningWords.find((word) => word.meaning === choice);
  return sourceWord ? getReadingForLevel(sourceWord.level, choice) : undefined;
}

export default function QuizPage() {
  const [questId, setQuestId] = useState(0);
  const [questions, setQuestions] = useState<LearningWord[]>([]);
  const [choices, setChoices] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerEffect, setAnswerEffect] = useState<AnswerEffect | null>(null);
  const [answerRecords, setAnswerRecords] = useState<AnswerRecord[]>([]);
  const [heroExpResults, setHeroExpResults] = useState<HeroExpResult[]>([]);
  const [questTitle, setQuestTitle] = useState("完全制覇");
  const [activeQuestConfig, setActiveQuestConfig] =
    useState<QuestConfig>(defaultQuestConfig);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [activeSourceWords, setActiveSourceWords] = useState<LearningWord[]>([]);
  const [questProgress, setQuestProgress] = useState<BlockProgressMap>({});
  const [gameStatus, setGameStatus] = useState<GameStatus>("playing");
  const [bossHp, setBossHp] = useState(100);
  const [playerHp, setPlayerHp] = useState(100);
  const [activeBoss, setActiveBoss] = useState<Boss>(defaultBoss);
  const [isStarted, setIsStarted] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [heroLevel, setHeroLevel] = useState(1);
  const [totalGoldEarned, setTotalGoldEarned] = useState(0);
  const [questLevelKey, setQuestLevelKey] = useState<string | null>(null);
  const [questType, setQuestType] = useState<QuestType>("block");
  const [questIsFirstClear, setQuestIsFirstClear] = useState(false);
  const [heroStatusAfterQuest, setHeroStatusAfterQuest] = useState<HeroStatus | null>(null);
  const [goldRewardResult, setGoldRewardResult] = useState<GoldRewardResult | null>(null);
  const [currentGoldBalance, setCurrentGoldBalance] = useState(0);
  const bgmEnabled = useSyncExternalStore(
    subscribeToBgmEnabledChange,
    getStoredBgmEnabled,
    () => true
  );
  const furiganaEnabled = useSyncExternalStore(
    subscribeToFuriganaEnabledChange,
    getStoredFuriganaEnabled,
    () => false
  );
  const [buddyCard, setBuddyCard] = useState<MonsterCard | null>(null);
  const [buddyEarnedCard, setBuddyEarnedCard] = useState<EarnedCard | null>(null);
  const [buddyQuestExpResult, setBuddyQuestExpResult] =
    useState<BuddyQuestExpResult | null>(null);
  const prevGameStatusRef = useRef<GameStatus>("playing");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        setQuestProgress(loadQuestProgress());
        setHeroLevel(loadHeroStatus().level);
        const loadedShopState = loadShopState();
        const selectedMonsterCard = getSelectedMonsterCard(loadedShopState);
        const loadedEarnedCards = loadEarnedCards();
        const selectedEarnedCard = selectedMonsterCard
          ? loadedEarnedCards.find((card) => card.cardId === selectedMonsterCard.id) ?? null
          : null;
        setBuddyCard(selectedMonsterCard);
        setBuddyEarnedCard(selectedEarnedCard);
      } catch (error) {
        console.error("クエストモードの初期化に失敗しました:", error);
        setQuestProgress({});
        setHeroLevel(1);
        setBuddyCard(null);
        setBuddyEarnedCard(null);
      } finally {
        setIsReady(true);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  // Battle BGM loop
  useEffect(() => {
    if (!isReady || !isStarted || !bgmEnabled || gameStatus !== "playing") {
      bgmPlayer.stopBattle();
      return undefined;
    }
    bgmPlayer.playBattle();
    return () => bgmPlayer.stopBattle();
  }, [isReady, isStarted, bgmEnabled, gameStatus]);

  // One-shot jingles on quest end
  useEffect(() => {
    if (!isStarted) { prevGameStatusRef.current = "playing"; return; }
    if (prevGameStatusRef.current === "playing" && bgmEnabled) {
      if (gameStatus === "clear") bgmPlayer.playVictory();
      else if (gameStatus === "gameOver") bgmPlayer.playGameOver();
    }
    prevGameStatusRef.current = gameStatus;
  }, [gameStatus, isStarted, bgmEnabled]);

  // Cleanup on unmount
  useEffect(() => () => bgmPlayer.stopBattle(), []);

  useEffect(() => {
    if (gameStatus === "playing") return;

    window.scrollTo({ top: 0, behavior: "auto" });
  }, [gameStatus]);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length || activeQuestConfig.questionCount;
  const clearCorrectCount = activeQuestConfig.clearCorrectCount;
  const maxMistakes = activeQuestConfig.maxMissCount;

  const correctCount = useMemo(() => {
    return answerRecords.filter((record) => record.isCorrect).length;
  }, [answerRecords]);

  const wrongAnswers = useMemo(() => {
    return answerRecords.filter((record) => !record.isCorrect);
  }, [answerRecords]);

  const mistakeCount = wrongAnswers.length;
  const currentBoss = activeBoss;
  const currentQuestionNumber = Math.min(currentIndex + 1, totalQuestions);
  const scoreRate = Math.round((correctCount / totalQuestions) * 100);
  const totalHeroExpGained = heroExpResults.reduce(
    (total, result) => total + result.gainedExp,
    0
  );
  const totalHeroLevelUpCount = heroExpResults.reduce(
    (total, result) => total + result.levelUpCount,
    0
  );
  const partClearReward =
    gameStatus === "clear"
      ? getPartClearReward(activeBlockId, activeQuestConfig.mode)
      : undefined;

  const activeQuestWorld = questLevelKey
    ? getQuestWorldByLevel(questLevelKey)
    : undefined;
  const activeQuestBlock = getQuestBlockConfig(activeBlockId);
  const activeQuestBackground = getQuestBackgroundConfig(
    activeQuestBlock?.backgroundKey,
    activeQuestBlock?.levelId ?? activeQuestWorld?.id
  );
  const activeWorldName = activeQuestWorld?.worldName ?? "";
  const activeDungeonName =
    activeBlockId && questLevelKey
      ? (wordGroupsByLevel[questLevelKey]?.find((g) => g.id === activeBlockId)?.stageName ?? "")
      : "";
  const activeContentType =
    questType === "block" && activeBlockId
      ? activeBlockId.includes("-ph-")
        ? "熟語サブダンジョン"
        : "単語ダンジョン"
      : "";

  const toggleFurigana = () => {
    setStoredFuriganaEnabled(!furiganaEnabled);
  };

  const recordQuestClear = useCallback(
    (
      blockId: string | null,
      config: QuestConfig,
      finalCorrectCount: number,
      finalQuestionCount: number
    ) => {
      if (!blockId) return;

      setQuestProgress((prev) => {
        const currentProgress = getBlockProgress(prev, blockId);
        const nextProgress = {
          ...prev,
          [blockId]: updateBlockProgressAfterClear(
            currentProgress,
            config,
            finalCorrectCount,
            finalQuestionCount
          ),
        };

        saveQuestProgress(nextProgress);
        return nextProgress;
      });
    },
    []
  );

  const startQuest = useCallback<QuestStartHandler>(
    (sourceWords, title, config, blockId = null, type = "block") => {
      const nextConfig = normalizeQuestConfig(config, sourceWords.length);
      const nextQuestions = createRandomQuestions(
        sourceWords,
        nextConfig.questionCount
      );

      setQuestId((prev) => prev + 1);
      setQuestions(nextQuestions);
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setAnswerEffect(null);
      setAnswerRecords([]);
      setHeroExpResults([]);
      setTotalGoldEarned(0);
      setQuestLevelKey(getDominantLevel(sourceWords));
      setQuestType(type);
      setHeroStatusAfterQuest(null);
      setGoldRewardResult(null);
      setCurrentGoldBalance(0);
      setBuddyQuestExpResult(null);
      setQuestIsFirstClear(false);
      setQuestTitle(title);
      setActiveQuestConfig({
        ...nextConfig,
        questionCount: nextQuestions.length,
      });
      setActiveBlockId(blockId);
      setActiveSourceWords(sourceWords);
      setGameStatus("playing");
      setBossHp(100);
      setPlayerHp(100);
      setActiveBoss(
        getBossForQuest({
          blockId,
          mode: nextConfig.mode,
          title,
          questionCount: nextConfig.questionCount,
        })
      );
      setIsStarted(true);
      window.scrollTo({ top: 0, behavior: "auto" });
      setChoices(nextQuestions.length > 0 ? createChoices(nextQuestions[0]) : []);
    },
    []
  );

  const startReviewQuest = () => {
    const reviewQuestions = wrongAnswers
      .map((record) => {
        return (
          questions.find((item) => item.word === record.word) ??
          learningWords.find((item) => item.word === record.word)
        );
      })
      .filter((word): word is LearningWord => Boolean(word));

    if (reviewQuestions.length === 0) return;

    startQuest(reviewQuestions, "ミスした問題だけ復習", {
      mode: "mini",
      label: "ミス復習",
      questionCount: reviewQuestions.length,
      clearCorrectCount: reviewQuestions.length,
      maxMissCount: reviewQuestions.length,
    }, null, "review");
  };

  const backToSelect = () => {
    setIsStarted(false);
    setSelectedAnswer(null);
    setAnswerEffect(null);
    setGameStatus("playing");
  };

  const retryCurrentQuest = () => {
    startQuest(
      activeSourceWords.length > 0 ? activeSourceWords : questions,
      questTitle,
      activeQuestConfig,
      activeBlockId,
      questType
    );
  };

  const handleAnswer = (choice: string) => {
    if (selectedAnswer !== null || !currentQuestion || gameStatus !== "playing") {
      return;
    }

    setSelectedAnswer(choice);

    const isCorrect = choice === currentQuestion.meaning;
    if (isCorrect) bgmPlayer.playSfxHit();
    else bgmPlayer.playSfxMiss();
    const nextCorrectCount = isCorrect ? correctCount + 1 : correctCount;
    const nextMistakeCount = isCorrect ? mistakeCount : mistakeCount + 1;
    const mistakeDamage = 100 / maxMistakes;
    const nextPlayerHp = getPlayerHpByMistakeCount(
      nextMistakeCount,
      maxMistakes
    );
    const reachedFinalQuestion = currentIndex + 1 >= totalQuestions;
    const reachedClear = nextCorrectCount >= clearCorrectCount;
    const canStillEarnCrown =
      activeQuestConfig.mode === "complete" &&
      nextMistakeCount === 0 &&
      reachedClear &&
      !reachedFinalQuestion;
    const reachedGameOver =
      nextMistakeCount >= maxMistakes ||
      (reachedFinalQuestion && nextCorrectCount < clearCorrectCount);
    const nextStatus: GameStatus | null = reachedClear && !canStillEarnCrown
      ? "clear"
      : reachedGameOver
        ? "gameOver"
        : null;
    const bossHpTarget =
      activeQuestConfig.mode === "complete" && nextMistakeCount === 0
        ? totalQuestions
        : clearCorrectCount;
    const correctDamage = 100 / bossHpTarget;
    const nextBossHp =
      nextStatus === "clear"
        ? 0
        : getBossHpByCorrectCount(nextCorrectCount, bossHpTarget);
    const bossDefeated = isCorrect && nextStatus === "clear";

    const answerRecord: AnswerRecord = {
      word: currentQuestion.word,
      meaning: currentQuestion.meaning,
      selectedAnswer: choice,
      isCorrect,
    };

    const nextAnswerRecords = [...answerRecords, answerRecord];
    let nextHeroExpResults = heroExpResults;
    let latestHeroResult: HeroExpResult | null = null;

    if (isCorrect) {
      // Chain EXP from last result so we don't read stale localStorage mid-quest
      const currentHero =
        heroExpResults.length > 0
          ? heroExpResults[heroExpResults.length - 1].after
          : loadHeroStatus();
      const xpPerCorrect = LEVEL_XP_PER_CORRECT[questLevelKey ?? ""] ?? DEFAULT_XP_PER_CORRECT;
      const heroResult = addHeroExp(currentHero, xpPerCorrect);

      latestHeroResult = heroResult;
      nextHeroExpResults = [...heroExpResults, heroResult];
      setHeroExpResults(nextHeroExpResults);
      if (heroResult.leveledUp) setHeroLevel(heroResult.after.level);
      setBossHp(nextBossHp);
    } else {
      setPlayerHp(nextPlayerHp);
      if (nextStatus === "clear") setBossHp(0);
    }
    setAnswerRecords(nextAnswerRecords);
    setAnswerEffect({
      type: isCorrect ? "correct" : "wrong",
      word: currentQuestion.word,
      correctAnswer: currentQuestion.meaning,
      bossDefeated,
      heroExpGained: latestHeroResult?.gainedExp,
      heroLevelBefore: latestHeroResult?.before.level,
      heroLevelAfter: latestHeroResult?.after.level,
      heroLeveledUp: latestHeroResult?.leveledUp,
      damageAmount: formatDamageAmount(
        isCorrect ? correctDamage : mistakeDamage
      ),
    });

    window.setTimeout(() => {
      setAnswerEffect(null);

      if (nextStatus) {
        // Save all EXP at quest end
        if (nextHeroExpResults.length > 0) {
          saveHeroStatus(nextHeroExpResults[nextHeroExpResults.length - 1].after);
        }
        const finalHeroStatus = nextHeroExpResults.length > 0
          ? nextHeroExpResults[nextHeroExpResults.length - 1].after
          : loadHeroStatus();
        const heroStatusBeforeQuest =
          nextHeroExpResults[0]?.before ?? finalHeroStatus;
        setHeroStatusAfterQuest(finalHeroStatus);

        let totalGold = 0;
        let isFirstClear = false;
        let nextGoldRewardResult: GoldRewardResult | null = null;
        let nextBuddyQuestExpResult: BuddyQuestExpResult | null = null;

        if (nextStatus === "clear") {
          isFirstClear = activeBlockId
            ? !getQuestCleared(getBlockProgress(questProgress, activeBlockId), activeQuestConfig.mode)
            : false;
          const isPerfect = nextCorrectCount === totalQuestions && nextMistakeCount === 0;
          const baseGold = QUEST_BASE_GOLD[activeQuestConfig.mode];
          const levelMult = LEVEL_GOLD_MULTIPLIER[questLevelKey ?? ""] ?? DEFAULT_GOLD_MULTIPLIER;
          const clearMult = questType === "review" ? 0.5
            : questType === "challenge" ? 0.3
            : isFirstClear ? 1.0
            : 0.3;
          const baseGoldBeforeHeroBonus = Math.floor(
            baseGold * levelMult * clearMult * (isPerfect ? 1.1 : 1.0)
          );

          let partnerLevelBonusRate: number | null = null;
          let partnerRarityBonusRate: number | null = null;
          let partnerLevel: number | null = null;
          let partnerRarity: MonsterCard["rarity"] | null = null;

          if (buddyCard) {
            const buddyExpReward = getBuddyQuestExpReward(activeQuestConfig.mode);
            const buddyResult = addBuddyExpToEarnedCards(
              loadEarnedCards(),
              buddyCard.id,
              buddyExpReward
            );
            const buddyProgressForGold =
              buddyResult.earnedCard
                ? buddyResult.after
                : getMonsterLevelProgress(buddyEarnedCard?.exp ?? 0);

            partnerLevel = buddyProgressForGold.level;
            partnerRarity = buddyCard.rarity;
            partnerLevelBonusRate = getPartnerLevelGoldBonusRate(partnerLevel);
            partnerRarityBonusRate = getPartnerRarityGoldBonusRate(partnerRarity);

            if (buddyResult.earnedCard) {
              if (buddyResult.updated || buddyResult.gainedExp > 0) {
                saveEarnedCards(buddyResult.earnedCards);
              }
              setBuddyEarnedCard(buddyResult.earnedCard);
              nextBuddyQuestExpResult = {
                ...buddyResult,
                card: buddyCard,
              };
            }
          }

          const heroBonusRateBefore = getHeroGoldBonusRate(heroStatusBeforeQuest.level);
          const heroBonusRateAfter = getHeroGoldBonusRate(finalHeroStatus.level);
          const totalBonusRate = clampGoldBonusRate(
            heroBonusRateAfter +
            (partnerLevelBonusRate ?? 0) +
            (partnerRarityBonusRate ?? 0)
          );
          totalGold = applyGoldBonus(baseGoldBeforeHeroBonus, totalBonusRate);
          nextGoldRewardResult = {
            baseGold: baseGoldBeforeHeroBonus,
            heroBonusRate: heroBonusRateAfter,
            partnerLevelBonusRate,
            partnerRarityBonusRate,
            partnerLevel,
            partnerRarity,
            totalBonusRate,
            finalGold: totalGold,
            heroLevel: finalHeroStatus.level,
            heroLevelBefore: heroStatusBeforeQuest.level,
            heroLevelAfter: finalHeroStatus.level,
            heroBonusRateBefore,
            heroBonusRateAfter,
            heroBonusRateChanged: heroBonusRateBefore !== heroBonusRateAfter,
          };
          const newBalance = addGold(totalGold);
          setCurrentGoldBalance(newBalance);
          recordQuestClear(activeBlockId, activeQuestConfig, nextCorrectCount, totalQuestions);
        } else {
          setCurrentGoldBalance(loadGold());
        }

        setQuestIsFirstClear(isFirstClear);
        setTotalGoldEarned(totalGold);
        setGoldRewardResult(nextGoldRewardResult);
        setBuddyQuestExpResult(nextBuddyQuestExpResult);
        setGameStatus(nextStatus);
        return;
      }

      const nextIndex = currentIndex + 1;
      const nextQuestion = questions[nextIndex];

      setCurrentIndex(nextIndex);
      setSelectedAnswer(null);
      setChoices(createChoices(nextQuestion));
    }, 850);
  };

  if (!isReady) {
    return <QuestLoadingScreen />;
  }

  if (!isStarted) {
    return (
      <QuestSelectScreen
        furiganaEnabled={furiganaEnabled}
        onStartQuest={startQuest}
        onToggleFurigana={toggleFurigana}
        questProgress={questProgress}
      />
    );
  }

  if (!currentQuestion) {
    return <QuestLoadingScreen />;
  }

  if (gameStatus !== "playing") {
    return (
      <QuestResultScreen
        activeContentType={activeContentType}
        activeDungeonName={activeDungeonName}
        activeWorldName={activeWorldName}
        canReview={wrongAnswers.length > 0}
        clearCorrectCount={clearCorrectCount}
        correctCount={correctCount}
        currentGoldBalance={currentGoldBalance}
        gameStatus={gameStatus}
        goldRewardResult={goldRewardResult}
        heroStatusAfter={heroStatusAfterQuest}
        heroStatusBefore={heroExpResults[0]?.before ?? null}
        isFirstClear={questIsFirstClear}
        mistakeCount={mistakeCount}
        onBackToSelect={backToSelect}
        onRestart={retryCurrentQuest}
        onReview={startReviewQuest}
        questTitle={questTitle}
        partClearReward={partClearReward}
        scoreRate={scoreRate}
        buddyQuestExpResult={buddyQuestExpResult}
        totalGoldEarned={totalGoldEarned}
        totalHeroExpGained={totalHeroExpGained}
        totalHeroLevelUpCount={totalHeroLevelUpCount}
        totalQuestions={totalQuestions}
        wrongAnswers={wrongAnswers}
      />
    );
  }

  return (
    <QuestBattleMode
      key={questId}
      answerEffect={answerEffect}
      background={activeQuestBackground}
      boss={currentBoss}
      bossHp={bossHp}
      buddyCard={buddyCard}
      choices={choices}
      currentQuestion={currentQuestion}
      currentQuestionNumber={currentQuestionNumber}
      furiganaEnabled={furiganaEnabled}
      heroLevel={heroLevel}
      onAnswer={handleAnswer}
      onBackToSelect={backToSelect}
      onToggleFurigana={toggleFurigana}
      playerHp={playerHp}
      questMode={activeQuestConfig.mode}
      selectedAnswer={selectedAnswer}
      totalQuestions={totalQuestions}
    />
  );
}

function QuestLoadingScreen() {
  return (
    <main className={styles.root}>
      <section className={styles.screen}>
        <QuestHeader />
        <div className={styles.loadingPanel}>
          <p className={styles.loadingLabel}>クエストモード</p>
          <h2>冒険の準備中...</h2>
        </div>
      </section>
    </main>
  );
}

function QuestSelectScreen({
  furiganaEnabled,
  onStartQuest,
  onToggleFurigana,
  questProgress,
}: {
  furiganaEnabled: boolean;
  onStartQuest: QuestStartHandler;
  onToggleFurigana: () => void;
  questProgress: BlockProgressMap;
}) {
  const [selectedLevel, setSelectedLevel] = useState(
    levelOrder[0] ?? availableQuestWorlds[0]?.level ?? ""
  );
  const selectedGroups = wordGroupsByLevel[selectedLevel] ?? [];
  const selectedLevelWords = learningWords.filter(
    (word) => word.level === selectedLevel
  );
  const selectedWorld = getQuestWorldByLevel(selectedLevel);
  const selectedLevelProgress =
    selectedGroups.length > 0
      ? Math.round(
          selectedGroups.reduce((total, group) => {
            return (
              total +
              getBlockProgressPercent(getBlockProgress(questProgress, group.id))
            );
          }, 0) / selectedGroups.length
        )
      : 0;
  const clearedBlockCount = selectedGroups.filter((group) => {
    return getBlockProgress(questProgress, group.id).completeCleared;
  }).length;
  const crownedBlockCount = selectedGroups.filter((group) => {
    return getBlockProgress(questProgress, group.id).crowned;
  }).length;
  const clearedQuestModeCount = selectedGroups.reduce((total, group) => {
    const progress = getBlockProgress(questProgress, group.id);
    const clearedModes = questModeConfigList.filter((config) => {
      return progress[config.progressKey];
    }).length;

    return total + clearedModes;
  }, 0);
  const totalQuestModeCount = selectedGroups.length * questModeConfigList.length;
  const levelSuffix = getLevelColorSuffix(selectedLevel);

  return (
    <main className={styles.root}>
      <section className={styles.selectScreen}>
        <div className={styles.selectTopbar}>
          <Link href="/" className={styles.backLink}>
            ホームへ戻る
          </Link>
          <div className={styles.selectTopbarActions}>
            <FuriganaToggle
              furiganaEnabled={furiganaEnabled}
              onToggle={onToggleFurigana}
            />
          </div>
        </div>

        <header className={cx(styles.frontierHero, styles[`frontierHero${levelSuffix}`])}>
          <div className={styles.frontierSky} aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className={styles.frontierMapLines} aria-hidden="true" />

          <div className={styles.frontierEmblem} aria-hidden="true">
            <span>⚜</span>
          </div>

          <div className={styles.frontierTitleBlock}>
            <p className={styles.frontierKicker}>級別クエスト</p>
            <h1>EIKEN QUEST FRONTIER</h1>
            <p className={styles.frontierSubtitle}>
              {selectedWorld?.description ??
                "冒険を進めて、英単語の力を鍛えよう！"}
            </p>
            <div className={styles.frontierStatRow}>
              <span>🛡️ {selectedLevel}</span>
              <span>🌍 {selectedWorld?.worldName ?? "冒険ワールド"}</span>
              <span>💎 {selectedLevelWords.length}語</span>
              <span>🗺️ {selectedGroups.length}エリア</span>
              <span>👑 王冠 {crownedBlockCount}</span>
            </div>
          </div>

          <div className={styles.frontierCommandPanel}>
            <div className={styles.frontierLevelSeal}>
              <span>現在の冒険</span>
              <strong>{selectedWorld?.worldName ?? selectedLevel}</strong>
              <small>
                {selectedLevel} / {selectedLevelWords.length}語
              </small>
            </div>
            <div className={styles.frontierRoundButtons} aria-label="級全体クエスト">
              <button
                type="button"
                onClick={() =>
                  onStartQuest(
                    selectedLevelWords,
                    `${selectedWorld?.worldName ?? selectedLevel} 全問`,
                    createLargeQuestConfig(selectedLevelWords.length)
                  )
                }
              >
                全問
              </button>
            </div>
          </div>
        </header>

        <nav className={styles.levelRuneTabs} aria-label="級を選ぶ">
          {availableQuestWorlds.map((world) => {
            const level = world.level;
            const levelWords = learningWords.filter((word) => word.level === level);
            const suffix = world.colorSuffix;
            const isActive = level === selectedLevel;

            return (
              <button
                key={level}
                type="button"
                onClick={() => setSelectedLevel(level)}
                className={cx(
                  styles.levelRuneTab,
                  styles[`levelRuneTab${suffix}`],
                  isActive && styles.levelRuneTabActive
                )}
              >
                <span>{level}</span>
                <strong>{world.worldName}</strong>
                <small>{levelWords.length}語</small>
              </button>
            );
          })}
        </nav>

        <section
          className={cx(styles.questBoardShell, styles[`levelSection${levelSuffix}`])}
        >
          <div className={styles.questBoardHeader}>
            <div>
              <p className={styles.frontierKicker}>ADVENTURE MAP</p>
              <h2>
                {selectedWorld?.worldName ?? selectedLevel}
                <span>{selectedLevelWords.length}語</span>
              </h2>
              <p className={styles.questBoardCrownHint}>
                👑 100問全問正解で王冠獲得
              </p>
            </div>
            <div className={styles.questBoardProgress}>
              <div className={styles.questBoardProgressHead}>
                <span>総合進行度</span>
                <strong>{selectedLevelProgress}%</strong>
              </div>
              <div className={styles.questBoardProgressTrack} aria-hidden="true">
                <div
                  className={styles.questBoardProgressFill}
                  style={{ width: `${selectedLevelProgress}%` }}
                />
              </div>
              <div className={styles.questBoardProgressStats}>
                <span>
                  <strong>{clearedQuestModeCount}</strong> / {totalQuestModeCount} CLEAR
                </span>
                <span>
                  <strong>{clearedBlockCount}</strong> / {selectedGroups.length} 完全
                </span>
                <span>
                  <strong>{crownedBlockCount}</strong> 王冠
                </span>
              </div>
            </div>
          </div>

          <div className={styles.questBoardGrid}>
            {selectedGroups.map((group, index) => (
              <QuestBlockCard
                key={group.id}
                group={group}
                index={index}
                level={selectedLevel}
                onStartQuest={onStartQuest}
                progress={getBlockProgress(questProgress, group.id)}
              />
            ))}
          </div>
        </section>


      </section>
    </main>
  );
}

function QuestBlockCard({
  group,
  index,
  level,
  onStartQuest,
  progress,
}: {
  group: WordGroup;
  index: number;
  level: string;
  onStartQuest: QuestStartHandler;
  progress: BlockProgress;
}) {
  const progressPercent = getBlockProgressPercent(progress);
  const mapIcon = group.mapIcon || (index % 2 === 0 ? "🗺️" : "🧭");
  const isPhrase = group.id.includes("-ph-");
  const background = getQuestBackgroundConfig(group.backgroundKey, group.levelId);
  const backgroundStyle = getQuestBackgroundStyle(background);

  return (
    <article
      className={cx(styles.questRangePanel, isPhrase && styles.phraseRangePanel)}
      style={backgroundStyle}
    >
      <div className={styles.rangePanelHead}>
        <div className={styles.rangeVisual} aria-hidden="true">
          <div className={styles.rangeScenePreview} />
          <div className={cx(styles.rangeMapIcon, isPhrase && styles.phraseMapIcon)}>
            {mapIcon}
          </div>
        </div>
        <div className={styles.rangeTitle}>
          <p>{isPhrase ? "PHRASE QUEST" : "QUEST RANGE"}</p>
          <h3>{group.stageName}</h3>
          <span>{group.label} · {group.words.length}語</span>
        </div>
        <div className={styles.blockProgress}>
          <span>進行度 {progressPercent}%</span>
          <div className={styles.blockProgressTrack} aria-hidden="true">
            <div
              className={styles.blockProgressFill}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className={styles.questModeGrid}>
        {questModeConfigList.map((config) => {
          const questConfig = normalizeQuestConfig(config, group.words.length);
          const cleared = getQuestCleared(progress, config.mode);
          const copy = config.copy;

          return (
            <button
              key={config.mode}
              type="button"
              className={cx(
                styles.questModeButton,
                styles.frontierQuestCard,
                getQuestModeClass(config.mode),
                cleared && styles.questModeCleared
              )}
              onClick={() =>
                onStartQuest(
                  group.words,
                  `${level} ${group.label} ${config.label}`,
                  questConfig,
                  group.id
                )
              }
            >
              <div className={styles.questCardTopline}>
                <span className={styles.questCardIcon}>{copy.icon}</span>
                <span
                  className={cx(
                    styles.questCardState,
                    cleared && styles.questCardStateClear
                  )}
                >
                  {cleared ? "CLEAR" : "未クリア"}
                </span>
              </div>
              <strong>{questConfig.questionCount}問</strong>
              <small>{questConfig.clearCorrectCount}問正解でクリア</small>
              <small>{questConfig.maxMissCount}ミスでゲームオーバー</small>
            </button>
          );
        })}
      </div>
    </article>
  );
}

function QuestBattleMode({
  answerEffect,
  background,
  boss,
  bossHp,
  buddyCard,
  choices,
  currentQuestion,
  currentQuestionNumber,
  furiganaEnabled,
  heroLevel,
  onAnswer,
  onBackToSelect,
  onToggleFurigana,
  playerHp,
  questMode,
  selectedAnswer,
  totalQuestions,
}: {
  answerEffect: AnswerEffect | null;
  background: QuestBackgroundConfig;
  boss: Boss;
  bossHp: number;
  buddyCard: MonsterCard | null;
  choices: string[];
  currentQuestion: LearningWord;
  currentQuestionNumber: number;
  furiganaEnabled: boolean;
  heroLevel: number;
  onAnswer: (choice: string) => void;
  onBackToSelect: () => void;
  onToggleFurigana: () => void;
  playerHp: number;
  questMode: QuestMode;
  selectedAnswer: string | null;
  totalQuestions: number;
}) {
  return (
    <main className={styles.root}>
      <section className={styles.screen} aria-label="EIKEN QUEST FRONTIER">
        <div className={styles.battleTopbar}>
          <button
            type="button"
            onClick={onBackToSelect}
            className={styles.backButton}
          >
            クエスト選択へ
          </button>
          <div className={styles.selectTopbarActions}>
            <FuriganaToggle
              furiganaEnabled={furiganaEnabled}
              onToggle={onToggleFurigana}
            />
          </div>
        </div>

        <BattleQuizScreen
          answerEffect={answerEffect}
          background={background}
          boss={boss}
          bossHp={bossHp}
          buddyCard={buddyCard}
          choices={choices}
          currentQuestion={currentQuestion}
          currentQuestionNumber={currentQuestionNumber}
          furiganaEnabled={furiganaEnabled}
          heroLevel={heroLevel}
          onAnswer={onAnswer}
          playerHp={playerHp}
          questMode={questMode}
          selectedAnswer={selectedAnswer}
          totalQuestions={totalQuestions}
        />
      </section>
    </main>
  );
}

function QuestHeader() {
  return (
    <header className={styles.header}>
      <p className={styles.modeBadge}>クエストモード</p>
      <h1>EIKEN QUEST FRONTIER</h1>
    </header>
  );
}

function FuriganaToggle({
  furiganaEnabled,
  onToggle,
}: {
  furiganaEnabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cx(styles.furiganaToggle, furiganaEnabled && styles.activeToggle)}
      title="ふりがなのオン・オフ"
    >
      ふりがな {furiganaEnabled ? "ON" : "OFF"}
    </button>
  );
}

function BattleQuizScreen({
  answerEffect,
  background,
  boss,
  bossHp,
  buddyCard,
  choices,
  currentQuestion,
  currentQuestionNumber,
  furiganaEnabled,
  heroLevel,
  onAnswer,
  playerHp,
  questMode,
  selectedAnswer,
  totalQuestions,
}: {
  answerEffect: AnswerEffect | null;
  background: QuestBackgroundConfig;
  boss: Boss;
  bossHp: number;
  buddyCard: MonsterCard | null;
  choices: string[];
  currentQuestion: LearningWord;
  currentQuestionNumber: number;
  furiganaEnabled: boolean;
  heroLevel: number;
  onAnswer: (choice: string) => void;
  playerHp: number;
  questMode: QuestMode;
  selectedAnswer: string | null;
  totalQuestions: number;
}) {
  return (
    <div className={styles.battleQuizGrid}>
      <BattleArea
        answerEffect={answerEffect}
        background={background}
        boss={boss}
        bossHp={bossHp}
        buddyCard={buddyCard}
        heroLevel={heroLevel}
        playerHp={playerHp}
        questMode={questMode}
      />
      <QuestionArea
        choices={choices}
        currentQuestion={currentQuestion}
        currentQuestionNumber={currentQuestionNumber}
        furiganaEnabled={furiganaEnabled}
        onAnswer={onAnswer}
        selectedAnswer={selectedAnswer}
        totalQuestions={totalQuestions}
      />
    </div>
  );
}

function parseBossDisplayName(fullName: string): { personalName: string; rank: string } {
  const parts = fullName.trim().split(/\s+/);
  const nonEmojiParts = parts.slice(1);
  if (nonEmojiParts.length <= 1) {
    return { personalName: nonEmojiParts[0] ?? fullName, rank: "" };
  }
  return {
    personalName: nonEmojiParts[nonEmojiParts.length - 1],
    rank: nonEmojiParts.slice(0, -1).join(" "),
  };
}

function getHeroLevelStyle(level: number): Record<string, string> {
  if (level >= 90) return { "--hero-main": "#d946ef", "--hero-light": "#f0abfc", "--hero-dark": "#a21caf", "--hero-darkest": "#701a75" };
  if (level >= 70) return { "--hero-main": "#22d3ee", "--hero-light": "#67e8f9", "--hero-dark": "#0891b2", "--hero-darkest": "#155e75" };
  if (level >= 50) return { "--hero-main": "#f59e0b", "--hero-light": "#fcd34d", "--hero-dark": "#b45309", "--hero-darkest": "#78350f" };
  if (level >= 40) return { "--hero-main": "#f97316", "--hero-light": "#fdba74", "--hero-dark": "#c2410c", "--hero-darkest": "#9a3412" };
  if (level >= 30) return { "--hero-main": "#a855f7", "--hero-light": "#d8b4fe", "--hero-dark": "#7e22ce", "--hero-darkest": "#581c87" };
  if (level >= 20) return { "--hero-main": "#3b82f6", "--hero-light": "#93c5fd", "--hero-dark": "#1d4ed8", "--hero-darkest": "#1e3a8a" };
  if (level >= 10) return { "--hero-main": "#10b981", "--hero-light": "#6ee7b7", "--hero-dark": "#047857", "--hero-darkest": "#064e3b" };
  return {};
}

type BossShapeGroup =
  | "demon"
  | "dragon"
  | "slime"
  | "golem"
  | "ghost"
  | "wolf"
  | "plant"
  | "wizard"
  | "insect"
  | "core"
  | "fairy"
  | "bird"
  | "book"
  | "armor"
  | "beast"
  | "serpent"
  | "priest"
  | "knight"
  | "cosmic"
  | "spirit"
  | "clock"
  | "relic";

const fallbackShapeGroup: BossShapeGroup = "beast";

const shapeGroupMap = {
  demon: "demon",
  dragon: "dragon",
  slime: "slime",
  golem: "golem",
  ghost: "ghost",
  wolf: "wolf",
  plant: "plant",
  wizard: "wizard",
  insect: "insect",
  core: "core",
  leafbeast: "plant",
  mushroomking: "plant",
  waterfairy: "fairy",
  sunbird: "bird",
  treant: "plant",
  forestgolem: "golem",
  wordsprite: "book",
  harborguard: "armor",
  merchantbeast: "beast",
  windbird: "bird",
  anchorgolem: "golem",
  lighthouseghost: "ghost",
  stormbeast: "beast",
  seadrake: "dragon",
  phrasebook: "book",
  stoneguard: "golem",
  runecore: "core",
  sandserpent: "serpent",
  shadowpriest: "priest",
  loremage: "wizard",
  tombwraith: "ghost",
  pharaohlord: "demon",
  sunpriest: "priest",
  wordrelic: "relic",
  scrollking: "book",
  silverwarden: "armor",
  cloudbeast: "beast",
  bridgeknight: "knight",
  towermage: "wizard",
  starseer: "wizard",
  thundermage: "wizard",
  lightpriest: "priest",
  skyknight: "knight",
  dragonpriest: "priest",
  starguardian: "cosmic",
  skydragon: "dragon",
  starspirit: "spirit",
  timekeeper: "clock",
  memorysage: "book",
  frontierdragon: "dragon",
  oraclesprite: "cosmic",
  mooncaster: "wizard",
  cosmicpriest: "cosmic",
} satisfies Record<Boss["shape"], BossShapeGroup>;

const BOSS_SHAPE_CLASSES: Partial<Record<BossShapeGroup, string>> = {
  dragon: styles.bossSpriteDragon,
  golem: styles.bossSpriteGolem,
  slime: styles.bossSpriteSlime,
  ghost: styles.bossSpriteGhost,
  wolf: styles.bossSpriteWolf,
  plant: styles.bossSpritePlant,
  wizard: styles.bossSpriteWizard,
  insect: styles.bossSpriteInsect,
  core: styles.bossSpriteCore,
  fairy: styles.bossSpriteInsect,
  bird: styles.bossSpriteInsect,
  book: styles.bossSpriteWizard,
  armor: styles.bossSpriteGolem,
  beast: styles.bossSpriteWolf,
  serpent: styles.bossSpriteWolf,
  priest: styles.bossSpriteWizard,
  knight: styles.bossSpriteGolem,
  cosmic: styles.bossSpriteCore,
  spirit: styles.bossSpriteCore,
  clock: styles.bossSpriteCore,
  relic: styles.bossSpriteGolem,
};

function getBossShapeClass(shape: Boss["shape"]) {
  const shapeGroup = shapeGroupMap[shape] ?? fallbackShapeGroup;
  return BOSS_SHAPE_CLASSES[shapeGroup];
}

function BattleArea({
  answerEffect,
  background,
  boss,
  bossHp,
  buddyCard,
  heroLevel,
  playerHp,
  questMode,
}: {
  answerEffect: AnswerEffect | null;
  background: QuestBackgroundConfig;
  boss: Boss;
  bossHp: number;
  buddyCard: MonsterCard | null;
  heroLevel: number;
  playerHp: number;
  questMode: QuestMode;
}) {
  const bossStyle = { "--boss-accent": boss.accent } as CSSProperties;
  const backgroundStyle = getQuestBackgroundStyle(background, questMode);
  const isBossBackdrop = questMode === "boss" || questMode === "complete";
  const heroStyle = getHeroLevelStyle(heroLevel) as CSSProperties;
  const bossDisplayName = parseBossDisplayName(boss.name);

  return (
    <section
      className={cx(styles.battleArea, isBossBackdrop && styles.bossBattleBackdrop)}
      style={backgroundStyle}
      aria-label="ボスバトル"
    >
      <div className={styles.castleBack} aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <div className={styles.hpLayer}>
        <HpMeter label="勇者HP" value={playerHp} />
        <HpMeter label="ボスHP" value={bossHp} />
      </div>

      <div className={styles.combatants}>
        <div
          className={cx(
            styles.playerUnit,
            answerEffect?.type === "correct" && styles.playerAttack,
            answerEffect?.type === "wrong" && styles.unitHit
          )}
        >
          <div className={styles.playerSpriteGroup}>
            {buddyCard && (
              <span
                className={cx(
                  styles.playerCompanionEmoji,
                  answerEffect?.type === "correct" && styles.playerCompanionCheer
                )}
                aria-hidden="true"
              >
                {buddyCard.monsterEmoji}
              </span>
            )}
            <div className={styles.playerSprite} style={heroStyle} aria-hidden="true">
              <span className={styles.playerCape} />
              <span className={styles.playerHead} />
              <span className={styles.playerBody} />
              <span className={styles.playerShield} />
              <span className={styles.playerBlade} />
            </div>
          </div>
          {answerEffect?.type === "wrong" && (
            <span className={cx(styles.unitDamageTag, styles.unitDamageTagHero)}>
              MISS! -{answerEffect.damageAmount}
            </span>
          )}
          <div className={styles.unitNameBlock}>
            <strong>勇者</strong>
            <span>フロンティアの冒険者</span>
          </div>
        </div>

        <div
          className={cx(
            styles.bossUnit,
            answerEffect?.type === "correct" && styles.unitHit,
            answerEffect?.bossDefeated && styles.unitDefeated
          )}
          style={bossStyle}
        >
          <div className={cx(styles.bossSprite, getBossShapeClass(boss.shape))} aria-hidden="true">
            <span className={styles.bossGlow} />
            <span className={styles.bossWingLeft} />
            <span className={styles.bossWingRight} />
            <span className={styles.bossTail} />
            <span className={styles.bossNeck} />
            <span className={styles.bossHornLeft} />
            <span className={styles.bossHornRight} />
            <span className={styles.bossExtraLeft} />
            <span className={styles.bossExtraRight} />
            <span className={styles.bossBody} />
            <span className={styles.bossEyeLeft} />
            <span className={styles.bossEyeRight} />
            <span className={styles.bossMouth} />
            <span className={styles.bossCore} />
            <span className={styles.bossBase} />
          </div>
          {answerEffect?.type === "correct" && (
            <span className={cx(styles.unitDamageTag, styles.unitDamageTagBoss)}>
              HIT! -{answerEffect.damageAmount}
            </span>
          )}
          <div className={styles.unitNameBlock}>
            <strong>{bossDisplayName.personalName}</strong>
            {bossDisplayName.rank && <span>{bossDisplayName.rank}</span>}
          </div>
        </div>
      </div>

      {answerEffect && (
        <div
          className={cx(
            styles.damageCallout,
            answerEffect.type === "wrong" && styles.damageCalloutWrong
          )}
          aria-live="polite"
        >
          <strong>
            {answerEffect.bossDefeated
              ? "撃破！"
              : answerEffect.type === "correct"
                ? "ボスにダメージ！"
                : "勇者にダメージ！"}
          </strong>
          <span>
            {answerEffect.type === "correct"
              ? getCorrectFeedback(answerEffect)
              : `正解: ${answerEffect.correctAnswer}`}
          </span>
        </div>
      )}

      <div className={styles.bossNameplate}>
        現在地：{boss.stage}
      </div>
    </section>
  );
}

function getCorrectFeedback(answerEffect: AnswerEffect) {
  return answerEffect.word;
}

function HpMeter({ label, value }: { label: string; value: number }) {
  return (
    <div className={styles.hpMeter}>
      <div className={styles.hpLabel}>
        <span>{label}</span>
        <strong>{Math.round(value)} / 100</strong>
      </div>
      <div className={styles.hpTrack} aria-hidden="true">
        <div className={styles.hpFill} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function QuestionArea({
  choices,
  currentQuestion,
  currentQuestionNumber,
  furiganaEnabled,
  onAnswer,
  selectedAnswer,
  totalQuestions,
}: {
  choices: string[];
  currentQuestion: LearningWord;
  currentQuestionNumber: number;
  furiganaEnabled: boolean;
  onAnswer: (choice: string) => void;
  selectedAnswer: string | null;
  totalQuestions: number;
}) {
  return (
    <section className={styles.questionPanel} aria-label="クイズ問題">
      <div className={styles.questionTopline}>
        <div className={styles.questionMeta}>
          <span>第{currentQuestionNumber}問 / 全{totalQuestions}問</span>
          <span>{currentQuestion.level}</span>
        </div>
        <SpeechButton
          text={currentQuestion.word}
          label="単語を聞く"
          title={`${currentQuestion.word} を読み上げる`}
        />
      </div>

      <div className={styles.questionText}>
        <h2>{currentQuestion.word}</h2>
        <p>の意味は？</p>
      </div>

      <AnswerChoices
        choices={choices}
        currentQuestion={currentQuestion}
        furiganaEnabled={furiganaEnabled}
        onAnswer={onAnswer}
        selectedAnswer={selectedAnswer}
      />
    </section>
  );
}

function AnswerChoices({
  choices,
  currentQuestion,
  furiganaEnabled,
  onAnswer,
  selectedAnswer,
}: {
  choices: string[];
  currentQuestion: LearningWord;
  furiganaEnabled: boolean;
  onAnswer: (choice: string) => void;
  selectedAnswer: string | null;
}) {
  return (
    <div className={styles.answerGrid}>
      {choices.map((choice) => {
        const isSelected = selectedAnswer === choice;
        const isCorrectChoice = choice === currentQuestion.meaning;
        const hasAnswered = selectedAnswer !== null;
        const reading = getChoiceReading(currentQuestion, choice);

        const className = cx(
          styles.answerButton,
          hasAnswered && isCorrectChoice && styles.answerCorrect,
          hasAnswered && isSelected && !isCorrectChoice && styles.answerWrong,
          hasAnswered && !isSelected && !isCorrectChoice && styles.answerMuted
        );

        return (
          <button
            key={choice}
            type="button"
            onClick={() => onAnswer(choice)}
            disabled={hasAnswered}
            className={className}
          >
            {choice}
            {furiganaEnabled && reading && (
              <span className={styles.choiceReading}>{reading}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function QuestResultScreen({
  activeContentType,
  activeDungeonName,
  activeWorldName,
  canReview,
  clearCorrectCount,
  correctCount,
  currentGoldBalance,
  gameStatus,
  goldRewardResult,
  heroStatusAfter,
  heroStatusBefore,
  isFirstClear,
  mistakeCount,
  onBackToSelect,
  onRestart,
  onReview,
  partClearReward,
  questTitle,
  scoreRate,
  buddyQuestExpResult,
  totalGoldEarned,
  totalHeroExpGained,
  totalHeroLevelUpCount,
  totalQuestions,
  wrongAnswers,
}: {
  activeContentType: string;
  activeDungeonName: string;
  activeWorldName: string;
  canReview: boolean;
  clearCorrectCount: number;
  correctCount: number;
  currentGoldBalance: number;
  gameStatus: GameStatus;
  goldRewardResult: GoldRewardResult | null;
  heroStatusAfter: HeroStatus | null;
  heroStatusBefore: HeroStatus | null;
  isFirstClear: boolean;
  mistakeCount: number;
  onBackToSelect: () => void;
  onRestart: () => void;
  onReview: () => void;
  partClearReward?: PartClearReward;
  questTitle: string;
  scoreRate: number;
  buddyQuestExpResult: BuddyQuestExpResult | null;
  totalGoldEarned: number;
  totalHeroExpGained: number;
  totalHeroLevelUpCount: number;
  totalQuestions: number;
  wrongAnswers: AnswerRecord[];
}) {
  const isPerfectClear =
    gameStatus === "clear" && correctCount === totalQuestions && mistakeCount === 0;
  const resultHeadline =
    gameStatus === "clear" ? "クエストクリア！" : "クエスト失敗";
  const resultMessage = getScoreMessage(
    gameStatus,
    correctCount,
    totalQuestions,
    clearCorrectCount,
    isPerfectClear
  );
  const heroExpProgress = heroStatusAfter
    ? getHeroExpProgress(heroStatusAfter)
    : null;
  const heroLeveledUp =
    heroStatusBefore && heroStatusAfter
      ? heroStatusAfter.level > heroStatusBefore.level
      : totalHeroLevelUpCount > 0;
  const heroLevelBefore = heroStatusBefore?.level ?? heroStatusAfter?.level ?? 1;
  const heroLevelAfter = heroStatusAfter?.level ?? heroLevelBefore;
  const mistakePreview = wrongAnswers.slice(0, 5);
  const hiddenMistakeCount = Math.max(0, wrongAnswers.length - mistakePreview.length);
  const buddyAlreadyMax =
    Boolean(buddyQuestExpResult?.before.isMaxLevel) &&
    Boolean(buddyQuestExpResult?.after.isMaxLevel) &&
    (buddyQuestExpResult?.gainedExp ?? 0) === 0;
  const buddyReachedMax =
    Boolean(buddyQuestExpResult) &&
    !buddyQuestExpResult?.before.isMaxLevel &&
    Boolean(buddyQuestExpResult?.after.isMaxLevel);
  const buddyLevelText = buddyQuestExpResult
    ? buddyQuestExpResult.leveledUp
      ? `Lv${buddyQuestExpResult.before.level} → Lv${buddyQuestExpResult.after.level}${
          buddyQuestExpResult.after.isMaxLevel ? " MAX" : ""
        }`
      : `Lv${buddyQuestExpResult.after.level}${
          buddyQuestExpResult.after.isMaxLevel ? " MAX" : ""
        }`
    : "";

  return (
    <main className={styles.root}>
      <section className={cx(styles.screen, styles.resultScreen)}>
        <QuestHeader />

        <section
          className={cx(
            styles.resultPanel,
            gameStatus === "clear" && !isPerfectClear && styles.resultClear,
            gameStatus === "clear" && isPerfectClear && styles.resultPerfect,
            gameStatus === "clear" && Boolean(partClearReward) && styles.resultPartClear,
            gameStatus !== "clear" && styles.resultGameOver
          )}
        >
          <div className={styles.resultHeroArea}>
            <p className={styles.resultKicker}>
              {isPerfectClear
                ? "PERFECT CLEAR"
                : gameStatus === "clear"
                  ? "QUEST CLEAR"
                  : "QUEST FAILED"}
            </p>
            <h1 className={styles.resultTitle}>{resultHeadline}</h1>
            <p className={styles.resultQuestName}>{questTitle}</p>
            <p className={styles.resultMessage}>{resultMessage}</p>

            {(activeWorldName || activeDungeonName || activeContentType) && (
              <div className={styles.resultQuestMeta}>
                {activeWorldName && <span>{activeWorldName}</span>}
                {activeDungeonName && <span>{activeDungeonName}</span>}
                {activeContentType && <span>{activeContentType}</span>}
              </div>
            )}
          </div>

          {partClearReward && (
            <div className={styles.partClearStory}>
              <strong>{partClearReward.title}</strong>
              <p>{partClearReward.message}</p>
              <p>{partClearReward.epilogue}</p>
              <div className={styles.partClearRewards} aria-label="クリア報酬">
                {partClearReward.rewards.map((reward) => (
                  <span key={`${reward.kind}-${reward.label}`}>
                    {reward.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          <section className={styles.resultSummaryCard}>
            <div className={styles.resultSummaryHeader}>
              <span>結果サマリー</span>
              {isFirstClear && gameStatus === "clear" && <strong>初クリア</strong>}
              {isPerfectClear && <strong>パーフェクト</strong>}
            </div>
            <div className={styles.resultSummaryGrid}>
              <div className={styles.resultSummaryItem}>
                <span>正解</span>
                <strong>{correctCount} / {totalQuestions}</strong>
              </div>
              <div className={styles.resultSummaryItem}>
                <span>正答率</span>
                <strong>{scoreRate}%</strong>
              </div>
              <div className={cx(styles.resultSummaryItem, styles.resultSummaryExp)}>
                <span>獲得経験値</span>
                <strong>+{totalHeroExpGained}EXP</strong>
              </div>
              <div className={cx(styles.resultSummaryItem, styles.resultSummaryGold)}>
                <span>獲得ゴールド</span>
                <strong>+{totalGoldEarned}G</strong>
              </div>
            </div>
          </section>

          <div className={styles.resultDetailGrid}>
            {goldRewardResult && (
              <section className={cx(styles.resultDetailCard, styles.resultGoldCard)}>
                <span className={styles.resultSectionLabel}>ゴールド報酬</span>
                <dl className={styles.resultRewardRows}>
                  <div>
                    <dt>基本報酬</dt>
                    <dd>{goldRewardResult.baseGold}G</dd>
                  </div>
                  <div>
                    <dt>主人公Lvボーナス</dt>
                    <dd>{formatBonusRate(goldRewardResult.heroBonusRate)}</dd>
                  </div>
                  {goldRewardResult.partnerLevelBonusRate !== null && (
                    <div>
                      <dt>相棒Lvボーナス</dt>
                      <dd>
                        {formatBonusRate(goldRewardResult.partnerLevelBonusRate)}
                        {goldRewardResult.partnerLevel === 20
                          ? " MAX"
                          : goldRewardResult.partnerLevel
                            ? ` Lv${goldRewardResult.partnerLevel}`
                            : ""}
                      </dd>
                    </div>
                  )}
                  {goldRewardResult.partnerRarityBonusRate !== null && (
                    <div>
                      <dt>相棒レア度ボーナス</dt>
                      <dd>
                        {formatBonusRate(goldRewardResult.partnerRarityBonusRate)}
                        {goldRewardResult.partnerRarity
                          ? ` ${goldRewardResult.partnerRarity}`
                          : ""}
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt>合計ボーナス</dt>
                    <dd>{formatBonusRate(goldRewardResult.totalBonusRate)}</dd>
                  </div>
                  <div>
                    <dt>最終獲得</dt>
                    <dd>{goldRewardResult.finalGold}G</dd>
                  </div>
                  <div>
                    <dt>所持ゴールド</dt>
                    <dd>{currentGoldBalance}G</dd>
                  </div>
                </dl>
              </section>
            )}

            {heroStatusAfter && (
              <section className={cx(styles.resultDetailCard, styles.resultHeroCard)}>
                <span className={styles.resultSectionLabel}>主人公</span>
                <h3>{heroStatusAfter.title}</h3>
                <strong>Lv{heroLevelAfter}</strong>
                <p>
                  {heroExpProgress?.isMaxLevel
                    ? "MAX"
                    : `次のLvまで ${
                        (heroExpProgress?.requiredExp ?? 0) -
                        (heroExpProgress?.currentExp ?? 0)
                      }EXP`}
                </p>
                {heroLeveledUp && (
                  <div className={styles.resultLevelNotice}>
                    主人公レベルが Lv{heroLevelBefore} → Lv{heroLevelAfter} に上がった！
                  </div>
                )}
                {goldRewardResult?.heroBonusRateChanged && (
                  <div className={styles.resultGoldBonusNotice}>
                    ゴールド獲得ボーナスが{" "}
                    {formatBonusRate(goldRewardResult.heroBonusRateBefore)} →{" "}
                    {formatBonusRate(goldRewardResult.heroBonusRateAfter)} にアップ！
                  </div>
                )}
              </section>
            )}

            {buddyQuestExpResult && (
              <section className={cx(styles.resultDetailCard, styles.resultBuddyCard)}>
                <span className={styles.resultSectionLabel}>
                  {buddyAlreadyMax
                    ? "相棒レベルは最大です"
                    : buddyQuestExpResult.leveledUp || buddyReachedMax
                      ? "相棒モンスター成長！"
                      : "相棒モンスター経験値"}
                </span>
                <h3>{buddyQuestExpResult.card.name}</h3>
                <strong>{buddyLevelText}</strong>
                {!buddyAlreadyMax && (
                  <p>EXP +{buddyQuestExpResult.gainedExp}</p>
                )}
                <div className={styles.resultBuddyStatus}>
                  {buddyReachedMax
                    ? "相棒レベルが最大になりました！"
                    : buddyQuestExpResult.after.isMaxLevel
                      ? "相棒レベルは最大です"
                      : `次のLvまで ${buddyQuestExpResult.after.remainingExp}EXP`}
                </div>
              </section>
            )}

            <section className={cx(styles.resultDetailCard, styles.resultMistakeCard)}>
              <span className={styles.resultSectionLabel}>ミスした単語</span>
              {wrongAnswers.length > 0 ? (
                <>
                  <div className={styles.reviewList}>
                    {mistakePreview.map((record, index) => (
                      <div key={`${record.word}-${index}`} className={styles.reviewItem}>
                        <strong>{record.word}</strong>
                        <span>正解: {record.meaning}</span>
                        <span>選択: {record.selectedAnswer}</span>
                      </div>
                    ))}
                  </div>
                  {hiddenMistakeCount > 0 && (
                    <p className={styles.resultMistakeHint}>
                      ほか {hiddenMistakeCount} 件は「ミスだけ復習」で確認できます。
                    </p>
                  )}
                </>
              ) : (
                <p className={styles.resultNoMistakes}>
                  ミスした単語はありません。すばらしい集中力です！
                </p>
              )}
            </section>
          </div>

          <div className={styles.resultActions}>
            <button
              type="button"
              onClick={onRestart}
              className={cx(styles.resultAction, styles.resultPrimaryAction)}
            >
              もう一度
            </button>
            <button
              type="button"
              onClick={onBackToSelect}
              className={styles.resultAction}
            >
              クエスト選択へ
            </button>
            <Link href="/" className={styles.resultAction}>
              ホーム
            </Link>
            <Link href="/shop" className={styles.resultAction}>
              ショップ
            </Link>
            <Link href="/pack" className={styles.resultAction}>
              パック購入
            </Link>
            {canReview && (
              <button
                type="button"
                onClick={onReview}
                className={cx(styles.resultAction, styles.resultReviewAction)}
              >
                ミスだけ復習
              </button>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
