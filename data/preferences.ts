"use client";

export const FURIGANA_ENABLED_STORAGE_KEY = "furiganaEnabled";
export const FURIGANA_ENABLED_CHANGE_EVENT =
  "eikenQuestFuriganaEnabledChange";

export function getStoredFuriganaEnabled() {
  if (typeof window === "undefined") return false;

  return localStorage.getItem(FURIGANA_ENABLED_STORAGE_KEY) === "true";
}

export function setStoredFuriganaEnabled(enabled: boolean) {
  if (typeof window === "undefined") return;

  localStorage.setItem(FURIGANA_ENABLED_STORAGE_KEY, String(enabled));
  window.dispatchEvent(
    new CustomEvent(FURIGANA_ENABLED_CHANGE_EVENT, { detail: enabled })
  );
}

export function subscribeToFuriganaEnabledChange(onChange: () => void) {
  if (typeof window === "undefined") return () => {};

  const handleChange = () => onChange();
  window.addEventListener(FURIGANA_ENABLED_CHANGE_EVENT, handleChange);
  window.addEventListener("storage", handleChange);

  return () => {
    window.removeEventListener(FURIGANA_ENABLED_CHANGE_EVENT, handleChange);
    window.removeEventListener("storage", handleChange);
  };
}
