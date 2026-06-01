"use client";

import type { CSSProperties } from "react";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import PageTopBar from "../components/PageTopBar";
import {
  addGold,
  addHeroExp,
  applyGoldBonus,
  clampGoldBonusRate,
  getHeroGoldBonusRate,
  loadHeroStatus,
  saveHeroStatus,
} from "../../data/hero";
import { EarnedCard } from "../../data/cards";
import {
  calcTotalEffects,
  EquipEffects,
  getSelectedMonsterCard,
  loadEquipState,
  loadShopState,
} from "../../data/shop";
import {
  getMonsterLevelProgress,
  getPartnerLevelGoldBonusRate,
  getPartnerRarityGoldBonusRate,
} from "../../data/progression";
import {
  eiken3Written001_100,
  type WrittenQuestion,
} from "../../data/eiken3_written_001_100";
import { eiken5Written001_100 } from "../../data/eiken5_written_001_100";
import { eiken4Written001_100 } from "../../data/eiken4_written_001_100";
import { eikenPre2Written001_100 } from "../../data/eiken_pre2_written_001_100";
import {
  availableQuestWorlds,
  defaultBoss,
  getBossForQuest,
  getQuestBackgroundConfig,
  getQuestWorldBackgroundImage,
  getQuestWorldByLevel,
  questModeConfigList,
  type BossConfig as Boss,
  type EikenLevelId,
  type QuestBackgroundConfig,
  type QuestMode,
} from "../../data/questConfig";
import {
  clearWrittenProgress,
  emptyWrittenProgress,
  getWrittenModeProgressKey,
  isWrittenModeCleared,
  loadWrittenProgress,
  saveWrittenProgress,
  type WrittenProgress,
} from "../../data/writtenProgress";
import styles from "../quiz/quest-mode.module.css";

type LevelFilter = WrittenQuestion["level"];

type AnswerEffect = {
  type: "correct" | "wrong";
  damage: number;
};

type GameStatus = "playing" | "clear" | "gameOver";
type GameOverReason = "heroHpZero" | "bossSurvived" | null;

const WRITTEN_QUEST_MODES: QuestMode[] = ["mini", "normal", "boss", "complete"];

const WRITTEN_QUEST_MODE_LABELS: Record<QuestMode, string> = {
  mini: "ショートバトル",
  normal: "スタンダードバトル",
  boss: "ヘビーバトル",
  complete: "完全制覇",
};

const writtenQuestModeClassNames: Record<QuestMode, string> = {
  mini: styles.questModeMini,
  normal: styles.questModeNormal,
  boss: styles.questModeBoss,
  complete: styles.questModeComplete,
};

function isQuestMode(value: string | null): value is QuestMode {
  return WRITTEN_QUEST_MODES.includes(value as QuestMode);
}

function getWrittenQuestModeClass(mode: QuestMode) {
  return writtenQuestModeClassNames[mode];
}

const LEVEL_TO_WORLD_ID: Record<LevelFilter, EikenLevelId> = {
  "英検5級": "eiken5",
  "英検4級": "eiken4",
  "英検3級": "eiken3",
  "英検準2級": "eiken_pre2",
};

const WRITTEN_LEVELS: LevelFilter[] = ["英検5級", "英検4級", "英検3級", "英検準2級"];

const allWrittenQuestions: WrittenQuestion[] = [
  ...eiken5Written001_100,
  ...eiken4Written001_100,
  ...eiken3Written001_100,
  ...eikenPre2Written001_100,
];

// クエストモードの1.5倍 (熟語より上)
const WRITTEN_XP_PER_CORRECT: Record<LevelFilter, number> = {
  "英検5級": 15,
  "英検4級": 18,
  "英検3級": 22,
  "英検準2級": 30,
};

const WRITTEN_GOLD_PER_CORRECT: Record<LevelFilter, number> = {
  "英検5級": 8,
  "英検4級": 10,
  "英検3級": 13,
  "英検準2級": 17,
};

function loadEarnedCards(): EarnedCard[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem("earnedCards");
    const parsed = saved ? JSON.parse(saved) : [];
    if (!Array.isArray(parsed)) return [];
    const now = new Date().toISOString();
    return parsed
      .filter((c) => typeof c.cardId === "string")
      .map((c) => {
        const ownedCount = Number(c.ownedCount);
        return {
          ...c,
          cardId: c.cardId,
          correctCount: Math.max(0, Math.floor(Number(c.correctCount) || 0)),
          exp: Math.max(0, Math.floor(Number(c.exp) || 0)),
          obtainedAt: typeof c.obtainedAt === "string" ? c.obtainedAt : now,
          ownedCount: Number.isFinite(ownedCount) && ownedCount > 0 ? Math.floor(ownedCount) : c.ownedCount,
        } as EarnedCard;
      });
  } catch {
    return [];
  }
}

const shapeGroupMap: Record<string, string> = {
  demon: "wizard", dragon: "dragon", slime: "slime", golem: "golem",
  ghost: "ghost", wolf: "wolf", plant: "plant", wizard: "wizard",
  insect: "insect", core: "core", leafbeast: "plant", mushroomking: "plant",
  waterfairy: "insect", sunbird: "insect", treant: "plant", forestgolem: "golem",
  wordsprite: "wizard", harborguard: "golem", merchantbeast: "wolf",
  windbird: "insect", anchorgolem: "golem", lighthouseghost: "ghost",
  stormbeast: "wolf", seadrake: "dragon", phrasebook: "wizard",
  stoneguard: "golem", runecore: "core", sandserpent: "wolf",
  shadowpriest: "wizard", loremage: "wizard", tombwraith: "ghost",
  pharaohlord: "wizard", sunpriest: "wizard", wordrelic: "golem",
  scrollking: "wizard", silverwarden: "golem", cloudbeast: "wolf",
  bridgeknight: "golem", towermage: "wizard", starseer: "wizard",
  thundermage: "wizard", lightpriest: "wizard", skyknight: "golem",
  dragonpriest: "wizard", starguardian: "core", skydragon: "dragon",
  starspirit: "core", timekeeper: "core", memorysage: "wizard",
  frontierdragon: "dragon", oraclesprite: "core", mooncaster: "wizard",
  cosmicpriest: "core",
};

function getBossShapeClass(shape: string): string | undefined {
  const group = shapeGroupMap[shape] ?? "wolf";
  const map: Record<string, string> = {
    wizard: styles.bossSpriteWizard,
    dragon: styles.bossSpriteDragon,
    golem: styles.bossSpriteGolem,
    slime: styles.bossSpriteSlime,
    ghost: styles.bossSpriteGhost,
    wolf: styles.bossSpriteWolf,
    plant: styles.bossSpritePlant,
    insect: styles.bossSpriteInsect,
    core: styles.bossSpriteCore,
  };
  return map[group];
}

function cx(...cls: Array<string | false | null | undefined>) {
  return cls.filter(Boolean).join(" ");
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

const HERO_SPRITES = {
  ready: "/images/hero/hero_ready.png",
  charge: "/images/hero/hero_charge.png",
  slash: "/images/hero/hero_slash.png",
  battleStance: "/images/hero/hero_battle_stance.png",
} as const;

type HeroSprite = keyof typeof HERO_SPRITES;

const HERO_ATTACK_SEQUENCE: Array<{ sprite: HeroSprite; duration: number; x: number }> = [
  { sprite: "ready", duration: 100, x: 0 },
  { sprite: "charge", duration: 160, x: 24 },
  { sprite: "slash", duration: 220, x: 48 },
  { sprite: "battleStance", duration: 180, x: 18 },
  { sprite: "ready", duration: 100, x: 0 },
];

function WrittenHeroSprite({
  heroLevel,
  sprite,
  offsetX,
}: {
  heroLevel: number;
  sprite: HeroSprite;
  offsetX: number;
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

function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function shuffleWrittenQuestionChoices(question: WrittenQuestion): WrittenQuestion {
  const correctChoice = question.choices[question.answerIndex];
  const choices = shuffleArray(question.choices);
  const answerIndex = choices.indexOf(correctChoice);

  return {
    ...question,
    choices,
    answerIndex: answerIndex >= 0 ? answerIndex : question.answerIndex,
  };
}

type QBGStyle = CSSProperties & Record<
  "--quest-bg-image" | "--quest-bg-overlay" | "--quest-bg-pattern" | "--quest-bg-accent",
  string
>;
type QWorldStyle = CSSProperties & Record<"--quest-world-bg-image", string>;

function worldBgStyle(worldId?: EikenLevelId | null): QWorldStyle {
  const img = getQuestWorldBackgroundImage(worldId);
  return { "--quest-world-bg-image": `url("${img.replace(/"/g, '\\"')}")` };
}

function battleBgStyle(bg: QuestBackgroundConfig): QBGStyle {
  return {
    "--quest-bg-image": bg.backgroundImage,
    "--quest-bg-overlay": bg.overlay,
    "--quest-bg-pattern": bg.pattern,
    "--quest-bg-accent": bg.accent,
  };
}

function WrittenContent() {
  const searchParams = useSearchParams();
  const paramLevel = searchParams.get("level") as LevelFilter | null;
  const paramMode = searchParams.get("mode");
  const autostart = searchParams.get("autostart") === "1";

  const initialLevel: LevelFilter =
    paramLevel && WRITTEN_LEVELS.includes(paramLevel) ? paramLevel : "英検5級";

  const initialMode: QuestMode = isQuestMode(paramMode) ? paramMode : "complete";

  const [levelFilter, setLevelFilter] = useState<LevelFilter>(initialLevel);
  const [isStarted, setIsStarted] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [questions, setQuestions] = useState<WrittenQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [writtenProgress, setWrittenProgress] =
    useState<WrittenProgress>(emptyWrittenProgress);
  const [gameStatus, setGameStatus] = useState<GameStatus>("playing");
  const [gameOverReason, setGameOverReason] = useState<GameOverReason>(null);
  const [playerHp, setPlayerHp] = useState(100);
  const [bossHp, setBossHp] = useState(100);
  const [heroMaxHp, setHeroMaxHp] = useState(100);
  const [enemyMaxHp, setEnemyMaxHp] = useState(100);
  const [heroAttack, setHeroAttack] = useState(25);
  const [enemyAttack, setEnemyAttack] = useState(22);
  const [answerEffect, setAnswerEffect] = useState<AnswerEffect | null>(null);
  const [totalGold, setTotalGold] = useState(0);
  const [totalExp, setTotalExp] = useState(0);
  const [activeBoss, setActiveBoss] = useState<Boss>(defaultBoss);
  const [activeQuestMode, setActiveQuestMode] = useState<QuestMode>("complete");
  const [heroLevel, setHeroLevel] = useState(1);
  const [equipEffects, setEquipEffects] = useState<EquipEffects>({});
  const [partnerGoldBonus, setPartnerGoldBonus] = useState(0);
  const [sessionCorrectCount, setSessionCorrectCount] = useState(0);
  const [sessionAnsweredCount, setSessionAnsweredCount] = useState(0);
  const [bossDefeatedQuestionNumber, setBossDefeatedQuestionNumber] =
    useState<number | null>(null);

  useEffect(() => {
    if (!isReady) return;
    saveWrittenProgress(writtenProgress);
  }, [isReady, writtenProgress]);

  const baseQuestions = useMemo(
    () => allWrittenQuestions.filter((q) => q.level === levelFilter),
    [levelFilter]
  );

  const currentQuestion = questions[currentIndex];
  const hasAnswered = selectedIndex !== null;
  const isCorrect =
    currentQuestion !== undefined && selectedIndex === currentQuestion.answerIndex;

  const worldId = LEVEL_TO_WORLD_ID[levelFilter];
  const activeBackground = getQuestBackgroundConfig(undefined, worldId);

  const startBattle = (levelOverride?: LevelFilter, modeOverride: QuestMode = "complete") => {
    const level = levelOverride ?? levelFilter;
    if (levelOverride && levelOverride !== levelFilter) setLevelFilter(levelOverride);
    const config =
      questModeConfigList.find((questConfig) => questConfig.mode === modeOverride) ??
      questModeConfigList[questModeConfigList.length - 1];
    const sourceQuestions = shuffleArray(
      allWrittenQuestions
        .filter((q) => q.level === level)
        .map(shuffleWrittenQuestionChoices)
    );
    const qs = sourceQuestions.slice(0, Math.min(config.questionCount, sourceQuestions.length));
    const hero = loadHeroStatus();
    const hpMax = 100 + hero.level * 12;
    const atk = 25 + hero.level * 3;
    const targetCorrect = Math.ceil(qs.length * 0.72);
    const bossHpMax = Math.floor(atk * targetCorrect);
    const bossAtk = Math.floor(18 * 1.2);

    const boss = getBossForQuest({
      blockId: null,
      mode: config.mode,
      title: `${level} 筆記バトル`,
      questionCount: qs.length,
    });

    const freshEquip = calcTotalEffects(loadEquipState());
    const shopState = loadShopState();
    const partnerCard = getSelectedMonsterCard(shopState);
    const earnedCards = loadEarnedCards();
    const partnerEarned = partnerCard
      ? earnedCards.find((c) => c.cardId === partnerCard.id) ?? null
      : null;
    const pLevelBonus = partnerCard && partnerEarned
      ? getPartnerLevelGoldBonusRate(getMonsterLevelProgress(partnerEarned.exp).level)
      : 0;
    const pRarityBonus = partnerCard
      ? getPartnerRarityGoldBonusRate(partnerCard.rarity)
      : 0;

    setQuestions(qs);
    setCurrentIndex(0);
    setSelectedIndex(null);
    setAnswerEffect(null);
    setGameStatus("playing");
    setGameOverReason(null);
    setHeroMaxHp(hpMax);
    setEnemyMaxHp(bossHpMax);
    setHeroAttack(atk);
    setEnemyAttack(bossAtk);
    setPlayerHp(hpMax);
    setBossHp(bossHpMax);
    setTotalGold(0);
    setTotalExp(0);
    setActiveBoss(boss);
    setActiveQuestMode(config.mode);
    setHeroLevel(hero.level);
    setEquipEffects(freshEquip);
    setPartnerGoldBonus(pLevelBonus + pRarityBonus);
    setSessionCorrectCount(0);
    setSessionAnsweredCount(0);
    setBossDefeatedQuestionNumber(null);
    setIsStarted(true);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  useEffect(() => {
    const id = window.setTimeout(() => {
      setWrittenProgress(loadWrittenProgress());
      setIsReady(true);
      if (autostart && initialLevel) {
        startBattle(initialLevel, initialMode);
      }
    }, 0);
    return () => window.clearTimeout(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAnswer = (choiceIndex: number) => {
    if (hasAnswered || !currentQuestion || gameStatus !== "playing") return;

    setSelectedIndex(choiceIndex);
    const correct = choiceIndex === currentQuestion.answerIndex;
    const nextAnsweredCount = sessionAnsweredCount + 1;
    const nextCorrectCount = sessionCorrectCount + (correct ? 1 : 0);
    const dmgEnemy = correct ? Math.max(1, heroAttack) : 0;
    const dmgHero = correct ? 0 : Math.max(1, enemyAttack);

    const nextBossHp = Math.max(0, bossHp - dmgEnemy);
    const nextPlayerHp = Math.max(0, playerHp - dmgHero);
    const enemyDefeatedThisAnswer = bossDefeatedQuestionNumber === null && bossHp > 0 && nextBossHp <= 0;
    const nextBossDefeatedQuestionNumber =
      bossDefeatedQuestionNumber ??
      (enemyDefeatedThisAnswer ? nextAnsweredCount : null);
    const reachedFinalQuestion = currentIndex + 1 >= questions.length;
    const isCompleteMode = activeQuestMode === "complete";
    const heroDied = nextPlayerHp <= 0;
    const questCleared =
      !heroDied &&
      (isCompleteMode
        ? reachedFinalQuestion && nextBossDefeatedQuestionNumber !== null
        : enemyDefeatedThisAnswer);
    const questFailed =
      heroDied ||
      (reachedFinalQuestion && !questCleared);

    setSessionAnsweredCount(nextAnsweredCount);
    setSessionCorrectCount(nextCorrectCount);
    setBossDefeatedQuestionNumber(nextBossDefeatedQuestionNumber);
    setWrittenProgress((prev) => ({
      ...prev,
      answeredIds: { ...prev.answeredIds, [currentQuestion.id]: true },
      correctIds: correct
        ? { ...prev.correctIds, [currentQuestion.id]: true }
        : prev.correctIds,
    }));
    if (correct) {
      // EXP: 級別レート × 1.5倍(クエスト上位) + 装備ボーナス
      const baseXp = WRITTEN_XP_PER_CORRECT[levelFilter] ?? 15;
      const xpGained = Math.round(baseXp * (1 + (equipEffects.expBonus ?? 0) / 100));
      const heroResult = addHeroExp(loadHeroStatus(), xpGained);
      saveHeroStatus(heroResult.after);
      setTotalExp((prev) => prev + xpGained);

      // Gold: 級別レート + ヒーローLv + パートナー + 装備ボーナス
      const baseGold = WRITTEN_GOLD_PER_CORRECT[levelFilter] ?? 8;
      const heroBonusRate = getHeroGoldBonusRate(heroResult.after.level);
      const totalBonusRate = clampGoldBonusRate(
        heroBonusRate + partnerGoldBonus + (equipEffects.goldBonus ?? 0) / 100
      );
      const goldGained = applyGoldBonus(baseGold, totalBonusRate);
      addGold(goldGained);
      setTotalGold((prev) => prev + goldGained);
    }

    setBossHp(nextBossHp);
    setPlayerHp(nextPlayerHp);
    setAnswerEffect({ type: correct ? "correct" : "wrong", damage: correct ? dmgEnemy : dmgHero });

    window.setTimeout(() => {
      setAnswerEffect(null);
      setSelectedIndex(null);

      if (questCleared) {
        const progressKey = getWrittenModeProgressKey(levelFilter, activeQuestMode);
        const earnedCrown = isCompleteMode && nextCorrectCount === questions.length;

        setWrittenProgress((prev) => ({
          ...prev,
          clearedModes: { ...prev.clearedModes, [progressKey]: true },
          crownedModes: earnedCrown
            ? { ...prev.crownedModes, [progressKey]: true }
            : prev.crownedModes,
        }));
        setGameStatus("clear");
        window.scrollTo({ top: 0, behavior: "auto" });
      } else if (questFailed) {
        setGameOverReason(heroDied ? "heroHpZero" : "bossSurvived");
        setGameStatus("gameOver");
        window.scrollTo({ top: 0, behavior: "auto" });
      } else {
        setCurrentIndex(currentIndex + 1);
      }
    }, 1500);
  };

  const backToSelect = () => {
    setIsStarted(false);
    setGameStatus("playing");
    setGameOverReason(null);
    setSelectedIndex(null);
    setAnswerEffect(null);
  };

  const resetProgress = () => {
    setWrittenProgress(emptyWrittenProgress);
    clearWrittenProgress();
  };

  const handlersRef = useRef({ handleAnswer, currentIndex, hasAnswered, questionsLength: questions.length });
  useEffect(() => {
    handlersRef.current = { handleAnswer, currentIndex, hasAnswered, questionsLength: questions.length };
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT") return;
      const { handleAnswer, hasAnswered } = handlersRef.current;
      const map: Record<string, number> = { a: 0, b: 1, c: 2, d: 3, "1": 0, "2": 1, "3": 2, "4": 3 };
      const idx = map[e.key.toLowerCase()];
      if (idx !== undefined && !hasAnswered) handleAnswer(idx);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!isReady) {
    return (
      <main className={styles.root} style={worldBgStyle()}>
        <section className={styles.screen}>
          <WrittenHeader />
          <div className={styles.loadingPanel}>
            <p className={styles.loadingLabel}>筆記バトル</p>
            <h2>準備中...</h2>
          </div>
        </section>
      </main>
    );
  }

  if (!isStarted) {
    return (
      <WrittenSelectScreen
        levelFilter={levelFilter}
        onChangeLevel={(l) => setLevelFilter(l)}
        onStart={startBattle}
        onResetProgress={resetProgress}
        baseQuestions={baseQuestions}
        writtenProgress={writtenProgress}
        worldId={worldId}
      />
    );
  }

  if (!currentQuestion || gameStatus !== "playing") {
    const scoreRate =
      sessionAnsweredCount > 0
        ? Math.round((sessionCorrectCount / sessionAnsweredCount) * 100)
        : 0;
    return (
      <WrittenResultScreen
        correctCount={sessionCorrectCount}
        totalQuestions={gameStatus === "clear" && activeQuestMode === "complete"
          ? questions.length
          : sessionAnsweredCount}
        scoreRate={scoreRate}
        totalGold={totalGold}
        totalExp={totalExp}
        worldId={worldId}
        levelFilter={levelFilter}
        questMode={activeQuestMode}
        gameStatus={gameStatus}
        gameOverReason={gameOverReason}
        bossDefeatedQuestionNumber={bossDefeatedQuestionNumber}
        questionCount={questions.length}
        onRestart={() => startBattle(undefined, activeQuestMode)}
        onBackToSelect={backToSelect}
      />
    );
  }

  return (
    <WrittenBattleMode
      background={activeBackground}
      boss={activeBoss}
      bossHp={bossHp}
      bossMaxHp={enemyMaxHp}
      playerHp={playerHp}
      heroMaxHp={heroMaxHp}
      heroLevel={heroLevel}
      currentQuestion={currentQuestion}
      currentQuestionNumber={currentIndex + 1}
      selectedIndex={selectedIndex}
      hasAnswered={hasAnswered}
      isCorrect={isCorrect}
      answerEffect={answerEffect}
      locationLabel={activeBoss.stage}
      onAnswer={handleAnswer}
      worldId={worldId}
    />
  );
}

export default function WrittenPage() {
  return (
    <Suspense
      fallback={
        <main className={styles.root} style={worldBgStyle()}>
          <section className={styles.screen}>
            <WrittenHeader />
            <div className={styles.loadingPanel}>
              <p className={styles.loadingLabel}>筆記バトル</p>
              <h2>準備中...</h2>
            </div>
          </section>
        </main>
      }
    >
      <WrittenContent />
    </Suspense>
  );
}

function WrittenHeader() {
  return (
    <header className={styles.header}>
      <p className={styles.modeBadge}>筆記バトル</p>
      <h1>筆記バトル</h1>
    </header>
  );
}

function WrittenSelectScreen({
  levelFilter,
  onChangeLevel,
  onStart,
  onResetProgress,
  baseQuestions,
  writtenProgress,
  worldId,
}: {
  levelFilter: LevelFilter;
  onChangeLevel: (level: LevelFilter) => void;
  onStart: (levelOverride?: LevelFilter, modeOverride?: QuestMode) => void;
  onResetProgress: () => void;
  baseQuestions: WrittenQuestion[];
  writtenProgress: WrittenProgress;
  worldId: EikenLevelId;
}) {
  const questWorld = getQuestWorldByLevel(levelFilter);
  const levelSuffix = questWorld?.colorSuffix ?? "5";
  const correctCount = baseQuestions.filter((q) => writtenProgress.correctIds[q.id]).length;
  const answeredCount = baseQuestions.filter((q) => writtenProgress.answeredIds[q.id]).length;
  const progressPercent =
    baseQuestions.length > 0 ? Math.round((correctCount / baseQuestions.length) * 100) : 0;

  return (
    <main className={styles.root} style={worldBgStyle(worldId)}>
      <section className={styles.selectScreen}>
        <PageTopBar className={styles.selectTopbar} />

        <header className={cx(styles.frontierHero, styles[`frontierHero${levelSuffix}`])}>
          <div className={styles.frontierSky} aria-hidden="true">
            <span /><span /><span /><span /><span /><span />
          </div>
          <div className={styles.frontierMapLines} aria-hidden="true" />

          <div className={styles.frontierEmblem} aria-hidden="true">
            <span>✍</span>
          </div>

          <div className={styles.frontierTitleBlock}>
            <p className={styles.frontierKicker}>筆記問題バトル</p>
            <h1>筆記バトル</h1>
            <p className={styles.frontierSubtitle}>
              {questWorld?.description ?? "筆記問題をバトル形式で練習しよう！"}
            </p>
            <div className={styles.frontierStatRow}>
              <span>🛡️ {levelFilter}</span>
              <span>🌍 {questWorld?.worldName ?? "冒険ワールド"}</span>
              <span>📝 {baseQuestions.length}問</span>
              <span>✅ 正解 {correctCount}問</span>
            </div>
          </div>

          <div className={styles.frontierCommandPanel}>
            <div className={styles.frontierLevelSeal}>
              <span>選択中の級</span>
              <strong>{questWorld?.worldName ?? levelFilter}</strong>
              <small>{levelFilter} / {baseQuestions.length}問</small>
            </div>
            <div className={styles.frontierRoundButtons}>
              <button type="button" onClick={() => onStart(undefined, "complete")}>
                バトル開始
              </button>
            </div>
          </div>
        </header>

        <nav className={styles.levelRuneTabs} aria-label="級を選ぶ">
          {availableQuestWorlds
            .filter((w) => WRITTEN_LEVELS.includes(w.level as LevelFilter))
            .map((world) => {
              const level = world.level as LevelFilter;
              const isActive = level === levelFilter;
              const count = allWrittenQuestions.filter((q) => q.level === level).length;
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => onChangeLevel(level)}
                  className={cx(
                    styles.levelRuneTab,
                    styles[`levelRuneTab${world.colorSuffix}`],
                    isActive && styles.levelRuneTabActive
                  )}
                >
                  <span>{level}</span>
                  <strong>{world.worldName}</strong>
                  <small>{count}問</small>
                </button>
              );
            })}
        </nav>

        <section className={cx(styles.questBoardShell, styles[`levelSection${levelSuffix}`])}>
          <div className={styles.questBoardHeader}>
            <div>
              <p className={styles.frontierKicker}>TRAINING PROGRESS</p>
              <h2>
                {questWorld?.worldName ?? levelFilter}
                <span>{baseQuestions.length}問</span>
              </h2>
              <p className={styles.questBoardCrownHint}>
                📝 バトル形式で筆記問題を練習しよう
              </p>
            </div>
            <div className={styles.questBoardProgress}>
              <div className={styles.questBoardProgressHead}>
                <span>習得度</span>
                <strong>{progressPercent}%</strong>
              </div>
              <div className={styles.questBoardProgressTrack} aria-hidden="true">
                <div
                  className={styles.questBoardProgressFill}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className={styles.questBoardProgressStats}>
                <span><strong>{correctCount}</strong> / {baseQuestions.length} 正解</span>
                <span><strong>{answeredCount}</strong> 回答済み</span>
              </div>
            </div>
          </div>

          <div className={styles.questBoardGrid}>
            {questModeConfigList
              .filter((config) => config.mode !== "complete")
              .map((config) => {
                const questionCount = Math.min(config.questionCount, baseQuestions.length);
                const cleared = isWrittenModeCleared(writtenProgress, levelFilter, config.mode);
                return (
                  <button
                    key={config.mode}
                    type="button"
                    className={cx(
                      styles.questModeButton,
                      styles.frontierQuestCard,
                      getWrittenQuestModeClass(config.mode),
                      cleared && styles.questModeCleared
                    )}
                    onClick={() => onStart(undefined, config.mode)}
                  >
                    <div className={styles.questCardTopline}>
                      <span className={styles.questCardIcon}>{config.copy.icon}</span>
                      <span className={cx(styles.questCardState, cleared && styles.questCardStateClear)}>
                        {cleared ? "CLEAR" : "未クリア"}
                      </span>
                    </div>
                    <strong>{config.label}</strong>
                    <small className={styles.questCardName}>{config.copy.short}</small>
                    <div className={styles.questInfoPills}>
                      <span>{WRITTEN_QUEST_MODE_LABELS[config.mode]}</span>
                      <span>{questionCount}問バトル</span>
                      <span>HP0で失敗</span>
                    </div>
                  </button>
                );
              })}
            {(() => {
              const cleared = isWrittenModeCleared(writtenProgress, levelFilter, "complete");
              return (
            <button
              type="button"
              className={cx(
                styles.questModeButton,
                styles.frontierQuestCard,
                styles.questModeComplete,
                cleared && styles.questModeCleared
              )}
              onClick={() => onStart(undefined, "complete")}
            >
              <div className={styles.questCardTopline}>
                <span className={styles.questCardIcon}>👑</span>
                <span className={cx(styles.questCardState, cleared && styles.questCardStateClear)}>
                  {cleared ? "CLEAR" : "未クリア"}
                </span>
              </div>
              <strong>完全制覇</strong>
              <small className={styles.questCardName}>完全制覇を狙う</small>
              <div className={styles.questInfoPills}>
                <span>完全制覇</span>
                <span>撃破後も継続</span>
                <span>全問正解</span>
              </div>
            </button>
              );
            })()}

            <button
              type="button"
              className={cx(styles.questModeButton, styles.frontierQuestCard, styles.questModeNormal)}
              onClick={onResetProgress}
            >
              <div className={styles.questCardTopline}>
                <span className={styles.questCardIcon}>🔄</span>
                <span className={styles.questCardState}>RESET</span>
              </div>
              <strong>進行度リセット</strong>
              <small className={styles.questCardName}>正解・回答履歴を削除</small>
              <div className={styles.questInfoPills}>
                <span>⚠️ この操作は取り消せません</span>
              </div>
            </button>
          </div>
        </section>
      </section>
    </main>
  );
}

function WrittenBattleMode({
  background,
  boss,
  bossHp,
  bossMaxHp,
  playerHp,
  heroMaxHp,
  heroLevel,
  currentQuestion,
  currentQuestionNumber,
  selectedIndex,
  hasAnswered,
  isCorrect,
  answerEffect,
  locationLabel,
  onAnswer,
  worldId,
}: {
  background: QuestBackgroundConfig;
  boss: Boss;
  bossHp: number;
  bossMaxHp: number;
  playerHp: number;
  heroMaxHp: number;
  heroLevel: number;
  currentQuestion: WrittenQuestion;
  currentQuestionNumber: number;
  selectedIndex: number | null;
  hasAnswered: boolean;
  isCorrect: boolean;
  answerEffect: AnswerEffect | null;
  locationLabel: string;
  onAnswer: (index: number) => void;
  worldId: EikenLevelId;
}) {
  return (
    <main className={styles.root} style={worldBgStyle(worldId)}>
      <section className={styles.screen} aria-label="筆記バトル">
        <PageTopBar className={styles.battleTopbar} />

        <div className={styles.battleQuizGrid}>
          <WrittenBattleArea
            background={background}
            boss={boss}
            bossHp={bossHp}
            bossMaxHp={bossMaxHp}
            playerHp={playerHp}
            heroMaxHp={heroMaxHp}
            heroLevel={heroLevel}
            answerEffect={answerEffect}
          />
          <WrittenQuestionPanel
            currentQuestion={currentQuestion}
            currentQuestionNumber={currentQuestionNumber}
            locationLabel={locationLabel}
            selectedIndex={selectedIndex}
            hasAnswered={hasAnswered}
            isCorrect={isCorrect}
            onAnswer={onAnswer}
          />
        </div>
      </section>
    </main>
  );
}

function WrittenBattleArea({
  background,
  boss,
  bossHp,
  bossMaxHp,
  playerHp,
  heroMaxHp,
  heroLevel,
  answerEffect,
}: {
  background: QuestBackgroundConfig;
  boss: Boss;
  bossHp: number;
  bossMaxHp: number;
  playerHp: number;
  heroMaxHp: number;
  heroLevel: number;
  answerEffect: AnswerEffect | null;
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
          timers.push(setTimeout(() => { if (!cancelled) setIsEnemyHit(false); }, 380));
        }
      }, delay);
      timers.push(t);
      elapsed += duration;
    }
    const reset = setTimeout(() => {
      if (!cancelled) { setCurrentHeroSprite("ready"); setHeroOffsetX(0); attackingRef.current = false; }
    }, elapsed);
    timers.push(reset);
    return () => { cancelled = true; timers.forEach(clearTimeout); attackingRef.current = false; setCurrentHeroSprite("ready"); setHeroOffsetX(0); setIsEnemyHit(false); };
  }, [answerEffect]);

  const bossStyle = { "--boss-accent": boss.accent } as CSSProperties;
  const bgStyle = battleBgStyle(background);
  const defeated = bossHp <= 0;

  return (
    <section
      className={cx(styles.battleArea, styles.bossBattleBackdrop)}
      style={bgStyle}
      aria-label="バトルエリア"
    >
      <div className={styles.castleBack} aria-hidden="true">
        <span /><span /><span />
      </div>

      <div className={styles.hpLayer}>
        <div className={styles.playerHpSlot}>
          <WrittenHpMeter label="勇者HP" current={playerHp} max={heroMaxHp} />
        </div>
        <div className={styles.enemyHpSlot}>
          <WrittenHpMeter label="敵HP" current={bossHp} max={bossMaxHp} defeated={defeated} />
        </div>
      </div>

      <div className={styles.combatants}>
        <div className={cx(styles.playerUnit, answerEffect?.type === "wrong" && styles.unitHit)}>
          <div className={styles.playerSpriteGroup}>
            <WrittenHeroSprite heroLevel={heroLevel} sprite={currentHeroSprite} offsetX={heroOffsetX} />
          </div>
          {answerEffect?.type === "wrong" && (
            <span className={cx(styles.unitDamageTag, styles.unitDamageTagHero)}>
              MISS! -{answerEffect.damage}
            </span>
          )}
          <div className={styles.unitNameBlock}>
            <strong>勇者</strong>
            <span>筆記の冒険者</span>
          </div>
        </div>

        <div
          className={cx(styles.bossUnit, isEnemyHit && bossHp > 0 && styles.enemySlashHit, defeated && styles.unitDefeated)}
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
          {answerEffect?.type === "correct" && answerEffect.damage > 0 && (
            <span className={cx(styles.unitDamageTag, styles.unitDamageTagBoss)}>
              HIT! -{answerEffect.damage}
            </span>
          )}
          <div className={styles.unitNameBlock}>
            <strong>{parseBossDisplayName(boss.name).personalName}</strong>
            {parseBossDisplayName(boss.name).rank && (
              <span>{parseBossDisplayName(boss.name).rank}</span>
            )}
          </div>
        </div>
      </div>

      {answerEffect && (
        <div
          key={`${answerEffect.type}-${answerEffect.damage}`}
          className={cx(
            styles.damageCallout,
            answerEffect.type === "wrong" && styles.damageCalloutWrong
          )}
          aria-live="polite"
        >
          <strong>
            {answerEffect.type === "correct"
              ? `敵に${answerEffect.damage}ダメージ！`
              : `勇者が${answerEffect.damage}ダメージを受けた…`}
          </strong>
        </div>
      )}
    </section>
  );
}

function WrittenHpMeter({
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

function WrittenQuestionPanel({
  currentQuestion,
  currentQuestionNumber,
  locationLabel,
  selectedIndex,
  hasAnswered,
  isCorrect,
  onAnswer,
}: {
  currentQuestion: WrittenQuestion;
  currentQuestionNumber: number;
  locationLabel: string;
  selectedIndex: number | null;
  hasAnswered: boolean;
  isCorrect: boolean;
  onAnswer: (index: number) => void;
}) {
  return (
    <div className={styles.questionColumn}>
      <section className={styles.questionPanel} aria-label="筆記問題">
        <div className={styles.questionTopline}>
          <div className={styles.questLocation}>
            {currentQuestion.level}：{locationLabel}
          </div>
          <div className={styles.questionNumber}>Q.{currentQuestionNumber}</div>
        </div>

        <div className={styles.questionText}>
          <h2 className="written-q-text">{currentQuestion.question}</h2>
        </div>

        <div className={styles.answerGrid}>
          {currentQuestion.choices.map((choice, index) => {
            const isSelected = selectedIndex === index;
            const isAnswer = index === currentQuestion.answerIndex;
            return (
              <button
                key={`${currentQuestion.id}-${index}`}
                type="button"
                onClick={() => onAnswer(index)}
                disabled={hasAnswered}
                className={cx(
                  styles.answerButton,
                  hasAnswered && isAnswer && styles.answerCorrect,
                  hasAnswered && isSelected && !isAnswer && styles.answerWrong,
                  hasAnswered && !isSelected && !isAnswer && styles.answerMuted
                )}
              >
                <span className={styles.answerLabel}>
                  {String.fromCharCode(65 + index)}
                </span>
                {choice}
              </button>
            );
          })}
        </div>

        {hasAnswered && (
          <div className={isCorrect ? "written-result written-result-ok" : "written-result written-result-ng"}>
            <strong>{isCorrect ? "正解！" : "不正解..."}</strong>
            <p>{currentQuestion.explanation}</p>
            <span>{currentQuestion.japanese}</span>
          </div>
        )}
      </section>

      <style jsx>{`
        .written-q-text {
          font-size: clamp(14px, 1.9vw, 22px) !important;
          line-height: 1.5 !important;
          text-align: left !important;
        }
        .written-result {
          margin-top: 10px;
          border-radius: 14px;
          padding: 12px 16px;
          animation: wr-in 0.22s ease both;
        }
        .written-result-ok {
          border: 1px solid rgba(52, 211, 153, 0.42);
          background: rgba(52, 211, 153, 0.08);
          box-shadow: inset 3px 0 0 rgba(52, 211, 153, 0.65);
        }
        .written-result-ng {
          border: 1px solid rgba(248, 113, 113, 0.42);
          background: rgba(248, 113, 113, 0.08);
          box-shadow: inset 3px 0 0 rgba(248, 113, 113, 0.65);
        }
        .written-result strong {
          display: block;
          font-size: 13px;
          font-weight: 900;
        }
        .written-result-ok strong { color: #6ee7b7; }
        .written-result-ng strong { color: #fca5a5; }
        .written-result p {
          margin: 5px 0 0;
          color: #cbd5e1;
          font-size: 13px;
          line-height: 1.5;
          font-weight: 800;
        }
        .written-result span {
          display: block;
          margin-top: 4px;
          color: #94a3b8;
          font-size: 12px;
          font-weight: 800;
        }
        @keyframes wr-in {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function WrittenResultScreen({
  correctCount,
  totalQuestions,
  scoreRate,
  totalGold,
  totalExp,
  worldId,
  levelFilter,
  questMode,
  gameStatus,
  gameOverReason,
  bossDefeatedQuestionNumber,
  questionCount,
  onRestart,
  onBackToSelect,
}: {
  correctCount: number;
  totalQuestions: number;
  scoreRate: number;
  totalGold: number;
  totalExp: number;
  worldId: EikenLevelId;
  levelFilter: LevelFilter;
  questMode: QuestMode;
  gameStatus: GameStatus;
  gameOverReason: GameOverReason;
  bossDefeatedQuestionNumber: number | null;
  questionCount: number;
  onRestart: () => void;
  onBackToSelect: () => void;
}) {
  const isClear = gameStatus === "clear";
  const isPerfect = isClear && correctCount === questionCount && questionCount > 0;
  const resultKicker = !isClear
    ? "QUEST FAILED"
    : isPerfect
      ? "PERFECT CLEAR"
      : "QUEST CLEAR";
  const resultTitle = !isClear
    ? "クエスト失敗..."
    : isPerfect
      ? "完全制覇！"
      : "クエストクリア！";
  const questName = levelFilter + " " + (questMode === "complete" ? "完全制覇" : WRITTEN_QUEST_MODE_LABELS[questMode]);
  const resultMessage = !isClear
    ? gameOverReason === "heroHpZero"
      ? "勇者のHPが0になりました。ミスした問題を復習して、もう一度挑戦しましょう。"
      : "ボスを倒しきれませんでした。正解数を増やして再挑戦しましょう。"
    : isPerfect
      ? "全問正解で筆記クエストを突破しました。"
      : bossDefeatedQuestionNumber
        ? `${bossDefeatedQuestionNumber}問目でボスを撃破しました。${correctCount} / ${totalQuestions}問正解です。`
        : `${correctCount} / ${totalQuestions}問正解で筆記クエストをクリアしました。`;

  return (
    <main className={styles.root} style={worldBgStyle(worldId)}>
      <section className={cx(styles.screen, styles.resultScreen)}>
        <WrittenHeader />

        <section
          className={cx(
            styles.resultPanel,
            !isClear && styles.resultGameOver,
            isClear && (isPerfect ? styles.resultPerfect : styles.resultClear)
          )}
        >
          <div className={styles.resultHeroArea}>
            <p className={styles.resultKicker}>{resultKicker}</p>
            <h1 className={styles.resultTitle}>{resultTitle}</h1>
            <p className={styles.resultQuestName}>{questName}</p>
            <p className={styles.resultMessage}>{resultMessage}</p>
          </div>

          <section className={styles.resultSummaryCard}>
            <div className={styles.resultSummaryHeader}>
              <span>結果サマリー</span>
              {!isClear && <strong>再挑戦</strong>}
              {isPerfect && <strong>パーフェクト</strong>}
            </div>
            <div className={styles.resultSummaryGrid}>
              <div className={styles.resultSummaryItem}>
                <span>{questMode === "complete" ? "正解 / 全問" : "正解 / 回答"}</span>
                <strong>{correctCount} / {totalQuestions}</strong>
              </div>
              <div className={styles.resultSummaryItem}>
                <span>正答率</span>
                <strong>{scoreRate}%</strong>
              </div>
              <div className={cx(styles.resultSummaryItem, styles.resultSummaryExp)}>
                <span>獲得経験値</span>
                <strong>+{totalExp}EXP</strong>
              </div>
              <div className={cx(styles.resultSummaryItem, styles.resultSummaryGold)}>
                <span>獲得ゴールド</span>
                <strong>+{totalGold}G</strong>
              </div>
            </div>
          </section>

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
              選択に戻る
            </button>
            <Link href="/" className={styles.resultAction}>
              ホーム
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}
