import { getMonsterCardById } from "./cards";

export type ShopState = {
  selectedTitle: string | null;
  selectedBackground: string | null;
  selectedMonsterCardId: string | null;
};

const DEFAULT_SHOP_STATE: ShopState = {
  selectedTitle: null,
  selectedBackground: null,
  selectedMonsterCardId: null,
};

export function loadShopState(): ShopState {
  if (typeof window === "undefined") return { ...DEFAULT_SHOP_STATE };
  try {
    const raw = localStorage.getItem("shopState");
    if (!raw) return { ...DEFAULT_SHOP_STATE };
    const parsed = JSON.parse(raw) as Partial<ShopState>;
    return {
      selectedTitle: typeof parsed.selectedTitle === "string" ? parsed.selectedTitle : null,
      selectedBackground: typeof parsed.selectedBackground === "string" ? parsed.selectedBackground : null,
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

export function getSelectedMonsterCard(shopState: ShopState) {
  if (!shopState.selectedMonsterCardId) return null;
  return getMonsterCardById(shopState.selectedMonsterCardId) ?? null;
}

export function getDisplayTitle(shopState: ShopState, heroTitle: string): string {
  if (!shopState.selectedTitle) return heroTitle;
  return shopState.selectedTitle;
}

// =============================================================
// EQUIPMENT SHOP — 装備システム (将来 /quiz バトルへ反映予定)
// =============================================================

export type EquipCategory = "weapon" | "shield" | "armor" | "helmet" | "accessory";

export type EquipEffects = {
  attack?: number;
  hp?: number;
  damageReduction?: number;
  criticalRate?: number;
  healBonus?: number;
  goldBonus?: number;
  expBonus?: number;
  partnerExpBonus?: number;
};

export type EquipItem = {
  id: string;
  name: string;
  category: EquipCategory;
  icon: string;
  description: string;
  price: number;
  effects: EquipEffects;
  recommendedFor: string;
};

export type EquipState = {
  ownedItems: string[];
  equippedItems: Record<EquipCategory, string | null>;
};

const DEFAULT_EQUIP_STATE: EquipState = {
  ownedItems: [],
  equippedItems: { weapon: null, shield: null, armor: null, helmet: null, accessory: null },
};

const EQUIP_PROGRESS_KEY = "eikenQuestFrontierProgress";

export function loadEquipState(): EquipState {
  if (typeof window === "undefined") return JSON.parse(JSON.stringify(DEFAULT_EQUIP_STATE));
  try {
    const raw = localStorage.getItem(EQUIP_PROGRESS_KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    const owned = Array.isArray(parsed.ownedItems) ? (parsed.ownedItems as string[]) : [];
    const eq = (parsed.equippedItems ?? {}) as Record<string, unknown>;
    return {
      ownedItems: owned,
      equippedItems: {
        weapon:    typeof eq.weapon    === "string" ? eq.weapon    : null,
        shield:    typeof eq.shield    === "string" ? eq.shield    : null,
        armor:     typeof eq.armor     === "string" ? eq.armor     : null,
        helmet:    typeof eq.helmet    === "string" ? eq.helmet    : null,
        accessory: typeof eq.accessory === "string" ? eq.accessory : null,
      },
    };
  } catch {
    return JSON.parse(JSON.stringify(DEFAULT_EQUIP_STATE));
  }
}

export function saveEquipState(state: EquipState): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(EQUIP_PROGRESS_KEY);
    const existing = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    localStorage.setItem(EQUIP_PROGRESS_KEY, JSON.stringify({
      ...existing,
      ownedItems: state.ownedItems,
      equippedItems: state.equippedItems,
    }));
  } catch { /* ignore */ }
}

export function calcTotalEffects(state: EquipState): EquipEffects {
  const t = { attack: 0, hp: 0, damageReduction: 0, criticalRate: 0, healBonus: 0, goldBonus: 0, expBonus: 0, partnerExpBonus: 0 };
  for (const itemId of Object.values(state.equippedItems)) {
    if (!itemId) continue;
    const item = EQUIP_ITEMS.find(i => i.id === itemId);
    if (!item) continue;
    for (const [k, v] of Object.entries(item.effects) as [keyof typeof t, number][]) {
      t[k] += v;
    }
  }
  return Object.fromEntries(Object.entries(t).filter(([, v]) => v > 0));
}

export const EQUIP_ITEMS: EquipItem[] = [
  // 武器
  { id: "wood_sword",         name: "木の剣",         category: "weapon", icon: "🪵",  price: 500,   description: "初心者でも扱いやすい、軽い木の剣。",             effects: { attack: 6 },                    recommendedFor: "最初の強化" },
  { id: "traveler_sword",     name: "旅人の剣",       category: "weapon", icon: "🗡️",  price: 900,   description: "旅を始めた勇者にぴったりの剣。",                 effects: { attack: 10 },                   recommendedFor: "序盤のボス対策" },
  { id: "wind_dagger",        name: "風切りの短剣",   category: "weapon", icon: "🌪️",  price: 1500,  description: "風のように素早く切りこむ短剣。",                 effects: { attack: 12, criticalRate: 1 },  recommendedFor: "早く倒したい人向け" },
  { id: "iron_sword",         name: "鉄の剣",         category: "weapon", icon: "⚔️",  price: 2400,  description: "しっかりした重みのある定番の剣。",               effects: { attack: 18 },                   recommendedFor: "通常クエスト安定" },
  { id: "flame_sword",        name: "炎の剣",         category: "weapon", icon: "🔥",  price: 3800,  description: "炎の力を宿した攻撃的な剣。",                     effects: { attack: 24 },                   recommendedFor: "ボスを早く倒したい人向け" },
  { id: "moon_rapier",        name: "月光のレイピア", category: "weapon", icon: "🌙",  price: 5500,  description: "月の光のように鋭く美しい細剣。",                 effects: { attack: 28, criticalRate: 2 },  recommendedFor: "連続正解が得意な人向け" },
  { id: "thunder_greatsword", name: "雷鳴の大剣",     category: "weapon", icon: "⚡",  price: 7800,  description: "雷のような一撃を放つ大剣。",                     effects: { attack: 38 },                   recommendedFor: "高HPボス対策" },
  { id: "star_reader_sword",  name: "星詠みの剣",     category: "weapon", icon: "⭐",  price: 10000, description: "星の導きで学びも戦いも支える剣。",               effects: { attack: 42, expBonus: 5 },      recommendedFor: "攻略と育成を両立" },
  { id: "hero_holy_sword",    name: "勇者の聖剣",     category: "weapon", icon: "✨",  price: 15000, description: "真の勇者にふさわしい光の聖剣。",                 effects: { attack: 55, criticalRate: 3 },  recommendedFor: "終盤・完全制覇向け" },
  // 盾
  { id: "wood_shield",         name: "木の盾",       category: "shield", icon: "🌿", price: 500,   description: "軽くて扱いやすい木の盾。",                       effects: { damageReduction: 3 },                    recommendedFor: "ミスが不安な人向け" },
  { id: "traveler_shield",     name: "旅人の盾",     category: "shield", icon: "🧭", price: 900,   description: "旅の安全を守る小さな盾。",                       effects: { hp: 20, damageReduction: 3 },            recommendedFor: "序盤の安定" },
  { id: "iron_shield",         name: "鉄の盾",       category: "shield", icon: "🛡️", price: 1800,  description: "しっかり守れる定番の盾。",                       effects: { damageReduction: 6 },                    recommendedFor: "通常クエスト安定" },
  { id: "guard_shield",        name: "まもりの盾",   category: "shield", icon: "🔒", price: 2800,  description: "守りを重視した安心感のある盾。",                 effects: { hp: 35, damageReduction: 6 },            recommendedFor: "ミスが多い人向け" },
  { id: "water_mirror_shield", name: "水鏡の盾",     category: "shield", icon: "💧", price: 4200,  description: "水面のように攻撃を受け流す盾。",                 effects: { damageReduction: 8, healBonus: 1 },      recommendedFor: "長期戦向け" },
  { id: "moon_shadow_shield",  name: "月影の盾",     category: "shield", icon: "🌕", price: 5800,  description: "月影の力で身を守る静かな盾。",                   effects: { hp: 50, damageReduction: 9 },            recommendedFor: "ボス戦向け" },
  { id: "thunder_guard_shield",name: "雷よけの盾",   category: "shield", icon: "🌩️", price: 7500,  description: "強い衝撃にも耐える守りの盾。",                   effects: { damageReduction: 11 },                   recommendedFor: "高難易度対策" },
  { id: "star_guard_shield",   name: "星守りの盾",   category: "shield", icon: "🌠", price: 10000, description: "星の加護で勇者を守る盾。",                       effects: { hp: 70, damageReduction: 12 },           recommendedFor: "complete向け" },
  { id: "holy_great_shield",   name: "聖なる大盾",   category: "shield", icon: "🕊️", price: 14000, description: "強敵の一撃にも耐える大きな聖盾。",               effects: { hp: 90, damageReduction: 15 },           recommendedFor: "終盤の安定装備" },
  // よろい
  { id: "cloth_armor",       name: "布のよろい",     category: "armor", icon: "🧵", price: 500,   description: "動きやすさを重視した軽いよろい。",               effects: { hp: 25 },                       recommendedFor: "最初のHP強化" },
  { id: "leather_armor",     name: "皮のよろい",     category: "armor", icon: "🐾", price: 1000,  description: "序盤の冒険に向いた丈夫なよろい。",               effects: { hp: 40 },                       recommendedFor: "序盤安定" },
  { id: "traveler_coat",     name: "旅人のコート",   category: "armor", icon: "🧥", price: 1800,  description: "旅をしながら学ぶ人のためのコート。",             effects: { hp: 50, expBonus: 3 },          recommendedFor: "育成しながら進めたい人向け" },
  { id: "iron_armor",        name: "鉄のよろい",     category: "armor", icon: "⚙️", price: 2800,  description: "守りをしっかり固める鉄のよろい。",               effects: { hp: 75 },                       recommendedFor: "通常クエスト安定" },
  { id: "flame_guard_armor", name: "炎よけのよろい", category: "armor", icon: "🦺", price: 4200,  description: "熱い戦いにも耐えられるよろい。",                 effects: { hp: 90, damageReduction: 3 },   recommendedFor: "ボス戦向け" },
  { id: "water_robe",        name: "水のローブ",     category: "armor", icon: "🌊", price: 5800,  description: "水の力で体力を保ちやすくするローブ。",           effects: { hp: 100, healBonus: 1 },        recommendedFor: "長期戦向け" },
  { id: "moonlight_armor",   name: "月光のよろい",   category: "armor", icon: "🌛", price: 7800,  description: "月の光に守られた美しいよろい。",                 effects: { hp: 130 },                      recommendedFor: "complete向け" },
  { id: "star_guide_robe",   name: "星導のローブ",   category: "armor", icon: "🌌", price: 10500, description: "星の導きで学びを助けるローブ。",                 effects: { hp: 145, expBonus: 5 },         recommendedFor: "育成と耐久を両立" },
  { id: "hero_armor",        name: "勇者のよろい",   category: "armor", icon: "🔱", price: 15000, description: "勇者のために作られた最高級のよろい。",           effects: { hp: 180, damageReduction: 5 },  recommendedFor: "終盤の主力装備" },
  // かぶと
  { id: "leather_cap",       name: "皮のぼうし",       category: "helmet", icon: "🎩", price: 500,   description: "軽くてかぶりやすい基本のぼうし。",               effects: { hp: 10, healBonus: 1 },                    recommendedFor: "序盤の安定" },
  { id: "traveler_bandana",  name: "旅人のバンダナ",   category: "helmet", icon: "🎀", price: 900,   description: "冒険心を高める旅人のバンダナ。",                 effects: { criticalRate: 1 },                         recommendedFor: "攻撃寄り" },
  { id: "iron_helmet",       name: "鉄のかぶと",       category: "helmet", icon: "🪖", price: 1800,  description: "頭をしっかり守る鉄のかぶと。",                   effects: { hp: 25 },                                  recommendedFor: "通常クエスト向け" },
  { id: "focus_headband",    name: "集中のはちまき",   category: "helmet", icon: "🏅", price: 2800,  description: "集中力を高めて会心の一撃を狙うはちまき。",       effects: { criticalRate: 2 },                         recommendedFor: "連続正解が得意な人向け" },
  { id: "guard_helmet",      name: "まもりのかぶと",   category: "helmet", icon: "🔰", price: 4000,  description: "守りと回復を助ける安定型のかぶと。",             effects: { hp: 40, healBonus: 1 },                    recommendedFor: "ミス対策" },
  { id: "moon_reader_hood",  name: "月読みのフード",   category: "helmet", icon: "🌒", price: 5500,  description: "月の流れを読み、学びを助けるフード。",           effects: { criticalRate: 2, expBonus: 3 },            recommendedFor: "育成向け" },
  { id: "star_helmet",       name: "星のかぶと",       category: "helmet", icon: "💫", price: 7500,  description: "星の力で勇者を支えるかぶと。",                   effects: { hp: 55, criticalRate: 2 },                 recommendedFor: "ボス戦向け" },
  { id: "sage_hood",         name: "賢者のフード",     category: "helmet", icon: "🧿", price: 10000, description: "知恵と回復力を高める賢者のフード。",             effects: { healBonus: 3, expBonus: 5 },               recommendedFor: "complete向け" },
  { id: "hero_helmet",       name: "勇者のかぶと",     category: "helmet", icon: "🔱", price: 14000, description: "攻守のバランスに優れた勇者のかぶと。",           effects: { hp: 75, criticalRate: 3, healBonus: 2 },   recommendedFor: "終盤の万能装備" },
  // アクセサリー
  { id: "traveler_charm",   name: "旅人のお守り",   category: "accessory", icon: "🍀", price: 500,   description: "旅の幸運を少しだけ高めるお守り。",               effects: { goldBonus: 5 },                              recommendedFor: "金策の最初" },
  { id: "small_star_charm", name: "小さな星飾り",   category: "accessory", icon: "🔯", price: 900,   description: "学びの成長をそっと助ける星飾り。",               effects: { expBonus: 5 },                               recommendedFor: "主人公育成向け" },
  { id: "partner_bell",     name: "相棒のすず",     category: "accessory", icon: "🔔", price: 1500,  description: "相棒との絆を深める小さなすず。",                 effects: { partnerExpBonus: 10 },                       recommendedFor: "相棒育成向け" },
  { id: "lucky_ring",       name: "幸運のリング",   category: "accessory", icon: "💍", price: 2800,  description: "クエスト報酬を少し増やす幸運のリング。",         effects: { goldBonus: 10 },                             recommendedFor: "金策向け" },
  { id: "learning_pendant", name: "学びのペンダント",category: "accessory", icon: "📘", price: 4000, description: "英語の学びを後押しするペンダント。",             effects: { expBonus: 10 },                              recommendedFor: "レベル上げ向け" },
  { id: "bond_brooch",      name: "絆のブローチ",   category: "accessory", icon: "🔷", price: 5500,  description: "相棒との成長を助けるブローチ。",                 effects: { partnerExpBonus: 20 },                       recommendedFor: "相棒を育てたい人向け" },
  { id: "golden_coin",      name: "金色のコイン",   category: "accessory", icon: "🪙", price: 7500,  description: "周回するほど効果を感じる金色のコイン。",         effects: { goldBonus: 15, expBonus: 5 },                recommendedFor: "周回向け" },
  { id: "star_guide_mark",  name: "星導のしるし",   category: "accessory", icon: "🌟", price: 10000, description: "星の導きで成長を早めるしるし。",                 effects: { expBonus: 15, partnerExpBonus: 20 },         recommendedFor: "育成特化" },
  { id: "courage_orb",      name: "勇気のオーブ",   category: "accessory", icon: "🔮", price: 15000, description: "勇気と成長を引き出す特別なオーブ。",             effects: { goldBonus: 20, expBonus: 15, partnerExpBonus: 30 }, recommendedFor: "終盤の育成装備" },
];
