"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  bgmPlayer,
  getStoredBgmEnabled,
  setStoredBgmEnabled,
  subscribeToBgmEnabledChange,
} from "../../data/bgm";

export default function GlobalBgmButton() {
  const enabled = useSyncExternalStore(
    subscribeToBgmEnabledChange,
    getStoredBgmEnabled,
    () => true
  );

  useEffect(() => {
    bgmPlayer.enable(enabled);
  }, [enabled]);

  const toggle = () => {
    setStoredBgmEnabled(!enabled);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={`global-bgm-btn${enabled ? " global-bgm-on" : ""}`}
      title={`BGM ${enabled ? "ON → OFFにする" : "OFF → ONにする"}`}
      aria-label={`BGMを${enabled ? "オフ" : "オン"}にする`}
    >
      ♪ {enabled ? "ON" : "OFF"}
    </button>
  );
}
