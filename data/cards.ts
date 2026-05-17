export type Rarity = "N" | "R" | "SR" | "SSR" | "UR";

export type MainAttribute = "火" | "水" | "森" | "光" | "闇";
export type SubAttribute = "火" | "水" | "氷" | "雷" | "森" | "土" | "風" | "光" | "闇" | "毒" | "鋼" | "海" | "星" | "月" | "夢" | "音";

export type CardStatus = "未獲得" | "獲得済み" | "成長中" | "マスター";

export type MonsterCard = {
  id: string;
  no: string;
  name: string;
  title: string;
  rarity: Rarity;
  attribute: MainAttribute;
  subAttribute?: SubAttribute;
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
  { rarity: "SSR", rate: 3.0 },
  { rarity: "UR", rate: 0.5 },
];

type MonsterTemplate = {
  name: string;
  species: string;
  monsterEmoji: string;
  attribute: SubAttribute;
  emoji: string;
};

export function normalizeAttribute(attribute: string): MainAttribute {
  if (attribute === "雷" || attribute === "鋼") return "火";
  if (attribute === "海" || attribute === "氷") return "水";
  if (attribute === "土" || attribute === "風") return "森";
  if (attribute === "星" || attribute === "月" || attribute === "夢" || attribute === "音") return "光";
  if (attribute === "毒") return "闇";
  return attribute as MainAttribute;
}

export function getMainAttributeEmoji(attribute: MainAttribute): string {
  const map: Record<MainAttribute, string> = {
    火: "🔥", 水: "💧", 森: "🌿", 光: "✨", 闇: "🌙",
  };
  return map[attribute];
}

export function getAttributeAdvantage(
  attacker: MainAttribute,
  defender: MainAttribute,
): "strong" | "weak" | "normal" {
  if (attacker === "火" && defender === "森") return "strong";
  if (attacker === "森" && defender === "水") return "strong";
  if (attacker === "水" && defender === "火") return "strong";
  if (attacker === "森" && defender === "火") return "weak";
  if (attacker === "水" && defender === "森") return "weak";
  if (attacker === "火" && defender === "水") return "weak";
  if (attacker === "光" && defender === "闇") return "strong";
  if (attacker === "闇" && defender === "光") return "strong";
  return "normal";
}

const monsterTemplates: MonsterTemplate[] = [
  { name: "ブレイズドラゴン", species: "ドラゴン", monsterEmoji: "🐉", attribute: "火", emoji: "🔥" },
  { name: "ムーンユニコーン", species: "ユニコーン", monsterEmoji: "🦄", attribute: "水", emoji: "💧" },
  { name: "サンダーフェニックス", species: "フェニックス", monsterEmoji: "🦅", attribute: "森", emoji: "🌿" },
  { name: "シャドウウルフ", species: "ウルフ", monsterEmoji: "🐺", attribute: "闇", emoji: "🌙" },
  { name: "キングライオン", species: "ライオン", monsterEmoji: "🦁", attribute: "光", emoji: "✨" },
  { name: "フレイムタイガー", species: "タイガー", monsterEmoji: "🐯", attribute: "火", emoji: "🔥" },
  { name: "フォレストベア", species: "ベア", monsterEmoji: "🐻", attribute: "森", emoji: "🌿" },
  { name: "スノーパンダ", species: "パンダ", monsterEmoji: "🐼", attribute: "氷", emoji: "❄️" },
  { name: "スターFOX", species: "フォックス", monsterEmoji: "🦊", attribute: "星", emoji: "🌟" },
  { name: "ミスティキャット", species: "キャット", monsterEmoji: "🐱", attribute: "闇", emoji: "🌙" },
  { name: "ガーディアンドッグ", species: "ドッグ", monsterEmoji: "🐶", attribute: "土", emoji: "🌱" },
  { name: "ラビットランナー", species: "ラビット", monsterEmoji: "🐰", attribute: "風", emoji: "🌪️" },
  { name: "ハムスターソルジャー", species: "ハムスター", monsterEmoji: "🐹", attribute: "光", emoji: "✨" },
  { name: "マウスシーフ", species: "マウス", monsterEmoji: "🐭", attribute: "闇", emoji: "🌙" },
  { name: "コアラヒーラー", species: "コアラ", monsterEmoji: "🐨", attribute: "森", emoji: "🌿" },
  { name: "モンキーメイジ", species: "モンキー", monsterEmoji: "🐵", attribute: "夢", emoji: "💫" },
  { name: "チキンナイト", species: "チキン", monsterEmoji: "🐔", attribute: "土", emoji: "🌱" },
  { name: "アイスペンギン", species: "ペンギン", monsterEmoji: "🐧", attribute: "氷", emoji: "❄️" },
  { name: "ナイトオウル", species: "オウル", monsterEmoji: "🦉", attribute: "闇", emoji: "🌙" },
  { name: "ポイズンフロッグ", species: "フロッグ", monsterEmoji: "🐸", attribute: "毒", emoji: "☠️" },
  { name: "クロコウォリアー", species: "クロコダイル", monsterEmoji: "🐊", attribute: "水", emoji: "💧" },
  { name: "シェルタートル", species: "タートル", monsterEmoji: "🐢", attribute: "水", emoji: "💧" },
  { name: "サーペントロード", species: "サーペント", monsterEmoji: "🐍", attribute: "毒", emoji: "☠️" },
  { name: "ブルーホエール", species: "ホエール", monsterEmoji: "🐳", attribute: "海", emoji: "🌊" },
  { name: "ドルフィンセージ", species: "ドルフィン", monsterEmoji: "🐬", attribute: "水", emoji: "💧" },
  { name: "シャークバイター", species: "シャーク", monsterEmoji: "🦈", attribute: "海", emoji: "🌊" },
  { name: "オクトパスマジック", species: "オクトパス", monsterEmoji: "🐙", attribute: "夢", emoji: "💫" },
  { name: "スクイッドスカウト", species: "スクイッド", monsterEmoji: "🦑", attribute: "水", emoji: "💧" },
  { name: "クラブガード", species: "クラブ", monsterEmoji: "🦀", attribute: "鋼", emoji: "⚙️" },
  { name: "シュリンプダンサー", species: "シュリンプ", monsterEmoji: "🦐", attribute: "音", emoji: "🎵" },
  { name: "バタフライフェアリー", species: "バタフライ", monsterEmoji: "🦋", attribute: "風", emoji: "🌪️" },
  { name: "ハニービー", species: "ビー", monsterEmoji: "🐝", attribute: "森", emoji: "🌿" },
  { name: "レディバグレンジャー", species: "レディバグ", monsterEmoji: "🐞", attribute: "火", emoji: "🔥" },
  { name: "スコーピオンアサシン", species: "スコーピオン", monsterEmoji: "🦂", attribute: "毒", emoji: "☠️" },
  { name: "スパイダーウィーバー", species: "スパイダー", monsterEmoji: "🕷️", attribute: "闇", emoji: "🌙" },
  { name: "ゴーストメイジ", species: "ゴースト", monsterEmoji: "👻", attribute: "闇", emoji: "🌙" },
  { name: "ロボットガーディアン", species: "ロボット", monsterEmoji: "🤖", attribute: "鋼", emoji: "⚙️" },
  { name: "エイリアンスター", species: "エイリアン", monsterEmoji: "👽", attribute: "闇", emoji: "🌙" },
  { name: "レッドオーガ", species: "オーガ", monsterEmoji: "👹", attribute: "火", emoji: "🔥" },
  { name: "デーモンロード", species: "デーモン", monsterEmoji: "👺", attribute: "闇", emoji: "🌙" },
  { name: "スカルナイト", species: "スカル", monsterEmoji: "💀", attribute: "毒", emoji: "☠️" },
  { name: "パンプキンジャック", species: "ジャックランタン", monsterEmoji: "🎃", attribute: "火", emoji: "🔥" },
  { name: "ウィザードアーク", species: "ウィザード", monsterEmoji: "🧙‍♂️", attribute: "闇", emoji: "🌙" },
  { name: "フェアリーライト", species: "フェアリー", monsterEmoji: "🧚", attribute: "光", emoji: "✨" },
  { name: "マーメイドソング", species: "マーメイド", monsterEmoji: "🧜‍♀️", attribute: "水", emoji: "💧" },
  { name: "シールドナイト", species: "ナイト", monsterEmoji: "🛡️", attribute: "鋼", emoji: "⚙️" },
  { name: "ソードブレイバー", species: "ソードマン", monsterEmoji: "⚔️", attribute: "火", emoji: "🔥" },
  { name: "クラウンキング", species: "クラウン", monsterEmoji: "👑", attribute: "光", emoji: "✨" },
  { name: "スターコメット", species: "スター", monsterEmoji: "⭐", attribute: "火", emoji: "🔥" },
  { name: "メテオコメット", species: "コメット", monsterEmoji: "☄️", attribute: "火", emoji: "🔥" },
  { name: "ムーンシャドウ", species: "ムーン", monsterEmoji: "🌙", attribute: "闇", emoji: "🌙" },
  { name: "サンブレイズ", species: "サン", monsterEmoji: "☀️", attribute: "光", emoji: "✨" },
  { name: "ファイアスピリット", species: "ファイア", monsterEmoji: "🔥", attribute: "火", emoji: "🔥" },
  { name: "ウォータースピリット", species: "ウォーター", monsterEmoji: "💧", attribute: "水", emoji: "💧" },
  { name: "スノースピリット", species: "スノー", monsterEmoji: "❄️", attribute: "氷", emoji: "❄️" },
  { name: "サンダースピリット", species: "サンダー", monsterEmoji: "⚡", attribute: "雷", emoji: "⚡" },
  { name: "リーフスピリット", species: "リーフ", monsterEmoji: "🍃", attribute: "森", emoji: "🌿" },
  { name: "ツリーガーディアン", species: "ツリー", monsterEmoji: "🌳", attribute: "森", emoji: "🌿" },
  { name: "マッシュルームメイジ", species: "マッシュルーム", monsterEmoji: "🍄", attribute: "毒", emoji: "☠️" },
  { name: "クリスタルオラクル", species: "クリスタル", monsterEmoji: "🔮", attribute: "水", emoji: "💧" },
  { name: "ジェムドラゴン", species: "ジェム", monsterEmoji: "💎", attribute: "光", emoji: "✨" },
  { name: "キーキーパー", species: "キー", monsterEmoji: "🗝️", attribute: "鋼", emoji: "⚙️" },
  { name: "ボムゴーレム", species: "ボム", monsterEmoji: "💣", attribute: "火", emoji: "🔥" },
  { name: "ポーションスライム", species: "ポーション", monsterEmoji: "🧪", attribute: "水", emoji: "💧" },
  { name: "スクロールセージ", species: "スクロール", monsterEmoji: "📜", attribute: "水", emoji: "💧" },
  { name: "ブックソーサラー", species: "ブック", monsterEmoji: "📘", attribute: "星", emoji: "🌟" },
  { name: "チェストミミック", species: "チェスト", monsterEmoji: "🧰", attribute: "闇", emoji: "🌙" },
  { name: "ギフトミミック", species: "ギフト", monsterEmoji: "🎁", attribute: "闇", emoji: "🌙" },
  { name: "ベルフェアリー", species: "ベル", monsterEmoji: "🔔", attribute: "音", emoji: "🎵" },
  { name: "アンカークラブ", species: "アンカー", monsterEmoji: "⚓", attribute: "海", emoji: "🌊" },
  { name: "ロケットスター", species: "ロケット", monsterEmoji: "🚀", attribute: "火", emoji: "🔥" },
  { name: "UFOミステリー", species: "UFO", monsterEmoji: "🛸", attribute: "闇", emoji: "🌙" },
  { name: "キャッスルガーディアン", species: "キャッスル", monsterEmoji: "🏰", attribute: "土", emoji: "🌱" },
  { name: "テントレンジャー", species: "テント", monsterEmoji: "⛺", attribute: "火", emoji: "🔥" },
  { name: "マウンテンゴーレム", species: "マウンテン", monsterEmoji: "⛰️", attribute: "土", emoji: "🌱" },
  { name: "ボルケーノロード", species: "ボルケーノ", monsterEmoji: "🌋", attribute: "火", emoji: "🔥" },
  { name: "レインボードラゴン", species: "レインボー", monsterEmoji: "🌈", attribute: "光", emoji: "✨" },
  { name: "クラウドシープ", species: "クラウド", monsterEmoji: "☁️", attribute: "水", emoji: "💧" },
  { name: "トルネードホーク", species: "トルネード", monsterEmoji: "🌪️", attribute: "風", emoji: "🌪️" },
  { name: "ウェーブサーペント", species: "ウェーブ", monsterEmoji: "🌊", attribute: "海", emoji: "🌊" },
  { name: "ウェーブスプライト", species: "ウェーブ", monsterEmoji: "🌊", attribute: "水", emoji: "💧" },
  { name: "ギタービースト", species: "ギター", monsterEmoji: "🎸", attribute: "火", emoji: "🔥" },
  { name: "ドラムゴーレム", species: "ドラム", monsterEmoji: "🥁", attribute: "音", emoji: "🎵" },
  { name: "トロフィーチャンピオン", species: "トロフィー", monsterEmoji: "🏆", attribute: "光", emoji: "✨" },
  { name: "メダルウォリアー", species: "メダル", monsterEmoji: "🏅", attribute: "鋼", emoji: "⚙️" },
  { name: "ダイスゴブリン", species: "ダイス", monsterEmoji: "🎲", attribute: "闇", emoji: "🌙" },
  { name: "パズルスライム", species: "パズル", monsterEmoji: "🧩", attribute: "水", emoji: "💧" },
  { name: "コンパスレンジャー", species: "コンパス", monsterEmoji: "🧭", attribute: "水", emoji: "💧" },
  { name: "ランタンゴースト", species: "ランタン", monsterEmoji: "🏮", attribute: "闇", emoji: "🌙" },
  { name: "キャンドルメイジ", species: "キャンドル", monsterEmoji: "🕯️", attribute: "火", emoji: "🔥" },
  { name: "ミラーフェアリー", species: "ミラー", monsterEmoji: "🪞", attribute: "光", emoji: "✨" },
  { name: "マグネットロボ", species: "マグネット", monsterEmoji: "🧲", attribute: "鋼", emoji: "⚙️" },
  { name: "ギアナイト", species: "ギア", monsterEmoji: "⚙️", attribute: "鋼", emoji: "⚙️" },
  { name: "ハートヒーラー", species: "ハート", monsterEmoji: "❤️", attribute: "光", emoji: "✨" },
  { name: "スパークフェアリー", species: "スパーク", monsterEmoji: "✨", attribute: "火", emoji: "🔥" },
  { name: "ミストファントム", species: "ミスト", monsterEmoji: "🌫️", attribute: "闇", emoji: "🌙" },
  { name: "シードスプラウト", species: "シード", monsterEmoji: "🌱", attribute: "森", emoji: "🌿" },
  { name: "ローズクイーン", species: "ローズ", monsterEmoji: "🌹", attribute: "森", emoji: "🌿" },
  { name: "サクラフェアリー", species: "サクラ", monsterEmoji: "🌸", attribute: "光", emoji: "✨" },
  { name: "メープルガーディアン", species: "メープル", monsterEmoji: "🍁", attribute: "森", emoji: "🌿" },
  { name: "シェルナイト", species: "シェル", monsterEmoji: "🐚", attribute: "海", emoji: "🌊" },
  { name: "パールマーメイド", species: "パール", monsterEmoji: "🦪", attribute: "海", emoji: "🌊" },
  { name: "クローバーラビット", species: "クローバー", monsterEmoji: "☘️", attribute: "森", emoji: "🌿" },
  { name: "ダイヤゴーレム", species: "ダイヤ", monsterEmoji: "♦️", attribute: "鋼", emoji: "⚙️" },
  { name: "スペードナイト", species: "スペード", monsterEmoji: "♠️", attribute: "闇", emoji: "🌙" },

  // 追加分：106〜120。名前・種族・絵文字が既存カードと被らないように追加。
  { name: "ジュラシックレックス", species: "レックス", monsterEmoji: "🦖", attribute: "土", emoji: "🌱" },
  { name: "グランドサウルス", species: "サウルス", monsterEmoji: "🦕", attribute: "森", emoji: "🌿" },
  { name: "ブラッドバット", species: "バット", monsterEmoji: "🦇", attribute: "闇", emoji: "🌙" },
  { name: "ニードルヘッジ", species: "ヘッジホッグ", monsterEmoji: "🦔", attribute: "鋼", emoji: "⚙️" },
  { name: "ムーンラクーン", species: "ラクーン", monsterEmoji: "🦝", attribute: "闇", emoji: "🌙" },
  { name: "ミストスカンク", species: "スカンク", monsterEmoji: "🦨", attribute: "毒", emoji: "☠️" },
  { name: "アースバジャー", species: "バジャー", monsterEmoji: "🦡", attribute: "土", emoji: "🌱" },
  { name: "サンダーバイソン", species: "バイソン", monsterEmoji: "🦬", attribute: "雷", emoji: "⚡" },
  { name: "フロストマンモス", species: "マンモス", monsterEmoji: "🦣", attribute: "氷", emoji: "❄️" },
  { name: "ナイトスロース", species: "スロース", monsterEmoji: "🦥", attribute: "闇", emoji: "🌙" },
  { name: "アクアオッター", species: "オッター", monsterEmoji: "🦦", attribute: "水", emoji: "💧" },
  { name: "リバービーバー", species: "ビーバー", monsterEmoji: "🦫", attribute: "水", emoji: "💧" },
  { name: "ローズフラミンゴ", species: "フラミンゴ", monsterEmoji: "🦩", attribute: "光", emoji: "✨" },
  { name: "プリズムピーコック", species: "ピーコック", monsterEmoji: "🦚", attribute: "星", emoji: "🌟" },
  { name: "ソングパロット", species: "パロット", monsterEmoji: "🦜", attribute: "音", emoji: "🎵" },

  // 追加分：121〜200。既存カードの番号・レアリティを保ったまま、新しいカードを追加。
  { name: "オーロラセラフ", species: "セラフ", monsterEmoji: "🪽", attribute: "光", emoji: "✨" },
  { name: "クロノタイタン", species: "タイタン", monsterEmoji: "⏳", attribute: "闇", emoji: "🌙" },
  { name: "ギャラクシーオーブ", species: "ギャラクシー", monsterEmoji: "🌌", attribute: "闇", emoji: "🌙" },
  { name: "エクリプスクラウン", species: "エクリプス", monsterEmoji: "🌑", attribute: "闇", emoji: "🌙" },
  { name: "ルーンワイバーン", species: "ワイバーン", monsterEmoji: "🪬", attribute: "闇", emoji: "🌙" },
  { name: "アストラルスフィンクス", species: "スフィンクス", monsterEmoji: "🗿", attribute: "光", emoji: "✨" },
  { name: "コズミックジェリー", species: "ジェリー", monsterEmoji: "🪼", attribute: "海", emoji: "🌊" },
  { name: "プラズマキリン", species: "キリン", monsterEmoji: "🦒", attribute: "雷", emoji: "⚡" },
  { name: "ソーラーガルーダ", species: "ガルーダ", monsterEmoji: "🪶", attribute: "光", emoji: "✨" },
  { name: "ミラージュランプ", species: "ランプ", monsterEmoji: "🪔", attribute: "夢", emoji: "💫" },
  { name: "ネビュラバブル", species: "バブル", monsterEmoji: "🫧", attribute: "水", emoji: "💧" },
  { name: "グレイブリーパー", species: "リーパー", monsterEmoji: "⚰️", attribute: "闇", emoji: "🌙" },
  { name: "アメジストウィスプ", species: "ウィスプ", monsterEmoji: "🟣", attribute: "夢", emoji: "💫" },
  { name: "エメラルドドライアド", species: "ドライアド", monsterEmoji: "🟢", attribute: "森", emoji: "🌿" },
  { name: "ルビーファング", species: "ファング", monsterEmoji: "🔴", attribute: "火", emoji: "🔥" },
  { name: "サファイアシールド", species: "シールド", monsterEmoji: "🔵", attribute: "水", emoji: "💧" },
  { name: "トパーズアーチャー", species: "アーチャー", monsterEmoji: "🟡", attribute: "光", emoji: "✨" },
  { name: "オニキスローグ", species: "ローグ", monsterEmoji: "⚫", attribute: "闇", emoji: "🌙" },
  { name: "アイアンミノタウロス", species: "ミノタウロス", monsterEmoji: "🐂", attribute: "鋼", emoji: "⚙️" },
  { name: "コーラルナーガ", species: "ナーガ", monsterEmoji: "🪸", attribute: "海", emoji: "🌊" },
  { name: "ヘイルガーゴイル", species: "ガーゴイル", monsterEmoji: "🪨", attribute: "氷", emoji: "❄️" },
  { name: "ブロンズセンチネル", species: "センチネル", monsterEmoji: "🟤", attribute: "鋼", emoji: "⚙️" },
  { name: "スチームアルケミスト", species: "アルケミスト", monsterEmoji: "🧫", attribute: "毒", emoji: "☠️" },
  { name: "ライトニングライダー", species: "ライダー", monsterEmoji: "🏍️", attribute: "雷", emoji: "⚡" },
  { name: "フロストランサー", species: "ランサー", monsterEmoji: "🧊", attribute: "氷", emoji: "❄️" },
  { name: "ハープスピリット", species: "ハープ", monsterEmoji: "🎼", attribute: "水", emoji: "💧" },
  { name: "ブルームピクシー", species: "ピクシー", monsterEmoji: "🪷", attribute: "森", emoji: "🌿" },
  { name: "ペイントファントム", species: "ペイント", monsterEmoji: "🎨", attribute: "夢", emoji: "💫" },
  { name: "クォーツウォッチャー", species: "ウォッチャー", monsterEmoji: "👁️", attribute: "星", emoji: "🌟" },
  { name: "コメットスピア", species: "スピア", monsterEmoji: "🪄", attribute: "星", emoji: "🌟" },
  { name: "ミントスプラウト", species: "ハーブ", monsterEmoji: "🌿", attribute: "森", emoji: "🌿" },
  { name: "ハニーポット", species: "ポット", monsterEmoji: "🍯", attribute: "森", emoji: "🌿" },
  { name: "ブレッドゴーレム", species: "ブレッド", monsterEmoji: "🍞", attribute: "土", emoji: "🌱" },
  { name: "チーズナイト", species: "チーズ", monsterEmoji: "🧀", attribute: "光", emoji: "✨" },
  { name: "アップルフェアリー", species: "アップル", monsterEmoji: "🍎", attribute: "森", emoji: "🌿" },
  { name: "レモンスライム", species: "レモン", monsterEmoji: "🍋", attribute: "光", emoji: "✨" },
  { name: "グレープシャドウ", species: "グレープ", monsterEmoji: "🍇", attribute: "闇", emoji: "🌙" },
  { name: "キャロットランサー", species: "キャロット", monsterEmoji: "🥕", attribute: "土", emoji: "🌱" },
  { name: "コーンメイジ", species: "コーン", monsterEmoji: "🌽", attribute: "森", emoji: "🌿" },
  { name: "ピーチドリーマー", species: "ピーチ", monsterEmoji: "🍑", attribute: "夢", emoji: "💫" },
  { name: "チェリーツイン", species: "チェリー", monsterEmoji: "🍒", attribute: "火", emoji: "🔥" },
  { name: "ココナッツガード", species: "ココナッツ", monsterEmoji: "🥥", attribute: "海", emoji: "🌊" },
  { name: "ベリーヒーラー", species: "ベリー", monsterEmoji: "🫐", attribute: "水", emoji: "💧" },
  { name: "ティーカップセージ", species: "ティーカップ", monsterEmoji: "🍵", attribute: "夢", emoji: "💫" },
  { name: "ライススピリット", species: "ライス", monsterEmoji: "🍙", attribute: "土", emoji: "🌱" },
  { name: "ノートスカラー", species: "ノート", monsterEmoji: "📒", attribute: "夢", emoji: "💫" },
  { name: "ペンシルスカウト", species: "ペンシル", monsterEmoji: "✏️", attribute: "鋼", emoji: "⚙️" },
  { name: "インクシャドウ", species: "インク", monsterEmoji: "🖋️", attribute: "闇", emoji: "🌙" },
  { name: "クレヨンピクシー", species: "クレヨン", monsterEmoji: "🖍️", attribute: "光", emoji: "✨" },
  { name: "ブラシゴーレム", species: "ブラシ", monsterEmoji: "🖌️", attribute: "土", emoji: "🌱" },
  { name: "ルーラーガード", species: "ルーラー", monsterEmoji: "📏", attribute: "鋼", emoji: "⚙️" },
  { name: "スクールバッグ", species: "バッグ", monsterEmoji: "🎒", attribute: "風", emoji: "🌪️" },
  { name: "ミルクグラス", species: "グラス", monsterEmoji: "🥛", attribute: "光", emoji: "✨" },
  { name: "コインマーチャント", species: "コイン", monsterEmoji: "🪙", attribute: "鋼", emoji: "⚙️" },
  { name: "ハンマーガード", species: "ハンマー", monsterEmoji: "🔨", attribute: "鋼", emoji: "⚙️" },
  { name: "レンチロボ", species: "レンチ", monsterEmoji: "🔧", attribute: "鋼", emoji: "⚙️" },
  { name: "ボルトスパーク", species: "ボルト", monsterEmoji: "🔩", attribute: "雷", emoji: "⚡" },
  { name: "バッテリービート", species: "バッテリー", monsterEmoji: "🔋", attribute: "雷", emoji: "⚡" },
  { name: "ラジオスプライト", species: "ラジオ", monsterEmoji: "📻", attribute: "音", emoji: "🎵" },
  { name: "カメラアイ", species: "カメラ", monsterEmoji: "📷", attribute: "光", emoji: "✨" },
  { name: "フィルムゴースト", species: "フィルム", monsterEmoji: "🎞️", attribute: "闇", emoji: "🌙" },
  { name: "マイクソング", species: "マイク", monsterEmoji: "🎤", attribute: "音", emoji: "🎵" },
  { name: "ヘッドフォンメイジ", species: "ヘッドフォン", monsterEmoji: "🎧", attribute: "音", emoji: "🎵" },
  { name: "トランペットガード", species: "トランペット", monsterEmoji: "🎺", attribute: "音", emoji: "🎵" },
  { name: "バイオリンフェアリー", species: "バイオリン", monsterEmoji: "🎻", attribute: "音", emoji: "🎵" },
  { name: "サッカーナイト", species: "ボール", monsterEmoji: "⚽", attribute: "風", emoji: "🌪️" },
  { name: "ベースボールスピリット", species: "ベースボール", monsterEmoji: "⚾", attribute: "光", emoji: "✨" },
  { name: "バスケットゴーレム", species: "バスケット", monsterEmoji: "🏀", attribute: "土", emoji: "🌱" },
  { name: "テニスウィンド", species: "テニス", monsterEmoji: "🎾", attribute: "風", emoji: "🌪️" },
  { name: "ピンポンスカウト", species: "ピンポン", monsterEmoji: "🏓", attribute: "風", emoji: "🌪️" },
  { name: "ローラースター", species: "ローラー", monsterEmoji: "🛼", attribute: "風", emoji: "🌪️" },
  { name: "スキーランサー", species: "スキー", monsterEmoji: "🎿", attribute: "氷", emoji: "❄️" },
  { name: "サーフウェーブ", species: "サーフ", monsterEmoji: "🏄", attribute: "海", emoji: "🌊" },
  { name: "バルーンフェアリー", species: "バルーン", monsterEmoji: "🎈", attribute: "風", emoji: "🌪️" },
  { name: "カイトレンジャー", species: "カイト", monsterEmoji: "🪁", attribute: "風", emoji: "🌪️" },
  { name: "ヨーヨーシーフ", species: "ヨーヨー", monsterEmoji: "🪀", attribute: "夢", emoji: "💫" },
  { name: "ブーメランレンジャー", species: "ブーメラン", monsterEmoji: "🪃", attribute: "風", emoji: "🌪️" },
  { name: "マップナビゲーター", species: "マップ", monsterEmoji: "🗺️", attribute: "風", emoji: "🌪️" },
  { name: "ブーツランナー", species: "ブーツ", monsterEmoji: "🥾", attribute: "土", emoji: "🌱" },
  { name: "フルートガイド", species: "フルート", monsterEmoji: "🪈", attribute: "音", emoji: "🎵" },
];

export const attributeEmojiMap: Record<MainAttribute, string> = {
  火: "🔥",
  水: "💧",
  森: "🌿",
  光: "✨",
  闇: "🌙",
};

export const allAttributes: MainAttribute[] = ["火", "水", "森", "光", "闇"];

export function getAttributeColor(attribute: string): string {
  const colors: Record<string, string> = {
    火: "#ef4444",
    水: "#3b82f6",
    森: "#22c55e",
    光: "#fde68a",
    闇: "#7c3aed",
  };
  return colors[attribute] ?? "#94a3b8";
}

// カード番号の若い順に、まとまったレア度帯を割り当てる。
// 001-005: UR, 006-017: SSR, 018-061: SR, 062-112: R, 113-200: N
const rarityBands: { rarity: Rarity; count: number }[] = [
  { rarity: "UR", count: 5 },
  { rarity: "SSR", count: 12 },
  { rarity: "SR", count: 44 },
  { rarity: "R", count: 51 },
  { rarity: "N", count: 88 },
];

function getRarityByCardIndex(index: number): Rarity {
  const cardNumber = index + 1;
  let maxCardNumber = 0;

  for (const band of rarityBands) {
    maxCardNumber += band.count;

    if (cardNumber <= maxCardNumber) {
      return band.rarity;
    }
  }

  return "N";
}

function getTitleByRarity(name: string, rarity: Rarity): string {
  if (rarity === "UR")  return `究極の${name}`;
  if (rarity === "SSR") return `伝説の${name}`;
  if (rarity === "SR")  return `覚醒${name}`;
  if (rarity === "R")   return `成長${name}`;
  return `見習い${name}`;
}

const monsterLoreByName: Record<string, string> = {
  ブレイズドラゴン: "長い首をもたげ、翼で熱風を巻き起こす。しっぽの炎で空に輪を描く、堂々としたドラゴンです。",
  ムーンユニコーン: "月の引力を角に宿し、潮の満ち引きを操ります。銀色の波頭を蹴って疾走する姿は、満月の夜にだけ現れる奇跡です。",
  サンダーフェニックス: "翼ばたくたびに枯れ野に緑の炎が宿ります。焼け野原から何度でも新芽を呼び覚ます、不死と再生の守護鳥です。",
  シャドウウルフ: "影の中をすべるように走り、青白い目で相手の動きを読みます。こわそうに見えて、仲間にはとても忠実です。",
  キングライオン: "まぶしいたてがみを王冠のように輝かせます。大きなほえ声で味方をはげまし、正面から堂々と戦います。",
  フレイムタイガー: "しま模様の間から炎の光がちらつきます。すばやいジャンプで相手の前に飛び出す、情熱的なトラです。",
  フォレストベア: "背中に小さな草花をのせて歩く、森の守り手です。太い腕で木をゆらし、木の実を落として仲間に分けます。",
  スノーパンダ: "ふわふわの毛に雪の結晶をまとっています。ころころ転がって近づき、冷たい息で相手をびっくりさせます。",
  スターFOX: "しっぽの先に星くずをためています。夜空を見上げるのが好きで、星の道しるべを追ってすばやく走ります。",
  ミスティキャット: "霧のカーテンにまぎれて足音を消します。気まぐれですが、夢の中に現れてヒントをくれることがあります。",
  ガーディアンドッグ: "前足で地面をたたくと、小さな土の壁がせり上がります。門番のようにまっすぐ立ち、仲間を守ります。",
  ラビットランナー: "長い耳で風の流れを読み、草原を一直線にかけぬけます。急な方向転換が得意なスピード型です。",
  ハムスターソルジャー: "ほお袋に小さな盾や道具をしまっています。小さな体でも勇気は大きく、ころころ転がって突撃します。",
  マウスシーフ: "暗がりのすき間をぬけて宝物を集めます。小さな足音だけを残して、相手の油断をさっとつきます。",
  コアラヒーラー: "森の葉からやさしい香りの薬を作ります。眠そうな顔をしていますが、仲間が困るとすぐに助けに来ます。",
  モンキーメイジ: "木の枝を杖のようにふり、夢色の光を飛ばします。いたずら好きで、相手を笑わせて油断させます。",
  チキンナイト: "羽のマントをゆらしながら小さな剣をかかげます。こわがりでも一歩前に出る、がんばり屋の騎士です。",
  アイスペンギン: "おなかですべって氷の道を作ります。冷たい息で足元を凍らせ、すいすいと戦場を動き回ります。",
  ナイトオウル: "夜の空から静かに見下ろし、月影にまぎれて飛びます。大きな目で隠れた相手を見つける見張り役です。",
  ポイズンフロッグ: "背中の模様が危険な色に光ります。ぴょんと跳ねて毒のしずくを飛ばしますが、普段は水辺でのんびりしています。",
  クロコウォリアー: "固いうろこをよろいのようにまとった戦士です。水辺では特に強く、大きなあごで武器を受け止めます。",
  シェルタートル: "大きな甲羅に川の水流をためています。水底をゆっくり進みますが、防御に入るとびくともしません。",
  サーペントロード: "長い体をくるりと巻き、王さまのように相手を見すえます。毒の霧で道をふさぐ、冷静な支配者です。",
  ブルーホエール: "大きな歌声で海の波を動かします。やさしい性格ですが、本気になると潮の柱を呼び出します。",
  ドルフィンセージ: "水面を跳ねながら知恵のしずくを集めます。仲間に進む道を教える、明るい海の先生です。",
  シャークバイター: "海流を切り裂くように泳ぐハンターです。ぎざぎざの歯を見せて相手をおどろかせます。",
  オクトパスマジック: "八本の足で魔法陣を同時に描きます。インクの煙から夢色の幻を生み出す、不思議な魔法使いです。",
  スクイッドスカウト: "細い足をすばやく動かして海の様子を調べます。危ない時は墨を広げて、仲間に合図を送ります。",
  クラブガード: "大きなハサミを盾のように構えます。横歩きでじわじわ近づき、仲間の前に立つ頼れる守備役です。",
  シュリンプダンサー: "小さな体でリズムよく跳ね、音の波を作ります。踊りながら相手の攻撃をひらりとかわします。",
  バタフライフェアリー: "羽に風の粉をまとった小さな妖精です。ふわりと舞うだけで、周りにやさしい追い風が吹きます。",
  ハニービー: "花の蜜を集めて森の元気を守ります。小さな羽音で仲間を集め、チームで動くのが得意です。",
  レディバグレンジャー: "赤い背中の星もようが火花のように光ります。小さなレンジャーとして、葉の上をパトロールします。",
  スコーピオンアサシン: "砂の上に足あとを残さず近づきます。しっぽの針にはしびれる毒があり、一撃離脱を得意とします。",
  スパイダーウィーバー: "闇色の糸で細かなワナを編みます。こわそうですが、きれいな糸の橋を作る職人でもあります。",
  ゴーストメイジ: "ふわふわ浮きながら古い呪文を唱えます。ランプの光をゆらして、相手をまよわせるのが得意です。",
  ロボットガーディアン: "胸のランプを光らせて周囲をスキャンします。ギアの腕でガチンと防御する、まじめな機械の守り手です。",
  エイリアンスター: "宇宙の深い闇からやってきた謎のモンスターです。暗黒波動で相手の動きをわずかに狂わせます。",
  レッドオーガ: "赤い角を光らせて力いっぱい突進します。怒ると迫力がありますが、勝負が終わるとすぐに笑う単純な怪力です。",
  デーモンロード: "黒いマントを広げ、闇の炎をゆっくりまといます。小さな魔物たちをまとめる、いばりんぼうの王です。",
  スカルナイト: "骨のよろいをカタカタ鳴らして進む騎士です。毒の霧をまとった剣で、相手の足を止めます。",
  パンプキンジャック: "かぼちゃの顔に火をともし、夜道をぴょこぴょこ歩きます。びっくり箱のような攻撃で相手を驚かせます。",
  ウィザードアーク: "大きな帽子の下で闇の呪文を練る古の魔法使いです。黒い杖をひとふりすると、深い影がうねり出します。",
  フェアリーライト: "光の粉をまきながら花から花へ飛びます。小さな手で仲間をはげます、明るい妖精です。",
  マーメイドソング: "水面にひびく歌声で波を操ります。音のリズムに合わせて、貝がらの魔法を放ちます。",
  シールドナイト: "大きな盾を前に出して仲間を守る騎士です。鋼のよろいは重いけれど、心はとてもやさしいです。",
  ソードブレイバー: "火をまとった剣をかかげて前へ進みます。まっすぐな勇気で、強い相手にもひるみません。",
  クラウンキング: "まぶしい王冠から光の命令を出します。小さな王国を守るため、胸を張って戦います。",
  スターコメット: "星の尾を引きながら夜空を飛ぶモンスターです。落ちた星くずを集めて、きらめく一撃に変えます。",
  メテオコメット: "燃える尾を引いて空から急降下します。着地すると小さな火花がはじける、元気な流星です。",
  ムーンシャドウ: "月の光でできた影のモンスターです。満月の夜だけ姿がはっきりし、静かに空をただよいます。",
  サンブレイズ: "太陽のかけらのように熱く光ります。明るい光で闇を押し返し、味方に元気を分けます。",
  ファイアスピリット: "小さな炎が意思を持った精霊です。ゆらゆら踊りながら、火の粉で道を照らします。",
  ウォータースピリット: "水しぶきから生まれた透明な精霊です。流れるように形を変えて、すばやく攻撃をかわします。",
  スノースピリット: "雪の結晶が集まってできた精霊です。ふれるとひんやりしますが、心はやさしい冬の友だちです。",
  サンダースピリット: "雷の音に合わせてぴかっと跳ねる精霊です。小さな体に強い電気をためています。",
  リーフスピリット: "葉っぱのすき間に住む森の精霊です。風に乗って舞い、草木の力で仲間を支えます。",
  ツリーガーディアン: "古い大木に宿った守護者です。根を地面に広げ、森に近づく危険を感じ取ります。",
  マッシュルームメイジ: "きのこの帽子から毒の胞子をふわっと飛ばします。見た目はのんびり、魔法は意外とあなどれません。",
  クリスタルオラクル: "水晶の中に未来の光を映します。夢のような声で、次に起こることをそっと教えます。",
  ジェムドラゴン: "宝石のうろこを持つ小さなドラゴンです。光を受けると体が虹色に反射します。",
  キーキーパー: "古い鍵をじゃらじゃら持ち歩く番人です。閉ざされた扉や宝箱の秘密を知っています。",
  ボムゴーレム: "体の中で火花がぱちぱち鳴る岩のゴーレムです。怒ると爆発しそうになりますが、普段はとても慎重です。",
  ポーションスライム: "薬びんのようにぷるぷるした半透明のスライムです。中の液体が光ると、仲間を少し元気にします。",
  スクロールセージ: "古い海図の巻物から生まれた賢者です。紙の体をくるくる広げ、海底に眠る秘呪を読み上げます。",
  ブックソーサラー: "魔法書のページを羽のように広げます。星の文字を浮かべて、相手に小さな謎を出します。",
  チェストミミック: "宝箱のふりをして静かに待ちます。ふたを開けようとした相手を、びっくり顔で驚かせます。",
  ギフトミミック: "かわいいプレゼント箱に化けるいたずら者です。リボンをほどくと闇色の煙がもくもくと飛び出します。",
  ベルフェアリー: "鈴の音で仲間に合図を送る妖精です。チリンと鳴るたび、音の輪が広がります。",
  アンカークラブ: "重いアンカーを背負った海のクラブです。波に流されず、ハサミでしっかり地面をつかみます。",
  ロケットスター: "背中のロケットで星空へ飛び出します。まっすぐ上昇して、流れ星のように戻ってきます。",
  UFOミステリー: "宇宙の暗黒から飛来した謎の円盤モンスターです。暗黒エネルギーをまとい、音もなく夜空に浮かびます。",
  キャッスルガーディアン: "小さなお城の姿をした守護者です。石の壁を広げて、仲間の基地を作ります。",
  テントレンジャー: "炎の松明でキャンプを守る勇敢なレンジャーです。火の粉をまとったマントで夜の暗闇を切り開きます。",
  マウンテンゴーレム: "山の岩が集まって歩き出した巨大なゴーレムです。足音だけで大地がどしんと揺れます。",
  ボルケーノロード: "火山の熱をまとった支配者です。頭の火口から煙を上げ、熱い岩を転がします。",
  レインボードラゴン: "虹色の翼を広げる明るいドラゴンです。七色の光を浴びると、うろこがさらに輝きます。",
  クラウドシープ: "雲のような毛をまとったふわふわの羊です。雨雲を呼び込み、やさしいしずくのシャワーで仲間を癒します。",
  トルネードホーク: "翼で小さな竜巻を作る空のハンターです。高いところから風の道を読んで急降下します。",
  ウェーブサーペント: "波の形に体をくねらせる海の大蛇です。潮の流れにまぎれて、静かに近づきます。",
  ウェーブスプライト: "波のリズムから生まれた海の小さな精霊です。潮のメロディで仲間の心を明るく照らします。",
  ギタービースト: "大きなギターの音で空気を震わせるモンスターです。力強いコードで相手を押し返します。",
  ドラムゴーレム: "体の太鼓をどんどん鳴らして進むゴーレムです。リズムに合わせるほど力が増します。",
  トロフィーチャンピオン: "ぴかぴかのトロフィーから生まれた勝負好きです。勝利のポーズを決めると光が広がります。",
  メダルウォリアー: "胸のメダルを盾にして戦う戦士です。鋼のきらめきで相手の攻撃をはね返します。",
  ダイスゴブリン: "さいころを振って作戦を決めるいたずら好きです。出た目によって、強くなったりあわてたりします。",
  パズルスライム: "体のピースを組み替えて形を変えるスライムです。解けそうで解けない動きで相手を悩ませます。",
  コンパスレンジャー: "コンパスの針で海流を読む航海士レンジャーです。潮の流れを読んで、仲間を安全な航路へ導きます。",
  ランタンゴースト: "小さなランタンを持って夜道をただよいます。光をゆらゆら揺らして、相手をまよわせます。",
  キャンドルメイジ: "ろうそくの炎を杖の先に移して魔法を使います。炎が短くなるほど集中力が増します。",
  ミラーフェアリー: "鏡の羽をきらりと光らせる妖精です。相手の動きを映して、同じタイミングでかわします。",
  マグネットロボ: "磁石の力で金属を引き寄せるロボットです。近くのギアを集めて腕を大きくできます。",
  ギアナイト: "歯車のよろいを回しながら戦う騎士です。回転が速くなるほど、盾も剣も力強くなります。",
  ハートヒーラー: "ハート型の光で仲間を安心させます。やさしい魔法が得意で、戦いの後もみんなを元気にします。",
  スパークフェアリー: "小さな光の粒から生まれた妖精です。ぱちぱち弾けるスパークで暗い場所を明るくします。",
  ミストファントム: "霧の中からふわっと現れる幻のモンスターです。姿を薄くして、攻撃をすり抜けます。",
  シードスプラウト: "小さな種から芽を出したばかりの植物モンスターです。がんばって根を伸ばし、少しずつ強くなります。",
  ローズクイーン: "バラの花びらを王冠のようにまとった女王です。ツタをしなやかに動かし、花の香りで相手を惑わせます。",
  サクラフェアリー: "桜の花びらと一緒に舞う光の妖精です。春風に乗って、やさしい光を広げます。",
  メープルガーディアン: "大きなかえでの葉を盾にする森の守り手です。秋色の風を起こして、仲間を包みます。",
  シェルナイト: "貝がらのよろいをまとった海の騎士です。波の音を聞きながら、固い殻で攻撃を受け止めます。",
  パールマーメイド: "真珠の光を歌声にのせる人魚です。海の底からやさしいメロディを届けます。",
  クローバーラビット: "四つ葉のクローバーを探すのが得意なラビットです。見つけた幸運を仲間に分けてくれます。",
  ダイヤゴーレム: "ダイヤの体を持つきらめくゴーレムです。固い拳で地面をたたくと、光のかけらが飛び散ります。",
  スペードナイト: "スペード型の盾を持つ闇の騎士です。黒いマントで姿を隠し、静かに一撃をねらいます。",
  ジュラシックレックス: "大きな足で地面を踏みしめる古代の王者です。土けむりを上げながら、迫力たっぷりに突進します。",
  グランドサウルス: "背中に草木を生やしたおだやかな恐竜です。森を歩くたび、足あとから若い芽が伸びます。",
  ブラッドバット: "赤い翼で夜空をすばやく飛ぶバットです。月明かりを浴びると、翼の模様がほんのり光ります。",
  ニードルヘッジ: "鋼のトゲを背中に並べた小さな守り手です。丸まるとトゲのボールになって身を守ります。",
  ムーンラクーン: "月夜にしっぽのしま模様を光らせます。器用な手で小さな宝物を拾い集める夜の探検家です。",
  ミストスカンク: "白い霧をまとって歩く毒属性のモンスターです。ピンチになると、もくもくの煙で姿を隠します。",
  アースバジャー: "太い爪で土を掘り進む地下の職人です。地面の下からひょっこり現れて相手を驚かせます。",
  サンダーバイソン: "角に雷をためて草原を走ります。突進の前には、地面に小さな電気が走ります。",
  フロストマンモス: "氷の牙を持つ大きなマンモスです。鼻から冷たい風を吹き、雪の壁を作ります。",
  ナイトスロース: "夜の木陰にぶら下がる闇の精霊です。ゆっくり動くたびに周囲の光を吸い込み、静かな暗闇を広げます。",
  アクアオッター: "水しぶきをまとって川をすべるように泳ぎます。貝がらを投げて水の輪を作るのが得意です。",
  リバービーバー: "川に巨大なダムを作る水辺の建築家です。前歯で丸太をけずり、流れを操る水の砦を築きます。",
  ローズフラミンゴ: "ピンクの羽から光の花びらを散らします。片足でくるりと回り、優雅に相手をかわします。",
  プリズムピーコック: "広げた羽がプリズムのように七色に光ります。星の光を反射して、まぶしい目くらましをします。",
  ソングパロット: "覚えたメロディをまねして歌う明るい鳥です。リズムに乗ると、仲間のスピードを上げます。",
};

const rarityDescriptionByRarity: Record<Rarity, string> = {
  UR: " 虹色のオーラをまとった、図鑑でもめったに見られない究極レアです。",
  SSR: " 強い光をまとった、冒険者があこがれる伝説級のカードです。",
  SR: " 目立つ力を秘めた、バトルで頼りになる上級カードです。",
  R: " 個性が光る、育てるほど活躍の場が広がるレアカードです。",
  N: " 親しみやすく、冒険のはじめから一緒に成長できるカードです。",
};

function getDescription(card: MonsterCard): string {
  const lore =
    monsterLoreByName[card.name] ??
    `${card.species}らしい姿と${card.attribute}属性の力を持つ、冒険の仲間です。`;

  return `${card.name}は${card.attribute}属性の${card.species}モンスター。${lore}${rarityDescriptionByRarity[card.rarity]}`;
}

export const monsterCards: MonsterCard[] = monsterTemplates.map(
  (template, index) => {
    const rarity = getRarityByCardIndex(index);
    const no = String(index + 1).padStart(3, "0");

    const mainAttr = normalizeAttribute(template.attribute);

    const cardWithoutDescription: MonsterCard = {
      id: `monster-${no}`,
      no,
      name: template.name,
      title: getTitleByRarity(template.name, rarity),
      rarity,
      attribute: mainAttr,
      subAttribute: template.attribute !== mainAttr ? template.attribute : undefined,
      emoji: getMainAttributeEmoji(mainAttr),
      species: template.species,
      monsterEmoji: template.monsterEmoji,
      description: "",
    };

    return {
      ...cardWithoutDescription,
      description: getDescription(cardWithoutDescription),
    };
  }
);

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

  if (random < 0.01) return pickRandomCardFromRarity("UR");
  if (random < 0.04) return pickRandomCardFromRarity("SSR");
  if (random < 0.22) return pickRandomCardFromRarity("SR");

  return pickRandomCardFromRarity("R");
}

export function pickTenPackSpecialCard(): MonsterCard {
  const random = Math.random();

  if (random < 0.02) return pickRandomCardFromRarity("UR");
  if (random < 0.07) return pickRandomCardFromRarity("SSR");

  return pickRandomCardFromRarity("SR");
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
  const cards: MonsterCard[] = [];

  for (let index = 0; index < 50; index++) {
    const isLastCard = index === 49;
    const isRareSlot = (index + 1) % 5 === 0;

    if (isLastCard) {
      cards.push(pickTenPackSpecialCard());
    } else if (isRareSlot) {
      cards.push(pickRareSlotCard());
    } else {
      cards.push(pickCardByRarity());
    }
  }

  return cards;
}

// ================================
// GOD Pack
// ================================

export const GOD_PACK_RATE = 0.003; // 0.3%

export function rollGodPack(): boolean {
  return Math.random() < GOD_PACK_RATE;
}

export function drawGodPackBonusRarity(): Rarity {
  const r = Math.random();
  if (r < 0.75) return "SR";
  if (r < 0.95) return "SSR";
  return "UR";
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

  // UR 1枚確定
  results.push(pickRandomCardFromRarity("UR"));

  // SSR 2枚確定
  results.push(pickRandomCardFromRarity("SSR"));
  results.push(pickRandomCardFromRarity("SSR"));

  // 残り7枚はすべてSR以上（GODパック専用確率）
  for (let i = 0; i < 7; i++) {
    results.push(pickRandomCardFromRarity(drawGodPackBonusRarity()));
  }

  return shuffleCards(results);
}
