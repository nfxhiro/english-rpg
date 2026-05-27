export type Rarity = "N" | "R" | "SR" | "SSR" | "UR" | "SAR";

export type MainAttribute = "fire" | "water" | "forest" | "light" | "dark";

export type CardStatus = "未獲得" | "獲得済み" | "成長中" | "マスター";

export type MonsterCard = {
  id: string;
  no: string;
  name: string;
  title: string;
  rarity: Rarity;
  attribute: MainAttribute;
  emoji: string;
  species: string;
  monsterEmoji: string;
  description: string;
};

export type EarnedCard = {
  cardId: string;
  correctCount: number;
  exp: number;
  obtainedAt: string;
  ownedCount?: number;
};

export type GachaRarityRate = {
  rarity: Rarity;
  rate: number;
};

export const gachaRarityRates: GachaRarityRate[] = [
  { rarity: "N", rate: 65.0 },
  { rarity: "R", rate: 22.0 },
  { rarity: "SR", rate: 9.5 },
  { rarity: "SSR", rate: 2.7 },
  { rarity: "UR", rate: 0.5 },
  { rarity: "SAR", rate: 0.3 },
];

export const allAttributes: MainAttribute[] = ["fire", "water", "forest", "light", "dark"];

export const attributeEmojiMap: Record<MainAttribute, string> = {
  fire: "🔥",
  water: "💧",
  forest: "🌿",
  light: "✨",
  dark: "🌙",
};

export const attributeLabelMap: Record<MainAttribute, string> = {
  fire: "火",
  water: "水",
  forest: "森",
  light: "光",
  dark: "闇",
};

export function getAttributeLabel(attribute: MainAttribute): string {
  return attributeLabelMap[attribute];
}

export function getAttributeColor(attribute: string): string {
  const colors: Record<MainAttribute, string> = {
    fire: "#ef4444",
    water: "#3b82f6",
    forest: "#22c55e",
    light: "#fde68a",
    dark: "#7c3aed",
  };

  return colors[attribute as MainAttribute] ?? "#94a3b8";
}

function getMainAttributeEmoji(attribute: MainAttribute): string {
  return attributeEmojiMap[attribute];
}

type CardSeed = {
  name: string;
  species: string;
  monsterEmoji: string;
  feature: string;
};

type AttributeBlock = {
  attribute: MainAttribute;
  startNo: number;
  sar: CardSeed;
  prefixes: string[];
  featureThemes: string[];
  species: readonly { species: string; emoji: string }[];
};

const titlePrefixByRarity: Record<Rarity, string> = {
  SAR: "特別な",
  UR: "究極の",
  SSR: "伝説の",
  SR: "覚醒",
  R: "成長",
  N: "見習い",
};

const rarityDescriptionByRarity: Record<Rarity, string> = {
  SAR: "特別な輝きをまとった、図鑑の中でもひときわ目を引くスペシャルアートレアです。",
  UR: "虹色のオーラをまとった、図鑑でもめったに見られない究極レアです。",
  SSR: "強い光をまとった、冒険者があこがれる伝説級のカードです。",
  SR: "目立つ力を秘めた、バトルで頼りになる上級カードです。",
  R: "個性が光る、育てるほど活躍の場が広がるレアカードです。",
  N: "親しみやすく、冒険のはじめから一緒に成長できるカードです。",
};

function getTitleByRarity(name: string, rarity: Rarity): string {
  return `${titlePrefixByRarity[rarity]}${name}`;
}

function getRarityByBlockIndex(index: number): Rarity {
  if (index === 0) return "SAR";
  if (index === 1) return "UR";
  if (index <= 3) return "SSR";
  if (index <= 11) return "SR";
  if (index <= 29) return "R";
  return "N";
}

function getDescription(card: Omit<MonsterCard, "description">, feature: string): string {
  return `${card.name}は${getAttributeLabel(card.attribute)}属性の${card.species}モンスター。${feature} ${rarityDescriptionByRarity[card.rarity]}`;
}

// 火属性 — SAR:ブレイズドラゴン🐉
// UR[0]→生物Top / SSR[1-2] / SR[3-10] / R[11-28] / N[29-58]
const fireSpecies: { species: string; emoji: string }[] = [
  // UR
  { species: "ライオン",       emoji: "🦁" },
  // SSR
  { species: "タイガー",       emoji: "🐯" },
  { species: "フォックス",     emoji: "🦊" },
  // SR
  { species: "ウィング",       emoji: "🪽" },
  { species: "ホース",         emoji: "🐴" },
  { species: "バイソン",       emoji: "🦬" },
  { species: "ブル",           emoji: "🐂" },
  { species: "ボア",           emoji: "🐗" },
  { species: "ライノ",         emoji: "🦏" },
  { species: "レックス",       emoji: "🦖" },
  { species: "ドレイク",       emoji: "🐲" },
  // R
  { species: "クロコダイル",   emoji: "🐊" },
  { species: "カメレオン",     emoji: "🦎" },
  { species: "サーペント",     emoji: "🐍" },
  { species: "スコーピオン",   emoji: "🦂" },
  { species: "ルースター",     emoji: "🐓" },
  { species: "ターキー",       emoji: "🦃" },
  { species: "ヒヨコ",         emoji: "🐥" },
  { species: "ドードー",       emoji: "🦤" },
  { species: "ボルケーノ",     emoji: "🌋" },
  { species: "コメット",       emoji: "☄️" },
  { species: "スパーク",       emoji: "⚡" },
  { species: "フレア",         emoji: "🔥" },
  { species: "ヒートスピリット", emoji: "♨️" },
  { species: "キャンドル",     emoji: "🕯️" },
  { species: "ランタン",       emoji: "🏮" },
  { species: "トライデント",   emoji: "🔱" },
  { species: "アックス",       emoji: "🪓" },
  // N
  { species: "ドローン",       emoji: "🛸" },
  { species: "ボム",           emoji: "🧨" },
  { species: "ロケット",       emoji: "🚀" },
  { species: "ブラスト",       emoji: "💥" },
  { species: "バイク",         emoji: "🏍️" },
  { species: "アーチャー",     emoji: "🏹" },
  { species: "トレイン",       emoji: "🚂" },
  { species: "シールド",       emoji: "🔰" },
  { species: "レーサー",       emoji: "🏎️" },
  { species: "マグネット",     emoji: "🧲" },
  { species: "ロボット",       emoji: "🤖" },
  { species: "ギア",           emoji: "⚙️" },
  { species: "ブリック",       emoji: "🧱" },
  { species: "ドラム",         emoji: "🪘" },
  { species: "ロック",         emoji: "🪨" },
  { species: "ホルン",         emoji: "📯" },
  { species: "メガホン",       emoji: "📣" },
  { species: "ソード",         emoji: "⚔️" },
  { species: "バスケット",     emoji: "🏀" },
  { species: "ピッケル",       emoji: "⛏️" },
  { species: "サッカー",       emoji: "⚽" },
  { species: "レンチ",         emoji: "🔧" },
  { species: "グローブ",       emoji: "🥊" },
  { species: "ボルト",         emoji: "🔩" },
  { species: "ロゼット",       emoji: "🏵️" },
  { species: "ソー",           emoji: "🪚" },
  { species: "チリ",           emoji: "🌶️" },
  { species: "クレーン",       emoji: "🏗️" },
  { species: "バーベキュー",   emoji: "🍖" },
  { species: "ファイアハート", emoji: "❤️‍🔥" },
  { species: "ジェット",       emoji: "✈️" },
];

// 水属性 — SAR:マリンホエール🐳
const waterSpecies: { species: string; emoji: string }[] = [
  // UR
  { species: "シャーク",           emoji: "🦈" },
  // SSR
  { species: "リヴァイア",         emoji: "🦕" },
  { species: "オクトパス",         emoji: "🐙" },
  // SR
  { species: "ドルフィン",         emoji: "🐬" },
  { species: "クジラ",             emoji: "🐋" },
  { species: "スクイッド",         emoji: "🦑" },
  { species: "クラブ",             emoji: "🦀" },
  { species: "シュリンプ",         emoji: "🦐" },
  { species: "ロブスター",         emoji: "🦞" },
  { species: "トロピカルフィッシュ", emoji: "🐠" },
  { species: "シール",             emoji: "🦭" },
  // R
  { species: "ブローフィッシュ",   emoji: "🐡" },
  { species: "ジェリー",           emoji: "🪼" },
  { species: "ペンギン",           emoji: "🐧" },
  { species: "タートル",           emoji: "🐢" },
  { species: "シェル",             emoji: "🐚" },
  { species: "コーラル",           emoji: "🪸" },
  { species: "オッター",           emoji: "🦦" },
  { species: "ヒッポ",             emoji: "🦛" },
  { species: "フラミンゴ",         emoji: "🦩" },
  { species: "ダック",             emoji: "🦆" },
  { species: "マーメイド",         emoji: "🫧" },
  { species: "グース",             emoji: "🪿" },
  { species: "フィッシュ",         emoji: "🐟" },
  { species: "パール",             emoji: "🦪" },
  { species: "ドロップ",           emoji: "💧" },
  { species: "スノー",             emoji: "❄️" },
  { species: "ウェーブ",           emoji: "🌊" },
  { species: "アイス",             emoji: "🧊" },
  // N
  { species: "クラウド",           emoji: "☁️" },
  { species: "カヌー",             emoji: "🛶" },
  { species: "アンブレラ",         emoji: "☔" },
  { species: "バブル",             emoji: "🫧" },
  { species: "スパイラル",         emoji: "🌀" },
  { species: "シップ",             emoji: "🚢" },
  { species: "ヨット",             emoji: "⛵" },
  { species: "アンカー",           emoji: "⚓" },
  { species: "ライフリング",       emoji: "🛟" },
  { species: "ウォーターポンプ",   emoji: "🚰" },
  { species: "フラスコ",           emoji: "🧪" },
  { species: "セル",               emoji: "🧫" },
  { species: "バケット",           emoji: "🪣" },
  { species: "ジュース",           emoji: "🧃" },
  { species: "ポット",             emoji: "🫗" },
  { species: "カップ",             emoji: "🥤" },
  { species: "シャワー",           emoji: "🚿" },
  { species: "バス",               emoji: "🛁" },
  { species: "ミルク",             emoji: "🍼" },
  { species: "ソープ",             emoji: "🧼" },
  { species: "ブラシ",             emoji: "🪥" },
  { species: "スプラッシュ",       emoji: "💦" },
  { species: "シェイブアイス",     emoji: "🍧" },
  { species: "アイスクリーム",     emoji: "🍦" },
  { species: "ティーカップ",       emoji: "🍵" },
  { species: "スノーマン",         emoji: "☃️" },
  { species: "コーヒー",           emoji: "☕" },
  { species: "ワイン",             emoji: "🍷" },
  { species: "ビール",             emoji: "🍺" },
  { species: "シャンパン",         emoji: "🥂" },
];

// 森属性 — SAR:セレスウィング🦅
const forestSpecies: { species: string; emoji: string }[] = [
  // UR
  { species: "ベア",           emoji: "🐻" },
  // SSR
  { species: "ディア",         emoji: "🦌" },
  { species: "ラビット",       emoji: "🐰" },
  // SR
  { species: "スクイレル",     emoji: "🐿️" },
  { species: "ヘッジホッグ",   emoji: "🦔" },
  { species: "ラクーン",       emoji: "🦝" },
  { species: "ビーバー",       emoji: "🦫" },
  { species: "スロース",       emoji: "🦥" },
  { species: "オランウータン", emoji: "🦧" },
  { species: "フロッグ",       emoji: "🐸" },
  { species: "パンダ",         emoji: "🐼" },
  // R
  { species: "パロット",       emoji: "🦜" },
  { species: "ビー",           emoji: "🐝" },
  { species: "バタフライ",     emoji: "🦋" },
  { species: "ビートル",       emoji: "🪲" },
  { species: "レディバグ",     emoji: "🐞" },
  { species: "キャタピラー",   emoji: "🐛" },
  { species: "クリケット",     emoji: "🦗" },
  { species: "モスキート",     emoji: "🦟" },
  { species: "スネイル",       emoji: "🐌" },
  { species: "ヒナドリ",       emoji: "🐤" },
  { species: "アント",         emoji: "🐜" },
  { species: "タマゴバード",   emoji: "🐣" },
  { species: "ワーム",         emoji: "🪱" },
  { species: "フェザー",       emoji: "🪶" },
  { species: "ツリー",         emoji: "🌳" },
  { species: "リーフ",         emoji: "🌿" },
  { species: "パイン",         emoji: "🌲" },
  { species: "クローバー",     emoji: "🍀" },
  // N
  { species: "フォールリーフ", emoji: "🍂" },
  { species: "スプラウト",     emoji: "🌱" },
  { species: "グリーンリーフ", emoji: "🍃" },
  { species: "ライスプラント", emoji: "🌾" },
  { species: "メープル",       emoji: "🍁" },
  { species: "チューリップ",   emoji: "🌷" },
  { species: "マッシュルーム", emoji: "🍄" },
  { species: "ローズ",         emoji: "🌹" },
  { species: "ウッド",         emoji: "🪵" },
  { species: "サンフラワー",   emoji: "🌻" },
  { species: "ネスト",         emoji: "🪹" },
  { species: "ブロッサム",     emoji: "🌼" },
  { species: "エッグネスト",   emoji: "🪺" },
  { species: "ロータス",       emoji: "🪷" },
  { species: "アップル",       emoji: "🍎" },
  { species: "キャロット",     emoji: "🥕" },
  { species: "グリーンアップル", emoji: "🍏" },
  { species: "コーン",         emoji: "🌽" },
  { species: "ペアー",         emoji: "🍐" },
  { species: "ブロッコリー",   emoji: "🥦" },
  { species: "オレンジ",       emoji: "🍊" },
  { species: "レタス",         emoji: "🥬" },
  { species: "レモン",         emoji: "🍋" },
  { species: "キューカンバー", emoji: "🥒" },
  { species: "チェリー",       emoji: "🍒" },
  { species: "ビーンズ",       emoji: "🫘" },
  { species: "ピーチ",         emoji: "🍑" },
  { species: "ピーナッツ",     emoji: "🥜" },
  { species: "バスケット",     emoji: "🧺" },
  { species: "ハーブポット",   emoji: "🪴" },
];

// 光属性 — SAR:ルミナスユニコーン🦄
const lightSpecies: { species: string; emoji: string }[] = [
  // UR
  { species: "ピーコック",     emoji: "🦚" },
  // SSR
  { species: "ダブ",           emoji: "🕊️" },
  { species: "バタフライ",     emoji: "🦋" },
  // SR
  { species: "スワン",         emoji: "🦢" },
  { species: "エルフ",         emoji: "🌿" },
  { species: "オウル",         emoji: "🦉" },
  { species: "アミュレット",   emoji: "🪬" },
  { species: "クラウン",       emoji: "👑" },
  { species: "スター",         emoji: "⭐" },
  { species: "サン",           emoji: "☀️" },
  // R
  { species: "グロウスター",   emoji: "🌟" },
  { species: "レインボー",     emoji: "🌈" },
  { species: "スパークル",     emoji: "✨" },
  { species: "スピリット",     emoji: "💫" },
  { species: "スマイルサン",   emoji: "🌞" },
  { species: "クリスタル",     emoji: "💎" },
  { species: "ミラー",         emoji: "🪞" },
  { species: "ライトバルブ",   emoji: "💡" },
  { species: "ブライト",       emoji: "🔆" },
  { species: "スクロール",     emoji: "📜" },
  { species: "ペンシル",       emoji: "✏️" },
  { species: "ブック",         emoji: "📖" },
  { species: "ペン",           emoji: "🖊️" },
  { species: "ライブラリー",   emoji: "📚" },
  { species: "クレヨン",       emoji: "🖍️" },
  { species: "ノート",         emoji: "📒" },
  { species: "ブラシ",         emoji: "🖌️" },
  { species: "スコア",         emoji: "🎼" },
  // N
  { species: "ノートソング",   emoji: "🎵" },
  { species: "ピアノ",         emoji: "🎹" },
  { species: "バイオリン",     emoji: "🎻" },
  { species: "トランペット",   emoji: "🎺" },
  { species: "フルート",       emoji: "🪈" },
  { species: "マイク",         emoji: "🎤" },
  { species: "ヘッドフォン",   emoji: "🎧" },
  { species: "ギター",         emoji: "🎸" },
  { species: "メダル",         emoji: "🏅" },
  { species: "コンパス",       emoji: "🧭" },
  { species: "キー",           emoji: "🗝️" },
  { species: "ベル",           emoji: "🔔" },
  { species: "トロフィー",     emoji: "🏆" },
  { species: "ハンドベル",     emoji: "🛎️" },
  { species: "キャッスル",     emoji: "🏰" },
  { species: "リボンメダル",   emoji: "🎀" },
  { species: "チャペル",       emoji: "⛪" },
  { species: "リボン",         emoji: "🎗️" },
  { species: "テンプル",       emoji: "🏛️" },
  { species: "ゴールドメダル", emoji: "🌠" },
  { species: "スケール",       emoji: "⚖️" },
  { species: "ゴールドハート", emoji: "💛" },
  { species: "シルバーメダル", emoji: "🌬️" },
  { species: "ピニャータ",     emoji: "🪅" },
  { species: "ルーラー",       emoji: "📏" },
  { species: "ブロンズメダル", emoji: "🪙" },
  { species: "バッグ",         emoji: "🎒" },
  { species: "マップ",         emoji: "🗺️" },
  { species: "ランタン",       emoji: "🪔" },
  { species: "ホワイトハート", emoji: "🤍" },
  { species: "バルーン",       emoji: "🎈" },
];

// 闇属性 — SAR:ノクスファントム👻
const darkSpecies: { species: string; emoji: string }[] = [
  // UR
  { species: "ウルフ",         emoji: "🐺" },
  // SSR
  { species: "バット",         emoji: "🦇" },
  { species: "スパイダー",     emoji: "🕷️" },
  // SR
  { species: "キャット",       emoji: "🐈" },
  { species: "スカンク",       emoji: "🦨" },
  { species: "バジャー",       emoji: "🦡" },
  { species: "ラット",         emoji: "🐀" },
  { species: "ゴースト",       emoji: "🎃" },
  { species: "ローチ",         emoji: "🪳" },
  { species: "フライ",         emoji: "🪰" },
  { species: "ウイルス",       emoji: "🦠" },
  // R
  { species: "トロル",         emoji: "🪨" },
  { species: "ウィザード",     emoji: "📿" },
  { species: "スカル",         emoji: "💀" },
  { species: "デーモン",       emoji: "😈" },
  { species: "ムーン",         emoji: "🌙" },
  { species: "グレイブ",       emoji: "🪦" },
  { species: "ニュームーン",   emoji: "🌑" },
  { species: "ウェブ",         emoji: "🕸️" },
  { species: "クレセント",     emoji: "🌘" },
  { species: "ダガー",         emoji: "🗡️" },
  { species: "ダークムーン",   emoji: "🌚" },
  { species: "フラッシュライト", emoji: "🔦" },
  { species: "コフィン",       emoji: "⚰️" },
  { species: "バイオハザード", emoji: "☣️" },
  { species: "オーブ",         emoji: "🔮" },
  { species: "ワンド",         emoji: "🪄" },
  { species: "ポイズン",       emoji: "☠️" },
  { species: "ブラッド",       emoji: "🩸" },
  // N
  { species: "ダークジーン",   emoji: "🧬" },
  { species: "マスク",         emoji: "🎭" },
  { species: "ダイス",         emoji: "🎲" },
  { species: "チェス",         emoji: "♟️" },
  { species: "ジョーカー",     emoji: "🃏" },
  { species: "エイトボール",   emoji: "🎱" },
  { species: "ギャラクシー",   emoji: "🌌" },
  { species: "テディ",         emoji: "🧸" },
  { species: "ホール",         emoji: "🕳️" },
  { species: "モアイ",         emoji: "🗿" },
  { species: "チェーン",       emoji: "⛓️" },
  { species: "ロック",         emoji: "🔒" },
  { species: "キー",           emoji: "🔑" },
  { species: "ツールボックス", emoji: "🧰" },
  { species: "トラップ",       emoji: "🪤" },
  { species: "ドリーム",       emoji: "💤" },
  { species: "ナイフ",         emoji: "🔪" },
  { species: "サイレン",       emoji: "🚨" },
  { species: "ミラーボール",   emoji: "🪩" },
  { species: "ハンガー",       emoji: "🪝" },
  { species: "バクダン",       emoji: "💣" },
  { species: "フォグ",         emoji: "🌫️" },
  { species: "スモーク",       emoji: "💨" },
  { species: "ウォーニング",   emoji: "⚠️" },
  { species: "ブラックハート", emoji: "🖤" },
  { species: "インク",         emoji: "🖋️" },
  { species: "パープルハート", emoji: "💜" },
  { species: "リング",         emoji: "💍" },
  { species: "アナトミカルハート", emoji: "🫀" },
  { species: "ナザール",       emoji: "🧿" },
];

const blocks: AttributeBlock[] = [
  {
    attribute: "fire",
    startNo: 1,
    sar: {
      name: "ブレイズドラゴン",
      species: "ドラゴン",
      monsterEmoji: "🐉",
      feature: "燃える勇気をまとい、冒険のはじまりを照らす特別なカードです。",
    },
    prefixes: ["イグニス", "フレア", "バーニング", "ヒート", "レッド", "サン", "ボルケ", "スパーク", "ルビー", "キャンドル"],
    featureThemes: [
      "明るい炎で仲間の前を照らします。",
      "熱い心でピンチにも立ち向かいます。",
      "小さな火花を集めて大きな力にします。",
      "赤い光をまとって元気に走ります。",
      "あたたかな炎で仲間をはげまします。",
    ],
    species: fireSpecies,
  },
  {
    attribute: "water",
    startNo: 61,
    sar: {
      name: "マリンホエール",
      species: "ホエール",
      monsterEmoji: "🐳",
      feature: "深海に宿る巨大な鯨の力をまとい、仲間を守る特別なカードです。",
    },
    prefixes: ["アクア", "マリン", "ブルー", "ウェーブ", "コーラル", "リップル", "パール", "レイン", "スプラッシュ", "ラグーン"],
    featureThemes: [
      "きれいな水の輪で仲間を守ります。",
      "波のリズムに合わせてすばやく動きます。",
      "しずくを集めてやさしい力に変えます。",
      "青い光をまとって水辺を進みます。",
      "静かな流れでチームを落ち着かせます。",
    ],
    species: waterSpecies,
  },
  {
    attribute: "forest",
    startNo: 121,
    sar: {
      name: "セレスウィング",
      species: "天空鳥",
      monsterEmoji: "🦅",
      feature: "風と森の力をまとい、空から冒険を見守る特別なカードです。",
    },
    prefixes: ["リーフ", "グリーン", "セレス", "フォレスト", "ブルーム", "ミント", "クローバー", "ハーブ", "ウッド", "メープル"],
    featureThemes: [
      "若葉の力で仲間を元気にします。",
      "森の音を聞きながら静かに進みます。",
      "つるや葉っぱを使って道を作ります。",
      "花の香りでまわりを明るくします。",
      "大地に根をはるようにねばり強く戦います。",
    ],
    species: forestSpecies,
  },
  {
    attribute: "light",
    startNo: 181,
    sar: {
      name: "ルミナスユニコーン",
      species: "ユニコーン",
      monsterEmoji: "🦄",
      feature: "純白の光をまとう伝説の一角獣。仲間の魂を照らし守り続ける特別なカードです。",
    },
    prefixes: ["ルミナス", "シャイン", "ホーリー", "スター", "ミラー", "オーロラ", "プリズム", "サニー", "クリア", "ゴールド"],
    featureThemes: [
      "やさしい光で暗い道を明るくします。",
      "きらめく力で仲間の勇気をふやします。",
      "まっすぐな心でチームを守ります。",
      "星のような光を合図に進みます。",
      "白い光をまとい、落ち着いて戦います。",
    ],
    species: lightSpecies,
  },
  {
    attribute: "dark",
    startNo: 241,
    sar: {
      name: "ノクスファントム",
      species: "ファントム",
      monsterEmoji: "👻",
      feature: "夜の静けさをまとい、影から力を発揮する特別なカードです。",
    },
    prefixes: ["ノクス", "シャドウ", "ミッドナイト", "ムーン", "ブラック", "ナイト", "ダスク", "ミスト", "オニキス", "ファントム"],
    featureThemes: [
      "影にかくれてチャンスを待ちます。",
      "月明かりの下で静かに力をためます。",
      "夜の空気をまとってすばやく動きます。",
      "深い闇の中でも仲間を見つけます。",
      "しずかな集中力でバトルを支えます。",
    ],
    species: darkSpecies,
  },
];

function makeSeed(block: AttributeBlock, index: number): CardSeed {
  if (index === 0) return block.sar;

  const speciesEntry = block.species[(index - 1) % block.species.length];
  const prefix = block.prefixes[(index - 1) % block.prefixes.length];
  const cycle = Math.floor((index - 1) / block.prefixes.length);
  const suffix = ["", "ガード", "メイジ", "ランナー", "セージ", "ブレイブ"][cycle] ?? `ゼロ${cycle}`;
  const name = `${prefix}${speciesEntry.species}${suffix}`;
  const feature = block.featureThemes[(index - 1) % block.featureThemes.length];

  return {
    name,
    species: speciesEntry.species,
    monsterEmoji: speciesEntry.emoji,
    feature,
  };
}

function createMonsterCards(): MonsterCard[] {
  return blocks.flatMap((block) =>
    Array.from({ length: 60 }, (_, blockIndex) => {
      const noNumber = block.startNo + blockIndex;
      const no = String(noNumber).padStart(3, "0");
      const rarity = getRarityByBlockIndex(blockIndex);
      const seed = makeSeed(block, blockIndex);
      const cardWithoutDescription: Omit<MonsterCard, "description"> = {
        id: `monster-${no}`,
        no,
        name: seed.name,
        title: getTitleByRarity(seed.name, rarity),
        rarity,
        attribute: block.attribute,
        emoji: getMainAttributeEmoji(block.attribute),
        species: seed.species,
        monsterEmoji: seed.monsterEmoji,
      };

      return {
        ...cardWithoutDescription,
        description: getDescription(cardWithoutDescription, seed.feature),
      };
    }),
  );
}

export const monsterCards: MonsterCard[] = createMonsterCards();

export function getMonsterCardById(id: string): MonsterCard | undefined {
  return monsterCards.find((card) => card.id === id);
}

export function getCardsByRarity(rarity: Rarity): MonsterCard[] {
  return monsterCards.filter((card) => card.rarity === rarity);
}

export function getOwnedCount(earnedCard: EarnedCard | undefined): number {
  if (!earnedCard) return 0;

  return earnedCard.ownedCount ?? 1;
}

export function getStatus(
  card: MonsterCard,
  earnedCards: EarnedCard[] = []
): CardStatus {
  const earnedCard = earnedCards.find((earned) => earned.cardId === card.id);

  if (!earnedCard) {
    return "未獲得";
  }

  if (earnedCard.correctCount >= 10) {
    return "マスター";
  }

  if (earnedCard.correctCount >= 3) {
    return "成長中";
  }

  return "獲得済み";
}

export function getNextRarityExp(
  earnedCardOrExp: EarnedCard | number | undefined = 0
): number {
  const currentExp =
    typeof earnedCardOrExp === "number"
      ? earnedCardOrExp
      : earnedCardOrExp?.exp ?? 0;

  if (currentExp < 30) return 30;
  if (currentExp < 100) return 100;
  if (currentExp < 300) return 300;

  return 0;
}

function pickRandomCard(cards: MonsterCard[]): MonsterCard {
  const safeCards = cards.length > 0 ? cards : monsterCards;
  const randomIndex = Math.floor(Math.random() * safeCards.length);

  return safeCards[randomIndex];
}

function pickRandomCardFromRarity(rarity: Rarity): MonsterCard {
  return pickRandomCard(getCardsByRarity(rarity));
}

export function pickCardByRarity(): MonsterCard {
  const totalRate = gachaRarityRates.reduce((total, item) => total + item.rate, 0);
  const random = Math.random() * totalRate;
  let cumulativeRate = 0;

  for (const item of gachaRarityRates) {
    cumulativeRate += item.rate;

    if (random < cumulativeRate) {
      return pickRandomCardFromRarity(item.rarity);
    }
  }

  return pickRandomCardFromRarity(gachaRarityRates[gachaRarityRates.length - 1].rarity);
}

export function pickRareSlotCard(): MonsterCard {
  const random = Math.random();

  if (random < 0.003) return pickRandomCardFromRarity("SAR");
  if (random < 0.010) return pickRandomCardFromRarity("UR");
  if (random < 0.040) return pickRandomCardFromRarity("SSR");
  if (random < 0.220) return pickRandomCardFromRarity("SR");

  return pickRandomCardFromRarity("R");
}

export function createSinglePackCards(): MonsterCard[] {
  return [
    pickCardByRarity(),
    pickCardByRarity(),
    pickCardByRarity(),
    pickCardByRarity(),
    pickRareSlotCard(),
  ];
}

export function createTenPackCards(): MonsterCard[] {
  return Array.from({ length: 10 }, () => pickCardByRarity());
}

export const GOD_PACK_RATE = 0.003;

export function rollGodPack(): boolean {
  return Math.random() < GOD_PACK_RATE;
}

export function drawGodPackTopRarity(): Rarity {
  return Math.random() < 0.5 ? "SAR" : "UR";
}

export function drawGodPackBonusRarity(): Rarity {
  const random = Math.random();
  if (random < 0.75) return "SR";
  if (random < 0.95) return "SSR";
  if (random < 0.99) return "UR";
  return "SAR";
}

function shuffleCards(arr: MonsterCard[]): MonsterCard[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function createGodPackCards(): MonsterCard[] {
  const results: MonsterCard[] = [];

  results.push(pickRandomCardFromRarity(drawGodPackTopRarity()));
  results.push(pickRandomCardFromRarity("SSR"));
  results.push(pickRandomCardFromRarity("SSR"));

  for (let i = 0; i < 7; i++) {
    results.push(pickRandomCardFromRarity(drawGodPackBonusRarity()));
  }

  return shuffleCards(results);
}
