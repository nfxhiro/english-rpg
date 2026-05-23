"use client";

import Image from "next/image";

export default function AppLoading({
  title = "読み込み中...",
  message = "冒険データを確認しています。",
  icon = "✨",
  iconSrc,
  iconWidth = 256,
  iconHeight = 256,
}: {
  title?: string;
  message?: string;
  icon?: string;
  iconSrc?: string;
  iconWidth?: number;
  iconHeight?: number;
}) {
  return (
    <main className="app-loading-page">
      <div className="loading-orb loading-orb-one" />
      <div className="loading-orb loading-orb-two" />
      <div className="loading-orb loading-orb-three" />

      <section className="loading-shell">
        <div className="loading-card">
          <div className="loading-icon">
            {iconSrc ? (
              <Image
                src={iconSrc}
                alt=""
                width={iconWidth}
                height={iconHeight}
                className="loading-icon-image"
                sizes="96px"
                aria-hidden="true"
                unoptimized
              />
            ) : (
              icon
            )}
          </div>
          <h1>{title}</h1>
          <p>{message}</p>
        </div>
      </section>

      <style jsx>{`
        .app-loading-page {
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
          background:
            radial-gradient(
              circle at 18% 8%,
              rgba(34, 211, 238, 0.2),
              transparent 28%
            ),
            radial-gradient(
              circle at 88% 12%,
              rgba(168, 85, 247, 0.24),
              transparent 30%
            ),
            radial-gradient(
              circle at 50% 100%,
              rgba(251, 191, 36, 0.13),
              transparent 32%
            ),
            #050816;
          color: white;
          padding: 28px;
        }

        .loading-orb {
          position: fixed;
          border-radius: 999px;
          filter: blur(70px);
          pointer-events: none;
          opacity: 0.85;
        }

        .loading-orb-one {
          width: 300px;
          height: 300px;
          background: rgba(34, 211, 238, 0.18);
          top: -120px;
          left: -100px;
        }

        .loading-orb-two {
          width: 380px;
          height: 380px;
          background: rgba(168, 85, 247, 0.2);
          top: 40px;
          right: -140px;
        }

        .loading-orb-three {
          width: 340px;
          height: 340px;
          background: rgba(251, 191, 36, 0.12);
          bottom: -150px;
          left: 35%;
        }

        .loading-shell {
          position: relative;
          z-index: 1;
          max-width: 900px;
          min-height: calc(100vh - 56px);
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .loading-card {
          width: 100%;
          min-height: 420px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          text-align: center;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 38px;
          background: rgba(15, 23, 42, 0.78);
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.32);
        }

        .loading-icon {
          width: 96px;
          height: 96px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 78px;
          animation: loadingFloat 0.9s ease-in-out infinite alternate;
          filter: drop-shadow(0 18px 28px rgba(0, 0, 0, 0.42));
        }

        .loading-icon-image {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .loading-card h1 {
          margin: 22px 0 0;
          font-size: 36px;
          font-weight: 1000;
          letter-spacing: 0;
          line-height: 1.18;
          overflow-wrap: anywhere;
        }

        .loading-card p {
          margin: 12px 0 0;
          color: #94a3b8;
          font-size: 15px;
          font-weight: 800;
          line-height: 1.6;
          overflow-wrap: anywhere;
        }

        @keyframes loadingFloat {
          from {
            transform: translateY(0);
          }

          to {
            transform: translateY(-10px);
          }
        }

        @media (max-width: 680px) {
          .app-loading-page {
            padding: 18px;
          }

          .loading-card {
            min-height: 360px;
            border-radius: 28px;
            padding: 22px;
          }

          .loading-card h1 {
            font-size: 28px;
          }
        }
      `}</style>
    </main>
  );
}
