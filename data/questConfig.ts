export type EikenLevelId =
  | "eiken5"
  | "eiken4"
  | "eiken3"
  | "eiken_pre2"
  | "eiken2"
  | "eiken_pre1"
  | "eiken1";

export type QuestMode = "mini" | "normal" | "boss" | "complete";

export type QuestProgressKey =
  | "miniCleared"
  | "normalCleared"
  | "bossCleared"
  | "completeCleared";

export type RewardKind =
  | "title"
  | "background"
  | "frame"
  | "effect"
  | "limitedCard"
  | "gold"
  | "medal";

export type QuestReward = {
  kind: RewardKind;
  label: string;
  description?: string;
};

export type QuestBackgroundKey = string;

export type QuestBackgroundConfig = {
  key: QuestBackgroundKey;
  label: string;
  worldId: EikenLevelId;
  accent: string;
  backgroundImage: string;
  pattern: string;
  overlay: string;
  bossOverlay: string;
};

export type QuestConfig = {
  mode: QuestMode;
  label: string;
  questionCount: number;
  clearCorrectCount: number;
  maxMissCount: number;
};

export type QuestModeConfig = QuestConfig & {
  progressKey: QuestProgressKey;
  copy: {
    icon: string;
    reward: string;
    short: string;
    detail: string;
  };
  rewards: QuestReward[];
};

export type BossRole = "mid" | "world";

export type MonsterShape =
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
  | "leafbeast"
  | "mushroomking"
  | "waterfairy"
  | "sunbird"
  | "treant"
  | "forestgolem"
  | "wordsprite"
  | "harborguard"
  | "merchantbeast"
  | "windbird"
  | "anchorgolem"
  | "lighthouseghost"
  | "stormbeast"
  | "seadrake"
  | "phrasebook"
  | "stoneguard"
  | "runecore"
  | "sandserpent"
  | "shadowpriest"
  | "loremage"
  | "tombwraith"
  | "pharaohlord"
  | "sunpriest"
  | "wordrelic"
  | "scrollking"
  | "silverwarden"
  | "cloudbeast"
  | "bridgeknight"
  | "towermage"
  | "starseer"
  | "thundermage"
  | "lightpriest"
  | "skyknight"
  | "dragonpriest"
  | "starguardian"
  | "skydragon"
  | "starspirit"
  | "timekeeper"
  | "memorysage"
  | "frontierdragon"
  | "oraclesprite"
  | "mooncaster"
  | "cosmicpriest";

export type BossShape = MonsterShape;

export type BossConfig = {
  id: string;
  role: BossRole;
  name: string;
  title: string;
  stage: string;
  accent: string;
  shape: BossShape;
};

export type QuestBlockConfig = {
  id: string;
  levelId: EikenLevelId;
  label: string;
  stageName: string;
  mapIcon: string;
  backgroundKey: QuestBackgroundKey;
  bosses: Partial<Record<QuestMode, string>>;
  rewards: QuestReward[];
};

export type WorldStatus = "available" | "future";

export type PartClearReward = {
  triggerBlockId: string;
  triggerQuestMode: QuestMode;
  kicker: string;
  title: string;
  message: string;
  epilogue: string;
  rewards: QuestReward[];
};

export type QuestWorldConfig = {
  id: EikenLevelId;
  level: string;
  worldName: string;
  backgroundImage?: string;
  part: 1 | 2;
  order: number;
  status: WorldStatus;
  colorSuffix: string;
  description: string;
  blocks: QuestBlockConfig[];
  bosses: BossConfig[];
  worldBossId?: string;
  rewards: QuestReward[];
  partClear?: PartClearReward;
};

const rangeLabels = [
  "001-100",
  "101-200",
  "201-300",
  "301-400",
  "401-500",
  "501-600",
  "601-700",
  "701-800",
  "801-900",
  "901-1000",
  "1001-1100",
  "1101-1200",
  "1201-1300",
  "1301-1400",
  "1401-1500",
] as const;

type QuestModeBosses = Partial<Record<QuestMode, string>>;

function createRangeBlocks({
  levelId,
  idPrefix,
  ranges,
  stagePrefix,
  stageNames,
  mapIcon,
  mapIcons,
  midBossIds,
  worldBossId,
  milestoneSchedule = {},
  modeBosses,
  backgroundKeys,
}: {
  levelId: EikenLevelId;
  idPrefix: string;
  ranges: readonly string[];
  stagePrefix: string;
  stageNames?: readonly string[];
  mapIcon: string;
  mapIcons?: readonly string[];
  midBossIds: readonly string[];
  worldBossId: string;
  milestoneSchedule?: Partial<Record<number, string>>;
  modeBosses?: readonly QuestModeBosses[];
  backgroundKeys?: readonly QuestBackgroundKey[];
}): QuestBlockConfig[] {
  return ranges.map((range, index) => {
    const blockId = `${idPrefix}-${range}`;
    const stageName = stageNames?.[index] ?? `${stagePrefix} ${index + 1}`;
    const midBossId = midBossIds[index % midBossIds.length];
    const nextMidBossId = midBossIds[(index + 1) % midBossIds.length];
    const isFinalBlock = index === ranges.length - 1;
    const milestoneBossId = milestoneSchedule[index];
    const modeBossConfig = modeBosses?.[index];

    return {
      id: blockId,
      levelId,
      label: range,
      stageName,
      mapIcon: mapIcons?.[index] ?? mapIcon,
      backgroundKey: backgroundKeys?.[index] ?? blockId,
      bosses: {
        mini: modeBossConfig?.mini ?? midBossId,
        normal: modeBossConfig?.normal ?? nextMidBossId,
        boss:
          modeBossConfig?.boss ??
          (isFinalBlock ? worldBossId : (milestoneBossId ?? midBossId)),
        complete:
          modeBossConfig?.complete ??
          (isFinalBlock ? worldBossId : (milestoneBossId ?? nextMidBossId)),
      },
      rewards: [
        {
          kind: "medal",
          label: `${range} クリアメダル`,
          description: "100語ブロックを攻略した証です。",
        },
      ],
    };
  });
}

function createPhraseBlock({
  id,
  levelId,
  label,
  stageName,
  mapIcon,
  bossId,
  modeBosses,
  backgroundKey,
}: {
  id: string;
  levelId: EikenLevelId;
  label: string;
  stageName: string;
  mapIcon: string;
  bossId: string;
  modeBosses?: QuestModeBosses;
  backgroundKey?: QuestBackgroundKey;
}): QuestBlockConfig {
  return {
    id,
    levelId,
    label,
    stageName,
    mapIcon,
    backgroundKey: backgroundKey ?? id,
    bosses: {
      mini: modeBosses?.mini ?? bossId,
      normal: modeBosses?.normal ?? bossId,
      boss: modeBosses?.boss ?? bossId,
      complete: modeBosses?.complete ?? bossId,
    },
    rewards: [
      {
        kind: "medal",
        label: `${label} クリアメダル`,
        description: "熟語ブロックを攻略した証です。",
      },
    ],
  };
}

export const questModeConfigs = {
  mini: {
    mode: "mini",
    label: "ミニ探索",
    questionCount: 10,
    clearCorrectCount: 8,
    maxMissCount: 3,
    progressKey: "miniCleared",
    copy: {
      icon: "🧭",
      reward: "宝石 + コイン",
      short: "地図を少し進める",
      detail: "ボス撃破で即クリア",
    },
    rewards: [
      { kind: "gold", label: "探索コイン" },
      { kind: "effect", label: "小さな地図の光" },
    ],
  },
  normal: {
    mode: "normal",
    label: "通常クエスト",
    questionCount: 30,
    clearCorrectCount: 24,
    maxMissCount: 7,
    progressKey: "normalCleared",
    copy: {
      icon: "📜",
      reward: "宝箱 + メダル",
      short: "通常ルート攻略",
      detail: "HPバトルで攻略",
    },
    rewards: [
      { kind: "medal", label: "冒険メダル" },
      { kind: "background", label: "ブロック背景の欠片" },
    ],
  },
  boss: {
    mode: "boss",
    label: "強敵クエスト",
    questionCount: 50,
    clearCorrectCount: 45,
    maxMissCount: 6,
    progressKey: "bossCleared",
    copy: {
      icon: "🐉",
      reward: "赤宝石 + 大コイン",
      short: "強敵に挑む",
      detail: "高難度チェック",
    },
    rewards: [
      { kind: "frame", label: "ボス撃破フレーム" },
      { kind: "gold", label: "大コイン" },
    ],
  },
  complete: {
    mode: "complete",
    label: "完全制覇",
    questionCount: 100,
    clearCorrectCount: 90,
    maxMissCount: 10,
    progressKey: "completeCleared",
    copy: {
      icon: "👑",
      reward: "王冠 + 金宝箱",
      short: "完全制覇を狙う",
      detail: "撃破後も最後まで挑戦",
    },
    rewards: [
      { kind: "title", label: "ブロック制覇者" },
      { kind: "limitedCard", label: "金宝箱カード抽選券" },
    ],
  },
} as const satisfies Record<QuestMode, QuestModeConfig>;

export const questModeConfigList = Object.values(questModeConfigs);

export const defaultQuestConfig = questModeConfigs.complete;

const forestPattern =
  "radial-gradient(circle at 18% 22%, rgba(187,247,208,0.2), transparent 18%), radial-gradient(circle at 82% 18%, rgba(250,204,21,0.13), transparent 20%), linear-gradient(115deg, transparent 0 48%, rgba(255,255,255,0.08) 49% 50%, transparent 51%)";
const portPattern =
  "radial-gradient(circle at 18% 20%, rgba(224,242,254,0.18), transparent 20%), linear-gradient(90deg, transparent 0 46%, rgba(255,255,255,0.08) 47% 48%, transparent 49%), repeating-linear-gradient(90deg, transparent 0 30px, rgba(255,255,255,0.06) 31px 32px)";
const ruinsPattern =
  "radial-gradient(circle at 18% 20%, rgba(253,230,138,0.15), transparent 20%), linear-gradient(90deg, transparent 0 48%, rgba(253,230,138,0.1) 49% 50%, transparent 51%), repeating-linear-gradient(0deg, transparent 0 38px, rgba(255,255,255,0.04) 39px 40px)";
const skyPattern =
  "radial-gradient(circle at 24% 18%, rgba(255,255,255,0.22), transparent 16%), radial-gradient(circle at 78% 24%, rgba(250,204,21,0.16), transparent 18%), repeating-linear-gradient(125deg, transparent 0 34px, rgba(255,255,255,0.06) 35px 36px)";

export const DEFAULT_QUEST_WORLD_BACKGROUND_IMAGE =
  "/images/backgrounds/bg_eiken5_forest.png";

export const questWorldBackgroundImages: Record<EikenLevelId, string> = {
  eiken5: DEFAULT_QUEST_WORLD_BACKGROUND_IMAGE,
  eiken4: "/images/backgrounds/bg_eiken4_wind_harbor.png",
  eiken3: "/images/backgrounds/bg_eiken3_ancient_ruins.png",
  eiken_pre2: "/images/backgrounds/bg_eiken_pre2_sky_city.png",
  eiken2: DEFAULT_QUEST_WORLD_BACKGROUND_IMAGE,
  eiken_pre1: DEFAULT_QUEST_WORLD_BACKGROUND_IMAGE,
  eiken1: DEFAULT_QUEST_WORLD_BACKGROUND_IMAGE,
};

export function getQuestWorldBackgroundImage(worldId?: EikenLevelId | null) {
  if (!worldId) return DEFAULT_QUEST_WORLD_BACKGROUND_IMAGE;
  return questWorldBackgroundImages[worldId] ?? DEFAULT_QUEST_WORLD_BACKGROUND_IMAGE;
}

function createQuestBackground({
  key,
  label,
  worldId,
  accent,
  backgroundImage,
  pattern,
}: {
  key: QuestBackgroundKey;
  label: string;
  worldId: EikenLevelId;
  accent: string;
  backgroundImage: string;
  pattern: string;
}): QuestBackgroundConfig {
  return {
    key,
    label,
    worldId,
    accent,
    backgroundImage,
    pattern,
    overlay:
      "linear-gradient(180deg, rgba(2,6,23,0.22), rgba(2,6,23,0.7) 58%, rgba(2,6,23,0.86))",
    bossOverlay:
      "linear-gradient(180deg, rgba(2,6,23,0.34), rgba(2,6,23,0.76) 56%, rgba(2,6,23,0.92))",
  };
}

export const questBackgroundMap: Record<QuestBackgroundKey, QuestBackgroundConfig> = {
  "eiken5-001-100": createQuestBackground({
    key: "eiken5-001-100",
    label: "森の入口",
    worldId: "eiken5",
    accent: "#22c55e",
    pattern: forestPattern,
    backgroundImage:
      "radial-gradient(circle at 20% 18%, rgba(134,239,172,0.55), transparent 26%), radial-gradient(circle at 72% 18%, rgba(250,204,21,0.32), transparent 24%), linear-gradient(145deg, #12351e 0%, #166534 48%, #052e16 100%)",
  }),
  "eiken5-101-200": createQuestBackground({
    key: "eiken5-101-200",
    label: "きのこの小道",
    worldId: "eiken5",
    accent: "#a16207",
    pattern: forestPattern,
    backgroundImage:
      "radial-gradient(circle at 24% 70%, rgba(251,113,133,0.36), transparent 22%), radial-gradient(circle at 72% 34%, rgba(192,132,252,0.34), transparent 24%), linear-gradient(145deg, #1f2a16 0%, #3f2b16 48%, #120a1f 100%)",
  }),
  "eiken5-201-300": createQuestBackground({
    key: "eiken5-201-300",
    label: "妖精の泉",
    worldId: "eiken5",
    accent: "#38bdf8",
    pattern: forestPattern,
    backgroundImage:
      "radial-gradient(circle at 50% 74%, rgba(125,211,252,0.5), transparent 32%), radial-gradient(circle at 24% 24%, rgba(190,242,100,0.24), transparent 22%), linear-gradient(145deg, #063b47 0%, #0f766e 48%, #052e16 100%)",
  }),
  "eiken5-301-400": createQuestBackground({
    key: "eiken5-301-400",
    label: "木漏れ日の丘",
    worldId: "eiken5",
    accent: "#f59e0b",
    pattern: forestPattern,
    backgroundImage:
      "radial-gradient(circle at 58% 18%, rgba(254,240,138,0.55), transparent 26%), radial-gradient(circle at 26% 78%, rgba(132,204,22,0.26), transparent 28%), linear-gradient(145deg, #2f3b10 0%, #4d7c0f 48%, #14532d 100%)",
  }),
  "eiken5-401-500": createQuestBackground({
    key: "eiken5-401-500",
    label: "古木の迷路",
    worldId: "eiken5",
    accent: "#15803d",
    pattern: forestPattern,
    backgroundImage:
      "radial-gradient(circle at 18% 30%, rgba(101,163,13,0.28), transparent 26%), radial-gradient(circle at 78% 66%, rgba(120,53,15,0.34), transparent 30%), linear-gradient(145deg, #102416 0%, #1f3d1b 48%, #090f0d 100%)",
  }),
  "eiken5-501-600": createQuestBackground({
    key: "eiken5-501-600",
    label: "森の神殿",
    worldId: "eiken5",
    accent: "#16a34a",
    pattern: ruinsPattern,
    backgroundImage:
      "radial-gradient(circle at 50% 20%, rgba(187,247,208,0.28), transparent 24%), radial-gradient(circle at 18% 80%, rgba(148,163,184,0.28), transparent 26%), linear-gradient(145deg, #12251b 0%, #24513b 48%, #111827 100%)",
  }),
  "eiken5-ph-001-100": createQuestBackground({
    key: "eiken5-ph-001-100",
    label: "ことばの小道",
    worldId: "eiken5",
    accent: "#8b5cf6",
    pattern: forestPattern,
    backgroundImage:
      "radial-gradient(circle at 30% 30%, rgba(196,181,253,0.34), transparent 24%), radial-gradient(circle at 72% 68%, rgba(250,204,21,0.2), transparent 24%), linear-gradient(145deg, #10251c 0%, #312e81 52%, #111827 100%)",
  }),
  "eiken4-001-100": createQuestBackground({
    key: "eiken4-001-100",
    label: "港町の入口",
    worldId: "eiken4",
    accent: "#0ea5e9",
    pattern: portPattern,
    backgroundImage:
      "radial-gradient(circle at 72% 28%, rgba(125,211,252,0.44), transparent 28%), radial-gradient(circle at 22% 74%, rgba(251,191,36,0.2), transparent 24%), linear-gradient(145deg, #063345 0%, #075985 48%, #082f49 100%)",
  }),
  "eiken4-101-200": createQuestBackground({
    key: "eiken4-101-200",
    label: "市場通り",
    worldId: "eiken4",
    accent: "#d97706",
    pattern: portPattern,
    backgroundImage:
      "radial-gradient(circle at 22% 26%, rgba(251,146,60,0.38), transparent 24%), radial-gradient(circle at 78% 30%, rgba(45,212,191,0.24), transparent 22%), linear-gradient(145deg, #3b1d0b 0%, #7c2d12 45%, #0f3f46 100%)",
  }),
  "eiken4-201-300": createQuestBackground({
    key: "eiken4-201-300",
    label: "風車の丘",
    worldId: "eiken4",
    accent: "#22d3ee",
    pattern: portPattern,
    backgroundImage:
      "radial-gradient(circle at 62% 20%, rgba(224,242,254,0.52), transparent 24%), radial-gradient(circle at 22% 76%, rgba(34,197,94,0.24), transparent 28%), linear-gradient(145deg, #0e7490 0%, #0369a1 46%, #14532d 100%)",
  }),
  "eiken4-301-400": createQuestBackground({
    key: "eiken4-301-400",
    label: "船着き場",
    worldId: "eiken4",
    accent: "#64748b",
    pattern: portPattern,
    backgroundImage:
      "radial-gradient(circle at 26% 70%, rgba(120,53,15,0.36), transparent 28%), radial-gradient(circle at 78% 34%, rgba(14,165,233,0.34), transparent 24%), linear-gradient(145deg, #1c1917 0%, #164e63 50%, #082f49 100%)",
  }),
  "eiken4-401-500": createQuestBackground({
    key: "eiken4-401-500",
    label: "灯台の岬",
    worldId: "eiken4",
    accent: "#c084fc",
    pattern: portPattern,
    backgroundImage:
      "radial-gradient(circle at 70% 20%, rgba(253,230,138,0.38), transparent 18%), radial-gradient(circle at 26% 76%, rgba(96,165,250,0.28), transparent 30%), linear-gradient(145deg, #101828 0%, #172554 52%, #312e81 100%)",
  }),
  "eiken4-501-600": createQuestBackground({
    key: "eiken4-501-600",
    label: "嵐の海路",
    worldId: "eiken4",
    accent: "#facc15",
    pattern: portPattern,
    backgroundImage:
      "radial-gradient(circle at 68% 22%, rgba(250,204,21,0.32), transparent 18%), radial-gradient(circle at 24% 70%, rgba(56,189,248,0.24), transparent 28%), linear-gradient(145deg, #020617 0%, #172554 46%, #0f172a 100%)",
  }),
  "eiken4-601-700": createQuestBackground({
    key: "eiken4-601-700",
    label: "海竜の巣",
    worldId: "eiken4",
    accent: "#0ea5e9",
    pattern: ruinsPattern,
    backgroundImage:
      "radial-gradient(circle at 50% 72%, rgba(14,165,233,0.36), transparent 32%), radial-gradient(circle at 72% 24%, rgba(34,211,238,0.24), transparent 22%), linear-gradient(145deg, #031b28 0%, #164e63 48%, #020617 100%)",
  }),
  "eiken4-ph-001-100": createQuestBackground({
    key: "eiken4-ph-001-100",
    label: "港町熟語市場",
    worldId: "eiken4",
    accent: "#a78bfa",
    pattern: portPattern,
    backgroundImage:
      "radial-gradient(circle at 24% 26%, rgba(251,191,36,0.28), transparent 24%), radial-gradient(circle at 76% 66%, rgba(167,139,250,0.3), transparent 24%), linear-gradient(145deg, #3b1d0b 0%, #4c1d95 52%, #082f49 100%)",
  }),
  "eiken3-001-100": createQuestBackground({
    key: "eiken3-001-100",
    label: "遺跡の入口",
    worldId: "eiken3",
    accent: "#78716c",
    pattern: ruinsPattern,
    backgroundImage:
      "radial-gradient(circle at 48% 28%, rgba(214,211,209,0.26), transparent 28%), radial-gradient(circle at 24% 78%, rgba(217,119,6,0.22), transparent 26%), linear-gradient(145deg, #292524 0%, #57534e 46%, #1c1917 100%)",
  }),
  "eiken3-101-200": createQuestBackground({
    key: "eiken3-101-200",
    label: "石碑の回廊",
    worldId: "eiken3",
    accent: "#818cf8",
    pattern: ruinsPattern,
    backgroundImage:
      "radial-gradient(circle at 24% 24%, rgba(129,140,248,0.3), transparent 24%), radial-gradient(circle at 78% 68%, rgba(168,162,158,0.2), transparent 28%), linear-gradient(145deg, #1c1917 0%, #312e81 48%, #0f172a 100%)",
  }),
  "eiken3-201-300": createQuestBackground({
    key: "eiken3-201-300",
    label: "砂の広場",
    worldId: "eiken3",
    accent: "#d97706",
    pattern: ruinsPattern,
    backgroundImage:
      "radial-gradient(circle at 55% 20%, rgba(253,230,138,0.4), transparent 26%), radial-gradient(circle at 22% 78%, rgba(251,146,60,0.28), transparent 28%), linear-gradient(145deg, #451a03 0%, #92400e 46%, #292524 100%)",
  }),
  "eiken3-301-400": createQuestBackground({
    key: "eiken3-301-400",
    label: "地下神殿",
    worldId: "eiken3",
    accent: "#7c3aed",
    pattern: ruinsPattern,
    backgroundImage:
      "radial-gradient(circle at 26% 64%, rgba(251,146,60,0.28), transparent 20%), radial-gradient(circle at 78% 34%, rgba(124,58,237,0.24), transparent 26%), linear-gradient(145deg, #0c0a09 0%, #1f1a2e 48%, #2e1065 100%)",
  }),
  "eiken3-401-500": createQuestBackground({
    key: "eiken3-401-500",
    label: "古代図書館",
    worldId: "eiken3",
    accent: "#8b5cf6",
    pattern: ruinsPattern,
    backgroundImage:
      "radial-gradient(circle at 24% 22%, rgba(168,85,247,0.28), transparent 24%), radial-gradient(circle at 78% 72%, rgba(180,83,9,0.3), transparent 28%), linear-gradient(145deg, #1c0f0a 0%, #3b2f1f 48%, #2e1065 100%)",
  }),
  "eiken3-501-600": createQuestBackground({
    key: "eiken3-501-600",
    label: "王の墓所",
    worldId: "eiken3",
    accent: "#94a3b8",
    pattern: ruinsPattern,
    backgroundImage:
      "radial-gradient(circle at 70% 28%, rgba(148,163,184,0.24), transparent 22%), radial-gradient(circle at 28% 74%, rgba(76,29,149,0.24), transparent 28%), linear-gradient(145deg, #0f172a 0%, #292524 50%, #111827 100%)",
  }),
  "eiken3-601-700": createQuestBackground({
    key: "eiken3-601-700",
    label: "ファラオの間",
    worldId: "eiken3",
    accent: "#f59e0b",
    pattern: ruinsPattern,
    backgroundImage:
      "radial-gradient(circle at 50% 18%, rgba(251,191,36,0.42), transparent 26%), radial-gradient(circle at 22% 72%, rgba(185,28,28,0.24), transparent 28%), linear-gradient(145deg, #451a03 0%, #78350f 44%, #1c1917 100%)",
  }),
  "eiken3-701-800": createQuestBackground({
    key: "eiken3-701-800",
    label: "太陽神の祭壇",
    worldId: "eiken3",
    accent: "#fbbf24",
    pattern: ruinsPattern,
    backgroundImage:
      "radial-gradient(circle at 50% 10%, rgba(254,240,138,0.52), transparent 30%), radial-gradient(circle at 74% 74%, rgba(251,146,60,0.26), transparent 24%), linear-gradient(145deg, #78350f 0%, #92400e 45%, #111827 100%)",
  }),
  "eiken3-ph-001-100": createQuestBackground({
    key: "eiken3-ph-001-100",
    label: "熟語の石碑",
    worldId: "eiken3",
    accent: "#a78bfa",
    pattern: ruinsPattern,
    backgroundImage:
      "radial-gradient(circle at 26% 26%, rgba(167,139,250,0.28), transparent 24%), radial-gradient(circle at 76% 72%, rgba(20,184,166,0.18), transparent 24%), linear-gradient(145deg, #292524 0%, #312e81 50%, #1c1917 100%)",
  }),
  "eiken3-ph-101-200": createQuestBackground({
    key: "eiken3-ph-101-200",
    label: "古代熟語の回廊",
    worldId: "eiken3",
    accent: "#d97706",
    pattern: ruinsPattern,
    backgroundImage:
      "radial-gradient(circle at 24% 70%, rgba(251,191,36,0.28), transparent 24%), radial-gradient(circle at 74% 28%, rgba(168,85,247,0.24), transparent 22%), linear-gradient(145deg, #3b2f1f 0%, #5b3415 48%, #312e81 100%)",
  }),
  "pre2-001-100": createQuestBackground({
    key: "pre2-001-100",
    label: "天空への階段",
    worldId: "eiken_pre2",
    accent: "#cbd5e1",
    pattern: skyPattern,
    backgroundImage:
      "radial-gradient(circle at 52% 18%, rgba(224,242,254,0.5), transparent 28%), radial-gradient(circle at 26% 78%, rgba(147,197,253,0.26), transparent 28%), linear-gradient(145deg, #0f2f57 0%, #1e40af 48%, #0f172a 100%)",
  }),
  "pre2-101-200": createQuestBackground({
    key: "pre2-101-200",
    label: "雲海の道",
    worldId: "eiken_pre2",
    accent: "#93c5fd",
    pattern: skyPattern,
    backgroundImage:
      "radial-gradient(circle at 28% 34%, rgba(255,255,255,0.45), transparent 24%), radial-gradient(circle at 72% 70%, rgba(125,211,252,0.3), transparent 28%), linear-gradient(145deg, #0c4a6e 0%, #2563eb 46%, #172554 100%)",
  }),
  "pre2-201-300": createQuestBackground({
    key: "pre2-201-300",
    label: "白銀の橋",
    worldId: "eiken_pre2",
    accent: "#bae6fd",
    pattern: skyPattern,
    backgroundImage:
      "radial-gradient(circle at 50% 24%, rgba(255,255,255,0.5), transparent 24%), radial-gradient(circle at 78% 72%, rgba(186,230,253,0.28), transparent 28%), linear-gradient(145deg, #1e3a8a 0%, #64748b 48%, #0f172a 100%)",
  }),
  "pre2-301-400": createQuestBackground({
    key: "pre2-301-400",
    label: "魔法塔入口",
    worldId: "eiken_pre2",
    accent: "#a78bfa",
    pattern: skyPattern,
    backgroundImage:
      "radial-gradient(circle at 28% 22%, rgba(167,139,250,0.38), transparent 24%), radial-gradient(circle at 78% 70%, rgba(34,211,238,0.22), transparent 26%), linear-gradient(145deg, #172554 0%, #4c1d95 48%, #111827 100%)",
  }),
  "pre2-401-500": createQuestBackground({
    key: "pre2-401-500",
    label: "星見の回廊",
    worldId: "eiken_pre2",
    accent: "#facc15",
    pattern: skyPattern,
    backgroundImage:
      "radial-gradient(circle at 70% 20%, rgba(250,204,21,0.36), transparent 22%), radial-gradient(circle at 24% 72%, rgba(99,102,241,0.3), transparent 28%), linear-gradient(145deg, #111827 0%, #312e81 50%, #020617 100%)",
  }),
  "pre2-501-600": createQuestBackground({
    key: "pre2-501-600",
    label: "雷鳴の庭",
    worldId: "eiken_pre2",
    accent: "#facc15",
    pattern: skyPattern,
    backgroundImage:
      "radial-gradient(circle at 72% 20%, rgba(250,204,21,0.42), transparent 18%), radial-gradient(circle at 26% 76%, rgba(124,58,237,0.28), transparent 28%), linear-gradient(145deg, #020617 0%, #1e1b4b 48%, #0f172a 100%)",
  }),
  "pre2-601-700": createQuestBackground({
    key: "pre2-601-700",
    label: "光の神殿",
    worldId: "eiken_pre2",
    accent: "#fde68a",
    pattern: skyPattern,
    backgroundImage:
      "radial-gradient(circle at 50% 18%, rgba(254,240,138,0.5), transparent 28%), radial-gradient(circle at 76% 76%, rgba(147,197,253,0.24), transparent 26%), linear-gradient(145deg, #1e3a8a 0%, #7c3aed 46%, #111827 100%)",
  }),
  "pre2-701-800": createQuestBackground({
    key: "pre2-701-800",
    label: "天空騎士団",
    worldId: "eiken_pre2",
    accent: "#60a5fa",
    pattern: skyPattern,
    backgroundImage:
      "radial-gradient(circle at 22% 24%, rgba(96,165,250,0.34), transparent 24%), radial-gradient(circle at 76% 70%, rgba(203,213,225,0.24), transparent 26%), linear-gradient(145deg, #0f172a 0%, #1e40af 48%, #172554 100%)",
  }),
  "pre2-801-900": createQuestBackground({
    key: "pre2-801-900",
    label: "竜の祭壇",
    worldId: "eiken_pre2",
    accent: "#a78bfa",
    pattern: skyPattern,
    backgroundImage:
      "radial-gradient(circle at 28% 26%, rgba(167,139,250,0.38), transparent 24%), radial-gradient(circle at 76% 70%, rgba(56,189,248,0.26), transparent 26%), linear-gradient(145deg, #1e1b4b 0%, #581c87 48%, #0f172a 100%)",
  }),
  "pre2-901-1000": createQuestBackground({
    key: "pre2-901-1000",
    label: "アステリオンの門",
    worldId: "eiken_pre2",
    accent: "#818cf8",
    pattern: skyPattern,
    backgroundImage:
      "radial-gradient(circle at 50% 24%, rgba(129,140,248,0.4), transparent 26%), radial-gradient(circle at 26% 76%, rgba(250,204,21,0.22), transparent 24%), linear-gradient(145deg, #020617 0%, #312e81 48%, #1e1b4b 100%)",
  }),
  "pre2-1001-1100": createQuestBackground({
    key: "pre2-1001-1100",
    label: "天空竜の玉座",
    worldId: "eiken_pre2",
    accent: "#38bdf8",
    pattern: skyPattern,
    backgroundImage:
      "radial-gradient(circle at 50% 18%, rgba(56,189,248,0.42), transparent 26%), radial-gradient(circle at 78% 70%, rgba(251,191,36,0.24), transparent 26%), linear-gradient(145deg, #082f49 0%, #312e81 48%, #020617 100%)",
  }),
  "pre2-1101-1200": createQuestBackground({
    key: "pre2-1101-1200",
    label: "星屑の聖域",
    worldId: "eiken_pre2",
    accent: "#f0abfc",
    pattern: skyPattern,
    backgroundImage:
      "radial-gradient(circle at 28% 24%, rgba(240,171,252,0.34), transparent 24%), radial-gradient(circle at 74% 70%, rgba(250,204,21,0.24), transparent 26%), linear-gradient(145deg, #111827 0%, #4c1d95 50%, #020617 100%)",
  }),
  "pre2-1201-1300": createQuestBackground({
    key: "pre2-1201-1300",
    label: "時の回廊",
    worldId: "eiken_pre2",
    accent: "#67e8f9",
    pattern: skyPattern,
    backgroundImage:
      "radial-gradient(circle at 50% 24%, rgba(103,232,249,0.36), transparent 24%), radial-gradient(circle at 24% 72%, rgba(250,204,21,0.22), transparent 24%), linear-gradient(145deg, #082f49 0%, #1e1b4b 48%, #020617 100%)",
  }),
  "pre2-1301-1400": createQuestBackground({
    key: "pre2-1301-1400",
    label: "記憶の大聖堂",
    worldId: "eiken_pre2",
    accent: "#c084fc",
    pattern: skyPattern,
    backgroundImage:
      "radial-gradient(circle at 50% 16%, rgba(203,213,225,0.34), transparent 26%), radial-gradient(circle at 76% 72%, rgba(192,132,252,0.26), transparent 26%), linear-gradient(145deg, #111827 0%, #312e81 46%, #020617 100%)",
  }),
  "pre2-1401-1500": createQuestBackground({
    key: "pre2-1401-1500",
    label: "フロンティアの頂",
    worldId: "eiken_pre2",
    accent: "#fbbf24",
    pattern: skyPattern,
    backgroundImage:
      "radial-gradient(circle at 50% 12%, rgba(251,191,36,0.5), transparent 30%), radial-gradient(circle at 24% 78%, rgba(56,189,248,0.3), transparent 28%), linear-gradient(145deg, #020617 0%, #1e3a8a 45%, #4c1d95 100%)",
  }),
  "pre2-ph-001-100": createQuestBackground({
    key: "pre2-ph-001-100",
    label: "星詠み熟語神殿",
    worldId: "eiken_pre2",
    accent: "#a78bfa",
    pattern: skyPattern,
    backgroundImage:
      "radial-gradient(circle at 28% 22%, rgba(167,139,250,0.36), transparent 24%), radial-gradient(circle at 74% 72%, rgba(34,211,238,0.22), transparent 24%), linear-gradient(145deg, #111827 0%, #4c1d95 48%, #020617 100%)",
  }),
  "pre2-ph-101-200": createQuestBackground({
    key: "pre2-ph-101-200",
    label: "月光の熟語回廊",
    worldId: "eiken_pre2",
    accent: "#818cf8",
    pattern: skyPattern,
    backgroundImage:
      "radial-gradient(circle at 72% 20%, rgba(191,219,254,0.34), transparent 22%), radial-gradient(circle at 26% 74%, rgba(129,140,248,0.3), transparent 26%), linear-gradient(145deg, #020617 0%, #1e1b4b 50%, #172554 100%)",
  }),
  "pre2-ph-201-300": createQuestBackground({
    key: "pre2-ph-201-300",
    label: "星界の熟語聖堂",
    worldId: "eiken_pre2",
    accent: "#7c3aed",
    pattern: skyPattern,
    backgroundImage:
      "radial-gradient(circle at 50% 20%, rgba(124,58,237,0.42), transparent 26%), radial-gradient(circle at 78% 72%, rgba(250,204,21,0.22), transparent 24%), linear-gradient(145deg, #020617 0%, #312e81 48%, #111827 100%)",
  }),
};

const defaultQuestBackground = createQuestBackground({
  key: "default-quest",
  label: "フロンティア",
  worldId: "eiken5",
  accent: "#22d3ee",
  pattern: skyPattern,
  backgroundImage:
    "radial-gradient(circle at 30% 24%, rgba(34,211,238,0.24), transparent 24%), radial-gradient(circle at 76% 72%, rgba(250,204,21,0.18), transparent 26%), linear-gradient(145deg, #0f172a 0%, #111827 48%, #020617 100%)",
});

const defaultQuestBackgroundByWorld: Record<EikenLevelId, QuestBackgroundConfig> = {
  eiken5: questBackgroundMap["eiken5-001-100"],
  eiken4: questBackgroundMap["eiken4-001-100"],
  eiken3: questBackgroundMap["eiken3-001-100"],
  eiken_pre2: questBackgroundMap["pre2-001-100"],
  eiken2: defaultQuestBackground,
  eiken_pre1: defaultQuestBackground,
  eiken1: defaultQuestBackground,
};

export function getQuestBackgroundConfig(
  backgroundKey: QuestBackgroundKey | null | undefined,
  worldId?: EikenLevelId | null
) {
  return (
    (backgroundKey ? questBackgroundMap[backgroundKey] : undefined) ??
    (worldId ? defaultQuestBackgroundByWorld[worldId] : undefined) ??
    defaultQuestBackground
  );
}

type DungeonBossSeed = {
  id: string;
  stageName: string;
  icon: string;
  bossTitle: string;
  completeTitle: string;
  miniName: string;
  normalName: string;
  bossName: string;
  completeName: string;
  miniShape: BossShape;
  normalShape: BossShape;
  bossShape: BossShape;
  completeShape: BossShape;
  accent: string;
  role?: BossRole;
};

function getDungeonBossId(seed: DungeonBossSeed, mode: QuestMode) {
  return `${seed.id}-${mode}`;
}

function getDungeonModeBosses(seed: DungeonBossSeed): Required<Record<QuestMode, string>> {
  return {
    mini: getDungeonBossId(seed, "mini"),
    normal: getDungeonBossId(seed, "normal"),
    boss: getDungeonBossId(seed, "boss"),
    complete: getDungeonBossId(seed, "complete"),
  };
}

function getDungeonModeBossSchedule(seeds: readonly DungeonBossSeed[]) {
  return seeds.map(getDungeonModeBosses);
}

function getDungeonMiniBossIds(seeds: readonly DungeonBossSeed[]) {
  return seeds.map((seed) => getDungeonBossId(seed, "mini"));
}

function createDungeonBossConfigs(seeds: readonly DungeonBossSeed[]): BossConfig[] {
  return seeds.flatMap((seed) => {
    const modeTitles: Record<QuestMode, string> = {
      mini: "見習い",
      normal: `${seed.bossTitle}の番兵`,
      boss: seed.bossTitle,
      complete: seed.completeTitle,
    };
    const modeNames: Record<QuestMode, string> = {
      mini: seed.miniName,
      normal: seed.normalName,
      boss: seed.bossName,
      complete: seed.completeName,
    };
    const modeShapes: Record<QuestMode, BossShape> = {
      mini: seed.miniShape,
      normal: seed.normalShape,
      boss: seed.bossShape,
      complete: seed.completeShape,
    };

    return questModeConfigList.map((config) => ({
      id: getDungeonBossId(seed, config.mode),
      role: seed.role ?? "mid",
      name: `${seed.icon} ${modeTitles[config.mode]} ${modeNames[config.mode]}`,
      title: `${seed.stageName}に立つ${modeTitles[config.mode]}`,
      stage: `${seed.icon} ${seed.stageName}`,
      accent: seed.accent,
      shape: modeShapes[config.mode],
    }));
  });
}

const eiken5DungeonBossSeeds: DungeonBossSeed[] = [
  {
    id: "eiken5-001-100",
    stageName: "森の入口",
    icon: "🌱",
    bossTitle: "若葉の番人",
    completeTitle: "森門の守護者",
    miniName: "ゲルン",
    normalName: "クローブ",
    bossName: "リーフ",
    completeName: "トレント",
    accent: "#22c55e",
    miniShape: "slime",
    normalShape: "plant",
    bossShape: "leafbeast",
    completeShape: "treant",
  },
  {
    id: "eiken5-101-200",
    stageName: "きのこの小道",
    icon: "🍄",
    bossTitle: "きのこ王",
    completeTitle: "夢胞子の王",
    miniName: "フォグ",
    normalName: "バグ",
    bossName: "マッシュ",
    completeName: "ファング",
    accent: "#a16207",
    miniShape: "ghost",
    normalShape: "insect",
    bossShape: "mushroomking",
    completeShape: "wolf",
  },
  {
    id: "eiken5-201-300",
    stageName: "妖精の泉",
    icon: "💧",
    bossTitle: "泉の精",
    completeTitle: "きらめく泉の守護精",
    miniName: "ラディアン",
    normalName: "ドラグ",
    bossName: "ルミナ",
    completeName: "ミスティア",
    accent: "#38bdf8",
    miniShape: "core",
    normalShape: "dragon",
    bossShape: "waterfairy",
    completeShape: "wizard",
  },
  {
    id: "eiken5-301-400",
    stageName: "木漏れ日の丘",
    icon: "☀️",
    bossTitle: "光羽の鳥",
    completeTitle: "木漏れ日の翼",
    miniName: "ガディウス",
    normalName: "グラニス",
    bossName: "ピコ",
    completeName: "ゾルン",
    accent: "#f59e0b",
    miniShape: "demon",
    normalShape: "golem",
    bossShape: "sunbird",
    completeShape: "windbird",
  },
  {
    id: "eiken5-401-500",
    stageName: "古木の迷路",
    icon: "🌳",
    bossTitle: "古木の守り手",
    completeTitle: "迷い森の古木神",
    miniName: "アーバン",
    normalName: "ストーム",
    bossName: "ガロン",
    completeName: "フォレスト",
    accent: "#15803d",
    miniShape: "harborguard",
    normalShape: "stormbeast",
    bossShape: "treant",
    completeShape: "forestgolem",
  },
  {
    id: "eiken5-501-600",
    stageName: "森の神殿",
    icon: "🌿",
    bossTitle: "神殿の番人",
    completeTitle: "森神殿の守護竜",
    miniName: "ロック",
    normalName: "ルーン",
    bossName: "グリーンゴーレム",
    completeName: "ロア",
    accent: "#166534",
    miniShape: "stoneguard",
    normalShape: "runecore",
    bossShape: "golem",
    completeShape: "loremage",
  },
  {
    id: "eiken5-ph-001-100",
    stageName: "ことばの小道",
    icon: "📝",
    bossTitle: "ことばの番人",
    completeTitle: "言霊の守護者",
    miniName: "ペアロ",
    normalName: "ワード",
    bossName: "モク",
    completeName: "スクロール",
    accent: "#7c3aed",
    miniShape: "phrasebook",
    normalShape: "wordsprite",
    bossShape: "anchorgolem",
    completeShape: "scrollking",
  },
];

const eiken4DungeonBossSeeds: DungeonBossSeed[] = [
  {
    id: "eiken4-001-100",
    stageName: "港の入口",
    icon: "⚓",
    bossTitle: "港の守衛",
    completeTitle: "港要塞の大守衛",
    miniName: "アンク",
    normalName: "ガレット",
    bossName: "マリノ",
    completeName: "テンペスト",
    accent: "#0369a1",
    miniShape: "anchorgolem",
    normalShape: "merchantbeast",
    bossShape: "harborguard",
    completeShape: "seadrake",
  },
  {
    id: "eiken4-101-200",
    stageName: "霧の桟橋",
    icon: "🌊",
    bossTitle: "霧の亡霊",
    completeTitle: "深霧の大亡霊",
    miniName: "スペクトル",
    normalName: "ボルト",
    bossName: "ノクス",
    completeName: "ドラグニル",
    accent: "#1d4ed8",
    miniShape: "ghost",
    normalShape: "stormbeast",
    bossShape: "lighthouseghost",
    completeShape: "dragon",
  },
  {
    id: "eiken4-201-300",
    stageName: "風の商街",
    icon: "💨",
    bossTitle: "風の魔法使い",
    completeTitle: "嵐の大魔法使い",
    miniName: "ゲルジン",
    normalName: "デモナ",
    bossName: "フウガ",
    completeName: "ウルファ",
    accent: "#0891b2",
    miniShape: "slime",
    normalShape: "demon",
    bossShape: "windbird",
    completeShape: "wolf",
  },
  {
    id: "eiken4-301-400",
    stageName: "海辺の砦",
    icon: "🏰",
    bossTitle: "砦の衛兵",
    completeTitle: "海辺砦の大将軍",
    miniName: "フローラ",
    normalName: "スカラベ",
    bossName: "ウィザード",
    completeName: "インセクス",
    accent: "#075985",
    miniShape: "plant",
    normalShape: "insect",
    bossShape: "wizard",
    completeShape: "core",
  },
  {
    id: "eiken4-401-500",
    stageName: "旧市街の遺跡",
    icon: "🗺️",
    bossTitle: "遺跡の守り手",
    completeTitle: "遺跡の古代神",
    miniName: "ロカ",
    normalName: "ルーニス",
    bossName: "サンダー",
    completeName: "ファラオン",
    accent: "#92400e",
    miniShape: "stoneguard",
    normalShape: "runecore",
    bossShape: "thundermage",
    completeShape: "pharaohlord",
  },
  {
    id: "eiken4-501-600",
    stageName: "海岸の霊廟",
    icon: "⚰️",
    bossTitle: "霊廟の亡者",
    completeTitle: "霊廟の覇者",
    miniName: "シャドウ",
    normalName: "トゥーム",
    bossName: "グレイ",
    completeName: "ロアマスター",
    accent: "#374151",
    miniShape: "shadowpriest",
    normalShape: "tombwraith",
    bossShape: "golem",
    completeShape: "loremage",
  },
  {
    id: "eiken4-601-700",
    stageName: "深海の神殿",
    icon: "🌀",
    bossTitle: "深海の番人",
    completeTitle: "深海神殿の大守護竜",
    miniName: "シルヴァ",
    normalName: "クラウドス",
    bossName: "ブリッジ",
    completeName: "タワー",
    accent: "#1e3a5f",
    miniShape: "silverwarden",
    normalShape: "cloudbeast",
    bossShape: "bridgeknight",
    completeShape: "towermage",
  },
  {
    id: "eiken4-ph-001-100",
    stageName: "水路のことば",
    icon: "📖",
    bossTitle: "水路の書記",
    completeTitle: "水路の大書記",
    miniName: "ページ",
    normalName: "ルーニック",
    bossName: "ペアロン",
    completeName: "ステライア",
    accent: "#4f46e5",
    miniShape: "phrasebook",
    normalShape: "wordrelic",
    bossShape: "wordsprite",
    completeShape: "starseer",
  },
];

const eiken3DungeonBossSeeds: DungeonBossSeed[] = [
  {
    id: "eiken3-001-100",
    stageName: "砂漠の関所",
    icon: "🏜️",
    bossTitle: "砂漠の番兵",
    completeTitle: "砂漠関所の大将軍",
    miniName: "ロッカ",
    normalName: "グラニア",
    bossName: "ドラグナ",
    completeName: "ファンガ",
    accent: "#b45309",
    miniShape: "stoneguard",
    normalShape: "golem",
    bossShape: "dragon",
    completeShape: "wolf",
  },
  {
    id: "eiken3-101-200",
    stageName: "ルーンの廃墟",
    icon: "🔮",
    bossTitle: "ルーンの守護者",
    completeTitle: "ルーン廃墟の大賢者",
    miniName: "ルーナ",
    normalName: "アルカナ",
    bossName: "フォグマ",
    completeName: "ゲルナ",
    accent: "#7c3aed",
    miniShape: "runecore",
    normalShape: "wizard",
    bossShape: "ghost",
    completeShape: "slime",
  },
  {
    id: "eiken3-201-300",
    stageName: "蛇の谷",
    icon: "🐍",
    bossTitle: "谷の支配者",
    completeTitle: "蛇谷の大支配者",
    miniName: "サンドロ",
    normalName: "デモラ",
    bossName: "ネロ",
    completeName: "ロアス",
    accent: "#d97706",
    miniShape: "sandserpent",
    normalShape: "demon",
    bossShape: "shadowpriest",
    completeShape: "loremage",
  },
  {
    id: "eiken3-301-400",
    stageName: "霊廟の迷宮",
    icon: "⚰️",
    bossTitle: "霊廟の王",
    completeTitle: "霊廟迷宮の大王",
    miniName: "レイス",
    normalName: "ファラオス",
    bossName: "ソル",
    completeName: "ラジアン",
    accent: "#6b21a8",
    miniShape: "tombwraith",
    normalShape: "pharaohlord",
    bossShape: "sunpriest",
    completeShape: "core",
  },
  {
    id: "eiken3-401-500",
    stageName: "銀の城壁",
    icon: "🛡️",
    bossTitle: "城壁の守護騎士",
    completeTitle: "銀城壁の大守護神",
    miniName: "アルゲン",
    normalName: "クラウダ",
    bossName: "フロリア",
    completeName: "プランス",
    accent: "#64748b",
    miniShape: "silverwarden",
    normalShape: "cloudbeast",
    bossShape: "plant",
    completeShape: "insect",
  },
  {
    id: "eiken3-501-600",
    stageName: "魔法塔の頂上",
    icon: "🗼",
    bossTitle: "魔法塔の主",
    completeTitle: "魔法塔の覇者",
    miniName: "ミスト",
    normalName: "セレステ",
    bossName: "トルナス",
    completeName: "スカラバ",
    accent: "#4338ca",
    miniShape: "towermage",
    normalShape: "starseer",
    bossShape: "thundermage",
    completeShape: "insect",
  },
  {
    id: "eiken3-601-700",
    stageName: "天空の回廊",
    icon: "🌤️",
    bossTitle: "回廊の門番",
    completeTitle: "天空回廊の大門番",
    miniName: "ルクサ",
    normalName: "レオナ",
    bossName: "セレナ",
    completeName: "アルバン",
    accent: "#0369a1",
    miniShape: "lightpriest",
    normalShape: "skyknight",
    bossShape: "dragonpriest",
    completeShape: "harborguard",
  },
  {
    id: "eiken3-701-800",
    stageName: "星の神殿",
    icon: "⭐",
    bossTitle: "星神殿の守護者",
    completeTitle: "星神殿の大守護者",
    miniName: "アストラ",
    normalName: "アステル",
    bossName: "ノアラ",
    completeName: "ストルム",
    accent: "#1e40af",
    miniShape: "starguardian",
    normalShape: "skydragon",
    bossShape: "starspirit",
    completeShape: "stormbeast",
  },
  {
    id: "eiken3-ph-001-100",
    stageName: "言葉の砂漠",
    icon: "📜",
    bossTitle: "砂漠の書記",
    completeTitle: "砂漠の大書記",
    miniName: "ペトラ",
    normalName: "オルド",
    bossName: "ワーダス",
    completeName: "シードラ",
    accent: "#92400e",
    miniShape: "wordrelic",
    normalShape: "scrollking",
    bossShape: "wordsprite",
    completeShape: "seadrake",
  },
  {
    id: "eiken3-ph-101-200",
    stageName: "古代の言葉の迷宮",
    icon: "🏛️",
    bossTitle: "迷宮の書記長",
    completeTitle: "言語迷宮の大賢者",
    miniName: "リーフス",
    normalName: "マッシュロード",
    bossName: "アクアリア",
    completeName: "アンコラ",
    accent: "#065f46",
    miniShape: "leafbeast",
    normalShape: "mushroomking",
    bossShape: "waterfairy",
    completeShape: "anchorgolem",
  },
];

const eikenPre2DungeonBossSeeds: DungeonBossSeed[] = [
  {
    id: "pre2-001-100",
    stageName: "銀の砦",
    icon: "🏯",
    bossTitle: "砦の守衛長",
    completeTitle: "銀砦の大守衛",
    miniName: "シルヴィア",
    normalName: "ドラゴン",
    bossName: "ゴーレム",
    completeName: "ウィザーン",
    accent: "#64748b",
    miniShape: "silverwarden",
    normalShape: "dragon",
    bossShape: "golem",
    completeShape: "wizard",
  },
  {
    id: "pre2-101-200",
    stageName: "雲の迷宮",
    icon: "☁️",
    bossTitle: "雲の支配者",
    completeTitle: "雲迷宮の大支配者",
    miniName: "クラウドン",
    normalName: "デモンバ",
    bossName: "ウルフ",
    completeName: "フォグリン",
    accent: "#6b7280",
    miniShape: "cloudbeast",
    normalShape: "demon",
    bossShape: "wolf",
    completeShape: "ghost",
  },
  {
    id: "pre2-201-300",
    stageName: "橋梁の要塞",
    icon: "🌉",
    bossTitle: "橋梁の騎士長",
    completeTitle: "橋梁要塞の大騎士",
    miniName: "ブリッジル",
    normalName: "スカラバン",
    bossName: "コア",
    completeName: "ゲルニア",
    accent: "#374151",
    miniShape: "bridgeknight",
    normalShape: "insect",
    bossShape: "core",
    completeShape: "slime",
  },
  {
    id: "pre2-301-400",
    stageName: "魔法塔の森",
    icon: "🗼",
    bossTitle: "魔法塔の主",
    completeTitle: "魔法塔の大賢者",
    miniName: "タワーン",
    normalName: "フロラス",
    bossName: "トレンタ",
    completeName: "リーフル",
    accent: "#4338ca",
    miniShape: "towermage",
    normalShape: "plant",
    bossShape: "treant",
    completeShape: "leafbeast",
  },
  {
    id: "pre2-401-500",
    stageName: "星詠みの丘",
    icon: "🔭",
    bossTitle: "星詠みの賢者",
    completeTitle: "星詠みの大賢者",
    miniName: "スターラ",
    normalName: "ピコス",
    bossName: "アクエラ",
    completeName: "マッシュン",
    accent: "#1e40af",
    miniShape: "starseer",
    normalShape: "sunbird",
    bossShape: "waterfairy",
    completeShape: "mushroomking",
  },
  {
    id: "pre2-501-600",
    stageName: "雷鳴の要塞",
    icon: "⚡",
    bossTitle: "雷鳴の戦士",
    completeTitle: "雷鳴要塞の大戦士",
    miniName: "トニウス",
    normalName: "マリナ",
    bossName: "アンカーン",
    completeName: "シードレイン",
    accent: "#1d4ed8",
    miniShape: "thundermage",
    normalShape: "harborguard",
    bossShape: "anchorgolem",
    completeShape: "seadrake",
  },
  {
    id: "pre2-601-700",
    stageName: "光の聖堂",
    icon: "✨",
    bossTitle: "聖堂の守護者",
    completeTitle: "光の聖堂の大守護者",
    miniName: "ルクシア",
    normalName: "ガレッタ",
    bossName: "ボルタ",
    completeName: "ノクシア",
    accent: "#f59e0b",
    miniShape: "lightpriest",
    normalShape: "merchantbeast",
    bossShape: "stormbeast",
    completeShape: "lighthouseghost",
  },
  {
    id: "pre2-701-800",
    stageName: "天空騎士の城",
    icon: "🏰",
    bossTitle: "天空騎士団長",
    completeTitle: "天空城の大騎士王",
    miniName: "レオンズ",
    normalName: "ロッカス",
    bossName: "ルーンス",
    completeName: "サンドラン",
    accent: "#0891b2",
    miniShape: "skyknight",
    normalShape: "stoneguard",
    bossShape: "runecore",
    completeShape: "sandserpent",
  },
  {
    id: "pre2-801-900",
    stageName: "竜司祭の神殿",
    icon: "🐉",
    bossTitle: "竜司祭の長老",
    completeTitle: "竜神殿の大司祭",
    miniName: "セレサ",
    normalName: "レイスマ",
    bossName: "ファラオマ",
    completeName: "シャドウン",
    accent: "#7c3aed",
    miniShape: "dragonpriest",
    normalShape: "tombwraith",
    bossShape: "pharaohlord",
    completeShape: "shadowpriest",
  },
  {
    id: "pre2-901-1000",
    stageName: "星の守護の塔",
    icon: "🌟",
    bossTitle: "星の守護者",
    completeTitle: "星守護塔の大守護神",
    miniName: "アストス",
    normalName: "ロアン",
    bossName: "ソラン",
    completeName: "スクロルン",
    accent: "#2563eb",
    miniShape: "starguardian",
    normalShape: "loremage",
    bossShape: "sunpriest",
    completeShape: "scrollking",
  },
  {
    id: "pre2-1001-1100",
    stageName: "天空竜の巣",
    icon: "🌈",
    bossTitle: "天空竜の主",
    completeTitle: "天空竜の大主",
    miniName: "アステリア",
    normalName: "ペトロス",
    bossName: "ワーズ",
    completeName: "ペアロス",
    accent: "#0369a1",
    miniShape: "skydragon",
    normalShape: "wordrelic",
    bossShape: "wordsprite",
    completeShape: "phrasebook",
  },
  {
    id: "pre2-1101-1200",
    stageName: "星霊の境界",
    icon: "💫",
    bossTitle: "星霊の門番",
    completeTitle: "星霊境界の大門番",
    miniName: "ノアス",
    normalName: "フォレスタ",
    bossName: "フウガン",
    completeName: "グラニン",
    accent: "#4c1d95",
    miniShape: "starspirit",
    normalShape: "forestgolem",
    bossShape: "windbird",
    completeShape: "golem",
  },
  {
    id: "pre2-1201-1300",
    stageName: "時の砦",
    icon: "⏳",
    bossTitle: "時の守護者",
    completeTitle: "時砦の大守護者",
    miniName: "クロノス",
    normalName: "アルゲンス",
    bossName: "クラウダス",
    completeName: "ブリッジス",
    accent: "#1e3a5f",
    miniShape: "timekeeper",
    normalShape: "silverwarden",
    bossShape: "cloudbeast",
    completeShape: "bridgeknight",
  },
  {
    id: "pre2-1301-1400",
    stageName: "記憶の宮殿",
    icon: "🏛️",
    bossTitle: "記憶の大賢者",
    completeTitle: "記憶宮殿の大王",
    miniName: "メモリア",
    normalName: "タワーマスター",
    bossName: "ステラマスター",
    completeName: "トニトルスマスター",
    accent: "#6d28d9",
    miniShape: "memorysage",
    normalShape: "towermage",
    bossShape: "starseer",
    completeShape: "thundermage",
  },
  {
    id: "pre2-1401-1500",
    stageName: "フロンティアの頂",
    icon: "🏔️",
    bossTitle: "フロンティアの竜",
    completeTitle: "フロンティア最強の守護竜",
    miniName: "アステリオン・ゼロ",
    normalName: "アスト・マスター",
    bossName: "スカイドラゴン",
    completeName: "コスモス",
    accent: "#dc2626",
    miniShape: "frontierdragon",
    normalShape: "starguardian",
    bossShape: "skydragon",
    completeShape: "cosmicpriest",
    role: "world",
  },
  {
    id: "pre2-ph-001-100",
    stageName: "天空のことば",
    icon: "🌠",
    bossTitle: "天空のことば遣い",
    completeTitle: "天空言語の大賢者",
    miniName: "オラク",
    normalName: "ルナ",
    bossName: "コスモ",
    completeName: "ノア・マスター",
    accent: "#7c3aed",
    miniShape: "oraclesprite",
    normalShape: "mooncaster",
    bossShape: "cosmicpriest",
    completeShape: "starspirit",
  },
  {
    id: "pre2-ph-101-200",
    stageName: "月光のことば",
    icon: "🌙",
    bossTitle: "月光の書記",
    completeTitle: "月光の大書記",
    miniName: "クロノス・マスター",
    normalName: "メモリア・マスター",
    bossName: "フロンティア",
    completeName: "ルナ・マスター",
    accent: "#1e3a5f",
    miniShape: "timekeeper",
    normalShape: "memorysage",
    bossShape: "frontierdragon",
    completeShape: "mooncaster",
  },
  {
    id: "pre2-ph-201-300",
    stageName: "宇宙のことば",
    icon: "🔭",
    bossTitle: "宇宙の書記",
    completeTitle: "宇宙の大書記",
    miniName: "オラクル",
    normalName: "コスモ・マスター",
    bossName: "スターガーディアン",
    completeName: "スカイドラゴン・マスター",
    accent: "#312e81",
    miniShape: "oraclesprite",
    normalShape: "cosmicpriest",
    bossShape: "starguardian",
    completeShape: "skydragon",
  },
];

const eiken5Bosses = createDungeonBossConfigs(eiken5DungeonBossSeeds);
const eiken4Bosses = createDungeonBossConfigs(eiken4DungeonBossSeeds);
const eiken3Bosses = createDungeonBossConfigs(eiken3DungeonBossSeeds);
const eikenPre2Bosses = createDungeonBossConfigs(eikenPre2DungeonBossSeeds);

const eiken5RangeBossSeeds = eiken5DungeonBossSeeds.slice(0, 6);
const eiken4RangeBossSeeds = eiken4DungeonBossSeeds.slice(0, 7);
const eiken3RangeBossSeeds = eiken3DungeonBossSeeds.slice(0, 8);
const eikenPre2RangeBossSeeds = eikenPre2DungeonBossSeeds.slice(0, 15);

export const questWorlds: QuestWorldConfig[] = [
  {
    id: "eiken5",
    level: "英検5級",
    worldName: "星夜のはじまりの森",
    backgroundImage: questWorldBackgroundImages.eiken5,
    part: 1,
    order: 10,
    status: "available",
    colorSuffix: "5",
    description: "英語冒険の入口となる、明るい森ワールドです。",
    bosses: eiken5Bosses,
    worldBossId: "eiken5-501-600-complete",
    blocks: [
      ...createRangeBlocks({
        levelId: "eiken5",
        idPrefix: "eiken5",
        ranges: rangeLabels.slice(0, 6),
        stagePrefix: "森ルート",
        stageNames: [
          "森の入口",
          "きのこの小道",
          "妖精の泉",
          "木漏れ日の丘",
          "古木の迷路",
          "森の神殿",
        ],
        mapIcon: "🌿",
        mapIcons: eiken5RangeBossSeeds.map((seed) => seed.icon),
        midBossIds: getDungeonMiniBossIds(eiken5RangeBossSeeds),
        worldBossId: "eiken5-501-600-complete",
        modeBosses: getDungeonModeBossSchedule(eiken5RangeBossSeeds),
      }),
      createPhraseBlock({
        id: "eiken5-ph-001-100",
        levelId: "eiken5",
        label: "熟語 001-100",
        stageName: "ことばの小道",
        mapIcon: "💬",
        bossId: "eiken5-ph-001-100-boss",
        modeBosses: getDungeonModeBosses(eiken5DungeonBossSeeds[6]),
      }),
    ],
    rewards: [
      { kind: "title", label: "森の旅人" },
      { kind: "background", label: "はじまりの森" },
    ],
  },
  {
    id: "eiken4",
    level: "英検4級",
    worldName: "月明かりの風の港町",
    backgroundImage: questWorldBackgroundImages.eiken4,
    part: 1,
    order: 20,
    status: "available",
    colorSuffix: "4",
    description: "少し長い文と熟語へ船出する港ワールドです。",
    bosses: eiken4Bosses,
    worldBossId: "eiken4-601-700-complete",
    blocks: [
      ...createRangeBlocks({
        levelId: "eiken4",
        idPrefix: "eiken4",
        ranges: rangeLabels.slice(0, 7),
        stagePrefix: "港町ルート",
        stageNames: [
          "港町の入口",
          "市場通り",
          "風車の丘",
          "船着き場",
          "灯台の岬",
          "嵐の海路",
          "海竜の巣",
        ],
        mapIcon: "⚓",
        mapIcons: eiken4RangeBossSeeds.map((seed) => seed.icon),
        midBossIds: getDungeonMiniBossIds(eiken4RangeBossSeeds),
        worldBossId: "eiken4-601-700-complete",
        modeBosses: getDungeonModeBossSchedule(eiken4RangeBossSeeds),
      }),
      createPhraseBlock({
        id: "eiken4-ph-001-100",
        levelId: "eiken4",
        label: "熟語 001-100",
        stageName: "港町熟語市場",
        mapIcon: "🛟",
        bossId: "eiken4-ph-001-100-boss",
        modeBosses: getDungeonModeBosses(eiken4DungeonBossSeeds[7]),
      }),
    ],
    rewards: [
      { kind: "frame", label: "港のフレーム" },
      { kind: "background", label: "風の港町" },
    ],
  },
  {
    id: "eiken3",
    level: "英検3級",
    worldName: "紫光の古代遺跡",
    backgroundImage: questWorldBackgroundImages.eiken3,
    part: 1,
    order: 30,
    status: "available",
    colorSuffix: "3",
    description: "日常から物語へ広がる、古代遺跡ワールドです。",
    bosses: eiken3Bosses,
    worldBossId: "eiken3-701-800-complete",
    blocks: [
      ...createRangeBlocks({
        levelId: "eiken3",
        idPrefix: "eiken3",
        ranges: rangeLabels.slice(0, 8),
        stagePrefix: "遺跡ルート",
        stageNames: [
          "遺跡の入口",
          "石碑の回廊",
          "砂の広場",
          "地下神殿",
          "古代図書館",
          "王の墓所",
          "ファラオの間",
          "太陽神の祭壇",
        ],
        mapIcon: "🏰",
        mapIcons: eiken3RangeBossSeeds.map((seed) => seed.icon),
        midBossIds: getDungeonMiniBossIds(eiken3RangeBossSeeds),
        worldBossId: "eiken3-701-800-complete",
        modeBosses: getDungeonModeBossSchedule(eiken3RangeBossSeeds),
      }),
      createPhraseBlock({
        id: "eiken3-ph-001-100",
        levelId: "eiken3",
        label: "熟語 001-100",
        stageName: "熟語の石碑",
        mapIcon: "🗣️",
        bossId: "eiken3-ph-001-100-boss",
        modeBosses: getDungeonModeBosses(eiken3DungeonBossSeeds[8]),
      }),
      createPhraseBlock({
        id: "eiken3-ph-101-200",
        levelId: "eiken3",
        label: "熟語 101-200",
        stageName: "古代熟語の回廊",
        mapIcon: "📜",
        bossId: "eiken3-ph-101-200-boss",
        modeBosses: getDungeonModeBosses(eiken3DungeonBossSeeds[9]),
      }),
    ],
    rewards: [
      { kind: "title", label: "古代遺跡の踏破者" },
      { kind: "background", label: "黄金の神殿" },
      { kind: "frame", label: "太陽の紋章" },
      { kind: "effect", label: "砂塵のオーラ" },
      { kind: "limitedCard", label: "古代王ファラオス SSR" },
    ],
    partClear: {
      triggerBlockId: "eiken3-701-800",
      triggerQuestMode: "complete",
      kicker: "古代遺跡クリア！",
      title: "古代遺跡の踏破者",
      message: "あなたは古代遺跡の踏破者となりました。",
      epilogue: "さらなる冒険が、天空都市であなたを待っています。",
      rewards: [
        { kind: "title", label: "古代遺跡の踏破者" },
        { kind: "background", label: "黄金の神殿" },
        { kind: "frame", label: "太陽の紋章" },
        { kind: "effect", label: "砂塵のオーラ" },
        { kind: "limitedCard", label: "古代王ファラオス SSR" },
      ],
    },
  },
  {
    id: "eiken_pre2",
    level: "英検準2級",
    worldName: "暁光の天空都市",
    backgroundImage: questWorldBackgroundImages.eiken_pre2,
    part: 1,
    order: 40,
    status: "available",
    colorSuffix: "pre2",
    description: "最終ワールド。空の彼方へ続く天空都市です。",
    bosses: eikenPre2Bosses,
    worldBossId: "pre2-1401-1500-complete",
    blocks: [
      ...createRangeBlocks({
        levelId: "eiken_pre2",
        idPrefix: "pre2",
        ranges: rangeLabels,
        stagePrefix: "天空ルート",
        stageNames: [
          "天空への階段",
          "雲海の道",
          "白銀の橋",
          "魔法塔入口",
          "星見の回廊",
          "雷鳴の庭",
          "光の神殿",
          "天空騎士団",
          "竜の祭壇",
          "アステリオンの門",
          "天空竜の玉座",
          "星屑の聖域",
          "時の回廊",
          "記憶の大聖堂",
          "フロンティアの頂",
        ],
        mapIcon: "⛰️",
        mapIcons: eikenPre2RangeBossSeeds.map((seed) => seed.icon),
        midBossIds: getDungeonMiniBossIds(eikenPre2RangeBossSeeds),
        worldBossId: "pre2-1401-1500-complete",
        modeBosses: getDungeonModeBossSchedule(eikenPre2RangeBossSeeds),
      }),
      createPhraseBlock({
        id: "pre2-ph-001-100",
        levelId: "eiken_pre2",
        label: "熟語 001-100",
        stageName: "星詠み熟語神殿",
        mapIcon: "💬",
        bossId: "pre2-ph-001-100-boss",
        modeBosses: getDungeonModeBosses(eikenPre2DungeonBossSeeds[15]),
      }),
      createPhraseBlock({
        id: "pre2-ph-101-200",
        levelId: "eiken_pre2",
        label: "熟語 101-200",
        stageName: "月光の熟語回廊",
        mapIcon: "🗣️",
        bossId: "pre2-ph-101-200-boss",
        modeBosses: getDungeonModeBosses(eikenPre2DungeonBossSeeds[16]),
      }),
      createPhraseBlock({
        id: "pre2-ph-201-300",
        levelId: "eiken_pre2",
        label: "熟語 201-300",
        stageName: "星界の熟語聖堂",
        mapIcon: "📜",
        bossId: "pre2-ph-201-300-boss",
        modeBosses: getDungeonModeBosses(eikenPre2DungeonBossSeeds[17]),
      }),
    ],
    rewards: [
      { kind: "title", label: "フロンティアマスター" },
      { kind: "background", label: "天空都市の夜明け" },
      { kind: "frame", label: "黄金の翼" },
      { kind: "effect", label: "星空のオーラ" },
      { kind: "limitedCard", label: "天空竜アステリオン UR" },
    ],
    partClear: {
      triggerBlockId: "pre2-1401-1500",
      triggerQuestMode: "complete",
      kicker: "天空都市クリア！",
      title: "フロンティアマスター達成！",
      message: "英検準2級までの冒険を制覇しました。",
      epilogue: "まだ見ぬ新たな大陸が、空の彼方であなたを待っています。",
      rewards: [
        { kind: "title", label: "フロンティアマスター" },
        { kind: "background", label: "天空都市の夜明け" },
        { kind: "frame", label: "黄金の翼" },
        { kind: "effect", label: "星空のオーラ" },
        { kind: "limitedCard", label: "天空竜アステリオン UR" },
      ],
    },
  },
  {
    id: "eiken2",
    level: "英検2級",
    worldName: "魔導王国",
    part: 2,
    order: 50,
    status: "future",
    colorSuffix: "2",
    description: "将来追加予定の上級ワールドです。",
    blocks: [],
    bosses: [],
    rewards: [],
  },
  {
    id: "eiken_pre1",
    level: "英検準1級",
    worldName: "世界樹の聖域",
    part: 2,
    order: 60,
    status: "future",
    colorSuffix: "pre1",
    description: "将来追加予定の上級ワールドです。",
    blocks: [],
    bosses: [],
    rewards: [],
  },
  {
    id: "eiken1",
    level: "英検1級",
    worldName: "星界フロンティア",
    part: 2,
    order: 70,
    status: "future",
    colorSuffix: "1",
    description: "将来追加予定の最上級ワールドです。",
    blocks: [],
    bosses: [],
    rewards: [],
  },
];

export const availableQuestWorlds = questWorlds.filter(
  (world) => world.status === "available"
);

export const futureQuestWorlds = questWorlds.filter(
  (world) => world.status === "future"
);

export const levelOrder = availableQuestWorlds.map((world) => world.level);

export const questWorldsByLevel = questWorlds.reduce<
  Record<string, QuestWorldConfig>
>((worlds, world) => {
  worlds[world.level] = world;
  return worlds;
}, {});

export const questWorldsById = questWorlds.reduce<
  Record<EikenLevelId, QuestWorldConfig>
>((worlds, world) => {
  worlds[world.id] = world;
  return worlds;
}, {} as Record<EikenLevelId, QuestWorldConfig>);

export const questBlocksById = questWorlds.reduce<
  Record<string, QuestBlockConfig>
>((blocks, world) => {
  for (const block of world.blocks) {
    blocks[block.id] = block;
  }
  return blocks;
}, {});

const bossesById = questWorlds.reduce<Record<string, BossConfig>>(
  (bosses, world) => {
    for (const boss of world.bosses) {
      bosses[boss.id] = boss;
    }
    return bosses;
  },
  {}
);

export const defaultBoss = eiken5Bosses[0];

export function getQuestModeConfig(mode: QuestMode) {
  return questModeConfigs[mode];
}

export function getQuestWorldByLevel(level: string) {
  return questWorldsByLevel[level];
}

export function getQuestBlockConfig(blockId: string | null | undefined) {
  if (!blockId) return undefined;
  return questBlocksById[blockId];
}

export function getQuestWorldByBlockId(blockId: string | null | undefined) {
  const block = getQuestBlockConfig(blockId);
  if (!block) return undefined;
  return questWorldsById[block.levelId];
}

export function getBossConfig(bossId: string | null | undefined) {
  if (!bossId) return undefined;
  return bossesById[bossId];
}

function getStableIndex(key: string, length: number) {
  if (length <= 0) return 0;

  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) | 0;
  }

  return Math.abs(hash) % length;
}

export function getBossForQuest({
  blockId,
  mode,
  title,
  questionCount,
}: {
  blockId?: string | null;
  mode: QuestMode;
  title: string;
  questionCount: number;
}) {
  const block = getQuestBlockConfig(blockId);
  const world = getQuestWorldByBlockId(blockId);
  const blockBoss = getBossConfig(block?.bosses[mode]);
  if (blockBoss) return blockBoss;

  const worldBoss = getBossConfig(world?.worldBossId);
  if (worldBoss) return worldBoss;

  const availableBosses = availableQuestWorlds.flatMap((questWorld) =>
    questWorld.bosses
  );
  const fallbackIndex = getStableIndex(
    `${blockId ?? title}:${mode}:${questionCount}`,
    availableBosses.length
  );

  return availableBosses[fallbackIndex] ?? defaultBoss;
}

export function getPartClearReward(
  blockId: string | null | undefined,
  mode: QuestMode
) {
  const world = getQuestWorldByBlockId(blockId);
  const partClear = world?.partClear;

  if (
    partClear &&
    partClear.triggerBlockId === blockId &&
    partClear.triggerQuestMode === mode
  ) {
    return partClear;
  }

  return undefined;
}
