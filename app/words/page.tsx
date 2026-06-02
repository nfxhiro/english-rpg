"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import PageTopBar from "../components/PageTopBar";
import {
  getStoredFuriganaEnabled,
  setStoredFuriganaEnabled,
  subscribeToFuriganaEnabledChange,
} from "../../data/preferences";
import SpeechButton from "../components/SpeechButton";

const ALL_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

type WordbookWord = {
  no: string;
  word: string;
  meaning: string;
  type: string;
  level: string;
  example: string;
  exampleMeaning: string;
  reading: string | null;
};

function getFilteredWords(
  words: WordbookWord[],
  searchText: string,
  levelFilter: string
) {
  const keyword = searchText.trim().toLowerCase();
  return words.filter((word) => {
    const matchesSearch =
      keyword === "" ||
      word.word.toLowerCase().includes(keyword) ||
      word.meaning.includes(searchText);
    const matchesLevel = levelFilter === "all" || word.level === levelFilter;
    return matchesSearch && matchesLevel;
  });
}

export default function WordsPage() {
  const [words, setWords] = useState<WordbookWord[]>([]);
  const [isLoadingWords, setIsLoadingWords] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [activeLetter, setActiveLetter] = useState("A");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionBlurTimeoutRef = useRef<number | null>(null);
  const furiganaEnabled = useSyncExternalStore(
    subscribeToFuriganaEnabledChange,
    getStoredFuriganaEnabled,
    () => false
  );

  useEffect(() => {
    let isMounted = true;

    async function loadWords() {
      try {
        const response = await fetch("/api/words");
        if (!response.ok) throw new Error("Failed to load words");
        const data = (await response.json()) as { words?: WordbookWord[] };
        if (!isMounted) return;
        setWords(Array.isArray(data.words) ? data.words : []);
        setLoadError(null);
      } catch {
        if (!isMounted) return;
        setLoadError("Failed to load word data.");
      } finally {
        if (isMounted) setIsLoadingWords(false);
      }
    }

    loadWords();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredWords = useMemo(
    () => getFilteredWords(words, searchText, "all"),
    [words, searchText]
  );

  const suggestions = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    if (!keyword) return [];
    return words
      .filter((w) => w.word.toLowerCase().includes(keyword))
      .sort((a, b) => {
        const aStarts = a.word.toLowerCase().startsWith(keyword);
        const bStarts = b.word.toLowerCase().startsWith(keyword);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return a.word.localeCompare(b.word);
      })
      .slice(0, 8);
  }, [words, searchText]);

  const dictGroups = useMemo(() => {
    const sorted = [...filteredWords].sort((a, b) =>
      a.word.toLowerCase().localeCompare(b.word.toLowerCase())
    );
    const groups = new Map<string, WordbookWord[]>();
    for (const word of sorted) {
      const first = word.word[0]?.toUpperCase() ?? "#";
      const key = /^[A-Z]$/.test(first) ? first : "#";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(word);
    }
    return groups;
  }, [filteredWords]);

  const hasSearchKeyword = searchText.trim().length > 0;
  const firstVisibleLetter = useMemo(() => {
    return Array.from(dictGroups.keys()).sort()[0] ?? "A";
  }, [dictGroups]);

  const currentDictLetter =
    !hasSearchKeyword && dictGroups.has(activeLetter)
      ? activeLetter
      : firstVisibleLetter;

  const displayedDictEntries = useMemo(() => {
    const sortedEntries = Array.from(dictGroups.entries()).sort(([a], [b]) =>
      a.localeCompare(b)
    );

    if (hasSearchKeyword) return sortedEntries;

    const words = dictGroups.get(currentDictLetter);
    return words ? [[currentDictLetter, words] as [string, WordbookWord[]]] : [];
  }, [currentDictLetter, dictGroups, hasSearchKeyword]);

  const handleSearchChange = (value: string) => {
    setSearchText(value);
  };

  const handleSuggestionSelect = (word: WordbookWord) => {
    handleSearchChange(word.word);
    setShowSuggestions(false);
    if (suggestionBlurTimeoutRef.current !== null) {
      window.clearTimeout(suggestionBlurTimeoutRef.current);
      suggestionBlurTimeoutRef.current = null;
    }
    const first = word.word[0]?.toUpperCase() ?? "A";
    setActiveLetter(/^[A-Z]$/.test(first) ? first : "A");
  };

  const handleSearchBlur = () => {
    suggestionBlurTimeoutRef.current = window.setTimeout(() => {
      setShowSuggestions(false);
      suggestionBlurTimeoutRef.current = null;
    }, 150);
  };

  const toggleFurigana = () => {
    setStoredFuriganaEnabled(!furiganaEnabled);
  };

  return (
    <main className="eq-page wordbook-page">
      <div className="eq-bg-orb eq-bg-orb-one" />
      <div className="eq-bg-orb eq-bg-orb-two" />
      <div className="eq-bg-orb eq-bg-orb-three" />

      <section className="eq-shell">
        <PageTopBar>
          <button
            type="button"
            className={`wordbook-furigana-toggle${
              furiganaEnabled ? " is-on" : ""
            }`}
            onClick={toggleFurigana}
            aria-pressed={furiganaEnabled}
          >
            ふりがな {furiganaEnabled ? "ON" : "OFF"}
          </button>
        </PageTopBar>

        <div className="eq-hero">
          <div className="eq-hero-copy">
            <div className="eq-eyebrow">
              <span>📖</span>
              <span>WORD BOOK</span>
            </div>

            <h1 className="eq-page-title">単語帳</h1>

            <p className="eq-lead">
              英単語・熟語を意味と例文でいつでも確認できます。
              レベルや範囲を絞って効率よく学習しましょう。
            </p>

            <div className="wordbook-stats-row">
              <span className="wordbook-stat-item">
                <em>収録語数</em>
                <strong>{isLoadingWords ? "..." : words.length}</strong>
              </span>
              <span className="wordbook-stat-item">
                <em>表示中</em>
                <strong>{filteredWords.length}</strong>
              </span>
            </div>
          </div>

          <div className="wordbook-stage">
            <div className="eq-display-card wordbook-display-card">
              <div className="eq-display-shine" />
              <div className="eq-display-icon eq-display-image-frame">
                <Image
                  src="/home-icons/written.png"
                  alt=""
                  width={1254}
                  height={1254}
                  className="eq-display-image"
                  sizes="156px"
                  aria-hidden="true"
                />
              </div>
              <div className="wordbook-card-runes" aria-hidden="true">
                <span>A</span>
                <span>B</span>
                <span>C</span>
                <span>D</span>
                <span>E</span>
              </div>
              <p>WORD BOOK</p>
              <h2>{isLoadingWords ? "..." : words.length}</h2>
              <span>words ready</span>
            </div>
          </div>
        </div>

        <div className="words-search-outer">
          <div className="eq-panel words-filter-panel">
            <div className="words-search-wrap">
              <span className="words-search-icon">🔎</span>
              <input
                type="text"
                value={searchText}
                onChange={(event) => { handleSearchChange(event.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={handleSearchBlur}
                placeholder="英単語・意味・例文で検索"
                className="wordbook-search"
              />
            </div>
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <div className="search-suggestions-list">
              {suggestions.map((word) => (
                <div
                  key={word.no}
                  onMouseDown={() => handleSuggestionSelect(word)}
                  className="search-suggestion-item"
                >
                  <span className="suggestion-word">{word.word}</span>
                  <span className="suggestion-meaning">{word.meaning}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {isLoadingWords ? (
          <div className="eq-panel words-empty">
            <div>...</div>
            <h2>Loading words...</h2>
            <p>Preparing the word book data.</p>
          </div>
        ) : loadError ? (
          <div className="eq-panel words-empty">
            <div>!</div>
            <h2>Could not load words</h2>
            <p>{loadError}</p>
          </div>
        ) : filteredWords.length === 0 ? (
          <div className="eq-panel words-empty">
            <div>🔍</div>
            <h2>該当する単語がありません</h2>
            <p>検索条件を変えて、もう一度試してください。</p>
          </div>
        ) : (
          <>
            <nav className="dict-index-bar" aria-label="アルファベット索引">
              {ALL_LETTERS.map((letter) => {
                const hasLetter = dictGroups.has(letter);
                return hasLetter ? (
                  <button
                    key={letter}
                    type="button"
                    className={`dict-index-btn${currentDictLetter === letter ? " is-active" : ""}`}
                    onClick={() => setActiveLetter(letter)}
                  >
                    {letter}
                  </button>
                ) : (
                  <span key={letter} className="dict-index-btn is-empty" aria-hidden="true">
                    {letter}
                  </span>
                );
              })}
            </nav>

            <div className="dict-sections">
              {displayedDictEntries.map(([letter, words]) => (
                  <section className="dict-group" key={letter}>
                    <div className="dict-letter-head">
                      <span>{letter}</span>
                      <small>{words.length}語</small>
                    </div>
                    <div className="dict-words-grid">
                      {words.map((word, index) => {
                        const reading = word.reading;
                        return (
                          <article key={`${word.word}-${index}`} className="words-card">
                            <div className="words-card-top">
                              <div className="words-word-area">
                                <div className="words-word-title">
                                  <h2>{word.word}</h2>
                                  <SpeechButton
                                    text={word.word}
                                    label="単語を聞く"
                                    title={`${word.word} を読み上げる`}
                                  />
                                </div>
                                <p className="words-meaning">{word.meaning}</p>
                                {furiganaEnabled && reading && (
                                  <p className="words-reading">({reading})</p>
                                )}
                              </div>
                              <div className="words-badges">
                                <span>{word.level}</span>
                                <span>{word.type}</span>
                              </div>
                            </div>
                            <div className="words-example">
                              <div className="words-example-head">
                                <span>例文</span>
                                <SpeechButton
                                  text={word.example}
                                  label="例文を聞く"
                                  title="例文を読み上げる"
                                />
                              </div>
                              <p className="words-example-en">{word.example}</p>
                              <p className="words-example-ja">{word.exampleMeaning}</p>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </section>
              ))}
            </div>
          </>
        )}
      </section>

      <style jsx>{`
        .wordbook-furigana-toggle {
          min-height: 36px;
          border: 1px solid rgba(45, 212, 191, 0.3);
          border-radius: 999px;
          background: rgba(20, 184, 166, 0.08);
          color: #99f6e4;
          padding: 0 14px;
          font: inherit;
          font-size: 13px;
          font-weight: 1000;
          cursor: pointer;
          transition:
            border-color 0.16s ease,
            background 0.16s ease,
            color 0.16s ease;
        }

        .wordbook-furigana-toggle.is-on {
          border-color: rgba(250, 204, 21, 0.55);
          background: rgba(250, 204, 21, 0.12);
          color: #fde68a;
        }

        .wordbook-stage {
          display: flex;
          justify-content: center;
        }

        .wordbook-display-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          height: auto;
          padding-bottom: 28px;
        }

        .wordbook-display-card .eq-display-image-frame {
          width: 156px;
          height: 156px;
          margin-top: 42px;
        }

        .wordbook-card-runes {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: repeat(5, 28px);
          gap: 8px;
          margin-top: 14px;
        }

        .wordbook-card-runes span {
          width: 28px;
          height: 28px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(253, 230, 138, 0.32);
          border-radius: 10px;
          background: rgba(250, 204, 21, 0.08);
          color: #fef3c7;
          font-size: 12px;
          font-weight: 1000;
          box-shadow: inset 0 0 14px rgba(45, 212, 191, 0.08);
        }

        .eq-display-card p,
        .eq-display-card h2,
        .eq-display-card > span {
          position: relative;
          z-index: 2;
          text-align: center;
        }

        .eq-display-card p {
          margin: 18px 0 0;
          color: #fde68a;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.18em;
        }

        .eq-display-card h2 {
          margin: 8px 0 0;
          font-size: 26px;
          font-weight: 900;
        }

        .eq-display-card > span {
          display: block;
          margin: 6px auto 0;
          max-width: 220px;
          color: #94a3b8;
          font-size: 13px;
          font-weight: 900;
        }

        .words-filter-panel {
          display: grid;
          gap: 18px;
          margin-top: 24px;
          overflow: visible;
        }

        .words-search-wrap {
          position: relative;
        }

        .words-search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          opacity: 0.72;
          font-size: 15px;
          pointer-events: none;
        }

        .search-suggestions {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          right: 0;
          z-index: 100;
          padding: 4px;
          background: rgba(10, 18, 36, 0.97);
          border: 1px solid rgba(45, 212, 191, 0.32);
          border-radius: 12px;
          box-shadow: 0 8px 28px rgba(0, 0, 0, 0.48);
        }

        .words-search-outer {
          position: relative;
        }

        .search-suggestions-list {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          right: 0;
          z-index: 200;
          padding: 4px;
          background: rgba(10, 18, 36, 0.97);
          border: 1px solid rgba(45, 212, 191, 0.32);
          border-radius: 12px;
          box-shadow: 0 8px 28px rgba(0, 0, 0, 0.48);
          max-height: 280px;
          overflow-y: auto;
        }

        .search-suggestion-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.12s ease;
        }

        .search-suggestion-item:hover {
          background: rgba(45, 212, 191, 0.12);
        }

        .search-suggestion-item .suggestion-word {
          font-weight: 700;
          color: #e2e8f0;
          font-size: 14px;
          min-width: 110px;
          flex-shrink: 0;
        }

        .search-suggestion-item .suggestion-meaning {
          color: #94a3b8;
          font-size: 12px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .wordbook-stats-row {
          display: flex;
          gap: 16px;
          margin-top: 18px;
        }

        .wordbook-stat-item {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          padding: 5px 12px;
        }

        .wordbook-stat-item em {
          font-style: normal;
          font-size: 11px;
          color: #94a3b8;
        }

        .wordbook-stat-item strong {
          font-size: 14px;
          font-weight: 800;
          color: #e2e8f0;
        }

        .dict-index-bar {
          position: sticky;
          top: 0;
          z-index: 10;
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          padding: 10px 14px;
          margin-top: 18px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          background: rgba(8, 12, 22, 0.88);
          backdrop-filter: blur(14px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.32);
        }

        .dict-index-btn {
          width: 32px;
          height: 32px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
          border: 1px solid rgba(45, 212, 191, 0.32);
          background: rgba(20, 184, 166, 0.08);
          color: #99f6e4;
          font-size: 13px;
          font-weight: 1000;
          text-decoration: none;
          cursor: pointer;
          transition:
            transform 0.13s ease,
            background 0.13s ease,
            border-color 0.13s ease;
        }

        .dict-index-btn:hover {
          transform: translateY(-2px);
          background: rgba(45, 212, 191, 0.2);
          border-color: rgba(45, 212, 191, 0.6);
        }

        .dict-index-btn.is-active {
          background: rgba(45, 212, 191, 0.45) !important;
          border: 2px solid rgba(45, 212, 191, 1) !important;
          color: #ffffff !important;
          box-shadow: 0 0 16px rgba(45, 212, 191, 0.55), inset 0 0 6px rgba(45, 212, 191, 0.2) !important;
          transform: translateY(-2px) !important;
        }

        .dict-index-btn.is-empty {
          border-color: rgba(255, 255, 255, 0.06);
          background: transparent;
          color: rgba(255, 255, 255, 0.16);
          cursor: default;
        }

        .dict-sections {
          margin-top: 22px;
          display: grid;
          gap: 32px;
        }

        .dict-group {
          scroll-margin-top: 72px;
          content-visibility: auto;
          contain-intrinsic-size: 520px;
        }

        .dict-letter-head {
          display: flex;
          align-items: baseline;
          gap: 10px;
          padding-bottom: 10px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          margin-bottom: 14px;
        }

        .dict-letter-head > span {
          font-size: 38px;
          font-weight: 1000;
          line-height: 1;
          color: #fef3c7;
        }

        .dict-letter-head small {
          color: #64748b;
          font-size: 12px;
          font-weight: 900;
        }

        .dict-words-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .words-card {
          min-width: 0;
          content-visibility: auto;
          contain-intrinsic-size: 250px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 18px;
          background: rgba(15, 23, 42, 0.74);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.22);
          transition:
            transform 0.18s ease,
            background 0.18s ease;
        }

        .words-card:hover {
          transform: translateY(-4px);
          background: rgba(255, 255, 255, 0.075);
        }

        .words-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 14px;
        }

        .words-word-area {
          flex: 1 1 260px;
          min-width: 0;
        }

        .words-word-title {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .words-word-area h2 {
          margin: 0;
          font-size: 30px;
          line-height: 1.1;
          font-weight: 1000;
          letter-spacing: 0;
          word-break: break-word;
        }

        .words-word-area .words-meaning {
          margin: 8px 0 0;
          color: #fde68a;
          font-size: 18px;
          line-height: 1.35;
          font-weight: 1000;
        }

        .words-word-area .words-reading {
          margin: 4px 0 0;
          color: #6ee7b7;
          font-size: 13px;
          line-height: 1.5;
          font-weight: 900;
        }

        .words-badges {
          flex: 1 1 150px;
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-end;
          align-content: flex-start;
          gap: 8px;
        }

        .words-badges span {
          max-width: 100%;
          min-height: 30px;
          display: inline-flex;
          align-items: center;
          border-radius: 999px;
          padding: 0 10px;
          border: 1px solid rgba(34, 211, 238, 0.32);
          background: rgba(34, 211, 238, 0.1);
          color: #a5f3fc;
          font-size: 11px;
          font-weight: 1000;
          white-space: normal;
          line-height: 1.25;
        }

        .words-example {
          margin-top: 14px;
          border-radius: 18px;
          padding: 14px;
          background: rgba(2, 6, 23, 0.52);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .words-example-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 8px;
        }

        .words-example-head span {
          color: #94a3b8;
          font-size: 11px;
          font-weight: 900;
        }

        .words-example-en {
          margin: 0;
          color: white;
          font-size: 15px;
          line-height: 1.6;
          font-weight: 900;
        }

        .words-example-ja {
          margin: 6px 0 0;
          color: #cbd5e1;
          font-size: 14px;
          line-height: 1.6;
          font-weight: 700;
        }

        .words-empty {
          min-height: 300px;
          margin-top: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          text-align: center;
        }

        .words-empty div {
          font-size: 72px;
        }

        .words-empty h2 {
          margin: 18px 0 0;
          font-size: 26px;
          font-weight: 1000;
        }

        .words-empty p {
          margin: 10px 0 0;
          color: #94a3b8;
          font-size: 14px;
          font-weight: 800;
        }

        @media (prefers-reduced-motion: reduce) {
          .words-card,
          .dict-index-btn {
            transition: none !important;
          }
        }

        @media (max-width: 960px) {
          .dict-words-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 720px) {
          .eq-topbar {
            margin-bottom: 10px !important;
            padding: 6px 8px !important;
          }

          .wordbook-furigana-toggle {
            min-height: 34px;
            padding: 0 11px;
            font-size: 12px;
          }

          .eq-hero {
            grid-template-columns: 1fr;
            gap: 12px;
            padding: 16px !important;
          }

          .eq-page-title {
            margin-top: 12px;
            font-size: 30px !important;
            line-height: 1.12 !important;
          }

          .eq-lead {
            margin-top: 10px;
            font-size: 13px;
            line-height: 1.55;
            overflow-wrap: anywhere;
          }

          .wordbook-stage {
            display: none;
          }

          .eq-status-strip {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
            gap: 8px;
          }

          .eq-status-card {
            min-height: 0;
            padding: 10px 8px !important;
            border-radius: 14px !important;
          }

          .eq-status-card span {
            font-size: 10px;
          }

          .eq-status-card strong {
            margin-top: 4px;
            font-size: 20px;
          }

          .words-filter-panel {
            gap: 12px;
            margin-top: 12px;
            padding: 14px;
          }

          .wordbook-search {
            min-height: 44px;
            border-radius: 14px;
            font-size: 13px;
          }

          .words-filter-head {
            gap: 8px;
          }

          .words-filter-head strong {
            font-size: 11px;
          }

          .words-level-tabs {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 7px;
          }

          .words-kind-tabs {
            grid-template-columns: 1fr;
            gap: 7px;
          }

          .wordbook-level-tab,
          .wordbook-kind-chip {
            min-height: 40px;
            border-radius: 13px;
            font-size: 12px;
          }

          .dict-words-grid {
            gap: 10px;
          }

          .dict-letter-head > span {
            font-size: 30px;
          }

          .words-card {
            border-radius: 18px !important;
            padding: 12px !important;
          }

          .words-card-top {
            flex-direction: column;
            gap: 8px;
          }

          .words-word-area {
            flex: none;
            width: 100%;
          }

          .words-badges {
            flex: none;
            justify-content: flex-start;
            gap: 6px;
          }

          .words-badges span {
            min-height: 24px;
            padding: 0 8px;
            font-size: 10px;
          }

          .words-word-area h2 {
            font-size: 22px;
          }

          .words-word-area .words-meaning {
            margin-top: 4px;
            font-size: 15px;
          }

          .words-word-area .words-reading {
            margin-top: 2px;
            font-size: 12px;
            line-height: 1.35;
          }

          .words-example {
            margin-top: 10px;
            border-radius: 14px;
            padding: 10px;
          }

          .words-example-head {
            align-items: flex-start;
            flex-direction: column;
            gap: 6px;
            margin-bottom: 6px;
          }

          .words-example-en {
            font-size: 14px;
            line-height: 1.45;
          }

          .words-example-ja {
            margin-top: 4px;
            font-size: 13px;
            line-height: 1.45;
          }

          .words-more-area {
            margin: 14px 0 0;
          }

          .words-more-button {
            min-width: 0;
            min-height: 48px;
          }
        }

      `}</style>
    </main>
  );
}
