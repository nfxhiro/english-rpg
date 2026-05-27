import { eiken5RawWords } from "./eiken5";
import { eiken4RawWords } from "./eiken4";
import { eiken3RawWords } from "./eiken3";
import { eikenPre2RawWords } from "./eiken_pre2";

export type LearningWord = {
  no: string;
  word: string;
  meaning: string;
  type: string;
  level: string;
  example: string;
  exampleMeaning: string;
};

export type RawWordCard = {
  word: string;
  meaning: string;
  type: string;
  level: string;
  example: string;
  exampleMeaning: string;
};

const rawLearningWords: RawWordCard[] = [
  ...eiken5RawWords,
  ...eiken4RawWords,
  ...eiken3RawWords,
  ...eikenPre2RawWords,
];

export const learningWords: LearningWord[] = rawLearningWords.map(
  (word, index) => {
    return {
      no: String(index + 1).padStart(4, "0"),
      word: word.word,
      meaning: word.meaning,
      type: word.type,
      level: word.level,
      example: word.example,
      exampleMeaning: word.exampleMeaning,
    };
  }
);

