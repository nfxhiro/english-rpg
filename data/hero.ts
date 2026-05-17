export type HeroStatus = {
  level: number;
  exp: number;
  totalExp: number;
  title: string;
};

export type HeroExpResult = {
  before: HeroStatus;
  after: HeroStatus;
  gainedExp: number;
  leveledUp: boolean;
  levelUpCount: number;
};

export const MAX_HERO_LEVEL = 99;

export function getHeroTitle(level: number) {
  if (level >= 99) return "伝説の英語勇者";
  if (level >= 90) return "Eiken Quest Frontier マスター";
  if (level >= 70) return "伝説の冒険者";
  if (level >= 50) return "英語王";
  if (level >= 40) return "英語マスター";
  if (level >= 30) return "英語賢者";
  if (level >= 20) return "英語騎士";
  if (level >= 10) return "単語の勇者";
  if (level >= 5) return "英語の旅人";

  return "見習い冒険者";
}

export function getRequiredExpForNextLevel(level: number) {
  if (level >= MAX_HERO_LEVEL) return null;

  return level * 100;
}

export function createInitialHeroStatus(): HeroStatus {
  return {
    level: 1,
    exp: 0,
    totalExp: 0,
    title: getHeroTitle(1),
  };
}

export function normalizeHeroStatus(hero: HeroStatus): HeroStatus {
  const safeLevel = Math.min(
    Math.max(Number(hero.level) || 1, 1),
    MAX_HERO_LEVEL
  );

  const requiredExp = getRequiredExpForNextLevel(safeLevel);

  return {
    level: safeLevel,
    exp: requiredExp === null ? 0 : Math.max(Number(hero.exp) || 0, 0),
    totalExp: Math.max(Number(hero.totalExp) || 0, 0),
    title: getHeroTitle(safeLevel),
  };
}

export function loadHeroStatus(): HeroStatus {
  if (typeof window === "undefined") {
    return createInitialHeroStatus();
  }

  const savedHeroText = localStorage.getItem("heroStatus");

  if (!savedHeroText) {
    return createInitialHeroStatus();
  }

  try {
    const savedHero = JSON.parse(savedHeroText) as HeroStatus;
    return normalizeHeroStatus(savedHero);
  } catch {
    return createInitialHeroStatus();
  }
}

export function saveHeroStatus(hero: HeroStatus) {
  localStorage.setItem("heroStatus", JSON.stringify(normalizeHeroStatus(hero)));
}

export function addHeroExp(currentHero: HeroStatus, gainedExp: number): HeroExpResult {
  const before = normalizeHeroStatus(currentHero);

  if (before.level >= MAX_HERO_LEVEL) {
    const after: HeroStatus = {
      ...before,
      level: MAX_HERO_LEVEL,
      exp: 0,
      totalExp: before.totalExp + gainedExp,
      title: getHeroTitle(MAX_HERO_LEVEL),
    };

    return {
      before,
      after,
      gainedExp,
      leveledUp: false,
      levelUpCount: 0,
    };
  }

  let nextLevel = before.level;
  let nextExp = before.exp + gainedExp;
  let levelUpCount = 0;

  while (nextLevel < MAX_HERO_LEVEL) {
    const requiredExp = getRequiredExpForNextLevel(nextLevel);

    if (requiredExp === null || nextExp < requiredExp) {
      break;
    }

    nextExp -= requiredExp;
    nextLevel += 1;
    levelUpCount += 1;
  }

  if (nextLevel >= MAX_HERO_LEVEL) {
    nextLevel = MAX_HERO_LEVEL;
    nextExp = 0;
  }

  const after: HeroStatus = {
    level: nextLevel,
    exp: nextExp,
    totalExp: before.totalExp + gainedExp,
    title: getHeroTitle(nextLevel),
  };

  return {
    before,
    after,
    gainedExp,
    leveledUp: levelUpCount > 0,
    levelUpCount,
  };
}

export function loadGold(): number {
  if (typeof window === "undefined") return 0;
  const value = Number(localStorage.getItem("heroGold") ?? "0");
  return Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0;
}

export function saveGold(amount: number) {
  localStorage.setItem("heroGold", String(Math.max(0, Math.floor(amount))));
}

export function getHeroGoldBonusRate(level: number): number {
  const safeLevel = Math.min(Math.max(Math.floor(Number(level) || 1), 1), MAX_HERO_LEVEL);

  if (safeLevel >= 99) return 0.5;
  if (safeLevel >= 90) return 0.4;
  if (safeLevel >= 70) return 0.3;
  if (safeLevel >= 50) return 0.25;
  if (safeLevel >= 40) return 0.2;
  if (safeLevel >= 30) return 0.15;
  if (safeLevel >= 20) return 0.1;
  if (safeLevel >= 10) return 0.05;

  return 0;
}

export const MAX_TOTAL_GOLD_BONUS_RATE = 1;

export function clampGoldBonusRate(rate: number): number {
  const safeRate = Number.isFinite(rate) ? rate : 0;

  return Math.min(Math.max(safeRate, 0), MAX_TOTAL_GOLD_BONUS_RATE);
}

export function applyGoldBonus(baseGold: number, bonusRate: number): number {
  const safeBaseGold = Math.max(0, Math.floor(Number(baseGold) || 0));

  return Math.floor(safeBaseGold * (1 + clampGoldBonusRate(bonusRate)));
}

export function applyHeroGoldBonus(baseGold: number, heroLevel: number): number {
  return applyGoldBonus(baseGold, getHeroGoldBonusRate(heroLevel));
}

export function addGold(amount: number): number {
  const next = loadGold() + Math.max(0, Math.floor(amount));
  saveGold(next);
  return next;
}

export function spendGold(amount: number): boolean {
  const current = loadGold();
  if (current < amount) return false;
  saveGold(current - amount);
  return true;
}

export function getHeroExpProgress(hero: HeroStatus) {
  const normalizedHero = normalizeHeroStatus(hero);
  const requiredExp = getRequiredExpForNextLevel(normalizedHero.level);

  if (requiredExp === null) {
    return {
      currentExp: 0,
      requiredExp: null,
      percent: 100,
      isMaxLevel: true,
    };
  }

  return {
    currentExp: normalizedHero.exp,
    requiredExp,
    percent: Math.min(Math.round((normalizedHero.exp / requiredExp) * 100), 100),
    isMaxLevel: false,
  };
}
