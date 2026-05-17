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

export type BossShape =
  | "demon"
  | "dragon"
  | "slime"
  | "golem"
  | "ghost"
  | "wolf"
  | "plant"
  | "wizard"
  | "insect"
  | "core";

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

function createRangeBlocks({
  levelId,
  idPrefix,
  ranges,
  stagePrefix,
  stageNames,
  mapIcon,
  midBossIds,
  worldBossId,
  milestoneSchedule = {},
}: {
  levelId: EikenLevelId;
  idPrefix: string;
  ranges: readonly string[];
  stagePrefix: string;
  stageNames?: readonly string[];
  mapIcon: string;
  midBossIds: readonly string[];
  worldBossId: string;
  milestoneSchedule?: Partial<Record<number, string>>;
}): QuestBlockConfig[] {
  return ranges.map((range, index) => {
    const stageName = stageNames?.[index] ?? `${stagePrefix} ${index + 1}`;
    const midBossId = midBossIds[index % midBossIds.length];
    const nextMidBossId = midBossIds[(index + 1) % midBossIds.length];
    const isFinalBlock = index === ranges.length - 1;
    const milestoneBossId = milestoneSchedule[index];

    return {
      id: `${idPrefix}-${range}`,
      levelId,
      label: range,
      stageName,
      mapIcon,
      bosses: {
        mini: midBossId,
        normal: nextMidBossId,
        boss: isFinalBlock ? worldBossId : (milestoneBossId ?? midBossId),
        complete: isFinalBlock ? worldBossId : (milestoneBossId ?? nextMidBossId),
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
}: {
  id: string;
  levelId: EikenLevelId;
  label: string;
  stageName: string;
  mapIcon: string;
  bossId: string;
}): QuestBlockConfig {
  return {
    id,
    levelId,
    label,
    stageName,
    mapIcon,
    bosses: {
      mini: bossId,
      normal: bossId,
      boss: bossId,
      complete: bossId,
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
      detail: "8問正解でクリア",
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
      detail: "24問正解でクリア",
    },
    rewards: [
      { kind: "medal", label: "冒険メダル" },
      { kind: "background", label: "ブロック背景の欠片" },
    ],
  },
  boss: {
    mode: "boss",
    label: "ボス戦",
    questionCount: 50,
    clearCorrectCount: 45,
    maxMissCount: 6,
    progressKey: "bossCleared",
    copy: {
      icon: "🐉",
      reward: "赤宝石 + 大コイン",
      short: "ボスに挑む",
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
      detail: "90問正解でクリア",
    },
    rewards: [
      { kind: "title", label: "ブロック制覇者" },
      { kind: "limitedCard", label: "金宝箱カード抽選券" },
    ],
  },
} as const satisfies Record<QuestMode, QuestModeConfig>;

export const questModeConfigList = Object.values(questModeConfigs);

export const defaultQuestConfig = questModeConfigs.complete;

export const questBoardStatus = questModeConfigList.map((config) => ({
  key: config.progressKey,
  label: config.label,
}));

const eiken5Bosses: BossConfig[] = [
  {
    id: "eiken5-agni",
    role: "mid",
    name: "🔥 角火のアグニ",
    title: "炎の角を持ついたずら小鬼",
    stage: "🏰 炎の関門",
    accent: "#ef4444",
    shape: "demon",
  },
  {
    id: "eiken5-slime",
    role: "mid",
    name: "💧 ぷるぷるスライム",
    title: "半透明の体でゆれる水のモンスター",
    stage: "🌊 深海の試練",
    accent: "#06b6d4",
    shape: "slime",
  },
  {
    id: "eiken5-greengolem",
    role: "world",
    name: "🌿 森の番人 グリーンゴーレム",
    title: "大地の草木に守られた森の守護神",
    stage: "🌿 森の神殿",
    accent: "#22c55e",
    shape: "golem",
  },
];

const eiken4Bosses: BossConfig[] = [
  {
    id: "eiken4-frost",
    role: "mid",
    name: "❄️ 氷晶のフロスト",
    title: "永久凍土に眠る古の氷龍",
    stage: "❄️ 氷結の峡谷",
    accent: "#38bdf8",
    shape: "dragon",
  },
  {
    id: "eiken4-ghost",
    role: "mid",
    name: "👻 ランタンゴースト",
    title: "夜の塔をふわっと漂う小さな影",
    stage: "🌙 闇の塔",
    accent: "#c084fc",
    shape: "ghost",
  },
  {
    id: "eiken4-tempest",
    role: "world",
    name: "🌊 嵐を呼ぶ海竜 テンペスト",
    title: "嵐とともに現れる伝説の海竜",
    stage: "⛵ 嵐の海路",
    accent: "#0ea5e9",
    shape: "dragon",
  },
];

const eiken3Bosses: BossConfig[] = [
  {
    id: "eiken3-nova",
    role: "mid",
    name: "💠 ルーンコア・ノヴァ",
    title: "古い文字を守る魔法の結晶核",
    stage: "🌋 火山の峡谷",
    accent: "#fb923c",
    shape: "core",
  },
  {
    id: "eiken3-mage",
    role: "mid",
    name: "🪄 星帽子のメイジ",
    title: "星の杖をふる小さな魔法使い",
    stage: "💀 亡者の迷宮",
    accent: "#818cf8",
    shape: "wizard",
  },
  {
    id: "eiken3-pharaos",
    role: "world",
    name: "👑 古代王 ファラオス",
    title: "太陽神の加護を受けた不死の古代王",
    stage: "☀️ 太陽神の祭壇",
    accent: "#f59e0b",
    shape: "demon",
  },
];

const eikenPre2Bosses: BossConfig[] = [
  {
    id: "pre2-algent",
    role: "mid",
    name: "🛡️ 白銀の番人 アルゲント",
    title: "銀色の鎧をまとった天空の守護者",
    stage: "🌉 白銀の橋",
    accent: "#e2e8f0",
    shape: "golem",
  },
  {
    id: "pre2-tonitrus",
    role: "mid",
    name: "⚡ 雷鳴の魔導士 トニトルス",
    title: "雷の魔法を操る天空の魔法使い",
    stage: "⛈️ 雷鳴の庭",
    accent: "#facc15",
    shape: "wizard",
  },
  {
    id: "pre2-celes",
    role: "mid",
    name: "🔮 竜の祭司 セレス",
    title: "天空竜に仕える古の祭司",
    stage: "🏛️ 竜の祭壇",
    accent: "#a78bfa",
    shape: "dragon",
  },
  {
    id: "pre2-chronos",
    role: "mid",
    name: "⌛ 時空の守護者 クロノス",
    title: "時の流れを支配する永遠の番人",
    stage: "🌀 時の回廊",
    accent: "#67e8f9",
    shape: "core",
  },
  {
    id: "pre2-asterion",
    role: "world",
    name: "🌟 天空竜 アステリオン",
    title: "天空都市の頂に君臨する光の竜王",
    stage: "🌟 フロンティアの頂",
    accent: "#fbbf24",
    shape: "dragon",
  },
];

export const questWorlds: QuestWorldConfig[] = [
  {
    id: "eiken5",
    level: "英検5級",
    worldName: "はじまりの森",
    part: 1,
    order: 10,
    status: "available",
    colorSuffix: "5",
    description: "英語冒険の入口となる、明るい森ワールドです。",
    bosses: eiken5Bosses,
    worldBossId: "eiken5-greengolem",
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
        midBossIds: ["eiken5-agni", "eiken5-slime"],
        worldBossId: "eiken5-greengolem",
      }),
      createPhraseBlock({
        id: "eiken5-ph-001-100",
        levelId: "eiken5",
        label: "熟語 001-100",
        stageName: "ことばの小道",
        mapIcon: "💬",
        bossId: "eiken5-slime",
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
    worldName: "風の港町",
    part: 1,
    order: 20,
    status: "available",
    colorSuffix: "4",
    description: "少し長い文と熟語へ船出する港ワールドです。",
    bosses: eiken4Bosses,
    worldBossId: "eiken4-tempest",
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
        midBossIds: ["eiken4-frost", "eiken4-ghost"],
        worldBossId: "eiken4-tempest",
      }),
      createPhraseBlock({
        id: "eiken4-ph-001-100",
        levelId: "eiken4",
        label: "熟語 001-100",
        stageName: "港町熟語市場",
        mapIcon: "🛟",
        bossId: "eiken4-ghost",
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
    worldName: "古代遺跡",
    part: 1,
    order: 30,
    status: "available",
    colorSuffix: "3",
    description: "日常から物語へ広がる、古代遺跡ワールドです。",
    bosses: eiken3Bosses,
    worldBossId: "eiken3-pharaos",
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
        midBossIds: ["eiken3-nova", "eiken3-mage"],
        worldBossId: "eiken3-pharaos",
      }),
      createPhraseBlock({
        id: "eiken3-ph-001-100",
        levelId: "eiken3",
        label: "熟語 001-100",
        stageName: "熟語の石碑",
        mapIcon: "🗣️",
        bossId: "eiken3-mage",
      }),
      createPhraseBlock({
        id: "eiken3-ph-101-200",
        levelId: "eiken3",
        label: "熟語 101-200",
        stageName: "古代熟語の回廊",
        mapIcon: "📜",
        bossId: "eiken3-pharaos",
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
    worldName: "天空都市",
    part: 1,
    order: 40,
    status: "available",
    colorSuffix: "pre2",
    description: "最終ワールド。空の彼方へ続く天空都市です。",
    bosses: eikenPre2Bosses,
    worldBossId: "pre2-asterion",
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
        midBossIds: ["pre2-algent", "pre2-tonitrus", "pre2-celes", "pre2-chronos"],
        worldBossId: "pre2-asterion",
        milestoneSchedule: {
          2: "pre2-algent",
          5: "pre2-tonitrus",
          8: "pre2-celes",
          11: "pre2-chronos",
        },
      }),
      createPhraseBlock({
        id: "pre2-ph-001-100",
        levelId: "eiken_pre2",
        label: "熟語 001-100",
        stageName: "星詠み熟語神殿",
        mapIcon: "💬",
        bossId: "pre2-algent",
      }),
      createPhraseBlock({
        id: "pre2-ph-101-200",
        levelId: "eiken_pre2",
        label: "熟語 101-200",
        stageName: "月光の熟語回廊",
        mapIcon: "🗣️",
        bossId: "pre2-tonitrus",
      }),
      createPhraseBlock({
        id: "pre2-ph-201-300",
        levelId: "eiken_pre2",
        label: "熟語 201-300",
        stageName: "星界の熟語聖堂",
        mapIcon: "📜",
        bossId: "pre2-chronos",
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
