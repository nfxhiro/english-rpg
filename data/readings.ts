import { questWorldsById } from "./questConfig";
import { getEiken3Reading } from "./readings_eiken3";
import { getEiken4Reading } from "./readings_eiken4";
import { getEiken5Reading } from "./readings_eiken5";
import { getEikenPre2Reading } from "./readings_eiken_pre2";

export type ReadingGetter = (meaning: string) => string | undefined;

export const readingGettersByLevel: Record<string, ReadingGetter> = {
  [questWorldsById.eiken5.level]: getEiken5Reading,
  [questWorldsById.eiken4.level]: getEiken4Reading,
  [questWorldsById.eiken3.level]: getEiken3Reading,
  [questWorldsById.eiken_pre2.level]: getEikenPre2Reading,
};

export function getReadingForLevel(level: string, meaning: string) {
  return readingGettersByLevel[level]?.(meaning);
}
