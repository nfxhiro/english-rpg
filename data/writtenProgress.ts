import { questModeConfigList, type QuestMode } from "./questConfig";

export const WRITTEN_PROGRESS_STORAGE_KEY = "writtenProgress";

export type WrittenProgress = {
  answeredIds: Record<string, boolean>;
  correctIds: Record<string, boolean>;
  clearedModes: Record<string, boolean>;
  crownedModes: Record<string, boolean>;
};

export const emptyWrittenProgress: WrittenProgress = {
  answeredIds: {},
  correctIds: {},
  clearedModes: {},
  crownedModes: {},
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function trueRecord(value: unknown): Record<string, boolean> {
  if (!isRecord(value)) return {};

  return Object.fromEntries(
    Object.entries(value).filter(([, recordValue]) => recordValue === true)
  ) as Record<string, boolean>;
}

export function getWrittenModeProgressKey(level: string, mode: QuestMode) {
  return `${level}:${mode}`;
}

export function normalizeWrittenProgress(value: unknown): WrittenProgress {
  if (!isRecord(value)) return { ...emptyWrittenProgress };

  return {
    answeredIds: trueRecord(value.answeredIds),
    correctIds: trueRecord(value.correctIds),
    clearedModes: trueRecord(value.clearedModes),
    crownedModes: trueRecord(value.crownedModes),
  };
}

export function loadWrittenProgress(): WrittenProgress {
  if (typeof window === "undefined") return { ...emptyWrittenProgress };

  try {
    return normalizeWrittenProgress(
      JSON.parse(localStorage.getItem(WRITTEN_PROGRESS_STORAGE_KEY) ?? "null")
    );
  } catch {
    return { ...emptyWrittenProgress };
  }
}

export function saveWrittenProgress(progress: WrittenProgress) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(
      WRITTEN_PROGRESS_STORAGE_KEY,
      JSON.stringify(normalizeWrittenProgress(progress))
    );
  } catch {}
}

export function clearWrittenProgress() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(WRITTEN_PROGRESS_STORAGE_KEY);
}

export function isWrittenModeCleared(
  progress: WrittenProgress,
  level: string,
  mode: QuestMode
) {
  return progress.clearedModes[getWrittenModeProgressKey(level, mode)] === true;
}

export function isWrittenModeCrowned(
  progress: WrittenProgress,
  level: string,
  mode: QuestMode
) {
  return progress.crownedModes[getWrittenModeProgressKey(level, mode)] === true;
}

export function getWrittenClearedQuestModeCount(
  progress: WrittenProgress,
  level: string
) {
  return questModeConfigList.filter((config) => {
    return isWrittenModeCleared(progress, level, config.mode);
  }).length;
}

export function getWrittenProgressPercent(progress: WrittenProgress, level: string) {
  if (questModeConfigList.length === 0) return 0;
  return Math.round(
    (getWrittenClearedQuestModeCount(progress, level) /
      questModeConfigList.length) *
      100
  );
}
