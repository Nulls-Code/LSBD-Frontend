import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Coming Soon | LOGISTIC STAR BD LTD.",
  description:
    "We're busy building something great. Check back soon for this page.",
};

export default function NotFound() {
  return (
    <div className="nf-shell">
      <style>{`
        /* ── Not-found page — scoped to .nf-shell ── */
        .nf-shell {
          position: fixed;
          inset: 0;
          background-color: #08254a;
          color: #ffffff;
          font-family: var(--font-plus-jakarta), 'Plus Jakarta Sans', -apple-system, sans-serif;
          -webkit-font-smoothing: antialiased;
          overflow: hidden;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          text-align: center;
        }

        /* ── Background mesh ── */
        .nf-mesh {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 20% -10%, rgba(7,148,71,0.18) 0%, transparent 60%),
            radial-gradient(ellipse 70% 50% at 85% 110%, rgba(53,93,165,0.22) 0%, transparent 55%),
            radial-gradient(ellipse 50% 40% at 50% 50%, rgba(255,255,255,0.03) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        /* ── Animated orbit rings ── */
        .nf-orbit-wrapper {
          position: relative;
          width: 280px;
          height: 280px;
          margin-bottom: 3rem;
          flex-shrink: 0;
        }

        .nf-orbit-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 1.5px solid rgba(7,148,71,0.25);
          animation: nf-spin linear infinite;
        }
        .nf-orbit-ring:nth-child(1) { animation-duration: 14s; }
        .nf-orbit-ring:nth-child(2) {
          inset: 24px;
          border-color: rgba(53,93,165,0.30);
          animation-duration: 10s;
          animation-direction: reverse;
        }
        .nf-orbit-ring:nth-child(3) {
          inset: 52px;
          border-color: rgba(7,148,71,0.20);
          animation-duration: 18s;
        }

        /* Dot on each ring */
        .nf-orbit-ring::before {
          content: '';
          position: absolute;
          top: -4px;
          left: calc(50% - 4px);
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #079447;
          box-shadow: 0 0 10px 3px rgba(7,148,71,0.6);
        }
        .nf-orbit-ring:nth-child(2)::before {
          background: #355da5;
          box-shadow: 0 0 10px 3px rgba(53,93,165,0.7);
        }
        .nf-orbit-ring:nth-child(3)::before {
          width: 6px;
          height: 6px;
          top: -3px;
          left: calc(50% - 3px);
        }

        @keyframes nf-spin {
          to { transform: rotate(360deg); }
        }

        /* Plane icon in center */
        .nf-plane-center {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nf-plane-icon {
          width: 72px;
          height: 72px;
          background: linear-gradient(135deg, #079447 0%, #355da5 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow:
            0 0 0 12px rgba(7,148,71,0.08),
            0 0 0 24px rgba(7,148,71,0.04),
            0 12px 40px rgba(7,148,71,0.35);
          animation: nf-pulse-glow 3s ease-in-out infinite;
        }

        @keyframes nf-pulse-glow {
          0%, 100% { box-shadow: 0 0 0 12px rgba(7,148,71,0.08), 0 0 0 24px rgba(7,148,71,0.04), 0 12px 40px rgba(7,148,71,0.35); }
          50%       { box-shadow: 0 0 0 16px rgba(7,148,71,0.13), 0 0 0 32px rgba(7,148,71,0.07), 0 16px 56px rgba(7,148,71,0.50); }
        }

        .nf-plane-icon svg {
          width: 36px;
          height: 36px;
          fill: #ffffff;
          animation: nf-fly 2.8s ease-in-out infinite;
        }

        @keyframes nf-fly {
          0%, 100% { transform: translateX(-2px) translateY(2px) rotate(-10deg); }
          50%       { transform: translateX(2px)  translateY(-2px) rotate(-5deg); }
        }

        /* ── Content ── */
        .nf-content { position: relative; z-index: 1; max-width: 640px; }

        .nf-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(7,148,71,0.15);
          border: 1px solid rgba(7,148,71,0.35);
          color: #4dda7e;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 6px 14px;
          border-radius: 999px;
          margin-bottom: 1.5rem;
        }

        .nf-badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #079447;
          animation: nf-blink 1.4s ease-in-out infinite;
        }

        @keyframes nf-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }

        .nf-content h1 {
          font-size: clamp(2rem, 6vw, 3.2rem);
          font-weight: 800;
          line-height: 1.15;
          margin-bottom: 1.25rem;
          background: linear-gradient(135deg, #ffffff 30%, #a8c5e8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .nf-content h1 span {
          -webkit-text-fill-color: transparent;
          background: linear-gradient(90deg, #079447, #4dda7e);
          -webkit-background-clip: text;
          background-clip: text;
        }

        .nf-sub {
          font-size: clamp(1rem, 2.5vw, 1.125rem);
          font-weight: 400;
          color: rgba(255,255,255,0.6);
          line-height: 1.75;
          margin-bottom: 2.5rem;
          max-width: 480px;
          margin-inline: auto;
        }

        /* ── Progress bar ── */
        .nf-progress-wrap {
          margin-bottom: 2.5rem;
        }

        .nf-progress-label {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          font-weight: 600;
          color: rgba(255,255,255,0.45);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .nf-progress-track {
          height: 6px;
          background: rgba(255,255,255,0.08);
          border-radius: 999px;
          overflow: hidden;
        }

        .nf-progress-fill {
          height: 100%;
          width: 65%;
          background: linear-gradient(90deg, #079447, #355da5, #4dda7e);
          background-size: 200% 100%;
          border-radius: 999px;
          animation: nf-shimmer 2.5s linear infinite;
        }

        @keyframes nf-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* ── Buttons ── */
        .nf-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .nf-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #079447 0%, #05712f 100%);
          color: #ffffff;
          font-size: 0.9375rem;
          font-weight: 700;
          padding: 13px 28px;
          border-radius: 10px;
          text-decoration: none;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          box-shadow: 0 6px 24px rgba(7,148,71,0.35);
        }

        .nf-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 32px rgba(7,148,71,0.5);
        }

        .nf-btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.06);
          border: 1.5px solid rgba(255,255,255,0.14);
          color: rgba(255,255,255,0.8);
          font-size: 0.9375rem;
          font-weight: 600;
          padding: 13px 28px;
          border-radius: 10px;
          text-decoration: none;
          transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease;
          backdrop-filter: blur(8px);
        }

        .nf-btn-secondary:hover {
          transform: translateY(-2px);
          background: rgba(255,255,255,0.10);
          border-color: rgba(255,255,255,0.25);
        }

        /* ── Footer strip ── */
        .nf-footer {
          position: relative;
          z-index: 1;
          margin-top: 4rem;
          font-size: 0.8rem;
          color: rgba(255,255,255,0.25);
          letter-spacing: 0.05em;
        }

        .nf-footer strong {
          color: rgba(255,255,255,0.45);
        }

        /* ── Floating particles ── */
        .nf-particles {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
          z-index: 0;
        }

        .nf-particle {
          position: absolute;
          border-radius: 50%;
          opacity: 0;
          animation: nf-float-up linear infinite;
        }

        @keyframes nf-float-up {
          0%   { transform: translateY(0) scale(1);   opacity: 0; }
          10%  { opacity: 0.6; }
          90%  { opacity: 0.3; }
          100% { transform: translateY(-110vh) scale(0.5); opacity: 0; }
        }
      `}</style>

      {/* Radial mesh background */}
      <div className="nf-mesh" />

      {/* Floating particles */}
      <div className="nf-particles" aria-hidden="true">
        {[
          { left: "12%",  size: 4,  delay: 0,   dur: 12, color: "#079447" },
          { left: "28%",  size: 3,  delay: 2.5, dur: 15, color: "#355da5" },
          { left: "47%",  size: 5,  delay: 1,   dur: 11, color: "#079447" },
          { left: "63%",  size: 3,  delay: 4,   dur: 14, color: "#4dda7e" },
          { left: "78%",  size: 4,  delay: 1.5, dur: 13, color: "#355da5" },
          { left: "89%",  size: 2,  delay: 3,   dur: 16, color: "#079447" },
        ].map((p, i) => (
          <span
            key={i}
            className="nf-particle"
            style={{
              left: p.left,
              bottom: "-10px",
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: p.color,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.dur}s`,
            }}
          />
        ))}
      </div>

      {/* Orbit animation */}
      <div className="nf-orbit-wrapper" aria-hidden="true">
        <div className="nf-orbit-ring" />
        <div className="nf-orbit-ring" />
        <div className="nf-orbit-ring" />
        <div className="nf-plane-center">
          <div className="nf-plane-icon">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9L2 14v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Text content */}
      <div className="nf-content">
        <div className="nf-badge">
          <span className="nf-badge-dot" />
          In Active Development
        </div>

        <h1>
          We&rsquo;re Crafting<br />
          <span>Something Remarkable</span>
        </h1>

        <p className="nf-sub">
          Our team is working hard to bring this section of
          Logistic Star BD online. The global network is expanding —
          this destination is on our route map.
        </p>

        {/* Build progress */}
        <div className="nf-progress-wrap">
          <div className="nf-progress-label">
            <span>Build Progress</span>
            <span>65%</span>
          </div>
          <div className="nf-progress-track">
            <div className="nf-progress-fill" />
          </div>
        </div>

        {/* CTA buttons */}
        <div className="nf-actions">
          <Link href="/" className="nf-btn-primary" id="not-found-home-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Back to Home
          </Link>
          <Link href="/tracking" className="nf-btn-secondary" id="not-found-tracking-btn">
            Track a Shipment
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Footer strip */}
      <p className="nf-footer">
        <strong>LOGISTIC STAR BD LTD.</strong> &mdash; Global Air Freight &amp; Express Cargo
      </p>
    </div>

  );
}
