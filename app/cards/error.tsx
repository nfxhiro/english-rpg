"use client";

import Link from "next/link";

export default function CardsError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main
      style={{
        minHeight: "100svh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#020617",
        color: "#f8fafc",
        padding: "24px",
      }}
    >
      <div
        style={{
          maxWidth: "420px",
          width: "100%",
          borderRadius: "20px",
          border: "1px solid rgba(255,255,255,0.1)",
          background: "rgba(255,255,255,0.05)",
          padding: "32px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🃏</div>
        <h1 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "12px" }}>
          カード図鑑の読み込みに失敗しました
        </h1>
        <p
          style={{
            fontSize: "14px",
            color: "rgba(248,250,252,0.6)",
            marginBottom: "24px",
            lineHeight: "1.5",
          }}
        >
          データの読み込み中に問題が発生しました。
          <br />
          再読み込みするか、ホームに戻ってください。
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={reset}
            style={{
              borderRadius: "12px",
              background: "#f8fafc",
              color: "#0f172a",
              padding: "10px 20px",
              fontWeight: "bold",
              border: "none",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            再読み込み
          </button>
          <Link
            href="/"
            style={{
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.2)",
              padding: "10px 20px",
              fontWeight: "bold",
              color: "#f8fafc",
              textDecoration: "none",
              fontSize: "14px",
            }}
          >
            ホームへ戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
