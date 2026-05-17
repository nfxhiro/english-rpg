import { getMonsterCardById } from "./cards";

export type ShopItemCategory =
  | "avatar"
  | "title"
  | "background"
  | "frame"
  | "effect";

export type ShopItem = {
  id: string;
  name: string;
  emoji: string;
  price: number;
  category: ShopItemCategory;
  description: string;
  backgroundCss?: string;
  frameCss?: string;
  effectClass?: string;
};

export const SHOP_AVATARS: ShopItem[] = [
  {
    id: "avatar_novice",
    name: "勇者見習い",
    emoji: "⚔️",
    price: 500,
    category: "avatar",
    description: "冒険を始めたばかりの見習い勇者",
  },
  {
    id: "avatar_fire",
    name: "炎の勇者",
    emoji: "🔥",
    price: 1200,
    category: "avatar",
    description: "炎を操る情熱の勇者",
  },
  {
    id: "avatar_water",
    name: "水の魔導士",
    emoji: "🌊",
    price: 1200,
    category: "avatar",
    description: "水の魔法を操る知恵者",
  },
  {
    id: "avatar_ranger",
    name: "森のレンジャー",
    emoji: "🏹",
    price: 1500,
    category: "avatar",
    description: "森を疾走する弓の達人",
  },
  {
    id: "avatar_knight",
    name: "光の騎士",
    emoji: "✨",
    price: 2500,
    category: "avatar",
    description: "光に輝く誇り高き騎士",
  },
  {
    id: "avatar_sage",
    name: "闇の賢者",
    emoji: "🔮",
    price: 3000,
    category: "avatar",
    description: "闇の知識を持つ神秘の賢者",
  },
];

export const SHOP_TITLES: ShopItem[] = [
  {
    id: "title_gold_hunter",
    name: "ゴールドハンター",
    emoji: "💰",
    price: 500,
    category: "title",
    description: "ゴールドを稼ぐ猛者に贈られる称号",
  },
  {
    id: "title_treasure",
    name: "宝箱コレクター",
    emoji: "🏆",
    price: 800,
    category: "title",
    description: "あらゆる宝を集め続ける称号",
  },
  {
    id: "title_word_collector",
    name: "単語コレクター",
    emoji: "📖",
    price: 1200,
    category: "title",
    description: "英単語の収集に情熱を燃やす称号",
  },
  {
    id: "title_library",
    name: "魔法図書館の常連",
    emoji: "📚",
    price: 2000,
    category: "title",
    description: "知識の宝庫に通い続ける賢者の称号",
  },
  {
    id: "title_vip",
    name: "Frontier VIP",
    emoji: "👑",
    price: 3000,
    category: "title",
    description: "フロンティアの特別な称号",
  },
  {
    id: "title_shop_master",
    name: "冒険ショップの達人",
    emoji: "🪙",
    price: 5000,
    category: "title",
    description: "ショップを極めた究極の称号",
  },
];

export const SHOP_BACKGROUNDS: ShopItem[] = [
  {
    id: "bg_grassland",
    name: "草原のはじまり",
    emoji: "🌿",
    price: 800,
    category: "background",
    description: "穏やかな緑の草原が広がる世界",
    backgroundCss:
      "radial-gradient(circle at 20% 20%, rgba(34,197,94,0.28), transparent 40%), radial-gradient(circle at 80% 80%, rgba(21,128,61,0.36), transparent 40%), linear-gradient(145deg, #052e16 0%, #14532d 50%, #052e16 100%)",
  },
  {
    id: "bg_magic_forest",
    name: "魔法の森",
    emoji: "🌲",
    price: 1500,
    category: "background",
    description: "魔法が宿る神秘の深い森",
    backgroundCss:
      "radial-gradient(circle at 30% 20%, rgba(134,239,172,0.18), transparent 35%), radial-gradient(circle at 70% 80%, rgba(168,85,247,0.28), transparent 40%), linear-gradient(145deg, #0a1a0a 0%, #0f2d1a 40%, #1a0a2f 100%)",
  },
  {
    id: "bg_library",
    name: "古代図書館",
    emoji: "📜",
    price: 2500,
    category: "background",
    description: "無数の知識が眠る古代の図書館",
    backgroundCss:
      "radial-gradient(circle at 50% 0%, rgba(251,191,36,0.22), transparent 40%), radial-gradient(circle at 20% 100%, rgba(180,83,9,0.28), transparent 40%), linear-gradient(145deg, #1c1108 0%, #2d1f0a 50%, #1c1108 100%)",
  },
  {
    id: "bg_startemple",
    name: "星空の神殿",
    emoji: "⭐",
    price: 3500,
    category: "background",
    description: "無数の星が降り注ぐ神秘の神殿",
    backgroundCss:
      "radial-gradient(circle at 20% 20%, rgba(34,211,238,0.18), transparent 35%), radial-gradient(circle at 80% 60%, rgba(168,85,247,0.26), transparent 40%), radial-gradient(circle at 50% 100%, rgba(251,191,36,0.14), transparent 35%), linear-gradient(145deg, #030614 0%, #080a28 50%, #0a0322 100%)",
  },
  {
    id: "bg_dragon_castle",
    name: "ドラゴンの城",
    emoji: "🏰",
    price: 5000,
    category: "background",
    description: "伝説のドラゴンが守護する古城",
    backgroundCss:
      "radial-gradient(circle at 20% 30%, rgba(239,68,68,0.28), transparent 40%), radial-gradient(circle at 80% 70%, rgba(180,9,9,0.28), transparent 40%), linear-gradient(145deg, #1a0505 0%, #2d0a0a 50%, #1a0505 100%)",
  },
  {
    id: "bg_frontier",
    name: "Frontier Castle",
    emoji: "✨",
    price: 8000,
    category: "background",
    description: "フロンティアの伝説を刻む壮大な城",
    backgroundCss:
      "radial-gradient(circle at 10% 4%, rgba(34,211,238,0.24), transparent 30%), radial-gradient(circle at 86% 6%, rgba(168,85,247,0.34), transparent 34%), radial-gradient(circle at 50% 100%, rgba(250,204,21,0.2), transparent 34%), linear-gradient(145deg, #050714 0%, #09102a 42%, #1b123f 72%, #060816 100%)",
  },
];

export const SHOP_FRAMES: ShopItem[] = [
  {
    id: "frame_starlight",
    name: "星光の額縁",
    emoji: "✦",
    price: 900,
    category: "frame",
    description: "金と星の光でカードを縁取る基本フレーム",
    frameCss: "linear-gradient(135deg, #fde68a 0%, #facc15 20%, #7c3aed 58%, #22d3ee 100%)",
  },
  {
    id: "frame_emerald",
    name: "深緑の紋章",
    emoji: "🛡️",
    price: 1500,
    category: "frame",
    description: "森と守護の力をまとったエメラルドの縁取り",
    frameCss: "linear-gradient(135deg, #bbf7d0 0%, #22c55e 32%, #0f766e 62%, #67e8f9 100%)",
  },
  {
    id: "frame_ruby",
    name: "紅蓮の戦紋",
    emoji: "🔥",
    price: 2200,
    category: "frame",
    description: "炎のクエストに似合う赤と金の豪華フレーム",
    frameCss: "linear-gradient(135deg, #fef3c7 0%, #f59e0b 24%, #ef4444 58%, #7f1d1d 100%)",
  },
  {
    id: "frame_moon",
    name: "月影の魔導枠",
    emoji: "🌙",
    price: 3200,
    category: "frame",
    description: "闇と月光が混ざる賢者向けの神秘フレーム",
    frameCss: "linear-gradient(135deg, #f5d0fe 0%, #a855f7 34%, #312e81 64%, #22d3ee 100%)",
  },
  {
    id: "frame_frontier",
    name: "Frontier Crown",
    emoji: "👑",
    price: 6500,
    category: "frame",
    description: "王冠の輝きをまとった最高級フロンティアフレーム",
    frameCss: "conic-gradient(from 15deg, #fff7ad, #facc15, #fb7185, #a855f7, #22d3ee, #86efac, #fff7ad)",
  },
];

export const SHOP_EFFECTS: ShopItem[] = [
  {
    id: "effect_spark",
    name: "星屑オーラ",
    emoji: "✨",
    price: 1000,
    category: "effect",
    description: "アバターの周囲に星の粒子がきらめく演出",
    effectClass: "effect-spark",
  },
  {
    id: "effect_flame",
    name: "紅蓮オーラ",
    emoji: "🔥",
    price: 1800,
    category: "effect",
    description: "炎のゆらめきでアバターを力強く演出",
    effectClass: "effect-flame",
  },
  {
    id: "effect_aqua",
    name: "蒼波オーラ",
    emoji: "💧",
    price: 1800,
    category: "effect",
    description: "水と光の波紋が静かに広がる演出",
    effectClass: "effect-aqua",
  },
  {
    id: "effect_shadow",
    name: "闇星の結界",
    emoji: "🔮",
    price: 2800,
    category: "effect",
    description: "紫の魔法陣と闇の星が浮かぶ賢者の演出",
    effectClass: "effect-shadow",
  },
  {
    id: "effect_crown",
    name: "王冠の祝福",
    emoji: "👑",
    price: 5200,
    category: "effect",
    description: "金色の光が降り注ぐレジェンド級エフェクト",
    effectClass: "effect-crown",
  },
];

export type ShopState = {
  ownedAvatars: string[];
  ownedTitles: string[];
  ownedBackgrounds: string[];
  ownedFrames: string[];
  ownedEffects: string[];
  selectedAvatar: string | null;
  selectedTitle: string | null;
  selectedBackground: string | null;
  selectedFrame: string | null;
  selectedEffect: string | null;
  selectedMonsterCardId: string | null;
};

const DEFAULT_SHOP_STATE: ShopState = {
  ownedAvatars: [],
  ownedTitles: [],
  ownedBackgrounds: [],
  ownedFrames: [],
  ownedEffects: [],
  selectedAvatar: null,
  selectedTitle: null,
  selectedBackground: null,
  selectedFrame: null,
  selectedEffect: null,
  selectedMonsterCardId: null,
};

export function loadShopState(): ShopState {
  if (typeof window === "undefined") return { ...DEFAULT_SHOP_STATE };
  try {
    const raw = localStorage.getItem("shopState");
    if (!raw) return { ...DEFAULT_SHOP_STATE };
    const parsed = JSON.parse(raw) as Partial<ShopState>;
    return {
      ownedAvatars: Array.isArray(parsed.ownedAvatars) ? parsed.ownedAvatars : [],
      ownedTitles: Array.isArray(parsed.ownedTitles) ? parsed.ownedTitles : [],
      ownedBackgrounds: Array.isArray(parsed.ownedBackgrounds) ? parsed.ownedBackgrounds : [],
      ownedFrames: Array.isArray(parsed.ownedFrames) ? parsed.ownedFrames : [],
      ownedEffects: Array.isArray(parsed.ownedEffects) ? parsed.ownedEffects : [],
      selectedAvatar: typeof parsed.selectedAvatar === "string" ? parsed.selectedAvatar : null,
      selectedTitle: typeof parsed.selectedTitle === "string" ? parsed.selectedTitle : null,
      selectedBackground: typeof parsed.selectedBackground === "string" ? parsed.selectedBackground : null,
      selectedFrame: typeof parsed.selectedFrame === "string" ? parsed.selectedFrame : null,
      selectedEffect: typeof parsed.selectedEffect === "string" ? parsed.selectedEffect : null,
      selectedMonsterCardId: typeof parsed.selectedMonsterCardId === "string" ? parsed.selectedMonsterCardId : null,
    };
  } catch {
    return { ...DEFAULT_SHOP_STATE };
  }
}

export function saveShopState(state: ShopState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("shopState", JSON.stringify(state));
}

export function getSelectedAvatarEmoji(shopState: ShopState): string {
  if (shopState.selectedMonsterCardId) {
    const card = getMonsterCardById(shopState.selectedMonsterCardId);
    if (card) return card.monsterEmoji;
  }
  const item = getSelectedAvatarItem(shopState);
  return item?.emoji ?? "🐉";
}

export function getSelectedMonsterCard(shopState: ShopState) {
  if (!shopState.selectedMonsterCardId) return null;
  return getMonsterCardById(shopState.selectedMonsterCardId) ?? null;
}

export function getSelectedAvatarItem(shopState: ShopState): ShopItem | null {
  if (!shopState.selectedAvatar) return null;
  return SHOP_AVATARS.find((a) => a.id === shopState.selectedAvatar) ?? null;
}

export function getSelectedBackgroundItem(shopState: ShopState): ShopItem | null {
  if (!shopState.selectedBackground) return null;
  return SHOP_BACKGROUNDS.find((b) => b.id === shopState.selectedBackground) ?? null;
}

export function getSelectedBackgroundCss(shopState: ShopState): string | null {
  const item = getSelectedBackgroundItem(shopState);
  return item?.backgroundCss ?? null;
}

export function getSelectedFrameItem(shopState: ShopState): ShopItem | null {
  if (!shopState.selectedFrame) return null;
  return SHOP_FRAMES.find((f) => f.id === shopState.selectedFrame) ?? null;
}

export function getSelectedFrameCss(shopState: ShopState): string | null {
  const item = getSelectedFrameItem(shopState);
  return item?.frameCss ?? null;
}

export function getSelectedEffectItem(shopState: ShopState): ShopItem | null {
  if (!shopState.selectedEffect) return null;
  return SHOP_EFFECTS.find((e) => e.id === shopState.selectedEffect) ?? null;
}

export function getSelectedEffectClass(shopState: ShopState): string | null {
  const item = getSelectedEffectItem(shopState);
  return item?.effectClass ?? null;
}

export function getDisplayTitle(shopState: ShopState, heroTitle: string): string {
  if (!shopState.selectedTitle) return heroTitle;
  return shopState.selectedTitle;
}
