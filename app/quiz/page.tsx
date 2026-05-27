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
import Image from "next/image";
import Link from "next/link";
import SpeechButton from "../components/SpeechButton";
import PageTopBar from "../components/PageTopBar";
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
  getQuestWorldBackgroundImage,
  questModeConfigList,
  type BossConfig as Boss,
  type EikenLevelId,
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
  calcTotalEffects,
  EquipEffects,
  getSelectedMonsterCard,
  loadEquipState,
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
  completeChallengeContinues?: boolean;
  bossAlreadyDefeated?: boolean;
  heroExpGained?: number;
  heroLevelBefore?: number;
  heroLevelAfter?: number;
  heroLeveledUp?: boolean;
  goldEarned?: number;
  isCritical?: boolean;
  healAmount?: number;
};

type GameStatus = "playing" | "clear" | "gameOver";
type GameOverReason = "heroHpZero" | "bossSurvived" | null;

type BlockProgress = {
  miniCleared: boolean;
  normalCleared: boolean;
  bossCleared: boolean;
  completeCleared: boolean;
  crowned: boolean;
  modeRecords?: Partial<Record<QuestMode, QuestModeRecord>>;
};

type BlockProgressMap = Record<string, BlockProgress>;

type QuestType = "block" | "review" | "challenge";

type QuestModeRecord = {
  clearCount: number;
  bestScoreRate: number;
  bestCorrectCount: number;
  bestTotalQuestions: number;
  bestBossDefeatedQuestion?: number;
  lastClearedAt: string;
  crownedAt?: string;
};

type QuestClearStats = {
  correctCount: number;
  totalQuestions: number;
  bossDefeatedQuestionNumber: number | null;
  clearedAt: string;
};

type BattleStats = {
  heroMaxHp: number;
  heroAttack: number;
  enemyMaxHp: number;
  enemyAttack: number;
};

type BattlePreviewContext = {
  hero: HeroStatus;
  equipEffects: EquipEffects;
  partnerAttack: number;
};

type BattlePreview = {
  estimatedDefeatQuestion: number;
  canDefeatWithinLimit: boolean;
};

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
  speedClearBonus: boolean;
  noMissBonus: boolean;
};

type BuddyQuestExpResult = BuddyExpResult & {
  card: MonsterCard;
};

type QuestStartHandler = (
  sourceWords: LearningWord[],
  title: string,
  config: QuestConfig,
  blockId?: string | null,
  questType?: QuestType,
  dungeonIndexOverride?: number
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

const WORLD_HP_PRESSURE: Record<string, number> = {
  "英検5級": 0.95,
  "英検4級": 1.0,
  "英検3級": 1.08,
  "英検準2級": 1.16,
};

const QUEST_TARGET_DEFEAT_RATE: Record<QuestMode, number> = {
  mini: 0.8,
  normal: 0.72,
  boss: 0.78,
  complete: 0.7,
};

const WORLD_BASE_DAMAGE: Record<string, number> = {
  "英検5級": 18,
  "英検4級": 24,
  "英検3級": 32,
  "英検準2級": 42,
};

const QUEST_DAMAGE_MULT: Record<QuestMode, number> = {
  mini: 0.8,
  normal: 1.0,
  boss: 1.2,
  complete: 1.35,
};

const CRITICAL_MULTIPLIER = 1.5;
const DUNGEON_PROGRESS_STEP = 0.12;
const DUNGEON_HP_PRESSURE_STEP = 0.015;
const BONUS_ATTACK_HP_SCALING = 0.65;
const HEAL_RATE_NORMAL = 0.05;
const HEAL_RATE_COMPLETE = 0.04;

const QUEST_MODES: QuestMode[] = ["mini", "normal", "boss", "complete"];

const PARTNER_RARITY_ATK_MULT: Record<MonsterCard["rarity"], number> = {
  N: 1.0,
  R: 1.5,
  SR: 2.0,
  SSR: 2.5,
  UR: 3.0,
  SAR: 3.3,
};

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

type QuestWorldBackgroundStyle = CSSProperties & Record<"--quest-world-bg-image", string>;

function toCssUrl(path: string) {
  return `url("${path.replace(/"/g, '\\"')}")`;
}

function getQuestWorldBackgroundStyle(worldId?: EikenLevelId | null): QuestWorldBackgroundStyle {
  return {
    "--quest-world-bg-image": toCssUrl(getQuestWorldBackgroundImage(worldId)),
  };
}

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

function createChoices(currentWord: LearningWord, avoidPosition?: number): string[] {
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

  const shuffled = shuffleArray([currentWord.meaning, ...wrongChoices]);

  if (avoidPosition !== undefined && shuffled.length > 1) {
    const correctPos = shuffled.indexOf(currentWord.meaning);
    if (correctPos === avoidPosition) {
      const swapPos = (avoidPosition + 1 + Math.floor(Math.random() * (shuffled.length - 1))) % shuffled.length;
      [shuffled[correctPos], shuffled[swapPos]] = [shuffled[swapPos], shuffled[correctPos]];
    }
  }

  return shuffled;
}

function createEmptyBlockProgress(): BlockProgress {
  return {
    miniCleared: false,
    normalCleared: false,
    bossCleared: false,
    completeCleared: false,
    crowned: false,
    modeRecords: {},
  };
}

function getDungeonIndex(blockId: string | null, level: string | null) {
  if (!blockId || !level) return 0;

  return Math.max(
    0,
    wordGroupsByLevel[level]?.findIndex((group) => group.id === blockId) ?? 0
  );
}

function getPartnerAttackBonus(
  monsterCard: MonsterCard | null,
  earnedCard: EarnedCard | null
) {
  if (!monsterCard || !earnedCard) return 0;

  const monsterProgress = getMonsterLevelProgress(earnedCard.exp);
  const rarityMultiplier = PARTNER_RARITY_ATK_MULT[monsterCard.rarity] ?? 1.0;

  return Math.round(monsterProgress.level * 2 * rarityMultiplier);
}

function calculateBattleStats({
  hero,
  equipEffects,
  partnerAttack,
  level,
  mode,
  dungeonIndex,
  questionCount,
}: {
  hero: HeroStatus;
  equipEffects: EquipEffects;
  partnerAttack: number;
  level: string | null;
  mode: QuestMode;
  dungeonIndex: number;
  questionCount: number;
}): BattleStats {
  const heroBaseMaxHp = 100 + hero.level * 12;
  const heroBaseAttack = 25 + hero.level * 3;
  const bonusAttack = (equipEffects.attack ?? 0) + partnerAttack;
  const heroMaxHp = heroBaseMaxHp + (equipEffects.hp ?? 0);
  const heroAttack = heroBaseAttack + bonusAttack;

  const worldHpPressure = WORLD_HP_PRESSURE[level ?? ""] ?? 1.0;
  const questTargetRate = QUEST_TARGET_DEFEAT_RATE[mode] ?? 0.72;
  const dungeonHpPressure = 1 + dungeonIndex * DUNGEON_HP_PRESSURE_STEP;
  const scaledAttackForBossHp =
    heroBaseAttack + Math.round(bonusAttack * BONUS_ATTACK_HP_SCALING);
  const targetCorrectAnswers = Math.max(
    1,
    questionCount * questTargetRate * worldHpPressure * dungeonHpPressure
  );
  const enemyMaxHp = Math.floor(
    scaledAttackForBossHp * targetCorrectAnswers
  );
  const worldBaseDamage = WORLD_BASE_DAMAGE[level ?? ""] ?? 18;
  const questDamageMultiplier = QUEST_DAMAGE_MULT[mode];
  const dungeonDamageMultiplier = 1 + dungeonIndex * DUNGEON_PROGRESS_STEP;
  const enemyAttack = Math.floor(
    worldBaseDamage * questDamageMultiplier * dungeonDamageMultiplier
  );

  return {
    heroMaxHp,
    heroAttack,
    enemyMaxHp,
    enemyAttack,
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

const QUEST_MODE_BATTLE_LABELS: Record<QuestMode, string> = {
  mini: "ショートバトル",
  normal: "スタンダードバトル",
  boss: "ヘビーバトル",
  complete: "完全制覇",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeNonNegativeInt(value: unknown, fallback = 0) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue)
    ? Math.max(0, Math.floor(numericValue))
    : fallback;
}

function normalizePercent(value: unknown) {
  return Math.min(100, normalizeNonNegativeInt(value));
}

function normalizeOptionalPositiveInt(value: unknown) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue) || numericValue <= 0) return undefined;

  return Math.floor(numericValue);
}

function normalizeOptionalString(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function normalizeQuestModeRecord(value: unknown): QuestModeRecord | undefined {
  if (!isRecord(value)) return undefined;

  const clearCount = normalizeNonNegativeInt(value.clearCount);
  const bestScoreRate = normalizePercent(value.bestScoreRate);
  const bestCorrectCount = normalizeNonNegativeInt(value.bestCorrectCount);
  const bestTotalQuestions = Math.max(
    1,
    bestCorrectCount,
    normalizeNonNegativeInt(value.bestTotalQuestions)
  );
  const bestBossDefeatedQuestion = normalizeOptionalPositiveInt(
    value.bestBossDefeatedQuestion
  );
  const crownedAt = normalizeOptionalString(value.crownedAt);

  if (
    clearCount === 0 &&
    bestScoreRate === 0 &&
    bestCorrectCount === 0 &&
    bestBossDefeatedQuestion === undefined &&
    crownedAt === undefined
  ) {
    return undefined;
  }

  return {
    clearCount,
    bestScoreRate,
    bestCorrectCount,
    bestTotalQuestions,
    ...(bestBossDefeatedQuestion !== undefined
      ? { bestBossDefeatedQuestion }
      : {}),
    lastClearedAt:
      typeof value.lastClearedAt === "string" ? value.lastClearedAt : "",
    ...(crownedAt ? { crownedAt } : {}),
  };
}

function normalizeBlockProgress(value: unknown): BlockProgress {
  const emptyProgress = createEmptyBlockProgress();
  const rawProgress = isRecord(value) ? value : {};
  const rawModeRecords = isRecord(rawProgress.modeRecords)
    ? rawProgress.modeRecords
    : {};
  const modeRecords: Partial<Record<QuestMode, QuestModeRecord>> = {};

  for (const mode of QUEST_MODES) {
    const modeRecord = normalizeQuestModeRecord(rawModeRecords[mode]);
    if (modeRecord) modeRecords[mode] = modeRecord;
  }

  return {
    ...emptyProgress,
    miniCleared: rawProgress.miniCleared === true,
    normalCleared: rawProgress.normalCleared === true,
    bossCleared: rawProgress.bossCleared === true,
    completeCleared: rawProgress.completeCleared === true,
    crowned: rawProgress.crowned === true,
    modeRecords,
  };
}

function normalizeQuestProgress(value: unknown): BlockProgressMap {
  if (!isRecord(value)) return {};

  const progress: BlockProgressMap = {};

  for (const [blockId, rawProgress] of Object.entries(value)) {
    const normalizedProgress = normalizeBlockProgress(rawProgress);
    const hasAnyClear =
      normalizedProgress.miniCleared ||
      normalizedProgress.normalCleared ||
      normalizedProgress.bossCleared ||
      normalizedProgress.completeCleared ||
      normalizedProgress.crowned;
    const hasAnyRecord =
      Object.keys(normalizedProgress.modeRecords ?? {}).length > 0;

    if (hasAnyClear || hasAnyRecord) {
      progress[blockId] = normalizedProgress;
    }
  }

  return progress;
}

function loadQuestProgress(): BlockProgressMap {
  try {
    const stored = localStorage.getItem(QUEST_PROGRESS_STORAGE_KEY);
    if (!stored) return {};

    return normalizeQuestProgress(JSON.parse(stored));
  } catch {
    return {};
  }
}

function saveQuestProgress(progress: BlockProgressMap) {
  try {
    localStorage.setItem(
      QUEST_PROGRESS_STORAGE_KEY,
      JSON.stringify(normalizeQuestProgress(progress))
    );
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

function loadBattlePreviewContext(): BattlePreviewContext {
  const hero = loadHeroStatus();
  const shopState = loadShopState();
  const selectedMonsterCard = getSelectedMonsterCard(shopState);
  const earnedCards = loadEarnedCards();
  const selectedEarnedCard = selectedMonsterCard
    ? earnedCards.find((card) => card.cardId === selectedMonsterCard.id) ?? null
    : null;

  return {
    hero,
    equipEffects: calcTotalEffects(loadEquipState()),
    partnerAttack: getPartnerAttackBonus(
      selectedMonsterCard,
      selectedEarnedCard
    ),
  };
}

function estimateQuestBattlePreview({
  blockId,
  config,
  context,
  level,
}: {
  blockId: string;
  config: QuestConfig;
  context: BattlePreviewContext;
  level: string;
}): BattlePreview {
  const battleStats = calculateBattleStats({
    hero: context.hero,
    equipEffects: context.equipEffects,
    partnerAttack: context.partnerAttack,
    level,
    mode: config.mode,
    dungeonIndex: getDungeonIndex(blockId, level),
    questionCount: config.questionCount,
  });
  const estimatedDefeatQuestion = Math.max(
    1,
    Math.ceil(battleStats.enemyMaxHp / Math.max(1, battleStats.heroAttack))
  );

  return {
    estimatedDefeatQuestion,
    canDefeatWithinLimit: estimatedDefeatQuestion <= config.questionCount,
  };
}

function saveEarnedCards(cards: EarnedCard[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("earnedCards", JSON.stringify(cards));
}

function getBlockProgress(
  progressMap: BlockProgressMap,
  blockId: string
): BlockProgress {
  return normalizeBlockProgress(progressMap[blockId]);
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
  stats: QuestClearStats
): BlockProgress {
  const nextProgress = { ...currentProgress };
  const progressKey = getQuestModeConfig(config.mode).progressKey;
  const currentModeRecord = currentProgress.modeRecords?.[config.mode];
  const scoreRate = Math.round(
    (stats.correctCount / stats.totalQuestions) * 100
  );
  const bestScoreRate = Math.max(
    currentModeRecord?.bestScoreRate ?? 0,
    scoreRate
  );
  const bestBossDefeatedQuestion =
    stats.bossDefeatedQuestionNumber === null
      ? currentModeRecord?.bestBossDefeatedQuestion
      : currentModeRecord?.bestBossDefeatedQuestion === undefined
        ? stats.bossDefeatedQuestionNumber
        : Math.min(
            currentModeRecord.bestBossDefeatedQuestion,
            stats.bossDefeatedQuestionNumber
          );
  const earnedCrown =
    config.mode === "complete" && stats.correctCount === stats.totalQuestions;

  nextProgress[progressKey] = true;
  if (earnedCrown) nextProgress.crowned = true;
  nextProgress.modeRecords = {
    ...(currentProgress.modeRecords ?? {}),
    [config.mode]: {
      clearCount: (currentModeRecord?.clearCount ?? 0) + 1,
      bestScoreRate,
      bestCorrectCount: Math.max(
        currentModeRecord?.bestCorrectCount ?? 0,
        stats.correctCount
      ),
      bestTotalQuestions: Math.max(
        currentModeRecord?.bestTotalQuestions ?? 0,
        stats.totalQuestions
      ),
      ...(bestBossDefeatedQuestion !== undefined
        ? { bestBossDefeatedQuestion }
        : {}),
      lastClearedAt: stats.clearedAt,
      ...(currentModeRecord?.crownedAt || earnedCrown
        ? { crownedAt: currentModeRecord?.crownedAt ?? stats.clearedAt }
        : {}),
    },
  };

  return nextProgress;
}


function getScoreMessage(
  gameStatus: GameStatus,
  questMode: QuestMode,
  correctCount: number,
  answeredQuestionCount: number,
  isPerfectClear = false,
  gameOverReason: GameOverReason = null,
  bossDefeatedQuestionNumber: number | null = null
) {
  if (gameStatus === "clear" && questMode === "complete" && isPerfectClear) {
    return "完全制覇！全問正解で王冠を獲得しました。";
  }

  if (gameStatus === "clear" && questMode === "complete") {
    return `ボスを倒し、最後まで走り切りました。${correctCount} / ${answeredQuestionCount}問正解です。`;
  }

  if (gameStatus === "clear") {
    return bossDefeatedQuestionNumber
      ? `ボスを倒しました！${bossDefeatedQuestionNumber}問目で撃破です。`
      : `ボスを倒しました！回答した${answeredQuestionCount}問でクリアです。`;
  }

  if (gameOverReason === "heroHpZero") {
    return "勇者のHPが0になりました。ミスした単語を復習して、もう一度挑戦しましょう。";
  }

  return "挑戦上限までにボスを倒せませんでした。攻撃力を上げるか、正解数を増やして再挑戦しましょう。";
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
  const [lastCorrectPosition, setLastCorrectPosition] = useState<number | null>(null);
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
  const [initialQuestionCount, setInitialQuestionCount] = useState(0);
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
  const [heroMaxHp, setHeroMaxHp] = useState(100);
  const [enemyMaxHp, setEnemyMaxHp] = useState(100);
  const [heroAttackPower, setHeroAttackPower] = useState(25);
  const [enemyAttackPower, setEnemyAttackPower] = useState(18);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [, setBattleLog] = useState<string[]>([]);
  const [activeEquipEffects, setActiveEquipEffects] = useState<EquipEffects>({});
  const [bossDefeatedQuestionNumber, setBossDefeatedQuestionNumber] =
    useState<number | null>(null);
  const [gameOverReason, setGameOverReason] = useState<GameOverReason>(null);
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

  const correctCount = useMemo(() => {
    return answerRecords.filter((record) => record.isCorrect).length;
  }, [answerRecords]);

  const wrongAnswers = useMemo(() => {
    return answerRecords.filter((record) => !record.isCorrect);
  }, [answerRecords]);

  const mistakeCount = wrongAnswers.length;
  const currentBoss = activeBoss;
  const currentQuestionNumber = Math.min(currentIndex + 1, totalQuestions);
  const answeredQuestionCount = answerRecords.length;
  const resultQuestionCount =
    gameStatus === "playing"
      ? totalQuestions
      : Math.max(1, answeredQuestionCount);
  const scoreRate = Math.round((correctCount / resultQuestionCount) * 100);
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
  const activeWorldId = activeQuestBlock?.levelId ?? activeQuestWorld?.id ?? null;
  const toggleFurigana = () => {
    setStoredFuriganaEnabled(!furiganaEnabled);
  };

  const recordQuestClear = useCallback(
    (
      blockId: string | null,
      config: QuestConfig,
      stats: Omit<QuestClearStats, "clearedAt">
    ) => {
      if (!blockId) return;

      setQuestProgress((prev) => {
        const currentProgress = getBlockProgress(prev, blockId);
        const clearStats: QuestClearStats = {
          ...stats,
          clearedAt: new Date().toISOString(),
        };
        const nextProgress = {
          ...prev,
          [blockId]: updateBlockProgressAfterClear(
            currentProgress,
            config,
            clearStats
          ),
        };

        saveQuestProgress(nextProgress);
        return nextProgress;
      });
    },
    []
  );

  const startQuest = useCallback<QuestStartHandler>(
    (sourceWords, title, config, blockId = null, type = "block", dungeonIndexOverride) => {
      const nextConfig = normalizeQuestConfig(config, sourceWords.length);
      const nextQuestions = createRandomQuestions(
        sourceWords,
        nextConfig.questionCount
      );
      const dominantLevel = getDominantLevel(sourceWords);

      // Compute hero battle stats from fresh localStorage
      const freshHero = loadHeroStatus();
      const freshShop = loadShopState();

      // Compute partner attack bonus
      const freshCards = loadEarnedCards();
      const freshMonsterCard = getSelectedMonsterCard(freshShop);
      const freshEarnedCard = freshMonsterCard
        ? freshCards.find((c) => c.cardId === freshMonsterCard.id) ?? null
        : null;
      const partnerAttack = getPartnerAttackBonus(
        freshMonsterCard,
        freshEarnedCard
      );

      // Compute enemy stats
      const freshEquipEffects = calcTotalEffects(loadEquipState());
      const battleStats = calculateBattleStats({
        hero: freshHero,
        equipEffects: freshEquipEffects,
        partnerAttack,
        level: dominantLevel,
        mode: nextConfig.mode,
        dungeonIndex: dungeonIndexOverride ?? getDungeonIndex(blockId, dominantLevel),
        questionCount: nextQuestions.length,
      });

      setQuestId((prev) => prev + 1);
      setQuestions(nextQuestions);
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setAnswerEffect(null);
      setAnswerRecords([]);
      setHeroExpResults([]);
      setTotalGoldEarned(0);
      setQuestLevelKey(dominantLevel);
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
      setInitialQuestionCount(nextQuestions.length);
      setGameStatus("playing");
      setHeroMaxHp(battleStats.heroMaxHp);
      setEnemyMaxHp(battleStats.enemyMaxHp);
      setHeroAttackPower(battleStats.heroAttack);
      setEnemyAttackPower(battleStats.enemyAttack);
      setBossHp(battleStats.enemyMaxHp);
      setPlayerHp(battleStats.heroMaxHp);
      setHeroLevel(freshHero.level);
      setCurrentStreak(0);
      setBattleLog([]);
      setActiveEquipEffects(freshEquipEffects);
      setBossDefeatedQuestionNumber(null);
      setGameOverReason(null);
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
      const firstChoices = nextQuestions.length > 0 ? createChoices(nextQuestions[0]) : [];
      setChoices(firstChoices);
      setLastCorrectPosition(firstChoices.length > 0 ? firstChoices.indexOf(nextQuestions[0].meaning) : null);
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

    // Streak tracking
    const nextStreak = isCorrect ? currentStreak + 1 : 0;
    const criticalThreshold = Math.max(2, 5 - (activeEquipEffects.criticalRate ?? 0));
    const isCriticalHit = isCorrect && nextStreak > 0 && nextStreak % criticalThreshold === 0;
    const isCompleteMode = activeQuestConfig.mode === "complete";
    const currentQuestionNumberForResult = currentIndex + 1;
    const bossAlreadyDefeated = bossDefeatedQuestionNumber !== null || bossHp <= 0;

    // HP-based damage calculation
    const attackMultiplier = isCriticalHit ? CRITICAL_MULTIPLIER : 1.0;
    const damageToEnemy = isCorrect && !bossAlreadyDefeated
      ? Math.max(1, Math.round(heroAttackPower * attackMultiplier))
      : 0;
    const damageReductionRate = (activeEquipEffects.damageReduction ?? 0) / 100;
    const damageToHero = isCorrect ? 0 : Math.max(1, Math.round(enemyAttackPower * (1 - damageReductionRate)));

    // Heal on 3-streak multiples
    const baseHealRate = isCompleteMode ? HEAL_RATE_COMPLETE : HEAL_RATE_NORMAL;
    const healRate = baseHealRate + (activeEquipEffects.healBonus ?? 0) / 100;
    const healAmount = (isCorrect && nextStreak > 0 && nextStreak % 3 === 0)
      ? Math.round(heroMaxHp * healRate) : 0;

    const nextEnemyHp = Math.max(0, bossHp - damageToEnemy);
    const nextHeroHp = Math.min(heroMaxHp, Math.max(0, playerHp - damageToHero + healAmount));

    const reachedFinalQuestion = currentQuestionNumberForResult >= totalQuestions;
    const enemyDefeatedThisAnswer = !bossAlreadyDefeated && nextEnemyHp <= 0;
    const nextBossDefeatedQuestionNumber =
      bossDefeatedQuestionNumber ??
      (enemyDefeatedThisAnswer ? currentQuestionNumberForResult : null);
    const hasDefeatedBoss = nextBossDefeatedQuestionNumber !== null;
    const heroDied = nextHeroHp <= 0;

    const nextStatus: GameStatus | null = heroDied
      ? "gameOver"
      : isCompleteMode
        ? reachedFinalQuestion
          ? hasDefeatedBoss ? "clear" : "gameOver"
          : null
        : hasDefeatedBoss
          ? "clear"
          : null;
    const nextGameOverReason: GameOverReason =
      nextStatus === "gameOver"
        ? heroDied ? "heroHpZero" : "bossSurvived"
        : null;

    const continueCompleteAfterDefeat =
      isCompleteMode && enemyDefeatedThisAnswer && !reachedFinalQuestion && !heroDied;

    // Battle log — only meaningful entries; no repeated complete-mode noise
    let logEntry = "";
    if (isCorrect) {
      if (continueCompleteAfterDefeat) {
        logEntry = "ボス撃破！残りの問題で王冠を狙おう！";
      } else if (bossAlreadyDefeated) {
        logEntry = healAmount > 0 ? `HP +${healAmount} 回復！` : "";
      } else if (isCriticalHit && healAmount > 0) {
        logEntry = `クリティカル！ボスに${damageToEnemy}ダメージ！HP+${healAmount}回復！`;
      } else if (isCriticalHit) {
        logEntry = `クリティカルヒット！ボスに${damageToEnemy}ダメージ！`;
      } else if (healAmount > 0) {
        logEntry = `ボスに${damageToEnemy}ダメージ！HP+${healAmount}回復！`;
      } else {
        logEntry = `ボスに${damageToEnemy}ダメージ！`;
      }
    } else {
      logEntry = `ミス！勇者が${damageToHero}ダメージを受けた…`;
    }
    const nextBattleLog = logEntry ? [logEntry] : [];

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
      const currentHero =
        heroExpResults.length > 0
          ? heroExpResults[heroExpResults.length - 1].after
          : loadHeroStatus();
      const baseXpPerCorrect = LEVEL_XP_PER_CORRECT[questLevelKey ?? ""] ?? DEFAULT_XP_PER_CORRECT;
      const xpPerCorrect = Math.round(baseXpPerCorrect * (1 + (activeEquipEffects.expBonus ?? 0) / 100));
      const heroResult = addHeroExp(currentHero, xpPerCorrect);
      latestHeroResult = heroResult;
      nextHeroExpResults = [...heroExpResults, heroResult];
      setHeroExpResults(nextHeroExpResults);
      if (heroResult.leveledUp) setHeroLevel(heroResult.after.level);
    }

    setCurrentStreak(nextStreak);
    setBossHp(nextEnemyHp);
    setPlayerHp(nextHeroHp);
    setBattleLog(nextBattleLog);
    setBossDefeatedQuestionNumber(nextBossDefeatedQuestionNumber);
    setAnswerRecords(nextAnswerRecords);
    setAnswerEffect({
      type: isCorrect ? "correct" : "wrong",
      word: currentQuestion.word,
      correctAnswer: currentQuestion.meaning,
      bossDefeated: enemyDefeatedThisAnswer,
      completeChallengeContinues: continueCompleteAfterDefeat,
      bossAlreadyDefeated,
      heroExpGained: latestHeroResult?.gainedExp,
      heroLevelBefore: latestHeroResult?.before.level,
      heroLevelAfter: latestHeroResult?.after.level,
      heroLeveledUp: latestHeroResult?.leveledUp,
      damageAmount: isCorrect ? damageToEnemy : damageToHero,
      isCritical: isCriticalHit,
      healAmount: healAmount > 0 ? healAmount : undefined,
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
          const answeredQuestionCountForResult = currentQuestionNumberForResult;
          const isPerfect =
            nextCorrectCount === answeredQuestionCountForResult &&
            nextMistakeCount === 0;
          const bossDefeatedAt =
            nextBossDefeatedQuestionNumber ?? currentQuestionNumberForResult;
          const speedClearBonus = bossDefeatedAt < initialQuestionCount * 0.7;
          const noMissBonus = nextMistakeCount === 0;
          const baseGold = QUEST_BASE_GOLD[activeQuestConfig.mode];
          const levelMult = LEVEL_GOLD_MULTIPLIER[questLevelKey ?? ""] ?? DEFAULT_GOLD_MULTIPLIER;
          const clearMult = questType === "review" ? 0.5
            : questType === "challenge" ? 0.3
            : isFirstClear ? 1.0
            : 0.3;
          const baseGoldBeforeHeroBonus = Math.floor(
            baseGold * levelMult * clearMult * (isPerfect ? 1.1 : 1.0)
            * (speedClearBonus ? 1.2 : 1.0)
            * (noMissBonus ? 1.2 : 1.0)
          );

          let partnerLevelBonusRate: number | null = null;
          let partnerRarityBonusRate: number | null = null;
          let partnerLevel: number | null = null;
          let partnerRarity: MonsterCard["rarity"] | null = null;

          if (buddyCard) {
            const buddyExpReward = Math.round(getBuddyQuestExpReward(activeQuestConfig.mode) * (1 + (activeEquipEffects.partnerExpBonus ?? 0) / 100));
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
            (partnerRarityBonusRate ?? 0) +
            (activeEquipEffects.goldBonus ?? 0) / 100
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
            speedClearBonus,
            noMissBonus,
          };
          const newBalance = addGold(totalGold);
          setCurrentGoldBalance(newBalance);
          recordQuestClear(activeBlockId, activeQuestConfig, {
            correctCount: nextCorrectCount,
            totalQuestions: answeredQuestionCountForResult,
            bossDefeatedQuestionNumber: nextBossDefeatedQuestionNumber,
          });
        } else {
          setCurrentGoldBalance(loadGold());
        }

        setGameOverReason(nextGameOverReason);
        setQuestIsFirstClear(isFirstClear);
        setTotalGoldEarned(totalGold);
        setGoldRewardResult(nextGoldRewardResult);
        setBuddyQuestExpResult(nextBuddyQuestExpResult);
        setGameStatus(nextStatus);
        return;
      }

      const nextIndex = currentIndex + 1;

      let currentQuestions = questions;
      if (nextIndex >= questions.length) {
        const recentWords = new Set(questions.slice(-activeSourceWords.length).map((q) => q.word));
        const freshPool = activeSourceWords.filter((w) => !recentWords.has(w.word));
        const pool = freshPool.length > 0 ? freshPool : activeSourceWords;
        const additional = createRandomQuestions(pool, pool.length);
        currentQuestions = [...questions, ...additional];
        setQuestions(currentQuestions);
      }

      const nextQuestion = currentQuestions[nextIndex];
      const nextChoices = createChoices(nextQuestion, lastCorrectPosition ?? undefined);
      setCurrentIndex(nextIndex);
      setSelectedAnswer(null);
      setChoices(nextChoices);
      setLastCorrectPosition(nextChoices.indexOf(nextQuestion.meaning));
    }, 1200);
  };

  const questHandlersRef = useRef({ handleAnswer, choices, selectedAnswer, gameStatus, isStarted });

  useEffect(() => {
    questHandlersRef.current = { handleAnswer, choices, selectedAnswer, gameStatus, isStarted };
  });

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT") return;
      const { handleAnswer, choices, selectedAnswer, gameStatus, isStarted } = questHandlersRef.current;
      if (!isStarted || selectedAnswer !== null || gameStatus !== "playing") return;
      const keyMap: Record<string, number> = { a: 0, b: 1, c: 2, d: 3, "1": 0, "2": 1, "3": 2, "4": 3 };
      const choiceIndex = keyMap[e.key.toLowerCase()];
      if (choiceIndex !== undefined && choiceIndex < choices.length) {
        handleAnswer(choices[choiceIndex]);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

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
        answeredQuestionCount={answeredQuestionCount}
        bossDefeatedQuestionNumber={bossDefeatedQuestionNumber}
        canReview={wrongAnswers.length > 0}
        correctCount={correctCount}
        currentGoldBalance={currentGoldBalance}
        gameStatus={gameStatus}
        gameOverReason={gameOverReason}
        goldRewardResult={goldRewardResult}
        heroStatusAfter={heroStatusAfterQuest}
        heroStatusBefore={heroExpResults[0]?.before ?? null}
        isFirstClear={questIsFirstClear}
        mistakeCount={mistakeCount}
        onBackToSelect={backToSelect}
        onRestart={retryCurrentQuest}
        onReview={startReviewQuest}
        partClearReward={partClearReward}
        questMode={activeQuestConfig.mode}
        questTitle={questTitle}
        scoreRate={scoreRate}
        buddyQuestExpResult={buddyQuestExpResult}
        totalGoldEarned={totalGoldEarned}
        totalHeroExpGained={totalHeroExpGained}
        totalHeroLevelUpCount={totalHeroLevelUpCount}
        totalQuestions={totalQuestions}
        worldId={activeWorldId}
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
      bossDefeatedQuestionNumber={bossDefeatedQuestionNumber}
      bossHp={bossHp}
      bossMaxHp={enemyMaxHp}
      buddyCard={buddyCard}
      choices={choices}
      currentQuestion={currentQuestion}
      currentQuestionNumber={currentQuestionNumber}
      currentStreak={currentStreak}
      furiganaEnabled={furiganaEnabled}
      heroLevel={heroLevel}
      heroMaxHp={heroMaxHp}
      onAnswer={handleAnswer}
      onToggleFurigana={toggleFurigana}
      playerHp={playerHp}
      questMode={activeQuestConfig.mode}
      selectedAnswer={selectedAnswer}
      worldId={activeWorldId}
    />
  );
}

function QuestLoadingScreen() {
  return (
    <main className={styles.root} style={getQuestWorldBackgroundStyle()}>
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
  const battlePreviewContext = useMemo(() => loadBattlePreviewContext(), []);
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
    <main className={styles.root} style={getQuestWorldBackgroundStyle(selectedWorld?.id)}>
      <section className={styles.selectScreen}>
        <PageTopBar className={styles.selectTopbar}>
          <FuriganaToggle
            furiganaEnabled={furiganaEnabled}
            onToggle={onToggleFurigana}
          />
        </PageTopBar>

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
            <h1>英検クエスト フロンティア</h1>
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
                    createLargeQuestConfig(selectedLevelWords.length),
                    null,
                    "block",
                    Math.max(0, selectedGroups.filter((g) => !g.id.includes("-ph-")).length - 1)
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
                👑 完全制覇は最後まで挑戦。全問正解で王冠獲得
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
                battlePreviewContext={battlePreviewContext}
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
  battlePreviewContext,
  group,
  index,
  level,
  onStartQuest,
  progress,
}: {
  battlePreviewContext: BattlePreviewContext;
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
          const modeRecord = progress.modeRecords?.[config.mode];
          const battlePreview = estimateQuestBattlePreview({
            blockId: group.id,
            config: questConfig,
            context: battlePreviewContext,
            level,
          });

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
              <strong>{config.label}</strong>
              <small className={styles.questCardName}>{copy.short}</small>
              <div className={styles.questInfoPills}>
                <span>
                  {config.mode === "complete"
                    ? `📜 全${questConfig.questionCount}問`
                    : `📜 ${QUEST_MODE_BATTLE_LABELS[config.mode]}`}
                </span>
                <span>
                  {config.mode === "complete" ? "⚔️ 撃破後も継続" : "⚔️ 撃破で即クリア"}
                </span>
                <span>
                  {config.mode === "complete" ? "👑 全問正解" : "💀 HP0で失敗"}
                </span>
              </div>
              <div className={styles.questEstimateLine}>
                <span>想定撃破：約{battlePreview.estimatedDefeatQuestion}正解</span>
                {!battlePreview.canDefeatWithinLimit && <span>強化推奨</span>}
                {config.mode === "complete" &&
                  battlePreview.canDefeatWithinLimit && <span>撃破後も継続</span>}
              </div>
              {modeRecord && (
                <div className={styles.questRecordLine}>
                  <span>最高 {modeRecord.bestScoreRate}%</span>
                  {modeRecord.bestBossDefeatedQuestion && (
                    <span>最速 {modeRecord.bestBossDefeatedQuestion}問目</span>
                  )}
                  {config.mode === "complete" && modeRecord.crownedAt && (
                    <span>王冠済</span>
                  )}
                </div>
              )}
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
  bossDefeatedQuestionNumber,
  bossHp,
  bossMaxHp,
  buddyCard,
  choices,
  currentQuestion,
  currentQuestionNumber,
  currentStreak,
  furiganaEnabled,
  heroLevel,
  heroMaxHp,
  onAnswer,
  onToggleFurigana,
  playerHp,
  questMode,
  selectedAnswer,
  worldId,
}: {
  answerEffect: AnswerEffect | null;
  background: QuestBackgroundConfig;
  boss: Boss;
  bossDefeatedQuestionNumber: number | null;
  bossHp: number;
  bossMaxHp: number;
  buddyCard: MonsterCard | null;
  choices: string[];
  currentQuestion: LearningWord;
  currentQuestionNumber: number;
  currentStreak: number;
  furiganaEnabled: boolean;
  heroLevel: number;
  heroMaxHp: number;
  onAnswer: (choice: string) => void;
  onToggleFurigana: () => void;
  playerHp: number;
  questMode: QuestMode;
  selectedAnswer: string | null;
  worldId: EikenLevelId | null;
}) {
  return (
    <main className={styles.root} style={getQuestWorldBackgroundStyle(worldId)}>
      <section className={styles.screen} aria-label="英検クエスト フロンティア">
        <PageTopBar className={styles.battleTopbar}>
          <FuriganaToggle
            furiganaEnabled={furiganaEnabled}
            onToggle={onToggleFurigana}
          />
        </PageTopBar>

        <BattleQuizScreen
          answerEffect={answerEffect}
          background={background}
          boss={boss}
          bossDefeatedQuestionNumber={bossDefeatedQuestionNumber}
          bossHp={bossHp}
          bossMaxHp={bossMaxHp}
          buddyCard={buddyCard}
          choices={choices}
          currentQuestion={currentQuestion}
          currentQuestionNumber={currentQuestionNumber}
          currentStreak={currentStreak}
          furiganaEnabled={furiganaEnabled}
          heroLevel={heroLevel}
          heroMaxHp={heroMaxHp}
          onAnswer={onAnswer}
          playerHp={playerHp}
          questMode={questMode}
          selectedAnswer={selectedAnswer}
        />
      </section>
    </main>
  );
}

function QuestHeader() {
  return (
    <header className={styles.header}>
      <p className={styles.modeBadge}>クエストモード</p>
      <h1>英検クエスト フロンティア</h1>
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
  bossDefeatedQuestionNumber,
  bossHp,
  bossMaxHp,
  buddyCard,
  choices,
  currentQuestion,
  currentQuestionNumber,
  currentStreak,
  furiganaEnabled,
  heroLevel,
  heroMaxHp,
  onAnswer,
  playerHp,
  questMode,
  selectedAnswer,
}: {
  answerEffect: AnswerEffect | null;
  background: QuestBackgroundConfig;
  boss: Boss;
  bossDefeatedQuestionNumber: number | null;
  bossHp: number;
  bossMaxHp: number;
  buddyCard: MonsterCard | null;
  choices: string[];
  currentQuestion: LearningWord;
  currentQuestionNumber: number;
  currentStreak: number;
  furiganaEnabled: boolean;
  heroLevel: number;
  heroMaxHp: number;
  onAnswer: (choice: string) => void;
  playerHp: number;
  questMode: QuestMode;
  selectedAnswer: string | null;
}) {
  return (
    <div className={styles.battleQuizGrid}>
      <BattleArea
        answerEffect={answerEffect}
        background={background}
        boss={boss}
        bossDefeatedQuestionNumber={bossDefeatedQuestionNumber}
        bossHp={bossHp}
        bossMaxHp={bossMaxHp}
        buddyCard={buddyCard}
        currentStreak={currentStreak}
        heroLevel={heroLevel}
        heroMaxHp={heroMaxHp}
        playerHp={playerHp}
        questMode={questMode}
      />
      <QuestionArea
        choices={choices}
        currentQuestion={currentQuestion}
        currentQuestionNumber={currentQuestionNumber}
        furiganaEnabled={furiganaEnabled}
        locationLabel={boss.stage}
        onAnswer={onAnswer}
        selectedAnswer={selectedAnswer}
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

const HERO_SPRITES = {
  ready: "/images/hero/hero_ready.png",
  charge: "/images/hero/hero_charge.png",
  slash: "/images/hero/hero_slash.png",
  battleStance: "/images/hero/hero_battle_stance.png",
} as const;

function HeroSpriteDisplay({
  sprite,
  offsetX,
  heroLevel,
}: {
  sprite: HeroSprite;
  offsetX: number;
  heroLevel: number;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const heroStyle = getHeroLevelStyle(heroLevel) as CSSProperties;

  if (imgFailed) {
    return (
      <div
        style={{ transform: `translateX(${offsetX}px)`, transition: "transform 80ms linear" }}
        aria-hidden="true"
      >
        <div className={styles.playerSprite} style={heroStyle}>
          <span className={styles.playerCape} />
          <span className={styles.playerHead} />
          <span className={styles.playerBody} />
          <span className={styles.playerShield} />
          <span className={styles.playerBlade} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.heroSpriteWrapper} aria-hidden="true">
      <Image
        src={HERO_SPRITES[sprite]}
        alt=""
        width={1254}
        height={1254}
        sizes="180px"
        className={styles.heroSpriteImage}
        style={{ transform: `translateX(${offsetX}px)` }}
        onError={() => setImgFailed(true)}
      />
    </div>
  );
}

type HeroSprite = keyof typeof HERO_SPRITES;

const HERO_ATTACK_SEQUENCE: Array<{ sprite: HeroSprite; duration: number; x: number }> = [
  { sprite: "ready", duration: 100, x: 0 },
  { sprite: "charge", duration: 160, x: 24 },
  { sprite: "slash", duration: 220, x: 48 },
  { sprite: "battleStance", duration: 180, x: 18 },
  { sprite: "ready", duration: 100, x: 0 },
];

function BattleArea({
  answerEffect,
  background,
  boss,
  bossDefeatedQuestionNumber,
  bossHp,
  bossMaxHp,
  buddyCard,
  currentStreak,
  heroLevel,
  heroMaxHp,
  playerHp,
  questMode,
}: {
  answerEffect: AnswerEffect | null;
  background: QuestBackgroundConfig;
  boss: Boss;
  bossDefeatedQuestionNumber: number | null;
  bossHp: number;
  bossMaxHp: number;
  buddyCard: MonsterCard | null;
  currentStreak: number;
  heroLevel: number;
  heroMaxHp: number;
  playerHp: number;
  questMode: QuestMode;
}) {
  const [currentHeroSprite, setCurrentHeroSprite] = useState<HeroSprite>("ready");
  const [heroOffsetX, setHeroOffsetX] = useState(0);
  const [isEnemyHit, setIsEnemyHit] = useState(false);
  const attackingRef = useRef(false);

  useEffect(() => {
    if (answerEffect?.type !== "correct" || attackingRef.current) return;

    attackingRef.current = true;
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    let elapsed = 0;
    for (const frame of HERO_ATTACK_SEQUENCE) {
      const { sprite, x, duration } = frame;
      const delay = elapsed;
      const t = setTimeout(() => {
        if (cancelled) return;
        setCurrentHeroSprite(sprite);
        setHeroOffsetX(x);
        if (sprite === "slash") {
          setIsEnemyHit(true);
          const hitTimer = setTimeout(() => {
            if (!cancelled) setIsEnemyHit(false);
          }, 380);
          timers.push(hitTimer);
        }
      }, delay);
      timers.push(t);
      elapsed += duration;
    }

    const resetTimer = setTimeout(() => {
      if (!cancelled) {
        setCurrentHeroSprite("ready");
        setHeroOffsetX(0);
        attackingRef.current = false;
      }
    }, elapsed);
    timers.push(resetTimer);

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      attackingRef.current = false;
      setCurrentHeroSprite("ready");
      setHeroOffsetX(0);
      setIsEnemyHit(false);
    };
  }, [answerEffect]);

  const bossStyle = { "--boss-accent": boss.accent } as CSSProperties;
  const backgroundStyle = getQuestBackgroundStyle(background, questMode);
  const isBossBackdrop = questMode === "boss" || questMode === "complete";
  const bossDisplayName = parseBossDisplayName(boss.name);
  const completeChallengeActive = questMode === "complete" && bossHp <= 0;

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
        <div className={styles.playerHpSlot}>
          <HpMeter label="勇者HP" current={playerHp} max={heroMaxHp} />
        </div>
        <div className={styles.enemyHpSlot}>
          <HpMeter
            label="敵HP"
            current={bossHp}
            max={bossMaxHp}
            defeated={completeChallengeActive}
          />
        </div>
      </div>

      {completeChallengeActive && (
        <div className={styles.completeChallengeBanner}>
          <strong>ボス撃破！</strong>
          <span>
            完全制覇モードのため、残りの問題で知識の完成度を試そう！
            {bossDefeatedQuestionNumber
              ? ` ${bossDefeatedQuestionNumber}問目で撃破済み。`
              : ""}
          </span>
        </div>
      )}

      <div className={styles.combatants}>
        <div
          className={cx(
            styles.playerUnit,
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
            <HeroSpriteDisplay
              sprite={currentHeroSprite}
              offsetX={heroOffsetX}
              heroLevel={heroLevel}
            />
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
            isEnemyHit && bossHp > 0 && styles.enemySlashHit,
            (answerEffect?.bossDefeated || bossHp <= 0) && styles.unitDefeated
          )}
          style={bossStyle}
        >
          <div className={styles.bossSpriteScaler} aria-hidden="true">
            <div className={cx(styles.bossSprite, getBossShapeClass(boss.shape))}>
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
          </div>
          {answerEffect?.type === "correct" && (answerEffect.damageAmount ?? 0) > 0 && (
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
          key={`${answerEffect.type}-${answerEffect.word}-${answerEffect.damageAmount}`}
          className={cx(
            styles.damageCallout,
            answerEffect.type === "wrong" && styles.damageCalloutWrong,
            answerEffect.isCritical && styles.damageCalloutCritical
          )}
          aria-live="polite"
        >
          <strong>{getDamageCalloutMessage(answerEffect)}</strong>
          {answerEffect.healAmount && (
            <span className={styles.healNotice}>HP +{answerEffect.healAmount} 回復！</span>
          )}
        </div>
      )}

      {currentStreak >= 3 && (
        <div className={styles.bossNameplate}>
        {currentStreak >= 3 && (
          <span className={styles.streakBadge}>
            {currentStreak >= 5 ? `⚡${currentStreak}連続！クリティカル！` : `🔥${currentStreak}連続！`}
          </span>
        )}
        </div>
      )}
    </section>
  );
}

function getDamageCalloutMessage(answerEffect: AnswerEffect) {
  const damage = answerEffect.damageAmount ?? 0;

  if (answerEffect.type === "wrong") {
    return `勇者が${damage}ダメージを受けた…`;
  }

  if (answerEffect.completeChallengeContinues) {
    return damage > 0 ? `敵に${damage}ダメージ！` : "敵は撃破済み！";
  }

  if (answerEffect.bossDefeated) {
    return `敵に${damage}ダメージ！撃破！`;
  }

  return answerEffect.isCritical
    ? `敵に${damage}ダメージ！クリティカル！`
    : `敵に${damage}ダメージ！`;
}

function HpMeter({
  label,
  current,
  max,
  defeated = false,
}: {
  label: string;
  current: number;
  max: number;
  defeated?: boolean;
}) {
  const pct = defeated ? 0 : max > 0 ? Math.min(100, Math.round((current / max) * 100)) : 0;
  return (
    <div className={cx(styles.hpMeter, defeated && styles.hpMeterDefeated)}>
      <div className={styles.hpLabel}>
        <span>{label}</span>
        <strong>{defeated ? "⚔ 撃破" : `${Math.round(current)} / ${Math.round(max)}`}</strong>
      </div>
      <div className={styles.hpTrack} aria-hidden="true">
        <div
          className={cx(styles.hpFill, defeated && styles.hpFillDefeated)}
          style={{ width: defeated ? "100%" : `${pct}%` }}
        />
      </div>
    </div>
  );
}

function QuestionArea({
  choices,
  currentQuestion,
  currentQuestionNumber,
  furiganaEnabled,
  locationLabel,
  onAnswer,
  selectedAnswer,
}: {
  choices: string[];
  currentQuestion: LearningWord;
  currentQuestionNumber: number;
  furiganaEnabled: boolean;
  locationLabel: string;
  onAnswer: (choice: string) => void;
  selectedAnswer: string | null;
}) {
  return (
    <div className={styles.questionColumn}>
      <section className={styles.questionPanel} aria-label="クイズ問題">
        <div className={styles.questionTopline}>
          <div className={styles.questLocation}>
            {currentQuestion.level}：{locationLabel}
          </div>
          <div className={styles.questionNumber}>Q.{currentQuestionNumber}</div>
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
    </div>
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
      {choices.map((choice, index) => {
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
            <span className={styles.answerLabel}>{String.fromCharCode(65 + index)}</span>
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
  answeredQuestionCount,
  bossDefeatedQuestionNumber,
  canReview,
  correctCount,
  currentGoldBalance,
  gameStatus,
  gameOverReason,
  goldRewardResult,
  heroStatusAfter,
  heroStatusBefore,
  isFirstClear,
  mistakeCount,
  onBackToSelect,
  onRestart,
  onReview,
  partClearReward,
  questMode,
  questTitle,
  scoreRate,
  buddyQuestExpResult,
  totalGoldEarned,
  totalHeroExpGained,
  totalHeroLevelUpCount,
  totalQuestions,
  worldId,
  wrongAnswers,
}: {
  answeredQuestionCount: number;
  bossDefeatedQuestionNumber: number | null;
  canReview: boolean;
  correctCount: number;
  currentGoldBalance: number;
  gameStatus: GameStatus;
  gameOverReason: GameOverReason;
  goldRewardResult: GoldRewardResult | null;
  heroStatusAfter: HeroStatus | null;
  heroStatusBefore: HeroStatus | null;
  isFirstClear: boolean;
  mistakeCount: number;
  onBackToSelect: () => void;
  onRestart: () => void;
  onReview: () => void;
  partClearReward?: PartClearReward;
  questMode: QuestMode;
  questTitle: string;
  scoreRate: number;
  buddyQuestExpResult: BuddyQuestExpResult | null;
  totalGoldEarned: number;
  totalHeroExpGained: number;
  totalHeroLevelUpCount: number;
  totalQuestions: number;
  worldId: EikenLevelId | null;
  wrongAnswers: AnswerRecord[];
}) {
  const resultQuestionCount = Math.max(1, answeredQuestionCount);
  const isPerfectClear =
    gameStatus === "clear" && correctCount === resultQuestionCount && mistakeCount === 0;
  const earnedCrown =
    gameStatus === "clear" &&
    questMode === "complete" &&
    correctCount === totalQuestions &&
    mistakeCount === 0;
  const resultHeadline =
    gameStatus === "clear"
      ? earnedCrown
        ? "完全制覇！"
        : "クエストクリア！"
      : "クエスト失敗";
  const resultKicker = earnedCrown
    ? "CROWN CLEAR"
    : isPerfectClear
      ? "PERFECT CLEAR"
      : gameStatus === "clear"
        ? "QUEST CLEAR"
        : "QUEST FAILED";
  const resultMessage = getScoreMessage(
    gameStatus,
    questMode,
    correctCount,
    resultQuestionCount,
    isPerfectClear,
    gameOverReason,
    bossDefeatedQuestionNumber
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
    <main className={styles.root} style={getQuestWorldBackgroundStyle(worldId)}>
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
            <p className={styles.resultKicker}>{resultKicker}</p>
            <h1 className={styles.resultTitle}>{resultHeadline}</h1>
            <p className={styles.resultQuestName}>{questTitle}</p>
            <p className={styles.resultMessage}>{resultMessage}</p>

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
              {earnedCrown
                ? <strong>王冠獲得</strong>
                : isPerfectClear && <strong>パーフェクト</strong>}
            </div>
            <div className={styles.resultSummaryGrid}>
              <div className={styles.resultSummaryItem}>
                <span>{questMode === "complete" ? "正解 / 全問" : "正解 / 回答"}</span>
                <strong>{correctCount} / {resultQuestionCount}</strong>
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
                <div className={styles.resultCardTop}>
                  <span className={styles.resultSectionLabel}>主人公</span>
                  <Image
                    src="/images/hero/hero_ready.png"
                    alt="勇者"
                    width={1254}
                    height={1254}
                    sizes="96px"
                    className={styles.resultHeroSprite}
                  />
                </div>
                <h3>{heroStatusAfter.title}</h3>
                <strong>Lv{heroLevelAfter}</strong>
                {totalHeroExpGained > 0 && !heroExpProgress?.isMaxLevel && (
                  <p>EXP +{totalHeroExpGained}</p>
                )}
                <div className={styles.resultHeroStatus}>
                  {heroExpProgress?.isMaxLevel
                    ? "MAX"
                    : `次のLvまで ${
                        (heroExpProgress?.requiredExp ?? 0) -
                        (heroExpProgress?.currentExp ?? 0)
                      }EXP`}
                </div>
                {!heroExpProgress?.isMaxLevel && heroExpProgress && (
                  <div className={styles.resultExpTrack}>
                    <div
                      className={styles.resultExpFill}
                      style={{
                        width: `${heroExpProgress.requiredExp ? Math.min(100, Math.round((heroExpProgress.currentExp / heroExpProgress.requiredExp) * 100)) : 0}%`,
                      }}
                    />
                  </div>
                )}
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
                <div className={styles.resultCardTop}>
                  <span className={styles.resultSectionLabel}>
                    {buddyAlreadyMax
                      ? "相棒レベルは最大です"
                      : buddyQuestExpResult.leveledUp || buddyReachedMax
                        ? "相棒モンスター成長！"
                        : "相棒モンスター経験値"}
                  </span>
                  <span className={styles.resultBuddyEmoji} aria-hidden="true">
                    {buddyQuestExpResult.card.monsterEmoji}
                  </span>
                </div>
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
                {!buddyQuestExpResult.after.isMaxLevel && !buddyAlreadyMax && (
                  <div className={styles.resultExpTrack}>
                    <div
                      className={styles.resultExpFill}
                      style={{ width: `${buddyQuestExpResult.after.percent}%` }}
                    />
                  </div>
                )}
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
