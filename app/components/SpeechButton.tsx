"use client";

import { useEffect, useId, useRef, useState } from "react";

type SpeechButtonProps = {
  text: string;
  label?: string;
  activeLabel?: string;
  title?: string;
  lang?: string;
  rate?: number;
  pitch?: number;
  className?: string;
  disabled?: boolean;
};

const SPEECH_EVENT_NAME = "eq-speech-start";

function canUseSpeech() {
  return (
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    "SpeechSynthesisUtterance" in window
  );
}

export function stopSpeech() {
  if (!canUseSpeech()) return;
  window.speechSynthesis.cancel();
}

export default function SpeechButton({
  text,
  label = "聞く",
  activeLabel = "停止",
  title,
  lang = "en-US",
  rate = 0.82,
  pitch = 1,
  className,
  disabled = false,
}: SpeechButtonProps) {
  const id = useId();
  const isSpeakingRef = useRef(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const handleSpeechStart = (event: Event) => {
      const activeId = (event as CustomEvent<string>).detail;
      if (activeId !== id) {
        isSpeakingRef.current = false;
        setIsSpeaking(false);
      }
    };

    window.addEventListener(SPEECH_EVENT_NAME, handleSpeechStart);

    return () => {
      window.removeEventListener(SPEECH_EVENT_NAME, handleSpeechStart);
      if (isSpeakingRef.current) stopSpeech();
    };
  }, [id]);

  const handleClick = () => {
    if (!canUseSpeech() || disabled || text.trim() === "") return;

    if (isSpeaking) {
      stopSpeech();
      isSpeakingRef.current = false;
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.onend = () => {
      isSpeakingRef.current = false;
      setIsSpeaking(false);
    };
    utterance.onerror = () => {
      isSpeakingRef.current = false;
      setIsSpeaking(false);
    };

    stopSpeech();
    window.dispatchEvent(new CustomEvent(SPEECH_EVENT_NAME, { detail: id }));
    isSpeakingRef.current = true;
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const isDisabled = disabled || text.trim() === "";

  return (
    <>
      <button
        type="button"
        className={[
          "speech-button",
          isSpeaking ? "speech-button-active" : "",
          className ?? "",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={handleClick}
        disabled={isDisabled}
        aria-pressed={isSpeaking}
        title={title ?? "英語音声を読み上げます"}
      >
        {isSpeaking ? activeLabel : label}
      </button>
      <style jsx>{`
        .speech-button {
          min-height: 34px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(34, 211, 238, 0.28);
          border-radius: 999px;
          background: rgba(34, 211, 238, 0.1);
          color: #a5f3fc;
          padding: 0 12px;
          font: inherit;
          font-size: 12px;
          font-weight: 1000;
          line-height: 1.2;
          white-space: nowrap;
          cursor: pointer;
          transition:
            transform 0.15s ease,
            border-color 0.15s ease,
            background 0.15s ease,
            color 0.15s ease,
            opacity 0.15s ease;
        }

        .speech-button:hover:not(:disabled),
        .speech-button-active {
          transform: translateY(-1px);
          border-color: rgba(250, 204, 21, 0.58);
          background: rgba(250, 204, 21, 0.14);
          color: #fde68a;
        }

        .speech-button:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }
      `}</style>
    </>
  );
}
