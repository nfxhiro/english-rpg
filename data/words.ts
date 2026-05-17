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

/**
 * 既存の quiz/page.tsx が WordCard / wordCards を参照しているため、
 * いったん互換用として残します。
 * 今後 quiz/page.tsx を learningWords に変更したら、この alias は消してOKです。
 */
export type WordCard = LearningWord;

export const wordCards: WordCard[] = learningWords;

export function getLearningWordByWord(word: string): LearningWord | undefined {
  return learningWords.find((item) => item.word === word);
}

export function getWordCardByWord(word: string): WordCard | undefined {
  return wordCards.find((item) => item.word === word);
}