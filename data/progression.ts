import {
  availableQuestWorlds,
  type EikenLevelId,
  type QuestMode,
} from "./questConfig";
import {
  EarnedCard,
  getMonsterCardById,
  getOwnedCount,
  monsterCards,
  MonsterCard,
  Rarity,
} from "./cards";

export const MAX_MONSTER_LEVEL = 20;

export const BUDDY_QUEST_EXP_REWARDS: Record<QuestMode, number> = {
  mini: 10,
  normal: 30,
  boss: 50,
  complete: 100,
};

const DEFAULT_BUDDY_EXP_REWARD = BUDDY_QUEST_EXP_REWARDS.mini;

export type TitleCategory = "learning" | "eiken" | "card" | "buddy";

export type QuestProgressSnapshot = Record<
  string,
  {
    miniCleared?: boolean;
    normalCleared?: boolean;
    bossCleared?: boolean;
    completeCleared?: boolean;
    crowned?: boolean;
  }
>;

export type ProgressionContext = {
  heroLevel: number;
  earnedCards: EarnedCard[];
  selectedMonsterCardId?: string | null;
  questProgress?: QuestProgressSnapshot;
};

export type ProgressionTitle = {
  id: string;
  category: TitleCategory;
  label: string;
  icon: string;
  description: string;
  conditionLabel: string;
  level?: number;
  isUnlocked: (context: ProgressionContext) => boolean;
};

export type UnlockableBackground = {
  id: string;
  label: string;
  icon: string;
  category: "learning" | "card" | "buddy";
  description: string;
  conditionLabel: string;
  backgroundCss: string;
  isUnlocked: (context: ProgressionContext) => boolean;
};

export type MonsterLevelProgress = {
  level: number;
  maxLevel: number;
  currentExp: number;
  requiredExp: number;
  remainingExp: number;
  totalExp: number;
  percent: number;
  isMaxLevel: boolean;
};

export type BuddyExpResult = {
  updated: boolean;
  earnedCards: EarnedCard[];
  earnedCard?: EarnedCard;
  gainedExp: number;
  before: MonsterLevelProgress;
  after: MonsterLevelProgress;
  leveledUp: boolean;
};

export const TITLE_CATEGORY_LABELS: Record<TitleCategory, string> = {
  learning: "学習",
  eiken: "英検",
  card: "カード",
  buddy: "相棒",
};

export const LEARNING_TITLES: ProgressionTitle[] = [
  {
    id: "learning-lv-1",
    category: "learning",
    level: 1,
    label: "はじまりの勇者",
    icon: "🌱",
    description: "英語の冒険を始めたばかりの見習い冒険者。",
    conditionLabel: "主人公Lv1",
    isUnlocked: (context) => context.heroLevel >= 1,
  },
  {
    id: "learning-lv-3",
    category: "learning",
    level: 3,
    label: "単語の剣士",
    icon: "⚔️",
    description: "基本単語を武器に、クエストを進められるようになった冒険者。",
    conditionLabel: "主人公Lv3",
    isUnlocked: (context) => context.heroLevel >= 3,
  },
  {
    id: "learning-lv-5",
    category: "learning",
    level: 5,
    label: "英文の魔法使い",
    icon: "🪄",
    description: "単語だけでなく、例文の意味もつかめるようになってきた冒険者。",
    conditionLabel: "主人公Lv5",
    isUnlocked: (context) => context.heroLevel >= 5,
  },
  {
    id: "learning-lv-8",
    category: "learning",
    level: 8,
    label: "英検チャレンジャー",
    icon: "🏆",
    description: "英検レベルの問題にも挑戦できる力が育ってきた冒険者。",
    conditionLabel: "主人公Lv8",
    isUnlocked: (context) => context.heroLevel >= 8,
  },
  {
    id: "learning-lv-10",
    category: "learning",
    level: 10,
    label: "冒険の探求者",
    icon: "🔍",
    description: "知らない単語でも意味を推測できる力がついてきた冒険者。",
    conditionLabel: "主人公Lv10",
    isUnlocked: (context) => context.heroLevel >= 10,
  },
  {
    id: "learning-lv-20",
    category: "learning",
    level: 20,
    label: "英語の守護者",
    icon: "🛡️",
    description: "覚えた言葉を守り、何度も磨き続ける冒険者。",
    conditionLabel: "主人公Lv20",
    isUnlocked: (context) => context.heroLevel >= 20,
  },
  {
    id: "learning-lv-30",
    category: "learning",
    level: 30,
    label: "英語の騎士",
    icon: "🏰",
    description: "英文法の理解が深まり、難しい問題にも立ち向かえる騎士。",
    conditionLabel: "主人公Lv30",
    isUnlocked: (context) => context.heroLevel >= 30,
  },
  {
    id: "learning-lv-40",
    category: "learning",
    level: 40,
    label: "英語の英雄",
    icon: "💎",
    description: "膨大な英単語の知識を武器に、あらゆる問題を制する英雄。",
    conditionLabel: "主人公Lv40",
    isUnlocked: (context) => context.heroLevel >= 40,
  },
  {
    id: "learning-lv-50",
    category: "learning",
    level: 50,
    label: "英語の達人",
    icon: "🌟",
    description: "数多くのクエストをくぐり抜けた、英語の達人。",
    conditionLabel: "主人公Lv50",
    isUnlocked: (context) => context.heroLevel >= 50,
  },
  {
    id: "learning-lv-60",
    category: "learning",
    level: 60,
    label: "試練の覇者",
    icon: "📚",
    description: "試練を越え、英語の知識と知恵を兼ね備えた覇者。",
    conditionLabel: "主人公Lv60",
    isUnlocked: (context) => context.heroLevel >= 60,
  },
  {
    id: "learning-lv-70",
    category: "learning",
    level: 70,
    label: "英単語の覇者",
    icon: "⚡",
    description: "英語の壁をことごとく打ち破ってきた、無敵の冒険者。",
    conditionLabel: "主人公Lv70",
    isUnlocked: (context) => context.heroLevel >= 70,
  },
  {
    id: "learning-lv-80",
    category: "learning",
    level: 80,
    label: "英語の伝説",
    icon: "🔥",
    description: "その名が語り継がれるほどの功績を残した、伝説の冒険者。",
    conditionLabel: "主人公Lv80",
    isUnlocked: (context) => context.heroLevel >= 80,
  },
  {
    id: "learning-lv-90",
    category: "learning",
    level: 90,
    label: "英検マスター",
    icon: "🌙",
    description: "英検の試練を越え、英語学習の頂点へ近づいたマスター。",
    conditionLabel: "主人公Lv90",
    isUnlocked: (context) => context.heroLevel >= 90,
  },
  {
    id: "learning-lv-99",
    category: "learning",
    level: 99,
    label: "究極の英語勇者",
    icon: "👑",
    description: "英語の冒険を極め、伝説を超えた究極の英語勇者。",
    conditionLabel: "主人公Lv99",
    isUnlocked: (context) => context.heroLevel >= 99,
  },
];

const EIKEN_TITLES: ProgressionTitle[] = [
  {
    id: "eiken-5-frontier",
    category: "eiken",
    label: "5級フロンティア踏破者",
    icon: "🗺️",
    description: "英検5級ワールドで大きな一歩を刻んだ冒険者。",
    conditionLabel: "英検5級ワールドのクエストをクリア",
    isUnlocked: (context) => hasAnyWorldClear(context, "eiken5"),
  },
  {
    id: "eiken-4-frontier",
    category: "eiken",
    label: "4級ゲートの開拓者",
    icon: "🔷",
    description: "英検4級の関門へ踏み込み、世界を広げた冒険者。",
    conditionLabel: "英検4級ワールドのクエストをクリア",
    isUnlocked: (context) => hasAnyWorldClear(context, "eiken4"),
  },
  {
    id: "eiken-3-frontier",
    category: "eiken",
    label: "3級魔導戦士",
    icon: "🪄",
    description: "英検3級の知識を魔力に変え、前線を切り開く戦士。",
    conditionLabel: "英検3級ワールドのクエストをクリア",
    isUnlocked: (context) => hasAnyWorldClear(context, "eiken3"),
  },
  {
    id: "eiken-pre2-frontier",
    category: "eiken",
    label: "準2級フロンティア騎士",
    icon: "🏰",
    description: "準2級の深い領域を進む、フロンティアの騎士。",
    conditionLabel: "英検準2級ワールドのクエストをクリア",
    isUnlocked: (context) => hasAnyWorldClear(context, "eiken_pre2"),
  },
];

const CARD_TITLES: ProgressionTitle[] = [
  {
    id: "card-first-contract",
    category: "card",
    label: "初めての契約者",
    icon: "🤝",
    description: "初めてモンスターカードと契約した召喚士。",
    conditionLabel: "カードを1種類入手",
    isUnlocked: (context) => getOwnedCardTypeCount(context.earnedCards) >= 1,
  },
  {
    id: "card-collector",
    category: "card",
    label: "カードコレクター",
    icon: "🃏",
    description: "仲間との契約を重ね、図鑑を広げるコレクター。",
    conditionLabel: "カードを10種類入手",
    isUnlocked: (context) => getOwnedCardTypeCount(context.earnedCards) >= 10,
  },
  {
    id: "card-rare-hunter",
    category: "card",
    label: "レアハンター",
    icon: "💎",
    description: "SR以上の仲間を見つけ出す、鋭い召喚の目を持つ者。",
    conditionLabel: "SR以上のカードを5種類入手",
    isUnlocked: (context) => getOwnedSrPlusTypeCount(context.earnedCards) >= 5,
  },
  {
    id: "card-rainbow-contract",
    category: "card",
    label: "虹の契約者",
    icon: "🌈",
    description: "URカードと契約した、虹色の召喚士。",
    conditionLabel: "URカードを1種類入手",
    isUnlocked: (context) => getOwnedUrTypeCount(context.earnedCards) >= 1,
  },
  {
    id: "card-dex-seeker",
    category: "card",
    label: "図鑑の探究者",
    icon: "📘",
    description: "100種類の仲間を記録し、図鑑の深部へ進む探究者。",
    conditionLabel: "カードを100種類入手",
    isUnlocked: (context) => getOwnedCardTypeCount(context.earnedCards) >= 100,
  },
  {
    id: "card-frontier-summoner",
    category: "card",
    label: "フロンティア召喚士",
    icon: "✨",
    description: "200種類の仲間と契約した、フロンティアを代表する召喚士。",
    conditionLabel: "カードを200種類入手",
    isUnlocked: (context) => getOwnedCardTypeCount(context.earnedCards) >= 200,
  },
];

const BUDDY_TITLES: ProgressionTitle[] = [
  {
    id: "buddy-first",
    category: "buddy",
    label: "相棒と歩む者",
    icon: "🐾",
    description: "お気に入りモンスターを相棒に選んだ冒険者。",
    conditionLabel: "お気に入りモンスターを設定",
    isUnlocked: (context) => Boolean(getBuddyState(context)?.earnedCard),
  },
  {
    id: "buddy-bond-lv5",
    category: "buddy",
    label: "絆の冒険者",
    icon: "💠",
    description: "相棒との絆を育て、Lv5まで成長させた冒険者。",
    conditionLabel: "相棒モンスターLv5",
    isUnlocked: (context) => (getBuddyState(context)?.levelProgress.level ?? 0) >= 5,
  },
  {
    id: "buddy-soul-lv10",
    category: "buddy",
    label: "魂の契約者",
    icon: "🔮",
    description: "相棒と魂で結ばれた、深い契約の持ち主。",
    conditionLabel: "相棒モンスターLv10",
    isUnlocked: (context) => (getBuddyState(context)?.levelProgress.level ?? 0) >= 10,
  },
  {
    id: "buddy-awakening-guide",
    category: "buddy",
    label: "覚醒の導き手",
    icon: "🌌",
    description: "相棒の覚醒を導き、新たな力を引き出した者。",
    conditionLabel: "相棒モンスター覚醒Lv1",
    isUnlocked: (context) => (getBuddyState(context)?.awakeningLevel ?? 0) >= 1,
  },
  {
    id: "buddy-legend",
    category: "buddy",
    label: "伝説の相棒使い",
    icon: "👑",
    description: "Lv20と覚醒Lv3へ至った相棒と共に歩む伝説の冒険者。",
    conditionLabel: "相棒Lv20 かつ 覚醒Lv3",
    isUnlocked: (context) => {
      const buddy = getBuddyState(context);
      return Boolean(
        buddy &&
          buddy.levelProgress.level >= MAX_MONSTER_LEVEL &&
          buddy.awakeningLevel >= 3
      );
    },
  },
];

export const PROGRESSION_TITLES: ProgressionTitle[] = [
  ...LEARNING_TITLES,
  ...EIKEN_TITLES,
  ...CARD_TITLES,
  ...BUDDY_TITLES,
];

export const UNLOCKABLE_BACKGROUNDS: UnlockableBackground[] = [
  {
    id: "bg_beginning_forest",
    label: "はじまりの森",
    icon: "🌲",
    category: "learning",
    description: "冒険の始まりを刻む、静かな夜の森。",
    conditionLabel: "初期解放",
    backgroundCss:
      "radial-gradient(circle at 20% 18%, rgba(34,197,94,0.22), transparent 36%), radial-gradient(circle at 82% 76%, rgba(34,211,238,0.14), transparent 38%), linear-gradient(145deg, #06130f 0%, #0b1f27 54%, #050816 100%)",
    isUnlocked: () => true,
  },
  {
    id: "bg_adventurer_camp",
    label: "冒険者の野営地",
    icon: "⛺",
    category: "learning",
    description: "炎の灯りと星空が見守る、冒険者の休息地。",
    conditionLabel: "主人公Lv10",
    backgroundCss:
      "radial-gradient(circle at 50% 72%, rgba(251,146,60,0.26), transparent 28%), radial-gradient(circle at 24% 16%, rgba(34,211,238,0.14), transparent 34%), linear-gradient(145deg, #120b10 0%, #1d1634 48%, #050816 100%)",
    isUnlocked: (context) => context.heroLevel >= 10,
  },
  {
    id: "bg_training_ground",
    label: "英語の修練場",
    icon: "⚔️",
    category: "learning",
    description: "言葉を鍛えるための、青い魔力が満ちる修練場。",
    conditionLabel: "主人公Lv20",
    backgroundCss:
      "radial-gradient(circle at 70% 24%, rgba(34,211,238,0.28), transparent 34%), radial-gradient(circle at 20% 80%, rgba(250,204,21,0.16), transparent 32%), linear-gradient(145deg, #07111f 0%, #0b2442 52%, #050816 100%)",
    isUnlocked: (context) => context.heroLevel >= 20,
  },
  {
    id: "bg_ancient_ruins",
    label: "古代遺跡",
    icon: "🪨",
    category: "learning",
    description: "古い言葉の魔法が眠る、深き紺碧の遺跡。",
    conditionLabel: "主人公Lv40",
    backgroundCss:
      "radial-gradient(circle at 18% 26%, rgba(168,85,247,0.2), transparent 34%), radial-gradient(circle at 74% 68%, rgba(34,211,238,0.18), transparent 34%), linear-gradient(145deg, #0a0d1c 0%, #161331 48%, #050816 100%)",
    isUnlocked: (context) => context.heroLevel >= 40,
  },
  {
    id: "bg_trial_temple",
    label: "試練の神殿",
    icon: "🏛️",
    category: "learning",
    description: "数多の試練を越えた者だけが立てる神殿。",
    conditionLabel: "主人公Lv60",
    backgroundCss:
      "radial-gradient(circle at 50% 0%, rgba(250,204,21,0.22), transparent 38%), radial-gradient(circle at 82% 70%, rgba(168,85,247,0.2), transparent 34%), linear-gradient(145deg, #111827 0%, #241a3f 54%, #050816 100%)",
    isUnlocked: (context) => context.heroLevel >= 60,
  },
  {
    id: "bg_sky_castle",
    label: "伝説の天空城",
    icon: "🏰",
    category: "learning",
    description: "天空へ届く伝説の城。青白い光が王道を照らす。",
    conditionLabel: "主人公Lv80",
    backgroundCss:
      "radial-gradient(circle at 18% 10%, rgba(34,211,238,0.3), transparent 32%), radial-gradient(circle at 86% 22%, rgba(250,204,21,0.18), transparent 32%), linear-gradient(145deg, #061025 0%, #0f1f4a 50%, #050816 100%)",
    isUnlocked: (context) => context.heroLevel >= 80,
  },
  {
    id: "bg_frontier_throne",
    label: "フロンティア玉座",
    icon: "👑",
    category: "learning",
    description: "究極の英語勇者が座す、フロンティア最奥の玉座。",
    conditionLabel: "主人公Lv99",
    backgroundCss:
      "radial-gradient(circle at 50% 6%, rgba(250,204,21,0.32), transparent 34%), radial-gradient(circle at 16% 82%, rgba(34,211,238,0.22), transparent 32%), radial-gradient(circle at 88% 78%, rgba(168,85,247,0.28), transparent 34%), linear-gradient(145deg, #050816 0%, #15102f 44%, #21113a 74%, #050816 100%)",
    isUnlocked: (context) => context.heroLevel >= 99,
  },
  {
    id: "bg_fire_gate",
    label: "炎の関門",
    icon: "🔥",
    category: "card",
    description: "火属性の仲間が集う、赤い召喚門。",
    conditionLabel: "火属性カード10種類所持",
    backgroundCss:
      "radial-gradient(circle at 50% 76%, rgba(239,68,68,0.34), transparent 32%), radial-gradient(circle at 78% 20%, rgba(250,204,21,0.2), transparent 32%), linear-gradient(145deg, #19070a 0%, #351018 54%, #050816 100%)",
    isUnlocked: (context) => getOwnedAttributeTypeCount(context.earnedCards, ["fire"]) >= 10,
  },
  {
    id: "bg_deep_sea_temple",
    label: "深海神殿",
    icon: "🌊",
    category: "card",
    description: "水と海の仲間が守る、静かな深海の神殿。",
    conditionLabel: "海属性カード10種類所持",
    backgroundCss:
      "radial-gradient(circle at 20% 20%, rgba(34,211,238,0.26), transparent 36%), radial-gradient(circle at 78% 78%, rgba(59,130,246,0.24), transparent 38%), linear-gradient(145deg, #021021 0%, #07304a 52%, #050816 100%)",
    isUnlocked: (context) => getOwnedAttributeTypeCount(context.earnedCards, ["water"]) >= 10,
  },
  {
    id: "bg_starfall_tower",
    label: "星降る塔",
    icon: "🌟",
    category: "card",
    description: "星属性の仲間と響き合う、夜空へ伸びる塔。",
    conditionLabel: "星属性カード5種類所持",
    backgroundCss:
      "radial-gradient(circle at 50% 18%, rgba(250,204,21,0.22), transparent 34%), radial-gradient(circle at 80% 72%, rgba(34,211,238,0.2), transparent 34%), linear-gradient(145deg, #050816 0%, #111744 52%, #08091e 100%)",
    isUnlocked: (context) => getOwnedAttributeTypeCount(context.earnedCards, ["light"]) >= 5,
  },
  {
    id: "bg_rainbow_circle",
    label: "虹の召喚陣",
    icon: "🌈",
    category: "card",
    description: "URの契約によって開く、虹色の召喚陣。",
    conditionLabel: "URカードを1種類入手",
    backgroundCss:
      "radial-gradient(circle at 50% 50%, rgba(250,204,21,0.22), transparent 28%), radial-gradient(circle at 20% 20%, rgba(34,211,238,0.2), transparent 32%), radial-gradient(circle at 80% 18%, rgba(244,114,182,0.18), transparent 32%), radial-gradient(circle at 78% 82%, rgba(34,197,94,0.16), transparent 34%), linear-gradient(145deg, #050816 0%, #15102d 58%, #050816 100%)",
    isUnlocked: (context) => getOwnedUrTypeCount(context.earnedCards) >= 1,
  },
  {
    id: "bg_buddy_sanctuary",
    label: "相棒の聖域",
    icon: "💠",
    category: "buddy",
    description: "相棒との絆が満ちた、静かな聖域。",
    conditionLabel: "相棒モンスターLv20",
    backgroundCss:
      "radial-gradient(circle at 50% 18%, rgba(34,211,238,0.3), transparent 34%), radial-gradient(circle at 50% 82%, rgba(52,211,153,0.18), transparent 34%), linear-gradient(145deg, #041617 0%, #0b2638 54%, #050816 100%)",
    isUnlocked: (context) => (getBuddyState(context)?.levelProgress.level ?? 0) >= MAX_MONSTER_LEVEL,
  },
  {
    id: "bg_awakening_altar",
    label: "覚醒の祭壇",
    icon: "🌌",
    category: "buddy",
    description: "覚醒Lv3へ到達した相棒だけが灯せる祭壇。",
    conditionLabel: "相棒モンスター覚醒Lv3",
    backgroundCss:
      "radial-gradient(circle at 50% 10%, rgba(250,204,21,0.22), transparent 30%), radial-gradient(circle at 24% 78%, rgba(168,85,247,0.24), transparent 36%), radial-gradient(circle at 78% 76%, rgba(34,211,238,0.18), transparent 34%), linear-gradient(145deg, #090716 0%, #20113c 56%, #050816 100%)",
    isUnlocked: (context) => (getBuddyState(context)?.awakeningLevel ?? 0) >= 3,
  },
];

export function loadQuestProgressSnapshot(): QuestProgressSnapshot {
  if (typeof window === "undefined") return {};

  try {
    const raw = localStorage.getItem("eikenQuestFrontierProgress");
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function getAwakeningLevel(ownedCount = 0): 0 | 1 | 2 | 3 {
  if (ownedCount >= 10) return 3;
  if (ownedCount >= 5) return 2;
  if (ownedCount >= 3) return 1;
  return 0;
}

export function getNextAwakeningRequirement(ownedCount = 0) {
  if (ownedCount < 3) {
    return {
      targetLevel: 1,
      requiredCopies: 3,
      remainingCopies: 3 - ownedCount,
    };
  }

  if (ownedCount < 5) {
    return {
      targetLevel: 2,
      requiredCopies: 5,
      remainingCopies: 5 - ownedCount,
    };
  }

  if (ownedCount < 10) {
    return {
      targetLevel: 3,
      requiredCopies: 10,
      remainingCopies: 10 - ownedCount,
    };
  }

  return null;
}

export function getAwakeningClassName(awakeningLevel: number) {
  return awakeningLevel > 0 ? `awakening-${awakeningLevel}` : "";
}

export function getRequiredMonsterExpForNextLevel(level: number) {
  return Math.max(20, level * 20);
}

export function getBuddyQuestExpReward(mode: QuestMode) {
  return BUDDY_QUEST_EXP_REWARDS[mode] ?? 0;
}

export function getPartnerLevelGoldBonusRate(level: number) {
  const safeLevel = Math.min(Math.max(Math.floor(Number(level) || 1), 1), MAX_MONSTER_LEVEL);

  if (safeLevel >= 20) return 0.25;
  if (safeLevel >= 15) return 0.18;
  if (safeLevel >= 10) return 0.1;
  if (safeLevel >= 5) return 0.05;

  return 0;
}

export function getPartnerRarityGoldBonusRate(rarity: Rarity | null | undefined) {
  if (rarity === "SAR") return 0.3;
  if (rarity === "UR") return 0.25;
  if (rarity === "SSR") return 0.15;
  if (rarity === "SR") return 0.1;
  if (rarity === "R") return 0.05;

  return 0;
}

export function getMaxMonsterExp() {
  let total = 0;

  for (let level = 1; level < MAX_MONSTER_LEVEL; level += 1) {
    total += getRequiredMonsterExpForNextLevel(level);
  }

  return total;
}

export function normalizeMonsterExp(exp = 0) {
  const safeExp = Math.max(0, Math.floor(Number(exp) || 0));
  return Math.min(safeExp, getMaxMonsterExp());
}

export function getMonsterLevelProgress(exp = 0): MonsterLevelProgress {
  let level = 1;
  let currentExp = normalizeMonsterExp(exp);

  while (level < MAX_MONSTER_LEVEL) {
    const requiredExp = getRequiredMonsterExpForNextLevel(level);
    if (currentExp < requiredExp) break;
    currentExp -= requiredExp;
    level += 1;
  }

  const isMaxLevel = level >= MAX_MONSTER_LEVEL;
  const requiredExp = isMaxLevel ? 0 : getRequiredMonsterExpForNextLevel(level);
  const remainingExp = isMaxLevel ? 0 : Math.max(0, requiredExp - currentExp);

  return {
    level,
    maxLevel: MAX_MONSTER_LEVEL,
    currentExp: isMaxLevel ? 0 : currentExp,
    requiredExp,
    remainingExp,
    totalExp: normalizeMonsterExp(exp),
    percent: isMaxLevel ? 100 : Math.round((currentExp / requiredExp) * 100),
    isMaxLevel,
  };
}

export function getMonsterGrowthStage(level: number) {
  if (level >= 20) return "マスター";
  if (level >= 15) return "達人";
  if (level >= 10) return "熟練";
  if (level >= 5) return "成長中";
  return "見習い";
}

export function getMonsterNextExpLabel(progress: MonsterLevelProgress) {
  if (progress.isMaxLevel) return "Lv.20到達済み";
  return `あと${progress.remainingExp}EXPでLv.${progress.level + 1}`;
}

export function addBuddyExpToEarnedCards(
  earnedCards: EarnedCard[],
  cardId: string,
  gainedExp = DEFAULT_BUDDY_EXP_REWARD
): BuddyExpResult {
  const currentEarnedCard = earnedCards.find((earnedCard) => earnedCard.cardId === cardId);
  const before = getMonsterLevelProgress(currentEarnedCard?.exp ?? 0);

  if (!currentEarnedCard) {
    return {
      updated: false,
      earnedCards,
      gainedExp: 0,
      before,
      after: before,
      leveledUp: false,
    };
  }

  const now = new Date().toISOString();
  const normalizedCurrentExp = normalizeMonsterExp(currentEarnedCard.exp ?? 0);
  const normalizedCurrentCard: EarnedCard = {
    ...currentEarnedCard,
    correctCount: Math.max(0, Math.floor(Number(currentEarnedCard.correctCount) || 0)),
    exp: normalizedCurrentExp,
    obtainedAt: currentEarnedCard.obtainedAt ?? now,
  };

  if (before.isMaxLevel) {
    const nextEarnedCards = earnedCards.map((earnedCard) =>
      earnedCard.cardId === cardId ? normalizedCurrentCard : earnedCard
    );

    return {
      updated: normalizedCurrentExp !== (currentEarnedCard.exp ?? 0),
      earnedCards: nextEarnedCards,
      earnedCard: normalizedCurrentCard,
      gainedExp: 0,
      before,
      after: before,
      leveledUp: false,
    };
  }

  const safeGainedExp = Math.max(0, Math.floor(Number(gainedExp) || 0));
  const nextExp = normalizeMonsterExp(normalizedCurrentExp + safeGainedExp);
  const actualGainedExp = Math.max(0, nextExp - normalizedCurrentExp);
  const nextEarnedCard: EarnedCard = {
    ...normalizedCurrentCard,
    correctCount: normalizedCurrentCard.correctCount + 1,
    exp: nextExp,
  };
  const nextEarnedCards = earnedCards.map((earnedCard) =>
    earnedCard.cardId === cardId ? nextEarnedCard : earnedCard
  );
  const after = getMonsterLevelProgress(nextEarnedCard.exp);

  return {
    updated: true,
    earnedCards: nextEarnedCards,
    earnedCard: nextEarnedCard,
    gainedExp: actualGainedExp,
    before,
    after,
    leveledUp: after.level > before.level,
  };
}

export function getOwnedCardTypeCount(earnedCards: EarnedCard[]) {
  return earnedCards.length;
}

export function getOwnedSrPlusTypeCount(earnedCards: EarnedCard[]) {
  const ownedCardIds = new Set(earnedCards.map((card) => card.cardId));
  return monsterCards.filter((card) => ownedCardIds.has(card.id) && isRarityAtLeast(card.rarity, "SR")).length;
}

export function getOwnedUrTypeCount(earnedCards: EarnedCard[]) {
  const ownedCardIds = new Set(earnedCards.map((card) => card.cardId));
  return monsterCards.filter((card) => ownedCardIds.has(card.id) && card.rarity === "UR").length;
}

export function getOwnedAttributeTypeCount(earnedCards: EarnedCard[], attributes: string[]) {
  const ownedCardIds = new Set(earnedCards.map((card) => card.cardId));
  return monsterCards.filter((card) => {
    return ownedCardIds.has(card.id) && attributes.includes(card.attribute);
  }).length;
}

export function getBuddyState(context: ProgressionContext) {
  if (!context.selectedMonsterCardId) return null;

  const card = getMonsterCardById(context.selectedMonsterCardId);
  if (!card) return null;

  const earnedCard = context.earnedCards.find((earned) => earned.cardId === card.id);
  const levelProgress = getMonsterLevelProgress(earnedCard?.exp ?? 0);
  const ownedCount = getOwnedCount(earnedCard);
  const awakeningLevel = getAwakeningLevel(ownedCount);

  return {
    card,
    earnedCard,
    levelProgress,
    ownedCount,
    awakeningLevel,
    nextAwakening: getNextAwakeningRequirement(ownedCount),
    growthStage: getMonsterGrowthStage(levelProgress.level),
  };
}

export function getTitlesByCategory(category: TitleCategory) {
  return PROGRESSION_TITLES.filter((title) => title.category === category);
}

export function getUnlockedTitles(context: ProgressionContext) {
  return PROGRESSION_TITLES.filter((title) => title.isUnlocked(context));
}

export function getTitleUnlockRate(context: ProgressionContext) {
  const unlockedCount = getUnlockedTitles(context).length;
  return Math.round((unlockedCount / PROGRESSION_TITLES.length) * 100);
}

export function getNextLearningTitle(context: ProgressionContext) {
  return LEARNING_TITLES.find((title) => !title.isUnlocked(context)) ?? null;
}

export function getUnlockedBackgrounds(context: ProgressionContext) {
  return UNLOCKABLE_BACKGROUNDS.filter((background) => background.isUnlocked(context));
}

export function getSelectedProgressionBackground(
  context: ProgressionContext,
  selectedBackgroundId?: string | null
) {
  const unlockedBackgrounds = getUnlockedBackgrounds(context);
  return (
    unlockedBackgrounds.find((background) => background.id === selectedBackgroundId) ??
    unlockedBackgrounds[0] ??
    UNLOCKABLE_BACKGROUNDS[0]
  );
}

export function getNextGlobalUnlockLabel(context: ProgressionContext) {
  const nextTitle = PROGRESSION_TITLES.find((title) => !title.isUnlocked(context));
  const nextBackground = UNLOCKABLE_BACKGROUNDS.find(
    (background) => !background.isUnlocked(context)
  );

  if (nextTitle) return `次の称号: ${nextTitle.conditionLabel}`;
  if (nextBackground) return `次の背景: ${nextBackground.conditionLabel}`;
  return "称号と背景の主な解放を達成済み";
}

export function getCardDetailUnlockSummary({
  card,
  earnedCard,
  context,
}: {
  card: MonsterCard;
  earnedCard: EarnedCard | undefined;
  context: ProgressionContext;
}) {
  const isOwned = Boolean(earnedCard);
  const isBuddy = context.selectedMonsterCardId === card.id && isOwned;
  const ownedCount = getOwnedCount(earnedCard);
  const awakeningLevel = getAwakeningLevel(ownedCount);
  const levelProgress = getMonsterLevelProgress(earnedCard?.exp ?? 0);
  const unlocked: string[] = [];
  const next: string[] = [];

  if (!isOwned) {
    next.push("パックから契約するとカード詳細が解放");
    return { unlocked, next };
  }

  CARD_TITLES.filter((title) => title.isUnlocked(context)).forEach((title) => {
    unlocked.push(`称号「${title.label}」`);
  });

  if (isBuddy) {
    BUDDY_TITLES.filter((title) => title.isUnlocked(context)).forEach((title) => {
      unlocked.push(`称号「${title.label}」`);
    });
  } else {
    next.push("お気に入りに設定すると称号「相棒と歩む者」");
  }

  if (awakeningLevel >= 1) unlocked.push(`覚醒Lv.${awakeningLevel}カード枠`);
  if (card.rarity === "UR" && getOwnedUrTypeCount(context.earnedCards) >= 1) {
    unlocked.push("背景「虹の召喚陣」");
  }

  if (isBuddy && levelProgress.level >= MAX_MONSTER_LEVEL) {
    unlocked.push("背景「相棒の聖域」");
  }

  if (isBuddy && awakeningLevel >= 3) {
    unlocked.push("背景「覚醒の祭壇」");
  }

  if (isBuddy && levelProgress.level < 10) {
    next.push("Lv10で称号「魂の契約者」");
  } else if (isBuddy && levelProgress.level < MAX_MONSTER_LEVEL) {
    next.push("Lv20で背景「相棒の聖域」");
  }

  const nextAwakening = getNextAwakeningRequirement(ownedCount);
  if (nextAwakening) {
    next.push(`${nextAwakening.requiredCopies}枚所持で覚醒Lv.${nextAwakening.targetLevel}`);
  }

  if (isBuddy && awakeningLevel < 3) {
    next.push("覚醒Lv3で背景「覚醒の祭壇」");
  }

  return {
    unlocked: Array.from(new Set(unlocked)),
    next: Array.from(new Set(next)),
  };
}

function hasAnyWorldClear(context: ProgressionContext, levelId: EikenLevelId) {
  const world = availableQuestWorlds.find((questWorld) => questWorld.id === levelId);
  if (!world || !context.questProgress) return false;

  return world.blocks.some((block) => {
    const progress = context.questProgress?.[block.id];
    return Boolean(progress?.bossCleared || progress?.completeCleared || progress?.crowned);
  });
}

function isRarityAtLeast(rarity: Rarity, target: Rarity) {
  const rank: Record<Rarity, number> = {
    N: 1,
    R: 2,
    SR: 3,
    SSR: 4,
    UR: 5,
    SAR: 6,
  };

  return rank[rarity] >= rank[target];
}
