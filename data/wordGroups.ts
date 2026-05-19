import type { LearningWord, RawWordCard } from "./words";
import {
  getQuestBlockConfig,
  getQuestWorldByBlockId,
  type EikenLevelId,
} from "./questConfig";

import { eiken5Words001_100 } from "./eiken5_words_001_100";
import { eiken5Words101_200 } from "./eiken5_words_101_200";
import { eiken5Words201_300 } from "./eiken5_words_201_300";
import { eiken5Words301_400 } from "./eiken5_words_301_400";
import { eiken5Words401_500 } from "./eiken5_words_401_500";
import { eiken5Words501_600 } from "./eiken5_words_501_600";
import { eiken5Phrases001_100 } from "./eiken5_phrases_001_100";

import { eiken4Words001_100 } from "./eiken4_words_001_100";
import { eiken4Words101_200 } from "./eiken4_words_101_200";
import { eiken4Words201_300 } from "./eiken4_words_201_300";
import { eiken4Words301_400 } from "./eiken4_words_301_400";
import { eiken4Words401_500 } from "./eiken4_words_401_500";
import { eiken4Words501_600 } from "./eiken4_words_501_600";
import { eiken4Words601_700 } from "./eiken4_words_601_700";
import { eiken4Phrases001_100 } from "./eiken4_phrases_001_100";

import { eiken3Words001_100 } from "./eiken3_words_001_100";
import { eiken3Words101_200 } from "./eiken3_words_101_200";
import { eiken3Words201_300 } from "./eiken3_words_201_300";
import { eiken3Words301_400 } from "./eiken3_words_301_400";
import { eiken3Words401_500 } from "./eiken3_words_401_500";
import { eiken3Words501_600 } from "./eiken3_words_501_600";
import { eiken3Words601_700 } from "./eiken3_words_601_700";
import { eiken3Words701_800 } from "./eiken3_words_701_800";
import { eiken3Phrases001_100 } from "./eiken3_phrases_001_100";
import { eiken3Phrases101_200 } from "./eiken3_phrases_101_200";

import { eikenPre2Words001_100 } from "./eiken_pre2_words_001_100";
import { eikenPre2Words101_200 } from "./eiken_pre2_words_101_200";
import { eikenPre2Words201_300 } from "./eiken_pre2_words_201_300";
import { eikenPre2Words301_400 } from "./eiken_pre2_words_301_400";
import { eikenPre2Words401_500 } from "./eiken_pre2_words_401_500";
import { eikenPre2Words501_600 } from "./eiken_pre2_words_501_600";
import { eikenPre2Words601_700 } from "./eiken_pre2_words_601_700";
import { eikenPre2Words701_800 } from "./eiken_pre2_words_701_800";
import { eikenPre2Words801_900 } from "./eiken_pre2_words_801_900";
import { eikenPre2Words901_1000 } from "./eiken_pre2_words_901_1000";
import { eikenPre2Words1001_1100 } from "./eiken_pre2_words_1001_1100";
import { eikenPre2Words1101_1200 } from "./eiken_pre2_words_1101_1200";
import { eikenPre2Words1201_1300 } from "./eiken_pre2_words_1201_1300";
import { eikenPre2Words1301_1400 } from "./eiken_pre2_words_1301_1400";
import { eikenPre2Words1401_1500 } from "./eiken_pre2_words_1401_1500";
import { eikenPre2Phrases001_100 } from "./eiken_pre2_phrases_001_100";
import { eikenPre2Phrases101_200 } from "./eiken_pre2_phrases_101_200";
import { eikenPre2Phrases201_300 } from "./eiken_pre2_phrases_201_300";

export { levelOrder } from "./questConfig";

export type WordGroup = {
  id: string;
  label: string;
  level: string;
  levelId: EikenLevelId;
  worldId: EikenLevelId;
  stageName: string;
  mapIcon: string;
  backgroundKey: string;
  words: LearningWord[];
};

function toWords(raw: RawWordCard[]): LearningWord[] {
  return raw.map((word, i) => ({
    no: String(i + 1).padStart(4, "0"),
    word: word.word,
    meaning: word.meaning,
    type: word.type,
    level: word.level,
    example: word.example,
    exampleMeaning: word.exampleMeaning,
  }));
}

function createWordGroup(id: string, raw: RawWordCard[]): WordGroup {
  const block = getQuestBlockConfig(id);
  const world = getQuestWorldByBlockId(id);

  if (!block || !world) {
    throw new Error(`Quest config is missing for word group: ${id}`);
  }

  return {
    id,
    label: block.label,
    level: world.level,
    levelId: block.levelId,
    worldId: world.id,
    stageName: block.stageName,
    mapIcon: block.mapIcon,
    backgroundKey: block.backgroundKey,
    words: toWords(raw),
  };
}

export const wordGroups: WordGroup[] = [
  createWordGroup("eiken5-001-100", eiken5Words001_100),
  createWordGroup("eiken5-101-200", eiken5Words101_200),
  createWordGroup("eiken5-201-300", eiken5Words201_300),
  createWordGroup("eiken5-301-400", eiken5Words301_400),
  createWordGroup("eiken5-401-500", eiken5Words401_500),
  createWordGroup("eiken5-501-600", eiken5Words501_600),
  createWordGroup("eiken5-ph-001-100", eiken5Phrases001_100),

  createWordGroup("eiken4-001-100", eiken4Words001_100),
  createWordGroup("eiken4-101-200", eiken4Words101_200),
  createWordGroup("eiken4-201-300", eiken4Words201_300),
  createWordGroup("eiken4-301-400", eiken4Words301_400),
  createWordGroup("eiken4-401-500", eiken4Words401_500),
  createWordGroup("eiken4-501-600", eiken4Words501_600),
  createWordGroup("eiken4-601-700", eiken4Words601_700),
  createWordGroup("eiken4-ph-001-100", eiken4Phrases001_100),

  createWordGroup("eiken3-001-100", eiken3Words001_100),
  createWordGroup("eiken3-101-200", eiken3Words101_200),
  createWordGroup("eiken3-201-300", eiken3Words201_300),
  createWordGroup("eiken3-301-400", eiken3Words301_400),
  createWordGroup("eiken3-401-500", eiken3Words401_500),
  createWordGroup("eiken3-501-600", eiken3Words501_600),
  createWordGroup("eiken3-601-700", eiken3Words601_700),
  createWordGroup("eiken3-701-800", eiken3Words701_800),
  createWordGroup("eiken3-ph-001-100", eiken3Phrases001_100),
  createWordGroup("eiken3-ph-101-200", eiken3Phrases101_200),

  createWordGroup("pre2-001-100", eikenPre2Words001_100),
  createWordGroup("pre2-101-200", eikenPre2Words101_200),
  createWordGroup("pre2-201-300", eikenPre2Words201_300),
  createWordGroup("pre2-301-400", eikenPre2Words301_400),
  createWordGroup("pre2-401-500", eikenPre2Words401_500),
  createWordGroup("pre2-501-600", eikenPre2Words501_600),
  createWordGroup("pre2-601-700", eikenPre2Words601_700),
  createWordGroup("pre2-701-800", eikenPre2Words701_800),
  createWordGroup("pre2-801-900", eikenPre2Words801_900),
  createWordGroup("pre2-901-1000", eikenPre2Words901_1000),
  createWordGroup("pre2-1001-1100", eikenPre2Words1001_1100),
  createWordGroup("pre2-1101-1200", eikenPre2Words1101_1200),
  createWordGroup("pre2-1201-1300", eikenPre2Words1201_1300),
  createWordGroup("pre2-1301-1400", eikenPre2Words1301_1400),
  createWordGroup("pre2-1401-1500", eikenPre2Words1401_1500),
  createWordGroup("pre2-ph-001-100", eikenPre2Phrases001_100),
  createWordGroup("pre2-ph-101-200", eikenPre2Phrases101_200),
  createWordGroup("pre2-ph-201-300", eikenPre2Phrases201_300),
];

export const wordGroupsByLevel: Record<string, WordGroup[]> = wordGroups.reduce(
  (acc, group) => {
    if (!acc[group.level]) acc[group.level] = [];
    acc[group.level].push(group);
    return acc;
  },
  {} as Record<string, WordGroup[]>
);
